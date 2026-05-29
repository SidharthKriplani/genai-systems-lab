# CLAUDE.md — Session Briefing for AI Collaborator

Read this first at the start of every session. It contains everything needed to work on this codebase without re-discovering context.

---

## Working relationship

Act as a product and engineering partner, not an assistant. That means:

- Push back when something is wrong, weak, or not worth building
- Give an honest opinion before executing — if the idea is bad, say so first
- Don't pipeline every input into the backlog — most things don't belong there
- When someone shares a post or screenshot, make the call: does this surface a real gap or is it noise? Say which and why
- Don't invent reasons to say yes. Agreement should mean something
- If a decision has a real cost or tradeoff, name it plainly
- The job is to build a good product, not to make every session feel productive

---

## What this project is

**GenAI Systems Lab** — a free, static, interactive learning platform for AI engineers and PMs. No backend, no login, no ads. Deployed on Vercel at `genai-systems-lab-ivory.vercel.app`.

Core mechanic: configure real AI systems (RAG pipelines, agent loops, eval harnesses), watch them fail in realistic ways, and understand why. Every module is interactive and takes under 20 minutes.

Scale as of May 2026: 54 Systems modules (in nav), 25 Explore modules, 16 Agent Lab modules, 15 Concepts modules, 261 PrepLab questions, 222 Ground Truth posts. Nav: KNOWLEDGE (Concepts, Ground Truth) + 4 Labs (RAG Lab, Agent Lab, Eval Lab, LLM Lab) + GROW (Prep Lab, Career, AI Product). Legacy tabs (Flows, Agents, Playground, Explore, Systems, Paths, Fluency) accessible via #hash but not in primary nav.

**Business model:** Freemium with access code gate (decided May 2026). Free: all Labs, all GT, all modules, PrepLab 10q/session. Gated (access code now, paid later): full PrepLab, Company Tracks, Interview Prep Plan study plan (phase 4, gated after 30% completion). Community code shared freely during beta. Stripe + auth when ready to monetize. See DECISIONS.md Section 0.

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
│   ├── Agents.jsx               # Agents tab (16 modules + AGENTS_RELATED_GT)
│   ├── Explore.jsx              # Explore tab (25 modules)
│   ├── Flows.jsx                # Animated pipeline flows
│   ├── Concepts.jsx             # Tokenizer, attention, transformer modules
│   ├── GroundTruth.jsx          # GT post renderer, video/refs/quiz blocks
│   ├── groundTruthIndex.js      # Post metadata + related[] arrays (357 lines)
│   ├── groundTruthPosts.js      # Post content as typed block arrays (~10,800 lines)
│   ├── PrepLab.jsx              # Question bank + 5 modes (Exam, Trainer, JD Prep, Company Tracks, Defense Doc)
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

## Field intelligence workflow — LinkedIn / practitioner posts

When the user shares a screenshot of a LinkedIn post, tweet, or practitioner writeup, treat it as a content sourcing signal, not just a conversation prompt. Apply this pattern:

1. **Assess merit** — does it surface a real pain point, a named concept, a salary/market signal, or a framing gap the lab doesn't cover?
2. **Identify the gap** — what specific GT post, Systems module, or AIPM/Career module is missing?
3. **Add to IDEAS.md** — under the relevant Tier with a named cluster (e.g. "Type A/B engineer framing — from viral post, May 2026"). Include: post's key claim, why it resonates with the lab's audience, 2–5 specific buildable items.
4. **Flag positioning opportunities** — if a post validates the lab's thesis, note whether a home page or module copy tweak would capitalize on it (zero build effort).

**Why this works:** LinkedIn practitioners surface real market signal — salary data, hiring shifts, pain points — that academic curricula miss. The lab's audience reads these posts. Building content from this source means the lab speaks in the same voice the audience already trusts.

