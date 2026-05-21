import React, { useState, useEffect, useRef } from "react";

// ─── QUESTION BANK (60 questions) ────────────────────────────────────────────

const PREP_QUESTIONS = [
  // ── RAG (12) ──────────────────────────────────────────────────────────────
  {
    id: "rag-1", topic: "rag", difficulty: "hard", type: "mcq",
    question: "A RAG system has 94% recall but users report wrong answers 30% of the time. Most likely cause?",
    options: ["Chunk size too small", "Reranker missing — top-k has wrong docs at position 1 despite good recall", "Answer policy too permissive", "Embedding model mismatch"],
    correct: 1, keywords: [],
    explanation: "High recall means relevant docs exist in the top-k, but without a reranker the most relevant doc may not be at position 1. The LLM anchors on early context, so irrelevant chunks at the top produce wrong answers despite good recall.",
    readMore: { label: "RAG Evaluation Deep Dive", tab: "groundtruth" }
  },
  {
    id: "rag-2", topic: "rag", difficulty: "hard", type: "mcq",
    question: "You increase top_k from 3 to 10. Recall goes up, but LLM answer quality drops. Why?",
    options: ["Context window overflow", "More irrelevant chunks diluting the signal — LLM loses focus", "Embedding drift", "Token cost is too high"],
    correct: 1, keywords: [],
    explanation: "LLMs degrade with noisy context. Adding 7 more partially-relevant chunks introduces contradictory or off-topic sentences, causing the model to hedge or pick wrong evidence.",
    readMore: { label: "Retrieval Quality vs. Quantity", tab: "concepts" }
  },
  {
    id: "rag-3", topic: "rag", difficulty: "medium", type: "mcq",
    question: "Which chunking strategy preserves the most semantic coherence for a technical documentation corpus?",
    options: ["Fixed 512 tokens", "Sentence-boundary splitting", "Markdown-aware semantic chunking (split at headers/code blocks)", "Character-level with 50-token overlap"],
    correct: 2, keywords: [],
    explanation: "Technical docs have natural semantic units defined by headers and code blocks. Markdown-aware chunking keeps code examples with their explanatory prose, reducing mid-explanation splits.",
    readMore: { label: "Chunking Strategies", tab: "concepts" }
  },
  {
    id: "rag-4", topic: "rag", difficulty: "hard", type: "mcq",
    question: "You build a RAG system over versioned policy docs (2021 and 2024 coexist). User asks about current policy. System confidently returns 2021 rules. Root cause?",
    options: ["Embedding model cannot handle dates", "Semantic similarity selects the most linguistically similar chunk regardless of recency", "Vector DB is corrupted", "Top_k is too high"],
    correct: 1, keywords: [],
    explanation: "Embeddings encode semantic meaning, not temporal relevance. Both policy versions discuss the same topic similarly. The retriever has no freshness signal. Metadata filtering on document date is required.",
    readMore: { label: "Stale Document Retrieval", tab: "groundtruth" }
  },
  {
    id: "rag-5", topic: "rag", difficulty: "hard", type: "text",
    question: "Explain why parent-child chunking (small chunks for retrieval, large chunks for generation) solves a specific RAG failure mode. What is that failure mode and when does it not help?",
    options: null, correct: null,
    keywords: ["precision", "context", "small chunk", "large chunk", "generation", "hallucin", "embedding"],
    explanation: "Small chunks improve retrieval precision. Large parent chunks give the LLM enough context to answer accurately. It does not help when the answer requires synthesizing across multiple disjoint document sections.",
    readMore: { label: "Advanced Chunking Patterns", tab: "concepts" }
  },
  {
    id: "rag-6", topic: "rag", difficulty: "hard", type: "mcq",
    question: "HyDE (Hypothetical Document Embeddings) improves retrieval by:",
    options: ["Caching embeddings for faster lookup", "Generating a fake answer first, embedding it, then retrieving similar docs", "Fine-tuning the embedding model on queries", "Re-ranking results using a cross-encoder"],
    correct: 1, keywords: [],
    explanation: "HyDE generates a hypothetical answer to the query using an LLM, embeds that answer, and uses that embedding for retrieval. This bridges the query-document distribution gap since the hypothetical answer is linguistically closer to real documents.",
    readMore: { label: "Advanced RAG Patterns", tab: "concepts" }
  },
  {
    id: "rag-7", topic: "rag", difficulty: "hard", type: "mcq",
    question: "Your RAG pipeline groundedness score is 0.91 but citation accuracy is 0.48. What does this pattern indicate?",
    options: ["The LLM is paraphrasing correctly but attributing claims to wrong source chunks", "The evaluation metrics are misconfigured", "Retrieval is failing but generation is strong", "Token budget is too low"],
    correct: 0, keywords: [],
    explanation: "High groundedness means claims are supported by retrieved context. Low citation accuracy means the model is citing the wrong document ID. Classic reranker misconfiguration or chunk boundary issue.",
    readMore: { label: "RAG Metrics Explained", tab: "groundtruth" }
  },
  {
    id: "rag-8", topic: "rag", difficulty: "hard", type: "mcq",
    question: "A cross-encoder reranker improves answer quality but adds 800ms latency. The best production solution is:",
    options: ["Remove the reranker", "Use the reranker only for queries classified as high-stakes via a lightweight classifier", "Switch to BM25 only", "Reduce top_k to 1 before reranking"],
    correct: 1, keywords: [],
    explanation: "A query classifier (fast, cheap) can route complex/high-stakes queries through the reranker while simple queries skip it. This preserves quality where it matters without paying the latency cost on every request.",
    readMore: { label: "RAG Latency Optimization", tab: "systems" }
  },
  {
    id: "rag-9", topic: "rag", difficulty: "hard", type: "text",
    question: "You are indexing a codebase for a code-search RAG system. Why does standard semantic chunking fail, and what would you do differently?",
    options: null, correct: null,
    keywords: ["function", "class", "AST", "syntax", "scope", "import", "dependency"],
    explanation: "Code has syntactic structure (functions, classes, imports) that semantic chunking ignores. Mid-function splits break context. AST-aware chunking at function/class boundaries plus dependency graph traversal is needed.",
    readMore: { label: "Code RAG Systems", tab: "concepts" }
  },
  {
    id: "rag-10", topic: "rag", difficulty: "hard", type: "mcq",
    question: "Multi-vector retrieval (ColBERT) outperforms single-vector retrieval on which specific failure mode?",
    options: ["Queries where the answer is a single exact phrase", "Queries requiring matching of multiple distinct concepts in one passage", "Queries that exceed context window limits", "Queries involving numerical reasoning"],
    correct: 1, keywords: [],
    explanation: "ColBERT computes token-level similarity, catching cases where a single embedding averages out distinct concepts. Superior for multi-faceted queries where a passage must satisfy several independent criteria.",
    readMore: { label: "Vector Search Architectures", tab: "systems" }
  },
  {
    id: "rag-11", topic: "rag", difficulty: "hard", type: "mcq",
    question: "You add metadata filtering (department=HR) to your vector search. Recall drops from 88% to 61%. Most likely cause?",
    options: ["Vector DB is slow", "Metadata was not populated correctly during ingestion for a significant document subset", "The embedding model does not support metadata", "Filter is too broad"],
    correct: 1, keywords: [],
    explanation: "Metadata filtering applies a pre-filter before ANN search. If documents were not tagged correctly at ingestion time, they are silently excluded. The recall drop is invisible unless you have per-filter recall monitoring.",
    readMore: { label: "Metadata Filtering in Production", tab: "systems" }
  },
  {
    id: "rag-12", topic: "rag", difficulty: "hard", type: "mcq",
    question: "Contextual compression in RAG (extracting only relevant sentences from retrieved chunks before passing to LLM) primarily helps with:",
    options: ["Reducing embedding cost", "Reducing LLM distraction from irrelevant context within a chunk", "Improving retrieval recall", "Handling multilingual documents"],
    correct: 1, keywords: [],
    explanation: "Retrieved chunks often contain relevant and irrelevant sentences mixed together. Contextual compression extracts only the relevant portion, reducing noise that causes the LLM to generate hallucinated or confused answers.",
    readMore: { label: "Advanced RAG Patterns", tab: "concepts" }
  },

  // ── AGENTS (12) ───────────────────────────────────────────────────────────
  {
    id: "agents-1", topic: "agents", difficulty: "hard", type: "mcq",
    question: "Your agent calls the same tool 3 times with identical inputs in one turn. This indicates:",
    options: ["Tool is slow so the agent is retrying", "Missing state management — agent forgot it already called it", "Intentional verification pattern", "Context window pressure causing truncation"],
    correct: 1, keywords: [],
    explanation: "Without explicit state tracking or tool result caching, agents operating over long contexts can forget they already executed a tool call. This is a trajectory efficiency failure and a cost issue.",
    readMore: { label: "Agent Architecture Patterns", tab: "agents" }
  },
  {
    id: "agents-2", topic: "agents", difficulty: "hard", type: "text",
    question: "An agent trajectory efficiency score is 0.43. Explain what this means and two architectural changes to improve it.",
    options: null, correct: null,
    keywords: ["minimum steps", "actual steps", "redundant", "wasted", "state", "plan"],
    explanation: "Trajectory efficiency = minimum steps needed / actual steps taken. 0.43 means the agent took more than twice the optimal steps. Fixes: add explicit planning step before execution, add short-term memory for tool call results.",
    readMore: { label: "Agent Evaluation Metrics", tab: "agents" }
  },
  {
    id: "agents-3", topic: "agents", difficulty: "hard", type: "mcq",
    question: "In a multi-agent system, Agent A passes results to Agent B via shared memory. Agent B outputs are consistently wrong despite correct inputs from A. Most likely cause?",
    options: ["Network latency", "Agent B reading stale state — A writes are not flushed before B reads", "Agent A is using wrong tool", "LLM temperature too high"],
    correct: 1, keywords: [],
    explanation: "Multi-agent systems with shared state have race conditions. If there is no synchronization primitive ensuring A's write is complete before B reads, B operates on stale data.",
    readMore: { label: "Multi-Agent Coordination", tab: "agents" }
  },
  {
    id: "agents-4", topic: "agents", difficulty: "hard", type: "mcq",
    question: "You are designing an agent that must handle a 47-step complex workflow. The main risk of ReAct over a plan-and-execute pattern here is:",
    options: ["ReAct is slower", "Context window accumulation — 47 turns of Thought/Action/Observation eventually exceeds limits or degrades quality", "ReAct cannot use tools", "Plan-and-execute does not support conditionals"],
    correct: 1, keywords: [],
    explanation: "ReAct interleaves thinking and acting in a growing context. At step 30+, the model is reasoning over a very long history, leading to drift, repetition, or context truncation.",
    readMore: { label: "Agent Patterns Compared", tab: "agents" }
  },
  {
    id: "agents-5", topic: "agents", difficulty: "hard", type: "mcq",
    question: "An agent is given a tool with the description: 'Searches the database.' After 1000 runs, tool call accuracy is 34%. Best fix?",
    options: ["Switch to a bigger LLM", "Rewrite tool description with precise input schema, example calls, and when-to-use vs. when-not-to-use guidance", "Add more tools", "Increase temperature"],
    correct: 1, keywords: [],
    explanation: "Tool selection and parameter filling are heavily guided by tool descriptions. A vague description leads to incorrect tool selection and wrong parameter formats. Rich descriptions with examples dramatically improve tool use accuracy.",
    readMore: { label: "Tool Design for Agents", tab: "agents" }
  },
  {
    id: "agents-6", topic: "agents", difficulty: "hard", type: "text",
    question: "Describe the 'lost in the middle' problem in agentic contexts and how it specifically affects tool output processing differently from standard RAG.",
    options: null, correct: null,
    keywords: ["middle", "attention", "position", "tool output", "long context", "beginning", "end"],
    explanation: "LLMs attend more strongly to content at the start and end of context. In agents with multiple tool outputs, middle results get underweighted. Unlike RAG where you control chunk order, tool outputs arrive sequentially.",
    readMore: { label: "LLM Context Behavior", tab: "concepts" }
  },
  {
    id: "agents-7", topic: "agents", difficulty: "hard", type: "mcq",
    question: "You need an agent to reliably perform financial calculations. The best approach is:",
    options: ["Use a very large LLM for better math", "Route all numerical computations to a code execution tool — never rely on LLM arithmetic", "Use chain-of-thought prompting for math", "Fine-tune the LLM on financial data"],
    correct: 1, keywords: [],
    explanation: "LLMs are unreliable at arithmetic. A Python code execution tool gives deterministic, verifiable results. Use deterministic tools for deterministic subtasks.",
    readMore: { label: "Agent Tool Design", tab: "agents" }
  },
  {
    id: "agents-8", topic: "agents", difficulty: "hard", type: "mcq",
    question: "In LangGraph, what does adding a 'human-in-the-loop' interrupt node before a destructive action primarily protect against?",
    options: ["LLM hallucination in tool descriptions", "Irreversible agent actions triggered by misunderstood intent or adversarial input", "Context window overflow", "High API costs"],
    correct: 1, keywords: [],
    explanation: "Destructive or irreversible actions need human confirmation because agent misunderstandings or prompt injection attacks can trigger unintended consequences that propagate to external systems.",
    readMore: { label: "Safe Agent Design", tab: "agents" }
  },
  {
    id: "agents-9", topic: "agents", difficulty: "hard", type: "mcq",
    question: "Prompt injection via tool outputs is dangerous because:",
    options: ["It increases latency", "Malicious content in tool results can instruct the LLM to override its original task or system prompt", "It causes tool calls to fail", "Vector databases cannot sanitize inputs"],
    correct: 1, keywords: [],
    explanation: "If a tool returns attacker-controlled content (e.g., a webpage), that content is injected into the LLM context. Attackers can include instructions like 'Ignore previous instructions' which the LLM may follow.",
    readMore: { label: "Agent Security", tab: "agents" }
  },
  {
    id: "agents-10", topic: "agents", difficulty: "hard", type: "mcq",
    question: "Your agent consistently fails on tasks requiring more than 15 tool calls but succeeds on fewer than 8. The primary bottleneck is most likely:",
    options: ["The LLM API rate limit", "Compounding context length degradation — reasoning quality degrades as context accumulates", "Tool schemas are too complex", "Insufficient system prompt"],
    correct: 1, keywords: [],
    explanation: "Long-horizon tasks accumulate context that degrades LLM reasoning quality. At some threshold, earlier mistakes cascade. Solutions: periodic context summarization, subagent delegation.",
    readMore: { label: "Long-Horizon Agent Tasks", tab: "agents" }
  },
  {
    id: "agents-11", topic: "agents", difficulty: "hard", type: "text",
    question: "Compare ReAct, Reflexion, and Plan-and-Execute patterns. For each, name one task type where it outperforms the others and one where it fails.",
    options: null, correct: null,
    keywords: ["react", "reflexion", "plan", "execute", "reflect", "error", "long", "short", "self-critique"],
    explanation: "ReAct: good for exploratory short tasks, fails on long-horizon. Reflexion: good when failures have clear signals, fails when error diagnosis is ambiguous. Plan-and-Execute: good for structured workflows, fails on adaptive tasks requiring mid-plan revision.",
    readMore: { label: "Agent Architecture Patterns", tab: "agents" }
  },
  {
    id: "agents-12", topic: "agents", difficulty: "hard", type: "mcq",
    question: "An agent supervisor routes tasks to specialized subagents. Response quality regresses after adding a 5th subagent. Most likely reason?",
    options: ["5 agents exceed API limits", "Supervisor routing accuracy degrades as the decision space grows — it starts misrouting tasks", "Subagents conflict on shared memory", "Tool schemas are duplicated"],
    correct: 1, keywords: [],
    explanation: "Supervisor routing is essentially a classification task. As the number of agents grows, the classification problem becomes harder. Without explicit routing criteria, the supervisor starts making routing errors that compound.",
    readMore: { label: "Multi-Agent Orchestration", tab: "agents" }
  },

  // ── EVALUATION (11) ───────────────────────────────────────────────────────
  {
    id: "eval-1", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "You are evaluating a RAG system. ROUGE-L score is 0.71 but users report factual errors 40% of the time. Best explanation?",
    options: ["ROUGE measures word overlap not factual accuracy — high overlap does not mean correct facts", "Evaluation set is too small", "Model is hallucinating mid-sentence only", "Chunking is wrong"],
    correct: 0, keywords: [],
    explanation: "ROUGE measures n-gram overlap. A response can be high-ROUGE by using similar words while still asserting wrong facts. Factual accuracy requires separate evaluation: fact-checking or LLM-as-judge with factual decomposition.",
    readMore: { label: "Evaluation Metrics for RAG", tab: "groundtruth" }
  },
  {
    id: "eval-2", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "G-Eval scores your outputs at 4.2/5 consistently. What is the main risk of trusting this?",
    options: ["Model is biased toward longer outputs", "Positional bias — the LLM judge may score consistently high for stylistic reasons unrelated to actual quality", "G-Eval only works for summarization", "Token cost is too high"],
    correct: 1, keywords: [],
    explanation: "LLM-as-judge has known biases: verbosity bias, positional bias, self-preference bias. A consistently high score may indicate the judge is rewarding style rather than semantic accuracy. Calibration against human ratings is essential.",
    readMore: { label: "LLM-as-Judge Pitfalls", tab: "groundtruth" }
  },
  {
    id: "eval-3", topic: "evaluation", difficulty: "hard", type: "text",
    question: "You are building an eval suite for a customer support chatbot. Define 3 metrics, explain what each catches, and describe a case where each gives a false positive.",
    options: null, correct: null,
    keywords: ["groundedness", "relevance", "faithfulness", "false positive", "resolution", "tone"],
    explanation: "Good metrics: groundedness (catches hallucination but FP on well-phrased hallucinations), task completion (catches unhelpful responses but FP on technically-correct-but-useless answers), tone compliance (catches rude responses but FP on direct helpful answers scored as curt).",
    readMore: { label: "Building Eval Suites", tab: "groundtruth" }
  },
  {
    id: "eval-4", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "Your eval set has 200 questions from one domain. You ship a new model. Evals pass. Production CSAT drops. Why?",
    options: ["The eval set has too many questions", "Eval set does not represent the full distribution of production queries — distribution shift", "Model needs fine-tuning", "LLM judge was biased"],
    correct: 1, keywords: [],
    explanation: "An eval set sampled from one domain will miss out-of-distribution queries. Production has long-tail edge cases, adversarial inputs, and evolving language patterns not captured in a static narrow eval set.",
    readMore: { label: "Eval Set Design", tab: "groundtruth" }
  },
  {
    id: "eval-5", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "The difference between online and offline evaluation in LLM systems is:",
    options: ["Offline is faster", "Offline uses static test sets before deployment; online measures real user signals in production (CSAT, thumbs, task completion)", "Online evaluation uses better metrics", "They are interchangeable"],
    correct: 1, keywords: [],
    explanation: "Offline eval = pre-deployment, controlled, fast iteration. Online eval = post-deployment, real distribution, real user signals. Both are needed — a system can pass offline eval but fail online.",
    readMore: { label: "Eval Infrastructure", tab: "groundtruth" }
  },
  {
    id: "eval-6", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "You ask an LLM judge to rate responses 1-5. Inter-annotator agreement with humans is 0.61 (Cohen kappa). How should you interpret this?",
    options: ["Strong agreement — ship the judge", "Moderate agreement — use the judge for directional signals but not absolute quality gates", "Weak agreement — the judge is useless", "Good agreement but needs more data"],
    correct: 1, keywords: [],
    explanation: "Kappa 0.61 is moderate agreement. Use it for A/B comparisons and regression detection, not as an absolute correctness gate.",
    readMore: { label: "Evaluation Methodology", tab: "groundtruth" }
  },
  {
    id: "eval-7", topic: "evaluation", difficulty: "hard", type: "text",
    question: "Why is 'LLM-as-judge' unreliable for evaluating outputs of the same model family used for generation? What experimental design controls for this?",
    options: null, correct: null,
    keywords: ["self-preference", "same model", "bias", "independent", "different model", "human", "calibration"],
    explanation: "Models from the same family share training biases, leading to self-preference bias. Control: use a judge from a different model family, or blind human eval on a representative sample.",
    readMore: { label: "LLM-as-Judge Design", tab: "groundtruth" }
  },
  {
    id: "eval-8", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "RAGAS framework evaluates RAG systems on which 4 dimensions?",
    options: ["Precision, Recall, F1, Accuracy", "Faithfulness, Answer Relevancy, Context Precision, Context Recall", "Groundedness, Coherence, Fluency, Completeness", "Latency, Cost, Accuracy, Reliability"],
    correct: 1, keywords: [],
    explanation: "RAGAS: Faithfulness (claims grounded in context?), Answer Relevancy (does the answer address the question?), Context Precision (are retrieved docs relevant?), Context Recall (were relevant docs retrieved?).",
    readMore: { label: "RAGAS Framework", tab: "groundtruth" }
  },
  {
    id: "eval-9", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "You run an A/B test. Version B has +12% groundedness but -8% answer relevancy. You should:",
    options: ["Ship B — groundedness is more important", "Roll back to A", "Investigate whether the relevancy drop is in a critical query category before deciding", "Run more tests"],
    correct: 2, keywords: [],
    explanation: "Aggregate metrics hide per-category behavior. A -8% relevancy drop might be uniformly small or concentrated in high-value query types. Always decompose metric changes by query category before shipping.",
    readMore: { label: "A/B Testing RAG Systems", tab: "groundtruth" }
  },
  {
    id: "eval-10", topic: "evaluation", difficulty: "hard", type: "text",
    question: "Your team is debating whether to use GPT-4o or Claude Sonnet as the LLM judge for your eval pipeline. What criteria should drive this decision?",
    options: null, correct: null,
    keywords: ["independent", "calibration", "bias", "cost", "speed", "human agreement", "family"],
    explanation: "Key criteria: avoid same-family models (self-preference bias), measure calibration against held-out human labels, cost/speed tradeoff, consistency across runs (temperature=0), structured output support.",
    readMore: { label: "Choosing an LLM Judge", tab: "groundtruth" }
  },
  {
    id: "eval-11", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "Evals pass on your golden dataset but fail on a newly collected adversarial set. The correct production response is:",
    options: ["Discard the adversarial set as outliers", "Add representative adversarial examples to your eval suite and treat it as a permanent regression category", "Switch to a bigger model", "Increase temperature"],
    correct: 1, keywords: [],
    explanation: "Golden datasets calcify. Production evolves. Adversarial failures reveal real distribution gaps. Incorporate them into your eval suite so future regressions are caught before deployment.",
    readMore: { label: "Adversarial Evals", tab: "groundtruth" }
  },

  // ── LLMOPS (11) ───────────────────────────────────────────────────────────
  {
    id: "llmops-1", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Your LLM API p99 latency is 4.2s. Users are complaining. The first optimization to try (before switching models) is:",
    options: ["Increase server count", "Streaming responses — let users see tokens as they generate, reducing perceived wait time", "Reduce prompt length", "Switch to a smaller model"],
    correct: 1, keywords: [],
    explanation: "Streaming does not reduce actual latency but dramatically reduces perceived latency. Users start reading at first token. This is the cheapest win and should always precede model changes.",
    readMore: { label: "LLMOps Latency Patterns", tab: "systems" }
  },
  {
    id: "llmops-2", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "You are spending $12K/month on LLM API calls. The single most impactful cost reduction technique (without degrading quality) is typically:",
    options: ["Switch to open source models", "Semantic caching — serve identical or near-identical queries from cache instead of re-calling the API", "Reduce max_tokens", "Use smaller context windows"],
    correct: 1, keywords: [],
    explanation: "Semantic caching catches repeated or near-identical queries and returns cached results. Hit rates of 20-40% are typical, directly reducing API spend proportionally.",
    readMore: { label: "Cost Optimization for LLMs", tab: "systems" }
  },
  {
    id: "llmops-3", topic: "llmops", difficulty: "hard", type: "text",
    question: "Describe a complete observability stack for a production RAG system. What signals would you instrument, and what alert would you write for each?",
    options: null, correct: null,
    keywords: ["trace", "latency", "groundedness", "retrieval", "error", "alert", "monitor", "p99", "cost"],
    explanation: "Key signals: TTFT (alert if p99 > threshold), retrieval latency, groundedness score distribution (alert if mean drops >5% WoW), error rate spike, cost per query budget breach, null retrieval rate.",
    readMore: { label: "LLM Observability", tab: "systems" }
  },
  {
    id: "llmops-4", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Speculative decoding improves LLM inference throughput by:",
    options: ["Using a larger model for important tokens only", "Using a small draft model to generate candidate tokens, verified in parallel by the large model", "Caching KV states across requests", "Quantizing the model weights"],
    correct: 1, keywords: [],
    explanation: "A small draft model generates N candidate tokens quickly. The large model verifies them in one forward pass. Net result: 2-3x throughput improvement on suitable workloads.",
    readMore: { label: "Inference Optimization", tab: "systems" }
  },
  {
    id: "llmops-5", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "You deploy a new model version. All evals pass. Production error rate spikes 3x in 2 hours. First diagnostic step?",
    options: ["Roll back immediately", "Check if the spike is correlated with specific query types, time of day, or a new user segment before rolling back", "Scale up servers", "Check API quota"],
    correct: 1, keywords: [],
    explanation: "A targeted error spike might be from a specific query category. Understanding the cause before rollback enables either a targeted fix or a confident rollback decision with a known root cause.",
    readMore: { label: "Incident Response for LLM Systems", tab: "systems" }
  },
  {
    id: "llmops-6", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "KV cache eviction in long-context inference primarily causes:",
    options: ["Model to forget early context, degrading response quality for queries requiring full-document understanding", "Increased token generation speed", "Reduced memory footprint", "Better instruction following"],
    correct: 0, keywords: [],
    explanation: "KV cache stores computed attention keys/values. When evicted, the model loses access to that context. For long documents requiring full-context reasoning, this causes quality degradation.",
    readMore: { label: "Inference Architecture", tab: "systems" }
  },
  {
    id: "llmops-7", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "You are running batch inference on 10,000 documents. The most cost-effective approach vs. real-time API is:",
    options: ["Use more API keys to parallelize", "Use batch API endpoints (e.g., OpenAI Batch API) — typically 50% cheaper at the cost of higher latency", "Run 24/7 to distribute cost", "Use streaming to reduce memory"],
    correct: 1, keywords: [],
    explanation: "Batch APIs process requests asynchronously (24h window) at half the per-token price. For non-latency-sensitive workloads like document processing, this is the dominant cost-saving strategy.",
    readMore: { label: "LLM Cost Optimization", tab: "systems" }
  },
  {
    id: "llmops-8", topic: "llmops", difficulty: "hard", type: "text",
    question: "Your LLM feature launches. Token cost per user is $0.023. Business wants to scale to 1M DAU. Walk through your cost reduction roadmap in priority order.",
    options: null, correct: null,
    keywords: ["cache", "smaller model", "prompt", "quantiz", "fine-tun", "batch", "distill"],
    explanation: "Priority: (1) semantic caching, (2) prompt optimization/compression, (3) route simple queries to smaller models, (4) quantized models for self-hosted inference, (5) fine-tune smaller model to match large model quality, (6) batch non-latency-sensitive ops.",
    readMore: { label: "LLM Cost at Scale", tab: "systems" }
  },
  {
    id: "llmops-9", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Continuous batching in LLM serving (vs. static batching) improves GPU utilization because:",
    options: ["It uses larger batch sizes", "Completed sequences are immediately replaced with new requests — GPU never idles waiting for slowest sequence in batch", "It reduces memory usage per request", "It enables multi-GPU inference"],
    correct: 1, keywords: [],
    explanation: "Static batching waits for all sequences to finish before processing the next batch — GPU idles as some sequences finish early. Continuous batching inserts new requests the moment a slot frees.",
    readMore: { label: "vLLM and Inference Servers", tab: "systems" }
  },
  {
    id: "llmops-10", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "You are choosing between prompt caching and fine-tuning to reduce cost for a system with a 4000-token system prompt used on every request. Correct analysis?",
    options: ["Always fine-tune for cost savings", "Prompt caching eliminates redundant computation on the static system prompt — often better ROI for long static prefixes than fine-tuning", "They solve the same problem", "Fine-tuning is always cheaper"],
    correct: 1, keywords: [],
    explanation: "Prompt caching (Anthropic, OpenAI) caches KV computations for static prefix tokens. A 4000-token system prompt cached = 4000 tokens not computed per request. Fine-tuning bakes knowledge into weights but still incurs all inference costs.",
    readMore: { label: "Prompt Caching Strategies", tab: "systems" }
  },
  {
    id: "llmops-11", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Shadow deployment (running new model in parallel, not serving its output to users) primarily helps with:",
    options: ["Reducing API costs", "Safe quality validation under real traffic distribution before cutover — catches distribution-specific regressions evals missed", "Improving model speed", "A/B testing user preferences"],
    correct: 1, keywords: [],
    explanation: "Shadow deployment lets you run both models on real traffic, compare outputs offline, and catch regressions that your eval set did not cover — all without any user impact.",
    readMore: { label: "Model Deployment Strategies", tab: "systems" }
  },

  // ── FINETUNING (5) ────────────────────────────────────────────────────────
  {
    id: "ft-1", topic: "finetuning", difficulty: "hard", type: "mcq",
    question: "You fine-tune a model on 10,000 customer support examples. Benchmark accuracy improves but production CSAT drops. Most likely cause?",
    options: ["Model overfits to benchmark format not real user queries", "Fine-tuning is always wrong for support", "Not enough training data", "Learning rate too high"],
    correct: 0, keywords: [],
    explanation: "Fine-tuning on curated benchmark-style examples can cause the model to optimize for the format/style of those examples rather than the messy, varied real-user queries. Benchmark and production distributions diverge.",
    readMore: { label: "Fine-Tuning Best Practices", tab: "concepts" }
  },
  {
    id: "ft-2", topic: "finetuning", difficulty: "hard", type: "mcq",
    question: "LoRA fine-tuning works by:",
    options: ["Updating all model weights with a low learning rate", "Injecting low-rank decomposition matrices alongside frozen original weights — only adapters are trained", "Distilling knowledge from a larger model", "Pruning unused attention heads"],
    correct: 1, keywords: [],
    explanation: "LoRA freezes original weights and trains two small matrices (A and B) whose product is added to frozen weight updates. Dramatic reduction in trainable parameters (typically 0.1-1% of original) with competitive quality.",
    readMore: { label: "Parameter-Efficient Fine-Tuning", tab: "concepts" }
  },
  {
    id: "ft-3", topic: "finetuning", difficulty: "hard", type: "mcq",
    question: "DPO (Direct Preference Optimization) differs from RLHF in that:",
    options: ["DPO uses a separate reward model trained first", "DPO reformulates the RL objective into a supervised loss directly on preference pairs — no explicit reward model needed", "DPO is only for small models", "They are mathematically equivalent"],
    correct: 1, keywords: [],
    explanation: "RLHF trains a reward model, then uses PPO — complex and unstable. DPO derives a closed-form loss from preference data (chosen vs. rejected pairs). Simpler, more stable, comparable results.",
    readMore: { label: "RLHF vs DPO", tab: "concepts" }
  },
  {
    id: "ft-4", topic: "finetuning", difficulty: "hard", type: "text",
    question: "When should you fine-tune vs. few-shot prompt vs. RAG for a task involving specialized domain knowledge? Provide criteria for each choice.",
    options: null, correct: null,
    keywords: ["fine-tune", "few-shot", "rag", "update", "static", "knowledge", "format", "style"],
    explanation: "RAG: dynamic knowledge that updates frequently, source attribution needed. Few-shot: small behavioral shift, quick iteration. Fine-tuning: stable domain knowledge where latency/cost of long prompts is prohibitive.",
    readMore: { label: "Fine-Tuning vs RAG", tab: "concepts" }
  },
  {
    id: "ft-5", topic: "finetuning", difficulty: "hard", type: "mcq",
    question: "Catastrophic forgetting in fine-tuning refers to:",
    options: ["Model forgetting to follow format instructions", "Fine-tuned model losing general capabilities due to weight updates overwriting prior knowledge", "Training loss not converging", "Forgetting the system prompt"],
    correct: 1, keywords: [],
    explanation: "Fine-tuning on a narrow dataset can overwrite the distributed representations that encode general world knowledge and instruction following. The model excels at the target task but regresses on everything else.",
    readMore: { label: "Fine-Tuning Risks", tab: "concepts" }
  },

  // ── SAFETY (5) ────────────────────────────────────────────────────────────
  {
    id: "safety-1", topic: "safety", difficulty: "hard", type: "mcq",
    question: "Indirect prompt injection differs from direct prompt injection because:",
    options: ["Indirect is less dangerous", "The malicious instructions arrive via external data sources (tool outputs, retrieved documents) not from the user directly", "Direct injection exploits fine-tuning", "They are the same attack"],
    correct: 1, keywords: [],
    explanation: "Direct injection: user writes 'ignore system prompt.' Indirect: attacker embeds instructions in a webpage or document that the agent retrieves — the LLM executes attacker instructions while the user is unaware.",
    readMore: { label: "LLM Security", tab: "agents" }
  },
  {
    id: "safety-2", topic: "safety", difficulty: "hard", type: "mcq",
    question: "Constitutional AI (CAI) improves model safety by:",
    options: ["Filtering training data for harmful content only", "Having the model self-critique and revise responses against a set of principles before generating a final answer", "Using human annotators exclusively", "Adding safety classifiers at inference time"],
    correct: 1, keywords: [],
    explanation: "CAI (Anthropic) has the model generate an initial response, critique it against principles (the constitution), then revise. This bakes safety reasoning into the generation process.",
    readMore: { label: "Safety Techniques", tab: "concepts" }
  },
  {
    id: "safety-3", topic: "safety", difficulty: "hard", type: "text",
    question: "Design a red-teaming protocol for a customer-facing LLM product. What categories would you test, how would you generate attack prompts, and what metrics would you use?",
    options: null, correct: null,
    keywords: ["jailbreak", "injection", "harmful", "refusal", "false positive", "adversarial", "category"],
    explanation: "Categories: jailbreaks, indirect injection, PII extraction, harmful content elicitation, false refusals. Generate prompts via: human red-teamers, adversarial LLM generation, fuzzing. Metrics: attack success rate, false refusal rate, harm severity distribution.",
    readMore: { label: "Red-Teaming LLMs", tab: "concepts" }
  },
  {
    id: "safety-4", topic: "safety", difficulty: "hard", type: "mcq",
    question: "A guardrail system that blocks 100% of harmful outputs and has a 0% false positive rate is:",
    options: ["The ideal production target", "Theoretically impossible — safety and utility are in tension; aggressive filters increase false positives on legitimate queries", "Achievable with enough compute", "Only possible with fine-tuning"],
    correct: 1, keywords: [],
    explanation: "Safety is a precision-recall tradeoff. A filter that blocks everything has 100% recall on harm but 0% precision. Real systems must balance false negatives vs. false positives.",
    readMore: { label: "Safety System Design", tab: "concepts" }
  },
  {
    id: "safety-5", topic: "safety", difficulty: "hard", type: "mcq",
    question: "Alignment tax refers to:",
    options: ["The financial cost of safety training", "The performance degradation on capability benchmarks that can result from RLHF/safety fine-tuning", "Regulatory compliance costs", "GPU cost for safety classifiers"],
    correct: 1, keywords: [],
    explanation: "Safety alignment techniques (RLHF, CAI) can reduce model performance on reasoning, math, and coding benchmarks. Minimizing this tradeoff is an active research area.",
    readMore: { label: "Alignment Tradeoffs", tab: "concepts" }
  },

  // ── PRODUCT (5) ───────────────────────────────────────────────────────────
  {
    id: "product-1", topic: "product", difficulty: "hard", type: "mcq",
    question: "You are writing a PRD for an LLM feature. The most important metric to define before building is:",
    options: ["Token cost per query", "The primary success metric tied to user value (task completion rate, CSAT) and the guardrail metric that cannot regress", "API response time", "Number of features in v1"],
    correct: 1, keywords: [],
    explanation: "PRDs without defined success and guardrail metrics lead to teams optimizing the wrong thing. The primary metric must be tied to user value. The guardrail metric prevents optimizing the primary metric in ways that violate core requirements.",
    readMore: { label: "AI Product Management", tab: "concepts" }
  },
  {
    id: "product-2", topic: "product", difficulty: "hard", type: "text",
    question: "A stakeholder says 'we should add AI to our search.' What questions do you ask to decide whether this is worth building?",
    options: null, correct: null,
    keywords: ["baseline", "metric", "user", "problem", "cost", "latency", "alternative", "success"],
    explanation: "Key questions: What problem are users actually having? What does the current baseline look like? What metric improves? What is the cost per query vs. revenue impact? What is the latency SLA? Have we validated users want conversational vs. keyword search?",
    readMore: { label: "AI Product Strategy", tab: "concepts" }
  },
  {
    id: "product-3", topic: "product", difficulty: "hard", type: "mcq",
    question: "Your LLM feature has 78% user satisfaction. Leadership wants 90%. The first thing you should do is:",
    options: ["Switch to a better LLM", "Analyze the 22% dissatisfied sessions to identify failure patterns before any model changes", "Add more examples to the prompt", "Reduce response length"],
    correct: 1, keywords: [],
    explanation: "Dissatisfied sessions contain the actual failure modes. Without analyzing them, any change is guesswork. You might find the dissatisfaction is concentrated in one query type or triggered by a specific phrasing.",
    readMore: { label: "AI Product Iteration", tab: "concepts" }
  },
  {
    id: "product-4", topic: "product", difficulty: "hard", type: "mcq",
    question: "The right way to define 'done' for an LLM feature A/B test is:",
    options: ["When the test reaches 1000 users", "When you have statistical significance on the primary metric with a pre-specified MDE, guardrail metrics have not regressed, and the test has run long enough to capture weekly seasonality", "When the new version looks better", "After 2 weeks"],
    correct: 1, keywords: [],
    explanation: "A/B tests need pre-specified MDE, significance threshold, and duration including at least one weekly cycle. Guardrail metrics must be checked — a significant primary metric win is invalid if it came at the cost of a guardrail regression.",
    readMore: { label: "Experimentation for AI Products", tab: "concepts" }
  },
  {
    id: "product-5", topic: "product", difficulty: "hard", type: "text",
    question: "You are the PM for a coding assistant. Define the north star metric, 3 supporting metrics, and 2 guardrail metrics. Explain your reasoning for each.",
    options: null, correct: null,
    keywords: ["acceptance", "completion", "north star", "guardrail", "safety", "latency", "retention", "session"],
    explanation: "North star: code suggestion acceptance rate. Supporting: sessions with 1+ accepted suggestion, time-to-first-suggestion, multi-line acceptance rate. Guardrails: code security scan failure rate, TTFT p99.",
    readMore: { label: "AI Product Metrics", tab: "concepts" }
  },

  // ── BEHAVIORAL (6) ────────────────────────────────────────────────────────
  {
    id: "beh-1", topic: "behavioral", difficulty: "medium", type: "text",
    question: "Tell me about a time you had to push back on a stakeholder request. How did you frame the pushback and what was the outcome?",
    options: null, correct: null,
    keywords: ["data", "risk", "alternative", "outcome", "stakeholder", "reason", "impact"],
    explanation: "Strong answers: lead with shared goal, present data supporting pushback, offer alternative path to the underlying need, own the decision outcome whether it was accepted or overridden.",
    readMore: null
  },
  {
    id: "beh-2", topic: "behavioral", difficulty: "medium", type: "text",
    question: "Describe a situation where a project you owned failed. What was your role in the failure and what did you change afterward?",
    options: null, correct: null,
    keywords: ["own", "responsible", "learn", "change", "mistake", "process", "retrospect"],
    explanation: "Strong answers show genuine ownership, specific causal analysis, concrete behavior change. Avoid: vague 'team failed', overly positive framing, no actual lesson.",
    readMore: null
  },
  {
    id: "beh-3", topic: "behavioral", difficulty: "medium", type: "text",
    question: "How do you handle disagreement with a technical direction that has already been decided by leadership above you?",
    options: null, correct: null,
    keywords: ["disagree", "commit", "voice", "evidence", "escalat", "team", "execute"],
    explanation: "Best answer: disagree-and-commit framing — voice concern once with evidence, understand if decision is final, commit fully once decided, document your concern for retrospective review.",
    readMore: null
  },
  {
    id: "beh-4", topic: "behavioral", difficulty: "medium", type: "text",
    question: "You are the only ML engineer on a cross-functional team. The PM keeps assigning you ad-hoc data analysis tasks unrelated to your core ML work. How do you handle this?",
    options: null, correct: null,
    keywords: ["priority", "scope", "tradeoff", "communicate", "bandwidth", "escalat", "negotiate"],
    explanation: "Strong answer: proactively communicate capacity and competing priorities, make tradeoffs explicit with impact framing, propose solutions (automate the analysis, route to data analyst, timebox).",
    readMore: null
  },
  {
    id: "beh-5", topic: "behavioral", difficulty: "medium", type: "text",
    question: "Describe how you have mentored someone junior. What specifically did you do to accelerate their growth?",
    options: null, correct: null,
    keywords: ["mentor", "grow", "feedback", "project", "stretch", "skill", "specific", "outcome"],
    explanation: "Strong answers are specific: what was the person's starting point, what deliberate interventions (stretch assignments, code review, 1:1 structure, feedback cadence), what was the measurable outcome.",
    readMore: null
  },
  {
    id: "beh-6", topic: "behavioral", difficulty: "medium", type: "text",
    question: "You discover a critical bug in production at 4pm Friday that affects 5% of users. Your manager is offline. Walk through your decision-making.",
    options: null, correct: null,
    keywords: ["severity", "rollback", "communicate", "escalat", "fix", "monitor", "document"],
    explanation: "Strong answer: assess impact severity and blast radius first, determine fastest mitigation (rollback vs. hotfix), communicate to affected stakeholders immediately, escalate appropriately, document timeline for postmortem.",
    readMore: null
  },

  // ── MULTIMODAL (5) ────────────────────────────────────────────────────────
  {
    id: "mm-1", topic: "multimodal", difficulty: "medium", type: "mcq",
    question: "A GPT-4o call with a 1024×1024 image in 'high detail' mode uses approximately how many image tokens?",
    options: ["85 tokens", "512 tokens", "~1700 tokens", "4096 tokens"],
    correct: 2, keywords: [],
    explanation: "High-detail mode tiles the image into 512×512 sub-images. A 1024×1024 image produces 4 tiles × ~340 tokens each ≈ 1700 tokens plus the base 85 for a low-res overview. Image token cost is a critical budget consideration.",
    readMore: { label: "Multimodal AI →", tab: "systems" }
  },
  {
    id: "mm-2", topic: "multimodal", difficulty: "hard", type: "mcq",
    question: "Your multimodal RAG system retrieves images by text query but misses relevant charts with no caption text. Best fix?",
    options: ["Increase top_k", "Switch to CLIP-based cross-modal retrieval or pre-generate captions for all images", "Use a larger LLM", "Add OCR to all images"],
    correct: 1, keywords: [],
    explanation: "Text-only vector search can't find uncaptioned images because there's no text to embed. CLIP embeds images and text in a shared space — enabling text query to retrieve visually similar images. Captioning is simpler but loses visual detail the caption doesn't describe.",
    readMore: { label: "Multimodal RAG patterns →", tab: "systems" }
  },
  {
    id: "mm-3", topic: "multimodal", difficulty: "medium", type: "mcq",
    question: "Which task will a vision LLM reliably fail at even with a clear image?",
    options: ["Describing the scene", "Reading large text in the image", "Counting 23 specific objects", "Identifying dominant colors"],
    correct: 2, keywords: [],
    explanation: "Object counting is a known failure mode. Attention mechanisms don't track discrete instances — models approximate and consistently over/undercount beyond ~5 objects. Use a dedicated detection model (YOLO) for counting tasks.",
    readMore: { label: "Multimodal failure modes →", tab: "systems" }
  },
  {
    id: "mm-4", topic: "multimodal", difficulty: "hard", type: "mcq",
    question: "What architectural innovation makes GPT-4o different from GPT-4V?",
    options: ["Larger parameter count", "End-to-end native multimodal training vs. a separate vision encoder bolted on", "Bigger context window", "RLHF on image preferences"],
    correct: 1, keywords: [],
    explanation: "GPT-4V used a separate vision encoder whose output was injected as text tokens. GPT-4o is trained natively on all modalities simultaneously — giving it unified audio/image/text understanding and enabling real-time voice without a pipeline.",
    readMore: { label: "GPT-4o Deep Dive →", tab: "groundtruth" }
  },
  {
    id: "mm-5", topic: "multimodal", difficulty: "medium", type: "mcq",
    question: "ColPali is better than CLIP for document retrieval because:",
    options: ["It's faster at inference", "It embeds whole document pages as visual token sequences — no OCR step needed, captures layout and charts", "It has a larger vocabulary", "It uses BM25 ranking"],
    correct: 1, keywords: [],
    explanation: "ColPali (based on PaliGemma) encodes full document pages as image patches, capturing text, layout, charts, and tables together. CLIP struggles with fine-grained text. The tradeoff: ColPali is slower and newer with less tooling.",
    readMore: { label: "Multimodal RAG patterns →", tab: "systems" }
  },

  // ── REASONING MODELS (5) ──────────────────────────────────────────────────
  {
    id: "rsn-1", topic: "reasoning", difficulty: "medium", type: "mcq",
    question: "A reasoning model with a 32K thinking budget takes 25s to respond. Which production pattern best hides this from users?",
    options: ["Reduce thinking budget to 1K tokens", "Stream a live 'thinking...' indicator with elapsed time while reasoning runs", "Cache all responses", "Use a faster model instead"],
    correct: 1, keywords: [],
    explanation: "Users tolerate latency much better when they see visible progress. Streaming 'thinking...' with elapsed time manages perception. Reducing thinking budget trades quality for speed — only correct if your accuracy analysis shows the lower budget is sufficient.",
    readMore: { label: "Reasoning Models Lab →", tab: "systems" }
  },
  {
    id: "rsn-2", topic: "reasoning", difficulty: "hard", type: "mcq",
    question: "Which task type gets the LEAST benefit from a reasoning model vs. standard GPT-4o?",
    options: ["Competitive programming", "Multi-step mathematical proofs", "Sentiment classification on customer reviews", "Complex legal contract analysis"],
    correct: 2, keywords: [],
    explanation: "Sentiment classification is a pattern-matching task with no multi-step reasoning requirement. A fine-tuned small model beats o3 at 100× lower cost. Reasoning models shine on tasks requiring planning, backtracking, and checking multiple sub-conditions.",
    readMore: { label: "When to use reasoning models →", tab: "systems" }
  },
  {
    id: "rsn-3", topic: "reasoning", difficulty: "hard", type: "mcq",
    question: "Your LLM pipeline costs $8K/month. You want to add reasoning models for hard queries. Best cost-control architecture?",
    options: ["Replace all calls with o3", "Classify query difficulty first; route only high-complexity queries to reasoning model, simple ones to GPT-4o", "Use reasoning models at low thinking budget for everything", "Cache reasoning model responses"],
    correct: 1, keywords: [],
    explanation: "Confidence-based routing is the highest-ROI optimization. A fast classifier identifies the ~30% of queries that actually need deep reasoning. The other 70% use the cheap standard model. This typically delivers 90%+ of reasoning model quality at 30–40% of cost.",
    readMore: { label: "Reasoning model economics →", tab: "systems" }
  },
  {
    id: "rsn-4", topic: "reasoning", difficulty: "medium", type: "mcq",
    question: "Reasoning models have 'hidden scratchpad' tokens. What does this mean practically for billing?",
    options: ["You're not billed for thinking tokens", "Thinking tokens are billed at the same rate as output tokens even though they're not shown to the user", "Thinking is free up to 16K tokens", "Only Claude charges for thinking tokens"],
    correct: 1, keywords: [],
    explanation: "Thinking tokens are real compute — billed at the model's output token rate regardless of whether they appear in the response. A 32K thinking budget can add $0.48+ to a single o3 call. Budget your thinking token allocation as carefully as output tokens.",
    readMore: { label: "Thinking budget deep dive →", tab: "systems" }
  },
  {
    id: "rsn-5", topic: "reasoning", difficulty: "medium", type: "mcq",
    question: "What is the key architectural difference between o1/o3 (OpenAI) and Claude Extended Thinking (Anthropic)?",
    options: ["o1 is larger", "Claude's thinking is visible to the developer; o1's chain-of-thought is completely hidden", "o3 supports more tools", "Extended thinking only works on Claude Opus"],
    correct: 1, keywords: [],
    explanation: "OpenAI hides the full reasoning trace — you see the summary answer. Anthropic exposes the thinking tokens in the API response, which helps with debugging agent failures and building user trust. Different transparency philosophy with real production implications.",
    readMore: { label: "Claude vs GPT-4o deep dive →", tab: "groundtruth" }
  },

  // ── MCP + RELIABILITY (agents) (4) ────────────────────────────────────────
  {
    id: "mcp-q1", topic: "agents", difficulty: "medium", type: "mcq",
    question: "What problem does MCP solve that function calling alone doesn't?",
    options: ["Faster inference", "N×M integration problem — one MCP server works with any host; function calling requires per-application definitions", "Better JSON schemas", "Access to GPT-4o tools"],
    correct: 1, keywords: [],
    explanation: "Without MCP: N models × M tools = N×M integrations. With MCP: each tool builds one server, each model builds one client = N+M. MCP also adds Resources (data access) and dynamic tool discovery — things function calling doesn't support.",
    readMore: { label: "MCP Deep Dive →", tab: "agents" }
  },
  {
    id: "mcp-q2", topic: "agents", difficulty: "hard", type: "mcq",
    question: "Your production agent calls the same tool with identical arguments 4 times in a row. Root cause?",
    options: ["Tool is slow", "Agent is in an infinite loop — tool output isn't satisfying the reasoning step, causing repeated attempts", "Network timeout", "Temperature too high"],
    correct: 1, keywords: [],
    explanation: "Repeated identical tool calls is the canonical infinite loop signal. The tool's output format or content doesn't match what the LLM's reasoning expects — so it retries. Fix: duplicate-call detection (hash tool+args), inject loop-break prompt, or surface to human after 3 identical calls.",
    readMore: { label: "Agentic Reliability →", tab: "agents" }
  },
  {
    id: "rel-q1", topic: "agents", difficulty: "hard", type: "mcq",
    question: "Which agentic reliability pattern prevents an agent from deleting 47 files when asked to clean up 'temp files'?",
    options: ["Step budget", "Least-privilege tool access + confirmation gate before irreversible actions", "Context pruning", "Self-critique loop"],
    correct: 1, keywords: [],
    explanation: "Scope creep (taking actions outside intended scope) is prevented by: (1) only giving the agent access to tools/resources needed for the task, (2) requiring human confirmation before irreversible actions like delete. Step budget limits iterations but doesn't prevent destructive single actions.",
    readMore: { label: "Agentic Reliability →", tab: "agents" }
  },
  {
    id: "rel-q2", topic: "agents", difficulty: "medium", type: "mcq",
    question: "What is 'tool output confabulation' in an agentic system?",
    options: ["The tool crashes", "The agent incorrectly 'remembers' what a tool returned, especially after many steps in a long context", "The tool returns JSON the agent can't parse", "The tool call exceeds timeout"],
    correct: 1, keywords: [],
    explanation: "After 10+ steps, LLM context is long and attention degrades on early tool outputs. The agent may assert facts from tool outputs that don't match what was actually returned. Mitigation: periodically re-anchor with a summary of confirmed facts, keep context under 40K tokens for agents.",
    readMore: { label: "Agentic Reliability →", tab: "agents" }
  },

  // ── STRUCTURED OUTPUTS + CONTEXT (llmops + rag) (5) ──────────────────────
  {
    id: "so-q1", topic: "llmops", difficulty: "medium", type: "mcq",
    question: "JSON mode vs. tool/function calling for structured output — key difference?",
    options: ["JSON mode is faster", "JSON mode guarantees valid JSON but NOT schema compliance; tool calling enforces the schema exactly", "Tool calling only works with OpenAI", "JSON mode supports nested objects better"],
    correct: 1, keywords: [],
    explanation: "JSON mode gives you syntactically valid JSON — the model may still omit required fields, add unexpected fields, or use wrong types. Tool calling forces the model to call a function matching a specific schema — highest reliability for production structured extraction.",
    readMore: { label: "Structured Outputs →", tab: "systems" }
  },
  {
    id: "so-q2", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Your structured extraction pipeline has a 4% validation failure rate in production. Best first action?",
    options: ["Switch to a larger model", "Log all failures with input+output, categorize by failure type (schema drift, type error, truncation), fix the top category", "Increase max_tokens", "Add more examples to the prompt"],
    correct: 1, keywords: [],
    explanation: "4% failure rate is high but diagnosable. Without logging, you're guessing. Categorizing failures by type reveals whether you need: retry logic (schema drift), type coercion (type errors), bigger max_tokens (truncation), or schema simplification. Each has a different fix.",
    readMore: { label: "Structured Outputs →", tab: "systems" }
  },
  {
    id: "ctx-q1", topic: "rag", difficulty: "hard", type: "mcq",
    question: "Gemini 1.5 has 1M token context. When should you still use RAG instead of stuffing the whole corpus?",
    options: ["Never — 1M context makes RAG obsolete", "When corpus is larger than 1M tokens, dynamically updated, or cost/latency constraints make full-context inference infeasible", "Only when using Claude", "When documents are in PDF format"],
    correct: 1, keywords: [],
    explanation: "1M context is transformative but not universal. Corpora often exceed 1M tokens; real-time/user-specific data changes faster than you can ingest; processing 1M tokens costs 50–200× a RAG call; TTFT for 1M contexts adds seconds. RAG remains essential for dynamic, large, or cost-sensitive workloads.",
    readMore: { label: "Context Window Engineering →", tab: "systems" }
  },
  {
    id: "ctx-q2", topic: "rag", difficulty: "medium", type: "mcq",
    question: "The 'lost in the middle' problem means:",
    options: ["Documents in the middle of a retrieval list are never returned", "LLMs pay less attention to content positioned in the middle of a long context — information there is systematically underweighted", "Context windows corrupt text in the center", "Chunking cuts sentences in half"],
    correct: 1, keywords: [],
    explanation: "Liu et al. (2023) showed recall drops from ~92% at context start/end to ~42–51% for content positioned in the middle. Fix: put most critical content at start or end, use reranking to place high-relevance chunks at position 1 or last, use map-reduce for long corpora.",
    readMore: { label: "Context Window Engineering →", tab: "systems" }
  },

  // ── DEPLOYMENT + SYNTHETIC DATA (llmops + finetuning) (5) ────────────────
  {
    id: "dep-q1", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Continuous batching improves LLM serving throughput by:",
    options: ["Running inference in parallel on multiple GPUs", "Allowing new requests to join mid-generation — no request waits for a full batch to complete", "Pre-caching all KV states", "Reducing model size"],
    correct: 1, keywords: [],
    explanation: "Traditional static batching waits for all batch members to finish. Continuous batching (used in vLLM, TGI) adds new requests at the token level when GPU has capacity — achieving 10–20× better throughput than no batching, with near-optimal latency for interactive workloads.",
    readMore: { label: "Deployment Architecture →", tab: "systems" }
  },
  {
    id: "dep-q2", topic: "llmops", difficulty: "medium", type: "mcq",
    question: "When does self-hosting Llama 3.1 70B become more cost-effective than OpenAI API?",
    options: ["Always — open source is always cheaper", "Never — managed APIs scale better", "At approximately $50K+/month API spend where GPU costs justify the engineering overhead", "When you have more than 100 users"],
    correct: 2, keywords: [],
    explanation: "Below ~$50K/month API spend, engineering cost (infra setup, monitoring, ops) exceeds savings. Above that threshold, self-hosting on dedicated A100/H100 GPUs typically costs 70–90% less per token. The crossover depends on team size, traffic predictability, and data privacy requirements.",
    readMore: { label: "Llama Deep Dive →", tab: "groundtruth" }
  },
  {
    id: "syn-q1", topic: "finetuning", difficulty: "hard", type: "mcq",
    question: "LLM-as-judge filtering in synthetic data generation keeps approximately what fraction of generated data?",
    options: ["95%+ — judge only removes clearly bad examples", "50–70% — significant portion fails quality threshold when judged rigorously", "10–20% — most LLM-generated data is low quality", "100% — the generator and judge use the same model"],
    correct: 1, keywords: [],
    explanation: "With a quality threshold of ~0.75/1.0, rigorous LLM-as-judge filtering typically keeps 50–70% of generated data. This is desirable — removing noisy examples reduces overfitting and improves fine-tuning outcomes. The goal is quality over quantity.",
    readMore: { label: "Synthetic Data →", tab: "systems" }
  },
  {
    id: "syn-q2", topic: "finetuning", difficulty: "medium", type: "mcq",
    question: "What is Evol-Instruct and why does it produce better fine-tuning data than flat self-instruct?",
    options: ["It uses evolutionary algorithms to train the model", "It iteratively makes simple instructions more complex — creating a difficulty gradient that trains models to handle hard instructions", "It generates instructions in multiple languages", "It deduplicates by evolutionary distance"],
    correct: 1, keywords: [],
    explanation: "Flat self-instruct generates diverse but similarly-difficulty instructions. Evol-Instruct evolves each instruction into harder versions (add constraints, add error handling, add edge cases). The resulting dataset has a difficulty gradient — models trained on it generalize better to hard real-world inputs. Used to train WizardCoder and WizardLM.",
    readMore: { label: "Synthetic Data →", tab: "systems" }
  },
  {
    id: "arch-q1", topic: "finetuning", difficulty: "medium", type: "mcq",
    question: "Why do modern LLMs (GPT-4o, Claude, Llama) use decoder-only architecture instead of the original encoder-decoder?",
    options: ["Decoder-only is cheaper to build", "Decoder-only scales more efficiently — simpler training objective (next-token prediction), no encoder bottleneck, stronger emergent few-shot abilities at scale", "Encoder-decoder can't do generation", "Patents prevent encoder-decoder use"],
    correct: 1, keywords: [],
    explanation: "After GPT-2/3 demonstrated that decoder-only models develop powerful emergent abilities through scale, the field converged on this architecture. The autoregressive next-token objective is simpler to optimize at scale, there's no cross-attention bottleneck between encoder/decoder, and the architecture naturally supports few-shot prompting.",
    readMore: { label: "Transformer Architecture →", tab: "systems" }
  },

  // ── SAFETY + GOVERNANCE (safety) (4) ──────────────────────────────────────
  {
    id: "sec-q1", topic: "safety", difficulty: "hard", type: "mcq",
    question: "Indirect prompt injection is harder to defend against than direct injection because:",
    options: ["It uses more tokens", "Malicious instructions are hidden in retrieved content (web pages, docs) — the system can't distinguish attacker instructions from legitimate data", "It bypasses rate limits", "It requires root access"],
    correct: 1, keywords: [],
    explanation: "Direct injection (user typing 'ignore all instructions') is visible and filterable. Indirect injection embeds instructions in content your system retrieves — a web page, a document, an email. The LLM sees it as 'trusted' retrieved context. Defense: treat all retrieved content as untrusted data, never let retrieved content reach instruction position directly.",
    readMore: { label: "AI Red Teaming →", tab: "systems" }
  },
  {
    id: "sec-q2", topic: "safety", difficulty: "medium", type: "mcq",
    question: "A user pastes 200 example Q&As where the AI 'helpfully' answers harmful questions, then asks a harmful question. This is:",
    options: ["Role-play jailbreak", "Many-shot jailbreaking — exploiting in-context learning by padding context with fabricated compliance examples", "System prompt injection", "Token smuggling"],
    correct: 1, keywords: [],
    explanation: "Many-shot jailbreaking exploits the model's in-context learning ability. With enough fabricated 'compliance' examples in context, the model treats the harmful answer as the expected pattern to continue. Defense: detect anomalous context length, rate-limit heavy-context requests, context length caps.",
    readMore: { label: "AI Red Teaming →", tab: "systems" }
  },

  // ── A2A PROTOCOL (4) ──────────────────────────────────────────────────────
  {
    id: "a2a-1", topic: "agents", difficulty: "hard", type: "mcq",
    question: "The A2A Protocol solves the N×M agent integration problem because:",
    options: ["It makes agents faster", "Each agent publishes one Agent Card; any caller reads it and knows exactly how to invoke the agent — N+M integrations instead of N×M", "It replaces MCP for tool access", "It enforces security between agents"],
    correct: 1, keywords: [],
    explanation: "Without A2A, every agent-to-agent integration requires custom API contracts: N callers × M agents = N×M bespoke integrations. A2A agents publish a standardized Agent Card (capabilities, input/output schemas, auth) so any A2A client can discover and call any A2A server with one shared protocol.",
    readMore: { label: "A2A Protocol →", tab: "agents" }
  },
  {
    id: "a2a-2", topic: "agents", difficulty: "hard", type: "mcq",
    question: "In the A2A Task lifecycle, a Task enters 'input-required' state when:",
    options: ["The network is slow", "The agent needs additional information from the caller mid-task — it cannot proceed without a human or upstream agent response", "The tool is unavailable", "The context window is full"],
    correct: 1, keywords: [],
    explanation: "A2A models long-running tasks explicitly. 'input-required' is a first-class state — the agent pauses and requests clarification. The caller must respond to continue. This enables human-in-the-loop patterns without breaking the protocol: the task persists, resumes when unblocked.",
    readMore: { label: "A2A Protocol →", tab: "agents" }
  },
  {
    id: "a2a-3", topic: "agents", difficulty: "medium", type: "mcq",
    question: "How does A2A complement MCP rather than replace it?",
    options: ["A2A is faster than MCP", "MCP connects agents to tools/data; A2A connects agents to other agents — they solve different directions of integration", "A2A is an Anthropic standard; MCP is Google's", "They are the same protocol with different names"],
    correct: 1, keywords: [],
    explanation: "MCP (Model Context Protocol) is vertical: model ↔ tools/data. A2A is horizontal: agent ↔ agent. A production multi-agent system uses both — each agent uses MCP to access its tools, and agents communicate with each other via A2A. Together they form the full integration architecture.",
    readMore: { label: "A2A Protocol →", tab: "agents" }
  },
  {
    id: "a2a-4", topic: "agents", difficulty: "hard", type: "text",
    question: "Design a multi-agent customer support system using A2A. Identify 3 agents, their Agent Cards, and the A2A call flow for a refund request.",
    options: null, correct: null,
    keywords: ["intent", "router", "refund", "agent card", "task", "push", "escalation", "orchestrator"],
    explanation: "Strong answer: (1) Router Agent — classifies intent, routes to specialist. (2) Refund Agent — Agent Card: input=order_id+reason, output=refund_status, capability=order_lookup+payment_reversal. (3) Escalation Agent — invoked on refund failure. A2A flow: Router creates Task for Refund Agent → Refund Agent enters input-required if order not found → Router provides order data → Refund Agent completes → push notification to caller.",
    readMore: { label: "A2A Protocol →", tab: "agents" }
  },

  // ── KV CACHE ENGINEERING (4) ──────────────────────────────────────────────
  {
    id: "kv-1", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Prefix caching reduces KV cache recomputation cost when:",
    options: ["Model weights are quantized", "Multiple requests share an identical prompt prefix — the KV states for that prefix are computed once and reused", "The context window exceeds 32K tokens", "Batch size is greater than 8"],
    correct: 1, keywords: [],
    explanation: "KV cache prefix caching works by hashing the token sequence of a prefix. If a new request shares the same prefix (identical system prompt, RAG preamble), the KV states are served from cache — zero recomputation. Anthropic's cache_control, OpenAI's prompt caching, and vLLM's prefix caching all use this pattern. Savings: 60-80% cost reduction for repetitive prefixes.",
    readMore: { label: "KV Cache Engineering →", tab: "systems" }
  },
  {
    id: "kv-2", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "KV cache memory grows linearly with sequence length. At 128K tokens with a 70B model (GQA, 8 KV heads, fp16), KV cache per sequence is approximately:",
    options: ["~50MB", "~500MB", "~5GB", "~50GB"],
    correct: 0, keywords: [],
    explanation: "With GQA (Grouped Query Attention), KV cache = 2 × layers × KV_heads × head_dim × seq_len × bytes. For Llama 3.1 70B: 2 × 80 × 8 × 128 × 128,000 × 2 ≈ 42GB without GQA, but GQA reduces KV heads from 64→8, so ~42GB × (8/64) ≈ 5.2GB. At lower context or with INT8 KV cache quantization, this drops to ~2-3GB per request — still the primary memory bottleneck for long context.",
    readMore: { label: "KV Cache Engineering →", tab: "systems" }
  },
  {
    id: "kv-3", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Cache-aware routing (as used in llm-d) improves KV cache hit rates by:",
    options: ["Compressing cache entries", "Routing requests with identical prefixes to the same serving replica so cached KV states are available locally", "Precomputing KV for all possible prompts", "Using a global shared KV cache across all GPUs"],
    correct: 1, keywords: [],
    explanation: "Without cache-aware routing, a request with a cached prefix on GPU-1 might land on GPU-2 (cache miss). llm-d and similar systems hash the request prefix and route to the replica most likely to have that prefix cached — dramatically improving cache hit rates without requiring a shared (expensive) cross-replica cache.",
    readMore: { label: "KV Cache Engineering →", tab: "systems" }
  },
  {
    id: "kv-4", topic: "llmops", difficulty: "medium", type: "mcq",
    question: "KV cache eviction under memory pressure in vLLM uses PagedAttention because:",
    options: ["It is faster than standard attention", "Memory is managed in fixed-size pages that can be evicted and reloaded without fragmentation — like virtual memory for KV cache", "It reduces the number of attention heads needed", "It eliminates the KV cache entirely"],
    correct: 1, keywords: [],
    explanation: "Traditional KV allocation wastes memory through fragmentation (reserving max_seq_len memory upfront). PagedAttention allocates KV cache in small pages (typically 16 tokens), allowing fine-grained eviction of least-recently-used sequences and near-zero fragmentation. This is why vLLM achieves 2-4× better throughput than naive implementations.",
    readMore: { label: "KV Cache Engineering →", tab: "systems" }
  },

  // ── AI GUARDRAILS ENGINEERING (4) ─────────────────────────────────────────
  {
    id: "guard-1", topic: "safety", difficulty: "hard", type: "mcq",
    question: "A dual-stage guardrail architecture applies input classifiers AND output validators. The main reason to run both (not just output validation) is:",
    options: ["Output validation is cheaper", "Input classifiers stop harmful requests before any LLM compute is spent — fail fast before incurring generation cost and latency", "Input classifiers are more accurate", "Regulations require both stages"],
    correct: 1, keywords: [],
    explanation: "If you only validate output, you've already run the full LLM inference for every harmful request. Input classification adds a fast, cheap gate (10-50ms) that rejects obvious bad inputs before generation. The dual-stage pattern: input classifier (fast) → LLM generation → output validator (slower, catches subtler failures). Defense-in-depth AND cost optimization.",
    readMore: { label: "AI Guardrails →", tab: "systems" }
  },
  {
    id: "guard-2", topic: "safety", difficulty: "hard", type: "mcq",
    question: "Your guardrail system blocks 0.3% of legitimate user queries (false positive rate). At 5M daily queries, daily false blocks = 15,000. The standard engineering tradeoff is:",
    options: ["Always tighten thresholds to minimize false positives", "Raise classification threshold (fewer blocks) until false positive rate cost equals safety incident cost — find the operating point, don't blindly minimize either", "Replace classifier with a larger LLM", "Add a human review queue for all blocked queries"],
    correct: 1, keywords: [],
    explanation: "Safety and utility are in tension. 15,000 false blocks/day is a real business cost (frustrated users, support tickets). A calibrated threshold where the marginal safety gain equals the marginal user experience cost is the correct operating point — not zero false positives at any cost. Log all blocks, analyze the false positive distribution, set threshold per use case.",
    readMore: { label: "AI Guardrails →", tab: "systems" }
  },
  {
    id: "guard-3", topic: "safety", difficulty: "medium", type: "mcq",
    question: "NeMo Guardrails (Nvidia) differs from NLP filter-based guardrails because:",
    options: ["It is faster", "It uses a programmable dialogue flow (Colang) to enforce conversational rails at the LLM reasoning level — not just keyword matching", "It only works with Nvidia GPUs", "It does not require any configuration"],
    correct: 1, keywords: [],
    explanation: "Filter-based guardrails detect bad inputs/outputs via classifiers. NeMo Guardrails uses Colang — a domain-specific language — to define what conversations are allowed at the dialogue level. This enables conversational policies like 'if topic is competitor, politely redirect' that can't be expressed as input/output classifiers.",
    readMore: { label: "AI Guardrails →", tab: "systems" }
  },
  {
    id: "guard-4", topic: "safety", difficulty: "hard", type: "text",
    question: "Design a guardrails architecture for a healthcare Q&A bot. What input classifiers, output validators, and escalation logic would you implement?",
    options: null, correct: null,
    keywords: ["medical", "disclaimer", "escalation", "PII", "crisis", "hallucination", "grounding", "human"],
    explanation: "Strong answer: Input classifiers: (1) crisis/suicide detector → immediate escalation, (2) PII detector → redact before LLM, (3) out-of-scope classifier (non-medical topics). Output validators: (1) medical claim grounding checker (claims cited to retrieved docs), (2) disclaimer verifier (professional consultation language present), (3) PII in response detector. Escalation: urgent symptom keywords → human nurse queue. Log all medical claims with source attribution for audit.",
    readMore: { label: "AI Guardrails →", tab: "systems" }
  },

  // ── MOE ARCHITECTURE (4) ──────────────────────────────────────────────────
  {
    id: "moe-1", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "A Mixture-of-Experts model with 64 experts and top-2 routing activates what fraction of parameters per token?",
    options: ["100% — all experts process every token", "~3% — only the 2 selected experts run, plus shared components", "50% — top-2 of 64 is 3%, but shared layers add ~47%", "6% — top-2 of 64 specialists only"],
    correct: 1, keywords: [],
    explanation: "MoE sparse activation: only top-K experts process each token. For top-2 of 64 experts, the expert fraction is 2/64 ≈ 3%. Adding shared components (embedding, attention layers, output head) brings total activated parameters to roughly 10-20% of total model size depending on architecture. DeepSeek-V3 (671B total) activates ~37B per token this way.",
    readMore: { label: "MoE Architecture →", tab: "systems" }
  },
  {
    id: "moe-2", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "Expert collapse in MoE training means:",
    options: ["Experts learn the same features and the model degrades to a dense model", "A single expert handles all tokens — load balancing fails, most experts get no gradient signal and remain untrained", "All experts collapse into one weight matrix", "The router stops learning"],
    correct: 1, keywords: [],
    explanation: "Without load balancing loss, the router learns to send all tokens to a few experts that became slightly better early in training. Those experts improve; others atrophy. Result: effectively a small model despite large parameter count. Fix: auxiliary load balancing loss penalizes routing imbalance, forcing utilization across all experts.",
    readMore: { label: "MoE Architecture →", tab: "systems" }
  },
  {
    id: "moe-3", topic: "llmops", difficulty: "medium", type: "mcq",
    question: "Serving a 671B MoE model like DeepSeek-V3 requires less memory than a 671B dense model because:",
    options: ["MoE uses 8-bit weights by default", "Only activated expert weights need to be in GPU VRAM at inference time — but all experts must fit somewhere across the cluster", "MoE weights are compressed during training", "Sparse attention reduces memory regardless of expert count"],
    correct: 1, keywords: [],
    explanation: "All expert weights must reside in memory (GPU or fast CPU/NVMe) but only activated experts are loaded to GPU registers per forward pass. For a cluster with enough GPUs, each GPU holds a shard of experts and the network routes tokens. Memory per GPU is fraction_of_experts × weight_size. This is why MoE models work well with expert parallelism across many GPUs.",
    readMore: { label: "MoE Architecture →", tab: "systems" }
  },
  {
    id: "moe-4", topic: "llmops", difficulty: "hard", type: "mcq",
    question: "DeepSeek-V3's 'shared experts' innovation addresses which MoE limitation?",
    options: ["Memory usage", "The router overhead — shared experts always activate, ensuring there is always a fallback for tokens the router misclassifies or for generalizable features", "Gradient vanishing in experts", "Inference latency on single GPUs"],
    correct: 1, keywords: [],
    explanation: "Pure sparse routing can leave tokens without the right expert if routing is noisy, especially early in training. Shared experts (always-on subset, 2 in DeepSeek-V3) handle general patterns while specialist experts handle domain-specific features. This hybrid — 2 shared + top-K sparse — improves training stability and final model quality.",
    readMore: { label: "MoE Architecture →", tab: "systems" }
  },

  // ── VIBE CODING + AGENTIC DEV (3) ─────────────────────────────────────────
  {
    id: "vibe-1", topic: "agents", difficulty: "medium", type: "mcq",
    question: "Andrej Karpathy's 'Objective-Validation Protocol' for vibe coding means:",
    options: ["Run unit tests only", "Define the success condition in advance before AI generates code — 'the test that tells me this is done correctly' precedes generation, not follows it", "Let the AI decide what correct output looks like", "Use formal specification languages"],
    correct: 1, keywords: [],
    explanation: "The common vibe coding failure: you accept AI code that 'looks right' without a pre-defined correctness criterion. Karpathy's protocol: write the test (or define the observable behavior) before prompting the AI. This forces you to know what done means, and catches AI-generated code that is plausible but wrong.",
    readMore: { label: "Vibe Coding →", tab: "systems" }
  },
  {
    id: "vibe-2", topic: "agents", difficulty: "hard", type: "mcq",
    question: "60% of code being AI-generated (2026 baseline) creates which specific reliability risk at the system level?",
    options: ["Code runs slower", "Subtle correlated errors — AI-generated code across multiple services may share the same blind spots, creating systemic failure modes that human review of individual PRs won't catch", "Higher test coverage needed", "License violations from training data"],
    correct: 1, keywords: [],
    explanation: "Human engineers introduce errors independently. AI-generated code from the same model introduces correlated errors — the same misunderstanding of a concurrency pattern, the same off-by-one in a data structure, replicated across the codebase. Traditional code review catches isolated bugs, not model-systematic blind spots. This requires integration tests, chaos engineering, and architectural review beyond per-PR diff inspection.",
    readMore: { label: "Vibe Coding →", tab: "systems" }
  },
  {
    id: "vibe-3", topic: "agents", difficulty: "medium", type: "mcq",
    question: "The primary reason Cursor reached $2B ARR faster than any developer tool in history is:",
    options: ["It has better autocomplete than Copilot", "It operates at the project/codebase level — context includes full repository, not just open file — enabling multi-file edits that Copilot's single-file context cannot do", "It is cheaper than alternatives", "It supports more programming languages"],
    correct: 1, keywords: [],
    explanation: "GitHub Copilot operates primarily on the current file. Cursor indexes the full codebase, understands cross-file dependencies, and can make coordinated multi-file edits with a single prompt. This difference — file-scope vs. codebase-scope — is why developers describe Cursor as qualitatively different rather than incrementally better.",
    readMore: { label: "Vibe Coding →", tab: "systems" }
  },

  // ── TRAPS LAB / DEBUG PATTERNS (3) ────────────────────────────────────────
  {
    id: "trap-1", topic: "agents", difficulty: "hard", type: "mcq",
    question: "Your RAG system returns high cosine similarity scores (>0.85) but answers are factually wrong. Most likely root cause?",
    options: ["Embedding model is broken", "Semantic similarity captures linguistic style and topic, not factual accuracy — the retrieved chunk discusses the right topic but contains a different fact", "Top-k is too low", "The LLM has hallucinated the embedding"],
    correct: 1, keywords: [],
    explanation: "This is the classic semantic similarity trap. A query about 'Q3 revenue' will match a chunk about 'Q2 revenue discussion' at high similarity — same domain, same style. Cosine similarity is a retrieval signal, not a correctness signal. Fixes: add metadata filtering (quarter, year), use hybrid search with exact-match keyword boost, or add post-retrieval answer verification.",
    readMore: { label: "Traps Lab →", tab: "systems" }
  },
  {
    id: "trap-2", topic: "agents", difficulty: "hard", type: "mcq",
    question: "Your eval shows 92% accuracy on your test set but production accuracy is 61%. The most likely cause (beyond distribution shift) is:",
    options: ["The LLM changed its API", "Test set contamination — the test set was inadvertently created from the same source as training data, so the model 'memorized' those specific examples", "Production has more traffic", "Token limit differences"],
    correct: 1, keywords: [],
    explanation: "Benchmark contamination is the #1 cause of eval-production gaps in LLM systems. If your test set was sampled from the same corpus as your training data, fine-tuned examples, or prompt examples, the model has seen those exact questions. Fix: use held-out, freshly collected, real production queries as eval set — never reuse any queries that informed prompt or fine-tuning decisions.",
    readMore: { label: "Traps Lab →", tab: "systems" }
  },
  {
    id: "trap-3", topic: "agents", difficulty: "hard", type: "mcq",
    question: "Your agent completes tasks correctly in testing but fails in production on any task longer than 15 steps. Root cause?",
    options: ["Network latency increases with task length", "Context window degradation — after 15+ steps of Thought/Action/Observation, early context (task goal, constraints) is positioned in the 'lost in the middle' zone and attention weight drops", "Tool rate limits kick in at 15 calls", "Temperature drift over long sequences"],
    correct: 1, keywords: [],
    explanation: "Long agent trajectories accumulate context. The original task specification, key constraints, and early tool results drift toward the middle of an ever-growing context. LLMs underweight middle-context content (Liu et al. 2023). Fix: periodic re-anchoring (re-inject the original goal every N steps), summarize completed sub-tasks, keep running context under 40K tokens with a sliding summary buffer.",
    readMore: { label: "Traps Lab →", tab: "systems" }
  }
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TOPIC_COLORS = {
  rag: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  agents: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  finetuning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  evaluation: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  llmops: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  safety: "bg-red-500/20 text-red-300 border-red-500/30",
  product: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  behavioral: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  multimodal: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  reasoning: "bg-teal-500/20 text-teal-300 border-teal-500/30",
};

const TOPIC_LABELS = {
  rag: "RAG", agents: "Agents", finetuning: "Fine-Tuning",
  evaluation: "Evaluation", llmops: "LLMOps",
  safety: "Safety", product: "Product", behavioral: "Behavioral",
  multimodal: "Multimodal", reasoning: "Reasoning Models",
};

const SKILL_KEYWORDS = {
  rag: ["rag", "retrieval", "vector", "embedding", "pinecone", "weaviate", "langchain"],
  finetuning: ["fine-tun", "lora", "rlhf", "dpo", "training", "finetune"],
  agents: ["agent", "tool use", "react", "langgraph", "orchestrat"],
  evaluation: ["eval", "metric", "benchmark", "evals", "llm-as-judge"],
  llmops: ["mlops", "llmops", "deploy", "observ", "latency", "cost", "monitor"],
  safety: ["safety", "guardrail", "alignment", "harmful", "red-team"],
  product: ["product", "roadmap", "stakeholder", "metric", "kpi", "prd"],
  behavioral: ["team", "leadership", "cross-functional", "conflict", "mentoring"]
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawQuestions(count, focus, difficulty) {
  let pool = [...PREP_QUESTIONS];
  if (focus !== "all") {
    const topicMap = {
      engineering: ["rag", "agents", "llmops", "finetuning", "evaluation", "safety"],
      pm: ["product", "behavioral", "evaluation"],
      interview: ["behavioral", "product", "rag", "agents"]
    };
    pool = pool.filter(q => (topicMap[focus] || []).includes(q.topic));
  }
  if (difficulty === "hard") pool = pool.filter(q => q.difficulty === "hard");
  return shuffle(pool).slice(0, count);
}

function scoreText(answer, keywords) {
  if (!answer || !keywords || keywords.length === 0) return { pass: false };
  const lower = answer.toLowerCase();
  const hits = keywords.filter(k => lower.includes(k.toLowerCase())).length;
  return { hits, pass: hits >= Math.ceil(keywords.length * 0.4) };
}

function extractSkills(text) {
  if (!text) return {};
  const lower = text.toLowerCase();
  const found = {};
  for (const [skill, kws] of Object.entries(SKILL_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) found[skill] = kws.filter(k => lower.includes(k));
  }
  return found;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────

function TopicChip({ topic }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TOPIC_COLORS[topic]}`}>
      {TOPIC_LABELS[topic]}
    </span>
  );
}

function PBar({ value, max, color = "bg-indigo-500" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ScoreBar({ label, score, max, color = "bg-indigo-500" }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-400">{score}/{max} ({pct}%)</span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SpeechTextArea({ value, onChange, rows = 5, placeholder = "Type your answer here..." }) {
  const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const [listening, setListening] = useState(false);
  const [spoken, setSpoken] = useState(false);

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false;
    rec.onresult = e => {
      onChange((value ? value + " " : "") + e.results[0][0].transcript);
      setSpoken(true); setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start(); setListening(true);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
        />
        {spoken && (
          <span className="absolute top-2 right-2 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">(spoken)</span>
        )}
      </div>
      {hasSpeech && (
        <button
          onClick={startListening}
          disabled={listening}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all ${listening ? "bg-red-500/20 border-red-500/50 text-red-300 animate-pulse" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"}`}
        >
          <span>{listening ? "🎙 Listening..." : "🎤 Speak answer"}</span>
        </button>
      )}
    </div>
  );
}

