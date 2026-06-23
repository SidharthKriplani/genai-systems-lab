import { useState } from "react";
import { track } from "./analytics";
import { getAreaReadiness } from "./readiness";
import { TradeoffCard } from "./shared";

const TRADEOFF = {
  title: "Which agent pattern fits your task?",
  options: [
    {
      name: "Single Agent",
      tagline: "One model. One loop. One tool set.",
      when: "Task is well-defined, tools are fewer than 5, and success is easy to verify. Start here — add complexity only when this fails.",
      color: "#22c55e",
      dims: [
        { label: "Reliability",    value: 3 },
        { label: "Debug ease",     value: 3 },
        { label: "Task scope",     value: 1 },
        { label: "Infra overhead", value: 1 },
      ],
    },
    {
      name: "Multi-Agent",
      tagline: "Parallel specialists. Shared state.",
      when: "Subtasks are clearly separable and each benefits from a focused specialist (e.g. researcher + writer + critic running in parallel).",
      color: "#f59e0b",
      dims: [
        { label: "Reliability",    value: 2 },
        { label: "Debug ease",     value: 2 },
        { label: "Task scope",     value: 2 },
        { label: "Infra overhead", value: 2 },
      ],
    },
    {
      name: "Orchestrated",
      tagline: "Planner delegates to worker agents.",
      when: "Long-horizon tasks, more than 10 tools, or human-in-the-loop checkpoints are required. Accept higher failure rate by design.",
      color: "#a78bfa",
      dims: [
        { label: "Reliability",    value: 1 },
        { label: "Debug ease",     value: 1 },
        { label: "Task scope",     value: 3 },
        { label: "Infra overhead", value: 3 },
      ],
    },
  ],
};

const CONCEPTS = [
  { id: "agent",       label: "Agent Loop",    fidelity: "~ Simplified", fidelityColor: "#a78bfa", desc: "The ReAct loop step by step — Thought → Action → Observation — and where each stage breaks.", gymId: "ai-agents" },
  { id: "agent-tools", label: "Tool Design",   fidelity: "~ Simplified", fidelityColor: "#a78bfa", desc: "Consequence levels, idempotency, and permission architecture. Tools an agent won't misuse.", gymId: "ai-agents" },
  { id: "multiagent",  label: "Multi-Agent",   fidelity: "~ Simplified", fidelityColor: "#a78bfa", desc: "Supervisor, pipeline, and mesh patterns. Inter-agent communication and failure budgets.", gymId: "ai-agents" },
  { id: "guardrails",  label: "Guardrails",    fidelity: "~ Simplified", fidelityColor: "#a78bfa", desc: "Input classifiers, output filters, privilege separation. The safety layer every agent needs.", gymId: "ai-agents" },
];

const GT_POSTS = [
  { id: "agent-failure-modes",        title: "How AI Agents Fail in Production: A Full Taxonomy", desc: "Tool misuse, infinite loops, hallucinated tool calls, context bleed — with worked examples from the lab.", readMin: 11, tag: "Core" },
  { id: "react-pattern",              title: "The ReAct Pattern: How LLM Agents Reason and Act", desc: "Thought → Action → Observation loops explained. How ReAct enables tool use and where it breaks.", readMin: 8,  tag: "Architecture" },
  { id: "tool-use-design",            title: "Tool Use Design for AI Agents: Contracts, Consequences, and MCP", desc: "How to design tools an agent won't misuse. Consequence levels, idempotency, and the Model Context Protocol.", readMin: 9,  tag: "Design" },
  { id: "tracing-agent-loops",        title: "Tracing Agent Loops: How to Debug Step-by-Step Execution", desc: "What a step trace reveals, how to spot loops, wrong tool calls, and hallucinated observations.", readMin: 8,  tag: "Debugging" },
  { id: "mcp-explained",              title: "Model Context Protocol: The Standard for Agent Tool Integration", desc: "Client-host-server model, tools vs resources vs prompts, enterprise adoption case, and security architecture.", readMin: 10, tag: "MCP" },
  { id: "agent-tool-use-production",  title: "Tool Use in Production Agents: Idempotency, Retries, and Audit Trails", desc: "Idempotency key design, read vs write retry strategy, tool schema requirements, and compliance audit logs.", readMin: 11, tag: "Production" },
  { id: "agent-observability",        title: "Observability for Agent Systems: Traces, Cost, and Alerts", desc: "Why logs alone fail for agents. Distributed trace anatomy, cost p95 vs mean, TTFT, and actionable alert thresholds.", readMin: 12, tag: "Production" },
  { id: "agent-testing-strategies",   title: "Testing Agentic Systems: From Unit Tests to Trajectory Evaluation", desc: "Why unit tests are insufficient. Mock-based behavioral tests, trajectory evaluation, LLM-as-judge, and red teaming prompt injection.", readMin: 12, tag: "Testing" },
  { id: "agent-security",             title: "Security for AI Agents: Prompt Injection, OWASP LLM Top 10, and Least Privilege", desc: "Indirect vs direct injection, OWASP LLM01/07/08, least privilege tool design, input/output guardrails, and supply chain attacks.", readMin: 12, tag: "Security" },
];

const PREPLAB_Qs = [
  { id: "agents-9", difficulty: "Easy",   diffColor: "#22c55e", gated: true, question: "Prompt injection via tool outputs is dangerous because:" },
  { id: "agents-1", difficulty: "Medium", diffColor: "#f59e0b", gated: true, question: "Your agent calls the same tool 3 times with identical inputs in one turn. This indicates:" },
  { id: "agents-3", difficulty: "Hard",   diffColor: "#ef4444", gated: true, question: "In a multi-agent system, Agent A passes results to Agent B via shared memory. Agent B outputs are consistently wrong despite correct inputs from A. Most likely cause?" },
];

