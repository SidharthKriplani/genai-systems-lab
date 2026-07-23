// tasksStore — "My Tasks" data layer (D24, 2026-07-23). Storage shape mirrors
// reviewCards.js / stickyNotes.js / localHighlights.js on purpose: a single
// localStorage blob keyed by FIXED bucket names ("lists", "tasks") + a
// parallel tombstone array — so this store plugs directly into the existing
// annotationsSync.js per-item merge (mergeAnnotationBlobs/applyAnnotationMerge)
// with ZERO new sync logic: just registering the (store, tomb) key pair in
// supabase.js's module-scope ANNOT_PAIRS + adding both keys to SYNC_KEYS,
// exactly like gsl-review-cards-v1 already does (see reviewCards.js's own
// header comment for the precedent this file follows).
//
// Two FIXED buckets under one key ("lists", "tasks"), not one bucket per
// list/page the way reviewCards.js buckets per pageKey — there's no natural
// per-item partition key here, so "lists"/"tasks" are a degenerate case of
// the SAME generic merge shape, not a new one.
//
// Merge granularity (mirrors stickyNotes.js precedent exactly, see its
// StickyNotes.jsx caller): a task is merged as ONE ATOMIC ITEM by
// (editedTs||ts) recency, including its steps[] sub-array — same as a
// sticky note's whole body/color is atomic per merge, never field-merged.
// Concretely: if device A checks off a step while device B (offline) renames
// the same task's title, whichever write has the later editedTs wins
// WHOLESALE on next sync — the other device's change is lost, not merged.
// This is the existing annotations precedent's known tradeoff, not a new gap
// introduced here — every store that plugs into applyAnnotationMerge has it.
//
// FLAGGED cross-device edge case, resolved by precedent rather than invented
// from nothing: deleting a list tombstones the list AND cascades tombstones
// to its tasks (plain CRUD cascade — necessary regardless of sync, tracks.js
// does the same for its own tracks/items). But per-item merge has no
// foreign-key awareness: if device A deletes a list+its tasks while device B
// is offline and concurrently adds a NEW task to that same list, device B's
// task survives the merge (different id, no tombstone match) but now points
// at a listId nothing resolves to. Rather than inventing a new GC/merge
// policy to silently sweep it, this mirrors stickyNotes.js's own precedent
// for "never silently lose data" (its unanchored-notes tray): orphaned tasks
// surface under a synthetic "Unfiled" bucket (see listOrphanTasks() below)
// instead of vanishing. Residual risk: if the user then deletes "Unfiled"
// tasks expecting them restorable elsewhere, they are not — same permanence
// as any other delete in this store.

const KEY = 'gsl_tasks_v1'
export const TASKS_STORE_KEY = KEY
export const TASKS_TOMB_KEY = 'gsl_tasks_v1-tomb-v1'
// Plain scalar preference, its OWN key — deliberately NOT part of the
// {lists,tasks} merge blob above (a bare number isn't an array-of-items, so
// it doesn't fit that bucket shape). Synced instead via the simple
// local-wins-if-present rule pullProgress already applies to every non-ANNOT
// key in SYNC_KEYS — exactly how "gsl-streak" (a bare count) is already
// synced. No new sync logic, just reusing the OTHER existing precedent for
// scalar values.
export const MYDAY_TARGET_KEY = 'gsl-tasks-myday-target-v1'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

function writeTombstone(bucket, id) {
  try {
    const arr = JSON.parse(localStorage.getItem(TASKS_TOMB_KEY) || '[]')
    arr.push({ k: bucket, id, ts: Date.now() })
    localStorage.setItem(TASKS_TOMB_KEY, JSON.stringify(arr.slice(-800)))
  } catch { /* ignore */ }
}

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {} } catch { return {} }
}
function writeAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { /* full/blocked -- best effort */ }
  // Same-tab live refresh (feature-specific, mirrors reviewCards.js's 'gsl_review').
  try { window.dispatchEvent(new CustomEvent('gsl_tasks')) } catch { /* SSR */ }
  // Debounced cross-device push trigger — the SAME event every annotation
  // store dispatches on every write (App.jsx's 'annotations-changed'
  // listener -> schedulePush). Zero new sync wiring.
  try { window.dispatchEvent(new CustomEvent('annotations-changed')) } catch { /* SSR */ }
}

