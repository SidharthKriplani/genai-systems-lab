# ROLLOUT.md — Beta Rollout Plan

Operational file for beta testing. Distinct from IDEAS.md (what to build) and DECISIONS.md (standing rules). This file tracks what goes out, in what order, to whom, and what gets checked before it does. It is not a backlog.

*Last updated: May 2026*

---

## Principles

1. **Batch 0 is founder-only. No exceptions.**
Every batch starts with the founder using the product as a stranger would — cold, no context, no knowledge of what's behind the UI. Obvious breakage gets caught here so testers spend time on judgment calls, not bug reports.

2. **Every batch entry has two layers: profile and scope.**
Profile = who the tester is and what they are trying to do. Scope = what they are testing. Both are required. "Batch 1 = these 5 features" is not a batch entry. A specific person with a specific goal testing a specific thing is.

3. **Tester brief is one specific prompt, not a list.**
Vague prompts produce vague feedback. Each batch gets one concrete scenario the tester walks through. If you need to test two distinct things, run two batches.

4. **Feedback has an expiry date.**
Tester feedback on Batch N is only valid until Batch N+1 ships. When the next batch opens, mark the previous batch's feedback field as closed. Do not let unresolved notes from old batches accumulate as if they are still actionable.

5. **Mobile is non-negotiable in every vet checklist.**
Every batch — Batch 0 included — must be tested on a real mobile device before testers see it. Not browser devtools. A real phone. Every batch entry has a mobile vet row in the checklist.

6. **Pass must be defined before the batch opens.**
Each batch entry states what pass looks like before a single tester is invited. If you cannot define pass, the batch is not ready to open.

---

## Batch 0 — Founder Self-Vet

**Status:** In Progress — Walk 1 complete (May 2026)

**User profile:** Founder (Avinash), using the product as a first-time visitor with no internal context. Start from the landing page every time. No shortcuts, no direct URL entry to known-good states. Open DevTools console in a second tab — watch for JS errors as you go.

**Scope:** Structured walkthrough below. Not "check everything" — check the specific paths a real user would take.

---

### Walk 1 — The Primary Loop (desktop, ~25 min)

The single most important path. If this doesn't work cleanly, nothing else matters.

- [x] Land on Home. Read the hero as a stranger. Does the value prop land in 5 seconds without reading all the copy? → **FAIL** — see findings below.
- [x] Click the RAG Lab door card. Confirm it routes correctly. → ✓ routes correctly.
- [x] **RAG Lab — Missing Answer scenario:** Set chunk size large, top-k low, no reranking. Run it. Confirm the failure arc fires. Confirm ✓ done card appears with GT post link and PrepLab CTA. → **PARTIAL** — failure arc fires; done card appears but positioned in corner, not prominent. See findings.
- [x] Click the GT post link from the done card. → ✓ "Read the full breakdown" opens correct GT post.
- [x] Confirm quiz CTA is visible in post header → click it → quiz fires. → ✓ quiz CTA visible and fires. Quiz has too few questions — needs 5+.
- [x] Navigate to PrepLab → Exam mode → 10 questions. Confirm: progress bar tracks, session end screen appears. → ✓ progress bar confirmed, session end screen looks good. **Issue:** PrepLab depth and polish insufficient — see findings.
- [x] No JS errors in console. → ✓ no JS errors.

---

### Walk 1 — Findings (May 2026)