function getProgress() {
  try {
    const leaderboard = JSON.parse(localStorage.getItem("genai_leaderboard") || "{}");
    const history     = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
    const mastery     = JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]");
    const labDone     = Object.keys(leaderboard).filter(k => k.startsWith("agentlab:")).length;
    const agentQs     = Object.keys(history).filter(k => k.startsWith("agents")).length;
    const agentOk     = Object.keys(history).filter(k => k.startsWith("agents") && history[k]?.correct).length;
    const conceptsDone = mastery.filter(id => ["agent","agent-tools","multiagent","guardrails"].includes(id)).length;
    return { labDone, agentQs, agentOk, conceptsDone };
  } catch { return { labDone: 0, agentQs: 0, agentOk: 0, conceptsDone: 0 }; }
}

function SectionLabel({ children }) {
  return <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{children}</p>;
}

export default function AgentsHub({ onNavigate, onNavigateTo }) {
  const [progress]  = useState(getProgress);
  const [readiness] = useState(() => getAreaReadiness("agentshub"));
  const COLOR = "#a78bfa";

  function goGT(postId) { track("agents_hub_gt", { postId }); if (onNavigateTo) onNavigateTo({ tab: "groundtruth", postId }); else onNavigate("groundtruth"); }
  function goConcepts(gymId) { track("agents_hub_concepts", { gymId }); if (onNavigateTo) onNavigateTo({ tab: "concepts", gymId }); else onNavigate("concepts"); }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">

      {/* Intro */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: COLOR }}>Agents</div>
          {readiness && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: readiness.color, borderColor: readiness.color + "40", background: readiness.color + "12" }}>{readiness.level} · {readiness.pct}%</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">Why can't it complete complex tasks reliably?</h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          Agents fail in predictable ways — tool loops, state amnesia, cascade failures, indirect injection. 57% of organisations already have agents in production. The engineers who understand these failure modes aren't the ones who built agents from tutorials. They're the ones who've watched them fail and diagnosed why.
        </p>
        {progress.labDone > 0 && (
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: COLOR }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLOR }} />
            {progress.labDone} Agent Lab modules completed
          </div>
        )}
      </div>

      {/* Lab */}
      <div>
        <SectionLabel>The Lab</SectionLabel>
        <button onClick={() => { track("agents_hub_lab", {}); onNavigate("agentlab"); }}
          className="w-full text-left rounded-2xl p-6 transition-all card-lift"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">Agent Lab</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", color: COLOR }}>16 modules</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">Configure tool loops, context overflow, delegation failures, and state amnesia. Each module makes you diagnose a specific agent failure mode — not read about it, diagnose it.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Tool loops", "State amnesia", "Cascade failure", "Indirect injection", "Multi-agent"].map(f => (
                  <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{f}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0 hidden sm:flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLOR} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold" style={{ color: COLOR }}>Open Agent Lab →</div>
        </button>
      </div>

      {/* Tradeoff */}
      <div>
        <SectionLabel>When to use what</SectionLabel>
        <TradeoffCard data={TRADEOFF} />
      </div>

      {/* Concepts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Key Concepts</SectionLabel>
          <button onClick={() => goConcepts("ai-agents")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All Concepts →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONCEPTS.map(c => (
            <button key={c.id} onClick={() => goConcepts(c.gymId)}
              className="text-left p-4 rounded-xl transition-all card-lift"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-white">{c.label}</span>
                <span className="text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded" style={{ color: c.fidelityColor, background: c.fidelityColor + "15", border: `1px solid ${c.fidelityColor}30` }}>{c.fidelity}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
              <span className="mt-2 text-[11px] font-bold text-violet-400 block">Open in Concepts →</span>
            </button>
          ))}
        </div>
      </div>

      {/* GT */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>From the Field</SectionLabel>
          <button onClick={() => onNavigate("groundtruth")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All GT posts →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GT_POSTS.map(p => (
            <button key={p.id} onClick={() => goGT(p.id)}
              className="text-left p-4 rounded-xl transition-all card-lift"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">{p.tag}</span>
                <span className="text-[9px] font-mono text-zinc-500">{p.readMin} min</span>
              </div>
              <p className="text-sm font-bold text-white leading-snug mb-1">{p.title}</p>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{p.desc}</p>
              <span className="mt-2 text-[11px] font-bold text-violet-400 block">Read →</span>
            </button>
          ))}
        </div>
      </div>

      {/* PrepLab */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Test Your Judgment</SectionLabel>
          <button onClick={() => { track("agents_hub_preplab_all", {}); onNavigate("preplab"); }} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All agent questions →</button>
        </div>
        <div className="space-y-3">
          {PREPLAB_Qs.map(q => (
            <div key={q.id} className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ color: q.diffColor, borderColor: q.diffColor + "40", background: q.diffColor + "10" }}>{q.difficulty}</span>
                {q.gated && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500">Access code</span>}
              </div>
              <p className="text-sm text-zinc-200 leading-snug mb-3">{q.question}</p>
              <button onClick={() => { track("agents_hub_q", { id: q.id }); onNavigate("preplab"); }} className="text-[11px] font-bold hover:opacity-80" style={{ color: COLOR }}>Answer in PrepLab →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      {(progress.labDone > 0 || progress.agentQs > 0 || progress.conceptsDone > 0) && (
        <div>
          <SectionLabel>Your Progress Here</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.labDone}<span className="text-zinc-500 text-sm font-normal">/16</span></div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Modules done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.conceptsDone}<span className="text-zinc-500 text-sm font-normal">/4</span></div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Concepts done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.agentQs > 0 ? Math.round(progress.agentOk / progress.agentQs * 100) + "%" : "–"}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Agent accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
