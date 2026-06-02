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

Scale as of June 2026: 57 Systems modules (in nav), 22 Explore modules, 16 Agent Lab modules, 27 Concepts modules (7 active gyms), 295 PrepLab questions, 226 Ground Truth posts. 5 labs: RAG Lab, Agent Lab, Eval Lab, LLM Lab, Prompt Lab. Nav: KNOWLEDGE (Concepts, Ground Truth) + 4 Labs (RAG Lab, Agent Lab, Eval Lab, LLM Lab) + GROW (Prep Lab, Career, AI Product). Legacy tabs (Flows, Agents, Playground, Explore, Systems, Paths, Fluency) accessible via #hash but not in primary nav.

**Business model:** Freemium with access code gate (decided May 2026). Free: all Labs, all GT, all modules, PrepLab 10q/session. Gated (access code now, paid later): full PrepLab, Company Tracks, Interview Prep Plan study plan (phase 4, gated after 30% completion). Community code shared freely during beta. Stripe + auth when ready to monetize. See DECISIONS.md Section 0.

---

## Tech stack — non-negotiable constraints

| Constraint | Rule |
|---|---|
| Language | `.jsx` only. **No TypeScript.** TypeScript breaks Vercel builds with this setup. |
| React hooks | Always `import { useState, useEffect } from "react"`. **NEVER `React.useState()`** — causes ReferenceError at runtime. |
| CSS | **Tailwind `zinc-*` palette only.** `gray-*`, `slate-*` are visual inconsistencies. For structural surfaces use CSS vars: `var(--bg)` page, `var(--surface)` sidebars/panels, `var(--surface-2)` cards, `var(--border)` borders. `bg-zinc-900`/`border-zinc-800` still usable for chips/badges/code blocks. |
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
- Microsoft RAG interview transcript (May 2026) — candidate failed on bi-encoder vs cross-encoder two-stage architecture. Could describe vector search failure modes but not WHY a reranker exists as a second stage. Lab gap: two-stage retrieval design decision (recall vs precision, distinct failure modes per stage) absent from both GT and PrepLab. Added to IDEAS.md Tier 1.
- Qwen3.6-27B local inference post (May 2026) — ~80 tok/s on quantized local model fine for conversational use, latency bottleneck for agentic loops with 10–15 sequential tool calls. Lab gap: serving module covers throughput generally but not the agentic call-rate constraint. Added to IDEAS.md Tier 2.
- Builder story: £1000+ quiz platform on Gumroad/Etsy (May 2026) — distribution signal: structured static content sells via marketplaces before Stripe exists. Actionable: PrepLab cheat sheet PDF on Gumroad as early revenue test. Decision-gated: only relevant if Stripe deferred 6+ months. Added to IDEAS.md freemium section.
- Senior AI Engineer interview post (May 2026) — Round 1 tested Graph RAG, multi-hop/cross-document retrieval, table extraction, HITL workflows. Round 2 tested LangGraph reducers, observability, serverless vs K8s. Key insight: senior AI interviews now test end-to-end system design + evaluation + deployment, not just LLM fundamentals. Lab covers most of Rounds 1–2 except Graph RAG (completely absent) and LangGraph-specific state model (reducers/nodes/edges). Async/FastAPI/MLflow out of scope — implementation not systems. Added Graph RAG cluster (Tier 1) + LangGraph/HITL cluster to IDEAS.md. Graph RAG added to NEXT.md Pending.
- LLM/GenAI Interview Master Guide (136 questions, 10 categories, 4-layer format — Short Answer / Deep Answer / Follow-ups / Common Trap), May 2026. Strongest signal: the "Common Trap" answer layer is completely absent from GAL's PrepLab — "what weaker candidates say" is the most interview-useful piece of information in any answer, and PrepLab skips it entirely. Added as High-priority entry to UPGRADES.md. Content gaps surfaced: (1) Scaling laws — Q1 fundamentals topic, completely absent from GAL → Tier 1 cluster (GT post + PrepLab + Concepts module). (2) Semantic caching — cost optimisation topic, absent → Tier 1 cluster (GT post + PrepLab). (3) Dense vs sparse retrieval (BM25 vs vector, hybrid search) — RAG architecture gap → Tier 1 cluster. (4) LoRA/QLoRA — fine-tuning depth previously deprioritised, elevated to Tier 1 (Concepts module + GT post + PrepLab). (5) Fintech/Lending AI — previously skipped as domain-specific, re-evaluated: fintech is highest-density real-world AI deployment with hard system design constraints (explainability, fairness, regulatory). Elevated to Tier 2, added as PrepLab Company Track + GT post. Screenshot "3 businesses to hit $100K" (AI agency, content creation, vibe coding) — noise. One positioning note: vibe coding tools lowering the bar reinforces GAL's thesis (premium is on production-grade knowledge, not prototyping ability). Not logged.

