import { useState } from "react";

// Building the context window for a code edit by fusing three retrieval sources:
// lexical (grep), dense (embedding), and structural (call-graph / imports).
// Toggle each on/off and watch which files land in context — structural is the
// one that catches a caller the other two miss.
export default function RepoContextViz({ onNavigate, spec } = {}) {
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

  // The edit: rename/retype the return of `parsePrice` in pricing.py.
  // Each candidate file is found by some subset of the three retrievers.
  const FILES = [
    {
      path: "pricing.py",
      why: "the file being edited",
      lexical: true, dense: true, structural: true,
      note: "contains parsePrice — grep hits, embedding matches, it's the edit site",
    },
    {
      path: "test_pricing.py",
      why: "tests that call parsePrice",
      lexical: true, dense: true, structural: true,
      note: "mentions parsePrice by name and is semantically about pricing",
    },
    {
      path: "invoice.py",
      why: "imports and calls parsePrice",
      lexical: false, dense: false, structural: true,
      note: "calls it through an alias `pp()` — no literal match, low embedding overlap, but the call graph sees the edge",
      critical: true,
    },
    {
      path: "docs/money.md",
      why: "prose about money handling",
      lexical: false, dense: true, structural: false,
      note: "semantically near 'price/money' but never calls the function",
    },
    {
      path: "utils_string.py",
      why: "has the word 'parse' elsewhere",
      lexical: true, dense: false, structural: false,
      note: "grep matches 'parse' but it's an unrelated string helper — a lexical false positive",
    },
  ];

  const [on, setOn] = useState({ lexical: true, dense: true, structural: true });
  const toggle = (k) => setOn((o) => ({ ...o, [k]: !o[k] }));

  const SOURCES = [
    { key: "lexical", name: "lexical", full: "grep / exact match" },
    { key: "dense", name: "dense", full: "embedding similarity" },
    { key: "structural", name: "structural", full: "call graph / imports" },
  ];

  // a file is in context if any enabled source retrieves it
  const retrieves = (f) => SOURCES.some((s) => on[s.key] && f[s.key]);
  const inContext = FILES.filter(retrieves);
  const criticalMissed = FILES.find((f) => f.critical && !retrieves(f));

  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };

  const btn = (active, color) => ({
    padding: "0.4rem 0.75rem",
    borderRadius: "0.5rem",
    fontSize: "0.78rem",
    cursor: "pointer",
    background: active ? "var(--surface-2, #1f1f23)" : "transparent",
    border: `1px solid ${active ? color : "var(--border, #27272a)"}`,
    color: active ? color : "#71717a",
    fontWeight: active ? 600 : 400,
    textAlign: "left",
  });

  const dot = (present, enabled) => ({
    ...mono,
    fontSize: "0.68rem",
    padding: "0.1rem 0.35rem",
    borderRadius: "0.3rem",
    background: present && enabled ? "var(--surface-2, #1f1f23)" : "transparent",
    color: present ? (enabled ? "#e4e4e7" : "#52525b") : "#3f3f46",
    border: `1px solid ${present && enabled ? "var(--border, #27272a)" : "transparent"}`,
  });

  return (
    <div style={{ color: "#e4e4e7", maxWidth: 760, margin: "0 auto", display: "flex",
      flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: 1.5 }}>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}>
          Building the context window for a code edit
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Task: change the return type of <span style={mono}>parsePrice</span> in{" "}
          <span style={mono}>pricing.py</span>. Fuse three retrievers to find every
          file that needs to come along.
        </div>
      </div>

      {/* source toggles */}
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        {SOURCES.map((s) => (
          <button key={s.key} onClick={() => toggle(s.key)}
            style={{ ...btn(on[s.key], CYAN), flex: 1, minWidth: 150 }}>
            <div style={{ fontWeight: 600 }}>
              {on[s.key] ? "on" : "off"} · {s.name}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#71717a" }}>{s.full}</div>
          </button>
        ))}
      </div>

      {/* candidate table */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: "0.7rem", color: "#71717a", marginBottom: "0.5rem" }}>
          <span>candidate file</span>
          <span style={{ ...mono }}>lex · dense · struct</span>
        </div>
        {FILES.map((f) => {
          const got = retrieves(f);
          return (
            <div key={f.path} style={{
              display: "flex", flexDirection: "column", gap: "0.2rem",
              padding: "0.55rem 0", borderTop: "1px solid var(--border, #27272a)",
              opacity: got ? 1 : 0.5,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ ...mono, fontSize: "0.82rem",
                  color: got ? (f.critical ? GREEN : "#fafafa") : "#71717a" }}>
                  {got ? "▸ " : "  "}{f.path}
                </span>
                <span style={{ display: "flex", gap: "0.3rem" }}>
                  {SOURCES.map((s) => (
                    <span key={s.key} style={dot(f[s.key], on[s.key])}>
                      {f[s.key] ? s.name.slice(0, 3) : "—"}
                    </span>
                  ))}
                </span>
              </div>
              <div style={{ fontSize: "0.72rem", color: got ? "#a1a1aa" : "#52525b" }}>
                {f.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* summary */}
      <div style={{ ...card, borderLeft: `2px solid ${criticalMissed ? RED : GREEN}` }}>
        <div style={{ ...mono, fontSize: "0.85rem" }}>
          <span style={{ color: "#a1a1aa" }}>in context:</span>{" "}
          <span style={{ color: "#fafafa" }}>{inContext.length} / {FILES.length} files</span>
        </div>
        {criticalMissed ? (
          <div style={{ fontSize: "0.82rem", color: "#d4d4d8", marginTop: "0.4rem" }}>
            Missing <span style={{ ...mono, color: RED }}>{criticalMissed.path}</span> — it calls{" "}
            <span style={mono}>parsePrice</span> through an alias, so grep finds no
            literal match and its embedding sits far from the query. Only the call
            graph knows the edge exists. Edit without it and this caller breaks silently.
          </div>
        ) : (
          <div style={{ fontSize: "0.82rem", color: "#d4d4d8", marginTop: "0.4rem" }}>
            Structural retrieval caught{" "}
            <span style={{ ...mono, color: GREEN }}>invoice.py</span> — the aliased
            caller that lexical and dense both miss. That is the file that would have
            broken silently after the edit.
          </div>
        )}
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}`, fontSize: "0.82rem", color: "#d4d4d8" }}>
        Each retriever fails differently. Lexical is exact but literal — it drags in{" "}
        <span style={mono}>utils_string.py</span> on a coincidental word and misses
        aliased calls. Dense understands meaning but rewards prose, so it pulls docs
        and skips a real caller with low text overlap. Structural follows actual
        edges in the code, which is the only source that reliably finds who depends
        on the thing you are about to change. Fusing all three is what makes the
        context both complete and precise.
      </div>
    </div>
  );
}
