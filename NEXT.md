# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 20)*

---

## Theme: Fix what's broken. Make existing content feel complete.

No new features. No new modules. Finish the remaining high-ROI gaps.

---

## Do this (in order)

**1. RAG Lab — Done Card prominence fix** `S effort` `CRITICAL`
The ✓ done card (forward pointer to PrepLab + GT post) is below the fold after a scenario completes. Users finish a scenario and leave without seeing it. The learn loop doesn't close.
File: `src/App.jsx` — the done card is rendered inside the RAG Lab scenario panel. Currently it sits after the failure diagnosis block at the bottom of a long scroll. The card itself exists and has content (GT post link + PrepLab CTA) — it just needs to move up and become impossible to miss.
Fix:
- In `App.jsx`, find the RAG Lab scenario result view (look for `synthesis_close` or the done card render block).
- Move the done card to render immediately below the failure diagnosis block, before any additional detail or config recap.
- Make it full-width (`w-full`), visually distinct (violet gradient border, ✓ badge prominent), with `mt-4 mb-6` spacing so it breaks the scroll naturally.
- No logic changes — pure JSX reorder + class adjustments.
- Brace check after. Diff must be 0.
See: UPGRADES.md → "RAG Lab — Done Card Prominence"

**2. Fidelity badges on Lab modules** `S effort` `HIGH`
ML Systems Lab ships `✓ Real execution` / `~ Simulated` on every module. Builds honest trust. Currently users have no signal about whether a simulator is running real logic or a pre-scripted scenario.
File: all 4 lab files — `src/App.jsx` (RAG Lab), `src/Agents.jsx` (Agent Lab), `src/systems/modules.jsx` (LLM Lab + Eval Lab modules).
Fix:
- Create a small `FidelityBadge` inline component (or just a reusable JSX snippet): 2 variants. Variant A: `✓ Scenario-accurate` in emerald (used where failure logic is derived from real config input — RAG Lab, `agentcfg`, `serving`, `decoding`). Variant B: `~ Simulated` in zinc/amber (used where scenarios are pre-scripted — most Agent Lab modules, Eval Lab reference modules).
- Place the badge in the module header area, to the right of the module title, consistent position across all labs.
- Apply: RAG Lab scenarios → Variant A. Agent Lab: `agentcfg`, `simulator`, `design` → Variant A; all others → Variant B. LLM Lab: `serving`, `decoding`, `inference` → Variant A; `streaming`, `specdecoding`, `reasoning`, `kvcache`, `moe`, `quantization` → Variant B. Eval Lab: `evals`, `mlcicd`, `prompt-change-mgmt`, `router` → Variant A; all others → Variant B.
- Brace check each modified file. Diff must be 0.
See: IDEAS.md → "Cross-product patterns" → Fidelity badges

**3. PrepLab — Keyboard shortcuts** `S effort` `LOW-MEDIUM`
Every MCQ answer requires a mouse click. 1/2/3/4 to select + Enter to confirm is standard for any quiz tool. Power users on a study loop notice the friction immediately.
File: `src/PrepLab.jsx` — ExamMode and TrainerMode components.
Fix:
- In ExamMode: add a `useEffect` with a `keydown` listener. Keys 1/2/3/4 map to answer index 0/1/2/3 — call the existing `selectAnswer(index)` handler. Enter key calls the existing `submitAnswer()` or `next()` handler depending on state. Clean up the listener on unmount (`return () => window.removeEventListener(...)`).
- In TrainerMode: same pattern — 1/2/3/4 to select, Enter to confirm/advance. TrainerMode already has `handleAnswer(option)` — wire keys to call it.
- Do NOT add keyboard shortcuts to InterviewPrepMode (free-text self-grade — no MCQ to wire to) or WeaknessHeatmapMode.
- The `useEffect` import is already at the top of PrepLab.jsx — no new imports needed.
- Brace check after. Diff must be 0.
See: UPGRADES.md → "PrepLab.jsx — Keyboard Shortcuts"

