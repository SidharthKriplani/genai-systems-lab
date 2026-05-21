import { useState, useEffect, useMemo, useRef } from "react";
import HowTo from "./HowTo";
import IndiaScaleLab from "./IndiaScale";
import ModelRouterLab from "./ModelRouter";
import InferenceOptimizer from "./InferenceOptimizer";
import MLCiCdLab from "./MLCiCd";

import {
  ABTestingLab, AIDeploymentArchitecture, AIGuardrailsEngineering, AIRedTeaming, AISystemDesignCanvas, AgentArchitecture, BuildThis, ConstrainedGeneration, ContextCompaction, ContextWindowEngineering, CostLatencyLab, DebugTraces, EvalFrameworksLab, EvalMetrics, EvalsLab, FineTuningLab, FineTuningWorkflows, FlashAttention, GRPOAgentRL, IncidentRoom, KVCacheEngineering, LLMObservability, LangSmithTracingLab, MoEArchitecture, ModelMerging, ModelStrategyLab, MultimodalAI, MultimodalSystems, PromptCaching, PromptCachingLab, PromptEngineeringLab, QuantizationEngineering, RLHFAlignment, ReasoningModelsLab, ServingInfra, ShouldUseAI, SpeculativeDecoding, StreamingPatterns, StructuredOutputEngineering, SyntheticDataGeneration, TransformerArchitecture, TrapsLab, VibeCodingAndAgenticDev
} from "./systems/modules";

