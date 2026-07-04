// src/ReadinessWidget.jsx — standardized cross-lab readiness widget (GSL)
// Mirrors PAL's src/components/shared/ReadinessWidget.jsx structurally, but reuses
// GSL's EXISTING capped-breadth readiness computation (getOverallReadiness from
// readiness.js) rather than reinventing a score. GSL dark / cyan (var(--gal-build))
// theme with violet accent.
//
// Shows:
//  - overall interview-readiness % + level label + themed progress bar
//  - a Target block: company <select> (GSL COMPANIES) + target interview <input date>.
//    When both set → "N days to your {Company} interview". Persisted in localStorage.
//  - a weakest-area CTA that deep-links via onNavigate(weakest.id).
//
// localStorage key: gsl-readiness-target  → { company, date } (JSON)

import { useState } from "react";
import { getOverallReadiness } from "./readiness";
import { COMPANIES } from "./data/companyTracks.js";

const TARGET_KEY = "gsl-readiness-target";

function readTarget() {
  try {
    const raw = JSON.parse(localStorage.getItem(TARGET_KEY) || "null");
    if (raw && typeof raw === "object") return { company: raw.company || "", date: raw.date || "" };
  } catch { /* ignore */ }
  return { company: "", date: "" };
}

function writeTarget(next) {
  try {
    if (!next.company && !next.date) localStorage.removeItem(TARGET_KEY);
    else localStorage.setItem(TARGET_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

function daysUntil(isoDate) {
  if (!isoDate) return null;
  const target = new Date(isoDate + "T00:00:00");
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function ReadinessWidget({ onNavigate } = {}) {
  const overall = getOverallReadiness(); // { score, level, color, weakest, areas }
  const { score, level, color, weakest } = overall;

  const [target, setTarget] = useState(readTarget);
  const [editing, setEditing] = useState(false);

  function update(patch) {
    const next = { ...target, ...patch };
    setTarget(next);
    writeTarget(next);
  }

  const days = daysUntil(target.date);
  const company = target.company || "";

  // Countdown copy
  let countdownText;
  if (days == null) {
    countdownText = "Set a target interview";
  } else if (days < 0) {
    countdownText = company ? `${company} interview date passed` : "Interview date passed";
  } else if (days === 0) {
    countdownText = company ? `Today — your ${company} interview` : "Interview is today";
  } else {
    const dayWord = days === 1 ? "day" : "days";
    countdownText = company
      ? `${days} ${dayWord} to your ${company} interview`
      : `${days} ${dayWord} to your interview`;
  }
  const hasTarget = days != null;

  return (
    <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Header row: label + edit toggle */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">Interview readiness</p>
        <button
          onClick={() => setEditing(e => !e)}
          className="text-[10px] font-mono font-bold transition-colors hover:text-white"
          style={{ color: hasTarget ? "#a78bfa" : "var(--gal-build)" }}>
          {editing ? "Close" : hasTarget ? "Edit target" : "Set a target interview →"}
        </button>
      </div>

      {/* Score + level */}
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-black leading-none tracking-tight" style={{ color }}>{score}%</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>{level}</span>
      </div>

      {/* Themed progress bar */}
      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>

      {/* Countdown chip */}
      <div>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-90"
          style={hasTarget
            ? { background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.35)", color: "#c4b5fd" }
            : { background: "var(--gal-build-tint)", border: "1px solid var(--gal-build-border)", color: "var(--gal-build)" }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: hasTarget ? "#a78bfa" : "var(--gal-build)" }} />
          {countdownText}
        </button>
      </div>

      {/* Target editor (collapsible) */}
      {editing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Target company</span>
            <select
              value={company}
              onChange={e => update({ company: e.target.value })}
              className="text-sm rounded-lg px-3 py-2 outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "#e4e4e7" }}>
              <option value="">No company set</option>
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Target interview date</span>
            <input
              type="date"
              value={target.date}
              onChange={e => update({ date: e.target.value })}
              className="text-sm rounded-lg px-3 py-2 outline-none"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "#e4e4e7", colorScheme: "dark" }}
            />
          </label>
          {(target.company || target.date) && (
            <button
              onClick={() => { update({ company: "", date: "" }); }}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors justify-self-start">
              Clear target
            </button>
          )}
        </div>
      )}

      {/* Weakest-area CTA */}
      {weakest && (
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-zinc-800/60">
          <div className="text-sm text-zinc-300">
            Work on <span className="font-bold text-white">{weakest.label}</span> next
            <span className="text-xs text-zinc-500 ml-1.5">({weakest.pct}%)</span>
          </div>
          <button
            onClick={() => onNavigate && onNavigate(weakest.id)}
            className="text-xs font-mono font-bold px-4 py-2 rounded-lg transition-all hover:opacity-80 whitespace-nowrap"
            style={{ background: (weakest.color || "var(--gal-build)") + "18", border: `1px solid ${(weakest.color || "var(--gal-build)")}40`, color: weakest.color || "var(--gal-build)" }}>
            Work on {weakest.label} →
          </button>
        </div>
      )}
    </div>
  );
}
