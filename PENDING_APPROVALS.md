# PENDING_APPROVALS

_Controller-facing approval queue for the GenAI Systems Lab. Each entry is a completed build awaiting Sidharth's review + push (or a render go-ahead). Nothing here has been auto-pushed. Read the linked files, approve, then run the proposed commands. Append new entries on top; move to the History section once actioned._

---

## ✅ NO OPEN ITEMS — sprint 90 closed (24 Jun 2026)

All three monochrome-theme slices are committed + pushed; `origin/main` == HEAD (0 ahead / 0 behind), live on Vercel. Next-session work is the non-blocking list in `NEXT.md` (Layer-C viz tokenisation → guard `--strict`; 3D embeddings instrument).

_Only the lab md spine (`NEXT` / `PENDING_APPROVALS` / `LINEAGE` / `IDEAS`) has uncommitted statefulness edits — a docs-only commit, no build needed._

---

## ✅ History (approved / actioned)

- **App-wide rail kill + GT muted hues (sprint 90, 24 Jun)** — 6 left `inset Npx 0 0` rails + 66 decorative top `borderTop` accent bars → neutral hairlines across 18 files (semantic green/red pass-fail accents kept); GT series cards → muted per-area hues. 19 `.jsx`, esbuild-verified. Committed `5b5ba38`; pushed + live.

- **Monochrome instrument theme — base remap + colour guard (sprint 90, 23–24 Jun)** — `src/index.css` MONOCHROME INSTRUMENT block (cold grey ramp overriding warm-brown base; decorative palettes amber/indigo/blue/orange/sky/rose/pink/teal/purple → zinc; red→break, emerald/green→fix faint; frame tokens grey; cyan the lone accent) + `scripts/check-no-hex.mjs` colour guard + `package.json` `check:color`. One appended, reversible block recolours the whole app. Built on Mac + pushed + live (verified in-app). HQ standard locked in `DESIGN-STANDARD.md` ("THE MONOCHROME INSTRUMENT STANDARD").
- **GT cards de-rainbow + nav rail kill (sprint 90, 23–24 Jun)** — `GroundTruth.jsx` SERIES_META/CAT_COLORS → challenge-area greys; `App.jsx` active nav rows → value-based selection (filled row + hairline, no cyan rail), desktop + both mobile drawers. Built on Mac + pushed + live. (Refined same sprint by the OPEN muted-hue + full-rail-kill item above.)

- **DO→SQL link-out fix (23 Jun)** — corrected the DO-rung SQL link to the real PAL SQL Lab (`https://product-analytics-lab.vercel.app/#/sql-lab`). Committed `0d23529` (+ `6ff6725`); pushed + live.
- **Four-frame accordion sidebar — HQ DESIGN-STANDARD (sprint 84, 23 Jun)** — `src/App.jsx`: KNOW/DO/BUILD/JUDGE + PREP&ASSESS accordions (measured-height, one-open-per-level, cyan active pill, frame icons), BY DOMAIN flat lens, SOON marker + ↗ link-outs; desktop + both mobile drawers. Committed `e34aa48`; pushed + live. (Old `NAV_GROUPS` render removed; data left as dead code — cleanup deferred.)
- **BreakLabs logo / BrandMark — D-19 (sprint 83, 23 Jun)** — `BrandMark.jsx` + 7 slots + favicon + rebranded OG; old OG → `_legacy/`; descriptor stacked below the wordmark. Committed `f9d1a15`; pushed + live.
- **GSL UI-inventory pass (sprint 83, 22 Jun)** — appended GSL section to `HQ/DESIGN-STANDARD.md`; HQ merged + ruled the best-of-breed table (GSL won KNOW-renderer / MCQ / progress rows). Actioned (HQ doc, no git push).
- **Four-frame nav reframe + fluency-sliver spec (sprint 82, 22 Jun)** — `docs/NAV-REFRAME-SPEC.md` + `docs/FOUR-FRAME-AUDIT.md` addendum. Committed `b0e6c5a`; pushed. (Implemented in sprint 84.)
- **Four-frame reframe audit (sprint 81, 22 Jun)** — `docs/FOUR-FRAME-AUDIT.md` (read-only). Committed `1229a41`; pushed.
- **PixelRAG + Headroom GT posts (Build Session A, 22 Jun)** — `groundTruthPosts.js` + `groundTruthIndex.js` (+ Content Master Tracker rows #25/#26). Committed `03eb7be`; pushed + live. (Headroom LinkedIn visual still un-rendered — held at the content-first gate; render on go-ahead.)
