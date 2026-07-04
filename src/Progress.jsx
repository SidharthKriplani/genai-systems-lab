// src/Progress.jsx — Progress dashboard (extracted from App.jsx sprint 92c)
// Shows: weighted score, readiness by area, study plan, review queue, guided paths, detailed breakdown.

import { useState } from "react";
import { Icon } from "./Icon.jsx";
import { POSTS as GT_POSTS } from "./groundTruthIndex";
import { getAllAreasReadiness } from "./readiness";
import { supabase, signInWithGoogle } from "./supabase";
import { ALL_SCENARIOS, SCORE_TIERS } from "./ragScenarios";
import { computeBreakdown } from "./leaderboardUtils";
import ReadinessWidget from "./ReadinessWidget";

// ── Tier badge (local copy — original in App.jsx used by LeaderboardView) ──────
function TierBadge({ tier }) {
  const t = SCORE_TIERS[tier] || SCORE_TIERS.analyst_ready;
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${t.color} ${t.border}`}>
      {t.emoji} {t.label}
    </span>
  );
}

function LaneCard({ color, label, right, children }) {
  return (
    <div className="rounded-xl p-5 space-y-4" style={{ background: "linear-gradient(160deg, rgba(24,24,27,0.95) 0%, rgba(15,15,17,0.95) 100%)", border: "1px solid rgba(63,63,70,0.6)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function MiniBar({ value, total, color }) {
  const p = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(39,39,42,0.8)" }}>
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${p}%`, background: color, boxShadow: p > 0 ? `2px 0 6px ${color}70` : "none" }} />
    </div>
  );
}

// All 7 active Foundations tracks with module IDs (mirrors Concepts.jsx GYMS)
const FOUNDATIONS_TRACKS = [
  { id: "language-models",   label: "Language Models",   color: "#6366f1",
    modules: ["tokenizer","attention","attention-3d","transformer","seq-parallel","flashattn","sampling","nextoken","tempgame","training-signal"] },
  { id: "retrieval",         label: "Retrieval",         color: "#3b82f6",
    modules: ["embeddings","embeddings-3d","cosine-sim","chunking","rag-pipeline","context"] },
  { id: "ai-agents",         label: "AI Agents",         color: "#f59e0b",
    modules: ["agent","agent-tools","multiagent","guardrails"] },
  { id: "evaluation",        label: "Evaluation",        color: "#22c55e",
    modules: ["eval-loop","debug","llm-as-judge","eval-design"] },
  { id: "production",        label: "Production Systems",color: "#8b5cf6",
    modules: ["cost-latency-concepts","latency-planner","observability-concepts"] },
  { id: "foundation-models", label: "Foundation Models", color: "#ec4899",
    modules: ["scaling-laws","lora","diffusion-3d"] },
  { id: "prompt-engineering",label: "Prompt Engineering",color: "#06b6d4",
    modules: ["few-shot","chain-of-thought"] },
];

