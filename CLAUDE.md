# CLAUDE.md — Session Briefing for AI Collaborator

Read this first at the start of every session. Contains everything needed to work without re-discovering context. Then read NEXT.md.

---

## Session architecture (decided sprint 79)

**One unified chat for all labs + LinkedIn.** No more separate sessions per project. Mount all relevant folders at session start. Spine files (CLAUDE.md, NEXT.md per project) are the persistence layer — the chat compacts, the files don't.

**Cross-lab state:** read `ECOSYSTEM_LEDGER.md` at project root before any cross-lab decision. STATE BOARD tells you what every other lab is doing. Append entries; never rewrite existing ones.

**Other lab CLAUDE.md locations:**
- PAL / MSL: separate repos (not mounted unless working on them)
- LinkedIn: `/Users/ASUS/Documents/Professional/LinkedIn/` — mount when doing distribution work

---

## Working relationship

Act as a product and engineering partner, not an assistant:
- Push back when something is wrong, weak, or not worth building
- Give an honest opinion before executing — if the idea is bad, say so first
- Don't pipeline every input into the backlog — most things don't belong there
- If a decision has a real cost or tradeoff, name it plainly
- The job is to build a good product, not to make every session feel productive

---

## What this project is

**GenAI Systems Lab** — free, static, interactive learning platform for AI engineers and PMs. No backend, no login, no ads. Deployed at `genai-systems-lab-ivory.vercel.app`.

Core mechanic: configure real AI systems, watch them fail, understand why. Every module is interactive and takes under 20 minutes.

**Scale (post-sprint 79, June 2026):** 6 labs, 57 Systems modules, 27 Concepts modules (7 active gyms), 597 PrepLab questions, 310 GT index entries (13 GT series, 3 interactive Systems modules), 6 PrepLab modes (+ Interview Sprint + Browse All), 6 challenge area landing pages, 2 learning paths. SSR pre-render active (318 static GT pages, sitemap.xml). Google Search Console verified.

**Business model:** Freemium. Free: all Labs + GT + modules + PrepLab 10q/session. Gated (code `DAI2026`): full PrepLab, Company Tracks, Interview Prep Plan phase 4. See DECISIONS.md §0.

---

## Tech stack — non-negotiable constraints

| Constraint | Rule |
|---|---|
| Language | `.jsx` only. **No TypeScript.** TypeScript breaks Vercel builds. |
| React hooks | Always `import { useState, useEffect } from "react"`. **NEVER `React.useState()`** — ReferenceError at runtime. |
| CSS | **Tailwind `zinc-*` palette only.** `gray-*`, `slate-*` are inconsistencies. Structural surfaces: `var(--bg)`, `var(--surface)`, `var(--surface-2)`, `var(--border)`. |
| Styling | No PostCSS. Tailwind v4 via `@tailwindcss/vite`. No external UI library. |
| Icons | **No `import from "lucide-react"`** — not in package.json, breaks Vercel build. Use inline SVGs only. |
| State | localStorage only. No backend, no API calls, no auth. |
| Routing | Hash-based (`#concepts`, `#systems`). No React Router. |
| Bundler | Vite 6. No webpack. |
| Deployment | Vercel free tier. Static. Auto-deploys from `main` on push. |

---

## Critical code rules

```
1. Destructure hooks:   import { useState, useEffect, useRef } from "react"  ✓
                        React.useState()                                       ✗

2. Color palette:       bg-zinc-950, border-zinc-800, text-zinc-400           ✓
                        bg-gray-900, border-gray-700                          ✗

3. Accent color:        var(--gal-build)  ✓    #22D3EE hardcoded              ✗

4. No TypeScript:       component.jsx     ✓    component.tsx                  ✗

5. Brace check:         node -e "const fs=require('fs');
                        const c=fs.readFileSync('src/FILE.jsx','utf8');
                        let o=(c.match(/\{/g)||[]).length,
                            cl=(c.match(/\}/g)||[]).length;
                        console.log('diff:',o-cl)"  → must be 0 before commit

6. GT block format:     { t: "p|h2|h3|callout|lab|code|list|table|refs|video|quote|divider" }

7. New Systems module:  Add component to src/systems/modules.jsx
                        Add entry to SYSTEMS_MODULES in Systems.jsx
                        Add ≥4 PrepLab questions in preplabQuestions.js

8. New lab:             src/LabName.jsx + lazy import in App.jsx + VALID_VIEWS
                        + routing case + ALL_TABS + NAV_GROUPS in src/config/nav.js

9. No emojis in code    unless already in existing data arrays
```

---

## File structure

```
src/
├── App.jsx                    # Root — routing, nav, theme toggle
├── Home.jsx                   # Landing — hero, door cards, streak heatmap
├── PromptLab.jsx              # Prompt Engineering Lab (6 scenarios)
├── FoundationModelsLab.jsx    # Foundation Models Lab (6 scenarios)
├── Concepts.jsx               # 27 modules, 7 active gyms
├── GroundTruth.jsx            # GT post renderer, 3-lens reading mode
├── PrepLab.jsx                # 4 modes + ScenarioPlayer + InterviewIntelMode
├── Systems.jsx                # 57 Systems modules shell + SYSTEMS_MODULES registry
├── Agents.jsx                 # 16 Agent Lab modules
├── systems/modules.jsx        # ← NEVER READ IN FULL (~15,000 lines)
├── groundTruthPosts.js        # ← NEVER READ IN FULL (~12,000 lines)
├── groundTruthIndex.js        # 226 GT post metadata + related[] arrays
├── ragScenarios.js            # RAG Lab scenario data + static corpus
├── shared.jsx                 # CommonTrapCallout, ProductionNoteChip, ForwardPointerCard, WhatNextCard, FeedbackBar
├── analytics.js               # PostHog — needs VITE_POSTHOG_KEY in Vercel env vars
├── index.css                  # Paper theme — dark default + [data-theme="light"] + all CSS vars
├── config/
│   ├── nav.js                 # ALL_TABS, GROUP_COLORS, NAV_GROUPS — source of truth for nav
│   └── gating.js              # FREE_QUESTION_LIMIT, RESULTS_FREE_LIMIT
└── data/
    └── preplabQuestions.js    # 307 questions (MCQ + text + multi + scenario)
```

**Context limit — never read these in full:**
- `src/systems/modules.jsx` — ~15,000 lines. Grep for function name, read ±100 lines.
- `src/groundTruthPosts.js` — ~12,000 lines. Grep for post id, read ±50 lines.
- `src/Concepts.jsx` — ~8,000 lines. Same pattern.

---

## PrepLab — schemas and modes

### Question schema
```js
// MCQ / multi / text
{ id, topic, difficulty, gated, type: "mcq|text|multi",
  question, options, correct, keywords, explanation, trap, readMore }

// Scenario
{ id, topic, difficulty: "hard", gated: true, type: "scenario",
  title, incident,
  steps: [{ prompt, choices: [4 strings], correct: idx, reveals: [4 strings] }],
  rootCause, trap }
```

**Scenario IDs built:** scenario-1 (RAG corpus), scenario-2 (agent loop), scenario-3 (eval rubric), scenario-4 (agents: tool poisoning), scenario-5 (finetuning: catastrophic forgetting), scenario-6 (evals: distribution mismatch)

### Sidebar modes
| Key | Label | Component | Gated? |
|---|---|---|---|
| `exam` | Assess | ExamMode | 10q/session free |
| `jdprep` | Interview Strategy | InterviewPrepMode (4-step Brief) | Phase 4 gated |
| `companyprep` | Company Tracks | CompanyPrepMode | Gated |
| `intexp` | Interview Signal | InterviewIntelMode (22 experiences) | Free |

Hidden (component exists, not in sidebar): `defense`, `heatmap`, `trainer`

---

## Theme system

**Dark (default):** `#110e0a` base, warm brown-black zinc scale.
**Light:** `[data-theme="light"]` — cream `#faf7f2` → ink `#1c1410`.
**Toggle:** sun/moon button in desktop header → `theme` state → `localStorage("gal-theme")`.

**CSS vars:** `--gal-build` (cyan dark / violet light), `--gal-build-tint`, `--gal-build-border`, `--gal-build-tint-md`, `--gal-build-tint-str`, `--gal-build-dark`.

---

## Git workflow — virtiofs workaround

`.lock` files cannot be deleted with `rm`. Always use this Python pattern:

```python
import os, subprocess, time

for lock in ['.git/index.lock', '.git/HEAD.lock']:
    try:
        with open(lock, 'w') as f: f.write('')
        os.rename(lock, lock + '.bak')
    except: pass

time.sleep(0.5)
subprocess.run(['git', 'add', 'src/FILE.jsx'])
r = subprocess.run(['git', 'commit', '-m', 'batch-X: description'], capture_output=True, text=True)
print(r.stdout); print(r.stderr)
```

**User pushes manually:** `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`

**Bash path mapping:** `/Users/ASUS/Documents/GitHub/genai-systems-lab` → `/sessions/.../mnt/genai-systems-lab/`

---

## Session protocols

### Opening checklist (do in order)
1. Connect `/Users/ASUS/Documents/GitHub/genai-systems-lab`
2. `git log --oneline -5`
3. Read `CLAUDE.md` (this file) + `NEXT.md` only
4. Check PostHog before any feature sprint
5. One commit per batch, brace diff = 0

