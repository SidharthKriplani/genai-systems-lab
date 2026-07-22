// src/utils/tracks.js — My Tracks local storage layer for genai-systems-lab
// localStorage key: 'gsl-tracks-v1'
// Track shape: { id, name, createdAt, items: [...] }
// PrepLab item: { type: 'preplab', questionId, title, topic, difficulty, addedAt }
// Note item:    { type: 'note', id, title, blocks: [...], addedAt, updatedAt }
//   Block shapes (see components/NoteEditor.jsx):
//     { id, type: 'text'|'h1'|'h2'|'h3'|'bullet'|'numbered'|'todo'|'quote'|'callout', content, checked? }
//     { id, type: 'code', content, lang }
//     { id, type: 'toggle', content, body }
//     { id, type: 'divider' }
//     { id, type: 'video', url, videoId, platform, title }
//     { id, type: 'link',  url, domain, title, summary }
//   Legacy plain notes ({ type: 'note', content }) are silently migrated to the
//   block shape on first read — see getTracks().

import { MODULE_SEARCH_INDEX } from '../data/moduleSearchIndex.js'
import { tierOf } from '../data/moduleTiers.js'

const KEY = 'gsl-tracks-v1'
const LAST_KEY = 'gsl-tracks-last-v1'      // id of the most-recently-added-to track
const QUICK_KEY = 'gsl-tracks-quickadd-v1' // '1' = skip the picker, add straight to last track
const TOMBSTONE_KEY = 'gsl-tracks-tombstones-v1'  // { trackDeletes: [{id, deletedAt}], itemDeletes: [{trackId, itemUid, deletedAt}] }

export function getTombstones() {
  try { return JSON.parse(localStorage.getItem(TOMBSTONE_KEY)) || { trackDeletes: [], itemDeletes: [] } }
  catch { return { trackDeletes: [], itemDeletes: [] } }
}

function saveTombstones(tombstones) {
  localStorage.setItem(TOMBSTONE_KEY, JSON.stringify(tombstones))
}

