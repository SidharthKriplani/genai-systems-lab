// StickyNotes — floating margin-pin sticky notes (v1, 2026-07-22).
// Alt+click anywhere on the content surface -> a collapsed pin at that spot.
// Click pin -> note card (markdown-lite, 4 colors, drag by header, delete).
// Anchored to the nearest content block; unresolvable anchors surface in a
// bottom-right tray (repin via "re-pin" then Alt+click a new spot).
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { listStickies, saveSticky, deleteSticky, blockAnchorFromPoint, resolveAnchor, mdLite } from './utils/stickyNotes.js'

const COLORS = [
  { id: 'gold',  rim: '#e8a030', bg: '#2e2410' },
  { id: 'teal',  rim: '#40bebe', bg: '#0f2c2c' },
  { id: 'green', rim: '#34d399', bg: '#0e2b20' },
  { id: 'red',   rim: '#e05050', bg: '#301313' },
]
const colorOf = id => COLORS.find(c => c.id === id) || COLORS[0]
const genId = () => `sn_${Date.now()}_${Math.random().toString(36).slice(2)}`

export function StickyNotes({ getContainer, pageKey }) {
  const [notes, setNotes] = useState([])
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [repinId, setRepinId] = useState(null)
  const [tick, setTick] = useState(0)
  const [drag, setDrag] = useState(null) // { id, startX, startY, dx0, dy0 }

  // Load + delayed repaints for lazy/Suspense content (same pattern as PageHighlighter).
  useEffect(() => {
    setOpenId(null); setEditId(null); setRepinId(null)
    setNotes(listStickies(pageKey))
    const t1 = setTimeout(() => setTick(t => t + 1), 120)
    const t2 = setTimeout(() => setTick(t => t + 1), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [pageKey])

  useEffect(() => {
    const onResize = () => setTick(t => t + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Alt+click on content: create a note (or re-pin the pending one).
  useEffect(() => {
    const onClick = (e) => {
      if (!e.altKey) return
      const el = getContainer(); if (!el) return
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest('[data-sticky-ui]')) return
      if (!el.contains(t)) return
      if (t.closest('textarea,input,button,a,[contenteditable="true"]')) return
      e.preventDefault()
      const anchor = blockAnchorFromPoint(el, t, e.clientX, e.clientY)
      if (repinId) {
        setNotes(ns => { const upd = ns.map(n => n.id === repinId ? { ...n, anchor } : n); const n = upd.find(x => x.id === repinId); if (n) saveSticky(pageKey, n); return upd })
        setRepinId(null); setOpenId(repinId)
      } else {
        const note = { id: genId(), color: 'gold', text: '', anchor, ts: Date.now() }
        saveSticky(pageKey, note)
        setNotes(ns => [...ns, note])
        setOpenId(note.id); setEditId(note.id)
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pageKey, repinId, getContainer])

  // Drag (pin or card header).
  useEffect(() => {
    if (!drag) return
    const onMove = (e) => {
      setNotes(ns => ns.map(n => n.id === drag.id
        ? { ...n, anchor: { ...n.anchor, dx: drag.dx0 + (e.clientX - drag.startX), dy: drag.dy0 + (e.clientY - drag.startY) } }
        : n))
    }
    const onUp = () => {
      setNotes(ns => { const n = ns.find(x => x.id === drag.id); if (n) saveSticky(pageKey, n); return ns })
      setDrag(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [drag, pageKey])

  const update = useCallback((id, patch) => {
    setNotes(ns => { const upd = ns.map(n => n.id === id ? { ...n, ...patch } : n); const n = upd.find(x => x.id === id); if (n) saveSticky(pageKey, n); return upd })
  }, [pageKey])

  const remove = (id) => { deleteSticky(pageKey, id); setNotes(ns => ns.filter(n => n.id !== id)); if (openId === id) setOpenId(null) }

  const el = getContainer()
  const placed = [], orphans = []
  for (const n of notes) {
    const pos = el ? resolveAnchor(el, n.anchor) : null
    if (pos) placed.push({ n, pos }); else orphans.push(n)
  }
  void tick

  const card = (n, pos) => {
    const c = colorOf(n.color)
    const style = pos
      ? { position: 'absolute', top: pos.y + 14, left: Math.max(8, Math.min(pos.x, window.innerWidth - 260 + window.scrollX)), width: 244 }
      : { position: 'fixed', bottom: 70, right: 16, width: 244 }
    return (
      <div key={'card' + n.id} data-sticky-ui="1" style={{ ...style, zIndex: 260, background: c.bg, border: `1px solid ${c.rim}55`, borderLeft: `3px solid ${c.rim}`, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontSize: '0.82rem', color: '#e6e6e6' }}>
        <div
          onPointerDown={pos ? (e) => { e.preventDefault(); setDrag({ id: n.id, startX: e.clientX, startY: e.clientY, dx0: n.anchor.dx, dy0: n.anchor.dy }) } : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', cursor: pos ? 'grab' : 'default', borderBottom: `1px solid ${c.rim}33` }}>
          {COLORS.map(cc => (
            <span key={cc.id} onClick={(e) => { e.stopPropagation(); update(n.id, { color: cc.id }) }}
              style={{ width: 13, height: 13, borderRadius: '50%', background: cc.rim, cursor: 'pointer', outline: n.color === cc.id ? '2px solid #fff' : 'none', outlineOffset: 1 }} />
          ))}
          <span style={{ flex: 1 }} />
          {!pos && <button onClick={() => setRepinId(n.id)} title="Then Alt+click a new spot" style={btn}>re-pin</button>}
          <button onClick={() => remove(n.id)} title="Delete" style={btn}>🗑</button>
          <button onClick={() => { setOpenId(null); setEditId(null) }} title="Close" style={btn}>✕</button>
        </div>
        {editId === n.id ? (
          <textarea autoFocus defaultValue={n.text}
            onBlur={(e) => { update(n.id, { text: e.target.value }); setEditId(null) }}
            placeholder={'Your note…  **bold** *italic* `code`\n- bullet'}
            style={{ width: '100%', minHeight: 96, boxSizing: 'border-box', background: 'transparent', color: '#eee', border: 'none', outline: 'none', resize: 'vertical', padding: '8px 10px', font: 'inherit', lineHeight: 1.45 }} />
        ) : (
          <div onClick={() => setEditId(n.id)} title="Click to edit"
            style={{ padding: '8px 10px', minHeight: 34, maxHeight: 300, overflowY: 'auto', cursor: 'text', lineHeight: 1.45 }}
            dangerouslySetInnerHTML={{ __html: n.text ? mdLite(n.text) : '<span style="opacity:0.45">empty — click to write</span>' }} />
        )}
      </div>
    )
  }

  return createPortal(
    <div data-sticky-ui="1">
      {placed.map(({ n, pos }) => (
        <span key={n.id}
          onClick={() => setOpenId(openId === n.id ? null : n.id)}
          onPointerDown={(e) => { if (e.altKey) return; e.preventDefault(); setDrag({ id: n.id, startX: e.clientX, startY: e.clientY, dx0: n.anchor.dx, dy0: n.anchor.dy }) }}
          title={n.text ? n.text.slice(0, 120) : 'Sticky note'}
          style={{ position: 'absolute', top: pos.y - 7, left: pos.x - 7, width: 15, height: 15, borderRadius: '50%', background: colorOf(n.color).rim, border: '2px solid rgba(0,0,0,0.55)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', cursor: 'pointer', zIndex: 250 }} />
      ))}
      {notes.filter(n => n.id === openId).map(n => { const p = placed.find(x => x.n.id === n.id); return card(n, p ? p.pos : null) })}
      {orphans.length > 0 && (
        <button onClick={() => setOpenId(openId === orphans[0].id ? null : orphans[0].id)}
          style={{ position: 'fixed', bottom: 18, right: 16, zIndex: 255, background: '#1c1c22', color: '#d8d8d8', border: '1px solid #444', borderRadius: 20, padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
          📌 {orphans.length} unanchored
        </button>
      )}
      {repinId && (
        <div style={{ position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 255, background: '#26261a', color: '#e8d9a0', border: '1px solid #8a7a3a', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem' }}>
          Alt+click anywhere in the content to re-pin this note
        </div>
      )}
    </div>,
    document.body
  )
}

const btn = { background: 'transparent', border: 'none', color: '#cfcfcf', cursor: 'pointer', fontSize: '0.72rem', padding: '2px 4px' }
