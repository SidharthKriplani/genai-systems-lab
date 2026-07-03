// src/ReadinessDiagnostic.jsx
// "Are you ready?" — an adaptive cross-topic diagnostic for GSL.
// Self-contained. Only external dependency is the shared question bank.
//
// Flow: intro -> adaptive quiz (~12 MCQs across topics) -> result.
// Result gives a readiness band, a worst-first per-topic weak-area map,
// and an auto study plan with working nav buttons (via onNavigate).
//
// Adaptive sampling: the first WARMUP questions are a flat spread across
// topics (one per topic, shuffled). After that, each next question is
// drawn from a weighted pool where topics the learner is getting WRONG
// carry more weight — so the diagnostic probes weak areas harder.

import { useState, useMemo } from "react";
import { PREP_QUESTIONS, questionTier } from "./data/preplabQuestions";

// ── config ────────────────────────────────────────────────────────────────
const TOTAL_Q = 12;      // questions asked in a run
const WARMUP = 5;        // flat cross-topic spread before adaptive bias kicks in
const STORE_KEY = "gsl-are-you-ready";

// Friendly topic labels (local copy — component stays self-contained).
const TOPIC_LABELS = {
  rag: "RAG", agents: "Agents", finetuning: "Fine-tuning",
  evaluation: "Evaluation", llmops: "LLMOps", safety: "Safety",
  product: "Product", behavioral: "Behavioral", multimodal: "Multimodal",
  reasoning: "Reasoning models", serving: "Serving & inference",
  foundations: "Foundations", tokenizer: "Tokenization",
  embeddings: "Embeddings", lora: "LoRA / PEFT", rlhf: "RLHF", dpo: "DPO",
  moe: "Mixture-of-experts", distillation: "Distillation",
  "prompt-engineering": "Prompt engineering",
};
const labelFor = (t) => TOPIC_LABELS[t] || t;

// Which study area each topic routes to. Valid tabs:
// concepts | preplab | fluency | company-tracks
const TOPIC_TAB = {
  foundations: "concepts", tokenizer: "concepts", embeddings: "concepts",
  reasoning: "concepts", moe: "concepts",
  rag: "concepts", agents: "concepts", multimodal: "concepts",
  finetuning: "preplab", lora: "preplab", rlhf: "preplab", dpo: "preplab",
  distillation: "preplab", evaluation: "preplab", "prompt-engineering": "fluency",
  serving: "preplab", llmops: "preplab",
  safety: "preplab", product: "company-tracks", behavioral: "company-tracks",
};
const tabFor = (t) => TOPIC_TAB[t] || "preplab";
const TAB_LABEL = {
  concepts: "Foundations", preplab: "Question bank",
  fluency: "Fluency drills", "company-tracks": "Company tracks",
};

// One-line, topic-shaped study recommendation.
const TOPIC_TIP = {
  rag: "Drill retrieval failure modes — recall vs precision, reranking, context noise.",
  agents: "Revisit tool-use loops, planning, and failure recovery in agent systems.",
  finetuning: "Re-ground the fine-tuning ladder: full FT vs PEFT and when each fits.",
  evaluation: "Rebuild your eval intuition — groundedness, citation accuracy, offline vs online.",
  llmops: "Shore up deployment, monitoring, and rollout basics for LLM systems.",
  safety: "Review guardrails, jailbreak defenses, and alignment tradeoffs.",
  product: "Practice product framing — metrics, tradeoffs, and shipping decisions.",
  behavioral: "Prep structured stories: scope, conflict, and impact.",
  multimodal: "Refresh vision-language fusion and cross-modal retrieval.",
  reasoning: "Study reasoning-model mechanics — CoT, test-time compute, verification.",
  serving: "Revisit inference economics — batching, KV cache, quantization, latency.",
  foundations: "Rebuild core foundations before layering advanced topics on top.",
  tokenizer: "Re-learn tokenization — BPE, vocab size, and its downstream effects.",
  embeddings: "Revisit embedding geometry, similarity, and distribution mismatch.",
  lora: "Drill LoRA / PEFT mechanics — rank, adapters, and merge tradeoffs.",
  rlhf: "Re-ground RLHF — reward modeling, PPO, and its failure modes.",
  dpo: "Study DPO vs RLHF — the preference-optimization tradeoff.",
  moe: "Review mixture-of-experts routing, load balancing, and capacity.",
  distillation: "Revisit distillation — teacher/student setup and what transfers.",
  "prompt-engineering": "Sharpen prompting patterns — structure, few-shot, and constraints.",
};
const tipFor = (t) =>
  TOPIC_TIP[t] || `Revisit ${labelFor(t)} — work the question bank for this area.`;

