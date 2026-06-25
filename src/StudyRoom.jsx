// src/StudyRoom.jsx
// Private mastery room — spaced repetition study system
// SECURITY: dual-gated (UI email check + Supabase RLS on user_id)
// NEVER renders content to non-owner users

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from './Icon.jsx';
import { supabase } from "./supabase";
import { scheduleCard, addDays, today } from "./utils/fsrs";
import { SEED_CARDS } from "./studySeed";

const OWNER_EMAIL = "claudesubscription12@gmail.com";

const MODULE_LABELS = {
  "llm-foundations": "LLM Foundations",
  "rag-retrieval":   "RAG & Retrieval",
  "llmops":          "LLMOps",
};

const MODULE_ORDER = ["llm-foundations", "rag-retrieval", "llmops"];

const GRADE_LABELS = [
  { g: 1, label: "Again",  desc: "< 1 min",  color: "border-red-600 text-red-400 hover:bg-red-950" },
  { g: 2, label: "Hard",   desc: "~1 day",   color: "border-amber-600 text-amber-400 hover:bg-amber-950" },
  { g: 3, label: "Good",   desc: "auto",     color: "border-emerald-600 text-emerald-400 hover:bg-emerald-950" },
  { g: 4, label: "Easy",   desc: "long",     color: "border-sky-600 text-sky-400 hover:bg-sky-950" },
];

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function fetchDueCards(userId, module = null) {
  if (!supabase || !userId) return [];
  let q = supabase
    .from("study_cards")
    .select("*")
    .eq("user_id", userId)
    .lte("due_date", today())
    .order("due_date", { ascending: true });
  if (module) q = q.eq("module", module);
  const { data, error } = await q;
  if (error) { console.error("fetchDueCards", error); return []; }
  return data || [];
}

async function fetchModuleStats(userId) {
  if (!supabase || !userId) return {};
  const { data, error } = await supabase
    .from("study_cards")
    .select("module, due_date, reps")
    .eq("user_id", userId);
  if (error) return {};
  const stats = {};
  const td = today();
  for (const card of (data || [])) {
    const m = card.module;
    if (!stats[m]) stats[m] = { total: 0, due: 0, new: 0, reviewed: 0 };
    stats[m].total++;
    if (card.due_date <= td) stats[m].due++;
    if (card.reps === 0) stats[m].new++;
    else stats[m].reviewed++;
  }
  return stats;
}

