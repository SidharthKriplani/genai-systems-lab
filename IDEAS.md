# IDEAS — Future Depth & Improvements

Prioritized backlog of ideas not yet built. Organized by effort and impact. Updated after each build session.

*Last updated: May 2026 | Current scale: 48+ Systems modules, 19 Explore, 183+ PrepLab questions, 202+ GT posts*

---

## 🔨 In Progress

Items actively being built in the current or most recent session. Move here when you start, move to Tier 1 (struck through) when done.

*Nothing in progress — pick from Tier 1 below.*

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

### Systems modules (new)
- ~~**GRPO / Agent RL Training**~~ ✅ *built May 2026*
- **Evaluation Metrics Deep-Dive** — ROUGE, BLEU, BERTScore, G-Eval, LLM-as-judge. Interactive metric comparison with example outputs. No module covers this well yet.
- **Long Context Patterns** — Needle-in-haystack, chunk-then-summarize, map-reduce. The practical engineering patterns for 100K+ token contexts.
- **AI Safety Engineering** — Jailbreak patterns, adversarial prompts, red-teaming frameworks. Different from the existing AI Red Teaming module (which is strategy) — this is implementation.
- **Vector Database Engineering** — Pinecone vs Weaviate vs pgvector vs Chroma comparison, indexing strategies, filtering, hybrid search. High-frequency production decision.
- **Prompt Injection Defense** — Attack patterns, defense strategies, prompt hardening. Rising importance as agents interact with untrusted content.

### Systems modules (depth improvements)
- **Evals Lab** — Add "write your own eval" builder: user defines metric, weights, test cases, sees score. Currently too passive.
- **Context Compaction** — Add live compaction simulator: user adjusts conversation length, sees token count, triggers compaction, sees output quality change.
- **Agent Architecture** — Add multi-agent orchestration interactive (orchestrator dispatches to workers, see the message flow). Currently only single-agent.

### Cosine similarity + vector normalisation fundamentals (small cluster — from Nishit Jain interview post, May 2026)

An AI interviewer found that candidates who claimed to have built 2-3 RAG systems couldn't explain cosine similarity pictorially — no cos θ, no angle, no vector multiplication. The lab covers RAG failure modes deeply but not the mathematical foundation of WHY similarity search works. This is a real gap: someone can follow a RAG tutorial without understanding what cosine similarity is doing or why normalisation matters.

- **PrepLab questions (3–4)** — "Explain cosine similarity pictorially and why it's used for chunk retrieval." "What is vector normalisation and why does it matter in retrieval?" "What happens to similarity scores if you skip L2 normalisation?" "Why does cosine similarity care about direction and not magnitude?" These are genuine interview-differentiating questions the lab doesn't currently test.
- **Explore module: "Cosine Similarity — The Geometry of Retrieval"** — interactive: drag two vectors in 2D space, watch the angle and cosine similarity update live, see why normalised dot product = cosine similarity, see what breaks when vectors aren't normalised. Tagged `✓ Mathematically faithful`. Fills the gap between "embeddings look like points in space" (current Embedding Space module, conceptual) and "here is the math your retrieval system runs on every query."

### Explore modules
- **Model Architecture Comparison** — Encoder-only (BERT) vs Decoder-only (GPT) vs Encoder-Decoder (T5). When to use each. Static reference table + use-case wizard.
- **Tokenizer Comparison** — BPE vs WordPiece vs SentencePiece vs tiktoken. Token counts for the same text across tokenizers. Interactive demo.
- **Hardware Reference** — A100 vs H100 vs RTX 4090 vs TPU v4: FLOPS, memory bandwidth, HBM, cost/hr. The table ML engineers actually need.

### PrepLab
- **Scenario-type questions** — Multi-turn conversational scenarios where the user debugs a failing system across 3-4 exchanges. Higher fidelity than MCQ.
- **More system design text questions** — Cover: vector DB selection, agent reliability, eval harness design, fine-tuning decision framework.

