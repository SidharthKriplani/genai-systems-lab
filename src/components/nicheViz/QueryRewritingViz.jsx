import { useState } from "react";

// Query rewriting/transformation for retrieval. A vague, conversational query
// retrieves poorly because it's underspecified or lexically mismatched with the
// corpus. Four rewrite strategies fix different failures:
//   - Expansion: add synonyms/related terms -> more surface area for lexical match
//   - HyDE: generate a HYPOTHETICAL answer, then embed THAT (not the query) —
//     answers live near answers in embedding space, so recall jumps
//   - Step-back: abstract to a broader question first, retrieve grounding facts
//   - Conversational rewrite: resolve "it/that/there" against chat history into
//     a standalone query
// We show the rewritten query and a simulated recall bar improving per strategy.

const STRATS = [
  { k: "expansion", t: "Expansion", sub: "add related terms", recall: 62 },
  { k: "hyde", t: "HyDE", sub: "embed a hypothetical answer", recall: 78 },
  { k: "stepback", t: "Step-back", sub: "abstract, then ground", recall: 70 },
  { k: "conv", t: "Conversational rewrite", sub: "resolve references", recall: 84 },
];

const BASE_RECALL = 38; // the vague query on its own

export default function QueryRewritingViz({ onNavigate, spec } = {}) {
  const [strat, setStrat] = useState("hyde");

  // A single running example that exercises every strategy meaningfully — it is
  // conversational (has a pronoun), vague, and lexically thin.
  const history = "User: We migrated the cluster to the new region last week.";
  const original = "why is it still so slow there?";

  const REWRITES = {
    expansion:
      "why is it still slow there? (latency, high response time, degraded performance, throughput regression, slow requests)",
    hyde: {
      hypothetical:
        "After a region migration, latency often stays high due to cold caches, cross-region database calls, and DNS/connection warm-up before traffic settles.",
      note: "Embed the hypothetical ANSWER above — not the question — and search with that vector.",
    },
    stepback: "What causes elevated latency after migrating a service to a new cloud region?",
    conv: "Why is latency still high after migrating the cluster to the new region last week?",
  };

  const card = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const label = { fontSize: "0.72rem", color: "var(--ink-low)", letterSpacing: "0.02em" };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

  const active = STRATS.find((s) => s.k === strat);
  const recall = active.recall;
  const gain = recall - BASE_RECALL;
  const isHyde = strat === "hyde";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: "var(--ink-hi)" }}>
      {/* the input */}
      <div style={{ ...card, borderLeft: "3px solid #ef4444" }}>
        <div style={{ ...mono, fontSize: "0.66rem", color: "var(--ink-low)" }}>{history}</div>
        <div style={label}>Vague input query</div>
        <div style={{ ...mono, fontSize: "0.9rem", color: "var(--ink-hi)", marginTop: "0.15rem" }}>
          “{original}”
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--ink-low)", marginTop: "0.35rem" }}>
          Pronoun “it/there”, no keywords — raw recall ≈ {BASE_RECALL}%.
        </div>
      </div>

      {/* strategy toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
        {STRATS.map((s) => {
          const on = strat === s.k;
          return (
            <button
              key={s.k}
              onClick={() => setStrat(s.k)}
              style={{
                cursor: "pointer",
                textAlign: "left",
                padding: "0.55rem 0.7rem",
                borderRadius: "0.75rem",
                background: on ? "var(--surface-2)" : "var(--surface)",
                border: on ? "1px solid var(--gal-build)" : "1px solid var(--border)",
                color: "var(--ink-hi)",
              }}
            >
              <div style={{ fontSize: "0.86rem", fontWeight: 600 }}>{s.t}</div>
              <div style={{ ...mono, fontSize: "0.64rem", color: on ? "var(--gal-build)" : "var(--ink-low)" }}>
                {s.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* rewritten query */}
      <div style={{ ...card, borderLeft: "3px solid var(--gal-build)" }}>
        {isHyde ? (
          <>
            <div style={label}>Step 1 — generate a hypothetical answer</div>
            <div
              style={{
                ...mono,
                fontSize: "0.8rem",
                color: "var(--ink-hi)",
                marginTop: "0.15rem",
                lineHeight: 1.45,
                padding: "0.5rem",
                background: "var(--surface)",
                borderRadius: "0.5rem",
              }}
            >
              {REWRITES.hyde.hypothetical}
            </div>
            <div style={{ ...label, marginTop: "0.6rem", color: "var(--gal-build)" }}>
              Step 2 — embed THIS text, not the question
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink-low)", marginTop: "0.2rem", lineHeight: 1.4 }}>
              {REWRITES.hyde.note}
            </div>
          </>
        ) : (
          <>
            <div style={label}>Rewritten query — {active.t}</div>
            <div
              style={{
                ...mono,
                fontSize: "0.84rem",
                color: "var(--ink-hi)",
                marginTop: "0.15rem",
                lineHeight: 1.45,
              }}
            >
              {REWRITES[strat]}
            </div>
          </>
        )}
      </div>

      {/* recall bar */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <span style={label}>Simulated recall@k</span>
          <span style={{ ...mono, fontSize: "0.78rem", color: "#10b981" }}>
            {recall}% <span style={{ color: "var(--ink-low)" }}>(+{gain})</span>
          </span>
        </div>
        {/* baseline marker + improved bar */}
        <div style={{ position: "relative", height: "1.4rem", background: "var(--surface)", borderRadius: "0.4rem", overflow: "hidden" }}>
          <div
            style={{
              width: `${recall}%`,
              height: "100%",
              background: "#10b981",
              borderRadius: "0.4rem",
              transition: "width 0.25s",
            }}
          />
          {/* baseline tick */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${BASE_RECALL}%`,
              width: "2px",
              height: "100%",
              background: "#ef4444",
            }}
          />
        </div>
        <div style={{ ...mono, fontSize: "0.62rem", color: "var(--ink-low)", marginTop: "0.25rem" }}>
          red tick = raw query baseline ({BASE_RECALL}%) · green = after rewrite
        </div>
      </div>

      {/* why line */}
      <div style={{ ...card, borderLeft: "3px solid var(--gal-build)", fontSize: "0.82rem", lineHeight: 1.5 }}>
        {strat === "expansion" && (
          <>
            <strong>Expansion.</strong> Bolt on synonyms and related terms so a lexical (BM25) index has more
            ways to match. Cheap and effective for keyword search; adds little for a pure semantic index and
            can drift if the added terms are off-topic.
          </>
        )}
        {strat === "hyde" && (
          <>
            <strong>HyDE.</strong> The query and the answer live in <em>different neighbourhoods</em> of
            embedding space. So generate a plausible answer first, then embed <strong>that</strong> — answers
            cluster near answers, so the search vector lands where the real passage already sits. The
            hypothetical can be wrong in facts and still retrieve the right doc.
          </>
        )}
        {strat === "stepback" && (
          <>
            <strong>Step-back.</strong> Abstract the specific question into a broader one, retrieve the
            general principle, then answer the specific case with that grounding. Helps when the exact query
            is too narrow to match good context.
          </>
        )}
        {strat === "conv" && (
          <>
            <strong>Conversational rewrite.</strong> Resolve “it/there/that” against the chat history into a
            standalone, self-contained query. Without this, retrieval sees a pronoun with no referent — the
            single biggest recall killer in multi-turn RAG.
          </>
        )}
      </div>
    </div>
  );
}
