# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 19)*

---

## Theme: Fix what's broken. Make existing content feel complete.

No new features. No new modules. Sprint 19 left a few critical gaps and several small high-ROI items. Finish those.

---

## Do this (in order)

**1. RAG Lab — Done Card prominence fix** `S effort` `CRITICAL`
The ✓ done card (forward pointer to PrepLab + GT post) is below the fold after a scenario completes. Users finish a scenario and leave without seeing it. The learn loop doesn't close.
Fix: full-width card, positioned immediately below the failure diagnosis block, impossible to miss. No new logic — layout shift only.
See: UPGRADES.md → "RAG Lab — Done Card Prominence"

**2. RAG Lab — "Test Your Understanding" button fix** `S effort` `CRITICAL`
Button is present but navigates to nothing — dead end. Has been broken since it was added.
Fix: wire to PrepLab filtered to the correct topic cluster per scenario (e.g. Missing Answer → retrieval failure questions). The `preplabInitialMode` state in App.jsx already handles this pattern from the TYU sprint — just needs the scenario → topic mapping.
See: UPGRADES.md → "RAG Lab — TYU CTA Fix"

**3. Home — Hero copy rewrite** `S effort` `CRITICAL`
Current badge + headline + subtext is informative, not magnetic. First thing every cold visitor sees.
Fix: badge out, one-line outcome claim in. Headline under 8 words, production-readiness thesis. Body copy drops RAG-specific framing, speaks to the full AI pipeline.
See: UPGRADES.md → "Home.jsx — Hero Copy Rewrite"

**4. Fidelity badges on Lab modules** `S effort` `HIGH`
ML Systems Lab ships `✓ Real execution` / `~ Simulated` on every module. Builds honest trust. We have no signal to users about what the simulator is actually doing vs what a real system would do.
Fix: small label component, 2 variants. Apply to all 4 labs: RAG Lab = `✓ Scenario-accurate`, Agent Lab modules = `~ Simulated`, LLM Lab (config-driven) = `✓`, others = `~ Simulated`. One consistent component, one pass.
See: IDEAS.md → "Cross-product patterns" → Fidelity badges

**5. PrepLab — Keyboard shortcuts** `S effort` `LOW-MEDIUM`
Every MCQ answer requires a mouse click. 1/2/3/4 to select + Enter to confirm is a 30-line useEffect. Power users will notice immediately.
Fix: one key listener in Exam mode + Trainer mode, cleaned up on unmount.
See: UPGRADES.md → "PrepLab.jsx — Keyboard Shortcuts"

---

## If time allows (pick one)

**Streak + 4-week activity heatmap in returning user HomeTab** `S-M effort`
ReturningHomeView (sprint 16) shows progress stats but no streak or activity grid. Add `gsl-streak` + `gsl-last-visit` + `gsl-activity-YYYY-MM-DD` localStorage keys, increment on any lab visit or PrepLab attempt. 4×7 grid in the Today section.
See: UPGRADES.md → "Home.jsx — Streak + Activity Heatmap"

---

## Do NOT touch this session

- Interview Strategy Tool — L effort, needs its own session
- GT Series + Tags redesign — M-L effort, content taxonomy work needed first
- React.lazy() code splitting — systematic architectural change, separate session
- New modules / GT posts — content work, wrong session type
- Career + AIPM consolidation — M-L effort, separate session
- Interlinking / footer links — outside the codebase, handle separately

---

## End of session checklist

- [ ] Brace check on all modified files (diff must be 0)
- [ ] Commit with descriptive message
- [ ] Update CLAUDE.md sprint log
- [ ] Update this file — move done items out, add anything new that came up
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
