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
};

const TOPIC_LABELS = {
  rag: "RAG", agents: "Agents", finetuning: "Fine-Tuning",
  evaluation: "Evaluation", llmops: "LLMOps",
  safety: "Safety", product: "Product", behavioral: "Behavioral"
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
  }
];

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export default function PrepLab({ onNavigate }) {
  const [mode, setMode] = useState(null);

  if (mode === "exam") return <ExamMode onExit={() => setMode(null)} />;
  if (mode === "trainer") return <TrainerMode onExit={() => setMode(null)} onNavigate={onNavigate} />;
  if (mode === "jdprep") return <JDPrepMode onExit={() => setMode(null)} onNavigate={onNavigate} />;
  if (mode === "companyprep") return <CompanyPrepMode onExit={() => setMode(null)} onNavigate={onNavigate} />;

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
