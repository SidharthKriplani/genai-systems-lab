// Foundations module — Mixture-of-Experts. RUNNER_DATA fragment spread into
// src/data/foundationsRunnerData.js. Keep the export name RUNNER_MOE.
export const RUNNER_MOE = {
  "moe": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your team wants to upgrade from a 13B dense model to Mixtral 8x7B for better quality at 'roughly the same cost.' A benchmark confirms latency is barely higher than the 13B — but on your first deploy the model OOMs on the exact 2×A100-40GB box that ran the 13B comfortably, and it OOMs at a batch size the 13B never struggled with. You need to explain to the team why a model that computes like a 13B refuses to fit like one before you approve the hardware.",
    explanation: [
      "In a standard Transformer block, every token passes through the same Feed-Forward Network (FFN) — a single dense two-layer MLP at ~4× the hidden dimension, and the place where most of the model's parametric knowledge lives. Every token, no matter what it is, activates every FFN parameter. Mixture-of-Experts changes exactly one thing: it replaces that single FFN with N independent expert FFNs plus a small router (the gating network). The router looks at each token's representation and sends it to only the top-k experts — usually k=1 or k=2. The other experts sit idle for that token. Attention, layer norm, embeddings, and residual paths are untouched; only the FFN sublayer is split into experts. That single substitution is the entire idea, and it forces apart two numbers that are identical in a dense model.",
      "Those two numbers are TOTAL parameters and ACTIVE parameters. Total is every weight that must exist. Active is the subset that actually runs for a given token. In a dense model they are equal — every parameter runs on every token. In an MoE they diverge, and the whole engineering profile of the model follows from that gap. Compute (FLOPs, and therefore latency) scales with ACTIVE parameters, because only the selected experts do arithmetic. Memory scales with TOTAL parameters, because you must hold every expert resident in VRAM — the router might send the very next token to any of them, so you cannot leave any expert on disk. Cheap to compute, expensive to hold. That is the trade in one line.",
      "The Mixtral 8x7B numbers make the gap concrete, and the naming is a trap. '8x7B' does not mean 8 × 7B = 56B. Each block has 8 expert FFNs, but attention, embeddings, and layer norms are shared across all experts — only the FFN experts multiply, not the whole model. Sum the shared attention/embedding parameters plus 8 copies of only the FFN experts and you land at ~47B TOTAL, not 56B. At inference the router picks top-2 of the 8 experts per token, so per token you run the shared attention plus 2 expert FFNs — about ~13B ACTIVE parameters. That is why it benchmarks like a 13B on latency: it does 13B worth of arithmetic per token. And it is also why it OOMs where a 13B fits: all ~47B parameters must be resident in VRAM the whole time, because token-to-token the router can select any expert. The scenario's surprise is this exact split — compute profile of a 13B, memory profile of a 47B.",
      { type: "illustration", label: "Mixtral 8x7B — active vs total parameters", content: `Mixtral 8x7B — the 8x7B naming trap:

  8 × 7B = 56B   ← WRONG (assumes the whole model is copied 8×)
  ~47B TOTAL     ← RIGHT (only FFN experts ×8; attention/embeddings shared once)

Per-token routing (top-2 of 8 experts):
  shared attention + embeddings ........ runs for EVERY token
  + 2 selected expert FFNs (of 8) ...... runs for THIS token
  + 6 idle expert FFNs ................. resident in VRAM, do no work
  ─────────────────────────────────────────────────────────────
  ACTIVE per token:  ~13B   → drives FLOPs / latency  (benchmarks like a 13B)
  TOTAL resident:    ~47B   → drives VRAM footprint    (OOMs like a 47B)

  Dense 13B:  ACTIVE = TOTAL = 13B   (fits the 2×A100-40GB box)
  Mixtral:    ACTIVE 13B, TOTAL 47B  → same latency, ~3.6× the memory` },
      "The router is a tiny learned linear layer that produces a score per expert, softmax-normalized, and it routes TOKENS, not sequences. This is the detail people miss: within a single sequence, different tokens hit different experts. The token 'def' in a code prompt and the token 'the' two positions later can be dispatched to entirely different expert pairs. There is no notion of 'this request uses expert 3' — routing is per-token, recomputed at every layer, so a single forward pass touches many experts overall even though each individual token only touches k of them. That is precisely why every expert must stay resident: you cannot predict, and cannot pre-load, which experts an incoming stream of tokens will demand.",
      "Left alone, the router misbehaves. Nothing in the top-k objective encourages using all experts, so training tends to collapse onto a few favored experts — a rich-get-richer loop where popular experts get more tokens, train faster, look better to the router, and get still more tokens, while the rest starve and stay under-trained. You end up paying to store N experts but effectively running a handful, wasting the capacity that was the entire point of going MoE. The fix is an auxiliary load-balancing loss added during training that penalizes uneven token distribution and pushes the router to spread tokens roughly evenly across experts. Related machinery: each expert has a fixed capacity (a cap on tokens per batch); when balancing is imperfect and an expert overflows its capacity, excess tokens are dropped — they skip the FFN via the residual path — which is why a badly balanced MoE both under-uses experts and silently degrades quality. If your MoE underperforms a dense model of the same active size, a collapsed router with no balancing loss is the first suspect.",
      "So why build MoE at all? Because it bends the scaling curve. More total parameters means more knowledge capacity — but with top-k routing you add that capacity at nearly constant compute per token, since active params stay fixed as you add experts. You buy the quality of a much larger model at the FLOPs (and latency) of a small one. The bills come due in two other columns: memory, because all experts must be resident, and training stability, because routing is discrete and prone to the collapse above. Serving inherits both: production MoE typically uses expert-parallelism (experts sharded across devices, tokens dispatched over the network to wherever their expert lives), all experts must be loaded before you serve a single token, and batching interacts awkwardly with routing — tokens in a batch scatter unevenly across experts, so effective per-expert batch sizes are lumpy and utilization is harder to keep high than in a dense model. Named families in this space: Mixtral (8x7B, 8x22B), DeepSeek-MoE, xAI's Grok, and GPT-4 is widely rumored to be an MoE. The recurring interview trap across all of them is the same: pricing or provisioning an MoE by its active parameter count and then being surprised by the total-parameter memory bill.",
    ],
    mcqs: [
      {
        question: "Mixtral 8x7B runs at roughly the latency of a 13B dense model despite having ~47B total parameters. Why is only ~13B 'active' per token rather than the full 47B?",
        options: [
          "The router permanently disables all but 2 experts at load time, so 6 of the 8 experts are never loaded into VRAM",
          "The 47B figure is a marketing number; the model genuinely only contains ~13B parameters after weight sharing",
          "Each token is routed through only the top-2 of 8 expert FFNs (plus shared attention), so only that subset does arithmetic — active FLOPs scale with the selected experts, not all of them",
          "MoE models quantize the unused experts to 1-bit, which makes their contribution to compute negligible",
        ],
        correct: 2,
        explanation: "Option C is correct: the router sends each token to only the top-2 of 8 expert FFNs, and shared attention/embeddings run for every token, so per token the model does roughly 13B worth of arithmetic — active compute scales with the selected experts, not the full set. That is why latency tracks a 13B dense model. Option A is wrong because experts are not permanently disabled or left off VRAM; routing is per-token and any expert can be selected for the next token, so all 8 must stay resident. Option B is wrong because the model really does hold ~47B distinct parameters; 13B is the active subset, not the true parameter count. Option D is wrong because unused experts are not run at reduced precision to shrink compute — they simply do not run for that token at all; the saving comes from not invoking them, not from quantization.",
      },
      {
        question: "Your Mixtral 8x7B deployment OOMs at a batch size that a 13B dense model on the same 2×A100-40GB box handled easily. What is the root cause?",
        options: [
          "MoE activations are quadratically larger than dense activations, so per-token activation memory blows up",
          "All ~47B parameters (every expert) must be held resident in VRAM even though only ~13B are active per token, so the weight footprint is ~47B, not ~13B — memory scales with TOTAL, compute with ACTIVE",
          "The router itself is enormous and consumes most of the VRAM budget",
          "Mixtral cannot use bf16, so its weights take twice the bytes of the 13B model's",
        ],
        correct: 1,
        explanation: "Option B is correct: memory scales with total parameters while compute scales with active parameters. Because routing is per-token and any expert can be needed next, every expert must stay resident, so the weight footprint is ~47B even though only ~13B run per token — that is what exhausts VRAM where a genuine 13B fit. Option A is wrong because MoE does not make activations quadratically larger; the OOM is driven by the resident weight footprint, not activation growth. Option C is wrong because the router is a tiny linear gating layer with negligible parameters, not a memory hog. Option D is wrong because Mixtral uses the same low-precision formats as dense models; the extra memory is the number of resident experts, not a change in bytes-per-weight.",
      },
      {
        question: "An MoE model you trained underperforms a dense model of the same active parameter count. Investigation shows the router sends nearly all tokens to just 2 of the 8 experts. What is most likely missing or misconfigured?",
        options: [
          "The auxiliary load-balancing loss — without it the router collapses onto a few favored experts (rich-get-richer), leaving most experts under-trained and wasting capacity",
          "The attention layers were accidentally split into experts along with the FFNs",
          "Top-k was set to 8, forcing every token through every expert and overfitting",
          "The learning rate was too low for the router to ever update",
        ],
        correct: 0,
        explanation: "Option A is correct: the top-k objective alone does not encourage using all experts, so training tends to collapse onto a few — popular experts get more tokens, train faster, and attract still more, while the rest starve. The auxiliary load-balancing loss penalizes uneven token distribution and spreads tokens across experts; missing or too-weak balancing is the classic cause of the symptom described. Option B is wrong because MoE splits only the FFN sublayer into experts; attention is shared, and splitting it is not the described failure. Option C is wrong because k=8 would route every token to every expert (no collapse to 2) and defeats the purpose entirely — the symptom is the opposite of over-routing. Option D is wrong because a low learning rate would slow all training uniformly, not specifically produce a 2-expert collapse, which is a routing-balance problem the balancing loss targets.",
      },
      {
        question: "Which statement most accurately characterizes what MoE buys you relative to a dense model of equal active size?",
        options: [
          "MoE reduces BOTH the compute per token and the memory footprint, because unused experts cost nothing",
          "MoE reduces memory (fewer resident weights) at the cost of higher compute per token",
          "MoE adds knowledge capacity (more total parameters) at nearly constant compute per token, but costs MORE memory (all experts resident) and adds training instability from discrete routing",
          "MoE has identical compute, memory, and training behavior to a dense model but is easier to shard across GPUs",
        ],
        correct: 2,
        explanation: "Option C is correct: MoE adds total parameters — and thus knowledge capacity — while keeping active parameters (and therefore compute/latency per token) roughly fixed, which is how it bends the scaling curve. The costs are more memory, because every expert must be resident in VRAM, and training instability, because top-k routing is discrete and prone to expert collapse without a balancing loss. Option A is wrong because MoE does not reduce memory — total resident weights grow with the number of experts. Option B inverts the trade: MoE raises memory and holds compute roughly constant, not the reverse. Option D is wrong because MoE's compute, memory, and training profile differ substantially from a dense model of equal active size, and expert-parallel sharding is more complex, not simpler.",
      },
    ],
    takeaway: "MoE replaces the dense FFN with N experts plus a top-k router, splitting apart ACTIVE and TOTAL parameters: compute (latency) tracks active params, memory tracks total params — so Mixtral 8x7B computes like a 13B (~13B active) but must be held in VRAM like a 47B (all experts resident). Provision by total parameters, not active, and never ship without a load-balancing loss.",
  },
};
