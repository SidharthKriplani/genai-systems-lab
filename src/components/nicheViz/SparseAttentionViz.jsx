import { useState } from "react";

// Sparse attention patterns. An n×n attention grid where each cell (i,j) is a
// query i attending to key j. Full attention computes every cell -> O(n²).
// Sparse variants skip cells to cut cost:
//   - Sliding window (Longformer local): |i - j| <= w
//   - Global + local (Longformer): sliding window PLUS a few global tokens that
//     attend to / are attended by everyone
//   - Attention sink (StreamingLLM): local window PLUS the first few tokens,
//     which act as an always-kept "sink" that stabilises the softmax
// We highlight computed cells and report the live cell count + complexity class.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const PATTERNS = [
  { k: "full", t: "Full", sub: "O(n²)" },
  { k: "window", t: "Sliding window", sub: "O(n·w)" },
  { k: "global", t: "Global + local", sub: "O(n·w + n·g)" },
  { k: "sink", t: "Attention sink", sub: "O(n·w)" },
];

// Causal by default (j <= i) — decoder self-attention. A cell counts only if it
// is both allowed by causality AND kept by the sparse pattern.
function isComputed(pattern, i, j, w, g) {
  if (j > i) return false; // causal mask
  switch (pattern) {
    case "full":
      return true;
    case "window":
      return i - j <= w;
    case "global":
      return i - j <= w || j < g || i < g;
    case "sink":
      return i - j <= w || j < g; // first g tokens always attended
    default:
      return true;
  }
}

export default function SparseAttentionViz({ onNavigate, spec } = {}) {
  const [pattern, setPattern] = useState("window");
  const [n, setN] = useState(16);
  const w = 3; // window half-width (attend to w previous tokens)
  const g = 2; // number of global / sink tokens

  const card = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const label = { fontSize: "0.72rem", color: "var(--ink-low)", letterSpacing: "0.02em" };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
  const numBig = { ...mono, fontSize: "1.35rem", fontWeight: 700, color: "var(--ink-hi)" };

  // Count computed cells live.
  let computed = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (isComputed(pattern, i, j, w, g)) computed++;
    }
  }
  const causalFull = (n * (n + 1)) / 2; // upper bound (all causal cells)
  const saved = causalFull > 0 ? Math.round((1 - computed / causalFull) * 100) : 0;

  const complexity = PATTERNS.find((p) => p.k === pattern).sub;

  // SVG grid.
  const GRID = 264;
  const cell = GRID / n;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: "var(--ink-hi)" }}>
      {/* pattern toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
        {PATTERNS.map((p) => {
          const active = pattern === p.k;
          return (
            <button
              key={p.k}
              onClick={() => setPattern(p.k)}
              style={{
                cursor: "pointer",
                textAlign: "left",
                padding: "0.55rem 0.7rem",
                borderRadius: "0.75rem",
                background: active ? "var(--surface-2)" : "var(--surface)",
                border: active ? "1px solid var(--gal-build)" : "1px solid var(--border)",
                color: "var(--ink-hi)",
              }}
            >
              <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{p.t}</div>
              <div style={{ ...mono, fontSize: "0.66rem", color: active ? "var(--gal-build)" : "var(--ink-low)" }}>
                {p.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* n slider */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
          <span style={label}>Sequence length n (window w = {w}, global/sink g = {g})</span>
          <span style={{ ...mono, color: "var(--gal-build)" }}>{n}</span>
        </div>
        <input
          type="range"
          min={6}
          max={40}
          step={1}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--gal-build)" }}
        />
      </div>

      {/* grid + readouts */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.75rem", alignItems: "start" }}>
        <div style={{ ...card, padding: "0.6rem" }}>
          <svg viewBox={`0 0 ${GRID} ${GRID}`} style={{ display: "block", width: "100%", height: "auto", maxWidth: GRID }}>
            {Array.from({ length: n }).map((_, i) =>
              Array.from({ length: n }).map((_, j) => {
                const on = isComputed(pattern, i, j, w, g);
                const causal = j <= i;
                const isGlobal =
                  on && (pattern === "global" || pattern === "sink") && (j < g || (pattern === "global" && i < g));
                return (
                  <rect
                    key={`${i}-${j}`}
                    x={j * cell}
                    y={i * cell}
                    width={cell - 0.5}
                    height={cell - 0.5}
                    fill={on ? (isGlobal ? "var(--gal-build)" : "#10b981") : causal ? "var(--surface)" : "transparent"}
                    stroke={causal && !on ? "var(--border)" : "none"}
                    strokeWidth="0.5"
                    opacity={on ? 0.95 : 0.6}
                  />
                );
              })
            )}
          </svg>
          <div style={{ ...mono, fontSize: "0.6rem", color: "var(--ink-low)", marginTop: "0.35rem", lineHeight: 1.4 }}>
            rows = queries, cols = keys · <span style={{ color: "#10b981" }}>■ local/computed</span>{" "}
            {(pattern === "global" || pattern === "sink") && (
              <span style={{ color: "var(--gal-build)" }}>■ global/sink</span>
            )}{" "}
            · □ skipped (causal)
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={card}>
            <div style={label}>Cells computed</div>
            <div style={numBig}>{computed}</div>
            <div style={{ ...mono, fontSize: "0.66rem", color: "var(--ink-low)" }}>
              of {causalFull} causal cells
            </div>
          </div>
          <div style={card}>
            <div style={label}>Complexity</div>
            <div style={{ ...numBig, color: "var(--gal-build)" }}>{complexity}</div>
          </div>
          <div style={{ ...card, borderColor: saved > 0 ? "#10b981" : "var(--border)" }}>
            <div style={label}>Skipped vs full causal</div>
            <div style={{ ...numBig, color: saved > 0 ? "#10b981" : "var(--ink-hi)" }}>{saved}%</div>
          </div>
        </div>
      </div>

      {/* why line */}
      <div style={{ ...card, borderLeft: "3px solid var(--gal-build)", fontSize: "0.82rem", lineHeight: 1.5 }}>
        {pattern === "full" && (
          <>
            <strong>Full attention — O(n²).</strong> Every query attends to every prior key. Exact, but
            cost and KV-cache memory grow quadratically, so doubling n <em>quadruples</em> the work. This is
            the wall long-context models fight.
          </>
        )}
        {pattern === "window" && (
          <>
            <strong>Sliding window — O(n·w).</strong> Each query sees only the last {w} tokens, so cost is
            linear in n. Stacking layers still propagates information far (receptive field grows with depth),
            but a single layer is myopic — pure locality can miss long-range dependencies.
          </>
        )}
        {pattern === "global" && (
          <>
            <strong>Global + local (Longformer) — O(n·w + n·g).</strong> The local window handles nearby
            context cheaply, while {g} designated <em>global</em> tokens (think [CLS], question tokens)
            attend to and are attended by everyone — a low-cost highway for long-range signal.
          </>
        )}
        {pattern === "sink" && (
          <>
            <strong>Attention sink (StreamingLLM) — O(n·w).</strong> Keep a sliding window <em>plus</em> the
            first {g} tokens. Those initial "sink" tokens soak up excess softmax mass; dropping them collapses
            quality. Keeping them lets you stream indefinitely with a fixed KV budget.
          </>
        )}
      </div>
    </div>
  );
}
