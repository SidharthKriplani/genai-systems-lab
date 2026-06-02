# Brain Transfer — GenAI Systems Lab
## For the next Claude session. Paste this at the top. Read CLAUDE.md + NEXT.md after.

---

## Repository

**Path:** `/Users/ASUS/Documents/GitHub/genai-systems-lab`  
**Deployed:** `genai-systems-lab-ivory.vercel.app`  
**Stack:** React 18 + Vite 6 + Tailwind v4 (zinc palette only). No TypeScript. No backend. No React Router. Hash-based routing.  
**Push:** User pushes manually — `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`

---

## Current Scale (June 2026, post sprint 41)

| Asset | Count |
|---|---|
| Labs | **6** — RAG Lab, Agent Lab, Eval Lab, LLM Lab, Prompt Lab, **Foundation Models Lab** (new) |
| Systems modules (in nav) | **57** |
| Concepts modules | **27** (7 active gyms) |
| PrepLab questions | **301** |
| GT posts (index) | **226** |
| Explore modules | 22 |
| Agent Lab modules | 16 |

---

## What Was Built — Last 3 Sprints

### Sprint 39 (batches 2–10) — Content sprint
- Agent Lab + LLM Lab Maps-to-Production chips (`b253405`)
- EvalLoopModule Beat 2+3 (`04c7a51`)
- ScalingLawsModule Concepts (`fd73d26`) + GT `chinchilla-scaling-laws` already existed + 4 PrepLab Qs
- Semantic caching GT post `semantic-caching` + 3 PrepLab Qs (`267a552`)
- Dense/sparse retrieval 3 PrepLab Qs — GT `hybrid-search` already existed (`d0d1459`)
- LoRAModule Concepts — GT posts already existed (`0915cb8`)
- SequentialParallelModule + TrainingSignalModule Concepts (`caaadb5`)

### Sprint 40 (batches A–I) — Architecture + polish sprint
- `src/config/nav.js` extracted — ALL_TABS + GROUP_COLORS (`992cfc4`)
- `src/shared.jsx` expanded — ProductionNoteChip, ForwardPointerCard, WhatNextCard, FeedbackBar (`2c57ff2`)
- Streak + 4-week heatmap in ReturningHomeView (`0d7371f`)
- FeedbackBar wired: GT post end + PrepLab session end + Systems footer (`0e5b3ab`)
- PrepLab multi-select MCQ `type: "multi"` — full scoring + UI (`9c7ba18`)
- 182 trap fields — all 109 medium questions now have trap (`204138f`)
- AgentContextArchModule — 57th Systems module, 4 PrepLab questions (`144618f`)
- GT quiz depth: generateQuiz() 3→7 questions from 5 block types (`2fe2fe0`)

### This session (June 2026) — MD sync + context management + builds
- **CLAUDE.md trimmed** (587→371 lines): sprints 1–37 moved to `HISTORY.md`. Context limit prevention.
- **CONTEXT_AUDIT.md created**: guide for all 3 sibling labs — file size audit, danger thresholds, fix patterns, operating rules.
- **IDEAS.md + UPGRADES.md synced to sprint 41**: scale header, In Progress section, 10+ items marked done.
- **promptlab-5 + promptlab-6**: temperature miscalibration (medium MCQ) + prompt decay diagnosis (hard text). 297 PrepLab questions total.
- **Role Readiness Score**: `getRoleReadiness()` + sidebar widget in PrepLab.jsx. Tiers: Familiar/Practitioner/Senior/Staff.
- **CONTEXT_LIMIT RULE added**: Never read `systems/modules.jsx` or `groundTruthPosts.js` in full. CLAUDE.md stays under 400 lines.

### Sprint 41 (batches A–B) — Gym expansion + Prompt Lab
- **7 new Concepts modules** (`ed54c5a`): LLMAsJudge, EvalDesign, AgentToolDesign, CostLatency, Observability, FewShot, ChainOfThought
- **4 new active gyms**: Evaluation, Production, Foundation Models, Prompt Engineering
- **Prompt Engineering Lab** (`b93535e`): 6 scenarios in `src/PromptLab.jsx`, wired in App.jsx, in nav.js BUILD group, 4 PrepLab questions

---

## Current Git State

Latest commit: see `git log --oneline -3` on session open.  
Branch: `main`  
**Push before starting:** `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`

---

## Architecture — Critical Rules

