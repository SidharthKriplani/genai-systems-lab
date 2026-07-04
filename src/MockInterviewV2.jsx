// src/MockInterviewV2.jsx
// Multi-turn mock interview (V2). Unlike the single-shot mock (answer → self-score → next),
// this mimics a real interviewer: each primary question spawns a mini-thread of 1–2
// follow-up probes drawn from a generic bank keyed to the question's tier (L0/L1/L2)
// and lightly specialised by topic. The candidate self-scores each question on a
// three-dimension rubric (correctness · depth · communication). The run ends on a
// scorecard: per-dimension averages, an overall band, the two weakest dimensions,
// and a short "what to work on".
//
// Self-contained. No required props. localStorage optional (gsl-mock-v2-history).

import { useState, useMemo } from "react";
import { PREP_QUESTIONS, questionTier, TIER_META } from "./data/preplabQuestions";

// ─────────────────────────────────────────────────────────────────────────────
// Topic labels (kept local so the component has no extra data dependency).
// ─────────────────────────────────────────────────────────────────────────────
const TOPIC_LABELS = {
  rag: "Retrieval (RAG)",
  agents: "Agents & tool use",
  finetuning: "Fine-tuning & PEFT",
  evaluation: "Evaluation",
  evals: "Evaluation",
  llmops: "LLMOps & serving",
  safety: "Safety & alignment",
  alignment: "Alignment",
  product: "Product sense",
  behavioral: "Behavioral",
  multimodal: "Multimodal",
  reasoning: "Reasoning",
  serving: "Serving & inference",
  inference: "Inference",
  attention: "Attention & transformers",
  transformers: "Transformers",
  quantization: "Quantization",
  caching: "KV cache & caching",
  context: "Long context",
  streaming: "Streaming & decoding",
  merging: "Model merging",
  constrained: "Constrained decoding",
  sysdesign: "System design",
  design: "System design",
  llm: "LLM fundamentals",
  recommendations: "Recommenders",
  leadership: "Leadership / EM",
  "agent-eval": "Agent evaluation",
  "rag-ingestion": "RAG ingestion",
  "model-routing": "Model routing",
  "llm-security": "LLM security",
};

const topicLabel = (t) => TOPIC_LABELS[t] || (t ? t[0].toUpperCase() + t.slice(1) : "General");

