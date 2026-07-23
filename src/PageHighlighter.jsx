// PageHighlighter — global in-place marker-pen highlights (ported from MSL,
// 2026-07-16). Mounted ONCE at the App root over the main content element:
// select text anywhere on a reading surface -> a small 4-swatch toolbar ->
// click a color -> instant highlight, persisted locally per page, repainted
// on revisit. Click a painted mark -> Remove popover. No track/save involved.
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { addHighlight, removeHighlight, occurrenceOfSelection, applyAll, unpaint, hitHighlight } from './utils/localHighlights.js'

const SWATCHES = [
  { id: 'gold',  dot: '#e8a030' },
  { id: 'teal',  dot: '#40bebe' },
  { id: 'green', dot: '#34d399' },
  { id: 'red',   dot: '#e05050' },
  { id: 'sky',    dot: '#38bdf8' },
  { id: 'pink',   dot: '#f472b6' },
  { id: 'lime',   dot: '#a3e635' },
  { id: 'orange', dot: '#fb923c' },
]

function genId() {
  return `hl_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function PageHighlighter({ getContainer, pageKey }) {
  const [toolbar, setToolbar] = useState(null)   // { top, left, text }
  const [removePop, setRemovePop] = useState(null) // { id, top, left }

  // Repaint on view change; two delayed passes cover lazy/Suspense content
  // (applyAll is idempotent, a stray extra pass is harmless).
  useEffect(() => {
    setToolbar(null); setRemovePop(null)
    const paint = () => { const el = getContainer(); if (el) applyAll(el, pageKey) }
    const t1 = setTimeout(paint, 80)
    const t2 = setTimeout(paint, 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [pageKey]) // eslint-disable-line

  const updateFromSelection = useCallback(() => {
    // Never react to selections inside editable fields (note editors, inputs).
    const ae = document.activeElement
    if (ae && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT' || ae.isContentEditable)) { setToolbar(null); return }
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setToolbar(null); return }
    const text = sel.toString()
    if (!text || !text.trim()) { setToolbar(null); return }
    const el = getContainer()
    const node = sel.anchorNode
    if (!el || !node || !el.contains(node)) { setToolbar(null); return }
    // Defer to a container's own richer highlighter (foundations' highlight-to-track popover)
    const host = node.nodeType === 3 ? node.parentElement : node
    if (host && host.closest && host.closest('[data-own-highlighter]')) { setToolbar(null); return }
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    if (!rect || (rect.width === 0 && rect.height === 0)) { setToolbar(null); return }
    setToolbar({ top: rect.top, left: rect.left + rect.width / 2, text })
  }, [pageKey]) // eslint-disable-line

  useEffect(() => {
    function onMouseUp() { setTimeout(updateFromSelection, 0) }
    function onTouchEnd() { setTimeout(updateFromSelection, 150) }
    function onSelectionChange() {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) setToolbar(null)
    }
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('selectionchange', onSelectionChange)
    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [updateFromSelection])

  // Click a painted mark (collapsed selection only) -> Remove popover.
  useEffect(() => {
    function onDocClick(e) {
      const sel = window.getSelection()
      if (sel && !sel.isCollapsed) return
      const el = getContainer()
      // Defer clicks inside [data-own-highlighter] containers (the foundations
      // popover owns those) -- mirrors the paint defer rule.
      const host = e.target instanceof Element ? e.target : null
      if (host && host.closest && host.closest('[data-own-highlighter]')) { setRemovePop(null); return }
      // F4 (2026-07-23): highlights are native ::highlight() ranges now (no
      // <mark> nodes), so clicks resolve by hit-testing the painted ranges'
      // client rects instead of DOM closest().
      const hit = el ? hitHighlight(el, e.clientX, e.clientY) : null
      if (hit) {
        setRemovePop({ id: hit.id, top: hit.rect.bottom + 6, left: hit.rect.left + hit.rect.width / 2 })
      } else {
        setRemovePop(null)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [pageKey]) // eslint-disable-line

  function handlePaint(cid) {
    const el = getContainer()
    if (!toolbar || !el) return
    const text = toolbar.text
    if ((el.textContent || '').includes(text)) {
      const n = occurrenceOfSelection(el, text)
      addHighlight(pageKey, { id: genId(), text, n, color: cid })
      applyAll(el, pageKey)
    }
    setToolbar(null)
    try { window.getSelection()?.removeAllRanges() } catch { /* ignore */ }
  }

  return (
    <>
      {toolbar && createPortal(
        <div
          onMouseDown={e => e.preventDefault()}
          onTouchStart={e => e.preventDefault()}
          style={{
            position: 'fixed', top: Math.max(8, toolbar.top - 50), left: toolbar.left,
            transform: 'translateX(-50%)', zIndex: 9999,
            background: '#17171c', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.35)', padding: '0.3rem',
            display: 'flex', alignItems: 'center', gap: '0.1rem',
            maxWidth: 'calc(100vw - 16px)',
          }}
        >
          {SWATCHES.map(c => (
            <button
              key={c.id}
              onClick={() => handlePaint(c.id)}
              title={`Highlight ${c.id}`}
              style={{
                width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', flexShrink: 0,
              }}
            >
              <span style={{ width: 17, height: 17, borderRadius: '50%', display: 'block', background: c.dot }} />
            </button>
          ))}
        </div>,
        document.body
      )}

      {removePop && createPortal(
        <div style={{
          position: 'fixed', top: removePop.top, left: removePop.left, transform: 'translateX(-50%)', zIndex: 9999,
          background: '#17171c', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.35)', padding: '0.3rem',
        }}>
          <button
            onClick={() => {
              const el = getContainer()
              if (el) unpaint(el, removePop.id)
              removeHighlight(pageKey, removePop.id)
              setRemovePop(null)
            }}
            style={{
              fontSize: '0.75rem', fontWeight: 700,
              padding: '0.4rem 0.7rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.12)', color: '#f4f4f5',
            }}
          >Remove highlight</button>
        </div>,
        document.body
      )}
    </>
  )
}
