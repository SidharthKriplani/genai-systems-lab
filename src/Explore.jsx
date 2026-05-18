import { useState, useEffect, useRef } from "react";
import HowTo from "./HowTo";

// ─── EMBEDDING SPACE EXPLORER ─────────────────────────────────────────────────

// Pre-computed 2D positions simulating UMAP projection
const EMBEDDING_POINTS = [
  // RAG cluster
  { id: "e1",  label: "What is RAG?",              x: 120, y: 80,  topic: "RAG",           color: "#6366f1" },
  { id: "e2",  label: "Retrieval pipeline",         x: 145, y: 105, topic: "RAG",           color: "#6366f1" },
  { id: "e3",  label: "Vector database indexing",   x: 100, y: 115, topic: "RAG",           color: "#6366f1" },
  { id: "e4",  label: "Chunking strategies",        x: 130, y: 140, topic: "RAG",           color: "#6366f1" },
  { id: "e5",  label: "Context window limits",      x: 160, y: 125, topic: "RAG",           color: "#6366f1" },
  // Agents cluster
  { id: "e6",  label: "Agent reasoning loop",       x: 310, y: 70,  topic: "Agents",        color: "#22c55e" },
  { id: "e7",  label: "Tool calling patterns",      x: 340, y: 95,  topic: "Agents",        color: "#22c55e" },
  { id: "e8",  label: "Agent memory types",         x: 300, y: 115, topic: "Agents",        color: "#22c55e" },
  { id: "e9",  label: "Multi-agent coordination",   x: 330, y: 135, topic: "Agents",        color: "#22c55e" },
  // Architecture cluster
  { id: "e10", label: "Transformer attention",      x: 230, y: 200, topic: "Architecture",  color: "#f59e0b" },
  { id: "e11", label: "Self-attention mechanism",   x: 260, y: 215, topic: "Architecture",  color: "#f59e0b" },
  { id: "e12", label: "Feed-forward layers",        x: 215, y: 230, topic: "Architecture",  color: "#f59e0b" },
  { id: "e13", label: "Positional encoding",        x: 250, y: 240, topic: "Architecture",  color: "#f59e0b" },
  // Safety cluster
  { id: "e14", label: "Prompt injection attacks",   x: 420, y: 170, topic: "Safety",        color: "#ef4444" },
  { id: "e15", label: "Output guardrail design",    x: 450, y: 150, topic: "Safety",        color: "#ef4444" },
  { id: "e16", label: "Jailbreak techniques",       x: 440, y: 195, topic: "Safety",        color: "#ef4444" },
  { id: "e17", label: "PII detection in outputs",   x: 415, y: 210, topic: "Safety",        color: "#ef4444" },
  // Ops cluster
  { id: "e18", label: "Hallucination rate metrics", x: 80,  y: 220, topic: "Ops",           color: "#3b82f6" },
  { id: "e19", label: "Latency P95 monitoring",     x: 55,  y: 200, topic: "Ops",           color: "#3b82f6" },
  { id: "e20", label: "Cost per query tracking",    x: 70,  y: 245, topic: "Ops",           color: "#3b82f6" },
  { id: "e21", label: "Model observability",        x: 100, y: 235, topic: "Ops",           color: "#3b82f6" },
];

const QUERIES = [
  { text: "How does retrieval work in RAG?",       nearTopics: ["RAG"],          notNear: ["Safety", "Ops"] },
  { text: "How do agents decide what to do next?", nearTopics: ["Agents"],       notNear: ["Architecture", "Ops"] },
  { text: "How does attention work?",              nearTopics: ["Architecture"], notNear: ["Safety", "RAG"] },
  { text: "How do I prevent jailbreaks?",          nearTopics: ["Safety"],       notNear: ["Architecture", "Agents"] },
  { text: "How do I monitor my LLM in production?",nearTopics: ["Ops"],          notNear: ["Architecture", "Agents"] },
];

