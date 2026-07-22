# DS-CONTENT-STANDARD.md — Design Studio Judgment Content Standard
### The authoring bar for Design Studio roots, variations, and coding-judgment (Dojo/Implement) exercises.
Adopted 2026-07-22 (Track 0, DS remediation program). Sibling standard to this repo's own `CONTENT-STANDARD.md`
(the 7 Teaching Principles) — that doc governs Foundations explanation content and is untouched by this one.
This doc governs a different genre: judgment content, where the goal is not "make a concept click" but "transfer
what a staff engineer decides, and why."

---

## 0. Why a separate standard from the 7 Teaching Principles

An earlier quantified-proxy rubric ("≥1 tradeoff, ≥1 trap, ≥1 number") was retracted — Goodhart bait: content can
hit all three counts and still be dead.

The 7 Teaching Principles are excellent at making a concept *inevitable and click* — a 3b1b spec for explanation.
But roots / staged scenarios / dojo exercises are not explanations. They teach **judgment**: what a staff engineer
*decides*, what tells them to, what they monitor, when they abandon an approach. That is procedural + strategic
knowledge in an ill-structured domain — a different genre with a different science. Content authored against the
7 Principles alone comes out as a beautiful explanation that still doesn't transfer judgment. This standard fills
that gap; it does not replace the 7 Principles.

---

## 1. The research base

- **Cognitive Apprenticeship** (Collins, Brown & Newman) — the canonical framework for teaching the tacit judgment
  of experts. Six methods (modeling, coaching, scaffolding+fading, articulation, reflection, exploration) and four
  content types: *domain knowledge, heuristic strategies, control (metacognitive) strategies, learning strategies.*
  Its central claim: the last three "distinguish experts and are exactly what conventional instruction leaves
  implicit." This product's job is to make those three explicit.
- **Productive Failure** (Kapur) — problem-solving *before* instruction produces deeper conceptual understanding
  and transfer than instruction-first, provided the attempt is followed by consolidation against an expert
  standard. Validates attempt-then-reveal as pedagogy, not UX garnish.
- **Worked-example & expertise-reversal effect** (Sweller, Kalyuga) — worked examples beat unguided
  problem-solving for novices; but as expertise grows, studying worked steps becomes *redundant and harmful* —
  experts need to solve, not read. The scientific mandate for the S1→S4 scaffold fade, and for *process*-oriented
  (not product-oriented) worked examples.
- **3Blue1Brown** (Sanderson) — concreteness before abstraction; enter through a specific problem; the
  *inevitability* test ("of course it had to be this way"); self-discovery ("you could have invented it");
  respect via authentic (not simplified) material.
- **MSL's own Content Quality Bar** — already research-adjacent: "would a mid-level engineer pick this wrong
  answer with confidence?", "scenario-specific reveal", "production tell." Kept and generalized below.

---

## 2. The Standard — 8 criteria, each a qualitative property with a cover-test

Not counts. Each is a binary "does it have this property," tested by covering part of the content and asking a
question — rewrite if the answer is wrong.

### C1 — Models the PROCESS, not the product *(Cognitive Apprenticeship: modeling)*
The worked reference shows the expert *reasoning*: the decision, the tell that triggered it, and at least one
**rejected alternative and why**. Expert modeling includes false starts made visible — not a polished list of
correct nouns.
**Test:** Strip every conclusion. Is there a visible reasoning line — "saw X (the tell) → reached for Y → *not*
the tempting Z, because…" — or just correct answers stated? Correct-nouns-only fails.

### C2 — Surfaces STRATEGIC knowledge, not just domain facts *(Cognitive Apprenticeship: heuristic + control)*
Beyond "use a reranker," names the **heuristic** (the trick/tell that makes an expert reach for it) and the
**control move** (what they monitor to know it's working, when they'd abandon it).
**Test:** Does it answer "how did the expert *know* to do this, and what would make them change course?"
WHAT-only, with no how-they-knew / when-to-switch, fails.

### C3 — The wrong path genuinely tempts a SENIOR *(MSL Bar + Productive Failure)*
The trap / distractor / naive path is one a competent mid-level+ engineer picks with confidence — not a novice
error dressed up.
**Test:** Would a mid-level engineer at a real company choose it during a live loop? If only a novice would, it
tests recall — cut or rewrite.

