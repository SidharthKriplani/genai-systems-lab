// src/Leaderboard.jsx
// Global leaderboard — top scorers across the GenAI Systems Lab
// Adapted from PAL Leaderboard.jsx; zinc/CSS-var styling, no lucide-react

import { useState, useEffect } from "react";
import { fetchLeaderboard, upsertLeaderboardRow, computeBreakdown, getDisplayName } from "./leaderboardUtils";

// ─── SCORE TIER BADGE ─────────────────────────────────────────────────────────

function scoreTier(score) {
  if (score >= 500) return { label: "Elite",      color: "text-amber-400 bg-amber-950 border-amber-700" };
  if (score >= 200) return { label: "Advanced",   color: "text-violet-400 bg-violet-950 border-violet-700" };
  if (score >= 80)  return { label: "Proficient", color: "text-sky-400 bg-sky-950 border-sky-700" };
  if (score >= 20)  return { label: "Learning",   color: "text-emerald-400 bg-emerald-950 border-emerald-700" };
  return               { label: "Starter",      color: "text-zinc-400 bg-zinc-800 border-zinc-600" };
}

function RankMedal({ rank }) {
  if (rank === 1) return <span className="text-amber-400 font-black text-base">🥇</span>;
  if (rank === 2) return <span className="text-zinc-300 font-black text-base">🥈</span>;
  if (rank === 3) return <span className="text-amber-700 font-black text-base">🥉</span>;
  return <span className="text-zinc-500 font-mono text-sm w-5 inline-block text-center">{rank}</span>;
}

// ─── YOUR STANDING CARD ───────────────────────────────────────────────────────

// ─── FIELD BENCHMARK ──────────────────────────────────────────────────────────
// Computes You / Field avg / Top 10% + percentile from the already-fetched board
// rows. p90 = the 90th-percentile score (nearest-rank method). Percentile = share
// of participants with a strictly lower score than you. Guards for an empty board.
function computeBenchmark(rows, myScore) {
  const scores = (rows || []).map(r => r.total_score || 0).filter(s => s >= 0);
  const n = scores.length;
  if (n === 0) return null;
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / n);
  const sorted = [...scores].sort((a, b) => a - b);
  // 90th-percentile score (nearest-rank; clamp index into range)
  const idx = Math.min(n - 1, Math.max(0, Math.ceil(0.9 * n) - 1));
  const p90 = sorted[idx];
  // Percentile: % of participants you're strictly ahead of.
  const below = sorted.filter(s => s < myScore).length;
  const aheadPct = Math.round((below / n) * 100);
  const max = sorted[n - 1] || 1;
  return { avg, p90, aheadPct, max, n };
}

function BenchmarkBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${pct}%`, transform: "translateX(-50%)" }}>
      <div className="w-0.5 h-full rounded-full" style={{ background: color }} />
      <span className="text-[9px] font-mono font-bold whitespace-nowrap mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

function YourStandingCard({ user, rows }) {
  const bd = computeBreakdown();
  const myRow = user ? rows.find(r => r.user_id === user.id) : null;
  const myRank = myRow ? rows.indexOf(myRow) + 1 : null;
  const tier = scoreTier(bd.total);
  const bench = computeBenchmark(rows, bd.total);

  return (
    <div className="rounded-xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-0.5">Your standing</p>
          <p className="text-2xl font-black text-white tabular-nums">{bd.total.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">total score</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${tier.color}`}>{tier.label}</span>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { val: bd.prepScore,      label: "PrepLab",    sub: `${bd.questionsAnswered} correct` },
          { val: bd.conceptsScore,  label: "Concepts",   sub: `${bd.modulesMastered} modules` },
          { val: bd.scenarioScore,  label: "RAG Lab",    sub: `${bd.scenariosPassed} passed` },
        ].map(({ val, label, sub }) => (
          <div key={label} className="rounded-lg border p-2.5 text-center" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
            <p className="text-base font-black text-white tabular-nums">{val}</p>
            <p className="text-[10px] font-semibold text-zinc-300">{label}</p>
            <p className="text-[10px] text-zinc-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* vs Field benchmark — You / Field avg / Top 10% + percentile */}
      {bench ? (
        <div className="rounded-lg border p-3 space-y-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-center gap-4 text-[11px] font-mono">
            <span style={{ color: "var(--gal-build)" }}>You: <span className="font-bold">{bd.total.toLocaleString()}</span></span>
            <span className="text-zinc-500">Field avg: <span className="font-bold text-zinc-300">{bench.avg.toLocaleString()}</span></span>
            <span className="text-violet-400">Top 10%: <span className="font-bold">{bench.p90.toLocaleString()}</span></span>
          </div>
          {/* Marker bar: You / Avg / Top-10% positioned on a 0..max track */}
          <div className="relative h-1 rounded-full mx-2 mb-5" style={{ background: "rgba(63,63,70,0.6)" }}>
            <BenchmarkBar label="avg"    value={bench.avg}      max={bench.max} color="#a1a1aa" />
            <BenchmarkBar label="top 10%" value={bench.p90}     max={bench.max} color="#a78bfa" />
            <BenchmarkBar label="you"    value={bd.total}       max={bench.max} color="var(--gal-build)" />
          </div>
          <p className="text-[11px] text-zinc-400 text-center">
            Ahead of <span className="text-white font-bold">{bench.aheadPct}%</span> of participants
          </p>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 text-center italic">Be the first on the board.</p>
      )}

      {/* Rank line */}
      {myRank && (
        <p className="text-xs text-zinc-400 text-center">
          You're ranked <span className="text-white font-bold">#{myRank}</span> out of {rows.length} engineers
        </p>
      )}
      {!user && (
        <p className="text-xs text-zinc-500 text-center italic">Sign in to appear on the global board</p>
      )}
    </div>
  );
}

