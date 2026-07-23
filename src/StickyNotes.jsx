// StickyNotes v2.1 — floating margin-pin sticky notes (2026-07-22).
// v2.1: two-step delete confirmation (deletes tombstone across all devices).
// v2.0: hashless bucket keys + legacy-bucket migration (cross-device sync fix).
// v1.9: instant repaint when a cross-device pull-merge lands (annotations-merged).
// v1.8: last-edited datetime stamp in the card footer (editedTs on text saves).
// v1.7: sticky-create-at event -> note from text selection (popover Note button).
// v1.6: per-module storage buckets via <StickyScope/> (structural bleed fix).
// Create: drag the sticky-note button from the header bar and drop anywhere on
// content (or Option/Alt+click). Pins: hover = preview, click = open, click
// again (or X) = close, drag = move. Markdown-lite; 4 colors; block-anchored;
// unresolvable anchors surface in the bottom-right tray (re-pin supported).
// Icons: shared Icon.jsx (ICON-SYSTEM), no emojis.
import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon.jsx'
import { listStickies, saveSticky, deleteSticky, blockAnchorFromPoint, resolveAnchor, mdLite, scopeOf, takeBucket, allBucketKeys } from './utils/stickyNotes.js'

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

// v1.6: invisible scope marker. A module renderer mounts <StickyScope id="m:xyz"/>
// inside the sticky container; the id becomes part of the storage bucket key.
// Notes created while it's mounted belong to that module ONLY -- structural
// isolation, independent of heading/snippet text.
export function StickyScope({ id }) {
  return id ? <span data-sticky-scope={id} hidden aria-hidden="true" /> : null
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
  const [ctxSig, setCtxSig] = useState('')
  const [scope, setScope] = useState('')   // v1.6: current data-sticky-scope value
  const [syncNonce, setSyncNonce] = useState(0) // v1.9: bumped when a cloud pull-merge lands
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [paletteId, setPaletteId] = useState(null) // v2.4: which note's color palette is bloomed open // v2.1: two-step delete arm

  // v1.4: bucket = pageKey + hash (heading-based scoping now lives in the
  // ANCHOR itself -- see stickyNotes.js nearestHeading). The body observer
  // re-derives the hash and bumps a repaint tick on real content swaps,
  // ignoring mutations caused by our own portal (else: render loop).
  useEffect(() => {
    let t = null
    const onHash = () => {
      try { setCtxSig(window.location.hash || '') } catch { setCtxSig('') }
      try { setScope(scopeOf(getContainer())) } catch { setScope('') }
    }
    onHash()
    window.addEventListener('hashchange', onHash)
    let mo = null
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver((muts) => {
        const relevant = muts.some(m => !(m.target instanceof Element && m.target.closest && m.target.closest('[data-sticky-ui]')))
        if (!relevant) return
        clearTimeout(t); t = setTimeout(() => { onHash(); setTick(x => x + 1) }, 250)
      })
      mo.observe(document.body, { childList: true, subtree: true })
    }
    return () => { window.removeEventListener('hashchange', onHash); if (mo) mo.disconnect(); clearTimeout(t) }
  }, [pageKey])

  // v2.0: bucket key = pageKey + scope ONLY. location.hash (ctxSig) used to be
  // part of the key -- but the hash is navigation-path-dependent, so the SAME
  // module produced DIFFERENT buckets on different devices/routes: synced
  // notes arrived but were filed where the other device never looked (the
  // "stickies don't sync" bug). ctxSig remains as a repaint trigger only.
  const fullKey = pageKey + (scope ? '|s:' + scope : '')

  // v2.2: navigation resets ONLY on a real page/scope change — never on a sync
  // reload (the old combined effect closed the active editor on every merge).
  useEffect(() => {
    setOpenId(null); setEditId(null); setRepinId(null); setPreviewId(null)
    setConfirmDeleteId(null); setPaletteId(null)
  }, [fullKey])

  useEffect(() => {
    // v1.5.2: auto-purge pre-v1.5 debris. Anchors without a `k` kind predate
    // module fencing, can never render correctly again, and haunt the tray --
    // delete them from storage outright.
    // v2.0 migration: re-home every legacy hash-keyed bucket for this
    // page+scope into the canonical hashless key. Raw moves, no tombstones.
    try {
      for (const k of allBucketKeys()) {
        if (k === fullKey || !k.startsWith(pageKey + '|')) continue
        const hasScope = k.includes('|s:')
        if (scope ? k.endsWith('|s:' + scope) : !hasScope) {
          for (const n of takeBucket(k)) saveSticky(fullKey, n)
        }
      }
    } catch { /* ignore */ }
    const all = listStickies(fullKey)
    const keep = all.filter(n => n.anchor && n.anchor.k)
    for (const n of all) { if (!(n.anchor && n.anchor.k)) deleteSticky(fullKey, n.id) }
    setNotes(keep)
    // v1.6 migration: pre-scope notes live in the unscoped bucket. When a scoped
    // surface is open, any legacy note that RESOLVES in the current DOM belongs
    // to this module -- re-home it into the scoped bucket. Unresolvable ones
    // stay put and re-home when their own module is opened. Idempotent.
    const migrate = () => {
      if (!scope) return
      const el = getContainer(); if (!el) return
      const oldKey = pageKey + '|' + ctxSig
      const legacy = listStickies(oldKey)
      if (!legacy.length) return
      let moved = false
      for (const n of legacy) {
        if (!(n.anchor && n.anchor.k)) continue
        if (resolveAnchor(el, n.anchor)) { saveSticky(fullKey, n); deleteSticky(oldKey, n.id); moved = true }
      }
      if (moved) setNotes(listStickies(fullKey))
    }
    const t1 = setTimeout(() => { migrate(); setTick(t => t + 1) }, 120)
    const t2 = setTimeout(() => { migrate(); setTick(t => t + 1) }, 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [fullKey, syncNonce])

  // v1.9: a cross-device pull-merge just rewrote the store — reload this
  // bucket immediately instead of waiting for a module switch.
  // v2.2: while a note editor is focused, defer merge-triggered reloads to the
  // editor's close — the merge already landed in storage; only the repaint waits.
  const editIdRef = useRef(null)
  const pendingMergeRef = useRef(false)
  useEffect(() => {
    editIdRef.current = editId
    if (editId == null && pendingMergeRef.current) {
      pendingMergeRef.current = false
      setSyncNonce(n => n + 1)
    }
  }, [editId])
  useEffect(() => {
    const onMerged = () => {
      if (editIdRef.current != null) { pendingMergeRef.current = true; return }
      setSyncNonce(n => n + 1)
    }
    window.addEventListener('annotations-merged', onMerged)
    return () => window.removeEventListener('annotations-merged', onMerged)
  }, [])

  useEffect(() => {
    const onResize = () => setTick(t => t + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const createAt = useCallback((clientX, clientY, target, initialText) => {
    const el = getContainer(); if (!el) return false
    const t = target || document.elementFromPoint(clientX, clientY)
    if (!(t instanceof Element) || !el.contains(t)) return false
    const anchor = blockAnchorFromPoint(el, t, clientX, clientY)
    if (repinId) {
      setNotes(ns => { const upd = ns.map(n => n.id === repinId ? { ...n, anchor } : n); const n = upd.find(x => x.id === repinId); if (n) saveSticky(fullKey, n); return upd })
      setOpenId(repinId); setRepinId(null)
    } else {
      const note = { id: genId(), color: 'gold', text: initialText || '', anchor, ts: Date.now() }
      const liveScope = scopeOf(el)  // v1.6: never trust debounced state at drop time
      const liveKey = pageKey + (liveScope ? '|s:' + liveScope : '')
      saveSticky(liveKey, note)
      if (liveKey !== fullKey) { setScope(liveScope); return true }  // reload picks it up
      setNotes(ns => [...ns, note])
      setOpenId(note.id); setEditId(note.id)
    }
    return true
  }, [getContainer, fullKey, repinId, pageKey, ctxSig])

  // v1.7: external create request — the highlight popover's "Note" button
  // dispatches sticky-create-at with the selection midpoint + quoted text, so
  // a note can be dropped without dragging from the bar (works on touch too).
  useEffect(() => {
    const onCreate = (e) => {
      const d = (e && e.detail) || {}
      if (typeof d.x === 'number' && typeof d.y === 'number') createAt(d.x, d.y, null, d.text || '')
    }
    window.addEventListener('sticky-create-at', onCreate)
    return () => window.removeEventListener('sticky-create-at', onCreate)
  }, [createAt])

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
      setNotes(ns => { const n = ns.find(x => x.id === drag.id); if (n) saveSticky(fullKey, n); return ns })
      setDrag(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [drag, fullKey])

  const update = useCallback((id, patch) => {
    setNotes(ns => { const upd = ns.map(n => n.id === id ? { ...n, ...patch } : n); const n = upd.find(x => x.id === id); if (n) saveSticky(fullKey, n); return upd })
  }, [fullKey])

  const remove = (id) => { deleteSticky(fullKey, id); setNotes(ns => ns.filter(n => n.id !== id)); if (openId === id) setOpenId(null) }

  const el = getContainer()
  const placed = [], orphans = []
  // Headings currently on screen -- a note whose stored module-heading is NOT
  // among them belongs to a different module: hide it entirely (it renders on
  // its own module). The tray is ONLY for notes whose module IS on screen but
  // whose anchor block vanished (content edited) -- true orphans (v1.5.1).
  const onScreen = new Set()
  if (el) for (const h of el.querySelectorAll('h1,h2,h3')) onScreen.add((h.textContent || '').trim().slice(0, 60))
  for (const n of notes) {
    const pos = el ? resolveAnchor(el, n.anchor) : null
    if (pos) { placed.push({ n, pos }); continue }
    const ctx = n.anchor && n.anchor.ctx
    if (ctx && !onScreen.has(ctx)) continue // lives on another module -- not our business here
    orphans.push(n)
  }
  void tick

  const iconBtn = (name, onClick, title) => (
    <button onClick={onClick} title={title} style={{ background: 'transparent', border: 'none', color: '#cfcfcf', cursor: 'pointer', padding: '2px 3px', display: 'inline-flex', alignItems: 'center' }}>
      <Icon name={name} size={13} />
    </button>
  )

  // v1.8: last-edit timestamp shown in the card footer. editedTs is stamped
  // on text saves; created ts is the fallback for never-edited notes.
  const fmtTs = (ms) => {
    if (!ms) return ''
    const d = new Date(ms)
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' \u00b7 ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const card = (n, pos) => {
    const c = colorOf(n.color)
    const style = pos
      ? { position: 'absolute', top: pos.y + 14, left: Math.max(8, Math.min(pos.x, window.innerWidth - 260 + window.scrollX)), width: 244 }
      : { position: 'fixed', bottom: 70, right: 16, width: 244 }
    return (
      <div key={'card' + n.id} data-sticky-ui="1" style={{ ...style, zIndex: 260, background: 'rgba(22,22,27,0.94)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, boxShadow: '0 14px 36px rgba(0,0,0,0.55)', fontSize: '0.8rem', color: '#e8e8ea', lineHeight: 1.5 }}>
        <div
          onPointerDown={pos ? (e) => { if (e.target instanceof Element && e.target.closest('button,span[data-swatch]')) return; e.preventDefault(); setDrag({ id: n.id, startX: e.clientX, startY: e.clientY, dx0: n.anchor.dx, dy0: n.anchor.dy }) } : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 9px 2px', cursor: pos ? 'grab' : 'default', touchAction: 'none' }}>
          {/* v2.4: resting state = glow line; click blooms a transient row of plain
              borderless color circles (current one glows), pick -> collapse. */}
          {paletteId === n.id ? (
            <span data-swatch="1" style={{ display: 'inline-flex', gap: 7, alignItems: 'center' }}>
              {COLORS.map(cc => (
                <span key={cc.id} onClick={(e) => { e.stopPropagation(); update(n.id, { color: cc.id }); setPaletteId(null) }}
                  style={{ width: 11, height: 11, borderRadius: '50%', background: cc.rim, cursor: 'pointer', opacity: cc.id === n.color ? 1 : 0.85, boxShadow: cc.id === n.color ? `0 0 7px ${cc.rim}` : 'none', transition: 'box-shadow 0.15s' }} />
              ))}
            </span>
          ) : (
            <span data-swatch="1" title="Change color"
              onClick={(e) => { e.stopPropagation(); setPaletteId(n.id) }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 5px', margin: '-7px -5px', cursor: 'pointer' }}>
              <span style={{ width: 22, height: 3, borderRadius: 2, background: c.rim, boxShadow: `0 0 8px ${c.rim}cc, 0 0 2px ${c.rim}`, transition: 'background 0.15s, box-shadow 0.15s', pointerEvents: 'none' }} />
            </span>
          )}
          <span style={{ flex: 1 }} />
          {!pos && <button onClick={() => setRepinId(n.id)} title="Then Option+click (or drop) a new spot" style={{ background: 'transparent', border: 'none', color: '#cfcfcf', cursor: 'pointer', fontSize: '0.7rem' }}>re-pin</button>}
          {confirmDeleteId === n.id ? (
            <button
              onClick={() => { setConfirmDeleteId(null); remove(n.id) }}
              title="Click again to permanently delete (removes on ALL devices)"
              style={{ background: 'rgba(224,80,80,0.22)', border: '1px solid #e05050', color: '#ff9a9a', borderRadius: 6, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
              Delete?
            </button>
          ) : (
            iconBtn('trash-2', () => {
              // v2.1: deletion is tombstoned (propagates to every device), so a
              // misclick is destructive -- arm first, confirm within 3s.
              setConfirmDeleteId(n.id)
              setTimeout(() => setConfirmDeleteId(c => (c === n.id ? null : c)), 3000)
            }, 'Delete note (click twice to confirm)')
          )}
          {iconBtn('x', () => { setOpenId(null); setEditId(null) }, 'Close')}
        </div>
        {editId === n.id ? (
          <textarea autoFocus defaultValue={n.text}
            onBlur={(e) => { update(n.id, { text: e.target.value, editedTs: Date.now() }); setEditId(null) }}
            placeholder={'Write a note…'} title={'Markdown: **bold** *italic* `code`  - bullet'}
            style={{ width: '100%', minHeight: 96, boxSizing: 'border-box', background: 'transparent', color: '#eee', border: 'none', outline: 'none', resize: 'vertical', padding: '8px 10px', font: 'inherit', lineHeight: 1.45 }} />
        ) : (
          <div onClick={() => setEditId(n.id)} title="Click to edit"
            style={{ padding: '8px 10px', minHeight: 34, maxHeight: 300, overflowY: 'auto', cursor: 'text', lineHeight: 1.45 }}
            dangerouslySetInnerHTML={{ __html: n.text ? mdLite(n.text) : '<span style="opacity:0.45">empty — click to write</span>' }} />
        )}
        {(n.editedTs || n.ts) && (
          <div style={{ padding: '3px 10px 6px', fontSize: '0.64rem', color: '#9a9a9a', opacity: 0.85, textAlign: 'right', userSelect: 'none' }}>
            {n.editedTs ? 'edited ' : ''}{fmtTs(n.editedTs || n.ts)}
          </div>
        )}
      </div>
    )
  }

  const preview = () => {
    const p = placed.find(x => x.n.id === previewId)
    if (!p || openId === previewId) return null
    const c = colorOf(p.n.color)
    return (
      <div style={{ position: 'absolute', top: p.pos.y + 14, left: Math.max(8, Math.min(p.pos.x, window.innerWidth - 240 + window.scrollX)), width: 224, zIndex: 258, pointerEvents: 'none', background: 'rgba(22,22,27,0.94)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 10px', fontSize: '0.78rem', color: '#ddd', lineHeight: 1.4, maxHeight: 150, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}
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
          style={{ position: 'absolute', top: pos.y - 7, left: pos.x - 7, width: 15, height: 15, borderRadius: '50%', background: colorOf(n.color).rim, border: '2px solid rgba(0,0,0,0.55)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', cursor: 'pointer', zIndex: 30 /* below every lab's sticky top bar (z40/50/90): pins slide UNDER it on scroll */, touchAction: 'none' }} />
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
