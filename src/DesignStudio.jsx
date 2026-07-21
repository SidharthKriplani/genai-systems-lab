// DesignStudio.jsx — Design Studio, redesigned (GSL).
// Judgment surface built on the research standard: produce-before-reveal, a roots map
// (not a flat list), and a staged compounding engine (absorbs the System Design Trainer
// interaction) for roots that carry `stages`. Flow per problem:
//   Frame (problem only) -> Attempt (gated) -> Reveal model coverage + self-score anchors
//   -> optional BYO-LLM grade pack. Rubric anchors and worked reference stay HIDDEN until
//   the learner commits an attempt — that gate is the whole point.
import { useState } from "react";
import { DESIGN_STUDIO_GSL } from "./data/designStudioBriefs.js";
import GradePack from "./GradePack";

const SPEC_LABEL = { S1: "S1 · full brief", S2: "S2 · derive half", S3: "S3 · derive most", S4: "S4 · own it" };
const MARKS = [{ id: "hit", label: "Hit" }, { id: "partial", label: "Partial" }, { id: "miss", label: "Miss" }];

function nameOf(b) {
  if (b.title) return b.title;
  let s = b.id.replace(/^ds-/, "").replace(/^mlsd-/, "").replace(/-root$/, "").replace(/-var-/, " — ").replace(/-/g, " ");
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── tiny localStorage helpers (attempt text + progress; no cross-store dependency) ──────
function lsGet(k, fallback) {
  try { const v = localStorage.getItem(k); return v == null ? fallback : v; } catch { return fallback; }
}
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }
function markAttempted(briefId) {
  try {
    const raw = localStorage.getItem("gsl_ds_progress");
    const p = raw ? JSON.parse(raw) : {};
    if (!p[briefId]) { p[briefId] = { attempted: true }; localStorage.setItem("gsl_ds_progress", JSON.stringify(p)); }
  } catch {}
}
function readProgress() {
  try { return JSON.parse(localStorage.getItem("gsl_ds_progress") || "{}"); } catch { return {}; }
}

function Ring({ frac }) {
  const r = 9, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, frac)));
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r={r} fill="none" stroke="#27272a" strokeWidth="3" />
      <circle cx="12" cy="12" r={r} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 12 12)" />
    </svg>
  );
}

function Labeled({ label, tone, children }) {
  const color = tone === "trap" ? "#fb7185" : tone === "tell" ? "#a3e635" : tone === "heuristic" ? "#22d3ee" : "#a1a1aa";
  return (
    <div className="mt-2">
      <div className="text-[11px] uppercase tracking-wide mb-0.5" style={{ color }}>{label}</div>
      <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );
}

