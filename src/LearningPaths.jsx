import { useState } from "react";
import { PREP_QUESTIONS } from "./data/preplabQuestions";
import CertificateModal from "./CertificateModal";

// ─── BIDIRECTIONAL LINK MAP ────────────────────────────────────────────────────
// Built once at module load: GT postId → PrepLab questions that readMore it
const GT_QUESTION_MAP = {};
PREP_QUESTIONS.forEach(q => {
  const pid = q.readMore?.postId;
  if (pid) {
    if (!GT_QUESTION_MAP[pid]) GT_QUESTION_MAP[pid] = [];
    GT_QUESTION_MAP[pid].push(q);
  }
});

const DIFF_CHIP = {
  beginner:              "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40",
  "beginner-intermediate":"bg-teal-950/60 text-teal-400 border border-teal-800/40",
  intermediate:          "bg-sky-950/60 text-sky-400 border border-sky-800/40",
  easy:                  "bg-blue-950/60 text-blue-400 border border-blue-800/40",
  medium:                "bg-amber-950/60 text-amber-400 border border-amber-800/40",
  hard:                  "bg-red-950/60 text-red-400 border border-red-800/40",
  staff:                 "bg-indigo-950/60 text-indigo-400 border border-indigo-800/40",
  daunting:              "bg-violet-950/60 text-violet-400 border border-violet-800/40",
};
const DIFF_SHORT = {
  beginner: "B", "beginner-intermediate": "B-I", intermediate: "I",
  easy: "E", medium: "M", hard: "H", staff: "S", daunting: "D",
};

// ─── PATH DEFINITIONS ──────────────────────────────────────────────────────────
// Each step: { type: "systems"|"explore"|"gt"|"preplab", id, label, desc }

