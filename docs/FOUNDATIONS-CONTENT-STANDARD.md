# FOUNDATIONS CONTENT STANDARD
## GenAI Systems Lab — Authoritative spec for all Foundations runner modules

_Locked before content is written. Every module is built against this. Audit uses the rubric at the bottom._

---

## 1. LEARNER BASELINE ASSUMPTION

Every module is written for a learner who has:

**Has:**
- High school algebra — variables, equations, simple functions
- Basic probability — what a distribution is, expected value, roughly what a percentage means
- One programming language at a beginner level — knows what a loop, a function, and an array are (no specific language assumed)
- Intuitive understanding of what a neural network "does" at a black-box level (takes input, produces output)

**Does NOT have:**
- Calculus (no derivatives, no integrals unless introduced inline)
- Linear algebra beyond dot product and matrix as a table of numbers
- Any ML framework knowledge (no PyTorch, TensorFlow, HuggingFace)
- Any prior exposure to transformer architecture or LLM internals

**Rule:** If a module requires knowledge beyond baseline, introduce it in a single sentence before using it. Do not assume. Example: if attention requires dot product, spend one sentence on what a dot product means physically before using it in the equation.

---

## 2. DEPTH TIERS

Every module is pre-tagged with a depth tier. The tier drives paragraph count, equation presence, and interactive requirement.

### LIGHT
- **Use when:** The concept is a mechanism or definition, not a mathematical idea. Understanding the what is sufficient; the how is secondary.
- **Explanation:** 2 paragraphs (what it is, why it matters)
- **Equations:** None required. Intuitive analogies preferred.
- **Interactive:** Required — even a simple labelled diagram or slider counts.
- **Examples:** tokenizer, sampling (surface level), embedding as a concept

### STANDARD
- **Use when:** The concept has a mechanism worth understanding but full derivation is not necessary to use the knowledge well.
- **Explanation:** 3–4 paragraphs (what, how, why it was designed this way, failure mode or trade-off)
- **Equations:** 1–3 simple expressions, each immediately explained in plain English. No derivations.
- **Interactive:** Strongly preferred. Borrow from Explore where available.
- **Examples:** attention (at a high level), embeddings (cosine similarity), retrieval chunking, prompt structure

### DEEP
- **Use when:** The concept cannot be correctly understood without the math. Intuition without mechanism produces wrong mental models that cause production errors.
- **Explanation:** 4–6 paragraphs OR 3 paragraphs + an equation block showing the step-by-step process
- **Equations:** Required. Iterative form preferred (show the before/after of one update step). Every symbol defined. Every equation explained in plain English on the line below it.
- **Interactive:** Required — must show the math in motion (loss decreasing, weights updating, attention score changing).
- **Examples:** transformer (full architecture), training signal / gradient descent, loss functions, attention (full scaled dot-product), KV cache mechanics

---

## 3. EQUATION FORMAT

**No MathJax dependency.** Equations live in the explanation as plain text or inline code.

### Format rules

Simple inline expressions — use backtick code:
```
loss = -log(p_correct)
```

Step-by-step derivations — use a fenced block with line-by-line annotation:
```
prediction = model(input)           ← forward pass
loss = -log(prediction[correct])    ← how wrong were we?
gradient = d(loss)/d(weights)       ← direction to fix weights
weights = weights - lr × gradient   ← one update step
```

**After every equation block, one plain-English sentence summarising what just happened is mandatory.** Example: "In words: the model measures how wrong it was, calculates which direction to nudge each weight, and takes a small step in that direction. Repeat 10,000 times."

**Symbol table:** Any symbol used more than once across a module must be defined on first use in brackets. `lr (learning rate — controls step size)`.

---

## 4. INTERACTIVE STEP POLICY

The Interactive step (Step 3 of PAL) must deliver something the learner can manipulate. Empty or static text is not acceptable.

**Priority order:**
1. **Borrowed viz** — use an existing Explore component if one covers the concept. These already exist for: tokenizer, attention, 3D attention, embeddings cosine similarity, transformer, diffusion. Prefer these — they are polished and tested.
2. **Custom inline widget** — for concepts without a borrowed viz, spec a React component in the module data (sliders, animated counters, step-through loops). Keep it under 80 lines.
3. **Annotated step-through** — static diagram with numbered callouts and a "Next step →" button that reveals each callout. Last resort but still interactive.

