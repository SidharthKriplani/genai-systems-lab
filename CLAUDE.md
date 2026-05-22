# CLAUDE.md — Session Briefing for AI Collaborator

Read this first at the start of every session. It contains everything needed to work on this codebase without re-discovering context.

---

## What this project is

**GenAI Systems Lab** — a free, static, interactive learning platform for AI engineers and PMs. No backend, no login, no ads. Deployed on Vercel at `genai-systems-lab-ivory.vercel.app`.

Core mechanic: configure real AI systems (RAG pipelines, agent loops, eval harnesses), watch them fail in realistic ways, and understand why. Every module is interactive and takes under 20 minutes.

Scale as of May 2026: 50 Systems modules, 19 Explore modules, 190+ PrepLab questions, 200 Ground Truth posts (192 single-line + 8 multi-line format in groundTruthIndex.js), 14 top-level tabs.

---

## Tech stack — non-negotiable constraints

| Constraint | Rule |
|---|---|
| Language | `.jsx` only. **No TypeScript.** TypeScript breaks Vercel builds with this setup. |
| React hooks | Always `import { useState, useEffect } from "react"`. **NEVER `React.useState()`** — causes ReferenceError at runtime. |
| CSS | **Tailwind `zinc-*` palette only.** `gray-*`, `slate-*` are visual inconsistencies. zinc-950 base, zinc-800 borders, zinc-900 cards. |
| Styling | No PostCSS config. Tailwind v4 via `@tailwindcss/vite`. No external UI library (shadcn, MUI etc.). |
| State | localStorage only. No backend, no API calls, no auth. |
| Routing | Hash-based (`#concepts`, `#systems`). No React Router. |
| Bundler | Vite 6. No webpack. |
| Deployment | Vercel free tier. Static. Auto-deploys from `main` branch on GitHub push. |

---

## Critical code rules

```
1. Destructure hooks:     import { useState, useEffect, useRef } from "react"  ✓
                          React.useState()                                       ✗

2. Color palette:         bg-zinc-950, border-zinc-800, text-zinc-400           ✓
                          bg-gray-900, border-gray-700                          ✗

3. No TypeScript:         component.jsx                                          ✓
                          component.tsx                                          ✗

4. Brace balance check:   node -e "const fs=require('fs');
                          const c=fs.readFileSync('src/FILE.jsx','utf8');
                          let o=(c.match(/\{/g)||[]).length,
                              cl=(c.match(/\}/g)||[]).length;
                          console.log('diff:',o-cl)"
                          → must be 0 before committing

5. GT block format:       { t: "p|h2|h3|callout|lab|code|list|table|refs|video|quote|divider" }

6. New Systems module:    Add component to src/systems/modules.jsx
                          Add entry to SYSTEMS_MODULES in Systems.jsx
                          Add ≥4 PrepLab questions in PrepLab.jsx

7. No emojis in code      unless explicitly in existing data arrays
```

---

## File structure

