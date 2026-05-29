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

## Access Code Gate (Interim Auth)

**Component:** `src/PrepLab.jsx` + `src/App.jsx` — gated content access

**Current behavior:** `gated: true` markers exist on 163 PrepLab questions and JD Prep mode. No gate is active — all content is accessible to everyone.

**Target behavior:** A lightweight access code gate (client-side, localStorage) sits in front of gated content. On first access to a gated feature, user is prompted to enter an access code. Valid code stored in localStorage — not re-prompted on return. Community access code is public and shared freely. When Stripe goes live, replace community code with purchased codes (server-side validation). This is an interim solution — explicit, easy to understand, no backend required.

**Trade-off to name explicitly:** Client-side validation is trivially bypassed by anyone who reads the JS. Acceptable for a community gate over free content. Not acceptable for paid content — that needs server-side validation when Stripe goes live.

**Effort:** S (localStorage check + simple modal/overlay for code entry)

**Dependencies:** Decide on the community code and the copy ("Enter your access code — get it free at [link]")

**Priority:** Medium — not blocking Batch 0/1, but should be in before Batch 3 (pre-monetization test)

**Status:** Pending — idea surfaced in Batch 0 Walk 1 discussion

---

## PrepLab — JD Prep Mode: Defense Strategy Upgrade

**Component:** `src/PrepLab.jsx` → JD Prep mode (`mode === "jd"`)

**Current behavior:** User pastes a job description → JD Prep mode extracts keywords and surfaces PrepLab questions loosely weighted to those keywords. The match is surface-level (keyword overlap), with no structured skill gap analysis and no sequenced prep plan output.

**Target behavior:** Full interview defense strategy. Three-phase flow:

1. **Parse + weight** — JD text parsed against 11 AI interview skill categories, each with a keyword map. Output: role profile (e.g., "RAG-heavy, eval-critical, agent architecture optional") with category weights derived from keyword frequency and JD language signals (e.g., "production", "at scale", "own the eval").

   Skill categories:
   - RAG architecture (chunking, retrieval, reranking, hybrid search)
   - Evaluation design (LLM-as-judge, RAGAS, human eval, regression testing)
   - Agent systems (tool use, memory, orchestration, failure modes)
   - LLM fundamentals (tokenization, attention, context window, fine-tuning signals)
   - Production/serving (latency, cost, batching, quantization, caching)
   - Observability (tracing, monitoring, drift detection, alerting)
   - Prompt engineering (system prompt, structured output, injection defense)
   - Vector databases (index types, distance metrics, hybrid search, HNSW/IVF)
   - Data pipelines (embedding pipeline, chunking strategy, data flywheel)
   - Product/PM angle (metrics, tradeoffs, prioritization, stakeholder comms)
   - Safety and alignment (guardrails, eval for safety, red-teaming)

2. **Self-rating** — for each category flagged as JD-relevant (weight > threshold), user rates their readiness: Weak / Okay / Strong. Gap score = JD weight × inverse rating.

3. **Prep plan output** — sequenced by gap score (highest first). For each gap:
   - Linked GT posts covering that category
   - Linked Systems/Explore modules to practice
   - PrepLab question cluster for that category (filtered + weighted)
   - Honest gaps callout: if the lab doesn't have content for a JD-required skill, say so explicitly ("This role requires X. The lab doesn't cover this yet — recommended external resources: ...")

**Effort:** M (one focused 3–4h session — all data is already in the codebase, no new infrastructure needed, no backend required)

**Dependencies:**
- Existing PrepLab question bank with category tags (already partially tagged)
- Existing GT post catalog with category alignment (can be inferred from post IDs)
- Existing Systems/Explore module list (already in SYSTEMS_MODULES + Explore data)
- No backend, no auth — all static logic

**Priority:** High (directly serves the highest-intent user: someone with an interview in 2 weeks. Also the primary paid-tier differentiator when monetization goes live.)

**Status:** Pending

**Notes:** When Stripe goes live, this mode is the primary paid-tier feature. The `gated: true` markers are already on 163 PrepLab questions and the JD Prep mode card. The upgrade does not change the gate — it makes the gated feature worth paying for.

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
