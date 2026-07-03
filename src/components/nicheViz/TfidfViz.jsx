import { useState } from "react";

// TF-IDF: a tiny corpus of 4 short docs. Compute TF-IDF weights per term,
// highlight the most discriminative terms, and read out cosine similarity
// between a chosen query and every document.
export default function TfidfViz({ onNavigate, spec } = {}) {
  // Toy corpus (already tokenized, lowercased for the demo).
  const DOCS = [
    { id: "d1", title: "Password reset", text: "how to reset your password" },
    { id: "d2", title: "Login help", text: "how to log in to your account" },
    { id: "d3", title: "Billing", text: "how to update your billing and payment" },
    { id: "d4", title: "Password policy", text: "your password must be strong and secret" },
  ];
  const QUERIES = ["reset password", "how to log in", "billing payment"];
  const [qIdx, setQIdx] = useState(0);
  const query = QUERIES[qIdx];

  const N = DOCS.length;

  // ---- styling (GSL monochrome instrument standard) ----
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

  const tok = (s) => s.toLowerCase().split(/\s+/).filter(Boolean);

  // document frequency: how many docs contain each term
  const df = {};
  DOCS.forEach((d) => {
    const seen = new Set(tok(d.text));
    seen.forEach((t) => (df[t] = (df[t] || 0) + 1));
  });
  const idf = (t) => Math.log(N / (df[t] || N)); // natural log; unseen -> 0

  // tf-idf vector for a token list
  const tfidfVec = (tokens) => {
    const tf = {};
    tokens.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
    const vec = {};
    Object.keys(tf).forEach((t) => (vec[t] = tf[t] * idf(t)));
    return vec;
  };

  const l2 = (vec) => Math.sqrt(Object.values(vec).reduce((s, v) => s + v * v, 0));
  const cosine = (a, b) => {
    const na = l2(a);
    const nb = l2(b);
    if (na === 0 || nb === 0) return 0;
    let dot = 0;
    Object.keys(a).forEach((t) => {
      if (b[t] !== undefined) dot += a[t] * b[t];
    });
    return dot / (na * nb);
  };

  const qVec = tfidfVec(tok(query));

  const rows = DOCS.map((d) => {
    const vec = tfidfVec(tok(d.text));
    const sim = cosine(qVec, vec);
    return { d, vec, sim };
  });
  const maxSim = Math.max(...rows.map((r) => r.sim), 1e-9);
  const best = rows.reduce((a, b) => (b.sim > a.sim ? b : a), rows[0]);

  // For the highlighted per-term view: pick the doc with the top match to show weights.
  const showDoc = best.d;
  const showVec = tfidfVec(tok(showDoc.text));
  const maxW = Math.max(...Object.values(showVec), 1e-9);
  // sort terms by weight, descending
  const terms = Object.keys(showVec).sort((a, b) => showVec[b] - showVec[a]);

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
          TF-IDF weighting and cosine similarity
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          tf-idf(t,d) = tf(t,d) × log(N / df(t)). IDF crushes words in every doc
          and lifts rare, discriminative ones. Rank docs by cosine to the query.
        </div>
      </div>

      {/* corpus */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Corpus (N = {N} docs)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {DOCS.map((d) => (
            <div key={d.id} style={{ ...mono, fontSize: "0.76rem", color: "#d4d4d8" }}>
              <span style={{ color: "#71717a" }}>{d.id}</span> &nbsp;{d.text}
            </div>
          ))}
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.6rem" }}>
          Note "how", "to", "your" appear in most docs → high df → idf near 0 →
          near-zero weight. "password", "billing" are rare → high idf.
        </div>
      </div>

      {/* query selector + cosine readout */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Query</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
          {QUERIES.map((q, i) => (
            <button key={q} onClick={() => setQIdx(i)} style={pill(qIdx === i, CYAN)}>
              {q}
            </button>
          ))}
        </div>

        <div style={{ ...label, marginBottom: "0.4rem" }}>
          Cosine similarity to each document
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {rows.map((r) => {
            const isBest = r.d.id === best.d.id && r.sim > 0;
            return (
              <div key={r.d.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    ...mono,
                    fontSize: "0.74rem",
                    marginBottom: "0.2rem",
                    color: isBest ? GREEN : "#a1a1aa",
                  }}
                >
                  <span>
                    {r.d.id} · {r.d.title}
                    {isBest ? "  ← top match" : ""}
                  </span>
                  <span style={{ color: isBest ? GREEN : "#d4d4d8" }}>{r.sim.toFixed(3)}</span>
                </div>
                <div
                  style={{
                    height: 10,
                    borderRadius: 5,
                    background: "var(--surface-2, #1f1f23)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(r.sim / maxSim) * 100}%`,
                      height: "100%",
                      background: isBest ? GREEN : CYAN,
                      opacity: isBest ? 0.7 : 0.45,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* per-term weights of the top matching doc */}
      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          TF-IDF weights inside the top match ({showDoc.id} · {showDoc.title})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {terms.map((t) => {
            const w = showVec[t];
            const discriminative = w >= maxW * 0.6 && w > 0;
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span
                  style={{
                    ...mono,
                    fontSize: "0.74rem",
                    width: 90,
                    color: discriminative ? GREEN : "#a1a1aa",
                    textAlign: "right",
                  }}
                >
                  {t}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 10,
                    borderRadius: 5,
                    background: "var(--surface-2, #1f1f23)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(w / maxW) * 100}%`,
                      height: "100%",
                      background: discriminative ? GREEN : "#a1a1aa",
                      opacity: discriminative ? 0.7 : 0.4,
                    }}
                  />
                </div>
                <span style={{ ...mono, fontSize: "0.7rem", width: 52, color: "#71717a" }}>
                  {w.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.6rem" }}>
          Green = the discriminative terms (high tf-idf) that actually
          characterize this doc. Common terms sit near zero because their idf
          collapses. weight = count × log(N/df).
        </div>
      </div>
    </div>
  );
}
