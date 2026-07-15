#!/usr/bin/env node
/* ────────────────────────────────────────────────────────────────────────────
   QnA-status receipt guard — keeps qnaStatus.js honest, mirrors
   validate-content-status.mjs's discipline for the QnA lifecycle.

   Every entry with status 'parked' or 'answered' MUST carry a real `verifiedBy`
   receipt (IST timestamp + re-runnable check + what was confirmed). 'draft'
   entries do not require one (nothing has been audited yet).

   Also cross-checks qnaStatus.js's status field against qnaBank.js's own
   per-module `status` field -- these two files must never drift apart, since
   qnaBank.js is what the app actually reads at runtime and qnaStatus.js is
   the audit ledger describing why that status is trusted.

   Run:  node scripts/validate-qna-status.mjs
         exits 1 if any 'parked'/'answered' entry lacks a real verifiedBy,
         or if qnaStatus.js and qnaBank.js disagree on any module's status.
   ──────────────────────────────────────────────────────────────────────────── */
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const { QNA_STATUS } = await import(join(ROOT, 'src/data/qnaStatus.js'));
const { QNA_BANK } = await import(join(ROOT, 'src/data/qnaBank.js'));

let hardFailures = 0;
const counts = { draft: 0, parked: 0, answered: 0, other: 0 };

for (const [moduleId, entry] of Object.entries(QNA_STATUS)) {
  counts[entry.status] = (counts[entry.status] ?? 0) + 1;

  // cross-check against qnaBank.js's own status field (operational source of truth)
  const bankEntry = QNA_BANK[moduleId];
  if (!bankEntry) {
    hardFailures++;
    console.error(`✗ FAIL  "${moduleId}": present in qnaStatus.js but has no qnaBank.js entry at all.`);
    continue;
  }
  if (bankEntry.status !== entry.status) {
    hardFailures++;
    console.error(`✗ FAIL  "${moduleId}": qnaStatus.js says '${entry.status}' but qnaBank.js's own status field says '${bankEntry.status}' -- these must never drift apart.`);
    continue;
  }

  if (entry.status === 'draft') continue; // no receipt required at draft stage

  const receipt = entry.verifiedBy;
  const looksReal = typeof receipt === 'string' && receipt.length > 40 && /IST/.test(receipt) && !/^verified$/i.test(receipt.trim());
  if (!looksReal) {
    hardFailures++;
    console.error(`✗ FAIL  "${moduleId}": status is '${entry.status}' but verifiedBy is missing or not a real receipt (must be a string >40 chars, contain an IST timestamp). Got: ${JSON.stringify(receipt)}`);
  }
}

// also check: every qnaBank.js module has a qnaStatus.js entry (no silent gaps)
for (const moduleId of Object.keys(QNA_BANK)) {
  if (!QNA_STATUS[moduleId]) {
    hardFailures++;
    console.error(`✗ FAIL  "${moduleId}": present in qnaBank.js but missing from qnaStatus.js entirely.`);
  }
}

console.log('');
console.log(`Checked ${Object.keys(QNA_STATUS).length} qnaStatus.js entries against qnaBank.js (${Object.keys(QNA_BANK).length} entries).`);
console.log(`  draft: ${counts.draft}, parked: ${counts.parked}, answered: ${counts.answered}`);

if (hardFailures > 0) {
  console.error(`\n${hardFailures} FAILURE(S) — see above. Fix before committing.`);
  process.exit(1);
}
console.log('\nAll parked/answered entries have real receipts, zero drift from qnaBank.js. OK.');
