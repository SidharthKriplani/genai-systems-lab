// prerender-gt.js — build-time static HTML generation for Ground Truth posts
// Run before vite build: node scripts/prerender-gt.js && vite build
//
// Outputs:
//   public/gt/{postId}.html  — one per post (SEO-ready, full content, dark-styled)
//   public/sitemap.xml       — all GT post URLs + main pages for Google Search Console

import { createRequire } from "module";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const PUBLIC_GT = join(ROOT, "public", "gt");
const BASE_URL  = "https://genai-systems-lab-ivory.vercel.app";

// ── Load source data via vm (avoids JSX/Vite transform dependency) ───────────

import { createContext, runInContext } from "vm";

function evalModule(filePath) {
  // Strip `export const/let/var NAME =` → bare `NAME =` so assignments
  // land on the vm context object (not block-scoped via const/let).
  const src = readFileSync(filePath, "utf8")
    .replace(/export\s+(const|let|var)\s+(\w+)/g, "$2"); // "export const X" → "X"
  const ctx = createContext({ console });
  runInContext(src, ctx);
  return ctx;
}

const idxCtx     = evalModule(join(ROOT, "src", "groundTruthIndex.js"));
const contentCtx = evalModule(join(ROOT, "src", "groundTruthPosts.js"));

const POSTS       = idxCtx.POSTS;
const POST_CONTENT = contentCtx.POST_CONTENT;

if (!POSTS || !Array.isArray(POSTS)) {
  console.error("Could not load POSTS from groundTruthIndex.js");
  process.exit(1);
}
if (!POST_CONTENT || typeof POST_CONTENT !== "object") {
  console.error("Could not load POST_CONTENT from groundTruthPosts.js");
  process.exit(1);
}

// ── Block → HTML renderer ─────────────────────────────────────────────────────

