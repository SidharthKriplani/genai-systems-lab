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
export function WhatNextCard({ preplabTopic, gtPostId, gtPostTitle, onNavigate, label }) {
  return (
    <div className="mt-6 space-y-3">
      <div className="border-t border-zinc-800/60" />
      <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest px-1">
        {label || "You've diagnosed this. Where does it take you?"}
      </p>
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
