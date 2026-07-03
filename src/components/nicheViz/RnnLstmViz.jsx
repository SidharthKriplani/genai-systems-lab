import { useState } from "react";

// RNN vs LSTM: unroll a short sequence and show the gradient magnitude decaying
// with distance from the loss (vanishing gradient). A toggle swaps the plain RNN
// (repeated multiply by the per-step factor) for an LSTM (additive cell-state
// "conveyor belt" ~= factor near 1), preserving the gradient over the same span.
export default function RnnLstmViz({ onNavigate, spec } = {}) {
  const [factor, setFactor] = useState(6); // per-step RNN factor x10 => 0.1..1.5
  const [lstm, setLstm] = useState(false);
  const STEPS = 12;
  const f = factor / 10;
  // LSTM cell-state additive path keeps the effective per-step factor near 1.
  const effFactor = lstm ? 1.0 : f;

  // Gradient magnitude at step t (distance = STEPS-1-t from the loss at the last step).
  // grad(dist) = effFactor^dist. Loss sits at the rightmost step (dist 0).
  const grads = Array.from({ length: STEPS }, (_, t) => {
    const distFromLoss = STEPS - 1 - t;
    return Math.pow(effFactor, distFromLoss);
  });
  const gradAtStart = grads[0]; // furthest from loss

  const status =
    !lstm && f < 1
      ? gradAtStart < 0.01
        ? "vanished"
        : "decaying"
      : !lstm && f > 1
      ? "exploding"
      : "preserved";

  // ---- styling (GSL monochrome instrument standard) ----
  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
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

  const statusColor =
    status === "preserved" ? GREEN : status === "exploding" ? RED : status === "vanished" ? RED : "#e4e4e7";

  // bar geometry
  const barMaxH = 90;
  const barColor = (g) => {
    if (lstm) return GREEN;
    if (f > 1) return RED;
    return g < 0.05 ? RED : CYAN;
  };
  // for display, clamp exploding bars visually but report the true number
  const barH = (g) => Math.min(1, g) * barMaxH;

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
          Vanishing gradients — and how the LSTM cell state survives them
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Backprop-through-time multiplies the same per-step factor at every hop. Over many
          steps that is geometric: below 1 the gradient vanishes; the LSTM's additive cell
          state keeps it near 1.
        </div>
      </div>

      {/* mode toggle */}
      <div style={card}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.9rem" }}>
          <button onClick={() => setLstm(false)} style={pill(!lstm, CYAN)}>
            plain RNN
          </button>
          <button onClick={() => setLstm(true)} style={pill(lstm, GREEN)}>
            LSTM (cell-state path)
          </button>
        </div>

        {/* unrolled bars: loss on the right */}
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          Gradient magnitude at each step (loss is at the far right, step {STEPS})
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: barMaxH + 24 }}>
          {grads.map((g, t) => (
            <div key={t} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: barH(g),
                  background: barColor(g),
                  opacity: 0.5,
                  borderRadius: "2px 2px 0 0",
                }}
              />
              <div style={{ ...mono, fontSize: "0.55rem", color: "#71717a", marginTop: "2px" }}>{t + 1}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            ...mono,
            fontSize: "0.65rem",
            color: "#71717a",
            marginTop: "0.2rem",
          }}
        >
          <span>far from loss (early tokens)</span>
          <span>loss →</span>
        </div>

        {/* readouts */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: "0.9rem",
          }}
        >
          <span style={label}>gradient reaching the FIRST token (over {STEPS - 1} steps)</span>
          <span style={{ ...mono, fontSize: "1.05rem", color: statusColor, fontWeight: 600 }}>
            {gradAtStart < 0.001 || gradAtStart > 1000
              ? gradAtStart.toExponential(2)
              : gradAtStart.toFixed(4)}
          </span>
        </div>
        <div style={{ ...mono, fontSize: "0.72rem", color: statusColor, marginTop: "0.25rem" }}>
          status: {status}
          {status === "vanished" && " — early tokens get almost no learning signal"}
          {status === "exploding" && " — NaNs / instability (tame with gradient clipping)"}
          {status === "preserved" && " — the additive cell state carries the signal across the span"}
        </div>
      </div>

      {/* per-step factor slider (disabled-in-effect when LSTM on) */}
      <div style={card}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}
        >
          <span style={label}>per-step factor (recurrent weight × activation derivative)</span>
          <span style={{ ...mono, color: lstm ? "#71717a" : CYAN, fontSize: "1.1rem" }}>{f.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={1}
          max={15}
          step={1}
          value={factor}
          onChange={(e) => setFactor(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            ...mono,
            fontSize: "0.65rem",
            color: "#71717a",
            marginTop: "0.25rem",
          }}
        >
          <span>0.1 (vanish fast)</span>
          <span>1.0 (knife-edge)</span>
          <span>1.5 (explode)</span>
        </div>
        <div style={{ ...mono, fontSize: "0.7rem", color: "#a1a1aa", marginTop: "0.7rem" }}>
          {lstm
            ? "LSTM ON: the cell-state conveyor belt is an additive path, so the effective per-step factor is pinned near 1 — the slider no longer drains the gradient. This is the gradient highway that gates protect."
            : `plain RNN: grad at first token = factor^${STEPS - 1} = ${f.toFixed(1)}^${STEPS - 1}. Slide below 1 and watch it collapse to zero; above 1 and it blows up. This geometric decay is exactly why plain RNNs can't learn long-range dependencies.`}
        </div>
      </div>
    </div>
  );
}
