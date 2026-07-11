import { useState } from "react";

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

const PROMPT = "A user asks: how do I reset my password?";
const CHOSEN =
  "Go to Settings > Security > Reset password. You'll get an email link that expires in 15 minutes.";
const REJECTED = "Just Google it, it's not that hard.";

const METHODS = [
  {
    id: "sft",
    name: "SFT",
    tag: "supervised fine-tune",
    line: "Imitate the preferred answer. Copy the good one, ignore the bad one.",
    needsReward: false,
    usesRejected: false,
  },
  {
    id: "rlhf",
    name: "RLHF",
    tag: "reward model + PPO",
    line: "Train a separate reward model on the pair, then optimize the policy against it with PPO.",
    needsReward: true,
    usesRejected: true,
  },
  {
    id: "dpo",
    name: "DPO",
    tag: "direct preference",
    line: "Skip the reward model — directly push preferred above rejected in one loss.",
    needsReward: false,
    usesRejected: true,
  },
];

export default function PreferenceAlignViz({ onNavigate, spec } = {}) {
  const [method, setMethod] = useState("dpo");
  const [beta, setBeta] = useState(7);

  const m = METHODS.find((x) => x.id === method);

  // beta is the KL-penalty coefficient: HIGH beta = strong penalty = policy stays
  // close to the reference model (gentle/conservative). LOW beta = weak penalty =
  // policy is free to drift far toward the reward signal (aggressive, higher risk
  // of reward-hacking / quality collapse). "divergence" below is the inverse of
  // beta — how far the policy is effectively allowed to move from the reference.
  const divergence = 11 - beta;
  // Alignment: rises as divergence rises (i.e. as beta drops / gets more aggressive), saturating.
  const alignment = Math.round(100 * (1 - Math.exp(-divergence / 3)));
  // Capability: flat while beta keeps the policy near the reference, then falls once
  // beta drops below the knee and the policy over-optimizes against the reward.
  const knee = 5;
  const tax = beta >= knee ? 0 : (knee - beta) * 9;
  const capability = Math.max(30, 100 - tax);
  const overOpt = beta < knee;

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
          Aligning to a preference pair
        </div>
        <div style={{ color: "var(--zinc-400, #a1a1aa)", marginTop: 4 }}>
          Same signal — one answer humans preferred over another. Three ways to
          learn from it.
        </div>
      </div>

      {/* The pair */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...mono, fontSize: 12, color: "var(--zinc-400, #a1a1aa)", marginBottom: 10 }}>
          {PROMPT}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Answer label="preferred" text={CHOSEN} good />
          <Answer label="rejected" text={REJECTED} good={false} />
        </div>
      </div>

      {/* Method selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {METHODS.map((x) => {
          const on = x.id === method;
          return (
            <button
              key={x.id}
              onClick={() => setMethod(x.id)}
              style={{
                flex: 1,
                cursor: "pointer",
                padding: "10px 8px",
                borderRadius: 10,
                border: on ? "1px solid var(--gal-build)" : "1px solid var(--border)",
                background: on ? "var(--gal-build-tint)" : "var(--surface)",
                color: on ? "var(--gal-build)" : "var(--zinc-400, #a1a1aa)",
                textAlign: "center",
              }}
            >
              <div style={{ ...mono, fontWeight: 700, fontSize: 14 }}>{x.name}</div>
              <div style={{ fontSize: 10, marginTop: 2, opacity: 0.85 }}>{x.tag}</div>
            </button>
          );
        })}
      </div>

      {/* Method explanation + pipeline */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ fontSize: 13, marginBottom: 12 }}>{m.line}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Stage label="preference pair" on />
          <Arrow />
          <Stage label="reward model" on={m.needsReward} dim={!m.needsReward} />
          {m.needsReward && <Arrow />}
          <Stage
            label={m.needsReward ? "PPO update" : m.usesRejected ? "preference loss" : "copy preferred"}
            on
          />
          <Arrow />
          <Stage label="aligned policy" on />
        </div>
        {!m.needsReward && (
          <div style={{ fontSize: 11, color: "var(--zinc-400, #a1a1aa)", marginTop: 10 }}>
            {m.id === "dpo"
              ? "No separate reward model to train, tune, or keep in memory — the preference is baked into the loss."
              : "Only the preferred answer is used as a plain target — the rejected one is discarded."}
          </div>
        )}
      </div>

      {method !== "sft" ? (
        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label style={{ fontSize: 12, color: "var(--zinc-400, #a1a1aa)" }}>
              KL-penalty strength (beta)
            </label>
            <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: "var(--gal-build)" }}>
              {beta}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
            style={{ width: "100%", marginTop: 10, accentColor: "var(--gal-build)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--zinc-400, #a1a1aa)", ...mono }}>
            <span>low beta — aggressive (large policy shift)</span>
            <span>high beta — gentle (stays close to reference)</span>
          </div>

          <div style={{ fontSize: 11, color: "var(--zinc-400, #a1a1aa)", marginTop: 10, lineHeight: 1.5 }}>
            Beta sets how hard the KL penalty pulls the policy back toward the frozen reference model.
            <strong> Alignment</strong> below is roughly how far the policy has shifted toward the
            preferred behavior; <strong>general capability</strong> is roughly how much of the base
            model's broader ability survives that shift. There's a transition point (a "knee") around
            beta ≈ 5: above it the penalty is strong enough to keep capability intact, below it the
            policy is optimizing hard enough against the reward signal that capability starts to
            collapse — the reward-hacking risk in action.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <Meter label="alignment" value={alignment} color="var(--green, #34d399)" />
            <Meter
              label="general capability"
              value={capability}
              color={overOpt ? "var(--red, #f87171)" : "var(--border)"}
            />
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 12,
              border: `1px solid ${overOpt ? "var(--red, #f87171)" : "var(--border)"}`,
              background: overOpt ? "rgba(248,113,113,0.08)" : "var(--surface)",
              color: overOpt ? "var(--red, #f87171)" : "var(--zinc-400, #a1a1aa)",
              ...mono,
            }}
          >
            {overOpt
              ? `reward over-optimization: capability down ${100 - capability} points from letting beta run too low (too aggressive, drifting far from the reference) — a capability collapse, distinct from the over-refusal "alignment tax" in the prose`
              : "no reward over-optimization yet — beta is high enough to keep the policy close to the reference"}
          </div>
        </div>
      ) : (
        <div style={{ ...card, padding: 14 }}>
          <div style={{ fontSize: 12, color: "var(--zinc-400, #a1a1aa)", lineHeight: 1.5 }}>
            SFT has no KL-penalty knob to show here. It's plain imitation of the preferred answer —
            max-likelihood on a single target, no reward model, no reference model, and no{" "}
            <strong style={{ color: "var(--zinc-200, #e4e4e7)" }}>beta</strong> term to tune. That
            knob — and the alignment-vs-capability tradeoff it controls — only exists once training
            is against a preference signal, in DPO or RLHF. Switch tabs above to see it.
          </div>
        </div>
      )}
    </div>
  );
}

