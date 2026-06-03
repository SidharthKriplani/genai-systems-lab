// src/Plans.jsx — Structured learning tracks (PAL-style Plans page)

import { useState } from "react";
import { track } from "./analytics";

function computeTracks() {
  try {
    const leaderboard = JSON.parse(localStorage.getItem("genai_leaderboard") || "[]");
    const visited     = new Set(JSON.parse(localStorage.getItem("genai_visited") || '["home"]'));
    const history     = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
    const mastery     = JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]");
    const gtRead      = new Set(JSON.parse(localStorage.getItem("genai_gt_read") || "[]"));

    const histKeys  = Object.keys(history);
    const ragPassed = leaderboard.filter(e => e.passed).length;
    const ragQs     = histKeys.filter(k => k.startsWith("rag-"));
    const agentQs   = histKeys.filter(k => k.startsWith("agents-"));
    const evalQs    = histKeys.filter(k => k.startsWith("eval-"));
    const ragAcc    = ragQs.length > 0 ? ragQs.filter(k => history[k]?.correct).length / ragQs.length : 0;
    const agentAcc  = agentQs.length > 0 ? agentQs.filter(k => history[k]?.correct).length / agentQs.length : 0;
    const evalAcc   = evalQs.length > 0 ? evalQs.filter(k => history[k]?.correct).length / evalQs.length : 0;

    return [
      {
        id: "beginner", label: "Getting Started", color: "#6366f1",
        duration: "1 week", stepCount: 7,
        desc: "Build the intuition to reason about any AI system in production.",
        steps: [
          { label: "Open Foundations hub",         done: visited.has("foundations") },
          { label: "Complete Tokenizer concept",    done: mastery.includes("tokenizer") },
          { label: "Open Retrieval hub",            done: visited.has("retrieval") },
          { label: "Pass a RAG Lab scenario",       done: ragPassed >= 1 },
          { label: "Open PrepLab",                  done: visited.has("preplab") },
          { label: "Answer 10 PrepLab questions",   done: histKeys.length >= 10 },
          { label: "Open Evaluation hub",           done: visited.has("evaluation") },
        ],
      },
      {
        id: "rag-expert", label: "RAG Production Ready", color: "var(--gal-build)",
        duration: "2–3 weeks", stepCount: 6,
        desc: "Master retrieval — the failure mode that breaks most production AI systems.",
        steps: [
          { label: "Pass 2 RAG Lab scenarios",      done: ragPassed >= 2 },
          { label: "Pass all 6 RAG scenarios",      done: ragPassed >= 6 },
          { label: "Complete Embeddings concept",   done: mastery.includes("embeddings") },
          { label: "Complete Context concept",      done: mastery.includes("context") },
          { label: "Read 'How RAG Works'",          done: gtRead.has("how-rag-works") },
          { label: "Reach 60%+ RAG accuracy",       done: ragQs.length >= 5 && ragAcc >= 0.6 },
        ],
      },
      {
        id: "interview", label: "Interview Sprint", color: "#22c55e",
        duration: "1–2 weeks", stepCount: 6,
        desc: "Get interview-ready across all five challenge areas in one focused push.",
        steps: [
          { label: "Answer 20 PrepLab questions",   done: histKeys.length >= 20 },
          { label: "60%+ RAG accuracy",             done: ragQs.length >= 5 && ragAcc >= 0.6 },
          { label: "Open Agents hub",               done: visited.has("agentshub") },
          { label: "60%+ Agents accuracy",          done: agentQs.length >= 5 && agentAcc >= 0.6 },
          { label: "60%+ Evaluation accuracy",      done: evalQs.length >= 5 && evalAcc >= 0.6 },
          { label: "Answer 50 total questions",     done: histKeys.length >= 50 },
        ],
      },
      {
        id: "fullstack", label: "Full-Stack AI Engineer", color: "#f59e0b",
        duration: "4–6 weeks", stepCount: 8,
        desc: "End-to-end coverage: retrieval, evaluation, agents, production, foundations.",
        steps: [
          { label: "Complete RAG Production Ready track", done: ragPassed >= 6 && ragQs.length >= 5 && ragAcc >= 0.6 },
          { label: "Open Agents hub + pass 2 scenarios",  done: visited.has("agentshub") && leaderboard.filter(e => e.passed && e.scenarioId?.includes("agent")).length >= 2 },
          { label: "Complete Attention concept",           done: mastery.includes("attention") },
          { label: "Complete Transformer concept",         done: mastery.includes("transformer") },
          { label: "60%+ Agents accuracy",                 done: agentQs.length >= 5 && agentAcc >= 0.6 },
          { label: "60%+ Evaluation accuracy",             done: evalQs.length >= 5 && evalAcc >= 0.6 },
          { label: "Read 5 Ground Truth posts",            done: gtRead.size >= 5 },
          { label: "Answer 100 PrepLab questions",         done: histKeys.length >= 100 },
        ],
      },
    ].map(t => {
      const done = t.steps.filter(s => s.done).length;
      const next = t.steps.find(s => !s.done);
      return { ...t, done, pct: Math.round(done / t.steps.length * 100), nextStep: next };
    });
  } catch { return []; }
}

