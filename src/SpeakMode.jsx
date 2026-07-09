import { useState, useEffect, useRef, useCallback } from "react";
import { PREP_QUESTIONS } from "./data/preplabQuestions.js";

// ─── SPEAK MODE ───────────────────────────────────────────────────────────────
// Tiered spoken drill grafted from MSL's SpokenPracticeTab. Runs the 4-tier
// spoken drill (30s headline / 2-min full / interviewer pushback / reason-when-
// unsure) over the GSL PrepLab question bank. Web Speech API captures the spoken
// answer; graceful fallback to a timed think-then-type flow where unsupported.
// Persists drilled-question ids to localStorage key `gsl-speak-history`.

const TOPIC_LABELS = {
  nlp: "NLP Foundations",
  rag: "RAG", agents: "Agents", finetuning: "Fine-Tuning", evaluation: "Evaluation",
  evals: "Evals", llmops: "LLMOps", safety: "Safety", product: "Product",
  behavioral: "Behavioral", multimodal: "Multimodal", reasoning: "Reasoning",
  serving: "Serving", foundations: "Foundations", alignment: "Alignment",
  attention: "Attention", caching: "Caching", constrained: "Constrained Decoding",
  context: "Context", design: "Design", inference: "Inference", leadership: "Leadership",
  llm: "LLM", merging: "Model Merging", production: "Production", quantization: "Quantization",
  recommendations: "Recommendations", streaming: "Streaming", sysdesign: "System Design",
  transformers: "Transformers",
  "agent-eval": "Agent Evaluation", "rag-ingestion": "RAG Ingestion",
  "model-routing": "Model Routing", "llm-security": "LLM Security",
};
const topicLabel = (t) => TOPIC_LABELS[t] || (t ? t[0].toUpperCase() + t.slice(1) : "General");

const DIFF_COLOR = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };

// R15 (Rev-2): dark-theme <select> style for the Speak filters.
const SPEAK_SELECT_STYLE = {
  background: "#27272a",
  border: "1px solid #3f3f46",
  borderRadius: 8,
  color: "#e4e4e7",
  fontSize: 12,
  padding: "6px 10px",
  outline: "none",
  cursor: "pointer",
};

// The 4-tier structured spoken drill. Ported 1:1 from MSL. Tiers 3 and 4 reframe
// the base prompt. Pushback is generated generically since PrepLab questions have
// no per-question pushback field.
const TIERS = [
  {
    key: "headline",
    label: "30-Second Answer",
    targetSec: 30,
    kicker: "Tier 1 of 4",
    instruction: "Give the crisp headline. If you only had 30 seconds, what is the single sharpest version of your answer?",
    check: "Did you land the core point inside 30 seconds, with no rambling preamble?",
  },
  {
    key: "full",
    label: "2-Minute Answer",
    targetSec: 120,
    kicker: "Tier 2 of 4",
    instruction: "Now give the full structured answer. State your framework, walk the key steps, and close with a tradeoff or decision.",
    check: "Was it structured (framework, then steps, then a close) and did you finish near the 2-minute mark?",
  },
  {
    key: "pushback",
    label: "Interviewer Pushback",
    targetSec: 60,
    kicker: "Tier 3 of 4",
    instruction: "The interviewer just challenged you. Hold your ground or concede cleanly, but respond directly to the pushback.",
    check: "Did you address the actual challenge head-on instead of repeating your first answer?",
    usePushback: true,
  },
  {
    key: "reason",
    label: "Reason When Unsure",
    targetSec: 90,
    kicker: "Tier 4 of 4",
    instruction: "Pretend you do not fully know the answer. Say out loud how you would reason toward one — what you would assume, test, and check. Reasoning under uncertainty is a senior signal.",
    check: "Did you narrate a clear reasoning path (assumptions, checks, how you'd verify) rather than bluffing certainty?",
    reasonPrompt: true,
  },
];

