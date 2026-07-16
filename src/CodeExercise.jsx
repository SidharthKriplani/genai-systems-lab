// src/CodeExercise.jsx — "Implement it from scratch" runnable, auto-graded coding for the BUILD frame.
//
// Runs REAL Python (numpy) in-browser via Pyodide (src/python.js). The user implements a
// function/stub in a code editor; "Check" composes their code with hidden asserts
// (exercise.tests) and runs it — no AssertionError == passed. "Run" executes their code
// alone for experimentation. GSL monochrome Tailwind theme: zinc ramp + cyan accent
// (var(--gal-build, #22d3ee)), green #34d399 for pass, red #f87171 for fail.
//
// Two exports:
//   ImplementBrowser({ exercises, doneSet, onOpen })  — card list of runnable exercises.
//   default CodeExercise({ exercise, onBack, onSolved }) — the runner.
//
// Grading contract: exercise.tests is pure Python assert code referencing the symbols the
// user defines in exercise.starter. success === runPython(userCode + "\n\n" + tests).ok.

import { useState, useEffect, useRef } from "react";
import { loadPython, runPython, isPyodideReady } from "./python.js";
import { AddTrackBtn } from "./AddToTrackPopover.jsx";
import { recordAttempt } from "./utils/ratings.js";

// ── Staff-format extensions (2026-07-16) ──────────────────────────────────────
// Backwards compatible: exercises may optionally carry
//   testTiers: [{ name, label, tests }]  — run in order; rank = tiers passed
//   actTwo:    { prompt, tests, solution } — production twist, unlocked after
//              all tiers pass; passing it = "Staff clear"
//   tradeoff:  { q, options[], correct, explanation } — one post-solve MCQ
// Exercises without these fields behave exactly as before (single `tests`).

const TIER_RANK = ["Working", "Solid", "Senior", "Staff-track"];

function rankForTiers(passedCount, total) {
  if (passedCount === 0) return null;
  if (passedCount >= total && total >= 3) return TIER_RANK[3];
  return TIER_RANK[Math.min(passedCount, TIER_RANK.length - 1) - 1] || TIER_RANK[0];
}

const ELO_DIFF = { intro: "easy", easy: "easy", core: "medium", medium: "medium", advanced: "hard", hard: "hard" };

const CYAN = "var(--gal-build, #22d3ee)";

const DIFF_STYLE = {
  intro: { label: "Intro", cls: "border-emerald-800/50 bg-emerald-950/20 text-emerald-400" },
  easy: { label: "Easy", cls: "border-emerald-800/50 bg-emerald-950/20 text-emerald-400" },
  core: { label: "Core", cls: "border-cyan-800/50 bg-cyan-950/20 text-cyan-300" },
  medium: { label: "Medium", cls: "border-cyan-800/50 bg-cyan-950/20 text-cyan-300" },
  advanced: { label: "Advanced", cls: "border-zinc-600 bg-zinc-800/40 text-zinc-300" },
  hard: { label: "Hard", cls: "border-zinc-600 bg-zinc-800/40 text-zinc-300" },
};

function diffStyle(d) {
  return DIFF_STYLE[d] || DIFF_STYLE.core;
}

// ─── BROWSER (exercise list) ──────────────────────────────────────────────────