### C4 — Inevitability, arrived at not introduced *(3b1b inevitability + CA global-before-local)*
The correct decision lands as the learner's *forced conclusion* after the naive path is closed — "of course." The
full arc is visible before drilling any part.
**Test:** Does the mechanism/decision appear AFTER the constraint that demands it, or is it declared then
back-justified? Declared-then-justified fails.

### C5 — Produce before reveal *(Productive Failure; desirable difficulties)*
The learner commits a concrete attempt before any reference is shown. The reference is *consolidation*, not first
contact.
**Test:** Can the learner reach the worked reference without having produced an attempt? If yes, gate the reveal.

### C6 — Objective anchor for reflection, scenario-specific *(CA: articulation + reflection; MSL Bar)*
Self-critique compares the learner's **concrete artifact** against a **specific** standard — "point to the
line/number/decision that does X" — never "did you address X?". Names *this* failure in *this* context.
**Test:** Delete the scenario title. Does the anchor/reference still make sense? If yes, rewrite until it only
fits this scenario.

### C7 — Production tell *(MSL Bar + CA control strategies)*
Ties the failure to what it looks like in a live system — an observable signal.
**Test:** Does it reference something observable (a dashboard signal, a log line, a degradation pattern, an
alert)? If not, add it.

### C8 — Authentic difficulty, fading correctly *(3b1b respect + expertise-reversal + Ericsson)*
Real material at the target level, no talking down; difficulty calibrated to the edge of ability, with scaffold
that *fades* across variations (worked-heavy early, problem-only late).
**Test:** Would a staff engineer find it authentic? Does the worked support genuinely shrink S1→S4, not just the
prose length?

---

## 3. The writer–adversarial loop

- **Writer** authors against C1–C8.
- **Adversary** attacks, criterion by criterion, and must return a specific charge or an explicit pass:
  - C1: "This is product, not process — here's the reasoning it hides."
  - C2: "Domain fact only — the heuristic/control strategy is missing here."
  - C3: "This distractor is a novice error; a senior would never pick it."
  - C4: "The decision is declared then justified — not inevitable."
  - C6: "This anchor is vibes / this reference survives the title-deletion test → too generic."
  - C7: "No production tell — this could be a flashcard."
- **Ship gate:** content ships only after the adversary returns pass on every criterion, or the writer revises.
  Log the adversary's charges so failure *patterns* are visible across the catalog.
- **Execution mechanism for this repo:** see `DS-ADVERSARY-GATE.md` — the adversary role is filled by Fable Pass-2
  (full pass, not sampling, for DS content), not a separate blinded sub-agent.

---

## 4. What this predicts about content authored before this standard existed

Applying C1–C8 to the roots authored before this standard: **C1 fails widely** (worked references are product —
numbered correct-answer lists — not process). **C2 fails widely** (domain facts given, heuristic/control strategy
missing). **C7 partial** (staged scenarios have production tells; roots mostly didn't). **C3, C6 partial** (some
anchors objective, many "did you address X?"). This is the exact shape `FullAudit-AllRoots.md` found — this
standard would have caught it up front, which is the point of having it in-repo now.

## Sources
- [Cognitive Apprenticeship: Methods and Evidence](https://cognitivepsychology.com/Cognitive_Apprenticeship)
- [Cognitive Apprenticeship (Collins et al.) — Learning Theories](https://learning-theories.com/cognitive-apprenticeship-collins-et-al.html)
- [Cognitive Load and Expertise Reversal — Cambridge Handbook of Expertise](https://www.cambridge.org/core/books/cambridge-handbook-of-expertise-and-expert-performance/cognitive-load-and-expertise-reversal/03F656FD334F23214426ACB4118FEBF9)
- [The worked example and expertise reversal effect in less-structured tasks](https://www.sciencedirect.com/science/article/abs/pii/S0361476X12000677)
- [Productive Failure in Learning Math — Kapur (2014), Cognitive Science](https://onlinelibrary.wiley.com/doi/10.1111/cogs.12107)
- [When Problem Solving Followed by Instruction Works — Sinha & Kapur (2021)](https://journals.sagepub.com/doi/10.3102/00346543211019105)
- [Lessons from Grant Sanderson (3Blue1Brown)](https://www.antoinebuteau.com/lessons-from-grant-sanderson/)
- [About | 3Blue1Brown](https://www.3blue1brown.com/about/)
