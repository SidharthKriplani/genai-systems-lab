// src/utils/highlightColors.js — shared 4-color palette for the
// highlight-to-track feature (HighlightPopover.jsx + MyTracks.jsx).
// Matches GSL's existing badge palette (difficulty badges use exactly these
// emerald/amber/red hexes; violet is the app's primary accent) so highlights
// look native rather than introducing new brand colors.

export const HIGHLIGHT_COLORS = [
  { id: 'violet',  hex: '#a78bfa', label: 'Violet'  },
  { id: 'emerald', hex: '#34d399', label: 'Emerald' },
  { id: 'amber',   hex: '#fbbf24', label: 'Amber'   },
  { id: 'red',     hex: '#f87171', label: 'Red'     },
]

export function highlightColorHex(id) {
  return HIGHLIGHT_COLORS.find(c => c.id === id)?.hex || HIGHLIGHT_COLORS[0].hex
}