// Write the fully-merged {tracks, tombstones} state back to localStorage and notify
// listeners — used by tracksSync.js after a cross-device merge. Distinct from the
// internal save() above because it also persists tombstones atomically.
export function applyMergedState({ tracks, tombstones }) {
  localStorage.setItem(KEY, JSON.stringify(tracks))
  if (tombstones) saveTombstones(tombstones)
  window.dispatchEvent(new CustomEvent('gsl_tracks'))
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function getTracks() {
  let tracks
  try { tracks = JSON.parse(localStorage.getItem(KEY)) || [] }
  catch { return [] }
  // One-time silent migration: backfill .uid on any item created before uids
  // existed, so tracksSync.js can identify items across devices. Idempotent —
  // items that already have a uid are left untouched.
  let changed = false
  for (const t of tracks) {
    for (const it of (t.items || [])) {
      if (!it.uid) { it.uid = uid(); changed = true }
      // Migrate legacy plain-text notes ({ content }) to the rich block shape
      // the NoteEditor uses. Idempotent — notes that already carry blocks are
      // left untouched. The original text becomes the first text block; the
      // first line doubles as a starter title.
      if (it.type === 'note' && !Array.isArray(it.blocks)) {
        const content = typeof it.content === 'string' ? it.content : ''
        it.id = it.id || uid()
        it.title = it.title || (content.split('\n')[0] || '').replace(/[*~=`#>]/g, '').slice(0, 60)
        it.blocks = [{ id: uid(), type: 'text', content }]
        it.updatedAt = it.updatedAt || it.addedAt || Date.now()
        changed = true
      }
    }
  }
  if (changed) localStorage.setItem(KEY, JSON.stringify(tracks))
  return tracks
}

function save(tracks) {
  localStorage.setItem(KEY, JSON.stringify(tracks))
  window.dispatchEvent(new CustomEvent('gsl_tracks'))
}

export function getTrack(id) {
  return getTracks().find(t => t.id === id) || null
}

export function createTrack(name) {
  const t = { id: uid(), name, createdAt: Date.now(), items: [] }
  save([...getTracks(), t])
  return t
}

export function renameTrack(id, name) {
  save(getTracks().map(t => t.id === id ? { ...t, name, updatedAt: Date.now() } : t))
}

// One-click: (re)build the S / A / B tier tracks from every Foundation module,
// tagged by interview frequency (moduleTiers.js). Rebuilds cleanly on re-run.
// Returns [{ name, count }] for a confirmation message.
export function seedTierTracks() {
  const names = { S: 'S Tier', A: 'A Tier', B: 'B Tier' }
  const now = Date.now()
  const buckets = { S: [], A: [], B: [] }
  for (const m of MODULE_SEARCH_INDEX) {
    const t = tierOf(m.id)
    buckets[t].push({ type: 'concept', itemId: m.id, label: m.title, meta: { tier: t, category: m.gymLabel }, addedAt: now })
  }
  const kept = getTracks().filter(t => !['S Tier', 'A Tier', 'B Tier'].includes(t.name))
  const tierTracks = ['S', 'A', 'B'].map(t => ({ id: uid(), name: names[t], createdAt: now, items: buckets[t] }))
  save([...kept, ...tierTracks])
  return tierTracks.map(t => ({ name: t.name, count: t.items.length }))
}

export function deleteTrack(id) {
  const tombstones = getTombstones()
  saveTombstones({ ...tombstones, trackDeletes: [...tombstones.trackDeletes, { id, deletedAt: Date.now() }] })
  save(getTracks().filter(t => t.id !== id))
}

export function addQuestion(trackId, questionId, title, topic, difficulty) {
  const tracks = getTracks()
  save(tracks.map(t => {
    if (t.id !== trackId) return t
    const already = t.items.some(i => i.type === 'preplab' && i.questionId === questionId)
    if (already) return t
    return { ...t, items: [...t.items, { type: 'preplab', questionId, title, topic, difficulty, addedAt: Date.now(), uid: uid() }] }
  }))
  setLastTrackId(trackId)
}

// ── Plan layer (2026-07-22): tracks double as living study checklists ────────
// Every item is checkable: item.done = { checked, ts } (absent = derive from
// the lab's own completion state where possible — see MyTracks itemAutoDone).
// Toggling bumps updatedAt so the change rides item-level sync merge (newest
// wins, tracksSync.js). Free-text tasks are first-class items: type 'task'.
export function toggleItemDone(trackId, itemUid, checked) {
  save(getTracks().map(t => {
    if (t.id !== trackId) return t
    return { ...t, items: t.items.map(it => it.uid === itemUid
      ? { ...it, done: { checked: !!checked, ts: Date.now() }, updatedAt: Date.now() }
      : it) }
  }))
}

export function addTask(trackId, title) {
  const text = String(title || '').trim()
  if (!text) return
  save(getTracks().map(t => t.id !== trackId ? t : {
    ...t, items: [...t.items, { type: 'task', title: text, label: text, addedAt: Date.now(), updatedAt: Date.now(), uid: uid() }]
  }))
}

// ── Note CRUD (rich, block-based) ─────────────────────────────────────────────

// Create a new rich note. `seedText` (optional) becomes the first text block —
// used by the quick "add a note to this track…" composer.
export function createNote(trackId, title = '', seedText = '') {
  const note = {
    type: 'note',
    id: uid(),
    uid: uid(),
    title,
    blocks: [{ id: uid(), type: 'text', content: seedText }],
    addedAt: Date.now(),
    updatedAt: Date.now(),
  }
  save(getTracks().map(t => {
    if (t.id !== trackId) return t
    return { ...t, items: [...t.items, note] }
  }))
  setLastTrackId(trackId)
  return note
}

// Patch a rich note by its note id — patch can be { title } or { blocks } or both.
export function updateNoteById(trackId, noteId, patch) {
  save(getTracks().map(t => {
    if (t.id !== trackId) return t
    return {
      ...t,
      items: t.items.map(i =>
        i.type === 'note' && i.id === noteId
          ? { ...i, ...patch, updatedAt: Date.now() }
          : i
      ),
    }
  }))
}

export function deleteNoteById(trackId, noteId) {
  const t = getTracks().find(x => x.id === trackId)
  if (!t) return
  const idx = t.items.findIndex(i => i.type === 'note' && i.id === noteId)
  if (idx >= 0) removeItem(trackId, idx)
}

// Legacy alias — kept so older call sites (index-based plain-text edit) keep
// working; getTracks() migration guarantees blocks exist, so this writes the
// text into the first block.
export function updateNote(trackId, index, content) {
  save(getTracks().map(t => {
    if (t.id !== trackId) return t
    return {
      ...t,
      items: t.items.map((it, i) => {
        if (i !== index || it.type !== 'note') return it
        const blocks = Array.isArray(it.blocks) && it.blocks.length
          ? [{ ...it.blocks[0], content }, ...it.blocks.slice(1)]
          : [{ id: uid(), type: 'text', content }]
        return { ...it, content, blocks, updatedAt: Date.now() }
      }),
    }
  }))
}

export function addNote(trackId, content) {
  createNote(trackId, '', content)
}

export function removeItem(trackId, index) {
  const tracks = getTracks()
  const track = tracks.find(t => t.id === trackId)
  const removedItem = track && track.items[index]
  if (removedItem && removedItem.uid) {
    const tombstones = getTombstones()
    saveTombstones({ ...tombstones, itemDeletes: [...tombstones.itemDeletes, { trackId, itemUid: removedItem.uid, deletedAt: Date.now() }] })
  }
  save(tracks.map(t => {
    if (t.id !== trackId) return t
    return { ...t, items: t.items.filter((_, i) => i !== index) }
  }))
}

export function reorderItems(trackId, fromIndex, toIndex) {
  save(getTracks().map(t => {
    if (t.id !== trackId) return t
    const items = [...t.items]
    const [moved] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, moved)
    return { ...t, items }
  }))
}

// Move an item from one track to another (drag-and-drop across tracks).
export function moveItem(fromTrackId, toTrackId, index) {
  if (fromTrackId === toTrackId) return
  const src = getTracks().find(t => t.id === fromTrackId)
  if (!src || index < 0 || index >= src.items.length) return
  const item = src.items[index]
  save(getTracks().map(t => {
    if (t.id === fromTrackId) return { ...t, items: t.items.filter((_, i) => i !== index) }
    if (t.id === toTrackId) return { ...t, items: [...t.items, item] }
    return t
  }))
}

// Remove the first item in a track matching `pred` (untick/remove from the popover).
export function removeItemRef(trackId, pred) {
  const t = getTracks().find(x => x.id === trackId)
  if (!t) return
  const idx = t.items.findIndex(pred)
  if (idx >= 0) removeItem(trackId, idx)
}

export function removeGenericFromTrack(trackId, type, itemId) {
  removeItemRef(trackId, i => i.type === type && String(i.itemId) === String(itemId))
}

export function removeQuestionFromTrack(trackId, questionId) {
  removeItemRef(trackId, i => i.type === 'preplab' && i.questionId === questionId)
}

// Returns array of track IDs containing this question
export function getTracksForQuestion(questionId) {
  return getTracks()
    .filter(t => t.items.some(i => i.type === 'preplab' && i.questionId === questionId))
    .map(t => t.id)
}

// Generic item — { type, itemId, label, meta, addedAt }
export function addItem(trackId, type, itemId, label, meta = {}) {
  const tracks = getTracks()
  save(tracks.map(t => {
    if (t.id !== trackId) return t
    const already = t.items.some(i => i.type === type && i.itemId === String(itemId))
    if (already) return t
    return { ...t, items: [...t.items, { type, itemId: String(itemId), label, meta, addedAt: Date.now(), uid: uid() }] }
  }))
  setLastTrackId(trackId)
}

// Edit an existing generic item's meta in place (by item index). Mirrors
// updateNote's shape/semantics — used e.g. by highlight notes so the
// editable-note UX in MyTracks.jsx works the same for both item kinds.
export function updateItemMeta(trackId, index, metaPatch) {
  save(getTracks().map(t => {
    if (t.id !== trackId) return t
    return { ...t, items: t.items.map((it, i) => (i === index) ? { ...it, meta: { ...(it.meta || {}), ...metaPatch }, updatedAt: Date.now() } : it) }
  }))
}

// Returns array of track IDs containing this generic item
export function getTracksForItem(type, itemId) {
  return getTracks()
    .filter(t => t.items.some(i => i.type === type && i.itemId === String(itemId)))
    .map(t => t.id)
}

// ── Quick-add: skip the picker, drop into the most-recently-used track ────────

function setLastTrackId(id) { try { if (id) localStorage.setItem(LAST_KEY, id) } catch { /* ignore */ } }
export function getLastTrackId() { try { return localStorage.getItem(LAST_KEY) || null } catch { return null } }
export function getLastTrack() { const id = getLastTrackId(); return id ? getTrack(id) : null }
export function getQuickAdd() { try { return localStorage.getItem(QUICK_KEY) === '1' } catch { return false } }
export function setQuickAdd(on) {
  try { localStorage.setItem(QUICK_KEY, on ? '1' : '0'); window.dispatchEvent(new CustomEvent('gsl_tracks')) } catch { /* ignore */ }
}

// Add a generic item straight to the last-used track. Returns the track (for a
// confirmation toast) or null if there's no valid last track.
export function quickAddItem(type, itemId, label, meta = {}) {
  const t = getLastTrack(); if (!t) return null
  addItem(t.id, type, itemId, label, meta); return t
}

// PrepLab-question variant of quickAddItem.
export function quickAddQuestion(questionId, title, topic, difficulty) {
  const t = getLastTrack(); if (!t) return null
  addQuestion(t.id, questionId, title, topic, difficulty); return t
}
