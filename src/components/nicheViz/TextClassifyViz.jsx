import { useState } from "react";

// Naive Bayes sentiment, live. Pick a test sentence; watch the per-word
// log-likelihoods P(word|POS) vs P(word|NEG) tally into a class decision.
export default function TextClassifyViz({ onNavigate, spec } = {}) {
  // A tiny hand-built lexicon: log P(word | class), learned from a toy corpus.
  // More negative = less likely. Sentiment words diverge; stopwords ~neutral.
  const LEX = {
    love: { pos: -1.2, neg: -4.6 },
    great: { pos: -1.4, neg: -4.2 },
    worth: { pos: -2.6, neg: -3.1 },
    good: { pos: -1.6, neg: -3.8 },
    fast: { pos: -2.2, neg: -3.0 },
    not: { pos: -3.9, neg: -2.0 },
    money: { pos: -2.6, neg: -2.5 },
    broke: { pos: -4.7, neg: -1.5 },
    slow: { pos: -4.4, neg: -1.7 },
    waste: { pos: -5.0, neg: -1.3 },
    terrible: { pos: -5.2, neg: -1.2 },
    the: { pos: -1.1, neg: -1.1 },
    it: { pos: -1.3, neg: -1.3 },
    is: { pos: -1.2, neg: -1.2 },
  };
  const PRIOR = { pos: -0.7, neg: -0.7 }; // balanced prior, log 0.5
  const SMOOTH = -6.0; // Laplace-smoothed log-prob for an unseen word (both classes)

  const SAMPLES = [
    "love it great and fast",
    "not worth the money",
    "terrible waste slow and broke",
    "good but not great",
  ];
  const [sentence, setSentence] = useState(SAMPLES[1]);

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
  const pill = (active) => ({
    ...mono,
    fontSize: "0.72rem",
    padding: "0.3rem 0.7rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: `1px solid ${active ? CYAN : "var(--border, #27272a)"}`,
    background: active ? "var(--surface-2, #1f1f23)" : "transparent",
    color: active ? CYAN : "#a1a1aa",
  });

  const words = sentence.toLowerCase().split(/\s+/).filter(Boolean);
  const rows = words.map((w) => {
    const e = LEX[w] || { pos: SMOOTH, neg: SMOOTH, unseen: true };
    return { w, pos: e.pos, neg: e.neg, unseen: !!e.unseen, lean: e.pos - e.neg };
  });

  const posScore = PRIOR.pos + rows.reduce((s, r) => s + r.pos, 0);
  const negScore = PRIOR.neg + rows.reduce((s, r) => s + r.neg, 0);
  const winner = posScore >= negScore ? "POS" : "NEG";
  const margin = Math.abs(posScore - negScore);

  // bar scale for per-word lean (pos - neg): positive -> leans POS, negative -> NEG
  const maxLean = Math.max(1, ...rows.map((r) => Math.abs(r.lean)));

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
          Naive Bayes sentiment: a log-probability tally
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Each word contributes log P(word | class). Sum the logs (never multiply —
          products underflow), add the prior, take the larger class.
        </div>
      </div>

      {/* pick a sentence */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {SAMPLES.map((s) => (
          <button key={s} onClick={() => setSentence(s)} style={pill(sentence === s)}>
            {s}
          </button>
        ))}
      </div>

      {/* per-word tally */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.6rem" }}>
          Per-word lean = log P(w|POS) − log P(w|NEG). Bar right = leans positive, left = leans negative.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {rows.map((r, i) => {
            const leanPos = r.lean >= 0;
            const wpct = (Math.abs(r.lean) / maxLean) * 46; // half-width %
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ ...mono, width: 74, textAlign: "right", fontSize: "0.8rem", color: r.unseen ? "#52525b" : "#e4e4e7" }}>
                  {r.w}
                </span>
                {/* centered diverging bar */}
                <div style={{ position: "relative", flex: 1, height: 16, background: "var(--surface-2, #1f1f23)", borderRadius: 4, border: "1px solid var(--border, #27272a)" }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#3f3f46" }} />
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      bottom: 2,
                      borderRadius: 3,
                      background: leanPos ? GREEN : RED,
                      opacity: 0.7,
                      left: leanPos ? "50%" : `${50 - wpct}%`,
                      width: `${wpct}%`,
                    }}
                  />
                </div>
                <span style={{ ...mono, width: 52, textAlign: "right", fontSize: "0.68rem", color: leanPos ? GREEN : RED }}>
                  {r.lean >= 0 ? "+" : ""}{r.lean.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.6rem" }}>
          greyed words are unseen {"->"} Laplace-smoothed to a small floor ({SMOOTH.toFixed(1)}) in both classes so one
          missing word can't zero the product.
        </div>
      </div>

      {/* score tally + decision */}
      <div style={card}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <div style={label}>score(POS) = prior + Σ log P(w|POS)</div>
            <div style={{ ...mono, fontSize: "1.3rem", color: winner === "POS" ? GREEN : "#a1a1aa" }}>
              {posScore.toFixed(1)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={label}>score(NEG) = prior + Σ log P(w|NEG)</div>
            <div style={{ ...mono, fontSize: "1.3rem", color: winner === "NEG" ? RED : "#a1a1aa" }}>
              {negScore.toFixed(1)}
            </div>
          </div>
        </div>
        <div
          style={{
            ...mono,
            marginTop: "0.8rem",
            padding: "0.6rem 0.8rem",
            borderRadius: "0.5rem",
            background: "var(--surface-2, #1f1f23)",
            border: `1px solid ${winner === "POS" ? GREEN : RED}`,
            fontSize: "0.85rem",
          }}
        >
          argmax {"->"} predict{" "}
          <span style={{ color: winner === "POS" ? GREEN : RED, fontWeight: 600 }}>
            {winner === "POS" ? "POSITIVE" : "NEGATIVE"}
          </span>
          <span style={{ color: "#a1a1aa" }}> (margin {margin.toFixed(1)} log-units — bigger = more confident)</span>
        </div>
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>What this shows</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          "Naive" = it treats each word as independent given the class, so it just
          adds per-word log-likelihoods — a false assumption that still usually points
          at the right class, which is why it's a strong, near-free baseline. Above it
          sit TF-IDF + logistic regression, then fine-tuned BERT, then zero-shot LLMs —
          more accurate, but costlier and less interpretable. And remember: on
          imbalanced data, judge it with precision/recall/F1 on the rare class, not
          accuracy.
        </div>
      </div>
    </div>
  );
}