| # | Area | Finding | Severity | Status |
|---|---|---|---|---|
| 1 | Hero copy — value prop | "AI systems break in production" doesn't land in 5 seconds. Framing is generic. The real claim — engineers who can make AI pipelines robust and production-ready are what the market pays for, not engineers who just know how to use AI — is not stated. Copy needs a full rewrite anchored to production readiness, not model knowledge. | **Critical** | ✓ Fixed — headline rewritten to "Knowing AI isn't enough. The market pays for engineers who ship it." Badges updated to "500+ interview questions · 6 failure simulations · Open now" (sprint 93g) |
| 2 | Hero badges | "Free · No login · Layer 3 AI skills" — all three wrong. "Free" is table stakes. "No login" is a technical fact, not a benefit. "Layer 3 AI skills" is jargon requiring explanation. Remove or replace with one line that means something. | **High** | ✓ Fixed — see #1 above (sprint 93g) |
| 3 | Hero body copy | "reading about RAG failures" frames the product as a RAG tool. It isn't. The hero copy must reflect the whole AI pipeline, not one component. | **High** | ✓ Fixed — body now covers "interactive failure simulations, 500+ production-calibrated interview questions, and diagnostic frameworks" (sprint 93g) |
| 4 | RAG Lab routing | Routes correctly from door card. | ✓ Pass | Closed |
| 5 | Done card placement | ✓ done card appears but is positioned in the corner — not prominent, not immediately visible. The forward pointer is the most important CTA on the page and it's being missed. | **Critical** | ✓ Fixed — banner moved to below the results grid (App.jsx); renders after user has seen failure mode + metrics, at natural scroll-end (sprint 93g) |
| 6 | "Test your understanding" CTA | Crashes — does not open anything. Dead end. | **Critical** | ✓ Fixed — calls navigateTo correctly; PrepLab opens in trainer mode filtered to scenario topic (sprint 93g) |
| 7 | "Read the full breakdown" CTA | ✓ opens correct GT post. | ✓ Pass | Closed |
| 8 | GT post quiz depth | Quiz fires correctly but has too few questions. Needs minimum 5 to feel like a real test of understanding, not a checkbox. | **Medium** | Open — see UPGRADES.md |
| 9 | PrepLab depth + polish | Not "million dollar" polished. Modes feel shallow. No difficulty levels (easy/medium/hard). All questions are single-select MCQ only — multi-select (multiple correct answers) missing. Customization options thin. | **High** | Open — see UPGRADES.md |
| 10 | PrepLab progress bar | ✓ tracks correctly. | ✓ Pass | Closed |
| 11 | PrepLab session end screen | ✓ looks good. | ✓ Pass | Closed |
| 12 | JS errors | ✓ none. | ✓ Pass | Closed |
| 13 | Access code gate (new idea) | Rather than full Stripe auth, gate premium content behind an access code (client-side). Keep a generic community code public. Easier to beta test, no backend needed, clear upgrade path when Stripe goes live. | **Idea** | Open — see UPGRADES.md |

---

### Walk 2 — RAG Lab remaining scenarios (~15 min)

*Note: actual RAG Lab scenario names are: Missing Answer, Ambiguous Query, Conflicting Policy Documents, Multi-hop Reasoning, Three Document Evidence Chain, Prompt Injection via Retrieval. Previous checklist had wrong names — corrected below.*

- [ ] **Ambiguous Query scenario:** Confirm failure arc fires with distinct root cause from Missing Answer.
- [ ] **Conflicting Policy Documents scenario:** Confirm conflicting evidence handling — failure card shows the conflict, not just a generic error.
- [ ] **Multi-hop Reasoning scenario:** Confirm multi-hop failure arc fires correctly.
- [ ] **Three Document Evidence Chain scenario:** Confirm evidence chain rendering and failure diagnosis.
- [ ] **Prompt Injection via Retrieval scenario:** Confirm injection attack is demonstrated and defense is shown.
- [ ] Each scenario: confirm ✓ done card fires with a scenario-specific GT post (not the same post for every scenario). **Known issue from Walk 1: done card placement — flag if still in corner.**

---

### Walk 3 — Agent Lab (~15 min)

- [ ] Open `agentcfg` (Agent Config Lab). Set retryLimit=0, add 5+ tools. Confirm cascading_errors failure fires. Confirm fix suggestion appears.
- [ ] Open `simulator` (Agent Simulator). Run a multi-step task to completion. Confirm the done screen has a PrepLab forward pointer card.
- [ ] Open `langsmith`. Go to "Diagnose Traces" tab (should be default). Click a broken trace scenario. Click a span. Confirm diagnosis + fix reveals correctly.
- [ ] Open `moe` (Mixture of Experts). Set experts=8, topK=1, batchSize=10. Run. Confirm load imbalance callout fires with fix suggestions.

