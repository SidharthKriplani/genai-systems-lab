# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: June 2026 (sprint 39 — batches 2–10: Maps to Production, Concepts depth, Scaling Laws, Semantic Caching, LoRA, Seq/Parallel, Training Signal)*

---

## Theme: Sprint 39 content sprint complete. PostHog check still pending before next sprint.

Batches 2–10 delivered: Maps to Production chips on Agent Lab (all 8 failure modes) and LLM Lab serving failures; EvalLoopModule Beat 2+3; 5 new Concepts modules (ScalingLawsModule, LoRAModule, SequentialParallelModule, TrainingSignalModule, plus EvalLoop 3-beat completion); semantic caching GT post + PrepLab; scaling laws PrepLab; dense/sparse retrieval PrepLab. Scale: 226 GT posts, 287 PrepLab questions, 20 Concepts modules.

PostHog check (item 5 below) is still the gate before the next major content sprint.

---

## Do this (in order)

**1–4. ~~All prior sprints~~** — DONE. See CLAUDE.md session log.

**5. PostHog distribution check** `S effort` `PREREQUISITE — do before next sprint`

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

### Medium-priority content still open
- **Agent Context Architecture Systems module** — from ADK patterns cluster. Pending.
- **PrepLab: "Common Trap" layer expansion** — ~50 hard questions have trap fields; remaining ~100 medium questions still lack trap. Ongoing.
- **GT post: "Prompt Regression Testing"** — companion to "Your Prompt Is Code". Pending.
- **GT post: "Why Classic A/B Testing Breaks for AI"** — companion to A/B Testing module. Pending.

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
