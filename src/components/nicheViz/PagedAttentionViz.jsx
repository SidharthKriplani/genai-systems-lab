import { useState } from "react";

export default function PagedAttentionViz({ onNavigate, spec } = {}) {
  const [mode, setMode] = useState("paged"); // "contiguous" | "paged"

  const TOTAL_BLOCKS = 24; // total KV cache blocks available
  const BLOCK = 1; // one block = one unit of KV memory

  // Three requests. actual = blocks their tokens truly need.
  // Contiguous over-reserves to a fixed max_seq_len allotment.
  const REQS = [
    { id: "R1", actual: 5, shared: false },
    { id: "R2", actual: 3, shared: true }, // shares a system prompt prefix with R3
    { id: "R3", actual: 4, shared: true },
  ];
  const CONTIG_RESERVE = 8; // each request reserves max_seq_len worth of blocks
  const PREFIX_BLOCKS = 2; // shared system-prompt prefix, in blocks

  let used, wasted, blocks, fit, note;

  if (mode === "contiguous") {
    // Each request grabs a contiguous CONTIG_RESERVE span. No sharing.
    const rows = [];
    let cursor = 0;
    let over = 0;
    REQS.forEach((r) => {
      const span = [];
      for (let i = 0; i < CONTIG_RESERVE; i++) {
        const state = i < r.actual ? "used" : "reserved";
        if (state === "reserved") over += 1;
        span.push({ state, id: r.id });
        cursor += 1;
      }
      rows.push({ id: r.id, span, reserved: CONTIG_RESERVE });
    });
    used = REQS.reduce((a, r) => a + r.actual, 0);
    wasted = over; // over-reservation
    fit = cursor <= TOTAL_BLOCKS;
    blocks = rows;
    note =
      "Each request grabs one contiguous span sized for the worst case (max_seq_len). Tokens it never generates leave reserved-but-empty blocks. The shared system prompt is copied into every request.";
  } else {
    // Paged: allocate exactly what's needed, block granularity; prefix shared once.
    const rows = [];
    let allocated = 0;
    // shared prefix stored ONCE
    allocated += PREFIX_BLOCKS;
    REQS.forEach((r) => {
      const span = [];
      const prefixHere = r.shared ? PREFIX_BLOCKS : 0;
      const own = r.actual - prefixHere;
      for (let i = 0; i < prefixHere; i++) span.push({ state: "shared", id: r.id });
      for (let i = 0; i < own; i++) {
        span.push({ state: "used", id: r.id });
        allocated += 1;
      }
      rows.push({ id: r.id, span, reserved: r.actual });
    });
    used = REQS.reduce((a, r) => a + r.actual, 0);
    wasted = 0; // block-granular, near-zero internal fragmentation
    fit = allocated <= TOTAL_BLOCKS;
    blocks = rows;
    note =
      "Blocks are allocated on demand at block granularity, scattered anywhere in memory (a page table maps them). The shared system-prompt prefix is stored once and pointed to by both R2 and R3.";
  }

  const totalReserved =
    mode === "contiguous"
      ? REQS.length * CONTIG_RESERVE
      : PREFIX_BLOCKS + REQS.reduce((a, r) => a + (r.actual - (r.shared ? PREFIX_BLOCKS : 0)), 0);

  const card = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  };

  const cellColor = (state) =>
    state === "used"
      ? "var(--gal-build)"
      : state === "shared"
      ? "#34d399"
      : "#7f1d1d"; // reserved / wasted

  const toggleBtn = (active) => ({
    flex: 1,
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: `1px solid ${active ? "var(--gal-build)" : "var(--border)"}`,
    background: active ? "var(--surface-2)" : "transparent",
    color: active ? "var(--gal-build)" : "#a1a1aa",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 600,
  });

  const utilPct = Math.round((used / totalReserved) * 100);

  return (
    <div
      style={{
        color: "#e4e4e7",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: 720,
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>
          KV cache: contiguous vs paged
        </h3>
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "#a1a1aa" }}>
          Three requests store their attention keys/values in a fixed pool of{" "}
          {TOTAL_BLOCKS} memory blocks.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          style={toggleBtn(mode === "contiguous")}
          onClick={() => setMode("contiguous")}
        >
          Contiguous
        </button>
        <button style={toggleBtn(mode === "paged")} onClick={() => setMode("paged")}>
          Paged blocks
        </button>
      </div>

      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {blocks.map((row) => (
            <div key={row.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ ...mono, width: 26, fontSize: "0.72rem", color: "#a1a1aa" }}>
                {row.id}
              </span>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {row.span.map((c, i) => (
                  <div
                    key={i}
                    title={
                      c.state === "used"
                        ? "in use"
                        : c.state === "shared"
                        ? "shared prefix (stored once)"
                        : "reserved but empty"
                    }
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: cellColor(c.state),
                      border: "1px solid var(--border)",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "0.75rem",
            fontSize: "0.72rem",
            color: "#a1a1aa",
            flexWrap: "wrap",
          }}
        >
          <span>
            <Chip c="var(--gal-build)" /> in use
          </span>
          <span>
            <Chip c="#34d399" /> shared prefix
          </span>
          <span>
            <Chip c="#7f1d1d" /> reserved, wasted
          </span>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Stat label="tokens' real need" value={`${used} blk`} color="#e4e4e7" />
          <Stat
            label="reserved"
            value={`${totalReserved} blk`}
            color={mode === "contiguous" ? "#f87171" : "#34d399"}
          />
          <Stat
            label="wasted"
            value={`${wasted} blk`}
            color={wasted === 0 ? "#34d399" : "#f87171"}
          />
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <div
            style={{
              height: 16,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                width: `${utilPct}%`,
                height: "100%",
                background: "var(--gal-build)",
              }}
            />
            <div
              style={{
                width: `${100 - utilPct}%`,
                height: "100%",
                background: wasted === 0 ? "var(--surface-2)" : "#7f1d1d",
              }}
            />
          </div>
          <div style={{ ...mono, fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.4rem" }}>
            memory efficiency {utilPct}% · {fit ? "fits in pool" : "overflows pool"}
          </div>
        </div>
      </div>

      <div style={{ ...card, fontSize: "0.8rem", color: "#a1a1aa" }}>
        <strong style={{ color: mode === "paged" ? "#34d399" : "#f87171" }}>
          {mode === "paged" ? "Paged attention." : "Contiguous allocation."}
        </strong>{" "}
        {note}
      </div>
    </div>
  );
}

function Chip({ c }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        background: c,
        borderRadius: 2,
        marginRight: 4,
      }}
    />
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: "0.68rem",
          color: "#a1a1aa",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "1.1rem",
          fontWeight: 700,
          color,
          marginTop: "0.15rem",
        }}
      >
        {value}
      </div>
    </div>
  );
}
