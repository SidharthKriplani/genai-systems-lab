# DECISIONS — Architectural & Product Rulebook

Standing rules and principles that govern every build decision. This is a prescriptive document — it says what IS true now, not what was built when. For build history, see LINEAGE.md. For open findings, see AUDITS.md.

*Last updated: May 2026 (post sprint 34 — LangGraph + HITL shipped; scale synced)*

---

## 0. Business model — freemium (decided May 2026)

The product is currently free with an access code gate (client-side, localStorage). This is the interim monetization state: community code shared freely during beta, code becomes paid when Stripe goes live.

---

### Freemium split — standing rule

**Free tier (acquisition layer — never gate these):**
- All four Labs: RAG Lab, Agent Lab, Eval Lab, LLM Lab — every scenario, every module
- All Systems, Explore, Concepts modules
- All Ground Truth posts (224+)
- PrepLab: Exam + Trainer modes, **10 questions per session** (unlimited sessions, but gate fires mid-session at question 11)
- Interview Prep Plan: JD paste + self-rating questionnaire + skill assessment — **free**

**Gated (access code now, paid later):**
- PrepLab: all questions beyond the 10/session limit (163+ hard questions marked `gated: true` — grows with each sprint that adds hard questions)
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

### Supabase auth — mandatory event handling pattern (established sprint 54)

The `onAuthStateChange` handler in `App.jsx` **must** handle all four events. Do not simplify.

```js
onAuthChange((event, u) => {
  if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
    setUser(u);
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") setTopView(v => v === "home" ? "progress" : v);
  } else if (event === "SIGNED_OUT") {
    setUser(null); setTopView("home");
  }
});
```

**Why each event matters:**
- `SIGNED_IN` — user actively logs in (OAuth redirect or magic link)
- `INITIAL_SESSION` — fires on PAGE LOAD when session already exists (Supabase v2). Without this, every page refresh appears to log the user out. **This is the most common Supabase v2 gotcha.**
- `TOKEN_REFRESHED` — silent JWT refresh; must update user object or it goes stale
- `SIGNED_OUT` — must navigate home and clear user state

Also add a reactive belt-and-suspenders redirect:
```js
useEffect(() => { if (user && topView === "home") setTopView("progress"); }, [user, topView]);
```

`onAuthChange` in `supabase.js` must pass `(event, session)` — not just `session`. If it discards event, all four handlers break silently.

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

## 0b. Primary user — AI Builder (decided May 2026)

**The standing rule:** Every role this product serves is ultimately an AI Builder. ML engineers, AI engineers, agentic systems engineers, data scientists transitioning to AI, and AI PMs are all people who build, configure, debug, or make decisions about production AI systems. "AI Builder" is the single primary user.

**Implication for product decisions:**
- Content depth must match someone who is building or will build, not just learning about
- Interview prep (PrepLab) earns its place because builders get hired — Prove is a phase of the AI Builder journey, not a separate user
- Career + AIPM earns its place because builders navigate roles and lead products
- Content that doesn't serve a builder making production decisions doesn't belong in the primary nav

**What this rules out:** Passive learners who want GenAI literacy without building anything. The product is not for them. Content that panders to that audience (watch-this animations, listicle-style references) belongs in PARKED.md.

---

## 0c. Distribution before features (standing rule, May 2026)

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

### CSS variable elevation token system (decided May 2026, sprint 24)

**Decision:** Structural surface colors use CSS custom properties — never hardcoded zinc values for panel/sidebar/card backgrounds.

**Tokens (defined in `index.css` `:root`):**
- `--bg: #111520` — page / outermost background
- `--surface: #191e30` — sidebars, raised panels
- `--surface-2: #1f2438` — nested cards, module content areas
- `--border: #3d4668` — all structural borders (clearly visible against surfaces)
- `--border-subtle: #2a3255` — dividers, light separators
- `--color-zinc-900: #191e30` — global remap of all `bg-zinc-900` instances to surface value

**Rule:** All sidebar shells, modal wrappers, card boundaries, and header borders use these tokens. `bg-zinc-900` / `border-zinc-800` are still valid for chips, badges, code blocks, and hover fills where zinc tone is intentional.

