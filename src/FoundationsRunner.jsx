// src/FoundationsRunner.jsx — Progressive scroll + multi-MCQ (sprint 93p)
// Schema: runnerData.mcqs (array) preferred; runnerData.mcq (object) supported for compat.
// Takeaway unlocks when ALL questions are submitted.

import { useState, useEffect, useRef, Fragment } from "react";

const STORAGE_KEY = id => `gsl-runner-progress-${id}`;

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

  // Normalize to array — support both old mcq and new mcqs
  const mcqList = runnerData.mcqs
    ? runnerData.mcqs
    : runnerData.mcq
      ? [runnerData.mcq]
      : [];

  const [highest, setHighest] = useState(() => {
    if (alreadyDone) return 5;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY(moduleId)) || "{}");
      return Math.min(saved.step || 1, 5);
    } catch { return 1; }
  });

  // Per-question answer state
  const [answers, setAnswers]     = useState(() => Array(mcqList.length).fill(null));
  const [submitted, setSubmitted] = useState(() => Array(mcqList.length).fill(false));

  const sectionRefs = useRef({});

  // Persist step
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY(moduleId), JSON.stringify({ step: highest })); } catch {}
  }, [highest, moduleId]);

  // Unlock takeaway when all MCQs submitted
  useEffect(() => {
    if (mcqList.length > 0 && submitted.every(Boolean)) {
      unlock(5);
    }
  }, [submitted]);

  const { scenario, explanation, takeaway } = runnerData;

  const sections = hasInteractive
    ? [
        { id: 1, label: "Scenario" },
        { id: 2, label: "Explanation" },
        { id: 3, label: "Explore" },
        { id: 4, label: "Check" },
        { id: 5, label: "Takeaway" },
      ]
    : [
        { id: 1, label: "Scenario" },
        { id: 2, label: "Explanation" },
        { id: 4, label: "Check" },
        { id: 5, label: "Takeaway" },
      ];

  function unlock(nextId) {
    setHighest(prev => {
      if (nextId > prev) {
        setTimeout(() => {
          sectionRefs.current[nextId]?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
        return nextId;
      }
      return prev;
    });
  }

  function jumpTo(id) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nextSectionId(currentId) {
    const idx = sections.findIndex(s => s.id === currentId);
    return idx < sections.length - 1 ? sections[idx + 1].id : null;
  }

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
    try { localStorage.setItem(STORAGE_KEY(moduleId), JSON.stringify({ step: 5, completed: true })); } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* ── Location header ──────────────────────────────────────────────── */}
      <div className="mb-6">
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

      {/* ── Jump nav ─────────────────────────────────────────────────────── */}
      <nav className="flex items-center mb-10" aria-label="Module sections">
        {sections.map((s, i) => {
          const unlocked = s.id <= highest || alreadyDone;
          const done     = s.id < highest || alreadyDone;
          const current  = s.id === highest && !alreadyDone;
          return (
            <Fragment key={s.id}>
              <button
                onClick={() => unlocked && jumpTo(s.id)}
                disabled={!unlocked}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                  done    ? "border-violet-500 bg-violet-900/30 text-violet-300" :
                  current ? "border-violet-600 bg-violet-900/20 text-violet-400 ring-2 ring-violet-950" :
                            "border-zinc-800 text-zinc-700"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] font-mono transition-colors ${
                  current ? "text-violet-400" : unlocked ? "text-zinc-500" : "text-zinc-700"
                }`}>{s.label}</span>
              </button>
              {i < sections.length - 1 && (
                <div className={`flex-1 h-px mb-3.5 mx-1 transition-colors ${
                  done ? "bg-violet-800/40" : "bg-zinc-800"
                }`} />
              )}
            </Fragment>
          );
        })}
      </nav>

      {/* ── Progressive sections ──────────────────────────────────────────── */}
      <div className="space-y-12">

        {/* 1 — Scenario */}
        {highest >= 1 && (
          <section ref={el => sectionRefs.current[1] = el} className="scroll-mt-6">
            <SectionRule label="Production Scenario" />
            <div className="mt-4 rounded-xl p-5 border border-zinc-800 bg-zinc-900/50">
              <p className="text-sm text-zinc-200 leading-relaxed font-medium">{scenario}</p>
            </div>
            {!alreadyDone && highest === 1 && nextSectionId(1) && (
              <div className="mt-5">
                <ContinueBtn onClick={() => unlock(nextSectionId(1))} label="Read the explanation" />
              </div>
            )}
          </section>
        )}

        {/* 2 — Explanation */}
        {highest >= 2 && (
          <section ref={el => sectionRefs.current[2] = el} className="scroll-mt-6">
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
            {!alreadyDone && highest === 2 && nextSectionId(2) && (
              <div className="mt-5">
                <ContinueBtn
                  onClick={() => unlock(nextSectionId(2))}
                  label={hasInteractive ? "Explore it hands-on" : "Test your understanding"}
                />
              </div>
            )}
          </section>
        )}

        {/* 3 — Interactive (skipped if no Component) */}
        {hasInteractive && highest >= 3 && (
          <section ref={el => sectionRefs.current[3] = el} className="scroll-mt-6">
            <SectionRule label="Hands-On" />
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Explore the concept interactively. Come back when ready.
            </p>
            <Component onNavigate={onNavigate} spec={spec} />
            {!alreadyDone && highest === 3 && nextSectionId(3) && (
              <div className="mt-5">
                <ContinueBtn onClick={() => unlock(nextSectionId(3))} label="Test your understanding" />
              </div>
            )}
          </section>
        )}

        {/* 4 — MCQ (multi-question) */}
        {highest >= 4 && (
          <section ref={el => sectionRefs.current[4] = el} className="scroll-mt-6">
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

        {/* 5 — Takeaway */}
        {highest >= 5 && (
          <section ref={el => sectionRefs.current[5] = el} className="scroll-mt-6">
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
                  className="w-full py-3 rounded-xl text-sm font-black bg-emerald-700 hover:bg-emerald-600 text-white transition-all"
                >
                  Mark Complete ✓
                </button>
              )}
            </div>
          </section>
        )}

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

function ContinueBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 rounded-lg text-sm font-bold border border-violet-800/50 text-violet-400 hover:border-violet-600 hover:text-violet-300 transition-all"
    >
      {label} →
    </button>
  );
}
