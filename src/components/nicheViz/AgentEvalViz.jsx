import { useState } from "react";

// Agent trajectory eval: two eval modes over the SAME 6-step trajectory used
// as the worked example in the agent-eval-trajectory module's illustration
// ("TRAJECTORY 2 (broken path, lucky)" — scores 1/6 steps ok there too).
// "Outcome" grades only the final answer (PASS). "Trajectory" grades each step,
// exposing a hallucinated destructive tool call + a wrong tool arg + an ignored
// tool failure that outcome eval is blind to. Toggling makes the false-PASS visceral.
export default function AgentEvalViz({ onNavigate, spec } = {}) {
  const [mode, setMode] = useState("outcome"); // "outcome" | "trajectory"

  // The trajectory: a support agent handling "Where is my order #A-4471?"
  // Final answer happens to be correct, but the PATH is broken.
  const TASK = 'Ticket: "Where is my order #A-4471?"';
  const GOLDEN_FINAL = "It was delivered on Tuesday.";
  // Same Thought -> Action -> Observation loop ReAct teaches, just repeated and
  // scored per step (the final "reply" is itself an Action — final_answer()).
  // `ok` is the TRAJECTORY-eval verdict for the step. The final reply also gets
  // `outcomeOk` — outcome eval only compares final text to golden, so it reads
  // PASS there even though trajectory eval marks the same step "unearned".
  const steps = [
    { n: 1, kind: "plan", text: "Thought: look up the order by its ID", ok: true, note: "sound plan" },
    { n: 2, kind: "tool", text: 'Action: lookup_order("A-9999")', ok: false, note: "WRONG ARG — id was A-4471, not A-9999" },
    { n: 3, kind: "observe", text: 'Observation: "delivered Tuesday"', ok: false, note: "WRONG ORDER — another customer's order that happens to match" },
    { n: 4, kind: "tool", text: "Action: issue_refund()", ok: false, note: "HALLUCINATED destructive call — never requested" },
    { n: 5, kind: "observe", text: "Observation: refund failed", ok: false, note: "IGNORED — no error recovery, agent barreled ahead" },
    { n: 6, kind: "reply", text: 'Action: reply "It was delivered on Tuesday."', ok: false, outcomeOk: true, note: "UNEARNED — text matches golden, but built on the wrong order and an ignored refund failure" },
  ];

  const okCount = steps.filter((s) => s.ok).length;
  const finalCorrect = true; // final reply text matches golden (outcome eval's only check)

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

  const kindLabel = {
    plan: "THOUGHT",
    tool: "ACTION",
    observe: "OBSERV.",
    reply: "ACTION",
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
          Outcome eval vs. trajectory eval
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          The same agent run, two ways of grading it. The final answer is correct —
          but the path that produced it is broken. Watch what each mode sees.
        </div>
      </div>

      {/* mode toggle */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => setMode("outcome")} style={pill(mode === "outcome", CYAN)}>
          Outcome eval (final answer only)
        </button>
        <button onClick={() => setMode("trajectory")} style={pill(mode === "trajectory", GREEN)}>
          Trajectory eval (per step)
        </button>
      </div>

      {/* trajectory */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.6rem" }}>{TASK}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {steps.map((s) => {
            const isFinal = s.n === steps.length;
            // In outcome mode, only the final step is graded; others are dimmed/ungraded.
            const graded = mode === "trajectory" || isFinal;
            const showBad = mode === "trajectory" && !s.ok;
            // Outcome mode grades the final step by text-match only (outcomeOk);
            // trajectory mode grades every step by whether it was actually earned (ok).
            const gradeOk = mode === "outcome" && isFinal ? s.outcomeOk ?? s.ok : s.ok;
            const barColor = !graded ? "#3f3f46" : gradeOk ? GREEN : RED;
            return (
              <div
                key={s.n}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: "0.6rem",
                  opacity: graded ? 1 : 0.5,
                }}
              >
                <div style={{ width: 4, borderRadius: 2, background: barColor }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <span style={{ ...mono, fontSize: "0.62rem", color: "#71717a", width: 56 }}>
                      {kindLabel[s.kind]}
                    </span>
                    <span style={{ ...mono, fontSize: "0.8rem", color: "#e4e4e7" }}>{s.text}</span>
                    {mode === "trajectory" && (
                      <span
                        style={{
                          ...mono,
                          fontSize: "0.7rem",
                          marginLeft: "auto",
                          color: s.ok ? GREEN : RED,
                        }}
                      >
                        {s.ok ? "ok" : "FAIL"}
                      </span>
                    )}
                  </div>
                  {showBad && (
                    <div style={{ ...mono, fontSize: "0.66rem", color: RED, marginTop: "0.15rem", marginLeft: 60 }}>
                      {s.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ ...mono, fontSize: "0.66rem", color: "#71717a", marginTop: "0.6rem" }}>
          golden final answer: "{GOLDEN_FINAL}"
        </div>
      </div>

      {/* verdict panel */}
      <div style={{ ...card, borderLeft: `2px solid ${mode === "outcome" ? CYAN : GREEN}` }}>
        {mode === "outcome" ? (
          <>
            <div style={{ ...label, marginBottom: "0.35rem" }}>Outcome eval verdict</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
              <span style={{ ...mono, fontSize: "1.4rem", fontWeight: 600, color: GREEN }}>PASS</span>
              <span style={{ fontSize: "0.82rem", color: "#d4d4d8" }}>
                final answer matched the golden. That is all it checked.
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#a1a1aa", marginTop: "0.55rem" }}>
              Outcome eval graded only the last node and collapsed the whole run into
              one pass/fail. It is <span style={{ color: RED }}>blind</span> to the
              wrong tool argument at step 2 and the hallucinated{" "}
              <span style={{ ...mono, color: RED }}>issue_refund()</span> at step 4.
              In production this "passing" agent is issuing unauthorized refunds.
            </div>
          </>
        ) : (
          <>
            <div style={{ ...label, marginBottom: "0.35rem" }}>Trajectory eval verdict</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
              <span style={{ ...mono, fontSize: "1.4rem", fontWeight: 600, color: RED }}>
                {okCount}/{steps.length} steps ok
              </span>
              <span style={{ fontSize: "0.82rem", color: "#d4d4d8" }}>
                final answer still correct — but the path failed.
              </span>
            </div>
            <div style={{ ...mono, fontSize: "0.72rem", color: "#a1a1aa", marginTop: "0.55rem", lineHeight: 1.7 }}>
              tool-selection error &nbsp;·&nbsp; wrong tool argument (step 2)<br />
              hallucinated destructive call &nbsp;·&nbsp;{" "}
              <span style={{ ...mono, color: RED }}>issue_refund()</span> (step 4)<br />
              no error recovery: refund failed and was ignored (step 5), then the
              agent replied anyway on an unearned final answer (step 6)
            </div>
            <div style={{ fontSize: "0.82rem", color: "#d4d4d8", marginTop: "0.55rem" }}>
              Per-step scoring separates the agent you can ship from the one that is
              right for the wrong reasons. A golden-trajectory assertion that{" "}
              <span style={{ ...mono, color: CYAN }}>issue_refund</span> must never fire
              on a status lookup fails CI here — before finance notices.
            </div>
          </>
        )}
      </div>

      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Reading it</div>
        <div style={{ fontSize: "0.84rem", color: "#d4d4d8" }}>
          Both modes look at the identical run. Outcome eval says PASS because the
          destination was right; trajectory eval says {okCount}/{steps.length} because
          the road was broken. Ship on outcome, but debug, gate releases, and catch
          silent-safety regressions on the trajectory — an agent right for the wrong
          reasons is a production incident waiting for the input that breaks its luck.
        </div>
      </div>
    </div>
  );
}
