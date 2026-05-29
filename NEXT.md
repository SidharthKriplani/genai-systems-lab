# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 28)*

---

## Theme: Concepts Gym — continue depth pass + RAG Lab polish

Sprint 28 delivered 4 module upgrades (Temperature logit shaper, RAG failure tab, FlashAttn tile traversal, Embedding similarity search). The Concepts Gym is now materially interactive across all 15 modules. Next priority: Retrieval gym new module + RAG Lab polish.

---

## Do this (in order)

**1. RAG Lab — Done Card prominence fix** `S effort` `CRITICAL`
The ✓ done card (PrepLab + GT post forward pointer) sits below the fold after a scenario completes. Move it up to render immediately below the failure diagnosis block. No logic changes — pure JSX reorder.
File: `src/App.jsx` — RAG Lab scenario result view. Find `synthesis_close` render block, move done card before detail/config recap.

**2. Concepts Gym — inline progress + "next module" CTA** `S-M effort` `MEDIUM`
In `GymRoomView`, add a progress summary bar at top (N/total done) and a "Continue: [next module] →" CTA detecting first incomplete module.
File: `src/Concepts.jsx` — `GymRoomView` component.

**3. PrepLab — Keyboard shortcuts** `S effort` `LOW-MEDIUM`
1/2/3/4 to select MCQ answer, Enter to confirm/advance. ExamMode and TrainerMode.
File: `src/PrepLab.jsx`.

**4. Eval Loop — new Retrieval gym module** `M effort` `MEDIUM`
The Retrieval gym has RAG pipeline, embeddings, chunking but no eval coverage. Add `eval-loop` module: shows the 3-question eval loop (what did I retrieve? was it relevant? did the answer use it?), RAGAS metric walkthrough (faithfulness, answer relevance, context precision/recall), and a "Debug this eval run" scenario. This closes the gym with a production feedback loop concept.
File: `src/Concepts.jsx` — new function `EvalLoopModule`, add to MODULES array + update GYMS.

---

## Pending (valid but lower priority)

- Interview Strategy Tool consolidation — L effort, needs its own session
- GT Series + Tags redesign — M-L effort
- React.lazy() code splitting — systematic architectural change
- "Your Interview Story" collapsible block on done cards — S effort from sprint 25 analysis
- "Maps to production" callout on root-cause cards — S effort from sprint 25 analysis

---

## Do NOT touch this session

- Stripe + auth — not yet
- New GT posts in bulk — wrong session type
- PAL codebase — separate product

---

## End of session checklist

- [ ] Brace check on all modified files (diff must be 0)
- [ ] Commit with descriptive message
- [ ] Update CLAUDE.md sprint log
- [ ] Update this file — move done items out, add anything new
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