**Running log of sources used:**
- LuMay AI diagram (May 2026) — agent dev kit layers (CLAUDE.md, Skills, Hooks, Subagents, Plugins)
- Sairam Thonupunuri post (May 2026) — AI PM career break-in, technical credibility for PMs
- Anonymous "Type A vs Type B" post (May 2026) — systems thinking vs model obsession, salary differential
- Anonymous DS → AI Engineer arc post (May 2026) — market forces behind role fragmentation, ChatGPT as demand reset, agentic surge numbers
- Job postings chart (May 2026, sources: Lightcast, Stanford HAI AI Index 2026, LinkedIn Economic Graph, Indeed, Revealera) — DS ~30K flat, GenAI engineer ~35K, Agentic AI engineer ~90K +280% YoY. Agentic already 2.5x larger than GenAI engineer. Confirms agentic as the fastest-growing role category.
- Aryan Sharma post (May 2026) — one-line prompt change caused 23% quality drop for 11 days undetected. Prompt management as DevOps discipline: versioning, A/B, LLM-as-judge eval, serve-via-API. Lab gap: no prompt CI/CD content.
- Khushboo Sharma post (May 2026) — Forward Deployed Engineer model. FDE postings +1,165% YoY. 95% enterprise AI pilots produce zero returns (MIT). Dependency gap: intelligence in engineer, not system. Reusable evals and playbooks as the fix.
- Utkarsh Mangal post (May 2026) — Probability, Entropy, Cross-Entropy Loss, KL Divergence framed as "how surprised is the model?" Lab gap: Concepts tab has architecture but no training signal math.
- Naresh Edagotti post (May 2026) — RNN to LSTM to Transformer arc as systems-level story. Encoder/decoder/encoder-decoder split. Lab gap: no historical architecture progression narrative.
- Anonymous DE skills post (May 2026) — 3-layer DE stack: Layer 1 (SQL/Python/fundamentals, 80% of value), Layer 2 (AI productivity tools), Layer 3 (vector DBs, RAG, evals, observability — currently scarce). Lab is a Layer 3 training ground but never says so. Positioning opportunity.

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
| `UPGRADES.md` | Targeted enhancements to existing components — current vs target behavior, effort, priority | Before starting any improvement to an existing module or mode |
| `ROLLOUT.md` | Beta rollout plan — batches, self-vet checklists, tester briefs, feedback tracking. Operational only; not a backlog. | Before inviting any tester; before opening a new batch |

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

## Structural Upgrade — Architecture Pending (do not build yet, think first)

The current product was built organically. Every tab and module made sense when added. Cumulatively, a first-time visitor sees no coherent shape — no clear entry, no path, no sense of where to go. This section captures the concluded architecture that the product needs to evolve toward. Nothing here is implemented yet. When the time comes, this governs the rebuild.

### The tree

Every piece of content must attach to a branch. If it doesn't attach clearly, it doesn't go in — or it gets cut into PARKED.md under "implemented but cut down." The tree is not just navigation architecture, it is the editorial constitution of the product. All future additions are filtered through it.

### Three real front doors

**Build** — production systems, making things work, debugging failures. RAG Lab, Systems, Agents, Playground, Explore. The core and heaviest branch — needs its own internal structure, not a flat grid.

**Prove** — interview readiness, assessment, demonstrating competence under pressure. PrepLab. (Fluency is a cut/park candidate — not coherent enough to anchor this branch.)

**Navigate** — career clarity, role transitions, the PM track. AIPM, Career.

"Understand" is NOT a front door. Nobody's terminal goal is understanding. It is a foundation layer that serves all three branches.

### Foundation layer (beneath all three branches, not a front door)

Concepts and Flows sit here — the architectural and mathematical knowledge base reached from any branch at the moment it's needed, not as a standalone destination.

**Flows is a cut candidate.** Animated pipelines you watch. Passive consumption — the exact thing the lab's philosophy rejects. Unless redesigned around active interaction it goes to PARKED.md.

### Knowledge layer — Ground Truth

GT is not a branch. It is the knowledge layer the whole tree draws from. Three access modes:

