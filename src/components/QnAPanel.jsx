// src/components/QnAPanel.jsx — QnA interview mode panel (QNA-INTERVIEW-STANDARD.md).
// Renders on EVERY Foundations module page via FoundationsRunner:
//   - no qnaBank entry            → "coming soon" stub
//   - entry, module not complete  → locked card (completion gate; the gate is the design,
//                                    QnA is a post-completion interview-prep surface)
//   - entry + module complete     → the grid: beats → collapsed questions (tap to reveal),
//                                    level chips, per-level expand-all, traps, follow-up
//                                    jump links (auto-expand + scroll), L3 cases,
//                                    "Beyond this module" handoffs.
// Question IDs are global + permanent; element ids are `qna-<id>` for anchor/deep-link use.

import { useState } from "react";
import { qnaForModule, qnaQuestionCount } from "../data/qnaBank.js";

const LEVEL_META = {
  0: { label: "L0", desc: "definition", cls: "border-zinc-600 bg-zinc-800/60 text-zinc-300" },
  1: { label: "L1", desc: "mechanism", cls: "border-sky-800/60 bg-sky-950/30 text-sky-300" },
  2: { label: "L2", desc: "tradeoff", cls: "border-amber-800/60 bg-amber-950/30 text-amber-300" },
  3: { label: "L3", desc: "case", cls: "border-rose-800/60 bg-rose-950/30 text-rose-300" },
};

// Minimal inline markdown: **bold**, *italic*. Kept local so the panel has no
// dependency on FoundationsRunner's internal InlineMd.
function Md({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i} className="text-zinc-100 font-semibold">{p.slice(2, -2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
          return <em key={i}>{p.slice(1, -1)}</em>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function LevelChip({ level }) {
  const m = LEVEL_META[level] || LEVEL_META[0];
  return (
    <span className={`shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${m.cls}`}>
      {m.label}
    </span>
  );
}

function QuestionRow({ node, expanded, onToggle, onJump }) {
  return (
    <div id={`qna-${node.id}`} className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <button
        onClick={() => onToggle(node.id)}
        className="w-full flex items-start gap-2.5 text-left px-4 py-3 hover:bg-zinc-900 transition-colors"
      >
        <LevelChip level={node.level} />
        <span className="text-sm text-zinc-200 leading-snug flex-1">{node.q}</span>
        <span className="text-zinc-600 text-xs mt-0.5">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-zinc-800/60">
          <p className="text-sm text-zinc-300 leading-relaxed">
            <Md text={node.answer} />
          </p>
          {node.trap && (
            <div className="rounded-lg border border-rose-900/40 bg-rose-950/10 px-3 py-2.5">
              <p className="text-[13px] leading-relaxed text-zinc-400">
                <span className="text-[10px] font-mono font-bold text-rose-400 mr-1.5">TRAP</span>
                <Md text={node.trap} />
              </p>
            </div>
          )}
          {node.followUp && (
            <button
              onClick={() => onJump(node.followUp)}
              className="text-[11px] font-mono text-sky-400 hover:text-sky-300 transition-colors"
            >
              likely follow-up → open it
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function QnAPanel({ moduleId, unlocked }) {
  const entry = qnaForModule(moduleId);
  const [expanded, setExpanded] = useState(() => new Set());

  const rule = (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
        Interview QnA
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );

  // ── No content yet: coming-soon stub ─────────────────────────────────────
  if (!entry || entry.status === "draft") {
    return (
      <section>
        {rule}
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4">
          <p className="text-sm text-zinc-500">
            Interview QnA for this module is coming soon — a question-indexed second pass
            for interview prep, unlocked after you complete the module.
          </p>
        </div>
      </section>
    );
  }

  // ── Gate: module not completed yet ────────────────────────────────────────
  if (!unlocked) {
    return (
      <section>
        {rule}
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4">
          <p className="text-sm text-zinc-400 font-medium">
            🔒 {qnaQuestionCount(entry)} interview questions unlock when you mark this module complete.
          </p>
          <p className="text-[13px] text-zinc-500 mt-1.5 leading-relaxed">
            QnA mode assumes you own this module's vocabulary and running example — finish the
            story above first, then come back to drill it from an interviewer's angle.
          </p>
        </div>
      </section>
    );
  }

  // ── Unlocked grid ─────────────────────────────────────────────────────────
  const allNodes = [
    ...entry.beats.flatMap(b => b.questions),
    ...(entry.cases || []),
  ];

  function toggle(id) {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }
  function jump(id) {
    setExpanded(prev => new Set(prev).add(id));
    // let the expand render, then scroll
    requestAnimationFrame(() => {
      document.getElementById(`qna-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  function expandLevel(level) {
    setExpanded(prev => {
      const s = new Set(prev);
      allNodes.filter(n => n.level === level).forEach(n => s.add(n.id));
      return s;
    });
  }

  const levelsPresent = [...new Set(allNodes.map(n => n.level))].sort();

  return (
    <section>
      {rule}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-zinc-500 font-mono">
          {allNodes.length} questions · tap to reveal · expand all:
        </span>
        {levelsPresent.map(l => (
          <button
            key={l}
            onClick={() => expandLevel(l)}
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors hover:brightness-125 ${LEVEL_META[l].cls}`}
          >
            {LEVEL_META[l].label} · {LEVEL_META[l].desc}
          </button>
        ))}
        {expanded.size > 0 && (
          <button
            onClick={() => setExpanded(new Set())}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            collapse all
          </button>
        )}
      </div>

      <div className="mt-5 space-y-7">
        {entry.beats.map((beat, bi) => (
          <div key={bi}>
            <p className="text-[11px] font-mono font-bold text-zinc-500 mb-2.5">
              {beat.name}
            </p>
            <div className="space-y-2">
              {beat.questions.map(node => (
                <QuestionRow
                  key={node.id}
                  node={node}
                  expanded={expanded.has(node.id)}
                  onToggle={toggle}
                  onJump={jump}
                />
              ))}
            </div>
          </div>
        ))}

        {(entry.cases || []).length > 0 && (
          <div>
            <p className="text-[11px] font-mono font-bold text-rose-400/80 mb-2.5">
              Cases — walk the diagnosis out loud
            </p>
            <div className="space-y-2">
              {entry.cases.map(node => (
                <QuestionRow
                  key={node.id}
                  node={node}
                  expanded={expanded.has(node.id)}
                  onToggle={toggle}
                  onJump={jump}
                />
              ))}
            </div>
          </div>
        )}

        {(entry.beyond || []).length > 0 && (
          <div>
            <p className="text-[11px] font-mono font-bold text-zinc-500 mb-1">Beyond this module</p>
            <p className="text-[12px] text-zinc-500 mb-2.5 leading-relaxed">
              Questions that naturally come up here but whose answers live in other modules.
            </p>
            <div className="space-y-1.5">
              {entry.beyond.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg border border-zinc-800/70 bg-zinc-900/20 px-3.5 py-2.5">
                  <span className="text-[13px] text-zinc-400 leading-snug flex-1">{b.q}</span>
                  <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 text-zinc-400">
                    → {b.moduleId} <span className="text-zinc-600">· QnA coming</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
