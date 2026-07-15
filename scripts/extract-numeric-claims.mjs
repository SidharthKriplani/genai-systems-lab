#!/usr/bin/env node
// scripts/extract-numeric-claims.mjs
//
// Usage: node scripts/extract-numeric-claims.mjs <file> <moduleId>
//
// WHY THIS EXISTS: on 2026-07-15, contentStatus.js's own audit trail for
// `linear_regression` and `hypothesis_testing` both claimed (2026-07-14
// 21:45 IST, workflow wf_4232dbd7-219) to have "recomputed every arithmetic
// claim" / "every numeric/factual claim" in the module. Both were false --
// each audit's own itemized list of what it actually rechecked (Sxy, slope,
// R², adjusted R²; the 20-test multiple-comparisons math) never included the
// two exact sentences that were wrong (the "14,600 IS the variance"
// mislabeling; a fabricated p=0.03 headline result). The audit verified
// numbers AROUND the broken claim, not the claim itself, then its summary
// line overclaimed "every X" relative to its own real scope.
//
// This script turns "recomputed every arithmetic claim" from a self-report
// into a literal, mechanically-generated checklist: it pulls every
// numeric-looking token out of a module's prose fields (summary, keyPoints,
// recap, takeaway, interactivePrompt, checkQuestions) and prints it as a
// numbered list. A 'clean' verifiedBy note claiming numeric exhaustiveness
// should be able to point at having checked off every line this prints --
// not just assert the word "every".
//
// LIMITATION: this is a blunt regex sweep, not a semantic parser -- it will
// over-list (catch years, list indices, unrelated numbers) more often than
// it under-lists. That's the intended failure direction: an auditor
// dismissing an irrelevant line is cheap; an auditor never seeing the one
// broken line is what caused both bugs this script exists to prevent.

import fs from 'node:fs';

const [, , filePath, moduleId] = process.argv;
if (!filePath || !moduleId) {
  console.error('Usage: node scripts/extract-numeric-claims.mjs <file> <moduleId>');
  process.exit(2);
}

const src = fs.readFileSync(filePath, 'utf8');
const idIdx = src.indexOf(`id: '${moduleId}'`);
if (idIdx === -1) {
  console.error(`Module id '${moduleId}' not found in ${filePath}`);
  process.exit(2);
}
const objStart = src.lastIndexOf('{', idIdx);
let depth = 0, objEnd = -1;
for (let i = objStart; i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') { depth--; if (depth === 0) { objEnd = i; break; } }
}
if (objEnd === -1) {
  console.error('Could not find matching closing brace for module object.');
  process.exit(2);
}
const moduleText = src.slice(objStart, objEnd + 1);

const NUM_RE = /(\$[\d,]+(\.\d+)?k?\b|[\d,]+(\.\d+)?\s?%|p\s*[<=≈]\s*[\d.]+|R²\s*[=≈]\s*[\d.]+|z\s*[≈=]\s*[\d.]+|≈\s?[\d,]+(\.\d+)?\s*(percentage points|pp\b)?|\b\d+(\.\d+)?\b)/g;

const found = moduleText.match(NUM_RE) || [];
const unique = [...new Set(found.map(s => s.trim()).filter(Boolean))];

console.log(`Module '${moduleId}' in ${filePath}: ${unique.length} distinct numeric token(s) found.`);
console.log('Checklist -- an audit claiming "recomputed every arithmetic/numeric claim" must independently re-derive and tick off EVERY line below, not just the ones it remembers to check:');
unique.forEach((tok, idx) => console.log(`  [ ] ${idx + 1}. ${tok}`));