function EmbeddingExplorer() {
  const [activeQuery, setActiveQuery] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const relevance = (point) => {
    if (!activeQuery) return 0.5;
    const near = activeQuery.nearTopics.includes(point.topic) ? 1 : 0;
    const far = activeQuery.notNear.includes(point.topic) ? 0 : 0.3;
    return near || far;
  };

  return (
    <div className="space-y-4">
      <HowTo
        objective="Understand why semantic search works — similar concepts cluster together in embedding space, so a query finds nearby chunks."
        steps={[
          "Click a query below to simulate a vector search",
          "Watch which points 'light up' — those are the semantically nearest chunks",
          "Notice that near ≠ same exact words — the model understands meaning, not just keywords",
          "Hover any point to see its label",
        ]}
      />
      <div className="flex flex-wrap gap-2">
        {QUERIES.map((q, i) => (
          <button key={i} onClick={() => setActiveQuery(activeQuery === q ? null : q)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeQuery === q ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700"}`}>
            {q.text}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative">
        {/* Legend */}
        <div className="absolute top-3 right-3 space-y-1 z-10">
          {[...new Set(EMBEDDING_POINTS.map(p => p.topic))].map(topic => {
            const color = EMBEDDING_POINTS.find(p => p.topic === topic).color;
            return (
              <div key={topic} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-zinc-500 font-mono">{topic}</span>
              </div>
            );
          })}
        </div>

        <svg viewBox="0 0 520 300" className="w-full" style={{ height: 300 }}>
          {/* Grid */}
          {[100,200,300,400].map(x => <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="#27272a" strokeWidth="0.5"/>)}
          {[75,150,225].map(y => <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#27272a" strokeWidth="0.5"/>)}

          {/* Cluster halos when query active */}
          {activeQuery && [...new Set(EMBEDDING_POINTS.filter(p => activeQuery.nearTopics.includes(p.topic)).map(p => p.topic))].map(topic => {
            const pts = EMBEDDING_POINTS.filter(p => p.topic === topic);
            const cx = pts.reduce((s,p) => s+p.x, 0)/pts.length;
            const cy = pts.reduce((s,p) => s+p.y, 0)/pts.length;
            const color = pts[0].color;
            return <circle key={topic} cx={cx} cy={cy} r="48" fill={color} fillOpacity="0.06" stroke={color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4,4"/>;
          })}

          {/* Connection lines from "query" to nearest points */}
          {activeQuery && EMBEDDING_POINTS.filter(p => activeQuery.nearTopics.includes(p.topic)).map(p => (
            <line key={p.id} x1="260" y1="285" x2={p.x} y2={p.y} stroke={p.color} strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3,3"/>
          ))}

          {/* Points */}
          {EMBEDDING_POINTS.map(p => {
            const rel = relevance(p);
            const r = activeQuery ? (rel > 0.5 ? 7 : 4) : 6;
            const opacity = activeQuery ? (rel > 0.5 ? 1 : 0.25) : 0.8;
            return (
              <g key={p.id} onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r={r + 4} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={r} fill={p.color} fillOpacity={opacity}
                  style={{ transition: "r 0.3s, fill-opacity 0.3s" }}
                  stroke={hoveredPoint?.id === p.id ? "white" : p.color}
                  strokeWidth={hoveredPoint?.id === p.id ? 1.5 : 0.5} strokeOpacity="0.6" />
              </g>
            );
          })}

          {/* Query node */}
          {activeQuery && (
            <>
              <circle cx="260" cy="285" r="8" fill="#ffffff" fillOpacity="0.9"/>
              <text x="260" y="289" textAnchor="middle" fill="#09090b" fontSize="9" fontWeight="bold">Q</text>
            </>
          )}

          {/* Hover tooltip */}
          {hoveredPoint && (
            <g>
              <rect x={Math.min(hoveredPoint.x + 10, 350)} y={hoveredPoint.y - 20} width="140" height="24" rx="4" fill="#18181b" stroke={hoveredPoint.color} strokeWidth="1" strokeOpacity="0.6"/>
              <text x={Math.min(hoveredPoint.x + 80, 420)} y={hoveredPoint.y - 4} textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace">{hoveredPoint.label}</text>
            </g>
          )}

          {/* Axis labels */}
          <text x="10"  y="295" fill="#52525b" fontSize="8" fontFamily="monospace">← different topics</text>
          <text x="390" y="295" fill="#52525b" fontSize="8" fontFamily="monospace">similar topics →</text>
        </svg>
      </div>
      {activeQuery ? (
        <p className="text-xs text-zinc-400 text-center">
          Query: <span className="text-white italic">"{activeQuery.text}"</span> — nearest cluster: <span style={{ color: EMBEDDING_POINTS.find(p => activeQuery.nearTopics.includes(p.topic))?.color }}>{activeQuery.nearTopics.join(", ")}</span>
        </p>
      ) : (
        <p className="text-xs text-zinc-600 text-center">Click a query above to run a simulated vector search</p>
      )}
    </div>
  );
}

// ─── SHADOW MODE SIMULATOR ────────────────────────────────────────────────────

const SHADOW_SCENARIOS = [
  {
    id: "tone",
    label: "Tone Change",
    input: "I ordered something 3 weeks ago and it still hasn't arrived. What's going on?",
    variantA: { label: "Variant A — Formal", prompt: "You are a professional customer service assistant. Be formal and precise." },
    variantB: { label: "Variant B — Empathetic", prompt: "You are a warm, empathetic customer service assistant. Acknowledge feelings first." },
    outputA: "Your order status: In transit. Estimated delivery: 2–3 business days. If the package does not arrive by [date], please submit a missing package claim via your account portal. Reference order #[ORDER_ID] when contacting support.",
    outputB: "I'm really sorry to hear your order hasn't arrived yet — that's frustrating, especially after three weeks! Let me help sort this out. It looks like your package is still in transit, and it should arrive within the next 2–3 business days. If it still doesn't show up after that, I'll make sure we get it resolved for you right away.",
    verdict: "B wins on CSAT, A wins on precision. For policy answers, A reduces ambiguity. For complaints, B increases satisfaction. This is why A/B testing matters — 'better' depends on the metric.",
    metrics: { csat_a: 3.2, csat_b: 4.6, hallucination_a: 0.02, hallucination_b: 0.05, latency_a: 820, latency_b: 1050 },
  },
  {
    id: "grounding",
    label: "Grounding Prompt",
    input: "What's the refund policy for electronics?",
    variantA: { label: "Variant A — No grounding", prompt: "You are a helpful assistant. Answer questions about our store." },
    variantB: { label: "Variant B — Grounded", prompt: "You are a helpful assistant. Answer only from the provided context. If unsure, say so. Context: [Electronics: 14-day return, must be unopened. Accessories: 30-day return.]" },
    outputA: "Our refund policy for electronics typically allows returns within 30 days of purchase, provided the item is in its original condition. Some exclusions may apply for opened software or personalized items.",
    outputB: "For electronics, our return policy allows returns within 14 days, but the item must be unopened. Accessories have a longer 30-day return window. If your situation doesn't fit these cases, I'd recommend reaching out to support for a case-by-case review.",
    verdict: "Variant A hallucinated '30 days' — our actual policy is 14. Grounding (Variant B) forces the model to use retrieved context. This is why groundedness score matters.",
    metrics: { csat_a: 3.8, csat_b: 4.1, hallucination_a: 0.41, hallucination_b: 0.03, latency_a: 780, latency_b: 920 },
  },
  {
    id: "cot",
    label: "Chain of Thought",
    input: "Should I use GPT-4 or Claude for a high-volume document classification task?",
    variantA: { label: "Variant A — Direct answer", prompt: "You are an AI advisor. Give direct, concise recommendations." },
    variantB: { label: "Variant B — Chain of thought", prompt: "You are an AI advisor. Think step by step: consider cost, latency, accuracy, and volume before recommending." },
    outputA: "For high-volume document classification, I'd recommend Claude Haiku or GPT-3.5-Turbo — they offer fast inference at lower cost. GPT-4 is overkill for classification tasks.",
    outputB: "Let me think through this: (1) Cost — at high volume, GPT-4 at $30/M tokens vs GPT-3.5 at $0.5/M is a 60× difference; for classification, smaller models usually suffice. (2) Accuracy — classification is a structured task; fine-tuned smaller models can match GPT-4 on narrow domains. (3) Latency — GPT-4 adds ~1-2s per call; at volume this compounds. Recommendation: start with Claude Haiku or GPT-3.5, run evals against GPT-4 baseline, fine-tune if there's a gap. Don't use GPT-4 for classification at volume unless evals prove it's necessary.",
    verdict: "CoT adds latency and tokens but dramatically improves reasoning quality and trust. For high-stakes decisions, the cost is worth it. For simple queries, it's wasteful.",
    metrics: { csat_a: 3.9, csat_b: 4.7, hallucination_a: 0.08, hallucination_b: 0.02, latency_a: 700, latency_b: 1800 },
  },
];

function ShadowMode() {
  const [sIdx, setSIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const sc = SHADOW_SCENARIOS[sIdx];

  const MetricBar = ({ label, a, b, unit, lowerBetter }) => {
    const aWins = lowerBetter ? a < b : a > b;
    const bWins = lowerBetter ? b < a : b > a;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>{label}</span>
          <span className="font-mono">{unit === "%" ? `${(a*100).toFixed(0)}% vs ${(b*100).toFixed(0)}%` : `${a}${unit} vs ${b}${unit}`}</span>
        </div>
        <div className="flex gap-1 h-1.5">
          <div className="flex-1 rounded-l overflow-hidden bg-zinc-800">
            <div className="h-full transition-all duration-500" style={{ width: `${(a/(a+b))*100}%`, backgroundColor: aWins ? "#22c55e" : "#ef4444" }} />
          </div>
          <div className="flex-1 rounded-r overflow-hidden bg-zinc-800">
            <div className="h-full transition-all duration-500 ml-auto" style={{ width: `${(b/(a+b))*100}%`, backgroundColor: bWins ? "#22c55e" : "#ef4444" }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <HowTo
        objective="See exactly how prompt changes affect output quality, tone, and metrics — side by side on the same input."
        steps={[
          "Pick a scenario — each shows two prompt variants tested on the same user input",
          "Read both outputs before revealing the verdict",
          "Check the metrics: CSAT, hallucination rate, latency — all trade off against each other",
          "The key insight: 'better prompt' depends entirely on which metric you optimize for",
        ]}
      />
      <div className="flex gap-2">
        {SHADOW_SCENARIOS.map((s, i) => (
          <button key={s.id} onClick={() => { setSIdx(i); setRevealed(false); }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${i === sIdx ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3">
        <p className="text-xs text-zinc-500 mb-1">User Input (same for both)</p>
        <p className="text-sm text-white italic">"{sc.input}"</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: sc.variantA.label, prompt: sc.variantA.prompt, output: sc.outputA, metrics: { csat: sc.metrics.csat_a, hall: sc.metrics.hallucination_a, lat: sc.metrics.latency_a } },
          { label: sc.variantB.label, prompt: sc.variantB.prompt, output: sc.outputB, metrics: { csat: sc.metrics.csat_b, hall: sc.metrics.hallucination_b, lat: sc.metrics.latency_b } },
        ].map((v, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-3">
            <div>
              <p className="text-xs font-bold text-white mb-1">{v.label}</p>
              <p className="text-xs text-zinc-600 font-mono leading-relaxed">{v.prompt.slice(0, 80)}…</p>
            </div>
            <div className="border-t border-zinc-800 pt-2">
              <p className="text-xs text-zinc-400 leading-relaxed">{v.output}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics comparison */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span className="font-bold text-indigo-400">Variant A</span>
          <span className="text-zinc-600">Metrics</span>
          <span className="font-bold text-purple-400">Variant B</span>
        </div>
        <MetricBar label="CSAT (out of 5)" a={sc.metrics.csat_a} b={sc.metrics.csat_b} unit="" lowerBetter={false} />
        <MetricBar label="Hallucination Rate" a={sc.metrics.hallucination_a} b={sc.metrics.hallucination_b} unit="%" lowerBetter={true} />
        <MetricBar label="Latency" a={sc.metrics.latency_a} b={sc.metrics.latency_b} unit="ms" lowerBetter={true} />
      </div>

      {revealed ? (
        <div className="bg-zinc-900 border border-indigo-800/50 rounded-xl p-4">
          <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Verdict</p>
          <p className="text-sm text-zinc-300 leading-relaxed">{sc.verdict}</p>
        </div>
      ) : (
        <button onClick={() => setRevealed(true)}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
          Reveal Verdict →
        </button>
      )}
    </div>
  );
}

// ─── LATENCY BUDGET PLANNER ───────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { id: "classify", label: "Intent Classifier",    defaultMs: 50,  min: 10,  max: 200,  color: "#6366f1", note: "Fast lightweight model — keep under 100ms" },
  { id: "embed",    label: "Query Embedding",       defaultMs: 80,  min: 20,  max: 300,  color: "#8b5cf6", note: "Embedding API call — can batch if needed" },
  { id: "retrieve", label: "Vector Retrieval (ANN)",defaultMs: 120, min: 30,  max: 500,  color: "#3b82f6", note: "ANN search — scales with index size and k" },
  { id: "rerank",   label: "Reranker",              defaultMs: 200, min: 0,   max: 800,  color: "#06b6d4", note: "Optional — skip for latency-sensitive paths" },
  { id: "llm",      label: "LLM (TTFT)",            defaultMs: 800, min: 200, max: 3000, color: "#f59e0b", note: "Time to first token — streaming helps perceived latency" },
  { id: "stream",   label: "Token Streaming",       defaultMs: 600, min: 100, max: 2000, color: "#f97316", note: "Full response generation after first token" },
  { id: "validate", label: "Output Validation",     defaultMs: 100, min: 0,   max: 400,  color: "#ef4444", note: "Guardrail checks — can run async if non-blocking" },
];

const SLA_PRESETS = {
  "Real-time chat (3s SLA)": 3000,
  "Interactive tool (5s SLA)": 5000,
  "Background job (30s SLA)": 30000,
};

function LatencyPlanner() {
  const [stages, setStages] = useState(PIPELINE_STAGES.map(s => ({ ...s, ms: s.defaultMs })));
  const [sla, setSla] = useState(3000);
  const [customSla, setCustomSla] = useState("");
  const [skipped, setSkipped] = useState(new Set());

  const activeStageBudget = stages.filter(s => !skipped.has(s.id)).reduce((sum, s) => sum + s.ms, 0);
  const overhead = Math.round(activeStageBudget * 0.15);
  const total = activeStageBudget + overhead;
  const utilPct = Math.min(100, Math.round((total / sla) * 100));
  const overBudget = total > sla;
  const budgetColor = overBudget ? "#ef4444" : utilPct > 85 ? "#f59e0b" : "#22c55e";

  function update(id, val) {
    setStages(ss => ss.map(s => s.id === id ? { ...s, ms: +val } : s));
  }
  function toggleSkip(id) {
    setSkipped(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <div className="space-y-4">
      <HowTo
        objective="Every ms has to be allocated across your pipeline. Build the habit of thinking in latency budgets before you pick models and tools."
        steps={[
          "Set your SLA target first (what latency does your product promise?)",
          "Adjust each stage's budget using the sliders",
          "Skip optional stages (like reranker) to see how much headroom it buys",
          "15% overhead is reserved for network, serialization, and surprises — it's non-negotiable",
        ]}
      />
      {/* SLA selector */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-400">SLA Target</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(SLA_PRESETS).map(([label, val]) => (
            <button key={label} onClick={() => { setSla(val); setCustomSla(""); }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${sla === val ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
          <input type="number" placeholder="Custom ms" value={customSla}
            onChange={e => { setCustomSla(e.target.value); if (e.target.value) setSla(+e.target.value); }}
            className="px-3 py-1.5 rounded text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 w-28 focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      {/* Budget gauge */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-500">Total Pipeline</p>
            <p className="text-2xl font-black" style={{ color: budgetColor }}>{total.toLocaleString()}ms</p>
            <p className="text-xs text-zinc-600">of {sla.toLocaleString()}ms SLA ({overBudget ? `+${(total-sla).toLocaleString()}ms OVER` : `${(sla-total).toLocaleString()}ms remaining`})</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black" style={{ color: budgetColor }}>{utilPct}%</p>
            <p className="text-xs text-zinc-600">utilization</p>
          </div>
        </div>
        {/* Stacked bar */}
        <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex">
          {stages.filter(s => !skipped.has(s.id)).map(s => (
            <div key={s.id} title={`${s.label}: ${s.ms}ms`}
              style={{ width: `${(s.ms/sla)*100}%`, backgroundColor: s.color, minWidth: 2 }} />
          ))}
          <div style={{ width: `${(overhead/sla)*100}%`, backgroundColor: "#52525b", minWidth: 2 }} title={`Overhead: ${overhead}ms`} />
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <div className="w-2 h-2 rounded-sm bg-zinc-600" />
          <span>+{overhead}ms overhead (15% reserved — network, serialization)</span>
        </div>
      </div>

      {/* Stage sliders */}
      <div className="space-y-2">
        {stages.map(s => (
          <div key={s.id} className={`bg-zinc-900 border rounded-xl p-3 transition-all ${skipped.has(s.id) ? "border-zinc-800 opacity-50" : "border-zinc-800"}`}>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => toggleSkip(s.id)}
                className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${!skipped.has(s.id) ? "bg-green-600 border-green-600" : "border-zinc-600"}`}>
                {!skipped.has(s.id) && <span className="text-white text-xs leading-none">✓</span>}
              </button>
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-white flex-1">{s.label}</span>
              <span className="text-xs font-mono" style={{ color: s.color }}>{s.ms}ms</span>
            </div>
            {!skipped.has(s.id) && (
              <>
                <input type="range" min={s.min} max={s.max} value={s.ms}
                  onChange={e => update(s.id, e.target.value)}
                  className="w-full h-1 rounded cursor-pointer" style={{ accentColor: s.color }} />
                <p className="text-xs text-zinc-600 mt-1">{s.note}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOKENIZER EXPLORER ───────────────────────────────────────────────────────

// Simulated tokenization (approximate BPE behavior)
function simulateTokenize(text, model) {
  if (!text.trim()) return [];
  const rules = {
    gpt4: { splitOn: /(\s+|[.,!?;:'"()\[\]{}]|(?=[A-Z]))/g, subword: true },
    claude: { splitOn: /(\s+|[.,!?;:'"()\[\]{}-])/g, subword: true },
    llama: { splitOn: /(\s+|[.,!?;:'"()\[\]{}])/g, subword: false },
  };
  const colors = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#ec4899","#14b8a6","#f97316","#8b5cf6","#84cc16"];
  const parts = text.split(/(\s+|(?=[^a-zA-Z0-9])|(?<=[^a-zA-Z0-9]))/g).filter(Boolean);
  let colorIdx = 0;
  const tokens = [];
  for (const part of parts) {
    if (!part.trim() && part.length > 0) {
      tokens.push({ text: "▁" + part.replace(/ /g, "·"), raw: part, color: colors[colorIdx % colors.length], special: true });
    } else if (model !== "llama" && part.length > 6 && /^[a-z]+$/.test(part)) {
      const mid = Math.floor(part.length * 0.6);
      tokens.push({ text: part.slice(0, mid), raw: part.slice(0, mid), color: colors[colorIdx % colors.length] });
      colorIdx++;
      tokens.push({ text: part.slice(mid), raw: part.slice(mid), color: colors[colorIdx % colors.length] });
    } else {
      tokens.push({ text: part, raw: part, color: colors[colorIdx % colors.length] });
    }
    colorIdx++;
  }
  return tokens.filter(t => t.text);
}

const TOKEN_EXAMPLES = [
  { label: "Simple sentence", text: "The quick brown fox jumps." },
  { label: "Technical terms", text: "Transformer attention mechanism with multi-head self-attention." },
  { label: "Code snippet",    text: "def tokenize(text: str) -> list[str]:" },
  { label: "Numbers + math",  text: "The model has 7,000,000,000 parameters. 1+1=2." },
  { label: "Edge case",       text: "ChatGPT isn't the only LLM. GPT-4o, Claude-3.5, Llama-3.1..." },
];

function TokenizerExplorer() {
  const [text, setText] = useState(TOKEN_EXAMPLES[0].text);
  const [model, setModel] = useState("gpt4");
  const tokens = simulateTokenize(text, model);

  return (
    <div className="space-y-4">
      <HowTo
        objective="Understand how text becomes tokens — and why tokenization matters for cost, context limits, and edge case failures."
        steps={[
          "Type or pick example text — see it split into tokens in real time",
          "Switch between model families to see how tokenization differs",
          "Notice: spaces become special '▁' tokens, long words get subword-split",
          "Token count = what you're billed for. Longer tokens = cheaper than short ones",
        ]}
      />
      <div className="flex gap-2">
        {[["gpt4","GPT-4"],["claude","Claude"],["llama","Llama"]].map(([id, label]) => (
          <button key={id} onClick={() => setModel(id)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${model === id ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {TOKEN_EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => setText(ex.text)}
            className="px-2.5 py-1 rounded text-xs bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-all">
            {ex.label}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type any text to tokenize..."
        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-300 font-mono resize-none focus:outline-none focus:border-indigo-500"
        rows={3}
      />
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Tokens</p>
          <div className="flex gap-4 text-xs">
            <span className="text-zinc-400">Count: <span className="text-white font-bold">{tokens.length}</span></span>
            <span className="text-zinc-400">~Cost: <span className="text-white font-bold">${((tokens.length / 1000) * 0.03).toFixed(4)}</span>/1K calls @ $0.03/1K</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t, i) => (
            <span key={i} className={`px-2 py-0.5 rounded text-xs font-mono border ${t.special ? "opacity-50" : ""}`}
              style={{ borderColor: t.color + "60", backgroundColor: t.color + "15", color: t.color }}>
              {t.text}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Chars", value: text.length },
          { label: "Words", value: text.split(/\s+/).filter(Boolean).length },
          { label: "Tokens", value: tokens.length },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="text-xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-zinc-900 border border-amber-800/30 rounded-xl p-4 space-y-2">
        <p className="text-xs text-amber-400 uppercase tracking-widest">Why tokenization matters</p>
        <div className="text-xs text-zinc-400 space-y-1">
          <p>• Non-English text uses ~2–3× more tokens per word than English (less common in training data)</p>
          <p>• Code and special characters often tokenize inefficiently — every bracket may be its own token</p>
          <p>• Context window limits are in tokens, not characters — a 128K token window ≈ ~96K English words</p>
          <p>• Prompt injection attacks sometimes exploit tokenization boundaries to hide instructions</p>
        </div>
      </div>
    </div>
  );
}

// ─── MODEL CARD READER ────────────────────────────────────────────────────────

const MODEL_CARDS = [
  {
    id: "mc1",
    name: "ExampleLM-7B",
    card: {
      "Model Type": "Causal Language Model, 7B parameters",
      "Training Data": "CommonCrawl, Wikipedia, GitHub code, books. Data cutoff: Q1 2024.",
      "Training Procedure": "Pre-trained on 2T tokens, instruction-tuned via SFT on 500K examples.",
      "Evaluation": "MMLU: 72.4%, HumanEval: 48.2%, HellaSwag: 81.1%",
      "Languages": "English primary. Limited multilingual capability.",
      "Limitations": "May hallucinate. Not suitable for medical or legal advice.",
      "Bias & Fairness": "Not evaluated.",
      "Carbon Footprint": "Not reported.",
      "License": "Apache 2.0",
      "Contact": "ml-team@example.com",
    },
    redFlags: [
      { field: "Bias & Fairness", issue: "Critical gap", explanation: "'Not evaluated' is a red flag for any customer-facing deployment. You don't know who the model performs poorly for." },
      { field: "Carbon Footprint", issue: "Missing", explanation: "Not a blocker, but signals incomplete disclosure. Some enterprise procurement requires this." },
      { field: "Evaluation", issue: "Benchmark-only", explanation: "MMLU and HumanEval measure narrow capabilities. No task-specific eval, no safety eval, no adversarial robustness testing reported." },
      { field: "Training Data", issue: "Vague sourcing", explanation: "'CommonCrawl' is not a specific dataset. What filtering was applied? What's the data quality? Unknown contamination risk for test sets." },
    ],
    greenFlags: [
      { field: "License", note: "Apache 2.0 is permissive — you can use commercially with attribution." },
      { field: "Languages", note: "Honest about multilingual limitations. Better than claiming multilingual without evidence." },
    ],
  },
  {
    id: "mc2",
    name: "MedAssist-13B",
    card: {
      "Model Type": "Fine-tuned LLM for medical Q&A, 13B parameters",
      "Training Data": "PubMed abstracts, clinical notes (de-identified), medical textbooks.",
      "Training Procedure": "Base: Llama-2-13B. Fine-tuned on 2M medical Q&A pairs.",
      "Evaluation": "MedQA: 74.1%, PubMedQA: 81.3%, Internal eval: 89% accuracy.",
      "Intended Use": "Decision support for medical professionals. NOT for direct patient use.",
      "Out-of-Scope": "Patient-facing chatbots, autonomous diagnosis, treatment decisions.",
      "Bias & Fairness": "Demographic performance parity not evaluated across patient subgroups.",
      "Safety Testing": "Red-teamed for medication dosage errors. 3% failure rate on ambiguous queries.",
      "Regulatory": "Not FDA cleared. Not a medical device.",
      "License": "Non-commercial research only.",
    },
    redFlags: [
      { field: "Bias & Fairness", issue: "Critical for medical", explanation: "Medical AI without demographic parity evaluation is a patient safety issue. Models trained on biased clinical data can underperform for minority populations." },
      { field: "Safety Testing", issue: "3% failure on ambiguous queries", explanation: "For a medical system, 3% failure on ambiguous queries is high. At scale, this is a significant number of potentially dangerous outputs." },
      { field: "Evaluation", issue: "Internal eval unverified", explanation: "'Internal eval: 89% accuracy' — on what dataset? By whom? Internal benchmarks without independent verification are not meaningful evidence." },
      { field: "License", issue: "Non-commercial only", explanation: "You cannot use this in a production product. Common gotcha in medical AI — always check license before building on a model." },
    ],
    greenFlags: [
      { field: "Intended Use", note: "Clear scope and out-of-scope — model card explicitly says not for patient-facing use. Responsible disclosure." },
      { field: "Safety Testing", note: "At least some red-teaming was done. More than most model cards include." },
    ],
  },
];

function ModelCardReader() {
  const [cIdx, setCIdx] = useState(0);
  const [found, setFound] = useState(new Set());
  const [revealed, setRevealed] = useState(false);
  const card = MODEL_CARDS[cIdx];

  function toggle(field) {
    if (revealed) return;
    setFound(s => { const n = new Set(s); n.has(field) ? n.delete(field) : n.add(field); return n; });
  }
  function reset(i) { setCIdx(i); setFound(new Set()); setRevealed(false); }

  const redFlagFields = card.redFlags.map(r => r.field);
  const foundFlags = [...found].filter(f => redFlagFields.includes(f)).length;

  return (
    <div className="space-y-4">
      <HowTo
        objective="Learn to read model cards critically — identify what's missing, what's suspicious, and what would block production deployment."
        steps={[
          "Read each field of the model card carefully",
          "Click any field you think is a red flag or missing something important",
          "When done, reveal the expert analysis",
          "Goal: spot the gaps before you build a product on a model that can't support it",
        ]}
      />
      <div className="flex gap-2">
        {MODEL_CARDS.map((c, i) => (
          <button key={c.id} onClick={() => reset(i)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${i === cIdx ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-zinc-500 mb-3">Model Card: <span className="text-white font-bold">{card.name}</span></p>
        <div className="space-y-2">
          {Object.entries(card.card).map(([field, value]) => {
            const isRed = redFlagFields.includes(field);
            const picked = found.has(field);
            let cls = "border-zinc-800 bg-zinc-950 hover:border-zinc-600";
            if (revealed && isRed) cls = "border-red-700 bg-red-900/10";
            else if (revealed && !isRed) cls = "border-green-800/50 bg-green-900/5";
            else if (picked) cls = "border-amber-500 bg-amber-900/10";
            return (
              <div key={field} onClick={() => toggle(field)}
                className={`border rounded-xl px-3 py-2 cursor-pointer transition-all ${cls}`}>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-zinc-400 shrink-0 w-36">{field}</span>
                  <span className="text-xs text-zinc-300 flex-1">{value}</span>
                  {revealed && isRed && <span className="text-xs text-red-400 shrink-0">⚠ flag</span>}
                  {revealed && !isRed && card.greenFlags.find(g => g.field === field) && <span className="text-xs text-green-400 shrink-0">✓ good</span>}
                  {!revealed && picked && <span className="text-xs text-amber-400 shrink-0">flagged</span>}
                </div>
                {revealed && isRed && (
                  <div className="mt-2 ml-36 text-xs text-red-300 leading-relaxed">
                    <span className="text-red-500 font-bold">{card.redFlags.find(r => r.field === field)?.issue}: </span>
                    {card.redFlags.find(r => r.field === field)?.explanation}
                  </div>
                )}
                {revealed && card.greenFlags.find(g => g.field === field) && (
                  <div className="mt-1 ml-36 text-xs text-green-400">{card.greenFlags.find(g => g.field === field)?.note}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!revealed ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">{found.size} fields flagged</p>
          <button onClick={() => setRevealed(true)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm">
            Reveal Expert Analysis →
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Score</p>
          <p className="text-sm text-zinc-300">You caught <span className="text-white font-bold">{foundFlags}</span> of <span className="text-white font-bold">{card.redFlags.length}</span> red flags.</p>
          <p className="text-xs text-zinc-500 mt-1">
            {foundFlags === card.redFlags.length ? "Excellent — you'd catch these issues before building on this model." :
             foundFlags >= 2 ? "Good instincts — review the ones you missed above." :
             "Study the flagged fields above — these are common deployment blockers that teams miss."}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── VECTOR DB COMPARISON ────────────────────────────────────────────────────

const VECTOR_DBS = [
  { id: "pinecone",  name: "Pinecone",   type: "Managed SaaS",       latency_ms: 5,  cost_1m: 0.096, max_scale: "Billions",  hybrid: true,  sql: false, self_host: false, setup: 1,
    pros: ["Zero ops — fully managed", "Serverless pricing", "Consistent sub-10ms latency"],
    cons: ["Most expensive at scale", "Vendor lock-in", "No SQL joins or relational queries"],
    use_when: "You need production-ready vector search today and don't want to manage infrastructure." },
  { id: "qdrant",    name: "Qdrant",     type: "Self-host / Cloud",  latency_ms: 8,  cost_1m: 0.07,  max_scale: "Billions",  hybrid: true,  sql: false, self_host: true,  setup: 2,
    pros: ["Best hybrid search (dense + sparse BM42)", "Rust-based — fast and memory-efficient", "Flexible payload filtering"],
    cons: ["Requires infra management if self-hosted", "Smaller community than Pinecone", "Complex payload indexing setup"],
    use_when: "You need hybrid dense+sparse search or want cost control with the option to self-host." },
  { id: "pgvector",  name: "pgvector",   type: "PostgreSQL Extension", latency_ms: 25, cost_1m: 0.01,  max_scale: "~10M",     hybrid: false, sql: true,  self_host: true,  setup: 2,
    pros: ["Familiar SQL — JOIN with existing tables", "Near-zero added cost if on Postgres", "ACID transactions across vector + relational data"],
    cons: ["Slower at scale (>10M vectors)", "No native hybrid search without extensions", "Requires index tuning (HNSW params)"],
    use_when: "You're already on Postgres and have under 10M vectors. Don't over-engineer for small datasets." },
  { id: "weaviate",  name: "Weaviate",   type: "Self-host / Cloud",  latency_ms: 10, cost_1m: 0.05,  max_scale: "Billions",  hybrid: true,  sql: false, self_host: true,  setup: 4,
    pros: ["Multimodal (text + images + video)", "Built-in BM25 + vector hybrid", "GraphQL API for complex queries"],
    cons: ["Steep learning curve", "Complex setup and configuration", "Over-engineered for text-only use cases"],
    use_when: "You need multimodal search or want GraphQL-style queries over your vector store." },
  { id: "chroma",    name: "Chroma",     type: "Local / Embedded",   latency_ms: 3,  cost_1m: 0,     max_scale: "~1M",      hybrid: false, sql: false, self_host: true,  setup: 1,
    pros: ["pip install chromadb — zero setup", "Python-native API", "Free — no hosted cost"],
    cons: ["Not production-ready (no HA, no replication)", "Limited filtering and querying", "Performance degrades past ~1M vectors"],
    use_when: "You're prototyping or running local evals. Switch to a production DB before you ship." },
];

function VectorDBExplorer() {
  const [sel, setSel] = useState("pinecone");
  const db = VECTOR_DBS.find(d => d.id === sel);
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {VECTOR_DBS.map(d => (
          <button key={d.id} onClick={() => setSel(d.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sel === d.id ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {d.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{db.name}</span>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">{db.type}</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">{db.use_when}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Latency", val: `~${db.latency_ms}ms`, color: db.latency_ms < 10 ? "text-emerald-400" : db.latency_ms < 20 ? "text-amber-400" : "text-red-400" },
              { label: "Cost / 1M reads", val: db.cost_1m === 0 ? "Free" : `$${db.cost_1m}`, color: "text-zinc-300" },
              { label: "Max scale", val: db.max_scale, color: "text-zinc-300" },
              { label: "Setup complexity", val: "●".repeat(db.setup) + "○".repeat(4 - db.setup), color: "text-zinc-400" },
            ].map(m => (
              <div key={m.label} className="bg-zinc-800 rounded p-2 text-xs">
                <div className="text-zinc-500 mb-0.5">{m.label}</div>
                <div className={`font-mono font-bold ${m.color}`}>{m.val}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs flex-wrap">
            <span className={db.hybrid ? "text-emerald-400" : "text-zinc-600"}>{db.hybrid ? "✓" : "✗"} Hybrid search</span>
            <span className={db.sql ? "text-emerald-400" : "text-zinc-600"}>{db.sql ? "✓" : "✗"} SQL support</span>
            <span className={db.self_host ? "text-emerald-400" : "text-zinc-600"}>{db.self_host ? "✓" : "✗"} Self-hostable</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-900 bg-emerald-950/20 p-3 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-2">Pros</div>
            {db.pros.map((p, i) => <div key={i} className="text-xs text-zinc-300 flex gap-2"><span className="text-emerald-500 shrink-0">+</span>{p}</div>)}
          </div>
          <div className="rounded-xl border border-red-900 bg-red-950/20 p-3 space-y-1.5">
            <div className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2">Cons</div>
            {db.cons.map((c, i) => <div key={i} className="text-xs text-zinc-300 flex gap-2"><span className="text-red-500 shrink-0">−</span>{c}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function VectorDBDecisionTool() {
  const [useCase, setUseCase] = useState("production");
  const [vectors, setVectors] = useState(500);
  const [budget, setBudget] = useState("medium");
  const [needsSQL, setNeedsSQL] = useState(false);
  const [needsHybrid, setNeedsHybrid] = useState(false);

  function score(db) {
    let s = 0;
    if (useCase === "prototype" && db.setup === 1) s += 3;
    if (useCase === "production" && !db.self_host) s += 2;
    if (useCase === "production" && db.max_scale === "Billions") s += 1;
    if (vectors > 10000 && db.max_scale === "Billions") s += 2;
    if (vectors <= 1000 && db.id === "pgvector") s += 2;
    if (vectors <= 100 && db.id === "chroma" && useCase === "prototype") s += 2;
    if (budget === "low" && db.cost_1m <= 0.01) s += 3;
    if (budget === "medium" && db.cost_1m <= 0.07) s += 1;
    if (needsSQL && db.sql) s += 3;
    if (needsSQL && !db.sql) s -= 2;
    if (needsHybrid && db.hybrid) s += 3;
    if (needsHybrid && !db.hybrid) s -= 2;
    if (useCase === "prototype" && db.id !== "chroma" && db.id !== "pgvector") s -= 1;
    return s;
  }

  const ranked = [...VECTOR_DBS].map(db => ({ ...db, score: score(db) })).sort((a, b) => b.score - a.score);
  const best = ranked[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Use case</label>
          <div className="flex gap-2">
            {["prototype", "production"].map(u => (
              <button key={u} onClick={() => setUseCase(u)}
                className={`flex-1 py-1.5 rounded text-xs font-bold uppercase transition-all ${useCase === u ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>{u}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Budget priority</label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map(b => (
              <button key={b} onClick={() => setBudget(b)}
                className={`flex-1 py-1.5 rounded text-xs font-bold uppercase transition-all ${budget === b ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>{b}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-zinc-500">Dataset size: {(vectors * 1000).toLocaleString()} vectors</label>
          <input type="range" min="1" max="100000" step="10" value={vectors} onChange={e => setVectors(+e.target.value)} className="w-full" />
        </div>
        <div className="flex gap-6 sm:col-span-2">
          {[{ label: "SQL / joins needed", val: needsSQL, set: setNeedsSQL }, { label: "Hybrid search needed", val: needsHybrid, set: setNeedsHybrid }].map(c => (
            <label key={c.label} className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={c.val} onChange={e => c.set(e.target.checked)} />
              {c.label}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {ranked.map((db, i) => (
          <div key={db.id} className={`rounded-lg border p-3 flex items-center gap-3 transition-all ${i === 0 ? "border-violet-700 bg-violet-950/20" : "border-zinc-800 bg-zinc-900/40"}`}>
            <div className="text-xs font-mono text-zinc-500 w-5 shrink-0">#{i + 1}</div>
            <div className="font-bold text-sm text-white flex-1">{db.name}</div>
            <div className="text-xs text-zinc-500 hidden sm:block">{db.type}</div>
            <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${Math.max(8, (db.score / (ranked[0].score || 1)) * 100)}%` }} />
            </div>
            {i === 0 && <span className="text-xs bg-violet-900 text-violet-300 px-2 py-0.5 rounded font-mono shrink-0">BEST FIT</span>}
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-4">
        <p className="text-xs text-zinc-300 leading-relaxed"><span className="text-violet-300 font-bold">{best.name}</span>: {best.use_when}</p>
      </div>
    </div>
  );
}

function VectorDBComparison() {
  const [tab, setTab] = useState("explore");
  return (
    <div className="space-y-5">
      <HowTo
        objective="Build intuition for vector DB tradeoffs — latency, cost, hybrid search, and ops burden — so you can make the right call in system design."
        steps={[
          "DB Explorer: click each database to see its full profile, pros/cons, and when to use it",
          "Decision Tool: set your use case, scale, and constraints to get a ranked recommendation",
          "Key insight: there's no universally best vector DB — the right choice depends on your constraints",
        ]}
      />
      <div className="flex gap-2">
        {[{ id: "explore", label: "DB Explorer", tag: "COMPARE" }, { id: "decide", label: "Decision Tool", tag: "PICK" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${tab === t.id ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${tab === t.id ? "bg-violet-500 text-violet-100" : "bg-zinc-700 text-zinc-400"}`}>{t.tag}</span>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "explore" && <VectorDBExplorer />}
      {tab === "decide"  && <VectorDBDecisionTool />}
    </div>
  );
}

// ─── EXPLORE APP ──────────────────────────────────────────────────────────────

const EXPLORE_MODULES = [
  { id: "embeddings", label: "Embedding Space",    tag: "VISUALIZE", component: EmbeddingExplorer },
  { id: "shadow",     label: "Shadow Mode A/B",    tag: "COMPARE",   component: ShadowMode },
  { id: "latency",    label: "Latency Planner",    tag: "BUDGET",    component: LatencyPlanner },
  { id: "tokenizer",  label: "Tokenizer Explorer", tag: "TOKENS",    component: TokenizerExplorer },
  { id: "modelcard",  label: "Model Card Reader",  tag: "AUDIT",     component: ModelCardReader },
  { id: "vectordb",   label: "Vector DB Comparison", tag: "DB",      component: VectorDBComparison },
];

export default function ExploreApp() {
  const [activeModule, setActiveModule] = useState("embeddings");
  const ActiveComponent = EXPLORE_MODULES.find(m => m.id === activeModule)?.component || EmbeddingExplorer;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Explore</h1>
        <p className="text-sm text-zinc-400">Visualization, debugging, and auditing tools for AI systems</p>
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {EXPLORE_MODULES.map(m => (
          <button key={m.id} onClick={() => setActiveModule(m.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeModule === m.id ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${activeModule === m.id ? "bg-zinc-200 text-zinc-800" : "bg-zinc-700 text-zinc-400"}`}>{m.tag}</span>
            {m.label}
          </button>
        ))}
      </div>
      <ActiveComponent />
    </div>
  );
}
