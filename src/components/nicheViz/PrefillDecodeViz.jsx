import { useState } from "react";

// Rate constants (illustrative, order-of-magnitude realistic assuming a ~13B
// model on a single A100-class GPU — the same hardware/model assumption used
// in this module's own worked example). Prefill is compute-bound: it chews
// through all prompt tokens in one parallel pass, so cost grows with total
// prompt tokens but amortizes well. Decode is memory-bandwidth-bound: every
// single generated token must re-stream almost the entire ~26GB weight matrix
// from HBM just to produce that one token — weight-streaming is the PRIMARY
// cost. Re-reading the (much smaller, but still real) KV cache from HBM on
// every step adds to that same memory-bandwidth bill as a secondary,
// additional contributor. So cost is essentially fixed per step and serial.
const PREFILL_TOKENS_PER_MS = 8; // parallel throughput, tokens/ms
const DECODE_MS_PER_TOKEN = 22; // per-step latency, ms/token (serial)

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function PrefillDecodeViz({ onNavigate, spec } = {}) {
  const [promptLen, setPromptLen] = useState(512);
  const [genTokens, setGenTokens] = useState(128);
  const [phase, setPhase] = useState("prefill"); // "prefill" | "decode"

  // Prefill: one wide parallel pass over all prompt tokens -> sets TTFT.
  const ttftMs = Math.round(promptLen / PREFILL_TOKENS_PER_MS);
  // Decode: genTokens serial steps, each a full weight-stream from HBM (plus a KV-cache read) -> TPOT.
  const tpotMs = DECODE_MS_PER_TOKEN;
  const decodeMs = Math.round(genTokens * tpotMs);
  const totalMs = ttftMs + decodeMs;

  const isPrefill = phase === "prefill";

  // Bar widths as % of the largest of the two totals, so the asymmetry shows.
  const maxMs = Math.max(ttftMs, decodeMs, 1);
  const prefillPct = clamp((ttftMs / maxMs) * 100, 2, 100);
  const decodePct = clamp((decodeMs / maxMs) * 100, 2, 100);

  // A small, capped set of decode step ticks so the "one at a time" serial
  // nature is visible without rendering hundreds of elements.
  const stepCount = clamp(genTokens, 1, 40);
  const steps = Array.from({ length: stepCount });

  const card = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const label = { fontSize: "0.72rem", color: "var(--ink-low)", letterSpacing: "0.02em" };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
  const numBig = { ...mono, fontSize: "1.35rem", fontWeight: 700, color: "var(--ink-hi)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: "var(--ink-hi)" }}>
      {/* controls */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={label}>Prompt length (tokens processed at prefill)</span>
            <span style={{ ...mono, color: "var(--gal-build)" }}>{promptLen}</span>
          </div>
          <input
            type="range"
            min={64}
            max={4096}
            step={64}
            value={promptLen}
            onChange={(e) => setPromptLen(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gal-build)" }}
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={label}>Tokens to generate (decode steps)</span>
            <span style={{ ...mono, color: "var(--gal-build)" }}>{genTokens}</span>
          </div>
          <input
            type="range"
            min={8}
            max={1024}
            step={8}
            value={genTokens}
            onChange={(e) => setGenTokens(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gal-build)" }}
          />
        </div>
        <div style={{ ...mono, fontSize: "0.62rem", color: "var(--ink-low)" }}>
          Illustrative rates — assumes a ~13B model on a single A100-class GPU (same hardware/model assumption as this module's own worked example).
        </div>
      </div>

      {/* phase toggle */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[
          { k: "prefill", t: "Prefill", sub: "compute-bound" },
          { k: "decode", t: "Decode", sub: "memory-bound" },
        ].map((p) => {
          const active = phase === p.k;
          return (
            <button
              key={p.k}
              onClick={() => setPhase(p.k)}
              style={{
                flex: 1,
                cursor: "pointer",
                textAlign: "left",
                padding: "0.6rem 0.75rem",
                borderRadius: "0.75rem",
                background: active ? "var(--surface-2)" : "var(--surface)",
                border: active ? "1px solid var(--gal-build)" : "1px solid var(--border)",
                color: "var(--ink-hi)",
              }}
            >
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{p.t}</div>
              <div style={{ ...mono, fontSize: "0.68rem", color: active ? "var(--gal-build)" : "var(--ink-low)" }}>
                {p.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* the asymmetry visual */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* Prefill: one wide bar */}
        <div style={{ opacity: isPrefill ? 1 : 0.4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={label}>Prefill — {promptLen} tokens in ONE parallel pass</span>
            <span style={{ ...mono, fontSize: "0.72rem", color: "var(--ink-low)" }}>{ttftMs} ms</span>
          </div>
          <div style={{ height: "1.4rem", background: "var(--surface)", borderRadius: "0.4rem", overflow: "hidden" }}>
            <div
              style={{
                width: `${prefillPct}%`,
                height: "100%",
                background: isPrefill ? "var(--gal-build)" : "var(--border)",
                borderRadius: "0.4rem",
                transition: "width 0.2s",
              }}
            />
          </div>
        </div>

        {/* Decode: N serial ticks */}
        <div style={{ opacity: isPrefill ? 0.4 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={label}>Decode — {genTokens} steps, one token at a time</span>
            <span style={{ ...mono, fontSize: "0.72rem", color: "var(--ink-low)" }}>{decodeMs} ms</span>
          </div>
          <div style={{ height: "1.4rem", background: "var(--surface)", borderRadius: "0.4rem", overflow: "hidden", display: "flex", gap: "2px", padding: "2px", alignItems: "stretch" }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: isPrefill ? "var(--border)" : "#10b981",
                  borderRadius: "1px",
                  minWidth: "2px",
                }}
              />
            ))}
          </div>
          {genTokens > stepCount && (
            <div style={{ ...mono, fontSize: "0.62rem", color: "var(--ink-low)", marginTop: "0.2rem" }}>
              showing {stepCount} of {genTokens} steps — each one re-streams the model's weights from HBM, plus a KV-cache read
            </div>
          )}
        </div>
      </div>

      {/* readouts */}
      <div className="gsl-viz-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
        <div style={card}>
          <div style={label}>TTFT (prefill)</div>
          <div style={numBig}>{ttftMs}<span style={{ fontSize: "0.8rem", color: "var(--ink-low)" }}> ms</span></div>
        </div>
        <div style={card}>
          <div style={label}>TPOT (per token)</div>
          <div style={numBig}>{tpotMs}<span style={{ fontSize: "0.8rem", color: "var(--ink-low)" }}> ms</span></div>
        </div>
        <div style={card}>
          <div style={label}>Total latency</div>
          <div style={numBig}>{totalMs}<span style={{ fontSize: "0.8rem", color: "var(--ink-low)" }}> ms</span></div>
        </div>
      </div>

      {/* why line */}
      <div
        style={{
          ...card,
          borderLeft: `3px solid ${isPrefill ? "var(--gal-build)" : "#10b981"}`,
          fontSize: "0.82rem",
          lineHeight: 1.5,
          color: "var(--ink-hi)",
        }}
      >
        {isPrefill ? (
          <>
            <strong>Compute-bound.</strong> Prefill runs all {promptLen} prompt tokens through the
            network in a single parallel forward pass — the GPU's math units saturate, so throughput
            (tokens/ms) is the limit. This one pass sets <span style={mono}>TTFT</span>: how long
            until the first token appears.
          </>
        ) : (
          <>
            <strong>Memory-bandwidth-bound.</strong> Decode emits one token per step, and every step
            must re-stream almost the entire model's weights from HBM just to compute that one
            token — weight-streaming is the primary cost. Re-reading the (much smaller) KV cache
            adds to that same memory-bandwidth bill as a secondary contributor. The math itself is
            tiny; moving bytes is the limit — so per-token latency (<span style={mono}>TPOT ≈ {tpotMs} ms</span>)
            barely changes with batch, and {genTokens} tokens cost {genTokens} serial trips.
          </>
        )}
      </div>
    </div>
  );
}
