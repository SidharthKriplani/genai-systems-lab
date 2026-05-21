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

Topics with no coverage yet: RLHF implementation walkthrough (detailed), Constitutional AI deep dive (done), GPT-4 technical report analysis, Gemini architecture, "How I'd build X" series (AI search, code review bot, real-time document analysis), multi-agent debugging patterns.

### P11 — LLM Memory Architecture deep-dive module (Agents tab)

Currently Agent Memory module is surface-level. Needs a full interactive module covering: short-term vs. long-term vs. episodic vs. semantic vs. procedural memory, implementation patterns for each (in-context, external DB, summary compression, retrieval-augmented), library comparison (LangMem, Mem0, MemGPT), and a decision wizard ("what type of memory does your agent need?"). Inspired by awesome-llm-apps LLM memory apps section.

### P12 — Voice AI agent flow (Flows tab)

Animated pipeline: microphone → VAD (voice activity detection) → STT (Whisper) → LLM → TTS → speaker. Key production decisions: streaming at each step (don't wait for full STT before starting LLM), VAD sensitivity, word error rate, TTS latency. Applicable to any voice AI product (customer support bots, voice assistants, real-time transcription). Source: awesome-llm-apps Voice AI agents section.

### P13 — "Build This" module (new Systems or standalone tab)

End-to-end build walkthroughs for 3 production patterns: (1) Production RAG system — from ingestion schedule to eval pipeline, (2) LangGraph multi-agent — planner + retriever + synthesizer with checkpointing, (3) Eval pipeline — from trace collection to regression detection. Format: not code to copy, but architecture decisions + failure points + pseudocode + lab cross-links. Philosophy stolen from jamwithai's "one deep production project" approach.

### P14 — Incident Room expansion (Systems tab)

Current Incident Room has ~20 cases. Target 50+ organized by failure category: retrieval failure, hallucination, cost explosion, latency regression, prompt injection, context overflow, agent loop failure, embedding drift. Each case should include: symptoms, root cause, what monitoring would have caught it, the fix. High-signal for senior engineers and system design interviewers.

### P15 — Company prep tracks in PrepLab

Filter PrepLab JD Prep by company archetype: Big Tech AI (Google, Meta, Apple), AI-native startups (Anthropic, OpenAI, Perplexity, Cursor), Indian tech (Flipkart, Swiggy, Zepto AI teams), Enterprise AI (McKinsey, Accenture AI). Each track weights the 8 skill categories differently and surfaces company-specific system design prompts. Currently JD Prep is company-agnostic.

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
- 100+ interactive modules
- 140+ Ground Truth posts across 18 categories
- 57-question PrepLab question bank
- 5 RAG Lab production failure scenarios
- 30 prompt library entries
- 5 debug trace challenges
- PWA installable, offline service worker, RSS feed, sitemap with 140+ URLs

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

**140+ posts with production depth and citations.** The largest free resource specifically covering production GenAI systems — not introductory ML, not research papers, but the specific knowledge needed to build and operate real AI systems at scale.

**PrepLab as the differentiated assessment layer.** JD-aware question weighting + speech input + gap analysis is not available anywhere else for free, for this specific audience.

The positioning: *"The only place you practice diagnosing production GenAI failures before your first on-call shift."*

---

*Last updated: May 2026*
*Maintained by: Sidharth Kriplani*
