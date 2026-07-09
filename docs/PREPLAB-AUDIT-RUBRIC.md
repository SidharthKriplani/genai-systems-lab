# PREPLAB-AUDIT-RUBRIC.md — PrepLab question-bank smells, adversarial checklist

_Created 2026-07-09, companion to `PREPLAB-STANDARD.md` (the author's rules) — same relationship as
`CONTENT-AUDIT-RUBRIC.md` is to `3B1B-STANDARD.md`. This doc is what the adversarial auditor runs
against a finished question, blind to the author's reasoning. It is about answer-key correctness and
question construction, not prose voice — a question can pass every rule in this doc and still read
awkwardly, and that's a separate, lower-stakes problem._

## How to use it
Give the auditor ONLY the finished question object (id, topic, tier, band, question, options, correct,
explanation, trap/source/staffLayer if present) — never the author's notes or reasoning. First,
independently re-derive the correct answer: cover the `correct` field, answer the question cold using
real technical knowledge, then compare. Disagreement is itself a flag before any smell-by-smell check
even starts. Then run all 10 smells below.

## The 10 smells

**1. Defensible wrong answer.** More than one option is arguably correct depending on interpretation.
Tell: try to construct a real, reasonable scenario where each wrong option would actually be the right
call. Succeed for any of them → flag it.

**2. Trivial-elimination distractor.** A wrong option is absurd, off-topic, or exposed by
length/specificity/grammar cues alone, so the correct answer is guessable without any real topic
knowledge. Tell: cover the question stem — can you pick the correct answer from option phrasing/shape
alone?

**3. Fabricated attribution.** The `source` field claims a specific, real-sounding interview
provenance with no actual verification path. Tell: could this exact attribution be checked against a
real event? *Found in the current bank on first spot check: `rag-1`'s `source: "Microsoft RAG systems
interview, Round 1"` and `rag-2`'s `source: "Google DeepMind AI engineering screen"` — both read as
real provenance, neither is traceable to anything.*

**4. Fabricated or unverifiable statistic.** A specific number in the stem, options, or explanation
doesn't correspond to any checkable fact and isn't framed as hypothetical. Tell: can you trace this
number to a real source, or does it just sound plausible? Recompute any derived figure by hand —
"looks about right" is not verification.

**5. Difficulty-label mismatch.** The stated `band`/`tier` doesn't match the real cognitive demand — a
`staff-plus`-labeled question that's pure recall, or a `foundational` question that secretly requires a
three-concept tradeoff. Tell: would a real candidate at the stated level actually experience this as
the stated difficulty?

**6. Topic misfile.** The question's real content belongs to a different GYMS-aligned topic than the
one it's tagged with. Tell: check the tagged topic's real module list (per `PREPLAB-STANDARD.md`'s
taxonomy) — does a module for this actually live there?

**7. Explanation restates without teaching.** The `explanation` rephrases "the answer is B" without
stating the underlying mechanism. Tell: could a candidate who got this wrong learn the *why* from this
explanation, or only the *what*?

**8. Decorative paper citation.** A paper/author name appears with no pedagogical need — the question
isn't testing lineage knowledge and the claim doesn't need the citation for provenance of a specific
number. Tell: delete the citation — does the question or explanation lose anything real?

**9. Near-duplicate question.** Two or more questions in the same topic test the same fact via
near-identical phrasing or scenario. Tell: strip the surface wording and compare the underlying
fact-being-tested — is this the same question as one already in the bank? (High-priority smell for the
currently oversized topics — `agents` at 103 questions and `rag` at 96 are the most likely places to
find this.)

**10. Stale or wrong technical claim.** The question or explanation references outdated model behavior,
a deprecated API/tool, or is simply factually wrong when checked against current ground truth. Tell:
don't take the question's word for it — verify independently.

## Not covered by this rubric (separate, already-tooled or separately-owned problems)
- **MCQ length-tell** (correct answer guessable by option length alone across the *distribution* of
  questions, not a single one) — measured via `_verify_mcq_balance.mjs` / `_verify_prep_balance.mjs`,
  not by eye.
- **Prose voice/register** — PrepLab explanations are reference-grade, not narrative; `3B1B-STANDARD.md`
  doesn't apply here by design (see `PREPLAB-STANDARD.md`'s scope note).
- **UI/taxonomy presentation** (topic labels, group nav, role selector consistency across
  PrepLab.jsx/MockInterviewV2.jsx/MyTracks.jsx/OnboardingModal.jsx) — a code-level concern, tracked in
  the PrepLab rebuild plan's Phase 6, not a per-question content smell.

## Log
- 2026-07-09: created alongside `PREPLAB-STANDARD.md` after a full-bank taxonomy/quality review found
  798 questions across 40 unaligned topic strings, an 8-value difficulty vocabulary, inconsistent role
  vocabulary across the app, and (spot-checked, not yet systematically audited) at least 2 confirmed
  fabricated-attribution `source` fields. Not yet applied systematically to the bank — see the PrepLab
  rebuild plan for the batch order this gets run in.
