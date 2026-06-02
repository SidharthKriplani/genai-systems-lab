# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: June 2026 (sprint 44 — codebase audit, stale MD corrections, Quantiphi signal logged)*

---

## Theme: Sprint 44 complete. Audit session — no code changes. PostHog check is still the gate.

Sprint 44 delivered: codebase audit vs. MD files — confirmed Home.jsx simplification done, GT thin posts expanded, GT reading mode live, Interview Experiences live, Explore split-panel live. GT Series SERIES_META UI confirmed done; post taxonomy (tagging to series) still pending. Quantiphi Defense Pack processed: 6 PrepLab questions + trap quality pass + Interview Signal entry logged to IDEAS.md + UPGRADES.md.

PostHog check (item 5 below) remains the gate before the next major content sprint.

---

## Do this (in order)

**1–4. ~~All prior sprints~~** — DONE. See CLAUDE.md session log.

**5. PostHog distribution check** `S effort` `PREREQUISITE — do before next sprint` ← **STILL THE GATE. 6 labs, 307 PrepLab questions now live. Check before building more.**

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

### Sprint 41 completions (batches A–B)
- ~~**7 new Concepts modules**~~ — DONE batch-A (`ed54c5a`). LLMAsJudge, EvalDesign, AgentToolDesign, CostLatency, Observability, FewShot, ChainOfThought.
- ~~**4 new active gyms**~~ — DONE batch-A. Evaluation, Production, Foundation Models, Prompt Engineering now active (not comingSoon).
- ~~**Prompt Engineering Lab (5th BUILD lab)**~~ — DONE batch-B (`b93535e`). 6 scenarios, PromptLab.jsx 560 lines, wired in App.jsx + nav.js, 4 PrepLab questions.
- ~~**Foundation Models Lab (6th BUILD lab)**~~ — DONE sprint 42 (`6cb2194`). 6 scenarios, FoundationModelsLab.jsx, wired in App.jsx + nav.js, 4 PrepLab questions.
- ~~**Paper theme system**~~ — DONE sprint 42 (`2884aa1`). Warm dark default + light mode + CSS vars + sun/moon toggle.
- ~~**Theme audit phase 2**~~ — DONE sprint 42 (`c859fe6`). All hardcoded #22D3EE → CSS vars across 5 files.
- ~~**Interview Signal PrepLab mode**~~ — DONE sprint 42 (`f33a123`). 22 experiences, filters, topic chart.
- ~~**Scenario-type questions**~~ — DONE sprint 42 (`246f73f`). ScenarioPlayer + 3 scenarios (RAG corpus, agent loop, eval rubric). 304 total PrepLab questions.

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
- **Visual polish backlog** — consistent module headers (ModuleHeader component).
- **Modularisation pass** — `src/config/nav.js` done; `labs.js` blocked by component coupling.
- **GT Series post taxonomy** — SERIES_META UI exists in GroundTruth.jsx; zero posts in groundTruthIndex.js have `series` field. Need to tag all 226 posts to their series. Content work, M effort.
- **6 new PrepLab questions** — MCP, Bedrock AgentCore, multi-provider LLM design, API failure handling, eval metric judgment, production prompt engineering. From Quantiphi Defense Pack signal. S effort.
- **Trap field quality pass** — rewrite thin trap fields using overclaim→honest-reframe format. 4 clusters × ~45 min each. See UPGRADES.md entry.
- **Interview Signal Quantiphi entry** — add consulting archetype entry to INTERVIEW_EXPERIENCES with probability map data from Defense Pack.
- **Tab keyboard shortcuts** — R/A/E/L/P/G/C single-key nav. No shortcut for tab switching exists yet (only Cmd+K for search). S effort.
- **FidelityBadge dedup** — still duplicated in App.jsx + Systems.jsx. XS effort.

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