### End-of-session checklist (update before closing)
1. **CLAUDE.md** — add sprint log entry (what built, commit hashes, new scale numbers)
2. **NEXT.md** — mark done items struck, update sprint header + scale line
3. **IDEAS.md** — mark built items ✅ Done, update header scale line
4. **UPGRADES.md** — mark completed upgrades Done, update "Last updated" line
5. **LINEAGE.md** — append sprint row at the bottom
6. Commit: `chore: MD sync sprint N — [brief summary]`

---

## MD file guide

### Active — read for specific work

| File | Purpose | Read when |
|---|---|---|
| `NEXT.md` | Current sprint tasks, gate, do-not-touch | **Every session start** (after this file) |
| `IDEAS.md` | Build backlog — Tier 1/2/3 + Retired | Before picking what to build |
| `UPGRADES.md` | Pending enhancements to existing components | Before improving anything existing |
| `DECISIONS.md` | Architectural + product rulebook | Before any structural or product decision |
| `METRICS.md` | Event catalog, localStorage keys, PostHog verification | Before building a new feature |
| `AUDITS.md` | All audit findings + open/closed status | Before running an audit; before building |
| `PARKED.md` | Deferred items with explicit unblock conditions | Before touching anything parked |
| `ROLLOUT.md` | Beta batch plan, launch checklist, tester briefs | Before inviting any tester |
| `SKELETON.md` | Module specs for coming-soon Concepts gyms, GT series taxonomy | Before fleshing out any skeleton/placeholder |
| `LINKEDIN.md` | Exposure map (GREEN/YELLOW/RED), 15 post ideas, backlink rules, posting sequence | Before any LinkedIn work or public linking decision |
| `COMPETITORS.md` | Full competitive intelligence — Dataford, Hello Interview, DataLemur, Exponent, market data | Before any positioning or distribution decision |
| `FEEDBACK.md` | User + tester feedback log — raw observations, interpretations, action status | After any tester session or when user feedback arrives |

### Archival — read only for historical context

| File | Contains |
|---|---|
| `LINEAGE.md` | Build chronology, why each tab/module exists |
| `docs/archive/HISTORY.md` | Sprint 1–37 detail |
| `docs/archive/PREPLAB_SPEC.md` | Original PrepLab revamp spec (Sprints A–E shipped; revamp parked) |
| `docs/archive/CONTEXT_AUDIT.md` | Context limit prevention guide for all three sibling labs |
| `docs/archive/BRAIN_TRANSFER.md` | Old session handoff format (superseded by this file) |

---

## RELATED_GT patterns

**Systems tab** (`Systems.jsx`):
```js
const RELATED_GT = {
  moduleId: [{ id: "post-id", title: "Post Title" }],
};
```

**Agents tab** (`Agents.jsx`):
```js
const AGENTS_RELATED_GT = {
  moduleId: [{ id: "post-id", title: "Post Title" }],
};
```

**GT post navigation** (from any component):
```js
onNavigate({ tab: "groundtruth", postId: "post-id" })
```

---

## Accent colors by tab group

| Group | Color | Usage |
|---|---|---|
| LEARN | `#6366f1` violet | Concepts, Flows |
| BUILD | `var(--gal-build)` cyan/violet | RAG Lab, Systems, Playground, Explore |
| GROW | `#22c55e` green | Fluency, AIPM, Career |
| Ground Truth | `#8b5cf6` violet-500 | GT posts, series |
| Warning/fail | `#ef4444` red | Failure states |
| Caution | `#f59e0b` amber | Warnings, Systems advanced modules |

---

## Structural rebuild — pending (read DECISIONS.md §5 before starting)

Build/Prove/Navigate three-door architecture is decided but not yet implemented. Nothing in the current nav reflects it. Full spec in DECISIONS.md §5. Do not build until PostHog confirms sufficient WAU.

---

## Field intelligence workflow

When a LinkedIn post / practitioner writeup is shared: (1) assess merit — real pain point, named concept, salary signal, or framing gap? (2) identify the specific GT/Systems/PrepLab gap. (3) add to IDEAS.md under the relevant Tier. (4) flag if it validates a positioning opportunity on the home page (zero build effort).

Source log (18 entries, May 2026): agentic AI engineer roles +280% YoY, prompt management as DevOps discipline, FDE model, training signal math gap, RNN→Transformer arc, DE Layer 3 stack, two-stage retrieval failure, agentic loop latency constraint, senior AI engineer interview rounds (Graph RAG + LangGraph), Common Trap layer gap, scaling laws, semantic caching, hybrid search, LoRA/QLoRA, fintech AI, Quantiphi Defense Pack. Full entries in git history (CLAUDE.md pre-sprint 45).

---

## Known open issues

**Verified still open (June 2026):**
- Trap field quality pass — overclaim→honest-reframe format for 4 clusters: rag, agents, eval, llmops (~45 min each). ~45 questions total.
- Agent Lab synthesis gap — `AgentFailureModes` + top 4 modules have no PrepLab forward pointer. `WhatNextCard` not found in Agents.jsx.
- React.lazy() code splitting — App.jsx uses 24 lazy() calls already but not all heavy views. Systematic pass is DECISIONS.md-worthy scope before doing.
- Mastery Room — 4 files staged (sprint 60), awaiting Supabase SQL run (`supabase_study_tables.sql`) then `git commit` + push.

**Already resolved (stale entries removed):**
- GT Series taxonomy — 322 entries in groundTruthIndex.js have `series:` field. Done sprint 55 + sprints 61–76.
- Quantiphi Defense Pack questions — quantiphi-1–6 confirmed in preplabQuestions.js. Done sprint 46.
- Tab keyboard shortcuts — 12 keydown handlers confirmed in App.jsx. Done sprint 49.
- FidelityBadge dedup — moved to shared.jsx sprint 46. Two remaining `FidelityBadge` references in App.jsx + Systems.jsx are the import/usage, not duplicated definitions.

For full audit findings see AUDITS.md.

---

## Session build log

**Sprint 92–93 (June 2026) — Foundations content quality pass:**
- Sprint 92g–92m: Foundations skeleton restructure (10 tracks, 57 modules), cross-frame leakage fix, nav four-pillar restructure, all 9 remaining tracks runner data (35 modules), initial rubric pass fixes (17 D2 inline defs, 1 D5 equation, 15 D8 MCQ augmentations). All in PENDING_APPROVALS awaiting push.
- Sprint 93 (this session): Full audit (FOUNDATIONS-AUDIT-REPORT.md, 52 modules, 13 dimensions). Pre-fix: 39 FAILs, 133 FLAGs, 0 shippable. Post-fix: 0 FAILs, 7 FLAGs, 52/52 shippable. Changes: D8 MCQ all-4-options for 37 modules (93a), D2/D12 30+ inline defs across 15 modules (93b), D5 equation blocks for 12 modules — scaling-laws/lora/attention/transformer/rlhf/flashattn/seq-parallel/managed-vs-selfhosted/cost-latency-concepts/vector-db-index-mechanics/hybrid-search-design/resolution-token-cost (93c), D11/D13 depth variance + 8 distractor upgrades (93d), depthTier+interviewWeight schema fields all 52 modules (93e), MCQ correct-always-A bug fixed → 13/13/13/13 distribution (93f). All stacked in one pending commit.
- **NEXT SESSION:** Walk 1 Critical bug fixes were started but agent was interrupted. Three open: (1) Hero copy rewrite in Home.jsx — generic, doesn't land in 5 sec; (2) "Test your understanding" CTA crash in RAG Lab done card — dead end; (3) Done card buried in corner — needs to be prominent, full-width. Read ROLLOUT.md Walk 1 findings before starting. Also: 7 remaining FLAGs in audit report are minor and non-blocking.



**Sprint 49 (June 2026) — Full structural redesign (in progress):**
- Build fix: orphan `</div>` in ExamConfig removed — Vercel build broken since sprint 48. Commit `c64f929`.
- User research: `USER_RESEARCH.md` created — 4 user types, belief gap verified, challenge-layer architecture decided.
- Redesign plan: `REDESIGN.md` created — 10 batches R1–R10, challenge-layer nav, hub pages, home rewrite. Full plan logged in NEXT.md.
- R1 done `3b0b870` — 8-item challenge-layer nav, ChallengeStub routing, keyboard shortcuts remapped.
- R2 done `66fa6b0` — Home rewrite: promise headline, challenge area cards (2+3 grid), judgment CTA, returning view updated.
- R3 done `35fd2c7` — Retrieval hub page (template): lab hero + 4 concepts + 4 GT posts + 3 PrepLab Qs + progress snapshot.
- R4–R7 done `e7a68bc` — EvaluationHub, AgentsHub, ProductionHub, FoundationsHub. All ChallengeStubs replaced. 71 modules in build.
- R8 done `4f0becc` — PrepLab judgment reframe, TOPIC_GROUPS aligned to challenge area names.
- R9 done `40ba9c6` — GT challenge area tagging, all 226 posts. Distribution: retrieval:19 agents:28 eval:8 prod:44 foundations:81 general:46.
- Readiness layer `13f7eda` — `src/readiness.js` shared helper, readiness badges on all 5 hub pages, per-area progress bars on returning home view. Levels: Just Starting / Building / Practitioner / Senior / Staff.
- Guided paths `65db981` — 3 curated sequences on returning home view: Getting Started (7 steps), RAG Production Ready (6 steps), Interview Sprint (6 steps). Each with progress bar + "Continue: [next step]" CTA. staffLayer expanded 30→41 questions (rag-10, rag-11, rag-12, agents-11, agents-12, llmops-7, llmops-8, safety-1, safety-3, ft-1, ft-4).