// ── Lists ────────────────────────────────────────────────────────────────
export function listLists() {
  const all = readAll()
  return (all.lists || []).slice().sort((a, b) => (a.ts || 0) - (b.ts || 0))
}

export function createList(name) {
  const all = readAll()
  const list = { id: genId(), name: (name || '').trim() || 'New list', ts: Date.now() }
  all.lists = [...(all.lists || []), list]
  writeAll(all)
  return list
}

export function renameList(id, name) {
  const all = readAll()
  all.lists = (all.lists || []).map(l =>
    l.id === id ? { ...l, name: (name || '').trim() || l.name, editedTs: Date.now() } : l)
  writeAll(all)
}

export function deleteList(id) {
  const all = readAll()
  const orphanIds = (all.tasks || []).filter(t => t.listId === id).map(t => t.id)
  writeTombstone('lists', id)
  orphanIds.forEach(tid => writeTombstone('tasks', tid))
  all.lists = (all.lists || []).filter(l => l.id !== id)
  all.tasks = (all.tasks || []).filter(t => t.listId !== id)
  writeAll(all)
}

// ── Tasks ────────────────────────────────────────────────────────────────
// Secondary sort by `ts` (creation time) breaks ties when two devices
// quick-add offline and land on the same `order` value after merge — cheap
// defensive determinism, not a merge-policy change (both tasks always
// survive either way; this only fixes which one sorts first).
export function listTasks(listId) {
  const all = readAll()
  return (all.tasks || [])
    .filter(t => t.listId === listId)
    .sort((a, b) => (a.order || 0) - (b.order || 0) || (a.ts || 0) - (b.ts || 0))
}

export function listAllTasks() {
  const all = readAll()
  return (all.tasks || []).slice()
}

// Tasks whose listId doesn't resolve to any known list — see the header
// comment's FLAGGED cross-device race. Surfaced, never silently dropped.
export function listOrphanTasks() {
  const all = readAll()
  const knownIds = new Set((all.lists || []).map(l => l.id))
  return (all.tasks || [])
    .filter(t => !knownIds.has(t.listId))
    .sort((a, b) => (a.order || 0) - (b.order || 0) || (a.ts || 0) - (b.ts || 0))
}

export function addTask(listId, title, opts = {}) {
  const all = readAll()
  const siblingCount = (all.tasks || []).filter(t => t.listId === listId).length
  const task = {
    id: genId(), listId, title: (title || '').trim(), done: false, doneTs: null,
    star: false, notes: '', steps: [],
    moduleId: opts.moduleId || null, gymId: opts.gymId || null,
    myDay: false, order: siblingCount, ts: Date.now(),
  }
  all.tasks = [...(all.tasks || []), task]
  writeAll(all)
  return task
}

function patchTask(all, id, patch) {
  all.tasks = (all.tasks || []).map(t => t.id === id ? { ...t, ...patch, editedTs: Date.now() } : t)
}

export function updateTask(id, patch) {
  const all = readAll()
  patchTask(all, id, patch)
  writeAll(all)
}

export function toggleDone(id) {
  const all = readAll()
  const t = (all.tasks || []).find(x => x.id === id)
  if (!t) return
  const done = !t.done
  patchTask(all, id, { done, doneTs: done ? Date.now() : null })
  writeAll(all)
}

export function toggleStar(id) {
  const all = readAll()
  const t = (all.tasks || []).find(x => x.id === id)
  if (!t) return
  patchTask(all, id, { star: !t.star })
  writeAll(all)
}

