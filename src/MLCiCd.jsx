import { useState } from "react";
import HowTo from "./HowTo";
import { Icon } from './Icon.jsx';

// ─── DATA ─────────────────────────────────────────────────────────────────────
const STAGES = [
  {
    id: "shadow", label: "Shadow Mode", traffic: 0,
    color: "#6366f1",
    desc: "New model runs in parallel with production — responses logged but NOT served to users. Zero user impact.",
    gates: [
      "Latency P95 is within 20% of baseline (no performance regression)",
      "No new error types or null outputs in shadow logs",
      "Token cost estimate verified against budget",
    ],
  },
  {
    id: "canary5", label: "Canary 5%", traffic: 5,
    color: "#f59e0b",
    desc: "5% of live traffic routed to new model. Real users, real stakes. Monitor for 24–48 hours before advancing.",
    gates: [
      "Error rate < 0.5% (monitor for 24h)",
      "Latency P95 < SLA threshold (e.g. 800ms)",
      "Automated eval score ≥ baseline score − 0.02",
    ],
  },
  {
    id: "canary25", label: "Canary 25%", traffic: 25,
    color: "#f97316",
    desc: "Expanded to 25%. If metrics hold for another 24h, confidence is high. Rollback still fast at this stage.",
    gates: [
      "Error rate < 0.3% over 24h window",
      "User CSAT or thumbs-up rate ≥ baseline",
      "No regression on automated eval suite",
    ],
  },
  {
    id: "full", label: "Full Rollout", traffic: 100,
    color: "#10b981",
    desc: "100% of traffic on new model. Keep old model on hot standby for 48h in case emergency rollback is needed.",
    gates: [
      "All canary metrics stable for 24h",
      "On-call team notified and runbook updated",
      "Rollback procedure tested in staging (< 5 min to revert)",
    ],
  },
];

const ROLLBACK_SCENARIOS = [
  {
    id: "latency",  label: "Latency Spike",
    metric: "P95 Latency",  baseline: 480,  spike: 1840, threshold: 800,  unit: "ms",
    verdict: "rollback",
    reason: "P95 jumped from 480ms to 1840ms — 2.3× above the 800ms SLA. Clear rollback signal; users are experiencing visible delays.",
    rootCause: "Likely: new model generates longer responses on average, or context-window handling regression. Fix before re-promoting.",
  },
  {
    id: "errors",   label: "Error Rate Spike",
    metric: "Error Rate",   baseline: 0.12, spike: 2.4,  threshold: 0.5,  unit: "%",
    verdict: "rollback",
    reason: "Error rate spiked 20× above baseline. Rollback immediately — investigate structured output parsing failures before re-deploying.",
    rootCause: "New model may use different JSON output format for tool calls, breaking downstream parsers.",
  },
  {
    id: "quality",  label: "Quality Regression",
    metric: "Eval Score",   baseline: 4.2,  spike: 3.6,  threshold: 4.0,  unit: "/5",
    verdict: "rollback",
    reason: "Eval score dropped below the 4.0 threshold despite lower latency. Don't ship quality regressions — rollback and improve training.",
    rootCause: "Fine-tuned model over-specialized on training distribution. Needs more diverse examples.",
  },
  {
    id: "cost",     label: "Cost Anomaly",
    metric: "Cost / Query", baseline: 0.0032, spike: 0.0091, threshold: 0.005, unit: "$",
    verdict: "rollback",
    reason: "New model generating 2.8× more output tokens — monthly bill will balloon. Rollback, add max_tokens constraint, then re-promote.",
    rootCause: "System prompt change caused verbose responses. Quick fix: add `max_tokens` limit.",
  },
  {
    id: "minor",    label: "Minor Latency Bump",
    metric: "P95 Latency",  baseline: 480,  spike: 610,  threshold: 800,  unit: "ms",
    verdict: "continue",
    reason: "Latency increased 27% but is still under the 800ms SLA. Monitor for 2 more hours. If it stabilises, continue — the quality gain may justify it.",
    rootCause: "Within acceptable range. Compare quality delta vs latency cost before deciding.",
  },
];

