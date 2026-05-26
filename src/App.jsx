import React, { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { initAnalytics, track, FEEDBACK_URL, isFeedbackReady, checkPreviewUnlock } from "./analytics";
import WarRoom from "./WarRoom";
import HomePage from "./Home";
import HowTo from "./HowTo"; // small, used inside RAG Lab — not lazy
import { POSTS as GT_POSTS } from "./groundTruthIndex"; // lightweight metadata — no content bodies

// Heavy tab components — lazy-loaded on first visit to keep initial bundle small
const GroundTruth    = lazy(() => import("./GroundTruth"));
const QADashboard    = lazy(() => import("./QADashboard"));
const ConceptsApp    = lazy(() => import("./Concepts"));
const SystemsApp     = lazy(() => import("./Systems"));
const FluencyApp     = lazy(() => import("./Fluency"));
const FlowsApp       = lazy(() => import("./Flows"));
const AIPMApp        = lazy(() => import("./AIPM"));
const PlaygroundApp  = lazy(() => import("./Playground"));
const CareerApp      = lazy(() => import("./Career"));
const ExploreApp     = lazy(() => import("./Explore"));
const AgentsApp      = lazy(() => import("./Agents"));
const ConsultationApp = lazy(() => import("./Consultation"));
const PrepLabApp      = lazy(() => import("./PrepLab"));
const LearningPathsApp = lazy(() => import("./LearningPaths"));

import { ALL_SCENARIOS, SCENARIO_DIMENSIONS, SCORE_TIERS, lookupResult, gradeChallenge } from "./ragScenarios";

function pct(v) { return (v * 100).toFixed(0) + "%"; }

// ─── STYLES ───────────────────────────────────────────────────────────────────

const CHUNK_LABEL_COLORS = {
  correct:    { bg: "bg-emerald-950", border: "border-emerald-500", text: "text-emerald-400", badge: "bg-emerald-900 text-emerald-300" },
  stale:      { bg: "bg-amber-950",   border: "border-amber-500",   text: "text-amber-400",   badge: "bg-amber-900 text-amber-300" },
  irrelevant: { bg: "bg-zinc-900",    border: "border-zinc-600",    text: "text-zinc-400",     badge: "bg-zinc-800 text-zinc-400" },
  malicious:  { bg: "bg-red-950",     border: "border-red-500",     text: "text-red-400",      badge: "bg-red-900 text-red-300" },
  partial:    { bg: "bg-sky-950",     border: "border-sky-600",     text: "text-sky-400",      badge: "bg-sky-900 text-sky-300" },
};

const RISK_COLORS = {
  low:      "text-emerald-400 bg-emerald-950 border-emerald-700",
  medium:   "text-amber-400 bg-amber-950 border-amber-700",
  high:     "text-orange-400 bg-orange-950 border-orange-700",
  critical: "text-red-400 bg-red-950 border-red-700",
};

const METRIC_BAR_COLOR = (v, high = false) => {
  if (high) return v > 800 ? "bg-amber-500" : "bg-emerald-500";
  if (v >= 0.9) return "bg-emerald-500";
  if (v >= 0.75) return "bg-amber-500";
  return "bg-red-500";
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${value ? "bg-violet-600" : "bg-zinc-700"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function Pill({ options, value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value ?? o}
          onClick={() => onChange(o.value ?? o)}
          className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
            (o.value ?? o) === value ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          }`}
        >
          {o.label ?? o}
        </button>
      ))}
    </div>
  );
}

function MetricBar({ label, value, max = 1, isMs = false, isCost = false }) {
  const p = isMs ? Math.min((value / 2000) * 100, 100) : Math.min((value / max) * 100, 100);
  const color = isMs || isCost ? METRIC_BAR_COLOR(value, true) : METRIC_BAR_COLOR(value);
  const display = isMs ? value + "ms" : isCost ? "$" + value.toFixed(3) : (value * 100).toFixed(0) + "%";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-white">{display}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: p + "%" }} />
      </div>
    </div>
  );
}

function ChunkCard({ chunk, index }) {
  const c = CHUNK_LABEL_COLORS[chunk.label] || CHUNK_LABEL_COLORS.partial;
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3 space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-mono text-zinc-500">#{index + 1}</span>
        <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide ${c.badge}`}>{chunk.label}</span>
      </div>
      <p className={`text-sm leading-relaxed ${c.text}`}>{chunk.text}</p>
      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>{chunk.source}</span>
        <span>{chunk.date} · score: {chunk.relevance_score.toFixed(2)}</span>
      </div>
    </div>
  );
}

function TierBadge({ tier, size = "sm" }) {
  const t = SCORE_TIERS[tier] || SCORE_TIERS.analyst_ready;
  const sz = size === "lg"
    ? "text-sm px-2.5 py-1 font-black"
    : "text-[10px] px-1.5 py-0.5 font-bold";
  return (
    <span className={`${sz} rounded font-mono border ${t.color} ${t.border}`}
      style={{ background: "transparent" }}>
      {t.emoji} {t.label}
    </span>
  );
}

