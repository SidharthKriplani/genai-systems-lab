#!/usr/bin/env node
// labcheck.mjs — BreakLabs Layer-1 build-gate validator (H1, 2026-07-23).
// Wired as the npm `prebuild` script so Vercel runs it on EVERY deploy:
// a HARD-FAIL finding exits 1 and blocks the deploy; WARN findings print
// but never block (pre-existing lint classes stay visible without freezing
// deploys until their fix waves land).
//
// Derived from the D15 invariant catalogs (labs/_plan/labcheck-catalogs/);
// per-lab behavior selected by the nearest package.json name field.
//
// Design rules:
// - Zero dependencies. Node >= 16. Pure string/regex analysis — never executes app code.
// - Every check states its method inline (the D14/D15 lesson: extraction
//   claims must carry their regex so blind spots are visible at claim time).
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const LAB = /genai/.test(pkg.name || '') ? 'GSL' : /ml-systems/.test(pkg.name || '') ? 'MSL' : /analytics|experimentation/.test(pkg.name || '') ? 'PAL' : 'UNKNOWN';

const hard = [];   // block the deploy
const warn = [];   // print only
const H = (id, msg) => hard.push(`[${id}] ${msg}`);
const W = (id, msg) => warn.push(`[${id}] ${msg}`);
const read = (p) => readFileSync(resolve(root, p), 'utf8');

// ── Shared helpers ───────────────────────────────────────────────────────────
// Template-literal content extractor: returns the raw text of every `...`
// literal in a file. Method: regex /`((?:[^`\\]|\\.)*)`/gs — misses nested
// backticks-in-expressions (rare in these data files) — stated per the
// extraction-method rule.
const literals = (src) => [...src.matchAll(/`((?:[^`\\]|\\.)*)`/gs)].map(m => m[1]);

// Annex/typography block-shape scan: finds { h: / { eq: / { list: [ / { table: {
// occurrences and sanity-checks table rectangularity by parsing the nearest
// head/rows arrays with a lightweight bracket matcher.
function checkTables(src, file) {
  let idx = 0;
  while ((idx = src.indexOf('{ table: {', idx)) !== -1) {
    const seg = src.slice(idx, idx + 4000);
    const head = seg.match(/head:\s*\[([^\]]*)\]/s);
    const rowsBlockStart = seg.indexOf('rows: [');
    if (!head || rowsBlockStart === -1) { H('tbl-shape', `${file}: table block near offset ${idx} missing head/rows`); idx += 10; continue; }
    const headCount = head[1].split(',').filter(s => s.trim()).length;
    // count each row's top-level commas via bracket depth
    const rowsSeg = seg.slice(rowsBlockStart + 7);
    let depth = 0, rowLens = [], cur = 0, inStr = false, q = '';
    for (let i = 0; i < rowsSeg.length; i++) {
      const c = rowsSeg[i];
      if (inStr) { if (c === q && rowsSeg[i - 1] !== '\\') inStr = false; continue; }
      if (c === '"' || c === "'" || c === '`') { inStr = true; q = c; continue; }
      if (c === '[') { depth++; if (depth === 1) cur = 1; continue; }
      if (c === ']') { depth--; if (depth === 0) { rowLens.push(cur); } if (depth < 0) break; continue; }
      if (c === ',' && depth === 1) cur++;
    }
    rowLens = rowLens.filter(n => n > 0);
    for (const n of rowLens) if (n !== headCount) H('tbl-rect', `${file}: table near offset ${idx} has a ${n}-cell row vs ${headCount}-col head`);
    idx += 10;
  }
}

