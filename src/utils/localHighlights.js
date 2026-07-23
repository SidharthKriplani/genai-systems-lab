// localHighlights — marker-pen highlights over lab content.
// v3 (2026-07-23, F4): CSS Custom Highlight API port. Highlights paint as
// browser-native ::highlight() ranges registered in CSS.highlights — ZERO DOM
// mutation. The old <mark>-wrapping path (v2) mutated text nodes under
// React's feet; when React reconciled over the mutated tree it threw
// insertBefore/removeChild "not a child of this node" and the tab crashed
// (the auto-heal boundary family existed to contain exactly this). With
// native ranges the crash class is impossible: React re-renders freely, our
// ranges just go stale and a MutationObserver rebuilds them ~180ms later.
// The legacy <mark> path is retained ONLY as a fallback for engines without
// the API; 2026 Chrome/Safari/Firefox all take the native path.
//
// A highlight = { id, text, n, color } where n = which occurrence of text
// inside the container's text stream. Robust to re-renders of the SAME
// content; if content changes so the nth occurrence no longer exists, it
// silently doesn't paint (never guesses).

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
    try { window.dispatchEvent(new CustomEvent('annotations-changed')) } catch { /* SSR */ }
  } catch { /* ignore */ }
}

// Ids match the swatch palette (highlightColors.js); legacy ids resolvable.
const FAINT = {
  sky:     'rgba(56,189,248,0.38)',
  pink:    'rgba(244,114,182,0.38)',
  lime:    'rgba(163,230,53,0.36)',
  orange:  'rgba(251,146,60,0.40)',
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
  try { window.dispatchEvent(new CustomEvent('annotations-changed')) } catch { /* SSR */ }
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
  // Removing by id also removes every entry anchored to the same (text, n)
  // (2026-07-22 duplicate-accretion fix).
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

// ── Native path (CSS Custom Highlight API) ──────────────────────────────────
const NATIVE = typeof CSS !== 'undefined' && typeof Highlight !== 'undefined' && 'highlights' in CSS

const paintedByContainer = new Map() // Element -> Map<id, { color, range }>
const observers = new Map()          // Element -> { obs, pageKey, timer }

let stylesInjected = false
function ensureStyles() {
  if (!NATIVE || stylesInjected || typeof document === 'undefined') return
  const s = document.createElement('style')
  s.id = 'gsl-hl-native-styles'
  s.textContent = Object.keys(FAINT)
    .map(function (k) { return '::highlight(gsl-hl-' + k + ') { background-color: ' + FAINT[k] + '; }' })
    .join('\n')
  document.head.appendChild(s)
  stylesInjected = true
}

// Rebuild the global CSS.highlights registry from every container's painted
// ranges. One Highlight object per color name; disconnected containers are
// pruned here.
function rebuildRegistry() {
  if (!NATIVE) return
  const byColor = {}
  for (const [el, m] of paintedByContainer) {
    if (!el.isConnected) { paintedByContainer.delete(el); continue }
    for (const entry of m.values()) {
      if (entry.range.collapsed) continue
      const key = FAINT[entry.color] ? entry.color : 'amber'
      if (!byColor[key]) byColor[key] = []
      byColor[key].push(entry.range)
    }
  }
  for (const name of Object.keys(FAINT)) {
    const ranges = byColor[name]
    if (ranges && ranges.length) CSS.highlights.set('gsl-hl-' + name, new Highlight(...ranges))
    else CSS.highlights.delete('gsl-hl-' + name)
  }
}

// Build a live Range for a stored highlight: locate the nth occurrence of
// hl.text in the container's text stream, then map absolute offsets onto the
// current text nodes. Same walker discipline the legacy paintOne uses.
function buildRange(container, hl) {
  const full = container.textContent || ''
  let start = -1
  for (let k = 0, i = -1; k <= hl.n; k++) {
    i = full.indexOf(hl.text, i + 1)
    if (i === -1) return null // content changed; skip silently
    start = i
  }
  const end = start + hl.text.length
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let abs = 0, node, startNode = null, startOff = 0, endNode = null, endOff = 0
  while ((node = walker.nextNode())) {
    const len = node.textContent.length
    if (!startNode && abs + len > start) { startNode = node; startOff = start - abs }
    if (abs + len >= end) { endNode = node; endOff = end - abs; break }
    abs += len
  }
  if (!startNode || !endNode) return null
  const r = document.createRange()
  try { r.setStart(startNode, startOff); r.setEnd(endNode, endOff) } catch { return null }
  return r
}

function schedule(container, entry) {
  if (entry.timer) clearTimeout(entry.timer)
  entry.timer = setTimeout(function () {
    entry.timer = null
    if (!container.isConnected) {
      if (entry.obs) entry.obs.disconnect()
      observers.delete(container)
      paintedByContainer.delete(container)
      rebuildRegistry()
      return
    }
    applyAll(container, entry.pageKey)
  }, 180)
}

let syncListenerOn = false
function ensureSyncListener() {
  if (syncListenerOn || typeof window === 'undefined') return
  syncListenerOn = true
  // Cross-device pull-merges and local add/removes dispatch this; repaint
  // every observed container so remote highlights appear without a nav.
  window.addEventListener('annotations-changed', function () {
    for (const [el, entry] of observers) schedule(el, entry)
  })
}

// React re-renders replace text nodes, which silently kills our ranges (no
// crash — that is the whole point). The observer rebuilds them. Our own
// painting never mutates the DOM, so this cannot feed back into itself.
function ensureObserver(container, pageKey) {
  if (!NATIVE) return
  ensureSyncListener()
  const existing = observers.get(container)
  if (existing) { existing.pageKey = pageKey; return }
  const entry = { obs: null, pageKey: pageKey, timer: null }
  const obs = new MutationObserver(function () { schedule(container, entry) })
  obs.observe(container, { childList: true, subtree: true, characterData: true })
  entry.obs = obs
  observers.set(container, entry)
}

// Painted-range lookups for click handling (no <mark> nodes to closest() on).
export function hitHighlight(container, x, y) {
  if (!NATIVE) {
    const el = typeof document !== 'undefined' ? document.elementFromPoint(x, y) : null
    const m = el && el.closest ? el.closest('mark[data-hl-id]') : null
    if (m && container.contains(m)) {
      return { id: m.getAttribute('data-hl-id'), rect: m.getBoundingClientRect() }
    }
    return null
  }
  const m = paintedByContainer.get(container)
  if (!m) return null
  for (const [id, entry] of m) {
    const rects = entry.range.getClientRects()
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i]
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return { id: id, rect: entry.range.getBoundingClientRect() }
      }
    }
  }
  return null
}