1. **Depth that finds you** — GT post surfaces contextually inside a module at the exact relevant moment. First encounter is earned by doing, not browsing.
2. **Ask as the gateway** — Ask is the primary interface to the knowledge layer. You come with a question, GT answers it. Ask is no longer a hidden tab — it is the knowledge gateway with a real structural home.
3. **"Explore all" nudge** — a gentle line under Ask reads: *"or explore all that we have to say on everything AI."* Full catalog accessible for deliberate browsing, one step deeper, not the primary surface.

The GT tab in its current form (200 posts on a wall) does not survive the rebuild. The Ask-first model replaces it. Ask needs the embedding + generation upgrade to carry this weight properly — keyword search is insufficient for this role.

### Learning Paths — promote from tab to architecture

Currently a tab. Should be the connective tissue that runs through all three branches — the spine a user follows rather than a feature they discover. The front door IS the path selector. Paths cut across branches for specific user types ("interview in 3 weeks" cuts across Prove and Build; "DS transitioning to AI Engineer" cuts across Build and Navigate).

### Connection principle

Every piece of content surfaces exactly **one clear next step** — not a menu of related items. One GT post, one PrepLab question, one module. The current RELATED_GT arrays (3–5 items each) are menus. The rebuilt version is a single forward pointer.

### What gets cut into PARKED.md

- **Flows** — passive, anti-thesis of the lab's mechanic. Park unless redesigned.
- **Fluency** — phrase bank + drills without coherent identity. Park or absorb into PrepLab as a mode.
- **Ask/Consult as a tab** — the tab disappears; Ask becomes the knowledge gateway, not a navigation item.
- **GT as a standalone tab** — replaced by the three-mode access model above.

---

## Known open issues (check AUDITS.md for full list)

**Fixed in sprint 6 (May 2026):**
- ~~Module endings silent~~ → RAG Lab forward pointer added (scenario-specific GT post + PrepLab), Concepts 12 modules upgraded to ✓ done card, Systems shell always shows PrepLab CTA
- ~~Stat numbers stale~~ → Home.jsx synced: "261+" PrepLab, "222+" GT posts, badge updated to "Layer 3 AI skills"
- ~~Hero subtext flat~~ → magnetic copy, outcome-oriented door cards

**Fixed in sprint 7 (May 2026):**
- ~~13/16 Agent Lab modules reference content~~ → `simulator` + `design` done screens: PrepLab forward pointer card added; `agentcfg` AGENT_FAILURE_MATRIX expanded with 3 new trigger-based failure modes (cascading_errors, over_delegation, tool_poisoning) merged from `failures` catalog
- ~~7/9 LLM Lab modules lack failure arc~~ → `serving`: full scenario card (root cause + fix chips, SERVING_FAILURE_SCENARIOS lookup); `decoding`: reactive failure callout (repetition collapse T≤0.15, token incoherence T≥1.5, vocabulary starvation topP≤0.2)
- ~~`moe` failure modes tab read-only~~ → `MoEExpertSimulator` added as 4th tab: configure experts/top-K/batch → load bar chart → collapse/imbalance callout with fixes
- ~~`langsmith` 4 reference tabs~~ → "Diagnose Traces" tab added as primary view: 5 pre-built broken trace scenarios (retriever timeout, token overflow, tool schema mismatch, context overflow, prompt injection) with span-click inspection + diagnosis reveal
- ~~`deploy`, `buildthis`, `abtesting-ai` in nav~~ → cut from SYSTEMS_MODULES registry (components kept, just removed from nav)
- ~~`quantization` Methods reference table~~ → cut, module now shows Calculator only

**Fixed in sprint 8 (May 2026):**
- ~~RAG Lab mobile layout broken~~ → `App.jsx`: horizontal scroll pill strip on mobile (sidebar hidden below lg, scenario pills above content)
- ~~Agent Lab / Systems Lab sidebar doesn't close on mobile~~ → `Agents.jsx` + `Systems.jsx`: `mobileSidebarOpen` state added; clicking a module collapses sidebar, back button (`← Agent Lab`) re-opens it
- ~~Low-brightness mobile unreadable~~ → `index.css`: single `@media (max-width: 1023px)` rule shifts zinc-400/500/600/700/800 one stop brighter; zero JSX changes

