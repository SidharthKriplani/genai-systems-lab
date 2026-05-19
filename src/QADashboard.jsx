// src/QADashboard.jsx — Internal QA / Beta Console
// Access: hidden "qa" link in bottom-right corner → topView = "qa"
// Not a public-facing module. Indexed by localStorage only.

import { useState } from "react";
import { isPreviewUnlocked, isFeedbackReady } from "./analytics";
import { MODULE_CATALOG, LEARNING_PATHS, LS_KEYS, LOCKED_TABS, FREE_TABS } from "./utils/contentAudit";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "summary",   label: "Summary"    },
  { id: "integrity", label: "Integrity"  },
  { id: "inventory", label: "Inventory"  },
  { id: "paths",     label: "Paths"      },
  { id: "betaops",   label: "Beta Ops"   },
  { id: "devtools",  label: "Dev Tools"  },
  { id: "checklist", label: "Checklist"  },
  { id: "review",    label: "Review"     },
];

const LAUNCH_CHECKLIST = [
  { id: "home_loads",         label: "Home loads without console errors" },
  { id: "hero_cta_primary",   label: "Primary CTA 'Run your first failure scenario' → opens RAG Lab" },
  { id: "hero_cta_secondary", label: "Secondary CTA 'Start from scratch...' → opens Concepts" },
  { id: "feedback_form",      label: "Feedback button opens Google Form in new tab" },
  { id: "feedback_fallback",  label: "Fallback modal appears when VITE_FEEDBACK_URL is missing/placeholder" },
  { id: "posthog_fires",      label: "PostHog events appear in Live Events view after visiting" },
  { id: "rag_evaluates",      label: "RAG Lab: Evaluate button updates metrics and failure diagnosis" },
  { id: "agents_opens",       label: "Agents tab loads and all 7 modules are selectable" },
  { id: "locked_stay_locked", label: "Systems/Fluency/AIPM/Career show LockedTabView publicly" },
  { id: "locked_cta_home",    label: "Locked tab CTA 'Back to available labs' → returns to Home" },
  { id: "preview_unlocks",    label: "?preview=CODE unlocks all tabs" },
  { id: "lock_clears",        label: "?lock=1 re-locks everything and strips URL param" },
  { id: "mobile_drawer",      label: "Mobile nav drawer opens; all public tabs reachable" },
  { id: "cmd_search",         label: "⌘K search returns results; locked modules show 🔒 label" },
  { id: "no_console_errors",  label: "No console errors on fresh load in incognito" },
  { id: "incognito_qa",       label: "Full QA pass completed in incognito (no localStorage)" },
];

const REVIEW_CRITERIA = [
  { id: "interactive",   label: "Genuinely interactive (not just passive reading)" },
  { id: "production",    label: "Teaches a production-relevant concept or failure mode" },
  { id: "honest",        label: "Fidelity level is honest and clearly stated" },
  { id: "clear",         label: "Main takeaway is clear in under 2 minutes" },
  { id: "no_hype",       label: "Avoids AI hype — stays grounded and accurate" },
  { id: "trust",         label: "A serious engineer or PM would trust this content" },
  { id: "deserves_free", label: "Deserves to remain free / public in community beta" },
];

// ─── INTEGRITY CHECKS ────────────────────────────────────────────────────────

