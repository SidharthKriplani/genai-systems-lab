# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 36 — social proof + Maps to Production + GT Series shipped)*

---

## Theme: Sprint 36 shipped. Next: PostHog distribution check before next build sprint.

Graph RAG (sprint 33), LangGraph (sprint 34), and two-stage retrieval (sprint 35) are all done. All three Tier 1 content gaps from the Senior AI Engineer interview signal are now closed. PrepLab revamp (sprints A–E) is complete. CompanyTracks fully revamped. The product is now at a content and UX completeness level where the limiting factor is distribution proof, not more features.

Before the next major build sprint: check PostHog for WAU and module completion funnel (DECISIONS.md Section 0c rule). If data is available, it should inform the next build direction.

---

## Do this (in order)

**1. ~~Cold-start Home rewrite~~** — DONE (`d8c2d11`).

**2. ~~Graph RAG + multi-hop retrieval~~** — DONE (`2a00754`).

**3. ~~LangGraph reducers + HITL patterns~~** — DONE (`cfd4520`).

**4. ~~Bi-encoder vs cross-encoder two-stage retrieval~~** — DONE (`74160e7`). GT post + QueryRefinementLab Two-Stage tab (bi-encoder vs cross-encoder side-by-side, rank-change arrows, failure modes) + 4 PrepLab questions (2 hard, 2 medium, all with trap fields). Also included CompanyTracks revamp: bug fix, text question handling, topic weight viz, GT recs.

**4b. ~~Sprint 36 — Social proof + Maps to Production + GT Series~~** — DONE (`2a8c0bc`). Feedback chip on Home footer. productionNote on all 6 RAG Lab scenarios. GT Series taxonomy: 16/17 series now populated with real written posts.

**5. PostHog distribution check** `S effort` `PREREQUISITE — do before next sprint`

Check before any new build: is PostHog receiving events in Vercel prod? WAU last 30 days? Top 5 modules by visit? RAG Lab scenario completion rate? PrepLab session depth? If data is unavailable or WAU is low, the next investment is sharing/distribution, not more content.

---

## Pending (valid but lower priority)

### PrepLab revamp — all sprints DONE
- ~~**PrepLab Sprint A**~~ — DONE (`43e4a92`).
- ~~**PrepLab Sprint B**~~ — DONE (`73924a0`).
- ~~**PrepLab Sprint C**~~ — DONE (`38d5330`).
- ~~**PrepLab Sprint D**~~ — DONE (`22cd963`).
- ~~**TrainerMode Browse/List View**~~ — DONE (`eb84135`).
- ~~**PrepLab Sprint E**~~ — DONE (`a5af787`).
- ~~**Cold-start Home rewrite**~~ — DONE (`d8c2d11`).
- ~~**CompanyTracks revamp**~~ — DONE (`74160e7`). Bug fix + text Q handling + topic weight viz + GT recs.

### Content depth + production grounding
- **"Your Interview Story" block on RAG Lab + Agent Lab done cards** — `S effort`.
- ~~**"Maps to Production" callout on RAG Lab root-cause cards**~~ — DONE sprint 36 (`2a8c0bc`). All 6 RAG Lab scenarios have `productionNote` field.
- **RAG Lab static corpus — data realism v1** — `S-M effort`. See DECISIONS.md Section 7.
- **Thin GT posts expansion — 3 stubs** — `dpo-in-practice`, `llm-observability`, `instruction-tuning-datasets`. `S-M effort`.

### Architecture / polish
- ~~**GT Series + Tags redesign**~~ — DONE sprint 36 (`2a8c0bc`). 16/17 series populated; 2 new series added (LLM Fundamentals, Career & Strategy).
- **React.lazy() code splitting** — systematic change. DECISIONS.md-worthy scope.
- **Pyodide execution for Eval Lab** — Tier 2, after static corpus ships.
- **Concepts module: "Sequential vs Parallel"** — RNN→LSTM→Transformer arc.
- **Concepts module: "The Training Signal"** — entropy/loss/KL framing.
- **Visual polish backlog** — consistent module headers, Explore module cards.
- **Modularisation pass** — `src/config/nav.js` (unblocked by Sprint D, `gating.js` done).
- ~~**Testimonials/feedback — Phase 1**~~ — DONE sprint 36 (`2a8c0bc`). Tally.so feedback chip on Home footer. Phase 2 (Supabase + approval UI) deferred to Stripe sprint.
- **Interview Experiences section** — editorial-first 20–30 entries seeded from field intelligence log. Phase 2: crowd-sourced with LLM validation. See IDEAS.md.

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
