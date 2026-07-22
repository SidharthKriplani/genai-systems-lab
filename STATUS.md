# STATUS.md — Cold-start view

> **23 Jul 2026 — Study-loop + view-tier session (Fable orchestration; MAJOR).** GSL got the
> full annotation/study stack + the new per-module view tiers. (1) **Cross-device sync v2**:
> `utils/annotationsSync.js` (mergeAnnotationBlobs newest-wins + tombstones, unit-tested 7/7),
> ANNOT_PAIRS in supabase.js for stickies / gsl_page_highlights_v1 / gsl-review-cards-v1 /
> gsl-takeaway-v1; App.jsx live-sync v2 effect: 4s debounced push on 'annotations-changed',
> flush on visibilitychange/pagehide, 20s-throttled pull + 45s heartbeat + push-back after
> merge. (2) **Stickies v2.1**: hashless bucket keys + legacy-bucket migration, StickyScope
> per module+view (incl. new ':academic'/':min'), two-step delete confirm, editedTs footer.
> (3) **Highlights**: FAINT map fixed to real swatch ids, delete-tombstones, applyAll
> optimistic-lock (flicker race), PageHighlighter click-defer inside [data-own-highlighter],
> marker mode (gsl-marker-mode-v1) + Note-from-selection, popover toolbar now width:max-content
> (fixed clipped "→ Track"). (4) **View tiers on FoundationsRunner**: tab row is now Full |
> Academic | ⚡Quick recap | 20:80 | Interview QnA, with instant custom hover chips (native
> title attrs removed — they double-tooltipped); Academic renders `deeperMath`, 20:80 renders
> `interviewMin`, both via new AnnexBlocks structured renderer ({h}/{eq}/{list} blocks);
> **deep links**: 4th hash segment #concepts/<gym>/<module>/<view> (read once per mount,
> replaceState on tab change). Transformer module carries BOTH approved exemplars (T6
> academic w/ adversarial-verified numbers — exact GPT-2 124,439,808 receipt; T8 20:80 incl.
> rapid-fire follow-ups). (5) **Review cards B1**: gsl-review-cards-v1 + hlcard source in
> Review.jsx SM-2 queue. (6) **Takeaway box** (gsl-takeaway-v1) atop recap view. (7)
> **Tracks-as-plans v1**: item.done checkboxes + addTask + progress bar + Resume deep-link.
> (8) **Glossary G0** (worker): hover-grace/pin/see-also across module text. (9) **DS-HARVEST**:
> designStudioBriefs 64→75 AIE briefs (Gemini-harvested, mechanics-only screening). (10)
> **TabErrorBoundary auto-heal** for highlight-DOM insertBefore crashes (strip marks + auto
> retry, capped 2/15s) — live crash on seq-parallel not reproduced in 5 Playwright campaigns,
> mitigated instead. Also: TDZ crash postmortem (scroll-reset effect above qnaMode decl —
> fixed + FABLE BUILD GATE rule added), recap white-void fix (html/body bg + scroll reset),
> stacked-popover fix. All pushed through 23 Jul cells. **Next**: T6 exemplar 2 (embeddings),
> academic/20:80 rollout to more modules, WO-3 cost-attribution expansion (Sonnet D8, in
> flight), PL parity wave.

