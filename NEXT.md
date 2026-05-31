# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 30, field intelligence logged: 4 posts)*

---

## Theme: Polish + Content depth

Sprint 30 shipped 4 structural items (done card prominence, gym progress, keyboard shortcuts, EvalLoopModule). Next priority: surface the insight at module endings, add production grounding to failure cards, and close the 3 thin GT stubs.

---

## Do this (in order)

**1. "Your Interview Story" block on RAG Lab + Agent Lab done cards** `S effort` `HIGH`
At the ✓ done card (forward pointer), add a collapsible "Your Interview Story" block that packages the scenario into a 3-line narrative: "I diagnosed [failure mode] → root cause [X] → fix [Y] → in production this maps to [Z]." The variables are already on the card — this is a copywriting/framing addition, no new logic.
File: `src/App.jsx` — RAG Lab forward pointer card. `src/Agents.jsx` — Agent Lab done screen cards.
Source: sprint 25 analysis, Audit 40 finding.

**2. "Maps to production" callout on RAG Lab root-cause cards** `S effort` `HIGH`
Each RAG Lab scenario root-cause card ends at the abstract failure mode. Add one `productionNote` per scenario: "In production this is: [AWS service / OSS tool]." E.g. Missing Answer scenario → "Bedrock Knowledge Base / OpenSearch + CloudWatch". No new logic — add `productionNote` field to each scenario in `ragScenarios.js` (or inline in `App.jsx` as a lookup constant), render as a small amber chip below the System Design Lesson block.
File: `src/App.jsx` — add `PRODUCTION_NOTES` constant keyed by `scenario_id`. Render below `system_design_lesson` block in evaluated state.
Source: sprint 25 analysis.

**3. RAG Lab static corpus — data realism v1** `S-M effort` `MEDIUM`
JSON array of 20–30 doc objects (title, content, metadata) across 2 domains (e-commerce product catalog, technical documentation). Pre-computed similarity scores per scenario config. Render actual retrieved chunk previews in the "Retrieved Evidence" panel instead of abstract chunk labels. User reads the actual text — not just "Chunk 3 — score 0.81."
File: new `src/ragCorpus.js` (data), `src/App.jsx` (render in `ChunkCard` component — replace placeholder text with real corpus text keyed by chunk id).
See DECISIONS.md Section 7 + IDEAS.md "Datamart-backed realism" cluster.

**4. Thin GT posts expansion — 3 stubs** `S-M effort` `MEDIUM`
Three posts are stubs (under 6 blocks): `dpo-in-practice`, `llm-observability`, `instruction-tuning-datasets`. Each needs: minimum 8 blocks, 1 callout, 1 refs block. Each should read at "knowledgeable colleague" depth — not a survey, a specific production insight.
File: `src/groundTruthPosts.js` — expand each post object.

---

## Pending (valid but lower priority)

- Graph RAG + multi-hop retrieval — GT post + PrepLab questions (3–4). Senior AI Engineer interview signal (May 2026). Tier 1 in IDEAS.md. See "Graph RAG + multi-hop retrieval" cluster.
- LangGraph reducers + HITL patterns — GT post ("When to Pause an Agent") + PrepLab questions. Tier 1 in IDEAS.md.
- Bi-encoder vs cross-encoder two-stage retrieval — GT post + PrepLab questions + Query Refinement module extension. Tier 1 in IDEAS.md.
- Interview Strategy Tool consolidation — L effort, needs its own session
- GT Series + Tags redesign — M-L effort
- React.lazy() code splitting — systematic architectural change
- Pyodide execution for Eval Lab — Tier 2, only after static corpus ships (DECISIONS.md Section 7)
- Concepts module: "Sequential vs Parallel — The Architecture Transition" (RNN→Transformer arc)
- Concepts module: "The Training Signal — Entropy, Loss, and KL Divergence"
- PrepLab Company Tracks — company-specific architecture lens on failure modes

---

## Do NOT touch this session

- Stripe + auth — not yet
- Marimo in-browser execution — wrong tool (see DECISIONS.md Section 7)
- New GT posts in bulk — only the 3 stubs from item 4
- PAL codebase — separate product

---

## End of session checklist

- [ ] Brace check on all modified files (diff must be 0)
- [ ] Commit with descriptive message
- [ ] Update CLAUDE.md sprint log
- [ ] Update this file — move done items out, add anything new
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