**Never:** leave Step 3 as a paragraph of text with the heading "Interactive." If a true interactive cannot be built in time, mark the module as `interactiveStatus: "pending"` and ship Step 3 as an annotated step-through with a "full animation coming" note.

---

## 5. INTERVIEW WEIGHT

Every module is tagged HIGH / MEDIUM / LOW. This is surfaced in the UI so learners can prioritise.

**HIGH** — Directly tested in senior/staff ML engineering or AI product interviews. Expect a definition question, a "how does it work" question, or a failure-mode question on this topic.

**MEDIUM** — May come up as a follow-up or in system design context. Important for completeness and depth signalling but not a primary interview target.

**LOW** — Contextual knowledge. Rarely tested directly. Worth knowing to avoid embarrassment or to answer a tangential question confidently.

Tag is not a quality signal. A LOW module is not less important to the platform — it is less important to interviews specifically.

---

## 6. MODULE STRUCTURE (canonical 5-step PAL)

Every module follows this structure exactly. No step is optional.

| Step | Name | Purpose | Minimum viable content |
|------|------|---------|----------------------|
| 1 | Production Scenario | Grounds the abstract concept in a real failure mode the learner will encounter as a practitioner | 2–3 sentences. Specific, not generic. Names a company size/context, a failure symptom, a consequence. |
| 2 | Concept Explanation | Builds the mental model from baseline up | Paragraph count and equations per depth tier above |
| 3 | Interactive | Makes the mechanism tangible and manipulable | Per interactive policy above |
| 4 | Quick Check (MCQ) | Forces retrieval and surfaces misconceptions | 4 options. 1 correct. 1 common misconception as a distractor. Explanation for ALL 4 options (not just the correct one). |
| 5 | Key Takeaway | Locks in the one thing that must survive after the module is forgotten | 1–2 sentences max. Practitioner framing, not textbook framing. Starts with the implication, not the definition. |

---

## 7. DEPTH JUSTIFICATION POLICY

Depth tier for each module must be justified in the module spec data with a one-line rationale. Example:

```js
depthTier: "deep",
depthRationale: "Wrong mental model of gradient descent causes systematic production errors in fine-tuning — intuition alone is insufficient.",
```

This rationale is not shown to learners. It is used during audit to decide if the tier is appropriate.

---

## 8. BEGINNER / ADVANCED DUAL-MODE

The runner currently has one path. Until a dual-mode UI is built, the standard is:

- **Explanation step** is written for the baseline learner (LIGHT/STANDARD) or one step above (DEEP at Standard, with equations as expandable)
- **Takeaway** is always practitioner-level, not beginner-level (the beginner can grow into it)
- **MCQ distractor design** — one of the four options must be the answer a competent-but-wrong engineer would give (not just a random wrong answer). This stretches the ceiling without changing the floor.

When dual-mode is built: STANDARD modules get a "Show me the math" expansion. DEEP modules get a "Skip the derivation" summary path. The data model should anticipate this with optional `mathBlock` and `summaryPath` fields even if the UI doesn't use them yet.

---

---

# EVAL RUBRIC

_Used to audit any module against this standard. Score each dimension PASS / FLAG / FAIL with a note._

## How to score

**PASS** — Meets the standard. No action needed.  
**FLAG** — Present but below standard. Needs revision before ship.  
**FAIL** — Missing entirely or so far below standard it cannot be revised without a rewrite.

A module must have zero FAILs and no more than 2 FLAGs to be considered shippable.

---

## DIMENSION 1 — Existence Justification
**Question:** Does this module have a clear reason to exist?

| Score | Criteria |
|-------|----------|
| PASS | Module covers a concept that (a) appears in real production failure modes, (b) is not covered by another module, and (c) is at the right level of granularity for the track |
| FLAG | Module exists but overlaps significantly with another, or its scope is unclear |
| FAIL | Module is present for completeness only, not because it earns its place |

---

## DIMENSION 2 — First Principles Compliance
**Question:** Does the explanation respect the baseline learner assumption?

