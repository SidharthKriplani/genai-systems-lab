# SKELETON.md — Planned Content: Internal Build Briefs

Every skeleton element in the product — coming-soon UI, placeholder sections, unbuilt modes — is documented here with two briefs:
- **Micro brief**: what this specific item is, exactly what to build, module-by-module
- **Macro brief**: how it sits in the product architecture, what user journey it completes, what it unlocks

Companion to UPGRADES.md (enhancements to existing things) and IDEAS.md (backlog). This file is for things that are *structurally present but empty* — stubs shown to users that need to be filled.

*Last updated: May 2026*

---

## How to use this file

Before fleshing out any skeleton:
1. Read the macro brief first — understand why this item exists before you write a single line
2. Read the micro brief — module-by-module scope, so you don't under- or over-build
3. Cross-check DECISIONS.md Section 4 (interactive decision engine standard) — every module must meet configure → logic → outcome → diagnosis
4. Update `modulesSkeleton` → `moduleIds` in GYMS (Concepts.jsx) as modules go live
5. Mark the item as Done here with the commit hash

---

## 1. CONCEPTS GYM — Coming-Soon Rooms (11 rooms)

### Macro brief (collective)

The Concepts Gym is the foundation layer beneath all three product branches (Build / Prove / Navigate). The 3 active rooms (Language Models, Retrieval, AI Agents) cover the mechanics behind the 3 most-used labs. The 11 coming-soon rooms fill in the rest of the skills map — each one unblocks a different lab or career track.

The build order matters:
1. **Evaluation** → unblocks Eval Lab as a learnable destination (currently the Eval Lab has no conceptual entry point)
2. **Production Systems** → unblocks Systems Lab (same gap)
3. **Foundation Models** → extends the LLM Lab conceptual coverage beyond inference into training
4. **Prompt Engineering** → unblocks Playground; the most-asked-about skill in job descriptions
5. **Observability & Tracing** → fills the gap between "build it" and "keep it running"
6. **Vector Infrastructure** → deepens RAG Lab — currently Retrieval gym covers the pipeline, not the storage
7. **AI Safety & Alignment** → standalone demand; red-teaming is in every senior JD
8. **Multimodal AI** → future-facing; build after all single-modal gaps are closed
9. **Cloud AI Services** → highly practical, low conceptual lift; mostly platform comparison
10. **AI Product Strategy** → feeds AIPM track; highest relevance for PM users
11. **Data for AI** → lowest immediate demand relative to effort; build last

---

### 1.1 Evaluation

**User teaser:** "5 modules on the metrics that actually matter. LLM-as-judge setup, RAGAS walkthrough, regression test design, and how to build an eval pipeline that catches quality regressions before users do."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `eval-fundamentals` | Eval Fundamentals | Configure eval types (exact match, NLI, LLM-as-judge) against a case — watch different metrics disagree on the same output |
| `llm-as-judge` | LLM-as-Judge | Configure a judge prompt, calibrate against human ratings, observe halo effect and length bias failures |
| `ragas-pipeline` | RAGAS Deep Dive | Configure a RAG system, run RAGAS metrics (faithfulness, relevance, context recall), watch scores degrade with bad retrieval configs |
| `regression-testing` | Regression Test Design | Build an eval suite against a prompt change — configure which cases to include, watch silent regression |
| `eval-pipeline-design` | Eval Pipeline Design | Configure an eval pipeline (CI trigger, dataset, judge, threshold) — simulate a deploy-blocking failure |

**Interactive standard:** Every module must have a config surface and a failure mode. `eval-fundamentals` should show score disagreement (two metrics, same output, opposite conclusions). `llm-as-judge` must produce a visible calibration failure at some setting.

**Lab pointer:** Eval Lab. Each module ends with "Ready to apply this? → Eval Lab [module]"

**Build trigger:** When Eval Lab usage data (PostHog) shows users completing scenarios — they're ready for the conceptual layer.

---

### 1.2 Production Systems

