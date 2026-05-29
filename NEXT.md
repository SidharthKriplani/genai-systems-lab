# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 24)*

---

## Theme: Close the loops users already opened. Surface progress clearly.

Sprint 22 structural overhaul complete (Build/Prove/Navigate). Sprint 23 visual redesign + animations complete. Sprint 24 full elevation token system complete — GAL now competes with PAL through and through. This session: interactive improvements that directly affect the learn loop.

---

## Do this (in order)

**Done this session (sprint 24):**
- ~~Elevation token system (shell)~~ → `--bg` (#111520), `--surface` (#191e30), `--surface-2` (#1f2438), `--border` (#3d4668), `--border-subtle` (#2a3255) added to `:root` in `index.css`. App.jsx: root div, both sidebars (desktop + mobile), RAG Lab inner sidebar, header border, search modal, leaderboard modal, feedback modal, shortcuts modal all use tokens. Home.jsx: all door cards + Today section + Continue button use `--surface-2`/`--border`. Commits `08f4512`, `dc26961`.
- ~~Elevation token system (full pass)~~ → `--color-zinc-900: #191e30` added to `:root` — single-line remap that fixes 300+ `bg-zinc-900` panel backgrounds across Agents.jsx, PrepLab.jsx, Concepts.jsx, GroundTruth.jsx, Systems.jsx in one shot (same technique as the sprint 8 zinc-500/600 contrast fix). All 5 lab sidebar shells converted to `var(--surface)` + `var(--border)`. All mobile back buttons use `var(--border)`. Commit `4192c3a`.

**Done this session (sprint 23):**
- ~~CSS variables~~ → `--gal-build/prove/navigate/knowledge` added to `index.css`. NAV_GROUPS use `var()`. Commit `b5b4d2e`.
- ~~Sidebar collapse~~ → `collapsedGroups` + chevron + item-count badge. Desktop + mobile. Commit `b5b4d2e`.
- ~~Home hierarchy~~ → BUILD full-width dominant card with 4 lab pills. PROVE+NAVIGATE secondary row. Stats row removed. Commit `b5b4d2e`.
- ~~Lab shell consistency~~ → RAG Lab sidebar header promoted (text-base). `ragDone` + progress bar. Eval Lab gets GT chip. Commit `b5b4d2e`.

**Done this session (sprint 22):**
- ~~Fidelity badges on Lab modules~~ → FidelityBadge added to App.jsx, Agents.jsx, Systems.jsx. Commit `8578457`.
- ~~Sidebar — Build/Prove/Navigate nav~~ → NAV_GROUPS rewritten, ALL_TABS updated, GROUP_COLORS updated. Commit `8578457`.
- ~~Progress page three-lane rebuild~~ → ProgressView replaced with BUILD/PROVE/CONCEPTS lanes. Commit `8578457`.

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

**2. Concepts Gym — inline progress view + "next module" CTA** `S-M effort` `MEDIUM`
PAL's Progress page shows per-room completion bars and a guided path with a named "NEXT" marker. Our Concepts Gym has the data (mastery set in localStorage, gym structure in GYMS constant) but no dedicated progress view. A returning user has no clear signal of where to go next within a gym.
File: `src/Concepts.jsx` — `GymRoomView` and/or a new `GymProgressView` component.
Fix:
- In `GymRoomView`, add a progress summary at the top: `N / total modules done` bar (same style as the existing gym progress bar on the selector card, just surfaced inside the room).
- Add a "Continue where you left off" CTA — detect the first incomplete module in the room's `moduleIds` list and render a button: `Continue: [module label] →` in the gym's accent color. If all done, render "All done — try the lab →" with the lab pointer.
- Optionally: add a 2-line summary of what the user last completed (`mastery` set contains the IDs). "Last completed: Attention Mechanism."
- This is essentially PAL's Guided Path right panel, scoped to one gym. Keep it to 8-10 lines of JSX — don't over-engineer.
- Brace check after. Diff must be 0.
Source: PAL comparison, May 2026

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
