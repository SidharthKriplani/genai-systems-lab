import { useState, useEffect } from "react";
import { track, isPreviewUnlocked } from "./analytics";
import { MODULE_CATALOG, LOCKED_TABS } from "./utils/contentAudit";

const TAB_META = {
  concepts:   { label: "Concepts",   color: "#6366f1" },
  flows:      { label: "Flows",      color: "#8b5cf6" },
  lab:        { label: "RAG Lab",    color: "#3b82f6" },
  agents:     { label: "Agents",     color: "#06b6d4" },
  playground: { label: "Playground", color: "#22c55e" },
  explore:    { label: "Explore",    color: "#f59e0b" },
  systems:    { label: "Systems",    color: "#ef4444" },
  fluency:    { label: "Fluency",    color: "#ec4899" },
  aipm:       { label: "AIPM",       color: "#f97316" },
  career:     { label: "Career",     color: "#84cc16" },
};

const LOCKED_TRACK_INFO = {
  systems: {
    icon: "⚙️",
    audience: "Engineers · PMs",
    count: 15,
    teaser: [
      "Evals lab + RAGAS, G-Eval, custom grading frameworks",
      "Model strategy, cost & latency optimisation",
      "Fine-tuning, prompt caching, model router",
      "Observability, ML CI/CD, context compaction",
    ],
  },
  fluency: {
    icon: "💬",
    audience: "Interview prep",
    count: 5,
    teaser: [
      "Mock interview — 18 questions, 90s each",
      "Company case arena (live scenario drills)",
      "Timed vocabulary + phrase bank",
      "Prompt engineering lab",
    ],
  },
  aipm: {
    icon: "📋",
    audience: "Product managers",
    count: 5,
    teaser: [
      "PRD simulator with AI feature scoping",
      "Roadmap prioritizer",
      "Stakeholder explainer toolkit",
      "AI-or-not? decision framework",
    ],
  },
  career: {
    icon: "🚀",
    audience: "Job seekers",
    count: 4,
    teaser: [
      "Full system design interview prompts",
      "Take-home challenge simulator",
      "Negotiation flashcards",
      "Benchmark literacy",
    ],
  },
};

const TAB_FILTERS = [
  { id: "all",        label: "All" },
  { id: "concepts",   label: "Concepts" },
  { id: "flows",      label: "Flows" },
  { id: "lab",        label: "RAG Lab" },
  { id: "agents",     label: "Agents" },
  { id: "playground", label: "Playground" },
  { id: "explore",    label: "Explore" },
];

