import { useState } from "react";

// Model routing / cascade instrument. A fixed stream of queries (easy/medium/hard)
// is routed to a small or large model. Mode = "all-large" | "router" | "cascade".
// Router decides BEFORE any model runs, using only pre-inference query features
// (length + keyword heuristics) — it never sees a confidence score, because no
// model has produced one yet. Cascade decides AFTER running the small model,
// using the small model's own self-reported confidence. Both modes expose a
// visible threshold slider. Cost + quality tallied live.
export default function ModelRoutingViz({ onNavigate, spec } = {}) {
  const [mode, setMode] = useState("router"); // all-large | router | cascade
  const [thresh, setThresh] = useState(60); // cascade escalate-if-confidence-below, 0..100
  const [routerThresh, setRouterThresh] = useState(45); // router route-to-large-if-complexity-at-or-above, 0..100

  // Pre-inference complexity heuristic: length + keyword matching against the raw
  // query text. This is exactly what a router has available BEFORE any model runs —
  // no confidence score, because no model has produced an answer yet.
  const HARD_KEYWORDS = ["prove", "multi-step", "adversarial", "refactor", "revenue"];
  const MED_KEYWORDS = ["explain", "classify", "rewrite", "why"];
  function estimateComplexity(text) {
    const words = text.trim().split(/\s+/).length;
    const lower = text.toLowerCase();
    let score = Math.min(50, words * 5); // pure length signal, capped
    if (HARD_KEYWORDS.some((k) => lower.includes(k))) score += 40;
    else if (MED_KEYWORDS.some((k) => lower.includes(k))) score += 20;
    return Math.min(100, score);
  }

  // ---- monochrome instrument palette ----
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";
  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
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

  // Relative economics: small = 1x, large = 20x.
  const COST_SMALL = 1;
  const COST_LARGE = 20;

  // A representative stream of 12 queries. `d` = true difficulty (easy/med/hard).
  // `smallConf` = the small model's self-reported confidence (0..100) on this query;
  // `smallOK` = whether the small model's answer would actually be correct.
  // Note the deliberate overconfidence rows: high smallConf but smallOK=false.
  const STREAM = [
    { t: "reset my password", d: "easy", smallConf: 96, smallOK: true },
    { t: "what's your refund window?", d: "easy", smallConf: 94, smallOK: true },
    { t: "thanks!", d: "easy", smallConf: 99, smallOK: true },
    { t: "summarise this 2-line note", d: "easy", smallConf: 90, smallOK: true },
    { t: "classify this ticket", d: "med", smallConf: 74, smallOK: true },
    { t: "rewrite this paragraph formally", d: "med", smallConf: 71, smallOK: true },
    { t: "explain this stack trace", d: "med", smallConf: 58, smallOK: false },
    { t: "why did revenue drop 3%?", d: "med", smallConf: 52, smallOK: false },
    { t: "prove this edge case is safe", d: "hard", smallConf: 41, smallOK: false },
    { t: "multi-step refactor + tests", d: "hard", smallConf: 38, smallOK: false },
    { t: "subtle legal-clause reasoning", d: "hard", smallConf: 88, smallOK: false }, // confidently WRONG
    { t: "adversarial math word-problem", d: "hard", smallConf: 45, smallOK: false },
  ];

  // Decide, per query, which model serves it and whether the final answer is correct.
  function serve(q) {
    if (mode === "all-large") {
      return { model: "large", cost: COST_LARGE, correct: true, escalated: false };
    }
    if (mode === "router") {
      // Front-door classifier: routes by *predicted* difficulty, decided BEFORE any
      // model runs — from query length + keyword heuristics alone, never a confidence
      // score. It commits up front and there's no recovery path.
      // Blind spot: a query can be short and keyword-innocuous (low predicted
      // complexity) yet genuinely hard — the heuristic has no way to know.
      const complexity = estimateComplexity(q.t);
      const routeSmall = complexity < routerThresh;
      if (routeSmall) {
        return { model: "small", cost: COST_SMALL, correct: q.smallOK, escalated: false };
      }
      return { model: "large", cost: COST_LARGE, correct: true, escalated: false };
    }
    // cascade: always try small; escalate to large if confidence < threshold.
    const escalate = q.smallConf < thresh;
    if (!escalate) {
      // returns the small answer (correct only if smallOK)
      return { model: "small", cost: COST_SMALL, correct: q.smallOK, escalated: false };
    }
    // escalated: pays BOTH small + large, large is correct
    return { model: "large", cost: COST_SMALL + COST_LARGE, correct: true, escalated: true };
  }

  const results = STREAM.map((q) => ({ q, r: serve(q) }));
  const totalCost = results.reduce((s, x) => s + x.r.cost, 0);
  const correct = results.filter((x) => x.r.correct).length;
  const escalations = results.filter((x) => x.r.escalated).length;
  const baselineCost = STREAM.length * COST_LARGE; // all-large
  const savingPct = Math.round((1 - totalCost / baselineCost) * 100);
  const qualityPct = Math.round((correct / STREAM.length) * 100);

  const diffColor = { easy: "#71717a", med: "#a1a1aa", hard: CYAN };

  return (
    <div style={{ color: "#e4e4e7", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: 1.5 }}>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}>
          Routing a stream of queries: cost vs quality
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Small model = 1x cost, large = 20x. All-large is the baseline. Watch what each
          strategy does to cost, quality, and the confidently-wrong hard query.
        </div>
      </div>

      {/* mode selector */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Strategy</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => setMode("all-large")} style={pill(mode === "all-large", RED)}>all-large (baseline)</button>
          <button onClick={() => setMode("router")} style={pill(mode === "router", CYAN)}>router (decide before)</button>
          <button onClick={() => setMode("cascade")} style={pill(mode === "cascade", GREEN)}>cascade (decide after)</button>
        </div>

        {mode === "cascade" && (
          <div style={{ marginTop: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={label}>Escalate if small-model confidence &lt; threshold</span>
              <span style={{ ...mono, color: GREEN, fontSize: "1.1rem" }}>{thresh}</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={thresh}
              onChange={(e) => setThresh(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#71717a" }} />
            <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", display: "flex", justifyContent: "space-between" }}>
              <span>0 (never escalate)</span><span>100 (always escalate)</span>
            </div>
          </div>
        )}

        {mode === "router" && (
          <div style={{ marginTop: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={label}>Route to large if pre-inference complexity ≥ threshold</span>
              <span style={{ ...mono, color: CYAN, fontSize: "1.1rem" }}>{routerThresh}</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={routerThresh}
              onChange={(e) => setRouterThresh(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#71717a" }} />
            <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", display: "flex", justifyContent: "space-between" }}>
              <span>0 (always large)</span><span>100 (always small)</span>
            </div>
            <div style={{ ...mono, fontSize: "0.64rem", color: "#71717a", marginTop: "0.3rem" }}>
              Complexity = query length + keyword match (e.g. "prove", "refactor", "explain") — computed from the raw text, before either model has run.
            </div>
          </div>
        )}
      </div>

      {/* live stats */}
      <div className="gsl-viz-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
        <div style={card}>
          <div style={label}>Total cost (rel.)</div>
          <div style={{ ...mono, fontSize: "1.3rem", color: CYAN, fontWeight: 600 }}>{totalCost}</div>
          <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a" }}>
            baseline {baselineCost} · {savingPct >= 0 ? `${savingPct}% cheaper` : "no saving"}
          </div>
        </div>
        <div style={card}>
          <div style={label}>Answer quality</div>
          <div style={{ ...mono, fontSize: "1.3rem", color: qualityPct >= 90 ? GREEN : qualityPct >= 75 ? "#e4e4e7" : RED, fontWeight: 600 }}>{qualityPct}%</div>
          <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a" }}>{correct}/{STREAM.length} correct</div>
        </div>
        <div style={card}>
          <div style={label}>Escalations</div>
          <div style={{ ...mono, fontSize: "1.3rem", color: "#e4e4e7", fontWeight: 600 }}>{mode === "cascade" ? escalations : "—"}</div>
          <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a" }}>{mode === "cascade" ? "small+large, serial" : "no escalation path"}</div>
        </div>
      </div>

      {/* per-query stream */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>The query stream (each row = one request)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {results.map(({ q, r }, i) => {
            const wrong = !r.correct;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", ...mono, fontSize: "0.72rem", padding: "0.2rem 0.4rem", borderRadius: "0.35rem", background: wrong ? "rgba(248,113,113,0.08)" : "transparent" }}>
                <span style={{ width: 40, color: diffColor[q.d], textTransform: "uppercase", fontSize: "0.62rem" }}>{q.d}</span>
                <span style={{ flex: 1, color: "#d4d4d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.t}</span>
                <span style={{ width: 92, textAlign: "right", color: r.model === "large" ? CYAN : "#a1a1aa" }}>
                  {r.escalated ? "small→large" : r.model}
                </span>
                <span style={{ width: 34, textAlign: "right", color: "#71717a" }}>{r.cost}x</span>
                <span style={{ width: 14, textAlign: "center", color: wrong ? RED : GREEN }}>{wrong ? "✗" : "✓"}</span>
              </div>
            );
          })}
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.4rem" }}>
          <span style={{ color: GREEN }}>✓</span> correct &nbsp;·&nbsp;
          <span style={{ color: RED }}>✗</span> wrong (small model missed it) &nbsp;·&nbsp; hard queries in <span style={{ color: CYAN }}>cyan</span>
        </div>
      </div>

      {/* reading it */}
      <div style={{ ...card, borderLeft: `2px solid ${mode === "all-large" ? RED : mode === "router" ? CYAN : GREEN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Reading it</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          {mode === "all-large" &&
            "Every query pays the 20x flagship, even 'thanks!'. Quality is 100% but you're paying worst-case cost on average-case traffic — the mistake the whole topic exists to fix."}
          {mode === "router" &&
            "The router commits each query up front using only length + keyword features — no model has run yet, so there's no confidence score to consult. It's cheap and single-hop — but the heuristic has its own blind spot: 'subtle legal-clause reasoning' is short and keyword-innocuous, so it scores as low-complexity and routes to the small model with no recovery. That's a silent misroute — not from a miscalibrated confidence score (the router never sees one), but from a surface-feature heuristic that can't detect domain difficulty it was never given signal for."}
          {mode === "cascade" &&
            "Cascade tries small first and escalates when confidence is below the threshold. Raise the threshold and you escalate more: quality climbs toward 100% but cost rises and escalated queries pay small+large in series (tail latency). Note the confidently-wrong hard query (stated confidence 88): a threshold below 88 never escalates it — the calibration failure a logprob-style signal can't catch."}
        </div>
      </div>
    </div>
  );
}
