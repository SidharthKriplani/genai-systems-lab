import { useState } from "react";

// Multi-hop retrieval: why a single blurry query vector fails a 2-hop question,
// and why decompose -> retrieve -> reason -> retrieve compounds per-hop accuracy.
export default function MultiHopRetrievalViz({ onNavigate, spec } = {}) {
  const [decompose, setDecompose] = useState(false);
  const [hops, setHops] = useState(2);
  const [perHop, setPerHop] = useState(90); // per-hop retrieval accuracy, %

  const p = perHop / 100;
  const compounded = Math.pow(p, hops); // end-to-end accuracy if every hop must land

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

  // Worked 2-hop example.
  const HOP1 = {
    q: "which film did Denzel Washington win an Oscar for?",
    a: "Training Day (2001)",
  };
  const HOP2 = {
    q: "who directed Training Day?",
    a: "Antoine Fuqua",
  };

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

  const hopChain = (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {/* Hop 1 */}
      <div style={{ ...card, background: "var(--surface-2, #1f1f23)", padding: "0.75rem" }}>
        <div style={{ ...mono, fontSize: "0.66rem", color: CYAN, marginBottom: "0.25rem" }}>
          hop 1 · retrieve
        </div>
        <div style={{ fontSize: "0.82rem", color: "#e4e4e7" }}>{HOP1.q}</div>
        <div style={{ ...mono, fontSize: "0.78rem", color: GREEN, marginTop: "0.3rem" }}>
          -&gt; {HOP1.a}
        </div>
      </div>
      <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", paddingLeft: "0.2rem" }}>
        substitute the answer into the next question
      </div>
      {/* Hop 2 */}
      <div style={{ ...card, background: "var(--surface-2, #1f1f23)", padding: "0.75rem" }}>
        <div style={{ ...mono, fontSize: "0.66rem", color: CYAN, marginBottom: "0.25rem" }}>
          hop 2 · retrieve
        </div>
        <div style={{ fontSize: "0.82rem", color: "#e4e4e7" }}>{HOP2.q}</div>
        <div style={{ ...mono, fontSize: "0.78rem", color: GREEN, marginTop: "0.3rem" }}>
          -&gt; {HOP2.a}
        </div>
      </div>
    </div>
  );

  const singleShot = (
    <div style={{ ...card, background: "var(--surface-2, #1f1f23)", padding: "0.75rem" }}>
      <div style={{ ...mono, fontSize: "0.66rem", color: RED, marginBottom: "0.25rem" }}>
        single-shot · one query vector
      </div>
      <div style={{ fontSize: "0.82rem", color: "#e4e4e7" }}>
        "who directed the film Denzel Washington won an Oscar for?"
      </div>
      <div style={{ ...mono, fontSize: "0.74rem", color: "#a1a1aa", marginTop: "0.35rem" }}>
        the embedding blends "Denzel Washington", "Oscar", "director" into one
        blurry vector. it retrieves passages about the actor, not the director of
        a specific film it never resolved.
      </div>
      <div style={{ ...mono, fontSize: "0.78rem", color: RED, marginTop: "0.4rem" }}>
        -&gt; wrong / unsupported answer
      </div>
    </div>
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
          Multi-hop retrieval
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          A 2-hop question needs two dependent lookups. One blurry query vector
          cannot resolve both at once.
        </div>
      </div>

      {/* strategy toggle */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Retrieval strategy</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setDecompose(false)} style={pill(!decompose, RED)}>
            single-shot
          </button>
          <button onClick={() => setDecompose(true)} style={pill(decompose, CYAN)}>
            decompose -&gt; retrieve -&gt; reason -&gt; retrieve
          </button>
        </div>
        <div style={{ marginTop: "0.8rem" }}>{decompose ? hopChain : singleShot}</div>
      </div>

      {/* compounding accuracy */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.5rem",
          }}
        >
          <span style={label}>Number of hops</span>
          <span style={{ ...mono, color: CYAN, fontSize: "1.1rem" }}>{hops}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={hops}
          onChange={(e) => setHops(Number(e.target.value))}
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
          <span>1</span>
          <span>3</span>
          <span>5</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            margin: "0.9rem 0 0.5rem",
          }}
        >
          <span style={label}>Per-hop retrieval accuracy</span>
          <span style={{ ...mono, color: "#fafafa", fontSize: "1.05rem" }}>{perHop}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={99}
          step={1}
          value={perHop}
          onChange={(e) => setPerHop(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />

        <div style={{ ...mono, fontSize: "0.74rem", color: "#a1a1aa", marginTop: "0.7rem" }}>
          {(p).toFixed(2)}
          {Array.from({ length: hops - 1 }, (_, i) => (
            <span key={i}> × {(p).toFixed(2)}</span>
          ))}{" "}
          = {(p).toFixed(2)}
          <sup>{hops}</sup> ={" "}
          <span style={{ color: compounded >= 0.7 ? GREEN : RED, fontWeight: 600 }}>
            {(compounded * 100).toFixed(0)}%
          </span>
        </div>

        {/* per-hop bars */}
        <div style={{ marginTop: "0.8rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {Array.from({ length: hops }, (_, i) => {
            const acc = Math.pow(p, i + 1);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ ...mono, fontSize: "0.66rem", color: "#71717a", width: 52 }}>
                  hop {i + 1}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 16,
                    background: "var(--surface-2, #1f1f23)",
                    borderRadius: "0.3rem",
                    overflow: "hidden",
                    border: "1px solid var(--border, #27272a)",
                  }}
                >
                  <div
                    style={{
                      width: `${acc * 100}%`,
                      height: "100%",
                      background: acc >= 0.7 ? GREEN : "#71717a",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
                <span style={{ ...mono, fontSize: "0.68rem", color: "#a1a1aa", width: 42, textAlign: "right" }}>
                  {(acc * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Why it compounds</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          Each hop must retrieve the right passage for the whole chain to hold, so
          accuracies multiply. At {perHop}% per hop, a {hops}-hop question lands
          only {(compounded * 100).toFixed(0)}% of the time. Decomposing lets each
          hop use a sharp, resolved query instead of one averaged vector — that is
          how you keep per-hop accuracy high in the first place.
        </div>
      </div>
    </div>
  );
}
