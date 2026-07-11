// Market-gap Foundations modules — RoPE, GQA/MQA, GRPO/RLVR. Spread into
// src/data/foundationsRunnerData.js. Keep the export name RUNNER_MARKET_GAP.
export const RUNNER_MARKET_GAP = {
  "rope": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "You already know two things from positional-encoding: attention can't tell word order on its own, and RoPE fixes this by rotating each token's query and key vectors — like turning a clock hand by an angle proportional to position — instead of stamping a position number onto them. That module built the geometric picture and showed you where naive length-extension breaks. This module goes one level deeper on both halves: not just *that* the rotation trick makes the attention score depend only on relative offset, but exactly *why* — worked through the matrix algebra itself — and a sharper, more exact treatment of the three real context-extension techniques than a single paragraph can give.\n\nSo we won't re-derive the order-blindness crisis or the frequency table again — you already have both. We pick up with the rotation matrix itself: what it is formally, the two algebraic properties that make it useful, and how those two properties alone force the entire relative-position guarantee out of the math, not just the geometry.",
    scenario: "Now let's put all of that to work on a real one. You fine-tune a 4K-context model and it's excellent. Product now wants it to answer over 32K-token documents, so you simply feed it 32K tokens at inference — no retraining. Quality collapses: the model produces fluent but ungrounded text and seems to lose track of anything past ~4K. A colleague says 'just increase max_position_embeddings.' The model uses RoPE. Take a moment before reading on: given everything above, why does the naive extension fail, and is that config even the right knob? Here's the reasoning, step by step. RoPE injects position by *rotating* Q and K by a position-dependent angle inside the dot product, so there is no learned position table to enlarge — `max_position_embeddings` isn't a trained lookup you can grow; bumping it only lifts a length guard while the real problem goes untouched. That real problem is that at large offsets the rotation angles reach phases never seen in training and drift out of distribution — which is exactly the fluent-but-ungrounded signature, not the model 'forgetting.' The right levers scale the base/theta: Position Interpolation squeezes positions into the trained range, NTK-aware raises the base to stretch long-range wavelengths, and YaRN does this per-frequency (leave local pairs untouched, interpolate long-range) for best-in-class extension with minimal retraining.",
    explanation: [
      "Recall the shape of the claim from positional-encoding: RoPE rotates Q and K by an angle proportional to position, and the attention score ends up depending only on the *difference* in position — not either absolute position. That was asserted there; here's exactly why it's true.\n\nA 2-D rotation by angle θ is the matrix `R(θ) = [[cosθ, −sinθ], [sinθ, cosθ]]`. Applied to any 2-D vector, `R(θ)` turns it by angle θ counterclockwise and leaves its length unchanged — a pure turn, no stretch, the exact clock-hand picture from before, now written down as a matrix. RoPE splits a token's Q and K vectors into pairs of dimensions and applies exactly this rotation to each pair, at position-dependent angle `m·θ_d` for a token at position `m` (pair `d`'s own frequency `θ_d` — the fast/slow spread you already met — is unchanged from positional-encoding).",
      "Two properties of rotation matrices are all the derivation needs, and both come from what a rotation *is*, not from anything about attention. First, rotations **compose by adding angles**: `R(a)·R(b) = R(a+b)` — rotating by a then by b lands you exactly where rotating once by their sum would, which falls straight out of the angle-addition identities `cos(a+b) = cos a cos b − sin a sin b` and `sin(a+b) = sin a cos b + cos a sin b`. Second, a rotation matrix is **orthogonal** — it satisfies `R(θ)ᵀ·R(θ) = I` — which means its transpose is simply the *reverse* rotation: `R(θ)ᵀ = R(−θ)`. Neither property depends on what vector gets rotated; they're facts about the matrices alone.",
      "Now watch what those two facts do to an attention score. Write `q_m = R(m·θ)q` for a query rotated at position `m`, and `k_n = R(n·θ)k` for a key rotated at position `n` (one dimension-pair, shared frequency θ, to keep the algebra clean). Attention needs their dot product: `⟨q_m, k_n⟩ = (R(m·θ)q)ᵀ (R(n·θ)k) = qᵀ R(m·θ)ᵀ R(n·θ) k`.\n\nSubstitute the two properties in order. The transpose becomes a reverse rotation: `R(m·θ)ᵀ = R(−m·θ)`. Then the two rotations compose by adding their angles: `R(−m·θ)·R(n·θ) = R((n−m)·θ)`. What's left is `qᵀ R((n−m)·θ) k = ⟨q, R((n−m)·θ)k⟩`. ==The absolute positions m and n have vanished completely — only their difference (n − m) survives.== That's the whole proof: `⟨R(m)q, R(n)k⟩ = ⟨q, R(n−m)k⟩` isn't a claim you take on faith, it's two trig identities applied in sequence.",
      { type: "illustration", label: "The identity, checked with real numbers (not just symbols)", content: `q = (1, 0),  k = (0, 1),  per-pair angle theta = 0.3 rad
position m = 3,  position n = 7   (relative offset = 4)

LEFT SIDE — rotate by the absolute positions, then dot:
  R(m*theta) = R(0.9):  R(0.9) q = (0.6216, 0.7833)
  R(n*theta) = R(2.1):  R(2.1) k = (-0.8632, -0.5048)
  <R(0.9)q, R(2.1)k> = (0.6216)(-0.8632) + (0.7833)(-0.5048) = -0.9320

RIGHT SIDE — skip straight to the relative offset (n - m = 4):
  R((n-m)*theta) = R(1.2):  R(1.2) k = (-0.9320, 0.3624)
  <q, R(1.2)k> = (1)(-0.9320) + (0)(0.3624) = -0.9320

Exactly the same answer, from two different computations -- one
using positions 3 and 7 directly, one using only their gap of 4.
That agreement IS what "depends only on the relative offset" means.` },
      "One recall worth keeping explicit, since it's the reason any of this matters: absolute position embeddings (the additive kind positional-encoding covered — a learned table, or fixed sinusoids) tie the score to `m` and `n` separately, so a lookup table with no row past position 4095 simply has nothing to return past that point. RoPE's rotation is defined for *any* `m` — there's no missing row — but ==\"defined\" is not \"in-distribution\": at a large offset the slow-rotating pairs reach rotation angles never encountered in training, so raw RoPE still degrades past its trained length, just far more gently than a lookup table that flat-out breaks.== That gentler-but-real degradation is exactly the scenario's fluent-but-ungrounded signature.",
      { type: "illustration", label: "Context extension: base/theta scaling, NTK, and YaRN", content: `The knob is BASE (theta), the wavelength of the rotations.

Position Interpolation (PI):  squeeze positions into the trained range
  feed position m as m * (L_train / L_new)   (e.g. scale 32K down to 4K)
  -> all angles stay in-distribution, but LOCAL resolution is compressed
  -> needs a short fine-tune to recover; hurts fine-grained nearby order

NTK-aware scaling:  raise base instead of squeezing positions
  base 10000 -> larger base  => slows the low-frequency pairs
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
      "Contrast with **ALiBi**, the other popular relative scheme. ALiBi adds no rotation and no embedding at all — it simply subtracts a **linear penalty proportional to distance** from each attention score (farther tokens are penalized more, with a fixed per-head slope). It extrapolates to longer contexts very cheaply and needs no tuning, but that same linear decay bakes in a **strong recency bias**: distant tokens are structurally down-weighted, which can hurt tasks that need to retrieve information from far back. RoPE encodes *relative position* without forcing monotonic decay, so it preserves long-range retrieval better — which is why it, not ALiBi, dominates the current frontier.\n\nNamed users: **RoPE** powers LLaMA / LLaMA-2 / LLaMA-3, Mistral, Qwen, DeepSeek, and most open frontier models; **YaRN** and **NTK-aware scaling** are the standard tricks behind their long-context variants. The recurring trap is treating `max_position_embeddings` as a real lever for a RoPE model: ==it is not — you scale the base/theta (NTK/YaRN), you don't enlarge a table that doesn't exist.==\n\nThis module's interactive — rotating Q/K vectors across a range of positions and watching the score depend only on their offset, never on the absolute positions themselves — lets you feel the identity holding directly. If you want the exact derivation behind the NTK base-scaling rule rather than just the qualitative direction, the Go Deeper section works it out with real numbers, extending the same matrix-algebra proof you just walked through to the context-length question. Then the closing scenario puts it to work on a 4K model fed 32K tokens — see if you can explain why the naive extension fails, and name the knob that isn't the config, before the reasoning does.",
    ],
    deeperMath: [
      "This is the formal backbone behind the picture positional-encoding gave you and the proof this module just walked through — the rotation-matrix identity and, going one step further than either module's main explanation, the exact formula for how much to rescale the rotation base when you extend context, derived rather than just asserted.",
      "**Why the composition and orthogonality properties hold, from scratch.** `R(a)R(b) = R(a+b)` is not a special fact about rotations in general — it's the angle-addition formulas for sine and cosine, written as a matrix product: multiplying `[[cos a, −sin a],[sin a, cos a]]` by `[[cos b, −sin b],[sin b, cos b]]` and expanding gives exactly `[[cos(a+b), −sin(a+b)],[sin(a+b), cos(a+b)]] = R(a+b)`. Orthogonality (`R(θ)ᵀR(θ) = I`) follows because rotation preserves length and angle for every vector — an isometry fixing the origin is precisely what an orthogonal matrix *is* — and for any orthogonal matrix, `Aᵀ = A⁻¹` by definition, so `R(θ)ᵀ` must be the rotation that undoes `R(θ)`, i.e. `R(−θ)`. Neither fact needs attention, tokens, or training at all — they're true of any 2-D rotation, which is exactly why RoPE can borrow them for free.",
      "**Deriving the NTK-aware base-scaling rule, not just stating it.** Per pair `d` (of `D/2` total pairs, `d` from `0` to `D/2 − 1`), RoPE's frequency is `θ_d = base^(−2d/D)`, so its **wavelength** — positions per full rotation — is `λ_d = 2π / θ_d = 2π · base^(2d/D)`.\n\nTwo boundary facts anchor the whole derivation. At `d = 0`: `θ_0 = base^0 = 1` for *any* base — the fastest, most local pair is completely insensitive to how you set the base. At the slowest pair, `d = D/2 − 1`: `λ_max = 2π · base^((D−2)/D)` — this is the pair that's barely completed a fraction of one rotation across the whole training window, and it's the one that goes out-of-distribution first when you stretch the context.\n\nNTK-aware scaling picks a new base `base'` so that this slowest pair's wavelength stretches by exactly the same factor `s = L_new / L_train` that the context itself grows by — keeping that pair's relationship to the (now-longer) window the same as it was in training — while the `d = 0` pair, already immune to base changes, stays untouched. Setting `λ'_max = s · λ_max`:\n\n`2π · base'^((D−2)/D) = s · 2π · base^((D−2)/D)`\n`base'^((D−2)/D) = s · base^((D−2)/D)`\n`base' = base · s^(D/(D−2))`",
      { type: "illustration", label: "NTK base-scaling formula, checked with real numbers", content: `D = 128 (head_dim), base = 10000, scale s = 8   (an 8x context-length extension)

base' = base * s^(D/(D-2)) = 10000 * 8^(128/126)
      = 10000 * 8^(1.01587)
      =  82,685   (verified: 10000 * 8.2685)

CHECK 1 — fastest pair (d=0) is untouched by construction:
  theta_0 = base^0 = 1        (any base)
  theta_0' = base'^0 = 1      (unchanged, exactly as claimed)

CHECK 2 — slowest pair (d=63, i.e. D/2-1) stretches by exactly s:
  lambda_63  (base=10000)  = 2*pi * 10000^(126/128) = 54,410 positions/cycle
  lambda_63' (base=82685)  = 2*pi * 82685^(126/128) = 435,281 positions/cycle
  ratio = 435,281 / 54,410 = 8.00   -- matches s = 8 exactly, as designed

Intermediate d values interpolate smoothly between "untouched"
(d=0) and "stretched by s" (d=63) -- this is exactly the
"local pairs nearly untouched, long-range pairs interpolated"
behavior the main explanation described qualitatively; here it's
the actual exponent, not just the direction.` },
      "**Why Position Interpolation compresses local resolution — and NTK-aware doesn't.** NTK-aware scaling rescales the *base*, which per CHECK 1 leaves `θ_0 = base^0 = 1` untouched at every base — the fastest pair, the one carrying the finest position-to-position distinctions, never moves. Position Interpolation makes a different move entirely: it never touches `θ_d` for any `d`. It rescales the *input position* itself, replacing every real position `m` with `m' = m · (L_train / L_new) = m / s`, before that position ever reaches the rotation. Because the substitution happens upstream of `θ_d`, it is frequency-blind — every pair `d`, including `d = 0`, receives the identical compression factor `1/s`. That uniformity is exactly the distortion NTK-aware's derivation was built to avoid.",
      { type: "illustration", label: "PI vs. NTK-aware at a real local position, checked with real numbers", content: `Same setup as CHECK 1/2: D=128, base=10000, s=8 (an 8x context-length extension). Take a genuinely local position, m=100.

NTK-AWARE (rescale the base, keep the position):
  theta_0 = base^0 = 1        (any base, per CHECK 1)
  theta_0' = base'^0 = 1      (identical)
  angle at m=100: m * theta_0 = 100 * 1 = 100 radians
  -- exactly the value the model saw in training. d=0 does not move.

POSITION INTERPOLATION (rescale the position, keep theta_d):
  m' = m / s = 100 / 8 = 12.5
  angle at m=100: m' * theta_0 = 12.5 * 1 = 12.5 radians
  -- the angle the model learned near position 12.5, not position 100.

THE SHARPER VERSION -- the gap between real neighbors, which is what
attention actually reads (RoPE is relative: <R(m)q,R(n)k> = <q,R(n-m)k>).
True neighbors m=100, m=101 are distance 1 apart.
  Original / NTK-aware gap:  theta_0*(101-100) = 1 radian
                              -- the exact trained per-token step
  PI gap:                    theta_0*(101/8 - 100/8) = theta_0/8 = 0.125 radian
                              -- one eighth of the trained step, at
                                 EVERY frequency, including d=0

NTK-aware stretches only the slowest pair's wavelength (CHECK 2) and
leaves theta_0 -- and every adjacent-token gap -- exactly as trained.
PI buys context length by uniformly shrinking all of them.` },
      "**Where YaRN goes one step further than a single exponent.** The derivation above picks one global `base'` from a boundary condition at the single slowest pair — a real, working rule (this is what 'NTK-aware scaling' means in practice), but it treats every intermediate pair as an automatic side effect of one exponent rather than something explicitly controlled. YaRN's refinement (Peng et al., 2023, building on the earlier 'NTK-by-parts' interpolation) instead defines an explicit ramp across the frequency index: pairs above a chosen cutoff (short-range, already reliable) are left essentially untouched, pairs below the cutoff (long-range) are interpolated the way Position Interpolation would, and a smooth ramp interpolates between the two regimes rather than one formula applying uniformly to every pair. That per-frequency control, plus a small attention-temperature correction, is why YaRN needs less fine-tuning data than plain NTK-aware scaling to hit the same target length — it's the same idea this derivation just made exact, taken one degree of freedom further.",
    ],
    keyPoints: [
      "**Attention is permutation-invariant** — the raw q·k carries no order — so every Transformer must inject a position signal. Absolute/learned PE *adds* a per-index vector, which ties the model to absolute positions.",
      "**Learned absolute PE cannot extrapolate:** `max_position_embeddings` is a lookup table with no rows past the training length. Sinusoidal PE is defined everywhere but still learned specific absolute patterns and drifts out of distribution.",
      "**RoPE rotates Q and K (never V)** by an angle `m·θ_d` per 2-D pair, inside the dot product. Algebraically the score then depends only on the **relative offset (n − m)** — the relative-position property.",
      "**Relative offsets generalize** because a pair 5 apart looks identical at positions (0,5) and (1000,1005) — the model saw that relationship everywhere in training. RoPE degrades far more gently than absolute PE, but still goes out-of-distribution at unseen large offsets.",
      "**Context extension scales the base/theta, not a table:** Position Interpolation squeezes positions in; NTK-aware raises the base to stretch long-range wavelengths; YaRN does this per-frequency (keep local, interpolate long-range) — current best, minimal retraining.",
      "**vs ALiBi:** ALiBi adds a linear distance penalty (cheap, extrapolates well) but bakes in recency bias that hurts long-range retrieval. RoPE encodes relative position without forced decay, so it dominates frontier models (LLaMA, Mistral, Qwen, DeepSeek).",
      "**The relative-offset property is a two-line proof, not an assertion:** transpose-as-reverse-rotation plus angle-addition composition turns `⟨R(m)q, R(n)k⟩` into `⟨q, R(n−m)k⟩` directly. The exact NTK base-scaling rule (`base' = base·s^(D/(D−2))`) falls out of the same style of boundary-condition argument — see Go Deeper.",
    ],
    recap: [
      "**Attention has no built-in order** — position must be injected. Absolute/additive PE ties you to the index; RoPE ties you to the *gap between* tokens.",
      "**RoPE rotates Q and K only** (not V) by `m·θ_d` per 2-D pair → dot product depends only on **(n − m)**, the relative offset.",
      "**Extends better**: relative offsets were seen at every absolute location → no 'undefined position 8000' — but raw RoPE still drifts out-of-distribution at large offsets.",
      "**Real lever = base/theta**: PI (squeeze positions), NTK-aware (raise base), YaRN (per-frequency, best). Raising `max_position_embeddings` does nothing for RoPE.",
      "**vs ALiBi**: linear distance penalty, cheap but recency-biased. RoPE = relative position, no forced decay → better long-range retrieval. Frontier models use RoPE.",
      "**Proof, not assertion:** `R(θ)ᵀ=R(−θ)` + `R(a)R(b)=R(a+b)` ⇒ `⟨R(m)q,R(n)k⟩=⟨q,R(n−m)k⟩`. NTK's `base'=base·s^(D/(D−2))` is the same boundary-condition style (Go Deeper).",
    ],
    mcqs: [
      {
        question: "A model uses RoPE. To extend its usable context from 4K to 32K, a teammate proposes 'just set max_position_embeddings to 32768.' Why is this the wrong lever?",
        options: [
          "It would work fine once you retrain the position table on 32K sequences, since max_position_embeddings sizes that lookup table for RoPE just like learned absolute PE",
          "The config only removes a length guard — RoPE has no table to grow; the real failure is rotation angles reaching phases never seen during training at large offsets",
          "max_position_embeddings sets how many attention heads process each token, so raising it just reshapes the head projections without touching position handling at all",
          "RoPE stores its position information inside the value vectors, so this config must be resized together with the value projection dimensions before longer contexts work",
        ],
        correct: 1,
        explanation: "The second option is correct: RoPE injects position by rotating Q and K by a position-dependent angle inside the dot product — there is no lookup table of position vectors. So max_position_embeddings is not a trained table you can grow; bumping it only removes a length guard, while the actual issue (rotation angles reaching unseen, out-of-distribution phases at large offsets) is untouched. The real levers scale the base/theta: Position Interpolation, NTK-aware scaling, or YaRN. The first option is wrong precisely because there is no position table to retrain for RoPE. The third option confuses an unrelated config — max_position_embeddings is about sequence length, not head count. The fourth option is wrong because RoPE rotates Q and K, never V; V carries content and is left unrotated.",
      },
      {
        question: "What is the defining algebraic property that makes RoPE a *relative* position encoding rather than an absolute one?",
        options: [
          "It adds a learned vector p_m to each token's embedding, so tokens farther from the start accumulate a larger positional component overall today",
          "It subtracts a fixed penalty proportional to |m − n| from every attention score, discounting distant tokens more heavily than nearby ones always",
          "It normalizes every query and key to unit length before the dot product, which cancels out any dependence on absolute position entirely",
          "After rotating q at m and k at n by their angles, their dot product reduces to a function of the offset (n − m) alone, not individually",
        ],
        correct: 3,
        explanation: "The fourth option is correct: RoPE rotates q_m by R(m) and k_n by R(n), and because rotations compose, ⟨R(m)q, R(n)k⟩ = ⟨q, R(n−m)k⟩ — the score depends only on the relative offset (n − m). That is why a pair 5 tokens apart looks the same at positions (0,5) or (1000,1005), which is the source of RoPE's graceful generalization. The first option describes additive absolute PE, which is exactly what RoPE replaces. The second option describes ALiBi's linear distance penalty, a different relative scheme that bakes in recency bias. The third option is wrong: unit-normalizing Q/K does not encode position at all and would not produce relative dependence.",
      },
      {
        question: "You need to extend a RoPE model's context with minimal (or no) retraining while preserving fine-grained local ordering. Which approach best fits, and why?",
        options: [
          "YaRN / NTK-aware base scaling: raise the rotation base so long-range (low-frequency) pairs stretch while high-frequency local pairs stay nearly untouched, preserving local resolution with little or no fine-tuning",
          "Position Interpolation on its own: squeeze all positions into the trained range by scaling every index down uniformly, which keeps angles in-distribution but compresses local resolution and usually needs a short fine-tune",
          "ALiBi's linear distance penalty: it extrapolates to new lengths for free and needs no tuning at all, so it is the best fit whenever local ordering must stay sharp",
          "Add more attention heads to the model so the extra heads can specialize in tracking distant token relationships, reducing reliance on the position encoding scheme itself",
        ],
        correct: 0,
        explanation: "The first option is correct: NTK-aware scaling raises the base (theta) to slow the low-frequency pairs, and YaRN refines this per-frequency — interpolating the long-range pairs the most while leaving the local high-frequency pairs almost unchanged, plus a small attention-temperature tweak. This keeps fine-grained local order intact and typically needs little or no fine-tuning, which is exactly the requirement. The second option is wrong because plain Position Interpolation compresses local resolution (it squeezes all positions uniformly) and usually needs a fine-tune to recover — the opposite of preserving local detail. The third option is wrong because ALiBi's linear penalty structurally down-weights distant tokens, hurting long-range retrieval, and it is not aimed at preserving local resolution specifically. The fourth option is unrelated — head count does not encode or extend position.",
      },
      {
        question: "Select the two true statements about how RoPE and ALiBi differ.",
        options: [
          "ALiBi rotates the value vectors by a position-dependent angle before they're passed onward to the next layer, similar to how RoPE treats queries and keys directly",
          "ALiBi subtracts a penalty proportional to the distance between tokens from each attention score, which extrapolates cheaply but down-weights distant tokens",
          "RoPE requires a learned position lookup table sized to the maximum context length, so it faces the same extrapolation ceiling as absolute embeddings used",
          "RoPE encodes relative position through rotation inside the dot product without imposing any monotonic decay, so distant tokens aren't automatically suppressed",
        ],
        correct: [1, 3],
        explanation: "The second and fourth options are correct together: ALiBi's linear distance penalty (second option) is what gives it cheap extrapolation but also bakes in recency bias, while RoPE's rotation-based relative encoding (fourth option) avoids that forced decay, which is why RoPE preserves long-range retrieval better. The first option is wrong — ALiBi does not rotate anything; it only subtracts a score penalty, and it is RoPE (not ALiBi) that rotates Q/K, never V. The third option is wrong because RoPE has no lookup table at all — that limitation belongs to absolute/learned PE, which is exactly what RoPE was designed to avoid.",
      },
    ],
    takeaway: "Attention is order-blind, so position must be injected. RoPE rotates Q and K (never V) by a position-dependent angle so the attention score depends only on the relative offset (n − m) — giving graceful length generalization that absolute/learned PE can't match. To extend context you scale the base/theta (NTK-aware, YaRN), not `max_position_embeddings`, which for a RoPE model is not a real lever.",
  },
  "gqa-mqa": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "A production riddle to start: the thing that usually exhausts a serving GPU isn't the model at all. It's what the model has to remember about every conversation in flight — a quiet, growing store this module is about to make visible. You're going to watch a perfectly healthy benchmark fall over under real traffic, and by the time it does, you'll know the mechanism cold.\n\nHere's where that memory comes from. To generate each new token, attention must look back at every earlier token — specifically at two vectors each earlier token produced, its key and its value. Recomputing them all for every new token would be absurdly wasteful, so serving systems store them once and reuse them. That store grows with every token, for every user, in every layer, for every attention head — and 'every attention head' is the multiplier this module attacks.\n\nBecause there's a design question hiding in plain sight: does every one of the model's query heads really need its own private set of keys and values to search over? What if several queries shared one? That single question generates a small family of architectures — the standard everyone started with, the radical all-heads-share-one version that slashed memory but cost quality, and the grouped compromise that won and now sits inside Llama and Mistral. Their names are **MHA**, **MQA**, and **GQA**, and this module works the actual numbers on all three. By the end you'll be able to read the head counts off a model card and predict its serving footprint before you've deployed anything.",
    scenario: "You benchmark a 7B model's throughput and it looks great with a single request. In production, with long prompts and many concurrent users, throughput craters and you OOM long before the model weights fill VRAM. Profiling shows the KV cache — not the weights — eating most of your memory, and it grows with every user and every token. Someone asks why Llama-2-70B uses '8 KV heads' when it has 64 query heads, and whether you can just 'use fewer KV heads' on your own model. Here's the answer, in the language of the lever you just isolated: 64 query heads with 8 KV heads is GQA at G = 8 — 8 groups of 8 query heads each, sharing one K/V head per group, an 8× cut in cache versus full MHA, with quality close to MHA because every group still keeps its own K/V pair. But 'just use fewer KV heads' isn't a knob on an already-trained model: G is baked in at pretraining, shaping how the K/V projections themselves were learned. Your real options are training a new checkpoint at a smaller G from scratch, or uptraining — mean-pooling an existing MHA model's KV heads into groups and fine-tuning briefly to recover quality. Either way, the memory savings trace back to a training-time architecture decision, not an inference-time config flag.",
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
      "**KV cache**, not weights, is the inference bottleneck. Caching K/V avoids O(t²) recompute; size ∝ KV_heads × layers × head_dim × **seq_len × batch** — grows with context & users.",
      "**MQA**: keep all H query heads, share **1** K/V head → ~H× smaller cache/bandwidth, but K/V-diversity loss dents quality.",
      "**GQA**: **G** groups (1 < G < H), each sharing one K/V head → store G KV heads. **G = H ⇒ MHA, G = 1 ⇒ MQA.**",
      "**GQA wins**: keeps most memory/bandwidth savings at near-MHA quality. Llama-2/3-70B = 64 Q heads / 8 KV heads = **GQA-8** (8× cut).",
      "**Q heads ≠ KV heads.** Quality wants many Q; cache wants few KV. GQA is a pretraining-time choice ('uptraining' converts an MHA checkpoint), not a runtime flag.",
    ],
    mcqs: [
      {
        question: "A 7B model benchmarks well on a single request but OOMs in production with many concurrent long-context users, and profiling shows the model weights are NOT the memory hog. What is consuming the memory, and why does it explode in production specifically?",
        options: [
          "Model weights are duplicated once per concurrent request, so sharing a single copy of the weights across requests would resolve the memory growth issue",
          "Backward-pass gradient buffers are allocated during generation and never freed between requests, accumulating until the process runs out of memory entirely",
          "Cached K and V vectors for every past token — the KV cache — whose size scales with sequence length and batch size, growing with context and users",
          "The attention softmax retains its full O(seq_len²) score matrix in memory after every decoding step instead of releasing it back to the pool",
        ],
        correct: 2,
        explanation: "The third option is correct: to avoid recomputing keys and values for the whole history at every decode step (which would be O(t²)), inference caches K and V for all past tokens. That KV cache scales as 2 × layers × KV_heads × head_dim × seq_len × batch × dtype_bytes, so it grows with both context length and concurrency — which is exactly why a single-request benchmark looks fine but many long-context users OOM on cache alone, with the fixed weights untouched. The first option is wrong because weights are shared across requests already and, per the profiling, aren't the hog. The second option is wrong because inference has no gradient buffers (no backward pass). The fourth option is wrong because the attention score matrix is transient and freed per step; the persistent, growing allocation is the KV cache.",
      },
      {
        question: "Llama-2-70B has 64 query heads but only 8 KV heads. Which attention scheme is this, and what does the 8 buy you?",
        options: [
          "Grouped-Query Attention (GQA) with G=8: 64 query heads split into 8 groups sharing one KV head, cutting KV-cache memory roughly 8x vs full MHA",
          "Multi-Query Attention (MQA): all 64 query heads share a single KV head, which would give a 64x cache reduction rather than the 8x implied here today",
          "Multi-Head Attention (MHA): the 8 refers to the number of transformer layers and has nothing to do with how keys and values are shared here",
          "Sliding-window attention: the 8 sets how many neighboring tokens each position can attend to, independent of the query/key head counts used",
        ],
        correct: 0,
        explanation: "The first option is correct: 64 query heads with 8 KV heads is GQA with G = 8 — the query heads are split into 8 groups, each group sharing one K/V head, so you store 8 sets of K/V instead of 64. That is an ~8× reduction in KV-cache memory and per-step bandwidth versus MHA, while preserving 64 distinct query heads for quality. The second option is wrong because MQA uses exactly one KV head; here there are 8. The third option is wrong because GQA's KV-head count is unrelated to layer count. The fourth option is wrong because 8 is the number of KV heads (groups), not a sliding-window size.",
      },
      {
        question: "Select the two true statements about how MHA and MQA relate to GQA.",
        options: [
          "MHA is the case G = H: every query head gets its own dedicated KV head, so no sharing happens at all",
          "MHA is the case G = 1: every query head is collapsed down to share a single KV head across the whole layer",
          "MQA is the case G = 1: all query heads are pooled into sharing one KV head, the maximum-sharing extreme",
          "GQA achieves its memory savings by shrinking head_dim rather than by changing how many KV heads are stored",
        ],
        correct: [0, 2],
        explanation: "The first and third options are correct together: setting G = H means every query head keeps its own KV head, which is exactly MHA (first option); setting G = 1 collapses all query heads onto a single shared KV head, which is exactly MQA (third option). GQA is the tunable dial between those two extremes. The second option inverts the MHA case — G = 1 is MQA, not MHA. The fourth option is wrong because GQA's savings come from reducing the number of stored KV heads, not from shrinking head_dim.",
      },
      {
        question: "You have a trained MHA checkpoint and want the memory benefits of GQA. Which statement is accurate?",
        options: [
          "Setting a num_kv_heads flag at load time immediately makes the model serve as GQA, with no quality loss, since the projections adapt automatically to it",
          "GQA's K/V projections are shaped for G groups at pretraining time; converting an MHA checkpoint needs 'uptraining' — pooling KV heads, then fine-tuning",
          "GQA can only come from training an entirely new model from scratch; there is no known way to convert an already-trained checkpoint at all",
          "Switching to MQA instead is the better move, since MQA can be applied to any trained model for free with no quality impact whatsoever",
        ],
        correct: 1,
        explanation: "The second option is correct: GQA's grouping is baked into the shape of the K/V projections at pretraining, so you can't just drop KV heads from a trained MHA model via a config flag. The established path is 'uptraining' (GQA conversion): mean-pool the MHA model's KV heads into G groups to initialize the smaller K/V projections, then fine-tune briefly to recover quality. The first option is wrong because a bare flag doesn't reshape or retrain the projections and would break the model. The third option is too strong — conversion via uptraining exists, so from-scratch is not the only option. The fourth option is wrong because MQA is not free to bolt on and does incur a quality/stability cost, especially at scale.",
      },
    ],
    takeaway: "At inference the KV cache — not the weights — is the memory and bandwidth bottleneck, and it scales with both context length and concurrent users. MQA (1 shared KV head) shrinks it ~H× but hurts quality; GQA (G groups, 1 < G < H) is the tunable middle that keeps most of the savings at near-MHA quality — which is why Llama-2/3 and Mistral use it (e.g., Llama-2-70B = 64 query heads, 8 KV heads = GQA-8). Query-head count and KV-head count are decoupled, and the choice is made at pretraining.",
  },
  "grpo-rlvr": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "To use reinforcement learning to make a model better at anything, you need one essential ingredient: a reward — some number that tells the policy 'that response was good' or 'that response was bad,' so it knows which direction to update in. For a lot of what people want a language model to be good at — helpful tone, good writing, not being creepy — there's no formula for 'good.' The standard fix is to have humans compare pairs of responses and train a separate model to imitate those human judgments, so you have a stand-in that can score responses automatically at scale.\n\nThat fix makes sense for the fuzzy, subjective stuff, because there genuinely isn't a formula for it. But notice what it costs. You now need to collect human preference data at scale. You need to train and maintain a whole extra model just to guess at quality. And that stand-in model is still only an approximation of a judgment, not the judgment itself — which means it can be wrong, or gamed.\n\nFor some tasks, though, the premise that 'there's no formula for good' simply isn't true. A math problem has a right answer. Code either passes its tests or it doesn't. If a task has a mechanical, checkable notion of correct, it's worth asking directly what a human-judgment model is even buying you there.",
    scenario: "Your team wants to improve a model's math and coding accuracy with RL. The classic recipe is RLHF with PPO — but that means training a separate reward model on human preference data AND a value/critic network, roughly doubling your memory and adding a fragile, gameable reward model. Meanwhile DeepSeek-R1 reached strong reasoning with GRPO, and Sarvam and others push RLVR — 'reinforcement learning from verifiable rewards.' A stakeholder asks: for math and code, why would you train a reward model at all when you can just *check if the answer is right*? Take a moment before reading on: what would you keep from PPO, what would you drop, and why does 'checkable' matter here specifically? Here's the reasoning, step by step. Start with where the reward comes from: a learned reward model is only ever an approximation of quality, trained to imitate human preference — but for math and code, correctness isn't a matter of preference, it's mechanically checkable, so RLVR swaps the learned RM for a verifier: does the final answer equal the ground truth, does the code compile and pass its tests? Reward 1 or 0, computed exactly, and a verifier can't be gamed the way a learned RM can, because there's no approximation to exploit in the first place. Then take the optimizer: PPO's critic exists only to give the policy a baseline to measure its advantage against, and GRPO gets that baseline for free by sampling a group of outputs for the same prompt and using their mean reward as the baseline instead — one fewer large network resident in memory, one less finicky component to tune. Put both changes together and you get exactly DeepSeek-R1's recipe: sample a group of solutions, score each with a verifier instead of a learned RM, compute group-relative advantages, update — no reward model to train, no critic to maintain, and a reward signal that's exact rather than approximate. The reason this works here and wouldn't for 'which response is more helpful' is the same reason the stakeholder's instinct is right: checkability. Math and code have a ground truth to check against; tone and helpfulness don't.",
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
      "**RLHF+PPO** = up to 4 models: policy, frozen reference (KL), **learned reward model**, **critic**. GRPO and RLVR each remove one.",
      "**GRPO drops the critic**: sample **G outputs/prompt**, baseline = group mean, advantage = (r−mean)/std — group-relative, critic-free (DeepSeek).",
      "**RLVR drops the learned RM**: reward = a **verifier/rule** (answer correct? tests pass? schema valid?) → 1/0, not a neural preference guess. Used by Sarvam, DeepSeek-R1.",
      "**Orthogonal & combined**: GRPO = optimizer, RLVR = reward source. R1-style RL = GRPO + RLVR.",
      "**Verifiable > learned RM** when correctness is checkable (math/code/logic): exact, ungameable, no labels. **Learned RM** wins for subjective goals (tone/safety). **DPO** = no RM, no RL loop.",
    ],
    mcqs: [
      {
        question: "What is the single core change GRPO makes relative to PPO, and how does it compensate?",
        options: [
          "It removes the critic and instead uses the mean reward over a sampled group of outputs for the same prompt as the baseline, normalized by std",
          "It removes the frozen reference model entirely, so the KL penalty that normally prevents reward-hacking drift is no longer applied during training",
          "It removes the learned reward model and replaces it with a unit-test-style verifier that checks whether the output is actually correct or not",
          "It replaces the clipped PPO objective with plain supervised cross-entropy loss computed on only the single best output sampled per prompt today",
        ],
        correct: 0,
        explanation: "The first option is correct: GRPO's defining move is dropping PPO's critic (value network). PPO used the critic to compute the advantage baseline; GRPO instead samples a group of G outputs for the same prompt, scores them, and uses the group's mean reward as the baseline, normalizing by the group's standard deviation — so an output's advantage is its reward relative to its siblings. The second option is wrong because GRPO keeps the reference model and the KL penalty; it's the critic that goes. The third option describes RLVR (a reward-source change), not GRPO (an optimizer change) — a classic conflation. The fourth option is wrong because GRPO retains PPO's clipped policy-gradient objective; it doesn't collapse into supervised learning on the best sample.",
      },
      {
        question: "RLVR is described as removing a component of the classic RLHF stack. Which component, and what replaces it?",
        options: [
          "It removes the policy network from training and instead only updates the reward model on new rollouts collected each iteration of training today",
          "It removes the learned reward model and replaces it with a rule or verifier that checks correctness — answer matches ground truth, tests pass",
          "It removes the critic/value network and replaces the advantage baseline with the mean reward across a sampled group of outputs per prompt",
          "It removes the KL penalty against the reference model, letting the policy drift arbitrarily far in pursuit of higher reward without bound",
        ],
        correct: 1,
        explanation: "The second option is correct: RLVR — Reinforcement Learning from Verifiable Rewards — discards the learned reward model (the neural net trained to imitate human preferences) and instead computes reward by running a verifier or rule: does the math answer equal ground truth? does the code compile and pass tests? does the output match the required schema? The reward is grounded correctness, not a model's approximation of human taste. The first option inverts the roles — the policy is what's trained; the RM is what's removed. The third option describes GRPO (dropping the critic), a different, orthogonal change. The fourth option is wrong because RLVR does not require removing the KL penalty; it changes the reward source, not the regularization.",
      },
      {
        question: "Select the two true reasons verifiable rewards (RLVR) can beat a learned reward model on a checkable task like math.",
        options: [
          "Verifiable rewards provide dense, per-token gradient signal throughout generation, whereas a learned reward model gives no gradient at all",
          "The verifier gives the exact correctness signal for a checkable task and is essentially ungameable — a fluent but wrong answer still fails",
          "A learned reward model is fundamentally incompatible with GRPO's group-relative advantage, so a verifier is the only remaining reward source available",
          "A learned reward model only approximates correctness, can be reward-hacked by the policy, and drifts off-distribution as the policy improves",
        ],
        correct: [1, 3],
        explanation: "The second and fourth options are correct together: the verifier computes exact correctness and can't be fooled by a plausible-but-wrong answer (second option), while a learned RM is only an approximation that can be reward-hacked and goes stale as the policy improves (fourth option) — together these are why RLVR beats a learned RM on checkable tasks. The first option is wrong because RLVR rewards are typically sparse/terminal (right or wrong on the final answer), not dense per-token. The third option is wrong because GRPO (the optimizer) is orthogonal to the reward source — it works with either a learned RM or a verifier.",
      },
      {
        question: "When is a LEARNED reward model still the right choice over RLVR, and how does DPO relate to this landscape?",
        options: [
          "A learned reward model is always inferior to a verifier, and DPO is essentially RLVR applied specifically to code-generation tasks only",
          "A learned reward model is required whenever GRPO is used, because computing group-relative advantages depends on a value network only the RM supplies",
          "A learned reward model still fits subjective goals — helpfulness, tone, safety — where no verifier exists; DPO skips the RM and RL loop, using preference pairs",
          "A learned reward model should be used only for math and code, since those are the sole domains with a single correct answer, and DPO trains the critic GRPO removes",
        ],
        correct: 2,
        explanation: "The third option is correct: RLVR only applies where correctness is checkable, so for subjective or open-ended goals — helpfulness, tone, writing quality, harmlessness — you still need a learned reward model that captures fuzzy human preference, since there's no verifier to run. DPO is a distinct method that attacks RLHF's cost by skipping both the explicit reward model and the RL loop, optimizing the policy directly on preference pairs with a classification-style loss. The first option is wrong: a learned RM is not always inferior (it's essential for subjective goals), and DPO is not RLVR-for-code. The fourth option inverts the domain logic — math/code are exactly where you'd prefer a verifier, not a learned RM — and DPO does not train a critic. The second option is wrong because GRPO's group-relative baseline is precisely what removes the need for a value network, and DPO is not a critic.",
      },
    ],
    takeaway: "GRPO and RLVR are each defined by what they cut from the RLHF+PPO stack, and they're orthogonal: GRPO is the optimizer that drops the critic (baseline = group-mean reward over G sampled outputs, giving group-relative advantage), while RLVR is the reward source that drops the learned reward model (reward = a verifier checking actual correctness — right answer, passing tests). Verifiable rewards beat a learned RM wherever correctness is checkable (math, code, logic) — exact and ungameable — while learned RMs remain necessary for subjective goals; the two are most powerful combined (DeepSeek-R1-style reasoning RL, and Sarvam's post-training).",
  },
};
