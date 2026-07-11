#!/usr/bin/env node
/* ────────────────────────────────────────────────────────────────────────────
   Content-status receipt guard — keeps contentStatus.js honest.
   Every entry with status: 'clean' MUST carry a real `verifiedBy` receipt
   (see contentStatus.js's own header for the enforced 3-part spec: timestamp,
   re-runnable check, what it confirmed) and, where sourceFile/verifiedFileHash
   are present, warns if the underlying file has changed since the receipt was
   written (whole-file granularity — a sibling module in the same file can
   trigger this too, that's a known limitation, not a bug: treat a hash warning
   as "go re-check," not "definitely broken").

   Run:  node scripts/validate-content-status.mjs
         exits 1 if any 'clean' entry is missing a real verifiedBy.
         hash-staleness is printed as a WARNING only, does not fail the run.

   Wire this into the standard batch-close git command sequence (see CLAUDE.md's
   Recordkeeping section) — run it before every `git add`/`git commit` that
   touches contentStatus.js.
   ──────────────────────────────────────────────────────────────────────────── */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const { CONTENT_STATUS } = await import(join(ROOT, 'src/data/contentStatus.js'));

let hardFailures = 0;
let hashWarnings = 0;
let cleanCount = 0;
const tierCounts = { S: { clean: 0, other: 0 }, A: { clean: 0, other: 0 } };

function currentHash(relPath) {
  const buf = readFileSync(join(ROOT, relPath));
  return createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

for (const [moduleId, entry] of Object.entries(CONTENT_STATUS)) {
  const tierBucket = tierCounts[entry.tier] ?? (tierCounts[entry.tier] = { clean: 0, other: 0 });
  if (entry.status !== 'clean') {
    tierBucket.other++;
    continue;
  }
  tierBucket.clean++;
  cleanCount++;

  const receipt = entry.verifiedBy;
  const looksReal = typeof receipt === 'string' && receipt.length > 40 && /IST/.test(receipt) && !/^verified$/i.test(receipt.trim());
  if (!looksReal) {
    hardFailures++;
    console.error(`✗ FAIL  "${moduleId}": status is 'clean' but verifiedBy is missing or not a real receipt (must be a string >40 chars, contain an IST timestamp, not just the word "verified"). Got: ${JSON.stringify(receipt)}`);
    continue;
  }

  if (entry.sourceFile && entry.verifiedFileHash) {
    let nowHash;
    try {
      nowHash = currentHash(entry.sourceFile);
    } catch (e) {
      hardFailures++;
      console.error(`✗ FAIL  "${moduleId}": sourceFile "${entry.sourceFile}" could not be read (${e.message})`);
      continue;
    }
    if (nowHash !== entry.verifiedFileHash) {
      hashWarnings++;
      console.warn(`⚠ STALE "${moduleId}": ${entry.sourceFile} has changed since verifiedFileHash was recorded (was ${entry.verifiedFileHash}, now ${nowHash}). Could be this module, could be a sibling module in the same file — re-verify before trusting 'clean' here.`);
    }
  } else if (entry.sourceFile || entry.verifiedFileHash) {
    hardFailures++;
    console.error(`✗ FAIL  "${moduleId}": has one of sourceFile/verifiedFileHash but not both — they're required together.`);
  }
}

console.log('');
console.log(`Checked ${cleanCount} 'clean' entries across ${Object.keys(CONTENT_STATUS).length} total tracked modules.`);
console.log(`  S-tier: ${tierCounts.S?.clean ?? 0} clean, ${tierCounts.S?.other ?? 0} unclassified/pending/in_progress`);
console.log(`  A-tier: ${tierCounts.A?.clean ?? 0} clean, ${tierCounts.A?.other ?? 0} unclassified/pending/in_progress`);
if (hashWarnings > 0) console.log(`  ${hashWarnings} hash-staleness warning(s) — see above, non-fatal.`);

if (hardFailures > 0) {
  console.error(`\n${hardFailures} FAILURE(S) — a 'clean' entry without a real receipt is a false claim of confidence. Fix before committing.`);
  process.exit(1);
}
console.log('\nAll clean entries have real receipts. OK.');