**Sibling codebase reads (May 2026):**

Two sibling products built by the same author on the same stack provide a live comparison surface. Both have been fully read (CLAUDE.md, IDEAS.md, DECISIONS.md). Key patterns observed and logged below.

- **ML Systems Lab** (`github.com/SidharthKriplani/ml-systems-lab`) — 200+ scenarios across 6 engineering domains, React 18 + Vite, CSS variables (no Tailwind), Pyodide (Python in-browser), Web Speech API. Ships: React.lazy() code splitting (all 30+ tabs), fidelity badges (`✓ Real execution` / `~ Simulated` on module headers), 91-day activity heatmap + daily streak, Share Score clipboard button, "How a staff engineer reads this" StaffLayerTab reveal, "Spot the Flaw" adversarial diagnosis format, state-aware Gradient post reading mode (Revise/Learn/What's Next from localStorage), per-domain debrief breakdown chart, CombinatorTab timed exam with answer lock, keyboard shortcuts (1/2/3/4 + Enter), tiered model answers (Junior/Mid/Senior/Principal), Progress export/import (JSON), cross-tab "Production Incident" scenario format. Defense Plan equivalent already merged from separate JD Prep + Defense Doc modes (v4.10) — same consolidation pending here. Labs: freemium gate identical (`DAI2026` community code, access code in localStorage).

- **Product Analytics Lab — PAL** (`github.com/SidharthKriplani/experimentation-systems-lab`) — 17 rooms for product analytics + PM interview prep, React 18 + Vite, CSS variables (no Tailwind), Supabase auth optional. Ships: React.lazy() + Suspense on every room component (full bundle optimization), Defense Strategy V2 spec (5-step: JD → resume gap detection → rate gaps only → round context → prior round feedback → day plan), "Quiz Me" on Playbook articles (3-5 MCQs from article body), "Practice this" direct link at end of every article, Timer play/pause shared component (TimerButton) across 5 runners, timed exam lock mechanic, multi-part escalating case dossiers (3–5 part company scenarios), Deep Dives Series + Tags IA (activates at 50+ posts — already past that in GT at 222), three-mode personalized reading queue (Revise/Learn/What's Next). PAL's IDEAS.md explicitly cross-references genai-systems-lab's Build/Prove/Navigate architecture and single-forward-pointer pattern — both await implementation here. Feature building paused in PAL pending PostHog WAU baseline — analogous pause not yet done here.

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
| `NEXT.md` | Focused next-session task list — 3–5 committed items only. Read at session start, update at session end. | **Every session — read this first, after CLAUDE.md** |

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

## Session build log (May 2026 — June 2026)

**Resolved this session (sprint 42 — June 2026):**
- **Context management + MD sync.** CLAUDE.md trimmed 587→371 lines; sprints 1–37 moved to `HISTORY.md`. `CONTEXT_AUDIT.md` created for all 3 sibling labs (file size audit, danger thresholds, Grep-first rules, CLAUDE.md <400 line rule). IDEAS.md + UPGRADES.md synced to sprint 41 scale. Commit `bfb28d2`.
- **promptlab-5 + promptlab-6.** Temperature miscalibration (medium MCQ free) + prompt decay diagnosis (hard text gated). Total: 297 PrepLab questions. Commit `f96bc4a`.
- **Role Readiness Score in PrepLab.** `getRoleReadiness()` helper + `readiness` state + sidebar widget. Tiers: Familiar / Practitioner / Senior / Staff derived from `gsl-preplab-history`. 4-dot visual + count + accuracy. Shows after 5+ questions answered. Commit `f96bc4a`.
- **Foundation Models Lab shipped.** `src/FoundationModelsLab.jsx` created (6 scenarios): lora_rank_low ("The Underfitting Adapter"), lr_too_high ("The Forgetting Model"), eval_contamination ("The Leaky Benchmark"), data_volume ("The Memorising Student"), objective_mismatch ("The Confident Hallucinator"), base_model_mismatch ("The Wrong Foundation"). Each has 3 configs (fail/partial/pass), metrics grid, root cause, fix, design principle callout, PrepLab forward pointer. Wired: lazy import, VALID_VIEWS, page title, routing in App.jsx. Added to ALL_TABS + NAV_GROUPS in nav.js (BUILD group, count: 6). 4 PrepLab questions (fmlab-1/2/3/4). Brace diffs: 0. Commit `6cb2194`.
- **Scale after sprint 42 (initial):** 57 Systems modules (unchanged), 226 GT posts (unchanged), 301 PrepLab questions (was 295), 27 Concepts modules (unchanged), 6 labs (was 5 — Foundation Models Lab added).
- **Paper theme system shipped.** `src/index.css` updated: `:root` moved from cold LUNA void to Paper warm dark (`#110e0a` base, warm brown-black zinc scale). New `[data-theme="light"]` block with full inverted zinc remap (cream `#faf7f2` → ink `#1c1410`). `html[data-theme="light"]` remaps `text-white` → dark ink. `[data-palette="luna"][data-theme="light"]` swaps cyan accent to warm violet `#7c3aed`. Glow + mobile contrast boost scoped to dark mode only. New `--gal-build-tint` + `--gal-build-border` CSS variables. `src/App.jsx`: `theme` state (localStorage `gal-theme`), `useEffect` syncs to `<html>` + root div, sun/moon toggle in desktop header. `src/FoundationModelsLab.jsx`: all hardcoded `#22D3EE` → `var(--gal-build)`, rgba tints → CSS vars. Commit `2884aa1`.
- **Build fixes.** Duplicate `INTERVIEW_STORIES` in App.jsx removed (`46bd398`). Duplicate `AGENT_INTERVIEW_STORIES` in Agents.jsx renamed to `AGENT_FAILURE_STORIES` at declaration + usage site (`9a70d75`). Both were stale schema variants from earlier sprints.
- **Scale after sprint 42 (final):** 6 labs, 301 PrepLab questions, 27 Concepts, 226 GT posts, 57 Systems. Paper warm theme (light + dark). Sun/moon toggle in desktop header.

**Resolved this session (sprint 41 — batches A–B, June 2026):**
- **Batch A: 7 new Concepts modules + 4 gyms activated.** `LLMAsJudgeConceptsModule` (2-tab: LLM-as-judge scoring interactive, calibration failure modes), `EvalDesignModule` (3-tab: test suite builder, metric selection, judge design), `AgentToolDesignModule` (2-tab: tool schema designer with failure prediction, when-to-tool decision table), `CostLatencyConceptsModule` (3-tab: TTFT/TBT/E2E interactive breakdown, budget calculator, latency vs quality dial), `ObservabilityConceptsModule` (3-tab: trace anatomy, what to log decision tree, alert threshold calibration), `FewShotModule` (2-tab: example format explorer with quality dimensions, few-shot vs zero-shot decision), `ChainOfThoughtModule` (2-tab: CoT vs standard prompting side-by-side, when CoT helps vs hurts). Four Concepts gyms activated (moved from comingSoon: true to active): Evaluation (eval-loop, debug, llm-as-judge, eval-design), Production (cost-latency-concepts, observability-concepts), Foundation Models (training-signal, scaling-laws, lora), Prompt Engineering (few-shot, chain-of-thought). File: `src/Concepts.jsx`. Brace diff: 0. Commit `ed54c5a`.
- **Batch B: Prompt Engineering Lab shipped.** `src/PromptLab.jsx` created (560 lines): 6 scenarios — regression_edit ("The 11-Day Quality Drop"), user_injection ("The Override"), few_shot_contamination ("The Bad Example"), structured_output_failure ("The Schema Drift"), temperature_miscal ("The Confident Hallucinator"), over_constrained ("The Instruction Conflict"). Each scenario has 3 config options, detailed outcome cards with root cause + fix + synthesis close, PrepLab forward pointer. Lab shell: same split-panel pattern as RAG Lab (sidebar + content, mobile-responsive with back button). `src/App.jsx` updated: lazy import, routing entry (`topView === "promptlab"`), page title, VALID_VIEWS updated. `src/config/nav.js` updated: `promptlab` added to BUILD group (count: 6). 4 PrepLab questions (promptlab-1 through promptlab-4). Brace diffs: 0. Commit `b93535e`.
- **Scale after sprint 41:** 57 Systems modules (unchanged), 226 GT posts (unchanged), 295 PrepLab questions (unchanged), 27 Concepts modules (was 20), 7 active gyms (was 3), 5 labs (was 4 — Prompt Lab added).

**Resolved this session (sprint 40 — batches A–I, June 2026):**
- **Batch A: Config extraction.** `src/config/nav.js` created — ALL_TABS and GROUP_COLORS extracted from App.jsx. Import added to App.jsx. Concepts count updated 15→20 in NAV_GROUPS. Brace diff: 0. Commit `992cfc4`.
- **Batch B: Shared components.** `src/shared.jsx` expanded — `ProductionNoteChip`, `ForwardPointerCard`, `WhatNextCard`, `FeedbackBar` added alongside existing `CommonTrapCallout`. Each component documented. Brace diff: 0. Commit `2c57ff2`.
- **Batch C: Streak + heatmap.** `getStreakInfo()` helper added to Home.jsx — reads/updates `gsl-streak`, `gsl-last-visit`, `gsl-activity-YYYY-MM-DD` localStorage keys. `ReturningHomeView` shows streak chip + 4-week GitHub-style activity grid (28 cells, 4 intensity levels, cyan tint). Concepts progress bar updated 15→20. Brace diff: 0. Commit `0d7371f`.
- **Batch D: FeedbackBar.** `FeedbackBar` component in shared.jsx fires `feedback_submitted { rating, page, content_type }` PostHog event on thumb up/down. Wired into: GT post end (GroundTruth.jsx), PrepLab exam session end (PrepLab.jsx), Systems module footer (Systems.jsx). All imports updated. Brace diffs: 0. Commit `0e5b3ab`.
- **Batch E: Multi-select MCQ.** `MCQMultiOptions` component added to PrepLab.jsx — checkboxes, "Select all that apply" label, toggle behaviour. `type: "multi"` questions use comma-joined sorted string for answers (e.g. "0,2"). Scoring updated in computeResults + session history snapshot. Keyboard shortcuts adapted (1/2/3/4 toggle). RevealCard shows all correct answers for multi. TrainerMode submit logic updated. Brace diff: 0. Commit `9c7ba18`.
- **Batch F: Common Trap expansion.** Python transformation script added trap fields to all 109 medium-difficulty questions lacking them (182 trap fields total across the bank). All trap fields answer "what weaker candidates say." Brace diff: 0. Commit `204138f`.
- **Batch G: AgentContextArchModule.** New Systems module in `src/systems/modules.jsx` — 3-tab interactive (Configure Layers with memory/skills/delegation/hooks config + simulation, Failure Modes catalog of 4 patterns, When to Use decision table). Added to SYSTEMS_MODULES + RELATED_GT in Systems.jsx. 4 PrepLab questions (agentctx-1/2/3/4). Scale: 57 Systems modules. Brace diffs: 0. Commit `144618f`.
- **Batch H: GT posts verification.** `prompt-regression-testing` and `ab-testing-ai-systems` were already fully written in groundTruthPosts.js (15+ blocks each). No action needed.
- **Batch I: GT Quiz depth.** `generateQuiz()` in GroundTruth.jsx expanded from max 3 to max 7 questions — now extracts from: callouts (×2), lists (×2), tables (×1), h2 headers (×1), labelled code blocks (×1). Brace diff: 0. Commit `2fe2fe0`.
- **Scale after sprint 40:** 57 Systems modules (was 56), 226 GT posts (unchanged), 295 PrepLab questions (was 287 + 4 agentctx + 4 scaling previously in sprint 39), 20 Concepts modules (unchanged).

**Resolved this session (sprint 39 — batches 2–10, June 2026):**
- **Batch 2–3: "Your Interview Story" on Agent Lab.** `AGENT_INTERVIEW_STORIES` (8 agentcfg failure modes) + `SIMULATOR_INTERVIEW_STORIES` (5 scenarios) + design challenge stories (3 challenges) added to `src/Agents.jsx`. Story collapsible block rendered in all Agent Lab done screens with violet accordion pattern. Brace diffs: 0. Commits: `2c9e282`, `1b4346d`.
- **Batch 4: "Maps to Production" on Agent Lab + LLM Lab.** `productionNote` field added to all 8 `AGENT_FAILURE_MATRIX` entries and all 5 `SERVING_FAILURE_SCENARIOS`. Rendered as zinc chip with ⚙ icon after fix list — same pattern as RAG Lab sprint 36. Files: `src/Agents.jsx`, `src/systems/modules.jsx`. Brace diffs: 0. Commit: `b253405`.
- **Batch 5: EvalLoopModule Beat 2 + Beat 3.** `EvalLoopModule` was the only Concepts module missing both inline callout and synthesis close. Beat 2 "What to notice" amber block added (RAGAS metrics + debug tab guidance). Beat 3 synthesis close added ("An eval loop is not a quality signal — it is a diagnostic decomposition"). All 16 original Concepts modules now 3-beat complete. Brace diff: 0. Commit: `04c7a51`.
- **Batch 6: ScalingLawsModule + 4 PrepLab questions.** `ScalingLawsModule` Concepts module (3-tab: formula slider D≈20N with parameter reduction calculator, training-optimal vs inference-optimal strategy cards, real models table). Added to Language Models gym, MODULE_META, MODULE_NEXT_STEP. 4 PrepLab questions: scaling-1/3 medium free, scaling-2/4 hard gated, all with trap fields, readMore → chinchilla-scaling-laws. GT post already existed. Files: `src/Concepts.jsx`, `src/data/preplabQuestions.js`. Brace diffs: 0. Commit: `fd73d26`.
- **Batch 7: Semantic caching GT post + 3 PrepLab questions.** GT post `semantic-caching` written (10 blocks: how it works, threshold calibration table with 4 rows, when it breaks list, tooling list, combining with prompt caching section, refs). Added to `groundTruthIndex.js` (category: llmops). 3 PrepLab questions: semcache-1 medium free, semcache-2/3 hard gated, all with trap fields, readMore → semantic-caching. Files: `src/groundTruthIndex.js`, `src/groundTruthPosts.js`, `src/data/preplabQuestions.js`. Brace diffs: 0. Commit: `267a552`.
- **Batch 8: Dense vs sparse retrieval — 3 PrepLab questions.** GT post `hybrid-search` already existed (9 blocks). 3 PrepLab questions: retrieval-1/2 medium free, retrieval-3 hard gated, all with trap fields, readMore → hybrid-search. File: `src/data/preplabQuestions.js`. Brace diff: 0. Commit: `d0d1459`.
- **Batch 9: LoRAModule Concepts module.** `LoRAModule` built (3-tab: rank decomposition with sliders showing trainable params vs total, QLoRA VRAM math cards comparing full LoRA vs QLoRA on 70B, when-to-use decision table 6 scenarios). Added to Language Models gym, MODULE_META, MODULE_NEXT_STEP. Files: `src/Concepts.jsx`. Brace diff: 0. Commit: `0915cb8`.
- **Batch 10: SequentialParallelModule + TrainingSignalModule.** `SequentialParallelModule` (2-tab: step-through sequential vs parallel demo, Architecture Arc RNN/LSTM/Transformer cards). `TrainingSignalModule` (2-tab: entropy slider with real-time surprise + gradient signal, Real Examples with 3 pre-built scenarios). Both built with all 3 beats. Both added to Language Models gym. File: `src/Concepts.jsx`. Brace diff: 0. Commit: `caaadb5`.
- **Scale after sprint 39:** 56 Systems modules (unchanged), 226 GT posts (was 225 + semantic-caching), 287 PrepLab questions (was 277 + 10 new: 4 scaling + 3 semcache + 3 retrieval), 20 Concepts modules (was 16 + ScalingLaws + LoRA + SeqParallel + TrainingSignal).

**Resolved this session (GT State-Aware Reading Mode — sprint 37c):**
- **GT State-Aware Reading Mode shipped.** `src/GroundTruth.jsx` updated: three reading lenses added above the category filter pills (only visible when filter === "all"). "All" = current default. "Revise weak spots" = reads `gsl-preplab-history` localStorage, surfaces unread posts in categories where PrepLab miss-rate > 40%, sorted by worst topic first, up to 12 posts. "What's next" = reads `gsl-gt-read-[id]` keys (set by sprint 37b useEffect) + `genai_visited_modules`, surfaces unread posts in categories the user has visited, falls back to newest unread, up to 15 posts. Empty states for zero history. Converts 225-post wall into a personalized study queue. Brace diff: 0. Commit: `a37d99c`.

**Resolved this session (sprint 38 — RAG Lab static corpus):**
- **RAG Lab static corpus shipped.** `src/ragCorpus.js` created (149 lines): 24 real document objects across all 6 RAG Lab scenarios (3-4 docs per scenario). Each doc has id, title, similarity score, and full text excerpt. Scenarios covered: missing_answer (HR leave policies — maternity, paternity, special leave), ambiguous_query (API pricing docs — public vs internal vs enterprise), conflicting_documents (expense policy 2022 vs 2024 — deliberate stale version conflict), multi_hop (company/investor/product profile chain), three_hop_chain (GDPR Art.17 + exceptions + ICO retention guidance), prompt_injection (legitimate vendor SOP + injected payload page). `src/App.jsx` updated: import added, `openChunks` state added, "Retrieved chunks" collapsible panel rendered after the forward pointer card and before Suggested Fix — shows all 3-4 corpus docs with title, similarity score, and full text. Collapses by default ("▼ what the retriever actually returned"). Users can now read the exact text that caused hallucination, the exact conflicting chunks, the exact injected instruction. Brace diff: 0. Commit: `9a985b5`.
- **GT State-Aware Reading Mode** — discovered already fully implemented (viewLens state, all 3 lenses, selector UI). The gt-read tracking shipped in sprint 37b directly powers the "What's new to me" lens. No additional build needed.

*Sprints 1–37 archived in HISTORY.md — read that file only when you need specific historical context.*


