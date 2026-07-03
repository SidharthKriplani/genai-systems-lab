import { useState } from "react";

// Text preprocessing: segment one sentence under three tokenization
// granularities (word / subword / character), show the live vocab-size vs
// sequence-length tradeoff, and demonstrate a BPE-style merge building
// subword pieces up from characters.
export default function TextPreprocessViz({ onNavigate, spec } = {}) {
  const SENTENCE = "the unhappiness of tokenizers";
  const [mode, setMode] = useState("subword"); // word | subword | char
  const [merges, setMerges] = useState(3); // BPE merge rounds, 0..6

  // ---- styling (GSL monochrome instrument standard) ----
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

  // A fixed subword segmentation for the demo sentence (illustrative pieces).
  const SUBWORD = {
    the: ["the"],
    unhappiness: ["un", "happi", "ness"],
    of: ["of"],
    tokenizers: ["token", "izer", "s"],
  };

  const words = SENTENCE.split(" ");

  const tokensFor = (m) => {
    if (m === "word") return words.slice();
    if (m === "char") return SENTENCE.replace(/ /g, "").split("");
    // subword
    return words.flatMap((w) => SUBWORD[w] || [w]);
  };

  const tokens = tokensFor(mode);
  const seqLen = tokens.length;

  // Illustrative vocabulary sizes for each scheme (whole-corpus, not this line).
  const vocabFor = {
    word: 50000,
    subword: 32000,
    char: 256,
  };
  const vocab = vocabFor[mode];

  // Relative bar widths for the tradeoff (log-ish scaling for readability).
  const seqPct = { word: 30, subword: 55, char: 100 }[mode];
  const vocabPct = { word: 100, subword: 64, char: 12 }[mode];

  // ---- BPE merge demo (bottom-up from characters of "newest widest") ----
  // Show pieces after N greedy frequency merges.
  const MERGE_STEPS = [
    { pair: "—", result: "n e w e s t   w i d e s t", note: "start: characters" },
    { pair: "e + s → es", result: "n e w es t   w i d es t", note: "'es' most frequent pair" },
    { pair: "es + t → est", result: "n e w est   w i d est", note: "'est' merges next" },
    { pair: "w + est → west?", result: "n e west   w i d est", note: "extend the piece" },
    { pair: "n e → ne", result: "ne west   w i d est", note: "more merges" },
    { pair: "w i → wi", result: "ne west   wi d est", note: "more merges" },
    { pair: "wi d → wid", result: "ne west   wid est", note: "'widest' = wid + est" },
  ];
  const step = MERGE_STEPS[merges];

  const oov = mode === "word"; // word-level has the OOV risk highlighted

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
          Tokenization: the vocabulary vs sequence-length tradeoff
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Segment the same sentence at three granularities. Coarser units mean a
          bigger vocabulary but shorter sequences; finer units invert it.
        </div>
      </div>

      {/* mode selector */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Tokenization scheme</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => setMode("word")} style={pill(mode === "word", CYAN)}>
            word / whitespace
          </button>
          <button onClick={() => setMode("subword")} style={pill(mode === "subword", CYAN)}>
            subword
          </button>
          <button onClick={() => setMode("char")} style={pill(mode === "char", CYAN)}>
            character
          </button>
        </div>

        {/* segmented tokens */}
        <div style={{ ...label, margin: "0.9rem 0 0.4rem" }}>
          "{SENTENCE}" → {seqLen} tokens
        </div>
        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
          {tokens.map((t, i) => (
            <span
              key={i}
              style={{
                ...mono,
                fontSize: "0.8rem",
                padding: "0.2rem 0.45rem",
                borderRadius: "0.4rem",
                background: "var(--surface-2, #1f1f23)",
                border: "1px solid var(--border, #27272a)",
                color: "#d4d4d8",
                whiteSpace: "pre",
              }}
            >
              {t === " " ? "␣" : t}
            </span>
          ))}
        </div>
        {oov && (
          <div style={{ ...mono, fontSize: "0.7rem", color: RED, marginTop: "0.5rem" }}>
            Word-level: any word unseen in training becomes a single
            {"  <unk>  "}token — the out-of-vocabulary hole.
          </div>
        )}
        {mode === "subword" && (
          <div style={{ ...mono, fontSize: "0.7rem", color: GREEN, marginTop: "0.5rem" }}>
            Subword: "unhappiness" → un + happi + ness. No OOV, and the "happi"
            piece is shared with "happy" / "happiness" (morphology captured).
          </div>
        )}
        {mode === "char" && (
          <div style={{ ...mono, fontSize: "0.7rem", color: "#a1a1aa", marginTop: "0.5rem" }}>
            Character: no OOV possible, tiny vocab — but the sequence is far
            longer, so the model pays in context budget and compute.
          </div>
        )}
      </div>

      {/* tradeoff bars */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.6rem" }}>
          The inverse tradeoff (for this scheme)
        </div>

        <div style={{ marginBottom: "0.7rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              ...mono,
              fontSize: "0.72rem",
              color: "#a1a1aa",
              marginBottom: "0.2rem",
            }}
          >
            <span>vocabulary size (whole corpus)</span>
            <span style={{ color: CYAN }}>
              {mode === "word" ? "~millions" : vocab.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              height: 12,
              borderRadius: 6,
              background: "var(--surface-2, #1f1f23)",
              overflow: "hidden",
            }}
          >
            <div style={{ width: `${vocabPct}%`, height: "100%", background: CYAN, opacity: 0.55 }} />
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              ...mono,
              fontSize: "0.72rem",
              color: "#a1a1aa",
              marginBottom: "0.2rem",
            }}
          >
            <span>sequence length (this sentence)</span>
            <span style={{ color: "#d4d4d8" }}>{seqLen} tokens</span>
          </div>
          <div
            style={{
              height: 12,
              borderRadius: 6,
              background: "var(--surface-2, #1f1f23)",
              overflow: "hidden",
            }}
          >
            <div style={{ width: `${seqPct}%`, height: "100%", background: "#a1a1aa", opacity: 0.5 }} />
          </div>
        </div>

        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.6rem" }}>
          Word → big vocab, short sequence. Char → tiny vocab, long sequence.
          Subword sits in the sweet spot: bounded vocab AND no OOV.
        </div>
      </div>

      {/* BPE merge demo */}
      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.5rem",
          }}
        >
          <span style={label}>BPE merges: building subword pieces bottom-up</span>
          <span style={{ ...mono, color: CYAN, fontSize: "1.05rem" }}>
            {merges} merge{merges === 1 ? "" : "s"}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={6}
          step={1}
          value={merges}
          onChange={(e) => setMerges(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#71717a" }}
        />
        <div style={{ ...mono, fontSize: "0.8rem", color: "#e4e4e7", marginTop: "0.6rem" }}>
          {step.result}
        </div>
        <div style={{ ...mono, fontSize: "0.72rem", color: GREEN, marginTop: "0.3rem" }}>
          {merges === 0 ? "" : step.pair} &nbsp; {step.note}
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.5rem" }}>
          BPE repeatedly merges the most frequent adjacent pair. The learned
          pieces let a never-before-seen word ("widest" = wid + est) tokenize
          into known pieces — no OOV, morphology captured. Merge count sets the
          vocabulary size.
        </div>
      </div>
    </div>
  );
}
