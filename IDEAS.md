# IDEAS — Future Depth & Improvements

Prioritized backlog of ideas not yet built. Organized by effort and impact. Updated after each build session.

*Last updated: May 2026 | Current scale: 57 Systems modules, 25 Explore, 261 PrepLab questions, 222 GT posts*

---

## 💰 Business Model — Decision Pending (May 2026)

This is the single most consequential open decision. Everything below is affected by which path is chosen.

### Recommended: Freemium with PrepLab as the paid gate

**Free tier** (acquisition funnel — keep everything free):
- All interactive modules (RAG Lab, Agent Lab, Eval Lab, LLM Lab, Concepts, Playground, Explore, Systems, Agents)
- All 222 Ground Truth posts
- Basic PrepLab (limited questions per day, no JD Prep)

**Paid tier** ($15/month or $99/year — the "get hired" layer):
- Unlimited PrepLab
- JD Prep mode — paste a job description, get a targeted question drill weighted to the gaps
- Personalized gap analysis + "study these next" recommendations
- Learning path tracking with milestone badges
- Certificate of completion per learning path (verifiable)

**Why PrepLab is the right gate:** People will pay for things that directly help them get hired. The JD Prep mode targets a specific high-intent moment — someone with an interview in 2 weeks. That person pays $99 without hesitation. The free modules build trust; PrepLab converts it.

**Why not B2B:** Requires sales. Solo builder. Wrong stage.

**Why not cohorts:** Requires facilitation. Wrong stage. Could be Tier 2 once product-market fit is confirmed.

**Auth approach when ready:** Supabase Auth or Firebase Auth — both work on static sites with no custom backend. Google OAuth, one JS import, free tier. Progress syncs to a real DB instead of localStorage. Not a massive lift (~1 weekend). Unlocks cross-device sync, persistent progress, future gating.

**Internal pay gate markers:** Add `gated: true` flag to each PrepLab question and JD Prep mode in the data. Invisible to users. When Stripe is ready, wire the gate — the flag is already there. No UI change needed now.

**The blocker for actual gating:** Stripe + Supabase Auth. Not a blocker for building toward it. Current state: everything stays free, markers get added, auth comes in a focused sprint when the decision is made.

### "Take my money" experience sprint — separate from monetization

This is about the **feel, look, and emotional resonance** of the product — independent of business model mechanics. The content already earns "take my money." The surface needs to catch up.

What "take my money" products have that this doesn't yet:
- **A personality** — Linear, Raycast, Vercel don't just look clean, they feel like they were made by someone obsessed. Every micro-detail signals care.
- **An emotional entry point** — the first 10 seconds make you feel something. Currently the product is informative. It needs to be magnetic.
- **Progression that feels earned** — visible sense of "I am becoming something here." Not localStorage streaks, but real milestones that mean something.
- **Micro-details** — hover states, transitions, the finishing touches that make you feel the product was *completed*, not just built.
- **A point of view** — "This is not a tutorial platform. This is a production-failure simulator." That should hit you in the first 5 seconds.

Sprint items (in order of impact):
1. **Hero/entry experience** — the first screen needs to be magnetic, not informative. One strong emotional hook, one clear action.
2. **Lab entry screens** — each lab's landing should tell you what you'll be able to DO after, not what the lab contains.
3. **Module endings** — ✓ done card with one PrepLab question and one GT post link. The learn loop must close.
4. **Micro-interactions** — hover lifts, transition polish, the "someone cared about this" details throughout.
5. **Progression visibility** — make streaks, milestones, and progress feel real and earned on screen.

---

## 🔨 In Progress

Items actively being built in the current or most recent session. Move here when you start, move to Tier 1 (struck through) when done.

**UI Polish Sprint (May 2026)** — premium UI pass in progress. Completed: Inter font, hero glow + gradient headline, door cards with full gradients/shadows, stats with gradient text, testimonials with colored borders, RAG Lab sidebar/config/results, GT browser cards + header + filter pills, Systems/Agents right-panel breathing room, GT reading experience (body 15px/1.8lh, h2/h3 upgraded, quote border uses post color).

## 🎯 Next Polish Items (do in order)

- **Consistent module headers** (Tier 1) — every module in modules.jsx renders its own ad-hoc title block. Need a standard: title, group tag, difficulty badge, estimated time. Build a `ModuleHeader` component in modules.jsx, apply to top 10 most-visited modules first.
- **Explore tab module cards** (Tier 1) — 23 modules in a flat grid. Apply same card treatment as Home door cards: colored top border by group, hover lift, gradient bg. Change is in Explore.jsx.
- **PrepLab question experience** (Tier 1) — question card, correct/wrong states, progress indicator all functional but visually flat. The moment of answering should feel satisfying — green flash for correct, explanation card with depth, progress bar that feels earned.
- **Loading/skeleton states** (Tier 2) — Suspense fallback is four gray divs. Build a skeleton that matches the sidebar+content layout.
- **Series cards depth in GT** (Tier 2) — series cards already have top accent line but background is flat. Apply same gradient card treatment.
- **Mobile bottom nav tray content** (Tier 2) — the slide-up tray shows a 2-col grid of tabs but items have no visual hierarchy. Apply group-color treatment.
- **RAG Lab HowTo block** (Tier 3) — the HowTo component at the top of RAG Lab is informational text. Could be replaced with a more visual onboarding strip (numbered steps with icons) that collapses after first visit.

---

## Curriculum-Inspired Tracks (Idea Dump)

Topics and structures borrowed from major AI curricula — not built yet, just captured for reference. These are content ideas that complement existing modules rather than replace them.

