import { useState } from "react";

// Calibration: a reliability diagram (confidence bins vs accuracy). Perfect
// calibration is the diagonal. Temperature scaling reshapes the curve toward it;
// ECE is recomputed live. An RLHF-overconfident toggle pushes the curve above.
export default function CalibrationViz({ onNavigate, spec } = {}) {
  const [temp, setTemp] = useState(15); // T x10, so slider is integer; T = temp/10
  const [rlhf, setRlhf] = useState(false);
  const T = temp / 10;

  const BINS = 10;
  // Bin centres: 0.05, 0.15, ... 0.95
  const centres = Array.from({ length: BINS }, (_, i) => (i + 0.5) / BINS);

  // Raw model confidence per bin = the bin centre (uniform mass for the demo).
  // Temperature scaling maps confidence conf -> conf^(1/T) style softening.
  // T>1 softens (pulls toward 0.5-ish, lowering overconfidence);
  // T<1 sharpens. We model the *reported* confidence after scaling.
  const scaleConf = (c) => {
    // logit-space temperature scaling on a binary-style confidence.
    const eps = 1e-4;
    const cc = Math.min(1 - eps, Math.max(eps, c));
    const logit = Math.log(cc / (1 - cc));
    const scaled = logit / T;
    return 1 / (1 + Math.exp(-scaled));
  };

  // True accuracy the model actually achieves in each confidence region.
  // Base model is slightly overconfident; RLHF pushes accuracy well below stated
  // confidence (curve sits under the diagonal => overconfident).
  const trueAcc = (c) => {
    const gap = rlhf ? 0.22 : 0.08; // how far accuracy trails confidence at the high end
    // accuracy trails confidence, most at the confident end.
    const a = c - gap * Math.pow(c, 2);
    return Math.min(1, Math.max(0, a));
  };

  // For each bin: reported confidence (after T) and realised accuracy.
  const rows = centres.map((c) => {
    const conf = scaleConf(c);
    const acc = trueAcc(c);
    return { conf, acc };
  });

  // ECE = sum over bins of (weight) * |acc - conf|. Uniform weights (1/BINS).
  const ece = rows.reduce((s, r) => s + Math.abs(r.acc - r.conf) / BINS, 0);

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

  // SVG geometry
  const W = 320;
  const H = 320;
  const PAD = 34;
  const px = (v) => PAD + v * (W - 2 * PAD);
  const py = (v) => H - PAD - v * (H - 2 * PAD);

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

  const barW = (W - 2 * PAD) / BINS;

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
          Calibration and the reliability diagram
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          A calibrated model of 80% confidence is right 80% of the time. The
          diagonal is perfect. Below it means overconfident.
        </div>
      </div>

      {/* diagram */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          Reliability diagram — confidence (x) vs accuracy (y)
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxWidth: W }}>
            {/* grid frame */}
            <rect
              x={PAD}
              y={PAD}
              width={W - 2 * PAD}
              height={H - 2 * PAD}
              fill="var(--surface-2, #1f1f23)"
              stroke="var(--border, #27272a)"
            />
            {/* perfect-calibration diagonal */}
            <line
              x1={px(0)}
              y1={py(0)}
              x2={px(1)}
              y2={py(1)}
              stroke="#71717a"
              strokeDasharray="4 3"
            />
            {/* bars: accuracy per bin */}
            {rows.map((r, i) => {
              const x = px(centres[i]) - barW / 2 + 1;
              const h = r.acc * (H - 2 * PAD);
              const over = r.conf > r.acc; // reported > realised => overconfident
              return (
                <rect
                  key={i}
                  x={x}
                  y={H - PAD - h}
                  width={barW - 2}
                  height={h}
                  fill={over ? RED : GREEN}
                  opacity={0.35}
                />
              );
            })}
            {/* reported-confidence curve (after temperature scaling) */}
            <polyline
              points={rows.map((r, i) => `${px(centres[i])},${py(r.conf)}`).join(" ")}
              fill="none"
              stroke={CYAN}
              strokeWidth={2}
            />
            {rows.map((r, i) => (
              <circle key={i} cx={px(centres[i])} cy={py(r.conf)} r={2.5} fill={CYAN} />
            ))}
            {/* axes labels */}
            <text x={W / 2} y={H - 8} fill="#a1a1aa" fontSize="10" textAnchor="middle">
              confidence
            </text>
            <text
              x={12}
              y={H / 2}
              fill="#a1a1aa"
              fontSize="10"
              textAnchor="middle"
              transform={`rotate(-90 12 ${H / 2})`}
            >
              accuracy
            </text>
            <text x={px(0)} y={H - PAD + 12} fill="#71717a" fontSize="9" textAnchor="middle">0</text>
            <text x={px(1)} y={H - PAD + 12} fill="#71717a" fontSize="9" textAnchor="middle">1</text>
          </svg>
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.3rem" }}>
          <span style={{ color: CYAN }}>—</span> reported confidence &nbsp;·&nbsp;
          <span style={{ color: GREEN }}>▮</span> bar height = realised accuracy
          &nbsp;·&nbsp; <span style={{ color: "#71717a" }}>- -</span> perfect calibration
        </div>
      </div>

      {/* controls + ECE */}
      <div style={card}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem" }}>
          <button onClick={() => setRlhf(false)} style={pill(!rlhf, GREEN)}>
            base model
          </button>
          <button onClick={() => setRlhf(true)} style={pill(rlhf, RED)}>
            RLHF overconfident
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.5rem",
          }}
        >
          <span style={label}>Temperature T (scales the confidence curve)</span>
          <span style={{ ...mono, color: CYAN, fontSize: "1.1rem" }}>{T.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          step={1}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            ...mono,
            fontSize: "0.68rem",
            color: "#71717a",
            marginTop: "0.25rem",
          }}
        >
          <span>0.5 (sharpen)</span>
          <span>1.0</span>
          <span>3.0 (soften)</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: "0.9rem",
          }}
        >
          <span style={label}>Expected calibration error (ECE)</span>
          <span
            style={{
              ...mono,
              fontSize: "1.2rem",
              color: ece <= 0.05 ? GREEN : ece <= 0.12 ? "#e4e4e7" : RED,
              fontWeight: 600,
            }}
          >
            {ece.toFixed(3)}
          </span>
        </div>
        <div style={{ ...mono, fontSize: "0.7rem", color: "#a1a1aa", marginTop: "0.3rem" }}>
          ECE = Σ (bin weight) · |accuracy − confidence|, averaged over {BINS} bins.
          Lower is better; 0 is the diagonal.
        </div>
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Reading it</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          {rlhf
            ? "RLHF often makes models state high confidence they don't earn — the curve sits above realised accuracy, so ECE climbs. "
            : "The base model is only mildly overconfident. "}
          Raising T softens the reported confidence toward the diagonal, lowering
          ECE; T below 1 sharpens it and makes overconfidence worse. Temperature
          scaling is a single-parameter post-hoc fix — it re-labels confidence
          without retraining.
        </div>
      </div>
    </div>
  );
}
