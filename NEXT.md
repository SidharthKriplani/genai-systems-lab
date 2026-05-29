# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 21)*

---

## Theme: Fix broken loops. Tighten the shell. Surface progress.

No new modules. No new content. Make what exists work better.

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

**2. Sidebar — collapse sparse groups, remove dead space** `S effort` `HIGH`
PAL's sidebar is tight because it uses collapsible section groups with no padding waste. Ours has fixed-height nav groups that leave dead zones, especially GROW (3 entries) and KNOWLEDGE (2 entries).
File: `src/App.jsx` — nav sidebar component, `NAV_GROUPS` constant and sidebar rendering.
Fix:
- Add per-group collapse state (`useState` per group ID, default open). A chevron icon on each group header toggles it.
- When collapsed, the group header shows with a small item-count badge and nothing else — zero gap below.
- Tighten sidebar item `py` from whatever it currently is to `py-2` minimum. Group headers: `py-1.5 px-3`.
- Remove any hardcoded `min-height` or spacer divs between groups.
- Check on mobile too — the mobile bottom nav bar should not be affected by this change.
- Brace check after. Diff must be 0.
Source: PAL comparison, May 2026

**3. Fidelity badges on Lab modules** `S effort` `HIGH`
ML Systems Lab ships `✓ Real execution` / `~ Simulated` on every module. Builds honest trust. Currently users have no signal about whether a simulator is running real logic or a pre-scripted scenario.
File: all 4 lab files — `src/App.jsx` (RAG Lab), `src/Agents.jsx` (Agent Lab), `src/systems/modules.jsx` (LLM Lab + Eval Lab modules).
Fix:
- Create a small `FidelityBadge` inline component (or just a reusable JSX snippet): 2 variants. Variant A: `✓ Scenario-accurate` in emerald (used where failure logic is derived from real config input — RAG Lab, `agentcfg`, `serving`, `decoding`). Variant B: `~ Simulated` in zinc/amber (used where scenarios are pre-scripted — most Agent Lab modules, Eval Lab reference modules).
- Place the badge in the module header area, to the right of the module title, consistent position across all labs.
- Apply: RAG Lab scenarios → Variant A. Agent Lab: `agentcfg`, `simulator`, `design` → Variant A; all others → Variant B. LLM Lab: `serving`, `decoding`, `inference` → Variant A; `streaming`, `specdecoding`, `reasoning`, `kvcache`, `moe`, `quantization` → Variant B. Eval Lab: `evals`, `mlcicd`, `prompt-change-mgmt`, `router` → Variant A; all others → Variant B.
- Brace check each modified file. Diff must be 0.
See: IDEAS.md → "Cross-product patterns" → Fidelity badges

**4. Concepts Gym — inline progress view + "next module" CTA** `S-M effort` `MEDIUM`
PAL's Progress page shows per-room completion bars and a guided path with a named "NEXT" marker. Our Concepts Gym has the data (mastery set in localStorage, gym structure in GYMS constant) but no dedicated progress view. A returning user has no clear signal of where to go next within a gym.
File: `src/Concepts.jsx` — `GymRoomView` and/or a new `GymProgressView` component.
Fix:
- In `GymRoomView`, add a progress summary at the top: `N / total modules done` bar (same style as the existing gym progress bar on the selector card, just surfaced inside the room).
- Add a "Continue where you left off" CTA — detect the first incomplete module in the room's `moduleIds` list and render a button: `Continue: [module label] →` in the gym's accent color. If all done, render "All done — try the lab →" with the lab pointer.
- Optionally: add a 2-line summary of what the user last completed (`mastery` set contains the IDs). "Last completed: Attention Mechanism."
- This is essentially PAL's Guided Path right panel, scoped to one gym. Keep it to 8-10 lines of JSX — don't over-engineer.
- Brace check after. Diff must be 0.
Source: PAL comparison, May 2026

**5. PrepLab — Keyboard shortcuts** `S effort` `LOW-MEDIUM`
Every MCQ answer requires a mouse click. 1/2/3/4 to select + Enter to confirm is standard for any quiz tool. Power users on a study loop notice the friction immediately.
File: `src/PrepLab.jsx` — ExamMode and TrainerMode components.
Fix:
- In ExamMode: add a `useEffect` with a `keydown` listener. Keys 1/2/3/4 map to answer index 0/1/2/3 — call the existing `selectAnswer(index)` handler. Enter key calls the existing `submitAnswer()` or `next()` handler depending on state. Clean up the listener on unmount (`return () => window.removeEventListener(...)`).
- In TrainerMode: same pattern — 1/2/3/4 to select, Enter to confirm/advance. TrainerMode already has `handleAnswer(option)` — wire keys to call it.
- Do NOT add keyboard shortcuts to InterviewPrepMode (free-text self-grade — no MCQ to wire to) or WeaknessHeatmapMode.
- The `useEffect` import is already at the top of PrepLab.jsx — no new imports needed.
- Brace check after. Diff must be 0.
See: UPGRADES.md → "PrepLab.jsx — Keyboard Shortcuts"

---

## If time allows (pick one)

**Streak + 4-week activity heatmap in returning user HomeTab** `S-M effort`
ReturningHomeView (sprint 16) shows progress stats but no streak or activity grid. Add `gsl-streak` + `gsl-last-visit` + `gsl-activity-YYYY-MM-DD` localStorage keys, increment on any lab visit or PrepLab attempt. 4×7 grid in the Today section.
File: `src/Home.jsx` — `ReturningHomeView` component and `getActivityData()` helper.
Fix: on every tab navigation (`navigate()` in App.jsx), write today's date key to localStorage (`gsl-activity-YYYY-MM-DD = 1`). In `getActivityData()`, read the last 28 day-keys and return a boolean array. In `ReturningHomeView`, render a 4-row × 7-col grid in the Today section: filled cell = green-500/30, empty = zinc-800, today = ring. Streak = count of consecutive days ending today from the activity array.
See: UPGRADES.md → "Home.jsx — Streak + Activity Heatmap"

---

## Pending (pushed out this session)

**Guided Paths — promote from tab to inline on Home returning-user view** `M effort`
PAL surfaces the active guided path directly on its Progress page with named steps and a "Continue →" CTA. Our Learning Paths tab is a separate destination nobody finds. The fix is to inline the active path into `ReturningHomeView` in `Home.jsx` — detect the user's most-in-progress path from localStorage, render the next 3 steps, add a "Continue" CTA.
Pushed out: lower urgency than sidebar + gym progress. Build after those ship.
Source: PAL comparison, May 2026
See: CLAUDE.md "Structural Upgrade" → Learning Paths as connective tissue

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