### Stanford CS336 / CS324 (LLMs) — topics we can deepen
- **Pretraining data pipelines** — Common Crawl filtering, deduplication, tokenizer training. CS336 covers this at implementation depth; we have nothing equivalent.
- **Training at scale** — Gradient accumulation, mixed-precision (bf16/fp16), distributed training (DDP vs FSDP vs pipeline parallelism). Currently missing entirely.
- **Scaling laws** — Chinchilla compute-optimal curves, how to pick model size vs. token budget. One of the most practically useful things to know.
- **RLHF implementation depth** — We have the concept; CS336 goes into reward modelling, KL divergence penalty, online vs offline RLHF variants.
- **Benchmark design** — MMLU, HellaSwag, BIG-Bench. How they work, why they fail, how to read them critically.

### Stanford CS229 / Coursera ML Specialization — foundations we skip
- **Bias-variance tradeoff in LLM context** — How this classic ML concept maps to prompting, few-shot, fine-tuning decisions.
- **Cross-validation for LLM evals** — How to split train/test/eval properly when data is expensive.
- **Regularization analogs** — Dropout in transformers, weight decay, early stopping. Useful for fine-tuning modules.

### DeepLearning.AI Specializations — practical gaps
- **MLOps for LLMs** — CI/CD for model changes, staging environments, canary deploys. Beyond our current observability module.
- **Deployment patterns** — Blue-green for models, shadow mode testing, feature flags for model versions. High-frequency production decision.
- **Data flywheel** — How to systematically collect user feedback to improve models over time. The product loop most teams skip.
- **LangChain / LlamaIndex** — We deliberately stay framework-agnostic, but a "framework comparison" Explore module could be valuable.

### fast.ai approach — intuition first
- **Build before theory** — fast.ai starts with a working model then explains why. We could add a "build a tiny RAG in 20 lines" module that front-loads hands-on before any theory.
- **Practical fine-tuning** — fast.ai covers learning rate finders, gradual unfreezing. These translate directly to LoRA fine-tuning decisions.

### Missing from all curricula (our unique angle)
- **Production incident retrospectives** — What Stanford/Coursera don't teach: how real systems fail at 2am and what the postmortem looks like. Our Incident Room is the seed of this.
- **The PM × Engineer handoff** — No curriculum covers how to write specs that engineers can actually build, or how to challenge estimates. Our AIPM track is the only thing like it.
- **Cost as a first-class concern** — Academic curricula ignore inference cost, token budgets, and batch vs. realtime tradeoffs entirely. We already cover this; it's a differentiator.

---

## Tier 1 — High Impact, Buildable Now

### CRITICAL — Audit 28: Lab Quality Gap (May 2026) — the 30% that stops this being million-dollar

Full audit of Agent Lab (16), Eval Lab (18), LLM Lab (9) against RAG Lab standard. Only 3/16 Agent Lab modules, 2/9 LLM Lab modules, and 9/18 Eval Lab modules meet the configure→fail→diagnose standard. The rest are reference content or interactive calculators without a failure arc.

**Tier A — small lift, high ROI (add failure arc to existing decision engine):** ✅ *All done sprint 7*

- ~~**`serving` (LLM Lab): connect configurator to failure scenarios inline**~~ ✅ *Full scenario card with root cause + fix chips, type→id lookup into SERVING_FAILURE_SCENARIOS.*
- ~~**`decoding` (LLM Lab): add 3 failure scenarios**~~ ✅ *Reactive failure callout: repetition collapse T≤0.15, token incoherence T≥1.5, vocabulary starvation topP≤0.2.*
- ~~**`agentcfg` (Agent Lab): add to AGENTS_RELATED_GT + PrepLab forward pointer**~~ ✅ *Done.*
- ~~**`simulator` + `design` (Agent Lab): add PrepLab forward pointer at results screen**~~ ✅ *Done.*

**Tier B — medium lift (convert reference to decision engine):** ✅ *All done sprint 7*

- ~~**`failures` (Agent Lab): merge into `agentcfg` as additional trigger scenarios**~~ ✅ *3 new trigger-based entries added: cascading_errors, over_delegation, tool_poisoning.*
- ~~**`moe` (LLM Lab): add expert utilization simulator**~~ ✅ *MoEExpertSimulator: experts/topK/batch config → load bar chart → collapse/imbalance callout.*
- ~~**`langsmith` (Eval Lab): rebuild as broken-trace diagnosis**~~ ✅ *LangSmithDiagnose: 5 broken trace scenarios, span inspection, correct/wrong scoring, diagnosis reveal.*

**Tier C — cut (free nav space, reduce quality dilution):** ✅ *All done sprint 7*

- ~~**Cut `deploy` (Eval Lab)**~~ ✅ *Removed from SYSTEMS_MODULES registry.*
- ~~**Cut or merge `abtesting-ai` (Eval Lab)**~~ ✅ *Removed from SYSTEMS_MODULES registry.*
- ~~**Cut `buildthis` (Eval Lab)**~~ ✅ *Removed from SYSTEMS_MODULES registry.*
- ~~**Slim `quantization` (LLM Lab)**~~ ✅ *Methods table tab cut, Calculator only remains.*

### CRITICAL — From Audits 26 & 27 (May 2026, never-before-run MVP/Moat audits)

These are the highest-ROI moves identified in the first-ever MVP/Weight + IP/Moat audit. They don't add new content — they make existing content work harder.

