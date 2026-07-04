import { useState } from "react";
import { track } from "./analytics";
import { getAreaReadiness } from "./readiness";
import { TradeoffCard } from "./shared";
import CaseChains from "./CaseChains";
// Salvaged from AIPM (archived surface): the pre-ship rigor checklist is the one
// genuinely-valuable AIE module worth surfacing in Production. Reuse-by-import so
// AIPM stays the single source (GSL Rev-2 R4-salvage).
import { LaunchChecklist } from "./AIPM";

const TRADEOFF = {
  title: "How do you cut latency and cost in production?",
  options: [
    {
      name: "Prompt optimisation",
      tagline: "Shrink input tokens. Compress context.",
      when: "You have verbose prompts or long chat histories. Low risk, low effort — always the first lever to pull before any infrastructure change.",
      color: "#22c55e",
      dims: [
        { label: "Latency gain",  value: 2 },
        { label: "Cost saving",   value: 2 },
        { label: "Impl effort",   value: 1 },
        { label: "Quality risk",  value: 1 },
      ],
    },
    {
      name: "Semantic cache",
      tagline: "Return stored response for similar queries.",
      when: "Your workload has high query repetition (support, FAQ, search). Cache hit rate matters — measure it before committing to this path.",
      color: "#3b82f6",
      dims: [
        { label: "Latency gain",  value: 3 },
        { label: "Cost saving",   value: 3 },
        { label: "Impl effort",   value: 2 },
        { label: "Quality risk",  value: 1 },
      ],
    },
    {
      name: "Smaller model",
      tagline: "Route to a cheaper model for simpler tasks.",
      when: "You have a mix of simple and complex queries. Build a router. Simple tasks take a smaller model; hard tasks escalate. Requires careful eval.",
      color: "#f59e0b",
      dims: [
        { label: "Latency gain",  value: 3 },
        { label: "Cost saving",   value: 3 },
        { label: "Impl effort",   value: 3 },
        { label: "Quality risk",  value: 3 },
      ],
    },
  ],
};

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
  { id: "drift-detection-production",  title: "Drift Detection in Production ML: PSI, KS Tests, and MMD Explained", desc: "Data drift, concept drift, and label drift. PSI thresholds, KS for continuous distributions, MMD for embedding spaces.", readMin: 10, tag: "Monitoring" },
  { id: "deployment-patterns-ml",      title: "Blue-Green, Canary, Shadow, Champion-Challenger: ML Deployment Patterns", desc: "Four patterns for deploying models without causing incidents. User-consistent canary routing, shadow mode, rollback mechanics.", readMin: 10, tag: "Deployment" },
  { id: "feature-store-patterns",      title: "Feature Stores: Solving Training-Serving Skew and Point-in-Time Correctness", desc: "The training-serving skew problem. Offline vs. online store, point-in-time joins for leakage prevention, when not to use one.", readMin: 11, tag: "Infrastructure" },
  { id: "model-registry-mlflow",       title: "Model Registry With MLflow: Versioning, Stage Transitions, and Audit Trails", desc: "What a model registry does that 'models folder in S3' doesn't. MLflow stage transitions, loading by stage alias in serving.", readMin: 10, tag: "Infrastructure" },
  { id: "retraining-triggers-strategies", title: "When to Retrain: Accuracy Triggers, Drift Triggers, and Continuous Training Pipelines", desc: "Why retraining on schedule is wrong. Accuracy-based and distribution-shift triggers, full retrain vs. warm start, Airflow DAG.", readMin: 10, tag: "MLOps" },
  { id: "ml-dockerization-patterns",   title: "ML Serving Containers: Docker, GPU, and Production-Grade FastAPI Patterns", desc: "Multi-stage Docker builds for ML, model weights as volume mounts, CUDA pinning, health/readiness probes, image size checklist.", readMin: 10, tag: "Infrastructure" },
  { id: "agent-observability",          title: "Observability for Agent Systems: Traces, Cost, and Alerts", desc: "Why logs alone fail for agents. Distributed trace anatomy, cost p95 vs mean, TTFT, and actionable alert thresholds.", readMin: 12, tag: "Agents" },
  { id: "agent-backend-apis",           title: "Backend APIs for Agent Services: Async Endpoints, Streaming, and Webhooks", desc: "Why standard REST breaks for agents. 202 + polling vs SSE vs webhooks. Request deduplication. Readiness probes that check model availability.", readMin: 11, tag: "API design" },
  { id: "async-task-queues-agents",     title: "Async Task Queues for Long-Running Agent Jobs", desc: "Task state machine design. Exactly-once execution via idempotency keys. Fan-out with Celery chord. Dead letter queues.", readMin: 12, tag: "Infrastructure" },
  { id: "kubernetes-ai-workloads",      title: "Kubernetes for AI Workloads: GPU Scheduling, KEDA, and Disruption Budgets", desc: "Why HPA fails for LLMs. GPU resource requests. KEDA scaling on queue depth. PodDisruptionBudgets. Readiness vs liveness for model-serving pods.", readMin: 13, tag: "K8s" },
  { id: "agent-governance",             title: "Governance and Auditability for Production AI Agents: Lineage, Versioning, Rollback, and Human Gates", desc: "Data lineage for agent actions, model version pinning, prompt versioning as code, rollback triggers, and HITL approval gate design.", readMin: 13, tag: "Governance" },
];

