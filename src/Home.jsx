import { useState, useEffect } from "react";
import { track, FEEDBACK_URL } from "./analytics";

const START_HERE_PATH = [
  { step: 1, label: "Tokenizer",     tab: "concepts", desc: "How text becomes numbers" },
  { step: 2, label: "Embeddings",    tab: "concepts", desc: "Meaning as geometry" },
  { step: 3, label: "Context Window",tab: "concepts", desc: "Attention cost + overflow" },
  { step: 4, label: "RAG Flows",     tab: "flows",    desc: "End-to-end pipeline" },
  { step: 5, label: "RAG Failures",  tab: "lab",      desc: "Break it to understand it" },
  { step: 6, label: "Agent Loop",    tab: "concepts", desc: "ReAct trace step-by-step" },
  { step: 7, label: "Debug RAG",     tab: "concepts", desc: "Diagnose 5 real incidents" },
];

const LEARNING_PATHS = [
  {
    id: "engineer",
    title: "AI Engineer",
    color: "#6366f1",
    tagline: "Build production RAG, agents, guardrails, and evals that don't break in the real world.",
    duration: "~6 hrs",
    steps: [
      { tab: "concepts", label: "Concepts", desc: "Embeddings, attention, transformers" },
      { tab: "flows",    label: "Flows",    desc: "RAG pipeline, agent loop, guardrails" },
      { tab: "lab",      label: "RAG Lab",  desc: "Failure modes simulator" },
      { tab: "systems",  label: "Systems",  desc: "Evals, observability, fine-tuning" },
      { tab: "playground", label: "Playground", desc: "Injection, chunking, reranker" },
    ],
  },
  {
    id: "aipm",
    title: "AI Product Manager",
    color: "#22c55e",
    tagline: "Write better PRDs, prioritize AI features, handle stakeholders, and ship confidently.",
    duration: "~4 hrs",
    steps: [
      { tab: "concepts", label: "Concepts", desc: "What LLMs actually do" },
      { tab: "aipm",     label: "AIPM",     desc: "PRD, roadmap, launch checklist" },
      { tab: "systems",  label: "Systems",  desc: "Evals, cost, should-you-AI?" },
      { tab: "career",   label: "Career",   desc: "System design + negotiation" },
      { tab: "fluency",  label: "Fluency",  desc: "Mock interview + phrase bank" },
    ],
  },
  {
    id: "interview",
    title: "Interview Prep",
    color: "#f59e0b",
    tagline: "Ace the AI system design round, LLM trivia, and stakeholder communication questions.",
    duration: "~3 hrs",
    steps: [
      { tab: "fluency",  label: "Mock Interview", desc: "18 timed questions" },
      { tab: "career",   label: "System Design",  desc: "3 full design prompts" },
      { tab: "systems",  label: "Systems",        desc: "Observability + fine-tuning" },
      { tab: "playground", label: "Playground",   desc: "Spot hallucinations + bias" },
      { tab: "career",   label: "Negotiation",    desc: "Stakeholder pushback cards" },
    ],
  },
  {
    id: "quickref",
    title: "Quick Reference",
    color: "#ef4444",
    tagline: "No linear path. Jump to any module when you need a fast reminder or decision framework.",
    duration: "Self-directed",
    steps: [
      { tab: "flows",    label: "Flows",          desc: "Visual architecture diagrams" },
      { tab: "systems",  label: "Model Strategy", desc: "Which model, when, why" },
      { tab: "aipm",     label: "Launch Checklist", desc: "Pre-ship safety checklist" },
      { tab: "concepts", label: "Concepts",       desc: "Any concept deep-dive" },
      { tab: "fluency",  label: "Phrase Bank",    desc: "Engineer vocabulary upgrades" },
    ],
  },
];

const MODULE_MAP = [
  {
    group: "LEARN",
    color: "#6366f1",
    desc: "Build the mental model before you build the system.",
    modules: [
      { tab: "concepts", icon: "🧠", title: "Concepts",  desc: "Embeddings, tokenization, attention, transformers, multi-agent architecture — with visual diagrams and interactive sliders." },
      { tab: "flows",    icon: "🌊", title: "Flows",     desc: "Animated SVG diagrams of RAG pipeline, context window, agent loop, guardrail pipeline, and transformer block. Every animation teaches causality." },
    ],
  },
  {
    group: "BUILD",
    color: "#3b82f6",
    desc: "Simulate, break, and fix real production systems.",
    modules: [
      { tab: "lab",        icon: "🔬", title: "RAG Lab",     desc: "Failure mode simulator: stale docs, hallucination, prompt injection, context overflow. Configure and watch the pipeline break in real time." },
      { tab: "systems",    icon: "⚙️", title: "Systems",     desc: "Evals lab, eval frameworks, model strategy, prompt caching, model router, fine-tuning, ML CI/CD, observability, context compaction. 15 production-grade modules." },
      { tab: "playground", icon: "🛝", title: "Playground",  desc: "Hands-on: craft injection attacks, compare chunking strategies, rerank retrieved chunks, spot hallucinated facts, detect bias." },
      { tab: "explore",    icon: "🔭", title: "Explore",     desc: "Embedding explorer, shadow A/B, latency planner, tokenizer, model card reader, vector DB comparison, red teaming lab. 7 tools." },
    ],
  },
  {
    group: "GROW",
    color: "#22c55e",
    desc: "Communicate, ship, and advance your career.",
    modules: [
      { tab: "fluency", icon: "💬", title: "Fluency Gym",  desc: "Upgrade how you talk about AI: phrase bank, timed drills, mock interview (18 questions, 90s each), company case arena, prompt engineering lab." },
      { tab: "aipm",    icon: "📋", title: "AIPM Track",   desc: "PRD simulator, roadmap prioritizer, stakeholder explainer, launch checklist, 'AI or not?' decision framework. PM-specific interactive modules." },
      { tab: "career",  icon: "🚀", title: "Career Track", desc: "System design interviews, take-home challenges (rank outputs, fix prompts, design evals), negotiation flashcards, benchmark literacy." },
    ],
  },
];

