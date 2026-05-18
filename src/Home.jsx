import { useState } from "react";

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
      { tab: "systems",    icon: "⚙️", title: "Systems",     desc: "Evals lab, model strategy, incident room, cost/latency tradeoffs, fine-tuning lab, observability, A/B testing. 8 production-grade modules." },
      { tab: "playground", icon: "🛝", title: "Playground",  desc: "Hands-on: craft injection attacks, compare chunking strategies, rerank retrieved chunks, spot hallucinated facts, detect bias." },
      { tab: "explore",    icon: "🔭", title: "Explore",     desc: "Embedding space visualization, shadow mode A/B simulator, latency budget planner, tokenizer explorer, model card reader." },
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
  { value: "3",    label: "Learning tracks" },
  { value: "10",   label: "Tabs" },
  { value: "55+",  label: "Modules" },
  { value: "200+", label: "Interactive challenges" },
];

export default function HomePage({ onNavigate }) {
  const [activePath, setActivePath] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          Free · Static · No login · No backend
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          GenAI Systems Lab
        </h1>
        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The interactive learning platform for AI engineers and product managers who want to build, ship, and speak about AI systems with precision.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Architecture diagram — simple SVG fortress */}
        <div className="relative mx-auto mt-8" style={{ maxWidth: 560 }}>
          <svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" className="w-full">
            {/* Connection lines */}
            <line x1="100" y1="100" x2="200" y2="60"  stroke="#6366f1" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,4"/>
            <line x1="100" y1="100" x2="200" y2="100" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,4"/>
            <line x1="100" y1="100" x2="200" y2="140" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,4"/>
            <line x1="300" y1="60"  x2="400" y2="60"  stroke="#22c55e" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,4"/>
            <line x1="300" y1="100" x2="400" y2="100" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,4"/>
            <line x1="300" y1="140" x2="400" y2="140" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,4"/>
            <line x1="200" y1="60"  x2="300" y2="60"  stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"/>
            <line x1="200" y1="100" x2="300" y2="100" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"/>
            <line x1="200" y1="140" x2="300" y2="140" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"/>
            {/* LEARN group */}
            <rect x="160" y="40"  width="80" height="28" rx="6" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="200" y="58" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontFamily="monospace">LEARN</text>
            <rect x="160" y="86"  width="80" height="28" rx="6" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="200" y="104" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontFamily="monospace">Concepts</text>
            <rect x="160" y="126" width="80" height="28" rx="6" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="200" y="144" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontFamily="monospace">Flows</text>
            {/* BUILD group */}
            <rect x="260" y="40"  width="80" height="28" rx="6" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="300" y="58"  textAnchor="middle" fill="#93c5fd" fontSize="10" fontFamily="monospace">RAG Lab</text>
            <rect x="260" y="86"  width="80" height="28" rx="6" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="300" y="104" textAnchor="middle" fill="#93c5fd" fontSize="10" fontFamily="monospace">Systems</text>
            <rect x="260" y="126" width="80" height="28" rx="6" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="300" y="144" textAnchor="middle" fill="#93c5fd" fontSize="10" fontFamily="monospace">Playground</text>
            {/* GROW group */}
            <rect x="360" y="40"  width="80" height="28" rx="6" fill="#22c55e" fillOpacity="0.15" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="400" y="58"  textAnchor="middle" fill="#86efac" fontSize="10" fontFamily="monospace">Fluency</text>
            <rect x="360" y="86"  width="80" height="28" rx="6" fill="#22c55e" fillOpacity="0.15" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="400" y="104" textAnchor="middle" fill="#86efac" fontSize="10" fontFamily="monospace">AIPM</text>
            <rect x="360" y="126" width="80" height="28" rx="6" fill="#22c55e" fillOpacity="0.15" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.6"/>
            <text x="400" y="144" textAnchor="middle" fill="#86efac" fontSize="10" fontFamily="monospace">Career</text>
            {/* You node */}
            <circle cx="80" cy="100" r="28" fill="#09090b" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3"/>
            <text x="80" y="96"  textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">YOU</text>
            <text x="80" y="109" textAnchor="middle" fill="#71717a" fontSize="8" fontFamily="monospace">start here</text>
            {/* Output node */}
            <circle cx="490" cy="100" r="28" fill="#09090b" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.5"/>
            <text x="490" y="96"  textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold" fontFamily="monospace">SHIP</text>
            <text x="490" y="109" textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace">confidently</text>
            <line x1="460" y1="100" x2="462" y2="100" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,3"/>
            <line x1="440" y1="60"  x2="462" y2="90"  stroke="#22c55e" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3,3"/>
            <line x1="440" y1="140" x2="462" y2="110" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3,3"/>
          </svg>
        </div>
      </div>

      {/* ── LEARNING PATHS ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white">Choose Your Path</h2>
          <p className="text-sm text-zinc-500">Each path is a curated sequence through the lab — or ignore them and explore freely.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEARNING_PATHS.map(path => (
            <div key={path.id}
              className={`bg-zinc-900 border rounded-2xl p-5 cursor-pointer transition-all ${activePath === path.id ? "scale-100" : "hover:border-zinc-600"}`}
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
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">{path.tagline}</p>

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
          ))}
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

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <div className="text-center pt-4">
          <p className="text-xs text-zinc-600">GenAI Systems Lab · Free · Open Source · Built with React + Vite + Tailwind</p>
          <p className="text-xs text-zinc-700 mt-1">Zero backend. Zero cost. Everything runs in your browser.</p>
        </div>
      </div>
    </div>
  );
}
