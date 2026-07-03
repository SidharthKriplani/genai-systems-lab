// Searchable quick-reference cards for GenAI interview prep.
// Each card: { topic, term, formula, oneLiner, gotcha }.
// Reference half of the cheatsheet (the other half is the time-plan).
export const CHEAT_CARDS = [
  // ---- Attention / Transformers ----
  { topic: "Attention", term: "Scaled dot-product attention",
    formula: "softmax(QKᵀ / √dₖ) · V",
    oneLiner: "Weight each value by how much its key matches the query; √dₖ keeps logits from saturating softmax.",
    gotcha: "√dₖ is the head dimension, not d_model or sequence length. Drop it and gradients vanish as dₖ grows." },

  { topic: "Attention", term: "Multi-head attention (MHA)",
    formula: "Concat(head₁…head_h) · Wᴼ,  headᵢ = Attn(QWᵢᵠ, KWᵢᴷ, VWᵢⱽ)",
    oneLiner: "Run h attention heads in parallel subspaces so the model attends to several relations at once, then project back.",
    gotcha: "Each head has dimension d_model / h, so total compute is roughly the same as one big head — heads split, they don't stack." },

  { topic: "Attention", term: "GQA vs MQA",
    formula: "MHA: h KV heads · MQA: 1 KV head · GQA: g KV heads (1 < g < h)",
    oneLiner: "Share key/value projections across query heads to shrink the KV cache; GQA is the middle ground most modern LLMs use.",
    gotcha: "GQA/MQA cut KV-cache memory and decode bandwidth, NOT FLOPs of the QKᵀ matmul — the win is memory-bound decode, not prefill." },

  { topic: "Attention", term: "RoPE (rotary position embedding)",
    formula: "rotate (x_2i, x_2i+1) by angle m·θ_i,  θ_i = 10000^(-2i/d)",
    oneLiner: "Encode position by rotating query/key pairs; the dot product then depends only on relative offset (m − n).",
    gotcha: "It is applied to Q and K before the dot product, never to V. Extending context usually needs θ-base or NTK scaling, not just more tokens." },

  { topic: "Attention", term: "KV cache",
    formula: "mem = 2 · n_layers · seq_len · n_kv_heads · d_head · bytes",
    oneLiner: "Cache past keys/values so each new token attends to history in O(seq) instead of recomputing the whole prefix.",
    gotcha: "The 2× is for K and V. Cache grows linearly with context and dominates memory at long context — it, not weights, caps batch size." },

  { topic: "Attention", term: "Causal / masked attention",
    formula: "add −∞ to logits where j > i, then softmax",
    oneLiner: "A lower-triangular mask stops a token from attending to future positions so training matches autoregressive decoding.",
    gotcha: "Mask with −∞ (or a large negative) BEFORE softmax, not by zeroing after — zeroing post-softmax leaves probability mass leaked to the future." },

  { topic: "Attention", term: "FlashAttention",
    formula: "tiled softmax, O(n) memory instead of O(n²)",
    oneLiner: "Fuse the attention matmul-softmax-matmul into one kernel and never materialize the full n×n matrix in HBM.",
    gotcha: "Same math, same result — it is an IO-aware exact algorithm, not an approximation. The win is memory bandwidth, not fewer FLOPs." },

  { topic: "Attention", term: "Transformer block",
    formula: "x += Attn(LN(x));  x += FFN(LN(x))",
    oneLiner: "Residual + pre-norm around attention and a 2-layer MLP; stacking these blocks is the whole architecture.",
    gotcha: "Modern LLMs use pre-norm (LN before the sublayer). Post-norm (original paper) trains unstably deep without careful warmup." },

  // ---- Tokenization / Embeddings ----
  { topic: "Tokenization", term: "Byte-pair encoding (BPE)",
    formula: "greedily merge most-frequent adjacent token pair, repeat to vocab size",
    oneLiner: "Learn a subword vocabulary by iteratively merging common byte/char pairs so rare words split into known pieces.",
    gotcha: "Token count ≠ word count: ~1 token ≈ 4 chars ≈ 0.75 words in English; code, non-Latin scripts, and numbers tokenize far worse." },

  { topic: "Tokenization", term: "Embedding lookup",
    formula: "E ∈ ℝ^(V × d),  emb(t) = E[t]",
    oneLiner: "Map each token id to a learned d-dim vector; the embedding matrix is usually the single largest parameter block.",
    gotcha: "Weight tying often shares E with the output unembedding (Eᵀ) to halve params — check whether a model ties them before counting." },

  { topic: "Embeddings", term: "Cosine similarity",
    formula: "cos(a, b) = (a · b) / (‖a‖ ‖b‖)",
    oneLiner: "Compare two embeddings by angle, ignoring magnitude — the default relevance score in vector search.",
    gotcha: "If vectors are L2-normalized, cosine, dot product, and (negated) Euclidean rank identically — normalize once, then dot is cheapest." },

  { topic: "Embeddings", term: "Contrastive learning",
    formula: "InfoNCE: −log[ e^(sim(a,a⁺)/τ) / Σ e^(sim(a,·)/τ) ]",
    oneLiner: "Pull matched pairs together and push mismatched apart in embedding space; how most retrieval encoders are trained.",
    gotcha: "Hard negatives and a well-tuned temperature τ matter more than model size — easy in-batch negatives cap retrieval quality fast." },

  // ---- Sampling / Decoding ----
  { topic: "Sampling", term: "Temperature",
    formula: "pᵢ = softmax(zᵢ / T)",
    oneLiner: "Divide logits by T before softmax: T<1 sharpens (greedier), T>1 flattens (more random), T→0 → argmax.",
    gotcha: "Temperature scales logits, not probabilities — applying it after softmax is wrong. T=0 is deterministic greedy, not 'no randomness knob'." },

  { topic: "Sampling", term: "Top-k sampling",
    formula: "sample only from the k highest-probability tokens (renormalized)",
    oneLiner: "Truncate the tail to a fixed count k, then sample — cheap way to avoid unlikely garbage tokens.",
    gotcha: "Fixed k is blind to the distribution's shape: too aggressive on flat distributions, too permissive on peaky ones. Top-p adapts, k doesn't." },

  { topic: "Sampling", term: "Top-p (nucleus) sampling",
    formula: "smallest set whose cumulative prob ≥ p, then renormalize and sample",
    oneLiner: "Keep the smallest token set covering probability mass p, so the candidate count flexes with model confidence.",
    gotcha: "p is cumulative probability, not a token count. Combined with temperature, order matters — most stacks apply temperature first." },

  { topic: "Sampling", term: "Greedy vs beam search",
    formula: "greedy: argmax each step · beam: keep top-b partial sequences",
    oneLiner: "Beam explores b hypotheses in parallel and picks the highest-scoring full sequence; greedy commits token by token.",
    gotcha: "Beam search hurts open-ended generation (bland, repetitive) — it shines for constrained tasks like translation, not chat." },

  // ---- Training / Alignment ----
  { topic: "Training", term: "Pretraining objective",
    formula: "maximize Σ log P(x_t | x_<t)   (next-token / causal LM)",
    oneLiner: "Self-supervised next-token prediction over a huge corpus builds the base model's world knowledge.",
    gotcha: "Cross-entropy loss and perplexity are the same signal (ppl = e^loss). BERT-style masked LM is a different objective — not what GPT-class models use." },

  { topic: "Training", term: "Chinchilla scaling",
    formula: "compute-optimal ≈ 20 tokens per parameter",
    oneLiner: "For a fixed compute budget, scale params and data together; most pre-Chinchilla models were badly undertrained on data.",
    gotcha: "20:1 is compute-optimal for training, not inference-optimal. If you'll serve a model heavily, over-train a smaller one past 20:1 (e.g. Llama)." },

  { topic: "Alignment", term: "Supervised fine-tuning (SFT)",
    formula: "fine-tune on (prompt, ideal-response) pairs with LM loss",
    oneLiner: "Teach the base model to follow instructions by imitating curated demonstrations — the first alignment stage.",
    gotcha: "SFT teaches format and style, not preference ranking. It can only imitate demonstrated behavior; it can't learn 'A is better than B'." },

  { topic: "Alignment", term: "LoRA",
    formula: "W' = W + (α/r)·BA,  B ∈ ℝ^(d×r), A ∈ ℝ^(r×d), r ≪ d",
    oneLiner: "Freeze W, train a low-rank update BA — cuts trainable params by orders of magnitude with near-full-FT quality.",
    gotcha: "Only B·A is trained; base W is frozen. Rank r and scaling α are the knobs — too-low r underfits; α/r sets the effective update size." },

  { topic: "Alignment", term: "QLoRA",
    formula: "4-bit NF4 frozen base + LoRA adapters in bf16",
    oneLiner: "Quantize the frozen base to 4-bit and train LoRA on top, so a 65B model fine-tunes on a single 48GB GPU.",
    gotcha: "The base is 4-bit for storage but dequantized to bf16 during the forward pass — adapters stay full precision, so quality holds." },

  { topic: "Alignment", term: "RLHF",
    formula: "reward model + PPO: max E[r(x,y)] − β·KL(π ‖ π_ref)",
    oneLiner: "Train a reward model on human preference pairs, then RL the policy to maximize reward while staying near the SFT model.",
    gotcha: "The KL penalty to π_ref prevents reward hacking / mode collapse. Drop or under-weight β and the policy games the reward model." },

  { topic: "Alignment", term: "DPO (direct preference optimization)",
    formula: "loss = −log σ(β·[log π(y_w)/π_ref(y_w) − log π(y_l)/π_ref(y_l)])",
    oneLiner: "Optimize preferences directly with a classification loss — no separate reward model or RL loop.",
    gotcha: "DPO still needs the reference model π_ref at train time and a KL-like β; it removes the reward model and PPO, not the pairwise preference data." },

  { topic: "Alignment", term: "GRPO",
    formula: "advantage = (rᵢ − mean(r_group)) / std(r_group)",
    oneLiner: "Sample a group of outputs per prompt and use their reward mean/std as the baseline — PPO without a value/critic network.",
    gotcha: "The baseline is the group's own reward statistics, so there's no learned critic to train — this is what makes it cheap (used in DeepSeek-R1)." },

  { topic: "Efficiency", term: "Quantization",
    formula: "FP16 → INT8/INT4:  x_q = round(x / scale) + zero_point",
    oneLiner: "Store weights (and sometimes activations) in fewer bits to cut memory and speed up memory-bound decode.",
    gotcha: "Weight-only INT4 (GPTQ/AWQ) barely dents quality; activation quantization is far harder due to outlier channels. PTQ ≠ QAT." },

  { topic: "Efficiency", term: "Knowledge distillation",
    formula: "loss = α·CE(y, student) + (1−α)·KL(teacher_soft ‖ student_soft), soft = softmax(z/T)",
    oneLiner: "Train a small student to match a large teacher's soft probability distribution, not just the hard label.",
    gotcha: "The soft targets (with T>1) carry the teacher's 'dark knowledge' — inter-class similarities the one-hot label throws away." },

  { topic: "Architecture", term: "Mixture of Experts (MoE)",
    formula: "y = Σ_{i∈top-k} gate(x)ᵢ · Expertᵢ(x)",
    oneLiner: "A router sends each token to a few of many FFN experts, so total params grow but per-token compute stays low.",
    gotcha: "Distinguish total vs active params: a 'sparse 8×7B' activates ~2 experts per token. Load-balancing loss is needed or the router collapses to a few experts." },

  { topic: "Training", term: "Gradient checkpointing",
    formula: "recompute activations in backward; memory O(√L) vs O(L)",
    oneLiner: "Trade compute for memory by not storing every layer's activations — recompute them during backprop.",
    gotcha: "It saves activation memory, not parameter or optimizer memory, and costs ~1 extra forward pass (~30% slower). Not a free lunch." },

  { topic: "Training", term: "Mixed precision",
    formula: "bf16/fp16 compute + fp32 master weights + loss scaling",
    oneLiner: "Compute in 16-bit for speed while keeping an fp32 copy of weights so tiny updates aren't lost to rounding.",
    gotcha: "bf16 has fp32's exponent range so it usually skips loss scaling; fp16 has a narrow range and needs loss scaling to avoid underflow." },

  // ---- RAG ----
  { topic: "RAG", term: "Retrieval-augmented generation",
    formula: "answer = LLM(query + top-k retrieved chunks)",
    oneLiner: "Fetch relevant documents at query time and stuff them into the prompt so the model grounds its answer in current data.",
    gotcha: "RAG fixes knowledge staleness and citations, not reasoning. Garbage retrieval → confident wrong answers; retrieval quality caps the whole system." },

  { topic: "RAG", term: "Chunking",
    formula: "split docs into ~200–500 token windows with overlap",
    oneLiner: "Break documents into passages small enough to embed precisely but large enough to stay self-contained.",
    gotcha: "Overlap prevents cutting facts across boundaries. Too-large chunks dilute the embedding; too-small lose context — semantic/structural splits beat fixed size." },

  { topic: "RAG", term: "Hybrid search",
    formula: "score = α·dense(sim) + (1−α)·sparse(BM25)",
    oneLiner: "Combine semantic (vector) and lexical (BM25) retrieval so you catch both paraphrases and exact keywords/IDs.",
    gotcha: "Dense misses rare exact terms (codes, names); sparse misses synonyms. Fusion needs score normalization or RRF — you can't just add raw scores." },

  { topic: "RAG", term: "Reranker (cross-encoder)",
    formula: "score = CrossEncoder([query; doc]) over top-N candidates",
    oneLiner: "Re-score the retriever's top-N with a model that reads query and doc jointly, then keep the top-k.",
    gotcha: "Cross-encoders are accurate but O(N) per query — too slow to search the whole corpus. Retrieve cheaply (bi-encoder), then rerank a shortlist." },

  { topic: "RAG", term: "RAGAS metrics",
    formula: "faithfulness, answer-relevance, context-precision, context-recall",
    oneLiner: "Decompose RAG eval into retrieval quality (precision/recall) and generation quality (faithfulness/relevance).",
    gotcha: "Faithfulness (answer grounded in context) is separate from correctness (answer is actually right) — a faithful answer to bad context is still wrong." },

  { topic: "RAG", term: "Chunk vs context window",
    formula: "k·chunk_tokens + query + instructions ≤ context_limit",
    oneLiner: "Budget how many chunks fit before the model's context fills — more isn't always better retrieval.",
    gotcha: "'Lost in the middle': relevant info buried mid-context is often ignored. Put the strongest chunks at the start/end, not just top-k by score." },

  // ---- Agents ----
  { topic: "Agents", term: "ReAct",
    formula: "loop: Thought → Action → Observation → … → Answer",
    oneLiner: "Interleave reasoning traces with tool calls so the model plans, acts, observes results, and re-plans.",
    gotcha: "The Observation must be fed back into context each step, or the agent 'hallucinates' tool outputs. Cap the loop or it runs forever on failure." },

  { topic: "Agents", term: "Tool / function calling",
    formula: "model emits {name, arguments(JSON)} → runtime executes → result returned",
    oneLiner: "Expose functions with a JSON schema; the model chooses which to call and fills arguments, the app runs them.",
    gotcha: "The model only proposes the call — it does not execute anything. You validate args and run the function; never trust the arguments blindly." },

  { topic: "Agents", term: "Agent memory",
    formula: "short-term = context window · long-term = external vector/DB store",
    oneLiner: "Working memory lives in the prompt; persistent memory is retrieved from a store and injected as needed.",
    gotcha: "Context is finite and forgets on each session — 'memory' is a retrieval + summarization pipeline you build, not something the model keeps." },

  { topic: "Agents", term: "MCP (Model Context Protocol)",
    formula: "client (LLM app) ↔ MCP server exposing tools / resources / prompts",
    oneLiner: "An open protocol that standardizes how models connect to external tools and data — one integration, many clients.",
    gotcha: "MCP standardizes the transport/interface, not the model's decision to use a tool. It replaces bespoke integrations, not the reasoning that picks them." },

  { topic: "Agents", term: "Multi-agent orchestration",
    formula: "planner → workers (parallel/sequential) → aggregator",
    oneLiner: "Split a task across specialized agents with a coordinator, useful when subtasks are independent or need different tools.",
    gotcha: "More agents multiply cost, latency, and failure modes. A single well-prompted agent often beats a fragile multi-agent graph — add agents only when parallelism/specialization genuinely pays." },

  // ---- Inference / Serving ----
  { topic: "Inference", term: "Prefill vs decode",
    formula: "prefill: parallel over prompt (compute-bound) · decode: 1 token/step (memory-bound)",
    oneLiner: "Prefill processes the whole prompt at once; decode generates one token at a time, gated by memory bandwidth.",
    gotcha: "They have opposite bottlenecks, so they're often scheduled/split separately (disaggregation). Batching helps decode far more than prefill." },

  { topic: "Inference", term: "Continuous batching",
    formula: "add/evict requests at each decode step (iteration-level scheduling)",
    oneLiner: "Instead of waiting for a whole batch to finish, swap completed sequences out and new ones in every step.",
    gotcha: "Different from static batching, which stalls on the longest sequence. This is the main throughput win in vLLM/TGI — not a bigger batch, a smarter one." },

  { topic: "Inference", term: "PagedAttention",
    formula: "KV cache in fixed-size blocks (like OS virtual memory paging)",
    oneLiner: "Store the KV cache in non-contiguous pages so memory isn't wasted on padding — vLLM's core trick.",
    gotcha: "It attacks KV-cache fragmentation, not attention FLOPs. It also enables cheap prefix sharing (copy-on-write blocks) across requests." },

  { topic: "Inference", term: "TTFT vs TPOT",
    formula: "latency = TTFT + (num_output_tokens − 1) · TPOT",
    oneLiner: "Time-to-first-token measures prefill responsiveness; time-per-output-token measures decode speed.",
    gotcha: "They optimize differently: TTFT is dominated by prompt length/prefill; TPOT by memory bandwidth and batch size. Don't report just one." },

  { topic: "Inference", term: "Speculative decoding",
    formula: "small draft model proposes n tokens → target model verifies in parallel",
    oneLiner: "A cheap draft model guesses several tokens; the big model checks them in one pass, accepting the correct prefix.",
    gotcha: "Output distribution is exactly the target model's — it's lossless, a speedup only. Gains depend on draft acceptance rate, not just draft speed." },

  { topic: "Inference", term: "Throughput vs latency",
    formula: "throughput ∝ batch size · latency ∝ per-request time",
    oneLiner: "Bigger batches raise tokens/sec (throughput) but each user waits longer (latency) — you tune the trade-off.",
    gotcha: "They pull against each other on the same GPU. An interactive chat SLO (low latency) and a batch pipeline (high throughput) want opposite batch sizes." },

  // ---- Evaluation ----
  { topic: "Evaluation", term: "LLM-as-a-judge",
    formula: "score = Judge_LLM(criteria, response) — pointwise or pairwise",
    oneLiner: "Use a strong model to grade outputs against a rubric when there's no exact-match answer.",
    gotcha: "Judges have biases: position (favor first), verbosity (favor longer), and self-preference. Randomize order, calibrate, and spot-check against humans." },

  { topic: "Evaluation", term: "Hallucination",
    formula: "intrinsic (contradicts source) vs extrinsic (unverifiable)",
    oneLiner: "Confident output not grounded in the input or facts; measured by faithfulness/attribution checks, not fluency.",
    gotcha: "Low perplexity ≠ truthful — a fluent, high-probability answer can be flatly false. Grounding/citation checks are what catch it, not the LM loss." },

  { topic: "Evaluation", term: "Perplexity",
    formula: "PPL = exp( −(1/N) Σ log P(x_t | x_<t) ) = e^(cross-entropy)",
    oneLiner: "Exponentiated average next-token loss — how 'surprised' the model is by held-out text; lower is better.",
    gotcha: "Only comparable across models with the same tokenizer/vocab. It measures LM fit, not downstream task quality — a low-ppl model can still be useless." },

  { topic: "Evaluation", term: "Pass@k",
    formula: "Pass@k = 1 − C(n−c, k) / C(n, k)",
    oneLiner: "Probability at least one of k sampled attempts passes tests — the standard code-generation metric.",
    gotcha: "Pass@1 (greedy) and Pass@k (sampled) measure different things. High Pass@100 with low Pass@1 means the model can do it but rarely picks the right path." },

  // ---- Safety ----
  { topic: "Safety", term: "Prompt injection (OWASP LLM01)",
    formula: "untrusted input overrides system/developer instructions",
    oneLiner: "Malicious text in the data the model reads (web page, doc, tool output) hijacks its instructions.",
    gotcha: "This is the #1 LLM risk and has no full fix — treat all model-reachable content as untrusted, and never let tool output carry privileged authority. Indirect injection (via retrieved docs) is the sneaky variant." },

  { topic: "Safety", term: "Jailbreak",
    formula: "role-play / obfuscation / many-shot to bypass refusals",
    oneLiner: "Craft prompts (personas, encodings, long context) that get the model to produce content it was aligned to refuse.",
    gotcha: "Jailbreaks target the model's alignment; prompt injection targets the app's instruction hierarchy — related but different threats and defenses." },

  { topic: "Safety", term: "Guardrails",
    formula: "input filter → model → output filter (moderation + policy checks)",
    oneLiner: "Wrap the model with pre- and post-processing classifiers that block unsafe inputs and outputs.",
    gotcha: "Guardrails are defense-in-depth, not a fix for a misaligned model. Output filters add latency and false positives; they don't stop injection at the source." },

  { topic: "Safety", term: "PII / data leakage",
    formula: "training-data extraction + prompt/context leakage",
    oneLiner: "Models can regurgitate memorized training data or leak system prompts and other users' context.",
    gotcha: "Never put secrets in the system prompt assuming they're hidden — prompts are extractable. Scrub PII at ingest; RAG can surface it just as easily." },

  // ---- Prompt engineering ----
  { topic: "Prompting", term: "Zero-shot vs few-shot",
    formula: "few-shot: prepend k (input, output) exemplars in the prompt",
    oneLiner: "Show the model a handful of examples to steer format and behavior without any weight updates.",
    gotcha: "This is in-context learning — no gradients, no persistence. Exemplar order, format, and label distribution can swing results more than the examples' content." },

  { topic: "Prompting", term: "Chain-of-thought (CoT)",
    formula: "prompt 'let's think step by step' → reason before answering",
    oneLiner: "Elicit intermediate reasoning steps so the model solves multi-step problems more reliably.",
    gotcha: "The stated reasoning isn't guaranteed to be the model's actual computation — it can rationalize a wrong answer. CoT helps big models; it can hurt small ones." },

  { topic: "Prompting", term: "Self-consistency",
    formula: "sample N CoT paths → majority vote on final answers",
    oneLiner: "Generate several reasoning chains at temperature and take the most common answer instead of trusting one path.",
    gotcha: "It needs an aggregatable final answer (e.g. a number/label) to vote on — it doesn't help open-ended generation, and it multiplies cost by N." },

  { topic: "Prompting", term: "Structured output",
    formula: "constrained decoding to a JSON schema / grammar",
    oneLiner: "Force the model to emit valid JSON (or a grammar) by masking invalid tokens during decoding.",
    gotcha: "Constrained decoding guarantees valid syntax, not correct values. It can also degrade reasoning — heavy constraints fight the model's natural distribution." },

  { topic: "Prompting", term: "System vs user prompt",
    formula: "instruction hierarchy: system > developer > user > tool output",
    oneLiner: "The system prompt sets durable behavior/role; user turns are the task — modern models are trained to prioritize the hierarchy.",
    gotcha: "The hierarchy is a trained-in preference, not a hard security boundary — a strong injection in user/tool content can still override system rules." },
];
