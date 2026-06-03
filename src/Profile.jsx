// src/Profile.jsx — User profile page (PAL-parity)
import { useState } from "react";
import { track } from "./analytics";
import { supabase, signInWithGoogle, signInWithGitHub, signOut, pushProgress, pullProgress } from "./supabase";
import { POSTS } from "./groundTruthIndex";
import { getAllAreasReadiness } from "./readiness";

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name, email) {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
  catch { return ""; }
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl py-3 px-2"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      <span className="text-xl font-black" style={{ color: color || "white" }}>{value}</span>
      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5 text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Area readiness row ────────────────────────────────────────────────────────
function AreaBar({ label, id, readiness, onClick }) {
  if (!readiness) {
    return (
      <button onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:opacity-80"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <div className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
        <span className="text-xs text-zinc-500 font-medium flex-1">{label}</span>
        <span className="text-[10px] font-mono text-zinc-700">Not started →</span>
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:opacity-80"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: readiness.color }} />
      <span className="text-xs text-white font-medium shrink-0 w-[88px]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className="h-1.5 rounded-full animate-fillBar"
          style={{ width: `${readiness.pct}%`, background: readiness.color }} />
      </div>
      <span className="text-[10px] font-mono shrink-0 w-8 text-right" style={{ color: readiness.color }}>{readiness.pct}%</span>
      <span className="text-[10px] font-mono text-zinc-500 shrink-0 hidden sm:block">{readiness.level}</span>
    </button>
  );
}

// ── Achievements ──────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: "first_q",   label: "First Answer",    icon: "★", check: (d) => d.total >= 1 },
  { id: "ten_q",     label: "10 Questions",    icon: "⚡", check: (d) => d.total >= 10 },
  { id: "fifty_q",   label: "50 Questions",    icon: "◈", check: (d) => d.total >= 50 },
  { id: "accurate",  label: "Sharp Eye",       icon: "◎", check: (d) => d.accuracy >= 70 && d.total >= 10 },
  { id: "first_lab", label: "Lab Certified",   icon: "✦", check: (d) => d.ragPassed >= 1 },
  { id: "all_rag",   label: "RAG Master",      icon: "▲", check: (d) => d.ragPassed >= 6 },
  { id: "concepts5", label: "Concept Builder", icon: "→", check: (d) => d.mastered >= 5 },
  { id: "streak3",   label: "Consistent",      icon: "↑", check: (d) => d.streak >= 3 },
  { id: "streak7",   label: "Weekly Grind",    icon: "⊕", check: (d) => d.streak >= 7 },
  { id: "curator",   label: "Curator",         icon: "⊛", check: (d) => d.bookmarks >= 5 },
];

function Badge({ label, icon, earned }) {
  return (
    <div title={label}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold select-none"
      style={earned
        ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd" }
        : { background: "var(--surface-2)", border: "1px solid var(--border)", color: "#3f3f46" }}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ── Sign-in wall ──────────────────────────────────────────────────────────────
function SignInWall() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center"
      style={{ background: "var(--bg)" }}>

      <div className="hero-anim-0 w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.28)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>

      <div className="hero-anim-1 space-y-2 mb-8">
        <h2 className="text-3xl font-black text-white">Own your progress.</h2>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Track readiness across all 5 challenge areas, save PrepLab history, and sync across devices. Free.
        </p>
      </div>

      <div className="hero-anim-2 grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
        {[
          { v: "319", l: "Practice questions" },
          { v: "5",   l: "Challenge areas"    },
          { v: "∞",   l: "Cross-device sync"  },
        ].map(s => (
          <div key={s.l} className="rounded-xl py-4 px-3 text-center"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-black text-white">{s.v}</p>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1 leading-tight">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="hero-anim-3 flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => { track("profile_wall_google"); signInWithGoogle(); }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] hover:opacity-95"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.95) 0%, rgba(99,102,241,1) 100%)", boxShadow: "0 0 28px rgba(139,92,246,0.28)", border: "1px solid rgba(139,92,246,0.5)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>
        <button onClick={() => { track("profile_wall_github"); signInWithGitHub(); }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "#e4e4e7" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
          Sign in with GitHub
        </button>
      </div>

      <p className="hero-anim-4 text-[11px] text-zinc-700 mt-5">Free · No payment required</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfilePage({ onNavigate, user, onSignOut }) {
  const [syncing,  setSyncing]  = useState(false);
  const [syncMsg,  setSyncMsg]  = useState(null);
  const [exported, setExported] = useState(false);
  const [showAll,  setShowAll]  = useState(false);
  const [theme,    setTheme]    = useState(() => localStorage.getItem("gal-theme") || "dark");

  // ── Data ──────────────────────────────────────────────────────────────────
  const history     = (() => { try { return JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}"); } catch { return {}; } })();
  const leaderboard = (() => { try { return JSON.parse(localStorage.getItem("genai_leaderboard") || "[]"); } catch { return []; } })();
  const mastery     = (() => { try { return new Set(JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]")); } catch { return new Set(); } })();
  const bookmarkSet = (() => { try { return new Set(JSON.parse(localStorage.getItem("gsl-bookmarks") || "[]")); } catch { return new Set(); } })();
  const streak      = (() => { try { return parseInt(localStorage.getItem("gsl-streak") || "0", 10); } catch { return 0; } })();

  const histKeys       = Object.keys(history);
  const totalAnswered  = histKeys.length;
  const correctCount   = histKeys.filter(k => history[k]?.correct).length;
  const accuracy       = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const ragPassed      = leaderboard.filter(e => e.passed).length;
  const masteredCount  = mastery.size;
  const bookmarksCount = bookmarkSet.size;

  // ── Readiness ─────────────────────────────────────────────────────────────
  const allReadiness = getAllAreasReadiness();
  const AREAS = [
    { id: "retrieval",   label: "Retrieval"   },
    { id: "evaluation",  label: "Evaluation"  },
    { id: "agentshub",   label: "Agents"      },
    { id: "production",  label: "Production"  },
    { id: "foundations", label: "Foundations" },
  ].map(a => ({ ...a, readiness: allReadiness[a.id] || null }));

  const maxPct = AREAS.reduce((m, a) => a.readiness ? Math.max(m, a.readiness.pct) : m, 0);
  const overallLevel =
    maxPct >= 82 ? "Staff Engineer" :
    maxPct >= 60 ? "Senior"         :
    maxPct >= 35 ? "Practitioner"   :
    maxPct >= 15 ? "Building"       :
    totalAnswered > 0 ? "Just Starting" : "Explorer";

  // ── Recent activity ───────────────────────────────────────────────────────
  const recentActivity = (() => {
    try {
      return histKeys
        .filter(k => history[k]?.answeredAt)
        .sort((a, b) => new Date(history[b].answeredAt) - new Date(history[a].answeredAt))
        .slice(0, 6)
        .map(k => ({ id: k, correct: history[k].correct }));
    } catch { return []; }
  })();

  // ── Saved posts ───────────────────────────────────────────────────────────
  const savedPosts = POSTS ? POSTS.filter(p => bookmarkSet.has(p.id)) : [];

  function removeBookmark(id) {
    const next = new Set(bookmarkSet);
    next.delete(id);
    localStorage.setItem("gsl-bookmarks", JSON.stringify([...next]));
    track("bookmark_removed", { postId: id });
    setSyncMsg(null); // trigger re-render
  }

  // ── Achievements ──────────────────────────────────────────────────────────
  const achData   = { total: totalAnswered, accuracy, ragPassed, mastered: masteredCount, streak, bookmarks: bookmarksCount };
  const earnedIds = new Set(ACHIEVEMENTS.filter(a => a.check(achData)).map(a => a.id));

  // ── Sync ──────────────────────────────────────────────────────────────────
  async function handleSync() {
    if (!supabase || !user) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      await pushProgress(user.id);
      await pullProgress(user.id);
      setSyncMsg("Synced ✓");
      track("progress_synced_manual");
    } catch { setSyncMsg("Sync failed"); }
    finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 3000);
    }
  }

  // ── Theme ─────────────────────────────────────────────────────────────────
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next === "light" ? "light" : "");
    localStorage.setItem("gal-theme", next);
    track("theme_toggled", { to: next });
  }

  // ── Export / import ───────────────────────────────────────────────────────
  function exportProgress() {
    const keys = ["gsl-preplab-history","genai_leaderboard","gsl-concepts-mastery","gsl-preplab-spaced","gsl-bookmarks","gsl-streak","gsl-last-visit"];
    const data = {};
    keys.forEach(k => { const v = localStorage.getItem(k); if (v) { try { data[k] = JSON.parse(v); } catch {} } });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "gsl-progress.json"; a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
    track("progress_exported");
  }

  function importProgress(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
        track("progress_imported");
        window.location.reload();
      } catch {}
    };
    reader.readAsText(file);
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await signOut();
    onSignOut?.();
    track("signed_out");
  }

  if (!user) return <SignInWall />;

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "You";
  const avatarUrl   = user.user_metadata?.avatar_url;
  const memberSince = formatDate(user.created_at);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

      {/* ── Identity card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName}
            className="w-14 h-14 rounded-full object-cover shrink-0"
            style={{ outline: "2px solid rgba(139,92,246,0.3)", outlineOffset: "2px" }} />
        ) : (
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-lg font-black text-white"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.55) 0%, rgba(99,102,241,0.65) 100%)", border: "2px solid rgba(139,92,246,0.35)" }}>
            {initials(displayName, user.email)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-white truncate">{displayName}</p>
          <p className="text-xs text-zinc-400 truncate">{user.email}</p>
          {memberSince && <p className="text-[10px] text-zinc-600 mt-0.5">Member since {memberSince}</p>}
        </div>
        <div className="shrink-0 text-right space-y-1.5">
          <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.28)", color: "#c4b5fd" }}>
            {overallLevel}
          </span>
          <button onClick={handleSignOut}
            className="block text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors ml-auto">
            Sign out
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-2">
        <StatPill label="Questions" value={totalAnswered || "0"} color={totalAnswered > 0 ? "var(--gal-build)" : undefined} />
        <StatPill label="Accuracy"  value={totalAnswered > 0 ? `${accuracy}%` : "—"} color={accuracy >= 70 ? "#22c55e" : accuracy >= 50 ? "#f59e0b" : undefined} />
        <StatPill label="Streak"    value={streak > 0 ? `${streak}d` : "—"} color={streak >= 7 ? "#f59e0b" : undefined} />
        <StatPill label="Concepts"  value={masteredCount || "—"} />
        <StatPill label="Labs done" value={ragPassed || "—"} />
      </div>

      {/* ── Readiness by challenge area ──────────────────────────────── */}
      <div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-2.5">Readiness by challenge area</p>
        <div className="space-y-2">
          {AREAS.map(a => (
            <AreaBar key={a.id} {...a}
              onClick={() => { track("profile_area_click", { area: a.id }); onNavigate(a.id); }} />
          ))}
        </div>
        <button onClick={() => onNavigate("progress")}
          className="mt-3 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">
          Full progress dashboard →
        </button>
      </div>

      {/* ── Recent activity ───────────────────────────────────────────── */}
      {recentActivity.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-2.5">Recent PrepLab activity</p>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <span className="text-xs text-zinc-400 font-mono truncate mr-3">{a.id}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                  style={a.correct
                    ? { background: "rgba(34,197,94,0.12)", color: "#4ade80" }
                    : { background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
                  {a.correct ? "Correct" : "Wrong"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements ──────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-2.5">
          Achievements · {earnedIds.size}/{ACHIEVEMENTS.length}
        </p>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map(a => <Badge key={a.id} {...a} earned={earnedIds.has(a.id)} />)}
        </div>
      </div>

      {/* ── Saved GT posts ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
            Saved posts · {savedPosts.length}
          </p>
          {savedPosts.length > 4 && (
            <button onClick={() => setShowAll(p => !p)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
              {showAll ? "Show less" : "View all →"}
            </button>
          )}
        </div>
        {savedPosts.length === 0 ? (
          <p className="text-xs text-zinc-700 px-1">No saved posts yet — bookmark Ground Truth posts to see them here.</p>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {(showAll ? savedPosts : savedPosts.slice(0, 4)).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <button onClick={() => onNavigate({ tab: "groundtruth", postId: p.id })}
                  className="text-xs text-zinc-300 hover:text-white text-left truncate flex-1 transition-colors">
                  {p.title}
                </button>
                <button onClick={() => removeBookmark(p.id)}
                  className="text-zinc-600 hover:text-red-400 text-xs shrink-0 transition-colors">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cross-device sync ─────────────────────────────────────────── */}
      {supabase && (
        <div className="rounded-xl p-4 flex items-center justify-between gap-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs font-bold text-white">Cross-device sync</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Push your progress to cloud, pull on any device.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {syncMsg && <span className="text-[10px] font-mono text-zinc-400">{syncMsg}</span>}
            <button onClick={handleSync} disabled={syncing}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white transition-all disabled:opacity-40">
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          </div>
        </div>
      )}

      {/* ── Settings ──────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Settings</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-300">Theme</span>
          <button onClick={toggleTheme}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white transition-all">
            {theme === "dark" ? "Switch to light" : "Switch to dark"}
          </button>
        </div>
        <div className="border-t pt-4 space-y-2" style={{ borderColor: "var(--border)" }}>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Progress backup</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportProgress}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white transition-all">
              {exported ? "Exported ✓" : "Export JSON"}
            </button>
            <label className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer">
              Import JSON
              <input type="file" accept=".json" className="hidden" onChange={importProgress} />
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}
