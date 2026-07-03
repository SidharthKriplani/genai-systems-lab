import { useState } from "react";

// On-device memory-fit calculator. Weights bytes = params × bytes-per-param.
// Watch the model bar cross (or clear) a device RAM budget.
export default function EdgeInferenceViz({ onNavigate, spec } = {}) {
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

  const QUANTS = [
    { key: "fp16", label: "fp16", bytes: 2 },
    { key: "int8", label: "int8", bytes: 1 },
    { key: "int4", label: "int4", bytes: 0.5 },
  ];

  const [params, setParams] = useState(7); // billions
  const [quantKey, setQuantKey] = useState("int4");
  const [budgetGB, setBudgetGB] = useState(8); // device RAM allotted to weights

  const quant = QUANTS.find((q) => q.key === quantKey);
  // weights memory in GB: params(B) × bytes/param ; 1e9 params × bytes / 1e9 = GB
  const modelGB = params * quant.bytes;
  const fits = modelGB <= budgetGB;

  // fp32 reference for the "int4 ≈ 8× smaller" line (fp32 = 4 bytes)
  const fp32GB = params * 4;
  const shrink = Math.round(fp32GB / modelGB);

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

  const verdictColor = fits ? GREEN : RED;

  const qBtn = (active) => ({
    ...mono,
    fontSize: "0.75rem",
    padding: "0.35rem 0.7rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: `1px solid ${active ? CYAN : "var(--border, #27272a)"}`,
    background: active ? "var(--surface-2, #1f1f23)" : "transparent",
    color: active ? CYAN : "#a1a1aa",
  });

  // scale bar to whichever is bigger so both stay visible
  const scale = Math.max(modelGB, budgetGB) * 1.1;

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
          Will it fit on-device?
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Weights memory = params × bytes-per-param. Set the model and
          quantization, then check it against the RAM you can spare.
        </div>
      </div>

      {/* verdict */}
      <div style={{ ...card, borderLeft: `2px solid ${verdictColor}` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={label}>model weights</span>
          <span style={{ ...mono, fontSize: "1.6rem", color: verdictColor }}>
            {modelGB % 1 === 0 ? modelGB : modelGB.toFixed(1)} GB
          </span>
        </div>
        <div style={{ ...mono, fontSize: "0.8rem", color: verdictColor, marginTop: "0.15rem" }}>
          {fits ? "fits" : "won't fit"} ·{" "}
          <span style={{ color: "#a1a1aa" }}>
            {fits
              ? `${(budgetGB - modelGB).toFixed(1)} GB of the ${budgetGB} GB budget left`
              : `needs ${(modelGB - budgetGB).toFixed(1)} GB more than the ${budgetGB} GB budget`}
          </span>
        </div>

        {/* model bar vs budget line */}
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
          <div
            style={{
              width: `${(modelGB / scale) * 100}%`,
              height: "100%",
              background: fits ? "#71717a" : RED,
            }}
            title={`model ${modelGB} GB`}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(budgetGB / scale) * 100}%`,
              width: 2,
              background: "#fafafa",
            }}
            title={`budget ${budgetGB} GB`}
          />
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.3rem" }}>
          white line = {budgetGB} GB device budget
        </div>
      </div>

      {/* params slider */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.35rem",
          }}
        >
          <span style={{ fontWeight: 600 }}>model size</span>
          <span style={{ ...mono, color: "#fafafa" }}>{params} B params</span>
        </div>
        <input
          type="range"
          min={1}
          max={70}
          step={1}
          value={params}
          onChange={(e) => setParams(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />
      </div>

      {/* quantization picker */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.4rem" }}>
          quantization — bytes per parameter
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {QUANTS.map((q) => (
            <button
              key={q.key}
              onClick={() => setQuantKey(q.key)}
              style={qBtn(q.key === quantKey)}
            >
              {q.label} · {q.bytes}B/param
            </button>
          ))}
        </div>
      </div>

      {/* budget slider */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.35rem",
          }}
        >
          <span style={{ fontWeight: 600 }}>device RAM budget</span>
          <span style={{ ...mono, color: "#fafafa" }}>{budgetGB} GB</span>
        </div>
        <input
          type="range"
          min={2}
          max={32}
          step={1}
          value={budgetGB}
          onChange={(e) => setBudgetGB(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />
        <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "0.3rem" }}>
          weights only — the KV cache and activations eat more on top at runtime.
        </div>
      </div>

      <div
        style={{
          ...card,
          borderLeft: `2px solid ${CYAN}`,
          fontSize: "0.82rem",
          color: "#d4d4d8",
        }}
      >
        llama.cpp (GGUF) and MLX (Apple silicon) are the on-device runtimes that
        make this practical. Quantization is the lever: int4 ≈{" "}
        <span style={{ ...mono, color: CYAN }}>{shrink}×</span> smaller than fp32
        (0.5 vs 4 bytes/param) — the difference between a model that runs on the
        phone and one that doesn't.
      </div>
    </div>
  );
}
