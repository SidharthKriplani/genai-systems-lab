import { useState, useEffect, useRef } from "react";

// ─── PHRASE BANK DATA ─────────────────────────────────────────────────────────

const PHRASES = [
  {
    id: "p1",
    category: "Hallucination",
    weak: "The AI made stuff up",
    strong: "The model hallucinated — it generated a confident, plausible-sounding response that wasn't grounded in the retrieved context. This is a groundedness failure, not a knowledge gap.",
    context: "Explaining a production bug to an engineering lead",
    why: "'Made stuff up' sounds like a toy. The strong version names the failure mode, distinguishes hallucination from knowledge gaps, and signals you understand the eval dimension.",
  },
  {
    id: "p2",
    category: "Retrieval",
    weak: "It didn't find the right document",
    strong: "The retriever had low recall on this query — the relevant chunk existed in the corpus but wasn't surfaced in the top-k results. Likely a semantic gap between query and chunk embedding.",
    context: "Debugging a RAG pipeline failure",
    why: "Weak version is vague. Strong version identifies it as a retrieval recall problem, rules out a corpus coverage issue, and points to the embedding alignment as the root cause.",
  },
  {
    id: "p3",
    category: "Evaluation",
    weak: "Our evals showed it was mostly working",
    strong: "Our eval suite has good coverage on factual recall and format compliance, but we have a known gap in edge case coverage — specifically null-context and adversarial queries. That's our next sprint focus.",
    context: "Giving a project status update to a product lead",
    why: "Weak version gives no signal on what was tested or what risks remain. Strong version shows eval design thinking and is honest about coverage gaps.",
  },
  {
    id: "p4",
    category: "Latency",
    weak: "It's a bit slow because AI is expensive",
    strong: "P95 latency is ~4.2s end-to-end. The dominant cost is the LLM inference call (~2.8s). We can cut that by switching to a smaller model for the classification step — only the synthesis call needs the full model.",
    context: "Responding to a product manager asking why it's slow",
    why: "Weak version explains nothing actionable. Strong version shows you've profiled the latency, understand the architecture, and have a concrete optimization path.",
  },
  {
    id: "p5",
    category: "Fine-tuning",
    weak: "We trained it on our data",
    strong: "We fine-tuned the base model on 12k labeled examples from our proprietary workflow. The goal was behavioral alignment — teaching the model our internal format conventions and domain-specific terminology — not injecting factual knowledge.",
    context: "Explaining your ML approach to a technical recruiter or interviewer",
    why: "Weak version is ambiguous. Strong version distinguishes fine-tuning for behavior vs. knowledge, which is a key nuance interviewers probe for.",
  },
  {
    id: "p6",
    category: "Agents",
    weak: "The AI agent can do tasks automatically",
    strong: "We implemented a ReAct-style agent that reasons over tool outputs before acting. It uses a tool-use loop: it can query our internal APIs, inspect results, and decide whether to escalate or resolve autonomously. Failure modes we've instrumented include tool call failures and infinite reasoning loops.",
    context: "Describing your agent architecture to an engineering director",
    why: "Weak version tells them nothing. Strong version shows architecture awareness (ReAct), tooling maturity, and that you've thought about failure modes — which is exactly what senior engineers ask about.",
  },
  {
    id: "p7",
    category: "Context window",
    weak: "There's a limit on how much text you can give it",
    strong: "The model has a 128k token context window, but attention complexity scales O(n²) with sequence length — so long contexts meaningfully increase latency and cost. We chunk and retrieve rather than stuffing full documents because the model also has known accuracy degradation on tasks requiring retrieval from the middle of long contexts.",
    context: "Explaining a technical tradeoff to a product manager or business stakeholder",
    why: "Strong version explains the constraint (O(n²)), the cost implication, and the 'lost in the middle' problem — showing you know why the limit matters, not just that it exists.",
  },
  {
    id: "p8",
    category: "Guardrails",
    weak: "We added filters so it doesn't say bad things",
    strong: "We have a two-layer guardrail pipeline: input classifiers that catch prompt injection and out-of-scope queries before they hit the model, and output validators that check format compliance and flag responses that fail groundedness checks. False positive rate on the input layer is ~3%, which we're tuning against a labeled adversarial test set.",
    context: "Describing safety architecture to a trust & safety lead or senior PM",
    why: "Weak version is hand-wavy. Strong version shows you understand the two-layer architecture, know false positives are a real problem, and are measuring it.",
  },
  {
    id: "p9",
    category: "Model selection",
    weak: "We use GPT-4 because it's the best",
    strong: "We did a model selection pass across the task dimensions that matter for us: accuracy on our eval set, latency at our p95 target, and cost at our projected query volume. The frontier model performed 12% better on our hardest eval cases, but a 7B fine-tuned model matched it on the 80% common case at 15x lower cost. We use tiered routing.",
    context: "Answering 'why did you choose this model?' in a system design interview",
    why: "Weak version is uninformed brand selection. Strong version shows you evaluated empirically, understand cost/performance tradeoffs, and designed a tiered system — exactly what senior engineers do.",
  },
  {
    id: "p10",
    category: "Chunking",
    weak: "We split the documents up",
    strong: "We use a sentence-aware chunking strategy with 512-token chunks and a 64-token overlap. Fixed chunking gave us mid-sentence splits that broke semantic coherence and hurt retrieval precision by ~18% on our eval set. The overlap ensures cross-chunk references don't break retrieval on boundary queries.",
    context: "Explaining your RAG architecture in a technical interview or design review",
    why: "Weak version sounds like you copy-pasted a tutorial. Strong version shows you understand why chunking strategy affects retrieval quality, and that you measured it.",
  },
];

