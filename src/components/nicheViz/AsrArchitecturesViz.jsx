import { useState } from "react";

// Monochrome instrument. Accents: cyan (var(--gal-build)), emerald (fast/yes), red (slow/no).
export default function AsrArchitecturesViz({ onNavigate, spec } = {}) {
  const [arch, setArch] = useState("rnnt");

  // Round, illustrative numbers.
  const ARCH = {
    ctc: {
      name: "CTC",
      full: "Connectionist Temporal Classification",
      streaming: true,
      context: false, // frame-independent, no output-side language model
      wer: 9, // %
      latency: 200, // ms
      note: "Frame-level, conditionally independent outputs. Streams cheaply but ignores output context, so WER lags.",
    },
    rnnt: {
      name: "RNN-T",
      full: "RNN Transducer",
      streaming: true,
      context: true, // prediction network conditions on prior outputs
      wer: 6,
      latency: 300,
      note: "Prediction network conditions on emitted tokens. The streaming default: low latency with real context.",
    },
    whisper: {
      name: "Whisper / AED",
      full: "Attention Encoder-Decoder",
      streaming: false, // needs the whole utterance
      context: true, // full bidirectional attention
      wer: 4,
      latency: 1500,
      note: "Full-utterance attention. Highest accuracy, but offline — it needs the whole clip before decoding.",
    },
  };

  const a = ARCH[arch];

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
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
    border: on ? "1px solid var(--gal-build)" : "1px solid var(--border)",
    background: on ? "var(--surface-2)" : "transparent",
    color: on ? "#e4e4e7" : "#a1a1aa",
  });

  const yesNo = (v) => (
    <span style={{ ...mono, fontSize: 14, color: v ? "#6ee7b7" : "#f87171" }}>{v ? "yes" : "no"}</span>
  );

  // Bars: lower WER = better (green), lower latency = better.
  // Normalise against worst case across archs.
  const maxWer = 10;
  const maxLat = 1600;
  const werColor = a.wer <= 5 ? "#6ee7b7" : a.wer <= 7 ? "#e4e4e7" : "#f87171";
  const latColor = a.latency <= 400 ? "#6ee7b7" : a.latency <= 800 ? "#e4e4e7" : "#f87171";

  return (
    <div style={{ color: "#e4e4e7", fontSize: 13, maxWidth: 640 }}>
      <div style={{ ...label, marginBottom: 4 }}>ASR architectures</div>
      <div style={{ color: "#a1a1aa", marginBottom: 14, fontSize: 12 }}>
        Speech recognition trades streaming, context, accuracy and latency.
        Pick an architecture to see where it sits.
      </div>

      {/* Selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button style={btn(arch === "ctc")} onClick={() => setArch("ctc")}>CTC</button>
        <button style={btn(arch === "rnnt")} onClick={() => setArch("rnnt")}>RNN-T</button>
        <button style={btn(arch === "whisper")} onClick={() => setArch("whisper")}>Whisper / AED</button>
      </div>

      {/* Header */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ ...mono, fontSize: 16, color: "#e4e4e7" }}>{a.name}</div>
        <div style={{ fontSize: 12, color: "#71717a" }}>{a.full}</div>
        <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 8 }}>{a.note}</div>
      </div>

      {/* Capability grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={card}>
          <div style={label}>Streaming-capable</div>
          <div style={{ marginTop: 4 }}>{yesNo(a.streaming)}</div>
          <div style={{ ...mono, fontSize: 11, color: "#71717a", marginTop: 2 }}>
            {a.streaming ? "emits as audio arrives" : "needs full utterance"}
          </div>
        </div>
        <div style={card}>
          <div style={label}>Context-aware</div>
          <div style={{ marginTop: 4 }}>{yesNo(a.context)}</div>
          <div style={{ ...mono, fontSize: 11, color: "#71717a", marginTop: 2 }}>
            {a.context ? "conditions on prior tokens" : "frame-independent outputs"}
          </div>
        </div>
      </div>

      {/* Accuracy vs latency */}
      <div style={card}>
        <div style={{ ...label, marginBottom: 8 }}>Accuracy vs latency</div>

        <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 11, color: "#a1a1aa" }}>
          <span>WER (lower is better)</span>
          <span style={{ color: werColor }}>{a.wer}%</span>
        </div>
        <div style={{ height: 10, background: "var(--surface-2)", borderRadius: 5, overflow: "hidden", margin: "4px 0 10px", border: "1px solid var(--border)" }}>
          <div style={{ width: `${(a.wer / maxWer) * 100}%`, height: "100%", background: werColor }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 11, color: "#a1a1aa" }}>
          <span>Latency (lower is better)</span>
          <span style={{ color: latColor }}>{a.latency} ms</span>
        </div>
        <div style={{ height: 10, background: "var(--surface-2)", borderRadius: 5, overflow: "hidden", marginTop: 4, border: "1px solid var(--border)" }}>
          <div style={{ width: `${(a.latency / maxLat) * 100}%`, height: "100%", background: latColor }} />
        </div>
      </div>

      <div style={{ ...mono, fontSize: 11, color: "#71717a", marginTop: 12 }}>
        {arch === "whisper"
          ? "Whisper/AED: offline, highest accuracy."
          : arch === "rnnt"
          ? "RNN-T: the streaming default."
          : "CTC: cheapest streaming, weakest context."}
      </div>
    </div>
  );
}
