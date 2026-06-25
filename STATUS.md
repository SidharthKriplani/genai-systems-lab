# STATUS.md — Cold-start view

Read this at session open alongside NEXT.md + CLAUDE.md. One screen of truth.

---

## Where we are (25 Jun 2026)

**Vercel:** live at `genai-systems-lab-ivory.vercel.app`  
**Last meaningful push:** Sprint 90 (monochrome instrument theme — partial; app-wide rail-kill + GT muted hues push open in PENDING_APPROVALS.md)  
**Content freeze:** IN EFFECT — distribution/GT posts only until distribution proves out

---

## What just shipped (this session, 25 Jun 2026)

**Icon system migration — monochrome Instrument design standard.**  
Full HQ canonical `Icon.jsx` (84 icons + GLYPH_TO_ICON map) deployed to `src/`. Two new files added: `CompanyLogo.jsx` (Google favicon + initial-badge fallback, inline rgba styles for GSL's Tailwind base) and `companyDomains.js` (319-entry canonical domain resolver). 26 source files swept; local `CompanyLogo` in `PrepLab.jsx` replaced with canonical HQ import. Targeted fixes in `Agents.jsx`, `systems/modules.jsx`, `Playground.jsx`, `PrepLab.jsx`, `Concepts.jsx`, `MLCiCd.jsx`, `GroundTruth.jsx`. All remaining emoji are legitimate leaves (string ternaries, dynamic lookups, content data, icons not in map). Commit pending (approve-first).

---

## The product in one line

GSL is a judgment SPA for GenAI/AI engineering interview prep: 320 GT posts (12 series, SSR pre-rendered), 597 PrepLab questions, Agent/RAG/FM/Eval/Prompt Labs, 57 Systems modules across 5 gyms, StartHere beginner ramp, 2 guided paths (First Principles + Senior AIE Track), CertificateModal.

---

## Active blockers / open items

1. **PENDING_APPROVALS.md** — app-wide rail-kill + GT muted hues (Sprint 90 phase 3) awaiting Mac build + push
2. **IA rebuild (P2–P4)** — paused; needs HQ override before resuming (FREEZE CONFLICT flagged in NEXT.md)
3. **Mastery Room** — code staged (`staged-mastery-room` branch); needs Supabase SQL run first
4. **PostHog key** — `VITE_POSTHOG_KEY` must be set in Vercel; analytics blind without it
5. **Sitemap submission** — push `sitemap.xml` in Google Search Console after next deploy
6. **PL link-out** — DO→Python still points at GitHub repo; swap to live Vercel URL once PL deploys

---

## Scale snapshot

- 320 Ground Truth posts (12 series); SSR: 320 static pages + sitemap
- 597 PrepLab questions (8 difficulty levels, SRS, browse + exam modes)
- 5 BUILD labs (RAG · FM · Prompt · Agent · Eval); 57 Systems modules across 5 gyms
- 2 guided learning paths; CertificateModal; OnboardingModal
- Icon system: 84-icon HQ canonical (`src/Icon.jsx`); 26+ consumers
- StartHere: 5 micro-lessons (P1 of IA rebuild — live)

---

## Next session

Read NEXT.md. The IA rebuild (P2 GT toggle) is next up but paused for freeze-conflict review. Check PENDING_APPROVALS.md for the open Sprint 90 push first.
