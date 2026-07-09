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

  // Batch 3 (2026-07-09): +66 terms harvested from the 12 NLP Foundations modules
  // (nlp-foundations-{1..4}.js) after their full audit + groundUp writer/adversarial pass.
  "stemming": {
    term: "Stemming",
    def: "Crude rule-based suffix chopping that maps word forms toward a shared root ('running' -> 'run', but also 'university' -> 'univers') — fast and dumb, often producing non-words; the principled alternative is lemmatization.",
    sourceModuleId: "nlp-preprocessing",
    sourceModuleTitle: "Text Preprocessing & Normalization",
  },
  "lemmatization": {
    term: "Lemmatization",
    def: "Mapping a word to its true dictionary base form using a lexicon and its part of speech ('better' -> 'good', 'ran' -> 'run') — slower than stemming but correct.",
    sourceModuleId: "nlp-preprocessing",
    sourceModuleTitle: "Text Preprocessing & Normalization",
  },
  "stopword removal": {
    term: "Stopword removal",
    def: "Deleting ubiquitous words ('the', 'is', 'a') from text — a win for sparse bag-of-words models where they are pure noise, but harmful when the word carries meaning: strip 'not' from a sentiment task and you've deleted the point.",
    sourceModuleId: "nlp-preprocessing",
    sourceModuleTitle: "Text Preprocessing & Normalization",
  },
  "one-hot vector": {
    term: "One-hot vector",
    def: "A vocabulary-sized vector that is all zeros except a single 1 at one word's index — a pure identity label that encodes which word but zero information about meaning: 'king' and 'queen' are exactly as far apart as 'king' and 'banana'.",
    sourceModuleId: "nlp-bow-tfidf",
    sourceModuleTitle: "Bag-of-Words & TF-IDF",
  },
  "bag-of-words": {
    term: "Bag-of-words (BoW)",
    def: "Representing a document as its word counts, one dimension per vocabulary word — order is completely discarded ('dog bites man' = 'man bites dog') and the vector is overwhelmingly sparse.",
    sourceModuleId: "nlp-bow-tfidf",
    sourceModuleTitle: "Bag-of-Words & TF-IDF",
  },
  "tf-idf": {
    term: "TF-IDF",
    def: "Term weighting tf(t,d) x log(N/df(t)): a term matters more when frequent in this document and rare across the corpus. A term in every document gets idf = log(1) = 0, so ubiquitous filler is annihilated.",
    sourceModuleId: "nlp-bow-tfidf",
    sourceModuleTitle: "Bag-of-Words & TF-IDF",
  },
  "inverse document frequency": {
    term: "Inverse document frequency (IDF)",
    def: "The log(N/df) factor in TF-IDF: N documents divided by how many contain the term, logged — operationalizing 'a word is informative in proportion to how rare it is across the corpus', with the log damping the extremes.",
    sourceModuleId: "nlp-bow-tfidf",
    sourceModuleTitle: "Bag-of-Words & TF-IDF",
  },
  "cosine similarity": {
    term: "Cosine similarity",
    def: "The dot product of two unit-normalized vectors — the cosine of the angle between them. It measures direction rather than magnitude, so document comparisons become length-invariant after L2 normalization.",
    sourceModuleId: "nlp-bow-tfidf",
    sourceModuleTitle: "Bag-of-Words & TF-IDF",
  },
  "bm25": {
    term: "BM25",
    def: "TF-IDF grown up: keeps the IDF idea but adds term-frequency saturation (the 20th occurrence adds far less than the 2nd) and document-length normalization baked into the score — the default sparse retriever in production search.",
    sourceModuleId: "nlp-bow-tfidf",
    sourceModuleTitle: "Bag-of-Words & TF-IDF",
  },
  "n-gram": {
    term: "n-gram",
    def: "A window of n consecutive words; an n-gram language model predicts the next word from the previous n-1 words by corpus counting. Possible n-grams grow as V^n, which is why large n collapses into data sparsity.",
    sourceModuleId: "nlp-ngram-lm",
    sourceModuleTitle: "n-gram Language Models",
  },
  "markov assumption": {
    term: "Markov assumption",
    def: "The approximation that the next word depends only on the last n-1 words rather than the whole history — it makes the chain rule computable at the cost of forgetting everything older than the window.",
    sourceModuleId: "nlp-ngram-lm",
    sourceModuleTitle: "n-gram Language Models",
  },
  "perplexity": {
    term: "Perplexity",
    def: "2 raised to the cross-entropy of a language model on held-out text — interpretable as the model's average branching factor, i.e. how many equally-likely words it feels it's choosing among at each step. Lower is better.",
    sourceModuleId: "nlp-ngram-lm",
    sourceModuleTitle: "n-gram Language Models",
  },
  "smoothing": {
    term: "Smoothing",
    def: "Never letting any n-gram probability be exactly zero: steal a little probability mass from what was seen and redistribute it to what wasn't (add-1/add-k are the crude versions), since one zero in the chain-rule product kills the whole sentence.",
    sourceModuleId: "nlp-ngram-lm",
    sourceModuleTitle: "n-gram Language Models",
  },
  "backoff": {
    term: "Backoff",
    def: "When there's no count for the full n-gram, fall back to the (n-1)-gram, then lower — always use the longest context you actually have evidence for.",
    sourceModuleId: "nlp-ngram-lm",
    sourceModuleTitle: "n-gram Language Models",
  },
  "kneser-ney": {
    term: "Kneser-Ney smoothing",
    def: "The strongest classical smoothing: when backing off, weight a word by how many distinct contexts it appears in (continuation probability), not raw frequency — 'Francisco' is frequent but almost only follows 'San', so it's a poor bet in a novel context.",
    sourceModuleId: "nlp-ngram-lm",
    sourceModuleTitle: "n-gram Language Models",
  },
  "distributional hypothesis": {
    term: "Distributional hypothesis",
    def: "A word is known by the company it keeps: words appearing in similar contexts tend to have similar meanings, so co-occurrence statistics alone — no labels — carry enough signal to learn meaning.",
    sourceModuleId: "nlp-word2vec-glove",
    sourceModuleTitle: "Word2Vec & GloVe",
  },
  "skip-gram": {
    term: "Skip-gram",
    def: "The Word2Vec framing that predicts context words from the center word — each occurrence yields several (center, context) training pairs, so rare words get multiple updates; generally better for rare words and small datasets.",
    sourceModuleId: "nlp-word2vec-glove",
    sourceModuleTitle: "Word2Vec & GloVe",
  },
  "cbow": {
    term: "CBOW",
    def: "Continuous Bag of Words — the mirror of skip-gram: predict the center word from its averaged context. The averaging smooths over rare words but trains faster, so it wins on large corpora when speed matters.",
    sourceModuleId: "nlp-word2vec-glove",
    sourceModuleTitle: "Word2Vec & GloVe",
  },
  "negative sampling": {
    term: "Negative sampling",
    def: "Replacing the full-vocabulary softmax with a cheap binary question — is this (center, context) pair real or sampled noise? — so each update touches ~k+1 word vectors instead of the whole vocabulary.",
    sourceModuleId: "nlp-word2vec-glove",
    sourceModuleTitle: "Word2Vec & GloVe",
  },
  "hierarchical softmax": {
    term: "Hierarchical softmax",
    def: "Arranging the vocabulary as a binary (Huffman) tree so predicting a word costs ~log2(V) node decisions instead of V — roughly 17 steps for a 130k vocabulary rather than 130,000.",
    sourceModuleId: "nlp-word2vec-glove",
    sourceModuleTitle: "Word2Vec & GloVe",
  },
  "glove": {
    term: "GloVe",
    def: "Global Vectors: learns word vectors by factorizing the corpus-wide word-word co-occurrence matrix, designed so vector differences capture ratios of co-occurrence probabilities — the ratios, not raw counts, are what discriminate 'ice' from 'steam'.",
    sourceModuleId: "nlp-word2vec-glove",
    sourceModuleTitle: "Word2Vec & GloVe",
  },
  "static embedding": {
    term: "Static embedding",
    def: "One fixed vector per word type, frozen after training — so a polysemous word like 'bank' must represent riverbank and money-bank with the same single point. The ceiling that motivated contextual embeddings (ELMo, BERT).",
    sourceModuleId: "nlp-word2vec-glove",
    sourceModuleTitle: "Word2Vec & GloVe",
  },
  "recurrent neural network": {
    term: "Recurrent neural network (RNN)",
    def: "A network that processes a sequence step by step, carrying a fixed-size hidden state as a running summary, with the same weights reused at every step — one small network handling any sequence length.",
    sourceModuleId: "nlp-rnn-lstm-gru",
    sourceModuleTitle: "RNNs, LSTMs & GRUs",
  },
  "hidden state": {
    term: "Hidden state",
    def: "The RNN's fixed-size vector summary of everything seen so far, updated at each step from the current input and the previous hidden state — continually overwritten, not a set of discrete memory slots.",
    sourceModuleId: "nlp-rnn-lstm-gru",
    sourceModuleTitle: "RNNs, LSTMs & GRUs",
  },
  "bptt": {
    term: "Backpropagation-through-time (BPTT)",
    def: "Training an RNN by unrolling it across the sequence and sending the loss's gradient back through every step — where repeated multiplication by roughly the same factor makes gradients vanish (<1) or explode (>1) over distance.",
    sourceModuleId: "nlp-rnn-lstm-gru",
    sourceModuleTitle: "RNNs, LSTMs & GRUs",
  },
  "vanishing gradient": {
    term: "Vanishing gradient",
    def: "The geometric decay of gradients flowing back through many steps (0.5^20 is about 1e-6): early tokens receive almost no learning signal, silently capping a plain RNN's effective memory at a handful of steps.",
    sourceModuleId: "nlp-rnn-lstm-gru",
    sourceModuleTitle: "RNNs, LSTMs & GRUs",
  },
  "gradient clipping": {
    term: "Gradient clipping",
    def: "Capping the gradient's norm during training — the standard tame for exploding gradients (the louder, easier twin of vanishing gradients), preventing NaNs and instability.",
    sourceModuleId: "nlp-rnn-lstm-gru",
    sourceModuleTitle: "RNNs, LSTMs & GRUs",
  },
  "lstm": {
    term: "LSTM",
    def: "Long Short-Term Memory: adds a cell state that flows through the sequence via mostly additive updates — a gradient highway that avoids geometric decay — controlled by learned forget/input/output gates acting as soft [0,1] valves.",
    sourceModuleId: "nlp-rnn-lstm-gru",
    sourceModuleTitle: "RNNs, LSTMs & GRUs",
  },
  "gru": {
    term: "GRU",
    def: "Gated Recurrent Unit: the LSTM's lighter cousin — merges cell and hidden state and uses two gates (reset + update, the update gate fusing the LSTM's forget and input roles). Fewer parameters, faster training, often equal quality.",
    sourceModuleId: "nlp-rnn-lstm-gru",
    sourceModuleTitle: "RNNs, LSTMs & GRUs",
  },
  "seq2seq": {
    term: "seq2seq",
    def: "The encoder-decoder architecture for variable-length input to variable-length output (translation being canonical): an encoder reads the source, a decoder generates the target one token at a time.",
    sourceModuleId: "nlp-seq2seq-attention",
    sourceModuleTitle: "seq2seq & the Birth of Attention",
  },
  "fixed-vector bottleneck": {
    term: "Fixed-vector bottleneck",
    def: "Vanilla seq2seq's flaw: the entire variable-length source is compressed into the encoder's single fixed-size final hidden state, so long sentences blur their early words and the decoder drifts — fixed capacity vs unbounded length.",
    sourceModuleId: "nlp-seq2seq-attention",
    sourceModuleTitle: "seq2seq & the Birth of Attention",
  },
  "alignment weights": {
    term: "Alignment weights",
    def: "Attention's per-step scores over the source: at each decoder step, one weight per source word saying how relevant it is to the word about to be produced, softmaxed to sum to 1 and used to blend a fresh context vector.",
    sourceModuleId: "nlp-seq2seq-attention",
    sourceModuleTitle: "seq2seq & the Birth of Attention",
  },
  "bahdanau attention": {
    term: "Bahdanau attention",
    def: "The 2014 'additive' attention: a small learned feed-forward network (with a tanh) scores each decoder-state/encoder-state pair — a learned scorer, more parameters than the dot-product alternative.",
    sourceModuleId: "nlp-seq2seq-attention",
    sourceModuleTitle: "seq2seq & the Birth of Attention",
  },
  "luong attention": {
    term: "Luong attention",
    def: "The 2015 'multiplicative' attention: scores alignment with a simple dot product (or bilinear form) between decoder and encoder states — cheaper, no extra network, and the form that later scaled up in the Transformer.",
    sourceModuleId: "nlp-seq2seq-attention",
    sourceModuleTitle: "seq2seq & the Birth of Attention",
  },
  "masked language modeling": {
    term: "Masked language modeling (MLM)",
    def: "BERT's pretraining game: randomly hide ~15% of tokens and predict each hidden token from both directions at once — the objective that makes encoder representations deeply bidirectional, and why BERT can't naturally generate.",
    sourceModuleId: "nlp-encoder-decoder-objectives",
    sourceModuleTitle: "Encoder vs Decoder vs Encoder-Decoder",
  },
  "cross-attention": {
    term: "Cross-attention",
    def: "The encoder-decoder family's extra mechanism: each decoder position attends back into the encoder's representations of the input, so the decoder writes token by token while continuously consulting the fully-read source.",
    sourceModuleId: "nlp-encoder-decoder-objectives",
    sourceModuleTitle: "Encoder vs Decoder vs Encoder-Decoder",
  },
  "span corruption": {
    term: "Span corruption",
    def: "T5's denoising pretraining objective: mask out contiguous spans of the input and train the model to regenerate them — the encoder-decoder analogue of masked language modeling.",
    sourceModuleId: "nlp-encoder-decoder-objectives",
    sourceModuleTitle: "Encoder vs Decoder vs Encoder-Decoder",
  },
  "pos tagging": {
    term: "POS tagging",
    def: "Labeling each token with its grammatical category (noun, verb, determiner...) — trivial until ambiguity: 'they book a flight' vs 'read a book', same word, different tag, decided by context.",
    sourceModuleId: "nlp-classical-tasks",
    sourceModuleTitle: "Classical NLP Tasks",
  },
  "named entity recognition": {
    term: "Named entity recognition (NER)",
    def: "Finding and typing the spans that name real things — people, organizations, locations, dates. A span task ('Bank of America' is one three-token entity), which is why it's solved as sequence labeling with a BIO-style scheme.",
    sourceModuleId: "nlp-classical-tasks",
    sourceModuleTitle: "Classical NLP Tasks",
  },
  "bio tagging": {
    term: "BIO tagging",
    def: "Encoding span boundaries into per-token labels: B marks an entity's first token, I a continuation, O a non-entity (types appended: B-PER, I-ORG) — the trick that turns 'find multi-word spans' into 'classify each token'. BIOES adds End and Single.",
    sourceModuleId: "nlp-classical-tasks",
    sourceModuleTitle: "Classical NLP Tasks",
  },
  "dependency parsing": {
    term: "Dependency parsing",
    def: "Recovering sentence structure as directed arcs between words — each word points to its syntactic head ('cat' is the subject of 'sat') — producing a tree of word-to-word relations.",
    sourceModuleId: "nlp-classical-tasks",
    sourceModuleTitle: "Classical NLP Tasks",
  },
  "constituency parsing": {
    term: "Constituency parsing",
    def: "Recovering sentence structure as nested phrases — noun phrases and verb phrases bracketed within brackets — a phrase-structure view, in contrast to dependency parsing's word-to-word arcs.",
    sourceModuleId: "nlp-classical-tasks",
    sourceModuleTitle: "Classical NLP Tasks",
  },
  "coreference resolution": {
    term: "Coreference resolution",
    def: "Linking different mentions that refer to the same real-world entity ('she' -> Maria, 'it' -> the report) — essential for extraction and summarization to know scattered mentions are one thing.",
    sourceModuleId: "nlp-classical-tasks",
    sourceModuleTitle: "Classical NLP Tasks",
  },
  "crf": {
    term: "CRF",
    def: "Conditional Random Field: scores an entire tag sequence jointly with global normalization, so it learns hard transition constraints (I-PER can never follow O) and picks one consistent labeling — where independent per-token classifiers can emit illegal sequences.",
    sourceModuleId: "nlp-classical-tasks",
    sourceModuleTitle: "Classical NLP Tasks",
  },
  "naive bayes": {
    term: "Naive Bayes",
    def: "Bayes' rule over bag-of-words features with the 'naive' conditional-independence assumption (words independent given the class) — false in real language, yet a strong baseline because ranking classes only needs the argmax to be right.",
    sourceModuleId: "nlp-text-classification",
    sourceModuleTitle: "Text Classification & Sentiment",
  },
  "laplace smoothing": {
    term: "Laplace smoothing",
    def: "Add-one smoothing for Naive Bayes: pretend every word was seen once more per class, so no word probability is exactly zero — otherwise a single unseen word annihilates the whole class score.",
    sourceModuleId: "nlp-text-classification",
    sourceModuleTitle: "Text Classification & Sentiment",
  },
  "class imbalance": {
    term: "Class imbalance",
    def: "When one class vastly outnumbers another (96% positive, 4% negative), plain accuracy becomes a trap: always-predict-majority scores 96% while catching zero of the rare class you care about — measure precision/recall/F1 on the minority class instead.",
    sourceModuleId: "nlp-text-classification",
    sourceModuleTitle: "Text Classification & Sentiment",
  },
  "decision threshold": {
    term: "Decision threshold",
    def: "The probability cutoff you choose for a classifier's output — 0.5 is arbitrary. Lowering it catches more of the rare class (higher recall, lower precision); tuning it trades precision against recall without retraining.",
    sourceModuleId: "nlp-text-classification",
    sourceModuleTitle: "Text Classification & Sentiment",
  },
  "macro-f1": {
    term: "Macro-F1",
    def: "Average the per-class F1 scores with equal weight, so a tiny class counts as much as a huge one — report it when rare classes matter, because pooled metrics let the dominant class mask minority failure.",
    sourceModuleId: "nlp-text-classification",
    sourceModuleTitle: "Text Classification & Sentiment",
  },
  "micro-f1": {
    term: "Micro-F1",
    def: "Pool every decision across all classes before scoring — answers 'overall, across all predictions', which means large classes dominate and a rare class doing badly can be hidden.",
    sourceModuleId: "nlp-text-classification",
    sourceModuleTitle: "Text Classification & Sentiment",
  },
  "bleu": {
    term: "BLEU",
    def: "The machine-translation metric: modified n-gram precision (n=1..4, geometric mean) grading what the candidate said against a reference — with clipping to stop repetition-farming and a brevity penalty to stop cowardly-short outputs.",
    sourceModuleId: "nlp-eval-metrics",
    sourceModuleTitle: "NLP Evaluation Metrics",
  },
  "rouge": {
    term: "ROUGE",
    def: "The summarization metric family: recall-oriented n-gram overlap grading how much of the reference the candidate covered (omission being summarization's danger); ROUGE-L uses the longest common subsequence for in-order, non-contiguous matches.",
    sourceModuleId: "nlp-eval-metrics",
    sourceModuleTitle: "NLP Evaluation Metrics",
  },
  "meteor": {
    term: "METEOR",
    def: "An overlap metric that adds stemming, WordNet synonym matching, and an alignment step penalizing fragmented matches — better human correlation than raw BLEU, but needs linguistic resources that don't exist for every language.",
    sourceModuleId: "nlp-eval-metrics",
    sourceModuleTitle: "NLP Evaluation Metrics",
  },
  "brevity penalty": {
    term: "Brevity penalty",
    def: "BLEU's guard against gaming precision with short outputs: multiply the score by min(1, e^(1 - r/c)) so a candidate shorter than the reference gets dragged down.",
    sourceModuleId: "nlp-eval-metrics",
    sourceModuleTitle: "NLP Evaluation Metrics",
  },
  "bertscore": {
    term: "BERTScore",
    def: "Replaces exact string matching with semantic matching: embed every token with a contextual model and match candidate to reference tokens by cosine similarity — so 'movie' and 'film' finally count as a match, escaping the paraphrase blind spot.",
    sourceModuleId: "nlp-eval-metrics",
    sourceModuleTitle: "NLP Evaluation Metrics",
  },
  "self-supervision": {
    term: "Self-supervision",
    def: "Training objectives that manufacture their own labels from raw text (hide a word, predict it) — no human labeling, effectively unlimited data, and succeeding forces the model to internalize grammar, meaning, and world knowledge.",
    sourceModuleId: "nlp-transfer-learning",
    sourceModuleTitle: "Transfer Learning in NLP",
  },
  "elmo": {
    term: "ELMo",
    def: "The 2018 step that made word embeddings deep and contextual: a bidirectional LSTM language model whose internal states give 'bank' a different vector per sentence — though still consumed mostly as frozen features.",
    sourceModuleId: "nlp-transfer-learning",
    sourceModuleTitle: "Transfer Learning in NLP",
  },
  "ulmfit": {
    term: "ULMFiT",
    def: "The 2018 proof that you could fine-tune a whole pretrained language model, with the tricks that made it stable: discriminative learning rates, gradual unfreezing, and a slanted triangular learning-rate schedule.",
    sourceModuleId: "nlp-transfer-learning",
    sourceModuleTitle: "Transfer Learning in NLP",
  },
  "catastrophic forgetting": {
    term: "Catastrophic forgetting",
    def: "Fine-tuning on a small dataset wiping out the pretrained knowledge the model arrived with — the failure mode ULMFiT's gradual unfreezing and discriminative learning rates were invented to tame.",
    sourceModuleId: "nlp-transfer-learning",
    sourceModuleTitle: "Transfer Learning in NLP",
  },
  "gradual unfreezing": {
    term: "Gradual unfreezing",
    def: "Unfreezing a pretrained model's layers top-down during fine-tuning rather than all at once, so task-specific top layers adapt first and general lower layers aren't destroyed early.",
    sourceModuleId: "nlp-transfer-learning",
    sourceModuleTitle: "Transfer Learning in NLP",
  },
  "anisotropy": {
    term: "Anisotropy",
    def: "The pathology of raw BERT sentence vectors: embeddings occupy a narrow cone rather than spreading out, so nearly every pair of sentences scores high cosine similarity and the metric loses its power to discriminate.",
    sourceModuleId: "nlp-sentence-embeddings",
    sourceModuleTitle: "Sentence Embeddings & Semantic Similarity",
  },
  "cross-encoder": {
    term: "Cross-encoder",
    def: "Feed a sentence pair through the transformer together so every token of one attends to every token of the other, then score — deeply accurate, but the score exists only per pair: one query against 500k candidates costs 500k forward passes.",
    sourceModuleId: "nlp-sentence-embeddings",
    sourceModuleTitle: "Sentence Embeddings & Semantic Similarity",
  },
  "bi-encoder": {
    term: "Bi-encoder",
    def: "Encode each sentence independently into one fixed vector and compare with a cheap cosine/dot product — candidates get embedded once offline, so matching is O(1) per pair (or ~O(log n) with an ANN index): a little accuracy for orders-of-magnitude scale.",
    sourceModuleId: "nlp-sentence-embeddings",
    sourceModuleTitle: "Sentence Embeddings & Semantic Similarity",
  },
  "sbert": {
    term: "SBERT",
    def: "Sentence-BERT: a siamese/triplet-trained bi-encoder whose loss explicitly pulls semantically similar sentences together and pushes dissimilar ones apart — converting BERT's non-comparable vectors into a space where cosine actually means semantic similarity.",
    sourceModuleId: "nlp-sentence-embeddings",
    sourceModuleTitle: "Sentence Embeddings & Semantic Similarity",
  },
  "triplet loss": {
    term: "Triplet loss",
    def: "Training on (anchor, positive, negative) triples with the constraint that the anchor sit closer to the positive than the negative by a margin — relative comparisons, repeated at scale, shape the space so meaning maps to geometry.",
    sourceModuleId: "nlp-sentence-embeddings",
    sourceModuleTitle: "Sentence Embeddings & Semantic Similarity",
  },
  "mean pooling": {
    term: "Mean pooling",
    def: "Collapsing BERT's per-token vectors into one sentence vector by averaging all token vectors — usually the winner for SBERT: smoother and more robust than trusting the single [CLS] slot or a spiky elementwise max.",
    sourceModuleId: "nlp-sentence-embeddings",
    sourceModuleTitle: "Sentence Embeddings & Semantic Similarity",
  },
};
