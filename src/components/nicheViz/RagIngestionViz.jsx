import { useState } from "react";

// RAG ingestion pipeline: a doc flows through parse -> clean -> chunk -> embed ->
// index (offline, distinct from the online query path). Incremental mode contrasts
// re-indexing ONE edited doc's chunks (upsert by doc id) against a full rebuild —
// making the cost asymmetry visceral.
export default function RagIngestionViz({ onNavigate, spec } = {}) {
  const [stage, setStage] = useState(0); // 0..5 across the pipeline
  const [mode, setMode] = useState("full"); // "full" | "incremental"

  const STAGES = [
    { key: "parse", label: "PARSE", sub: "PDF/HTML/tables -> clean text" },
    { key: "clean", label: "CLEAN / DEDUP", sub: "whitespace, boilerplate, near-dupes" },
    { key: "meta", label: "METADATA", sub: "source, section, timestamp, ACLs" },
    { key: "chunk", label: "CHUNK", sub: "split into retrieval-sized units" },
    { key: "embed", label: "EMBED", sub: "each chunk -> vector" },
    { key: "index", label: "INDEX", sub: "write vectors + metadata" },
  ];

  // Corpus numbers for the cost contrast.
  const CORPUS_DOCS = 12000;
  const CHUNKS_PER_DOC = 30;
  const CORPUS_CHUNKS = CORPUS_DOCS * CHUNKS_PER_DOC; // 360,000
  const EDITED_CHUNKS = CHUNKS_PER_DOC; // one doc changed

  // ---- styling (GSL monochrome instrument standard) ----
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

  const fmt = (n) => n.toLocaleString("en-US");

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
          The offline ingestion pipeline
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          A document becomes a searchable index ahead of time, off the latency-critical
          path. Step a doc through the stages, then see why one edit should not rebuild
          the corpus.
        </div>
      </div>

      {/* pipeline stages */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.6rem" }}>
          raw doc &nbsp;&rarr;&nbsp; parse &rarr; clean &rarr; metadata &rarr; chunk &rarr; embed &rarr; index
        </div>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {STAGES.map((s, i) => {
            const active = i === stage;
            const done = i < stage;
            const color = active ? CYAN : done ? GREEN : "#3f3f46";
            return (
              <button
                key={s.key}
                onClick={() => setStage(i)}
                style={{
                  ...mono,
                  flex: "1 1 100px",
                  minWidth: 92,
                  textAlign: "left",
                  cursor: "pointer",
                  padding: "0.45rem 0.5rem",
                  borderRadius: "0.5rem",
                  border: `1px solid ${active ? CYAN : "var(--border, #27272a)"}`,
                  background: active ? "var(--surface-2, #1f1f23)" : "transparent",
                }}
              >
                <div style={{ fontSize: "0.64rem", color, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: "0.6rem", color: "#71717a", marginTop: "0.15rem", lineHeight: 1.3 }}>
                  {s.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* progress track */}
        <div style={{ display: "flex", gap: 3, marginTop: "0.7rem" }}>
          {STAGES.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= stage ? (i === stage ? CYAN : GREEN) : "#3f3f46",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.6rem" }}>
          <button
            onClick={() => setStage((s) => Math.max(0, s - 1))}
            style={pill(false, "#a1a1aa")}
          >
            &larr; prev
          </button>
          <span style={{ ...mono, fontSize: "0.72rem", color: CYAN, alignSelf: "center" }}>
            {STAGES[stage].label}
          </span>
          <button
            onClick={() => setStage((s) => Math.min(STAGES.length - 1, s + 1))}
            style={pill(false, "#a1a1aa")}
          >
            next &rarr;
          </button>
        </div>

        <div style={{ ...card, marginTop: "0.7rem", borderLeft: `2px solid ${CYAN}` }}>
          <div style={{ ...mono, fontSize: "0.68rem", color: CYAN }}>{STAGES[stage].label}</div>
          <div style={{ fontSize: "0.82rem", color: "#d4d4d8", marginTop: "0.25rem" }}>
            {STAGE_NOTE[STAGES[stage].key]}
          </div>
        </div>
      </div>

      {/* update mode: incremental vs full rebuild */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.6rem" }}>
          One paragraph edited in ONE doc. How much work?
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem" }}>
          <button onClick={() => setMode("full")} style={pill(mode === "full", RED)}>
            Full rebuild (naive)
          </button>
          <button onClick={() => setMode("incremental")} style={pill(mode === "incremental", GREEN)}>
            Incremental upsert (by doc id)
          </button>
        </div>

        {(() => {
          const reembedded = mode === "full" ? CORPUS_CHUNKS : EDITED_CHUNKS;
          const frac = reembedded / CORPUS_CHUNKS;
          const barColor = mode === "full" ? RED : GREEN;
          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={label}>chunks re-embedded to capture the edit</span>
                <span style={{ ...mono, fontSize: "1.2rem", fontWeight: 600, color: barColor }}>
                  {fmt(reembedded)}
                </span>
              </div>
              {/* proportion bar */}
              <div style={{ height: 14, borderRadius: 4, background: "#27272a", marginTop: "0.4rem", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(frac * 100, 0.4)}%`,
                    height: "100%",
                    background: barColor,
                    borderRadius: 4,
                    transition: "width 0.25s",
                  }}
                />
              </div>
              <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.35rem" }}>
                out of {fmt(CORPUS_CHUNKS)} total chunks ({fmt(CORPUS_DOCS)} docs &times; {CHUNKS_PER_DOC} chunks)
              </div>
              <div style={{ fontSize: "0.82rem", color: "#d4d4d8", marginTop: "0.7rem" }}>
                {mode === "full" ? (
                  <>
                    Cost <span style={{ color: RED }}>&prop; corpus size</span>: re-parse,
                    re-chunk, and re-embed every one of {fmt(CORPUS_DOCS)} docs to capture a
                    single edit &mdash; hours and a big bill. Reserve this for embedding-model
                    or schema migrations, not routine edits.
                  </>
                ) : (
                  <>
                    Cost <span style={{ color: GREEN }}>&prop; size of the change</span>: a stable{" "}
                    <span style={{ ...mono, color: CYAN }}>doc-id &rarr; chunk-ids</span> map lets
                    you re-embed only this doc's {EDITED_CHUNKS} chunks and{" "}
                    <span style={{ ...mono, color: CYAN }}>upsert</span> them in place &mdash;
                    seconds, cents. On <span style={{ color: RED }}>delete</span>, remove the
                    doc's chunks by the same map, or a deleted doc keeps getting cited.
                  </>
                )}
              </div>
            </>
          );
        })()}
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Reading it</div>
        <div style={{ fontSize: "0.84rem", color: "#d4d4d8" }}>
          Retrieval quality is capped by ingestion quality &mdash; the query path can only
          surface what these stages wrote, and how they wrote it. Push expensive work (rich
          parsing, metadata, per-chunk summaries) here, off the critical path, because you
          pay it once and amortize over every future query. And key updates by doc id so a
          one-line edit costs a one-doc re-embed, not a corpus rebuild.
        </div>
      </div>
    </div>
  );
}

const STAGE_NOTE = {
  parse:
    "Turn a real file into clean text. The most underestimated stage: multi-column PDFs linearize into nonsense, HTML is wrapped in nav/ads/boilerplate, tables become word salad. Garbage-out here poisons everything downstream — no retrieval cleverness recovers a mangled parse.",
  clean:
    "Normalize whitespace/encoding, strip boilerplate the parser missed, and remove duplicate or near-duplicate docs (the same policy pasted into five pages) so retrieval isn't flooded with redundant chunks.",
  meta:
    "Attach structured fields per doc: source (for citation), section/heading, timestamp (freshness/staleness), and ACLs/permissions. Metadata lets retrieval FILTER before it ranks — skip ACLs here and the system can leak docs a user was never allowed to read; you can't add permissions at query time if the index doesn't carry them.",
  chunk:
    "Split each cleaned doc into retrieval-sized units. Boundary placement (respecting headings/paragraphs, size, overlap) decides whether a retrieved chunk is self-contained or sliced mid-thought.",
  embed:
    "Run each chunk through the embedding model to get its vector. This is the throughput-bound, expensive-but-off-critical-path work you pay once per chunk at write time.",
  index:
    "Write vectors plus metadata into the vector store / ANN index, keyed by a stable doc-id -> chunk-ids mapping so later edits and deletes can upsert/remove precisely.",
};
