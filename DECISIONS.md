# DECISIONS — Architectural & Product Rulebook

Standing rules and principles that govern every build decision. This is a prescriptive document — it says what IS true now, not what was built when. For build history, see LINEAGE.md. For open findings, see AUDITS.md.

*Last updated: May 2026*

---

## 0. Business model — freemium (decided May 2026)

The product is currently free with an access code gate (client-side, localStorage). This is the interim monetization state: community code shared freely during beta, code becomes paid when Stripe goes live.

---

### Freemium split — standing rule

**Free tier (acquisition layer — never gate these):**
- All four Labs: RAG Lab, Agent Lab, Eval Lab, LLM Lab — every scenario, every module
- All Systems, Explore, Concepts modules
- All Ground Truth posts (222+)
- PrepLab: Exam + Trainer modes, **10 questions per session** (unlimited sessions, but gate fires mid-session at question 11)
- Interview Prep Plan: JD paste + self-rating questionnaire + skill assessment — **free**

**Gated (access code now, paid later):**
- PrepLab: all questions beyond the 10/session limit (161 hard questions already marked `gated: true`)
- PrepLab: Company Tracks mode (role-specific tracks)
- Interview Prep Plan: the personalized study plan + sequenced module path — **gated after user completes 30% of the plan** (not upfront — let them get invested first)

**Why this split:**
The Labs are the "wow" moment — unique, interactive, no equivalent exists. Give them away entirely. PrepLab is the "get hired" tool — people pay for things that directly help them pass interviews. The Interview Prep Plan is the highest-intent feature: someone with an interview in 2 weeks pays without hesitation. Gating it at 30% completion (not upfront) means the user is already invested and mid-goal when the gate fires — highest conversion moment.

**The rule:** Free tier must feel like a real, complete product — not a demo. If a free user can't get genuine value without paying, the split is wrong.

---

### Interview Prep Plan — unified feature (formerly "JD Prep mode" + "Defense Doc")

These were two names for the same thing. Consolidated as "Interview Prep Plan." Flow:
1. **Paste JD** → parse against 11 skill categories with keyword weightage
2. **Self-rating questionnaire** → user rates each flagged skill: Weak / Okay / Strong (free)
3. **Skill assessment** → gap score = JD weight × inverse rating, role profile output (free)
4. **Personalized study plan** → 3-day / 7-day / 2-week plan sequencing GT posts + Systems modules + PrepLab clusters by gap priority (**gated after 30% completion**)

Progress tracking: auto-detect from existing localStorage data where possible — `genai_leaderboard` for RAG Lab scenario completions, `gsl-preplab-history` for PrepLab question cluster attempts. GT post reads require lightweight per-post tracking (not yet implemented). Manual checkboxes only as fallback for steps with no auto-detectable signal. Gate fires when `completedItems / totalItems >= 0.30` on combined auto + manual count.

---

### Access code gate — interim auth (until Stripe)

Client-side, localStorage. `accessGranted: true` stored on valid code entry. Community code shared freely during beta testing. Permanent UX pattern — "Enter your access code" framing feels like a community, not a paywall. When Stripe goes live: purchase generates a code, validation moves server-side. No structural UI change needed at that point.

**Community code (beta):** Set in `src/utils/accessCode.js` as `COMMUNITY_CODE`. Change here only — referenced everywhere else.

---

### When Stripe goes live (future sprint)

- Auth layer: Supabase Auth or Firebase Auth (Google OAuth, additive layer, no app rebuild)
- Payment: Stripe
- User record: Supabase (progress, subscription status) replacing localStorage
- `gated: true` markers already in PrepLab data — gate activation requires no structural change

**Alternative paths considered and rejected:**
- B2B / team licenses — requires sales, wrong stage for solo builder
- Cohort-based ($300/cohort) — requires facilitation time, Tier 2 after PMF confirmed

---

## 0a. Positioning — "production AI judgment simulator" (decided May 2026)

**The standing framing rule:** This product is a **production AI judgment simulator**, not a GenAI course, not a production infrastructure platform, not a backend system.

The phrase that survives external scrutiny: *"Interactive browser-based systems lab that simulates production AI judgment scenarios — RAG failures, inference bottlenecks, agent loops, eval design."*

Bad framing (invites the wrong skeptic): *"I built production ML/GenAI systems."*
Correct framing (hard to attack): *"I simulate production AI judgment scenarios in the browser and put the user in the decision seat."*