```
genai-systems-lab/
├── src/
│   ├── App.jsx                  # Root: tab routing, nav, all topView states
│   ├── Home.jsx                 # Landing page, learning paths, concept graph
│   ├── Systems.jsx              # Systems tab shell + SYSTEMS_MODULES registry
│   ├── systems/
│   │   └── modules.jsx          # All Systems module components (~9,500 lines)
│   ├── Agents.jsx               # Agents tab (15 modules + AGENTS_RELATED_GT)
│   ├── Explore.jsx              # Explore tab (19 modules)
│   ├── Flows.jsx                # Animated pipeline flows
│   ├── Concepts.jsx             # Tokenizer, attention, transformer modules
│   ├── GroundTruth.jsx          # GT post renderer, video/refs/quiz blocks
│   ├── groundTruthIndex.js      # Post metadata + related[] arrays (357 lines)
│   ├── groundTruthPosts.js      # Post content as typed block arrays (~10,800 lines)
│   ├── PrepLab.jsx              # Question bank + 3 modes
│   ├── LearningPaths.jsx        # Curated multi-tab learning paths
│   ├── QADashboard.jsx          # Internal QA console (hidden, accessed via ?qa=1)
│   ├── Fluency.jsx              # Phrase bank, drills, mock interview
│   ├── AIPM.jsx                 # PRD simulator, roadmap, PM track
│   ├── Career.jsx               # System design, take-home, salary calculator
│   ├── Consultation.jsx         # Ask tab (keyword search over GT + modules)
│   ├── Playground.jsx           # Prompt injection, chunking, hallucination labs
│   └── analytics.js             # PostHog tracking + feedback URL
├── public/
│   └── og-image.png             # 1200×630 OG/WhatsApp thumbnail
├── index.html                   # Meta tags, OG, Twitter card, structured data
├── CLAUDE.md                    # This file — AI session briefing
├── AUDITS.md                    # All audits ever run — findings + status
├── IDEAS.md                     # Build backlog (Tier 1/2/3 + In Progress)
├── DECISIONS.md                 # Architectural + product rules (pure rulebook)
├── METRICS.md                   # PostHog events, funnel, success baselines
├── LINEAGE.md                   # Narrative build history, tab origins
└── vite.config.js
```

---

## Git workflow — virtiofs workaround

The VM filesystem (virtiofs) creates `.lock` files that cannot be deleted with `rm`. Always use this Python pattern before committing:

```python
import os, subprocess, time

# Clear any stale locks
for lock in ['.git/index.lock', '.git/HEAD.lock']:
    if os.path.exists(lock):
        with open(lock, 'w') as f: f.write('')
        os.rename(lock, lock + '.x')

time.sleep(0.5)

# Stage and commit
subprocess.run(['git', 'add', 'src/FILE.jsx'])
subprocess.run(['git', 'commit', '-m', 'your message'])
```

**User pushes manually** (VM has no network push access):
```bash
cd ~/Documents/GitHub/genai-systems-lab && git push origin main
```

**Bash → filesystem path mapping:**
```
/Users/ASUS/Documents/GitHub/genai-systems-lab  →  /sessions/.../mnt/GitHub--genai-systems-lab/
/Users/ASUS/Downloads/genai-systems-lab          →  /sessions/.../mnt/genai-systems-lab/
```

---

## MD file guide — what each file is for

| File | Purpose | Read when |
|---|---|---|
| `CLAUDE.md` | This briefing — rules, structure, workflow | Start of every session |
| `AUDITS.md` | All audits run — open findings + resolutions | Before running an audit; before building (check for known issues) |
| `IDEAS.md` | Build backlog — Tier 1/2/3 + In Progress | Picking what to build next |
| `DECISIONS.md` | Architectural + product rulebook | Before making an architectural choice |
| `METRICS.md` | PostHog events, funnel, success metrics | Before building a new feature (what to track) |
| `LINEAGE.md` | Narrative history — what was built and why | Understanding why something exists |

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
| BUILD | `#3b82f6` blue | RAG Lab, Systems, Playground, Explore |
| GROW | `#22c55e` green | Fluency, AIPM, Career |
| Ground Truth | `#8b5cf6` violet-500 | GT posts, series |
| Warning/fail | `#ef4444` red | Failure states |
| Caution | `#f59e0b` amber | Warnings, Systems advanced modules |

---

## Known open issues (check AUDITS.md for full list)

- PrepLab text question keyword grading marks correct answers wrong if vocabulary differs
- PrepLab → GT `readMore` links open the tab, not the specific post (needs `postId`)
- Module endings are silent — no ✓ Done state, no next-step CTA inside module pages
- `consult` tab exists in App.jsx but has no nav entry point — effectively hidden
- Home.jsx STATS array GT count not yet synced (index.html fixed; Home.jsx still needs recount)