> **18 Jul 2026 — Tracker note persistence hardened.** My Tracks notes now survive tab
> close/refresh and multi-tab editing. Two fixes (editor already keyed by `liveNote.id`, so
> no key change needed here — unlike MSL): (1) **close-flush** — `NoteEditor` flushes the
> 500ms autosave buffer on `visibilitychange`(hidden)+`pagehide` (unmount cleanup never runs
> on a real page close); (2) **cross-tab reconcile** — `MyTracks.jsx` now listens to `window
> 'storage'` (key `gsl-tracks-v1`) so a 2nd tab stops holding stale state and clobbering the
> 1st tab's writes (`gsl_tracks` CustomEvent was same-tab only). Files: `src/components/
> NoteEditor.jsx`, `src/MyTracks.jsx`. esbuild-verified, additive (existing notes untouched),
> **LOCAL/uncommitted** — push on Mac. Residual: same note in two editors = note-level
> last-writer-wins (no live block-merge, deliberate). PAL/PL not done this pass.

> **17 Jul 2026 FINAL — ONE BLOCKER: Vercel.** GSL's newest commits had NO deployment
> rows (status filter at 6/7 hides one status — likely Error). Until a green build lands,
> NOTHING new is visible on GSL anywhere: SW v2 (kills the v1 stale-bundle cache — v1
> pre-cached index.html itself), SlashMenu v3 (ghost fix), arrow nav, mobile pass,
> NOTE-chip hidden on phones (the Copy clip), outline ☰ drawer. All committed + pushed.
> First action next session: clear the Vercel status filter, find the red GSL builds,
> redeploy. After that one green build, every fix appears at once and the SW self-heals
> all devices.

> **17 Jul 2026:** editor wave 2 — SlashMenu v3 (the ghost fix; v2's T.surface is translucent rgba in GSL — token values differ per lab), one-press arrow nav, mobile pass. Ghost re-report was a stale deploy: fix is pushed in 5983c1a, check Vercel + hard-refresh.

> **16 Jul 2026 session close:** NoteEditor family wave (selection/undo/sub-bullets/timestamps — see LINEAGE tail), quick-note composer removed, global PageHighlighter added. Commit command handed to Sidharth (approve-first). Verify-on-deploy list in NEXT.md.

Read this at session open alongside NEXT.md + CLAUDE.md. One screen of truth.

---

## Where we are (16 Jul 2026, updated 20:15 IST)

**QnA answer-writing rollout: COMPLETE — 131/131 GSL modules answered, 0 parked, 0 draft, 4,257 questions.**
Closed out via `QNA-ANSWER-ROLLOUT-PLAN.md`'s batch sequence (batches 1-26): real Tier S (25 modules) +
Tier A (56 modules across 11 domain groups) completed first, then a 4-sub-batch "Tier B" closeout
(batches 23-26, 729 questions across 22 modules: Agents/Codegen, Safety/Security/Cost, Multimodal/Infra/
Vector/Prompt, Voice AI) finished the remaining modules. Every question has a full AMGB atomic-bullet
answer (`**Answer.**`/`**Mechanism.**`/`**Grounding.**`/`**Boundary.**`) per `QNA-ANSWER-SPEC v1`, drafted
by parallel per-module writer agents grounded strictly in that module's own source content, independently
re-validated by a fresh Python script per batch against the full spec checklist (word counts, category
anatomy, per-level bullet-count bands), with every flagged item hand-reviewed and classified as either a
real gap (hand-patched) or a legitimate spec-sanctioned exception (accepted as-is). Final full-repo sweep:
`node --check` clean on `qnaBank.js`/`qnaStatus.js`, 0 duplicate keys, 0 empty answer arrays across all
4,257 questions. **Owed, not done (superseded):** the "light question-audit pass" mentioned in the 12 Jul
entry below is now effectively superseded by this per-batch independent-validator process, which is
stricter than what was originally scoped.

**Vercel:** live at `genai-systems-lab-ivory.vercel.app` (not re-confirmed by direct fetch this refresh)
**Content freeze:** unchanged from 12 Jul entry below — still not formally revised.

---

## Where we are (15 Jul 2026, updated 19:31 IST)

**Vercel:** live at `genai-systems-lab-ivory.vercel.app` (not re-confirmed by direct fetch this refresh)
**Last meaningful push:** GSL blind audit round 1 — all 81 tracked modules re-tested, 33 had real defects, all fixed. Not yet pushed as of this write (see git commands owed).
**Content freeze:** unchanged from 12 Jul entry below — still not formally revised.
**Uncommitted local work:** `contentStatus.js` + 12 content files with real fixes + `docs/GSL_PLAN.md`, pending commit/push (see below).

---

## What just shipped (session 15 Jul 2026)

**Ported MSL's duplicate-key + numeric-claims verification tooling** (14:58 IST). `node scripts/check-duplicate-keys.mjs` → 0 duplicate keys across 60 files. GSL never had this bug class. Full detail: `docs/GSL_PLAN.md`'s 2026-07-15 14:58 IST entry.

**GSL blind audit round 1 — the audit-rigor gap flagged earlier today is now closed.** Ran the same blind-adversarial process MSL used on itself (one dispatched agent per source file, checked against 3B1B-STANDARD.md/CONTENT-AUDIT-RUBRIC.md/CONTENT-STANDARD.md, every number independently recomputed) against all 81 of GSL's own "clean"-tagged modules — the first time this ledger has been tested this way. **Result: 33 of 81 (41%) had real defects, now fixed — a worse hit rate than MSL's own re-audit found (13 defects at similar scale).** Defect classes: tested-but-not-taught content, forward references to untaught concepts, real arithmetic errors, prerender-safety violations, unresolved scenario payoffs, a module silently missing its `keyPoints`/`recap` arrays entirely, mislabeled/self-contradictory figures, voice violations, and internally-impossible worked examples. 5 additional defects were found in paired `.jsx` interactive components (out of this pass's edit scope) and logged, not fixed — see `docs/GSL_PLAN.md`'s 2026-07-15 19:31 IST entry for the full list and the per-module verdict table.

**Verification:** `node --check` clean on all 19 touched files, 0 duplicate keys, `node scripts/validate-content-status.mjs` → **81/81 clean** (S: 25/25, A: 56/56), zero stale-hash warnings, `git status` matches exactly the 12 files with real fixes.

**Still open:** the 5 `.jsx`-component-level defects found this round (dpo/Concepts.jsx stale number, agent-eval-trajectory/AgentEvalViz.jsx scoring mismatch, quality-drift/QualityDriftModule label mismatch, cost-attribution/CostAttributionModule pct-bar mismatch, rag-pipeline/recap-patch-a.js dangling "Recall@k" reference) — need a follow-up pass scoped to those component files. 15 GSL modules logged as round-2 `in_progress` residual issues in `docs/GSL_PLAN.md`'s 2026-07-11 23:08 IST entry — still never revisited (predates this round, separate from the 81 tracked in contentStatus.js). The QnA standard's own question-quality audit — never run on GSL's draft questions.

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

---

## 2026-07-17 11:10 IST — Design Studio skeletons added (post session-close-v3)
New open-ended system-design surface, SKELETONS ONLY (commit ccb04d9): `src/data/sdScenarios-gsl-designstudio.js`
(`SD_GSL_DS`, 5 seeds) extends the System Design Trainer (`SD_SCENARIOS`) with a spec-openness dial (S1-S4). Unwired,
node --check clean. Detail: docs/GSL_PLAN.md same-date entry + root DESIGN-STUDIO-SPEC.md. NOTE: a large uncommitted
`public/modules/*.html` prerender diff is present in the working tree — regenerated artifacts, Sidharth to decide commit/discard.

## 2026-07-17 12:29 IST (Friday) — Design Studio SHIPPED (live, read-only)
Deployed under the BUILD frame (HEAD 095fc51). `src/DesignStudio.jsx` renders `DESIGN_STUDIO_GSL` (11 corrected-mechanic briefs: agentic S1-S4, RAG S1-S3, doc-extraction, eval-harness, refactor, agent-debug). Mechanic = **produce artifact -> reveal reference -> self-critique** (NO tick/MCQ, NO LLM in the loop). Read-only viewer for now; briefs are skeletons (reference/rubric prose deferred via `_flesh`). Old tick-schema `sdScenarios-gsl-designstudio.js` superseded -> `_to_delete/`. Commit arc: ccb04d9 -> d99d2e9 -> c7bdde7 -> d8d0453 -> 095fc51. NEXT: (1) flesh the proof cell `ds-payment-exception-agent` + the rubric-critic at N=1, then fan out; (2) upgrade the viewer to the interactive produce->reveal->self-critique workspace. Authority: root `DESIGN-STUDIO-SPEC.md`. NOTE: uncommitted `public/modules/*.html` prerender diff in the tree is pre-existing, not Design Studio.

## 2026-07-22 03:49 IST (Wednesday) — Doc reconciliation: Design Studio grew far past the 07-17 SHIPPED entry above (T1, EXECUTION-RUNBOOK)

The "12:29 IST SHIPPED (live, read-only)" entry above is now stale — a parallel work stream (outside this execution thread; commits authored by SidharthKriplani <hackerworks01@gmail.com>, not this session) shipped four more commits since: `669e62b` (root catalog complete: 12 roots, 36 variations), `a185f47` (Coding Dojo 15->27 exercises — unrelated surface, noted for completeness), `dfff28d` (Design Studio REDESIGN: roots map, produce-before-reveal gating, staged compounding engine + flagship `ds-reliability-429-root` process-model root — a new authoring pattern with staged `ask/model/heuristic/control/tell` fields, distinct from the produce/reveal/rubric shape), `ba7e1e2` (+3 grounded G1 roots: Amazon Gateway, Google cost-inflation, Netflix agent-loop).

**Enumerated this turn** (`grep -o 'id: "[a-z0-9_-]*"' src/data/designStudioBriefs.js | sort -u | wc -l`): **91 total briefs** (up from the 11 at first ship, up from 59 as of the 2026-07-21 brainstorm snapshot). `grep -c "worked:"` = **17** briefs with authored worked-reference prose (up from ~12 at brainstorm time); the remaining briefs are still `reference: { type: "..." }` only — skeleton. `node --check src/data/designStudioBriefs.js` clean. Git state: local HEAD `ba7e1e2` is 0 ahead / 0 behind `origin/main` (pushed already, not pending approval).

Not re-audited this pass (that's T11's job, not T1's): whether the 17 worked references meet CONTENT-AUDIT-RUBRIC / the DESIGN-STUDIO-SPEC's own quality bar, or whether the new process-model shape (429 root) should become the template for other roots. Flagging only that ground truth moved; T11 (Design Studio convergence) should treat this entry's 91/17 counts as its starting point, not the brainstorm's 59.
