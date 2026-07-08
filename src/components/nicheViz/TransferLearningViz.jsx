import { useState } from "react";

// Transfer learning data-efficiency curve: accuracy vs number of labeled
// examples, comparing "train from scratch" against "fine-tune a pretrained
// model". The pretrained curve starts high and saturates fast; the readout
// shows the label count each needs to reach a target and the accuracy gap.
export default function TransferLearningViz({ onNavigate, spec } = {}) {
  // slider controls how many labels you have (log-ish scale, integer steps 0..10)
  // index -> labels: 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000
  const LABELS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  const [idx, setIdx] = useState(6); // default 2000
  const n = LABELS[idx];

  // accuracy models: saturating curves. Pretrained starts high, low sample need;
  // scratch starts near-random and climbs slowly.
  // pretrained: acc = 0.55 + 0.42*(1 - e^(-n/300))
  // scratch:    acc = 0.50 + 0.44*(1 - e^(-n/9000))
  const accPretrained = (m) => 0.55 + 0.42 * (1 - Math.exp(-m / 300));
  const accScratch = (m) => 0.5 + 0.44 * (1 - Math.exp(-m / 9000));

  const pAcc = accPretrained(n);
  const sAcc = accScratch(n);
  const gap = pAcc - sAcc;

  // label count each needs to reach a target accuracy (invert the curves)
  const TARGET = 0.85;
  const labelsForPretrained = -300 * Math.log(1 - (TARGET - 0.55) / 0.42);
  const labelsForScratch =
    TARGET - 0.5 < 0.44 ? -9000 * Math.log(1 - (TARGET - 0.5) / 0.44) : Infinity;

  // ---- styling ----
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

  // SVG geometry — x = log10(labels), y = accuracy
  const W = 360;
  const H = 300;
  const PAD = 40;
  const xMin = Math.log10(20);
  const xMax = Math.log10(50000);
  const px = (labels) =>
    PAD + ((Math.log10(labels) - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const py = (acc) => H - PAD - ((acc - 0.4) / 0.6) * (H - 2 * PAD); // y from 0.4..1.0

  // sample points across the range for smooth curves
  const SAMPLES = [];
  for (let l = 20; l <= 50000; l *= 1.4) SAMPLES.push(l);
  SAMPLES.push(50000);

  const pretrainedPath = SAMPLES.map((l) => `${px(l)},${py(accPretrained(l))}`).join(" ");
  const scratchPath = SAMPLES.map((l) => `${px(l)},${py(accScratch(l))}`).join(" ");

  const xTicks = [20, 100, 1000, 10000, 50000];
  const yTicks = [0.4, 0.6, 0.8, 1.0];

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
          Data efficiency: pretrain-then-fine-tune vs train-from-scratch
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          A pretrained model already learned language on unlabeled text, so a few labels reach
          high accuracy. From scratch, every label must also teach language.
        </div>
      </div>

      {/* chart */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          accuracy (y) vs labeled examples (x, log scale)
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxWidth: W }}>
            <rect
              x={PAD}
              y={PAD}
              width={W - 2 * PAD}
              height={H - 2 * PAD}
              fill="var(--surface-2, #1f1f23)"
              stroke="var(--border, #27272a)"
            />
            {/* gridlines */}
            {yTicks.map((t) => (
              <g key={"y" + t}>
                <line x1={PAD} y1={py(t)} x2={W - PAD} y2={py(t)} stroke="#27272a" strokeDasharray="2 3" />
                <text x={PAD - 6} y={py(t) + 3} fill="#71717a" fontSize="9" textAnchor="end">
                  {t.toFixed(1)}
                </text>
              </g>
            ))}
            {xTicks.map((t) => (
              <text key={"x" + t} x={px(t)} y={H - PAD + 12} fill="#71717a" fontSize="9" textAnchor="middle">
                {t >= 1000 ? `${t / 1000}k` : t}
              </text>
            ))}

            {/* scratch curve (grey) */}
            <polyline points={scratchPath} fill="none" stroke="#a1a1aa" strokeWidth={2} />
            {/* pretrained curve (cyan) */}
            <polyline points={pretrainedPath} fill="none" stroke={CYAN} strokeWidth={2} />

            {/* current-n markers + vertical guide */}
            <line x1={px(n)} y1={PAD} x2={px(n)} y2={H - PAD} stroke="#52525b" strokeDasharray="3 3" />
            <circle cx={px(n)} cy={py(pAcc)} r={4} fill={CYAN} />
            <circle cx={px(n)} cy={py(sAcc)} r={4} fill="#a1a1aa" />
            {/* gap bracket */}
            <line x1={px(n)} y1={py(pAcc)} x2={px(n)} y2={py(sAcc)} stroke={GREEN} strokeWidth={2} opacity={0.7} />

            {/* axis titles */}
            <text x={W / 2} y={H - 6} fill="#a1a1aa" fontSize="10" textAnchor="middle">
              labeled examples
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
          </svg>
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.3rem" }}>
          <span style={{ color: CYAN }}>—</span> fine-tune pretrained &nbsp;·&nbsp;
          <span style={{ color: "#a1a1aa" }}>—</span> train from scratch &nbsp;·&nbsp;
          <span style={{ color: GREEN }}>|</span> accuracy gap at your label count
        </div>
      </div>

      {/* slider + readout */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
          <span style={label}>labeled examples you have</span>
          <span style={{ ...mono, color: CYAN, fontSize: "1.1rem" }}>
            {n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={LABELS.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.25rem" }}>
          <span>20</span>
          <span>2k</span>
          <span>50k</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginTop: "1rem" }}>
          <div>
            <div style={label}>fine-tune pretrained</div>
            <div style={{ ...mono, color: CYAN, fontSize: "1.3rem", fontWeight: 600 }}>
              {(pAcc * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div style={label}>train from scratch</div>
            <div style={{ ...mono, color: "#a1a1aa", fontSize: "1.3rem", fontWeight: 600 }}>
              {(sAcc * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "0.9rem" }}>
          <span style={label}>accuracy gap at this label count</span>
          <span style={{ ...mono, fontSize: "1.2rem", color: GREEN, fontWeight: 600 }}>
            +{(gap * 100).toFixed(1)} pts
          </span>
        </div>
      </div>

      {/* reading it */}
      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Reading it</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          To reach {Math.round(TARGET * 100)}% accuracy, the pretrained model needs about{" "}
          <span style={{ color: CYAN }}>{Math.round(labelsForPretrained).toLocaleString()}</span> labels;
          from scratch needs about{" "}
          <span style={{ color: "#a1a1aa" }}>
            {Number.isFinite(labelsForScratch) ? Math.round(labelsForScratch).toLocaleString() : "far more than 50k"}
          </span>{" "}
          — often {Number.isFinite(labelsForScratch) ? `${Math.round(labelsForScratch / labelsForPretrained)}x` : "orders"} more. The gap is largest when labels
          are scarce and shrinks as data grows, because the from-scratch model eventually learns
          language too. That is the whole value of pretraining: the expensive language learning
          happened once on free unlabeled text, so your labels only teach the final task.
        </div>
      </div>
    </div>
  );
}
