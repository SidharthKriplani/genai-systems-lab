import { useState } from "react";

// Monochrome instrument. Accents: cyan (var(--gal-build)), emerald (cheap/good), red (expensive/risk).
export default function MultiturnContextViz({ onNavigate, spec } = {}) {
  const [turn, setTurn] = useState(8);
  const [strategy, setStrategy] = useState("resend"); // resend | window | summarize | retrieve

  const TOK_PER_TURN = 300; // avg tokens added per user+assistant exchange
  const WINDOW = 4; // sliding-window keeps last N turns
  const SUMMARY_TOK = 200; // fixed cost of a rolling summary
  const RETRIEVE_K = 3; // retrieve K relevant past turns

  // Prompt tokens sent on a given turn t (1-indexed), by strategy.
  function promptTokens(t) {
    switch (strategy) {
      case "resend":
        return t * TOK_PER_TURN; // whole transcript every turn → grows linearly, quadratic total
      case "window":
        return Math.min(t, WINDOW) * TOK_PER_TURN;
      case "summarize":
        return t <= WINDOW ? t * TOK_PER_TURN : SUMMARY_TOK + WINDOW * TOK_PER_TURN;
      case "retrieve":
        return Math.min(t, RETRIEVE_K + 1) * TOK_PER_TURN;
      default:
        return t * TOK_PER_TURN;
    }
  }

  const current = promptTokens(turn);
  // Cumulative cost across all turns up to now (what you actually paid).
  let cumulative = 0;
  for (let t = 1; t <= turn; t++) cumulative += promptTokens(t);

  const resendCurrent = turn * TOK_PER_TURN;

  // "Lost in the middle": long transcript + resend => middle turns get ignored.
  const longTranscript = turn >= 6;
  const middleRisk = strategy === "resend" && longTranscript;

  const card = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
  };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
  const label = { fontSize: 11, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 0.6 };
  const btn = (on) => ({
    ...mono,
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: on ? "var(--surface-2)" : "transparent",
    color: on ? "#e4e4e7" : "#a1a1aa",
  });

  // Cost curve as bars across turns 1..turn (max 16).
  const maxTurns = 16;
  const peak = maxTurns * TOK_PER_TURN;
  const bars = [];
  for (let t = 1; t <= maxTurns; t++) {
    const v = t <= turn ? promptTokens(t) : 0;
    bars.push({ t, h: (v / peak) * 100, active: t === turn, filled: t <= turn });
  }

  const STRAT_LABEL = {
    resend: "resend all — full transcript every turn",
    window: `sliding window — keep last ${WINDOW} turns`,
    summarize: "summarize old — rolling summary + recent",
    retrieve: `retrieve relevant — top ${RETRIEVE_K} past turns`,
  };

  return (
    <div style={{ color: "#e4e4e7", fontSize: 13, maxWidth: 640 }}>
      <div style={{ ...label, marginBottom: 4 }}>Multi-turn context</div>
      <div style={{ color: "#a1a1aa", marginBottom: 14, fontSize: 12 }}>
        As a conversation grows, tokens sent per turn grow linearly under resend-all
        — but summed across every turn, that makes cumulative cost grow quadratically.
      </div>

      {/* Strategy */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button style={btn(strategy === "resend")} onClick={() => setStrategy("resend")}>resend all</button>
        <button style={btn(strategy === "window")} onClick={() => setStrategy("window")}>window</button>
        <button style={btn(strategy === "summarize")} onClick={() => setStrategy("summarize")}>summarize</button>
        <button style={btn(strategy === "retrieve")} onClick={() => setStrategy("retrieve")}>retrieve</button>
      </div>

      {/* Turn slider */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...label }}>
          <span>Turn</span>
          <span style={{ ...mono, color: "#e4e4e7" }}>{turn} / {maxTurns}</span>
        </div>
        <input
          type="range"
          min={1}
          max={maxTurns}
          step={1}
          value={turn}
          onChange={(e) => setTurn(Number(e.target.value))}
          style={{ width: "100%", marginTop: 6 }}
        />
        <div style={{ ...mono, fontSize: 11, color: "#71717a", marginTop: 4 }}>{STRAT_LABEL[strategy]}</div>
      </div>

      {/* Cost curve */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ ...label, marginBottom: 8 }}>Prompt tokens per turn</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90 }}>
          {bars.map((b) => (
            <div
              key={b.t}
              title={`turn ${b.t}`}
              style={{
                flex: 1,
                height: `${b.h}%`,
                minHeight: b.filled ? 2 : 0,
                borderRadius: 3,
                background: !b.filled
                  ? "transparent"
                  : b.active
                  ? "var(--gal-build)"
                  : "var(--surface-2)",
                border: b.active ? "none" : "1px solid var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={card}>
          <div style={label}>This turn's prompt</div>
          <div style={{ ...mono, fontSize: 22, color: current >= resendCurrent ? "#f87171" : "#6ee7b7" }}>
            {current.toLocaleString()}
          </div>
          <div style={{ ...mono, fontSize: 11, color: "#71717a" }}>
            resend-all: {resendCurrent.toLocaleString()} tok
          </div>
        </div>
        <div style={card}>
          <div style={label}>Cumulative sent</div>
          <div style={{ ...mono, fontSize: 22, color: "#e4e4e7" }}>{cumulative.toLocaleString()}</div>
          <div style={{ ...mono, fontSize: 11, color: "#71717a" }}>across {turn} turns</div>
        </div>
      </div>

      {/* Lost in the middle */}
      <div
        style={{
          ...card,
          marginTop: 12,
          borderColor: middleRisk ? "rgba(248,113,113,0.5)" : "var(--border)",
        }}
      >
        <div style={{ ...label, color: middleRisk ? "#f87171" : "#a1a1aa" }}>
          Lost in the middle
        </div>
        <div style={{ ...mono, fontSize: 12, color: middleRisk ? "#f87171" : "#71717a", marginTop: 4 }}>
          {middleRisk
            ? `long transcript (${turn} turns) resent whole → middle turns attended weakly, likely ignored`
            : strategy === "resend"
            ? "transcript still short — all turns attended"
            : "recent + relevant turns kept short → middle-context loss avoided"}
        </div>
      </div>
    </div>
  );
}
