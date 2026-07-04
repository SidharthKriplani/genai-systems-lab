import { useState } from "react";
import { SD_SCENARIOS } from "./data/systemDesignScenarios.js";
import { AddTrackBtn } from "./AddToTrackPopover.jsx";

// ═══════════════════════════════════════════════════════════════════════════
//  System Design Trainer — an attempt-then-reveal staged walkthrough.
//  Pick a scenario, work each of its 5 stages (tick what you thought of BEFORE
//  revealing the model coverage), then self-score on a 7-dimension rubric.
//  Self-contained. Only dependency is React. Monochrome instrument standard.
// ═══════════════════════════════════════════════════════════════════════════

// ── color ramp (monochrome instrument standard) ──────────────────────────────
const CYAN = "var(--gal-build, #22d3ee)"; // active / primary accent, used sparingly
const GREEN = "#34d399"; // strong / good
const RED = "#f87171"; // trap / weak
const INK_HI = "#e4e4e7";
const INK = "#d4d4d8";
const INK_LOW = "#a1a1aa";
const INK_DIM = "#71717a";

const surface = {
  background: "var(--surface, #18181b)",
  border: "1px solid var(--border, #27272a)",
};
const surface2 = "var(--surface-2, #1f1f23)";
const BORDER = "var(--border, #27272a)";

const LS_KEY = "gsl-sdt-last-scenario";

const RATINGS = [
  { key: "weak", label: "Weak", color: RED },
  { key: "ok", label: "OK", color: INK_LOW },
  { key: "strong", label: "Strong", color: GREEN },
];

// ── small atoms ──────────────────────────────────────────────────────────────
const Arrow = () => <span aria-hidden style={{ opacity: 0.7 }}>&rarr;</span>;
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);

function Tag({ children }) {
  return (
    <span
      className="inline-flex items-center rounded-full font-medium"
      style={{ fontSize: 11, padding: "2px 9px", color: INK_LOW, background: surface2, border: `1px solid ${BORDER}` }}
    >
      {children}
    </span>
  );
}

function PrimaryBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="px-5 py-2.5 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
      style={{
        background: disabled ? "#3f3f46" : surface2,
        border: `1px solid ${disabled ? BORDER : CYAN}`,
        color: disabled ? INK_DIM : CYAN,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 rounded-xl font-medium transition-colors inline-flex items-center gap-2"
      style={{ ...surface, color: INK }}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Layout shell
// ═══════════════════════════════════════════════════════════════════════════
function Shell({ children, onExit }) {
  return (
    <div className="min-h-full w-full" style={{ color: INK_HI }}>
      <div className="px-4 md:px-6 py-6 md:py-10">
        {onExit && (
          <button
            onClick={() => onExit()}
            className="mb-6 text-sm transition-colors inline-flex items-center gap-1.5"
            style={{ color: INK_DIM }}
          >
            <span aria-hidden>&larr;</span> Back
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Main component
// ═══════════════════════════════════════════════════════════════════════════
export default function SystemDesignTrainer({ onExit } = {}) {
  const scenarios = Array.isArray(SD_SCENARIOS) ? SD_SCENARIOS : [];

  const [scenarioId, setScenarioId] = useState(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [phase, setPhase] = useState("stages"); // stages | scorecard
  const [ticks, setTicks] = useState({}); // { [stageId]: Set(consideration idx) }
  const [revealed, setRevealed] = useState({}); // { [stageId]: bool }
  const [ratings, setRatings] = useState({}); // { [dim]: 'weak'|'ok'|'strong' }

  const scenario = scenarios.find((s) => s.id === scenarioId) || null;

  function enterScenario(id) {
    setScenarioId(id);
    setStageIdx(0);
    setPhase("stages");
    setTicks({});
    setRevealed({});
    setRatings({});
    try { localStorage.setItem(LS_KEY, id); } catch (e) { /* ignore */ }
  }

  function backToPicker() {
    setScenarioId(null);
  }

  function toggleTick(stageId, i) {
    setTicks((t) => {
      const set = new Set(t[stageId] || []);
      set.has(i) ? set.delete(i) : set.add(i);
      return { ...t, [stageId]: set };
    });
  }

  function reveal(stageId) {
    setRevealed((r) => ({ ...r, [stageId]: true }));
  }

  function restartScenario() {
    if (scenario) enterScenario(scenario.id);
  }

  // ── scenario picker ────────────────────────────────────────────────────────
  if (!scenario) {
    let lastId = null;
    try { lastId = localStorage.getItem(LS_KEY); } catch (e) { /* ignore */ }
    return (
      <Shell onExit={onExit}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-2 text-xs uppercase tracking-widest font-semibold" style={{ color: CYAN }}>
            System design trainer
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: INK_HI }}>
            Design it stage by stage
          </h1>
          <p className="mt-4 leading-relaxed" style={{ color: INK_LOW }}>
            Pick a prompt and work it the way an interview runs — one stage at a time. At each stage
            you attempt first: tick the considerations you actually raised, then reveal the model
            coverage, the pitfalls, and the follow-ups an interviewer would push on. At the end you
            self-score on a rubric and get a readiness read.
          </p>

          {scenarios.length === 0 ? (
            <div className="mt-8 rounded-xl p-5 text-sm" style={{ ...surface, color: INK_LOW }}>
              No scenarios are loaded yet.
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {scenarios.map((s) => (
                <div key={s.id} style={{ position: "relative" }}>
                  <button
                    onClick={() => enterScenario(s.id)}
                    className="w-full text-left rounded-xl p-5 transition-colors"
                    style={{ ...surface, borderColor: s.id === lastId ? CYAN : BORDER }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base font-semibold" style={{ color: INK_HI }}>{s.title}</div>
                      {s.id === lastId && (
                        <span className="text-[11px] shrink-0 mt-0.5" style={{ color: CYAN, marginRight: 28 }}>last opened</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: INK_LOW }}>{s.prompt}</p>
                    {Array.isArray(s.tags) && s.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {s.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                      </div>
                    )}
                  </button>
                  <span style={{ position: "absolute", top: 14, right: 14 }} onClick={(e) => e.stopPropagation()}>
                    <AddTrackBtn
                      itemType="sd_scenario"
                      itemId={s.id}
                      label={s.title}
                      itemMeta={{ tag: (s.tags || [])[0] }}
                    />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Shell>
    );
  }

  const stages = Array.isArray(scenario.stages) ? scenario.stages : [];
  const rubric = Array.isArray(scenario.rubric) ? scenario.rubric : [];
  const nStages = stages.length;

  // ── scorecard ──────────────────────────────────────────────────────────────
  if (phase === "scorecard") {
    return (
      <Shell onExit={onExit}>
        <Scorecard
          scenario={scenario}
          rubric={rubric}
          ratings={ratings}
          setRatings={setRatings}
          onRestart={restartScenario}
          onAnother={backToPicker}
        />
      </Shell>
    );
  }

  // ── stages ─────────────────────────────────────────────────────────────────
  const stage = stages[stageIdx] || {};
  const stageId = stage.id || `stage-${stageIdx}`;
  const considerations = Array.isArray(stage.considerations) ? stage.considerations : [];
  const isRevealed = !!revealed[stageId];
  const tickSet = ticks[stageId] || new Set();
  const isLast = stageIdx === nStages - 1;

  return (
    <Shell onExit={onExit}>
      <div className="max-w-2xl mx-auto">
        {/* scenario header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={backToPicker}
            className="text-sm transition-colors inline-flex items-center gap-1.5"
            style={{ color: INK_DIM }}
          >
            <span aria-hidden>&larr;</span> Back to scenarios
          </button>
          <div className="text-xs font-mono" style={{ color: INK_DIM }}>
            Stage {stageIdx + 1} / {nStages}
          </div>
        </div>

        <div className="rounded-xl p-5 mb-5" style={surface}>
          <div className="text-base font-semibold" style={{ color: INK_HI }}>{scenario.prompt}</div>
          {scenario.context && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: INK_LOW }}>{scenario.context}</p>
          )}
        </div>

        {/* stage progress dots */}
        <div className="flex items-center gap-1.5 mb-6">
          {stages.map((s, i) => (
            <div
              key={s.id || i}
              className="h-1 flex-1 rounded-full"
              style={{ background: i <= stageIdx ? CYAN : BORDER, opacity: i === stageIdx ? 1 : i < stageIdx ? 0.6 : 0.5 }}
            />
          ))}
        </div>

        {/* stage body */}
        <h2 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: INK_HI }}>{stage.title}</h2>
        {stage.ask && <p className="mt-3 text-[15px] leading-relaxed" style={{ color: INK_LOW }}>{stage.ask}</p>}

        {/* attempt-first checklist */}
        <div className="mt-6 rounded-xl p-5" style={surface}>
          <div className="text-sm font-semibold mb-1" style={{ color: INK }}>Self-check</div>
          <div className="text-xs mb-4" style={{ color: INK_DIM }}>
            Tick the ones you thought of before revealing. Honest ticks make the readiness read useful.
          </div>
          <div className="space-y-2">
            {considerations.map((c, i) => {
              const on = tickSet.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleTick(stageId, i)}
                  className="w-full text-left rounded-lg px-3.5 py-3 flex items-start gap-3 transition-colors"
                  style={{
                    border: `1px solid ${on ? CYAN : BORDER}`,
                    background: on ? surface2 : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="mt-0.5 shrink-0 grid place-items-center"
                    style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `2px solid ${on ? CYAN : "#52525b"}`,
                      background: on ? CYAN : "transparent",
                      color: "#09090b",
                    }}
                  >
                    {on ? <Check /> : null}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: on ? INK_HI : INK }}>{c}</span>
                </button>
              );
            })}
          </div>

          {!isRevealed && (
            <div className="mt-4">
              <PrimaryBtn onClick={() => reveal(stageId)}>
                Reveal model coverage <Arrow />
              </PrimaryBtn>
            </div>
          )}
        </div>

        {/* revealed model coverage */}
        {isRevealed && (
          <div className="mt-5 space-y-4">
            <RevealBlock
              label="Strong answer covers"
              color={GREEN}
              items={stage.strong}
              bullet="strong"
            />
            <RevealBlock
              label="Common pitfalls"
              color={RED}
              items={stage.traps}
              bullet="trap"
            />
            <RevealBlock
              label="Interviewer follow-ups"
              color={CYAN}
              items={stage.probes}
              bullet="probe"
            />

            <div className="flex flex-wrap gap-3 pt-1">
              {stageIdx > 0 && (
                <GhostBtn onClick={() => setStageIdx(stageIdx - 1)}>
                  <span aria-hidden>&larr;</span> Previous
                </GhostBtn>
              )}
              {!isLast ? (
                <PrimaryBtn onClick={() => setStageIdx(stageIdx + 1)}>
                  Next stage <Arrow />
                </PrimaryBtn>
              ) : (
                <PrimaryBtn onClick={() => setPhase("scorecard")}>
                  Self-score on the rubric <Arrow />
                </PrimaryBtn>
              )}
            </div>
          </div>
        )}

        {/* allow previous even before reveal */}
        {!isRevealed && stageIdx > 0 && (
          <div className="mt-4">
            <GhostBtn onClick={() => setStageIdx(stageIdx - 1)}>
              <span aria-hidden>&larr;</span> Previous
            </GhostBtn>
          </div>
        )}
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Reveal block
// ═══════════════════════════════════════════════════════════════════════════
function RevealBlock({ label, color, items, bullet }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;
  return (
    <div className="rounded-xl p-5" style={{ ...surface, borderLeft: `2px solid ${color}` }}>
      <div className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color }}>{label}</div>
      <ul className="space-y-2.5">
        {list.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: INK }}>
            <span aria-hidden style={{ color, marginTop: 1 }}>
              {bullet === "trap" ? "✗" : bullet === "probe" ? "?" : "✓"}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Scorecard
// ═══════════════════════════════════════════════════════════════════════════
function Scorecard({ scenario, rubric, ratings, setRatings, onRestart, onAnother }) {
  function rate(dim, key) {
    setRatings((r) => ({ ...r, [dim]: key }));
  }

  const rated = rubric.filter((d) => ratings[d.dim]).length;
  const allRated = rated === rubric.length && rubric.length > 0;

  const counts = { weak: 0, ok: 0, strong: 0 };
  rubric.forEach((d) => {
    const v = ratings[d.dim];
    if (v) counts[v] += 1;
  });

  const focus = rubric.filter((d) => ratings[d.dim] === "weak" || ratings[d.dim] === "ok");

  let verdict = null;
  if (allRated) {
    const n = rubric.length;
    if (counts.strong === n) {
      verdict = { tone: GREEN, band: "Interview-ready", note: "Strong on every dimension. Keep this scenario warm and move to a fresh one." };
    } else if (counts.strong >= Math.ceil(n * 0.6) && counts.weak === 0) {
      verdict = { tone: GREEN, band: "Nearly there", note: "Mostly strong with a few OKs. Sharpen the OK dimensions into strong and you are ready." };
    } else if (counts.weak <= Math.floor(n * 0.3)) {
      verdict = { tone: INK_LOW, band: "Solid core, gaps to close", note: "The shape is right but some dimensions need work. Focus on the list below." };
    } else {
      verdict = { tone: RED, band: "Rebuild the foundations", note: "Several weak dimensions. Re-work this scenario stage by stage before moving on." };
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onAnother}
        className="mb-5 text-sm transition-colors inline-flex items-center gap-1.5"
        style={{ color: INK_DIM }}
      >
        <span aria-hidden>&larr;</span> Back to scenarios
      </button>

      <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: CYAN }}>Rubric self-scorecard</div>
      <h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: INK_HI }}>{scenario.title}</h1>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: INK_LOW }}>
        Rate yourself against each dimension. Compare your answer honestly to the strong and weak
        descriptors, then read the verdict.
      </p>

      {/* verdict */}
      {allRated && verdict && (
        <div className="mt-6 rounded-2xl p-6" style={{ ...surface, border: `1px solid ${verdict.tone}55` }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-2xl font-bold" style={{ color: verdict.tone }}>{verdict.band}</div>
              <p className="mt-2 text-sm max-w-md leading-relaxed" style={{ color: INK_LOW }}>{verdict.note}</p>
            </div>
            <div className="text-right text-xs font-mono" style={{ color: INK_DIM }}>
              <div><span style={{ color: GREEN }}>{counts.strong}</span> strong</div>
              <div className="mt-0.5"><span style={{ color: INK_LOW }}>{counts.ok}</span> ok</div>
              <div className="mt-0.5"><span style={{ color: RED }}>{counts.weak}</span> weak</div>
            </div>
          </div>
          {focus.length > 0 && (
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: INK_LOW }}>Focus on these</div>
              <div className="flex flex-wrap gap-2">
                {focus.map((d) => (
                  <span
                    key={d.dim}
                    className="inline-flex items-center rounded-full text-xs font-medium"
                    style={{
                      padding: "3px 10px",
                      color: ratings[d.dim] === "weak" ? RED : INK_LOW,
                      background: surface2,
                      border: `1px solid ${ratings[d.dim] === "weak" ? RED + "55" : BORDER}`,
                    }}
                  >
                    {d.dim}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* dimensions */}
      <div className="mt-6 space-y-3">
        {rubric.map((d) => {
          const sel = ratings[d.dim];
          return (
            <div key={d.dim} className="rounded-xl p-5" style={surface}>
              <div className="text-sm font-semibold mb-3" style={{ color: INK_HI }}>{d.dim}</div>
              <div className="space-y-2 mb-4 text-xs leading-relaxed">
                <div className="flex gap-2" style={{ color: INK }}>
                  <span aria-hidden style={{ color: GREEN, marginTop: 1 }}>&#10003;</span>
                  <span><span style={{ color: GREEN }}>Strong:</span> {d.strong}</span>
                </div>
                <div className="flex gap-2" style={{ color: INK }}>
                  <span aria-hidden style={{ color: RED, marginTop: 1 }}>&#10007;</span>
                  <span><span style={{ color: RED }}>Weak:</span> {d.weak}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {RATINGS.map((r) => {
                  const active = sel === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => rate(d.dim, r.key)}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        border: `1px solid ${active ? r.color : BORDER}`,
                        background: active ? surface2 : "transparent",
                        color: active ? r.color : INK_LOW,
                        cursor: "pointer",
                      }}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!allRated && (
        <div className="mt-4 text-xs font-mono" style={{ color: INK_DIM }}>
          {rated} / {rubric.length} dimensions rated
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <PrimaryBtn onClick={onRestart}>Restart this scenario</PrimaryBtn>
        <GhostBtn onClick={onAnother}>Try another scenario</GhostBtn>
      </div>
    </div>
  );
}
