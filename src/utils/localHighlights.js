// localHighlights — in-place marker-pen highlights over lab content.
// Ported from MSL (2026-07-16). A highlight = { id, text, n, color } where
// n = which occurrence of `text` inside the container's text stream. Robust to
// re-renders of the SAME content; if the content changes so the nth occurrence
// no longer exists, it silently doesn't paint (never guesses). Wrapping touches
// TEXT NODES only; callers re-apply via applyAll after content settles.

const KEY = 'gsl_page_highlights_v1'
export const HL_STORE_KEY = KEY
export const HL_TOMB_KEY = 'gsl_page_highlights_v1-tomb-v1'

// Cross-device sync (2026-07-22): deletes leave tombstones so a pull-merge
// never resurrects a highlight removed on another device.
function writeHlTombstones(pageKey, ids) {
  try {
    const arr = JSON.parse(localStorage.getItem(HL_TOMB_KEY) || '[]')
    const now = Date.now()
    for (const id of ids) arr.push({ k: pageKey, id, ts: now })
    localStorage.setItem(HL_TOMB_KEY, JSON.stringify(arr.slice(-800)))
  } catch { /* ignore */ }
}

// 2026-07-22 fix: ids now match the swatch palette (highlightColors.js uses
// violet/emerald/amber/red -- the old gold/teal/green keys matched NOTHING, so
// every color fell back to gold). Alphas raised ~0.26 -> ~0.42: the old marks
// sank into the dark background. Legacy ids kept resolvable.
const FAINT = {
  violet:  'rgba(167,139,250,0.42)',
  emerald: 'rgba(52,211,153,0.40)',
  amber:   'rgba(251,191,36,0.44)',
  red:     'rgba(248,113,113,0.40)',
  gold:    'rgba(251,191,36,0.44)',
  teal:    'rgba(64,190,190,0.40)',
  green:   'rgba(52,211,153,0.40)',
}

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {} } catch { return {} }
}
function writeAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { /* ignore */ }
}

export function listHighlights(pageKey) {
  return readAll()[pageKey] || []
}
export function addHighlight(pageKey, hl) {
  const all = readAll()
  all[pageKey] = [...(all[pageKey] || []), hl.ts ? hl : { ...hl, ts: Date.now() }]
  writeAll(all)
}
export function removeHighlight(pageKey, id) {
  const all = readAll()
  const arr = all[pageKey] || []
  // 2026-07-22 fix: repeated swatch clicks used to accrete DUPLICATE entries
  // for the same (text, n) -- only one ever painted, so "Remove" killed the
  // painted one and a hidden twin resurrected it on the next repaint. Removing
  // by id now also removes every entry anchored to the same (text, n).
  const target = arr.find(h => h.id === id)
  const removed = arr.filter(h => h.id === id || (target && h.text === target.text && h.n === target.n))
  writeHlTombstones(pageKey, removed.map(h => h.id))
  all[pageKey] = arr.filter(h => h.id !== id && !(target && h.text === target.text && h.n === target.n))
  if (!all[pageKey].length) delete all[pageKey]
  writeAll(all)
}

// Which occurrence of the selected text is this selection, within container?
export function occurrenceOfSelection(container, text) {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0
  const range = sel.getRangeAt(0)
  let abs = 0
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    if (node === range.startContainer) { abs += range.startOffset; break }
    abs += node.textContent.length
  }
  const before = (container.textContent || '').slice(0, abs)
  let n = 0, i = -1
  while ((i = before.indexOf(text, i + 1)) !== -1) n++
  return n
}

function clearPainted(container) {
  container.querySelectorAll('mark[data-hl-id]').forEach(m => {
    const parent = m.parentNode
    while (m.firstChild) parent.insertBefore(m.firstChild, m)
    parent.removeChild(m)
    parent.normalize()
  })
}

function paintOne(container, hl) {
  const full = container.textContent || ''
  let start = -1
  for (let k = 0, i = -1; k <= hl.n; k++) {
    i = full.indexOf(hl.text, i + 1)
    if (i === -1) return // content changed; skip silently
    start = i
  }
  const end = start + hl.text.length
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let abs = 0
  const jobs = []
  let node
  while ((node = walker.nextNode())) {
    const len = node.textContent.length
    const nStart = abs, nEnd = abs + len
    if (nEnd > start && nStart < end) {
      jobs.push({ node, from: Math.max(0, start - nStart), to: Math.min(len, end - nStart) })
    }
    abs = nEnd
    if (abs >= end) break
  }
  for (const { node: tn, from, to } of jobs) {
    if (tn.parentNode && tn.parentNode.closest && tn.parentNode.closest('mark[data-hl-id]')) continue
    const target = tn.splitText ? tn : null
    if (!target) continue
    let seg = target
    if (from > 0) seg = seg.splitText(from)
    if (to - from < seg.textContent.length) seg.splitText(to - from)
    const mark = document.createElement('mark')
    mark.setAttribute('data-hl-id', hl.id)
    mark.className = 'gsl-hl'
    mark.style.background = FAINT[hl.color] || FAINT.amber
    mark.style.color = 'inherit'
    mark.style.borderRadius = '3px'
    mark.style.cursor = 'pointer'
    seg.parentNode.replaceChild(mark, seg)
    mark.appendChild(seg)
  }
}

// Idempotent full repaint for a page's container.
export function applyAll(container, pageKey) {
  if (!container) return
  // 2026-07-22 dedupe migration: collapse (text, n) duplicates accreted by the
  // old add-per-swatch-click behavior -- LAST one wins (newest color pick),
  // and the cleanup is persisted so old debris can never resurrect a deleted
  // highlight again. Idempotent.
  const arr = listHighlights(pageKey)
  const seen = new Map()
  for (const h of arr) seen.set(h.text + '\u0000' + h.n, h)
  if (seen.size !== arr.length) {
    const all = readAll()
    all[pageKey] = [...seen.values()]
    writeAll(all)
  }
  clearPainted(container)
  for (const hl of listHighlights(pageKey)) paintOne(container, hl)
}

export function unpaint(container, id) {
  if (!container) return
  container.querySelectorAll(`mark[data-hl-id="${id}"]`).forEach(m => {
    const parent = m.parentNode
    while (m.firstChild) parent.insertBefore(m.firstChild, m)
    parent.removeChild(m)
    parent.normalize()
  })
}