| Score | Criteria |
|-------|----------|
| PASS | Every concept introduced builds from baseline. Any above-baseline term is defined inline on first use. |
| FLAG | One or two terms assumed without definition. Fixable with an inline sentence. |
| FAIL | Explanation requires background the baseline learner does not have and does not introduce it. A beginner would be lost by paragraph 2. |

---

## DIMENSION 3 — Depth Tier Appropriateness
**Question:** Is the assigned depth tier right for this concept?

| Score | Criteria |
|-------|----------|
| PASS | Depth tier matches the concept's complexity. A DEEP module would produce wrong mental models without equations. A LIGHT module is genuinely conceptual and equations would add noise. |
| FLAG | Tier is defensible but borderline. Note the reasoning. |
| FAIL | Tier is clearly wrong. A DEEP concept has been written as LIGHT (equations needed, none present), or a LIGHT concept has been padded to DEEP (equations present but add nothing). |

---

## DIMENSION 4 — Explanation Quality
**Question:** Does the explanation build the right mental model?

| Score | Criteria |
|-------|----------|
| PASS | Explanation follows the correct paragraph count for tier. Each paragraph advances understanding. A learner who reads it could explain the concept to a peer. No textbook filler. |
| FLAG | Correct length but at least one paragraph is vague, circular, or adds no new information. |
| FAIL | Explanation is shorter than required for tier, or so abstract that no concrete mental model emerges. |

---

## DIMENSION 5 — Equation Coverage
**Question:** Are equations present where the depth tier requires them, and are they correctly explained?

| Score | Criteria |
|-------|----------|
| PASS | LIGHT: no equations (correct). STANDARD: 1–3 simple expressions, each explained. DEEP: full equation block with step-by-step annotations, every symbol defined, plain-English summary after. |
| FLAG | Equations present but at least one symbol undefined, or plain-English summary missing. |
| FAIL | DEEP module has no equations. OR equations are present in a LIGHT module where they add confusion. OR equations present but unexplained. |

---

## DIMENSION 6 — Production Scenario Quality
**Question:** Is the scenario specific, real, and failure-mode-driven?

| Score | Criteria |
|-------|----------|
| PASS | Names a context (company size/type), a specific symptom, a measurable consequence. Could plausibly appear as a real Slack message from an on-call engineer. |
| FLAG | Present but generic ("a model might underperform"). Fixable by adding specificity. |
| FAIL | Missing entirely, or so abstract it provides no grounding ("this concept is important in production"). |

---

## DIMENSION 7 — Interactive Step
**Question:** Does the interactive step meet policy?

| Score | Criteria |
|-------|----------|
| PASS | Learner can manipulate something. Mechanism is visible in response to their action. For DEEP modules: the math is animated (loss changes, weights update, scores shift). |
| FLAG | Interactive is too passive (only one "Next" button with no real manipulation) OR borrowed viz exists but is not connected to this module's specific concept |
| FAIL | Step 3 is a paragraph of text with no interactivity. OR marked as `pending` without an annotated step-through fallback. |

---

## DIMENSION 8 — MCQ Design
**Question:** Is the quick check well-designed?

| Score | Criteria |
|-------|----------|
| PASS | 4 options. Correct answer is unambiguous. At least one distractor is the answer a competent-but-wrong engineer would give. All 4 explanations present (not just the correct one). |
| FLAG | Explanation present for correct only. OR all distractors are obviously wrong (no stretch). |
| FAIL | Fewer than 4 options. OR correct answer is ambiguous. OR no explanations at all. |

---

## DIMENSION 9 — Takeaway Quality
**Question:** Does the takeaway lock in the right thing?

| Score | Criteria |
|-------|----------|
| PASS | 1–2 sentences. Practitioner framing (implication, not definition). A senior engineer could quote it in an interview answer. Does not start with "X is a method that..." |
| FLAG | Present but reads like a textbook summary rather than a practitioner insight. |
| FAIL | Missing. OR so generic it could be the takeaway for any module. |

---

## DIMENSION 10 — Interview Weight Accuracy
**Question:** Is the interview weight tag accurate?