**Sprint 51 (June 2026) — PAL deep-read + eval depth + staffLayer:**
- PAL full product walkthrough: 42 screenshots analysed. 11 new IDEAS entries logged (`c517c46`).
- Evaluation GT: 8 → 13 posts. New: `llm-as-judge-failure`, `ragas-metrics-explained`, `eval-production-gap`, `human-eval-vs-llm-eval`, `fine-tuning-evaluation`.
- staffLayer: 41 → 60 entries. Added to: rag-8, reranker-1, retrieval-3, lctx-1, llmops-3, kv-2, serving-2, serving-6, a2a-4, ama-4, pcm-3, semcache-2, sd-q1, sd-q3, agentctx-2, agentctx-4, adversarial-1, adversarial-2, scenario-3. Commit `354dde4`.
- Progress page upgraded `7390b00`: stats banner (total questions + lab scenarios + concepts + role level + streak), readiness by area (5 bars, clickable), Study Plan (5 personalized suggestions from localStorage — weakest topic, review queue due, unvisited hub, RAG lab prompt, GT read), Review Queue (SRS-due items surfaced by name), Guided Paths (3 tracks). Progress added to primary nav.
- Still open (sprint 52): B3-B5 polish, module notes (B7), post-completion panel (B8), Supabase auth (B12-B15).

**Sprint 52 (June 2026) — Auth + module UX:**
- B7 module notes `f1282f7`: `ModuleNotes` shared component, localStorage `gsl-note-{id}`, autosave on blur, added to all Concepts gym modules.
- B8 WhatNextCard `f1282f7`: bookmark toggle (★/☆, writes gsl-bookmarks), "Build interview plan" CTA routes to jdprep mode. All 3 CTAs now in post-completion panel.
- B9 previous plan `f1282f7`: `gsl-interview-plan` key saved on analyzeJD + buildBrief. "PREVIOUS PLAN ACTIVE" banner on jdprep mount — Resume / Start fresh.
- B12+B15 Supabase auth `355afae`: `src/supabase.js` client + helpers. Google OAuth login button in desktop header (avatar + name when signed in). Progress page shows real name/avatar + "Sign in to save across devices" CTA. Cross-device sync: pushProgress on every nav change, pushKey on lab completion. Pull on sign-in. Sync keys: gsl-preplab-history, genai_leaderboard, gsl-concepts-mastery, gsl-preplab-spaced, gsl-bookmarks, streak.
- User action required: `npm install @supabase/supabase-js`, add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to Vercel, enable Google OAuth in Supabase Auth, run user_progress table SQL, add redirect URL.

**Sprint 54 (June 2026) — PAL-parity auth, Profile, cold home, nav overhaul:**
- Cold home animated hero `fefde75`: hero-anim-0–5 CSS keyframes added to index.css. Sign-in (Google + GitHub) promoted to PRIMARY CTA with gradient button + stat line (319q/6 labs/226 posts). PrepLab card reframed as "try a free question first". Ghost data snippets: 12 floating ML metrics (cosine_sim:0.847, latency_p99:1.8s, etc.) animating around hero — aria-hidden, hint at content inside.
- Profile.jsx PAL-parity rebuild `fefde75`: full sign-in wall when signed out (animated icon→headline→stats preview→auth buttons). Signed-in: avatar/initials with gradient fallback, member-since date, level badge (Explorer→Staff Engineer). 5-stat row. 5 readiness bars per challenge area (clickable to hub). Recent PrepLab activity feed. 10 achievement badges. Saved GT posts. Cross-device sync. Settings + export/import JSON.
- Auth event fix `c106aea`: `onAuthChange` in supabase.js now passes `(event, user)` — was silently discarding event. App.jsx handler now covers all 4 events: SIGNED_IN (track + redirect home→progress), INITIAL_SESSION (page refresh persistence — Supabase v2 gotcha, critical), TOKEN_REFRESHED (keep user current), SIGNED_OUT (clear user + navigate home). Reactive useEffect redirect added as belt-and-suspenders.
- NAV_GROUPS fix `e00742a`: TRACK group (Profile/Plans/Progress) added at top of sidebar — was completely missing despite routes existing since sprint 53. expandedItems state added.
- Full nav overhaul `839eae5`: CHALLENGES→SKILL AREAS. Each area now expands to show lab + Concepts + Practice Qs + Posts with counts (e.g. Retrieval: RAG Lab 6 scenarios / Concepts 4 modules / 51q / 19 posts). PrepLab expands to show 4 modes. Ground Truth `alwaysExpanded: true` with 6 series names (always open — psychological pull for new users). Plans.jsx rewritten as pricing/unlock page (FREE tier feature list, FULL ACCESS with DAI2026 access code input). Logo routes signed-in → `#progress`, signed-out → `#home`.
- Bug fixes `70e5604`: (1) Sidebar expansion — removed `subActive || active` from `isExpanded`; since all SKILL AREAS shared `id: "groundtruth"` sub-items, being on groundtruth expanded all areas simultaneously. Now only `forceOpen || expandedItems.has(id)`. (2) GT series deep-link — series sub-items now have `postId` field, click sets `gtPostId` + navigates to groundtruth (opens first post of series directly). Series names corrected to match SERIES_META. (3) Profile/Progress dedup — readiness bars removed from Profile (Progress owns them); Profile replaced with single "Your readiness dashboard →" link. AreaBar + getAllAreasReadiness import removed from Profile.jsx.
- Bug fixes `370b990`: (1) `onNavigate("progress")` in Profile silently failed — `navigateTo` destructures an object, passing a string gave `tab=undefined`. Fixed to `onNavigate({ tab: "progress" })`. (2) `removeBookmark` used `setSyncMsg(null)` as re-render hack — when syncMsg was already null, React bailed out and bookmark stayed visible. Fixed by converting `bookmarkIds` to proper useState. (3) Plans FULL ACCESS card showed "Free" as price (indistinguishable from FREE $0 tier) — replaced with code `DAI2026` displayed prominently, pre-filled in input, label changes to "ACTIVE" when unlocked.

**Sprint 58 (June 2026) — MVP coherence pass (Audit 29 implementation):**
- P0 items from PM audit implemented. Commit `7b249ee`. Brace diff: 0.
- Nav cleanup: "SKILL AREAS" → "CHALLENGE AREAS", "PRACTICE"/"LEARN" group labels removed (items speak for themselves), Plans & Access moved from top to bottom of sidebar.
- Guest RAG Lab access: "lab" added to GUEST_ALLOWED_TABS. Scenario 1 fully accessible to guests. Scenarios 2–6 locked via `switchScenario` guard + disabled + 🔒 visual on sidebar tabs + "Sign in to unlock all 6" prompt.
- Synthesis card: header now names the specific failure mode (`scenario.failure_mode_taught`). PrepLab CTA now routes via `navigateTo({ tab: "preplab", topic: fwd.topic })` instead of generic trainer. Guest sign-in CTA added after Scenario 1 completion ("5 more failure modes wait. Sign in to save and continue.").
- First-time user nudge: `isFirstTime` detection in ProgressView (ragPassed === 0 && totalAnswered === 0 && masteryArr.length === 0). Shows prominent "Start here → Open RAG Lab Scenario 1" banner at top of Progress page before stats.
- Plans copy: removed "Community code (free during beta)" + LinkedIn "Get it on LinkedIn →" link. Replaced with "Enter your access code" + "Full access is invite-only during beta. Reach out on LinkedIn to request access."
- P1 (Evaluation GT depth): documented in NEXT.md. Content work — 5–6 posts needed, topics listed.
- Still open (sprint 59): Evaluation GT posts (content), Agent Lab synthesis gap, Eval/LLM Lab completion state audit.

