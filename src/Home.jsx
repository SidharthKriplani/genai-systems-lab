import { useState, useEffect } from "react";
import { track, FEEDBACK_URL, isFeedbackReady } from "./analytics";

// ── Decorative Failure Console ─────────────────────────────────────────────
function FailureConsole() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-violet-500">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          RAG Failure Console
        </span>
        <span className="text-[9px] text-zinc-700">scenario 1 / 6</span>
      </div>

      {/* Config strip */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span className="text-[9px] text-zinc-700 shrink-0">config:</span>
        {["top_k=1", "reranker=off", "chunks=large"].map(c => (
          <span key={c} className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-500 text-[9px]">
            {c}
          </span>
        ))}
      </div>

      {/* Pipeline */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {[
          { label: "Query",     bad: false },
          { label: "Retrieval", bad: true  },
          { label: "Answer",    bad: true  },
          { label: "Eval",      bad: true  },
        ].map((stage, i, arr) => (
          <span key={stage.label} className="flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
              stage.bad
                ? "bg-red-950/50 border-red-900/50 text-red-400"
                : "bg-zinc-800/60 border-zinc-700/50 text-zinc-400"
            }`}>
              {stage.label}
            </span>
            {i < arr.length - 1 && <span className="text-zinc-700 text-[9px]">→</span>}
          </span>
        ))}
      </div>

      {/* Failure tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-red-950/40 border border-red-900/40 text-red-400">
          stale_document_retrieval
        </span>
        <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-orange-950/40 border border-orange-900/40 text-orange-400">
          conflict_not_flagged
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { label: "groundedness", value: "34%",      color: "#ef4444" },
          { label: "citation_acc",  value: "38%",      color: "#ef4444" },
          { label: "risk_level",    value: "critical", color: "#f97316" },
        ].map(m => (
          <div key={m.label} className="bg-zinc-800/40 rounded p-1.5 text-center border border-zinc-800/80">
            <div className="text-xs font-bold mb-0.5" style={{ color: m.color }}>{m.value}</div>
            <div className="text-[7px] text-zinc-600 uppercase tracking-wider leading-tight">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Answer snippet */}
      <div className="border-t border-zinc-800 pt-2.5">
        <div className="text-[8px] text-zinc-700 uppercase tracking-wider mb-1">answer</div>
        <p className="text-[10px] text-zinc-500 leading-relaxed italic mb-1.5">
          "No, employees cannot expense meals while working remotely."
        </p>
        <div className="flex items-start gap-1">
          <span className="text-red-500 text-[10px] shrink-0 mt-px">⚠</span>
          <span className="text-[9px] text-zinc-600 leading-snug">
            Wrong. Based on 2021 policy — 2024 update not retrieved.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Card preview content ───────────────────────────────────────────────────
function CardPreview({ preview, accent }) {
  if (preview.type === "steps") {
    return (
      <div className="flex items-center gap-1 flex-wrap mt-3">
        {preview.items.map((item, i) => (
          <span key={item} className="flex items-center gap-0.5">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: accent + "18", color: accent, border: `1px solid ${accent}30` }}>
              {item}
            </span>
            {i < preview.items.length - 1 && (
              <span className="text-[8px] text-zinc-700">→</span>
            )}
          </span>
        ))}
      </div>
    );
  }
  if (preview.type === "tags") {
    return (
      <div className="flex flex-wrap gap-1 mt-3">
        {preview.items.map(item => (
          <span key={item}
            className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-red-950/30 border border-red-900/30 text-red-400">
            {item}
          </span>
        ))}
      </div>
    );
  }
  if (preview.type === "chips") {
    return (
      <div className="flex flex-wrap gap-1 mt-3">
        {preview.items.map(item => (
          <span key={item}
            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500">
            {item}
          </span>
        ))}
        <span className="text-[9px] font-mono text-zinc-700 self-center px-0.5">+70</span>
      </div>
    );
  }
  return null;
}

// ── Section card ──────────────────────────────────────────────────────────
function SectionCard({ card, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { track("home_section_clicked", { section: card.id }); onNavigate(card.id); }}
      className="text-left rounded-xl p-5 transition-all relative overflow-hidden"
      style={{
        background: hovered ? card.accent + "12" : card.accent + "07",
        border: `1px solid ${hovered ? card.accent + "55" : card.accent + "28"}`,
        boxShadow: hovered ? `0 0 24px ${card.accent}18` : "none",
      }}>

      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${card.accent}cc, transparent)` }} />

      {/* Icon + meta */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xl">{card.icon}</span>
        <div className="text-right">
          {card.meta.map(m => (
            <div key={m} className="text-[9px] font-mono text-zinc-700 leading-tight">{m}</div>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="text-sm font-black text-white mb-1">{card.title}</div>

      {/* Desc */}
      <div className="text-xs text-zinc-500 leading-relaxed">{card.desc}</div>

      {/* Preview chips */}
      <CardPreview preview={card.preview} accent={card.accent} />

      {/* CTA */}
      <div className="mt-4 text-xs font-bold" style={{ color: card.accent }}>{card.cta}</div>
    </button>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "starthere",
    icon: "🧭",
    title: "Start Here",
    desc: "Follow 5 steps from tokenization to RAG failure. Built for first-timers.",
    meta: ["~45 min", "5 required steps", "no prerequisites"],
    accent: "#6366f1",
    preview: {
      type: "steps",
      items: ["Tokenizer", "Embeddings", "Context", "Chunking", "RAG Lab"],
    },
    cta: "Begin path →",
  },
  {
    id: "labs",
    icon: "🔬",
    title: "Labs",
    desc: "Configure RAG pipelines, trace agent loops, craft injection attacks.",
    meta: ["hands-on", "configurable", "interactive"],
    accent: "#3b82f6",
    preview: {
      type: "tags",
      items: ["stale_docs", "prompt_injection", "context_overflow", "multi-hop"],
    },
    cta: "Open labs →",
  },
  {
    id: "library",
    icon: "📚",
    title: "Library",
    desc: "Browse every module by section, audience, or feature.",
    meta: ["75+ modules", "all sections", "filters"],
    accent: "#f59e0b",
    preview: {
      type: "chips",
      items: ["Concepts", "Flows", "RAG Lab", "Agents", "Explore"],
    },
    cta: "Browse library →",
  },
];

// ── Homepage ───────────────────────────────────────────────────────────────
export default function HomePage({ onNavigate, visited = new Set(), onFeedback }) {
  const [betaBannerDismissed, setBetaBannerDismissed] = useState(() => {
    try { return localStorage.getItem("genai_beta_banner_dismissed") === "1"; } catch { return false; }
  });

  useEffect(() => { track("home_viewed", {}); }, []);

  function dismissBetaBanner() {
    setBetaBannerDismissed(true);
    try { localStorage.setItem("genai_beta_banner_dismissed", "1"); } catch {}
  }

  function handleFeedback(location) {
    track("feedback_clicked", { location });
    if (onFeedback) { onFeedback(location); return; }
    if (isFeedbackReady()) window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* Beta banner — compact top strip */}
      {!betaBannerDismissed && (
        <div className="bg-violet-950/30 border-b border-violet-900/30 px-4 py-1.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-violet-400 font-mono">Community beta</span>
              <span className="text-[11px] text-violet-700 font-mono hidden sm:inline">
                · free while we improve it
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback("beta_banner")}
                className="text-[10px] font-bold font-mono text-violet-500 hover:text-violet-300 transition-colors px-2 py-0.5 rounded border border-violet-800/40 hover:border-violet-600 whitespace-nowrap">
                feedback →
              </button>
              <button onClick={dismissBetaBanner}
                className="text-violet-700 hover:text-violet-400 transition-colors text-xs px-1">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero — two column on desktop */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-10">
        <div className="grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-center">

          {/* Left: copy + CTAs */}
          <div>
            {/* Status chip */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              no login · progress saved locally
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
              Learn how production<br />
              <span className="text-violet-400">AI actually fails.</span>
            </h1>

            {/* Subcopy */}
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-7 max-w-md">
              Configure a RAG system. Watch it retrieve the wrong evidence and answer confidently.
              Then fix it.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <button
                onClick={() => { track("hero_cta_clicked", { cta: "starthere" }); onNavigate("starthere"); }}
                className="px-7 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/40">
                Start the guided path →
              </button>
              <button
                onClick={() => { track("hero_cta_clicked", { cta: "lab" }); onNavigate("lab"); }}
                className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 font-semibold text-sm transition-all">
                Jump to RAG Lab →
              </button>
            </div>

            {/* Compact stat strip */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] font-mono text-zinc-600">
              {["6 failure scenarios", "75+ modules", "7 agent patterns", "all interactive"].map(s => (
                <span key={s} className="flex items-center gap-1">
                  <span className="text-zinc-800">—</span>{s}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Failure Console (desktop only) */}
          <div className="hidden lg:block">
            <FailureConsole />
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 font-mono">
            Where to go
          </span>
          <div className="flex-1 h-px bg-zinc-900" />
          <button onClick={() => onNavigate("library")}
            className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors">
            Browse all →
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {SECTIONS.map(card => (
            <SectionCard key={card.id} card={card} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-900 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] text-zinc-700 font-mono">
            GenAI Systems Lab · Free · Static · React + Vite + Tailwind
          </span>
          <button onClick={() => handleFeedback("footer")}
            className="text-[11px] text-zinc-600 hover:text-violet-400 transition-colors font-mono">
            💬 feedback
          </button>
        </div>
      </div>

    </div>
  );
}
