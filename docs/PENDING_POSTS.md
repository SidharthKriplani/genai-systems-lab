# Ground Truth — Pending Posts

Posts planned but not yet written. Each is defined in `src/GroundTruth.jsx` (POSTS array) but has no entry in `src/groundTruthPosts.js` yet.

Add content by adding `"<post-id>": [ ...blocks ]` to the `POST_CONTENT` export in `groundTruthPosts.js`. The post will automatically become visible on the site.

---

## Foundations (2 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `self-attention-deep-dive` | Self-Attention: From Dot Products to What the Model Focuses On | concepts |
| `prompting-token-economics` | Prompt Engineering & Token Economics | playground |

## RAG (5 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `rag-architectures` | RAG Architectures: Naive, Advanced, Modular, and Agentic | flows |
| `missing-context-failure` | Missing Context: When RAG Retrieves the Right Chunk but Answers Wrong | lab |
| `ambiguous-query-failure` | Ambiguous Queries: Why RAG Struggles When the Question Has Two Meanings | lab |
| `hybrid-search` | Hybrid Search: Combining BM25 and Vector Retrieval | lab |

## Agents (6 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `tool-use-design` | Tool Use Design: Contracts, Consequences, and MCP | agents |
| `multi-agent-orchestration` | Multi-Agent Orchestration: Supervisor, Pipeline, and Mesh | agents |
| `planning-patterns` | Planning Patterns: ToT, GoT, and LATS | agents |
| `tracing-agent-loops` | Tracing Agent Loops: How to Debug Step-by-Step Execution | agents |
| `agent-failure-modes` | How AI Agents Fail in Production: A Full Taxonomy | agents |

## Evaluation (2 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `eval-pipeline-design` | Building an Eval Pipeline That Catches Production Failures | systems |
| `ab-testing-llms` | A/B Testing LLM Systems: Statistical Significance and Metrics | systems |

## LLMOps (7 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `llmops-production-checklist` | LLMOps: What Production AI Needs That Tutorials Skip | systems |
| `ml-cicd` | ML CI/CD: Testing, Versioning, and Deploying LLM Pipelines | systems |
| `context-compaction` | Context Compaction: Managing Long Conversations | systems |
| `cost-latency-tradeoffs` | Cost vs. Latency Tradeoffs: How to Budget Both | systems |
| `shadow-ab-testing` | Shadow Mode Testing: How to Compare Models Before You Switch | explore |
| `model-strategy` | Model Strategy: When to Use GPT-4, Claude, Gemini, or Open | systems |

## Safety (3 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `guardrails-for-llms` | Guardrails for LLMs: Input/Output Filtering in Production | concepts |
| `red-teaming-llms` | Red Teaming LLMs: A Structured Methodology | explore |
| `bias-in-llms` | Bias in LLM Outputs: Sources, Types, and What You Can Detect | playground |
| `privacy-compliance-llms` | Privacy and Compliance for LLM Systems | systems |

## System Design (4 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `ai-system-design-framework` | A Framework for AI System Design Interviews (Staff+ Level) | systems |
| `rag-system-design` | Designing a Production RAG System: Full Architecture Walkthrough | lab |
| `agent-system-design` | Designing an Agent System for Production | agents |
| `india-scale-ai` | Building AI at India Scale: Latency, Language, and Cost Constraints | systems |
| `structured-outputs` | Structured Outputs from LLMs: JSON Mode, Function Calling, Tool Use | explore |

## Production Failures (5 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `stale-document-failure` | Case Study: Stale Documents Made a Compliance Chatbot Wrong | lab |
| `multihop-reasoning-failure` | Multi-Hop Reasoning Failures: When RAG Can't Connect the Dots | lab |
| `context-overflow-failure` | Context Overflow: When Your RAG Pipeline Runs Out of Space | lab |
| `incident-room` | The Incident Room: How to Respond to LLM Production Failures | systems |
| `latency-planner` | When Your LLM Is Too Slow: Diagnosing Latency Regressions | explore |

## AI Product (5 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `prd-for-ai` | Writing PRDs for AI Features: A Framework for PMs | aipm |
| `ai-or-not` | AI-or-Not? A Decision Framework for Product Managers | aipm |
| `ai-roadmap-prioritisation` | AI Roadmap Prioritisation: How to Decide What to Build Next | aipm |
| `explaining-ai-to-stakeholders` | Explaining AI to Non-Technical Stakeholders | aipm |
| `ai-launch-checklist` | The AI Launch Checklist: What to Verify Before Going Live | aipm |
| `model-card-reader` | How to Read a Model Card | explore |

## Model Profiles (3 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `llama-open-models` | Llama 3 and the Open-Source Model Ecosystem | explore |
| `mistral-cohere-frontier` | Mistral, Cohere, and the Frontier Beyond OpenAI/Anthropic | explore |
| `model-benchmarks-deep-dive` | Reading Model Benchmarks Without Being Misled | explore |

## Industry AI (4 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `ai-in-fintech` | AI in Fintech: Fraud Detection, Underwriting, Compliance | systems |
| `ai-in-healthcare` | AI in Healthcare: Clinical NLP and the Hallucination Problem | systems |
| `ai-in-enterprise-saas` | AI Features in Enterprise SaaS: What's Working vs Theatre | aipm |
| `solo-operator-ai` | The Solo Operator: How AI Lets One Person Run a Business | agents |

## Careers & Salaries (3 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `ml-engineer-role` | What Does an ML Engineer Actually Do in 2025? | career |
| `ai-pm-role` | The AI Product Manager: What's Different, How to Break In | aipm |
| `breaking-into-ai` | Breaking Into AI: Fastest Path from SWE to AI Engineer | career |

## Interview Prep (7 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `llm-interview-question-patterns` | LLM Interview Question Patterns: What Senior Engineers Ask | fluency |
| `rag-interview-questions` | 25 RAG Interview Questions With Model Answers | lab |
| `ai-case-interview` | How to Ace an AI Case Interview | fluency |
| `ai-vocabulary` | The AI Vocabulary Cheat Sheet: 80 Terms You Need Cold | fluency |
| `take-home-challenges` | How to Crush AI Take-Home Challenges | career |
| `ai-benchmarks-explained` | AI Benchmarks Explained: MMLU, HumanEval, HELM, LMSYS | career |
| `context-tetris` | Context Tetris: Why What You Put in the Prompt Matters | playground |

---

## Priority order for next writing sprint

1. `self-attention-deep-dive` — core foundations, referenced everywhere
2. `rag-architectures` — completes the RAG learning loop
3. `multi-agent-orchestration` — completes the Agents lab loop
4. `guardrails-for-llms` — completes the Safety section
5. `ai-system-design-framework` — highest-value interview prep
6. `llm-interview-question-patterns` — highest-traffic interview post
7. `prd-for-ai` — completes the AI PM loop
8. `hybrid-search` — RAG lab CTA
9. `breaking-into-ai` — career section anchor
10. `llmops-production-checklist` — most-linked LLMOps post