// ── question pool ───────────────────────────────────────────────────────────
// Only MCQ questions with real options + a correct index. Group by topic.
const MCQ = PREP_QUESTIONS.filter(
  (q) =>
    q &&
    q.type === "mcq" &&
    Array.isArray(q.options) &&
    q.options.length > 1 &&
    Number.isInteger(q.correct) &&
    !q.gated
);
// Fall back to including gated MCQs if the free pool is too thin.
const POOL = MCQ.length >= TOTAL_Q * 2
  ? MCQ
  : PREP_QUESTIONS.filter(
      (q) =>
        q &&
        q.type === "mcq" &&
        Array.isArray(q.options) &&
        q.options.length > 1 &&
        Number.isInteger(q.correct)
    );

function groupByTopic(list) {
  const m = {};
  for (const q of list) {
    (m[q.topic] = m[q.topic] || []).push(q);
  }
  return m;
}

// small deterministic-ish shuffle (Fisher-Yates on a copy)
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── readiness band ──────────────────────────────────────────────────────────
function bandFor(pct, gapCount) {
  if (pct >= 80 && gapCount <= 1)
    return {
      key: "ready", name: "Interview-ready",
      note: "Strong across topics. Polish edge cases and keep the streak.",
      dots: 4, color: "#34d399",
    };
  if (pct >= 65)
    return {
      key: "close", name: gapCount ? `Close — ${gapCount} gap${gapCount > 1 ? "s" : ""}` : "Close",
      note: "Solid base. Close the weak areas below and you're there.",
      dots: 3, color: "#a78bfa",
    };
  if (pct >= 45)
    return {
      key: "building", name: "Building — a few gaps",
      note: "Real progress, but several topics need another pass.",
      dots: 2, color: "#fbbf24",
    };
  return {
    key: "foundations", name: "Foundations first",
    note: "Start with the fundamentals below before interview drills.",
    dots: 1, color: "#f87171",
  };
}

// ── adaptive selection ──────────────────────────────────────────────────────
// Build the next question. `asked` = ids already used. `wrongByTopic` /
// `askedByTopic` drive the weighting once past warmup.
function pickNext({ byTopic, asked, index, wrongByTopic, askedByTopic }) {
  const topics = Object.keys(byTopic);
  const available = (t) => byTopic[t].filter((q) => !asked.has(q.id));

  if (index < WARMUP) {
    // Flat spread: prefer topics not yet asked, then any with stock.
    const fresh = shuffle(topics).filter(
      (t) => !askedByTopic[t] && available(t).length
    );
    const src = fresh.length ? fresh : shuffle(topics).filter((t) => available(t).length);
    if (!src.length) return null;
    const t = src[0];
    return shuffle(available(t))[0] || null;
  }

  // Adaptive: weight each topic by wrong-rate. A topic the learner is
  // missing gets a heavier weight so it's sampled more.
  const weighted = [];
  for (const t of topics) {
    if (!available(t).length) continue;
    const seen = askedByTopic[t] || 0;
    const wrong = wrongByTopic[t] || 0;
    // Base weight 1. Each wrong answer in a topic adds 2.5 to its weight.
    // Untouched topics keep a small weight so coverage stays broad.
    const wrongRate = seen ? wrong / seen : 0;
    const weight = 1 + wrong * 2.5 + wrongRate * 2 + (seen === 0 ? 0.5 : 0);
    weighted.push({ t, weight });
  }
  if (!weighted.length) return null;
  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  let chosen = weighted[0].t;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) { chosen = w.t; break; }
  }
  return shuffle(available(chosen))[0] || null;
}

