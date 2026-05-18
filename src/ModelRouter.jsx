import { useState, useMemo } from "react";
import HowTo from "./HowTo";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const QUERIES = [
  { id: 1,  text: "What are your business hours?",                               tier: "rule",     category: "FAQ",          complexity: 1, reason: "Deterministic — rule engine returns static answer. Zero LLM cost." },
  { id: 2,  text: "Reset my password please",                                    tier: "rule",     category: "Action",       complexity: 1, reason: "Clear intent, deterministic action — trigger workflow, not LLM." },
  { id: 3,  text: "What is 15% GST on ₹4,200?",                                 tier: "rule",     category: "Math",         complexity: 1, reason: "Pure arithmetic — rule engine computes in 0ms at zero cost." },
  { id: 4,  text: "Where is my refund?",                                         tier: "mini",     category: "Support",      complexity: 3, reason: "Simple lookup intent — mini model handles well at <$0.001/query." },
  { id: 5,  text: "Summarise my last 5 transactions",                            tier: "mini",     category: "Finance",      complexity: 4, reason: "Structured data + short output — mini model quality is sufficient." },
  { id: 6,  text: "मेरे खाते में पैसे क्यों नहीं आए?",                          tier: "indic",    category: "Hindi",        complexity: 3, reason: "Hindi query — Indic model gives 3× cheaper tokenization + better cultural context." },
  { id: 7,  text: "தமிழில் என் கணக்கு விவரங்கள் காட்டுங்கள்",                   tier: "indic",    category: "Tamil",        complexity: 3, reason: "Tamil script — Sarvam AI or Indic model required for quality + cost." },
  { id: 8,  text: "Compare UPI vs NEFT vs RTGS for bulk payroll processing",     tier: "frontier", category: "Technical",    complexity: 8, reason: "Nuanced multi-entity comparison — requires domain knowledge and structured reasoning." },
  { id: 9,  text: "Write a Python function to validate IFSC codes with edge cases", tier: "frontier", category: "Code",     complexity: 7, reason: "Code generation requires precision — mini models miss edge cases in validation logic." },
  { id: 10, text: "Design a fraud detection system for 50M concurrent users",    tier: "frontier", category: "Architecture", complexity: 9, reason: "Open-ended system design — deep reasoning, no single correct answer, adversarial." },
];

const TIERS = [
  { id: "rule",     label: "Rule Engine",    costPer1M: 0,    latencyMs: 2,   quality: 95, color: "#10b981", bgCls: "bg-emerald-950/30 border-emerald-800/50" },
  { id: "mini",     label: "Mini Model",     costPer1M: 0.15, latencyMs: 220, quality: 82, color: "#6366f1", bgCls: "bg-indigo-950/30 border-indigo-800/50"   },
  { id: "indic",    label: "Indic Model",    costPer1M: 0.08, latencyMs: 150, quality: 88, color: "#f59e0b", bgCls: "bg-amber-950/30 border-amber-800/50"     },
  { id: "frontier", label: "Frontier Model", costPer1M: 2.50, latencyMs: 780, quality: 97, color: "#ef4444", bgCls: "bg-red-950/30 border-red-800/50"         },
];

