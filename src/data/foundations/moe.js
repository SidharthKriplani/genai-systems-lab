// Foundations module — Mixture-of-Experts. RUNNER_DATA fragment spread into
// src/data/foundationsRunnerData.js. Keep the export name RUNNER_MOE.
export const RUNNER_MOE = {
  "moe": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Here's a tension that sits at the heart of scaling models, and it's worth feeling it before we resolve it. Bigger models know more — more parameters, more capacity, better answers. But bigger models also *cost* more to run, because in an ordinary model every single parameter has to do arithmetic on every single token that passes through. More knowledge, more compute. They rise together, and that coupling is what makes big models expensive.\n\nSo let's ask the obvious question: what if you could add knowledge *without* adding compute? What if the model held far more parameters, but each token only ever touched a small slice of them? You'd get the wisdom of a huge model at the running cost of a small one. It sounds almost too good — and the interesting part is that it's real, but the bill doesn't vanish, it just moves to a different column.\n\nNo rush here. We'll build the idea from a single, surgical change to one part of the Transformer, watch two numbers that were always equal suddenly split apart, and follow that split all the way to a very practical surprise: why a model that *computes* like a small one can refuse to *fit* like one.",
    explanation: [
      "In a standard Transformer block, every token passes through the same **Feed-Forward Network (FFN)** — a single dense two-layer MLP at ~4× the hidden dimension, and the place where most of the model's parametric knowledge lives. Every token, no matter what it is, activates every FFN parameter.\n\n**Mixture-of-Experts changes exactly one thing:** it replaces that single FFN with N independent expert FFNs plus a small **router** (the gating network). The router looks at each token's representation and sends it to only the **top-k experts** — usually k=1 or k=2. The other experts sit idle for that token. Attention, layer norm, embeddings, and residual paths are untouched; only the FFN sublayer is split into experts.\n\n==That single substitution is the entire idea, and it forces apart two numbers that are identical in a dense model.==",
      "Those two numbers are **TOTAL parameters** and **ACTIVE parameters**. Total is every weight that must exist. Active is the subset that actually runs for a given token. In a dense model they are equal — every parameter runs on every token. In an MoE they diverge, and the whole engineering profile of the model follows from that gap.\n\n**Compute (FLOPs, and therefore latency) scales with ACTIVE parameters**, because only the selected experts do arithmetic. **Memory scales with TOTAL parameters**, because you must hold every expert resident in VRAM — the router might send the very next token to any of them, so you cannot leave any expert on disk.\n\n==Cheap to compute, expensive to hold. That is the trade in one line.==",
      "The Mixtral 8x7B numbers make the gap concrete, and the naming is a **trap**. '8x7B' does not mean 8 × 7B = 56B. Each block has 8 expert FFNs, but attention, embeddings, and layer norms are **shared** across all experts — only the FFN experts multiply, not the whole model. Sum the shared attention/embedding parameters plus 8 copies of only the FFN experts and you land at **~47B TOTAL**, not 56B.\n\nAt inference the router picks top-2 of the 8 experts per token, so per token you run the shared attention plus 2 expert FFNs — about **~13B ACTIVE** parameters. That is why it benchmarks like a 13B on latency: it does 13B worth of arithmetic per token.\n\nAnd it is also why it OOMs where a 13B fits: all ~47B parameters must be resident in VRAM the whole time, because token-to-token the router can select any expert. ==The scenario's surprise is this exact split — compute profile of a 13B, memory profile of a 47B.==",
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
      "The router is a **tiny learned linear layer** that produces a score per expert, softmax-normalized, and it routes **TOKENS, not sequences**. This is the detail people miss: within a single sequence, different tokens hit different experts. The token 'def' in a code prompt and the token 'the' two positions later can be dispatched to entirely different expert pairs.\n\nThere is no notion of 'this request uses expert 3' — routing is **per-token, recomputed at every layer**, so a single forward pass touches many experts overall even though each individual token only touches k of them. ==That is precisely why every expert must stay resident: you cannot predict, and cannot pre-load, which experts an incoming stream of tokens will demand.==",
      "Left alone, the router **misbehaves**. Nothing in the top-k objective encourages using all experts, so training tends to **collapse onto a few favored experts** — a rich-get-richer loop where popular experts get more tokens, train faster, look better to the router, and get still more tokens, while the rest starve and stay under-trained. You end up paying to store N experts but effectively running a handful, wasting the capacity that was the entire point of going MoE.\n\nThe fix is an **auxiliary load-balancing loss** added during training that penalizes uneven token distribution and pushes the router to spread tokens roughly evenly across experts. Related machinery: each expert has a fixed **capacity** (a cap on tokens per batch); when balancing is imperfect and an expert overflows, excess tokens are **dropped** — they skip the FFN via the residual path — which is why a badly balanced MoE both under-uses experts and silently degrades quality.\n\n==If your MoE underperforms a dense model of the same active size, a collapsed router with no balancing loss is the first suspect.==",
      "So why build MoE at all? Because it **bends the scaling curve**. More total parameters means more knowledge capacity — but with top-k routing you add that capacity at **nearly constant compute per token**, since active params stay fixed as you add experts. ==You buy the quality of a much larger model at the FLOPs (and latency) of a small one.==\n\nThe bills come due in two other columns: **memory**, because all experts must be resident, and **training stability**, because routing is discrete and prone to the collapse above. Serving inherits both: production MoE typically uses **expert-parallelism** (experts sharded across devices, tokens dispatched over the network to wherever their expert lives), all experts must be loaded before you serve a single token, and batching interacts awkwardly with routing — tokens in a batch scatter unevenly across experts, so effective per-expert batch sizes are lumpy and utilization is harder to keep high than in a dense model.\n\nNamed families in this space: Mixtral (8x7B, 8x22B), DeepSeek-MoE, xAI's Grok, and GPT-4 is widely rumored to be an MoE. The recurring interview trap across all of them is the same: **pricing or provisioning an MoE by its active parameter count and then being surprised by the total-parameter memory bill.**",
    ],
    scenario: "Now let's put all of that to work on a real one. A team wants to upgrade from a 13B dense model to Mixtral 8x7B for better quality at 'roughly the same cost.' A benchmark confirms latency is barely higher than the 13B — but on the first deploy the model OOMs on the exact 2×A100-40GB box that ran the 13B comfortably, and it OOMs at a batch size the 13B never struggled with.\n\nTake a moment before reading on — how can a model *compute* like a 13B on the benchmark yet refuse to *fit* like one on the same box? Here's the reasoning, step by step. We just watched MoE force apart the two numbers a dense model keeps equal. The router sends each token through only the top-2 of 8 experts plus shared attention, so per token it does about **~13B worth of arithmetic** — that's the ACTIVE count, and it's why latency tracks a 13B. But routing is per-token and recomputed at every layer, so the very next token could demand any of the 8 experts; you can't leave any on disk. That forces **all ~47B TOTAL parameters resident in VRAM** the whole time. Notice how cleanly that explains both symptoms: the benchmark measured compute (active → 13B), the box ran out of memory (total → 47B, ~3.6× the footprint). The lesson follows directly — provision an MoE by its **total** parameter count, never its active one, before you approve the hardware.",
    keyPoints: [
      "**MoE replaces the dense FFN with N expert FFNs plus a top-k router.** Only k experts (usually 1–2) run per token; attention, embeddings, and residual paths are untouched. That one swap forces apart two numbers dense models keep equal.",
      "**Compute scales with ACTIVE params; memory scales with TOTAL params.** Only selected experts do arithmetic (latency), but every expert must stay resident in VRAM (footprint). Cheap to compute, expensive to hold.",
      "**'8x7B' is a naming trap.** Attention/embeddings are shared, only FFN experts multiply → ~47B total, not 56B. Top-2 routing → ~13B active. Computes like a 13B, OOMs like a 47B.",
      "**Routing is per-token, recomputed every layer** — not per-request. Any expert can be needed next, so none can be left on disk; all must be pre-loaded.",
      "**Without an auxiliary load-balancing loss the router collapses** onto a few experts (rich-get-richer), leaving most under-trained. Overflowed experts drop tokens via the residual path, silently degrading quality.",
      "**MoE adds knowledge capacity at near-constant compute** but costs more memory + training instability. Provision by TOTAL params, never active. Families: Mixtral, DeepSeek-MoE, Grok, (rumored) GPT-4.",
    ],
    recap: [
      "**MoE = dense FFN → N experts + top-k router.** Only k experts fire per token; the rest sit idle but resident.",
      "**Two numbers split:** ACTIVE params drive FLOPs/latency, TOTAL params drive VRAM. Dense: equal. MoE: they diverge.",
      "**Mixtral 8x7B:** ~47B total (shared attention + 8 FFN experts), ~13B active (top-2). Latency of a 13B, memory of a 47B.",
      "**Per-token routing** (recomputed every layer) is why all experts must stay resident — you can't predict which the next token needs.",
      "**Router collapse without a load-balancing loss:** a few experts hog tokens, the rest starve; overflow drops tokens and degrades quality. First suspect when an MoE underperforms its active-size dense peer.",
      "**Trade:** more capacity at constant compute, paid for in memory + training instability. Provision by total params, not active.",
    ],
    mcqs: [
      {
        question: "Mixtral 8x7B runs at roughly the latency of a 13B dense model despite having ~47B total parameters. Why is only ~13B 'active' per token rather than the full 47B?",
        options: [
          "The router permanently disables 6 of the 8 experts at load time, so only 2 experts ever get loaded into VRAM in the first place",
          "Each token routes through only the top-2 of 8 expert FFNs plus shared attention, so only that subset actually computes.",
          "The 47B figure is a marketing number; the model genuinely contains only around 13B distinct parameters once weight sharing is accounted for",
          "MoE models quantize the 6 unused experts down to 1-bit precision at every single layer, making their per-token compute contribution effectively negligible",
        ],
        correct: 1,
        explanation: "Option 2 is correct: the router sends each token to only the top-2 of 8 expert FFNs, and shared attention/embeddings run for every token, so per token the model does roughly 13B worth of arithmetic — active compute scales with the selected experts, not the full set. That is why latency tracks a 13B dense model. Option 1 is wrong because experts are not permanently disabled or left off VRAM; routing is per-token and any expert can be selected for the next token, so all 8 must stay resident. Option 3 is wrong because the model really does hold ~47B distinct parameters; 13B is the active subset, not the true parameter count. Option 4 is wrong because unused experts are not run at reduced precision to shrink compute — they simply do not run for that token at all; the saving comes from not invoking them, not from quantization.",
      },
      {
        question: "Your Mixtral 8x7B deployment OOMs at a batch size that a 13B dense model on the same 2×A100-40GB box handled easily. What is the root cause?",
        options: [
          "MoE activations are quadratically larger than a dense model per-token activations across all layers, so activation memory alone blows up the VRAM budget",
          "The router is itself a large learned network with billions of parameters, and it alone consumes most of the available VRAM budget",
          "Mixtral cannot store its weights in bf16 the way the 13B model does, so its weights take roughly twice the bytes per stored parameter",
          "All ~47B parameters across every expert stay resident in VRAM though only ~13B activate per token — memory tracks TOTAL, not ACTIVE",
        ],
        correct: 3,
        explanation: "Option 4 is correct: memory scales with total parameters while compute scales with active parameters. Because routing is per-token and any expert can be needed next, every expert must stay resident, so the weight footprint is ~47B even though only ~13B run per token — that is what exhausts VRAM where a genuine 13B fit. Option 1 is wrong because MoE does not make activations quadratically larger; the OOM is driven by the resident weight footprint, not activation growth. Option 2 is wrong because the router is a tiny linear gating layer with negligible parameters, not a memory hog. Option 3 is wrong because Mixtral uses the same low-precision formats as dense models; the extra memory is the number of resident experts, not a change in bytes-per-weight.",
      },
      {
        question: "An MoE model you trained underperforms a dense model of the same active parameter count. Investigation shows the router sends nearly all tokens to just 2 of the 8 experts. What is most likely missing or misconfigured?",
        options: [
          "The auxiliary load-balancing loss — without it the router collapses onto a few experts, leaving the rest under-trained.",
          "The attention layers were accidentally split into per-expert copies along with the FFNs, concentrating all capacity in just two of them",
          "Top-k was mistakenly set to 8 instead of 2, forcing every token through every expert and causing the model to overfit two of them",
          "The router learning rate was set far too low for its weights to ever move away from their random initialization values at all",
        ],
        correct: 0,
        explanation: "Option 1 is correct: the top-k objective alone does not encourage using all experts, so training tends to collapse onto a few — popular experts get more tokens, train faster, and attract still more, while the rest starve. The auxiliary load-balancing loss penalizes uneven token distribution and spreads tokens across experts; missing or too-weak balancing is the classic cause of the symptom described. Option 2 is wrong because MoE splits only the FFN sublayer into experts; attention is shared, and splitting it is not the described failure. Option 3 is wrong because k=8 would route every token to every expert (no collapse to 2) and defeats the purpose entirely — the symptom is the opposite of over-routing. Option 4 is wrong because a low learning rate would slow all training uniformly, not specifically produce a 2-expert collapse, which is a routing-balance problem the balancing loss targets.",
      },
      {
        question: "Which two statements accurately describe what MoE buys you relative to a dense model of equal active size?",
        options: [
          "MoE adds knowledge capacity — more total parameters — while active parameters, and per-token compute, stay roughly fixed as experts grow.",
          "MoE costs more memory, because every single expert must be held resident in VRAM even though only a couple actually run per token",
          "MoE reduces both compute per token and total memory footprint, because experts that are not selected for a given token cost nothing at all",
          "MoE has essentially identical compute, memory, and training behavior to a dense model of the same active size, but is far easier to shard across many GPUs",
        ],
        correct: [0, 1],
        explanation: "Options 1 and 2 are both correct: MoE adds total parameters — and thus knowledge capacity — while active parameters (and therefore compute/latency per token) stay roughly fixed as experts are added, which is how it bends the scaling curve (option 1). That capacity is paid for in memory, because every expert must be resident in VRAM regardless of how many actually run per token (option 2). Option 3 is wrong — MoE does not reduce memory; total resident weights grow with the number of experts, and unused experts still occupy VRAM even though they don't compute. Option 4 is wrong — MoE's compute, memory, and training profile differ substantially from a dense model of equal active size, and expert-parallel sharding is more complex, not simpler, than dense sharding.",
      },
    ],
    takeaway: "MoE replaces the dense FFN with N experts plus a top-k router, splitting apart ACTIVE and TOTAL parameters: compute (latency) tracks active params, memory tracks total params — so Mixtral 8x7B computes like a 13B (~13B active) but must be held in VRAM like a 47B (all experts resident). Provision by total parameters, not active, and never ship without a load-balancing loss.",
  },
};
