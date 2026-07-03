# GSL Content-Merit Audit & Decision Log

> **READ THIS FIRST** before touching GSL content/surfaces. This is the authoritative
> per-surface keep/merge/absorb/cut record so decisions are recalled, not re-derived.
> Companion docs: `GSL_MASTER_PLAN.md` (build history + Rev-2/Rev-3 consolidation thinking),
> `GSL_ROADMAP.md` (parity roadmap). Last full audit: 2026-07-03.

## How to use this doc
- Before auditing/deciding on any existing surface, check its row here first.
- After executing a decision, update the **Status** column (planned → done) with the date.
- If a new realization contradicts a row, update the row — don't silently re-decide.

---

## Headline (2026-07-03)
The early "built-in-excitement" content is a **scrapyard of mostly-good iron**: ~50% genuinely
strong & distinct, ~30% good-but-redundant (needs a canonical home), ~20% off-mission/thin.
The disease is **duplication + no "one home per intent"**, not bad content. Work is
consolidation and re-homing, not rewriting.

---

## Per-surface verdicts

### Agent Lab (`src/Agents.jsx`, ~3939 LOC, 16 modules) — route `agents`/`agentlab`
Crown jewel. No stubs; smallest module 82 LOC, Loop Simulator 932 LOC. **KEEP as canonical agents home.**
- KEEP: ReAct Pattern, Tool Use Design, Agent Memory, Multi-Agent, Failure Modes, Planning Patterns, Agentic Reliability, Computer Use, Long-Running Workflows, A2A Protocol, Design Challenge, Loop Simulator, Agent Config Lab.
- MERGE: **Memory Architecture → Agent Memory** (two memory modules split the topic).
- FORTIFY: **Framework Landscape** (thinnest module — reference card + 3-Q wizard).
- KEEP + dedupe note: **MCP Deep Dive** (overlaps Code Labs `mcp-server-min` + Systems `mcp`).
- Note: Concepts `ai-agents` gym (7 thin modules) is now **vestigial** — forward banner already routes users to Agent Lab; kept only for deep-link back-compat. Eventual cleanup.

### AI Product (`src/AIPM.jsx`, 5 modes) — route `aipm`
The one genuinely off-mission surface (PM content, not AIE). **RETIRE the surface; salvage 3 of 5.**
- CUT/archive → `_legacy/`: **PRD Simulator**, **Roadmap Prioritizer** (pure PM). ⚠️ NEEDS USER CONFIRM.
- ABSORB → Production/Eval hub: **Launch Checklist** (16 pre-ship items — high AIE value).
- ABSORB → Concepts/Foundations decision surface: **AI or Not?** (rules vs ML vs LLM + cost/latency table).
- REPURPOSE → Fluency (incident-communication) or Eval/Incident: **Stakeholder Explainer** (incident→audience translation).

### Playground (`src/Playground.jsx`, ~2881 LOC, 12 labs + library) — route `playground`
**KEEP as the practice-sandbox tier.** All real interactives.
- KEEP (unique): Prompt Injection, Spot the Hallucination, Context Tetris, Bias Detector, Prompt Library, Streaming Token Lab, Failure Simulations.
- KEEP (already deduped, carry `canonical:` → Concepts): Chunking Strategy, Reranker Simulator, Temperature Lab, Embeddings Space, Attention Visualizer.
- ADD `canonical:` pointer (stragglers): **KV Cache → LLM Lab**, **Agent Loop Sim → Agent Lab**.

### Project Labs (`src/Career.jsx`, 2 sub-modules) — route `career`
**The single best interview content in GSL. KEEP + PROMOTE + FORTIFY.** Most under-framed (buried under "career").
- KEEP + FORTIFY: **System Design** (5 scale scenarios + component rubrics) — add scenarios.
- KEEP (flagship): **Take-home Challenge** (real take-home formats + 4 expert scenarios, seniority-graded rubrics).
- Move: promote out of "career" framing into the BUILD/JUDGE frame.

### Interview Room / Fluency (`src/Fluency.jsx` ~2346 LOC + `SpeakMode.jsx`, 9 modes) — route `fluency`
**KEEP as articulation/spoken home, but tighten.**
- KEEP (distinct core): Speak, Company Cases (dedupe note vs company content), Timed Drills, Phrase Bank.
- MERGE: **Prompt Challenges + Prompt Engineering Lab → one** (two thin prompt modes).
- MERGE/verify: **Mock Interview → PrepLab** (overlaps Exam + Speak) — confirm distinct or consolidate.
- ABSORB/label: **Readiness Check ↔ PrepLab Exam** (doc already ruled: keep both, label the relationship).
- VERIFY: **Flashcards** depth (possible overlap w/ Phrase Bank).

