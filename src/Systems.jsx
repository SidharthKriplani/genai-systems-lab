import { useState, useEffect, useMemo, useRef } from "react";
import HowTo from "./HowTo";
import IndiaScaleLab from "./IndiaScale";
import ModelRouterLab from "./ModelRouter";
import InferenceOptimizer from "./InferenceOptimizer";
import MLCiCdLab from "./MLCiCd";

import {
  ABTestingLab, AIDeploymentArchitecture, AIGuardrailsEngineering, AIRedTeaming, AISystemDesignCanvas, AgentArchitecture, BuildThis, ConstrainedGeneration, ContextCompaction, ContextWindowEngineering, CostLatencyLab, DebugTraces, EvalFrameworksLab, EvalMetrics, EvalsLab, FineTuningLab, FineTuningWorkflows, FlashAttention, IncidentRoom, KVCacheEngineering, LLMObservability, LangSmithTracingLab, MoEArchitecture, ModelMerging, ModelStrategyLab, MultimodalAI, MultimodalSystems, PromptCaching, PromptCachingLab, PromptEngineeringLab, QuantizationEngineering, RLHFAlignment, ReasoningModelsLab, ServingInfra, ShouldUseAI, SpeculativeDecoding, StreamingPatterns, StructuredOutputEngineering, SyntheticDataGeneration, TransformerArchitecture, TrapsLab, VibeCodingAndAgenticDev
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
  { id: "promptcaching", label: "Prompt Caching", tag: "CACHE", group: "OPS", component: PromptCaching },
  { id: "finetuning", label: "Fine-Tuning Workflows", tag: "TRAIN", group: "BUILD", component: FineTuningWorkflows },
  { id: "rlhf", label: "RLHF / DPO / PPO", tag: "ALIGN", group: "BUILD", component: RLHFAlignment },
  { id: "multimodal2", label: "Multimodal Systems", tag: "VISION", group: "DESIGN", component: MultimodalSystems },
  { id: "agentarch", label: "Agent Architecture", tag: "AGENT", group: "BUILD", component: AgentArchitecture },
  { id: "evalmetrics", label: "Eval Metrics", tag: "METRIC", group: "DESIGN", component: EvalMetrics },
];

const SYSTEMS_GROUPS = [
  { id: "DESIGN", label: "DESIGN", color: "#6366f1" },
  { id: "BUILD",  label: "BUILD",  color: "#3b82f6" },
  { id: "OPS",    label: "OPS",    color: "#22c55e" },
];

export default function SystemsApp({ initialModule, onModuleVisit }) {
  const [activeModule, setActiveModule] = useState(initialModule || "evals");
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

      {/* Module switcher — grouped */}
      <div className="space-y-2">
        {SYSTEMS_GROUPS.map(grp => (
          <div key={grp.id} className="flex items-start gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-1 rounded mt-0.5 shrink-0" style={{ color: grp.color + "cc", background: grp.color + "18" }}>{grp.label}</span>
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-nowrap">
                {SYSTEMS_MODULES.filter(m => m.group === grp.id).map(m => (
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
        ))}
      </div>

      <ActiveComponent />

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