- **Module endings: forward pointer** — Every module (Systems 57, Explore 25, Concepts 15, Playground 8) ends silently. Add a minimal ✓ done card at each module end with: one PrepLab question on this topic (by id), one GT post link (the most relevant). The RELATED_GT infrastructure already exists — the ending just needs to use it. This is the single highest-dropout moment in the product. *Flagged in Audits 14, 20, 26, 27 — still open. Zero new infrastructure required.*

- **Reference tables → decision engines** — 10-15 modules in Systems and Explore are comparison tables without user input. Per DECISIONS.md Section 4, these don't meet the interactive decision engine standard. Each should either: (a) add a configuration input + logic-derived outcome, or (b) move to a GT post. Start with the 5 lowest-effort conversions. *Audit 27 Finding 1.*

- **Social proof overhaul** — 3 unnamed testimonials from "ML Engineer · fintech startup" are unconvincing. Replace with: (a) real LinkedIn screenshots with likes/comments as proof of resonance, (b) GitHub star count if significant, (c) named quotes with handles from real users. *Audit 27 Finding 2.*

- **Stat sync** — Home.jsx door copy says "259+" PrepLab questions. Actual: 261. GT posts: 222. Systems: 57. Run a stat sync across Home.jsx, index.html, README.md. *Audit 25 Finding 2.*

- **Thin GT posts expansion** — `dpo-in-practice` (4 blocks), `llm-observability` (5 blocks), `instruction-tuning-datasets` (5 blocks). These are stubs, not posts. Each needs minimum 8 blocks, 1 callout, 1 refs section. *Audit 17 Finding 5, Audit 27 Finding 3.*

### Systems modules (new)
- ~~**GRPO / Agent RL Training**~~ ✅ *built May 2026*
- ~~**Evaluation Metrics Deep-Dive**~~ ✅ *built May 2026 — RAGAS, LLM-as-Judge tab, hallucination example*
- ~~**Long Context Patterns**~~ ✅ *built May 2026 — needle-in-haystack viz, map-reduce, chunk-summarise, model limits table*
- ~~**Vector Database Engineering**~~ ✅ *built May 2026 — pgvector/Chroma/Pinecone/Weaviate/Qdrant comparison, HNSW/IVF index guide, hybrid search, decision wizard*
- ~~**Prompt Injection Defense**~~ ✅ *built May 2026 — 5 attack patterns, 5 defense layers, hardening checklist*
- ~~**Agent Memory Architecture**~~ ✅ *built May 2026 — 4 memory types, failure demos, production stack, decision layer*
- ~~**AI Safety Engineering**~~ ✅ *built May 2026 — 6 attack patterns, 5 defense layers, hardening checklist*
- ~~**MCP vs API vs Function Calling**~~ ✅ *built May 2026 — N×M problem, 5 decision scenarios, context window tax, comparison table*
- ~~**A/B Testing for AI Systems**~~ ✅ *built May 2026 — 5 strategies, why classic breaks, decision guide*
- ~~**Query Refinement Lab**~~ ✅ *built May 2026 — 5 strategies, scenario lab, when-to-use guide*
- ~~**Prompt Change Management**~~ ✅ *built May 2026 — version/score/rollback lab, CI/CD workflow, serving patterns*
- **Agent Context Architecture** — Configure which layers your agent uses (persistent memory / skill injection / delegation / hooks), see cost/failure mode changes. *Pending — from ADK patterns cluster.*

### Systems modules (depth improvements)
- ~~**Evals Lab**~~ ✅ *built May 2026 — Build Your Eval 4-step wizard, generates judge prompts, implementation checklist*
- **Context Compaction** — Add live compaction simulator: user adjusts conversation length, sees token count, triggers compaction, sees output quality change. *Pending.*
- **Agent Architecture** — Add multi-agent orchestration interactive (orchestrator dispatches to workers, see the message flow). Currently only single-agent. *Pending.*

### Cosine similarity + vector normalisation fundamentals (small cluster — from Nishit Jain interview post, May 2026)

An AI interviewer found that candidates who claimed to have built 2-3 RAG systems couldn't explain cosine similarity pictorially — no cos θ, no angle, no vector multiplication. The lab covers RAG failure modes deeply but not the mathematical foundation of WHY similarity search works. This is a real gap: someone can follow a RAG tutorial without understanding what cosine similarity is doing or why normalisation matters.

- ~~**PrepLab questions (3–4)**~~ ✅ *built May 2026 — cos-1, cos-2, cos-3*
- ~~**Explore module: "Cosine Similarity — The Geometry of Retrieval"**~~ ✅ *built May 2026 — id: cosine in Explore*

### Explore modules
- ~~**Model Architecture Comparison**~~ ✅ *built May 2026 — architecture guide + use-case wizard*
- ~~**Tokenizer Comparison**~~ ✅ *built May 2026 — BPE/WordPiece/SentencePiece/tiktoken guide + live demo + cost calculator*
- ~~**Hardware Reference**~~ ✅ *built May 2026 — GPU comparison table + VRAM calculator*
- ~~**Cosine Similarity**~~ ✅ *built May 2026 — drag-vectors interactive*
- ~~**Explore grouping**~~ ✅ *built May 2026 — DESIGN/BUILD/OPS sections with border-l active state*

### PrepLab
- ~~**Questions for uncovered modules**~~ ✅ *built May 2026 — 15 questions: pid-1–5, ama-1–4, lcp-1–3, tok-1–3*
- **Scenario-type questions** — Multi-turn conversational scenarios where the user debugs a failing system across 3-4 exchanges. Higher fidelity than MCQ. *Pending.*
- **More system design text questions** — Cover: vector DB selection, agent reliability, eval harness design, fine-tuning decision framework. *Pending.*

### Agent Development Kit patterns (new cluster — from LuMay AI diagram, May 2026)

