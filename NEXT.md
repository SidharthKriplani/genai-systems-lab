# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 31C — PrepLab Sprints A+B+C complete)*

---

## Theme: PrepLab revamp — Sprint D (Assess results screen rebuild)

Sprints A, B, C shipped. Sprint D is the next unblocked item. The results screen after an Assess session currently shows a basic score summary. Sprint D rebuilds it into a per-topic breakdown with gap forward pointers and a partial-results gate at Q11.

---

## Do this (in order)

**1. Assess results screen — per-topic bars + gap pointers** `M effort` `HIGH`

What: After an Assess session ends, the results view (`ExamResults` component in `src/PrepLab.jsx`) shows total score only. Replace with:

- Score headline: `{pct}% · {correct}/{total}` in large text, difficulty badge (Strong / Developing / Needs Work at ≥70%, 50–69%, <50%)
- Per-topic accuracy bars: group results by `q.topic`, compute `correct/total` per topic, render as a bar chart (use div width %, no external lib). Sort worst-first. Topic label + score + bar.
- Gap forward pointer per weak topic: for each topic where pct < 60%, render a chip pointing to the relevant Lab module or GT post. Use a `TOPIC_FORWARD_POINTERS` constant keyed by topic string.
- Session comparison: if `gsl-preplab-history` has prior entries, show "vs last session" delta (+ or - pct) next to the score headline. Small `text-zinc-500 text-xs`.
- Copy results button (existing) — keep.

**2. Partial results gate at Q11** `M effort` `HIGH`

What: For non-gated (free) users, show results only through Q10. At Q11+, show a gate overlay over the results that reads: "You've answered {N} questions. Unlock full results →" with the GateModal trigger. Free users still complete the full exam — the gate is on the results view only, not the exam itself.

Implementation: in `ExamResults`, check `isAccessGranted()`. If false and `questions.length > 10`, render only the first 10 questions' per-topic data + blur/overlay on the rest with the gate CTA. Keep the score headline visible (don't hide the overall %).

**3. Create `src/config/gating.js`** `S effort` `MEDIUM`

What: Thin config file. Move `FREE_QUESTION_LIMIT` from `utils/accessCode.js` to `src/config/gating.js`. Re-export from `utils/accessCode.js` for backward compatibility. Add `RESULTS_FREE_LIMIT = 10` (questions shown in results before gate). Import in `PrepLab.jsx`.

Source: PREPLAB_SPEC.md Section 5 + DECISIONS.md Section 8 Rule 2.

---

## Pending (valid but lower priority)

### PrepLab revamp — remaining sprints (from PREPLAB_SPEC.md)
- ~~**PrepLab Sprint A**~~ — DONE (`43e4a92`). Naming + visual layer: sidebar 6→3 modes, score badges, QuestionCard difficulty accent, MCQOptions hover, ExamConfig copy, TrainerMode topic tiles.
- ~~**PrepLab Sprint B**~~ — DONE (`73924a0`). Extracted PREP_QUESTIONS to `src/data/preplabQuestions.js`. All 261 questions have `difficulty` field. PrepLab.jsx 5079→2446 lines.
- ~~**PrepLab Sprint C**~~ — DONE (`38d5330`). `trap` + `source` fields on 50 hardest questions. `src/shared.jsx` created with `CommonTrapCallout`. RevealCard renders amber callout + source attribution.
- **PrepLab Sprint D** — Full Assess results screen rebuild: per-topic bars, gap forward pointers, session comparison, gate at Q11 with partial results visible. `M effort`. See Do This above.
- **PrepLab Sprint E** — Interview Strategy full rebuild: resume input, round type, prior feedback, day plan, Defense Doc absorption as "Download Your Brief". `L effort`.

### Content depth + production grounding (was Sprint 31 — demoted to Pending)
- **"Your Interview Story" block on RAG Lab + Agent Lab done cards** — collapsible block at forward pointer card. `S effort`. See previous NEXT.md for full spec (commit content + file locations documented there).
- **"Maps to production" callout on RAG Lab root-cause cards** — `PRODUCTION_NOTES` constant + amber chip below `system_design_lesson` block in `src/App.jsx`. `S effort`. See previous NEXT.md for full spec.
- **RAG Lab static corpus — data realism v1** — `src/ragCorpus.js` (20–30 docs, two domains) + ChunkCard renders real text. `S-M effort`. See DECISIONS.md Section 7.
- **Thin GT posts expansion — 3 stubs** — `dpo-in-practice`, `llm-observability`, `instruction-tuning-datasets` each need 8+ blocks. `S-M effort`.

### New content gaps (Tier 1 in IDEAS.md)
- **Graph RAG + multi-hop retrieval** — GT post + PrepLab questions (3–4). Completely absent from GAL.
- **LangGraph reducers + HITL patterns** — GT post + PrepLab questions (3–4). Senior AI interview Round 2 signal.
- **Bi-encoder vs cross-encoder two-stage retrieval** — GT post + PrepLab questions + Query Refinement extension.

### Architecture / polish
- **Cold-start Home rewrite** — market signal first (agentic +280% YoY), PrepLab CTA for cold visitors, question preview with interview framing. See UPGRADES.md Hero Copy entry + DECISIONS.md Section 9.
- **Interview Strategy Tool consolidation** — now part of PrepLab Sprint E above.
- **GT Series + Tags redesign** — Deep Dives IA. M-L effort.
- **React.lazy() code splitting** — systematic change. DECISIONS.md-worthy scope.
- **Pyodide execution for Eval Lab** — Tier 2, after static corpus ships.
- **Concepts module: "Sequential vs Parallel"** — RNN→LSTM→Transformer arc.
- **Concepts module: "The Training Signal"** — entropy/loss/KL framing.
- **Visual polish backlog** — consistent module headers, Explore module cards.
- **Modularisation pass** — `src/config/gating.js` + `nav.js` (unblocked by Sprint D).

---

## Do NOT touch this session

- Stripe + auth — not yet. See DECISIONS.md Section 0.
- PrepLab Sprints B–E — Sprint A must ship and be verified first.
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
