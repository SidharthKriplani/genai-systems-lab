// StickyNotes v1.1 — floating margin-pin sticky notes (2026-07-22).
// Create: drag the sticky-note button from the header bar and drop anywhere on
// content (or Option/Alt+click). Pins: hover = preview, click = open, click
// again (or X) = close, drag = move. Markdown-lite; 4 colors; block-anchored;
// unresolvable anchors surface in the bottom-right tray (re-pin supported).
// Icons: shared Icon.jsx (ICON-SYSTEM), no emojis.
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon.jsx'
import { listStickies, saveSticky, deleteSticky, blockAnchorFromPoint, resolveAnchor, mdLite } from './utils/stickyNotes.js'

const COLORS = [
  { id: 'gold',  rim: '#e8a030', bg: '#2e2410' },
  { id: 'teal',  rim: '#40bebe', bg: '#0f2c2c' },
  { id: 'green', rim: '#34d399', bg: '#0e2b20' },
  { id: 'red',   rim: '#e05050', bg: '#301313' },
]
const colorOf = id => COLORS.find(c => c.id === id) || COLORS[0]
const genId = () => `sn_${Date.now()}_${Math.random().toString(36).slice(2)}`

// Header-bar drag source. Mount anywhere in the top bar; it only fires an
// event — StickyNotes owns the drag session so no prop plumbing is needed.
export function StickyBarButton() {
  return (
    <button
      data-sticky-ui="1"
      title="Drag onto the page to drop a sticky note (or Option+click anywhere)"
      onPointerDown={(e) => {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('sticky-drag-start', { detail: { x: e.clientX, y: e.clientY } }))
      }}
      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', color: '#cfcfcf', padding: 0, touchAction: 'none' }}>
      <Icon name="sticky-note" size={15} />
    </button>
  )
}

