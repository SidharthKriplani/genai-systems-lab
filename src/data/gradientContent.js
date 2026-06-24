// src/data/gradientContent.js
// ─── GRADIENT LAYER — depth-3 / PhD content per Concepts module ────────────────
// Soft-locked behind full access (isAccessGranted). Rendered by <GradientPanel>.
// Each module maps to an array of blocks. Block schema:
//   { t: "h",    c: "subheading" }
//   { t: "p",    c: "prose paragraph" }
//   { t: "math", c: "centered monospace equation (unicode)" }
//   { t: "list", c: ["bullet", "bullet"] }
//   { t: "key",  c: "the 'why it must be so' insight" }
//   { t: "refs", c: ["Author Year — Title", ...] }
// Rollout: to add a gym, add its module ids here. No Concepts.jsx surgery needed.

export const GRADIENT_CONTENT = {
  // ── Language Models gym ─────────────────────────────────────────────────────
  tokenizer: [
    { t: "h", c: "The compression view" },
    { t: "p", c: "BPE is a greedy approximation to a minimum-description-length objective: find the vocabulary and segmentation that minimize the corpus's total encoded length. Exactly optimizing that is intractable, so BPE approximates bottom-up — start from bytes/characters and repeatedly merge the most frequent adjacent pair, because the most frequent pair yields the largest immediate reduction in sequence length per vocabulary slot spent." },
    { t: "math", c: "merge* = argmax over (a,b) of count(a,b)      // greedy MDL step" },
    { t: "key", c: "Tokenization is a compression problem, not a linguistic one. The tokenizer never sees meaning — only co-occurrence statistics. 'tokenization' is one token because it is frequent; 'antidisestablishment' fragments because it is not." },
    { t: "h", c: "BPE vs Unigram — two different objectives" },
    { t: "p", c: "BPE builds vocabulary bottom-up by merging. The Unigram LM tokenizer (SentencePiece) goes top-down: start from a large candidate vocabulary, give each token a probability, and iteratively prune the tokens whose removal least hurts corpus likelihood under a unigram model. Inference segmentation is then a Viterbi search for the most probable split — so Unigram is probabilistic and admits multiple segmentations, while BPE is deterministic and greedy." },
    { t: "math", c: "Unigram:  maximize  Σ_x log( Σ over segmentations s of  Π_(t∈s) p(t) )" },
    { t: "h", c: "Byte-level fallback" },
    { t: "p", c: "Modern tokenizers (GPT-2 onward) operate on UTF-8 bytes, not Unicode characters, so the base vocabulary is exactly 256 and nothing is ever out-of-vocabulary — any string, emoji, or code point is representable. The cost: rare or multibyte characters fragment into several tokens." },
    { t: "key", c: "Consequences a complete engineer reasons from: arithmetic is unreliable partly because numbers tokenize inconsistently (different digit groupings); non-English text costs 2–5× more tokens for the same information; code identifiers split on subword boundaries, which is why models sometimes 'misread' variable names." },
    { t: "refs", c: ["Sennrich, Haddow & Birch 2016 — Neural Machine Translation of Rare Words with Subword Units (BPE)", "Kudo 2018 — Subword Regularization (Unigram LM)", "Kudo & Richardson 2018 — SentencePiece"] },
  ],

  attention: [
    { t: "h", c: "The derivation, not the computation" },
    { t: "p", c: "Project inputs X ∈ ℝ^(n×d) into queries, keys, values: Q=XW_Q, K=XW_K, V=XW_V. The score matrix QKᵀ is the n×n matrix of dot products between every query and every key — all-pairs similarity. Attention is content-based addressing: a differentiable, soft dictionary lookup whose address is similarity in a learned space." },
    { t: "math", c: "Attn(Q,K,V) = softmax( QKᵀ / √dₖ ) · V" },
    { t: "key", c: "The deepest reframe: attention is soft, differentiable retrieval. This is exactly why RAG and attention are the same operation at different scales — both score a query against keys and return a similarity-weighted mixture of values." },
    { t: "h", c: "Why the √dₖ (the variance argument)" },
    { t: "p", c: "If components of q and k are independent with zero mean and unit variance, then q·k = Σᵢ qᵢkᵢ is a sum of dₖ independent unit-variance terms, so it has variance dₖ and standard deviation √dₖ. Without rescaling, for large dₖ the logits grow large, softmax saturates toward one-hot, and its Jacobian diag(p) − ppᵀ vanishes — killing the gradient. Dividing by √dₖ renormalizes logits to unit variance and keeps gradients alive." },
    { t: "math", c: "Var(q·k) = Σᵢ Var(qᵢkᵢ) = dₖ    ⟹    divide logits by √dₖ" },
    { t: "h", c: "Why softmax, why multi-head" },
    { t: "p", c: "softmax(z)ᵢ ∝ exp(zᵢ) is the maximum-entropy distribution consistent with the logits as expected-feature constraints — the Gibbs/Boltzmann form, the canonical differentiable soft-argmax. Multi-head runs h attentions on d/h-dimensional subspaces in parallel: one softmax can concentrate mass in essentially one place, so multiple heads attend to different relations (syntax, coreference, position) at once." },
    { t: "key", c: "Mechanistic interpretability later found specific heads implement specific algorithms — most famously induction heads (attend-back-and-copy), the proven substrate of in-context learning. Attention is O(n²) in both compute and memory, which is the entire motivation for the FlashAttention and KV-cache modules." },
    { t: "refs", c: ["Vaswani et al. 2017 — Attention Is All You Need", "Elhage et al. 2021 — A Mathematical Framework for Transformer Circuits", "Olsson et al. 2022 — In-context Learning and Induction Heads"] },
  ],

  transformer: [
    { t: "h", c: "The residual stream is the real object" },
    { t: "p", c: "Don't picture a stack of layers transforming a vector. Picture a residual stream: a d-dimensional vector per token that every block reads from and writes to additively. Attention moves information between positions; the MLP processes information within a position. Each sub-layer adds its output back to the stream." },
    { t: "math", c: "x ← x + Attn(LayerNorm(x))    then    x ← x + MLP(LayerNorm(x))" },
    { t: "key", c: "This additive structure is why deep transformers train at all. The residual connection makes each block's Jacobian ≈ I + (small), so gradients flow through the identity path without vanishing — without residuals, a 100-layer transformer is untrainable." },
    { t: "h", c: "The MLP is memory; attention is routing" },
    { t: "p", c: "The feed-forward block — typically W₂·φ(W₁x) with a ~4× hidden expansion — acts as a key–value memory: the first matrix's rows are keys that detect input patterns, the second matrix's columns are values written back to the stream. This is where most factual associations live, which is why fact-editing methods (ROME, MEMIT) target MLP weights, not attention." },
    { t: "h", c: "Normalization and its placement" },
    { t: "p", c: "LayerNorm normalizes across features within one token, then scales and shifts. RMSNorm drops mean-centering and bias and is cheaper with no quality loss, which is why Llama-family models use it. Pre-norm (normalize inside the residual branch, as above) gives cleaner gradient flow than the original post-norm and is what lets modern transformers skip delicate learning-rate warmup." },
    { t: "math", c: "RMSNorm(x) = x / √( (1/d)·Σ xᵢ² + ε ) · g" },
    { t: "refs", c: ["Vaswani et al. 2017 — Attention Is All You Need", "Geva et al. 2021 — Transformer Feed-Forward Layers Are Key-Value Memories", "Zhang & Sennrich 2019 — Root Mean Square Layer Normalization", "Xiong et al. 2020 — On Layer Normalization in the Transformer Architecture"] },
  ],

  flashattn: [
    { t: "h", c: "The IO-complexity argument" },
    { t: "p", c: "Standard attention materializes the full n×n score matrix A = softmax(QKᵀ/√dₖ) in slow GPU HBM, reads and writes it, then multiplies by V. The bottleneck is not arithmetic — it is the O(n²) reads/writes to HBM. FlashAttention never materializes A: it tiles Q, K, V into blocks sized to fit in fast on-chip SRAM and computes attention block-by-block with a streaming (online) softmax." },
    { t: "math", c: "HBM traffic:  standard  Θ(n² + n·d)   →   Flash  Θ(n²·d² / M)    (M = SRAM size)" },
    { t: "h", c: "Online softmax — the trick that makes it exact" },
    { t: "p", c: "Softmax needs a global normalizer, but you are streaming blocks. Keep a running max m and running denominator ℓ; as each new block arrives, rescale the accumulated output by exp(m_old − m_new) so the normalization stays correct. The result is bit-for-bit the same attention — Flash changes the IO schedule, not the math." },
    { t: "math", c: "m_new = max(m_old, m_blk);   ℓ ← ℓ·e^(m_old−m_new) + ℓ_blk·e^(m_blk−m_new)" },
    { t: "key", c: "The reframe that governs nearly all modern ML systems work: performance is bound by the memory hierarchy (HBM↔SRAM bandwidth), not FLOPs. 'Make the kernel IO-aware' beats 'do fewer FLOPs' on current hardware — the same principle behind fused kernels and the arithmetic-intensity / roofline model." },
    { t: "refs", c: ["Dao et al. 2022 — FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", "Dao 2023 — FlashAttention-2", "Milakov & Gimelshein 2018 — Online normalizer calculation for softmax"] },
  ],

  sampling: [
    { t: "h", c: "Decoding is a separate distribution from the model" },
    { t: "p", c: "The model outputs logits z; decoding turns them into tokens. Temperature rescales logits before softmax: pᵢ ∝ exp(zᵢ/τ). τ→0 approaches argmax (greedy, deterministic); τ→∞ approaches uniform. Top-k keeps the k highest-probability tokens and renormalizes; top-p (nucleus) keeps the smallest set whose cumulative probability ≥ p — an adaptive k that grows when the model is uncertain and shrinks when it is confident." },
    { t: "math", c: "p_i = exp(z_i / τ) / Σ_j exp(z_j / τ)" },
    { t: "key", c: "This is why temperature trades correctness for diversity: it directly reshapes the entropy of the output distribution. On tasks with one right answer, raising τ only adds error; on open-ended generation, τ=0 collapses into repetition." },
    { t: "h", c: "Speculative decoding — free speedup, provably unbiased" },
    { t: "p", c: "Decode is memory-bound and sequential, so it is slow. Speculative decoding uses a cheap draft model to propose k tokens, then the large target model verifies all k in a single parallel forward pass. A modified rejection-sampling rule accepts the longest agreeing prefix and, on rejection, resamples from a corrected residual distribution." },
    { t: "math", c: "accept proposed token x with probability  min(1,  p_target(x) / p_draft(x))" },
    { t: "key", c: "The accept/reject correction guarantees the output is distributed exactly as the target model's own sampling — identical quality, fewer sequential steps. Knowing why it is unbiased (not just 'a small model helps') is the depth-3 point." },
    { t: "refs", c: ["Holtzman et al. 2020 — The Curious Case of Neural Text Degeneration (nucleus sampling)", "Leviathan et al. 2023 — Fast Inference from Transformers via Speculative Decoding", "Chen et al. 2023 — Accelerating LLM Decoding with Speculative Sampling"] },
  ],

  nextoken: [
    { t: "h", c: "The objective, precisely" },
    { t: "p", c: "A causal LM factorizes the joint probability of a sequence and is trained by maximum likelihood on next-token prediction. Maximizing log-likelihood is exactly minimizing the cross-entropy between the one-hot true token and the model's predicted distribution — which, in expectation, minimizes the KL divergence from the data distribution to the model." },
    { t: "math", c: "L = −Σ_t log p_θ(x_t | x_<t)   =   cross-entropy(one-hot, p_θ)" },
    { t: "key", c: "'Train on next-token prediction' and 'minimize KL to the data distribution' are the same statement. Everything the model knows is a side effect of compressing the corpus into accurate conditional distributions — prediction is compression (the source-coding view)." },
    { t: "h", c: "Why the distribution has its shape, and the gradient" },
    { t: "p", c: "The output is softmax over the whole vocabulary, so mass is shared among all plausible continuations — a function-word context is high-entropy (many valid tokens), a copied name is low-entropy (one token dominates). The gradient of cross-entropy through softmax is beautifully simple: predicted minus target." },
    { t: "math", c: "∂L/∂z_i = p_i − y_i      (softmax + cross-entropy logit gradient)" },
    { t: "key", c: "This is why a confident, correct prediction produces almost no gradient (p≈y ⟹ ∂L/∂z≈0) and an uncertain or wrong one produces a large one — the model learns from mistakes and ignores what it already knows. Perplexity = exp(mean loss) is this same quantity read as an 'effective branching factor.'" },
    { t: "refs", c: ["Bengio et al. 2003 — A Neural Probabilistic Language Model", "Radford et al. 2019 — Language Models are Unsupervised Multitask Learners (GPT-2)", "Shannon 1948 — A Mathematical Theory of Communication"] },
  ],

  tempgame: [
    { t: "h", c: "Temperature is entropy control on the logits" },
    { t: "p", c: "Temperature τ rescales logits before the softmax. Because it divides the logits, it stretches or compresses the gaps between them: large τ shrinks differences (flatter, higher-entropy distribution), small τ exaggerates them (peakier, lower-entropy). τ=1 is the model's native distribution; τ→0 is argmax; τ→∞ is uniform." },
    { t: "math", c: "p_i(τ) = exp(z_i/τ) / Σ_j exp(z_j/τ);    H(p) increases monotonically with τ" },
    { t: "key", c: "'Creativity' and 'correctness' are two ends of the same entropy dial — there is no free lunch. The same τ that lets the model escape repetition also lets it sample low-probability (often wrong) tokens. Calibrated tasks want low τ; ideation wants high τ." },
    { t: "h", c: "The same operator: distillation and calibration" },
    { t: "p", c: "Temperature also appears in knowledge distillation, where a student trains on a teacher's temperature-softened logits (soft targets) to transfer the 'dark knowledge' carried in the relative probabilities of wrong answers. And temperature scaling is the standard post-hoc fix for an overconfident classifier — fit a single τ on validation so predicted probabilities match empirical accuracy." },
    { t: "refs", c: ["Hinton, Vinyals & Dean 2015 — Distilling the Knowledge in a Neural Network", "Guo et al. 2017 — On Calibration of Modern Neural Networks", "Ackley, Hinton & Sejnowski 1985 — A Learning Algorithm for Boltzmann Machines"] },
  ],

  "seq-parallel": [
    { t: "h", c: "Why parallelism — and why it unlocked scale" },
    { t: "p", c: "An RNN computes hₜ = f(hₜ₋₁, xₜ): step t cannot begin until step t−1 finishes. Training is therefore sequential in sequence length, and backpropagation-through-time multiplies Jacobians across every step, so gradients vanish or explode over long ranges (the core reason RNNs forget). The transformer removes the recurrence: with the whole sequence visible and causal masking, every position's loss is computed in parallel in one forward pass." },
    { t: "math", c: "RNN: O(n) sequential steps   →   Transformer training: O(1) sequential depth, O(n²) parallel work" },
    { t: "key", c: "This is the real reason the transformer won: it converted a sequential dependency into a parallel matmul, which is exactly what GPUs are built for. Scale became a function of hardware throughput, not wall-clock recurrence — the precondition for the entire scaling-laws era." },
    { t: "h", c: "The asymmetry: parallel training, sequential decoding" },
    { t: "p", c: "Training parallelizes because all target tokens are known (teacher forcing). Generation is still inherently sequential — each token depends on the last — which is why the KV cache exists (cache past keys/values so each new token is O(n) not O(n²)) and why decode is memory-bound. The transformer removed sequential training, not sequential decoding." },
    { t: "key", c: "Trade-off ledger: transformers pay O(n²) attention compute and O(n) KV memory to buy full training parallelism. Sub-quadratic recurrent revivals (state-space models / linear attention) re-trade the other way — O(n) compute, O(1) state — sacrificing some expressivity for long-context efficiency." },
    { t: "refs", c: ["Vaswani et al. 2017 — Attention Is All You Need", "Hochreiter & Schmidhuber 1997 — Long Short-Term Memory", "Gu & Dao 2023 — Mamba: Linear-Time Sequence Modeling with Selective State Spaces"] },
  ],

  "training-signal": [
    { t: "h", c: "Three quantities, one training loop" },
    { t: "p", c: "Entropy H(p) = −Σ p log p is expected surprise — the lower bound on average bits to encode samples from p. Cross-entropy H(p,q) = −Σ p log q is the average bits when you encode p's outcomes with q's code. KL divergence is the excess: D_KL(p‖q) = H(p,q) − H(p) ≥ 0, zero iff p=q. LLM training minimizes cross-entropy, and since H(p_data) is constant, that is identical to minimizing KL from data to model." },
    { t: "math", c: "D_KL(p‖q) = Σ p(x)·log( p(x)/q(x) ) = H(p,q) − H(p) ≥ 0" },
    { t: "key", c: "Maximum likelihood ≡ minimizing KL(p_data ‖ p_θ). This one identity underwrites pretraining, and KL reappears as the regularizer in RLHF and DPO (the leash keeping the policy near the reference) and in the VAE's ELBO. Master KL and a third of the field's objectives become one object." },
    { t: "h", c: "Why the loss surface rewards uncertainty" },
    { t: "p", c: "With a softmax model the per-token gradient is pᵢ − yᵢ (predicted minus true). A confident correct token contributes ≈0; an uncertain or wrong token contributes a large gradient. The training signal is therefore concentrated entirely on what the model gets wrong or is unsure about — confident-correct predictions are informationally free and teach nothing." },
    { t: "math", c: "∂L/∂z_i = p_i − y_i" },
    { t: "key", c: "KL's asymmetry matters in practice. Forward KL (used in MLE) is mean-seeking — it punishes assigning low probability to things that occur, so models hedge and cover all modes; reverse KL is mode-seeking and underlies some RL objectives. Choosing the direction is a real modeling decision." },
    { t: "refs", c: ["Shannon 1948 — A Mathematical Theory of Communication", "Kullback & Leibler 1951 — On Information and Sufficiency", "Cover & Thomas — Elements of Information Theory (ch. 2)"] },
  ],

  // ── SKELETONS (roadmap) ─────────────────────────────────────────────────────
  // Shape: { soon: true, outline: [planned depth-3 section titles] }
  // To build a module: replace the object with a blocks array (see above).
  // Tracked in GRADIENT_BUILD.md.

  // Retrieval gym
  embeddings: { soon: true, outline: ["Contrastive training and the InfoNCE objective", "Why cosine similarity — and when it lies (anisotropy / whitening)", "Hard negatives and temperature τ"] },
  chunking: { soon: true, outline: ["Chunking as a recall/precision tradeoff", "Fixed vs recursive vs semantic — the objective", "Late chunking and the embedding-context problem"] },
  "rag-pipeline": { soon: true, outline: ["RAG as conditional generation, formally", "The failure decomposition: retrieve vs rank vs ground", "Two-stage retrieval and cross-encoder reranking"] },
  context: { soon: true, outline: ["The O(n²) attention budget, derived", "KV-cache memory math and MQA/GQA/MLA", "Lost-in-the-middle and positional bias"] },

  // AI Agents gym
  agent: { soon: true, outline: ["Agents as policies doing search over an environment", "ReAct and the compounding-error bound (p^k)", "Planning, reflection, and value estimation"] },
  "agent-tools": { soon: true, outline: ["Tool use as grounding / function-calling semantics", "Idempotency and the retry/verification contract", "Schema-constrained decoding"] },
  multiagent: { soon: true, outline: ["Orchestration cost vs specialization benefit", "When a single agent beats a swarm", "Communication as compounding miscommunication"] },
  guardrails: { soon: true, outline: ["Prompt-injection taxonomy: direct / indirect / tool-result", "Least-privilege tool classes and blast radius", "Input/output guardrails and their limits"] },

  // Evaluation gym
  "eval-loop": { soon: true, outline: ["An eval result is an estimator with a confidence interval", "Paired tests and why they are more powerful", "The eval flywheel and implicit feedback"] },
  debug: { soon: true, outline: ["Localizing failure in the RAG chain", "Retrieval recall vs generation faithfulness", "Ablation as causal attribution"] },
  "llm-as-judge": { soon: true, outline: ["Judge biases: position, verbosity, self-preference", "Calibrating against humans — Cohen's κ, not raw agreement", "Validating and bounding judge reliability"] },
  "eval-design": { soon: true, outline: ["Benchmark contamination and Goodhart's law", "Multiple comparisons and false-positive inflation", "Item Response Theory for efficient benchmarks"] },

  // Production Systems gym
  "cost-latency-concepts": { soon: true, outline: ["Prefill vs decode: the two-phase cost model", "The roofline / arithmetic-intensity frame", "Continuous batching and throughput math"] },
  "observability-concepts": { soon: true, outline: ["Span tracing and the trace tree", "Cost attribution and p95/p99 tail latency", "Drift detection signals in production"] },

  // Foundation Models gym
  "scaling-laws": { soon: true, outline: ["The power law and the Chinchilla Lagrangian", "Compute C ≈ 6ND and tokens-per-parameter", "Emergence vs metric discontinuity"] },
  lora: { soon: true, outline: ["Low-rank updates from the SVD view", "QLoRA: NF4, double quantization, paged optimizers", "Why adaptation is intrinsically low-rank"] },

  // Prompt Engineering gym
  "few-shot": { soon: true, outline: ["In-context learning as implicit inference", "Induction heads as the mechanism", "Why ordering and format matter"] },
  "chain-of-thought": { soon: true, outline: ["CoT as test-time compute / latent computation", "Self-consistency and majority voting", "Process vs outcome supervision"] },
};
