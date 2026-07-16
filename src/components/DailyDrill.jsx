// src/components/DailyDrill.jsx — the Daily Drill: one judgment MCQ per day,
// same question for everyone, Wordle-style.
//
// Mechanics:
//   · Deterministic pick — FNV-1a hash of the local date (+ lab salt) indexes
//     into the MCQ pool, so every visitor gets the same drill on the same day.
//   · Guess until correct; wrong picks lock red, the solve locks green.
//   · Result grid (🟥🟥🟩), streak, best streak, played count, first-try rate —
//     all in localStorage. Share button copies a Wordle-style result block.
//   · Pool is loaded via dynamic import() so the home bundle stays lean.
//
// Storage: '<pfx>-daily-drill-v1' → { history: { 'YYYY-MM-DD': { guesses:[i], solved, qid } } }

import { useState, useEffect, useMemo, useRef } from 'react'
import { recordAttempt, getRatings, getRating } from '../utils/ratings.js'

// ── Lab config ────────────────────────────────────────────────────────────────

const SALT = 'gsl'
const STORE_KEY = 'gsl-daily-drill-v1'
const EPOCH = '2026-07-16' // Drill #1
const LAB_NAME = 'GenAI Systems Lab'
const SHARE_URL = 'https://genai-systems-lab-ivory.vercel.app'

const TOPIC_LABELS = {
  nlp: 'NLP', rag: 'RAG', agents: 'Agents', finetuning: 'Fine-Tuning',
  evaluation: 'Evaluation', llmops: 'LLMOps', safety: 'Safety', product: 'Product',
  behavioral: 'Behavioral', multimodal: 'Multimodal', reasoning: 'Reasoning',
  serving: 'Serving', foundations: 'Foundations',
}

async function loadPool() {
  const m = await import('../data/preplabQuestions.js')
  return (m.PREP_QUESTIONS || [])
    .filter(q => q.type === 'mcq' && !q.gated && Array.isArray(q.options) && q.options.length >= 2 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length)
    .map(q => ({
      qid: q.id,
      tag: TOPIC_LABELS[q.topic] || q.topic || '',
      level: q.difficulty || '',
      context: '',
      question: q.question || '',
      options: q.options,
      answer: q.correct,
      explanation: q.explanation || '',
    }))
}

const T = {
  text: '#f4f4f5', mid: '#d4d4d8', low: '#a1a1aa', ghost: '#71717a',
  border: 'rgba(63,63,70,0.6)', surface: 'rgba(24,24,27,0.9)', bg: 'rgba(9,9,11,0.6)',
  accent: '#8b5cf6', accentFaint: 'rgba(139,92,246,0.15)', accentText: '#a78bfa',
  green: '#34d399', red: '#f87171',
  sans: 'inherit', mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
}

// ── Date + hash helpers ───────────────────────────────────────────────────────

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayNumber(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const [ey, em, ed] = EPOCH.split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / 86400000) + 1
}

function prevKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d) - 86400000)
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`
}

function fnv1a(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// ── Storage ───────────────────────────────────────────────────────────────────

function readStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY))
    return s && typeof s === 'object' && s.history ? s : { history: {} }
  } catch { return { history: {} } }
}

function writeStore(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

function computeStats(history, today) {
  const solvedDays = Object.keys(history).filter(k => history[k]?.solved)
  const played = solvedDays.length
  const firstTry = solvedDays.filter(k => (history[k].guesses || []).length === 1).length
  // "Active" = solved OR bridged by a streak freeze — freezes keep streaks
  // alive but never count as played/solved.
  const active = k => !!(history[k]?.solved || history[k]?.frozen)
  let streak = 0
  let cursor = active(today) ? today : prevKey(today)
  while (active(cursor)) { streak += 1; cursor = prevKey(cursor) }
  let best = 0
  const activeDays = Object.keys(history).filter(active)
  const set = new Set(activeDays)
  for (const d of activeDays) {
    if (set.has(prevKey(d))) continue // not a streak start
    let len = 0, c = d
    while (set.has(c)) {
      len += 1
      const [y, m, dd] = c.split('-').map(Number)
      const n = new Date(Date.UTC(y, m - 1, dd) + 86400000)
      c = `${n.getUTCFullYear()}-${String(n.getUTCMonth() + 1).padStart(2, '0')}-${String(n.getUTCDate()).padStart(2, '0')}`
    }
    best = Math.max(best, len)
  }
  return { played, firstTry, streak, best }
}

function msToMidnight() {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
  return next - now
}


// Animated Elo count-up (Wave 1 motion) — rating ticks from pre- to post-value.
function EloTicker({ delta, rating }) {
  const [shown, setShown] = useState(rating - delta)
  useEffect(() => {
    const from = rating - delta
    const dur = 700
    const t0 = performance.now()
    let raf
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(Math.round(from + eased * delta))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [delta, rating])
  return (
    <>
      {delta >= 0 ? '+' : ''}{delta} elo → <span className="mo-count">{shown}</span>
    </>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DailyDrill({ onTrain }) {
  const [pool, setPool] = useState(null)
  const [store, setStore] = useState(() => readStore())
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [justSolved, setJustSolved] = useState(false)
  const [froze, setFroze] = useState(false)
  const [ratingFx, setRatingFx] = useState(null) // { delta, rating } from today's first guess
  const [showRatings, setShowRatings] = useState(false)
  const mounted = useRef(true)

  const today = todayKey()
  const drillNo = dayNumber(today)
  const entry = store.history[today] || null
  const guesses = entry?.guesses || []
  const solved = !!entry?.solved

  useEffect(() => {
    mounted.current = true
    loadPool().then(p => { if (mounted.current) setPool(p) }).catch(() => { if (mounted.current) setPool([]) })
    return () => { mounted.current = false }
  }, [])

  // Streak freeze: bridge exactly ONE missed day, at most once per week —
  // applied automatically so a single busy day never kills a streak.
  useEffect(() => {
    const s = readStore()
    const y = prevKey(todayKey())
    const y2 = prevKey(y)
    const week = Math.floor(Date.now() / 604800000)
    const activeDay = k => !!(s.history[k]?.solved || s.history[k]?.frozen)
    if (!activeDay(y) && activeDay(y2) && s.lastFreezeWeek !== week) {
      const next = { ...s, lastFreezeWeek: week, history: { ...s.history, [y]: { frozen: true } } }
      writeStore(next)
      setStore(next)
      setFroze(true)
    }
  }, [])

  // Countdown ticker (only while solved — that's when it's shown).
  useEffect(() => {
    if (!solved) return
    function tick() {
      const ms = msToMidnight()
      const h = Math.floor(ms / 3600000), mn = Math.floor((ms % 3600000) / 60000)
      setCountdown(`${h}h ${String(mn).padStart(2, '0')}m`)
    }
    tick()
    const iv = setInterval(tick, 30000)
    return () => clearInterval(iv)
  }, [solved])

  const drill = useMemo(() => {
    if (!pool || !pool.length) return null
    return pool[fnv1a(SALT + ':' + today) % pool.length]
  }, [pool, today])

  const stats = useMemo(() => computeStats(store.history, today), [store, today])

  // Rating context (localStorage-backed; re-reads on solve/panel toggle).
  const domRating = drill ? getRating(drill.tag || 'general') : null
  const ratingsData = useMemo(() => getRatings(), [store, ratingFx, showRatings]) // eslint-disable-line
  const weakest = ratingsData.domains.length >= 2 ? ratingsData.domains[0] : null

  function pick(i) {
    if (solved || guesses.includes(i) || !drill) return
    const nextGuesses = [...guesses, i]
    const isSolve = i === drill.answer
    // Elo: the FIRST guess is the scored attempt — solve-on-retry keeps the
    // streak but the rating already took the first-guess result.
    if (guesses.length === 0) {
      const res = recordAttempt(drill.tag || 'general', isSolve, drill.level)
      setRatingFx({ delta: res.delta, rating: res.rating })
    }
    const nextEntry = { guesses: nextGuesses, solved: isSolve, qid: drill.qid }
    const next = { ...store, history: { ...store.history, [today]: nextEntry } }
    setStore(next)
    writeStore(next)
    if (isSolve) setJustSolved(true)
  }

  function shareText() {
    const grid = guesses.map(g => (g === drill.answer ? '🟩' : '🟥')).join('')
    const tries = guesses.length
    return [
      `BreakLabs Daily Drill #${drillNo} · ${LAB_NAME}`,
      `${grid} ${tries}/${drill.options.length}${tries === 1 ? ' — first try' : ''}`,
      `🔥 ${stats.streak}-day streak · ⚡ ${drill.tag || 'overall'} ${getRating(drill.tag || 'general')}`,
      SHARE_URL,
    ].join('\n')
  }

  function copyShare() {
    try { navigator.clipboard.writeText(shareText()) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const card = {
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
    padding: '18px 20px', fontFamily: T.sans, position: 'relative', overflow: 'hidden',
  }

  if (!pool) {
    return (
      <div style={{ ...card, minHeight: 90, display: 'flex', alignItems: 'center', color: T.ghost, fontSize: 13 }}>
        Loading today’s drill…
      </div>
    )
  }
  if (!drill) return null

  const optionState = i => {
    if (guesses.includes(i)) return i === drill.answer ? 'right' : 'wrong'
    if (solved) return 'idle-locked'
    return 'idle'
  }

  return (
    <div style={card} className={'dd-card' + (justSolved ? ' dd-solved' : '')}>
      <style>{`
        @keyframes ddShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        @keyframes ddPopIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes ddSolve { 0%{transform:scale(1)} 40%{transform:scale(1.02)} 100%{transform:scale(1)} }
        .dd-card .dd-opt { transition: border-color .15s ease, background .15s ease, color .15s ease, transform .12s ease; }
        .dd-card .dd-opt:not(:disabled):hover { border-color: #8b5cf6; transform: translateX(2px); }
        .dd-card .dd-opt:not(:disabled):active { transform: scale(0.985); }
        .dd-card .dd-wrong { animation: ddShake .3s ease; }
        .dd-card .dd-reveal { animation: ddPopIn .3s cubic-bezier(0.16,1,0.3,1) both; }
        .dd-card.dd-solved { animation: ddSolve .35s cubic-bezier(0.34,1.56,0.64,1); }
        @media (prefers-reduced-motion: reduce) { .dd-card, .dd-card * { animation: none !important; transition: none !important; } }
      `}</style>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.accent }}>
          ⚡ Daily Drill #{drillNo}
        </span>
        {drill.tag && (
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.ghost, border: `1px solid ${T.border}`, borderRadius: 999, padding: '1px 8px' }}>
            {drill.tag} · <b style={{ color: T.accentText }}>{domRating}</b>
          </span>
        )}
        {drill.level && (
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.ghost, textTransform: 'capitalize' }}>{drill.level}</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: T.mono, color: stats.streak > 0 ? T.accent : T.ghost, whiteSpace: 'nowrap' }}>
          {stats.streak > 0 ? `🔥 ${stats.streak}-day streak` : 'one judgment call · every day'}
        </span>
      </div>

      {froze && (
        <p style={{ fontSize: 11, fontFamily: T.mono, color: T.ghost, margin: '0 0 8px' }}>
          🧊 Streak freeze used — yesterday's gap was bridged automatically.
        </p>
      )}

      {/* Scenario */}
      {drill.context && (
        <p style={{ fontSize: 13, color: T.mid, lineHeight: 1.65, margin: '0 0 8px' }}>{drill.context}</p>
      )}
      <p style={{ fontSize: 14.5, fontWeight: 700, color: T.text, lineHeight: 1.5, margin: '0 0 12px' }}>{drill.question}</p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {drill.options.map((opt, i) => {
          const st = optionState(i)
          const isWrong = st === 'wrong'
          const isRight = st === 'right'
          return (
            <button
              key={i}
              className={'dd-opt' + (isWrong ? ' dd-wrong' : '') + (solved && st === 'idle-locked' ? ' mo-lock' : '') + (isRight && solved ? ' mo-correct' : '')}
              disabled={solved || guesses.includes(i)}
              onClick={() => pick(i)}
              style={{
                textAlign: 'left', fontFamily: T.sans, fontSize: 13, lineHeight: 1.5,
                padding: '9px 12px', borderRadius: 8, cursor: solved || guesses.includes(i) ? 'default' : 'pointer',
                background: isRight ? 'rgba(52,211,153,0.1)' : isWrong ? 'rgba(224,80,80,0.08)' : T.bg,
                border: `1px solid ${isRight ? T.green : isWrong ? T.red : T.border}`,
                color: isRight ? T.green : isWrong ? T.red : T.mid,
                opacity: solved && st === 'idle-locked' ? 0.55 : 1,
                textDecoration: isWrong ? 'line-through' : 'none',
                animationDelay: solved && st === 'idle-locked' ? `${i * 45}ms` : undefined,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, marginRight: 8, opacity: 0.7 }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Wrong-guess nudge */}
      {!solved && guesses.length > 0 && (
        <p style={{ fontSize: 11.5, color: T.red, margin: '10px 0 0', fontFamily: T.mono }}>
          Not that one — {guesses.length} down, keep going.
        </p>
      )}

      {/* Reveal */}
      {solved && (
        <div className="dd-reveal" style={{ marginTop: 14 }}>
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)',
          }}>
            <div style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.green, marginBottom: 5 }}>
              {guesses.length === 1 ? 'Solved — first try' : `Solved in ${guesses.length}`}
              <span style={{ marginLeft: 8, letterSpacing: 0 }}>{guesses.map(g => (g === drill.answer ? '🟩' : '🟥')).join('')}</span>
              {ratingFx && (
                <span style={{ marginLeft: 10, letterSpacing: 0, color: ratingFx.delta >= 0 ? T.green : T.red }}>
                  <EloTicker delta={ratingFx.delta} rating={ratingFx.rating} />
                </span>
              )}
            </div>
            {drill.explanation && (
              <p style={{ fontSize: 12.5, color: T.mid, lineHeight: 1.65, margin: 0 }}>{drill.explanation}</p>
            )}
          </div>

          {/* Stats + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 14, fontFamily: T.mono, fontSize: 10.5, color: T.ghost }}>
              <span><b style={{ color: T.text, fontSize: 13 }}>{stats.played}</b> played</span>
              <span><b style={{ color: T.text, fontSize: 13 }}>{stats.streak}</b> streak</span>
              <span><b style={{ color: T.text, fontSize: 13 }}>{stats.best}</b> best</span>
              <span><b style={{ color: T.text, fontSize: 13 }}>{stats.played ? Math.round((stats.firstTry / stats.played) * 100) : 0}%</b> first-try</span>
              <button
                onClick={() => setShowRatings(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.accentText, fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, padding: 0 }}
              >{showRatings ? 'Ratings ▴' : 'Ratings ▾'}</button>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10.5, fontFamily: T.mono, color: T.ghost }}>next in {countdown}</span>
              <button
                onClick={copyShare}
                style={{
                  fontFamily: T.mono, fontSize: 11, fontWeight: 700,
                  background: copied ? 'rgba(52,211,153,0.15)' : T.accentFaint,
                  color: copied ? T.green : T.accentText,
                  border: `1px solid ${copied ? T.green : T.accent}`,
                  borderRadius: 7, padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {copied ? 'Copied ✓' : 'Share result'}
              </button>
            </div>
          </div>

          {/* Ratings panel — per-domain Elo, weakest-first */}
          {showRatings && (
            <div className="dd-reveal" style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
              {ratingsData.domains.length === 0 ? (
                <p style={{ fontSize: 11.5, color: T.ghost, fontFamily: T.mono, margin: 0 }}>No rated attempts yet — ratings build from each day's first guess.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.ghost }}>
                    Your ratings · overall <b style={{ color: T.text }}>{ratingsData.overall}</b> · {ratingsData.attempts} rated
                  </div>
                  {ratingsData.domains.map(d => (
                    <div key={d.dom} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: T.mid, width: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{d.dom}</span>
                      <div style={{ flex: 1, height: 5, background: T.bg, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(4, Math.min(100, ((d.rating - 800) / 900) * 100))}%`, height: '100%', background: d === weakest ? T.red : T.accent, borderRadius: 3, transition: 'width 0.4s ease' }} />
                      </div>
                      <b style={{ fontSize: 12, fontFamily: T.mono, color: T.text, width: 40, textAlign: 'right', flexShrink: 0 }}>{d.rating}</b>
                      <span style={{ fontSize: 9.5, fontFamily: T.mono, color: T.ghost, width: 30, flexShrink: 0 }}>×{d.attempts}</span>
                    </div>
                  ))}
                  {weakest && onTrain && (
                    <button
                      onClick={onTrain}
                      style={{ alignSelf: 'flex-start', marginTop: 4, background: 'none', border: `1px solid ${T.border}`, borderRadius: 7, cursor: 'pointer', color: T.accentText, fontFamily: T.mono, fontSize: 11, fontWeight: 700, padding: '5px 10px' }}
                    >Train your weakest — {weakest.dom} ({weakest.rating}) →</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