const PATHS = [
  {
    id: "first-principles",
    title: "First Principles: NLP → Production",
    abbr: "FP",
    color: "#8b5cf6",
    duration: "~4 hrs",
    audience: "Anyone new to GenAI · Career Switchers · PMs",
    summary: "Build from zero to expert — language models, transformers, RAG, agents, evaluation, and production. Every step links to practice questions.",
    steps: [
      { type: "gt", id: "ngrams-to-neural",            label: "NLP Origins: N-grams → Word Vectors",      desc: "Why distributional semantics works. The foundation all neural NLP builds on." },
      { type: "gt", id: "attention-from-scratch",       label: "Attention: From Dot Products Up",          desc: "Build self-attention from scratch. Understand Q, K, V — the mechanism at the heart of every LLM." },
      { type: "gt", id: "mha-mqa-gqa-explained",        label: "Multi-Head, MQA, GQA Explained",           desc: "Why modern LLMs group attention heads, and what it costs to not do so at scale." },
      { type: "gt", id: "bert-internals-explained",     label: "BERT Internals",                           desc: "Bidirectional encoders, masked LM pretraining, [CLS] pooling — what the encoder actually learned." },
      { type: "gt", id: "pretraining-data-decisions",   label: "Pretraining Data Decisions",               desc: "What goes into an LLM's corpus and why data quality beats data quantity every time." },
      { type: "gt", id: "context-window-guide",         label: "The Context Window",                       desc: "What fits, what gets dropped, overflow strategies. The constraint every production AI system works around." },
      { type: "gt", id: "finetune-playbook",            label: "Fine-Tuning Playbook",                     desc: "When to fine-tune vs. prompt. LoRA, PEFT, instruction tuning — the full decision tree." },
      { type: "gt", id: "how-rag-works",                label: "How RAG Works",                            desc: "Embed → store → retrieve → generate. The architecture that lets LLMs answer questions about your data." },
      { type: "gt", id: "vector-databases-compared",    label: "Vector Databases Compared",                desc: "pgvector vs Pinecone vs Chroma vs Weaviate. What to choose and when the choice actually matters." },
      { type: "gt", id: "bi-encoder-vs-cross-encoder",  label: "Bi-Encoder vs Cross-Encoder",              desc: "Speed vs accuracy in retrieval. Why you almost always need both stages in production." },
      { type: "gt", id: "two-stage-retrieval-reranker", label: "Two-Stage Retrieval",                      desc: "Recall then precision: how bi-encoder + cross-encoder combine into a production retrieval stack." },
      { type: "gt", id: "llm-evaluation-guide",         label: "LLM Evaluation Guide",                     desc: "How to measure whether your system works. Human evals, automated evals, LLM-as-judge." },
      { type: "gt", id: "your-prompt-is-code",          label: "Your Prompt is Code",                      desc: "Prompts are production artifacts. Version them, test them, own them — and understand when they break." },
      { type: "gt", id: "react-pattern",                label: "The ReAct Pattern",                        desc: "Reasoning + acting: the pattern behind every tool-using agent you'll build." },
      { type: "preplab", id: null, topic: "llm-fundamentals", label: "PrepLab: LLM Fundamentals Questions",          desc: "Test your understanding with beginner through intermediate questions." },
    ],
  },
  {
    id: "rag-engineer",
    title: "Ship Your First RAG System",
    abbr: "RAG",
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
    abbr: "INF",
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
    abbr: "INT",
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
    abbr: "AGT",
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
    abbr: "PSR",
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
    id: "de-to-ai-engineer",
    title: "Data Engineer → AI Engineer",
    abbr: "DE→",
    color: "#f59e0b",
    duration: "~3.5 hrs",
    audience: "Data Engineers · Analytics Engineers · DS transitioning to AI Eng",
    summary: "You have Layer 1 (SQL, Python, pipelines). This path builds Layer 3: RAG, vector DBs, evals, observability, and agent architecture — the skills that command the premium.",
    steps: [
      { type: "gt",      id: "three-layer-de-skill-stack",   label: "The Three-Layer DE Skill Stack", desc: "Understand why Layer 3 is where the salary premium lives — and what's in it." },
      { type: "gt",      id: "why-rag-lies",                  label: "Why Your RAG System Lies",       desc: "The five RAG failure modes every DE building data pipelines needs to know." },
      { type: "systems", id: "lab",                           label: "RAG Lab",                        desc: "Configure a RAG pipeline, watch it fail, understand why. Core Layer 3 intuition." },
      { type: "systems", id: "vectordb",                      label: "Vector DB Engineering",          desc: "pgvector vs Chroma vs Pinecone, HNSW vs IVF, hybrid search — the infra decisions." },
      { type: "gt",      id: "nm-problem-mcp",               label: "The N×M Problem and MCP",        desc: "How modern AI systems wire tools together — the integration architecture every AI Eng owns." },
      { type: "systems", id: "evalmetrics",                   label: "Eval Metrics",                   desc: "RAGAS, BERTScore, LLM-as-Judge — how to measure whether your pipeline actually works." },
      { type: "gt",      id: "the-eval-crisis",               label: "The Eval Crisis",                desc: "Why most evals are wrong, and what a real eval suite looks like." },
      { type: "systems", id: "observability",                 label: "LLM Observability",              desc: "Tracing, cost monitoring, latency profiling — the production instrumentation layer." },
      { type: "systems", id: "agentmemory",                   label: "Agent Memory Architecture",      desc: "Short-term, long-term, episodic, semantic — the storage design decisions for agents." },
      { type: "preplab", id: null, topic: "rag",              label: "PrepLab: RAG + Vector DB",       desc: "Interview questions covering retrieval, indexing, and vector DB engineering." },
    ],
  },
  {
    id: "inference-deep-dive",
    title: "Inference Deep Dive",
    abbr: "IDD",
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
  {
    id: "senior-ai-engineer",
    title: "Senior AI Engineer: Production Track",
    abbr: "SAE",
    color: "#06b6d4",
    duration: "~5 hrs",
    audience: "Mid-level Engineers · Backend Engineers · AI Engineers targeting senior roles",
    summary: "The full production curriculum: MCP architecture, tool use, observability, testing, backend infra, K8s, security, and governance — every track a senior AI engineer JD asks about.",
    steps: [
      { type: "gt",      id: "mcp-explained",                label: "Model Context Protocol",             desc: "The standard for agent-tool integration. Client-host-server model, security directionality, enterprise adoption." },
      { type: "gt",      id: "agent-tool-use-production",    label: "Tool Use in Production",             desc: "Idempotency key design, read vs write retry strategy, audit logs. What separates toy agents from production ones." },
      { type: "systems", id: "agentarch",                    label: "Agent Architecture",                 desc: "Planner-executor-memory patterns. The canonical architecture to draw in any system design interview." },
      { type: "gt",      id: "agent-observability",          label: "Agent Observability",                desc: "Trace anatomy, cost p95, TTFT alerts. The three signals that tell you if your agent is healthy." },
      { type: "gt",      id: "agent-testing-strategies",     label: "Testing Agentic Systems",            desc: "Why unit tests fail for agents. Mock-behavioral tests, trajectory evaluation, red teaming." },
      { type: "gt",      id: "agent-backend-apis",           label: "Backend APIs for Agents",            desc: "202 + polling, SSE, request deduplication. The async patterns that stop gateway timeouts from killing your agent." },
      { type: "gt",      id: "async-task-queues-agents",     label: "Async Task Queues",                  desc: "Task state machine, exactly-once execution, DLQ design. The infrastructure behind long-running agent jobs." },
      { type: "gt",      id: "kubernetes-ai-workloads",      label: "Kubernetes for AI Workloads",        desc: "GPU scheduling, KEDA vs HPA, PodDisruptionBudgets. Production K8s for LLM-serving pods." },
      { type: "gt",      id: "agent-security",               label: "Security for AI Agents",             desc: "Indirect injection, OWASP LLM Top 10, least privilege tool design. The security mindset shift for agents." },
      { type: "gt",      id: "agent-governance",             label: "Governance and Auditability",        desc: "Data lineage, model version pinning, prompt versioning as code, HITL approval gates." },
      { type: "systems", id: "guardrails",                   label: "AI Guardrails",                      desc: "Input/output safety rails. Wire these around every agent before it touches production." },
      { type: "gt",      id: "llmops-production-checklist",  label: "LLMOps Production Checklist",        desc: "The full checklist: observability, prompt versioning, cost tracking, rollback. Ship and maintain at scale." },
      { type: "preplab", id: null, topic: "agents",          label: "PrepLab: Agents + Production",       desc: "MCP, tool use, observability, security, governance — all the senior-level production questions." },
    ],
  },
];

const TYPE_CONFIG = {
  systems: { label: "Systems Module", color: "#6366f1", bg: "bg-indigo-950/50", border: "border-indigo-900/60", text: "text-indigo-300" },
  explore: { label: "Explore",        color: "#3b82f6", bg: "bg-blue-950/50",   border: "border-blue-900/60",   text: "text-blue-300"   },
  gt:      { label: "Ground Truth",   color: "#a78bfa", bg: "bg-violet-950/50", border: "border-violet-900/60", text: "text-violet-300" },
  preplab: { label: "Prep Lab",       color: "#22c55e", bg: "bg-emerald-950/50",border: "border-emerald-900/60",text: "text-emerald-300" },
};

function loadProgress() {
  try { return JSON.parse(localStorage.getItem("gsl-path-progress") || "{}"); }
  catch { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem("gsl-path-progress", JSON.stringify(data)); } catch {}
}

// ─── LINKED QUESTIONS COMPONENT ───────────────────────────────────────────────
// Shows PrepLab questions that link back to a GT post (bidirectional link)
function LinkedQuestions({ postId, color, onNavigateTo }) {
  const [open, setOpen] = useState(false);
  const qs = GT_QUESTION_MAP[postId] || [];
  if (!qs.length) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[10px] font-mono transition-colors hover:opacity-100"
        style={{ color: open ? color : "#52525b" }}
      >
        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms" }}>
          <path d="M1 1l4 2-4 2V1z"/>
        </svg>
        {qs.length} practice {qs.length === 1 ? "question" : "questions"}
      </button>
      {open && (
        <div className="mt-1.5 space-y-1 pl-1">
          {qs.slice(0, 5).map(q => (
            <div key={q.id} className="flex items-start gap-2 px-2 py-1.5 rounded-lg"
              style={{ background: "rgba(24,24,27,0.8)", borderLeft: `2px solid ${color}35` }}>
              <span className={`shrink-0 text-[9px] font-bold px-1 py-0.5 rounded ${DIFF_CHIP[q.difficulty] || DIFF_CHIP.medium}`}>
                {DIFF_SHORT[q.difficulty] || q.difficulty}
              </span>
              <span className="text-[11px] text-zinc-400 flex-1 leading-snug" style={{
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
              }}>
                {q.question}
              </span>
              {onNavigateTo && (
                <button
                  onClick={() => onNavigateTo({ tab: "preplab" })}
                  className="shrink-0 text-[10px] font-mono opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap"
                  style={{ color }}
                >
                  Try →
                </button>
              )}
            </div>
          ))}
          {qs.length > 5 && (
            <div className="text-[10px] font-mono pl-2" style={{ color: "#3f3f46" }}>
              +{qs.length - 5} more in PrepLab
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LearningPaths({ onNavigateTo, user }) {
  const [activePath, setActivePath] = useState(PATHS[0].id);
  const [progress, setProgress] = useState(loadProgress);
  const [justCompleted, setJustCompleted] = useState(null);
  const [showCert, setShowCert] = useState(false);

  function toggleStep(pathId, stepIdx) {
    setProgress(prev => {
      const pathDone = new Set(prev[pathId] || []);
      const wasComplete = pathDone.has(stepIdx);
      if (pathDone.has(stepIdx)) pathDone.delete(stepIdx);
      else pathDone.add(stepIdx);
      const next = { ...prev, [pathId]: [...pathDone] };
      saveProgress(next);
      if (!wasComplete) {
        setJustCompleted(`${pathId}-${stepIdx}`);
        setTimeout(() => setJustCompleted(null), 500);
      }
      return next;
    });
  }

  function goToStep(step, idx) {
    if (!onNavigateTo) return;
    if (step.type === "systems")  onNavigateTo({ tab: "systems",     moduleId: step.id });
    if (step.type === "explore")  onNavigateTo({ tab: "explore",     moduleId: step.id });
    if (step.type === "gt")       onNavigateTo({ tab: "groundtruth", postId: step.id, pathContext: {
      pathId: path.id, stepIdx: idx, totalSteps: path.steps.length,
      pathTitle: path.title, pathColor: path.color, pathAbbr: path.abbr,
      steps: path.steps,
    }});
    if (step.type === "preplab")  onNavigateTo({ tab: "preplab",     topic: step.topic || null, diff: step.diff || null });
  }

  const path = activePath ? PATHS.find(p => p.id === activePath) : null;
  const done = progress[activePath] ? new Set(progress[activePath]) : new Set();
  const allPathsDone = Object.fromEntries(
    PATHS.map(p => [p.id, (progress[p.id] || []).length])
  );

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar — full width on mobile (when no path selected), fixed width on desktop */}
      <div className={`border-r border-zinc-800 overflow-y-auto py-3 shrink-0
        ${activePath ? "hidden sm:block sm:w-56" : "block w-full sm:w-56"}`}>
        <div className="px-4 py-1 text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-1">PATHS</div>
        {PATHS.map(p => {
          const stepsComplete = allPathsDone[p.id] || 0;
          const total = p.steps.length;
          const pct = Math.round((stepsComplete / total) * 100);
          const isActive = activePath === p.id;
          return (
            <button key={p.id} onClick={() => setActivePath(p.id)}
              style={isActive ? {
                background: `linear-gradient(90deg, ${p.color}22 0%, ${p.color}06 100%)`,
                boxShadow: "inset 0 0 0 1px var(--border)",
              } : {}}
              className={`w-full text-left px-4 py-3 transition-all ${isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border-l-2 border-transparent"}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="shrink-0 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded leading-none"
                  style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}35`, letterSpacing: "0.08em" }}>
                  {p.abbr}
                </span>
                <span className="text-xs font-semibold leading-snug truncate">{p.title}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1.5">
                <span>{stepsComplete}/{total} steps</span>
                <span style={{ color: pct > 0 ? p.color : undefined }}>{pct}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(39,39,42,0.8)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: p.color, boxShadow: pct > 0 ? `2px 0 6px ${p.color}60` : "none" }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel — hidden on mobile when no path selected */}
      <div className={`flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6
        ${activePath ? "block" : "hidden sm:block"}`}>
        {/* Mobile back button */}
        {activePath && (
          <button onClick={() => setActivePath(null)}
            className="sm:hidden flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors font-mono mb-2">
            ← All Paths
          </button>
        )}
      {path && (
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(24,24,27,0.95) 0%, rgba(15,15,17,1) 100%)", border: `1px solid ${path.color}25`, borderTop: "1px solid var(--border)" }}>
          {/* Path header */}
          <div className="px-4 sm:px-5 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] font-bold px-2 py-1 rounded"
                style={{ background: `${path.color}18`, color: path.color, border: `1px solid ${path.color}40`, letterSpacing: "0.1em" }}>
                {path.abbr}
              </span>
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
              const hasLinked = step.type === "gt" && GT_QUESTION_MAP[step.id]?.length > 0;
              return (
                <div
                  key={idx}
                  className={`px-4 sm:px-5 py-3 sm:py-3.5 transition-colors ${
                    isDone ? "bg-zinc-900/20 opacity-70" : "hover:bg-zinc-800/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleStep(path.id, idx)}
                      className={`shrink-0 w-6 h-6 mt-0.5 rounded-full border text-xs font-bold flex items-center justify-center transition-all ${
                        justCompleted === `${path.id}-${idx}` ? "animate-stepDone" : ""
                      } ${
                        isDone
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-zinc-600 text-zinc-500 hover:border-zinc-400"
                      }`}
                      title={isDone ? "Mark incomplete" : "Mark complete"}
                    >
                      {isDone ? "✓" : idx + 1}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.border} border ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        <span className={`font-semibold text-sm ${isDone ? "line-through text-zinc-500" : "text-white"}`}>
                          {step.label}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{step.desc}</div>
                      {hasLinked && (
                        <LinkedQuestions postId={step.id} color={path.color} onNavigateTo={onNavigateTo} />
                      )}
                    </div>
                    <button
                      onClick={() => { goToStep(step, idx); toggleStep(path.id, idx); }}
                      style={{ background: `linear-gradient(135deg, ${path.color}22 0%, ${path.color}10 100%)`, border: `1px solid ${path.color}40`, color: path.color }}
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all hover:brightness-125 whitespace-nowrap"
                    >
                      Go →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 sm:px-5 py-3 border-t border-zinc-800 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">{done.size}/{path.steps.length} complete</span>
            <div className="flex items-center gap-3">
              {done.size === path.steps.length && path.steps.length > 0 && (
                <button
                  onClick={() => setShowCert(true)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
                  style={{ background: path.color, color: "#000" }}
                >
                  Get Certificate
                </button>
              )}
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
        </div>
      )}

      <CertificateModal
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        pathTitle={PATHS.find(p => p.id === activePath)?.title || "Learning Path"}
        pathColor={PATHS.find(p => p.id === activePath)?.color || "#06b6d4"}
        pathAbbr={PATHS.find(p => p.id === activePath)?.abbr || "GSL"}
        user={user}
        stepsCompleted={done.size}
        totalSteps={PATHS.find(p => p.id === activePath)?.steps.length || 0}
      />
      </div>
    </div>
  );
}