// ─── TIMED DRILLS DATA ────────────────────────────────────────────────────────

const DRILLS = [
  {
    id: "d1",
    level: "FOUNDATIONAL",
    color: "#6366f1",
    question: "What is RAG and when would you use it instead of fine-tuning?",
    keyPoints: [
      "RAG = Retrieval-Augmented Generation: retrieve relevant chunks from a corpus, inject into context, generate grounded response",
      "Use RAG when knowledge changes frequently (can't retrain constantly)",
      "Use fine-tuning when the model needs to learn stable behavioral patterns or proprietary formats",
      "RAG = freshness + citation; fine-tuning = style + domain behavior",
    ],
    hint: "Hit: knowledge freshness, citation/groundedness, vs. fine-tuning for style",
  },
  {
    id: "d2",
    level: "FOUNDATIONAL",
    color: "#6366f1",
    question: "Explain what a token is and why it matters for system design.",
    keyPoints: [
      "Token = smallest unit of text the model processes (~0.75 words on average)",
      "Context window is measured in tokens — limits how much input/history you can include",
      "Pricing is per token — matters for cost at scale",
      "Tokenization varies across languages — 1 English word ≠ 1 Chinese character in token count",
    ],
    hint: "Hit: context window limits, cost implications, cross-language variance",
  },
  {
    id: "d3",
    level: "INTERMEDIATE",
    color: "#f59e0b",
    question: "A RAG system is returning correct documents but the final answers are still wrong. Walk through your debug steps.",
    keyPoints: [
      "Isolate: is the retrieval correct? Check top-k documents manually for relevance",
      "Check groundedness: is the model ignoring the retrieved context (over-reliance on parametric memory)?",
      "Check chunk quality: are chunks semantically coherent or mid-sentence splits?",
      "Check answer policy: is the model too 'helpful' and synthesizing beyond what context supports?",
      "Check conflict: are multiple retrieved chunks contradicting each other?",
    ],
    hint: "Hit: isolate retrieval vs. generation, groundedness, chunk coherence, conflicting sources",
  },
  {
    id: "d4",
    level: "INTERMEDIATE",
    color: "#f59e0b",
    question: "How would you design an eval suite for a customer-facing Q&A assistant?",
    keyPoints: [
      "Factual recall: exact match against gold answers",
      "Groundedness: every claim cited to retrieved context (NLI or citation check)",
      "Refusal quality: adversarial set of out-of-scope queries",
      "Format compliance: does output match required schema",
      "Edge cases: null context, multi-intent queries, language switches",
      "LLM-as-judge for coherence — but calibrate against human ratings",
    ],
    hint: "Hit: multiple eval dimensions, LLM-judge limitations, adversarial set, edge cases",
  },
  {
    id: "d5",
    level: "INTERMEDIATE",
    color: "#f59e0b",
    question: "What are the tradeoffs between using a large frontier model vs. a smaller fine-tuned model in production?",
    keyPoints: [
      "Frontier: higher accuracy on complex/novel tasks, no training cost, API dependency",
      "Fine-tuned small: lower latency, lower cost at scale, proprietary behavior baked in, no API vendor risk",
      "Decision factors: query volume, task complexity, data availability, latency SLA, cost budget",
      "Common pattern: tiered routing — small model for 80% common case, frontier for complex/edge cases",
    ],
    hint: "Hit: cost, latency, vendor lock-in, tiered routing pattern",
  },
  {
    id: "d6",
    level: "ADVANCED",
    color: "#ef4444",
    question: "A production LLM system has a sudden drop in quality — users are reporting wrong answers. Walk through your incident response.",
    keyPoints: [
      "Check deployment: did anything change? Model version, prompt, retrieval pipeline, infra?",
      "Run eval suite: which eval categories degraded? (groundedness? refusal? format?)",
      "Check data drift: did the query distribution shift? New topic cluster appearing?",
      "Check retrieval: is the corpus stale? New conflicting documents added?",
      "Rollback vs. hotfix: if prompt changed, rollback. If corpus issue, re-index or add metadata filter.",
      "Post-mortem: root cause → monitoring gap → prevention",
    ],
    hint: "Hit: deployment diff, eval regression, data drift, retrieval staleness, rollback path",
  },
  {
    id: "d7",
    level: "ADVANCED",
    color: "#ef4444",
    question: "How would you design a system to prevent LLM hallucinations in a high-stakes domain (medical, legal, financial)?",
    keyPoints: [
      "Grounding architecture: strictly-grounded answer policy — never synthesize beyond retrieved context",
      "Citation requirement: every claim must map to a specific source chunk",
      "NLI validation: automated entailment check on each output sentence",
      "Human review loop: flag low-confidence responses for human review before returning",
      "Adversarial eval: dedicated golden test set with known-tricky cases",
      "Refusal design: prefer graceful refusal over confident wrong answer",
    ],
    hint: "Hit: strict grounding, citation, NLI check, human-in-the-loop, prefer refusal",
  },
  {
    id: "d8",
    level: "ADVANCED",
    color: "#ef4444",
    question: "Explain how you'd decide the right chunk size for a RAG system.",
    keyPoints: [
      "Small chunks: higher retrieval precision, risk of losing context around key facts",
      "Large chunks: more context per retrieved result, lower precision (noisy chunks hurt generation)",
      "Sentence-aware chunking: preserves semantic coherence vs. fixed-size splits",
      "Overlap: helps boundary queries where key info spans chunks",
      "Empirical answer: run retrieval precision + answer quality eval across chunk sizes on your actual data",
      "There is no universal answer — it depends on document type, query type, and model context window",
    ],
    hint: "Hit: precision/recall tradeoff, sentence-aware vs fixed, overlap, empirical eval needed",
  },
];

