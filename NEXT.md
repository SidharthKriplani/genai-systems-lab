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
Fix: full-width card, positioned immediately below the failure diagnosis block, impossible to miss. No new logic — layout shift only.
See: UPGRADES.md → "RAG Lab — Done Card Prominence"

**2. Fidelity badges on Lab modules** `S effort` `HIGH`
ML Systems Lab ships `✓ Real execution` / `~ Simulated` on every module. Builds honest trust. We have no signal to users about what the simulator is actually doing vs what a real system would do.
Fix: small label component, 2 variants. Apply to all 4 labs: RAG Lab = `✓ Scenario-accurate`, Agent Lab modules = `~ Simulated`, LLM Lab (config-driven) = `✓`, others = `~ Simulated`. One consistent component, one pass.
See: IDEAS.md → "Cross-product patterns" → Fidelity badges

**3. PrepLab — Keyboard shortcuts** `S effort` `LOW-MEDIUM`
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

---

## End of session checklist

- [ ] Brace check on all modified files (diff must be 0)
- [ ] Commit with descriptive message
- [ ] Update CLAUDE.md sprint log
- [ ] Update this file — move done items out, add anything new that came up
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