1. **JSX only** — never `.tsx`. TypeScript breaks Vercel builds.
2. **Hooks** — always `import { useState, useEffect } from "react"`. Never `React.useState()`.
3. **Colors** — `zinc-*` palette only. Use CSS vars for structural surfaces: `var(--bg)`, `var(--surface)`, `var(--surface-2)`, `var(--border)`.
4. **Brace check** before every commit: `node -e "const fs=require('fs'); const c=fs.readFileSync('src/FILE.jsx','utf8'); let o=(c.match(/\{/g)||[]).length, cl=(c.match(/\}/g)||[]).length; console.log('diff:',o-cl)"` → must be 0.
5. **New Systems module pattern**: add component to `src/systems/modules.jsx` + export + add to `SYSTEMS_MODULES` in `Systems.jsx` + add to `RELATED_GT` + add ≥4 PrepLab questions.
6. **New lab pattern**: create `src/LabName.jsx` + lazy import in `App.jsx` + add to `VALID_VIEWS` + add routing case + add to `ALL_TABS` and `NAV_GROUPS` in `src/config/nav.js`.
7. **Git virtiofs workaround** — use Python pattern for commits, not direct git commands.
8. **No emojis in code** unless already in existing data arrays.

---

## File Map (key files only)

```
src/
├── App.jsx                   # Root — routing, nav, all topView states
├── PromptLab.jsx             # Prompt Engineering Lab (NEW — 560 lines, 6 scenarios)
├── Home.jsx                  # Landing — new/returning user views, streak heatmap
├── Concepts.jsx              # 27 modules, 7 active gyms, GymSelectorView
├── GroundTruth.jsx           # GT post renderer, generateQuiz() → 5-7 questions
├── PrepLab.jsx               # 5 modes: Exam, Trainer, Interview Strategy, Company Tracks, Heatmap
├── Systems.jsx               # 57 Systems modules shell + SYSTEMS_MODULES registry
├── Agents.jsx                # 16 Agent Lab modules
├── systems/modules.jsx       # All Systems module components (~15,000 lines)
├── groundTruthIndex.js       # 226 GT post metadata
├── groundTruthPosts.js       # GT post content blocks
├── shared.jsx                # CommonTrapCallout, ProductionNoteChip, ForwardPointerCard, WhatNextCard, FeedbackBar
├── analytics.js              # PostHog track()
├── config/
│   ├── nav.js                # ALL_TABS, GROUP_COLORS, NAV_GROUPS (source of truth)
│   └── gating.js             # FREE_QUESTION_LIMIT, RESULTS_FREE_LIMIT
└── data/
    └── preplabQuestions.js   # 297 questions (all with difficulty + trap fields)
```

---

## Concepts Gym State (27 modules, 7 active gyms)

| Gym | Status | Modules |
|---|---|---|
| Language Models | ✅ Active | tokenizer, attention, transformer, seq-parallel, flashattn, sampling, nextoken, tempgame, training-signal |
| Retrieval | ✅ Active | embeddings, chunking, rag-pipeline, context |
| AI Agents | ✅ Active | agent, agent-tools, multiagent, guardrails |
| Evaluation | ✅ Active (new sprint 41) | eval-loop, debug, llm-as-judge, eval-design |
| Production | ✅ Active (new sprint 41) | cost-latency-concepts, observability-concepts |
| Foundation Models | ✅ Active (new sprint 41) | training-signal, scaling-laws, lora |
| Prompt Engineering | ✅ Active (new sprint 41) | few-shot, chain-of-thought |
| Cloud AI Services | 🔜 Coming soon | — |
| Vector Infrastructure | 🔜 Coming soon | — |
| Observability & Tracing | 🔜 Coming soon | — |
| Multimodal | 🔜 Coming soon | — |
| AI Safety & Alignment | 🔜 Coming soon | — |

---

## Prompt Lab — Fully Built State

`src/PromptLab.jsx` — 6 scenarios, each with 3 configs, outcome cards, root cause + synthesis close:

| ID | Title | Tag |
|---|---|---|
| regression_edit | The 11-Day Quality Drop | REGRESSION |
| user_injection | The Override | INJECTION |
| few_shot_contamination | The Bad Example | FEW-SHOT |
| structured_output_failure | The Schema Drift | STRUCTURED |
| temperature_miscal | The Confident Hallucinator | TEMPERATURE |
| over_constrained | The Instruction Conflict | CONSTRAINTS |

Wired: lazy import in App.jsx, VALID_VIEWS, routing, page title, nav.js BUILD group (count: 6).  
PrepLab questions: promptlab-1 through promptlab-4.

---

## Open Issues (verified current)

**Still open from UPGRADES.md:**
- `failures` module in Agent Lab — still a reference catalog. Low priority.
- 3 thin GT posts that were previously stubs but are now confirmed expanded — **closed**.
- Concepts inline callouts + synthesis close — all 27 modules now have all 3 beats ✅.
- GT Series + Tags — 16/17 series populated, taxonomy clean ✅.
- FidelityBadge still duplicated in App.jsx / Agents.jsx / Systems.jsx — XS effort, deferred.

**Gate before next major sprint:**
- **PostHog check** (DECISIONS.md §0c) — WAU last 30 days, top 5 modules by visit, RAG Lab completion rate, PrepLab session depth. If WAU is low → distribution work, not features.

---

## Next Build Queue (in priority order)

