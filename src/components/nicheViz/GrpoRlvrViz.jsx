import { useState } from "react";

// PPO vs GRPO vs RLVR. PPO carries 4 models. GRPO drops the critic and uses a
// group-relative advantage from the group mean. RLVR drops the learned reward
// model and takes reward from a verifier. Show a group of 4 answers, the group
// mean, and each answer's advantage (r - mean) / std.
export default function GrpoRlvrViz({ onNavigate, spec } = {}) {
  const [method, setMethod] = useState("grpo"); // ppo | grpo | rlvr
  const [rewardSrc, setRewardSrc] = useState("verifier"); // rm | verifier

  // A group of 4 sampled answers to one prompt.
  // Learned RM gives a soft score; verifier gives a hard pass/fail (1/0).
  const GROUP = [
    { id: "a1", text: "12 (correct, clean steps)", rm: 0.82, pass: 1 },
    { id: "a2", text: "12 (correct, terse)", rm: 0.54, pass: 1 },
    { id: "a3", text: "11 (off-by-one)", rm: 0.30, pass: 0 },
    { id: "a4", text: "14 (wrong method)", rm: 0.12, pass: 0 },
  ];

  const useVerifier = rewardSrc === "verifier";
  const rewards = GROUP.map((g) => (useVerifier ? g.pass : g.rm));
  const mean = rewards.reduce((s, r) => s + r, 0) / rewards.length;
  const variance =
    rewards.reduce((s, r) => s + (r - mean) ** 2, 0) / rewards.length;
  const std = Math.sqrt(variance) || 1e-6;
  const adv = rewards.map((r) => (r - mean) / std);

  // Model roster per method.
  const MODELS = {
    ppo: [
      { name: "policy", keep: true, note: "the model being trained" },
      { name: "reference", keep: true, note: "KL anchor" },
      { name: "reward model", keep: true, note: "learned scorer" },
      { name: "critic (value)", keep: true, note: "estimates baseline per token" },
    ],
    grpo: [
      { name: "policy", keep: true, note: "the model being trained" },
      { name: "reference", keep: true, note: "KL anchor" },
      { name: "reward model", keep: true, note: "learned scorer" },
      { name: "critic (value)", keep: false, note: "dropped — baseline is the group mean" },
    ],
    rlvr: [
      { name: "policy", keep: true, note: "the model being trained" },
      { name: "reference", keep: true, note: "KL anchor" },
      { name: "reward model", keep: false, note: "dropped — a verifier gives reward" },
      { name: "critic (value)", keep: false, note: "dropped — baseline is the group mean" },
    ],
  };

  // ---- styling helpers (GSL monochrome instrument standard) ----
  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  };
  const label = { fontSize: "0.7rem", color: "#a1a1aa", letterSpacing: "0.02em" };
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

  const pill = (active, color) => ({
    ...mono,
    fontSize: "0.72rem",
    padding: "0.3rem 0.7rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: `1px solid ${active ? color : "var(--border, #27272a)"}`,
    background: active ? "var(--surface-2, #1f1f23)" : "transparent",
    color: active ? color : "#a1a1aa",
  });

  const groupless = method !== "ppo"; // GRPO + RLVR use the group-mean baseline
  const verifierForced = method === "rlvr"; // RLVR's reward is always the verifier

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
          PPO vs GRPO vs RLVR
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Each step drops a model. GRPO removes the critic; RLVR also removes the
          learned reward model. The baseline becomes the group mean.
        </div>
      </div>

      {/* method toggle */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Method</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setMethod("ppo")} style={pill(method === "ppo", "#e4e4e7")}>
            PPO
          </button>
          <button onClick={() => setMethod("grpo")} style={pill(method === "grpo", CYAN)}>
            GRPO
          </button>
          <button
            onClick={() => {
              setMethod("rlvr");
              setRewardSrc("verifier");
            }}
            style={pill(method === "rlvr", CYAN)}
          >
            RLVR
          </button>
        </div>

        {/* model roster */}
        <div style={{ marginTop: "0.8rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {MODELS[method].map((m) => (
            <div
              key={m.name}
              style={{
                ...card,
                background: "var(--surface-2, #1f1f23)",
                padding: "0.6rem 0.7rem",
                opacity: m.keep ? 1 : 0.5,
                borderColor: m.keep ? "var(--border, #27272a)" : "var(--border, #27272a)",
                borderStyle: m.keep ? "solid" : "dashed",
              }}
            >
              <div
                style={{
                  ...mono,
                  fontSize: "0.8rem",
                  color: m.keep ? "#fafafa" : "#71717a",
                  textDecoration: m.keep ? "none" : "line-through",
                }}
              >
                {m.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: m.keep ? "#a1a1aa" : "#71717a" }}>
                {m.note}
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...mono, fontSize: "0.7rem", color: "#a1a1aa", marginTop: "0.6rem" }}>
          active models:{" "}
          <span style={{ color: CYAN }}>
            {MODELS[method].filter((m) => m.keep).length}
          </span>{" "}
          / 4
        </div>
      </div>

      {/* reward source */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Reward source</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => !verifierForced && setRewardSrc("rm")}
            style={{ ...pill(!useVerifier, "#e4e4e7"), opacity: verifierForced ? 0.4 : 1, cursor: verifierForced ? "not-allowed" : "pointer" }}
          >
            learned reward model
          </button>
          <button onClick={() => setRewardSrc("verifier")} style={pill(useVerifier, GREEN)}>
            verifier / rule
          </button>
        </div>
        <div style={{ ...mono, fontSize: "0.7rem", color: "#a1a1aa", marginTop: "0.5rem" }}>
          {useVerifier
            ? "verifier gives a hard pass (1) or fail (0) — no learned scorer, no reward hacking of a soft signal."
            : "learned RM gives a soft, continuous score — flexible but gameable."}
          {verifierForced && (
            <span style={{ color: CYAN }}> RLVR fixes reward to the verifier.</span>
          )}
        </div>
      </div>

      {/* group + advantages */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.6rem" }}>
          Group of {GROUP.length} sampled answers · advantage = (r − mean) / std
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {GROUP.map((g, i) => {
            const a = adv[i];
            const good = a >= 0;
            return (
              <div
                key={g.id}
                style={{
                  ...card,
                  background: "var(--surface-2, #1f1f23)",
                  padding: "0.6rem 0.7rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ ...mono, fontSize: "0.66rem", color: "#71717a", width: 26 }}>
                  {g.id}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#e4e4e7", flex: 1 }}>{g.text}</span>
                <span style={{ ...mono, fontSize: "0.72rem", color: "#a1a1aa", width: 64, textAlign: "right" }}>
                  r={useVerifier ? g.pass.toFixed(0) : g.rm.toFixed(2)}
                </span>
                {/* advantage bar, centred at zero */}
                <div style={{ width: 120, position: "relative", height: 16 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: "#52525b",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      height: 10,
                      background: good ? GREEN : RED,
                      borderRadius: 2,
                      left: good ? "50%" : `${50 - Math.min(50, Math.abs(a) * 22)}%`,
                      width: `${Math.min(50, Math.abs(a) * 22)}%`,
                    }}
                  />
                </div>
                <span
                  style={{
                    ...mono,
                    fontSize: "0.74rem",
                    color: good ? GREEN : RED,
                    width: 52,
                    textAlign: "right",
                  }}
                >
                  {a >= 0 ? "+" : ""}
                  {a.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="gsl-viz-grid-3"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.75rem",
            marginTop: "0.8rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.68rem", color: "#71717a" }}>group mean (baseline)</div>
            <div style={{ ...mono, fontSize: "1.05rem", color: groupless ? CYAN : "#a1a1aa" }}>
              {mean.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#71717a" }}>group std</div>
            <div style={{ ...mono, fontSize: "1.05rem", color: "#e4e4e7" }}>{std.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#71717a" }}>baseline from</div>
            <div style={{ ...mono, fontSize: "0.85rem", color: "#e4e4e7" }}>
              {groupless ? "group mean" : "learned critic"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>The trade</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          {method === "ppo" &&
            "PPO trains a separate critic to estimate the baseline — accurate, but it doubles the models in memory and adds its own training instability."}
          {method === "grpo" &&
            "GRPO drops the critic: sample a group, take the group mean as the baseline, and normalise by the group std. Fewer models, no value network to train."}
          {method === "rlvr" &&
            "RLVR drops the learned reward model too: a verifier gives a hard pass/fail. No soft signal to hack, and the group mean still supplies the baseline — leanest of the three, but needs a checkable answer."}
        </div>
      </div>
    </div>
  );
}
