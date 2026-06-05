// src/GateOverlay.jsx — Reusable gate for sign-in (guests) and upgrade (free users)
// Two modes:
//   user === null  → sign-in gate: value prop + Google/GitHub buttons
//   user set, no code → upgrade gate: contextual copy + subscribe CTA + code input
import { useState } from "react";
import { track } from "./analytics";
import { validateCode, grantAccess } from "./utils/accessCode";
import { signInWithGoogle, signInWithGitHub } from "./supabase";

// ─── Contextual copy per locked room ────────────────────────────────────────
const GATE_COPY = {
  "company-tracks": {
    title: "Company Tracks",
    body: "Different companies evaluate AI engineers differently. Google wants systems depth. Meta wants scale. Amazon wants operational instinct. This room shows you exactly how each archetype interviews — and what a passing answer looks like.",
  },
  "staff-layer": {
    title: "Staff-Level Answer",
    body: "You answered this. A senior engineer would say what you said. A staff engineer goes further — catching the edge case, naming the failure mode, reframing the constraint. That answer is here.",
  },
  "interview-strategy": {
    title: "Interview Strategy",
    body: "Knowing the right answer in isolation isn't the same as presenting it under loop conditions. This 4-step brief turns any JD into a gap score and a day-by-day plan. The prep layer most candidates skip.",
  },
  "scenarios": {
    title: "Scenario Deep Dives",
    body: "These aren't questions. They're incidents — multi-step situations where the right answer changes depending on what you uncover. Real loop pressure. This is where candidates fail.",
  },
  "unlimited-preplab": {
    title: "Session limit reached",
    body: "You've hit your 10-question limit for this session. The questions that actually separate candidates — adversarial design, staff-level reasoning, scenario walkthroughs — start here.",
  },
  "free-account": {
    title: "Free account required",
    body: "Sign in to unlock all 6 labs, 226 Ground Truth posts, your progress tracker, and 10 PrepLab questions per session. No card. Takes 10 seconds.",
  },
};

// ─── Lock icon ───────────────────────────────────────────────────────────────
function LockIcon({ color = "var(--gal-build)" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M7 9V6a3 3 0 016 0v3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Sign-in gate (no account) ───────────────────────────────────────────────
function SignInGate({ context, copy }) {
  return (
    <div className="space-y-4">
      <button
        onClick={() => { track("gate_signin_google", { context }); signInWithGoogle(); }}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all"
        style={{ background: "linear-gradient(135deg, var(--gal-build) 0%, #8b5cf6 100%)", color: "#fff" }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
          <path d="M14.7 7.67c0-.52-.05-1.03-.13-1.52H7.5v2.87h4.02a3.44 3.44 0 01-1.49 2.25v1.87h2.41C13.9 11.84 14.7 9.93 14.7 7.67z" opacity=".6"/>
          <path d="M7.5 15c2.02 0 3.71-.67 4.95-1.82l-2.41-1.87a4.5 4.5 0 01-6.68-2.35H.86v1.93A7.5 7.5 0 007.5 15z" opacity=".8"/>
          <path d="M3.36 8.96A4.5 4.5 0 013.1 7.5c0-.51.09-1 .26-1.46V4.11H.86A7.5 7.5 0 000 7.5c0 1.21.29 2.36.86 3.39l2.5-1.93z" opacity=".9"/>
          <path d="M7.5 2.98c1.12 0 2.13.38 2.92 1.14l2.2-2.2A7.5 7.5 0 00.86 4.11L3.36 6.04A4.5 4.5 0 017.5 2.98z"/>
        </svg>
        Continue with Google
      </button>
      <button
        onClick={() => { track("gate_signin_github", { context }); signInWithGitHub(); }}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all hover:bg-zinc-800/80"
        style={{ border: "1px solid var(--border)", color: "#a1a1aa" }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        Continue with GitHub
      </button>
      <p className="text-[11px] text-zinc-600 text-center">Free · No card required</p>
    </div>
  );
}

// ─── Upgrade gate (has account, needs access code) ────────────────────────────
function UpgradeGate({ context }) {
  const [code, setCode] = useState("DAI2026");
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      if (validateCode(code)) {
        grantAccess();
        setStatus("success");
        track("access_code_redeemed", { valid: true, context });
        setTimeout(() => window.location.reload(), 700);
      } else {
        setStatus("error");
        track("access_code_redeemed", { valid: false, context });
        setSubmitting(false);
      }
    }, 400);
  }

  return (
    <div className="space-y-4">
      {/* Primary CTA — placeholder until Stripe ships */}
      <a
        href="https://genai-systems-lab-ivory.vercel.app/#plans"
        onClick={(e) => { e.preventDefault(); track("gate_upgrade_click", { context }); window.location.hash = "plans"; }}
        className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all"
        style={{ background: "linear-gradient(135deg, var(--gal-build) 0%, #8b5cf6 100%)", color: "#fff" }}>
        Get full access →
      </a>
      {/* Secondary — access code */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <p className="text-[11px] text-zinc-600 text-center">(Have an access code? Enter it below)</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => { setCode(e.target.value); setStatus(null); }}
            placeholder="Access code"
            className="flex-1 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 outline-none transition-all"
            style={{
              background: "var(--surface-2)",
              border: `1px solid ${status === "error" ? "#ef4444" : status === "success" ? "#22c55e" : "var(--border)"}`,
            }}
          />
          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            style={{ background: "var(--gal-build)", color: "#000" }}>
            {submitting ? "…" : "Unlock"}
          </button>
        </div>
        {status === "success" && <p className="text-xs text-emerald-400 text-center">Access granted — reloading…</p>}
        {status === "error"   && <p className="text-xs text-red-400 text-center">Code not recognised. Check and try again.</p>}
      </form>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
// context: "free-account" | "company-tracks" | "staff-layer" | "interview-strategy" | "scenarios" | "unlimited-preplab"
// user: current Supabase user object or null
// compact: render inline (inside a card) rather than full-page
export default function GateOverlay({ context = "free-account", user = null, compact = false }) {
  const copy = GATE_COPY[context] || GATE_COPY["free-account"];
  const isSignInGate = !user;

  const inner = (
    <div className={compact ? "space-y-4" : "max-w-md w-full space-y-6"}>
      {/* Icon + heading */}
      <div className="text-center space-y-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "var(--gal-build-tint)", border: "1px solid var(--gal-build-border)" }}>
          <LockIcon />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-white">{copy.title}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{copy.body}</p>
        </div>
      </div>

      {/* CTA block */}
      {isSignInGate
        ? <SignInGate context={context} copy={copy} />
        : <UpgradeGate context={context} />
      }
    </div>
  );

  if (compact) return inner;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      {inner}
    </div>
  );
}
