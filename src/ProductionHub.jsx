import { useState } from "react";
import { track } from "./analytics";
import { getAreaReadiness } from "./readiness";

const CONCEPTS = [
  { id: "cost-latency-concepts", label: "Cost & Latency",  fidelity: "~ Simplified", fidelityColor: "#22c55e", desc: "TTFT, TBT, E2E latency — what each measures and the budget tradeoffs at inference time.", gymId: "production" },
  { id: "observability-concepts",label: "Observability",   fidelity: "~ Simplified", fidelityColor: "#22c55e", desc: "Trace anatomy, what signals to log, alert thresholds — the production monitoring stack for LLMs.", gymId: "production" },
  { id: "serving",               label: "Model Serving",   fidelity: "~ Simplified", fidelityColor: "#22c55e", desc: "vLLM, continuous batching, quantisation, speculative decoding — how LLMs serve at scale.", gymId: "language-models" },
  { id: "training-signal",       label: "Training Signal", fidelity: "~ Simplified", fidelityColor: "#22c55e", desc: "What the model actually optimises for — and why production behaviour diverges from training metrics.", gymId: "language-models" },
];

const GT_POSTS = [
  { id: "llmops-production-checklist", title: "LLMOps: What Production AI Actually Needs That Tutorials Skip", desc: "Observability, prompt versioning, latency budgets, cost tracking, model routers, A/B testing, and rollback strategies.", readMin: 13, tag: "Core" },
  { id: "inference-optimisation",      title: "LLM Inference Optimisation: Batching, Quantisation, and Speculative Decoding", desc: "How to reduce latency and cost at inference time without retraining. INT8/INT4 quantisation, continuous batching.", readMin: 10, tag: "Performance" },
  { id: "prompt-caching",              title: "Prompt Caching and Token Cost Optimisation at Scale", desc: "How prompt caching works, when it pays off, and how to reduce inference cost by 60-80% on repetitive workloads.", readMin: 7, tag: "Cost" },
  { id: "llm-observability",           title: "LLM Observability: What to Log, Trace, and Alert On", desc: "Prompt/response logging, latency tracing, cost tracking, quality signals, and alert thresholds for production.", readMin: 9, tag: "Monitoring" },
];

const PREPLAB_Qs = [
  { id: "llmops-5", difficulty: "Medium", diffColor: "#f59e0b", gated: true, question: "You deploy a new model version. All evals pass. Production error rate spikes 3x in 2 hours. First diagnostic step?" },
  { id: "llmops-1", difficulty: "Hard",   diffColor: "#ef4444", gated: true, question: "Your LLM API p99 latency is 4.2s. Users are complaining. The first optimization to try (before switching models) is:" },
  { id: "llmops-2", difficulty: "Hard",   diffColor: "#ef4444", gated: true, question: "You are spending $12K/month on LLM API calls. The single most impactful cost reduction technique (without degrading quality) is typically:" },
];

function getProgress() {
  try {
    const history = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
    const mastery = JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]");
    const opsQs   = Object.keys(history).filter(k => k.startsWith("llmops")).length;
    const opsOk   = Object.keys(history).filter(k => k.startsWith("llmops") && history[k]?.correct).length;
    const conceptsDone = mastery.filter(id => ["cost-latency-concepts","observability-concepts","serving","training-signal"].includes(id)).length;
    return { opsQs, opsOk, conceptsDone };
  } catch { return { opsQs: 0, opsOk: 0, conceptsDone: 0 }; }
}

function SectionLabel({ children }) {
  return <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{children}</p>;
}

