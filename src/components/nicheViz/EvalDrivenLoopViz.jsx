import { useState } from "react";

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

// Baseline + a scripted sequence of changes. Some help, one regresses.
const BASELINE = 61;
const STEPS = [
  { change: "rewrite system prompt", delta: +8, help: true, note: "clearer task framing lifted pass rate" },
  { change: "add 3 few-shot examples", delta: +6, help: true, note: "examples pinned the output format" },
  { change: "swap to terser retrieval", delta: -5, help: false, note: "dropped context the model needed — caught by the eval" },
  { change: "revert + tune chunk size", delta: +7, help: true, note: "restored context, kept it tight" },
  { change: "add self-check step", delta: +4, help: true, note: "small but real gain on edge cases" },
];

export default function EvalDrivenLoopViz({ onNavigate, spec } = {}) {
  const [step, setStep] = useState(0); // 0 = baseline only
  const [hasEval, setHasEval] = useState(true);

  const applied = STEPS.slice(0, step);
  const score = applied.reduce((s, x) => s + x.delta, BASELINE);
  const prev = step > 0 ? BASELINE + STEPS.slice(0, step - 1).reduce((s, x) => s + x.delta, 0) : BASELINE;
  const lastDelta = step > 0 ? STEPS[step - 1].delta : 0;

  const atEnd = step >= STEPS.length;

  const card = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
  };

  return (
    <div
      style={{
        color: "var(--zinc-200, #e4e4e7)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontSize: 14,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>The customization loop</div>
        <div style={{ color: "var(--zinc-400, #a1a1aa)", marginTop: 4 }}>
          Build an eval set, measure a baseline, make one change, re-measure,
          iterate. The eval set is the steering wheel.
        </div>
      </div>

      {/* Loop diagram */}
      <div style={{ ...card, padding: 14, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {["build eval set", "measure baseline", "make a change", "re-measure", "iterate"].map((s, i) => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 11,
                ...mono,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--zinc-400, #a1a1aa)",
              }}
            >
              {s}
            </span>
            {i < 4 && <span style={{ ...mono, color: "var(--zinc-400, #a1a1aa)" }}>→</span>}
          </span>
        ))}
      </div>

      {/* Metric bar */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--zinc-400, #a1a1aa)" }}>
            eval pass rate {step === 0 ? "(baseline)" : `— iteration ${step}`}
          </span>
          <span style={{ ...mono, fontSize: 26, fontWeight: 700, color: hasEval ? "var(--gal-build)" : "var(--zinc-400, #a1a1aa)" }}>
            {hasEval ? `${score}%` : "??%"}
          </span>
        </div>

        <div style={{ height: 16, borderRadius: 8, background: "var(--surface)", overflow: "hidden", position: "relative" }}>
          {/* baseline marker */}
          <div
            style={{
              position: "absolute",
              left: `${BASELINE}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: "var(--zinc-400, #a1a1aa)",
              opacity: 0.6,
            }}
          />
          <div
            style={{
              width: `${hasEval ? score : 0}%`,
              height: "100%",
              background: !hasEval
                ? "var(--border)"
                : lastDelta < 0
                ? "var(--red, #f87171)"
                : "var(--green, #34d399)",
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 10, color: "var(--zinc-400, #a1a1aa)", marginTop: 4 }}>
          <span>0</span>
          <span>baseline {BASELINE}%</span>
          <span>100</span>
        </div>

        {/* Last change result */}
        {step > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 12,
              border: `1px solid ${lastDelta < 0 ? "var(--red, #f87171)" : "rgba(52,211,153,0.4)"}`,
              background: lastDelta < 0 ? "rgba(248,113,113,0.08)" : "rgba(52,211,153,0.06)",
            }}
          >
            <div style={{ ...mono, fontSize: 12, color: lastDelta < 0 ? "var(--red, #f87171)" : "var(--green, #34d399)" }}>
              {STEPS[step - 1].change}: {lastDelta > 0 ? "+" : ""}
              {lastDelta} pts ({prev}% → {score}%)
            </div>
            <div style={{ fontSize: 11, color: "var(--zinc-400, #a1a1aa)", marginTop: 4 }}>
              {hasEval
                ? STEPS[step - 1].note
                : "without an eval set you'd have shipped this change blind — good or bad, you couldn't tell."}
            </div>
          </div>
        )}
      </div>

      {/* Next change preview + controls */}
      <div style={{ ...card, padding: 14 }}>
        {!atEnd ? (
          <div style={{ fontSize: 13, marginBottom: 12 }}>
            next change:{" "}
            <span style={{ ...mono, color: "var(--gal-build)" }}>{STEPS[step].change}</span>
          </div>
        ) : (
          <div style={{ fontSize: 13, marginBottom: 12, color: "var(--green, #34d399)" }}>
            loop complete — {score - BASELINE > 0 ? "+" : ""}
            {score - BASELINE} pts over baseline, one regression caught and reverted.
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setStep((s) => Math.min(s + 1, STEPS.length))}
            disabled={atEnd}
            style={{
              cursor: atEnd ? "default" : "pointer",
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--gal-build)",
              background: atEnd ? "var(--surface)" : "var(--gal-build-tint)",
              color: atEnd ? "var(--zinc-400, #a1a1aa)" : "var(--gal-build)",
              ...mono,
              fontSize: 13,
              opacity: atEnd ? 0.5 : 1,
            }}
          >
            apply change + re-measure
          </button>
          <button
            onClick={() => setStep(0)}
            style={{
              cursor: "pointer",
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--zinc-400, #a1a1aa)",
              ...mono,
              fontSize: 13,
            }}
          >
            reset
          </button>
          <button
            onClick={() => setHasEval((v) => !v)}
            style={{
              cursor: "pointer",
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${hasEval ? "var(--border)" : "var(--red, #f87171)"}`,
              background: hasEval ? "var(--surface)" : "rgba(248,113,113,0.08)",
              color: hasEval ? "var(--zinc-400, #a1a1aa)" : "var(--red, #f87171)",
              ...mono,
              fontSize: 13,
            }}
          >
            {hasEval ? "eval set: on" : "eval set: off"}
          </button>
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          ...mono,
          color: hasEval ? "var(--zinc-400, #a1a1aa)" : "var(--red, #f87171)",
        }}
      >
        {hasEval
          ? "the eval set is the steering wheel — every change is a measured before/after, not a hunch."
          : "eval set off: the number is hidden, regressions slip through — you're guessing."}
      </div>
    </div>
  );
}
