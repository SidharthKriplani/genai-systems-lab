import { useState, useEffect } from "react";
import { track } from "./analytics";
import { getCaseChains } from "./data/caseChains";

// ─────────────────────────────────────────────────────────────────────────────
// L2 Case Chains renderer (P0.2 pilot — Retrieval domain).
//
// Mirrors MSL's Incident Room walk-through (src/tabs/IncidentRoomTab.jsx):
// present step → evidence → choices → pick → reveal correct diagnosis + causal
// explanation → consequence → next step. Tracks progress in localStorage under a
// NEW key (gsl-casechain-history, no collision with existing gsl-* keys) and
// shows a completion summary (diagnosis / explanation / fix).
//
// Additive surface: imported by Retrieval.jsx and rendered as a "Case Chains"
// mode. Changes no routes, hashes, nav ids, or existing localStorage.
// ─────────────────────────────────────────────────────────────────────────────

const LS_KEY = "gsl-casechain-history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCompletion(chainId) {
  try {
    const h = loadHistory();
    h[chainId] = { completed: true, at: Date.now() };
    localStorage.setItem(LS_KEY, JSON.stringify(h));
  } catch {
    /* localStorage unavailable — non-fatal */
  }
}

// ─── One step of a chain ──────────────────────────────────────────────────────
function ChainStep({ step, stepIdx, total, onAdvance, chainId }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const correct = pick === step.correct;

  function choose(id) {
    if (pick) return;
    setPick(id);
    track("casechain_pick", { chainId, step: stepIdx, id, correct: id === step.correct });
  }

  return (
    <div className="space-y-5">
      {/* Step marker */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--gal-build)" }}>
          Step {stepIdx + 1} of {total}
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* Surfaced symptom */}
      <p className="text-base font-black text-white leading-snug">{step.symptom}</p>

      {/* Evidence */}
      {step.evidence?.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Evidence</p>
          <ul className="space-y-1.5">
            {step.evidence.map((e, i) => (
              <li key={i} className="text-xs text-zinc-300 leading-relaxed flex gap-2">
                <span className="text-zinc-600 shrink-0 font-mono">›</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Question */}
      <p className="text-sm font-bold text-zinc-100 leading-snug">{step.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {step.options.map((opt) => {
          const isPicked = pick === opt.id;
          const isCorrect = opt.id === step.correct;
          const showRight = pick && isCorrect;
          const showWrong = pick && isPicked && !isCorrect;
          let borderColor = "var(--border)";
          let bg = "var(--surface-2)";
          if (showRight) {
            borderColor = "#22c55e";
            bg = "rgba(34,197,94,0.08)";
          } else if (showWrong) {
            borderColor = "#ef4444";
            bg = "rgba(239,68,68,0.08)";
          }
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              disabled={!!pick}
              className="w-full text-left p-3.5 rounded-xl transition-all text-sm text-zinc-200 leading-relaxed disabled:cursor-default"
              style={{ background: bg, border: `1px solid ${borderColor}` }}
            >
              <span className="flex gap-2.5">
                <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: showRight ? "#22c55e" : showWrong ? "#ef4444" : "var(--gal-build)" }}>
                  {showRight ? "✓" : showWrong ? "✗" : opt.id.toUpperCase()}
                </span>
                <span>{opt.text}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Reveal trigger */}
      {pick && !revealed && (
        <button
          onClick={() => {
            setRevealed(true);
            track("casechain_reveal", { chainId, step: stepIdx });
          }}
          className="text-sm font-bold transition-opacity hover:opacity-80"
          style={{ color: "var(--gal-build)" }}
        >
          See the diagnosis →
        </button>
      )}

      {/* Reveal panel */}
      {revealed && (
        <div className="space-y-3">
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              background: correct ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
              border: `1px solid ${correct ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}
          >
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest" style={{ color: correct ? "#22c55e" : "#ef4444" }}>
              {correct ? "✓ Correct diagnosis" : "✗ Not quite — here is the causal chain"}
            </p>
            <p className="text-sm text-zinc-200 leading-relaxed">{step.finding}</p>

            {step.whatsTested && (
              <div className="rounded-lg p-3" style={{ background: "var(--gal-build-tint)", border: "1px solid var(--gal-build-border)" }}>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--gal-build)" }}>What this tests · </span>
                <span className="text-xs text-zinc-300 leading-relaxed">{step.whatsTested}</span>
              </div>
            )}
            {step.antiPattern && (
              <div className="rounded-lg p-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400">Anti-pattern · </span>
                <span className="text-xs text-zinc-300 leading-relaxed">{step.antiPattern}</span>
              </div>
            )}
            {step.seniorFraming && (
              <div className="rounded-lg p-3" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400">How a senior frames this · </span>
                <span className="text-xs text-zinc-300 leading-relaxed">{step.seniorFraming}</span>
              </div>
            )}
          </div>

          {/* Consequence → the next symptom */}
          {step.consequence && (
            <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid var(--gal-build)" }}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Consequence → next symptom</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{step.consequence}</p>
            </div>
          )}

          <button
            onClick={onAdvance}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-transform hover:scale-[1.01]"
            style={{ background: "var(--gal-build-dark)", border: "1px solid var(--gal-build-border)" }}
          >
            {stepIdx + 1 < total ? "Next diagnostic layer →" : "See full case debrief →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── A whole chain card (collapsed → expandable walk-through) ─────────────────
function ChainCard({ chain, completed, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(completed);

  const total = chain.steps.length;

  function advance() {
    if (stepIdx + 1 < total) {
      setStepIdx(stepIdx + 1);
    } else {
      setDone(true);
      saveCompletion(chain.id);
      onComplete(chain.id);
      track("casechain_complete", { chainId: chain.id });
    }
  }

  const levelColor = chain.level === "staff" ? "#ef4444" : "#f59e0b";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${done ? "#22c55e" : "var(--gal-build)"}` }}
    >
      <button
        onClick={() => {
          setExpanded((e) => !e);
          if (!expanded) track("casechain_open", { chainId: chain.id });
        }}
        className="w-full text-left p-5 flex items-start justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--gal-build)" }}>{chain.subtopic}</span>
            <span
              className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
              style={{ color: levelColor, background: levelColor + "15", border: `1px solid ${levelColor}30` }}
            >
              {chain.level}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">{total} layers</span>
          </div>
          <p className="text-base font-black text-white leading-snug">{chain.title}</p>
        </div>
        <span className="shrink-0 text-sm font-mono mt-1" style={{ color: done ? "#22c55e" : "var(--gal-build)" }}>
          {done ? "✓ done" : expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-6 space-y-6">
          {/* Context */}
          <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">The system</p>
            <ul className="space-y-1.5">
              {chain.context.map((c, i) => (
                <li key={i} className="text-xs text-zinc-300 leading-relaxed flex gap-2">
                  <span className="text-zinc-600 shrink-0 font-mono">·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Active step (only when not done) */}
          {!done && (
            <ChainStep
              key={stepIdx}
              step={chain.steps[stepIdx]}
              stepIdx={stepIdx}
              total={total}
              onAdvance={advance}
              chainId={chain.id}
            />
          )}

          {/* Completion debrief */}
          {done && (
            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.25)" }}>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-green-400 mb-1.5">Diagnosis</p>
                <p className="text-sm text-zinc-200 leading-relaxed">{chain.diagnosis}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Why the layers compound</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{chain.explanation}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--gal-build-tint)", border: "1px solid var(--gal-build-border)" }}>
                <p className="text-[10px] font-mono uppercase tracking-widest mb-1.5" style={{ color: "var(--gal-build)" }}>The fix, in order</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{chain.fix}</p>
              </div>
              <p className="text-[10px] font-mono text-zinc-600 pt-1">{chain.source}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function RetrievalCaseChains({ domain = "retrieval" }) {
  const chains = getCaseChains(domain);
  const [history, setHistory] = useState(() => loadHistory());

  useEffect(() => {
    track("casechain_view", { domain });
  }, [domain]);

  function handleComplete(id) {
    setHistory((h) => ({ ...h, [id]: { completed: true, at: Date.now() } }));
  }

  const doneCount = chains.filter((c) => history[c.id]?.completed).length;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          Not one failure — a chain. Each diagnosis you get right resolves the current symptom and
          <span className="text-zinc-200"> surfaces the next one</span>, exactly the way a real RAG incident unfolds:
          recall looks fine → precision is the leak → fixing precision breaks multi-hop → fixing multi-hop exposes
          version-blindness → and so on. Senior/staff depth, first-principles reasoning.
        </p>
        {doneCount > 0 && (
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "var(--gal-build-tint)", border: "1px solid var(--gal-build-border)", color: "var(--gal-build)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gal-build)" }} />
            {doneCount} / {chains.length} chains completed
          </div>
        )}
      </div>

      <div className="space-y-3">
        {chains.map((chain) => (
          <ChainCard
            key={chain.id}
            chain={chain}
            completed={!!history[chain.id]?.completed}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </div>
  );
}
