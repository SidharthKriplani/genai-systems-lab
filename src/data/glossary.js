// src/data/glossary.js — hover/tap glossary seed data (2026-07-08).
//
// Case-insensitive term/phrase dictionary consumed by FoundationsRunner's
// tokenizeInline (see the "GLOSSARY_ENTRIES" block there). Keys are matched
// whole-word/whole-phrase (word-boundary bounded) against the plain-text
// portions of a rendered module's prose — text already consumed by another
// inline rule (bold/italic/code/highlight) is skipped, since whichever rule
// matches earliest wins that span. Only the FIRST occurrence of a given key
// is wrapped per rendered module page.
//
// Shape: GLOSSARY["term (lowercase key)"] = {
//   term,              // display label shown in the popover header
//   def,                // one crisp sentence, lightly trimmed from the
//                       // source module's own explanation prose
//   sourceModuleId,     // the Foundations module id this term is fully taught in
//   sourceModuleTitle,  // that module's display title (for the popover pointer)
// }
//
// Seed batch: ~35 terms drawn from 5 already-3B1B-rewritten modules —
// tokenizer, attention, sampling, kv-cache, rlhf. Definitions are trimmed
// from each module's own explanation[] / groundUp text, not invented fresh.
//
// Batch 2 (2026-07-08): +20 terms harvested from the 3 Agents-gym modules that
// just went through a writer pass + independent adversarial audit and were
// confirmed finalized: agent-react, agent-tool-design, agent-eval-trajectory.
// Same convention — definitions are lightly-trimmed sentences pulled straight
// from each module's own explanation[]/keyPoints, not invented fresh.

