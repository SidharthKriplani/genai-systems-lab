# CLAUDE.md — Session Briefing for AI Collaborator

Read this first at the start of every session. Contains everything needed to work without re-discovering context. Then read NEXT.md.

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

**Scale (post-sprint 45, June 2026):** 6 labs, 57 Systems modules, 27 Concepts modules (7 active gyms), 307 PrepLab questions, 226 GT posts, 4 PrepLab modes.

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

**Still open:**
- GT Series taxonomy — SERIES_META UI done in GroundTruth.jsx; zero posts in groundTruthIndex.js have `series` field. Need to tag all 226 posts.
- 3 PrepLab surgical mods shipped (`e1b7b38`) — trap-first reveal, free-text invitation, behavioral debrief. UPGRADES.md status not yet updated.
- 6 new PrepLab questions (Quantiphi Defense Pack cluster) — MCP, Bedrock AgentCore, multi-provider design, API failure handling, eval metric judgment, production prompt engineering.
- Trap field quality pass — overclaim→honest-reframe format for 4 clusters (~45 min each).
- Interview Signal Quantiphi entry — consulting archetype in INTERVIEW_EXPERIENCES.
- Tab keyboard shortcuts — R/A/E/L/P/G/C single-key nav.
- FidelityBadge dedup — still in App.jsx + Systems.jsx.
- React.lazy() code splitting — systematic, DECISIONS.md-worthy scope.
- `failures` module in Agent Lab — still a reference catalog.

For full audit findings see AUDITS.md.

---

## Session build log

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

**Sprints 37c–41** — see LINEAGE.md for detail. Key: GT state-aware reading mode, RAG Lab static corpus, 10 new PrepLab questions + sibling codebase analysis (39), shared components + streak heatmap + FeedbackBar + multi-select MCQ + CommonTrap expansion + AgentContextArch module (40), 7 new Concepts modules + 4 gyms activated + Prompt Lab (41).

*Sprints 1–37: see docs/archive/HISTORY.md*