function esc(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blockToHtml(block) {
  if (!block || typeof block !== "object") return "";
  const t    = block.t || block.type || "p";
  const text = block.c ?? block.text ?? "";
  const items = block.items ?? (Array.isArray(block.c) ? block.c : null);

  switch (t) {
    case "p":
      return `<p>${esc(text)}</p>`;
    case "h2":
      return `<h2>${esc(text)}</h2>`;
    case "h3":
      return `<h3>${esc(text)}</h3>`;
    case "callout":
      return `<div class="callout"><p>${esc(text)}</p></div>`;
    case "code":
      return `<pre><code>${esc(text)}</code></pre>`;
    case "list": {
      const listItems = items || (typeof text === "string" ? [text] : []);
      return `<ul>${listItems.map(i => `<li>${esc(typeof i === "string" ? i : JSON.stringify(i))}</li>`).join("")}</ul>`;
    }
    case "table": {
      const headers = block.headers || [];
      const rows    = block.rows || [];
      const thead   = headers.length ? `<thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>` : "";
      const tbody   = `<tbody>${rows.map(r => `<tr>${(Array.isArray(r) ? r : []).map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      return `<table>${thead}${tbody}</table>`;
    }
    case "divider":
      return `<hr>`;
    case "quote":
      return `<blockquote>${esc(text)}</blockquote>`;
    case "video":
      return `<p><em>[Video: ${esc(block.label || "embedded video")}]</em></p>`;
    case "lab":
      return `<p><strong>${esc(block.label || "Interactive lab")}</strong>: ${esc(block.desc || "")}</p>`;
    case "refs": {
      const refs = Array.isArray(block.items) ? block.items : [];
      return refs.length ? `<ul class="refs">${refs.map(r => `<li><a href="${esc(r.url || "#")}" rel="noopener noreferrer">${esc(r.label || r.url || "")}</a></li>`).join("")}</ul>` : "";
    }
    default:
      return text ? `<p>${esc(text)}</p>` : "";
  }
}

// ── Category → accent colour map ─────────────────────────────────────────────

const AREA_COLOR = {
  retrieval:   "#06b6d4",
  agents:      "#06b6d4",
  evaluation:  "#8b5cf6",
  production:  "#f59e0b",
  foundations: "#6366f1",
};

const CATEGORY_LABEL = {
  foundations: "Foundations & Architecture",
  rag:         "RAG & Retrieval",
  agents:      "Agents & Tool Use",
  evaluation:  "Evaluation",
  production:  "Production & LLMOps",
  general:     "AI Engineering",
};

// ── HTML template ─────────────────────────────────────────────────────────────

function generateHtml(post, blocks) {
  const color     = AREA_COLOR[post.challengeArea] || "#06b6d4";
  const category  = CATEGORY_LABEL[post.category] || "AI Engineering";
  const pageUrl   = `${BASE_URL}/gt/${post.id}`;
  const appUrl    = `${BASE_URL}/#groundtruth`;
  const desc      = post.desc || post.preview || "";
  const readMin   = post.readMin ? `${post.readMin} min read` : "";
  const contentHtml = (blocks || []).map(blockToHtml).filter(Boolean).join("\n    ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(post.title)} | GenAI Systems Lab</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${pageUrl}">

  <!-- Open Graph -->
  <meta property="og:type"        content="article">
  <meta property="og:url"         content="${pageUrl}">
  <meta property="og:title"       content="${esc(post.title)} | GenAI Systems Lab">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:site_name"   content="GenAI Systems Lab">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${esc(post.title)}">
  <meta name="twitter:description" content="${esc(desc)}">

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; }
    body {
      background: #0c0a08;
      color: #e4e4e7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.7;
      padding: 0;
    }
    a { color: ${color}; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Top bar */
    .top-bar {
      background: #0f0d0b;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand {
      font-size: 13px;
      font-weight: 700;
      font-family: "Courier New", monospace;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.05em;
    }
    .open-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      background: ${color}18;
      border: 1px solid ${color}40;
      color: ${color};
      white-space: nowrap;
      cursor: pointer;
    }
    .open-btn:hover { background: ${color}28; text-decoration: none; }

    /* Accent bar */
    .accent-bar { height: 3px; background: linear-gradient(90deg, transparent, ${color}cc 30%, ${color}cc 70%, transparent); }

    /* Article */
    article {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .badge {
      font-size: 10px;
      font-family: "Courier New", monospace;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: ${color}18;
      border: 1px solid ${color}30;
      color: ${color};
    }
    .read-time {
      font-size: 11px;
      font-family: "Courier New", monospace;
      color: rgba(255,255,255,0.3);
    }
    h1 {
      font-size: clamp(22px, 4vw, 34px);
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    .desc {
      font-size: 15px;
      color: rgba(255,255,255,0.55);
      margin-bottom: 40px;
      line-height: 1.6;
      padding-bottom: 32px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    /* Content blocks */
    h2 { font-size: 20px; font-weight: 700; color: #fff; margin: 36px 0 12px; }
    h3 { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.85); margin: 28px 0 10px; }
    p  { font-size: 15px; color: rgba(255,255,255,0.72); margin-bottom: 16px; }
    ul, ol { padding-left: 20px; margin-bottom: 16px; }
    li { font-size: 15px; color: rgba(255,255,255,0.72); margin-bottom: 6px; }
    pre {
      background: #1a1612;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin-bottom: 20px;
    }
    code { font-family: "Courier New", monospace; font-size: 13px; color: ${color}; }
    .callout {
      background: rgba(255,255,255,0.03);
      border-left: 3px solid ${color};
      border-radius: 0 8px 8px 0;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .callout p { margin-bottom: 0; color: rgba(255,255,255,0.8); }
    blockquote {
      border-left: 3px solid rgba(255,255,255,0.15);
      padding-left: 16px;
      margin-bottom: 20px;
      color: rgba(255,255,255,0.55);
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 13px;
    }
    th {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 8px 12px;
      text-align: left;
      font-family: "Courier New", monospace;
      color: rgba(255,255,255,0.5);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    td {
      border: 1px solid rgba(255,255,255,0.06);
      padding: 8px 12px;
      color: rgba(255,255,255,0.7);
      vertical-align: top;
    }
    hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 32px 0; }
    ul.refs { list-style: none; padding: 0; }
    ul.refs li { font-size: 13px; margin-bottom: 4px; }

    /* CTA card */
    .cta-card {
      margin-top: 56px;
      padding: 28px;
      border-radius: 16px;
      background: ${color}0c;
      border: 1px solid ${color}30;
      text-align: center;
    }
    .cta-card h2 {
      margin: 0 0 8px;
      font-size: 18px;
      color: #fff;
    }
    .cta-card p {
      margin-bottom: 20px;
      font-size: 13px;
      color: rgba(255,255,255,0.45);
    }
    .cta-card a {
      display: inline-block;
      padding: 10px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      background: ${color};
      color: #000;
    }
    .cta-card a:hover { opacity: 0.9; text-decoration: none; }

    /* Footer */
    footer {
      text-align: center;
      padding: 24px;
      font-size: 11px;
      font-family: "Courier New", monospace;
      color: rgba(255,255,255,0.2);
      border-top: 1px solid rgba(255,255,255,0.04);
    }
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
      <span class="badge">${esc(category)}</span>
      ${readMin ? `<span class="read-time">${esc(readMin)}</span>` : ""}
    </div>
    <h1>${esc(post.title)}</h1>
    <p class="desc">${esc(desc)}</p>

    ${contentHtml}

    <div class="cta-card">
      <h2>Try it interactively</h2>
      <p>GenAI Systems Lab is a free platform for AI engineers — configure real failure modes, break things, and build the judgment that gets you hired.</p>
      <a href="${appUrl}">Open GenAI Systems Lab →</a>
    </div>
  </article>

  <footer>
    genai-systems-lab-ivory.vercel.app · Free for AI engineers and PMs
  </footer>
</body>
</html>`;
}

// ── Generate all pages ────────────────────────────────────────────────────────

mkdirSync(PUBLIC_GT, { recursive: true });

let generated = 0;
let skipped   = 0;
const urls    = [];

for (const post of POSTS) {
  const blocks = POST_CONTENT[post.id];
  if (!blocks || !Array.isArray(blocks)) {
    skipped++;
    continue;
  }
  const html = generateHtml(post, blocks);
  writeFileSync(join(PUBLIC_GT, `${post.id}.html`), html, "utf8");
  urls.push(`${BASE_URL}/gt/${post.id}`);
  generated++;
}

// ── Generate sitemap.xml ──────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0];

const staticUrls = [
  BASE_URL,
  `${BASE_URL}/agents`,
  `${BASE_URL}/retrieval`,
  `${BASE_URL}/evaluation`,
  `${BASE_URL}/production`,
  `${BASE_URL}/foundations`,
  `${BASE_URL}/preplab`,
].map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);

const postUrls = urls.map(u =>
  `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("\n")}
${postUrls.join("\n")}
</urlset>`;

writeFileSync(join(ROOT, "public", "sitemap.xml"), sitemap, "utf8");

console.log(`prerender-gt: ${generated} pages written, ${skipped} skipped (no content), sitemap.xml updated`);
