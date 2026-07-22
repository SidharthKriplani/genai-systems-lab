// src/config/nav.js — Navigation constants for GenAI Systems Lab
// Single source of truth for tab definitions, group colors, and nav group structure.
// Change tab labels, groups, or counts here — App.jsx reads from this file.

// ─── R1 redesign: challenge-layer nav (Sprint 49) ────────────────────────────
// Primary nav: 8 items. Challenge areas replace the old BUILD group.
// Labs, Systems, Concepts, Career, AI Product remain hash-accessible (not deleted).


// DS-1b (2026-07-22): ALL_TABS and GROUP_COLORS both confirmed fully dead (grep across
// src/ found zero uses of either beyond this file's own export and App.jsx's now-removed
// import). Removed. The live nav is entirely in App.jsx's NAV_SECTIONS/NAV_TRACK/NAV_DOMAINS.
// This file is kept only as a stub in case something still imports from it by path.
