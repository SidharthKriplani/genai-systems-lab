import { useState } from "react";

// BM25 (lexical/sparse) vs Dense (semantic) vs Hybrid via Reciprocal Rank
// Fusion. Two presets make the trade-off felt:
//   - "rare token / exact ID": an alphanumeric code where lexical match wins and
//     the embedding has never seen the token -> BM25 ranks the right doc first,
//     Dense flails.
//   - "paraphrase": query shares no keywords with the answer -> BM25 misses,
//     Dense (semantic) wins.
// Hybrid-RRF fuses the two rank lists: score = Σ 1/(k + rank), k = 60. It
// recovers the winner in both cases without knowing which method to trust.

const K = 60; // RRF constant

const DOCS = [
  { id: "d1", text: "Reset your password from the account security settings page." },
  { id: "d2", text: "Error code ERR-7734X appears when the auth token has expired." },
  { id: "d3", text: "How to change your login credentials and recover access." },
  { id: "d4", text: "Billing invoices are generated on the first of each month." },
  { id: "d5", text: "The mobile app supports offline mode for saved documents." },
];

// Preset queries. Each carries a hand-authored BM25 rank list and a Dense rank
// list (lower rank = better) so the fusion is deterministic and legible. These
// stand in for a real lexical scorer + embedding cosine; the point is the shape.
const PRESETS = {
  rare: {
    label: "Rare token / exact ID",
    query: "ERR-7734X token expired",
    note: "An exact alphanumeric code. Lexical wins — the embedding never learned this token.",
    // d2 is the answer.
    bm25: { d2: 1, d3: 2, d1: 3, d4: 4, d5: 5 },
    dense: { d1: 1, d3: 2, d5: 3, d2: 4, d4: 5 },
    answer: "d2",
  },
  para: {
    label: "Paraphrase (no shared words)",
    query: "I forgot how to get back into my profile",
    note: "No keyword overlap with the answer. Semantic wins — meaning matches, words don't.",
    // d3 / d1 are the answers; they share no literal tokens with the query.
    bm25: { d5: 1, d4: 2, d2: 3, d1: 4, d3: 5 },
    dense: { d3: 1, d1: 2, d2: 3, d5: 4, d4: 5 },
    answer: "d3",
  },
};

const METHODS = [
  { k: "bm25", t: "BM25", sub: "lexical" },
  { k: "dense", t: "Dense", sub: "semantic" },
  { k: "hybrid", t: "Hybrid-RRF", sub: "fused" },
];

