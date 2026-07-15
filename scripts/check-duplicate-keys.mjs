#!/usr/bin/env node
// scripts/check-duplicate-keys.mjs  (v2 — brace-depth parser, not indent heuristic)
//
// Exhaustive duplicate-direct-child-key scanner for content data files
// (src/data/**/*.js).
//
// WHY THIS EXISTS: on 2026-07-15, 26 (MSL) then 10 more (MSL) then several
// more (GSL) instances of a repeated key inside a single object literal were
// found -- each one valid JS (the second occurrence silently wins, the first
// is dead code) so `node --check` never flags it, and no content-audit round
// ever caught it either, because CONTENT-AUDIT-RUBRIC.md / 3B1B-STANDARD.md
// govern prose and numeric correctness, not object-literal structure.
//
// v1 of this script used an indentation-convention heuristic (module objects
// always open on their own `  {` line) which worked for MSL's
// `src/data/foundations/*.js` but produced false positives on GSL's
// `preplabQuestions.js`, whose question objects open as `  { id: "x", ...`
// with several keys inline on one line. v2 replaces the heuristic with an
// actual brace-depth walk: it strips string/template-literal contents and
// comments first (so quoted colons/braces can't confuse it), then tracks
// object nesting depth char-by-char. A "chunk" is any object at depth 2
// (a direct element of a top-level array, e.g. each module/question object);
// only keys found at exactly that depth count as direct children -- a nested
// object one level deeper (`readMore: {...}`, `figures: {...}`) does NOT
// contribute its own keys to the enclosing chunk's key set, so it can't
// produce false positives from unrelated same-named nested fields either.
//
// USAGE:  node scripts/check-duplicate-keys.mjs
// Exit 0 = clean. Exit 1 = duplicate key(s) found, with file/key/line detail.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');

function walkDir(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walkDir(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

// Replaces string/template-literal contents and comments with spaces
// (preserving newlines, so line numbers stay accurate), leaving braces,
// colons, and identifiers outside strings untouched for structural parsing.
function stripNonCode(text) {
  let out = '';
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += ' ';
      i++;
      while (i < n && text[i] !== quote) {
        if (text[i] === '\\' && i + 1 < n) {
          out += text[i] === '\n' ? '\n' : ' ';
          out += text[i + 1] === '\n' ? '\n' : ' ';
          i += 2;
          continue;
        }
        out += text[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i < n) { out += ' '; i++; } // closing quote
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      while (i < n && text[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      out += '  ';
      i += 2;
      while (i < n && !(text[i] === '*' && text[i + 1] === '/')) {
        out += text[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i < n) { out += '  '; i += 2; }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function findDuplicateKeysInFile(rawText) {
  const code = stripNonCode(rawText);
  let lineNum = 1;
  // stack of Map<key, [lineNumbers]> -- one entry per currently-open object
  // literal, at whatever depth. Every object literal in the file (module
  // objects in an array, entries in a dict-of-objects, nested `figures:{}` /
  // `readMore:{}` sub-objects) is checked independently for duplicate DIRECT
  // children -- this needs no assumption about which depth is "the
  // interesting one", so it works for both `export const X = [ {...} ]`
  // (module is depth 1) and `export const X = { key: {...} }` (entry is
  // depth 2) shapes without per-file configuration.
  const stack = [];
  const issues = [];
  const KEY_RE = /([A-Za-z_$][\w$]*)\s*:/y;

  let i = 0;
  const n = code.length;
  while (i < n) {
    const c = code[i];
    if (c === '\n') { lineNum++; i++; continue; }
    if (c === '{') {
      stack.push(new Map());
      i++;
      continue;
    }
    if (c === '}') {
      const keys = stack.pop();
      if (keys) {
        for (const [key, lns] of keys) {
          if (lns.length > 1) issues.push({ key, lines: lns });
        }
      }
      i++;
      continue;
    }
    if (stack.length > 0) {
      KEY_RE.lastIndex = i;
      const m = KEY_RE.exec(code);
      if (m && m.index === i) {
        const key = m[1];
        const keys = stack[stack.length - 1];
        if (!keys.has(key)) keys.set(key, []);
        keys.get(key).push(lineNum);
        i += m[0].length;
        continue;
      }
    }
    i++;
  }

  return issues;
}

const files = walkDir(DATA_DIR);
let totalIssues = 0;
const offenders = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const issues = findDuplicateKeysInFile(text);
  if (issues.length > 0) {
    totalIssues += issues.length;
    offenders.push({ file: path.relative(ROOT, file), issues });
  }
}

if (totalIssues === 0) {
  console.log(`OK: 0 duplicate direct-child keys across ${files.length} files in src/data/.`);
  process.exit(0);
} else {
  console.error(`FAIL: ${totalIssues} duplicate direct-child key(s) found:`);
  for (const o of offenders) {
    console.error(`  ${o.file}:`);
    for (const iss of o.issues) {
      console.error(`    key "${iss.key}" appears ${iss.lines.length}x at lines ${iss.lines.join(', ')}`);
    }
  }
  process.exit(1);
}