// R13 (Rev-2): Phrase Bank (weak→strong phrasing) absorbed into Speak as a reference tab.
//   These high-impact upgrades train the same skill Speak drills — saying it like a senior
//   engineer — so they live alongside the spoken drill instead of as a separate Fluency mode.
const SPEAK_PHRASES = [
  { weak: "The model made stuff up.", strong: "The model hallucinated — it produced a confident, plausible response that wasn't grounded in the retrieved context. That's a groundedness failure, not a knowledge gap.", why: "Names the failure mode and the eval dimension instead of a toy description." },
  { weak: "It's slow.", strong: "P95 latency is ~4.2s end-to-end, dominated by the LLM inference call (~2.8s). We can cut it by routing the classification step to a smaller model and reserving the full model for synthesis.", why: "Quantifies the tail, localizes the bottleneck, and proposes a concrete fix." },
  { weak: "We trained it on our data.", strong: "We fine-tuned the base model on 12k labeled examples for behavioral alignment — teaching our format conventions and domain terminology — not to inject factual knowledge.", why: "Distinguishes behavioral fine-tuning from knowledge injection." },
  { weak: "It uses tools.", strong: "It's a ReAct-style agent that reasons over tool outputs before acting, with instrumented failure modes for tool-call errors and infinite reasoning loops.", why: "Shows architecture awareness and that you've designed for failure." },
  { weak: "We added guardrails.", strong: "Two-layer guardrails: input classifiers catch prompt injection and out-of-scope queries pre-model; output validators check format compliance and groundedness. Input-layer false-positive rate is ~3%, tuned against a labeled adversarial set.", why: "Concrete architecture, a measured metric, and how it's calibrated." },
  { weak: "We picked the best model.", strong: "We ran a model-selection pass on the dimensions that matter — accuracy on our eval set, p95 latency, and cost at projected volume — and landed on tiered routing: a fine-tuned 7B for the common case, frontier for the hard tail.", why: "Frames selection as a measured tradeoff, not a vibe." },
];

