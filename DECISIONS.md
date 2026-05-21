# GenAI Systems Lab — Product Lineage & Decision Record

This document captures the full history of product decisions, architectural choices, deliberate exclusions, pending ideas, and the commercial strategy conclusion for GenAI Systems Lab. It exists so that any future collaborator (or future me, six months from now) can understand not just *what* the app is, but *why* it is the way it is.

---

## 1. Project genesis

GenAI Systems Lab was built as a portfolio and learning artifact, not as a funded product. The starting intent: an interactive tool for AI engineers and PMs to develop intuition about production AI systems — not through video or reading, but through configuration, observation, and diagnosis.

The core thesis from day one: **most AI learning resources tell you what to do. This one makes you do it and watch what happens.**

The original scope was Concepts + RAG Lab. Everything else grew organically from the question "what else does someone need to reason confidently about production AI?"

---

## 2. Architecture decisions

### Static, zero-backend

**Decision:** No backend, no API calls, no database, no authentication. Everything runs in the browser.

**Why:** Backend infrastructure adds cost, maintenance burden, auth complexity, and privacy obligations. For a learning tool, none of these are worth the tradeoff. Static deployment on Vercel free tier means zero ongoing cost and zero operational overhead.

**Implication:** All interactive modules use precomputed data or client-side logic. The RAG Lab scenarios are curated JSON configs, not live retrieval. The Embedding Space uses precomputed 2D coordinates, not live model embeddings. This is a feature (honesty, no hallucinated API responses) and a limitation (no live model introspection).

### React 18 + Vite 6 + Tailwind v4

**Decision:** Standard modern stack. Tailwind v4 uses `@tailwindcss/vite` directly — no PostCSS, no config file.

**Why Tailwind v4 specifically:** Simpler setup, faster builds. The tradeoff: some third-party components still expect v3 class names. Managed by staying with Tailwind's own utility classes.

### localStorage for all persistence

**Decision:** Progress tracking, challenge scores, What's New dismissed state, leaderboard, bookmarks, streaks, recently viewed posts, mark-as-read, and module scores all persist to `localStorage`. No server sync.

**Why:** Consistent with zero-backend constraint. Users own their data. No GDPR obligations. No account friction.

**Limitation:** Progress doesn't sync across devices. Accepted tradeoff.

### Single-file components

**Decision:** Each tab is a single JSX file. Large components were extracted into their own files only when the parent would have exceeded ~2500 lines.

**Why:** Simplicity over architecture purity. No routing library, no state management library, no context API.

### Hash-based URL routing (no React Router)

**Decision:** Added hash-based URL routing (`#concepts`, `#systems`, etc.) by syncing `window.location.hash` with the `topView` state. Back/forward button works. Deep links are shareable.

**Why not React Router:** Full router refactor would touch every navigation call and add complexity for marginal gain. Hash routing solves the user problem (shareable URLs, browser history) with ~20 lines of code.

### Ground Truth post rendering

**Decision:** All post content lives in `src/groundTruthPosts.js` as a flat JS object of typed content blocks. No markdown, no MDX.

**Block types:** `p`, `h2`, `h3`, `callout`, `code`, `list`, `table`, `lab`, `video`, `animation`, `divider`, `quote`, `references`.

**Why:** MDX requires a compilation step. A plain JS object is trivially tree-shakeable and dead-simple to extend.

### Unified question bank (PrepLab)

**Decision:** PrepLab.jsx contains a self-contained 57-question bank rather than importing from all other tab files. Each question has: topic, difficulty, type (mcq|text), options, correct index, explanation, readMore link.

**Why:** Cross-file imports across 8 files would create tight coupling and make the question bank hard to maintain. A single self-contained bank is simpler and LLM-upgrade-friendly (swap the scorer, not the data).

---

## 3. Product decisions

### Tab structure (13 tabs)

**Current tabs:** Home, Concepts, Flows, RAG Lab, Agents, Systems, Playground, Explore, Fluency, AI Product, Career, **Ask** (Consultation), **PrepLab**.

**Ask** was added as a lightweight consultation space — keyword search over all 140+ GT posts + 57 module descriptions. Conversational UI. LLM-ready: swap the scoring function for embeddings + add a generation step without touching the UI.

**PrepLab** was added to the GROW group. Three modes: timed assessment exam (15/30/60 min), trainer with immediate feedback, and JD+resume gap analysis with targeted drill.

### PrepLab — three modes

**Assessment Mode:** 15/30/60 min timed exam. All scores hidden until end. Final reveal: total score, per-category breakdown, "Strong in / Needs work" callout, wrong-answer review.

**Trainer Mode:** Same question bank, immediate feedback after each answer. Optional speech input via Web Speech API (Chrome). Tracks weak topics. Session summary with "Study these next" recommendations.

**JD Prep Mode:** Paste JD → keyword extraction against 8 skill categories → skill gap vs pasted resume → 20-question targeted drill weighted by gaps → Interview Readiness Score.

**Speech support:** `window.SpeechRecognition || window.webkitSpeechRecognition` — if available, mic button appears. Transcribed text fills the answer field. Degrades gracefully to text input.

### Fidelity tagging system

Every Concepts and Explore module gets a fidelity badge:
- `✓ Mathematically faithful` — real algorithm logic (Tokenizer, Sampling)
- `~ Simplified` — correct pattern, toy scale (Attention, Transformer, Agent Loop)
- `◌ Conceptual` — illustrative only (Embedding Space, Multi-Agent)

### HowTo component

Every module opens with a `HowTo` component: what skill you're building, what the steps are. Never more than 3 steps. Sets cognitive frame before interaction.

### RAG Lab as the flagship module

Five production failure scenarios (stale retrieval, hallucination, prompt injection, context overflow, multi-hop). Each scenario has 6-8 configs with detailed failure explanations and system design lessons. Most differentiated content in the app.

### Challenge Log (not "Leaderboard")

