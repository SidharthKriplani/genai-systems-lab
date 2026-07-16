// src/components/QnAPanel.jsx — QnA interview mode panel (QNA-INTERVIEW-STANDARD.md).
// Renders on EVERY Foundations module page via FoundationsRunner:
//   - no qnaBank entry            → "coming soon" stub
//   - entry, module not complete  → locked card (completion gate; the gate is the design,
//                                    QnA is a post-completion interview-prep surface)
//   - entry + module complete     → the grid: beats → collapsed questions (tap to reveal),
//                                    level + difficulty filter chips, conditional expand-all,
//                                    traps, follow-up jump links (auto-expand + scroll), L3
//                                    cases, "Beyond this module" handoffs.
// Question IDs are global + permanent; element ids are `qna-<id>` for anchor/deep-link use.
//
// Browsing model (rework 2026-07-11):
//   - Single-open accordion in normal browsing: opening a question closes whatever else was
//     open. Manually closing an open question just closes that one (this is what lets a
//     partially-collapsed state exist after "Expand all" — see below).
//   - Level (L0-L3) and difficulty (Easy/Medium/Hard) are two independent filter chip rows,
//     combined with AND when both have a selection. A separate "All" chip clears both.
//   - "Expand all" / "Collapse all" is a single toggle, HIDDEN with no filter active (default
//     state relies on the accordion alone) and shown once a level or difficulty filter is
//     active. It operates on whatever is currently filtered-in, overriding single-open for
//     that one bulk action. Label reflects whether every filtered-in (answered) question is
//     currently expanded — so manually closing one question after "Expand all" flips the
//     label back to "Expand all" rather than "Collapse all" (not-all-expanded reads as the
//     "expand" state, since the natural next click is to finish expanding, and it also
//     correctly represents that the set is no longer fully closed OR fully open — "expand"
//     is the safer default because it never leaves a stray collapsed item unreachable).
//
// Answer bullet display (2026-07-16): qnaBank.js's `answer` arrays carry AMGB category labels
// (**Answer.**/**Mechanism.**/**Grounding.**/**Boundary.**) per QNA-ANSWER-SPEC v1 — that
// structure is for the writer/verify pipeline, not for on-screen display. The panel strips the
// label before rendering each bullet and offers a numbered/dotted list-style toggle instead
// (persisted to localStorage, same pattern as SpeakMode's `gsl-speak-history`).
//
// Level-chip hover tooltips (2026-07-16): each L0-L3 chip's `title` is the level's real
// definition from QNA-INTERVIEW-STANDARD.md's level taxonomy — not invented copy.

import { useState } from "react";
import { qnaForModule, qnaQuestionCount } from "../data/qnaBank.js";
import { Md } from "./RichText.jsx";

const BULLET_STYLE_KEY = "gsl-qna-bullet-style"; // "dot" | "number"

function loadBulletStyle() {
  try {
    const v = localStorage.getItem(BULLET_STYLE_KEY);
    return v === "number" ? "number" : "dot";
  } catch {
    return "dot";
  }
}

function saveBulletStyle(style) {
  try {
    localStorage.setItem(BULLET_STYLE_KEY, style);
  } catch {}
}

// Strips the leading **Answer./Mechanism./Grounding./Boundary.** category label a bullet
// carries in qnaBank.js — that labeling is for the writer/verify pipeline (QNA-ANSWER-SPEC v1),
// not for on-screen display, where it reads as clutter rather than structure.
const CATEGORY_PREFIX_RE = /^\*\*(?:Answer|Mechanism|Grounding|Boundary)\.\*\*\s*/;
function stripCategoryLabel(text) {
  return typeof text === "string" ? text.replace(CATEGORY_PREFIX_RE, "") : text;
}