async function fetchTotalCount(userId) {
  if (!supabase || !userId) return 0;
  const { count } = await supabase
    .from("study_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count || 0;
}

async function saveReview(userId, card, grade, interval) {
  if (!supabase || !userId) return;
  await supabase.from("study_reviews").insert({
    card_id: card.id,
    user_id: userId,
    grade,
    scheduled_days: interval,
    reviewed_at: new Date().toISOString(),
  });
}

async function updateCardFSRS(card, result) {
  if (!supabase) return;
  await supabase.from("study_cards").update({
    fsrs_stability:  result.stability,
    fsrs_difficulty: result.difficulty,
    due_date:        addDays(result.interval),
    reps:            (card.reps || 0) + 1,
    lapses:          result.lapses,
    last_reviewed:   new Date().toISOString(),
  }).eq("id", card.id);
}

async function seedCards(userId) {
  if (!supabase || !userId) return 0;
  const batch = SEED_CARDS.map(c => ({
    user_id:          userId,
    module:           c.module,
    card_type:        c.card_type,
    front:            c.front,
    back:             c.back,
    metadata:         c.metadata,
    fsrs_stability:   0,
    fsrs_difficulty:  5,
    due_date:         today(),
    reps:             0,
    lapses:           0,
  }));

  // Insert in chunks of 200 to stay within Supabase limits
  let inserted = 0;
  for (let i = 0; i < batch.length; i += 200) {
    const chunk = batch.slice(i, i + 200);
    const { error } = await supabase.from("study_cards").insert(chunk);
    if (!error) inserted += chunk.length;
    else console.error("seed chunk error", error);
  }
  return inserted;
}

// ── Session stats tracker ─────────────────────────────────────────────────────

function useSession(userId) {
  const ref = useRef({ start: Date.now(), reviewed: 0, correct: 0, module: null });
  async function save() {
    if (!supabase || !userId || ref.current.reviewed === 0) return;
    const secs = Math.round((Date.now() - ref.current.start) / 1000);
    await supabase.from("study_sessions").insert({
      user_id:         userId,
      module:          ref.current.module,
      cards_reviewed:  ref.current.reviewed,
      correct:         ref.current.correct,
      duration_seconds: secs,
      session_date:    today(),
    });
  }
  return { ref, save };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StudyRoom({ user, onNavigate }) {
  // ── Gate ──────────────────────────────────────────────────────────────────
  if (!user || user.email !== OWNER_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-zinc-500 px-6">
        <div className="text-4xl"><Icon name="lock" size={40} /></div>
        <p className="text-sm font-mono">Private study area — sign in to access</p>
        {!user && (
          <button
            onClick={() => onNavigate && onNavigate("home")}
            className="text-xs border border-zinc-700 text-zinc-400 px-3 py-1 rounded hover:bg-zinc-800">
            Back to home
          </button>
        )}
      </div>
    );
  }

  return <StudyRoomInner user={user} onNavigate={onNavigate} />;
}

// ── Inner — only renders when owner is authenticated ─────────────────────────

function StudyRoomInner({ user, onNavigate }) {
  const [view, setView] = useState("hub");           // "hub" | "study" | "stats"
  const [activeModule, setActiveModule] = useState(null);
  const [queue, setQueue] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [moduleStats, setModuleStats] = useState({});
  const [totalCount, setTotalCount] = useState(null); // null = not loaded yet
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const session = useSession(user.id);

  // ── Load stats on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [count, stats] = await Promise.all([
        fetchTotalCount(user.id),
        fetchModuleStats(user.id),
      ]);
      setTotalCount(count);
      setModuleStats(stats);
    }
    load();
  }, [user.id, seedDone]);

  // ── Seed handler ─────────────────────────────────────────────────────────
  async function handleSeed() {
    setSeeding(true);
    const n = await seedCards(user.id);
    setSeeding(false);
    setSeedDone(true);
    setTotalCount(n);
  }

  // ── Start studying a module ───────────────────────────────────────────────
  async function startModule(module) {
    setLoading(true);
    session.ref.current = { start: Date.now(), reviewed: 0, correct: 0, module };
    const cards = await fetchDueCards(user.id, module);
    setQueue(cards);
    setQIdx(0);
    setFlipped(false);
    setActiveModule(module);
    setLoading(false);
    setSessionReviewed(0);
    setView("study");
  }

  // ── Grade current card ────────────────────────────────────────────────────
  async function gradeCard(grade) {
    const card = queue[qIdx];
    if (!card) return;

    const result = scheduleCard(card, grade);
    await updateCardFSRS(card, result);
    await saveReview(user.id, card, grade, result.interval);

    session.ref.current.reviewed++;
    if (grade >= 3) session.ref.current.correct++;
    setSessionReviewed(r => r + 1);

    const next = qIdx + 1;
    if (next >= queue.length) {
      // Session complete
      await session.save();
      const stats = await fetchModuleStats(user.id);
      setModuleStats(stats);
      setView("hub");
      setActiveModule(null);
    } else {
      setQIdx(next);
      setFlipped(false);
    }
  }

  // ── Keyboard shortcuts in study view ─────────────────────────────────────
  useEffect(() => {
    if (view !== "study") return;
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped(f => !f); }
      if (flipped) {
        if (e.key === "1") gradeCard(1);
        if (e.key === "2") gradeCard(2);
        if (e.key === "3") gradeCard(3);
        if (e.key === "4") gradeCard(4);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, flipped, qIdx, queue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // Views
  // ─────────────────────────────────────────────────────────────────────────

  // ── Hub view ──────────────────────────────────────────────────────────────
  if (view === "hub") {
    const needsSeed = totalCount === 0;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Icon name="brain" size={24} />
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Mastery Room</h1>
            <span className="text-[10px] font-mono text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5 ml-auto">private</span>
          </div>
          <p className="text-xs text-zinc-500 ml-9">Spaced repetition · FSRS-4.5 · {totalCount ?? "…"} cards</p>
        </div>

        {/* Seed prompt */}
        {totalCount === 0 && totalCount !== null && (
          <div className="border border-zinc-700 rounded-lg p-5 mb-6 bg-zinc-900">
            <p className="text-sm text-zinc-300 mb-1 font-medium">No cards yet</p>
            <p className="text-xs text-zinc-500 mb-4">
              Import {SEED_CARDS.length} cards from your Anki lanes — LLM Foundations, RAG &amp; Retrieval, LLMOps.
            </p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="text-sm px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded transition-colors disabled:opacity-50 font-medium">
              {seeding ? "Importing…" : `Import ${SEED_CARDS.length} cards →`}
            </button>
          </div>
        )}

        {/* Module cards */}
        {totalCount !== null && totalCount > 0 && (
          <div className="flex flex-col gap-3">
            {MODULE_ORDER.map(mod => {
              const s = moduleStats[mod] || { total: 0, due: 0, new: 0 };
              const dueCount = s.due || 0;
              const hasCards = s.total > 0;
              return (
                <div
                  key={mod}
                  className="border border-zinc-700 rounded-lg p-4 bg-zinc-900 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{MODULE_LABELS[mod]}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {s.total} cards · <span className={dueCount > 0 ? "text-amber-400 font-medium" : "text-zinc-500"}>{dueCount} due</span>
                    </p>
                  </div>
                  <button
                    onClick={() => startModule(mod)}
                    disabled={loading || !hasCards || dueCount === 0}
                    className="text-xs px-3 py-1.5 border rounded font-mono transition-colors border-zinc-600 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
                    {dueCount === 0 ? "All caught up" : `Study ${dueCount} →`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Study all due */}
        {totalCount > 0 && (
          <div className="mt-4">
            {(() => {
              const totalDue = Object.values(moduleStats).reduce((s, m) => s + (m.due || 0), 0);
              return (
                <button
                  onClick={() => startModule(null)}
                  disabled={loading || totalDue === 0}
                  className="w-full text-sm py-2.5 border border-zinc-600 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium">
                  {totalDue === 0 ? "Nothing due — check back tomorrow" : `Study all ${totalDue} due cards`}
                </button>
              );
            })()}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex gap-3 text-xs text-zinc-600">
          <button onClick={() => onNavigate && onNavigate("home")} className="hover:text-zinc-400">← Home</button>
          {sessionReviewed > 0 && (
            <span className="ml-auto text-zinc-600">Session: {sessionReviewed} reviewed</span>
          )}
        </div>
      </div>
    );
  }

  // ── Study view ────────────────────────────────────────────────────────────
  if (view === "study") {
    const card = queue[qIdx];
    const progress = `${qIdx + 1} / ${queue.length}`;

    if (!card) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <p className="text-zinc-400 text-sm">Session complete — {sessionReviewed} cards reviewed.</p>
          <button onClick={() => setView("hub")} className="text-xs border border-zinc-700 rounded px-3 py-1.5 text-zinc-400 hover:bg-zinc-800">
            Back to Mastery Room
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col min-h-[80vh]">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { session.save(); setView("hub"); }} className="text-xs text-zinc-500 hover:text-zinc-300 font-mono">← exit</button>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${((qIdx) / queue.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-zinc-500">{progress}</span>
          <span className="text-[10px] font-mono text-zinc-700">{MODULE_LABELS[activeModule] || "All"}</span>
        </div>

        {/* Card */}
        <div
          onClick={() => setFlipped(f => !f)}
          className="flex-1 cursor-pointer select-none rounded-xl border border-zinc-700 bg-zinc-900 p-6 flex flex-col justify-center min-h-[220px] hover:border-zinc-600 transition-colors">

          {/* Front always visible */}
          <div>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3 block">question</span>
            <p className="text-base text-zinc-100 leading-relaxed whitespace-pre-wrap">{card.front}</p>
          </div>

          {/* Answer — revealed on flip */}
          {flipped && (
            <>
              <hr className="border-zinc-700 my-4" />
              <div>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-3 block">answer</span>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{card.back}</p>
              </div>
            </>
          )}

          {/* Tap hint */}
          {!flipped && (
            <p className="text-[10px] font-mono text-zinc-700 mt-4">tap to reveal · space / enter</p>
          )}
        </div>

        {/* Grade buttons — only shown after flip */}
        {flipped ? (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {GRADE_LABELS.map(({ g, label, desc, color }) => (
              <button
                key={g}
                onClick={() => gradeCard(g)}
                className={`flex flex-col items-center py-2.5 px-1 border rounded-lg transition-colors ${color} bg-transparent`}>
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-[10px] font-mono opacity-60 mt-0.5">{g}</span>
                <span className="text-[10px] opacity-50 mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {GRADE_LABELS.map(({ g }) => (
              <div key={g} className="h-[62px] border border-zinc-800 rounded-lg opacity-20" />
            ))}
          </div>
        )}

        {/* Keyboard hint */}
        <p className="text-[10px] font-mono text-zinc-700 text-center mt-3">
          {flipped ? "1 Again · 2 Hard · 3 Good · 4 Easy" : "space / enter to flip"}
        </p>
      </div>
    );
  }

  return null;
}
