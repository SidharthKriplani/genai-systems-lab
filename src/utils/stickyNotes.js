// stickyNotes — floating margin-pin notes over lab content (v1, 2026-07-22).
// Anchoring: a note pins to a content BLOCK via { snippet: first 80 chars of the
// block's text, n: which same-snippet block, dx/dy: offset from block top-left }.
// Survives re-renders of the same content; if the block's text changes so the
// snippet no longer resolves, the note drops into the visible "unanchored" tray
// (never silently lost). Storage: localStorage per pageKey, same pattern as
// localHighlights. Markdown-lite: **bold**, *italic*, `code`, "- " bullets.

const KEY = 'lab-stickies-v1'
export const STICKY_STORE_KEY = KEY
export const STICKY_TOMB_KEY = 'lab-stickies-tomb-v1'

// Cross-device sync (2026-07-22): every delete leaves a tombstone {k, id, ts}
// so annotationsSync's merge can tell "deleted here" from "never seen here" --
// without it, a pull would resurrect every note deleted on another device.
function writeTombstone(pageKey, id) {
  try {
    const arr = JSON.parse(localStorage.getItem(STICKY_TOMB_KEY) || '[]')
    arr.push({ k: pageKey, id, ts: Date.now() })
    localStorage.setItem(STICKY_TOMB_KEY, JSON.stringify(arr.slice(-800)))
    try { window.dispatchEvent(new CustomEvent('annotations-changed')) } catch { /* SSR */ }
  } catch { /* ignore */ }
}

function readAll() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
function writeAll(m) {
  try { localStorage.setItem(KEY, JSON.stringify(m)) } catch { /* full/blocked */ }
  try { window.dispatchEvent(new CustomEvent('annotations-changed')) } catch { /* SSR */ }
}

export function listStickies(pageKey) { return readAll()[pageKey] || [] }

export function saveSticky(pageKey, note) {
  const m = readAll(); const arr = m[pageKey] || []
  const i = arr.findIndex(n => n.id === note.id)
  if (i >= 0) arr[i] = note; else arr.push(note)
  m[pageKey] = arr; writeAll(m)
}

// v2.0 bucket-key migration support: relocate a bucket WITHOUT tombstoning
// (this is relocation, not deletion -- a tombstone here would kill the moved
// notes on every other device at the next merge).
export function takeBucket(pageKey) {
  const m = readAll()
  const arr = m[pageKey] || []
  if (m[pageKey]) { delete m[pageKey]; writeAll(m) }
  return arr
}
export function allBucketKeys() { return Object.keys(readAll()) }

export function deleteSticky(pageKey, id) {
  writeTombstone(pageKey, id)
  const m = readAll()
  m[pageKey] = (m[pageKey] || []).filter(n => n.id !== id)
  if (m[pageKey].length === 0) delete m[pageKey]
  writeAll(m)
}

// v1.6: module-scope read from the DOM. A renderer that knows which module is
// open drops <StickyScope id="m:..."/> (or sets data-sticky-scope on/inside the
// container); the value becomes part of the storage bucket key, so notes can
// NEVER resolve across modules regardless of heading/snippet collisions.
export function scopeOf(container) {
  if (!container) return ''
  if (container.getAttribute && container.hasAttribute && container.hasAttribute('data-sticky-scope')) {
    return container.getAttribute('data-sticky-scope') || ''
  }
  const el = container.querySelector ? container.querySelector('[data-sticky-scope]') : null
  return el ? (el.getAttribute('data-sticky-scope') || '') : ''
}

const BLOCK_SEL = 'p,li,pre,blockquote,h1,h2,h3,h4,h5,h6,td'

// The page's primary heading (module title). Used to fence container-anchored
// notes: they only render when the SAME primary heading is on screen (v1.5).
function pageHeading(container) {
  const h = container.querySelector('h1') || container.querySelector('h2')
  return h ? (h.textContent || '').trim().slice(0, 60) : ''
}

function snippetOf(el) { return (el.textContent || '').trim().slice(0, 80) }

// The heading nearest ABOVE a block (module title, section header) -- stored in
// the anchor and REQUIRED to match at resolve time. This is what stops a note
// anchored to a module-agnostic block (tab buttons, "START HERE" strip) from
// bleeding onto sibling modules that share the same page/tab (v1.4 fix).
function nearestHeading(container, block) {
  let best = null
  for (const h of container.querySelectorAll('h1,h2,h3')) {
    if (h.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING) best = h
  }
  return best ? (best.textContent || '').trim().slice(0, 60) : ''
}

// Build an anchor from a click at (clientX, clientY) on element `el`.
export function blockAnchorFromPoint(container, el, clientX, clientY) {
  // v1.5: three anchor kinds, NO kind can bleed across modules.
  //  k='b' semantic block; k='d' smallest text-bearing <div> ancestor (markup
  //  without <p>s, e.g. card headers); k='c' container itself, fenced by the
  //  page's primary heading. Every kind stores ctx and resolve REQUIRES it.
  let block = el && el.closest ? el.closest(BLOCK_SEL) : null
  if (block && !container.contains(block)) block = null
  let k = 'b'
  if (!block) {
    const d = el && el.closest ? el.closest('div') : null
    if (d && container.contains(d) && d !== container && (d.textContent || '').trim()) { block = d; k = 'd' }
  }
  if (!block) { block = container; k = 'c' }
  const snippet = k === 'c' ? '' : snippetOf(block)
  const ctx = k === 'c' ? pageHeading(container) : nearestHeading(container, block)
  let n = 0
  if (k !== 'c' && snippet) {
    const sel = k === 'd' ? 'div' : BLOCK_SEL
    for (const b of container.querySelectorAll(sel)) {
      if (snippetOf(b) === snippet && nearestHeading(container, b) === ctx) { if (b === block) break; n++ }
    }
  }
  const r = block.getBoundingClientRect()
  return { k, snippet, n, ctx, dx: Math.round(clientX - r.left), dy: Math.round(clientY - r.top) }
}

// Resolve an anchor to document coordinates, or null if the block is gone.
export function resolveAnchor(container, a) {
  if (!a) return null
  const k = a.k || (a.snippet ? 'b' : 'c')
  const want = a.ctx == null ? '' : a.ctx
  let block = null
  if (k === 'c') {
    if (pageHeading(container) !== want) return null // wrong module -> orphan tray
    block = container
  } else {
    const sel = k === 'd' ? 'div' : BLOCK_SEL
    let count = 0
    for (const b of container.querySelectorAll(sel)) {
      if (snippetOf(b) !== a.snippet) continue
      if (nearestHeading(container, b) !== want) continue
      if (count === a.n) { block = b; break }
      count++
    }
  }
  if (!block) return null
  const r = block.getBoundingClientRect()
  return { x: r.left + a.dx + window.scrollX, y: r.top + a.dy + window.scrollY }
}

// Markdown-lite -> safe HTML. Escape first, then apply the four rules.
export function mdLite(src) {
  let s = String(src || '')
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  s = s.replace(/`([^`\n]+)`/g, '<code style="background:rgba(255,255,255,0.10);padding:0 4px;border-radius:3px;font-family:monospace;font-size:0.92em">$1</code>')
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  s = s.split('\n').map(line =>
    /^\s*- /.test(line)
      ? '<div style="display:flex;gap:6px;align-items:flex-start"><span>&bull;</span><span>' + line.replace(/^\s*- /, '') + '</span></div>'
      : line
  ).join('\n')
  s = s.replace(/<\/div>\n/g, '</div>')
  s = s.replace(/\n/g, '<br/>')
  return s
}