**User teaser:** "5 modules on the engineering tradeoffs that separate demos from deployments — cost per token modeling, KV cache mechanics, batching strategies, model routing, and the deployment pattern decision."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `cost-latency-design` | Cost vs Latency Design | Configure model size, batching, context length — live cost/latency output; find the Pareto frontier |
| `kv-cache-mechanics` | KV Cache Mechanics | Visualize how KV cache fills, what cache hits save, what prefix caching requires |
| `batching-throughput` | Batching & Throughput | Configure batch size, sequence length, concurrency — watch throughput vs latency tradeoff materialize |
| `model-routing-design` | Model Routing Design | Configure a routing decision (fast vs quality model) based on query complexity signals — watch cost/quality impact |
| `deployment-patterns` | Deployment Patterns | Configure serverless vs dedicated vs spot — failure scenario: serverless cold start under bursty traffic |

**Lab pointer:** Systems Lab (LLM Lab modules: `serving`, `kvcache`, `inference`)

**Build trigger:** After Foundation Models gym — users need to understand what they're serving before they learn to serve it efficiently.

---

### 1.3 Foundation Models

**User teaser:** "5 modules tracing how foundation models are trained and adapted — pretraining mechanics, RLHF alignment, LoRA/QLoRA fine-tuning, model family comparison, and what scaling laws actually predict."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `pretraining-mechanics` | Pretraining Mechanics | Configure data mix, sequence length, learning rate — watch loss curve shape; failure mode: data contamination |
| `rlhf-walkthrough` | RLHF Walkthrough | Step through reward model training → PPO loop → policy drift. Configure beta parameter, watch overoptimization |
| `lora-qlora-finetuning` | LoRA / QLoRA Fine-tuning | Configure rank, alpha, target layers — watch trainable parameter count and VRAM requirement |
| `model-family-comparison` | Model Family Comparison | Configure task + constraint → get model recommendation with failure modes (not a table — a decision engine) |
| `scaling-laws` | Scaling Laws | Configure compute budget → model size vs data size tradeoff. Chinchilla vs GPT-4 scaling regime |

**Lab pointer:** LLM Lab (all 9 modules)

**Note:** These modules are higher conceptual depth than the active gyms. `pretraining-mechanics` and `rlhf-walkthrough` need care to stay `~ Simplified` (fidelity badge) — don't overreach into mathematically faithful territory unless the simulation is actually correct.

---

### 1.4 Prompt Engineering

**User teaser:** "5 modules treating prompts as engineering artifacts — few-shot design patterns, chain-of-thought strategies, structured output reliability, versioning and regression testing, and system prompt architecture."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `few-shot-design` | Few-Shot Design | Configure example count and ordering — watch performance variance; failure: negative examples poisoning output |
| `chain-of-thought` | Chain-of-Thought | Configure CoT prompt style (zero-shot, step-by-step, tree-of-thought) — benchmark on reasoning tasks |
| `structured-output-prompting` | Structured Output Reliability | Configure JSON schema enforcement — watch schema violation rates; compare grammar-constrained vs free-form |
| `prompt-versioning` | Prompt Versioning | Simulate a prompt change A/B: configure old/new prompt, watch score delta on eval set, catch silent regression |
| `system-prompt-architecture` | System Prompt Architecture | Configure system prompt layers (persona, constraints, output format, examples) — watch interaction effects and injection risk |

**Lab pointer:** Playground (injection, chunking, hallucination labs)

**Build trigger:** High demand — every AI engineer asks about prompting. Build 3rd, after Evaluation and Production Systems.

---

### 1.5 Cloud AI Services

**User teaser:** "5 modules on the managed AI platform landscape — AWS Bedrock + AgentCore, Vertex AI, Azure AI Foundry, when serverless beats self-hosted, and the real cost model behind enterprise AI APIs."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `aws-bedrock-agentcore` | AWS Bedrock & AgentCore | Configure a Bedrock deployment — model choice, knowledge base, guardrails. AgentCore for agentic workflows |
| `vertex-ai-gemini` | Vertex AI & Gemini | Configure a Vertex pipeline — Gemini model selection, grounding, context caching, Vertex AI Studio |
| `azure-ai-foundry` | Azure AI Foundry | Configure an Azure deployment — hub/project model, Promptflow, content filtering, Azure OpenAI endpoints |
| `managed-vs-selfhosted` | Managed vs Self-Hosted | Decision engine: configure workload (volume, latency, privacy, cost) → recommendation with failure scenarios |
| `enterprise-ai-cost-model` | Enterprise AI Cost Model | Configure enterprise usage profile → TCO model across platforms; failure: hidden egress costs |

