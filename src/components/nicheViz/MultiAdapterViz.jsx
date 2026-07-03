import { useState } from "react";

const BASE_GB = 14;

const ADAPTERS = [
  { id: "support", label: "support", mb: 40, desc: "tuned on 60k resolved tickets" },
  { id: "code", label: "code", mb: 60, desc: "tuned on internal repos + reviews" },
  { id: "legal", label: "legal", mb: 45, desc: "tuned on contract clause pairs" },
  { id: "medical", label: "medical", mb: 55, desc: "tuned on clinical note summaries" },
];

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

export default function MultiAdapterViz({ onNavigate, spec } = {}) {
  const [loaded, setLoaded] = useState(["support"]);

  const toggle = (id) =>
    setLoaded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const adapterMb = loaded.reduce(
    (s, id) => s + (ADAPTERS.find((a) => a.id === id)?.mb || 0),
    0
  );
  const n = Math.max(loaded.length, 1);

  // Swap-adapters cost: one base + all loaded adapters
  const swapGb = BASE_GB + adapterMb / 1024;
  // Full fine-tune cost: N independent 14 GB copies
  const fullGb = n * BASE_GB;

  const saved = fullGb > 0 ? Math.round((1 - swapGb / fullGb) * 100) : 0;

  const card = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
  };

  return (
    <div
      style={{
        color: "var(--zinc-200, #e4e4e7)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontSize: 14,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>
          One frozen base, many swappable adapters
        </div>
        <div style={{ color: "var(--zinc-400, #a1a1aa)", marginTop: 4 }}>
          The base weights never move. Each task is a small LoRA adapter you snap
          on and off. Serving four specialists costs one big model, not four.
        </div>
      </div>

      {/* Adapter shelf */}
      <div style={{ ...card, padding: 14 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "var(--zinc-400, #a1a1aa)",
            marginBottom: 10,
          }}
        >
          Adapter shelf — load / swap
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ADAPTERS.map((a) => {
            const on = loaded.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggle(a.id)}
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: on
                    ? "1px solid var(--gal-build)"
                    : "1px solid var(--border)",
                  background: on ? "var(--gal-build-tint)" : "var(--surface)",
                  color: on ? "var(--gal-build)" : "var(--zinc-400, #a1a1aa)",
                  minWidth: 150,
                }}
              >
                <div style={{ ...mono, fontWeight: 600, fontSize: 13 }}>
                  {on ? "●" : "○"} {a.label}
                </div>
                <div style={{ fontSize: 11, marginTop: 2, opacity: 0.85 }}>
                  {a.desc}
                </div>
                <div style={{ ...mono, fontSize: 11, marginTop: 4 }}>
                  +{a.mb} MB
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: "var(--zinc-400, #a1a1aa)", marginTop: 10 }}>
          {loaded.length === 0
            ? "No adapters loaded — the base answers generically."
            : `${loaded.length} adapter${loaded.length > 1 ? "s" : ""} live on one shared base.`}
        </div>
      </div>

      {/* Memory comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <MemoryColumn
          title="Swap adapters on one base"
          good
          rows={[
            { label: `base (frozen)`, gb: BASE_GB, kind: "base" },
            ...loaded.map((id) => {
              const a = ADAPTERS.find((x) => x.id === id);
              return { label: a.label, gb: a.mb / 1024, kind: "adapter" };
            }),
          ]}
          total={swapGb}
          maxGb={Math.max(fullGb, swapGb, BASE_GB)}
        />
        <MemoryColumn
          title={`${n} full fine-tune${n > 1 ? "s" : ""}`}
          good={false}
          rows={loaded.length === 0
            ? [{ label: "base copy", gb: BASE_GB, kind: "full" }]
            : loaded.map((id) => ({
                label: `${ADAPTERS.find((x) => x.id === id).label} copy`,
                gb: BASE_GB,
                kind: "full",
              }))}
          total={fullGb}
          maxGb={Math.max(fullGb, swapGb, BASE_GB)}
        />
      </div>

      {/* Verdict */}
      <div
        style={{
          ...card,
          padding: 14,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 13, color: "var(--zinc-400, #a1a1aa)" }}>
          Serving {n} specialist{n > 1 ? "s" : ""}, swapping wins by
        </div>
        <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: "var(--green, #34d399)" }}>
          {saved}% less memory
        </div>
      </div>
      <div style={{ ...mono, fontSize: 12, color: "var(--zinc-400, #a1a1aa)" }}>
        swap: {swapGb.toFixed(2)} GB · full fine-tunes: {fullGb.toFixed(0)} GB ·
        adapters are ~{Math.round((adapterMb / 1024 / Math.max(swapGb, 0.01)) * 100)}% of the loaded footprint
      </div>
    </div>
  );
}

function MemoryColumn({ title, good, rows, total, maxGb }) {
  const accent = good ? "var(--green, #34d399)" : "var(--red, #f87171)";
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r, i) => {
          const pct = Math.max((r.gb / Math.max(maxGb, 0.01)) * 100, 1.5);
          const barColor =
            r.kind === "adapter"
              ? "var(--gal-build)"
              : r.kind === "full"
              ? "var(--red, #f87171)"
              : "var(--border)";
          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontFamily: "ui-monospace, monospace",
                  color: "var(--zinc-400, #a1a1aa)",
                }}
              >
                <span>{r.label}</span>
                <span>{r.gb < 0.5 ? `${Math.round(r.gb * 1024)} MB` : `${r.gb.toFixed(1)} GB`}</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: "var(--surface)",
                  overflow: "hidden",
                  marginTop: 2,
                }}
              >
                <div style={{ width: `${pct}%`, height: "100%", background: barColor }} />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--zinc-400, #a1a1aa)" }}>
          total
        </span>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 18, fontWeight: 700, color: accent }}>
          {total.toFixed(total < 10 ? 2 : 0)} GB
        </span>
      </div>
    </div>
  );
}
