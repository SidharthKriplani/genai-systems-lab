// src/utils/tracks.js — My Tracks local storage layer for genai-systems-lab
// localStorage key: 'gsl-tracks-v1'
// Track shape: { id, name, createdAt, items: [...] }
// PrepLab item: { type: 'preplab', questionId, title, topic, difficulty, addedAt }
// Note item:    { type: 'note', content, addedAt }

const KEY = 'gsl-tracks-v1'

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function getTracks() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] }
  catch { return [] }
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
  save(getTracks().map(t => t.id === id ? { ...t, name } : t))
}

export function deleteTrack(id) {
  save(getTracks().filter(t => t.id !== id))
}

export function addQuestion(trackId, questionId, title, topic, difficulty) {
  const tracks = getTracks()
  save(tracks.map(t => {
    if (t.id !== trackId) return t
    const already = t.items.some(i => i.type === 'preplab' && i.questionId === questionId)
    if (already) return t
    return { ...t, items: [...t.items, { type: 'preplab', questionId, title, topic, difficulty, addedAt: Date.now() }] }
  }))
}

export function addNote(trackId, content) {
  const tracks = getTracks()
  save(tracks.map(t => {
    if (t.id !== trackId) return t
    return { ...t, items: [...t.items, { type: 'note', content, addedAt: Date.now() }] }
  }))
}

export function removeItem(trackId, index) {
  save(getTracks().map(t => {
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

// Returns array of track IDs containing this question
export function getTracksForQuestion(questionId) {
  return getTracks()
    .filter(t => t.items.some(i => i.type === 'preplab' && i.questionId === questionId))
    .map(t => t.id)
}
