import { useState } from "react";
import HowTo from "./HowTo";

// ─── DATA ─────────────────────────────────────────────────────────────────────
// Llama 3.1 7B on A10G (24GB VRAM) — realistic numbers
const QUANT_LEVELS = [
  { id: "fp32",  label: "FP32",      bits: 32, memGB: 28.0, tokPerSec: 42,  quality: 100.0, color: "#ef4444", note: "Training precision. Too large for most GPUs. Never used for inference." },
  { id: "fp16",  label: "FP16/BF16", bits: 16, memGB: 14.0, tokPerSec: 95,  quality: 99.5,  color: "#f59e0b", note: "Standard inference default. Good quality, fits on 16GB GPU." },
  { id: "int8",  label: "INT8",      bits: 8,  memGB: 7.0,  tokPerSec: 165, quality: 98.5,  color: "#6366f1", note: "Production sweet spot. 4× memory reduction, <2% quality loss." },
  { id: "int4",  label: "INT4/GGUF", bits: 4,  memGB: 3.5,  tokPerSec: 260, quality: 95.0,  color: "#10b981", note: "On-device/consumer GPU. 5% quality loss shows on reasoning tasks." },
];

const BATCH_DATA = [1, 2, 4, 8, 16, 32, 64].map(bs => ({
  bs,
  latencyMs: Math.round(180 + bs * 14 + bs * bs * 0.28),
  throughput: Math.round((bs * 1000) / (180 + bs * 14 + bs * bs * 0.28)),
}));

const KV_SCENARIOS = [
  { label: "Single turn chat",          tokens: 512,   hitRate: 0,  note: "No cache — full prefill on every request." },
  { label: "Multi-turn (5 turns)",      tokens: 2048,  hitRate: 78, note: "Prior turns cached — only new tokens require compute." },
  { label: "Shared system prompt",      tokens: 8192,  hitRate: 88, note: "System prompt + docs cached across all users." },
  { label: "Long doc Q&A (RAG)",        tokens: 32768, hitRate: 94, note: "Document cached once, follow-up queries hit cache." },
  { label: "128K context (long book)",  tokens: 131072, hitRate: 97, note: "Almost entire context from cache — huge compute saving." },
];

