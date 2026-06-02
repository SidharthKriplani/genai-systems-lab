# UPGRADES.md — Pending Enhancements to Existing Components

This file tracks targeted improvements to components that already exist and work, but need a specific enhancement. It is **not** a backlog for new features (see IDEAS.md) and **not** a bug/quality log (see AUDITS.md). An upgrade is: existing component → clear target state → effort estimate → dependencies.

Format per entry:
- **Component** — file + module/mode name
- **Current behavior** — what it does today
- **Target behavior** — what it should do after the upgrade
- **Effort** — S / M / L (S = <2h focused session, M = 2–4h, L = multi-session)
- **Dependencies** — what must exist first
- **Priority** — Critical / High / Medium / Low
- **Status** — Pending / In Progress / Done

*Last updated: June 2026 (sprint 44 — PrepLab surgical modifications logged)*

---

## PrepLab — Three Surgical Modifications (June 2026)

Outcome of a full ideation + devil's advocate cycle. Everything that couldn't survive two rounds of critique is in IDEAS.md Retired and PARKED.md. These three are what survived.

---

### 1. Swap the reveal order — trap before answer

**Component:** `src/PrepLab.jsx` — `RevealCard` component, Exam mode + Trainer mode answer reveal

**Current behavior:** Answer reveal shows: Correct/Wrong header → Correct answer explanation → Common Trap (amber chip at bottom). The trap is an afterthought. Users skim the explanation and skip the trap entirely.

**Target behavior:** Correct/Wrong header → Trap panel first (full-width amber panel, prominent) → Correct answer explanation below → GT post forward pointer. The trap becomes the climax of the reveal, not the footnote. The answer is the confirmation, not the lesson.

**Why this survives critique:** No self-assessment, no taxonomy, no invented authority, no backend. Just reordering JSX. Backed by retrieval practice research — learning from error before seeing the correct answer builds stronger memory traces than the reverse.

**Effort:** XS — pure JSX reorder in RevealCard

**Dependencies:** None

**Priority:** High — single highest-impact change for zero build cost

**Status:** Pending

---

### 2. Free-text field before options — invitation, not gate

**Component:** `src/PrepLab.jsx` — `ExamMode` question card

**Current behavior:** Question appears, four MCQ options appear immediately. User picks an option. Recognition, not retrieval.

**Target behavior:** Question appears, a textarea appears below with placeholder "Write your answer before looking at the options — 2–3 sentences." Options appear below the textarea, always visible, never locked. No character minimum, no gate, no friction. The user who skips the textarea gets nothing extra. The user who engages gets the retrieval benefit. No theater.

**Why this survives critique:** The 40-character gate was retired (gameable, measures characters not thought). This version enforces nothing — it invites. The mechanic works through intrinsic motivation not friction. Users who want to learn use it. Users who want to review skip it. Both are valid.

**Effort:** S — add textarea above options in ExamMode question card, store attempt text in local state, show word count (not a gate, just feedback)

**Dependencies:** None

**Priority:** Medium

**Status:** Pending

---

### 3. Behavioral debrief — time-on-task, not self-report

**Component:** `src/PrepLab.jsx` — `ExamMode` session end screen

**Current behavior:** Session end shows score + per-topic accuracy bars. No signal about which questions were hardest, no forward action grounded in session data.