// Small padlock SVG (no emoji per house rule) — reused by the runner's tab bar.
export function LockIcon({ size = 11, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// title text is each level's real definition per QNA-INTERVIEW-STANDARD.md's level taxonomy —
// shown as a hover tooltip on the level's filter chip.
const LEVEL_META = {
  0: {
    label: "L0", desc: "definition", cls: "border-zinc-600 bg-zinc-800/60 text-zinc-300",
    title: "L0 — definition/recall: what it is, where it lives, what it's for.",
  },
  1: {
    label: "L1", desc: "mechanism", cls: "border-sky-800/60 bg-sky-950/30 text-sky-300",
    title: "L1 — mechanism/why: how it works, why it's built this way, what breaks without it.",
  },
  2: {
    label: "L2", desc: "tradeoff", cls: "border-amber-800/60 bg-amber-950/30 text-amber-300",
    title: "L2 — comparison/tradeoff: X vs Y, when to use which, where X stops holding.",
  },
  3: {
    label: "L3", desc: "case", cls: "border-rose-800/60 bg-rose-950/30 text-rose-300",
    title: "L3 — case: an applied production/diagnostic scenario you walk through step by step.",
  },
};

// Difficulty is an axis independent of level (see qnaBank.js header) — deliberately a
// different color family (teal/violet/orange) so a difficulty badge next to a level chip
// never reads as "another level chip."
const DIFFICULTY_META = {
  easy: { label: "Easy", cls: "border-teal-800/60 bg-teal-950/30 text-teal-300" },
  medium: { label: "Medium", cls: "border-violet-800/60 bg-violet-950/30 text-violet-300" },
  hard: { label: "Hard", cls: "border-orange-800/60 bg-orange-950/30 text-orange-300" },
};

const LEVELS = [0, 1, 2, 3];
const DIFFICULTIES = ["easy", "medium", "hard"];

// Toggle between numbered (1. 2. 3.) and dotted (•) bullet-list styles.
function BulletStyleToggle({ style, onChange }) {
  return (
    <div className="inline-flex items-center rounded-md border border-zinc-700 overflow-hidden">
      <button
        onClick={() => onChange("dot")}
        title="Dotted list"
        aria-pressed={style === "dot"}
        className={`text-[10px] font-mono px-2 py-0.5 transition-colors ${
          style === "dot" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        •
      </button>
      <button
        onClick={() => onChange("number")}
        title="Numbered list"
        aria-pressed={style === "number"}
        className={`text-[10px] font-mono px-2 py-0.5 transition-colors border-l border-zinc-700 ${
          style === "number" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        1.2.3
      </button>
    </div>
  );
}

// Renders node.answer in either supported shape:
//   - array of AMGB bullet strings (QNA-ANSWER-SPEC v1, current format) → list, category label
//     stripped, style per `bulletStyle`
//   - single prose string (pre-2026-07-16 format, grandfathered pilots) → one paragraph
function AnswerBody({ answer, bulletStyle }) {
  if (Array.isArray(answer)) {
    const numbered = bulletStyle === "number";
    const Tag = numbered ? "ol" : "ul";
    const listCls = numbered
      ? "space-y-1.5 list-decimal list-outside pl-4 marker:text-zinc-500 marker:font-mono marker:text-xs"
      : "space-y-1.5 list-disc list-outside pl-4 marker:text-zinc-600";
    return (
      <Tag className={listCls}>
        {answer.map((bullet, i) => (
          <li key={i} className="text-sm text-zinc-300 leading-relaxed">
            <Md text={stripCategoryLabel(bullet)} />
          </li>
        ))}
      </Tag>
    );
  }
  return (
    <p className="text-sm text-zinc-300 leading-relaxed">
      <Md text={answer} />
    </p>
  );
}

function LevelChip({ level }) {
  const m = LEVEL_META[level] || LEVEL_META[0];
  return (
    <span
      title={m.title}
      className={`shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function DifficultyChip({ difficulty }) {
  const m = DIFFICULTY_META[difficulty];
  if (!m) return null;
  return (
    <span className={`shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded border ${m.cls}`}>
      {m.label}
    </span>
  );
}

// Filter chip: same base look as the old per-level buttons, but now purely a filter toggle —
// active gets a ring + full brightness, inactive (while some filter in this row IS active)
// dims slightly so the selection reads clearly. Optional `title` renders as a native hover
// tooltip (used by the level row to explain what each L0-L3 level means).
function FilterChip({ active, dimmed, cls, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-all hover:brightness-125 ${cls} ${
        active ? "ring-1 ring-white/50 brightness-110" : dimmed ? "opacity-50" : ""
      }`}
    >
      {children}
    </button>
  );
}

function QuestionRow({ node, expanded, onToggle, onJump, bulletStyle }) {
  const hasAnswer = !!node.answer; // parked questions ship before their answers do
  return (
    <div id={`qna-${node.id}`} className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <button
        onClick={() => hasAnswer && onToggle(node.id)}
        className={`w-full flex items-start gap-2.5 text-left px-4 py-3 transition-colors ${hasAnswer ? "hover:bg-zinc-900" : "cursor-default"}`}
      >
        <LevelChip level={node.level} />
        <DifficultyChip difficulty={node.difficulty} />
        <span className="text-sm text-zinc-200 leading-snug flex-1">{node.q}</span>
        {hasAnswer ? (
          <span className="text-zinc-600 text-xs mt-0.5">{expanded ? "−" : "+"}</span>
        ) : (
          <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-600 mt-0.5">
            answer in progress
          </span>
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-zinc-800/60">
          <AnswerBody answer={node.answer} bulletStyle={bulletStyle} />
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
  const [levelFilter, setLevelFilter] = useState(null); // 0-3 | null
  const [difficultyFilter, setDifficultyFilter] = useState(null); // "easy"|"medium"|"hard" | null
  const [bulletStyle, setBulletStyle] = useState(loadBulletStyle); // "dot" | "number"

  function changeBulletStyle(style) {
    setBulletStyle(style);
    saveBulletStyle(style);
  }

  const rule = (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
        Interview QnA
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );

  // ── No content yet at all: coming-soon stub. Draft entries (questions
  //    written, not yet light-question-audited) now render like parked ones —
  //    2026-07-11 supersedes the original "draft = not rendered" rule in
  //    QNA-INTERVIEW-STANDARD.md at the user's explicit direction. ──────────
  if (!entry) {
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

  const matchesFilters = (n) =>
    (levelFilter === null || n.level === levelFilter) &&
    (difficultyFilter === null || n.difficulty === difficultyFilter);

  const filtersActive = levelFilter !== null || difficultyFilter !== null;

  const filteredBeats = entry.beats
    .map(b => ({ ...b, questions: b.questions.filter(matchesFilters) }))
    .filter(b => b.questions.length > 0);
  const filteredCases = (entry.cases || []).filter(matchesFilters);
  const filteredNodes = [...filteredBeats.flatMap(b => b.questions), ...filteredCases];
  // Only answered nodes can expand/collapse — "answer in progress" rows don't count toward
  // the expand-all/collapse-all label logic.
  const expandableIds = filteredNodes.filter(n => n.answer).map(n => n.id);
  const allExpanded = expandableIds.length > 0 && expandableIds.every(id => expanded.has(id));

  function toggle(id) {
    setExpanded(prev => {
      if (prev.has(id)) {
        // Closing an open question never touches the others — this is what makes a
        // partial state possible after "Expand all" (see tie-break note in the file header).
        const s = new Set(prev);
        s.delete(id);
        return s;
      }
      // Opening: normal single-open accordion — close everything else, open only this one.
      return new Set([id]);
    });
  }
  function jump(id) {
    setExpanded(prev => new Set(prev).add(id));
    // let the expand render, then scroll
    requestAnimationFrame(() => {
      document.getElementById(`qna-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  function toggleAll() {
    setExpanded(allExpanded ? new Set() : new Set(expandableIds));
  }
  function selectLevel(l) {
    setLevelFilter(prev => (prev === l ? null : l));
  }
  function selectDifficulty(d) {
    setDifficultyFilter(prev => (prev === d ? null : d));
  }
  function clearFilters() {
    setLevelFilter(null);
    setDifficultyFilter(null);
  }

  return (
    <section>
      {rule}
      {entry.status === "draft" && (
        <div className="mt-3 rounded-lg border border-zinc-700/50 bg-zinc-800/20 px-3.5 py-2.5">
          <p className="text-[12px] text-zinc-400 leading-relaxed">
            <span className="text-[10px] font-mono font-bold text-zinc-500 mr-1.5">DRAFT</span>
            These questions are early, unaudited drafts — phrasing and scope haven't passed the
            light question-audit yet. Answers are still being written. Use them to self-quiz, but
            treat the questions themselves as provisional.
          </p>
        </div>
      )}
      {entry.status === "parked" && (
        <div className="mt-3 rounded-lg border border-amber-900/40 bg-amber-950/10 px-3.5 py-2.5">
          <p className="text-[12px] text-zinc-400 leading-relaxed">
            <span className="text-[10px] font-mono font-bold text-amber-400 mr-1.5">PARKED</span>
            The question grid is live; audited answers are still being written. Use the questions
            to self-quiz against the module — answer out loud, then check yourself against the story above.
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-500 font-mono">
          {allNodes.length} questions · tap to reveal
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-zinc-600 uppercase">List style</span>
          <BulletStyleToggle style={bulletStyle} onChange={changeBulletStyle} />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] font-mono text-zinc-600 uppercase mr-0.5">Level</span>
        <FilterChip
          active={!filtersActive}
          dimmed={filtersActive}
          cls="border-zinc-600 bg-zinc-800/60 text-zinc-300"
          onClick={clearFilters}
        >
          All
        </FilterChip>
        {LEVELS.map(l => (
          <FilterChip
            key={l}
            active={levelFilter === l}
            dimmed={levelFilter !== null && levelFilter !== l}
            cls={LEVEL_META[l].cls}
            title={LEVEL_META[l].title}
            onClick={() => selectLevel(l)}
          >
            {LEVEL_META[l].label} · {LEVEL_META[l].desc}
          </FilterChip>
        ))}
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
        <span className="text-[9px] font-mono text-zinc-600 uppercase mr-0.5">Difficulty</span>
        {DIFFICULTIES.map(d => (
          <FilterChip
            key={d}
            active={difficultyFilter === d}
            dimmed={difficultyFilter !== null && difficultyFilter !== d}
            cls={DIFFICULTY_META[d].cls}
            onClick={() => selectDifficulty(d)}
          >
            {DIFFICULTY_META[d].label}
          </FilterChip>
        ))}
      </div>

      {filtersActive && (
        <div className="mt-2">
          <button
            onClick={toggleAll}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      <div className="mt-5 space-y-7">
        {filtersActive && filteredNodes.length === 0 && (
          <p className="text-sm text-zinc-500">No questions match these filters.</p>
        )}

        {filteredBeats.map((beat, bi) => (
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
                  bulletStyle={bulletStyle}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredCases.length > 0 && (
          <div>
            <p className="text-[11px] font-mono font-bold text-rose-400/80 mb-2.5">
              Cases — walk the diagnosis out loud
            </p>
            <div className="space-y-2">
              {filteredCases.map(node => (
                <QuestionRow
                  key={node.id}
                  node={node}
                  expanded={expanded.has(node.id)}
                  onToggle={toggle}
                  onJump={jump}
                  bulletStyle={bulletStyle}
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
