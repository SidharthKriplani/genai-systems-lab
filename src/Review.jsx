// src/Review.jsx — Spaced-repetition Review room for GenAI Systems Lab.
//
// Ported from MSL's ReviewTab (src/tabs/ReviewTab.jsx). Same spaced-rep model:
// SM-2-lite — intervals grow with the number of times an item has been reviewed
// (3 → 7 → 21 → 45 → 90 days). The clock for the next review runs from the last
// review, or from when the item was first learned if it has never been reviewed.
//
// Additive surface. Reads GSL's EXISTING completion signals — never writes to them:
//   • gsl-concepts-mastery   — JSON array of mastered Concepts module ids
//   • gsl-casechain-history  — { [chainId]: { completed, at } }
// Scheduling state lives in a NEW key, gsl-review-schedule, so there is no
// collision with any existing gsl-* key.
//
// The "answer" side of each card reuses content GSL already ships — a Concepts
// module's one-line subtitle (its key teaching point) or a case chain's diagnosis
// (the whole-chain root cause). No new teaching content is invented here.
//
// Simplification (documented in GSL_MASTER_PLAN.md): the recall answer is the
// module subtitle / chain diagnosis, not the deep RUNNER_DATA takeaway. Wiring
// into every module's runner payload was out of scope for an additive port; the
// subtitle is the module's own authored one-liner and is a faithful prompt→recall
// target. "Review →" deep-links back to the full module/chain for depth.

import { useState, useEffect, useCallback, useMemo } from "react";
import { MODULES, GYMS } from "./Concepts";
import { ALL_CASE_CHAINS } from "./data/caseChains.js";

// ── Spaced-repetition schedule (reused from MSL) ─────────────────────────────
const REVIEW_KEY = "gsl-review-schedule"; // { [itemKey]: { reviews, lastReviewed, firstSeen } }
const INTERVALS_DAYS = [3, 7, 21, 45, 90];
const DAY_MS = 24 * 60 * 60 * 1000;

function intervalForReviews(n) {
  return INTERVALS_DAYS[Math.min(Math.max(n, 0), INTERVALS_DAYS.length - 1)];
}

function readSchedule() {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writeSchedule(state) {
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("gsl_review"));
  } catch {
    /* localStorage unavailable — non-fatal */
  }
}

// ── Content resolution ───────────────────────────────────────────────────────
// Concepts: module id → its gym (for label + color), plus title/subtitle.
const MODULE_BY_ID = new Map(MODULES.map((m) => [m.id, m]));
const GYM_FOR_MODULE = (() => {
  const m = {};
  for (const g of GYMS) for (const id of g.moduleIds || []) m[id] = g;
  return m;
})();
const CHAIN_BY_ID = new Map(ALL_CASE_CHAINS.map((c) => [c.id, c]));

// A stable per-item key across sources.
function itemKey(source, id) {
  return `${source}:${id}`;
}

// Build review candidates from GSL's existing completion signals, then layer the
// review schedule on top of each. Returns items with a `dueAt` timestamp.
function collectCandidates(now = Date.now()) {
  const schedule = readSchedule();
  const items = [];

  // ── Source 1: mastered Concepts modules ────────────────────────────────────
  let mastered = [];
  try {
    mastered = JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]");
    if (!Array.isArray(mastered)) mastered = [];
  } catch {
    mastered = [];
  }
  for (const moduleId of mastered) {
    const mod = MODULE_BY_ID.get(moduleId);
    if (!mod) continue; // legacy / renamed id we can't resolve — skip
    const gym = GYM_FOR_MODULE[moduleId];
    const key = itemKey("concept", moduleId);
    items.push(
      buildItem({
        key,
        source: "concept",
        id: moduleId,
        room: gym ? gym.label : "Foundations",
        color: (gym && gym.color) || "var(--gal-build)",
        prompt: mod.title || mod.label || moduleId,
        recall: mod.subtitle || mod.title || "",
        schedule,
        now,
      })
    );
  }

  // ── Source 2: completed case chains ────────────────────────────────────────
  let chHistory = {};
  try {
    chHistory = JSON.parse(localStorage.getItem("gsl-casechain-history") || "{}") || {};
  } catch {
    chHistory = {};
  }
  for (const [chainId, val] of Object.entries(chHistory)) {
    if (!val || !val.completed) continue;
    const chain = CHAIN_BY_ID.get(chainId);
    if (!chain) continue;
    const key = itemKey("chain", chainId);
    items.push(
      buildItem({
        key,
        source: "chain",
        id: chainId,
        room: "Case Chains",
        color: "#a78bfa",
        prompt: chain.title || chainId,
        recall: chain.diagnosis || "",
        // seed the learned anchor from the chain's own completion timestamp
        learnedAtSeed: typeof val.at === "number" ? val.at : undefined,
        schedule,
        now,
      })
    );
  }

  return items;
}