export function ImplementBrowser({ exercises = [], doneSet = new Set(), onOpen }) {
  const completed = exercises.filter((e) => doneSet.has(e.id)).length;
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
            style={{ color: CYAN, borderColor: "rgba(34,211,238,0.35)" }}
          >
            Implement It
          </span>
          <span className="text-[10px] font-mono text-zinc-600">BUILD · runnable · auto-graded</span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-tight">Implement it from scratch</h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-2xl">
          Reading code is one thing; writing the core loop from a blank stub is another. Each
          exercise runs <span className="text-zinc-200">real Python (numpy) in your browser</span> and
          checks your solution against hidden tests. No AssertionError means you passed. First run
          loads the Python runtime once (~3s), then it is instant.
        </p>
        {exercises.length > 0 && (
          <p className="text-[11px] font-mono text-zinc-500 mt-3">
            {completed}/{exercises.length} solved
          </p>
        )}
      </div>

      <div className="space-y-3">
        {exercises.map((ex) => {
          const d = diffStyle(ex.difficulty);
          const isDone = doneSet.has(ex.id);
          return (
            <div key={ex.id} style={{ position: "relative" }}>
            <button
              onClick={() => onOpen(ex.id)}
              className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all p-5 group"
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap pr-8">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 text-zinc-400">
                  {ex.topic}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${d.cls}`}>{d.label}</span>
                {isDone && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/20 text-emerald-400">
                    ✓ Solved
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-white">{ex.title}</h3>
              <span
                className="inline-block mt-3 text-xs font-mono group-hover:opacity-80"
                style={{ color: CYAN }}
              >
                {isDone ? "Revisit →" : "Implement it →"}
              </span>
            </button>
            <span style={{ position: "absolute", top: 18, right: 18 }} onClick={(e) => e.stopPropagation()}>
              <AddTrackBtn
                itemType="code_exercise"
                itemId={ex.id}
                label={ex.title}
                itemMeta={{ difficulty: ex.difficulty, tag: ex.topic }}
              />
            </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RUNNER (single exercise) ─────────────────────────────────────────────────

export default function CodeExercise({ exercise, onBack, onSolved }) {
  const [code, setCode] = useState(exercise.starter || "");
  const [phase, setPhase] = useState("idle"); // idle | loading | running
  const [progress, setProgress] = useState("");
  const [runOut, setRunOut] = useState(null); // { ok, stdout, error } from Run
  const [checkState, setCheckState] = useState(null); // null | 'pass' | 'fail'
  const [checkOut, setCheckOut] = useState(""); // error/stdout text on fail
  const [showSolution, setShowSolution] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [tierResults, setTierResults] = useState(null); // [{name,label,ok,detail}]
  const [actTwoState, setActTwoState] = useState(null); // null | 'pass' | 'fail'
  const [actTwoOut, setActTwoOut] = useState("");
  const [showActTwoSolution, setShowActTwoSolution] = useState(false);
  const [tradeoffSel, setTradeoffSel] = useState(null);
  const [tradeoffDone, setTradeoffDone] = useState(false);
  const eloRecorded = useRef(false);
  const taRef = useRef(null);

  useEffect(() => {
    // reset when switching exercise
    setCode(exercise.starter || "");
    setPhase("idle");
    setProgress("");
    setRunOut(null);
    setCheckState(null);
    setCheckOut("");
    setShowSolution(false);
    setHintsShown(0);
    setTierResults(null);
    setActTwoState(null);
    setActTwoOut("");
    setShowActTwoSolution(false);
    setTradeoffSel(null);
    setTradeoffDone(false);
    eloRecorded.current = false;
  }, [exercise.id]);

  const busy = phase === "loading" || phase === "running";

  async function ensurePython() {
    if (isPyodideReady()) return true;
    setPhase("loading");
    try {
      await loadPython((msg) => setProgress(msg));
      return true;
    } catch (e) {
      setPhase("idle");
      setRunOut({ ok: false, error: "Failed to load Python runtime: " + (e?.message || e), stdout: "" });
      return false;
    }
  }

  async function handleRun() {
    setRunOut(null);
    setCheckState(null);
    setCheckOut("");
    const ready = await ensurePython();
    if (!ready) return;
    setPhase("running");
    setProgress("");
    const res = await runPython(code);
    setRunOut(res);
    setPhase("idle");
  }

  async function handleCheck() {
    setRunOut(null);
    setCheckState(null);
    setCheckOut("");
    setTierResults(null);
    const ready = await ensurePython();
    if (!ready) return;
    setPhase("running");
    setProgress("");

    const tiers = exercise.testTiers;
    if (Array.isArray(tiers) && tiers.length > 0) {
      // Tiered grading: run each tier in order, stop at first failure.
      const results = [];
      let firstFailDetail = "";
      for (const tier of tiers) {
        const res = await runPython(code + "\n\n" + (tier.tests || ""));
        results.push({ name: tier.name, label: tier.label || tier.name, ok: res.ok });
        if (!res.ok) { firstFailDetail = res.error || res.stdout || "Tier failed."; break; }
      }
      setPhase("idle");
      setTierResults(results);
      const passed = results.filter((r) => r.ok).length;
      const correctness = results[0]?.ok;
      // Elo: the FIRST Check on an exercise is the scored attempt.
      if (!eloRecorded.current) {
        eloRecorded.current = true;
        recordAttempt("Coding · " + (exercise.topic || "General"), !!correctness, ELO_DIFF[exercise.difficulty] || "medium");
      }
      if (correctness) {
        setCheckState("pass");
        onSolved?.(exercise.id);
        if (passed < results.length || passed < tiers.length) setCheckOut(firstFailDetail);
      } else {
        setCheckState("fail");
        setCheckOut(firstFailDetail);
      }
      return;
    }

    // Legacy single-block grading: user code + hidden asserts. No exception == passed.
    const composed = code + "\n\n" + (exercise.tests || "");
    const res = await runPython(composed);
    setPhase("idle");
    if (!eloRecorded.current) {
      eloRecorded.current = true;
      recordAttempt("Coding · " + (exercise.topic || "General"), res.ok, ELO_DIFF[exercise.difficulty] || "medium");
    }
    if (res.ok) {
      setCheckState("pass");
      onSolved?.(exercise.id);
    } else {
      setCheckState("fail");
      setCheckOut(res.error || res.stdout || "Tests failed.");
    }
  }

  async function handleCheckActTwo() {
    if (!exercise.actTwo) return;
    setActTwoState(null);
    setActTwoOut("");
    const ready = await ensurePython();
    if (!ready) return;
    setPhase("running");
    const res = await runPython(code + "\n\n" + (exercise.actTwo.tests || ""));
    setPhase("idle");
    if (res.ok) setActTwoState("pass");
    else { setActTwoState("fail"); setActTwoOut(res.error || res.stdout || "Act II tests failed."); }
  }

  function onKeyDown(e) {
    // Tab inserts two spaces instead of moving focus.
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.slice(0, start) + "  " + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }

  const d = diffStyle(exercise.difficulty);
  const hints = exercise.hints || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3 inline-flex items-center gap-1"
        >
          ← Implement It
        </button>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 text-zinc-400">
            {exercise.topic}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${d.cls}`}>{d.label}</span>
          {checkState === "pass" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/20 text-emerald-400">
              ✓ Solved
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white leading-tight">{exercise.title}</h2>
      </div>

      {/* Prompt */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 mb-5">
        <div className="text-sm text-zinc-200 leading-relaxed">
          <InlineMd text={exercise.prompt} />
        </div>
        {exercise.packages?.length > 0 && (
          <p className="text-[10px] font-mono text-zinc-500 mt-3">
            available: {exercise.packages.join(", ")}
          </p>
        )}
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">solution.py</span>
          <span className="text-[9px] font-mono text-zinc-700">editable · Tab = 2 spaces</span>
        </div>
        <textarea
          ref={taRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          rows={Math.max(10, (code.match(/\n/g) || []).length + 2)}
          className="w-full bg-zinc-950 text-zinc-200 font-mono text-[13px] leading-relaxed px-4 py-4 outline-none resize-y"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <button
          onClick={handleRun}
          disabled={busy}
          className="px-4 py-2 rounded-lg text-sm font-bold border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {phase === "running" ? "Running…" : "▶ Run"}
        </button>
        <button
          onClick={handleCheck}
          disabled={busy}
          className="px-5 py-2 rounded-lg text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "rgba(34,211,238,0.12)",
            border: "1px solid rgba(34,211,238,0.4)",
            color: CYAN,
          }}
        >
          {phase === "running" ? "Checking…" : "✓ Check"}
        </button>
        <button
          onClick={() => {
            setCode(exercise.starter || "");
            setRunOut(null);
            setCheckState(null);
            setCheckOut("");
          }}
          disabled={busy}
          className="px-3 py-2 rounded-lg text-xs font-mono text-zinc-500 hover:text-zinc-300 disabled:opacity-40 transition-all"
        >
          Reset
        </button>
        {exercise.solution && (
          <button
            onClick={() => setShowSolution((s) => !s)}
            className="px-3 py-2 rounded-lg text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-all ml-auto"
          >
            {showSolution ? "Hide solution" : "Reveal solution"}
          </button>
        )}
      </div>

      {/* Loading panel — Pyodide cold start */}
      {phase === "loading" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 mb-4 flex items-center gap-3">
          <span className="inline-block animate-spin text-lg" style={{ color: CYAN }}>⟳</span>
          <div>
            <div className="text-xs font-mono font-semibold" style={{ color: CYAN }}>
              {progress || "Loading Python runtime…"}
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
              First run loads Pyodide + numpy (~3s). Subsequent runs are instant.
            </div>
          </div>
        </div>
      )}

      {/* Check result */}
      {checkState === "pass" && (
        <div
          className="rounded-xl px-5 py-4 mb-4 border mo-pop"
          style={{
            borderColor: "rgba(52,211,153,0.4)",
            background: "rgba(52,211,153,0.08)",
            color: "#34d399",
          }}
        >
          {tierResults ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-black m-0">
                  {tierResults.every((r) => r.ok) && tierResults.length === (exercise.testTiers?.length || 0)
                    ? "All tiers passed ✓"
                    : "Correctness passed ✓"}
                </p>
                {rankForTiers(tierResults.filter((r) => r.ok).length, exercise.testTiers?.length || 0) && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/30 text-emerald-300">
                    {rankForTiers(tierResults.filter((r) => r.ok).length, exercise.testTiers?.length || 0)}
                    {actTwoState === "pass" ? " · Staff clear" : ""}
                  </span>
                )}
              </div>
              <div className="mo-stagger mt-3 space-y-1">
                {(exercise.testTiers || []).map((tier, i) => {
                  const r = tierResults[i];
                  const state = r ? (r.ok ? "pass" : "fail") : "locked";
                  return (
                    <div key={tier.name} className="flex items-center gap-2 text-xs font-mono">
                      <span style={{ color: state === "pass" ? "#34d399" : state === "fail" ? "#f87171" : "#52525b" }}>
                        {state === "pass" ? "✓" : state === "fail" ? "✗" : "○"}
                      </span>
                      <span className={state === "locked" ? "text-zinc-600" : "text-zinc-300"}>{tier.label || tier.name}</span>
                      {state === "locked" && <span className="text-zinc-700">(not reached)</span>}
                    </div>
                  );
                })}
              </div>
              {checkOut && (
                <pre className="text-[11px] font-mono text-zinc-400 leading-relaxed mt-2 whitespace-pre-wrap overflow-x-auto">{checkOut}</pre>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-black">All tests passed ✓</p>
              <p className="text-xs text-zinc-400 mt-1">
                Your implementation satisfies every hidden assert. Marked solved.
              </p>
            </>
          )}
        </div>
      )}

      {/* Post-solve tradeoff MCQ — one judgment question about the choice just made */}
      {checkState === "pass" && exercise.tradeoff && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 mb-4 mo-rise">
          <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: CYAN }}>Tradeoff check</p>
          <p className="text-sm font-semibold text-zinc-100 leading-relaxed mb-3"><InlineMd text={exercise.tradeoff.q} /></p>
          <div className="space-y-2">
            {exercise.tradeoff.options.map((opt, i) => {
              const chosen = tradeoffSel === i;
              const right = i === exercise.tradeoff.correct;
              let cls = "text-zinc-400 border-zinc-800 bg-zinc-900/50 hover:border-zinc-600";
              if (tradeoffDone) {
                if (right) cls = "text-emerald-300 border-emerald-800/50 bg-emerald-950/20 mo-correct";
                else if (chosen) cls = "text-red-300 border-red-800/50 bg-red-950/20 mo-shake";
                else cls = "text-zinc-600 border-zinc-800 bg-zinc-900/30 opacity-50 mo-lock";
              } else if (chosen) cls = "text-cyan-300 border-cyan-700 bg-cyan-950/30";
              return (
                <button key={i} disabled={tradeoffDone}
                  onClick={() => { setTradeoffSel(i); setTradeoffDone(true); }}
                  className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>
          {tradeoffDone && (
            <p className="text-xs text-zinc-400 leading-relaxed mt-3 mo-rise"><InlineMd text={exercise.tradeoff.explanation} /></p>
          )}
        </div>
      )}

      {/* Act II — production twist, unlocked when every tier passes */}
      {checkState === "pass" && exercise.actTwo && tierResults && tierResults.every((r) => r.ok) &&
        tierResults.length === (exercise.testTiers?.length || 0) && (
        <div className="rounded-xl border p-5 mb-4 mo-rise" style={{ borderColor: "rgba(34,211,238,0.35)", background: "rgba(34,211,238,0.05)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border" style={{ color: CYAN, borderColor: "rgba(34,211,238,0.4)" }}>
              Act II · production twist
            </span>
            {actTwoState === "pass" && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/20 text-emerald-400 mo-pop">✓ Staff clear</span>
            )}
          </div>
          <div className="text-sm text-zinc-200 leading-relaxed mb-3"><InlineMd text={exercise.actTwo.prompt} /></div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleCheckActTwo} disabled={busy}
              className="px-4 py-2 rounded-lg text-sm font-black transition-all disabled:opacity-40"
              style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.4)", color: CYAN }}>
              {phase === "running" ? "Checking…" : "✓ Check Act II"}
            </button>
            <span className="text-[11px] font-mono text-zinc-500">Edit your solution above to survive the new constraint, then re-check.</span>
            {exercise.actTwo.solution && actTwoState && (
              <button onClick={() => setShowActTwoSolution((v) => !v)}
                className="ml-auto text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-all">
                {showActTwoSolution ? "Hide Act II solution" : "Reveal Act II solution"}
              </button>
            )}
          </div>
          {actTwoState === "fail" && (
            <pre className="text-xs font-mono text-red-300/90 leading-relaxed mt-3 whitespace-pre-wrap overflow-x-auto mo-rise">{actTwoOut}</pre>
          )}
          {showActTwoSolution && exercise.actTwo.solution && (
            <pre className="text-xs font-mono text-zinc-300 leading-relaxed mt-3 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-950 overflow-x-auto whitespace-pre">{exercise.actTwo.solution}</pre>
          )}
        </div>
      )}
      {checkState === "fail" && (
        <div
          className="rounded-xl px-5 py-4 mb-4 border mo-rise"
          style={{
            borderColor: "rgba(248,113,113,0.4)",
            background: "rgba(248,113,113,0.08)",
          }}
        >
          <p className="text-sm font-bold mb-2" style={{ color: "#f87171" }}>
            Tests failed
          </p>
          <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {checkOut}
          </pre>
        </div>
      )}

      {/* Run output (experimentation) */}
      {runOut && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden mb-4">
          <div className="px-4 py-2 border-b border-zinc-800/80">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">output</span>
          </div>
          <pre
            className="text-xs font-mono leading-relaxed px-4 py-4 overflow-x-auto whitespace-pre-wrap"
            style={{ color: runOut.ok ? "#a1a1aa" : "#f87171" }}
          >
            {runOut.ok
              ? runOut.stdout || "(ran with no output)"
              : (runOut.error || "") + (runOut.stdout ? "\n\n" + runOut.stdout : "")}
          </pre>
        </div>
      )}

      {/* Hints */}
      {hints.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 mb-4">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Hints</p>
          <ul className="space-y-2">
            {hints.slice(0, hintsShown).map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
                <span className="text-zinc-600 shrink-0">{i + 1}.</span>
                <span><InlineMd text={h} /></span>
              </li>
            ))}
          </ul>
          {hintsShown < hints.length && (
            <button
              onClick={() => setHintsShown((n) => n + 1)}
              className="mt-3 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-all"
            >
              {hintsShown === 0 ? "Show a hint →" : "Show next hint →"}
            </button>
          )}
        </div>
      )}

      {/* Solution */}
      {showSolution && exercise.solution && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="px-4 py-2 border-b border-zinc-800/80">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              reference solution
            </span>
          </div>
          <pre className="text-xs font-mono text-zinc-300 leading-relaxed px-4 py-4 overflow-x-auto whitespace-pre">
            {exercise.solution}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Inline markdown — **bold**, `code`, \n\n paragraphs ──────────────────────

function InlineMd({ text }) {
  if (typeof text !== "string") return text ?? null;
  const paras = text.split(/\n\n+/);
  return (
    <>
      {paras.map((para, pi) => (
        <span key={pi} className={pi > 0 ? "block mt-3" : undefined}>
          {renderLines(para)}
        </span>
      ))}
    </>
  );
}

function renderLines(para) {
  const lines = para.split("\n");
  return lines.map((line, li) => (
    <span key={li}>
      {li > 0 && <br />}
      {tokenizeInline(line)}
    </span>
  ));
}

const INLINE_RULES = [
  { re: /\*\*([^*]+)\*\*/, kind: "bold" },
  { re: /`([^`]+)`/, kind: "code" },
];

function tokenizeInline(str) {
  const out = [];
  let rest = str;
  let guard = 0;
  while (rest.length && guard++ < 5000) {
    let best = null;
    for (const rule of INLINE_RULES) {
      const m = rule.re.exec(rest);
      if (m && (best === null || m.index < best.m.index)) {
        best = { m, kind: rule.kind };
      }
    }
    if (!best) {
      out.push(rest);
      break;
    }
    const { m, kind } = best;
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const inner = m[1];
    const key = out.length;
    if (kind === "bold") {
      out.push(<strong key={key} className="font-semibold text-zinc-50">{inner}</strong>);
    } else {
      out.push(
        <code
          key={key}
          className="font-mono text-[0.82em] px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700/60"
        >
          {inner}
        </code>
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}
