# CONTENT-STANDARD.md — GSL Foundations content authority

_Rewritten sprint 93q after attention explanation breakthrough. Supersedes all prior versions._

---

## The 7 Teaching Principles

These govern every word of every module. Run the checklist at the bottom before committing any content.

---

### Principle 1 — Stakes First

The scenario and the first explanation paragraph open where the reader already is: a real production problem they recognize. Never open with a definition. Never open with "In this module you will learn..." The reader should feel the problem before they see the mechanism.

**Test:** Can you remove the first sentence and start on the second without losing context? If yes, the opening is preamble — rewrite it.

---

### Principle 2 — Close Naive Solutions Explicitly

Before the mechanism is revealed, walk through why the obvious answer fails. Show the reader the naive path. Let them sit with it. Then close the door. They should see with their own eyes why the naive approach doesn't work — before the correct path is offered.

The concept arrives as the reader's inevitable conclusion, not as something introduced from outside. The question is always answered *after* the reader has been forced to have it.

**Common naive solutions for every mechanism:**
- "Just look at everything equally" — fails because noise
- "Just use hardcoded rules" — fails because scale / domain shift / maintenance
- "Just make it bigger" — fails because cost / wrong constraint
- "Just use the simple version" — fails on edge cases

**Test:** Is there a moment in the explanation where the naive answer is tried and shown to fail? If no, the concept is being introduced — not derived. Rewrite.

---

### Principle 3 — Mechanism with Specificity

Explain the actual computation. Show the numbers. Element-wise multiply and sum — not "computes similarity." Show the softmax. Show what happens to the raw scores. A reader should be able to implement the basic mechanism from the explanation alone.

**Wrong:** "The model computes relevance between tokens."
**Right:** "Dot-product Q and K: multiply each dimension element-wise, sum the results. High dot product = high alignment."

**Wrong:** "Softmax converts scores to probabilities."
**Right:** "Softmax exponentiates each score (e^x), then divides by the sum. surgeon=2.8 → e^2.8=16.4. the=-0.5 → e^-0.5=0.6. That's a 27x ratio from a 3.3x raw-score difference. Softmax sharpens — it doesn't just normalize."

**Test:** If you removed all prose and kept only the technical content, could a developer implement the basic mechanism? If no, add specificity.

---

### Principle 4 — Concept as Conclusion

The mechanism name appears AFTER the constraints that require it — never before.

**Wrong:** "Self-attention uses Q, K, V vectors. The query represents what a token is searching for..."
**Right:** "Relevance has two sides: what's searching and what's available to be found. If we represent them separately — one learned vector per side — we can compute a match score for any two tokens. [Then name them: Q is the search vector. K is the exposure vector. V is what each token contributes when selected.]"

The reader should be able to say: "Oh — so that's why it works that way." Not: "That's a lot of new vocabulary."

**Test:** Does the mechanism name appear before or after the constraints that require it? If before, rewrite. The concept should feel inevitable by the time it's named.

---

### Principle 5 — Illustration at the Breakthrough Moment

For any module where a quantitative relationship is the insight, there must be a visual at exactly the moment the relationship first becomes concrete. The illustration shows actual numbers — not decorative diagrams, not vague arrows.

**Illustration format (attention model):**
```
Tokens:   The    surgeon    who    treated    the    patient  →  agreed
                                                               (query Q)

agreed's Q:  [0.9,  0.4, -0.7,  0.8]
surgeon's K: [0.8,  0.3, -0.6,  0.7]
             (0.9×0.8)+(0.4×0.3)+(-0.7×-0.6)+(0.8×0.7) = 1.82  → score: 2.8

the's K:     [0.0,  0.1,  0.0,  0.1]
             (0.9×0.0)+(0.4×0.1)+(-0.7×0.0)+(0.8×0.1) = 0.12  → score: -0.5

Softmax:  e^2.8=16.4  e^0.8=2.2  e^0.3=1.4  e^0.2=1.2  e^-0.5=0.6  / sum=21.8

surgeon  = 16.4/21.8 = 0.75   ████████████████  75%
the      =  0.6/21.8 = 0.03   ▌                  3%
```

**Test:** Is there an illustration? Does it appear at the moment of maximum insight (the first time you actually need to see numbers to believe the mechanism)? Does it show actual numbers? If any answer is no, add the illustration.

---

### Principle 6 — Patience Level

HIGH interviewWeight modules require 3x patience: every step explained carefully, nothing assumed, naive paths fully explored before closing, questions posed and left open for a beat before answered.

**Go slow the first time so it sticks. The second time they can run.**

| Tier | Time | Depth |
|------|------|-------|
| LIGHT | ~5 min | Stakes → one naive path mentioned → mechanism → takeaway |
| STANDARD | ~8 min | Stakes → naive tried and closed → mechanism → application with example |
| DEEP/HIGH | 12+ min | Stakes → naive #1 fully tried with numbers → why it fails → naive #2 tried → why it fails → constraint stated → mechanism derived step by step → illustration → mechanism named → application → takeaway |

