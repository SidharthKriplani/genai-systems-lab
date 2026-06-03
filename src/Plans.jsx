// src/Plans.jsx — Pricing + access code page (PAL-style Plans)
import { useState } from "react";
import { track } from "./analytics";
import { validateCode, grantAccess, isAccessGranted } from "./utils/accessCode";

const FREE_FEATURES = [
  "All 6 interactive labs — RAG, Agent, Eval, LLM, Prompt, Foundation Models",
  "All 5 challenge area hub pages with guided concepts",
  "226 Ground Truth posts — practitioner-written deep dives",
  "10 PrepLab questions per session — MCQ, multi-select, text",
  "Readiness tracking across all 5 challenge areas",
  "Study plans + guided paths",
];

const FULL_FEATURES = [
  "Unlimited PrepLab — all 319 questions, no per-session cap",
  "Company Tracks — Google, Meta, Amazon, OpenAI interview patterns",
  "Interview Prep Plan — 4-step brief builder with JD analysis",
  "Staff-level questions — the hardest 60 questions, gated",
  "Mock Exam Mode — timed, forward-only, full pressure",
  "Scenario deep dives — 6 multi-step incident walkthroughs",
  "Spaced repetition queue — Review Due mode",
];

function Check({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
      <circle cx="7" cy="7" r="7" fill={color + "22"} />
      <path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function PlansPage({ onNavigate }) {
  const [code,      setCode]      = useState("");
  const [status,    setStatus]    = useState(null); // null | "success" | "error"
  const [unlocked,  setUnlocked]  = useState(() => isAccessGranted());
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      if (validateCode(code)) {
        grantAccess();
        setUnlocked(true);
        setStatus("success");
        track("access_code_redeemed", { valid: true });
      } else {
        setStatus("error");
        track("access_code_redeemed", { valid: false });
      }
      setSubmitting(false);
    }, 400);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

      {/* ── Headline ─────────────────────────────────────────────────── */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h1 className="text-3xl font-black text-white leading-tight">
          The gap isn't knowledge.{" "}
          <span style={{ background: "linear-gradient(90deg, var(--gal-build) 0%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            It's production judgment.
          </span>
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Interviewers don't ask you to recite theory. They put you in a real scenario — a RAG system is hallucinating, an agent is looping, an eval shows 94% accuracy but your product is broken — and watch how you reason through it. GSL trains exactly that.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-[11px] font-mono text-zinc-500 pt-1">
          <span>✓ 6 interactive labs</span>
          <span>✓ 319 practice questions</span>
          <span>✓ 226 GT posts</span>
          <span>✓ No subscription</span>
        </div>
      </div>

      {/* ── Tier cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Free tier */}
        <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">FREE</p>
            <p className="text-4xl font-black text-white">$0</p>
            <p className="text-xs text-zinc-500 mt-1">No card required · No account required</p>
          </div>
          <div className="space-y-2.5">
            {FREE_FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                <Check color="#22c55e" />
                {f}
              </div>
            ))}
          </div>
          <button onClick={() => { track("plans_start_free"); onNavigate("retrieval"); }}
            className="w-full py-3 rounded-xl text-sm font-bold text-zinc-300 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all">
            Start exploring →
          </button>
        </div>

        {/* Full access tier */}
        <div className="rounded-2xl p-6 space-y-5 relative overflow-hidden"
          style={{ background: unlocked ? "linear-gradient(160deg, rgba(34,211,238,0.06) 0%, rgba(139,92,246,0.04) 100%)" : "var(--surface-2)", border: unlocked ? "1px solid rgba(34,211,238,0.3)" : "1px solid var(--gal-build-border)", borderTop: "2px solid var(--gal-build)" }}>

          {/* Best value badge */}
          <div className="absolute top-0 right-5 -translate-y-1/2">
            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: "var(--gal-build)", color: "#0f172a" }}>
              {unlocked ? "UNLOCKED" : "BEST VALUE"}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--gal-build)" }}>FULL ACCESS</p>
            <p className="text-4xl font-black text-white">Free</p>
            <p className="text-xs text-zinc-400 mt-1">Community access · Enter code below</p>
          </div>
          <div className="space-y-2.5">
            {FULL_FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: unlocked ? "#e4e4e7" : "#a1a1aa" }}>
                <Check color={unlocked ? "var(--gal-build)" : "#52525b"} />
                {f}
              </div>
            ))}
          </div>

          {unlocked ? (
            <div className="w-full py-3 rounded-xl text-sm font-bold text-center"
              style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)", color: "var(--gal-build)" }}>
              ✓ Full access active
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setStatus(null); }}
                placeholder="Enter access code"
                className="w-full px-4 py-3 rounded-xl text-sm font-mono text-white placeholder-zinc-600 outline-none focus:ring-1 transition-all"
                style={{ background: "var(--bg)", border: status === "error" ? "1px solid #ef4444" : "1px solid var(--border)", caretColor: "var(--gal-build)" }}
              />
              <button type="submit" disabled={submitting || !code.trim()}
                className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, var(--gal-build) 0%, #6366f1 100%)", boxShadow: code.trim() ? "0 0 20px rgba(34,211,238,0.2)" : "none" }}>
                {submitting ? "Checking…" : "Unlock full access →"}
              </button>
              {status === "error" && (
                <p className="text-[11px] text-red-400 text-center">Invalid code — check for typos.</p>
              )}
              <p className="text-[10px] text-zinc-600 text-center">
                Have a code from the community?{" "}
                <a href="https://www.linkedin.com/in/sidharthkriplani/" target="_blank" rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 underline transition-colors">
                  Get one on LinkedIn →
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── What's inside ────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">WHAT'S INSIDE — ALL 6 LABS</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "RAG Lab",              color: "var(--gal-build)" },
            { label: "Agent Lab",            color: "#f59e0b" },
            { label: "Eval Lab",             color: "#6366f1" },
            { label: "LLM Lab",              color: "#3b82f6" },
            { label: "Prompt Lab",           color: "#8b5cf6" },
            { label: "Foundation Models Lab",color: "#ec4899" },
          ].map(l => (
            <span key={l.label} className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: l.color + "15", border: `1px solid ${l.color}40`, color: l.color }}>
              {l.label}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600 leading-relaxed">
          Plus: 5 challenge hub pages, 27 Concepts gym modules, 226 Ground Truth posts, PrepLab with 319 questions, and spaced repetition. All progress saved locally — no account required to explore. Sign in to sync across devices.
        </p>
      </div>

    </div>
  );
}
