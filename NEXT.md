# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 33 — Graph RAG shipped)*

---

## Theme: Content gaps — remaining Tier 1 items.

Graph RAG done. Next highest-value Tier 1 gap: LangGraph reducers + HITL patterns (Senior AI interview Round 2 signal, completely absent).

---

## Do this (in order)

**1. ~~Cold-start Home rewrite~~** — DONE (`d8c2d11`). Market signal chip, PrepLab question card primary CTA, belief-gap subtext, outcome-first door card copy.

**2. ~~Graph RAG + multi-hop retrieval~~** — DONE (`2a00754`). GT post + `GraphRAGModule` (interactive SVG knowledge graph, 6-step animated traversal, failure comparison, when-to-use table) + 4 PrepLab questions with trap fields.

**3. LangGraph reducers + HITL patterns** `M effort` `HIGH`

What: Senior AI interview Round 2 signal. LangGraph-specific state model (reducers/nodes/edges) and human-in-the-loop checkpoint patterns completely absent from GAL.

Implementation:
- 1 GT post: "LangGraph reducers and HITL: state machines for agentic workflows" (reducer functions, StateGraph, HITL checkpoint patterns, when graph-based orchestration beats custom loops)
- 3–4 PrepLab questions covering reducer composition, HITL interrupt patterns, failure modes
- Optional: extend Agent Lab with a LangGraph state machine tab

---

## Pending (valid but lower priority)

### PrepLab revamp — remaining sprints (from PREPLAB_SPEC.md)
- ~~**PrepLab Sprint A**~~ — DONE (`43e4a92`). Naming + visual layer: sidebar 6→3 modes, score badges, QuestionCard difficulty accent, MCQOptions hover, ExamConfig copy, TrainerMode topic tiles.
- ~~**PrepLab Sprint B**~~ — DONE (`73924a0`). Extracted PREP_QUESTIONS to `src/data/preplabQuestions.js`. All 261 questions have `difficulty` field. PrepLab.jsx 5079→2446 lines.
- ~~**PrepLab Sprint C**~~ — DONE (`38d5330`). `trap` + `source` fields on 50 hardest questions. `src/shared.jsx` created with `CommonTrapCallout`. RevealCard renders amber callout + source attribution.
- ~~**PrepLab Sprint D**~~ — DONE (`22cd963`). Assess results screen rebuild: per-topic bars worst-first, TOPIC_FORWARD_POINTERS gap chips, session comparison delta, free-user gate at Q11. `src/config/gating.js` created.
- ~~**TrainerMode Browse/List View**~~ — DONE (`eb84135`). Drill|Browse toggle, accordion expand with MCQ correct highlighting, trap callout, "Drill this topic →" chip.
- ~~**PrepLab Sprint E**~~ — DONE (`a5af787`). InterviewPrepMode rebuilt as 4-step Interview Brief: JD+company → Role+Round+Context → Rate Topics → Interview Brief output (gated). `generateBrief()` + `copyBrief()`. Removed inline drill.
- ~~**Cold-start Home rewrite**~~ — DONE (`d8c2d11`). Market signal chip, PrepLab question card primary CTA, belief-gap subtext, outcome-first door card copy.

### Content depth + production grounding (was Sprint 31 — demoted to Pending)
- **"Your Interview Story" block on RAG Lab + Agent Lab done cards** — collapsible block at forward pointer card. `S effort`.
- **"Maps to production" callout on RAG Lab root-cause cards** — `PRODUCTION_NOTES` constant + amber chip below `system_design_lesson` block in `src/App.jsx`. `S effort`.
- **RAG Lab static corpus — data realism v1** — `src/ragCorpus.js` (20–30 docs, two domains) + ChunkCard renders real text. `S-M effort`. See DECISIONS.md Section 7.
- **Thin GT posts expansion — 3 stubs** — `dpo-in-practice`, `llm-observability`, `instruction-tuning-datasets` each need 8+ blocks. `S-M effort`.

### New content gaps (Tier 1 in IDEAS.md)
- **Graph RAG + multi-hop retrieval** — GT post + PrepLab questions (3–4). Completely absent from GAL.
- **LangGraph reducers + HITL patterns** — GT post + PrepLab questions (3–4). Senior AI interview Round 2 signal.
- **Bi-encoder vs cross-encoder two-stage retrieval** — GT post + PrepLab questions + Query Refinement extension.

### Architecture / polish
- **Cold-start Home rewrite** — market signal first (agentic +280% YoY), PrepLab CTA for cold visitors, question preview with interview framing. See UPGRADES.md Hero Copy entry + DECISIONS.md Section 9.
- **GT Series + Tags redesign** — Deep Dives IA. M-L effort.
- **React.lazy() code splitting** — systematic change. DECISIONS.md-worthy scope.
- **Pyodide execution for Eval Lab** — Tier 2, after static corpus ships.
- **Concepts module: "Sequential vs Parallel"** — RNN→LSTM→Transformer arc.
- **Concepts module: "The Training Signal"** — entropy/loss/KL framing.
- **Visual polish backlog** — consistent module headers, Explore module cards.
- **Modularisation pass** — `src/config/nav.js` (unblocked by Sprint D, `gating.js` done).

---

## Do NOT touch this session

- Stripe + auth — not yet. See DECISIONS.md Section 0.
- New GT posts (not in Pending list above) — no bulk additions.
- Graph RAG module build — Pending only.
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
