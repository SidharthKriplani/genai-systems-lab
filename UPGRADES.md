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

*Last updated: May 2026*

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

**Target behavior:** Copy anchored to the real market claim: engineers who can make AI pipelines robust and production-ready are what the market pays for — not engineers who just know how to use AI. Specific changes:
- Badge: remove "Free" (table stakes), "No login" (technical fact, not benefit), "Layer 3 AI skills" (jargon). Replace with one line that names the outcome, e.g. "Production AI skills. No fluff."
- Headline: tighten to the production readiness thesis. Must land in under 5 seconds. No more than 8 words.
- Body copy: remove all RAG-specific framing. Speak to the full AI pipeline — RAG, agents, evals, serving, observability. The copy should make a data engineer, an AI PM, and an agent builder all feel like this is for them.
- The underlying thesis: the lab trains production debugging instinct, not model knowledge. That should be unmissable.

**Effort:** S (copy work, no structural JSX changes)

**Dependencies:** Alignment on the headline direction before writing. One agreed-upon thesis statement first.

**Priority:** Critical — first thing a new visitor sees. If this doesn't land, nothing else matters.

**Status:** Pending — alignment in progress (Batch 0 Walk 1 finding #1, #2, #3)

---

## RAG Lab — Done Card Prominence

**Component:** `src/App.jsx` or RAG Lab scenario result panel — ✓ done card placement

**Current behavior:** The ✓ done card (forward pointer to PrepLab + GT post) appears in the corner of the results view after a scenario completes. It is not immediately visible — a user can complete a scenario and leave without ever seeing it.

**Target behavior:** Done card must be the first thing seen after a scenario completes — not a corner element. Options: (a) full-width card below the failure diagnosis, above the fold, impossible to miss; (b) the scenario result panel scrolls down to the done card automatically on completion. Either way, it should not require the user to scroll down or look in a corner.

**Effort:** S (layout adjustment, no logic changes)

**Dependencies:** None

**Priority:** Critical — the done card is the entire learn loop closing mechanism. If it's invisible, the loop doesn't close.

**Status:** Pending — Batch 0 Walk 1 finding #5

---

## RAG Lab — "Test Your Understanding" CTA Fix

**Component:** `src/App.jsx` or RAG Lab scenario done card — "Test your understanding" button

**Current behavior:** Button is present in the done card but crashes on click — navigates to nothing, dead end.

**Target behavior:** Button navigates to PrepLab filtered to the relevant question cluster for that scenario. E.g., Missing Answer scenario → PrepLab filtered to RAG retrieval failure questions.

**Effort:** S (routing fix — wire the button to the correct PrepLab state)

**Dependencies:** Done card prominence fix should ship first (no point fixing the routing if the card is invisible)

**Priority:** Critical — a crashing CTA is a bug, not a UX issue.

**Status:** Pending — Batch 0 Walk 1 finding #6

---

## Ground Truth — Quiz Depth (minimum 5 questions)

**Component:** `src/GroundTruth.jsx` — generateQuiz() + question arrays per post

**Current behavior:** GT post quiz fires with a small number of questions (fewer than 5). Feels like a checkbox, not a meaningful test of understanding.

**Target behavior:** Minimum 5 questions per quiz. Ideally 5–7. Questions should cover the full breadth of the post, not just the opening concept. The quiz should feel like real interview pressure on that topic — if you read the post carefully, you should get 4/5. If you skimmed, 2/5.

**Effort:** M (content work — writing additional questions for each post that has a quiz. Logic already exists.)

**Dependencies:** Identify which posts currently have quizzes and how many questions each has — audit needed before writing.

**Priority:** Medium

**Status:** Pending — Batch 0 Walk 1 finding #8

---

## PrepLab — Difficulty Levels (Easy / Medium / Hard)

**Component:** `src/PrepLab.jsx` — question bank + Exam/Trainer modes

**Current behavior:** No difficulty classification. All questions are presented with equal weight regardless of complexity.

**Target behavior:** Each question tagged with `difficulty: "easy" | "medium" | "hard"`. Exam mode lets user select difficulty filter before starting. Trainer mode shows difficulty badge on each question. Default: mixed (all difficulties). Easy = definitional recall. Medium = application. Hard = design tradeoff or production scenario.

**Effort:** M (tagging all 261 questions is the bulk of the work; UI change is small)

**Dependencies:** None — tags can be added to the existing question objects

**Priority:** High — difficulty levels are table stakes for any question bank targeting interview prep

**Status:** Pending — Batch 0 Walk 1 finding #9

---

## PrepLab — Multi-Select MCQ (Multiple Correct Answers)

**Component:** `src/PrepLab.jsx` — question format + answer validation logic

**Current behavior:** All questions are single-select MCQ (one correct answer). User clicks one option, answer is evaluated.

**Target behavior:** Questions can optionally be `type: "multi"` — user selects all correct options, then clicks "Submit." Scoring: full credit only if all correct options selected and no incorrect ones selected. UI: checkboxes instead of radio buttons for multi questions. A "Select all that apply" label signals the format to the user.

**Effort:** M (question format change + UI conditional rendering + scoring logic update)

**Dependencies:** None

**Priority:** Medium — adds real depth and closer to real interview format ("select all that apply" questions are common)

**Status:** Pending — Batch 0 Walk 1 finding #9

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

**Status:** Pending — do not build until hero copy, done card, and TYU crash are fixed

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

**Status:** In progress

---

## PrepLab — Interview Prep Plan (unified feature)

*Formerly called "JD Prep mode" and "Defense Doc" — these were two names for the same thing. Consolidated here as "Interview Prep Plan."*

**Component:** `src/PrepLab.jsx` → modes `jd` and `defense` (merge into single `prepplan` mode)

**Current behavior:** JD Prep mode does surface-level keyword matching and surfaces loosely relevant questions. Defense Doc mode generates a generic document. No structured skill gap analysis, no sequenced plan, no personalization.

**Target behavior:** Four-phase flow:

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

## Home.jsx — Social Proof Overhaul

**Component:** `src/Home.jsx` — testimonials section

**Current behavior:** 3 unnamed testimonials ("ML Engineer · fintech startup") with no verifiable signal. Easily dismissed.

**Target behavior:** Replace with real social proof: LinkedIn screenshots with like/comment counts (signals resonance to new visitors), GitHub star count if significant, named quotes with handles from real users who've given permission. If none available yet, remove the section entirely rather than keep unconvincing placeholders.

**Effort:** S (once real quotes exist — content collection is the blocker, not the code)

**Dependencies:** Real quotes/screenshots from users. Content blocker, not code blocker.

**Priority:** Low (Audit 27 Finding 2 — flagged but unactionable until real social proof exists)

**Status:** Pending — blocked on content

---

## Concepts — Full Module Text Pass (horizontal depth)

**Component:** `src/Concepts.jsx` — all 15 module components

**Context:** Concepts modules are interactive-first with almost no explanatory text. The interactives are aids; they can't be understood without text framing what the user is looking at, why it matters, and what to look for. A beginner in these concepts can interact without learning anything.

**Sprint 14 progress:** Framing text (before-the-interactive beat) added to all 15 modules across 3 passes. Commits `1f649a2`, `4539d5e`, `6d5083b`.

**Sprint 15 progress:** Gym-based UI skeleton shipped. `GymSelectorView` (5-card grid), `GymRoomView` (PAL-style sequential module cards), 3-view state machine in `ConceptsApp`. 3 active gyms (Language Models 7 modules, Retrieval 5, AI Agents 3) + 2 placeholder gyms (Evaluation, Production Systems). `MODULE_META` constant: insight teaser + time estimate per module. `GYMS` constant. Commit `e19fb27`.

**Sprint 17 progress:** GYMS expanded to 14 rooms. 9 new coming-soon rooms added: Foundation Models, Prompt Engineering, Cloud AI Services, Vector Infrastructure, Observability & Tracing, Multimodal AI, AI Safety & Alignment, AI Product Strategy, Data for AI. Each fully described with color + lab pointer. Commit `a43fffe`.

**Remaining for all 15 modules (future pass):**
- **Inline callouts** — annotations tied to specific interactive states (e.g. "When temperature hits 0 you're always picking the top token — this is why outputs become repetitive.")
- **Synthesis close** — 1–2 sentences after the interactive: what this means for real system design decisions.

**Target per module (full pass):** ~150–300 words across 3 beats: setup framing → inline callouts → synthesis close.

**Effort:** L (multi-session, 15 modules × 2 beats each)

**Dependencies:** None — pure writing + JSX injection.

**Priority:** High — Concepts is in primary nav. Beginners will land here.

**Status:** In Progress — 15/15 framing texts done, gym skeleton shipped. Remaining: inline callouts + synthesis close pass (full 3-beat upgrade)

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
