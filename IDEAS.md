# IDEAS — Future Depth & Improvements

Prioritized backlog of ideas not yet built. Organized by effort and impact. Updated after each build session.

*Last updated: June 2026 (sprint 43) | Current scale: 57 Systems modules (in nav), 22 Explore, 16 Agent Lab, 27 Concepts (7 active gyms), 307 PrepLab questions, 226 GT posts, 6 labs*

---

## 💰 Business Model — Decision Pending (May 2026)

This is the single most consequential open decision. Everything below is affected by which path is chosen.

### Recommended: Freemium with PrepLab as the paid gate

**Free tier** (acquisition layer — never gate these):
- All Labs: RAG Lab, Agent Lab, Eval Lab, LLM Lab — every scenario, every module
- All Systems, Explore, Concepts modules
- All Ground Truth posts
- PrepLab Exam + Trainer modes: 10 questions per session (unlimited sessions)
- Interview Prep Plan: JD paste + self-rating questionnaire + skill assessment (phases 1–3)

**Gated tier** (access code now → paid later):
- PrepLab: all questions beyond 10/session (161 hard questions, already `gated: true`)
- PrepLab: Company Tracks mode
- Interview Prep Plan: personalized study plan (phase 4) — gated after 30% completion

**Gate UX (interim):** Client-side access code (localStorage). Community code shared freely during beta. When Stripe goes live: purchased codes replace community code, validation moves server-side. See DECISIONS.md Section 0.

**Why this split:** Labs are the "wow" — give them away entirely. PrepLab is the "get hired" tool — people pay for things that directly help them pass interviews. Interview Prep Plan is the highest-intent feature — someone with an interview in 2 weeks pays without hesitation. Gating at 30% completion (not upfront) means the user is mid-goal and invested when the gate fires.

**Why not B2B:** Requires sales. Solo builder. Wrong stage.

**Why not cohorts:** Requires facilitation. Wrong stage. Could be Tier 2 once product-market fit is confirmed.

**Auth approach when ready:** Supabase Auth or Firebase Auth — both work on static sites with no custom backend. Google OAuth, one JS import, free tier. Progress syncs to a real DB instead of localStorage. Not a massive lift (~1 weekend). Unlocks cross-device sync, persistent progress, future gating.

**Internal pay gate markers:** Add `gated: true` flag to each PrepLab question and JD Prep mode in the data. Invisible to users. When Stripe is ready, wire the gate — the flag is already there. No UI change needed now.

**The blocker for actual gating:** Stripe + Supabase Auth. Not a blocker for building toward it. Current state: everything stays free, markers get added, auth comes in a focused sprint when the decision is made.

### Early revenue experiment — Gumroad/Etsy PDF cheatsheet (distribution signal from builder story, May 2026)

A practitioner built a quiz platform, distributed via Etsy/Gumroad, and hit £1,000+ without a formal launch — purely through search and marketplace discovery. The signal: static/PDF content sells via marketplaces before Stripe exists. GAL's PrepLab content is already high-density and structured — it maps directly to a PDF cheatsheet format (system design principles, RAG failure taxonomy, eval metrics reference, agentic failure modes). Gumroad/Etsy require no backend. Revenue would validate audience intent before Stripe is wired, and test which content cluster has the highest conversion signal.

- **PrepLab "Cheat Sheet" PDF** — curated 2-page reference: top 20 RAG failure modes + production notes, RAGAS metrics quick reference, agentic failure taxonomy, GT post reading list by topic. Sell on Gumroad at $5–9. `Effort: S (pure content + PDF generation)`
- **Etsy/Gumroad listing test** — list PDF and measure organic discovery rate over 30 days. No paid promotion. Pure signal test.

**Decision gate:** Do not build until Stripe + auth decision is made and confirmed as "later." If Stripe is imminent (< 3 months), skip this and go direct. This is only the right path if auth is genuinely deferred 6+ months.

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

Nothing actively in progress. Last completed sprint: sprint 41 (batches A–B): 7 new Concepts modules (LLMAsJudge, EvalDesign, AgentToolDesign, CostLatency, Observability, FewShot, ChainOfThought), 4 gyms activated (Evaluation, Production, Foundation Models, Prompt Engineering), Prompt Engineering Lab (5th BUILD lab, 6 scenarios, `src/PromptLab.jsx`). See CLAUDE.md session build log for full detail.

---

## Visual Polish backlog (carry-forward from UI sprint, May 2026)

The UI Polish sprint completed font, glow system, door cards, GT browser, and reading experience. These items were identified as the next layer but not yet started. All are non-breaking cosmetic improvements.

- **Consistent module headers** (Tier 1) — every module in `systems/modules.jsx` renders its own ad-hoc title block. Standardise: `ModuleHeader` component with title, group tag, difficulty badge, estimated time. Apply to top 10 most-visited modules first. `Effort: S`
- **Explore tab module cards** (Tier 1) — 25 modules in a flat grid. Apply card treatment matching Home door cards: colored top border by group, hover lift, gradient bg. `File: Explore.jsx` `Effort: S`
- **PrepLab question experience** (Tier 1) — question card, correct/wrong states, progress indicator all functional but visually flat. Green flash for correct, explanation card with depth, progress bar that feels earned. `File: PrepLab.jsx` `Effort: S-M`
- **Series cards depth in GT** (Tier 2) — series cards have top accent line but background is flat. Apply same gradient card treatment as door cards. `File: GroundTruth.jsx` `Effort: XS`
- **Loading/skeleton states** (Tier 2) — Suspense fallback is four gray divs. Build a skeleton that matches sidebar+content layout. `Effort: S`
- **RAG Lab HowTo block** (Tier 3) — HowTo component at RAG Lab top is informational text. Could be a visual onboarding strip (numbered steps with icons) that collapses after first visit. `File: App.jsx` `Effort: S`

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

### Ask/Search upgrade — Audit 35 (May 2026) ✅ Done sprint 13

**Problem:** Label says "Ask", mechanic is exact-string `includes()` over GT post titles only. Natural queries like "why does retrieval fail" return zero results. No module coverage. No ranking. No match highlighting. No empty-state guidance.

**Fix (all static, Consultation.jsx only):**
- ~~Token-based scoring: split query → score each result by word-overlap count, sort descending~~ ✅
- ~~Expand corpus to include Systems module titles/subtitles + Explore module titles~~ ✅
- ~~Match highlighting on result cards~~ ✅
- ~~Empty state with suggested queries~~ ✅
- ~~Relabel to "Search" permanently~~ ✅

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

- ~~**Module endings: forward pointer**~~ ✅ *Done sprint 6/7 — ✓ done card with PrepLab + GT forward pointer added to RAG Lab, Concepts, Systems shell, Agent Lab done screens.* Add a minimal ✓ done card at each module end with: one PrepLab question on this topic (by id), one GT post link (the most relevant). The RELATED_GT infrastructure already exists — the ending just needs to use it. This is the single highest-dropout moment in the product. *Flagged in Audits 14, 20, 26, 27 — still open. Zero new infrastructure required.*

- **Reference tables → decision engines** — 10-15 modules in Systems and Explore are comparison tables without user input. Per DECISIONS.md Section 4, these don't meet the interactive decision engine standard. Each should either: (a) add a configuration input + logic-derived outcome, or (b) move to a GT post. Start with the 5 lowest-effort conversions. *Audit 27 Finding 1.*

- **Social proof overhaul** — 3 unnamed testimonials from "ML Engineer · fintech startup" are unconvincing. Replace with: (a) real LinkedIn screenshots with likes/comments as proof of resonance, (b) GitHub star count if significant, (c) named quotes with handles from real users. *Audit 27 Finding 2.*

- ~~**Stat sync**~~ ✅ *Done sprint 6 — all stat counts synced across Home.jsx.* Actual: 261. GT posts: 222. Systems: 57. Run a stat sync across Home.jsx, index.html, README.md. *Audit 25 Finding 2.*

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
- ~~**Agent Context Architecture**~~ ✅ BUILT batch-G (`144618f`) — 3-tab interactive (Configure Layers, Failure Modes catalog, When to Use decision table). 57th Systems module + 4 PrepLab questions (agentctx-1/2/3/4).

### Datamart-backed realism — static corpus for RAG Lab + Eval Lab (new cluster — May 2026)

The RAG Lab's configure→fail→diagnose mechanic fires against labels and metrics. "Top_k too high = noise injection" is a tag — the user reads it, doesn't experience it. A small static document corpus (JSON array) with pre-computed similarity scores would let the user read the actual retrieved chunk that caused the failure. Seeing the garbage doc that got pulled in is a materially different learning experience from reading "noise injection." No execution required — pure React state, zero WASM cost.

Scope boundary: RAG Lab and Eval Lab benefit from real data. Agent Lab and LLM Lab do not — their failure modes are behavioral and distributional, not corpus-dependent. See DECISIONS.md Section 7 for the full architecture ruling.