// ── UI atoms ────────────────────────────────────────────────────────────────
function ReadinessMeter({ dots, color }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full transition-colors"
          style={{
            background: i < dots ? color : "var(--border, #3f3f46)",
            boxShadow: i < dots ? `0 0 8px ${color}66` : "none",
          }}
        />
      ))}
    </div>
  );
}

function TopicBar({ topic, pct }) {
  const color = pct >= 70 ? "#34d399" : pct >= 45 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 shrink-0 truncate text-xs text-zinc-300">
        {labelFor(topic)}
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="w-10 shrink-0 text-right text-xs font-mono text-zinc-400">
        {pct}%
      </div>
    </div>
  );
}

// ── main component ──────────────────────────────────────────────────────────
export default function ReadinessDiagnostic({ onNavigate }) {
  const byTopic = useMemo(() => groupByTopic(POOL), []);
  const topicCount = Object.keys(byTopic).length;

  const [phase, setPhase] = useState("intro"); // intro | quiz | result
  const [current, setCurrent] = useState(null); // active question
  const [asked, setAsked] = useState(() => new Set());
  const [index, setIndex] = useState(0);        // 0-based question number
  const [picked, setPicked] = useState(null);   // selected option index
  const [revealed, setRevealed] = useState(false);
  const [askedByTopic, setAskedByTopic] = useState({});
  const [wrongByTopic, setWrongByTopic] = useState({});
  const [correctByTopic, setCorrectByTopic] = useState({});
  const [result, setResult] = useState(null);

  const nav = (tab) => {
    if (typeof onNavigate === "function") onNavigate(tab);
  };

  function advance(nextAsked, nextIndex, nextWrong, nextAskedTopic) {
    if (nextIndex >= TOTAL_Q) {
      finish(nextWrong, nextAskedTopic);
      return;
    }
    const q = pickNext({
      byTopic,
      asked: nextAsked,
      index: nextIndex,
      wrongByTopic: nextWrong,
      askedByTopic: nextAskedTopic,
    });
    if (!q) {
      finish(nextWrong, nextAskedTopic);
      return;
    }
    nextAsked.add(q.id);
    setAsked(new Set(nextAsked));
    setCurrent(q);
    setIndex(nextIndex);
    setPicked(null);
    setRevealed(false);
  }

  function start() {
    const freshAsked = new Set();
    setAskedByTopic({});
    setWrongByTopic({});
    setCorrectByTopic({});
    setResult(null);
    setPhase("quiz");
    advance(freshAsked, 0, {}, {});
  }

  function submit(optIdx) {
    if (revealed) return;
    setPicked(optIdx);
    setRevealed(true);
    const t = current.topic;
    const isCorrect = optIdx === current.correct;
    setAskedByTopic((m) => ({ ...m, [t]: (m[t] || 0) + 1 }));
    if (isCorrect) {
      setCorrectByTopic((m) => ({ ...m, [t]: (m[t] || 0) + 1 }));
    } else {
      setWrongByTopic((m) => ({ ...m, [t]: (m[t] || 0) + 1 }));
    }
  }

  function next() {
    // Build the updated tallies synchronously off current state.
    const t = current.topic;
    const isCorrect = picked === current.correct;
    const nextAskedTopic = { ...askedByTopic, [t]: (askedByTopic[t] || 0) + 1 };
    const nextWrong = isCorrect
      ? { ...wrongByTopic }
      : { ...wrongByTopic, [t]: (wrongByTopic[t] || 0) + 1 };
    // Note: askedByTopic/wrongByTopic state already updated in submit();
    // we pass fresh copies here so pickNext sees the just-answered question.
    advance(new Set(asked), index + 1, nextWrong, nextAskedTopic);
  }

  function finish(finalWrong, finalAskedTopic) {
    // Assemble per-topic stats. correctByTopic is in state; recompute from it.
    const topics = Object.keys(finalAskedTopic);
    let totalAsked = 0;
    let totalCorrect = 0;
    const rows = topics.map((t) => {
      const seen = finalAskedTopic[t] || 0;
      const wrong = finalWrong[t] || 0;
      const correct = seen - wrong;
      totalAsked += seen;
      totalCorrect += correct;
      return { topic: t, seen, correct, pct: seen ? Math.round((correct / seen) * 100) : 0 };
    });
    rows.sort((a, b) => a.pct - b.pct || b.seen - a.seen); // worst first
    const overall = totalAsked ? Math.round((totalCorrect / totalAsked) * 100) : 0;
    const weak = rows.filter((r) => r.pct < 70);
    const band = bandFor(overall, weak.length);

    const res = {
      overall, rows, weak, band,
      totalAsked, totalCorrect,
      at: Date.now(),
    };
    setResult(res);
    setPhase("result");
    try {
      window.localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ overall, band: band.key, weak: weak.map((w) => w.topic), at: res.at })
      );
    } catch (e) { /* storage optional */ }
  }

  // ── render: intro ─────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <div
          className="rounded-xl border p-6 sm:p-8"
          style={{ borderColor: "var(--border, #27272a)", background: "var(--surface, #18181b)" }}
        >
          <div className="mb-1 text-xs font-mono uppercase tracking-wide text-violet-400">
            Diagnostic
          </div>
          <h2 className="text-2xl font-semibold text-zinc-100">Are you ready?</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            A short adaptive diagnostic — {TOTAL_Q} multiple-choice questions sampled
            across {topicCount} topics from the question bank. It maps your weak
            areas and turns them into a study plan you can act on.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-zinc-300">
            <li className="flex gap-2.5">
              <Dot /> One question per screen, with instant right/wrong feedback.
            </li>
            <li className="flex gap-2.5">
              <Dot /> It adapts — after the first few, it probes the topics you're
              missing more heavily.
            </li>
            <li className="flex gap-2.5">
              <Dot /> You end with a readiness band, a worst-first topic map, and
              one-tap jumps to the right study area.
            </li>
          </ul>
          <button
            onClick={start}
            className="mt-7 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Start diagnostic
          </button>
          <div className="mt-3 text-xs text-zinc-600">
            Takes about 5 minutes. Nothing is submitted anywhere.
          </div>
        </div>
      </div>
    );
  }

  // ── render: quiz ──────────────────────────────────────────────────────────
  if (phase === "quiz" && current) {
    const tier = questionTier(current);
    const qNum = index + 1;
    const progress = Math.round((index / TOTAL_Q) * 100);
    const adaptiveOn = index >= WARMUP;
    return (
      <div className="mx-auto max-w-2xl">
        {/* progress */}
        <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono">
            Question {qNum} of {TOTAL_Q}
          </span>
          <span className="flex items-center gap-2">
            {adaptiveOn && (
              <span className="rounded-full border border-violet-800/50 bg-violet-950/40 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                Adaptive — probing weak areas
              </span>
            )}
          </span>
        </div>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ borderColor: "var(--border, #27272a)", background: "var(--surface, #18181b)" }}
        >
          <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide">
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
              {labelFor(current.topic)}
            </span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-500">{tier}</span>
          </div>
          <div className="text-base leading-relaxed text-zinc-100">
            {current.question}
          </div>

          <div className="mt-5 space-y-2.5">
            {current.options.map((opt, i) => {
              const isCorrect = i === current.correct;
              const isPicked = i === picked;
              let cls =
                "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors";
              let style = { borderColor: "var(--border, #3f3f46)" };
              if (!revealed) {
                cls += " border-zinc-700 text-zinc-200 hover:border-violet-600 hover:bg-zinc-800/50";
              } else if (isCorrect) {
                cls += " border-emerald-600 bg-emerald-950/40 text-emerald-200";
                style = { borderColor: "#059669" };
              } else if (isPicked) {
                cls += " border-red-600 bg-red-950/40 text-red-200";
                style = { borderColor: "#dc2626" };
              } else {
                cls += " border-zinc-800 text-zinc-500";
                style = { borderColor: "#27272a" };
              }
              return (
                <button
                  key={i}
                  disabled={revealed}
                  onClick={() => submit(i)}
                  className={cls}
                  style={style}
                >
                  <span className="mr-2 font-mono text-xs opacity-60">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {revealed && isCorrect && <span className="ml-2">— correct</span>}
                  {revealed && isPicked && !isCorrect && (
                    <span className="ml-2">— your pick</span>
                  )}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="mt-5">
              <div
                className="rounded-lg border px-4 py-3 text-sm leading-relaxed"
                style={{
                  borderColor:
                    picked === current.correct ? "#065f46" : "#7f1d1d",
                  background:
                    picked === current.correct
                      ? "rgba(6,78,59,0.25)"
                      : "rgba(127,29,29,0.2)",
                }}
              >
                <div
                  className="mb-1 text-xs font-semibold"
                  style={{
                    color: picked === current.correct ? "#34d399" : "#f87171",
                  }}
                >
                  {picked === current.correct ? "Correct" : "Not quite"}
                </div>
                <div className="text-zinc-300">{current.explanation}</div>
              </div>
              <button
                onClick={next}
                className="mt-5 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
              >
                {index + 1 >= TOTAL_Q ? "See your result" : "Next question"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── render: result ────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const { overall, rows, weak, band } = result;
    return (
      <div className="mx-auto max-w-2xl">
        {/* band card */}
        <div
          className="rounded-xl border p-6 sm:p-7"
          style={{ borderColor: "var(--border, #27272a)", background: "var(--surface, #18181b)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wide text-zinc-500">
                Your readiness
              </div>
              <h2
                className="mt-1 text-2xl font-semibold"
                style={{ color: band.color }}
              >
                {band.name}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
                {band.note}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-3xl font-semibold text-zinc-100">
                {overall}%
              </div>
              <ReadinessMeter dots={band.dots} color={band.color} />
            </div>
          </div>
        </div>

        {/* weak-area map */}
        <div
          className="mt-4 rounded-xl border p-6"
          style={{ borderColor: "var(--border, #27272a)", background: "var(--surface, #18181b)" }}
        >
          <div className="mb-4 text-sm font-semibold text-zinc-200">
            Weak-area map
            <span className="ml-2 font-normal text-zinc-500">worst first</span>
          </div>
          <div className="space-y-3">
            {rows.map((r) => (
              <TopicBar key={r.topic} topic={r.topic} pct={r.pct} />
            ))}
          </div>
        </div>

        {/* study plan */}
        <div
          className="mt-4 rounded-xl border p-6"
          style={{ borderColor: "var(--border, #27272a)", background: "var(--surface, #18181b)" }}
        >
          <div className="mb-1 text-sm font-semibold text-zinc-200">
            Your study plan
          </div>
          {weak.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-400">
              No weak topics surfaced — you cleared every area sampled. Keep the
              streak with a full mock in the question bank.
            </p>
          ) : (
            <p className="mb-4 text-sm text-zinc-500">
              Start at the top. Each line jumps you straight to the right area.
            </p>
          )}
          <div className="space-y-3">
            {weak.map((r) => {
              const tab = tabFor(r.topic);
              return (
                <div
                  key={r.topic}
                  className="rounded-lg border p-4"
                  style={{ borderColor: "var(--border, #27272a)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-zinc-200">
                      {labelFor(r.topic)}
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                      {r.correct}/{r.seen} · {r.pct}%
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {tipFor(r.topic)}
                  </p>
                  <button
                    onClick={() => nav(tab)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-violet-800/60 bg-violet-950/40 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:border-violet-600 hover:bg-violet-900/40"
                  >
                    Go to {TAB_LABEL[tab] || tab}
                    <Arrow />
                  </button>
                </div>
              );
            })}
          </div>

          {/* broad follow-ups */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800 pt-5">
            <button
              onClick={() => nav("preplab")}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              Open the question bank
            </button>
            <button
              onClick={start}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
            >
              Retake diagnostic
            </button>
          </div>
        </div>
      </div>
    );
  }

  // fallback (no questions available)
  return (
    <div className="mx-auto max-w-2xl">
      <div
        className="rounded-xl border p-6 text-sm text-zinc-400"
        style={{ borderColor: "var(--border, #27272a)", background: "var(--surface, #18181b)" }}
      >
        No diagnostic questions are available right now.
      </div>
    </div>
  );
}

// ── tiny inline icons (no external lib) ─────────────────────────────────────
function Dot() {
  return (
    <span
      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ background: "#a78bfa" }}
    />
  );
}
function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6h7M6.5 3l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
