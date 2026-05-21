import { useState, useEffect } from "react";

// ─── PATH DEFINITIONS ──────────────────────────────────────────────────────────
// Each step: { type: "systems"|"explore"|"gt"|"preplab", id, label, desc }

const PATHS = [
  {
    id: "rag-engineer",
    title: "Ship Your First RAG System",
    emoji: "🔍",
    color: "#6366f1",
    duration: "~3 hrs",
    audience: "ML Engineers · Backend Engineers",
    summary: "Go from RAG theory to a production-ready retrieval pipeline with reranking, evals, and failure patterns.",
    steps: [
      { type: "gt",      id: "what-is-a-transformer",     label: "What Is a Transformer?",       desc: "Foundation — understand the model you're retrieving for." },
      { type: "systems", id: "evals",                     label: "Evals Lab",                    desc: "Define what 'good' looks like before you build." },
      { type: "explore", id: "ragpatterns",               label: "RAG Architecture Patterns",    desc: "Survey chunk-then-summarize, map-reduce, hybrid search." },
      { type: "systems", id: "kvcache",                   label: "KV Cache Engineering",         desc: "Understand how the model processes your retrieved context." },
      { type: "gt",      id: "inference-optimisation",    label: "Inference Optimisation",       desc: "Serving your RAG system efficiently." },
      { type: "systems", id: "guardrails",                label: "AI Guardrails",                desc: "Make the pipeline safe before shipping." },
      { type: "preplab", id: null, topic: "RAG",          label: "PrepLab: RAG Questions",       desc: "Test your knowledge with targeted RAG interview questions." },
    ],
  },
  {
    id: "llm-inference",
    title: "Understand LLM Inference",
    emoji: "⚡",
    color: "#3b82f6",
    duration: "~2.5 hrs",
    audience: "ML Engineers · Infra Engineers",
    summary: "Deep-dive into how LLMs generate tokens, what makes inference fast or slow, and how to optimise the full serving stack.",
    steps: [
      { type: "gt",      id: "what-is-a-transformer",     label: "What Is a Transformer?",       desc: "Start with the architecture that inference runs on." },
      { type: "gt",      id: "self-attention-deep-dive",  label: "Self-Attention Deep-Dive",     desc: "Understand the compute bottleneck in every forward pass." },
      { type: "systems", id: "kvcache",                   label: "KV Cache Engineering",         desc: "The core memory optimisation for autoregressive decoding." },
      { type: "systems", id: "specdecoding",              label: "Speculative Decoding",         desc: "How draft-then-verify achieves 2-3× throughput gains." },
      { type: "systems", id: "quantization",              label: "Quantization Engineering",     desc: "FP16 → INT8 → INT4 trade-offs and when each is worth it." },
      { type: "systems", id: "serving",                   label: "Serving Infrastructure",       desc: "vLLM, TGI, batching strategies, and SLA management." },
      { type: "gt",      id: "inference-optimisation",    label: "Inference Optimisation Guide", desc: "Synthesis: the full optimisation decision tree." },
      { type: "preplab", id: null, topic: "Inference",    label: "PrepLab: Inference Questions", desc: "Tackle hard inference engineering interview questions." },
    ],
  },
  {
    id: "ml-interview",
    title: "ML Engineer Interview Prep",
    emoji: "🎯",
    color: "#f59e0b",
    duration: "~4 hrs",
    audience: "Engineers preparing for ML / AI roles",
    summary: "Structured prep covering model architecture, training, inference, evals, and system design — the four pillars of ML eng interviews.",
    steps: [
      { type: "systems", id: "txarch",                    label: "Transformer Architecture",     desc: "Explain transformers from first principles — mandatory question." },
      { type: "gt",      id: "self-attention-deep-dive",  label: "Self-Attention Deep-Dive",     desc: "Attention mechanism math and intuition." },
      { type: "systems", id: "finetuning",                label: "Fine-Tuning Workflows",        desc: "PEFT, LoRA, when to fine-tune vs prompt." },
      { type: "systems", id: "rlhf",                      label: "RLHF / DPO / PPO",             desc: "Alignment training — common senior engineer question." },
      { type: "systems", id: "evalmetrics",               label: "Eval Metrics",                 desc: "ROUGE, BERTScore, G-Eval — how to measure model quality." },
      { type: "systems", id: "quantization",              label: "Quantization Engineering",     desc: "Compression trade-offs for deployment." },
      { type: "explore", id: "benchmarks",                label: "Benchmark Browser",            desc: "Know the major benchmarks and what they actually test." },
      { type: "gt",      id: "llm-evaluation-guide",      label: "LLM Evaluation Guide",         desc: "End-to-end eval strategy for production systems." },
      { type: "preplab", id: null, topic: null, diff: "hard", label: "PrepLab: Hard Questions", desc: "Hardest system design and architecture questions across all topics." },
    ],
  },
  {
    id: "agent-engineering",
    title: "Agent Engineering",
    emoji: "🤖",
    color: "#22c55e",
    duration: "~2 hrs",
    audience: "Engineers building agentic systems",
    summary: "From single-agent patterns to multi-agent orchestration, tool use, reliability, and observability.",
    steps: [
      { type: "systems", id: "agentarch",                 label: "Agent Architecture",           desc: "Planner–executor–memory patterns and when to use each." },
      { type: "gt",      id: "building-reliable-agents",  label: "Building Reliable Agents",     desc: "Failure modes, retry logic, and graceful degradation." },
      { type: "gt",      id: "multi-agent-orchestration", label: "Multi-Agent Orchestration",    desc: "Orchestrator ↔ worker patterns, message flow design." },
      { type: "systems", id: "observability",             label: "Observability",                desc: "Trace agent loops and catch failures in production." },
      { type: "systems", id: "guardrails",                label: "AI Guardrails",                desc: "Safety rails for autonomous agents." },
      { type: "systems", id: "constrained",               label: "Constrained Generation",       desc: "Force structured tool-call outputs from your agent." },
      { type: "preplab", id: null, topic: "Agents",       label: "PrepLab: Agent Questions",     desc: "Interview questions on agent design, reliability, observability." },
    ],
  },
  {
    id: "production-safety",
    title: "Production Safety & Reliability",
    emoji: "🛡️",
    color: "#ef4444",
    duration: "~2.5 hrs",
    audience: "ML Engineers · Platform Engineers",
    summary: "Build AI systems that fail safely: red teaming, guardrails, observability, incident response, and the subtle traps that break production systems.",
    steps: [
      { type: "systems", id: "shouldai",     label: "Should You Use AI?",          desc: "Start with the right question — many reliability failures begin with the wrong tool." },
      { type: "systems", id: "redteam",      label: "AI Red Teaming",              desc: "Identify failure modes before attackers do." },
      { type: "systems", id: "guardrails",   label: "AI Guardrails",               desc: "Build input/output safety rails for production systems." },
      { type: "systems", id: "trapslab",     label: "Traps Lab",                   desc: "The silent failure modes that production systems actually hit." },
      { type: "systems", id: "observability",label: "Observability",               desc: "Instrument your system so you can see failures when they happen." },
      { type: "systems", id: "debug_traces", label: "Debug This",                  desc: "Trace agent loops and LLM calls to diagnose root causes." },
      { type: "systems", id: "incidents",    label: "Incident Room",               desc: "Work through real production AI incidents." },
      { type: "gt",      id: "guardrails-for-llms", label: "Guardrails for LLMs", desc: "Architecture patterns for safe AI deployment." },
      { type: "preplab", id: null, topic: "safety", label: "PrepLab: Safety Questions", desc: "Interview questions on AI safety, red teaming, and reliability engineering." },
    ],
  },
  {
    id: "inference-deep-dive",
    title: "Inference Deep Dive",
    emoji: "🔬",
    color: "#06b6d4",
    duration: "~3 hrs",
    audience: "ML Engineers · Infra Engineers",
    summary: "The complete inference stack from attention mechanics to serving infrastructure — go from understanding Flash Attention to tuning a vLLM deployment.",
    steps: [
      { type: "gt",      id: "self-attention-deep-dive", label: "Self-Attention Deep-Dive",  desc: "The compute kernel at the heart of every inference call." },
      { type: "systems", id: "flashattn",    label: "Flash Attention",             desc: "How tiled computation cuts memory from O(N²) to O(N)." },
      { type: "systems", id: "kvcache",      label: "KV Cache Engineering",        desc: "The memory trade-off that makes autoregressive decoding practical." },
      { type: "systems", id: "specdecoding", label: "Speculative Decoding",        desc: "Draft-then-verify for 2-3× throughput without quality loss." },
      { type: "systems", id: "quantization", label: "Quantization Engineering",    desc: "FP16 → INT8 → INT4 trade-offs and mitigation strategies." },
      { type: "systems", id: "streaming",    label: "Streaming Patterns",          desc: "SSE, backpressure, buffering — ship tokens to users in real time." },
      { type: "systems", id: "serving",      label: "Serving Infrastructure",      desc: "vLLM, TGI, batching, and meeting SLA at scale." },
      { type: "gt",      id: "inference-optimisation", label: "Inference Optimisation", desc: "End-to-end decision tree for the full serving stack." },
      { type: "preplab", id: null, topic: "inference", label: "PrepLab: Inference Questions", desc: "Hard inference engineering questions covering the full stack." },
    ],
  },
];