The 5-layer framework (CLAUDE.md → Skills → Hooks → Subagents → Plugins) surfaces production patterns the lab doesn't teach as named concepts. The underlying ideas are tool-agnostic and interview-relevant.

- ~~**GT post: "The Agent Memory Layer"**~~ ✅ *built May 2026 — id: claudemd-as-architecture*
- ~~**GT post: "Deterministic Guardrails: Hooks vs LLM-Based Safety"**~~ ✅ *built May 2026 — id: hooks-vs-llm-safety*
- ~~**GT post: "Context Isolation in Multi-Agent Systems"**~~ ✅ *built May 2026 — id: context-isolation-multiagent*
- ~~**Systems module: "Agent Context Architecture"**~~ → listed under Systems modules above as pending.

### AI PM career track (new cluster — from real user persona signal, May 2026)

A LinkedIn post from an AI PM aspirant breaking into Anthropic/Google/OpenAI surfaced specific content the lab is missing. The framing: "learning LLMs/RAG/prompt engineering — not to become an engineer, but to be a PM who engineers respect." This is the exact positioning the lab's AIPM track should own but currently doesn't state explicitly.

- **GT post: "What AI PM Actually Requires at Anthropic, Google, and OpenAI"** — demystify the role: what's in the JD vs what actually gets you hired, the technical bar vs PM bar distinction, what "technical enough" means at each company tier. High search intent, no good resource exists for this.
- **GT post: "The Technical Credibility Playbook for AI PMs"** — the minimum viable technical depth to earn engineer trust: what to learn (LLMs, RAG, evals), what to skip, how to ask questions in technical reviews without losing credibility. Framed for PMs, not engineers.
- **GT post: "Breaking Into AI PM: What the Job Actually Requires vs What People Think"** — common misconceptions (you need to code, you need an ML degree), what actually matters (product instincts + ability to navigate ambiguity in a fast-moving technical domain), and a realistic 6-month ramp plan. High shareability.
- **AIPM module: "What Gets You Hired at an AI-First Company"** — interactive self-assessment across: technical depth, product instincts, domain knowledge, communication, portfolio. With honest gap analysis and "study this next" output. Different from PrepLab — more directional, less exam-like.

### Type A vs Type B AI Engineer framing (new cluster — from viral post, May 2026)

A widely-shared post articulates the split between model-obsessed engineers (Type A: papers, benchmarks, loss functions) and systems-obsessed engineers (Type B: failure modes, latency, cost, monitoring). Key claims: Type B earns ~2x more ($400K+ vs $200K), enterprises are now scrambling for Type B after hiring Type A, and Type B thinking makes you better at model work too. This directly validates the lab's core thesis and surfaces specific content gaps.

- ~~**GT post: "Type A vs Type B AI Engineers — and Why the Gap Is Widening"**~~ ✅ *built May 2026 — id: type-a-vs-type-b-engineers*
- **GT post: "Graceful Degradation: The System Design Pattern Most AI Teams Skip"** — specific Type B skill mentioned in the post. How to design AI systems that fail safely: fallback chains, confidence thresholds, silent failure detection, partial results vs hard errors. Production examples.
- **GT post: "Monitoring That Predicts Problems, Not Reports Them"** — the exact phrase from the post. Proactive vs reactive observability for LLM systems: drift detection, latency trend alerts, hallucination rate canaries, cost spike prediction. The distinction between dashboards and early warning systems.
- **Home page positioning tweak** — the lab's tagline ("configure the system and watch it fail") already signals Type B thinking. Could make this explicit: a one-line callout "This lab builds Type B thinking" near the hero. Low effort, high resonance with the target audience.
- **Career module: "Are You Type A or Type B? A Self-Assessment"** — interactive quiz across 10 dimensions (latency thinking, failure mode instinct, cost awareness, monitoring design, etc.). Shows where you are, where the market is, and which lab modules close the gap.

### DS → AI Engineer market shift (new cluster — from practitioner analysis post, May 2026)

A practitioner traced the full arc: DS peak during COVID → 90% demand drop + role fragmentation (MLE, DE, Analytics Engineer) → ChatGPT reset (0 to 10K+ GenAI listings in a year) → agentic surge (10,854% listing growth, 90K US postings). Core thesis: "what masses upskill into next depends on how much pressure a tech balance sheet can take." These numbers are real and the narrative is lived experience for most lab users. The lab has zero content contextualizing why the AI Engineer role exists structurally.

