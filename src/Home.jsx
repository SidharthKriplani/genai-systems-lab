import { useState, useEffect } from "react";
import { track, FEEDBACK_URL, isFeedbackReady } from "./analytics";

const SECTIONS = [
  {
    id: "starthere",
    icon: "🧭",
    title: "Start Here",
    desc: "A guided path from text tokens to RAG failures and agent behaviour.",
    meta: ["~45 min", "5 steps", "no prerequisites"],
    cta: "Begin path →",
    accent: "#6366f1",
    accentBg: "rgba(99,102,241,0.08)",
    accentBorder: "rgba(99,102,241,0.25)",
  },
  {
    id: "labs",
    icon: "🔬",
    title: "Labs",
    desc: "Interactive failure scenarios, agent simulators, and debugging tools.",
    meta: ["RAG Lab", "Agents", "Playground"],
    cta: "Open labs →",
    accent: "#3b82f6",
    accentBg: "rgba(59,130,246,0.08)",
    accentBorder: "rgba(59,130,246,0.25)",
  },
  {
    id: "library",
    icon: "📚",
    title: "Library",
    desc: "Full module browser — concepts, flows, tools, and upcoming tracks.",
    meta: ["75+ modules", "all sections"],
    cta: "Browse library →",
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.25)",
  },
];

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

      {/* Beta banner — compact single row */}
      {!betaBannerDismissed && (
        <div className="border-b border-violet-900/40 bg-violet-950/20 px-4 py-2.5">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs text-violet-300 min-w-0">
              <span className="font-bold text-violet-200">Community beta</span>
              <span className="hidden sm:inline text-violet-400"> · free while we improve it · </span>
              <span className="hidden sm:inline">tell us what confused you.</span>
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleFeedback("beta_banner")}
                className="px-3 py-1 rounded-md text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all whitespace-nowrap">
                Give Feedback
              </button>
              <button
                onClick={dismissBetaBanner}
                className="text-violet-600 hover:text-violet-300 transition-all p-1 rounded">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-800/40 text-[11px] font-mono text-violet-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Free community beta
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-5">
          Learn how production<br />
          <span className="text-violet-400">AI actually fails.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8">
          Hands-on labs for RAG, agents, and AI system design. Configure failures, inspect
          what broke, and fix it — in your browser, no login required.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
          <button
            onClick={() => { track("hero_cta_clicked", { cta: "starthere" }); onNavigate("starthere"); }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60">
            Start the guided path →
          </button>
          <button
            onClick={() => { track("hero_cta_clicked", { cta: "lab" }); onNavigate("lab"); }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 font-semibold text-sm transition-all">
            Jump to RAG Lab →
          </button>
        </div>

        {/* Trust + tertiary */}
        <div className="flex items-center justify-center gap-4 flex-wrap text-xs font-mono text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            no login · progress saved locally
          </span>
          <span className="text-zinc-800">·</span>
          <button
            onClick={() => onNavigate("library")}
            className="text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2">
            Browse all modules
          </button>
        </div>
      </div>

      {/* Section cards */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {SECTIONS.map(card => (
            <button
              key={card.id}
              onClick={() => { track("home_section_clicked", { section: card.id }); onNavigate(card.id); }}
              className="text-left rounded-2xl p-5 transition-all group relative overflow-hidden"
              style={{
                background: card.accentBg,
                border: `1px solid ${card.accentBorder}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = card.accent + "55";
                e.currentTarget.style.background = card.accentBg.replace("0.08", "0.13");
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = card.accentBorder;
                e.currentTarget.style.background = card.accentBg;
              }}>

              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                style={{ background: card.accent }} />

              {/* Icon */}
              <div className="text-2xl mb-4 mt-1">{card.icon}</div>

              {/* Title */}
              <div className="text-sm font-black text-white mb-1.5">
                {card.title}
              </div>

              {/* Description */}
              <div className="text-xs text-zinc-400 leading-relaxed mb-3">
                {card.desc}
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-1 mb-4">
                {card.meta.map(m => (
                  <span key={m}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      color: card.accent,
                      background: card.accent + "18",
                      border: `1px solid ${card.accent}30`,
                    }}>
                    {m}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="text-xs font-bold" style={{ color: card.accent }}>
                {card.cta}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-900 py-5">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-zinc-700 font-mono">
            GenAI Systems Lab · Free · Built with React + Vite + Tailwind
          </span>
          <button
            onClick={() => handleFeedback("footer")}
            className="text-xs text-zinc-600 hover:text-violet-400 transition-colors font-mono">
            💬 Give feedback
          </button>
        </div>
      </div>

    </div>
  );
}