function ChallengeResult({ grade, scenarioTitle, scenario, onNavigate }) {
  const [copied, setCopied] = useState(false);
  if (!grade) return null;
  const tier = SCORE_TIERS[grade.tier] || SCORE_TIERS.analyst_ready;

  function shareScenarioSolve() {
    const text = [
      `${tier.emoji} Just scored "${tier.label}" on "${scenarioTitle}" — GenAI Systems Lab`,
      ``,
      `The RAG Lab makes you configure a production pipeline, watch it fail, and find the fix.`,
      `Free — no login: genai-systems-lab-ivory.vercel.app`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      track("scenario_solve_shared", { scenario: scenarioTitle, tier: grade.tier });
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${tier.border} ${tier.bg}`}>
      {/* Tier reveal */}
      <div className="text-center space-y-1.5 pb-3 border-b border-zinc-800">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Config Level</div>
        <div className={`text-2xl font-black tracking-tight ${tier.color}`}>{tier.label}</div>
        <div className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">{tier.desc}</div>
      </div>
      {/* Criteria breakdown */}
      <div className="space-y-1.5">
        {grade.checks.map((ch, i) => (
          <div key={i} className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className={ch.passed ? "text-emerald-400" : "text-red-400"}>{ch.passed ? "✓" : "✗"}</span>
              <span className="text-zinc-300">{ch.label}</span>
            </span>
            <span className={ch.passed ? "text-emerald-400" : "text-red-400"}>{ch.actual}</span>
          </div>
        ))}
      </div>
      {/* Debrief link — read the full GT post on this failure mode */}
      {scenario?.gtPost && onNavigate && (
        <button
          onClick={() => onNavigate({ tab: "groundtruth", postId: scenario.gtPost })}
          className="w-full py-2 rounded-lg border border-blue-800/50 bg-blue-950/20 hover:border-blue-600/60 hover:bg-blue-950/40 text-xs font-mono text-blue-400 hover:text-blue-300 transition-all flex items-center justify-center gap-2">
          Read the full post on this failure mode →
        </button>
      )}
      {/* Share — always visible, more neutral color */}
      <button onClick={shareScenarioSolve}
        className="w-full py-2 rounded-lg border border-zinc-700/50 hover:border-zinc-500 text-xs font-mono text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2">
        {copied ? "✓ Copied!" : "📤 Share this result"}
      </button>
    </div>
  );
}

// ─── COLLAPSIBLE CONFIG CARD ─────────────────────────────────────────────────

function CollapsibleConfigCard({ cfg }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 flex-wrap hover:bg-zinc-800/40 transition-colors"
      >
        <span className="text-xs font-mono text-violet-400">{cfg.label}</span>
        <span className="text-xs text-zinc-600 font-mono">{cfg.chunk_size} · top_k={cfg.top_k} · reranker={cfg.reranker ? "on" : "off"} · {cfg.answer_policy}</span>
        {cfg.failure_mode
          ? <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded font-mono">{cfg.failure_mode}</span>
          : <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded font-mono">no failure</span>
        }
        <span className="ml-auto text-zinc-600 text-xs font-mono">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-zinc-800 pt-3 space-y-1.5">
          <p className="text-xs text-zinc-300 leading-relaxed">{cfg.system_design_lesson}</p>
          {cfg.suggested_fix && <p className="text-xs text-zinc-500 leading-relaxed mt-1">Fix: {cfg.suggested_fix}</p>}
        </div>
      )}
    </div>
  );
}

// ─── CORPUS PANEL ────────────────────────────────────────────────────────────

function CorpusPanel({ scenario }) {
  const [open, setOpen] = useState(false);
  // collect unique sources from all configs
  const sources = [...new Map(
    scenario.configs.flatMap(c => c.retrieved_chunks).map(ch => [ch.source, ch])
  ).values()].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Corpus</div>
        {sources.length > 0 && (
          <button onClick={() => setOpen(o => !o)} className="text-[10px] font-mono text-zinc-600 hover:text-zinc-300 border border-zinc-700 rounded px-1.5 py-0.5 transition-all">
            {open ? "hide docs" : `peek docs (${sources.length})`}
          </button>
        )}
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">{scenario.corpus_description}</p>
      {open && (
        <div className="space-y-1.5 pt-1 border-t border-zinc-800">
          {sources.map(s => (
            <div key={s.source} className="flex items-start gap-2 text-[10px] font-mono">
              <span className="text-zinc-600 shrink-0">📄</span>
              <div>
                <span className="text-zinc-300">{s.source}</span>
                <span className="text-zinc-600 ml-1.5">{s.date}</span>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-zinc-600 pt-0.5 italic">Documents visible to the retriever — your config determines which get surfaced.</p>
        </div>
      )}
    </div>
  );
}

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────

class TabErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div className="flex-1 flex items-center justify-center p-12 text-center">
        <div className="space-y-3">
          <div className="text-2xl">⚠️</div>
          <p className="text-white font-bold text-sm">Something went wrong loading this tab</p>
          <p className="text-zinc-500 text-xs font-mono">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg mt-2">
            Try again
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

// ─── LEADERBOARD VIEW ────────────────────────────────────────────────────────

function LeaderboardView({ leaderboard, onClear, onRetry }) {
  const [copied, setCopied] = useState(false);

  function shareScore(solved, passed, total) {
    const lines = [
      `🏆 GenAI Systems Lab — my score`,
      `✅ ${solved}/6 scenarios solved`,
      `📊 ${passed}/${total} attempts passed`,
      ``,
      `Free interactive platform for AI engineers & PMs`,
      `→ genai-systems-lab-ivory.vercel.app`,
    ];
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (leaderboard.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="text-5xl mb-4">🏆</div>
        <div className="text-lg font-bold text-zinc-400">No scores yet</div>
        <p className="text-sm text-zinc-600">Go to RAG Lab → enable Challenge Mode → submit a passing config to get on the board.</p>
        <button onClick={() => onRetry("lab")} className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-sm transition-all">
          Go to RAG Lab →
        </button>
      </div>
    );
  }

  const tierRank = t => SCORE_TIERS[t]?.rank || 0;
  const byScenario = ALL_SCENARIOS.map(s => {
    const entries = leaderboard.filter(e => e.scenarioId === s.scenario_id);
    const bestTier = entries.reduce((best, e) => {
      if (!e.tier) return best;
      return !best || tierRank(e.tier) > tierRank(best) ? e.tier : best;
    }, null);
    return { ...s, entries, bestPassed: entries.some(e => e.passed), bestTier };
  });
  const solved = byScenario.filter(s => s.bestPassed).length;
  const passed = leaderboard.filter(e => e.passed).length;
  const allSolved = solved === ALL_SCENARIOS.length;

  // Dimension-level scoring
  const dims = ["Retrieval Quality", "Query Handling", "Security & Safety", "Reasoning"];
  const dimColors = { "Retrieval Quality": "#6366f1", "Query Handling": "#3b82f6", "Security & Safety": "#ef4444", "Reasoning": "#22c55e" };
  const dimScores = dims.map(dim => {
    const dimScenarios = ALL_SCENARIOS.filter(s => SCENARIO_DIMENSIONS[s.scenario_id]?.dim === dim);
    const dimSolved = dimScenarios.filter(s => byScenario.find(b => b.scenario_id === s.scenario_id)?.bestPassed).length;
    return { dim, solved: dimSolved, total: dimScenarios.length, color: dimColors[dim] };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

      {/* All scenarios solved — achievement banner */}
      {allSolved && (
        <div className="rounded-xl border border-emerald-700/60 bg-emerald-950/20 p-4 text-center space-y-2">
          <div className="text-2xl">🏆</div>
          <div className="text-sm font-black text-emerald-300">All 6 scenarios solved</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            You've diagnosed every production failure mode in the lab. The next step: test your speed and breadth in the <span className="text-white font-bold">AI Systems Readiness Assessment</span> — coming soon.
          </p>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { val: `${solved}/${ALL_SCENARIOS.length}`, label: "Scenarios solved", color: "text-emerald-400" },
          { val: `${passed}/${leaderboard.length}`, label: "Attempts passed", color: "text-violet-400" },
          { val: leaderboard.length, label: "Total attempts", color: "text-amber-400" },
        ].map(({ val, label, color }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4 text-center">
            <div className={`text-xl sm:text-3xl font-bold font-mono ${color}`}>{val}</div>
            <div className="text-[10px] sm:text-xs text-zinc-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Dimension breakdown */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">Skill Dimensions</div>
        {dimScores.map(({ dim, solved: ds, total, color }) => (
          <div key={dim} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-mono">{dim}</span>
              <span className="font-bold" style={{ color }}>{ds}/{total}</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(ds / total) * 100}%`, backgroundColor: color, opacity: ds === 0 ? 0 : 1 }} />
            </div>
          </div>
        ))}
        <p className="text-[10px] text-zinc-600 font-mono pt-1">Based on solved scenarios · solve all 6 to complete every dimension</p>
      </div>

      {/* Share button */}
      <button
        onClick={() => shareScore(solved, passed, leaderboard.length)}
        className="w-full py-2.5 rounded-xl border border-zinc-700 hover:border-violet-600 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2">
        {copied ? "✓ Copied to clipboard!" : "📤 Share your score"}
      </button>

      {/* Per-scenario status */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">Scenario Progress</div>
        {byScenario.map((s, i) => (
          <div key={s.scenario_id} className="flex items-center gap-3 py-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.bestPassed ? "bg-emerald-600 text-white" : s.entries.length > 0 ? "bg-amber-700 text-white" : "bg-zinc-800 text-zinc-500"}`}>
              {s.bestPassed ? "✓" : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono text-zinc-300 truncate">{s.title}</div>
              <div className="text-xs text-zinc-600">{s.entries.length} attempt{s.entries.length !== 1 ? "s" : ""}</div>
            </div>
            {s.bestTier
              ? <TierBadge tier={s.bestTier} />
              : <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-600">OPEN</span>
            }
          </div>
        ))}
      </div>

      {/* History */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Attempt History</div>
          <button onClick={onClear} className="text-xs text-zinc-600 hover:text-red-400 transition-colors font-mono">Clear all</button>
        </div>
        {[...leaderboard].reverse().map((entry, i) => (
          <div key={i} className={`rounded-xl border p-3 ${entry.passed ? "border-emerald-800 bg-emerald-950/10" : "border-zinc-800 bg-zinc-900/40"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {entry.tier
                    ? <TierBadge tier={entry.tier} />
                    : <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${entry.passed ? "border-emerald-700 bg-emerald-900 text-emerald-300" : "border-red-800 bg-red-950 text-red-400"}`}>{entry.passed ? "PASS" : "FAIL"}</span>
                  }
                  <span className="text-xs font-mono text-zinc-300 truncate">{entry.scenario}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-500">
                  <span>chunk={entry.config.chunk_size}</span>
                  <span>top_k={entry.config.top_k}</span>
                  <span>reranker={entry.config.reranker ? "on" : "off"}</span>
                  <span>policy={entry.config.answer_policy}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entry.checks.map((c, j) => (
                    <span key={j} className={`text-xs px-1.5 py-0.5 rounded font-sans ${c.passed ? "bg-emerald-900/60 text-emerald-400" : "bg-red-900/60 text-red-400"}`}>
                      {c.passed ? "✓" : "✗"} {c.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-zinc-600 font-mono shrink-0">{new Date(entry.date).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROGRESS VIEW ────────────────────────────────────────────────────────────

const ALL_TABS = [
  { id: "concepts",    label: "Concepts",    group: "LEARN",  audience: "All levels" },
  { id: "flows",       label: "Diagrams",    group: "LEARN",  audience: "All levels" },
  { id: "groundtruth", label: "Ground Truth",group: "LEARN",  audience: "All levels" },
  { id: "consult",     label: "Search",      group: "LEARN",  audience: "All levels" },
  { id: "lab",         label: "RAG Lab",     group: "BUILD",  audience: "Engineers" },
  { id: "agents",      label: "Agents",      group: "BUILD",  audience: "Engineers" },
  { id: "playground",  label: "Playground",  group: "BUILD",  audience: "All levels" },
  { id: "explore",     label: "Explore",     group: "BUILD",  audience: "Engineers" },
  { id: "systems",     label: "Systems",     group: "BUILD",  audience: "Engineers · PMs" },
  { id: "paths",       label: "Paths",       group: "GROW",   audience: "All levels" },
  { id: "fluency",     label: "Drills",      group: "GROW",   audience: "Interview prep" },
  { id: "preplab",     label: "Prep Lab",    group: "GROW",   audience: "Interview prep" },
  { id: "career",      label: "Career",      group: "GROW",   audience: "Job seekers" },
  { id: "aipm",        label: "AI Product",  group: "GROW",   audience: "Product managers" },
];

const GROUP_COLORS = { LEARN: "#6366f1", BUILD: "#3b82f6", GROW: "#22c55e" };

function ProgressView({ visited, visitedModules, leaderboard, onNavigate, bookmarks = new Set(), toggleBookmark = () => {} }) {
  const tabsVisited = ALL_TABS.filter(t => visited.has(t.id));
  const tabsByGroup = ["LEARN","BUILD","GROW"].map(g => ({
    group: g,
    color: GROUP_COLORS[g],
    tabs: ALL_TABS.filter(t => t.group === g),
    visitedCount: ALL_TABS.filter(t => t.group === g && visited.has(t.id)).length,
  }));

  // RAG challenge stats from leaderboard
  const tierRank = t => SCORE_TIERS[t]?.rank || 0;
  const byScenario = ALL_SCENARIOS.map(s => {
    const entries = leaderboard.filter(e => e.scenarioId === s.scenario_id);
    const bestTier = entries.reduce((best, e) => {
      if (!e.tier) return best;
      return !best || tierRank(e.tier) > tierRank(best) ? e.tier : best;
    }, null);
    return { ...s, entries, bestTier, attempted: entries.length > 0 };
  });
  const solved = byScenario.filter(s => s.bestTier && SCORE_TIERS[s.bestTier]?.rank >= 3).length;
  const attempted = byScenario.filter(s => s.attempted).length;

  // Best overall tier across all attempts
  const bestOverall = leaderboard.reduce((best, e) => {
    if (!e.tier) return best;
    return !best || tierRank(e.tier) > tierRank(best) ? e.tier : best;
  }, null);

  // Suggested next step
  const nextTab = ALL_TABS.find(t => !visited.has(t.id));
  const nextLabScenario = byScenario.find(s => !s.attempted);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-white tracking-tight">Your Progress</h1>
        <p className="text-sm text-zinc-500">{tabsVisited.length} of {ALL_TABS.length} tabs visited · {leaderboard.length} challenge attempt{leaderboard.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Tab completion by group */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tab Coverage</div>
        {tabsByGroup.map(({ group, color, tabs, visitedCount }) => {
          const pct = Math.round((visitedCount / tabs.length) * 100);
          return (
            <div key={group}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold font-mono" style={{ color }}>{group}</span>
                <span className="text-xs text-zinc-500 font-mono">{visitedCount}/{tabs.length}</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => onNavigate(t.id)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${visited.has(t.id) ? "border-zinc-600 text-zinc-300 bg-zinc-800" : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"}`}>
                    {visited.has(t.id) ? "✓ " : ""}{t.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* RAG challenge readiness */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">RAG Challenge</div>
          {bestOverall && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500">Best level:</span>
              <TierBadge tier={bestOverall} />
            </div>
          )}
        </div>
        {leaderboard.length === 0 ? (
          <div className="text-center py-3 space-y-2">
            <p className="text-xs text-zinc-500">No challenge attempts yet.</p>
            <button onClick={() => onNavigate("lab")} className="text-xs text-amber-400 hover:text-amber-300 font-mono transition-all">
              Open RAG Lab → enable Challenge Mode →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {byScenario.map((s, i) => (
              <div key={s.scenario_id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-600 w-4 shrink-0">#{i+1}</span>
                <span className="text-xs text-zinc-300 flex-1 truncate">{s.title}</span>
                {s.bestTier
                  ? <TierBadge tier={s.bestTier} />
                  : s.attempted
                    ? <span className="text-[10px] font-mono text-amber-600 border border-amber-900 px-1.5 py-0.5 rounded">Attempted</span>
                    : <span className="text-[10px] font-mono text-zinc-700 border border-zinc-800 px-1.5 py-0.5 rounded">Open</span>
                }
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested next step */}
      {(nextTab || nextLabScenario) && (
        <div className="rounded-xl border border-violet-800/50 bg-violet-950/20 p-4 space-y-2">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest">Suggested Next Step</div>
          {nextLabScenario && leaderboard.length > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">Try the next RAG scenario</div>
                <div className="text-xs text-zinc-400">{nextLabScenario.title}</div>
              </div>
              <button onClick={() => onNavigate("lab")} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shrink-0">
                Go →
              </button>
            </div>
          ) : nextTab ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">Open {nextTab.label}</div>
                <div className="text-xs text-zinc-400">{nextTab.audience}</div>
              </div>
              <button onClick={() => onNavigate(nextTab.id)} className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shrink-0">
                Go →
              </button>
            </div>
          ) : null}
        </div>
      )}

      {tabsVisited.length === ALL_TABS.length && solved === ALL_SCENARIOS.length && (
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/20 p-4 text-center space-y-1">
          <div className="text-2xl">🏆</div>
          <div className="text-sm font-black text-emerald-300">Full coverage achieved</div>
          <p className="text-xs text-zinc-400">Every tab visited and every RAG scenario solved at Senior-Ready or above.</p>
        </div>
      )}

      {/* Certificates */}
      {(() => {
        const learnTabs = ALL_TABS.filter(t => t.group === "LEARN");
        const buildTabs = ALL_TABS.filter(t => t.group === "BUILD");
        const growTabs  = ALL_TABS.filter(t => t.group === "GROW");
        const learnComplete = learnTabs.every(t => visited.has(t.id));
        const buildComplete = buildTabs.every(t => visited.has(t.id));
        const growComplete  = growTabs.every(t => visited.has(t.id));
        if (!learnComplete && !buildComplete && !growComplete) return null;
        function downloadCert(group) {
          const canvas = document.createElement("canvas");
          canvas.width = 800; canvas.height = 560;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#09090b";
          ctx.fillRect(0, 0, 800, 560);
          ctx.strokeStyle = "#6366f1";
          ctx.lineWidth = 3;
          ctx.strokeRect(20, 20, 760, 520);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 32px system-ui";
          ctx.textAlign = "center";
          ctx.fillText("Certificate of Completion", 400, 100);
          ctx.fillStyle = "#a1a1aa";
          ctx.font = "18px system-ui";
          ctx.fillText(`${group} Track — genai-systems-lab.com`, 400, 145);
          ctx.fillStyle = "#6366f1";
          ctx.font = "bold 48px system-ui";
          ctx.fillText(group === "LEARN" ? "AI Foundations" : group === "BUILD" ? "AI Systems Builder" : "AI Career Ready", 400, 260);
          ctx.fillStyle = "#71717a";
          ctx.font = "16px system-ui";
          ctx.fillText(`Completed ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 400, 320);
          ctx.fillStyle = "#52525b";
          ctx.font = "13px system-ui";
          ctx.fillText("genai-systems-lab.com · Built by Sidharth Kriplani", 400, 520);
          const a = document.createElement("a");
          a.download = `certificate-${group.toLowerCase()}.png`;
          a.href = canvas.toDataURL("image/png");
          a.click();
        }
        return (
          <div className="rounded-xl border border-indigo-800/40 bg-indigo-900/10 p-4 space-y-3">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Certificates Earned</p>
            <div className="space-y-2">
              {learnComplete && <button onClick={() => downloadCert("LEARN")} className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">Download LEARN Certificate →</button>}
              {buildComplete && <button onClick={() => downloadCert("BUILD")} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">Download BUILD Certificate →</button>}
              {growComplete  && <button onClick={() => downloadCert("GROW")}  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Download GROW Certificate →</button>}
            </div>
          </div>
        );
      })()}

      {/* Bookmarked Posts */}
      {bookmarks.size > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bookmarked Posts</p>
          <div className="space-y-2">
            {[...bookmarks].map(id => {
              const post = GT_POSTS.find(p => p.id === id);
              if (!post) return null;
              return (
                <div key={id} className="flex items-center justify-between gap-3">
                  <button onClick={() => onNavigate("groundtruth")} className="text-xs text-zinc-300 hover:text-white text-left truncate">{post.title}</button>
                  <button onClick={() => toggleBookmark(id)} className="text-zinc-600 hover:text-red-400 text-xs shrink-0">✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MODULE SEARCH INDEX ──────────────────────────────────────────────────────

const ALL_MODULES_INDEX = [
  { label: "Evals Lab",             tag: "DESIGN",    tab: "systems", moduleId: "evals"         },
  { label: "Eval Frameworks",       tag: "FRAMEWORK", tab: "systems", moduleId: "evalfw"        },
  { label: "Model Strategy",        tag: "DECISION",  tab: "systems", moduleId: "strategy"      },
  { label: "Should You Use AI?",    tag: "JUDGE",     tab: "systems", moduleId: "shouldai"      },
  { label: "Cost/Latency",          tag: "COST",      tab: "systems", moduleId: "costlatency"   },
  { label: "Fine-Tuning Lab",       tag: "TRAIN",     tab: "systems", moduleId: "finetune"      },
  { label: "India Scale Lab",       tag: "₹ INDIA",   tab: "systems", moduleId: "indiascale"    },
  { label: "Prompt Caching",        tag: "CACHE",     tab: "systems", moduleId: "caching"       },
  { label: "Model Router",          tag: "ROUTE",     tab: "systems", moduleId: "router"        },
  { label: "Inference Optimizer",   tag: "SERVING",   tab: "systems", moduleId: "inference"     },
  { label: "Incident Room",         tag: "DIAGNOSE",  tab: "systems", moduleId: "incidents"     },
  { label: "Observability",         tag: "OPS",       tab: "systems", moduleId: "observability" },
  { label: "A/B Testing",           tag: "SHIP",      tab: "systems", moduleId: "abtesting"     },
  { label: "ML CI/CD",              tag: "DEPLOY",    tab: "systems", moduleId: "mlcicd"        },
  { label: "Context Compaction",    tag: "CONTEXT",   tab: "systems", moduleId: "compaction"    },
  { label: "RAG Architectures",     tag: "PATTERNS",  tab: "flows",   moduleId: "ragarch"       },
  { label: "ReAct Pattern",         tag: "LOOP",      tab: "agents",  moduleId: "react"         },
  { label: "Tool Use Design",       tag: "TOOLS",     tab: "agents",  moduleId: "tools"         },
  { label: "Agent Memory",          tag: "MEMORY",    tab: "agents",  moduleId: "memory"        },
  { label: "Multi-Agent Patterns",  tag: "SCALE",     tab: "agents",  moduleId: "multiagent"    },
  { label: "Agent Failure Modes",   tag: "DEBUG",     tab: "agents",  moduleId: "failures"      },
  { label: "Planning Patterns",     tag: "PLAN",      tab: "agents",  moduleId: "planning"      },
  { label: "Agent Loop Simulator",  tag: "PLAY",      tab: "agents",  moduleId: "simulator"     },
  { label: "Embedding Space",       tag: "VISUALIZE", tab: "explore", moduleId: "embeddings"    },
  { label: "Shadow Mode A/B",       tag: "COMPARE",   tab: "explore", moduleId: "shadow"        },
  { label: "Latency Planner",       tag: "BUDGET",    tab: "explore", moduleId: "latency"       },
  { label: "Tokenizer Explorer",    tag: "TOKENS",    tab: "explore", moduleId: "tokenizer"     },
  { label: "Model Card Reader",     tag: "AUDIT",     tab: "explore", moduleId: "modelcard"     },
  { label: "Vector DB Comparison",  tag: "DB",        tab: "explore", moduleId: "vectordb"      },
  { label: "Structured Outputs",    tag: "SCHEMA",    tab: "explore", moduleId: "structured"    },
  { label: "Red Teaming Lab",       tag: "ATTACK",    tab: "explore", moduleId: "redteam"       },
  { label: "Home",         tag: "TAB", tab: "home",        moduleId: null },
  { label: "Concepts",     tag: "TAB", tab: "concepts",    moduleId: null },
  { label: "Flows",        tag: "TAB", tab: "flows",       moduleId: null },
  { label: "RAG Lab",      tag: "TAB", tab: "lab",         moduleId: null },
  { label: "Agents",       tag: "TAB", tab: "agents",      moduleId: null },
  { label: "Playground",   tag: "TAB", tab: "playground",  moduleId: null },
  { label: "Fluency",      tag: "TAB", tab: "fluency",     moduleId: null },
  { label: "AI Product",   tag: "TAB", tab: "aipm",        moduleId: null },
  { label: "Career",       tag: "TAB", tab: "career",      moduleId: null },
  { label: "Ground Truth", tag: "TAB", tab: "groundtruth", moduleId: null },
  { label: "My Progress",  tag: "TAB", tab: "progress",    moduleId: null },
  // Ground Truth posts — 83 entries, metadata only (no content loaded here)
  ...GT_POSTS.map(p => ({
    label: p.title,
    tag: p.category.toUpperCase(),
    tab: "groundtruth",
    moduleId: p.id,
    tags: p.tags,
  })),
];

const TAB_COLORS = {
  systems: "#3b82f6", explore: "#8b5cf6", agents: "#6366f1", concepts: "#6366f1",
  flows: "#6366f1", lab: "#f59e0b", playground: "#f59e0b",
  fluency: "#22c55e", aipm: "#22c55e", career: "#22c55e", home: "#71717a",
  groundtruth: "#a78bfa",
};

function SearchModal({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? ALL_MODULES_INDEX.filter(m =>
        m.label.toLowerCase().includes(q) ||
        m.tag.toLowerCase().includes(q) ||
        m.tab.toLowerCase().includes(q) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
      )
    : ALL_MODULES_INDEX.filter(m => m.moduleId !== null).slice(0, 9);

  function onKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && results[cursor]) { onSelect(results[cursor]); }
    if (e.key === "Escape") { onClose(); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-16 px-4" onClick={onClose} role="presentation">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="Search modules" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-400 shrink-0" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input ref={inputRef} value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search modules & posts..."
            aria-label="Search modules"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-600"
          />
          <kbd className="text-[10px] font-mono text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0
            ? <div className="px-4 py-8 text-center text-xs text-zinc-600">No modules found</div>
            : results.map((item, i) => {
              return (
                <button key={`${item.tab}-${item.moduleId || "tab"}-${i}`}
                  onClick={() => onSelect(item)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all ${cursor === i ? "bg-zinc-800" : "hover:bg-zinc-800/60"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate text-white">{item.label}</div>
                    <div className="text-xs text-zinc-500 capitalize flex items-center gap-1">
                      {item.tab === "lab" ? "RAG Lab" : item.tab}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{ color: (TAB_COLORS[item.tab] || "#888") + "ee", background: (TAB_COLORS[item.tab] || "#888") + "22" }}>
                      {item.tag}
                    </span>
                  </div>
                </button>
              );
            })
          }
        </div>
        <div className="px-4 py-2 border-t border-zinc-800 flex items-center gap-4 text-[10px] text-zinc-600 font-mono">
          <span>↑↓ navigate</span><span>↵ select</span><span>Esc close</span>
          <span className="ml-auto text-xs text-zinc-600">Press / to open · Esc to close</span>
        </div>
      </div>
    </div>
  );
}

// ─── FEEDBACK MODAL (shown when form URL not yet configured) ─────────────────
function FeedbackFallbackModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose} role="presentation">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4" role="dialog" aria-modal="true" aria-label="Give Feedback" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">💬 Give Feedback</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-all" aria-label="Close feedback">✕</button>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Found a bug, have a suggestion, or want to say what's useful? Reach the builder directly:
        </p>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 space-y-2.5">
          <a href="https://github.com/SidharthKriplani/genai-systems-lab/issues"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors font-mono">
            <span>→</span> Open a GitHub issue (bugs, feature requests)
          </a>
          <a href="https://www.linkedin.com/in/sidharth-kriplani"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-300 transition-colors font-mono">
            <span>→</span> LinkedIn — Sidharth Kriplani
          </a>
          <a href="https://github.com/SidharthKriplani"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-300 transition-colors font-mono">
            <span>→</span> GitHub — @SidharthKriplani
          </a>
        </div>
        <p className="text-[10px] text-zinc-600 font-mono">
          No login required. No personal data collected.
        </p>
      </div>
    </div>
  );
}


const VALID_VIEWS = ["home","concepts","flows","consult","lab","agents","systems","playground","explore","fluency","aipm","career","preplab","groundtruth","progress","qa"];

function getInitialView() {
  try {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (VALID_VIEWS.includes(hash)) return hash;
    const params = new URLSearchParams(window.location.search);
    if (params.get("qa") === "1") return "qa";
  } catch {}
  return "home";
}

export default function App() {
  const [topView, setTopView] = useState(getInitialView);
  const [warRoomOpen, setWarRoomOpen] = useState(false);

  // Secret key sequence: type "business2026" while in any BUILD-group tab
  // Refs pattern: listener registered once, reads current topView via ref — no stale closure
  const topViewRef = useRef(topView);
  useEffect(() => { topViewRef.current = topView; }, [topView]);
  const warRoomOpenRef = useRef(false);
  const seqBuf = useRef("");
  useEffect(() => {
    const BUILD_TABS = new Set(["lab", "agents", "playground", "explore", "systems"]);
    const SEQ = "business2026";
    function onKeyDown(e) {
      if (warRoomOpenRef.current) return;
      if (!BUILD_TABS.has(topViewRef.current)) { seqBuf.current = ""; return; }
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const candidate = seqBuf.current + e.key;
      if (SEQ.startsWith(candidate)) {
        // Key continues the sequence — absorb it to prevent shortcut conflicts
        if (candidate.length > 1) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
        seqBuf.current = candidate;
        if (seqBuf.current === SEQ) {
          warRoomOpenRef.current = true;
          setWarRoomOpen(true);
          seqBuf.current = "";
        }
      } else {
        // Mistype — reset, but keep key if it starts a fresh attempt
        seqBuf.current = SEQ.startsWith(e.key) ? e.key : "";
      }
    }
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [visited, setVisited] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("genai_visited") || '["home"]')); }
    catch { return new Set(["home"]); }
  });
  function navigate(view) {
    setTopView(view);
    window.location.hash = view;
    track("module_opened", { section: view });
    track("tab_navigated", { tab: view });
    if (view === "lab") track("rag_lab_opened", { section: "lab" });
    setVisited(prev => {
      const next = new Set([...prev, view]);
      try { localStorage.setItem("genai_visited", JSON.stringify([...next])); } catch {}
      return next;
    });
  }
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [config, setConfig] = useState(ALL_SCENARIOS[0].default_config);
  const [evaluated, setEvaluated] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [gradeResult, setGradeResult] = useState(null);
  const [activeTab, setActiveTab] = useState("simulator");
  const [leaderboard, setLeaderboard] = useState(() => {
    try { return JSON.parse(localStorage.getItem("genai_leaderboard") || "[]"); } catch { return []; }
  });
  const [bookmarks, setBookmarks] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("genai_bookmarks") || "[]")); } catch { return new Set(); }
  });
  function toggleBookmark(id) {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem("genai_bookmarks", JSON.stringify([...next])); } catch {}
      return next;
    });
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [palette, setPalette] = useState(() => {
    try { return localStorage.getItem("genai_palette") || "violet"; } catch { return "violet"; }
  });
  const switchPalette = (p) => { setPalette(p); try { localStorage.setItem("genai_palette", p); } catch {} };
  const [systemsModule, setSystemsModule] = useState(null);
  const [exploreModule, setExploreModule] = useState(null);
  const [agentsModule, setAgentsModule] = useState(null);
  const [gtPostId, setGtPostId] = useState(null);
  const [visitedModules, setVisitedModules] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("genai_visited_modules") || "[]")); }
    catch { return new Set(); }
  });
  const [labHintDismissed, setLabHintDismissed] = useState(() => {
    try { return localStorage.getItem("genai_lab_hint_dismissed") === "1"; } catch { return false; }
  });
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  function openFeedback(location = "unknown") {
    track("feedback_clicked", { location });
    if (isFeedbackReady()) {
      window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
    } else {
      setFeedbackModalOpen(true);
    }
  }
  const [toasts, setToasts] = useState([]);
  function showToast(message, type = "info") {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  }
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [whatsNewSeen, setWhatsNewSeen] = useState(() => {
    try { return localStorage.getItem("genai_whatsnew_v5") === "1"; } catch { return false; }
  });
  const CONTENT_VERSION = "v6"; // increment this when you add content
  const [notifSeen, setNotifSeen] = useState(() => {
    try { return localStorage.getItem("genai_notif_seen") === CONTENT_VERSION; } catch { return false; }
  });
  function dismissWhatsNew() {
    setWhatsNewSeen(true);
    setWhatsNewOpen(false);
    try { localStorage.setItem("genai_whatsnew_v5", "1"); } catch {}
  }

  function trackModuleVisit(tab, moduleId) {
    const key = `${tab}:${moduleId}`;
    setVisitedModules(prev => {
      if (prev.has(key)) return prev;
      const next = new Set([...prev, key]);
      try { localStorage.setItem("genai_visited_modules", JSON.stringify([...next])); } catch {}
      return next;
    });
  }
  function dismissLabHint() {
    setLabHintDismissed(true);
    try { localStorage.setItem("genai_lab_hint_dismissed", "1"); } catch {}
  }

  const [streak, setStreak] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem("genai_streak") || "{}");
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (data.lastVisit === today) return data.count || 1;
      if (data.lastVisit === yesterday) return data.count || 1;
      return 1;
    } catch { return 1; }
  });
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("genai_streak") || "{}");
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let count = 1;
      if (data.lastVisit === today) count = data.count || 1;
      else if (data.lastVisit === yesterday) count = (data.count || 0) + 1;
      setStreak(count);
      localStorage.setItem("genai_streak", JSON.stringify({ count, lastVisit: today }));
    } catch {}
  }, []);
  const SHORTCUT_TABS = ["home","concepts","flows","lab","agents","systems","playground","explore","fluency","aipm","career","paths","preplab","groundtruth"];

  function navigateTo({ tab, moduleId, postId, topic, diff }) {
    if (moduleId) {
      if (tab === "systems")  setSystemsModule(moduleId);
      if (tab === "explore")  setExploreModule(moduleId);
      if (tab === "agents")   setAgentsModule(moduleId);
    }
    if (postId) setGtPostId(postId);
    navigate(tab);
  }
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(s => !s); return; }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "Q") { e.preventDefault(); navigate("qa"); return; }
      if (e.key === "?") { e.preventDefault(); setShowShortcuts(s => !s); return; }
      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.key === "Escape") {
        if (searchOpen) { setSearchOpen(false); return; }
        if (leaderboardOpen) { setLeaderboardOpen(false); return; }
        if (whatsNewOpen) { dismissWhatsNew(); return; }
        if (feedbackModalOpen) { setFeedbackModalOpen(false); return; }
        setShowShortcuts(false);
        setMobileMenuOpen(false);
        return;
      }
      const n = parseInt(e.key);
      if (n >= 1 && n <= SHORTCUT_TABS.length) { navigate(SHORTCUT_TABS[n - 1]); setMobileMenuOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, leaderboardOpen, whatsNewOpen, feedbackModalOpen]);

  useEffect(() => {
    checkPreviewUnlock(); // handle ?preview=CODE URL unlock
    initAnalytics();
  }, []);

  useEffect(() => {
    const handler = () => {
      const h = window.location.hash.replace('#', '').toLowerCase();
      if (VALID_VIEWS.includes(h)) setTopView(h);
      else if (!h) setTopView("home");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [setTopView]);

  useEffect(() => {
    const TAB_TITLES = {
      home: "GenAI Systems Lab",
      concepts: "Concepts — GenAI Systems Lab",
      flows: "Flows — GenAI Systems Lab",
      consult: "Search — GenAI Systems Lab",
      lab: "RAG Lab — GenAI Systems Lab",
      agents: "Agents Lab — GenAI Systems Lab",
      systems: "Systems Lab — GenAI Systems Lab",
      playground: "Playground — GenAI Systems Lab",
      explore: "Explore — GenAI Systems Lab",
      fluency: "Fluency — GenAI Systems Lab",
      aipm: "AI Product — GenAI Systems Lab",
      career: "Career — GenAI Systems Lab",
      preplab: "Prep Lab — GenAI Systems Lab",
      groundtruth: "Ground Truth — GenAI Systems Lab",
      progress: "Your Progress — GenAI Systems Lab",
      qa: "QA Dashboard — GenAI Systems Lab",
    };
    document.title = TAB_TITLES[topView] || "GenAI Systems Lab";
  }, [topView]);

  const scenario = ALL_SCENARIOS[scenarioIdx];
  const lookup = useMemo(() => lookupResult(scenario, config), [scenario, config]);

  const switchScenario = (idx) => {
    setScenarioIdx(idx);
    setConfig(ALL_SCENARIOS[idx].default_config);
    setEvaluated(false);
    setChallengeMode(false);
    setGradeResult(null);
  };

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setEvaluated(false);
    setGradeResult(null);
  };

  const evaluate = () => {
    setEvaluated(true);
    track("evaluate_configuration_clicked", { scenario_id: scenario.scenario_id, challenge_mode: challengeMode });
    if (challengeMode && lookup?.result) {
      const grade = gradeChallenge(scenario, lookup.result);
      setGradeResult(grade);
      if (grade.passed) track("challenge_completed", { scenario_id: scenario.scenario_id, passed: true });
      const _passed = leaderboard.filter(e => e.passed).length + (grade.passed ? 1 : 0);
      const _total = leaderboard.length + 1;
      track("assessment_completed", { score: _passed, total: _total });
      const entry = {
        scenario: scenario.title,
        scenarioId: scenario.scenario_id,
        config: { ...config },
        passed: grade.passed,
        tier: grade.tier,
        checks: grade.checks,
        date: new Date().toISOString(),
      };
      setLeaderboard(prev => {
        const updated = [...prev, entry];
        try { localStorage.setItem("genai_leaderboard", JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
  };

  const clearLeaderboard = () => {
    setLeaderboard([]);
    try { localStorage.removeItem("genai_leaderboard"); } catch {}
  };

  const reset = () => {
    setConfig(scenario.default_config);
    setEvaluated(false);
    setGradeResult(null);
  };

  const isRecommended = useMemo(
    () => scenario.recommended_configs.some(
      (rc) => rc.chunk_size === config.chunk_size && rc.top_k === config.top_k && rc.reranker === config.reranker && rc.answer_policy === config.answer_policy
    ),
    [scenario, config]
  );

  const result = lookup?.result;
  const hasFallback = lookup && !lookup.curated;

  const NAV_GROUPS = [
    { label: null, items: [
      { id: "home", label: "Home", audience: "All levels" },
    ]},
    { label: "LEARN", color: "#6366f1", items: [
      { id: "concepts",    label: "Concepts",    count: 11, audience: "All levels" },
      { id: "flows",       label: "Flows",       count: 5,  audience: "All levels" },
      { id: "groundtruth", label: "Ground Truth",           audience: "All levels" },
      { id: "consult",     label: "Search",                 audience: "All levels" },
    ]},
    { label: "BUILD", color: "#3b82f6", items: [
      { id: "lab",        label: "RAG Lab",    count: 6,  audience: "Engineers" },
      { id: "agents",     label: "Agents",     count: 7,  audience: "Engineers" },
      { id: "playground", label: "Playground", count: 5,  audience: "All levels" },
      { id: "explore",    label: "Explore",    count: 8,  audience: "Engineers" },
      { id: "systems",    label: "Systems",    count: 15, audience: "Engineers · PMs" },
    ]},
    { label: "GROW", color: "#22c55e", items: [
      { id: "paths",   label: "Paths",       audience: "All levels" },
      { id: "fluency", label: "Drills",   count: 5, audience: "Interview prep" },
      { id: "preplab", label: "Prep Lab",           audience: "Interview prep" },
      { id: "career",  label: "Career",  count: 4, audience: "Job seekers" },
      { id: "aipm",    label: "AI Product", count: 5, audience: "Product managers" },
    ]},
    { label: null, items: [
      { id: "progress", label: "My Progress", audience: "All levels" },
    ]},
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex" data-palette={palette} style={{ fontFamily: "'Inter', 'DM Sans', system-ui, -apple-system, sans-serif" }}>
      {/* Feedback fallback modal */}
      {feedbackModalOpen && <FeedbackFallbackModal onClose={() => setFeedbackModalOpen(false)} />}

      {/* Keyboard shortcuts overlay */}
      {searchOpen && (
        <SearchModal
          onClose={() => setSearchOpen(false)}
          onSelect={item => {
            navigate(item.tab);
            track("search_performed", { query: item.label?.slice(0, 50) });
            if (item.tab === "systems"     && item.moduleId) setSystemsModule(item.moduleId);
            if (item.tab === "explore"     && item.moduleId) setExploreModule(item.moduleId);
            if (item.tab === "agents"      && item.moduleId) setAgentsModule(item.moduleId);
            if (item.tab === "groundtruth" && item.moduleId) setGtPostId(item.moduleId);
            setSearchOpen(false);
          }}
        />
      )}
      {leaderboardOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-10 px-4 overflow-y-auto" onClick={() => setLeaderboardOpen(false)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl mb-10" role="dialog" aria-modal="true" aria-label="Challenge Log" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800">
              <span className="text-sm font-black text-white">📋 Challenge Log</span>
              <button onClick={() => setLeaderboardOpen(false)} className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-all" aria-label="Close challenge log">✕ Close</button>
            </div>
            <div className="p-5">
              <LeaderboardView leaderboard={leaderboard} onClear={clearLeaderboard} onRetry={(tab) => { navigate(tab); setLeaderboardOpen(false); }} />
            </div>
          </div>
        </div>
      )}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)} role="presentation">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Keyboard Shortcuts</span>
              <button onClick={() => setShowShortcuts(false)} className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-all" aria-label="Close shortcuts">✕ Close</button>
            </div>
            <div className="space-y-2">
              {SHORTCUT_TABS.map((tab, i) => (
                <div key={tab} className="flex items-center justify-between text-xs">
                  <kbd className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 font-mono text-zinc-300">{i + 1}</kbd>
                  <span className="text-zinc-400 capitalize">{tab.replace("lab", "RAG Lab")}</span>
                </div>
              ))}
              <div className="border-t border-zinc-800 pt-2 flex items-center justify-between text-xs">
                <kbd className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 font-mono text-zinc-300">⌘K</kbd>
                <span className="text-zinc-400">Search modules</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <kbd className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 font-mono text-zinc-300">?</kbd>
                <span className="text-zinc-400">Toggle this overlay</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <kbd className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 font-mono text-zinc-300">Esc</kbd>
                <span className="text-zinc-400">Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* What's New modal */}
      {whatsNewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={dismissWhatsNew}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">🆕 What's New</span>
              <button onClick={dismissWhatsNew} className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded border border-zinc-800 hover:border-zinc-700 transition-all">✕ Close</button>
            </div>
            <div className="space-y-3">
              {[
                { tag: "NEW", color: "#6366f1", label: "AI Systems Readiness Assessment", desc: "20-question timed test across all topics. Get your readiness level: Junior → Staff.", tab: "fluency" },
                { tag: "NEW", color: "#3b82f6", label: "5 new deep-dive posts", desc: "Agent evals, prompt caching ($4K→$540/mo), LLM security, vector DB selection, cost optimization.", tab: "groundtruth" },
                { tag: "NEW", color: "#06b6d4", label: "2 new Agent Lab scenarios", desc: "Planning Agent and Reflexion pattern now interactive in the Agents tab.", tab: "agents" },
                { tag: "NEW", color: "#22c55e", label: "Flashcard unknowns filter", desc: "Fluency flashcards now support 'Study unknowns only' mode for focused drilling.", tab: "fluency" },
                { tag: "NEW", color: "#f59e0b", label: "URL routing + shareable links", desc: "Every tab now has its own URL. Share genai-systems-lab.vercel.app#systems directly.", tab: null },
                { tag: "PERF", color: "#8b5cf6", label: "Score persistence", desc: "Quiz and drill scores now persist across sessions in all modules.", tab: null },
                { tag: "FIX", color: "#ef4444", label: "25 bug fixes across 10 files", desc: "Guardrail logic, mobile SVG overflow, BudgetAllocator cap, MockInterview crash guard, and more.", tab: null },
              ].map(({ tag, color, label, desc, tab }) => (
                <div key={label}
                  onClick={() => { if (tab) { navigate(tab); dismissWhatsNew(); } }}
                  className={`flex items-start gap-3 rounded-lg p-1.5 -mx-1.5 transition-all ${tab ? "cursor-pointer hover:bg-zinc-800/60" : ""}`}>
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded mt-0.5 shrink-0"
                    style={{ color, background: color + "22", border: `1px solid ${color}44` }}>{tag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {label}{tab && <span className="text-zinc-600 text-[10px]">→</span>}
                    </div>
                    <div className="text-xs text-zinc-500">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={dismissWhatsNew} className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all">
              Got it ✓
            </button>
          </div>
        </div>
      )}
      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-zinc-900 border-l border-zinc-800 p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-500 hover:text-white text-sm">✕</button>
            </div>
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi} className="mb-3">
                {group.label && <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1" style={{ color: group.color }}>{group.label}</div>}
                {group.items.map((item, ii) => (
                  <button key={item.id} onClick={() => { navigate(item.id); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-between mb-0.5 transition-all ${
                      topView === item.id ? "bg-violet-600 text-white"
                      : item.id === "lab" ? "text-amber-500 hover:bg-amber-900/20 hover:text-amber-300 border border-amber-900/30"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
                    <span className="flex items-center gap-1.5">
                      {item.label}{item.id === "lab" && topView !== "lab" && <span className="text-amber-600 text-[10px]">★</span>}
                    </span>
                    {visited.has(item.id) && topView !== item.id && item.id !== "lab" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-80 shrink-0" />}
                  </button>
                ))}
              </div>
            ))}
            <div className="mt-3 space-y-1.5">
              <button onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }} className="w-full py-2 text-xs text-zinc-400 border border-zinc-700 rounded-lg hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="4.5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="7" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Search modules
              </button>
              <button onClick={() => { setLeaderboardOpen(true); setMobileMenuOpen(false); }} className="w-full py-2 text-xs text-zinc-500 border border-zinc-800 rounded-lg hover:text-white transition-all">
                📋 Challenge Log
              </button>
              <button onClick={() => { openFeedback("mobile_drawer"); setMobileMenuOpen(false); }}
                className="w-full py-2 text-xs text-zinc-500 border border-zinc-800 rounded-lg hover:text-violet-400 hover:border-violet-800 transition-all flex items-center justify-center gap-1.5">
                💬 Give Feedback
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── LEFT SIDEBAR (desktop only) ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-48 shrink-0 border-r border-zinc-800 bg-zinc-950 sticky top-0 h-screen overflow-y-auto z-20">
        {/* Logo */}
        <button onClick={() => navigate("home")} className="flex items-center gap-2 px-4 py-4 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">G</div>
          <span className="text-sm font-bold tracking-wide text-white">GenAI Lab</span>
        </button>
        <div className="h-px bg-zinc-800 mx-3 mb-2" />
        {/* Nav groups */}
        <nav className="flex-1 px-2 pb-4 space-y-0.5">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-3" : ""}>
              {group.label && (
                <div className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 mb-0.5" style={{ color: group.color + "99" }}>{group.label}</div>
              )}
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  aria-current={topView === item.id ? "page" : undefined}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    topView === item.id
                      ? "bg-violet-600 text-white"
                      : item.id === "lab"
                        ? "text-amber-400 hover:bg-amber-900/20 hover:text-amber-300"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}>
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.id === "lab" && topView !== "lab" && <span className="text-amber-500 text-[10px]">★</span>}
                  </span>
                  {visited.has(item.id) && topView !== item.id && item.id !== "lab" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-80 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {/* Bottom utilities */}
        <div className="px-2 pb-3 border-t border-zinc-800 pt-2 space-y-1">
          <button onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-all">
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none" className="text-zinc-600 shrink-0"><circle cx="4.5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="7" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span className="text-[11px] text-zinc-600 flex-1">Search…</span>
            <kbd className="text-[9px] border border-zinc-700 rounded px-1 text-zinc-600 font-mono">⌘K</kbd>
          </button>
          <button onClick={() => openFeedback("sidebar")}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
            💬 <span>Feedback</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

      <header role="banner" className="border-b border-zinc-800">
        {/* Row 1: Logo + Search + Utilities */}
        <div className="px-4 py-2 flex items-center gap-3 max-w-7xl mx-auto">
          <button onClick={() => navigate("home")} className="flex lg:hidden items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center text-xs font-bold text-white">G</div>
            <span className="hidden sm:block text-sm font-bold tracking-wide text-white">GenAI Lab</span>
          </button>
          {/* Search bar — mobile only; desktop has sidebar search */}
          <button onClick={() => setSearchOpen(true)}
            aria-label="Search modules"
            className="lg:hidden flex flex-1 items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-left">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-zinc-600 shrink-0"><circle cx="4.5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="7" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span className="text-xs text-zinc-600 flex-1">Search modules…</span>
            <kbd className="text-[9px] border border-zinc-700 rounded px-1 text-zinc-600 font-mono">⌘K</kbd>
          </button>
          {/* Right utilities */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto lg:ml-0">
            {/* Feedback button — desktop has it in sidebar */}
            <button onClick={() => setLeaderboardOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-zinc-800 hover:border-zinc-700 transition-all font-mono text-zinc-500 hover:text-zinc-300"
              title="Challenge Log" aria-label="Open challenge log">
              🏆{leaderboard.filter(e => e.passed).length > 0 && <span className="text-[10px]">{leaderboard.filter(e => e.passed).length}</span>}
            </button>
            <button onClick={() => { setWhatsNewOpen(true); setWhatsNewSeen(true); try { localStorage.setItem("genai_whatsnew_v5","1"); } catch {} }}
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded text-xs border border-zinc-800 hover:border-zinc-700 transition-all font-mono text-zinc-500 hover:text-zinc-300 relative">
              NEW
              {!whatsNewSeen && visited.size > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-500 animate-pulse" />}
            </button>
            <button onClick={() => { setNotifSeen(true); setWhatsNewOpen(true); try { localStorage.setItem("genai_notif_seen", CONTENT_VERSION); } catch {}; }}
              className="relative p-1.5 text-zinc-500 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1a5 5 0 00-5 5v2.5L1.5 10h13L13 8.5V6a5 5 0 00-5-5zM6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {!notifSeen && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />}
            </button>
            {streak >= 2 && (
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                🔥{streak}
              </span>
            )}
            <button onClick={() => setShowShortcuts(true)} className="hidden lg:flex items-center px-2 py-1 rounded text-xs text-zinc-600 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-all font-mono" aria-label="Keyboard shortcuts">?</button>
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all" aria-label="Open navigation menu" aria-expanded={mobileMenuOpen}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect y="2" width="16" height="2" rx="1"/><rect y="7" width="16" height="2" rx="1"/><rect y="12" width="16" height="2" rx="1"/></svg>
            </button>
          </div>
        </div>
        {/* Row 2: Tab navigation — desktop nav moved to left sidebar */}
      </header>

      {topView === "home" && <HomePage onNavigate={navigate} visited={visited} onFeedback={openFeedback} />}

      <main role="main" id="main-content">
      <TabErrorBoundary>
        <Suspense fallback={
          <div className="flex-1 p-6 space-y-4 animate-pulse">
            <div className="h-6 w-48 rounded-lg bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-800/60" />
            <div className="h-4 w-3/4 rounded bg-zinc-800/60" />
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-zinc-800/40" />)}
            </div>
          </div>
        }>
          {topView === "concepts"   && <ConceptsApp onNavigate={navigateTo} />}
          {topView === "flows"      && <FlowsApp onNavigate={navigateTo} />}
          {topView === "consult"    && <ConsultationApp onNavigate={navigate} onNavigateTo={navigateTo} />}
          {topView === "agents"     && <AgentsApp initialModule={agentsModule} onModuleVisit={trackModuleVisit} onNavigate={navigateTo} />}

          {topView === "systems"    && <SystemsApp initialModule={systemsModule} onModuleVisit={trackModuleVisit} onNavigate={navigateTo} />}
          {topView === "fluency"    && <FluencyApp />}
          {topView === "aipm"       && <AIPMApp />}
          {topView === "playground" && <PlaygroundApp onModuleVisit={trackModuleVisit} onNavigate={navigateTo} />}
          {topView === "explore"    && <ExploreApp initialModule={exploreModule} onModuleVisit={trackModuleVisit} onNavigate={(tab, postId) => { if (postId) setGtPostId(postId); navigate(tab); }} />}
          {topView === "career"     && <CareerApp />}
          {topView === "preplab"    && <PrepLabApp onNavigate={navigate} onNavigateTo={navigateTo} />}
          {topView === "paths"      && <LearningPathsApp onNavigateTo={navigateTo} />}

          {topView === "groundtruth" && <GroundTruth onNavigate={navigate} onNavigateTo={navigateTo} initialPostId={gtPostId} onPostOpened={() => setGtPostId(null)} />}
          {topView === "progress"    && <ProgressView visited={visited} visitedModules={visitedModules} leaderboard={leaderboard} onNavigate={navigate} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />}
        </Suspense>
      </TabErrorBoundary>
      </main>


      {/* Scenario tabs */}
      {topView === "lab" && <div className="border-b border-zinc-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex gap-1.5 overflow-x-auto scrollbar-hide flex-nowrap pb-0.5">
          {ALL_SCENARIOS.map((s, i) => (
            <button
              key={s.scenario_id}
              onClick={() => switchScenario(i)}
              className={`shrink-0 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
                i === scenarioIdx ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              #{i + 1} {s.title.split(" ").slice(0, 2).join(" ")}
            </button>
          ))}
        </div>
      </div>}

      {topView === "lab" && !labHintDismissed && (
        <div className="border-b border-violet-800/40 bg-violet-950/20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-violet-300 leading-relaxed">
              <span className="font-bold">New here?</span> Pick a scenario, adjust the 4 controls, hit <span className="font-bold text-white">Evaluate</span> — then read the failure diagnosis. Each scenario teaches one production failure mode.
            </p>
            <button onClick={dismissLabHint} className="text-[10px] text-violet-400 hover:text-white border border-violet-800 hover:border-violet-600 rounded px-2 py-0.5 transition-all shrink-0 font-mono">Got it ✕</button>
          </div>
        </div>
      )}

      {topView === "lab" && (activeTab === "simulator" ? (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4">
            <HowTo
              objective="Build intuition for how RAG systems fail in production — and what configuration choices prevent each failure mode."
              steps={[
                "Pick a failure scenario from the tabs above (stale docs, hallucination, injection, context overflow)",
                "Read the scenario description — understand what's broken before you configure",
                "Adjust chunk size, top-k, reranker, and answer policy to fix the failure",
                "Turn on Challenge Mode to test yourself: configure first, then see if you match the recommended fix",
                "Every config combination produces a different result — explore freely",
              ]}
            />
          </div>
          <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2 py-0.5 bg-violet-900 text-violet-300 rounded border border-violet-700">{scenario.tag}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">{scenario.title}</h1>
              <p className="text-sm text-zinc-400 mt-1">{scenario.description}</p>
            </div>
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:shrink-0">
              <span className="text-xs text-zinc-500">Challenge mode</span>
              <Toggle value={challengeMode} onChange={(v) => { setChallengeMode(v); setEvaluated(false); setGradeResult(null); }} />
            </div>
          </div>

          {challengeMode && (
            <div className="mb-5 rounded-xl border border-violet-700 bg-violet-950/40 p-4">
              <div className="text-xs font-bold text-violet-300 mb-1 uppercase tracking-wide">Challenge</div>
              <p className="text-sm text-zinc-300">{scenario.challenge.requirement}</p>
            </div>
          )}

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">System Config</span>
                  <button onClick={reset} className="text-xs text-zinc-500 hover:text-white transition-colors">reset</button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Chunk size</label>
                  <Pill options={["small", "medium", "large"]} value={config.chunk_size} onChange={(v) => updateConfig("chunk_size", v)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Top-k</label>
                  <Pill options={[{ label: "1", value: 1 }, { label: "3", value: 3 }, { label: "5", value: 5 }]} value={config.top_k} onChange={(v) => updateConfig("top_k", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">Reranker</div>
                    <div className="text-xs text-zinc-600 mt-0.5">{config.reranker ? "on" : "off"}</div>
                  </div>
                  <Toggle value={config.reranker} onChange={(v) => updateConfig("reranker", v)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Answer policy</label>
                  <Pill
                    options={[
                      { label: "helpful", value: "helpful" },
                      { label: "grounded", value: "strictly_grounded" },
                      { label: "abstain", value: "abstain_when_unsure" },
                    ]}
                    value={config.answer_policy}
                    onChange={(v) => updateConfig("answer_policy", v)}
                  />
                </div>
                {isRecommended && (
                  <div className="text-xs text-emerald-400 bg-emerald-950 border border-emerald-800 rounded p-2">
                    ✓ Recommended config for this scenario
                  </div>
                )}
                {hasFallback && (
                  <div className="text-xs text-amber-400 bg-amber-950 border border-amber-800 rounded p-2">
                    ⚠ {lookup.fallback_note}
                  </div>
                )}
                <button
                  onClick={evaluate}
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-wide transition-all uppercase"
                >
                  Evaluate Configuration
                </button>
              </div>

              <CorpusPanel scenario={scenario} />
            </div>

            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">User Query</div>
                <p className="text-white font-semibold text-sm">{scenario.user_query}</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Retrieved Evidence</div>
                {result ? (
                  result.retrieved_chunks.length > 0
                    ? result.retrieved_chunks.map((chunk, i) => <ChunkCard key={chunk.id} chunk={chunk} index={i} />)
                    : <p className="text-xs text-zinc-600">No chunks retrieved.</p>
                ) : (
                  <p className="text-xs text-zinc-600">Select a config to see retrieved chunks.</p>
                )}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">Generated Answer</div>
                  {result && (
                    <span className={`text-xs px-2 py-0.5 rounded border font-mono font-bold uppercase ${RISK_COLORS[result.metrics.risk_level]}`}>
                      {result.metrics.risk_level} risk
                    </span>
                  )}
                </div>
                {result
                  ? <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{result.answer}</p>
                  : <p className="text-xs text-zinc-600">Configure system to see the answer.</p>
                }
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-4">
              {result && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">Metrics</div>
                  <MetricBar label="Groundedness" value={result.metrics.groundedness} />
                  <MetricBar label="Citation accuracy" value={result.metrics.citation_accuracy} />
                  <MetricBar label="Completeness" value={result.metrics.completeness} />
                  <MetricBar label="Latency" value={result.metrics.latency_ms} max={2000} isMs />
                  <MetricBar label="Cost / 1k queries" value={result.metrics.cost_per_1k_queries_usd} max={0.25} isCost />
                  <div className="pt-1 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Conflict flagged</span>
                    <span className={result.metrics.conflict_flagged ? "text-emerald-400" : "text-red-400"}>
                      {result.metrics.conflict_flagged ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              )}

              {result && !evaluated && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
                  <p className="text-xs text-zinc-500">Click <span className="text-violet-400">Evaluate Configuration</span> to see the diagnosis and system design lesson.</p>
                </div>
              )}

              {result && evaluated && (
                <>
                  {challengeMode && gradeResult && <ChallengeResult grade={gradeResult} scenarioTitle={scenario.title} scenario={scenario} onNavigate={navigateTo} />}

                  {result.failure_mode ? (
                    <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Failure Mode</span>
                        <span className="text-xs font-mono bg-red-900 text-red-300 px-2 py-0.5 rounded">{result.failure_mode}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{result.failure_explanation}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 space-y-2">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">No Critical Failure</div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{result.failure_explanation}</p>
                    </div>
                  )}

                  {result.suggested_fix && (
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 space-y-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Suggested Fix</div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{result.suggested_fix}</p>
                    </div>
                  )}

                  <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-4 space-y-2">
                    <div className="text-xs font-bold text-violet-400 uppercase tracking-wide">System Design Lesson</div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{result.system_design_lesson}</p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-zinc-500">Was this scenario useful? Tell us what to improve.</p>
                    <button onClick={() => openFeedback("rag_lab_post_evaluate")}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 hover:border-violet-700 text-zinc-400 hover:text-violet-400 transition-all">
                      Give Feedback →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6">
            <span className="text-xs font-mono px-2 py-0.5 bg-violet-900 text-violet-300 rounded border border-violet-700">DESIGN NOTES</span>
            <h2 className="text-xl font-bold mt-2">{scenario.title}</h2>
            <p className="text-sm text-zinc-400 mt-1">Failure mode: {scenario.failure_mode_taught}</p>
          </div>
          <p className="text-xs text-zinc-600 mb-3">Click any config to expand the design lesson.</p>
          <div className="space-y-2">
            {scenario.configs.map((cfg) => (
              <CollapsibleConfigCard key={cfg.id} cfg={cfg} />
            ))}
          </div>
        </div>
      ))}

      {topView === "lab" && (
        <footer className="border-t border-zinc-800 mt-12 px-6 py-4 text-center">
          <p className="text-xs text-zinc-600">GenAI Systems Lab · RAG Lab · 6 production failure scenarios · Zero hosting cost · Open source</p>
        </footer>
      )}

      {topView === "qa" && (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center py-24 text-zinc-600 text-sm font-mono">Loading…</div>}>
          <QADashboard
            onNavigate={navigate}
            onOpenModule={(tab, moduleId) => {
              if (tab === "systems") setSystemsModule(moduleId);
              if (tab === "explore") setExploreModule(moduleId);
              if (tab === "agents") setAgentsModule(moduleId);
              navigate(tab);
            }}
          />
        </Suspense>
      )}

      {/* War Room — secret overlay, triggered by typing "business2026" in any BUILD tab */}
      {warRoomOpen && <WarRoom onClose={() => { warRoomOpenRef.current = false; setWarRoomOpen(false); }} />}

      {/* QA corner link — fixed bottom-left, subtle but findable */}
      {topView !== "qa" && (
        <button
          onClick={() => navigate("qa")}
          style={{ opacity: 0.45, zIndex: 9999, position: "fixed", bottom: 12, left: 12 }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.45"}
          className="text-[10px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 transition-colors select-none"
          title="Internal QA Console — or visit ?qa=1 or Cmd/Ctrl+Shift+Q">
          qa
        </button>
      )}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-fade-in
              \${t.type === "success" ? "bg-emerald-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-zinc-700 text-zinc-100"}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}
      </div>{/* end main column */}
    </div>
  );
}
