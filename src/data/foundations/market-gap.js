// Market-gap Foundations modules — RoPE, GQA/MQA, GRPO/RLVR. Spread into
// src/data/foundationsRunnerData.js. Keep the export name RUNNER_MARKET_GAP.
export const RUNNER_MARKET_GAP = {
  "rope": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "You fine-tune a 4K-context model and it's excellent. Product now wants it to answer over 32K-token documents, so you simply feed it 32K tokens at inference — no retraining. Quality collapses: the model produces fluent but ungrounded text and seems to lose track of anything past ~4K. A colleague says 'just increase max_position_embeddings.' The model uses RoPE, and you need to explain why the naive extension fails, why RoPE extends more gracefully than the alternatives, and what knob (theta, YaRN) actually buys you the longer context.",
    explanation: [
      "Attention is **permutation-invariant**: the raw dot product `q·k` between a query and a key carries no notion of *where* either token sits. 'dog bites man' and 'man bites dog' produce the same set of Q/K vectors, so without injecting position the model cannot tell order at all. Every Transformer therefore needs some **position signal**.\n\nThe original solution was an **additive position embedding** — a vector `p_i` (fixed sinusoids in the 2017 paper, or a learned lookup table like GPT-2/BERT) *added* to the token embedding before attention. This works, but it bakes in **absolute** position, and that is the seed of the extrapolation problem in the scenario.",
      "**Learned absolute PE** is the worst offender for length extension. `max_position_embeddings` is literally the number of rows in a lookup table trained only for indices 0..4095. Position 8000 has **no row** — it was never seen, so its embedding is either undefined or a garbage extrapolation. Bumping the config number doesn't conjure trained rows; you'd be indexing into weights that never received a gradient.\n\nEven **sinusoidal** absolute PE, which is defined for any index, extrapolates poorly: the model learned to read specific absolute-position patterns during training and has never seen the high-frequency phase combinations that appear past its training length. ==Absolute position is the wrong quantity anyway — what attention actually needs is how far apart two tokens are, not their absolute indices.==",
      "**Rotary Position Embeddings (RoPE)** change the mechanism entirely. Instead of *adding* a position vector to the input, RoPE **rotates the query and key vectors** by an angle proportional to their position, applied inside the attention dot product. It rotates **Q and K only — never V**, because position must shape *how tokens attend to each other* (the score), not the *content* that gets passed forward once attended.\n\nSplit each Q/K vector into 2-D pairs of dimensions. For a token at position `m`, RoPE rotates pair `d` by angle `m·θ_d`, where `θ_d = base^(-2d/D)` gives each pair its own frequency (fast rotations in early dims, slow in later dims). ==The payoff is algebraic: after rotating q at position m and k at position n, their dot product depends only on the **relative** offset (m − n), not on m and n separately.==",
      { type: "illustration", label: "Absolute-additive PE vs RoPE — the relative-position property", content: `ABSOLUTE / ADDITIVE (learned or sinusoidal):
  x_m  ->  x_m + p_m        (position ADDED to the input vector)
  x_n  ->  x_n + p_n
  score depends on p_m AND p_n separately  -> ties to ABSOLUTE index
  learned table has NO row for positions > training length -> breaks

ROPE (rotary):
  q_m  ->  R(m) q           (Q rotated by angle m*theta, per 2-D pair)
  k_n  ->  R(n) k           (K rotated by angle n*theta; V untouched)
  <R(m) q, R(n) k> = <q, R(n-m) k>   <-- depends only on (m - n)

  Relative offset is what survives the dot product.
  A pair 5 apart looks the same at positions (0,5) or (1000,1005).

Per-pair frequency:  theta_d = base^(-2d/D)   (base a.k.a. theta, e.g. 10000)
  low d  -> fast rotation (local, high-frequency detail)
  high d -> slow rotation (long-range, low-frequency)` },
      "That **relative-position property** is why RoPE extends more gracefully than absolute PE. Because the score only depends on the offset `(m − n)`, positions 0 and 5 look identical to positions 1000 and 1005 — the model has effectively *seen* every short-range relationship many times during training, at every absolute location. There is no 'undefined row' at position 8000; the rotation formula is defined for any `m`.\n\nBut 'defined' is not 'in-distribution.' At a large offset the slow-rotating high-`d` pairs reach **rotation angles never encountered in training** (the phase wraps into unseen territory), so raw RoPE still degrades past its trained length — just far more gently than a lookup table that flat-out breaks. ==This is exactly the scenario: fluent-but-ungrounded output is the signature of position signal drifting out of distribution, not the model 'forgetting.'==",
      { type: "illustration", label: "Context extension: base/theta scaling, NTK, and YaRN", content: `The knob is BASE (theta), the wavelength of the rotations.

Position Interpolation (PI):  squeeze positions into the trained range
  feed position m as m * (L_train / L_new)   (e.g. scale 32K down to 4K)
  -> all angles stay in-distribution, but LOCAL resolution is compressed
  -> needs a short fine-tune to recover; hurts fine-grained nearby order

NTK-aware scaling:  raise base instead of squeezing positions
  base 10000 -> larger base  => slows the high-frequency pairs
  -> stretches long-range wavelengths WITHOUT crushing local detail
  -> often works with little or NO fine-tuning

YaRN:  NTK done per-frequency, not one global factor
  - high-freq (local) pairs: leave nearly untouched (keep resolution)
  - low-freq (long-range) pairs: interpolate the most
  - + a small attention-temperature tweak
  -> current best-in-class RoPE context extension, minimal retraining

Naive fix "just raise max_position_embeddings":
  does NOTHING for RoPE quality -- RoPE has no position table to enlarge.
  It only removes a length guard; angles still go out of distribution.` },
      "Contrast with **ALiBi**, the other popular relative scheme. ALiBi adds no rotation and no embedding at all — it simply subtracts a **linear penalty proportional to distance** from each attention score (farther tokens are penalized more, with a fixed per-head slope). It extrapolates to longer contexts very cheaply and needs no tuning, but that same linear decay bakes in a **strong recency bias**: distant tokens are structurally down-weighted, which can hurt tasks that need to retrieve information from far back. RoPE encodes *relative position* without forcing monotonic decay, so it preserves long-range retrieval better — which is why it, not ALiBi, dominates the current frontier.\n\nNamed users: **RoPE** powers LLaMA / LLaMA-2 / LLaMA-3, Mistral, Qwen, DeepSeek, and most open frontier models; **YaRN** and **NTK-aware scaling** are the standard tricks behind their long-context variants. The recurring interview trap is exactly the colleague's suggestion: ==thinking `max_position_embeddings` is a real lever for a RoPE model. It is not — you scale the base/theta (NTK/YaRN), you don't enlarge a table that doesn't exist.==",
    ],
    keyPoints: [
      "**Attention is permutation-invariant** — the raw q·k carries no order — so every Transformer must inject a position signal. Absolute/learned PE *adds* a per-index vector, which ties the model to absolute positions.",
      "**Learned absolute PE cannot extrapolate:** `max_position_embeddings` is a lookup table with no rows past the training length. Sinusoidal PE is defined everywhere but still learned specific absolute patterns and drifts out of distribution.",
      "**RoPE rotates Q and K (never V)** by an angle `m·θ_d` per 2-D pair, inside the dot product. Algebraically the score then depends only on the **relative offset (m − n)** — the relative-position property.",
      "**Relative offsets generalize** because a pair 5 apart looks identical at positions (0,5) and (1000,1005) — the model saw that relationship everywhere in training. RoPE degrades far more gently than absolute PE, but still goes out-of-distribution at unseen large offsets.",
      "**Context extension scales the base/theta, not a table:** Position Interpolation squeezes positions in; NTK-aware raises the base to stretch long-range wavelengths; YaRN does this per-frequency (keep local, interpolate long-range) — current best, minimal retraining.",
      "**vs ALiBi:** ALiBi adds a linear distance penalty (cheap, extrapolates well) but bakes in recency bias that hurts long-range retrieval. RoPE encodes relative position without forced decay, so it dominates frontier models (LLaMA, Mistral, Qwen, DeepSeek).",
    ],
    recap: [
      "**Attention has no built-in order** — position must be injected. Absolute/additive PE ties you to the index; RoPE ties you to the *gap between* tokens.",
      "**RoPE rotates Q and K only** (not V) by `m·θ_d` per 2-D pair; the dot product then depends only on **(m − n)**, the relative offset.",
      "**Why it extends better:** relative offsets were seen at every absolute location, so there's no 'undefined position 8000' — but raw RoPE still drifts out-of-distribution at large offsets.",
      "**The real lever is base/theta:** PI (squeeze positions), NTK-aware (raise base), YaRN (per-frequency, best). Raising `max_position_embeddings` does nothing for a RoPE model.",
      "**vs ALiBi:** ALiBi = linear distance penalty, cheap but recency-biased; RoPE = relative position without forced decay, better long-range retrieval. Frontier models use RoPE.",
    ],
    mcqs: [
      {
        question: "A model uses RoPE. To extend its usable context from 4K to 32K, a teammate proposes 'just set max_position_embeddings to 32768.' Why is this the wrong lever?",
        options: [
          "It would work, but only after retraining the position embedding table on 32K-token sequences",
          "RoPE has no learned position table to enlarge — position is applied as a rotation of Q/K; raising that config only lifts a length guard while the rotation angles still go out of distribution at large offsets",
          "max_position_embeddings controls the number of attention heads, so changing it corrupts the head projections",
          "RoPE stores positions in the V vectors, so the config must be changed together with the value projection dimensions",
        ],
        correct: 1,
        explanation: "Option B is correct: RoPE injects position by rotating Q and K by a position-dependent angle inside the dot product — there is no lookup table of position vectors. So `max_position_embeddings` is not a trained table you can grow; bumping it only removes a length guard, while the actual issue (rotation angles reaching unseen, out-of-distribution phases at large offsets) is untouched. The real levers scale the base/theta: Position Interpolation, NTK-aware scaling, or YaRN. Option A is wrong precisely because there is no position table to retrain for RoPE. Option C confuses an unrelated config — max_position_embeddings is about sequence length, not head count. Option D is wrong because RoPE rotates Q and K, never V; V carries content and is left unrotated.",
      },
      {
        question: "What is the defining algebraic property that makes RoPE a *relative* position encoding rather than an absolute one?",
        options: [
          "After rotating q at position m and k at position n, their dot product depends only on the offset (m − n), not on m and n individually",
          "It adds a learned vector p_m to each token so that distant tokens receive larger embeddings",
          "It subtracts a fixed linear penalty proportional to |m − n| from every attention score",
          "It normalizes every query and key to unit length so that absolute position cancels out",
        ],
        correct: 0,
        explanation: "Option A is correct: RoPE rotates q_m by R(m) and k_n by R(n), and because rotations compose, ⟨R(m)q, R(n)k⟩ = ⟨q, R(n−m)k⟩ — the score depends only on the relative offset (m − n). That is why a pair 5 tokens apart looks the same at positions (0,5) or (1000,1005), which is the source of RoPE's graceful generalization. Option B describes additive absolute PE, which is exactly what RoPE replaces. Option C describes ALiBi's linear distance penalty, a different relative scheme that bakes in recency bias. Option D is wrong: unit-normalizing Q/K does not encode position at all and would not produce relative dependence.",
      },
      {
        question: "You need to extend a RoPE model's context with minimal (or no) retraining while preserving fine-grained local ordering. Which approach best fits, and why?",
        options: [
          "Position Interpolation alone, because squeezing all positions into the trained range is the only method that avoids out-of-distribution angles",
          "ALiBi, because its linear recency penalty is ideal for retrieving information from far back in the context",
          "YaRN / NTK-aware base scaling, which stretches the long-range (low-frequency) rotations while leaving the high-frequency local pairs nearly untouched, so local resolution is preserved with little retraining",
          "Increasing the number of attention heads so more heads can specialize in distant positions",
        ],
        correct: 2,
        explanation: "Option C is correct: NTK-aware scaling raises the base (theta) to slow the high-frequency pairs, and YaRN refines this per-frequency — interpolating the long-range pairs the most while leaving the local high-frequency pairs almost unchanged, plus a small attention-temperature tweak. This keeps fine-grained local order intact and typically needs little or no fine-tuning, which is exactly the requirement. Option A is wrong because plain Position Interpolation compresses local resolution (it squeezes all positions uniformly) and usually needs a fine-tune to recover — the opposite of preserving local detail. Option B is wrong because ALiBi's linear penalty structurally down-weights distant tokens, hurting long-range retrieval, not helping it. Option D is unrelated — head count does not encode or extend position.",
      },
      {
        question: "Compared with ALiBi, why does RoPE tend to preserve long-range retrieval better?",
        options: [
          "ALiBi rotates the value vectors, which scrambles distant content, while RoPE leaves values intact",
          "ALiBi adds a linear penalty that grows with distance, structurally down-weighting far tokens (recency bias); RoPE encodes relative position through rotation without forcing monotonic decay, so distant tokens are not systematically suppressed",
          "RoPE has a larger position table, so it can store more distant positions explicitly",
          "ALiBi cannot represent any relative position information, so it always ignores token order",
        ],
        correct: 1,
        explanation: "Option B is correct: ALiBi subtracts a distance-proportional linear penalty from attention scores, which cheaply extrapolates but bakes in a recency bias — far-back tokens are structurally penalized, hurting tasks that must retrieve distant information. RoPE encodes relative position via rotation inside the dot product without imposing monotonic decay, so distant tokens are not automatically down-weighted, preserving long-range retrieval. That is a major reason frontier models chose RoPE. Option A is wrong: ALiBi does not rotate values (it only adjusts scores), and RoPE also leaves V untouched. Option C is wrong because RoPE has no position table at all. Option D overstates ALiBi — it does encode relative distance (that's the whole point of the penalty); its weakness is the recency bias, not an inability to represent order.",
      },
    ],
    takeaway: "Attention is order-blind, so position must be injected. RoPE rotates Q and K (never V) by a position-dependent angle so the attention score depends only on the relative offset (m − n) — giving graceful length generalization that absolute/learned PE can't match. To extend context you scale the base/theta (NTK-aware, YaRN), not `max_position_embeddings`, which for a RoPE model is not a real lever.",
  },
  "gqa-mqa": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "You benchmark a 7B model's throughput and it looks great with a single request. In production, with long prompts and many concurrent users, throughput craters and you OOM long before the model weights fill VRAM. Profiling shows the KV cache — not the weights — eating most of your memory, and it grows with every user and every token. Someone asks why Llama-2-70B uses '8 KV heads' when it has 64 query heads, and whether you can just 'use fewer KV heads' on your model. You need to explain the KV-cache bottleneck and the MHA → MQA → GQA spectrum before choosing an architecture.",
    explanation: [
      "In standard **Multi-Head Attention (MHA)**, every layer projects the input into `H` separate **query, key, and value** heads. During autoregressive decoding you generate one token at a time, and each new token must attend to **every previous token**. Recomputing the keys and values for the whole history at every step would be quadratically wasteful, so instead you **cache** the K and V vectors for all past tokens — the **KV cache** — and only compute Q/K/V for the newest token.\n\nThat cache is the hidden memory monster. ==Its size is: 2 (K and V) × num_layers × num_KV_heads × head_dim × sequence_length × batch_size × bytes_per_element.== It scales with **both** context length and the number of concurrent requests — which is exactly why single-request benchmarks look fine and production OOMs.",
      { type: "illustration", label: "Why the KV cache — not the weights — dominates at inference", content: `Decoding step t: generate token t, attend to tokens 0..t-1
  Naive: recompute K,V for all past tokens every step  -> O(t^2) waste
  Fix:   cache K,V once per token, reuse forever          -> the KV cache

KV cache size (bytes):
  2 * layers * KV_heads * head_dim * seq_len * batch * dtype_bytes
  ^                                  ^          ^
  K and V                            grows w/   grows w/
                                     context    users

Example (MHA, 7B-ish): 32 layers, 32 KV heads, head_dim 128,
  seq_len 8192, batch 1, fp16 (2 bytes):
  2 * 32 * 32 * 128 * 8192 * 1 * 2  ~= 4.3 GB  ...for ONE request
  -> 16 concurrent users -> ~68 GB of cache alone (weights on top)

The weights are FIXED; the KV cache scales with users x context.
That's the bottleneck long-context, high-concurrency serving hits.` },
      "Look at the formula and one term jumps out as the lever: **num_KV_heads**. The queries have to stay numerous — you want `H` distinct query 'views' for model quality — but the cache size is driven by how many **K/V** heads you store. ==What if many query heads shared the same keys and values?== That is the entire idea behind MQA and GQA.",
      "**Multi-Query Attention (MQA)** takes it to the extreme: keep all `H` **query** heads, but use a **single, shared K head and single V head** for the whole layer. Every query head attends against the same keys and values. The KV cache shrinks by a factor of `H` — for 32 heads, that's a **32× reduction** in cache memory (and a matching cut in the memory bandwidth you must move per decode step, which is what actually gates decode latency).\n\nThe cost is **quality**. Collapsing to one K/V head removes the diversity of 'what each head looks for and retrieves,' and large models trained with pure MQA tend to lose a bit of accuracy and can be less stable to train. ==MQA is maximum memory savings, minimum K/V diversity — a corner of the design space, not always the sweet spot.==",
      "**Grouped-Query Attention (GQA)** is the interpolation that won. Instead of `H` KV heads (MHA) or `1` KV head (MQA), use **G groups**, where `1 < G < H`. The `H` query heads are partitioned into `G` groups, and **all query heads within a group share one K head and one V head**. So you store `G` K/V heads instead of `H`.\n\nGQA-`G` is a dial: **G = H is exactly MHA; G = 1 is exactly MQA.** You choose `G` to hit the memory budget while keeping enough K/V diversity for quality. ==It captures most of MQA's memory and bandwidth savings while recovering nearly all of MHA's quality — which is why it's the default in modern LLMs.==",
      { type: "illustration", label: "MHA vs MQA vs GQA — KV heads per layer (H = 8 query heads)", content: `MHA (H KV heads):          8 query heads -> 8 KV heads
  Q0 Q1 Q2 Q3 Q4 Q5 Q6 Q7
  |  |  |  |  |  |  |  |
  K0 K1 K2 K3 K4 K5 K6 K7      cache = 8 KV heads  (baseline, best quality)

MQA (1 KV head):           8 query heads -> 1 shared KV head
  Q0 Q1 Q2 Q3 Q4 Q5 Q6 Q7
   \\  \\  \\  |  /  /  /  /
        [ K0 / V0 ]             cache = 1 KV head   (8x smaller, quality dips)

GQA (G groups, here G=2):  8 query heads -> 2 KV heads (4 queries share each)
  Q0 Q1 Q2 Q3     Q4 Q5 Q6 Q7
    \\ | | /          \\ | | /
   [ K0/V0 ]        [ K1/V1 ]    cache = 2 KV heads (4x smaller, ~MHA quality)

  G = H  => MHA        G = 1  => MQA        1 < G < H  => GQA
  Llama-2/3-70B: 64 query heads, 8 KV heads  -> GQA-8 (8x cache cut)` },
      "This is exactly the Llama-2-70B question from the scenario: **64 query heads, 8 KV heads = GQA with G = 8**. You keep 64 query 'views' for quality but store only 8 sets of K/V, an **8× cut** in KV-cache memory and bandwidth versus full MHA. That's what makes long-context, high-batch serving feasible on the same hardware.\n\nOne caveat for 'just use fewer KV heads on my model': **GQA is an architectural choice made at pretraining time.** The K/V projections are shaped for `G` groups and the model is trained that way — you can't simply drop KV heads from an already-trained MHA checkpoint and expect it to work. There is a technique called **uptraining** (a.k.a. GQA conversion) that mean-pools an MHA model's KV heads into groups and then fine-tunes briefly to recover quality, but it is a retraining step, not a config flag.\n\nNamed users: **MQA** — PaLM, Falcon, the original Shazeer proposal; **GQA** — Llama-2/3 (70B and up), Mistral 7B, and most current open frontier models. ==The recurring interview trap: treating query-head count and KV-head count as the same number. They are decoupled — quality wants many Q heads, the KV cache wants few KV heads, and GQA is how you get both.==",
    ],
    keyPoints: [
      "**The KV cache is the inference memory bottleneck, not the weights.** To avoid O(t²) recompute, decoding caches K and V for all past tokens; its size scales with num_KV_heads × head_dim × layers × seq_len × **batch** — so it grows with both context length and concurrent users.",
      "**Weights are fixed; the KV cache scales with users × context.** That's why a single-request benchmark looks fine while high-concurrency, long-context production OOMs on cache alone.",
      "**MQA = 1 shared K/V head** for all H query heads. Cache shrinks ~H× (and per-step memory bandwidth with it, which gates decode latency), but collapsing K/V diversity costs quality and training stability.",
      "**GQA = G groups (1 < G < H):** query heads are partitioned into G groups, each group sharing one K/V head → store G KV heads, not H. **G = H is MHA; G = 1 is MQA** — GQA is the tunable interpolation.",
      "**GQA keeps most of MQA's memory/bandwidth savings with near-MHA quality** — the reason it's the modern default. Llama-2/3-70B: 64 query heads, 8 KV heads = GQA-8, an 8× cache cut.",
      "**Query-head count and KV-head count are decoupled.** Quality wants many Q heads; the cache wants few KV heads. GQA is a pretraining-time choice (you can't just drop KV heads from a trained MHA model — 'uptraining' converts, at a retraining cost). Users: MQA (PaLM, Falcon); GQA (Llama-2/3, Mistral).",
    ],
    recap: [
      "**KV cache, not weights, is the inference bottleneck.** Caching K/V avoids O(t²) recompute; its size scales with num_KV_heads × layers × head_dim × **seq_len × batch** — grows with context and users.",
      "**MQA:** keep all H query heads, share **1** K/V head → ~H× smaller cache and bandwidth, but K/V-diversity loss dents quality.",
      "**GQA:** **G** groups (1 < G < H), each sharing one K/V head → store G KV heads. **G = H ⇒ MHA, G = 1 ⇒ MQA.**",
      "**GQA wins** because it keeps most memory/bandwidth savings with near-MHA quality. Llama-2/3-70B = 64 Q heads / 8 KV heads = **GQA-8** (8× cut).",
      "**Q heads ≠ KV heads.** Quality wants many Q; cache wants few KV. GQA is chosen at pretraining (or via 'uptraining' conversion), not a runtime flag.",
    ],
    mcqs: [
      {
        question: "A 7B model benchmarks well on a single request but OOMs in production with many concurrent long-context users, and profiling shows the model weights are NOT the memory hog. What is consuming the memory, and why does it explode in production specifically?",
        options: [
          "The model weights are being duplicated per request; sharing them across requests fixes it",
          "The KV cache — K and V vectors cached for every past token — whose size scales with sequence length AND batch size, so it grows with both context length and the number of concurrent users",
          "Gradient buffers accumulate during inference and must be cleared between requests",
          "The attention softmax allocates an O(seq_len²) score matrix that is retained after each step",
        ],
        correct: 1,
        explanation: "Option B is correct: to avoid recomputing keys and values for the whole history at every decode step (which would be O(t²)), inference caches K and V for all past tokens. That KV cache scales as 2 × layers × KV_heads × head_dim × seq_len × batch × dtype_bytes, so it grows with both context length and concurrency — which is exactly why a single-request benchmark looks fine but many long-context users OOM on cache alone, with the fixed weights untouched. Option A is wrong because weights are shared across requests already and, per the profiling, aren't the hog. Option C is wrong because inference has no gradient buffers (no backward pass). Option D is wrong because the attention score matrix is transient and freed per step; the persistent, growing allocation is the KV cache.",
      },
      {
        question: "Llama-2-70B has 64 query heads but only 8 KV heads. Which attention scheme is this, and what does the 8 buy you?",
        options: [
          "Multi-Query Attention (MQA): a single shared KV head, giving a 64× cache reduction",
          "Multi-Head Attention (MHA): the 8 is the number of layers, unrelated to KV sharing",
          "Grouped-Query Attention (GQA) with G = 8: the 64 query heads are partitioned into 8 groups sharing 8 KV heads, cutting KV-cache memory and bandwidth ~8× versus full MHA while keeping 64 query 'views' for quality",
          "Sliding-window attention: 8 is the window size in tokens",
        ],
        correct: 2,
        explanation: "Option C is correct: 64 query heads with 8 KV heads is GQA with G = 8 — the query heads are split into 8 groups, each group sharing one K/V head, so you store 8 sets of K/V instead of 64. That is an ~8× reduction in KV-cache memory and per-step bandwidth versus MHA, while preserving 64 distinct query heads for quality. Option A is wrong because MQA uses exactly one KV head; here there are 8. Option B is wrong because GQA's KV-head count is unrelated to layer count. Option D is wrong because 8 is the number of KV heads (groups), not a sliding-window size.",
      },
      {
        question: "In GQA terms, what are MHA and MQA, and what does that imply about GQA's role?",
        options: [
          "MHA and MQA are unrelated to GQA; GQA is a separate mechanism that caches values in lower precision",
          "MHA is GQA with G = H (one KV head per query head) and MQA is GQA with G = 1 (all query heads share one KV head); GQA (1 < G < H) is the tunable interpolation between them",
          "MHA is GQA with G = 1 and MQA is GQA with G = H; GQA sits outside both extremes",
          "Both MHA and MQA use G = H; they differ only in head_dim, and GQA changes head_dim instead of head count",
        ],
        correct: 1,
        explanation: "Option B is correct: GQA-G stores G KV heads with the H query heads partitioned into G groups. Setting G = H gives every query head its own KV head — that is exactly MHA. Setting G = 1 makes all query heads share a single KV head — that is exactly MQA. So GQA is the continuous dial between the MHA and MQA extremes, letting you trade KV-cache memory against K/V diversity/quality. Option C inverts the two extremes. Option A is wrong because GQA is precisely about KV-head sharing, not precision. Option D is wrong because GQA varies the number of KV heads (groups), not head_dim.",
      },
      {
        question: "You have a trained MHA checkpoint and want the memory benefits of GQA. Which statement is accurate?",
        options: [
          "You can set a num_kv_heads config flag at load time and the model will immediately serve as GQA with no quality loss",
          "GQA is fixed at pretraining because the K/V projections are shaped for G groups; converting an MHA checkpoint requires 'uptraining' — mean-pooling KV heads into groups then a short fine-tune to recover quality — not a runtime flag",
          "GQA can only be obtained by training a brand-new model from scratch; no conversion of an existing checkpoint is possible",
          "You should switch to MQA instead, since MQA can always be applied to any trained model for free with no quality impact",
        ],
        correct: 1,
        explanation: "Option B is correct: GQA's grouping is baked into the shape of the K/V projections at pretraining, so you can't just drop KV heads from a trained MHA model via a config flag. The established path is 'uptraining' (GQA conversion): mean-pool the MHA model's KV heads into G groups to initialize the smaller K/V projections, then fine-tune briefly to recover quality. Option A is wrong because a bare flag doesn't reshape or retrain the projections and would break the model. Option C is too strong — conversion via uptraining exists, so from-scratch is not the only option. Option D is wrong because MQA is not free to bolt on and does incur a quality/stability cost, especially at scale.",
      },
    ],
    takeaway: "At inference the KV cache — not the weights — is the memory and bandwidth bottleneck, and it scales with both context length and concurrent users. MQA (1 shared KV head) shrinks it ~H× but hurts quality; GQA (G groups, 1 < G < H) is the tunable middle that keeps most of the savings at near-MHA quality — which is why Llama-2/3 and Mistral use it (e.g., Llama-2-70B = 64 query heads, 8 KV heads = GQA-8). Query-head count and KV-head count are decoupled, and the choice is made at pretraining.",
  },
  "grpo-rlvr": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your team wants to improve a model's math and coding accuracy with RL. The classic recipe is RLHF with PPO — but that means training a separate reward model on human preference data AND a value/critic network, roughly doubling your memory and adding a fragile, gameable reward model. Meanwhile DeepSeek-R1 reached strong reasoning with GRPO, and Sarvam and others push RLVR — 'reinforcement learning from verifiable rewards.' A stakeholder asks: for math and code, why would you train a reward model at all when you can just *check if the answer is right*? You need to explain PPO → GRPO and RLHF → RLVR, and when verifiable rewards beat a learned reward model.",
    explanation: [
      "Start with the classic **RLHF-with-PPO** stack, because GRPO and RLVR are each defined by what they *remove* from it. RLHF has three phases: (1) supervised fine-tune; (2) train a **reward model (RM)** on human preference pairs ('response A is better than B') so it outputs a scalar reward; (3) optimize the policy against that RM using **PPO**, with a **KL penalty** to a frozen reference model so the policy doesn't drift into gibberish that games the RM.\n\nPPO itself needs a **value network (critic)** — a second large network that estimates the expected future reward of a state, used to compute the **advantage** (how much better an action was than expected) that stabilizes the gradient. ==So a full PPO run holds up to FOUR models in memory — policy, reference, reward model, and critic — which is the cost and complexity GRPO attacks.==",
      { type: "illustration", label: "RLHF+PPO stack vs GRPO — what gets removed", content: `RLHF + PPO  (up to 4 models resident):
  [ POLICY ]     <- being trained
  [ REFERENCE ]  <- frozen, for KL penalty (anti-reward-hacking)
  [ REWARD MODEL ] <- learned from human preference pairs -> scalar reward
  [ CRITIC/VALUE ] <- estimates baseline; advantage = reward - value(state)

  advantage_t = reward - V(state_t)      (needs the learned critic)

GRPO  (DeepSeek) -- DROP THE CRITIC:
  For one prompt, sample a GROUP of G outputs {o_1 ... o_G}.
  Score each -> rewards {r_1 ... r_G}.
  baseline = MEAN reward of the group (no value net!)
  advantage(o_i) = (r_i - mean(r)) / std(r)   <- group-relative, normalized

  [ POLICY ] + [ REFERENCE (KL) ] + reward source.  Critic GONE.
  -> ~one fewer large network; simpler, cheaper, less to destabilize.` },
      "**GRPO (Group Relative Policy Optimization)**, from DeepSeek, changes exactly one thing about PPO: it **removes the critic**. PPO needed the value network to compute a baseline for the advantage. GRPO gets that baseline for *free* by sampling a **group of G outputs for the same prompt**, scoring all of them, and using the **group's mean reward as the baseline**. An output's advantage is its reward **relative to its siblings** — normalized by the group's standard deviation.\n\n==That's the whole trick: 'was this response better or worse than the *other* responses I sampled for this same prompt?' No learned critic required — the comparison group *is* the baseline.== It keeps PPO's clipped objective and KL-to-reference term, but drops one of the four networks, cutting memory and removing a notoriously finicky component to tune.",
      "GRPO answers *how* you optimize (critic-free, group-relative). **RLVR** answers a different question: **where does the reward come from?** In classic RLHF, the reward is a **learned reward model** — a neural net trained to imitate human preferences. **RLVR — Reinforcement Learning from Verifiable Rewards — throws out the learned RM entirely and uses a rule or verifier that checks whether the answer is actually correct.**\n\nFor math: does the final answer equal the ground truth (or pass a symbolic check)? Reward 1, else 0. For code: does it **compile and pass the unit tests / execute correctly**? For format: does it follow the required schema? ==The reward is computed by *running a checker*, not by *asking a neural network what a human would probably prefer*.== That is exactly the stakeholder's instinct: when you can literally check the answer, you don't need a model to guess at quality.",
      { type: "illustration", label: "Learned reward model (RLHF) vs verifiable reward (RLVR)", content: `RLHF -- LEARNED reward model:
  response ->  [ neural RM trained on human prefs ]  -> scalar reward
  + captures fuzzy, subjective quality (helpfulness, tone, style)
  - APPROXIMATE and GAMEABLE: policy finds inputs that fool the RM
    (reward hacking); RM drifts off-distribution as policy improves;
    needs costly human preference data to train.

RLVR -- VERIFIABLE reward (rule / verifier, NOT a learned model):
  math:   answer == ground_truth ?           -> 1 else 0
  code:   compiles AND passes unit tests ?    -> 1 else 0
  format: matches required schema ?           -> 1 else 0
  + GROUNDED: reward = actual correctness, essentially ungameable
    (can't "fool" a unit test), no RM to train, no preference labels.
  - only works where correctness is CHECKABLE (math, code, logic,
    structured output). Fails for open-ended "which essay is nicer?"

Common modern recipe:  GRPO (critic-free optimizer)
                        + RLVR (verifiable reward source)
  = DeepSeek-R1-style reasoning RL; the RLVR reward source is
    also central to Sarvam's post-training.`
      },
      "**GRPO and RLVR are orthogonal and usually combined.** GRPO is the *optimizer* (critic-free, group-relative advantage); RLVR is the *reward source* (a verifier, not a learned RM). DeepSeek-R1-style reasoning training is essentially **GRPO + RLVR**: sample a group of chain-of-thought solutions, reward each by whether the final answer verifies, take group-relative advantages, update. Sarvam's post-training likewise leans on **verifiable rewards** for its reasoning and multilingual-correctness objectives.\n\n**When do verifiable rewards beat a learned RM?** ==Whenever correctness is *checkable*: math, code, unit-testable functions, logical/constraint satisfaction, structured/JSON output, tool-call correctness.== In those domains a learned RM is strictly worse — it only *approximates* a signal you can compute exactly, and it can be gamed (reward hacking) and drifts out of distribution as the policy improves. A verifier can't be fooled by a plausible-but-wrong answer: the unit test either passes or it doesn't.",
      "**When does a learned RM still win?** When the objective is **subjective or open-ended** — helpfulness, tone, writing style, harmlessness, 'which of these two essays is nicer?' — there is no verifier to run, so you need a model that captures fuzzy human preference. That's the RLHF/RLVR division of labor: **RLVR for objectively checkable skills, RLHF-style learned reward for taste and safety.** Frontier post-training typically blends both.\n\nOne more cousin: **DPO (Direct Preference Optimization)** attacks the same RLHF cost from another angle — it skips the *explicit* reward model AND the RL loop, optimizing the policy *directly* on preference pairs with a simple classification-style loss. So the landscape: **RLHF/PPO** (learned RM + critic, full RL), **DPO** (no RM, no RL loop, direct on preferences), **GRPO** (RL but critic-free, group-relative), **RLVR** (RL with a *verifier* reward instead of a learned RM). ==The recurring interview trap: conflating GRPO (an optimizer that drops the critic) with RLVR (a reward *source* that drops the learned reward model). They solve different problems and are most powerful together.==",
    ],
    keyPoints: [
      "**RLHF+PPO holds up to four models:** policy, frozen reference (for the KL penalty vs reward-hacking), a **learned reward model** (from human preference pairs), and a **critic/value net** (for the advantage baseline). GRPO and RLVR are each defined by what they delete from this.",
      "**GRPO drops the CRITIC.** For each prompt it samples a **group of G outputs**, scores them, and uses the **group mean as the baseline**; advantage = (reward − group_mean)/group_std — 'better or worse than my siblings for this same prompt.' No value network needed.",
      "**RLVR drops the LEARNED REWARD MODEL.** The reward is computed by a **rule/verifier that checks correctness** — answer == ground truth (math), compiles + passes tests (code), matches schema (format) — reward 1/0, not a neural net's guess at human preference.",
      "**GRPO and RLVR are orthogonal — optimizer vs reward source — and usually combined** (DeepSeek-R1-style: sample a group of solutions, reward by verification, take group-relative advantages). RLVR is central to Sarvam's post-training.",
      "**Verifiable rewards beat a learned RM wherever correctness is checkable** (math, code, logic, structured output, tool calls): exact instead of approximate, essentially **ungameable** (can't fool a unit test), no preference labels, no RM drift as the policy improves.",
      "**A learned RM still wins for subjective/open-ended goals** (helpfulness, tone, style, safety) where no verifier exists. Related: **DPO** skips both the RM and the RL loop, optimizing directly on preference pairs. Don't conflate GRPO (drops critic) with RLVR (drops learned RM).",
    ],
    recap: [
      "**RLHF+PPO = up to 4 models:** policy, frozen reference (KL), **learned reward model**, **critic**. GRPO and RLVR each remove one.",
      "**GRPO drops the critic:** sample **G outputs/prompt**, baseline = **group mean**, advantage = (r − mean)/std — group-relative, critic-free (DeepSeek).",
      "**RLVR drops the learned RM:** reward = a **verifier/rule** (answer correct? tests pass? schema valid?) → 1/0, not a neural preference guess. Used by Sarvam, DeepSeek-R1.",
      "**Orthogonal & combined:** GRPO = optimizer, RLVR = reward source. R1-style RL = GRPO + RLVR.",
      "**Verifiable > learned RM when correctness is checkable** (math/code/logic): exact, ungameable, no labels. **Learned RM wins for subjective goals** (tone/safety). **DPO** = no RM, no RL loop.",
    ],
    mcqs: [
      {
        question: "What is the single core change GRPO makes relative to PPO, and how does it compensate?",
        options: [
          "It removes the frozen reference model, so there is no longer any KL penalty during training",
          "It removes the critic/value network and instead uses the mean reward over a sampled GROUP of outputs for the same prompt as the advantage baseline (advantage = (reward − group_mean)/group_std)",
          "It removes the reward model and replaces it with a unit-test verifier",
          "It replaces the clipped PPO objective with plain supervised cross-entropy on the best sampled output",
        ],
        correct: 1,
        explanation: "Option B is correct: GRPO's defining move is dropping PPO's critic (value network). PPO used the critic to compute the advantage baseline; GRPO instead samples a group of G outputs for the same prompt, scores them, and uses the group's mean reward as the baseline, normalizing by the group's standard deviation — so an output's advantage is its reward relative to its siblings. Option A is wrong because GRPO keeps the reference model and the KL penalty; it's the critic that goes. Option C describes RLVR (a reward-source change), not GRPO (an optimizer change) — a classic conflation. Option D is wrong because GRPO retains PPO's clipped policy-gradient objective; it doesn't collapse into supervised learning on the best sample.",
      },
      {
        question: "RLVR is described as removing a component of the classic RLHF stack. Which component, and what replaces it?",
        options: [
          "It removes the policy network and trains only the reward model",
          "It removes the critic and replaces it with a group-relative baseline",
          "It removes the LEARNED reward model and replaces it with a rule/verifier that checks whether the output is actually correct (e.g., answer matches ground truth, code passes unit tests)",
          "It removes the KL penalty so the policy can move arbitrarily far from the reference",
        ],
        correct: 2,
        explanation: "Option C is correct: RLVR — Reinforcement Learning from Verifiable Rewards — discards the learned reward model (the neural net trained to imitate human preferences) and instead computes reward by running a verifier or rule: does the math answer equal ground truth? does the code compile and pass tests? does the output match the required schema? The reward is grounded correctness, not a model's approximation of human taste. Option A inverts the roles — the policy is what's trained; the RM is what's removed. Option B describes GRPO (dropping the critic), a different, orthogonal change. Option D is wrong because RLVR does not require removing the KL penalty; it changes the reward source, not the regularization.",
      },
      {
        question: "For improving a model's competitive-math accuracy, why can verifiable rewards (RLVR) beat a learned reward model?",
        options: [
          "A learned reward model is faster to evaluate than checking an answer, but verifiable rewards generalize to more domains",
          "For checkable tasks the verifier gives the EXACT correctness signal and is essentially ungameable (a plausible-but-wrong answer still fails the check), whereas a learned RM only APPROXIMATES the signal, can be reward-hacked, and drifts off-distribution as the policy improves",
          "Verifiable rewards provide dense per-token gradients, while a learned RM provides no gradient at all",
          "A learned reward model cannot be used together with GRPO, so RLVR is the only option once you drop the critic",
        ],
        correct: 1,
        explanation: "Option B is correct: in a domain where correctness is checkable (math answers, code tests), a verifier computes the exact reward and can't be fooled by a fluent wrong answer — it's essentially ungameable, needs no human preference labels, and never drifts. A learned RM only approximates that signal, is vulnerable to reward hacking, and goes out-of-distribution as the policy gets stronger (the very inputs the improving policy produces are unlike the RM's training data). Option A is wrong on both counts — the point isn't RM speed, and RLVR is narrower in domain (only where correctness is checkable), not broader. Option C is wrong because RLVR rewards are typically sparse/terminal (1/0 on the final answer), not dense per-token. Option D is wrong because GRPO (an optimizer) works with either a learned RM or a verifier — they're orthogonal choices.",
      },
      {
        question: "When is a LEARNED reward model still the right choice over RLVR, and how does DPO relate to this landscape?",
        options: [
          "A learned RM is always inferior to RLVR; DPO is simply RLVR applied to code",
          "Use a learned RM for subjective/open-ended objectives (helpfulness, tone, style, safety) where no verifier exists; DPO is a separate approach that skips BOTH the explicit reward model and the RL loop, optimizing the policy directly on preference pairs",
          "Use a learned RM only for math and code, since those are the only tasks with clear correct answers; DPO trains the critic that GRPO removes",
          "A learned RM is required whenever you use GRPO, because group-relative advantages need a value network; DPO provides that value network",
        ],
        correct: 1,
        explanation: "Option B is correct: RLVR only applies where correctness is checkable, so for subjective or open-ended goals — helpfulness, tone, writing quality, harmlessness — you still need a learned reward model that captures fuzzy human preference, since there's no verifier to run. DPO is a distinct method that attacks RLHF's cost by skipping both the explicit reward model and the RL loop, optimizing the policy directly on preference pairs with a classification-style loss. Option A is wrong: a learned RM is not always inferior (it's essential for subjective goals), and DPO is not RLVR-for-code. Option C inverts the domain logic — math/code are exactly where you'd prefer a verifier, not a learned RM — and DPO does not train a critic. Option D is wrong because GRPO's group-relative baseline is precisely what removes the need for a value network, and DPO is not a critic.",
      },
    ],
    takeaway: "GRPO and RLVR are each defined by what they cut from the RLHF+PPO stack, and they're orthogonal: GRPO is the optimizer that drops the critic (baseline = group-mean reward over G sampled outputs, giving group-relative advantage), while RLVR is the reward source that drops the learned reward model (reward = a verifier checking actual correctness — right answer, passing tests). Verifiable rewards beat a learned RM wherever correctness is checkable (math, code, logic) — exact and ungameable — while learned RMs remain necessary for subjective goals; the two are most powerful combined (DeepSeek-R1-style reasoning RL, and Sarvam's post-training).",
  },
};
