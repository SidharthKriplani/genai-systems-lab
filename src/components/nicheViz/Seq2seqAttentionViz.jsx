import { useState } from "react";

// seq2seq attention: an alignment heatmap between source (French) and target
// (English) tokens. A toggle between "no attention" (single bottleneck vector,
// so every target token reads the SAME blurred summary) and "with attention"
// (each target token focuses on the right source token(s)) shows why attention
// removes the fixed-vector bottleneck.
export default function Seq2seqAttentionViz({ onNavigate, spec } = {}) {
  const [attn, setAttn] = useState(true);
  const [selTgt, setSelTgt] = useState(2); // highlighted target row

  const SRC = ["je", "suis", "un", "étudiant"];
  const TGT = ["I", "am", "a", "student"];

  // "true" soft alignment (rows = target, cols = source). Emergent word alignment.
  const ALIGN = [
    [0.82, 0.08, 0.06, 0.04], // I     -> je
    [0.1, 0.78, 0.06, 0.06], // am    -> suis
    [0.08, 0.07, 0.7, 0.15], // a     -> un
    [0.04, 0.06, 0.1, 0.8], // student -> étudiant
  ];

  // In "no attention" mode every target token reads the SAME fixed context
  // vector (the encoder's final state), so the effective weights are uniform-ish
  // and dominated by the last source token (recency of the bottleneck vector).
  const BOTTLENECK = [0.12, 0.15, 0.25, 0.48]; // same row for every target

  const weightsFor = (r) => (attn ? ALIGN[r] : BOTTLENECK);

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

  // heatmap cell: cyan intensity = weight. rgba on a dark base.
  const cell = (w, isRow) => ({
    ...mono,
    fontSize: "0.68rem",
    textAlign: "center",
    padding: "0.5rem 0",
    borderRadius: "0.3rem",
    color: w > 0.5 ? "#0b0b0d" : "#d4d4d8",
    background: `rgba(34, 211, 238, ${(0.12 + w * 0.85).toFixed(3)})`,
    outline: isRow ? `1px solid ${CYAN}` : "1px solid transparent",
  });

  const rowWeights = weightsFor(selTgt);
  const topSrc = SRC[rowWeights.indexOf(Math.max(...rowWeights))];

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
          Attention — a fresh, focused view of the source at every step
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Without attention, every target word reads one blurred summary vector. With
          attention, each target word attends to the source words that matter.
        </div>
      </div>

      {/* toggle */}
      <div style={card}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.9rem" }}>
          <button onClick={() => setAttn(false)} style={pill(!attn, "#a1a1aa")}>
            no attention (one bottleneck vector)
          </button>
          <button onClick={() => setAttn(true)} style={pill(attn, CYAN)}>
            with attention
          </button>
        </div>

        {/* heatmap */}
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          Alignment weights — rows = target (English), columns = source (French)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `70px repeat(${SRC.length}, 1fr)`, gap: "3px" }}>
          {/* header row */}
          <div />
          {SRC.map((s) => (
            <div key={s} style={{ ...mono, fontSize: "0.68rem", color: "#a1a1aa", textAlign: "center" }}>
              {s}
            </div>
          ))}
          {/* body rows */}
          {TGT.map((t, r) => (
            <div key={t} style={{ display: "contents" }}>
              <button
                onClick={() => setSelTgt(r)}
                style={{
                  ...mono,
                  fontSize: "0.7rem",
                  textAlign: "right",
                  paddingRight: "0.4rem",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  color: r === selTgt ? CYAN : "#a1a1aa",
                  fontWeight: r === selTgt ? 600 : 400,
                }}
              >
                {t}
              </button>
              {weightsFor(r).map((w, ci) => (
                <div key={ci} style={cell(w, r === selTgt)}>
                  {w.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.55rem" }}>
          {attn
            ? "Each row is a different weighting — the diagonal lights up: 'student' → 'étudiant'. This is soft word alignment, learned, never labeled."
            : "Every row is IDENTICAL — the decoder only ever sees the one fixed summary vector, dominated by the last source word. The whole source is squeezed through one pipe: the bottleneck."}
        </div>
      </div>

      {/* focused readout for the selected target token */}
      <div style={{ ...card, borderLeft: `2px solid ${attn ? CYAN : "#71717a"}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>
          Producing target word: <span style={{ color: attn ? CYAN : "#a1a1aa" }}>{TGT[selTgt]}</span>
        </div>
        {/* per-source weight bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.4rem" }}>
          {SRC.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ ...mono, fontSize: "0.68rem", color: "#a1a1aa", width: 56, textAlign: "right" }}>
                {s}
              </span>
              <div style={{ flex: 1, background: "var(--surface-2, #1f1f23)", borderRadius: "3px", height: 12 }}>
                <div
                  style={{
                    width: `${rowWeights[i] * 100}%`,
                    height: "100%",
                    background: attn ? CYAN : "#71717a",
                    opacity: 0.6,
                    borderRadius: "3px",
                  }}
                />
              </div>
              <span style={{ ...mono, fontSize: "0.66rem", color: "#d4d4d8", width: 34 }}>
                {rowWeights[i].toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div style={{ ...mono, fontSize: "0.72rem", color: "#d4d4d8", marginTop: "0.7rem" }}>
          context vector = Σ weightᵢ · encoderStateᵢ{" "}
          {attn ? (
            <>
              → mostly <span style={{ color: GREEN }}>{topSrc}</span>. A focused read.
            </>
          ) : (
            <span style={{ color: "#a1a1aa" }}>→ the SAME blurred summary regardless of which word we emit.</span>
          )}
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.5rem" }}>
          This "relevance weights, then weighted sum" is the exact operation self-attention
          generalized — drop the recurrence, let every position attend to every other.
        </div>
      </div>
    </div>
  );
}
