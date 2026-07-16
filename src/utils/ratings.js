// src/utils/ratings.js — per-domain drill rating (Elo-style), local-first.
//
// The keystone of "progress feels like a rating, not a checklist": every scored
// attempt (currently the Daily Drill; other surfaces can call recordAttempt the
// same way) adjusts a per-domain rating. Difficulty maps to an opponent rating;
// K decays as attempt count grows, so early ratings move fast and settle.
//
// Storage: '<pfx>-ratings-v1' →
//   { domains: { [domain]: { r, n, w } }, log: [{ t, dom, ok, delta, diff }] }
//   log is capped (newest kept) — enough for miss-pattern analysis, no bloat.

const KEY = 'gsl-ratings-v1'
const START = 1200
const LOG_CAP = 500

// Difficulty → opponent rating. Covers each lab's vocabulary; unknown → 1200.
const DIFF_R = {
  easy: 1000, beginner: 1000, foundational: 1000,
  junior: 1050, analyst: 1050,
  medium: 1200, intermediate: 1200, mid: 1200,
  senior: 1350,
  hard: 1400, advanced: 1400,
  staff: 1500, master: 1500,
}

function read() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s && typeof s === 'object' && s.domains) return { domains: s.domains, log: Array.isArray(s.log) ? s.log : [] }
  } catch { /* ignore */ }
  return { domains: {}, log: [] }
}

function write(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

// Record one scored attempt. Returns { rating, delta, attempts }.
export function recordAttempt(domain, correct, difficulty) {
  const dom = String(domain || 'general').trim() || 'general'
  const s = read()
  const d = s.domains[dom] || { r: START, n: 0, w: 0 }
  const opp = DIFF_R[String(difficulty || '').toLowerCase()] || 1200
  const expected = 1 / (1 + Math.pow(10, (opp - d.r) / 400))
  const K = d.n < 10 ? 48 : d.n < 30 ? 32 : 20
  const delta = Math.round(K * ((correct ? 1 : 0) - expected))
  const next = { r: d.r + delta, n: d.n + 1, w: d.w + (correct ? 1 : 0) }
  s.domains[dom] = next
  s.log.push({ t: Date.now(), dom, ok: !!correct, delta, diff: difficulty || '' })
  if (s.log.length > LOG_CAP) s.log = s.log.slice(-LOG_CAP)
  write(s)
  return { rating: next.r, delta, attempts: next.n }
}

// All domains, sorted weakest-first, plus an attempt-weighted overall rating.
export function getRatings() {
  const s = read()
  const domains = Object.entries(s.domains)
    .map(([dom, d]) => ({ dom, rating: d.r, attempts: d.n, wins: d.w }))
    .sort((a, b) => a.rating - b.rating)
  const totalN = domains.reduce((n, d) => n + d.attempts, 0)
  const overall = totalN
    ? Math.round(domains.reduce((sum, d) => sum + d.rating * d.attempts, 0) / totalN)
    : START
  return { domains, overall, attempts: totalN }
}

export function getRating(domain) {
  const s = read()
  const d = s.domains[String(domain || 'general').trim() || 'general']
  return d ? d.r : START
}

// Miss pattern: per-domain miss share from the attempt log (recent-weighted by cap).
export function getMissPattern() {
  const s = read()
  const by = {}
  for (const e of s.log) {
    if (!by[e.dom]) by[e.dom] = { misses: 0, total: 0 }
    by[e.dom].total += 1
    if (!e.ok) by[e.dom].misses += 1
  }
  return Object.entries(by)
    .map(([dom, v]) => ({ dom, misses: v.misses, total: v.total, rate: v.total ? v.misses / v.total : 0 }))
    .sort((a, b) => b.misses - a.misses)
}