export function toggleMyDay(id) {
  const all = readAll()
  const t = (all.tasks || []).find(x => x.id === id)
  if (!t) return
  patchTask(all, id, { myDay: !t.myDay })
  writeAll(all)
}

export function moveTaskToList(id, listId) {
  const all = readAll()
  const siblingCount = (all.tasks || []).filter(t => t.listId === listId).length
  patchTask(all, id, { listId, order: siblingCount })
  writeAll(all)
}

export function deleteTask(id) {
  writeTombstone('tasks', id)
  const all = readAll()
  all.tasks = (all.tasks || []).filter(t => t.id !== id)
  writeAll(all)
}

// ── Steps (sub-checklist within a task; part of the task's atomic merge) ──
export function addStep(taskId, text) {
  const all = readAll()
  const t = (all.tasks || []).find(x => x.id === taskId)
  if (!t) return
  const steps = [...(t.steps || []), { id: genId(), text: (text || '').trim(), done: false }]
  patchTask(all, taskId, { steps })
  writeAll(all)
}

export function toggleStep(taskId, stepId) {
  const all = readAll()
  const t = (all.tasks || []).find(x => x.id === taskId)
  if (!t) return
  const steps = (t.steps || []).map(s => s.id === stepId ? { ...s, done: !s.done } : s)
  patchTask(all, taskId, { steps })
  writeAll(all)
}

export function removeStep(taskId, stepId) {
  const all = readAll()
  const t = (all.tasks || []).find(x => x.id === taskId)
  if (!t) return
  const steps = (t.steps || []).filter(s => s.id !== stepId)
  patchTask(all, taskId, { steps })
  writeAll(all)
}

// ── Import as checklist ─────────────────────────────────────────────────
// moduleIndex is passed in by the caller (MODULE_SEARCH_INDEX) rather than
// imported here — keeps this store decoupled from data/moduleSearchIndex.js,
// the same "shared-by-copy" decoupling BreaklabsChrome.jsx's own header
// comment asks components to keep across labs, and makes this file trivial
// to unit-test with a synthetic index.
export function importGymAsChecklist(gymId, moduleIndex, listName, tierOfFn, tierFilter) {
  const all = readAll()
  const list = { id: genId(), name: (listName || '').trim() || 'New list', ts: Date.now() }
  let modules = (moduleIndex || []).filter(m => m.gymId === gymId)
  if (tierFilter === 'S' && tierOfFn) modules = modules.filter(m => tierOfFn(m.id) === 'S')
  else if (tierFilter === 'S+A' && tierOfFn) modules = modules.filter(m => tierOfFn(m.id) === 'S' || tierOfFn(m.id) === 'A')
  const now = Date.now()
  const newTasks = modules.map((m, i) => ({
    id: genId(), listId: list.id, title: m.title, done: false, doneTs: null,
    star: false, notes: '', steps: [], moduleId: m.id, gymId: m.gymId,
    myDay: false, order: i, ts: now + i, // +i: stable creation order even though Date.now()
                                          // alone could collide across a fast bulk import
  }))
  all.lists = [...(all.lists || []), list]
  all.tasks = [...(all.tasks || []), ...newTasks]
  writeAll(all)
  return { list, count: newTasks.length }
}

// ── My Day daily target (plain scalar pref, own key — see header note) ───
export function getMyDayTarget() {
  try { return Number(JSON.parse(localStorage.getItem(MYDAY_TARGET_KEY) || '5')) || 5 } catch { return 5 }
}
export function setMyDayTarget(n) {
  try { localStorage.setItem(MYDAY_TARGET_KEY, JSON.stringify(Math.max(1, Math.round(n) || 5))) } catch { /* ignore */ }
  try { window.dispatchEvent(new CustomEvent('gsl_tasks')) } catch { /* SSR */ }
}

// Local-day helper for My Day's "done today" count — calendar day in the
// user's own timezone, not a UTC-boundary approximation.
export function isToday(ts) {
  if (!ts) return false
  const d = new Date(ts), now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}