**Tier 1 items (build in order):**

- ~~**Static document corpus for RAG Lab**~~ ✅ DONE sprint 38 (`9a985b5`) — `src/ragCorpus.js` created (149 lines): 24 real document objects across all 6 RAG Lab scenarios (3-4 docs per scenario). "Retrieved chunks" collapsible panel added in App.jsx showing actual retrieved text per scenario.

- ~~**Pre-computed similarity matrix**~~ ✅ DONE sprint 38 — included in ragCorpus.js as similarity scores per doc object.

- **Eval Lab query-answer-context triples** — 20 pre-built `{query, golden_answer, retrieved_contexts, judge_score}` triples. User sets judge parameters (temperature, strictness), watches which triples flip pass/fail. Makes calibration drift tangible on actual text pairs, not abstract score movements. `Effort: S-M`

### Systems modules (depth improvements)
- ~~**Evals Lab**~~ ✅ *built May 2026 — Build Your Eval 4-step wizard, generates judge prompts, implementation checklist*
- **Context Compaction** — Add live compaction simulator: user adjusts conversation length, sees token count, triggers compaction, sees output quality change. *Pending.*
- **Agent Architecture** — Add multi-agent orchestration interactive (orchestrator dispatches to workers, see the message flow). Currently only single-agent. *Pending.*

### Cosine similarity + vector normalisation fundamentals (small cluster — from Nishit Jain interview post, May 2026)

An AI interviewer found that candidates who claimed to have built 2-3 RAG systems couldn't explain cosine similarity pictorially — no cos θ, no angle, no vector multiplication. The lab covers RAG failure modes deeply but not the mathematical foundation of WHY similarity search works. This is a real gap: someone can follow a RAG tutorial without understanding what cosine similarity is doing or why normalisation matters.

- ~~**PrepLab questions (3–4)**~~ ✅ *built May 2026 — cos-1, cos-2, cos-3*
- ~~**Explore module: "Cosine Similarity — The Geometry of Retrieval"**~~ ✅ *built May 2026 — id: cosine in Explore*

### Bi-encoder vs cross-encoder two-stage retrieval (new cluster — from Microsoft interview post, May 2026) ✅ BUILT (sprint 35, `74160e7`)

A Microsoft RAG interview transcript surfaced a hard gap: candidates who can implement vector search can't explain *why* a reranker exists as a second stage, what a cross-encoder actually does (full-attention pair scoring vs. separate embedding lookup), or when each stage fails. The lab covers retrieval failure modes (noise injection, score threshold misconfiguration) but never explains the two-stage architecture — bi-encoder for recall, cross-encoder for precision — as a deliberate design decision with distinct failure modes per stage. High PrepLab signal: this question appears in FAANG/unicorn interview loops at exactly the level GAL's audience targets.

- ~~**GT post: "Two-Stage Retrieval: Why a Reranker Exists"**~~ ✅ — bi-encoder recall vs cross-encoder precision, Stage 1/Stage 2 failure modes, 6-row comparison table, when-to-add-reranker list, when-one-stage-is-enough list. `id: two-stage-retrieval-reranker`
- ~~**PrepLab questions (4)**~~ ✅ — `reranker-1` through `reranker-4`. Medical Q&A precision redesign (hard), lexical gap failure attribution (hard), bi-encoder primary limitation MCQ (medium free), recall_k=100 doc at position 120 (medium). All with trap fields.
- ~~**Query Refinement module "Two-Stage" tab**~~ ✅ — `TWO_STAGE_QUERIES` (3 scenarios), side-by-side Stage 1 bi-encoder vs Stage 2 cross-encoder with ↑N/↓N rank-change arrows, failure mode cards, when-to-add-reranker decision list.

### Graph RAG + multi-hop retrieval (new cluster — from Senior AI Engineer interview post, May 2026) ✅ BUILT (sprint 33, `2a00754`)

Senior AI Engineer interview loops are explicitly testing Graph RAG, multi-hop retrieval, and cross-document synthesis — architectural patterns above vanilla vector RAG. The lab covers flat retrieval failure modes well but has zero coverage of graph-structured retrieval: how entities and relationships are indexed, when multi-hop is necessary (vs. expensive), and how graph traversal fails differently from embedding-based retrieval. This is the natural ceiling content above the existing RAG Lab. High signal: appears in FAANG/unicorn Round 1 questions targeting senior candidates.

- **GT post: "Graph RAG: When Vector Search Isn't Enough"** ✅ — entity-relationship indexing, multi-hop traversal table, hybrid architecture, production failure modes, when-to-use decision table. `id: graph-rag-multi-hop`
- **`GraphRAGModule` (4 tabs)** ✅ — failure comparison, interactive SVG knowledge graph (7 nodes, 8 typed edges, click-to-explore), animated 6-step multi-hop traversal, when-to-use decision table.
- **PrepLab questions (4)** ✅ — `graph-rag-1` through `graph-rag-4`. Compliance multi-hop failure, pipeline construction + failure modes, what multi-hop retrieval is (MCQ), hybrid routing logic. All with trap fields.
- **RAG Lab scenario extension** — optional: add "Graph Retrieval" scenario to RAG Lab (entity-based lookup, multi-hop config, traversal depth slider). Long-term build — depends on static corpus first. `Effort: M` — still pending.

### LangGraph state management + HITL patterns (new cluster — from Senior AI Engineer interview post, May 2026) ✅ BUILT (sprint 34, `cfd4520`)

Senior AI interviews are now testing LangGraph-specific abstractions (ReAct, reducers, state accumulation) and Human-in-the-Loop design decisions — not just generic agent loop concepts. Agent Lab covers failure modes but doesn't model the LangGraph mental model (nodes, edges, state reducers as accumulators) or when HITL is the right production pattern (approval gates, escalation triggers, override flows).

- **GT post: "LangGraph Reducers and HITL: State Machines for Agentic Workflows"** ✅ — reducer functions, StateGraph, HITL checkpoint patterns, when graph-based orchestration beats custom loops.
- **`LangGraphModule` (4 tabs)** ✅ — Reducers demo, StateGraph SVG, HITL animated flow, When to Use table.
- **PrepLab questions (4)** ✅ — reducer bug (parallel nodes + overwrite), interrupt_before timing, HITL design decision, checkpointer production bug. All with trap fields.

### Testimonials / feedback section (new cluster — from session discussion, May 2026)

Users who've gotten value from GAL currently have no way to signal that back, and new visitors have no social proof beyond a stat row. Two related but architecturally distinct problems.

**Phase 1 — Tally-form collection (buildable now, no backend):**
- "Submit feedback" link on Home → opens a Tally.so form (free tier). Fields: one 1–5 rating, one free-text testimonial, role/company optional.
- Owner reviews via Tally email notification. Good ones get manually added to a `TESTIMONIALS` constant in `Home.jsx`.
- Show/hide testimonials section on Home based on whether `TESTIMONIALS.length > 0`. Remove placeholder testimonials entirely until real ones exist.
- `Effort: XS (Tally form + one JSX change)` — do in the next Home polish pass.

**Phase 2 — Per-page ratings via PostHog (buildable now):**
- Thumb up / thumb down (or 1–5 star) widget at the bottom of each GT post, each Systems module done card, each PrepLab session end. `Effort: XS`
- Events: `feedback_submitted { rating: 4, page: "systems/graph-rag", type: "module" }`. Zero storage problem — PostHog handles it.
- This is different from testimonials: it's signal for the builder (which modules are working), not social proof for new visitors.
- `Effort: S` — PostHog event + 1 shared FeedbackBar component added to 3 completion points.

**Phase 3 — Approval + edit workflow (requires Supabase, batch with Stripe):**
- Real-time submission form → Supabase `feedback` table with `reviewed: false` flag → admin review UI at `/admin?key=...` → approve / edit / reject → displays on Home.
- This is the right long-term design but requires a backend. Not buildable statically. Belongs in the Stripe + auth sprint.

**Decision:** Build Phase 1 + Phase 2 in the next Home polish sprint. Build Phase 3 with Stripe. Do not use placeholder testimonials in the interim — the UPGRADES.md entry (Social Proof Overhaul) already flags this.

### Interview Experiences section + skill graph (new cluster — from session discussion, May 2026)

Real interview signal: which topics appear in which company-type interviews, how often, at what difficulty. No prep site has this as a data layer — they have anecdotes. GAL is positioned to build this because the CLAUDE.md field intelligence log already contains 15+ structured interview signals that can seed it.

**The core insight:** A skill frequency graph built from 80+ interview experiences is actionable in a way that no topic-coverage checklist is. "Graph RAG appears in 38% of senior AI engineer Round 1 interviews" is a planning tool. PrepLab's topic weights in Company Tracks could be driven by this data.

