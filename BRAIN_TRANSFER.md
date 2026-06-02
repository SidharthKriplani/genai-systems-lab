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
5. **BRAIN_TRANSFER.md** — update scale table, sprint log, next build queue
6. Commit: `chore: MD sync sprint N — [brief summary]`

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

## Current Scale (June 2026, post sprint 42)

| Asset | Count |
|---|---|
| Labs | **6** — RAG Lab, Agent Lab, Eval Lab, LLM Lab, Prompt Lab, Foundation Models Lab |
| Systems modules (in nav) | **57** |
| Concepts modules | **27** (7 active gyms) |
| PrepLab questions | **304** (301 MCQ/text + 3 scenario type) |
| GT posts (index) | **226** |
| PrepLab modes | **4** — Assess, Interview Strategy, Company Tracks, Interview Signal |
| Explore modules | 22 |
| Agent Lab modules | 16 |

---

## What Was Built — Sprint 42 (this session, June 2026)

### Context management
- CLAUDE.md trimmed 587→371 lines, HISTORY.md created, CONTEXT_AUDIT.md for all 3 labs (`bfb28d2`)

### PrepLab expansions
- promptlab-5/6: temperature miscalibration + prompt decay (`f96bc4a`)
- Role Readiness Score sidebar widget (Familiar/Practitioner/Senior/Staff) (`f96bc4a`)
- Interview Signal mode: 22 real loop patterns, topic frequency bars, tier/role filters (`f33a123`)
- Scenario questions: `ScenarioPlayer` component + 3 branching scenarios (`246f73f`)

### Foundation Models Lab
- `src/FoundationModelsLab.jsx` — 6 scenarios, 4 PrepLab questions, wired in App.jsx + nav.js (`6cb2194`)

### Paper theme system
- Warm dark default replacing cold LUNA void (`2884aa1`)
- `[data-theme="light"]` full zinc inversion — cream `#faf7f2` → ink `#1c1410`
- `html[data-theme="light"]` remaps `text-white` → dark ink
- `[data-palette="luna"][data-theme="light"]` swaps cyan → warm violet `#7c3aed`
- Sun/moon toggle in desktop header
- `--gal-build-tint`, `--gal-build-border`, `--gal-build-tint-md`, `--gal-build-tint-str`, `--gal-build-dark` CSS vars

### Theme audit phase 2
- Converted hardcoded `#22D3EE` / `rgba(34,211,238,...)` → CSS vars across 5 files (`c859fe6`)
- 6 gradient endpoints at 0.02–0.04 opacity remain (cosmetic only, Phase 3)

### Build fixes
- Duplicate `INTERVIEW_STORIES` in App.jsx removed (`46bd398`)
- Duplicate `AGENT_INTERVIEW_STORIES` → renamed `AGENT_FAILURE_STORIES` in Agents.jsx (`9a70d75`)

---

## Next Build Queue

### Immediate (non-negotiable)
- **Connect PostHog** — add `VITE_POSTHOG_KEY` env var in Vercel project settings. The analytics.js integration is already written; it just needs the key. Without this, no usage data = no good build decisions.

### S effort (one session each)
- **Phase 3 theme cleanup** — 6 remaining gradient endpoints with hardcoded rgba values. Cosmetic only, no usability impact in light mode. Low priority.
- **FidelityBadge dedup** — still duplicated in App.jsx / Agents.jsx / Systems.jsx. XS effort.

### M effort (one session each)
- **Interview Strategy Tool full spec** — resume parsing, day-by-day plan, auto-detection from localStorage. The 4-step Brief flow is done (sprint 31E); this is the Tier 2 depth upgrade. See IDEAS.md + UPGRADES.md.
- **PrepLab scenario questions expansion** — 3 scenarios built; add 3 more covering agents/evals/finetuning.

### L effort (multi-session, plan before starting)
- **Structural rebuild** — Build/Prove/Navigate front doors. Do NOT start until PostHog WAU baseline established.

---

## Architecture — Critical Rules

1. **JSX only** — never `.tsx`. TypeScript breaks Vercel builds.
2. **Hooks** — always `import { useState, useEffect } from "react"`. Never `React.useState()`.
3. **Colors** — `zinc-*` palette only. Use CSS vars for structural surfaces: `var(--bg)`, `var(--surface)`, `var(--surface-2)`, `var(--border)`.
4. **Accent colors** — use `var(--gal-build)` not `#22D3EE` directly. Theme-aware in light/dark.
5. **Brace check** before every commit: `node -e "const fs=require('fs'); const c=fs.readFileSync('src/FILE.jsx','utf8'); let o=(c.match(/\{/g)||[]).length, cl=(c.match(/\}/g)||[]).length; console.log('diff:',o-cl)"` → must be 0.
6. **New Systems module**: add component to `src/systems/modules.jsx` + export + add to `SYSTEMS_MODULES` in `Systems.jsx` + add to `RELATED_GT` + ≥4 PrepLab questions.
7. **New lab pattern**: create `src/LabName.jsx` + lazy import in `App.jsx` + add to `VALID_VIEWS` + add routing case + add to `ALL_TABS` and `NAV_GROUPS` in `src/config/nav.js`.
8. **No emojis in code** unless already in existing data arrays.

---

## Context Limit Prevention

- **Never read `src/systems/modules.jsx` in full** — 15,012 lines. Grep for component name, then read that section only.
- **Never read `src/groundTruthPosts.js` in full** — 11,937 lines. Grep for `"post-id"` then read ±50 lines.
- **CLAUDE.md stays under 400 lines** — anything older than 4 sprints goes in HISTORY.md.
- **One batch per session** — don't plan 6 batches in one context window.
- **Session open: read CLAUDE.md + NEXT.md only.** Don't proactively read source files.