// ─── TAB 1: QUERY CLASSIFIER ──────────────────────────────────────────────────
function QueryClassifier() {
  const [selected, setSelected] = useState(0);
  const q    = QUERIES[selected];
  const tier = TIERS.find(t => t.id === q.tier);

  return (
    <div className="space-y-5">
      <div className="text-xs text-zinc-500">Select a query below — see which model tier it routes to and why.</div>

      <div className="space-y-1.5">
        {QUERIES.map((qx, i) => (
          <button key={qx.id} onClick={() => setSelected(i)}
            className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${selected === i ? "border-violet-600 bg-violet-950/30 text-white" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white"}`}>
            <span className="font-mono text-zinc-600 mr-2 text-xs">[{qx.category}]</span>
            {qx.text}
          </button>
        ))}
      </div>

      {tier && (
        <div className={`rounded-xl border p-5 space-y-4 ${tier.bgCls}`}>
          <div>
            <div className="text-xs font-mono text-zinc-500 uppercase mb-1">Routing Decision</div>
            <div className="text-xl font-bold" style={{ color: tier.color }}>→ {tier.label}</div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{q.reason}</p>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
            {[
              { label: "Cost / 1M",  value: tier.costPer1M === 0 ? "Free" : `$${tier.costPer1M}` },
              { label: "P50 Latency", value: `${tier.latencyMs}ms` },
              { label: "Quality",    value: `${tier.quality}%` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold font-mono text-white">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 2: ROUTER CONFIG ─────────────────────────────────────────────────────
function RouterConfig() {
  const [threshold, setThreshold]     = useState(5);
  const [indicOn, setIndicOn]         = useState(true);
  const [rulesOn, setRulesOn]         = useState(true);

  const dist = useMemo(() => {
    let counts = { rule: 0, mini: 0, indic: 0, frontier: 0 };
    QUERIES.forEach(q => {
      if (rulesOn && q.tier === "rule")          counts.rule++;
      else if (indicOn && q.tier === "indic")    counts.indic++;
      else if (q.complexity <= threshold)        counts.mini++;
      else                                       counts.frontier++;
    });
    return TIERS.map(t => ({ tier: t, count: counts[t.id], pct: (counts[t.id] / QUERIES.length) * 100 }));
  }, [threshold, indicOn, rulesOn]);

  const avgCost      = dist.reduce((acc, d) => acc + (d.pct / 100) * d.tier.costPer1M, 0);
  const savingPct    = ((TIERS[3].costPer1M - avgCost) / TIERS[3].costPer1M * 100);

  return (
    <div className="space-y-6">
      {/* Sliders */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-400 uppercase">Complexity Threshold</span>
          <span className="text-xs font-mono text-white">≤ {threshold} → Mini Model</span>
        </div>
        <input type="range" min={1} max={9} value={threshold} onChange={e => setThreshold(+e.target.value)} className="w-full accent-violet-500" />
        <div className="flex justify-between text-xs text-zinc-600 font-mono">
          <span>1 (FAQs only)</span><span>5 (balanced)</span><span>9 (all mini)</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-3">
        {[
          { label: "Rule Engine Layer",      state: indicOn, set: setIndicOn, desc: "Deterministic queries answered without any LLM" },
          { label: "Indic Language Routing", state: rulesOn, set: setRulesOn, desc: "Hindi/Tamil/Telugu detected → routed to Indic model" },
        ].map(tog => (
          <div key={tog.label} onClick={() => tog.set(v => !v)}
            className={`flex-1 rounded-xl border p-3 cursor-pointer transition-all ${tog.state ? "border-violet-700 bg-violet-950/20" : "border-zinc-800 bg-zinc-900"}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${tog.state ? "border-violet-500 bg-violet-500" : "border-zinc-600"}`}>
                {tog.state && <span className="text-white font-bold leading-none" style={{ fontSize: 9 }}>✓</span>}
              </div>
              <span className="text-xs font-bold text-white">{tog.label}</span>
            </div>
            <p className="text-xs text-zinc-500">{tog.desc}</p>
          </div>
        ))}
      </div>

      {/* Distribution */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Query Distribution</div>
        {dist.map(d => (
          <div key={d.tier.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold" style={{ color: d.tier.color }}>{d.tier.label}</span>
              <span className="text-xs font-mono text-zinc-400">{d.count} queries · {d.pct.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(d.pct, 0.5)}%`, background: d.tier.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Cost summary */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Weighted avg cost vs all-frontier</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">−{savingPct.toFixed(0)}% cost</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500 mb-1">Avg cost / 1M tokens</div>
          <div className="text-lg font-bold font-mono text-white">${avgCost.toFixed(2)}</div>
          <div className="text-xs text-zinc-600">vs ${TIERS[3].costPer1M} all-frontier</div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 3: ROUTING ECONOMICS ─────────────────────────────────────────────────
function RoutingEconomics() {
  const [mau, setMau] = useState(10);
  const QPD = 3, TOK = 600, USD_INR = 84;
  const monthlyQ = mau * 1_000_000 * QPD * 30;

  const DIST = [
    { tier: TIERS[0], share: 0.20 },
    { tier: TIERS[1], share: 0.40 },
    { tier: TIERS[2], share: 0.15 },
    { tier: TIERS[3], share: 0.25 },
  ];

  const routedUsd   = DIST.reduce((acc, d) => acc + d.share * monthlyQ * TOK / 1_000_000 * d.tier.costPer1M, 0);
  const unroutedUsd = monthlyQ * TOK / 1_000_000 * TIERS[3].costPer1M;
  const savingUsd   = unroutedUsd - routedUsd;

  function fmtInr(n) {
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
    if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
    return `₹${Math.round(n).toLocaleString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
        <span className="text-xs font-bold text-zinc-400 uppercase shrink-0">MAU</span>
        <input type="range" min={1} max={100} value={mau} onChange={e => setMau(+e.target.value)} className="flex-1 accent-violet-500" />
        <span className="text-sm font-bold font-mono text-white w-12">{mau}M</span>
      </div>
      <p className="text-xs text-zinc-500 -mt-3">3 queries/user/day · 600 avg tokens · realistic split: 20% rules, 40% mini, 15% indic, 25% frontier</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-5">
          <div className="text-xs font-mono text-red-400 uppercase mb-2">All GPT-4o (no routing)</div>
          <div className="text-3xl font-bold font-mono text-red-400">{fmtInr(unroutedUsd * USD_INR)}</div>
          <div className="text-xs text-zinc-500 mt-1">/month</div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-5">
          <div className="text-xs font-mono text-emerald-400 uppercase mb-2">Smart Routing</div>
          <div className="text-3xl font-bold font-mono text-emerald-400">{fmtInr(routedUsd * USD_INR)}</div>
          <div className="text-xs text-zinc-500 mt-1">/month</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-violet-800/50 rounded-xl p-4 text-center space-y-1">
        <div className="text-xs text-zinc-500">Monthly savings from routing</div>
        <div className="text-4xl font-bold font-mono text-violet-400">{fmtInr(savingUsd * USD_INR)}</div>
        <div className="text-sm text-zinc-400">{((savingUsd / unroutedUsd) * 100).toFixed(0)}% cost reduction</div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold text-zinc-400 uppercase mb-3">Traffic Split</div>
        <div className="h-6 rounded-full overflow-hidden flex mb-3">
          {DIST.map(d => (
            <div key={d.tier.id} className="h-full" title={`${d.tier.label}: ${d.share * 100}%`}
              style={{ width: `${d.share * 100}%`, background: d.tier.color }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {DIST.map(d => (
            <div key={d.tier.id} className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.tier.color }} />
              {d.tier.label} ({(d.share * 100).toFixed(0)}%)
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "classifier", label: "Query Classifier" },
  { id: "config",     label: "Router Config"    },
  { id: "economics",  label: "Routing Economics" },
];

export default function ModelRouterLab() {
  const [tab, setTab] = useState("classifier");
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-5">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <span className="text-xs font-mono px-2 py-0.5 bg-violet-900/60 text-violet-300 rounded border border-violet-700">MODEL ROUTER</span>
          <span className="text-xs text-zinc-500">not every query needs GPT-4o</span>
        </div>
        <h2 className="text-xl font-bold text-white">Model Router Lab</h2>
        <p className="text-sm text-zinc-400 mt-1">Routing is the highest-leverage optimization in production LLM systems. See how to classify query complexity, design routing rules, and calculate the economics of smart routing at scale.</p>
      </div>
      <HowTo
        objective="Build intuition for routing queries to the right model tier — not every query needs a frontier model, and smart routing can cut costs 70%+."
        steps={[
          "Query Classifier: select any query and see which tier it routes to and why — notice how rules, mini, Indic, and frontier each serve different query types",
          "Router Config: adjust the complexity threshold and toggle routing layers — see how the distribution shifts and what it does to weighted avg cost",
          "Routing Economics: set your MAU and see monthly savings from smart routing vs sending everything to GPT-4o",
        ]}
      />
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${tab === t.id ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "classifier" && <QueryClassifier />}
      {tab === "config"     && <RouterConfig />}
      {tab === "economics"  && <RoutingEconomics />}
    </div>
  );
}
