// src/CodeWalkthrough.jsx — "Code Labs" renderer for the BUILD frame.
//
// "BUILD as real coding" — guided read-and-reason code walkthroughs. Renders a lab
// from src/data/codeLabsData.js: an intro (scenario / what you'll build), an ordered
// list of steps (annotated real code block + first-principles explanation + optional
// judgment checkpoint MCQ), and a closing "key decisions recap." NO runtime execution
// — this is a read-and-reason surface. GSL dark theme (zinc palette, violet accents),
// matching the FoundationsRunner primitives (SectionRule / InlineMd / QuestionBlock).
//
// Completion is tracked in localStorage key `gsl-codelabs` (JSON array of lab ids).
// A lab is completable once every checkpoint has been answered.
//
// Props: { onNavigate }  — onNavigate(view) for tab jumps (optional).

import { useState, useEffect } from "react";
import { CODE_LABS } from "./data/codeLabsData";

const CODELABS_KEY = "gsl-codelabs";

function loadDone() {
  try {
    const raw = JSON.parse(localStorage.getItem(CODELABS_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}
function saveDone(set) {
  try {
    localStorage.setItem(CODELABS_KEY, JSON.stringify([...set]));
  } catch {}
}

const DIFF_STYLE = {
  intro:    { label: "Intro",    cls: "border-emerald-800/50 bg-emerald-950/20 text-emerald-400" },
  core:     { label: "Core",     cls: "border-violet-800/50 bg-violet-950/20 text-violet-400" },
  advanced: { label: "Advanced", cls: "border-amber-800/50 bg-amber-950/20 text-amber-400" },
};

// ─── TOP-LEVEL ────────────────────────────────────────────────────────────────

export default function CodeWalkthrough({ onNavigate }) {
  const [doneSet, setDoneSet] = useState(loadDone);
  const [activeId, setActiveId] = useState(null);

  const markComplete = (id) => {
    setDoneSet((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDone(next);
      return next;
    });
  };

  const activeLab = activeId ? CODE_LABS.find((l) => l.id === activeId) : null;

  if (activeLab) {
    return (
      <LabView
        lab={activeLab}
        done={doneSet.has(activeLab.id)}
        onComplete={() => markComplete(activeLab.id)}
        onBack={() => setActiveId(null)}
        onNavigate={onNavigate}
      />
    );
  }

  return <LabBrowser labs={CODE_LABS} doneSet={doneSet} onOpen={setActiveId} />;
}

// ─── BROWSER (lab list) ───────────────────────────────────────────────────────

function LabBrowser({ labs, doneSet, onOpen }) {
  const completed = labs.filter((l) => doneSet.has(l.id)).length;
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
            style={{ color: "var(--gal-build)", borderColor: "var(--gal-build-border, rgba(34,211,238,0.35))" }}
          >
            Code Labs
          </span>
          <span className="text-[10px] font-mono text-zinc-600">BUILD · read &amp; reason</span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-tight">Read real GenAI systems code</h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-2xl">
          The differentiator for an Applied AI Engineer isn't writing one more toy app — it's{" "}
          <span className="text-zinc-200">reading and reasoning</span> about real, idiomatic systems
          code: MCP servers, RAG pipelines, multi-agent orchestrators. Each lab walks annotated code
          in steps — what it does, <span className="text-zinc-200">why</span> the design decision was
          made, and a judgment checkpoint on what breaks if it's wrong. No runtime, no setup — just
          the reasoning a senior/staff engineer is expected to have.
        </p>
        {labs.length > 0 && (
          <p className="text-[11px] font-mono text-zinc-500 mt-3">
            {completed}/{labs.length} labs complete
          </p>
        )}
      </div>

      <div className="space-y-3">
        {labs.map((lab) => {
          const d = DIFF_STYLE[lab.difficulty] || DIFF_STYLE.core;
          const isDone = doneSet.has(lab.id);
          return (
            <button
              key={lab.id}
              onClick={() => onOpen(lab.id)}
              className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all p-5 group"
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 text-zinc-400">
                  {lab.tag}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${d.cls}`}>{d.label}</span>
                <span className="text-[10px] font-mono text-zinc-600">· {lab.minutes} min · {lab.status === "upcoming" ? `${lab.outline?.length ?? 0}-step outline` : `${lab.steps?.length ?? 0} steps`}</span>
                {lab.status === "upcoming" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-800/50 bg-amber-950/20 text-amber-400">
                    In development
                  </span>
                )}
                {isDone && lab.status !== "upcoming" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/20 text-emerald-400">
                    ✓ Complete
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-white">{lab.title}</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{lab.subtitle}</p>
              <span className="inline-block mt-3 text-xs font-mono text-violet-400 group-hover:text-violet-300">
                {isDone ? "Review →" : "Read the walkthrough →"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── LAB VIEW (single walkthrough) ────────────────────────────────────────────

function LabView({ lab, done, onComplete, onBack, onNavigate }) {
  const isUpcoming = lab.status === "upcoming" || !lab.steps;
  // one answer slot per step that HAS a checkpoint
  const checkpointSteps = (lab.steps || []).filter((s) => s.checkpoint);
  const [answers, setAnswers] = useState(() => ({})); // stepIndex -> selected idx
  const [submitted, setSubmitted] = useState(() => ({})); // stepIndex -> bool

  useEffect(() => {
    // reset per lab switch
    setAnswers({});
    setSubmitted({});
  }, [lab.id]);

  const select = (si, i) => {
    if (submitted[si]) return;
    setAnswers((prev) => ({ ...prev, [si]: i }));
  };
  const submit = (si) => {
    if (answers[si] == null) return;
    setSubmitted((prev) => ({ ...prev, [si]: true }));
  };

  const answeredCount = (lab.steps || []).filter((s, si) => s.checkpoint && submitted[si]).length;
  const allAnswered = checkpointSteps.length === 0 || answeredCount === checkpointSteps.length;

  const d = DIFF_STYLE[lab.difficulty] || DIFF_STYLE.core;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <button
          onClick={onBack}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3 inline-flex items-center gap-1"
        >
          ← Code Labs
        </button>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 text-zinc-400">
            {lab.tag}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${d.cls}`}>{d.label}</span>
          {done && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/20 text-emerald-400">
              ✓ Complete
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white leading-tight">{lab.title}</h2>
        <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{lab.subtitle}</p>
      </div>

      <div className="space-y-14">
        {/* Intro */}
        <section>
          <SectionRule label="The Scenario" />
          <div className="mt-4 space-y-4">
            <div className="rounded-xl p-5 border border-zinc-800 bg-zinc-900/50">
              <p className="text-sm text-zinc-200 leading-relaxed">
                <InlineMd text={lab.intro.scenario} />
              </p>
            </div>
            <div className="rounded-xl p-4 border border-violet-900/30 bg-violet-950/10">
              <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-1.5">What you'll read</p>
              <p className="text-sm text-zinc-200 leading-relaxed">
                <InlineMd text={lab.intro.whatYouBuild} />
              </p>
            </div>
            {lab.intro.prereqs?.length > 0 && (
              <div className="rounded-xl p-4 border border-zinc-800 bg-zinc-950/40">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Assumes you know</p>
                <ul className="space-y-1.5">
                  {lab.intro.prereqs.map((p, i) => (
                    <li key={i} className="flex gap-2 text-xs text-zinc-400 leading-relaxed">
                      <span className="text-zinc-600 shrink-0 mt-0.5">·</span>
                      <span><InlineMd text={p} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming: show the planned outline instead of steps */}
        {isUpcoming && (
          <section>
            <SectionRule label="Planned outline" />
            <div className="mt-4 rounded-xl p-4 border border-amber-900/30 bg-amber-950/10 mb-4">
              <p className="text-sm text-amber-300/90 leading-relaxed">🚧 This walkthrough is in development — the full annotated code + checkpoints are coming. Here's what it will cover:</p>
            </div>
            <ol className="space-y-2.5">
              {(lab.outline || []).map((step, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                  <span className="text-xs font-mono text-zinc-600 shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="text-sm text-zinc-300 leading-relaxed"><InlineMd text={typeof step === "string" ? step : (step.title || step.label || "")} /></span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Steps */}
        {!isUpcoming && (lab.steps || []).map((step, si) => (
          <section key={si}>
            <SectionRule label={step.title} />
            <div className="mt-4 space-y-4">
              <CodeBlock code={step.code} language={step.language} />
              <div className="space-y-3">
                {step.explanation.map((para, pi) => (
                  <p key={pi} className="text-sm text-zinc-200 leading-relaxed">
                    <InlineMd text={para} />
                  </p>
                ))}
              </div>
              {step.checkpoint && (
                <div className="pt-2">
                  <p className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest mb-3">
                    ◆ Judgment checkpoint
                  </p>
                  <QuestionBlock
                    q={step.checkpoint}
                    selected={answers[si] ?? null}
                    isSubmitted={!!submitted[si]}
                    onSelect={(i) => select(si, i)}
                    onSubmit={() => submit(si)}
                  />
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Recap (authored labs only) */}
        {!isUpcoming && (
        <section>
          <SectionRule label="Key Decisions Recap" />
          <ul className="mt-4 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            {(lab.recap || []).map((pt, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-200 leading-relaxed">
                <span className="text-violet-400 shrink-0 mt-0.5">▸</span>
                <span><InlineMd text={pt} /></span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            {done ? (
              <p className="text-sm text-emerald-400 font-semibold">✓ Completed</p>
            ) : (
              <button
                onClick={onComplete}
                disabled={!allAnswered}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all ${
                  allAnswered
                    ? "bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {allAnswered
                  ? "Mark Complete ✓"
                  : `Answer all ${checkpointSteps.length} checkpoints to complete (${answeredCount}/${checkpointSteps.length})`}
              </button>
            )}
          </div>
        </section>
        )}
      </div>
    </div>
  );
}

// ─── CODE BLOCK ───────────────────────────────────────────────────────────────
// Read-only mono block with a language chip. Light "syntax-ish" tinting via CSS —
// no execution, no external highlighter dependency.

function CodeBlock({ code, language }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          {language || "code"}
        </span>
        <span className="text-[9px] font-mono text-zinc-700">read-only</span>
      </div>
      <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre px-4 py-4">
        {code}
      </pre>
    </div>
  );
}

// ─── QUESTION BLOCK (parity with FoundationsRunner) ───────────────────────────

function QuestionBlock({ q, selected, isSubmitted, onSelect, onSubmit }) {
  const isCorrect = selected === q.correct;
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const sel = selected === i;
          const right = q.correct === i;
          let cls = "text-zinc-400 border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:text-zinc-300";
          if (isSubmitted) {
            if (right) cls = "text-emerald-300 border-emerald-800/50 bg-emerald-950/20";
            else if (sel) cls = "text-red-300 border-red-800/50 bg-red-950/20";
            else cls = "text-zinc-600 border-zinc-800 bg-zinc-900/30 opacity-50";
          } else if (sel) {
            cls = "text-violet-300 border-violet-600 bg-violet-950/30";
          }
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={isSubmitted}
              className={`w-full text-left text-sm px-4 py-3 rounded-lg border transition-all ${cls}`}
            >
              <span className="font-mono text-[11px] mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {isSubmitted && right && <span className="ml-2 text-emerald-400 font-bold">✓</span>}
              {isSubmitted && sel && !right && <span className="ml-2 text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {isSubmitted ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm leading-relaxed border ${
            isCorrect
              ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
          }`}
        >
          <span className="font-bold mr-1">{isCorrect ? "Correct." : "Not quite."}</span>
          {q.explanation}
        </div>
      ) : (
        <button
          onClick={onSubmit}
          disabled={selected === null}
          className="px-5 py-2.5 rounded-lg text-sm font-bold border border-violet-800/50 text-violet-400 hover:border-violet-600 hover:text-violet-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Check answer
        </button>
      )}
    </div>
  );
}

// ─── SHARED PRIMITIVES (parity with FoundationsRunner) ────────────────────────

function SectionRule({ label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

// Lightweight inline markdown — **bold**, *em*/_em_, `code`, ==highlight==, \n\n paragraph.
function InlineMd({ text }) {
  if (typeof text !== "string") return text ?? null;
  const paras = text.split(/\n\n+/);
  return (
    <>
      {paras.map((para, pi) => (
        <span key={pi} className={pi > 0 ? "block mt-3" : undefined}>
          {renderLines(para)}
        </span>
      ))}
    </>
  );
}

function renderLines(para) {
  const lines = para.split("\n");
  return lines.map((line, li) => (
    <span key={li}>
      {li > 0 && <br />}
      {tokenizeInline(line)}
    </span>
  ));
}

const INLINE_RULES = [
  { re: /\*\*([^*]+)\*\*/, kind: "bold" },
  { re: /==([^=]+)==/, kind: "highlight" },
  { re: /`([^`]+)`/, kind: "code" },
  { re: /\*([^*\n]+)\*/, kind: "em" },
  { re: /_([^_\n]+)_/, kind: "em" },
];

function tokenizeInline(str) {
  const out = [];
  let rest = str;
  let guard = 0;
  while (rest.length && guard++ < 5000) {
    let best = null;
    for (const rule of INLINE_RULES) {
      const m = rule.re.exec(rest);
      if (m && (best === null || m.index < best.m.index)) {
        best = { m, kind: rule.kind };
      }
    }
    if (!best) {
      out.push(rest);
      break;
    }
    const { m, kind } = best;
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const inner = m[1];
    const key = out.length;
    if (kind === "bold") {
      out.push(<strong key={key} className="font-semibold text-zinc-50">{inner}</strong>);
    } else if (kind === "highlight") {
      out.push(
        <mark key={key} className="rounded px-1 py-0.5 bg-violet-500/15 text-violet-200 font-medium">
          {inner}
        </mark>
      );
    } else if (kind === "code") {
      out.push(
        <code key={key} className="font-mono text-[0.82em] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700/60">
          {inner}
        </code>
      );
    } else {
      out.push(<em key={key} className="italic text-zinc-300">{inner}</em>);
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}
