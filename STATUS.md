# STATUS.md — Cold-start view

Read this at session open alongside NEXT.md + CLAUDE.md. One screen of truth.

---

## Where we are (15 Jul 2026)

**Vercel:** live at `genai-systems-lab-ivory.vercel.app` (not re-confirmed by direct fetch this refresh)
**Last meaningful push:** commit `cab6599` — ported MSL's two new content-verification scripts (`scripts/check-duplicate-keys.mjs` v2, `scripts/extract-numeric-claims.mjs`); no content files touched this session.
**Content freeze:** unchanged from 12 Jul entry below — still not formally revised.
**Uncommitted local work:** none — `git status` clean as of HEAD `cab6599` (one pre-existing untracked `_to_delete/` folder, unrelated).

---

## What just shipped (session 15 Jul 2026 — tooling port only, no content work)

**Ported MSL's duplicate-key + numeric-claims verification tooling.** MSL found and fixed 36 duplicate-object-key bugs this session (dead code invisible to prose-only content audits) and built `scripts/check-duplicate-keys.mjs` to catch this class going forward, per the shared root `CLAUDE.md`'s Recordkeeping rule 6. Porting to GSL caught a real bug in the checker itself before it could cause a false alarm here: v1 used an indentation heuristic tuned to MSL's file shape that doesn't hold for GSL's `preplabQuestions.js` (question objects open with several keys inline on one line) — produced 9 false positives there. Rewrote as v2, a real brace-depth parser with no shape assumption; re-verified against MSL (no regression) and GSL. **Result: `node scripts/check-duplicate-keys.mjs` → 0 duplicate keys across 60 files in `src/data/`.** GSL never had this bug class — a clean bill of health, not a fix. Full detail: `docs/GSL_PLAN.md`'s 2026-07-15 14:58 IST entry.

**No blind-adversarial content audit was run on GSL this session.** MSL's parallel session ran 5 rounds of blind audits this session (~55 modules sampled across S/A-tier, roughly a dozen real defects found and fixed) — that work is MSL-only. GSL's own `contentStatus.js` tally (**81 'clean' / 81 tracked, S: 25/25, A: 56/56**, re-verified via `node scripts/validate-content-status.mjs` this refresh) predates this session's audit-rigor findings and has NOT been re-checked against the same standard MSL's "clean" tag turned out to be unreliable under. Given MSL's own experience this session — prior "clean" audits that claimed exhaustiveness while missing the actual defect — do not assume GSL's 81/81 is more reliable than MSL's pre-audit tally was. It just hasn't been tested yet.

**Still open from the 12 Jul entry, unchanged:** 15 GSL modules logged as round-2 `in_progress` residual issues in `docs/GSL_PLAN.md`'s 2026-07-11 23:08 IST entry — never revisited. The QnA standard's own question-quality audit — never run on GSL's draft questions. Neither touched this session.

## Where we are (12 Jul 2026)

**Vercel:** live at `genai-systems-lab-ivory.vercel.app`  
**Last meaningful push:** commit `b6ed426` — GSL qnaBank.js now covers all 132/132 modules; draft QnA questions render in the UI  
**Content freeze:** superseded in practice by an owner-directed 3B1B/Phase-A content-quality pass + the QnA interview-mode build (see below) — GT-post-only framing from 25 Jun is stale, not formally revised here

---

## What just shipped (sessions through 12 Jul 2026)

**3B1B Phase A content pipeline.** `src/data/contentStatus.js` is the queryable ledger (see its own header for the receipt spec) — **66 'clean' / 81 tracked** (S: 23/25, A: 43/56). 15 `in_progress` modules have a logged round-2 residual-issue count each; full list in `docs/GSL_PLAN.md`'s 2026-07-11 23:08 IST entry. Round 2 (fix the 15) not started.

**Interview QnA mode.** Third view tab (Full / Quick recap / Interview QnA) on every Foundations module, `src/components/QnAPanel.jsx` + `src/data/qnaBank.js`. **132/132 id-collision-free GSL modules now have a draft question set** (4225 questions total across 2 batches) — 1 module (`transformer`) is fully `answered` (30 questions, audited). Per explicit user direction (2026-07-12), `draft`-status questions now RENDER in the UI (distinct DRAFT banner) instead of a coming-soon stub — only real-answer eligibility (still gated on narrative `clean` status) is unchanged. Rule detail: root `QNA-INTERVIEW-STANDARD.md`. **Owed, not done:** the standard's own light question-audit pass has never been run on these 4225 draft questions.

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

---

## 2026-07-05 — MEGA-SESSION (full detail in root ../../CLAUDE.md)
- 4 gap modules authored (agent-eval-trajectory[S], rag-ingestion-pipeline, model-routing-cascades, llm-security-beyond-injection) — teaching + interactives + L0/L1/L2.
- **FROM-ZERO pedagogy rewrite across ALL 25 S + 52 A modules**: `groundUp` "Start Here" opener + explanation as first-principles causal chain + `scenario` demoted to "In Production — Apply It". Mechanism in FoundationsRunner.jsx (backward-compatible). Gold standard = `embeddings`. B-tier not yet done.
- Difficulty ordering (gyms BEG→INT→ADV via sortIdsByLevel + hub/question lists). My Tracks: Study→ deep-links to module + editable notes. Mobile master-detail (My Tracks, Company Tracks). Wave 3: Profile 5-card + Progress heatmap/streak/async-leaderboard.
- All esbuild-verified; push via `git add src/`. **NEXT = SEO → ../../HANDOFF-SEO.md** (GSL already prerenders GT via scripts/prerender-gt.js — extend it).
