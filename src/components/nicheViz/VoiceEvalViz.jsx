import { useState } from "react";

// Word error rate on a reference vs hypothesis transcript.
// Aligns the two, counts substitutions / insertions / deletions, and reports
// WER = (S+I+D)/N. A toggle swaps one word for a fluent-but-wrong one to show
// WER catching a meaning error — and a MOS scale for what WER can't measure.
export default function VoiceEvalViz({ onNavigate, spec } = {}) {
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

  const reference = ["please", "transfer", "five", "hundred", "to", "my", "savings"];

  // Two hypotheses. "clean" has a few asr slips. "meaning" swaps one word for a
  // fluent, correctly-spelled word that changes the meaning entirely.
  const HYPS = {
    clean: {
      name: "typical ASR errors",
      words: ["please", "transfer", "five", "hundred", "to", "savings"],
      // aligned to reference; ops per reference position (null = correct)
      // ref:  please transfer five hundred to my   savings
      // hyp:  please transfer five hundred to  —    savings   (my deleted)
      ops: [null, null, null, null, null, "D", null],
    },
    meaning: {
      name: "fluent but wrong",
      words: ["please", "transfer", "five", "thousand", "to", "my", "savings"],
      // "hundred" -> "thousand": one substitution, everything else correct.
      ops: [null, null, null, "S", null, null, null],
    },
  };

  const [mode, setMode] = useState("clean");
  const [mos, setMos] = useState(4);

  const hyp = HYPS[mode];
  const N = reference.length;
  const S = hyp.ops.filter((o) => o === "S").length;
  const D = hyp.ops.filter((o) => o === "D").length;
  const I = hyp.ops.filter((o) => o === "I").length;
  const wer = (S + I + D) / N;

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

  const chip = (text, color, strike) => ({
    ...mono,
    display: "inline-block",
    padding: "0.2rem 0.45rem",
    margin: "0.15rem",
    borderRadius: "0.35rem",
    fontSize: "0.8rem",
    background: "var(--surface-2, #1f1f23)",
    border: `1px solid ${color === "#a1a1aa" ? "var(--border, #27272a)" : color}`,
    color,
    textDecoration: strike ? "line-through" : "none",
  });

  const OP_COLOR = { S: RED, D: RED, I: RED };
  const opLabel = (o) =>
    o === "S" ? "sub" : o === "D" ? "del" : o === "I" ? "ins" : "";

  return (
    <div style={{ color: "#e4e4e7", maxWidth: 760, margin: "0 auto", display: "flex",
      flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: 1.5 }}>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}>
          Word error rate, and what it misses
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Align the hypothesis to the reference, count the edits, divide by the
          number of reference words.
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.72rem", color: "#71717a" }}>hypothesis:</span>
        {Object.keys(HYPS).map((k) => (
          <button key={k} onClick={() => setMode(k)} style={btn(mode === k, k === "meaning" ? RED : CYAN)}>
            {HYPS[k].name}
          </button>
        ))}
      </div>

      {/* reference */}
      <div style={card}>
        <div style={{ fontSize: "0.7rem", color: "#a1a1aa", marginBottom: "0.3rem" }}>
          reference (ground truth)
        </div>
        <div>
          {reference.map((w, i) => {
            const op = hyp.ops[i];
            const bad = op === "S" || op === "D";
            return <span key={i} style={chip(w, bad ? RED : "#a1a1aa", op === "D")}>{w}</span>;
          })}
        </div>
        <div style={{ fontSize: "0.7rem", color: "#a1a1aa", margin: "0.6rem 0 0.3rem" }}>
          hypothesis (recognized)
        </div>
        <div>
          {hyp.words.map((w, i) => {
            // in "meaning" mode the hypothesis aligns 1:1, so a positional
            // mismatch is exactly the substituted word.
            const wrong = mode === "meaning" ? reference[i] !== w : false;
            return <span key={i} style={chip(w, wrong ? RED : "#e4e4e7", false)}>{w}</span>;
          })}
        </div>
        <div style={{ ...mono, fontSize: "0.7rem", color: "#71717a", marginTop: "0.4rem" }}>
          edits:{" "}
          {hyp.ops.map((o, i) => (o ? `${opLabel(o)}@${i + 1}` : null)).filter(Boolean).join(", ") || "none"}
        </div>
      </div>

      {/* the count + formula */}
      <div style={{ ...card, borderLeft: `2px solid ${wer > 0 ? RED : GREEN}` }}>
        <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", alignItems: "baseline" }}>
          {[["S", S, "substitutions"], ["I", I, "insertions"], ["D", D, "deletions"], ["N", N, "ref words"]].map(
            ([sym, val, name]) => (
              <div key={sym}>
                <span style={{ ...mono, fontSize: "1.3rem", color: sym === "N" ? "#fafafa" : val > 0 ? RED : "#71717a" }}>
                  {sym}={val}
                </span>{" "}
                <span style={{ fontSize: "0.7rem", color: "#71717a" }}>{name}</span>
              </div>
            )
          )}
        </div>
        <div style={{ ...mono, fontSize: "0.85rem", color: "#a1a1aa", marginTop: "0.6rem" }}>
          WER = (S + I + D) / N = ({S} + {I} + {D}) / {N} ={" "}
          <span style={{ color: wer > 0 ? RED : GREEN, fontSize: "1.1rem" }}>
            {wer.toFixed(3)} ({Math.round(wer * 100)}%)
          </span>
        </div>
      </div>

      {mode === "meaning" && (
        <div style={{ ...card, borderLeft: `2px solid ${RED}`, fontSize: "0.82rem", color: "#d4d4d8" }}>
          One word changed — "hundred" became "thousand" — and WER scores it as a
          single substitution: {Math.round(wer * 100)}%. A low number. But the
          transcript now instructs a transfer 10x larger. WER counts edits, not
          meaning: a fluent, correctly-spelled wrong word is nearly invisible to it.
        </div>
      )}

      {/* MOS — the thing WER can't see */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span style={{ fontWeight: 600, color: "#fafafa" }}>MOS</span>{" "}
            <span style={{ fontSize: "0.72rem", color: "#71717a" }}>
              mean opinion score — naturalness, 1 to 5
            </span>
          </div>
          <span style={{ ...mono, fontSize: "1.3rem", color: mos >= 4 ? GREEN : mos <= 2 ? RED : "#fafafa" }}>
            {mos.toFixed(1)}
          </span>
        </div>
        <input type="range" min={1} max={5} step={1} value={mos}
          onChange={(e) => setMos(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a", marginTop: "0.4rem" }} />
        <div style={{ display: "flex", justifyContent: "space-between", ...mono,
          fontSize: "0.66rem", color: "#71717a" }}>
          <span>1 bad</span><span>3 fair</span><span>5 natural</span>
        </div>
        <div style={{ fontSize: "0.78rem", color: "#a1a1aa", marginTop: "0.4rem" }}>
          MOS is a human rating of how natural the speech sounds. Two systems can
          share the same WER and sound completely different — flat and robotic
          versus warm and human. WER never touches this axis.
        </div>
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}`, fontSize: "0.82rem", color: "#d4d4d8" }}>
        WER is a spelling-and-alignment metric. It is cheap and objective, which is
        why it dominates — but it treats every word as equally important and is
        blind to whether the sentence still means the right thing, or whether the
        voice sounds like a person. Pair it with a human judgment like MOS, and
        weight the words that carry the intent.
      </div>
    </div>
  );
}