export default function DenseVsSparseViz({ onNavigate, spec } = {}) {
  const [preset, setPreset] = useState("rare");
  const [method, setMethod] = useState("hybrid");
  const p = PRESETS[preset];

  const card = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const label = { fontSize: "0.72rem", color: "var(--ink-low)", letterSpacing: "0.02em" };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

  // RRF fusion over the two rank maps.
  const rrf = {};
  DOCS.forEach((d) => {
    rrf[d.id] = 1 / (K + p.bm25[d.id]) + 1 / (K + p.dense[d.id]);
  });

  // Build the ranking for the active method.
  let ranking;
  if (method === "bm25") ranking = [...DOCS].sort((a, b) => p.bm25[a.id] - p.bm25[b.id]);
  else if (method === "dense") ranking = [...DOCS].sort((a, b) => p.dense[a.id] - p.dense[b.id]);
  else ranking = [...DOCS].sort((a, b) => rrf[b.id] - rrf[a.id]);

  const topId = ranking[0].id;
  const correct = topId === p.answer;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: "var(--ink-hi)" }}>
      {/* preset toggle */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {Object.entries(PRESETS).map(([k, v]) => {
          const active = preset === k;
          return (
            <button
              key={k}
              onClick={() => setPreset(k)}
              style={{
                flex: 1,
                cursor: "pointer",
                textAlign: "left",
                padding: "0.55rem 0.7rem",
                borderRadius: "0.75rem",
                background: active ? "var(--surface-2)" : "var(--surface)",
                border: active ? "1px solid var(--gal-build)" : "1px solid var(--border)",
                color: "var(--ink-hi)",
              }}
            >
              <div style={{ fontSize: "0.86rem", fontWeight: 600 }}>{v.label}</div>
              <div style={{ ...mono, fontSize: "0.66rem", color: active ? "var(--gal-build)" : "var(--ink-low)" }}>
                {k === "rare" ? "BM25 should win" : "Dense should win"}
              </div>
            </button>
          );
        })}
      </div>

      {/* the query */}
      <div style={{ ...card, borderLeft: "3px solid var(--gal-build)" }}>
        <div style={label}>Query</div>
        <div style={{ ...mono, fontSize: "0.9rem", color: "var(--ink-hi)", marginTop: "0.15rem" }}>“{p.query}”</div>
        <div style={{ fontSize: "0.74rem", color: "var(--ink-low)", marginTop: "0.35rem", lineHeight: 1.4 }}>
          {p.note}
        </div>
      </div>

      {/* method toggle */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {METHODS.map((mth) => {
          const active = method === mth.k;
          return (
            <button
              key={mth.k}
              onClick={() => setMethod(mth.k)}
              style={{
                flex: 1,
                cursor: "pointer",
                padding: "0.5rem 0.6rem",
                borderRadius: "0.75rem",
                background: active ? "var(--surface-2)" : "var(--surface)",
                border: active ? "1px solid var(--gal-build)" : "1px solid var(--border)",
                color: "var(--ink-hi)",
              }}
            >
              <div style={{ fontSize: "0.86rem", fontWeight: 600 }}>{mth.t}</div>
              <div style={{ ...mono, fontSize: "0.64rem", color: active ? "var(--gal-build)" : "var(--ink-low)" }}>
                {mth.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* ranking */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={label}>Ranking — {METHODS.find((m) => m.k === method).t}</span>
          <span style={{ ...mono, fontSize: "0.72rem", color: correct ? "#10b981" : "#ef4444" }}>
            top-1 {correct ? "= answer ✓" : "≠ answer ✗"}
          </span>
        </div>
        {ranking.map((d, i) => {
          const isAnswer = d.id === p.answer;
          const rrfScore = rrf[d.id];
          return (
            <div
              key={d.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.4rem 0.5rem",
                borderRadius: "0.5rem",
                background: i === 0 ? "var(--surface)" : "transparent",
                border: isAnswer ? "1px solid #10b981" : "1px solid transparent",
              }}
            >
              <span style={{ ...mono, fontSize: "0.8rem", color: "var(--ink-low)", width: "1.2rem" }}>
                {i + 1}
              </span>
              <span style={{ ...mono, fontSize: "0.74rem", color: "var(--gal-build)", width: "1.6rem" }}>{d.id}</span>
              <span style={{ fontSize: "0.76rem", color: "var(--ink-hi)", flex: 1, lineHeight: 1.3 }}>{d.text}</span>
              {method === "hybrid" && (
                <span style={{ ...mono, fontSize: "0.66rem", color: "var(--ink-low)" }}>{rrfScore.toFixed(4)}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* RRF math panel — only meaningful for hybrid */}
      {method === "hybrid" && (
        <div style={{ ...card }}>
          <div style={{ ...label, marginBottom: "0.4rem" }}>
            How RRF fuses — score = Σ 1/(k + rank), k = {K}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {ranking.map((d) => (
              <div key={d.id} style={{ ...mono, fontSize: "0.68rem", color: "var(--ink-low)" }}>
                <span style={{ color: "var(--gal-build)" }}>{d.id}</span>: 1/({K}+{p.bm25[d.id]}) + 1/({K}+
                {p.dense[d.id]}) ={" "}
                <span style={{ color: "var(--ink-hi)" }}>{rrf[d.id].toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* why line */}
      <div style={{ ...card, borderLeft: "3px solid #10b981", fontSize: "0.82rem", lineHeight: 1.5 }}>
        <strong>Neither method wins everywhere.</strong> BM25 nails exact tokens, IDs, and rare words but is
        blind to paraphrase. Dense embeddings match meaning but drown on out-of-vocab codes. RRF fuses their
        <em> ranks</em> (not raw scores, which live on different scales) — a doc ranked high by either method
        floats up. The constant <span style={mono}>k = {K}</span> damps the top so one method can't dominate
        by a single confident hit.
      </div>
    </div>
  );
}
