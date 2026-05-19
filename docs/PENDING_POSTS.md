# Ground Truth — Pending Posts

Posts planned but not yet written. Each is defined in `src/GroundTruth.jsx` (POSTS array) but has no entry in `src/groundTruthPosts.js` yet.

Add content by adding `"<post-id>": [ ...blocks ]` to the `POST_CONTENT` export in `groundTruthPosts.js`. The post will automatically become visible on the site.

---

## Foundations (1 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `prompting-token-economics` | Prompt Engineering & Token Economics | playground |

## RAG (2 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `missing-context-failure` | Missing Context: When RAG Retrieves the Right Chunk but Answers Wrong | lab |
| `ambiguous-query-failure` | Ambiguous Queries: Why RAG Struggles When the Question Has Two Meanings | lab |

## Agents (3 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `planning-patterns` | Planning Patterns: ToT, GoT, and LATS | agents |
| `tracing-agent-loops` | Tracing Agent Loops: How to Debug Step-by-Step Execution | agents |

## Evaluation (1 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `ab-testing-llms` | A/B Testing LLM Systems: Statistical Significance and Metrics | systems |

## LLMOps (5 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `ml-cicd` | ML CI/CD: Testing, Versioning, and Deploying LLM Pipelines | systems |
| `shadow-ab-testing` | Shadow Mode Testing: How to Compare Models Before You Switch | explore |
| `model-strategy` | Model Strategy: When to Use GPT-4, Claude, Gemini, or Open | systems |

## Safety (2 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `bias-in-llms` | Bias in LLM Outputs: Sources, Types, and What You Can Detect | playground |
| `privacy-compliance-llms` | Privacy and Compliance for LLM Systems | systems |

## System Design (4 pending)

| ID | Title | Lab link |
|----|-------|----------|
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

## AI Product (3 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `ai-roadmap-prioritisation` | AI Roadmap Prioritisation: How to Decide What to Build Next | aipm |
| `explaining-ai-to-stakeholders` | Explaining AI to Non-Technical Stakeholders | aipm |
| `ai-launch-checklist` | The AI Launch Checklist: What to Verify Before Going Live | aipm |
| `model-card-reader` | How to Read a Model Card | explore |

## Model Profiles (3 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `llama-open-models` | Llama 3 and the Open-Source Model Ecosystem | explore |
| `mistral-cohere-frontier` | Mistral, Cohere, and the Frontier Beyond OpenAI/Anthropic | explore |

## Industry AI (4 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `ai-in-fintech` | AI in Fintech: Fraud Detection, Underwriting, Compliance | systems |
| `ai-in-healthcare` | AI in Healthcare: Clinical NLP and the Hallucination Problem | systems |
| `ai-in-enterprise-saas` | AI Features in Enterprise SaaS: What's Working vs Theatre | aipm |
| `solo-operator-ai` | The Solo Operator: How AI Lets One Person Run a Business | agents |

## Interview Prep (4 pending)

| ID | Title | Lab link |
|----|-------|----------|
| `ai-case-interview` | How to Ace an AI Case Interview | fluency |
| `take-home-challenges` | How to Crush AI Take-Home Challenges | career |
| `ai-benchmarks-explained` | AI Benchmarks Explained: MMLU, HumanEval, HELM, LMSYS | career |
| `context-tetris` | Context Tetris: Why What You Put in the Prompt Matters | playground |

---

## Priority order for next writing sprint

1. `planning-patterns` — completes the Agents section
2. `rag-system-design` — highest-value system design post
3. `ai-launch-checklist` — AI PM section anchor
4. `ab-testing-llms` — eval section gap
5. `ml-cicd` — LLMOps gap
6. `ai-in-fintech` — industry section anchor
7. `india-scale-ai` — unique angle, high relevance for target audience
8. `llama-open-models` — model profiles section
9. `bias-in-llms` — safety section
10. `context-tetris` — practical, high-traffic potential