---

## File Map (key files only)

```
src/
├── App.jsx                    # Root — routing, nav, theme toggle, all topView states
├── PromptLab.jsx              # Prompt Engineering Lab (6 scenarios)
├── FoundationModelsLab.jsx    # Foundation Models Lab (6 scenarios) — NEW
├── Home.jsx                   # Landing — new/returning views, streak heatmap
├── Concepts.jsx               # 27 modules, 7 active gyms
├── GroundTruth.jsx            # GT post renderer, generateQuiz() → 5-7 questions
├── PrepLab.jsx                # 4 modes + ScenarioPlayer + InterviewIntelMode (3225 lines)
├── Systems.jsx                # 57 Systems modules shell + SYSTEMS_MODULES registry
├── Agents.jsx                 # 16 Agent Lab modules
├── systems/modules.jsx        # All Systems module components (~15,000 lines) ← NEVER READ IN FULL
├── groundTruthPosts.js        # GT post content blocks ← NEVER READ IN FULL
├── groundTruthIndex.js        # 226 GT post metadata
├── shared.jsx                 # CommonTrapCallout, ProductionNoteChip, ForwardPointerCard, WhatNextCard, FeedbackBar
├── analytics.js               # PostHog track() — needs VITE_POSTHOG_KEY env var
├── index.css                  # Paper warm theme — dark default + [data-theme="light"] + CSS vars
├── config/
│   ├── nav.js                 # ALL_TABS, GROUP_COLORS, NAV_GROUPS (source of truth)
│   └── gating.js              # FREE_QUESTION_LIMIT, RESULTS_FREE_LIMIT
└── data/
    └── preplabQuestions.js    # 304 questions (MCQ + text + multi + scenario types)
```

---

## PrepLab State

**4 sidebar modes:**
- `exam` — Assess
- `jdprep` — Interview Strategy (4-step Brief)
- `companyprep` — Company Tracks
- `intexp` — Interview Signal (22 experiences, topic chart, filters) ← NEW

**Hidden modes (component exists, not in sidebar):** `defense`, `heatmap`, `trainer`

**Question schema — all types:**

```js
// MCQ / multi / text (existing)
{
  id: "unique-id", topic: "rag|agents|eval|finetuning|llmops|safety|product|behavioral|serving|reasoning",
  difficulty: "easy|medium|hard", gated: false,
  type: "mcq|text|multi",
  question: "...", options: ["A","B","C","D"], correct: 0,
  keywords: ["kw1"], explanation: "...", trap: "...",
  readMore: { label: "...", tab: "groundtruth", postId: "post-id" }
}

// Scenario (new)
{
  id: "scenario-N", topic: "rag|agents|evals", difficulty: "hard", gated: true,
  type: "scenario",
  title: "...",       // shown in TrainerMode
  incident: "...",    // the failing system — shown at step 1
  steps: [{
    prompt: "What do you investigate first?",
    choices: ["A", "B", "C", "D"],
    correct: 1,       // index of best choice
    reveals: ["what A finds", "what B finds", "what C finds", "what D finds"],
  }],
  rootCause: "...",   // shown on completion
  trap: "...",        // common wrong instinct
}
```

**Scenario IDs built:** `scenario-1` (RAG corpus), `scenario-2` (agent loop), `scenario-3` (eval rubric)

---

## Theme System

**Dark (default):** Paper warm dark — `#110e0a` base, warm brown-black zinc scale.  
**Light:** `[data-theme="light"]` on both `<html>` and root div — cream `#faf7f2` base, full zinc inversion.  
**Toggle:** sun/moon button in desktop header → `theme` state → `localStorage("gal-theme")`.  
**Accent:** `var(--gal-build)` = `#22D3EE` dark / `#5b21b6` light. Never hardcode `#22D3EE` in new code.

---

## Concepts Gym State (27 modules, 7 active gyms)

| Gym | Modules |
|---|---|
| Language Models ✅ | tokenizer, attention, transformer, seq-parallel, flashattn, sampling, nextoken, tempgame, training-signal |
| Retrieval ✅ | embeddings, chunking, rag-pipeline, context |
| AI Agents ✅ | agent, agent-tools, multiagent, guardrails |
| Evaluation ✅ | eval-loop, debug, llm-as-judge, eval-design |
| Production ✅ | cost-latency-concepts, observability-concepts |
| Foundation Models ✅ | training-signal, scaling-laws, lora |
| Prompt Engineering ✅ | few-shot, chain-of-thought |
| Cloud AI Services 🔜 | — |
| Vector Infrastructure 🔜 | — |
| Observability & Tracing 🔜 | — |
| Multimodal 🔜 | — |
| AI Safety & Alignment 🔜 | — |

---

## Business Model (current)

**Free:** All 6 Labs, all 57 Systems, all GT posts, all Concepts. PrepLab 10q/session.  
**Gated** (access code `DAI2026`, later Stripe): Full PrepLab, Company Tracks, Interview Brief phase 4.  
**Gate UX:** `isAccessGranted()` in `src/utils/accessCode.js`.

---

## Session Opening Checklist

1. Connect to `/Users/ASUS/Documents/GitHub/genai-systems-lab`
2. `git log --oneline -5` — verify you're at the right commit
3. Read `CLAUDE.md` + `NEXT.md` — don't read anything else until you know what you're building
4. Check PostHog if doing a feature sprint — it's the gate
5. Plan batches — one commit per batch, brace diff = 0 before every commit
6. **At session end: update all 5 MD files + commit MD sync**
