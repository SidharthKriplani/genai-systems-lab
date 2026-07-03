import { useState } from "react";

// Word2Vec: two mechanics in one instrument.
// (1) Skip-gram window control — shows the (center, context) training pairs a
//     window of size w generates from a sample sentence.
// (2) A toy 2D embedding space where the user does vector arithmetic
//     (king - man + woman) and sees the nearest word snap into place.
export default function Word2vecViz({ onNavigate, spec } = {}) {
  const [win, setWin] = useState(2); // skip-gram window size
  const [centerIdx, setCenterIdx] = useState(3); // which token is the center
  const [analogy, setAnalogy] = useState("king-man+woman"); // which analogy

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

  // ---- (1) skip-gram pairs ----
  const SENT = ["the", "quick", "brown", "fox", "jumps", "over", "lazy"];
  const pairs = [];
  for (let j = centerIdx - win; j <= centerIdx + win; j++) {
    if (j === centerIdx || j < 0 || j >= SENT.length) continue;
    pairs.push([SENT[centerIdx], SENT[j]]);
  }

  // ---- (2) toy 2D embedding space ----
  // Hand-placed so that (man->woman) offset ~= (king->queen) offset, etc.
  const VEC = {
    man: [1.0, 1.0],
    woman: [1.0, 3.0],
    king: [4.0, 1.4],
    queen: [4.0, 3.4],
    paris: [1.4, 6.0],
    france: [1.0, 5.0],
    rome: [4.4, 6.0],
    italy: [4.0, 5.0],
  };
  const ANALOGIES = {
    "king-man+woman": { a: "king", b: "man", c: "woman", answer: "queen" },
    "paris-france+italy": { a: "paris", b: "france", c: "italy", answer: "rome" },
  };
  const { a, b, c, answer } = ANALOGIES[analogy];
  // result = a - b + c
  const result = [
    VEC[a][0] - VEC[b][0] + VEC[c][0],
    VEC[a][1] - VEC[b][1] + VEC[c][1],
  ];
  // nearest word to result (excluding the inputs)
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  let nearest = null;
  let best = Infinity;
  Object.keys(VEC).forEach((w) => {
    if (w === a || w === b || w === c) return;
    const d = dist(result, VEC[w]);
    if (d < best) {
      best = d;
      nearest = w;
    }
  });
  const correct = nearest === answer;

  // SVG geometry: data x in [0,5], y in [0,7]
  const W = 320;
  const H = 300;
  const PAD = 26;
  const sx = (v) => PAD + (v / 5) * (W - 2 * PAD);
  const sy = (v) => H - PAD - (v / 7) * (H - 2 * PAD);

  const dot = (w, color) => (
    <g key={w}>
      <circle cx={sx(VEC[w][0])} cy={sy(VEC[w][1])} r={4} fill={color} />
      <text x={sx(VEC[w][0]) + 7} y={sy(VEC[w][1]) + 3} fill="#d4d4d8" fontSize="10" style={mono}>
        {w}
      </text>
    </g>
  );

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
          Word2Vec — training pairs and the geometry of meaning
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Skip-gram turns one center word into several (center, context) pairs. Learning
          to predict them places similar words nearby — so meaning becomes vector math.
        </div>
      </div>

      {/* (1) skip-gram window */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          Skip-gram — (center, context) pairs from a window
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.7rem" }}>
          {SENT.map((tok, i) => {
            const isCenter = i === centerIdx;
            const inWin = i !== centerIdx && Math.abs(i - centerIdx) <= win;
            return (
              <button
                key={i}
                onClick={() => setCenterIdx(i)}
                style={{
                  ...mono,
                  fontSize: "0.75rem",
                  padding: "0.28rem 0.5rem",
                  borderRadius: "0.4rem",
                  cursor: "pointer",
                  border: `1px solid ${isCenter ? CYAN : inWin ? GREEN : "var(--border, #27272a)"}`,
                  background: isCenter ? "var(--surface-2, #1f1f23)" : "transparent",
                  color: isCenter ? CYAN : inWin ? GREEN : "#a1a1aa",
                }}
              >
                {tok}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.4rem",
          }}
        >
          <span style={label}>window size w (context radius)</span>
          <span style={{ ...mono, color: CYAN, fontSize: "1.1rem" }}>{win}</span>
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={1}
          value={win}
          onChange={(e) => setWin(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />

        <div style={{ ...mono, fontSize: "0.72rem", color: "#d4d4d8", marginTop: "0.7rem" }}>
          <span style={{ color: CYAN }}>{SENT[centerIdx]}</span> generates{" "}
          <span style={{ color: GREEN }}>{pairs.length}</span> pairs:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.4rem" }}>
          {pairs.map((p, i) => (
            <span
              key={i}
              style={{
                ...mono,
                fontSize: "0.72rem",
                padding: "0.2rem 0.45rem",
                borderRadius: "0.4rem",
                border: "1px solid var(--border, #27272a)",
                background: "var(--surface-2, #1f1f23)",
                color: "#d4d4d8",
              }}
            >
              ({p[0]}, {p[1]})
            </span>
          ))}
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.55rem" }}>
          Wider window = more pairs per word. A rare center word gets several updates from
          one occurrence — why skip-gram wins on rare words and small data.
        </div>
      </div>

      {/* (2) vector arithmetic */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          Analogy as vector arithmetic — a − b + c ≈ ?
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.7rem" }}>
          <button onClick={() => setAnalogy("king-man+woman")} style={pill(analogy === "king-man+woman", CYAN)}>
            king − man + woman
          </button>
          <button onClick={() => setAnalogy("paris-france+italy")} style={pill(analogy === "paris-france+italy", CYAN)}>
            paris − france + italy
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg width={W} height={H} style={{ maxWidth: "100%" }}>
            <rect
              x={PAD}
              y={PAD}
              width={W - 2 * PAD}
              height={H - 2 * PAD}
              fill="var(--surface-2, #1f1f23)"
              stroke="var(--border, #27272a)"
            />
            {/* offset vectors: b->a and c->result share the same direction */}
            <line
              x1={sx(VEC[b][0])}
              y1={sy(VEC[b][1])}
              x2={sx(VEC[a][0])}
              y2={sy(VEC[a][1])}
              stroke="#71717a"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <line
              x1={sx(VEC[c][0])}
              y1={sy(VEC[c][1])}
              x2={sx(result[0])}
              y2={sy(result[1])}
              stroke={CYAN}
              strokeWidth={1.5}
            />
            {/* all word dots */}
            {Object.keys(VEC).map((w) => {
              let color = "#71717a";
              if (w === a || w === b || w === c) color = "#d4d4d8";
              if (w === nearest) color = correct ? GREEN : RED;
              return dot(w, color);
            })}
            {/* the computed result point */}
            <circle cx={sx(result[0])} cy={sy(result[1])} r={5} fill="none" stroke={CYAN} strokeWidth={2} />
            <text x={sx(result[0]) + 7} y={sy(result[1]) - 6} fill={CYAN} fontSize="10" style={mono}>
              result
            </text>
          </svg>
        </div>

        <div style={{ ...mono, fontSize: "0.8rem", marginTop: "0.5rem", color: "#d4d4d8" }}>
          {a} − {b} + {c} ={" "}
          <span style={{ color: correct ? GREEN : RED, fontWeight: 600 }}>{nearest}</span>{" "}
          <span style={{ color: "#71717a" }}>(nearest word, distance {best.toFixed(2)})</span>
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.4rem" }}>
          The <span style={{ color: "#71717a" }}>- -</span> grey and{" "}
          <span style={{ color: CYAN }}>—</span> cyan arrows are the *same* offset (the learned
          "gender" / "capital-of" direction). That the space has a consistent direction for a
          relationship is its emergent linear structure — nobody labeled it.
        </div>
      </div>
    </div>
  );
}