const TYPE_CONFIG = {
  systems: { label: "Systems Module", color: "#6366f1", bg: "bg-indigo-950/50", border: "border-indigo-900/60", text: "text-indigo-300", icon: "⚙️" },
  explore: { label: "Explore",        color: "#3b82f6", bg: "bg-blue-950/50",   border: "border-blue-900/60",   text: "text-blue-300",   icon: "🗺️" },
  gt:      { label: "Ground Truth",   color: "#a78bfa", bg: "bg-violet-950/50", border: "border-violet-900/60", text: "text-violet-300", icon: "📖" },
  preplab: { label: "Prep Lab",       color: "#22c55e", bg: "bg-emerald-950/50",border: "border-emerald-900/60",text: "text-emerald-300", icon: "🎓" },
};

function loadProgress() {
  try { return JSON.parse(localStorage.getItem("gsl-path-progress") || "{}"); }
  catch { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem("gsl-path-progress", JSON.stringify(data)); } catch {}
}

export default function LearningPaths({ onNavigateTo }) {
  const [activePath, setActivePath] = useState(null);
  const [progress, setProgress] = useState(loadProgress);

  function toggleStep(pathId, stepIdx) {
    setProgress(prev => {
      const pathDone = new Set(prev[pathId] || []);
      if (pathDone.has(stepIdx)) pathDone.delete(stepIdx);
      else pathDone.add(stepIdx);
      const next = { ...prev, [pathId]: [...pathDone] };
      saveProgress(next);
      return next;
    });
  }

  function goToStep(step) {
    if (!onNavigateTo) return;
    if (step.type === "systems")  onNavigateTo({ tab: "systems",     moduleId: step.id });
    if (step.type === "explore")  onNavigateTo({ tab: "explore",     moduleId: step.id });
    if (step.type === "gt")       onNavigateTo({ tab: "groundtruth", postId: step.id });
    if (step.type === "preplab")  onNavigateTo({ tab: "preplab",     topic: step.topic || null, diff: step.diff || null });
  }

  const path = activePath ? PATHS.find(p => p.id === activePath) : null;
  const done = progress[activePath] ? new Set(progress[activePath]) : new Set();
  const allPathsDone = Object.fromEntries(
    PATHS.map(p => [p.id, (progress[p.id] || []).length])
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Learning Paths</h1>
        <p className="text-sm text-zinc-400 mt-1">Curated sequences through Systems, Ground Truth, Explore, and Prep Lab — follow a path or jump to any step.</p>
      </div>

      {/* Path picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PATHS.map(p => {
          const stepsComplete = allPathsDone[p.id] || 0;
          const total = p.steps.length;
          const pct = Math.round((stepsComplete / total) * 100);
          const isActive = activePath === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePath(isActive ? null : p.id)}
              className={`text-left rounded-xl border p-4 transition-all ${
                isActive
                  ? "border-zinc-600 bg-zinc-800"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-2xl">{p.emoji}</div>
                <div className="text-xs text-zinc-500 whitespace-nowrap">{p.duration}</div>
              </div>
              <div className="font-bold text-white mt-1 text-sm leading-snug">{p.title}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{p.audience}</div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>{stepsComplete}/{total} steps</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-zinc-800">
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: p.color }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active path steps */}
      {path && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          {/* Path header */}
          <div className="px-5 py-4 border-b border-zinc-800" style={{ borderLeftColor: path.color, borderLeftWidth: 3 }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{path.emoji}</span>
              <div>
                <div className="font-bold text-white">{path.title}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{path.summary}</div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="divide-y divide-zinc-800/50">
            {path.steps.map((step, idx) => {
              const cfg = TYPE_CONFIG[step.type];
              const isDone = done.has(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-4 px-5 py-3.5 transition-colors ${
                    isDone ? "bg-zinc-900/20 opacity-70" : "hover:bg-zinc-800/30"
                  }`}
                >
                  {/* Step number / check */}
                  <button
                    onClick={() => toggleStep(path.id, idx)}
                    className={`shrink-0 w-6 h-6 mt-0.5 rounded-full border text-xs font-bold flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-zinc-600 text-zinc-500 hover:border-zinc-400"
                    }`}
                    title={isDone ? "Mark incomplete" : "Mark complete"}
                  >
                    {isDone ? "✓" : idx + 1}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.border} border ${cfg.text}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className={`font-semibold text-sm ${isDone ? "line-through text-zinc-500" : "text-white"}`}>
                        {step.label}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{step.desc}</div>
                  </div>

                  {/* Go button */}
                  <button
                    onClick={() => { goToStep(step); toggleStep(path.id, idx); }}
                    className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700 whitespace-nowrap"
                  >
                    Go →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Path footer */}
          <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">{done.size}/{path.steps.length} complete</span>
            {done.size > 0 && (
              <button
                onClick={() => {
                  setProgress(prev => {
                    const next = { ...prev, [path.id]: [] };
                    saveProgress(next);
                    return next;
                  });
                }}
                className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Reset path
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!activePath && (
        <div className="text-center py-8 space-y-2">
          <div className="text-2xl">👆</div>
          <div className="text-sm text-zinc-400 font-medium">Pick one. Even if it's not your exact situation.</div>
          <div className="text-xs text-zinc-600">Not sure where to start? <span className="text-indigo-400">Ship Your First RAG System</span> is where most engineers get stuck first.</div>
        </div>
      )}
    </div>
  );
}