**The marines principle:** Excruciatingly slow the first time. If the reader understood every step without rushing, it worked. If they had to re-read, it was too fast.

---

### Principle 7 — Reader Stays Human

The reader is the engineer watching their model — not the model itself. They build, deploy, and debug. The model is the thing being understood.

**Wrong:** "You are now at position 7, predicting the next token."
**Right:** "Your model is at position 7. It just predicted 'agreed'. Now it needs to build a representation of that token — which means incorporating the right context from what came before."

**Test:** Any moments where the reader "becomes" the model? Replace with "your model does X."

---

## The Checklist

Run every module through this before committing.

```
SCENARIO
[ ] Opens with a real production situation — concrete, specific, recognizable
[ ] Stakes are clear: why does this matter right now?
[ ] No "in this module you will learn" phrasing
[ ] No definition in the first sentence

EXPLANATION
[ ] First paragraph establishes stakes (consequence of not understanding this)
[ ] At least one naive solution tried and explicitly closed
[ ] Mechanism explained with actual numbers, not just descriptions
[ ] Mechanism name appears after the constraints that require it
[ ] Illustration present for any quantitative relationship
[ ] Illustration is at the breakthrough moment, shows actual numbers
[ ] Reader stays human throughout
[ ] HIGH modules: 3x patience, multiple naive paths, nothing rushed
[ ] Cross-module handoff in paragraph 1 (what did the previous concept leave unsolved?)
[ ] Scenario payoff at the end (closing sentence names the specific mechanism
    that explains the specific failure in the scenario)

TAKEAWAY
[ ] One sentence
[ ] Names the mechanism, not just the lesson
[ ] Can stand alone — someone who only reads the takeaway gets the key fact

MCQs
[ ] Tests mechanism understanding, not terminology recall
[ ] Wrong answers are plausible misconceptions (not obviously incorrect)
[ ] Explanation explains why each wrong answer is wrong
[ ] At least one wrong answer targets the most common misconception about this topic
[ ] HIGH modules: 3 MCQs minimum
```

---

## The Reference Teaching Sequence

The sequence that produced the attention explanation (3x patience, HIGH module):

1. Root the reader in what they already know ("LLMs = next-token prediction. Your model predicted 'agreed'.")
2. Make them sit in the production consequence ("agreed on its own is useless downstream")
3. Ask the question they're now forced to have ("how does the model incorporate context?")
4. Try naive answer #1: equal weighting
5. Show exactly why it fails — with numbers (1/7 = surgeon gets same weight as 'the'; at 10K tokens: 1/10,000)
6. Close door #1: "Equal attention is no attention."
7. Let the constraint breathe: "The model needs to be selective. But selective about what?"
8. Try naive answer #2: hardcoded rules (verbs look at nouns)
9. Show why it fails: parsers for every language, every domain, every edge case, rules break on technical docs and legal prose
10. Close door #2: "The model can't use hardcoded rules. It has to learn what's relevant."
11. Derive the constraint: relevance is a relationship with two sides
12. Derive the mechanism as inevitable: two separate learned vectors — one for searching, one for exposure
13. Show the computation at the breakthrough moment (illustration with actual numbers: dot product, softmax, weights)
14. Name it last: Q (query), K (key), V (value)
15. Crystallize: "You didn't look it up. You derived it."

---

## Structural rules (carried forward from prior standard)

**Cross-module handoff (Rule 1):** Every module's first paragraph names what the previous concept left unsolved — not as a recap, but as the failure that makes this module necessary. "BPE gave the model integer IDs — but an integer carries no semantic signal" is the handoff from tokenizer to embeddings.

**Scenario payoff (Rule 2):** The explanation closes by naming the specific mechanism that explains the specific failure in the scenario. The closing sentence completes: "This is why [specific thing from the scenario] is happening."

**DEEP tier exhaustion (Rule 3):** Before finalizing a DEEP module, ask: "What's in every production implementation of this that I haven't mentioned?" If anything load-bearing is missing, add it.

**Padding test (Rule 4):** A sentence is padding if it introduces a new failure mode after the diagnosis is already closed, or if it's true but doesn't connect to the scenario. If a sentence introduces a new failure mode, it either earns a full paragraph with scenario payoff, or it gets cut.

**Precision at DEEP tier (Rule 5):** Any "approximately correct" description must either be stated precisely, or explicitly name the simplification ("this is the approximation that holds at typical scales...").

---

## GT Posts (future workstream — see GT_POSTS_QUEUE.md)

Same 7 principles apply. Different format:
- 400–600 words, no MCQs, no scenario box
- Single concept per post
- Illustration mandatory
- Hook = stakes (first sentence is the production problem, not the concept definition)

---

## Version history

| Sprint | Change |
|--------|--------|
| 93h | Initial standard. Causal chain, cross-module handoff, scenario payoff, padding test. |
| 93q | Full rewrite. 7 teaching principles added: stakes-first, close naive solutions, specificity, concept-as-conclusion, illustration at breakthrough, patience levels (3x for HIGH), reader stays human. All prior rules preserved. |
