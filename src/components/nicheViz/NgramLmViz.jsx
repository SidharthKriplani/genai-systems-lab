import { useState } from "react";

// n-gram LM: a toy corpus. Pick n (1/2/3), see the predicted next-word
// distribution after a fixed context, a live perplexity readout, and how
// coverage/sparsity collapses (unseen contexts → zeros) as n grows.
export default function NgramLmViz({ onNavigate, spec } = {}) {
  // Toy corpus: repetitive so bigrams are learnable but trigrams get sparse.
  const CORPUS =
    "the cat sat on the mat the cat ran to the mat the dog sat on the rug " +
    "the dog ran to the rug the cat sat on the rug the dog sat on the mat";
  const [n, setN] = useState(2); // 1 | 2 | 3

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

  const words = CORPUS.split(/\s+/).filter(Boolean);
  const V = new Set(words).size;

  // Build counts of (context of length n-1) -> next word.
  // ctxLen = n - 1.
  const ctxLen = n - 1;
  const counts = {}; // key: context string -> { word: count }
  for (let i = ctxLen; i < words.length; i++) {
    const ctx = words.slice(i - ctxLen, i).join(" ");
    const nextW = words[i];
    counts[ctx] = counts[ctx] || {};
    counts[ctx][nextW] = (counts[ctx][nextW] || 0) + 1;
  }

  // Context we query the model with, by n. Chosen so trigram is partly unseen.
  const CTX_BY_N = { 1: "", 2: "the", 3: "on the" };
  const ctx = CTX_BY_N[n];
  const dist = counts[ctx] || {};
  const total = Object.values(dist).reduce((s, c) => s + c, 0);
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);

  // ---- sparsity / coverage: distinct contexts seen vs possible ----
  const distinctContextsSeen = Object.keys(counts).length;
  const possibleContexts = ctxLen === 0 ? 1 : Math.pow(V, ctxLen);
  const coverage = possibleContexts === 0 ? 1 : distinctContextsSeen / possibleContexts;

  // ---- perplexity on a held-out test sentence (MLE, unseen -> penalized) ----
  // Test sentence deliberately contains a novel trigram context.
  const TEST = "the cat sat on the log".split(/\s+/);
  let logProbSum = 0;
  let steps = 0;
  let hitZero = false;
  for (let i = ctxLen; i < TEST.length; i++) {
    const c = TEST.slice(i - ctxLen, i).join(" ");
    const w = TEST[i];
    const d = counts[c] || {};
    const t = Object.values(d).reduce((s, x) => s + x, 0);
    let p = t > 0 ? (d[w] || 0) / t : 0;
    // MLE would give 0; to keep perplexity finite for display, floor tiny.
    if (p === 0) {
      hitZero = true;
      p = 1e-6; // stand-in for "smoothing needed"; without it, perplexity = infinity
    }
    logProbSum += Math.log2(p);
    steps += 1;
  }
  const crossEntropy = steps > 0 ? -logProbSum / steps : 0;
  const perplexity = Math.pow(2, crossEntropy);

  const maxCount = Math.max(...entries.map((e) => e[1]), 1);

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
          n-gram language model: prediction, perplexity, sparsity
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Condition on the last n−1 words, estimate next-word probability by
          counting. Raise n and watch coverage collapse into zeros.
        </div>
      </div>

      {/* n selector */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Model order n</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[1, 2, 3].map((k) => (
            <button key={k} onClick={() => setN(k)} style={pill(n === k, CYAN)}>
              {k === 1 ? "1 · unigram" : k === 2 ? "2 · bigram" : "3 · trigram"}
            </button>
          ))}
        </div>
        <div style={{ ...mono, fontSize: "0.7rem", color: "#71717a", marginTop: "0.6rem" }}>
          Corpus: {words.length} words, vocabulary V = {V}. Context length = n−1
          = {ctxLen}.
        </div>
      </div>

      {/* next-word distribution */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>
          Predicted next word after context:{" "}
          <span style={{ ...mono, color: CYAN }}>
            {ctx === "" ? "(none — unigram)" : `"${ctx}"`}
          </span>
        </div>
        {entries.length === 0 ? (
          <div style={{ ...mono, fontSize: "0.78rem", color: RED }}>
            This context was never seen → P = 0 for every word. MLE predicts
            nothing. This is the sparsity wall.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {entries.map(([w, c]) => {
              const p = c / total;
              return (
                <div key={w} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    style={{ ...mono, fontSize: "0.74rem", width: 70, textAlign: "right", color: "#d4d4d8" }}
                  >
                    {w}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 10,
                      borderRadius: 5,
                      background: "var(--surface-2, #1f1f23)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(c / maxCount) * 100}%`,
                        height: "100%",
                        background: CYAN,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                  <span style={{ ...mono, fontSize: "0.7rem", width: 84, color: "#71717a" }}>
                    {p.toFixed(2)} ({c}/{total})
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.6rem" }}>
          P(w | context) = count(context, w) / count(context). Pure counting, no
          training.
        </div>
      </div>

      {/* coverage / sparsity + perplexity */}
      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Sparsity and evaluation</div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            ...mono,
            fontSize: "0.74rem",
            color: "#a1a1aa",
            marginBottom: "0.2rem",
          }}
        >
          <span>context coverage (seen / possible = V^{ctxLen})</span>
          <span style={{ color: coverage > 0.5 ? GREEN : RED }}>
            {distinctContextsSeen} / {possibleContexts.toLocaleString()} ={" "}
            {(coverage * 100).toFixed(coverage < 0.01 ? 3 : 1)}%
          </span>
        </div>
        <div
          style={{
            height: 10,
            borderRadius: 5,
            background: "var(--surface-2, #1f1f23)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max(coverage * 100, 1)}%`,
              height: "100%",
              background: coverage > 0.5 ? GREEN : RED,
              opacity: 0.6,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: "0.9rem",
          }}
        >
          <span style={label}>Perplexity on "the cat sat on the log"</span>
          <span
            style={{
              ...mono,
              fontSize: "1.2rem",
              fontWeight: 600,
              color: hitZero ? RED : perplexity < 5 ? GREEN : "#e4e4e7",
            }}
          >
            {perplexity < 1000 ? perplexity.toFixed(1) : perplexity.toExponential(1)}
          </span>
        </div>
        <div style={{ ...mono, fontSize: "0.7rem", color: hitZero ? RED : "#a1a1aa", marginTop: "0.3rem" }}>
          perplexity = 2^(cross-entropy). Lower = less confused (its branching
          factor). {hitZero
            ? " This n hit an UNSEEN context — true MLE gives probability 0 (perplexity = infinity); shown floored to expose why smoothing is mandatory."
            : " All contexts here were seen — low perplexity."}
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.5rem" }}>
          Raise n: possible contexts = V^(n−1) explodes, coverage collapses,
          unseen contexts multiply → zeros → sentence probability zero. Bigger n
          buys context but demands exponentially more data.
        </div>
      </div>
    </div>
  );
}
