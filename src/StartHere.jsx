import { useState, useEffect } from "react";
import { track } from "./analytics";

const STEPS = [
  {
    id: "tokenizer",
    step: 1,
    title: "Tokenizer",
    desc: "How text becomes numbers — subwords, byte-pair encoding, vocab size tradeoffs.",
    tag: "Concepts",
    tagColor: "#6366f1",
    tab: "concepts",
    effort: "~10 min",
    mandatory: true,
  },
  {
    id: "embeddings",
    step: 2,
    title: "Semantic Embeddings",
    desc: "How meaning becomes geometry. Why cosine similarity works. Visualised in 2D.",
    tag: "Concepts",
    tagColor: "#6366f1",
    tab: "concepts",
    effort: "~10 min",
    mandatory: true,
  },
  {
    id: "context",
    step: 3,
    title: "Context Window & Cost",
    desc: "What fits in a context window, what gets cut off, and why it matters for RAG.",
    tag: "Concepts",
    tagColor: "#6366f1",
    tab: "concepts",
    effort: "~8 min",
    mandatory: true,
  },
  {
    id: "chunking",
    step: 4,
    title: "Chunking Strategies",
    desc: "Fixed vs semantic vs recursive chunking. How chunk size changes retrieval quality.",
    tag: "Concepts",
    tagColor: "#6366f1",
    tab: "concepts",
    effort: "~8 min",
    mandatory: true,
  },
  {
    id: "raglab",
    step: 5,
    title: "RAG Failure Lab",
    desc: "Configure a RAG pipeline, watch it fail, and understand every failure mode. The core lab.",
    tag: "RAG Lab",
    tagColor: "#3b82f6",
    tab: "lab",
    effort: "~15 min",
    mandatory: true,
    highlight: true,
  },
  {
    id: "guardrails",
    step: 6,
    title: "Guardrail Pipeline",
    desc: "How guardrails are layered around LLM responses. What gets caught and what slips through.",
    tag: "Concepts",
    tagColor: "#6366f1",
    tab: "concepts",
    effort: "~8 min",
    mandatory: false,
  },
  {
    id: "agentloop",
    step: 7,
    title: "Agent Loop",
    desc: "Trace a ReAct agent step-by-step. Where tool calls happen, where failures occur.",
    tag: "Flows",
    tagColor: "#22c55e",
    tab: "flows",
    effort: "~10 min",
    mandatory: false,
  },
];

const LS_KEY = "genai_starthere_progress";

function loadProgress() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); }
  catch { return new Set(); }
}

function saveProgress(set) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...set])); } catch {}
}

export default function StartHere({ onNavigate }) {
  const [done, setDone] = useState(loadProgress);

  useEffect(() => { track("starthere_viewed", {}); }, []);

  function markAndOpen(step) {
    const next = new Set([...done, step.id]);
    setDone(next);
    saveProgress(next);
    track("starthere_step_opened", { step: step.id, tab: step.tab });
    onNavigate(step.tab);
  }

  const mandatorySteps = STEPS.filter(s => s.mandatory);
  const optionalSteps  = STEPS.filter(s => !s.mandatory);
  const mandatoryDone  = mandatorySteps.filter(s => done.has(s.id)).length;
  const pct = Math.round((mandatoryDone / mandatorySteps.length) * 100);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-2">Guided path</p>
          <h1 className="text-2xl font-black text-white mb-2">Start Here</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
            A guided path from text tokens to RAG failures and agent behaviour. ~45 min total.
          </p>
          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 font-mono shrink-0">
              {mandatoryDone}/{mandatorySteps.length} done
            </span>
          </div>
        </div>

        {/* Required steps */}
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">
            Required — 5 steps
          </p>
          <div className="space-y-3">
            {mandatorySteps.map(step => (
              <StepCard
                key={step.id}
                step={step}
                done={done.has(step.id)}
                onOpen={() => markAndOpen(step)}
              />
            ))}
          </div>
        </div>

        {/* Optional steps */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">
            Go deeper — optional
          </p>
          <div className="space-y-3">
            {optionalSteps.map(step => (
              <StepCard
                key={step.id}
                step={step}
                done={done.has(step.id)}
                onOpen={() => markAndOpen(step)}
              />
            ))}
          </div>
        </div>

        {/* Expert escape hatch */}
        <div className="border border-zinc-800 rounded-xl p-5 text-center">
          <p className="text-xs text-zinc-500 mb-3">Already know the basics?</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigate("labs")}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all">
              Jump to Labs →
            </button>
            <button
              onClick={() => onNavigate("library")}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all">
              Browse Library →
            </button>
            <span className="text-xs text-zinc-600 font-mono">or press ⌘K to search</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function StepCard({ step, done, onOpen }) {
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-4 transition-all ${
      done
        ? "border-emerald-900/50 bg-emerald-950/10"
        : step.highlight
          ? "border-violet-700/50 bg-violet-950/20"
          : "border-zinc-800 bg-zinc-900/40"
    }`}>
      {/* Step number / checkmark */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
        done
          ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800"
          : step.highlight
            ? "bg-violet-600/30 text-violet-300 border border-violet-600/50"
            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
      }`}>
        {done ? "✓" : step.step}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-bold text-white">{step.title}</span>
          <span
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
            style={{
              color: step.tagColor,
              background: step.tagColor + "22",
              border: `1px solid ${step.tagColor}44`,
            }}>
            {step.tag}
          </span>
          {step.effort && (
            <span className="text-[10px] text-zinc-600 font-mono">{step.effort}</span>
          )}
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
      </div>

      {/* CTA */}
      <button
        onClick={onOpen}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
          done
            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
            : step.highlight
              ? "bg-violet-600 hover:bg-violet-500 text-white"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        }`}>
        {done ? "Revisit" : "Open →"}
      </button>
    </div>
  );
}
