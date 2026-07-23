// src/FoundationsRunner.jsx — single-scroll layout, no step nav, no unlock buttons (sprint 93s)
// Schema: runnerData.mcqs (array) preferred; runnerData.mcq (object) supported for compat.

import { useState, useRef, useEffect } from "react";
import { FOUNDATION_SCENES } from "./components/nicheViz/foundationScenes.jsx";
import HighlightPopover from "./components/HighlightPopover.jsx";
import QnAPanel, { LockIcon } from "./components/QnAPanel.jsx";
import GlossaryTerm from "./components/GlossaryTerm.jsx";
import { GLOSSARY } from "./data/glossary.js";
import { writeLastTouched } from "./utils/lastTouched.js";
import { StickyScope } from "./StickyNotes.jsx";
import { getTakeaway, setTakeaway } from "./utils/takeaway.js";

export default function FoundationsRunner({
  moduleId,
  module,
  runnerData,
  Component,
  spec,
  onNavigate,
  mastery,
  markComplete,
  unmarkComplete,
  onBack,
  gymLabel,
  gymId,
}) {
  // Scopes the highlight-to-track selection listener to this module's own
  // rendered content — never the app shell/sidebar/nav (see HighlightPopover.jsx).
  const contentRef = useRef(null);
  const alreadyDone = mastery?.has(moduleId);
  const hasInteractive = !!Component;

  // ── Glossary hover/tap terms (2026-07-08) ──────────────────────────────────
  // "Already shown" is tracked per rendered module page — a fresh Set whenever
  // moduleId changes — so only the FIRST occurrence of a given glossary term
  // gets wrapped, not every repeat. tokenizeInline (below, module scope) reads
  // this via the mutable _glossaryCtx handoff set just before render, since
  // tokenizeInline/InlineMd are plain functions outside this component and this
  // app's synchronous single-tree rendering makes that handoff safe.
  const shownGlossaryRef = useRef(new Set());
  const prevGlossaryModuleId = useRef(moduleId);
  if (prevGlossaryModuleId.current !== moduleId) {
    shownGlossaryRef.current = new Set();
    prevGlossaryModuleId.current = moduleId;
  }
  _glossaryCtx = { moduleId, onNavigate, shown: shownGlossaryRef.current };

  // Continue-strip: remember this module as "last touched" for Progress's
  // resume card (see utils/lastTouched.js). Fires whenever the rendered
  // module changes.
  useEffect(() => {
    if (moduleId) writeLastTouched({ gymId, moduleId, title: module?.title });
  }, [moduleId, gymId, module?.title]);

  const mcqList = runnerData.mcqs
    ? runnerData.mcqs
    : runnerData.mcq
    ? [runnerData.mcq]
    : [];

  const [answers, setAnswers]     = useState(() => Array(mcqList.length).fill(null));
  const [submitted, setSubmitted] = useState(() => Array(mcqList.length).fill(false));
  // ── View deep-link v1 (2026-07-23): optional 4th hash segment
  //    #concepts/<gymId>/<moduleId>/<view>, view ∈ academic|recap|min|qna.
  //    Read ONCE per mount into the useState initializers below — safe because
  //    Concepts.jsx renders <FoundationsRunner key={active}/>, so every module
  //    open is a fresh mount (no stale-view carryover, no read/write effect race).
  //    qna honors the completion gate; academic/min require the module to carry
  //    the content, else fall back to Full silently.
  const initialHashView = (() => {
    try {
      const parts = (window.location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
      return parts[0] === "concepts" && parts[2] === moduleId ? (parts[3] || "") : "";
    } catch { return ""; }
  })();
  const [recapMode, setRecapMode] = useState(initialHashView === "recap");
  // ── Interview QnA view (QNA-INTERVIEW-STANDARD.md) — completion-gated tab ──
  const [qnaMode, setQnaMode] = useState(initialHashView === "qna" && !!mastery?.has(moduleId));
  // ── 20:80 Interview-Minimum mini-tab (T8, 2026-07-23) ──
  const [minMode, setMinMode] = useState(initialHashView === "min" && (runnerData?.interviewMin?.length > 0));
  // ── Academic view (T6, promoted from collapsed panel to tab 2026-07-23) ──
  const [academicMode, setAcademicMode] = useState(initialHashView === "academic" && (runnerData?.deeperMath?.length > 0));
  // ── Cloud view (2026-07-23): concept -> AWS/GCP/Azure translation annex ──
  const [cloudMode, setCloudMode] = useState(initialHashView === "cloud" && (runnerData?.cloudMap?.length > 0));
  const [qnaLockMsg, setQnaLockMsg] = useState(false);   // tap/hover feedback on the locked tab
  const [tabTip, setTabTip] = useState(null);            // instant hover description under the view switcher
  // 2026-07-23 fix: this scroll-reset effect MUST sit below the qnaMode
  // declaration -- its dependency array evaluates at render time, and
  // referencing qnaMode above its const line threw a TDZ ("Cannot access 'T'
  // before initialization") that crashed every module open. (Fable bug,
  // introduced by widening the deps of an effect inserted above the binding.)
  useEffect(() => { try { window.scrollTo({ top: 0 }); } catch { /* SSR */ } }, [recapMode, qnaMode, minMode, academicMode, cloudMode]);
  // View deep-link v1, write half: mirror the active view into the 4th hash
  // segment via replaceState (never pushState — view flips shouldn't mint
  // history entries, so Back still walks module → gym untouched). Guarded to
  // fire only when the hash ALREADY addresses this exact module, so it can
  // never fight Concepts.jsx's syncConceptsHash pushes or non-concepts views.
  useEffect(() => {
    try {
      const h = window.location.hash || "";
      const parts = h.replace(/^#\/?/, "").split("/").filter(Boolean);
      if (parts[0] !== "concepts" || parts[1] !== gymId || parts[2] !== moduleId) return;
      const view = qnaMode ? "qna" : academicMode ? "academic" : recapMode ? "recap" : minMode ? "min" : cloudMode ? "cloud" : "";
      const target = "#concepts/" + gymId + "/" + moduleId + (view ? "/" + view : "");
      if (h !== target) window.history.replaceState(null, "", target);
    } catch {}
  }, [recapMode, qnaMode, minMode, academicMode, cloudMode, gymId, moduleId]);
  const [qnaPulse, setQnaPulse] = useState(false);       // one-shot nudge when completion unlocks it
  const [tab, setTab]             = useState("lesson"); // "lesson" | "code"

  const { scenario, groundUp, explanation, takeaway, keyPoints, recap, deeperMath, interviewMin, cloudMap } = runnerData;

  // ── "Your takeaway" (Q3 Wave A item 2, 2026-07-23) — user-writable box
  // shown atop the recap tab. Same pageKey formula as HighlightPopover.jsx /
  // reviewCards.js (`fnd::${gymId}::${moduleId}`) so it rides the same sync
  // bucket. The component doesn't remount on module switch (see the
  // shownGlossaryRef pattern above for the same problem), so pageKey
  // changing mid-life needs an explicit reset — done here as "adjust state
  // during render" (React's documented pattern for state derived from a
  // prop-like value that can change without a remount) rather than an
  // effect, so the box never flashes the PREVIOUS module's text for a frame.
  const takeawayPageKey = `fnd::${gymId || ""}::${moduleId || ""}`;
  const [loadedTakeawayKey, setLoadedTakeawayKey] = useState(takeawayPageKey);
  const [takeawayText, setTakeawayText] = useState(() => getTakeaway(takeawayPageKey));
  const takeawayLoadedRef = useRef(takeawayText);
  if (takeawayPageKey !== loadedTakeawayKey) {
    const fresh = getTakeaway(takeawayPageKey);
    setLoadedTakeawayKey(takeawayPageKey);
    setTakeawayText(fresh);
    takeawayLoadedRef.current = fresh;
  }
  // Debounced write-through — only fires when the text actually differs from
  // what's persisted, so merely viewing a module (no edit) never bumps its
  // stored editedTs / never dispatches a spurious sync push.
  useEffect(() => {
    if (takeawayText === takeawayLoadedRef.current) return;
    const t = setTimeout(() => {
      setTakeaway(takeawayPageKey, takeawayText);
      takeawayLoadedRef.current = takeawayText;
    }, 700);
    return () => clearTimeout(t);
  }, [takeawayPageKey, takeawayText]);

  // ── Code tab (2026-07-03, amended 2026-07-08): the tab exists ONLY when the module carries an
  //    explicit runnerData.code field. Illustrations JOIN an existing Code tab (they're often
  //    traces/snippets), but illustrations ALONE no longer create one — ASCII tables are teaching
  //    content whose position in the prose flow is deliberate (text–scene pairing; the transformer
  //    template's RMS drift table pairs with the norm beats). Supported code shapes:
  //    string | {label, content, lang} | array of either. ──
  const illustrations = Array.isArray(explanation)
    ? explanation.filter(it => it && typeof it === "object" && it.type === "illustration")
    : [];
  const explicitCode = normalizeCode(runnerData.code);
  const codeBlocks = [...explicitCode, ...illustrations.map(it => ({ label: it.label, content: it.content, lang: it.lang }))];
  const hasCode = explicitCode.length > 0;
  // When a Code tab exists, strip illustrations out of the inline explanation flow.
  const explanationForLesson = hasCode && Array.isArray(explanation)
    ? explanation.filter(it => !(it && typeof it === "object" && it.type === "illustration"))
    : explanation;

  function selectAnswer(qi, i) {
    if (submitted[qi]) return;
    const isMulti = Array.isArray(mcqList[qi]?.correct);
    setAnswers(prev => {
      const a = [...prev];
      if (isMulti) {
        const cur = Array.isArray(a[qi]) ? a[qi] : [];
        a[qi] = cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i].sort((x, y) => x - y);
      } else {
        a[qi] = i;
      }
      return a;
    });
  }

  function submitAnswer(qi) {
    if (answers[qi] === null) return;
    setSubmitted(prev => { const s = [...prev]; s[qi] = true; return s; });
  }

  function handleComplete() {
    markComplete?.(moduleId);
    // The unlock happens in the tab bar at the top while the user sits at the
    // bottom "Mark Complete" button — pulse the QnA tab so the payoff is visible.
    setQnaPulse(true);
    setTimeout(() => setQnaPulse(false), 4000);
  }

  function handleUndo() {
    unmarkComplete?.(moduleId);
  }

  const allSubmitted = mcqList.length === 0 || submitted.every(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8" ref={contentRef} data-own-highlighter="1">
      {/* v1.6: sticky notes on this view are bucketed per module (structural bleed fix) */}
      <StickyScope id={"m:" + moduleId + (qnaMode ? ":qna" : academicMode ? ":academic" : recapMode ? ":recap" : minMode ? ":min" : cloudMode ? ":cloud" : "")} />
      <HighlightPopover
        containerRef={contentRef}
        moduleId={moduleId}
        gymId={gymId}
        sourceLabel={module?.title}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <button
          onClick={onBack}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3 inline-flex items-center gap-1"
        >
          ← {gymLabel || "Foundations"}
        </button>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {module?.tag && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 text-zinc-400">
              {module.tag}
            </span>
          )}
          {alreadyDone && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-800/50 bg-emerald-950/20 text-emerald-400">
              ✓ Complete
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white leading-tight">{module?.title}</h2>
        {module?.subtitle && (
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{module.subtitle}</p>
        )}

        <div className="mt-4 relative inline-flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
          <button
            onClick={() => { setRecapMode(false); setQnaMode(false); setMinMode(false); setAcademicMode(false); setCloudMode(false); }}
            onMouseEnter={() => setTabTip("Full — the complete lesson: teaching, worked examples, key points")}
            onMouseLeave={() => setTabTip(null)}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
              !recapMode && !qnaMode && !minMode && !academicMode && !cloudMode ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Full
          </button>
          {deeperMath?.length > 0 && (
            <button
              onClick={() => { setAcademicMode(true); setRecapMode(false); setQnaMode(false); setMinMode(false); setCloudMode(false); }}
              onMouseEnter={() => setTabTip("Academic — formal setup and derivations: the math behind the lesson, with primary sources")}
              onMouseLeave={() => setTabTip(null)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                academicMode ? "bg-amber-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Academic
            </button>
          )}
          {cloudMap?.length > 0 && (
            <button
              onClick={() => { setCloudMode(true); setRecapMode(false); setQnaMode(false); setMinMode(false); setAcademicMode(false); }}
              onMouseEnter={() => setTabTip("Cloud — this concept in AWS / GCP / Azure: names, deltas, costs, and vendor-lock interview answers")}
              onMouseLeave={() => setTabTip(null)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                cloudMode ? "bg-sky-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Cloud
            </button>
          )}
          {interviewMin?.length > 0 && (
            <button
              onClick={() => { setMinMode(true); setRecapMode(false); setQnaMode(false); setAcademicMode(false); setCloudMode(false); }}
              onMouseEnter={() => setTabTip("20:80 — the interview minimum: the 20% of this module that carries 80% of interview asks")}
              onMouseLeave={() => setTabTip(null)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                minMode ? "bg-emerald-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              20:80
            </button>
          )}
          {recap && (
            <button
              onClick={() => { setRecapMode(true); setQnaMode(false); setMinMode(false); setAcademicMode(false); setCloudMode(false); }}
              onMouseEnter={() => setTabTip("Quick recap — compressed refresher of what this module taught")}
              onMouseLeave={() => setTabTip(null)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                recapMode && !qnaMode ? "bg-violet-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              ⚡ Quick recap
            </button>
          )}
          <button
            onClick={() => {
              if (!alreadyDone) {
                setQnaLockMsg(true);
                setTimeout(() => setQnaLockMsg(false), 2400);
                return;
              }
              setQnaMode(true); setRecapMode(false); setMinMode(false); setAcademicMode(false); setCloudMode(false);
            }}
            onMouseEnter={() => { if (!alreadyDone) setQnaLockMsg(true); else setTabTip("Interview QnA — real interview questions with graded answers for this module"); }}
            onMouseLeave={() => { setQnaLockMsg(false); setTabTip(null); }}
            aria-disabled={!alreadyDone}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors inline-flex items-center gap-1.5 ${
              qnaMode
                ? "bg-sky-700 text-white"
                : alreadyDone
                ? `text-zinc-500 hover:text-zinc-300 ${qnaPulse ? "animate-pulse text-sky-300" : ""}`
                : "text-zinc-600 cursor-not-allowed"
            }`}
          >
            {!alreadyDone && <LockIcon size={10} />}
            Interview QnA
          </button>
          {tabTip && !qnaLockMsg && (
            <span className="absolute left-0 top-full mt-1.5 whitespace-nowrap text-[10px] font-mono px-2.5 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 z-20 shadow-lg">
              {tabTip}
            </span>
          )}
          {qnaLockMsg && !alreadyDone && (
            <span className="absolute left-0 top-full mt-1.5 whitespace-nowrap text-[10px] font-mono px-2.5 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 z-20 shadow-lg">
              Mark the module complete to unlock Interview QnA
            </span>
          )}
        </div>

        {/* ── Lesson / Code tab bar (only when the module carries code) ── */}
        {hasCode && !recapMode && !qnaMode && !minMode && !academicMode && !cloudMode && (
          <div className="mt-4 inline-flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
            <button
              onClick={() => setTab("lesson")}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                tab === "lesson" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Lesson
            </button>
            <button
              onClick={() => setTab("code")}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                tab === "code" ? "bg-amber-600 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {"</> Code"}
            </button>
          </div>
        )}
      </div>

      {/* ── Interview QnA view (completion-gated; tab above enforces the gate) ── */}
      {qnaMode ? (
        <QnAPanel moduleId={moduleId} unlocked={alreadyDone} />
      ) : academicMode && deeperMath?.length > 0 ? (
        <section className="space-y-4">
          <SectionRule label="Academic — formal setup & derivations" />
          <div className="mt-4 rounded-xl border border-amber-900/40 bg-amber-950/10 p-5">
            <AnnexBlocks items={deeperMath} moduleId={moduleId} accent="amber" />
          </div>
          <p className="text-[11px] text-zinc-600">Derivation-grade tier — the Full view teaches the intuition this formalizes.</p>
        </section>
      ) : minMode && interviewMin?.length > 0 ? (
        <section className="space-y-4">
          <SectionRule label="Interview Minimum — the 20% that carries 80%" />
          <div className="mt-4 rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-5">
            <AnnexBlocks items={interviewMin} moduleId={moduleId} accent="emerald" />
          </div>
          <p className="text-[11px] text-zinc-600">This is the floor, not the ceiling — the Full view and Interview QnA carry the rest.</p>
        </section>
      ) : cloudMode && cloudMap?.length > 0 ? (
        <section className="space-y-4">
          <SectionRule label="Cloud — the concept in AWS / GCP / Azure" />
          <div className="mt-4 rounded-xl border border-sky-900/40 bg-sky-950/10 p-5">
            <AnnexBlocks items={cloudMap} moduleId={moduleId} accent="sky" />
          </div>
          <p className="text-[11px] text-zinc-600">Service names churn; the primitives don't — anchor on the primitive, then speak whichever vendor the interviewer runs.</p>
        </section>
      ) : hasCode && tab === "code" && !recapMode ? (
        <section className="space-y-6">
          <SectionRule label={`Code${codeBlocks.length > 1 ? ` · ${codeBlocks.length} blocks` : ""}`} />
          {codeBlocks.map((cb, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              {cb.label && (
                <p className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest mb-3">
                  {cb.label}{cb.lang ? ` · ${cb.lang}` : ""}
                </p>
              )}
              <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">{cb.content}</pre>
            </div>
          ))}
          <p className="text-[11px] text-zinc-600">Switch to the Lesson tab for the walkthrough and the check questions.</p>
        </section>
      ) : recapMode && recap ? (
        <div className="space-y-6">
          {/* ── Your takeaway (Q3 Wave A item 2, 2026-07-23) — user-writable,
               distinct from the authored "Takeaway" section below. Shown
               atop the recap tab per spec; local edits debounce-save so
               typing doesn't hammer localStorage/sync on every keystroke. */}
          <section>
            <SectionRule label="Your Takeaway" />
            <textarea
              value={takeawayText}
              onChange={(e) => setTakeawayText(e.target.value)}
              placeholder="Write your own one-line takeaway for this module…"
              rows={2}
              className="mt-4 w-full text-sm text-zinc-200 leading-relaxed rounded-xl p-4 resize-y"
              style={{
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.35)",
                outline: "none",
              }}
            />
          </section>
          <section>
            <SectionRule label="Quick Recap" />
            <ul className="mt-4 space-y-3">
              {recap.map((pt, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-200 leading-relaxed">
                  <span className="text-violet-400 shrink-0 mt-0.5">▸</span>
                  <span><InlineMd text={pt} /></span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <SectionRule label="Takeaway" />
            <div className="mt-4 rounded-xl p-5 border border-emerald-900/30 bg-emerald-950/10">
              <p className="text-sm text-zinc-200 leading-relaxed font-medium"><InlineMd text={takeaway} /></p>
            </div>
          </section>
        </div>
      ) : (
      <div className="space-y-14">

        {/* ── Opener: from-zero "Start Here" (migrated modules with `groundUp`)
             OR the legacy "Production Scenario" for modules not yet migrated ─── */}
        <section>
          <SectionRule label={groundUp ? "Start Here" : "Production Scenario"} />
          <div className="mt-4 rounded-xl p-5 border border-zinc-800 bg-zinc-900/50 space-y-3">
            {String(groundUp || scenario).split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-zinc-200 leading-relaxed font-medium"><InlineMd text={para} /></p>
            ))}
          </div>
        </section>

        {/* ── Explanation ──────────────────────────────────────────────────── */}
        <section>
          <SectionRule label="Explanation" />
          <div className="mt-4 space-y-4">
            {explanationForLesson.map((item, i) => {
              if (typeof item === "string") {
                return <p key={i} className="text-sm text-zinc-200 leading-relaxed"><InlineMd text={item} /></p>;
              }
              {/* Typography blocks in MAIN lesson text (H0, 2026-07-23): the same
                  {h}/{eq}/{list} shapes the annex tabs use, violet lesson accent —
                  formulas get display lines, numbered pointers get real bullets,
                  per labs/_plan/TYPOGRAPHY-RULES-2026-07.md. */}
              if (item?.h) {
                return <p key={i} className="pt-3 text-[11px] font-mono font-bold uppercase tracking-widest text-violet-400/90">{item.h}</p>;
              }
              if (item?.eq) {
                return (
                  <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/80 border-l-2 border-l-violet-500/60 px-4 py-3 overflow-x-auto">
                    <pre className="text-[13px] font-mono text-zinc-100 leading-relaxed whitespace-pre">{item.eq}</pre>
                  </div>
                );
              }
              if (item?.list) {
                return (
                  <ul key={i} className="space-y-2.5">
                    {item.list.map((li, j) => (
                      <li key={j} className="flex gap-3 text-sm text-zinc-200 leading-relaxed">
                        <span className="text-violet-400 shrink-0 mt-0.5">{"\u25b8"}</span>
                        <span><InlineMd text={li} /></span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (item?.type === "illustration") {
                return (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 mt-2">
                    {item.label && (
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">{item.label}</p>
                    )}
                    <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">{item.content}</pre>
                  </div>
                );
              }
              if (item?.type === "scene") {
                const Scene = FOUNDATION_SCENES[`${moduleId}/${item.sceneId}`];
                return Scene ? <div key={i} className="my-2"><Scene /></div> : null;
              }
              return null;
            })}
          </div>
        </section>

        {/* ── Key points ───────────────────────────────────────────────────── */}
        {keyPoints?.length > 0 && (
          <section>
            <SectionRule label="Key Points" />
            <ul className="mt-4 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              {keyPoints.map((pt, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-200 leading-relaxed">
                  <span className="text-violet-400 shrink-0 mt-0.5">▸</span>
                  <span><InlineMd text={pt} /></span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── In Production — Apply It (migrated modules: the old production
             scenario, demoted to an application beat after the teaching) ───── */}
        {groundUp && scenario && (
          <section>
            <SectionRule label="In Production — Apply It" />
            <div className="mt-4 rounded-xl p-5 border border-zinc-800 bg-zinc-900/50 space-y-3">
              {String(scenario).split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-zinc-200 leading-relaxed font-medium"><InlineMd text={para} /></p>
              ))}
            </div>
          </section>
        )}

        {/* ── Hands-On (only if a real interactive component exists) ────────── */}
        {hasInteractive && (
          <section>
            <SectionRule label="Hands-On" />
            <div className="mt-4 gsl-viz-mobile">
              <Component onNavigate={onNavigate} spec={spec} />
            </div>
          </section>
        )}

        {/* ── Quick Check ──────────────────────────────────────────────────── */}
        {mcqList.length > 0 && (
          <section>
            <SectionRule label={`Quick Check${mcqList.length > 1 ? ` · ${mcqList.length} questions` : ""}`} />
            <div className="mt-4 space-y-8">
              {mcqList.map((q, qi) => (
                <QuestionBlock
                  key={qi}
                  qi={qi}
                  total={mcqList.length}
                  q={q}
                  selected={answers[qi]}
                  isSubmitted={submitted[qi]}
                  onSelect={i => selectAnswer(qi, i)}
                  onSubmit={() => submitAnswer(qi)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Takeaway ─────────────────────────────────────────────────────── */}
        <section>
          <SectionRule label="Takeaway" />
          <div className="mt-4 rounded-xl p-5 border border-emerald-900/30 bg-emerald-950/10">
            <p className="text-sm text-zinc-200 leading-relaxed font-medium"><InlineMd text={takeaway} /></p>
          </div>
          <div className="mt-5">
            {alreadyDone ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-emerald-400 font-semibold">✓ Completed</p>
                <button
                  onClick={handleUndo}
                  className="text-xs font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Undo
                </button>
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!allSubmitted}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all ${
                  allSubmitted
                    ? "bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {allSubmitted ? "Mark Complete ✓" : "Answer the check question to complete"}
              </button>
            )}
          </div>
        </section>

      </div>
      )}
    </div>
  );
}

// ── normalizeCode ───────────────────────────────────────────────────────────────
// Accepts the optional runnerData.code field in any of these shapes and returns a
// uniform array of { label, content, lang } blocks for the Code tab:
//   "raw code string"
//   { label, content, lang }
//   [ "str" | { label, content, lang }, ... ]
function normalizeCode(code) {
  if (!code) return [];
  const one = (c) => {
    if (typeof c === "string") return { label: null, content: c, lang: null };
    if (c && typeof c === "object" && (c.content || c.code))
      return { label: c.label || null, content: c.content || c.code, lang: c.lang || null };
    return null;
  };
  if (Array.isArray(code)) return code.map(one).filter(Boolean);
  const single = one(code);
  return single ? [single] : [];
}

// ── InlineMd ────────────────────────────────────────────────────────────────────
// Lightweight, safe inline-markdown renderer for explanation/keyPoints/recap
// strings. No dangerouslySetInnerHTML — everything is parsed to React nodes and
// all non-markup text renders verbatim. Supports:
//   **bold**            → semibold near-white
//   *italic* / _em_     → italic muted
//   `code`              → mono chip
//   ==highlight==       → subtle violet highlight for the one-line insight
//   \n\n                → paragraph break, single \n → line break
// Plain strings with none of these render exactly as before.

// Shared block renderer for the Academic and 20:80 views (2026-07-23 readability
// pass): item shapes — string (paragraph) | {h} sub-heading | {eq} display
// equation block | {list:[...]} bullet group | {type:"illustration"} |
// {type:"scene"}. Plain strings stay supported so old-style arrays still render.
function AnnexBlocks({ items, moduleId, accent = "amber" }) {
  const headColor = accent === "emerald" ? "text-emerald-400/90" : accent === "sky" ? "text-sky-400/90" : "text-amber-400/90";
  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        if (typeof item === "string") {
          return <p key={i} className="text-sm text-zinc-200 leading-relaxed"><InlineMd text={item} /></p>;
        }
        if (item?.h) {
          return (
            <p key={i} className={`pt-4 text-[11px] font-mono font-bold uppercase tracking-widest ${headColor} border-t border-zinc-800/60 first:border-t-0 first:pt-0`}>
              {item.h}
            </p>
          );
        }
        if (item?.eq) {
          return (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 overflow-x-auto">
              <pre className="text-[13px] font-mono text-zinc-100 leading-relaxed whitespace-pre">{item.eq}</pre>
            </div>
          );
        }
        if (item?.table) {
          return (
            <div key={i} className="rounded-lg border border-zinc-800 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60">
                    {item.table.head.map((hcell, j) => (
                      <th key={j} className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest ${headColor}`}>{hcell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.table.rows.map((row, r) => (
                    <tr key={r} className={r < item.table.rows.length - 1 ? "border-b border-zinc-800/60" : ""}>
                      {row.map((cell, c) => (
                        <td key={c} className={`px-3 py-2.5 text-[13px] leading-relaxed align-top ${c === 0 ? "text-zinc-400 font-medium whitespace-nowrap" : "text-zinc-200"}`}>
                          <InlineMd text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (item?.list) {
          return (
            <ul key={i} className="space-y-2.5">
              {item.list.map((li, j) => (
                <li key={j} className="flex gap-3 text-sm text-zinc-200 leading-relaxed">
                  <span className={`${headColor} shrink-0 mt-0.5`}>{"\u25b8"}</span>
                  <span><InlineMd text={li} /></span>
                </li>
              ))}
            </ul>
          );
        }
        if (item?.type === "illustration") {
          return (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 mt-2">
              {item.label && (
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">{item.label}</p>
              )}
              <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">{item.content}</pre>
            </div>
          );
        }
        if (item?.type === "scene") {
          const Scene = FOUNDATION_SCENES[`${moduleId}/${item.sceneId}`];
          return Scene ? <div key={i} className="my-2"><Scene /></div> : null;
        }
        return null;
      })}
    </div>
  );
}

function InlineMd({ text }) {
  if (typeof text !== "string") return text ?? null;

  // Split on blank lines into paragraphs.
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

// Ordered token matchers. Each captures group 1 = inner content.
const INLINE_RULES = [
  { re: /\*\*([^*]+)\*\*/,       kind: "bold" },
  { re: /==([^=]+)==/,           kind: "highlight" },
  { re: /`([^`]+)`/,             kind: "code" },
  { re: /\*([^*\n]+)\*/,         kind: "em" },
  { re: /_([^_\n]+)_/,           kind: "em" },
];

// ── Glossary hover/tap terms (2026-07-08) ──────────────────────────────────────
// _glossaryCtx is handed off synchronously by FoundationsRunner right before it
// renders (see the component body above) — safe because this app only ever
// renders one FoundationsRunner tree at a time. tokenizeInline reads it below
// to decide (a) whether a candidate glossary match should win the "earliest
// match" competition against bold/italic/code/highlight, and (b) whether that
// term has already been wrapped once on this module's page.
let _glossaryCtx = { moduleId: null, onNavigate: null, shown: null };

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest key first so multi-word terms (e.g. "scaled dot-product attention")
// win over a shorter substring (e.g. "attention") sitting inside them.
const GLOSSARY_ENTRIES = Object.entries(GLOSSARY)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([key, entry]) => ({ key, entry, re: new RegExp(`\\b(${escapeRegExp(key)})\\b`, "i") }));

function tokenizeInline(str) {
  const out = [];
  let rest = str;
  let guard = 0;
  while (rest.length && guard++ < 5000) {
    // Find the earliest matching rule (bold/highlight/code/em).
    let best = null;
    for (const rule of INLINE_RULES) {
      const m = rule.re.exec(rest);
      if (m && (best === null || m.index < best.m.index)) {
        best = { m, kind: rule.kind };
      }
    }

    // Find the earliest not-yet-shown glossary term, skipping a term whose
    // full lesson IS the module currently rendering (no self-referential popup).
    let glossaryBest = null;
    const shown = _glossaryCtx.shown;
    if (shown) {
      for (const g of GLOSSARY_ENTRIES) {
        if (shown.has(g.key)) continue;
        if (g.entry.sourceModuleId === _glossaryCtx.moduleId) continue;
        const gm = g.re.exec(rest);
        if (gm && (glossaryBest === null || gm.index < glossaryBest.m.index)) {
          glossaryBest = { m: gm, g };
        }
      }
    }

    // Glossary only wins the competition if it's strictly earlier than any
    // markdown token — a markdown span (bold/code/etc.) always takes priority
    // over a glossary match starting at the same position or later.
    const useGlossary = glossaryBest && (!best || glossaryBest.m.index < best.m.index);

    if (!best && !useGlossary) {
      out.push(rest);
      break;
    }

    if (useGlossary) {
      const { m, g } = glossaryBest;
      if (m.index > 0) out.push(rest.slice(0, m.index));
      const key = out.length;
      shown.add(g.key);
      out.push(
        <GlossaryTerm key={key} term={g.entry} currentModuleId={_glossaryCtx.moduleId} onNavigate={_glossaryCtx.onNavigate}>
          {m[1]}
        </GlossaryTerm>
      );
      rest = rest.slice(m.index + m[0].length);
      continue;
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

// ── QuestionBlock ──────────────────────────────────────────────────────────────

function QuestionBlock({ qi, total, q, selected, isSubmitted, onSelect, onSubmit }) {
  // Multi-select: q.correct is an array of indices ("Select all that apply").
  // Single-select (default, unchanged behavior): q.correct is a number.
  const isMulti = Array.isArray(q.correct);
  const selArr = Array.isArray(selected) ? selected : [];
  const correctArr = isMulti ? q.correct : [q.correct];
  const isCorrect = isMulti
    ? selArr.length === correctArr.length && correctArr.every(c => selArr.includes(c))
    : selected === q.correct;
  const canSubmit = isMulti ? selArr.length > 0 : selected !== null;

  return (
    <div className="space-y-3">
      {total > 1 && (
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          Question {qi + 1} of {total}
        </p>
      )}
      <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{q.question}</p>
      {isMulti && (
        <p className="text-[10px] font-mono text-violet-400/80 uppercase tracking-widest">
          Select all that apply
        </p>
      )}
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const sel   = isMulti ? selArr.includes(i) : selected === i;
          const right = correctArr.includes(i);
          let cls = "text-zinc-400 border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:text-zinc-300";
          if (isSubmitted) {
            // Motion (Wave 1): correct settles with an overshoot pop, wrong keeps
            // its shake, the rest lock in with a stagger (mo-* in index.css).
            if (right) cls = "text-emerald-300 border-emerald-800/50 bg-emerald-950/20 mo-correct";
            else if (sel) cls = "text-red-300 border-red-800/50 bg-red-950/20 animate-wrongShake";
            else cls = "text-zinc-600 border-zinc-800 bg-zinc-900/30 opacity-50 mo-lock";
          } else if (sel) {
            cls = "text-violet-300 border-violet-600 bg-violet-950/30";
          }
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={isSubmitted}
              className={`w-full text-left text-sm px-4 py-3 rounded-lg border transition-all ${cls}`}
              style={isSubmitted && cls.includes('mo-lock') ? { animationDelay: `${i * 45}ms` } : undefined}
            >
              <span className="font-mono text-[11px] mr-2 opacity-60">
                {isMulti ? (sel ? "☑" : "☐") : `${String.fromCharCode(65 + i)}.`}
              </span>
              {opt}
              {isSubmitted && right && <span className="ml-2 text-emerald-400 font-bold">✓</span>}
              {isSubmitted && sel && !right && <span className="ml-2 text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {isSubmitted ? (
        <div className={`mo-rise rounded-lg px-4 py-3 text-sm leading-relaxed border ${
          isCorrect
            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
            : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
        }`}>
          <span className="font-bold mr-1">{isCorrect ? "Correct." : "Not quite."}</span>
          {q.explanation}
        </div>
      ) : (
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="px-5 py-2.5 rounded-lg text-sm font-bold border border-violet-800/50 text-violet-400 hover:border-violet-600 hover:text-violet-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Check answer
        </button>
      )}
    </div>
  );
}

// ── Shared primitives ──────────────────────────────────────────────────────────

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