**4. Concepts — inline callouts + synthesis close** `M effort` `MEDIUM`
Sprint 14 added Beat 1 (setup framing text) to all 15 Concepts modules. Beats 2 and 3 are missing: no inline callout fires during the key interaction moment, and no synthesis close card appears when the module ends. The 3-beat standard applied to all 4 labs in sprint 18 is incomplete for Concepts.
File: `src/Concepts.jsx` — all 15 module components (Tokenizer, Embeddings, ContextWindow, Attention, Transformer, NextToken, Temperature, FlashAttention, PositionalEncoding, KVCache, RLHF, RAGConcept, AgentLoop, EvalConcepts, PromptDesign or equivalent — check the actual module IDs in the GYMS constant).
Fix:
- Beat 2 (inline callout): for each module, identify the 1–2 highest-signal interaction moments. Examples: Tokenizer → when the user types and sees token count spike; Temperature → when slider crosses above 1.2 (incoherence zone) or below 0.1 (repetition zone); ContextWindow → when tokens exceed the limit. At that moment, surface a small amber or red callout: `{ t: "callout" }` style block explaining what just happened and why it matters in production. Condition it on the relevant state value.
- Beat 3 (synthesis close): after the user has interacted (e.g. completed a flashcard set, reached the end of a walkthrough, triggered the main interaction at least once), render a ✓ done card at the bottom. Pattern from RAG Lab: violet gradient border, ✓ badge, one-sentence named lesson ("You just saw how temperature controls the probability distribution — not just creativity"), one forward pointer to a GT post or lab module. The `MODULE_NEXT_STEP` lookup in Concepts.jsx already maps 13 module IDs to forward pointers — use it.
- Check each of the 15 modules individually. Some may already have partial Beat 2 logic (e.g. Temperature slider callout exists). Don't duplicate — just fill the gap.
- Brace check after each file edit. Diff must be 0.
See: UPGRADES.md → "Concepts — Inline Callouts + Synthesis Close"

**5. GT thin post expansion** `S-M effort` `MEDIUM`
Three GT posts are under the 8-block quality bar and feel like stubs next to the rest of the corpus. Flagged in Audit 17 and Audit 27. Dilutes corpus quality perception.
Posts: `dpo-in-practice` (4 blocks), `llm-observability` (5 blocks), `instruction-tuning-datasets` (5 blocks).
File: `src/groundTruthPosts.js` — find each post by ID and expand its content array.
Fix per post:
- `dpo-in-practice`: currently 4 blocks. Add: a concrete before/after example showing a DPO preference pair, a failure mode block (what happens when preference data is noisy or contradictory), a production callout block (when to use DPO vs RLHF vs SFT-only), and a `refs` block with 2–3 real papers/implementations. Target: 8–10 blocks.
- `llm-observability`: currently 5 blocks. Add: a real trace example (what a bad trace looks like vs a good one), a failure mode block (silent degradation — model answers change without any error signal), a tooling comparison block (LangSmith vs Arize vs custom logging), and a `refs` block. Target: 8–10 blocks.
- `instruction-tuning-datasets`: currently 5 blocks. Add: a dataset quality checklist block (what makes an instruction-response pair good vs bad), a failure mode block (instruction following collapse from low-quality data), a concrete dataset comparison (FLAN vs Alpaca vs ShareGPT vs synthetic), and a `refs` block. Target: 8–10 blocks.
- Check `groundTruthIndex.js` after to confirm these 3 posts have `related[]` arrays and `labLink` set. If not, add them.
- No brace check needed (groundTruthPosts.js is a data file, not JSX) — but run a quick `node -e "require('./src/groundTruthPosts.js')"` in the project root to confirm no syntax errors.
See: CLAUDE.md → Known open issues; AUDITS.md → Audit 17 finding 5

---

## If time allows (pick one)

**Streak + 4-week activity heatmap in returning user HomeTab** `S-M effort`
ReturningHomeView (sprint 16) shows progress stats but no streak or activity grid. Add `gsl-streak` + `gsl-last-visit` + `gsl-activity-YYYY-MM-DD` localStorage keys, increment on any lab visit or PrepLab attempt. 4×7 grid in the Today section.
File: `src/Home.jsx` — `ReturningHomeView` component and `getActivityData()` helper.
Fix: on every tab navigation (`navigate()` in App.jsx), write today's date key to localStorage (`gsl-activity-YYYY-MM-DD = 1`). In `getActivityData()`, read the last 28 day-keys and return a boolean array. In `ReturningHomeView`, render a 4-row × 7-col grid in the Today section: filled cell = green-500/30, empty = zinc-800, today = ring. Streak = count of consecutive days ending today from the activity array.
See: UPGRADES.md → "Home.jsx — Streak + Activity Heatmap"

---

## Do NOT touch this session

- Interview Strategy Tool — L effort, needs its own session
- GT Series + Tags redesign — M-L effort, content taxonomy work needed first
- React.lazy() code splitting — systematic architectural change, separate session
- New modules / GT posts — content work, wrong session type
- Career + AIPM consolidation — M-L effort, separate session

---

## End of session checklist

- [ ] Brace check on all modified files (diff must be 0)
- [ ] Commit with descriptive message
- [ ] Update CLAUDE.md sprint log
- [ ] Update this file — move done items out, add anything new that came up
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
