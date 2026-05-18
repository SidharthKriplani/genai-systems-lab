import { useState, useMemo } from "react";
import HowTo from "./HowTo";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const USD_TO_INR = 84;
const CR  = 10_000_000;
const LAC = 100_000;

function fmtInr(n) {
  if (n >= CR)  return `₹${(n / CR).toFixed(2)} Cr`;
  if (n >= LAC) return `₹${(n / LAC).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}
function fmtUsd(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000)      return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

const MODELS = [
  { id: "gpt4o",     label: "GPT-4o",               inp: 2.50, out: 10.00, badge: "frontier", color: "#ef4444" },
  { id: "gpt4mini",  label: "GPT-4o mini",           inp: 0.15, out: 0.60,  badge: "balanced", color: "#f59e0b" },
  { id: "haiku",     label: "Claude Haiku 3.5",      inp: 0.80, out: 4.00,  badge: "balanced", color: "#f59e0b" },
  { id: "llama8b",   label: "Llama 3.1 8B (hosted)", inp: 0.03, out: 0.03,  badge: "frugal",   color: "#10b981" },
  { id: "llama70b",  label: "Llama 3.1 70B (hosted)",inp: 0.09, out: 0.09,  badge: "heavy",    color: "#6366f1" },
];

const LANG_SAMPLES = [
  { lang: "English",            flag: "🇺🇸", tokens: 12,  multiplier: 1.0,  note: "Latin script — dense, efficient tokenization" },
  { lang: "Hinglish",           flag: "🇮🇳", tokens: 14,  multiplier: 1.17, note: "Romanized Hindi — near-native tokenization efficiency" },
  { lang: "Hindi (Devanagari)", flag: "🇮🇳", tokens: 38,  multiplier: 3.17, note: "Each akshara splits into 2–4 tokens in GPT-4o" },
  { lang: "Bengali",            flag: "🇮🇳", tokens: 44,  multiplier: 3.67, note: "High token count, agglutinative morphology" },
  { lang: "Telugu",             flag: "🇮🇳", tokens: 48,  multiplier: 4.00, note: "Script-level inefficiency — similar to Tamil" },
  { lang: "Tamil",              flag: "🇮🇳", tokens: 52,  multiplier: 4.33, note: "Most expensive — 4× + token count vs English" },
];

const SAMPLE_SENTENCE = {
  en: "I need help with my account balance and recent transactions",
  hinglish: "Mujhe apne account balance aur recent transactions mein help chahiye",
  hi: "मुझे अपने खाते की शेष राशि और हाल के लेनदेन में मदद चाहिए",
  bn: "আমার অ্যাকাউন্ট ব্যালেন্স এবং সাম্প্রতিক লেনদেনে সাহায্য দরকার",
  te: "నా ఖాతా బ్యాలెన్స్ మరియు ఇటీవలి లావాదేవీలకు సహాయం కావాలి",
  ta: "என் கணக்கு இருப்பு மற்றும் சமீபத்திய பரிவர்த்தனைகளுக்கு உதவி வேண்டும்",
};
const LANG_SENTENCES = [SAMPLE_SENTENCE.en, SAMPLE_SENTENCE.hinglish, SAMPLE_SENTENCE.hi, SAMPLE_SENTENCE.bn, SAMPLE_SENTENCE.te, SAMPLE_SENTENCE.ta];

const OPTIMIZATIONS = [
  {
    id: "cache",
    icon: "🗄️",
    label: "Semantic Cache",
    desc: "Cache query embeddings + responses (Redis / Faiss). 40% cache hit rate is realistic for support bots with repetitive queries.",
    queryMultiplier: 0.60,   // 40% of queries served from cache
    tokenMultiplier: 1.0,
    opsInr: 12000,
    latency: "P50 −80%",
    latencyGood: true,
  },
  {
    id: "routing",
    icon: "🔀",
    label: "Model Routing",
    desc: "Classify query complexity — route 65% of simple/FAQ queries to mini model, keep 35% for frontier. Most support queries are simple.",
    queryMultiplier: 1.0,
    tokenMultiplier: 1.0,
    routingActive: true,    // special handling in calculation
    opsInr: 4000,
    latency: "Neutral",
    latencyGood: true,
  },
  {
    id: "compression",
    icon: "🗜️",
    label: "Prompt Compression",
    desc: "LLMLingua-style compression of system prompts and retrieved context. ~25% reduction in input tokens with <2% quality loss.",
    queryMultiplier: 1.0,
    tokenMultiplier: 0.75,  // 25% reduction in input tokens
    opsInr: 2000,
    latency: "+5ms",
    latencyGood: false,
  },
  {
    id: "quantize",
    icon: "⚡",
    label: "INT8 Quantization",
    desc: "Quantize self-hosted model weights. ~35% infra cost reduction. Applies conceptually here as a cost multiplier on API cost.",
    queryMultiplier: 1.0,
    tokenMultiplier: 1.0,
    costMultiplier: 0.65,   // reduces final cost
    opsInr: 0,
    latency: "−30ms",
    latencyGood: true,
  },
  {
    id: "batching",
    icon: "📦",
    label: "Request Batching",
    desc: "Batch async workloads (digests, summaries, reports). Increases GPU utilization to 80%+. Not for real-time chat.",
    queryMultiplier: 1.0,
    tokenMultiplier: 1.0,
    costMultiplier: 0.82,
    opsInr: 0,
    latency: "Async only",
    latencyGood: true,
  },
];

// ─── SCALE CALCULATOR ─────────────────────────────────────────────────────────
function ScaleCalculator() {
  const [mau, setMau]           = useState(10);
  const [qpd, setQpd]           = useState(3);
  const [inputToks, setInputToks] = useState(500);
  const [outputToks, setOutputToks] = useState(300);
  const [selected, setSelected] = useState("gpt4o");

  const monthlyQ = mau * 1_000_000 * qpd * 30;

  const costs = useMemo(() => MODELS.map(m => {
    const inM  = monthlyQ * inputToks  / 1_000_000;
    const outM = monthlyQ * outputToks / 1_000_000;
    const usd  = inM * m.inp + outM * m.out;
    const inr  = usd * USD_TO_INR;
    const perQueryInr = inr / monthlyQ;
    return { ...m, usd, inr, perQueryInr };
  }), [mau, qpd, inputToks, outputToks, monthlyQ]);

  const sel = costs.find(c => c.id === selected);
  const TARGET = 0.001; // ₹0.001/query

  const SLIDERS = [
    { label: "Monthly Active Users", value: mau,        set: setMau,        min: 1,   max: 500,  step: 1,   unit: "M", marks: ["1M","250M","500M"] },
    { label: "Queries / User / Day", value: qpd,        set: setQpd,        min: 1,   max: 30,   step: 1,   unit: "",  marks: ["1","15","30"] },
    { label: "Avg Input Tokens",     value: inputToks,  set: setInputToks,  min: 100, max: 4000, step: 100, unit: "",  marks: ["100","2K","4K"] },
    { label: "Avg Output Tokens",    value: outputToks, set: setOutputToks, min: 50,  max: 2000, step: 50,  unit: "",  marks: ["50","1K","2K"] },
  ];

  return (
    <div className="space-y-6">
      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SLIDERS.map(sl => (
          <div key={sl.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">{sl.label}</span>
              <span className="text-sm font-bold font-mono text-white">{sl.value}{sl.unit}</span>
            </div>
            <input type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.value}
              onChange={e => sl.set(+e.target.value)} className="w-full accent-violet-500" />
            <div className="flex justify-between text-xs text-zinc-600 font-mono">
              {sl.marks.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* Query count */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">Total monthly queries</span>
        <span className="text-sm font-bold font-mono text-white">{(monthlyQ / 1_000_000).toFixed(1)}M / month</span>
      </div>

      {/* Model comparison */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Monthly Cost — Click to Inspect</div>
        {costs.map(c => {
          const pctOfMax = (c.inr / costs[0].inr) * 100;
          const meetsTarget = c.perQueryInr <= TARGET;
          return (
            <div key={c.id} onClick={() => setSelected(c.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${selected === c.id ? "border-violet-600 bg-violet-950/20" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{c.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-zinc-800 text-zinc-500">{c.badge}</span>
                  {meetsTarget && <span className="text-xs text-emerald-400 font-mono">✓ ₹0.001 target</span>}
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono" style={{ color: c.color }}>{fmtInr(c.inr)}</div>
                    <div className="text-xs text-zinc-600">/month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-zinc-400">₹{c.perQueryInr.toFixed(4)}</div>
                    <div className="text-xs text-zinc-600">/query</div>
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, pctOfMax)}%`, background: c.color + "cc" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight callout */}
      {sel && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-2">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-wide">System Design Insight</div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            At <span className="text-white font-bold">{mau}M MAU</span> × {qpd} queries/day,{" "}
            <span className="font-bold" style={{ color: sel.color }}>{sel.label}</span> costs{" "}
            <span className="text-white font-bold">{fmtInr(sel.inr)}/month</span> ({fmtUsd(sel.usd)}).
            {sel.perQueryInr > TARGET
              ? ` At ₹${sel.perQueryInr.toFixed(4)}/query, you're ${((sel.perQueryInr / TARGET)).toFixed(1)}× above the ₹0.001 Bharat-scale target — semantic caching, model routing, and quantization are not optional here.`
              : ` You meet the ₹0.001/query Bharat-scale target. Frugal-by-default is baked into the architecture — this is your ceiling, not your floor.`
            }
          </p>
          {sel.inr >= CR && (
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <span className="text-xs font-mono text-red-400">⚠ Annual cost: {fmtInr(sel.inr * 12)} — requires board-level budget approval at most Indian startups.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MULTILINGUAL TAX ─────────────────────────────────────────────────────────
function MultilingualTax() {
  const [modelId, setModelId] = useState("gpt4o");
  const [mau, setMau]         = useState(5);
  const QPD = 3;

  const model = MODELS.find(m => m.id === modelId);
  const monthlyQ = mau * 1_000_000 * QPD * 30;
  const engTokens = LANG_SAMPLES[0].tokens;
  const engCostInr = (monthlyQ * engTokens / 1_000_000) * model.inp * USD_TO_INR;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">MAU</span>
            <span className="text-xs font-mono text-white">{mau}M</span>
          </div>
          <input type="range" min={1} max={100} value={mau} onChange={e => setMau(+e.target.value)}
            className="w-full accent-violet-500" />
        </div>
        <div className="flex items-center gap-2">
          {[["gpt4o","GPT-4o"], ["gpt4mini","4o mini"], ["llama8b","Llama 8B"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setModelId(id)}
              className={`px-3 py-2 rounded text-xs font-bold transition-all ${modelId === id ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Sentence preview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
        <div className="text-xs text-zinc-500 uppercase font-bold mb-2">Same query, 6 languages</div>
        {LANG_SAMPLES.map((ls, i) => (
          <div key={ls.lang} className="flex items-start gap-2 py-1 border-b border-zinc-800 last:border-0">
            <span className="text-sm">{ls.flag}</span>
            <span className="text-xs text-zinc-400 w-28 shrink-0">{ls.lang}</span>
            <span className="text-xs font-mono text-zinc-500 truncate flex-1">{LANG_SENTENCES[i]}</span>
          </div>
        ))}
      </div>

      {/* Token comparison bars */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Token Count & Monthly Input Cost</div>
        {LANG_SAMPLES.map(ls => {
          const monthlyCostInr = (monthlyQ * ls.tokens / 1_000_000) * model.inp * USD_TO_INR;
          const overCostInr    = monthlyCostInr - engCostInr;
          const maxTokens      = LANG_SAMPLES[LANG_SAMPLES.length - 1].tokens;
          const barColor       = ls.multiplier >= 4 ? "#ef4444" : ls.multiplier >= 3 ? "#f59e0b" : ls.multiplier > 1 ? "#6366f1" : "#10b981";

          return (
            <div key={ls.lang} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span>{ls.flag}</span>
                    <span className="text-sm font-bold text-white">{ls.lang}</span>
                    {ls.multiplier === 1 && <span className="text-xs font-mono text-zinc-600">baseline</span>}
                  </div>
                  <p className="text-xs text-zinc-500">{ls.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold font-mono text-white">{ls.tokens}</div>
                  <div className="text-xs font-mono" style={{ color: barColor }}>
                    {ls.multiplier === 1 ? "—" : `${ls.multiplier.toFixed(1)}×`}
                  </div>
                </div>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${(ls.tokens / maxTokens) * 100}%`, background: barColor }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">{fmtInr(monthlyCostInr)}/month (input only, {mau}M MAU)</span>
                {overCostInr > 0 && (
                  <span className="font-mono" style={{ color: barColor }}>+{fmtInr(overCostInr)} vs English</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Design implication */}
      <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 space-y-2">
        <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">India-Specific Design Implication</div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          A Tamil or Telugu support query costs <strong className="text-white">4–5× more in tokens</strong> than the same query in English on GPT-4o.
          If your product targets vernacular-first users across Tamil Nadu, Bengal, or AP/Telangana,
          this multiplier applies to your entire inference budget.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { title: "Use Sarvam AI", desc: "Purpose-built Indic tokenization — 3× cheaper per Indic token than GPT-4o" },
            { title: "Romanize safely", desc: "For non-formal interfaces, Hinglish is 1.17× English — nearly free" },
            { title: "Language routing", desc: "Detect language at ingress → route Indic queries to Indic-optimized model" },
          ].map(tip => (
            <div key={tip.title} className="bg-zinc-900 rounded-lg p-3">
              <div className="text-xs font-bold text-amber-300 mb-1">{tip.title}</div>
              <p className="text-xs text-zinc-500">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FRUGAL STACK ─────────────────────────────────────────────────────────────
function FrugalStack() {
  const [mau, setMau]       = useState(10);
  const [enabled, setEnabled] = useState(new Set());

  const QPD = 3;
  const BASE_INP = 500;
  const BASE_OUT = 300;
  const BASE_MODEL = MODELS.find(m => m.id === "gpt4o");
  const MINI_MODEL  = MODELS.find(m => m.id === "gpt4mini");

  const monthlyQ = mau * 1_000_000 * QPD * 30;
  const baseInr  = (() => {
    const inM  = monthlyQ * BASE_INP / 1_000_000;
    const outM = monthlyQ * BASE_OUT / 1_000_000;
    return (inM * BASE_MODEL.inp + outM * BASE_MODEL.out) * USD_TO_INR;
  })();

  const result = useMemo(() => {
    let effQ    = monthlyQ;
    let inpToks = BASE_INP;
    let outToks = BASE_OUT;
    let costMult = 1.0;

    if (enabled.has("cache"))       effQ    *= 0.60;
    if (enabled.has("compression")) inpToks *= 0.75;
    if (enabled.has("quantize"))    costMult *= 0.65;
    if (enabled.has("batching"))    costMult *= 0.82;

    let costInr;
    if (enabled.has("routing")) {
      const inM  = effQ * inpToks  / 1_000_000;
      const outM = effQ * outToks  / 1_000_000;
      const simpleShare = 0.65;
      costInr = (
        inM * simpleShare * MINI_MODEL.inp  + outM * simpleShare * MINI_MODEL.out +
        inM * (1 - simpleShare) * BASE_MODEL.inp + outM * (1 - simpleShare) * BASE_MODEL.out
      ) * USD_TO_INR * costMult;
    } else {
      const inM  = effQ * inpToks  / 1_000_000;
      const outM = effQ * outToks  / 1_000_000;
      costInr = (inM * BASE_MODEL.inp + outM * BASE_MODEL.out) * USD_TO_INR * costMult;
    }

    const opsInr     = [...enabled].reduce((acc, id) => acc + (OPTIMIZATIONS.find(o => o.id === id)?.opsInr || 0), 0);
    const savingsPct = ((baseInr - costInr) / baseInr) * 100;
    const perQ       = costInr / monthlyQ;

    return { costInr, opsInr, savingsPct, perQ };
  }, [enabled, mau, monthlyQ, baseInr]);

  function toggle(id) {
    setEnabled(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const TARGET = 0.001;
  const meetsTarget = result.perQ <= TARGET;

  return (
    <div className="space-y-6">
      {/* MAU slider */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
        <span className="text-xs font-bold text-zinc-400 uppercase shrink-0">MAU</span>
        <input type="range" min={1} max={200} value={mau} onChange={e => setMau(+e.target.value)}
          className="flex-1 accent-violet-500" />
        <span className="text-sm font-bold font-mono text-white w-14">{mau}M</span>
      </div>

      {/* Baseline */}
      <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-red-400 uppercase mb-1">Naive Baseline — GPT-4o, no optimizations</div>
          <div className="text-xs text-zinc-500">{BASE_INP} input + {BASE_OUT} output tokens · {(monthlyQ / 1e6).toFixed(0)}M queries/month</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-red-400">{fmtInr(baseInr)}</div>
          <div className="text-xs text-zinc-500">/month</div>
        </div>
      </div>

      {/* Optimization toggles */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Toggle Optimizations</div>
        {OPTIMIZATIONS.map(opt => {
          const on = enabled.has(opt.id);
          return (
            <div key={opt.id} onClick={() => toggle(opt.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${on ? "border-emerald-700 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${on ? "border-emerald-500 bg-emerald-500" : "border-zinc-600"}`}>
                  {on && <span className="text-xs text-white font-bold leading-none">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm">{opt.icon}</span>
                    <span className="text-sm font-bold text-white">{opt.label}</span>
                    {opt.opsInr > 0 && <span className="text-xs text-zinc-600 font-mono">+{fmtInr(opt.opsInr)}/mo ops</span>}
                    <span className={`ml-auto text-xs font-mono ${opt.latencyGood ? "text-emerald-400" : "text-amber-400"}`}>{opt.latency}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{opt.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optimized result */}
      <div className={`rounded-xl border p-5 transition-all ${meetsTarget ? "border-emerald-700 bg-emerald-950/20" : result.savingsPct > 40 ? "border-amber-700 bg-amber-950/20" : "border-zinc-700 bg-zinc-900"}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase mb-1">Optimized Monthly Cost</div>
            <div className="text-3xl font-bold font-mono text-white">{fmtInr(result.costInr)}</div>
            {result.opsInr > 0 && (
              <div className="text-xs text-zinc-500 mt-0.5">+ {fmtInr(result.opsInr)}/mo ops overhead</div>
            )}
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold font-mono ${result.savingsPct > 50 ? "text-emerald-400" : "text-amber-400"}`}>
              -{result.savingsPct.toFixed(0)}%
            </div>
            <div className="text-xs text-zinc-500">{fmtInr(baseInr - result.costInr)} saved/month</div>
          </div>
        </div>

        {/* Per-query bar */}
        <div className="pt-3 border-t border-zinc-800 space-y-2">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (result.perQ / 0.01) * 100)}%`,
                background: meetsTarget ? "#10b981" : result.perQ < 0.005 ? "#f59e0b" : "#ef4444"
              }} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono" style={{ color: meetsTarget ? "#10b981" : "#f59e0b" }}>
              ₹{result.perQ.toFixed(5)}/query
            </span>
            <span className={`text-xs font-mono ${meetsTarget ? "text-emerald-400" : "text-zinc-500"}`}>
              {meetsTarget ? "✓ Bharat-scale target met" : `target: ₹${TARGET} (${((result.perQ / TARGET)).toFixed(1)}× away)`}
            </span>
          </div>
        </div>

        {/* Recommendation */}
        {enabled.size === 0 && (
          <p className="text-xs text-zinc-600 mt-3 pt-3 border-t border-zinc-800">
            ← Start toggling optimizations above to reduce cost toward the ₹0.001/query target.
          </p>
        )}
        {meetsTarget && (
          <p className="text-xs text-emerald-600 mt-3 pt-3 border-t border-zinc-800">
            Architecture is Bharat-scale ready. You can serve {mau}M MAU at ≤₹0.001/query — viable for Zepto/Meesho/Razorpay-tier products.
          </p>
        )}
      </div>

      {/* Production checklist */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">India-Scale Production Checklist</div>
        <div className="space-y-2">
          {[
            { check: "Circuit breaker on LLM calls", detail: "Payment-critical flows (Razorpay, Juspay) must have OPEN/HALF-OPEN/CLOSED circuit + deterministic fallback" },
            { check: "Graceful degradation", detail: "If LLM is unavailable, serve cached response or rule-based fallback — never show a spinner to a transacting user" },
            { check: "Cost budget alerting", detail: "Set CloudWatch / Grafana alert at 70% of monthly LLM budget — Indian startups have been surprised by GPT-4 bills" },
            { check: "Multilingual cost model", detail: "Price your Indic-language queries separately — they cost 3–5× in tokens, this must be in your unit economics model" },
            { check: "Self-hosting break-even", detail: "At >5M queries/day, self-hosted Llama 70B on A100s is typically cheaper than API. Run the numbers before Series B." },
          ].map(item => (
            <div key={item.check} className="flex items-start gap-3">
              <span className="text-emerald-500 shrink-0 mt-0.5 text-xs">☐</span>
              <div>
                <div className="text-xs font-bold text-zinc-300">{item.check}</div>
                <div className="text-xs text-zinc-600">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const INDIA_TABS = [
  { id: "calculator",    label: "Scale Calculator" },
  { id: "multilingual",  label: "Multilingual Tax"  },
  { id: "frugal",        label: "Frugal Stack"       },
];

export default function IndiaScaleLab() {
  const [tab, setTab] = useState("calculator");
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-5">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <span className="text-xs font-mono px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded border border-emerald-700">INDIA SCALE</span>
          <span className="text-xs text-zinc-500">design AI for ₹0.001/query — Bharat-scale</span>
        </div>
        <h2 className="text-xl font-bold text-white">India Scale Lab</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Indian consumer products operate at 10M+ MAU with extreme cost pressure and multilingual complexity.
          Build intuition for token economics, Indic language costs, and frugal-by-default architecture before you ship.
        </p>
      </div>

      <HowTo
        objective="Design AI systems that work at Indian consumer scale — 10M+ MAU, ₹0.001/query targets, Indic language support, and frugal-by-default architecture."
        steps={[
          "Scale Calculator: set your MAU and query pattern, compare monthly cost in ₹ across 5 model tiers — see when you cross ₹1 Crore/month",
          "Multilingual Tax: see why a Tamil query costs 4× more than English in GPT-4o — and what Sarvam AI, Hinglish routing, and language detection do about it",
          "Frugal Stack: toggle semantic cache, model routing, prompt compression, and quantization — watch costs drop toward the ₹0.001/query Bharat-scale target",
        ]}
      />

      {/* Tab nav */}
      <div className="flex gap-2 flex-wrap">
        {INDIA_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${tab === t.id ? "bg-emerald-700 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "calculator"   && <ScaleCalculator />}
      {tab === "multilingual" && <MultilingualTax />}
      {tab === "frugal"       && <FrugalStack />}
    </div>
  );
}
