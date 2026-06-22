# PENDING_APPROVALS

_Controller-facing approval queue for the GenAI Systems Lab. Each entry is a completed build awaiting Sidharth's review + push (or a render go-ahead). Nothing here has been auto-pushed. Read the linked files, approve, then run the proposed commands. Append new entries on top; move to the History section once actioned._

---

## ⏳ AWAITING macOS BUILD + PUSH — BreakLabs logo / BrandMark (D-19) (23 Jun 2026, sprint 83)

**Scope:** Implement the BreakLabs co-brand lockup per `docs/BRANDMARK-ROLLOUT.md` — GSL standalone pass. Descriptor `GenAI Systems`, accent cyan `#22D3EE`; wordmark + red seam `#FB5247` are the cross-lab constant. HQ-authorized freeze override (brand task only).

**Status:** **Code written; all edited JSX parse clean (Babel).** Native esbuild/Vite can't run in the sandbox (ARM64) → **`npm run build` on macOS is the deploy gate.** Approve-first, **not pushed.**

### What was done
- **`src/BrandMark.jsx`** (new) — canonical component (variants full / wordmark / monogram + degrade rule; seam red + wordmark constant; descriptor + accent per-lab). Mirrors PL's reference impl.
- **`src/index.css`** — lockup tokens `--ink-hi / --ink-low / --rim / --font-mono` (IBM Plex Mono) in dark `:root`; dark-ink overrides in `[data-theme="light"]`. Call-sites pass `accent={var(--gal-build)}` → cyan (dark) / legible violet (light), avoiding cyan-on-cream contrast fail.
- **Slots 1–7:** sidebar logo + mobile-drawer logo (both old purple "G" boxes replaced) → stacked wordmark + cyan descriptor; Home signed-out hero → large wordmark; `GateOverlay` sign-in/paywall → wordmark; sidebar footer → monogram + "part of BreakLabs"; loading splash → monogram. **Favicon:** new `public/favicon.svg` monogram + `<link rel=icon>` in `index.html` (none existed). **OG:** rebranded `public/og-image.png` (1200×630).
- **Archive (D-18):** old `public/og-image.png` → `_legacy/og-image.png` (no prior favicon).

### Read for approval
- `git diff src/App.jsx src/Home.jsx src/GateOverlay.jsx src/index.css index.html` + new `src/BrandMark.jsx`, `public/favicon.svg`, `public/og-image.png` (rebranded), `_legacy/og-image.png`.

**Layout:** the descriptor **"GenAI Systems" is stacked BELOW the `break⌇labs` wordmark** in every lockup (sidebar, mobile drawer, Home hero, gate) and in the OG — not inline beside it.

### ⚠️ Must verify on macOS before deploy (sandbox can't run Rollup/Vite)
`npm run build` + `npm run dev`, then QA: sidebar **and** mobile-drawer show `break⌇labs` (red seam) with cyan "GenAI Systems" **on the line below**; favicon tab shows the red glyph; Home (signed-out) hero shows the large wordmark + "GenAI Systems" beneath; a gated tab + the sign-in modal show the stacked lockup; sidebar footer shows "part of BreakLabs"; loading splash flashes the monogram; toggle **light theme** — wordmark stays dark-ink legible, descriptor readable; greyscale-legible (BRAND QA gate). Share-preview the new OG (wordmark over "GenAI Systems").

### Proposed push (Sidharth runs after review — never auto-pushed; D-18 tag first)
Step 1 — tag + build + smoke-test:
```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab
rm -f .git/index.lock .git/HEAD.lock
git tag pre-brandmark-d19
npm run build
npm run dev
```
Smoke-test the QA list, then Ctrl-C. Step 2 — only if build clean AND QA passes:
```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab
rm -f .git/index.lock .git/HEAD.lock
git add src/BrandMark.jsx src/App.jsx src/Home.jsx src/GateOverlay.jsx src/index.css index.html public/favicon.svg public/og-image.png _legacy/og-image.png docs/BRANDMARK-ROLLOUT.md NEXT.md LINEAGE.md
git commit -m "brand(logo): BreakLabs BrandMark (D-19) — GenAI Systems lockup, 7 slots + favicon + OG; archive old OG"
git push origin main
```
_`git tag pre-brandmark-d19` is the D-18 recoverable point. `PENDING_APPROVALS.md` stays untracked unless you want it committed._