export default function Library({ onNavigate, onOpenModule, visitedModules = new Set() }) {
  const [tabFilter, setTabFilter] = useState("all");
  const [showLocked, setShowLocked] = useState(true);
  const previewUnlocked = isPreviewUnlocked();

  useEffect(() => { track("library_viewed", {}); }, []);

  const freeModules = MODULE_CATALOG.filter(m =>
    m.tab !== "home" &&
    !LOCKED_TABS.has(m.tab) &&
    (tabFilter === "all" || m.tab === tabFilter)
  );

  function handleOpen(m) {
    track("library_module_opened", { tab: m.tab, moduleId: m.moduleId });
    if (onOpenModule && m.supportsDirectNav && m.moduleId) {
      onOpenModule(m.tab, m.moduleId);
    } else {
      onNavigate(m.tab);
    }
  }

  // Group free modules by tab for display
  const grouped = TAB_FILTERS.slice(1).reduce((acc, f) => {
    const mods = freeModules.filter(m => m.tab === f.id);
    if (mods.length) acc.push({ tabId: f.id, label: f.label, modules: mods });
    return acc;
  }, []);

  const displayModules = tabFilter === "all" ? grouped : grouped.filter(g => g.tabId === tabFilter);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-2">
              Full module browser
            </p>
            <h1 className="text-2xl font-black text-white mb-2">Library</h1>
            <p className="text-sm text-zinc-400">
              All modules. Filter by section or browse the full catalog.
            </p>
          </div>
          {previewUnlocked && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-full px-3 py-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              preview unlocked
            </span>
          )}
        </div>

        {/* Tab filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TAB_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setTabFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                tabFilter === f.id
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
              }`}>
              {f.label}
              {f.id !== "all" && (
                <span className="ml-1.5 text-[9px] opacity-50">
                  {MODULE_CATALOG.filter(m => m.tab === f.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Free module groups */}
        <div className="space-y-8 mb-12">
          {displayModules.map(group => {
            const meta = TAB_META[group.tabId] || {};
            return (
              <div key={group.tabId}>
                {tabFilter === "all" && (
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{
                        color: meta.color,
                        background: (meta.color || "#6366f1") + "22",
                        border: `1px solid ${(meta.color || "#6366f1")}44`,
                      }}>
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.modules.map(m => {
                    const isVisited = visitedModules.has(`${m.tab}:${m.moduleId}`);
                    return (
                      <button
                        key={`${m.tab}:${m.moduleId}`}
                        onClick={() => handleOpen(m)}
                        className={`text-left rounded-xl border p-3.5 transition-all hover:border-zinc-600 group ${
                          isVisited
                            ? "border-zinc-700 bg-zinc-900/60"
                            : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60"
                        }`}>
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">
                            {m.title}
                          </span>
                          {isVisited && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" title="Visited" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-zinc-600 font-mono">
                            {m.audience}
                          </span>
                          {m.hasChallenge && (
                            <span className="text-[8px] font-mono text-zinc-700 border border-zinc-800 rounded px-1">
                              challenge
                            </span>
                          )}
                          {m.hasReflection && (
                            <span className="text-[8px] font-mono text-zinc-700 border border-zinc-800 rounded px-1">
                              reflect
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked / coming later section */}
        <div className="border-t border-zinc-800 pt-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Coming in later beta waves
              </p>
              <p className="text-xs text-zinc-700 mt-0.5">
                These tracks are in progression and will expand the beta later.
              </p>
            </div>
            <button
              onClick={() => setShowLocked(s => !s)}
              className="text-xs text-zinc-600 hover:text-zinc-400 font-mono transition-all shrink-0">
              {showLocked ? "hide ↑" : "show ↓"}
            </button>
          </div>

          {showLocked && (
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              {Object.entries(LOCKED_TRACK_INFO).map(([tabId, info]) => {
                const meta = TAB_META[tabId] || {};
                const canOpen = previewUnlocked;
                return (
                  <div
                    key={tabId}
                    onClick={() => canOpen && onNavigate(tabId)}
                    className={`rounded-xl border border-zinc-800 p-4 transition-all ${
                      canOpen
                        ? "opacity-100 hover:border-zinc-700 cursor-pointer"
                        : "opacity-50 cursor-default"
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{info.icon}</span>
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{
                            color: meta.color,
                            background: (meta.color || "#6366f1") + "22",
                            border: `1px solid ${(meta.color || "#6366f1")}44`,
                          }}>
                          {meta.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600">
                        {info.count} modules
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-700 font-mono mb-2">For: {info.audience}</p>
                    <div className="space-y-1">
                      {info.teaser.map((t, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-zinc-600">
                          <span className="text-zinc-700 shrink-0 mt-0.5">—</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                    {canOpen && (
                      <div className="mt-3 text-xs text-emerald-400 font-mono">
                        ↳ preview unlocked — click to open
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer escape hatches */}
        <div className="mt-10 text-center text-xs text-zinc-600 font-mono space-x-3">
          <button
            className="text-zinc-400 hover:text-white transition-colors underline"
            onClick={() => onNavigate("starthere")}>
            ← Guided path
          </button>
          <span>·</span>
          <button
            className="text-zinc-400 hover:text-white transition-colors underline"
            onClick={() => onNavigate("labs")}>
            Labs →
          </button>
          <span>·</span>
          <span>⌘K to search</span>
        </div>

      </div>
    </div>
  );
}