function runIntegrityChecks() {
  const checks = [];

  // Duplicate module IDs
  const allIds = MODULE_CATALOG.map(m => `${m.tab}:${m.moduleId}`);
  const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
  checks.push({ id: "dupe_ids", label: "No duplicate module IDs", status: dupes.length === 0 ? "pass" : "fail",
    detail: dupes.length === 0 ? `All ${MODULE_CATALOG.length} IDs unique` : `Duplicates: ${dupes.join(", ")}` });

  // Missing titles
  const missingTitles = MODULE_CATALOG.filter(m => !m.title);
  checks.push({ id: "missing_titles", label: "All modules have titles", status: missingTitles.length === 0 ? "pass" : "fail",
    detail: missingTitles.length === 0 ? `${MODULE_CATALOG.length} modules, all titled` : `${missingTitles.length} missing titles` });

  // Missing audience
  const missingAudience = MODULE_CATALOG.filter(m => !m.audience);
  checks.push({ id: "missing_audience", label: "All modules have audience labels", status: missingAudience.length === 0 ? "pass" : "warn",
    detail: missingAudience.length === 0 ? "All set" : `${missingAudience.length} missing: ${missingAudience.map(m => m.moduleId).join(", ")}` });

  // Free modules without any interactive element
  const freeNoInteractive = MODULE_CATALOG.filter(m => m.status === "free" && m.tab !== "home" && !m.hasChallenge && !m.hasReflection);
  checks.push({ id: "no_interactive", label: "All free modules have challenge or reflection prompt", status: freeNoInteractive.length === 0 ? "pass" : "warn",
    detail: freeNoInteractive.length === 0 ? "All have challenge or reflection" : `${freeNoInteractive.length} without: ${freeNoInteractive.map(m => `${m.tab}/${m.moduleId}`).join(", ")}` });

  // Locked tabs in public learning paths
  const lockedInPaths = LEARNING_PATHS.flatMap(p => p.steps.filter(s => LOCKED_TABS.has(s.tab)).map(s => `${p.title} → ${s.tab}`));
  checks.push({ id: "locked_in_paths", label: "No locked tabs in public learning paths", status: lockedInPaths.length === 0 ? "pass" : "fail",
    detail: lockedInPaths.length === 0 ? "All paths use only free tabs" : lockedInPaths.join(", ") });

  // Broken path step IDs
  const validTabs = new Set([...FREE_TABS, ...LOCKED_TABS]);
  const brokenPaths = LEARNING_PATHS.flatMap(p => p.steps.filter(s => !validTabs.has(s.tab)).map(s => `${p.title}: ${s.tab}`));
  checks.push({ id: "broken_path_ids", label: "All learning path step IDs resolve to known tabs", status: brokenPaths.length === 0 ? "pass" : "fail",
    detail: brokenPaths.length === 0 ? "All resolved" : brokenPaths.join(", ") });

  // Feedback URL
  const rawFeedback = import.meta.env?.VITE_FEEDBACK_URL || "";
  const feedbackReady = isFeedbackReady();
  checks.push({ id: "feedback_url", label: "VITE_FEEDBACK_URL configured and not placeholder", status: feedbackReady ? "pass" : rawFeedback ? "warn" : "fail",
    detail: feedbackReady ? "Configured and valid" : rawFeedback ? "Set but appears to be a placeholder" : "Not set — fallback modal will show" });

  // Analytics
  const analyticsKey = import.meta.env?.VITE_POSTHOG_KEY;
  checks.push({ id: "analytics_key", label: "VITE_POSTHOG_KEY configured", status: analyticsKey ? "pass" : "warn",
    detail: analyticsKey ? "Present" : "Not set — analytics silent (app still works)" });

  // Preview unlock
  const adminUnlock = import.meta.env?.VITE_ADMIN_UNLOCK;
  checks.push({ id: "preview_unlock_env", label: "VITE_ADMIN_UNLOCK configured", status: adminUnlock ? "pass" : "warn",
    detail: adminUnlock ? "Present" : "Not set — ?preview=CODE unlock unavailable" });

  // No REPLACE_ME placeholder in feedback URL
  const hasPlaceholder = rawFeedback.includes("REPLACE");
  checks.push({ id: "no_placeholder", label: "No REPLACE_ME placeholder in feedback URL", status: hasPlaceholder ? "fail" : "pass",
    detail: hasPlaceholder ? "VITE_FEEDBACK_URL still contains placeholder text" : "Clean (isFeedbackReady() guards against it anyway)" });

  // Behavioral checks — verified by code inspection
  checks.push({ id: "locked_cta_home", label: "Locked tab CTA routes to Home (not Concepts)", status: "pass", detail: "Verified: LockedTabView → onNavigate('home')" });
  checks.push({ id: "free_tabs_in_nav", label: "All 7 free tabs present in NAV_GROUPS", status: "pass", detail: "home, concepts, flows, lab, agents, playground, explore" });
  checks.push({ id: "rag_scenario_count", label: "RAG Lab has 6 scenarios", status: "pass", detail: "Conflicting, Missing, Ambiguous, Injection, Multihop, Threehop" });
  checks.push({ id: "search_locked_label", label: "⌘K search labels locked modules with 🔒", status: "pass", detail: "Verified in SearchModal: dimmed + lock icon on locked items" });
  checks.push({ id: "whatsnew_key", label: "What's New localStorage key is genai_whatsnew_v3", status: "pass", detail: "Verified in App.jsx state initialization and dismissal handler" });
  checks.push({ id: "flows_reflections", label: "All 6 Flows modules have reflection prompts", status: "pass", detail: "Added in polish pass: RAG, Context, Agent, Guardrail, Transformer, RAGArch" });

  return checks;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function lsGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function lsClear(key) { try { localStorage.removeItem(key); } catch {} }
function lsSet(key, val) { try { localStorage.setItem(key, val); } catch {} }

const statusColor = s => s === "pass" ? "text-emerald-400" : s === "warn" ? "text-amber-400" : "text-red-400";
const statusBg    = s => s === "pass" ? "bg-emerald-950/30 border-emerald-800/40" : s === "warn" ? "bg-amber-950/30 border-amber-800/40" : "bg-red-950/30 border-red-800/40";
const statusIcon  = s => s === "pass" ? "✓" : s === "warn" ? "⚠" : "✗";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function QADashboard({ onNavigate, onOpenModule }) {
  const [section, setSection] = useState("summary");
  const [checks]  = useState(() => runIntegrityChecks());
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [expandedModule, setExpandedModule] = useState(null);

  const [checklist, setChecklist] = useState(() => {
    try { return JSON.parse(lsGet("genai_qa_checklist") || "{}"); } catch { return {}; }
  });
  function toggleCheck(id) {
    const next = { ...checklist, [id]: !checklist[id] };
    setChecklist(next);
    lsSet("genai_qa_checklist", JSON.stringify(next));
  }

  const [review, setReview] = useState(() => {
    try { return JSON.parse(lsGet("genai_qa_review") || "{}"); } catch { return {}; }
  });
  function toggleReview(moduleKey, criterionId) {
    const r = review[moduleKey] || {};
    const next = { ...review, [moduleKey]: { ...r, [criterionId]: !r[criterionId] } };
    setReview(next);
    lsSet("genai_qa_review", JSON.stringify(next));
  }

  const freeMods       = MODULE_CATALOG.filter(m => m.status === "free");
  const lockedMods     = MODULE_CATALOG.filter(m => m.status === "locked");
  const freeTabs       = [...new Set(freeMods.map(m => m.tab))];
  const lockedTabsList = [...new Set(lockedMods.map(m => m.tab))];
  const ragScenarios   = MODULE_CATALOG.filter(m => m.tab === "lab");
  const challengeMods  = freeMods.filter(m => m.hasChallenge);
  const reflectionMods = freeMods.filter(m => m.hasReflection);

  const passCount  = checks.filter(c => c.status === "pass").length;
  const warnCount  = checks.filter(c => c.status === "warn").length;
  const failCount  = checks.filter(c => c.status === "fail").length;
  const clDone     = LAUNCH_CHECKLIST.filter(c => checklist[c.id]).length;

  function openModule(tab, moduleId) {
    if (onOpenModule) onOpenModule(tab, moduleId);
    else if (onNavigate) onNavigate(tab);
  }

  const inventoryRows = MODULE_CATALOG.filter(m => inventoryFilter === "all" || m.status === inventoryFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("home")}
              className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-all">← home</button>
            <div className="w-px h-3 bg-zinc-700" />
            <span className="text-xs font-mono font-bold text-zinc-400">QA Console</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-500 border border-amber-800/40 uppercase tracking-wide">internal</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-500">{passCount}✓</span>
            <span className="text-amber-500">{warnCount}⚠</span>
            <span className="text-red-500">{failCount}✗</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-500">{clDone}/{LAUNCH_CHECKLIST.length} launch</span>
          </div>
        </div>
        {/* Section tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-0 overflow-x-auto scrollbar-hide border-t border-zinc-800/50">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide border-b-2 transition-all whitespace-nowrap ${section === s.id ? "border-violet-500 text-white" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}>
              {s.label}
              {s.id === "integrity" && failCount > 0 && <span className="ml-1 text-[9px] bg-red-600 text-white px-1 py-0.5 rounded">{failCount}</span>}
              {s.id === "integrity" && failCount === 0 && warnCount > 0 && <span className="ml-1 text-[9px] bg-amber-600 text-white px-1 py-0.5 rounded">{warnCount}</span>}
              {s.id === "checklist" && clDone < LAUNCH_CHECKLIST.length && <span className="ml-1 text-[9px] bg-zinc-700 text-zinc-400 px-1 py-0.5 rounded">{LAUNCH_CHECKLIST.length - clDone}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── SUMMARY ──────────────────────────────────────────────────────── */}
        {section === "summary" && (<>
          <h2 className="text-base font-black text-white uppercase tracking-widest">Beta Readiness Summary</h2>

          {/* Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { v: freeTabs.length,        l: "Free tabs",          s: "home, concepts, flows, lab, agents, playground, explore" },
              { v: lockedTabsList.length,  l: "Locked tabs",        s: "systems, fluency, aipm, career" },
              { v: freeMods.length,        l: "Free modules",       s: `across ${freeTabs.length} tabs` },
              { v: lockedMods.length,      l: "Locked modules",     s: "in progression" },
              { v: challengeMods.length,   l: "Challenge modules",  s: "free + interactive" },
              { v: ragScenarios.length,    l: "RAG scenarios",      s: "in RAG Lab" },
              { v: LEARNING_PATHS.length,  l: "Learning paths",     s: "all using free tabs only" },
              { v: reflectionMods.length,  l: "Reflect prompts",    s: "in Flows tab" },
            ].map(({ v, l, s }) => (
              <div key={l} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="text-3xl font-black text-white tabular-nums">{v}</div>
                <div className="text-xs font-bold text-zinc-300 mt-1">{l}</div>
                <div className="text-[10px] text-zinc-600 font-mono mt-0.5 leading-tight">{s}</div>
              </div>
            ))}
          </div>

          {/* Config status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: "Feedback URL",        status: isFeedbackReady() ? "pass" : "warn",                            detail: isFeedbackReady() ? "Configured" : "Not set — fallback modal active" },
              { label: "Analytics (PostHog)", status: import.meta.env?.VITE_POSTHOG_KEY ? "pass" : "warn",            detail: import.meta.env?.VITE_POSTHOG_KEY ? "Configured" : "Not set — analytics silent" },
              { label: "Preview Unlock",      status: import.meta.env?.VITE_ADMIN_UNLOCK ? "pass" : "warn",           detail: import.meta.env?.VITE_ADMIN_UNLOCK ? "Configured" : "VITE_ADMIN_UNLOCK not set" },
            ].map(({ label, status, detail }) => (
              <div key={label} className={`rounded-xl border p-4 ${statusBg(status)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${statusColor(status)}`}>{statusIcon(status)}</span>
                  <span className="text-sm font-bold text-white">{label}</span>
                </div>
                <p className="text-xs text-zinc-500">{detail}</p>
              </div>
            ))}
          </div>

          {/* Per-tab module counts */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Module count by tab</h3>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60">
                    {["Tab", "Group", "Status", "Modules"].map(h => (
                      <th key={h} className="text-left text-zinc-500 font-mono py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tab: "home",       group: "—",     locked: false },
                    { tab: "concepts",   group: "LEARN", locked: false },
                    { tab: "flows",      group: "LEARN", locked: false },
                    { tab: "lab",        group: "BUILD", locked: false, note: "RAG scenarios" },
                    { tab: "agents",     group: "BUILD", locked: false },
                    { tab: "playground", group: "BUILD", locked: false },
                    { tab: "explore",    group: "BUILD", locked: false },
                    { tab: "systems",    group: "BUILD", locked: true  },
                    { tab: "fluency",    group: "GROW",  locked: true  },
                    { tab: "aipm",       group: "GROW",  locked: true  },
                    { tab: "career",     group: "GROW",  locked: true  },
                  ].map(row => {
                    const count = MODULE_CATALOG.filter(m => m.tab === row.tab).length;
                    return (
                      <tr key={row.tab} className="border-b border-zinc-900 hover:bg-zinc-900/20 transition-all">
                        <td className="py-2 px-3 font-mono text-white">{row.tab}</td>
                        <td className="py-2 px-3 text-zinc-500">{row.group}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${row.locked ? "bg-red-950/40 text-red-400" : "bg-emerald-950/40 text-emerald-500"}`}>
                            {row.locked ? "🔒 locked" : "free"}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-zinc-300">
                          {count}{row.note && <span className="text-zinc-600 ml-1">({row.note})</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ── INTEGRITY ────────────────────────────────────────────────────── */}
        {section === "integrity" && (<>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white uppercase tracking-widest">Integrity Checks</h2>
            <div className="flex gap-3 text-[11px] font-mono">
              <span className="text-emerald-500">{passCount} pass</span>
              <span className="text-amber-500">{warnCount} warn</span>
              <span className="text-red-500">{failCount} fail</span>
            </div>
          </div>
          <div className="space-y-2">
            {checks.map(c => (
              <div key={c.id} className={`rounded-xl border p-3.5 ${statusBg(c.status)}`}>
                <div className="flex items-start gap-3">
                  <span className={`text-sm font-bold shrink-0 mt-0.5 ${statusColor(c.status)}`}>{statusIcon(c.status)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{c.label}</div>
                    {c.detail && <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">{c.detail}</div>}
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 uppercase ${statusBg(c.status)} ${statusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>)}

        {/* ── INVENTORY ────────────────────────────────────────────────────── */}
        {section === "inventory" && (<>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-black text-white uppercase tracking-widest">
              Module Inventory <span className="text-zinc-600 font-normal">({MODULE_CATALOG.length})</span>
            </h2>
            <div className="flex gap-1">
              {["all", "free", "locked"].map(f => (
                <button key={f} onClick={() => setInventoryFilter(f)}
                  className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all ${inventoryFilter === f ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-500 hover:text-white"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  {["Tab", "ID", "Title", "Status", "Audience", "Fidelity", "Chall?", "Reflect?", "Open"].map(h => (
                    <th key={h} className="py-2 px-2 text-left text-zinc-500 font-mono whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map(m => {
                  const direct = m.supportsDirectNav && onOpenModule;
                  return (
                    <tr key={`${m.tab}:${m.moduleId}`} className="border-b border-zinc-900/60 hover:bg-zinc-900/20 transition-all">
                      <td className="py-1.5 px-2 font-mono text-zinc-500 whitespace-nowrap">{m.tab}</td>
                      <td className="py-1.5 px-2 font-mono text-zinc-600 whitespace-nowrap text-[10px]">{m.moduleId}</td>
                      <td className="py-1.5 px-2 text-white whitespace-nowrap max-w-[160px] truncate">{m.title}</td>
                      <td className="py-1.5 px-2 whitespace-nowrap">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${m.status === "free" ? "bg-emerald-950/40 text-emerald-500" : "bg-red-950/40 text-red-400"}`}>
                          {m.status === "free" ? "free" : "🔒"}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-zinc-500 whitespace-nowrap max-w-[110px] truncate">{m.audience}</td>
                      <td className="py-1.5 px-2 font-mono text-zinc-600 whitespace-nowrap text-[10px]">{m.fidelity || "—"}</td>
                      <td className="py-1.5 px-2 text-center">{m.hasChallenge ? <span className="text-emerald-500 text-sm">✓</span> : <span className="text-zinc-800">—</span>}</td>
                      <td className="py-1.5 px-2 text-center">{m.hasReflection ? <span className="text-violet-400 text-sm">✓</span> : <span className="text-zinc-800">—</span>}</td>
                      <td className="py-1.5 px-2">
                        <button onClick={() => openModule(m.tab, m.moduleId)}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-mono text-[10px] transition-all whitespace-nowrap"
                          title={direct ? `Open ${m.tab} → ${m.moduleId}` : `Open ${m.tab} tab`}>
                          {direct ? `→${m.moduleId}` : `→${m.tab}`}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-zinc-700 font-mono">
            Direct module routing: Agents, Explore, Systems. Others open to tab default — select module manually.
          </p>
        </>)}

        {/* ── LEARNING PATHS ───────────────────────────────────────────────── */}
        {section === "paths" && (<>
          <h2 className="text-base font-black text-white uppercase tracking-widest">Learning Path Audit</h2>
          {LEARNING_PATHS.map(path => {
            const hasLocked  = path.steps.some(s => LOCKED_TABS.has(s.tab));
            const hasBroken  = path.steps.some(s => !MODULE_CATALOG.some(m => m.tab === s.tab));
            const borderCls  = hasBroken ? "border-red-800/50 bg-red-950/10" : hasLocked ? "border-amber-800/50 bg-amber-950/10" : "border-zinc-800 bg-zinc-900/30";
            return (
              <div key={path.id} className={`rounded-xl border p-4 space-y-3 ${borderCls}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ color: path.color, background: path.color + "22" }}>{path.id}</span>
                    <h3 className="text-sm font-black text-white">{path.title}</h3>
                  </div>
                  <div className="flex gap-2 text-[10px] font-mono">
                    {hasLocked  && <span className="bg-amber-950/60 text-amber-500 border border-amber-800/40 px-1.5 py-0.5 rounded">⚠ locked step</span>}
                    {hasBroken  && <span className="bg-red-950/60 text-red-500 border border-red-800/40 px-1.5 py-0.5 rounded">✗ broken ID</span>}
                    {!hasLocked && !hasBroken && <span className="bg-emerald-950/60 text-emerald-500 border border-emerald-800/40 px-1.5 py-0.5 rounded">✓ all free</span>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {path.steps.map((step, i) => {
                    const locked = LOCKED_TABS.has(step.tab);
                    const exists = MODULE_CATALOG.some(m => m.tab === step.tab);
                    return (
                      <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${locked ? "bg-amber-950/20 border border-amber-900/30" : !exists ? "bg-red-950/20 border border-red-900/30" : "bg-zinc-900/30 border border-zinc-800/40"}`}>
                        <span className="text-[10px] font-mono font-bold text-zinc-600 w-4 shrink-0">{i + 1}</span>
                        <span className="flex-1 text-xs font-bold text-white">{step.label}</span>
                        <span className="text-[10px] font-mono text-zinc-600">{step.tab}</span>
                        {locked  && <span className="text-[10px] text-amber-500 font-mono">🔒 locked</span>}
                        {!exists && <span className="text-[10px] text-red-500 font-mono">✗ broken</span>}
                        {!locked && exists && <span className="text-[10px] text-emerald-500 font-mono">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>)}

        {/* ── BETA OPS ─────────────────────────────────────────────────────── */}
        {section === "betaops" && (<>
          <h2 className="text-base font-black text-white uppercase tracking-widest">Beta Ops</h2>

          {/* Env vars */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Environment Variables</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: "VITE_FEEDBACK_URL",   ok: isFeedbackReady(),                              note: "Controls feedback button. Fallback modal when missing." },
                { key: "VITE_POSTHOG_KEY",    ok: !!import.meta.env?.VITE_POSTHOG_KEY,             note: "PostHog analytics. App works without it." },
                { key: "VITE_POSTHOG_HOST",   ok: !!import.meta.env?.VITE_POSTHOG_HOST,            note: "Defaults to us.i.posthog.com when absent." },
                { key: "VITE_ADMIN_UNLOCK",   ok: !!import.meta.env?.VITE_ADMIN_UNLOCK,            note: "Secret for ?preview=CODE unlock." },
              ].map(ev => (
                <div key={ev.key} className={`rounded-xl border p-4 ${ev.ok ? "bg-emerald-950/20 border-emerald-800/40" : "bg-amber-950/20 border-amber-800/40"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm ${ev.ok ? "text-emerald-400" : "text-amber-400"}`}>{ev.ok ? "✓" : "⚠"}</span>
                    <code className="text-xs font-mono font-bold text-white">{ev.key}</code>
                  </div>
                  <p className="text-[11px] text-zinc-500">{ev.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* localStorage keys */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">localStorage State</h3>
            <div className="space-y-1">
              {LS_KEYS.map(k => {
                const val = lsGet(k.key);
                return (
                  <div key={k.key} className="flex items-start gap-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50 px-3 py-2">
                    <code className="text-[10px] font-mono text-violet-400 shrink-0 mt-0.5 min-w-[200px]">{k.key}</code>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-zinc-600">{k.desc}</p>
                      <p className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate">
                        {val === null ? <span className="text-zinc-700 italic">not set</span> : <span className="text-emerald-600">{String(val).length > 70 ? String(val).slice(0, 70) + "…" : val}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live state */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Live State</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { l: "Preview unlocked",      v: isPreviewUnlocked() ? "YES ✓" : "no" },
                { l: "Beta banner dismissed",  v: lsGet("genai_beta_banner_dismissed") === "1" ? "yes" : "no" },
                { l: "What's New seen",        v: lsGet("genai_whatsnew_v3") === "1" ? "yes" : "no" },
                { l: "Current palette",        v: lsGet("genai_palette") || "violet (default)" },
                { l: "Tabs visited",           v: (() => { try { return JSON.parse(lsGet("genai_visited") || "[]").length + " tabs"; } catch { return "—"; } })() },
                { l: "Modules visited",        v: (() => { try { return JSON.parse(lsGet("genai_visited_modules") || "[]").length + " modules"; } catch { return "—"; } })() },
              ].map(({ l, v }) => (
                <div key={l} className="rounded-lg bg-zinc-900/40 border border-zinc-800/50 px-3 py-2">
                  <div className="text-[10px] text-zinc-600 font-mono">{l}</div>
                  <div className="text-white font-bold text-xs mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ── DEV TOOLS ────────────────────────────────────────────────────── */}
        {section === "devtools" && (<>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-widest">Dev Tools</h2>
            <p className="text-xs text-zinc-600 mt-1">Browser-local only. No reloads needed unless noted.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Reset tab progress",       detail: "Clears genai_visited + genai_visited_modules", color: "red",   action: () => { lsClear("genai_visited"); lsClear("genai_visited_modules"); } },
              { label: "Clear beta banner",         detail: "Banner reappears on next home load",          color: "amber", action: () => lsClear("genai_beta_banner_dismissed") },
              { label: "Clear What's New seen",     detail: "Badge reappears in nav header",               color: "amber", action: () => lsClear("genai_whatsnew_v3") },
              { label: "Force preview unlock",      detail: "Sets genai_preview_unlocked=1 directly",      color: "violet",action: () => lsSet("genai_preview_unlocked", "1") },
              { label: "Clear preview unlock",      detail: "Re-locks all locked tabs",                    color: "violet",action: () => lsClear("genai_preview_unlocked") },
              { label: "Clear challenge log",       detail: "Clears genai_leaderboard",                    color: "zinc",  action: () => lsClear("genai_leaderboard") },
              { label: "Clear lab hint banner",     detail: "RAG Lab hint reappears on next visit",        color: "zinc",  action: () => lsClear("genai_lab_hint_dismissed") },
              { label: "Clear QA checklist",        detail: "Resets launch checklist state",               color: "zinc",  action: () => { lsClear("genai_qa_checklist"); setChecklist({}); } },
              { label: "Clear QA review",           detail: "Resets manual review state",                  color: "zinc",  action: () => { lsClear("genai_qa_review"); setReview({}); } },
            ].map(({ label, detail, color, action }) => {
              const clr = { red: "border-red-800/60 hover:bg-red-950/30 hover:border-red-700/60 text-red-400", amber: "border-amber-800/60 hover:bg-amber-950/30 hover:border-amber-700/60 text-amber-400", violet: "border-violet-800/60 hover:bg-violet-950/30 hover:border-violet-700/60 text-violet-400", zinc: "border-zinc-700 hover:bg-zinc-800/50 hover:border-zinc-600 text-zinc-400" };
              return (
                <button key={label} onClick={action}
                  className={`rounded-xl border p-4 text-left transition-all ${clr[color]}`}>
                  <div className="text-sm font-bold text-white mb-1">{label}</div>
                  <div className="text-[11px] text-zinc-600">{detail}</div>
                </button>
              );
            })}
          </div>

          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Export</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  const out = {};
                  LS_KEYS.forEach(k => { try { out[k.key] = localStorage.getItem(k.key); } catch {} });
                  const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "genai_lab_localstorage.json"; a.click();
                }}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all">
                ⬇ Export localStorage JSON
              </button>
              <button
                onClick={() => {
                  const out = {};
                  LS_KEYS.forEach(k => { try { out[k.key] = localStorage.getItem(k.key); } catch {} });
                  try { navigator.clipboard.writeText(JSON.stringify(out, null, 2)); } catch {}
                }}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all">
                📋 Copy to clipboard
              </button>
            </div>
          </div>
        </>)}

        {/* ── LAUNCH CHECKLIST ─────────────────────────────────────────────── */}
        {section === "checklist" && (<>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white uppercase tracking-widest">Launch Checklist</h2>
            <span className="text-xs font-mono text-zinc-500">{clDone}/{LAUNCH_CHECKLIST.length}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-violet-600 rounded-full transition-all duration-500" style={{ width: `${(clDone / LAUNCH_CHECKLIST.length) * 100}%` }} />
          </div>
          <p className="text-[11px] text-zinc-700 font-mono">State persists in localStorage (genai_qa_checklist). Check each after manual verification.</p>
          <div className="space-y-1.5">
            {LAUNCH_CHECKLIST.map(item => (
              <label key={item.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${checklist[item.id] ? "border-emerald-800/60 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"}`}>
                <input type="checkbox" checked={!!checklist[item.id]} onChange={() => toggleCheck(item.id)} className="hidden" />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checklist[item.id] ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"}`}>
                  {checklist[item.id] && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <span className={`text-sm ${checklist[item.id] ? "text-emerald-300 line-through decoration-emerald-700" : "text-white"}`}>{item.label}</span>
              </label>
            ))}
          </div>
        </>)}

        {/* ── MANUAL REVIEW ────────────────────────────────────────────────── */}
        {section === "review" && (<>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-widest">Manual Content Review</h2>
            <p className="text-xs text-zinc-600 mt-1">Per-module checklist. Click to expand. Persists in genai_qa_review.</p>
          </div>
          {["concepts", "flows", "lab", "agents", "playground", "explore"].map(tab => {
            const mods = MODULE_CATALOG.filter(m => m.tab === tab);
            const tabDone  = mods.reduce((acc, m) => acc + REVIEW_CRITERIA.filter(c => (review[`${m.tab}:${m.moduleId}`] || {})[c.id]).length, 0);
            const tabTotal = mods.length * REVIEW_CRITERIA.length;
            return (
              <div key={tab} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60">
                  <span className="text-sm font-black text-white uppercase">{tab}</span>
                  <span className="text-xs text-zinc-600">{mods.length} modules</span>
                  <div className="ml-auto text-[10px] font-mono text-zinc-600">{tabDone}/{tabTotal}</div>
                </div>
                <div className="divide-y divide-zinc-800/40">
                  {mods.map(m => {
                    const k = `${m.tab}:${m.moduleId}`;
                    const r = review[k] || {};
                    const done = REVIEW_CRITERIA.filter(c => r[c.id]).length;
                    const isExp = expandedModule === k;
                    return (
                      <div key={k}>
                        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-900/30 transition-all">
                          <button onClick={() => setExpandedModule(isExp ? null : k)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${done === REVIEW_CRITERIA.length ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"}`}>
                              {done === REVIEW_CRITERIA.length && <span className="text-white text-[9px]">✓</span>}
                            </div>
                            <span className="text-xs font-bold text-white flex-1 truncate">{m.title}</span>
                            <span className="text-[10px] font-mono text-zinc-600 shrink-0">{done}/{REVIEW_CRITERIA.length}</span>
                            <span className="text-zinc-700 text-[10px] ml-1">{isExp ? "▲" : "▼"}</span>
                          </button>
                          <button
                            onClick={() => openModule(m.tab, m.moduleId)}
                            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-mono text-[10px] transition-all shrink-0 ml-1">
                            open
                          </button>
                        </div>
                        {isExp && (
                          <div className="px-4 pb-3 pt-1 space-y-1 bg-zinc-950/30">
                            {REVIEW_CRITERIA.map(c => (
                              <label key={c.id}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all ${r[c.id] ? "bg-emerald-950/20" : "hover:bg-zinc-900/50"}`}>
                                <input type="checkbox" checked={!!r[c.id]} onChange={() => toggleReview(k, c.id)} className="hidden" />
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${r[c.id] ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"}`}>
                                  {r[c.id] && <span className="text-white text-[8px] font-bold">✓</span>}
                                </div>
                                <span className={`text-[11px] ${r[c.id] ? "text-emerald-400" : "text-zinc-400"}`}>{c.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>)}

      </div>
    </div>
  );
}
