// src/utils/tracksSync.js — cross-device merge sync for My Tracks.
//
// Unlike other synced progress (streak, theme, bookmarks — see SYNC_KEYS in
// ../supabase.js), Tracks are a hand-curated, growing artifact edited from
// multiple devices, so whole-value overwrite is unsafe: it would silently
// discard track items added on whichever device didn't happen to sync last.
// This module does a real item-level union merge, using tombstones (see
// getTombstones() in tracks.js) so deletions propagate correctly instead of
// being resurrected by a stale device's local copy.
//
// Reuses the existing generic `user_progress` table (no schema change) under
// its own dedicated key so it never collides with SYNC_KEYS' overwrite path.

import { supabase } from '../supabase.js'
import { getTracks, getTombstones, applyMergedState } from './tracks.js'

const KEY = 'gsl-tracks-v1'
const TOMBSTONE_TTL_DAYS = 180

function pruneTombstones(tombstones) {
  const cutoff = Date.now() - TOMBSTONE_TTL_DAYS * 86400000
  return {
    trackDeletes: (tombstones.trackDeletes || []).filter(t => t.deletedAt > cutoff),
    itemDeletes: (tombstones.itemDeletes || []).filter(t => t.deletedAt > cutoff),
  }
}

function itemIdentity(item) {
  if (item.uid) return item.uid
  if (item.type === 'preplab') return `preplab:${item.questionId}`
  if (item.type === 'note') return `note:${item.addedAt}`
  return `${item.type}:${item.itemId}`
}

function trackLastTouched(t) {
  let max = t.updatedAt || t.createdAt || 0
  for (const it of t.items || []) max = Math.max(max, it.updatedAt || it.addedAt || 0)
  return max
}

function dedupeTombstones(list, keyFn) {
  const seen = new Map()
  for (const t of list) {
    const k = keyFn(t)
    const prev = seen.get(k)
    if (!prev || t.deletedAt > prev.deletedAt) seen.set(k, t)
  }
  return [...seen.values()]
}

// Exported for standalone testing — pure function, no localStorage/network.
export function mergeTracks(local, remote) {
  const localTombstones = pruneTombstones(local.tombstones || {})
  const remoteTombstones = pruneTombstones(remote.tombstones || {})

  const deletedTrackIds = new Set([
    ...localTombstones.trackDeletes.map(t => t.id),
    ...remoteTombstones.trackDeletes.map(t => t.id),
  ])
  const deletedItemKeys = new Set([
    ...localTombstones.itemDeletes.map(t => `${t.trackId}::${t.itemUid}`),
    ...remoteTombstones.itemDeletes.map(t => `${t.trackId}::${t.itemUid}`),
  ])

  const byId = new Map()
  for (const t of [...(local.tracks || []), ...(remote.tracks || [])]) {
    if (deletedTrackIds.has(t.id)) continue
    const existing = byId.get(t.id)
    if (!existing) { byId.set(t.id, { ...t, items: [...t.items] }); continue }
    const merged = trackLastTouched(t) > trackLastTouched(existing) ? { ...t } : { ...existing }
    const itemMap = new Map()
    for (const it of [...existing.items, ...t.items]) {
      const key = itemIdentity(it)
      if (deletedItemKeys.has(`${merged.id}::${key}`)) continue
      const prev = itemMap.get(key)
      if (!prev || (it.updatedAt || it.addedAt || 0) > (prev.updatedAt || prev.addedAt || 0)) itemMap.set(key, it)
    }
    merged.items = [...itemMap.values()].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
    byId.set(t.id, merged)
  }
  for (const [id, t] of byId) {
    t.items = t.items.filter(it => !deletedItemKeys.has(`${id}::${itemIdentity(it)}`))
  }

  const tracks = [...byId.values()].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
  const tombstones = {
    trackDeletes: dedupeTombstones([...localTombstones.trackDeletes, ...remoteTombstones.trackDeletes], t => t.id),
    itemDeletes: dedupeTombstones([...localTombstones.itemDeletes, ...remoteTombstones.itemDeletes], t => `${t.trackId}::${t.itemUid}`),
  }
  return { tracks, tombstones }
}

let pushTimer = null

// Debounced auto-push, called after every local track mutation (wired in App.jsx
// via a listener on the 'gsl_tracks' event tracks.js already dispatches).
export function scheduleTracksPush(user) {
  if (!user || !supabase) return
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => { pushTracksNow(user) }, 1500)
}

export async function pushTracksNow(user) {
  if (!user || !supabase) return { error: null }
  const value = { tracks: getTracks(), tombstones: getTombstones() }
  return supabase.from('user_progress').upsert(
    [{ user_id: user.id, key: KEY, value, updated_at: new Date().toISOString() }],
    { onConflict: 'user_id,key' }
  )
}

// Pull remote, merge with local, write merged result back locally, then push
// the merged result so both sides converge immediately. Call on sign-in and
// from the manual "Sync now" button.
export async function pullAndMergeTracks(user) {
  if (!user || !supabase) return { error: null }
  const { data, error } = await supabase
    .from('user_progress').select('value').eq('user_id', user.id).eq('key', KEY).maybeSingle()
  if (error) return { error }
  const remote = data?.value || { tracks: [], tombstones: {} }
  const local = { tracks: getTracks(), tombstones: getTombstones() }
  const merged = mergeTracks(local, remote)
  applyMergedState(merged)
  await pushTracksNow(user)
  return { error: null }
}