const SYSTEMS_MODULES = [
  { id: "evals",         label: "Evals Lab",          tag: "DESIGN",     group: "DESIGN",  component: EvalsLab           },
  { id: "evalfw",        label: "Eval Frameworks",    tag: "FRAMEWORK",  group: "DESIGN",  component: EvalFrameworksLab  },
  { id: "strategy",      label: "Model Strategy",     tag: "DECISION",   group: "DESIGN",  component: ModelStrategyLab   },
  { id: "shouldai",      label: "Should You Use AI?", tag: "JUDGE",      group: "DESIGN",  component: ShouldUseAI        },
  { id: "costlatency",   label: "Cost/Latency",       tag: "COST",     group: "BUILD",   component: CostLatencyLab   },
  { id: "finetune",      label: "Fine-Tuning Lab",    tag: "TRAIN",    group: "BUILD",   component: FineTuningLab    },
  { id: "indiascale",    label: "India Scale Lab",    tag: "₹ INDIA",  group: "BUILD",   component: IndiaScaleLab    },
  { id: "caching",       label: "Prompt Caching",     tag: "CACHE",    group: "BUILD",   component: PromptCachingLab },
  { id: "router",        label: "Model Router",       tag: "ROUTE",    group: "BUILD",   component: ModelRouterLab   },
  { id: "inference",     label: "Inference Optimizer",tag: "SERVING",  group: "BUILD",   component: InferenceOptimizer},
  { id: "incidents",     label: "Incident Room",      tag: "DIAGNOSE", group: "OPS",     component: IncidentRoom     },
  { id: "observability", label: "Observability",      tag: "OPS",      group: "OPS",     component: LLMObservability },
  { id: "abtesting",     label: "A/B Testing",        tag: "SHIP",     group: "OPS",     component: ABTestingLab     },
  { id: "mlcicd",        label: "ML CI/CD",           tag: "DEPLOY",   group: "OPS",     component: MLCiCdLab        },
  { id: "debug_traces",  label: "Debug This",         tag: "DIAGNOSE", group: "OPS",     component: DebugTraces       },
  { id: "compaction",    label: "Context Compaction",  tag: "CONTEXT",  group: "BUILD",   component: ContextCompaction },
  { id: "canvas",        label: "System Design Canvas",tag: "CANVAS",   group: "DESIGN",  component: AISystemDesignCanvas },
  { id: "langsmith",     label: "LangSmith Lab",       tag: "OBSERVE",  group: "OPS",     component: LangSmithTracingLab },
  { id: "reasoning",     label: "Reasoning Models Lab",    tag: "REASON",   group: "DESIGN",  component: ReasoningModelsLab },
  { id: "multimodal",   label: "Multimodal AI",           tag: "VISION",   group: "DESIGN",  component: MultimodalAI },
  { id: "ctxwindow",    label: "Context Window Eng.",      tag: "CTX",      group: "DESIGN",  component: ContextWindowEngineering },
  { id: "promptlab",    label: "Prompt Engineering Lab",  tag: "PROMPT",   group: "DESIGN",  component: PromptEngineeringLab },
  { id: "redteam",      label: "AI Red Teaming",          tag: "SECURITY", group: "OPS",     component: AIRedTeaming },
  { id: "deploy",       label: "Deployment Architecture", tag: "INFRA",    group: "OPS",     component: AIDeploymentArchitecture },
  { id: "txarch",       label: "Transformer Architecture",tag: "VISUAL",   group: "DESIGN",  component: TransformerArchitecture },
  { id: "structout",    label: "Structured Outputs",      tag: "SCHEMA",   group: "DESIGN",  component: StructuredOutputEngineering },
  { id: "synthdata",    label: "Synthetic Data",          tag: "DATA",     group: "DESIGN",  component: SyntheticDataGeneration },
  { id: "vibecoding",  label: "Vibe Coding & Agentic Dev", tag: "DEV",   group: "DESIGN",  component: VibeCodingAndAgenticDev },
  { id: "buildthis",    label: "Build This",              tag: "BUILD",    group: "BUILD",   component: BuildThis },
  { id: "kvcache",    label: "KV Cache Engineering",    tag: "CACHE",    group: "BUILD",  component: KVCacheEngineering },
  { id: "guardrails", label: "AI Guardrails",           tag: "GUARD",    group: "OPS",    component: AIGuardrailsEngineering },
  { id: "trapslab",   label: "Traps Lab",               tag: "TRAP",     group: "OPS",    component: TrapsLab },
  { id: "moe",          label: "MoE Architecture",        tag: "MOE",      group: "DESIGN",  component: MoEArchitecture },
  { id: "specdecoding", label: "Speculative Decoding",    tag: "SPEED",    group: "BUILD",   component: SpeculativeDecoding },
  { id: "streaming",    label: "Streaming Patterns",      tag: "STREAM",   group: "BUILD",   component: StreamingPatterns },
  { id: "constrained", label: "Constrained Generation", tag: "SCHEMA",   group: "BUILD",   component: ConstrainedGeneration },
  { id: "modelmerging", label: "Model Merging", tag: "MERGE", group: "DESIGN", component: ModelMerging },
  { id: "flashattn", label: "Flash Attention", tag: "ATTN", group: "OPS", component: FlashAttention },
  { id: "quantization", label: "Quantization Engineering", tag: "QUANT", group: "OPS", component: QuantizationEngineering },
  { id: "serving", label: "Serving Infrastructure", tag: "INFRA", group: "OPS", component: ServingInfra },
  { id: "promptcaching", label: "Cache Architecture & Warmup", tag: "ARCH", group: "OPS", component: PromptCaching },
  { id: "finetuning", label: "Fine-Tuning Workflows", tag: "TRAIN", group: "BUILD", component: FineTuningWorkflows },
  { id: "rlhf", label: "RLHF / DPO / PPO", tag: "ALIGN", group: "BUILD", component: RLHFAlignment },
  { id: "grpo", label: "GRPO / Agent RL", tag: "ALIGN", group: "BUILD", component: GRPOAgentRL },
  { id: "multimodal2", label: "Multimodal Systems", tag: "VISION", group: "DESIGN", component: MultimodalSystems },
  { id: "agentarch", label: "Agent Architecture", tag: "AGENT", group: "BUILD", component: AgentArchitecture },
  { id: "evalmetrics", label: "Eval Metrics", tag: "METRIC", group: "DESIGN", component: EvalMetrics },
];

const SYSTEMS_GROUPS = [
  { id: "DESIGN", label: "DESIGN", color: "#6366f1" },
  { id: "BUILD",  label: "BUILD",  color: "#3b82f6" },
  { id: "OPS",    label: "OPS",    color: "#22c55e" },
];

