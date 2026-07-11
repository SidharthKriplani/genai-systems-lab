# Interview QnA — The Transformer Block

Module: `transformer` (GSL) · Spec: `QNA-INTERVIEW-STANDARD.md` · Status: all questions `answered` — adversarial Pass-2 audit PASSED 2026-07-11 (round 1 FAIL: 4 must-fix incl. one linearity-argument drift and one ID-scheme violation, all fixed; round 2 confirm: PASS, zero orphan followUps, all fact-fidelity tripwires clean). IDs frozen.

**Beats (extracted from the module's own conceptual chain, in module order):**
1. Attention's two gaps — a blend of blends, and a bag of words
2. The FFN — the fold that transforms, the workshop that stores knowledge
3. Positional encoding and RoPE — restoring order, relatively
4. Vanishing gradients → the residual highway
5. Activation drift → the layer-norm regulator
6. Pre-norm vs post-norm, and RMSNorm
7. Encoder vs decoder — the causal mask
8. Production: depth is a priced lever

Recurring anchors throughout (the module's own): mixing paints on a palette (attention as blending); the private workshop (FFN); 'dog bites man' vs 'man bites dog' (order blindness); the elevator shaft / gradient highway (residuals); the regulator (norm); author vs editor (decoder vs encoder). Numbers: production FFN expansion 4× d_model (the interactive's toy model: d_model = 8, expands 2×, 8→16); residual formula output = input + block(input); post-norm LayerNorm(x + Sublayer(x)); pre-norm x + Sublayer(LayerNorm(x)); RMSNorm x/RMS(x)·g; 0.5^100 ≈ 8×10⁻³¹ ≈ zero; illustrative no-norm activation drift 1.0 → 4.8 → 22.0 → 140.0 across layers 1/6/12/24.

---

## Beat 1 — Attention's two gaps: a blend of blends, and a bag of words

#### [qna-block-anatomy-01] (L0) What is a Transformer block, and what are its parts?

**Answer.** A Transformer block is the repeating unit of modern language models: an attention sublayer followed by a position-wise feed-forward network, with a residual connection and a normalization around each sublayer, and positional information stamped in before the stack. Each part exists because something specific breaks without it: the FFN because attention only blends vectors, never transforms them; positional encoding because attention is order-blind; residuals so gradients survive depth; norms so activation scales don't drift. Where it sits: stacked dozens of times, it is the body of every modern LLM — one masking choice decides encoder or decoder.

**Follow-up.** → [qna-attention-blend-01]

#### [qna-attention-blend-01] (L0) What does attention actually do to the vectors it operates on?

**Answer.** Attention blends. Each output is a weighted average of value vectors — a linear combination, like mixing paints on a palette. The weights shift with the input, and the mix can be exquisitely chosen, but the output is always a mix of vectors that already exist; attention never produces a vector outside the span of what it was given. In the block's division of labor, attention is the gathering step — each position pulls in the context that matters to it — and the FFN downstream is what actually transforms the gathered result. Where it sits: the first sublayer of every Transformer block.

**Follow-up.** → [qna-blend-collapse-01]

#### [qna-blend-collapse-01] (L1) Why can't you build a language model by stacking a hundred attention layers alone?

**Answer.** Because a blend of blends is still a blend — a pure-attention tower collapses, mathematically, into a single layer of mixing, and no amount of added attention escapes that. The mechanism: one attention output is a weighted average of value vectors, a linear combination. Stack a second attention layer on top and you are averaging averages; a third averages those. Averaging averages keeps every vector trapped inside the span of the originals — you can stir paint forever and never get a color that wasn't on the palette. The one honest hedge: the attention weights themselves do shift with the input, so the mixing is input-dependent — but what the mixing produces is always a mix of what's already there. Concretely, a hundred stacked attention layers still cannot move a single point off the palette; the hundredth layer's output lives in exactly the span the first layer started with. And there is a second, independent gap: attention is a set operation with no sense of word order, and that isn't fixable with more attention either. The boundary: this is precisely why the block introduces something different in kind — the FFN, whose nonlinearity folds space and finally moves vectors somewhere no blend could reach — and stamps positional information in before the stack.

**Trap.** "More attention layers means more capacity, so a deep enough all-attention stack eventually works." Actually wrong: capacity isn't the issue — the output of stacked linear combinations remains a linear combination of the original vectors regardless of depth. The collapse is structural, not a matter of scale or training time.

**Follow-up.** → [qna-ffn-fold-01]

#### [qna-attention-order-01] (L1) Why does attention compute the same thing for 'dog bites man' and 'man bites dog', and what fixes it?

**Answer.** Because attention is a set operation: it sees which word vectors are present, not where they stand. Swap two words and re-run attention and the outputs are identical — to attention, a sentence is a bag of words, not a sequence. The mechanism: each attention output is a weighted average over the vectors in the context, and nothing in that computation references position; the weights depend on the vectors' contents, so shuffling the sentence shuffles nothing that attention can perceive. 'Dog bites man' and 'man bites dog' are the same bag. The fix is not more attention — no amount of blending creates a sense of order — but positional encoding: stamping each token's location into its vector before the stack, so position becomes part of the content attention operates on. And notice what actually matters to 'bites': not that 'dog' sits at absolute position 1, but that it sits one step back — slide the whole pair ten positions to the right, buried mid-paragraph, and nothing about their relationship changes. That observation is why modern models use RoPE, which encodes exactly the relative offset. The boundary: order-blindness is one of attention's two structural gaps; the other — no real transformation, only blending — is fixed by a different device entirely, the FFN.

**Trap.** "Attention picks up word order implicitly from training data." Actually wrong: without positional information the computation is permutation-invariant — a shuffled sentence produces identical outputs, so there is no signal from which order could ever be learned.

**Follow-up.** → [qna-rope-01]

---

## Beat 2 — The FFN: the fold that transforms, the workshop that stores knowledge

#### [qna-ffn-01] (L0) What is the feed-forward network (FFN) in a Transformer block?

**Answer.** A small two-layer network that every position passes through individually after attention: expand to 4× the model dimension in production models, bend through a ReLU or GeLU, project back down. (The module's toy d_model = 8 model expands 2×, 8→16, so the matrices stay readable — the shape of the move is identical.) It supplies what attention lacks: a nonlinearity, so the model can transform vectors instead of only blending them — and its weights are where factual associations predominantly live. Where it sits: the second sublayer of every block — attention gathers, then each position enters this private workshop.

**Follow-up.** → [qna-ffn-fold-01]

#### [qna-ffn-fold-01] (L1) Why does the FFN's nonlinearity matter — what does it add that attention can't?

**Answer.** The nonlinearity lets the model fold space, and folding is the one move that takes a vector somewhere no blend could reach. The mechanism: attention outputs are weighted averages — the weights shift with the input, but what comes out is always a mix of vectors already present, trapped inside their span — and averaging averages keeps everything trapped there, which is why a stack of pure attention collapses into one layer of mixing. The FFN's bend through a ReLU or GeLU between its two linear layers breaks that: expand the vector, fold it through the nonlinearity, project back down — and the output can now sit off the palette entirely. That makes the FFN different in kind from attention, not just in degree. The grounding numbers: production models expand to 4× the model dimension inside the FFN; the module's toy d_model = 8 model expands 2×, 8→16, so you can watch the matrices do it — same move, readable size. The division of labor this buys: attention gathers, the FFN thinks — each position gets a private workshop where its gathered context is actually transformed, one position at a time. The boundary: the nonlinearity is only half the FFN's job description; the workshop is also where the model's factual knowledge predominantly lives, which makes FFN width a lever of its own, distinct from depth.

**Trap.** "The FFN is just another mixer like attention — extra capacity, same kind of operation." Actually wrong: attention mixes across positions, and though its weights shift with the input, its output is always a mix of vectors already present; the FFN operates on each position privately and carries the block's only nonlinearity. Remove it and the stack collapses into a single layer of mixing — a blend of blends is still a blend.

**Follow-up.** → [qna-ffn-knowledge-01]

#### [qna-ffn-knowledge-01] (L1) Where does a transformer's factual knowledge actually live?

**Answer.** Predominantly in the FFN weights — the private workshop is also the warehouse. The mechanism behind that: attention gathers, the FFN thinks. Attention's job is to pull the relevant context into each position's vector, but attention itself only blends what already exists; the FFN is where that gathered context gets genuinely transformed, each position passing individually through expand-fold-project, and the factual associations the model has absorbed are predominantly stored in those FFN weights. This is also why the FFN is where so much of the block's width sits: production models expand to 4× the model dimension inside it (the toy model: 2×, 8→16) — width, meaning the FFN, is the module's shorthand for where the model's knowledge actually lives. The practical consequence the module draws: when someone proposes adding depth to make a model "know more," they are reaching for the wrong lever — knowledge capacity is a width story, and depth is a different lever with a different price. The boundary: "predominantly" is the module's own hedge, not a throwaway — attention weights matter to behavior too; the claim is about where factual associations are stored, not that the FFN is the only thing that learns.

**Trap.** "Knowledge lives in the attention weights, since attention is what decides which words relate to which." Actually wrong: attention decides where to look, and its output is always a mix of vectors already present — the stored factual associations sit predominantly in the FFN weights, not in the looking.

**Follow-up.** → [qna-attention-vs-ffn-01]

#### [qna-attention-vs-ffn-01] (L2) Attention vs the FFN — what's the division of labor, and when does each matter?

**Answer.** The decision rule: attribute cross-position information movement to attention and per-position transformation plus stored knowledge to the FFN — attention gathers, the FFN thinks — and when reasoning about a model deficit, ask which of the two jobs is failing before touching either lever. The mechanism behind the split: attention's output is a weighted average across positions — it moves information around the sentence, but it is a linear combination, so it can never manufacture a vector outside the span of what exists. The FFN is the inverse profile: applied to each position individually — a private workshop, no windows between positions — it expands to 4× the model dimension in production (the toy model: 2×, 8→16), folds through a ReLU or GeLU, and projects back; that fold transforms rather than blends, and the FFN's weights are where factual associations predominantly live. Neither can substitute for the other: a pure-attention stack collapses into one layer of mixing (the weights shift with the input, but the output never leaves the span of what's already there), and an FFN-only stack could never move information between positions at all, since every workshop is sealed. The grounding: pulling the right earlier words into a token's representation is gathering — attention's job; turning that gathered context into something genuinely new is the workshop's job. The boundary: the split is a working model, not surgery — the module's own hedge is "predominantly" — and both sublayers depend on the same residual-and-norm machinery to be trainable when stacked deep.

**Trap.** "Attention is the smart part; the FFN is boilerplate plumbing." Actually wrong: the FFN carries the block's only nonlinearity and predominantly stores the model's factual knowledge — strip it out and the model can only blend what it already has.

---

## Beat 3 — Positional encoding and RoPE: restoring order, relatively

#### [qna-positional-need-01] (L0) What is positional encoding and why does a transformer need it?

**Answer.** Positional encoding stamps each token's location into its vector, so the model can finally tell 'dog bites man' from 'man bites dog'. It's needed because attention is a set operation — a weighted average over whichever vectors are present — so without positional information a sentence is a bag of words, and shuffling it changes nothing attention can see. Stamp position into the vectors and location becomes part of the content attention operates on. Where it sits: applied before the stack (or, with RoPE, as rotations inside the attention computation itself), patching the second of attention's two structural gaps.

**Follow-up.** → [qna-rope-01]

#### [qna-rope-01] (L1) What is RoPE, and what does it actually encode?

**Answer.** RoPE — Rotary Positional Embedding — turns each token's position into a rotation applied inside the attention computation, so what attention sees is the relative offset between words rather than their absolute addresses. Why relative is the right target: look at what actually matters to 'bites' — not that 'dog' sits at absolute position 1, but that it sits one step back. Slide the whole pair ten positions to the right, buried mid-paragraph instead of opening the sentence, and nothing about their relationship changes; an absolute stamp would hand attention a different-looking pair at every location, encoding an address that's irrelevant to the relationship. RoPE encodes the offset itself: the rotations are constructed so that when attention compares two tokens, what emerges is how far apart they stand. The grounding: with RoPE, 'dog' one-step-behind 'bites' looks the same to attention at positions 1–2 as at positions 11–12 — which is exactly the invariance language has. The boundary, stated carefully: that relative formulation is what later makes context-window extension tricks tractable rather than a retrain — it gives the tricks a clean handle, it does not make extension automatic; and the rotation math itself is the positional-encoding module's territory, not this one's.

**Trap.** "RoPE means a model trained at 4K context natively works at 32K." Actually wrong: RoPE's relative formulation makes context-extension tricks tractable — it doesn't make extension free. Going past training lengths still requires those tricks; vanilla RoPE on its own doesn't grant length generalization.

**Follow-up.** → [qna-absolute-vs-relative-pos-01]

#### [qna-absolute-vs-relative-pos-01] (L2) Absolute vs relative position — why did modern models converge on the relative formulation?

**Answer.** The decision rule: reason about position the way language does — what attention should see is how far apart two tokens stand, not their addresses — so expect and prefer a relative scheme like RoPE in modern models, and treat absolute stamping as encoding information the relationship doesn't need. The mechanism: the relationship between 'dog' and 'bites' is fully described by the offset — 'dog' one step back. Under an absolute scheme, the same pair carries different positional stamps at positions 1–2 than at 11–12, so the model must learn to see through the address to recover the offset it actually cares about. RoPE skips the indirection: each position becomes a rotation applied inside the attention computation, constructed so that the comparison between two tokens surfaces their relative offset directly. The grounding: slide 'dog bites man' ten positions deeper into a paragraph — under RoPE, what attention computes about that pair is unchanged, matching the fact that nothing about the phrase's meaning moved. The production stake that makes this more than aesthetics: the relative formulation is what makes context-window extension tricks tractable rather than a retrain — a directly priced consequence when a deployed model needs a longer window. The boundary: tractable is not automatic — vanilla RoPE does not natively generalize past its training lengths; the extension tricks are still doing real work, and how the rotations are built is the positional-encoding module's story.

**Trap.** "Absolute vs relative is an implementation detail with no production consequence." Actually wrong: the relative formulation is precisely what makes context-window extension tractable instead of a retrain — for a deployed model needing a longer context, that's the difference between a trick and a training run.

---

## Beat 4 — Vanishing gradients → the residual highway

#### [qna-residual-01] (L0) What is a residual connection?

**Answer.** The formula output = input + block(input), read geometrically: the input doesn't go through the block, it goes around it, untouched, and the block adds a small correction as it passes. Each layer stops being a gatekeeper and becomes a contributor — and the untouched identity path runs unbroken from the loss all the way down to the very first layer, a direct gradient highway: the elevator shaft that makes very deep stacks trainable. Where it sits: wrapped around every sublayer, attention and FFN alike — it's the "add" in the "add & norm" stamped on every block diagram.

**Follow-up.** → [qna-residual-gradient-01]

#### [qna-residual-gradient-01] (L1) Why do deep stacks without residuals fail to train, and how do residuals fix it?

**Answer.** Because the training signal vanishes on the way down, and residuals give it a path that never shrinks it. The mechanism of the failure: training works by sending a message backward — the loss tells the top layer how to improve, that layer passes the message down, and so on, a hundred handoffs deep. Every handoff shrinks the message a little, and the shrinkage compounds multiplicatively: shrink something by half a hundred times and what's left is 0.5^100 ≈ 8×10⁻³¹ — not "small," zero for any purpose an optimizer has. The early layers stand at the bottom of a hundred-story building waiting for instructions that never arrive. The fix is the elevator shaft: output = input + block(input). The input rides around each block untouched, and that untouched identity path runs unbroken from the loss to the very first layer — a direct gradient highway that no layer's handoff can shrink. Each layer becomes a contributor adding a small correction, rather than a gatekeeper the signal must survive. The boundary: residuals solve the gradient problem and immediately create a quieter one — every floor now adds to what rides past, and additions compound, so activation magnitudes drift upward with depth. That second problem belongs to layer normalization, not to the residual.

**Trap.** "Layer normalization is what fixes vanishing gradients." Actually wrong: norm fixes activation-scale drift. The gradient highway is the residual's untouched identity path — and in the post-norm placement, the norm actually sits on that highway and makes deep training more fragile, not less.

**Follow-up.** → [qna-activation-drift-01]

---

## Beat 5 — Activation drift → the layer-norm regulator

#### [qna-layernorm-01] (L0) What does layer normalization do in a Transformer block?

**Answer.** It's the regulator: it re-centers and re-scales the signal to a standard size around each sublayer, keeping activation magnitudes under control. It's needed because residual connections make every layer add to the stream, and additions compound — without a regulator, magnitudes drift upward with depth, and deep layers receive inputs at scales they were never trained to expect. Where it sits: paired with the residual at every sublayer — the "norm" in "add & layer-norm" — and where exactly it's installed, on the stream (post-norm) or inside the branch (pre-norm), turns out to decide whether a deep model trains at all.

**Follow-up.** → [qna-activation-drift-01]

#### [qna-activation-drift-01] (L1) Residuals rescue the gradients — so what new problem do they create, and how is it handled?

**Answer.** They make activation magnitudes swell with depth: every floor adds to what rides past, and additions compound. The mechanism: output = input + block(input) means the residual stream is never replaced, only added to — so a few dozen layers up, the stream carries values wildly larger than what entered. The building stands; its contents are swelling — and layers deep in the stack receive inputs at scales they were never trained to expect, which destabilizes training. The grounding, from the module's illustration (its numbers are explicitly illustrative, but the compounding shape is the point): with no norm, the typical RMS of activations entering each block goes 1.0 at layer 1 → 4.8 at layer 6 → 22.0 at layer 12 → 140.0 at layer 24 — blowing up with depth. The fix is the regulator: layer normalization, re-centering and rescaling the signal to a standard size at each sublayer. The "add & layer-norm" stamped on every block diagram is exactly this pair — highway plus regulator, gradient path and scale control together. The boundary: these are two separate problems with two separate devices — residuals do nothing about scale drift, and norm does nothing about vanishing gradients — and where the regulator is installed relative to the highway is its own load-bearing decision, the pre-norm versus post-norm question.

**Trap.** "Residual connections stabilize activations too, since the input passes through unchanged." Actually wrong — backwards, in fact: the input passing through unchanged is precisely why scales drift, because each block adds on top of it and the additions compound. The residual causes the drift; the norm cures it.

**Follow-up.** → [qna-prenorm-postnorm-01]

#### [qna-add-norm-01] (L0) Block diagrams stamp "Add & Norm" after every sublayer — what is that pair?

**Answer.** The residual addition plus layer normalization: highway plus regulator, two devices for two different failures. "Add" is output = input + block(input) — the identity path around the sublayer that gives gradients an unbroken highway from the loss to the first layer. "Norm" re-centers and rescales after the addition, so the compounding residual adds don't drift activation scale out of the range deep layers expect. Where it sits: around both sublayers of every block — though in modern pre-norm models the norm has moved inside the branch, so the literal "add then norm" ordering describes the original post-norm design.

**Follow-up.** → [qna-residual-vs-norm-01]

#### [qna-residual-vs-norm-01] (L2) Residuals vs layer norm — which fixes what, and what happens if you have only one?

**Answer.** The decision rule: attribute trainability-at-depth to residuals and scale stability to norm — when a deep stack misbehaves in training, first ask which symptom you're seeing: gradients dying at the bottom is a residual problem, activations exploding along the way is a norm problem. The mechanism behind the split: the residual's untouched identity path, output = input + block(input), is the gradient highway defeating the multiplicative shrinkage that otherwise leaves early layers a signal of 0.5^100 ≈ 8×10⁻³¹ — zero; the norm is a regulator on the stream those same residuals keep adding to. With only residuals and no norm, gradients arrive fine but the compounding additions drift activation scale — the module's illustrative figures show RMS entering blocks going 1.0 → 4.8 → 22.0 → 140.0 across layers 1, 6, 12, 24 — and deep layers face input scales they were never trained to expect. With only norm and no residuals, every scale is tidy but the training message still relays through every floor and shrinks toward zero on the way down: normalizing magnitudes does not build a highway. The grounding is the block diagram itself: "add & layer-norm" ships as a pair because each member covers the other's blind spot. The boundary: the two interact through placement — post-norm installs the regulator on the highway itself and makes depth fragile; pre-norm separates the jobs cleanly, which is the next question an interviewer will reach for.

**Trap.** "Layer norm fixes vanishing gradients." Actually wrong, and it's a common conflation because both are filed under 'training stability': norm controls scale, the gradient path belongs to the residual — and post-norm placement shows the norm can actively degrade that path when it sits on it.

**Follow-up.** → [qna-prenorm-warmup-01]

---

## Beat 6 — Pre-norm vs post-norm, and RMSNorm

#### [qna-prenorm-postnorm-01] (L0) What's the difference between post-norm and pre-norm?

**Answer.** Where the regulator is installed. Post-norm — the original Transformer's choice — computes LayerNorm(x + Sublayer(x)): the norm sits on the residual stream itself, after each addition. Pre-norm computes x + Sublayer(LayerNorm(x)): the norm slides inside the branch, regulating only what enters the sublayer, and the identity path is never touched. Where it sits: this single placement decision decides whether a very deep stack trains stably — GPT-2 and essentially every modern LLM are pre-norm.

**Follow-up.** → [qna-prenorm-warmup-01]

#### [qna-prenorm-warmup-01] (L1) Why does pre-norm train stably at depth where post-norm turns fragile?

**Answer.** Because pre-norm never touches the gradient highway, and post-norm rescales it at every floor. In post-norm, LayerNorm(x + Sublayer(x)), the norm sits on the residual stream — so every gradient riding the highway gets rescaled at every single layer. The shaft is no longer pristine, and past a few dozen layers this turns fragile: deep post-norm models need delicate learning-rate warmup or they diverge. Pre-norm, x + Sublayer(LayerNorm(x)), slides the norm inside the branch: it regulates only what enters the sublayer, and the identity path is never touched. The grounding, from the module's illustration: under pre-norm, the RMS of what enters each sublayer — measured after the norm — holds near 1.0–1.1 from layer 1 out to layer 24, so no sublayer ever sees wild scales; the residual stream itself is untouched and still grows gently with depth, but that untouched stream is exactly the clean gradient path you want. That single relocation is why GPT-2 and essentially every modern LLM train stably at depth. The boundary, stated precisely because it's often misstated: pre-norm makes warmup non-load-bearing, not obsolete — modern LLMs still schedule warmup; it has simply gone from the delicate thing holding training together to an ordinary safety habit.

**Trap.** "Pre-norm models don't need warmup, so drop it." Actually wrong on the load-bearing distinction: post-norm's warmup was what held training together; pre-norm demotes it to a safety habit that modern LLMs still schedule. Non-load-bearing does not mean removed.

**Follow-up.** → [qna-rmsnorm-01]

#### [qna-rmsnorm-01] (L2) LayerNorm vs RMSNorm — what's the difference, and why do modern models pick RMSNorm?

**Answer.** The decision rule: default to pre-norm + RMSNorm for a modern LLM stack — it's what Llama, Mistral, and most recent models ship — and reach for full LayerNorm only if you have evidence that mean-centering is earning its cost, because the measured answer is that it usually isn't. The mechanism: standard LayerNorm does two jobs — re-center (subtract the mean) and re-scale (divide by the spread) — plus a learned bias. Measure each job's contribution separately, as the RMSNorm paper's ablations did, and the centering turns out to matter very little. RMSNorm drops it: x / RMS(x) · g — divide by the root-mean-square, apply a learned scale, done; no mean subtraction, no bias. The grounding: about the same quality, less arithmetic — and since the norm runs at every sublayer of every block on every forward pass, arithmetic saved in the regulator is saved everywhere at once, which is exactly the kind of trade production models take. Hence the shipping combination: pre-norm for stability, RMSNorm for economy. The boundary: RMSNorm changes what the regulator computes, not where it sits — the pre-versus-post placement question is separate and is the one that decides trainability at depth. Swapping LayerNorm for RMSNorm is an efficiency move on top of a stable design, not a stability fix in itself.

**Trap.** "RMSNorm is what makes deep stacks train stably — that's why Llama uses it." Actually wrong: stability at depth comes from pre-norm placement keeping the identity path untouched. RMSNorm's win is roughly equal quality for less arithmetic; swapping norm type does not fix a post-norm fragility problem.

---

## Beat 7 — Encoder vs decoder: the causal mask

#### [qna-causal-mask-01] (L0) What is a causal mask?

**Answer.** A restriction on attention that lets each token attend only leftward — to what's already written — never to future positions. It's what makes a transformer a decoder: an author producing the sentence one word at a time, seeing only the page so far, rather than an editor reading a finished passage. Without it, a model being trained to write would practice with visibility of future words it can never have at generation time. Where it sits: inside the attention sublayer of every decoder block — and this one bit, mask or no mask, splits the transformer family into decoders and encoders.

**Follow-up.** → [qna-decoder-why-mask-01]

#### [qna-decoder-why-mask-01] (L1) Why do generation models need the causal mask during training?

**Answer.** Because at generation time the future words don't exist, so training has to match that condition. The mechanism: a model trained with full bidirectional visibility would be practicing with answers it can never have at generation time — when the model writes, it produces the sentence one word at a time, and only the page so far exists. Apply the causal mask during training — each token attends only leftward — and the training task becomes the same task the model will actually face when serving: predict the next word from what's already written. The module's frame makes the split memorable: an encoder is an editor, whose job is to understand a passage that already fully exists, so seeing both directions helps and the mask would only hurt; a decoder is an author, and an author who trained by peeking ahead has learned a skill that evaporates the moment there's nothing ahead to peek at. The boundary: the mask is a design commitment with a real cost attached — every representation the decoder builds is half-blind by design, which is exactly right for writing but distorts the vector geometry for jobs like retrieval embeddings that want full-context representations.

**Trap.** "The causal mask is a training-efficiency trick you could relax at inference." Actually wrong: it's a correctness condition. A model trained with future visibility has learned to lean on context that generation can never supply — the mask exists precisely so training practices the condition serving imposes.

**Follow-up.** → [qna-encoder-vs-decoder-01]

#### [qna-encoder-vs-decoder-01] (L2) Encoder or decoder — how do you choose, and what goes wrong when you take embeddings from the wrong one?

**Answer.** The decision rule: choose by job. If the job is to understand text — classify it, embed it for retrieval — take an encoder, where every token attends in both directions and each position distills the richest possible summary of the whole passage. If the job is to write, take a decoder with a causal mask. Concretely for production: embedding models for RAG are encoders; generation models are decoders. The mechanism: the two are the same block, split by one bit — mask or no mask. An encoder token sees everything, so its representation is built with full context; a decoder token may attend only leftward, to what's already written, so every vector it builds is half-blind by design — the right design for an author, since the future words don't exist at generation time. The grounding is the production failure the module names: reach into a generation model for embeddings and retrieval quality drops — the causal mask has distorted the vector geometry relative to what retrieval needs, because each vector was constructed without ever seeing the right half of its own passage. The boundary: the decoder's half-blindness is not a defect to be fixed — it's the price of matching the generation condition, and a decoder pays it on purpose. The mistake with real cost is only in mixing the jobs up: asking half-blind representations to do a full-vision task.

**Trap.** "Any strong decoder LLM makes a fine embedder — it's a bigger model than most encoders." Actually wrong: scale doesn't undo the mask. The representations were built half-blind by design and their geometry underperforms for retrieval — which is exactly why RAG embedding models are encoders.

---

## Beat 8 — Production: depth is a priced lever

#### [qna-depth-cost-01] (L1) What does adding one more Transformer layer actually cost in production?

**Answer.** Another sequential step in every forward pass — a latency cost no amount of parallel hardware can absorb — plus memory and training compute on top. The mechanism: each layer's input is the previous layer's output. Work within a layer parallelizes beautifully across positions and hardware, but layer N+1 cannot start until layer N finishes, so every layer added is one more irreducible serial step in the path every single token must travel. That's why the latency component is the one to name first: memory and training compute can be bought; sequential steps can't be parallelized away. The grounding is the module's production framing: depth directly shows up in cost-per-token, which is why "add more layers" needs a compute budget attached before it's a real proposal. The boundary, stated carefully: this is not a claim that depth is the most expensive lever — the point is the *kind* of cost: the latency component is sequential, the one thing parallel hardware can't buy back. And depth buys nothing at all unless the residual-and-norm machinery is in place to make the added layers trainable in the first place.

**Trap.** "GPUs are massively parallel, so extra layers are basically free at inference." Actually wrong: parallelism helps within a layer, across positions. The layers themselves execute in sequence — each added layer adds serial latency to every forward pass that no hardware width absorbs.

**Follow-up.** → [qna-depth-lever-01]

#### [qna-depth-lever-01] (L2) An engineer proposes: "just add more layers — the model should reason better." How do you respond?

**Answer.** The decision rule: treat depth as one lever among several, each with a price — so the right response is neither yes nor no, but probing whether depth is actually the binding lever and what budget is attached. The mechanism of the probe: the proposal isn't crazy on its face — depth is a structural lever, and depth is where multi-step reasoning comes from. But notice everything the one-liner ignores. It says nothing about width — the FFN, where the model's knowledge actually lives; if the model's failures are missing facts rather than missing reasoning steps, depth is the wrong lever entirely. It says nothing about the residual-and-norm machinery that decides whether added depth is even trainable — deep stacks live or die on the highway-plus-regulator design, and pre-norm placement in particular. It says nothing about the encoder-versus-decoder split that determines what those layers can be used for. And it names no budget, when every added layer is another sequential step in every forward pass — a latency cost no amount of parallel hardware can absorb — plus memory and training compute on top. The grounding is the module's own verdict on this exact proposal: probe whether the engineer sees depth as one lever among several, each with a price, because reaching for it blindly is how compute budgets die without buying any reasoning. The boundary: this is a framework answer, not a refusal — with an eval showing multi-step failures and a priced budget, "more layers" can absolutely be the right call.

**Trap.** "Deeper is strictly better if you can afford the training run — reasoning scales with layers." Actually wrong as stated: added depth helps only if multi-step capacity is the binding constraint, the stack's residual/norm design keeps the new layers trainable, and the sequential-latency, memory, and training costs are actually priced — and if the deficit is knowledge, the relevant lever is FFN width, not depth.

---

## L3 cases

#### [qna-case-postnorm-divergence-01] (L3) You inherit a 60-layer transformer that diverges early in training unless the learning-rate warmup is tuned very delicately. Walk me through your diagnosis.

**Answer.** First I'd clarify the facts before touching knobs: where the norm sits in the block code — on the residual stream or inside the branch — how early the divergence hits, and what the loss looks like right before it (a sudden blow-up versus a slow drift). Those facts separate three hypotheses: a learning rate that's simply too high, a data or preprocessing problem, or the architectural one — post-norm at depth, where warmup isn't a nicety but the only thing holding training together. The discriminating test is a read of the block's forward pass. If it computes LayerNorm(x + Sublayer(x)), that's post-norm: the norm sits on the residual stream, so every gradient riding the highway gets rescaled at every single one of the 60 floors. The shaft is no longer pristine, and past a few dozen layers this is exactly the known fragility — deep post-norm models need delicate warmup or they diverge, which matches the symptom precisely: not "warmup helps," but "warmup must be tuned delicately or everything falls apart." If instead the code computes x + Sublayer(LayerNorm(x)) — pre-norm — this hypothesis dies and I'd go back to learning rate and data. Assuming post-norm is confirmed, the decision is to relocate the regulator, not to keep re-tuning around it: move to pre-norm, x + Sublayer(LayerNorm(x)), so the norm regulates only what enters each sublayer and the identity path is never touched — the module's illustration shows sublayer inputs holding near RMS 1.0–1.1 out to layer 24, measured after the norm, while the untouched residual stream grows gently and stays the clean gradient path. That relocation is why GPT-2 and essentially every modern LLM train stably at depth. Two boundaries worth saying aloud: keep warmup scheduled even after the fix — pre-norm makes it non-load-bearing, an ordinary safety habit, not something to delete — and don't reach for RMSNorm expecting stability: that swap is an economy move, roughly the same quality for less arithmetic; placement is the stability decision.

**Trap.** "Just tune the warmup harder — longer and gentler." Actually wrong as a fix: warmup being load-bearing is the symptom, not the disease. Post-norm's rescaled highway is what makes depth fragile; pre-norm removes the fragility instead of permanently managing it.

#### [qna-case-decoder-embeddings-rag-01] (L3) Your team built a RAG system using embeddings pulled from your production generation LLM, and retrieval quality is disappointing. Walk me through it.

**Answer.** First I'd clarify the setup: which model produced the embeddings — the generation LLM itself, or a dedicated embedding model — how retrieval quality is being measured, and whether the corpus, chunking, and queries are sane. Three hypotheses come out of that: a pipeline problem (bad chunking, an indexing or similarity-metric bug), a domain mismatch between the corpus and the queries, or the structural one — the embeddings came from a decoder, and decoder representations are the wrong geometry for retrieval by design. The discriminating test is cheap and decisive: run the same corpus and the same queries through an actual encoder-based embedding model and compare retrieval metrics side by side. If the encoder jumps while nothing else changed, the mask was the problem; if both are equally poor, the failure is in the pipeline or the data, and the architecture is exonerated. The mechanism behind the structural hypothesis: a generation model is a decoder — it carries a causal mask, so each token attends only leftward, an author seeing only the page so far. That's exactly right for writing, but it means every vector the model builds is half-blind by design: constructed without ever seeing the right half of its own passage. The module's production rule is direct — reach into a generation model for embeddings and retrieval quality drops, because the causal mask has distorted the vector geometry relative to what retrieval needs; embedding models for RAG are encoders, where every token attends bidirectionally and each position distills the richest possible summary of the whole passage. Assuming the swap test confirms it, the decision: use an encoder embedding model for the retrieval half and keep the decoder for the generation half — RAG's two halves want the two different family members. The boundary: none of this says the generation model is weak — it may write beautifully. The failure was asking half-blind representations to do a full-vision job.

**Trap.** "The generation model is bigger and smarter than any embedding model, so its embeddings must be at least as good — the bug is elsewhere." Actually wrong: scale doesn't undo the causal mask. The vectors were built half-blind by design, and their geometry underperforms for retrieval regardless of parameter count — encoders for embeddings, decoders for generation.

#### [qna-case-attention-only-stack-01] (L3) A researcher prototypes a "pure attention" model — transformer blocks with the FFNs removed — and finds that adding more layers barely improves it. Walk me through it.

**Answer.** First I'd clarify exactly what was removed and what survived: FFNs gone, but are residuals and norms still in place? Is positional encoding still applied? And what does "barely improves" mean — flat loss curves as depth grows, or degradation? That separates three hypotheses: a trainability problem (if the residual/norm machinery was also disturbed), an evaluation problem, or the structural one — a stack of pure attention cannot benefit from depth because it collapses into a single layer of mixing. The discriminating reasoning for the structural hypothesis is mathematical, which makes it the cheapest test of all: one attention output is a weighted average of value vectors — a linear combination. Stack a second attention layer and you're averaging averages; a third averages those. Averaging averages keeps every vector trapped inside the span of the originals — a hundred stacked attention layers still cannot move a single point off the palette. The weights do shift with the input, but what they produce is always a mix of what's already there — so the tower collapses, mathematically, into one layer of mixing, and each added layer buys sequential latency, memory, and training compute while adding nothing different in kind. That matches "more layers barely improves it" exactly. To confirm empirically rather than by argument: reinstate the FFN in a small variant and watch whether depth starts paying — the FFN's bend through a ReLU or GeLU (expanded 4× in production models; the module's toy: 2×, 8→16) is what folds space and moves vectors off the palette, and it's also where factual associations predominantly live, so removing it removed both the transformer's transformation and most of its knowledge storage. The decision: restore the FFN; attention alone was never the whole machine. The boundary: this is no knock on attention — gathering context across positions is its irreplaceable job; it's that transformation is different in kind from blending, and no quantity of blending supplies it.

**Trap.** "Attention is the transformer's core — an all-attention model just needs longer training." Actually wrong: no amount of training escapes the span of the inputs. A blend of blends is still a blend; the missing nonlinearity is a structural absence, not a convergence problem.

#### [qna-case-vanishing-gradient-01] (L3) A hand-rolled deep network without residual connections trains fine at 4 layers, but at 48 layers the early layers' weights barely move from initialization. Walk me through it.

**Answer.** First I'd clarify the observable: log per-layer gradient norms during training and confirm the pattern — do gradients decay smoothly from the top of the stack to the bottom, or are they uniformly small everywhere? And I'd confirm from the code that there are genuinely no residual connections. The hypotheses: a learning rate too low, dead or saturated activations from bad initialization, or vanishing gradients — the training message shrinking to nothing before it reaches the bottom. The gradient-norm profile is the discriminating test: a learning rate that's too low depresses updates roughly everywhere at once, while vanishing gradients produce a top-to-bottom cliff — healthy magnitudes near the loss, geometric decay downward, near-zero at the early layers. That cliff, combined with "4 layers fine, 48 layers frozen," is the fingerprint. The mechanism: training sends a message backward — the loss instructs the top layer, which passes the message down, handoff after handoff — and every handoff shrinks it a little. The shrinkage compounds multiplicatively: shrink by half per handoff and after a hundred handoffs what remains is 0.5^100 ≈ 8×10⁻³¹ — zero for any practical purpose. At 4 layers the compounding hasn't gone far enough to matter, which is exactly why the shallow version trains fine; at 48, the early layers stand at the bottom of the building waiting for instructions that never arrive. The decision is architectural: add residual connections — output = input + block(input) — so the input rides around each block untouched and the identity path runs unbroken from the loss to the very first layer: a gradient highway no handoff can shrink. And having installed the highway, install the regulator with it: residual additions compound, drifting activation scale (the module's illustrative no-norm figures: RMS 1.0 → 4.8 → 22.0 → 140.0 by layer 24), so add normalization — pre-norm placement, inside the branch, keeping the new highway pristine. The boundary: normalization alone would not have fixed the original problem — norm regulates scale; it does not restore a gradient path.

**Trap.** "Raise the learning rate for the early layers, or just train longer." Actually wrong: the signal is being multiplicatively destroyed — a gradient at the 10⁻³⁰ scale times any sane learning rate is still zero, and more epochs of zero is zero. The fix is a highway, not a schedule.

#### [qna-case-depth-proposal-01] (L3) Leadership asks: "Competitor X's model reasons better, and theirs reportedly has 80 layers to our 32. Should we match their depth?" Walk me through your answer.

**Answer.** First I'd clarify three things: what "reasons better" means concretely — which evals, which failure cases; what budget is actually on the table; and what our model's failures look like under error analysis — missing facts versus broken multi-step chains. Those aren't stalling questions; they decide which lever is even relevant. The hypotheses: depth genuinely is the gap — depth is where multi-step reasoning comes from, so the idea isn't crazy on its face; or the deficit lives in another lever the one-liner ignores — width (the FFN, where the model's knowledge actually lives), the residual-and-norm machinery that decides whether 80 layers even train stably, or the encoder-versus-decoder choice that determines what the stack can be used for. The discriminating test is the error analysis: if our failures are predominantly missing factual associations, that indicts width — FFN capacity — and 48 extra layers of sequential machinery won't supply what's missing; if the failures are genuinely multi-step — each step individually fine, chains falling apart — depth is at least the right family of fix. Then the pricing, which the proposal skipped entirely: every added layer is another sequential step in every forward pass — a latency cost no amount of parallel hardware can absorb, because layer N+1 cannot start before layer N finishes — plus memory and training compute on top. Going 32 → 80 adds 48 sequential steps to every token the model ever serves, and depth shows up directly in cost-per-token. The decision: come back with a priced proposal, not a yes or no — which lever the error analysis actually indicts, what it should buy on the named evals, and what it costs in latency, memory, and training compute — because reaching for depth blindly is how compute budgets die without buying any reasoning. The boundary: matching a competitor's layer count copies their cost structure, not their capability; if the evals point at multi-step failures and the budget is real, deeper may well be the right call — as a costed decision, not a reflex.

**Trap.** "Depth is the reasoning knob, so 80 versus 32 settles it — match them." Actually wrong: depth helps only if multi-step capacity is the binding constraint, the residual/norm design keeps the added layers trainable, and the sequential-latency, memory, and training costs are priced. If the real deficit is knowledge, the relevant lever is FFN width — and copying a layer count copies a bill, not a capability.

---

## Beyond this module

Adjacent questions whose answers live in other GSL modules. Listed as question text → owning module id. (Per spec, these render as links to the owning module's QnA at the exact question ID once those grids exist; until then, module-level links with a "QnA coming" marker.)

1. How are the query, key, and value vectors actually computed, and why is the dot product scaled by √d_k before the softmax? → `attention`
2. What does multi-head attention buy over a single head, and what does each head learn? → `attention`
3. How exactly does RoPE turn a position index into rotations of the query and key vectors — the actual rotation math? → `positional-encoding`
4. How do context-window extension tricks exploit RoPE's relative formulation to stretch a model past its training length? → `positional-encoding`
5. How large does the KV cache grow with context length, layer count, and batch size — and how do you size serving memory for it? → `kv-cache`
6. How does FlashAttention reorganize the attention computation to cut memory traffic without changing the math? → `flashattn`
7. If factual knowledge lives predominantly in FFN weights, why do low-rank adapters (LoRA) work so well for cheaply steering a model? → `lora`
8. What does the decoder stack's next-token training objective actually optimize, and what behaviors fall out of it? → `nextoken`
9. How are encoder embedding models trained for retrieval, and what makes an embedding space good for RAG? → `embeddings`
10. Given a fixed compute budget, how do scaling laws say to split it between model size (depth/width) and training data? → `scaling-laws`