Renamed from "Leaderboard." Tracks your own pass/fail record, not rankings. "Leaderboard" implied competition the feature doesn't support.

### Ground Truth tone

"Knowledgeable colleague" voice — technically precise but not academic. Emotional hooks and real failure stories used deliberately. The goal: readers finish feeling like they've talked to someone who shipped this in production.

### Consultation Space (Ask tab) — architecture

Knowledge base built client-side on first render: all 140+ GT posts (title × 3, tags × 2, desc × 1 scoring weight) + 57 module descriptions. Stopword stripping. Top 5 scored results returned. 8 suggested questions. Session conversation history.

**LLM upgrade path:** Replace the keyword scorer with embedding similarity (Voyage AI or OpenAI `text-embedding-3-small`) + add a Claude API generation step. UI and retrieval layer stay identical.

---

## 4. Full feature lineage (chronological)

| Feature | Rationale |
|---------|-----------|
| RAG Lab (5 scenarios) | Core flagship — production failure simulation nobody else does |
| Concepts (11 modules) | Build the prerequisite mental models for the Lab |
| Flows (6 diagrams) | Animated pipeline — cements the full system view |
| ⌘K global search | 77+ modules with no search was a dead end |
| Start Here journey | 11 tabs but no committed entry point — added 7-step path |
| What's New badge | Returning users had no idea what changed |
| OG image | No `og:image` meant blank link previews |
| Ground Truth (v1, 37 posts) | SEO surface + credibility anchor |
| YouTube embeds | 7 posts paired with Karpathy/3Blue1Brown without leaving the page |
| Per-post dynamic meta | Browser tabs show post titles; sharing produces meaningful previews |
| Salary calculator | Interactive comp estimator in AI Salary Guide post |
| Mobile hamburger nav | 11-tab nav unusable on mobile |
| Challenge Log | Track pass/fail across RAG Lab scenarios |
| Share Score | Clipboard copy of challenge score |
| Progress bars on paths | Returning users had no memory of where they'd been |
| Agents tab (7 modules) | ReAct, tool use, memory, multi-agent, MCP protocol, loop sim |
| Systems tab (16 modules) | Evals, model strategy, fine-tuning, cost/latency, observability, etc. |
| Explore tab (8 tools) | Embedding space, shadow A/B, tokenizer explorer, vector DB comparison |
| Fluency tab | Interview prep: drills, mock interview, flashcards, challenges |
| AIPM tab | PM track: PRD sim, roadmap, stakeholder, launch checklist |
| Career tab | Negotiation sim, system design interview, take-home challenges |
| 3D visualizations (4) | Embedding space, attention patterns, diffusion trajectory, LoRA decomposition |
| Ground Truth (83 posts) | Full library across all categories |
| TransformerWalkthrough | 10-step interactive transformer animation |
| RAG Lab tiers (Junior→Staff) | Tiered scoring to signal seniority readiness |
| Role toggle on Home | Engineers / PMs / All role filter |
| Progress page | Cross-tab visited state visualization |
| Fine-Tuning Lab | Interactive LoRA config simulator + 3D visualization |
| Eval Grader | Hands-on output grading tool |
| Flashcard mode | Spaced repetition with unknowns-only filter |
| Next-token + temperature games | Predict-the-next-token, temperature calibration quiz |
| Negotiation Sim | 3-scenario salary negotiation with equity math |
| Agent Design Challenge | Build-your-own agent architecture module |
| Content depth pass | Analogies, O(n²) explainer, postmortem panels, real cost numbers |
| 25-issue audit fix batch | Bug fixes, UX gaps, mobile overflow, consistency |
| Hash-based URL routing | Each tab has its own URL; back button works |
| Mobile SVG fixes | EmbeddingModule + AttentionModule responsive |
| Flashcard unknowns filter | Study only cards you got wrong |
| 5 new GT posts (production batch) | Agent evals, prompt caching, LLM security, vector DB selection, cost playbook |
| 15 mock interview Q&As | Expanded Career question pool |
| Crore notation in SalaryCalc | India context formatting |
| YouTube embed (Karpathy) | TransformerWalkthrough complement |
| What's New v5 | Signal for returning users |
| Score persistence | TimedDrills best-score per module in localStorage |
| Loading skeleton | Shimmer on Suspense instead of blank flash |
| Toast system | Feedback on copy, submit, completion actions |
| Streak counter | 🔥 daily visit tracking |
| Recently viewed (GT) | "Continue reading" row from localStorage |
| Code copy button (GT) | One-click clipboard copy on all code blocks |
| Mark as read (GT) | Per-post read checkbox with localStorage |
| Table of contents (GT) | Auto-generated from h2 blocks on long posts |
| Error boundaries | Catch component crashes without blank app |
| document.title per tab | Tab titles update on navigation |
| Certificate of completion | Canvas PNG download on group completion |
| Bookmarks | Star any GT post or module; Progress tab section |
| Daily tip (Home) | Rotating "Did you know?" by day-of-year |
| Learning path generator | Role + experience → 10-step ordered reading list |
| Difficulty chips (Concepts) | Beginner / Intermediate / Advanced on every module |
| "Go deeper" links (Flows) | Cross-links to matching Explore/Concepts/GT content |
| Agent evals tab (Systems) | Tool call precision, trajectory efficiency, graceful failure, reasoning hallucination |
| 2 new Agent scenarios | Planning Agent, Reflexion pattern |
| 3 new GT posts | RLHF/DPO, Constitutional AI, build a knowledge base search |
| Consultation Space (Ask tab) | Keyword search over all GT posts + modules, conversational UI |
| ELI5 mode (GT posts) | Simplified language toggle on every post |
| In-post search (GT) | Highlight matching text within a post |
| Post reactions (GT) | Saved me in an interview / Mind = blown / Confusing |
| Quiz me on this post (GT) | Auto-generates 3 MCQs from post callout+list blocks |
| Print styles (GT) | Clean PDF output via @media print |
| Copy section link (GT) | § anchor link on every h2 heading |
| Notification bell | Pulses when new content version detected |
| Analytics events | post_opened, module_completed, assessment_finished, search_query |
| PrepLab (new tab) | Assessment exam, Trainer mode, JD+resume prep |
| LLM comparison matrix (Explore) | 6 models × 12 dimensions, filterable |
| Prompt library (Playground) | 30 production-ready prompts with copy + design notes |
| Debug Traces (Systems) | 5 production traces, interactive diagnosis, root cause reveal |
| Helpful counter (GT) | 👍 per-post counter stored in localStorage |
| Difficulty badge (GT) | Beginner/Intermediate/Advanced on post cards |
| Service worker | Offline app shell, cache-first images |
| PWA manifest | Installable on mobile (Add to Home Screen) |
| RSS feed | `/rss.xml` with 20 most recent GT posts |
| 2 new Agent scenarios | Multi-agent debate, memory-enabled agent |
| Sitemap (140+ posts) | All GT posts indexed for Google |
| Mobile responsive pass | PrepLab + Fluency: responsive padding, score font scaling (text-7xl → text-5xl sm:text-7xl), sticky header px fix, JD gap table spacing |
| AI System Design Canvas (Systems) | Problem type selector (6 types) → failure modes, model tier, evals, latency/cost/context budget. Constraint toggles: cost-sensitive, high-stakes. RAG cross-links. |
| Framework Landscape (Agents) | LangChain / LangGraph / LangSmith / OpenAI Agents SDK / Google ADK — strengths, weaknesses, when-to-use. Decision Wizard: 3 questions → ranked recommendation. |
| Production RAG Flow (Flows) | Two animated pipelines: ingestion (Airflow → chunk → embed → vector DB → monitor) + query (embed → LangGraph → rerank → LLM → LangSmith). Production detail per stage. |
| LangSmith Lab (Systems) | Trace Anatomy (interactive span explorer), Feedback Loops (4 patterns with SDK code), Eval Dataset flywheel (4-step with API examples), Prompt Versioning (push/pull/rollback). |
| GT Series format | SERIES_META in GroundTruth.jsx: 5 series (RAG in Production, Agent Engineering, Eval & Testing, LLMOps, Case Studies). Series badge in PostDetail header (Part X of Y). Prev/next in-series nav at bottom of post. Series cards grid on GT main list. |
| 5 Production Case Study posts | Notion AI (block model chunking, delta ingestion, access control filtering), Perplexity (real-time RAG, citation grounding, model routing, streaming), Cursor (FIM, context assembly, codebase indexing, dual latency), GitHub Copilot (BM25 context, two-path architecture, behavioral quality metrics), Spotify AI (music2vec, DJ narration pipeline, multimodal embeddings, podcast transcription). All in "Production Case Studies" series. |
| Concept Dependency Graph (Home) | SVG-based interactive graph (DEP_NODES × 13, DEP_EDGES × 17). 5 columns: Foundations → Context → Flows → Labs → Advanced. Click to highlight prerequisites (amber) and dependents (emerald). Double-click navigates to tab. Inserted before MODULE MAP section in Home.jsx. |
| 5 Paper-to-Production posts | "Attention Is All You Need → production Transformers" (decoder-only, RoPE, Flash Attention, GQA), "InstructGPT → RLHF" (3-stage pipeline, DPO vs PPO, RLAIF), "RAG paper 2020 → production RAG" (Lewis et al. to modern decoupled architecture), "LoRA → production fine-tuning" (low-rank math, QLoRA, adapter merging), "Constitutional AI → production safety" (CAI pipeline, RLAIF, principles-based alignment). New "Paper → Production" series (pink, #ec4899) added to SERIES_META. |
| 5 Interview-Ready posts | "Design a RAG System" (scoping → architecture → failure modes → RAGAS eval), "Explain Attention" (intuition → QKV mechanism → multi-head → Flash Attention), "Evaluate an LLM System" (task decomposition → offline+online eval → hallucination detection flywheel), "How Do Agents Work" (ReAct loop → tool design → memory types → multi-agent patterns → failure modes), "Reduce LLM Costs by 50%" (5 levers: tokens, routing, caching, batching, self-hosting). New "Interview Ready" series (orange, #f97316) added to SERIES_META. |
| Reasoning Models Lab (Systems) | New SYSTEMS_MODULES entry (group: DESIGN). 4 tabs: "What Changed" (base LLM vs reasoning model comparison cards), "Thinking Budget" (range slider 0–4 → live quality/cost/TTFT display), "Use-Case Matcher" (8 task types with accuracy lift + reasoning), "Economics" (pricing table + cost-per-correct-answer analysis + escalation routing pattern). REASONING_TASKS and THINKING_LEVELS arrays. |
| MCP Deep Dive (Agents) | New AGENTS_MODULES entry (group: ECOSYSTEM). 4 tabs: "Architecture" (host/client/server diagram + transport), "4 Primitives" (Tools/Resources/Prompts/Sampling with examples), "Build a Server" (6-step Python SDK walkthrough + claude_desktop_config), "MCP vs. Function Calling" (7-dimension comparison table + decision guide). MCP_PRIMITIVES, MCP_ECOSYSTEM, MCP_VS_FUNCTIONS arrays. |
| GraphRAG Flow (Flows) | New FLOW_TABS entry. 2 tabs: "Pipeline Comparison" (5-stage pipeline from doc ingestion → entity extraction → KG build → query → generation), "Flat vs. GraphRAG" (6 query types where GraphRAG beats flat RAG, with complexity/accuracy tradeoff). GRAPHRAG_STAGES and GRAPHRAG_WINS arrays. |
| Voice AI Pipeline Flow (Flows) | New FLOW_TABS entry. 3 tabs: "Pipeline" (6 stages: Mic → VAD → STT → LLM → TTS → Speaker, each with latency, prod detail, failure mode), "Latency Budget" (target/max/optimization per stage), "Streaming Strategy" (barge-in implementation sketch + provider comparison table). VOICE_STAGES array. |
| Company Prep Tracks (PrepLab) | New mode card (amber). CompanyPrepMode component with 4 archetypes: Big Tech AI (Google/Meta/Amazon/Apple — infra, evals, scale), AI-native startups (Anthropic/OpenAI/Perplexity/Cursor — safety, agents, eval obsession), Indian Tech (Flipkart/Swiggy/Zepto — cost, latency, multilingual), Enterprise AI (McKinsey/Accenture/IBM — governance, RAG, compliance). Each archetype: topic-weighted 15-question drill + 4 company-specific system design prompts + must-know topics. |
| LLM Memory Architecture (Agents) | New AGENTS_MODULES entry (group: CORE). 3 tabs: "6 Memory Types" (In-Context, Episodic, Semantic, Procedural, Working, External/Structured — with persistence, scope, read/write detail), "Library Comparison" (LangMem/Mem0/MemGPT/Zep — 4 dimensions each), "Decision Wizard" (use-case × query-type → library recommendation). |
| 5 Reasoning at Inference Time posts | Series: "Reasoning at Inference Time" (cyan, #06b6d4). Posts: "What Changed" (base vs reasoning model, hidden scratchpad, TTFT/cost table), "Thinking Budget" (token tiers table, dynamic budget allocation pattern), "When to Use" (win/overkill lists + decision heuristic), "Economics" (cost-per-correct-answer metric, pricing table, escalation routing code), "Production Patterns" (5 patterns: routing, caching, streaming UX, structured output, graceful fallback). |
| 3 MCP Protocol posts | Series: "Model Context Protocol" (purple, #a855f7). Posts: "What It Is" (N×M → N+M integration problem, host/client/server arch, 4 primitives table, stdio vs SSE), "Build a Server" (full Python SDK walkthrough: list_tools → call_tool → list_resources → read_resource → stdio run → claude_desktop_config), "MCP vs. Function Calling" (7-dimension table, when-to-use decision guide). |
| Multimodal AI (Systems) | 4 tabs: Architecture (4-stage pipeline: image encoding → token projection → context assembly → autoregressive decoding), Model Landscape (GPT-4o/Claude 3.5/Gemini 1.5/Llama 3.2 — modalities, context, image token cost), Multimodal RAG (4 approaches: late fusion, CLIP retrieval, ColPali, captioning+text), Failure Modes (6: object counting, spatial reasoning, small text, hallucination, token overflow, chart misread). |
| Context Window Engineering (Systems) | 3 tabs: RAG vs Long Context (6-question interactive decision wizard → verdict), Lost in the Middle (recall-by-position bar chart + 4 mitigations), Compression Strategies (5 techniques: LLMLingua, selective context, RAG-as-compression, summary hierarchy, prompt caching — with compression ratios and quality tradeoffs). |
| Prompt Engineering Lab (Systems) | 3 tabs: Techniques (6 techniques with code: CoT, few-shot, XML structuring, self-consistency, negative examples, role priming — expandable with gain estimates), DSPy (automated prompt optimization — 4-step walkthrough: signature → module → metric → compile), Optimization Checklist (4-phase systematic process). |
| AI Red Teaming (Systems) | 4 tabs: Attack Taxonomy (6 attacks filterable by category: direct injection, indirect injection, roleplay jailbreak, many-shot, system prompt extraction, false context — with example attacks + defenses), Defense Patterns (4 layers: input guardrails, context isolation, output guardrails, structural defenses), Eval Methods (4 methods: manual, automated fuzzing, benchmarks, adversarial examples), Red Team Checklist (5-phase pre-launch checklist). |
| AI Deployment Architecture (Systems) | 3 tabs: Serving Stack (4 options: vLLM, TGI, Triton, managed APIs — with perf, deployment, when-to-use), Batching Strategies (4 types: static, dynamic, continuous, speculative decoding — with throughput/latency tradeoffs), Scaling Playbook (4 autoscaling metrics + 7-item deployment architecture checklist). |
| Agentic Reliability (Agents) | 4 tabs: Failure Taxonomy (6 failure modes: infinite loop, cascade failure, scope creep, tool confabulation, premature termination, hallucinated tool calls — each with detection signals + fixes), Reliability Patterns (6 patterns: step budget, idempotent tools, duplicate detection, rollback, context pruning, self-critique), Human-in-the-Loop (4 HITL patterns with code: confirmation gate, escalation threshold, checkpoint review, ambiguity surfacing), Production Checklist (5-phase: loop control, tool safety, HITL, state management, observability). |
| Embedding Space Explorer redesign (Explore) | Radial constellation layout: query always at center, 30 concept nodes in 6 sectors (RAG/arch/safety/ops/agents/multi) at scaled radii ~111/140/170px, animated rays from center to matched nodes, cosine similarity scores, sector labels, viewBox zoomed to "25 25 450 450". |
| GT Model Deep Dives series | 5 posts (rose, #f43f5e series): Claude (Constitutional AI, model family table, extended thinking, production strengths), GPT-4o (native multimodality, o1/o3 reasoning branch, vs-Claude comparison), Gemini (MoE architecture, 1M context use cases, where it leads/lags), Grok (real-time X data moat, Grok 3 benchmarks, when to use vs. managed APIs), Llama (open weights licensing, model family, self-host vs. API decision table). |
| Transformer Architecture visual (Systems) | 4-view SVG module: Full Architecture (encoder-decoder with cross-attention arrow), Self-Attention (CSS-animated arrows from Q to each K, weight-fill bars, Q/K/V explainer), Transformer Block (static SVG with residual connection paths, block diagram), Decoder-Only (causal mask triangle heatmap, KV cache callout, next-token prediction flow). Animation used only where it clarifies mechanism. |
| Structured Output Engineering (Systems) | 3 tabs: Strategies (4 methods with reliability bar: tool calling/10, JSON mode/9, Pydantic+Instructor/9, XML+regex/7 — expandable with code), Failure Modes (5 failure patterns: schema drift, nested failures, type coercion, markdown leakage, truncation), Production Checklist (3 phases: schema design, validation layer, error handling). |
| Synthetic Data Generation (Systems) | 3 tabs: Generation Methods (4 methods: self-instruct, persona-driven, LLM-as-judge filtering, evol-instruct — expandable with code), Quality Checklist (5 checks: deduplication, format consistency, factual verification, distribution coverage, held-out eval), Full Pipeline (8-step production pipeline from taxonomy to held-out eval). |
| Fine-Tuning Pipeline Flow (Flows) | New FLOW_TABS entry. 2 tabs: "Pipeline" (6 stages: raw data → synthetic aug → SFT → DPO → eval → merge/deploy, each with failure mode), "DPO vs RLHF" (comparison table + when to use GRPO for reasoning models). FT_STAGES array. |
| Computer Use Agents (Agents) | New AGENTS_MODULES entry (group: SCALE). 4 tabs: "Architectures" (Anthropic API/Operator/browser-use OSS/OmniParser), "Observe→Act Loop" (4 steps: Observe/Ground/Act/Verify), "Action Space" (5 categories: Mouse/Keyboard/Navigation/Observation/System), "Failure Modes" (6: coordinate drift, grounding hallucination, state divergence, infinite loop, scope creep, auth exposure). |
| Long-Running Workflows (Agents) | New AGENTS_MODULES entry (group: SCALE). 3 tabs: "Patterns" (4 patterns with expandable code: checkpoint/resume, Temporal durable execution, event-driven handoffs, task queue), "Tools" (5: Temporal/LangGraph/Celery/BullMQ/Step Functions), "Decision Framework". |
| 5 Production ML Ops GT posts | Series: "Production ML Ops" (lime, #84cc16). Posts: "DPO vs RLHF vs GRPO" (alignment method comparison, when to use each, GRPO for verifiable rewards), "Quantization Deep Dive" (GPTQ/AWQ/GGUF, GPU vs CPU inference, latency/quality table), "AI Governance in Production" (model cards, audit trails, drift detection, compliance), "Multimodal RAG in Production" (ColPali, late fusion, captioning approaches, failure modes), "Production Fine-Tuning Case Study" (end-to-end: data → SFT → DPO → eval → deploy, real numbers). |
| Fine-Tuning Pipeline Flow (Flows) | 2-tab flow: FT_STAGES × 6 (raw data → SFT → DPO → eval → deploy, each with failure mode), DPO vs RLHF comparison table. |
| Computer Use Agents (Agents) | 4 tabs: 4 architectures (Anthropic/Operator/browser-use/OmniParser), Observe→Act loop, action space × 5, 6 failure modes. |
| Long-Running Workflows (Agents) | 3 tabs: 4 patterns with code (checkpoint/resume, Temporal, event-driven, task queue), 5 tools, decision framework. |
| 5 Production ML Ops GT posts | "production-mlops" series (lime): DPO vs GRPO, quantization (GPTQ/AWQ/GGUF), AI governance, multimodal RAG, production fine-tuning case study. |
| Defense Doc (PrepLab) | New mode (rose 🛡). JD paste → 8-domain extraction → 5 tabs: Topic Priority Table, System Design Cheat Sheet, 8 Must-Know Concepts Cold, STAR story starters, Production Gotchas + interviewer questions. |
| Semantic Caching Explorer (Explore) | Threshold slider (0.70–0.99), 5 cached entries, 6 test queries, hit/miss animation, cost saved ($0.003/hit) + latency (420ms/hit), running stats. |
| Vibe Coding & Agentic Dev (Systems) | 3 tabs: What Changed (4 stat cards + patterns), Tool Landscape (Cursor/Windsurf/Copilot/Claude Code), Senior Lens (6 implications for senior engineers). |
| Embedding Space GT cross-links | All 30 EMB_POINTS have gtId fields. Matched nodes clickable → GT post. Results panel "Read →" links. onNavigate threaded through ExploreApp. |
| A2A Protocol (Agents) | 3 tabs: N×M→N+M visual + 4 concept cards (Agent Card/Task/Push/Transport), A2A vs MCP 7-row table, framework support matrix × 6 + decision guide. |
| KV Cache Engineering (Systems/BUILD) | 3 tabs: 4 concept cards (KV blocks/prefix caching/explicit markers/API matrix), 3-slider cost calculator, cache-aware routing (llm-d + EPLB). |
| AI Guardrails Engineering (Systems/OPS) | 3 tabs: dual-stage flow (5 input + 5 output checks), 6 provider cards (Bedrock/Azure/Lakera/NeMo/Patronus/Guardrails AI), 5-layer defense-in-depth reality check. |
| Traps Lab (Systems/OPS) | 8 find-the-flaw challenges: System Design × 2, LLM Code × 2, Evals × 2, Interview Critique × 2. 24 total issues. localStorage reveal tracking. |
| LLMOps Tool Comparison (Explore) | 5 tools × 6 dimensions score grid (filled dots), expandable per-tool cards, Decision Wizard with branching recommendation. Langfuse/Braintrust/Arize/LangSmith/Laminar. |
| Perspectives GT series (Explore) | 6 annotated thought leader posts (Karpathy, Simon Willison, swyx, Hamel Husain, Chollet, LeCun). Core thesis + essential reading table + what to question. Cyan series. |
| MoE Architecture (Systems/DESIGN) | 3 tabs: How MoE Works (router math + 3 mechanism cards), Production Models (5 models × 6 dimensions + serving considerations), Failure Modes (6 failures + EPLB + health metrics + decision guide). |
| World Models + MoE GT posts | "frontier" category. World models primer (JEPA, WAMs, video-as-simulator, agent planning implications). MoE guide (routing, DeepSeek-V3 architecture, production failure modes). |
| Speculative Decoding (Systems/BUILD) | Draft model + target model loop, acceptance sampling mechanics, speedup math, token acceptance probability slider by temperature, vLLM/TGI production notes. |
| Streaming Patterns (Systems/BUILD) | SSE vs WebSockets comparison, first-token latency vs throughput tradeoff, streaming structured output, back-pressure and buffering, latency waterfall visual with streaming vs batching toggle. |
| Embedding Model Selection (Explore) | MTEB score comparison table (Voyage AI/Cohere/OpenAI/BGE), Matryoshka Representation Learning, fine-tuning approaches (contrastive/triplet/hard negative mining), model × use-case selection wizard. fidelity: simplified. |
| Model Merging (Systems/DESIGN) | SLERP interactive slider (coding vs reasoning capability blend), 5-method comparison table (SLERP/TIES/DARE/Model Soup/LoRA Merge), 5-step workflow checklist, MergeKit CLI reference. |
| Data Flywheel GT series (3 posts) | "Closing the Loop" series: implicit feedback signals (thumbs/dwell/reformulation), reward modeling from logs (Bradley-Terry, DPO from preference logs), self-refreshing eval loop (online vs offline pipeline, dataset versioning, contamination). |
| Model Merging GT post (frontier) | SLERP/TIES/DARE/Model Soup/LoRA merge comparison + decision table + proxy task eval methodology + MergeKit walkthrough. |

---

## 5. What was deliberately excluded

### No live API calls

**Why:** API calls add cost, rate limits, key management, and backend requirements. Precomputed scenarios are more reliable pedagogical tools — a live API won't fail at exactly the right moment for a teaching scenario.

### No community features (forum, comments, Discord)

**Why:** Community requires moderation, cold start, and ongoing maintenance. At this stage it would be an empty room. Revisit after significant organic traction.

**Note on Giscus (GitHub Discussions comments):** Evaluated. Deferred because it requires GitHub repo config from the site owner and adds an external dependency. Good option when traction justifies it.

### No certification

**Why:** A certificate requires a credible assessment layer first. The PrepLab Assessment Mode exists now; the certificate layer is reserved for the paid tier after social proof is established. "Certified" language cheapens the brand without the credibility to back it.

### No light mode

**Evaluated:** CSS variable approach is clean in theory. In practice, all 13 JSX files use hardcoded Tailwind dark-theme classes. Refactoring every `zinc-900`, `zinc-800`, `bg-zinc-950` to CSS variables is a full-day cross-file refactor with high breakage risk. Deferred until there's user demand signal.

### No simulated discussions (back-and-forth scaling/deployment conversations)

**Why:** Back-and-forth that feels real requires dynamic responses to what the user said. A decision tree (3-4 levels deep) would feel rigid. Deferred until LLM backend exists.

### No React Router

**Why:** Hash routing solved the shareable URL problem with 20 lines. Full React Router refactor adds complexity for marginal gain at this scale.

---

## 6. Pending ideas (not yet built, ordered by priority)

### P1 — Defense Doc (highest priority new feature)

A personalized "interview brief" generated from a pasted JD. Content: Topic Priority Table (Core / Know Well / Be Aware Of), 8 must-know concepts cold, a system design cheat sheet tailored to the role, 3 behavioral STAR story prompts, production gotchas for the detected domain, questions to ask the interviewer, red flags to avoid.

Two delivery formats: (a) rendered as an interactive "war room" on the platform, (b) downloadable PDF via jsPDF client-side. No backend required.

**Why this is the strongest pending idea:** It's the one thing that doesn't exist anywhere else. A personalized study brief the morning of an interview is something people bookmark and return for. Clear paid tier hook: free = platform-only, paid = download PDF.

### P2 — Traps and Bug Catching

A challenge module that tests critical thinking rather than recall. Formats: "Here's a system diagram with 3 intentional flaws — find them," "Here's an eval framework, what's wrong with it?", "This Python function calls an LLM. What are the 2 bugs?", "A candidate said X. What's wrong with this approach?"

Maps directly to how senior interviews actually work — they give you broken things, not blank slates. Static challenge set, ~15-20 challenges, self-contained.

### P3 — Senior / Leadership Lens

A "Senior Lens" filter or callout layer on top of existing system design and eval modules. Shows how a Staff engineer would approach the same problem differently. Content additions: "At Staff level, the question isn't X — it's Y," "What you'd tell your manager after this incident," "How to prioritize across 3 competing AI initiatives."

No new modules needed — content additions to existing ones.

### P4 — Open-ended Take-homes (with rubric)

Long-form async challenges that simulate real take-home assignments. User writes a paragraph or structured answer, then reveals an expert model answer with a detailed rubric showing what a strong answer covers. 5-8 challenges. Already partially exists in Career — extend and formalize.

### P5 — Simulated Discussions (defer to LLM era)

Back-and-forth scaling/deployment/monitoring conversations. An interviewer responds dynamically to what you said. Decision-tree version is too rigid to be useful. Defer until LLM backend exists.

### P6 — Persistent Leaderboard (Vercel KV)

RAG Lab scores shared across users via Vercel KV Edge Config (free tier, 0ms latency). No dedicated backend needed. Adds social/competitive dimension. Feasible today but deferred — not enough users yet to make a leaderboard meaningful.

### P7 — Split groundTruthPosts.js

File is ~1.3MB in one chunk. Split into 5 category-based files with lazy imports. Reduces GT initial load chunk significantly. Low priority because the file is already in a lazy-loaded chunk (GroundTruth.jsx). Revisit when load time becomes measurable user pain.

### P8 — LLM integration (Consultation Space upgrade)

Current Ask tab uses keyword scoring. Upgrade path: Voyage AI embed-3 (free tier) for embeddings → cosine similarity retrieval → Claude API for generation. UI stays identical. Worth doing when the site has a clear audience and the cost is justifiable.

### P9 — Giscus comments on GT posts

GitHub Discussions-based comments. Zero backend, free, spam-resistant. Requires configuring the GitHub repo for Discussions. Good option once traction justifies it.

### P10 — More Ground Truth posts

Topics with no coverage yet: RLHF implementation walkthrough (detailed), Gemini architecture deep dive, "How I'd build X" series (AI search, code review bot, real-time document analysis), multi-agent debugging patterns, speculative decoding mechanics, KV cache engineering, A2A protocol, world models primer.

### P11 — LLM Memory Architecture deep-dive module (Agents tab) ✓ DONE

### P12 — Voice AI agent flow (Flows tab) ✓ DONE

### P13 — "Build This" module (new Systems or standalone tab) ✓ DONE

### P14 — Incident Room expansion (Systems tab) ✓ DONE

### P15 — Company prep tracks in PrepLab ✓ DONE

### P16 — A2A Protocol module (Agents tab) ✓ DONE
### P17 — Semantic Caching Explorer (Explore tab) ✓ DONE
### P18 — KV Cache Engineering (Systems tab) ✓ DONE
### P19 — AI Guardrails Engineering (Systems tab) ✓ DONE
### P20 — Vibe Coding & Agentic Development (Systems tab) ✓ DONE
### P21 — LLMOps Tool Comparison (Explore tab) ✓ DONE
### P22 — Thought Leader Reading Room (GT Perspectives series) ✓ DONE
### P23 — World Models primer (GT post) ✓ DONE
### P24 — MoE Architecture (Systems module) ✓ DONE
### P25 — Defense Doc (PrepLab mode) ✓ DONE
### P26 — Traps Lab / Bug Catching (Systems/OPS module, 8 challenges) ✓ DONE

### P27 — Open-ended Take-homes (Career/PrepLab) ✓ DONE

Formalize the 5–8 long-form async challenges that exist informally in Career.jsx. Each challenge: a realistic scenario (design a RAG system, build an eval harness, debug this incident), the user writes a free-form answer, then reveals an expert model answer with a rubric showing what strong answers cover. Extend the Career "Take-Home Challenges" section with structure and scoring.

### P28 — PrepLab question bank expansion

All modules added since the last question bank pass (A2A, KV Cache, Guardrails, MoE, Vibe Coding, LLMOps, Traps Lab) have zero PrepLab questions. Add 3–5 questions per module = ~35 new questions targeting the production-engineering concepts.

### P29 — "How I'd Build X" GT series

3–5 posts in "How I'd Build X" format: (1) AI Search (query understanding, retrieval, ranking, freshness), (2) Code Review Bot (AST parsing, diff retrieval, explanation generation, false positive tuning), (3) Real-time Document Q&A (streaming ingestion, delta chunking, access control filtering), (4) Customer Support AI (intent routing, escalation triggers, tone compliance, hallucination guardrails). Opinionated, first-person, production-decision-heavy.

### P30 — Speculative Decoding deep-dive (Systems) ✓ DONE

Speculative decoding is now production infrastructure (vLLM, TGI both ship it). A Systems module covering: draft model + target model loop, acceptance sampling mechanics, speedup math (draft acceptance rate × draft model speed), QuantSpec (quantized KV cache for speculative), P-EAGLE (parallel speculative decoding). Interactive: show draft token acceptance probability for different temperature settings.

### P31 — A2A Protocol GT companion post

The A2A Protocol Agents module needs a GT post companion. 8-min read covering: the N×M problem, Agent Card format, Task lifecycle, push notifications, transport layer, current framework adoption (CrewAI ✓, OpenAgents ✓, LangGraph 🔄, AutoGen 🔄), and how A2A + MCP compose into a full agent integration architecture.

### P32 — Embedding Model Selection (Explore or Systems module) ✓ DONE

Gap: app teaches what embeddings are and how retrieval works, but never helps engineers pick the right embedding model. Cover: Voyage AI vs Cohere Embed vs OpenAI text-embedding-3 vs BGE — benchmark dimensions (MTEB score, dimensionality, max tokens, cost, latency). Matryoshka Representation Learning (truncate dimensions for speed). Fine-tuning embedding models (contrastive loss, triplet loss, hard negative mining). Interactive: model × use-case selection wizard. High job-relevance — this comes up in every RAG system design interview.

### P33 — Streaming & Real-time Production Patterns (Systems/DESIGN) ✓ DONE

Gap: streaming is universally deployed but the app has no treatment of it. Cover: SSE vs WebSockets for LLM streaming, first-token latency vs throughput tradeoff, streaming structured output (partial JSON validation), barge-in and interruption handling in voice, streaming tool calls (partial tool arguments), back-pressure and client-side buffering. Interactive: latency waterfall diagram with configurable streaming vs batching. Highly practical — every production LLM app does streaming.

### P34 — Data Flywheel from Production (Systems or GT series) ✓ DONE

Gap: feedback loops from live traffic are the compounding advantage nobody talks about in early-career resources. Cover: implicit feedback signals (thumbs, dwell time, reformulation rate), reward modeling from logs (Bradley-Terry, DPO from preference logs), online vs offline evaluation pipelines, the "shadow mode" deployment pattern for collecting ground truth, dataset versioning and contamination. GT series: "Closing the Loop — Building Self-Improving AI Systems." This is senior-level knowledge that differentiates candidates.

### P35 — Constrained / Grammar-Based Generation (Systems/BUILD)

Gap: structured output at the API level (json_mode, function calling) is covered implicitly, but below-API structured generation isn't. Cover: Outlines / llama.cpp grammar — GBNF grammars, context-free grammar → logit masking, speed overhead vs reliability gain. Guidance (Microsoft) — control flow inside the LLM generation loop. Use cases: guaranteed schema adherence for tool-call parsers, form extraction, SQL generation. Interactive: grammar editor → watch token probability collapse on invalid continuations. Useful for inference engineers and ML platform folks.

### P36 — Model Merging (Systems/DESIGN or GT post) ✓ DONE

Gap: model merging went mainstream in 2025 (Mistral, community models on HuggingFace are routinely merged). Cover: SLERP (spherical linear interpolation in weight space), TIES merging (task vector interference resolution), model soup (average of fine-tuned checkpoints), LoRA adapter merging (linear combination in adapter space), DARE (drop and rescale). Trade-offs: merged models often beat fine-tuned models at zero marginal training cost. Practical: how to pick merge ratios without running full evals (proxy tasks). Medium complexity to build — GT post + small Systems module.

---

## 7. Commercial strategy conclusion

GenAI Systems Lab is positioned as a **free credibility and audience-building artifact** with a clear paid tier path.

**Current monetization readiness: ~7/10.** Gaps that remain:
1. No real testimonials (placeholder structure exists, needs real quotes)
2. Certificate layer not yet deployed as paid feature
3. No outcome claim validation (need users to report interview results)

**The right monetization path:**

Stage 1 (now — month 6): Free distribution. Build audience, collect testimonials, watch which modules users finish. PrepLab + Consultation Space are the new engagement hooks.

Stage 2 (month 6–12): Deploy Defense Doc as a premium feature. Add Certificate layer. Score the AI Systems Readiness Assessment and surface it as a product. Charge $29 one-time for Defense Doc PDF download + Certificate.

Stage 3 (month 12–24): Team/org pricing for prep cohorts. Custom Defense Doc generation with LLM backend. Price point: $49 individual, $199 team (5 users).

**What not to do:** Don't call it "certified." Don't make job outcome claims. Make the assessment hard enough that ~50% fail on first attempt — the difficulty is the credibility.

---

## 8. Current state (as of May 2026)

**Scale:**
- 13 tabs
- 126+ interactive modules
- 169+ Ground Truth posts across 21 categories (new: frontier, perspectives series, data flywheel series, model merging post)
- 57-question PrepLab question bank (needs update for new modules)
- 5 RAG Lab production failure scenarios
- 30 prompt library entries
- 5 debug trace challenges
- PWA installable, offline service worker, RSS feed, sitemap with 140+ URLs
- Agents tab: 10 modules (added A2A Protocol)
- Systems tab: 36+ modules (added KV Cache, Guardrails, Traps Lab, MoE, Speculative Decoding, Streaming, Embedding Models, Model Merging)
- Explore tab: 14 tools (added Semantic Caching, LLMOps Comparison, Embedding Model Selector)
- PrepLab: 5 modes (added Defense Doc)

**Architecture status:**
- Zero backend ✓
- Hash-based URL routing ✓
- localStorage for all persistence ✓
- Lazy loading all heavy tabs ✓
- Error boundaries on all tabs ✓
- PWA manifest + service worker ✓
- Mobile responsive: Home, RAG Lab, Flows, Concepts ✓ — PrepLab + Fluency fixed ✓ — Agents/Systems/Consultation (max-w-3xl px-4, already safe) ✓
- Formspree email capture (⚠️ ID still needs replacement by owner)

**What's explicitly not on the roadmap right now:**
- New tabs beyond PrepLab and Ask
- AI Compass / broader portal scope
- Video content
- Community moderation
- API integrations (except as Consultation Space upgrade)

---

## 9. What makes this defensible

**You have to make decisions, not watch decisions being made.** Every other resource shows you what to do. The RAG Lab makes you configure the system and watch it fail. That pedagogical difference is the moat.

**The production failure case library as a proprietary dataset.** 5 curated RAG failure scenarios + 5 debug traces + 24 RCA cases + 22 metrics cases + 10 business cases — structured interactive diagnosis that YouTube can't replicate and DeepLearning.AI won't touch because it's too niche.

**150+ posts with production depth and citations.** The largest free resource specifically covering production GenAI systems — not introductory ML, not research papers, but the specific knowledge needed to build and operate real AI systems at scale.

**PrepLab as the differentiated assessment layer.** JD-aware question weighting + speech input + gap analysis is not available anywhere else for free, for this specific audience.

The positioning: *"The only place you practice diagnosing production GenAI failures before your first on-call shift."*

---

**Latest additions (session — May 21–22 2026):**
- Fix: duplicate ScoreDots renamed to LLMOpsScoreDots (Vercel build fix)
- Systems.jsx: MoEArchitecture module (3 tabs: routing mechanics + math, 5-model comparison, 6 failure modes + EPLB + decision guide)
- groundTruthIndex.js + groundTruthPosts.js: 2 new "frontier" category posts (world-models-primer, moe-architecture-guide)
- DECISIONS.md: full lineage update — 15 new lineage entries, P27–P31 pending ideas added, scale numbers updated

**Notable 2026 AI landscape shifts (research pass May 21 2026):**
- Andrej Karpathy joined Anthropic (May 19, 2026) — pre-training team
- vLLM ships Semantic Router as first-class feature (Iris release, Jan 2026) — semantic caching, safety, memory, retrieval routing
- A2A (Agent-to-Agent) protocol by Google ADK — inter-agent communication standard; CrewAI/OpenAgents adopted, LangGraph/AutoGen not yet
- Langfuse acquired by Clickhouse (Jan 2026), remains MIT/open-source
- Cursor crossed $2B ARR in 24 months — "vibe coding" now mainstream (Collins Word of the Year 2025)
- 60% of new code written in 2026 is AI-generated (per multiple surveys)
- Hallucination rates 3–8× lower than 2024 baselines but still 4–19% range across frontier models
- World models: 2026 declared breakthrough year; World Action Models (WAMs) unify state prediction + action generation
- LLM inference costs dropped 10–100× over 2 years; 2026 called "Year of AI Inference"
- KV cache-aware routing (llm-d) and EPLB (Expert-Level Load Balancing for MoE) now production infrastructure

*Last updated: May 2026*
*Maintained by: Sidharth Kriplani*