**Phase 1 — Editorial model (buildable now, no backend):**
- New section on Home or separate page: `InterviewExperiences` — seeded with 20–30 structured entries manually (from CLAUDE.md field intelligence log + practitioner posts you've read).
- Each entry schema: `{ role, companyTier: "FAANG|unicorn|startup|enterprise", round: 1|2|3, topics: ["rag", "agents", "evals"], difficultySignal: "hard"|"medium", notes, source }`.
- Static skill frequency chart using recharts: bar chart showing % of experiences mentioning each topic. Filters: by company tier, by role type.
- "Submit your experience" chip → Tally form (same pattern as testimonials).
- Manual curation: good Tally submissions → add to data array, push. This gets to critical mass faster than crowd-sourcing because you already have 15+ signals to seed it.
- `Effort: M` — data entry + recharts bar chart + Tally form link.

**Phase 2 — Crowd-sourced with LLM validation (requires serverless function, batch with Stripe):**
- Free-text submission → serverless LLM call checks completeness (role present, round present, topics mentioned, min 100 words) → pending review → admin approves → appears in graph.
- Auto-extract skill mentions from submission text using LLM → update frequency chart in real time.
- `Effort: L` — serverless function (Vercel edge function), Supabase storage, admin UI, LLM extraction prompt.

**Legal note:** Frame as "skills and patterns observed" not "exact questions asked." Companies (especially FAANG) have issued DMCA requests against sites publishing verbatim interview questions. The pattern-level framing avoids this and is also more useful — specific questions change, skills don't.

**Connection to Company Tracks:** Once the experience graph has enough data (50+ entries), Company Tracks' `topicWeights` can be data-driven rather than manually configured. The graph becomes the Company Tracks backend.

**Decision:** Build Phase 1 in a Home polish sprint after Phase 1 testimonials ships. Build Phase 2 with Stripe.

### Scaling laws (new cluster — from LLM/GenAI Interview Master Guide PDF, May 2026) ✅ BUILT (sprint 39 batch-6, `fd73d26`)

GT post `chinchilla-scaling-laws` already existed. 4 PrepLab questions (scaling-1 through scaling-4, 2 medium free + 2 hard gated, all with trap fields). ScalingLawsModule Concepts module: 3-tab interactive (formula slider, training vs inference tradeoff, real models table).

Scaling laws (Kaplan et al., Chinchilla) are a Q1 fundamentals topic in senior AI interviews — tested before RAG, before agents. GAL has architecture coverage (Concepts tab: Transformer, Attention, Tokenizer, Context Window) but zero content on scaling laws. "Bigger model = better" is the single most common misconception GAL's audience holds; Chinchilla disproved it. The compute-optimal training insight (smaller model trained longer outperforms larger undertrained model) is immediately applicable to any engineer making deployment or fine-tuning decisions. Absent from GAL entirely.

- **GT post: "What Scaling Laws Actually Tell You"** — Kaplan power law recap, Chinchilla compute-optimal ratio (20 tokens/parameter), why Llama 3.1 8B beats older 70B models, emergent abilities controversy, what this means for fine-tuning decisions (scale data before scaling parameters). `Effort: S`
- **PrepLab questions (3–4)** — Chinchilla optimal compute, why bigger isn't always better, scaling law implications for fine-tuning, emergent abilities definition + controversy. `Effort: S`
- **Concepts module: "Scaling Laws"** — interactive compute-optimal curve: slider for parameter count, token budget auto-computes from Chinchilla ratio, model "efficiency zone" visualised. `Effort: S-M`

### Semantic caching (new cluster — from LLM/GenAI Interview Master Guide PDF, May 2026) ✅ BUILT (sprint 39 batch-7, `267a552`)

GT post `semantic-caching` written (10 blocks: how it works, threshold calibration table, when it breaks list, tooling list, combining with prompt caching). 3 PrepLab questions (semcache-1 medium free, semcache-2/3 hard gated, all with trap fields).

Semantic caching is a Q2 prompt engineering topic (cost optimisation) that's absent from GAL. The concept: cache LLM responses keyed by semantic similarity of the query embedding, not exact string match — so "What is RAG?" and "Can you explain RAG?" hit the same cached response. It's a real production cost reduction lever that most teams discover late. GAL covers prompt engineering generally (Playground) but has no content on caching strategies.

- **GT post: "Semantic Caching — The LLM Cost Reduction Most Teams Discover Late"** — how it works (embedding similarity threshold), when it breaks (paraphrase attacks, time-sensitive queries), GPTCache / Redis Vector Cache as production tools, what cache hit rates look like in practice. `Effort: S`
- **PrepLab questions (2–3)** — semantic vs exact-match caching trade-offs, cache invalidation for LLM responses, when caching hurts accuracy. `Effort: S`

### Dense vs sparse retrieval (new cluster — from LLM/GenAI Interview Master Guide PDF, May 2026) ✅ BUILT (sprint 39 batch-8, `d0d1459`)

GT post `hybrid-search` already existed (9 blocks, BM25 vs dense comparison table, RRF code, production tooling). 3 PrepLab questions (retrieval-1/2 medium free, retrieval-3 hard gated, all with trap fields).

Dense retrieval (vector search via bi-encoder embeddings) vs sparse retrieval (BM25/TF-IDF keyword matching) is a Q3 RAG fundamentals question. GAL's RAG Lab covers failure modes but doesn't explain the two retrieval paradigms as architectural alternatives with different failure modes. BM25 excels on exact keyword matching (product codes, names, IDs) but fails on semantic paraphrases; dense retrieval is the reverse. Hybrid search combines both. This is a real system design decision at the RAG architecture stage — absent from both GT and PrepLab.

- **GT post: "Dense vs Sparse Retrieval — When to Use Each"** — BM25 mechanics (TF-IDF term weighting, why it beats dense on exact terms), bi-encoder dense retrieval (semantic generalisation, embedding space collapse failure), hybrid search (RRF score fusion, when to weight BM25 higher), production tools (Elasticsearch BM25 + FAISS / OpenSearch hybrid). `Effort: S`
- **PrepLab questions (3–4)** — BM25 vs vector search failure modes, when sparse beats dense, hybrid search fusion approaches, when NOT to use hybrid search. `Effort: S`

### Fine-tuning depth — LoRA / QLoRA (elevated from skip — May 2026) ✅ BUILT (sprint 39 batch-9, `0915cb8`)

GT posts already existed (lora-in-practice, qlora-consumer-hardware, lora-paper, fine-tuning-fundamentals). PrepLab already had ft-1/2/5 covering LoRA basics + trap fields. LoRAModule Concepts module built: 3-tab interactive (rank decomposition parameter math, QLoRA VRAM calculator, when-to-use decision table with 6 scenarios).

Fine-tuning is increasingly expected knowledge for senior AI engineers, not just ML researchers. LoRA (Low-Rank Adaptation) and QLoRA (quantized LoRA) are the production-standard fine-tuning techniques — every interview guide, every JD, every team discussing cost reduction mentions them. GAL currently has a `finetune` module in LLM Lab and a stub `dpo-in-practice` GT post, but no interactive treatment of LoRA mechanics or QLoRA's role in enabling fine-tuning on consumer hardware. Previously deprioritised; elevating to Tier 1.

- **Concepts module: "LoRA — Fine-Tuning Without the Compute Bill"** — rank decomposition mechanic (why low-rank works for adapter weights), parameter count math (trainable params in LoRA << full fine-tune), QLoRA extension (4-bit quantized base + full-precision adapters), when LoRA is sufficient vs when full fine-tuning is needed. `Effort: S-M`
- **PrepLab questions (3–4)** — LoRA rank parameter trade-offs, QLoRA memory math, LoRA vs prompt tuning vs full fine-tune decision tree, catastrophic forgetting in LoRA. `Effort: S`
- **GT post: "LoRA in Production — What the Papers Don't Tell You"** — merge at inference vs separate adapter weights, rank sensitivity to task type, instruction fine-tuning vs domain adaptation, dataset size requirements. `Effort: S`

### Explore modules
- ~~**Model Architecture Comparison**~~ ✅ *built May 2026 — architecture guide + use-case wizard*
- ~~**Tokenizer Comparison**~~ ✅ *built May 2026 — BPE/WordPiece/SentencePiece/tiktoken guide + live demo + cost calculator*
- ~~**Hardware Reference**~~ ✅ *built May 2026 — GPU comparison table + VRAM calculator*
- ~~**Cosine Similarity**~~ ✅ *built May 2026 — drag-vectors interactive*
- ~~**Explore grouping**~~ ✅ *built May 2026 — DESIGN/BUILD/OPS sections with border-l active state*

### PrepLab

#### Interview Strategy Tool — full personalization funnel (May 2026)

**What it is:** A single, unified "Interview Strategy" mode that replaces and absorbs the current Interview Prep Plan (phases 1–3), Defense Doc, and effectively renders Trainer and Weakness Heatmap as internal mechanisms rather than top-level modes. Validated by ML Systems Lab (Defense Plan, v4.10) and PAL (same merge done). GenAI Lab is the pre-merge version — this is the consolidation.

**Input layer — what the user brings:**

1. **JD paste** — required. Extract required skills/topics, seniority signals, domain emphasis.
2. **Resume paste** — optional but changes the analysis. Gap becomes resume-evidenced, not just self-reported. Topics the resume clearly covers skip or reduce self-rating weight.
3. **Days until interview** — 3 / 7 / 14 / 21+ days. Scopes the plan to what's actually achievable.
4. **Round type** — Technical / Hiring Manager / Behavioral / HR. Filters which topics and resource types dominate the plan. A behavioral round plan looks nothing like a technical round plan.
5. **Prior round feedback** — optional. "Recruiter said system design was weak", "L4 technical round, got dinged on evals." Each piece of feedback boosts weight on the named topic cluster.

**Gap analysis layer:**

- JD → skill/topic extraction (existing SKILL_KEYWORDS detection, extend it)
- Resume → coverage extraction (new — parse resume text against same skill taxonomy)
- Delta = JD-required topics minus resume-covered topics = the actual gap
- Self-rating questions shown **only on gap topics** — not everything, just what resume doesn't cover or covers weakly. This is the key UX improvement over current IPP (which asks you to rate everything).
- Weight formula: `gap_weight = jd_importance × (1 - self_rating) × round_type_multiplier × prior_feedback_boost`
- Result: ranked list of topics by cost-of-being-wrong, scoped to the round type

**Output layer — the day plan:**

- Day-by-day study plan scoped to the days they have
- Each day = 2–3 specific resources from the platform: GT post, Systems/Agent Lab module, PrepLab question cluster
- Hard/high-weight gaps front-loaded (days 1–2), lighter gaps toward the end
- Round type changes the resource mix: technical round → Labs + PrepLab systems design questions; behavioral → GT posts on failure patterns + self-reflection framing; HM round → product angle, tradeoff framing
- Prior round feedback adjusts day ordering — feedback-named weaknesses get day 1–2 slots regardless of self-rating

**Gating:**
- Free: JD input + gap analysis + first 2 days of plan
- Gated: full plan (all days), resume integration, prior round feedback, round-type filtering
- Gate fires after user sees the gap analysis and first 2 days — they're invested before the gate fires

**Absorbs / replaces:**
- Current Interview Prep Plan (phases 1–3 + gated phase 4 teaser) → becomes the core of this
- Defense Doc → its self-rating questionnaire becomes the gap analysis step
- Weakness Heatmap → becomes an internal data source (history-based weights supplement self-ratings), not a top-level mode
- Trainer → becomes the drill mechanism invoked from within the plan, not a standalone mode

**What this does to PrepLab sidebar:**
- Before: Exam / Trainer / Interview Prep Plan / Company Tracks / Defense Doc / Weakness Heatmap — 6 peer-level items with unclear differentiation
- After: Exam / Interview Strategy / Company Tracks — 3 items with clear distinct jobs. Trainer and Heatmap live inside Interview Strategy, not as separate nav items.

**Files to touch:** `PrepLab.jsx` — new `InterviewStrategyMode` component replacing `InterviewPrepMode` + `DefenseDocMode`. `PREPLAB_SIDEBAR` updated. Heatmap becomes a data utility, not a rendered mode.

**Effort:** L — multi-session. Resume parsing is new (static text matching against skill taxonomy, no backend). Day plan generation is algorithmic (sort by weight, bin into days, map to resource IDs). No LLM calls needed — fully static.

**Source:** Conversation May 2026 — synthesized from ML Systems Lab Defense Plan v4.10, GenAI Lab IPP phases 1–3, user spec. Confirmed cross-product: same consolidation done in both sibling products.

---

- ~~**Questions for uncovered modules**~~ ✅ *built May 2026 — 15 questions: pid-1–5, ama-1–4, lcp-1–3, tok-1–3*
- ~~**JD Prep mode — Interview Prep Plan upgrade**~~ ✅ *Done sprint 11 — `InterviewPrepMode` replaces `JDPrepMode`: Phase 1 (JD → SKILL_KEYWORDS detection, topic weights), Phase 2 (self-rate Weak/Okay/Strong per topic), Phase 3 (gap-weighted 20-question drill with `DRILL_W = {weak:3, okay:1.5, strong:0.5}`), Results (score + per-topic breakdown + study resources + gated Phase 4 study plan teaser). `serving` added to TOPIC_LABELS/COLORS.*
- **Scenario-type questions** — Multi-turn conversational scenarios where the user debugs a failing system across 3-4 exchanges. Higher fidelity than MCQ. *Pending.*
- **More system design text questions** — Cover: vector DB selection, agent reliability, eval harness design, fine-tuning decision framework. *Pending.*

### New PrepLab questions — Quantiphi Defense Pack signal (new cluster — June 2026)

Source: Quantiphi Senior ML Engineer interview prep PDF. 6 topics confirmed in-scope for GAL's domain. Do not bulk-import — only the GenAI/AI systems questions fit. AWS ops (SageMaker, Glue, Redshift, DynamoDB, Kafka) and classical ML (bagging/boosting, feature engineering) are out of scope. Python coding prompts are wrong format entirely.

**6 questions to write (all hard, gated, with trap fields):**
- **MCP architecture** — What is MCP, how does it differ from provider-specific function calling, what is the transport layer. What's being tested: awareness of the N×M problem it solves, not just the acronym. Trap: claiming you've built a production MCP server when you haven't — honest + conceptual is the right answer.
- **AWS Bedrock AgentCore vs vanilla Bedrock** — agent runtime vs model API distinction, what AgentCore abstracts (session state, tool routing, observability). What's being tested: runtime vs model API distinction. Trap: "it's just Bedrock with agents on top" — undersells the managed runtime value. Also: conflating Bedrock Knowledge Bases (managed RAG) with AgentCore (agent orchestration).
- **Multi-provider LLM design** — provider abstraction layer, fallback routing, A/B traffic split, token logging centralized in base class. What's being tested: resilience thinking, not just API call patterns. Trap: hardcoding provider logic in every call site instead of a router/base class.
- **API failure handling + retry** — 429 rate limits, context window exceeded, provider 5xx, exponential backoff, provider priority fallback list, token cost attribution. What's being tested: production resilience, not just "I can call the API."
- **Eval metric judgment** — metric selection driven by error cost ratio (precision/recall/F1/AUC for classification, RMSE/MAE for regression, RAGAS for GenAI), not just name recall. What's being tested: judgment, not memorization. Trap: leading with accuracy alone without the imbalance caveat.
- **Production prompt engineering** — system prompt structure, few-shot placement, CoT for reasoning tasks, JSON schema + Pydantic validation, explicit fallback instructions, prompt versioning as code. What's being tested: practical judgment, not academic definitions. Trap: describing prompt engineering as "just writing good instructions."

**Also add to Interview Signal (INTERVIEW_EXPERIENCES):** One Quantiphi/consulting archetype entry with probability map data from the PDF — Bedrock 85%, MCP 75%, Python coding 90%, RAG pipeline 90%, prompt engineering 70%. Tags: rag, agents, prompt-engineering, llmops, cloud-ai. Tier: enterprise/consulting.

`Effort: S — writing only, no new schema`

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
- ~~**Concepts module: "The Training Signal — Entropy, Loss, and KL Divergence"**~~ ✅ BUILT batch-10 (`caaadb5`) — `TrainingSignalModule`: 2-tab interactive (Entropy Explorer slider with real-time surprise/gradient signal, Real Examples with 3 scenarios showing probabilities + cross-entropy + insight).

### RNN to LSTM to Transformer architectural arc (new cluster — from Naresh Edagotti post, May 2026)

A widely-shared educational post traces the full progression from RNN to LSTM to Transformer and explains why each transition was necessary — parallelism, long-range context, vanishing gradients. Covers encoder-only / decoder-only / encoder-decoder distinction. Key framing: "Transformers are not just a model choice. They are a systems-level breakthrough." The lab has transformer content but no narrative about the historical arc — why the transition happened, what each architecture hit its ceiling on, and why transformers unlocked scaling.

- ~~**GT post: "Why Transformers Won"**~~ ✅ *built May 2026 — id: why-transformers-won*
- ~~**Concepts module addition: "Sequential vs Parallel — The Architecture Transition"**~~ ✅ BUILT batch-10 (`caaadb5`) — `SequentialParallelModule`: 2-tab interactive (step-through demo showing RNN 5 sequential steps vs Transformer 1 parallel step, Architecture Arc cards for RNN/LSTM/Transformer with bottleneck labels).

### Diagnosis-sourced adaptations (new cluster — from third-party lab assessment, May 2026)

An external assessment of all three sibling labs (GAL, ML Systems Lab, PAL) for Quantiphi/Meesho interview prep identified specific gaps and strengths. Core finding on GAL: excellent for judgment simulation ("feels like a real product"), but ceiling is "weaker for proving real backend/cloud execution." Bridge formula identified: lab concept → AWS service → client architecture → tradeoffs/failure modes.

Four concrete adaptations:

- ~~**"Maps to production" callout inside existing lab scenarios**~~ ✅ BUILT — RAG Lab done sprint 36 (`2a8c0bc`). Agent Lab all 8 AGENT_FAILURE_MATRIX entries + LLM Lab all 5 SERVING_FAILURE_SCENARIOS done batch-4 (`b253405`).

- **Company-specific architecture in Company Tracks** — PrepLab Company Tracks currently asks topic questions in a company context but doesn't connect failure modes to that company's known architecture. Add a "this failure pattern at Swiggy looks like X (food catalog freshness)," "at PhonePe looks like Y (UPI retry handling)" framing to the Company Tracks drill set. The scenarios exist — the company-specific lens is the addition. Connects directly to what the diagnosis identified as PAL's generic frameworks gap.

- **Interview story construction card at scenario completion** — At the done card (after RAG Lab / Agent Lab scenarios), add a "your story" block: "You diagnosed [failure mode] → root cause [X] → fix [Y] → in production this maps to [Z]. That's your interview answer." Pure copywriting/framing, no logic. Surfaces the narrative the lab already gives the user but doesn't package. See UPGRADES.md entry.

- **One real execution artifact** — A single FastAPI + ChromaDB RAG demo repo (GitHub), linked from the RAG Lab done card with anchor text "Want to show real code? Here's the production skeleton." Addresses the "no proof of real backend execution" ceiling the diagnosis identified. Zero in-browser complexity. Just a link to a real repo.

**What NOT to build (explicit):** Do not drift toward case-study format for ML/AI engineer content. The assessment validated PAL's case format for analytics/PM roles and GAL's failure simulation format for AI engineers. These are the right mechanics for their audiences — they should not converge. See DECISIONS.md Section 4 (format integrity rule).

### DE skill stack — 3-layer model (new cluster — from anonymous DE post, May 2026)

A practitioner post frames the 2026 DE skill stack as three layers: Layer 1 (SQL, Python, data modelling, Spark, Airflow, cloud — still 80% of your value), Layer 2 (AI productivity: prompt engineering, Cursor/Claude Code fluency, AI-generated SQL verification workflows), Layer 3 (AI infrastructure: vector DBs, embedding pipelines, RAG architecture, feature stores, LLM eval and observability, cloud AI services). Key claim: most engineers obsess over Layer 2 and forget Layer 1 — that's the trap. Layer 3 is currently scarce and what gets you the next senior/staff role. The lab is effectively a Layer 3 training ground but never frames itself that way — a direct positioning opportunity.

- ~~**GT post: "The Three-Layer DE Skill Stack"**~~ ✅ *built May 2026 — id: three-layer-de-skill-stack*
- **GT post: "Layer 3 Skills for Data Engineers: Vector DBs, Embedding Pipelines, and LLM Observability"** — practical breakdown of each Layer 3 skill: when you need it, what the learning curve looks like, what production looks like. Companion piece to the 3-layer post — goes deeper on the specific skills the lab already covers.
- ~~**Learning Path: "Data Engineer to AI Engineer"**~~ ✅ *built May 2026 — 10-step path in LearningPaths.jsx*
- **Home page positioning tweak** — add one line near the hero explicitly claiming Layer 3 depth: "The lab that builds Layer 3 skills — RAG, evals, observability, agent architecture." Zero build effort, direct resonance with DEs reading that post.

### Concepts Gym — structured foundation layer (new cluster — May 2026) ✅ v1 shipped sprint 12

~~Ground Truth is a library: you read it when you need a reference. The Concepts tab is 15 good interactives with no progression, no coverage tracking, no mastery signal.~~

**Shipped (sprint 12):** `GymPanel` component with FOUNDATION/APPLICATION/PRACTICE track accordion, per-module progress bars, Start/Revisit buttons, "Next up" CTA. `gsl-concepts-mastery` localStorage. "Mark complete" button + ✓ sidebar badges. `MODULE_NEXT_STEP` lookup with lab forward pointers per module. "GYM" button in Concepts sidebar.

**Remaining (v2, lower priority now):**
- **Foundation tracks** (RAG/LLM/Agent/Eval as distinct tracks beyond the current 3 groups) — requires remapping the MODULES array
- **GT posts as concept references** — surface relevant GT posts contextually inside the Gym module view, not just lab pointers
- **Prerequisite visibility** — show "requires: Attention" before unlocking Transformer module
- **Interlinked with Labs** — every concept in the gym has a forward pointer to the lab scenario it enables. Tokenization → Context Window → RAG Lab "Missing Answer" scenario. The chain becomes explicit.

**Why this is the right architectural direction:** the current product has learning material (GT), labs (RAG Lab etc.), and assessment (PrepLab) but no structured foundation layer connecting them. The dependency graph, Concepts interactives, and GT posts are all the right raw material — what's missing is the architecture that organizes them into a progression a beginner can follow.

**Effort:** L — not a tab rename. Requires restructuring Concepts around foundation tracks, wiring the dependency graph as navigation, adding mastery/coverage tracking, and explicit lab forward pointers.

- **Foundation tracks build-out** — RAG Foundations (tokenization → embeddings → retrieval → ranking → RAG Lab), LLM Foundations (architecture → attention → sampling → serving), Agent Foundations (ReAct → tool use → memory → agent lab), Eval Foundations (metrics → LLM-as-judge → eval frameworks). *Pending.*
- **Dependency graph as navigation** — Restore the graph from Home (it was cut because it was decorative there, not because it was wrong). Wire it as the primary navigation layer in the gym. Click node → open concept. *Pending.*
- **Per-concept mastery tracking** — localStorage coverage map, shown in the graph (node color changes on completion). Gate "unlocks" on prerequisite completion. *Pending.*
- ~~**Concepts module: "The Training Signal"**~~ ✅ BUILT batch-10 (`caaadb5`). See above.
- ~~**Concepts module addition: "Sequential vs Parallel"**~~ ✅ BUILT batch-10 (`caaadb5`). See above.

### Returning user "Today" dashboard — PAL-inspired (new cluster — May 2026)

**Sprint 16 — core shipped.** `ReturningHomeView` in `Home.jsx`. Detection: `getActivityData()` reads `gsl-preplab-history`, `gsl-concepts-mastery`, `genai_visited_modules`, `genai_gt_read`. Returning users see: greeting + date header, Today section (daily tip card + date-seeded GT post card), Jump Back In (last 3 unique tabs), Progress snapshot (PrepLab stats + Concepts gym bar), Where to Next (3 quick-entry cards). Commit `6f18011`.

**Still pending (refinements, not blockers):**
- **Today's scenario card** — replace the daily tip with a specific scenario from RAG Lab / Agent Lab on a 7-day rotation. More actionable than a tip. *Pending — low priority, tip works fine for now.*
- **Jump back in precision** — surface the specific module name + "N days ago" timestamp. Currently shows tab-level only (e.g. "RAG Lab"). Requires storing last-opened module + timestamp in a separate key. *Pending.*
- **PrepLab nudge in Today** — "Your weakest topic: X. Here are 3 questions." Pulls from WeaknessHeatmap data. Currently shows aggregate stats only. *Pending.*

### Prompt Engineering Lab — new lab ✅ BUILT sprint 41 batch-B (`b93535e`)

`src/PromptLab.jsx` — 6 scenarios: regression_edit (The 11-Day Quality Drop), user_injection (The Override), few_shot_contamination (The Bad Example), structured_output_failure (The Schema Drift), temperature_miscal (The Confident Hallucinator), over_constrained (The Instruction Conflict). Each has 3 configs, outcome cards, root cause + synthesis close, PrepLab forward pointer. Shell: same split-panel pattern as RAG Lab (mobile-responsive). 4 PrepLab questions (promptlab-1/2/3/4). Wired: lazy import in App.jsx, VALID_VIEWS, routing, nav.js BUILD group (count: 6). **Pending: promptlab-5 and promptlab-6 (one per remaining scenario).**

---

### Foundation Models Lab — new lab (May 2026)

Covers fine-tuning, pretraining concepts, and model behaviour that practitioners need to understand but can't directly experience. The mechanic: configure a fine-tuning setup (data quality, LoRA rank, learning rate, epochs) → simulate the training outcome → diagnose the failure mode. All outcomes are pre-computed and triggered by config thresholds — no real model calls needed.

**Proposed scenarios (5–6):**
- **LoRA rank too low** — underfitting. Model retains general capability but doesn't learn the target behaviour. Diagnose: rank insufficient for task complexity.
- **Learning rate too high** — catastrophic forgetting. Model loses general capability while learning the new task. Diagnose: LR destroyed the base model weights.
- **Dataset contamination** — eval set leaked into training. Metrics look great; real-world quality is poor. Diagnose: benchmark overfitting.
- **Insufficient data volume** — model memorises training examples instead of generalising. Diagnose: data volume below threshold for task.
- **Misaligned training objective** — fine-tuned on the wrong proxy signal. Model optimises the metric but fails the actual task. Diagnose: metric–task mismatch.
- **Base model mismatch** — fine-tuning a model that wasn't pretrained on the right domain. Diagnose: base capability gap that fine-tuning can't close.

**Nav entry:** Under LABS, after LLM Lab.
**Concepts gym connection:** Foundation Models gym (coming soon) → this lab.
**Effort:** M–L (scenarios need convincing fake feedback loops — the main design challenge)

**Priority:** Tier 1 — distinct from LLM Lab (which covers inference/serving), covers training-time decisions

---

### Non-lab domain competence path — PrepLab coverage expansion (May 2026)

For domains that can't have a "configure and break" lab (Cloud AI Services, Multimodal, AI Safety, Data for AI, Observability), the competence-building path is: Concepts gym (mental model) + Ground Truth posts (production depth) + PrepLab questions (judgment under pressure). The path is correct in principle — it just isn't populated yet.

**What's missing:** PrepLab has thin or zero coverage on these domains. Current topic distribution is heavy on RAG/agents/evals and light on everything else.

**Needed PrepLab topic clusters (25–30 questions each):**
- **Cloud AI Services** — Bedrock vs Vertex vs Azure AI Foundry tradeoffs, managed inference economics, serverless vs dedicated, enterprise guardrails, when to use managed vs self-hosted
- **AI Safety & Alignment** — red-teaming methods, constitutional AI, RLHF vs RLAIF, jailbreak categories, bias detection, safety-helpfulness tradeoff in production
- **Data for AI** — synthetic data quality signals, fine-tuning dataset curation, annotation pipeline design, data flywheel mechanics, quality vs quantity tradeoffs
- **Multimodal** — vision-language model selection, cross-modal retrieval design, OCR pipeline failure modes, resolution/compression tradeoffs
- **Observability** — what to instrument, span tracing design, drift detection signals, eval-in-prod patterns, alert thresholds

**Also needed:** GT posts for each domain (at least 2–3 per domain) before PrepLab questions land — questions without depth resources feel unsupported.

**Effort:** L (writing-heavy — 100+ questions + 10–15 GT posts)

**Priority:** Tier 1 — this is the product's answer to "how do I build competence on domains I can't simulate." Without it, the Concepts gym rooms are placeholders with no path to applied practice.

---

### Cross-repo intelligence — what sibling labs have that we don't (May 2026)

Scan of ML Systems Lab and Product Analytics Lab (PAL/Experimentation Lab) surfaced several mechanics and features the GenAI lab is missing. Filtered for fit — excluded things that belong to the other lab's domain (Pyodide Python runtime, statistics rooms, SQL runners).

**High-value borrows — Tier 1:**

- **"Spot the Flaw" mechanic** — PAL has 12 adversarial cases where you find the flaw in a real-looking analysis (SRM, peeking, Simpson's Paradox, etc). Adapt for GenAI: show a broken RAG pipeline config, broken eval setup, or broken agent design — user finds the flaw before the reveal. Different from our current Diagnose mechanic (we build configs that break) — this is "already built, something is wrong." The LangSmith Diagnose tab we just built is the closest thing we have. Port the mechanic more broadly to RAG Lab and AgentConfigLab as an alternative entry mode.

- **Role Readiness Score** — PAL has Junior/Analyst/Senior/Staff readiness derived from PrepLab performance. Build "AI Engineer Readiness" with tiers: Familiar → Practitioner → Senior → Staff. Derived from PrepLab session scores across domains. Shown on PrepLab or a Progress page. No backend needed — localStorage.

- ~~**Weakness Heatmap**~~ ✅ *Done sprint 12 — `WeaknessHeatmapMode` in PrepLab: per-topic accuracy bars (worst-first), Hard Questions view (most-missed), empty state, Reset. Reads `gsl-preplab-history`. Shared `recordHistory` helper — TrainerMode + InterviewPrepMode both write to it.*

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

### Cross-product patterns from sibling repos (May 2026)

Both sibling products (ML Systems Lab and PAL) were fully read this session. The following items are directly portable patterns observed there that are missing here. Filtered for relevance — items marked "wrong fit" are in the skip list below.

**Tier 1 (small effort, high impact — build these soon):**

- **Fidelity badges on Lab modules** — ML Systems Lab ships `✓ Real execution` / `~ Simulated` labels on every module header. Builds user trust by being honest about what the simulator is doing vs what a real system would do. GenAI Lab modules currently present all outcomes as equivalent. Add: RAG Lab = `✓ Real scenario logic`, Agent Lab = `~ Simulated`, LLM Lab modules = `✓` where config drives real output, `~` where outcomes are pre-computed. Implementation: small label component in each lab header, 2 CSS classes. S effort. (Source: ml-systems-lab, May 2026)

- ~~**Share Session clipboard button in PrepLab**~~ ✅ Done — sprint 37 (`97360b7`). `shareScore()` function in ExamMode, copies score %, strongest/weakest topic + link to clipboard.

- ~~**Keyboard shortcuts in PrepLab Exam/Trainer modes**~~ ✅ Done — sprint 30 (`ada9b79`). 1/2/3/4 select MCQ option, Enter submits/advances.

- ~~**Streak + 4-week heatmap in returning user HomeTab view**~~ ✅ Done — batch-C (`0d7371f`). `getStreakInfo()` + `gsl-streak`/`gsl-last-visit`/`gsl-activity-YYYY-MM-DD` keys. 4×7 cyan heatmap in `ReturningHomeView`.

- **GT "Quiz Me" → direct "Practice this" linking** — PAL ships a "Practice this" link at the bottom of every Playbook article, routing directly to the most relevant case. GenAI Lab GT posts already have `related[]` arrays. The gap: no "Practice this in PrepLab" CTA at GT post end. Add a single "Drill this in PrepLab →" button per GT post that navigates to PrepLab filtered to the topic cluster matching the post tag. M effort (wiring tag → PrepLab topic filter). (Source: PAL, May 2026)

**Tier 2 (more effort, still directly portable):**

- ~~**React.lazy() + Suspense code splitting**~~ ✅ Done — all 15 heavy components lazy-loaded in App.jsx (GroundTruth, QADashboard, ConceptsApp, SystemsApp, FluencyApp, FlowsApp, AIPMApp, PlaygroundApp, CareerApp, ExploreApp, AgentsApp, ConsultationApp, PrepLabApp, LearningPathsApp, PromptLabApp).

- ~~**State-aware GT reading mode — "Revise / Learn / What's Next"**~~ ✅ Done — sprint 37c (`a37d99c`). Three reading lenses above category filter in GroundTruth.jsx. "Revise weak spots" reads `gsl-preplab-history` (topics with >40% miss rate). "What's next" reads `gsl-gt-read-[id]` + `genai_visited_modules`.

- **GT Series + Tags redesign** — ML Systems Lab Gradient tab and PAL Deep Dives both flag the same pattern: activate Series + Tags UI once post count hits 50+. GenAI Lab is at 222 posts — 4× past that threshold. Group into named series (e.g. "Production Failures", "Architecture Decisions", "Inference Stack", "Agents in Production"). Tags enable cross-series filtering. Current flat wall at 222 posts is a content graveyard — users open it, see the wall, leave. This is the GT equivalent of the structural rebuild. M-L effort (content taxonomy work + UI). (Source: ml-systems-lab + PAL, May 2026)

- **Timed exam with lock mechanic in PrepLab** — ML Systems Lab CombinatorTab and PAL both ship a timer with pause/resume + answer lock (answers locked until timer fires, simulating real exam pressure). GenAI Lab PrepLab Exam mode has no time pressure. Add: session timer selector (20/30/45 min), timer displayed in corner, answers revealed on timer end or manual submit. M effort. (Source: ml-systems-lab + PAL, May 2026)

- **"Staff Lens" reveal in PrepLab** — ML Systems Lab's StaffLayerTab shows "How a staff engineer reads this" after every scenario reveal: multi-step reasoning that models the expert thought process, not just the conclusion. PrepLab currently shows correct/wrong + explanation but doesn't model the reasoning chain. Add a `staff_lens` field to PrepLab questions (optional) — shows as an expandable panel after the explanation: "At the staff level, this is actually about..." M effort (content work for 30-50 hard questions). (Source: ml-systems-lab, May 2026)

- **Cross-lab incident scenarios** — ML Systems Lab "Production Incident" cross-tab scenarios require reasoning across multiple domains simultaneously ("Model AUC dropped, serving latency increased, what do you check first?"). GenAI Lab has siloed labs. A cross-lab scenario would require reasoning across RAG Lab + Eval Lab + Agent Lab simultaneously. Format: multi-step diagnosis, user chooses first action, sees what that reveals, chooses next. 4–6 scenarios. New tab or PrepLab scenario type. L effort — new interaction pattern. (Source: ml-systems-lab, May 2026)

- **Analytics pause — PostHog WAU baseline** — both PAL and ML Systems Lab explicitly paused feature building pending a PostHog WAU baseline. GenAI Lab has PostHog wired but no formal baseline established. Before the next major feature sprint: check if PostHog is receiving events in Vercel prod, establish WAU + module-completion funnel as baseline. This is not a feature — it's a prerequisite for making good decisions about what to build next. (Source: PAL DECISIONS.md + IDEAS.md, May 2026)

### External cold-read findings — positioning + structural (May 2026)

Source: unsolicited ChatGPT cold-read of all three repos. See Audit 38 in AUDITS.md for full findings.

**Positioning fix (done):**
- README + GitHub description updated to "production AI judgment simulator" framing. Commit `07c40f0`. Standing rule added to DECISIONS.md § 0a.

**Structural rebuild — Build/Prove/Navigate (L effort, own sprint)**
The 14-tab layout works as a collection but not as a product with a clear front door. An external viewer can identify RAG Lab as the flagship but can't immediately answer "what is the single best thing to do here?" or "what's the path for someone with an interview in 2 weeks?"

The architecture is already designed (DECISIONS.md — Structural Upgrade section): three front doors (Build / Prove / Navigate), Concepts as a foundation layer, GT as a knowledge layer with Ask as gateway, Learning Paths as connective spine. Nothing is implemented.

**Do not start this until:** PostHog WAU baseline is established and at least one full NEXT.md sprint cycle (items 1–5) is complete. Structural rebuilds on low-traffic products are rearranging furniture nobody sits in yet.

**"What this is NOT" section in README (S effort)**
Pre-empt the "too static / not real infra" skeptic with a short, confident paragraph in the README:

> "This is not a live inference platform. It doesn't call models, query vector databases, or run real eval pipelines. It simulates the decision layer — the configuration choices, failure modes, and diagnostic reasoning — which is where production AI judgment is actually built. The zero-backend constraint is intentional: scripted scenarios fail at exactly the right moment to teach. Live model outputs don't."

This costs 10 minutes and permanently deflects the most common misread. Add to README under "Key design decisions" after the Zero backend section.

**Already logged elsewhere in this file (skip — don't add again):**
- 91-day practice heatmap (mentioned at line 503) → now fully specced above as Streak + 4-week heatmap
- Bookmarks across rooms (line 501) → logged, pending
- Interview Strategy Tool consolidation → logged as PrepLab mode consolidation

**Wrong fit for GenAI Lab (do not port):**
- Pyodide live Python runner — no Python content here, +30MB bundle
- 5-zone bottom nav (Today/Practice/Read/Interview/Ask) — different architecture
- Product analytics case dossiers (Netflix/Uber) — wrong domain
- Company Tracks for India PM (Blinkit/CRED/Meesho) — PAL territory
- Verbal practice via Web Speech API — relevant for interview prep but PrepLab is MCQ-first; this is a separate mode decision, not a direct port

---

### AI Job Market Watch — side project signal engine (new cluster — May 2026)

The problem: people have zero clue which side project to build to match what employers actually want. Generic "build these 7 projects" advice dominates LinkedIn but is disconnected from live market signal. The idea: continuously watch online job postings for AI roles, extract recurring skill/tech stack requirements, and surface "here's what 300 JDs asked for this month — build something that demonstrates it." Data-driven side project recommendations tied directly to current hiring patterns, not vibes.

**Real constraint:** the lab is static/zero-backend. A live job watcher needs a scheduled scraper or external data source. This idea either lives as a separate product, or as a periodically-updated static module (curated manually from job scraping runs, refreshed monthly). The static version is buildable now; the live version is a different product entirely.

- **GT post: "What AI Job Postings Actually Ask For Right Now"** — manually scraped snapshot of 200+ AI engineering JDs: top required skills, top mentioned tools/stacks, which projects actually appear in the "nice to have" section. Updated monthly. High search intent, no good resource exists at this level of specificity.
- **Career module: "Side Project Matcher"** — static curated list: skill → what JDs are asking for → what side project demonstrates it → what module in the lab builds that skill. Updated periodically. Zero backend needed.
- **Standalone product consideration** — a live version (scheduled scraper → embedding clustering → weekly digest) is a real product. Would not live in the lab but is a natural extension of the lab's audience and thesis.

### Cold-start belief gap — positioning + onboarding (new cluster — May 2026)

GAL is doing two jobs: building career-relevance belief (for cold visitors) and serving practice (for believers). The product currently front-loads the second job. PAL avoids this — SQL Lab gives visitors an instantly recognizable, career-relevant entry within 30 seconds, no belief-building required. GAL's mechanic requires belief first. Full standing rule: DECISIONS.md Section 9.

**The conversion problem:** A cold visitor who lands on Home and sees "RAG Lab / Agent Lab" has no pre-installed reason to care. They can't connect it to "how does this make me job-ready?" without prior context. PrepLab connects to a belief everyone already has ("I need to pass interviews") — it is the correct cold-start entry. The funnel should be PrepLab → Lab, not Lab → PrepLab.

**Buildable items (in order of impact):**

- **Home page hero — market signal before mechanic** — Add one data-forward stat near the hero (above or near the headline): agentic AI engineer roles at 90K+ postings, +280% YoY. "The most in-demand AI skill is knowing why systems fail." This builds the belief that the product serves in 5 seconds without requiring the visitor to first understand what RAG Lab is. `File: Home.jsx` `Effort: S` — copy + one stat chip component
- **PrepLab as primary CTA for new visitors** — Add a "Test your readiness" CTA block on Home targeting new visitors, routing to PrepLab Exam mode. Parallel to the existing Lab door cards — not replacing them. Returns the correct cold-start path: answer a question first, then explore the labs that teach you why. `File: Home.jsx` `Effort: S`
- **"This appeared in a real interview at [company]" framing on PrepLab entries** — Any PrepLab question preview surfaced on Home, in Daily Diagnostic, or in forward pointers should include the company/interview context when known. "This scenario appeared in a Round 1 senior AI interview at Microsoft" converts a quiz into an interview drill — using pre-installed belief. `File: PrepLab.jsx data + any surface that previews questions` `Effort: S (content work — tag questions with source company)`
- **Daily Diagnostic Challenge — PrepLab question as entry hook** — A daily PrepLab question surfaced on Home (in Today section for returning users, as a teaser for cold visitors). Framed as interview challenge, not quiz. "Today's diagnostic: this exact failure mode caused a production incident at [company]." Links to the relevant lab scenario after answer reveal. `File: Home.jsx ReturningHomeView` `Effort: S-M` — uses existing PrepLab data + daily seeding pattern from GT featured post

**Source:** Product direction discussion, May 2026 — PAL SQL Lab cold-start comparison analysis.

---

## Tier 2 — High Impact, More Effort

### Fintech / Lending AI — PrepLab Company Track (elevated from skip — May 2026)

Fintech and lending have been among the earliest and densest AI adopters — production RAG systems for policy lookup, document intelligence pipelines for loan processing, credit decision AI with fairness and explainability constraints under RBI/SEBI regulatory pressure. These are not trivial domain applications — they surface real production AI system design questions that GAL's core audience (AI engineers at fintech, GCCs, and product companies) faces. Previously deprioritised as domain-specific; re-evaluated and elevated. The questions are fundamentally about AI system design in constrained, high-stakes environments — which is exactly GAL's domain.

PrepLab Company Tracks is the right container (domain-specific lens without changing core lab content). Fintech/lending as the first track — both because of audience overlap and because it has the richest production AI design constraints.

- **PrepLab Company Track: Fintech / Lending AI** — 10–15 questions covering: document intelligence pipeline design (bank statement extraction, OCR + LLM hybrid), adverse action reason code generation (explainability for credit decisions), fairness and bias testing in credit models (demographic parity, disparate impact), data residency and PII handling under Indian regulations (RBI Digital Lending Guidelines), RAG for policy lookup in lending workflows, uncertainty scoring for AI credit recommendations. `Effort: M`
- **GT post: "AI in Credit Decisioning — What the Constraints Actually Are"** — why explainability is non-negotiable (regulatory + legal liability), adverse action reason codes as a structured output problem, fairness testing as an eval design problem (not just a model problem), what "human-in-the-loop" means in a lending context (approval gate design). `Effort: S`

### Local LLM inference for agentic use — latency constraint (new cluster — from Qwen3.6-27B post, May 2026)

A practitioner running Qwen3.6-27B locally via Claude Code (4-bit quantized, Mac M-series) reported ~80 tokens/sec — fast for conversational use but a latency bottleneck for agentic loops where 10–15 tool calls chain sequentially. The insight: local model quality is no longer the blocker; throughput at agentic call rates is. The lab has serving infrastructure content (ServingInfra, decoding) but no content framing local LLMs specifically in the agentic context — when throughput matters more than quality, what architectural choices change (batching, caching, speculative decoding), and what the practical floor is for production agentic workloads. Moderate signal — Tier 2 because agentic use of local models is a niche (vs. API-hosted agents which is the primary audience), but the "latency not quality breaks local agentic systems" framing is genuine and missing.

- **GT post: "When Local LLMs Break Agentic Loops"** — throughput vs quality as distinct constraints for agentic vs conversational use, speculative decoding + KV cache reuse for agentic call patterns, practical throughput floor (tokens/sec) for sequential tool call chains, API vs local trade-off decision tree. `Effort: S`
- **Serving module callout** — add one reactive callout to the `serving` module: "Agentic throughput constraint — 10+ sequential tool calls at 80 tok/s = X second wall clock per loop." `Effort: XS`

### Datamart-backed realism — execution layer (follow-on from Tier 1 static corpus, May 2026)

Do not build these until the Tier 1 static corpus is shipped and engagement on RAG Lab / Eval Lab is measurable. See DECISIONS.md Section 7.

- **Pyodide execution for Eval Lab** — Fixed notebook (not open cells) wrapping the Tier 1 static triples. User writes `compute_ragas_score(context, answer, question)` and sees the real metric output. Same pattern as ML Systems Lab ProjectLabTab — judge checkpoints woven into a fixed cell sequence, not a blank canvas. Cold start: ~4–6 seconds first load (Pyodide WASM). Reuses static triples from Tier 1. `Effort: M`

- **Marimo companion notebooks** — Downloadable `.py` Marimo notebooks per major RAG Lab scenario (e.g. "Context Overflow", "Stale Retrieval"). User runs locally with their own API key to reproduce what the lab simulated. Zero in-browser cost — a GitHub link + download button on the done card. Marimo is NOT for in-browser use in GAL (see DECISIONS.md Section 7 — wrong tool, breaks lab frame). This is offline companion content only. `Effort: S per notebook once scenario spec exists`

### New features
- ~~**PrepLab spaced repetition**~~ ✅ *built*
- ~~**Module search**~~ ✅ *built (Systems search bar)*
- ~~**"Learning paths"**~~ ✅ *built (6 paths, Learning Paths tab)*
- **GT reading mode improvements** — Table of contents per post, estimated reading time progress indicator, related posts sidebar.

### Systems improvements
- ~~**Explore grouping**~~ ✅ *Done — DESIGN/BUILD/OPS structure applied in sprint 4.*
- ~~**Systems module search**~~ ✅ *Partially done — DESIGN/BUILD/OPS group filter pills added (sprint 4). Keyword search not built.*

### Career tab — India salary data refresh (2026)
Current salary calculator likely uses stale data. 2026 benchmarks from 1,200+ AI engineer hires across GCCs and startups in India: Junior $22–34K, Mid $45–72K, Senior $85–135K, Staff/Principal $150–240K, GenAI/LLM Specialist +35–55% premium over base band, top 1% at FAANG GCCs $280–420K. Key framing shift: senior Bangalore now earns more than median senior in Berlin or Toronto. GCCs competing at 70–80% of US comp, not 30%. Update the salary calculator bands and add the "GenAI specialist premium" as a distinct band.

### Tab keyboard shortcuts for power navigation (new cluster — from product density discussion, May 2026)

GAL has grown to the density of an amusement park — 4 Labs, 54+ Systems modules, 16 Agent Lab modules, 15 Concepts modules, 261 PrepLab questions. Power users and returning visitors know what they want to open but spend 2–3 clicks getting there. Single-character keyboard shortcuts for the primary tabs would remove this friction entirely. PrepLab already has 1/2/3/4+Enter within a session — the same pattern extended to tab-level navigation. No backend, no new state, minimal maintenance cost.

The clean, low-cost part of the "product map" idea. The keyboard shortcut layer addresses the navigation job without requiring a visual artifact that must be maintained as modules are added.

**What to build:**
- Single-key global shortcuts (when no text input is focused):
  - `R` → RAG Lab (`#rag`)
  - `A` → Agent Lab (`#agents`)
  - `E` → Eval Lab (`#systems` with Eval context)
  - `L` → LLM Lab (`#systems` with LLM context)
  - `P` → PrepLab (`#preplab`)
  - `G` → Ground Truth (`#groundtruth`)
  - `C` → Concepts (`#concepts`)
  - `?` → show keyboard shortcuts modal
- A keyboard shortcuts modal (already exists in GAL — extend it with these tab shortcuts)
- Tiny `?` hint in the sidebar footer: "Press ? for shortcuts"

**Files:** `App.jsx` — add `keydown` event listener on `window` in a `useEffect`, check `document.activeElement` is not an input/textarea before routing. Update the existing `ShortcutsModal` (or create one if not already present) to document these shortcuts.

**Effort:** `S` — extends existing keyboard shortcut infrastructure (PrepLab already has this pattern). `Maintenance: none` — tab shortcuts don't change as new modules are added.

**Source:** Product density discussion, May 2026. Assessment: the navigation value is real; the discoverability value (showing users what exists) is better addressed upstream via Home page and PrepLab entry point — not by a navigation artifact.

### Architecture
- **Split modules.jsx further** — Currently 15,012 lines (was 9,500). Could split by group: `src/systems/build.jsx`, `src/systems/ops.jsx`, `src/systems/design.jsx`. Low urgency (Vite handles it fine, Grep-first reading rule mitigates the context cost).
- ~~**Lazy loading**~~ ✅ Done — all 15 heavy tab components lazy-loaded in App.jsx.

---

## Tier 3 — Interesting, Lower Priority

### User accounts + Google login + customizable profile

Individual login (Google OAuth or email) with a personal profile section. Progress, bookmarks, PrepLab scores, War Room (or a clean version of it), recently read GT posts, active learning path — all tied to an account rather than localStorage. Profile customizable: role (engineer/PM/student), current goal (interview prep/building/transitioning), experience level.

**Why it matters:** right now progress doesn't sync across devices and is lost when localStorage is cleared. An account layer makes the lab sticky in a way that localStorage cannot. A profile also enables personalized path recommendations — "based on your goal and where you are, here's what's next."

**The constraint:** this is the single biggest violation of the zero-backend principle. Needs auth infrastructure, a database, session management — none of which exist. This is not a tab addition, it is a product architecture change. Lives here until the backend decision is made. If the product ever moves off the pure static model, this becomes Tier 1 immediately.

### Visual product map — discoverability artifact (new cluster — from product density discussion, May 2026)

The "amusement park map" idea: a visual overview of what exists across all labs and modules, with keyboard labels, so users know what they can explore. The discoverability insight behind it is real — a returning user who has only touched RAG Lab genuinely doesn't know that the Eval Lab has 15 modules, or that PrepLab has 261 questions across 5 topic clusters. The map metaphor is vivid.

**Why this is Tier 3:** The idea decomposes into two separate jobs. (1) Navigation for power users — solved more cheaply by tab keyboard shortcuts (Tier 2 above). (2) Discoverability for cold/mid-stage visitors — this is the genuine remaining job. But a visual map is the wrong solution layer for discoverability, for two reasons: a cold visitor doesn't yet know the vocabulary well enough for a map to orient them ("EvalLoopModule" on a map is opaque to someone who hasn't formed the belief that evals matter to their career), and the real discoverability problem is the belief gap — solved upstream on Home and PrepLab entry, not by a navigation artifact (see DECISIONS.md Section 9). The map would cost M-L effort and require maintenance every time a module is added. The same discoverability value is delivered at S effort by improving the Home page market signal and PrepLab cold-start journey.

**Revisit condition:** valid to build if (a) keyboard shortcuts ship and navigation friction persists, or (b) user research shows mid-stage visitors explicitly say "I didn't know X existed." Do not build speculatively.

**If built:** single-page HTML canvas or SVG, 4 lab quadrants, modules as labeled nodes, click-to-navigate. Keyboard labels shown as badges next to each node. Accessible from a `?` hint or a "See everything →" link in the sidebar. No new state needed — just a static diagram that calls `navigateTo` on click.

**Effort:** `M` to build, ongoing maintenance cost per new module added.

**Source:** Product density discussion, May 2026. Keyboard shortcuts (Tier 2) are the cleaner, lower-cost solution to the navigation half of this idea.

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
