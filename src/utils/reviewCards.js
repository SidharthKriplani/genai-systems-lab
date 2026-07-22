// reviewCards — user-created cloze review cards, born from "+ Add to review"
// on a painted highlight (Q3 Wave A item 1, GSL — 2026-07-23). A card is a
// short passage with its highlighted term hidden (cloze), fed into
// Review.jsx's existing spaced-repetition queue as a third `source` alongside
// "concept" and "chain".
//
// Storage shape mirrors MSL's reviewCards.js / this lab's own
// localHighlights.js / stickyNotes.js on purpose — { [pageKey]: [ {id, ts,
// ...} ] } + a parallel tombstone array — so this store plugs directly into
// the existing annotationsSync.js per-item merge (mergeAnnotationBlobs/
// applyAnnotationMerge) with ZERO new sync logic: just registering the
// (store, tomb) key pair in supabase.js's module-scope ANNOT_PAIRS + adding
// both keys to SYNC_KEYS, exactly like gsl_page_highlights_v1 and
// lab-stickies-v1 already do.
//
// pageKey is `fnd::${gymId}::${moduleId}` — the SAME pageKey
// HighlightPopover.jsx already uses for the highlight a card is created
// from, so a card and its source highlight always live in the same sync
// bucket.
//
// DEVIATION from MSL's copy, approved (2026-07-23 ruling): this file does
// NOT track reviews/lastReviewed on the card. GSL's Review.jsx already
// centralizes ALL spaced-repetition scheduling for every source (concept,
// chain, and now hlcard) in one shared blob, `gsl-review-schedule`, keyed by
// itemKey(source, id) — see Review.jsx's buildItem()/handleGrade(). Cards
// therefore carry only their CONTENT (term/prefix/suffix); Review.jsx reads
// gsl-review-schedule directly for the reviews/lastReviewed counters, same
// as it already does for the other two sources. No markCardReviewed()
// export here — there is nothing schedule-related for this file to own.

const KEY = 'gsl-review-cards-v1'
export const CARD_STORE_KEY = KEY
export const CARD_TOMB_KEY = 'gsl-review-cards-v1-tomb-v1'

function writeCardTombstones(pageKey, ids) {
  if (!ids.length) return
  try {
    const arr = JSON.parse(localStorage.getItem(CARD_TOMB_KEY) || '[]')
    const now = Date.now()
    for (const id of ids) arr.push({ k: pageKey, id, ts: now })
    localStorage.setItem(CARD_TOMB_KEY, JSON.stringify(arr.slice(-800)))
  } catch { /* ignore */ }
}

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {} } catch { return {} }
}
function writeAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { /* ignore */ }
  // Review.jsx listens for this to refresh its queue (see writeSchedule in
  // Review.jsx) — reuse it so a newly-added card shows up without a reload.
  try { window.dispatchEvent(new CustomEvent('gsl_review')) } catch { /* SSR */ }
  // Debounced cross-device push trigger — same event stickyNotes.js /
  // localHighlights.js already dispatch on every write (see App.jsx's
  // `annotations-changed` listener -> pushProgress).
  try { window.dispatchEvent(new CustomEvent('annotations-changed')) } catch { /* SSR */ }
}

export function listCards(pageKey) {
  return readAll()[pageKey] || []
}

// Every card across every page/module — what Review.jsx needs to build its
// cross-source due/later queue (mirrors how it already scans mastered
// Concepts modules + completed case chains).
export function listAllCards() {
  const all = readAll()
  const out = []
  for (const pageKey of Object.keys(all)) {
    for (const c of all[pageKey] || []) out.push({ ...c, pageKey })
  }
  return out
}

export function addCard(pageKey, card) {
  const all = readAll()
  all[pageKey] = [...(all[pageKey] || []), { ...card, ts: card.ts || Date.now() }]
  writeAll(all)
}

export function removeCard(pageKey, id) {
  const all = readAll()
  const arr = all[pageKey] || []
  writeCardTombstones(pageKey, arr.filter(c => c.id === id).map(c => c.id))
  all[pageKey] = arr.filter(c => c.id !== id)
  if (!all[pageKey].length) delete all[pageKey]
  writeAll(all)
}
