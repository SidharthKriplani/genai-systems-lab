import { useState } from "react";

// NLP eval metrics: pick a candidate/reference pair (one preset is a good
// paraphrase) and watch unigram overlap, BLEU-style precision + brevity penalty,
// and ROUGE-style recall. The paraphrase preset tanks every overlap score,
// demonstrating the shared blind spot of n-gram-overlap metrics.
export default function NlpMetricsViz({ onNavigate, spec } = {}) {
  const PRESETS = [
    {
      key: "good",
      label: "good match",
      ref: "the cat sat on the mat",
      cand: "the cat sat on the rug",
    },
    {
      key: "short",
      label: "too short",
      ref: "the cat sat on the mat",
      cand: "the cat",
    },
    {
      key: "paraphrase",
      label: "paraphrase (blind spot)",
      ref: "the film was extremely enjoyable",
      cand: "the movie was really fun",
    },
  ];
  const [sel, setSel] = useState(0);
  const p = PRESETS[sel];

  const tok = (s) => s.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const refTok = tok(p.ref);
  const candTok = tok(p.cand);
  const c = candTok.length;
  const r = refTok.length;

  // count map for clipping
  const countMap = (arr) =>
    arr.reduce((m, w) => ((m[w] = (m[w] || 0) + 1), m), {});
  const refCounts = countMap(refTok);
  const candCounts = countMap(candTok);

  // clipped unigram matches = sum over candidate word types of min(cand, ref)
  let clipped = 0;
  Object.keys(candCounts).forEach((w) => {
    clipped += Math.min(candCounts[w], refCounts[w] || 0);
  });

  // BLEU-style modified unigram precision (of what candidate said, how much is licensed)
  const precision = c > 0 ? clipped / c : 0;
  // brevity penalty = min(1, e^(1 - r/c))
  const bp = c === 0 ? 0 : Math.min(1, Math.exp(1 - r / c));
  const bleu = bp * precision;

  // ROUGE-1 style recall (of reference words, how many are covered)
  let refCovered = 0;
  Object.keys(refCounts).forEach((w) => {
    refCovered += Math.min(refCounts[w], candCounts[w] || 0);
  });
  const recall = r > 0 ? refCovered / r : 0;

  const overlapSet = new Set(
    candTok.filter((w) => (refCounts[w] || 0) > 0)
  );

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

  const chip = (hit) => ({
    ...mono,
    fontSize: "0.75rem",
    padding: "0.15rem 0.45rem",
    borderRadius: "0.4rem",
    border: `1px solid ${hit ? GREEN : "var(--border, #27272a)"}`,
    color: hit ? GREEN : "#a1a1aa",
    background: hit ? "rgba(52,211,153,0.08)" : "transparent",
  });

  const Bar = ({ v, color }) => (
    <div
      style={{
        height: 8,
        background: "var(--surface-2, #1f1f23)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.round(v * 100)}%`,
          height: "100%",
          background: color,
          opacity: 0.6,
        }}
      />
    </div>
  );

  const Metric = ({ name, value, color, sub }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={label}>{name}</span>
        <span style={{ ...mono, color, fontSize: "1.05rem", fontWeight: 600 }}>
          {value.toFixed(3)}
        </span>
      </div>
      <Bar v={value} color={color} />
      <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a" }}>{sub}</div>
    </div>
  );

  const isParaphrase = p.key === "paraphrase";

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
          N-gram overlap metrics and their blind spot
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          BLEU grades precision (translation); ROUGE grades recall (summarization).
          Both match exact tokens, so a valid paraphrase tanks every score.
        </div>
      </div>

      {/* preset selector */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Choose a candidate / reference pair</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {PRESETS.map((preset, i) => (
            <button
              key={preset.key}
              onClick={() => setSel(i)}
              style={pill(sel === i, preset.key === "paraphrase" ? RED : CYAN)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "0.9rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div>
            <div style={label}>reference (r = {r} words)</div>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
              {refTok.map((w, i) => (
                <span key={i} style={chip((candCounts[w] || 0) > 0)}>{w}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={label}>candidate (c = {c} words)</div>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
              {candTok.map((w, i) => (
                <span key={i} style={chip(overlapSet.has(w))}>{w}</span>
              ))}
            </div>
          </div>
          <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a" }}>
            <span style={{ color: GREEN }}>green</span> = token appears in both.
            Clipped unigram matches = {clipped}.
          </div>
        </div>
      </div>

      {/* metrics */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.8rem" }}>Computed scores</div>
        <div style={{ display: "grid", gap: "1rem" }}>
          <Metric
            name="BLEU-style precision (pre-BP)"
            value={precision}
            color={CYAN}
            sub={`clipped ${clipped} / ${c} candidate words = ${precision.toFixed(3)}`}
          />
          <Metric
            name="brevity penalty  BP = min(1, e^(1 - r/c))"
            value={bp}
            color={bp >= 0.999 ? GREEN : RED}
            sub={c >= r ? "candidate not shorter than reference -> BP = 1" : `c=${c} < r=${r} -> penalized`}
          />
          <Metric
            name="BLEU (unigram) = BP x precision"
            value={bleu}
            color={CYAN}
            sub={`${bp.toFixed(3)} x ${precision.toFixed(3)} = ${bleu.toFixed(3)}  (translation: guards invented words + short outputs)`}
          />
          <Metric
            name="ROUGE-1 recall = covered / reference"
            value={recall}
            color={GREEN}
            sub={`${refCovered} / ${r} reference words covered  (summarization: guards omission)`}
          />
        </div>
      </div>

      {/* reading it */}
      <div style={{ ...card, borderLeft: `2px solid ${isParaphrase ? RED : CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Reading it</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          {isParaphrase ? (
            <>
              This candidate is an excellent paraphrase a human would rate near-identical
              in meaning, yet it shares only <span style={{ color: GREEN }}>{clipped}</span> tokens
              with the reference, so every overlap score collapses. This is the shared blind
              spot: n-gram metrics penalize valid paraphrase and reward surface overlap. It is
              exactly why <span style={{ color: CYAN }}>BERTScore</span> (match tokens by embedding
              cosine, so "movie" ~ "film") and <span style={{ color: CYAN }}>LLM-as-judge</span> exist.
            </>
          ) : p.key === "short" ? (
            <>
              The candidate's words are all licensed (high precision), but it is far too short,
              so the brevity penalty drops the BLEU score hard. Precision alone would reward
              cowardly-short outputs; BP is what stops that.
            </>
          ) : (
            <>
              Most tokens overlap, so precision, BLEU, and recall are all healthy. This is the
              regime overlap metrics were built for: surface forms genuinely match. Switch to the
              paraphrase preset to see the same meaning score badly.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
