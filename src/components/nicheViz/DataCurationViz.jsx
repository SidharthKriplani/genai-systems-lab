import { useState } from "react";

// Quality vs quantity for fine-tuning data. Quality dominates the resulting
// model quality — a small clean set beats a large dirty one.
export default function DataCurationViz({ onNavigate, spec } = {}) {
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

  const [size, setSize] = useState(2000); // examples
  const [quality, setQuality] = useState(50); // 0..100 cleanliness
  const [dedup, setDedup] = useState(false);
  const [licenseFilter, setLicenseFilter] = useState(false);
  const [synthetic, setSynthetic] = useState(false);

  // Model quality model: quality dominates via a strong exponent; size gives
  // diminishing log returns. Toggles nudge effective quality up; synthetic
  // adds a risk penalty at scale.
  const q = quality / 100;
  let effQ = q;
  if (dedup) effQ += 0.06; // removing dupes lifts effective quality
  if (licenseFilter) effQ += 0.04; // clean licensing = safer, slightly cleaner set
  if (synthetic) effQ -= 0.02 + (size / 100000) * 0.15; // drift/collapse risk grows with volume
  effQ = Math.max(0, Math.min(1, effQ));

  // size contribution: log-scaled, capped — clearly weaker than quality
  const sizeScore = Math.min(1, Math.log10(size) / 5); // ~0.66 at 2k, ~0.86 at 50k
  // quality weighted ~2.5x size in the blend, and squared so dirty data tanks it
  const modelScore = Math.round(
    (0.72 * Math.pow(effQ, 1.4) + 0.28 * sizeScore) * 100
  );

  const verdict =
    modelScore >= 70 ? GREEN : modelScore >= 45 ? CYAN : RED;
  const verdictWord =
    modelScore >= 70 ? "strong" : modelScore >= 45 ? "usable" : "weak";

  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  };
  const label = { fontSize: "0.7rem", color: "#a1a1aa" };

  function Toggle({ on, set, children, danger }) {
    const accent = danger ? RED : GREEN;
    return (
      <button
        onClick={() => set(!on)}
        style={{
          ...mono,
          fontSize: "0.76rem",
          padding: "0.45rem 0.7rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          border: `1px solid ${on ? accent : "var(--border, #27272a)"}`,
          background: on ? "var(--surface-2, #1f1f23)" : "transparent",
          color: on ? "#fafafa" : "#a1a1aa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{children}</span>
        <span style={{ color: on ? accent : "#52525b" }}>{on ? "on" : "off"}</span>
      </button>
    );
  }

  // build the quality curve: sweep quality 0..100 at current size, plot as SVG
  const W = 320, H = 110, PAD = 6;
  const curve = [];
  for (let i = 0; i <= 20; i++) {
    const qi = i / 20;
    let e = qi;
    if (dedup) e += 0.06;
    if (licenseFilter) e += 0.04;
    if (synthetic) e -= 0.02 + (size / 100000) * 0.15;
    e = Math.max(0, Math.min(1, e));
    const m = 0.72 * Math.pow(e, 1.4) + 0.28 * sizeScore;
    const x = PAD + qi * (W - 2 * PAD);
    const y = H - PAD - m * (H - 2 * PAD);
    curve.push([x, y]);
  }
  const path = curve.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const dotX = PAD + q * (W - 2 * PAD);
  const dotY = H - PAD - (0.72 * Math.pow(effQ, 1.4) + 0.28 * sizeScore) * (H - 2 * PAD);

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
          Data curation for fine-tuning
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Quality vs quantity. Drag both — watch which one actually moves the
          resulting model quality.
        </div>
      </div>

      {/* verdict + curve */}
      <div style={{ ...card, borderLeft: `2px solid ${verdict}` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={label}>resulting model quality</span>
          <span style={{ ...mono, fontSize: "1.6rem", color: verdict }}>
            {modelScore}
            <span style={{ fontSize: "0.9rem", color: "#71717a" }}>/100</span>
          </span>
        </div>
        <div style={{ ...mono, fontSize: "0.78rem", color: verdict, marginTop: "0.1rem" }}>
          {verdictWord}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", marginTop: "0.6rem" }}
        >
          <rect x="0" y="0" width={W} height={H} fill="var(--surface-2, #1f1f23)" rx="6" />
          <path d={path} fill="none" stroke={CYAN} strokeWidth="2" />
          <line x1={dotX} y1={PAD} x2={dotX} y2={H - PAD} stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={dotX} cy={dotY} r="4" fill={verdict} />
        </svg>
        <div style={{ ...mono, fontSize: "0.64rem", color: "#71717a", marginTop: "0.2rem" }}>
          x-axis = data quality → · steep climb means quality dominates
        </div>
      </div>

      {/* size slider */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.35rem",
          }}
        >
          <span style={{ fontWeight: 600 }}>dataset size</span>
          <span style={{ ...mono, color: "#fafafa" }}>
            {size.toLocaleString()} examples
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={50000}
          step={100}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />
        <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "0.3rem" }}>
          more helps with diminishing returns — it can't rescue dirty data.
        </div>
      </div>

      {/* quality slider */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.35rem",
          }}
        >
          <span style={{ fontWeight: 600 }}>data quality</span>
          <span style={{ ...mono, color: "#fafafa" }}>{quality}% clean</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />
        <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "0.3rem" }}>
          the dominant lever — a small clean set beats a large dirty one.
        </div>
      </div>

      {/* curation toggles */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ ...label, marginBottom: "0.1rem" }}>curation steps</div>
        <Toggle on={dedup} set={setDedup}>
          dedup near-duplicates (lifts effective quality)
        </Toggle>
        <Toggle on={licenseFilter} set={setLicenseFilter}>
          license filter (drop unusable / risky sources)
        </Toggle>
        <Toggle on={synthetic} set={setSynthetic} danger>
          heavy synthetic data (drift / collapse risk)
        </Toggle>
        {synthetic && (
          <div style={{ fontSize: "0.74rem", color: RED }}>
            Synthetic risk: model-generated data can amplify its own biases and
            collapse the distribution — the penalty grows with volume. Keep a
            human-verified core.
          </div>
        )}
      </div>

      <div
        style={{
          ...card,
          borderLeft: `2px solid ${CYAN}`,
          fontSize: "0.82rem",
          color: "#d4d4d8",
        }}
      >
        Build the <span style={{ color: CYAN }}>eval set first</span>, before you
        touch training data — you can't tell whether curation is helping without
        a fixed yardstick. Then the rule holds: quality dominates. A few thousand
        clean, deduped examples routinely beat ten times as many noisy ones.
      </div>
    </div>
  );
}