**Target behavior:** Score stays as hero number (users expect it — don't fight the mental model). Below it: "Questions you spent the most time on this session" — top 3 questions ranked by textarea dwell time (`Date.now()` delta from question render to option select). These are the hard ones, revealed by behavior not self-report. Each shows the question text + a CTA to re-drill. One specific forward action: "Re-drill your 3 hardest" button that starts a Trainer session scoped to those exact question IDs.

**Why this survives critique:** Behavioral signal (time-on-task) is not biased by motivated reasoning. User can't fake how long they spent. Doesn't depend on self-assessment YES/NO. Doesn't require a taxonomy. Score remains the hero so the mental model isn't fought.

**Effort:** S-M — `questionStartTime` ref in ExamMode, delta computed on option select, stored per question in session state, surfaced in results screen

**Dependencies:** Free-text field (upgrade 2) should ship first — time-on-task signal is richer if it includes textarea dwell, not just option-selection time

**Priority:** Medium

**Status:** Pending — build after upgrade 2

---

## ~~Global — Elevation Token System (PAL-parity)~~ DONE — sprint 24

**Component:** `src/index.css`, `src/App.jsx`, `src/Home.jsx`, `src/Systems.jsx`, `src/Agents.jsx`, `src/PrepLab.jsx`, `src/Concepts.jsx`

**Was:** Flat zinc-950/900/800 backgrounds with ~9 L* luminance steps between layers. Panel edges invisible. No warmth. 300+ hardcoded `bg-zinc-900` card backgrounds across all views.

**Now:** Full CSS variable elevation system matching PAL. `--bg` / `--surface` / `--surface-2` / `--border` / `--border-subtle` in `:root`. `--color-zinc-900` remapped to surface value — single declaration fixes 300+ instances. All lab sidebar shells, modals, Home door cards, and header borders use tokens. Cards float visibly against background.

**Status:** ✅ Done — sprint 24. Commits `08f4512`, `dc26961`, `4192c3a`. Standing rule in DECISIONS.md § 2.

---

## PrepLab — Mode Consolidation into Interview Strategy Tool

**Component:** `src/PrepLab.jsx` — all modes + `PREPLAB_SIDEBAR`

**Was:** 6 peer-level sidebar modes — Exam, Trainer, Interview Prep Plan, Company Tracks, Defense Doc, Weakness Heatmap. Overlapping purposes, unclear differentiation.

**Sprint A–E delivered (May 2026):** Sidebar reduced from 6→3 modes: Assess (EXAM), Interview Strategy (STRATEGY), Company Tracks (ARCHETYPE). Defense Doc and Weakness Map components kept but hidden. Interview Strategy rebuilt as 4-step Interview Brief flow (JD paste → role/round/context → self-rate topics → gated Brief output). Trainer got Browse/List View. Difficulty classification across all 261→269 questions. Per-topic assessment bars. Trap + source fields on 50+ hardest questions. Full spec in IDEAS.md → PrepLab section.

**Remaining (future sprint — the full "Interview Strategy Tool" spec):** Resume parsing (static text against skill taxonomy), day-by-day plan generation, auto-detection of completed plan items from localStorage, round-type-aware resource mix. This is the Tier 2 version of what Sprint E delivered. See IDEAS.md "Interview Strategy Tool — full personalization funnel" for the full spec.

**Effort for full spec:** L — multi-session.

**Dependencies:** Access code gate live ✅. PrepLab questions have category tags ✅. Full spec finalised ✅.

**Priority:** Medium (Sprint A–E addressed the critical consolidation; full spec is the depth upgrade)

**Status:** Partially done — Sprint A–E complete. Full "Interview Strategy Tool" spec is a future Tier 2 sprint.

---

## Career + AIPM — Navigation Consolidation into "Navigate" Branch

**Component:** `src/Career.jsx`, `src/AIPM.jsx`, `App.jsx` nav

**Current behavior:** Career (system design, take-home, salary calculator) and AI Product (PRD simulator, roadmap, PM track) are separate tabs under the GROW nav group. A PM prepping for interviews must visit both to get everything relevant. System design prep in Career, PRD skills in AIPM, interview drill in PrepLab — the same user's job is split across three tabs with no connective thread.

**Target behavior:** One "Navigate" entry point in the nav. Career and AIPM content become sections or modes within a unified experience, reached through intent — "I'm prepping for an interview" / "I'm figuring out my career path" — rather than by tool category. Salary calculator stays as a standalone utility within the same shell. The nav entry replaces both Career and AIPM tabs.

This is the same architectural fix as the pending structural rebuild (see CLAUDE.md "Structural Upgrade" section) — Career + AIPM is the Navigate branch that doesn't have a clean front door yet.

**Effort:** M-L — primarily navigation restructuring + a thin wrapper shell. Content doesn't need to change, just how it's reached.

**Dependencies:** Structural rebuild direction confirmed (CLAUDE.md). Should happen before PrepLab consolidation since both touch the GROW nav group.

**Priority:** Medium — real user friction but lower urgency than Interview Strategy consolidation.

**Status:** Pending

---

## Home.jsx — Page Simplification (cut everything that isn't converting)

**Component:** `src/Home.jsx` — all sections below the hero

**Current behavior:** Home contains: hero, stats row, door cards, concept dependency graph, learning paths, journey strip, how-to section, about section, module grid, social proof/testimonials. A first-time visitor sees everything and understands nothing. Each section answers a different question superficially; none do their job well. The welcome modal now handles routing — Home's conversion job is largely done before the user reads anything below the fold.

**Target behavior:** Home does one job — convert a cold visitor into someone who starts something.

Keep:
- Hero (fix copy separately — see hero copy entry below)
- Stats row (3 numbers — credibility signal, 5 seconds to read)
- Door cards (3 — RAG Lab, PrepLab, Ground Truth — the three real entry points)
- Social proof strip (only once real quotes exist — remove placeholder testimonials now)

Cut entirely:
- Concept dependency graph → move to Concepts tab (it belongs there, not on Home)
- Learning paths section → belongs in PrepLab as a mode, not on Home
- Journey strip → passive, no action, remove
- How-to section → move inline as first-time tooltip inside each Lab
- About section → nobody reads it on a landing page; content belongs in a GT post if anywhere
- Module grid / full content map → overwhelming, anti-conversion

**Result:** Hero → door cards → done. Below the fold: social proof strip if real quotes exist, nothing else.

**Effort:** S (pure deletion — no new components needed)

**Dependencies:**
- Welcome modal is live ✅ (handles routing for most visitors)
- Do not remove social proof placeholder until real quotes exist — just hide it if empty
- Hero copy rewrite should happen in the same pass (separate entry below)

**Priority:** High — Home is the first thing every visitor sees and currently creates confusion rather than momentum

**Status:** Pending — build after MD checkpoint

---

## Home.jsx — Hero Copy Rewrite

**Component:** `src/Home.jsx` — hero section (badge, headline, subtext, body copy)

**Current behavior:** Badge reads "Free · No login · Layer 3 AI skills". Headline is "AI systems break in production." Body copy references "reading about RAG failures" which frames the product as a RAG tool. None of these land in 5 seconds for a cold visitor.

**The root problem — belief gap (logged May 2026):** This is not purely a copy problem. There is a structural belief gap for cold visitors: GAL's mechanic ("configure a system, watch it fail") requires the visitor to first believe WHY that skill matters for their career before they can engage. The copy's job is not just to describe the product — it is to build that belief in the first 5 seconds. PAL avoids this problem entirely because SQL has pre-installed career belief. GAL must actively build it. See DECISIONS.md Section 9 for the full standing rule.

**The correct copy sequence for cold visitors:**
1. **Market signal first** — establish "this is the most in-demand AI skill right now." Concrete data: agentic AI engineer roles at 90K+ postings, +280% YoY (Lightcast, Stanford HAI AI Index 2026). Engineers who can diagnose production AI failures earn 40% more than those who can only build prototypes. This signal belongs before the mechanic description.
2. **What the product teaches** — "You learn to diagnose production failures, not just deploy AI." This frames the mechanic (configure → fail → diagnose) as the path to that career outcome.
3. **Where to start** — primary CTA for cold visitors should be PrepLab ("Test your readiness"), not a Lab. PrepLab connects to pre-installed interview belief. Lab entry makes sense for returning users.

**Specific copy changes:**
- Badge: remove "Free" (table stakes), "No login" (technical fact, not benefit), "Layer 3 AI skills" (jargon). Replace with one line that names the outcome + the market claim.
- Headline: lead with the belief signal, not the mechanic. "The most in-demand AI engineering skill is knowing why systems fail." ≤10 words, no more.
- Subtext: bridge market signal → product thesis. "Agentic AI engineer roles grew 280% last year. The gap isn't building AI — it's diagnosing production failures."
- Body: remove RAG-specific framing. Speak to the full AI pipeline — RAG, agents, evals, serving, observability. Add one CTA block: PrepLab for new visitors, RAG Lab for returning.

**Effort:** S (copy work + minor JSX restructure for CTA block)

**Dependencies:**
- DECISIONS.md Section 9 alignment on cold-start belief gap rule ✅ (done May 2026)
- Done card prominence + TYU crash fix should ship first (see UPGRADES.md RAG Lab entries) — don't guide users into a broken learn loop

**Priority:** Critical — first thing a new visitor sees. If the belief isn't built in 5 seconds, nothing else matters.

**Status:** ✅ Done — sprint 32. Commit `d8c2d11`. Market signal chip + PrepLab question card CTA + updated subtext + outcome-first door card copy.

---

## ~~RAG Lab — Done Card Prominence~~ DONE — sprint 30

**Component:** `src/App.jsx` — RAG Lab scenario result panel

**Was:** Done card appeared at bottom-of-stack, invisible without scrolling.

**Now:** Forward pointer (`✓ "You've seen the failure. What's next?"`) moved to immediately after the Failure Mode block in `App.jsx` — visible without scrolling. Pure JSX reorder, no logic changes. Commit `ada9b79`.

**Status:** ✅ Done — sprint 30.

---

## ~~RAG Lab — "Test Your Understanding" CTA Fix~~ DONE — sprint 11

**Component:** `src/App.jsx`, `src/PrepLab.jsx`

**Was:** Button crashed on click — navigated to nothing.

**Now:** `preplabInitialMode` state added to `App.jsx`. `initialMode` + `onClearInitialMode` props wired into `PrepLab.jsx`. `useEffect` auto-selects Trainer mode when navigated from RAG Lab forward pointer. Commit `327a745`.

**Status:** ✅ Done — sprint 11.

---

## Ground Truth — Quiz Depth (minimum 5 questions)

**Component:** `src/GroundTruth.jsx` — generateQuiz() + question arrays per post

**Current behavior:** GT post quiz fires with a small number of questions (fewer than 5). Feels like a checkbox, not a meaningful test of understanding.

**Target behavior:** Minimum 5 questions per quiz. Ideally 5–7. Questions should cover the full breadth of the post, not just the opening concept. The quiz should feel like real interview pressure on that topic — if you read the post carefully, you should get 4/5. If you skimmed, 2/5.

**Effort:** M (content work — writing additional questions for each post that has a quiz. Logic already exists.)

**Dependencies:** Identify which posts currently have quizzes and how many questions each has — audit needed before writing.

**Priority:** Medium

**Status:** ✅ Done — batch-I (`2fe2fe0`). generateQuiz() expanded to extract from callouts (×2), lists (×2), tables (×1), h2 headers (×1), labelled code blocks (×1). Cap raised from 3 to 7. Most posts now generate 4-7 questions.

---

## ~~PrepLab — Difficulty Levels (Easy / Medium / Hard)~~ DONE — sprint 31B/D

**Component:** `src/PrepLab.jsx` + `src/data/preplabQuestions.js`

**Was:** No difficulty classification on any questions.

**Now:** All 269 questions have `difficulty: "easy" | "medium" | "hard"`. Initial distribution (1E/37M/62H) was miscalibrated — reclassified via Python heuristics + 35 explicit hard overrides to 47E/126M/87H (18%/48%/33%). Sprint A added `border-l-4` left accent keyed by difficulty to QuestionCard. Sprint D per-topic result bars render per-difficulty breakdown. Sprint 31B extracted all questions to `src/data/preplabQuestions.js`.

**Status:** ✅ Done — sprints 31B + 31D.

---

## PrepLab — Multi-Select MCQ (Multiple Correct Answers)

**Component:** `src/PrepLab.jsx` — question format + answer validation logic

**Current behavior:** All questions are single-select MCQ (one correct answer). User clicks one option, answer is evaluated.

**Target behavior:** Questions can optionally be `type: "multi"` — user selects all correct options, then clicks "Submit." Scoring: full credit only if all correct options selected and no incorrect ones selected. UI: checkboxes instead of radio buttons for multi questions. A "Select all that apply" label signals the format to the user.

**Effort:** M (question format change + UI conditional rendering + scoring logic update)

**Dependencies:** None

**Priority:** Medium — adds real depth and closer to real interview format ("select all that apply" questions are common)

**Status:** ✅ Done — batch-E (`9c7ba18`). MCQMultiOptions component, type: "multi" schema, comma-joined answer scoring, keyboard toggle (1/2/3/4), RevealCard shows all correct answers, TrainerMode submit logic updated.

---

## Home.jsx — Goal-Based Welcome Entry (Onboarding Modal)

**Component:** `src/Home.jsx` or `src/App.jsx` — first-visit onboarding

**Current behavior:** No guided entry. Cold visitors land on Home and must orient themselves from the nav and hero copy alone.

**Target behavior:** On first visit (localStorage flag), a modal appears: "What are you here to do?" with 3 goal-based options:
- "Get interview-ready" → routes to PrepLab, Exam mode
- "Build something in production" → routes to RAG Lab, first scenario
- "Understand how it works" → routes to Ground Truth or Concepts

"Explore on my own" dismisses the modal. Choice stored in localStorage — not shown again. Optionally: choice subtly personalises the home screen (e.g. highlights the relevant lab door card).

**Why goal-based, not role-based:** Role labels (AI Engineer, DS, PM) create demographic segmentation that doesn't map cleanly to what users actually want to do. Goal labels (interview-ready, build, understand) map directly to the three real entry points the product has.

**Effort:** S (modal UI + localStorage flag + 3 routing targets — all targets already exist)

**Dependencies:**
- Hero copy rewrite should ship first (modal assumes the product is polished enough to guide users deeper)
- Done card prominence + TYU crash fix should ship first (critical Audit 34 findings — don't guide users into a broken loop)
- Routing targets must be confirmed working end-to-end before modal goes live

**Priority:** Medium — good idea, wrong timing. Build after all Audit 34 critical findings are resolved.

**Status:** ✅ Done — `WelcomeModal` component in App.jsx (line 1142). Fires once via `localStorage.getItem("genai_welcomed")` flag. 3 goal options: interview-ready → PrepLab, build in production → RAG Lab, understand how it works → Concepts. `dismissWelcome(goal)` writes flag to localStorage.

---

## Access Code Gate (Interim Auth)

**Component:** `src/utils/accessCode.js` (new) + `src/PrepLab.jsx` + `src/App.jsx`

**Current behavior:** `gated: true` markers exist on 163 PrepLab questions. No gate is active — all content is accessible to everyone.

**Target behavior:** Lightweight access code gate (client-side, localStorage) in front of gated content. Freemium split:

| Content | Free | Gated |
|---|---|---|
| All Labs (RAG, Agent, Eval, LLM) | ✓ all | — |
| Systems / Explore / Concepts | ✓ all | — |
| Ground Truth posts | ✓ all | — |
| PrepLab Exam + Trainer | ✓ 10 q/session | beyond 10 |
| PrepLab Company Tracks | — | ✓ gated |
| Interview Prep Plan (phases 1–3) | ✓ free | — |
| Interview Prep Plan (phase 4 — study plan) | ✓ first 30% | beyond 30% |

Gate UX: modal fires on first gated content access. User enters access code. On valid code: `accessGranted: true` written to localStorage, modal dismissed, never shown again. Community code: hardcoded in `src/utils/accessCode.js` as `COMMUNITY_CODE`. Single source of truth — change here only.

**Trade-off:** Client-side validation trivially bypassed by anyone reading the JS. Acceptable for community gate over free content. Not acceptable for paid content — server-side validation required when Stripe goes live.

**Effort:** S (localStorage check + gate modal component + wire into PrepLab session counter + Interview Prep Plan completion tracker)

**Dependencies:** None — build now

**Priority:** High — should be live before Batch 2 opens

**Status:** ✅ Done — implemented in earlier sprint. `isAccessGranted()` in `src/utils/accessCode.js`, community code `DAI2026`, localStorage gate. 163+ hard PrepLab questions marked `gated: true`. Company Tracks mode gated. Interview Prep Plan phase 4 gated.

---

## PrepLab — Interview Strategy Tool (partially done, full spec pending)

*Formerly called "Interview Prep Plan" / "JD Prep mode" / "Defense Doc" — consolidated as "Interview Strategy".*

**Sprint E delivered (sprint `a5af787`, May 2026):** 4-step Interview Brief flow fully rebuilt. Step 1: JD paste + company name. Step 2: role type + round number + interviewer type + optional prior-round feedback. Step 3: self-rate detected topics (Weak/Okay/Strong). Step 4: gated Interview Brief output — top 3 gaps each with hard Q + medium Q + trap callout, prior feedback block (red tint), day-of checklist, Copy Brief button. Helper functions: `generateBrief()` (ranks topics by gap score), `buildBrief()`, `copyBrief()` (markdown → clipboard).

**Full "Interview Strategy Tool" spec — still pending (Tier 2 future sprint):**

**Phase 1 — Parse + weight (free)**
JD text parsed against 11 skill categories with keyword maps. Output: role profile showing which categories are JD-critical, JD-relevant, or not mentioned. Categories:
- RAG architecture (chunking, retrieval, reranking, hybrid search)
- Evaluation design (LLM-as-judge, RAGAS, human eval, regression testing)
- Agent systems (tool use, memory, orchestration, failure modes)
- LLM fundamentals (tokenization, attention, context window, fine-tuning)
- Production/serving (latency, cost, batching, quantization, caching)
- Observability (tracing, monitoring, drift detection, alerting)
- Prompt engineering (system prompt, structured output, injection defense)
- Vector databases (index types, distance metrics, HNSW/IVF, hybrid search)
- Data pipelines (embedding pipeline, chunking strategy, data flywheel)
- Product/PM angle (metrics, tradeoffs, prioritization, stakeholder comms)
- Safety and alignment (guardrails, eval for safety, red-teaming)

**Phase 2 — Self-rating questionnaire (free)**
For each JD-flagged category, user rates readiness: Weak / Okay / Strong. Gap score = JD weight × inverse rating (Weak=3, Okay=2, Strong=1).

**Phase 3 — Skill assessment output (free)**
Role profile card: "This role is RAG-heavy, eval-critical, agent architecture optional." Top 3 gaps ranked by score. Honest gaps callout: if the JD requires a skill the lab doesn't cover, say so.

**Phase 4 — Personalized study plan (gated after 30% completion)**
Sequenced prep plan: 3-day / 7-day / 2-week options. Each day: which GT posts to read, which Systems/Explore modules to run, which PrepLab question cluster to attempt — ordered by gap priority. Gate fires when `completedItems / totalItems >= 0.30` — user is mid-goal, invested, highest conversion moment.

**Plan progress tracking — auto-detection where possible:**

**Phase 1 — Parse + weight (free)**
JD text parsed against 11 skill categories with keyword maps. Output: role profile showing which categories are JD-critical, JD-relevant, or not mentioned. Categories:
- RAG architecture (chunking, retrieval, reranking, hybrid search)
- Evaluation design (LLM-as-judge, RAGAS, human eval, regression testing)
- Agent systems (tool use, memory, orchestration, failure modes)
- LLM fundamentals (tokenization, attention, context window, fine-tuning)
- Production/serving (latency, cost, batching, quantization, caching)
- Observability (tracing, monitoring, drift detection, alerting)
- Prompt engineering (system prompt, structured output, injection defense)
- Vector databases (index types, distance metrics, HNSW/IVF, hybrid search)
- Data pipelines (embedding pipeline, chunking strategy, data flywheel)
- Product/PM angle (metrics, tradeoffs, prioritization, stakeholder comms)
- Safety and alignment (guardrails, eval for safety, red-teaming)

**Phase 2 — Self-rating questionnaire (free)**
For each JD-flagged category, user rates readiness: Weak / Okay / Strong. Gap score = JD weight × inverse rating (Weak=3, Okay=2, Strong=1).

**Phase 3 — Skill assessment output (free)**
Role profile card: "This role is RAG-heavy, eval-critical, agent architecture optional." Top 3 gaps ranked by score. Honest gaps callout: if the JD requires a skill the lab doesn't cover, say so.

**Phase 4 — Personalized study plan (gated after 30% completion)**
Sequenced prep plan: 3-day / 7-day / 2-week options. Each day: which GT posts to read, which Systems/Explore modules to run, which PrepLab question cluster to attempt — ordered by gap priority. Gate fires when `completedItems / totalItems >= 0.30` — user is mid-goal, invested, highest conversion moment.

**Plan progress tracking — auto-detection where possible (do not use manual checkboxes only):**
We already have rich localStorage data that can auto-check plan steps without user self-reporting:
- `genai_leaderboard` — RAG Lab challenge results with `scenarioId` + `passed`. Any plan step mapped to a RAG Lab scenario can be auto-checked if that scenario appears in the leaderboard with a pass.
- `gsl-preplab-history` — PrepLab question attempts keyed by question ID with `attempts` + `wrong` counts. Any plan step mapped to a PrepLab question cluster can be auto-checked when enough questions in that cluster have been attempted.
- GT post reads — not currently tracked at the post level (`genai_visited` only records tab visits). Two options: (a) add lightweight post-read tracking (`localStorage.setItem("genai_gt_read_" + postId, "true")` on post open — trivial), or (b) keep GT steps as the only manual checkboxes. Prefer option (a) — one line per post open.

Auto-detection covers ~60-70% of plan steps (all RAG Lab + PrepLab steps). GT post steps stay manual until post-read tracking is added. Gate fires on combined auto + manual completion count. This is a stronger signal than fully self-reported progress and removes friction for users who've already done the work.

**Effort:** L (multi-session — parsing logic, rating UI, gap scoring, plan generation, auto-detection wiring, gate logic)

**Dependencies:**
- Access code gate must be live before plan gate is meaningful ✅ (done)
- PrepLab questions need category tags (`cluster` field already partially populated)
- GT posts need category alignment map (infer from post IDs + existing tags)
- Optional: add GT post-read tracking (trivial — one line per post open in GroundTruth.jsx)

**Priority:** Critical — primary paid-tier differentiator. Highest-intent user in the product.

**Status:** Pending — spec finalised May 2026. Build after access code gate is live.

---

## PrepLab — Question Experience Polish

**Component:** `src/PrepLab.jsx` → Exam mode + Trainer mode question cards

**Current behavior:** Question card, correct/wrong states, and progress indicator are functional but visually flat. Correct feedback is a plain green border; wrong feedback is a plain red border. No animation. Progress bar is a static width percentage.

**Target behavior:**
- Correct answer: green flash animation + subtle confetti or pulse on the ✓ icon
- Wrong answer: explanation card expands with depth — not just "wrong", but why the correct answer is correct (already in PrepLab data as `explanation` field)
- Progress bar: smooth animated fill as questions advance
- Session end screen: actual summary (X/Y correct, weak categories, "study these next" links)

**Effort:** S (all data already exists; pure UI/animation work)

**Dependencies:** None

**Priority:** Medium

**Status:** Pending

---

## Systems/Explore — Reference Tables → Decision Engines

**Component:** `src/systems/modules.jsx` + `src/Explore.jsx` — 10–15 modules flagged in Audit 27

**Current behavior:** Several modules are comparison tables (e.g., framework X vs Y vs Z) with no user input — the user reads a table and leaves. Fails the interactive decision engine standard in DECISIONS.md Section 4.

**Target behavior:** Each flagged module gets a configuration input layer: user picks their scenario/constraints → module derives a recommendation + rationale + failure modes. The table becomes an output view, not the primary view.

**Effort:** M per module (5 modules minimum to close Audit 27 Finding 1)

**Dependencies:** Audit 27 Finding 1 — identify the 5 lowest-effort conversions first

**Priority:** Medium

**Status:** Pending

---

## GT Posts — Thin Post Expansion

**Component:** `src/groundTruthPosts.js` — 3 stub posts

**Current behavior:**
- `dpo-in-practice`: 4 blocks
- `llm-observability`: 5 blocks
- `instruction-tuning-datasets`: 5 blocks

All three are below the 8-block minimum and lack a callout block and refs section.

**Target behavior:** Each post expanded to 8+ blocks with: at least 1 callout block, 1 refs section, meaningful depth (not padding). Should meet the GT quality bar in DECISIONS.md Section 4.

**Effort:** S per post (content research + writing, ~1h each)

**Dependencies:** None

**Priority:** Low (Audit 17 Finding 5, Audit 27 Finding 3 — flagged twice, still open)

**Status:** Pending

---

## Home.jsx — Social Proof Overhaul + Testimonials Collection

**Component:** `src/Home.jsx` — testimonials section + Tally form integration

**Current behavior:** 3 unnamed testimonials ("ML Engineer · fintech startup") with no verifiable signal. Easily dismissed.

**Target behavior (Phase 1 — buildable now):**
- Remove placeholder testimonials entirely (unconvincing filler is worse than nothing).
- Add "Submit feedback" chip on Home → links to Tally.so form (rating 1–5 + free-text + optional role/company). Owner reviews Tally submissions via email notification, manually adds approved ones to `TESTIMONIALS` constant in `Home.jsx`.
- Testimonials section hidden if `TESTIMONIALS.length === 0` — never shows empty state.

**Target behavior (Phase 2 — with Stripe):** Real submission → Supabase storage → admin approval UI → live display. See IDEAS.md "Testimonials / feedback section" for full two-phase spec.

**Effort:** XS–S (Phase 1 — Tally link + remove placeholders)

**Dependencies:** Phase 1 needs no backend. Phase 2 needs Supabase (batch with Stripe).

**Priority:** Medium — placeholder testimonials actively hurt credibility. Remove them now.

**Status:** Phase 1 done — sprint 36 (`2a8c0bc`). Placeholder testimonials were already removed in sprint 10. Tally.so feedback chip added to Home footer. Phase 2 (Supabase approval UI) deferred to Stripe sprint.

---

## Home.jsx / GT / Systems — Per-Page Ratings via PostHog

**Component:** Shared `FeedbackBar` component → GT post end, Systems module done card, PrepLab session end

**Current behavior:** No rating mechanism on any individual content piece.

**Target behavior:** Small thumb up/down or 1–5 star widget at the bottom of: (1) each GT post, (2) each Systems module completion, (3) PrepLab session end screen. On submit: PostHog event `feedback_submitted { rating, page, content_type }`. No storage needed — PostHog handles it. Data tells you which modules are working, which are confusing.

**Effort:** S — one shared `FeedbackBar` component, wired to PostHog in 3 places.

**Dependencies:** PostHog already integrated (`src/analytics.js`). Zero backend needed.

**Priority:** Medium — actionable product signal with almost no build cost.

**Status:** ✅ Done — batch-D (`0e5b3ab`). FeedbackBar component in shared.jsx, wired to GT post end, PrepLab exam session end, and Systems module footer.

---

## Concepts — Full Module Text Pass (horizontal depth)

**Component:** `src/Concepts.jsx` — all 15 module components

**Context:** Concepts modules are interactive-first with almost no explanatory text. The interactives are aids; they can't be understood without text framing what the user is looking at, why it matters, and what to look for. A beginner in these concepts can interact without learning anything.

**Sprint 14 progress:** Framing text (before-the-interactive beat) added to all 15 modules across 3 passes. Commits `1f649a2`, `4539d5e`, `6d5083b`.

**Sprint 15 progress:** Gym-based UI skeleton shipped. `GymSelectorView` (5-card grid), `GymRoomView` (PAL-style sequential module cards), 3-view state machine in `ConceptsApp`. 3 active gyms (Language Models 7 modules, Retrieval 5, AI Agents 3) + 2 placeholder gyms (Evaluation, Production Systems). `MODULE_META` constant: insight teaser + time estimate per module. `GYMS` constant. Commit `e19fb27`.

**Sprint 17 progress:** GYMS expanded to 14 rooms. 9 new coming-soon rooms added: Foundation Models, Prompt Engineering, Cloud AI Services, Vector Infrastructure, Observability & Tracing, Multimodal AI, AI Safety & Alignment, AI Product Strategy, Data for AI. Each fully described with color + lab pointer. Commit `a43fffe`.

**Sprint 26 progress:** AttentionModule rebuilt as 3-tab QKV interactive (QKV Breakdown slider + Softmax Heatmap + Multi-Head Patterns). TokenizerModule BPE Algorithm tab added. ContextWindowModule "Lost in the Middle" recall heatmap tab added. Commit `86c943e`.

**Sprint 28 progress:** 4 more module depth upgrades shipped (Audit 42). TemperatureGame: "Live Logit Shaper" tab — real-time softmax on 3 prompts, temperature slider, entropy readout. RAGPipelineModule: "What Breaks" tab — 3 production failure scenarios with failure injection + diagnosis. FlashAttentionConcept: "Tile Traversal" tab — animated 5×5 tile grid, Play/Pause/Step/Reset, HBM write counter. EmbeddingModule: "Similarity Search" tab — 5 preset queries, top-k slider, cosine similarity ranked results. Commit `7f0a88d`. All brace diffs: 0.

**Remaining for all 15 modules (future pass):**
- **Inline callouts** — annotations tied to specific interactive states (e.g. "When temperature hits 0 you're always picking the top token — this is why outputs become repetitive.")
- **Synthesis close** — 1–2 sentences after the interactive: what this means for real system design decisions.

**Target per module (full pass):** ~150–300 words across 3 beats: setup framing → inline callouts → synthesis close.

**Effort:** M (most modules now have 2+ interactive tabs; remaining work is callout text + synthesis close)

**Dependencies:** None — pure writing + JSX injection.

**Priority:** High — Concepts is in primary nav. Beginners will land here.

**Status:** ✅ Done — 27 modules total, all 3-beat complete. Sprint 41 added 7 new modules (LLMAsJudge, EvalDesign, AgentToolDesign, CostLatency, Observability, FewShot, ChainOfThought) — all built with all 3 beats from the start.

---

## Concepts ↔ Labs — Bidirectional Connection

**Component:** `src/Concepts.jsx` (GYMS data), `src/App.jsx`, `src/Agents.jsx`, `src/Systems.jsx`, `src/PrepLab.jsx` — lab sidebar headers

**Current behavior:** Connection is one-directional only.
- Gym → Lab: ✓ each gym has `labId` + `labLabel`; `GymRoomView` footer renders "Ready to apply this? → [Lab]"
- Lab → Gym: ✗ no lab currently surfaces a pointer back to its relevant Concepts gym. A user struggling in RAG Lab has no path to "go learn the concepts first."

**Target behavior:** Quiet reverse pointer added to each lab's sidebar header — a single chip line reading e.g. `Concepts: Retrieval →` that navigates to the gym. Appears above the module list, never interrupts active flow. Labs not yet covered by an active gym show nothing (no broken link to a coming-soon room).

**Reverse mapping (data structure to add to `App.jsx`):**
```js
const LAB_GYM_MAP = {
  lab:         { gymId: "retrieval",       gymLabel: "Retrieval" },
  agentlab:    { gymId: "ai-agents",       gymLabel: "AI Agents" },
  llmlab:      { gymId: "language-models", gymLabel: "Language Models" },
  evallab:     { gymId: "evaluation",      gymLabel: "Evaluation" },      // coming soon — hide pointer
  systems:     { gymId: "production",      gymLabel: "Production Systems" }, // coming soon — hide pointer
  playground:  { gymId: "prompt-engineering", gymLabel: "Prompt Engineering" }, // coming soon — hide pointer
};
```
Only show the chip when the target gym is active (not `comingSoon`). Check against GYMS before rendering.

**Files to touch:** `App.jsx` (add constant, pass `onNavigate` to lab shells), `Agents.jsx`, `Systems.jsx` sidebar header, RAG Lab sidebar header in `App.jsx`, `PrepLab.jsx` sidebar header. Each is a 3–5 line addition.

**Effort:** M (4–5 files, all low-risk sidebar additions)

**Dependencies:** Gym skeleton complete (done). At least the 3 active gyms must be live before any lab pointer is worth showing.

**Priority:** Medium — gym→lab direction works; this is the return path. Matters most for beginners who land in a lab and get stuck.

**Status:** Done — shipped sprint 17 (commit `bf7cc6a`). Active gym chips in RAG Lab, Agent Lab, LLM Lab sidebars. Deep-link via `initialGym` prop + `navigateTo` gymId param. Eval Lab and Systems Lab chips deferred until their gyms go active.

---

## ~~Labs — Guiding Text Pass (all 4 labs, 49 scenarios/modules)~~ DONE — sprint 18

**Status:** Complete. All 4 labs done across 5 commits: `3f06dcc` (RAG Lab), `2ec2b19` (LLM Lab), `720d7a1` (Agent Lab), `eb30888` (Eval Lab).

**Component:** `src/App.jsx` (RAG Lab scenarios), `src/Agents.jsx` (16 Agent Lab modules), `src/systems/modules.jsx` (Eval Lab + LLM Lab modules), `src/MLCiCd.jsx`, `src/ModelRouter.jsx`, `src/InferenceOptimizer.jsx`

**Current behavior (was):** All lab modules are interactive-first with little to no explanatory text. Configuration UIs have no setup context. Failure outputs have no framing for what the user is watching. Root causes exist in RAG Lab but are thin elsewhere. No module has a synthesis close — the practitioner takeaway that turns a demo into a mental model. Labs feel like toys, not learning tools. Same disease Concepts had, 3× the scale.

**The standard — 3 beats per scenario/module, no exceptions:**

**Beat 1 — Setup framing** (before the config UI, ~80–120 words)
What the user is about to configure, why this exact configuration decision matters in production, what failure mode they're about to produce, and what specifically to pay attention to as they adjust parameters. Production-practitioner tone. Never passive voice. Never "in this module you will learn." Instead: "This is the configuration decision that breaks most RAG pipelines in their first week of production."

**Beat 2 — Inline callouts** (reactive to specific config states, 1–2 sentences per trigger)
As the user crosses a meaningful threshold, contextual text appears. Not "value is 0.3" but "at this retrieval score cutoff, you're accepting chunks that are topically adjacent but factually irrelevant — the model will fill the gap." Tied to named thresholds, not free-form. Each callout names the specific failure it's telegraphing.

**Beat 3 — Synthesis close** (after the failure reveal, 2–3 sentences max)
The design principle the failure teaches. One decision rule a practitioner would actually use. Not a summary of what happened — a conclusion about what to do differently. Example: "The fix is not a lower temperature. The fix is a confidence threshold that routes low-certainty queries to abstain rather than hallucinate. Helpfulness and groundedness trade off; the system design choice is where to draw the line."

**Total per scenario:** ~250–350 words across all 3 beats. Tight. Every word earns its place.

**Priority order and lab-by-lab scope:**

**1. RAG Lab — 6 scenarios (highest ROI, most traffic)**
`src/App.jsx` — each scenario's right panel. Root cause + suggested fix already exist from sprint 6 — these become Beat 3 material, but setup framing (Beat 1) and inline callouts (Beat 2) are completely missing. Scenarios: stale retrieval, prompt injection, missing context, context overflow, multi-hop failure, hybrid search.

**2. LLM Lab — 9 modules (some reactive callouts already exist)**
`src/systems/modules.jsx` — `decoding` has some Beat 2 from sprint 7. `serving` has failure scenarios. `moe`, `langsmith`, `quantization`, `finetune`, `alignment`, `context-compression`, `architecture` need full 3-beat treatment. Lightest lift after RAG Lab.

**3. Agent Lab — 16 modules (done screens exist, framing missing)**
`src/Agents.jsx` — done screens with PrepLab pointers exist for `simulator` + `design` from sprint 7. But setup framing is absent from all 16. `agentcfg` has failure matrix but no Beat 1. `failures`, `memory`, `tools`, `tracing`, `multiagent`, `evaluate`, `deploy-agents`, `security`, `costcontrol`, `langsmith`, `planning`, `streaming`, `humanloop` — all thin.

**4. Eval Lab — 18 modules (heaviest lift, most reference-heavy)**
`src/systems/modules.jsx` — most Eval Lab modules are closest to reference tabs. Full 3-beat pass here transforms them from readable to learnable. `evals`, `judge`, `ragas`, `hallucination`, `datasets`, `regression`, `ab-testing`, `tracing`, `monitoring`, `feedback`, `safety-eval`, `cost`, `latency`, `groundedness`, `coverage`, `custom-metrics`, `pipeline`, `productioneval`.

**Effort:** L (multi-session — minimum 4 focused sessions, one per lab)

**Dependencies:** None — pure writing + JSX injection. No new interactives needed.

**Quality bar:** After this pass, every scenario/module must be completable by someone who has never heard of the concept. They configure it, understand what they configured, watch it fail, understand why it failed, and leave with a concrete design principle. That is the standard.

**Priority:** Critical — this is the highest-priority text work on the product. Every user who bounces from a lab without learning anything is this problem.

**Status:** Pending — start with RAG Lab (6 scenarios, 1 session)

---

## Labs — "What's Next" Card Redesign (forward pointer pattern)

**Component:** `src/App.jsx` (RAG Lab), `src/Agents.jsx`, `src/systems/modules.jsx` — scenario/module bottom sections

**Current behavior:** RAG Lab has a "YOU'VE SEEN THE FAILURE. WHAT'S NEXT?" card at the bottom right of the scenario panel — two small buttons: Test your understanding (PrepLab) + Read the full breakdown (GT post). The card is visually insignificant. It sits in a corner competing with root cause, suggested fix, system design lesson, and feedback prompt — six elements fighting for attention. The most important CTA on the page (next step) has the least visual weight. Agent Lab has PrepLab pointers on done screens only. Eval Lab and LLM Lab have minimal or no forward pointers.

**Target behavior:** The forward pointer becomes the deliberate final beat of every scenario — not a corner widget but a full-width conclusion section. Positioned after the synthesis close (Beat 3 from the guiding text pass). Design: a horizontal divider, a clear heading ("You've diagnosed this. Where does it take you?"), then two full-width CTA cards side by side — PrepLab (test judgment under pressure) + GT post (go deeper on the concept). The cards should have enough visual weight to feel like a conclusion, not an afterthought. Same component, consistent across all labs.

**Implementation note:** Build as a shared `<WhatNextCard>` component that accepts `preplabTopic` and `gtPostId` props. Slot it at the bottom of every scenario/module after the synthesis close. Replaces the current ad-hoc corner card in RAG Lab.

**Effort:** M (component build = S; wiring across all labs = M)

**Dependencies:** Guiding text pass should happen first — the card reads as a conclusion to the synthesis close. Without Beat 3 text, the card still feels disconnected.

**Priority:** High — but blocked on guiding text pass for full effect.

**Status:** Pending

---

## Global — Font + Color Scheme Audit

**Component:** `src/index.css` + all `.jsx` files — typography and color token usage

**Current behavior:** Tailwind zinc-* palette is enforced but no systematic font stack decision has been made. No audit has been run on whether the chosen typeface, size scale, weight scale, and line-height hierarchy are optimal for a dense technical learning interface. Some components may be drifting from the palette or using ad-hoc font-size/weight combinations.

**Target behavior:**
- Explicit font stack decision documented and applied globally: one heading face, one body/UI face, one monospace face (for code blocks + token visualizers). All three locked in `index.css` / Tailwind config.
- Size + weight scale reviewed: headings, body, labels, captions, code — each has a consistent rule, not per-component guesswork.
- Color token audit: every zinc-* usage checked for contrast (WCAG AA at minimum on dark bg). Any ad-hoc `gray-*` or `slate-*` remnants caught and replaced.
- Result documented in a short design-token reference block inside `index.css` (comments, not runtime code).

**Effort:** M (audit + decision = 1h; sweep implementation = 1–2h)

**Dependencies:** None. Run after interviews — low urgency, high polish impact.

**Priority:** Medium — the product works without this; it matters for first impressions and credibility.

**Status:** Partially done — color token system shipped sprint 24 (elevation tokens + zinc-900 remap cover the color audit portion). Remaining: explicit font stack decision, size/weight scale documentation in index.css comments.

---

## ~~PrepLab — "Common Trap" Layer on Question Answers~~ DONE — sprint 31C

**Component:** `src/PrepLab.jsx`, `src/data/preplabQuestions.js`, `src/shared.jsx`

**Was:** No trap field on any question. No amber callout in RevealCard.

**Target behavior:** Add a `trap` field to question objects: a 1–2 sentence description of the most common wrong answer pattern — what a candidate says who knows the topic superficially but hasn't worked with it in production. Displayed after the explanation, in an amber-tinted callout block: "Common trap: [text]." This is the single highest-leverage field addition for interview prep — knowing what not to say is often more valuable than knowing the correct answer.

**Example:**
```js
{
  id: "rag-3",
  question: "What is the difference between a bi-encoder and a cross-encoder?",
  options: [...],
  correct: 1,
  explanation: "Bi-encoders embed query and document independently...",
  trap: "Saying a cross-encoder is 'just a reranker'. Interviewers want to hear full-attention pair scoring vs. independent embedding lookup — and when each is appropriate."
}
```

**Implementation:**
- Add `trap?: string` to the question schema (optional — not all questions need one; start with the 50 hardest)
- In Trainer mode answer reveal: after `explanation` block, if `trap` exists render amber callout `bg-amber-950/40 border-amber-800/50 text-amber-300` with label "Common trap"
- In Exam mode: show in the per-question review at session end
- Priority for trap content: RAG architecture, agent failure modes, eval metrics, fine-tuning decisions — topics where subtle misunderstanding is common

**Source:** LLM/GenAI Interview Master Guide (136 questions, 4-layer format), May 2026 — each question has a "Common Trap" layer explicitly. GAL's PrepLab is the only comparable resource missing this layer.

**Effort:** M (field addition is trivial; writing 50 trap entries is the work — ~30 min per 10 questions)

**Now:** `trap` + `source` fields injected into 50+ hardest questions across RAG (12), Agents (12), Evaluation (11), LLMOps (11), Fine-tuning (5). `src/shared.jsx` created with `CommonTrapCallout({ trap })` — amber chip rendered in RevealCard after explanation block in both Trainer and Exam review. `source` attribution also rendered. Commit `38d5330`. Extended in sprints 33–35: trap fields on all new questions (`graph-rag-*`, `langgraph-*`, `reranker-*`).

**Status:** ✅ Done — sprint 31C. Ongoing: all new hard questions get trap fields at time of writing.

---

## PrepLab — Trap Field Quality Pass (overclaim → honest reframe format)

**Component:** `src/data/preplabQuestions.js` — all hard questions with trap fields

**Current behavior:** 182 trap fields exist but many are thin one-liners ("Don't say X"). They name the mistake but don't model the correct reframe. The Quantiphi Defense Pack (June 2026) surfaced a sharper format: "Overclaim risk → What to say instead" — pairs the wrong answer with a specific, honest alternative. This is more actionable than just naming the trap.

**Target behavior:** Audit all hard question trap fields. Rewrite thin ones using the overclaim→honest-reframe pattern. Example upgrade:

- Before: "Don't claim you've built an MCP server if you haven't."
- After: "Trap: claiming production MCP experience without it. Say instead: 'I understand the protocol and have implemented the tool-calling pattern it formalizes. I haven't shipped a full MCP server end-to-end.'"

Prioritize: RAG architecture (12 trap fields), agents (12), evaluation (11), LLMOps (11) — the four highest-traffic clusters. Skip easy questions; trap fields only matter on medium/hard.

**Effort:** S-M (content rewrite — no schema change, no new UI. ~45 min per cluster × 4 clusters)

**Dependencies:** None — trap field and amber callout already rendered in PrepLab.

**Priority:** Medium — improves interview prep depth without any build work.

**Source:** Quantiphi JD-Gap + Python Coding Interview Defense Pack, June 2026. Section 5 "Do Not Say This" is the reference format.

**Status:** Pending

---

## Global — Replace All Emojis with Inline SVGs

**Component:** All `.jsx` files — any literal emoji character used in UI text, buttons, badges, or labels

**Current behavior:** Emojis are used in several places (e.g. ✓, →, ⚡, 🔬 etc. in module badges, status indicators, nav labels, done states). Emoji rendering is OS- and browser-dependent — inconsistent glyph shapes, sizing, and baseline alignment across Windows/Mac/Linux and across Chrome/Firefox/Safari. On some systems they appear pixelated or differently colored. They also can't be styled with CSS (color, stroke, size relative to text).

**Target behavior:** Every emoji in the UI replaced with a purpose-built inline SVG or a Heroicons/Lucide-style path (already zero-dependency since we use no icon lib, so SVGs are inlined directly). SVGs are: CSS-colorable with `currentColor`, scalable at any size, consistent cross-platform, accessible with `aria-hidden="true"`. Each replacement SVG should be extracted into a small `src/icons.jsx` helper to avoid repeating 5-line SVG blocks everywhere.

**Scope — audit pass needed to enumerate all occurrences before executing:**
- Done/check marks (✓, ✔)
- Arrows (→, ←, ↑)
- Status/badge icons (⚡, 🔬, 🎯, 🏋️ etc.)
- Any emoji in GT post content blocks (`.jsx` data arrays only — not markdown strings)
- Nav group icons if any

**Effort:** M (audit = S; replacement pass = M depending on count)

**Dependencies:** Audit pass first — grep for emoji ranges in all `.jsx` files before writing any SVG replacements.

**Priority:** Medium — correctness and polish, not functionality. Run after interviews.

**Status:** Pending


---

## Global — `src/config/` folder (system-wide settings extraction)

**Component:** `src/App.jsx`, `src/PrepLab.jsx`, `src/utils/accessCode.js` — system-wide behavioral constants

**Current behavior:** Values that control product behavior across the whole app are scattered in component files as magic numbers or inline strings: session limit (`10`) is in `PrepLab.jsx`, the access code is in `src/utils/accessCode.js`, the gate threshold (30% completion) is in `InterviewPrepMode`, `NAV_GROUPS` / `ALL_TABS` / `GROUP_COLORS` are in `App.jsx`. Changing the free tier session limit requires knowing which file and which line to edit — no central config location.

**Target behavior:** Create `src/config/` folder with three files as starting point:

```
src/config/
  gating.js     — FREE_SESSION_LIMIT = 10, COMMUNITY_CODE, GATE_THRESHOLD = 0.30, gated tier rules
  nav.js        — NAV_GROUPS, ALL_TABS, GROUP_COLORS (extracted from App.jsx)
  labs.js       — SYSTEMS_MODULES, AGENTS_MODULES registries (extracted from Systems.jsx + Agents.jsx)
```

Each file exports named constants. Components import from config. Business model change (e.g. raise session limit to 15, change access code) = one file, one line.

**What stays in components:** Component-local constants (a one-off colour, a local label) stay where they are. This is for values with cross-cutting behavioral impact.

**Effort:** S per config file once the extraction pass starts. Total: S-M (3 files + import rewiring in affected components).

**Dependencies:** None — purely mechanical extraction, no logic changes.

**Priority:** Medium — no user-facing change, but high developer velocity impact. Build incrementally: `gating.js` first (highest business impact), then `nav.js`, then `labs.js`.

**Status:** Partially done — `nav.js` (batch-A, `992cfc4`) + `gating.js` (sprint 31D) done. `labs.js` (SYSTEMS_MODULES + AGENTS_MODULES registries) still pending — blocked by component coupling in Systems.jsx + Agents.jsx.

---

## ~~Global — PrepLab questions extraction to `src/data/preplabQuestions.js`~~ DONE — sprint 31B

**Component:** `src/PrepLab.jsx` → `src/data/preplabQuestions.js`

**Was:** All 261 questions inline in `PrepLab.jsx`.

**Now:** `PREP_QUESTIONS` array extracted to `src/data/preplabQuestions.js`. `PrepLab.jsx` reduced from ~5079 to 2446 lines. Import added. All subsequent question additions (sprints 33–35) go in the data file. Schema: `{ id, topic, difficulty, type, question, options, correct, keywords, explanation, trap?, source?, gated?, readMore? }`. Commit `73924a0`.

**Status:** ✅ Done — sprint 31B.

---

## Global — Shared UI components for repeated patterns

**Component:** `src/App.jsx`, `src/Agents.jsx` — forward pointer card duplicated; plus planned components

**Current behavior:** The forward pointer card (`✓ "You've seen the failure. What's next?"`) exists in two separate implementations: one in `App.jsx` (RAG Lab) and one in `Agents.jsx` (Agent Lab done screens). They diverge over time. Planned UI patterns — Production Note chip, Common Trap callout — will be built inline in components and duplicated similarly without a shared component convention.

**Target behavior:** A small `src/components/shared.jsx` (or `src/shared.jsx`) exporting reusable display components:

```jsx
export function ForwardPointerCard({ preplabTopic, gtPostId, onNavigate }) { ... }
export function ProductionNoteChip({ note }) { ... }         // NEXT.md item 2
export function CommonTrapCallout({ trap }) { ... }          // UPGRADES.md PrepLab entry
export function FidelityBadge({ tier, note }) { ... }        // already duplicated in 3 files
```

Each takes minimal props, handles its own styling. Any lab that needs the pattern imports the component — no copy-paste. Visual changes propagate everywhere automatically.

**Effort:** S per component. `ForwardPointerCard` first (already duplicated). Others built as needed rather than all at once.

**Dependencies:** None per component — build each one when it's first needed.

**Priority:** Medium — no immediate user impact, but prevents the copy-paste debt from compounding with each new lab addition.

**Status:** ✅ Done — batch-B (`2c57ff2`). `src/shared.jsx` now exports: `CommonTrapCallout`, `ProductionNoteChip`, `ForwardPointerCard`, `WhatNextCard`, `FeedbackBar`. `FidelityBadge` still duplicated in 3 files (lower priority, small component).

---

## GroundTruth.jsx — State-Aware Reading Mode ("Revise / Learn / What's Next")

**Component:** `src/GroundTruth.jsx` — post list + filter UI

**Current behavior:** 225 posts displayed as a flat wall with category filter pills and a search box. No personalization. No reading history beyond the `genai_gt_read` localStorage set that tracks which posts have been opened.

**Target behavior:** Three reading lenses surfaced as tabs or a sort selector above the post list, powered by existing localStorage data:
1. **Revise** — posts in topics where PrepLab score history (`gsl-preplab-history`) shows weak performance. "You're scoring 45% on evals questions — here are the GT posts on that topic."
2. **Learn** — unread posts in topics the user is actively visiting in the Labs (derived from `genai_visited_modules`). Shows what to read alongside what you're doing.
3. **What's Next** — unread posts in topics the user hasn't touched yet. Gentle expansion pull.

Default when no filter selected: most-recently-visited-topic first (personalized) or chronological (anonymous). The three lenses collapse the 222-post wall into a curated study queue without any backend. All data sources already exist.

**Effort:** M (data wiring + filter UI; no new infrastructure needed)

**Dependencies:** `gsl-preplab-history` (exists, from Weakness Heatmap), `genai_gt_read` (exists), `genai_visited_modules` (exists). Post tags already set in `groundTruthIndex.js`.

**Priority:** Medium — GT is underutilized because 225 posts without personalization is overwhelming. This converts it from a library into a study queue.

**Status:** ✅ Done — sprint 37c (`a37d99c`). Three reading lenses above category filter pills in GroundTruth.jsx.

---

## GroundTruth.jsx — Series + Tags Architecture

**Component:** `src/GroundTruth.jsx` + `src/groundTruthIndex.js`

**Current behavior:** 225 posts with flat category tags. Category filter pills work but give no narrative organization — the post wall has no series grouping, no reading order within topics, no sense of progression.

**Target behavior:** Posts grouped into 5–7 named series (e.g. "Production Failures", "Architecture Decisions", "Inference Stack", "Agents in Production", "Evals & Observability"). Default landing = series cards grid (one card per series, post count + progress bar). Clicking a series shows the posts in reading order. Tag filter overrides series view and shows all posts with that tag, sortable. ML Systems Lab and PAL both gate this UI on 50+ posts; genai-systems-lab is at 222 and well past that threshold.

**Content work needed first (in `groundTruthIndex.js`):**
- Add `series: "series-slug"` field to each post's metadata
- Define reading order within each series
- Confirm tags are consistent across posts

**Effort:** M-L (content taxonomy work in groundTruthIndex.js is the bulk; UI change is a new series card grid component)

**Dependencies:** Series taxonomy decision (content work) before any UI. Should happen in the same session as the state-aware reading mode above.

**Priority:** Medium-High — 225 posts on a wall is a known conversion killer. This is the fix.

**Status:** Pending (Source: ml-systems-lab + PAL, May 2026)

---

## Home.jsx — Streak + Activity Heatmap in Returning User View

**Component:** `src/Home.jsx` — `ReturningHomeView` — Today section

**Current behavior:** Returning user view (`ReturningHomeView`, sprint 16) shows a progress snapshot with PrepLab stats and Concepts gym progress bar. No streak counter, no activity history heatmap.

**Target behavior:** Add to the Today section:
- **Daily streak** — "Day 7 streak 🔥" (or "come back tomorrow to keep your streak"). Read from `gsl-streak` + `gsl-last-visit` localStorage keys. Increment on any PrepLab attempt or module visit.
- **4-week activity grid** — 4×7 GitHub-style squares, each cell = one day, colored if `gsl-activity-YYYY-MM-DD` key exists for that date. Matches ML Systems Lab's 28-day window (not 91 — sparse grids look broken for new users).

Storage: `gsl-streak` (number), `gsl-last-visit` (ISO date string), `gsl-activity-YYYY-MM-DD` (set on any lab visit or PrepLab attempt, value = number of actions that day).

**Effort:** S-M (localStorage utilities + grid component rendering)

**Dependencies:** ReturningHomeView must be live (it is, sprint 16). No other dependencies.

**Priority:** Medium — visible progression is one of the "take my money" sprint items (IDEAS.md Business Model section). This is the static version that doesn't require a backend.

**Status:** ✅ Done — batch-C (`0d7371f`). `getStreakInfo()` helper added. localStorage keys: `gsl-streak`, `gsl-last-visit`, `gsl-activity-YYYY-MM-DD`. 28-cell 4×7 heatmap rendered in Today section with cyan intensity levels.

---

## ~~PrepLab.jsx — Keyboard Shortcuts in Exam / Trainer Modes~~ DONE — sprint 30

**Component:** `src/PrepLab.jsx` — Exam mode + Trainer mode

**Was:** All MCQ interactions required mouse clicks.

**Now:** `useEffect` keydown handlers in both ExamMode and TrainerMode — keys 1/2/3/4 select MCQ options, Enter submits when option selected / advances when already submitted. Commit `ada9b79`.

**Status:** ✅ Done — sprint 30.

---

## Labs — "Maps to Production" Callout Inside Scenario Root-Cause Cards

**Component:** `src/App.jsx` (RAG Lab scenario root-cause sections), `src/Agents.jsx` (Agent Lab failure diagnosis blocks), `src/systems/modules.jsx` (Eval + LLM Lab failure callout cards)

**Current behavior:** Every lab scenario surfaces a root cause and a fix. The failure judgment ends at the conceptual layer — the user knows *what* failed and *why*, but the output has no grounding in real services or production architectures. A user walking into an interview can diagnose the failure but cannot say "this is the Bedrock Knowledge Base problem" or "this is what you see when OpenSearch misconfigures HNSW index params."

**Target behavior:** Add one line to each root-cause/failure card: `"In production this is: [service / OSS tool / architecture pattern]"`. Examples:
- RAG Missing Answer → "Bedrock Knowledge Base chunking config / OpenSearch HNSW params / Weaviate segment size"
- RAG Context Overflow → "LangChain token stuffing / Llama-Index context window management / OpenAI 128K context vs semantic loss tradeoff"
- Agent Tool Loop → "ReAct loop without retry limits / LangGraph cycle detection / AutoGen termination condition"
- Serving latency spike → "vLLM continuous batching vs static batch / TGI KV cache eviction / Triton server queue depth"

Implementation: a small `productionNote` field on the failure scenario data object, rendered as a subdued one-liner below the root-cause text. No logic change. Pure data + render addition.

**Files to touch:**
- `src/App.jsx` — `ragScenarios` array (or wherever root-cause text is stored) — add `productionNote` field per scenario
- `src/Agents.jsx` — failure matrix / done screen diagnosis blocks — add production note
- `src/systems/modules.jsx` — failure callout renders in serving, decoding, langsmith, moe modules

**Effort:** S (data field addition + 5-line render change, done in one session for all labs)

**Dependencies:** None — additive change, zero risk

**Priority:** High — single highest-leverage interview-readiness upgrade from the third-party lab assessment (May 2026). Low effort, directly closes the "judgment but no production connection" gap.

**Status:** ✅ Done — sprint 36 (`2a8c0bc`) for RAG Lab. ✅ Done — batch-4 (`b253405`) for Agent Lab (all 8 AGENT_FAILURE_MATRIX entries) + LLM Lab (all 5 SERVING_FAILURE_SCENARIOS). Eval Lab failure callout modules deferred (lower traffic than RAG + Agent + LLM serving).

---

## Labs — "Your Interview Story" Block at Scenario Completion

**Component:** `src/App.jsx` (RAG Lab done card), `src/Agents.jsx` (Agent Lab done screens), `src/systems/modules.jsx` (Eval + LLM Lab completion states)

**Current behavior:** Done cards / module endings exist across all labs (shipped sprint 6/7). They surface a PrepLab CTA and a GT post link. What they don't do: package the narrative of what the user just did into an interview-ready talking point. A user who completed a scenario has the judgment but not the story.

**Target behavior:** Add a collapsible "Your Interview Story" block at each scenario done card. Format:

```
"You diagnosed [failure mode] → root cause was [X] → fix was [Y] → in production this maps to [Z].
That's your answer when they ask: 'Tell me about a time you debugged a production AI failure.'"
```

Collapsed by default ("See your interview story →"), expands on click. Copy is written once per scenario — no dynamic generation.

**Files to touch:**
- `src/App.jsx` — RAG Lab scenario done card (6 scenarios × 1 story block each)
- `src/Agents.jsx` — Agent Lab done screen on `simulator` + `design` modules (at minimum)
- `src/systems/modules.jsx` — at least the 3 highest-traffic Eval + LLM Lab completion states

**Effort:** S (2–3 lines JSX per scenario + static copy; ~30min total)

**Dependencies:** Done card prominence fix should ship first. See RAG Lab — Done Card Prominence entry.

**Priority:** High — closes the gap between "I built judgment in the lab" and "I can articulate it in an interview." Zero infrastructure cost.

**Status:** ✅ Done — RAG Lab all 6 scenarios (`97360b7`). Agent Lab simulator + design + agentcfg + 5 scenarios (`2c9e282`, `1b4346d`). Eval + LLM Lab completion states deferred.
