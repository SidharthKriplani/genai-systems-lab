// DesignStudio.jsx — Design Studio brief browser (GSL). Read-only viewer for the
// produce -> reference -> self-critique briefs (skeletons; reference prose still being
// authored). Wired into the BUILD frame. The full interactive workspace (produce -> reveal
// reference -> self-critique) is a later build; this lets you SEE the briefs on the app now.
import { useState } from "react";
import { DESIGN_STUDIO_GSL } from "./data/designStudioBriefs.js";
import GradePack from "./GradePack";

const SPEC_LABEL = { S1: "S1 · full brief", S2: "S2 · derive half", S3: "S3 · derive most", S4: "S4 · own it" };

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">{title}</div>
      <div className="text-zinc-300 leading-relaxed text-sm">{children}</div>
    </div>
  );
}

export default function DesignStudio({ onExit }) {
  const briefs = DESIGN_STUDIO_GSL || [];
  const [selId, setSelId] = useState(briefs[0]?.id || null);
  const sel = briefs.find((b) => b.id === selId) || briefs[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onExit} className="text-zinc-400 hover:text-zinc-200 text-sm">← Back</button>
          <h1 className="text-xl font-semibold text-zinc-100">
            Design Studio <span className="text-cyan-400 text-sm font-normal">· build it yourself, then self-critique</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-1">
            {briefs.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelId(b.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  b.id === sel?.id
                    ? "border-cyan-700 bg-cyan-950/30 text-zinc-100"
                    : "border-zinc-800 hover:border-zinc-700 text-zinc-300"
                }`}
              >
                <div className="font-medium">{b.title}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {b.domain} · {SPEC_LABEL[b.specLevel] || b.specLevel}
                  {b.flawMode ? ` · ${b.flawMode}` : ""}
                </div>
              </button>
            ))}
          </div>

          {sel && (
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap gap-2 mb-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{sel.roleTrack}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{sel.domain}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-cyan-400">{SPEC_LABEL[sel.specLevel] || sel.specLevel}</span>
                  {sel.flawMode && <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400">flaw {sel.flawMode}</span>}
                  {(sel.companies || []).map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{c}</span>
                  ))}
                </div>
                <h2 className="text-lg font-semibold text-zinc-100">{sel.title}</h2>
                <p className="text-zinc-300 mt-1">{sel.prompt}</p>
              </div>

              <Section title="Context">{sel.context}</Section>

              <Section title="You produce (this is the work)">
                <div className="text-zinc-300">{sel.produce?.artifact}</div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  format: {sel.produce?.format} · workspace: {sel.produce?.workspace}
                </div>
              </Section>

              {sel.flawGraph && (
                <Section title="Flaw graph (reveal only after you write your diagnosis)">
                  <ul className="space-y-1">
                    {sel.flawGraph.map((f) => (
                      <li key={f.flawId} className="text-sm">
                        <span className={f.root ? "text-amber-400 font-medium" : "text-zinc-400"}>
                          {f.flawId}
                          {f.root ? " (root)" : ` ← ${(f.dependsOn || []).join(", ")}`}:
                        </span>{" "}
                        <span className="text-zinc-300">{f.symptom}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section title={`Self-critique rubric — grade your own artifact (reference: ${sel.reference?.type || "n/a"})`}>
                <div className="space-y-2">
                  {(sel.rubric || []).map((r, i) => (
                    <div key={i} className="border border-zinc-800 rounded-lg p-3">
                      <div className="text-sm font-medium text-zinc-200">{r.dim}</div>
                      <div className="text-sm text-zinc-300 mt-0.5">✓ {r.anchor}</div>
                      <div className="text-[12px] text-rose-400/80 mt-0.5">✗ cost if missed: {r.cost}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <GradePack brief={sel} />

              {sel.status === "skeleton" && (
                <div className="text-[11px] text-zinc-600 border-t border-zinc-900 pt-3">
                  Reference prose is still being authored for some briefs — the grade pack anchors on the checklist, which is the bar.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