export function StickyNotes({ getContainer, pageKey }) {
  const [notes, setNotes] = useState([])
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [previewId, setPreviewId] = useState(null)
  const [repinId, setRepinId] = useState(null)
  const [tick, setTick] = useState(0)
  const [drag, setDrag] = useState(null)       // moving an existing note
  const [pending, setPending] = useState(null)  // pointerdown on a pin, not yet a drag (4px threshold; tap toggles open)
  const [dropGhost, setDropGhost] = useState(null) // { x, y } while dragging from the bar

  useEffect(() => {
    setOpenId(null); setEditId(null); setRepinId(null); setPreviewId(null)
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

  const createAt = useCallback((clientX, clientY, target) => {
    const el = getContainer(); if (!el) return false
    const t = target || document.elementFromPoint(clientX, clientY)
    if (!(t instanceof Element) || !el.contains(t)) return false
    const anchor = blockAnchorFromPoint(el, t, clientX, clientY)
    if (repinId) {
      setNotes(ns => { const upd = ns.map(n => n.id === repinId ? { ...n, anchor } : n); const n = upd.find(x => x.id === repinId); if (n) saveSticky(pageKey, n); return upd })
      setOpenId(repinId); setRepinId(null)
    } else {
      const note = { id: genId(), color: 'gold', text: '', anchor, ts: Date.now() }
      saveSticky(pageKey, note)
      setNotes(ns => [...ns, note])
      setOpenId(note.id); setEditId(note.id)
    }
    return true
  }, [getContainer, pageKey, repinId])

  // Bar-button drag session: ghost follows pointer, drop creates the note.
  useEffect(() => {
    const onStart = (e) => setDropGhost({ x: e.detail.x, y: e.detail.y })
    window.addEventListener('sticky-drag-start', onStart)
    return () => window.removeEventListener('sticky-drag-start', onStart)
  }, [])
  useEffect(() => {
    if (!dropGhost) return
    const onMove = (e) => setDropGhost({ x: e.clientX, y: e.clientY })
    const onUp = (e) => { setDropGhost(null); createAt(e.clientX, e.clientY) }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [dropGhost, createAt])

  // Option/Alt+click creation stays as the fast path.
  useEffect(() => {
    const onClick = (e) => {
      if (!e.altKey) return
      const t = e.target
      if (!(t instanceof Element) || t.closest('[data-sticky-ui]')) return
      if (t.closest('textarea,input,button,a,[contenteditable="true"]')) return
      if (createAt(e.clientX, e.clientY, t)) e.preventDefault()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [createAt])

  // Pending pin press: >4px movement = drag; clean release = tap (toggle open).
  useEffect(() => {
    if (!pending) return
    const onMove = (e) => {
      if (Math.hypot(e.clientX - pending.startX, e.clientY - pending.startY) > 4) {
        setDrag({ id: pending.id, startX: pending.startX, startY: pending.startY, dx0: pending.dx0, dy0: pending.dy0 })
        setPending(null)
      }
    }
    const onUp = () => {
      setOpenId(o => (o === pending.id ? null : pending.id))
      setPreviewId(null)
      setPending(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [pending])

  // Move an existing pin/card.
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

  const iconBtn = (name, onClick, title) => (
    <button onClick={onClick} title={title} style={{ background: 'transparent', border: 'none', color: '#cfcfcf', cursor: 'pointer', padding: '2px 3px', display: 'inline-flex', alignItems: 'center' }}>
      <Icon name={name} size={13} />
    </button>
  )

  const card = (n, pos) => {
    const c = colorOf(n.color)
    const style = pos
      ? { position: 'absolute', top: pos.y + 14, left: Math.max(8, Math.min(pos.x, window.innerWidth - 260 + window.scrollX)), width: 244 }
      : { position: 'fixed', bottom: 70, right: 16, width: 244 }
    return (
      <div key={'card' + n.id} data-sticky-ui="1" style={{ ...style, zIndex: 260, background: c.bg, border: `1px solid ${c.rim}55`, borderLeft: `3px solid ${c.rim}`, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontSize: '0.82rem', color: '#e6e6e6' }}>
        <div
          onPointerDown={pos ? (e) => { if (e.target instanceof Element && e.target.closest('button,span[data-swatch]')) return; e.preventDefault(); setDrag({ id: n.id, startX: e.clientX, startY: e.clientY, dx0: n.anchor.dx, dy0: n.anchor.dy }) } : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', cursor: pos ? 'grab' : 'default', borderBottom: `1px solid ${c.rim}33`, touchAction: 'none' }}>
          {COLORS.map(cc => (
            <span key={cc.id} data-swatch="1" onClick={(e) => { e.stopPropagation(); update(n.id, { color: cc.id }) }}
              style={{ width: 13, height: 13, borderRadius: '50%', background: cc.rim, cursor: 'pointer', outline: n.color === cc.id ? '2px solid #fff' : 'none', outlineOffset: 1 }} />
          ))}
          <span style={{ flex: 1 }} />
          {!pos && <button onClick={() => setRepinId(n.id)} title="Then Option+click (or drop) a new spot" style={{ background: 'transparent', border: 'none', color: '#cfcfcf', cursor: 'pointer', fontSize: '0.7rem' }}>re-pin</button>}
          {iconBtn('trash-2', () => remove(n.id), 'Delete note')}
          {iconBtn('x', () => { setOpenId(null); setEditId(null) }, 'Close')}
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

  const preview = () => {
    const p = placed.find(x => x.n.id === previewId)
    if (!p || openId === previewId) return null
    const c = colorOf(p.n.color)
    return (
      <div style={{ position: 'absolute', top: p.pos.y + 14, left: Math.max(8, Math.min(p.pos.x, window.innerWidth - 240 + window.scrollX)), width: 224, zIndex: 258, pointerEvents: 'none', background: c.bg, border: `1px solid ${c.rim}44`, borderLeft: `3px solid ${c.rim}`, borderRadius: 8, padding: '7px 10px', fontSize: '0.78rem', color: '#ddd', lineHeight: 1.4, maxHeight: 150, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}
        dangerouslySetInnerHTML={{ __html: p.n.text ? mdLite(p.n.text) : '<span style="opacity:0.45">empty note</span>' }} />
    )
  }

  return createPortal(
    <div data-sticky-ui="1">
      {placed.map(({ n, pos }) => (
        <span key={n.id}
          onMouseEnter={() => setPreviewId(n.id)}
          onMouseLeave={() => setPreviewId(p => (p === n.id ? null : p))}
          onPointerDown={(e) => { if (e.altKey) return; e.preventDefault(); setPending({ id: n.id, startX: e.clientX, startY: e.clientY, dx0: n.anchor.dx, dy0: n.anchor.dy }) }}
          style={{ position: 'absolute', top: pos.y - 7, left: pos.x - 7, width: 15, height: 15, borderRadius: '50%', background: colorOf(n.color).rim, border: '2px solid rgba(0,0,0,0.55)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', cursor: 'pointer', zIndex: 250, touchAction: 'none' }} />
      ))}
      {preview()}
      {notes.filter(n => n.id === openId).map(n => { const p = placed.find(x => x.n.id === n.id); return card(n, p ? p.pos : null) })}
      {orphans.length > 0 && (
        <button onClick={() => setOpenId(openId === orphans[0].id ? null : orphans[0].id)}
          style={{ position: 'fixed', bottom: 18, right: 16, zIndex: 255, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1c1c22', color: '#d8d8d8', border: '1px solid #444', borderRadius: 20, padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
          <Icon name="pin" size={13} /> {orphans.length} unanchored
        </button>
      )}
      {dropGhost && (
        <span style={{ position: 'fixed', top: dropGhost.y - 9, left: dropGhost.x - 9, zIndex: 300, pointerEvents: 'none', color: '#e8a030', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>
          <Icon name="sticky-note" size={18} />
        </span>
      )}
      {repinId && (
        <div style={{ position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 255, background: '#26261a', color: '#e8d9a0', border: '1px solid #8a7a3a', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem' }}>
          Option+click (or drag the bar pin) anywhere in the content to re-pin this note
        </div>
      )}
    </div>,
    document.body
  )
}
