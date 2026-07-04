import { useState } from "react";

// LLM security guardrail instrument. A request + response flow through
// input filter -> model/context -> output filter -> (user AND tools). The user
// toggles attack scenarios and which guardrails are enabled, and watches each
// scenario get CAUGHT (green) or MISSED (red), with the specific control named.
export default function LlmSecurityViz({ onNavigate, spec } = {}) {
  // enabled controls
  const [inputRedact, setInputRedact] = useState(true);
  const [outputFilter, setOutputFilter] = useState(true);
  const [toolGate, setToolGate] = useState(true); // output filter gates TOOL calls too
  const [leastPriv, setLeastPriv] = useState(true); // scoped creds / least privilege

  const [active, setActive] = useState("pii-out"); // which scenario is under test

  // ---- monochrome palette ----
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
  const pill = (activeP, color) => ({
    ...mono,
    fontSize: "0.72rem",
    padding: "0.3rem 0.7rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    border: `1px solid ${activeP ? color : "var(--border, #27272a)"}`,
    background: activeP ? "var(--surface-2, #1f1f23)" : "transparent",
    color: activeP ? color : "#a1a1aa",
  });

  // Scenarios: each names the boundary it attacks and the control that stops it.
  const SCENARIOS = {
    "pii-out": {
      name: "PII in the output",
      story: "The model surfaces a customer's full credit-card number in its reply to the user.",
      boundary: "output → user",
      // the control that catches it, and the predicate that must be enabled
      caughtBy: "output filter (PII redaction)",
      isCaught: () => outputFilter,
      missMsg: "Nothing inspects the reply before it reaches the user — the card number is leaked.",
    },
    "pii-in": {
      name: "PII pasted on input",
      story: "A user pastes an SSN; it gets logged and embedded into your vector DB and a 3rd-party API.",
      boundary: "input → logs / store",
      caughtBy: "input redaction (before logging/storing)",
      isCaught: () => inputRedact,
      missMsg: "The raw SSN spreads into logs, the vector DB, and a third-party API — a compliance breach.",
    },
    "sysprompt": {
      name: "System-prompt leakage",
      story: "The model is coaxed into reciting its proprietary system prompt (and an embedded key) in its answer.",
      boundary: "output → user",
      caughtBy: "output filter (secret / system-prompt detection)",
      isCaught: () => outputFilter,
      missMsg: "The proprietary prompt and embedded key are handed to the user — an exfiltration.",
    },
    "exfil-tool": {
      name: "Tool-mediated exfiltration",
      story: "The agent is induced to put secret data into an OUTBOUND request (a URL it fetches / an email).",
      boundary: "output → tool (executed, not shown)",
      caughtBy: "output filter gating the TOOL CALL",
      // caught ONLY if the output filter also inspects tool calls (toolGate)
      isCaught: () => outputFilter && toolGate,
      missMsg:
        "A user-facing-only filter never sees this — the dangerous output is EXECUTED, not shown. The secret leaves your perimeter.",
    },
    "overscoped": {
      name: "Over-scoped tool call",
      story: "A 'read-a-file' agent, once compromised, tries to DELETE production storage with an over-broad credential.",
      boundary: "tool capability / blast radius",
      caughtBy: "least privilege (scoped read-only credential)",
      isCaught: () => leastPriv,
      missMsg:
        "The agent's credential can delete production, so the compromise wipes it — blast radius = everything the cred allows.",
    },
  };

  const sc = SCENARIOS[active];
  const caught = sc.isCaught();

  const toggleRow = (on, set, name, sub) => (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer", padding: "0.3rem 0" }}>
      <input type="checkbox" checked={on} onChange={() => set(!on)} style={{ accentColor: "#71717a", marginTop: 2 }} />
      <span>
        <span style={{ ...mono, fontSize: "0.76rem", color: on ? "#e4e4e7" : "#71717a" }}>{name}</span>
        <span style={{ display: "block", fontSize: "0.68rem", color: "#71717a" }}>{sub}</span>
      </span>
    </label>
  );

  return (
    <div style={{ color: "#e4e4e7", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem", lineHeight: 1.5 }}>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fafafa" }}>
          The guardrail pipeline (security beyond injection)
        </div>
        <div style={{ color: "#a1a1aa", fontSize: "0.82rem" }}>
          Pick an attack, toggle the controls, and see whether the request/response is
          caught. Note that the output guardrail must gate <em>tool calls</em>, not just user replies.
        </div>
      </div>

      {/* pipeline diagram */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Pipeline — where the controls sit</div>
        <div style={{ ...mono, fontSize: "0.7rem", color: "#a1a1aa", lineHeight: 1.7 }}>
          <span style={{ color: inputRedact ? GREEN : RED }}>[input redact]</span>
          {"  →  "}
          <span style={{ color: leastPriv ? GREEN : RED }}>[ model + context {"{secrets, tenants, sys-prompt}"} ]</span>
          {"  →  "}
          <span style={{ color: outputFilter ? GREEN : RED }}>[output filter]</span>
          <div style={{ paddingLeft: "1.5rem", marginTop: "0.25rem" }}>
            ├─►  user reply
            <br />
            └─►  tool call {"  "}
            <span style={{ color: toolGate ? GREEN : RED }}>{toolGate ? "(gated ✓)" : "(NOT gated ✗)"}</span>
            {"  "}
            <span style={{ color: leastPriv ? GREEN : RED }}>{leastPriv ? "· least-priv creds" : "· over-scoped creds"}</span>
          </div>
        </div>
      </div>

      {/* controls */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Controls (toggle to see what breaks)</div>
        {toggleRow(inputRedact, setInputRedact, "Input redaction", "Mask PII before logging / embedding / forwarding")}
        {toggleRow(outputFilter, setOutputFilter, "Output filter", "Block PII / secrets / unsafe content in responses")}
        {toggleRow(toolGate, setToolGate, "Output filter gates tool calls", "Inspect the tool call before it executes — not just the user reply")}
        {toggleRow(leastPriv, setLeastPriv, "Least privilege on tools", "Scope each agent to only the tools + narrowest credential it needs")}
      </div>

      {/* scenario selector */}
      <div style={card}>
        <div style={{ ...label, marginBottom: "0.5rem" }}>Attack scenario</div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {Object.entries(SCENARIOS).map(([k, s]) => (
            <button key={k} onClick={() => setActive(k)} style={pill(active === k, CYAN)}>{s.name}</button>
          ))}
        </div>
      </div>

      {/* verdict */}
      <div style={{ ...card, borderLeft: `3px solid ${caught ? GREEN : RED}` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <span style={{ ...mono, fontSize: "0.8rem", color: "#e4e4e7" }}>{sc.name}</span>
          <span style={{ ...mono, fontSize: "0.9rem", fontWeight: 700, color: caught ? GREEN : RED }}>
            {caught ? "CAUGHT" : "MISSED"}
          </span>
        </div>
        <div style={{ ...mono, fontSize: "0.68rem", color: "#71717a", marginBottom: "0.4rem" }}>
          boundary: {sc.boundary}
        </div>
        <div style={{ fontSize: "0.82rem", color: "#d4d4d8", marginBottom: "0.5rem" }}>{sc.story}</div>
        <div style={{ fontSize: "0.82rem", color: caught ? GREEN : RED }}>
          {caught
            ? `Stopped by: ${sc.caughtBy}.`
            : sc.missMsg}
        </div>
      </div>

      {/* reading it */}
      <div style={{ ...card, borderLeft: `2px solid ${CYAN}` }}>
        <div style={{ ...label, marginBottom: "0.3rem" }}>Reading it</div>
        <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>
          PII is two-sided: input redaction stops you spreading it into logs/stores; the
          output filter stops you leaking it to the user. Exfiltration (system prompt,
          cross-tenant, tool-mediated) is data getting <em>out</em>. The subtle one is
          tool-mediated exfiltration — turn off "gates tool calls" while keeping the output
          filter on, and it's still MISSED, because an agent's most dangerous output is
          executed, not shown. And least privilege is the backstop: even a fully-compromised
          agent can only do what its scoped credentials allow.
        </div>
      </div>
    </div>
  );
}
