// src/Plans.jsx — 3-tier access model: Guest → Free account → Full access
import { useState } from "react";
import { track } from "./analytics";
import { validateCode, grantAccess, isAccessGranted } from "./utils/accessCode";
import { signInWithGoogle, signInWithGitHub } from "./supabase";

// ─── Feature lists per tier ──────────────────────────────────────────────────
const GUEST_FEATURES = [
  "Foundations hub — FM Lab, Prompt Lab, core Concepts",
  "3 pinned Ground Truth posts",
  "1 PrepLab demo question",
  "Home page + this Plans page",
];

const FREE_FEATURES = [
  "All 6 interactive labs — RAG, Agent, Eval, LLM, Prompt, Foundation Models",
  "All 5 challenge area hubs with guided concepts",
  "226 Ground Truth posts — practitioner-written deep dives",
  "PrepLab — 10 questions per session (MCQ, multi-select, text, scenario)",
  "Readiness tracking + study plan + guided paths",
  "Progress saved across sessions",
];

const FULL_FEATURES = [
  "Unlimited PrepLab — all 319 questions, no session cap",
  "Company Tracks — Google, Meta, Amazon, OpenAI interview patterns",
  "Interview Prep Plan — 4-step brief builder with JD analysis",
  "Staff-level answers — the hardest 60 questions unlocked",
  "Mock Exam Mode — timed, forward-only, full loop pressure",
  "Scenario deep dives — 6 multi-step incident walkthroughs",
  "Spaced repetition queue — Review Due mode",
];