### Agent Development Kit patterns (new cluster — from LuMay AI diagram, May 2026)

The 5-layer framework (CLAUDE.md → Skills → Hooks → Subagents → Plugins) surfaces production patterns the lab doesn't teach as named concepts. The underlying ideas are tool-agnostic and interview-relevant.

- **GT post: "The Agent Memory Layer — Why CLAUDE.md Is Architecture, Not Documentation"** — CLAUDE.md as a persistent context injection mechanism. Global vs project-level. What belongs there, what doesn't, and how it shapes agent behavior at runtime. Tool-agnostic (applies to any agent framework with persistent memory).
- **GT post: "Deterministic Guardrails: Hooks vs LLM-Based Safety"** — The distinction between rule-based hooks (pre/post tool use, auto-lint, block destructive commands) and probabilistic LLM guardrails. Why you want both layers and where each fails. Hooks as the `git hooks` mental model for agents.
- **GT post: "Context Isolation in Multi-Agent Systems"** — "Main context stays clean" as a production principle. Why spawning subagents with forked context (rather than running everything in one context) prevents drift, reduces hallucination, and caps cost. No-infinite-loops constraint and why it matters.
- **Systems module: "Agent Context Architecture"** — Interactive: configure which layers your agent uses (persistent memory / skill injection / delegation / hooks), see how context size, cost, and failure modes change. Sits alongside the existing Agent Memory Types module but covers the system design level.

### AI PM career track (new cluster — from real user persona signal, May 2026)

A LinkedIn post from an AI PM aspirant breaking into Anthropic/Google/OpenAI surfaced specific content the lab is missing. The framing: "learning LLMs/RAG/prompt engineering — not to become an engineer, but to be a PM who engineers respect." This is the exact positioning the lab's AIPM track should own but currently doesn't state explicitly.

- **GT post: "What AI PM Actually Requires at Anthropic, Google, and OpenAI"** — demystify the role: what's in the JD vs what actually gets you hired, the technical bar vs PM bar distinction, what "technical enough" means at each company tier. High search intent, no good resource exists for this.
- **GT post: "The Technical Credibility Playbook for AI PMs"** — the minimum viable technical depth to earn engineer trust: what to learn (LLMs, RAG, evals), what to skip, how to ask questions in technical reviews without losing credibility. Framed for PMs, not engineers.
- **GT post: "Breaking Into AI PM: What the Job Actually Requires vs What People Think"** — common misconceptions (you need to code, you need an ML degree), what actually matters (product instincts + ability to navigate ambiguity in a fast-moving technical domain), and a realistic 6-month ramp plan. High shareability.
- **AIPM module: "What Gets You Hired at an AI-First Company"** — interactive self-assessment across: technical depth, product instincts, domain knowledge, communication, portfolio. With honest gap analysis and "study this next" output. Different from PrepLab — more directional, less exam-like.

### Type A vs Type B AI Engineer framing (new cluster — from viral post, May 2026)

A widely-shared post articulates the split between model-obsessed engineers (Type A: papers, benchmarks, loss functions) and systems-obsessed engineers (Type B: failure modes, latency, cost, monitoring). Key claims: Type B earns ~2x more ($400K+ vs $200K), enterprises are now scrambling for Type B after hiring Type A, and Type B thinking makes you better at model work too. This directly validates the lab's core thesis and surfaces specific content gaps.

- **GT post: "Type A vs Type B AI Engineers — and Why the Gap Is Widening"** — use the framing but go deeper: what each looks like on the job, real interview questions that filter for each, why enterprises now pay premium for Type B, and how to develop Type B thinking if you started as Type A. High shareability, strong search intent.
- **GT post: "Graceful Degradation: The System Design Pattern Most AI Teams Skip"** — specific Type B skill mentioned in the post. How to design AI systems that fail safely: fallback chains, confidence thresholds, silent failure detection, partial results vs hard errors. Production examples.
- **GT post: "Monitoring That Predicts Problems, Not Reports Them"** — the exact phrase from the post. Proactive vs reactive observability for LLM systems: drift detection, latency trend alerts, hallucination rate canaries, cost spike prediction. The distinction between dashboards and early warning systems.
- **Home page positioning tweak** — the lab's tagline ("configure the system and watch it fail") already signals Type B thinking. Could make this explicit: a one-line callout "This lab builds Type B thinking" near the hero. Low effort, high resonance with the target audience.
- **Career module: "Are You Type A or Type B? A Self-Assessment"** — interactive quiz across 10 dimensions (latency thinking, failure mode instinct, cost awareness, monitoring design, etc.). Shows where you are, where the market is, and which lab modules close the gap.

