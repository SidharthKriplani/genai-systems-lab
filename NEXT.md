# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 31D — PrepLab Sprints A+B+C+D complete)*

---

## Theme: PrepLab — List View + Sprint E

Two items, in order. List View is S-M effort and unblocks the cramming use case immediately. Sprint E is L effort.

---

## Do this (in order)

**1. TrainerMode — Browse/List View** `S effort` `HIGH`

What: TrainerMode currently forces one-at-a-time card flow. Anyone who comes to cram (interview tomorrow, scanning for gaps) has no way to see all questions at once. Add a view toggle.

Implementation:
- Add `viewMode` state (`"drill"` | `"browse"`) to TrainerMode
- Add a toggle pill in the TrainerMode header: "Drill" | "Browse"
- Browse mode renders all filtered questions as a scrollable list
- Each row: left difficulty accent bar (red/amber/blue), truncated question text (~2 lines), topic chip, difficulty badge
- Clicking a row expands it as an accordion: full question text, MCQ options with correct answer highlighted green (or open answer keywords), explanation block, `CommonTrapCallout` if `q.trap`, source line if `q.source`
- Expanded rows have a "Drill this topic →" button that switches to drill mode with that topic group pre-filtered
- Keep existing groupFilter + diffFilter chips — they work the same in both modes

**2. PrepLab Sprint E — Interview Strategy full rebuild** `L effort` `HIGH`

What: `InterviewPrepMode` in `src/PrepLab.jsx` (mode: "jdprep") is the current 3-phase stub. Rebuild as a 5-step flow:

- Step 1: JD paste + company name (existing, keep)
- Step 2: Role type selector (ML Engineer / AI Engineer / AI PM / Research Scientist)
- Step 3: Round context — round number, interviewer type (hiring manager / tech lead / peer)
- Step 4: Prior round feedback — free text, parsed for keywords
- Step 5: Day plan output — "Your Interview Brief" as a structured day plan:
  - Top 3 topics to focus on (from gap detection)
  - 2 questions likely to come up per topic (drawn from PREP_QUESTIONS matching topic + difficulty)
  - Trap to avoid per topic (from `trap` field on hard questions)
  - 3 GT posts to skim
  - A "Defense Doc absorption" section if a Defense Doc was previously built (check localStorage)
  - Download button: renders brief as copyable markdown

Implementation notes:
- Gating: Phase 4 (the brief itself) behind `isAccessGranted()` with GateModal
- Reuse `TOPIC_STUDY_RESOURCES` (already in PrepLab.jsx) for GT post links
- `TOPIC_FORWARD_POINTERS` (added in Sprint D) for Lab forward links
- Store progress in `gsl-preplab-strategy-phase` (already exists)

---

## Pending (valid but lower priority)

### PrepLab revamp — remaining sprints (from PREPLAB_SPEC.md)
- ~~**PrepLab Sprint A**~~ — DONE (`43e4a92`). Naming + visual layer: sidebar 6→3 modes, score badges, QuestionCard difficulty accent, MCQOptions hover, ExamConfig copy, TrainerMode topic tiles.
- ~~**PrepLab Sprint B**~~ — DONE (`73924a0`). Extracted PREP_QUESTIONS to `src/data/preplabQuestions.js`. All 261 questions have `difficulty` field. PrepLab.jsx 5079→2446 lines.
- ~~**PrepLab Sprint C**~~ — DONE (`38d5330`). `trap` + `source` fields on 50 hardest questions. `src/shared.jsx` created with `CommonTrapCallout`. RevealCard renders amber callout + source attribution.
- ~~**PrepLab Sprint D**~~ — DONE (`22cd963`). Assess results screen rebuild: per-topic bars worst-first, TOPIC_FORWARD_POINTERS gap chips, session comparison delta, free-user gate at Q11. `src/config/gating.js` created.
- **TrainerMode Browse/List View** — See Do This #1 above.
- **PrepLab Sprint E** — Interview Strategy full rebuild. See Do This #2 above.

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
