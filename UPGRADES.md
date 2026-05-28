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
