# Brain Transfer — GenAI Systems Lab
## For the next Claude session. Paste this at the top. Read CLAUDE.md + NEXT.md after.

---

## Repository

**Path:** `/Users/ASUS/Documents/GitHub/genai-systems-lab`  
**Deployed:** `genai-systems-lab-ivory.vercel.app`  
**Stack:** React 18 + Vite 6 + Tailwind v4 (zinc palette only). No TypeScript. No backend. No React Router. Hash-based routing.  
**Push:** User pushes manually — `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`

---

## STATEFULNESS PROTOCOL — DO THIS EVERY SESSION

At session END, before closing:

1. **CLAUDE.md** — add sprint log entry (what was built, commit hashes, new scale numbers)
2. **NEXT.md** — mark done items ~~struck~~, update sprint header + scale line
3. **IDEAS.md** — mark any built items as ✅ DONE, update header scale line
4. **UPGRADES.md** — mark any completed upgrades as Done, update "Last updated" line
5. **LINEAGE.md** — append sprint row at the bottom
6. **BRAIN_TRANSFER.md** — update scale table, sprint log, next build queue
7. Commit: `chore: MD sync sprint N — [brief summary]`

**Why this matters:** Stale MD files = next session reads wrong state = 15-30 min wasted rediscovering context. If you read a file, you update it. No exceptions.

---

## GIT COMMIT PATTERN — THE ONLY WAY THAT WORKS

The VM filesystem (virtiofs) creates `.lock` files that `rm` cannot delete. Always use this Python pattern:

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

**Never use `git commit` directly in bash** — it will hang on the lock file.  
**User pushes manually** — VM has no network push access.

---

## Current Scale (June 2026, post sprint 43)

| Asset | Count |
|---|---|
| Labs | **6** — RAG Lab, Agent Lab, Eval Lab, LLM Lab, Prompt Lab, Foundation Models Lab |
| Systems modules (in nav) | **57** |
| Concepts modules | **27** (7 active gyms) |
| PrepLab questions | **307** (304 MCQ/text/multi + 6 scenario type, 3 added this sprint) |
| GT posts (index) | **226** |
| PrepLab modes | **4** — Assess, Interview Strategy, Company Tracks, Interview Signal |
| Explore modules | 22 |
| Agent Lab modules | 16 |

---

## What Was Built — Sprint 43 (June 2026)

- **Build fix: duplicate TOPIC_LABELS** (`f8969fc`) — `InterviewIntelMode` redeclared `TOPIC_LABELS` at module scope. Renamed to `INTEL_TOPIC_LABELS`. Vercel build unblocked.
- **Company Tracks: inline SVG icons + SimpleIcons company logos** (`97ad851`, `f35f3be`) — Archetype cards: emoji → inline SVG shapes (Building2/Rocket/Globe2/Landmark). Company pills: SimpleIcons CDN logos for 12 companies (Google, Meta, Amazon, Apple, Anthropic, OpenAI, Perplexity, Flipkart, Razorpay, Accenture, Deloitte, IBM); letter-avatar fallback for Cursor/Swiggy/Zepto/McKinsey. `CompanyLogo` component + `COMPANY_ICONS` map + `ARCHETYPE_ICONS` map. **Lesson:** lucide-react is not in package.json — always use inline SVGs, never import from lucide-react.
- **3 new PrepLab scenario questions** (`adf93d1`) — scenario-4 (agents: tool poisoning via corpus contamination), scenario-5 (finetuning: catastrophic forgetting lr=5e-5 full fine-tune), scenario-6 (evals: eval distribution mismatch FAQ vs prod). Total: **307 PrepLab questions**.
- **Graph RAG confirmed already fully shipped** — module + SYSTEMS_MODULES + RELATED_GT + 4 PrepLab questions all present since sprint 33. Stale NEXT.md entry closed.
- **MD sync** (`7050f42`) — CLAUDE.md scale updated, NEXT.md sprint header updated.

## What Was Built — Sprint 42 (June 2026)

- Context management: CLAUDE.md 587→371 lines, HISTORY.md, CONTEXT_AUDIT.md (`bfb28d2`)
- promptlab-5/6 + Role Readiness Score (`f96bc4a`)
- Foundation Models Lab: 6 scenarios, 4 PrepLab questions (`6cb2194`)
- Paper theme system: warm dark + light mode + CSS vars + sun/moon toggle (`2884aa1`)
- Build fixes: duplicate declarations in App.jsx + Agents.jsx (`46bd398`, `9a70d75`)
- Theme audit phase 2: hardcoded `#22D3EE` → CSS vars across 5 files (`c859fe6`)
- Interview Signal PrepLab mode: 22 experiences, topic chart, filters (`f33a123`)
- Scenario questions: ScenarioPlayer + 3 scenarios (scenario-1/2/3) (`246f73f`, `f549517`)

---

## Critical Lessons Learned This Sprint

**lucide-react is NOT in package.json.** The project has zero non-React dependencies by design (only react, react-dom, vite, @vitejs/plugin-react, tailwindcss). If you need an icon, write an inline SVG. Do not `import from "lucide-react"` — the Vercel build will fail immediately. Other components (Systems.jsx, Agents.jsx) all use inline SVGs already.

---

## Next Build Queue

