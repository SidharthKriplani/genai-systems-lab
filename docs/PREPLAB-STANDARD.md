# PREPLAB-STANDARD.md — the author standard for PrepLab interview questions

_Created 2026-07-09. House standard for authoring/repairing questions in GSL's PrepLab question bank
(`src/data/preplabQuestions.js` + `src/data/questions/*.js`). Sibling doc to `3B1B-STANDARD.md`
(narrative voice) and `CONTENT-AUDIT-RUBRIC.md` (content smells) — same author/adversarial enforcement
pattern, different subject: this doc governs answer-key correctness and question construction, not
prose voice. Companion doc: `PREPLAB-AUDIT-RUBRIC.md` (the adversarial's checklist)._

## Why this exists
A full-bank review (2026-07-09) found the question bank had grown to 798 questions across 40 raw
`topic` strings with no consistent taxonomy, an 8-value difficulty vocabulary
(`easy/medium/hard/beginner/beginner-intermediate/intermediate/staff/daunting`) layered awkwardly
against a separate 3-value depth tier (L0/L1/L2), a role dimension that exists in two different,
mutually inconsistent forms elsewhere in the app (onboarding vs. JD-prep-mode), and — found by spot
check, not yet systematically audited — questions carrying `source` fields with specific,
unverifiable interview attributions (`"Microsoft RAG systems interview, Round 1"`,
`"Google DeepMind AI engineering screen"`). This doc is the fix for "how a question should be built";
`PREPLAB-AUDIT-RUBRIC.md` is the fix for "how we catch it when one isn't."

## The taxonomy (tag every question against this — no ad hoc strings)

**Topic** — 19 values, aligned to the platform's own existing `GYMS` taxonomy in `Concepts.jsx`
(the same grouping already used for the real content-module library, so a question's topic is
traceable to a real module):
- 15 technical: `nlp-foundations`, `language-models`, `retrieval`, `ai-agents`, `evaluation`,
  `production`, `foundation-models`, `prompt-engineering`, `vector-infrastructure`, `multimodal`,
  `ai-safety-alignment`, `voice-ai`, `code-generation`, `inference-optimization`, `model-customization`.
- 1 technical, outside GYMS by amendment: `sysdesign` — system-design-interview framing (architecture
  tradeoffs across a full stack, not a single GYMS track). Doesn't fit any GYMS track cleanly, but
  `Career.jsx`'s own `CAREER_MODULES` already treats Design Studio as a distinct first-class module, so
  this mirrors a real product surface rather than inventing one. (Surfaced during Phase 1 migration,
  2026-07-09 — the original 18-value taxonomy in this doc's first draft didn't include it; amended here.)
- 3 non-technical (career/soft-skill, outside GYMS by design — mirrors the platform's own separate
  Career.jsx/AIPM.jsx apps): `product`, `behavioral`, `leadership`.

A sub-concept (GQA, MQA, RoPE, DPO, LoRA, tokenizer internals, quantization schemes, etc.) is never
its own topic — it lives inside its parent GYMS track (e.g. GQA/MQA/RoPE all tag `language-models`;
DPO/LoRA/quantization/MoE/distillation all tag `foundation-models`). If you're tempted to create a new
topic string, first check whether a GYMS track already covers it — it almost certainly does.

**Depth (`tier`)** — keep the existing 3-value scale, it's already clean:
- `L0` — Define: "what is X, in one correct sentence."
- `L1` — Deep: single-concept mastery, one level past the definition.
- `L2` — Cross-concept: comparison/tradeoff across two or more concepts.

**Seniority band (`band`, new field, replaces the 8-value difficulty soup)** — 4 values, each with a
falsifiable test of what it's actually measuring:
- `foundational` — tests correct recall and straightforward application. A candidate either knows this
  or doesn't; there's no scenario-reasoning required.
- `intermediate` — tests reasoning about a concrete scenario or debugging a stated symptom, using one
  or two concepts together.
- `advanced` — tests diagnosis/design under an ambiguous or under-specified production scenario, or a
  tradeoff across three-plus concepts.
- `staff-plus` — tests a judgment call with named second-order consequences the candidate must reason
  through explicitly (not just "what's the right answer" but "what breaks if you're wrong, and why").

The legacy `difficulty` field (easy/medium/hard) may stay for backward UI compatibility but `band` is
the source of truth going forward; a migration table maps every legacy value to exactly one `band`.

**Role (optional framing tag, not a content filter)** — one of `aie` (AI/ML Engineer), `fde` (Forward
Deployed Engineer), `research` (Applied/Research Scientist), `mlops` (MLOps/Platform Engineer), `aipm`
(AI Product Manager), or omitted entirely when a question is role-agnostic (most pure-technical MCQs
are, and should stay untagged rather than force-assigned). Role changes the *angle* a question is asked
from — `aie`: "how would you implement/fix X"; `fde`: "a client says X is broken in production right
now, what do you do"; `research`: "why does X work / what's the theoretical failure mode"; `mlops`:
"how do you scale/monitor/operate X"; `aipm`: "how do you decide whether to ship X." Do not duplicate a
question across roles just to have role coverage — only add a role tag when the framing genuinely
changes the question, not the underlying fact being tested.

## Volume floor (per topic, not per topic×band×role — see build plan for how this gets hit)
Each of the 19 topics: minimum 8-12 questions, roughly distributed 30% foundational / 40% intermediate
/ 25% advanced / 5% staff-plus. This is a floor, not a target — a topic that's already well above it
(current `agents`=103, `rag`=96) needs a dedup pass before more volume is added, not more volume.

## Author rules (apply every one before calling a question done)
1. **Answer-key correctness, verified not assumed.** The `correct` option must be independently
   re-derivable from real technical fact — check it against a canonical source (official docs, the
   original paper, well-established practitioner consensus) before marking it, not from memory or gut
   feel. If you can't point to why it's right, it isn't ready.
2. **Distractors are plausible misconceptions, not strawmen.** Every wrong option must be something a
   real, reasonably-prepared candidate could actually believe — tied to a genuine partial understanding
   or common mistake. No option should be absurd, off-topic, or eliminable by length/specificity/
   grammar alone.
3. **One unambiguous answer per MCQ.** No wrong option may be defensibly correct under a different but
   reasonable reading of the question. If a tradeoff genuinely has more than one defensible answer, use
   the multi-select format (`correct: [i, j]`) explicitly — don't force an ambiguous case into a
   single-answer shape.
4. **Topic fidelity.** Tag to exactly one of the 19 topics above, and verify the fit by checking the
   question's actual content against that topic's real GYMS module list (or the real scope of
   product/behavioral/leadership) — not by feel.
5. **Depth and band fidelity.** `tier` and `band` must match the actual cognitive demand (see the
   taxonomy definitions above) — a `staff-plus`-labeled question that's really rote recall, or an
   `foundational` question that secretly requires a three-concept tradeoff, is a defect even when the
   content itself is otherwise fine.
6. **No fabricated numbers.** Every statistic, percentage, cost figure, or benchmark number in the stem,
   options, or explanation must be a well-established, checkable fact, or explicitly framed as a
   hypothetical ("Assume a system reports X%...") — never presented as a specific real result with no
   real source.
7. **No fabricated attribution.** The `source` field, when present, may only name something actually
   verifiable. Do not invent a specific company/round attribution. Default to omitting `source`
   entirely; use a generic style descriptor ("common system-design framing") if attribution-flavor is
   wanted without claiming a false specific provenance.
8. **The explanation teaches the mechanism, not just the label.** State WHY the correct answer is
   correct — the causal/mechanical reason — and, where it adds value, why the strongest distractor is
   wrong. Restating the correct option in different words is not an explanation.
9. **`trap`/`staffLayer` fields describe a real failure pattern.** These exist to name a genuine,
   generalizable way candidates go wrong — not an invented strawman that flatters the correct answer.
10. **Self-contained stem.** A candidate with the topic's stated prerequisite knowledge must be able to
    answer using only what's in the question stem — no reliance on unstated context.
11. **Cite a paper only when it earns its place.** Name a paper/author only when the question is
    explicitly testing lineage/attribution knowledge, or the explanation's claim genuinely needs the
    citation for provenance of a specific number — never as decoration.
12. **Check for near-duplicates before adding.** Before adding a question, verify it doesn't test the
    same fact via near-identical phrasing as an existing question in the same topic.

## Definition of done (a single question is not "fixed" until all of these hold)
1. All 12 author rules above satisfied.
2. Adversarial pass (`PREPLAB-AUDIT-RUBRIC.md`) run and passed clean, or — after 3 loops — surfaced
   explicitly to a human rather than looped indefinitely.
3. Schema complete and internally consistent: `id`, `topic` (one of the 19), `tier`, `band`, `type`,
   `question`, `options`+`correct` (MCQ) or `keywords` (text), `explanation` all present; `correct`
   index in-bounds; `id` unique in the bank.
4. Lint-verified (id uniqueness, correct-index bounds, required-field presence) before merge — a cheap
   mechanical check, not a substitute for the adversarial pass.

## Enforcement: author + adversarial two-pass process
Mirrors `3B1B-STANDARD.md`'s enforcement mechanism exactly, because the same failure mode applies here:
a writer re-checking its own draft doesn't reliably catch its own blind spots.

**Pass 1 — Author.** Apply this entire document to write or repair the question. Nothing new to add —
the rules above already say what "correct" looks like.

**Pass 2 — Adversarial auditor, run as a genuinely separate agent/context.** Give it ONLY the finished
question object — id, topic, tier, band, question, options, correct, explanation, trap/source if
present — never the author's reasoning. Its job: run the full `PREPLAB-AUDIT-RUBRIC.md` checklist and
find violations, not summarize or praise. Critically, the auditor must independently re-derive the
correct answer BEFORE looking at which option is marked `correct` — cover it, answer fresh, then
compare. If the auditor's independent answer disagrees with the marked answer, that is itself a flag,
regardless of what the rubric checklist finds.

**The loop.** Violations go back as a targeted fix — the flagged question only, not a full re-author of
the topic — then Pass 2 re-runs on the revision. Repeat until clean, or after 3 loops surface what's
left to a human. Only a question that passed Pass 2 clean should ship.

## Mechanics
- Full field list per question: `id, topic, tier, band, difficulty(legacy), gated, type, question,
  options, correct, keywords, explanation, trap, source, staffLayer, readMore, role(optional), cluster`.
- Verify edited files with esbuild after every batch (`npx esbuild <file> --bundle --format=esm
  --outfile=/dev/null`), same as the RUNNER_DATA workflow.
- `evals` and `evaluation` are the same topic — `evals` is a legacy duplicate to be merged, not a
  distinct additional topic.
