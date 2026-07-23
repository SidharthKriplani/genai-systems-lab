// BreaklabsChrome — shared global top-bar (D17, R1: GSL reference implementation).
// Spec: labs/_plan/CHROME-TOPBAR-PROPOSAL-2026-07-23.md (user-approved 2026-07-23).
// Anatomy: [← Back (contextual)] [Search ⌘K] ————— [Streak SVG (tiered)] [Theme] [Sticky tray] [Profile chip]
//
// This is a "shared-by-copy" component: R2/R3/R4 (MSL/PAL/PL/SQL Lab/PyLab) copy this file into
// their own src/components/ and wire it to their own search corpus / auth / streak state via the
// same prop surface — no cross-repo import. Keep this file free of GSL-specific literals (owner
// email, storage keys, etc.) so a copy-and-rewire port stays mechanical.
//
// Deliberately NOT implemented here (see D17 report for the "why"):
//   - Mobile Back button (desktop/lg only — matches this bar's own pre-existing mobile-lean
//     pattern; mobile relies on the drawer + browser back gesture).
//   - Sign out (moved to left-nav bottom per spec ruling; not part of this component at all).
//   - "What's New" / bell notification surface (killed per spec; not relocated here — flagged
//     in the D17 report as now-unreachable state, left inert rather than guessed at).
import { useState, useRef, useEffect } from "react";
import { Icon } from "../Icon.jsx";

// ─── Streak SVG — 6 adaptive tiers, same silhouette family, growing complexity, no animation ──
// 1-2 spark · 3-6 flame · 7-29 twin flame · 30-99 torch · 100-364 bonfire · 365+ comet/star
export function streakTier(days) {
  if (days >= 365) return 6;
  if (days >= 100) return 5;
  if (days >= 30) return 4;
  if (days >= 7) return 3;
  if (days >= 3) return 2;
  if (days >= 1) return 1;
  return 0;
}

// One shared flame silhouette (teardrop), reused/scaled/duplicated across tiers 2-5 so the
// family reads as "the same shape, more of it" rather than unrelated icons per tier.
function FlamePath({ fill }) {
  return <path d="M8 1.2c.9 1.7-.3 2.8-1 3.8-.8 1.1-1.3 2-1.3 3.2A2.3 2.3 0 0 0 8 10.5a2.3 2.3 0 0 0 2.3-2.3c0-.7-.2-1.2-.5-1.7.6.5 1 1.3 1 2.2A2.8 2.8 0 0 1 8 11.5a2.8 2.8 0 0 1-2.8-2.8c0-2.6 1.9-3.3 2.3-5.1.2-.9.1-1.6-.5-2.4.9.1 1.6.5 2 1z" fill={fill} />;
}

function StreakIcon({ tier }) {
  const common = { width: 15, height: 15, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true };
  if (tier <= 0) return null;
  if (tier === 1) {
    // spark — single small ember, zinc/amber
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="2.4" fill="#a1a1aa" />
        <circle cx="8" cy="8" r="1.1" fill="#fbbf24" />
      </svg>
    );
  }
  if (tier === 2) {
    // flame — single, amber
    return <svg {...common}><FlamePath fill="#f59e0b" /></svg>;
  }
  if (tier === 3) {
    // twin flame — amber -> orange, subtle overlap
    return (
      <svg {...common}>
        <g transform="translate(-1.1,0.4) scale(0.85)"><FlamePath fill="#f59e0b" /></g>
        <g transform="translate(1.3,-0.3) scale(0.95)"><FlamePath fill="#fb923c" /></g>
      </svg>
    );
  }
  if (tier === 4) {
    // torch — flame + handle, orange, count emphasized by the caller
    return (
      <svg {...common}>
        <rect x="6.6" y="10.5" width="2.8" height="4.2" rx="0.6" fill="#78716c" />
        <FlamePath fill="#fb923c" />
      </svg>
    );
  }
  if (tier === 5) {
    // bonfire — flame + log base, red-orange
    return (
      <svg {...common}>
        <path d="M2.5 13.5l4-1.6M13.5 13.5l-4-1.6" stroke="#92400e" strokeWidth="1.3" strokeLinecap="round" />
        <g transform="scale(1.08) translate(-0.6,-0.6)"><FlamePath fill="#ef4444" /></g>
      </svg>
    );
  }
  // tier 6 — comet/star, violet (prestige)
  return (
    <svg {...common}>
      <path d="M8 0.8l1.1 3.6 3.6 1.1-3.6 1.1L8 10.2l-1.1-3.6-3.6-1.1 3.6-1.1z" fill="#8b5cf6" />
      <circle cx="12.6" cy="12.4" r="1.1" fill="#a78bfa" />
      <circle cx="3.2" cy="12.8" r="0.7" fill="#a78bfa" />
    </svg>
  );
}

function StreakBadge({ days }) {
  const tier = streakTier(days);
  if (tier <= 0) return null;
  const emphasize = tier >= 4; // torch/bonfire/comet — "+count emphasized" per spec
  return (
    <span className="flex items-center gap-1" title={`${days}-day streak`} aria-label={`${days} day streak`}>
      <StreakIcon tier={tier} />
      <span className={emphasize ? "text-[11px] font-black" : "text-[10px] font-bold"}
        style={{ color: tier === 6 ? "#a78bfa" : tier >= 4 ? "#fb923c" : "#fbbf24" }}>
        {days}
      </span>
    </span>
  );
}

