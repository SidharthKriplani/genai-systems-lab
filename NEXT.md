# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 30, PrepLab revamp spec session)*

---

## Theme: PrepLab revamp — Sprint A (naming + visual layer)

PrepLab is the cold-start entry point (DECISIONS.md Section 9). The spec (PREPLAB_SPEC.md) defines the full revamp across 5 sprints. Sprint A is pure visual and naming — no logic changes, no data changes, ships value immediately, unblocks Sprints B–E. A cold visitor should open PrepLab after Sprint A and know which mode to open within 5 seconds.

---

## Do this (in order)

**1. Rename modes in PREPLAB_SIDEBAR + hide Defense Doc / Weakness Map** `S effort` `HIGH`

What: Update the `PREPLAB_SIDEBAR` constant in `src/PrepLab.jsx`. Three entries survive, two are hidden (not deleted — their components stay in the file for Sprint E).

Target sidebar:
```
Assess         EXAM
Interview Strategy  STRATEGY
Company Tracks  ARCHETYPE
```

Changes:
- `id: "exam"` → label: `"Assess"`, tag: `"EXAM"`, desc: `"Test yourself cold. Leave knowing your gaps."`
- `id: "interview-prep"` → label: `"Interview Strategy"`, tag: `"STRATEGY"`, desc: `"JD → gap score → day-by-day plan."`
- `id: "heatmap"` → remove from PREPLAB_SIDEBAR array (keep `WeaknessHeatmapMode` component)
- `id: "defense"` → remove from PREPLAB_SIDEBAR array (keep `DefenseDocMode` component)
- `id: "archetype"` (Company Tracks) — keep, no label change

Source: PREPLAB_SPEC.md Section 3.

---

**2. Sidebar score badges for returning users** `S effort` `HIGH`

What: Below each mode label in the sidebar, a 1-line stat for returning users sourced from localStorage. Invisible on first visit (no localStorage entry = render nothing).

Logic per mode:
- Assess: read `gsl-preplab-history`. If entries exist, compute last session's overall % and date. Render: `"Last: {pct}% · {N}d ago"` in `text-zinc-500 text-xs`.
- Interview Strategy: read `gsl-preplab-strategy-phase` from localStorage. If > 1, render: `"In progress: Phase {N}"`.
- Company Tracks: read `gsl-preplab-archetype-{trackId}` from localStorage. If any track started, render: `"{trackName}: {done}/{total}"`.

Render as a `<p className="text-zinc-500 text-xs mt-0.5">` below the mode label inside the sidebar button. Conditional: only render if the data exists. No new state required.

Source: PREPLAB_SPEC.md Section 4.

---

**3. Question card visual upgrade** `S effort` `HIGH`

What: The question card (rendered in `ExamMode`, `TrainerMode`, and wherever questions are shown) needs a difficulty accent, better option hover states, and an elevated Submit button. This is the highest-impact visual change — users interact with this on every question.

Changes in `src/PrepLab.jsx` (the question render block, wherever `q.question` and `q.options` are mapped):

- **Left border accent:** wrap question card in a container with `border-l-4` — color keyed by `q.difficulty`: `easy` → `border-blue-500`, `medium` → `border-amber-500`, `hard` → `border-red-500`. Fall back to `border-zinc-700` if `q.difficulty` not yet present (Sprint B adds it to all questions).
- **Difficulty chip:** above the question text, add `<span>` with difficulty label. Styles: hard → `bg-red-950/50 text-red-400 border border-red-800/40`, medium → `bg-amber-950/50 text-amber-400 border border-amber-800/40`, easy → `bg-blue-950/50 text-blue-400 border border-blue-800/40`. Add `text-xs px-2 py-0.5 rounded` to all.
- **Answer options:** increase `py` from whatever it is to `py-3 px-4`. Hover state: `hover:border-violet-500/60 hover:bg-violet-950/20`. Selected state: `border-violet-500 bg-violet-950/30`. These replace the current plain border toggle.
- **Submit button:** `bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-lg font-medium` — not a flat outlined button.

Source: PREPLAB_SPEC.md Section 4.

---

**4. Topic selector: replace 22 pills with 5 category tiles** `S effort` `MEDIUM`

What: The `TrainerMode` topic selector is a 22-pill horizontal overflow strip. Replace with 5 topic tiles in a grid. "All Topics" is the default state (no tile selected = all active). Multi-select allowed.

The 5 tiles (keyed to existing topic strings):
```
RAG & Retrieval     → topics: ["rag", "retrieval", "chunking", "embeddings", "reranking", "caching", "context-window"]
Agents & Systems    → topics: ["agents", "agent-memory", "orchestration", "tool-use", "multi-agent"]
Evals & Metrics     → topics: ["evaluation", "metrics", "ragas", "alignment"]
LLM Fundamentals    → topics: ["transformers", "attention", "tokenization", "pretraining", "fine-tuning", "rlhf", "decoding", "reasoning"]
Production & Serving → topics: ["serving", "inference", "deployment", "observability", "safety", "behavioral"]
```

Each tile: topic group title, question count (count questions where `q.topic` matches any of the group's topics), 2-line description, `hover:border-violet-500/40` lift. Grid: `grid grid-cols-2 gap-2 sm:grid-cols-3` or adjust to fit. Selected tile: `border-violet-500 bg-violet-950/20`.

When tile(s) selected: filter questions to matching topics. "All" is restored by deselecting all tiles (not a separate button needed — just make deselect re-enable all).

Source: PREPLAB_SPEC.md Section 4.

---

**5. Assess config screen copy** `S effort` `MEDIUM`

What: The `ExamMode` config screen (the screen before the exam starts) uses "Configure Exam" as a heading and generic selectors. Reframe to create the "I'm about to be assessed on something real" feeling.

Changes in `src/PrepLab.jsx` `ExamMode` config state render:

- **Headline:** change from `"Configure Exam"` (or equivalent) to `"How interview-ready are you?"`
- **Subtext:** below headline, add: `"20 production-level questions. No hints. See exactly where you stand."` in `text-zinc-400 text-sm`.
- **Duration selector labels:** append question counts — e.g. `"15 min (10 questions)"`, `"30 min (20 questions)"`, `"60 min (40 questions)"`.
- **CTA button:** change from `"Start Exam →"` (or equivalent) to `"Start Assessment →"`.
- **Results preview:** below the config selectors and above the CTA, add a 2-line callout block (`bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-400`): `"After the assessment, you'll see your score by topic, your weakest areas, and the exact Lab modules and GT posts that address each gap."`

Source: PREPLAB_SPEC.md Section 3 (Assess mode entry screen) + Section 5 (cold visitor journey).

---

## Pending (valid but lower priority)

### PrepLab revamp — remaining sprints (from PREPLAB_SPEC.md)
- **PrepLab Sprint B** — Extract QUESTIONS to `src/data/preplabQuestions.js` + add `difficulty` to all 261 questions. Wire to card accent + Hard Only filter. `S effort`.
- **PrepLab Sprint C** — `trap` field for top 50 hardest + `source` for ~30 questions + `<CommonTrapCallout>` component in `src/shared.jsx`. `M effort`.
- **PrepLab Sprint D** — Full Assess results screen rebuild: per-topic bars, gap forward pointers, session comparison, gate at Q11 with partial results visible. `M effort`.
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
