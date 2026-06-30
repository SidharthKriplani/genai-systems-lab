# CONTENT-STANDARD.md — GSL Foundations content authority

_Established sprint 93h. Source of truth for all Foundations module explanations. Overrides the earlier FOUNDATIONS-CONTENT-STANDARD.md rubric where they conflict._

---

## The core discipline: causal chain

Every explanation paragraph must earn its place by resolving a specific failure mode created by the previous paragraph. The structure is:

> **hero → need → obstacle → story → next obstacle**

Not: A is defined, then B is defined, then C is defined.  
But: A is the solution to why the naive approach failed. B is the solution to what A couldn't do. C is the solution to what B couldn't do.

The test: if you can remove a paragraph without breaking the argument, it hasn't earned its place.

---

## Rule 1 — Cross-module handoff

Every module's first paragraph must name what the previous concept left unsolved — not as a recap but as the failure that makes this module necessary.

**Example (embeddings para 1):** "BPE gave the model integer IDs for subwords — but an integer carries no semantic signal."

This is the pickup from tokenizer. The reader feels the handoff without being told "in the previous module we learned X."

**Violation:** Opening a module by defining the concept. "Embeddings are dense vector representations of text" — this tells you what it is, not why it had to exist.

---

## Rule 2 — Scenario payoff

The explanation must close by naming the specific mechanism that explains the specific failure in the scenario. The closing sentence should complete:

> "This is why [specific thing from the scenario] is happening."

**Example (embeddings):** "Clinical search fails not because embeddings are broken — they work exactly as designed — but because the domain distribution of the encoder doesn't match the domain distribution of the query corpus."

**Violation:** Closing with a general principle that could apply to any scenario. "Embedding quality depends on training data" — true, but it doesn't name the failure.

If the closing paragraph can't complete the scenario payoff sentence, the causal chain isn't closed.

---

## Rule 3 — DEEP tier exhaustion

For DEEP tier modules, before finalizing, ask: "what's in every production implementation of this that I haven't mentioned?"

If the answer is anything load-bearing — named in papers, required for training to work, present in every open-source implementation — it must appear in the explanation.

**Example of the violation:** Transformer module explaining residual connections for depth trainability without naming layer normalization. Layer norm is in every Transformer block. Residuals alone don't stabilize activation magnitudes at depth. Omitting it is an incomplete explanation at DEEP tier.

This rule is about completeness, not exhaustiveness. Don't add every detail — add every component without which the described mechanism doesn't work.

---

## Rule 4 — Padding test

A sentence is padding if it:
- Introduces a new failure mode after the diagnosis is already closed
- Is true but doesn't connect to the scenario
- Could be cut without breaking the causal chain

**Example of padding (removed from embeddings):** "Every chunk in the index and every query must use the same embedding model at the same version; upgrading the query encoder without re-embedding the index is comparing vectors from different spaces."

This is correct. It's not connected to the scenario. It introduces a second failure mode (version mismatch) after the first (domain mismatch) is already diagnosed. It got cut.

If a sentence introduces a new failure mode, it either earns a full paragraph with a scenario payoff, or it gets cut. No middle ground.

---

## Rule 5 — No gap standard

No distinction between "misleads" and "underserves." A known gap is a known gap regardless of whether it causes wrong understanding or incomplete understanding.

Identifying a gap and not fixing it because it's "just precision" is the same failure as leaving a factual error. Fix it now or record it as a tracked debt — never leave it unnamed.

---

## Rule 6 — Precision at DEEP tier

At DEEP tier, any sentence that describes a mechanism with "approximately correct" language must either:
- State it precisely, or
- Explicitly name the simplification: "this is the approximation that holds at typical scales..."

**Examples from Batch 1:**
- √d_k scaling: the problem is high variance in dot products → softmax saturates → vanishingly small gradients for non-max tokens. Not "pushes softmax into near-zero gradient regions."
- Chinchilla 20:1 ratio: the approximation that holds at typical training scales. The precise finding is a frontier curve.
- LSTM failure: backpropagation still travels through thousands of time steps even with gating — the gradient degrades across that distance regardless of the gating mechanism.

If you don't know the precise mechanism, that's a research gap before writing, not a writing problem.

---

## Depth tier paragraph counts

| Tier | Paragraphs | Equation blocks |
|------|-----------|-----------------|
| LIGHT | 2 | 0 |
| STANDARD | 3–4 | 0 |
| DEEP | 4–6 | 0–1 (if the mechanism is irreducibly mathematical) |

Equation blocks supplement prose; they don't replace it. Every equation must be followed by a plain-English restatement of what it means and what changes if the variables change.

---

## Batch history

| Batch | Modules | Sprint | Status |
|-------|---------|--------|--------|
| 1 | tokenizer, embeddings, attention, transformer, scaling-laws | 93h | ✓ shipped |
| 2 | sampling, nextoken, chunking, rag-pipeline, lora, few-shot | — | pending |
| 3 | attention-3d, seq-parallel, flashattn + remaining MEDIUM | — | pending |
