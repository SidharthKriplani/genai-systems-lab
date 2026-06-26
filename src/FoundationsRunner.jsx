// src/FoundationsRunner.jsx — PAL-pattern 5-step Foundations runner (sprint 92c)
// Steps: 1 Scenario  2 Explanation  3 Interactive  4 Quick Check  5 Takeaway

import { useState, useEffect } from "react";

const STEPS = [
  { id: 1, label: "Scenario",    tag: "CONTEXT" },
  { id: 2, label: "Explanation", tag: "CONCEPT" },
  { id: 3, label: "Interactive", tag: "EXPLORE" },
  { id: 4, label: "Quick Check", tag: "VERIFY" },
  { id: 5, label: "Takeaway",    tag: "APPLY" },
];

const STORAGE_KEY = id => `gsl-runner-progress-${id}`;

export default function FoundationsRunner({
  moduleId,
  module,          // { title, subtitle, tag, fidelity }
  runnerData,      // { scenario, explanation: string[], mcq: { question, options, correct, explanation }, takeaway }
  Component,       // the interactive widget component
  spec,            // passed through to Component
  onNavigate,      // passed through to Component
  mastery,         // Set of completed module IDs
  markComplete,    // () => void — call when step 5 is finished
  onBack,          // () => void — go back to gym room
}) {
  const alreadyDone = mastery?.has(moduleId);

  const [step, setStep] = useState(() => {
    if (alreadyDone) return 5;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY(moduleId)) || "{}");
      return Math.min(saved.step || 1, 5);
    } catch { return 1; }
  });
  const [mcqSelected, setMcqSelected] = useState(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  // Persist step progress
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY(moduleId), JSON.stringify({ step })); } catch {}
  }, [step, moduleId]);

  const { scenario, explanation, mcq, takeaway } = runnerData;
  const isCorrect = mcqSelected === mcq.correct;

  function handleMcqSubmit() {
    if (mcqSelected === null) return;
    setMcqSubmitted(true);
  }

  function handleComplete() {
    markComplete?.();
    try { localStorage.setItem(STORAGE_KEY(moduleId), JSON.stringify({ step: 5, completed: true })); } catch {}
  }

  function canAdvance() {
    if (step === 4) return mcqSubmitted;
    return true;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* ── Module header (always visible) ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {module?.tag && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-900/50 text-violet-400 rounded border border-violet-800">
              {module.tag}
            </span>
          )}
          <button
            onClick={onBack}
            className="ml-auto text-[9px] font-mono text-violet-400 hover:text-violet-300 border border-violet-800/40 rounded px-1.5 py-0.5 transition-colors hidden sm:block">
            ← Foundations
          </button>
        </div>
        <h2 className="text-xl font-bold" style={{ background: "linear-gradient(90deg, #ffffff 0%, #c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {module?.title}
        </h2>
        {module?.subtitle && <p className="text-sm text-zinc-400 mt-1">{module.subtitle}</p>}
      </div>

      {/* ── Step progress bar ── */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => {
          const done = s.id < step || alreadyDone;
          const active = s.id === step && !alreadyDone;
          return (
            <button
              key={s.id}
              onClick={() => { if (s.id <= step || alreadyDone) setStep(s.id); }}
              className="flex-1 flex flex-col items-center gap-1 group"
              disabled={s.id > step && !alreadyDone}
            >
              <div className={`w-full h-1 rounded-full transition-all duration-300 ${
                done ? "bg-violet-500" : active ? "bg-violet-600" : "bg-zinc-800"
              }`} />
              <span className={`text-[9px] font-mono uppercase tracking-wider transition-colors ${
                active ? "text-violet-300" : done ? "text-zinc-400" : "text-zinc-700"
              }`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Step content ── */}
      <div className="space-y-5">

        {/* Step 1: Scenario */}
        {step === 1 && (
          <div className="rounded-xl p-6 space-y-4"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-violet-400">Production Scenario</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">{scenario}</p>
          </div>
        )}

        {/* Step 2: Explanation */}
        {step === 2 && (
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-violet-400">Concept Explanation</span>
            {explanation.map((para, i) => (
              <p key={i} className="text-sm text-zinc-200 leading-relaxed">{para}</p>
            ))}
          </div>
        )}

        {/* Step 3: Interactive */}
        {step === 3 && (
          <div>
            <div className="mb-4">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-violet-400">Interactive Exploration</span>
              <p className="text-xs text-zinc-500 mt-1">Explore the concept hands-on. Come back to continue when ready.</p>
            </div>
            {Component && <Component onNavigate={onNavigate} spec={spec} />}
          </div>
        )}

        {/* Step 4: MCQ */}
        {step === 4 && (
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-violet-400">Quick Check</span>
            <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{mcq.question}</p>
            <div className="space-y-2">
              {mcq.options.map((opt, i) => {
                const isSelected = mcqSelected === i;
                const isRight = mcq.correct === i;
                let style = "text-zinc-400 border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:text-zinc-300";
                if (mcqSubmitted) {
                  if (isRight) style = "text-emerald-300 border-emerald-700/60 bg-emerald-950/30";
                  else if (isSelected && !isRight) style = "text-red-300 border-red-700/60 bg-red-950/30";
                  else style = "text-zinc-600 border-zinc-800 bg-zinc-900/30";
                } else if (isSelected) {
                  style = "text-violet-300 border-violet-600 bg-violet-950/30";
                }
                return (
                  <button
                    key={i}
                    onClick={() => { if (!mcqSubmitted) setMcqSelected(i); }}
                    disabled={mcqSubmitted}
                    className={`w-full text-left text-sm px-4 py-3 rounded-lg border transition-all ${style}`}
                  >
                    <span className="font-mono text-[11px] mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {mcqSubmitted && isRight && <span className="ml-2 text-emerald-500 font-bold">✓</span>}
                    {mcqSubmitted && isSelected && !isRight && <span className="ml-2 text-red-500">✗</span>}
                  </button>
                );
              })}
            </div>
            {mcqSubmitted && (
              <div className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${isCorrect ? "bg-emerald-950/30 border border-emerald-800/40 text-emerald-300" : "bg-zinc-900 border border-zinc-800 text-zinc-300"}`}>
                <span className="font-bold mr-1">{isCorrect ? "Correct." : "Not quite."}</span>
                {mcq.explanation}
              </div>
            )}
            {!mcqSubmitted && (
              <button
                onClick={handleMcqSubmit}
                disabled={mcqSelected === null}
                className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: mcqSelected !== null ? "rgba(99,102,241,0.2)" : "", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
                Check answer
              </button>
            )}
          </div>
        )}

        {/* Step 5: Takeaway */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="rounded-xl p-6 space-y-3"
              style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(99,102,241,0.05) 100%)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400">Key Takeaway</span>
              <p className="text-sm text-zinc-200 leading-relaxed font-medium">{takeaway}</p>
            </div>
            {!alreadyDone && (
              <button
                onClick={handleComplete}
                className="w-full py-3 rounded-xl text-sm font-black transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff" }}>
                Mark Complete ✓
              </button>
            )}
            {alreadyDone && (
              <div className="text-center py-2">
                <span className="text-sm font-semibold text-emerald-400">✓ Completed</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Navigation ── */}
      {!alreadyDone && (
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-zinc-800/60">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onBack?.()}
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-colors">
            ← {step > 1 ? STEPS[step - 2].label : "Back"}
          </button>
          {step < 5 && (
            <button
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: canAdvance() ? "rgba(99,102,241,0.2)" : "", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
              {STEPS[step].label} →
            </button>
          )}
        </div>
      )}

    </div>
  );
}