**Fixed in sprint 9 (May 2026):**
- ~~Home.jsx stats row horizontal overflow~~ → `flex gap-8` → `grid grid-cols-3 gap-2 sm:flex sm:gap-16`; `text-5xl` → `text-4xl sm:text-6xl`; white overflow strip eliminated
- ~~Journey strip right-clip no visual cue~~ → right-fade gradient overlay (mobile only, `lg:hidden`) signals horizontal scroll
- ~~PrepLab split-panel on mobile~~ → `mobileSidebarOpen` pattern applied (same as Agents/Systems)
- ~~Explore split-panel on mobile~~ → `mobileSidebarOpen` pattern applied; back button `← Explore` added
- ~~Global palette audit: zinc-500/600 unreadable~~ → CSS variable remap + 300+ class changes (sprint 8 palette audit commits `bea5281`, `b088571`)
- ~~Concepts sidebar hidden on mobile~~ → verified Concepts already has `sm:hidden` horizontal pill strip; no change needed
- ~~GT code blocks + tables on mobile~~ → verified `overflow-x-auto` already present on both; no change needed
- ~~Touch targets below 44×44px~~ → systematic `py-1`/`py-1.5` → `py-2.5` pass across GT (filter pills, action buttons, reactions, quiz), Home (failure pills + `min-h-[44px]`), Explore sidebar items, Agents/Systems sidebar items, Concepts mobile strip pills
- ~~Concept dependency graph SVG overflow~~ → right-fade gradient overlay added (same pattern as journey strip)

**Overflow-x scroll hint pattern (new standard):** Any `overflow-x-auto` strip that clips on mobile gets a `pointer-events-none lg:hidden` right-fade overlay. Applied to: journey strip, SVG concept graph.

**Still open:**
- `failures` module in Agent Lab is still a reference catalog. Low priority — keep as reference.
- Ask/Search label gap resolved (sprint 13) — button now says "Search →", count accurate. LLM upgrade still future work.
- 3 thin GT posts: `dpo-in-practice`, `llm-observability`, `instruction-tuning-datasets` — need expansion to 8+ blocks.
- Flows and Fluency tabs in PARKED.md — accessible but deprioritized.
- Concepts inline callouts + synthesis close — framing text done (15/15), but inline + synthesis beats pending. See UPGRADES.md.

## Session build log (May 2026)

**Resolved this session (sprint 17):**
- **Concepts gym expansion:** GYMS constant expanded from 5 to 14 rooms. 3 active (Language Models, Retrieval, AI Agents). 11 coming-soon placeholders: Evaluation, Production Systems, Foundation Models, Prompt Engineering, Cloud AI Services, Vector Infrastructure, Observability & Tracing, Multimodal AI, AI Safety & Alignment, AI Product Strategy, Data for AI. Each has color, desc, labId, labLabel. Brace diff: 0. Commit `a43fffe`.
- **Concepts ↔ Labs bidirectional connection:** `conceptsGym` state + `gymId` param added to `navigateTo` in `App.jsx`. `initialGym` prop + `useEffect` added to `ConceptsApp` — deep-links directly into the correct gym on mount. Quiet sidebar chips added: RAG Lab → "Concepts: Retrieval →" (blue), Agent Lab → "Concepts: AI Agents →" (amber), LLM Lab → "Concepts: Language Models →" (indigo). LLM Lab chip conditional on `labTitle === "LLM Lab"` so Eval/Systems sidebars are unaffected. Brace diff: 0 all files. Commit `bf7cc6a`.

