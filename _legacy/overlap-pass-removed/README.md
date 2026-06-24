# _legacy/overlap-pass-removed — everything cut in the overlap pass

D-18 archive, created **retroactively** (Jun 2026). Honest note: the cuts were originally deleted *in-place* (not moved here as D-18 requires); this folder restores compliance — every removed line is now preserved here, browsable, and recoverable.

**Recovery point:** git tag `pre-overlap-baseline` holds the full pre-cut state.

## What's here

For each source file that had content removed, two files:
- `*.removed.diff` — the exact `git diff pre-overlap-baseline` (complete, restorable with `git apply -R`).
- `*.removed.txt` — the removed lines only, de-prefixed (browsable).

| File | Removed content |
|---|---|
| `src_data_preplabQuestions.js.removed.*` | 5 duplicate PrepLab questions (ctx-q2, agents-1, dep-q1, ft-2, safety-1) + 16 orphan `staffLayer` notes from scenario-1 |
| `src_systems_modules.jsx.removed.*` | PromptCaching module (PromptCachingHowItWorks, PromptCachingSavings, PromptCaching) + MultimodalSystems + MultimodalArchitectures functions |
| `src_Systems.jsx.removed.*` | Registry / import / related-GT refs for promptcaching + multimodal2 |
| `src_Consultation.jsx.removed.*` | Search-index entries for promptcaching + multimodal2 |
| `src_groundTruthPosts.js.removed.*` | 2 dead duplicate GT post bodies (vector-databases-compared old version, fine-tuning-evaluation old version) |

## How to recover anything

```bash
# Restore a whole file's removed content:
git apply -R _legacy/overlap-pass-removed/<file>.removed.diff

# Or read the removed content directly:
cat _legacy/overlap-pass-removed/<file>.removed.txt

# Or pull the exact pre-cut file from the tag:
git show pre-overlap-baseline:src/systems/modules.jsx
```

## Borrow/merge re-audit — status

A second pass is checking each removed item against what it was claimed to duplicate, to confirm no *unique* content was lost (and to borrow/merge anything that was). Known items to verify:
- **vector-databases-compared (old):** had a RAG Lab CTA + prerequisite callout the kept version lacks → candidate to borrow into the live post.
- **fine-tuning-evaluation (old):** had a "three evaluation layers" framework; kept version focuses on hidden-cost/forgetting → check for unique value.
- **PromptCaching:** confirm its Savings/How-It-Works weren't a distinct implementation vs PromptCachingLab.
- **MultimodalArchitectures:** confirm its content is covered by MultimodalAI's Architecture tab.
- **16 staffLayer notes:** confirm each is duplicated on its rightful question (restore any that are unique).

Findings + any restores are tracked in the commit history of this audit.
