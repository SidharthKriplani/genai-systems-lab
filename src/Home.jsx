import { useState, useEffect } from "react";
import { track, FEEDBACK_URL, isFeedbackReady } from "./analytics";

const SECTIONS = [
  {
    id: "starthere",
    icon: "🧭",
    title: "Start Here",
    desc: "A guided path from text tokens to RAG failures and agent behaviour.",
    sub: "~45 min · 5 required steps · no prerequisites",
    cta: "Begin path",
    accent: "#6366f1",
  },
  {
    id: "labs",
    icon: "🔬",
    title: "Labs",
    desc: "Interactive failure scenarios, agents, playgrounds, and debugging tools.",
    sub: "RAG Lab · Agents · Playground · Explore",
    cta: "Open labs",
    accent: "#3b82f6",
  },
  {
    id: "library",
    icon: "📚",
    title: "Library",
    desc: "Full module browser for concepts, flows, labs, tools, and upcoming tracks.",
    sub: "75+ modules across all sections",
    cta: "Browse library",
    accent: "#f59e0b",
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

      {/* Community beta banner */}
      {!betaBannerDismissed && (
        <div className="border-b border-violet-900/40 bg-violet-950/20">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-violet-300 leading-relaxed">
              <span className="font-bold text-violet-200">Community beta:</span>{" "}
              this lab is free while we improve it. Try a module, break something, and tell us what confused you.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleFeedback("beta_banner")}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all">
                Give Feedback
              </button>
              <button
                onClick={dismissBetaBanner}
                className="text-violet-500 hover:text-violet-300 text-xs px-2 py-1 transition-all">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-12 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Learn how production
            <br className="hidden sm:block" />
            <span className="text-violet-400"> AI actually fails.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Hands-on labs for RAG, agents, and AI system design. Configure failures, inspect what
            broke, and learn how to fix it — all in your browser, no login.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => { track("hero_cta_clicked", { cta: "starthere" }); onNavigate("starthere"); }}
            className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/40">
            Start the guided path →
          </button>
          <button
            onClick={() => { track("hero_cta_clicked", { cta: "lab" }); onNavigate("lab"); }}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-medium text-sm transition-all">
            Jump to RAG Lab →
          </button>
        </div>

        {/* Trust + tertiary link */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Free community beta · no login · progress saved locally
          </div>
          <button
            onClick={() => onNavigate("library")}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono">
            Browse all modules →
          </button>
        </div>
      </div>

      {/* 3-section cards */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {SECTIONS.map(card => (
            <button
              key={card.id}
              onClick={() => { track("home_section_clicked", { section: card.id }); onNavigate(card.id); }}
              className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group">
              <div className="text-2xl mb-3">{card.icon}</div>
              <div className="text-sm font-black text-white mb-1.5 group-hover:text-violet-300 transition-colors">
                {card.title}
              </div>
              <div className="text-xs text-zinc-500 leading-relaxed mb-3">{card.desc}</div>
              <div className="text-[10px] text-zinc-700 font-mono mb-3 leading-relaxed">{card.sub}</div>
              <div className="text-xs font-bold transition-colors" style={{ color: card.accent }}>
                {card.cta} →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 py-6">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-zinc-700 font-mono">
            GenAI Systems Lab · Free · Static · Built with React + Vite + Tailwind
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[10px] text-zinc-800 font-mono">
              No login. No personal data requested. Usage analytics are used only to improve the beta.
            </span>
            <button
              onClick={() => handleFeedback("footer")}
              className="text-xs text-zinc-600 hover:text-violet-400 transition-colors font-mono">
              💬 Give feedback on this lab
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