### PrepLab (`src/PrepLab.jsx` ~4180 LOC, ~591 Qs, 10 modes) — route `preplab`
**Canonical assessment home. KEEP.** Bank is production-worthy (traps, staffLayer, source attributions, cluster weakness-grouping). No cuts to the bank.
- KEEP: Judgment Exam, Review Due (spaced-rep), Interview Sprint, Interview Strategy, Interview Signal, Browse All.
- RECONCILE: **Company Tracks mode** — part of the 3-way company redundancy (see map).
- VERIFY: hidden modes (Defense Doc / Weakness Heatmap) — shipped vs experimental.

---

## Redundancy map (2+ surfaces teaching the same thing → canonical)
| Topic | Homes | Canonical | Action |
|---|---|---|---|
| Agents | Agent Lab (rich) · Concepts `ai-agents` (7 thin) | **Agent Lab** | Forwarded (Phase 0.3); thin Concepts vestigial. |
| MCP | Agent Lab MCP Deep Dive (concept) · Code Labs `mcp-server-min` (code) · Systems `mcp` | **Split: Agent Lab=concept, Code Labs=code** | Cross-link the two; retire Systems `mcp`. |
| **Company content** | PrepLab Company Tracks · Fluency Company Cases · **CompanyTracks.jsx** | **CompanyTracks.jsx** | 3→1: CompanyTracks canonical; PrepLab = filter view; Fluency = bespoke-scenario feeders. **Sharpest redundancy.** |
| Readiness/assessment | PrepLab Exam · Fluency Readiness Check · readiness.js | **PrepLab** (+ Fluency labeled quick diagnostic) | Doc ruled — add relationship label. |
| Embeddings/Attention/Temperature/Chunking/Reranking | Concepts · Playground · Explore | **Concepts** | Done — `canonical:` pointers exist. |
| KV Cache | Concepts · LLM Lab · Playground (unflagged) | **Concepts/LLM Lab** | Add `canonical:` to Playground KV Cache. |
| Agent loop sim | Agent Lab (932 LOC) · Playground (134 LOC) | **Agent Lab** | Add `canonical:` to Playground version. |
| Prompt engineering | Concepts `prompt-engineering` · Fluency (2 modes) · Playground Prompt Library | **Concepts** (teach) + Playground (reference) | Merge Fluency's two; reframe as articulation. |
| Launch/pre-ship rigor | AIPM Launch Checklist | **Production/Eval hub** | Absorb — good content, wrong home. |

---

## Action plan (sequenced) — mirror of tasks #22–26
**Quick, non-destructive (do first):**
1. Reconcile company content 3→1 (CompanyTracks canonical). [task #22]
2. Add `canonical:` pointers to Playground KV Cache + Agent Loop Sim. [task #25]
3. Merge Fluency's two prompt modes; merge Agent Lab's two memory modules. [task #26]
4. Label Readiness Check ↔ PrepLab; verify Mock Interview vs Speak/Exam. [task #26]

**Destructive — needs user confirm:**
5. Cut AIPM PRD Simulator + Roadmap Prioritizer; retire AIPM surface. [task #23]

**Absorb/rehome (medium):**
6. AIPM Launch Checklist → Production/Eval; AI-or-Not → Foundations; Stakeholder Explainer → Fluency. [task #23]
7. Reconcile 3 MCP homes (Agent Lab concept ↔ Code Labs code; retire Systems `mcp`). [task #25]

**Fortify (content lift):**
8. Promote + fortify Project Labs (flagship). [task #24]
9. Fortify Agent Lab Framework Landscape. [task #26]

## 5 highest-impact moves
1. Reconcile company content 3→1. 2. Retire AIPM, salvage 3 modes. 3. Promote+fortify Project Labs. 4. Finish widget/MCP dedupe. 5. Tighten Fluency internally.

---

## Decision status log
| Date | Decision | Status |
|---|---|---|
| 2026-07-03 | Full content-merit audit (this doc) | recorded; execution pending user confirm on cuts |
