// L0/L1/L2 question ladders — MoE + prompt engineering. Spread into PREP_QUESTIONS.
export const Q_MOE_PROMPT = [
  // ============================================================
  // MIXTURE-OF-EXPERTS — L0 (Define)
  // ============================================================
  {
    id: "moe-l0-1",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "What is a Mixture-of-Experts (MoE) layer in a transformer?",
    options: [
      "A layer that runs the entire feed-forward network on every token, then averages the outputs",
      "A layer with many parallel feed-forward 'expert' sub-networks, where a router selects a small subset of experts per token",
      "An ensemble of several fully-trained models whose logits are averaged at inference time",
      "A layer that mixes attention heads from different pretrained checkpoints",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "MoE replaces a dense feed-forward block with N parallel expert FFNs plus a router (gating network). For each token the router picks a small subset (top-k) of experts to run, so only a fraction of the parameters are activated per token.",
    trap: "MoE is not model ensembling. It is a single model where a router sparsely activates sub-networks inside one layer — routing happens per token, not per model.",
  },
  {
    id: "moe-l0-2",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "In an MoE model, what do 'total parameters' and 'active parameters' refer to?",
    options: [
      "Total = params used per token; active = params stored on disk",
      "Total = all expert params in the model; active = the params actually used to process a given token",
      "They are two names for the same number in a sparse model",
      "Total = params during training; active = params after pruning",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Total parameters counts every expert's weights (what must be held in memory). Active parameters is the far smaller number actually run for each token, since only top-k experts fire. This gap is the whole point of MoE: large capacity, small per-token compute.",
    trap: "Active < total in a sparse MoE. Confusing the two makes you mis-estimate both memory (scales with total) and FLOPs (scales with active).",
  },
  {
    id: "moe-l0-3",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: true,
    type: "text",
    question:
      "In one or two sentences, explain what the 'router' (gating network) does in an MoE layer.",
    options: [],
    correct: 0,
    keywords: ["router", "gating", "top-k", "select", "experts", "weights", "softmax", "token", "route"],
    explanation:
      "The router is a small learned network that, for each token, produces a score/weight over the experts (typically via a softmax) and selects the top-k highest-scoring experts to process that token. Their outputs are combined weighted by the gating values.",
    trap: "The router decides routing per token, not per sequence or per batch. A common miss is thinking the same experts serve the whole input.",
  },

  // ============================================================
  // MIXTURE-OF-EXPERTS — L1 (Deep / mechanics)
  // ============================================================
  {
    id: "moe-l1-1",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question:
      "Mixtral 8x7B has 8 experts of ~7B each and routes top-2. What are its approximate total and active parameter counts?",
    options: [
      "~56B total, ~14B active",
      "~47B total, ~13B active",
      "~7B total, ~2B active",
      "~47B total, ~47B active",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "The '8x7B' name is misleading: only the FFN/expert blocks are replicated, while attention, embeddings, and norms are shared, so total is ~47B, not 8x7=56B. Top-2 routing activates ~13B parameters per token (roughly two experts' worth plus the shared components).",
    trap: "8x7B does NOT mean 56B total. Experts share the non-FFN weights, giving ~47B. And active (~13B) is set by top-k routing, not by the full model size.",
  },
  {
    id: "moe-l1-2",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question: "Why do MoE models add an auxiliary load-balancing loss during training?",
    options: [
      "To make every expert produce identical outputs so routing does not matter",
      "To discourage the router from collapsing onto a few experts, spreading tokens more evenly so all experts get trained and hardware stays utilized",
      "To reduce the total parameter count by pruning idle experts",
      "To force top-1 routing regardless of the router's scores",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Without a balancing term the router tends to collapse, sending most tokens to a handful of favored experts. Those experts get all the gradient (rich-get-richer) while others stay untrained, and per-device load becomes lopsided. The auxiliary loss penalizes imbalance to keep expert usage roughly uniform.",
    trap: "Load balancing is about spreading tokens across experts, not about making experts identical — you still want them to specialize, just not to starve.",
  },
  {
    id: "moe-l1-3",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question:
      "What is 'expert capacity' and what happens when it is exceeded (token dropping)?",
    options: [
      "The max tokens an expert can hold per batch; excess tokens are dropped and passed through via the residual connection without expert processing",
      "The max number of experts a router may select; extra experts are ignored",
      "The GPU memory ceiling; exceeding it silently increases active parameters",
      "The number of layers an expert spans; exceeding it duplicates the expert",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "For efficient batched compute, each expert is given a fixed buffer (capacity) of tokens per batch. If routing sends more tokens to an expert than its capacity, the overflow tokens are 'dropped' — they skip expert processing and rely on the residual path. A capacity factor tunes the buffer vs. drop tradeoff.",
    trap: "Dropped tokens are not deleted; they bypass the expert via the residual. But dropping still hurts quality, which is why balancing + a sensible capacity factor matter.",
  },
  {
    id: "moe-l1-4",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: true,
    type: "mcq",
    question:
      "In top-k routing, how are the outputs of the selected experts combined for a token?",
    options: [
      "The experts' outputs are concatenated and passed through a final projection",
      "Only the single highest-scoring expert's output is kept; the rest are discarded",
      "A weighted sum of the selected experts' outputs, weighted by the router's (softmax) gating values",
      "The outputs are averaged with equal weight regardless of router scores",
    ],
    correct: 2,
    keywords: [],
    explanation:
      "After the router picks top-k experts, their outputs are combined as a weighted sum using the normalized gating weights. This keeps the gating differentiable so the router learns which experts to trust for which tokens.",
    trap: "It is a router-weighted sum, not a plain average and not concatenation. The gating weights are what let gradients flow back to train the router.",
  },
  {
    id: "moe-l1-5",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "text",
    question:
      "You deploy an 8-expert top-2 MoE and see many tokens being dropped on a few experts. Name two levers you would adjust and why.",
    options: [],
    correct: 0,
    keywords: [
      "capacity factor",
      "load balancing",
      "auxiliary loss",
      "router",
      "expert parallelism",
      "top-k",
      "balance",
      "drop",
    ],
    explanation:
      "Two common levers: (1) raise the capacity factor so each expert's buffer holds more tokens (fewer drops, at higher memory/compute); (2) strengthen the load-balancing auxiliary loss so the router spreads tokens more evenly instead of collapsing onto favorites. You might also revisit expert-parallel placement so overloaded experts aren't co-located.",
    trap: "Just raising capacity hides imbalance at a cost; you usually also need the balancing loss so the router stops collapsing in the first place.",
  },

  // ============================================================
  // MIXTURE-OF-EXPERTS — L2 (Cross-concept / tradeoffs)
  // ============================================================
  {
    id: "moe-l2-1",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "Compared to a dense model with the SAME number of total parameters, an MoE model primarily changes which resource profile?",
    options: [
      "Lower memory footprint and lower compute per token",
      "Same memory footprint but much lower compute (FLOPs) per token, since only top-k experts activate",
      "Higher compute per token but lower memory, since experts are pruned at inference",
      "Identical compute and memory; only training changes",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "MoE and a same-total-param dense model must both hold all weights in memory, so memory is comparable. The win is compute: MoE only runs top-k experts per token, so FLOPs/token track the (much smaller) active parameter count. You buy quality-per-FLOP by paying in memory.",
    trap: "MoE does not save memory versus a dense model of equal total params — all experts still live in VRAM. The savings are in per-token compute.",
  },
  {
    id: "moe-l2-2",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "A team is memory-constrained (limited VRAM) but has plenty of compute headroom. Is MoE the right lever, and why?",
    options: [
      "Yes — MoE reduces the weights that must be resident in memory",
      "No — MoE's advantage is compute-per-token; its total weights (and thus memory) are large, so it fits memory-constrained setups poorly",
      "Yes — MoE always dominates dense models on every axis",
      "No — MoE increases per-token FLOPs, which is what a memory-constrained team wants to avoid",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "MoE trades memory for compute efficiency: you must store all experts (large total params) even though each token uses few. If VRAM is the binding constraint and compute is cheap, a dense model or quantization/distillation fits better than a fat MoE.",
    trap: "MoE is the wrong tool when memory is scarce — its whole design assumes you can afford to hold many experts in memory to save compute.",
  },
  {
    id: "moe-l2-3",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "MoE vs. quantization as cost-reduction strategies — how do they differ in what they reduce?",
    options: [
      "Both reduce the same thing: total parameter count",
      "MoE reduces active compute per token while keeping total weights large; quantization shrinks the memory/bytes per weight (and often bandwidth) without changing which weights run",
      "Quantization reduces active parameters; MoE reduces bits per weight",
      "Neither affects inference cost; both are training-only techniques",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "They attack different axes. MoE cuts FLOPs per token (sparse activation) but keeps a large memory footprint. Quantization cuts bytes-per-weight (e.g., 16-bit → 4-bit), shrinking memory and bandwidth for the same computation graph. They are complementary — you can quantize an MoE.",
    trap: "These are orthogonal levers, not substitutes. MoE = fewer active weights per token; quantization = fewer bits per weight. Combine them for both memory and compute wins.",
  },
  {
    id: "moe-l2-4",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: true,
    type: "mcq",
    question:
      "In which scenario is a dense model likely to BEAT an MoE of similar quality target?",
    options: [
      "Serving at very high throughput where memory is abundant and per-token compute is the bottleneck",
      "A latency-sensitive, memory-tight single-GPU deployment where routing overhead, all-to-all communication, and holding all experts in VRAM outweigh the compute savings",
      "Training on a massive corpus where scaling capacity is the only goal",
      "Any case — dense models are always cheaper than MoE",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "MoE shines when compute-per-token is the constraint and you can afford large memory and expert-parallel infrastructure. On a memory-tight, single-device, latency-sensitive setup, the cost of storing all experts plus routing and all-to-all communication overhead can make a right-sized dense model the better choice.",
    trap: "MoE is not universally cheaper. Routing overhead, communication, and the memory to hold every expert can erase its compute advantage in small or latency-critical deployments.",
  },
  {
    id: "moe-l2-5",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "Why can MoE deliver higher quality than a dense model at the SAME per-token compute (active params) budget?",
    options: [
      "Because MoE runs every expert on every token, giving more total FLOPs",
      "Because MoE grows total capacity (many experts) while keeping active FLOPs fixed, letting experts specialize — more knowledge stored, similar compute spent per token",
      "Because MoE uses lower-precision weights, which are inherently more accurate",
      "Because the router discards hard tokens, so the reported quality is inflated",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "MoE decouples capacity from compute: you can add experts (more total parameters, more learned specialization) without increasing the FLOPs spent per token, since routing still activates only top-k. At a fixed compute budget you get more effective capacity than a dense model of equal active size.",
    trap: "The gain comes from added capacity at fixed active compute — not from running more experts per token (that would raise FLOPs) and not from precision tricks.",
  },

  // ============================================================
  // PROMPT ENGINEERING — L0 (Define)
  // ============================================================
  {
    id: "prompt-engineering-l0-1",
    topic: "prompt-engineering",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "What is the difference between zero-shot and few-shot prompting?",
    options: [
      "Zero-shot gives no task examples; few-shot includes a handful of worked input/output examples in the prompt",
      "Zero-shot uses a smaller model; few-shot uses a larger model",
      "Zero-shot means no system prompt; few-shot means a long system prompt",
      "Zero-shot fine-tunes the model on zero data; few-shot fine-tunes on a few samples",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Zero-shot asks the model to perform a task with only an instruction and no demonstrations. Few-shot includes a small number of example input→output pairs in the prompt to show the desired format/behavior, leveraging in-context learning — no weight updates in either case.",
    trap: "Neither changes the model's weights. Few-shot 'learning' is in-context (examples in the prompt), not gradient-based training.",
  },
  {
    id: "prompt-engineering-l0-2",
    topic: "prompt-engineering",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "What does chain-of-thought (CoT) prompting do?",
    options: [
      "It chains multiple models together in a pipeline",
      "It asks the model to produce intermediate reasoning steps before the final answer, which improves performance on multi-step problems",
      "It removes reasoning to make outputs shorter and cheaper",
      "It fine-tunes the model on step-by-step data",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Chain-of-thought prompting elicits explicit intermediate reasoning (e.g., 'let's think step by step') before the final answer. Externalizing the steps helps on arithmetic, logic, and multi-hop tasks that a single-shot answer tends to get wrong.",
    trap: "CoT is a prompting technique that elicits reasoning at inference time; it is not chaining separate models and it is not fine-tuning.",
  },
  {
    id: "prompt-engineering-l0-3",
    topic: "prompt-engineering",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: true,
    type: "text",
    question:
      "In one or two sentences, describe the role of a 'system prompt' versus a user prompt.",
    options: [],
    correct: 0,
    keywords: [
      "system prompt",
      "instructions",
      "persona",
      "role",
      "constraints",
      "behavior",
      "context",
      "guardrails",
      "user prompt",
    ],
    explanation:
      "The system prompt sets persistent context — the model's role/persona, tone, constraints, and guardrails that should apply across the whole conversation. The user prompt is the specific request/turn. The system prompt frames how every user turn is interpreted.",
    trap: "The system prompt is standing context for the whole session, not just another user message — it shapes behavior globally rather than answering one turn.",
  },

  // ============================================================
  // PROMPT ENGINEERING — L1 (Deep / mechanics)
  // ============================================================
  {
    id: "prompt-engineering-l1-1",
    topic: "prompt-engineering",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question: "How does self-consistency improve over plain chain-of-thought?",
    options: [
      "It fine-tunes the model on its own correct reasoning traces",
      "It samples multiple diverse CoT reasoning paths (temperature > 0) and takes a majority vote over the final answers",
      "It forces greedy decoding to get one deterministic reasoning path",
      "It shortens the chain of thought to reduce token cost",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Self-consistency samples several independent chain-of-thought completions with some randomness, then marginalizes over the reasoning by taking the most common final answer (majority vote). Different valid paths tend to converge on the correct answer, so voting beats a single greedy chain.",
    trap: "Self-consistency needs sampling (temperature > 0) to get diverse paths — a single greedy chain gives it nothing to vote over.",
  },
  {
    id: "prompt-engineering-l1-2",
    topic: "prompt-engineering",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question: "What characterizes the ReAct prompting pattern?",
    options: [
      "It reacts to user sentiment and adjusts tone",
      "It interleaves reasoning ('thought') with actions (e.g., tool/API/search calls) and observations, letting the model use external tools between reasoning steps",
      "It is a purely reactive template with no reasoning, only tool calls",
      "It re-activates dormant experts in an MoE layer",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "ReAct (Reason + Act) interleaves Thought → Action → Observation loops: the model reasons, takes an action such as a search or tool call, observes the result, then continues reasoning. This grounds reasoning in external, up-to-date information instead of relying only on parametric memory.",
    trap: "ReAct is not tool-calling alone and not reasoning alone — the value is the loop that lets observations from actions feed back into the next reasoning step.",
  },
  {
    id: "prompt-engineering-l1-3",
    topic: "prompt-engineering",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question:
      "You need reliable JSON output that a downstream parser can consume. Which prompt-engineering approach is most robust?",
    options: [
      "Politely ask for JSON in prose and hope the model complies",
      "Provide an explicit schema/format, few-shot examples of valid JSON, and use constrained/structured decoding or a response_format when available",
      "Raise the temperature so the model explores more JSON variants",
      "Ask for JSON inside a chain-of-thought so it reasons about the schema",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Robust structured output combines a clearly specified schema, few-shot examples of the exact format, low temperature, and — best of all — constrained decoding / a native structured-output mode (e.g., JSON mode or grammar constraints) that guarantees syntactic validity rather than relying on the model to remember.",
    trap: "High temperature and free-form CoT hurt structured output. Determinism plus explicit schema/constraints is what makes parsing reliable.",
  },
  {
    id: "prompt-engineering-l1-4",
    topic: "prompt-engineering",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: true,
    type: "mcq",
    question:
      "In few-shot prompting, why can the choice and ORDER of examples materially change results?",
    options: [
      "Because each example permanently updates the model's weights",
      "Because in-context learning is sensitive to example selection, label distribution, and ordering (e.g., recency/position biases), which shift the model's conditional predictions",
      "Because more examples always monotonically improve accuracy regardless of content",
      "Because examples change the tokenizer's vocabulary",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Few-shot behavior is in-context learning: the model conditions on the demonstrations. Which examples you pick, how labels are balanced, and even their order can bias predictions (position/recency effects). Curating representative, well-ordered examples is part of the engineering.",
    trap: "Few-shot examples never touch weights — they condition the prediction. And more is not always better; poorly chosen or ordered examples can degrade results.",
  },
  {
    id: "prompt-engineering-l1-5",
    topic: "prompt-engineering",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "text",
    question:
      "A model keeps ignoring an instruction buried in a long prompt. Name two prompt-design changes you would try and why.",
    options: [],
    correct: 0,
    keywords: [
      "placement",
      "position",
      "delimiters",
      "structure",
      "system prompt",
      "few-shot",
      "explicit",
      "repeat",
      "emphasis",
      "format",
    ],
    explanation:
      "Options include: move the critical instruction to a high-salience position (start or end, exploiting recency/primacy) or into the system prompt; use clear delimiters/sections so it stands out; state it explicitly and concisely; add a few-shot example that demonstrates the behavior; or restate/emphasize the constraint near the output point.",
    trap: "Long prompts suffer position bias — instructions in the middle get lost. Placement, structure, and demonstration usually help more than just adding more words.",
  },

  // ============================================================
  // PROMPT ENGINEERING — L2 (Cross-concept / tradeoffs)
  // ============================================================
  {
    id: "prompt-engineering-l2-1",
    topic: "prompt-engineering",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "You need the model to reliably follow a NEW output format and improve on a niche task. Compare few-shot prompting vs. fine-tuning — when do you pick each?",
    options: [
      "Always fine-tune; prompting never generalizes",
      "Use few-shot when you want fast, no-training iteration and have few examples; fine-tune when you have many labeled examples, need consistent behavior at lower per-call token cost, and prompting alone plateaus",
      "Always few-shot; fine-tuning is obsolete",
      "They are interchangeable with identical cost and latency",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Few-shot is cheap to iterate and needs no training, but spends context tokens every call and can be inconsistent. Fine-tuning amortizes the behavior into weights — better consistency and no per-call example tokens — but needs a labeled dataset, a training pipeline, and re-training to change. Pick by data availability, consistency needs, and cost profile.",
    trap: "Fine-tuning trades upfront data/training cost for cheaper, more consistent inference; few-shot trades per-call token cost for zero-setup flexibility. Neither is universally correct.",
  },
  {
    id: "prompt-engineering-l2-2",
    topic: "prompt-engineering",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "You must add fresh, frequently-changing factual knowledge (e.g., today's inventory) to a model's answers. Which of RAG, fine-tuning, and prompt-stuffing fits best, and why?",
    options: [
      "Fine-tuning — it is the only way to add any new facts",
      "RAG — retrieve the current facts at query time and put them in context, so knowledge stays fresh without retraining and scales beyond the context window",
      "Prompt-stuffing all documents into every prompt — simplest and always cheapest",
      "None — models cannot use information they weren't trained on",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "For volatile, large, or frequently-updated knowledge, RAG is the natural fit: retrieve the relevant current facts at query time and inject them into context. Fine-tuning bakes knowledge into weights (stale between retrains, expensive to update). Prompt-stuffing everything doesn't scale past the context window and wastes tokens.",
    trap: "Fine-tuning is for teaching behavior/style/format, not for injecting ever-changing facts — those go stale. Dynamic knowledge belongs in retrieval.",
  },
  {
    id: "prompt-engineering-l2-3",
    topic: "prompt-engineering",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "When should you prefer zero-shot over few-shot prompting, even though few-shot often helps?",
    options: [
      "Never — few-shot always outperforms zero-shot",
      "When the task is simple/well-covered by instruction-tuned behavior, context budget is tight, or example tokens add latency/cost without clear accuracy gains",
      "Only when the model has fewer than 1B parameters",
      "Only for classification, never for generation",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Modern instruction-tuned models handle many tasks well zero-shot. If examples don't measurably raise accuracy, they just consume context, add latency and cost, and risk biasing the output (via example selection/order). For simple or context-constrained tasks, zero-shot can be the better engineering choice.",
    trap: "Few-shot is not free — it spends context tokens and can inject selection/order bias. If it doesn't move accuracy, zero-shot is the leaner choice.",
  },
  {
    id: "prompt-engineering-l2-4",
    topic: "prompt-engineering",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: true,
    type: "mcq",
    question:
      "For a task needing up-to-date external facts and tool use, how does ReAct compare to plain chain-of-thought?",
    options: [
      "ReAct and CoT are identical; both only reason internally",
      "Plain CoT reasons over parametric knowledge only (can hallucinate stale facts); ReAct interleaves actions/tool calls so it can fetch and ground on external, current information",
      "CoT can call tools but ReAct cannot",
      "ReAct is only for math, CoT only for retrieval",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "Plain CoT improves reasoning but stays confined to the model's parametric knowledge, so it can confidently produce outdated or fabricated facts. ReAct adds an act/observe loop (search, APIs, calculators), letting the model ground each reasoning step in fresh external evidence — better for tasks requiring current facts or verification.",
    trap: "CoT alone cannot fetch new information — it just reasons over what the model already knows. ReAct is the pattern that adds grounding via actions.",
  },
  {
    id: "prompt-engineering-l2-5",
    topic: "prompt-engineering",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "Chain-of-thought vs. few-shot vs. fine-tuning: which primarily improves multi-step REASONING (as opposed to format or knowledge), and what is the catch?",
    options: [
      "Few-shot; the catch is it requires a labeled training set",
      "Chain-of-thought; the catch is it increases output tokens (latency/cost) and, on small models, can be unreliable or even hurt",
      "Fine-tuning; the catch is it never affects reasoning, only tone",
      "All three are purely about output formatting, not reasoning",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "CoT most directly targets multi-step reasoning by externalizing intermediate steps. The tradeoffs: it lengthens outputs (more tokens, higher latency/cost), can leak internal reasoning, and tends to help large models more than small ones (where it may not help or can backfire). Few-shot mainly sets format/behavior; fine-tuning bakes in behavior/knowledge.",
    trap: "CoT's reasoning gains are strongest on capable models and come at a token/latency cost — it is not a free or universally reliable win, especially on small models.",
  },
];
