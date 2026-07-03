// GSL premium-niche track — Inference Optimization & Serving / On-device LLMs (SKELETON, 2026-07-03)
// RUNNER_DATA fragment. Spread into src/data/foundationsRunnerData.js via ...RUNNER_INFERENCE_OPT.
// Distinct from the existing "production" gym (cost/latency/observability) and "foundation-models"
// gym (conceptual quantization): this track is the SERVING-INTERNALS niche — vLLM/TensorRT,
// batching, and edge/on-device inference. SKELETON HONESTY: spec + "🚧 In development" marker. No MCQs yet.
// Keep the export name RUNNER_INFERENCE_OPT. Additive only.

const DEV = "🚧 In development — outline below. This module is a specced scaffold, not finished teaching content yet. The scenario and numbered outline show exactly what it will cover once authored.";

export const RUNNER_INFERENCE_OPT = {
  "infra-prefill-decode": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " Your LLM serving bill is exploding and latency is inconsistent. Before optimizing anything, you need to explain how autoregressive inference actually runs — the prefill vs decode split — because it dictates every optimization that follows.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Two distinct phases: PREFILL (process the whole prompt in parallel — compute-bound) and DECODE (generate one token at a time — memory-bandwidth-bound). They have opposite bottlenecks.",
      "2. Time-to-first-token (TTFT, dominated by prefill) vs inter-token latency / TPOT (dominated by decode) — the two numbers every serving SLA is written in.",
      "3. Why decode is memory-bound: each token reloads the whole model + KV cache from HBM; arithmetic intensity is low, so you're waiting on memory, not FLOPs.",
      "4. The KV cache as the central object: what it stores, how it grows with sequence length, and why it's the #1 memory constraint in serving.",
      "5. How this framing drives everything downstream: batching, PagedAttention, quantization, and speculative decoding all attack prefill or decode specifically.",
      { type: "illustration", label: "Planned prefill vs decode contrast (to be built)", content:
`Phase     Parallelism        Bottleneck        Governs
Prefill   whole prompt       compute (FLOPs)   TTFT
Decode    1 token at a time  memory bandwidth  inter-token latency
  -> optimize the RIGHT phase: batching helps decode throughput;
     prefill chunking / caching helps TTFT.` },
      "6. Interview canon: 'explain prefill vs decode', 'why is decode memory-bound', 'what is TTFT vs TPOT', 'what limits serving throughput'.",
    ],
    takeaway: "SKELETON: LLM inference splits into compute-bound prefill (sets TTFT) and memory-bandwidth-bound decode (sets inter-token latency). Knowing which phase you're optimizing is the foundation of all serving work. Full content + interactive coming.",
  },

  "infra-batching-throughput": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " Your GPU sits at 15% utilization but requests still queue. You're serving one request at a time. You need continuous batching to raise throughput without wrecking per-request latency — explain how it works and its tradeoffs.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Why single-request serving wastes the GPU: the model is loaded once but processes one sequence — huge idle memory bandwidth.",
      "2. Static batching and its flaw: fast requests wait for the slowest in the batch to finish (head-of-line blocking).",
      "3. Continuous / in-flight batching (the vLLM/TGI default): tokens from many requests are batched per decode step; finished sequences drop out and new ones join mid-flight — the key throughput unlock.",
      "4. The throughput-vs-latency dial: bigger batches raise throughput but can hurt tail latency; how to tune for an SLA.",
      "5. Chunked prefill + priority scheduling: interleaving prefill and decode so a long prompt doesn't stall everyone.",
      { type: "illustration", label: "Planned static vs continuous batching (to be built)", content:
`Static batching:     [A A A A][B B  . . ]   B's slot idles until batch ends
Continuous batching: step t: A B C D
                     step t+1: A _ C D E   (B finished, E joined mid-flight)
  -> GPU stays saturated; requests join/leave every decode step.` },
      "6. Interview canon: 'what is continuous batching', 'why does it beat static', 'how do you trade throughput for latency', 'how does vLLM schedule requests'.",
    ],
    takeaway: "SKELETON: Continuous (in-flight) batching packs many requests into each decode step and swaps sequences in/out mid-flight — the core throughput unlock in vLLM/TGI — traded against tail latency. Full content + interactive coming.",
  },

  "infra-paged-attention-kv": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " You can only fit a handful of concurrent requests before OOM, even though average sequences are short. The KV cache is fragmenting your GPU memory. Explain PagedAttention and how it fixes KV-cache waste.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. The KV-cache memory problem: pre-allocating for max sequence length wastes memory (internal fragmentation); dynamic growth fragments it (external fragmentation).",
      "2. PagedAttention: treat KV cache like OS virtual memory — non-contiguous fixed-size blocks (pages) with a block table, so memory is allocated on demand and near-zero waste.",
      "3. The payoff: far more concurrent sequences per GPU → higher throughput; plus prefix/block sharing (copy-on-write) for common prompts and beam search.",
      "4. KV-cache quantization (int8/fp8) and eviction as complementary levers when memory is still tight.",
      "5. How this connects to batching: PagedAttention is WHAT MAKES continuous batching memory-efficient at scale.",
      { type: "illustration", label: "Planned KV paging illustration (to be built)", content:
`Naive: [req A reserves MAX seq len]......(mostly empty, wasted)
Paged: KV split into fixed blocks; a block table maps logical->physical
       shared prefix blocks reused across requests (copy-on-write)
  -> allocate only what's used; pack many more requests per GPU.` },
      "6. Interview canon: 'what is PagedAttention', 'why does KV cache waste memory', 'how do you serve more concurrent requests', 'how does prefix sharing work'.",
    ],
    takeaway: "SKELETON: PagedAttention manages the KV cache in non-contiguous fixed-size blocks (OS-style paging), eliminating fragmentation, enabling prefix sharing, and packing many more requests per GPU. Full content + interactive coming.",
  },

  "infra-serving-stacks": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " You must self-host a Llama-class model at production scale. Do you use vLLM, TensorRT-LLM, or Triton? The interviewer wants you to defend a serving stack on throughput, latency, hardware, and operational cost.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. The serving-stack landscape: vLLM (PagedAttention + continuous batching, easy), TensorRT-LLM (NVIDIA-optimized kernels, lowest latency, more work), Triton Inference Server (multi-model serving/orchestration), SGLang, TGI.",
      "2. Kernel-level optimizations: FlashAttention, fused kernels, CUDA graphs, and why TensorRT squeezes latency the others can't.",
      "3. Parallelism for big models: tensor parallelism (split within a layer) vs pipeline parallelism (split across layers) vs expert parallelism (MoE), and when each is needed.",
      "4. Precision: fp16/bf16 vs fp8 vs int4 weight-only, and the accuracy/throughput tradeoff at serving time.",
      "5. The build-vs-buy decision axis: managed API vs self-hosted stack — cost at scale, data control, and team capability (links to the existing Production track).",
      { type: "illustration", label: "Planned serving-stack comparison (to be built)", content:
`Stack           Strength                     Cost to operate
vLLM            throughput, easy setup       low
TensorRT-LLM    lowest latency (NVIDIA)      high (build/tune)
Triton          multi-model orchestration    medium
  -> pick on: latency SLA, hardware, model size (parallelism), team.` },
      "6. Interview canon: 'vLLM vs TensorRT-LLM', 'tensor vs pipeline parallelism', 'how do you serve a 70B model', 'when self-host vs API'.",
    ],
    takeaway: "SKELETON: Serving stacks trade ease (vLLM) vs peak latency (TensorRT-LLM) vs orchestration (Triton); big models add tensor/pipeline/expert parallelism and precision choices. Stack selection is an SLA + hardware + team decision. Full content + interactive coming.",
  },

  "infra-edge-ondevice": {
    depthTier: "deep",
    interviewWeight: "medium",
    scenario: DEV + " Product wants an LLM running fully ON-DEVICE — a phone or laptop, no server — for privacy and offline use. You have ~8GB of RAM and no datacenter GPU. Explain how on-device / edge LLM inference is even possible.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Why the cloud recipe doesn't transport: no datacenter GPU, tight RAM/thermal/battery budgets, and a memory-bandwidth wall on consumer hardware.",
      "2. Aggressive quantization for edge: int4/int3 weight quantization (GGUF/llama.cpp, GPTQ/AWQ), and the quality cliff you must respect.",
      "3. Runtimes + hardware: llama.cpp/GGUF, MLX (Apple Silicon), ONNX Runtime, and using the NPU/GPU/unified memory on-device.",
      "4. Model selection for edge: small capable models (1–8B), distillation, and matching model size to the RAM/latency budget.",
      "5. The hybrid pattern: on-device for private/offline/cheap, escalate to cloud for hard queries — routing between them.",
      { type: "illustration", label: "Planned on-device budget sketch (to be built)", content:
`8GB device, 7B model:
  fp16 weights   ~14GB  -> won't fit
  int8 weights   ~7GB   -> tight, little headroom
  int4 weights   ~3.5GB -> fits with room for KV cache + app
  -> edge inference is a quantization + small-model + runtime problem.` },
      "6. Interview canon: 'how do you run an LLM on a phone', 'why int4 for edge', 'what is GGUF/llama.cpp', 'when on-device vs cloud'.",
    ],
    takeaway: "SKELETON: On-device LLMs are a quantization (int4) + small/distilled model + edge-runtime (llama.cpp/MLX/ONNX) problem, often paired with cloud escalation for hard queries. Full content + interactive budget tool coming.",
  },
};