### ~~Batch 1 — Foundation Models Lab~~ ✅ DONE sprint 42 (`6cb2194`)
`src/FoundationModelsLab.jsx` (6 scenarios): lora_rank_low, lr_too_high, eval_contamination, data_volume, objective_mismatch, base_model_mismatch. Each has 3 configs (fail/partial/pass), metrics grid, root cause, fix, design principle. 4 PrepLab questions (fmlab-1/2/3/4). Wired in App.jsx + nav.js. 301 PrepLab questions total.
**PENDING FIX:** Lab accent uses amber — should be blue (#3b82f6) to match BUILD group convention. Fix in next polish pass.

### ~~Batch 2 — Role Readiness Score~~ ✅ DONE this session
`getRoleReadiness()` helper + `readiness` state + sidebar widget in `src/PrepLab.jsx`. Tiers: Familiar/Practitioner/Senior/Staff derived from `gsl-preplab-history`. 4-dot visual + count + accuracy. Shows only after 5+ questions answered.

### ~~Batch 3 — Welcome / Onboarding Modal~~ ✅ ALREADY DONE
`WelcomeModal` confirmed live in App.jsx (line 1142). `genai_welcomed` localStorage flag, 3 goal options, fires once.

### ~~Batch 4 — React.lazy() code splitting~~ ✅ ALREADY DONE
All 15 heavy components lazy-loaded in App.jsx.

### ~~Batch 5 — Prompt Lab PrepLab questions expansion~~ ✅ DONE this session
`promptlab-5` (temperature miscalibration, medium free MCQ) + `promptlab-6` (prompt decay diagnosis, hard gated text). Total: 297 PrepLab questions.

### Batch 2 (renumbered) — Interview Experiences section
Static editorial data (20-30 entries) seeded from field intelligence log in CLAUDE.md. Schema: `{ role, companyTier, round, topics[], difficultySignal, notes }`. Recharts bar chart. Tally link for submissions. **M effort.**

---

## PrepLab Question Schema (for new questions)

```js
{
  id: "unique-id",           // kebab-case, topic prefix
  topic: "rag|agents|eval|finetuning|llmops|safety|product|behavioral|serving|llm|reasoning",
  difficulty: "easy|medium|hard",
  gated: true,               // hard questions gated; medium free or gated; easy free
  type: "mcq|text|multi",    // multi = select all that apply, correct is array [0,2]
  question: "...",
  options: ["A","B","C","D"],// MCQ/multi only; [] for text
  correct: 0,                // index for mcq; [0,2] for multi; 0 for text (unused)
  keywords: ["kw1","kw2"],   // text questions — keywords for self-grading
  explanation: "...",        // full explanation
  trap: "Saying X. The correct answer is Y because Z.",  // what weaker candidates say
  source: "Company/context", // optional — where this appeared in the wild
  readMore: { label: "...", tab: "groundtruth", postId: "post-id" }
}
```

---

## Git Commit Pattern

```python
import os, subprocess, time

for lock in ['.git/index.lock', '.git/HEAD.lock']:
    if os.path.exists(lock):
        with open(lock, 'w') as f: f.write('')
        os.rename(lock, lock + '.x')

time.sleep(0.5)
subprocess.run(['git', 'add', 'src/FILE.jsx'])
subprocess.run(['git', 'commit', '-m', 'batch-X: description'])
```

---

## Bash Path Mapping

```
/Users/ASUS/Documents/GitHub/genai-systems-lab  →  /sessions/.../mnt/genai-systems-lab/
```

Always use the `/sessions/...` path in bash commands, the full macOS path in Read/Write/Edit tools.

---

## Session Opening Checklist

1. Connect to `/Users/ASUS/Documents/GitHub/genai-systems-lab`
2. `git log --oneline -5` — verify you're on the right commit
3. Read `CLAUDE.md` + `NEXT.md`
4. Check PostHog if doing a new feature sprint
5. Plan batches — each batch = one commit, brace diff = 0

---

## Key Decisions (standing rules)

- **No TypeScript** — ever
- **No backend** — static only, localStorage state
- **Distribution before features** (DECISIONS.md §0c) — PostHog check gates every major sprint
- **Interactive decision engine standard** — every module must configure → logic → outcome → diagnosis
- **3-beat standard** — every module: Beat 1 (setup framing) + Beat 2 (inline callout) + Beat 3 (synthesis close)
- **Format integrity** — failure simulation (GAL) must not converge with case study format (PAL)
- **Cold-start rule** (DECISIONS.md §9) — PrepLab is the correct cold-start entry, not Labs

---

## Business Model (current)

**Free:** All 5 Labs, all 57 Systems modules, all GT posts, all Concepts. PrepLab 10q/session.  
**Gated** (access code `DAI2026`, later Stripe): Full PrepLab beyond 10q/session, Company Tracks, Interview Brief phase 4.  
**Gate UX:** `isAccessGranted()` in `src/utils/accessCode.js`. Community code `DAI2026`.
