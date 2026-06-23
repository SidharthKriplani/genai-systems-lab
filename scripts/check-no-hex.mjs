#!/usr/bin/env node
/* ────────────────────────────────────────────────────────────────────────────
   Colour guard — keeps the monochrome instrument system honest.
   Reports raw hex colour literals in the src .jsx / .js component layer.
   Colour must come from the token remap in src/index.css, not scattered hex.

   Run:  node scripts/check-no-hex.mjs            (report — default)
         node scripts/check-no-hex.mjs --strict   (exit 1 on any hit)

   Wire `--strict` into pre-commit / the build ONLY after the inline-hex
   stragglers (CAT_COLORS, viz SVG strokes) are tokenised to var(--…).
   Spec: HQ/DESIGN-STANDARD.md "THE MONOCHROME INSTRUMENT STANDARD".
   ──────────────────────────────────────────────────────────────────────────── */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src/', import.meta.url));
const EXT = new Set(['.jsx', '.js']);
const SKIP_FILES = new Set(['index.css']); // the token file is the ONLY legal home for hex
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g; // valid CSS hex lengths only
const strict = process.argv.includes('--strict');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXT.has(extname(name)) && !SKIP_FILES.has(basename(name))) out.push(p);
  }
  return out;
}

let total = 0;
const byFile = [];
for (const file of walk(ROOT)) {
  const hits = [];
  readFileSync(file, 'utf8').split('\n').forEach((ln, i) => {
    const m = ln.match(HEX);
    if (m) hits.push({ line: i + 1, hex: [...new Set(m)], text: ln.trim().slice(0, 90) });
  });
  if (hits.length) { byFile.push({ file: file.replace(ROOT, 'src/'), hits }); total += hits.length; }
}

byFile.sort((a, b) => b.hits.length - a.hits.length);
for (const { file, hits } of byFile) {
  console.log(`\n${file}  (${hits.length})`);
  for (const h of hits.slice(0, 6)) console.log(`  ${String(h.line).padStart(4)}: ${h.hex.join(' ')}   ${h.text}`);
  if (hits.length > 6) console.log(`       … +${hits.length - 6} more`);
}
console.log(`\n── ${total} raw hex literals outside the token file, in ${byFile.length} files.`);
console.log('   Colour belongs in src/index.css. Tokenise these to var(--…) to clear the guard.');
if (strict && total) { console.error('\n✗ --strict: raw hex present. Failing build.'); process.exit(1); }
