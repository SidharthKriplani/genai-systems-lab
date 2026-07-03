import { useState } from "react";

export default function ContinuousBatchingViz({ onNavigate, spec } = {}) {
  const [mode, setMode] = useState("continuous"); // "static" | "continuous"

  // Four sequences with different remaining decode lengths.
  const SEQS = [
    { id: "A", len: 3 },
    { id: "B", len: 7 },
    { id: "C", len: 2 },
    { id: "D", len: 5 },
  ];
  const WAITING = [
    { id: "E", len: 4 },
    { id: "F", len: 6 },
    { id: "G", len: 3 },
  ];
  const STEPS = 8;
  const SLOTS = 4;

  // Build a grid[slot][step] = { id, state } where state is "active" | "idle".
  function buildStatic() {
    const maxLen = Math.max(...SEQS.map((s) => s.len)); // batch waits for longest
    const grid = SEQS.map((s) =>
      Array.from({ length: STEPS }, (_, t) => {
        if (t >= maxLen) return { id: null, state: "empty" };
        return { id: s.id, state: t < s.len ? "active" : "idle" };
      })
    );
    return grid;
  }

  function buildContinuous() {
    // Each slot decodes its seq; when a seq finishes, next waiting seq swaps in.
    const queue = [...WAITING];
    const grid = SEQS.map((s) => {
      const row = [];
      let cur = { id: s.id, left: s.len };
      for (let t = 0; t < STEPS; t++) {
        if (cur && cur.left > 0) {
          row.push({ id: cur.id, state: "active" });
          cur.left -= 1;
          if (cur.left === 0) {
            // swap in next waiting seq for the NEXT step
            cur = queue.length ? { id: queue.shift().id, left: null } : null;
            if (cur) cur.left = WAITING.find((w) => w.id === cur.id).len;
          }
        } else {
          row.push({ id: null, state: "empty" });
        }
      }
      return row;
    });
    return grid;
  }

  const grid = mode === "static" ? buildStatic() : buildContinuous();

  // Utilization: active cells / (slots * steps used).
  const usedSteps = Math.max(
    ...grid.map((row) => {
      let last = 0;
      row.forEach((c, i) => {
        if (c.state !== "empty") last = i + 1;
      });
      return last;
    })
  );
  let active = 0,
    idle = 0;
  grid.forEach((row) =>
    row.slice(0, usedSteps).forEach((c) => {
      if (c.state === "active") active += 1;
      else idle += 1;
    })
  );
  const util = Math.round((active / (SLOTS * usedSteps)) * 100);

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
    state === "active"
      ? "var(--gal-build)"
      : state === "idle"
      ? "#7f1d1d"
      : "var(--surface-2)";

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
          Continuous vs static batching
        </h3>
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "#a1a1aa" }}>
          Four requests of different lengths share four GPU slots. Each column is
          one decode step.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button style={toggleBtn(mode === "static")} onClick={() => setMode("static")}>
          Static batching
        </button>
        <button
          style={toggleBtn(mode === "continuous")}
          onClick={() => setMode("continuous")}
        >
          Continuous batching
        </button>
      </div>

      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {grid.map((row, si) => (
            <div key={si} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span
                style={{
                  ...mono,
                  width: 22,
                  fontSize: "0.7rem",
                  color: "#a1a1aa",
                }}
              >
                s{si}
              </span>
              <div style={{ display: "flex", gap: 3, flex: 1 }}>
                {row.map((c, ti) => (
                  <div
                    key={ti}
                    title={
                      c.state === "active"
                        ? `seq ${c.id} decoding`
                        : c.state === "idle"
                        ? "finished, slot wasted"
                        : "empty"
                    }
                    style={{
                      flex: 1,
                      height: 26,
                      borderRadius: 4,
                      background: cellColor(c.state),
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...mono,
                      fontSize: "0.7rem",
                      color: c.state === "active" ? "#0a0a0a" : "#a1a1aa",
                    }}
                  >
                    {c.state === "active" ? c.id : ""}
                  </div>
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
          }}
        >
          <span>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "var(--gal-build)",
                borderRadius: 2,
                marginRight: 4,
              }}
            />
            decoding
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "#7f1d1d",
                borderRadius: 2,
                marginRight: 4,
              }}
            />
            slot wasted (finished, still held)
          </span>
        </div>
      </div>

      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.4rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            GPU utilization
          </span>
          <span style={{ ...mono, color: util >= 90 ? "#34d399" : "#f87171" }}>
            {util}%
          </span>
        </div>
        <div
          style={{
            height: 16,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${util}%`,
              height: "100%",
              background: util >= 90 ? "#34d399" : "#f87171",
              transition: "width 0.2s",
            }}
          />
        </div>
        <div style={{ ...mono, fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.5rem" }}>
          active {active} · wasted {idle} · over {usedSteps} steps
        </div>
      </div>

      <div style={{ ...card, fontSize: "0.8rem", color: "#a1a1aa" }}>
        {mode === "static" ? (
          <>
            <strong style={{ color: "#f87171" }}>Static batching holds the batch hostage.</strong>{" "}
            Short sequences finish early but their slot stays reserved until the
            longest sequence in the batch is done. Those red cells are paid-for
            GPU cycles producing nothing.
          </>
        ) : (
          <>
            <strong style={{ color: "#34d399" }}>Continuous batching evicts and refills.</strong>{" "}
            The moment a sequence emits its stop token its slot is freed and a
            waiting request swaps in at the next decode step. The GPU stays full,
            so throughput climbs without adding hardware.
          </>
        )}
      </div>
    </div>
  );
}
