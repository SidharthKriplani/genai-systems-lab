import { useState } from "react";

// A small code sample the learner splits at a cursor. The "middle" is the span
// the model must generate; the classic editor-autocomplete case is that there's
// real code on BOTH sides of the cursor.
const CODE = `def total(cart):
    subtotal = 0
    for item in cart:
        subtotal += item.price
    return round(subtotal, 2)`;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function FIMTransformViz({ onNavigate, spec } = {}) {
  const len = CODE.length;
  // Two split points define the middle span [midStart, midEnd).
  const [midStart, setMidStart] = useState(Math.round(len * 0.42));
  const [midEnd, setMidEnd] = useState(Math.round(len * 0.62));
  const [mode, setMode] = useState("fim"); // "l2r" | "fim"

  const a = clamp(Math.min(midStart, midEnd), 0, len);
  const b = clamp(Math.max(midStart, midEnd), 0, len);

  const prefix = CODE.slice(0, a);
  const middle = CODE.slice(a, b);
  const suffix = CODE.slice(b);

  const isFim = mode === "fim";

  const card = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const label = { fontSize: "0.72rem", color: "var(--ink-low)", letterSpacing: "0.02em" };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
  const sentinel = {
    ...mono,
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "0.05rem 0.3rem",
    borderRadius: "0.3rem",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--gal-build)",
  };

  // Colors: prefix + suffix are the visible context (emerald = model can see),
  // middle is the target (cyan signature accent). In L2R mode, suffix is red-
  // dimmed to show it is invisible to a plain left-to-right model.
  const CTX = "#10b981";
  const TGT = "var(--gal-build)";
  const HIDDEN = "#ef4444";

  const span = (text, color, dim) => (
    <span style={{ color, opacity: dim ? 0.35 : 1, whiteSpace: "pre-wrap" }}>{text}</span>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: "var(--ink-hi)" }}>
      {/* split controls */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={label}>Middle starts at (cursor / edit point)</span>
            <span style={{ ...mono, color: "var(--gal-build)" }}>char {a}</span>
          </div>
          <input
            type="range"
            min={0}
            max={len}
            value={midStart}
            onChange={(e) => setMidStart(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gal-build)" }}
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={label}>Middle ends at</span>
            <span style={{ ...mono, color: "var(--gal-build)" }}>char {b}</span>
          </div>
          <input
            type="range"
            min={0}
            max={len}
            value={midEnd}
            onChange={(e) => setMidEnd(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gal-build)" }}
          />
        </div>
      </div>

      {/* mode toggle */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[
          { k: "l2r", t: "Left-to-right only", sub: "can't see code below cursor" },
          { k: "fim", t: "FIM", sub: "sees both sides" },
        ].map((m) => {
          const active = mode === m.k;
          return (
            <button
              key={m.k}
              onClick={() => setMode(m.k)}
              style={{
                flex: 1,
                cursor: "pointer",
                textAlign: "left",
                padding: "0.6rem 0.75rem",
                borderRadius: "0.75rem",
                background: active ? "var(--surface-2)" : "var(--surface)",
                border: active
                  ? `1px solid ${m.k === "fim" ? "var(--gal-build)" : HIDDEN}`
                  : "1px solid var(--border)",
                color: "var(--ink-hi)",
              }}
            >
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{m.t}</div>
              <div style={{ ...mono, fontSize: "0.66rem", color: active ? (m.k === "fim" ? "var(--gal-build)" : HIDDEN) : "var(--ink-low)" }}>
                {m.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* the document, split in place */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.4rem" }}>Original document — split at the cursor</div>
        <pre style={{ ...mono, fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>
          {span(prefix, CTX)}
          <span style={{ background: "var(--gal-build-tint-md, rgba(34,211,238,0.12))", borderRadius: "0.2rem" }}>
            {span(middle || "·", TGT)}
          </span>
          {span(suffix, isFim ? CTX : HIDDEN, !isFim)}
        </pre>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.6rem", ...mono, fontSize: "0.66rem" }}>
          <span style={{ color: CTX }}>● prefix / suffix = context</span>
          <span style={{ color: TGT }}>● middle = predict this</span>
          {!isFim && <span style={{ color: HIDDEN }}>● suffix hidden from L2R model</span>}
        </div>
      </div>

      {/* reassembly into PSM training order */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          {isFim ? "Reordered into PSM training sequence" : "Plain left-to-right sequence"}
        </div>
        {isFim ? (
          <pre style={{ ...mono, fontSize: "0.78rem", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            <span style={sentinel}>{"<PRE>"}</span> {span(prefix || "·", CTX)}{"\n"}
            <span style={sentinel}>{"<SUF>"}</span> {span(suffix || "·", CTX)}{"\n"}
            <span style={sentinel}>{"<MID>"}</span> {span(middle || "·", TGT)}{" "}
            <span style={{ ...mono, fontSize: "0.66rem", color: "var(--ink-low)" }}>← generated here, conditioned on BOTH sides</span>
          </pre>
        ) : (
          <pre style={{ ...mono, fontSize: "0.78rem", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {span(prefix || "·", CTX)}
            <span style={{ background: "rgba(239,68,68,0.12)", borderRadius: "0.2rem" }}>{span(middle || "·", TGT)}</span>
            {span(" ▮", TGT)}
            {"\n"}
            <span style={{ ...mono, fontSize: "0.66rem", color: HIDDEN }}>
              the model predicts left-to-right from the prefix only — the suffix below the cursor never enters context, so it fills blind
            </span>
          </pre>
        )}
      </div>

      {/* why line */}
      <div
        style={{
          ...card,
          borderLeft: `3px solid ${isFim ? "var(--gal-build)" : HIDDEN}`,
          fontSize: "0.82rem",
          lineHeight: 1.5,
        }}
      >
        {isFim ? (
          <>
            <strong>FIM works.</strong> By rewriting the document as{" "}
            <span style={mono}>{"<PRE> prefix <SUF> suffix <MID> middle"}</span>, the target
            (middle) sits at the END of the sequence — so a normal next-token model, generating the
            middle, has already read BOTH the prefix and the suffix. That two-sided conditioning is
            exactly what editor autocomplete needs.
          </>
        ) : (
          <>
            <strong>Plain LMs fail at infilling.</strong> A left-to-right model only conditions on
            what precedes the cursor. The code below the cursor — the suffix — never enters its
            context, so it can't know the middle has to connect to it. It completes blind. FIM fixes
            this purely by reordering the training data.
          </>
        )}
      </div>
    </div>
  );
}
