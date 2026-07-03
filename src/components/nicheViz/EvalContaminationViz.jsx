import { useState } from "react";

// Benchmark contamination: test data leaking into pretraining inflates scores.
// A clean held-out score is lower but honest. A canary string proves leakage.
export default function EvalContaminationViz({ onNavigate, spec } = {}) {
  const [contaminated, setContaminated] = useState(true);
  const [probed, setProbed] = useState(false);

  // Clean (real) capability vs inflated (memorised) score.
  const CLEAN = 61; // real held-out accuracy, %
  const INFLATED = 94; // score when test items were seen in pretraining, %
  const score = contaminated ? INFLATED : CLEAN;

  // Canary tripwire — a unique string embedded in the eval set.
  const CANARY = "CANARY-7f3ac1-DO-NOT-TRAIN-ON-THIS";

  // ---- styling helpers (GSL monochrome instrument standard) ----
  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  };
  const label = { fontSize: "0.7rem", color: "#a1a1aa", letterSpacing: "0.02em" };
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

  const pill = (active, color) => ({
    ...mono,
    fontSize: "0.72rem",
    padding: "0.3rem 0.7rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: `1px solid ${active ? color : "var(--border, #27272a)"}`,
    background: active ? "var(--surface-2, #1f1f23)" : "transparent",
    color: active ? color : "#a1a1aa",
  });

  return (
    <div
      style={{
        color: "#e4e4e7",
        maxWidth: 760,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        fontSize: "0.9rem",
        lineHeight: 1.5,
      }}
    >
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}>
          Benchmark contamination
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          If test items leaked into pretraining, the model recalls answers instead
          of solving them. The score looks great and means nothing.
        </div>
      </div>

      {/* toggle */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Eval data provenance</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setContaminated(true)} style={pill(contaminated, RED)}>
            contaminated (test seen in pretraining)
          </button>
          <button onClick={() => setContaminated(false)} style={pill(!contaminated, GREEN)}>
            clean held-out
          </button>
        </div>
      </div>

      {/* score bar */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.5rem",
          }}
        >
          <span style={label}>Reported benchmark score</span>
          <span
            style={{
              ...mono,
              fontSize: "1.2rem",
              color: contaminated ? RED : GREEN,
              fontWeight: 600,
            }}
          >
            {score}%
          </span>
        </div>
        <div
          style={{
            height: 24,
            background: "var(--surface-2, #1f1f23)",
            borderRadius: "0.4rem",
            overflow: "hidden",
            border: "1px solid var(--border, #27272a)",
            position: "relative",
          }}
        >
          {/* clean baseline marker */}
          <div
            style={{
              position: "absolute",
              left: `${CLEAN}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: GREEN,
            }}
            title="real held-out capability"
          />
          <div
            style={{
              width: `${score}%`,
              height: "100%",
              background: contaminated ? RED : GREEN,
              transition: "width 0.25s ease",
            }}
          />
        </div>
        <div style={{ ...mono, fontSize: "0.7rem", color: "#a1a1aa", marginTop: "0.4rem" }}>
          real capability{" "}
          <span style={{ color: GREEN }}>|</span> = {CLEAN}%
          {contaminated && (
            <span style={{ color: RED }}>
              {"  "}· inflation = +{INFLATED - CLEAN} points of memorisation
            </span>
          )}
        </div>
      </div>

      {/* canary tripwire */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.4rem" }}>
          Canary-string tripwire
        </div>
        <div style={{ ...mono, fontSize: "0.74rem", color: "#a1a1aa", marginBottom: "0.5rem" }}>
          A unique, meaningless string is planted in the eval set. It appears
          nowhere else on the internet, so a clean model can never reproduce it. If
          the model completes it verbatim, the eval was in its training data.
        </div>

        <div
          style={{
            ...card,
            background: "var(--surface-2, #1f1f23)",
            padding: "0.75rem",
            marginBottom: "0.6rem",
          }}
        >
          <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a" }}>planted canary</div>
          <div style={{ ...mono, fontSize: "0.78rem", color: CYAN, wordBreak: "break-all" }}>
            {CANARY}
          </div>
        </div>

        <button
          onClick={() => setProbed(true)}
          style={{
            ...mono,
            fontSize: "0.74rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            border: "1px solid var(--border, #27272a)",
            background: "var(--surface-2, #1f1f23)",
            color: "#e4e4e7",
          }}
        >
          prompt: "complete: CANARY-7f3ac1-..."
        </button>

        {probed && (
          <div
            style={{
              ...card,
              marginTop: "0.6rem",
              padding: "0.75rem",
              borderLeft: `2px solid ${contaminated ? RED : GREEN}`,
            }}
          >
            <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a" }}>model output</div>
            {contaminated ? (
              <>
                <div style={{ ...mono, fontSize: "0.78rem", color: RED, wordBreak: "break-all" }}>
                  {CANARY}
                </div>
                <div style={{ fontSize: "0.8rem", color: RED, marginTop: "0.3rem" }}>
                  Reproduced verbatim. Contamination proven — the eval was memorised.
                </div>
              </>
            ) : (
              <>
                <div style={{ ...mono, fontSize: "0.78rem", color: "#a1a1aa" }}>
                  CANARY-7f3ac1-... (cannot continue — never seen this string)
                </div>
                <div style={{ fontSize: "0.8rem", color: GREEN, marginTop: "0.3rem" }}>
                  No completion. The tripwire did not fire — the held-out set stayed clean.
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>What to trust</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          A high benchmark number is only meaningful on data the model provably has
          not seen. Report clean held-out scores, and plant canaries so leakage is
          detectable rather than assumed absent.
        </div>
      </div>
    </div>
  );
}