- ~~**GT post: "How Data Scientist Became AI Engineer"**~~ ✅ *built May 2026 — id: ds-to-ai-engineer*: DS peak, fragmentation into MLE/DE/Analytics Engineer, ChatGPT as demand reset, agentic surge. Why understanding this history makes you better at predicting what to learn next. High resonance for anyone mid-career who lived this shift.
- **GT post: "Role Fragmentation in AI: What DS Split Into and What Each Piece Pays"** — the structural split: what Analytics Engineer, ML Engineer, Data Engineer each own now, how compensation diverged, and where the generalist DS role still survives (and where it doesn't). Practical career navigation content.
- **GT post: "The Next Fragmentation: What 'AI Engineer' Will Split Into by 2027"** — apply the same analytical lens forward. Inference Engineer, Eval Engineer, Agent Reliability Engineer emerging as distinct titles. Which specializations will command premium and which will commoditize. Opinion piece with data.
- **Career module update: "Your Path: DS → MLOps → AI Engineer → What's Next"** — a career trajectory visualization showing the historical path and the current fork points. Interactive: user marks where they are, sees which Systems/Concepts modules close the gap to where they want to go.

~~**Positioning opportunity:** Home page Layer 3 badge added.~~ ✅ *built May 2026 — "Layer 3 · RAG · evals · vector DBs · observability · agent architecture — the scarce skills, not the table stakes"*

### Ground Truth posts
- ~~**"Why the Best Model on the Benchmark Isn't the Best Model for Your Product"**~~ ✅ *built May 2026 — id: benchmark-vs-business*
- ~~**"Hard Negatives: The Training Trick That Actually Improves Retrieval"**~~ ✅ *built May 2026 — id: hard-negatives-retrieval*
- ~~**"What Actually Happens During Pretraining"**~~ ✅ *built May 2026 — id: what-happens-during-pretraining*
- ~~**"The Eval Crisis: Why Most AI Evals Are Wrong"**~~ ✅ *built May 2026 — id: the-eval-crisis*
- ~~**"Why Your RAG System Lies"**~~ ✅ *built May 2026 — id: why-rag-lies*
- ~~**"The Reversal Curse"**~~ ✅ *built May 2026 — id: the-reversal-curse*
- ~~**"The Four Memory Problems Every Agent Has"**~~ ✅ *built May 2026 — id: agent-memory-architecture*
- ~~**"How Surprised Is the Model?"**~~ ✅ *built May 2026 — id: how-surprised-is-the-model*
- ~~**"Why Transformers Won"**~~ ✅ *built May 2026 — id: why-transformers-won*
- ~~**"Your Prompt Is Code"**~~ ✅ *built May 2026 — id: your-prompt-is-code*
- ~~**"The Three-Layer DE Skill Stack"**~~ ✅ *built May 2026 — id: three-layer-de-skill-stack*
- **Series: "The Inference Stack"** — Four posts covering the full serving pipeline: quantization → KV cache → speculative decoding → serving infrastructure. Already have individual modules, need the cohesive narrative. *Pending.*
- ~~**"Graceful Degradation"**~~ ✅ *built May 2026 — id: graceful-degradation*
- ~~**"Monitoring That Predicts Problems, Not Reports Them"**~~ ✅ *built May 2026 — id: monitoring-that-predicts*
- **"Prompt Regression Testing: How to Know When a Prompt Change Breaks Things"** — prompt test suite, metrics to track, wiring into CI/CD. Companion to "Your Prompt Is Code". *Pending.*
- ~~**"The N×M Problem and Why MCP Exists"**~~ ✅ *built May 2026 — id: nm-problem-mcp*
- **"Why Classic A/B Testing Breaks for AI and What to Do Instead"** — interleaving, switchback, MAB, permanent holdouts. *Pending.*
- **"The Query Is Never What the User Meant"** — HyDE, multi-query, decomposition, iterative semantic optimization. *Pending.*
- ~~**"The Forward Deployed Engineer"**~~ ✅ *built May 2026 — id: forward-deployed-engineer*
- **"How Data Scientist Became AI Engineer: The Market Forces Behind Your Job Title"** — DS peak → fragmentation → ChatGPT reset → agentic surge. *Pending.*
- **"Layer 3 Skills for Data Engineers: Vector DBs, Embedding Pipelines, and LLM Observability"** — companion to Three-Layer DE post, goes deeper on each Layer 3 skill. *Pending.*

### MCP vs API vs Function Calling (new cluster — from jamwithai production engineering blogs, May 2026)

The N×M problem: without MCP, every AI app must implement M integrations for N tools — the combinatorial explosion that MCP solves with a universal adapter layer. Context window tax: 75K+ tokens consumed before an agent does anything useful when tool schemas are loaded naively. When to skip the API layer and build an MCP server directly. The lab has agent modules covering tool use but no content on MCP as an architectural pattern or the decision framework for MCP vs API vs function calling.

- **Systems module: "MCP vs API vs Function Calling — The Decision Framework"** — interactive: user picks a scenario (build a new integration, connect existing tools, prototype vs production), module walks through the decision tree. Shows N×M combinatorial explosion, context window tax calculation, when each approach wins. Fills a real gap as MCP adoption accelerates.
- **GT post: "The N×M Problem and Why MCP Exists"** — the architectural problem MCP solves, what the protocol actually does, where it fits vs function calling vs raw API. No hype, just the engineering tradeoff.

### A/B testing for AI systems (new cluster — from jamwithai production engineering blogs, May 2026)

Five testing strategies most teams don't know: classic A/B (baseline), interleaved testing (why Airbnb gets 50x sample efficiency by interleaving results from two models rather than splitting users), multi-armed bandits (adaptive allocation), switchback testing (for marketplace/shared-resource systems where user-level splits are impossible), and permanent holdouts (the 5-10% never exposed to any experiment, which most teams skip and shouldn't). The lab has evals content but nothing on experimentation methodology for AI systems — a different and equally important discipline.

- **Systems module: "A/B Testing for AI Systems"** — interactive: user configures an experiment (model A vs B, metric, traffic split, duration), module shows statistical significance calculator, explains when each strategy applies, shows the interleaving technique with a concrete example. Sits alongside the existing Evals module.
- **GT post: "Why Classic A/B Testing Breaks for AI and What to Do Instead"** — the specific reasons user-level splits fail for AI (shared latent state, position bias, novelty effects), why interleaving works, when to use switchback for marketplace systems. Production-grounded.

### Query refinement in RAG (new cluster — from practitioner post, May 2026)