**Why:** The prior zinc-950 (#09090b) / zinc-900 (#18181b) system had ~9 L* luminance units between bg and card — visually flat, cards didn't float. These blue-tinted darks have ~12 L* units between layers — cards are visible without shadows or gradients. Same layered elevation system as PAL (sibling product). The `--color-zinc-900` remap fixes 300+ panel backgrounds in one CSS declaration, same technique used in sprint 8 for the zinc-500/600 contrast boost.

### Ground Truth post rendering

**Decision:** All post content lives in `src/groundTruthPosts.js` as a flat JS object of typed content blocks. No markdown, no MDX.

**Block types:** `p`, `h2`, `h3`, `callout`, `code`, `list`, `table`, `lab`, `video`, `animation`, `divider`, `quote`, `references`.

**Why:** MDX requires a compilation step. A plain JS object is trivially tree-shakeable and dead-simple to extend.

### Unified question bank (PrepLab)

**Decision:** PREP_QUESTIONS array lives in `src/data/preplabQuestions.js` (extracted in sprint 31B from PrepLab.jsx), imported by PrepLab.jsx. 269+ questions as of sprint 34. Each question has: id, topic, difficulty, type (mcq|text), question, options, correct (index), keywords, explanation, readMore link. Optional fields added in sprint 31C+: `trap` (what weaker candidates say — amber callout in RevealCard), `source` (attribution), `gated` (boolean — hard questions behind access gate).

**Why:** Cross-file imports across 8 files would create tight coupling and make the question bank hard to maintain. A single self-contained bank is simpler and LLM-upgrade-friendly (swap the scorer, not the data).

---

## 3. Product decisions

### Tab structure (14 tabs)

**Current tabs:** Home, Concepts, Flows, RAG Lab, Agents, Systems, Playground, Explore, Fluency, AI Product, Career, **Ask** (Consultation), **PrepLab**, **Learning Paths**.

**Systems modules in nav:** 56 active (as of sprint 34 — `graph-rag` added sprint 33, `langgraph` added sprint 34; 3 previously removed from registry: `deploy`, `buildthis`, `abtesting-ai`). Components are kept in `modules.jsx` but not surfaced in nav — accessible only via direct link if needed.

**Ask** was added as a lightweight consultation space — keyword search over all 222+ GT posts + 57 module descriptions. Conversational UI. LLM-ready: swap the scoring function for embeddings + add a generation step without touching the UI.

**PrepLab** is in the PROVE group. Five modes: Assessment (10/20/40q timed exam with per-topic results screen), Trainer (immediate feedback + Browse/List view toggle), Interview Strategy (4-step interview brief: JD paste → role/round context → self-rate topics → gated brief output), Company Tracks (archetype-weighted drill, gated), and Weakness Heatmap (reads history localStorage, worst-topic-first view).

### PrepLab — modes

**Assessment Mode:** 10/20/40 question timed exam. All scores hidden until end. Final reveal: total score (% + correct/total + Strong/Developing/Needs Work badge), session delta vs last session, per-topic bars sorted worst-first, topic gap pointer chips (links to GT/Lab when topic score < 60%), wrong-answer review. Free gate at Q11 — users who set >10q get blurred results for the tail with GateModal.

**Trainer Mode:** Same question bank, immediate feedback after each answer. Drill or Browse/List view toggle (`viewMode` state). Browse: scrollable accordion list, each question expandable with MCQ answer highlights, trap callout, "Drill this topic →" chip. TOPIC_GROUPS filter (5 groups: RAG & Retrieval, Agents & Systems, Evals & Metrics, LLM & Fine-Tuning, Production & Ops).

**Interview Strategy (formerly "Interview Prep Plan", formerly "JD Prep Mode"):** 4-step flow. Step 1: JD paste + company name. Step 2: role type + round number + interviewer type + optional prior-round feedback. Step 3: self-rate detected topics (Weak/Okay/Strong). Step 4: gated Interview Brief output — top 3 gaps with hard Q + medium Q + trap callout per gap, prior feedback block (red), day-of checklist, Copy Brief button.

**Weakness Heatmap:** Reads `gsl-preplab-history` — per-topic accuracy bars sorted worst-first, plus "Hard Questions" view of most-missed questions.

**Company Tracks:** Role-specific drill weighted to company archetype's known interview patterns. Gated. 4 archetypes: bigtech, ainative, indiantech, enterprise. Each has topic weights and system design prompts.

**Speech support:** `window.SpeechRecognition || window.webkitSpeechRecognition` — if available, mic button appears. Transcribed text fills the answer field. Degrades gracefully to text input.

### Fidelity tagging system

Every Concepts and Explore module gets a fidelity badge:
- `✓ Mathematically faithful` — real algorithm logic (Tokenizer, Sampling)
- `~ Simplified` — correct pattern, toy scale (Attention, Transformer, Agent Loop)
- `◌ Conceptual` — illustrative only (Embedding Space, Multi-Agent)

### HowTo component

Every module opens with a `HowTo` component: what skill you're building, what the steps are. Never more than 3 steps. Sets cognitive frame before interaction.

### RAG Lab as the flagship module

Six production failure scenarios (stale retrieval, hallucination, prompt injection, context overflow, multi-hop, prompt injection via retrieval). Each scenario has 6-8 configs with detailed failure explanations and system design lessons. Most differentiated content in the app.

### Challenge Log (not "Leaderboard")

Renamed from "Leaderboard." Tracks your own pass/fail record, not rankings. "Leaderboard" implied competition the feature doesn't support.

### Ground Truth tone

"Knowledgeable colleague" voice — technically precise but not academic. Emotional hooks and real failure stories used deliberately. The goal: readers finish feeling like they've talked to someone who shipped this in production.

### Consultation Space (Search tab) — architecture

Knowledge base built client-side on first render: all 224+ GT posts (title × 3, tags × 2, desc × 1 scoring weight) + 57 module descriptions. Stopword stripping. Top 7 scored results returned. 8 suggested questions. Session conversation history.

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

---

## 5. Navigation architecture — Build / Prove / Navigate (decided May 2026)

### The three front doors

Every AI Builder is in one of three modes when they open the product:

- **Build** — configuring, debugging, learning production AI systems. RAG Lab, Agent Lab, Eval Lab, LLM Lab are all Build. This is the product's core and must be the dominant front door.
- **Prove** — preparing to demonstrate competence under interview pressure. PrepLab is the Prove front door. (This is also a phase of the Builder journey, not a separate user type.)
- **Navigate** — understanding career paths, role transitions, PM tracks. Career + AIPM are Navigate.

### Primary nav — what stays

| Group | Tabs |
|---|---|
| BUILD (4 Labs) | RAG Lab, Agent Lab, Eval Lab, LLM Lab |
| PROVE | PrepLab |
| NAVIGATE | Career, AI Product |
| KNOWLEDGE | Concepts, Ground Truth |

The KNOWLEDGE group is the foundation layer beneath all three front doors. Concepts and GT are not destinations in themselves — they are reached from Build (from lab modules) and from Prove (from PrepLab readMore links). But they remain in nav for direct access.

A fifth nav item: **Progress** — three-lane view (Build progress, Prove progress, Concepts mastery). This replaces the scattered localStorage widgets currently spread across Home and ReturningHomeView.

### What exits primary nav (hash-accessible, not surfaced)

These tabs do not earn primary nav placement under the AI Builder + interactive decision engine standard. Components remain in code, accessible via `#hash`. They are NOT deleted.

| Tab | Reason |
|---|---|
| Flows | Passive animations — anti-thesis of the interactive standard |
| Fluency | Phrase bank without coherent identity — no clear builder use case |
| Explore | Content absorbed into Build (labs cover it) — legacy destination |
| Systems | Content accessible via Labs — legacy flat module list |
| Agents | Content accessible via Agent Lab — legacy tab |
| Playground | Useful experiments but not a primary entry point — accessible via Build labs or direct hash |
| Learning Paths | Content exists but nav item is unfound — paths surface inline on Progress page instead |
| Ask/Search | Useful but not a nav-level destination — surfaces as a search bar component inside GT |

**The rule:** If a user who just arrived would not know what to do there, it doesn't belong in primary nav.

### Home page — three front-door cards

Home's primary hero block renders three cards: Build / Prove / Navigate. Each card has: a one-line outcome statement, the 1-2 tab names it leads to, and a primary CTA button. This replaces the current 6-card door grid which conflates all destinations at equal weight.

### Content schema — required fields (Phase 4 enforcement)

Every new module going forward must include:
- `fidelityBadge`: `"scenario-accurate"` or `"simulated"` (renders as FidelityBadge component in module header)
- `forwardPointer`: one GT post ID or PrepLab topic slug — single pointer, not a list

Backfill of existing modules: see NEXT.md fidelity badges task.

### Progress page — three lanes

A dedicated Progress route (`#progress`) shows:
- **Build lane:** per-lab scenario completion counts (from `genai_visited_modules`, `genai_leaderboard`)
- **Prove lane:** PrepLab per-topic accuracy bars (from `gsl-preplab-history`) — same data as WeaknessHeatmap but framed as progress, not weakness
- **Concepts lane:** gym mastery (from `gsl-concepts-mastery`) — same data as ReturningHomeView progress snapshot

ReturningHomeView retains a compact version of this (3 quick stats + CTA to full Progress page). The full Progress page is the canonical view.

*Structural rebuild history: LINEAGE.md sprint 22.*

---

## 6. Format integrity rule — do not converge with case-study format (decided May 2026)

**The standing rule:** GAL's core interaction mechanic is **failure simulation** — configure a system, watch it fail, diagnose why. This is the correct format for AI engineers and ML practitioners. It must not be replaced with or diluted toward a **case-study format** (scenario narrative → analysis → framework application), which is the correct format for product analytics and PM interview prep (as used in PAL).

**Why this matters:** A third-party assessment of all three sibling labs (GAL, ML Systems Lab, PAL) in May 2026 validated both formats as correct for their respective audiences. GAL's failure simulation produces production judgment. PAL's case studies produce decision-making judgment. These are different skills for different roles. They should not converge.

**What this rules out:**
- Do not build company-specific case studies for AI engineer content (e.g. "Swiggy's recommendation system case: what went wrong"). Case narratives belong in PrepLab Company Tracks as question context — not as the primary module mechanic.
- Do not replace any configure→fail→diagnose module with a read-then-analyze format.
- Do not add passive narrative sections as the primary content of a Systems or Agent Lab module.

**What this allows:**
- Company context *as annotation* on existing failure modes (e.g. a "In production this is: [company's known architecture]" callout on a root-cause card). This is adding production grounding to failure simulation, not replacing the mechanic.
- PrepLab Company Tracks can use question-and-scenario format because PrepLab is Prove content, not Build content. The mechanic there is appropriately a question bank with company-specific framing.
- GT posts can use narrative format — they are the knowledge layer, not interactive modules.

**Source:** Third-party lab assessment, May 2026. Confirmed by external analysis that the failure simulation format is GAL's differentiated position vs. standard AI courses and case-study products.

---

## 7. Data realism and execution — what belongs in GAL and in what order (decided May 2026)

### The core rule: static data before execution, always

"Realism through data" and "execution environment" are two separate decisions with different costs and risk profiles. They are not the same decision. Always do them in order — static data first, execution second.

**Static data (Tier 1):** A JSON corpus of documents, pre-computed similarity scores, and evaluation triples adds significant realism to RAG Lab and Eval Lab without WASM cost, cold-start latency, or execution risk. The user sees real text, reads actual retrieved chunks, watches concrete text pairs pass or fail the judge. This produces 80% of the realism gain at ~10% of the complexity cost of a live execution environment.

**Execution environment (Tier 2, conditional):** Pyodide (client-side Python WASM) is the correct tool if execution is ever needed. Fixed notebooks only — not open cells. The value is in judgment checkpoints woven into a fixed cell sequence, not in testing Python API recall. Execution only becomes worth building when: (a) static data is already shipped, (b) engagement on the data-enhanced modules is measurable, and (c) the specific judgment call requires running something the user configured.

### Marimo is the wrong tool for GAL in-browser

Marimo is a standalone reactive notebook environment — its value is exploratory iteration (change a cell, everything downstream updates). GAL's mechanic is directed (configure → fail → diagnose), not exploratory. Rendering Marimo inside the lab UI breaks the product frame: users are suddenly in a notebook, not a lab. This is the wrong experience.

Marimo is valid as offline companion content: a downloadable `.py` notebook per scenario, run locally by the user with their own API key. GitHub link + download button on the done card. Zero in-browser cost. This is the correct use of Marimo in GAL's context.

### Where real data adds realism (the correct scope)

- **RAG Lab:** rendering the actual retrieved chunks per scenario config. User reads the garbage doc that caused noise injection — not a label that says "noise injection." Stale retrieval, context overflow, and multi-hop failures all become concrete when the user can see what the retriever actually returned.
- **Eval Lab:** showing real query-answer-context triples with pre-computed LLM judge scores. User sets judge parameters and watches specific text pairs flip from pass to fail. Calibration drift is tangible on actual examples, not on abstract score movements.

### Where simulation is sufficient (do not add data)

- **Agent Lab:** failure modes are behavioral — tool loops, context overflow, delegation failures, state amnesia. No static corpus closes the gap. The failure is in the agent's action sequence, not in what the retriever returned.
- **LLM Lab:** temperature/decoding simulations (logit shapers, probability bar charts) already closely approximate what a real model would show for these judgment calls. The mechanic does not require running real inference.

### The Python boundary rule

GAL does not become a Python execution platform. There is no Python content in GAL. Pyodide is a borrowed capability for one specific narrow use case — eval metric computation in Eval Lab. It is not a general capability to be reused across modules.

If a feature idea requires Pyodide, the correct question is: "does this judgment call genuinely require running something, or would static pre-computed data serve equally well?" In most cases for GAL, static data is sufficient. Pyodide is the exception, not the default.

*Source: Architecture review session, May 2026 — evaluation of StrataScratch/PAL-style datamart approach for GAL context.*

---

## 8. Modularisation and config discipline — standing rules (decided May 2026)

### The problem this solves

The codebase grew organically. Several patterns were established correctly (NAV_GROUPS, SYSTEMS_MODULES, ragScenarios.js, CSS variable tokens), but they were not enforced uniformly. The result: some constants live in config objects, others are magic numbers buried mid-component inside 1500-line files. System-wide changes — adding a field to every PrepLab question, changing the session gate limit, updating the forward pointer card design — require hunting through multiple large files instead of editing one config location.

The goal is not "make everything pluggable" (that over-engineers a static React app). The goal is: **data out of components, system settings in config files, repeated UI patterns in shared components.** Three rules, applied incrementally — not a big-bang refactor.

### Rule 1 — New data always lives in a data file, never inline in a component

Any content that could be edited independently of rendering logic — question banks, scenario configs, GT post blocks, corpus documents, module registries — must live in a dedicated `src/data/` or standalone data file. Component files contain rendering logic and state only.

**Current violations to fix incrementally (do not refactor all at once):**
- PrepLab questions live in `PrepLab.jsx` — should move to `src/data/preplabQuestions.js`
- Inline constants scattered in `App.jsx` (SCENARIO_FORWARD_POINTERS, PRODUCTION_NOTES, etc.) — should move to `src/data/ragConfig.js` or `src/ragScenarios.js`
- New data files already planned follow this rule: `src/ragCorpus.js` (NEXT.md item 3)

**The test:** Could a content editor update the data without touching any rendering logic? If no, the data is in the wrong place.

### Rule 2 — System-wide settings live in `src/config/`

Create `src/config/` as the single source of truth for values that control product behavior and may need to change as a unit. Start with:

- `src/config/gating.js` — session limit (10q/session free), access code string, gate thresholds (30% completion for study plan), `gated: true` flag logic. Currently scattered: session counter in `PrepLab.jsx`, access code hardcoded in `utils/accessCode.js`, gate threshold inline in `InterviewPrepMode`. One file means one edit to change the business model.
- `src/config/nav.js` — `NAV_GROUPS`, `ALL_TABS`, `GROUP_COLORS`. Currently in `App.jsx`. Extracting these means adding a nav item or changing a group label without touching the 1500-line root component.
- `src/config/labs.js` — `SYSTEMS_MODULES`, `AGENTS_MODULES` registries. Currently in `Systems.jsx` and `Agents.jsx`. Same rationale.

**Do not over-extend this pattern.** Config files are for values with broad behavioral impact. Component-specific constants (a local color, a one-off label) stay in the component.

### Rule 3 — Repeated UI patterns become shared components

Any UI pattern that appears in two or more places with the same intent — forward pointer card, production note chip, Common Trap callout, fidelity badge — must be a shared component, not copy-pasted JSX. Changes to the pattern propagate everywhere without hunting.

**Components to extract (build as shared from the start, not after duplication):**
- `<ForwardPointerCard preplabTopic gtPostId />` — already exists in two forms (RAG Lab App.jsx + Agent Lab Agents.jsx). First refactor candidate.
- `<ProductionNoteChip note />` — planned for NEXT.md item 2. Build as a component, not inline JSX.
- `<CommonTrapCallout trap />` — planned in UPGRADES.md. One component, used in Trainer + Exam review.
- `<FidelityBadge tier note />` — already exists but duplicated across App.jsx / Agents.jsx / Systems.jsx. Consolidate.

**What stays bespoke:** Each lab's core interactive mechanic (RAG Lab scenario panel, Agent Lab simulator, LLM Lab decoding viz) is intentionally different. Do not force these through a shared generic component. Bespokeness at the mechanic level is a feature, not a violation of this rule.

### What this is NOT

- Not a CMS or config-driven UI generation system. The product is too small for that abstraction layer — and a generic config schema would fight the bespoke mechanics that make each lab interesting.
- Not a big-bang refactor. Apply these rules to new code immediately; migrate existing violations incrementally when touching a file for another reason.
- Not an excuse to add indirection everywhere. If extracting a constant makes the code harder to follow without a clear benefit, leave it inline.

### Enforcement

Before any new file is created or existing file is modified: ask — does new data belong in a data file? Does new config belong in `src/config/`? Is this UI pattern being duplicated? If yes to any, fix it in the same commit, not later.

*Source: Architecture review session, May 2026 — discussion of modularisation approach for system-wide change velocity.*

---

## 9. Cold-start user flow — belief gap standing rule (decided May 2026)

### The problem

GAL is doing two jobs simultaneously: (1) building the belief that breaking AI systems is career-relevant, and (2) serving the practice for people who already have that belief. The product currently front-loads the second job while the first job is unfinished for new visitors.

PAL does not have this problem. A new visitor sees the SQL Lab → instantly recognizes it → knows it matters for interviews → fires off their first query in 30 seconds. SQL has pre-installed belief. GAL's mechanic ("configure a system, watch it fail") requires the visitor to first understand WHY that matters before they can engage. No pre-installed belief exists. The visitor arrives cold, sees a "RAG Lab", and has no mental model for why this makes them hireable.

This is not a UX problem or a copy problem. It is a **belief gap**. You cannot fix it by cleaning the nav or rewriting the hero. The product must build the belief before it serves the practice.

### The standing rules

**Rule 1 — PrepLab is the correct cold-start entry point.**

PrepLab connects to a pre-existing belief that every technical job-seeker already has: "I need to pass interviews." No belief-building required. A new visitor who opens PrepLab and answers one question understands the product's value proposition instantly — they either knew the answer (good) or didn't (motivation to use the labs). The funnel should be PrepLab → Lab, not Lab → PrepLab.

The current nav order (Build first, Prove second) is the belief-building order for someone who already knows why the labs matter. It is the wrong order for a first-time visitor.

**Rule 2 — The Home page must answer "why does this make me hireable?" before any mechanic is described.**

The hero's current job is to describe what the product does ("configure a RAG pipeline"). Its correct job is to establish why it matters ("senior engineers who can diagnose production AI failures earn 40% more and are hired faster"). The market signal is concrete and available: agentic AI engineer roles are at 90K postings, +280% YoY. That number — not a mechanic description — builds belief in 5 seconds.

Copy sequence for cold visitors:
1. Market signal ("engineers who can do X are the most in-demand AI role right now")
2. What the product teaches ("you learn to diagnose production failures, not just deploy AI")
3. Where to start ("test your readiness → [PrepLab]")

**Rule 3 — The "Daily Diagnostic Challenge" format only works with interview framing.**

A PrepLab question presented as "here's a broken system" is low-engagement for a cold visitor. The same question presented as "this exact scenario appeared in a real interview at [company]" is immediately compelling. The interview framing applies the pre-installed belief ("I need to pass interviews") to the product's mechanic. Without that framing, the challenge reads as a quiz. With it, the challenge reads as interview prep — which is what the visitor already wants.

**Rule 4 — Market signal belongs on the home screen, not in a GT post.**

The agentic AI +280% YoY number (Lightcast, Stanford HAI AI Index 2026, LinkedIn Economic Graph), the salary differential between Type A and Type B engineers, the senior AI engineer interview format changes — these are belief-building signals. They belong on the home page, near the top, before the hero mechanic. They're currently buried in GT posts that cold visitors never reach.

**Rule 5 — Do not build more Lab content before fixing the cold-start funnel.**

Adding more scenarios, more GT posts, or more PrepLab questions does not fix a belief gap. A user who doesn't believe the product is relevant to their career will not engage with better content. The belief gap is a conversion problem, not a content problem. Content investments yield returns only to users who believe. Fix the funnel first.

**What this rules out:**
- Building a "welcome modal" before the Home page hero builds belief (see UPGRADES.md — the welcome modal is explicitly blocked until hero copy + cold-start belief is fixed)
- Treating the PrepLab as the "PROVE" secondary door and the Labs as the primary door for new visitors — this is correct for returning users, not first-time visitors
- Assuming that fixing navigation order, adding a tagline, or improving the visual design will convert cold visitors — the gap is not aesthetic

**What this allows:**
- Restructuring the Home page hero so market signal precedes mechanic description
- Adding a "PrepLab first" entry path as the primary CTA for new visitors (not replacing Labs, adding a parallel entry point)
- "This appeared in a real interview at [company]" framing on PrepLab question previews anywhere they surface

*Source: Product direction discussion, May 2026 — cold-start UX analysis using PAL SQL Lab as the comparison case.*

---

## §10 — Guest access model (June 2026)

Three-tier access model. Binding decisions:

**Tier definitions:**
- **Guest (no account):** Home, Plans, Profile, Progress (ghost), Foundations hub + FM Lab + Prompt Lab, 3 pinned GT posts, PrepLab demo. Everything else → sign-in gate.
- **Free (signed in):** All 5 hubs, all 6 labs, all 226 GT posts, PrepLab 10q/session. Still gated: Company Tracks, Staff Layer, Interview Strategy, Scenarios, unlimited PrepLab.
- **Full access (code):** Everything unlocked.

**Always free — never gate:**
- Foundations hub + FM Lab + Prompt Lab (the entry ramp).
- Ground Truth posts (reading is free; unlimited practice is not).
- Easy/foundational PrepLab questions within the 10q/session limit.

**Gate UX rules:**
- Single `GateOverlay` component for all lock states. Props: `context`, `user`.
- No account → sign-in gate (Google + GitHub buttons).
- Free user hitting gated content → upgrade gate ("Get full access →" + code input as secondary).
- All gates use DAI2026 for now. Pack-level or per-room codes are post-launch.
- Gate copy is contextual per room — see `GATE_COPY` in `src/GateOverlay.jsx`.

**What's deferred:**
- Device limiter (1 active session, invalidate on new device): after Stripe ships.
- Pack-level gating: post-launch, after purchase signal.
- Stripe + unique per-purchase codes: Plans page placeholder links only for now.

*Source: Access model brainstorm + implementation, June 2026 sprint 55 (`e2d96bf`).*

---

## §11 — Primary JTBD and product frame (June 2026, sprint 57 PM audit)

**The decision:** GSL's primary JTBD is **interview preparation** — specifically, helping mid-level engineers (3–6 years experience) develop production AI judgment before a FAANG-tier or AI-specialist interview. Learning mechanics (labs, concepts, GT posts) are the *delivery method* for that JTBD, not a competing purpose.

**What this means for every downstream decision:**

- The nav, homepage copy, and Plans page should lead with the interview outcome, not the learning taxonomy
- "Retrieval / Evaluation / Agents / Production / Foundations" are challenge areas because interviewers test these domains — not because they're convenient content categories
- PrepLab is the core product loop, not a supplementary quiz mode
- Content that doesn't serve a user preparing for a production AI interview belongs in PARKED.md or as a secondary entry point
- The primary ICP: **mid-level software engineer (3–6 years), transitioning into an AI engineering role, actively interviewing or 6–12 months from interviewing**

**What this does NOT rule out:**
- General learning users are welcome — the labs and GT posts serve them well
- AI PMs are a secondary ICP — PrepLab Company Tracks + Interview Prep Plan serve them directly
- Casual readers of GT posts are a distribution surface, not a conversion target

**The single framing rule (do not overwrite §0a):** §0a says "production AI judgment simulator." §11 says the primary JTBD is interview prep. These are consistent: the simulator trains judgment, the judgment gets you hired. The tagline "The gap isn't knowledge. It's production judgment." is correct — it speaks to the interview-prep user who already knows the theory but fails the scenario question.

**PAL flag:** The TRACK nav group, 3-tier access model, and hub architecture were PAL-influenced. These decisions should be validated against GSL's actual users before being treated as confirmed product decisions. PAL serves a different primary user (product analytics engineers). Until PostHog data confirms GSL user behaviour matches PAL's patterns, treat PAL comparisons as hypotheses, not evidence.

*Source: PM Product Audit, Audit 29, June 2026.*

---

## §12 — Guest activation boundary (June 2026, sprint 57 PM audit)

**The decision:** The guest experience must include one complete interactive lab scenario — specifically **RAG Lab Scenario 1 ("Missing Answer")** — ungated, no account required.

**Rationale:**
- The core mechanic (configure a real AI system, watch it fail, understand why) is GSL's single strongest differentiator
- Currently this mechanic is completely hidden behind sign-in — guests see labels and descriptions but cannot do anything
- "3 pinned GT posts + 1 PrepLab demo question" is a reading experience, not the product's product
- A user who completes one scenario and reaches the synthesis card understands what GSL is and why it's different from any other resource
- This is the correct conversion hook: experience first, account second

**Implementation rules:**
- `GUEST_ALLOWED_TABS` in App.jsx must include `"lab"` (RAG Lab)
- RAG Lab must limit guests to Scenario 1 only — remaining 5 scenarios are behind sign-in
- After scenario completion, the synthesis card CTA changes for guests: "Sign in to save your result and continue with all 6 scenarios"
- GateOverlay fires if a guest attempts Scenario 2+

**What this does NOT change:**
- All other labs (Agent, Eval, LLM, Prompt, Foundation Models) remain sign-in gated
- GT post access: 4 pinned posts remain free for guests (unchanged)
- PrepLab: demo question (1) remains; do not expand guest PrepLab access

**Why Scenario 1 specifically:** "Missing Answer" is the cleanest, fastest scenario (under 5 minutes to complete), requires no prior knowledge to engage, and demonstrates the core failure mechanic immediately. It is the product's best first impression.

*Source: PM Product Audit, Audit 29, June 2026.*

---

## §13 — Competitive positioning (June 2026, sprint 77 competitive audit)

**Full research report:** `COMPETITORS.md`. This section records binding product decisions from that research.

**The lane GSL owns:** Deep, interactive, systems-level preparation for senior AI engineer interviews. Nobody owns this lane. Dataford is the closest competitor on breadth; Hello Interview is the closest on ICP. Neither has interactive failure-simulation at depth.

**The four things that win in this category (proven, not claimed):**
1. Free interactive core — in-browser execution or simulation (DataLemur SQL = GSL labs). Done.
2. Certificate LinkedIn flywheel (Dataford's primary acquisition engine). Not yet built.
3. SSR/indexed content for organic SEO (Dataford 30K pages). Not yet built.
4. LinkedIn content cadence — educational carousels at 3–5 posts/week for 12+ months. Not started.

**Competitive moat — do not give up these:**
- The interactive config-and-fail mechanic. No competitor has this for AI systems. Hello Interview is the sleeper threat if they add it.
- Curriculum depth (300+ GT posts, 597q PrepLab, 9-post agent-production series). This is the content advantage.
- Free, no mandatory login. Lowest friction in category. Do not add a hard account wall without evidence it improves conversion.

**Counter-positioning that costs nothing:**
- Cheating tool cohort (Final Round AI, Cluely) is in legitimacy crisis as companies add proctoring. GSL's clean positioning: "earn it." Use this in copy on Plans page, cold home, PrepLab synthesis. No build required.

**What to avoid (anti-patterns confirmed by research):**
- Do not build YouTube content before a LinkedIn presence. Every successful case in this category built LinkedIn first.
- Do not optimize for content volume without interactive pull (Interview Query disproves the strategy — 9,220+ company guides, 1:40 average session, negative growth).
- Do not add Discord before the LinkedIn cadence exists. Discord retains; it does not acquire.
- Do not add paid ads. Every major platform in this category grew organically.

**Pricing decision (deferred to §0, but informed by research):**
- $89/year is the validated price point (Dataford, 10K+ users). $79/month is the "worth it if I'm interviewing now" price (Exponent).
- When paid tier launches: $9/month or $79/year. "Cheaper than 1 hour of coaching, more useful than 10."
- University B2B is a second revenue channel to revisit at 1,000+ MAU.

**Competitive monitoring cadence:**
- Hello Interview: check quarterly for interactive feature additions (sleeper threat).
- Dataford: check quarterly for AI engineering content depth push.
- Teamblind: search "best resource ai engineer interview" quarterly — appearance there is the organic signal that matters.

*Source: Multi-source competitive audit, June 2026. Full detail in COMPETITORS.md.*

---

## §14 — LinkedIn distribution rules (June 2026, sprint 78)

**Full content plan:** `LINKEDIN.md`. This section records the binding rules.

**Rule: content before product.**
Lab material goes public immediately. Product backlinks wait until the linked path is ready for strangers.

**Backlink only when a surface is:**
- manually tested
- clear within 30 seconds without explanation
- stable, no broken UX
- useful to a stranger
- has a clear next step

**Current surface classification (June 2026):**

GREEN (safe to link): home page, `/agents` `/retrieval` `/evaluation` `/production` `/foundations` `/preplab` landing pages, RAG Lab Scenario 1 (once home page guest CTA fix is shipped — see §14 fix).

YELLOW (screenshots/carousels only, no link): individual GT posts, PrepLab question cards, animated Systems modules, Learning Paths, Browse Mode.

RED (no exposure): Mastery Room, Agent/Eval/Prompt/FM Labs (require sign-in), full sidebar nav screenshots, PrepLab behind 10q gate.

**The one fix that unlocks RAG Lab as a link target:**
Add "Try a free scenario →" button on cold home page hero that routes guests directly to RAG Lab Scenario 1. Update synthesis card guest CTA to name what sign-in unlocks. One commit. See NEXT.md.

**Two pillars only (for now):** Judgment Challenges + India Insider. Other pillars deferred until these run weekly for 8 weeks.

**No links on engagement posts.** Comments/saves are the goal. A link trains the algorithm this is a traffic post and kills reach.

*Source: GSL exposure map + content plan, June 2026. Full detail in LINKEDIN.md.*

