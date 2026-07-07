// prerender-modules.js — build-time static HTML generation for Foundations modules
// Run before vite build: node scripts/prerender-gt.js && node scripts/prerender-modules.js && node scripts/prerender-companies.js && vite build
//
// Outputs:
//   public/modules/{moduleId}.html  — one per module with RUNNER_DATA teaching content
//   Appends module URLs into public/sitemap.xml (prerender-gt.js must run first — it writes
//   the base sitemap; this script inserts before </urlset> so re-running the full chain from
//   scratch is idempotent per build).
//
// Data extraction: src/data/foundationsRunnerData.js has ~25 relative imports across
// src/data/foundations/*, tracks/*, agents/*, playground/* — a plain vm-eval (like
// prerender-gt.js uses for standalone files) can't resolve that import graph. Instead we
// bundle it with the esbuild binary that ships transitively via vite (node_modules/.bin/esbuild)
// into a single self-contained ESM file, then dynamic-`import()` that. Titles/subtitles aren't
// in RUNNER_DATA — they live in the Concepts.jsx MODULES array, which also holds live JSX
// component references we can't safely eval. We extract just id/title/subtitle/tag/level via a
// bounded regex scan instead of a full parse (module entries are single- or multi-line object
// literals; the {0,400} gap bound keeps matches from spanning into a neighboring entry).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_MODULES = join(ROOT, "public", "modules");
const BASE_URL = process.env.SITE_BASE_URL || "https://genai-systems-lab-ivory.vercel.app";
const ACCENT = "#22D3EE"; // --gal-build, GSL's accent (matches GAL_ACCENT in App.jsx)

// ── 1. Bundle foundationsRunnerData.js so its ~25-file import graph resolves ─────────────────

const bundlePath = join(tmpdir(), `gsl-runner-bundle-${Date.now()}.mjs`);

// Use esbuild's JS API (same platform-binary resolution vite itself uses) instead of
// spawning node_modules/.bin/esbuild — the .bin shim can be platform-mismatched (ENOEXEC)
// while vite's own esbuild resolution is healthy.
let esbuild;
try {
  esbuild = await import("esbuild");
} catch (e) {
  console.error("prerender-modules: could not load esbuild's JS API. Try: npm rebuild esbuild  (or rm -rf node_modules && npm install).", e.message);
  process.exit(1);
}

await esbuild.build({
  entryPoints: [join(ROOT, "src", "data", "foundationsRunnerData.js")],
  bundle: true,
  format: "esm",
  outfile: bundlePath,
  logLevel: "warning",
});

const { RUNNER_DATA } = await import(`file://${bundlePath}`);

if (!RUNNER_DATA || typeof RUNNER_DATA !== "object") {
  console.error("prerender-modules: could not load RUNNER_DATA from the bundled foundationsRunnerData.js");
  process.exit(1);
}

// ── 2. Extract id → {title, subtitle, tag, level} from Concepts.jsx MODULES array ────────────

const conceptsSrc = readFileSync(join(ROOT, "src", "Concepts.jsx"), "utf8");
const MODULE_RE = /\{\s*id:\s*"([^"]+)"[\s\S]{0,400}?title:\s*"((?:[^"\\]|\\.)*)"[\s\S]{0,400}?subtitle:\s*"((?:[^"\\]|\\.)*)"/g;
const TAG_RE_WINDOW = 300;

