// src/shared.jsx
// Shared UI components used across labs, PrepLab, and other modules.
// Import named exports — do not import this file as a default.

import { useState } from "react";
import React from "react";
import { track } from "./analytics";

/**
 * CommonTrapCallout
 * Renders an amber callout showing what weaker candidates typically say.
 * Only renders if trap string is present.
 * Usage: <CommonTrapCallout trap={q.trap} />
 */
export function CommonTrapCallout({ trap }) {
  if (!trap) return null;
  return (
    <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg px-4 py-3 space-y-1">
      <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Common trap</p>
      <p className="text-sm text-amber-300 leading-relaxed">{trap}</p>
    </div>
  );
}

/**
 * ProductionNoteChip
 * Renders a subdued ⚙ chip: "In production: [note]"
 * Used on lab failure/root-cause cards to ground abstract failures in real tools.
 * Usage: <ProductionNoteChip note="vLLM PagedAttention / AWS Inferentia" />
 */
export function ProductionNoteChip({ note }) {
  if (!note) return null;
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
      <span className="text-zinc-600 text-xs shrink-0 mt-0.5">⚙</span>
      <p className="text-xs text-zinc-500 leading-relaxed">
        <span className="text-zinc-400 font-semibold">In production: </span>{note}
      </p>
    </div>
  );
}

/**
 * ForwardPointerCard
 * The "You've seen the failure. What's next?" card shown at scenario/module completion.
 * Renders a PrepLab CTA and optional GT post link.
 * Usage: <ForwardPointerCard preplabTopic="rag" gtPostId="hybrid-search" gtPostTitle="Hybrid Search" onNavigate={fn} />
 */
