# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: June 2026 (sprint 49 complete — full structural redesign shipped, R1–R9 done)*

---

## Theme: Sprint 49 complete. Next: readiness/progress layer (PAL-style per-area tracking) + staffLayer content expansion + GT evaluation depth.

Sprint 49 closed: full challenge-layer redesign — 8-item nav, 5 hub pages, home rewrite, PrepLab judgment reframe, GT tagging (226 posts). See CLAUDE.md sprint log.

---

## Do this (in order) — Sprint 49 Redesign Batches

**~~R1 — Nav collapse~~** `S` DONE `3b0b870`
- `src/config/nav.js`: collapse to 8-item challenge-layer nav (Home, Retrieval, Evaluation, Agents, Production, Foundations, PrepLab, Ground Truth)
- `src/App.jsx`: add routing for `#retrieval`, `#evaluation`, `#agents-hub`, `#production`, `#foundations` — all old routes stay functional
- Brace check + commit: `feat: R1 — challenge-layer nav, 8 items`

**~~R2 — Home page rewrite~~** `M` DONE `66fa6b0`
- `src/Home.jsx`: full rewrite
- Cold visitor: promise hero ("The only place that trains production AI judgment") + market signal (agentic AI +280%, $190K avg) + 5 challenge area cards + single PrepLab question as primary CTA
- Returning visitor: compact progress snapshot + continue CTA + daily question + challenge area progress bars
- Brace check + commit: `feat: R2 — home rewrite, cold/returning visitor states`

**Execution model:** R1 and R2 alone (one each). R3 alone as template. R4–R7 together in one session (same pattern, fill-in-the-blank). R8, R9, R10 alone. = 7 sessions total.

**~~R3 — Retrieval hub page~~** `M` DONE `35fd2c7`
- New `src/Retrieval.jsx`
- Structure: challenge intro ("Why does my AI retrieve garbage?") → RAG Lab entry card → 3 concept cards → 3-4 GT posts → 3 inline PrepLab questions (topic: rag) → progress snapshot
- Wire in App.jsx routing (`#retrieval`)
- Commit: `feat: R3 — Retrieval hub page`

**~~R4–R7 — Evaluation, Agents, Production, Foundations hub pages~~** `M` DONE `e7a68bc`
- New `src/EvaluationHub.jsx`
- Same structure as R3, wired to Eval Lab, evaluation concepts, evaluation GT posts, evaluation PrepLab cluster
- Commit: `feat: R4 — Evaluation hub page`

**R5 — Agents hub page** `M`
- New `src/AgentsHub.jsx` (avoid name collision with existing `Agents.jsx`)
- Wired to Agent Lab, agent concepts, agents GT posts, agents PrepLab cluster
- Commit: `feat: R5 — Agents hub page`

**R6 — Production hub page** `M`
- New `src/ProductionHub.jsx`
- Wired to LLM Lab, production/llmops concepts, llmops GT posts, llmops PrepLab cluster
- Commit: `feat: R6 — Production hub page`

**R7 — Foundations hub page** `M`
- New `src/FoundationsHub.jsx`
- Two lab entries: FM Lab + Prompt Lab (sub-entries, not separate pages)
- Wired to foundation concepts, foundation GT posts, finetuning+safety PrepLab clusters
- Commit: `feat: R7 — Foundations hub page`

**~~R8 — PrepLab reframe~~** `S` DONE `4f0becc`
- `src/PrepLab.jsx`: copy throughout → "judgment" framing ("Test your production AI judgment" not "Assess yourself")
- Sidebar cluster labels aligned to challenge area names (Retrieval / Evaluation / Agents / Production / Foundations)
- Commit: `feat: R8 — PrepLab judgment reframe, challenge-aligned clusters`

**~~R9 — GT challenge area tagging~~** `M` DONE `40ba9c6` — retrieval:19 agents:28 eval:8 prod:44 foundations:81 general:46
- `src/groundTruthIndex.js`: add `challengeArea` field to all 226 posts
- Values: `"retrieval"` | `"evaluation"` | `"agents"` | `"production"` | `"foundations"` | `"general"`
- GT cards render challenge area chip
- Hub pages pull posts by `challengeArea` from index
- Commit: `feat: R9 — GT challenge area tagging, all 226 posts`