// ─── PHRASE BANK COMPONENT ────────────────────────────────────────────────────

function PhraseBank() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showStrong, setShowStrong] = useState(false);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(PHRASES.map(p => p.category)))];
  const filtered = filter === "All" ? PHRASES : PHRASES.filter(p => p.category === filter);
  const phrase = filtered[activeIdx] || filtered[0];

  function nextPhrase() {
    setActiveIdx(i => (i + 1) % filtered.length);
    setShowStrong(false);
  }
  function prevPhrase() {
    setActiveIdx(i => (i - 1 + filtered.length) % filtered.length);
    setShowStrong(false);
  }
  function changeFilter(cat) {
    setFilter(cat);
    setActiveIdx(0);
    setShowStrong(false);
  }

  if (!phrase) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">The phrases you use in meetings, interviews, and design reviews signal your level. These 10 upgrades cover the highest-impact vocabulary shifts.</p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => changeFilter(cat)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${filter === cat ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-500">{activeIdx + 1} / {filtered.length} · {phrase.category}</span>
          <div className="flex gap-2">
            <button onClick={prevPhrase} className="w-7 h-7 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold">←</button>
            <button onClick={nextPhrase} className="w-7 h-7 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold">→</button>
          </div>
        </div>

        <div className="text-xs text-zinc-500 italic">Context: {phrase.context}</div>

        {/* Weak */}
        <div className="rounded-lg bg-red-950/30 border border-red-900/40 p-4">
          <div className="text-xs font-bold text-red-400 mb-2">❌ Weak</div>
          <p className="text-sm text-zinc-300">"{phrase.weak}"</p>
        </div>

        {/* Strong — revealed on click */}
        {!showStrong ? (
          <button
            onClick={() => setShowStrong(true)}
            className="w-full py-2.5 rounded-lg bg-emerald-900/30 border border-emerald-800 text-emerald-400 text-sm font-semibold hover:bg-emerald-900/50 transition-all"
          >
            Reveal strong version →
          </button>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-emerald-950/30 border border-emerald-800 p-4">
              <div className="text-xs font-bold text-emerald-400 mb-2">✓ Strong</div>
              <p className="text-sm text-zinc-200 leading-relaxed">"{phrase.strong}"</p>
            </div>
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3">
              <span className="text-xs font-bold text-indigo-400">Why it's better: </span>
              <span className="text-xs text-zinc-300">{phrase.why}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TIMED DRILLS COMPONENT ───────────────────────────────────────────────────

const DRILL_TIME = 60;

function TimedDrills() {
  const [drillIdx, setDrillIdx] = useState(0);
  const [phase, setPhase] = useState("ready"); // ready | answering | reviewing | done
  const [timeLeft, setTimeLeft] = useState(DRILL_TIME);
  const [selfScores, setSelfScores] = useState({});
  const [showPoints, setShowPoints] = useState(false);
  const timerRef = useRef(null);
  const [filter, setFilter] = useState("All");

  const levels = ["All", "FOUNDATIONAL", "INTERMEDIATE", "ADVANCED"];
  const filteredDrills = filter === "All" ? DRILLS : DRILLS.filter(d => d.level === filter);
  const drill = filteredDrills[drillIdx] || filteredDrills[0];

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function startDrill() {
    setPhase("answering");
    setTimeLeft(DRILL_TIME);
    setShowPoints(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("reviewing");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function stopDrill() {
    clearInterval(timerRef.current);
    setPhase("reviewing");
  }

  function scoreThis(hit) {
    setSelfScores(prev => ({ ...prev, [drill.id]: hit }));
  }

  function nextDrill() {
    const nextIdx = (drillIdx + 1) % filteredDrills.length;
    setDrillIdx(nextIdx);
    setPhase("ready");
    setTimeLeft(DRILL_TIME);
    setShowPoints(false);
    clearInterval(timerRef.current);
  }

  function changeFilter(f) {
    setFilter(f);
    setDrillIdx(0);
    setPhase("ready");
    setTimeLeft(DRILL_TIME);
    setShowPoints(false);
    clearInterval(timerRef.current);
  }

  const hitCount = Object.values(selfScores).filter(Boolean).length;
  const answeredCount = Object.keys(selfScores).length;
  const timerPct = (timeLeft / DRILL_TIME) * 100;
  const timerColor = timeLeft > 30 ? "#10b981" : timeLeft > 15 ? "#f59e0b" : "#ef4444";

  if (!drill) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        60 seconds per question. Answer out loud or mentally. Then compare your answer against key points and self-score. This builds interview fluency under pressure.
      </p>

      {/* Level filter */}
      <div className="flex flex-wrap gap-2">
        {levels.map(l => (
          <button
            key={l}
            onClick={() => changeFilter(l)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${filter === l ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {answeredCount > 0 && (
        <div className="text-xs font-mono text-violet-400">{hitCount}/{answeredCount} key points hit</div>
      )}

      {/* Drill navigation */}
      <div className="flex gap-2 flex-wrap">
        {filteredDrills.map((d, i) => (
          <button
            key={d.id}
            onClick={() => { setDrillIdx(i); setPhase("ready"); setTimeLeft(DRILL_TIME); setShowPoints(false); clearInterval(timerRef.current); }}
            className={`w-8 h-8 rounded text-xs font-bold transition-all ${drillIdx === i ? "bg-violet-600 text-white" : selfScores[d.id] === true ? "bg-emerald-800 text-emerald-300" : selfScores[d.id] === false ? "bg-red-900 text-red-400" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: drill.color + "22", color: drill.color, border: `1px solid ${drill.color}44` }}>{drill.level}</span>
          <span className="text-xs text-zinc-500 font-mono">Q{drillIdx + 1} of {filteredDrills.length}</span>
        </div>

        <p className="text-base font-semibold text-white leading-snug">{drill.question}</p>

        {/* Timer bar */}
        {(phase === "answering" || phase === "reviewing") && (
          <div className="space-y-1">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timerPct}%`, background: timerColor }}
              />
            </div>
            <div className="text-xs font-mono" style={{ color: timerColor }}>
              {phase === "reviewing" ? "Time's up" : `${timeLeft}s remaining`}
            </div>
          </div>
        )}

        {/* Phase: ready */}
        {phase === "ready" && (
          <div className="space-y-2">
            <div className="text-xs text-zinc-500">Hint: {drill.hint}</div>
            <button onClick={startDrill} className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all">
              Start 60-second answer
            </button>
          </div>
        )}

        {/* Phase: answering */}
        {phase === "answering" && (
          <div className="space-y-3">
            <div className="rounded bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-500">
              Answer out loud or type mentally. Focus on the concepts, not memorizing wording.
            </div>
            <button onClick={stopDrill} className="w-full py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold transition-all">
              I'm done → See key points
            </button>
          </div>
        )}

        {/* Phase: reviewing */}
        {phase === "reviewing" && (
          <div className="space-y-4">
            <button
              onClick={() => setShowPoints(v => !v)}
              className="w-full py-2 rounded-lg bg-indigo-900/40 border border-indigo-700 text-indigo-300 text-sm font-semibold hover:bg-indigo-900/70 transition-all"
            >
              {showPoints ? "Hide key points" : "Show key points"}
            </button>

            {showPoints && (
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                <div className="text-xs font-bold text-zinc-400 mb-2">Key points to hit:</div>
                {drill.keyPoints.map((kp, i) => (
                  <div key={i} className="flex gap-2 text-xs text-zinc-300">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                    <span>{kp}</span>
                  </div>
                ))}
              </div>
            )}

            {!selfScores[drill.id] && showPoints && (
              <div className="space-y-2">
                <div className="text-xs text-zinc-500 font-semibold">How many key points did you hit?</div>
                <div className="flex gap-3">
                  <button onClick={() => scoreThis(true)} className="flex-1 py-2 rounded-lg bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-xs font-bold hover:bg-emerald-900/70 transition-all">
                    ✓ Got most of them
                  </button>
                  <button onClick={() => scoreThis(false)} className="flex-1 py-2 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-xs font-bold hover:bg-red-900/50 transition-all">
                    ✗ Missed key points
                  </button>
                </div>
              </div>
            )}

            {selfScores[drill.id] !== undefined && (
              <div className={`rounded-lg p-3 text-xs font-semibold ${selfScores[drill.id] ? "bg-emerald-900/30 border border-emerald-800 text-emerald-300" : "bg-red-900/20 border border-red-900 text-red-300"}`}>
                {selfScores[drill.id] ? "Nice. Repeat the ones you missed to lock it in." : "Review the key points and try this one again in your next session."}
              </div>
            )}

            <button onClick={nextDrill} className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 transition-all">
              Next drill →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FLUENCY APP ──────────────────────────────────────────────────────────────

const FLUENCY_MODULES = [
  { id: "phrases", label: "Phrase Bank", tag: "UPGRADE" },
  { id: "drills", label: "Timed Drills", tag: "PRACTICE" },
];

export default function FluencyApp() {
  const [activeModule, setActiveModule] = useState("phrases");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Fluency Gym</h1>
        <p className="text-sm text-zinc-400">Speak about AI systems like a senior engineer — phrase upgrades and timed drills</p>
      </div>

      {/* Module switcher */}
      <div className="flex gap-2 justify-center flex-wrap">
        {FLUENCY_MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeModule === m.id ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${activeModule === m.id ? "bg-zinc-200 text-zinc-800" : "bg-zinc-700 text-zinc-400"}`}>{m.tag}</span>
            {m.label}
          </button>
        ))}
        <span className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-zinc-900 text-zinc-700 border border-dashed border-zinc-800 cursor-default">
          Company Cases — soon
        </span>
      </div>

      {activeModule === "phrases" && <PhraseBank />}
      {activeModule === "drills" && <TimedDrills />}
    </div>
  );
}
