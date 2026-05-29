# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 27)*

---

## Theme: Concepts Gym — depth-first module upgrade

All 15 modules have basic interactivity. Three need a real upgrade to be genuinely excellent:
- `flashattn` — has VRAM calculator but no animated tile traversal showing HBM vs SRAM
- `rag-pipeline` — only shows happy path; needs a failure injection mode
- `tempgame` — matching game is fine but no live softmax distribution visualizer

After those three, the Retrieval gym needs a new module: `eval-loop` (how do you measure whether RAG is working?). Sprint target: 3 upgrades + 1 new module.

---

## Do this (in order)

**1. FlashAttention — animated tile traversal** `M effort` `HIGH`
The current module is a VRAM calculator + static tiling grid. It's correct but passive. Add a "How it works" tab with an animated tile-by-tile walkthrough: tiles light up on the grid one by one, a sidebar shows what's in SRAM vs what would have been in HBM for standard attention, and a counter shows HBM writes: standard=n² vs flash=n. Step-through button + auto-play mode.
File: `src/Concepts.jsx` — `FlashAttentionConcept` function (currently at ~line 4467). Add a second tab `[{ id: "calc", label: "VRAM Calculator" }, { id: "anim", label: "How It Works" }]`. The animation tab shows an 8×8 tile grid where tiles highlight in reading order, with a running counter of HBM memory writes vs standard attention.

**2. RAG Pipeline — failure injection mode** `M effort` `HIGH`
Currently the module walks through query→retrieve→augment→generate as a happy path. It needs a "What breaks" tab showing 3 failure scenarios: (a) stale retrieval (old doc retrieved), (b) low-relevance chunks (top-k too high, noise chunks injected), (c) hallucination despite context (model ignores retrieved content). Each failure shows the pipeline diverging at the failure point with a highlighted error + root cause + fix.
File: `src/Concepts.jsx` — `RAGPipelineModule` function (~line 2139). Add a second tab `[{ id: "flow", label: "How RAG Works" }, { id: "breaks", label: "What Breaks" }]`. The "What Breaks" tab has 3 failure cards, each showing the pipeline with the broken stage highlighted red, a symptom description, root cause, and fix.

**3. Temperature — live logit distribution** `S effort` `MEDIUM`
The temperature game (matching game) is good. But add a second tab: a live logit reshaper. Show 8 fixed logits for a token distribution, add a temperature slider (0.1→2.0), and show the softmax output updating in real time as a bar chart. The point: watch a near-certain distribution (99% probability on token A) flatten to 50/50 as temperature rises to 1.5. Label the sweet spots (0.2 = factual, 0.7 = balanced, 1.2+ = chaotic).
File: `src/Concepts.jsx` — `TemperatureGame` function (~line 4328). Add a tab row `[{ id: "game", label: "Match the Output" }, { id: "live", label: "Live Logit Shaper" }]`.

---

## Pending from last session (still valid)

**RAG Lab — Done Card prominence fix** `S effort` `CRITICAL`
The ✓ done card (PrepLab + GT post forward pointer) sits below the fold after a scenario completes. Move it up to render immediately below the failure diagnosis block. No logic changes — pure JSX reorder.
File: `src/App.jsx` — RAG Lab scenario result view. Find `synthesis_close` render block, move done card before detail/config recap.

**Concepts Gym — inline progress + "next module" CTA** `S-M effort` `MEDIUM`
In `GymRoomView`, add a progress summary bar at top (N/total done) and a "Continue: [next module] →" CTA detecting first incomplete module.
File: `src/Concepts.jsx` — `GymRoomView` component (~line 5254).

**PrepLab — Keyboard shortcuts** `S effort` `LOW-MEDIUM`
1/2/3/4 to select MCQ answer, Enter to confirm/advance. ExamMode and TrainerMode.
File: `src/PrepLab.jsx`.

---

## Do NOT touch this session

- Interview Strategy Tool — L effort, needs its own session
- GT Series + Tags redesign — M-L effort
- React.lazy() code splitting — systematic architectural change
- Career + AIPM consolidation — M-L effort
- New GT posts — wrong session type

---

## End of session checklist

- [ ] Brace check on all modified files (diff must be 0)
- [ ] Commit with descriptive message
- [ ] Update CLAUDE.md sprint log
- [ ] Update this file — move done items out, add anything new
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
