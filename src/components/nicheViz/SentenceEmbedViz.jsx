import { useState } from "react";

// Sentence embeddings: a small set of sentences placed in a 2D similarity space
// (semantically similar ones cluster), plus a cosine-similarity heatmap between
// them. A pooling toggle (CLS / mean / max) visibly reshapes the layout and the
// similarities — mean pooling gives the cleanest clusters (SBERT's default).
export default function SentenceEmbedViz({ onNavigate, spec } = {}) {
  const [pool, setPool] = useState("mean");

  // Sentences grouped into 3 latent topics. Each pooling strategy yields a
  // different 2D embedding: mean pooling separates topics cleanly; CLS is
  // decent; max pooling is noisier / more anisotropic (things crowd together).
  const SENTS = [
    { short: "refund policy", topic: 0 },
    { short: "how to get money back", topic: 0 },
    { short: "reset my password", topic: 1 },
    { short: "recover my account", topic: 1 },
    { short: "train delay today", topic: 2 },
    { short: "when is my train", topic: 2 },
  ];

  // Base "true" 2D positions per topic (clean clusters).
  const TOPIC_CENTER = [
    { x: 0.22, y: 0.28 },
    { x: 0.76, y: 0.30 },
    { x: 0.48, y: 0.80 },
  ];
  // small within-cluster jitter, deterministic per index
  const jitter = (i) => ({
    dx: ((i * 37) % 11) / 100 - 0.05,
    dy: ((i * 53) % 11) / 100 - 0.05,
  });

  // Pooling reshapes positions: mean = clean; cls = mild pull to center; max =
  // strong pull to center (anisotropy) so clusters blur.
  const pullToCenter = pool === "mean" ? 0 : pool === "cls" ? 0.25 : 0.55;
  const pos = SENTS.map((s, i) => {
    const c = TOPIC_CENTER[s.topic];
    const j = jitter(i);
    let x = c.x + j.dx;
    let y = c.y + j.dy;
    // pull toward global center 0.5,0.5
    x = x + (0.5 - x) * pullToCenter;
    y = y + (0.5 - y) * pullToCenter;
    return { x, y };
  });

  // cosine similarity approximated from 2D distance: closer -> higher.
  // sim = 1 - dist/maxDist, clamped. This makes the heatmap track the layout.
  const dist = (a, b) => Math.hypot(pos[a].x - pos[b].x, pos[a].y - pos[b].y);
  const MAXD = 1.1;
  const sim = (a, b) => {
    if (a === b) return 1;
    // floor rises with pull-to-center: anisotropy makes everything look similar
    const floor = pool === "max" ? 0.55 : pool === "cls" ? 0.35 : 0.05;
    const raw = 1 - dist(a, b) / MAXD;
    return Math.max(floor, Math.min(1, raw));
  };

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

  const pill = (active) => ({
    ...mono,
    fontSize: "0.72rem",
    padding: "0.3rem 0.7rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: `1px solid ${active ? CYAN : "var(--border, #27272a)"}`,
    background: active ? "var(--surface-2, #1f1f23)" : "transparent",
    color: active ? CYAN : "#a1a1aa",
  });

  // grey ramp for heatmap: higher sim -> lighter grey
  const greyFor = (v) => {
    const g = Math.round(24 + v * 200); // 24..224
    return `rgb(${g},${g},${g})`;
  };
  const textFor = (v) => (v > 0.55 ? "#18181b" : "#d4d4d8");

  // scatter geometry
  const W = 320;
  const H = 260;
  const PAD = 20;
  const sx = (x) => PAD + x * (W - 2 * PAD);
  const sy = (y) => PAD + y * (H - 2 * PAD);

  // topic dot shade (grey ramp — no color coding beyond cyan accent)
  const topicShade = ["#e4e4e7", "#a1a1aa", "#71717a"];

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
          Sentence embeddings and semantic similarity
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          A good sentence embedding places same-meaning sentences close in cosine space. Pooling
          collapses per-token vectors into one — and the choice reshapes the clusters.
        </div>
      </div>

      {/* pooling toggle */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Pooling strategy (per-token vectors into one sentence vector)</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setPool("cls")} style={pill(pool === "cls")}>CLS</button>
          <button onClick={() => setPool("mean")} style={pill(pool === "mean")}>mean</button>
          <button onClick={() => setPool("max")} style={pill(pool === "max")}>max</button>
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.5rem" }}>
          {pool === "mean"
            ? "mean: average every token -> smoothest, cleanest clusters (SBERT's usual winner)"
            : pool === "cls"
            ? "CLS: use only the [CLS] slot -> decent but not a reliable summary for vanilla BERT"
            : "max: elementwise max -> spiky and anisotropic; clusters crowd together (looks all-similar)"}
        </div>
      </div>

      {/* scatter */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>2D similarity space (closer = more similar)</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxWidth: W }}>
            <rect
              x={0.5}
              y={0.5}
              width={W - 1}
              height={H - 1}
              fill="var(--surface-2, #1f1f23)"
              stroke="var(--border, #27272a)"
            />
            {SENTS.map((s, i) => (
              <g key={i}>
                <circle cx={sx(pos[i].x)} cy={sy(pos[i].y)} r={6} fill={topicShade[s.topic]} opacity={0.9} />
                <text
                  x={sx(pos[i].x)}
                  y={sy(pos[i].y) - 10}
                  fill="#a1a1aa"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {s.short}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.3rem" }}>
          Three latent topics: refunds, account access, trains. Good embeddings keep each pair tight.
        </div>
      </div>

      {/* heatmap */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.6rem" }}>Cosine-similarity matrix (lighter = more similar)</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", ...mono, fontSize: "0.62rem" }}>
            <tbody>
              <tr>
                <td style={{ width: 90 }}></td>
                {SENTS.map((s, j) => (
                  <td key={j} style={{ color: "#71717a", padding: "2px 4px", textAlign: "center", writingMode: "vertical-rl", height: 64 }}>
                    {s.short}
                  </td>
                ))}
              </tr>
              {SENTS.map((s, i) => (
                <tr key={i}>
                  <td style={{ color: "#a1a1aa", padding: "2px 6px", textAlign: "right", whiteSpace: "nowrap" }}>
                    {s.short}
                  </td>
                  {SENTS.map((_, j) => {
                    const v = sim(i, j);
                    return (
                      <td
                        key={j}
                        style={{
                          width: 34,
                          height: 26,
                          background: greyFor(v),
                          color: textFor(v),
                          textAlign: "center",
                          border: "1px solid var(--surface, #18181b)",
                        }}
                      >
                        {v.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.5rem" }}>
          {pool === "max"
            ? "Notice the off-diagonal cells stay bright even for unrelated pairs — that is anisotropy: everything looks ~0.6+, so cosine can't discriminate."
            : pool === "cls"
            ? "Off-diagonal similarities are mildly inflated; clusters are visible but less crisp than mean pooling."
            : "Same-topic pairs are bright, cross-topic pairs are dark — cosine cleanly separates meaning. This is what SBERT training buys you."}
        </div>
      </div>

      {/* reading it */}
      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Reading it</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          Vanilla BERT's token vectors were never trained to be cosine-comparable, so naive pooling
          (especially max) is anisotropic — unrelated sentences all score high and the metric is
          useless. SBERT fine-tunes a siamese/triplet bi-encoder so that cosine actually means
          semantic similarity, and mean pooling usually gives the cleanest space. Toggle the
          strategies above and watch the off-diagonal cells brighten or darken.
        </div>
      </div>
    </div>
  );
}