**Note:** This gym is more reference-heavy than other gyms. Every module must still pass the interactive standard — the managed vs self-hosted module is the easiest to make interactive. Start there.

**Build trigger:** Enterprise demand signal in PostHog or user feedback. Lower priority than Prompt Engineering.

---

### 1.6 Vector Infrastructure

**User teaser:** "5 modules on vector storage from first principles — HNSW vs IVF index mechanics, pgvector vs managed services, hybrid BM25+dense search, metadata filtering at scale, and migration patterns between vector stores."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `vector-db-index-mechanics` | Index Mechanics: HNSW vs IVF | Configure index type, ef_construction, m parameter — watch recall vs latency tradeoff; failure: HNSW construction OOM |
| `pgvector-vs-managed` | pgvector vs Managed | Decision engine: configure scale, query pattern, ops maturity → recommendation with migration cost |
| `hybrid-search-design` | Hybrid Search Design | Configure BM25 + dense weights (alpha) — watch recall change on keyword-heavy vs semantic queries |
| `metadata-filtering` | Metadata Filtering at Scale | Configure pre-filter vs post-filter → watch recall degradation at different filter selectivity levels |
| `vector-migration-patterns` | Vector Store Migration | Configure source → target migration (data volume, index type, zero-downtime requirement) → failure scenario |

**Lab pointer:** RAG Lab (all scenarios involve retrieval — this gym deepens the storage layer)

**Note:** Extends the active Retrieval gym. Build after Evaluation and Prompt Engineering gyms are live.

---

### 1.7 Observability & Tracing

**User teaser:** "5 modules on keeping LLM apps healthy in production — span tracing setup, cost/quality dashboards, detecting prompt drift before users notice, eval-in-production pipelines, and AI system incident response."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `span-tracing-fundamentals` | Span Tracing Fundamentals | Configure a trace (spans, latency budget, token counts) — simulate a retriever timeout; diagnose from trace |
| `cost-quality-monitoring` | Cost & Quality Monitoring | Configure monitoring dashboard (cost/token, quality score, p95 latency) — watch alert threshold design |
| `prompt-drift-detection` | Prompt Drift Detection | Simulate a prompt change + upstream model update — watch quality metric drift over synthetic traffic |
| `eval-in-production` | Eval in Production | Configure eval sampling rate, judge, feedback loop — design shadow eval pipeline without blocking requests |
| `incident-response-ai` | AI Incident Response | Configure on-call runbook: symptom → trace → root cause path. 3 pre-built incident scenarios |

**Lab pointer:** Eval Lab (`langsmith`, `observability`, `debug_traces` modules)

---

### 1.8 Multimodal AI

**User teaser:** "5 modules on AI systems that see, hear, and read — how vision-language models process images, CLIP embedding mechanics, building multimodal RAG pipelines, audio pipeline design, and cross-modal search."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `vision-language-models` | Vision-Language Models | Configure image + text input → watch token allocation, resolution tradeoff, failure on small text in images |
| `clip-mechanics` | CLIP Mechanics | Interactive: encode image query → find top-k image/text matches; watch zero-shot classification |
| `multimodal-rag` | Multimodal RAG | Configure a multimodal RAG pipeline (images + text) — failure: captions vs direct image embedding quality gap |
| `audio-pipeline-design` | Audio Pipeline Design | Configure ASR → LLM pipeline — failure: transcription error propagation; diarization failure on overlap |
| `cross-modal-retrieval` | Cross-Modal Retrieval | Configure text→image and image→text retrieval — watch embedding space mismatch failure |

**Note:** Highest "cool factor" but not the highest practical demand for the core audience (AI engineers at tech companies). Build after all single-modal gaps are closed.

---

### 1.9 AI Safety & Alignment

