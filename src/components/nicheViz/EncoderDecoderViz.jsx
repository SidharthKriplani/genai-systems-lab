import { useState } from "react";

// Encoder vs decoder vs encoder-decoder: the difference IS the attention mask.
// Pick a masking mode and watch which tokens each position can attend to;
// pick a task and see which family fits.
export default function EncoderDecoderViz({ onNavigate, spec } = {}) {
  const [mode, setMode] = useState("encoder"); // encoder | decoder | cross
  const [task, setTask] = useState(null);

  const TOKENS = ["the", "cat", "sat", "on", "mat"];
  const SRC = ["le", "chat", "assis"]; // for cross-attention (encoder side)
  const n = TOKENS.length;

  // Can query row i attend to key col j?
  const allowed = (i, j) => {
    if (mode === "encoder") return true; // bidirectional: everyone sees everyone
    if (mode === "decoder") return j <= i; // causal: look left + self only
    return true; // cross: each output token attends to every source token
  };

  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

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

  const MODES = {
    encoder: {
      title: "Encoder-only (BERT)",
      sub: "bidirectional — every token attends to every token",
      obj: "Objective: Masked Language Modeling (mask ~15%, predict from both sides)",
      family: "encoder",
    },
    decoder: {
      title: "Decoder-only (GPT)",
      sub: "causal — a token attends only to itself and tokens on its left",
      obj: "Objective: next-token prediction (natively generative)",
      family: "decoder",
    },
    cross: {
      title: "Encoder-decoder (T5 / BART)",
      sub: "cross-attention — each output token attends into the whole encoded source",
      obj: "Objective: span-corruption / denoising (seq2seq)",
      family: "encoder-decoder",
    },
  };

  const TASKS = [
    { name: "Ticket classification", fit: "encoder", why: "understanding, no generation -> encoder-only" },
    { name: "Named-entity recognition", fit: "encoder", why: "token/span labeling -> encoder-only" },
    { name: "Retrieval embeddings", fit: "encoder", why: "one dense vector per text -> encoder-only" },
    { name: "Open-ended chat", fit: "decoder", why: "free generation, one-model-for-all -> decoder-only" },
    { name: "Story / code completion", fit: "decoder", why: "continue the text -> decoder-only" },
    { name: "FR->EN translation", fit: "encoder-decoder", why: "read all of A, write B -> encoder-decoder" },
    { name: "Summarization", fit: "encoder-decoder", why: "distinct input -> distinct output -> encoder-decoder" },
  ];

  const m = MODES[mode];
  const cell = 34;
  const gridW = cell * (n + 1);

  const taskObj = task != null ? TASKS[task] : null;
  const taskMatches = taskObj && taskObj.fit === m.family;

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
          Attention masks: the one difference between the families
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Same transformer block. What each token is allowed to see — plus the
          pretraining objective — is the whole story.
        </div>
      </div>

      {/* mode selector */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button onClick={() => setMode("encoder")} style={pill(mode === "encoder", CYAN)}>
          encoder-only (BERT)
        </button>
        <button onClick={() => setMode("decoder")} style={pill(mode === "decoder", CYAN)}>
          decoder-only (GPT)
        </button>
        <button onClick={() => setMode("cross")} style={pill(mode === "cross", CYAN)}>
          encoder-decoder (T5/BART)
        </button>
      </div>

      {/* mask grid */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.2rem" }}>
          {mode === "cross" ? "Cross-attention: output rows attend into source columns" : "Rows = query token · columns = key token · filled = can attend"}
        </div>
        <div style={{ color: CYAN, fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.6rem" }}>
          {m.title}
          <span style={{ color: "#a1a1aa", fontWeight: 400, fontSize: "0.78rem" }}> — {m.sub}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox={`0 0 ${gridW + 8} ${gridW + 8}`} style={{ width: "100%", height: "auto", maxWidth: gridW + 8 }}>
            {/* column headers */}
            {(mode === "cross" ? SRC.concat(["", ""]) : TOKENS).slice(0, n).map((t, j) => (
              <text
                key={"c" + j}
                x={cell * (j + 1) + cell / 2}
                y={cell - 12}
                fill="#71717a"
                fontSize="10"
                textAnchor="middle"
                style={mono}
              >
                {mode === "cross" ? (SRC[j] || "·") : t}
              </text>
            ))}
            {/* row headers + cells */}
            {TOKENS.map((rt, i) => (
              <g key={"r" + i}>
                <text
                  x={cell - 6}
                  y={cell * (i + 1) + cell / 2 + 4}
                  fill="#71717a"
                  fontSize="10"
                  textAnchor="end"
                  style={mono}
                >
                  {rt}
                </text>
                {Array.from({ length: n }, (_, j) => {
                  const on = allowed(i, j);
                  const diag = mode !== "cross" && i === j;
                  return (
                    <rect
                      key={j}
                      x={cell * (j + 1) + 2}
                      y={cell * (i + 1) + 2}
                      width={cell - 4}
                      height={cell - 4}
                      rx={4}
                      fill={on ? "var(--surface-2, #1f1f23)" : "transparent"}
                      stroke={on ? (diag ? CYAN : "#3f3f46") : "var(--border, #27272a)"}
                    />
                  );
                })}
                {Array.from({ length: n }, (_, j) =>
                  allowed(i, j) ? (
                    <circle
                      key={"d" + j}
                      cx={cell * (j + 1) + cell / 2}
                      cy={cell * (i + 1) + cell / 2}
                      r={4}
                      fill={mode !== "cross" && i === j ? CYAN : "#a1a1aa"}
                    />
                  ) : null
                )}
              </g>
            ))}
          </svg>
        </div>

        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.3rem" }}>
          {mode === "encoder" && "Full square: past AND future visible. Cannot naturally generate (no left-to-right)."}
          {mode === "decoder" && "Lower triangle only: each token sees itself + its left. Generation = repeat next-token."}
          {mode === "cross" && "Encoder reads source bidirectionally; decoder writes left-to-right while attending back here."}
        </div>
        <div style={{ ...label, marginTop: "0.5rem", color: GREEN }}>{m.obj}</div>
      </div>

      {/* task -> family */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          Pick a task — which family fits?
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.7rem" }}>
          {TASKS.map((t, i) => (
            <button key={i} onClick={() => setTask(i)} style={pill(task === i, CYAN)}>
              {t.name}
            </button>
          ))}
        </div>
        {taskObj && (
          <div
            style={{
              ...mono,
              fontSize: "0.78rem",
              padding: "0.6rem 0.7rem",
              borderRadius: "0.5rem",
              background: "var(--surface-2, #1f1f23)",
              border: `1px solid ${taskMatches ? GREEN : RED}`,
              color: "#d4d4d8",
            }}
          >
            <span style={{ color: taskMatches ? GREEN : RED }}>
              best fit: {taskObj.fit}
            </span>
            {" — "}
            {taskObj.why}
            <div style={{ color: taskMatches ? GREEN : "#a1a1aa", marginTop: "0.3rem" }}>
              {taskMatches
                ? "matches the mask you have selected above."
                : `you have "${m.family}" selected — switch modes to see the fit light up green.`}
            </div>
          </div>
        )}
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>The takeaway</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          Bidirectional + MLM understands (BERT). Causal + next-token generates
          (GPT). Bidirectional encoder + causal, cross-attending decoder + denoising
          transforms (T5/BART). Decoder-only can do all three at scale, which is why
          it won the platform — but a fine-tuned encoder stays smaller and faster for
          its specialty.
        </div>
      </div>
    </div>
  );
}