const RELATED_GT = {
  evals:        [{ id: "llm-evaluation-guide", title: "The LLM Evaluation Guide" }, { id: "iv-eval-system", title: "Design an Eval System" }],
  evalfw:       [{ id: "llm-evaluation-guide", title: "The LLM Evaluation Guide" }],
  evalmetrics:  [{ id: "llm-evaluation-guide", title: "The LLM Evaluation Guide" }, { id: "fine-tuning-evaluation", title: "Fine-Tuning Evaluation" }],
  strategy:     [{ id: "model-strategy", title: "Model Strategy" }, { id: "model-routing", title: "Model Routing" }],
  costlatency:  [{ id: "cost-latency-tradeoffs", title: "Cost vs Latency Trade-offs" }, { id: "llm-cost-optimization", title: "LLM Cost Optimization" }],
  finetune:     [{ id: "full-vs-peft-vs-prompting", title: "Full FT vs PEFT vs Prompting" }, { id: "lora-in-practice", title: "LoRA in Practice" }],
  caching:      [{ id: "prompt-caching-guide", title: "Prompt Caching Guide" }],
  router:       [{ id: "model-routing", title: "Model Routing" }],
  incidents:    [{ id: "incident-room", title: "Incident Room Patterns" }],
  observability:[{ id: "llm-observability", title: "LLM Observability" }],
  abtesting:    [{ id: "ab-testing-llms", title: "A/B Testing LLMs" }, { id: "shadow-ab-testing", title: "Shadow A/B Testing" }],
  mlcicd:       [{ id: "ml-cicd", title: "ML CI/CD" }],
  debug_traces: [{ id: "tracing-agent-loops", title: "Tracing Agent Loops" }],
  compaction:   [{ id: "context-compaction", title: "Context Compaction" }],
  txarch:       [{ id: "what-is-a-transformer", title: "What Is a Transformer?" }, { id: "self-attention-deep-dive", title: "Self-Attention Deep-Dive" }],
  structout:    [{ id: "structured-outputs", title: "Structured Outputs" }],
  kvcache:      [{ id: "inference-optimisation", title: "Inference Optimisation" }],
  guardrails:   [{ id: "guardrails-for-llms", title: "Guardrails for LLMs" }],
  moe:          [{ id: "moe-architecture-guide", title: "MoE Architecture Guide" }, { id: "mixtral-mixture-of-experts", title: "Mixtral: Mixture of Experts" }],
  specdecoding: [{ id: "inference-optimisation", title: "Inference Optimisation" }],
  streaming:    [{ id: "cost-latency-tradeoffs", title: "Cost vs Latency Trade-offs" }],
  rlhf:         [{ id: "rlhf-dpo-explained", title: "RLHF & DPO Explained" }, { id: "rlhf-production", title: "RLHF in Production" }],
  grpo:         [{ id: "rlhf-dpo-explained", title: "RLHF and DPO Explained" }, { id: "dpo-vs-ppo", title: "DPO vs PPO" }],
  multimodal:   [{ id: "multimodal-llms-architecture", title: "Multimodal LLMs Architecture" }],
  multimodal2:  [{ id: "multimodal-in-production", title: "Multimodal in Production" }],
  agentarch:    [{ id: "react-reasoning-acting", title: "ReAct: Reasoning + Acting" }, { id: "building-reliable-agents", title: "Building Reliable Agents" }],
  flashattn:    [{ id: "self-attention-deep-dive", title: "Self-Attention Deep-Dive" }, { id: "flash-attention", title: "Flash Attention (Paper)" }],
  quantization: [{ id: "ft-quantization", title: "Quantization Deep-Dive" }],
  serving:      [{ id: "inference-optimisation", title: "Inference Optimisation" }],
  promptcaching:[{ id: "prompt-caching-guide", title: "Prompt Caching Guide" }],
  finetuning:   [{ id: "finetune-playbook", title: "Fine-Tuning Playbook" }, { id: "full-vs-peft-vs-prompting", title: "Full FT vs PEFT vs Prompting" }, { id: "lora-in-practice", title: "LoRA in Practice" }],
  modelmerging: [{ id: "model-merging-guide", title: "Model Merging Guide" }],
  constrained:  [{ id: "structured-outputs", title: "Structured Outputs" }],
  ctxwindow:    [{ id: "context-window-guide", title: "Context Window Guide" }],
  promptlab:    [{ id: "chain-of-thought-prompting", title: "Chain-of-Thought Prompting" }],
  redteam:      [{ id: "red-teaming-llms", title: "Red Teaming LLMs" }, { id: "prompt-injection-production", title: "Prompt Injection in Production" }],
  deploy:       [{ id: "llmops-production-checklist", title: "LLMOps Production Checklist" }],
  reasoning:    [{ id: "reason-prod-patterns", title: "Reasoning in Production" }, { id: "reason-what-changed", title: "What Changed with Reasoning Models" }],
  canvas:       [{ id: "ai-system-design-framework", title: "AI System Design Framework" }],
  langsmith:    [{ id: "llm-observability", title: "LLM Observability" }],
  trapslab:    [{ id: "eval-gaming", title: "Eval Gaming" }, { id: "confidence-calibration", title: "Confidence Calibration" }],
  shouldai:    [{ id: "ai-or-not", title: "AI or Not?" }, { id: "benchmark-vs-business", title: "Benchmark vs Business Metric" }],
  synthdata:   [{ id: "instruction-tuning-datasets", title: "Instruction Tuning Datasets" }],
  vibecoding:  [{ id: "persp-karpathy", title: "Karpathy on Software 2.0" }],
  indiascale:  [{ id: "llm-cost-optimization", title: "LLM Cost Optimization" }, { id: "cost-latency-tradeoffs", title: "Cost vs Latency Trade-offs" }],
  inference:   [{ id: "inference-optimisation", title: "Inference Optimisation" }],
  buildthis:   [{ id: "ai-system-design-framework", title: "AI System Design Framework" }],
};

