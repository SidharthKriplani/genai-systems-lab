import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "__wr_b26";
const STATUS_OPTIONS = ["raw", "testing", "active", "dropped"];
const STATUS_COLORS = {
  raw:     { bg: "bg-zinc-700", text: "text-zinc-300", dot: "bg-zinc-400" },
  testing: { bg: "bg-amber-900/60", text: "text-amber-300", dot: "bg-amber-400" },
  active:  { bg: "bg-emerald-900/60", text: "text-emerald-300", dot: "bg-emerald-400" },
  dropped: { bg: "bg-zinc-800", text: "text-zinc-600", dot: "bg-zinc-600" },
};

const SEED_IDEAS = [
  { id: "wr1", title: "AI Systems Auditing", thesis: "Companies shipping RAG pipelines and agent systems have no idea how to evaluate them. Run structured evals, return a ranked diagnostic report.", why: "Why this: the lab is a systems failure encyclopedia — you know every failure mode by name.\nWhy now: 90% of Indian enterprises say their AI maturity is insufficient. Nobody auditing yet.\nWhy me: PrepLab + RAG Lab + Systems tab = the methodology already exists in your head.", status: "raw", notes: "B2B, $5–15K per engagement. Agents handle eval runs + report generation, you own the call.\nBetter angle: target GCC engineering teams or funded Indian product startups, not large enterprise." },
  { id: "wr2", title: "Prompt CI/CD as a Managed Service", thesis: "One prompt change caused 23% quality drop for 11 days undetected. Offer versioning + regression testing as a recurring service — agents run the eval suite on every change.", why: "Why this: real production gap, no Indian player owns this.\nWhy now: Indian product cos (Zepto, Meesho, Razorpay) are running LLMs in prod now.\nWhy me: you understand eval design + failure modes. The methodology is the moat, not the tooling.", status: "raw", notes: "Monthly retainer $2–4K/client. Better as a future pivot once auditing builds a client list." },
  { id: "wr3", title: "Technical AI Hiring Assessments", thesis: "Companies hiring AI engineers can't evaluate candidates beyond LeetCode. Build the assessment layer for what actually matters: RAG diagnosis, agent loop reasoning, prompt regression.", why: "Why this: PrepLab already exists — the question bank is built.\nWhy now: 2.9 lakh AI job postings in 2025, 53% skills deficit, skills-first hiring accelerating.\nWhy me: the lab IS the credential. You built the curriculum, you own the evaluation framework.", status: "raw", notes: "Per-assessment or subscription to HR/eng teams.\nTest: 3 mid-sized tech cos or staffing firms, free pilot round, see if they pay for the next." },
  { id: "wr4", title: "Agent-Operated Research-as-a-Service", thesis: "Global companies pay $5–20K/month for market research, competitive intelligence, due diligence. India has KPO firms doing this manually with 20-person teams. Run it solo via agents.", why: "Why this: India already has global trust + credibility for research work.\nWhy now: nobody in India running this as a solo agent-operated model. Window is 12–18 months.\nWhy me: agents handle research, synthesis, report generation. You own the methodology and client relationship.", status: "raw", notes: "Highest-conviction idea — cleanest match of India structural advantage + Polsia operating model.\nServe US/EU clients. Near 100% margin." },
  { id: "wr5", title: "Cold Outreach Engine as a Service", thesis: "B2B lead gen for SaaS: research → personalization → sequencing → follow-up, fully agent-run. You own ICP strategy, agents run the pipeline.", why: "Why this: Polsia does this for itself. Nobody selling it as a productized service yet.\nWhy now: outbound is broken everywhere, agents do it better and cheaper than any agency.\nWhy me: straightforward to orchestrate with existing agent tools. Low build cost.", status: "raw", notes: "$3–8K/month per client. Moat = quality of ICP targeting + personalization depth, not the automation." },
  { id: "wr6", title: "Fractional CFO via Agents (Global Startups)", thesis: "Financial modeling, investor reporting, board deck prep for early-stage startups globally. Agents run the models + draft narratives, you validate.", why: "Why this: early-stage startups can't afford a real CFO but need the function.\nWhy now: Indian finance talent is globally credible. Agent layer makes it economical solo.\nWhy me: if you can orchestrate the agents, the financial output is the easy part to validate.", status: "raw", notes: "$2–4K/month. Needs strong financial modeling knowledge or a co-founder who has it." },
  { id: "wr7", title: "Patent / IP Prior Art Research", thesis: "Law firms and corporates pay heavily for prior art searches. Traditional KPO firms do this with 20-person teams. Run it solo via agents at a fraction of the cost.", why: "Why this: high-value, low-volume — one engagement = meaningful revenue.\nWhy now: nobody running IP research as a solo agent-operated service.\nWhy me: India already has KPO credibility in this space. The agent layer is the differentiation.", status: "raw", notes: "US/EU law firms are the buyers. Risk: requires legal/IP domain credibility for first few clients." },
  { id: "wr8", title: "Regulatory Change Monitoring", thesis: "Companies across markets need to track regulatory shifts + get operational impact assessments. Agents monitor sources, classify changes, generate summaries. Recurring revenue.", why: "Why this: legal/compliance teams pay recurring fees — sticky, high-value.\nWhy now: regulatory complexity exploding (EU AI Act, data privacy, fintech regs).\nWhy me: monitoring + classification + report generation is a clean agent loop.", status: "raw", notes: "Target Indian companies with EU/US exposure, or global fintech/legal clients." },
  { id: "wr9", title: "M&A Research for Small PE / Family Offices", thesis: "Small PE firms and family offices need deal sourcing research, company profiles, financial summaries. Boutique firms pay $5–15K/month. Agent-operated, you own the judgment.", why: "Why this: traditional research firms are slow and expensive. Small PE can't afford McKinsey.\nWhy now: family office + small PE activity in India growing fast.\nWhy me: agent-run research + synthesis is exactly what this requires. High margin, no headcount.", status: "raw", notes: "Hard to get first client without warm intro to PE/family office world. High-value if you have that network." },
  { id: "wr10", title: "Agent-Run Product Analytics for Startups", thesis: "Event tracking setup, funnel analysis, weekly insight reports — all agent-run. Startups that can't hire a data team pay $1.5–3K/month for the function.", why: "Why this: every early-stage startup needs analytics but can't justify a data hire.\nWhy now: tooling (PostHog, Mixpanel, Amplitude) is standardized — agent orchestration over known APIs is tractable.\nWhy me: you've built analytics instrumentation for the lab. You know the workflow cold.", status: "raw", notes: "Recurring, agents handle 90% of delivery, you own the interpretation.\nNeeds volume — works if you can run 10+ clients with same effort as 2." },
];