**Resolved this session (sprint 16):**
- **Dynamic homepage:** `Home.jsx` now detects returning vs. new user from localStorage on mount (`getActivityData()` reads `gsl-preplab-history`, `gsl-concepts-mastery`, `genai_visited_modules`, `genai_gt_read`). New users see existing hero. Returning users see `ReturningHomeView`: date/greeting header, Today section (daily tip card + date-seeded GT featured post card), Jump Back In (last 3 unique tabs from `visitedMods`), Progress snapshot (PrepLab: N answered + % correct; Concepts Gym: N/15 + progress bar), Where to Next (3 quick-entry cards). Both views share beta banner + footer. `onNavigateTo={navigateTo}` wired into `HomePage` from `App.jsx` for GT post deep-link. `TAB_META` constant maps tab IDs to labels + colors. Brace diff: 0. Commit `6f18011`.
- **UPGRADES.md:** Font/color audit + Emoji→SVG upgrade entries logged. Commit `df51c5e`.

**Resolved this session (sprint 15):**
- **Concepts gym skeleton:** `GymSelectorView` (5-card grid with progress bars, coming-soon state), `GymRoomView` (PAL-style sequential module cards with insight teasers + time estimates), `ConceptsApp` rewritten as 3-view state machine (selector → room → module). `MODULE_META` constant (15 entries, insight + mins). `GYMS` constant (5 gyms: Language Models 7 modules, Retrieval 5, AI Agents 3, Evaluation + Production Systems as placeholders). `CONCEPT_GROUPS` sidebar removed; sidebar now shows only current gym's modules when in module view. Back navigation: gym room → selector, module → gym room. Lab forward pointer in GymRoomView footer. Brace diff: 0. Commit `e19fb27`.

**Resolved this session (sprint 14):**
- `Consultation.jsx` Search upgrade: button label "Ask →" → "Search →"; post count "135+" / "200+" → "222+"; result limits widened (posts 5→7, modules 3→4); `highlightText()` helper added — bolds matched keywords in post descriptions; zero-results state now shows 5 suggested query pills. Commit: `1ff9eaf`
- Nav: `Concepts` added to `KNOWLEDGE` NAV_GROUP (count: 15); `KNOWLEDGE` group moved above `LABS` — makes logical reading order (understand → build → grow). Commit: `d78025f`
- **Concepts framing text pass (15/15):** Before-the-interactive framing block added to all 15 Concepts modules. Commits `1f649a2` (6 core), `4539d5e` (6 remaining), `6d5083b` (3 game/special modules — FlashAttention, NextToken, Temperature replaced instruction-style callouts with real conceptual framing). Remaining: inline callouts + synthesis close (tracked in UPGRADES.md).

**Resolved this session (sprint 13):**
- `Consultation.jsx` (Ask/Search) audit: token-based scoring already present — real gaps were button label, stale count, no match highlighting, no zero-results fallback. All fixed. See sprint 14 entry above.

**Resolved this session (sprint 12):**
- `WeaknessHeatmapMode` added to PrepLab (mode "heatmap"): reads `gsl-preplab-history`, shows per-topic accuracy bars sorted worst-first, "Hard Questions" view showing most-missed questions. Added to PREPLAB_SIDEBAR as TRACK mode.
- Module-level `recordHistory(questionId, correct)` helper added; `InterviewPrepMode` now writes to history on every submit/selfGrade. TrainerMode updated to use shared `HISTORY_KEY` constant.
- `GateModal` unlock animation: success state with `gsl-pop` scale+fade + `gsl-glow` radial pulse + `gsl-fadein` text — 1.4s total, then calls `onUnlock`. Keyframes injected via inline `<style>` tag.
- **Concepts Gym**: `MASTERY_KEY = "gsl-concepts-mastery"` + `MODULE_NEXT_STEP` lookup (13 modules → lab/module forward pointers). `GymPanel` component: track accordion (FOUNDATION/APPLICATION/PRACTICE), per-module Start/Revisit, "Next up" recommendation, progress bars. `ConceptsApp` updated: `mastery` state, `gymView` toggle, "GYM" button in sidebar, ✓ badge per completed module, "Mark complete" / "✓ Completed" in module header. Commit: `820cb2d`