export default function SystemsApp({ initialModule, onModuleVisit, onNavigate }) {
  const [activeModule, setActiveModule] = useState(initialModule || "evals");
  const [search, setSearch] = useState("");
  const [done, setDone] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("gsl-systems-done") || "[]")); }
    catch { return new Set(); }
  });
  useEffect(() => { if (initialModule) setActiveModule(initialModule); }, [initialModule]);
  function switchModule(id) { setActiveModule(id); if (onModuleVisit) onModuleVisit("systems", id); }
  function toggleDone(id) {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("gsl-systems-done", JSON.stringify([...next])); } catch {}
      return next;
    });
  }
  const ActiveComponent = SYSTEMS_MODULES.find(m => m.id === activeModule)?.component || EvalsLab;
  const total = SYSTEMS_MODULES.length;
  const doneCount = done.size;
  const searchLower = search.toLowerCase();
  const filterModules = (modules) => search
    ? modules.filter(m =>
        m.label.toLowerCase().includes(searchLower) ||
        m.tag.toLowerCase().includes(searchLower) ||
        m.id.toLowerCase().includes(searchLower)
      )
    : modules;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Systems Lab</h1>
        <p className="text-sm text-zinc-400">Production AI systems thinking — evals, strategy, and architecture decisions</p>
        {doneCount > 0 && (
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-32 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
            </div>
            <span className="text-xs text-zinc-500">{doneCount}/{total} done</span>
          </div>
        )}
      </div>

      {/* Module search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search modules…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Module switcher — grouped */}
      <div className="space-y-2">
        {search && SYSTEMS_GROUPS.every(grp => filterModules(SYSTEMS_MODULES.filter(m => m.group === grp.id)).length === 0) && (
          <div className="text-center text-sm text-zinc-600 py-4">No modules match "{search}"</div>
        )}
        {SYSTEMS_GROUPS.map(grp => {
          const groupModules = filterModules(SYSTEMS_MODULES.filter(m => m.group === grp.id));
          if (groupModules.length === 0) return null;
          return (
          <div key={grp.id} className="flex items-start gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-1 rounded mt-0.5 shrink-0" style={{ color: grp.color + "cc", background: grp.color + "18" }}>{grp.label}</span>
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-nowrap">
                {groupModules.map(m => (
                  <button
                    key={m.id}
                    onClick={() => switchModule(m.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${activeModule === m.id ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
                  >
                    {done.has(m.id) && <span className="text-green-400 text-[10px]">✓</span>}
                    <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${activeModule === m.id ? "bg-zinc-200 text-zinc-800" : "bg-zinc-700 text-zinc-400"}`}>{m.tag}</span>
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent" />
            </div>
          </div>
          );
        })}
      </div>

      <ActiveComponent />

      {/* Related GT reading */}
      {RELATED_GT[activeModule]?.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">📖 Related reading in Ground Truth</div>
          <div className="flex flex-wrap gap-2">
            {RELATED_GT[activeModule].map(post => (
              <button
                key={post.id}
                onClick={() => onNavigate && onNavigate({ tab: "groundtruth", postId: post.id })}
                className="text-xs text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2.5 py-1 rounded-lg font-medium hover:bg-indigo-900/40 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {post.title} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mark as done */}
      <div className="flex justify-end pt-2 border-t border-zinc-800">
        <button
          onClick={() => toggleDone(activeModule)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${done.has(activeModule) ? "bg-green-900/40 text-green-400 hover:bg-red-900/30 hover:text-red-400" : "bg-zinc-800 text-zinc-400 hover:bg-green-900/40 hover:text-green-400"}`}
        >
          {done.has(activeModule) ? "✓ Done — click to unmark" : "Mark as done"}
        </button>
      </div>
    </div>
  );
}