export const GLOSSARY = {
  "tokenizer": {
    term: "Tokenizer",
    def: "The component that turns text into a sequence of integer token IDs a model can consume — the granularity it chops at (character, word, or subword) decides vocabulary size and how efficiently text is encoded.",
    sourceModuleId: "tokenizer",
    sourceModuleTitle: "Tokenization",
  },
  "bpe": {
    term: "BPE (Byte Pair Encoding)",
    def: "A subword tokenizer that starts from individual characters and repeatedly merges the most frequent adjacent pair until it hits a target vocabulary size — common words collapse to one token, rare words split into in-vocabulary subwords.",
    sourceModuleId: "tokenizer",
    sourceModuleTitle: "Tokenization",
  },
  "byte-level bpe": {
    term: "Byte-Level BPE",
    def: "BPE run over raw UTF-8 bytes instead of characters, with all 256 byte values already in the base vocabulary — guarantees zero out-of-vocabulary tokens, which is why it's the default for general-purpose LLMs like GPT-2/3/4.",
    sourceModuleId: "tokenizer",
    sourceModuleTitle: "Tokenization",
  },
  "wordpiece": {
    term: "WordPiece",
    def: "BERT's subword tokenizer — like BPE it merges bottom-up, but it asks whether a merge actually improves the vocabulary's fit to the training text rather than just picking the most frequent pair, and marks continuation pieces with `##`.",
    sourceModuleId: "tokenizer",
    sourceModuleTitle: "Tokenization",
  },
  "sentencepiece": {
    term: "SentencePiece / Unigram",
    def: "A top-down subword tokenizer (T5, Llama) that starts from a huge candidate set of substrings and prunes the least useful ones down to a target size, treating spaces as ordinary characters — language-agnostic and fully reversible.",
    sourceModuleId: "tokenizer",
    sourceModuleTitle: "Tokenization",
  },
  "out-of-vocabulary": {
    term: "Out-of-Vocabulary (OOV)",
    def: "A word or form a tokenizer's vocabulary has no entry for — word-level tokenization suffers this badly, since any inflected form the training vocabulary didn't happen to include gets no representation at all.",
    sourceModuleId: "tokenizer",
    sourceModuleTitle: "Tokenization",
  },
  "subword": {
    term: "Subword",
    def: "A unit smaller than a whole word but larger than a single character — the middle ground BPE and its relatives use to keep vocabularies bounded while still capturing morphology (e.g. 'collateral' + 'ized').",
    sourceModuleId: "tokenizer",
    sourceModuleTitle: "Tokenization",
  },

  "attention": {
    term: "Attention",
    def: "The mechanism that lets a model figure out which earlier tokens actually matter to the one it's currently building a representation for, and fold that context in — instead of treating every token as meaningless on its own.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "query vector": {
    term: "Query Vector (Q)",
    def: "A learned vector representing what a token is searching for in earlier context — produced by multiplying the token's embedding by a learned weight matrix W_Q.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "key vector": {
    term: "Key Vector (K)",
    def: "A learned vector representing what a token offers to searching tokens — its dot product with a query vector produces the raw relevance score between the two.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "value vector": {
    term: "Value Vector (V)",
    def: "The vector holding what a token actually contributes once attention has decided how much to attend to it — Q and K decide how much attention a token gets, V decides what it hands over.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "dot product": {
    term: "Dot Product",
    def: "Multiply two vectors element by element and sum the results — the operation attention uses to turn a query and a key into a raw relevance score before any normalization.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "softmax": {
    term: "Softmax",
    def: "The function that takes any list of real numbers and squashes them into percentages between 0 and 1 that sum to exactly 1 — it turns raw relevance scores into attention weights, and logits into a next-token probability distribution.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "attention weight": {
    term: "Attention Weight",
    def: "The output of softmax applied to relevance scores — the percentage of a value vector's contribution each token receives when a position builds its context-aware representation.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "scaled dot-product attention": {
    term: "Scaled Dot-Product Attention",
    def: "Dividing raw attention scores by √d_k before softmax, which keeps a growing dot-product sum from swinging wildly as key-vector dimension grows — without it, softmax saturates and training stalls on near-zero gradients.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "multi-head attention": {
    term: "Multi-Head Attention",
    def: "Running many independent Q/K/V attention computations in parallel, each with its own learned projections, so one head can specialize in syntax while another tracks coreference or position.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },
  "attention sink": {
    term: "Attention Sink",
    def: "A phenomenon where softmax's forced normalization (weights must sum to 1) plus the first token's constant visibility during training make it a default dumping ground for leftover attention weight — a separate effect from attention's O(n²) cost.",
    sourceModuleId: "attention",
    sourceModuleTitle: "Self-Attention",
  },

  "sampling": {
    term: "Sampling",
    def: "The step of actually drawing one token from the probability distribution softmax produced — the model builds the distribution, but reaching in and picking which token comes out is a separate, configurable choice.",
    sourceModuleId: "sampling",
    sourceModuleTitle: "Decoding & Sampling Strategies",
  },
  "temperature": {
    term: "Temperature",
    def: "A value that divides the logits before softmax — below 1 sharpens the distribution toward the top token, above 1 flattens it — reshaping how you sample from the distribution, not what the model computed.",
    sourceModuleId: "sampling",
    sourceModuleTitle: "Decoding & Sampling Strategies",
  },
  "greedy decoding": {
    term: "Greedy Decoding",
    def: "Always taking the single highest-probability token at every step (temperature=0) — deterministic and reproducible, but a per-token maximum isn't the same as the globally best response.",
    sourceModuleId: "sampling",
    sourceModuleTitle: "Decoding & Sampling Strategies",
  },
  "top-p": {
    term: "Top-p (Nucleus Sampling)",
    def: "Restricting candidates to the smallest set of tokens whose cumulative probability exceeds p — the candidate set shrinks when the model is confident and grows when it's uncertain, unlike top-k's fixed count.",
    sourceModuleId: "sampling",
    sourceModuleTitle: "Decoding & Sampling Strategies",
  },
  "top-k": {
    term: "Top-k",
    def: "Restricting sampling to exactly the k highest-probability tokens, regardless of how confident or uncertain the underlying distribution actually is — unlike top-p, it never adapts to the distribution's shape.",
    sourceModuleId: "sampling",
    sourceModuleTitle: "Decoding & Sampling Strategies",
  },
  "min-p": {
    term: "min-p",
    def: "A tail-truncation rule that keeps any token at least some fraction (e.g. 10%) the probability of the top token — a floor relative to the max, rather than top-p's running cumulative-sum cutoff.",
    sourceModuleId: "sampling",
    sourceModuleTitle: "Decoding & Sampling Strategies",
  },
  "repetition penalty": {
    term: "Repetition Penalty",
    def: "A decoding control that down-weights the logits of tokens already generated, so a model stuck repeating itself finds the repeated token progressively less attractive each time — exactly what breaks the loop.",
    sourceModuleId: "sampling",
    sourceModuleTitle: "Decoding & Sampling Strategies",
  },

  "kv cache": {
    term: "KV Cache",
    def: "A stored record of every prior token's key and value vectors, so a model doesn't have to recompute attention over the whole prefix at every new step — turns O(N²) recomputation into O(N) per token, at the cost of memory that grows linearly with conversation length.",
    sourceModuleId: "kv-cache",
    sourceModuleTitle: "KV Cache: Inference Memory Optimization",
  },
  "autoregressive": {
    term: "Autoregressive Decoding",
    def: "Generating text one token at a time, where each new token is produced by conditioning on every token generated so far.",
    sourceModuleId: "kv-cache",
    sourceModuleTitle: "KV Cache: Inference Memory Optimization",
  },
  "gqa": {
    term: "GQA (Grouped-Query Attention)",
    def: "An architecture where several query heads share one key/value head (Llama 2/3) — cuts KV cache size 4–8× versus one KV head per query head, at minimal quality loss.",
    sourceModuleId: "kv-cache",
    sourceModuleTitle: "KV Cache: Inference Memory Optimization",
  },
  "mqa": {
    term: "MQA (Multi-Query Attention)",
    def: "An architecture where a single key/value head is shared across all query heads (Falcon, early Gemma) — up to 64× smaller KV cache than one head per query, at a slight quality cost.",
    sourceModuleId: "kv-cache",
    sourceModuleTitle: "KV Cache: Inference Memory Optimization",
  },
  "pagedattention": {
    term: "PagedAttention",
    def: "A KV-cache serving technique (vLLM) that manages cache memory in fixed-size pages, the way an OS manages virtual memory, instead of pre-allocating a worst-case-sized block per request — reclaims the 60–80% of memory naive allocators waste on fragmentation.",
    sourceModuleId: "kv-cache",
    sourceModuleTitle: "KV Cache: Inference Memory Optimization",
  },
  "kv quantization": {
    term: "KV Quantization",
    def: "Storing cached key/value tensors at lower numeric precision (INT8 or INT4 instead of fp16) to directly shrink bytes-per-token in the KV cache, at a small quality cost.",
    sourceModuleId: "kv-cache",
    sourceModuleTitle: "KV Cache: Inference Memory Optimization",
  },
  "sliding-window attention": {
    term: "Sliding-Window Attention",
    def: "Capping how many prior tokens the KV cache retains at a fixed window size, so cache memory stops growing once a conversation passes that length — the tradeoff is the model can no longer attend past the window.",
    sourceModuleId: "kv-cache",
    sourceModuleTitle: "KV Cache: Inference Memory Optimization",
  },

  "rlhf": {
    term: "RLHF (Reinforcement Learning from Human Feedback)",
    def: "A three-stage training process — supervised fine-tuning, then a reward model, then reinforcement learning against that reward model — that edits a model's weights so helpful, safe behavior becomes the default, rather than something a prompt has to request every time.",
    sourceModuleId: "rlhf",
    sourceModuleTitle: "RLHF and DPO: Aligning Model Behavior",
  },
  "supervised fine-tuning": {
    term: "SFT (Supervised Fine-Tuning)",
    def: "RLHF's first stage — training the model on human-written example responses with ordinary gradient descent, the same way pre-training trained on scraped text, but on curated demonstrations instead.",
    sourceModuleId: "rlhf",
    sourceModuleTitle: "RLHF and DPO: Aligning Model Behavior",
  },
  "reward model": {
    term: "Reward Model",
    def: "A separate model trained on human preference comparisons (which of two responses is better) that learns to predict, for any response, roughly how a human would rate it — the frozen judge RLHF's third stage optimizes against.",
    sourceModuleId: "rlhf",
    sourceModuleTitle: "RLHF and DPO: Aligning Model Behavior",
  },
  "ppo": {
    term: "PPO (Proximal Policy Optimization)",
    def: "The reinforcement-learning algorithm RLHF uses to push a policy toward higher reward-model scores while clipping any single update so output probabilities can't swing past a small fixed range at once.",
    sourceModuleId: "rlhf",
    sourceModuleTitle: "RLHF and DPO: Aligning Model Behavior",
  },
  "kl divergence": {
    term: "KL Divergence",
    def: "A measure, in nats, of how far one probability distribution has drifted from another — RLHF uses it to penalize the policy for straying too far from its supervised-fine-tuned starting point while it chases reward.",
    sourceModuleId: "rlhf",
    sourceModuleTitle: "RLHF and DPO: Aligning Model Behavior",
  },
  "reward hacking": {
    term: "Reward Hacking",
    def: "When a policy learns to game the reward model's imperfect judgment — padding answers with filler, or being sycophantic — driving the reward score up without genuinely improving the response humans meant to reward.",
    sourceModuleId: "rlhf",
    sourceModuleTitle: "RLHF and DPO: Aligning Model Behavior",
  },

  // ── agent-react ──────────────────────────────────────────────────────────
  "react (reason + act)": {
    term: "ReAct (Reason + Act)",
    def: "A loop that interleaves two things a language model is already good at — writing out reasoning as text (Thought) and emitting a structured tool call (Action) — then lets the runtime execute the real world and feed the result back in (Observation), so each new step is grounded in reality instead of a guess.",
    sourceModuleId: "agent-react",
    sourceModuleTitle: "The ReAct Pattern",
  },
  "thought–action–observation loop": {
    term: "Thought → Action → Observation Loop",
    def: "The three-role loop ReAct runs: Thought is the model's reasoning as plain text, Action is a structured tool call after which the model must stop generating, and Observation is the real tool result the runtime — never the model — appends back into context.",
    sourceModuleId: "agent-react",
    sourceModuleTitle: "The ReAct Pattern",
  },
  "generation stop point": {
    term: "Generation Stop Point",
    def: "Treating a model's Action (tool call) as a hard halt on decoding, so nothing after it — including a fabricated Observation — can come from the model on that turn; modern function-calling APIs end the turn natively at the tool call.",
    sourceModuleId: "agent-react",
    sourceModuleTitle: "The ReAct Pattern",
  },
  "max-step limit": {
    term: "Max-Step Limit",
    def: "A hard cap (e.g. 8–12 steps) on how many Thought → Action → Observation iterations an agent loop may run before it must gracefully report that it could not complete the task — mandatory because nothing in the ReAct pattern itself guarantees termination.",
    sourceModuleId: "agent-react",
    sourceModuleTitle: "The ReAct Pattern",
  },
  "fabricated observation": {
    term: "Fabricated Observation",
    def: "An Observation the model wrote itself instead of a real tool result — the classic production bug, since a hallucinated 'fact' in that slot can drive a real action (like an unauthorized refund) with nothing to stop it.",
    sourceModuleId: "agent-react",
    sourceModuleTitle: "The ReAct Pattern",
  },
  "grounding (agent loop)": {
    term: "Grounding",
    def: "Conditioning each new Thought on a real Observation that didn't exist when the reasoning began — what lets a ReAct agent recover from a 404, an empty search, or a wrong assumption instead of committing to a guessed plan up front.",
    sourceModuleId: "agent-react",
    sourceModuleTitle: "The ReAct Pattern",
  },

  // ── agent-tool-design ────────────────────────────────────────────────────
  "tool schema": {
    term: "Tool Schema",
    def: "The name, description, and typed parameter list that make up the model's entire view of a tool — it never sees the underlying code, so a tool call is chosen purely from this text, making the schema a specification interface rather than documentation.",
    sourceModuleId: "agent-tool-design",
    sourceModuleTitle: "Tool Use Design",
  },
  "negative guidance (tool description)": {
    term: "Negative Guidance",
    def: "An explicit 'do NOT use for…' clause in a tool's description — the single highest-leverage line for stopping a model from over-triggering a vague, catch-all-sounding tool.",
    sourceModuleId: "agent-tool-design",
    sourceModuleTitle: "Tool Use Design",
  },
  "tool granularity": {
    term: "Tool Granularity",
    def: "The design choice of how much a single tool should do — the rule of thumb is one tool = one clear verb over one clear noun, since a mega-tool with a mode flag overloads the argument space and too many micro-tools collide on selection.",
    sourceModuleId: "agent-tool-design",
    sourceModuleTitle: "Tool Use Design",
  },
  "structured error": {
    term: "Structured Error",
    def: "A tool failure returned as an actionable object — e.g. { error: 'not_found', message, suggestion } — rather than a bare null or stack trace, so the agent's reasoning loop can tell not-found apart from down or bad-argument and self-correct instead of failing blindly.",
    sourceModuleId: "agent-tool-design",
    sourceModuleTitle: "Tool Use Design",
  },
  "mcp (model context protocol)": {
    term: "MCP (Model Context Protocol)",
    def: "A standard that lets you expose a tool once from an MCP server and have any MCP-speaking client call it, instead of re-writing a bespoke integration for every LLM client — it formalises exactly the schema/description/parameter grammar good tool design already calls for.",
    sourceModuleId: "agent-tool-design",
    sourceModuleTitle: "Tool Use Design",
  },
  "parameter description": {
    term: "Parameter Description",
    def: "The type and constraint text attached to each tool argument — a precise example (e.g. 'remote meal expense policy 2024', not 'expenses') improves retrieval because the model imitates it, and enums are preferred over free strings wherever the value space is closed.",
    sourceModuleId: "agent-tool-design",
    sourceModuleTitle: "Tool Use Design",
  },

  // ── agent-eval-trajectory ────────────────────────────────────────────────
  "outcome evaluation": {
    term: "Outcome Evaluation",
    def: "Grading only whether an agent's final output matched the expected answer — sufficient for a one-shot model call, but for a multi-step agent it collapses an entire trajectory into a single pass/fail and discards everything that happened along the way.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
  "trajectory evaluation": {
    term: "Trajectory Evaluation",
    def: "Scoring an agent's process step by step — tool-call accuracy, step success rate, redundant or hallucinated calls, and error recovery — instead of only its final answer, because an agent can reach the right answer through a broken, unsafe, or lucky path that outcome eval can't see.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
  "false pass (trajectory)": {
    term: "False Pass",
    def: "An agent reaching the correct final answer through a path that is broken, unsafe, or simply lucky — e.g. calling a destructive tool nobody asked for and still emitting a plausible final sentence — which outcome-only evaluation scores as PASS.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
  "false fail (trajectory)": {
    term: "False Fail",
    def: "An agent reasoning correctly and calling the right tools with the right arguments, but the underlying data was stale or a downstream API errored — outcome eval says FAIL and sends you to debug the agent's reasoning when the real fault lived in the environment.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
  "tool-call accuracy": {
    term: "Tool-Call Accuracy",
    def: "Whether an agent, at each step, selected the right tool and called it with the right arguments — tool-selection accuracy and tool-argument accuracy are the two things this metric checks.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
  "step success rate": {
    term: "Step Success Rate",
    def: "The fraction of steps in an agent's trajectory that produced a valid, expected observation — one of the core process metrics trajectory evaluation tracks alongside tool-call accuracy and error recovery.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
  "golden trajectory": {
    term: "Golden Trajectory",
    def: "A hand-authored reference run used for per-step assertions — this ticket should call lookup_order with the exact ID and should never call issue_refund — that becomes a regression suite catching a reintroduced bug in CI.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
  "llm-as-judge": {
    term: "LLM-as-Judge (Trajectory)",
    def: "Handing a full step-by-step agent trace to a strong model with a rubric to grade open-ended quality assertions can't specify — it scales to fuzzy judgments but inherits judge biases (fluent-but-wrong, verbosity, non-determinism), so it's anchored with golden examples and human spot-audits.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
  "agent eval harness": {
    term: "Agent Eval Harness",
    def: "A test harness that runs an agent against a fixed suite of tasks in a controlled, reproducible environment (mocked or recorded tools), captures the full trajectory of every run, and reports outcome and process metrics side by side so every regression is localizable to the exact step where it diverged.",
    sourceModuleId: "agent-eval-trajectory",
    sourceModuleTitle: "Agent Evaluation: Trajectory vs Outcome",
  },
};
