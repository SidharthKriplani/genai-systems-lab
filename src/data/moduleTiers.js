// moduleTiers.js — interview-frequency tier for every GSL Foundation module,
// for a SENIOR AI ENGINEER loop. S = always asked, A = shows up often,
// B = the depth that makes you unbreakable (default). Powers tier badges and
// the one-click "Build S/A/B tracks" action. Edit these two lists to re-tier.

export const TIER_S = [
  // Language Models
  "tokenizer", "attention", "transformer", "sampling", "hallucination",
  // Retrieval
  "embeddings", "chunking", "rag-pipeline", "reranking", "dense-vs-sparse-retrieval",
  // Evaluation
  "eval-loop", "rag-eval", "llm-as-judge",
  // Prompt Engineering
  "zero-shot", "few-shot", "chain-of-thought", "prompt-security",
  // Foundation Models
  "rlhf", "dpo", "lora", "finetuning-vs-rag",
  // AI Agents
  "agent-react", "agent-tool-design", "agent-eval-trajectory",
  // Production
  "cost-latency-concepts",
];

export const TIER_A = [
  // Language Models
  "positional-encoding", "rope", "speculative-decoding", "tempgame", "kv-cache",
  // Retrieval
  "context", "query-rewriting", "multi-hop-retrieval", "rag-ingestion-pipeline",
  // Foundation Models
  "pretraining", "instruction-tuning", "model-families", "scaling-laws", "quantization", "moe", "distillation",
  // Prompt Engineering
  "system-prompts", "structured-outputs", "prompt-caching", "multiturn-context", "injection-lab",
  // Vector Infrastructure
  "vector-db-index-mechanics", "hybrid-search-design", "metadata-filtering", "pgvector-vs-managed",
  // AI Agents
  "agent-memory-foundations", "agent-multiagent", "agent-failure-modes", "agent-planning-patterns", "agent-reliability",
  // Evaluation
  "eval-design", "debug", "hallucination-lab", "eval-contamination", "calibration",
  // Production
  "flashattn", "latency-planner", "observability-concepts", "prompt-regression-signals", "quality-drift",
  "cost-attribution", "managed-vs-selfhosted", "streaming-lab", "failure-sim-lab", "model-routing-cascades",
  // Inference Optimization & Serving
  "infra-prefill-decode", "infra-batching-throughput", "infra-paged-attention-kv", "infra-serving-stacks",
  // Model Customization & Fine-Tuning
  "custom-when-to-finetune", "custom-data-curation", "custom-peft-lora-serving", "custom-preference-alignment", "custom-eval-driven-loop",
  // AI Safety & Alignment
  "alignment-techniques", "llm-security-beyond-injection",
];

const _S = new Set(TIER_S);
const _A = new Set(TIER_A);

// Everything not in S or A is B (the unbreakable-depth layer).
export function tierOf(moduleId) {
  return _S.has(moduleId) ? "S" : _A.has(moduleId) ? "A" : "B";
}

export const TIER_STYLE = {
  S: { label: "S", color: "#f59e0b", bg: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.4)" },
  A: { label: "A", color: "#818cf8", bg: "rgba(99,102,241,0.14)", border: "rgba(99,102,241,0.4)" },
  B: { label: "B", color: "#71717a", bg: "rgba(113,113,122,0.14)", border: "rgba(113,113,122,0.35)" },
};
