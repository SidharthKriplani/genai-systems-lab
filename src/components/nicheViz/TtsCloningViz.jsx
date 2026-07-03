import { useState } from "react";

// Monochrome instrument. Accents: cyan (var(--gal-build)), emerald (ok/consent), red (risk).
export default function TtsCloningViz({ onNavigate, spec } = {}) {
  const [step, setStep] = useState(0); // 0..3 pipeline stage
  const [clone, setClone] = useState(false); // zero-shot clone from 3s reference
  const [realVoice, setRealVoice] = useState(true); // cloning a real person's voice
  const [consent, setConsent] = useState(false); // has documented consent

  const STAGES = [
    { key: "text", name: "Text", detail: "Normalized text + phonemes.", out: "the quick brown fox" },
    { key: "acoustic", name: "Acoustic model", detail: "Predicts a mel-spectrogram from phonemes.", out: "mel-spectrogram" },
    { key: "vocoder", name: "Vocoder", detail: "Turns the mel into raw samples.", out: "24 kHz waveform" },
    { key: "wave", name: "Waveform", detail: "Playable audio.", out: "audio out" },
  ];

  // Deepfake risk lights up when cloning a REAL voice without consent.
  const risk = clone && realVoice && !consent;

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
    border: "1px solid var(--border)",
    background: on ? "var(--surface-2)" : "transparent",
    color: on ? "#e4e4e7" : "#a1a1aa",
  });

  // Simple mel grid / waveform, purely decorative but stage-aware.
  const melCols = 24;

  return (
    <div style={{ color: "#e4e4e7", fontSize: 13, maxWidth: 640 }}>
      <div style={{ ...label, marginBottom: 4 }}>TTS + voice cloning</div>
      <div style={{ color: "#a1a1aa", marginBottom: 14, fontSize: 12 }}>
        Text-to-speech runs a pipeline: text → acoustic model (mel) → vocoder → waveform.
        Step through it, then try a zero-shot clone.
      </div>

      {/* Pipeline steps */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            style={{
              ...btn(i === step),
              borderColor: i <= step ? "var(--gal-build)" : "var(--border)",
              color: i === step ? "#e4e4e7" : i < step ? "var(--gal-build)" : "#a1a1aa",
            }}
            onClick={() => setStep(i)}
          >
            {i + 1}. {s.name}
          </button>
        ))}
      </div>

      {/* Stage detail */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ ...mono, fontSize: 15, color: "#e4e4e7" }}>{STAGES[step].name}</div>
        <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4 }}>{STAGES[step].detail}</div>

        {/* Stage-specific mini viz */}
        <div style={{ marginTop: 12, height: 44, display: "flex", alignItems: "center", gap: 2 }}>
          {step <= 0 && (
            <span style={{ ...mono, fontSize: 12, color: "var(--gal-build)" }}>{STAGES[0].out}</span>
          )}
          {step === 1 &&
            Array.from({ length: melCols }).map((_, c) => (
              <div
                key={c}
                style={{
                  flex: 1,
                  height: `${20 + 24 * Math.abs(Math.sin(c * 0.7 + 1))}px`,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 2,
                }}
              />
            ))}
          {step === 2 &&
            Array.from({ length: melCols }).map((_, c) => (
              <div
                key={c}
                style={{
                  flex: 1,
                  height: `${8 + 32 * Math.abs(Math.sin(c * 1.3))}px`,
                  background: "rgba(34,211,238,0.35)",
                  borderRadius: 2,
                }}
              />
            ))}
          {step >= 3 && (
            <svg viewBox="0 0 240 40" width="100%" height="40" preserveAspectRatio="none">
              <polyline
                points={Array.from({ length: 60 })
                  .map((_, i) => `${(i / 59) * 240},${20 + 16 * Math.sin(i * 0.6)}`)
                  .join(" ")}
                fill="none"
                stroke="var(--gal-build)"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </div>
        <div style={{ ...mono, fontSize: 11, color: "#71717a", marginTop: 4 }}>out: {STAGES[step].out}</div>
      </div>

      {/* Cloning controls */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ ...label, marginBottom: 8 }}>Zero-shot cloning</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button style={btn(clone)} onClick={() => setClone((v) => !v)}>
            {clone ? "cloning from 3s reference" : "default voice"}
          </button>
          <button
            style={{ ...btn(realVoice), opacity: clone ? 1 : 0.4 }}
            onClick={() => clone && setRealVoice((v) => !v)}
          >
            {realVoice ? "real person's voice" : "synthetic voice"}
          </button>
          <button
            style={{ ...btn(consent), opacity: clone && realVoice ? 1 : 0.4 }}
            onClick={() => clone && realVoice && setConsent((v) => !v)}
          >
            {consent ? "consent on file" : "no consent"}
          </button>
        </div>
        <div style={{ ...mono, fontSize: 11, color: "#71717a" }}>
          {clone
            ? "A 3-second reference conditions the acoustic model — no per-speaker training."
            : "Using the model's built-in voice."}
        </div>
      </div>

      {/* Consent / deepfake flag */}
      <div
        style={{
          ...card,
          borderColor: risk ? "rgba(248,113,113,0.6)" : consent && clone && realVoice ? "rgba(16,185,129,0.5)" : "var(--border)",
        }}
      >
        <div
          style={{
            ...label,
            color: risk ? "#f87171" : consent && clone && realVoice ? "#6ee7b7" : "#a1a1aa",
          }}
        >
          Consent / deepfake risk
        </div>
        <div
          style={{
            ...mono,
            fontSize: 12,
            marginTop: 4,
            color: risk ? "#f87171" : consent && clone && realVoice ? "#6ee7b7" : "#71717a",
          }}
        >
          {risk
            ? "flag raised — cloning a real voice without documented consent is a deepfake risk"
            : consent && clone && realVoice
            ? "cleared — consent on file for this real voice"
            : "no cloning risk — synthetic or default voice"}
        </div>
      </div>
    </div>
  );
}