---

### Walk 4 — LLM Lab (serving + decoding) (~10 min)

- [ ] Open `serving` (Serving Infrastructure). Configure a hardware setup. Confirm recommendation card renders. Change a config parameter that should trigger a failure scenario — confirm the failure card appears with root cause + fix chips.
- [ ] Open `decoding`. Set temperature ≤ 0.15. Confirm repetition collapse callout fires. Set temperature ≥ 1.5. Confirm token incoherence callout fires. Set topP ≤ 0.2. Confirm vocabulary starvation callout fires.

---

### Walk 5 — PrepLab all modes (~20 min)

- [ ] **Exam mode:** 10-question session (already done in Walk 1 — skip if confirmed).
- [ ] **Trainer mode:** Open one question. Reveal answer. Confirm explanation shows. Navigate to next question.
- [ ] **JD Prep mode:** Paste a real AI engineering JD (e.g., from an Anthropic or Google DeepMind posting). Confirm questions surface and are weighted toward the JD's skill profile. Walk through 5 questions. Confirm no dead ends. *This is the primary paid feature — give it extra time.*
- [ ] **Company Tracks mode:** Pick one company track. Confirm questions load and are tagged correctly.
- [ ] **Defense Doc mode:** Generate a defense doc. Confirm it renders without error.

---

### Walk 6 — Ground Truth (~10 min)

- [ ] Open GT browser. Filter by one category (e.g., `rag`). Confirm filter works and only relevant posts show.
- [ ] Open `agent-memory-architecture`. Confirm: h2/h3 headers render, callout block renders, refs block renders, quiz CTA visible.
- [ ] Open `your-prompt-is-code`. Same checks.
- [ ] Open `dpo-in-practice`. Note: known stub (4 blocks). Confirm it at least renders without error — don't expect depth.
- [ ] Click the "Simplify" toggle on any post. Confirm it toggles without breaking layout.

---

### Walk 7 — Mobile (real device, not devtools, ~15 min)

- [ ] **Home:** Stats row — all three numbers visible, no overflow. Journey strip — scrolls horizontally, fade gradient visible on right. Hero CTA button — comfortably tappable.
- [ ] **RAG Lab:** Scenario pill strip scrolls. Fade gradient visible. Selecting a scenario updates the config panel below (not side-by-side).
- [ ] **Agent Lab:** Tap a module from the list — sidebar collapses, content panel appears. Back button `← Agent Lab` visible at top. Tap it — sidebar re-opens.
- [ ] **Systems Lab:** Same pattern as Agent Lab. Back button reads `← Systems Lab` or the correct lab title.
- [ ] **PrepLab:** Tap a mode — sidebar collapses, mode loads. Back button `← PrepLab` visible. Tap it — mode selection screen re-appears.
- [ ] **Explore:** Tap a module — sidebar collapses, content loads. Back button `← Explore` visible.
- [ ] **GT post:** Open any post with a code block. Confirm it scrolls horizontally without breaking surrounding layout. Open any post with a table. Same check.
- [ ] Touch targets: tap the GT category filter pills, PrepLab sidebar mode buttons, Agents/Systems sidebar module items — all should feel comfortably tappable (no mis-tap needed).

---

### Walk 8 — Parked tabs (quick sanity, ~5 min)

- [ ] Navigate to `#flows` directly. Confirm Flows tab loads without JS error.
- [ ] Navigate to `#fluency`. Confirm Fluency tab loads without JS error.
- [ ] Navigate to `#consult`. Confirm Ask/Search tab loads, search input accepts text.
- [ ] `failures` module in Agent Lab — confirm it renders as a reference catalog (intentional, not broken).

---

