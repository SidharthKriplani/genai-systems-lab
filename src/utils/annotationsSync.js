// annotationsSync — cross-device merge for the sticky-notes + highlights blobs
// (2026-07-22). Both stores share one shape: { [bucketKey]: [ {id, ...} ] }.
// Tombstones: [ {k: bucketKey, id, ts} ], written by the delete paths in
// stickyNotes.js / localHighlights.js. Merge rule: per item, newest of
// (editedTs || ts) wins; a tombstone beats an item unless the item was edited
// AFTER the delete. Deletions therefore never resurrect, edits never vanish.
// Pure + idempotent: safe to run on every pull, with map and tombstone rows
// arriving together or separately.

export function mergeAnnotationBlobs(localMap, remoteMap, localTombs, remoteTombs) {
  const lm = localMap || {}, rm = remoteMap || {}
  const lt = Array.isArray(localTombs) ? localTombs : []
  const rt = Array.isArray(remoteTombs) ? remoteTombs : []
  const tomb = new Map()
  for (const t of [...lt, ...rt]) {
    if (!t || !t.k || !t.id) continue
    const key = t.k + '\u0000' + t.id
    const prev = tomb.get(key)
    if (!prev || (t.ts || 0) > (prev.ts || 0)) tomb.set(key, t)
  }
  const recency = (it) => Math.max(it.editedTs || 0, it.ts || 0)
  const out = {}
  for (const b of new Set([...Object.keys(lm), ...Object.keys(rm)])) {
    const byId = new Map()
    for (const it of [...(Array.isArray(rm[b]) ? rm[b] : []), ...(Array.isArray(lm[b]) ? lm[b] : [])]) {
      if (!it || !it.id) continue
      const t = tomb.get(b + '\u0000' + it.id)
      if (t && (t.ts || 0) >= recency(it)) continue
      const prev = byId.get(it.id)
      if (!prev || recency(it) >= recency(prev)) byId.set(it.id, it)
    }
    const arr = [...byId.values()]
    if (arr.length) out[b] = arr
  }
  const tombArr = [...tomb.values()].sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 800)
  return { map: out, tombs: tombArr }
}

// Merge a remote (map, tombs) pair — either may be null/undefined/JSON-string —
// into localStorage under (storeKey, tombKey). Writes the merged result back.
export function applyAnnotationMerge(storeKey, tombKey, remoteMapVal, remoteTombVal) {
  const parse = (v) => {
    if (v == null) return null
    if (typeof v === 'string') { try { return JSON.parse(v) } catch { return null } }
    return v
  }
  let lm = null, lt = null
  try { lm = JSON.parse(localStorage.getItem(storeKey) || 'null') } catch { /* ignore */ }
  try { lt = JSON.parse(localStorage.getItem(tombKey) || 'null') } catch { /* ignore */ }
  const { map, tombs } = mergeAnnotationBlobs(lm, parse(remoteMapVal), lt, parse(remoteTombVal))
  try {
    localStorage.setItem(storeKey, JSON.stringify(map))
    localStorage.setItem(tombKey, JSON.stringify(tombs))
  } catch { /* quota — best effort */ }
}