// ── GSL checks (catalog: gsl-foundationsRunnerData.json) ─────────────────────
if (LAB === 'GSL') {
  const FILE = 'src/data/foundationsRunnerData.js';
  const src = read(FILE);

  // gsl-1 module-id uniqueness. Method: /^  "([a-z0-9-]+)": \{/gm on top-level keys.
  const ids = [...src.matchAll(/^  "([a-z0-9-]+)": \{/gm)].map(m => m[1]);
  const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dupes.length) H('gsl-dupe-id', `duplicate module ids: ${[...new Set(dupes)].join(', ')}`);

  // gsl-2 renderer-safety: NO underscores inside annex/typography template
  // literals (deeperMath/interviewMin/cloudMap regions). Method: slice each
  // region from its field name to the next top-level field at same indent,
  // then scan its backtick literals for /_/.
  for (const field of ['deeperMath', 'interviewMin', 'cloudMap']) {
    let i = 0;
    while ((i = src.indexOf(`    ${field}: [`, i)) !== -1) {
      const end = src.indexOf('\n    ', src.indexOf(']', i)); // conservative window
      const region = src.slice(i, end === -1 ? i + 20000 : end + 20000 > src.length ? src.length : src.indexOf('\n  },', i) + 1 || i + 20000);
      const bad = literals(region.slice(0, 25000)).filter(t => /_/.test(t));
      if (bad.length) H('gsl-underscore', `${field} block near offset ${i}: ${bad.length} literal(s) contain '_' (InlineMd italics hazard). First: "${bad[0].slice(0, 60)}..."`);
      i += 10;
    }
  }

  // gsl-3 table rectangularity (annex {table} blocks).
  checkTables(src, FILE);

  // gsl-4 inline-pointer lint (WARN until D16 fix wave lands; then promote to HARD).
  // Method: /\(\d\)\s.{10,}\(\d\)/s inside individual template/quoted strings.
  const ptr = literals(src).filter(t => /\(\d\)\s.{10,}\(\d\)/s.test(t)).length;
  if (ptr) W('gsl-inline-ptr', `${ptr} string(s) contain inline numbered pointers — typography rule L1 (fix wave pending)`);

  // gsl-5 annex block shapes: any object in an annex array must be one of the
  // known shapes. Method: scan for '{ ' immediately followed by an unknown key
  // inside annex regions — heuristic, WARN only.
  const unknown = [...src.matchAll(/\{ (?!h:|eq:|list:|table:|type:)([a-z]+):/g)].length;
  if (unknown > 400) W('gsl-shape-drift', `unusually many unrecognized object keys (${unknown}) — eyeball if a new block type was invented`);
}

// ── MSL checks (catalogs: msl-qnaBank/qnaStatus/foundations) ─────────────────
if (LAB === 'MSL') {
  const bank = read('src/data/qnaBank.js');
  const status = read('src/data/qnaStatus.js');

  // msl-1 THE reconciliation (the 6786/6792 lesson + the 6791 maiden-run lesson:
  // char class must allow uppercase/underscore — qna-case-diD-pretrends-01):
  // count ids as the UNION of qna-prefixed AND bare ids — method:
  // /id: "((?:qna-)?[A-Za-z0-9_-]+)"/g — never prefix-only (D14's blind spot).
  const bankIds = [...bank.matchAll(/id: "((?:qna-)?[A-Za-z0-9_-]+)"/g)].map(m => m[1]);
  const uniq = new Set(bankIds);
  if (uniq.size !== bankIds.length) {
    const d = bankIds.filter((x, i) => bankIds.indexOf(x) !== i);
    H('msl-dupe-id', `duplicate question ids: ${[...new Set(d)].slice(0, 5).join(', ')}...`);
  }
  const declared = [...status.matchAll(/questionCount: (\d+)/g)].reduce((a, m) => a + Number(m[1]), 0);
  if (uniq.size !== declared) H('msl-recon', `qnaBank unique ids (${uniq.size}) != qnaStatus declared total (${declared}) — method: union of prefixed+bare ids vs summed questionCount`);

  // msl-2 Answer-first rule: every answer array's first bullet starts **Answer.
  // Method: /answer: \["(\*\*[^.]*)/g — first string's opening token.
  const answers = [...bank.matchAll(/answer: \[\s*"(\*\*\w+)/g)].map(m => m[1]);
  const bad = answers.filter(a => a !== '**Answer');
  if (bad.length) H('msl-answer-first', `${bad.length} answer array(s) don't open with an **Answer bullet`);

  // msl-3 unpaired-$ hazard: a string containing an ODD number of unescaped $
  // can swallow text into a math span. WARN (renderMd requires same-line pairs).
  const oddDollar = literals(bank).concat([...bank.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]))
    .filter(t => ((t.match(/(?<!\\)\$/g) || []).length % 2) === 1).length;
  if (oddDollar) W('msl-odd-dollar', `${oddDollar} string(s) carry an odd count of unescaped $ — check for accidental math spans`);

  // msl-4 status enums. Method: /status: "(\w+)"/g against the allowed set.
  const badStatus = [...status.matchAll(/status: "(\w+)"/g)].map(m => m[1]).filter(s => !['answered', 'parked', 'draft'].includes(s));
  if (badStatus.length) H('msl-status-enum', `unknown status values: ${[...new Set(badStatus)].join(', ')}`);
}

// ── PAL checks (catalog: pal-spotTheFlawCases.json; foundation-module catalog
//    is single-sample-flagged — deploy-gating deferred until firmed) ──────────
if (LAB === 'PAL') {
  const p = 'src/data/spotTheFlawCases.js';
  if (existsSync(resolve(root, p))) {
    const src = read(p);
    const ids = [...src.matchAll(/id: ['"]([A-Za-z0-9_-]+)['"]/g)].map(m => m[1]);
    const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
    if (dupes.length) H('pal-dupe-id', `duplicate case ids: ${[...new Set(dupes)].join(', ')}`);
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
for (const w of warn) console.warn(`labcheck WARN  ${w}`);
for (const h of hard) console.error(`labcheck FAIL  ${h}`);
console.log(`labcheck [${LAB}]: ${hard.length} hard, ${warn.length} warn`);
if (hard.length) process.exit(1);