### Notes / gotchas
- `git push` auto-deploys to Vercel — that's why build+QA happen on the Mac first.
- Descriptor accent is themeable (`var(--gal-build)`): cyan `#22D3EE` in the default dark theme (per spec), violet in the cream light theme (contrast-safe). If you want hard cyan everywhere, say so.
- Per `BreakLabs/CLAUDE.md`: full repo path, clear `.git/*.lock` before staging, build on macOS, approve-first, never auto-push.

---

## ⏳ FOR HQ MERGE — GSL UI-inventory pass (22 Jun 2026, sprint 83)

**Scope:** Inventory GSL's reusable UI components into the shared design registry. **Read-only — no UI/code changed.**

**Status:** GSL section appended to **`HQ/DESIGN-STANDARD.md`** (HQ-owned; not a git repo → nothing to push). Awaiting HQ to merge GSL's inputs into the master best-of-breed table and rule (D-13).

### What was done
- Appended "GSL — UI inventory" to `HQ/DESIGN-STANDARD.md`: full component table (shared vs unique), best-of-breed nominations, and GSL's inputs to the master tbd rows.
- **Best-of-breed nominated:** (1) GT KNOW depth renderer (`Block`/`PostDetail`/`CodeBlock`) — confirms master pick; (2) `GateOverlay` → shared paywall/access-gate; (3) `FidelityBadge` → unique→propagate honesty-disclosure primitive (proposed new registry row).
- GSL `LINEAGE.md` (Sprint 83) noted. No `src/` touched.

### Read for approval
- `HQ/DESIGN-STANDARD.md` → "GSL — UI inventory" section (the deliverable).

### Open decision (HQ)
- [ ] Merge GSL's inputs into the master table; rule the paywall/search/progress/JUDGE-MCQ best-of-breed; accept/reject the `FidelityBadge` propagate + new "honesty-disclosure" row.

### Proposed push (only if you want the GSL LINEAGE/PENDING trail committed — the deliverable itself lives in HQ, no push)
```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add LINEAGE.md && \
git commit -m "docs(lineage): UI-inventory pass → HQ design registry (read-only, no code)" && \
git push origin main
```
_(`HQ/DESIGN-STANDARD.md` is at the BreakLabs root — not a git repo — so the registry edit is saved to the folder, nothing to push. `PENDING_APPROVALS.md` stays untracked.)_

---

## ⏳ AWAITING APPROVAL — Four-frame nav reframe + fluency-sliver spec (22 Jun 2026, sprint 82)

**Scope:** Reorganize GSL's nav to the four frames, dissolve the mislabeled "Fluency" tab, and define GSL's real fluency frame as a small to-build spec. **Reorg/relabel existing surfaces only — no new content, no code bank built (freeze respected).**

**Status:** **Stopped at the spec — `App.jsx` NOT edited.** Same off-ramp as MSL's nav reframe: the change can't be build-verified in the sandbox (Rollup ARM64), `git push` auto-deploys to Vercel, it spans several nav structures + ~5 consumer deep-links, and DEC-15 sequences the overhaul for later. On approval the implementation is a mechanical macOS commit.

