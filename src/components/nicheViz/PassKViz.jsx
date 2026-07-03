import { useState } from "react";

export default function PassKViz({ onNavigate, spec } = {}) {
  const [k, setK] = useState(10);
  const [p, setP] = useState(20); // per-sample success probability, percent

  const pf = p / 100;
  const passK = 1 - Math.pow(1 - pf, k);
  const passKpct = passK * 100;
  const pass1pct = pf * 100;
  const inflation = passKpct - pass1pct;

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
  const label = {
    fontSize: "0.75rem",
    color: "#a1a1aa",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

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
          pass@k calculator
        </h3>
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "#a1a1aa" }}>
          Draw k independent samples per problem. If any one passes the tests,
          the problem counts as solved. pass@k = 1 − (1 − p)<sup>k</sup>.
        </p>
      </div>

      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.35rem",
              }}
            >
              <span style={label}>samples k</span>
              <span style={{ ...mono, color: "var(--gal-build)" }}>{k}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--gal-build)" }}
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.35rem",
              }}
            >
              <span style={label}>per-sample success p</span>
              <span style={{ ...mono, color: "var(--gal-build)" }}>{p}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--gal-build)" }}
            />
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={label}>pass@{k}</div>
        <div
          style={{
            ...mono,
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#34d399",
            margin: "0.25rem 0 0.6rem",
          }}
        >
          {passKpct.toFixed(1)}%
        </div>
        <div
          style={{
            height: 18,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${passKpct}%`,
              height: "100%",
              background: "#34d399",
              transition: "width 0.15s",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.75rem",
            ...mono,
            fontSize: "0.8rem",
          }}
        >
          <span style={{ color: "#a1a1aa" }}>
            pass@1 &nbsp;
            <strong style={{ color: "#e4e4e7" }}>{pass1pct.toFixed(1)}%</strong>
          </span>
          <span style={{ color: "#a1a1aa" }}>
            inflation from sampling &nbsp;
            <strong style={{ color: "var(--gal-build)" }}>
              +{inflation.toFixed(1)} pts
            </strong>
          </span>
        </div>
      </div>

      <div style={{ ...card, fontSize: "0.8rem", color: "#a1a1aa" }}>
        <strong style={{ color: "#e4e4e7" }}>SWE-bench context.</strong> A
        headline "resolved %" is usually reported at pass@1 — one attempt per
        issue. When a system is scored at pass@k it may draw dozens of patches
        and keep any that passes the hidden tests. Same model, very different
        number.
      </div>

      <div
        style={{
          ...card,
          borderColor: "#7f1d1d",
          fontSize: "0.8rem",
          color: "#fca5a5",
        }}
      >
        <strong style={{ color: "#f87171" }}>Why leaderboards mislead.</strong>{" "}
        pass@k needs an oracle — real test cases that tell you which of the k
        samples is correct. In production you rarely have that oracle, so pass@k
        is an upper bound, not a delivery rate. A 20% pass@1 model can post 89%
        at pass@50 here without getting one bit smarter.
      </div>
    </div>
  );
}
