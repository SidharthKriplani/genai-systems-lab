import { useState } from "react";

// Classical NLP layers on one sentence: toggle POS tags, NER spans (grey-ramp
// intensity), BIO tags, and dependency arcs drawn as SVG arcs between tokens.
export default function ClassicalTasksViz({ onNavigate, spec } = {}) {
  const [layer, setLayer] = useState("ner"); // pos | ner | bio | dep

  // Tokens with all annotations precomputed.
  // dep.head = index of syntactic head (-1 = root); ent = entity type or null.
  const TOK = [
    { w: "Tim", pos: "PROPN", ent: "PER", bio: "B-PER", head: 1, rel: "compound" },
    { w: "Cook", pos: "PROPN", ent: "PER", bio: "I-PER", head: 2, rel: "nsubj" },
    { w: "met", pos: "VERB", ent: null, bio: "O", head: -1, rel: "root" },
    { w: "Bank", pos: "PROPN", ent: "ORG", bio: "B-ORG", head: 2, rel: "dobj" },
    { w: "of", pos: "ADP", ent: "ORG", bio: "I-ORG", head: 3, rel: "prep" },
    { w: "America", pos: "PROPN", ent: "ORG", bio: "I-ORG", head: 4, rel: "pobj" },
    { w: "in", pos: "ADP", ent: null, bio: "O", head: 2, rel: "prep" },
    { w: "April", pos: "PROPN", ent: "DATE", bio: "B-DATE", head: 6, rel: "pobj" },
  ];

  // grey-ramp intensity per entity type (NOT rainbow)
  const ENT_SHADE = { PER: "#e4e4e7", ORG: "#a1a1aa", DATE: "#71717a" };

  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";

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

  // SVG geometry for token row + dependency arcs
  const COL = 74;
  const PADX = 30;
  const W = PADX * 2 + COL * TOK.length;
  const ARC_H = 74;
  const BASE_Y = ARC_H + 24; // token baseline
  const cx = (i) => PADX + COL * i + COL / 2;

  const LAYERS = {
    pos: "Part-of-speech: each token's grammatical category.",
    ner: "Named entities: multi-token spans, typed. Shade = entity type (grey ramp, not rainbow).",
    bio: "BIO tags: Begin / Inside / Outside encode span boundaries into per-token labels.",
    dep: "Dependency parse: directed arcs from each word to its syntactic head.",
  };

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
          One sentence, four classical annotation layers
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          The tasks that lived under NLP before LLMs — and still run as fast,
          reliable taggers in production.
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button onClick={() => setLayer("pos")} style={pill(layer === "pos")}>POS tags</button>
        <button onClick={() => setLayer("ner")} style={pill(layer === "ner")}>NER spans</button>
        <button onClick={() => setLayer("bio")} style={pill(layer === "bio")}>BIO tags</button>
        <button onClick={() => setLayer("dep")} style={pill(layer === "dep")}>dependency arcs</button>
      </div>

      <div style={card}>
        <div style={{ ...label, marginBottom: "0.4rem" }}>{LAYERS[layer]}</div>

        {/* dependency arcs layer uses SVG; others render token chips */}
        {layer === "dep" ? (
          <div style={{ display: "flex", justifyContent: "center", overflowX: "auto" }}>
            <svg width={W} height={BASE_Y + 46}>
              {/* arcs */}
              {TOK.map((t, i) => {
                if (t.head < 0) return null;
                const x1 = cx(i);
                const x2 = cx(t.head);
                const span = Math.abs(i - t.head);
                const h = ARC_H - span * 8;
                const midX = (x1 + x2) / 2;
                const topY = BASE_Y - Math.max(20, h);
                const d = `M ${x1} ${BASE_Y - 6} Q ${midX} ${topY} ${x2} ${BASE_Y - 6}`;
                return (
                  <g key={i}>
                    <path d={d} fill="none" stroke={CYAN} strokeWidth={1.5} opacity={0.8} />
                    <text
                      x={midX}
                      y={topY + 12}
                      fill="#a1a1aa"
                      fontSize="9"
                      textAnchor="middle"
                      style={mono}
                    >
                      {t.rel}
                    </text>
                    {/* arrowhead at the head token */}
                    <circle cx={x2} cy={BASE_Y - 6} r={2.5} fill={CYAN} />
                  </g>
                );
              })}
              {/* root marker */}
              {TOK.map((t, i) =>
                t.head < 0 ? (
                  <text key={"root" + i} x={cx(i)} y={16} fill={GREEN} fontSize="9" textAnchor="middle" style={mono}>
                    root
                  </text>
                ) : null
              )}
              {/* tokens */}
              {TOK.map((t, i) => (
                <text
                  key={"t" + i}
                  x={cx(i)}
                  y={BASE_Y + 14}
                  fill="#e4e4e7"
                  fontSize="13"
                  textAnchor="middle"
                  style={mono}
                >
                  {t.w}
                </text>
              ))}
            </svg>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", justifyContent: "center", padding: "0.5rem 0" }}>
            {TOK.map((t, i) => {
              const isEnt = t.ent != null;
              const shade = isEnt ? ENT_SHADE[t.ent] : "#3f3f46";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                  <span
                    style={{
                      ...mono,
                      fontSize: "0.95rem",
                      padding: "0.3rem 0.5rem",
                      borderRadius: "0.4rem",
                      color: layer === "ner" && isEnt ? "#18181b" : "#e4e4e7",
                      background:
                        layer === "ner" && isEnt
                          ? shade
                          : "var(--surface-2, #1f1f23)",
                      border: `1px solid ${layer === "ner" && isEnt ? shade : "var(--border, #27272a)"}`,
                    }}
                  >
                    {t.w}
                  </span>
                  {/* annotation under each token */}
                  {layer === "pos" && (
                    <span style={{ ...mono, fontSize: "0.62rem", color: "#a1a1aa" }}>{t.pos}</span>
                  )}
                  {layer === "ner" && (
                    <span style={{ ...mono, fontSize: "0.62rem", color: isEnt ? "#d4d4d8" : "#52525b" }}>
                      {t.ent || "—"}
                    </span>
                  )}
                  {layer === "bio" && (
                    <span
                      style={{
                        ...mono,
                        fontSize: "0.62rem",
                        color: t.bio.startsWith("B") ? CYAN : t.bio.startsWith("I") ? "#a1a1aa" : "#52525b",
                      }}
                    >
                      {t.bio}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* legend / detail per layer */}
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginTop: "0.6rem" }}>
          {layer === "ner" && (
            <span>
              shade ramp:&nbsp;
              <span style={{ color: ENT_SHADE.PER }}>PER</span> ·{" "}
              <span style={{ color: ENT_SHADE.ORG }}>ORG</span> ·{" "}
              <span style={{ color: ENT_SHADE.DATE }}>DATE</span>
              &nbsp;— "Bank of America" is ONE 3-token span, not three.
            </span>
          )}
          {layer === "bio" && (
            <span>
              <span style={{ color: CYAN }}>B</span>=begin a span ·{" "}
              I=inside · O=outside. Boundaries live in the tags {"->"} span task
              becomes token classification. I-ORG can never follow O (a CRF enforces this).
            </span>
          )}
          {layer === "pos" && <span>PROPN=proper noun · VERB · ADP=adposition. Same word can flip category by context.</span>}
          {layer === "dep" && <span>Each arc points a word to its head; "met" is the root. Contrast: constituency parses would nest phrases in brackets instead.</span>}
        </div>
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Why production still runs these</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          A fine-tuned tagger is milliseconds and near-free per document, and it can
          only emit spans that truly exist in the text — so it never hallucinates an
          entity and gives exact character offsets for click-to-source. LLMs win
          zero/few-shot flexibility; classical taggers win latency, cost, and hard
          structured guarantees. The mature pattern runs both.
        </div>
      </div>
    </div>
  );
}
