# _legacy — archived surfaces

These components were archived on **2026-07-03** as part of the GSL consolidation
plan (`docs/GSL_MASTER_PLAN.md`, Phase 0.1 de-clutter). They were determined to be
**off-mission for AIE (AI Engineer) interview prep** and removed from the live app.

Nothing in the running app imports these files. They are kept here (not deleted) so
they can be **restored** later if needed — the change is fully reversible.

## Archived files

| File | Was reached via | Why archived |
|------|-----------------|--------------|
| `Consultation.jsx` | `App.jsx` lazy import `ConsultationApp`, rendered at `topView === "consult"` (hash `#consult`) | "Ask / Search" consultation surface — off-mission for interview prep |
| `WarRoom.jsx` | `App.jsx` secret easter-egg (type `business2026` in any BUILD tab) opened it as a modal | Hidden business/strategy overlay — not part of AIE prep |

## What was removed from live code (all in `src/App.jsx` unless noted)

- `import WarRoom from "./WarRoom"` and `const ConsultationApp = lazy(() => import("./Consultation"))`
- WarRoom modal state/refs (`warRoomOpen`, `warRoomOpenRef`, `topViewRef`, `seqBuf`) and the
  entire `business2026` key-sequence `useEffect` that triggered it
- The WarRoom render (`{warRoomOpen && <WarRoom … />}`) and the Consultation render
  (`{topView === "consult" && <ConsultationApp … />}`)
- `consult` entries in `VALID_VIEWS`, `SHORTCUT_TABS`, `TAB_FRAME`, `TAB_TITLES`, and the
  commented-out KNOW nav item
- Added `HASH_REDIRECTS` entries so old deep-links no longer 404:
  `consult: "home"`, `warroom: "home"`

## Restoring

1. Move the file back: `git mv src/_legacy/<File>.jsx src/<File>.jsx`
2. In `Consultation.jsx`, revert the import path `../groundTruthIndex` → `./groundTruthIndex`.
3. Re-add the import, render branch, and (for Consultation) the `VALID_VIEWS` / redirect entries in `App.jsx`.

## Note — files NOT archived (still in use by protected surfaces)

`IndiaScale.jsx`, `MLCiCd.jsx`, `InferenceOptimizer.jsx`, `ModelRouter.jsx`, and
`SalaryCalculator.jsx` were candidates but are **still imported by DO-NOT-TOUCH files**
(`Systems.jsx` imports the first four; `GroundTruth.jsx` imports `SalaryCalculator`).
They were left in `src/` and only their **Career.jsx** usage of `SalaryCalculator` was cut.