**User teaser:** "5 modules on building AI systems that behave — Constitutional AI mechanics, structured red-teaming, jailbreak defense architectures, bias and toxicity measurement at scale, and alignment tradeoffs in deployed products."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `constitutional-ai-mechanics` | Constitutional AI | Configure critique-revision loop — watch how constitutional principles change outputs; compare RLHF vs CAI |
| `red-teaming-methodology` | Red-Teaming Methodology | Configure a red-team exercise: attack categories, coverage target, failure to catch rate |
| `jailbreak-defense-architecture` | Jailbreak Defense Architecture | Configure defense layers (input classifier, structural isolation, output filter) — watch bypass rates at each layer |
| `bias-toxicity-at-scale` | Bias & Toxicity at Scale | Configure a bias audit (demographic parity, counterfactual pairs) — watch measurement methodology failures |
| `alignment-in-practice` | Alignment in Practice | Configure RLHF vs RLAIF vs DPO tradeoffs — watch helpfulness/harmlessness Pareto curve |

**Lab pointer:** Playground (injection lab already covers part of this — these modules deepen the conceptual layer)

---

### 1.10 AI Product Strategy

**User teaser:** "5 modules on the product decisions that determine whether an AI feature ships — build vs buy frameworks, model selection criteria, the right metrics for AI features, cost modeling under uncertainty, and why 95% of AI pilots fail to reach production."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `build-vs-buy` | Build vs Buy Framework | Decision engine: configure product context (scale, customization need, ops maturity, risk tolerance) → recommendation |
| `model-selection-criteria` | Model Selection Criteria | Configure task + constraint → scored model recommendation with cost/quality/latency tradeoffs |
| `ai-product-metrics` | AI Product Metrics | Configure an AI feature (RAG chatbot, copilot, classifier) → correct metric set; failure: wrong metric driving wrong behavior |
| `cost-modeling-ai-features` | Cost Modeling AI Features | Configure usage projections → TCO model with uncertainty bands; failure: underestimating inference cost at scale |
| `why-pilots-fail` | Why AI Pilots Fail | 5 production failure modes (data quality, eval gap, deployment complexity, user trust, wrong problem) — configure a pilot to fail each way |

**Lab pointer:** AIPM tab (PRD simulator, roadmap prioritizer, launch checklist)

**Note:** This gym serves the PM audience specifically. Build when AIPM tab is getting meaningful traffic.

---

### 1.11 Data for AI

**User teaser:** "5 modules on the data layer that determines model quality — synthetic data generation, fine-tuning dataset curation, annotation pipeline design, building a data flywheel, and why quality beats quantity in training data."

**Micro brief — planned modules (5):**

| Module ID | Title | What it builds |
|---|---|---|
| `synthetic-data-generation` | Synthetic Data Generation | Configure a synthetic data pipeline (seed data, diversity strategy, quality filter) — failure: mode collapse |
| `finetuning-dataset-curation` | Fine-tuning Dataset Curation | Configure curation criteria (quality threshold, format, deduplication) — watch how data quality changes fine-tune results |
| `annotation-pipeline-design` | Annotation Pipeline Design | Configure annotator count, agreement threshold, gold set ratio — watch inter-annotator agreement failure |
| `data-flywheel` | The Data Flywheel | Configure feedback loop (user signals → curation → retrain) — watch flywheel compound vs stall |
| `data-quality-vs-quantity` | Quality vs Quantity | Configure a training dataset (size vs quality tradeoffs) — reproduce Chinchilla-style finding: smaller, cleaner beats larger, dirty |

**Build trigger:** Lowest immediate demand for the core audience. Build after all other gyms are live. May belong in a separate "ML Engineering" branch of the gym if the product expands.

---

## 2. PREPLAB — Coming-Soon Modes

### Macro brief

PrepLab has 6 sidebar modes. Four are fully built (Exam, Trainer, Interview Prep Plan, Weakness Heatmap). Two are skeleton: Company Tracks and Defense Doc.

Company Tracks and Defense Doc serve different sub-audiences:
- **Company Tracks**: users with a specific company target — Google, Anthropic, Swiggy, etc. High conversion intent.
- **Defense Doc**: users with an interview date and a JD — they want a pre-brief, not a drill. Different from Interview Prep Plan (which is a full gap analysis).

Both are gated (access code now, paid later). Neither is currently interactive — Company Tracks clicks through to nothing; Defense Doc likely shows a placeholder.

