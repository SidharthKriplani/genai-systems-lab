// prerender-companies.js — build-time static HTML generation for Company Tracks profiles
// Run before vite build: node scripts/prerender-gt.js && node scripts/prerender-modules.js && node scripts/prerender-companies.js && vite build
//
// Outputs:
//   public/companies/{companyId}.html  — one per company in COMPANY_PROFILES
//   Appends company URLs into public/sitemap.xml (must run after prerender-gt.js /
//   prerender-modules.js in the build chain — see package.json).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_COMPANIES = join(ROOT, "public", "companies");
const BASE_URL = process.env.SITE_BASE_URL || "https://genai-systems-lab-ivory.vercel.app";
const ACCENT = "#22D3EE";

const bundlePath = join(tmpdir(), `gsl-companytracks-bundle-${Date.now()}.mjs`);

// esbuild JS API instead of the .bin shim — see prerender-modules.js for why.
let esbuild;
try {
  esbuild = await import("esbuild");
} catch (e) {
  console.error("prerender-companies: could not load esbuild's JS API. Try: npm rebuild esbuild  (or rm -rf node_modules && npm install).", e.message);
  process.exit(1);
}

await esbuild.build({
  entryPoints: [join(ROOT, "src", "data", "companyTracks.js")],
  bundle: true,
  format: "esm",
  outfile: bundlePath,
  logLevel: "warning",
});

const { COMPANY_PROFILES, COMPANIES } = await import(`file://${bundlePath}`);

if (!COMPANY_PROFILES || typeof COMPANY_PROFILES !== "object") {
  console.error("prerender-companies: could not load COMPANY_PROFILES from the bundled companyTracks.js");
  process.exit(1);
}

function esc(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function processHtml(process) {
  if (!Array.isArray(process) || !process.length) return "";
  return `<section><h2>The Interview Loop</h2><ol>${process.map(p =>
    `<li><strong>${esc(p.round)}</strong> — ${esc(p.detail)}</li>`
  ).join("")}</ol></section>`;
}

function listHtml(heading, items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `<section><h2>${esc(heading)}</h2><ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></section>`;
}

function sourcesHtml(sources) {
  if (!Array.isArray(sources) || !sources.length) return "";
  return `<section><h2>Sources</h2><ul class="refs">${sources.map(s =>
    `<li><a href="${esc(s.url || "#")}" rel="noopener noreferrer nofollow" target="_blank">${esc(s.title || s.url || "")}</a></li>`
  ).join("")}</ul></section>`;
}

function generateHtml(name, profile) {
  const id = slugify(name);
  const title = `How ${name} Interviews for AI/ML Roles`;
  const pageUrl = `${BASE_URL}/companies/${id}`;
  const appUrl = `${BASE_URL}/#company-tracks`;
  const desc = (profile.overview || "").slice(0, 155);

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
    body { background: #0c0a08; color: #e4e4e7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.7; }
    a { color: ${ACCENT}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .top-bar { background: #0f0d0b; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .brand { font-size: 13px; font-weight: 700; font-family: "Courier New", monospace; color: rgba(255,255,255,0.6); letter-spacing: 0.05em; }
    .open-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; background: ${ACCENT}18; border: 1px solid ${ACCENT}40; color: ${ACCENT}; white-space: nowrap; }
    .open-btn:hover { background: ${ACCENT}28; text-decoration: none; }
    .accent-bar { height: 3px; background: linear-gradient(90deg, transparent, ${ACCENT}cc 30%, ${ACCENT}cc 70%, transparent); }
    article { max-width: 720px; margin: 0 auto; padding: 48px 24px 80px; }
    .badge { font-size: 10px; font-family: "Courier New", monospace; font-weight: 700; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.08em; text-transform: uppercase; background: ${ACCENT}18; border: 1px solid ${ACCENT}30; color: ${ACCENT}; display: inline-block; margin-bottom: 16px; }
    h1 { font-size: clamp(22px, 4vw, 34px); font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.02em; }
    .desc { font-size: 15px; color: rgba(255,255,255,0.72); margin-bottom: 40px; line-height: 1.7; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    section { margin-bottom: 32px; }
    h2 { font-size: 20px; font-weight: 700; color: #fff; margin: 0 0 14px; }
    ul, ol { padding-left: 22px; margin-bottom: 16px; }
    li { font-size: 15px; color: rgba(255,255,255,0.72); margin-bottom: 10px; }
    ul.refs { list-style: none; padding: 0; }
    ul.refs li { font-size: 13px; margin-bottom: 6px; }
    .prep-box { background: ${ACCENT}0c; border-left: 3px solid ${ACCENT}; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 32px; }
    .prep-box p { font-size: 15px; color: rgba(255,255,255,0.85); }
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
    <span class="badge">Company Track</span>
    <h1>${esc(title)}</h1>
    <p class="desc">${esc(profile.overview || "")}</p>

    ${processHtml(profile.process)}
    ${listHtml("What They Weight", profile.emphasis)}
    ${listHtml("Focus Your Prep On", profile.focusAreas)}
    ${profile.prep ? `<div class="prep-box"><p><strong>Prep angle:</strong> ${esc(profile.prep)}</p></div>` : ""}
    ${sourcesHtml(profile.sources)}
    <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:8px;">Based on public reports — not an official ${esc(name)} source.</p>

    <div class="cta-card">
      <h2>Prep the full ${esc(name)} track</h2>
      <p>See the deep-linked modules, GroundTruth posts, and drills mapped to this company's actual loop.</p>
      <a href="${appUrl}">Open Company Tracks →</a>
    </div>
  </article>
  <footer>genai-systems-lab-ivory.vercel.app · Free for AI engineers and PMs</footer>
</body>
</html>`;
}

mkdirSync(PUBLIC_COMPANIES, { recursive: true });

let generated = 0;
let skipped = 0;
const urls = [];
const skippedNames = [];

const names = Array.isArray(COMPANIES) && COMPANIES.length ? COMPANIES : Object.keys(COMPANY_PROFILES);

for (const name of names) {
  const profile = COMPANY_PROFILES[name];
  if (!profile || typeof profile !== "object" || !profile.overview) {
    skipped++;
    skippedNames.push(name);
    continue;
  }
  const id = slugify(name);
  const html = generateHtml(name, profile);
  writeFileSync(join(PUBLIC_COMPANIES, `${id}.html`), html, "utf8");
  urls.push(`${BASE_URL}/companies/${id}`);
  generated++;
}

const sitemapPath = join(ROOT, "public", "sitemap.xml");
const today = new Date().toISOString().split("T")[0];
const companyUrlEntries = urls.map(u =>
  `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
).join("\n");

if (existsSync(sitemapPath)) {
  const existing = readFileSync(sitemapPath, "utf8");
  const updated = existing.replace("</urlset>", `${companyUrlEntries}\n</urlset>`);
  writeFileSync(sitemapPath, updated, "utf8");
} else {
  console.warn("prerender-companies: public/sitemap.xml not found — run prerender-gt.js first. Skipping sitemap append.");
}

console.log(`prerender-companies: ${generated} pages written, ${skipped} skipped (${skippedNames.join(", ") || "none"}), sitemap.xml appended`);