Users rarely ask questions in the ideal retrieval form. "How do I lose weight?" returns diet plans when the user meant PCOS-related concerns. Query rewriting, HyDE (Hypothetical Document Embeddings), multi-query retrieval, and decomposition all try to bridge intent to query. New research direction: refine the embedding representation itself during inference rather than just rewriting the query text — retrieve initial docs, LLM analyzes retrieval quality, refine embedding, retrieve again. "Iterative semantic optimization." Connects to agentic RAG, reflection loops, and test-time adaptation. The lab's RAG Lab covers failure modes at the retrieval config level but has zero content on query refinement as a technique category.

- **GT post: "The Query Is Never What the User Meant"** — user intent vs literal query as the structural problem in retrieval. HyDE, multi-query, decomposition explained with concrete examples. The new direction of embedding refinement during inference. Why this matters: better query reformulation often outperforms better chunking or reranking.
- **Systems module: "Query Refinement Lab"** — interactive: user types a vague query, sees what naive retrieval returns vs HyDE vs multi-query vs decomposition. Shows the difference in retrieved chunks. Extends the existing RAG Lab scenarios with a query-side perspective.

### Agent memory architecture (new cluster — from practitioner infographic, May 2026)

A practitioner post correctly frames the agent memory problem as four distinct types: short-term (current context, costs explode), long-term (vector search returns similar ≠ relevant), episodic (specific past events needing exact recall, not fuzzy matching), and semantic (learned user preferences that must persist across sessions). Their production stack: Redis (hot cache, last 10 interactions) → Postgres (structured episodic memory) → Vector DB (semantic retrieval) → LLM (decides what to fetch). Key insight: the real problem isn't storage, it's decision-making — knowing when to remember vs when to forget. An agent that remembers everything is as broken as one that remembers nothing. The lab has agent loop modules but zero content on agent memory architecture — one of the first production problems you hit when building real agents.

- ~~**GT post: "The Four Memory Problems Every Agent Has"**~~ ✅ *built May 2026 — id: agent-memory-architecture*
- ~~**Systems module: "Agent Memory Architecture"**~~ ✅ *built May 2026*

### Prompt management as infrastructure (new cluster — from Aryan Sharma post, May 2026)

An AI/ML engineer shared how a one-line system prompt change caused a 23% quality drop for 11 days — undetected. No alert, no test, no one checking. Built PromptLab (open source, FastAPI + React + PostgreSQL) to solve it: full version history, A/B experiments, LLM-as-judge eval runs, serve-via-API. Core claim: prompts are code and deserve CI/CD treatment. The lab has zero content on prompt management as a DevOps discipline — only prompt engineering as a skill.

- ~~**GT post: "Your Prompt Is Code"**~~ ✅ *built May 2026 — id: your-prompt-is-code*
- **GT post: "Prompt Regression Testing: How to Know When a Prompt Change Breaks Things"** — practical: what a prompt test suite looks like, what metrics to track (quality score, latency, cost), how to wire prompt testing into CI/CD. No existing lab resource covers this.
- **Systems module: "Prompt Change Management"** — interactive: user edits a system prompt, sees quality score shift, triggers regression alert. Shows A/B split, eval run, rollback decision. Sits alongside existing Evals module.

### Forward Deployed Engineer model (new cluster — from Khushboo Sharma post, May 2026)

FDE postings grew 1,165% in one year. Palantir invented the model; OpenAI built a $10B deployment business around it; Anthropic launched a $1.5B JV on the same logic; Google is hiring hundreds. 95% of enterprise AI pilots produce zero measurable returns (MIT research) — FDEs fix this by embedding inside Fortune 500s and forcing AI out of demo phase into actual workflows. Critical gap identified: intelligence accumulates in the engineer, not the system. When the FDE rotates off, clients are left with a deployment they cannot maintain or explain. 40-60% of FDE time already bleeds into admin: chasing context, bridging disconnected tools.

- **GT post: "The Forward Deployed Engineer: AI's Fastest-Growing Role Nobody's Training For"** — what the role actually is beyond the buzz, why it emerged, what it requires (systems depth + client communication + production debugging), and the dependency gap problem it creates. 1,165% posting growth gives this urgency.
- **GT post: "Institutional Knowledge as Infrastructure: Why AI Deployments Fail After the FDE Leaves"** — the dependency gap problem in depth. Reusable eval harnesses, documented workflow logic, internal playbooks as the fix. The "machine behind the machine" framing. Connects directly to the lab's evals and observability content.
- **Career module: "Is FDE Your Next Move? A Role Readiness Assessment"** — self-assessment across FDE-specific dimensions: systems depth, client-facing communication, production debugging, eval design. Gap analysis with module recommendations.

### LLM loss functions and training signals (new cluster — from Utkarsh Mangal post, May 2026)

A practitioner post in the Data Science Community frames Probability, Entropy, Cross-Entropy Loss, and KL Divergence around one unifying question: "How surprised is the model when it sees the correct answer?" Strong framing — makes the math approachable. The lab's Concepts tab covers attention and transformer architecture but has nothing on the mathematical training signal. This gap matters: engineers who understand loss functions reason better about fine-tuning decisions, RLHF reward design, and eval scoring.

- ~~**GT post: "How Surprised Is the Model?"**~~ ✅ *built May 2026 — id: how-surprised-is-the-model*
- **Concepts module: "The Training Signal — Entropy, Loss, and KL Divergence"** — interactive: user adjusts model confidence distribution, sees entropy change in real time, sees cross-entropy vs KL divergence. Sits alongside existing Attention and Transformer modules. Fills the gap between "architecture" and "training."

### RNN to LSTM to Transformer architectural arc (new cluster — from Naresh Edagotti post, May 2026)