const metaMap = {};
let m;
while ((m = MODULE_RE.exec(conceptsSrc))) {
  const [, id, title, subtitle] = m;
  if (metaMap[id]) continue; // first occurrence wins
  const windowText = conceptsSrc.slice(Math.max(0, m.index - 20), m.index + TAG_RE_WINDOW);
  const tagMatch = windowText.match(/tag:\s*"([^"]+)"/);
  const levelMatch = windowText.match(/level:\s*"([^"]+)"/);
  metaMap[id] = {
    title: title.replace(/\\"/g, '"'),
    subtitle: subtitle.replace(/\\"/g, '"'),
    tag: tagMatch ? tagMatch[1] : null,
    level: levelMatch ? levelMatch[1] : null,
  };
}

function titleCase(id) {
  return id.split(/[-_]/g).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// ── 3. Minimal markdown-ish inline renderer (mirrors the app's InlineMd: **bold**, *italic*, ==highlight==) ──

function esc(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inlineMd(str) {
  let s = esc(str);
  s = s.replace(/==(.+?)==/g, "<mark>$1</mark>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
  return s;
}

function proseToHtml(text) {
  if (!text || typeof text !== "string") return "";
  return text.split(/\n\n+/).map(p => `<p>${inlineMd(p.replace(/\n/g, "<br>"))}</p>`).join("\n");
}

function explanationItemToHtml(item) {
  if (typeof item === "string") return proseToHtml(item);
  if (item && item.type === "illustration") {
    return `<div class="illustration"><div class="illustration-label">${esc(item.label || "Illustration")}</div><pre>${esc(item.content || "")}</pre></div>`;
  }
  return "";
}

// ── 4. HTML template ──────────────────────────────────────────────────────────────────────────

function generateHtml(id, mod, meta) {
  const title = meta.title || titleCase(id);
  const subtitle = meta.subtitle || "";
  const pageUrl = `${BASE_URL}/modules/${id}`;
  const appUrl = `${BASE_URL}/#concepts`;
  const desc = subtitle || (mod.takeaway ? mod.takeaway.slice(0, 155) : title);

  const groundUpHtml = mod.groundUp
    ? `<section><h2>Start Here</h2>${proseToHtml(mod.groundUp)}</section>` : "";

  const explanationHtml = Array.isArray(mod.explanation) && mod.explanation.length
    ? `<section><h2>How It Works</h2>${mod.explanation.map(explanationItemToHtml).join("\n")}</section>` : "";

  const keyPointsHtml = Array.isArray(mod.keyPoints) && mod.keyPoints.length
    ? `<section><h2>Key Points</h2><ul>${mod.keyPoints.map(kp => `<li>${inlineMd(kp)}</li>`).join("")}</ul></section>` : "";

  const scenarioHtml = mod.scenario
    ? `<section><h2>In Production — Apply It</h2>${proseToHtml(mod.scenario)}</section>` : "";

  const takeawayHtml = mod.takeaway
    ? `<div class="callout"><div class="callout-label">Key Insight</div><p>${inlineMd(mod.takeaway)}</p></div>` : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: desc,
    author: { "@type": "Organization", name: "GenAI Systems Lab" },
    publisher: { "@type": "Organization", name: "GenAI Systems Lab" },
    mainEntityOfPage: pageUrl,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | GenAI Systems Lab</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${pageUrl}">

  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${esc(title)} | GenAI Systems Lab">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:site_name" content="GenAI Systems Lab">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">

  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; }
    body {
      background: #0c0a08; color: #e4e4e7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.7;
    }
    a { color: ${ACCENT}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .top-bar {
      background: #0f0d0b; border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .brand { font-size: 13px; font-weight: 700; font-family: "Courier New", monospace; color: rgba(255,255,255,0.6); letter-spacing: 0.05em; }
    .open-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px;
      font-size: 12px; font-weight: 700; background: ${ACCENT}18; border: 1px solid ${ACCENT}40; color: ${ACCENT}; white-space: nowrap;
    }
    .open-btn:hover { background: ${ACCENT}28; text-decoration: none; }
    .accent-bar { height: 3px; background: linear-gradient(90deg, transparent, ${ACCENT}cc 30%, ${ACCENT}cc 70%, transparent); }
    article { max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; }
    .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 20px; }
    .badge {
      font-size: 10px; font-family: "Courier New", monospace; font-weight: 700; padding: 3px 8px; border-radius: 4px;
      letter-spacing: 0.08em; text-transform: uppercase; background: ${ACCENT}18; border: 1px solid ${ACCENT}30; color: ${ACCENT};
    }
    h1 { font-size: clamp(22px, 4vw, 34px); font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.02em; }
    .desc { font-size: 15px; color: rgba(255,255,255,0.55); margin-bottom: 40px; line-height: 1.6; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    section { margin-bottom: 32px; }
    h2 { font-size: 20px; font-weight: 700; color: #fff; margin: 0 0 14px; }
    p { font-size: 15px; color: rgba(255,255,255,0.72); margin-bottom: 14px; }
    mark { background: ${ACCENT}22; color: #fff; padding: 0 2px; border-radius: 2px; }
    ul { padding-left: 20px; margin-bottom: 16px; }
    li { font-size: 15px; color: rgba(255,255,255,0.72); margin-bottom: 8px; }
    .illustration { background: #1a1612; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .illustration-label { font-size: 11px; font-weight: 700; color: ${ACCENT}; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
    pre { font-family: "Courier New", monospace; font-size: 12.5px; color: rgba(255,255,255,0.75); white-space: pre-wrap; overflow-x: auto; }
    .callout { background: ${ACCENT}0c; border-left: 3px solid ${ACCENT}; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 32px; }
    .callout-label { font-size: 11px; font-weight: 700; color: ${ACCENT}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
    .callout p { margin-bottom: 0; color: rgba(255,255,255,0.85); }
    .cta-card { margin-top: 40px; padding: 28px; border-radius: 16px; background: ${ACCENT}0c; border: 1px solid ${ACCENT}30; text-align: center; }
    .cta-card h2 { margin: 0 0 8px; font-size: 18px; color: #fff; }
    .cta-card p { margin-bottom: 20px; font-size: 13px; color: rgba(255,255,255,0.45); }
    .cta-card a { display: inline-block; padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; background: ${ACCENT}; color: #000; }
    .cta-card a:hover { opacity: 0.9; text-decoration: none; }
    footer { text-align: center; padding: 24px; font-size: 11px; font-family: "Courier New", monospace; color: rgba(255,255,255,0.2); border-top: 1px solid rgba(255,255,255,0.04); }
  </style>
</head>
<body>
  <div class="top-bar">
    <a href="${BASE_URL}" class="brand">GenAI Systems Lab</a>
    <a href="${appUrl}" class="open-btn">Open interactive version →</a>
  </div>
  <div class="accent-bar"></div>
  <article>
    <div class="meta">
      ${meta.tag ? `<span class="badge">${esc(meta.tag)}</span>` : ""}
      ${meta.level ? `<span class="badge">${esc(meta.level)}</span>` : ""}
    </div>
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p class="desc">${esc(subtitle)}</p>` : ""}

    ${groundUpHtml}
    ${explanationHtml}
    ${keyPointsHtml}
    ${scenarioHtml}
    ${takeawayHtml}

    <div class="cta-card">
      <h2>Try it interactively</h2>
      <p>GenAI Systems Lab is a free platform for AI engineers — configure real failure modes, break things, and build the judgment that gets you hired.</p>
      <a href="${appUrl}">Open GenAI Systems Lab →</a>
    </div>
  </article>
  <footer>genai-systems-lab-ivory.vercel.app · Free for AI engineers and PMs</footer>
</body>
</html>`;
}

// ── 5. Generate all pages ─────────────────────────────────────────────────────────────────────

mkdirSync(PUBLIC_MODULES, { recursive: true });

let generated = 0;
let skipped = 0;
let fallbackTitles = 0;
const urls = [];
const skippedIds = [];

for (const [id, mod] of Object.entries(RUNNER_DATA)) {
  if (!mod || typeof mod !== "object") { skipped++; skippedIds.push(id); continue; }
  const hasContent = mod.groundUp || (Array.isArray(mod.explanation) && mod.explanation.length) || mod.scenario;
  if (!hasContent) { skipped++; skippedIds.push(id); continue; }
  const meta = metaMap[id] || {};
  if (!metaMap[id]) fallbackTitles++;
  const html = generateHtml(id, mod, meta);
  writeFileSync(join(PUBLIC_MODULES, `${id}.html`), html, "utf8");
  urls.push(`${BASE_URL}/modules/${id}`);
  generated++;
}

// ── 6. Append into the existing sitemap.xml (prerender-gt.js runs first and owns the base file) ──

const sitemapPath = join(ROOT, "public", "sitemap.xml");
const today = new Date().toISOString().split("T")[0];
const moduleUrlEntries = urls.map(u =>
  `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
).join("\n");

if (existsSync(sitemapPath)) {
  const existing = readFileSync(sitemapPath, "utf8");
  const updated = existing.replace("</urlset>", `${moduleUrlEntries}\n</urlset>`);
  writeFileSync(sitemapPath, updated, "utf8");
} else {
  console.warn("prerender-modules: public/sitemap.xml not found — run prerender-gt.js first. Skipping sitemap append.");
}

console.log(`prerender-modules: ${generated} pages written, ${skipped} skipped (no content: ${skippedIds.join(", ") || "none"}), ${fallbackTitles} used a title-cased id fallback (no Concepts.jsx match), sitemap.xml appended`);