// ─── Shared components ───────────────────────────────────────────────────────
function Check({ color = "#22c55e" }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
      <circle cx="7" cy="7" r="7" fill={color + "22"} />
      <path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FeatureList({ features, color }) {
  return (
    <div className="space-y-2">
      {features.map((f, i) => (
        <div key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "#a1a1aa" }}>
          <Check color={color} />
          {f}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlansPage({ onNavigate, user = null }) {
  const [code,       setCode]       = useState("DAI2026");
  const [status,     setStatus]     = useState(null);
  const [unlocked,   setUnlocked]   = useState(() => isAccessGranted());
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
        track("access_code_redeemed", { valid: true, source: "plans" });
      } else {
        setStatus("error");
        track("access_code_redeemed", { valid: false, source: "plans" });
      }
      setSubmitting(false);
    }, 400);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

      {/* ── Headline ─────────────────────────────────────────────────── */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white leading-tight">
          The gap isn't knowledge.{" "}
          <span style={{ background: "linear-gradient(90deg, var(--gal-build) 0%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            It's production judgment.
          </span>
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Interviewers put you in a real scenario — a RAG system is hallucinating, an agent is looping, an eval shows 94% accuracy but your product is broken — and watch how you reason. GSL trains exactly that.
        </p>
      </div>

      {/* ── 2-state cards: Free account + Full access ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── Free account ── */}
        <div className="rounded-2xl p-5 space-y-4 relative"
          style={{ background: user ? "linear-gradient(160deg, rgba(34,197,94,0.06) 0%, var(--surface-2) 100%)" : "var(--surface-2)", border: user ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(34,197,94,0.4)", borderTop: "2px solid #22c55e" }}>
          {user && (
            <div className="absolute top-0 right-4 -translate-y-1/2">
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-600 text-white">ACTIVE</span>
            </div>
          )}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">FREE ACCOUNT</p>
            <p className="text-2xl font-black text-white">$0</p>
            <p className="text-xs text-zinc-500 mt-1">Sign in with Google or GitHub</p>
          </div>
          <FeatureList features={FREE_FEATURES} color="#22c55e" />
          {user ? (
            <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center text-emerald-400"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
              ✓ You're signed in
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => { track("plans_signin_google"); signInWithGoogle(); }}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#86efac" }}>
                Sign in with Google →
              </button>
              <button
                onClick={() => { track("plans_signin_github"); signInWithGitHub(); }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-all"
                style={{ border: "1px solid var(--border)" }}>
                Sign in with GitHub
              </button>
            </div>
          )}
        </div>

        {/* ── Tier 3: Full access ── */}
        <div className="rounded-2xl p-5 space-y-4 relative"
          style={{ background: unlocked ? "linear-gradient(160deg, rgba(34,211,238,0.06) 0%, var(--surface-2) 100%)" : "var(--surface-2)", border: unlocked ? "1px solid rgba(34,211,238,0.3)" : "1px solid var(--gal-build-border)", borderTop: "2px solid var(--gal-build)" }}>
          {unlocked && (
            <div className="absolute top-0 right-4 -translate-y-1/2">
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: "var(--gal-build)", color: "#0f172a" }}>UNLOCKED</span>
            </div>
          )}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--gal-build)" }}>FULL ACCESS</p>
            <p className="text-2xl font-black font-mono" style={{ color: unlocked ? "var(--gal-build)" : "#e4e4e7" }}>
              {unlocked ? "ACTIVE" : "Access code"}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {unlocked ? "All features unlocked" : "Get a code, unlock everything"}
            </p>
          </div>
          <FeatureList features={FULL_FEATURES} color={unlocked ? "var(--gal-build)" : "#52525b"} />

          {unlocked ? (
            <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center"
              style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.25)", color: "var(--gal-build)" }}>
              ✓ Full access active
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <p className="text-[10px] text-zinc-600">Enter your access code:</p>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setStatus(null); }}
                  placeholder="Access code"
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 outline-none transition-all"
                  style={{ background: "var(--bg)", border: status === "error" ? "1px solid #ef4444" : status === "success" ? "1px solid #22c55e" : "1px solid var(--border)" }}
                />
                <button type="submit" disabled={submitting || !code.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-black transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, var(--gal-build) 0%, #6366f1 100%)", color: "#fff" }}>
                  {submitting ? "…" : "Unlock"}
                </button>
              </div>
              {status === "success" && <p className="text-[11px] text-emerald-400">Access granted. Reload to see changes.</p>}
              {status === "error"   && <p className="text-[11px] text-red-400">Code not recognised. Check and try again.</p>}
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Full access is invite-only during beta. Reach out on{" "}
                <a href="https://www.linkedin.com/in/sidharthkriplani/" target="_blank" rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-400 underline transition-colors">LinkedIn</a>{" "}
                to request access.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── Funnel explanation ────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">HOW IT WORKS</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "01", label: "Explore free", body: "Foundations, GT posts, and one PrepLab question — no account needed. Get a feel for the quality." },
            { step: "02", label: "Sign in (free)", body: "Unlocks all 6 labs, 226 posts, and PrepLab. Progress saves across sessions. 30 seconds with Google." },
            { step: "03", label: "Unlock everything", body: "Enter your access code. Unlimited PrepLab, Company Tracks, Staff Layer, Scenarios — all yours." },
          ].map(({ step, label, body }) => (
            <div key={step} className="space-y-1.5">
              <span className="text-[10px] font-black font-mono" style={{ color: "var(--gal-build)" }}>{step}</span>
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Labs strip ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 text-center">WHAT'S INSIDE — ALL FREE WITH AN ACCOUNT</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: "RAG Lab · 6 scenarios",          color: "var(--gal-build)" },
            { label: "Agent Lab · 16 modules",         color: "#f59e0b" },
            { label: "Eval Lab · 15 modules",          color: "#6366f1" },
            { label: "LLM Lab · 9 modules",            color: "#3b82f6" },
            { label: "Prompt Lab · 6 scenarios",       color: "#8b5cf6" },
            { label: "Foundation Models Lab · 6 scenarios", color: "#ec4899" },
          ].map(l => (
            <span key={l.label} className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
              style={{ background: l.color + "12", border: `1px solid ${l.color}35`, color: l.color }}>
              {l.label}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