export default function PlansPage({ onNavigate }) {
  const [tracks] = useState(() => computeTracks());
  const [expanded, setExpanded] = useState({});

  function toggle(id) { setExpanded(p => ({ ...p, [id]: !p[id] })); }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

      <div>
        <h1 className="text-2xl font-black text-white">Study Plans</h1>
        <p className="text-sm text-zinc-400 mt-1">Structured learning tracks. Each builds on the previous — complete steps in order for best results.</p>
      </div>

      {tracks.map(track => (
        <div key={track.id} className="rounded-xl overflow-hidden"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderTop: `2px solid ${track.color}60` }}>

          {/* Track header */}
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: track.color }}>{track.label}</p>
                  <span className="text-[10px] font-mono text-zinc-500">{track.duration} · {track.stepCount} steps</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{track.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-black text-white">{track.pct}%</p>
                <p className="text-[10px] font-mono text-zinc-500">{track.done}/{track.stepCount}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-zinc-800">
              <div className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${track.pct}%`, background: track.color }} />
            </div>

            {/* Next step CTA */}
            {track.nextStep ? (
              <button onClick={() => onNavigate(track.nextStep.tab || "home")}
                className="w-full text-left text-xs font-bold py-2.5 px-4 rounded-xl transition-all hover:opacity-80"
                style={{ background: track.color + "15", border: `1px solid ${track.color}30`, color: track.color }}>
                Continue: {track.nextStep.label} →
              </button>
            ) : (
              <div className="w-full text-center text-xs font-bold py-2.5 px-4 rounded-xl"
                style={{ background: track.color + "15", border: `1px solid ${track.color}30`, color: track.color }}>
                Track complete ✓
              </div>
            )}
          </div>

          {/* Expandable step list */}
          <div className="border-t border-zinc-800/60">
            <button onClick={() => toggle(track.id)}
              className="w-full flex items-center justify-between px-5 py-3 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
              <span>{expanded[track.id] ? "Hide" : "Show"} all {track.stepCount} steps</span>
              <span>{expanded[track.id] ? "▲" : "▼"}</span>
            </button>
            {expanded[track.id] && (
              <div className="px-5 pb-4 space-y-2">
                {track.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border shrink-0 flex items-center justify-center"
                      style={step.done
                        ? { background: track.color + "30", borderColor: track.color + "60" }
                        : { background: "transparent", borderColor: "#52525b" }}>
                      {step.done && <span className="text-[9px] font-bold" style={{ color: track.color }}>✓</span>}
                    </div>
                    <span className="text-xs" style={{ color: step.done ? "#a1a1aa" : "#e4e4e7" }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <p className="text-[11px] text-zinc-600 text-center">Progress updates automatically as you complete steps across the platform.</p>
    </div>
  );
}