### Gate first (non-negotiable)
**PostHog distribution check** — is PostHog receiving events in prod? WAU last 30 days? Top 5 modules? RAG Lab completion rate? PrepLab session depth? Add `VITE_POSTHOG_KEY` to Vercel env vars if not done — analytics.js is ready. If WAU is low, distribution comes before more content.

### S effort
- Phase 3 theme cleanup — 6 gradient endpoints at 0.02–0.04 opacity still hardcoded rgba. Cosmetic only.
- FidelityBadge dedup — duplicated in App.jsx / Agents.jsx / Systems.jsx. XS effort.

### M effort
- 3 more scenario questions (topics open: serving/production, safety, product)
- Interview Strategy Tool full spec — resume parsing, day-plan, auto-detection from localStorage

### L effort (plan before starting, needs PostHog baseline)
- Structural rebuild — Build/Prove/Navigate front doors

---

## Architecture — Critical Rules

1. **JSX only** — never `.tsx`. TypeScript breaks Vercel builds.
2. **Hooks** — always `import { useState, useEffect } from "react"`. Never `React.useState()`.
3. **Colors** — `zinc-*` palette only. CSS vars for surfaces: `var(--bg)`, `var(--surface)`, `var(--surface-2)`, `var(--border)`.
4. **Accent** — `var(--gal-build)` not `#22D3EE`. Never hardcode the hex.
5. **No external icon imports** — lucide-react not in package.json. Use inline SVGs.
6. **Brace check** before every commit: `node -e "const fs=require('fs'); const c=fs.readFileSync('src/FILE.jsx','utf8'); let o=(c.match(/\{/g)||[]).length, cl=(c.match(/\}/g)||[]).length; console.log('diff:',o-cl)"` → must be 0.
7. **New Systems module**: component in `modules.jsx` + export + `SYSTEMS_MODULES` entry in `Systems.jsx` + `RELATED_GT` entry + ≥4 PrepLab questions.
8. **New lab**: `src/LabName.jsx` + lazy import in `App.jsx` + `VALID_VIEWS` + routing case + `ALL_TABS` + `NAV_GROUPS` in `src/config/nav.js`.
9. **No emojis in code** unless already in existing data arrays.

---

## Context Limit Prevention

- **Never read `src/systems/modules.jsx` in full** — ~15,000 lines. Grep for function name, read ±100 lines.
- **Never read `src/groundTruthPosts.js` in full** — ~12,000 lines. Grep for post id, read ±50 lines.
- **CLAUDE.md stays under 400 lines** — older sprints go in HISTORY.md.
- **Session open: read CLAUDE.md + NEXT.md only.**

---

## File Map

```
src/
├── App.jsx                    # Root — routing, nav, theme toggle
├── PromptLab.jsx              # Prompt Engineering Lab (6 scenarios)
├── FoundationModelsLab.jsx    # Foundation Models Lab (6 scenarios)
├── Home.jsx                   # Landing — new/returning views, streak heatmap
├── Concepts.jsx               # 27 modules, 7 active gyms
├── GroundTruth.jsx            # GT post renderer, 3-lens reading mode
├── PrepLab.jsx                # 4 modes + ScenarioPlayer + InterviewIntelMode
├── Systems.jsx                # 57 Systems modules shell + SYSTEMS_MODULES registry
├── Agents.jsx                 # 16 Agent Lab modules
├── systems/modules.jsx        # ← NEVER READ IN FULL (~15,000 lines)
├── groundTruthPosts.js        # ← NEVER READ IN FULL (~12,000 lines)
├── groundTruthIndex.js        # 226 GT post metadata
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

---

## PrepLab Question Schema

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

---

## PrepLab Sidebar Modes

| Key | Label | Component |
|---|---|---|
| `exam` | Assess | ExamMode |
| `jdprep` | Interview Strategy | InterviewPrepMode (4-step Brief) |
| `companyprep` | Company Tracks | CompanyPrepMode |
| `intexp` | Interview Signal | InterviewIntelMode (22 experiences) |

Hidden (component exists, not in sidebar): `defense`, `heatmap`, `trainer`

---

## Theme System

**Dark (default):** `#110e0a` base, warm brown-black zinc scale.  
**Light:** `[data-theme="light"]` — cream `#faf7f2` → ink `#1c1410`. Full zinc remap.  
**Toggle:** sun/moon button in desktop header → `theme` state → `localStorage("gal-theme")`.  
**CSS vars:** `--gal-build` (#22D3EE dark / violet light), `--gal-build-tint`, `--gal-build-border`, `--gal-build-tint-md`, `--gal-build-tint-str`, `--gal-build-dark`.

---

## Business Model

**Free:** All 6 Labs, all Systems, all GT, all Concepts. PrepLab 10q/session.  
**Gated** (code `DAI2026`, Stripe later): Full PrepLab, Company Tracks, Interview Brief phase 4.  
**Gate:** `isAccessGranted()` in `src/utils/accessCode.js`.

---

## Session Opening Checklist

1. Connect `/Users/ASUS/Documents/GitHub/genai-systems-lab`
2. `git log --oneline -5`
3. Read `CLAUDE.md` + `NEXT.md` only
4. Check PostHog before any feature sprint
5. One commit per batch, brace diff = 0
6. **Session end: update CLAUDE.md + NEXT.md + IDEAS.md + UPGRADES.md + LINEAGE.md + BRAIN_TRANSFER.md → commit MD sync**
