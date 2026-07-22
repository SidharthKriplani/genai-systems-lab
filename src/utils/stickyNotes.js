// stickyNotes — floating margin-pin notes over lab content (v1, 2026-07-22).
// Anchoring: a note pins to a content BLOCK via { snippet: first 80 chars of the
// block's text, n: which same-snippet block, dx/dy: offset from block top-left }.
// Survives re-renders of the same content; if the block's text changes so the
// snippet no longer resolves, the note drops into the visible "unanchored" tray
// (never silently lost). Storage: localStorage per pageKey, same pattern as
// localHighlights. Markdown-lite: **bold**, *italic*, `code`, "- " bullets.

const KEY = 'lab-stickies-v1'

function readAll() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
function writeAll(m) { try { localStorage.setItem(KEY, JSON.stringify(m)) } catch { /* full/blocked */ } }

export function listStickies(pageKey) { return readAll()[pageKey] || [] }

export function saveSticky(pageKey, note) {
  const m = readAll(); const arr = m[pageKey] || []
  const i = arr.findIndex(n => n.id === note.id)
  if (i >= 0) arr[i] = note; else arr.push(note)
  m[pageKey] = arr; writeAll(m)
}

export function deleteSticky(pageKey, id) {
  const m = readAll()
  m[pageKey] = (m[pageKey] || []).filter(n => n.id !== id)
  if (m[pageKey].length === 0) delete m[pageKey]
  writeAll(m)
}

const BLOCK_SEL = 'p,li,pre,blockquote,h1,h2,h3,h4,h5,h6,td'

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
  let block = el && el.closest ? el.closest(BLOCK_SEL) : null
  if (!block || !container.contains(block)) block = container
  const snippet = block === container ? '' : snippetOf(block)
  const ctx = block === container ? '' : nearestHeading(container, block)
  let n = 0
  if (snippet) {
    for (const b of container.querySelectorAll(BLOCK_SEL)) {
      if (snippetOf(b) === snippet && nearestHeading(container, b) === ctx) { if (b === block) break; n++ }
    }
  }
  const r = block.getBoundingClientRect()
  return { snippet, n, ctx, dx: Math.round(clientX - r.left), dy: Math.round(clientY - r.top) }
}

// Resolve an anchor to document coordinates, or null if the block is gone.
export function resolveAnchor(container, a) {
  if (!a) return null
  let block = null
  if (!a.snippet) block = container
  else {
    let count = 0
    for (const b of container.querySelectorAll(BLOCK_SEL)) {
      if (snippetOf(b) !== a.snippet) continue
      // Strict ctx match (v1.4.1): legacy anchors without ctx are treated as
      // ctx:'' -- they orphan into the tray rather than bleed across modules.
      if (nearestHeading(container, b) !== (a.ctx == null ? '' : a.ctx)) continue
      if (count === a.n) { block = b; break } count++
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