// Shared item builder: applies the schedule and computes dueAt.
function buildItem({ key, source, id, room, color, prompt, recall, schedule, learnedAtSeed, now }) {
  const sr = schedule[key] || {};
  const reviews = typeof sr.reviews === "number" ? sr.reviews : 0;
  // firstSeen anchors the very first due date. Prefer a stored value, then a
  // source-provided seed (case chain completion time), else "now" — the first
  // time an item surfaces, its clock starts ticking.
  const firstSeen = sr.firstSeen || (learnedAtSeed ? new Date(learnedAtSeed).toISOString() : null);
  const anchorMs = sr.lastReviewed
    ? new Date(sr.lastReviewed).getTime()
    : firstSeen
    ? new Date(firstSeen).getTime()
    : now;
  const dueAt = anchorMs + intervalForReviews(reviews) * DAY_MS;
  return {
    key,
    source,
    id,
    room,
    color,
    prompt,
    recall,
    reviews,
    learnedMs: firstSeen ? new Date(firstSeen).getTime() : now,
    dueAt,
    due: dueAt <= now,
    hasSchedule: !!schedule[key],
  };
}

// ── Formatting ───────────────────────────────────────────────────────────────
function agoLabel(ms) {
  const diff = Date.now() - ms;
  const days = Math.floor(diff / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "a week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "a month ago";
  return `${Math.floor(days / 30)} months ago`;
}

function dueLabel(dueAt) {
  const diff = dueAt - Date.now();
  if (diff <= 0) return "due now";
  const days = Math.ceil(diff / DAY_MS);
  if (days === 1) return "due tomorrow";
  if (days < 7) return `due in ${days} days`;
  return `due ${new Date(dueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

// Grade → how many review-steps to advance. "Again" holds the item at its current
// interval (so it comes back on the same short clock); "Good" advances one step;
// "Easy" advances two. Mirrors MSL's mark-reviewed advance, with ease granularity.
const GRADES = [
  { key: "again", label: "Again", advance: 0, color: "#ef4444", hint: "Couldn't recall — keep it close" },
  { key: "good", label: "Good", advance: 1, color: "var(--gal-build)", hint: "Recalled it — push it out" },
  { key: "easy", label: "Easy", advance: 2, color: "#22c55e", hint: "Solid — push it out further" },
];

// ── Recall card ──────────────────────────────────────────────────────────────
function RecallCard({ item, onGrade, onOpen }) {
  const [revealed, setRevealed] = useState(false);

  // Reset reveal state whenever the card changes.
  useEffect(() => {
    setRevealed(false);
  }, [item.key]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Room label */}
      <div
        className="px-6 pt-5 pb-0 flex items-center gap-2 text-[10px] font-mono uppercase"
        style={{ letterSpacing: "0.11em", color: item.color }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: item.color }}
        />
        {item.room}
        <span className="ml-auto text-zinc-600">
          {item.reviews > 0 ? `reviewed ${item.reviews}×` : "first review"} · learned {agoLabel(item.learnedMs)}
        </span>
      </div>

      {/* Prompt */}
      <div className="px-6 pt-3 pb-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
          Recall
        </div>
        <h2 className="text-xl font-bold text-zinc-100 leading-snug">{item.prompt}</h2>
        <p className="text-sm text-zinc-500 mt-2">
          Say the key point out loud, then reveal to check yourself.
        </p>
      </div>

      {/* Answer / reveal */}
      {!revealed ? (
        <div className="px-6 pb-6">
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--gal-build-tint-md)",
              border: "1px solid var(--gal-build-border)",
              color: "var(--gal-build)",
            }}
          >
            Reveal the key point ↓
          </button>
        </div>
      ) : (
        <div className="px-6 pb-6">
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
              Key teaching point
            </div>
            <p className="text-[15px] text-zinc-200 leading-relaxed">
              {item.recall || "Open the module to review the full explanation."}
            </p>
            <button
              onClick={() => onOpen(item)}
              className="mt-3 text-xs font-semibold hover:underline"
              style={{ color: item.color }}
            >
              Open the full {item.source === "chain" ? "case chain" : "module"} →
            </button>
          </div>

          {/* Self-grade */}
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
            How well did you recall it?
          </div>
          <div className="grid grid-cols-3 gap-2">
            {GRADES.map((g) => (
              <button
                key={g.key}
                onClick={() => onGrade(item, g)}
                title={g.hint}
                className="py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: "var(--surface-2)",
                  border: `1px solid ${g.color}`,
                  color: g.color,
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Scheduled-later row ──────────────────────────────────────────────────────
function ScheduledRow({ item }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: item.color }}
      />
      <span className="text-sm text-zinc-300 font-medium truncate flex-1">{item.prompt}</span>
      <span className="text-[11px] text-zinc-600 shrink-0">{item.room}</span>
      <span className="text-[11px] font-mono text-zinc-500 shrink-0 whitespace-nowrap">
        {dueLabel(item.dueAt)}
      </span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Review({ onNavigate }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Re-render whenever a review is graded (or another tab changes signals).
  useEffect(() => {
    window.addEventListener("gsl_review", refresh);
    return () => window.removeEventListener("gsl_review", refresh);
  }, [refresh]);

  const candidates = useMemo(() => collectCandidates(), [tick]);

  const due = candidates.filter((c) => c.due).sort((a, b) => a.dueAt - b.dueAt);
  const later = candidates.filter((c) => !c.due).sort((a, b) => a.dueAt - b.dueAt);
  const hasQueue = candidates.length > 0;

  // Ensure every surfaced item gets a firstSeen anchor written once, so its due
  // clock is stable across sessions even before the user grades it.
  useEffect(() => {
    const schedule = readSchedule();
    let changed = false;
    for (const c of candidates) {
      if (!schedule[c.key]) {
        schedule[c.key] = { reviews: 0, lastReviewed: null, firstSeen: new Date(c.learnedMs).toISOString() };
        changed = true;
      }
    }
    if (changed) writeSchedule(schedule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.length]);

  function handleGrade(item, grade) {
    const schedule = readSchedule();
    const prev = schedule[item.key] || { reviews: 0, lastReviewed: null, firstSeen: null };
    // "Again" holds the interval (reviews unchanged); "Good"/"Easy" advance it.
    const nextReviews = grade.advance === 0 ? prev.reviews : prev.reviews + grade.advance;
    schedule[item.key] = {
      reviews: Math.max(0, nextReviews),
      lastReviewed: new Date().toISOString(),
      firstSeen: prev.firstSeen || new Date(item.learnedMs).toISOString(),
    };
    writeSchedule(schedule);
    refresh();
  }

  function handleOpen(item) {
    if (!onNavigate) return;
    if (item.source === "concept") onNavigate("concepts");
    else if (item.source === "chain") onNavigate("retrieval");
  }

  const current = due[0] || null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Header */}
        <div className="mb-6">
          <div
            className="text-[10px] font-mono uppercase tracking-widest mb-1.5"
            style={{ color: "var(--gal-build)" }}
          >
            Spaced Repetition
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-2">Review</h1>
          <p className="text-sm text-zinc-400 leading-relaxed" style={{ maxWidth: "560px" }}>
            Everything you've mastered comes back on a schedule so it sticks. Recall the key point
            from memory, then reveal to check yourself — each item you get right pushes further out:
            3 days, then a week, then longer.
          </p>
          {hasQueue && (
            <div className="flex items-center gap-3 flex-wrap mt-4">
              <span
                className="text-[10px] font-bold uppercase tracking-wide rounded-lg px-2 py-0.5"
                style={{
                  color: due.length > 0 ? "var(--gal-build)" : "#71717a",
                  background: due.length > 0 ? "var(--gal-build-tint-md)" : "var(--surface)",
                  border: `1px solid ${due.length > 0 ? "var(--gal-build-border)" : "var(--border)"}`,
                }}
              >
                {due.length} due now
              </span>
              <span className="text-xs text-zinc-500">
                {later.length} scheduled later · {candidates.length} in queue
              </span>
            </div>
          )}
        </div>

        {/* Due card (one at a time) */}
        {current ? (
          <div className="mb-8">
            <RecallCard key={current.key} item={current} onGrade={handleGrade} onOpen={handleOpen} />
          </div>
        ) : (
          <div
            className="rounded-2xl text-center mb-8"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "2.5rem 1.5rem" }}
          >
            <div
              className="w-11 h-11 rounded-full inline-flex items-center justify-center mb-3 text-xl font-bold"
              style={{
                background: "var(--gal-build-tint-md)",
                border: "1px solid var(--gal-build-border)",
                color: "var(--gal-build)",
              }}
            >
              ✓
            </div>
            {!hasQueue ? (
              <>
                <div className="text-lg font-bold text-zinc-100 mb-1.5">Nothing to review yet.</div>
                <p className="text-sm text-zinc-500 leading-relaxed mx-auto mb-5" style={{ maxWidth: "420px" }}>
                  Master a few Foundations modules or complete a case chain. Anything you finish shows
                  up here on a spaced schedule, so your weak spots resurface before you forget them.
                </p>
                <button
                  onClick={() => onNavigate && onNavigate("concepts")}
                  className="px-5 py-2 rounded-lg text-sm font-bold"
                  style={{ background: "var(--gal-build)", color: "#111" }}
                >
                  Go to Foundations →
                </button>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-zinc-100 mb-1.5">
                  Nothing due — you're caught up.
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {later.length > 0 ? `Next review ${dueLabel(later[0].dueAt)}.` : "Everything is reviewed."}
                </p>
              </>
            )}
          </div>
        )}

        {/* Remaining due queue (compact peek) */}
        {due.length > 1 && (
          <div className="mb-8">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
              Also due ({due.length - 1})
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {due.slice(1, 9).map((item) => (
                <ScheduledRow key={item.key} item={{ ...item, dueAt: Date.now() }} />
              ))}
            </div>
          </div>
        )}

        {/* Scheduled later */}
        {later.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
              Scheduled later
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {later.slice(0, 12).map((item) => (
                <ScheduledRow key={item.key} item={item} />
              ))}
            </div>
            {later.length > 12 && (
              <div className="text-xs text-zinc-600 mt-2 text-center">
                + {later.length - 12} more scheduled
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
