# DECISIONS — Architectural & Product Rulebook

Standing rules and principles that govern every build decision. This is a prescriptive document — it says what IS true now, not what was built when. For build history, see LINEAGE.md. For open findings, see AUDITS.md.

*Last updated: May 2026*

---

## 0. Business model — decision pending (May 2026)

The product is currently free, zero-backend, no login. This is a deliberate choice that has enabled fast iteration and zero operational overhead.

**The open question:** when and how to monetize.

**Recommended path** (from May 2026 audit): Freemium with PrepLab as the paid gate. Free tier keeps all interactive modules and GT posts (acquisition). Paid tier ($15/month or $99/year) gates: unlimited PrepLab, JD Prep mode, certificates, personalized gap analysis. The JD Prep mode — paste a job description, get a targeted drill — is the killer feature for monetization. Engineers prepping for Anthropic/Google interviews will pay for this.

**What this requires architecturally:**
- Auth layer (Google OAuth minimum)
- Payment processing (Stripe)
- User record (progress, subscription status) — Supabase or PlanetScale, not localStorage
- Cross-device sync

**Auth approach:** Supabase Auth or Firebase Auth work on static sites — no custom backend needed. Google OAuth, one JS import, free tier. This does NOT require rebuilding the app. It's an additive layer.

**Internal pay gate markers:** `gated: true` flag added to PrepLab questions and JD Prep mode in the data. Invisible to users, present in code. When Stripe is wired, the gate activates — no structural change needed at that point.

**This is the only decision that changes the zero-backend constraint.** Until this decision is made, the zero-backend rule stands. When the decision is made to monetize, the architecture rebuild is Tier 0 before any paid features.

**Alternative paths considered:**
- B2B / team licenses — higher ACV but requires sales. Wrong stage for a solo builder.
- Cohort-based ($300/cohort) — highest "take my money" energy but requires facilitation time. Possible Tier 2 after product-market fit.

---

## 1. Project genesis

GenAI Systems Lab was built as a portfolio and learning artifact, not as a funded product. The starting intent: an interactive tool for AI engineers and PMs to develop intuition about production AI systems — not through video or reading, but through configuration, observation, and diagnosis.

The core thesis from day one: **most AI learning resources tell you what to do. This one makes you do it and watch what happens.**

The original scope was Concepts + RAG Lab. Everything else grew organically from the question "what else does someone need to reason confidently about production AI?"

There's a second origin underneath that one: the lab was built because LinkedIn — the primary feed for AI practitioners — is dominated by engagement farming. Listicles, affiliate link dumps, "7 reasons why" carousels, course sales funnels. The good signal exists but you have to work to find it, blocking noise instead of finding value. The lab is the antidote to that: no scrolling, no dopamine loop, no passive exposure. Every module requires friction — you configure something, it breaks, you understand why. **Real learning requires friction, not just exposure.** That philosophy governs every content and design decision: if it can be passively consumed, it probably shouldn't be in the lab.

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

### Tab structure (14 tabs)

**Current tabs:** Home, Concepts, Flows, RAG Lab, Agents, Systems, Playground, Explore, Fluency, AI Product, Career, **Ask** (Consultation), **PrepLab**, **Learning Paths**.

**Ask** was added as a lightweight consultation space — keyword search over all 200+ GT posts + 57 module descriptions. Conversational UI. LLM-ready: swap the scoring function for embeddings + add a generation step without touching the UI.

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

Knowledge base built client-side on first render: all 200+ GT posts (title × 3, tags × 2, desc × 1 scoring weight) + 57 module descriptions. Stopword stripping. Top 5 scored results returned. 8 suggested questions. Session conversation history.

**LLM upgrade path:** Replace the keyword scorer with embedding similarity (Voyage AI or OpenAI `text-embedding-3-small`) + add a Claude API generation step. UI and retrieval layer stay identical.

---

---

## 4. Product quality bar (emerged from Audits 26 & 27, May 2026)

### The interactive decision engine standard

Every module — in Systems, Agents, Explore, Playground, Concepts — must meet this standard before shipping:

1. **Configure** — user sets parameters (model size, hardware, workload, config choice)
2. **Logic** — code derives an outcome from the config, not from a lookup table
3. **Outcome** — the result is specific: a recommendation, a failure mode, a cost
4. **Diagnosis** — the outcome explains WHY, not just what

A module that presents a comparison table without requiring user input is a **reference table**, not an interactive. Reference tables belong in Ground Truth posts, not in Systems/Explore/Agents modules.

This standard was implicit before May 2026. It is now explicit and governs all new module decisions.

### Tabs that earn their place

A tab earns its place if it meets ALL of:
- Has genuine depth (not surface skimmable)
- Has content unique to this lab (not just a blog post in a UI)
- Requires user friction — configuration, failure, diagnosis — not passive reading/watching
- Has a maintenance cost proportional to its value

Tabs that fail this: Flows (passive animations), Fluency (phrase bank), Ask/Search (keyword search disguised as a chatbot). See PARKED.md.

### Module endings — required forward pointer

Every module must end with at least ONE of:
- A PrepLab question on this exact topic (link by question id)
- A GT post link (the most relevant post, not a list)
- A "next module" suggestion based on natural progression

This is the "learn loop" — configure → fail → understand → test yourself. Silent module endings break the loop at its most important moment.

### Ground Truth quality bar

Every GT post must meet:
- Minimum 8 content blocks (p, h2, callout, code, list, table, refs, video)
- At least 1 `callout` block (key insight the reader should remember)
- At least 1 `refs` block (sources, papers, tools)
- Written at "knowledgeable colleague" depth — not a tutorial, not a textbook
- No AI hype ("revolutionary", "game-changing", "unprecedented")

Posts with 4-5 blocks are stubs, not posts. They dilute the corpus quality bar.

### The zero-backend constraint is a feature

The static, zero-backend architecture forces a design discipline: every interactive must be achievable with client-side logic. This produces better learning tools (no API costs, no rate limits, reproducible failures, no auth friction) and eliminates operational overhead. When a feature idea requires a backend, the correct response is to redesign the feature, not add the backend.

*Feature build history lives in LINEAGE.md — not duplicated here.*