**~~R10 — Full MD sync + sprint close~~** `S` DONE — sprint 49 complete
- Challenge area accent colors (Retrieval: cyan, Evaluation: amber, Agents: violet, Production: green, Foundations: blue)
- Mobile layout pass on all 5 hub pages
- Consistent module header pattern across all labs
- Full MD sync: CLAUDE.md sprint log, NEXT.md, LINEAGE.md, REDESIGN.md status update
- Commit: `feat: R10 — visual polish` + `chore: MD sync sprint 49`

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

### Sprint 47 build queue (cross-lab intelligence — in priority order)

1. ~~**Bookmarks**~~ — DONE sprint 47 (`97c2057`). `gsl-bookmarks`, bookmark icon on GT cards, 🔖 Saved filter.
2. ~~**91-day heatmap**~~ — DONE sprint 47 (`97c2057`). Upgraded from 28→91 cells.
3. ~~**Spaced repetition**~~ — DONE sprint 47 (`97c2057`). `gsl-preplab-spaced`, SRS intervals, Review Due mode in PrepLab sidebar.
4. ~~**Sparse heatmap guard**~~ — DONE sprint 47 (`2bcbcec`).
5. ~~**"Do we even need it?" adversarial scenarios**~~ — DONE sprint 47 (`2bcbcec`). 6 questions (adversarial-1 through -6): RAG vs context window, vector DB vs SQL, agent vs webhook, rules vs ML routing, fine-tune vs prompt, rules vs RAG for compliance.
6. ~~**Timed exam lock (Combinator)**~~ — DONE sprint 48 (`f7af1f1`). Mock Exam Mode toggle, forward-only, red timer, MOCK badge.
7. ~~**Staff Layer**~~ — DONE sprint 48 (`f7af1f1`). 3-tier reveal, access-gated, 10 questions seeded. Expand staffLayer to more hard questions each sprint.
8. **Spot the Flaw** `M` — adversarial format on existing failure modes. See IDEAS.md.
9. ~~**CROSS_LAB.md**~~ — DONE sprint 48 (`a44fe49`). Lab boundaries + cross-pollination patterns documented.
10. **staffLayer further expansion** — 30 seeded, ~24 hard gated questions remain. Pure content, no code. See IDEAS.md.
11. **Cross-lab path GT post + Distribution** `XS` — write the GT post for the 6-week Systems Engineer path, then HN/LinkedIn. See IDEAS.md.

### ~~Failure mode completeness audit~~ DONE sprint 46 (`1dce7db`)

### Still open (S effort)
- ~~**6 new PrepLab questions**~~ — DONE sprint 46 (`bff96ac`). quantiphi-1 through quantiphi-6.
- ~~**Trap field quality pass**~~ — DONE sprint 46 (`bff96ac`). 10 trap fields rewritten across rag/agents/llmops/evaluation. Remaining ~85 thin traps in lower-traffic clusters (streaming, attention, context) — lower priority.
- ~~**Interview Signal Quantiphi entry**~~ — already done, id:38 confirmed present (`43545a7`).
- ~~**Tab keyboard shortcuts**~~ — DONE sprint 46 (`f7ce93a`). R/A/E/L/P/G/C live, shortcuts overlay updated.
- ~~**FidelityBadge dedup**~~ — DONE sprint 46 (`f7ce93a`). Moved to shared.jsx.
- **GT Series post taxonomy** — tag all 226 posts to SERIES_META series slugs. M effort, content work.

### Sprint 50 — Next priority queue

**Highest leverage (build first):**
1. **Readiness layer** `L` — per-challenge-area progress bars + readiness badges (Novice/Practitioner/Senior) surfaced on hub pages and home returning view. PAL's "Readiness by Room" is the pattern. Reads from existing localStorage keys.
2. **Guided paths** `M` — 3 curated sequences (Beginner Path, Retrieval Deep Dive, Interview Sprint). Each path sequences hub page → lab scenarios → concepts → PrepLab cluster. No new content needed — paths over existing content.
3. **staffLayer content expansion** `S` — 30 questions seeded, ~24 hard gated remain. Pure content, no code.
4. **Evaluation GT depth** — only 8 posts tagged `evaluation`. Eval is the #1 practitioner challenge (79%). Needs 4–6 new posts.

**Still open (deferred):**
- **React.lazy() code splitting** — systematic, DECISIONS.md scope.
- **Pyodide execution for Eval Lab** — Tier 2.
- **GT Series post taxonomy** — tag all 226 posts to SERIES_META slugs.

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