const PREPLAB_Qs = [
  { id: "llmops-5",    difficulty: "Medium", diffColor: "#f59e0b", gated: true,  question: "You deploy a new model version. All evals pass. Production error rate spikes 3x in 2 hours. First diagnostic step?" },
  { id: "deploy-2",    difficulty: "Medium", diffColor: "#f59e0b", gated: false, question: "You want to validate a new model on real traffic with zero risk to users. Which deployment pattern?" },
  { id: "drift-1",     difficulty: "Medium", diffColor: "#f59e0b", gated: false, question: "A fraud model's precision drops after a marketing campaign brings a new user cohort. Data drift, concept drift, or label drift?" },
  { id: "retrain-1",   difficulty: "Medium", diffColor: "#f59e0b", gated: false, question: "Why is 'retrain every Monday at 2am' a poor default retraining strategy?" },
  { id: "featstore-1", difficulty: "Medium", diffColor: "#f59e0b", gated: false, question: "A DS computes features in Python for training, an engineer re-implements them in Java for serving. Model underperforms. Cause?" },
  { id: "llmops-1",    difficulty: "Hard",   diffColor: "#ef4444", gated: true,  question: "Your LLM API p99 latency is 4.2s. Users are complaining. First optimization to try (before switching models)?" },
  { id: "deploy-1",    difficulty: "Hard",   diffColor: "#ef4444", gated: false, question: "In canary deployment, why must routing be user-consistent rather than request-random?" },
  { id: "drift-3",     difficulty: "Hard",   diffColor: "#ef4444", gated: true,  question: "You want to detect drift in sentence embedding space. Why is PSI insufficient and what should you use instead?" },
];

// Stable difficulty ordering: easy → medium → hard (case-insensitive), preserving
// authored order within a band. Used to order the flat "Test Your Judgment" list.
const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };
function sortByDifficulty(qs) {
  return qs
    .map((q, i) => ({ q, i, r: DIFF_RANK[(q.difficulty || "").toLowerCase()] ?? 1 }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map(x => x.q);
}

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
  // Phase 0.3 (Production): the LLM Lab is the canonical production-education home (richer/more
  // interactive than the thin Concepts production gym). Like AgentsHub/EvaluationHub, the hub's
  // learn CTAs point at the canonical Lab rather than the Concepts gym they used to open.
  function goConcepts(gymId) { track("prod_hub_concepts", { gymId, target: "llmlab" }); onNavigate("llmlab"); }

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
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
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

      {/* Case Chains (L2 · multi-step) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <SectionLabel>Case Chains (L2 · multi-step)</SectionLabel>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: COLOR }}>L2 · multi-step</span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mb-4">One LLM-serving incident, four layers deep — each fix you make surfaces the next symptom, the way a real production degradation actually unfolds.</p>
        <CaseChains domain="production" />
      </div>

      {/* Tradeoff */}
      <div>
        <SectionLabel>When to use what</SectionLabel>
        <TradeoffCard data={TRADEOFF} />
      </div>

      {/* Pre-Ship Readiness (salvaged from AIPM Launch Checklist) */}
      <div>
        <SectionLabel>Pre-Ship Readiness — the checklist before you ship an LLM feature</SectionLabel>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mb-4">
          Everything that must be true before an LLM feature goes to production: eval baselines and regression thresholds, live dashboards and P95 alerts, fallback and human-escalation paths, guardrail and PII review, provider ToS and disclosure, cost ceilings. Work through it as if you're shipping tomorrow — the risk gauge only goes green once the must-haves are covered.
        </p>
        <LaunchChecklist />
      </div>

      {/* Concepts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Key Concepts</SectionLabel>
          <button onClick={() => goConcepts("production")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">Open LLM Lab →</button>
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
              <span className="mt-2 text-[11px] font-bold text-violet-400 block">Open in LLM Lab →</span>
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
          {sortByDifficulty(PREPLAB_Qs).map(q => (
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
