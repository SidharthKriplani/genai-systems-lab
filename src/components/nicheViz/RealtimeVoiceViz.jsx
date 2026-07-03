import { useState } from "react";

// Turn-taking timeline for a real-time voice agent.
// User speaks -> VAD/endpointing decides the turn is over -> agent responds.
// Barge-in interrupts the agent mid-response. Toggle cascaded vs speech-to-speech
// to feel the latency the extra hops cost you.
export default function RealtimeVoiceViz({ onNavigate, spec } = {}) {
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

  // two pipelines: cascaded (ASR->LLM->TTS) vs speech-to-speech (one model).
  const PIPELINES = {
    cascaded: {
      name: "cascaded",
      full: "ASR → LLM → TTS",
      hops: [
        { label: "ASR", ms: 150 },
        { label: "LLM", ms: 380 },
        { label: "TTS", ms: 130 },
      ],
    },
    s2s: {
      name: "speech-to-speech",
      full: "one audio-native model",
      hops: [{ label: "S2S model", ms: 320 }],
    },
  };

  const [mode, setMode] = useState("cascaded");
  const [barged, setBarged] = useState(false);

  const pipe = PIPELINES[mode];
  const responseLatency = pipe.hops.reduce((s, h) => s + h.ms, 0);

  // fixed timeline geometry (ms). user speech, then endpoint silence, then agent.
  const USER_SPEECH = 1400;
  const ENDPOINT_SILENCE = 300; // VAD waits out this much silence to call turn end
  const turnBoundary = USER_SPEECH + ENDPOINT_SILENCE;
  const agentStart = turnBoundary + responseLatency;
  const AGENT_SPEECH = 1600;
  // barge-in: user cuts in partway through the agent's reply
  const bargeAt = agentStart + 600;
  const agentEnd = barged ? bargeAt : agentStart + AGENT_SPEECH;
  const totalMs = Math.max(agentEnd + 200, agentStart + AGENT_SPEECH + 200);

  const pct = (ms) => (ms / totalMs) * 100;

  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };

  const btn = (active, color) => ({
    padding: "0.35rem 0.7rem",
    borderRadius: "0.5rem",
    fontSize: "0.78rem",
    cursor: "pointer",
    background: active ? "var(--surface-2, #1f1f23)" : "transparent",
    border: `1px solid ${active ? color : "var(--border, #27272a)"}`,
    color: active ? color : "#a1a1aa",
    fontWeight: active ? 600 : 400,
  });

  const seg = (left, width, bg, border) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: `${pct(left)}%`,
    width: `${pct(width)}%`,
    background: bg,
    borderRight: border ? `2px solid ${border}` : "none",
  });

  return (
    <div style={{ color: "#e4e4e7", maxWidth: 760, margin: "0 auto", display: "flex",
      flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: 1.5 }}>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}>
          Turn-taking in a voice agent
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          The user speaks, endpointing decides the turn is over, then the agent
          replies. The gap between them is your response latency.
        </div>
      </div>

      {/* pipeline toggle */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.72rem", color: "#71717a" }}>pipeline:</span>
        {Object.keys(PIPELINES).map((k) => (
          <button key={k} onClick={() => setMode(k)} style={btn(mode === k, CYAN)}>
            {PIPELINES[k].name}
          </button>
        ))}
        <span style={{ ...mono, fontSize: "0.72rem", color: "#71717a" }}>
          {pipe.full}
        </span>
      </div>

      {/* timeline */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: "0.7rem", color: "#a1a1aa", marginBottom: "0.4rem" }}>
          <span>user turn</span>
          <span>agent turn</span>
        </div>
        <div style={{ position: "relative", height: 34, background: "var(--surface-2, #1f1f23)",
          borderRadius: "0.4rem", overflow: "hidden", border: "1px solid var(--border, #27272a)" }}>
          {/* user speech */}
          <div style={seg(0, USER_SPEECH, "#52525b")} title="user speaking" />
          {/* endpoint silence */}
          <div style={seg(USER_SPEECH, ENDPOINT_SILENCE, "#3f3f46")} title="VAD waits out silence" />
          {/* latency gap */}
          <div style={seg(turnBoundary, responseLatency, "#27272a")} title="response latency" />
          {/* agent speech */}
          <div style={seg(agentStart, agentEnd - agentStart, barged ? RED : CYAN)}
            title={barged ? "agent interrupted" : "agent speaking"} />
          {/* turn boundary marker */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct(turnBoundary)}%`,
            width: 2, background: "#fafafa" }} title="turn boundary (endpoint decides here)" />
          {/* barge-in marker */}
          {barged && (
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct(bargeAt)}%`,
              width: 2, background: GREEN }} title="user barges in" />
          )}
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.35rem" }}>
          white line = turn boundary · endpointing waits out {ENDPOINT_SILENCE} ms of
          silence before deciding the user stopped
          {barged ? " · green line = barge-in" : ""}
        </div>
      </div>

      {/* latency readout */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ ...card, flex: 1, minWidth: 180, borderLeft: `2px solid ${CYAN}` }}>
          <div style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>response latency</div>
          <div style={{ ...mono, fontSize: "1.5rem", color: CYAN }}>{responseLatency} ms</div>
          <div style={{ ...mono, fontSize: "0.7rem", color: "#71717a", marginTop: "0.3rem" }}>
            {pipe.hops.map((h) => `${h.label} ${h.ms}`).join(" + ")}
          </div>
        </div>
        <div style={{ ...card, flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>vs the other pipeline</div>
          <div style={{ ...mono, fontSize: "1.5rem", color: "#fafafa" }}>
            {(() => {
              const other = mode === "cascaded" ? "s2s" : "cascaded";
              const o = PIPELINES[other].hops.reduce((s, h) => s + h.ms, 0);
              const d = responseLatency - o;
              return d === 0 ? "same" : `${d > 0 ? "+" : ""}${d} ms`;
            })()}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#71717a", marginTop: "0.3rem" }}>
            cascaded pays for three hops; speech-to-speech collapses them into one.
          </div>
        </div>
      </div>

      {/* barge-in control */}
      <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div>
          <div style={{ fontWeight: 600, color: "#fafafa" }}>Barge-in</div>
          <div style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>
            {barged
              ? "User cut in mid-reply — the agent stops speaking and yields the turn."
              : "Let the user interrupt the agent while it is still talking."}
          </div>
        </div>
        <button onClick={() => setBarged((b) => !b)} style={btn(barged, GREEN)}>
          {barged ? "reset" : "interrupt agent"}
        </button>
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}`, fontSize: "0.82rem", color: "#d4d4d8" }}>
        The turn boundary is a decision, not an event — endpointing has to wait out
        enough silence to be sure the user is done, but every extra millisecond of
        that wait is dead air. Barge-in is the escape hatch: the user reclaims the
        turn instantly, so the agent must be able to stop talking on demand.
      </div>
    </div>
  );
}
