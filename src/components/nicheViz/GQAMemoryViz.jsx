import { useState } from "react";

// Grouped / Multi-Query Attention KV-cache visualizer.
// Slide KV heads from MHA (= query heads) down through GQA groups to MQA (= 1)
// and watch the KV cache shrink. Llama-2-70B defaults.
export default function GQAMemoryViz({ onNavigate, spec }) {
  // Llama-2-70B realistic defaults.
  const QUERY_HEADS = 64;
  const HEAD_DIM = 128;
  const LAYERS = 80;
  const DTYPE_BYTES = 2; // fp16 / bf16
  const SEQ_LEN = 4096;
  const BATCH = 1;

  // KV heads must divide the query-head count so groups are even.
  const DIVISORS = [1, 2, 4, 8, 16, 32, 64];
  const [kvIdx, setKvIdx] = useState(DIVISORS.indexOf(8)); // GQA-8 sweet spot
  const kvHeads = DIVISORS[kvIdx];

  // KV cache bytes = 2 (K and V) · layers · kv_heads · head_dim · seq_len · batch · dtype_bytes
  const kvBytes = (h) =>
    2 * LAYERS * h * HEAD_DIM * SEQ_LEN * BATCH * DTYPE_BYTES;

  const bytesNow = kvBytes(kvHeads);
  const bytesMHA = kvBytes(QUERY_HEADS);
  const savings = bytesMHA / bytesNow; // e.g. 64/8 = 8x
  const groupSize = QUERY_HEADS / kvHeads; // query heads per KV head

  const fmtGB = (b) => (b / 1024 ** 3).toFixed(2);
  const fmtMB = (b) => Math.round(b / 1024 ** 2);

  const mode =
    kvHeads === QUERY_HEADS ? "MHA" : kvHeads === 1 ? "MQA" : "GQA";
  const modeLabel =
    mode === "MHA"
      ? "multi-head attention"
      : mode === "MQA"
      ? "multi-query attention"
      : `grouped-query attention (GQA-${kvHeads})`;

  const tradeoff =
    mode === "MHA"
      ? "full quality, largest cache — every query head owns a private K/V."
      : mode === "MQA"
      ? "smallest cache, but all query heads share one K/V — measurable quality drop."
      : kvHeads === 8
      ? "the sweet spot Llama-2/3-70B ship: near-MHA quality at a fraction of the cache."
      : "fewer KV heads means a smaller cache and a slight, usually acceptable, quality drop.";

  // ---- styling helpers (GSL monochrome instrument standard) ----
  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  };
  const label = {
    fontSize: "0.7rem",
    textTransform: "none",
    color: "#a1a1aa",
    letterSpacing: "0.02em",
  };
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";

  // Build the grouped visualization: kvHeads columns, each holding groupSize query boxes.
  const groups = Array.from({ length: kvHeads }, (_, g) => g);

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
        <div
          style={{
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "#fafafa",
          }}
        >
          Grouped-query attention and the KV cache
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Slide the KV-head count from MHA down to MQA and watch the cache
          shrink. Query heads = {QUERY_HEADS} (Llama-2-70B).
        </div>
      </div>

      {/* control */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.5rem",
          }}
        >
          <span style={label}>KV heads</span>
          <span style={{ ...mono, color: CYAN, fontSize: "1.1rem" }}>
            {kvHeads}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={DIVISORS.length - 1}
          step={1}
          value={kvIdx}
          onChange={(e) => setKvIdx(Number(e.target.value))}
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
          <span>1 (MQA)</span>
          <span>8 (GQA)</span>
          <span>64 (MHA)</span>
        </div>
        <div
          style={{
            marginTop: "0.6rem",
            ...mono,
            fontSize: "0.78rem",
            color: mode === "MHA" ? "#e4e4e7" : CYAN,
          }}
        >
          {modeLabel}
          {mode === "GQA" && (
            <span style={{ color: "#a1a1aa" }}>
              {" "}
              — {groupSize} query heads share each KV head
            </span>
          )}
        </div>
      </div>

      {/* grouped boxes visualization */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.6rem" }}>
          {QUERY_HEADS} query heads sharing {kvHeads} KV head
          {kvHeads === 1 ? "" : "s"}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
          }}
        >
          {groups.map((g) => (
            <div
              key={g}
              style={{
                border: `1px solid ${CYAN}`,
                borderRadius: "0.4rem",
                padding: "0.3rem",
                display: "flex",
                gap: "2px",
                background: "var(--surface-2, #1f1f23)",
              }}
              title={`KV head ${g + 1} · ${groupSize} query heads`}
            >
              {Array.from({ length: groupSize }, (_, q) => (
                <div
                  key={q}
                  style={{
                    width: Math.max(3, Math.min(8, Math.floor(180 / groupSize))),
                    height: 12,
                    background: "#52525b",
                    borderRadius: "1px",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div
          style={{
            ...mono,
            fontSize: "0.68rem",
            color: "#71717a",
            marginTop: "0.5rem",
          }}
        >
          <span style={{ color: CYAN }}>▢</span> = one KV head (K/V pair stored
          in cache) &nbsp;·&nbsp;
          <span style={{ color: "#a1a1aa" }}>▪</span> = one query head (no cache
          of its own)
        </div>
      </div>

      {/* formula + computed size */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.4rem" }}>
          KV cache = 2 · layers · kv_heads · head_dim · seq_len · batch ·
          dtype_bytes
        </div>
        <div
          style={{
            ...mono,
            fontSize: "0.72rem",
            color: "#a1a1aa",
            marginBottom: "0.6rem",
            wordBreak: "break-word",
          }}
        >
          2 · {LAYERS} · <span style={{ color: CYAN }}>{kvHeads}</span> ·{" "}
          {HEAD_DIM} · {SEQ_LEN} · {BATCH} · {DTYPE_BYTES}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.75rem",
          }}
        >
          <Stat
            mono={mono}
            label="KV cache now"
            value={`${fmtGB(bytesNow)} GB`}
            sub={`${fmtMB(bytesNow)} MB`}
            color="#fafafa"
          />
          <Stat
            mono={mono}
            label="MHA baseline"
            value={`${fmtGB(bytesMHA)} GB`}
            sub={`${kvHeads === QUERY_HEADS ? "current" : "64 KV heads"}`}
            color="#a1a1aa"
          />
          <Stat
            mono={mono}
            label="Savings vs MHA"
            value={`${savings % 1 === 0 ? savings : savings.toFixed(1)}×`}
            sub={savings > 1 ? "smaller" : "same"}
            color={savings > 1 ? GREEN : "#a1a1aa"}
          />
        </div>
      </div>

      {/* savings bar */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          Cache size relative to MHA
        </div>
        <div
          style={{
            height: 22,
            background: "var(--surface-2, #1f1f23)",
            borderRadius: "0.4rem",
            overflow: "hidden",
            border: "1px solid var(--border, #27272a)",
          }}
        >
          <div
            style={{
              width: `${(bytesNow / bytesMHA) * 100}%`,
              height: "100%",
              background: savings > 1 ? GREEN : "#71717a",
              transition: "width 0.2s ease",
            }}
          />
        </div>
        <div
          style={{
            ...mono,
            fontSize: "0.7rem",
            color: "#a1a1aa",
            marginTop: "0.35rem",
          }}
        >
          {Math.round((bytesNow / bytesMHA) * 100)}% of the MHA cache
        </div>
      </div>

      {/* tradeoff note */}
      <div
        style={{
          ...card,
          borderLeft: `2px solid ${mode === "MHA" ? "#71717a" : CYAN}`,
        }}
      >
        <div style={{ ...label, marginBottom: "0.3rem" }}>Quality tradeoff</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>{tradeoff}</div>
      </div>
    </div>
  );
}

function Stat({ mono, label, value, sub, color }) {
  return (
    <div>
      <div style={{ fontSize: "0.68rem", color: "#71717a" }}>{label}</div>
      <div style={{ ...mono, fontSize: "1.05rem", color }}>{value}</div>
      <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a" }}>{sub}</div>
    </div>
  );
}