const STATS = [
  { value: "3",    label: "Learning tracks",      sub: "Engineer · PM · Interview" },
  { value: "75+",  label: "Modules",              sub: "Across 11 tabs"            },
  { value: "200+", label: "Challenges",           sub: "All interactive"           },
];

export default function HomePage({ onNavigate, visited = new Set() }) {
  const [activePath, setActivePath] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [betaBannerDismissed, setBetaBannerDismissed] = useState(() => {
    try { return localStorage.getItem("genai_beta_banner_dismissed") === "1"; } catch { return false; }
  });

  useEffect(() => { track("home_viewed", {}); }, []);

  function dismissBetaBanner() {
    setBetaBannerDismissed(true);
    try { localStorage.setItem("genai_beta_banner_dismissed", "1"); } catch {}
  }

  function pathProgress(path) {
    const visited_count = path.steps.filter(s => visited.has(s.tab)).length;
    return { visited: visited_count, total: path.steps.length };
  }

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* ── COMMUNITY BETA BANNER ────────────────────────────────────────── */}
      {!betaBannerDismissed && (
        <div className="border-b border-violet-900/40 bg-violet-950/20">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-violet-300 leading-relaxed">
              <span className="font-bold text-violet-200">Community beta:</span> this lab is free while we improve it. Try a module, break something, and tell us what confused you.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track("feedback_clicked", { location: "beta_banner" })}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all">
                Give Feedback
              </a>
              <button onClick={dismissBetaBanner} className="text-violet-500 hover:text-violet-300 text-xs px-2 py-1 transition-all">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center space-y-8">

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            AI systems break<br className="hidden sm:block" /> in production.
            <br />
            <span className="text-violet-400">Learn exactly why.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The interactive lab for AI engineers and PMs — configure RAG pipelines, watch them fail, diagnose the root cause. No backend. No login. No fluff.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => { track("start_here_clicked", { location: "hero_cta" }); onNavigate("concepts"); }}
            className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/40">
            Start Here — AI Engineer Path →
          </button>
          <button
            onClick={() => onNavigate("fluency")}
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-medium text-sm transition-all">
            Quick: Mock Interview
          </button>
        </div>

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Free · Static · No login · No backend
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 pt-2">
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white tabular-nums">{s.value}</div>
              <div className="text-xs font-semibold text-zinc-300 mt-1">{s.label}</div>
              <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Failure mode preview strip */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            { label: "Stale retrieval",     color: "#ef4444" },
            { label: "Prompt injection",    color: "#f59e0b" },
            { label: "Context overflow",    color: "#6366f1" },
            { label: "Hallucination",       color: "#3b82f6" },
            { label: "Multi-hop failure",   color: "#22c55e" },
          ].map(f => (
            <button key={f.label} onClick={() => onNavigate("lab")}
              className="px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all hover:opacity-80"
              style={{ color: f.color, borderColor: f.color + "40", background: f.color + "10" }}>
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600 font-mono -mt-4">↑ click any failure mode to open the RAG Lab</p>
      </div>

      {/* ── START HERE JOURNEY ──────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-zinc-900 border border-violet-800/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-0.5">Recommended first journey</p>
              <h3 className="text-sm font-black text-white">From Tokens to Production Failures — ~45 min</h3>
            </div>
            <button onClick={() => { track("start_here_clicked", { location: "journey_strip" }); onNavigate("concepts"); }}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shrink-0">
              Begin →
            </button>
          </div>
          <div className="flex items-start gap-0 overflow-x-auto pb-1 scrollbar-hide">
            {START_HERE_PATH.map((s, i) => (
              <div key={s.step} className="flex items-center shrink-0">
                <button onClick={() => onNavigate(s.tab)}
                  className="flex flex-col items-center gap-1 px-3 hover:opacity-80 transition-opacity group min-w-[72px]">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-600/50 flex items-center justify-center text-xs font-black text-violet-400 group-hover:bg-violet-600/40 transition-all">{s.step}</div>
                  <span className="text-[10px] font-bold text-white text-center leading-tight">{s.label}</span>
                  <span className="text-[9px] text-zinc-600 text-center leading-tight">{s.desc}</span>
                </button>
                {i < START_HERE_PATH.length - 1 && (
                  <div className="w-6 h-px bg-violet-900/60 shrink-0 mb-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LEARNING PATHS ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white">Choose Your Path</h2>
          <p className="text-sm text-zinc-500">Each path is a curated sequence through the lab — or ignore them and explore freely.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEARNING_PATHS.map(path => {
            const prog = pathProgress(path);
            const pct = Math.round((prog.visited / prog.total) * 100);
            return (
            <div key={path.id}
              className={`bg-zinc-900 border rounded-2xl p-5 cursor-pointer transition-all ${activePath === path.id ? "scale-[1.01] shadow-lg" : "hover:border-zinc-600"}`}
              style={{ borderColor: activePath === path.id ? path.color : "#3f3f46" }}
              onClick={() => setActivePath(activePath === path.id ? null : path.id)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: path.color }}>{path.duration}</p>
                  <h3 className="text-lg font-black text-white">{path.title}</h3>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: path.color + "22" }}>
                  <span style={{ color: path.color }}>→</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">{path.tagline}</p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-500">{prog.visited}/{prog.total} steps visited</span>
                  {prog.visited > 0 && <span className="text-xs font-bold" style={{ color: path.color }}>{pct}%</span>}
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: path.color, opacity: pct === 0 ? 0 : 1 }} />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-1.5">
                {path.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: path.color + "22", color: path.color }}>{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white">{step.label}</span>
                      <span className="text-xs text-zinc-500 ml-1.5">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {activePath === path.id && (
                <button
                  onClick={e => { e.stopPropagation(); onNavigate(path.steps[0].tab); }}
                  className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-white transition-all"
                  style={{ backgroundColor: path.color }}>
                  Start with {path.steps[0].label} →
                </button>
              )}
            </div>
            );
          })}
        </div>

        {/* ── MODULE MAP ──────────────────────────────────────────────────── */}
        <div className="space-y-2 pt-4">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl font-black text-white">Every Module — Mapped</h2>
            <p className="text-sm text-zinc-500">Click any module to jump directly to it.</p>
          </div>
          {MODULE_MAP.map(group => (
            <div key={group.group}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2" style={{ color: group.color }}>{group.group}</span>
                <span className="text-xs text-zinc-600 hidden sm:inline">{group.desc}</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {group.modules.map(m => (
                  <button key={m.tab}
                    onClick={() => onNavigate(m.tab)}
                    className="text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-sm font-bold text-white group-hover:text-white">{m.title}</span>
                      <span className="ml-auto text-zinc-700 group-hover:text-zinc-400 text-xs">→</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">How to use this lab</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "1", title: "Pick a path or module", desc: "Follow a learning path for structure, or jump to any module for what you need right now." },
              { n: "2", title: "Read the objective first", desc: "Every module shows what skill you're building before you start. Don't skip it — it frames everything." },
              { n: "3", title: "Do the challenges, not just read", desc: "The learning is in the doing. Answer questions before revealing answers. Score yourself honestly." },
            ].map(s => (
              <div key={s.n} className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-black text-white">{s.n}</div>
                <p className="text-sm font-bold text-white">{s.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT THIS LAB ────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">About this lab</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            GenAI Systems Lab is a static, zero-backend learning tool — no API calls, no live model, no login required. Everything runs entirely in your browser.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { tw: "emerald", color: "#22c55e", badge: "✓ Mathematically faithful", desc: "Real algorithm logic on toy inputs. Tokenizer, sampling, and cost models fall here." },
              { tw: "amber",   color: "#f59e0b", badge: "~ Simplified",              desc: "Correct pattern, simplified scale. Attention, transformer, and agent trace — real concepts, not frontier-model internals." },
              { tw: "zinc",    color: "#71717a", badge: "◌ Conceptual",              desc: "Illustrative only. Embedding Space uses precomputed 2D coords, not live model embeddings. Useful for intuition, not introspection." },
            ].map(t => (
              <div key={t.badge} className="rounded-xl p-3 space-y-2 bg-zinc-800/50 border border-zinc-700/50">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-block" style={{ color: t.color, background: t.color + "20" }}>{t.badge}</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            RAG Lab scenarios are curated from real production failure patterns. The goal throughout is <em className="text-zinc-500">systems intuition</em> — not exact model introspection.
          </p>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <div className="text-center pt-4 space-y-3">
          <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer"
            onClick={() => track("feedback_clicked", { location: "footer" })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:border-violet-700 text-xs font-mono text-zinc-500 hover:text-violet-400 transition-all">
            💬 Give feedback on this lab
          </a>
          <p className="text-xs text-zinc-600">GenAI Systems Lab · Free · Static · Built with React + Vite + Tailwind</p>
          <p className="text-[11px] text-zinc-700 max-w-lg mx-auto leading-relaxed">
            This app uses lightweight analytics to understand which modules are useful. No login is required. Feedback is optional. Do not submit sensitive personal information in the feedback form.
          </p>
        </div>
      </div>
    </div>
  );
}
