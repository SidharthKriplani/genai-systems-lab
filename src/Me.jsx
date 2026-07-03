// src/Me.jsx — lightweight "Me" landing hub (2026-07-03, GSL fix #4).
// Declutters the personal nav strip: one "Me" item links out to the existing
// Progress / My Tracks / Review / Plans / Profile pages. This page ONLY links —
// each destination stays its own route/component. Dark theme, GSL CSS vars.

const CARDS = [
  {
    id: "progress",
    label: "Progress",
    desc: "Your readiness by area, study plan, and streak — the single view of where you stand.",
  },
  {
    id: "my-tracks",
    label: "My Tracks",
    desc: "Everything you've saved — modules, posts, questions, and notes — organised into your own tracks.",
  },
  {
    id: "review",
    label: "Review",
    desc: "Spaced repetition over what you've marked to remember. Comes back right when you're about to forget.",
  },
  {
    id: "plans",
    label: "Plans",
    desc: "Structured learning tracks and full-access unlock. Pick a path or enter your access code.",
  },
  {
    id: "profile",
    label: "Profile",
    desc: "Your identity, saved items, sign-in, and settings — export or sync your progress across devices.",
  },
];

export default function Me({ onNavigate }) {
  const go = (v) => { if (onNavigate) onNavigate(v); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <h1 className="text-2xl font-black tracking-tight mb-2">Me</h1>
      <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-2, #a1a1aa)" }}>
        Your personal space — progress, saved tracks, review queue, learning plans, and profile, all in one place.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CARDS.map((c) => (
          <button
            key={c.id}
            onClick={() => go(c.id)}
            className="text-left rounded-xl p-4 transition-colors hover:border-zinc-600"
            style={{ background: "var(--surface, #18181b)", border: "1px solid var(--border, #27272a)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{c.label}</span>
              <span style={{ color: "var(--gal-build)" }}>→</span>
            </div>
            <div className="text-xs leading-relaxed" style={{ color: "var(--text-3, #71717a)" }}>{c.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