**Resolved this session (sprint 11):**
- TYU fix: `preplabInitialMode` state in `App.jsx`; `initialMode` + `onClearInitialMode` props in `PrepLab.jsx`; `useEffect` auto-selects Trainer mode when navigated from RAG Lab forward pointer — commit `327a745`
- Hero copy rewrite: removed Layer 3 amber badge, new gradient headline "Configure it. Break it. Know exactly why." — commit `327a745`
- `InterviewPrepMode` replaces `JDPrepMode` (PrepLab.jsx, 3 phases): Phase 1 (JD paste → SKILL_KEYWORDS detection, topics sorted by hit-weight), Phase 2 (self-rate each topic Weak/Okay/Strong, 3× weighting for weak), Phase 3 (gap-scored 20-question drill using `DRILL_W = {weak:3, okay:1.5, strong:0.5}` × jd_weight), Results (score + per-topic breakdown + study resources for weak areas + gated Phase 4 study plan teaser with GateModal overlay)
- `serving: "Serving & Inference"` added to `TOPIC_LABELS`; `serving: "bg-purple-500/20..."` added to `TOPIC_COLORS`; `DRILL_W` constant added at module level
- PREPLAB_SIDEBAR entry updated: label "Interview Prep Plan", tag "PLAN", desc "JD → gap score → targeted drill" — commit `4533e86`

**Resolved this session (sprint 10):**
- `Home.jsx` simplification: cut PATHS, SuggestedPath, LEARNING_PATHS, MODULE_MAP, DEP_NODES/EDGES, ConceptGraph, journey strip, social proof placeholders, learning paths section, concept graph section, module map section, how-to section, about section, email capture section
- Dead state removed: `role`, `switchRole`, `orderedGroups`, `isRelevant`, `activePath`, `pathRole`, `showPath`, `expandedModule`, `subEmail`, `subStatus`, `pathProgress`
- Kept: beta banner, hero + glow + door cards + "continue where you left off", stats row + failure pills, daily tip, footer
- `useMemo` import removed (no longer needed)
- Home.jsx: 1083 lines → ~367 lines (~66% reduction)
- Brace check: diff 0 ✓ — commit `303597c`

**Resolved this session (sprint 9):**
- Audit 32: Full mobile UX audit — 15 findings, all resolved or closed
- Audit 33: Touch target + overflow pass — all Audit 32 open findings resolved
- `Home.jsx`: stats row overflow fix; journey strip + SVG graph right-fade gradient; failure pills `min-h-[44px]`
- `PrepLab.jsx`: `mobileSidebarOpen` pattern; `selectMode()`/`exitMode()` helpers; back button `← PrepLab`
- `Explore.jsx`: `mobileSidebarOpen` pattern; module list `py-2.5` touch targets; back button `← Explore`
- `GroundTruth.jsx`: category filter `py-1` → `py-2.5`; all post action buttons + reactions + quiz button `py-1.5` → `py-2.5`
- `Agents.jsx` / `Systems.jsx`: module sidebar items `py-1.5` → `py-2.5`
- `Concepts.jsx`: mobile strip pills `py-1.5` → `py-2.5`
- AUDITS.md: Audit 32 + Audit 33 written; all 15 findings closed
- CLAUDE.md: sprint 9 build log updated

**Resolved this session (sprint 8):**
- RAG Lab mobile: `App.jsx` outer `flex` → `flex flex-col lg:flex-row`; desktop sidebar `hidden lg:flex`; mobile horizontal scroll strip added (scenario pills, whitespace-nowrap, violet active state)
- Agent Lab mobile: `mobileSidebarOpen` state (default `true`); `switchModule()` sets it `false`; sidebar `flex` / `hidden` conditional; back button `← Agent Lab` at top of content panel; right panel wrapped in outer div with `hidden`/`flex` toggle
- Systems Lab mobile: same `mobileSidebarOpen` pattern as Agents; back button reads `{labTitle || "Systems Lab"}`
- `index.css`: `@media (max-width: 1023px)` overrides zinc-400/500/600/700/800 CSS custom properties one stop brighter — entire app contrast lifted on mobile, zero JSX changes

