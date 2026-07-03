import { useState } from "react";

// Compare the four common LLM serving stacks across the axes that actually
// decide the pick, then let a use-case choose the recommended one for you.
export default function ServingStacksViz({ onNavigate, spec } = {}) {
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";

  // scores are 1..5, higher = better on that axis
  const STACKS = [
    {
      key: "vllm",
      name: "vLLM",
      blurb: "paged-attention throughput workhorse",
      setup: 4,
      latency: 4,
      throughput: 5,
      flexibility: 4,
      note: "continuous batching + PagedKV. The default high-throughput serve.",
    },
    {
      key: "tgi",
      name: "TGI",
      blurb: "Hugging Face text-generation-inference",
      setup: 5,
      latency: 3,
      throughput: 4,
      flexibility: 3,
      note: "easiest to stand up — one container, wide model coverage.",
    },
    {
      key: "trt",
      name: "TensorRT-LLM",
      blurb: "compiled NVIDIA kernels",
      setup: 2,
      latency: 5,
      throughput: 5,
      flexibility: 2,
      note: "lowest latency once compiled — but the compile step is the cost.",
    },
    {
      key: "sglang",
      name: "SGLang",
      blurb: "RadixAttention + structured programs",
      setup: 3,
      latency: 4,
      throughput: 4,
      flexibility: 5,
      note: "prefix caching + rich control flow — the research/agent choice.",
    },
  ];

  const AXES = [
    { key: "setup", label: "ease of setup" },
    { key: "latency", label: "latency" },
    { key: "throughput", label: "throughput" },
    { key: "flexibility", label: "flexibility" },
  ];

  // each use-case names the axis it optimises and the winning stack
  const USE_CASES = [
    { key: "throughput", label: "max throughput", axis: "throughput", pick: "vllm" },
    { key: "latency", label: "lowest latency", axis: "latency", pick: "trt" },
    { key: "easy", label: "easiest to run", axis: "setup", pick: "tgi" },
    { key: "research", label: "research / agents", axis: "flexibility", pick: "sglang" },
  ];

  const [useCase, setUseCase] = useState(USE_CASES[0]);
  const rec = STACKS.find((s) => s.key === useCase.pick);

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

  const btn = (active) => ({
    ...mono,
    fontSize: "0.75rem",
    padding: "0.4rem 0.7rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: `1px solid ${active ? GREEN : "var(--border, #27272a)"}`,
    background: active ? "var(--surface-2, #1f1f23)" : "transparent",
    color: active ? GREEN : "#a1a1aa",
  });

  // bar of 5 cells, filled cells shade by whether this is the deciding axis
  function ScoreBar({ score, deciding, isRec }) {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = n <= score;
          const fill = deciding && isRec ? GREEN : deciding ? CYAN : "#71717a";
          return (
            <div
              key={n}
              style={{
                width: 14,
                height: 8,
                borderRadius: 2,
                background: on ? fill : "var(--surface-2, #1f1f23)",
                border: "1px solid var(--border, #27272a)",
              }}
            />
          );
        })}
      </div>
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
          Which serving stack?
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          vLLM · TGI · TensorRT-LLM · SGLang. Pick a use-case — the deciding
          axis lights up and the recommended stack is called out.
        </div>
      </div>

      {/* use-case picker */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {USE_CASES.map((u) => (
          <button
            key={u.key}
            onClick={() => setUseCase(u)}
            style={btn(u.key === useCase.key)}
          >
            {u.label}
          </button>
        ))}
      </div>

      {/* recommendation callout */}
      <div style={{ ...card, borderLeft: `2px solid ${GREEN}` }}>
        <span style={label}>recommended for {useCase.label}</span>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: "0.2rem",
          }}
        >
          <span style={{ ...mono, fontSize: "1.4rem", color: GREEN }}>
            {rec.name}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#71717a" }}>
            wins on {useCase.axis}
          </span>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#d4d4d8", marginTop: "0.3rem" }}>
          {rec.note}
        </div>
      </div>

      {/* comparison grid */}
      <div style={card}>
        <div
          style={{
            ...label,
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginBottom: "0.4rem",
          }}
        >
          <span style={{ color: "#71717a", fontSize: "0.62rem" }}>
            5 cells = better · deciding axis in colour
          </span>
        </div>
        {STACKS.map((s) => {
          const isRec = s.key === rec.key;
          return (
            <div
              key={s.key}
              style={{
                padding: "0.6rem 0",
                borderTop: "1px solid var(--border, #27272a)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "0.4rem",
                }}
              >
                <span>
                  <span
                    style={{
                      ...mono,
                      fontWeight: 600,
                      color: isRec ? GREEN : "#fafafa",
                    }}
                  >
                    {s.name}
                  </span>{" "}
                  <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
                    {s.blurb}
                  </span>
                </span>
                {isRec && (
                  <span style={{ ...mono, fontSize: "0.68rem", color: GREEN }}>
                    ← pick
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.4rem 1rem",
                }}
              >
                {AXES.map((ax) => {
                  const deciding = ax.key === useCase.axis;
                  return (
                    <div
                      key={ax.key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: deciding ? "#e4e4e7" : "#71717a",
                        }}
                      >
                        {ax.label}
                      </span>
                      <ScoreBar
                        score={s[ax.key]}
                        deciding={deciding}
                        isRec={isRec}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          ...card,
          borderLeft: `2px solid ${CYAN}`,
          fontSize: "0.82rem",
          color: "#d4d4d8",
        }}
      >
        Scaling past one GPU splits two ways: tensor parallelism shards each
        layer's matrices across GPUs (low latency, needs fast interconnect);
        pipeline parallelism puts whole layers on different GPUs (higher
        throughput, cheaper links, but adds bubble latency between stages).
      </div>
    </div>
  );
}