| Score | Criteria |
|-------|----------|
| PASS | HIGH: concept is directly and commonly tested. MEDIUM: plausible follow-up territory. LOW: tangential. Tag matches typical senior engineering interview patterns. |
| FLAG | Tag is defensible but one step off (e.g. tagged MEDIUM, arguably HIGH). |
| FAIL | Tag is clearly wrong. A foundational concept like attention tagged LOW, or a niche optimisation tagged HIGH. |

---

## DIMENSION 11 — Depth Uniformity Within Track
**Question:** Is depth consistent within the track, or are some modules padded / shortchanged relative to peers?

| Score | Criteria |
|-------|----------|
| PASS | Each module's depth tier is individually justified. The track as a whole has a coherent progression from simpler to more complex concepts. |
| FLAG | One or two modules feel out of place in the progression (too dense early, too light late). |
| FAIL | Depth is clearly uniform-by-default (all modules same length regardless of concept complexity) — indicates the standard was not applied. |

---

## DIMENSION 12 — Beginner Accessibility
**Question:** Can a baseline learner follow this without getting lost?

| Score | Criteria |
|-------|----------|
| PASS | Baseline learner can read Explanation step and form a working mental model. May not understand everything but is not blocked. Jargon is introduced, not assumed. |
| FLAG | One concept introduced without definition that a baseline learner would not know. One inline sentence would fix it. |
| FAIL | Explanation is written for someone who already knows the concept. A beginner would give up by paragraph 2. |

---

## DIMENSION 13 — Advanced Ceiling
**Question:** Does the module offer something for a competent learner who already knows the basics?

| Score | Criteria |
|-------|----------|
| PASS | MCQ has at least one distractor that would trap a competent-but-wrong engineer. OR DEEP module has equations that go beyond what a beginner would absorb on first pass. OR takeaway contains practitioner nuance. |
| FLAG | Everything in the module is introductory — no stretch content anywhere. |
| FAIL | Module is so simplified that an experienced practitioner would learn nothing and feel patronised. |

---

## SCORECARD TEMPLATE

```
MODULE: [id]
TRACK: [track name]
DEPTH TIER: [light / standard / deep]
INTERVIEW WEIGHT: [high / medium / low]

DIMENSION 1 — Existence Justification:        [PASS / FLAG / FAIL] — [note]
DIMENSION 2 — First Principles Compliance:    [PASS / FLAG / FAIL] — [note]
DIMENSION 3 — Depth Tier Appropriateness:     [PASS / FLAG / FAIL] — [note]
DIMENSION 4 — Explanation Quality:            [PASS / FLAG / FAIL] — [note]
DIMENSION 5 — Equation Coverage:              [PASS / FLAG / FAIL] — [note]
DIMENSION 6 — Production Scenario Quality:    [PASS / FLAG / FAIL] — [note]
DIMENSION 7 — Interactive Step:               [PASS / FLAG / FAIL] — [note]
DIMENSION 8 — MCQ Design:                     [PASS / FLAG / FAIL] — [note]
DIMENSION 9 — Takeaway Quality:               [PASS / FLAG / FAIL] — [note]
DIMENSION 10 — Interview Weight Accuracy:     [PASS / FLAG / FAIL] — [note]
DIMENSION 11 — Depth Uniformity Within Track: [PASS / FLAG / FAIL] — [note]
DIMENSION 12 — Beginner Accessibility:        [PASS / FLAG / FAIL] — [note]
DIMENSION 13 — Advanced Ceiling:              [PASS / FLAG / FAIL] — [note]

FAILs: [count]
FLAGs: [count]
SHIPPABLE: [YES — zero FAILs, ≤2 FLAGs / NO — rewrite needed]
```

---

## PRE-BUILD CHECKLIST (run before writing any module)

- [ ] Depth tier assigned and rationale written
- [ ] Interview weight tag assigned
- [ ] Interactive step approach confirmed (borrowed viz / custom widget / step-through fallback)
- [ ] Baseline assumption verified — no above-baseline terms without inline definition
- [ ] Production scenario is specific, named, failure-mode-driven
- [ ] MCQ distractor designed for competent-but-wrong engineer, not just random wrong

---

_Last updated: 26 Jun 2026. This document is the single source of truth for Foundations module quality. Any deviation requires an explicit decision in DECISIONS.md._