**Resolved this session (sprint 7):**
- Tier A: `simulator` + `design` done screens → PrepLab forward pointer cards (violet gradient, ✓ badge, GT post links)
- Tier A: `serving` failure block → full scenario card with SERVING_FAILURE_SCENARIOS lookup (root cause, fix chips, severity badge)
- Tier A: `decoding` visualizer → reactive failure callout (3 triggers: repetition collapse, token incoherence, vocabulary starvation)
- Tier B: `agentcfg` AGENT_FAILURE_MATRIX expanded — 3 new trigger-based entries from `failures` catalog: cascading_errors (retryLimit=0 + 5+ tools), over_delegation (18+ tools + no memory), tool_poisoning (research + 32K context + no external memory)
- Tier B: `MoEExpertSimulator` component added — numExperts/topK/batchSize config → pseudo-random load distribution → bar chart → collapse/imbalance failure callout with fixes
- Tier B: `LangSmithTracingLab` — "Diagnose Traces" tab added as default view with `LangSmithDiagnose` component: 5 broken trace scenarios, span-click inspection, correct/wrong scoring, diagnosis + fix reveal
- Tier C: `deploy`, `buildthis`, `abtesting-ai` removed from SYSTEMS_MODULES registry in Systems.jsx
- Tier C: `QuantizationEngineering` slimmed — Methods reference table tab removed, Calculator tab only
- CLAUDE.md known issues updated

**Resolved this session (sprint 6):**
- Hero copy upgraded: badge "Free · No login · Layer 3 AI skills", magnetic subtext, outcome-oriented door cards, stat sync (261+ PrepLab, 222+ GT)
- Module endings: RAG Lab forward pointer card (scenario-specific — 6 scenario_id → GT post mappings), Concepts 12 modules upgraded from "Go deeper →" pills to ✓ done card with violet gradient container, Systems shell footer always shows PrepLab CTA + improved done/next styling
- `gated: true` added to 163 hard PrepLab questions + JD Prep mode card (invisible to users, activates with Stripe)
- Audit 28 run: full module-by-module gap analysis of Agent Lab (16), Eval Lab (18), LLM Lab (9) vs RAG Lab standard. 3/16 Agent Lab, 2/9 LLM Lab, 9/18 Eval Lab meet configure→fail→diagnose standard. 12 specific findings with priority order.
- AUDITS.md Audit 28 appended, IDEAS.md Tier 1 CRITICAL cluster added (Tier A/B/C upgrade plan), CLAUDE.md known issues updated
- Commit: `55998de` (sprint UX), MD files updated locally

