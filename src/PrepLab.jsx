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
    readMore: { label: "RAG Evaluation Deep Dive", tab: "groundtruth", postId: "llm-evaluation-guide" }
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
    readMore: { label: "Stale Document Retrieval", tab: "groundtruth", postId: "stale-document-failure" }
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
    readMore: { label: "RAG Metrics Explained", tab: "groundtruth", postId: "llm-evaluation-guide" }
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
    readMore: { label: "Evaluation Metrics for RAG", tab: "groundtruth", postId: "llm-evaluation-guide" }
  },
  {
    id: "eval-2", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "G-Eval scores your outputs at 4.2/5 consistently. What is the main risk of trusting this?",
    options: ["Model is biased toward longer outputs", "Positional bias — the LLM judge may score consistently high for stylistic reasons unrelated to actual quality", "G-Eval only works for summarization", "Token cost is too high"],
    correct: 1, keywords: [],
    explanation: "LLM-as-judge has known biases: verbosity bias, positional bias, self-preference bias. A consistently high score may indicate the judge is rewarding style rather than semantic accuracy. Calibration against human ratings is essential.",
    readMore: { label: "LLM-as-Judge Pitfalls", tab: "groundtruth", postId: "hallucination-detection" }
  },
  {
    id: "eval-3", topic: "evaluation", difficulty: "hard", type: "text",
    question: "You are building an eval suite for a customer support chatbot. Define 3 metrics, explain what each catches, and describe a case where each gives a false positive.",
    options: null, correct: null,
    keywords: ["groundedness", "relevance", "faithfulness", "false positive", "resolution", "tone"],
    explanation: "Good metrics: groundedness (catches hallucination but FP on well-phrased hallucinations), task completion (catches unhelpful responses but FP on technically-correct-but-useless answers), tone compliance (catches rude responses but FP on direct helpful answers scored as curt).",
    readMore: { label: "Building Eval Suites", tab: "groundtruth", postId: "eval-pipeline-design" }
  },
  {
    id: "eval-4", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "Your eval set has 200 questions from one domain. You ship a new model. Evals pass. Production CSAT drops. Why?",
    options: ["The eval set has too many questions", "Eval set does not represent the full distribution of production queries — distribution shift", "Model needs fine-tuning", "LLM judge was biased"],
    correct: 1, keywords: [],
    explanation: "An eval set sampled from one domain will miss out-of-distribution queries. Production has long-tail edge cases, adversarial inputs, and evolving language patterns not captured in a static narrow eval set.",
    readMore: { label: "Eval Set Design", tab: "groundtruth", postId: "eval-pipeline-design" }
  },
  {
    id: "eval-5", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "The difference between online and offline evaluation in LLM systems is:",
    options: ["Offline is faster", "Offline uses static test sets before deployment; online measures real user signals in production (CSAT, thumbs, task completion)", "Online evaluation uses better metrics", "They are interchangeable"],
    correct: 1, keywords: [],
    explanation: "Offline eval = pre-deployment, controlled, fast iteration. Online eval = post-deployment, real distribution, real user signals. Both are needed — a system can pass offline eval but fail online.",
    readMore: { label: "Eval Infrastructure", tab: "groundtruth", postId: "llmops-production-checklist" }
  },
  {
    id: "eval-6", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "You ask an LLM judge to rate responses 1-5. Inter-annotator agreement with humans is 0.61 (Cohen kappa). How should you interpret this?",
    options: ["Strong agreement — ship the judge", "Moderate agreement — use the judge for directional signals but not absolute quality gates", "Weak agreement — the judge is useless", "Good agreement but needs more data"],
    correct: 1, keywords: [],
    explanation: "Kappa 0.61 is moderate agreement. Use it for A/B comparisons and regression detection, not as an absolute correctness gate.",
    readMore: { label: "Evaluation Methodology", tab: "groundtruth", postId: "llm-evaluation-guide" }
  },
  {
    id: "eval-7", topic: "evaluation", difficulty: "hard", type: "text",
    question: "Why is 'LLM-as-judge' unreliable for evaluating outputs of the same model family used for generation? What experimental design controls for this?",
    options: null, correct: null,
    keywords: ["self-preference", "same model", "bias", "independent", "different model", "human", "calibration"],
    explanation: "Models from the same family share training biases, leading to self-preference bias. Control: use a judge from a different model family, or blind human eval on a representative sample.",
    readMore: { label: "LLM-as-Judge Design", tab: "groundtruth", postId: "llm-evaluation-guide" }
  },
  {
    id: "eval-8", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "RAGAS framework evaluates RAG systems on which 4 dimensions?",
    options: ["Precision, Recall, F1, Accuracy", "Faithfulness, Answer Relevancy, Context Precision, Context Recall", "Groundedness, Coherence, Fluency, Completeness", "Latency, Cost, Accuracy, Reliability"],
    correct: 1, keywords: [],
    explanation: "RAGAS: Faithfulness (claims grounded in context?), Answer Relevancy (does the answer address the question?), Context Precision (are retrieved docs relevant?), Context Recall (were relevant docs retrieved?).",
    readMore: { label: "RAGAS Framework", tab: "groundtruth", postId: "llm-evaluation-guide" }
  },
  {
    id: "eval-9", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "You run an A/B test. Version B has +12% groundedness but -8% answer relevancy. You should:",
    options: ["Ship B — groundedness is more important", "Roll back to A", "Investigate whether the relevancy drop is in a critical query category before deciding", "Run more tests"],
    correct: 2, keywords: [],
    explanation: "Aggregate metrics hide per-category behavior. A -8% relevancy drop might be uniformly small or concentrated in high-value query types. Always decompose metric changes by query category before shipping.",
    readMore: { label: "A/B Testing RAG Systems", tab: "groundtruth", postId: "ab-testing-llms" }
  },
  {
    id: "eval-10", topic: "evaluation", difficulty: "hard", type: "text",
    question: "Your team is debating whether to use GPT-4o or Claude Sonnet as the LLM judge for your eval pipeline. What criteria should drive this decision?",
    options: null, correct: null,
    keywords: ["independent", "calibration", "bias", "cost", "speed", "human agreement", "family"],
    explanation: "Key criteria: avoid same-family models (self-preference bias), measure calibration against held-out human labels, cost/speed tradeoff, consistency across runs (temperature=0), structured output support.",
    readMore: { label: "Choosing an LLM Judge", tab: "groundtruth", postId: "llm-evaluation-guide" }
  },
  {
    id: "eval-11", topic: "evaluation", difficulty: "hard", type: "mcq",
    question: "Evals pass on your golden dataset but fail on a newly collected adversarial set. The correct production response is:",
    options: ["Discard the adversarial set as outliers", "Add representative adversarial examples to your eval suite and treat it as a permanent regression category", "Switch to a bigger model", "Increase temperature"],
    correct: 1, keywords: [],
    explanation: "Golden datasets calcify. Production evolves. Adversarial failures reveal real distribution gaps. Incorporate them into your eval suite so future regressions are caught before deployment.",
    readMore: { label: "Adversarial Evals", tab: "groundtruth", postId: "red-teaming-llms" }
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
  {
    id: "product-6", topic: "product", difficulty: "hard", type: "mcq",
    question: "A new LLM feature launches and your primary metric (task completion) improves 12%, but 7-day retention drops 4%. What do you do?",
    options: ["Ship it — primary metric wins", "Roll back immediately", "Pause the rollout, segment the retention drop to find if specific user cohorts are churning, then decide", "Run a longer A/B test"],
    correct: 2, keywords: [],
    explanation: "Retention drop is a guardrail regression. A 12% task completion lift that costs 4% of your users coming back is a bad trade. But you need to understand the causal chain — is the feature itself causing churn, or is this a novelty effect? Segmentation tells you which users and which sessions are driving the drop.",
    readMore: { label: "AI Product Metrics", tab: "concepts" }
  },
  {
    id: "product-7", topic: "product", difficulty: "hard", type: "text",
    question: "Your CEO asks: 'Why can't we just replace our customer support team with an LLM?' What do you say?",
    options: null, correct: null,
    keywords: ["accuracy", "escalation", "edge case", "trust", "liability", "cost", "hallucin", "eval", "benchmark", "pilot"],
    explanation: "Key points: LLMs hallucinate — wrong answers in support create liability and erode trust. Accuracy must be measured on your actual ticket corpus, not general benchmarks. Start with automation for high-confidence, low-stakes cases. Build an escalation path for everything else. Measure deflection rate AND satisfaction AND escalation rate together.",
    readMore: { label: "Production AI reliability", tab: "groundtruth", postId: "llm-reliability-production" }
  },
  {
    id: "product-8", topic: "product", difficulty: "hard", type: "mcq",
    question: "You have 4 weeks to ship an MVP AI feature. Engineering wants to use fine-tuning. PM wants to use prompt engineering. Who is right?",
    options: ["Engineering — fine-tuning always produces better results", "PM — prompt engineering first, fine-tune only after you have labeled data proving the baseline fails", "Neither — use RAG", "It depends entirely on whether you have a GPU budget"],
    correct: 1, keywords: [],
    explanation: "Fine-tuning requires labeled training data you don't have yet, weeks of iteration, and a deployment pipeline. Prompt engineering ships in days and teaches you what the actual failure modes are. You cannot write good training labels until you know where prompting breaks. Start fast, collect failure cases, then fine-tune if needed.",
    readMore: { label: "Fine-tuning vs. prompting tradeoffs", tab: "groundtruth", postId: "fine-tuning-when-and-why" }
  },
  {
    id: "product-9", topic: "product", difficulty: "hard", type: "text",
    question: "Describe how you would structure a quarterly roadmap review for an AI product. What is different vs. a traditional software product review?",
    options: null, correct: null,
    keywords: ["eval", "metric", "failure", "model", "drift", "benchmark", "data", "regression", "cost", "quality"],
    explanation: "AI product reviews differ in 3 ways: (1) Model regressions must be tracked — a model update from the provider can break behavior silently. (2) Data drift means last quarter's eval results may not reflect today. (3) Cost-per-query is a first-class roadmap input alongside user value. Review includes: eval score trends, failure mode analysis, prompt change log, token cost trend, model version changelog.",
    readMore: { label: "AI Product Management", tab: "concepts" }
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
    readMore: { label: "GPT-4o Deep Dive →", tab: "groundtruth", postId: "how-chatgpt-works" }
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
    readMore: { label: "Claude vs GPT-4o deep dive →", tab: "groundtruth", postId: "how-claude-works" }
  },
  {
    id: "rsn-6", topic: "reasoning", difficulty: "hard", type: "mcq",
    question: "You prompt an o3 model with 'think step by step' explicitly. What happens?",
    options: ["Quality improves further", "No effect or slight degradation — reasoning models already do chain-of-thought internally, adding it to the prompt is redundant and may corrupt the thinking process", "The model produces a visible scratchpad", "It reduces thinking token usage"],
    correct: 1, keywords: [],
    explanation: "Chain-of-thought prompting was designed for standard models that don't natively reason. Reasoning models like o1/o3/Claude extended thinking run CoT internally. Adding it to the system prompt can clash with the model's internal reasoning strategy. Trust the model's thinking budget, not CoT prompt tricks.",
    readMore: { label: "Reasoning Models Lab →", tab: "systems" }
  },
  {
    id: "rsn-7", topic: "reasoning", difficulty: "hard", type: "mcq",
    question: "A reasoning model scores 92% on your eval but takes 40s per call. Your SLA is 5s. Best approach?",
    options: ["Cache all responses", "Use a reasoning model for offline batch processing and a faster model for real-time with an async 'thinking mode' for users who opt in", "Reduce thinking tokens to 512", "Accept the latency — quality matters more"],
    correct: 1, keywords: [],
    explanation: "Latency and reasoning depth are fundamentally in tension. The correct architecture separates the use cases: real-time paths use a fast model; async or background tasks use the reasoning model. An opt-in 'deep analysis' mode lets power users accept the 40s wait for higher-quality output.",
    readMore: { label: "Reasoning model economics →", tab: "systems" }
  },
  {
    id: "rsn-8", topic: "reasoning", difficulty: "medium", type: "mcq",
    question: "Why does giving a reasoning model 'extended thinking' sometimes produce a WORSE answer than a smaller thinking budget?",
    options: ["The model forgets earlier context", "Overthinking — the model second-guesses a correct initial conclusion, explores low-probability paths, and converges on a wrong answer", "Token limit is exceeded", "The model runs out of RAM"],
    correct: 1, keywords: [],
    explanation: "Overthinking is a documented failure mode. On straightforward problems, longer reasoning chains introduce noise. Best practice: use the minimum thinking budget that achieves acceptable accuracy on your eval set. Blindly maximizing thinking tokens can reduce quality.",
    readMore: { label: "Reasoning Models Lab →", tab: "systems" }
  },
  {
    id: "rsn-9", topic: "reasoning", difficulty: "hard", type: "text",
    question: "You are evaluating whether to use a reasoning model (o3) vs. a standard model (GPT-4o) for a new feature. Walk through your decision framework.",
    options: null, correct: null,
    keywords: ["latency", "cost", "complexity", "planning", "benchmark", "eval", "routing", "SLA", "accuracy"],
    explanation: "Decision framework: (1) Task type — does it require multi-step planning, backtracking, or verification? If yes, reasoning model is justified. (2) Latency SLA — can users wait 10-40s? If not, reasoning model needs async mode. (3) Cost — reasoning tokens are 5-10x more expensive. Calculate cost/query at expected volume. (4) Run your eval on both models with your actual query distribution — general benchmarks don't predict your specific use case. (5) Consider a routing architecture for mixed workloads.",
    readMore: { label: "Reasoning Models Lab →", tab: "systems" }
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
    readMore: { label: "Llama Deep Dive →", tab: "groundtruth", postId: "llama-open-models" }
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
  },
  {
    id: "flashattn-1", topic: "attention", difficulty: "hard", type: "mcq",
    question: "Flash Attention achieves sub-quadratic HBM I/O complexity primarily through:",
    options: ["Approximate attention with locality-sensitive hashing", "Tiling inputs into SRAM blocks and avoiding full N×N materialization", "Sparse attention patterns that skip non-local tokens", "Quantizing the attention weights to INT8"],
    correct: 1, keywords: [],
    explanation: "Flash Attention tiles the query/key/value matrices into SRAM-sized blocks and computes attention incrementally using the online softmax trick. This avoids writing the O(N²) attention matrix to HBM, reducing memory I/O from O(N²) to O(N). LSH attention (Reformer) is a different approach. Sparsity and quantization are orthogonal techniques.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "flashattn-2", topic: "attention", difficulty: "medium", type: "mcq",
    question: "Grouped Query Attention (GQA) improves inference efficiency by:",
    options: ["Increasing the number of attention heads", "Sharing key-value heads across multiple query heads", "Applying flash attention to grouped token windows", "Removing the value projection matrix"],
    correct: 1, keywords: [],
    explanation: "GQA groups multiple query heads to share a single KV head, reducing KV cache size proportionally. For example, with 32 query heads and 8 KV heads, KV cache is 4× smaller. This is the default in Llama-3 and Mistral. It's orthogonal to Flash Attention (which is about IO complexity, not head count).",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "flashattn-3", topic: "attention", difficulty: "hard", type: "mcq",
    question: "The 'online softmax' trick in Flash Attention allows:",
    options: ["Fusing the softmax and matmul into a single kernel", "Computing softmax without seeing all attention scores simultaneously", "Replacing softmax with a linear approximation", "Parallelizing softmax across multiple GPUs"],
    correct: 1, keywords: [],
    explanation: "Online softmax maintains a running max and running sum as it processes tiles, allowing it to compute numerically stable softmax incrementally. This means Flash Attention never needs to materialize the full N×N score matrix — it can compute the output tile-by-tile. This is the key algorithmic insight that enables O(N) HBM reads.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "flashattn-4", topic: "attention", difficulty: "medium", type: "mcq",
    question: "Flash Attention v2 improved over v1 primarily by:",
    options: ["Supporting longer sequence lengths via disk offloading", "Better parallelization across attention heads and sequence length dimension", "Switching from FP16 to INT8 arithmetic", "Adding support for causal masking for the first time"],
    correct: 1, keywords: [],
    explanation: "Flash Attention v2 introduced better work partitioning: parallelism across both attention heads AND the sequence length dimension (using warp-level parallelism). It also reduced non-matmul FLOPs. v1 only parallelized across the batch and head dimensions, leaving GPU utilization on the table for long sequences.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "quant-1", topic: "quantization", difficulty: "medium", type: "mcq",
    question: "GPTQ differs from standard post-training quantization by:",
    options: ["Quantizing one layer at a time using second-order information to minimize output error", "Using QAT (quantization-aware training) with gradient checkpointing", "Applying quantization only to attention weights, not FFN weights", "Requiring a labeled dataset of 10K+ examples"],
    correct: 0, keywords: [],
    explanation: "GPTQ uses an OBQ (Optimal Brain Quantization) approach: it quantizes weights one-by-one per layer, using the Hessian (second-order information) to compensate for quantization error in remaining weights. This gives better quality than naive round-to-nearest. It only needs a small calibration set (~128 samples), not labeled data.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "quant-2", topic: "quantization", difficulty: "hard", type: "mcq",
    question: "AWQ (Activation-aware Weight Quantization) achieves better quality than GPTQ by:",
    options: ["Keeping 1% of weights in FP16 based on activation magnitude", "Using 3-bit quantization instead of 4-bit", "Applying quantization after each training step", "Reducing the model's vocabulary size before quantization"],
    correct: 0, keywords: [],
    explanation: "AWQ observes that a small subset of weights (~1%) are 'salient' — their corresponding input activations have large magnitudes, making them highly sensitive to quantization error. AWQ protects these weights by keeping them in FP16 or scaling them before quantization. This preserves model quality without requiring the complex per-weight Hessian computation of GPTQ.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "quant-3", topic: "quantization", difficulty: "medium", type: "mcq",
    question: "A 7B parameter model in FP16 requires approximately how much VRAM?",
    options: ["~3.5 GB", "~7 GB", "~14 GB", "~28 GB"],
    correct: 2, keywords: [],
    explanation: "FP16 uses 2 bytes per parameter. 7B × 2 bytes = 14 GB for weights alone. During inference you also need activation memory (~1-2 GB), so ~15-16 GB total. This is why a 7B model fits on a 24GB consumer GPU (RTX 3090/4090) in FP16 but not INT4 (~4 GB for weights), which enables it to run even on 8GB GPUs.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "quant-4", topic: "quantization", difficulty: "hard", type: "mcq",
    question: "NF4 (Normal Float 4) used in QLoRA is specifically designed to:",
    options: ["Minimize rounding error for uniformly distributed weights", "Optimally quantize weights that follow a normal distribution", "Support hardware-native 4-bit arithmetic on H100s", "Replace FP16 activations to reduce memory bandwidth"],
    correct: 1, keywords: [],
    explanation: "NF4 is an information-theoretically optimal quantization for normally distributed data. It places quantization levels non-uniformly: more levels near zero (where most weights cluster) and fewer at extremes. This minimizes quantization error for pretrained model weights, which empirically follow a normal distribution. It's not a hardware format — operations are dequantized to BF16 for actual compute.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "serving-1", topic: "serving", difficulty: "medium", type: "mcq",
    question: "PagedAttention (used in vLLM) solves which core serving problem?",
    options: ["Slow tokenization for long prompts", "KV cache memory fragmentation and waste from pre-allocation", "Load imbalancing across multiple GPUs", "Slow attention computation for long sequences"],
    correct: 1, keywords: [],
    explanation: "Before PagedAttention, serving systems pre-allocated a contiguous KV cache block for each request's maximum sequence length. This caused internal fragmentation (reserved but unused memory) and made it impossible to share KV cache across requests. PagedAttention stores KV cache in non-contiguous 'pages' (like OS virtual memory), enabling near-zero waste and 2-4× more concurrent requests.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "serving-2", topic: "serving", difficulty: "hard", type: "mcq",
    question: "Continuous batching improves GPU throughput over static batching by:",
    options: ["Running smaller batch sizes to reduce memory pressure", "Allowing new requests to join the batch as sequences complete mid-iteration", "Pre-computing KV caches for all requests before starting generation", "Quantizing the KV cache to INT8 during serving"],
    correct: 1, keywords: [],
    explanation: "Static batching must wait for the longest sequence in a batch to finish before accepting new requests, leaving GPUs idle. Continuous (or iteration-level) batching processes one token generation step per iteration and immediately adds new requests as slots free up. This keeps GPU utilization near 100% and dramatically improves throughput (2-4×) for heterogeneous sequence lengths.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "serving-3", topic: "serving", difficulty: "medium", type: "mcq",
    question: "SGLang's RadixAttention outperforms standard prefix caching when:",
    options: ["Serving very short prompts under 100 tokens", "Multiple requests share multi-level common prefixes in a tree structure", "Running on CPUs rather than GPUs", "Using INT4 quantized models"],
    correct: 1, keywords: [],
    explanation: "RadixAttention organizes cached KV states in a radix tree, enabling efficient reuse even when prefixes share only partial overlaps (e.g., same system prompt + different few-shot examples). Standard prefix caching only handles exact prefix matches. For agent systems and multi-turn conversations with branching contexts, RadixAttention achieves much higher cache hit rates.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "serving-4", topic: "serving", difficulty: "hard", type: "mcq",
    question: "When choosing between vLLM and TensorRT-LLM for production, the primary differentiator is:",
    options: ["vLLM supports more model architectures; TRT-LLM gives higher throughput on NVIDIA hardware with more engineering", "TRT-LLM is open source; vLLM is proprietary", "vLLM only supports A100 GPUs; TRT-LLM supports all NVIDIA GPUs", "TRT-LLM uses continuous batching; vLLM uses static batching"],
    correct: 0, keywords: [],
    explanation: "vLLM is the most flexible framework (wide model support, simple deployment, excellent for most teams) while TensorRT-LLM requires model-specific engine compilation but achieves higher raw throughput on NVIDIA GPUs via custom CUDA kernels and TensorRT optimization. For most teams vLLM is the right starting point; TRT-LLM is worth the complexity only at very high scale.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "cache-1", topic: "caching", difficulty: "medium", type: "mcq",
    question: "Prompt caching works by storing and reusing which part of the inference computation?",
    options: ["The model weights compressed to FP8", "The KV cache for the common prefix of a prompt", "The logit distribution for common output tokens", "The tokenized representation of the system prompt"],
    correct: 1, keywords: [],
    explanation: "When requests share a common prefix (system prompt, few-shot examples, document), the KV cache computed for that prefix can be stored server-side and reused. On a cache hit, the model skips computing attention over those tokens entirely, reducing both TTFT and cost. Only the KV tensors are cached — not weights or logits.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "cache-2", topic: "caching", difficulty: "hard", type: "mcq",
    question: "For prompt caching to activate on Anthropic's API, the minimum cache-eligible prefix length is:",
    options: ["128 tokens", "512 tokens", "1024 tokens", "4096 tokens"],
    correct: 2, keywords: [],
    explanation: "Anthropic requires a minimum of 1024 tokens in the cache-eligible prefix (the part marked with cache_control: ephemeral or in the system prompt). OpenAI's automatic prefix caching activates at 1024 tokens as well. Shorter prefixes aren't worth caching because the overhead of cache lookup and storage management exceeds the savings.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "cache-3", topic: "caching", difficulty: "medium", type: "mcq",
    question: "The cost structure for prompt caching on Anthropic's API is:",
    options: ["Cache reads are free; cache writes cost 2× normal input price", "Cache writes cost 1.25× normal input price; cache reads cost 0.1×", "Cache reads and writes both cost 0.5× normal input price", "Caching requires a separate API tier with flat monthly pricing"],
    correct: 1, keywords: [],
    explanation: "Anthropic charges 1.25× input token price for cache writes (computing and storing the KV cache) and 0.1× for cache reads (retrieving it). So caching saves money when the same prefix is read many times — the break-even is roughly 9 reads to recoup the write premium. For system prompts used across thousands of requests, savings are 80-90%.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "cache-4", topic: "caching", difficulty: "hard", type: "mcq",
    question: "Prompt caching is most cost-effective for which workload pattern?",
    options: ["Short single-turn queries with no system prompt", "Long unique documents where each user sends a different file", "High-volume requests sharing a long common prefix (system prompt + few-shot examples)", "Streaming responses with very low TTFT requirements"],
    correct: 2, keywords: [],
    explanation: "Caching's ROI is proportional to (prefix length × request volume). A 10K-token system prompt shared across 10K daily requests saves ~90% of input costs. Unique per-request context has no cache reuse. Short prompts don't exceed the minimum threshold. Streaming benefits from caching (lower TTFT) but it's the long shared prefix pattern that drives maximum cost savings.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "finetune-1", topic: "finetuning", difficulty: "medium", type: "mcq",
    question: "LoRA (Low-Rank Adaptation) reduces trainable parameters by:",
    options: ["Pruning 90% of attention heads before training", "Decomposing weight updates into two low-rank matrices A and B", "Quantizing gradients to INT8 during backpropagation", "Sharing weights across transformer layers during training"],
    correct: 1, keywords: [],
    explanation: "LoRA freezes the pretrained weights W and learns ΔW = BA where B ∈ R^(d×r) and A ∈ R^(r×k) with rank r << min(d,k). For a 4096×4096 weight matrix with r=16, trainable params drop from 16.7M to 131K (99.2% reduction). At inference, BA is merged back into W with zero latency overhead. QLoRA adds quantization of the base model to NF4.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "finetune-2", topic: "finetuning", difficulty: "hard", type: "mcq",
    question: "When fine-tuning on instruction data, 'catastrophic forgetting' refers to:",
    options: ["The model forgetting to follow the instruction format after a few epochs", "Loss of general capabilities acquired during pretraining due to narrow fine-tuning distribution", "GPU memory overflow causing training to restart from checkpoint", "The optimizer forgetting gradient history when learning rate is reset"],
    correct: 1, keywords: [],
    explanation: "Catastrophic forgetting occurs when fine-tuning on a narrow task distribution overwrites the broader knowledge learned during pretraining. The model may become excellent at the specific task but lose capabilities like coding, math, or multilingual understanding. Mitigations: use LoRA (frozen base), include diverse data, train for fewer epochs, use a small learning rate.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "finetune-3", topic: "finetuning", difficulty: "medium", type: "mcq",
    question: "The key advantage of QLoRA over LoRA is:",
    options: ["QLoRA trains faster due to quantized gradient computation", "QLoRA enables fine-tuning 65B+ models on a single 48GB GPU", "QLoRA produces higher quality results on all downstream tasks", "QLoRA doesn't require a calibration dataset"],
    correct: 1, keywords: [],
    explanation: "QLoRA quantizes the frozen base model weights to NF4 (4-bit), reducing VRAM by ~4× compared to FP16 LoRA. This makes it possible to fine-tune large models on consumer hardware — a 65B model needs ~40GB in QLoRA vs ~130GB for FP16 LoRA. Training speed is slightly slower (dequantize to BF16 for compute) but the VRAM savings enable otherwise impossible fine-tunes.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "finetune-4", topic: "finetuning", difficulty: "hard", type: "mcq",
    question: "For instruction fine-tuning, the recommended dataset size to see meaningful behavioral change without degrading base capabilities is:",
    options: ["100–500 examples", "1,000–10,000 high-quality examples", "100,000+ examples required", "Dataset size doesn't matter; only format matters"],
    correct: 1, keywords: [],
    explanation: "Research (LIMA, Alpaca, OpenHermes) consistently shows that 1K–10K high-quality, diverse instruction pairs produce strong behavioral fine-tuning. The LIMA paper demonstrated that 1,000 carefully curated examples match models fine-tuned on 50K+ examples. Quality and diversity matter far more than quantity. Below 500 examples, results are inconsistent. Above 50K, you risk catastrophic forgetting.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "rlhf-1", topic: "alignment", difficulty: "hard", type: "mcq",
    question: "In PPO-based RLHF, the KL divergence penalty between the policy and reference model serves to:",
    options: ["Speed up convergence by regularizing the reward signal", "Prevent reward hacking by keeping the policy close to the SFT model", "Reduce memory usage during training by sharing weights", "Normalize the reward signal across different response lengths"],
    correct: 1, keywords: [],
    explanation: "Without the KL penalty, the policy can exploit weaknesses in the reward model (reward hacking) — generating responses that score highly but are nonsensical or degenerate. The KL term penalizes divergence from the SFT reference model, keeping the policy in a reasonable distribution. The coefficient β controls the trade-off: low β = more optimization, high β = more conservative.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "rlhf-2", topic: "alignment", difficulty: "medium", type: "mcq",
    question: "DPO (Direct Preference Optimization) eliminates the need for which component of standard RLHF?",
    options: ["The supervised fine-tuning (SFT) stage", "A separate reward model and RL training loop", "Human preference data collection", "The KL divergence regularization term"],
    correct: 1, keywords: [],
    explanation: "DPO shows that the optimal policy under the RLHF objective can be derived directly from preference data (chosen/rejected pairs) without explicitly training a reward model. The reward model is implicitly defined by the ratio of policy to reference model probabilities. This makes alignment training much simpler: just supervised learning on preference pairs. SFT is still needed as initialization.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "rlhf-3", topic: "alignment", difficulty: "hard", type: "mcq",
    question: "A key practical failure mode of RLHF reward models in production is:",
    options: ["Reward models being too slow to query during PPO training", "Reward hacking: policies finding inputs that score highly but are low quality", "Reward models generalizing too well and making PPO unstable", "Preference data being too expensive to collect at scale"],
    correct: 1, keywords: [],
    explanation: "Reward hacking occurs because the reward model is an imperfect proxy trained on limited data. The policy discovers inputs in the tails of the reward model's training distribution where it makes errors — outputs that are verbose, sycophantic, or contain specific phrases that correlate with high rewards in training data but aren't genuinely good. Mitigation: diverse preference data, KL penalty, iterative reward model updates.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "rlhf-4", topic: "alignment", difficulty: "medium", type: "mcq",
    question: "Compared to PPO, DPO training is preferred in practice primarily because:",
    options: ["DPO consistently produces higher quality models across all tasks", "DPO is simpler (no RL loop, no reward model), more stable, and nearly as good", "DPO requires 10× less preference data than PPO", "DPO supports online data collection during training"],
    correct: 1, keywords: [],
    explanation: "DPO's main advantage is simplicity and stability: it's just a classification-style loss on preference pairs, requires no separate RM, no PPO hyperparameter tuning, no reward hacking concerns. Quality is slightly below PPO in controlled experiments but close enough that the engineering simplicity wins for most teams. PPO's advantages (online sampling, iterative improvement) matter most at frontier scale.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "multimodal-1", topic: "multimodal", difficulty: "medium", type: "mcq",
    question: "CLIP achieves vision-language alignment by:",
    options: ["Fine-tuning a pretrained image classifier on text captions", "Contrastive learning to match images and their text descriptions in a shared embedding space", "Using cross-attention between a frozen ViT and a frozen LLM", "Generating captions autoregressively and using them as image representations"],
    correct: 1, keywords: [],
    explanation: "CLIP trains a dual encoder (ViT for images, transformer for text) with a contrastive loss: the image and its matching caption should have high cosine similarity, while mismatched pairs should have low similarity. Trained on 400M image-text pairs, CLIP learns rich visual representations without any labeled classification data. The shared embedding space enables zero-shot classification, retrieval, and is used as the vision encoder in LLaVA-style models.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "multimodal-2", topic: "multimodal", difficulty: "hard", type: "mcq",
    question: "LLaVA-style models connect a vision encoder to an LLM using:",
    options: ["Fine-tuning both the vision encoder and LLM end-to-end from scratch", "A lightweight MLP projector that maps visual features into the LLM's token embedding space", "Cross-attention layers inserted into every transformer block", "Replacing the image with a BLIP-2 generated caption"],
    correct: 1, keywords: [],
    explanation: "LLaVA uses a frozen CLIP vision encoder + a trainable linear projection (or small MLP) that maps visual patch features into vectors with the same dimension as the LLM's word embeddings. These 'visual tokens' are prepended to the text token sequence and processed by the LLM normally. Only the projection (and optionally the LLM) is trained. This is the dominant approach for its simplicity and strong performance.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "multimodal-3", topic: "multimodal", difficulty: "medium", type: "mcq",
    question: "The primary trade-off of late fusion vs. early fusion in multimodal architectures is:",
    options: ["Late fusion is cheaper but can't model fine-grained image-text interactions", "Early fusion is cheaper but loses modality-specific representations", "Late fusion requires more GPU memory; early fusion requires less", "There is no meaningful quality difference between them"],
    correct: 0, keywords: [],
    explanation: "Late fusion (separate encoders, combined at the output) is computationally efficient and easy to train per-modality. But it can't model token-level interactions between image patches and text — e.g., 'the red car on the left' requires attending to specific image regions while reading each word. Early fusion (interleaved tokens from the start) or cross-attention fusion handles this but at higher compute cost.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "multimodal-4", topic: "multimodal", difficulty: "hard", type: "mcq",
    question: "Processing high-resolution images in LLaVA-style models is challenging because:",
    options: ["High-res images require retraining CLIP from scratch", "More visual tokens increase the LLM's sequence length quadratically in attention cost", "JPEG compression artifacts confuse the vision encoder", "LLMs cannot process more than 256 image tokens"],
    correct: 1, keywords: [],
    explanation: "A 336×336 image with patch size 14 produces 576 visual tokens. At 1344×1344 (4× resolution), that's 9,216 tokens — each added to the text tokens, making the total sequence very long. Attention is O(N²), so 9K visual tokens dramatically increases compute and memory. Solutions: LLaVA-HD uses dynamic tiling, InternVL uses pixel shuffle compression, mPLUG-Owl uses abstractor modules to compress visual tokens before passing to the LLM.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },

  // ─── RAG ──────────────────────────────────────────────────────────────────────

  {
    id: "rag-1", topic: "rag", difficulty: "medium", type: "mcq",
    question: "In a RAG system, what is the primary purpose of the 'reranker' step after initial retrieval?",
    options: [
      "To reduce the number of API calls to the embedding model",
      "To reorder retrieved chunks by relevance to the query using a cross-encoder",
      "To merge overlapping chunks before passing to the LLM",
      "To translate retrieved documents into the query language"
    ],
    correct: 1, keywords: [],
    explanation: "Initial retrieval (bi-encoder / vector search) is fast but approximate. A reranker (typically a cross-encoder) scores each (query, chunk) pair jointly — much more accurate but too slow to run over the full index. The two-stage approach gives recall of bi-encoder + precision of cross-encoder. Popular rerankers: Cohere Rerank, BGE-Reranker, Jina Reranker.",
    readMore: { label: "RAG Patterns →", tab: "systems" }
  },
  {
    id: "rag-2", topic: "rag", difficulty: "hard", type: "mcq",
    question: "Hypothetical Document Embeddings (HyDE) improves RAG retrieval quality by:",
    options: [
      "Generating hypothetical questions from each document chunk at index time",
      "Having the LLM generate a hypothetical answer first, then embedding that for retrieval",
      "Embedding documents at multiple chunk sizes and taking the max similarity",
      "Using the LLM's attention weights to weight chunk embeddings"
    ],
    correct: 1, keywords: [],
    explanation: "HyDE addresses the query-document embedding mismatch: user queries are short and vague, documents are dense and specific. HyDE asks the LLM to generate a hypothetical document that would answer the query, then embeds that hypothetical document for retrieval. The hypothetical document lives in the same embedding space as real documents, dramatically improving recall on factual and technical queries.",
    readMore: { label: "RAG Patterns →", tab: "systems" }
  },
  {
    id: "rag-3", topic: "rag", difficulty: "medium", type: "mcq",
    question: "'Lost in the middle' is a RAG failure mode where:",
    options: [
      "Retrieved chunks are not relevant to the query",
      "The LLM ignores information placed in the middle of a long context window",
      "The embedding model loses semantic meaning for long documents",
      "Chunk boundaries split key sentences across adjacent chunks"
    ],
    correct: 1, keywords: [],
    explanation: "Research shows LLMs attend more strongly to information at the beginning and end of the context window, and underweight content in the middle. In RAG, placing the most relevant chunks in the middle of a 10+ chunk context window degrades answer quality. Mitigation: put most relevant chunks at the start or end, use Lost-In-The-Middle-aware ordering, or reduce context size.",
    readMore: { label: "RAG Patterns →", tab: "systems" }
  },
  {
    id: "rag-4", topic: "rag", difficulty: "hard", type: "mcq",
    question: "Parent-child chunking in RAG addresses which specific problem?",
    options: [
      "Embedding models having a maximum token limit",
      "Small chunks losing context needed for accurate embedding; large chunks being too noisy for generation",
      "The reranker being unable to handle chunks longer than 512 tokens",
      "Vector databases not supporting variable-length embeddings"
    ],
    correct: 1, keywords: [],
    explanation: "Small chunks (128 tokens) embed well — they capture specific facts without noise — but lack surrounding context. Large chunks (1024 tokens) provide context but embed poorly as averaged-meaning representations. Parent-child chunking embeds small child chunks for retrieval precision, then returns the parent chunk (with full context) to the LLM. This gives the best of both: accurate retrieval + rich generation context.",
    readMore: { label: "RAG Patterns →", tab: "systems" }
  },

  // ─── CONTEXT WINDOW ENGINEERING ───────────────────────────────────────────────

  {
    id: "ctx-1", topic: "context", difficulty: "medium", type: "mcq",
    question: "The primary reason not to always fill the full context window in LLM applications is:",
    options: [
      "API cost increases linearly with context length",
      "Attention quality degrades and latency increases super-linearly with context length",
      "Most LLMs have a hard token cap that causes errors if exceeded",
      "Longer contexts prevent the model from using chain-of-thought reasoning"
    ],
    correct: 1, keywords: [],
    explanation: "Attention is O(N²) in sequence length — doubling context length quadruples attention compute and increases latency significantly. More critically, empirical research shows LLM recall and reasoning quality degrade with very long contexts (lost-in-the-middle, attention dilution). Cost is a secondary concern. The right approach is to retrieve/filter aggressively so only the most relevant content fills the window.",
    readMore: { label: "Context Engineering →", tab: "systems" }
  },
  {
    id: "ctx-2", topic: "context", difficulty: "hard", type: "mcq",
    question: "Sliding window attention (used in Mistral) reduces memory complexity by:",
    options: [
      "Caching only the last N tokens' KV states and attending only to those",
      "Compressing the context window using a learned summarization model",
      "Using INT4 quantization for the KV cache of distant tokens",
      "Replacing full attention with linear attention for tokens beyond a fixed distance"
    ],
    correct: 0, keywords: [],
    explanation: "Sliding window attention restricts each token to attend only to the W most recent tokens (the window), keeping KV cache size at O(W) rather than O(sequence length). Tokens beyond W still influence later tokens through cascading windows across layers. Mistral uses W=4096 with rotary embeddings that handle relative positions within the window. GQA is used alongside to further reduce KV cache size.",
    readMore: { label: "Context Engineering →", tab: "systems" }
  },
  {
    id: "ctx-3", topic: "context", difficulty: "medium", type: "mcq",
    question: "Context distillation / compression techniques like LLMLingua work by:",
    options: [
      "Fine-tuning the LLM on shorter versions of the training data",
      "Removing tokens from the prompt that have low importance scores while preserving semantic content",
      "Summarizing the context using a separate smaller model before passing to the main LLM",
      "Converting the context to a structured format (JSON) to reduce token count"
    ],
    correct: 1, keywords: [],
    explanation: "LLMLingua and similar tools score each token in the prompt by its importance (using a small proxy LM's perplexity), then drop low-importance tokens at a target compression ratio (e.g., 4×). The compressed prompt is often 50-80% shorter with less than 5% quality loss on downstream tasks. This is different from summarization — it's token-level pruning that preserves the original wording of retained content.",
    readMore: { label: "Context Engineering →", tab: "systems" }
  },
  {
    id: "ctx-4", topic: "context", difficulty: "hard", type: "mcq",
    question: "In multi-turn applications, the most effective strategy for managing context growth is:",
    options: [
      "Always truncating from the beginning of the conversation",
      "Keeping a fixed summary of distant turns + full recent turns + retrieved relevant turns",
      "Using the full conversation history until hitting the context limit, then starting a new session",
      "Embedding each turn and retrieving the top-K most relevant turns per new message"
    ],
    correct: 1, keywords: [],
    explanation: "The hybrid approach outperforms any single strategy: a rolling summary captures what's been discussed without exact tokens, recent turns (last 3-5) are kept verbatim for coherence, and a retrieval step pulls turns specifically relevant to the current message. Truncating from the beginning loses critical early context (user goals, established facts). The retrieval-only approach misses conversational flow.",
    readMore: { label: "Context Engineering →", tab: "systems" }
  },

  // ─── SYSTEM DESIGN (OPEN-ENDED) ───────────────────────────────────────────────

  {
    id: "design-1", topic: "design", difficulty: "hard", type: "text",
    question: "Design a RAG system for a legal document Q&A product. Walk through your chunking strategy, embedding choices, retrieval pipeline, and how you'd handle citations.",
    keywords: ["chunking", "embedding", "reranker", "citations", "metadata filtering", "parent-child", "cross-encoder"],
    explanation: "Model answer: Use semantic chunking (split on section boundaries, not fixed tokens) with parent-child storage — small chunks for retrieval, full sections for generation. Choose a legal-domain embedding model (voyage-law-2 or fine-tuned on legal corpora). Two-stage retrieval: dense vector search → cross-encoder reranker. Add metadata filters for document type, jurisdiction, date. For citations, store chunk source (document ID, section, page) and surface them in the response with exact quotes. Evaluate with a human-labeled set of legal QA pairs measuring precision@5 and answer faithfulness.",
    readMore: { label: "RAG Patterns →", tab: "systems" }
  },
  {
    id: "design-2", topic: "design", difficulty: "hard", type: "text",
    question: "Your LLM-powered feature is costing $50K/month at current scale. Walk through your cost reduction strategy without degrading user-facing quality.",
    keywords: ["prompt caching", "model routing", "smaller model", "quantization", "batching", "caching", "distillation"],
    explanation: "Model answer: First instrument — break down cost by feature/endpoint to find the 20% of calls driving 80% of cost. Then apply in order: (1) prompt caching for shared system prompts/few-shot examples (immediate 60-80% reduction on repeated prefixes); (2) model routing — classify query complexity and route simple queries to a 4× cheaper small model; (3) output caching for deterministic queries; (4) context compression (LLMLingua) to reduce input tokens; (5) async batching for non-latency-sensitive features. Fine-tuning a smaller model on production data is the highest-effort but highest-ceiling option.",
    readMore: { label: "Cost Engineering →", tab: "systems" }
  },
  {
    id: "design-3", topic: "design", difficulty: "hard", type: "text",
    question: "How would you design an eval harness for a customer support AI agent that handles refunds, escalations, and general inquiries?",
    keywords: ["intent classification", "task success", "golden dataset", "LLM judge", "regression", "coverage", "edge cases"],
    explanation: "Model answer: Define success per task type — refunds (did it resolve correctly per policy?), escalations (did it escalate when it should?), general (did it answer accurately?). Build a golden dataset: 50-100 examples per intent with expected outputs and edge cases. Use LLM-as-judge for open-ended quality, deterministic checks for policy compliance. Run on every PR (regression suite) and weekly against new production samples. Track: task success rate, refusal rate, hallucination rate, escalation precision/recall. Add a canary deployment step where 1% of real traffic routes to the new model with human review.",
    readMore: { label: "Evals →", tab: "systems" }
  },
  {
    id: "design-4", topic: "design", difficulty: "hard", type: "text",
    question: "You're asked to add tool use to an existing LLM product. What's your architecture for reliable tool calling, and how do you handle failures?",
    keywords: ["function calling", "schema", "validation", "retry", "fallback", "observability", "timeout"],
    explanation: "Model answer: Define tools as strict JSON schemas — the model generates structured calls, not free text. Validate every tool call against the schema before execution (reject malformed calls and retry with error feedback, max 2 retries). For each tool: set timeouts (e.g., 5s for search, 30s for code execution), implement idempotency for write operations, log all calls and results for observability. Failure handling: malformed call → re-prompt with schema; tool error → surface to model with error message; timeout → graceful fallback to no-tool response. Monitor tool call rate, success rate, and fallback rate per tool in production.",
    readMore: { label: "Agents →", tab: "systems" }
  },

  // ─── TRANSFORMER ARCHITECTURE ────────────────────────────────────────────────
  {
    id: "txarch-1", topic: "transformers", difficulty: "medium", type: "mcq",
    question: "In the transformer's multi-head attention, why use multiple heads instead of one large attention operation?",
    options: [
      "Reduces total parameter count vs single-head attention",
      "Allows the model to attend to information from different representation subspaces simultaneously",
      "Enables processing tokens in parallel across the sequence",
      "Prevents gradient vanishing in deep transformer stacks"
    ],
    correct: 1,
    keywords: ["multi-head attention", "subspace", "representation", "transformer"],
    explanation: "Each attention head learns to focus on different aspects of the input — one head might track syntactic dependencies, another coreference, another positional patterns. Single-head attention collapses all these into one weighted sum, losing representational diversity. Multiple heads then concatenate their outputs, giving the model richer, multi-faceted token representations.",
    readMore: { label: "Transformer Architecture →", tab: "systems" }
  },
  {
    id: "txarch-2", topic: "transformers", difficulty: "hard", type: "mcq",
    question: "Rotary Position Embeddings (RoPE) improve upon learned absolute position embeddings by:",
    options: [
      "Requiring fewer parameters since position is computed not learned",
      "Encoding relative position directly into the attention score via rotation in embedding space",
      "Allowing the model to generalize to sequences longer than seen during training without fine-tuning",
      "Eliminating the need for positional information entirely in decoder-only models"
    ],
    correct: 1,
    keywords: ["RoPE", "rotary position embeddings", "relative position", "LLaMA", "Mistral"],
    explanation: "RoPE applies a rotation matrix to query and key vectors before computing attention, where the rotation angle depends on the position. This makes the dot product between Q and K naturally encode the relative distance between positions — closer tokens produce higher dot products. Unlike absolute embeddings, RoPE's relative nature enables better length generalization and is now standard in LLaMA, Mistral, and most modern LLMs.",
    readMore: { label: "Transformer Architecture →", tab: "systems" }
  },
  {
    id: "txarch-3", topic: "transformers", difficulty: "hard", type: "mcq",
    question: "SwiGLU activation (used in LLaMA FFN layers) outperforms ReLU because:",
    options: [
      "It is computationally cheaper, requiring one fewer matrix multiply",
      "It gates the activation with a learned sigmoid, allowing smooth, content-dependent filtering",
      "It eliminates the dying neuron problem by ensuring all activations are non-zero",
      "It enables integer quantization of FFN weights without quality loss"
    ],
    correct: 1,
    keywords: ["SwiGLU", "activation", "FFN", "gating", "LLaMA", "ReLU"],
    explanation: "SwiGLU computes FFN(x) = (xW₁ ⊗ σ(xW₃)) W₂ — the first linear projection is multiplied element-wise with a gated version of a second projection. This learned gating allows the network to suppress less useful activations in a soft, differentiable way, giving richer representations than ReLU's hard threshold. It consistently scores 1-2 points higher on downstream benchmarks at no extra inference cost.",
    readMore: { label: "Transformer Architecture →", tab: "systems" }
  },
  {
    id: "txarch-4", topic: "transformers", difficulty: "medium", type: "mcq",
    question: "The causal mask in decoder-only transformer training ensures:",
    options: [
      "Tokens only attend to tokens that are semantically similar",
      "Each token can only attend to itself and preceding tokens, enabling parallel training on next-token prediction",
      "The model ignores padding tokens when computing attention over variable-length inputs",
      "Attention weights sum to 1 across the key dimension for numerical stability"
    ],
    correct: 1,
    keywords: ["causal mask", "autoregressive", "decoder-only", "parallel training", "next-token"],
    explanation: "Without the causal mask, each token during training could attend to future tokens, effectively leaking the answer. By masking future positions to -∞ before softmax, each position only sees the prefix, making it equivalent to training N separate left-to-right language models simultaneously. This is what enables efficient parallel training on all token positions at once while maintaining the autoregressive property at inference.",
    readMore: { label: "Transformer Architecture →", tab: "systems" }
  },

  // ─── SPECULATIVE DECODING ────────────────────────────────────────────────────
  {
    id: "spec-1", topic: "inference", difficulty: "medium", type: "mcq",
    question: "Speculative decoding improves LLM throughput by:",
    options: [
      "Running the large model on fewer tokens by skipping low-confidence positions",
      "Using a small draft model to propose multiple tokens, then verifying in parallel with the large model",
      "Caching the large model's KV states across requests to avoid recomputation",
      "Quantizing the large model to INT4 for draft generation and INT8 for verification"
    ],
    correct: 1,
    keywords: ["speculative decoding", "draft model", "verification", "throughput", "parallel"],
    explanation: "The small draft model generates k candidate tokens autoregressively (fast). The large target model then verifies all k tokens in a single forward pass (since verification is parallelizable unlike generation). Accepted tokens are kept; the first rejected token is resampled from the target distribution. Net effect: multiple tokens per large-model forward pass, 2-4× speedup with zero quality loss.",
    readMore: { label: "Speculative Decoding →", tab: "systems" }
  },
  {
    id: "spec-2", topic: "inference", difficulty: "hard", type: "mcq",
    question: "The acceptance rate α in speculative decoding determines throughput. It depends primarily on:",
    options: [
      "The size ratio between the draft and target model",
      "How well the draft model's token distribution matches the target model's distribution",
      "The hardware memory bandwidth available for the draft model",
      "The temperature setting used for draft model sampling"
    ],
    correct: 1,
    keywords: ["acceptance rate", "speculative decoding", "draft distribution", "target distribution"],
    explanation: "α is the probability that the target model accepts a draft token. If the draft distribution closely matches the target's (similar training data, same family), α is high (0.8-0.9) and you get near-maximum speedup. If the draft is misaligned (different domain, different training), α drops and you pay draft overhead with little gain. This is why using a smaller version of the same model family (e.g., LLaMA-68M → LLaMA-70B) works best.",
    readMore: { label: "Speculative Decoding →", tab: "systems" }
  },
  {
    id: "spec-3", topic: "inference", difficulty: "hard", type: "mcq",
    question: "Medusa-style speculative decoding differs from standard draft-model speculative decoding by:",
    options: [
      "Using INT4 quantization on the target model to enable faster verification",
      "Adding multiple prediction heads to the target model that predict future tokens simultaneously",
      "Running speculative decoding only on the prefill phase, not the generation phase",
      "Using beam search instead of sampling for draft token generation"
    ],
    correct: 1,
    keywords: ["Medusa", "speculative decoding", "prediction heads", "draft model"],
    explanation: "Medusa adds K extra linear 'heads' to the target LLM, each predicting the token at offset +1, +2, ..., +K positions from the current token. These heads are trained while the base model is frozen. At inference, all K predictions are verified in one forward pass of the base model. Medusa eliminates the need for a separate draft model entirely, at the cost of adding K small linear heads to the existing model.",
    readMore: { label: "Speculative Decoding →", tab: "systems" }
  },
  {
    id: "spec-4", topic: "inference", difficulty: "medium", type: "mcq",
    question: "Speculative decoding achieves lossless speedup (identical output distribution to the target model) because:",
    options: [
      "Draft tokens are only proposed, never accepted, without target model verification",
      "The rejection sampling scheme corrects for discrepancies between draft and target distributions",
      "Draft and target models are always from the same model family with identical weights",
      "The draft model uses greedy decoding which always matches the target's top-1 token"
    ],
    correct: 1,
    keywords: ["lossless", "rejection sampling", "speculative decoding", "output distribution"],
    explanation: "When the target model rejects a draft token, it doesn't use the draft's token — it samples from a corrected distribution: max(0, p_target - p_draft) normalized. This rejection sampling ensures the final token distribution is exactly the target model's distribution, not the draft's. The output is mathematically identical to sampling directly from the target model, just faster.",
    readMore: { label: "Speculative Decoding →", tab: "systems" }
  },

  // ─── STREAMING PATTERNS ──────────────────────────────────────────────────────
  {
    id: "stream-1", topic: "streaming", difficulty: "medium", type: "mcq",
    question: "Server-Sent Events (SSE) is preferred over WebSockets for LLM streaming responses because:",
    options: [
      "SSE supports bidirectional communication, reducing round trips",
      "SSE is a simpler unidirectional protocol — the server pushes tokens as they generate, no client-side socket management needed",
      "SSE compresses tokens more efficiently than WebSocket binary frames",
      "SSE works without HTTP/2, making it compatible with more CDN providers"
    ],
    correct: 1,
    keywords: ["SSE", "Server-Sent Events", "WebSocket", "streaming", "unidirectional"],
    explanation: "LLM streaming is inherently unidirectional: the server generates tokens and pushes them to the client. SSE is purpose-built for this — it's a simple HTTP response with Content-Type: text/event-stream, no handshake protocol, automatic reconnection, and works through standard HTTP infrastructure (load balancers, CDNs). WebSockets add bidirectional complexity that streaming LLM responses don't need.",
    readMore: { label: "Streaming Patterns →", tab: "systems" }
  },
  {
    id: "stream-2", topic: "streaming", difficulty: "hard", type: "mcq",
    question: "'Time to First Token' (TTFT) and 'Time Between Tokens' (TBT) are distinct metrics because:",
    options: [
      "TTFT measures GPU utilization; TBT measures memory bandwidth",
      "TTFT is dominated by the prefill phase (processing the full prompt); TBT is dominated by memory bandwidth during autoregressive generation",
      "TTFT only applies to streaming responses; TBT applies to both streaming and batch responses",
      "TTFT improves with larger models; TBT improves with smaller models"
    ],
    correct: 1,
    keywords: ["TTFT", "TBT", "time to first token", "prefill", "memory bandwidth", "latency"],
    explanation: "Prefill (computing KV cache for the input prompt) is a compute-bound operation that scales with prompt length — this is TTFT. Generation (producing each output token autoregressively) is memory-bandwidth-bound — the bottleneck is loading model weights from HBM per token, not compute. Optimizing one doesn't necessarily help the other: Flash Attention improves TTFT, speculative decoding improves TBT.",
    readMore: { label: "Streaming Patterns →", tab: "systems" }
  },
  {
    id: "stream-3", topic: "streaming", difficulty: "medium", type: "mcq",
    question: "For a streaming chat UI, the optimal token rendering strategy to avoid layout thrashing is:",
    options: [
      "Render each token immediately as it arrives using innerHTML append",
      "Buffer tokens into complete words or sentences before updating the DOM",
      "Use requestAnimationFrame to batch DOM updates at 60fps regardless of token arrival rate",
      "Store all tokens in state and re-render the full message on each token arrival"
    ],
    correct: 1,
    keywords: ["streaming", "DOM", "layout thrashing", "token rendering", "buffering"],
    explanation: "Updating the DOM on every single token (~5-20ms intervals) causes excessive reflows and can make the UI feel choppy, especially with markdown rendering. Buffering to word boundaries (space character) or sentence boundaries reduces DOM updates by 5-10× with no perceptible quality loss to the user. Full re-render on each token (option D) is particularly bad — it defeats React's virtual DOM optimization by invalidating the entire component tree.",
    readMore: { label: "Streaming Patterns →", tab: "systems" }
  },
  {
    id: "stream-4", topic: "streaming", difficulty: "hard", type: "mcq",
    question: "When streaming structured JSON output from an LLM, the key challenge is:",
    options: [
      "JSON requires knowing the full output before validation, conflicting with incremental streaming",
      "Streaming increases the probability of malformed JSON due to token boundary effects",
      "SSE cannot transmit binary-encoded JSON efficiently",
      "JSON structure requires the client to buffer the entire response before parsing any field"
    ],
    correct: 0,
    keywords: ["JSON", "streaming", "validation", "structured output", "incremental parsing"],
    explanation: "JSON validation requires a complete, closed document — you can't validate partial JSON. This creates a tension: you want to stream tokens for latency, but you need complete JSON for your downstream code. Solutions: stream raw tokens to the UI for display while buffering for validation, use streaming JSON parsers (like jsonstream) that parse incrementally, or use structured generation (Outlines/Guidance) to guarantee valid JSON token-by-token via logit masking.",
    readMore: { label: "Streaming Patterns →", tab: "systems" }
  },

  // ─── MODEL MERGING ───────────────────────────────────────────────────────────
  {
    id: "merge-1", topic: "merging", difficulty: "medium", type: "mcq",
    question: "SLERP (Spherical Linear Interpolation) is preferred over simple linear interpolation for model merging because:",
    options: [
      "SLERP is faster to compute for large weight matrices",
      "SLERP interpolates along the surface of a hypersphere, preserving the magnitude of weight vectors throughout the merge",
      "SLERP automatically identifies and removes conflicting parameters before merging",
      "SLERP requires no calibration data, unlike linear interpolation methods"
    ],
    correct: 1,
    keywords: ["SLERP", "model merging", "interpolation", "weight magnitude", "hypersphere"],
    explanation: "Simple linear interpolation (lerp) shrinks weight magnitudes — the interpolated vector has smaller norm than either endpoint. SLERP maintains constant magnitude by traversing the geodesic path on the unit hypersphere, which better preserves the feature norms that pretrained models rely on. In practice this produces higher quality merged models, especially when merging models trained on different domains.",
    readMore: { label: "Model Merging →", tab: "systems" }
  },
  {
    id: "merge-2", topic: "merging", difficulty: "hard", type: "mcq",
    question: "TIES-Merging addresses which core failure mode of naive model averaging?",
    options: [
      "Models trained on different datasets having incompatible tokenizers",
      "Parameter interference: signs of weight deltas conflict across models, causing cancellation",
      "Memory requirements of loading all source models simultaneously during merging",
      "Catastrophic forgetting of the base model's capabilities after merging"
    ],
    correct: 1,
    keywords: ["TIES-Merging", "parameter interference", "weight delta", "sign conflict", "model merging"],
    explanation: "When averaging weight deltas (ΔW = fine-tuned - base) across multiple models, parameters where one model increased a weight and another decreased it partially cancel out, degrading both capabilities. TIES-Merging resolves this by: (1) trimming small deltas (noise), (2) electing the majority sign per parameter across models, (3) only merging parameters that agree on sign. This reduces destructive interference and preserves each model's specialized capabilities better.",
    readMore: { label: "Model Merging →", tab: "systems" }
  },
  {
    id: "merge-3", topic: "merging", difficulty: "medium", type: "mcq",
    question: "Model merging (vs ensemble or fine-tuning) is most useful when:",
    options: [
      "You need maximum quality and have abundant compute for ensembling",
      "You have two specialized fine-tuned models and want their capabilities in one model at zero training cost",
      "You want to merge models from different architecture families (e.g., LLaMA + Mistral)",
      "You need to compress a large model into a smaller one for deployment"
    ],
    correct: 1,
    keywords: ["model merging", "fine-tuned", "zero training", "ensemble", "architecture"],
    explanation: "Model merging's sweet spot is combining same-architecture models fine-tuned for different tasks (e.g., a coding model + an instruction-following model) without additional training. The result often retains 80-90% of both capabilities. It requires the models to share the same base architecture and tokenizer. It doesn't compress models (same size as inputs) and doesn't work across architectures — for that you'd need distillation.",
    readMore: { label: "Model Merging →", tab: "systems" }
  },
  {
    id: "merge-4", topic: "merging", difficulty: "hard", type: "mcq",
    question: "The 'Model Soup' merging approach (Wortsman et al.) achieves better generalization than any individual fine-tuned model by:",
    options: [
      "Training multiple models with different random seeds and selecting the best one",
      "Averaging weights of multiple models fine-tuned with different hyperparameters on the same task",
      "Using a meta-learning algorithm to find optimal merge coefficients per layer",
      "Merging only the attention weights while keeping FFN weights from a single best model"
    ],
    correct: 1,
    keywords: ["Model Soup", "weight averaging", "hyperparameters", "generalization", "loss basin"],
    explanation: "Model Soup averages the weights of multiple models fine-tuned from the same pretrained base, each with different hyperparameters (learning rate, augmentation, etc.). Because fine-tuned models from the same base tend to reside in the same loss basin, their average lies in a flat region of the loss landscape — giving better generalization than any individual model. This is weight-space ensembling without the inference cost of a traditional ensemble.",
    readMore: { label: "Model Merging →", tab: "systems" }
  },

  // ─── CONSTRAINED GENERATION ──────────────────────────────────────────────────
  {
    id: "constrain-1", topic: "constrained", difficulty: "medium", type: "mcq",
    question: "Constrained generation tools like Outlines and Guidance enforce output structure by:",
    options: [
      "Post-processing the LLM's full output to fix schema violations after generation",
      "Masking logits at each generation step so only valid next tokens have non-zero probability",
      "Fine-tuning the model on structured output examples to teach JSON generation",
      "Using beam search with a validity checker to reject invalid token sequences"
    ],
    correct: 1,
    keywords: ["constrained generation", "Outlines", "Guidance", "logit masking", "schema"],
    explanation: "At each generation step, the constraint engine computes a binary mask over the vocabulary: tokens that would keep the partial output valid (per regex, JSON schema, or CFG) get logit 0, invalid tokens get -∞. After softmax, the model can only sample from the valid set. This is lossless — you get the model's original distribution restricted to valid tokens — and works with any LLM without fine-tuning.",
    readMore: { label: "Constrained Generation →", tab: "systems" }
  },
  {
    id: "constrain-2", topic: "constrained", difficulty: "hard", type: "mcq",
    question: "GBNF (GGUF BNF format, used in llama.cpp) allows constrained generation by:",
    options: [
      "Converting JSON schemas to approximate regex patterns for fast masking",
      "Defining a formal grammar that specifies exactly which token sequences are valid outputs",
      "Sampling multiple outputs and selecting the one that passes schema validation",
      "Using reinforcement learning to train the model to prefer structured outputs"
    ],
    correct: 1,
    keywords: ["GBNF", "BNF", "llama.cpp", "grammar", "constrained generation", "finite automaton"],
    explanation: "GBNF is a BNF-style grammar format that defines the complete syntactic structure of valid outputs. llama.cpp compiles this grammar into a finite automaton that tracks the current parse state during generation. At each step, the automaton determines which tokens are valid continuations, and those tokens' logits are kept while all others are masked. This guarantees 100% grammatically valid outputs at the cost of ~5-15ms per token overhead.",
    readMore: { label: "Constrained Generation →", tab: "systems" }
  },
  {
    id: "constrain-3", topic: "constrained", difficulty: "medium", type: "mcq",
    question: "The primary trade-off of using constrained generation vs prompting for structured output is:",
    options: [
      "Constrained generation is slower and lower quality; prompting is always preferred",
      "Constrained generation guarantees schema compliance with slight latency overhead; prompting is faster but has 1-5% failure rate even with strong models",
      "Constrained generation requires GPU-only hardware; prompting works on any backend",
      "Constrained generation is only available through open-source models, not API providers"
    ],
    correct: 1,
    keywords: ["constrained generation", "prompting", "schema compliance", "failure rate", "latency"],
    explanation: "Even GPT-4 with explicit JSON instructions fails 1-5% of the time on complex schemas — this is unacceptable for production pipelines that feed structured output to downstream code. Constrained generation eliminates this failure mode entirely. The cost is 5-15ms latency overhead per token (for logit masking) and added infrastructure complexity. For high-volume production use where schema failures cause pipeline errors, the reliability is worth the overhead.",
    readMore: { label: "Constrained Generation →", tab: "systems" }
  },
  {
    id: "constrain-4", topic: "constrained", difficulty: "hard", type: "mcq",
    question: "SGLang's 'near-zero overhead' structured generation achieves efficiency by:",
    options: [
      "Pre-computing all possible valid token sets for a schema before generation begins",
      "Compiling the constraint into a compressed finite automaton and caching token mask lookups",
      "Using INT4 quantization specifically for the logit masking computation",
      "Offloading constraint computation to CPU while GPU handles attention"
    ],
    correct: 1,
    keywords: ["SGLang", "structured generation", "DFA", "token mask", "caching", "overhead"],
    explanation: "SGLang compiles the JSON schema or regex into an efficient deterministic finite automaton (DFA) and pre-computes token masks for each DFA state. Since many states are visited repeatedly during generation (e.g., 'inside a string value'), the mask lookup becomes a simple array index — O(1) — rather than re-evaluating the constraint against the full vocabulary. This amortization reduces overhead from ~15ms to near-zero for common schema patterns.",
    readMore: { label: "Constrained Generation →", tab: "systems" }
  },

  // ── Inference (5) ───────────────────────────────────────────────────────────
  {
    id: "inf-q1", topic: "inference", difficulty: "medium", type: "mcq",
    question: "Flash Attention reduces memory complexity from O(N²) to O(N) by:",
    options: [
      "Approximating the attention matrix with low-rank decomposition",
      "Tiling the computation into SRAM-resident blocks to avoid HBM reads",
      "Skipping attention for tokens below a relevance threshold",
      "Replacing softmax with a linear kernel function"
    ],
    correct: 1,
    keywords: [],
    explanation: "Flash Attention uses tiling: it splits Q, K, V into blocks that fit in fast SRAM, performing the softmax and attention output computation block-by-block without materialising the full N×N attention matrix in slow HBM. Memory footprint drops from O(N²) to O(N) at the cost of re-computation during the backward pass.",
    readMore: { label: "Flash Attention & Inference →", tab: "systems" }
  },
  {
    id: "inf-q2", topic: "inference", difficulty: "hard", type: "text",
    question: "A production LLM serving system is bottlenecked at 40% GPU utilisation despite high request volume. Walk through the three most likely causes and what metrics you'd check for each.",
    options: [],
    correct: 0,
    keywords: ["KV cache", "batching", "memory bandwidth", "continuous batching", "PagedAttention", "prefill", "decode"],
    explanation: "The three usual suspects: (1) Insufficient batching — check request queue depth and batch size; continuous batching (vLLM/TGI) dramatically improves utilisation vs static batching. (2) KV cache exhaustion — long sequences or large batch sizes fill the KV cache, forcing requests to wait; PagedAttention mitigates this. (3) Prefill–decode imbalance — prefill is compute-bound, decode is memory-bandwidth-bound; mixed batches stall each other. Check prefill vs decode token ratios and consider chunked prefill.",
    readMore: { label: "LLM Serving Systems →", tab: "systems" }
  },
  {
    id: "inf-q3", topic: "inference", difficulty: "medium", type: "mcq",
    question: "Speculative decoding achieves latency reduction primarily because:",
    options: [
      "It uses a smaller model for all tokens, falling back to the large model only for important tokens",
      "The draft model generates candidate tokens in parallel, and the large model verifies a batch of them in a single forward pass",
      "It caches the KV states of the large model and reuses them across requests",
      "It quantises the large model's weights to INT4 during the decode phase"
    ],
    correct: 1,
    keywords: [],
    explanation: "Speculative decoding uses a cheap draft model to propose k tokens speculatively. The large model verifies all k in a single parallel forward pass — accepting correct ones and rejecting at the first mismatch. Since the large model's forward pass cost is roughly constant for 1 vs k tokens (memory-bandwidth-bound decode), you get k tokens for the cost of ~1. Typical speedup: 2–3×.",
    readMore: { label: "Speculative Decoding →", tab: "systems" }
  },
  {
    id: "inf-q4", topic: "inference", difficulty: "easy", type: "mcq",
    question: "Token streaming (sending tokens to the user as they are generated) primarily improves which metric?",
    options: [
      "Throughput (tokens/second)",
      "Time to first token (TTFT)",
      "Total end-to-end latency",
      "Perceived responsiveness — time to first token seen by user"
    ],
    correct: 3,
    keywords: [],
    explanation: "Streaming doesn't change actual throughput or true end-to-end latency — the model still generates the same number of tokens at the same speed. What changes is perceived responsiveness: the user sees the first token within milliseconds of TTFT rather than waiting for the entire response. This is a UX win, not a performance win in the traditional sense.",
    readMore: { label: "Streaming & Latency →", tab: "systems" }
  },
  {
    id: "inf-q5", topic: "inference", difficulty: "hard", type: "text",
    question: "Explain the trade-offs between INT8 and INT4 quantisation for LLM inference. When would you choose each, and what accuracy mitigation strategies exist for INT4?",
    options: [],
    correct: 0,
    keywords: ["outliers", "activation quantisation", "weight-only", "GPTQ", "AWQ", "perplexity", "calibration", "QLoRA"],
    explanation: "INT8 (W8A8 or W8A16): minimal accuracy loss (<1% perplexity), well-supported (bitsandbytes, TensorRT-LLM), 2× memory reduction. Good default for production. INT4 (W4A16): 4× memory reduction, enables larger models on consumer hardware, but significant perplexity degradation without mitigation. Mitigation: GPTQ uses layer-wise second-order optimisation on calibration data; AWQ identifies and protects salient weights (those with large activation magnitudes). Choose INT4 when memory is the binding constraint and perplexity loss is acceptable, or when serving on edge/consumer hardware. Always evaluate task-specific metrics, not just perplexity.",
    readMore: { label: "Quantisation →", tab: "systems" }
  },

  // ── Alignment — GRPO & Model Merging (6) ────────────────────────────────────
  {
    id: "align-q1", topic: "alignment", difficulty: "medium", type: "mcq",
    question: "GRPO (Group Relative Policy Optimization) differs from PPO primarily in that it:",
    options: [
      "Uses a separate value/critic network to estimate baselines",
      "Computes advantages relative to the mean reward within a group of sampled outputs, eliminating the critic network",
      "Applies KL divergence constraints at the token level rather than the sequence level",
      "Is supervised rather than reinforcement learning"
    ],
    correct: 1,
    keywords: [],
    explanation: "PPO requires a separate value/critic network to compute per-token advantage estimates — this doubles model memory and training complexity. GRPO instead samples G outputs for the same prompt, computes each output's reward, and uses the group mean as the baseline (advantage = reward − mean_reward / std). No critic network needed. This is why GRPO is preferred for LLM post-training: simpler, lower memory, and the group comparison provides a clean relative signal.",
    readMore: { label: "GRPO & RL for LLMs →", tab: "alignment" }
  },
  {
    id: "align-q2", topic: "alignment", difficulty: "hard", type: "text",
    question: "You are using LLM-as-judge (the RULER pattern) to score agent trajectories in a GRPO training loop. What are the three biggest failure modes of this approach and how would you mitigate each?",
    options: [],
    correct: 0,
    keywords: ["judge bias", "reward hacking", "positional bias", "length bias", "self-preference", "calibration", "rubric", "multiple judges"],
    explanation: "Three key failure modes: (1) Positional/length bias — LLM judges prefer longer or first-presented responses; mitigate with rubric-based scoring (score each criterion independently, not holistically) and swapping position in pairwise comparisons. (2) Self-preference — a model judges outputs from the same family as better; mitigate by using a different model family as judge, or by grounding scoring on verifiable criteria (code runs, facts check out). (3) Reward hacking — the policy learns to produce outputs that score well on the rubric without actually being better; mitigate with diverse rubric criteria, held-out judge evals, and monitoring reward vs actual task performance divergence.",
    readMore: { label: "GRPO & RL for LLMs →", tab: "alignment" }
  },
  {
    id: "align-q3", topic: "alignment", difficulty: "medium", type: "mcq",
    question: "Model merging via SLERP (Spherical Linear Interpolation) is preferred over linear interpolation for LLM weights because:",
    options: [
      "SLERP is computationally cheaper than linear interpolation",
      "It preserves the magnitude of weight vectors and interpolates along the geodesic of the unit hypersphere",
      "It only merges the attention layers, leaving FFN weights unchanged",
      "SLERP requires fewer calibration samples than linear merging"
    ],
    correct: 1,
    keywords: [],
    explanation: "Linear interpolation (LERP) between two weight vectors changes their magnitude (the average of two unit vectors is shorter than either). SLERP interpolates along the curved surface of the hypersphere, preserving magnitude throughout. For neural network weights where the norm encodes learned feature scales, this geometric correctness matters — SLERP generally produces better capability retention than LERP when merging models trained on different tasks.",
    readMore: { label: "Model Merging →", tab: "alignment" }
  },
  {
    id: "align-q4", topic: "alignment", difficulty: "medium", type: "mcq",
    question: "Task Arithmetic model merging works by:",
    options: [
      "Fine-tuning a base model on a mixture of all task datasets simultaneously",
      "Computing task vectors (fine-tuned weights minus base weights) and adding them to a shared base model",
      "Distilling multiple specialist models into a single student model",
      "Routing inputs to different model shards based on task classification"
    ],
    correct: 1,
    keywords: [],
    explanation: "Task Arithmetic (Ilharco et al., 2022) defines a task vector as τ = θ_finetuned − θ_base. Adding τ to a different base model transfers the task capability. Multiple task vectors can be added together (with scaling factors λ) to merge capabilities — the base model acts as a shared subspace. This is zero-shot and requires no additional training, though negating task vectors can also 'unlearn' capabilities.",
    readMore: { label: "Model Merging →", tab: "alignment" }
  },
  {
    id: "align-q5", topic: "alignment", difficulty: "easy", type: "mcq",
    question: "Which of the following best describes Direct Preference Optimization (DPO) compared to RLHF with PPO?",
    options: [
      "DPO is slower but more sample-efficient than PPO",
      "DPO eliminates the need for a separate reward model and RL training loop by reformulating preference learning as a classification loss",
      "DPO requires more human preference data than PPO to reach the same performance",
      "DPO only works for instruction-following tasks, not for reasoning"
    ],
    correct: 1,
    keywords: [],
    explanation: "DPO shows that the RLHF objective can be reparametrised so the optimal policy is expressed directly in terms of preference pairs (preferred vs rejected), turning RL into a simple binary cross-entropy loss on the language model itself. No reward model training, no PPO rollouts, no KL constraint tuning. Easier to implement and often more stable, though sometimes less effective on complex reasoning tasks where PPO's online exploration matters.",
    readMore: { label: "DPO & RLHF →", tab: "alignment" }
  },
  {
    id: "merge-q1", topic: "alignment", difficulty: "hard", type: "text",
    question: "When would you choose model merging over continued fine-tuning for adding a new capability to a base model? List three scenarios where merging wins and one where fine-tuning is clearly better.",
    options: [],
    correct: 0,
    keywords: ["catastrophic forgetting", "task vectors", "SLERP", "data availability", "compute", "distribution shift", "multi-task"],
    explanation: "Merging wins when: (1) You have a fine-tuned specialist model for the new capability but no access to its training data (proprietary or expensive to recreate) — merge the task vector instead of retraining. (2) You need to combine capabilities from two fine-tuned models without catastrophic forgetting — fine-tuning on task B erases task A; merging preserves both. (3) Compute budget is tight — merging is inference-only, no GPU hours. Fine-tuning wins when: the new capability requires deep distribution shift (not just task addition) — for example, adapting a general LLM to a highly specific domain like medical coding where the output format, vocabulary, and failure modes are all different from pretraining. Task vectors don't capture deep distributional changes well.",
    readMore: { label: "Model Merging →", tab: "alignment" }
  },

  // ── System Design (4) ────────────────────────────────────────────────────────
  {
    id: "sd-q1", topic: "sysdesign", difficulty: "hard", type: "text",
    question: "Design an AI-powered customer support system for an e-commerce platform handling 10K tickets/day. Cover: architecture decisions, model selection rationale, latency budget, fallback strategy, and eval approach.",
    options: [],
    correct: 0,
    keywords: ["intent classification", "RAG", "escalation", "latency", "fine-tuning", "guardrails", "CSAT", "eval", "human handoff", "ticket routing"],
    explanation: "Strong answers cover: (1) Architecture — intent classifier → topic router → RAG retrieval from product/policy KB → LLM response → post-generation guardrails. (2) Model selection — smaller fast model (Haiku/Flash) for classification, mid-size model for generation to stay within 2s P95 latency budget. (3) Latency budget — intent classification <100ms, retrieval <300ms, generation <1.5s, total <2s. (4) Fallback — if confidence <0.7 or guardrails flag, route to human queue with context. (5) Eval — precision/recall on intent classification, CSAT correlation, resolution rate, escalation rate as primary business metric.",
    readMore: { label: "System Design Canvas →", tab: "systems" }
  },
  {
    id: "sd-q2", topic: "sysdesign", difficulty: "medium", type: "mcq",
    question: "When designing an AI system, which consideration should you address FIRST?",
    options: [
      "Which LLM provider has the lowest cost per token",
      "Whether the problem actually needs AI and what the non-AI baseline looks like",
      "What GPU infrastructure is available",
      "Which vector database to use for retrieval"
    ],
    correct: 1,
    keywords: [],
    explanation: "The most common expensive mistake in AI system design is building before validating that AI is the right tool. A rule-based system, a search index, or a human workflow might solve the problem better, cheaper, and more reliably. Defining the non-AI baseline first also gives you a concrete improvement target and evaluation benchmark. Cost, infra, and vector DB are all downstream of this foundational question.",
    readMore: { label: "System Design Canvas →", tab: "systems" }
  },
  {
    id: "sd-q3", topic: "sysdesign", difficulty: "hard", type: "text",
    question: "You need to build a document intelligence system that extracts structured data from unstructured insurance claim forms (PDFs, images, handwritten notes). What architecture would you choose and why?",
    options: [],
    correct: 0,
    keywords: ["OCR", "vision model", "structured output", "constrained generation", "validation", "confidence", "human review", "fine-tuning", "extraction"],
    explanation: "Key decisions: (1) Input pipeline — vision LLM (GPT-4V/Claude Vision) for images/PDFs directly, or OCR first then text LLM for cost efficiency at scale. (2) Extraction architecture — constrained generation with JSON schema to force structured output; define field types and validation rules. (3) Confidence routing — low-confidence extractions flagged for human review; build a confidence signal from log-probs or second-pass verification. (4) Eval — field-level extraction accuracy (not just document-level), handling of missing/ambiguous fields, human-review rate as ops metric. (5) Fine-tuning consideration — if form templates are consistent, a fine-tuned smaller model will outperform a large general model at 10× lower cost.",
    readMore: { label: "System Design Canvas →", tab: "systems" }
  },
  {
    id: "sd-q4", topic: "sysdesign", difficulty: "medium", type: "mcq",
    question: "In the AI system design canvas, what is the purpose of defining the 'failure budget' before building?",
    options: [
      "To estimate the infrastructure cost of the system",
      "To set acceptable error rates that guide model selection, fallback design, and eval thresholds before deployment",
      "To determine how many human reviewers are needed",
      "To calculate the expected number of API calls per day"
    ],
    correct: 1,
    keywords: [],
    explanation: "The failure budget (borrowed from SRE) defines what error rate the system can tolerate without violating user-facing SLAs. In AI systems this is especially important because models fail probabilistically — you need to decide upfront what hallucination rate, refusal rate, or latency breach rate is acceptable. This decision drives: model selection (more reliable but slower/costlier vs faster but hallucination-prone), whether a fallback to rule-based/human is needed, and what your evals must catch before ship.",
    readMore: { label: "System Design Canvas →", tab: "systems" }
  },

  // ── LLM Ops — Streaming (2) ──────────────────────────────────────────────────
  {
    id: "stream-q1", topic: "llmops", difficulty: "medium", type: "mcq",
    question: "Server-Sent Events (SSE) are preferred over WebSockets for LLM token streaming because:",
    options: [
      "SSE is bidirectional, making it better suited for interactive chat",
      "SSE is unidirectional (server→client), simpler to implement, and works over standard HTTP without protocol upgrade",
      "SSE automatically handles backpressure when the client is slow",
      "SSE has lower latency than WebSockets for small payloads"
    ],
    correct: 1,
    keywords: [],
    explanation: "LLM token streaming is inherently unidirectional — the server sends tokens, the client renders them. SSE is purpose-built for this: it works over plain HTTP/1.1, reconnects automatically, and doesn't require a protocol upgrade handshake like WebSockets. WebSockets add complexity (bidirectional state, connection management, proxy issues) with no benefit for streaming. The main exception: if your chat UI sends audio or large binary data back to the server, WebSockets may be warranted.",
    readMore: { label: "Streaming & Serving →", tab: "systems" }
  },
  {
    id: "stream-q2", topic: "llmops", difficulty: "hard", type: "text",
    question: "Your LLM API is streaming tokens to users but users report that the stream 'pauses' mid-response for 2-3 seconds. What are the most likely causes and how would you diagnose each?",
    options: [],
    correct: 0,
    keywords: ["buffering", "nginx", "proxy", "generation", "speculative", "context switch", "KV cache eviction", "network", "X-Accel-Buffering"],
    explanation: "Most common causes in order: (1) Proxy/CDN buffering — Nginx, Cloudflare, or API gateways buffer SSE by default. Fix: set X-Accel-Buffering: no header, configure proxy_buffering off. (2) Application-level buffering — middleware or response wrappers accumulating tokens before flushing. Fix: ensure flush() is called after each token. (3) KV cache pressure mid-generation — if the context exceeds cached KV state, the model recomputes; shows as a consistent pause at a predictable token position. Fix: monitor KV cache utilisation. (4) Generation stalls — model hitting a low-probability region, attempting multiple speculative decode paths. Less common but diagnosable by correlating pause timing with token log-probs.",
    readMore: { label: "Streaming & Serving →", tab: "systems" }
  },

  // ─── ATTENTION (additional) ──────────────────────────────────────────────────
  {
    id: "attn-5", topic: "attention", difficulty: "medium", type: "mcq",
    question: "In scaled dot-product attention, why are scores divided by √d_k before the softmax?",
    options: [
      "To keep attention weights between 0 and 1 without softmax overflow",
      "Because dot products grow in magnitude with d_k, pushing softmax into regions with near-zero gradients",
      "To normalize for varying sequence lengths during training",
      "To match the scale of the value vectors before weighted summation"
    ],
    correct: 1, keywords: [],
    explanation: "For d_k-dimensional vectors with unit-variance components, the dot product Q·K has variance d_k. As d_k grows, extreme scores push softmax into saturation — gradients vanish and learning slows. Dividing by √d_k restores variance to ~1 and keeps softmax in a well-behaved gradient region. This is why the formula is Attention(Q,K,V) = softmax(QKᵀ/√d_k)V.",
    readMore: { label: "Transformer Architecture →", tab: "concepts" }
  },
  {
    id: "attn-6", topic: "attention", difficulty: "hard", type: "mcq",
    question: "During autoregressive inference, the KV cache grows with each token generated. The main memory bottleneck this creates is:",
    options: [
      "The KV cache exceeds GPU L1 cache, causing frequent cache evictions",
      "KV tensors for all past tokens must be loaded from HBM each decode step, making generation memory-bandwidth-bound",
      "Storing KV cache requires recomputing all past token embeddings",
      "Growing KV cache forces the model to use lower precision for recent tokens"
    ],
    correct: 1, keywords: [],
    explanation: "Each decode step must load K and V matrices for all previous tokens from HBM (GPU memory) — for a 70B model with 80 layers and long sequences, this is gigabytes of reads per token. Compute (the attention operation itself) is trivial by comparison. This is why generation throughput is memory-bandwidth-bound, not compute-bound, and why techniques like GQA, quantized KV caches, and PagedAttention all target KV cache size.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "attn-7", topic: "attention", difficulty: "medium", type: "mcq",
    question: "Multi-Query Attention (MQA) trades quality for efficiency by:",
    options: [
      "Computing attention only over a random subset of tokens per head",
      "Using a single shared K and V head across all query heads",
      "Replacing the value projection with a simple averaging operation",
      "Limiting each head to attend only within a fixed local window"
    ],
    correct: 1, keywords: [],
    explanation: "MQA uses one K head and one V head shared across all Q heads (GQA is the middle ground — multiple KV heads, fewer than Q heads). This reduces KV cache size by the number of query heads (e.g., 32× for a 32-head model). The quality tradeoff is real but acceptable for many tasks — MQA is used in Falcon and early PaLM. GQA (Llama-3, Mistral) recovers most quality by using a small number of KV groups rather than just one.",
    readMore: { label: "Flash Attention →", tab: "systems" }
  },
  {
    id: "attn-8", topic: "attention", difficulty: "hard", type: "mcq",
    question: "Cross-attention in encoder-decoder models differs from self-attention in that:",
    options: [
      "Cross-attention uses three separate weight matrices instead of two",
      "Queries come from the decoder state while keys and values come from the encoder output",
      "Cross-attention is computed only once per sequence, not per layer",
      "Cross-attention applies a causal mask to prevent attending to future encoder tokens"
    ],
    correct: 1, keywords: [],
    explanation: "In cross-attention, the decoder generates Q from its current hidden state but reads K and V from the encoder's final representations. This is what allows the decoder to 'condition on' the encoded input at every generation step. Self-attention has Q, K, V all from the same sequence. There's no causal masking in cross-attention since the encoder output is fully observed — the decoder can attend to any encoder position.",
    readMore: { label: "Transformer Architecture →", tab: "concepts" }
  },

  // ─── TRANSFORMERS (additional) ───────────────────────────────────────────────
  {
    id: "txarch-5", topic: "transformers", difficulty: "medium", type: "mcq",
    question: "Pre-norm (LayerNorm before sublayer) is preferred over post-norm in modern LLMs because:",
    options: [
      "Pre-norm requires fewer total LayerNorm operations per forward pass",
      "Pre-norm produces more stable gradients at initialization, enabling training of very deep models without warmup tricks",
      "Pre-norm eliminates the need for residual connections in the transformer block",
      "Pre-norm allows higher learning rates by reducing the effective depth of the gradient path"
    ],
    correct: 1, keywords: [],
    explanation: "In post-norm (original 'Attention Is All You Need' design), gradients flow through LayerNorm after the residual addition — at initialization, the residual branch dominates and gradients through the sublayer can vanish in deep models. Pre-norm (used in GPT-2, LLaMA, and virtually every modern LLM) normalizes inputs before the sublayer, keeping the residual stream magnitude stable and gradients well-behaved from step 1. This is why modern LLMs rarely need the careful learning rate warmup schedules that early transformer work required.",
    readMore: { label: "Transformer Architecture →", tab: "concepts" }
  },
  {
    id: "txarch-6", topic: "transformers", difficulty: "hard", type: "mcq",
    question: "The feed-forward sublayer in a transformer block (FFN) serves a different function than attention because:",
    options: [
      "FFN applies the same transformation independently to each token with no cross-token interaction",
      "FFN performs the cross-token mixing that attention cannot do efficiently",
      "FFN compresses the residual stream back to d_model after attention expands it",
      "FFN applies positional bias to ensure token order is respected after attention"
    ],
    correct: 0, keywords: [],
    explanation: "Attention is the cross-token operation — it mixes information across the sequence. The FFN is a per-token operation applied identically and independently to each position. Mechanistically, the FFN acts as a key-value memory: the first projection retrieves patterns, the activation gates them, and the second projection writes the result back to the residual stream. For a d_model=4096 model with 4× FFN expansion, the FFN has 4× more parameters than attention and stores the majority of the model's factual knowledge.",
    readMore: { label: "Transformer Architecture →", tab: "concepts" }
  },
  {
    id: "txarch-7", topic: "transformers", difficulty: "medium", type: "mcq",
    question: "A decoder-only model (GPT-style) differs architecturally from an encoder-decoder model (T5-style) in that:",
    options: [
      "Decoder-only models use bidirectional attention; encoder-decoder models use causal attention",
      "Decoder-only models use causal self-attention throughout; encoder-decoder models use bidirectional encoding then causal decoding with cross-attention",
      "Decoder-only models cannot perform translation or summarization tasks",
      "Encoder-decoder models have more parameters at the same layer count due to cross-attention"
    ],
    correct: 1, keywords: [],
    explanation: "Encoder-decoder models encode the full input bidirectionally (each token can attend to all others), then decode autoregressively with causal self-attention plus cross-attention to the encoder output. Decoder-only models encode and decode in a single causal pass — they can still do translation and summarization (as demonstrated by GPT-4, Claude, etc.) but the input is processed left-to-right with the same causal mask as generation. The industry has largely converged on decoder-only because it unifies pretraining and instruction-following into a single architecture.",
    readMore: { label: "Transformer Architecture →", tab: "concepts" }
  },
  {
    id: "txarch-8", topic: "transformers", difficulty: "hard", type: "mcq",
    question: "Residual connections in transformers primarily solve which training problem?",
    options: [
      "Overfitting by adding noise to intermediate representations",
      "Vanishing gradients in deep networks by providing a direct gradient path to early layers",
      "Attention head collapse where all heads learn the same pattern",
      "Token representation drift across layers that degrades coherence"
    ],
    correct: 1, keywords: [],
    explanation: "Without residual connections, gradients must flow through every transformation in a deep stack — each layer multiplies the gradient by its Jacobian, and a product of many near-zero values vanishes. Residual connections (output = f(x) + x) add a direct highway: ∂Loss/∂x = ∂Loss/∂output × (∂f/∂x + 1). The +1 term ensures a non-vanishing gradient regardless of how small ∂f/∂x becomes. This is what makes 100+ layer transformers trainable. ResNets invented this; transformers adopted it from day one.",
    readMore: { label: "Transformer Architecture →", tab: "concepts" }
  },

  // ─── CONTEXT (additional) ────────────────────────────────────────────────────
  {
    id: "ctx-5", topic: "context", difficulty: "hard", type: "mcq",
    question: "The 'lost in the middle' phenomenon in long-context LLMs means:",
    options: [
      "LLMs fail to process contexts longer than their training sequence length",
      "Retrieval accuracy degrades for information positioned in the middle of a long context, with best recall at the start and end",
      "LLMs lose coherence in multi-turn conversations after a fixed number of exchanges",
      "Attention entropy increases in middle layers, reducing representational quality"
    ],
    correct: 1, keywords: [],
    explanation: "Liu et al. (2023) showed LLMs systematically perform worse when the relevant document is placed in the middle of a long context versus the beginning or end — a U-shaped performance curve. The effect is significant: moving a document from position 1 to position 10 in a 20-document context can drop accuracy by 20%+. Implication for RAG: put the most relevant retrieved chunks at the beginning or end of the context, not buried in the middle.",
    readMore: { label: "Context Engineering →", tab: "systems" }
  },
  {
    id: "ctx-6", topic: "context", difficulty: "medium", type: "mcq",
    question: "YaRN (Yet another RoPE extensioN) enables longer context than a model was trained on by:",
    options: [
      "Fine-tuning on longer documents sampled from the pretraining corpus",
      "Scaling RoPE's rotation frequencies non-uniformly so high-frequency dimensions interpolate and low-frequency dimensions extrapolate",
      "Adding absolute position embeddings on top of RoPE for positions beyond the training length",
      "Quantizing KV cache for distant tokens to fit more positions in GPU memory"
    ],
    correct: 1, keywords: [],
    explanation: "Standard position interpolation (PI) uniformly scales all RoPE frequencies, which degrades high-frequency dimensions that encode fine-grained local patterns. YaRN applies NTK-aware scaling: high-frequency RoPE dimensions (which handle short-range dependencies) are interpolated conservatively, while low-frequency dimensions (long-range) are scaled more aggressively. Combined with a short fine-tuning run on longer sequences, YaRN achieves near-native performance at 4-16× the original context length. Used in Mistral and LLaMA extensions.",
    readMore: { label: "Context Engineering →", tab: "systems" }
  },
  {
    id: "ctx-7", topic: "context", difficulty: "medium", type: "mcq",
    question: "In RAG, the distinction between 'context window' and 'effective context' matters because:",
    options: [
      "The context window is measured in tokens; effective context is measured in characters",
      "LLMs can technically process all tokens in the window but reliably reason over a smaller subset — packing the window with marginally relevant chunks degrades quality",
      "Effective context refers only to the user's query, excluding the system prompt",
      "Context windows are fixed at training time; effective context grows with RLHF fine-tuning"
    ],
    correct: 1, keywords: [],
    explanation: "A 128K context window doesn't mean a model reasons equally well over all 128K tokens. Empirically, retrieval accuracy and reasoning quality degrade with more context (especially low-signal context). The practical implication: don't retrieve top-20 chunks and hope the model figures it out. Retrieve top-5 with a reranker, compress aggressively, and keep the effective reasoning context tight. Filling the window is not a free upgrade.",
    readMore: { label: "Context Engineering →", tab: "systems" }
  },
  {
    id: "ctx-8", topic: "context", difficulty: "hard", type: "mcq",
    question: "For a document Q&A system, placing the system prompt, retrieved chunks, and conversation history in which order typically produces the best results?",
    options: [
      "Conversation history → retrieved chunks → system prompt",
      "System prompt → retrieved chunks → conversation history (most recent last)",
      "Retrieved chunks → system prompt → conversation history",
      "Conversation history → system prompt → retrieved chunks"
    ],
    correct: 1, keywords: [],
    explanation: "System prompt first establishes the model's role and constraints before any content. Retrieved chunks come next — placing evidence before the question means the model has loaded the relevant context when it reaches the query. Conversation history last, with the most recent turn immediately before the model's response, leverages both primacy (system prompt is highly attended) and recency (recent history is well-recalled). This order minimises the lost-in-the-middle effect for the retrieved evidence and aligns with how attention patterns behave in practice.",
    readMore: { label: "Context Engineering →", tab: "systems" }
  },

  // ─── SERVING (additional) ────────────────────────────────────────────────────
  {
    id: "serving-5", topic: "serving", difficulty: "medium", type: "mcq",
    question: "In LLM serving, the prefill phase and the decode phase have fundamentally different bottlenecks because:",
    options: [
      "Prefill processes multiple tokens in parallel (compute-bound); decode generates one token at a time (memory-bandwidth-bound)",
      "Prefill uses INT8 arithmetic; decode uses FP16 to maintain quality",
      "Prefill runs on the CPU; decode runs on the GPU to balance resource usage",
      "Prefill is bottlenecked by tokenization speed; decode is bottlenecked by sampling overhead"
    ],
    correct: 0, keywords: [],
    explanation: "During prefill, all prompt tokens are processed in one forward pass — this is highly parallel and GPU-compute-bound. During decode, one token is generated per step by loading the full model's weights from HBM to compute a single output — this is sequential and memory-bandwidth-bound. These different bottlenecks explain why Flash Attention improves TTFT (prefill) while speculative decoding improves throughput (decode), and why large prompt + short output workloads need different serving configs than short prompt + long output.",
    readMore: { label: "Serving Infrastructure →", tab: "systems" }
  },
  {
    id: "serving-6", topic: "serving", difficulty: "hard", type: "mcq",
    question: "Tensor parallelism in multi-GPU LLM serving splits the model by:",
    options: [
      "Assigning different layers to different GPUs (pipeline parallelism)",
      "Splitting weight matrices across GPUs so each GPU handles a slice of every layer simultaneously",
      "Routing different requests to different GPU replicas with no weight sharing",
      "Replicating the full model on every GPU and averaging gradients after each step"
    ],
    correct: 1, keywords: [],
    explanation: "Tensor parallelism (Megatron-style) splits each attention head group and FFN across GPUs — for 8-way tensor parallel, each GPU holds 1/8 of every weight matrix and processes 1/8 of the attention heads. An all-reduce synchronizes after each layer. This keeps all GPUs active on every token but requires high-bandwidth GPU interconnects (NVLink). Pipeline parallelism (different layers on different GPUs) is orthogonal and used at larger scale. Data parallelism (separate replicas) improves throughput but not single-request latency.",
    readMore: { label: "Serving Infrastructure →", tab: "systems" }
  },
  {
    id: "serving-7", topic: "serving", difficulty: "medium", type: "mcq",
    question: "When should you prefer optimising for throughput over latency in LLM serving?",
    options: [
      "Always — throughput is the primary business metric for all LLM deployments",
      "For async batch workloads (document processing, offline eval, embeddings) where user wait time is irrelevant",
      "For interactive chat products where users tolerate up to 30 seconds for high-quality responses",
      "When the model is quantized to INT4 — latency optimisation no longer applies"
    ],
    correct: 1, keywords: [],
    explanation: "Throughput (tokens/second across all requests) and latency (time per request) are in tension — maximising throughput means larger batches and more queuing, which increases per-request latency. For real-time chat, you optimise for P95 TTFT and TBT. For async workloads (nightly document processing, embedding generation, offline evals), you maximise GPU utilisation via large batch sizes. Many teams run two serving tiers: a low-latency interactive cluster and a high-throughput batch cluster with the same model.",
    readMore: { label: "Serving Infrastructure →", tab: "systems" }
  },
  {
    id: "serving-8", topic: "serving", difficulty: "hard", type: "mcq",
    question: "KV cache eviction policies matter when GPU memory is full because:",
    options: [
      "Evicting the wrong KV cache entries forces a full model reload from disk",
      "Evicted requests must recompute their KV cache from scratch (recompute cost) or be dropped entirely",
      "KV cache eviction triggers a CUDA out-of-memory error that crashes the serving process",
      "Eviction always causes the associated request to be served with lower quality output"
    ],
    correct: 1, keywords: [],
    explanation: "When GPU memory is exhausted, the serving system must either evict (free) KV cache for some in-flight requests or reject new ones. An evicted request's KV cache is lost — the system must either recompute it (latency hit equal to the full prefill time) or terminate the request with an error. vLLM uses a priority-based eviction policy (longest-waiting requests, shortest remaining sequences first). This is why KV cache memory management is a first-class concern in production LLM serving, not an afterthought.",
    readMore: { label: "Serving Infrastructure →", tab: "systems" }
  },

  // ─── CACHING (additional) ────────────────────────────────────────────────────
  {
    id: "cache-5", topic: "caching", difficulty: "medium", type: "mcq",
    question: "Semantic caching differs from prompt caching (KV cache reuse) in that:",
    options: [
      "Semantic caching stores model weights; prompt caching stores activations",
      "Semantic caching stores complete LLM responses keyed by query embedding similarity, bypassing inference entirely on cache hits",
      "Semantic caching operates at the token level; prompt caching operates at the request level",
      "Semantic caching is implemented inside the model; prompt caching is implemented in the serving layer"
    ],
    correct: 1, keywords: [],
    explanation: "Prompt caching (KV cache reuse) speeds up inference for shared prefixes — the model still runs, just skips part of the computation. Semantic caching stores the complete LLM response and returns it on semantically similar future queries without running the model at all — 0 inference cost, near-0 latency. The tradeoff: cache hit requires a query to be semantically similar to a previous one (good for FAQ-style workloads, bad for creative or highly varied queries). Tools like GPTCache implement this with embedding similarity search.",
    readMore: { label: "Prompt Caching →", tab: "systems" }
  },
  {
    id: "cache-6", topic: "caching", difficulty: "hard", type: "mcq",
    question: "To maximise prompt cache hit rate, you should structure your prompts so that:",
    options: [
      "Dynamic content (user query, date) comes before static content (system prompt, examples)",
      "Static content (system prompt, tools, few-shot examples) comes first, with dynamic content appended at the end",
      "The cache_control flag is applied to the entire prompt including the user query",
      "System prompt length is kept below 512 tokens to minimise cache write cost"
    ],
    correct: 1, keywords: [],
    explanation: "Caches are prefix-keyed: a cache hit requires the prefix to match exactly. Static content (system prompt, tool definitions, few-shot examples) that never changes should always come first — this prefix is always cacheable. The user's unique query is appended last, after the cached prefix. If you put dynamic content first, the prefix is always unique and the cache never hits. Also: keep static content identical across requests down to whitespace — even a single character difference is a cache miss.",
    readMore: { label: "Prompt Caching →", tab: "systems" }
  },
  {
    id: "cache-7", topic: "caching", difficulty: "medium", type: "mcq",
    question: "Output caching (caching complete LLM responses by exact input hash) is most appropriate when:",
    options: [
      "You need fresh responses for each user even on identical questions",
      "Inputs are highly repetitive and deterministic responses are acceptable (FAQ, classification, templated generation)",
      "You want to reduce TTFT for interactive chat without affecting response quality",
      "Your model uses temperature > 0 and you want to preserve output diversity"
    ],
    correct: 1, keywords: [],
    explanation: "Output caching returns a stored response for an identical input — zero inference cost and zero latency. It's appropriate for: FAQ-style chatbots where the same questions recur, classification tasks with fixed schemas, batch processing where reruns should be idempotent. It's inappropriate when freshness matters (current events, personalised responses) or when stochastic diversity is valuable. Temperature doesn't matter — you're bypassing the model entirely, so the cached response is deterministic by definition.",
    readMore: { label: "Prompt Caching →", tab: "systems" }
  },
  {
    id: "cache-8", topic: "caching", difficulty: "hard", type: "mcq",
    question: "Anthropic's ephemeral cache has a 5-minute TTL. The correct implication for production system design is:",
    options: [
      "Re-send cached content in every request to reset the TTL and maintain the cache",
      "Design request flows so the same cached prefix is used frequently within 5-minute windows, or accept re-write costs on cold cache",
      "Cache TTL doesn't matter — cache hits are guaranteed within a single API session",
      "Extend TTL by splitting long system prompts across multiple cache_control markers"
    ],
    correct: 1, keywords: [],
    explanation: "If the cache expires between requests, the next request pays the 1.25× cache write premium again. For high-volume applications (hundreds of requests per minute), the cache stays warm automatically. For low-volume applications (a few requests per hour), the cache expires constantly and caching may cost more than it saves — calculate break-even carefully. The correct design: architect your system prompt and tool definitions as a stable long prefix, keep request volume high enough to amortise write costs, and monitor cache hit rate in your observability stack.",
    readMore: { label: "Prompt Caching →", tab: "systems" }
  },

  // ─── STREAMING (additional) ──────────────────────────────────────────────────
  {
    id: "stream-5", topic: "streaming", difficulty: "medium", type: "mcq",
    question: "Backpressure in LLM streaming occurs when:",
    options: [
      "The model generates tokens faster than the client can consume them, causing server-side buffering",
      "The client sends requests faster than the server can begin processing them",
      "The KV cache fills up, forcing the server to pause generation mid-stream",
      "Network congestion causes tokens to arrive at the client out of order"
    ],
    correct: 0, keywords: [],
    explanation: "Modern LLMs can generate tokens at 50-200 tokens/second. If the client (browser, mobile app, slow consumer) can't process tokens at that rate, the server must buffer them or drop the connection. Proper streaming implementations use flow control: the server checks whether the client's write buffer has space before sending the next token. In practice, most web clients can render tokens fast enough, but this matters for embedded devices, slow connections, or server-to-server streaming where the downstream consumer is itself doing heavy work.",
    readMore: { label: "Streaming Patterns →", tab: "systems" }
  },
  {
    id: "stream-6", topic: "streaming", difficulty: "hard", type: "mcq",
    question: "When a user cancels a streaming response mid-generation, the correct server-side behaviour is:",
    options: [
      "Complete generation and discard the remaining output to avoid wasted computation on the next request",
      "Immediately stop generation, release the KV cache slot, and return the GPU capacity to the serving pool",
      "Pause generation and cache the partial KV state in case the user resumes",
      "Continue generation server-side and cache the full response for the next identical request"
    ],
    correct: 1, keywords: [],
    explanation: "Every token being generated occupies a KV cache slot and GPU compute. When the user cancels (closes the connection, navigates away), the serving system should detect the broken connection, abort the generation worker, and immediately free the KV cache. Continuing generation wastes GPU capacity that could serve other requests. Most production serving frameworks (vLLM, TGI) handle this via connection lifecycle hooks. Not implementing cancellation is a common source of GPU under-utilisation in production.",
    readMore: { label: "Streaming Patterns →", tab: "systems" }
  },
  {
    id: "stream-7", topic: "streaming", difficulty: "hard", type: "mcq",
    question: "Streaming LLM responses that include tool calls (function calling) requires special handling because:",
    options: [
      "Tool call JSON must arrive completely before the function can be invoked, requiring the client to buffer the tool call portion",
      "SSE cannot transmit tool call schemas alongside token deltas",
      "Streaming pauses automatically when the model decides to call a tool",
      "Tool calls require a separate WebSocket connection to handle the bidirectional tool result flow"
    ],
    correct: 0, keywords: [],
    explanation: "Tool call arguments arrive as streamed JSON fragments — partial strings like name='get_weather', arguments='...city...London...' arrive token by token and cannot be parsed until the block is complete. You cannot invoke the function until the complete JSON is received and parseable. The client must detect that the current stream chunk is part of a tool call delta, buffer it, and only invoke the function when the tool_calls block is complete. OpenAI and Anthropic stream tool use deltas differently — tool use in Anthropic's streaming API uses input_json_delta events that must be concatenated before parsing.",
    readMore: { label: "Streaming Patterns →", tab: "systems" }
  },
  {
    id: "stream-8", topic: "streaming", difficulty: "medium", type: "mcq",
    question: "The most meaningful metric for measuring the quality of a streaming LLM experience from a user perspective is:",
    options: [
      "Total tokens per second (aggregate throughput across all users)",
      "P95 Time to First Token (TTFT) — how quickly the stream starts for 95% of requests",
      "Mean token inter-arrival time (average gap between consecutive tokens)",
      "End-to-end response latency (total time from request to last token)"
    ],
    correct: 1, keywords: [],
    explanation: "Users experience streaming as 'when does it start?' and 'does it feel smooth?'. P95 TTFT is the primary metric because users perceive a blank screen as the most frustrating wait — they'll tolerate a slower stream once it starts. P95 (not mean) because outliers matter for perceived reliability. Mean token inter-arrival time matters for smoothness but only after TTFT. Total throughput is a capacity metric, not a user experience metric. End-to-end latency matters for non-streaming use cases.",
    readMore: { label: "Streaming Patterns →", tab: "systems" }
  },

  // ─── COSINE SIMILARITY (3) ───────────────────────────────────────────────────
  {
    id: "cos-1", topic: "rag", difficulty: "medium", type: "mcq",
    question: "Two chunks have cosine similarity 0.92 to the query. A third chunk has similarity 0.61. The reranker returns the third chunk at rank 1. This is because:",
    options: ["The reranker is broken", "Cosine similarity measures angle between embeddings — the reranker uses a cross-encoder that reads query and chunk together, capturing relevance the embedding model missed", "The third chunk has more tokens", "The embedding model is wrong"],
    correct: 1, keywords: [],
    explanation: "Bi-encoders (embedding models) compute query and chunk independently, then compare. Cross-encoders (rerankers) read both together — they see the actual query-chunk interaction. A chunk can be semantically adjacent (high cosine similarity) but not actually answer the question. The reranker catches this; the embedding model cannot.",
    readMore: { label: "Cosine Similarity Explorer", tab: "explore" }
  },
  {
    id: "cos-2", topic: "rag", difficulty: "medium", type: "text",
    question: "Explain why cosine similarity ignores vector magnitude and why that matters for text retrieval.",
    options: null, correct: null,
    keywords: ["direction", "angle", "normaliz", "magnitude", "length", "dot product", "unit vector"],
    explanation: "Cosine similarity divides the dot product by both magnitudes — normalising them to unit vectors. A 10-word chunk and a 1000-word chunk pointing in the same semantic direction score 1.0. This is correct for retrieval: you want topical alignment, not length matching. The tradeoff: two chunks can discuss different aspects of a topic and still score high because the overall direction is similar.",
    readMore: { label: "Cosine Similarity Explorer", tab: "explore" }
  },
  {
    id: "cos-3", topic: "rag", difficulty: "hard", type: "mcq",
    question: "Your RAG system returns correct answers 90% of the time but a random 10% of queries get completely wrong results. Most likely root cause?",
    options: ["Chunk size too large", "Orthogonal queries — these queries embed in a direction where the correct document is at cosine similarity near 0, so retrieval returns unrelated but non-orthogonal chunks instead", "LLM hallucination rate is exactly 10%", "Embedding model dimension too low"],
    correct: 1, keywords: [],
    explanation: "When a query embeds into a region of vector space not populated by your document corpus, all retrieval scores are mediocre (0.3–0.5). The system retrieves the least-wrong documents and the LLM makes up an answer from irrelevant context. This is the 'distribution mismatch' failure: your embedding model was trained on text unlike your documents. Fix: domain-specific fine-tuning of the embedding model, or hard-negative mining.",
    readMore: { label: "Cosine Similarity Explorer", tab: "explore" }
  },

  // ─── LONG CONTEXT (4) ────────────────────────────────────────────────────────
  {
    id: "lctx-1", topic: "rag", difficulty: "hard", type: "mcq",
    question: "A RAG system uses a 128K context window and stuffs the entire document corpus in. Users report missing answers that are definitely in the corpus. Most likely cause?",
    options: ["The model has insufficient parameters", "Lost-in-the-middle — facts buried at ~50% through the context are retrieved at ~60% recall vs 95%+ at document boundaries", "Context window overflow", "Tokenization error"],
    correct: 1, keywords: [],
    explanation: "Lost-in-the-middle is a documented failure mode: LLMs attend strongly to the beginning and end of context but poorly to the middle. A 128K context window does not mean uniform recall across 128K tokens. Retrieval that places the relevant chunk at position 0 outperforms full-context stuffing for mid-document facts.",
    readMore: { label: "Long Context Patterns →", tab: "systems" }
  },
  {
    id: "lctx-2", topic: "rag", difficulty: "hard", type: "mcq",
    question: "You need to synthesise findings across 200 research papers. Which pattern is correct?",
    options: ["Full context — concatenate all 200 papers", "Map-reduce — extract key findings per paper in parallel, then synthesise the extractions", "Chunk-then-summarise — summarise each paper sequentially", "Single embedding lookup per paper"],
    correct: 1, keywords: [],
    explanation: "Map-reduce is the right pattern for synthesis across many documents. The map step extracts relevant findings per paper (cheap, parallelisable). The reduce step synthesises across extractions. Full context fails because 200 papers vastly exceed any context window. Chunk-then-summarise is sequential (slow) and loses cross-paper relationships.",
    readMore: { label: "Long Context Patterns →", tab: "systems" }
  },
  {
    id: "lctx-3", topic: "llmops", difficulty: "medium", type: "mcq",
    question: "A user queries the same 500-page legal document 100 times per day with different questions. Best cost-optimisation strategy?",
    options: ["Full context on every query", "Re-embed the document on every query", "Chunk-then-summarise once and cache the compressed representation; query the summaries", "Use a smaller model to reduce cost"],
    correct: 2, keywords: [],
    explanation: "Chunk-then-summarise amortises the summarisation cost across all queries. Pay once to compress 500 pages into a summary, then send only the summary (much fewer tokens) on each of the 100 daily queries. Full context at 100K tokens/query × 100 queries = 10M tokens/day. Summarise once (100K tokens) then query at 5K tokens each = 600K tokens/day — ~16× cheaper.",
    readMore: { label: "Long Context Patterns →", tab: "systems" }
  },
  {
    id: "lctx-4", topic: "rag", difficulty: "hard", type: "text",
    question: "Explain the difference between a model's advertised context window and its reliable context window. Why does this distinction matter for system design?",
    options: null, correct: null,
    keywords: ["recall", "lost-in-the-middle", "degradation", "NIAH", "reliable", "benchmark", "design"],
    explanation: "The advertised window is the maximum tokens the model will accept. The reliable window is the range over which retrieval recall stays high (typically 85%+). For GPT-4o, advertised is 128K but reliable is ~64K. The gap matters for system design: a system designed around the 128K limit will silently miss facts in the outer range. Always design around the reliable window and use retrieval for anything beyond it.",
    readMore: { label: "Long Context Patterns →", tab: "systems" }
  },

  // ─── VECTOR DB (5) ───────────────────────────────────────────────────────────
  {
    id: "vdb-1", topic: "rag", difficulty: "medium", type: "mcq",
    question: "Your team already runs Postgres and has 8M document vectors. Which vector DB choice minimises operational overhead?",
    options: ["Pinecone — managed SaaS removes all ops", "pgvector — Postgres extension, no new infrastructure", "Chroma — easiest to set up", "Weaviate — best hybrid search"],
    correct: 1, keywords: [],
    explanation: "pgvector as a Postgres extension means zero new infrastructure: install the extension, add a vector column, create an HNSW index. You keep your existing Postgres ops knowledge, backups, monitoring, and SQL query patterns. At 8M vectors it comfortably fits in RAM with HNSW. Pinecone is the right call when you need to scale past what Postgres can handle or have no ops team — not when you are already on Postgres.",
    readMore: { label: "Vector DB Engineering →", tab: "systems" }
  },
  {
    id: "vdb-2", topic: "rag", difficulty: "hard", type: "mcq",
    question: "You need sub-5ms p99 vector search over 20M vectors with high recall. Which index type and key trade-off applies?",
    options: ["IVFFlat — faster to build, lower memory, tune nprobe for recall", "HNSW — higher memory (full graph in RAM), very fast queries, high recall at default settings", "IVF+PQ — best for this scale, no trade-offs", "Flat — exact search, no approximation needed at this scale"],
    correct: 1, keywords: [],
    explanation: "HNSW is the right choice for low-latency, high-recall requirements when data fits in RAM. 20M 1536-dim float32 vectors = ~115GB — requires a large-memory instance. The trade-off is memory cost vs query speed. IVFFlat uses less memory but requires tuning nprobe to hit recall targets, and p99 latency is less predictable. Flat exact search at 20M vectors is orders of magnitude too slow for sub-5ms.",
    readMore: { label: "Vector DB Engineering →", tab: "systems" }
  },
  {
    id: "vdb-3", topic: "rag", difficulty: "medium", type: "mcq",
    question: "A RAG system over a product catalog frequently misses queries like 'SKU-48291' or 'CVE-2024-12345'. Root cause and fix?",
    options: ["Embedding model dimension too small — increase to 3072", "Dense retrieval fails on exact strings — add BM25 sparse retrieval and merge with RRF for hybrid search", "Chunk size too small — increase to capture more context", "Reranker model needed"],
    correct: 1, keywords: [],
    explanation: "Dense (vector) retrieval finds semantically similar content but is poor at exact string matching. Product codes, CVE identifiers, and serial numbers don't have semantic neighbors — they need exact lexical match. BM25 sparse retrieval handles this natively. Hybrid search merges dense + sparse results using Reciprocal Rank Fusion (RRF score = Σ 1/(k+rank_i)), ensuring both semantic similarity and keyword matches contribute to final ranking.",
    readMore: { label: "Vector DB Engineering →", tab: "systems" }
  },
  {
    id: "vdb-4", topic: "rag", difficulty: "hard", type: "mcq",
    question: "A multi-tenant RAG system serves 500 customers. Each customer should only retrieve their own documents. Correct architecture?",
    options: ["Separate vector DB index per customer — safest isolation", "Single index with customer_id metadata filter applied before vector search", "Single index, post-filter results by customer_id after retrieval", "Namespace per customer in Pinecone"],
    correct: 1, keywords: [],
    explanation: "A single index with pre-filtering by customer_id metadata is the standard production pattern. Pre-filtering (applied before ANN search) ensures the search space is restricted to the tenant's documents — correct isolation and efficient. Post-filtering (retrieve top-K globally, then filter) leaks information about other tenants' document existence in edge cases and wastes compute retrieving documents that will be discarded. Separate indexes per customer creates 500× the operational overhead.",
    readMore: { label: "Vector DB Engineering →", tab: "systems" }
  },
  {
    id: "vdb-5", topic: "rag", difficulty: "hard", type: "text",
    question: "Your IVFFlat index has recall@10 of 0.72 at your latency target. Walk through the two levers to improve recall without rebuilding the index from scratch.",
    options: null, correct: null,
    keywords: ["nprobe", "clusters", "probe", "recall", "nlist", "trade-off", "latency"],
    explanation: "The two IVFFlat recall levers: (1) Increase nprobe — the number of cluster centroids searched at query time. Default is often 1–4; increasing to 16–32 typically recovers 10–15 recall points at the cost of proportionally higher latency. (2) Check nlist calibration — if nlist (number of clusters) was set too high for your dataset size, many clusters are sparsely populated and nprobe misses them. Rule of thumb: nlist ≈ sqrt(n_vectors). Neither requires rebuilding — nprobe is a query-time parameter, nlist recalibration requires retraining but not re-ingesting data.",
    readMore: { label: "Vector DB Engineering →", tab: "systems" }
  },


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

function RevealCard({ isCorrect, q, onNext, nextLabel, onNavigate, onNavigateTo, animKey }) {
  return (
    <div key={animKey} className={`rounded-xl p-5 border space-y-3 transition-all duration-300 ${isCorrect ? "animate-correctPulse bg-emerald-500/10 border-emerald-500/40" : "animate-wrongShake bg-red-500/10 border-red-500/40"}`}>
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
          onClick={() => {
            if (q.readMore.postId && onNavigateTo) {
              onNavigateTo({ tab: q.readMore.tab, postId: q.readMore.postId });
            } else {
              onNavigate && onNavigate(q.readMore.tab);
            }
          }}
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

const TRAINER_TOPICS = ["all", ...Array.from(new Set(PREP_QUESTIONS.map(q => q.topic))).sort()];

function TrainerMode({ onExit, onNavigate, onNavigateTo }) {
  const [topicFilter, setTopicFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [questions, setQuestions] = useState(() => shuffle(PREP_QUESTIONS));
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [weakTopics, setWeakTopics] = useState({});
  const [done, setDone] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}"); }
    catch { return {}; }
  });
  const [weakOnly, setWeakOnly] = useState(false);

  function recordAnswer(questionId, correct) {
    setHistory(prev => {
      const entry = prev[questionId] || { attempts: 0, wrong: 0 };
      const next = {
        ...prev,
        [questionId]: {
          attempts: entry.attempts + 1,
          wrong: entry.wrong + (correct ? 0 : 1),
        }
      };
      try { localStorage.setItem("gsl-preplab-history", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Recompute filtered+shuffled questions whenever filters change
  useEffect(() => {
    const filtered = PREP_QUESTIONS.filter(q => {
      const topicOk = topicFilter === "all" || q.topic === topicFilter;
      const diffOk = diffFilter === "all" || q.difficulty === diffFilter;
      const weakOk = !weakOnly || (history[q.id]?.wrong > 0);
      return topicOk && diffOk && weakOk;
    });
    setQuestions(shuffle(filtered));
    setCurrent(0);
    setAnswer("");
    setSubmitted(false);
    setIsCorrect(false);
  }, [topicFilter, diffFilter, weakOnly]);

  const q = questions[current];

  function submit() {
    const ok = q.type === "mcq" ? parseInt(answer) === q.correct : scoreText(answer, q.keywords).pass;
    setIsCorrect(ok); setSubmitted(true);
    if (!ok) setWeakTopics(wt => ({ ...wt, [q.topic]: (wt[q.topic] || 0) + 1 }));
    setSessionAnswers(sa => [...sa, { q, correct: ok }]);
    recordAnswer(q.id, ok);
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
        {/* Filters */}
        <div className="space-y-2">
          {/* Topic pills */}
          <div className="flex flex-wrap gap-1.5">
            {TRAINER_TOPICS.map(t => (
              <button key={t} onClick={() => setTopicFilter(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${topicFilter === t ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
                {t === "all" ? "All topics" : t}
              </button>
            ))}
          </div>
          {/* Difficulty + count */}
          <div className="flex items-center gap-2">
            {["all", "medium", "hard"].map(d => (
              <button key={d} onClick={() => setDiffFilter(d)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${diffFilter === d ? "bg-zinc-200 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
                {d === "all" ? "All difficulty" : d}
              </button>
            ))}
            <span className="text-xs text-zinc-600 ml-auto">{questions.length} questions</span>
          </div>
          {/* Weak spots toggle */}
          {Object.values(history).some(h => h.wrong > 0) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeakOnly(w => !w)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${weakOnly ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              >
                <span>⚡</span>
                Weak spots ({Object.values(history).filter(h => h.wrong > 0).length})
              </button>
              {weakOnly && (
                <span className="text-xs text-zinc-600">Showing questions you've answered wrong</span>
              )}
              {Object.keys(history).length > 0 && (
                <button
                  onClick={() => { setHistory({}); try { localStorage.removeItem("gsl-preplab-history"); } catch {} }}
                  className="text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors ml-auto"
                >
                  Clear history
                </button>
              )}
            </div>
          )}
        </div>
        {questions.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center text-zinc-500 text-sm">
            No questions match these filters. Try a different topic or difficulty.
          </div>
        ) : (
          <>
            <div className="relative">
              <QuestionCard q={q} />
              {history[q.id]?.wrong > 0 && (
                <span className="absolute top-2 right-2 text-[10px] text-red-400 font-semibold">
                  ✗ {history[q.id].wrong}× wrong
                </span>
              )}
            </div>
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
                onNavigate={onNavigate} onNavigateTo={onNavigateTo} animKey={current} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── MODE 3: JD PREP ──────────────────────────────────────────────────────────

function JDPrepMode({ onExit, onNavigate, onNavigateTo }) {
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
              onNavigate={onNavigate} onNavigateTo={onNavigateTo} animKey={current} />
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

export default function PrepLab({ onNavigate, onNavigateTo }) {
  const [mode, setMode] = useState(null);

  if (mode === "exam") return <ExamMode onExit={() => setMode(null)} />;
  if (mode === "trainer") return <TrainerMode onExit={() => setMode(null)} onNavigate={onNavigate} onNavigateTo={onNavigateTo} />;
  if (mode === "jdprep") return <JDPrepMode onExit={() => setMode(null)} onNavigate={onNavigate} onNavigateTo={onNavigateTo} />;
  if (mode === "companyprep") return <CompanyPrepMode onExit={() => setMode(null)} onNavigate={onNavigate} />;
  if (mode === "defense") return <DefenseDocMode onExit={() => setMode(null)} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
        <div className="text-center space-y-3 pt-6 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">PrepLab</h1>
          <p className="text-zinc-400 text-base sm:text-lg">Questions sourced from 50+ real AI engineering interview loops — weighted toward the hard ones that actually matter.</p>
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