### DS → AI Engineer market shift (new cluster — from practitioner analysis post, May 2026)

A practitioner traced the full arc: DS peak during COVID → 90% demand drop + role fragmentation (MLE, DE, Analytics Engineer) → ChatGPT reset (0 to 10K+ GenAI listings in a year) → agentic surge (10,854% listing growth, 90K US postings). Core thesis: "what masses upskill into next depends on how much pressure a tech balance sheet can take." These numbers are real and the narrative is lived experience for most lab users. The lab has zero content contextualizing why the AI Engineer role exists structurally.

- **GT post: "How Data Scientist Became AI Engineer: The Market Forces Behind Your Job Title"** — the full arc with real numbers: DS peak, fragmentation into MLE/DE/Analytics Engineer, ChatGPT as demand reset, agentic surge. Why understanding this history makes you better at predicting what to learn next. High resonance for anyone mid-career who lived this shift.
- **GT post: "Role Fragmentation in AI: What DS Split Into and What Each Piece Pays"** — the structural split: what Analytics Engineer, ML Engineer, Data Engineer each own now, how compensation diverged, and where the generalist DS role still survives (and where it doesn't). Practical career navigation content.
- **GT post: "The Next Fragmentation: What 'AI Engineer' Will Split Into by 2027"** — apply the same analytical lens forward. Inference Engineer, Eval Engineer, Agent Reliability Engineer emerging as distinct titles. Which specializations will command premium and which will commoditize. Opinion piece with data.
- **Career module update: "Your Path: DS → MLOps → AI Engineer → What's Next"** — a career trajectory visualization showing the historical path and the current fork points. Interactive: user marks where they are, sees which Systems/Concepts modules close the gap to where they want to go.

**Positioning opportunity:** The lab is implicitly built for people living this transition. A one-line callout in the hero — "Built for engineers who made the DS → AI Engineer shift and need systems depth" — would land hard with this audience and costs nothing.

### Ground Truth posts
- ~~**"Why the Best Model on the Benchmark Isn't the Best Model for Your Product"**~~ ✅ *built May 2026 — id: benchmark-vs-business*
- ~~**"Hard Negatives: The Training Trick That Actually Improves Retrieval"**~~ ✅ *built May 2026 — id: hard-negatives-retrieval*
- **"What Actually Happens During Pretraining"** — Data curation, tokenizer training, architecture decisions, compute budget. The upstream of everything else.
- **"The Eval Crisis: Why Most AI Evals Are Wrong"** — Benchmark contamination, eval-train leakage, Goodhart's Law in AI. Opinionated take.
- **"Why Your RAG System Lies"** — Faithfulness failures, hallucination in retrieval-augmented contexts, practical mitigations.
- **Series: "The Inference Stack"** — Four posts covering the full serving pipeline: quantization → KV cache → speculative decoding → serving infrastructure. Already have individual modules, need the cohesive narrative.

### Agent memory architecture (new cluster — from practitioner infographic, May 2026)

A practitioner post correctly frames the agent memory problem as four distinct types: short-term (current context, costs explode), long-term (vector search returns similar ≠ relevant), episodic (specific past events needing exact recall, not fuzzy matching), and semantic (learned user preferences that must persist across sessions). Their production stack: Redis (hot cache, last 10 interactions) → Postgres (structured episodic memory) → Vector DB (semantic retrieval) → LLM (decides what to fetch). Key insight: the real problem isn't storage, it's decision-making — knowing when to remember vs when to forget. An agent that remembers everything is as broken as one that remembers nothing. The lab has agent loop modules but zero content on agent memory architecture — one of the first production problems you hit when building real agents.

- **GT post: "The Four Memory Problems Every Agent Has"** — short-term vs long-term vs episodic vs semantic, why each requires a different storage and retrieval strategy, why "just use a vector DB" fails for episodic recall, and why the decision layer (what to fetch, what to discard) is harder than the storage layer. Production-grounded, directly fills the gap.
- **Systems module: "Agent Memory Architecture"** — interactive: user configures a memory stack (toggle Redis / Postgres / Vector DB), runs an agent through a multi-session scenario, observes what gets remembered, what gets lost, and where retrieval breaks. Shows the "similar ≠ relevant" failure in long-term memory, the exact-recall requirement for episodic, and what happens when the agent remembers too much. Sits alongside existing Agent Loop and Multi-Agent modules.

### Prompt management as infrastructure (new cluster — from Aryan Sharma post, May 2026)

An AI/ML engineer shared how a one-line system prompt change caused a 23% quality drop for 11 days — undetected. No alert, no test, no one checking. Built PromptLab (open source, FastAPI + React + PostgreSQL) to solve it: full version history, A/B experiments, LLM-as-judge eval runs, serve-via-API. Core claim: prompts are code and deserve CI/CD treatment. The lab has zero content on prompt management as a DevOps discipline — only prompt engineering as a skill.

- **GT post: "Your Prompt Is Code. Are You Treating It Like Code?"** — the 11-day silent regression story as the hook. Version control for prompts, A/B testing prompt changes, LLM-as-judge scoring, serving via API vs hardcoding. The systems-level case for prompt management infrastructure. Directly reinforces Type B thinking.
- **GT post: "Prompt Regression Testing: How to Know When a Prompt Change Breaks Things"** — practical: what a prompt test suite looks like, what metrics to track (quality score, latency, cost), how to wire prompt testing into CI/CD. No existing lab resource covers this.
- **Systems module: "Prompt Change Management"** — interactive: user edits a system prompt, sees quality score shift, triggers regression alert. Shows A/B split, eval run, rollback decision. Sits alongside existing Evals module.

### Forward Deployed Engineer model (new cluster — from Khushboo Sharma post, May 2026)

FDE postings grew 1,165% in one year. Palantir invented the model; OpenAI built a $10B deployment business around it; Anthropic launched a $1.5B JV on the same logic; Google is hiring hundreds. 95% of enterprise AI pilots produce zero measurable returns (MIT research) — FDEs fix this by embedding inside Fortune 500s and forcing AI out of demo phase into actual workflows. Critical gap identified: intelligence accumulates in the engineer, not the system. When the FDE rotates off, clients are left with a deployment they cannot maintain or explain. 40-60% of FDE time already bleeds into admin: chasing context, bridging disconnected tools.

- **GT post: "The Forward Deployed Engineer: AI's Fastest-Growing Role Nobody's Training For"** — what the role actually is beyond the buzz, why it emerged, what it requires (systems depth + client communication + production debugging), and the dependency gap problem it creates. 1,165% posting growth gives this urgency.
- **GT post: "Institutional Knowledge as Infrastructure: Why AI Deployments Fail After the FDE Leaves"** — the dependency gap problem in depth. Reusable eval harnesses, documented workflow logic, internal playbooks as the fix. The "machine behind the machine" framing. Connects directly to the lab's evals and observability content.
- **Career module: "Is FDE Your Next Move? A Role Readiness Assessment"** — self-assessment across FDE-specific dimensions: systems depth, client-facing communication, production debugging, eval design. Gap analysis with module recommendations.

### LLM loss functions and training signals (new cluster — from Utkarsh Mangal post, May 2026)

A practitioner post in the Data Science Community frames Probability, Entropy, Cross-Entropy Loss, and KL Divergence around one unifying question: "How surprised is the model when it sees the correct answer?" Strong framing — makes the math approachable. The lab's Concepts tab covers attention and transformer architecture but has nothing on the mathematical training signal. This gap matters: engineers who understand loss functions reason better about fine-tuning decisions, RLHF reward design, and eval scoring.

- **GT post: "How Surprised Is the Model? A Practical Guide to Cross-Entropy Loss"** — probability, entropy, cross-entropy, KL divergence built up from first principles. Framed for engineers who need the intuition to make better fine-tuning and RLHF decisions — not proofs, just the model of the world that makes everything else click.
- **Concepts module: "The Training Signal — Entropy, Loss, and KL Divergence"** — interactive: user adjusts model confidence distribution, sees entropy change in real time, sees cross-entropy vs KL divergence. Sits alongside existing Attention and Transformer modules. Fills the gap between "architecture" and "training."

### RNN to LSTM to Transformer architectural arc (new cluster — from Naresh Edagotti post, May 2026)

A widely-shared educational post traces the full progression from RNN to LSTM to Transformer and explains why each transition was necessary — parallelism, long-range context, vanishing gradients. Covers encoder-only / decoder-only / encoder-decoder distinction. Key framing: "Transformers are not just a model choice. They are a systems-level breakthrough." The lab has transformer content but no narrative about the historical arc — why the transition happened, what each architecture hit its ceiling on, and why transformers unlocked scaling.

- **GT post: "Why Transformers Won: The RNN to LSTM to Transformer Arc"** — the progression as a systems story. What each architecture solved and failed at. Why transformers unlocked scaling that LSTM could not. The encoder/decoder/encoder-decoder split and when each applies. Not "transformers are better" but "here's exactly where the previous generation hit its ceiling."
- **Concepts module addition: "Sequential vs Parallel — The Architecture Transition"** — interactive visualization of token processing as sequential (RNN) vs parallel (Transformer). Show long-range dependency handling and vanishing gradient behavior. Could extend the existing Transformer module or stand as a new Explore module.

### DE skill stack — 3-layer model (new cluster — from anonymous DE post, May 2026)

A practitioner post frames the 2026 DE skill stack as three layers: Layer 1 (SQL, Python, data modelling, Spark, Airflow, cloud — still 80% of your value), Layer 2 (AI productivity: prompt engineering, Cursor/Claude Code fluency, AI-generated SQL verification workflows), Layer 3 (AI infrastructure: vector DBs, embedding pipelines, RAG architecture, feature stores, LLM eval and observability, cloud AI services). Key claim: most engineers obsess over Layer 2 and forget Layer 1 — that's the trap. Layer 3 is currently scarce and what gets you the next senior/staff role. The lab is effectively a Layer 3 training ground but never frames itself that way — a direct positioning opportunity.

- **GT post: "The Three-Layer DE Skill Stack — and Why Most Engineers Are Optimizing the Wrong One"** — the full 3-layer model with concrete examples at each layer. Why Layer 1 fundamentals are what let you tell when the AI is wrong. Why Layer 3 (RAG, vector DBs, evals, observability) is currently scarce and commands a premium. The "all three" thesis — speed without verification is dangerous, infrastructure depth without fundamentals is fragile.
- **GT post: "Layer 3 Skills for Data Engineers: Vector DBs, Embedding Pipelines, and LLM Observability"** — practical breakdown of each Layer 3 skill: when you need it, what the learning curve looks like, what production looks like. Companion piece to the 3-layer post — goes deeper on the specific skills the lab already covers.
- **Learning Path: "Data Engineer to AI Engineer"** — curated path through existing lab modules mapped to Layer 3 skills: RAG Lab → Vector DB Engineering → Evals → LLMOps Observability → Agent Architecture. Uses existing content, zero new builds required.
- **Home page positioning tweak** — add one line near the hero explicitly claiming Layer 3 depth: "The lab that builds Layer 3 skills — RAG, evals, observability, agent architecture." Zero build effort, direct resonance with DEs reading that post.

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