A widely-shared educational post traces the full progression from RNN to LSTM to Transformer and explains why each transition was necessary — parallelism, long-range context, vanishing gradients. Covers encoder-only / decoder-only / encoder-decoder distinction. Key framing: "Transformers are not just a model choice. They are a systems-level breakthrough." The lab has transformer content but no narrative about the historical arc — why the transition happened, what each architecture hit its ceiling on, and why transformers unlocked scaling.

- ~~**GT post: "Why Transformers Won"**~~ ✅ *built May 2026 — id: why-transformers-won*
- **Concepts module addition: "Sequential vs Parallel — The Architecture Transition"** — interactive visualization of token processing as sequential (RNN) vs parallel (Transformer). Show long-range dependency handling and vanishing gradient behavior. Could extend the existing Transformer module or stand as a new Explore module.

### DE skill stack — 3-layer model (new cluster — from anonymous DE post, May 2026)

A practitioner post frames the 2026 DE skill stack as three layers: Layer 1 (SQL, Python, data modelling, Spark, Airflow, cloud — still 80% of your value), Layer 2 (AI productivity: prompt engineering, Cursor/Claude Code fluency, AI-generated SQL verification workflows), Layer 3 (AI infrastructure: vector DBs, embedding pipelines, RAG architecture, feature stores, LLM eval and observability, cloud AI services). Key claim: most engineers obsess over Layer 2 and forget Layer 1 — that's the trap. Layer 3 is currently scarce and what gets you the next senior/staff role. The lab is effectively a Layer 3 training ground but never frames itself that way — a direct positioning opportunity.

- ~~**GT post: "The Three-Layer DE Skill Stack"**~~ ✅ *built May 2026 — id: three-layer-de-skill-stack*
- **GT post: "Layer 3 Skills for Data Engineers: Vector DBs, Embedding Pipelines, and LLM Observability"** — practical breakdown of each Layer 3 skill: when you need it, what the learning curve looks like, what production looks like. Companion piece to the 3-layer post — goes deeper on the specific skills the lab already covers.
- ~~**Learning Path: "Data Engineer to AI Engineer"**~~ ✅ *built May 2026 — 10-step path in LearningPaths.jsx*
- **Home page positioning tweak** — add one line near the hero explicitly claiming Layer 3 depth: "The lab that builds Layer 3 skills — RAG, evals, observability, agent architecture." Zero build effort, direct resonance with DEs reading that post.

### Cross-repo intelligence — what sibling labs have that we don't (May 2026)

Scan of ML Systems Lab and Product Analytics Lab (PAL/Experimentation Lab) surfaced several mechanics and features the GenAI lab is missing. Filtered for fit — excluded things that belong to the other lab's domain (Pyodide Python runtime, statistics rooms, SQL runners).

**High-value borrows — Tier 1:**