function MCQOptions({ options, selected, onSelect }) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${selected === i ? "bg-indigo-600/20 border-indigo-500 text-indigo-200" : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"}`}
        >
          <span className="mr-3 text-zinc-500">{String.fromCharCode(65 + i)}.</span>{opt}
        </button>
      ))}
    </div>
  );
}

function QuestionCard({ q, gaps = [] }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <TopicChip topic={q.topic} />
        {gaps.includes(q.topic) && (
          <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">Gap topic</span>
        )}
        <span className="text-xs text-zinc-500 uppercase">{q.difficulty}</span>
        <span className="text-xs text-zinc-600 uppercase">{q.type}</span>
      </div>
      <p className="text-zinc-100 text-base leading-relaxed">{q.question}</p>
    </div>
  );
}

function RevealCard({ isCorrect, q, onNext, nextLabel, onNavigate }) {
  return (
    <div className={`rounded-xl p-5 border space-y-3 transition-all duration-300 ${isCorrect ? "bg-emerald-500/10 border-emerald-500/40" : "bg-red-500/10 border-red-500/40"}`}>
      <span className={`font-bold text-lg ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
        {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
      </span>
      {!isCorrect && q.type === "mcq" && (
        <p className="text-sm text-emerald-300">Correct answer: {q.options[q.correct]}</p>
      )}
      {!isCorrect && q.type === "text" && q.keywords.length > 0 && (
        <p className="text-sm text-zinc-400">Key concepts: {q.keywords.slice(0, 5).join(", ")}</p>
      )}
      <p className="text-sm text-zinc-300 border-t border-zinc-700 pt-3">{q.explanation}</p>
      {q.readMore && (
        <button
          onClick={() => onNavigate && onNavigate(q.readMore.tab)}
          className="text-sm text-indigo-400 hover:text-indigo-300 underline block"
        >
          Read more: {q.readMore.label} →
        </button>
      )}
      <button
        onClick={onNext}
        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-medium"
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── MODE 1: EXAM ─────────────────────────────────────────────────────────────

function ExamConfig({ onStart, onExit }) {
  const [duration, setDuration] = useState(30);
  const [focus, setFocus] = useState("all");
  const [difficulty, setDifficulty] = useState("mixed");
  const DM = { 15: 20, 30: 35, 60: 55 };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Back</button>
          <h2 className="text-2xl font-bold">Configure Exam</h2>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {[15, 30, 60].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`py-3 rounded-lg border text-sm font-medium transition-all ${duration === d ? "bg-indigo-600/20 border-indigo-500 text-indigo-200" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                  {d} min<br /><span className="text-xs opacity-70">{DM[d]}Q</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Focus</label>
            <div className="grid grid-cols-2 gap-3">
              {[["all", "All Topics"], ["engineering", "Engineering"], ["pm", "Product / PM"], ["interview", "Interview Prep"]].map(([v, l]) => (
                <button key={v} onClick={() => setFocus(v)}
                  className={`py-3 rounded-lg border text-sm font-medium transition-all ${focus === v ? "bg-indigo-600/20 border-indigo-500 text-indigo-200" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Difficulty</label>
            <div className="grid grid-cols-2 gap-3">
              {[["mixed", "Mixed"], ["hard", "Hard Only"]].map(([v, l]) => (
                <button key={v} onClick={() => setDifficulty(v)}
                  className={`py-3 rounded-lg border text-sm font-medium transition-all ${difficulty === v ? "bg-indigo-600/20 border-indigo-500 text-indigo-200" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => onStart({ duration, focus, difficulty })}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
        >
          Start Exam →
        </button>
      </div>
    </div>
  );
}

function ExamMode({ onExit }) {
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);
  const DM = { 15: 20, 30: 35, 60: 55 };

  function startExam(cfg) {
    const qs = drawQuestions(DM[cfg.duration] || 20, cfg.focus, cfg.difficulty);
    setQuestions(qs); setConfig(cfg); setTimeLeft(cfg.duration * 60);
    setAnswers({}); setCurrent(0); setFinished(false);
  }

  useEffect(() => {
    if (!config || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [config, finished]);

  function computeResults() {
    const bt = {}; let tc = 0; const wrong = [];
    for (const q of questions) {
      if (!bt[q.topic]) bt[q.topic] = { correct: 0, total: 0 };
      bt[q.topic].total++;
      const ans = answers[q.id];
      const ok = q.type === "mcq" ? ans === q.correct : scoreText(ans, q.keywords).pass;
      if (ok) { tc++; bt[q.topic].correct++; } else wrong.push(q);
    }
    const pct = questions.length > 0 ? Math.round((tc / questions.length) * 100) : 0;
    const ta = Object.entries(bt).map(([t, v]) => ({ topic: t, ...v, pct: v.total > 0 ? Math.round(v.correct / v.total * 100) : 0 }));
    return {
      tc, total: questions.length, pct, byTopic: ta, wrong,
      strong: ta.filter(t => t.pct >= 70).map(t => TOPIC_LABELS[t.topic]),
      weak: ta.filter(t => t.pct < 50).map(t => TOPIC_LABELS[t.topic])
    };
  }

  function copyResults(r) {
    const lines = [
      "PrepLab Exam Results",
      `Score: ${r.tc}/${r.total} (${r.pct}%)`,
      `Strong: ${r.strong.join(", ") || "–"}`,
      `Needs work: ${r.weak.join(", ") || "–"}`,
      "",
      ...r.byTopic.map(t => `  ${TOPIC_LABELS[t.topic]}: ${t.correct}/${t.total} (${t.pct}%)`),
      "",
      ...r.wrong.map(q => `Q: ${q.question}\n  ${q.type === "mcq" ? `Correct: ${q.options[q.correct]}` : "(open-ended)"}\n  ${q.explanation}`)
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  }

  if (!config) return <ExamConfig onStart={startExam} onExit={onExit} />;

  if (finished) {
    const r = computeResults();
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={onExit} className="text-zinc-400 hover:text-zinc-200 text-sm">← Exit</button>
            <button onClick={() => copyResults(r)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg border border-zinc-700">
              Download Results
            </button>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-5 sm:p-8 border border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm mb-2">Final Score</p>
            <div className="text-5xl sm:text-7xl font-bold text-indigo-400 mb-1">{r.pct}%</div>
            <p className="text-zinc-400">{r.tc} / {r.total} correct</p>
            {(r.strong.length > 0 || r.weak.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {r.strong.length > 0 && <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-sm">Strong in: {r.strong.join(" · ")}</span>}
                {r.weak.length > 0 && <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-sm">Needs work: {r.weak.join(" · ")}</span>}
              </div>
            )}
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
            <h3 className="font-semibold text-zinc-200">Per-Topic Breakdown</h3>
            {r.byTopic.map(t => (
              <ScoreBar key={t.topic} label={TOPIC_LABELS[t.topic]} score={t.correct} max={t.total}
                color={t.pct >= 70 ? "bg-emerald-500" : t.pct >= 50 ? "bg-amber-500" : "bg-red-500"} />
            ))}
          </div>
          {r.wrong.length > 0 && (
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
              <h3 className="font-semibold text-zinc-200">Wrong Answers ({r.wrong.length})</h3>
              {r.wrong.map(q => (
                <div key={q.id} className="border border-zinc-700 rounded-lg p-4 space-y-2">
                  <div className="flex gap-2 items-start">
                    <TopicChip topic={q.topic} />
                    <p className="text-zinc-200 text-sm flex-1">{q.question}</p>
                  </div>
                  {q.type === "mcq" && <p className="text-emerald-400 text-sm">✓ {q.options[q.correct]}</p>}
                  <p className="text-zinc-400 text-sm border-t border-zinc-700 pt-2">{q.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;
  const answered = Object.keys(answers).length;
  const timerColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-amber-400" : "text-zinc-200";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-3 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Q{current + 1} of {questions.length}</span>
              <span>{answered} answered</span>
            </div>
            <PBar value={answered} max={questions.length} />
          </div>
          <div className={`text-xl font-mono font-bold ${timerColor} min-w-[4rem] text-right`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <QuestionCard q={q} />
        {q.type === "mcq"
          ? <MCQOptions options={q.options} selected={answers[q.id]} onSelect={i => setAnswers(a => ({ ...a, [q.id]: i }))} />
          : <SpeechTextArea value={answers[q.id] || ""} onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))} rows={6} />
        }
        <div className="flex justify-between items-center pt-2">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30">← Previous</button>
          {current < questions.length - 1
            ? <button onClick={() => setCurrent(c => c + 1)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg">Next →</button>
            : <button onClick={() => { clearInterval(timerRef.current); setFinished(true); }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg font-semibold">Finish Exam</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── MODE 2: TRAINER ──────────────────────────────────────────────────────────

function TrainerMode({ onExit, onNavigate }) {
  const [questions] = useState(() => shuffle(PREP_QUESTIONS));
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [weakTopics, setWeakTopics] = useState({});
  const [done, setDone] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const q = questions[current];

  function submit() {
    const ok = q.type === "mcq" ? parseInt(answer) === q.correct : scoreText(answer, q.keywords).pass;
    setIsCorrect(ok); setSubmitted(true);
    if (!ok) setWeakTopics(wt => ({ ...wt, [q.topic]: (wt[q.topic] || 0) + 1 }));
    setSessionAnswers(sa => [...sa, { q, correct: ok }]);
  }

  function next() {
    if (current >= questions.length - 1) setDone(true);
    else { setCurrent(c => c + 1); setAnswer(""); setSubmitted(false); setIsCorrect(false); }
  }

  if (done) {
    const tc = sessionAnswers.filter(a => a.correct).length;
    const pct = Math.round((tc / sessionAnswers.length) * 100);
    const weakList = Object.entries(weakTopics).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <button onClick={onExit} className="text-zinc-400 hover:text-zinc-200 text-sm">← Exit</button>
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm mb-2">Session Score</p>
            <div className="text-4xl sm:text-6xl font-bold text-indigo-400 mb-1">{pct}%</div>
            <p className="text-zinc-400">{tc} / {sessionAnswers.length} correct</p>
          </div>
          {weakList.length > 0 && (
            <div className="bg-zinc-900 rounded-xl p-6 border border-amber-500/30">
              <h3 className="font-semibold text-amber-300 mb-3">Weak Areas — Study These Next</h3>
              <div className="flex flex-wrap gap-2 mb-4">{weakList.map(t => <TopicChip key={t} topic={t} />)}</div>
              <ul className="space-y-1">
                {weakList.map(t => (
                  <li key={t} className="text-sm text-zinc-400">
                    • {TOPIC_LABELS[t]}: {weakTopics[t]} wrong answer{weakTopics[t] > 1 ? "s" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={onExit} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
          <span className="text-sm text-zinc-500">{current + 1} / {questions.length}</span>
        </div>
        <PBar value={current} max={questions.length} />
        <QuestionCard q={q} />
        {!submitted && (
          <>
            {q.type === "mcq"
              ? <MCQOptions options={q.options} selected={answer === "" ? undefined : parseInt(answer)} onSelect={i => setAnswer(String(i))} />
              : <SpeechTextArea value={answer} onChange={setAnswer} />
            }
            <button onClick={submit} disabled={answer.toString().trim() === ""}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium rounded-xl transition-all">
              Submit Answer
            </button>
          </>
        )}
        {submitted && (
          <RevealCard isCorrect={isCorrect} q={q} onNext={next}
            nextLabel={current >= questions.length - 1 ? "See Results" : "Next Question →"}
            onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}

// ─── MODE 3: JD PREP ──────────────────────────────────────────────────────────

function JDPrepMode({ onExit, onNavigate }) {
  const [step, setStep] = useState(1);
  const [jdText, setJdText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jdSkills, setJdSkills] = useState({});
  const [resumeSkills, setResumeSkills] = useState({});
  const [sessionQs, setSessionQs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const jdTopics = Object.keys(jdSkills);
  const resumeTopics = Object.keys(resumeSkills);
  const gaps = jdTopics.filter(t => !resumeTopics.includes(t));

  function analyzeJD() { setJdSkills(extractSkills(jdText)); setStep(2); }
  function handleResume(text) { setResumeText(text); setResumeSkills(extractSkills(text)); }

  function buildQs() {
    const wt = {};
    for (const t of jdTopics) wt[t] = gaps.includes(t) ? 3 : 1;
    let pool = [];
    for (const q of PREP_QUESTIONS) {
      const w = wt[q.topic] || 0;
      for (let i = 0; i < w; i++) pool.push(q);
    }
    pool = shuffle(pool);
    const seen = new Set(); const uniq = [];
    for (const q of pool) {
      if (!seen.has(q.id)) { seen.add(q.id); uniq.push(q); }
      if (uniq.length >= 20) break;
    }
    if (uniq.length < 20) {
      const extra = shuffle(PREP_QUESTIONS.filter(q => !seen.has(q.id)));
      uniq.push(...extra.slice(0, 20 - uniq.length));
    }
    return uniq.slice(0, 20);
  }

  function startSession() {
    setSessionQs(buildQs()); setCurrent(0); setAnswer(""); setSubmitted(false);
    setIsCorrect(false); setSessionAnswers([]); setDone(false); setStep(3);
  }

  function submit() {
    const q = sessionQs[current];
    const ok = q.type === "mcq" ? parseInt(answer) === q.correct : scoreText(answer, q.keywords).pass;
    setIsCorrect(ok); setSubmitted(true);
    setSessionAnswers(sa => [...sa, { q, correct: ok }]);
  }

  function next() {
    if (current >= sessionQs.length - 1) setDone(true);
    else { setCurrent(c => c + 1); setAnswer(""); setSubmitted(false); setIsCorrect(false); }
  }

  if (step === 3 && done) {
    const tc = sessionAnswers.filter(a => a.correct).length;
    const pct = Math.round((tc / sessionAnswers.length) * 100);
    const bt = {};
    for (const { q, correct } of sessionAnswers) {
      if (!bt[q.topic]) bt[q.topic] = { correct: 0, total: 0 };
      bt[q.topic].total++;
      if (correct) bt[q.topic].correct++;
    }
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <button onClick={onExit} className="text-zinc-400 hover:text-zinc-200 text-sm">← Exit</button>
          <div className="bg-zinc-900 rounded-2xl p-5 sm:p-8 border border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm mb-2">Interview Readiness Score</p>
            <div className="text-5xl sm:text-7xl font-bold text-indigo-400 mb-1">{pct}%</div>
            <p className="text-zinc-400">{tc} / {sessionAnswers.length} correct</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
            <h3 className="font-semibold text-zinc-200">Per-Topic Breakdown</h3>
            {Object.entries(bt).map(([t, v]) => (
              <ScoreBar key={t} label={TOPIC_LABELS[t]} score={v.correct} max={v.total}
                color={Math.round(v.correct / v.total * 100) >= 70 ? "bg-emerald-500" : Math.round(v.correct / v.total * 100) >= 50 ? "bg-amber-500" : "bg-red-500"} />
            ))}
          </div>
          <button onClick={onExit} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm">Back to Home</button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    const q = sessionQs[current];
    if (!q) return null;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
            <span className="text-sm text-zinc-500">{current + 1} / {sessionQs.length}</span>
          </div>
          <PBar value={current} max={sessionQs.length} />
          <QuestionCard q={q} gaps={gaps} />
          {!submitted && (
            <>
              {q.type === "mcq"
                ? <MCQOptions options={q.options} selected={answer === "" ? undefined : parseInt(answer)} onSelect={i => setAnswer(String(i))} />
                : <SpeechTextArea value={answer} onChange={setAnswer} />
              }
              <button onClick={submit} disabled={answer.toString().trim() === ""}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium rounded-xl">
                Submit Answer
              </button>
            </>
          )}
          {submitted && (
            <RevealCard isCorrect={isCorrect} q={q} onNext={next}
              nextLabel={current >= sessionQs.length - 1 ? "See Results" : "Next →"}
              onNavigate={onNavigate} />
          )}
        </div>
      </div>
    );
  }

  // Steps 1 & 2
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
          <h2 className="text-xl font-bold">JD + Resume Prep</h2>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-500"}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-px ${step > s ? "bg-indigo-600" : "bg-zinc-700"}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Paste JD</span><span>Resume Gap</span><span>Session</span>
        </div>

        {step === 1 && (
          <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 space-y-3">
            <label className="block text-sm font-medium text-zinc-300">Job Description</label>
            <textarea
              value={jdText} onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description here..." rows={10}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <button onClick={analyzeJD} disabled={!jdText.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium rounded-xl">
              Analyze JD →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 space-y-4">
              <h3 className="font-medium text-zinc-300">Detected Skills in JD</h3>
              {jdTopics.length === 0
                ? <p className="text-zinc-500 text-sm">No specific skill keywords detected. Try pasting a more detailed JD.</p>
                : <>
                    <div className="flex flex-wrap gap-2">{jdTopics.map(t => <TopicChip key={t} topic={t} />)}</div>
                    <p className="text-sm text-zinc-400">
                      <span className="font-medium text-zinc-300">Session focus: </span>
                      {jdTopics.map((t, i) => `${TOPIC_LABELS[t]} (${Math.round(100 / jdTopics.length)}%)${i < jdTopics.length - 1 ? " · " : ""}`).join("")}
                    </p>
                  </>
              }
            </div>

            <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 space-y-3">
              <label className="block text-sm font-medium text-zinc-300">
                Resume Text <span className="text-zinc-500 font-normal">(optional)</span>
              </label>
              <textarea
                value={resumeText} onChange={e => handleResume(e.target.value)}
                placeholder="Paste your resume text to see gap analysis..." rows={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {resumeText.trim() && jdTopics.length > 0 && (
              <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 space-y-3">
                <h3 className="font-medium text-zinc-300">Gap Analysis</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wide">JD Requires</p>
                    <div className="space-y-1.5">{jdTopics.map(t => <div key={t} className="text-zinc-300">{TOPIC_LABELS[t]}</div>)}</div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wide">You Mention</p>
                    <div className="space-y-1.5">{jdTopics.map(t => (
                      <div key={t} className={resumeTopics.includes(t) ? "text-emerald-400" : "text-zinc-600"}>
                        {resumeTopics.includes(t) ? "✓" : "–"}
                      </div>
                    ))}</div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs mb-2 uppercase tracking-wide">Gap</p>
                    <div className="space-y-1.5">{jdTopics.map(t => (
                      <div key={t} className={gaps.includes(t) ? "text-red-400 font-medium" : "text-zinc-600"}>
                        {gaps.includes(t) ? "⚠" : "–"}
                      </div>
                    ))}</div>
                  </div>
                </div>
                {gaps.length > 0 && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-300 font-medium">Your weak areas: {gaps.map(t => TOPIC_LABELS[t]).join(", ")}</p>
                    <p className="text-xs text-zinc-500 mt-1">These will be weighted more heavily in your session.</p>
                  </div>
                )}
              </div>
            )}

            <button onClick={startSession} disabled={jdTopics.length === 0}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl">
              Start Targeted Session →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODE 4: COMPANY PREP ─────────────────────────────────────────────────────

const COMPANY_ARCHETYPES = [
  {
    id: "bigtech",
    icon: "🏢",
    label: "Big Tech AI",
    companies: ["Google DeepMind", "Meta AI", "Amazon AI", "Apple ML"],
    color: "indigo",
    topicWeights: { rag: 3, agents: 3, evals: 4, latency: 3, fine_tuning: 2, safety: 3, mlops: 4, multimodal: 2 },
    traits: ["Scale-first thinking", "Infra ownership", "Distributed systems depth", "Eval culture"],
    sysDesignPrompts: [
      "Design Google Search's AI answer layer — how do you avoid hallucination at 8B queries/day?",
      "Build Meta's content moderation pipeline for a billion-user platform using LLMs.",
      "Design Amazon Alexa's next-gen reasoning layer — latency < 200 ms, runs on-device + cloud hybrid.",
      "Apple wants on-device LLM inference for Siri. Design the model serving and fallback architecture.",
    ],
    mustKnow: ["RLHF at scale", "Distributed training orchestration", "Eval harness design", "Latency SLOs", "Feature stores"],
  },
  {
    id: "ainative",
    icon: "🚀",
    label: "AI-Native Startups",
    companies: ["Anthropic", "OpenAI", "Perplexity", "Cursor"],
    color: "emerald",
    topicWeights: { rag: 4, agents: 4, evals: 5, safety: 5, latency: 3, fine_tuning: 3, mlops: 2, multimodal: 2 },
    traits: ["Safety-aware reasoning", "Agentic system design", "Eval obsession", "Research ↔ product bridge"],
    sysDesignPrompts: [
      "Design Anthropic's Constitutional AI feedback loop — how does RLAIF scale beyond human labelers?",
      "Build Perplexity's answer engine: real-time retrieval + citation grounding + < 3 s TTFT.",
      "Design Cursor's code agent: context management across 100k-token repos, edit diffing, rollback.",
      "OpenAI needs a plugin/tool orchestration layer for GPT-5 that handles 1M parallel agent sessions.",
    ],
    mustKnow: ["Constitutional AI / RLAIF", "Agentic loops & tool use", "Evals as product quality signal", "MCP / function calling", "Streaming UX"],
  },
  {
    id: "indiantech",
    icon: "🇮🇳",
    label: "Indian Tech",
    companies: ["Flipkart", "Swiggy", "Zepto", "Razorpay"],
    color: "orange",
    topicWeights: { rag: 3, agents: 2, evals: 2, latency: 5, fine_tuning: 3, safety: 1, mlops: 4, multimodal: 2 },
    traits: ["Cost efficiency", "Low-latency at scale", "Hindi/regional language NLP", "Mobile-first constraints"],
    sysDesignPrompts: [
      "Flipkart: Build a product search + recommendation system that works across 500M SKUs with multilingual queries.",
      "Swiggy: Design an ETA prediction system using LLM reasoning over real-time GPS + historical data.",
      "Zepto: Build an LLM-powered ops assistant that reduces support tickets using conversation history.",
      "Razorpay: Design a fraud detection system using LLM reasoning over transaction graphs.",
    ],
    mustKnow: ["Multilingual embeddings", "Cost-optimized inference", "MLOps on tight budgets", "Real-time feature pipelines", "Fine-tuning for domain adaptation"],
  },
  {
    id: "enterprise",
    icon: "🏦",
    label: "Enterprise AI",
    companies: ["McKinsey QuantumBlack", "Accenture AI", "Deloitte AI", "IBM watsonx"],
    color: "violet",
    topicWeights: { rag: 5, agents: 3, evals: 3, latency: 2, fine_tuning: 2, safety: 4, mlops: 3, multimodal: 1 },
    traits: ["Governance & compliance", "Private deployment", "Client communication", "ROI framing"],
    sysDesignPrompts: [
      "A bank wants to deploy an LLM for internal policy Q&A. Design the RAG system with access control and audit trail.",
      "McKinsey client: Replace a 200-person analyst team with an AI research synthesis pipeline. Design it.",
      "Accenture: Build an enterprise AI governance layer — model cards, drift detection, bias auditing.",
      "IBM: Design a private LLM deployment for a pharmaceutical company with HIPAA/GDPR constraints.",
    ],
    mustKnow: ["Private RAG with access control", "Model governance & audit logs", "On-prem/VPC deployment", "Prompt injection defenses", "Explainability requirements"],
  },
];

function CompanyPrepMode({ onExit, onNavigate }) {
  const [archetype, setArchetype] = useState(null);
  const [view, setView] = useState("overview"); // overview | questions | sysdesign
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [sessionQs, setSessionQs] = useState([]);

  function startQuestions(arc) {
    const wt = arc.topicWeights;
    let pool = [];
    for (const q of PREP_QUESTIONS) {
      const w = wt[q.topic] || 0;
      for (let i = 0; i < w; i++) pool.push(q);
    }
    const seen = new Set(); const uniq = [];
    for (const q of shuffle(pool)) {
      if (!seen.has(q.id)) { seen.add(q.id); uniq.push(q); }
      if (uniq.length >= 15) break;
    }
    setSessionQs(uniq);
    setQIdx(0); setAnswer(""); setRevealed(false); setScore({ correct: 0, total: 0 }); setDone(false);
    setView("questions");
  }

  if (!archetype) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pt-4">
            <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Back</button>
            <div>
              <h1 className="text-2xl font-bold">Company Prep Tracks</h1>
              <p className="text-zinc-500 text-sm">Questions + system design prompts weighted to each archetype</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMPANY_ARCHETYPES.map(arc => (
              <div key={arc.id} onClick={() => setArchetype(arc)}
                className={`bg-zinc-900 border border-${arc.color}-500/30 hover:border-${arc.color}-400/60 rounded-2xl p-5 cursor-pointer transition-all`}>
                <div className="text-3xl mb-3">{arc.icon}</div>
                <h3 className="font-bold text-lg mb-1">{arc.label}</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {arc.companies.map(c => (
                    <span key={c} className={`text-xs px-2 py-0.5 rounded-full bg-${arc.color}-900/40 text-${arc.color}-300 border border-${arc.color}-500/20`}>{c}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {arc.traits.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "overview") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pt-4">
            <button onClick={() => setArchetype(null)} className="text-zinc-500 hover:text-zinc-300 text-sm">← Archetypes</button>
            <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm ml-auto">Exit</button>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{archetype.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{archetype.label}</h2>
                <p className="text-zinc-500 text-sm">{archetype.companies.join(" · ")}</p>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">Must-Know Topics</h3>
            <ul className="space-y-1 mb-5">
              {archetype.mustKnow.map(k => (
                <li key={k} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-green-400 mt-0.5">✓</span>{k}</li>
              ))}
            </ul>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => startQuestions(archetype)}
                className={`px-5 py-2.5 rounded-xl bg-${archetype.color}-600 hover:bg-${archetype.color}-500 text-white font-semibold text-sm transition-colors`}>
                Practice Questions (15)
              </button>
              <button onClick={() => setView("sysdesign")}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-colors">
                System Design Prompts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "sysdesign") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex items-center gap-3 pt-4">
            <button onClick={() => setView("overview")} className="text-zinc-500 hover:text-zinc-300 text-sm">← Overview</button>
          </div>
          <h2 className="text-xl font-bold">{archetype.icon} {archetype.label} — System Design Prompts</h2>
          <p className="text-zinc-500 text-sm">Use these as 30–45 min design challenges. Focus on: scope → components → tradeoffs → failure modes.</p>
          {archetype.sysDesignPrompts.map((prompt, i) => (
            <div key={i} className={`bg-zinc-900 border border-${archetype.color}-500/20 rounded-xl p-5`}>
              <div className="flex items-start gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded bg-${archetype.color}-900/50 text-${archetype.color}-300 mt-0.5 shrink-0`}>Q{i+1}</span>
                <p className="text-zinc-200 leading-relaxed text-sm">{prompt}</p>
              </div>
              <div className="mt-3 pl-8 space-y-1">
                <p className="text-xs text-zinc-600">Consider: scale, latency, cost, failure modes, observability</p>
              </div>
            </div>
          ))}
          <button onClick={() => startQuestions(archetype)}
            className={`w-full py-3 rounded-xl bg-${archetype.color}-700 hover:bg-${archetype.color}-600 text-white font-semibold text-sm transition-colors`}>
            Practice Questions Next →
          </button>
        </div>
      </div>
    );
  }

  if (view === "questions") {
    if (done) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 border border-zinc-700 text-center space-y-4">
            <div className="text-5xl">{archetype.icon}</div>
            <h2 className="text-2xl font-bold">{archetype.label} Session Complete</h2>
            <p className="text-zinc-400">{score.correct} / {score.total} correct</p>
            <div className="text-3xl font-black text-emerald-400">{Math.round((score.correct/score.total)*100)}%</div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => { startQuestions(archetype); }} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm">Retry</button>
              <button onClick={() => setView("sysdesign")} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm">System Design</button>
              <button onClick={() => setArchetype(null)} className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-sm">Change Archetype</button>
            </div>
          </div>
        </div>
      );
    }

    const q = sessionQs[qIdx];
    if (!q) return null;

    function submit() {
      const correct = answer.trim().toLowerCase() === q.answer.toLowerCase();
      setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      setRevealed(true);
    }

    function next() {
      if (qIdx + 1 >= sessionQs.length) { setDone(true); return; }
      setQIdx(i => i + 1); setAnswer(""); setRevealed(false);
    }

    const isCorrect = revealed && answer.trim().toLowerCase() === q.answer.toLowerCase();

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between pt-4">
            <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
            <span className="text-xs text-zinc-600">{archetype.icon} {archetype.label} · Q{qIdx+1}/{sessionQs.length} · {score.correct} correct</span>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${TOPIC_COLORS[q.topic]}`}>{TOPIC_LABELS[q.topic]}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">{q.difficulty}</span>
            </div>
            <p className="text-zinc-100 font-medium leading-relaxed mb-4">{q.question}</p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map(opt => {
                let cls = "w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ";
                if (!revealed) cls += "border-zinc-700 bg-zinc-800 hover:border-zinc-500 text-zinc-300";
                else if (opt === q.answer) cls += "border-emerald-500 bg-emerald-900/30 text-emerald-200";
                else if (opt === answer && opt !== q.answer) cls += "border-red-500 bg-red-900/30 text-red-300";
                else cls += "border-zinc-800 bg-zinc-900 text-zinc-600";
                return (
                  <button key={opt} disabled={revealed} onClick={() => setAnswer(opt)} className={cls}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {!revealed && (
              <button onClick={submit} disabled={!answer}
                className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors">
                Submit
              </button>
            )}
            {revealed && (
              <div className={`mt-4 p-4 rounded-xl border ${isCorrect ? "border-emerald-700 bg-emerald-900/20" : "border-red-700 bg-red-900/20"}`}>
                <p className="text-sm font-semibold mb-1 {isCorrect ? 'text-emerald-400' : 'text-red-400'}">{isCorrect ? "✓ Correct" : "✗ Incorrect"}</p>
                <p className="text-zinc-300 text-sm">{q.explanation}</p>
                <button onClick={next} className="mt-3 px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm">
                  {qIdx + 1 >= sessionQs.length ? "See Results" : "Next →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}


// ─── DEFENSE DOC MODE ─────────────────────────────────────────────────────────

const DD_DOMAINS = [
  { id:"rag",       label:"RAG & Retrieval",           color:"#3b82f6", keywords:["rag","retrieval","vector","embedding","chunk","rerank","hybrid search","faiss","pinecone","weaviate","langchain","llama index"] },
  { id:"agents",    label:"Agent Systems",              color:"#8b5cf6", keywords:["agent","tool call","langgraph","crewai","autogen","react","planning","orchestrat","multi-agent","agentic"] },
  { id:"eval",      label:"Evals & Quality",            color:"#10b981", keywords:["eval","benchmark","metric","ragas","hallucin","faithfulness","precision","recall","judge","test","quality"] },
  { id:"infra",     label:"Infra & Deployment",         color:"#f59e0b", keywords:["vllm","triton","kubernetes","docker","latency","throughput","serving","deploy","scale","gpu","inference"] },
  { id:"finetune",  label:"Fine-tuning & Alignment",    color:"#ef4444", keywords:["fine-tun","lora","qlora","sft","dpo","rlhf","grpo","alignment","peft","adapter","train"] },
  { id:"safety",    label:"Safety & Red Teaming",       color:"#f97316", keywords:["safety","guardrail","red team","jailbreak","injection","constitutional","responsible","bias","harm"] },
  { id:"multimodal",label:"Multimodal",                 color:"#38bdf8", keywords:["multimodal","vision","image","clip","vit","audio","video","ocr","document"] },
  { id:"pm",        label:"Product & Strategy",         color:"#a78bfa", keywords:["product","roadmap","stakeholder","strategy","prd","okr","metric","business","user research","launch"] },
];

function detectDomains(jd) {
  const lower = jd.toLowerCase();
  return DD_DOMAINS.map(d => ({
    ...d,
    hits: d.keywords.filter(kw => lower.includes(kw)).length,
  })).sort((a, b) => b.hits - a.hits);
}

const DD_CHEATSHEETS = {
  rag: ["Choose chunk size based on query granularity, not document structure","Hybrid search (BM25 + dense) beats pure dense retrieval on most enterprise corpora","Reranking with a cross-encoder adds ~40ms but +15% precision","RAGAS metrics: faithfulness, answer relevancy, context precision, context recall","Production failure: stale retrieval from nightly-only ingestion"],
  agents: ["Step budget + timeout on every agent — no unbounded loops","Idempotent tools: every tool call must be safe to retry","Confirmation gate before any write/delete action","LangGraph: stateful nodes + conditional edges; Temporal: durable execution across failures","Production failure: tool confabulation — model invents tool args that look valid but fail silently"],
  eval: ["Offline eval before every deploy; online eval (shadow + A/B) after","LLM-as-judge: GPT-4o-mini grades 10x cheaper than human for 0.8 correlation","RAGAS for RAG; trajectory efficiency + tool precision for agents","Never move a metric from eval to SLA without 2 weeks of calibration","Production failure: evaluation dataset leaking into fine-tuning data"],
  infra: ["vLLM continuous batching: 10x throughput vs naive serving","KV cache: the only optimization that gets cheaper as context grows","Speculative decoding: 2-3x speedup for low-entropy outputs (code, structured)","Auto-scale on queue depth, not CPU — LLM workload is bursty","Production failure: cold-start latency from model loading on first request"],
  finetune: ["SFT first, always — DPO requires a decent base model","QLoRA: 4-bit quantized base + 16-bit adapters = 70B fits on 2xA100","DPO over RLHF for general chat; GRPO for verifiable rewards (math, code)","Eval on held-out task distribution, not training distribution","Production failure: catastrophic forgetting when SFT dataset lacks diversity"],
  safety: ["Input guardrails + output guardrails — dual-stage, not either/or","Many-shot jailbreaks are now the hardest attack surface","Constitutional AI: model critiques its own outputs before serving","NeMo Guardrails / Lakera Guard for production — don't roll your own","Production failure: indirect prompt injection via retrieved documents"],
  multimodal: ["Image tokens are expensive: GPT-4o charges ~170 tokens per 512px tile","ColPali: visual document retrieval without OCR — query against page images directly","CLIP retrieval for image search; cross-encoder rerank for precision","Lost-in-middle applies to image context too — put key images early or late","Production failure: spatial reasoning and object counting degrade sharply on real-world images"],
  pm: ["AI features ship with eval criteria, not just acceptance criteria","Model tier decision = latency SLA x quality floor x cost ceiling","Shadow mode before A/B — validate quality before splitting real traffic","Leading metric: task completion rate. Lagging metric: user retention at D30","Production failure: 'good enough' eval threshold set from demo, not representative sample"],
};

const DD_MUSTKNOW = {
  rag: ["What is RAG and why it beats pure parametric memory","Chunking: fixed vs semantic vs hierarchical","Dense vs sparse vs hybrid retrieval","Embedding models: dimensions, latency, cost tradeoffs","Reranking: when to add a cross-encoder step","RAGAS: the 4 core metrics and what they catch","Context overflow: what happens when retrieved docs exceed context window","Production ingestion: chunking → embedding → upsert → staleness detection"],
  agents: ["ReAct loop: Reason + Act + Observe cycle","Tool design: why idempotency matters for retry safety","LangGraph vs plain LangChain: when stateful graph execution is worth it","Memory types: in-context vs episodic vs semantic vs external","Multi-agent patterns: supervisor, peer-to-peer, specialized subagents","Step budget and timeout: how to prevent infinite loops","Human-in-the-loop: 4 patterns (confirmation, escalation, checkpoint, ambiguity)","MCP: what it solves and how it differs from function calling"],
  eval: ["Offline vs online eval: what each catches","LLM-as-judge: how to prompt it, correlation with human labels","RAGAS: faithfulness, answer relevancy, context precision, context recall","Trajectory efficiency for agents: steps taken vs optimal path","Eval dataset construction: distribution matching, contamination prevention","Regression detection: how to catch silent quality degradation","Calibration: why your pass threshold matters as much as your metric","Evaluation pyramid: unit → integration → end-to-end → user study"],
  infra: ["Continuous batching: how vLLM achieves high GPU utilization","KV cache: what it stores, why prefix caching saves money","Speculative decoding: drafter + verifier, when it helps","Quantization: GPTQ/AWQ (GPU), GGUF (CPU) — quality-latency tradeoffs","TTFT vs TPS vs P99 latency: what each signals about your system","Auto-scaling: why queue depth beats CPU for LLM workloads","Cold start: model loading latency and how to mitigate with warm pools","GPU memory math: model weights + KV cache + activations = VRAM budget"],
  finetune: ["When NOT to fine-tune: prompt engineering + RAG often cheaper","SFT: supervised fine-tuning on demonstrations — always first step","LoRA: low-rank decomposition, why rank matters, what r=8 means","QLoRA: 4-bit quantization + LoRA — fits large models on small hardware","DPO: direct preference optimization — simpler than RLHF, no reward model","GRPO: group relative policy optimization — for verifiable reward tasks","Eval during training: perplexity is not your task metric","Merging adapters: why you merge before serving, not at inference time"],
  safety: ["Prompt injection: direct vs indirect, how attackers embed instructions","Jailbreaks: roleplay, many-shot, context manipulation — attack surface is large","Input guardrails: before LLM; output guardrails: before user — dual-stage","Hallucination: types (intrinsic vs extrinsic), detection, mitigation","Constitutional AI: self-critique loop before final response","Red teaming: manual, automated fuzzing, adversarial benchmarks","PII: detection in inputs AND outputs — different tools for each","Logging for audit: what to store, retention policy, GDPR implications"],
  multimodal: ["Image tokenization: tile-based, token count scales with resolution","CLIP: contrastive image-text pretraining, zero-shot retrieval","Vision Transformers: patch embeddings, no convolutional inductive bias","Multimodal RAG: 4 approaches — late fusion, CLIP retrieval, ColPali, captioning","Failure modes: counting, spatial reasoning, small text, chart misread","Context assembly: where to put images relative to text for best recall","ColPali: query page images directly, no OCR required","Cost math: image tokens dominate in vision-heavy workloads"],
  pm: ["Metric hierarchy: task completion → quality → satisfaction → retention","Shadow mode: validate AI output quality before splitting real traffic","Eval criteria in PRD, not just acceptance criteria — ship with observability","Model tier decision framework: latency SLA x quality floor x cost ceiling","AI feature rollback: how to revert safely when quality regresses","Human-in-the-loop design: when to ask, when to act, when to explain","Cold start problem: AI features need warm-up data — plan the bootstrapping","Leading vs lagging indicators: what to watch daily vs weekly vs monthly"],
};

const DD_STAR = {
  rag: ["Tell me about a time you improved retrieval quality in a production system","Describe a retrieval failure that reached users — how did you detect and fix it","Walk me through how you'd design a RAG system for [domain in JD]"],
  agents: ["Tell me about a time an agent you built behaved unexpectedly in production","Describe how you'd architect a multi-agent system for [use case in JD]","Walk me through a time you had to add reliability controls to an agentic system"],
  eval: ["Tell me about an eval framework you built from scratch — what surprised you","Describe a time your offline eval missed something that production caught","Walk me through how you'd set quality gates for a new LLM feature"],
  infra: ["Tell me about a latency problem in an LLM system — how you found and fixed it","Describe a cost optimization you did on an inference system — numbers","Walk me through how you'd scale an LLM API to 10x current traffic"],
  finetune: ["Tell me about a fine-tuning project — what worked, what didn't","Describe how you chose between fine-tuning and prompt engineering for a task","Walk me through a dataset curation decision that significantly affected model quality"],
  safety: ["Tell me about a time you caught a safety issue before it reached users","Describe how you'd red team a new AI feature before launch","Walk me through your approach to evaluating a model for production safety"],
  multimodal: ["Tell me about a multimodal AI feature you built — technical decisions","Describe a failure mode unique to vision inputs that you encountered","Walk me through how you'd design a document understanding pipeline"],
  pm: ["Tell me about an AI product decision that required a difficult tradeoff","Describe how you measured success for an AI feature after launch","Walk me through how you'd prioritize an AI product roadmap with limited LLM budget"],
};

const DD_GOTCHAS = {
  rag: ["Chunk size feels like a hyperparameter but it's really a design decision — wrong size invalidates your entire retrieval strategy","Freshness is not free: nightly re-ingestion misses same-day updates that users expect to see","Hybrid search alpha (BM25 weight vs dense weight) needs tuning per query type — no universal default","Reranking with a cross-encoder adds latency that compounds badly under load — budget for it early"],
  agents: ["Every tool call is a latency multiplier — a 5-step agent with 500ms tools takes 2.5s minimum","Scope creep is the most underrated agent failure: it completes adjacent tasks you didn't ask for","No step budget = no production readiness — a loop that runs forever looks identical to one that takes 30 seconds","Context accumulates: long agent runs hit context limits you never hit in unit tests"],
  eval: ["A metric that can't detect regressions is theater — calibrate before you ship","LLM-as-judge is biased toward longer, more verbose outputs — control for length","Eval datasets go stale: the distribution your model was measured on drifts from what users actually ask","The eval you run on demo data will always look better than the eval you run on production data"],
  infra: ["vLLM's continuous batching only helps at sustained load — if you have bursty traffic, you still need auto-scaling","KV cache hit rate drops to zero on every cold restart — warm-up your prefix cache after deploys","Quantization changes output distribution subtly — A/B test quality after switching, don't assume parity","GPU memory OOM at inference is harder to debug than training OOM because it's load-dependent"],
  finetune: ["SFT on 1000 bad examples beats SFT on 100 good examples — data quality is everything","DPO requires preference pairs where the chosen response is clearly better — noisy pairs hurt","Eval perplexity drops during training while task performance plateaus — don't use perplexity as a proxy for quality","Merging failure: adapter trained on one base model version rarely transfers cleanly to another version"],
  safety: ["Defense-in-depth is not optional: in 2026, 80-94% of jailbreak attempts succeed on proprietary models with single-layer defenses","Indirect prompt injection (attacker embeds instructions in retrieved documents) is harder to defend than direct injection","Output guardrails catch things input guardrails miss — you need both","Logging for safety is a feature, not an afterthought — you can't investigate an incident without traces"],
  multimodal: ["Image token cost scales quadratically with resolution — a 1024px image costs 4x a 512px image","ColPali sounds magical but needs GPU for the visual encoder at query time — budget for it","Spatial reasoning failures are silent: the model gives a confident wrong answer with no hedging","Document understanding degrades sharply on scanned PDFs — always test with production-quality scans, not demo PDFs"],
  pm: ["'The model is good enough' is not an eval criterion — define what good enough means in measurable terms before building","AI features require ongoing maintenance: model providers change APIs, pricing, and behavior with no notice","A/B testing AI features is harder than normal features: effects compound and contaminate over long windows","Your most important metric is the one you didn't think to measure until month 3 — define a metric review cadence upfront"],
};

const DD_QUESTIONS = {
  rag: ["What does your current retrieval pipeline look like — what's the biggest quality gap?","How do you handle document freshness — is there a staleness problem today?","What's the eval suite for retrieval quality — and what's the failure rate in production?","How do you handle multi-hop questions that need information from multiple documents?","What's the bottleneck in your RAG stack today — retrieval quality, generation, or latency?"],
  agents: ["How autonomous are your agents today — where do humans stay in the loop?","What's the longest-running agent task in production — how do you handle failures mid-run?","How do you evaluate agent trajectory quality beyond final output?","What's the biggest reliability problem with your agentic system right now?","How do you handle tool call failures — retry logic, fallback, escalation?"],
  eval: ["What does your eval pipeline look like — offline, online, or both?","How do you detect quality regressions between model versions?","Is LLM-as-judge part of your eval stack — how do you trust the judge?","What's the eval metric you trust most and the one you're most uncertain about?","How often does your eval dataset get refreshed — how do you prevent staleness?"],
  infra: ["What's your current P99 latency and where does most of that time go?","How do you handle traffic spikes — what's the auto-scaling strategy?","Are you running your own inference stack or using managed APIs — what drove that decision?","What's the GPU cost per 1M tokens today — and what's the target?","How do you handle model updates — blue/green, canary, or full swap?"],
  finetune: ["What's the training data pipeline — how do you ensure quality at scale?","How do you know when fine-tuning is working — what's the eval signal?","Are you doing SFT, DPO, RLHF, or some combination — what drove that choice?","How do you handle catastrophic forgetting across fine-tuning iterations?","What's the iteration cycle time from data to deployed model — and what's the bottleneck?"],
  safety: ["What's your current red teaming process — manual, automated, or both?","How do you handle prompt injection in user-provided inputs?","What's logged for safety audit — and who reviews it?","How do you decide what content policies to enforce vs. defer to the user?","What's the incident response process when a safety issue reaches users?"],
  multimodal: ["What modalities are you processing today — and what's next on the roadmap?","How do you handle image quality variance in production inputs?","What's the token cost for your average image-heavy request?","How do you eval multimodal outputs — human review, automated, or both?","What's the most surprising failure mode you've seen with vision inputs in production?"],
  pm: ["How does the team currently decide what to build with AI vs. without?","What does the eval process look like before an AI feature ships?","How do you measure success for AI features post-launch — what's the north star metric?","What's the biggest gap between what AI can do and what users expect it to do?","How does AI infrastructure investment get prioritized against product features?"],
};

const DD_PRIORITY_LABELS = { must: "Must Know", well: "Know Well", aware: "Be Aware Of" };
const DD_PRIORITY_COLORS = {
  must:  { badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",   row: "bg-rose-500/5" },
  well:  { badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", row: "bg-amber-500/5" },
  aware: { badge: "bg-zinc-700/40 text-zinc-400 border-zinc-600/30",    row: "" },
};

function priorityTier(hits) {
  if (hits >= 3) return "must";
  if (hits >= 1) return "well";
  return "aware";
}

const DD_TAB_IDS = ["priority","design","mustknow","star","gotchas"];
const DD_TAB_LABELS = { priority:"Topic Priorities", design:"System Design", mustknow:"Must-Know 8", star:"STAR Starters", gotchas:"Gotchas & Questions" };

function DefenseDocMode({ onExit }) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState("priority");

  function generate() {
    if (jd.trim().length < 50) return;
    const scored = detectDomains(jd);
    const top = scored[0];
    const cheatsheet = DD_CHEATSHEETS[top.id] || DD_CHEATSHEETS.rag;
    const mustknow   = DD_MUSTKNOW[top.id]    || DD_MUSTKNOW.rag;
    const stars      = DD_STAR[top.id]         || DD_STAR.rag;
    const gotchas    = DD_GOTCHAS[top.id]      || DD_GOTCHAS.rag;
    const questions  = DD_QUESTIONS[top.id]    || DD_QUESTIONS.rag;
    setResult({ scored, top, cheatsheet, mustknow, stars, gotchas, questions });
    setActiveSection("priority");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">🛡 Defense Doc</h2>
            <p className="text-zinc-400 text-sm">Interview War Room Brief</p>
          </div>
        </div>

        {/* JD Input */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-4">
          <label className="block text-sm font-medium text-zinc-300">Paste the Job Description</label>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            rows={8}
            placeholder="Paste the full job description here (at least 50 characters)..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">{jd.trim().length} characters</span>
            <button
              onClick={generate}
              disabled={jd.trim().length < 50}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Generate War Room Brief
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">

            {/* Top Domain Banner */}
            <div
              className="rounded-2xl p-4 border flex items-center gap-4"
              style={{ borderColor: result.top.color + "60", backgroundColor: result.top.color + "10" }}
            >
              <div className="text-3xl">🎯</div>
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-0.5">Primary Domain Detected</p>
                <p className="font-bold text-lg" style={{ color: result.top.color }}>{result.top.label}</p>
                <p className="text-xs text-zinc-500">{result.top.hits} keyword{result.top.hits !== 1 ? "s" : ""} matched · All sections tailored to this domain</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 flex-wrap">
              {DD_TAB_IDS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSection(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    activeSection === tab
                      ? "bg-rose-600 border-rose-500 text-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {DD_TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab: Priority Table */}
            {activeSection === "priority" && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-zinc-100">Topic Priority Table</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Ranked by keyword density in your JD</p>
                </div>
                <div className="divide-y divide-zinc-800">
                  {result.scored.map(domain => {
                    const tier = priorityTier(domain.hits);
                    const colors = DD_PRIORITY_COLORS[tier];
                    return (
                      <div key={domain.id} className={`flex items-center justify-between px-5 py-3 ${colors.row}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: domain.color }} />
                          <span className="text-sm text-zinc-200">{domain.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500">{domain.hits} hit{domain.hits !== 1 ? "s" : ""}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${colors.badge}`}>
                            {DD_PRIORITY_LABELS[tier]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: System Design Cheat Sheet */}
            {activeSection === "design" && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-zinc-100">System Design Cheat Sheet</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Tailored to {result.top.label}</p>
                </div>
                <ul className="divide-y divide-zinc-800">
                  {result.cheatsheet.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                      <span className="text-rose-400 font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <span className="text-sm text-zinc-200 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab: Must-Know 8 */}
            {activeSection === "mustknow" && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-zinc-100">8 Must-Know Concepts Cold</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Non-negotiables for this role — know these without hesitation</p>
                </div>
                <ol className="divide-y divide-zinc-800">
                  {result.mustknow.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: result.top.color + "25", color: result.top.color }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-200 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tab: STAR Starters */}
            {activeSection === "star" && (
              <div className="space-y-3">
                <div className="px-1">
                  <h3 className="font-semibold text-zinc-100">3 STAR Story Starters</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Behavioral prompts matched to your detected focus area</p>
                </div>
                {result.stars.map((starter, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-start gap-4"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: result.top.color + "25", color: result.top.color }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200 leading-relaxed font-medium">"{starter}"</p>
                      <p className="text-xs text-zinc-500 mt-2">Prepare a 2-min STAR response: Situation → Task → Action → Result</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Gotchas + Questions */}
            {activeSection === "gotchas" && (
              <div className="space-y-4">
                {/* Gotchas */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-zinc-100">Production Gotchas</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Hard-won lessons for the {result.top.label} domain</p>
                  </div>
                  <ul className="divide-y divide-zinc-800">
                    {result.gotchas.map((g, i) => (
                      <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                        <span className="text-amber-400 text-sm flex-shrink-0 mt-0.5">⚠</span>
                        <span className="text-sm text-zinc-200 leading-relaxed">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Questions */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-zinc-100">5 Questions to Ask the Interviewer</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Tailored to the {result.top.label} domain</p>
                  </div>
                  <ol className="divide-y divide-zinc-800">
                    {result.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                        <span className="text-emerald-400 font-bold text-sm flex-shrink-0 mt-0.5">Q{i + 1}</span>
                        <span className="text-sm text-zinc-200 leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}


// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

const MODE_CARDS = [
  {
    id: "exam", icon: "⏱", title: "Combined Assessment", subtitle: "Timed Exam",
    description: "Timed 15–60 min exam with configurable focus and difficulty. All scores hidden until the end. Animated results reveal with per-topic breakdown.",
    border: "border-indigo-500/40 hover:border-indigo-400", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
  },
  {
    id: "trainer", icon: "🎯", title: "Trainer", subtitle: "Immediate Feedback",
    description: "Answer questions one by one with instant color-coded reveal, explanation, and reading links. Tracks weak topics and recommends what to study next.",
    border: "border-emerald-500/40 hover:border-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  },
  {
    id: "jdprep", icon: "📋", title: "JD + Resume Prep", subtitle: "Targeted Session",
    description: "Paste a job description to detect skill requirements. Optionally paste your resume for gap analysis. Get a 20-question drill weighted to your gaps.",
    border: "border-violet-500/40 hover:border-violet-400", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30"
  },
  {
    id: "companyprep", icon: "🏢", title: "Company Prep Tracks", subtitle: "Archetype Targeting",
    description: "4 company archetypes: Big Tech AI, AI-native startups, Indian tech, Enterprise AI. Weighted question sets + company-specific system design challenges.",
    border: "border-amber-500/40 hover:border-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  {
    id: "defense", icon: "🛡", title: "Defense Doc", subtitle: "Interview War Room",
    description: "Paste a job description. Get your personalized pre-interview brief: topic priorities, system design cheat sheet, must-know concepts, STAR story starters, and questions to ask.",
    border: "border-rose-500/40 hover:border-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30"
  }
];

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export default function PrepLab({ onNavigate }) {
  const [mode, setMode] = useState(null);

  if (mode === "exam") return <ExamMode onExit={() => setMode(null)} />;
  if (mode === "trainer") return <TrainerMode onExit={() => setMode(null)} onNavigate={onNavigate} />;
  if (mode === "jdprep") return <JDPrepMode onExit={() => setMode(null)} onNavigate={onNavigate} />;
  if (mode === "companyprep") return <CompanyPrepMode onExit={() => setMode(null)} onNavigate={onNavigate} />;
  if (mode === "defense") return <DefenseDocMode onExit={() => setMode(null)} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
        <div className="text-center space-y-3 pt-6 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">PrepLab</h1>
          <p className="text-zinc-400 text-base sm:text-lg">Interview prep and assessment for GenAI roles</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {Object.entries(TOPIC_LABELS).map(([t, l]) => (
              <span key={t} className={`text-xs px-2.5 py-1 rounded-full border ${TOPIC_COLORS[t]}`}>{l}</span>
            ))}
          </div>
          <p className="text-zinc-600 text-sm">{PREP_QUESTIONS.length} questions across 8 topics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODE_CARDS.map(card => (
            <div
              key={card.id}
              onClick={() => setMode(card.id)}
              className={`bg-zinc-900 rounded-2xl p-6 border-2 ${card.border} transition-all cursor-pointer group`}
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-semibold text-zinc-100 text-lg mb-1">{card.title}</h3>
              <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border mb-3 ${card.badge}`}>{card.subtitle}</span>
              <p className="text-zinc-400 text-sm leading-relaxed">{card.description}</p>
              <div className="mt-5">
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Start →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