This distinction matters for the README, GitHub description, home page copy, and any description used in portfolios or sharing. When copy drifts back toward "AI systems platform" or "GenAI tools," correct it.

**Source:** External cold-read analysis, May 2026 — see Audit 38 in AUDITS.md.

---

## 0b. Distribution before features (standing rule, May 2026)

**The rule:** Before starting any major new feature sprint, check PostHog for WAU + module-completion funnel. If you don't know which modules real users visit and where they drop, you are building inventory with no demand signal.

The product reached feature-completeness in May 2026 (4 Labs, 222+ GT posts, 261+ PrepLab questions, freemium model, access code gate, mobile layout). The limiting factor after this point is not feature count — it is proof of use. More features without usage data is waste.

**What to check before the next major sprint:**
- Is PostHog receiving events in Vercel prod?
- WAU over the last 30 days
- Top 5 modules by visit count
- RAG Lab scenario completion rate (does anyone finish a scenario?)
- PrepLab session depth (average questions answered per session)

**Source:** PAL DECISIONS.md pattern (PAL explicitly paused feature building at this exact stage); external cold-read analysis, May 2026.

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

**Systems modules in nav:** 54 active (as of sprint 7 — 3 removed from SYSTEMS_MODULES registry: `deploy`, `buildthis`, `abtesting-ai`). Components are kept in `modules.jsx` but not surfaced in nav — accessible only via direct link if needed.

**Ask** was added as a lightweight consultation space — keyword search over all 222+ GT posts + 57 module descriptions. Conversational UI. LLM-ready: swap the scoring function for embeddings + add a generation step without touching the UI.

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

Knowledge base built client-side on first render: all 222+ GT posts (title × 3, tags × 2, desc × 1 scoring weight) + 57 module descriptions. Stopword stripping. Top 5 scored results returned. 8 suggested questions. Session conversation history.

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

### Nav cut policy — component kept, entry removed

When a module is cut from the nav (removed from SYSTEMS_MODULES / AGENTS_MODULES registries), the React component is NOT deleted from its source file. It remains in `modules.jsx` or its tab file. This is intentional:

1. The component may be reinstated without rewriting it
2. The component may be absorbed into another module (e.g. `failures` → `agentcfg`)
3. Direct `#hash/moduleId` links may still resolve

A module being cut from nav means "doesn't earn its place in navigation" — not "this code is wrong." Document cuts in AUDITS.md sprint review and LINEAGE.md build session table.

*Feature build history lives in LINEAGE.md — not duplicated here.*

### Mobile layout — standard patterns (May 2026)

These are the settled patterns for mobile layout. Apply consistently; do not invent new approaches.

**Split-panel tabs (sidebar + content):** Use `mobileSidebarOpen` boolean state (default `true`). Sidebar: `${mobileSidebarOpen ? "flex" : "hidden"} flex-col w-full lg:flex lg:w-52 lg:shrink-0`. Right panel: `${mobileSidebarOpen ? "hidden" : "flex"} flex-col lg:flex flex-1 min-w-0`. Back button at top of right panel (visible `flex lg:hidden`). Selecting a module calls `setMobileSidebarOpen(false)`; exiting calls `setMobileSidebarOpen(true)`. Applied to: RAG Lab, Agent Lab, Systems Lab, PrepLab, Explore.

**Horizontal scroll containers:** Any `overflow-x-auto` strip that clips on mobile gets a right-fade gradient overlay to signal scrollability: `<div className="absolute right-0 top-0 h-full w-10 pointer-events-none lg:hidden" style={{ background: "linear-gradient(to right, transparent, rgba(9,9,11,0.9))" }} />`. Wrap the scroll container in `relative`. Applied to: journey strip, SVG concept graph. This is the standard — apply to any new horizontal scroll strips.

**Touch targets:** All interactive buttons must have minimum `py-2.5` vertical padding. `py-1` and `py-1.5` on tappable buttons are below the 44×44px WCAG minimum. Decorative chips (non-interactive labels) are exempt.

**Contrast at low brightness:** Do not use `text-zinc-600` or `text-zinc-700` for any readable text. `text-zinc-500` is the minimum for secondary text. `text-zinc-400` is the minimum for primary body text. This is enforced globally via CSS custom property remap in `index.css` (see sprint 8).

