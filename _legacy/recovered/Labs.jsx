import { useEffect } from "react";
import { track } from "./analytics";

const LABS = [
  {
    id: "lab",
    icon: "🔬",
    title: "RAG Failure Lab",
    tagLabel: "Most popular",
    tagColor: "#6366f1",
    audience: "Engineers",
    desc: "Configure RAG pipelines and watch them fail. 6 production failure scenarios — stale documents, prompt injection, context overflow, multi-hop reasoning failures. The strongest module in the app.",
    cta: "Open RAG Lab →",
    note: null,
  },
  {
    id: "agents",
    icon: "🤖",
    title: "Agents Lab",
    tagLabel: "Interactive",
    tagColor: "#3b82f6",
    audience: "Engineers",
    desc: "ReAct pattern, tool use design, memory types, multi-agent orchestration, failure modes, and planning. Includes an interactive agent loop simulator with step-through traces.",
    cta: "Open Agents Lab →",
    note: null,
  },
  {
    id: "playground",
    icon: "🛝",
    title: "Playground",
    tagLabel: "Hands-on",
    tagColor: "#22c55e",
    audience: "All levels",
    desc: "Craft prompt injection attacks, compare chunking strategies, rerank retrieved chunks, spot hallucinated facts, and detect bias in model outputs.",
    cta: "Open Playground →",
    note: null,
  },
  {
    id: "explore",
    icon: "🔭",
    title: "Explore Tools",
    tagLabel: "Tools",
    tagColor: "#f59e0b",
    audience: "Engineers",
    desc: "Embedding space visualiser, shadow A/B testing model, tokeniser explorer, vector DB comparison, red teaming lab. 8 standalone tools.",
    cta: "Open Explore →",
    note: null,
  },
  {
    id: "concepts",
    icon: "🐛",
    title: "Debug This RAG System",
    tagLabel: "Inside Concepts",
    tagColor: "#8b5cf6",
    audience: "Engineers",
    desc: "Diagnose 5 real RAG incidents. Identify the failure mode from symptoms, propose a fix, see the correct answer.",
    cta: "Open Concepts →",
    note: "Select 'Debug This RAG System' inside the Concepts tab.",
  },
];

export default function Labs({ onNavigate }) {
  useEffect(() => { track("labs_viewed", {}); }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">
            Interactive practice
          </p>
          <h1 className="text-2xl font-black text-white mb-2">Labs</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Hands-on failure scenarios, agent simulators, playgrounds, and debugging tools.
          </p>
        </div>

        {/* Lab cards */}
        <div className="space-y-4 mb-10">
          {LABS.map(lab => (
            <div
              key={lab.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-start gap-4 hover:border-zinc-700 transition-all group">
              <div className="text-2xl shrink-0 mt-0.5">{lab.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-bold text-white">{lab.title}</span>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      color: lab.tagColor,
                      background: lab.tagColor + "22",
                      border: `1px solid ${lab.tagColor}44`,
                    }}>
                    {lab.tagLabel}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    For: {lab.audience}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-2">{lab.desc}</p>
                {lab.note && (
                  <p className="text-[10px] font-mono text-zinc-600 bg-zinc-800/50 rounded px-2 py-1 inline-block">
                    ↳ {lab.note}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  track("labs_card_clicked", { lab: lab.id });
                  onNavigate(lab.id);
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all whitespace-nowrap self-start">
                {lab.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div className="text-center text-xs text-zinc-600 font-mono space-x-3">
          <span>New to GenAI?</span>
          <button
            className="text-zinc-400 hover:text-white transition-colors underline"
            onClick={() => onNavigate("starthere")}>
            Start Here →
          </button>
          <span>·</span>
          <button
            className="text-zinc-400 hover:text-white transition-colors underline"
            onClick={() => onNavigate("library")}>
            Browse all modules →
          </button>
        </div>

      </div>
    </div>
  );
}