export default function ProductionHub({ onNavigate, onNavigateTo }) {
  const [progress]  = useState(getProgress);
  const [readiness] = useState(() => getAreaReadiness("production"));
  const COLOR = "#22c55e";

  function goGT(postId) { track("prod_hub_gt", { postId }); if (onNavigateTo) onNavigateTo({ tab: "groundtruth", postId }); else onNavigate("groundtruth"); }
  function goConcepts(gymId) { track("prod_hub_concepts", { gymId }); if (onNavigateTo) onNavigateTo({ tab: "concepts", gymId }); else onNavigate("concepts"); }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">

      {/* Intro */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: COLOR }}>Production</div>
          {readiness && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: readiness.color, borderColor: readiness.color + "40", background: readiness.color + "12" }}>{readiness.level} · {readiness.pct}%</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">How do you scale it without it breaking?</h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          The gap between a demo and a production system is where most AI engineers get stuck. Inference latency, cost overruns, KV cache eviction, monitoring gaps — these aren't AI problems, they're systems problems. 72% of enterprises adopting AI automation haven't built cost controls into their LLM infrastructure. This is where you learn what they missed.
        </p>
      </div>

      {/* Lab */}
      <div>
        <SectionLabel>The Lab</SectionLabel>
        <button onClick={() => { track("prod_hub_lab", {}); onNavigate("llmlab"); }}
          className="w-full text-left rounded-2xl p-6 transition-all card-lift"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderTop: `2px solid ${COLOR}` }}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">LLM Lab</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: COLOR }}>9 modules</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">Configure inference pipelines, cost optimisation strategies, and serving architectures. Watch latency budgets break under load and understand exactly which component failed.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["KV cache", "Quantisation", "Speculative decoding", "Semantic caching", "Model routing"].map(f => (
                  <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{f}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0 hidden sm:flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLOR} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold" style={{ color: COLOR }}>Open LLM Lab →</div>
        </button>
      </div>

      {/* Concepts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Key Concepts</SectionLabel>
          <button onClick={() => goConcepts("production")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All Concepts →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONCEPTS.map(c => (
            <button key={c.id} onClick={() => goConcepts(c.gymId)}
              className="text-left p-4 rounded-xl transition-all card-lift"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-white">{c.label}</span>
                <span className="text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded" style={{ color: c.fidelityColor, background: c.fidelityColor + "15", border: `1px solid ${c.fidelityColor}30` }}>{c.fidelity}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
              <span className="mt-2 text-[11px] font-bold text-violet-400 block">Open in Concepts →</span>
            </button>
          ))}
        </div>
      </div>

      {/* GT */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>From the Field</SectionLabel>
          <button onClick={() => onNavigate("groundtruth")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All GT posts →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GT_POSTS.map(p => (
            <button key={p.id} onClick={() => goGT(p.id)}
              className="text-left p-4 rounded-xl transition-all card-lift"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">{p.tag}</span>
                <span className="text-[9px] font-mono text-zinc-500">{p.readMin} min</span>
              </div>
              <p className="text-sm font-bold text-white leading-snug mb-1">{p.title}</p>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{p.desc}</p>
              <span className="mt-2 text-[11px] font-bold text-violet-400 block">Read →</span>
            </button>
          ))}
        </div>
      </div>

      {/* PrepLab */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Test Your Judgment</SectionLabel>
          <button onClick={() => { track("prod_hub_preplab_all", {}); onNavigate("preplab"); }} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All production questions →</button>
        </div>
        <div className="space-y-3">
          {PREPLAB_Qs.map(q => (
            <div key={q.id} className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ color: q.diffColor, borderColor: q.diffColor + "40", background: q.diffColor + "10" }}>{q.difficulty}</span>
                {q.gated && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500">Access code</span>}
              </div>
              <p className="text-sm text-zinc-200 leading-snug mb-3">{q.question}</p>
              <button onClick={() => { track("prod_hub_q", { id: q.id }); onNavigate("preplab"); }} className="text-[11px] font-bold hover:opacity-80" style={{ color: COLOR }}>Answer in PrepLab →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      {(progress.opsQs > 0 || progress.conceptsDone > 0) && (
        <div>
          <SectionLabel>Your Progress Here</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.opsQs}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Questions done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.conceptsDone}<span className="text-zinc-500 text-sm font-normal">/4</span></div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Concepts done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.opsQs > 0 ? Math.round(progress.opsOk / progress.opsQs * 100) + "%" : "–"}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">LLMOps accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