---

### 2.1 Company Tracks

**User teaser (sidebar desc):** "Pick a company archetype. Get question sets weighted to that company's known interview patterns, a system design cheat sheet specific to their tech stack, and 2–3 role-specific challenges."

**Micro brief:**

Company archetypes (4 tracks):
1. **Big Tech AI** (Google DeepMind, Meta AI, Microsoft, Amazon): Heavy ML fundamentals, system design at scale, evals rigor, RL/RLHF
2. **AI-Native Startups** (Anthropic, OpenAI, Cohere, Mistral, Perplexity): Alignment awareness, fast iteration, research taste, safety-conscious engineering
3. **Indian Tech** (Flipkart, Swiggy, Zomato, PhonePe, CRED): Applied GenAI on constrained infra, cost-sensitivity, Hindi/Indic language challenges, scale on limited GPU
4. **Enterprise AI** (Infosys, TCS, Accenture AI, SAP, Salesforce): Integration patterns, responsible AI policies, vendor selection, enterprise procurement

Per track:
- 20 questions weighted to that archetype's patterns (drawn from existing bank, reweighted)
- 1 system design challenge specific to that company's known products (curated, not generated)
- 3 "cultural lens" callouts (what matters to this company specifically, from job postings + interview reports)

**Build trigger:** When access code gate is active and paying users are requesting it. Data signal: track "Company Tracks" click events in PostHog — high click-through with empty destination = build now.

---

### 2.2 Defense Doc

**User teaser (sidebar desc):** "Paste a job description. Get your pre-interview brief: topic priority stack, system design cheat sheet, must-know concepts for this role, STAR story starters for your background, and questions to ask at the end."

**Micro brief:**

The Defense Doc is a one-shot output document, not a drill mode. It generates from a JD paste:
1. **Topic priority stack**: top 5 topics by JD weight (from Interview Prep Plan keyword detection — reuse the same engine)
2. **System design cheat sheet**: 2–3 system design problems likely for this role, with answer scaffolds
3. **Must-know concepts**: 10 bullet points — the non-negotiable knowledge for this JD
4. **STAR story starters**: 3–4 behavioral question starters framed for the user's likely background (infer from JD level: senior/staff → leadership/scope; junior → technical precision/learning)
5. **Questions to ask**: 5 thoughtful questions that signal you understand the domain

Output format: rendered in-browser (same dark card style as the rest of PrepLab), plus a "Copy to clipboard" button that exports as formatted text.

**Dependency:** Reuse the keyword extraction engine from `InterviewPrepMode`. The Defense Doc is a different output format from the same input signal.

**Build trigger:** After Interview Prep Plan Phase 4 is live — users who complete the plan will want the pre-interview brief as a final deliverable.

---

## 3. GROUND TRUTH — Series + Tags Architecture

### Macro brief

222 posts on a wall is a known conversion killer. The series architecture converts the GT wall into a structured reading experience — but it requires content taxonomy work before any UI is built.

The series approach (documented in UPGRADES.md) creates 5–7 named series. Each series is a narrative arc, not a topic bucket. A post belongs to a series when it advances that arc — not just when it's topically related.

### Micro brief

**Step 1 — Taxonomy (content work, no code):**
Define 6 series with 15–30 posts each:

| Series | Arc | Example posts |
|---|---|---|
| **Production Failures** | How and why real AI systems break | prompt-injection-production, why-rag-lies, stale-retrieval-patterns, context-overflow-failures |
| **Architecture Decisions** | The choices that shape system design | rag-architectures, vector-db-selection-guide, what-is-a-transformer, agent-memory-architecture |
| **Inference & Serving** | How models run in production | inference-optimisation, kv-cache-explained, quantization-tradeoffs, speculative-decoding |
| **Alignment & Safety** | Making models behave | rlhf-dpo-explained, constitutional-ai-explained, prompt-injection-production, llm-security-red-teaming |
| **Eval & Observability** | Measuring what you built | eval-crisis, llm-as-judge-patterns, ragas-explained, prompt-regression-testing |
| **Career & Craft** | Being the engineer who ships AI** | type-a-vs-type-b, ds-to-ai-engineer, forward-deployed-engineer, claudemd-as-architecture |