function loadIdeas() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const seeded = SEED_IDEAS.map((s, i) => ({ ...s, createdAt: Date.now() + i, updatedAt: Date.now() + i }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(stored);
  }
  catch { return []; }
}
function saveIdeas(ideas) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas)); } catch {}
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const BLANK_FORM = { title: "", thesis: "", why: "", status: "raw", notes: "" };

export default function WarRoom({ onClose }) {
  const [ideas, setIdeas] = useState(loadIdeas);
  const [form, setForm] = useState(BLANK_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const titleRef = useRef(null);

  useEffect(() => {
    saveIdeas(ideas);
  }, [ideas]);

  useEffect(() => {
    if (showForm && titleRef.current) titleRef.current.focus();
  }, [showForm]);

  // close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (showForm) { setShowForm(false); setEditId(null); setForm(BLANK_FORM); }
        else { onClose(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm, onClose]);

  function openNew() {
    setForm(BLANK_FORM);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(idea) {
    setForm({ title: idea.title, thesis: idea.thesis, why: idea.why, status: idea.status, notes: idea.notes || "" });
    setEditId(idea.id);
    setShowForm(true);
  }

  function saveForm() {
    if (!form.title.trim()) return;
    if (editId) {
      setIdeas(prev => prev.map(i => i.id === editId ? { ...i, ...form, updatedAt: Date.now() } : i));
    } else {
      setIdeas(prev => [{ id: uid(), ...form, createdAt: Date.now(), updatedAt: Date.now() }, ...prev]);
    }
    setShowForm(false);
    setEditId(null);
    setForm(BLANK_FORM);
  }

  function cycleStatus(id) {
    setIdeas(prev => prev.map(i => {
      if (i.id !== id) return i;
      const next = STATUS_OPTIONS[(STATUS_OPTIONS.indexOf(i.status) + 1) % STATUS_OPTIONS.length];
      return { ...i, status: next, updatedAt: Date.now() };
    }));
  }

  function deleteIdea(id) {
    setIdeas(prev => prev.filter(i => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  const filtered = filter === "all" ? ideas : ideas.filter(i => i.status === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = ideas.filter(i => i.status === s).length;
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "#09090b" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-zinc-100 font-mono text-sm font-bold tracking-widest uppercase">WAR ROOM</span>
          <span className="text-zinc-600 text-xs font-mono">{ideas.length} ideas</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter pills */}
          <div className="flex items-center gap-1">
            {["all", ...STATUS_OPTIONS].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  filter === s
                    ? "bg-zinc-200 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {s}{s !== "all" && counts[s] > 0 ? ` ${counts[s]}` : ""}
              </button>
            ))}
          </div>
          <button
            onClick={openNew}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
          >
            + new idea
          </button>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 text-xs font-mono transition-colors"
          >
            esc
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filtered.length === 0 && (
          <div className="text-center py-24 text-zinc-700 font-mono text-sm">
            {filter === "all" ? "no ideas yet. start with + new idea" : `no ideas in ${filter}`}
          </div>
        )}
        <div className="grid gap-3 max-w-4xl mx-auto">
          {filtered.map(idea => {
            const sc = STATUS_COLORS[idea.status];
            const expanded = expandedId === idea.id;
            return (
              <div
                key={idea.id}
                className={`rounded-lg border border-zinc-800 bg-zinc-900 transition-all ${idea.status === "dropped" ? "opacity-40" : ""}`}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Status dot — click to cycle */}
                  <button
                    onClick={() => cycleStatus(idea.id)}
                    title={`status: ${idea.status} — click to cycle`}
                    className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${sc.dot} hover:ring-2 hover:ring-zinc-500 transition-all`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-zinc-100 font-mono text-sm font-semibold">{idea.title}</span>
                        {idea.thesis && (
                          <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{idea.thesis}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${sc.bg} ${sc.text}`}>
                          {idea.status}
                        </span>
                        <button
                          onClick={() => setExpandedId(expanded ? null : idea.id)}
                          className="text-zinc-600 hover:text-zinc-300 text-xs font-mono"
                        >
                          {expanded ? "less" : "more"}
                        </button>
                        <button
                          onClick={() => openEdit(idea)}
                          className="text-zinc-600 hover:text-zinc-300 text-xs font-mono"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => deleteIdea(idea.id)}
                          className="text-zinc-700 hover:text-red-500 text-xs font-mono transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
                        {idea.why ? (
                          <div>
                            <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider">why this · why now · why me</span>
                            <p className="text-zinc-300 text-xs mt-1 leading-relaxed whitespace-pre-wrap">{idea.why}</p>
                          </div>
                        ) : (
                          <p className="text-zinc-700 text-xs font-mono italic">no why/now/me — fill this or it stays raw forever</p>
                        )}
                        {idea.notes && (
                          <div>
                            <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider">notes</span>
                            <p className="text-zinc-400 text-xs mt-1 leading-relaxed whitespace-pre-wrap">{idea.notes}</p>
                          </div>
                        )}
                        <p className="text-zinc-700 text-[10px] font-mono">
                          added {new Date(idea.createdAt).toLocaleDateString()}
                          {idea.updatedAt !== idea.createdAt && ` · updated ${new Date(idea.updatedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit form — slides up from bottom */}
      {showForm && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-5">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                {editId ? "edit idea" : "new idea"}
              </span>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK_FORM); }}
                className="text-zinc-600 hover:text-zinc-300 text-xs font-mono"
              >
                cancel
              </button>
            </div>
            <input
              ref={titleRef}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="idea title"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <input
              value={form.thesis}
              onChange={e => setForm(f => ({ ...f, thesis: e.target.value }))}
              placeholder="one-line thesis — what's the bet?"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <textarea
              value={form.why}
              onChange={e => setForm(f => ({ ...f, why: e.target.value }))}
              placeholder="why this, why now, why me — leave blank and it stays raw forever"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="notes, links, data points (optional)"
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-300 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {STATUS_OPTIONS.map(s => {
                  const sc = STATUS_COLORS[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-colors ${
                        form.status === s ? `${sc.bg} ${sc.text}` : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex-1" />
              <button
                onClick={saveForm}
                disabled={!form.title.trim()}
                className="px-4 py-1.5 rounded bg-zinc-200 hover:bg-white text-zinc-900 text-xs font-mono font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {editId ? "save changes" : "add idea"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