function StrongerPhrasingTab() {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState({});
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="flex items-center gap-2">
          <span className="text-sm">✍️</span>
          <span className="text-sm font-semibold text-zinc-100">Stronger phrasing — say it like a senior engineer</span>
        </span>
        <span className="text-xs font-mono text-zinc-500">{open ? "Hide" : `${SPEAK_PHRASES.length} upgrades`}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-zinc-800/60 pt-3">
          <p className="text-xs text-zinc-500 leading-relaxed">
            The phrases you use in a review or interview signal your level. Reveal the strong version, then use it in your next spoken rep above.
          </p>
          {SPEAK_PHRASES.map((p, i) => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 space-y-2">
              <div className="text-xs text-zinc-400"><span className="text-red-400 font-semibold">Weak: </span>"{p.weak}"</div>
              {revealed[i] ? (
                <div className="space-y-1.5">
                  <div className="text-xs text-zinc-200 leading-relaxed"><span className="text-emerald-400 font-semibold">Strong: </span>"{p.strong}"</div>
                  <div className="text-[11px] text-zinc-500"><span className="text-indigo-400 font-semibold">Why: </span>{p.why}</div>
                </div>
              ) : (
                <button onClick={() => setRevealed(r => ({ ...r, [i]: true }))}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md transition-all"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                  Reveal strong version →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Generic interviewer pushback derived from the question's own trap (what weaker
// candidates say) when present; otherwise a topic-agnostic senior challenge.
function pushbackFor(q) {
  if (q.trap) {
    return `The interviewer pushes back: "A lot of candidates give the shallow version here — ${q.trap.split(". ")[0].replace(/^Saying /, "they say ").toLowerCase()}. Convince me your answer isn't that."`;
  }
  return "The interviewer pushes back: \"That's the textbook answer. Where does it break in production, and what would you actually do about it?\"";
}

function TopicBadge({ topic }) {
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wide"
      style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
      {topicLabel(topic)}
    </span>
  );
}

function DiffBadge({ difficulty }) {
  const c = DIFF_COLOR[difficulty] || "#71717a";
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wide"
      style={{ background: c + "1f", color: c, border: `1px solid ${c}55` }}>
      {difficulty}
    </span>
  );
}

export default function SpeakMode() {
  const [screen, setScreen] = useState("select"); // select | drill
  const [selectedQ, setSelectedQ] = useState(null);
  const [tierIndex, setTierIndex] = useState(0);
  const [filterTopic, setFilterTopic] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");

  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [selfCheck, setSelfCheck] = useState(null); // true | false | null
  const [showModel, setShowModel] = useState(false);
  const [practiced, setPracticed] = useState({}); // { [qId]: true }

  const recognitionRef = useRef(null);
  const isStoppingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition || isIOS) setSpeechSupported(false);
    } catch {
      setSpeechSupported(false);
    }
    try {
      const saved = localStorage.getItem("gsl-speak-history");
      if (saved) setPracticed(JSON.parse(saved));
    } catch {}
  }, []);

  // Live timer that runs only while recording.
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    isStoppingRef.current = true;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch {}
    setIsRecording(false);
    setInterimTranscript("");
    setTimeout(() => { isStoppingRef.current = false; }, 300);
  }, []);

  // Web Speech engine — continuous + interimResults, append finals to the
  // transcript, guard onend double-fire. Ported from MSL.
  const startRecording = useCallback(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        // Start at event.resultIndex so only NEW results are processed. With
        // continuous=true, event.results accumulates the whole session; looping
        // from 0 would re-append every finalized result on every event (runaway
        // duplication). resultIndex points at the first result changed this event.
        let interim = "";
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        if (finalText) setFinalTranscript(prev => prev + finalText);
        setInterimTranscript(interim);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        if (isStoppingRef.current) return;
        setIsRecording(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  }, []);

  function resetTierState() {
    stopRecording();
    setFinalTranscript("");
    setInterimTranscript("");
    setFallbackText("");
    setElapsed(0);
    setSelfCheck(null);
    setShowModel(false);
  }

  function handleSelectQuestion(q) {
    setSelectedQ(q);
    setTierIndex(0);
    resetTierState();
    setScreen("drill");
  }

  function handleNextTier() {
    if (tierIndex < TIERS.length - 1) {
      setTierIndex(i => i + 1);
      resetTierState();
    } else {
      if (selectedQ) {
        const updated = { ...practiced, [selectedQ.id]: true };
        setPracticed(updated);
        try { localStorage.setItem("gsl-speak-history", JSON.stringify(updated)); } catch {}
      }
      resetTierState();
      setScreen("select");
    }
  }

  function handleBackToList() {
    resetTierState();
    setScreen("select");
  }

  const topics = ["All", ...Array.from(new Set(PREP_QUESTIONS.map(q => q.topic)))];
  const diffs = ["All", "easy", "medium", "hard"];
  const filtered = PREP_QUESTIONS.filter(q =>
    (filterTopic === "All" || q.topic === filterTopic) &&
    (filterDiff === "All" || q.difficulty === filterDiff)
  );
  const practicedCount = Object.keys(practiced).length;

  // ─── Select screen ───
  if (screen === "select") {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <h2 className="text-xl font-bold text-white">Speak</h2>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Answer aloud, under pressure, in a structured 4-tier drill over the full interview bank.
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
            For each question you run four spoken reps against a timer: a 30-second headline, a 2-minute
            full answer, an interviewer pushback, and a reason-when-unsure rep. This trains the gap between
            knowing the answer and saying it well. After each rep you compare against the model answer and self-rate.
          </p>
          {practicedCount > 0 && (
            <p className="text-xs font-mono text-emerald-400">
              {practicedCount} question{practicedCount !== 1 ? "s" : ""} drilled
            </p>
          )}
        </div>

        {/* R13 (Rev-2): Phrase Bank absorbed here — stronger-phrasing reference for spoken reps */}
        <StrongerPhrasingTab />

        {/* R15 (Rev-2): topic + difficulty filters as dark-theme dropdowns (was pill rows) */}
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Topic</span>
            <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} style={SPEAK_SELECT_STYLE}>
              {topics.map(t => (
                <option key={t} value={t}>{t === "All" ? "All topics" : topicLabel(t)}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Difficulty</span>
            <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} style={SPEAK_SELECT_STYLE}>
              {diffs.map(d => (
                <option key={d} value={d}>{d === "All" ? "All difficulties" : d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </label>
          <span className="text-xs font-mono text-zinc-600">{filtered.length} questions</span>
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map(q => (
            <button key={q.id} onClick={() => handleSelectQuestion(q)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3.5 flex items-start gap-3 text-left hover:border-zinc-600 transition-all">
              <span className="text-[10px] font-mono text-zinc-600 shrink-0 pt-1">{q.id}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-100 leading-snug mb-2">{q.question}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <TopicBadge topic={q.topic} />
                  <DiffBadge difficulty={q.difficulty} />
                  {practiced[q.id] && <span className="text-[10px] font-mono text-emerald-400">drilled</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Drill screen ───
  const tier = TIERS[tierIndex];
  const target = tier.targetSec;
  const overTarget = elapsed > target;
  const isLastTier = tierIndex === TIERS.length - 1;

  let promptText = selectedQ.question;
  if (tier.usePushback) promptText = pushbackFor(selectedQ);
  if (tier.reasonPrompt) promptText = `${selectedQ.question}  —  but pretend you don't fully know: reason it out loud.`;

  const timerColor = overTarget ? "#22c55e" : "#e4e4e7";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={handleBackToList}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-all">
          ← Back
        </button>
        <TopicBadge topic={selectedQ.topic} />
        <DiffBadge difficulty={selectedQ.difficulty} />
        <span className="text-[10px] font-mono text-zinc-600">{selectedQ.id}</span>
      </div>

      {/* Tier progress dots */}
      <div className="flex gap-1.5">
        {TIERS.map((t, i) => (
          <div key={t.key} className="flex-1 h-1 rounded-full"
            style={{ background: i <= tierIndex ? "#22c55e" : "#3f3f46", opacity: i === tierIndex ? 1 : (i < tierIndex ? 0.6 : 1) }} />
        ))}
      </div>

      {/* Tier header */}
      <div>
        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">
          {tier.kicker} · target {fmt(tier.targetSec)}
        </div>
        <div className="text-lg font-bold text-white">{tier.label}</div>
      </div>

      {/* Prompt card */}
      <div className="rounded-xl border p-5" style={{ borderColor: tier.usePushback ? "rgba(245,158,11,0.4)" : "#3f3f46", background: "rgba(24,24,27,0.6)" }}>
        <p className="text-base font-semibold text-white leading-relaxed mb-2.5">{promptText}</p>
        <p className="text-xs text-zinc-400 leading-relaxed">{tier.instruction}</p>
      </div>

      {/* Timer vs target */}
      <div className="flex items-center gap-4">
        <div className="text-2xl font-mono font-bold" style={{ color: timerColor }}>{fmt(elapsed)}</div>
        <div className="text-xs font-mono text-zinc-500">
          / {fmt(target)} target
          {overTarget && <span className="text-emerald-400 ml-2">over target</span>}
        </div>
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (elapsed / target) * 100)}%`, background: overTarget ? "#22c55e" : "#71717a" }} />
        </div>
      </div>

      {/* No-speech fallback notice */}
      {!speechSupported && (
        <div className="rounded-lg p-3 text-xs" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
          {/iPad|iPhone|iPod/.test(navigator.userAgent)
            ? "Voice recording is not supported on iOS Safari. Still practise aloud against the timer, then type what you said below."
            : "Web Speech API not supported in this browser (use Chrome or Edge for voice). Practise aloud against the timer, then type what you said below."}
        </div>
      )}

      {/* Transcript / textarea */}
      {speechSupported ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 min-h-[130px] text-sm leading-relaxed text-zinc-100">
          {!finalTranscript && !interimTranscript && (
            <span className="text-zinc-600">
              {isRecording ? "Listening..." : "Press Start to speak your answer aloud."}
            </span>
          )}
          <span>{finalTranscript}</span>
          {interimTranscript && <span className="text-zinc-500">{interimTranscript}</span>}
        </div>
      ) : (
        <textarea
          value={fallbackText}
          onChange={e => setFallbackText(e.target.value)}
          placeholder="Type what you said aloud..."
          className="w-full min-h-[130px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm leading-relaxed text-zinc-100 outline-none resize-y focus:border-emerald-700"
        />
      )}

      {/* Recording controls */}
      {speechSupported && (
        <div className="flex items-center gap-3">
          <button onClick={isRecording ? stopRecording : startRecording}
            className="px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all"
            style={isRecording
              ? { background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.4)" }
              : { background: "rgba(34,197,94,0.10)", color: "#a1a1aa", border: "1px solid #3f3f46" }}>
            {isRecording
              ? <><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#22c55e" }} /> Stop</>
              : <><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#71717a" }} /> Start</>}
          </button>
          {(finalTranscript || interimTranscript || isRecording || elapsed > 0) && (
            <button onClick={() => { stopRecording(); setFinalTranscript(""); setInterimTranscript(""); setElapsed(0); }}
              className="px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-semibold hover:bg-zinc-700 transition-all">
              Reset
            </button>
          )}
        </div>
      )}

      {/* Model answer — self-comparison */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2">
        {!showModel ? (
          <button onClick={() => setShowModel(true)}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.4)" }}>
            Reveal model answer to compare →
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Model answer</div>
              <p className="text-sm text-zinc-200 leading-relaxed">{selectedQ.explanation}</p>
            </div>
            {selectedQ.staffLayer && (
              <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Senior framing</div>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedQ.staffLayer}</p>
              </div>
            )}
            {Array.isArray(selectedQ.keywords) && selectedQ.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedQ.keywords.map((k, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{k}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Self-check */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="text-sm font-semibold text-white mb-2.5">{tier.check}</div>
        <div className="flex gap-2.5">
          {[{ v: true, label: "Yes, hit it" }, { v: false, label: "Not yet" }].map(opt => (
            <button key={String(opt.v)} onClick={() => setSelfCheck(opt.v)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={selfCheck === opt.v
                ? (opt.v
                  ? { background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.4)" }
                  : { background: "rgba(24,24,27,0.8)", color: "#fff", border: "1px solid #71717a" })
                : { background: "#27272a", color: "#a1a1aa", border: "1px solid #3f3f46" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advance */}
      <div className="flex justify-end">
        <button onClick={handleNextTier}
          className="px-6 py-2.5 rounded-lg text-white font-bold text-sm transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)", boxShadow: "0 4px 16px rgba(34,197,94,0.35)" }}>
          {isLastTier ? "Finish Drill →" : `Next: ${TIERS[tierIndex + 1].label} →`}
        </button>
      </div>
    </div>
  );
}