// ─────────────────────────────────────────────────────────────────────────────
// Company flavors. Inline (the companyTracks module is not present in this repo).
// A flavor only *biases* the topic mix and relabels the room — the questions
// themselves are unchanged.
// ─────────────────────────────────────────────────────────────────────────────
const COMPANIES = [
  { id: "any", name: "No flavor", weights: null, note: "Balanced mix across your track." },
  { id: "openai", name: "Frontier lab", weights: { evaluation: 3, safety: 3, alignment: 3, reasoning: 2, agents: 2 }, note: "Leans evaluation, safety and reasoning depth." },
  { id: "infra", name: "Inference / infra", weights: { serving: 3, inference: 3, quantization: 3, caching: 2, llmops: 2, attention: 2 }, note: "Leans serving, quantization and the KV cache." },
  { id: "rag", name: "Applied RAG", weights: { rag: 4, evaluation: 2, llmops: 2, context: 2 }, note: "Leans retrieval systems and their failure modes." },
  { id: "agentic", name: "Agent platform", weights: { agents: 4, reasoning: 2, safety: 2, sysdesign: 2 }, note: "Leans agents, tool use and orchestration." },
  { id: "leadership", name: "EM / lead", weights: { leadership: 4, behavioral: 3, product: 2 }, note: "Leans people, roadmap and judgment calls." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Probe bank. The whole point of V2: after the candidate answers the primary,
// the "interviewer" drills in. Probes are generic-but-pointed, selected by tier:
//   L0 (define)        → definition / boundary probes
//   L1 (deep)          → mechanism / why-does-it-hold probes
//   L2 (cross-concept) → comparison / tradeoff / scale probes
// A couple of topic-specific probes are layered on top when the topic matches,
// so the drill feels authored without needing per-question authored follow-ups.
// {topic} is substituted with the human topic label.
// ─────────────────────────────────────────────────────────────────────────────
const TIER_PROBES = {
  L0: [
    "Define that precisely — what's the one-sentence version you'd give a new teammate?",
    "Where's the boundary of that concept? Name a case that looks similar but is not the same thing.",
    "What's the simplest example that makes it click?",
    "Which word in your answer is doing the most work, and why?",
  ],
  L1: [
    "Why does that hold? Walk me through the mechanism, not the label.",
    "What's the failure mode — when does this break, and how would you see it in production?",
    "How would you measure that? What signal tells you it's actually working?",
    "You've named the what. Give me the because — what's the underlying cause?",
    "If a junior pushed back on that, what evidence would you show them?",
  ],
  L2: [
    "What's the cheaper alternative, and what do you give up by choosing it?",
    "What breaks at 10x traffic or 10x data? Where's the first thing to bend?",
    "Compare that to the obvious competing approach — when would you switch?",
    "Where's the tradeoff you're implicitly making, and who pays for it?",
    "If your budget were cut in half, what's the first thing you'd drop and why is it safe to drop?",
  ],
};

// Topic-specific pointed probes (optional flavour, appended to the tier pool).
const TOPIC_PROBES = {
  rag: [
    "Is that a recall problem or a precision problem? How would you tell in twenty minutes?",
    "Where does the reranker sit in your story, and what happens without it?",
  ],
  agents: [
    "What stops that agent from looping forever or paying for a wrong tool call?",
    "How do you keep the tool schema honest as the toolset grows?",
  ],
  evaluation: [
    "What does your eval set miss, and how would you find that blind spot?",
    "LLM-as-judge or human? Defend the choice for this specific metric.",
  ],
  evals: [
    "What does your eval set miss, and how would you find that blind spot?",
    "LLM-as-judge or human? Defend the choice for this specific metric.",
  ],
  serving: [
    "Where does latency actually go — prefill or decode? How does that change the fix?",
    "What's your batching strategy under a bursty load, and its downside?",
  ],
  inference: [
    "Where does latency actually go — prefill or decode? How does that change the fix?",
    "What's the memory bottleneck here, and does quantization solve it or move it?",
  ],
  finetuning: [
    "LoRA or full fine-tune here? What's the deciding factor, not the default?",
    "How do you know the fine-tune didn't just memorise the train set?",
  ],
  safety: [
    "What's the adversarial version of your happy path? Who's trying to break it?",
    "Where's the false-positive cost, and who feels it?",
  ],
  leadership: [
    "Whose problem is that, really — and what would you say to them directly?",
    "What would you do differently if you had only one week to show it working?",
  ],
};

// Deterministic small hash so probe selection is stable per question (no reshuffle
// on re-render) but varied across questions.
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Build 1–2 probes for a question, keyed to its tier, salted with topic probes.
function buildProbes(q) {
  const tier = questionTier(q);
  const tierPool = TIER_PROBES[tier] || TIER_PROBES.L1;
  const topicPool = TOPIC_PROBES[q.topic] || [];
  const label = topicLabel(q.topic).toLowerCase();
  const seed = hashStr(String(q.id || q.question || ""));

  // L0 gets a single probe; L1/L2 get two — deeper questions warrant a deeper drill.
  const count = tier === "L0" ? 1 : 2;

  // First probe: prefer a topic-specific one when available (feels authored).
  const first = topicPool.length
    ? topicPool[seed % topicPool.length]
    : tierPool[seed % tierPool.length];

  const probes = [first];
  if (count === 2) {
    // Second probe: a tier probe distinct from the first.
    let idx = (seed + 1) % tierPool.length;
    if (tierPool[idx] === first) idx = (idx + 1) % tierPool.length;
    probes.push(tierPool[idx]);
  }
  return probes.map((p) => p.replace(/\{topic\}/g, label));
}

// ─────────────────────────────────────────────────────────────────────────────
// Rubric.
// ─────────────────────────────────────────────────────────────────────────────
const DIMENSIONS = [
  { key: "correctness", label: "Correctness", hint: "Did you land the right answer and reasoning?" },
  { key: "depth", label: "Depth", hint: "Did you survive the probes — mechanism, tradeoffs, scale?" },
  { key: "communication", label: "Communication", hint: "Was it structured, concise, easy to follow?" },
];
const SCORE_OPTIONS = [
  { v: 1, label: "1 · shaky", color: "#f87171" },
  { v: 2, label: "2 · solid", color: "#fbbf24" },
  { v: 3, label: "3 · strong", color: "#34d399" },
];

function band(avg) {
  if (avg >= 2.6) return { name: "Strong hire", color: "#34d399", chip: "bg-emerald-950/50 text-emerald-300 border border-emerald-800/40" };
  if (avg >= 2.1) return { name: "Hire", color: "#a3e635", chip: "bg-lime-950/50 text-lime-300 border border-lime-800/40" };
  if (avg >= 1.6) return { name: "Lean no", color: "#fbbf24", chip: "bg-amber-950/50 text-amber-300 border border-amber-800/40" };
  return { name: "No hire — keep drilling", color: "#f87171", chip: "bg-red-950/50 text-red-300 border border-red-800/40" };
}

const DIM_ADVICE = {
  correctness: "Correctness is your weakest axis. Slow down on the primary answer before the probes start — restate the question, name the mechanism, then commit. Re-drill the topics you scored 1 on.",
  depth: "Depth is your weakest axis. You reach the right answer but fold under the follow-up. Practice the 'because' layer: for every claim, pre-load the mechanism, the failure mode, and the cheaper alternative.",
  communication: "Communication is your weakest axis. Lead with the answer (BLUF), then support it. Cut throat-clearing. Structure out loud: 'Two reasons — first… second…'.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Small style helpers.
// ─────────────────────────────────────────────────────────────────────────────
const card = "rounded-xl border border-zinc-800 bg-zinc-900/60";
const btn = "rounded-lg px-4 py-2 text-sm font-medium transition-colors";

function TierChip({ tier }) {
  const m = TIER_META[tier] || TIER_META.L1;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${m.chip}`}>
      {m.label} · {m.name}
    </span>
  );
}

function Progress({ i, n }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs tabular-nums text-zinc-400">
        Question {Math.min(i + 1, n)} of {n}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-300"
          style={{ width: `${(Math.min(i, n) / n) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Interviewer bubble (left, violet) vs your-turn placeholder (right, zinc).
function Bubble({ who, children }) {
  const mine = who === "you";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
          (mine
            ? "rounded-br-sm border border-zinc-700 bg-zinc-800/70 text-zinc-300"
            : "rounded-bl-sm border border-violet-800/40 bg-violet-950/40 text-violet-100")
        }
      >
        {!mine && <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-400">Interviewer</div>}
        {mine && <div className="mb-0.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">You</div>}
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question builder: pick N questions given track + company flavor.
// ─────────────────────────────────────────────────────────────────────────────
function pickQuestions({ track, companyId, n }) {
  let pool = PREP_QUESTIONS.filter((q) => q && q.question);
  if (track !== "all") pool = pool.filter((q) => q.topic === track);
  if (!pool.length) pool = PREP_QUESTIONS.filter((q) => q && q.question);

  // Company weighting: score each question, shuffle within a stable jitter.
  const company = COMPANIES.find((c) => c.id === companyId);
  const weights = company && company.weights;
  const scored = pool.map((q, idx) => {
    const w = weights ? (weights[q.topic] || 0) : 0;
    // jitter keeps it fresh each session while honouring weights
    const jitter = Math.random();
    return { q, rank: w + jitter, idx };
  });
  scored.sort((a, b) => b.rank - a.rank);

  const picked = scored.slice(0, Math.min(n, scored.length)).map((s) => s.q);
  // Order the picked set easy→hard (L0→L1→L2) so the interview escalates.
  const tierRank = { L0: 0, L1: 1, L2: 2 };
  picked.sort((a, b) => tierRank[questionTier(a)] - tierRank[questionTier(b)]);
  return picked;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component.
// ─────────────────────────────────────────────────────────────────────────────
export default function MockInterviewV2() {
  const [phase, setPhase] = useState("setup"); // setup | thread | summary
  const [track, setTrack] = useState("all");
  const [companyId, setCompanyId] = useState("any");
  const [count, setCount] = useState(5);

  const [questions, setQuestions] = useState([]);
  const [qi, setQi] = useState(0); // current question index
  const [revealed, setRevealed] = useState(false); // primary answer revealed?
  const [shownProbes, setShownProbes] = useState(0); // how many probes surfaced
  const [scores, setScores] = useState([]); // [{correctness,depth,communication}]
  const [draftScore, setDraftScore] = useState({ correctness: 0, depth: 0, communication: 0 });

  // Tracks: only topics that actually exist in the bank, with counts.
  const tracks = useMemo(() => {
    const counts = {};
    for (const q of PREP_QUESTIONS) {
      if (!q || !q.topic || !q.question) continue;
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    }
    const list = Object.entries(counts)
      .filter(([, c]) => c >= 3) // hide near-empty topics
      .map(([t, c]) => ({ id: t, label: topicLabel(t), count: c }))
      .sort((a, b) => b.count - a.count);
    return [{ id: "all", label: "All topics", count: PREP_QUESTIONS.length }, ...list];
  }, []);

  const current = questions[qi];
  const probes = useMemo(() => (current ? buildProbes(current) : []), [current]);

  function start() {
    const qs = pickQuestions({ track, companyId, n: count });
    setQuestions(qs);
    setQi(0);
    setRevealed(false);
    setShownProbes(0);
    setScores([]);
    setDraftScore({ correctness: 0, depth: 0, communication: 0 });
    setPhase("thread");
  }

  function nextQuestion() {
    const nextScores = [...scores, draftScore];
    setScores(nextScores);
    if (qi + 1 >= questions.length) {
      persist(nextScores);
      setPhase("summary");
      return;
    }
    setQi(qi + 1);
    setRevealed(false);
    setShownProbes(0);
    setDraftScore({ correctness: 0, depth: 0, communication: 0 });
  }

  function persist(finalScores) {
    try {
      const avg = dimAverages(finalScores);
      const entry = {
        at: Date.now(),
        track,
        companyId,
        n: finalScores.length,
        averages: avg,
        overall: overallAvg(avg),
      };
      const raw = localStorage.getItem("gsl-mock-v2-history");
      const hist = raw ? JSON.parse(raw) : [];
      hist.unshift(entry);
      localStorage.setItem("gsl-mock-v2-history", JSON.stringify(hist.slice(0, 25)));
    } catch (_) {
      /* localStorage optional — ignore */
    }
  }

  function restart() {
    setPhase("setup");
    setQuestions([]);
  }

  const scoreComplete = DIMENSIONS.every((d) => draftScore[d.key] > 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-8 text-zinc-200"
      style={{ background: "var(--surface, transparent)" }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-zinc-100">Mock interview</h1>
          <span className="rounded-md border border-violet-800/40 bg-violet-950/40 px-2 py-0.5 text-[11px] font-semibold text-violet-300">
            multi-turn
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          A real interviewer doesn't stop at the first answer. Each question opens a thread — you answer, then get
          drilled with one or two follow-up probes before you self-score.
        </p>
      </div>

      {phase === "setup" && (
        <Setup
          tracks={tracks}
          track={track}
          setTrack={setTrack}
          companyId={companyId}
          setCompanyId={setCompanyId}
          count={count}
          setCount={setCount}
          onStart={start}
        />
      )}

      {phase === "thread" && current && (
        <div>
          <Progress i={qi} n={questions.length} />

          <div className={`mt-4 ${card} p-5`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <TierChip tier={questionTier(current)} />
              <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                {topicLabel(current.topic)}
              </span>
            </div>

            {/* Thread */}
            <div className="space-y-3">
              <Bubble who="them">{current.question}</Bubble>

              {/* Primary answer reveal */}
              {!revealed ? (
                <div className="pt-1">
                  <p className="mb-2 text-xs text-zinc-500">
                    Answer it out loud (or in your head), then reveal the model answer.
                  </p>
                  <button
                    className={`${btn} bg-violet-600 text-white hover:bg-violet-500`}
                    onClick={() => setRevealed(true)}
                  >
                    Reveal answer
                  </button>
                </div>
              ) : (
                <>
                  {typeof current.correct === "number" && Array.isArray(current.options) && (
                    <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 px-4 py-2.5 text-sm text-emerald-100">
                      <span className="font-semibold text-emerald-300">Correct: </span>
                      {current.options[current.correct]}
                    </div>
                  )}
                  {current.explanation && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-sm leading-relaxed text-zinc-300">
                      {current.explanation}
                    </div>
                  )}
                  {current.trap && (
                    <div className="rounded-lg border border-amber-800/40 bg-amber-950/30 px-4 py-2.5 text-sm leading-relaxed text-amber-200">
                      <span className="font-semibold text-amber-300">Weak-answer trap: </span>
                      {current.trap}
                    </div>
                  )}

                  {/* Probes — surfaced one at a time to feel like a live drill */}
                  {probes.slice(0, shownProbes).map((p, idx) => (
                    <div key={idx} className="space-y-2">
                      <Bubble who="them">{p}</Bubble>
                      {idx === shownProbes - 1 && (
                        <Bubble who="you">
                          <span className="text-zinc-400">Answer this probe, then continue.</span>
                        </Bubble>
                      )}
                    </div>
                  ))}

                  {shownProbes < probes.length ? (
                    <div className="pt-1">
                      <button
                        className={`${btn} border border-violet-700/60 bg-violet-950/40 text-violet-200 hover:bg-violet-900/40`}
                        onClick={() => setShownProbes(shownProbes + 1)}
                      >
                        {shownProbes === 0 ? "Interviewer follows up →" : "Push deeper →"}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1 text-xs text-zinc-500">
                      That's the full drill for this one. Score how you held up.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Self-score (unlocks once every probe has surfaced) */}
          {revealed && shownProbes >= probes.length && (
            <div className={`mt-4 ${card} p-5`}>
              <h3 className="text-sm font-semibold text-zinc-200">Self-score this question</h3>
              <p className="mb-4 mt-0.5 text-xs text-zinc-500">
                Be honest — the scorecard is only useful if the input is.
              </p>
              <div className="space-y-4">
                {DIMENSIONS.map((d) => (
                  <div key={d.key}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-zinc-200">{d.label}</span>
                      <span className="text-[11px] text-zinc-500">{d.hint}</span>
                    </div>
                    <div className="flex gap-2">
                      {SCORE_OPTIONS.map((o) => {
                        const active = draftScore[d.key] === o.v;
                        return (
                          <button
                            key={o.v}
                            onClick={() => setDraftScore({ ...draftScore, [d.key]: o.v })}
                            className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
                            style={{
                              borderColor: active ? o.color : "var(--border, #3f3f46)",
                              background: active ? `${o.color}1a` : "transparent",
                              color: active ? o.color : "#a1a1aa",
                            }}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button className={`${btn} text-zinc-400 hover:text-zinc-200`} onClick={restart}>
                  End early
                </button>
                <button
                  disabled={!scoreComplete}
                  onClick={nextQuestion}
                  className={`${btn} ${
                    scoreComplete
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {qi + 1 >= questions.length ? "Finish · see scorecard" : "Next question →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "summary" && <Scorecard scores={scores} track={track} onRestart={restart} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup phase.
// ─────────────────────────────────────────────────────────────────────────────
function Setup({ tracks, track, setTrack, companyId, setCompanyId, count, setCount, onStart }) {
  const company = COMPANIES.find((c) => c.id === companyId);
  return (
    <div className="space-y-6">
      {/* Track */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Track</h2>
        <div className="flex flex-wrap gap-2">
          {tracks.map((t) => {
            const active = track === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTrack(t.id)}
                className="rounded-lg border px-3 py-1.5 text-sm transition-colors"
                style={{
                  borderColor: active ? "#8b5cf6" : "var(--border, #3f3f46)",
                  background: active ? "rgba(139,92,246,0.12)" : "transparent",
                  color: active ? "#c4b5fd" : "#a1a1aa",
                }}
              >
                {t.label}
                <span className="ml-1.5 text-[11px] text-zinc-500">{t.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Company flavor */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Company flavor <span className="font-normal text-zinc-500">(optional)</span></h2>
        <div className="flex flex-wrap gap-2">
          {COMPANIES.map((c) => {
            const active = companyId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCompanyId(c.id)}
                className="rounded-lg border px-3 py-1.5 text-sm transition-colors"
                style={{
                  borderColor: active ? "#8b5cf6" : "var(--border, #3f3f46)",
                  background: active ? "rgba(139,92,246,0.12)" : "transparent",
                  color: active ? "#c4b5fd" : "#a1a1aa",
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        {company && company.note && (
          <p className="mt-2 text-xs text-zinc-500">{company.note}</p>
        )}
      </section>

      {/* Count */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Questions</h2>
        <div className="flex gap-2">
          {[3, 5, 8, 10].map((n) => {
            const active = count === n;
            return (
              <button
                key={n}
                onClick={() => setCount(n)}
                className="rounded-lg border px-4 py-1.5 text-sm tabular-nums transition-colors"
                style={{
                  borderColor: active ? "#8b5cf6" : "var(--border, #3f3f46)",
                  background: active ? "rgba(139,92,246,0.12)" : "transparent",
                  color: active ? "#c4b5fd" : "#a1a1aa",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </section>

      <button
        onClick={onStart}
        className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
      >
        Start interview · {count} questions
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring math + scorecard.
// ─────────────────────────────────────────────────────────────────────────────
function dimAverages(scores) {
  const out = {};
  for (const d of DIMENSIONS) {
    const vals = scores.map((s) => s[d.key]).filter((v) => v > 0);
    out[d.key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }
  return out;
}
function overallAvg(avgs) {
  const vals = DIMENSIONS.map((d) => avgs[d.key]).filter((v) => v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function Scorecard({ scores, track, onRestart }) {
  const avgs = dimAverages(scores);
  const overall = overallAvg(avgs);
  const b = band(overall);

  // Two weakest dimensions, weakest first.
  const weakest = [...DIMENSIONS]
    .map((d) => ({ ...d, avg: avgs[d.key] }))
    .sort((a, b2) => a.avg - b2.avg)
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Overall band */}
      <div className={`${card} p-6 text-center`}>
        <div className="text-xs uppercase tracking-wide text-zinc-500">Overall</div>
        <div className="mt-1 text-4xl font-bold tabular-nums" style={{ color: b.color }}>
          {overall.toFixed(2)}<span className="text-lg text-zinc-600"> / 3</span>
        </div>
        <div className={`mt-2 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${b.chip}`}>
          {b.name}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {scores.length} question{scores.length === 1 ? "" : "s"} · {topicLabel(track === "all" ? "all" : track) === "All" ? "all topics" : (track === "all" ? "all topics" : topicLabel(track))}
        </p>
      </div>

      {/* Per-dimension bars */}
      <div className={`${card} p-5`}>
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">Per-dimension</h3>
        <div className="space-y-4">
          {DIMENSIONS.map((d) => {
            const v = avgs[d.key];
            const pct = (v / 3) * 100;
            const c = v >= 2.6 ? "#34d399" : v >= 2.1 ? "#a3e635" : v >= 1.6 ? "#fbbf24" : "#f87171";
            return (
              <div key={d.key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm text-zinc-300">{d.label}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: c }}>
                    {v.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What to work on — weakest first */}
      <div className={`${card} p-5`}>
        <h3 className="mb-1 text-sm font-semibold text-zinc-200">What to work on</h3>
        <p className="mb-3 text-xs text-zinc-500">Weakest axes first — these move your band the most.</p>
        <ol className="space-y-3">
          {weakest.map((d, i) => (
            <li key={d.key} className="flex gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold"
                style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd" }}
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-zinc-300">
                {DIM_ADVICE[d.key]}
                <span className="ml-1 text-xs text-zinc-500">(scored {d.avg.toFixed(2)}/3)</span>
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
        >
          New interview
        </button>
      </div>
    </div>
  );
}