### What was done
1. **`docs/NAV-REFRAME-SPEC.md`** (new) — target frame IA (frames top-level; challenge areas → secondary "by domain" lens); placement table for all 29 routable surfaces (primary + secondary); the **8-module Fluency dissolution** (Phrase Bank/Flashcards/Timed Drills/Mock Interview → ⊗ Communication; Company Cases + Readiness Check → ④ Judgment; Prompt Engineering + Prompt Challenges → ② Fluency seed); the **fluency to-build spec** (§5); exact mechanical `App.jsx`/`Fluency.jsx` edits + macOS build/QA/push checklist.
2. **`docs/FOUR-FRAME-AUDIT.md`** — addendum recording the dissolution + the now-defined fluency frame.
3. **`NEXT.md`** (Sprint 82) + **`LINEAGE.md`** (Sprint 82) updated.

### The fluency frame, now honestly marked (seeded + TO-BUILD)
Narrow, domain-specific: deterministic LLM-systems code in Pyodide (chunker, retrieval/rerank glue, structured-output parse+validate, agent tool-loop w/ stop, eval scorers incl. LLM-as-judge math, cosine), with **mocked model output as the failure injector**. Mostly a secondary "now fix it in code" layer on existing judgment surfaces; gradeable prompt forms only; **general code/algorithms/SQL delegated to PSL**. Seed surfaces (Prompt Engineering, Prompt Challenges) exist now; code sliver spec'd not built — frame is not hollow, not faked.

### Read these for approval (in order)
- `docs/NAV-REFRAME-SPEC.md` — the spec (main read). §2 IA, §3 placement, §4 Fluency dissolution, §5 fluency spec, §6 build/QA.
- `docs/FOUR-FRAME-AUDIT.md` §5 + addendum — the proposal it implements.
- `NEXT.md` (Sprint 82, top) · `LINEAGE.md` (Sprint 82, bottom).

### Open decisions (need your call)
- [ ] **Approve the spec** → I make the `App.jsx` + `Fluency.jsx` edits and hand you the macOS build/push (no content touched).
- [ ] **Frame labels:** confirm GSL keeps the model's words (Foundations/Fluency/Ownership/Judgment) or adopt MSL's KNOW/DO/BUILD/JUDGE — **HQ call, `LEDGER.md ⊥ pending HQ`.**
- [ ] **Sequencing override:** confirm running this IA reframe ahead of DEC-15's "after distribution keystone."
- [ ] **Fluency code sliver:** build it after PSL's general-code bank exists (so the PSL delegation link is real)?

### Proposed push (Sidharth runs after review — never auto-pushed)
```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add docs/NAV-REFRAME-SPEC.md docs/FOUR-FRAME-AUDIT.md NEXT.md LINEAGE.md && \
git commit -m "docs(nav): four-frame nav reframe + fluency-sliver spec for GSL — propose-only, no code, freeze respected" && \
git push origin main
```
_(Spec docs only. The `App.jsx`/`Fluency.jsx` nav edit is a separate, post-approval commit with its own macOS build — see `docs/NAV-REFRAME-SPEC.md` §6. `PENDING_APPROVALS.md` stays untracked unless you want it committed.)_

### Notes / gotchas
- No `App.jsx`/`Fluency.jsx`/content touched — docs only. The nav code edit happens only after you approve the spec.
- Per `BreakLabs/CLAUDE.md`: full repo path, clear `.git/*.lock` before staging, build on macOS only, approve-first, never auto-push.

---

## ⏳ AWAITING APPROVAL — Four-Frame Reframe Audit (read-only / propose-only) (22 Jun 2026, sprint 81)

**Scope:** Audit GSL's existing surface against the Competence Model (`HQ/COMPETENCE-MODEL.md`, DEC-15) — map every tab/engine/content type to the four frames, find thin frames, **propose** an IA reframe. **Read-only: no nav rebuilt, no content added, no code touched.**

**Status:** Audit written. Restructure **NOT built** (propose-only, gated behind the content freeze + distribution keystone). Prepared as a PROPOSED PUSH. Not pushed.

