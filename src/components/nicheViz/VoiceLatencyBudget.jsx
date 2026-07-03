import { useState } from "react";

// Real-time voice latency budget across VAD -> ASR -> LLM (TTFT) -> TTS.
// Adjust each stage, watch the running total vs the turn-taking budget.
export default function VoiceLatencyBudget({ onNavigate, spec }) {
  const TARGET_MS = 800; // sub-800ms feels like natural turn-taking

  const STAGES = [
    {
      key: "vad",
      name: "VAD",
      full: "voice activity detection",
      min: 10,
      max: 300,
      def: 120,
      tip: "endpoint fast — most of this is the silence you wait out before deciding the user stopped talking.",
    },
    {
      key: "asr",
      name: "ASR",
      full: "speech to text",
      min: 20,
      max: 800,
      def: 150,
      tip: "stream partial transcripts so ASR overlaps the user still speaking — don't wait for the final.",
    },
    {
      key: "llm",
      name: "LLM (TTFT)",
      full: "time to first token",
      min: 50,
      max: 2000,
      def: 380,
      tip: "the usual bottleneck — optimize time-to-first-token, emit a short first chunk, keep the prompt lean.",
    },
    {
      key: "tts",
      name: "TTS",
      full: "text to speech",
      min: 20,
      max: 600,
      def: 130,
      tip: "stream audio on the first sentence — start speaking before the full response is generated.",
    },
  ];

  const [vals, setVals] = useState(
    STAGES.reduce((a, s) => ({ ...a, [s.key]: s.def }), {})
  );

  const total = STAGES.reduce((sum, s) => sum + vals[s.key], 0);
  const overBudget = total > TARGET_MS;
  const dominant = STAGES.reduce(
    (max, s) => (vals[s.key] > vals[max.key] ? s : max),
    STAGES[0]
  );

  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";
  const statusColor = overBudget ? RED : GREEN;

  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  };
  const label = { fontSize: "0.7rem", color: "#a1a1aa" };

  // grey ramp per stage so the stacked bar reads without color
  const SHADES = ["#3f3f46", "#52525b", "#71717a", "#a1a1aa"];

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
          style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}
        >
          Voice pipeline latency budget
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          VAD → ASR → LLM (TTFT) → TTS. Keep the round-trip under {TARGET_MS} ms
          and turn-taking feels natural.
        </div>
      </div>

      {/* running total */}
      <div style={{ ...card, borderLeft: `2px solid ${statusColor}` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={label}>total round-trip</span>
          <span style={{ ...mono, fontSize: "1.6rem", color: statusColor }}>
            {total} ms
          </span>
        </div>
        <div
          style={{ ...mono, fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.25rem" }}
        >
          {overBudget
            ? `${total - TARGET_MS} ms over the ${TARGET_MS} ms budget`
            : `${TARGET_MS - total} ms of headroom under ${TARGET_MS} ms`}{" "}
          · dominated by{" "}
          <span style={{ color: overBudget ? RED : CYAN }}>
            {dominant.name}
          </span>{" "}
          ({vals[dominant.key]} ms)
        </div>

        {/* stacked bar with budget marker */}
        <div
          style={{
            position: "relative",
            marginTop: "0.75rem",
            height: 26,
            background: "var(--surface-2, #1f1f23)",
            borderRadius: "0.4rem",
            overflow: "hidden",
            border: "1px solid var(--border, #27272a)",
          }}
        >
          <div style={{ display: "flex", height: "100%" }}>
            {STAGES.map((s, i) => {
              const scale = Math.max(total, TARGET_MS);
              return (
                <div
                  key={s.key}
                  style={{
                    width: `${(vals[s.key] / scale) * 100}%`,
                    height: "100%",
                    background:
                      s.key === dominant.key
                        ? overBudget
                          ? RED
                          : CYAN
                        : SHADES[i],
                    borderRight: "1px solid var(--surface, #18181b)",
                  }}
                  title={`${s.name}: ${vals[s.key]} ms`}
                />
              );
            })}
          </div>
          {/* budget line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(TARGET_MS / Math.max(total, TARGET_MS)) * 100}%`,
              width: 2,
              background: "#fafafa",
            }}
            title={`budget ${TARGET_MS} ms`}
          />
        </div>
        <div
          style={{
            ...mono,
            fontSize: "0.66rem",
            color: "#71717a",
            marginTop: "0.3rem",
          }}
        >
          white line = {TARGET_MS} ms budget
        </div>
      </div>

      {/* per-stage sliders */}
      {STAGES.map((s, i) => {
        const isDom = s.key === dominant.key;
        const pct = Math.round((vals[s.key] / total) * 100);
        return (
          <div key={s.key} style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.35rem",
              }}
            >
              <span>
                <span
                  style={{
                    fontWeight: 600,
                    color: isDom ? (overBudget ? RED : CYAN) : "#e4e4e7",
                  }}
                >
                  {s.name}
                </span>{" "}
                <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
                  {s.full}
                </span>
              </span>
              <span style={{ ...mono, color: "#fafafa" }}>
                {vals[s.key]} ms{" "}
                <span style={{ color: "#71717a", fontSize: "0.72rem" }}>
                  ({pct}%)
                </span>
              </span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={10}
              value={vals[s.key]}
              onChange={(e) =>
                setVals((v) => ({ ...v, [s.key]: Number(e.target.value) }))
              }
              style={{ width: "100%", accentColor: "#71717a" }}
            />
            <div
              style={{
                fontSize: "0.75rem",
                color: "#a1a1aa",
                marginTop: "0.3rem",
              }}
            >
              {s.tip}
            </div>
          </div>
        );
      })}

      <div
        style={{
          ...card,
          borderLeft: `2px solid ${CYAN}`,
          fontSize: "0.82rem",
          color: "#d4d4d8",
        }}
      >
        The LLM's time-to-first-token usually dominates the budget — drag it up
        and watch the total blow past {TARGET_MS} ms while the others stay
        small. Streaming everything (partial ASR, first LLM chunk, first TTS
        sentence) is what buys the round-trip back.
      </div>
    </div>
  );
}
