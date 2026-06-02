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

**Sprint 46 (June 2026) — PrepLab content + polish:**
- 6 Quantiphi Defense Pack questions added (quantiphi-1 through quantiphi-6). Trap field quality pass: 10 traps rewritten to overclaim→honest-reframe format. Commit `bff96ac`. Scale: **313 PrepLab questions**.
- FidelityBadge dedup: moved to shared.jsx, removed from App.jsx + Systems.jsx. R/A/E/L/P/G/C tab keyboard shortcuts added. Quantiphi Interview Signal entry confirmed already present (id:38, `43545a7`). Commit `f7ce93a`.

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