// ─── SCORING LEGEND ───────────────────────────────────────────────────────────

function ScoringLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        style={{ background: "var(--surface)" }}>
        <span>How scores are calculated</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-2" style={{ background: "var(--surface)" }}>
          <p className="text-[11px] text-zinc-500 leading-relaxed">Points are weighted by difficulty — harder work scores more.</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
            {[
              ["PrepLab — beginner",    "1 pt / correct"],
              ["PrepLab — easy",        "2 pts / correct"],
              ["PrepLab — intermediate","3 pts / correct"],
              ["PrepLab — medium",      "3 pts / correct"],
              ["PrepLab — hard",        "5 pts / correct"],
              ["PrepLab — staff",       "8 pts / correct"],
              ["Concepts module",       "3 pts / mastered"],
              ["RAG Lab scenario",      "5 pts / passed"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-zinc-500">{k}</span>
                <span className="text-zinc-300 font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LEADERBOARD ROW ──────────────────────────────────────────────────────────

function BoardRow({ row, rank, isMe }) {
  const tier = scoreTier(row.total_score);
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
      isMe ? "border-zinc-500" : ""
    }`} style={{
      background: isMe ? "var(--surface)" : "transparent",
      borderColor: isMe ? "var(--gal-build)" : "var(--border)",
    }}>
      <div className="w-6 flex-shrink-0 flex items-center justify-center">
        <RankMedal rank={rank} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isMe ? "text-white" : "text-zinc-200"}`}>
          {row.display_name}
          {isMe && <span className="ml-2 text-[10px] font-mono text-zinc-500">(you)</span>}
        </p>
        <p className="text-[11px] text-zinc-600">{row.questions_answered ?? 0} questions answered</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-black text-white tabular-nums">{row.total_score.toLocaleString()}</p>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tier.color}`}>{tier.label}</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function GlobalLeaderboard({ user }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [pushed, setPushed]   = useState(false);

  // Push user's score then fetch board
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (user && !pushed) {
          await upsertLeaderboardRow(user);
          setPushed(true);
        }
        const data = await fetchLeaderboard(100);
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError("Could not load leaderboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">GenAI Systems Lab</p>
        <h1 className="text-2xl font-black text-white">Leaderboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Top engineers by weighted practice score — PrepLab, Concepts, and RAG Lab combined.</p>
      </div>

      {/* Your standing */}
      <YourStandingCard user={user} rows={rows} />

      {/* Scoring legend */}
      <ScoringLegend />

      {/* Global board */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Top 100</p>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mb-3" />
            <p className="text-xs text-zinc-500">Loading board...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
            <p className="text-sm text-zinc-500">{error}</p>
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center space-y-2">
            <p className="text-sm text-zinc-400">No scores yet — be the first on the board.</p>
            <p className="text-xs text-zinc-600">Answer PrepLab questions, master Concepts modules, or pass RAG Lab scenarios to appear here.</p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="space-y-1">
            {rows.map((row, i) => (
              <BoardRow
                key={row.user_id}
                row={row}
                rank={i + 1}
                isMe={user?.id === row.user_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