export function ForwardPointerCard({ preplabTopic, gtPostId, gtPostTitle, onNavigate }) {
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.07) 0%, rgba(15,15,17,0.97) 100%)", border: "1px solid rgba(139,92,246,0.2)", borderTop: "2px solid rgba(139,92,246,0.45)" }}>
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-emerald-600/20 border border-emerald-600/50 text-emerald-400 text-[10px] font-black flex items-center justify-center">✓</span>
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">You've seen the failure. What's next?</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {preplabTopic && onNavigate && (
          <button
            onClick={() => onNavigate({ tab: "preplab", mode: "trainer", topic: preplabTopic })}
            className="text-xs px-3 py-2 rounded-lg font-semibold transition-all hover:brightness-110"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd" }}>
            Test your understanding →
          </button>
        )}
        {gtPostId && onNavigate && (
          <button
            onClick={() => onNavigate({ tab: "groundtruth", postId: gtPostId })}
            className="text-xs px-3 py-2 rounded-lg text-zinc-300 transition-all hover:text-white"
            style={{ background: "rgba(39,39,42,0.8)", border: "1px solid rgba(63,63,70,0.6)" }}>
            Read: {gtPostTitle || "Ground Truth post"} →
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * WhatNextCard
 * Full-width conclusion section for lab scenario/module endings.
 * Replaces the corner-widget pattern with a deliberate full-width close.
 * Usage: <WhatNextCard preplabTopic="rag" gtPostId="hybrid-search" gtPostTitle="Hybrid Search" onNavigate={fn} />
 */
export function WhatNextCard({ preplabTopic, gtPostId, gtPostTitle, onNavigate, label, bookmarkId }) {
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const b = new Set(JSON.parse(localStorage.getItem("gsl-bookmarks") || "[]"));
      return bookmarkId ? b.has(bookmarkId) : false;
    } catch { return false; }
  });

  function toggleBookmark() {
    if (!bookmarkId) return;
    try {
      const b = new Set(JSON.parse(localStorage.getItem("gsl-bookmarks") || "[]"));
      if (bookmarked) { b.delete(bookmarkId); } else { b.add(bookmarkId); }
      localStorage.setItem("gsl-bookmarks", JSON.stringify([...b]));
      setBookmarked(!bookmarked);
      track("bookmark_toggled", { id: bookmarkId, action: bookmarked ? "remove" : "add", source: "whatnext" });
    } catch {}
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="border-t border-zinc-800/60" />
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
          {label || "You've diagnosed this. Where does it take you?"}
        </p>
        {bookmarkId && (
          <button onClick={toggleBookmark}
            className="text-[10px] font-mono flex items-center gap-1 px-2 py-1 rounded-md border transition-all"
            style={bookmarked
              ? { background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.3)", color: "#fbbf24" }
              : { background: "rgba(39,39,42,0.6)", borderColor: "rgba(63,63,70,0.6)", color: "#71717a" }}>
            {bookmarked ? "★ Saved" : "☆ Save"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {preplabTopic && onNavigate && (
          <button
            onClick={() => onNavigate({ tab: "preplab", mode: "trainer", topic: preplabTopic })}
            className="rounded-xl p-4 text-left space-y-1 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(15,15,17,0.97) 100%)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <p className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">Test judgment under pressure</p>
            <p className="text-sm font-semibold text-zinc-200">PrepLab →</p>
            <p className="text-xs text-zinc-500">Drill questions on this exact failure mode</p>
          </button>
        )}
        {gtPostId && onNavigate && (
          <button
            onClick={() => onNavigate({ tab: "groundtruth", postId: gtPostId })}
            className="rounded-xl p-4 text-left space-y-1 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(15,15,17,0.97) 100%)", border: "1px solid rgba(99,102,241,0.25)" }}>
            <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Go deeper on the concept</p>
            <p className="text-sm font-semibold text-zinc-200">{gtPostTitle || "Ground Truth"} →</p>
            <p className="text-xs text-zinc-500">Read the production-depth breakdown</p>
          </button>
        )}
        {onNavigate && (
          <button
            onClick={() => onNavigate({ tab: "preplab", mode: "jdprep" })}
            className="rounded-xl p-4 text-left space-y-1 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(15,15,17,0.97) 100%)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p className="text-[10px] font-mono text-green-400 uppercase tracking-wider">Interview preparation</p>
            <p className="text-sm font-semibold text-zinc-200">Build interview plan →</p>
            <p className="text-xs text-zinc-500">Paste a JD and get a personalised study plan</p>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * FeedbackBar
 * Thumb up / thumb down widget. Fires a PostHog event on submit.
 * Usage: <FeedbackBar page="systems/graph-rag" contentType="module" />
 * contentType: "module" | "gt_post" | "preplab_session"
 */
export function FeedbackBar({ page, contentType = "module" }) {
  const [submitted, setSubmitted] = useState(null);

  function submit(rating) {
    if (submitted) return;
    setSubmitted(rating);
    track("feedback_submitted", { rating, page, content_type: contentType });
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="text-xs text-zinc-500">Thanks for the feedback</span>
        <span className="text-sm">{submitted === "up" ? "👍" : "👎"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-mono">Was this useful?</span>
      <button onClick={() => submit("up")}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-800/50 transition-all">
        👍 <span className="hidden sm:inline">Yes</span>
      </button>
      <button onClick={() => submit("down")}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-red-950/30 border border-zinc-800 hover:border-red-800/50 transition-all">
        👎 <span className="hidden sm:inline">No</span>
      </button>
    </div>
  );
}

/**
 * ModuleNotes
 * Personal notes field at the bottom of every Concepts gym module.
 * Autosaves to localStorage key gsl-note-{moduleId} on blur.
 * Usage: <ModuleNotes moduleId="tokenizer" />
 */
export function ModuleNotes({ moduleId }) {
  const key = `gsl-note-${moduleId}`;
  const [text, setText] = useState(() => {
    try { return localStorage.getItem(key) || ""; } catch { return ""; }
  });
  const [saved, setSaved] = useState(false);

  function handleBlur() {
    try { localStorage.setItem(key, text); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="mt-8 pt-6 border-t border-zinc-800/60">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">My notes</p>
        {saved && <span className="text-[10px] font-mono text-emerald-600">Saved</span>}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="Add your own notes, reminders, or follow-up questions..."
        rows={3}
        className="w-full text-xs text-zinc-300 placeholder-zinc-600 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2.5 resize-y focus:outline-none focus:border-zinc-600 transition-colors leading-relaxed"
      />
      {text.length > 0 && (
        <p className="text-[10px] text-zinc-700 mt-1">{text.length} chars · auto-saves when you click away</p>
      )}
    </div>
  );
}

/**
 * TradeoffCard — interactive 3-option technique comparison.
 * Shows dimension bars + "Best when" detail for the selected option.
 * Used on hub pages between Lab section and Key Concepts.
 *
 * data shape:
 * {
 *   title: string,
 *   options: [{
 *     name: string, tagline: string, when: string, color: string,
 *     dims: [{ label: string, value: 1|2|3 }]  // 4 dims
 *   }]
 * }
 */
export function TradeoffCard({ data }) {
  const [active, setActive] = useState(0);
  const opt = data.options[active];

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      {/* Option tabs */}
      <div className="grid grid-cols-3 gap-2">
        {data.options.map((o, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="p-3 rounded-xl text-left transition-all"
            style={{
              background: active === i ? o.color + "14" : "var(--surface)",
              border: `${active === i ? 2 : 1}px solid ${active === i ? o.color : "var(--border)"}`,
            }}>
            <div className="text-xs font-black text-white leading-tight">{o.name}</div>
            <div className="text-[9px] font-mono text-zinc-500 mt-0.5 leading-snug hidden sm:block">{o.tagline}</div>
          </button>
        ))}
      </div>

      {/* Tagline on mobile (shown below tabs since it's hidden in tab on small screens) */}
      <p className="text-[10px] font-mono text-zinc-500 sm:hidden -mt-1">{opt.tagline}</p>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-2">
        {opt.dims.map((d, i) => (
          <div key={i} className="rounded-lg px-3 py-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">{d.label}</div>
            <div className="flex gap-1">
              {[1, 2, 3].map(v => (
                <div key={v} className="h-1.5 flex-1 rounded-full transition-all duration-200"
                  style={{ background: v <= d.value ? opt.color : "#27272a" }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Best when */}
      <div className="rounded-xl px-4 py-3" style={{ background: opt.color + "0d", border: `1px solid ${opt.color}28` }}>
        <p className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: opt.color }}>Best when</p>
        <p className="text-xs text-zinc-300 leading-relaxed">{opt.when}</p>
      </div>
    </div>
  );
}

/**
 * FidelityBadge — "✓ Scenario-accurate" or "~ Simulated" chip on module headers.
 * Moved from App.jsx + Systems.jsx to shared.jsx to eliminate duplication.
 * Usage: <FidelityBadge variant="accurate" /> | <FidelityBadge variant="simulated" />
 */
export function FidelityBadge({ variant = "simulated" }) {
  if (variant === "accurate") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-700/60 bg-emerald-950/40 text-emerald-400 shrink-0">
        ✓ Scenario-accurate
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-zinc-700/50 bg-zinc-900/30 text-zinc-500 shrink-0">
      ~ Simulated
    </span>
  );
}
