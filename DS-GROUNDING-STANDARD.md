# DS-GROUNDING-STANDARD.md — Design Studio Grounding Standard (provenance for judgment content)
### The missing axis: is the problem REAL, or just plausible?
Adopted 2026-07-22 (Track 0, DS remediation program).

Two other standards govern this content: `DS-CONTENT-STANDARD.md` (does a problem *teach* judgment well) and
each lab's own MCQ/distractor quality bar (is the wrong answer tempting). Neither asks: **is this problem
actually asked / actually real, or did the author invent something plausible?** That is a separate axis —
*grounding* — and this is its rubric.

---

## 0. Why this is its own axis

A problem can score perfectly on the Judgment Standard (process-modeled, tempting trap, production tell,
inevitable) and still be **fiction** — a beautifully-taught problem no interviewer actually asks, or a real
problem stripped of the constraint that makes it hard. Teaching quality and real-world fidelity are orthogonal.
You can have either without the other. Grounding governs the second.

Research backing: **authentic assessment** (Wiggins; Gulikers) — a task is authentic only when it mirrors real
professional situations *with their actual complexities, constraints, and ambiguities*, judged by criteria drawn
from real practice, not training-specific metrics. Ungrounded content fails ecological validity — it trains for a
world that doesn't exist.

**The tell already in the catalog:** the 429 root is tagged `JPMorganChase` because it came from a real
transcript. Roots tagged `companies: ["Any"]` were authored from priors with nothing sourced. `"Any"` is the
ungrounded flag.

---

## 1. Provenance tiers (every root declares one)

Grounding is not binary. Four tiers, strongest first:

- **G1 — Documented real interview.** Traceable to a specific real report: a transcript, a named-company
  Glassdoor / Blind / interviewing.io / IGotAnOffer account, a curated field-guide entry citing a real loop.
  *Gold.* Tag the exact source + date.
- **G2 — Documented real incident/pattern.** A real production failure mode from an engineering blog or
  postmortem (train-serve skew, retrieval precision collapse, retry storms). Ground = the incident/blog.
- **G3 — Domain-canonical, corroborated.** A problem the field agrees is core, appearing across **≥2
  independent** real question banks / guides. Corroboration, not a single blog's claim.
- **G4 — Plausible-but-invented.** Authored from priors, no external corroboration. Allowed **only** as a
  labeled variation/stretch — **never as a root**, and flagged for sourcing.

Rule: **a root must be G1–G3. G4 may only be a variation.** If a root can't clear G3, it isn't a root yet.

---

## 2. The grounding criteria (what each root must satisfy)

1. **Traceable provenance.** At least one real, citable source (G1/G2) or ≥2 corroborating guides (G3). No
   source → not a root.
2. **Faithful abstraction.** The problem keeps the real constraints that make it hard — actual numbers, real
   tradeoff, the failure mode really seen — not a sanitized textbook version.
3. **Currency.** Reflects what is asked *now*, with a `lastVerified` date. Interview fashion decays.
4. **Target signal.** Tagged to the companies/contexts that actually ask it. `"Any"` is only honest when a
   problem genuinely is universal *and* corroborated — otherwise it's a confession.
5. **Corroboration over single-source.** "Commonly asked" needs ≥2 independent real sources.
6. **Standard-from-practice.** The rubric anchors reward what a *real interviewer* rewards, not what a textbook
   lists.

Each is a binary property with a cover-test: *"Name the source. Does it exist? Does our version keep the hard
constraint the source describes? If not, fix or demote."*

---

## 3. Schema + UI hook

Add one field to every brief:

```
provenance: {
  tier: "G1" | "G2" | "G3" | "G4",
  sources: [ "LinkedIn: JPMorgan SAE 429 transcript (2026-07)", "..." ],
  companies: [ "JPMorganChase", ... ],   // real, not "Any"
  lastVerified: "2026-07"
}
```

A small **"grounded"** badge, driven by tier (G1/G2 solid, G3 hollow, G4 = "practice" label), lets the learner see
at a glance which problems are real loops vs practice stretches.

---

## 4. Sourcing pipeline

Grounding is a *harvest*, not an invention:

- **Curated field guides** — system-design question sets citing IGotAnOffer / DesignGurus / eng blogs.
- **Real-report aggregators** — Glassdoor, Blind, interviewing.io, Exponent question sets.
- **Engineering blogs & postmortems** — for G2 incident grounding.
- **A live LinkedIn/report stream** — the 429 case is the existence proof: a pasted transcript → a grounded,
  staff-level root in one pass.

Pipeline: harvest → dedupe → tag provenance + company + date → map each to a root (or spawn a new one) → author
to `DS-CONTENT-STANDARD.md` → adversarial-gate (`DS-ADVERSARY-GATE.md`). Freshness is a standing subscription:
re-verify tiers each quarter; a G1 with a dead/aged source decays to G3 or gets re-sourced.

---

## 5. Recommendation, adopted

1. **This standard is the third content axis**, alongside the Judgment Standard and the adversarial gate. Three
   questions per piece: *does it teach judgment* (Judgment), *would it survive a skeptic* (adversarial), *is it
   real* (Grounding).
2. **Add the `provenance` field + grounded badge** as part of the Track-2 remediation batches.
3. **Run a grounding pass over the roots**: cite ≥2 real sources each, verify faithful abstraction, set tier +
   company + date — or demote to variation. Roots that can't clear G3 aren't roots.
4. **Stand up the LinkedIn/report intake** (the 429 pipeline, generalized) as the ongoing freshness engine
   (Track 5 in `THE-Plan.md`).

## Sources
- [AI Engineering Field Guide — AI System Design questions](https://github.com/alexeygrigorev/ai-engineering-field-guide/blob/main/interview/questions/04-ai-system-design.md)
- [45+ AI Engineer Interview Questions (2026) — Exponent](https://www.tryexponent.com/blog/ai-engineer-interview-questions)
- [Every AI Engineer Interview Question… from 100+ Real Interviews (2026)](https://adilshamim8.medium.com/every-ai-engineer-interview-question-you-need-to-know-in-2026-from-100-real-interviews-b5b7ae4b961a)
- [GenAI & LLM System Design Interview Guide (2026) — PracHub](https://prachub.com/resources/genai-llm-system-design-interview-guide-2026)
- [Authentic Assessment Theory (Wiggins) — BCL Learning Library](https://bcltraining.com/learning-library/authentic-assessment-theory/)
- [Ecological validity in cognitive assessment — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11969399/)