// ── one compounding stage: attempt (gated) -> reveal model coverage + score anchors ─────
function StageBlock({ stage, briefId, index, total }) {
  const akey = `gsl_ds_attempt_${briefId}_${stage.id}`;
  const [attempt, setAttempt] = useState(() => lsGet(akey, ""));
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState({});
  const onType = (v) => { setAttempt(v); lsSet(akey, v); markAttempted(briefId); };
  const markCls = (active) =>
    `text-[11px] px-2 py-0.5 rounded border transition-colors ${active ? "border-cyan-600 bg-cyan-950/40 text-cyan-300" : "border-zinc-700 text-zinc-500 hover:text-zinc-300"}`;

  return (
    <div className="border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] text-zinc-500">Stage {index + 1} / {total}</span>
      </div>
      <div className="text-base font-semibold text-zinc-100">{stage.title}</div>
      <div className="mt-1.5 text-sm text-cyan-300/90 leading-relaxed"><span className="text-zinc-500">Interviewer:</span> {stage.ask}</div>
      {stage.attemptHint && <div className="mt-1 text-[12px] text-zinc-500">{stage.attemptHint}</div>}
      <textarea
        value={attempt}
        onChange={(e) => onType(e.target.value)}
        placeholder="Your answer to this push — write it before revealing. This is the rep."
        rows={4}
        className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-sm leading-relaxed p-2.5 resize-y font-sans"
      />
      {!revealed ? (
        <button
          onClick={() => { setRevealed(true); markAttempted(briefId); }}
          className="mt-2 text-[13px] px-3 py-1.5 rounded-lg border border-cyan-800 text-cyan-300 hover:bg-cyan-950/30"
        >
          Reveal model coverage (attempt first)
        </button>
      ) : (
        <div className="mt-3 border-t border-zinc-900 pt-3">
          <Labeled label="How a staff engineer reasons">{stage.model}</Labeled>
          {stage.heuristic && <Labeled label="The tell (heuristic)" tone="heuristic">{stage.heuristic}</Labeled>}
          {stage.control && <Labeled label="What to monitor / when to switch">{stage.control}</Labeled>}
          {stage.trap && <Labeled label="Tempting wrong move (a senior falls here)" tone="trap">{stage.trap}</Labeled>}
          {stage.tell && <Labeled label="In production this looks like" tone="tell">{stage.tell}</Labeled>}
          {Array.isArray(stage.anchors) && stage.anchors.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] text-zinc-500 mb-1">Self-score — point to the line in YOUR answer that does each:</div>
              {stage.anchors.map((a, i) => (
                <div key={i} className="border border-zinc-800 rounded-lg p-2.5 mb-1.5">
                  <div className="text-[13px] text-zinc-200">{a.anchor}</div>
                  <div className="text-[11px] text-rose-400/80 mt-0.5">✗ if missed: {a.cost}</div>
                  <div className="flex gap-2 mt-1.5">
                    {MARKS.map((m) => (
                      <button key={m.id} onClick={() => setScores({ ...scores, [i]: m.id })} className={markCls(scores[i] === m.id)}>{m.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DesignStudio({ onExit }) {
  const briefs = DESIGN_STUDIO_GSL || [];
  const [selId, setSelId] = useState(null);
  const [showRef, setShowRef] = useState(false);
  const [progress, setProgress] = useState(() => readProgress());

  const roots = briefs.filter((b) => b.isRoot);
  const childrenOf = (id) => briefs.filter((b) => b.parentRoot === id);
  const legacy = briefs.filter((b) => !b.isRoot && !b.parentRoot);
  const sel = briefs.find((b) => b.id === selId);

  const open = (id) => { setSelId(id); setShowRef(false); window.scrollTo?.(0, 0); };
  const backToMap = () => { setSelId(null); setProgress(readProgress()); };
  const attempted = (id) => !!progress[id]?.attempted;
  const rootFrac = (root) => {
    const set = [root, ...childrenOf(root.id)];
    const done = set.filter((b) => attempted(b.id)).length;
    return set.length ? done / set.length : 0;
  };

  // ── MAP VIEW ───────────────────────────────────────────────────────────────────────
  if (!sel) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={onExit} className="text-zinc-400 hover:text-zinc-200 text-sm">← Back</button>
            <h1 className="text-xl font-semibold text-zinc-100">Design Studio</h1>
          </div>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed max-w-2xl">
            {roots.length} fundamental problems. Master the <span className="text-cyan-300">root</span>, then survive its
            variations as the scaffolding fades (S1 full brief → S4 own it). You attempt first; the model answer and the
            anchors unlock only after you commit — that gate is the point.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roots.map((root) => {
              const kids = childrenOf(root.id);
              return (
                <div key={root.id} className="border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                  <button onClick={() => open(root.id)} className="w-full text-left">
                    <div className="flex items-start gap-2.5">
                      <Ring frac={rootFrac(root)} />
                      <div className="flex-1">
                        <div className="text-[15px] font-semibold text-cyan-300 leading-snug">{nameOf(root)}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{root.domain} · {kids.length} variations{root.stages ? ` · ${root.stages.length}-stage` : ""}</div>
                        {root.provenance && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300">
                            ● Grounded · {(root.provenance.companies || root.companies || [])[0] || "real"}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  {kids.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pl-8">
                      {kids.map((k) => (
                        <button
                          key={k.id}
                          onClick={() => open(k.id)}
                          title={nameOf(k)}
                          className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${attempted(k.id) ? "border-cyan-800 text-cyan-300 bg-cyan-950/20" : "border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}
                        >
                          {k.specLevel}{attempted(k.id) ? " ✓" : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {legacy.length > 0 && (
            <details className="mt-6">
              <summary className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-200">More scenarios ({legacy.length})</summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {legacy.map((b) => (
                  <button key={b.id} onClick={() => open(b.id)} className="text-left border border-zinc-800 rounded-lg px-3 py-2 hover:border-zinc-700">
                    <div className="text-sm text-zinc-200">{nameOf(b)}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{b.domain} · {SPEC_LABEL[b.specLevel] || b.specLevel}</div>
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────────────────
  const staged = Array.isArray(sel.stages) && sel.stages.length > 0;
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4 text-sm">
          <button onClick={backToMap} className="text-zinc-400 hover:text-zinc-200">← All problems</button>
          {sel.parentRoot && <span className="text-zinc-600">variation of {nameOf(roots.find((r) => r.id === sel.parentRoot) || {})}</span>}
        </div>

        {/* Frame — the problem only */}
        <div className="flex flex-wrap gap-2 mb-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{sel.domain}</span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-cyan-400">{SPEC_LABEL[sel.specLevel] || sel.specLevel}</span>
          {sel.isRoot && <span className="px-2 py-0.5 rounded bg-cyan-900 text-cyan-200">root</span>}
          {(sel.companies || []).map((c) => <span key={c} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{c}</span>)}
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">{nameOf(sel)}</h1>
        {sel.provenance && (
          <div className="mt-1.5 text-[11px] text-emerald-400/90">
            ● Grounded ({sel.provenance.tier}) — {(sel.provenance.sources || []).join("; ")}
          </div>
        )}
        <p className="text-zinc-300 mt-2 leading-relaxed">{sel.prompt}</p>
        {sel.context && <p className="text-[13px] text-zinc-400 mt-2 leading-relaxed">{sel.context}</p>}
        {sel.produce?.artifact && (
          <div className="mt-3 border border-zinc-800 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">You produce (this is the work)</div>
            <div className="text-sm text-zinc-300">{sel.produce.artifact}</div>
          </div>
        )}

        {staged ? (
          <div className="mt-5 space-y-3">
            <div className="text-[12px] text-zinc-500">A compounding interview — each answer surfaces the next push. Attempt each stage before revealing.</div>
            {sel.stages.map((st, i) => (
              <StageBlock key={st.id} stage={st} briefId={sel.id} index={i} total={sel.stages.length} />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <GradePack brief={sel} />
          </div>
        )}

        {/* Capstone — worked reference (gated) + grade pack export */}
        {sel.reference?.worked && (
          <div className="mt-5">
            <button
              onClick={() => setShowRef(!showRef)}
              className="text-sm px-3 py-1.5 rounded-lg border border-cyan-800 text-cyan-300 hover:bg-cyan-950/30"
            >
              {showRef ? "Hide worked reference" : "Reveal full worked reference (attempt everything first)"}
            </button>
            {showRef && (
              <div className="mt-2 border border-zinc-800 rounded-lg p-3 whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed">
                {sel.reference.worked}
              </div>
            )}
          </div>
        )}

        {staged && (
          <div className="mt-5">
            <div className="text-[12px] text-zinc-500 mb-2">Export the whole attempt for an adversarial grade from any LLM:</div>
            <GradePack brief={sel} />
          </div>
        )}
      </div>
    </div>
  );
}