**Step 2 — Code (`groundTruthIndex.js`):**
Add `series: "series-slug"` to each post metadata. Add `seriesOrder: N` for reading order within series.

**Step 3 — UI (`GroundTruth.jsx`):**
Replace the flat wall with a series card grid on default load. Clicking a series card shows posts in order with progress tracking.

**Build trigger:** When GT has regular returning users (PostHog: same user visiting GT multiple times). The series makes repeat visits more valuable.

---

## 4. STRUCTURAL REBUILD — Build / Prove / Navigate

### Macro brief (this is the largest pending item)

The current nav (14 tabs) was built organically. No first-time visitor understands the shape. The rebuild consolidates into 3 front doors + 1 foundation layer + 1 knowledge gateway. Documented in CLAUDE.md "Structural Upgrade" section.

**This is not a feature sprint. It is an architecture sprint.** Do not start until:
- PostHog WAU baseline is confirmed (DECISIONS.md §0b)
- RAG Lab done card + TYU crash are fixed (UPGRADES.md Critical items)
- At least 2 more Concepts gyms are live (so the gym grid doesn't look empty)

### Micro brief (skeleton map)

| Branch | Current tabs | New home | Status |
|---|---|---|---|
| **Build** | RAG Lab, Agent Lab, LLM Lab, Eval Lab | Primary front door | Skeleton — nav exists, no unified shell |
| **Prove** | PrepLab | Secondary front door | Working — needs mode consolidation |
| **Navigate** | AIPM, Career | Tertiary front door | Skeleton — tabs exist, no unified entry |
| **Foundation** | Concepts | Sub-layer below all 3 | Working — gym skeleton in place |
| **Knowledge** | Ground Truth + Ask | Cross-cutting layer | Working — needs series architecture |

The "Build" front door needs a new shell component that surfaces all 4 labs as first-class entries, not as nav tabs. Each lab gets a card: what you'll configure, what you'll break, what you'll understand.

The "Navigate" front door needs a wrapper that asks: "What are you trying to navigate?" → interview prep path (→ PrepLab) / career transition (→ Career) / product decisions (→ AIPM). Same content, guided entry.

**Implementation note:** Do the Navigate wrapper first — it's the smallest change (Career + AIPM already exist, just need a shared shell). Build → Prove → structural nav refactor last.

---

## 5. HOME.JSX — Skeleton Sections

### 5.1 Welcome Modal / Onboarding Entry

**Status:** Pending (UPGRADES.md entry exists)
**User teaser:** First-visit modal: "What are you here to do?" → 3 goal-based paths.
**Micro brief:** S effort. Modal on first visit (localStorage flag). 3 buttons: Get interview-ready → PrepLab Exam; Build something → RAG Lab Scenario 1; Understand how it works → Concepts Gym selector. "Explore on my own" dismisses. See UPGRADES.md.
**Build trigger:** After hero copy rewrite is confirmed working (don't guide users deeper into a confused product).

### 5.2 Social Proof Strip

**Status:** Blocked on content
**User teaser:** Real quotes from engineers who used the lab to prep for interviews or ship better systems.
**Micro brief:** Code = S effort (slot already exists, just needs real data). Content = blocked. Need 3–5 named quotes with LinkedIn handles and permission. Outreach → collect → insert.
**Build trigger:** When you have real quotes. Remove placeholder until then.

---

## 6. CONCEPTS.JSX — Module Skeletons within Active Gyms

Some active gym rooms reference modules not yet fully built. These are listed here.

### Evaluation gym (coming soon)
Will eventually surface modules: `eval-fundamentals`, `llm-as-judge`, `ragas-pipeline`, `regression-testing`, `eval-pipeline-design`

### Production Systems gym (coming soon)
Will eventually surface modules: `cost-latency-design`, `kv-cache-mechanics`, `batching-throughput`, `model-routing-design`, `deployment-patterns`

### All other coming-soon gyms
See Section 1 above for full planned module lists.

---

## 7. REVISION LOG

| Date | Change |
|---|---|
| May 2026 | Created — initial skeleton map across all coming-soon elements |