- **"Spot the Flaw" mechanic** — PAL has 12 adversarial cases where you find the flaw in a real-looking analysis (SRM, peeking, Simpson's Paradox, etc). Adapt for GenAI: show a broken RAG pipeline config, broken eval setup, or broken agent design — user finds the flaw before the reveal. Different from our current Diagnose mechanic (we build configs that break) — this is "already built, something is wrong." The LangSmith Diagnose tab we just built is the closest thing we have. Port the mechanic more broadly to RAG Lab and AgentConfigLab as an alternative entry mode.

- **Role Readiness Score** — PAL has Junior/Analyst/Senior/Staff readiness derived from PrepLab performance. Build "AI Engineer Readiness" with tiers: Familiar → Practitioner → Senior → Staff. Derived from PrepLab session scores across domains. Shown on PrepLab or a Progress page. No backend needed — localStorage.

- **Weakness Heatmap** — ML Systems Lab Trainer shows per-domain weakness heatmap. Adapt: after PrepLab sessions, show performance per domain (RAG / Agents / Evals / LLMs / Infra) as a heatmap grid. "You're weak on Evals and Serving. These PrepLab questions next." Builds study plan automatically.

- **Defense Doc Generator** — PAL: input JD → 7-day study plan tiered by room importance, printable. Adapt: input a JD → ranked study plan with specific Systems modules, GT posts, and PrepLab clusters weighted to the gap. Different from our current JD Prep mode (which just generates questions). The study plan output is more immediately actionable.

- **Cross-module "Senior Interview" Challenges** — PAL has 6 cross-room scenarios combining stats+RCA+metrics+product. Build 5-6 GenAI capstone scenarios that span RAG + Agents + Evals + deployment — "You're the AI tech lead and this system is failing at 2am. Walk through the diagnosis." No single module answers it. Requires integrating knowledge across labs. Strong interview prep signal.

- **Verbal Practice (Web Speech API)** — ML Systems Lab has voice recording for 25 interview questions, 4-criteria self-rating. No server needed (Web Speech API is browser-native). Port: 10 AI system design questions + "explain your RAG architecture" scenarios. Differentiating feature with zero backend cost. Note: Chrome/Edge only.

- **Company-specific prep tracks** — ML Systems Lab has a Companies section. Build: "Prepare for OpenAI / Anthropic / Google DeepMind / Meta FAIR" — curated module sequences + GT post clusters + PrepLab question filters. Simple static data, high perceived value. Target the exact user running interview prep right now.

- **Bookmarks** — PAL has a global Saved/bookmarks feature (save any case across all rooms). localStorage only. Build: save any GT post, Systems module, or PrepLab question for later. Simple but makes the lab stickier — users return to their saved items.

- **91-day practice heatmap** — GitHub-style contribution grid showing daily module completions and PrepLab attempts. Pure localStorage, zero backend. Progression visibility that makes streaks feel real and earned.

**Low-value / wrong-fit borrows (skip these):**
- Pyodide live Python runner — no Python content in GenAI lab, adds ~30MB bundle
- 5-zone bottom nav (Today/Practice/Read/Interview/Ask) — our current architecture is different and would require full restructure
- Case study dossiers (Netflix/Uber) — those are product analytics scenarios, wrong domain
- Spaced repetition queue — needs meaningful per-question difficulty calibration data we don't have yet

### AI Job Market Watch — side project signal engine (new cluster — May 2026)

The problem: people have zero clue which side project to build to match what employers actually want. Generic "build these 7 projects" advice dominates LinkedIn but is disconnected from live market signal. The idea: continuously watch online job postings for AI roles, extract recurring skill/tech stack requirements, and surface "here's what 300 JDs asked for this month — build something that demonstrates it." Data-driven side project recommendations tied directly to current hiring patterns, not vibes.

**Real constraint:** the lab is static/zero-backend. A live job watcher needs a scheduled scraper or external data source. This idea either lives as a separate product, or as a periodically-updated static module (curated manually from job scraping runs, refreshed monthly). The static version is buildable now; the live version is a different product entirely.

- **GT post: "What AI Job Postings Actually Ask For Right Now"** — manually scraped snapshot of 200+ AI engineering JDs: top required skills, top mentioned tools/stacks, which projects actually appear in the "nice to have" section. Updated monthly. High search intent, no good resource exists at this level of specificity.
- **Career module: "Side Project Matcher"** — static curated list: skill → what JDs are asking for → what side project demonstrates it → what module in the lab builds that skill. Updated periodically. Zero backend needed.
- **Standalone product consideration** — a live version (scheduled scraper → embedding clustering → weekly digest) is a real product. Would not live in the lab but is a natural extension of the lab's audience and thesis.

---

## Tier 2 — High Impact, More Effort

### New features
- ~~**PrepLab spaced repetition**~~ ✅ *built*
- ~~**Module search**~~ ✅ *built (Systems search bar)*
- ~~**"Learning paths"**~~ ✅ *built (6 paths, Learning Paths tab)*
- **GT reading mode improvements** — Table of contents per post, estimated reading time progress indicator, related posts sidebar.

### Systems improvements
- **Explore grouping** — Apply the same DESIGN/BUILD/OPS group structure to Explore (14 modules, getting long). Currently flat list.
- **Systems module search** — Filter pills by keyword as you type. Useful at 38+ modules.

### Career tab — India salary data refresh (2026)
Current salary calculator likely uses stale data. 2026 benchmarks from 1,200+ AI engineer hires across GCCs and startups in India: Junior $22–34K, Mid $45–72K, Senior $85–135K, Staff/Principal $150–240K, GenAI/LLM Specialist +35–55% premium over base band, top 1% at FAANG GCCs $280–420K. Key framing shift: senior Bangalore now earns more than median senior in Berlin or Toronto. GCCs competing at 70–80% of US comp, not 30%. Update the salary calculator bands and add the "GenAI specialist premium" as a distinct band.

### Architecture
- **Split modules.jsx further** — Currently 9,500 lines. Could split by group: `src/systems/build.jsx`, `src/systems/ops.jsx`, `src/systems/design.jsx`. Low urgency (Vite handles it fine, file tools work with offset/limit).
- **Lazy loading** — Import each module component dynamically (`React.lazy + Suspense`). Would improve initial load time. Low priority since Vite bundles well.

---

## Tier 3 — Interesting, Lower Priority

### User accounts + Google login + customizable profile

Individual login (Google OAuth or email) with a personal profile section. Progress, bookmarks, PrepLab scores, War Room (or a clean version of it), recently read GT posts, active learning path — all tied to an account rather than localStorage. Profile customizable: role (engineer/PM/student), current goal (interview prep/building/transitioning), experience level.

**Why it matters:** right now progress doesn't sync across devices and is lost when localStorage is cleared. An account layer makes the lab sticky in a way that localStorage cannot. A profile also enables personalized path recommendations — "based on your goal and where you are, here's what's next."

**The constraint:** this is the single biggest violation of the zero-backend principle. Needs auth infrastructure, a database, session management — none of which exist. This is not a tab addition, it is a product architecture change. Lives here until the backend decision is made. If the product ever moves off the pure static model, this becomes Tier 1 immediately.

- **Community features** — Upvotes on GT posts, comments, "found this helpful". Needs backend. Out of scope for static app.
- **Export** — "Export my PrepLab session" to PDF/CSV. Nice to have.
- **Dark/light toggle** — Currently dark-only. Some users prefer light mode.
- **Mobile app** — PWA manifest exists. Could push to make it more native-feeling on mobile.
- **User accounts** — Cross-device progress sync. Needs backend. Significant scope increase.
- **AI tutor mode** — User answers PrepLab question, AI gives personalized feedback rather than static explanation. Needs API key handling.

---

## Retired Ideas

Ideas that were considered and consciously not built:

- **CHANGELOG.md** — Auto-generated from git log has no real value; LINEAGE.md covers build history better.
- **ROADMAP.md** — Too high maintenance for a fast-moving solo project; IDEAS.md is the living replacement.
- **TypeScript migration** — Would break Vercel builds with current setup. Not worth the migration cost.
- **External UI library (shadcn, MUI)** — Added bundle weight and design constraints. Hand-rolled components are fine.

---

## How to Use This File

When starting a new build session:
1. Pick ideas from Tier 1 that fit the session's theme
2. After building, move completed ideas to LINEAGE.md
3. Add new ideas that emerged during the session to the appropriate tier
4. Promote ideas from Tier 2→1 when adjacent modules make them easier to build
