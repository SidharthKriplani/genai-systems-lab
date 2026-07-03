import { useState } from "react";

// The agentic coding loop: localize -> edit -> run tests -> observe -> retry.
// A failing test grounds the next attempt; the loop iterates until tests pass or
// the step budget runs out. Step through it and watch the feedback drive the fix.
export default function AgenticCodingViz({ onNavigate, spec } = {}) {
  const CYAN = "var(--gal-build, #22d3ee)";
  const GREEN = "#34d399";
  const RED = "#f87171";

  // A scripted run. Attempt 1 fails on an off-by-one; the test output grounds
  // attempt 2, which passes. Each "step" is one node in the loop.
  const STEPS = [
    { phase: "localize", attempt: 1, text: "search the repo for the failing symbol",
      detail: "grep + call graph point to slice_window() in window.py:42", kind: "act" },
    { phase: "edit", attempt: 1, text: "write a fix",
      detail: "return items[start : start + size]", kind: "act" },
    { phase: "run tests", attempt: 1, text: "execute the test suite",
      detail: "pytest test_window.py", kind: "run" },
    { phase: "observe", attempt: 1, text: "read the result",
      detail: "FAIL — test_last_window: expected 4 items, got 3 (off-by-one at the tail)", kind: "fail" },
    { phase: "retry", attempt: 1, text: "the failure grounds the next edit",
      detail: "the error names the tail case — the slice drops the final element", kind: "retry" },
    { phase: "localize", attempt: 2, text: "same site, informed by the failure",
      detail: "the boundary is the end index, not the start", kind: "act" },
    { phase: "edit", attempt: 2, text: "write the corrected fix",
      detail: "return items[start : min(start + size, len(items))]", kind: "act" },
    { phase: "run tests", attempt: 2, text: "execute the test suite again",
      detail: "pytest test_window.py", kind: "run" },
    { phase: "observe", attempt: 2, text: "read the result",
      detail: "PASS — 12 passed in 0.4s", kind: "pass" },
  ];

  const BUDGET = 12; // max steps before the loop is force-stopped

  const [i, setI] = useState(0); // index of last-executed step (-1 = not started)
  const [started, setStarted] = useState(false);

  const cur = started ? STEPS[Math.min(i, STEPS.length - 1)] : null;
  const done = started && i >= STEPS.length - 1;
  const stepsUsed = started ? Math.min(i + 1, STEPS.length) : 0;
  const overBudget = stepsUsed > BUDGET; // never here (9 < 12) — shown as headroom

  const card = {
    background: "var(--surface, #18181b)",
    border: "1px solid var(--border, #27272a)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };

  const btn = (color, disabled) => ({
    padding: "0.4rem 0.9rem",
    borderRadius: "0.5rem",
    fontSize: "0.8rem",
    cursor: disabled ? "default" : "pointer",
    background: "var(--surface-2, #1f1f23)",
    border: `1px solid ${disabled ? "var(--border, #27272a)" : color}`,
    color: disabled ? "#52525b" : color,
    fontWeight: 600,
  });

  const kindColor = (k) =>
    k === "fail" ? RED : k === "pass" ? GREEN : k === "retry" ? CYAN : "#a1a1aa";

  const advance = () => {
    if (!started) { setStarted(true); setI(0); return; }
    if (i < STEPS.length - 1) setI(i + 1);
  };
  const reset = () => { setStarted(false); setI(0); };

  return (
    <div style={{ color: "#e4e4e7", maxWidth: 760, margin: "0 auto", display: "flex",
      flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: 1.5 }}>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}>
          The agentic coding loop
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          localize → edit → run tests → observe → retry. A failing test grounds the
          next attempt; a step budget stops the loop running forever.
        </div>
      </div>

      {/* phase strip */}
      <div style={{ ...card, display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
        {["localize", "edit", "run tests", "observe", "retry"].map((p) => {
          const active = cur && cur.phase === p;
          return (
            <span key={p} style={{
              ...mono, fontSize: "0.74rem", padding: "0.25rem 0.55rem",
              borderRadius: "0.4rem",
              background: active ? "var(--surface-2, #1f1f23)" : "transparent",
              border: `1px solid ${active ? (cur && kindColor(cur.kind)) : "var(--border, #27272a)"}`,
              color: active ? (cur && kindColor(cur.kind)) : "#71717a",
              fontWeight: active ? 600 : 400,
            }}>
              {p}
            </span>
          );
        })}
      </div>

      {/* current step */}
      <div style={{ ...card, minHeight: 120,
        borderLeft: `2px solid ${cur ? kindColor(cur.kind) : "var(--border, #27272a)"}` }}>
        {!started ? (
          <div style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>
            A test is failing. Press run to step the agent through the loop and watch
            the first fix fail, the test output ground a second attempt, and the loop
            close when the suite goes green.
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ ...mono, fontSize: "0.72rem", color: "#71717a" }}>
                attempt {cur.attempt} · {cur.phase}
              </span>
              <span style={{ ...mono, fontSize: "0.72rem",
                color: cur.kind === "fail" ? RED : cur.kind === "pass" ? GREEN : "#71717a" }}>
                {cur.kind === "fail" ? "tests red" : cur.kind === "pass" ? "tests green" :
                  cur.kind === "run" ? "running…" : ""}
              </span>
            </div>
            <div style={{ fontSize: "0.95rem", color: "#fafafa", marginTop: "0.3rem" }}>
              {cur.text}
            </div>
            <div style={{ ...mono, fontSize: "0.8rem", color: kindColor(cur.kind), marginTop: "0.4rem" }}>
              {cur.detail}
            </div>
          </>
        )}
      </div>

      {/* budget gauge */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: "0.7rem", color: "#a1a1aa" }}>step budget</span>
          <span style={{ ...mono, fontSize: "0.85rem",
            color: overBudget ? RED : done ? GREEN : "#fafafa" }}>
            {stepsUsed} / {BUDGET} steps
          </span>
        </div>
        <div style={{ marginTop: "0.4rem", height: 12, background: "var(--surface-2, #1f1f23)",
          borderRadius: "0.3rem", overflow: "hidden", border: "1px solid var(--border, #27272a)" }}>
          <div style={{ width: `${Math.min((stepsUsed / BUDGET) * 100, 100)}%`, height: "100%",
            background: overBudget ? RED : done ? GREEN : "#71717a" }} />
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.3rem" }}>
          the loop stops if it hits {BUDGET} steps without passing — this is what
          keeps a stuck agent from burning tokens forever
        </div>
      </div>

      {/* controls */}
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
        <button onClick={advance} disabled={done}
          style={btn(done ? "#52525b" : done ? GREEN : cur && cur.kind === "fail" ? CYAN : GREEN, done)}>
          {!started ? "run the loop" : done ? "passed" : "next step"}
        </button>
        <button onClick={reset} style={btn("#a1a1aa", false)}>reset</button>
        {started && (
          <span style={{ ...mono, fontSize: "0.74rem", color: "#71717a" }}>
            step {stepsUsed} of {STEPS.length}
          </span>
        )}
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}`, fontSize: "0.82rem", color: "#d4d4d8" }}>
        The first edit was plausible and wrong. What made the second one right was
        not a smarter guess — it was the test output: "expected 4, got 3" named the
        exact tail case, and the retry acted on that fact. This is the whole point
        of the loop: the agent does not have to reason its way to correct in one
        shot, because the tests tell it, concretely, what is still broken. The step
        budget is the seatbelt — without a hard cap, a fix that never lands would
        iterate indefinitely.
      </div>
    </div>
  );
}