// ─── QUANTIZATION LAB ─────────────────────────────────────────────────────────
function QuantizationLab() {
  const [selected, setSelected] = useState("int8");
  const baseline = QUANT_LEVELS[1]; // FP16 as baseline

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500">Comparing quantization levels for Llama 3.1 7B on a single A10G GPU (24GB VRAM). Click a row to inspect.</p>

      <div className="space-y-2">
        {QUANT_LEVELS.map(q => {
          const on = selected === q.id;
          const memSaving = ((baseline.memGB - q.memGB) / baseline.memGB * 100).toFixed(0);
          const speedGain = ((q.tokPerSec / baseline.tokPerSec - 1) * 100).toFixed(0);
          const fitsA10G  = q.memGB <= 24;
          return (
            <div key={q.id} onClick={() => setSelected(q.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${on ? "border-violet-600 bg-violet-950/20" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}>
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-base font-bold font-mono" style={{ color: q.color }}>{q.label}</span>
                  <span className="text-xs font-mono text-zinc-600">{q.bits}-bit</span>
                  {q.id === "fp16" && <span className="text-xs text-violet-400 font-mono">default</span>}
                  {q.id === "int8" && <span className="text-xs text-emerald-400 font-mono">★ recommended</span>}
                </div>
                <div className="flex gap-5 shrink-0 text-right">
                  <div>
                    <div className="text-sm font-bold font-mono text-white">{q.memGB}GB</div>
                    <div className="text-xs text-zinc-600">VRAM</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold font-mono" style={{ color: q.color }}>{q.tokPerSec}</div>
                    <div className="text-xs text-zinc-600">tok/s</div>
                  </div>
                  <div>
                    <div className={`text-sm font-bold font-mono ${q.quality >= 99 ? "text-emerald-400" : q.quality >= 97 ? "text-amber-400" : "text-red-400"}`}>{q.quality}%</div>
                    <div className="text-xs text-zinc-600">quality</div>
                  </div>
                </div>
              </div>
              {/* Bars */}
              <div className="space-y-1 mb-3">
                {[
                  { label: "VRAM",     pct: (q.memGB / QUANT_LEVELS[0].memGB) * 100,        color: "#ef4444" },
                  { label: "Speed",    pct: (q.tokPerSec / QUANT_LEVELS[3].tokPerSec) * 100, color: "#10b981" },
                  { label: "Quality",  pct: q.quality,                                        color: "#6366f1" },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600 w-14">{b.label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color + "aa" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "vs FP16 memory",   value: q.id === "fp16" ? "baseline" : `-${memSaving}%`, good: q.id !== "fp16" },
                  { label: "vs FP16 speed",    value: q.id === "fp16" ? "baseline" : `+${speedGain}%`, good: q.id !== "fp16" },
                  { label: "Fits A10G 24GB?",  value: fitsA10G ? "✓ Yes" : "✗ No",                    good: fitsA10G },
                ].map(s => (
                  <div key={s.label} className="bg-zinc-800/60 rounded p-2 text-center">
                    <div className={`text-xs font-bold font-mono ${s.good ? "text-emerald-400" : "text-red-400"}`}>{s.value}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              {on && <p className="text-xs text-zinc-400 mt-3 leading-relaxed border-t border-zinc-800 pt-3">{q.note}</p>}
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <div className="text-xs font-bold text-violet-400 uppercase mb-2">Production Rule of Thumb</div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          <strong className="text-white">INT8 is the default production choice</strong> — 4× memory reduction from FP32,
          1.7× throughput vs FP16, with only 1.5% quality loss.
          Use INT4 only when hardware is constrained (consumer GPU, on-device).
          Always run your eval suite to measure quality delta before choosing a quantization level.
        </p>
      </div>
    </div>
  );
}

// ─── BATCHING SIMULATOR ───────────────────────────────────────────────────────
function BatchingSimulator() {
  const [bs, setBs] = useState(8);
  const current  = BATCH_DATA.find(d => d.bs === bs);
  const single   = BATCH_DATA[0];
  const maxLat   = Math.max(...BATCH_DATA.map(d => d.latencyMs));
  const maxThrpt = Math.max(...BATCH_DATA.map(d => d.throughput));

  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">Batch size vs latency/throughput tradeoff for synchronous inference on A10G with vLLM. Production-realistic numbers.</p>

      <div className="flex gap-2 flex-wrap">
        {BATCH_DATA.map(d => (
          <button key={d.bs} onClick={() => setBs(d.bs)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${bs === d.bs ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            bs={d.bs}
          </button>
        ))}
      </div>

      {/* All rows */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1 mb-1">
          <div className="text-xs text-red-400 font-mono text-center">Latency (ms) ↑ bad</div>
          <div className="text-xs text-emerald-400 font-mono text-center">Throughput (tok/s) ↑ good</div>
        </div>
        {BATCH_DATA.map(d => (
          <div key={d.bs} onClick={() => setBs(d.bs)}
            className={`bg-zinc-900 border rounded-xl p-3 cursor-pointer transition-all ${bs === d.bs ? "border-violet-600" : "border-zinc-800 hover:border-zinc-700"}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold font-mono text-white w-10">bs={d.bs}</span>
              <span className="text-xs font-mono text-red-400 w-16">{d.latencyMs}ms</span>
              <span className="text-xs font-mono text-emerald-400">{d.throughput} tok/s</span>
            </div>
            <div className="flex gap-1 h-2">
              <div className="flex-1 bg-zinc-800 rounded overflow-hidden">
                <div className="h-full bg-red-500/60 transition-all" style={{ width: `${(d.latencyMs / maxLat) * 100}%` }} />
              </div>
              <div className="flex-1 bg-zinc-800 rounded overflow-hidden">
                <div className="h-full bg-emerald-500/60 transition-all" style={{ width: `${(d.throughput / maxThrpt) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div className="bg-zinc-900 border border-violet-800/50 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-violet-400 uppercase">At Batch Size {bs}</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold font-mono text-red-400">{current.latencyMs}ms</div>
              <div className="text-xs text-zinc-500">P50 latency (+{((current.latencyMs / single.latencyMs - 1)*100).toFixed(0)}% vs bs=1)</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{current.throughput}</div>
              <div className="text-xs text-zinc-500">tok/s (+{((current.throughput / single.throughput - 1)*100).toFixed(0)}% vs bs=1)</div>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3">
            {bs <= 2  ? "bs=1-2: Use for real-time chat. Lowest latency, but GPU underutilized — high cost per token." :
             bs <= 8  ? "bs=4-8: Balanced. Good for mixed real-time + near-real-time workloads. Recommended starting point." :
             bs <= 32 ? "bs=16-32: High throughput. Good for async jobs (batch summaries, digest generation). Too slow for chat." :
                        "bs=64+: Maximum GPU utilization. Only for fully async offline batch processing. P50 latency >1s."}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── KV CACHE EXPLAINER ───────────────────────────────────────────────────────
function KVCacheExplainer() {
  const [ctxK, setCtxK]     = useState(8);   // context length in K tokens
  const [layers, setLayers] = useState(32);
  const [heads, setHeads]   = useState(32);
  const DIM = 128, BPE = 2; // fp16

  const kvBytes = ctxK * 1000 * layers * heads * DIM * 2 * BPE;
  const kvMB    = kvBytes / (1024 * 1024);

  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">KV cache stores Key/Value attention matrices so previously-processed tokens don't need recomputation. It trades VRAM for compute.</p>

      {/* Calculator */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">KV Cache Memory Calculator</div>
        {[
          { label: "Context Length", value: ctxK,   set: setCtxK,   min: 1,  max: 128, step: 1,  unit: "K tokens" },
          { label: "Layers",         value: layers, set: setLayers, min: 8,  max: 80,  step: 8,  unit: "layers"   },
          { label: "Attention Heads",value: heads,  set: setHeads,  min: 8,  max: 64,  step: 8,  unit: "heads"    },
        ].map(sl => (
          <div key={sl.label} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">{sl.label}</span>
              <span className="font-mono text-white">{sl.value} {sl.unit}</span>
            </div>
            <input type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.value}
              onChange={e => sl.set(+e.target.value)} className="w-full accent-violet-500" />
          </div>
        ))}
        <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500">KV cache per sequence</div>
            <div className="text-xs text-zinc-600 mt-0.5 font-mono">ctx × layers × heads × dim × 2 × 2bytes</div>
          </div>
          <span className={`text-xl font-bold font-mono ${kvMB > 5000 ? "text-red-400" : kvMB > 1000 ? "text-amber-400" : "text-emerald-400"}`}>
            {kvMB >= 1024 ? `${(kvMB / 1024).toFixed(2)} GB` : `${kvMB.toFixed(0)} MB`}
          </span>
        </div>
        {kvMB > 20 * 1024 && (
          <p className="text-xs text-red-400">⚠ At this context length, KV cache alone exceeds 20GB — requires multi-GPU or offloading.</p>
        )}
      </div>

      {/* Cache hit scenarios */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Cache Hit Rate by Use Case</div>
        {KV_SCENARIOS.map(sc => (
          <div key={sc.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="text-sm font-bold text-white">{sc.label}</div>
                <p className="text-xs text-zinc-500 mt-0.5">{sc.note}</p>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xl font-bold font-mono ${sc.hitRate >= 80 ? "text-emerald-400" : sc.hitRate > 0 ? "text-amber-400" : "text-zinc-500"}`}>
                  {sc.hitRate}%
                </div>
                <div className="text-xs text-zinc-600">{(sc.tokens / 1000).toFixed(0)}K ctx</div>
              </div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${sc.hitRate}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <div className="text-xs font-bold text-violet-400 uppercase mb-2">Why This Matters in Production</div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          A shared system prompt (retrieved docs + instructions) cached across 10K concurrent users means
          <strong className="text-white"> 88%+ of prefill compute is skipped</strong>. At scale, KV cache prefix sharing
          is one of the biggest levers for reducing inference cost in RAG systems. vLLM's PagedAttention
          and SGLang's radix cache both exploit this pattern.
        </p>
      </div>
    </div>
  );
}

// ─── DECISION FRAMEWORK ───────────────────────────────────────────────────────

const SYMPTOMS = [
  {
    id: "ttft",
    label: "TTFT too high",
    sub: "First token is slow",
    color: "#6366f1",
    bottleneck: "Prefill is compute-bound",
    desc: "Users wait before seeing any output. Prefill is processing all input tokens at once — expensive for long prompts.",
    techniques: [
      { name: "Prompt Caching", impact: "HIGH", gain: "40–80% TTFT reduction", desc: "Skip prefill recompute on shared prefixes — system prompt, retrieved docs, instructions. Biggest TTFT win for RAG pipelines with shared context." },
      { name: "FlashAttention", impact: "HIGH", gain: "2–4× faster prefill", desc: "I/O-aware kernel that reduces HBM data transfer during attention computation. Drop-in replacement — no quality change." },
      { name: "Chunked Prefill", impact: "MED", gain: "Reduces p99 TTFT", desc: "Splits large prompts into smaller chunks to avoid blocking other requests. Prevents head-of-line blocking in high-concurrency systems." },
    ],
  },
  {
    id: "tpot",
    label: "TPOT too high",
    sub: "Output tokens are slow",
    color: "#ef4444",
    bottleneck: "Decode is memory-bandwidth-bound",
    desc: "Streaming starts but each token takes too long. Decode reads model weights from HBM once per token — bandwidth is the bottleneck, not compute.",
    techniques: [
      { name: "Speculative Decoding", impact: "HIGH", gain: "2–3× faster decode", desc: "Small draft model generates 3–12 candidate tokens, large model verifies in one parallel pass. Same quality, dramatically faster decode for structured outputs and summarization." },
      { name: "Weight Quantization", impact: "HIGH", gain: "1.5–4× faster decode", desc: "INT4/INT8 reduces weight data moved from HBM per token. Biggest single lever for decode speed — INT8 at <1.5% quality loss is the production sweet spot." },
      { name: "KV Cache Quantization", impact: "HIGH", gain: "Up to 8× faster at 4-bit", desc: "Compress KV activations to ~3.5 bits (TurboQuant). 6× less cache memory. Biggest gains on H100 at long context." },
      { name: "PagedAttention", impact: "MED", gain: "More concurrent requests", desc: "Allocates KV cache in dynamic pages — eliminates memory waste from fixed-size reservations. Standard in vLLM." },
    ],
  },
  {
    id: "throughput",
    label: "Throughput collapse",
    sub: "GPU idle or OOM at scale",
    color: "#f59e0b",
    bottleneck: "Scheduling-bound",
    desc: "System can't handle concurrent requests — GPU is underutilized or requests are OOM-ing. Static batching leaves GPU idle between requests.",
    techniques: [
      { name: "Continuous Batching", impact: "HIGH", gain: "10–20× throughput", desc: "Evicts finished requests instantly, slots in new ones. Keeps GPU fully utilized at all times. Standard in vLLM, TGI. Single biggest throughput lever." },
      { name: "PagedAttention", impact: "HIGH", gain: "2–4× more concurrency", desc: "Dynamic KV cache paging eliminates wasted GPU memory, enabling far more concurrent sequences without OOM errors." },
      { name: "Mixture of Experts", impact: "HIGH", gain: "Same quality, fraction of compute", desc: "Only a subset of expert layers activates per token. Large model capacity at fraction of per-token compute. Mistral, Grok, GPT-4 use this architecture." },
    ],
  },
];

const IMPACT_COLORS = { HIGH: "#22c55e", MED: "#f59e0b", LOW: "#71717a" };

function DecisionFramework() {
  const [sel, setSel] = useState("ttft");
  const symptom = SYMPTOMS.find(s => s.id === sel);
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-white font-bold">Match your symptom to the technique.</span> TTFT, TPOT, and Throughput have different root causes — and different fixes. Applying the wrong technique wastes engineering time.
        </p>
      </div>

      {/* Symptom selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SYMPTOMS.map(s => (
          <button key={s.id} onClick={() => setSel(s.id)}
            className={`rounded-xl border p-4 text-left transition-all ${sel === s.id ? "" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}
            style={sel === s.id ? { borderColor: s.color, background: s.color + "0f" } : {}}>
            <div className="text-sm font-bold" style={{ color: sel === s.id ? s.color : "#a1a1aa" }}>{s.label}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Bottleneck explanation */}
      <div className="rounded-xl border p-4" style={{ borderColor: symptom.color + "44", background: symptom.color + "08" }}>
        <div className="text-xs font-mono font-bold uppercase mb-1" style={{ color: symptom.color }}>Root cause: {symptom.bottleneck}</div>
        <p className="text-sm text-zinc-300 leading-relaxed">{symptom.desc}</p>
      </div>

      {/* Techniques */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Recommended fixes — sorted by impact</div>
        {symptom.techniques.map((t, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-white">{t.name}</span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded" style={{ color: IMPACT_COLORS[t.impact], background: IMPACT_COLORS[t.impact] + "22" }}>
                {t.impact} IMPACT
              </span>
              <span className="text-xs font-mono ml-auto" style={{ color: symptom.color }}>{t.gain}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick reference */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        <div className="text-xs font-bold text-zinc-400 uppercase mb-3">Quick Reference</div>
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex gap-2"><span className="text-indigo-400 w-28 shrink-0">TTFT too high</span><span className="text-zinc-400">→ Prompt caching (if shared prefix) · FlashAttention · Chunked prefill</span></div>
          <div className="flex gap-2"><span className="text-red-400 w-28 shrink-0">TPOT too high</span><span className="text-zinc-400">→ Speculative decoding · Weight quantization · KV cache quantization</span></div>
          <div className="flex gap-2"><span className="text-amber-400 w-28 shrink-0">Throughput low</span><span className="text-zinc-400">→ Continuous batching (first) · PagedAttention · MoE architecture</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "decision",  label: "Decision Framework" },
  { id: "quant",    label: "Quantization" },
  { id: "batching", label: "Batch Size"   },
  { id: "kvcache",  label: "KV Cache"     },
];

export default function InferenceOptimizer() {
  const [tab, setTab] = useState("quant");
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-800 bg-blue-950/20 p-5">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <span className="text-xs font-mono px-2 py-0.5 bg-blue-900/60 text-blue-300 rounded border border-blue-700">INFERENCE</span>
          <span className="text-xs text-zinc-500">quantization · batching · KV cache</span>
        </div>
        <h2 className="text-xl font-bold text-white">Inference Optimizer</h2>
        <p className="text-sm text-zinc-400 mt-1">Self-hosting LLMs means understanding hardware trade-offs. Quantization, batch size, and KV cache are the three levers that determine cost, latency, and quality at inference time.</p>
      </div>
      <div className="rounded-lg p-3.5 space-y-2" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderLeft: "3px solid rgba(99,102,241,0.4)" }}>
        <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">What you're building intuition for</p>
        <p className="text-xs text-zinc-400 leading-relaxed">Inference optimisation is a multi-variable problem: you're simultaneously managing throughput, latency, cost, and quality. The naive choices — single-request batching, full-precision weights, no KV cache sharing — leave the majority of available performance on the table. The over-engineered choices add operational complexity with no proportional gain.</p>
        <p className="text-xs text-zinc-400 leading-relaxed">Three levers dominate everything else: quantization (how much VRAM your model consumes, and how much quality you sacrifice for it), batch size (the fundamental latency vs. throughput tradeoff — there is no free lunch), and KV cache (where you recover compute cost by reusing shared context across requests).</p>
        <p className="text-xs text-zinc-400 leading-relaxed">Work through each tab in sequence. Use the Quantization Lab with your actual model size before picking a bit-width. Use the Batching Simulator with your actual SLA before setting batch size. The numbers only matter when they're your numbers.</p>
      </div>
      <HowTo
        objective="Understand the three key inference optimization levers: quantization (memory vs quality), batch size (latency vs throughput), and KV cache (compute savings on shared context)."
        steps={[
          "Quantization: compare FP32/FP16/INT8/INT4 — INT8 is the production sweet spot: 4× less VRAM, only 1.5% quality loss",
          "Batch Size: adjust bs and see latency vs throughput tradeoff — bs=1 for real-time chat, bs=32+ for async batch jobs",
          "KV Cache: use the memory calculator, then see how 80-95% cache hit rates on shared system prompts massively cut compute cost",
        ]}
      />
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${tab === t.id ? "bg-blue-700 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "decision" && <DecisionFramework />}
      {tab === "quant"    && <QuantizationLab />}
      {tab === "batching" && <BatchingSimulator />}
      {tab === "kvcache"  && <KVCacheExplainer />}
    </div>
  );
}