// ─── Profile chip + dropdown ───────────────────────────────────────────────────────────────
function ProfileChip({ user, onNavigateProfile, onNavigateProgress, onNavigateReview, onNavigateMyTracks, onNavigateLeaderboard, onNavigateStartHere, onNavigateResources, onNavigateAbout, onNavigatePlans, isOwner, masteryActive, onOpenMastery }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    function onEsc(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDocClick); document.removeEventListener("keydown", onEsc); };
  }, [open]);

  const name = user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0];

  function item(label, onClick, extra) {
    return (
      <button onClick={() => { onClick(); setOpen(false); }}
        className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-all rounded-lg">
        {label}{extra}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" title="Your profile" aria-haspopup="menu" aria-expanded={open}>
        {user.user_metadata?.avatar_url
          ? <img src={user.user_metadata.avatar_url} alt="avatar" className="w-6 h-6 rounded-full border border-zinc-700 shrink-0" />
          : <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{(name || "?")[0].toUpperCase()}</div>
        }
        <span className="text-[11px] text-zinc-400 font-medium max-w-[80px] truncate">{name}</span>
        <span className="text-zinc-600"><Icon name="chevron-down" size={11} /></span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-48 rounded-xl p-1.5 shadow-2xl z-50"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {item("Profile", onNavigateProfile)}
          {item("My Progress", onNavigateProgress)}
          {item("Review", onNavigateReview)}
          {item("My Tracks", onNavigateMyTracks)}
          {item("Leaderboard", onNavigateLeaderboard)}
          <div className="h-px my-1" style={{ background: "var(--border)" }} />
          {item("Start Here", onNavigateStartHere)}
          {item("Resources", onNavigateResources)}
          {item("About", onNavigateAbout)}
          <div className="h-px my-1" style={{ background: "var(--border)" }} />
          {item("Plans & Access", onNavigatePlans)}
          {isOwner && item("Mastery Room", onOpenMastery, masteryActive ? <span className="ml-1.5 text-[9px] text-emerald-400">●</span> : null)}
          <div className="h-px my-1" style={{ background: "var(--border)" }} />
          <div className="px-3 py-1.5 text-[10px] text-zinc-600 font-mono">Keyboard shortcuts — press <kbd className="border border-zinc-700 rounded px-1">?</kbd></div>
        </div>
      )}
    </div>
  );
}

// ─── Chrome ────────────────────────────────────────────────────────────────────────────────
export default function BreaklabsChrome({
  showBack, onBack,
  onSearchOpen, searchPlaceholder = "Search…",
  streak,
  theme, onToggleTheme,
  user, supabaseEnabled, onSignInGoogle, onSignInGitHub, onShowAuth,
  // onShowAuth (optional, D21): when provided, the signed-out slot renders ONE "Sign in" button
  // that calls it (for labs whose auth entry point is a modal, e.g. PAL/MSL), instead of the
  // two direct-OAuth buttons below. Backward-compatible — omit it and behavior is unchanged.
  onNavigateProfile, onNavigateProgress, onNavigateReview, onNavigateMyTracks, onNavigateLeaderboard,
  onNavigateStartHere, onNavigateResources, onNavigateAbout, onNavigatePlans,
  isOwner, masteryActive, onOpenMastery,
  stickyTrayButton, // ReactNode — e.g. <StickyBarButton/>; passed in so this component stays
                     // decoupled from any one app's sticky-notes module (portable across R2-R4).
}) {
  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      {showBack && (
        <button onClick={onBack} aria-label="Back"
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded border border-zinc-800 hover:border-zinc-700 transition-all text-zinc-500 hover:text-zinc-300 shrink-0">
          <Icon name="arrow-left" size={14} />
        </button>
      )}
      <button onClick={onSearchOpen} aria-label="Search"
        className="flex flex-1 lg:flex-none lg:w-64 items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-left min-w-0">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-zinc-500 shrink-0"><circle cx="4.5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3" /><line x1="7" y1="7" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
        <span className="text-xs text-zinc-500 flex-1 truncate">{searchPlaceholder}</span>
        <kbd className="hidden sm:inline text-[9px] border border-zinc-700 rounded px-1 text-zinc-500 font-mono">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <StreakBadge days={streak} />
        <button onClick={onToggleTheme}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded border border-zinc-800 hover:border-zinc-700 transition-all text-zinc-500 hover:text-zinc-300"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}>
          {theme === "dark"
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          }
        </button>
        {stickyTrayButton}
        {supabaseEnabled && (
          user ? (
            <div className="hidden lg:flex items-center">
              <ProfileChip user={user}
                onNavigateProfile={onNavigateProfile} onNavigateProgress={onNavigateProgress}
                onNavigateReview={onNavigateReview} onNavigateMyTracks={onNavigateMyTracks} onNavigateLeaderboard={onNavigateLeaderboard}
                onNavigateStartHere={onNavigateStartHere} onNavigateResources={onNavigateResources} onNavigateAbout={onNavigateAbout}
                onNavigatePlans={onNavigatePlans}
                isOwner={isOwner} masteryActive={masteryActive} onOpenMastery={onOpenMastery} />
            </div>
          ) : onShowAuth ? (
            <div className="hidden lg:flex items-center">
              <button onClick={onShowAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc" }}
                title="Sign in">
                Sign in
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5">
              <button onClick={onSignInGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc" }}
                title="Sign in with Google">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Sign in
              </button>
              {/* onSignInGitHub optional (D23): PL only offers Google, no modal, no GitHub —
                  render the GitHub button only when a handler is actually passed, so a
                  single-provider lab doesn't ship a dead second button. Backward-compatible —
                  GSL passes both handlers, so this branch is unaffected here. */}
              {onSignInGitHub && (
                <button onClick={onSignInGitHub}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                  style={{ background: "rgba(39,39,42,0.8)", border: "1px solid rgba(63,63,70,0.8)", color: "#a1a1aa" }}
                  title="Sign in with GitHub">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
