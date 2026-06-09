// src/Plans.jsx — 3-tier access model: Guest → Free account → Full access
import { useState } from "react";
import { track } from "./analytics";
import { validateCode, grantAccess, isAccessGranted } from "./utils/accessCode";
import { signInWithGoogle, signInWithGitHub } from "./supabase";

// ─── Feature comparison table ─────────────────────────────────────────────────
const FEATURES = [
  { label: "Interactive labs",          guest: "RAG Scenario 1",  free: "All 6 labs",     full: "All 6 labs",     freeColor: "#22c55e", fullColor: "var(--gal-build)" },
  { label: "Scenarios per lab",         guest: "1",               free: "All",            full: "All",            freeColor: "#22c55e", fullColor: "var(--gal-build)" },
  { label: "Ground Truth posts",        guest: "4 pinned",        free: "All 226",        full: "All 226",        freeColor: "#22c55e", fullColor: "var(--gal-build)" },
  { label: "PrepLab questions",         guest: "1 demo",          free: "10 / session",   full: "All 319",        freeColor: "#22c55e", fullColor: "var(--gal-build)" },
  { label: "Progress saved",            guest: false,             free: true,             full: true },
  { label: "Readiness tracking",        guest: false,             free: true,             full: true },
  { label: "Daily streak",              guest: false,             free: true,             full: true },
  { label: "Guided study paths",        guest: false,             free: true,             full: true },
  { label: "Company Tracks",            guest: false,             free: false,            full: true },
  { label: "Staff Layer answers",       guest: false,             free: false,            full: true },
  { label: "Interview Prep Plan",       guest: false,             free: false,            full: true },
  { label: "Mock Exam Mode",            guest: false,             free: false,            full: true },
  { label: "Scenario deep dives",       guest: false,             free: false,            full: true },
  { label: "Spaced repetition",         guest: false,             free: false,            full: true },
];

// ─── Cell renderer ────────────────────────────────────────────────────────────
function Cell({ value, color }) {
  if (value === true)  return <span className="text-emerald-400 text-base">✓</span>;
  if (value === false) return <span className="text-zinc-700 text-sm font-mono">—</span>;
  // string value
  return <span className="text-xs font-semibold" style={{ color: color || "#a1a1aa" }}>{value}</span>;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlansPage({ onNavigate, user = null }) {
  const [code,       setCode]       = useState("");
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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

      {/* ── Headline ─────────────────────────────────────────────────── */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-white leading-tight">
          How you want to practice
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Try a real scenario for free. Sign in to build a practice habit.
          Unlock to prep like you're already in the interview room.
        </p>
      </div>

      {/* ── 3-tier cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ── Guest ── */}
        <div className="rounded-2xl p-5 space-y-4 flex flex-col"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">GUEST</p>
            <p className="text-xl font-black text-white leading-tight">Try it, no account</p>
            <p className="text-xs text-zinc-500 leading-relaxed mt-2">
              One full RAG scenario — failure, diagnosis, synthesis — before deciding if GSL is worth your time.
            </p>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => { track("plans_guest_try", {}); onNavigate && onNavigate("lab"); }}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "#a1a1aa" }}>
            Try RAG Lab Scenario 1 →
          </button>
        </div>

        {/* ── Free account ── */}
        <div className="rounded-2xl p-5 space-y-4 flex flex-col relative"
          style={{ background: user ? "linear-gradient(160deg, rgba(34,197,94,0.07) 0%, var(--surface-2) 100%)" : "linear-gradient(160deg, rgba(34,197,94,0.04) 0%, var(--surface-2) 100%)", border: "2px solid #22c55e" }}>
          <div className="absolute -top-3 left-5">
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-600 text-white">
              START HERE
            </span>
          </div>
          <div className="pt-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">FREE ACCOUNT</p>
            <p className="text-xl font-black text-white leading-tight">Build production judgment</p>
            <p className="text-xs text-zinc-400 leading-relaxed mt-2">
              Every scenario you complete gets saved. Return any day and pick up where you left off — the readiness tracker shows if you're actually improving.
            </p>
          </div>
          <div className="flex-1" />
          {user ? (
            <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center text-emerald-400"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
              ✓ You're signed in
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => { track("plans_signin_google"); signInWithGoogle(); }}
                className="w-full py-2.5 rounded-xl text-xs font-black transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff" }}>
                Sign in — it's free →
              </button>
              <button
                onClick={() => { track("plans_signin_github"); signInWithGitHub(); }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all"
                style={{ border: "1px solid var(--border)" }}>
                Continue with GitHub
              </button>
            </div>
          )}
        </div>

        {/* ── Full access ── */}
        <div className="rounded-2xl p-5 space-y-4 flex flex-col relative"
          style={{ background: unlocked ? "linear-gradient(160deg, rgba(34,211,238,0.07) 0%, var(--surface-2) 100%)" : "var(--surface-2)", border: unlocked ? "2px solid var(--gal-build)" : "1px solid var(--gal-build-border)" }}>
          {unlocked && (
            <div className="absolute -top-3 left-5">
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: "var(--gal-build)", color: "#0f172a" }}>UNLOCKED</span>
            </div>
          )}
          <div className={unlocked ? "pt-1" : ""}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--gal-build)" }}>FULL ACCESS</p>
            <p className="text-xl font-black text-white leading-tight">Prep like you're in the room</p>
            <p className="text-xs text-zinc-400 leading-relaxed mt-2">
              One code unlocks everything — full PrepLab depth, Company Tracks, Staff-level answers, and scenario walkthroughs from real AI engineering interviews.
            </p>
          </div>
          <div className="flex-1" />
          {unlocked ? (
            <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center"
              style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.25)", color: "var(--gal-build)" }}>
              ✓ Full access active
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
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
                No code?{" "}
                <a href="https://chat.whatsapp.com/KqFoGxAW0XMF9hNllGyAo9" target="_blank" rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-400 underline transition-colors">
                  Join the beta group
                </a>
                {" "}or{" "}
                <a href="https://wa.me/917838438784" target="_blank" rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-400 underline transition-colors">
                  DM the founder.
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── Feature comparison table ─────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {/* Table header */}
        <div className="grid grid-cols-4 text-[10px] font-black uppercase tracking-widest px-4 py-3"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="text-zinc-500">Feature</div>
          <div className="text-center text-zinc-500">Guest</div>
          <div className="text-center text-emerald-500">Free Account</div>
          <div className="text-center" style={{ color: "var(--gal-build)" }}>Full Access</div>
        </div>

        {/* Table rows */}
        {FEATURES.map((f, i) => (
          <div key={f.label}
            className="grid grid-cols-4 items-center px-4 py-3 text-xs"
            style={{ background: i % 2 === 0 ? "var(--surface-2)" : "transparent", borderBottom: i < FEATURES.length - 1 ? "1px solid rgba(63,63,70,0.3)" : "none" }}>
            <div className="text-zinc-300 font-medium">{f.label}</div>
            <div className="text-center">
              <Cell value={f.guest} color="#71717a" />
            </div>
            <div className="text-center">
              <Cell value={f.free} color={f.freeColor || "#22c55e"} />
            </div>
            <div className="text-center">
              <Cell value={f.full} color={f.fullColor || "var(--gal-build)"} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-zinc-600 leading-relaxed">
        RAG Lab Scenario 1 is always free — no account required.
        {" · "}Stripe payments coming soon.
        {" · "}One code covers everything.
      </p>

    </div>
  );
}
