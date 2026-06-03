// src/Profile.jsx — User profile page (PAL-style)
// Shows identity, practice stats, saved cases, settings, export/import.

import { useState } from "react";
import { track } from "./analytics";
import { supabase, signInWithGoogle, signInWithGitHub, signOut, pushProgress, pullProgress } from "./supabase";
import { POSTS as GT_POSTS } from "./groundTruthIndex";

const SYNC_KEYS = [
  "gsl-preplab-history","genai_leaderboard","gsl-concepts-mastery",
  "gsl-preplab-spaced","gsl-bookmarks","gsl-streak","gsl-last-visit",
];

function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl p-4 min-w-[80px]"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1 text-center">{label}</span>
    </div>
  );
}

export default function ProfilePage({ onNavigate, user, onSignOut }) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [exported, setExported] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("gal-theme") || "dark");

  // ── Stats ────────────────────────────────────────────────────────────────────
  const history     = (() => { try { return JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}"); } catch { return {}; } })();
  const leaderboard = (() => { try { return JSON.parse(localStorage.getItem("genai_leaderboard") || "[]"); } catch { return []; } })();
  const mastery     = (() => { try { return new Set(JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]")); } catch { return new Set(); } })();
  const bookmarks   = (() => { try { return new Set(JSON.parse(localStorage.getItem("gsl-bookmarks") || "[]")); } catch { return new Set(); } })();
  const streak      = (() => { try { return parseInt(localStorage.getItem("gsl-streak") || "0", 10); } catch { return 0; } })();

  const totalAnswered = Object.keys(history).length;
  const correctCount  = Object.keys(history).filter(k => history[k]?.correct).length;
  const ragPassed     = leaderboard.filter(e => e.passed).length;
  const masteredCount = mastery.size;
  const roomsActive   = [
    Object.keys(history).some(k => k.startsWith("rag-")),
    Object.keys(history).some(k => k.startsWith("agents-")),
    Object.keys(history).some(k => k.startsWith("eval-")),
    Object.keys(history).some(k => k.startsWith("llmops-")),
    ragPassed > 0,
  ].filter(Boolean).length;

  // ── Sync ────────────────────────────────────────────────────────────────────
  async function handleSync() {
    if (!supabase || !user) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      await pushProgress(user.id);
      await pullProgress(user.id);
      setSyncMsg("Synced successfully");
      track("progress_synced_manual");
    } catch {
      setSyncMsg("Sync failed — try again");
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(null), 3000);
  }

  // ── Export/import ────────────────────────────────────────────────────────────
  function exportProgress() {
    const data = {};
    SYNC_KEYS.forEach(k => {
      const v = localStorage.getItem(k);
      if (v) try { data[k] = JSON.parse(v); } catch { data[k] = v; }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "gsl-progress.json";
    a.click(); URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
    track("progress_exported");
  }

  function importProgress(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.entries(data).forEach(([k, v]) => {
          try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
        });
        track("progress_imported");
        window.location.reload();
      } catch { alert("Invalid progress file."); }
    };
    reader.readAsText(file);
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("gal-theme", next);
    document.documentElement.setAttribute("data-theme", next === "light" ? "light" : "");
  }

  function removeBookmark(id) {
    const b = new Set(JSON.parse(localStorage.getItem("gsl-bookmarks") || "[]"));
    b.delete(id);
    localStorage.setItem("gsl-bookmarks", JSON.stringify([...b]));
    window.location.reload();
  }

  const savedPosts = GT_POSTS.filter(p => bookmarks.has(p.id));
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* ── Identity ─────────────────────────────────────────────────────────── */}
      {user ? (
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(15,15,17,0.97) 100%)", border: "1px solid rgba(139,92,246,0.2)" }}>
          {user.user_metadata?.avatar_url
            ? <img src={user.user_metadata.avatar_url} alt="avatar" className="w-14 h-14 rounded-full border-2 border-violet-600/40 shrink-0" />
            : <div className="w-14 h-14 rounded-full bg-violet-800/40 border-2 border-violet-600/40 flex items-center justify-center text-xl font-bold text-violet-300 shrink-0">
                {(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white truncate">{user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            {memberSince && <p className="text-[11px] text-zinc-600 mt-0.5">Member since {memberSince}</p>}
          </div>
          <button onClick={() => { signOut(); if (onSignOut) onSignOut(); }}
            className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg px-3 py-1.5 transition-all shrink-0">
            Sign out
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-5 text-center space-y-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p className="text-sm text-zinc-400">Sign in to save your progress across devices and access your full profile.</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button onClick={signInWithGoogle}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }}>
              Sign in with Google →
            </button>
            <button onClick={signInWithGitHub}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "rgba(39,39,42,0.8)", border: "1px solid rgba(63,63,70,0.8)", color: "#e4e4e7" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              Sign in with GitHub
            </button>
          </div>
        </div>
      )}

      {/* ── Practice Stats ───────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Practice stats</p>
        <div className="flex gap-3 flex-wrap">
          <StatPill label="Questions" value={totalAnswered} />
          <StatPill label="Correct" value={totalAnswered > 0 ? `${Math.round(correctCount/totalAnswered*100)}%` : "—"} />
          <StatPill label="Lab Scenarios" value={ragPassed} />
          <StatPill label="Concepts" value={masteredCount} />
          <StatPill label="Rooms Active" value={roomsActive} />
          {streak > 0 && <StatPill label="Day Streak" value={streak} />}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => onNavigate("progress")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
            View full progress →
          </button>
          <button onClick={() => onNavigate("plans")}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>
            Study plans →
          </button>
        </div>
      </div>

      {/* ── Cross-device sync ─────────────────────────────────────────────────── */}
      {supabase && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Cross-device sync</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {user
              ? "Your progress syncs automatically when you navigate. Manual sync pulls the latest from all your devices."
              : "Sign in to sync your progress across devices."}
          </p>
          {user && (
            <button onClick={handleSync} disabled={syncing}
              className="text-xs font-bold px-4 py-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
              {syncing ? "Syncing..." : syncMsg || "Sync now"}
            </button>
          )}
        </div>
      )}

      {/* ── Saved cases ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Saved posts</p>
          {savedPosts.length > 0 && (
            <button onClick={() => onNavigate("groundtruth")} className="text-[10px] font-mono text-violet-400 hover:text-violet-300 transition-all">
              View all →
            </button>
          )}
        </div>
        {savedPosts.length === 0 ? (
          <p className="text-xs text-zinc-600">No saved posts yet. Bookmark Ground Truth posts to see them here.</p>
        ) : (
          <div className="space-y-2">
            {savedPosts.slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <button onClick={() => onNavigate({ tab: "groundtruth", postId: p.id })}
                  className="text-xs text-zinc-300 hover:text-white text-left truncate transition-colors">
                  {p.title}
                </button>
                <button onClick={() => removeBookmark(p.id)} className="text-zinc-600 hover:text-red-400 text-xs shrink-0 transition-colors">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Settings ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Settings</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-300">Theme</span>
          <button onClick={toggleTheme}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white transition-all">
            {theme === "dark" ? "Switch to light" : "Switch to dark"}
          </button>
        </div>
        <div className="border-t border-zinc-800/60 pt-4 space-y-2">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Progress backup</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportProgress}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white transition-all">
              {exported ? "Exported ✓" : "Export progress"}
            </button>
            <label className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer">
              Import progress
              <input type="file" accept=".json" className="hidden" onChange={importProgress} />
            </label>
          </div>
          <p className="text-[10px] text-zinc-700">Export downloads a JSON file you can import on any device.</p>
        </div>
      </div>

    </div>
  );
}
