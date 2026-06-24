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

## Borrow/merge re-audit — COMPLETE

Every removed item was diffed against its kept counterpart. Verdicts:

| Item | Verdict | Action |
|---|---|---|
| **MultimodalArchitectures** | had unique content (CLIP/LLaVA/native taxonomy) — wrongly cut as "orphan" | **RESTORED** as a "Model Types" tab in MultimodalAI (`9bd5c7b`) |
| **vector-databases-compared (old)** | had a unique RAG Lab CTA + prerequisite callout | **RESTORED** into the live post (`678f29b`) |
| **fine-tuning-evaluation (old)** | had a unique "three evaluation layers" framework + LLM-judge template | **MERGED** into the live post (`a9643a9`) |
| **PromptCaching** | **genuine duplicate** — its Savings calc == the Lab's Cost Calculator (same function, different framing) | **stays archived** — the cut was correct |
| **16 (+2) staffLayer notes** | unique writing, but fuzzy orphans never cleanly tied to a question | **preserved** in `senior-framings.md` (NOT bulk-matched into the 591-question bank — too error-prone; redistribute deliberately, one at a time) |

**Net:** of 5 audited removals, 3 had unique content (all borrowed back), 1 was a true duplicate (correctly cut), 1 is preserved as reference. Nothing of value was lost from the live app.

See `senior-framings.md` for the 18 recovered staff framings.