export function getPaintedRange(container, id) {
  if (!NATIVE) {
    const marks = container.querySelectorAll('mark[data-hl-id="' + id + '"]')
    if (!marks.length) return null
    const r = document.createRange()
    r.setStartBefore(marks[0])
    r.setEndAfter(marks[marks.length - 1])
    return r
  }
  const m = paintedByContainer.get(container)
  const entry = m ? m.get(id) : null
  return entry ? entry.range : null
}

// ── Legacy <mark> path (non-supporting engines only) ────────────────────────
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
  // Dedupe migration (2026-07-22) + optimistic lock (2026-07-23 flicker fix:
  // only persist if the bucket still matches what we read, so a concurrent
  // cross-device pull-merge write is never clobbered).
  const arr = listHighlights(pageKey)
  const seen = new Map()
  for (const h of arr) seen.set(h.text + ' ' + h.n, h)
  if (seen.size !== arr.length) {
    const fresh = readAll()
    if (JSON.stringify(fresh[pageKey] || []) === JSON.stringify(arr)) {
      fresh[pageKey] = [...seen.values()]
      writeAll(fresh)
    }
  }
  if (NATIVE) {
    ensureStyles()
    const m = new Map()
    paintedByContainer.set(container, m)
    for (const hl of listHighlights(pageKey)) {
      const range = buildRange(container, hl)
      if (range) m.set(hl.id, { color: hl.color, range })
    }
    rebuildRegistry()
    ensureObserver(container, pageKey)
    return
  }
  clearPainted(container)
  for (const hl of listHighlights(pageKey)) paintOne(container, hl)
}

export function unpaint(container, id) {
  if (!container) return
  if (NATIVE) {
    const m = paintedByContainer.get(container)
    if (m) { m.delete(id); rebuildRegistry() }
    return
  }
  container.querySelectorAll('mark[data-hl-id="' + id + '"]').forEach(m => {
    const parent = m.parentNode
    while (m.firstChild) parent.insertBefore(m.firstChild, m)
    parent.removeChild(m)
    parent.normalize()
  })
}
