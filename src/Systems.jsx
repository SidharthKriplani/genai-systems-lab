import { useState, useEffect, useMemo, useRef } from "react";
import HowTo from "./HowTo";
import IndiaScaleLab from "./IndiaScale";
import ModelRouterLab from "./ModelRouter";
import InferenceOptimizer from "./InferenceOptimizer";
import MLCiCdLab from "./MLCiCd";

import {
  ABTestingLab, AgentMemoryArchitecture, AIDeploymentArchitecture, AIGuardrailsEngineering, AIRedTeaming, AISystemDesignCanvas, AgentArchitecture, BuildThis, ConstrainedGeneration, ContextCompaction, ContextWindowEngineering, CostLatencyLab, DebugTraces, EvalFrameworksLab, EvalMetrics, EvalsLab, FineTuningLab, FineTuningWorkflows, FlashAttention, GRPOAgentRL, IncidentRoom, KVCacheEngineering, LLMObservability, LangSmithTracingLab, LongContextPatterns, MoEArchitecture, ModelMerging, ModelStrategyLab, MultimodalAI, MultimodalSystems, PromptCaching, PromptCachingLab, PromptEngineeringLab, PromptInjectionDefense, QuantizationEngineering, VectorDBEngineering, RLHFAlignment, ReasoningModelsLab, ServingInfra, ShouldUseAI, SpeculativeDecoding, StreamingPatterns, StructuredOutputEngineering, SyntheticDataGeneration, TransformerArchitecture, TrapsLab, VibeCodingAndAgenticDev
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
  { id: "agentmemory", label: "Agent Memory Architecture", tag: "MEMORY", group: "BUILD", component: AgentMemoryArchitecture },
  { id: "longctx", label: "Long Context Patterns", tag: "CONTEXT", group: "BUILD", component: LongContextPatterns },
  { id: "evalmetrics", label: "Eval Metrics", tag: "METRIC", group: "DESIGN", component: EvalMetrics },
  { id: "promptinjection", label: "Prompt Injection Defense", tag: "SECURITY", group: "OPS", component: PromptInjectionDefense },
  { id: "vectordb", label: "Vector DB Engineering", tag: "INFRA", group: "BUILD", component: VectorDBEngineering },
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
  const [activeGroup, setActiveGroup] = useState(null); // null = all groups
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
  const activeIdx = SYSTEMS_MODULES.findIndex(m => m.id === activeModule);
  const nextModule = SYSTEMS_MODULES[activeIdx + 1] || null;
  const searchLower = search.toLowerCase();
  const filterModules = (modules) => {
    let result = activeGroup ? modules.filter(m => m.group === activeGroup) : modules;
    if (search) result = result.filter(m =>
      m.label.toLowerCase().includes(searchLower) ||
      m.tag.toLowerCase().includes(searchLower) ||
      m.id.toLowerCase().includes(searchLower)
    );
    return result;
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)]">

      {/* ── LEFT PANEL: module list ────────────────────────────────── */}
      <div className="w-full lg:w-52 lg:shrink-0 lg:border-r lg:border-zinc-800 lg:overflow-y-auto lg:sticky lg:top-0 lg:h-[calc(100vh-56px)]">
        <div className="px-3 pt-5 pb-2 space-y-3">
          {/* Title + progress */}
          <div>
            <h1 className="text-base font-black text-white tracking-tight">Systems Lab</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">Production AI systems thinking</p>
            {doneCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0">{doneCount}/{total}</span>
              </div>
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 text-[10px]">✕</button>
            )}
          </div>
        </div>

        {/* Group filter pills */}
        <div className="px-3 pb-2 flex gap-1 flex-wrap">
          <button
            onClick={() => setActiveGroup(null)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${!activeGroup ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
          >All</button>
          {SYSTEMS_GROUPS.map(grp => (
            <button
              key={grp.id}
              onClick={() => setActiveGroup(activeGroup === grp.id ? null : grp.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide transition-all`}
              style={{
                background: activeGroup === grp.id ? grp.color + "30" : "transparent",
                color: activeGroup === grp.id ? grp.color : "#52525b",
                border: activeGroup === grp.id ? `1px solid ${grp.color}50` : "1px solid transparent",
              }}
            >{grp.label}</button>
          ))}
        </div>

        {/* Module list — grouped */}
        <div className="px-2 pb-4 space-y-1">
          {search && SYSTEMS_GROUPS.every(grp => filterModules(SYSTEMS_MODULES.filter(m => m.group === grp.id)).length === 0) && (
            <div className="text-center text-xs text-zinc-600 py-4">No match for "{search}"</div>
          )}
          {SYSTEMS_GROUPS.map(grp => {
            const groupModules = filterModules(SYSTEMS_MODULES.filter(m => m.group === grp.id));
            if (groupModules.length === 0) return null;
            if (activeGroup && grp.id !== activeGroup) return null;
            return (
              <div key={grp.id}>
                <div className="text-[9px] font-bold uppercase tracking-widest px-2 pt-2 pb-0.5" style={{ color: grp.color + "99" }}>{grp.label}</div>
                {groupModules.map(m => (
                  <button
                    key={m.id}
                    onClick={() => switchModule(m.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${activeModule === m.id ? "bg-zinc-800 text-white font-semibold" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"}`}
                  >
                    {done.has(m.id) ? <span className="text-green-400 text-[10px] shrink-0">✓</span> : <span className="w-3 shrink-0" />}
                    <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL: active module content ────────────────────── */}
      <div className="flex-1 min-w-0 px-4 lg:px-8 py-6 space-y-6 max-w-2xl lg:max-w-3xl">

        {/* Start-here callout — new users only */}
        {doneCount === 0 && (
          <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">New here?</span>
              <span className="text-sm text-zinc-300 ml-2">Start with <span className="font-bold text-white">Evals Lab</span> — production evaluation is the skill every other module depends on.</span>
            </div>
            <button onClick={() => switchModule("evals")} className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-900/40 text-blue-300 text-xs font-bold hover:bg-blue-900/60 transition-all whitespace-nowrap">Start →</button>
          </div>
        )}

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

        {/* Done state + next step */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            onClick={() => toggleDone(activeModule)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${done.has(activeModule) ? "bg-green-900/40 text-green-400 hover:bg-red-900/30 hover:text-red-400" : "bg-zinc-800 text-zinc-400 hover:bg-green-900/40 hover:text-green-400"}`}
          >
            {done.has(activeModule) ? "✓ Done — click to unmark" : "Mark as done"}
          </button>
          {done.has(activeModule) && nextModule && (
            <button onClick={() => switchModule(nextModule.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-900/40 text-violet-300 text-xs font-bold hover:bg-violet-900/60 transition-all">
              Next: {nextModule.label} →
            </button>
          )}
          {done.has(activeModule) && !nextModule && (
            <span className="text-xs text-green-400 font-semibold">All modules done</span>
          )}
        </div>
      </div>

    </div>
  );
}
