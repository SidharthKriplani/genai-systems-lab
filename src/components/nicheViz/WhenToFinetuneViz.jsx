import { useState } from "react";

// The customization ladder: prompt-engineering -> RAG -> fine-tune.
// Toggle what you need; the recommendation climbs only as far as required.
export default function WhenToFinetuneViz({ onNavigate, spec } = {}) {
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";

  const [newKnowledge, setNewKnowledge] = useState(false);
  const [newBehavior, setNewBehavior] = useState(false);
  const [latencyCritical, setLatencyCritical] = useState(false);
  const [haveLabels, setHaveLabels] = useState(false);

  const RUNGS = [
    {
      key: "prompt",
      name: "prompt engineering",
      blurb: "instructions + few-shot examples",
    },
    {
      key: "rag",
      name: "RAG",
      blurb: "retrieve facts, inject into context",
    },
    {
      key: "finetune",
      name: "fine-tune",
      blurb: "train new weights on your data",
    },
  ];

  // Decision logic — behavior/format is what fine-tuning is FOR; knowledge is RAG.
  let pick, reason;
  if (newBehavior && haveLabels) {
    pick = "finetune";
    reason =
      "you need a new behavior or output format and you have labeled examples — that's the fine-tune case.";
  } else if (newBehavior && !haveLabels) {
    pick = "prompt";
    reason =
      "you want new behavior but have no labeled data yet — push prompt engineering first, gather examples, then consider fine-tuning.";
  } else if (newKnowledge) {
    pick = "rag";
    reason =
      "you need new facts the base model never saw — retrieve them. Fine-tuning bakes facts in stale and expensively; RAG keeps them fresh.";
  } else {
    pick = "prompt";
    reason =
      "no new knowledge, no new behavior — a good prompt is the cheapest thing that works. Start here.";
  }

  // fine-tune also buys latency: shorter prompts once behavior is trained in
  const latencyNote =
    latencyCritical && pick !== "finetune"
      ? "Latency-critical: fine-tuning can shorten prompts (behavior is in the weights, not the context) — worth it once you have data."
      : latencyCritical && pick === "finetune"
      ? "Bonus: trained-in behavior means shorter prompts and lower latency at serve time."
      : null;

  const pickIdx = RUNGS.findIndex((r) => r.key === pick);

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

  function Toggle({ on, set, children }) {
    return (
      <button
        onClick={() => set(!on)}
        style={{
          ...mono,
          fontSize: "0.78rem",
          padding: "0.5rem 0.7rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          border: `1px solid ${on ? CYAN : "var(--border, #27272a)"}`,
          background: on ? "var(--surface-2, #1f1f23)" : "transparent",
          color: on ? "#fafafa" : "#a1a1aa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{children}</span>
        <span style={{ color: on ? CYAN : "#52525b" }}>{on ? "yes" : "no"}</span>
      </button>
    );
  }

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
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}>
          Prompt, RAG, or fine-tune?
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Climb the ladder only as far as you must. Toggle what you need — the
          recommendation moves.
        </div>
      </div>

      {/* the ladder */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          the customization ladder — cheapest first
        </div>
        {RUNGS.map((r, i) => {
          const isPick = r.key === pick;
          const reached = i <= pickIdx;
          return (
            <div
              key={r.key}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.6rem",
                padding: "0.5rem 0",
                borderTop: i === 0 ? "none" : "1px solid var(--border, #27272a)",
              }}
            >
              <span
                style={{
                  ...mono,
                  fontSize: "0.7rem",
                  color: reached ? (isPick ? GREEN : "#71717a") : "#3f3f46",
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: isPick ? GREEN : reached ? "#e4e4e7" : "#52525b",
                  }}
                >
                  {r.name}
                </span>{" "}
                <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
                  {r.blurb}
                </span>
              </span>
              {isPick && (
                <span style={{ ...mono, fontSize: "0.68rem", color: GREEN }}>
                  ← use this
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* inputs */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ ...label, marginBottom: "0.1rem" }}>what do you need?</div>
        <Toggle on={newKnowledge} set={setNewKnowledge}>
          need NEW KNOWLEDGE (facts the model never saw)?
        </Toggle>
        <Toggle on={newBehavior} set={setNewBehavior}>
          need NEW BEHAVIOR / FORMAT (tone, structure, style)?
        </Toggle>
        <Toggle on={latencyCritical} set={setLatencyCritical}>
          latency-critical (short prompts matter)?
        </Toggle>
        <Toggle on={haveLabels} set={setHaveLabels}>
          have labeled training data?
        </Toggle>
      </div>

      {/* recommendation */}
      <div style={{ ...card, borderLeft: `2px solid ${GREEN}` }}>
        <span style={label}>recommendation</span>
        <div style={{ ...mono, fontSize: "1.3rem", color: GREEN, margin: "0.15rem 0" }}>
          {RUNGS[pickIdx].name}
        </div>
        <div style={{ fontSize: "0.82rem", color: "#d4d4d8" }}>{reason}</div>
        {latencyNote && (
          <div
            style={{
              fontSize: "0.78rem",
              color: "#a1a1aa",
              marginTop: "0.5rem",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--border, #27272a)",
            }}
          >
            {latencyNote}
          </div>
        )}
      </div>

      <div
        style={{
          ...card,
          borderLeft: `2px solid ${CYAN}`,
          fontSize: "0.82rem",
          color: "#d4d4d8",
        }}
      >
        The line that saves the most wasted GPU-hours: fine-tuning changes{" "}
        <span style={{ color: CYAN }}>behavior and format</span>, not facts. If
        the model is answering wrong because it lacks knowledge, no amount of
        fine-tuning fixes it cleanly — use RAG for knowledge, fine-tune for how
        it responds.
      </div>
    </div>
  );
}