### What was done
- **`docs/FOUR-FRAME-AUDIT.md`** — surface inventory (14 tabs + Learning Paths + 320-post/30-series GT corpus), per-item frame tags (primary+secondary), per-frame coverage table, gap report, propose-only IA reframe, DEC-15 build-order.
- **Verdict:** GSL is a **barbell** — DEEP recall+depth + DEEP judgment, **fluency near-MISSING** (no code-authoring bank; the "Fluency" tab is actually *communication*), **ownership scaffold-only** (capture is Career OS's). Headline gap: the fluency rung is broken — judgment is tested heavily but never trained.
- **Build order proposed (per DEC-15):** relabel depth (free) → build the fluency problem bank first → thicken ownership scaffold → nest (don't grow) judgment.
- Close-out: `NEXT.md` (Sprint 81 entry) + `LINEAGE.md` (Sprint 81 entry) updated.

### Read for approval
- `labs/genai-systems-lab/docs/FOUR-FRAME-AUDIT.md` (the deliverable — main read)
- `HQ/COMPETENCE-MODEL.md` + `HQ/DECISIONS.md` (DEC-15) for the model it's audited against
- `labs/genai-systems-lab/NEXT.md` (Sprint 81, top) · `LINEAGE.md` (Sprint 81, bottom)

### Proposed push (Sidharth runs after review — never auto-pushed)
```bash
cd "/Users/ASUS/Documents/Professional/BreakLabs/labs/genai-systems-lab"
rm -f .git/index.lock .git/HEAD.lock
git add docs/FOUR-FRAME-AUDIT.md NEXT.md LINEAGE.md
git commit -m "docs(audit): four-frame (DEC-15) reframe audit of GSL — propose-only, no restructure built"
git push origin main
```
_(`PENDING_APPROVALS.md` is an untracked working doc — left out of the commit unless you want it tracked.)_

### Open decision
- [ ] Approve the audit's reading of GSL, and whether the proposed reframe + fluency-first build order is the plan when the freeze lifts.

---

## ⏳ AWAITING APPROVAL — Build Session A: PixelRAG + Headroom GT posts (22 Jun 2026)

**Scope:** Two LinkedIn / Ground-Truth posts for the BreakLabs LinkedIn pipeline — PixelRAG (embeddings-series finale) + Headroom (context-engineering / token-compression). **Content/distribution only. No lab features built — GenAI content freeze respected.**

**Status:** Code + docs written and build-verified. Prepared as a PROPOSED PUSH. **Not pushed. Headroom visual not rendered (held at content-first gate).**

### What was done

1. **PixelRAG GT post** — `pixelrag-visual-document-rag` added to `groundTruthPosts.js` + `groundTruthIndex.js` (series `nlp-origins`, the embeddings-arc finale: word2vec → attention → BERT → sentence-transformers → PixelRAG). Grounded in the 2025 paper (*Web Screenshots Beat Text for RAG*; Berkeley/Princeton/EPFL/Databricks/Renmin). Honest: framed as a **frontier tool, not a default**, with a reach-for-it / skip-it table; every figure (8.28M pages / ~30M screenshots; up to 18.1% over text baselines; ~3× token cut) attributed as the **authors' reported result**. LinkedIn visual = **reuse of the existing ep5 carousel** (no new render).
2. **Headroom GT post** — `headroom-context-compression` added (series `llmops`). Honest **third-party** teardown of `chopratejas/headroom` (Apache-2.0): why raw tool outputs / RAG chunks burn tokens, type-aware compression (60–95% fewer tokens), reversible CCR, and **where it breaks** — lossy compression on precise data → silent wrong answers. Vendor benchmarks labelled vendor-reported.
3. **Content Master Tracker updated** — row #25 (PixelRAG: caption + ep5 visual path) and row #26 (Headroom: new backlog row, caption + visual TBD). **No dates assumed** — both stay backlog / Idea.
4. **GenAI close-out** — `NEXT.md` bumped to Sprint 80 (320 GT entries/pages, freeze restated); `LINEAGE.md` appended.
5. **Build verified** — `node --check` clean on both src files; `prerender-gt.js` regenerated 320 SSR pages incl. both new pages + sitemap. (vite/rollup step fails **only** in the Linux sandbox — missing `@rollup/rollup-linux-arm64-gnu` — not a code issue; builds on macOS.)

### Read these for approval (in order)

**The two posts (the actual content to vet):**
- `labs/genai-systems-lab/src/groundTruthPosts.js` → keys `"pixelrag-visual-document-rag"` and `"headroom-context-compression"` (the post bodies — this is the main read)
- `labs/genai-systems-lab/src/groundTruthIndex.js` → last two entries (titles, desc, tags, series, related)

**The LinkedIn captions + schedule:**
- `growth/linkedin/Content Master Tracker.xlsx` → **Content Calendar** sheet, rows **#25 (PixelRAG)** and **#26 (Headroom)** → "Caption (full)" column

**The reused visual (PixelRAG):**
- `growth/linkedin/visuals/embeddings/ep5_pixelrag/` → `_CONTACT_SHEET.png` (7-slide carousel) + `pixelrag-embeddings-finale.pdf`

**The close-out / context:**
- `labs/genai-systems-lab/NEXT.md` → Sprint 80 entry (top)
- `labs/genai-systems-lab/LINEAGE.md` → Sprint 80 entry (bottom)

### Honesty / standard checks already enforced
- No experience implied that isn't his; Headroom explicitly flagged as a third-party tool, not his.
- No unverified perf numbers — PixelRAG figures verified against the primary paper PDF and attributed; Headroom figures attributed as vendor-reported. Used the paper's ~3× (not third-party "10×") token-cut claim.
- Visuals obey Glass Box + the visual-real-estate rule (PixelRAG ep5 carousel reused; Headroom visual deferred to content-first gate, not rendered).

### Proposed push (Sidharth runs after review — never auto-pushed)
```bash
cd "/Users/ASUS/Documents/Professional/BreakLabs/labs/genai-systems-lab"

# 0. clear stale lock left by the interrupted sandbox session
rm -f .git/index.lock

# 1. discard sandbox sitemap churn; the local build regenerates it cleanly
git checkout -- public/sitemap.xml

# 2. rebuild locally (regenerates SSR pages + sitemap deterministically on macOS)
npm run build

# 3. review the real change
git diff src/groundTruthIndex.js src/groundTruthPosts.js NEXT.md LINEAGE.md
git status --short

# 4. stage + commit
git add src/groundTruthPosts.js src/groundTruthIndex.js NEXT.md LINEAGE.md public/sitemap.xml
git commit -m "content(gt): add PixelRAG (embeddings finale) + Headroom GT posts — distribution only, freeze respected"

# 5. push
git push origin main
```

### Notes / gotchas
- `public/gt/` is **gitignored** (regenerated at deploy) — the real change is the 2 `src` files + `NEXT.md` + `LINEAGE.md`; `public/sitemap.xml` is build-generated.
- A **stale `.git/index.lock`** exists in the genai repo (the sandbox couldn't remove it — VM perms). `rm -f .git/index.lock` before committing.
- The Content Master Tracker showed a `.~lock` — it may be open in LibreOffice/Excel. Close + reopen so the caption writes aren't overwritten on save.
- This file (`PENDING_APPROVALS.md`) is untracked in the genai repo and **does not need to be committed** — it's a working controller doc, not shipped content.

### Open decisions (need your call)
- [ ] **Approve + push** the two GT posts (commands above).
- [ ] **Headroom LinkedIn visual** — not rendered yet (content-first gate). Proposed: a Glass-Box before/after annotation card (raw 65,694-token dump → 5,118, break-annotation on a dropped exact value). Say go and I render once; then I set tracker #26 Visual File/Path.
- [ ] **Dates** — both posts remain backlog/Idea. Assign target dates when you want them in the calendar.

---

## ✅ History (approved / actioned)

_(none yet)_
