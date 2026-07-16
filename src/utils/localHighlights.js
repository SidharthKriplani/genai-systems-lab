// localHighlights — in-place marker-pen highlights over lab content.
// Ported from MSL (2026-07-16). A highlight = { id, text, n, color } where
// n = which occurrence of `text` inside the container's text stream. Robust to
// re-renders of the SAME content; if the content changes so the nth occurrence
// no longer exists, it silently doesn't paint (never guesses). Wrapping touches
// TEXT NODES only; callers re-apply via applyAll after content settles.

const KEY = 'gsl_page_highlights_v1'

const FAINT = {
  gold:  'rgba(232,160,48,0.28)',
  teal:  'rgba(64,190,190,0.26)',
  green: 'rgba(52,211,153,0.24)',
  red:   'rgba(224,80,80,0.26)',
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
  all[pageKey] = [...(all[pageKey] || []), hl]
  writeAll(all)
}
export function removeHighlight(pageKey, id) {
  const all = readAll()
  all[pageKey] = (all[pageKey] || []).filter(h => h.id !== id)
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
    mark.style.background = FAINT[hl.color] || FAINT.gold
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