**Resolved this session (sprint 5):**
- PrepLab text grading: replaced keyword auto-grade with self-assess UI (open answers can't be reliably auto-graded on a static site)
- `consult` added to SHORTCUT_TABS in App.jsx
- LLM Lab slimmed: 39 modules → 9 true simulators. Reference modules moved to PARKED.md.
- PARKED.md created: documents deferred modules (39 LLM Lab reference modules, Flows, Fluency, Ask/Search identity crisis, Learning Paths structure issue, Context Compaction deferred)
- ServingInfra rebuilt as full decision engine: hardware config → framework/quant/batching recommendation
- AgentConfigLab: 5 failure scenarios with trigger logic (context_overflow, tool_loop, hallucinated_tools, state_amnesia, cascade_failure)
- ModelMergeExplorer added to Explore BUILD group: SLERP/TIES/DARE/Breadcrumbs decision guide
- MultimodalGuide added to Explore BUILD group: CLIP/LLaVA/Native arch comparison
- FlashAttentionConcept added to Concepts FOUNDATION group: O(n²) vs O(n) VRAM interactive, tiling diagram, growth table
- StreamingLab added to Playground STREAM group: SSE/WS/batch simulator, failure injection, latency breakdown
- AUDITS.md: Audits 25 (sprint review), 26 (MVP/Weight — first run), 27 (IP/Moat — first run)
- DECISIONS.md: Section 4 added — interactive decision engine standard, tabs-that-earn-their-place, module endings, GT quality bar, zero-backend constraint
- PARKED.md: Ask/Search, Learning Paths, Context Compaction added
- IDEAS.md: CRITICAL cluster added to Tier 1 — module endings, reference tables → decision engines, social proof, stat sync, thin GT posts

**Resolved this session (sprint 4):**
- Concepts tab: replaced flex-wrap pill nav with sidebar layout (FOUNDATION/APPLICATION/PRACTICE groups)
- 6 GT posts: ds-to-ai-engineer, forward-deployed-engineer, prompt-regression-testing, claudemd-as-architecture, hooks-vs-llm-safety, context-isolation-multiagent
- 3 Systems modules: Query Refinement Lab (HyDE/multi-query/decomposition), Prompt Change Management (version/test/rollback), AI Safety Engineering (6 attack patterns, 5 defense layers, hardening checklist)
- 14 PrepLab questions: qr-1–4 (Query Refinement), pcm-1–3 (Prompt Change Mgmt), ase-1–4 (AI Safety Engineering), + earlier session questions confirmed
- Explore tab: DESIGN/BUILD/OPS group structure added to 23-module left panel
- Evals Lab: "Build Your Eval" tab added — 4-step wizard generating LLM-as-judge prompts

**Resolved previous sessions:**
- D1: Quiz CTA pill added to GT post header (generateQuiz discoverability)
- D2: PrepLab readMore links now deep-link to specific GT posts via postId
- F2: Career door on Home.jsx routes to career tab, calls out Salary Calculator
- related[] injected into 136 GT posts (194/205 now have related arrays)
- production-mlops category filter added to GroundTruth.jsx
- Sitemap regenerated (202 → 205 GT post URLs, dead old-domain entries removed)
- RSS feed regenerated (202 items, correct domain)
- DECISIONS.md + CLAUDE.md stale count references fixed
- "Ask" nav label → "Search" in ALL_TABS (App.jsx)
- PrepLab question count: 190+ → 231 (added attention/transformers/context/serving/caching/streaming/product/reasoning/cosine/long-context clusters)
- Cosine Similarity Explore module built (drag-vectors interactive)
- EvalMetrics module expanded: RAGAS, Exact Match, LLM-as-Judge tab, hallucination scoring example
- Long Context Patterns Systems module built (needle-in-haystack viz, 5 patterns, model limits)
- Model Architecture Comparison Explore module built (BERT/GPT/T5 guide + use-case wizard)
- Hardware Reference Explore module built (GPU table + VRAM calculator)
- GT posts written: Type A vs Type B Engineers, What Happens During Pretraining, Why Your RAG System Lies
- Tokenizer Comparison Explore module built (BPE/WordPiece/SentencePiece/tiktoken guide + approximate live demo + token cost calculator)
- Prompt Injection Defense Systems module built (5 attack patterns, 5 defense layers, hardening checklist)
- GT posts written: The Eval Crisis (4 eval failure modes), The Reversal Curse (directional parametric memory)
- Vector DB Engineering Systems module built (pgvector/Chroma/Pinecone/Weaviate/Qdrant comparison, HNSW/IVF index guide, hybrid search, decision wizard)
- Agent Memory Architecture Systems module built (4 memory types, failure demos, production stack, decision layer)
- GT posts written: Agent Memory (4 types + decision layer), How Surprised Is the Model (entropy/cross-entropy/KL), Why Transformers Won (RNN→LSTM→Transformer arc), Your Prompt Is Code (prompt CI/CD), Three-Layer DE Skill Stack
- PrepLab questions: 231 → 244 (5 Vector DB questions added)
- HowTo import bug fixed in systems/modules.jsx (was causing runtime ReferenceError)
- Duplicate JUDGE_SCENARIOS declaration renamed to LLM_JUDGE_SCENARIOS (was breaking Vercel build)
- NAV_GROUPS sidebar counts corrected (all 10 entries updated to accurate values)
- Systems left panel: group filter pills added (All / DESIGN / BUILD / OPS)
- Explore left panel: search input added
- Mobile bottom nav bar shipped: LEARN/BUILD/GROW 3-item fixed bar with slide-up tray, icons, pill highlights, 2-column grid tray, colored top accent line, frosted glass bar