**Sprint 59 (June 2026) — Verification + P1 closure pass:**
- Sprint 58 verification: 10-item code check against actual implementation. Two failures found and fixed. Commit `80ca550`.
- Mobile scenario strip guest lock: `mobileGuestLocked` variable added, disabled + opacity-40 + 🔒 on mobile pill buttons. Parity with desktop sidebar.
- Plans "How it works" step 03: "community code" → "your access code". All three places in Plans.jsx now consistent.
- Synthesis audit across all 6 labs completed. Results: RAG (strong), FM Lab (good — preplabQ rendered), Prompt Lab (good — minor PrepLab routing gap, acceptable), Agent Lab (weakest — interview story only, no PrepLab routing), Eval/LLM Lab SystemsApp (no WhatNextCard found in modules.jsx — audit needed).
- Evaluation GT content plan created: 4 P1 posts + 1 P2 post with titles, descriptions, and interview Q mapping. Logged in NEXT.md.
- Agent Lab synthesis gap logged as P1 in NEXT.md: top 5 modules need PrepLab forward pointer.
- NEXT.md: sprint 59 P1/P2 build order set. Theme: MVP coherence continued, no distribution yet.
- Release-readiness pass: 11-item smoke checklist run against code. All pass. JS syntax failures were expected (Node can't parse JSX/ESM — Vite handles it; Vercel builds clean since `5eb6cbd`). PRIVATE_TEST.md created with tester profile, session instructions, observer questions, success/failure criteria, post-test decision framework.
- Distribution remains blocked. Next gate: private test with 3–5 mid-level AI engineers. See PRIVATE_TEST.md.
- Sprint 59 P1 code shipped `0d4f447`: EvaluationHub 4→8 GT posts + "All 13 evaluation posts →" label. Agent Lab `AgentDesignChallenge` done-state now names the specific challenge title + adds production context + routes PrepLab to `topic:"agents"`. Brace diff: 0.
- Key correction: PM audit claimed 8 evaluation posts. Code verified 13 fully-written posts (25–32 blocks each), all added in sprint 51. The "write 4 new posts" plan was solving a problem that didn't exist. The real gap was hub page discoverability (4 of 13 shown) — now fixed.
- Synthesis audit finalized: RAG strong, FM Lab good, Prompt Lab good, Agent Lab fixed this sprint, Eval/LLM Lab SystemsApp has no completion states — P2 structural work.
- Private test checklist written in NEXT.md. Product is ready for 3–5 person guided private test.

**Sprint 57 (June 2026) — PM product audit + statefulness logging:**
- Full PM product critique (Audit 29): identity, JTBD, user journey, IA, access model, retention, conversion, risks. No code this sprint.
- Naming clarified: GSL = product name (user-facing). GAL = internal code shorthand only. PAL = separate product, never a justification for GSL decisions without independent validation.
- DECISIONS.md §11: Primary JTBD is interview prep. ICP confirmed: mid-level engineer (3–6 years), transitioning into AI engineering, interviewing within 12 months.
- DECISIONS.md §12: RAG Lab Scenario 1 ("Missing Answer") ungated for guests — binding decision. Scenarios 2–6 gated. Synthesis card CTA prompts sign-in after completion.
- NEXT.md: Sprint 57 P0–P2 build order. P0: guest ungate + first-5-min onboarding path + real paid tier decision.
- IDEAS.md: 6 new items — guest activation (P0), onboarding path (P0), Daily Judgment mechanic (P1), Evaluation GT depth 5–6 posts (P1), sidebar cleanup (P1), hub room decision (P2).
- UPGRADES.md: 2 new entries — Activation Path, Synthesis Card Specificity.
- GT "render error" resolved: groundTruthPosts.js clean, CodeBlock fix (5b653a9) intact. No build error.
- Commit: `chore: MD sync sprint 57 — PM audit (Audit 29), DECISIONS §11–12, NEXT/IDEAS/UPGRADES/CLAUDE updated`

**Sprint 61 (June 2026) — GT mega-expansion (+23 posts, 4 new series):**
- Gap analysis: 367 Anki cards vs 235 existing GT posts. Identified 4 gap clusters: NLP origins, LLM internals, retrieval algorithms, LLMOps production, evaluation methods.
- Batch 4 Retrieval Deep Dives `6747996`: 5 posts — `ann-algorithms-deep-dive`, `learning-to-rank-explained`, `query-understanding-pipeline`, `inverted-index-from-scratch`, `two-tower-training-from-scratch`. Series `retrieval-depth` added to SERIES_META.
- Batch 5 LLMOps Production `0f2632b`: 6 posts — `drift-detection-production`, `deployment-patterns-ml`, `feature-store-patterns`, `model-registry-mlflow`, `retraining-triggers-strategies`, `ml-dockerization-patterns`. Series `llmops-production` added.
- Batch 6 Evaluation Deep Dives `c558470`: 6 posts — `ndcg-mrr-from-scratch`, `calibration-ece-from-scratch`, `annotation-inter-annotator-agreement`, `eval-flywheel-implicit-feedback`, `llm-judge-calibration`, `counterfactual-offline-eval`. Series `eval-depth` added.
- (Batches 1–3 were in previous session: NLP Origins 6 posts `0401439`, Build From Scratch Extended 6 posts `86763b9`, LLM Architecture Internals 6 posts `29863a1`. Series: `nlp-origins`, `build-from-scratch` extended, `llm-internals`.)
- **Scale post-sprint 61:** 262 GT index entries (was 235), 4 new series in SERIES_META. Brace diff = 0 on all commits.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 62 (June 2026) — NLP Practitioners series + interactive Systems modules:**
- NLP Practitioners GT series (5 posts): `bert-internals-explained`, `bi-encoder-vs-cross-encoder`, `sentence-transformers-production`, `vector-databases-compared`, `encoder-decoder-architecture`. Interview Sprint cheat sheet GT post added to career-strategy series.
- 3 interactive animated Systems modules: `BiEncoderVsCrossEncoder` (parallel vs sequential scoring animation), `BertPoolingLab` (WordPiece tokenizer + CLS vs mean pooling comparison), `VectorSimilarityExplorer` (SVG scatter plot + nearest neighbor highlighting).
- +15 PrepLab questions (bert-1/3, bienc-1/4, sbert-1/3, vecdb-1/3, encdec-1/2). RetrievalHub +3 posts +4 Qs. FoundationsHub +2 posts +2 Qs. Sidebar +1 series link.
- Bug fixes: duplicate exports (`1fcef9f`), groundTruthPosts.js malformed orphan fixed.
- Scale post-sprint 62: 386 PrepLab questions, 267 GT posts.

**Sprint 63 (June 2026) — Bangalore AI engineer prep track:**
- Bangalore market research: senior/staff/lead/applied scientist/researcher/FDE/MLOps role gaps vs existing GSL content. IDs of companies: Flipkart, Swiggy, Google, Amazon, Meesho, CRED, PhonePe.
- Interview Sprint PrepLab mode `fb05214`: 4 time horizons (2h/1d/3d/1w), color-coded urgency, GT post + exam CTAs.
- Bug fixes: 7 broken readMore postIds (`b3a9dcd`), NLP Origins + LLM Internals sidebar postIds (`dc98b12`).
- 13 new GT posts across 2 new series + how-i-build extensions:
  - `recommendation-systems` (5): two-tower-reco-architecture, collaborative-filtering-deep-dive, candidate-generation-vs-ranking, cold-start-problem, explore-exploit-recommendations.
  - `ml-foundations` (5): loss-functions-deep-dive, optimizers-explained, bias-variance-in-production, statistical-testing-ml, experimental-design-ablations.
  - `how-i-build` additions (3): how-id-build-recommendation-feed, how-id-build-fraud-detection, how-id-build-search-ranking-ecommerce.
- 27 new PrepLab questions: reco-1–12, ml-theory-1–12, mlsysdesign-1–3.
- All posts registered in groundTruthIndex.js (281 entries), SERIES_META + sidebar updated. Commits `4544aaa`, `2ba0b67`. Brace diff = 0 on all files.
- **Scale post-sprint 63:** 413 PrepLab questions, 281 GT index entries, 7 new GT series total, 5 PrepLab modes.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 64 (June 2026) — High-TC company prep track:**
- Honest role coverage gap analysis: Senior AIE (strong), Staff (decent), Lead (partial), Applied Scientist (improved), Research Engineer (missing), FDE (minimal), MLOps (solid).
- 5 new GT posts: `bayesian-reasoning-ml` (completes ml-foundations — MAP/MLE/priors-as-regularization/uncertainty/GPs/VI), `reading-ml-papers-critically` (series: research-taste — 5-question framework, baseline gaming, contamination, ablation completeness, compute opacity), `benchmark-overfitting-goodhart` (research-taste — Goodhart's Law, MMLU contamination, metric gaming vs. optimization), `high-tc-ai-company-interviews` (series: high-tc-targets — Cohere/Anthropic/Mistral/Sarvam/Krutrim/staff-Flipkart patterns), `ambiguous-system-design-framework` (high-tc-targets — 4-phase no-spec design framework, clarification playbook, architecture argument, failure preemption).
- 13 new PrepLab questions: firstp-1–6 (MAP prior, attention scaling, Adam second moment, cross-entropy/KL, BPR, AdamW), restaste-1–4 (significance, baseline tuning, MMLU contamination, Goodhart/CTR), hightc-1–3 (latency clarification, temperature scaling, staff week-1).
- 2 new GT series: `research-taste`, `high-tc-targets`. ml-foundations expanded to 6 posts (+ bayesian). Sidebar +2 links.
- 6 future items logged in IDEAS.md: think-out-loud mechanic, Research Engineer track, FDE track, Staff/Lead track, Bayesian extension, multilingual/Sarvam-Krutrim.
- Commit `86602dd`. Brace diff = 0 on all files.
- **Scale post-sprint 64:** 426 PrepLab questions, 286 GT index entries, 9 GT series.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 60 (June 2026) — GT post + private Mastery Room (staged, not committed):**
- GT post `3e10b95` — "The Vibe Coding Round Isn't About Coding" (id: `vibe-coding-interview-round`). Series: career-strategy. Tags: FDE, vibe coding, interview, career. Brace diff: 0.
- Mastery Room built — 4 files staged, awaiting `git commit` + `git push` from host terminal (sandbox cannot clear `.git/HEAD.lock` on macOS FUSE mount):
  - `src/utils/fsrs.js` — FSRS-4.5 algorithm (stability, difficulty, interval at 90% retention)
  - `src/studySeed.js` — 367 Anki cards: 120 LLM Foundations (lane7), 168 RAG & Retrieval (lane1 retrieval subset), 79 LLMOps (lane3 LLM-relevant subset)
  - `src/StudyRoom.jsx` — dual-gated (email check + Supabase RLS). Hub: module stats + due counts + one-click seed import. Study: card flip, 4-grade FSRS review, keyboard 1-4, progress bar, session tracking.
  - `src/App.jsx` — lazy import, `study` route, owner-only 🧠 nav badge
- `supabase_study_tables.sql` at `batch 1/` — run in Supabase SQL Editor before pushing
- `MASTERY_ROOM.md` — full state doc with pending steps, how it works, optional future work
- NEXT.md updated — two blocking manual steps at top of file

**Sprint 56 (June 2026) — UX correction pass:**
- UX/product audit completed. 8 issues found. See AUDITS.md Audit 28.
- GT #300 confirmed fixed in production after push.
- Fix #2 `92a1c8c`: Accordion single-open — `activeSection` string replaces `expandedItems` Set. Label click toggles open/close. One section at a time.
- Fix #3+#4 `aeacadd`: PrepLab mode card duplication removed from main area. Hub page exits added to all 5 hubs — "All Concepts →" and "All GT posts →" header links.
- Fix #5 `04db0e8`: PrepLab entry point personalised — SRS due items first, then weakest topic with accuracy, then fresh start. Topic grid shows per-topic accuracy for returning users.
- Fix #6-8 `2362e73`: Plans 2-state (Guest card removed — belongs in GateOverlay, not Plans). Profile removed from sidebar → header avatar click navigates to profile. Progress removed from sidebar → logo click navigates to progress. Plans & Access remains as single sidebar utility item.

**Sprint 55 (June 2026) — Bug fixes + guest access model + Plans + content:**
- Bug fixes `5b653a9`: (1) GT posts not opening — `useState(false)` inside `case "code"` of `Block` switch violated Rules of Hooks. Extracted `CodeBlock` component. (2) Sidebar chevron nested inside nav button (button-in-button) — restructured as sibling with `position:absolute`. (3) Nav subitems ("Concepts", "Posts", "Practice Qs") opened full unfiltered tabs — simplified to lab-only entries.
- Guest access model `e2d96bf`: Three-tier system (Guest / Free / Full). New `src/GateOverlay.jsx` — reusable sign-in gate (Google + GitHub) and upgrade gate (subscribe CTA + DAI2026 code input), contextual copy for 6 locked rooms. `GUEST_ALLOWED_TABS` set in App.jsx gates all non-allowed tabs for signed-out users. RAG Lab also gated. `openPostOrGate()` in GroundTruth.jsx gates non-pinned GT posts for guests (4 pinned always free). PrepLab: `user` prop threaded to ExamMode, save-progress nudge shown after 5 answers when not signed in. Foundations hub + FM Lab + Prompt Lab always free (never gated). DECISIONS.md §10 added.
- Plans page 3-tier redesign `cfe14ac`: Replaced 2-tier layout with 3 cards (Guest / Free Account / Full Access). Guest card shows what's accessible without an account + "Continue as guest" CTA. Free card shows all labs/GT/PrepLab + Google/GitHub sign-in buttons (active state if signed in). Full Access card shows premium features + code input. "How it works" 3-step funnel strip + labs strip at bottom.
- staffLayer expanded `d8e5377`: 57 → 68 entries. Added to: eval-4, eval-8, finetune-2, finetune-4, safety-4, safety-5, sd-q1, sd-q3. Clusters that were thin: evaluation, finetuning, safety, sysdesign.
- GT series taxonomy `3c29a1f`: 104 posts tagged with `series` field across all 17 series in groundTruthIndex.js. SERIES_META UI already existed — this closes the gap. Sidebar series deep-links now work end-to-end.

**Sprint 53 (June 2026) — Nav + Profile + Plans + GitHub OAuth:**
- Nav restructured `2b91a5a`: TRACK group at top (Profile, Plans, Progress), CHALLENGES, PRACTICE (PrepLab), LEARN (Ground Truth). Mirrors PAL hierarchy.
- Profile page `2b91a5a`: identity (avatar+name+email+member since), practice stats (5 pills), cross-device sync button, saved posts, settings (theme, export/import JSON). Google + GitHub sign-in buttons.
- Plans page `2b91a5a`: 4 structured tracks (Getting Started, RAG Production Ready, Interview Sprint, Full-Stack AI Engineer). Expandable checklists, auto-progress from localStorage, week estimates.
- GitHub OAuth `2b91a5a`: signInWithGitHub() in supabase.js, GitHub button in header + Profile + cold home page.
- Cold home sign-in push `2b91a5a`: "Sign in to save progress" section on cold visitor view between PrepLab CTA and hero demo.
- Session persistence fix `2b91a5a`: switched from getUser() (server round-trip) to supabase.auth.getSession() (localStorage, instant).

**Sprint 48 (June 2026) — Mock Exam Mode + Staff Layer + quick wins:**
- Mock Exam Mode (forward-only, red timer, MOCK badge, pulses < 5 min). Staff Layer (3rd tier, access-gated). Commit `f7af1f1`.
- staffLayer expanded: 10 → 30 questions across rag, agents, eval, llmops. CROSS_LAB.md created (lab boundary docs, cross-pollination map). RSS feed: `public/rss.xml` (30 GT posts). Commit `a44fe49`.

**Sprint 47 (June 2026) — cross-lab retention + adversarial scenarios:**
- 91-day heatmap, GT bookmarks (`gsl-bookmarks`), PrepLab spaced repetition (`gsl-preplab-spaced`, Review Due mode). Commit `97c2057`.
- Sparse heatmap guard: <7 active days shows "Day N — keep going" message instead of empty grid. 6 adversarial PrepLab questions (adversarial-1 through adversarial-6): RAG vs context window, vector DB vs SQL, agent vs webhook, keyword rules vs vector routing, fine-tune vs system prompt, rules vs RAG for compliance. Brace diff: 0. Commit `2bcbcec`. Scale: **319 PrepLab questions**.

**Sprint 46 (June 2026) — PrepLab content + polish + failure mode completeness:**
- 6 Quantiphi Defense Pack questions added (quantiphi-1 through quantiphi-6). Trap field quality pass: 10 traps rewritten to overclaim→honest-reframe format. Commit `bff96ac`. Scale: **313 PrepLab questions**.
- FidelityBadge dedup: moved to shared.jsx, removed from App.jsx + Systems.jsx. R/A/E/L/P/G/C tab keyboard shortcuts added. Quantiphi Interview Signal entry confirmed already present (id:38, `43545a7`). Commit `f7ce93a`.
- Failure mode completeness audit completed. GT links added to all 6 Prompt Lab scenarios + all 6 FM Lab scenarios (were the only 2 labs with no GT linkage). Production notes added to all 6 FM Lab scenarios (were entirely missing). Forward pointers updated in both labs to show GT post + PrepLab buttons. Commit `1dce7db`.

**Sprint 45 (June 2026) — MD consolidation:**
- 20 MD files → 12 active + archive. CLAUDE.md absorbs BRAIN_TRANSFER.md unique content. UPGRADES.md Done entries pruned. METRICS.md absorbs PostHog checklist. ROLLOUT.md absorbs beta launch checklist. docs/archive/ created with 7 files. Single commit: `6cc08c1`.

**Sprint 44 (June 2026) — audit session:**
- Codebase audit vs MD files. Stale entries corrected. GT thin posts confirmed expanded. GT series UI confirmed done, taxonomy pending. Quantiphi Defense Pack signal logged to IDEAS.md + UPGRADES.md. No code commits.

**Sprint 43 (June 2026):**
- Build fix: duplicate TOPIC_LABELS → INTEL_TOPIC_LABELS (`f8969fc`). Company Tracks: inline SVG icons + SimpleIcons company logos (`97ad851`, `f35f3be`). 3 new PrepLab scenarios: tool poisoning, catastrophic forgetting, eval distribution mismatch (`adf93d1`). Graph RAG confirmed fully shipped. Scale: 307 PrepLab questions.

**Sprint 42 (June 2026):**
- CLAUDE.md trimmed 587→371 lines + HISTORY.md created (`bfb28d2`). promptlab-5/6 + Role Readiness Score (`f96bc4a`). Foundation Models Lab: 6 scenarios (`6cb2194`). Paper warm theme + light mode + CSS vars + sun/moon toggle (`2884aa1`). Build fixes: duplicate declarations (`46bd398`, `9a70d75`). Theme audit phase 2: hardcoded #22D3EE → CSS vars (`c859fe6`). Interview Signal PrepLab mode: 22 experiences (`f33a123`). Scenario questions: ScenarioPlayer + 3 scenarios (`246f73f`). Scale: 6 labs, 304 PrepLab, 27 Concepts, 226 GT.

**Sprint 65 (June 2026) — Role coverage expansion (RE/Staff/FDE/Bayesian-ext/Indic tracks):**
- 7 new GT posts: `research-engineer-interview`, `staff-ai-engineer-week-one`, `engineering-influence-without-authority`, `fde-build-round-survival`, `conformal-prediction-production`, `probabilistic-graphical-models`, `indic-nlp-challenges`.
- high-tc-targets series expanded: 2→7 posts (added RE, staff week-1, influence, FDE build round, Indic NLP).
- ml-foundations series expanded: 6→8 posts (added conformal prediction, PGMs).
- 33 new PrepLab questions: re-1–10, staff-1–8, fde-1–5, bayesext-1–5, indic-1–5.
- App.jsx sidebar: 3 new series links (Research Engineer, Staff & Lead, Indic NLP).
- Role coverage post-sprint 65: Senior AIE 85%, MLOps 80%, Applied Scientist 85%, Staff 75%, Research Engineer 60%, FDE 60%, Indic/Sarvam 60%.
- Commit `0c747f3`. Brace diff = 0 on all files.
- **Scale post-sprint 65:** 459 PrepLab questions, 293 GT index entries, 11 GT series.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 66 (June 2026) — Lead/EM track, RE depth, FDE depth:**
- 8 new GT posts: `ic-to-em-transition`, `roadmap-ownership-ai-teams`, `managing-ai-engineers`, `ai-team-perf-calibration`, `rlhf-from-scratch`, `pretraining-data-decisions`, `customer-facing-ai-demos`, `ai-integration-debugging`.
- New series: `engineering-leadership` (4 posts — Lead/EM track).
- high-tc-targets expanded: +4 posts (RLHF, pretraining, demo patterns, integration debugging).
- 24 new PrepLab questions: lead-1–12, redeep-1–6, fdedeep-1–6.
- App.jsx sidebar: +1 series link (Engineering Leadership).
- Role coverage post-sprint 66: Lead/EM 75%, RE 80%, FDE 75%. All major gaps closed.
- Commit `256446c`. Brace diff = 0 on all files.
- **Scale post-sprint 66:** 483 PrepLab questions, 301 GT index entries, 12 GT series.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 67 (June 2026) — Bug audit + Browse mode + normalizeBlock:**
- **Root cause audit:** All sprint 61–66 GT posts stored with `c:` key (new format), but GroundTruth.jsx renderer only read `b.text`, `b.items`, `b.headers`, `b.rows`. Every post from those sprints was rendering blank. Fixed by adding `normalizeBlock()` to GroundTruth.jsx — converts `c:` key to all legacy keys expected by `Block`, `countMatches`, `generateQuiz`, and TOC heading extraction. Commit `3ea40b3`.
- **6 bug classes fixed in groundTruthPosts.js:**
  1. `},\n    {` literal (4-space) — Python `fix_multiline_strings` merged adjacent block objects with `\n` inside string. Restored to real newline. `bee927a`.
  2. `},\n      {` literal (6-space variant) — same cause. Fixed same commit `7fe66bc`.
  3. Missing closing `"` in indic-nlp-challenges list block — stray `'` from single-quote draft origin. `3ccd359`.
  4. Missing closing `"` in ai-integration-debugging list block — same pattern. `7fe66bc`.
  5. Two bare `,` lines (15933, 16078) between post entries — orphaned after prior block removal. `0cd366d`.
  6. 15 posts stored as `{ title, date, content: [...] }` objects — renderer does `POST_CONTENT[id].filter(...)` which fails on objects. Extracted blocks arrays via Node vm and rewrote as flat arrays. `3ea40b3`.
- **Browse All PrepLab mode:** `BrowseMode` component added to PrepLab.jsx. Topic + difficulty filters, scrollable question list, expandable cards showing MCQ options (correct highlighted), explanation, trap, mark-reviewed button. Sidebar entry added. Commit `802cf17`.
- **Process fix:** Node vm validation (`node -e "require('./validate.cjs')"`) must run after every groundTruthPosts.js write — brace diff only catches `{}` imbalance, misses quote errors, bare commas, object-format posts.
- **Role coverage post-sprint 67:** Senior AIE 85%, Applied Scientist 85%, MLOps 80%, RE 80%, Staff/Lead 75%, Lead/EM 75%, FDE 75%, Indic/Sarvam 60%. Gaps remaining: Research Scientist (no publication strategy), pure SWE→AI switcher path, live coding assessment prep.
- **Scale post-sprint 67:** 483 PrepLab questions, 301 GT index entries, 12 GT series, 6 PrepLab modes (Browse All added).

**Sprint 67 polish (June 2026) — Mobile + sidebar UX:**
- BrowseMode mobile layout fixed `e7fdb0a`: topic filter → horizontal scroll strip (no more wrap wall), difficulty filter → own dedicated row with label, padding `px-6` → `px-4 sm:px-6`, MCQ correct label shortened to `✓` to prevent overflow on narrow widths.
- Sidebar challenge area descriptor line `83597fa`: each Challenge Area now shows a muted monospace hint below the lab link when expanded (e.g. `4 Concepts · 28 GT posts · 50q`). Communicates hub page contents without duplicating nav. `maxHeight` animation accounts for the extra line height.

**Sprint 68 (June 2026) — LinkedIn soft launch infra:**
- 6 challenge area landing pages `6f54650`: `public/agents.html`, `retrieval.html`, `evaluation.html`, `production.html`, `foundations.html`, `preplab.html`. Each has area-specific og:title/description/colour, stats (modules/posts/questions), and CTA back into SPA at the correct hub hash.
- `vercel.json` updated: 6 new rewrites (`/agents` → `agents.html`, etc.) + catch-all regex updated to exclude all 6 new HTML files. Same pattern as existing `/start` → `start.html`.
- `index.html` OG/meta updated: stale "222+ posts" → "301 posts", "140+ modules" → accurate copy with 483 PrepLab questions, 6 labs, 301 posts.
- 5 LangChain/LangGraph PrepLab questions (`lchain-1` through `lchain-5`): LCEL vs LangGraph decision, AgentExecutor loop failure root cause, ConversationBufferMemory cost explosion, 8-tool latency fix via sub-agents, RAG faithfulness evaluation. Topic: agents.
- **Scale post-sprint 68:** 488 PrepLab questions, 6 challenge area landing pages.
- UTM strategy: use `?utm_source=linkedin&utm_campaign=<area>` on all shared links. PostHog captures automatically — requires `VITE_POSTHOG_KEY` Vercel env var.
- User must push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`

**Sprint 72 (June 2026) — First Principles path UX (B1–B6) + emoji removal:**
- B1: `goToStep(step, idx)` — added `idx` param. `pathContext` payload `{pathId, stepIdx, totalSteps, pathTitle, pathColor, pathAbbr, steps[]}` passed from LearningPaths → App.jsx (`gtPathContext` state) → GroundTruth.jsx → PostDetail prop.
- B2: Path context bar in GT PostDetail — colored banner: abbr badge, path name, step N of M, prev/next GT step buttons, ↩ Path link.
- B3: 3-mode reader — `readMode` state (`"skim"|"full"|"dense"`) replaces `simpleMode` bool. Skim: callouts+headings. Dense: skips intro prose (starts from first h2). Full: unchanged.
- B4: Callout openers on all 14 First Principles path posts in `groundTruthPosts.js` — `{t:"callout",c:"..."}` as first block: prerequisite chain + plain-English outcome statement.
- B5: Path-aware footer card at post end — progress bar (stepIdx/totalSteps), "Mark as complete" toggle, "Next: [label] →" navigates next GT step, "View path summary →" on last step.
- B6: Mark done button in context bar — toggles `gsl-path-progress[pathId]` array in localStorage, green indicator.
- Emoji removal: all 8 PATHS `emoji` field → `abbr` monospace badge; TYPE_CONFIG icons removed. Both sidebar and path header render styled `<span>` badges per path accent color.
- Commit `d57d929`. Brace diff = 0 on all 4 files.
- **Scale post-sprint 72:** 543 PrepLab questions (unchanged — no new content). Path UX fully complete.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 73 (June 2026) — Batch A: MCP + tool use + observability + testing:**
- Gap analysis: 27-track senior AI engineer curriculum (Teradata JD) mapped against GSL. Critical gaps in MCP architecture, idempotency/retry patterns, agent observability, agent testing, backend infra, and security.
- 4 GT posts — new series `agent-production` (cyan #06b6d4): `mcp-explained` (client-host-server model, tools/resources/prompts, security directionality), `agent-tool-use-production` (idempotency key design, read vs write retry, audit logs), `agent-observability` (trace anatomy, cost p95, TTFT, alert thresholds), `agent-testing-strategies` (why unit tests fail, mock-behavioral tests, trajectory evaluation, prompt injection red teaming).
- 26 PrepLab questions: mcp-1–6, toolprod-1–6, obs-1–6, agtest-1–8. Mix of free (intermediate) and gated (hard). All with readMore linking to new GT posts.
- Hub page updates: AgentsHub +4 posts (all Batch A), ProductionHub +agent-observability, EvaluationHub +agent-testing-strategies.
- App.jsx sidebar: "Agents in Production" series link added to GT sidebar section.
- Commits: `b72aaaa` (Batch A content), `ee7b242` (hub + sidebar). Brace diff = 0 on all files.
- **Scale post-sprint 73:** 569 PrepLab questions (was 543), 305 GT index entries (was 301), 13 GT series (was 12).
- Batches B+C + Senior AI Engineer path all complete by sprint 76.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 79 (June 2026) — Guest CTA, SSR pre-render, Search Console, session architecture:**
- Guest CTA fix `208d76d`: RAG Lab entry card added to cold home hero BEFORE PrepLab card. "No account needed" label. "The Missing Answer" scenario 1 framing. Routes to `#lab`. PrepLab card demoted to secondary (lower border opacity). Unblocks all LinkedIn backlinks to RAG Lab.
- SSR GT pre-render `6512b94`: `scripts/prerender-gt.js` — Node vm module reads groundTruthIndex.js + groundTruthPosts.js, generates 318 static HTML pages at `public/gt/{id}.html`. Each page: dark-styled, full content, SEO meta (title/desc/canonical/og/twitter), category badge, read time, CTA card back to SPA. `vercel.json` updated: `/gt/:id` → `/gt/:id.html` rewrite added before catch-all. `package.json` build script: `node scripts/prerender-gt.js && vite build`. `public/gt/` gitignored (regenerated at build time). `public/sitemap.xml` generated: 7 static URLs + 318 GT post URLs.
- Search Console `ba27ef8`: `<meta name="google-site-verification" content="e0_UnHviXoDM5loLno25p2oTW8KNi0Jzs9qIifx3vkY" />` added to index.html. URL prefix property verified (HTML tag method — DNS method fails because Vercel owns vercel.app domain).
- **Pending after push:** submit `sitemap.xml` in Search Console Sitemaps tab.
- Session architecture decision: consolidate to ONE unified chat (GSL + LinkedIn + all labs). No more multi-chat. Spine files (CLAUDE.md, NEXT.md) remain the persistence layer because chat compacts. ECOSYSTEM_LEDGER.md created at project root as cross-lab async state file.
- LinkedIn folder reviewed: 20 posts drafted (Weeks 1–4), 51 HTML cards built, Content Style Bible locked. **Voice pass still pending on all 20 posts** — blocking Mon Jun 22 launch. RAG failures carousel (Wk3 Wed) + semantic cache bug (Wk4 Mon) are first natural GSL linkback slots.
- ECOSYSTEM_LEDGER.md created at project root — STATE BOARD + DECISION LEDGER + MESSAGE THREAD. Skip-rules at top. All labs + LinkedIn current state recorded.
- **Scale post-sprint 79:** 597 PrepLab questions (unchanged), 310 GT index entries (unchanged), 318 static GT pages now indexed by Google.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 78 (June 2026) — Certificates, onboarding modal, agent synthesis, trap quality:**
- `src/CertificateModal.jsx` created — canvas-based PNG certificate. Renders path name, user full name (from Supabase user_metadata, fallback to email prefix, fallback to "AI Engineer"), completion date, path accent color borders + gradient bar, abbr badge, GSL branding, step count. Download PNG via `canvas.toDataURL()` + anchor click. LinkedIn share via `share-offsite` deep link. Triggered from LearningPaths.jsx footer when `done.size === path.steps.length`.
- `src/OnboardingModal.jsx` created — 3-question first-sign-in flow. (1) When is your interview? (2w/1m/3m/exploring). (2) Target role? (AIE/Applied Scientist/MLOps/AI PM). (3) Biggest gap? (retrieval/agents/evaluation/production/foundations). Auto-routes to challenge area hub after step 3. Saves `{ timeHorizon, role, gap, completedAt }` to `gsl-onboarding` localStorage. Triggered in App.jsx on SIGNED_IN only (not INITIAL_SESSION — no repeat for returning users). Progress dot strip + pill expansion animation. `hasCompletedOnboarding()` guard exported.
- Agent Lab synthesis gap closed — `ForwardPointerCard` added to 6 core modules: `ReActPattern`, `ToolUseDesign`, `AgentMemory`, `MultiAgentPatterns`, `AgentFailureModes`, `PlanningPatterns`. Two stale `onNavigate("preplab")` calls fixed to `onNavigate({ tab: "preplab", topic: "agents" })`.
- Trap quality pass (lchain cluster) — 4 trap fields (lchain-2 through lchain-5) rewritten from MCQ-letter-referencing to overclaim→honest-reframe format.
- PostHog analytics wired (previous sub-session): UTM pageview capture in analytics.js; 4 tracking calls in PrepLab.jsx (`preplab_mode_changed`, `preplab_gate_hit`, `preplab_session_completed` ×2). Commit `74fdcd8`.
- Commit `7b114e0`. Brace diff = 0 on all 6 files.
- **Scale post-sprint 78:** 597 PrepLab questions, 310 GT index entries (no new content).
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 77 (June 2026) — Competitive audit + MD sync:**
- Full research on Dataford, Hello Interview, DataLemur, Exponent, Interview Query, DeepLearning.AI, fast.ai, HF courses, W&B, LangChain Academy, cheating tool cohort, distribution mechanics (NeetCode, ByteByteGo).
- `COMPETITORS.md` created — full intel report: tier 1/2/3 competitors, market data (AI roles +41.8% YoY, 56% wage premium), proven mechanics, GSL differentiators vs gaps, 90-day bridge plan (SSR fix → LinkedIn cadence → certificates → onboarding capture).
- `IDEAS.md` updated — "Distribution & Growth" section added: P0 SSR pre-render, P0 LinkedIn cadence, P1 completion certificates, P1 onboarding capture, P1 Discord, P2 newsletter, P2 canonical artifact.
- `DECISIONS.md §13` added — competitive positioning: lane owned, four proven win mechanics, moat to defend, anti-patterns to avoid, pricing signal from research ($89/yr validated by Dataford).
- **Critical finding:** GSL is a client-rendered SPA — 310 GT posts are invisible to Google. Dataford has 30,000+ indexed pages. SSR fix is the single highest-ROI change available before any new feature work.
- **Critical finding:** Hello Interview is the sleeper threat — same ICP (senior AI engineer interviews), no interactivity (GSL's moat). Watch quarterly.
- **No code commits this sprint** — pure MD sync.
- **Scale unchanged:** 597 PrepLab questions, 310 GT index entries.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 76 (June 2026) — Senior AI Engineer learning path:**
- `senior-ai-engineer` path added to `LearningPaths.jsx`: 13 steps, cyan `#06b6d4`, ~5 hrs, audience: mid-level engineers targeting senior roles. Steps: mcp-explained → agent-tool-use-production → agentarch (Systems) → agent-observability → agent-testing-strategies → agent-backend-apis → async-task-queues-agents → kubernetes-ai-workloads → agent-security → agent-governance → guardrails (Systems) → llmops-production-checklist → PrepLab (agents topic). Covers all Batches A+B+C in a single guided sequence.
- App.jsx sidebar: "Senior AI Engineer Track" added as second path subitem under Ground Truth. Note: "production".
- Commit `0e5682e`. Brace diff = 0.
- **Scale post-sprint 76:** 597 PrepLab questions (unchanged), 310 GT index entries (unchanged).
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 75 (June 2026) — Batch C: Agent security + governance:**
- 2 GT posts (extended agent-production series): `agent-security` (prompt injection taxonomy: direct/indirect/tool-result, OWASP LLM01/07/08/02, least privilege tool classification: read-only/write/destructive, input+output guardrails, supply chain attacks via MCP servers and retrieval corpus), `agent-governance` (data lineage: action lineage record + retrieval lineage + data access log, model version pinning + stage promotion, prompt versioning as code with semantic versions + review gates, rollback triggers: failure rate/quality score/error rate thresholds, HITL approval gates for irreversible actions).
- 11 PrepLab questions: sec-1–6 (indirect injection class, least privilege tool design, OWASP LLM08 mitigation, supply chain attack via MCP server, output guardrail purpose, tool risk ranking), govern-1–5 (data lineage purpose, model version pinning, rollback trigger design, HITL approval gate design, prompt versioning as code).
- SERIES_META agent-production: 7→9 postIds. AgentsHub +agent-security. ProductionHub +agent-governance. Commit `fb960b4`.
- **Scale post-sprint 75:** 597 PrepLab questions (was 586), 310 GT index entries (was 308). Batches A+B+C complete — 9-post agent-production series covers the full senior AI engineer curriculum gap.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 74 (June 2026) — Batch B: Agent backend infra:**
- 3 GT posts (extended agent-production series): `agent-backend-apis` (202+polling vs SSE vs webhook, SSE nginx buffering fix, request deduplication, model-availability readiness probes, token-based rate limiting), `async-task-queues-agents` (task state machine PENDING→RUNNING→SUCCESS/FAILURE, visibility timeout recovery, exactly-once execution with distributed Redis lock, Celery chord for fan-out, DLQ design, result TTL), `kubernetes-ai-workloads` (GPU requests: nvidia.com/gpu limit==request, model loading: init container vs PVC vs registry pull, KEDA vs HPA: CPU wrong signal for LLM, PDB minAvailable guard, graceful termination PreStop hook, readiness vs liveness distinction for model-serving pods).
- 17 PrepLab questions: apiback-1–6 (async endpoint design, SSE nginx buffering, deduplication, readiness probe scope, token rate limiting, 502 proxy timeout), taskqueue-1–6 (gateway timeout cause, visibility timeout recovery, idempotency key timing, DLQ purpose, chord vs group, result backend separation), k8sagent-1–5 (GPU no-overcommit, HPA fails for GPU-bound, KEDA use case, PDB purpose, readiness vs liveness distinction).
- ProductionHub +3 posts. SERIES_META agent-production: 4→7 postIds. Commit `82a1aae`.
- **Scale post-sprint 74:** 586 PrepLab questions (was 569), 308 GT index entries (was 305).
- Batch C + Senior AI Engineer path complete by sprint 76.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 71 (June 2026) — Intermediate questions + react-pattern + readMore fixes:**
- 8 intermediate Foundations questions (`found-int-1` through `found-int-8`): encoder vs decoder architecture choice, LoRA rank selection, multi-head vs single-head attention, perplexity as downstream proxy, catastrophic forgetting, fine-tune vs prompt decision signals, KV cache memory cost, MHA vs GQA architecture.
- 4 intermediate RAG questions (`rag-int-1` through `rag-int-4`): hybrid search failure analysis decision, chunk size framework, reranker latency tradeoff, RAG vs fine-tuning decision.
- 3 react-pattern questions (`react-1` beginner, `react-2` B-I, `react-3` intermediate): closes the last empty step in First Principles Path (was showing 0 linked questions).
- 2 broken readMore postIds fixed: `found-beg-6` + `found-bi-5` had `postId: "long-context-window"` (non-existent) → corrected to `context-window-guide`.
- Commit `ff62da0`. Brace diff = 0.
- **Scale post-sprint 71:** 543 PrepLab questions (was 528). First Principles Path now fully linked: all 14 GT steps have practice questions.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 70 (June 2026) — First Principles Path + bidirectional PrepLab linking:**
- First Principles Path added to `LearningPaths.jsx` as the first path in the PATHS array. 14 GT steps: ngrams-to-neural → attention-from-scratch → mha-mqa-gqa-explained → bert-internals-explained → pretraining-data-decisions → context-window-guide → finetune-playbook → how-rag-works → vector-databases-compared → bi-encoder-vs-cross-encoder → two-stage-retrieval-reranker → llm-evaluation-guide → your-prompt-is-code → react-pattern. Plus PrepLab CTA. Violet `#8b5cf6` theme.
- `GT_QUESTION_MAP` built at module load: filters all PREP_QUESTIONS for `readMore.postId`, groups by postId. O(1) lookup per step.
- `LinkedQuestions` component: expandable per-step practice section for GT steps. Difficulty chips (DIFF_CHIP/DIFF_SHORT), shows up to 5 questions, "Try →" navigates to PrepLab. 12 of 14 path steps have linked questions.
- App.jsx sidebar: `{ id: "paths", label: "First Principles Path", note: "start here" }` added as first subitem under Ground Truth group. Routes to `paths` tab.
- Commit `11e8d3f`. Brace diff = 0 on both files.
- **Scale post-sprint 70:** unchanged (528 PrepLab q, 301 GT entries) — no new content, only UX.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprint 69 (June 2026) — Difficulty tier expansion + curriculum quality overhaul:**
- GT sidebar cleaned `785c494`: removed 10 advanced series (Recommendation Sys, Research Taste, High-TC Targets, Research Engineer, Staff & Lead, Indic NLP, Engineering Leadership, Data Flywheel, LLMOps Production, NLP Practitioners). Kept 11 foundational series.
- 5 new difficulty values: `beginner`, `beginner-intermediate`, `intermediate`, `staff`, `daunting`. New `type: "daunting"` question type with `answers: [{label, content, correct}]` + `synthesis_note`.
- `foundations` topic added to `TOPIC_COLORS`, `TOPIC_LABELS`, and `engineering` focus pool in `drawQuestions`.
- `DIFF_ACCENT` + `DIFF_CHIP` lookup maps replace if/else chains in `QuestionCard` for all 8 difficulty values.
- BrowseMode: `openAnswers` state for per-answer toggle, difficulty filter expanded to 8 values (`B-I` label for beginner-intermediate), `diffColorMap` for all tiers, daunting answer panels with violet theme.
- `drawQuestions` excludes `type === "daunting"` — browse-only, not exam pool.
- 40 new questions: 8 beginner + 8 B-I Foundations (`found-beg-1–8`, `found-bi-1–8`), 8 beginner + 8 B-I RAG (`rag-beg-1–8`, `rag-bi-1–8`), 3 Staff Foundations (`found-staff-1–3`), 2 Staff RAG (`rag-staff-1–2`), 2 Daunting (`daunt-arch-1`, `daunt-rag-1`).
- **Scale post-sprint 69:** 528 PrepLab questions, 301 GT index entries, 6 PrepLab modes.
- User must push: `cd ~/Documents/Professional/GitHub/upskill\ platforms\ \(4\)/genai-systems-lab && git push origin main`

**Sprints 37c–41** — see LINEAGE.md for detail. Key: GT state-aware reading mode, RAG Lab static corpus, 10 new PrepLab questions + sibling codebase analysis (39), shared components + streak heatmap + FeedbackBar + multi-select MCQ + CommonTrap expansion + AgentContextArch module (40), 7 new Concepts modules + 4 gyms activated + Prompt Lab (41).

*Sprints 1–37: see docs/archive/HISTORY.md*

---

## Concepts.jsx — 5 rebuilt modules (PUSH PENDING, as of 2026-07-01)

File: `src/Concepts.jsx`
Modules rebuilt to 3x patience standard: AgentPlanning, InstructionTuning, FinetuningVsRAG, SystemPrompts, StructuredOutputs.

Push command (run on Mac):
```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/Concepts.jsx && \
git commit -m "Rebuild 5 thin interactive modules: AgentPlanning, InstructionTuning, FinetuningVsRAG, SystemPrompts, StructuredOutputs — 3x patience standard" && \
git push origin main
```

---

## foundationsRunnerData.js — S-tier gap fixes needed (as of 2026-07-01)

File: `src/data/foundationsRunnerData.js` — NOT edited yet.
Target: all 14 S-tier modules to 9.5/10. Gaps confirmed per module:

**`llm-as-judge` (5→9.5):** pairwise vs pointwise, self-enhancement bias, mechanistic WHY for position bias, rubric design, G-eval/MT-bench reference, calibration mechanism. Add 1 MCQ: pairwise vs pointwise.

**`sampling` (6→9.5):** repetition penalty (mechanism: multiply repeated token logits by 1/penalty before softmax), beam search (what + WHY not for LLMs — memory scales with beam width × seq len), min-p, length penalty, causal derivation of top-k failure. Add 1 MCQ: repetition penalty.

**`instruction-tuning` (6→9.5):** show actual training pair format (Alpaca/ChatML/Llama3 template), chat templates WHY (models trained on specific delimiters fail without them), data quality > quantity axis, multi-turn failure mode. Add 1 MCQ: data format/chat template.

**`finetuning-vs-rag` (7→9.5):** both-together pattern, update frequency as decision axis, inference overhead axis (RAG adds latency, SFT adds zero), "neither" case (prompting sufficient).

**`rag-pipeline` (7→9.5):** query rewriting (WHY raw queries fail — vocabulary mismatch), context precision/recall as eval metrics, iterative/agentic retrieval, full pipeline causal chain (query → rewrite → retrieve → rerank → generate → cite).

**`embeddings` (7→9.5):** L2 normalization → cosine equivalence, MTEB benchmark, ColBERT/late interaction (token-level vs sentence-level), Matryoshka embeddings, dim tradeoff (larger = better recall, higher storage/compute).

**`transformer` (8→9.5):** pre-LN vs post-LN (WHY pre-LN trains more stably), encoder-decoder arch (when vs decoder-only), WHY FFN is 4× hidden dim.

**`rlhf` (8→9.5):** KL penalty mechanism (WHY — prevents reward hacking/model collapse), DPO (log-ratio of preferred/rejected, no separate reward model), alignment tax.

**`kv-cache` (8→9.5):** prefix caching (system prompt cached once, shared across requests), sink tokens causal explanation (WHY first tokens get high attention — positional anchor), 1M context impossibility math (2 × layers × heads × head_dim × bytes × seq_len).

**`lora` (8→9.5):** adapter merging (W = W0 + BA merged at inference → zero overhead — most-tested LoRA fact), alpha/r scaling (effective LR = alpha/r × optimizer LR), layer selection reasoning (attention projection layers targeted).

**`scaling-laws` (8→9.5):** emergent abilities (discontinuous capabilities at scale thresholds), data quality scaling (Phi-2/Mistral: smaller models beating larger via better data).

**`chain-of-thought` (8→9.5):** when CoT hurts (simple arithmetic, reasoning as distraction), CoT faithfulness problem (stated reasoning ≠ actual computation), Tree-of-Thought.

**`hallucination` (8→9.5):** intrinsic vs extrinsic taxonomy (intrinsic = contradicts source, extrinsic = not verifiable), lost-in-the-middle effect.

**`attention` (9→9.5):** multi-head mechanism WHY (different heads attend to different relationship types), how outputs combined (concatenate → linear projection), cross-attention (Q from decoder, K/V from encoder).

---

## GSL tier reference — all 63 module IDs

**S-tier (14) — every LLM interview:**
attention, transformer, kv-cache, lora, rlhf, sampling, instruction-tuning, finetuning-vs-rag, rag-pipeline, embeddings, hallucination, chain-of-thought, scaling-laws, llm-as-judge

**A-tier (15) — senior/staff interviews:**
tokenizer, agent-planning, structured-outputs, system-prompts, context, chunking, reranking, vector-db-index-mechanics, eval-loop, eval-design, prompt-security, alignment-techniques, agent-tools, pretraining, multiagent

**B-tier (34) — specialized/nice-to-know:**
seq-parallel, positional-encoding, training-signal, nextoken, tempgame,
agent, guardrails, agent-tracing, agent-memory,
debug, rag-eval,
cost-latency-concepts, flashattn, latency-planner, observability-concepts, prompt-regression-signals, quality-drift, cost-attribution, managed-vs-selfhosted, enterprise-ai-cost-model,
model-families, zero-shot, few-shot,
hybrid-search-design, metadata-filtering, pgvector-vs-managed, vector-migration-patterns,
vision-language-arch, multimodal-rag, resolution-token-cost, ocr-pipeline-design,
red-teaming, jailbreak-taxonomy, safety-measurement

**Gym → module mapping:**
- Language Models: seq-parallel, tokenizer, attention, positional-encoding, transformer, training-signal, nextoken, sampling, tempgame, hallucination, kv-cache
- Retrieval: embeddings, chunking, rag-pipeline, context, reranking
- AI Agents: agent, agent-tools, guardrails, agent-tracing, agent-memory, agent-planning, multiagent
- Evaluation: eval-loop, eval-design, debug, llm-as-judge, rag-eval
- Production Systems: cost-latency-concepts, flashattn, latency-planner, observability-concepts, prompt-regression-signals, quality-drift, cost-attribution, managed-vs-selfhosted, enterprise-ai-cost-model
- Foundation Models: pretraining, instruction-tuning, model-families, scaling-laws, rlhf, lora, finetuning-vs-rag
- Prompt Engineering: zero-shot, few-shot, chain-of-thought, system-prompts, structured-outputs, prompt-security
- Vector Infrastructure: vector-db-index-mechanics, hybrid-search-design, metadata-filtering, pgvector-vs-managed, vector-migration-patterns
- Multimodal AI: vision-language-arch, multimodal-rag, resolution-token-cost, ocr-pipeline-design
- AI Safety & Alignment: alignment-techniques, red-teaming, jailbreak-taxonomy, safety-measurement
