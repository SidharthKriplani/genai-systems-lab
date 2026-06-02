# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: June 2026 (sprint 40 — batches A–I: architecture cleanup, shared components, streak heatmap, FeedbackBar, multi-select MCQ, trap expansion, AgentContextArchModule, GT quiz depth)*

---

## Theme: Sprint 40 complete. PostHog check is the gate before next sprint.

Batches A–I delivered: `src/config/nav.js` (ALL_TABS + GROUP_COLORS extracted); 4 shared components (ProductionNoteChip, ForwardPointerCard, WhatNextCard, FeedbackBar); streak + 4-week heatmap in ReturningHomeView; FeedbackBar wired to GT post end + PrepLab session end + Systems module footer; PrepLab multi-select MCQ type; 182 trap fields total (109 medium questions added); AgentContextArchModule (57th Systems module, 4 PrepLab questions); GT quiz depth expanded to 5-7 questions. Scale: 226 GT posts, 295 PrepLab questions, 20 Concepts modules, 57 Systems modules.

PostHog check (item 5 below) is still the gate before the next major content sprint.

---

## Do this (in order)

**1–4. ~~All prior sprints~~** — DONE. See CLAUDE.md session log.

**5. PostHog distribution check** `S effort` `PREREQUISITE — do before next sprint` ← **STILL THE GATE**

Check before any new build: is PostHog receiving events in Vercel prod? WAU last 30 days? Top 5 modules by visit? RAG Lab scenario completion rate? PrepLab session depth? If data is unavailable or WAU is low, the next investment is sharing/distribution, not more content.

---

## Pending (valid but lower priority)

### Content depth + production grounding
- ~~**"Your Interview Story" on RAG Lab done cards**~~ — DONE sprint 37 (`97360b7`).
- ~~**"Your Interview Story" on Agent Lab done screens**~~ — DONE batch-2 (`2c9e282`).
- ~~**"Maps to Production" on RAG Lab scenarios**~~ — DONE sprint 36 (`2a8c0bc`).
- ~~**"Maps to Production" on Agent Lab + LLM Lab**~~ — DONE batch-4 (`b253405`). All 8 Agent Lab failure matrix entries + 5 LLM Lab serving failures.
- ~~**RAG Lab static corpus — data realism v1**~~ — DONE sprint 38 (`9a985b5`).
- ~~**Thin GT posts expansion**~~ — `dpo-in-practice`, `llm-observability`, `instruction-tuning-datasets` were already fully expanded (17–21 blocks each). Verified and closed.

### Architecture / polish
- **React.lazy() code splitting** — systematic change. DECISIONS.md-worthy scope.
- **Pyodide execution for Eval Lab** — Tier 2, after static corpus engagement signal.
- **Visual polish backlog** — consistent module headers, Explore module cards.
- **Modularisation pass** — `src/config/nav.js` (unblocked by Sprint D, `gating.js` done).
- **Interview Experiences section** — editorial-first 20–30 entries seeded from field intelligence log.

### Concepts gym depth
- ~~**Concepts module: "Sequential vs Parallel"**~~ — DONE batch-10 (`caaadb5`).
- ~~**Concepts module: "The Training Signal"**~~ — DONE batch-10 (`caaadb5`).
- ~~**Concepts module: "Scaling Laws"**~~ — DONE batch-6 (`fd73d26`).
- ~~**Concepts module: "LoRA / QLoRA"**~~ — DONE batch-9 (`0915cb8`).
- ~~**EvalLoopModule Beat 2 + Beat 3**~~ — DONE batch-5 (`04c7a51`).

### Sprint 40 completions (batches A–I)
- ~~**`src/config/nav.js`**~~ — DONE batch-A (`992cfc4`). ALL_TABS + GROUP_COLORS extracted.
- ~~**ForwardPointerCard + WhatNextCard + ProductionNoteChip shared components**~~ — DONE batch-B (`2c57ff2`).
- ~~**Streak + 4-week heatmap in ReturningHomeView**~~ — DONE batch-C (`0d7371f`).
- ~~**FeedbackBar PostHog component**~~ — DONE batch-D (`0e5b3ab`). GT post end + PrepLab session end + Systems module footer.
- ~~**PrepLab multi-select MCQ (`type: "multi"`)**~~ — DONE batch-E (`9c7ba18`).
- ~~**PrepLab Common Trap expansion**~~ — DONE batch-F (`204138f`). 182 trap fields total across all medium + hard questions.
- ~~**Agent Context Architecture Systems module**~~ — DONE batch-G (`144618f`). 57th Systems module + 4 PrepLab questions.
- ~~**GT posts: Prompt Regression Testing + A/B Testing for AI**~~ — Already existed in groundTruthPosts.js. Verified.
- ~~**GT Quiz depth**~~ — DONE batch-I (`2fe2fe0`). generateQuiz expanded to 5-7 questions from 5 block types.

### Still open
- **React.lazy() code splitting** — systematic change. DECISIONS.md-worthy scope.
- **Pyodide execution for Eval Lab** — Tier 2, after static corpus engagement signal.
- **Visual polish backlog** — consistent module headers, Explore module cards.
- **Modularisation pass** — `src/config/nav.js` done; `labs.js` blocked by component coupling.
- **Interview Experiences section** — editorial-first 20–30 entries.
- **PrepLab scenario-type questions** — multi-turn conversational diagnosis format.
- **Role Readiness Score** — AI Engineer Readiness tiers from PrepLab performance.

---

## Do NOT touch this session

- Stripe + auth — not yet. See DECISIONS.md Section 0.
- New GT posts (not in Pending list above) — no bulk additions.
- PAL codebase — separate product, out of scope.
- TypeScript migration — never.
- Marimo — wrong tool (DECISIONS.md Section 7).

---

## End of session checklist

- [ ] Brace check on all modified files: `node -e "const fs=require('fs'); const c=fs.readFileSync('src/FILE.jsx','utf8'); let o=(c.match(/\{/g)||[]).length, cl=(c.match(/\}/g)||[]).length; console.log('diff:',o-cl)"` → must be 0
- [ ] Commit with descriptive message per file group
- [ ] Update CLAUDE.md sprint log entry (scale, commit hashes, what changed)
- [ ] Update this file — move done items to CLAUDE.md log, add anything new to Pending
- [ ] Update LINEAGE.md with new sprint row
- [ ] Update IDEAS.md — mark built items ✅, update header scale line
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