**Pass criteria:** All 8 walks complete without a JS error in console, without a dead end (a state the user can't navigate out of), and without a layout break on mobile. JD Prep mode specifically must complete without a dead end. Any single console error or dead end = Batch 0 fails and must be fixed before Batch 1 opens.

**Feedback collected:** N/A — founder self-vet only.

---

## Batch 1 — First External Testers (RAG Lab + PrepLab Exam)

**Status:** Not open — opens after Batch 0 passes.

**User profile:** AI engineer or senior DS, 1–3 years experience, has shipped at least one RAG pipeline in production. Currently interviewing or likely to interview within 3 months. Not a friend doing you a favour — someone with real skin in the game who will give honest feedback because their career depends on knowing what they don't know.

**Scope:** RAG Lab (Missing Answer scenario) + PrepLab Exam mode (10 questions, RAG/retrieval cluster). Narrow intentionally — two things, both polished, not the whole product.

**Hypotheses being tested:**
1. The failure arc lands — testers understand *why* the system failed, not just that it did. (Does the root cause card do enough work, or do testers leave confused?)
2. The forward pointer is discovered — testers see the ✓ done card and at least one clicks through to PrepLab or the GT post.
3. PrepLab questions feel calibrated — not too easy (insults them), not too obscure (loses them). The difficulty feels like real interview pressure.
4. The product feels recommendable — "I would send this to a colleague" is the bar, not "interesting tool."

**Self-vet checklist (before any tester is invited):**
- [ ] Batch 0 passed fully — all 8 walks complete, no console errors, no dead ends
- [ ] RAG Lab Missing Answer scenario tested with 3 different configurations — failure arc fires correctly in all three, ✓ done card fires prominently in all three (done card placement fix must be shipped before this)
- [ ] PrepLab Exam mode: 10-question session completed — progress bar, correct/wrong states, session end all work
- [ ] **Access code gate live:** gate fires correctly at question 11 in a session. Community code entry grants access. localStorage persists across page reload. Gate does not fire for free content (Labs, GT).
- [ ] **Welcome modal live:** fires on first visit, "What are you here to do?" 3 options route correctly, localStorage flag prevents re-showing.
- [ ] Mobile: RAG Lab pill strip + PrepLab back button confirmed on real device

**Tester brief (send verbatim):**
> "I'm testing something — 20 minutes of your time, honest feedback only. Go to genai-systems-lab-ivory.vercel.app. Click into RAG Lab. Run the Missing Answer scenario — configure it however you'd set up a real system, watch it fail, and read the diagnosis. Then go to PrepLab and answer 10 questions in Exam mode. No hints, no googling. When you're done, I have two questions: (1) Was there any moment where you weren't sure what was happening or why? (2) Would you send this to someone you know who's interviewing for an AI engineering role?"

**Feedback target:**
- Where did they pause, re-read, or feel uncertain? (UX/copy gaps)
- Did the failure arc land — can they explain back what went wrong and why? (Core mechanic validation)
- Did they see the ✓ done card? Did they click the GT post or PrepLab link? (Forward pointer discoverability)
- Would they recommend it? To whom specifically? (Product-market fit signal)

**Pass criteria:** 3 of 5 testers complete both flows without asking for guidance. At least one piece of specific, actionable feedback per tester. At least 2 testers say they would recommend it unprompted. Zero testers report a broken state.

**Feedback collected:** Open — fill in below as responses come in. Close this field when Batch 2 opens.

| Tester | Profile | Completed flow? | Failure arc landed? | Saw done card? | Would recommend? | Key feedback |
|---|---|---|---|---|---|---|
| | | | | | | |

---

## Batch 2 — Broader Lab Coverage + Mobile Testers (Stub)

**Status:** Not open — opens after Batch 1 closes.

**Profile (draft):** Mix of AI engineers (same profile as Batch 1) and AI PMs or DS-to-AI-engineer transitioners. At least 2 testers who primarily use mobile. Batch 2 deliberately adds a non-engineer to probe whether the lab's framing makes sense to the PM/career-switcher persona.

**Scope (draft):** Agent Lab + Ground Truth (3–5 posts) + PrepLab beyond 10 questions (access code gate experience). Gate UX must be tested by real users — does it feel fair or does it feel like a wall? Interview Prep Plan phases 1–3 (free portion) also in scope for Batch 2.

*Fill in fully only after Batch 1 closes.*

---

## Batch 3 — Pre-Monetization Full Surface (Stub)

**Status:** Not open — opens after Batch 2 closes.

**Profile (draft):** Broader — include people who found the lab organically (LinkedIn share, word of mouth) rather than people you recruited directly. The goal of Batch 3 is to simulate what a stranger does when they land on the product with zero context.

**Scope (draft):** Full product. All Labs, GT, PrepLab all modes. Focus: does the product feel worth paying for? Does the free-to-paid boundary (gated PrepLab questions, JD Prep) feel fair or frustrating?

---

## Launch Checklist (Community Beta)

### Vercel environment variables
Set all four in Vercel → Project Settings → Environment Variables:

```
VITE_POSTHOG_KEY   = phc_your_actual_key
VITE_POSTHOG_HOST  = https://us.i.posthog.com
VITE_FEEDBACK_URL  = https://forms.gle/your_form_id
VITE_ADMIN_UNLOCK  = your_secret_preview_code
```

`VITE_ADMIN_UNLOCK` enables `?preview=CODE` to unlock all locked tabs. Use `?lock=1` to re-lock. All vars optional — app works without them (analytics silent, feedback shows fallback).

### Analytics setup
- [ ] Create PostHog project → copy Project API Key → add to Vercel env vars
- [ ] Redeploy after adding vars
- [ ] Visit app in incognito → confirm `home_viewed` appears in PostHog Live Events

### Feedback form setup (Google Forms)
Questions in order: (1) Background (Student/Analyst/Engineer/PM/Founder/Other), (2) Which module did you try?, (3) What was most useful?, (4) What was confusing?, (5) Would you share this with someone learning GenAI systems? Why/why not?, (6) Can we quote your feedback publicly? (Yes with name / Yes anonymously / No), (7) Email for follow-up (optional).

- [ ] Create form → copy `/viewform` URL → add as `VITE_FEEDBACK_URL` in Vercel

### Pre-launch QA (incognito window)
- [ ] Hero CTA → RAG Lab routes correctly
- [ ] Beta banner shows and dismissal persists on reload
- [ ] Feedback button opens form
- [ ] Mobile nav opens/closes; all tabs reachable
- [ ] RAG Lab: configure scenario → Evaluate → metrics update
- [ ] `?preview=YOUR_CODE` unlocks all locked tabs; `?lock=1` re-locks

### Where to share (priority order)
1. **Hacker News Show HN** — `Show HN: GenAI Systems Lab – interactive RAG/agent failure simulator, zero backend` (weekday 8–10am ET)
2. **LinkedIn** — mention zero-login angle, screenshot of RAG Lab
3. **r/MachineLearning** + **r/learnmachinelearning**
4. **Twitter/X** — tag AI practitioners, #RAG #LLMOps #AIEngineering
5. **Latent Space Discord** — `#show-and-tell`
6. **AI Builders / Lenny's community** (if access)
7. **Product Hunt** — use as launch moment once traction exists

### 7-day feedback review
- **Day 1–3:** Share everywhere. Don't read feedback yet.
- **Day 4:** First pass — look for pattern words: "confusing", "unclear", "didn't understand"
- **Day 5:** Triage — Bug / Clarity / Missing feature / Praise. Fix bugs immediately.
- **Day 7:** Ship one clarity fix. Reply to anyone who left an email.
- **Signal to watch for monetization readiness:** feedback pattern shifts from "confusing" → "missing X feature"

### Red flags (PostHog week 1)
- High `home_viewed`, very low `start_here_clicked` → hero copy not landing
- High `module_opened` for one tab only → other tabs not discovered
- Zero `evaluate_configuration_clicked` → RAG Lab being skipped

*Fill in fully only after Batch 2 closes.*