export default function ProgressView({ visited, visitedModules, leaderboard, onNavigate, bookmarks = new Set(), toggleBookmark = () => {}, user = null }) {
  // ── Data reads ─────────────────────────────────────────────────────────────────
  const history    = (() => { try { return JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}"); } catch { return {}; } })();
  const mastery    = (() => { try { return new Set(JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]")); } catch { return new Set(); } })();
  const spaced     = (() => { try { return JSON.parse(localStorage.getItem("gsl-preplab-spaced") || "{}"); } catch { return {}; } })();
  const streak     = (() => { try { return parseInt(localStorage.getItem("gsl-streak") || "0", 10); } catch { return 0; } })();
  const gtRead     = (() => { try { return new Set(JSON.parse(localStorage.getItem("genai_gt_read") || "[]")); } catch { return new Set(); } })();
  const areasReady = getAllAreasReadiness();
  const bd         = computeBreakdown();

  // ── Aggregate stats ────────────────────────────────────────────────────────────
  const histKeys      = Object.keys(history);
  const totalAnswered = histKeys.length;
  const correctCount  = histKeys.filter(k => {
    const rec = history[k]; return (rec?.attempts ?? 0) - (rec?.wrong ?? 0) > 0;
  }).length;
  const prepPct       = totalAnswered > 0 ? Math.round(correctCount / totalAnswered * 100) : 0;
  const ragPassed     = leaderboard.filter(e => e.passed).length;
  const totalFoundations = FOUNDATIONS_TRACKS.reduce((s, t) => s + t.modules.length, 0);
  const masteredCount    = FOUNDATIONS_TRACKS.reduce((s, t) => s + t.modules.filter(m => mastery.has(m)).length, 0);

  const LEVEL_RANK   = { "Just Starting": 0, "Building": 1, "Practitioner": 2, "Senior": 3, "Staff": 4 };
  const activeAreas  = Object.values(areasReady).filter(Boolean);
  const roleLevel    = activeAreas.length === 0 ? "Getting Started"
    : activeAreas.reduce((best, r) => (LEVEL_RANK[r.level] || 0) > (LEVEL_RANK[best] || 0) ? r.level : best, "Just Starting");

  // ── Study Plan ─────────────────────────────────────────────────────────────────
  const studyPlan = [];
  const TOPICS_MAP = { rag:"Retrieval", agents:"Agents", eval:"Evaluation", llmops:"Production", ft:"Foundations", finetuning:"Foundations", safety:"Foundations" };
  const topicAccuracy = {};
  histKeys.forEach(k => {
    const topic = Object.keys(TOPICS_MAP).find(p => k.startsWith(p + "-"));
    if (!topic) return;
    if (!topicAccuracy[topic]) topicAccuracy[topic] = { correct: 0, total: 0 };
    topicAccuracy[topic].total += 1;
    if ((history[k]?.attempts ?? 0) - (history[k]?.wrong ?? 0) > 0) topicAccuracy[topic].correct += 1;
  });
  const weakTopic = Object.entries(topicAccuracy)
    .filter(([, v]) => v.total >= 3)
    .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))[0];
  if (weakTopic) {
    const [topicKey, { correct, total }] = weakTopic;
    const pct = Math.round(correct / total * 100);
    const areaLabel = TOPICS_MAP[topicKey] || topicKey;
    const areaTab = { rag:"retrieval", agents:"agentshub", eval:"evaluation", llmops:"production", ft:"concepts", finetuning:"concepts", safety:"concepts" }[topicKey] || "preplab";
    studyPlan.push({ id: "weak-topic", label: `${areaLabel} accuracy is ${pct}% — your weakest area`, reason: `${total} questions answered with only ${pct}% correct. One focused session should move this.`, tab: areaTab, cta: `Open ${areaLabel} →` });
  }
  const now = Date.now();
  const SRS_INTERVALS = [86400000, 259200000, 604800000];
  const dueItems = Object.entries(spaced).filter(([, v]) => {
    const interval = SRS_INTERVALS[Math.min((v.wrongCount || 1) - 1, SRS_INTERVALS.length - 1)];
    return (now - v.lastWrong) >= interval;
  });
  if (dueItems.length > 0) {
    studyPlan.push({ id: "review-due", label: `${dueItems.length} question${dueItems.length > 1 ? "s" : ""} due for review`, reason: `Reviewing wrong answers at the right interval is the most efficient path to long-term retention.`, tab: "preplab", cta: "Start Review →" });
  }
  const hubOrder = [["retrieval","Retrieval"],["evaluation","Evaluation"],["agentshub","Agents"],["production","Production"]];
  const unvisitedHub = hubOrder.find(([id]) => !visited.has(id) && !areasReady[id]);
  if (unvisitedHub && studyPlan.length < 4) {
    studyPlan.push({ id: "unvisited-hub", label: `Explore ${unvisitedHub[1]} — you haven't started this area`, reason: `Each challenge area surfaces different production failure modes. ${unvisitedHub[1]} is the next one to unlock.`, tab: unvisitedHub[0], cta: `Open ${unvisitedHub[1]} →` });
  }
  if (ragPassed === 0 && studyPlan.length < 4) {
    studyPlan.push({ id: "rag-lab", label: "Try the RAG Lab — configure a real failure mode", reason: "The fastest way to build production intuition. Most people who try it become regulars.", tab: "lab", cta: "Open RAG Lab →" });
  }
  if (gtRead.size < 3 && studyPlan.length < 5) {
    studyPlan.push({ id: "gt-read", label: "Read a Ground Truth post in your weakest area", reason: "Ground Truth posts add production context that interactive labs alone don't give.", tab: "groundtruth", cta: "Open Ground Truth →" });
  }

  // ── Review Queue ───────────────────────────────────────────────────────────────
  const reviewQueue = dueItems.slice(0, 6).map(([qId]) => {
    const topic = Object.keys(TOPICS_MAP).find(p => qId.startsWith(p + "-")) || "general";
    return { qId, topicLabel: TOPICS_MAP[topic] || topic };
  });

  // ── Guided Paths ───────────────────────────────────────────────────────────────
  const visitedSet = visited instanceof Set ? visited : new Set(visited);
  const ragQs   = histKeys.filter(k => k.startsWith("rag-"));
  const agentQs = histKeys.filter(k => k.startsWith("agents-"));
  const evalQs  = histKeys.filter(k => k.startsWith("eval-"));
  const ragAcc   = ragQs.length   > 0 ? ragQs.filter(k => (history[k]?.attempts ?? 0) - (history[k]?.wrong ?? 0) > 0).length / ragQs.length : 0;
  const agentAcc = agentQs.length > 0 ? agentQs.filter(k => (history[k]?.attempts ?? 0) - (history[k]?.wrong ?? 0) > 0).length / agentQs.length : 0;
  const evalAcc  = evalQs.length  > 0 ? evalQs.filter(k => (history[k]?.attempts ?? 0) - (history[k]?.wrong ?? 0) > 0).length / evalQs.length : 0;

  const PATHS = [
    { id: "getting-started", label: "Getting Started", color: "#6366f1", desc: "Build intuition for production AI systems.",
      steps: [
        { label: "Open Foundations track", done: visitedSet.has("concepts"), tab: "concepts" },
        { label: "Complete Tokenizer module", done: mastery.has("tokenizer"), tab: "concepts" },
        { label: "Open Retrieval hub", done: visitedSet.has("retrieval"), tab: "retrieval" },
        { label: "Pass a RAG Lab scenario", done: ragPassed >= 1, tab: "lab" },
        { label: "Answer 10 PrepLab questions", done: histKeys.length >= 10, tab: "preplab" },
        { label: "Open Evaluation hub", done: visitedSet.has("evaluation"), tab: "evaluation" },
        { label: "Answer 20 questions total", done: histKeys.length >= 20, tab: "preplab" },
      ]},
    { id: "rag-expert", label: "RAG Production Ready", color: "var(--gal-build)", desc: "Master retrieval — the #1 production failure mode.",
      steps: [
        { label: "Pass 2 RAG Lab scenarios", done: ragPassed >= 2, tab: "lab" },
        { label: "Pass all 6 RAG scenarios", done: ragPassed >= 6, tab: "lab" },
        { label: "Complete Embeddings module", done: mastery.has("embeddings"), tab: "concepts" },
        { label: "Read 'How RAG Works'", done: gtRead.has("how-rag-works"), tab: "groundtruth" },
        { label: "60%+ RAG accuracy", done: ragQs.length >= 5 && ragAcc >= 0.6, tab: "retrieval" },
        { label: "60%+ Eval accuracy", done: evalQs.length >= 5 && evalAcc >= 0.6, tab: "evaluation" },
      ]},
    { id: "interview-sprint", label: "Interview Sprint", color: "#22c55e", desc: "Get interview-ready across all five challenge areas.",
      steps: [
        { label: "Answer 20 PrepLab questions", done: histKeys.length >= 20, tab: "preplab" },
        { label: "60%+ RAG accuracy", done: ragQs.length >= 5 && ragAcc >= 0.6, tab: "retrieval" },
        { label: "Open Agents hub", done: visitedSet.has("agentshub"), tab: "agentshub" },
        { label: "60%+ Agents accuracy", done: agentQs.length >= 5 && agentAcc >= 0.6, tab: "agentshub" },
        { label: "60%+ Evaluation accuracy", done: evalQs.length >= 5 && evalAcc >= 0.6, tab: "evaluation" },
        { label: "Answer 50 total questions", done: histKeys.length >= 50, tab: "preplab" },
      ]},
  ].map(p => {
    const done = p.steps.filter(s => s.done).length;
    const next = p.steps.find(s => !s.done);
    return { ...p, done, total: p.steps.length, pct: Math.round(done / p.steps.length * 100), nextStep: next };
  });

  // ── BUILD lane ─────────────────────────────────────────────────────────────────
  const tierRank = t => SCORE_TIERS[t]?.rank || 0;
  const byScenario = ALL_SCENARIOS.map(s => {
    const entries = leaderboard.filter(e => e.scenarioId === s.scenario_id);
    const bestTier = entries.reduce((best, e) => {
      if (!e.tier) return best;
      return !best || tierRank(e.tier) > tierRank(best) ? e.tier : best;
    }, null);
    return { ...s, entries, bestTier, attempted: entries.length > 0 };
  });
  const ragSolved   = byScenario.filter(s => s.bestTier && SCORE_TIERS[s.bestTier]?.rank >= 3).length;
  const bestOverall = leaderboard.reduce((best, e) => {
    if (!e.tier) return best;
    return !best || tierRank(e.tier) > tierRank(best) ? e.tier : best;
  }, null);
  const OTHER_LABS = [
    { id: "agentlab", label: "Agent Lab", total: 16, color: "#f59e0b" },
    { id: "evallab",  label: "Eval Lab",  total: 15, color: "#6366f1" },
    { id: "llmlab",   label: "LLM Lab",   total: 9,  color: "#3b82f6" },
  ];

  // ── PROVE lane ─────────────────────────────────────────────────────────────────
  const TOPICS = [
    { key: "rag", label: "RAG" }, { key: "agents", label: "Agents" }, { key: "eval", label: "Evaluation" },
    { key: "finetuning", label: "Fine-Tuning" }, { key: "llmops", label: "LLMOps" },
    { key: "safety", label: "Safety" }, { key: "product", label: "Product" },
    { key: "behavioral", label: "Behavioral" }, { key: "multimodal", label: "Multimodal" },
    { key: "reasoning", label: "Reasoning" }, { key: "serving", label: "Serving" },
  ];
  const topicStats = TOPICS.map(({ key, label }) => {
    const ids = Object.keys(history).filter(id => id.startsWith(key + "-"));
    const total = ids.reduce((s, id) => s + (history[id]?.attempts || 0), 0);
    const wrong = ids.reduce((s, id) => s + (history[id]?.wrong || 0), 0);
    const correct = total - wrong;
    const pct = total > 0 ? Math.round((correct / total) * 100) : null;
    return { key, label, qCount: ids.length, total, correct, pct };
  }).filter(t => t.qCount > 0).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));

  const isFirstTime = ragPassed === 0 && totalAnswered === 0 && mastery.size === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

      {/* ── First-time banner ── */}
      {isFirstTime && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(99,102,241,0.06) 100%)", border: "1px solid rgba(34,211,238,0.25)" }}>
          <span className="text-[10px] font-black font-mono uppercase tracking-widest" style={{ color: "var(--gal-build)" }}>Start here</span>
          <p className="text-sm text-zinc-200 leading-relaxed font-semibold">Build your first production judgment in under 5 minutes.</p>
          <p className="text-xs text-zinc-400 leading-relaxed">Configure a real RAG system, watch it hallucinate, understand exactly why — and what you'd say about it in a senior AI engineering interview.</p>
          <button onClick={() => onNavigate("lab")} className="w-full py-3 rounded-xl text-sm font-black transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--gal-build) 0%, #6366f1 100%)", color: "#fff" }}>
            Open RAG Lab — Scenario 1 →
          </button>
        </div>
      )}

      {/* ── Stats banner ── */}
      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)", border: "1px solid rgba(99,102,241,0.25)" }}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {user ? (
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="avatar" className="w-7 h-7 rounded-full border border-violet-700/50" />
              )}
              <span className="text-sm font-bold text-white">{user.user_metadata?.full_name || user.email?.split("@")[0]}</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                since {user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "recently"}
              </span>
            </div>
          ) : supabase && (
            <button onClick={signInWithGoogle} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
              Sign in to save across devices →
            </button>
          )}
          <span className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}>
            {roleLevel}
          </span>
          {streak > 0 && (
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
              {streak} day streak
            </span>
          )}
        </div>

        {/* Four stats: questions, lab scenarios, foundations, weighted score */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-black text-white">{totalAnswered}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Questions</p>
            {totalAnswered > 0 && <p className="text-xs text-zinc-400 mt-0.5">{prepPct}% correct</p>}
          </div>
          <div>
            <p className="text-2xl font-black text-white">{ragPassed}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Lab Scenarios</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{masteredCount}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Foundations</p>
            <p className="text-xs text-zinc-400 mt-0.5">of {totalFoundations} modules</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{bd.total.toLocaleString()}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Score</p>
            {user && (
              <button onClick={() => onNavigate("leaderboard")} className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors mt-0.5">
                See board →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Readiness widget (score + target countdown + weakest-area CTA) ── */}
      <ReadinessWidget onNavigate={onNavigate} />

      {/* ── Readiness by area ── */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Readiness by area</p>
        {[
          { id: "retrieval",   label: "Retrieval",   color: "var(--gal-build)" },
          { id: "evaluation",  label: "Evaluation",  color: "#f59e0b" },
          { id: "agentshub",   label: "Agents",      color: "#a78bfa" },
          { id: "production",  label: "Production",  color: "#22c55e" },
          { id: "foundations", label: "Foundations", color: "#3b82f6" },
        ].map(area => {
          const r = areasReady[area.id];
          return (
            <button key={area.id} onClick={() => onNavigate(area.id)}
              className="w-full flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
              <span className="text-xs font-mono text-zinc-400 w-24 shrink-0">{area.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${r ? r.pct : 0}%`, background: area.color, opacity: r ? 1 : 0.3 }} />
              </div>
              <span className="text-[10px] font-mono w-24 shrink-0 text-right" style={{ color: r ? area.color : "#52525b" }}>
                {r ? r.level : "Not started"}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Study plan ── */}
      {studyPlan.length > 0 && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Study plan</p>
            <span className="text-[10px] font-mono text-zinc-600">{studyPlan.length} suggestions</span>
          </div>
          <div className="space-y-2">
            {studyPlan.map((item, i) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.5)" }}>
                <span className="text-[10px] font-bold text-zinc-600 w-4 shrink-0 mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 leading-snug">{item.label}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{item.reason}</p>
                </div>
                <button onClick={() => onNavigate(item.tab)}
                  className="text-[10px] font-bold shrink-0 px-2.5 py-1 rounded-md transition-all hover:opacity-80"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}>
                  {item.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Review queue ── */}
      {reviewQueue.length > 0 && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: "#f59e0b" }}>Review queue ({reviewQueue.length})</p>
            <button onClick={() => onNavigate("preplab")} className="text-[10px] font-mono font-bold transition-all hover:opacity-80" style={{ color: "#f59e0b" }}>
              Start Review →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {reviewQueue.map(item => (
              <span key={item.qId} className="text-[10px] font-mono px-2.5 py-1 rounded-md"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}>
                {item.qId} · {item.topicLabel}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Guided paths ── */}
      <div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-3">Guided paths</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PATHS.map(path => (
            <div key={path.id} className="rounded-xl p-4 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest font-bold mb-1" style={{ color: path.color }}>{path.label}</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{path.desc}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-500">{path.done}/{path.total} steps</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: path.color }}>{path.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${path.pct}%`, background: path.color }} />
                </div>
              </div>
              {path.nextStep ? (
                <button onClick={() => onNavigate(path.nextStep.tab)}
                  className="w-full text-left text-xs font-bold py-2 px-3 rounded-lg transition-all hover:opacity-80"
                  style={{ background: path.color + "15", border: `1px solid ${path.color}30`, color: path.color }}>
                  Continue: {path.nextStep.label} →
                </button>
              ) : (
                <div className="text-xs font-bold py-2 px-3 rounded-lg text-center"
                  style={{ background: path.color + "15", border: `1px solid ${path.color}30`, color: path.color }}>
                  Path complete ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800/60 pt-2">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Detailed breakdown</p>
      </div>

      {/* ── BUILD ── */}
      <LaneCard color="#3b82f6" label="BUILD — Labs"
        right={<button onClick={() => onNavigate("lab")} className="text-[10px] font-mono text-blue-400 hover:text-blue-300 transition-all">Open RAG Lab →</button>}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-300">RAG Lab</span>
            <div className="flex items-center gap-2">
              {bestOverall && <TierBadge tier={bestOverall} />}
              <span className="text-[10px] font-mono text-zinc-500">{ragSolved}/6 solved</span>
            </div>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No challenge attempts yet — enable Challenge Mode in RAG Lab.</p>
          ) : (
            <div className="space-y-1.5">
              {byScenario.map((s, i) => (
                <div key={s.scenario_id} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-600 w-3 shrink-0">{i + 1}</span>
                  <span className="text-xs text-zinc-400 flex-1 truncate">{s.title}</span>
                  {s.bestTier ? <TierBadge tier={s.bestTier} />
                    : s.attempted ? <span className="text-[10px] font-mono text-amber-600 border border-amber-900/60 px-1.5 py-0.5 rounded">Tried</span>
                    : <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded">Open</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-3 pt-1 border-t border-zinc-800/60">
          {OTHER_LABS.map(lab => {
            const vc = [...visitedModules].filter(k => k.startsWith(lab.id + ":")).length;
            return (
              <div key={lab.id}>
                <div className="flex items-center justify-between mb-1">
                  <button onClick={() => onNavigate(lab.id)} className="text-xs font-semibold text-zinc-300 hover:text-white transition-all">{lab.label}</button>
                  <span className="text-[10px] font-mono text-zinc-500">{vc}/{lab.total} visited</span>
                </div>
                <MiniBar value={vc} total={lab.total} color={lab.color} />
              </div>
            );
          })}
        </div>
      </LaneCard>

      {/* ── PROVE ── */}
      <LaneCard color="#22c55e" label="PROVE — PrepLab"
        right={<button onClick={() => onNavigate("preplab")} className="text-[10px] font-mono text-green-400 hover:text-green-300 transition-all">Open PrepLab →</button>}>
        {topicStats.length === 0 ? (
          <div className="text-center py-3 space-y-2">
            <p className="text-xs text-zinc-500">No PrepLab attempts yet.</p>
            <button onClick={() => onNavigate("preplab")} className="text-xs text-green-400 font-mono hover:text-green-300 transition-all">Start Trainer Mode →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {topicStats.map(t => {
              const color = t.pct === null ? "#52525b" : t.pct >= 75 ? "#22c55e" : t.pct >= 50 ? "#f59e0b" : "#ef4444";
              return (
                <div key={t.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-300">{t.label}</span>
                    <span className="text-[10px] font-mono" style={{ color }}>{t.pct !== null ? `${t.pct}%` : "—"} <span className="text-zinc-600">({t.correct}/{t.total})</span></span>
                  </div>
                  <MiniBar value={t.correct} total={t.total} color={color} />
                </div>
              );
            })}
            <p className="text-[10px] text-zinc-600 pt-1">{Object.keys(history).length} questions · {topicStats.length} topic{topicStats.length !== 1 ? "s" : ""} active</p>
          </div>
        )}
      </LaneCard>

      {/* ── KNOW — Foundations ── */}
      <LaneCard color="#8b5cf6" label="KNOW — Foundations"
        right={<button onClick={() => onNavigate("concepts")} className="text-[10px] font-mono text-violet-400 hover:text-violet-300 transition-all">Open Foundations →</button>}>
        {masteredCount === 0 ? (
          <div className="text-center py-3 space-y-2">
            <p className="text-xs text-zinc-500">No modules completed yet.</p>
            <button onClick={() => onNavigate("concepts")} className="text-xs text-violet-400 font-mono hover:text-violet-300 transition-all">Open Foundations →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {FOUNDATIONS_TRACKS.map(track => {
              const done = track.modules.filter(m => mastery.has(m)).length;
              if (done === 0) return null;
              return (
                <div key={track.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-300">{track.label}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{done}/{track.modules.length}</span>
                  </div>
                  <MiniBar value={done} total={track.modules.length} color={track.color} />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {track.modules.map(m => (
                      <span key={m} className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${mastery.has(m) ? "border-zinc-600 bg-zinc-800 text-zinc-300" : "border-zinc-800 text-zinc-700"}`}>
                        {mastery.has(m) ? "✓ " : ""}{m.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </LaneCard>

      {/* ── Bookmarked posts ── */}
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
                  <button onClick={() => toggleBookmark(id)} className="text-zinc-500 hover:text-red-400 text-xs shrink-0"><Icon name="x" size={14} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