const CHECKLIST = [
  {
    category: "Eval Gate",
    items: [
      "Offline eval suite passes (score ≥ baseline on all metrics)",
      "Regression test on known failure cases from past incidents",
      "Human eval on 50 edge cases (especially safety-adjacent queries)",
      "Guardrail / safety eval — refusal rate within expected range",
    ],
  },
  {
    category: "Performance Gate",
    items: [
      "Load test at 2× expected peak traffic",
      "P95 latency < SLA threshold under load",
      "Memory / VRAM profile within GPU budget",
      "Token cost estimate for new model verified",
    ],
  },
  {
    category: "Observability",
    items: [
      "Structured logging includes new model version tag",
      "Dashboard updated with new model metrics",
      "Alerting thresholds set for error rate + latency anomalies",
      "On-call runbook updated with rollback procedure",
    ],
  },
  {
    category: "Rollback Ready",
    items: [
      "Previous model version pinned and deployable in < 5 minutes",
      "Rollback command tested in staging environment",
      "On-call engineer notified of deployment window",
      "Rollback criteria explicitly documented (what metric level triggers rollback?)",
    ],
  },
];

// ─── TAB 1: DEPLOY PIPELINE ───────────────────────────────────────────────────
function DeployPipeline() {
  const [stageIdx, setStageIdx] = useState(0);
  const [gatesDone, setGatesDone] = useState({});

  const stage      = STAGES[stageIdx];
  const allGatesMet = stage.gates.every((_, i) => gatesDone[`${stageIdx}-${i}`]);

  function toggleGate(si, gi) {
    const k = `${si}-${gi}`;
    setGatesDone(p => ({ ...p, [k]: !p[k] }));
  }
  function advance()  { if (stageIdx < STAGES.length - 1) setStageIdx(s => s + 1); }
  function rollback() { if (stageIdx > 0) { setStageIdx(s => s - 1); setGatesDone({}); } }

  return (
    <div className="space-y-6">
      {/* Stage progress */}
      <div className="flex items-start">
        {STAGES.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 cursor-pointer" onClick={() => i <= stageIdx && setStageIdx(i)}>
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${i < stageIdx ? "bg-emerald-600 border-emerald-600 text-white" : i === stageIdx ? "bg-zinc-900 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-600"}`}
                style={i === stageIdx ? { borderColor: s.color } : {}}>
                {i < stageIdx ? "✓" : i + 1}
              </div>
              <div className="text-xs mt-1 text-center font-bold leading-tight" style={{ color: i === stageIdx ? s.color : i < stageIdx ? "#10b981" : "#52525b" }}>
                {s.label}
              </div>
              <div className="text-xs text-zinc-600">{s.traffic}%</div>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mt-[-20px] transition-all ${i < stageIdx ? "bg-emerald-600" : "bg-zinc-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Current stage detail */}
      <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: stage.color + "55", background: stage.color + "10" }}>
        <div>
          <div className="text-xs font-mono uppercase mb-1" style={{ color: stage.color }}>
            Stage {stageIdx + 1} / {STAGES.length} — {stage.traffic}% Live Traffic
          </div>
          <h3 className="text-lg font-bold text-white">{stage.label}</h3>
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{stage.desc}</p>
        </div>

        <div>
          <div className="text-xs font-bold text-zinc-400 uppercase mb-2">Promotion Gates — check all to advance</div>
          <div className="space-y-1">
            {stage.gates.map((g, i) => {
              const k = `${stageIdx}-${i}`;
              return (
                <div key={i} onClick={() => toggleGate(stageIdx, i)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${gatesDone[k] ? "bg-emerald-950/30" : "hover:bg-zinc-800/40"}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${gatesDone[k] ? "border-emerald-500 bg-emerald-500" : "border-zinc-600"}`}>
                    {gatesDone[k] && <span className="text-white font-bold leading-none"><Icon name="check" size={10} /></span>}
                  </div>
                  <span className="text-sm text-zinc-300">{g}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-zinc-800">
          <button onClick={rollback} disabled={stageIdx === 0}
            className="px-4 py-2 rounded text-xs font-bold border border-red-800/60 text-red-400 hover:bg-red-950/40 disabled:opacity-30 transition-all">
            ← Rollback
          </button>
          {stageIdx === STAGES.length - 1 && allGatesMet ? (
            <button onClick={() => { setStageIdx(0); setGatesDone({}); }}
              className="flex-1 px-4 py-2 rounded text-xs font-bold bg-zinc-700 hover:bg-zinc-600 text-white transition-all">
              Run again →
            </button>
          ) : (
            <button onClick={advance} disabled={!allGatesMet || stageIdx === STAGES.length - 1}
              className={`flex-1 px-4 py-2 rounded text-xs font-bold transition-all ${allGatesMet && stageIdx < STAGES.length - 1 ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}>
              {stageIdx === STAGES.length - 1 ? "✓ Fully Deployed" : allGatesMet ? `Advance to ${STAGES[stageIdx + 1].label} →` : "Check all gates to advance"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: ROLLBACK SIMULATOR ────────────────────────────────────────────────
function RollbackSimulator() {
  const [idx, setIdx]           = useState(0);
  const [verdict, setVerdict]   = useState(null);
  const sc = ROLLBACK_SCENARIOS[idx];
  const overThreshold = sc.spike > sc.threshold;

  function pick(i) { setIdx(i); setVerdict(null); }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500">You're on-call. Canary is at 5%. An alert fires. Rollback or continue?</p>

      <div className="flex gap-2 flex-wrap">
        {ROLLBACK_SCENARIOS.map((s, i) => (
          <button key={s.id} onClick={() => pick(i)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${idx === i ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Alert card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="text-xs font-mono text-red-400 uppercase"><Icon name="alert-triangle" size={12} /> Alert: {sc.metric} Anomaly — Canary 5%</div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Baseline",  value: `${sc.baseline}${sc.unit}`, color: "text-emerald-400" },
            { label: "Current",   value: `${sc.spike}${sc.unit}`,    color: "text-red-400" },
            { label: "Threshold", value: `${sc.threshold}${sc.unit}`,color: "text-amber-400" },
          ].map(s => (
            <div key={s.label}>
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Spike bar */}
        <div className="space-y-1.5">
          {[
            { label: "Baseline",  val: sc.baseline, max: sc.spike, color: "#10b981" },
            { label: "Current",   val: sc.spike,    max: sc.spike, color: overThreshold ? "#ef4444" : "#f59e0b" },
            { label: "Threshold", val: sc.threshold,max: sc.spike, color: "#f59e0b" },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 w-16">{b.label}</span>
              <div className="flex-1 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(b.val / b.max) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision buttons */}
      {!verdict ? (
        <div className="space-y-2">
          <div className="text-xs font-bold text-zinc-400 uppercase">Your call:</div>
          <div className="flex gap-3">
            <button onClick={() => setVerdict("rollback")}
              className="flex-1 py-3 bg-red-950/40 border border-red-800 hover:bg-red-900/50 text-red-400 font-bold text-sm rounded-xl transition-all">
              <Icon name="siren" size={14} /> Rollback
            </button>
            <button onClick={() => setVerdict("continue")}
              className="flex-1 py-3 bg-emerald-950/40 border border-emerald-800 hover:bg-emerald-900/50 text-emerald-400 font-bold text-sm rounded-xl transition-all">
              <Icon name="check" size={14} /> Continue Canary
            </button>
          </div>
        </div>
      ) : (
        <div className={`rounded-xl border p-4 space-y-3 ${verdict === sc.verdict ? "border-emerald-700 bg-emerald-950/20" : "border-red-700 bg-red-950/20"}`}>
          <div className="flex items-center gap-2">
            <span className="text-base">{verdict === sc.verdict ? <Icon name="check-circle" size={16} color="var(--green, #4ade80)" /> : <Icon name="x-circle" size={16} color="var(--red, #f43f5e)" />}</span>
            <span className="font-bold text-white">
              {verdict === sc.verdict ? "Correct." : `Wrong — the right call was to ${sc.verdict}.`}
            </span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{sc.reason}</p>
          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="text-xs font-bold text-zinc-400 uppercase mb-1">Root Cause Investigation</div>
            <p className="text-xs text-zinc-400 leading-relaxed">{sc.rootCause}</p>
          </div>
          <button onClick={() => setVerdict(null)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Try again</button>
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: PRE-DEPLOY CHECKLIST ──────────────────────────────────────────────
function PreDeployChecklist() {
  const [checked, setChecked] = useState({});
  const total = CHECKLIST.reduce((acc, c) => acc + c.items.length, 0);
  const done  = Object.values(checked).filter(Boolean).length;
  const pct   = Math.round((done / total) * 100);
  const ready = pct === 100;

  function toggle(ci, ii) {
    const k = `${ci}-${ii}`;
    setChecked(p => ({ ...p, [k]: !p[k] }));
  }
  function checkAllInCat(ci) {
    const allOn = CHECKLIST[ci].items.every((_, ii) => checked[`${ci}-${ii}`]);
    const updates = {};
    CHECKLIST[ci].items.forEach((_, ii) => { updates[`${ci}-${ii}`] = !allOn; });
    setChecked(p => ({ ...p, ...updates }));
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-zinc-400 uppercase">Pre-Deploy Readiness</span>
          <span className={`text-sm font-bold font-mono ${ready ? "text-emerald-400" : "text-zinc-400"}`}>
            {done}/{total} ({pct}%)
          </span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: ready ? "#10b981" : pct > 60 ? "#f59e0b" : "#6366f1" }} />
        </div>
        {ready && <p className="text-xs text-emerald-400 mt-2 font-bold"><Icon name="check" size={14} /> All gates cleared — deployment approved for Shadow Mode.</p>}
      </div>

      {/* Categories */}
      {CHECKLIST.map((cat, ci) => {
        const catDone = cat.items.filter((_, ii) => checked[`${ci}-${ii}`]).length;
        const catAll  = cat.items.length;
        return (
          <div key={cat.category} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div onClick={() => checkAllInCat(ci)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/50 border-b border-zinc-800 transition-all">
              <span className="text-sm font-bold text-white">{cat.category}</span>
              <span className={`text-xs font-mono ${catDone === catAll ? "text-emerald-400" : "text-zinc-500"}`}>
                {catDone}/{catAll} {catDone === catAll ? "✓" : ""}
              </span>
            </div>
            <div className="p-3 space-y-1">
              {cat.items.map((item, ii) => {
                const k = `${ci}-${ii}`;
                return (
                  <div key={ii} onClick={() => toggle(ci, ii)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${checked[k] ? "bg-emerald-950/20" : "hover:bg-zinc-800/50"}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${checked[k] ? "border-emerald-500 bg-emerald-500" : "border-zinc-600"}`}>
                      {checked[k] && <span className="text-white font-bold leading-none"><Icon name="check" size={9} /></span>}
                    </div>
                    <span className="text-sm text-zinc-300 leading-relaxed">{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "pipeline",  label: "Deploy Pipeline"   },
  { id: "rollback",  label: "Rollback Simulator" },
  { id: "checklist", label: "Pre-Deploy Checklist" },
];

export default function MLCiCdLab() {
  const [tab, setTab] = useState("pipeline");
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-orange-800 bg-orange-950/20 p-5">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <span className="text-xs font-mono px-2 py-0.5 bg-orange-900/60 text-orange-300 rounded border border-orange-700">ML CI/CD</span>
          <span className="text-xs text-zinc-500">shadow → canary → rollout → rollback</span>
        </div>
        <h2 className="text-xl font-bold text-white">ML CI/CD Lab</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Shipping an LLM update is not like shipping code. Shadow deployments, staged rollouts, and fast rollback
          are what separate notebook engineers from production ML engineers.
        </p>
      </div>
      <div className="rounded-lg p-3 sm:p-3.5 space-y-1.5" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderLeft: "3px solid rgba(99,102,241,0.4)" }}>
        <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wide leading-snug">What you're building intuition for</p>
        <p className="text-xs text-zinc-400 leading-relaxed">Shipping an LLM update is not like deploying a bug fix. A new model or prompt change can degrade quality in ways that don't throw errors and don't trigger alerts — because the output is still syntactically valid, still within latency bounds, just subtly worse. Shadow deployments and canary rollouts exist specifically to catch this class of failure before it reaches all users.</p>
        <p className="hidden sm:block text-xs text-zinc-400 leading-relaxed">Walk through the pipeline stages in order, checking the promotion gates before advancing to each next stage. The Rollback Simulator puts you in the position of an on-call engineer reading a live metric alert — the decision to roll back or continue is never obvious from a single metric. The Pre-Deploy Checklist covers 16 gates that most teams only discover they needed after their first bad deploy.</p>
      </div>
      <HowTo
        objective="Build intuition for safe LLM deployment: shadow mode, canary rollouts, rollback decision-making, and pre-deploy gates."
        steps={[
          "Deploy Pipeline: walk each stage (Shadow → Canary 5% → 25% → Full) — check promotion gates at each step before advancing",
          "Rollback Simulator: read the metric alert, decide rollback or continue — learn which threshold violations are dealbreakers",
          "Pre-Deploy Checklist: run through 16 gates across eval, performance, observability, and rollback-readiness before any deployment",
        ]}
      />
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${tab === t.id ? "bg-orange-700 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "pipeline"  && <DeployPipeline />}
      {tab === "rollback"  && <RollbackSimulator />}
      {tab === "checklist" && <PreDeployChecklist />}
    </div>
  );
}
