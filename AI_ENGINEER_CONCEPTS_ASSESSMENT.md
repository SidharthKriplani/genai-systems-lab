# Concepts Depth Assessment + The Complete AI Engineer Curriculum

*An honest audit of GenAI Systems Lab's Concepts layer against a PhD-deep "complete AI Engineer" bar — and a from-scratch teaching of the depth that bar actually requires.*

Prepared for: Avinash · June 2026
Scope: the **Concepts** tab specifically (7 active gyms, 32 interactive modules), assessed against the full breadth + depth of the field.
Format note: math is written in LaTeX. Read in a Markdown viewer with math support (Obsidian, VS Code + Markdown+Math, or paste into the app's GT renderer) for clean rendering.

---

## TL;DR — the verdict before the detail

Your Concepts are **excellent at what they are**, and your platform is honest about what they are. They are not what you're now asking for, and the gap is structural, not cosmetic.

- **What they are:** a best-in-class *intuition and mechanism* layer. Interactive, failure-mode-driven, production-aware, and — crucially — labelled with fidelity tiers (`faithful` / `simplified` / `conceptual`) so they never lie about their own depth. For the job they were built for (turning a working engineer into someone who can *reason about* and *interview on* LLM systems), they are a 9/10.
- **What you're now asking for:** PhD/academic completeness — breadth *and* derivational depth. On that bar the Concepts sit at roughly **a strong undergraduate / early-graduate survey level**, not PhD. That is by design: your own `SKELETON.md` instructs new gyms to stay at `simplified` fidelity to avoid "over-reaching into mathematically complex territory." That instruction is the exact ceiling you're now bumping against.

**The one-line diagnosis:** your modules teach *what happens and why it matters*. PhD-completeness additionally requires *why it must be so* — the derivation, the proof sketch, the failure analysis at the level of equations and complexity bounds, and the open problems at the frontier. You have layer 1 of 3. This report grades layer 1 honestly (Part 1) and then teaches layers 2–3 across the whole stack (Part 2), with a study path to internalize it (Part 3).

**Scores at a glance** (1–10, against the PhD-complete bar, *not* against other learning platforms — against other platforms most of these are 8–10):

| Axis | Score | One-line reason |
|---|---|---|
| **Breadth of topics** | 7.0 | Covers the applied LLM pipeline end to end; thin on classical ML/DL, training systems, theory, interpretability. |
| **Depth per topic** | 4.5 | Mechanism + failure modes, but capped below the math/derivation layer by design. |
| **Mathematical rigor** | 3.0 | Real math in ~3 modules (BPE, sampling, entropy); illustrative-only elsewhere. |
| **Systems/engineering depth** | 5.5 | Cost/latency, observability, KV-cache intuition present; distributed training, quantization internals, serving internals absent. |
| **Research/frontier depth** | 2.5 | Almost no interpretability, alignment theory, or open-problem framing. |
| **Pedagogical quality** | 9.0 | Interactivity + failure-first + honest fidelity badges is genuinely top-tier. |

The rest of this document is the work behind those numbers, then the curriculum that would move the depth scores from ~4 to ~8.

---

# PART 1 — THE HONEST AUDIT

## 1.1 First, define the bar precisely

"Complete AI Engineer, almost PhD" is a real, definable target, not a vibe. A genuinely complete person can operate at **four depths** on any topic, and PhD-level means all four:

1. **Phenomenological** — what the thing does and when it breaks. *(Your modules live here, and live here well.)*
2. **Mechanistic** — the actual computation, step by step, on real (not toy) structures.
3. **Mathematical/derivational** — why the mechanism is the way it is: the objective being optimized, the derivation, the complexity bound, the proof that it's correct or optimal under stated assumptions.
4. **Frontier** — what's unsolved, what the current best methods trade off, what a research contribution in this area would even look like.

And across **two spans**:

- **Breadth** — the full stack: math foundations → classical ML → deep learning → transformers → pretraining → post-training → inference systems → retrieval → agents → evaluation → safety/interpretability → MLOps.
- **Depth** — each of the above carried down to depth 3–4, not stopped at depth 1.

A "complete" AI engineer is closer to an *applied research engineer* at a frontier lab than to a senior product engineer. The distinction that matters: a senior product engineer can wire up and debug an LLM system; the complete engineer can also read the FlashAttention-3 paper, tell you why the IO-complexity argument holds, reproduce a DPO derivation on a whiteboard, and reason about whether a proposed reward model will collapse. That's the bar this report uses.

## 1.2 What the Concepts layer actually is

Inventory (verified against the codebase, not the docs):

- **7 active gyms, 32 fully interactive modules.** Language Models (9), Retrieval (4), Agents (4), Evaluation (4), Production Systems (2), Foundation Models (3), Prompt Engineering (2).
- **A consistent, strong module template:** framing prose → interactive controls → live visualization → *failure-mode demonstration* → "what to notice" callout → fidelity badge → next-step CTA into a Lab.
- **An honesty mechanism most platforms lack:** the `faithful` / `simplified` / `conceptual` fidelity badge. `tokenizer`, `sampling`, and `training-signal` carry real math (BPE merges, softmax/top-k/top-p, entropy & KL). Most others are `simplified` (correct relationships, toy-scale data) or `conceptual` (architecture patterns, no live computation — e.g. `embeddings` uses pre-projected 2D coordinates, not a live encoder).
- **~22 more modules planned** across Safety, Multimodal, Vector Infra, Observability, Cloud, etc. — skeletoned, not built.

This is a genuinely good product. The critique that follows is not "this is bad." It is "this was built to a different specification than the one you just named."

## 1.3 The fidelity ceiling — the central finding

Your `SKELETON.md` contains the load-bearing sentence: new gyms should stay `simplified`, *"not faithful, to avoid over-reaching into mathematically complex territory."* That is the correct decision for an interview-prep / practitioner-onboarding product. It is the **defining constraint** that puts a hard cap on PhD-completeness.

Concretely, the ceiling shows up as three systematic omissions:

1. **Objectives are shown, not derived.** `attention` shows $\text{softmax}(QK^\top/\sqrt{d_k})V$ being computed on a 6-token sentence. It does not derive *why* $\sqrt{d_k}$ (variance control of the dot product), nor why softmax (the max-entropy distribution consistent with a linear constraint / the Gibbs form), nor what attention *is* (kernel smoothing / a differentiable dictionary lookup). Depth 2 ✓, depth 3 ✗.
2. **Toy scale hides the real problems.** The hard parts of every one of these topics — numerical stability, memory hierarchy, distributed sharding, gradient pathologies, statistical noise in eval — only appear at scale. Toy demos are pedagogically right for intuition and *necessarily* silent on the depth-3 content.
3. **No training-systems or theory layer at all.** There is no backprop derivation, no optimizer math, no scaling-law derivation, no distributed-training content, no interpretability, no learning theory. These are not "advanced extras" at PhD level; they're half the curriculum.

None of this is a defect *of the modules*. It's the boundary of the product category. Closing it means adding a new layer, not fixing the existing one (see Part 4).

## 1.4 Coverage matrix — your Concepts vs. the complete curriculum

Legend: ●●● strong (depth 2–3) · ●●○ partial (depth 1–2) · ●○○ token/intuition only · ○○○ absent.

| Domain | Complete-AIE expectation (depth 3–4) | Your coverage | Rating |
|---|---|---|---|
| Math foundations (linalg, prob, optimization, info theory) | Derive backprop, SVD/eigen, convexity, MLE/MAP, entropy/KL/MI | entropy & KL in `training-signal` only | ●○○ |
| Classical ML | Bias–variance, regularization, trees/boosting, calibration, the learning-theory floor | none (assumed prior) | ○○○ |
| Deep learning mechanics | Backprop, optimizers (Adam/AdamW), normalization, init, loss landscape | none explicit | ○○○ |
| Tokenization | BPE/WordPiece/Unigram, byte-fallback, the compression view | `tokenizer` (faithful, BPE) | ●●● |
| Transformer architecture | Full attention math, MHA/MQA/GQA/MLA, RoPE/ALiBi, the residual stream | `attention`,`transformer`,`flashattn`,`seq-parallel` (simplified) | ●●○ |
| Pretraining & scaling | Objectives, data, Chinchilla math, MoE, compute-optimality | `scaling-laws`,`training-signal` (conceptual) | ●○○ |
| Post-training (SFT/RLHF/DPO) | Reward modeling, PPO, DPO derivation, preference-opt frontier | none (LoRA only, adjacent) | ●○○ |
| Parameter-efficient tuning | LoRA/QLoRA math, quantization-aware adaptation | `lora` (simplified) | ●●○ |
| Inference & serving | Decoding, KV-cache math, speculative decoding, quantization, paged attn, batching | `sampling` (faithful), `cost-latency`, `context` | ●●○ |
| Distributed training | DP/TP/PP, ZeRO, FSDP, comms cost | none | ○○○ |
| Embeddings & retrieval | Contrastive training (InfoNCE), ANN (HNSW/IVF-PQ), hybrid+rerank | `embeddings`,`chunking`,`rag-pipeline` (conceptual) | ●●○ |
| Agents | Policy/search view, planning, tool/memory, multi-agent limits | `agent`,`agent-tools`,`multiagent`,`guardrails` | ●●○ |
| Evaluation science | CIs, significance, judge calibration, contamination, IRT | `eval-loop`,`llm-as-judge`,`eval-design`,`debug` | ●●○ |
| Safety & alignment | RLHF limits, red-teaming, jailbreak taxonomy, the alignment problem | planned, not built | ○○○ |
| Interpretability | Superposition, SAEs, circuits, probing | none | ○○○ |
| Multimodal | VLM architectures, CLIP/contrastive, fusion | planned, not built | ○○○ |
| MLOps / production | Tracing, drift, cost attribution, incident response | `observability` + Systems lab | ●●○ |

**Read of the matrix:** the applied-LLM *middle* of the stack is well covered at depth 1–2. The **bottom** (math, classical ML, DL mechanics, training systems) and the **research top** (alignment, interpretability) are where completeness breaks. Those two bands are exactly what separates "senior applied engineer" from "PhD-complete." They are the agenda for Part 2.

---

# PART 2 — THE COMPLETE CURRICULUM, TAUGHT

This half teaches the depth-3/depth-4 content your modules stop short of. It is sequenced as a curriculum: each section names the depth your platform reaches, then carries the topic down to the derivation and the frontier. Read it as the syllabus you'd need to *build* the missing gyms — or to pass a frontier-lab research-engineer screen.

I assume you're fluent in the phenomenological layer (your own product teaches it). So I move fast through "what it is" and spend the words on "why it must be so."

## 2.1 The mathematical floor — what is actually load-bearing

You do not need a math PhD's breadth. You need four objects, understood to the point where you can manipulate them, because *everything else is built from them*.

**(a) The dot product is similarity, and the matrix is a function.** A linear map $W \in \mathbb{R}^{m\times n}$ is the only thing a neural net does between nonlinearities. The two facts that recur everywhere:
- $\langle a, b\rangle = \|a\|\|b\|\cos\theta$ — a dot product is unnormalized cosine similarity. Attention scores, embedding retrieval, and logits are *all* dot products. When you see $QK^\top$, read "all-pairs similarity."
- **SVD**: any $W = U\Sigma V^\top$, with singular values $\sigma_i$. This is the master tool. It explains: why LoRA works (weight *updates* are empirically low-rank, so $\Delta W \approx BA$ with small inner rank captures most of $\Sigma$); why PCA is the top-$k$ singular directions of centered data; why the condition number $\sigma_{\max}/\sigma_{\min}$ governs optimization difficulty; why low-rank attention approximations (Linformer, etc.) are even possible. If you internalize one linear-algebra object for LLMs, make it SVD.

**(b) Probability as the language of objectives.** Models output distributions; training minimizes a divergence between the model's distribution and the data's. The pieces:
- **Entropy** $H(p) = -\sum_x p(x)\log p(x)$ — expected surprise; the lower bound on average code length (Shannon). Your `training-signal` module teaches this — good.
- **Cross-entropy** $H(p,q) = -\sum_x p(x)\log q(x)$ — the average bits to encode $p$'s outcomes using $q$'s code. *The LLM loss is cross-entropy between the one-hot true next token and the model's predicted distribution*, which reduces to $-\log q(\text{true token})$.
- **KL divergence** $D_{KL}(p\,\|\,q) = \sum_x p(x)\log\frac{p(x)}{q(x)} = H(p,q) - H(p)$ — the *excess* bits from using the wrong code; $\ge 0$, asymmetric, not a metric. This single object appears as: the thing minimized in maximum-likelihood training, the regularizer in RLHF and in DPO's closed form, the VAE's ELBO term, and the "how far has the policy drifted" leash. Knowing KL cold pays off more than any other probability fact.
- **Mutual information** $I(X;Y) = D_{KL}\big(p(x,y)\,\|\,p(x)p(y)\big)$ — shared information; the quantity contrastive learning (InfoNCE) actually maximizes a bound on.
- **MLE = minimizing KL to the data distribution.** Maximizing $\sum_i \log q_\theta(x_i)$ over data is, in expectation, minimizing $D_{KL}(p_{\text{data}}\|q_\theta)$. Every "train on next-token prediction" sentence is this identity in disguise.

**(c) Optimization as the engine.** You minimize $L(\theta)$ by gradient descent, $\theta_{t+1}=\theta_t-\eta\nabla L$. The depth-3 facts:
- For **convex** $L$, GD reaches the global min; step size $\eta < 2/\beta$ (where $\beta$ is the gradient's Lipschitz constant / curvature) guarantees descent. Neural nets are *non-convex*, so none of these guarantees hold — yet SGD works. The modern resolution: in massively overparameterized nets, minima are connected in low-loss manifolds and most local minima are near-global; the "landscape" is benign in a way classical theory didn't predict.
- **Stochastic** GD: you use a minibatch estimate $\hat\nabla L$. The noise is not just tolerated — it's a feature (implicit regularization, escaping saddle points). Saddle points, not local minima, are the real obstacle in high dimensions (a random critical point of a high-dim function is overwhelmingly a saddle).
- **The bias–variance / double-descent story.** Classical ML says test error is U-shaped in model size (underfit → sweet spot → overfit). Deep learning shows a *second descent*: past the interpolation threshold (enough params to fit the training set exactly), test error falls again. This is *the* reason "just make it bigger" works and is non-obvious. A complete engineer can explain double descent; this is entirely absent from the Concepts and from most practitioners' mental models.

If your platform added exactly one foundational gym, this section is its spec: SVD, cross-entropy/KL/MI, and the non-convex-but-benign + double-descent optimization picture. Three modules, and they'd lift the whole stack's depth.

## 2.2 Deep learning mechanics — the layer between math and transformers

Your Concepts jump from "math" (barely) straight to "attention." The missing middle is where most depth-3 interview failures happen.

**Backpropagation, actually.** Backprop is just the chain rule applied in reverse topological order, reusing intermediate results (it is reverse-mode automatic differentiation). For a layer $z = Wx$, $a=\phi(z)$, given the upstream gradient $\delta = \partial L/\partial a$:
$$\frac{\partial L}{\partial z} = \delta \odot \phi'(z),\qquad \frac{\partial L}{\partial W} = \frac{\partial L}{\partial z}\,x^\top,\qquad \frac{\partial L}{\partial x} = W^\top \frac{\partial L}{\partial z}.$$
Two consequences a complete engineer reasons from: (1) gradients *multiply* through layers, so if the per-layer Jacobian's singular values are <1 you get **vanishing** gradients, >1 you get **exploding** — this is the whole motivation for residual connections (they make the Jacobian $\approx I + \text{small}$, so signal passes through) and for careful initialization. (2) Activations must be *stored* for the backward pass — that's why training memory $\gg$ inference memory, and why activation checkpointing (recompute instead of store) is a real lever.

**Optimizers, with the equations.** This is a classic depth-3 screen ("derive Adam").
- **SGD + momentum**: $v_t = \mu v_{t-1} + \nabla L$; $\theta_t = \theta_{t-1} - \eta v_t$. Momentum is an exponentially-weighted average of gradients — it damps oscillation across ravines and accelerates along consistent directions.
- **Adam**: maintain first and second moment estimates,
$$m_t = \beta_1 m_{t-1} + (1-\beta_1)g_t,\quad v_t = \beta_2 v_{t-1} + (1-\beta_2)g_t^2,$$
bias-correct $\hat m_t = m_t/(1-\beta_1^t)$, $\hat v_t = v_t/(1-\beta_2^t)$, then update
$$\theta_t = \theta_{t-1} - \eta\,\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon}.$$
The intuition: dividing by $\sqrt{\hat v_t}$ gives each parameter its *own* effective learning rate, scaled down where gradients are large/noisy — a cheap per-coordinate approximation to second-order (curvature) information. The bias correction matters only early, when $m,v$ are still warming up from zero.
- **AdamW**: decouples weight decay from the gradient. In Adam, L2 regularization gets divided by $\sqrt{\hat v}$ too (so it's not true weight decay); AdamW applies $\theta \leftarrow \theta - \eta\lambda\theta$ *separately*. This is why AdamW, not Adam, trains every modern LLM — a small, correct fix with large practical impact. Knowing *why* is a clean depth-3 signal.

**Normalization — and why LLMs switched.** BatchNorm normalizes across the batch (bad for sequences/small batches). **LayerNorm** normalizes across features within one token: $\hat x = (x-\mu)/\sqrt{\sigma^2+\epsilon}$, then scale+shift. **RMSNorm** drops the mean-centering and the bias: $\hat x = x/\sqrt{\tfrac1d\sum x_i^2 + \epsilon}\cdot g$ — cheaper, and empirically just as good, which is why Llama-family models use it. The depth-3 point: normalization's real job in deep nets is *conditioning the optimization* (keeping activation/gradient scales stable across depth), not some statistical nicety. **Pre-norm** (norm inside the residual branch) vs **post-norm** also matters: pre-norm gives cleaner gradient flow and is what makes 100+ layer transformers trainable without delicate warmup.

**Initialization.** Xavier/Glorot and He init choose weight variance so that activation variance is preserved layer-to-layer ($\text{Var}(W)\sim 1/n_{\text{in}}$). Get this wrong and signal vanishes or explodes before training starts. It's unglamorous and load-bearing.

## 2.3 The transformer, all the way down

Your `attention`/`transformer`/`flashattn`/`seq-parallel` modules are the strongest part of the platform and reach a solid depth 2. Here is depth 3.

**Attention, derived (not just computed).** Given inputs $X\in\mathbb{R}^{n\times d}$, project to $Q=XW_Q,\;K=XW_K,\;V=XW_V$. Then
$$\text{Attn}(Q,K,V) = \underbrace{\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)}_{A\,\in\,\mathbb{R}^{n\times n}} V.$$
The three "why"s your module shows but doesn't justify:
- **Why $QK^\top$:** it's the $n\times n$ matrix of dot-product similarities between every query and every key. Attention is *content-based addressing* — a differentiable, soft dictionary lookup where the "address" is similarity in a learned space. This is the single most useful reframe: **attention is soft, differentiable retrieval**, which is *exactly* why RAG and attention are conceptually the same operation at different scales.
- **Why $\sqrt{d_k}$:** if $q,k$ have i.i.d. unit-variance components, $q\cdot k=\sum_{i=1}^{d_k} q_ik_i$ has variance $d_k$. Without scaling, for large $d_k$ the logits have large magnitude, softmax saturates into a near one-hot, and its gradient $\to 0$ (softmax's Jacobian vanishes in the saturated regime). Dividing by $\sqrt{d_k}$ renormalizes the logits to unit variance and keeps gradients alive. This is a 2-minute whiteboard derivation and a very common screen.
- **Why softmax:** softmax is the maximum-entropy distribution given the logits as expected-feature constraints — equivalently the Gibbs/Boltzmann distribution $p_i\propto e^{z_i}$. It's the canonical differentiable "soft argmax."

**Multi-head.** Run $h$ attentions in parallel on $d/h$-dim subspaces and concatenate: $\text{MHA}(X)=[\text{head}_1;\dots;\text{head}_h]W_O$. Why: a single softmax can only put mass in essentially one place; multiple heads let the model attend to different relations simultaneously (syntax, coreference, position) in different subspaces. Interpretability work later found specific heads implement specific algorithms (e.g., **induction heads** that do in-context copy/pattern-completion — the mechanistic substrate of in-context learning).

**The residual stream view (this is the depth-3 mental model).** Don't think of a transformer as a stack of layers transforming a vector. Think of a **residual stream**: a $d$-dimensional vector per token that each block *reads from and writes to* additively ($x \leftarrow x + \text{Attn}(x)$, then $x \leftarrow x + \text{MLP}(x)$). Attention *moves information between token positions*; the MLP *processes information within a position* (and is where most "facts" are stored — MLPs are key–value memories). This decomposition is the foundation of mechanistic interpretability and the cleanest way to reason about what a transformer is doing.

**Positional information.** Self-attention is permutation-equivariant — it has no notion of order on its own. Solutions, in historical order:
- **Sinusoidal** (original): add fixed $\sin/\cos$ signals of geometric frequencies. Cute, but absolute and doesn't extrapolate.
- **RoPE (Rotary)** — what modern models use: *rotate* the query and key vectors by an angle proportional to position, in 2D coordinate pairs. Because attention depends on $q\cdot k$, and rotations preserve inner products while encoding *relative* angle, the score between positions $m$ and $n$ ends up depending only on $m-n$. This gives relative positioning for free inside the dot product, and is why RoPE extrapolates better and why "context-extension" tricks (NTK/YaRN scaling) work by *interpolating the rotation frequencies*.
- **ALiBi**: skip embeddings; add a linear distance penalty $-\lambda|m-n|$ to attention logits. Simple, strong length extrapolation.

**KV cache — the math that governs serving cost.** At generation step $t$ you only need the new query against *all past* keys/values. So you cache K and V. Cache size $= 2 \cdot L \cdot n_{\text{layers}} \cdot n_{\text{kv heads}} \cdot d_{\text{head}} \cdot \text{bytes}$. This grows linearly with sequence length and is the dominant memory cost in long-context inference — and the reason for the next two ideas:
- **MQA / GQA**: share K,V across all heads (MQA) or across groups of heads (GQA), shrinking the cache by the head/group ratio with minimal quality loss. GQA is the modern default. (Your `seq-parallel` gestures at this; the *why* is "cache memory is the binding constraint, and K/V are more shareable than Q.")
- **MLA (Multi-head Latent Attention)**: compress K,V into a low-rank latent that's cached and decompressed on the fly — a further cache reduction popularized by DeepSeek. Reasoning straight from SVD (§2.1a).

**FlashAttention — the IO-complexity argument.** The naive attention materializes the $n\times n$ matrix $A$ in slow GPU HBM, so it's memory-bandwidth bound and $O(n^2)$ in *memory*. FlashAttention never materializes $A$: it tiles Q,K,V into SRAM-sized blocks and computes a *streaming/online softmax* (running max + running normalizer, rescaled as new blocks arrive), so attention becomes $O(n)$ in memory and far faster in wall-clock — *without changing the math*. The depth-3 insight your `flashattn` module shows the symptom of but doesn't state: **modern ML performance is governed by the memory hierarchy (HBM↔SRAM bandwidth), not FLOPs.** That single sentence reframes most systems work in the field.

## 2.4 Pretraining and scaling laws

**The objective is just §2.1b applied autoregressively.** A causal LM factorizes $p_\theta(x_1,\dots,x_n)=\prod_t p_\theta(x_t\mid x_{<t})$ and minimizes the average negative log-likelihood (= cross-entropy) of the next token. **Perplexity** is its exponentiated form, $\text{PPL}=\exp\big(\tfrac1n\sum_t -\log p_\theta(x_t\mid x_{<t})\big)$ — interpretable as the *effective branching factor*, the model's average "how many tokens am I choosing among." Halving loss is exponential in perplexity; this is why small loss deltas matter.

**Scaling laws — the Chinchilla derivation, because it's the one quantitative law of the field.** Empirically, test loss follows a power law in parameters $N$ and data $D$:
$$L(N,D) \approx E + \frac{A}{N^{\alpha}} + \frac{B}{D^{\beta}},$$
with $\alpha,\beta\approx 0.3$–$0.4$ and $E$ an irreducible floor. Training compute is approximately $C \approx 6ND$ FLOPs (the "6" = 2 for the forward multiply-add and 4 for the backward, per parameter per token). The compute-optimal question is: *given a fixed budget $C$, how should I split it between bigger model vs. more data?* Minimize $L$ subject to $6ND=C$ with a Lagrange multiplier; because $\alpha\approx\beta$, the optimum has $N$ and $D$ scaling as roughly $C^{0.5}$ each — i.e. **scale parameters and tokens in tandem (~20 tokens per parameter)**. This is the Chinchilla correction to the earlier "make the model huge" (Kaplan) regime, and it explains why a well-trained 70B model beats a badly-data-starved 175B one. A complete engineer can both state the law *and* run the Lagrangian. Your `scaling-laws` module is conceptual; this is the missing depth.

Two more depth-3 pretraining topics absent from the Concepts:
- **Mixture-of-Experts (MoE).** Replace the dense MLP with $E$ experts and a router that sends each token to top-$k$ experts. You get more *parameters* (capacity) at roughly constant *FLOPs per token* (only $k$ experts fire). The hard parts are load-balancing (auxiliary losses to stop the router collapsing to a few experts) and the all-to-all communication cost. This is how frontier models get to trillions of params affordably.
- **The emergence / "are abilities discontinuous" debate.** Some capabilities appear to jump sharply at scale. A key counter-paper argued these "emergent" jumps are often artifacts of *discontinuous metrics* (exact-match) and smooth out under continuous metrics. Being able to argue *both sides* is the frontier-literacy signal.

## 2.5 Post-training: SFT → reward modeling → RLHF → DPO

This entire band is absent from your Concepts (you have LoRA, which is adjacent mechanics, not alignment). It's also the highest-value depth-3 territory for interviews and for actually shipping good models.

**Stage 1 — SFT.** Supervised fine-tuning on (instruction, good response) pairs: ordinary cross-entropy, but on curated demonstrations. Teaches format and instruction-following; cannot teach "better than the best demo you wrote."

**Stage 2 — reward modeling (Bradley–Terry).** Humans give *preferences* ($y_w \succ y_l$), not scores, because relative judgment is more reliable. The Bradley–Terry model says the probability that $y_w$ beats $y_l$ is
$$P(y_w \succ y_l\mid x) = \sigma\big(r(x,y_w) - r(x,y_l)\big),$$
so you train a reward model $r_\phi$ by minimizing $-\log\sigma(r_\phi(x,y_w)-r_\phi(x,y_l))$. The reward model is a learned, scalar proxy for human judgment.

**Stage 3 — RLHF / PPO, as a constrained objective.** Optimize the policy to maximize reward *without drifting too far from the SFT model* (or it games the reward and forgets language):
$$\max_{\pi_\theta}\ \mathbb{E}_{x,\,y\sim\pi_\theta}\big[r_\phi(x,y)\big] \;-\; \beta\, D_{KL}\!\big(\pi_\theta(y\mid x)\,\|\,\pi_{\text{ref}}(y\mid x)\big).$$
PPO optimizes this with a clipped surrogate objective that prevents destructively large policy updates:
$$L^{\text{CLIP}}(\theta)=\mathbb{E}\big[\min(\rho_t A_t,\ \text{clip}(\rho_t,1-\epsilon,1+\epsilon)A_t)\big],\quad \rho_t=\tfrac{\pi_\theta(a_t)}{\pi_{\text{old}}(a_t)},$$
with $A_t$ the advantage. The KL term is the "leash"; $\beta$ sets its tension. RLHF is powerful but operationally brutal: four models in memory (policy, reference, reward, value), unstable, expensive.

**Stage 3′ — DPO, derived (the elegant result worth knowing cold).** Direct Preference Optimization removes the RL loop. The trick: the KL-constrained objective above has a *closed-form optimum*,
$$\pi^*(y\mid x) = \frac{1}{Z(x)}\,\pi_{\text{ref}}(y\mid x)\,\exp\!\Big(\tfrac1\beta r(x,y)\Big).$$
Solve this for the reward: $r(x,y)=\beta\log\frac{\pi^*(y\mid x)}{\pi_{\text{ref}}(y\mid x)} + \beta\log Z(x)$. Substitute into the Bradley–Terry loss — the intractable partition function $Z(x)$ *cancels* because it appears in both the winner and loser terms — and you get a simple supervised loss directly on the policy:
$$L_{\text{DPO}} = -\mathbb{E}_{(x,y_w,y_l)}\Big[\log\sigma\Big(\beta\log\tfrac{\pi_\theta(y_w\mid x)}{\pi_{\text{ref}}(y_w\mid x)} - \beta\log\tfrac{\pi_\theta(y_l\mid x)}{\pi_{\text{ref}}(y_l\mid x)}\Big)\Big].$$
The model *is* its own implicit reward model. No reward network, no sampling loop, no RL instability. Reproducing this derivation on a whiteboard is one of the cleanest depth-3 demonstrations in the entire field.

**The frontier (so you sound current).** GRPO (drops the value network, normalizes advantage within a group of sampled answers — the basis of recent reasoning-model RL), and the broader **RLVR** (RL from *verifiable* rewards: math/code where correctness is checkable, sidestepping reward-model error) are where reasoning models like the o-series / R1-style training live as of 2025–26. The unifying tension to be able to discuss: **reward over-optimization / Goodhart** — push hard on a proxy reward and you maximize the proxy while *degrading* true quality. KL leashes, verifiable rewards, and process supervision are all attempts to manage this. (Flag: this band moves fast; verify specifics before quoting them as current.)

## 2.6 Parameter-efficient tuning and quantization

Your `lora` module reaches a fair depth 2. The math and its cousins:

**LoRA.** Freeze $W_0$; learn a low-rank update $\Delta W = BA$ with $B\in\mathbb{R}^{d\times r}$, $A\in\mathbb{R}^{r\times k}$, $r\ll d$. Forward: $h=W_0x + \tfrac{\alpha}{r}BAx$. You train $\sim 2dr$ params instead of $dk$ — often <1%. *Why it works* (straight from SVD, §2.1a): the weight *change* induced by fine-tuning has low "intrinsic rank" — adaptation lives in a tiny subspace, so a rank-$r$ factor captures it. $A$ is init random, $B$ init zero, so training starts exactly at the pretrained model. $\alpha/r$ is a scaling knob.

**QLoRA.** LoRA on top of a **4-bit quantized** frozen base. Three ideas worth naming: **NF4** (a 4-bit datatype whose quantization levels are the quantiles of a normal distribution — information-theoretically matched to how weights are actually distributed), **double quantization** (quantize the quantization constants too), and **paged optimizers** (spill optimizer state to CPU to survive memory spikes). Net effect: fine-tune a 65B model on a single 48GB GPU. The principle: you can *adapt* in low precision because the gradients flow only through the small high-precision LoRA adapters.

**Post-training quantization (inference).** Mapping weights/activations from fp16 to int8/int4/fp8. The depth-3 distinctions: **GPTQ** (layer-wise, uses second-order/Hessian info to quantize weights while minimizing output error), **AWQ** (activation-aware — protect the ~1% of "salient" weight channels that activations are most sensitive to), and **the outlier problem** (a few activation dimensions have huge magnitude and wreck naive int8 — LLM.int8() handles them in a separate fp16 path). The governing fact: LLM inference is *memory-bandwidth bound*, so halving the bytes per weight roughly doubles throughput — quantization buys speed *and* memory, which is why it's ubiquitous.

## 2.7 Inference and serving systems

Your `sampling` (faithful), `context`, and `cost-latency` modules cover decoding and the cost intuition. The serving internals — the systems-engineering heart of "complete" — are missing.

**The two-phase cost model.** Inference has a **prefill** phase (process the whole prompt in parallel — compute-bound, fast per token) and a **decode** phase (generate one token at a time — memory-bandwidth-bound, slow). This split explains every latency metric: **TTFT** (time to first token) is dominated by prefill; **TPOT/ITL** (inter-token latency) by decode. Long prompts hurt TTFT; long generations hurt total time. Optimizations target the phases differently (chunked prefill, prefix caching for the former; speculative decoding, better batching for the latter).

**Continuous (in-flight) batching.** Naive batching waits for the whole batch to finish the longest sequence — GPU idles. Continuous batching swaps finished sequences out and new ones in *at each step*, keeping the GPU saturated. This is the single biggest throughput win in modern serving (vLLM, TGI) and the reason serving cost/token fell so fast.

**PagedAttention.** The KV cache is the memory bottleneck (§2.3). PagedAttention manages it like virtual memory: KV is stored in fixed-size *pages* (non-contiguous), eliminating fragmentation and enabling *prefix sharing* (multiple requests with a common prompt prefix share the same physical KV pages). This is what lets a server hold many more concurrent sequences.

**Speculative decoding — with the correctness argument.** A small "draft" model proposes $k$ tokens cheaply; the big "target" model verifies them in a *single parallel forward pass*. Accept the longest prefix the target agrees with via a modified rejection-sampling rule, and the math guarantees the output distribution is **exactly** the target model's — you get a speedup with *zero* quality change, because the target still has the final say on every token. The win comes from turning $k$ sequential expensive steps into one parallel verification. Knowing *why it's unbiased* (the accept/reject correction) is the depth-3 point most people miss.

**The roofline frame.** Whether a kernel is compute-bound or memory-bound is set by its *arithmetic intensity* (FLOPs per byte moved) vs. the hardware's FLOP:bandwidth ratio. LLM decode is firmly memory-bound, which is why batching (reuse loaded weights across many sequences), quantization (fewer bytes), and KV tricks dominate — and why "buy more FLOPs" often does nothing. This is the unifying systems mental model.

## 2.8 Distributed training (entirely absent — and half of "training" at scale)

You cannot train anything interesting on one GPU, so this is core, not exotic.

- **Data parallelism (DP):** replicate the model, split the batch, all-reduce gradients. Simple; limited by per-GPU memory (the whole model must fit).
- **ZeRO / FSDP:** *shard* the optimizer states, gradients, and finally parameters across DP ranks instead of replicating — ZeRO stages 1/2/3 progressively remove the redundancy, gathering params just-in-time for each layer. This is what lets data-parallel training scale to models that don't fit on one device. (Knowing that Adam stores 2 extra states per param — so optimizer state is ~2× the model — explains why sharding *it* first, ZeRO-1, is the cheap big win.)
- **Tensor parallelism (TP):** split individual matmuls across GPUs (e.g., shard the attention heads / MLP columns), with all-reduces inside each layer. High communication; kept within a fast NVLink node.
- **Pipeline parallelism (PP):** split *layers* across GPUs and stream micro-batches through, overlapping stages to fill the "pipeline bubble."
- **The real game is 3D/4D parallelism:** compose DP × TP × PP (× expert-parallel for MoE) to fit and feed a model across thousands of GPUs, trading off the *communication cost* of each axis against the network topology. The depth-3 fluency is reasoning about *which* axis to grow given an interconnect — that's the actual job of a pretraining systems engineer.

## 2.9 Retrieval and RAG, to the algorithm level

Your `embeddings`/`chunking`/`rag-pipeline` modules are conceptual (2D projections, curated chunks). The depth-3 content is the *training* of embeddings and the *algorithms* of search.

**How embeddings are actually trained — contrastive learning / InfoNCE.** An encoder is trained so that a query and its relevant passage land close, and irrelevant passages land far. The InfoNCE loss for a query $q$ with positive $k^+$ and negatives $\{k^-_j\}$:
$$L = -\log \frac{\exp(\text{sim}(q,k^+)/\tau)}{\exp(\text{sim}(q,k^+)/\tau) + \sum_j \exp(\text{sim}(q,k^-_j)/\tau)}.$$
This is just a softmax cross-entropy where the "classes" are candidate passages; minimizing it maximizes a lower bound on the mutual information between query and relevant doc. Two depth-3 facts: **hard negatives** (plausible-but-wrong passages) are what actually teach the model the fine distinctions — random negatives are too easy; and **temperature $\tau$** controls how sharply the model separates positives from negatives. This is why "just use cosine similarity" is the *inference* story and contrastive training is the *real* story.

**Approximate nearest neighbor (ANN) — the algorithms.** Exact search over millions of vectors is $O(N)$ per query — too slow. The two families:
- **HNSW (graph-based):** build a multi-layer "navigable small world" graph; upper layers are sparse (long hops), lower layers dense (fine steps). Search = greedy descent: start at the top, hop to the neighbor closest to the query, drop a layer, repeat. Expected query time is **$O(\log N)$**. The tunable knobs map to a recall/latency/memory triangle: $M$ (neighbors per node), `efConstruction`, `efSearch`. HNSW is the default in most vector DBs and a near-certain interview topic.
- **IVF-PQ (cluster + compress):** partition vectors into Voronoi cells (IVF) so you only scan a few cells per query (`nprobe`); and **Product Quantization** compresses each vector by splitting it into sub-vectors and replacing each with the id of its nearest centroid in a small codebook — turning distance computation into fast table lookups and shrinking memory ~10–50×. The tradeoff: PQ is lossy, so recall drops; you tune codebook size vs. accuracy. This is how billion-scale retrieval fits in RAM.

**Hybrid search and fusion.** Dense (semantic) retrieval misses exact terms (names, codes, rare tokens); sparse retrieval (BM25 — a TF-IDF variant with term saturation and length normalization) misses paraphrase. Combine them. **Reciprocal Rank Fusion** merges ranked lists without score calibration: $\text{RRF}(d)=\sum_i \frac{1}{k+\text{rank}_i(d)}$ — robust because it uses ranks, not raw scores. The depth-3 point: dense and sparse fail on *different* queries, so the union beats either alone, and rank-fusion sidesteps the un-comparable-scores problem.

**Two-stage retrieval (retrieve → rerank).** A bi-encoder retrieves top-$k$ cheaply (query and doc encoded *independently*, so docs are pre-indexed). A **cross-encoder** reranker then scores each (query, doc) *jointly* in one transformer pass — far more accurate because query and doc tokens attend to each other, but $O(k)$ expensive, so it's only viable on the shortlist. This retrieve-cheap-then-rerank-precisely pattern is the backbone of every serious RAG system, and the bi-encoder-vs-cross-encoder distinction (which your platform *does* cover well) is exactly the "independent vs. joint encoding" tradeoff.

**The honest failure decomposition.** RAG quality is a chain: *chunking → embedding → retrieval (recall@k) → reranking → context assembly → generation faithfulness*. A complete engineer debugs by **localizing** which link failed (is the right chunk even in the index? is it retrieved but ranked low? retrieved but ignored by the generator?) — measuring retrieval recall and generation faithfulness *separately*. This decomposition is the genuinely useful skill, and it's where your `debug` module points but doesn't fully formalize.

## 2.10 Agents — the formal view and the honest limits

Your four agent modules cover patterns well. The depth-3 layer is the *framing* and the *failure math*.

**Agents are policies doing search over an environment.** Strip the hype: an LLM agent is a policy $\pi$ that, given a state (context + history), emits an action (a tool call or a token), receives an observation, and repeats. This is the classic perception–action loop; "ReAct" is just interleaving reasoning traces with actions in the prompt. Viewing it as **search** (the agent explores a tree of action sequences toward a goal) immediately tells you the levers: better *state representation* (memory), better *action selection* (planning/reflection), better *value estimation* (which branch is worth pursuing — the idea behind tree-of-thoughts / MCTS-style agents).

**The compounding-error problem (the limit to internalize).** If each step succeeds with probability $p$, a $k$-step task succeeds with $\approx p^k$. At $p=0.95$ and $k=20$, that's $0.36$. This exponential decay is *the* fundamental reason long-horizon autonomous agents are unreliable, and it reframes most "agent engineering" as **error-rate reduction and recovery**: verification/critique steps, constraining the action space, human checkpoints on irreversible actions, and idempotent/retryable tool design. Your `guardrails` module is the practitioner face of this; the math is *why* it's necessary.

**Tool use, memory, multi-agent — the real tradeoffs.** Tool use is grounding (offload computation/facts to reliable external functions); the failure mode is the model calling the wrong tool or mis-parsing results — mitigated by typed schemas and verification. Memory is context management under a finite window (the retrieval problem again, applied to the agent's own history). Multi-agent systems trade *parallelism and specialization* against *coordination cost and compounding miscommunication* — and the honest finding is that a single well-orchestrated agent often beats a multi-agent swarm, so "multi-agent" should be justified, not assumed. That skeptical, tradeoff-first stance is itself a depth-3 signal.

## 2.11 Evaluation science — the rigor almost everyone skips

Your eval gym is one of the better-covered areas, but the *statistics* of evaluation — what makes it a science rather than vibes — is the missing depth, and it's where senior people are separated from staff/research people.

**An eval result is an estimate with uncertainty.** If your model scores 72% on 200 examples, that is a sample statistic, not a truth. The standard error is $\sqrt{p(1-p)/n}\approx 3.2\%$, so the 95% CI is roughly $72\%\pm 6\%$. **A 2-point benchmark difference on a small set is noise.** Reporting eval numbers without confidence intervals is the field's most common rigor failure; being the person who computes them is a differentiator.
- **Comparisons must be paired.** To compare model A vs. B, run them on the *same* items and test the per-item differences (paired bootstrap, or McNemar's test for binary outcomes). Paired tests cancel item-difficulty variance and are far more powerful than comparing two independent averages.
- **Multiple comparisons inflate false positives.** Evaluate 20 prompt variants and one will look "significantly" best by chance ($1-0.95^{20}\approx 64\%$ chance of a spurious win). Correct for it (Bonferroni/FDR) or you'll ship noise.

**LLM-as-judge — the calibration and bias problem.** Using a model to grade outputs is scalable but biased: documented **position bias** (favoring the first option — mitigate by swapping order and averaging), **verbosity/length bias** (longer looks better), **self-preference** (a model rating its own family higher), and sensitivity to the rubric's wording. The discipline: validate the judge against human labels (measure agreement — Cohen's $\kappa$, not raw accuracy, because $\kappa$ corrects for chance agreement), calibrate, and report judge–human agreement as a number. Your `llm-as-judge` module raises the issue; the depth-3 move is *quantifying* judge reliability.

**Benchmark contamination and Goodhart.** Public benchmarks leak into training data, so high scores can reflect memorization, not capability — detectable via canary strings, train/test n-gram overlap, or held-out perturbations. And once a benchmark becomes a target it stops measuring what it did (Goodhart). The complete engineer treats every published number with "was this contaminated?" and builds *private, freshly-generated* eval sets for anything that matters.

**Item response theory (the academic ceiling).** Borrowed from psychometrics: model the probability that model $j$ gets item $i$ right as a function of the model's latent *ability* $\theta_j$ and the item's *difficulty* $b_i$ and *discrimination* $a_i$: $P(\text{correct})=\sigma(a_i(\theta_j-b_i))$. This lets you (a) get a far better ability estimate than raw accuracy by weighting hard, discriminating items more, and (b) *prune* easy/redundant items to build efficient benchmarks. This is roughly the frontier of eval methodology and signals genuine academic depth.

## 2.12 Safety, alignment, and interpretability — the research top of the stack

Entirely absent from the Concepts (planned only). At the "almost PhD" bar this is not optional; it's the half of the field that frontier labs are actually bottlenecked on.

**The alignment problem, stated precisely.** We can specify *objectives* (a reward, a loss), but not *intentions*. Two failure modes follow: **outer misalignment** (the specified objective is itself wrong — reward hacking, specification gaming) and **inner misalignment** (the model learns a proxy goal that matched the objective in training but diverges off-distribution — "goal misgeneralization"). RLHF is the current practical alignment method, and its known limits are exam-worthy: it aligns to *what raters approve of*, which can mean **sycophancy** (telling people what they want to hear) and optimizing *plausibility over truth*; raters can't supervise outputs they can't evaluate (the **scalable oversight** problem, which motivates ideas like debate, recursive reward modeling, and constitutional AI / RLAIF where a model critiques itself against written principles).

**Mechanistic interpretability — the genuinely academic frontier.** The project of reverse-engineering the *algorithms* a network has learned, in the residual-stream frame (§2.3). The load-bearing concepts:
- **Superposition:** networks represent *more features than they have dimensions* by encoding them as near-orthogonal directions that overlap slightly — which is *why* individual neurons are polysemantic (fire for unrelated concepts) and why interpretability is hard. This is one of the most important conceptual results in the area.
- **Sparse autoencoders (SAEs):** train an overcomplete, sparse dictionary to *decompose* a layer's activations into many monosemantic features — the leading current tool for pulling interpretable features out of superposition.
- **Circuits and induction heads:** specific, identifiable sub-computations implemented by attention heads + MLPs. **Induction heads** (attend-back-and-copy) are the mechanistic basis of in-context learning — a concrete, proven example of "we found the algorithm inside the weights."
- **Probing and causal interventions:** train classifiers on activations to test what's linearly represented; use activation patching / ablation to establish *causal* (not just correlational) roles for components.

**Red-teaming and adversarial robustness.** Jailbreaks (prompt injection, role-play attacks, many-shot, gradient-based suffix attacks like GCG), the **indirect prompt injection** threat (malicious instructions hidden in retrieved/tool-returned content — the central security problem of agentic + RAG systems), and the defense stack (input/output filtering, instruction hierarchies, privilege separation, adversarial training). The honest depth-3 stance: there is currently **no robust general defense** against a determined adversary, so production safety is defense-in-depth plus limiting the blast radius of any single failure — which connects straight back to the agent error-rate discussion (§2.10).

This section, more than any other, is what would take your platform from "best practitioner trainer" to "credible at the PhD/academic bar."

---

# PART 3 — CLOSING THE GAP: A STUDY PATH

The fastest route from your platform's depth (≈4/10) to PhD-completeness (≈8/10) is not "read more blog posts." It's the three classic moves of graduate study: **(1) derive the load-bearing results yourself, (2) read the primary papers, not summaries, (3) implement the core algorithm from scratch.** Below, per band, the minimum canonical set and the one build that locks it in.

**Sequencing.** Do them in this order; each unlocks the next. Budget ~10–14 weeks at serious part-time pace.

1. **Math + DL mechanics (2 wks).** Goldberg's framing of NLP math, or 3Blue1Brown for linear-algebra/calculus intuition, then Goodfellow *Deep Learning* (ch. 4–8) for optimization and backprop. **Build:** a 2-layer MLP with backprop in pure NumPy, no autograd. You don't understand backprop until you've debugged your own.
2. **Transformers, fully (2 wks).** "Attention Is All You Need" (read it adversarially — *why* every choice), then Karpathy's *Let's build GPT* / nanoGPT, then the RoPE paper and the FlashAttention paper (read the IO-complexity argument until it's obvious). **Build:** a small GPT from scratch and a from-scratch attention kernel; implement a KV cache and measure the memory.
3. **Pretraining + scaling (1 wk).** The Chinchilla paper (do the Lagrangian yourself), the GPT-3 paper (in-context learning), one MoE paper (Switch Transformer or Mixtral report). **Exercise:** given a FLOP budget, compute compute-optimal $N,D$ on paper.
4. **Post-training (1.5 wks).** InstructGPT (the RLHF recipe), the PPO paper, then the DPO paper — and reproduce the DPO derivation cold. Skim a current reasoning-RL report (GRPO/RLVR) for the frontier. **Build:** implement DPO on a tiny model with a toy preference set.
5. **Inference + systems (1.5 wks).** The vLLM/PagedAttention paper, the speculative decoding paper (understand the unbiasedness proof), one quantization paper (GPTQ or AWQ), and the ZeRO paper. **Build:** profile a real model's prefill vs. decode; quantize it and measure the throughput change.
6. **Retrieval (1 wk).** The DPR paper (dense retrieval + in-batch negatives), the HNSW paper, the original RAG paper, and a cross-encoder reranking paper. **Build:** implement HNSW search (even a slow version) and a BM25 + dense hybrid with RRF.
7. **Evaluation science (1 wk).** A measurement-focused paper on LLM eval pitfalls, the "Are emergent abilities a mirage?" paper, and a primer on bootstrap CIs and IRT. **Build:** wrap any eval you run with a paired bootstrap CI — then never report a bare number again.
8. **Safety + interpretability (2 wks).** Anthropic's "Toy Models of Superposition" and the "Mathematical Framework for Transformer Circuits" / induction-heads work, the Constitutional AI paper, and a prompt-injection / jailbreak survey. **Build:** train a small SAE on a layer's activations and find a monosemantic feature; attempt one indirect-prompt-injection attack on your own RAG demo and defend it.

**Two meta-habits that define the "almost PhD" level:** (a) for every method, be able to state *what objective it optimizes and what it trades off* — not just what it does; (b) for every claim, ask *"what's the experiment, what's the confidence interval, and could it be contaminated?"* Skepticism with receipts is the actual PhD skill.

---

# PART 4 — WHAT THIS MEANS FOR THE PLATFORM

Three honest conclusions, since you asked as the person who built this.

**1. Don't retrofit PhD depth into the existing modules — it would break them.** Your modules are tuned for a different reader (the engineer building intuition / prepping interviews), and their power comes from *restraint*: one idea, interactive, failure-first, honestly labelled. Cramming derivations in would wreck the pedagogy that makes them a 9/10 at their actual job. The fidelity badge is doing exactly what it should — telling the truth about scope.

**2. If you want this bar, add a layer, don't deepen the existing one.** The clean architecture is a **"Derivation" / "Math mode" toggle** on each module — a collapsible depth-3 panel that carries the *same* concept down to the objective, the derivation, and one canonical paper link. `attention` already shows $\text{softmax}(QK^\top/\sqrt{d_k})V$; the toggle adds the $\sqrt{d_k}$ variance argument and the kernel-retrieval framing from §2.3. This preserves the simplified default *and* serves the complete-engineer reader, with the fidelity badge flipping `simplified → faithful` when the panel is open. It also reuses your existing GT block format and three-lens reading mode — it's an extension of patterns you already have, not a new system.

**3. The biggest *content* gaps, in priority order, are the two bands that bound the stack:** the **foundation floor** (one gym: SVD / cross-entropy-KL-MI / optimization-and-double-descent / backprop / optimizers — §2.1–2.2) and the **research top** (alignment + interpretability — §2.12). Those two are what currently make the honest answer to "is this PhD-complete?" a *no*. The applied middle (transformers → retrieval → agents → eval) is already strong enough that depth toggles, not new gyms, would finish it.

**Bottom line to your question.** As an interactive trainer for working AI engineers, your Concepts are genuinely excellent — among the best of their kind, and honest about their scope. Measured against the "super advanced, almost-PhD, breadth *and* depth" bar you set, they are a strong survey that stops one full layer short of completeness — by deliberate design. This document is that missing layer, taught. Close it with the depth toggle on the platform and the study path for yourself, and you'd have something that's defensible at the academic bar, not just the practitioner one.

---

*Caveats: math and core results here are stable, established field knowledge. Frontier items explicitly flagged — reasoning-RL variants (GRPO/RLVR), the newest quantization/attention methods (MLA), and specific model details — move quickly; verify against current primary sources before quoting them as state-of-the-art. Paper titles are referenced by their canonical names rather than links so you can pull the authoritative version.*