function Answer({ label, text, good }) {
  const c = good ? "var(--green, #34d399)" : "var(--red, #f87171)";
  return (
    <div
      style={{
        border: `1px solid ${good ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"}`,
        borderRadius: 10,
        padding: 10,
        background: "var(--surface)",
      }}
    >
      <div style={{ ...mono, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: c }}>
        {good ? "✓ " : "✗ "}
        {label}
      </div>
      <div style={{ fontSize: 12, marginTop: 6, color: "var(--zinc-200, #e4e4e7)" }}>{text}</div>
    </div>
  );
}

function Stage({ label, on, dim }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        fontSize: 11,
        fontFamily: "ui-monospace, monospace",
        border: on ? "1px solid var(--gal-build)" : "1px dashed var(--border)",
        background: on ? "var(--gal-build-tint)" : "transparent",
        color: on ? "var(--gal-build)" : "var(--zinc-400, #a1a1aa)",
        opacity: dim ? 0.4 : 1,
        textDecoration: dim ? "line-through" : "none",
      }}
    >
      {label}
    </div>
  );
}

function Arrow() {
  return (
    <span style={{ color: "var(--zinc-400, #a1a1aa)", fontFamily: "ui-monospace, monospace" }}>
      →
    </span>
  );
}

function Meter({ label, value, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, ...mono, color: "var(--zinc-400, #a1a1aa)" }}>
        <span>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: "var(--surface)", overflow: "hidden", marginTop: 4 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}
