// src/FoundationsRunner.jsx — single-scroll layout, no step nav, no unlock buttons (sprint 93s)
// Schema: runnerData.mcqs (array) preferred; runnerData.mcq (object) supported for compat.

import { useState } from "react";

export default function FoundationsRunner({
  moduleId,
  module,
  runnerData,
  Component,
  spec,
  onNavigate,
  mastery,
  markComplete,
  onBack,
  gymLabel,
}) {
  const alreadyDone = mastery?.has(moduleId);
  const hasInteractive = !!Component;

  const mcqList = runnerData.mcqs
    ? runnerData.mcqs
    : runnerData.mcq
    ? [runnerData.mcq]
    : [];

  const [answers, setAnswers]     = useState(() => Array(mcqList.length).fill(null));
  const [submitted, setSubmitted] = useState(() => Array(mcqList.length).fill(false));

  const { scenario, explanation, takeaway } = runnerData;

  function selectAnswer(qi, i) {
    if (submitted[qi]) return;
    setAnswers(prev => { const a = [...prev]; a[qi] = i; return a; });
  }

  function submitAnswer(qi) {
    if (answers[qi] === null) return;
    setSubmitted(prev => { const s = [...prev]; s[qi] = true; return s; });
  }

  function handleComplete() {
    markComplete?.();
  }

  const allSubmitted = mcqList.length === 0 || submitted.every(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <button
          onClick={onBack}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3 inline-flex items-center gap-1"
        >
          ← {gymLabel || "Foundations"}
        </button>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {module?.tag && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 text-zinc-400">
              {module.tag}
            </span>
          )}
          {alreadyDone && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/20 text-emerald-400">
              ✓ Complete
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white leading-tight">{module?.title}</h2>
        {module?.subtitle && (
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{module.subtitle}</p>
        )}
      </div>

      <div className="space-y-14">

        {/* ── Scenario ─────────────────────────────────────────────────────── */}
        <section>
          <SectionRule label="Production Scenario" />
          <div className="mt-4 rounded-xl p-5 border border-zinc-800 bg-zinc-900/50">
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">{scenario}</p>
          </div>
        </section>

        {/* ── Explanation ──────────────────────────────────────────────────── */}
        <section>
          <SectionRule label="Explanation" />
          <div className="mt-4 space-y-4">
            {explanation.map((item, i) => {
              if (typeof item === "string") {
                return <p key={i} className="text-sm text-zinc-200 leading-relaxed">{item}</p>;
              }
              if (item?.type === "illustration") {
                return (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 mt-2">
                    {item.label && (
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">{item.label}</p>
                    )}
                    <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">{item.content}</pre>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </section>

        {/* ── Hands-On (only if a real interactive component exists) ────────── */}
        {hasInteractive && (
          <section>
            <SectionRule label="Hands-On" />
            <div className="mt-4">
              <Component onNavigate={onNavigate} spec={spec} />
            </div>
          </section>
        )}

        {/* ── Quick Check ──────────────────────────────────────────────────── */}
        {mcqList.length > 0 && (
          <section>
            <SectionRule label={`Quick Check${mcqList.length > 1 ? ` · ${mcqList.length} questions` : ""}`} />
            <div className="mt-4 space-y-8">
              {mcqList.map((q, qi) => (
                <QuestionBlock
                  key={qi}
                  qi={qi}
                  total={mcqList.length}
                  q={q}
                  selected={answers[qi]}
                  isSubmitted={submitted[qi]}
                  onSelect={i => selectAnswer(qi, i)}
                  onSubmit={() => submitAnswer(qi)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Takeaway ─────────────────────────────────────────────────────── */}
        <section>
          <SectionRule label="Takeaway" />
          <div className="mt-4 rounded-xl p-5 border border-emerald-900/30 bg-emerald-950/10">
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">{takeaway}</p>
          </div>
          <div className="mt-5">
            {alreadyDone ? (
              <p className="text-sm text-emerald-400 font-semibold">✓ Completed</p>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!allSubmitted}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all ${
                  allSubmitted
                    ? "bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {allSubmitted ? "Mark Complete ✓" : "Answer the check question to complete"}
              </button>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

// ── QuestionBlock ──────────────────────────────────────────────────────────────

function QuestionBlock({ qi, total, q, selected, isSubmitted, onSelect, onSubmit }) {
  const isCorrect = selected === q.correct;
  return (
    <div className="space-y-3">
      {total > 1 && (
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          Question {qi + 1} of {total}
        </p>
      )}
      <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const sel   = selected === i;
          const right = q.correct === i;
          let cls = "text-zinc-400 border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:text-zinc-300";
          if (isSubmitted) {
            if (right) cls = "text-emerald-300 border-emerald-800/50 bg-emerald-950/20";
            else if (sel) cls = "text-red-300 border-red-800/50 bg-red-950/20 animate-wrongShake";
            else cls = "text-zinc-600 border-zinc-800 bg-zinc-900/30 opacity-50";
          } else if (sel) {
            cls = "text-violet-300 border-violet-600 bg-violet-950/30";
          }
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={isSubmitted}
              className={`w-full text-left text-sm px-4 py-3 rounded-lg border transition-all ${cls}`}
            >
              <span className="font-mono text-[11px] mr-2 opacity-60">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
              {isSubmitted && right && <span className="ml-2 text-emerald-400 font-bold">✓</span>}
              {isSubmitted && sel && !right && <span className="ml-2 text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {isSubmitted ? (
        <div className={`rounded-lg px-4 py-3 text-sm leading-relaxed border ${
          isCorrect
            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
            : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
        }`}>
          <span className="font-bold mr-1">{isCorrect ? "Correct." : "Not quite."}</span>
          {q.explanation}
        </div>
      ) : (
        <button
          onClick={onSubmit}
          disabled={selected === null}
          className="px-5 py-2.5 rounded-lg text-sm font-bold border border-violet-800/50 text-violet-400 hover:border-violet-600 hover:text-violet-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Check answer
        </button>
      )}
    </div>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────────

function SectionRule({ label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}
