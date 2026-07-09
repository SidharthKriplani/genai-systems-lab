# PrepLab question bank rebuild — execution plan

_Created 2026-07-09. Companion to `PREPLAB-STANDARD.md` (author rules) and `PREPLAB-AUDIT-RUBRIC.md`
(adversarial checklist). This is the phase-by-phase plan for actually applying those two docs to the
798-question bank across `src/data/preplabQuestions.js` + `src/data/questions/*.js`, plus the UI code
that presents the taxonomy. Same discipline as the GSL RUNNER_DATA batches (3a/3b): sequential,
batch-by-batch, GSL_PLAN.md updated after each batch, git commands handed off, wait for push
confirmation before the next batch._

## Phase 0 — Standards lock (this deliverable)
`PREPLAB-STANDARD.md` and `PREPLAB-AUDIT-RUBRIC.md` drafted. Needs your sign-off before Phase 1 starts
— these are the rules every later phase is checked against, so getting them right now is cheaper than
re-deriving mid-batch.

## Phase 1 — Schema & taxonomy migration (mechanical, scriptable, low-risk)
Purely structural, no content rewriting yet:
- Build the explicit old-topic → new-topic mapping table (all 40 raw strings → the 18-value taxonomy).
- Script the `topic` field rewrite across `preplabQuestions.js` + the 7 `question/*.js` files.
- Merge the `evals` duplicate into `evaluation`.
- Introduce the `band` field via an explicit legacy-`difficulty`→`band` mapping table. This can't be
  fully mechanical — `staff`/`daunting` don't map 1:1 to a single band without looking at the actual
  question, so this step needs a lightweight per-question judgment pass, not just a find/replace.
- Verify: every question has exactly one topic from the 18-value set, per-topic counts sum correctly,
  esbuild-clean on every touched file.
- Risk: low (no answer-key content changes) — but touches every one of 798 questions, so verification
  needs to be as rigorous as any RUNNER_DATA splice (exact-match counts before/after, spot-checked
  samples per topic).

## Phase 2 — Dedup pass on oversized topics
Before spending audit effort on possibly-redundant content, thin the biggest topics:
`agents` (103), `rag` (96), `llmops` (53), `llm-fundamentals` (45), `nlp` (40). Apply rubric smell #9
(near-duplicate) systematically — cluster questions by the underlying fact tested, flag near-duplicates,
decide keep/merge/cut per cluster, log what was removed and why. This phase shrinks total volume before
Phase 3 rather than adding to it.

## Phase 3 — Correctness + rubric audit, batch by topic (the main event)
Sequential, one topic (or small cluster of related small topics) per batch, same author+adversarial
two-pass loop as `PREPLAB-STANDARD.md`'s enforcement section. Order — largest/highest-traffic first,
matching the original risk-prioritization: `agents` → `rag` → `llmops` → `llm-fundamentals` → `nlp` →
`evaluation` → `finetuning` → `safety` → the remaining technical topics → `product`/`behavioral`/
`leadership`. After each batch: update `GSL_PLAN.md`, hand off git commands, wait for push confirmation
before starting the next — identical discipline to RUNNER_DATA batches 3a/3b.

## Phase 4 — Volume gap-fill
Once a topic's existing questions are audited (Phase 3) and deduped (Phase 2), check it against the
floor (8-12 questions, ~30/40/25/5 split across foundational/intermediate/advanced/staff-plus). Author
new questions where under floor — through the full two-pass process, never skipped just because the
content is new. Currently thinnest: `production` (6), `quantization` (4), `evals`→merged-into-
`evaluation` (2 to fold in).

## Phase 5 — `source`-field cleanup
Folded into each Phase 3 batch's adversarial pass (rubric smell #3) rather than a standalone phase —
called out separately here because of how prevalent it looks on first spot check (2 confirmed
fabricated attributions in the first 2 questions read). Expect this to be one of the highest-volume
single findings across the whole bank.

## Phase 6 — UI/taxonomy alignment (separate in kind — real code, not data)
`PrepLab.jsx`'s `TOPIC_LABELS`/`TOPIC_GROUPS`, `MockInterviewV2.jsx`'s `TOPIC_LABELS`,
`MyTracks.jsx`'s `TOPIC_LABELS`, and the role vocabulary mismatch between `OnboardingModal.jsx`
(AIE/Applied Scientist/MLOps/AIPM) and PrepLab's JD-prep-mode role selector (AI Engineer/ML Engineer/
AI PM/Research Scientist) all need to converge on the same 18-topic + 5-role taxonomy. This is
component code, not question data — the same kind of separate, larger engineering effort that scene-
building was for RUNNER_DATA. Flagging it explicitly rather than silently bundling it into the data
batches.

## Open decisions before Phase 1 starts
1. Does Phase 1's mechanical migration proceed as its own batch (with its own GSL_PLAN.md entry + git
   handoff), or fold into the start of Phase 3's first batch?
2. Is Phase 6 (UI code) in scope for this initiative now, or deferred as a separately-scoped follow-up
   — same treatment as scenes got for RUNNER_DATA?
3. Phase 2's dedup decisions (what counts as "close enough to cut") — spot-check a sample with you
   before running it across all 5 oversized topics, or trust the rubric's smell-9 tell and proceed?
