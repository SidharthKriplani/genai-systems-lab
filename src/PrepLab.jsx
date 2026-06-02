import React, { useState, useEffect, useRef } from "react";
import { isAccessGranted, grantAccess, validateCode, FREE_QUESTION_LIMIT } from "./utils/accessCode";
import { RESULTS_FREE_LIMIT } from "./config/gating";
import { PREP_QUESTIONS } from "./data/preplabQuestions";
import { CommonTrapCallout, FeedbackBar } from "./shared";

// ─── GATE MODAL ───────────────────────────────────────────────────────────────
function GateModal({ onUnlock, onClose }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  function submit() {
    if (validateCode(code)) {
      grantAccess();
      setUnlocked(true);
      setTimeout(onUnlock, 1400);
    } else setError(true);
  }

  if (unlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <style>{`
          @keyframes gsl-pop { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
          @keyframes gsl-glow { 0%,100% { box-shadow: 0 0 30px rgba(139,92,246,0.35),0 0 70px rgba(139,92,246,0.12); } 50% { box-shadow: 0 0 60px rgba(139,92,246,0.6),0 0 120px rgba(139,92,246,0.25); } }
          @keyframes gsl-fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
        <div className="bg-zinc-900 border border-violet-500/40 rounded-2xl p-10 max-w-sm w-full flex flex-col items-center gap-5 text-center"
          style={{ animation: "gsl-pop 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className="w-18 h-18 rounded-full flex items-center justify-center"
            style={{ width: 72, height: 72, background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(109,40,217,0.08) 100%)", animation: "gsl-glow 1.4s ease-in-out both" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{ animation: "gsl-fadein 0.4s 0.25s both" }}>
            <div className="text-2xl font-bold text-white mb-1">You're in.</div>
            <div className="text-sm text-zinc-400">Full access unlocked</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full space-y-6">
        <div className="space-y-2">
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest">Access Required</div>
          <h2 className="text-xl font-semibold text-white">Enter your access code</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            You've used your {FREE_QUESTION_LIMIT} free questions for this session. Enter your access code to continue — it's free during beta.
          </p>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(false); }}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="ENTER CODE"
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {error && (
            <p className="text-red-400 text-xs">Invalid code. Get the free beta code at genai-systems-lab-ivory.vercel.app</p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={submit}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            Unlock Access
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 text-zinc-400 hover:text-zinc-200 text-sm transition-colors">
            Cancel
          </button>
        </div>
        <p className="text-zinc-500 text-xs text-center">
          During beta, access is free for the community.{" "}
          <a href="https://genai-systems-lab-ivory.vercel.app" target="_blank" rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline">Get the code →</a>
        </p>
      </div>
    </div>
  );
}

// ─── QUESTION BANK (60 questions) ────────────────────────────────────────────

// PREP_QUESTIONS imported from ./data/preplabQuestions

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TOPIC_COLORS = {
  rag: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  agents: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  finetuning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  evaluation: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  llmops: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  safety: "bg-red-500/20 text-red-300 border-red-500/30",
  product: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  behavioral: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  multimodal: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  reasoning: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  serving: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const TOPIC_LABELS = {
  rag: "RAG", agents: "Agents", finetuning: "Fine-Tuning",
  evaluation: "Evaluation", llmops: "LLMOps",
  safety: "Safety", product: "Product", behavioral: "Behavioral",
  multimodal: "Multimodal", reasoning: "Reasoning Models",
  serving: "Serving & Inference",
};

// Topic group tiles for TrainerMode selector (5 groups replacing 22 individual pills)
const TOPIC_GROUPS = [
  {
    id: "rag",
    label: "RAG & Retrieval",
    desc: "Retrieval failure modes, chunking, embeddings, reranking, caching",
    topics: ["rag"],
  },
  {
    id: "agents",
    label: "Agents & Systems",
    desc: "Agent loops, memory architecture, orchestration, tool use",
    topics: ["agents"],
  },
  {
    id: "evals",
    label: "Evals & Metrics",
    desc: "Evaluation design, RAGAS, LLM-as-judge, hallucination scoring",
    topics: ["evaluation"],
  },
  {
    id: "llm",
    label: "LLM & Fine-Tuning",
    desc: "Transformers, attention, fine-tuning, reasoning models, multimodal",
    topics: ["finetuning", "reasoning", "multimodal"],
  },
  {
    id: "prod",
    label: "Production & Ops",
    desc: "Serving, inference, LLMOps, safety, behavioral, product strategy",
    topics: ["serving", "llmops", "safety", "behavioral", "product"],
  },
];

const SKILL_KEYWORDS = {
  rag:         ["rag", "retrieval", "vector", "embedding", "pinecone", "weaviate", "langchain", "chunking", "reranker", "hybrid search"],
  agents:      ["agent", "tool use", "react", "langgraph", "orchestrat", "agentic", "multi-agent", "tool calling"],
  finetuning:  ["fine-tun", "lora", "rlhf", "dpo", "training", "finetune", "sft", "adapter"],
  evaluation:  ["eval", "evals", "benchmark", "llm-as-judge", "ragas", "hallucination", "groundedness"],
  llmops:      ["mlops", "llmops", "deploy", "observ", "latency", "cost", "monitor", "ci/cd", "prompt management", "versioning"],
  safety:      ["safety", "guardrail", "alignment", "harmful", "red-team", "jailbreak", "injection"],
  product:     ["product", "roadmap", "stakeholder", "kpi", "prd", "feature", "pm", "product manager"],
  behavioral:  ["team", "leadership", "cross-functional", "conflict", "mentor", "collaborate"],
  multimodal:  ["multimodal", "vision", "image", "clip", "llava", "ocr", "audio"],
  reasoning:   ["reasoning", "chain of thought", "cot", "o1", "o3", "step-by-step", "planning"],
  serving:     ["serving", "inference", "throughput", "quantiz", "batching", "gpu", "vllm", "triton", "tgi"],
};

// ─── STUDY PLAN RESOURCES PER TOPIC ──────────────────────────────────────────
const TOPIC_STUDY_RESOURCES = {
  rag: {
    gtPosts: [
      { id: "why-rag-lies",              title: "Why Your RAG System Lies" },
      { id: "hard-negatives-retrieval",  title: "Hard Negatives: The Training Trick That Improves Retrieval" },
    ],
    modules: [
      { tab: "lab",     label: "RAG Lab — 6 failure scenarios" },
      { tab: "systems", moduleId: "vectordb", label: "Vector DB Engineering" },
    ],
  },
  agents: {
    gtPosts: [
      { id: "agent-memory-architecture",     title: "The Four Memory Problems Every Agent Has" },
      { id: "context-isolation-multiagent",  title: "Context Isolation in Multi-Agent Systems" },
    ],
    modules: [
      { tab: "agentlab", label: "Agent Lab" },
    ],
  },
  finetuning: {
    gtPosts: [
      { id: "what-happens-during-pretraining", title: "What Actually Happens During Pretraining" },
    ],
    modules: [
      { tab: "llmlab", label: "LLM Lab — Fine-Tuning module" },
    ],
  },
  evaluation: {
    gtPosts: [
      { id: "the-eval-crisis", title: "The Eval Crisis: Why Most AI Evals Are Wrong" },
    ],
    modules: [
      { tab: "evallab", label: "Eval Lab" },
    ],
  },
  llmops: {
    gtPosts: [
      { id: "your-prompt-is-code",       title: "Your Prompt Is Code" },
      { id: "monitoring-that-predicts",  title: "Monitoring That Predicts Problems, Not Reports Them" },
    ],
    modules: [
      { tab: "systems", label: "Systems Lab — LLMOps modules" },
    ],
  },
  safety: {
    gtPosts: [
      { id: "hooks-vs-llm-safety", title: "Deterministic Guardrails vs LLM-Based Safety" },
    ],
    modules: [
      { tab: "systems", label: "AI Safety Engineering module" },
    ],
  },
  product: {
    gtPosts: [
      { id: "type-a-vs-type-b-engineers", title: "Type A vs Type B AI Engineers" },
    ],
    modules: [
      { tab: "aipm", label: "AI Product Track" },
    ],
  },
  behavioral: {
    gtPosts: [
      { id: "forward-deployed-engineer", title: "The Forward Deployed Engineer" },
    ],
    modules: [
      { tab: "career", label: "Career Track" },
    ],
  },
  multimodal: {
    gtPosts: [],
    modules: [
      { tab: "explore", label: "Explore — Multimodal Guide" },
    ],
  },
  reasoning: {
    gtPosts: [
      { id: "how-surprised-is-the-model", title: "How Surprised Is the Model?" },
    ],
    modules: [
      { tab: "concepts", label: "Concepts — Transformer architecture" },
    ],
  },
  serving: {
    gtPosts: [],
    modules: [
      { tab: "llmlab", label: "LLM Lab — Serving Infrastructure" },
    ],
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shared history persistence — used by TrainerMode, InterviewPrepMode, and WeaknessHeatmapMode
function recordHistory(questionId, correct) {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");
    const entry = prev[questionId] || { attempts: 0, wrong: 0 };
    localStorage.setItem(HISTORY_KEY, JSON.stringify({
      ...prev,
      [questionId]: { attempts: entry.attempts + 1, wrong: entry.wrong + (correct ? 0 : 1) },
    }));
  } catch {}
}

function drawQuestions(count, focus, difficulty) {
  let pool = [...PREP_QUESTIONS];
  if (focus !== "all") {
    const topicMap = {
      engineering: ["rag", "agents", "llmops", "finetuning", "evaluation", "safety"],
      pm: ["product", "behavioral", "evaluation"],
      interview: ["behavioral", "product", "rag", "agents"]
    };
    pool = pool.filter(q => (topicMap[focus] || []).includes(q.topic));
  }
  if (difficulty === "hard") pool = pool.filter(q => q.difficulty === "hard");
  return shuffle(pool).slice(0, count);
}

function scoreText(answer, keywords) {
  if (!answer || !keywords || keywords.length === 0) return { pass: false };
  const lower = answer.toLowerCase();
  const hits = keywords.filter(k => lower.includes(k.toLowerCase())).length;
  return { hits, pass: hits >= Math.ceil(keywords.length * 0.4) };
}

function extractSkills(text) {
  if (!text) return {};
  const lower = text.toLowerCase();
  const found = {};
  for (const [skill, kws] of Object.entries(SKILL_KEYWORDS)) {
    const hits = kws.filter(k => lower.includes(k));
    if (hits.length > 0) found[skill] = { hits, weight: hits.length };
  }
  return found;
}

// weight 1–2 = medium, 3+ = high
function skillWeightLabel(weight) {
  if (weight >= 3) return { label: "High priority", color: "text-red-400", dot: "bg-red-400" };
  if (weight >= 2) return { label: "Medium",        color: "text-amber-400", dot: "bg-amber-400" };
  return            { label: "Mentioned",           color: "text-zinc-400",  dot: "bg-zinc-600" };
}

const RATING_VALUES = { strong: 0.9, okay: 0.5, weak: 0.0 };
const DRILL_W       = { weak: 3,    okay: 1.5,  strong: 0.5 };
const HISTORY_KEY   = "gsl-preplab-history";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────

function TopicChip({ topic }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TOPIC_COLORS[topic]}`}>
      {TOPIC_LABELS[topic]}
    </span>
  );
}

function PBar({ value, max, color = "bg-indigo-500" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(39,39,42,0.9)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%`, boxShadow: "2px 0 6px rgba(99,102,241,0.5)" }}
      />
    </div>
  );
}

function ScoreBar({ label, score, max, color = "bg-indigo-500" }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const glowColor = color.includes("emerald") ? "rgba(16,185,129,0.4)" : color.includes("amber") ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.4)";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono font-semibold text-zinc-300">{score}/{max} <span className="text-zinc-500">({pct}%)</span></span>
      </div>
      <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(39,39,42,0.9)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}>
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%`, boxShadow: `2px 0 8px ${glowColor}` }} />
      </div>
    </div>
  );
}

function SpeechTextArea({ value, onChange, rows = 5, placeholder = "Type your answer here..." }) {
  const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const [listening, setListening] = useState(false);
  const [spoken, setSpoken] = useState(false);

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false;
    rec.onresult = e => {
      onChange((value ? value + " " : "") + e.results[0][0].transcript);
      setSpoken(true); setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start(); setListening(true);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
        />
        {spoken && (
          <span className="absolute top-2 right-2 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">(spoken)</span>
        )}
      </div>
      {hasSpeech && (
        <button
          onClick={startListening}
          disabled={listening}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all ${listening ? "bg-red-500/20 border-red-500/50 text-red-300 animate-pulse" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"}`}
        >
          <span>{listening ? "🎙 Listening..." : "🎤 Speak answer"}</span>
        </button>
      )}
    </div>
  );
}

function MCQOptions({ options, selected, onSelect }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  return (
    <div className="space-y-2.5">
      {options.map((opt, i) => {
        const isSelected = selected === i;
        const isHovered = hoveredIdx === i && !isSelected;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={isSelected ? {
              background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.08) 100%)",
              border: "1px solid rgba(139,92,246,0.6)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.1) inset, 0 4px 12px rgba(139,92,246,0.12)",
            } : isHovered ? {
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.4)",
            } : {
              background: "linear-gradient(160deg, rgba(39,39,42,0.5) 0%, rgba(15,15,17,0.8) 100%)",
              border: "1px solid rgba(63,63,70,0.7)",
            }}
            className={`w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all flex items-start gap-3 ${isSelected ? "text-violet-100" : isHovered ? "text-white" : "text-zinc-300"}`}
          >
            <span
              style={isSelected ? {
                background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
                color: "#fff",
                boxShadow: "0 2px 6px rgba(139,92,246,0.4)",
              } : isHovered ? {
                background: "rgba(139,92,246,0.2)",
                border: "1px solid rgba(139,92,246,0.4)",
                color: "#c4b5fd",
              } : {
                background: "rgba(39,39,42,0.9)",
                border: "1px solid rgba(63,63,70,0.9)",
                color: "#a1a1aa",
              }}
              className="flex-shrink-0 w-6 h-6 rounded-md text-xs font-bold font-mono flex items-center justify-center mt-0.5"
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1 leading-relaxed">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function QuestionCard({ q, gaps = [] }) {
  const diffAccent = q.difficulty === "hard" ? "rgba(239,68,68,0.9)" : q.difficulty === "easy" ? "rgba(59,130,246,0.9)" : "rgba(245,158,11,0.85)";
  const diffChip = q.difficulty === "hard"
    ? "bg-red-950/50 text-red-400 border border-red-800/40"
    : q.difficulty === "easy"
    ? "bg-blue-950/50 text-blue-400 border border-blue-800/40"
    : "bg-amber-950/50 text-amber-400 border border-amber-800/40";
  return (
    <div
      style={{
        background: "linear-gradient(160deg, rgba(24,24,27,0.9) 0%, rgba(15,15,17,1) 100%)",
        borderTop: "1px solid rgba(63,63,70,0.7)",
        borderRight: "1px solid rgba(63,63,70,0.7)",
        borderBottom: "1px solid rgba(63,63,70,0.7)",
        borderLeft: `4px solid ${diffAccent}`,
      }}
      className="rounded-xl p-5 space-y-3"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <TopicChip topic={q.topic} />
        <span className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${diffChip}`}>
          {q.difficulty || "medium"}
        </span>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{q.type === "mcq" ? "multiple choice" : "open answer"}</span>
        {gaps.includes(q.topic) && (
          <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">Gap</span>
        )}
      </div>
      <p className="text-zinc-100 text-[15px] leading-[1.75] font-medium">{q.question}</p>
    </div>
  );
}

function RevealCard({ isCorrect, q, onNext, nextLabel, onNavigate, onNavigateTo, animKey, onSelfGrade }) {
  // Text questions: always show self-assess UI — keyword matching can't reliably grade open answers
  if (q.type === "text") {
    return (
      <div key={animKey} style={{ background: "linear-gradient(160deg, rgba(99,102,241,0.1) 0%, rgba(15,15,17,0.95) 100%)", border: "1px solid rgba(99,102,241,0.3)", borderTop: "2px solid rgba(99,102,241,0.6)", boxShadow: "0 4px 20px rgba(99,102,241,0.08)" }} className="rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold">
            Open answer — self-assess
          </span>
        </div>
        {q.keywords.length > 0 && (
          <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }} className="rounded-lg px-4 py-3">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2">Concepts to cover</p>
            <div className="flex flex-wrap gap-1.5">
              {q.keywords.map(k => (
                <span key={k} style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }} className="text-xs text-indigo-300 px-2 py-0.5 rounded-full">{k}</span>
              ))}
            </div>
          </div>
        )}
        <div className="border-t border-zinc-800 pt-3">
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-2">Model answer</p>
          <p className="text-[13px] text-zinc-300 leading-relaxed">{q.explanation}</p>
        </div>
        {q.source && (
          <p className="text-[10px] text-zinc-500 font-mono">Source: {q.source}</p>
        )}
        {q.trap && <CommonTrapCallout trap={q.trap} />}
        {q.readMore && (
          <button
            onClick={() => {
              if (q.readMore.postId && onNavigateTo) {
                onNavigateTo({ tab: q.readMore.tab, postId: q.readMore.postId });
              } else {
                onNavigate && onNavigate(q.readMore.tab);
              }
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Read more: {q.readMore.label}</span><span>→</span>
          </button>
        )}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => { onSelfGrade && onSelfGrade(false); onNext(); }}
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
            className="py-3 text-red-300 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            ✗ Missed it
          </button>
          <button
            onClick={() => { onSelfGrade && onSelfGrade(true); onNext(); }}
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
            className="py-3 text-emerald-300 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            ✓ Got it
          </button>
        </div>
      </div>
    );
  }

  const correctStyle = {
    background: "linear-gradient(160deg, rgba(16,185,129,0.1) 0%, rgba(15,15,17,0.95) 100%)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderTop: "2px solid rgba(16,185,129,0.6)",
    boxShadow: "0 4px 20px rgba(16,185,129,0.08)",
  };
  const wrongStyle = {
    background: "linear-gradient(160deg, rgba(239,68,68,0.1) 0%, rgba(15,15,17,0.95) 100%)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderTop: "2px solid rgba(239,68,68,0.6)",
    boxShadow: "0 4px 20px rgba(239,68,68,0.08)",
  };
  return (
    <div key={animKey} style={isCorrect ? correctStyle : wrongStyle} className={`rounded-xl p-5 space-y-4 transition-all duration-300 ${isCorrect ? "animate-correctPulse" : "animate-wrongShake"}`}>
      <div className="flex items-center gap-2">
        <span
          style={isCorrect ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399" } : { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
        >
          {isCorrect ? "✓ Correct" : "✗ Incorrect"}
        </span>
      </div>
      {!isCorrect && q.type === "mcq" && (
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }} className="rounded-lg px-4 py-2.5">
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">Correct answer</p>
          <p className="text-sm text-emerald-300 font-medium">{q.options[q.correct]}</p>
        </div>
      )}
      <div className="border-t border-zinc-800 pt-3">
        <p className="text-[13px] text-zinc-300 leading-relaxed">{q.explanation}</p>
      </div>
      {q.source && (
        <p className="text-[10px] text-zinc-500 font-mono">Source: {q.source}</p>
      )}
      {q.trap && <CommonTrapCallout trap={q.trap} />}
      {q.readMore && (
        <button
          onClick={() => {
            if (q.readMore.postId && onNavigateTo) {
              onNavigateTo({ tab: q.readMore.tab, postId: q.readMore.postId });
            } else {
              onNavigate && onNavigate(q.readMore.tab);
            }
          }}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
        >
          <span>Read more: {q.readMore.label}</span><span>→</span>
        </button>
      )}
      <button
        onClick={onNext}
        style={{ background: "linear-gradient(135deg, rgba(39,39,42,0.9) 0%, rgba(24,24,27,0.95) 100%)", border: "1px solid rgba(63,63,70,0.8)" }}
        className="w-full py-3 text-zinc-200 rounded-xl text-sm font-semibold hover:text-white transition-all"
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── MODE 1: EXAM ─────────────────────────────────────────────────────────────

function ExamConfig({ onStart, onExit }) {
  const [duration, setDuration] = useState(30);
  const [focus, setFocus] = useState("all");
  const [difficulty, setDifficulty] = useState("mixed");
  const DM = { 15: 10, 30: 20, 60: 40 };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Back</button>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">How interview-ready are you?</h2>
          <p className="text-zinc-400 text-sm mt-1">{PREP_QUESTIONS.length} production-level questions. No hints. See exactly where you stand.</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {[15, 30, 60].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`py-3 rounded-lg border text-sm font-medium transition-all ${duration === d ? "bg-violet-600/20 border-violet-500 text-violet-200" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                  {d} min<br /><span className="text-xs opacity-70">{DM[d]} questions</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Focus</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[["all", "All Topics"], ["engineering", "Engineering"], ["pm", "Product / PM"], ["interview", "Interview Prep"]].map(([v, l]) => (
                <button key={v} onClick={() => setFocus(v)}
                  className={`py-3 rounded-lg border text-sm font-medium transition-all ${focus === v ? "bg-violet-600/20 border-violet-500 text-violet-200" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Difficulty</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[["mixed", "Mixed"], ["hard", "Hard Only"]].map(([v, l]) => (
                <button key={v} onClick={() => setDifficulty(v)}
                  className={`py-3 rounded-lg border text-sm font-medium transition-all ${difficulty === v ? "bg-violet-600/20 border-violet-500 text-violet-200" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-sm text-zinc-400 leading-relaxed">
          After the assessment, you'll see your score by topic, your weakest areas, and the exact Lab modules and GT posts that address each gap.
        </div>
        <button
          onClick={() => onStart({ duration, focus, difficulty })}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all"
        >
          Start Assessment →
        </button>
      </div>
    </div>
  );
}

// ─── EXAM SESSION HISTORY ─────────────────────────────────────────────────────
const EXAM_SESSIONS_KEY = "gsl-preplab-exam-sessions";

// Where to go when a topic is weak (pct < 60%) — one forward pointer per topic
const TOPIC_FORWARD_POINTERS = {
  rag:        { label: "RAG Lab",          tab: "lab" },
  agents:     { label: "Agent Lab",        tab: "agentlab" },
  evaluation: { label: "Eval Lab",         tab: "evallab" },
  finetuning: { label: "LLM Lab",          tab: "llmlab" },
  llmops:     { label: "Systems Lab",      tab: "systems" },
  safety:     { label: "AI Safety module", tab: "systems" },
  product:    { label: "AI Product",       tab: "aipm" },
  behavioral: { label: "Career Track",     tab: "career" },
  multimodal: { label: "Explore",          tab: "explore" },
  reasoning:  { label: "Concepts",         tab: "concepts" },
  serving:    { label: "LLM Lab",          tab: "llmlab" },
};

function ExamMode({ onExit, onNavigate, onNavigateTo }) {
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [textOverrides, setTextOverrides] = useState({});
  const [showGate, setShowGate] = useState(false);
  const [showGateResults, setShowGateResults] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const timerRef = useRef(null);
  const DM = { 15: 20, 30: 35, 60: 55 };

  function handleNext() {
    if (current + 1 >= FREE_QUESTION_LIMIT && !isAccessGranted()) {
      setShowGate(true);
      return;
    }
    setCurrent(c => c + 1);
  }

  function startExam(cfg) {
    const qs = drawQuestions(DM[cfg.duration] || 20, cfg.focus, cfg.difficulty);
    setQuestions(qs); setConfig(cfg); setTimeLeft(cfg.duration * 60);
    setAnswers({}); setCurrent(0); setFinished(false);
  }

  useEffect(() => {
    if (!config || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [config, finished]);

  // Keyboard shortcuts: 1-4 selects MCQ option, Enter advances
  useEffect(() => {
    if (!config || finished) return;
    function handleKey(e) {
      const q = questions[current];
      if (!q || q.type !== "mcq") return;
      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key) - 1;
        if (idx < q.options.length) setAnswers(a => ({ ...a, [q.id]: idx }));
      }
      if (e.key === "Enter" && answers[questions[current]?.id] !== undefined) {
        handleNext();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [config, finished, current, questions, answers]);

  // Save MCQ-based result snapshot to session history when exam finishes
  useEffect(() => {
    if (!finished || questions.length === 0) return;
    try {
      let tc = 0;
      for (const q of questions) {
        if (q.type === "mcq" && answers[q.id] === q.correct) tc++;
      }
      const mcqTotal = questions.filter(q => q.type === "mcq").length;
      const pct = mcqTotal > 0 ? Math.round((tc / mcqTotal) * 100) : 0;
      const prev = JSON.parse(localStorage.getItem(EXAM_SESSIONS_KEY) || "[]");
      prev.push({ date: Date.now(), pct, tc, total: mcqTotal, count: questions.length });
      localStorage.setItem(EXAM_SESSIONS_KEY, JSON.stringify(prev.slice(-20)));
    } catch {}
  }, [finished]);

  function computeResults() {
    const bt = {}; let tc = 0; const wrong = []; const textPending = [];
    for (const q of questions) {
      if (!bt[q.topic]) bt[q.topic] = { correct: 0, total: 0 };
      if (q.type === "text") {
        // Text questions: use override if available, else pending
        if (textOverrides[q.id] !== undefined) {
          bt[q.topic].total++;
          if (textOverrides[q.id]) { tc++; bt[q.topic].correct++; }
          else wrong.push(q);
        } else {
          textPending.push(q);
        }
        continue;
      }
      bt[q.topic].total++;
      const ans = answers[q.id];
      const ok = ans === q.correct;
      if (ok) { tc++; bt[q.topic].correct++; } else wrong.push(q);
    }
    const mcqTotal = questions.filter(q => q.type === "mcq").length;
    const gradedTotal = mcqTotal + Object.keys(textOverrides).length;
    const pct = gradedTotal > 0 ? Math.round((tc / gradedTotal) * 100) : 0;
    const ta = Object.entries(bt).map(([t, v]) => ({ topic: t, ...v, pct: v.total > 0 ? Math.round(v.correct / v.total * 100) : 0 }));
    return {
      tc, total: gradedTotal, pct, byTopic: ta, wrong, textPending,
      strong: ta.filter(t => t.pct >= 70).map(t => TOPIC_LABELS[t.topic]),
      weak: ta.filter(t => t.pct < 50).map(t => TOPIC_LABELS[t.topic])
    };
  }

  function shareScore(r) {
    const topStrong = r.strong[0] || null;
    const topWeak   = r.weak[0]   || null;
    const lines = [
      `I scored ${r.pct}% (${r.tc}/${r.total}) on the AI systems interview prep on GenAI Systems Lab.`,
      topStrong ? `Strong: ${topStrong}.` : null,
      topWeak   ? `Needs work: ${topWeak}.` : null,
      `Can you beat it? → genai-systems-lab-ivory.vercel.app #AIEngineer #MachineLearning`,
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join(" "));
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  }

  function copyResults(r) {
    const lines = [
      "PrepLab Exam Results",
      `Score: ${r.tc}/${r.total} (${r.pct}%)`,
      `Strong: ${r.strong.join(", ") || "–"}`,
      `Needs work: ${r.weak.join(", ") || "–"}`,
      "",
      ...r.byTopic.map(t => `  ${TOPIC_LABELS[t.topic]}: ${t.correct}/${t.total} (${t.pct}%)`),
      "",
      ...r.wrong.map(q => `Q: ${q.question}\n  ${q.type === "mcq" ? `Correct: ${q.options[q.correct]}` : "(open-ended)"}\n  ${q.explanation}`)
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  }

  if (!config) return <ExamConfig onStart={startExam} onExit={onExit} />;

  if (finished) {
    const r = computeResults();
    // Sort topics worst-first
    const sortedTopics = [...r.byTopic].sort((a, b) => a.pct - b.pct);

    // Session comparison delta — read BEFORE current session is saved (useEffect fires after render)
    let sessionDelta = null;
    try {
      const sessions = JSON.parse(localStorage.getItem(EXAM_SESSIONS_KEY) || "[]");
      if (sessions.length > 0) {
        const prior = sessions[sessions.length - 1];
        sessionDelta = r.pct - prior.pct;
      }
    } catch {}

    // Score badge
    const badge = r.pct >= 70
      ? { label: "Strong",      color: "#34d399", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  top: "rgba(16,185,129,0.5)" }
      : r.pct >= 50
      ? { label: "Developing",  color: "#fbbf24", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.3)",  top: "rgba(245,158,11,0.5)" }
      : { label: "Needs Work",  color: "#f87171", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.3)",   top: "rgba(239,68,68,0.5)" };

    // Free-user gating: show only topics from first RESULTS_FREE_LIMIT questions
    const free = !isAccessGranted();
    const gated = free && questions.length > RESULTS_FREE_LIMIT;
    let visibleTopics = sortedTopics;
    if (gated) {
      const first10 = questions.slice(0, RESULTS_FREE_LIMIT);
      const bt10 = {};
      for (const q of first10) {
        if (!bt10[q.topic]) bt10[q.topic] = { correct: 0, total: 0 };
        if (q.type === "text") {
          if (textOverrides[q.id] !== undefined) {
            bt10[q.topic].total++;
            if (textOverrides[q.id]) bt10[q.topic].correct++;
          }
        } else {
          bt10[q.topic].total++;
          if (answers[q.id] === q.correct) bt10[q.topic].correct++;
        }
      }
      visibleTopics = Object.entries(bt10)
        .map(([t, v]) => ({ topic: t, ...v, pct: v.total > 0 ? Math.round(v.correct / v.total * 100) : 0 }))
        .sort((a, b) => a.pct - b.pct);
    }

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        {showGateResults && (
          <GateModal onUnlock={() => setShowGateResults(false)} onClose={() => setShowGateResults(false)} />
        )}
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Header row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button onClick={onExit} className="text-zinc-400 hover:text-zinc-200 text-sm">← Exit</button>
            <div className="flex gap-2">
              <button onClick={() => shareScore(r)}
                className="px-4 py-2 text-sm rounded-lg border transition-all font-medium"
                style={shareCopied
                  ? { background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#86efac" }
                  : { background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
                {shareCopied ? "Copied! ✓" : "Share score"}
              </button>
              <button onClick={() => copyResults(r)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg border border-zinc-700">
                Copy full results
              </button>
            </div>
          </div>

          {/* Score headline */}
          <div style={{
            background: `linear-gradient(160deg, ${badge.bg} 0%, rgba(9,9,11,0.97) 100%)`,
            border: `1px solid ${badge.border}`,
            borderTop: `2px solid ${badge.top}`,
          }} className="rounded-2xl p-5 sm:p-7">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Final Score</p>
            <div className="flex flex-wrap items-baseline gap-3">
              <div className="text-6xl sm:text-7xl font-black tracking-tight" style={{
                background: `linear-gradient(180deg, ${badge.color} 0%, ${badge.color}bb 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{r.pct}%</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg text-zinc-400 font-mono">{r.tc}/{r.total}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                  background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color,
                }}>{badge.label}</span>
                {sessionDelta !== null && (
                  <span className="text-xs font-mono" style={{ color: sessionDelta >= 0 ? "#34d399" : "#f87171" }}>
                    {sessionDelta >= 0 ? "+" : ""}{sessionDelta}% vs last
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Per-topic breakdown — sorted worst-first */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }} className="rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-200 text-sm">Per-Topic Breakdown</h3>
              <span className="text-[10px] font-mono text-zinc-500">worst first</span>
            </div>

            {visibleTopics.map(t => {
              const pointer = t.pct < 60 ? TOPIC_FORWARD_POINTERS[t.topic] : null;
              const barColor = t.pct >= 70 ? "#10b981" : t.pct >= 50 ? "#f59e0b" : "#ef4444";
              const glowColor = t.pct >= 70 ? "rgba(16,185,129,0.5)" : t.pct >= 50 ? "rgba(245,158,11,0.5)" : "rgba(239,68,68,0.5)";
              return (
                <div key={t.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-zinc-300">{TOPIC_LABELS[t.topic]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">{t.correct}/{t.total} ({t.pct}%)</span>
                      {pointer && onNavigate && (
                        <button
                          onClick={() => onNavigate(pointer.tab)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded transition-all hover:brightness-125"
                          style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
                          Go: {pointer.label} →
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(39,39,42,0.9)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${t.pct}%`, background: barColor, boxShadow: `2px 0 8px ${glowColor}` }} />
                  </div>
                </div>
              );
            })}

            {/* Gate overlay for free users with >10q exam */}
            {gated && (
              <div className="relative mt-2 rounded-lg overflow-hidden">
                {/* Blurred placeholder rows */}
                <div className="space-y-3 p-4" style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none" }}>
                  {[55, 40, 70].map((w, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Topic</span>
                        <span className="text-xs font-mono text-zinc-400">? / ? (?%)</span>
                      </div>
                      <div className="w-full rounded-full h-2 bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-zinc-500" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Overlay CTA */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-lg"
                  style={{ background: "linear-gradient(180deg, rgba(9,9,11,0.2) 0%, rgba(9,9,11,0.88) 35%, rgba(9,9,11,0.97) 100%)" }}>
                  <p className="text-sm font-semibold text-zinc-100 mb-1 text-center">
                    You answered {questions.length} questions. Unlock full results.
                  </p>
                  <p className="text-xs text-zinc-500 mb-3 text-center">
                    Free plan shows breakdown for first {RESULTS_FREE_LIMIT} questions only.
                  </p>
                  <button
                    onClick={() => setShowGateResults(true)}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors">
                    Unlock Full Results
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Open answers — self-assess */}
          {r.textPending && r.textPending.length > 0 && (
            <div style={{ background: "linear-gradient(160deg, rgba(99,102,241,0.08) 0%, rgba(15,15,17,0.95) 100%)", border: "1px solid rgba(99,102,241,0.25)", borderTop: "2px solid rgba(99,102,241,0.5)" }} className="rounded-xl p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-zinc-200 mb-1">Open Answers — Self-Assess ({r.textPending.length})</h3>
                <p className="text-xs text-zinc-500">Review your answers against the model. Mark each one yourself — your score updates immediately.</p>
              </div>
              {r.textPending.map(q => (
                <div key={q.id} style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.18)" }} className="rounded-lg p-4 space-y-3">
                  <div className="flex gap-2 items-start">
                    <TopicChip topic={q.topic} />
                    <p className="text-zinc-200 text-sm flex-1 font-medium">{q.question}</p>
                  </div>
                  {answers[q.id] && (
                    <div style={{ background: "rgba(24,24,27,0.8)", border: "1px solid rgba(63,63,70,0.5)" }} className="rounded p-2.5">
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">Your answer</p>
                      <p className="text-zinc-400 text-sm leading-relaxed">{answers[q.id]}</p>
                    </div>
                  )}
                  {q.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider self-center mr-1">Cover:</span>
                      {q.keywords.map(k => (
                        <span key={k} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }} className="text-xs text-indigo-300 px-2 py-0.5 rounded-full">{k}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-zinc-400 text-sm border-t border-zinc-800 pt-2">{q.explanation}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTextOverrides(o => ({ ...o, [q.id]: false }))}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
                      className="py-2 text-red-300 rounded-lg text-sm font-medium hover:brightness-110 transition-all">
                      ✗ Missed it
                    </button>
                    <button
                      onClick={() => setTextOverrides(o => ({ ...o, [q.id]: true }))}
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
                      className="py-2 text-emerald-300 rounded-lg text-sm font-medium hover:brightness-110 transition-all">
                      ✓ Got it
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wrong answers */}
          {r.wrong.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)" }} className="rounded-xl p-5 sm:p-6 space-y-4">
              <h3 className="font-semibold text-zinc-200 text-sm">Wrong Answers ({r.wrong.filter(q => q.type === "mcq").length})</h3>
              {r.wrong.filter(q => q.type === "mcq").map(q => (
                <div key={q.id} className="border border-zinc-800 rounded-lg p-4 space-y-2">
                  <div className="flex gap-2 items-start">
                    <TopicChip topic={q.topic} />
                    <p className="text-zinc-200 text-sm flex-1">{q.question}</p>
                  </div>
                  <p className="text-emerald-400 text-sm">✓ {q.options[q.correct]}</p>
                  <p className="text-zinc-400 text-sm border-t border-zinc-800 pt-2">{q.explanation}</p>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-zinc-800/60 pt-4">
            <FeedbackBar page="preplab/exam" contentType="preplab_session" />
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;
  const answered = Object.keys(answers).length;
  const timerColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-amber-400" : "text-zinc-200";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {showGate && (
        <GateModal
          onUnlock={() => { setShowGate(false); setCurrent(c => c + 1); }}
          onClose={() => setShowGate(false)}
        />
      )}
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-3 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Q{current + 1} of {questions.length}</span>
              <span>{answered} answered</span>
            </div>
            <PBar value={answered} max={questions.length} />
          </div>
          <div className={`text-xl font-mono font-bold ${timerColor} min-w-[4rem] text-right`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <QuestionCard q={q} />
        {q.type === "mcq"
          ? <MCQOptions options={q.options} selected={answers[q.id]} onSelect={i => setAnswers(a => ({ ...a, [q.id]: i }))} />
          : <SpeechTextArea value={answers[q.id] || ""} onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))} rows={6} />
        }
        <div className="flex justify-between items-center pt-2">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-30">← Previous</button>
          {current < questions.length - 1
            ? <button onClick={handleNext} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg">Next →</button>
            : <button onClick={() => { clearInterval(timerRef.current); setFinished(true); }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg font-semibold">Finish Exam</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── MODE 2: TRAINER ──────────────────────────────────────────────────────────

const TRAINER_TOPICS = ["all", ...Array.from(new Set(PREP_QUESTIONS.map(q => q.topic))).sort()];

function TrainerMode({ onExit, onNavigate, onNavigateTo, initialGroup }) {
  const [groupFilter, setGroupFilter] = useState(initialGroup || "all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [questions, setQuestions] = useState(() => shuffle(PREP_QUESTIONS));
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [weakTopics, setWeakTopics] = useState({});
  const [done, setDone] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [showGate, setShowGate] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}"); }
    catch { return {}; }
  });
  const [weakOnly, setWeakOnly] = useState(false);
  const [viewMode, setViewMode] = useState("drill"); // "drill" | "browse"
  const [expandedId, setExpandedId] = useState(null);

  function recordAnswer(questionId, correct) {
    recordHistory(questionId, correct);
    setHistory(prev => {
      const entry = prev[questionId] || { attempts: 0, wrong: 0 };
      return {
        ...prev,
        [questionId]: { attempts: entry.attempts + 1, wrong: entry.wrong + (correct ? 0 : 1) },
      };
    });
  }

  // Recompute filtered+shuffled questions whenever filters change
  useEffect(() => {
    const groupTopics = groupFilter === "all" ? null : TOPIC_GROUPS.find(g => g.id === groupFilter)?.topics;
    const filtered = PREP_QUESTIONS.filter(q => {
      const topicOk = !groupTopics || groupTopics.includes(q.topic);
      const diffOk = diffFilter === "all" || q.difficulty === diffFilter;
      const weakOk = !weakOnly || (history[q.id]?.wrong > 0);
      return topicOk && diffOk && weakOk;
    });
    setQuestions(shuffle(filtered));
    setCurrent(0);
    setAnswer("");
    setSubmitted(false);
    setIsCorrect(false);
    setExpandedId(null);
  }, [groupFilter, diffFilter, weakOnly]);

  // Keyboard shortcuts: 1-4 selects MCQ option; Enter submits or advances
  useEffect(() => {
    function handleKey(e) {
      const q = questions[current];
      if (!q || q.type !== "mcq") return;
      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key) - 1;
        if (!submitted && idx < q.options.length) setAnswer(String(idx));
      }
      if (e.key === "Enter") {
        if (!submitted && answer.toString().trim() !== "") { submit(); }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, questions, submitted, answer]);

  const q = questions[current];

  function submit() {
    if (q.type === "text") {
      // Text questions: don't auto-grade — show self-assess UI, record after user decides
      setIsCorrect(false); setSubmitted(true);
    } else {
      const ok = parseInt(answer) === q.correct;
      setIsCorrect(ok); setSubmitted(true);
      if (!ok) setWeakTopics(wt => ({ ...wt, [q.topic]: (wt[q.topic] || 0) + 1 }));
      setSessionAnswers(sa => [...sa, { q, correct: ok }]);
      recordAnswer(q.id, ok);
    }
  }

  function selfGradePractice(ok) {
    if (!ok) setWeakTopics(wt => ({ ...wt, [q.topic]: (wt[q.topic] || 0) + 1 }));
    setSessionAnswers(sa => [...sa, { q, correct: ok }]);
    recordAnswer(q.id, ok);
  }

  function next() {
    if (current >= questions.length - 1) { setDone(true); return; }
    if (current + 1 >= FREE_QUESTION_LIMIT && !isAccessGranted()) { setShowGate(true); return; }
    setCurrent(c => c + 1); setAnswer(""); setSubmitted(false); setIsCorrect(false);
  }

  if (done) {
    const tc = sessionAnswers.filter(a => a.correct).length;
    const pct = Math.round((tc / sessionAnswers.length) * 100);
    const weakList = Object.entries(weakTopics).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <button onClick={onExit} className="text-zinc-400 hover:text-zinc-200 text-sm">← Exit</button>
          <div
            style={{
              background: pct >= 70 ? "linear-gradient(160deg, rgba(16,185,129,0.12) 0%, rgba(15,15,17,0.97) 100%)" : pct >= 50 ? "linear-gradient(160deg, rgba(245,158,11,0.1) 0%, rgba(15,15,17,0.97) 100%)" : "linear-gradient(160deg, rgba(239,68,68,0.1) 0%, rgba(15,15,17,0.97) 100%)",
              border: pct >= 70 ? "1px solid rgba(16,185,129,0.25)" : pct >= 50 ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(239,68,68,0.25)",
              borderTop: pct >= 70 ? "2px solid rgba(16,185,129,0.5)" : pct >= 50 ? "2px solid rgba(245,158,11,0.5)" : "2px solid rgba(239,68,68,0.5)",
            }}
            className="rounded-2xl p-8 text-center"
          >
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Session Score</p>
            <div className="text-5xl sm:text-7xl font-black mb-2 tracking-tight" style={{ background: pct >= 70 ? "linear-gradient(180deg,#34d399 0%,#10b981 100%)" : pct >= 50 ? "linear-gradient(180deg,#fbbf24 0%,#f59e0b 100%)" : "linear-gradient(180deg,#f87171 0%,#ef4444 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{pct}%</div>
            <p className="text-zinc-400 text-sm">{tc} / {sessionAnswers.length} correct</p>
          </div>
          {weakList.length > 0 && (
            <div className="bg-zinc-900 rounded-xl p-6 border border-amber-500/30">
              <h3 className="font-semibold text-amber-300 mb-3">Weak Areas — Study These Next</h3>
              <div className="flex flex-wrap gap-2 mb-4">{weakList.map(t => <TopicChip key={t} topic={t} />)}</div>
              <ul className="space-y-1">
                {weakList.map(t => (
                  <li key={t} className="text-sm text-zinc-400">
                    • {TOPIC_LABELS[t]}: {weakTopics[t]} wrong answer{weakTopics[t] > 1 ? "s" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={onExit} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      {showGate && (
        <GateModal
          onUnlock={() => { setShowGate(false); setCurrent(c => c + 1); setAnswer(""); setSubmitted(false); setIsCorrect(false); }}
          onClose={() => setShowGate(false)}
        />
      )}
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(39,39,42,0.8)", border: "1px solid rgba(63,63,70,0.7)" }}>
            {["drill", "browse"].map(vm => (
              <button key={vm} onClick={() => setViewMode(vm)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${viewMode === vm ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-white"}`}>
                {vm === "drill" ? "Drill" : "Browse"}
              </button>
            ))}
          </div>
          <span className="text-sm text-zinc-500">
            {viewMode === "drill" ? `${current + 1} / ${questions.length}` : `${questions.length}q`}
          </span>
        </div>
        {viewMode === "drill" && <PBar value={current} max={questions.length} />}
        {/* Filters */}
        <div className="space-y-3">
          {/* Topic group tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setGroupFilter("all")}
              style={groupFilter === "all" ? {
                background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 100%)",
                border: "1px solid rgba(139,92,246,0.5)",
              } : {
                background: "rgba(39,39,42,0.6)",
                border: "1px solid rgba(63,63,70,0.7)",
              }}
              className={`col-span-2 sm:col-span-3 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all text-left ${groupFilter === "all" ? "text-violet-200" : "text-zinc-400 hover:text-white"}`}>
              All Topics — {PREP_QUESTIONS.length} questions
            </button>
            {TOPIC_GROUPS.map(g => {
              const count = PREP_QUESTIONS.filter(q => g.topics.includes(q.topic)).length;
              const active = groupFilter === g.id;
              return (
                <button key={g.id} onClick={() => setGroupFilter(active ? "all" : g.id)}
                  style={active ? {
                    background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 100%)",
                    border: "1px solid rgba(139,92,246,0.5)",
                    boxShadow: "0 2px 8px rgba(139,92,246,0.15)",
                  } : {
                    background: "rgba(39,39,42,0.6)",
                    border: "1px solid rgba(63,63,70,0.7)",
                  }}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all text-left hover:-translate-y-px hover:shadow-md hover:shadow-black/30 ${active ? "text-violet-200" : "text-zinc-300 hover:text-white"}`}>
                  <div className={`font-bold mb-0.5 ${active ? "text-violet-200" : "text-zinc-200"}`}>{g.label}</div>
                  <div className="text-[10px] text-zinc-500 font-normal leading-snug mb-1.5">{g.desc}</div>
                  <div className={`text-[10px] font-mono ${active ? "text-violet-400" : "text-zinc-500"}`}>{count}q</div>
                </button>
              );
            })}
          </div>
          {/* Difficulty + count */}
          <div className="flex items-center gap-2">
            {["all", "medium", "hard"].map(d => {
              const active = diffFilter === d;
              return (
                <button key={d} onClick={() => setDiffFilter(d)}
                  style={active ? {
                    background: "rgba(244,244,245,0.95)",
                    border: "1px solid transparent",
                  } : {
                    background: "rgba(39,39,42,0.8)",
                    border: "1px solid rgba(63,63,70,0.8)",
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${active ? "text-zinc-900" : "text-zinc-400 hover:text-white"}`}>
                  {d === "all" ? "All difficulty" : d}
                </button>
              );
            })}
            <span className="text-xs text-zinc-500 ml-auto">{questions.length} questions</span>
          </div>
          {/* Weak spots toggle */}
          {Object.values(history).some(h => h.wrong > 0) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeakOnly(w => !w)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${weakOnly ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              >
                <span>⚡</span>
                Weak spots ({Object.values(history).filter(h => h.wrong > 0).length})
              </button>
              {weakOnly && (
                <span className="text-xs text-zinc-500">Showing questions you've answered wrong</span>
              )}
              {Object.keys(history).length > 0 && (
                <button
                  onClick={() => { setHistory({}); try { localStorage.removeItem(HISTORY_KEY); } catch {} }}
                  className="text-[10px] text-zinc-500 hover:text-zinc-500 transition-colors ml-auto"
                >
                  Clear history
                </button>
              )}
            </div>
          )}
        </div>
        {questions.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center text-zinc-500 text-sm">
            No questions match these filters. Try a different topic or difficulty.
          </div>
        ) : viewMode === "browse" ? (
          // ── BROWSE MODE ──────────────────────────────────────────────────
          <div className="space-y-1.5">
            {questions.map(bq => {
              const isExp = expandedId === bq.id;
              const diffColor = bq.difficulty === "hard" ? "#ef4444" : bq.difficulty === "medium" ? "#f59e0b" : "#3b82f6";
              const bqGroup = TOPIC_GROUPS.find(g => g.topics.includes(bq.topic))?.id || "all";
              return (
                <div key={bq.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${diffColor}40` }}
                  className="rounded-xl overflow-hidden">
                  {/* Row header — always visible */}
                  <button className="w-full text-left px-4 py-3 flex items-start gap-3"
                    onClick={() => setExpandedId(isExp ? null : bq.id)}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-zinc-200 leading-snug ${!isExp ? "line-clamp-2" : ""}`}>{bq.question}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <TopicChip topic={bq.topic} />
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        bq.difficulty === "hard" ? "bg-red-950/50 text-red-400 border border-red-800/40"
                        : bq.difficulty === "medium" ? "bg-amber-950/50 text-amber-400 border border-amber-800/40"
                        : "bg-blue-950/50 text-blue-400 border border-blue-800/40"
                      }`}>{bq.difficulty[0].toUpperCase()}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className={`text-zinc-600 transition-transform duration-150 ${isExp ? "rotate-180" : ""}`}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </button>
                  {/* Expanded answer */}
                  {isExp && (
                    <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/50">
                      {bq.type === "mcq" ? (
                        <div className="space-y-1.5 pt-3">
                          {bq.options.map((opt, i) => (
                            <div key={i} style={i === bq.correct
                              ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.35)" }
                              : { background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.5)" }}
                              className="flex items-start gap-2.5 px-3 py-2 rounded-lg">
                              <span className={`text-[10px] font-mono font-bold shrink-0 mt-0.5 ${i === bq.correct ? "text-emerald-400" : "text-zinc-500"}`}>{String.fromCharCode(65 + i)}</span>
                              <span className={`text-sm flex-1 ${i === bq.correct ? "text-emerald-300 font-medium" : "text-zinc-400"}`}>{opt}</span>
                              {i === bq.correct && <span className="text-emerald-500 text-xs shrink-0">✓</span>}
                            </div>
                          ))}
                        </div>
                      ) : bq.keywords && bq.keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 items-center pt-3">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mr-1">Key concepts:</span>
                          {bq.keywords.map(k => (
                            <span key={k} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                              className="text-xs text-indigo-300 px-2 py-0.5 rounded-full">{k}</span>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-sm text-zinc-400 leading-relaxed">{bq.explanation}</p>
                      {bq.trap && <CommonTrapCallout trap={bq.trap} />}
                      {bq.source && <p className="text-[10px] text-zinc-500 font-mono">Source: {bq.source}</p>}
                      <button
                        onClick={() => { setGroupFilter(bqGroup); setViewMode("drill"); setExpandedId(null); setCurrent(0); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-125"
                        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
                        Drill this topic →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // ── DRILL MODE ───────────────────────────────────────────────────
          <>
            <div className="relative">
              <QuestionCard q={q} />
              {history[q.id]?.wrong > 0 && (
                <span className="absolute top-2 right-2 text-[10px] text-red-400 font-semibold">
                  ✗ {history[q.id].wrong}× wrong
                </span>
              )}
            </div>
            {!submitted && (
              <>
                {q.type === "mcq"
                  ? <MCQOptions options={q.options} selected={answer === "" ? undefined : parseInt(answer)} onSelect={i => setAnswer(String(i))} />
                  : <SpeechTextArea value={answer} onChange={setAnswer} />
                }
                <button onClick={submit} disabled={answer.toString().trim() === ""}
                  style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)", boxShadow: "0 4px 16px rgba(99,102,241,0.35), 0 1px 0 rgba(255,255,255,0.1) inset" }}
                  className="w-full py-3.5 disabled:opacity-40 text-white font-semibold rounded-xl transition-all hover:brightness-110">
                  Submit Answer
                </button>
              </>
            )}
            {submitted && (
              <RevealCard isCorrect={isCorrect} q={q} onNext={next}
                nextLabel={current >= questions.length - 1 ? "See Results" : "Next Question →"}
                onNavigate={onNavigate} onNavigateTo={onNavigateTo} animKey={current}
                onSelfGrade={selfGradePractice} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── MODE 3: INTERVIEW STRATEGY ──────────────────────────────────────────────

function InterviewPrepMode({ onExit, onNavigate, onNavigateTo }) {
  const [step, setStep] = useState(1);
  const [jdText, setJdText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleType, setRoleType] = useState("");
  const [roundNum, setRoundNum] = useState("1");
  const [interviewerType, setInterviewerType] = useState("tech-lead");
  const [priorFeedback, setPriorFeedback] = useState("");
  const [detectedTopics, setDetectedTopics] = useState([]);
  const [ratings, setRatings] = useState({});
  const [brief, setBrief] = useState(null);
  const [showGate, setShowGate] = useState(false);
  const [copied, setCopied] = useState(false);

  const allRated = detectedTopics.length > 0 && detectedTopics.every(t => ratings[t.key]);

  function analyzeJD() {
    const skills = extractSkills(jdText);
    const sorted = Object.entries(skills)
      .sort((a, b) => b[1].weight - a[1].weight)
      .map(([key, v]) => ({ key, weight: v.weight }));
    setDetectedTopics(sorted);
    setRatings({});
    try { localStorage.setItem("gsl-preplab-strategy-phase", "2"); } catch {}
    setStep(2);
  }

  function generateBrief() {
    const gapRanked = detectedTopics
      .map(t => ({ ...t, rating: ratings[t.key] || "okay", gapScore: t.weight * (DRILL_W[ratings[t.key]] || 1) }))
      .sort((a, b) => b.gapScore - a.gapScore)
      .slice(0, 3);
    return gapRanked.map(({ key, gapScore, rating }) => {
      const topicQs = PREP_QUESTIONS.filter(q => q.topic === key);
      const hardWithTrap = topicQs.find(q => q.difficulty === "hard" && q.trap);
      const hardQ = hardWithTrap || topicQs.find(q => q.difficulty === "hard") || topicQs[0];
      const medQ = topicQs.find(q => q.difficulty === "medium" && q.id !== hardQ?.id) || topicQs.find(q => q.id !== hardQ?.id);
      const res = TOPIC_STUDY_RESOURCES[key];
      const gtPost = res?.gtPosts?.[0] || null;
      const lab = TOPIC_FORWARD_POINTERS[key] || null;
      return { key, gapScore, rating, hardQ, medQ, gtPost, lab };
    });
  }

  function buildBrief() {
    const b = generateBrief();
    setBrief(b);
    try { localStorage.setItem("gsl-preplab-strategy-phase", "4"); } catch {}
    setStep(4);
  }

  function copyBrief() {
    const roleLabels = { "ai-engineer": "AI Engineer", "ml-engineer": "ML Engineer", "ai-pm": "AI PM", "research": "Research Scientist" };
    const lines = [
      `# Interview Brief — ${companyName || "Company"} · ${roleLabels[roleType] || "AI Role"} · Round ${roundNum}`,
      `Date: ${new Date().toLocaleDateString()}`,
      "",
      "## Top 3 Focus Areas",
      "",
    ];
    for (const area of (brief || [])) {
      lines.push(`### ${TOPIC_LABELS[area.key] || area.key}`);
      if (area.hardQ) lines.push(`**Q1 (Hard):** ${area.hardQ.question}`);
      if (area.medQ) lines.push(`**Q2 (Medium):** ${area.medQ.question}`);
      if (area.hardQ?.trap) lines.push(`**Trap to avoid:** ${area.hardQ.trap}`);
      if (area.gtPost) lines.push(`**Read:** ${area.gtPost.title}`);
      lines.push("");
    }
    if (priorFeedback.trim() && roundNum !== "1") {
      lines.push("## Prior Round Feedback");
      lines.push(priorFeedback.trim());
      lines.push("");
    }
    lines.push("## Day-of Checklist");
    lines.push("- [ ] Re-read the 3 focus areas above");
    lines.push("- [ ] Skim the linked GT posts");
    lines.push("- [ ] Prepare a concrete example for each focus area");
    lines.push("- [ ] Review any prior feedback points");
    lines.push("- [ ] Rest — preparation is done");
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // ── Step 4: Interview Brief ───────────────────────────────────────────────────
  if (step === 4) {
    const roleLabels = { "ai-engineer": "AI Engineer", "ml-engineer": "ML Engineer", "ai-pm": "AI PM", "research": "Research Scientist" };
    const roleLabel = roleLabels[roleType] || "AI Role";
    const roundLabel = roundNum === "final" ? "Final Round" : `Round ${roundNum}`;
    const interviewerLabel = { "tech-lead": "Tech Lead", "hiring-manager": "Hiring Manager", "peer": "Peer" }[interviewerType] || interviewerType;
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        {showGate && <GateModal onUnlock={() => setShowGate(false)} onClose={() => setShowGate(false)} />}
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(3)} className="text-zinc-500 hover:text-zinc-300 text-sm">← Back</button>
            <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">Exit</button>
          </div>
          {/* Header card */}
          <div className="rounded-2xl p-5 border"
            style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(8,10,20,0.95) 100%)", borderColor: "rgba(109,40,217,0.25)" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-400 uppercase tracking-widest">Interview Brief</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-3">{companyName || "Your Interview"}</h2>
            <div className="flex flex-wrap gap-2">
              {[roleLabel, roundLabel, interviewerLabel, new Date().toLocaleDateString()].map((chip, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">{chip}</span>
              ))}
            </div>
          </div>
          {/* Gated content */}
          <div className="relative rounded-xl overflow-hidden">
            {!isAccessGranted() && (
              <div className="absolute inset-0 backdrop-blur-sm bg-zinc-950/80 flex flex-col items-center justify-center z-10 gap-3 p-4 rounded-xl">
                <div className="text-xs font-mono text-violet-400 uppercase tracking-widest">Access Required</div>
                <p className="text-xs text-zinc-400 text-center max-w-xs">Unlock your full Interview Brief — top questions, traps to avoid, and GT posts to skim.</p>
                <button onClick={() => setShowGate(true)}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors">
                  Unlock Brief →
                </button>
              </div>
            )}
            <div className={`space-y-3 ${!isAccessGranted() ? "blur-sm pointer-events-none select-none" : ""}`}>
              <h3 className="font-semibold text-zinc-200 text-sm uppercase tracking-wide">Top 3 Focus Areas</h3>
              {(brief || []).map((area, idx) => (
                <div key={area.key} className="rounded-xl border overflow-hidden"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-zinc-800/60">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-400 text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                    <span className="font-semibold text-zinc-200 text-sm">{TOPIC_LABELS[area.key] || area.key}</span>
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border ${
                      area.rating === "weak" ? "bg-red-500/15 border-red-500/30 text-red-400"
                      : area.rating === "okay" ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    }`}>rated {area.rating}</span>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    {area.hardQ && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider">Likely Hard Q</div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{area.hardQ.question}</p>
                      </div>
                    )}
                    {area.medQ && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Likely Medium Q</div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{area.medQ.question}</p>
                      </div>
                    )}
                    {area.hardQ?.trap && (
                      <div className="rounded-lg p-3" style={{ background: "rgba(120,53,15,0.25)", border: "1px solid rgba(180,83,9,0.3)" }}>
                        <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">Trap to avoid</div>
                        <p className="text-xs text-amber-200/80">{area.hardQ.trap}</p>
                      </div>
                    )}
                    {area.gtPost && (
                      <button onClick={() => onNavigateTo({ tab: "groundtruth", postId: area.gtPost.id })}
                        className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                        <span className="px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/25 font-mono text-[9px]">GT</span>
                        {area.gtPost.title}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Prior feedback */}
          {priorFeedback.trim() && roundNum !== "1" && (
            <div className="rounded-xl p-4 border space-y-1.5"
              style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
              <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider">Prior Round Feedback</div>
              <p className="text-xs text-zinc-300 whitespace-pre-wrap">{priorFeedback.trim()}</p>
            </div>
          )}
          {/* Day-of checklist */}
          <div className="rounded-xl p-4 border space-y-2" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Day-of Checklist</div>
            {[
              "Re-read the 3 focus areas above",
              "Skim the linked GT posts",
              "Prepare a concrete example for each focus area",
              "Review any prior feedback points",
              "Rest — preparation is done",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-zinc-600 flex-shrink-0" />
                <span className="text-sm text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={copyBrief}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors border ${
                copied ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-violet-600 hover:bg-violet-500 border-violet-500 text-white"
              }`}>
              {copied ? "Copied!" : "Copy Brief →"}
            </button>
            <button onClick={onExit} className="px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 transition-colors">
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Steps 1–3 ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
          <h2 className="text-xl font-bold">Interview Strategy</h2>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-500"}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-px transition-colors ${step > s ? "bg-violet-600" : "bg-zinc-700"}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>JD + Context</span><span>Role + Round</span><span>Rate Yourself</span>
        </div>

        {/* Step 1: JD + company */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl p-5 border border-zinc-800 space-y-4" style={{ background: "var(--surface)" }}>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Company Name <span className="text-zinc-500 font-normal">(optional)</span></label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Anthropic, Google DeepMind..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Job Description</label>
                <p className="text-xs text-zinc-500 mb-2">Paste the JD — we detect which AI skills it emphasizes for your brief.</p>
                <textarea value={jdText} onChange={e => setJdText(e.target.value)}
                  placeholder="Paste the full job description here..." rows={10}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
            </div>
            <button onClick={analyzeJD} disabled={!jdText.trim()}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
              Analyze JD →
            </button>
          </div>
        )}

        {/* Step 2: Role + Round + Context */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl p-5 border border-zinc-800 space-y-3" style={{ background: "var(--surface)" }}>
              <div>
                <h3 className="font-medium text-zinc-200 mb-0.5">What role are you interviewing for?</h3>
                <p className="text-xs text-zinc-500">Shapes which questions appear in your brief.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "ai-engineer", label: "AI Engineer", desc: "RAG, agents, serving" },
                  { id: "ml-engineer", label: "ML Engineer", desc: "Training, fine-tuning, MLOps" },
                  { id: "ai-pm", label: "AI PM", desc: "Strategy, roadmap, evals" },
                  { id: "research", label: "Research Scientist", desc: "Architecture, reasoning" },
                ].map(rt => (
                  <button key={rt.id} onClick={() => setRoleType(rt.id)}
                    className={`text-left px-3 py-3 rounded-xl border transition-all ${
                      roleType === rt.id
                        ? "border-violet-500/60 bg-violet-500/10 text-white"
                        : "border-zinc-700 hover:border-zinc-600 text-zinc-300"
                    }`}>
                    <div className="font-medium text-sm">{rt.label}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{rt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-5 border border-zinc-800 space-y-4" style={{ background: "var(--surface)" }}>
              <h3 className="font-medium text-zinc-200">Round context</h3>
              <div>
                <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Round Number</label>
                <div className="flex gap-2 flex-wrap">
                  {["1", "2", "3+", "final"].map(r => (
                    <button key={r} onClick={() => setRoundNum(r)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        roundNum === r ? "bg-violet-500/20 border-violet-500/50 text-violet-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}>
                      {r === "final" ? "Final" : `Round ${r}`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Interviewer Type</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: "tech-lead", label: "Tech Lead" },
                    { id: "hiring-manager", label: "Hiring Manager" },
                    { id: "peer", label: "Peer" },
                  ].map(it => (
                    <button key={it.id} onClick={() => setInterviewerType(it.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        interviewerType === it.id ? "bg-violet-500/20 border-violet-500/50 text-violet-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}>
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>
              {roundNum !== "1" && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider">Prior Round Feedback <span className="normal-case text-zinc-500">(optional)</span></label>
                  <textarea value={priorFeedback} onChange={e => setPriorFeedback(e.target.value)}
                    placeholder="e.g. Struggled to articulate trade-offs in system design..."
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 transition-colors">
                Back
              </button>
              <button onClick={() => setStep(3)} disabled={!roleType}
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
                Next: Rate Yourself →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rate topics */}
        {step === 3 && (
          <div className="space-y-4">
            {detectedTopics.length === 0 ? (
              <div className="rounded-xl p-5 border border-zinc-800" style={{ background: "var(--surface)" }}>
                <p className="text-zinc-400 text-sm">No specific skill keywords detected.{" "}
                  <button onClick={() => setStep(1)} className="text-violet-400 hover:text-violet-300">Try a more detailed JD.</button>
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl p-5 border border-zinc-800" style={{ background: "var(--surface)" }}>
                  <h3 className="font-medium text-zinc-200 mb-1">How strong are you in each area?</h3>
                  <p className="text-xs text-zinc-500 mb-4">Weak areas get higher priority in your brief.</p>
                  <div className="divide-y divide-zinc-800">
                    {detectedTopics.map(({ key, weight }) => {
                      const wl = skillWeightLabel(weight);
                      const r = ratings[key];
                      return (
                        <div key={key} className="flex items-center justify-between py-2.5 gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-zinc-200">{TOPIC_LABELS[key] || key}</div>
                            <div className={`text-[10px] flex items-center gap-1 ${wl.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${wl.dot} inline-block`} />
                              {wl.label}
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            {["weak", "okay", "strong"].map(rv => (
                              <button key={rv} onClick={() => setRatings(prev => ({ ...prev, [key]: rv }))}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                                  r === rv
                                    ? rv === "weak"   ? "bg-red-500/20 border-red-500/50 text-red-300"
                                    : rv === "okay"   ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                                      : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                                }`}>
                                {rv.charAt(0).toUpperCase() + rv.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 transition-colors">
                    Back
                  </button>
                  <button onClick={buildBrief} disabled={!allRated}
                    className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors">
                    Build My Brief →
                  </button>
                </div>
                {!allRated && (
                  <p className="text-center text-xs text-zinc-500">Rate all {detectedTopics.length} topics to continue</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODE 3b: WEAKNESS HEATMAP ───────────────────────────────────────────────

function WeaknessHeatmapMode({ onExit }) {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}"); }
    catch { return {}; }
  });
  const [view, setView] = useState("topics");

  const topicStats = {};
  for (const q of PREP_QUESTIONS) {
    const entry = history[q.id];
    if (!entry) continue;
    if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
    topicStats[q.topic].total += entry.attempts;
    topicStats[q.topic].correct += (entry.attempts - entry.wrong);
  }

  const sorted = Object.entries(topicStats)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));

  const hardQs = PREP_QUESTIONS
    .filter(q => (history[q.id]?.wrong || 0) > 0)
    .sort((a, b) => (history[b.id]?.wrong || 0) - (history[a.id]?.wrong || 0))
    .slice(0, 8);

  const totalAttempts = sorted.reduce((s, [, v]) => s + v.total, 0);
  const totalCorrect  = sorted.reduce((s, [, v]) => s + v.correct, 0);
  const overallPct    = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;

  function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
    setHistory({});
  }

  if (totalAttempts === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center max-w-sm mx-auto gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div>
          <div className="text-zinc-200 font-semibold mb-1">No data yet</div>
          <div className="text-zinc-500 text-sm">Answer questions in Trainer or Interview Prep — your per-topic accuracy will appear here.</div>
        </div>
        <button onClick={onExit} className="text-xs text-zinc-500 hover:text-zinc-300 mt-2">← Back</button>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
        <h2 className="text-lg font-bold flex-1 text-white">My Weakness Map</h2>
        <button onClick={clearHistory} className="text-[11px] text-zinc-600 hover:text-red-400 transition-colors">Reset</button>
      </div>
      <div className="flex items-center gap-5 mb-5 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
        <div>
          <div className="text-4xl font-bold text-indigo-400">{overallPct}%</div>
          <div className="text-xs text-zinc-500 mt-0.5">Overall accuracy</div>
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="text-xs text-zinc-400">{totalAttempts} total attempts</div>
          <div className="text-xs text-zinc-400">{totalCorrect} correct · {totalAttempts - totalCorrect} wrong</div>
          <div className="text-xs text-zinc-500">{sorted.length} topics covered</div>
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        {["topics", "questions"].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === v ? "bg-zinc-700 text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"}`}>
            {v === "topics" ? "By Topic" : "Hard Questions"}
          </button>
        ))}
      </div>
      {view === "topics" && (
        <div className="space-y-2.5">
          {sorted.map(([topic, v]) => {
            const pct = v.total > 0 ? Math.round(v.correct / v.total * 100) : 0;
            const barColor  = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
            const textColor = pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400";
            return (
              <div key={topic} className="flex items-center gap-3">
                <div className="w-32 text-xs text-zinc-300 shrink-0 truncate">{TOPIC_LABELS[topic] || topic}</div>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
                </div>
                <div className={`text-xs font-mono w-9 text-right tabular-nums ${textColor}`}>{pct}%</div>
                <div className="text-[10px] text-zinc-600 w-10 text-right tabular-nums">{v.total}q</div>
              </div>
            );
          })}
          <p className="text-xs text-zinc-600 mt-4 pt-4 border-t border-zinc-800">
            Tracks answers from Trainer and Interview Prep. Use Interview Prep Plan to target your red topics.
          </p>
        </div>
      )}
      {view === "questions" && (
        <div className="space-y-2">
          {hardQs.length === 0
            ? <p className="text-zinc-500 text-sm">No wrong answers on record yet.</p>
            : hardQs.map(q => {
                const entry = history[q.id];
                const wrongPct = entry ? Math.round(entry.wrong / entry.attempts * 100) : 0;
                return (
                  <div key={q.id} className="bg-zinc-900 rounded-lg p-3.5 border border-zinc-800">
                    <div className="flex items-start gap-2.5">
                      <span className={`shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded border mt-0.5 ${TOPIC_COLORS[q.topic] || ""}`}>
                        {TOPIC_LABELS[q.topic] || q.topic}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-300 leading-snug line-clamp-2">{q.question}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-mono text-red-400">{entry?.wrong}x</div>
                        <div className="text-[10px] text-zinc-600">{wrongPct}% wrong</div>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}
    </div>
  );
}

// ─── MODE 4: COMPANY PREP ─────────────────────────────────────────────────────

const TOPIC_WEIGHT_LABELS = {
  rag: "RAG & Retrieval", agents: "Agents & Tools", evals: "Evals",
  latency: "Serving & Latency", fine_tuning: "Fine-Tuning",
  safety: "Safety", mlops: "MLOps", multimodal: "Multimodal",
};

const COMPANY_ARCHETYPES = [
  {
    id: "bigtech",
    icon: "🏢",
    label: "Big Tech AI",
    companies: ["Google DeepMind", "Meta AI", "Amazon AI", "Apple ML"],
    color: "indigo",
    topicWeights: { rag: 3, agents: 3, evals: 4, latency: 3, fine_tuning: 2, safety: 3, mlops: 4, multimodal: 2 },
    traits: ["Scale-first thinking", "Infra ownership", "Distributed systems depth", "Eval culture"],
    sysDesignPrompts: [
      "Design Google Search's AI answer layer — how do you avoid hallucination at 8B queries/day?",
      "Build Meta's content moderation pipeline for a billion-user platform using LLMs.",
      "Design Amazon Alexa's next-gen reasoning layer — latency < 200 ms, runs on-device + cloud hybrid.",
      "Apple wants on-device LLM inference for Siri. Design the model serving and fallback architecture.",
    ],
    mustKnow: ["RLHF at scale", "Distributed training orchestration", "Eval harness design", "Latency SLOs", "Feature stores"],
    gtRecs: [
      { id: "the-eval-crisis", title: "The Eval Crisis" },
      { id: "why-your-rag-system-lies", title: "Why Your RAG System Lies" },
    ],
  },
  {
    id: "ainative",
    icon: "🚀",
    label: "AI-Native Startups",
    companies: ["Anthropic", "OpenAI", "Perplexity", "Cursor"],
    color: "emerald",
    topicWeights: { rag: 4, agents: 4, evals: 5, safety: 5, latency: 3, fine_tuning: 3, mlops: 2, multimodal: 2 },
    traits: ["Safety-aware reasoning", "Agentic system design", "Eval obsession", "Research ↔ product bridge"],
    sysDesignPrompts: [
      "Design Anthropic's Constitutional AI feedback loop — how does RLAIF scale beyond human labelers?",
      "Build Perplexity's answer engine: real-time retrieval + citation grounding + < 3 s TTFT.",
      "Design Cursor's code agent: context management across 100k-token repos, edit diffing, rollback.",
      "OpenAI needs a plugin/tool orchestration layer for GPT-5 that handles 1M parallel agent sessions.",
    ],
    mustKnow: ["Constitutional AI / RLAIF", "Agentic loops & tool use", "Evals as product quality signal", "MCP / function calling", "Streaming UX"],
    gtRecs: [
      { id: "langgraph-reducers-hitl", title: "LangGraph Reducers and HITL" },
      { id: "agent-memory-architecture", title: "Agent Memory Architecture" },
      { id: "the-eval-crisis", title: "The Eval Crisis" },
    ],
  },
  {
    id: "indiantech",
    icon: "🇮🇳",
    label: "Indian Tech",
    companies: ["Flipkart", "Swiggy", "Zepto", "Razorpay"],
    color: "orange",
    topicWeights: { rag: 3, agents: 2, evals: 2, latency: 5, fine_tuning: 3, safety: 1, mlops: 4, multimodal: 2 },
    traits: ["Cost efficiency", "Low-latency at scale", "Hindi/regional language NLP", "Mobile-first constraints"],
    sysDesignPrompts: [
      "Flipkart: Build a product search + recommendation system that works across 500M SKUs with multilingual queries.",
      "Swiggy: Design an ETA prediction system using LLM reasoning over real-time GPS + historical data.",
      "Zepto: Build an LLM-powered ops assistant that reduces support tickets using conversation history.",
      "Razorpay: Design a fraud detection system using LLM reasoning over transaction graphs.",
    ],
    mustKnow: ["Multilingual embeddings", "Cost-optimized inference", "MLOps on tight budgets", "Real-time feature pipelines", "Fine-tuning for domain adaptation"],
    gtRecs: [
      { id: "ds-to-ai-engineer", title: "The DS to AI Engineer Arc" },
      { id: "graph-rag-multi-hop", title: "Graph RAG: When Vector Search Isn't Enough" },
    ],
  },
  {
    id: "enterprise",
    icon: "🏦",
    label: "Enterprise AI",
    companies: ["McKinsey QuantumBlack", "Accenture AI", "Deloitte AI", "IBM watsonx"],
    color: "violet",
    topicWeights: { rag: 5, agents: 3, evals: 3, latency: 2, fine_tuning: 2, safety: 4, mlops: 3, multimodal: 1 },
    traits: ["Governance & compliance", "Private deployment", "Client communication", "ROI framing"],
    sysDesignPrompts: [
      "A bank wants to deploy an LLM for internal policy Q&A. Design the RAG system with access control and audit trail.",
      "McKinsey client: Replace a 200-person analyst team with an AI research synthesis pipeline. Design it.",
      "Accenture: Build an enterprise AI governance layer — model cards, drift detection, bias auditing.",
      "IBM: Design a private LLM deployment for a pharmaceutical company with HIPAA/GDPR constraints.",
    ],
    mustKnow: ["Private RAG with access control", "Model governance & audit logs", "On-prem/VPC deployment", "Prompt injection defenses", "Explainability requirements"],
    gtRecs: [
      { id: "why-your-rag-system-lies", title: "Why Your RAG System Lies" },
      { id: "hooks-vs-llm-safety", title: "AI Safety Engineering and LLM Hooks" },
    ],
  },
];

function CompanyPrepMode({ onExit, onNavigate }) {
  const [gated, setGated] = useState(() => !isAccessGranted());
  const [archetype, setArchetype] = useState(null);
  const [view, setView] = useState("overview");
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [sessionQs, setSessionQs] = useState([]);

  if (gated) {
    return (
      <GateModal
        onUnlock={() => setGated(false)}
        onClose={onExit}
      />
    );
  }

  function startQuestions(arc) {
    const wt = arc.topicWeights;
    let pool = [];
    for (const q of PREP_QUESTIONS) {
      const w = wt[q.topic] || 0;
      for (let i = 0; i < w; i++) pool.push(q);
    }
    const seen = new Set(); const uniq = [];
    for (const q of shuffle(pool)) {
      if (!seen.has(q.id)) { seen.add(q.id); uniq.push(q); }
      if (uniq.length >= 15) break;
    }
    setSessionQs(uniq);
    setQIdx(0); setAnswer(""); setRevealed(false); setScore({ correct: 0, total: 0 }); setDone(false);
    setView("questions");
  }

  if (!archetype) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pt-4">
            <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Back</button>
            <div>
              <h1 className="text-2xl font-bold">Company Prep Tracks</h1>
              <p className="text-zinc-500 text-sm">Questions + system design prompts weighted to each archetype</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMPANY_ARCHETYPES.map(arc => (
              <div key={arc.id} onClick={() => setArchetype(arc)}
                className={`bg-zinc-900 border border-${arc.color}-500/30 hover:border-${arc.color}-400/60 rounded-2xl p-5 cursor-pointer transition-all`}>
                <div className="text-3xl mb-3">{arc.icon}</div>
                <h3 className="font-bold text-lg mb-1">{arc.label}</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {arc.companies.map(c => (
                    <span key={c} className={`text-xs px-2 py-0.5 rounded-full bg-${arc.color}-900/40 text-${arc.color}-300 border border-${arc.color}-500/20`}>{c}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {arc.traits.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "overview") {
    const maxW = Math.max(...Object.values(archetype.topicWeights));
    const sortedWeights = Object.entries(archetype.topicWeights).filter(([,w]) => w > 0).sort((a,b) => b[1]-a[1]);
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pt-4">
            <button onClick={() => setArchetype(null)} className="text-zinc-500 hover:text-zinc-300 text-sm">← Archetypes</button>
            <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm ml-auto">Exit</button>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-700 space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{archetype.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{archetype.label}</h2>
                <p className="text-zinc-500 text-sm">{archetype.companies.join(" · ")}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">Must-Know Topics</h3>
              <ul className="space-y-1">
                {archetype.mustKnow.map(k => (
                  <li key={k} className="flex items-start gap-2 text-sm text-zinc-300"><span className="text-green-400 mt-0.5">✓</span>{k}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Topic Focus</h3>
              <div className="space-y-2">
                {sortedWeights.map(([topic, weight]) => (
                  <div key={topic} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 w-32 shrink-0">{TOPIC_WEIGHT_LABELS[topic] || topic}</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full bg-${archetype.color}-500`}
                        style={{ width: `${(weight/maxW)*100}%` }} />
                    </div>
                    <span className="text-xs text-zinc-500 w-14 text-right shrink-0">
                      {weight === maxW ? "critical" : weight >= maxW*0.7 ? "high" : "medium"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {archetype.gtRecs && archetype.gtRecs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">Ground Truth reading</h3>
                <div className="space-y-1">
                  {archetype.gtRecs.map(rec => (
                    <button key={rec.id}
                      onClick={() => onNavigate && onNavigate({ tab: "groundtruth", postId: rec.id })}
                      className="block text-sm text-violet-400 hover:text-violet-300 transition-colors py-0.5">
                      → {rec.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 flex-wrap pt-1">
              <button onClick={() => startQuestions(archetype)}
                className={`px-5 py-2.5 rounded-xl bg-${archetype.color}-600 hover:bg-${archetype.color}-500 text-white font-semibold text-sm transition-colors`}>
                Practice Questions (15)
              </button>
              <button onClick={() => setView("sysdesign")}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-colors">
                System Design Prompts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "sysdesign") {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex items-center gap-3 pt-4">
            <button onClick={() => setView("overview")} className="text-zinc-500 hover:text-zinc-300 text-sm">← Overview</button>
          </div>
          <h2 className="text-xl font-bold">{archetype.icon} {archetype.label} — System Design Prompts</h2>
          <p className="text-zinc-500 text-sm">Use these as 30–45 min design challenges. Focus on: scope → components → tradeoffs → failure modes.</p>
          {archetype.sysDesignPrompts.map((prompt, i) => (
            <div key={i} className={`bg-zinc-900 border border-${archetype.color}-500/20 rounded-xl p-5`}>
              <div className="flex items-start gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded bg-${archetype.color}-900/50 text-${archetype.color}-300 mt-0.5 shrink-0`}>Q{i+1}</span>
                <p className="text-zinc-200 leading-relaxed text-sm">{prompt}</p>
              </div>
              <div className="mt-3 pl-8">
                <p className="text-xs text-zinc-500">Consider: scale, latency, cost, failure modes, observability</p>
              </div>
            </div>
          ))}
          <button onClick={() => startQuestions(archetype)}
            className={`w-full py-3 rounded-xl bg-${archetype.color}-700 hover:bg-${archetype.color}-600 text-white font-semibold text-sm transition-colors`}>
            Practice Questions Next →
          </button>
        </div>
      </div>
    );
  }

  if (view === "questions") {
    if (done) {
      const pct = Math.round((score.correct / score.total) * 100);
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 border border-zinc-700 text-center space-y-4">
            <div className="text-5xl">{archetype.icon}</div>
            <h2 className="text-2xl font-bold">{archetype.label} Session Complete</h2>
            <p className="text-zinc-400">{score.correct} / {score.total} correct</p>
            <div className={`text-3xl font-black ${pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400"}`}>{pct}%</div>
            {archetype.gtRecs && archetype.gtRecs.length > 0 && (
              <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 text-left">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-2">Read next</p>
                {archetype.gtRecs.map(rec => (
                  <button key={rec.id}
                    onClick={() => onNavigate && onNavigate({ tab: "groundtruth", postId: rec.id })}
                    className="block w-full text-left text-sm text-violet-400 hover:text-violet-300 py-0.5 transition-colors">
                    → {rec.title}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => startQuestions(archetype)} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm">Retry</button>
              <button onClick={() => setView("sysdesign")} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm">System Design</button>
              <button onClick={() => setArchetype(null)} className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-sm">Change Archetype</button>
            </div>
          </div>
        </div>
      );
    }

    const q = sessionQs[qIdx];
    if (!q) return null;
    const correctOpt = q.type === "mcq" ? q.options[q.correct] : null;
    const isCorrect = revealed && q.type === "mcq" && answer === correctOpt;

    function submit() {
      if (q.type === "mcq") {
        setScore(s => ({ correct: s.correct + (answer === correctOpt ? 1 : 0), total: s.total + 1 }));
      }
      setRevealed(true);
    }

    function selfGrade(correct) {
      setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      if (qIdx + 1 >= sessionQs.length) { setDone(true); return; }
      setQIdx(i => i + 1); setAnswer(""); setRevealed(false);
    }

    function next() {
      if (qIdx + 1 >= sessionQs.length) { setDone(true); return; }
      setQIdx(i => i + 1); setAnswer(""); setRevealed(false);
    }

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between pt-4">
            <button onClick={onExit} className="text-zinc-500 hover:text-zinc-300 text-sm">← Exit</button>
            <span className="text-xs text-zinc-500">{archetype.icon} {archetype.label} · Q{qIdx+1}/{sessionQs.length} · {score.correct} correct</span>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${TOPIC_COLORS[q.topic]}`}>{TOPIC_LABELS[q.topic]}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">{q.difficulty}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">{q.type === "mcq" ? "MCQ" : "Open"}</span>
            </div>
            <p className="text-zinc-100 font-medium leading-relaxed mb-4">{q.question}</p>

            {q.type === "mcq" ? (
              <div className="grid grid-cols-1 gap-2">
                {q.options.map(opt => {
                  let cls = "w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ";
                  if (!revealed) cls += answer === opt ? "border-violet-500 bg-violet-900/20 text-violet-200" : "border-zinc-700 bg-zinc-800 hover:border-zinc-500 text-zinc-300";
                  else if (opt === correctOpt) cls += "border-emerald-500 bg-emerald-900/30 text-emerald-200";
                  else if (opt === answer && opt !== correctOpt) cls += "border-red-500 bg-red-900/30 text-red-300";
                  else cls += "border-zinc-800 bg-zinc-900 text-zinc-500";
                  return (
                    <button key={opt} disabled={revealed} onClick={() => setAnswer(opt)} className={cls}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                disabled={revealed}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 text-sm resize-none focus:outline-none focus:border-zinc-500 disabled:opacity-60"
                placeholder="Sketch your answer..."
              />
            )}

            {!revealed && (
              <button onClick={submit} disabled={q.type === "mcq" && !answer}
                className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors">
                {q.type === "text" ? "Show Answer" : "Submit"}
              </button>
            )}

            {revealed && q.type === "mcq" && (
              <div className={`mt-4 p-4 rounded-xl border ${isCorrect ? "border-emerald-700 bg-emerald-900/20" : "border-red-700 bg-red-900/20"}`}>
                <p className={`text-sm font-semibold mb-1 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>{isCorrect ? "✓ Correct" : "✗ Incorrect"}</p>
                <p className="text-zinc-300 text-sm">{q.explanation}</p>
                {q.trap && (
                  <div className="mt-2 p-3 rounded-lg bg-amber-950/40 border border-amber-800/50">
                    <p className="text-xs text-amber-400 font-semibold">Common trap</p>
                    <p className="text-xs text-amber-300 mt-0.5">{q.trap}</p>
                  </div>
                )}
                <button onClick={next} className="mt-3 px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm">
                  {qIdx + 1 >= sessionQs.length ? "See Results" : "Next →"}
                </button>
              </div>
            )}

            {revealed && q.type === "text" && (
              <div className="mt-4 p-4 rounded-xl border border-zinc-600 bg-zinc-800/40 space-y-3">
                <div>
                  <p className="text-xs text-zinc-400 font-semibold mb-1">Model answer</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{q.explanation}</p>
                </div>
                {q.keywords && q.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1.5">Key terms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {q.keywords.map(k => (
                        <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 border border-zinc-600">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
                {q.trap && (
                  <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50">
                    <p className="text-xs text-amber-400 font-semibold">Common trap</p>
                    <p className="text-xs text-amber-300 mt-0.5">{q.trap}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-zinc-500 mb-2">How did you do?</p>
                  <div className="flex gap-2">
                    <button onClick={() => selfGrade(true)}
                      className="flex-1 py-2 rounded-xl bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm font-semibold hover:bg-emerald-900/60 transition-colors">
                      ✓ Got it
                    </button>
                    <button onClick={() => selfGrade(false)}
                      className="flex-1 py-2 rounded-xl bg-red-900/40 border border-red-700 text-red-300 text-sm font-semibold hover:bg-red-900/60 transition-colors">
                      ✗ Missed it
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}


// ─── DEFENSE DOC MODE ─────────────────────────────────────────────────────────

const DD_DOMAINS = [
  { id:"rag",       label:"RAG & Retrieval",           color:"#3b82f6", keywords:["rag","retrieval","vector","embedding","chunk","rerank","hybrid search","faiss","pinecone","weaviate","langchain","llama index"] },
  { id:"agents",    label:"Agent Systems",              color:"#8b5cf6", keywords:["agent","tool call","langgraph","crewai","autogen","react","planning","orchestrat","multi-agent","agentic"] },
  { id:"eval",      label:"Evals & Quality",            color:"#10b981", keywords:["eval","benchmark","metric","ragas","hallucin","faithfulness","precision","recall","judge","test","quality"] },
  { id:"infra",     label:"Infra & Deployment",         color:"#f59e0b", keywords:["vllm","triton","kubernetes","docker","latency","throughput","serving","deploy","scale","gpu","inference"] },
  { id:"finetune",  label:"Fine-tuning & Alignment",    color:"#ef4444", keywords:["fine-tun","lora","qlora","sft","dpo","rlhf","grpo","alignment","peft","adapter","train"] },
  { id:"safety",    label:"Safety & Red Teaming",       color:"#f97316", keywords:["safety","guardrail","red team","jailbreak","injection","constitutional","responsible","bias","harm"] },
  { id:"multimodal",label:"Multimodal",                 color:"#38bdf8", keywords:["multimodal","vision","image","clip","vit","audio","video","ocr","document"] },
  { id:"pm",        label:"Product & Strategy",         color:"#a78bfa", keywords:["product","roadmap","stakeholder","strategy","prd","okr","metric","business","user research","launch"] },
];

function detectDomains(jd) {
  const lower = jd.toLowerCase();
  return DD_DOMAINS.map(d => ({
    ...d,
    hits: d.keywords.filter(kw => lower.includes(kw)).length,
  })).sort((a, b) => b.hits - a.hits);
}

const DD_CHEATSHEETS = {
  rag: ["Choose chunk size based on query granularity, not document structure","Hybrid search (BM25 + dense) beats pure dense retrieval on most enterprise corpora","Reranking with a cross-encoder adds ~40ms but +15% precision","RAGAS metrics: faithfulness, answer relevancy, context precision, context recall","Production failure: stale retrieval from nightly-only ingestion"],
  agents: ["Step budget + timeout on every agent — no unbounded loops","Idempotent tools: every tool call must be safe to retry","Confirmation gate before any write/delete action","LangGraph: stateful nodes + conditional edges; Temporal: durable execution across failures","Production failure: tool confabulation — model invents tool args that look valid but fail silently"],
  eval: ["Offline eval before every deploy; online eval (shadow + A/B) after","LLM-as-judge: GPT-4o-mini grades 10x cheaper than human for 0.8 correlation","RAGAS for RAG; trajectory efficiency + tool precision for agents","Never move a metric from eval to SLA without 2 weeks of calibration","Production failure: evaluation dataset leaking into fine-tuning data"],
  infra: ["vLLM continuous batching: 10x throughput vs naive serving","KV cache: the only optimization that gets cheaper as context grows","Speculative decoding: 2-3x speedup for low-entropy outputs (code, structured)","Auto-scale on queue depth, not CPU — LLM workload is bursty","Production failure: cold-start latency from model loading on first request"],
  finetune: ["SFT first, always — DPO requires a decent base model","QLoRA: 4-bit quantized base + 16-bit adapters = 70B fits on 2xA100","DPO over RLHF for general chat; GRPO for verifiable rewards (math, code)","Eval on held-out task distribution, not training distribution","Production failure: catastrophic forgetting when SFT dataset lacks diversity"],
  safety: ["Input guardrails + output guardrails — dual-stage, not either/or","Many-shot jailbreaks are now the hardest attack surface","Constitutional AI: model critiques its own outputs before serving","NeMo Guardrails / Lakera Guard for production — don't roll your own","Production failure: indirect prompt injection via retrieved documents"],
  multimodal: ["Image tokens are expensive: GPT-4o charges ~170 tokens per 512px tile","ColPali: visual document retrieval without OCR — query against page images directly","CLIP retrieval for image search; cross-encoder rerank for precision","Lost-in-middle applies to image context too — put key images early or late","Production failure: spatial reasoning and object counting degrade sharply on real-world images"],
  pm: ["AI features ship with eval criteria, not just acceptance criteria","Model tier decision = latency SLA x quality floor x cost ceiling","Shadow mode before A/B — validate quality before splitting real traffic","Leading metric: task completion rate. Lagging metric: user retention at D30","Production failure: 'good enough' eval threshold set from demo, not representative sample"],
};

const DD_MUSTKNOW = {
  rag: ["What is RAG and why it beats pure parametric memory","Chunking: fixed vs semantic vs hierarchical","Dense vs sparse vs hybrid retrieval","Embedding models: dimensions, latency, cost tradeoffs","Reranking: when to add a cross-encoder step","RAGAS: the 4 core metrics and what they catch","Context overflow: what happens when retrieved docs exceed context window","Production ingestion: chunking → embedding → upsert → staleness detection"],
  agents: ["ReAct loop: Reason + Act + Observe cycle","Tool design: why idempotency matters for retry safety","LangGraph vs plain LangChain: when stateful graph execution is worth it","Memory types: in-context vs episodic vs semantic vs external","Multi-agent patterns: supervisor, peer-to-peer, specialized subagents","Step budget and timeout: how to prevent infinite loops","Human-in-the-loop: 4 patterns (confirmation, escalation, checkpoint, ambiguity)","MCP: what it solves and how it differs from function calling"],
  eval: ["Offline vs online eval: what each catches","LLM-as-judge: how to prompt it, correlation with human labels","RAGAS: faithfulness, answer relevancy, context precision, context recall","Trajectory efficiency for agents: steps taken vs optimal path","Eval dataset construction: distribution matching, contamination prevention","Regression detection: how to catch silent quality degradation","Calibration: why your pass threshold matters as much as your metric","Evaluation pyramid: unit → integration → end-to-end → user study"],
  infra: ["Continuous batching: how vLLM achieves high GPU utilization","KV cache: what it stores, why prefix caching saves money","Speculative decoding: drafter + verifier, when it helps","Quantization: GPTQ/AWQ (GPU), GGUF (CPU) — quality-latency tradeoffs","TTFT vs TPS vs P99 latency: what each signals about your system","Auto-scaling: why queue depth beats CPU for LLM workloads","Cold start: model loading latency and how to mitigate with warm pools","GPU memory math: model weights + KV cache + activations = VRAM budget"],
  finetune: ["When NOT to fine-tune: prompt engineering + RAG often cheaper","SFT: supervised fine-tuning on demonstrations — always first step","LoRA: low-rank decomposition, why rank matters, what r=8 means","QLoRA: 4-bit quantization + LoRA — fits large models on small hardware","DPO: direct preference optimization — simpler than RLHF, no reward model","GRPO: group relative policy optimization — for verifiable reward tasks","Eval during training: perplexity is not your task metric","Merging adapters: why you merge before serving, not at inference time"],
  safety: ["Prompt injection: direct vs indirect, how attackers embed instructions","Jailbreaks: roleplay, many-shot, context manipulation — attack surface is large","Input guardrails: before LLM; output guardrails: before user — dual-stage","Hallucination: types (intrinsic vs extrinsic), detection, mitigation","Constitutional AI: self-critique loop before final response","Red teaming: manual, automated fuzzing, adversarial benchmarks","PII: detection in inputs AND outputs — different tools for each","Logging for audit: what to store, retention policy, GDPR implications"],
  multimodal: ["Image tokenization: tile-based, token count scales with resolution","CLIP: contrastive image-text pretraining, zero-shot retrieval","Vision Transformers: patch embeddings, no convolutional inductive bias","Multimodal RAG: 4 approaches — late fusion, CLIP retrieval, ColPali, captioning","Failure modes: counting, spatial reasoning, small text, chart misread","Context assembly: where to put images relative to text for best recall","ColPali: query page images directly, no OCR required","Cost math: image tokens dominate in vision-heavy workloads"],
  pm: ["Metric hierarchy: task completion → quality → satisfaction → retention","Shadow mode: validate AI output quality before splitting real traffic","Eval criteria in PRD, not just acceptance criteria — ship with observability","Model tier decision framework: latency SLA x quality floor x cost ceiling","AI feature rollback: how to revert safely when quality regresses","Human-in-the-loop design: when to ask, when to act, when to explain","Cold start problem: AI features need warm-up data — plan the bootstrapping","Leading vs lagging indicators: what to watch daily vs weekly vs monthly"],
};

const DD_STAR = {
  rag: ["Tell me about a time you improved retrieval quality in a production system","Describe a retrieval failure that reached users — how did you detect and fix it","Walk me through how you'd design a RAG system for [domain in JD]"],
  agents: ["Tell me about a time an agent you built behaved unexpectedly in production","Describe how you'd architect a multi-agent system for [use case in JD]","Walk me through a time you had to add reliability controls to an agentic system"],
  eval: ["Tell me about an eval framework you built from scratch — what surprised you","Describe a time your offline eval missed something that production caught","Walk me through how you'd set quality gates for a new LLM feature"],
  infra: ["Tell me about a latency problem in an LLM system — how you found and fixed it","Describe a cost optimization you did on an inference system — numbers","Walk me through how you'd scale an LLM API to 10x current traffic"],
  finetune: ["Tell me about a fine-tuning project — what worked, what didn't","Describe how you chose between fine-tuning and prompt engineering for a task","Walk me through a dataset curation decision that significantly affected model quality"],
  safety: ["Tell me about a time you caught a safety issue before it reached users","Describe how you'd red team a new AI feature before launch","Walk me through your approach to evaluating a model for production safety"],
  multimodal: ["Tell me about a multimodal AI feature you built — technical decisions","Describe a failure mode unique to vision inputs that you encountered","Walk me through how you'd design a document understanding pipeline"],
  pm: ["Tell me about an AI product decision that required a difficult tradeoff","Describe how you measured success for an AI feature after launch","Walk me through how you'd prioritize an AI product roadmap with limited LLM budget"],
};

const DD_GOTCHAS = {
  rag: ["Chunk size feels like a hyperparameter but it's really a design decision — wrong size invalidates your entire retrieval strategy","Freshness is not free: nightly re-ingestion misses same-day updates that users expect to see","Hybrid search alpha (BM25 weight vs dense weight) needs tuning per query type — no universal default","Reranking with a cross-encoder adds latency that compounds badly under load — budget for it early"],
  agents: ["Every tool call is a latency multiplier — a 5-step agent with 500ms tools takes 2.5s minimum","Scope creep is the most underrated agent failure: it completes adjacent tasks you didn't ask for","No step budget = no production readiness — a loop that runs forever looks identical to one that takes 30 seconds","Context accumulates: long agent runs hit context limits you never hit in unit tests"],
  eval: ["A metric that can't detect regressions is theater — calibrate before you ship","LLM-as-judge is biased toward longer, more verbose outputs — control for length","Eval datasets go stale: the distribution your model was measured on drifts from what users actually ask","The eval you run on demo data will always look better than the eval you run on production data"],
  infra: ["vLLM's continuous batching only helps at sustained load — if you have bursty traffic, you still need auto-scaling","KV cache hit rate drops to zero on every cold restart — warm-up your prefix cache after deploys","Quantization changes output distribution subtly — A/B test quality after switching, don't assume parity","GPU memory OOM at inference is harder to debug than training OOM because it's load-dependent"],
  finetune: ["SFT on 1000 bad examples beats SFT on 100 good examples — data quality is everything","DPO requires preference pairs where the chosen response is clearly better — noisy pairs hurt","Eval perplexity drops during training while task performance plateaus — don't use perplexity as a proxy for quality","Merging failure: adapter trained on one base model version rarely transfers cleanly to another version"],
  safety: ["Defense-in-depth is not optional: in 2026, 80-94% of jailbreak attempts succeed on proprietary models with single-layer defenses","Indirect prompt injection (attacker embeds instructions in retrieved documents) is harder to defend than direct injection","Output guardrails catch things input guardrails miss — you need both","Logging for safety is a feature, not an afterthought — you can't investigate an incident without traces"],
  multimodal: ["Image token cost scales quadratically with resolution — a 1024px image costs 4x a 512px image","ColPali sounds magical but needs GPU for the visual encoder at query time — budget for it","Spatial reasoning failures are silent: the model gives a confident wrong answer with no hedging","Document understanding degrades sharply on scanned PDFs — always test with production-quality scans, not demo PDFs"],
  pm: ["'The model is good enough' is not an eval criterion — define what good enough means in measurable terms before building","AI features require ongoing maintenance: model providers change APIs, pricing, and behavior with no notice","A/B testing AI features is harder than normal features: effects compound and contaminate over long windows","Your most important metric is the one you didn't think to measure until month 3 — define a metric review cadence upfront"],
};

const DD_QUESTIONS = {
  rag: ["What does your current retrieval pipeline look like — what's the biggest quality gap?","How do you handle document freshness — is there a staleness problem today?","What's the eval suite for retrieval quality — and what's the failure rate in production?","How do you handle multi-hop questions that need information from multiple documents?","What's the bottleneck in your RAG stack today — retrieval quality, generation, or latency?"],
  agents: ["How autonomous are your agents today — where do humans stay in the loop?","What's the longest-running agent task in production — how do you handle failures mid-run?","How do you evaluate agent trajectory quality beyond final output?","What's the biggest reliability problem with your agentic system right now?","How do you handle tool call failures — retry logic, fallback, escalation?"],
  eval: ["What does your eval pipeline look like — offline, online, or both?","How do you detect quality regressions between model versions?","Is LLM-as-judge part of your eval stack — how do you trust the judge?","What's the eval metric you trust most and the one you're most uncertain about?","How often does your eval dataset get refreshed — how do you prevent staleness?"],
  infra: ["What's your current P99 latency and where does most of that time go?","How do you handle traffic spikes — what's the auto-scaling strategy?","Are you running your own inference stack or using managed APIs — what drove that decision?","What's the GPU cost per 1M tokens today — and what's the target?","How do you handle model updates — blue/green, canary, or full swap?"],
  finetune: ["What's the training data pipeline — how do you ensure quality at scale?","How do you know when fine-tuning is working — what's the eval signal?","Are you doing SFT, DPO, RLHF, or some combination — what drove that choice?","How do you handle catastrophic forgetting across fine-tuning iterations?","What's the iteration cycle time from data to deployed model — and what's the bottleneck?"],
  safety: ["What's your current red teaming process — manual, automated, or both?","How do you handle prompt injection in user-provided inputs?","What's logged for safety audit — and who reviews it?","How do you decide what content policies to enforce vs. defer to the user?","What's the incident response process when a safety issue reaches users?"],
  multimodal: ["What modalities are you processing today — and what's next on the roadmap?","How do you handle image quality variance in production inputs?","What's the token cost for your average image-heavy request?","How do you eval multimodal outputs — human review, automated, or both?","What's the most surprising failure mode you've seen with vision inputs in production?"],
  pm: ["How does the team currently decide what to build with AI vs. without?","What does the eval process look like before an AI feature ships?","How do you measure success for AI features post-launch — what's the north star metric?","What's the biggest gap between what AI can do and what users expect it to do?","How does AI infrastructure investment get prioritized against product features?"],
};

const DD_PRIORITY_LABELS = { must: "Must Know", well: "Know Well", aware: "Be Aware Of" };
const DD_PRIORITY_COLORS = {
  must:  { badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",   row: "bg-rose-500/5" },
  well:  { badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", row: "bg-amber-500/5" },
  aware: { badge: "bg-zinc-700/40 text-zinc-400 border-zinc-600/30",    row: "" },
};

function priorityTier(hits) {
  if (hits >= 3) return "must";
  if (hits >= 1) return "well";
  return "aware";
}

const DD_TAB_IDS = ["priority","design","mustknow","star","gotchas"];
const DD_TAB_LABELS = { priority:"Topic Priorities", design:"System Design", mustknow:"Must-Know 8", star:"STAR Starters", gotchas:"Gotchas & Questions" };

function DefenseDocMode({ onExit }) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [activeSection, setActiveSection] = useState("priority");

  function generate() {
    if (jd.trim().length < 50) return;
    const scored = detectDomains(jd);
    const top = scored[0];
    const cheatsheet = DD_CHEATSHEETS[top.id] || DD_CHEATSHEETS.rag;
    const mustknow   = DD_MUSTKNOW[top.id]    || DD_MUSTKNOW.rag;
    const stars      = DD_STAR[top.id]         || DD_STAR.rag;
    const gotchas    = DD_GOTCHAS[top.id]      || DD_GOTCHAS.rag;
    const questions  = DD_QUESTIONS[top.id]    || DD_QUESTIONS.rag;
    setResult({ scored, top, cheatsheet, mustknow, stars, gotchas, questions });
    setActiveSection("priority");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">🛡 Defense Doc</h2>
            <p className="text-zinc-400 text-sm">Interview War Room Brief</p>
          </div>
        </div>

        {/* JD Input */}
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-4">
          <label className="block text-sm font-medium text-zinc-300">Paste the Job Description</label>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            rows={8}
            placeholder="Paste the full job description here (at least 50 characters)..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">{jd.trim().length} characters</span>
            <button
              onClick={generate}
              disabled={jd.trim().length < 50}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Generate War Room Brief
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">

            {/* Top Domain Banner */}
            <div
              className="rounded-2xl p-4 border flex items-center gap-4"
              style={{ borderColor: result.top.color + "60", backgroundColor: result.top.color + "10" }}
            >
              <div className="text-3xl">🎯</div>
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-0.5">Primary Domain Detected</p>
                <p className="font-bold text-lg" style={{ color: result.top.color }}>{result.top.label}</p>
                <p className="text-xs text-zinc-500">{result.top.hits} keyword{result.top.hits !== 1 ? "s" : ""} matched · All sections tailored to this domain</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 flex-wrap">
              {DD_TAB_IDS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSection(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    activeSection === tab
                      ? "bg-rose-600 border-rose-500 text-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {DD_TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab: Priority Table */}
            {activeSection === "priority" && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-zinc-100">Topic Priority Table</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Ranked by keyword density in your JD</p>
                </div>
                <div className="divide-y divide-zinc-800">
                  {result.scored.map(domain => {
                    const tier = priorityTier(domain.hits);
                    const colors = DD_PRIORITY_COLORS[tier];
                    return (
                      <div key={domain.id} className={`flex items-center justify-between px-5 py-3 ${colors.row}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: domain.color }} />
                          <span className="text-sm text-zinc-200">{domain.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500">{domain.hits} hit{domain.hits !== 1 ? "s" : ""}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${colors.badge}`}>
                            {DD_PRIORITY_LABELS[tier]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: System Design Cheat Sheet */}
            {activeSection === "design" && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-zinc-100">System Design Cheat Sheet</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Tailored to {result.top.label}</p>
                </div>
                <ul className="divide-y divide-zinc-800">
                  {result.cheatsheet.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                      <span className="text-rose-400 font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <span className="text-sm text-zinc-200 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab: Must-Know 8 */}
            {activeSection === "mustknow" && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-zinc-100">8 Must-Know Concepts Cold</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Non-negotiables for this role — know these without hesitation</p>
                </div>
                <ol className="divide-y divide-zinc-800">
                  {result.mustknow.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: result.top.color + "25", color: result.top.color }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-200 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tab: STAR Starters */}
            {activeSection === "star" && (
              <div className="space-y-3">
                <div className="px-1">
                  <h3 className="font-semibold text-zinc-100">3 STAR Story Starters</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Behavioral prompts matched to your detected focus area</p>
                </div>
                {result.stars.map((starter, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-start gap-4"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: result.top.color + "25", color: result.top.color }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200 leading-relaxed font-medium">"{starter}"</p>
                      <p className="text-xs text-zinc-500 mt-2">Prepare a 2-min STAR response: Situation → Task → Action → Result</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Gotchas + Questions */}
            {activeSection === "gotchas" && (
              <div className="space-y-4">
                {/* Gotchas */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-zinc-100">Production Gotchas</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Hard-won lessons for the {result.top.label} domain</p>
                  </div>
                  <ul className="divide-y divide-zinc-800">
                    {result.gotchas.map((g, i) => (
                      <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                        <span className="text-amber-400 text-sm flex-shrink-0 mt-0.5">⚠</span>
                        <span className="text-sm text-zinc-200 leading-relaxed">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Questions */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-zinc-100">5 Questions to Ask the Interviewer</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Tailored to the {result.top.label} domain</p>
                  </div>
                  <ol className="divide-y divide-zinc-800">
                    {result.questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                        <span className="text-emerald-400 font-bold text-sm flex-shrink-0 mt-0.5">Q{i + 1}</span>
                        <span className="text-sm text-zinc-200 leading-relaxed">{q}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}


// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

const MODE_CARDS = [
  {
    id: "exam", icon: "⏱", title: "Combined Assessment", subtitle: "Timed Exam",
    description: "Timed 15–60 min exam with configurable focus and difficulty. All scores hidden until the end. Animated results reveal with per-topic breakdown.",
    border: "border-indigo-500/40 hover:border-indigo-400", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
  },
  {
    id: "trainer", icon: "🎯", title: "Trainer", subtitle: "Immediate Feedback",
    description: "Answer questions one by one with instant color-coded reveal, explanation, and reading links. Tracks weak topics and recommends what to study next.",
    border: "border-emerald-500/40 hover:border-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  },
  {
    id: "jdprep", icon: "📋", title: "JD + Resume Prep", subtitle: "Targeted Session", gated: true,
    description: "Paste a job description to detect skill requirements. Optionally paste your resume for gap analysis. Get a 20-question drill weighted to your gaps.",
    border: "border-violet-500/40 hover:border-violet-400", badge: "bg-violet-500/20 text-violet-300 border-violet-500/30"
  },
  {
    id: "companyprep", icon: "🏢", title: "Company Prep Tracks", subtitle: "Archetype Targeting",
    description: "4 company archetypes: Big Tech AI, AI-native startups, Indian tech, Enterprise AI. Weighted question sets + company-specific system design challenges.",
    border: "border-amber-500/40 hover:border-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  {
    id: "defense", icon: "🛡", title: "Defense Doc", subtitle: "Interview War Room",
    description: "Paste a job description. Get your personalized pre-interview brief: topic priorities, system design cheat sheet, must-know concepts, STAR story starters, and questions to ask.",
    border: "border-rose-500/40 hover:border-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30"
  }
];

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export default function PrepLab({ onNavigate, onNavigateTo, initialMode, onClearInitialMode }) {
  const [mode, setMode] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [sidebarStats, setSidebarStats] = useState({});
  const [trainerInitGroup, setTrainerInitGroup] = useState("all");

  function selectMode(id) {
    setMode(id);
    setMobileSidebarOpen(false);
  }

  function openTrainer(groupId = "all") {
    setTrainerInitGroup(groupId);
    selectMode("trainer");
  }

  function exitMode() {
    setMode(null);
    setMobileSidebarOpen(true);
  }

  // Auto-select mode when navigated here from an external forward pointer (e.g. RAG Lab TYU)
  useEffect(() => {
    if (initialMode) {
      selectMode(initialMode);
      if (onClearInitialMode) onClearInitialMode();
    }
  }, [initialMode]);

  // Sidebar stat badges — sourced from localStorage, shown only for returning users
  useEffect(() => {
    try {
      const stats = {};
      // Assess: last session score from gsl-preplab-history
      const hist = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
      const entries = Object.values(hist);
      if (entries.length > 0) {
        const correct = entries.filter(e => e.attempts > 0 && e.wrong === 0).length;
        const pct = Math.round((correct / entries.length) * 100);
        stats.exam = `${entries.length} answered · ${pct}% correct`;
      }
      // Interview Strategy: phase progress
      const stratPhase = localStorage.getItem("gsl-preplab-strategy-phase");
      if (stratPhase && parseInt(stratPhase) > 1) {
        stats.jdprep = `In progress: Phase ${stratPhase}`;
      }
      setSidebarStats(stats);
    } catch {}
  }, []);

  // 3 modes: Defense Doc and Weakness Map components are kept but hidden from sidebar
  const PREPLAB_SIDEBAR = [
    { id: "exam",        label: "Assess",             tag: "EXAM",      desc: "Test yourself cold. Leave knowing your gaps." },
    { id: "jdprep",      label: "Interview Strategy", tag: "STRATEGY",  desc: "JD → gap score → day-by-day plan." },
    { id: "companyprep", label: "Company Tracks",     tag: "ARCHETYPE", desc: "By company archetype" },
  ];

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <div className={`${mobileSidebarOpen ? "flex" : "hidden"} flex-col w-full lg:flex lg:w-52 lg:shrink-0 overflow-y-auto py-3`} style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
        <div className="px-4 py-1 text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">MODES</div>
        {PREPLAB_SIDEBAR.map(m => {
          const active = mode === m.id;
          return (
            <button key={m.id} onClick={() => selectMode(m.id)}
              className={`w-full text-left px-4 py-2.5 transition-all flex flex-col gap-0.5 ${active ? "border-l-2 border-violet-500 bg-zinc-800/80" : "border-l-2 border-transparent hover:bg-zinc-900"}`}>
              <span className={`text-xs font-semibold leading-snug ${active ? "text-white" : "text-zinc-300"}`}>{m.label}</span>
              <span className={`text-[10px] font-mono ${active ? "text-violet-400" : "text-zinc-500"}`}>{m.tag}</span>
              {sidebarStats[m.id] && (
                <span className="text-[10px] text-zinc-500 leading-snug mt-0.5">{sidebarStats[m.id]}</span>
              )}
            </button>
          );
        })}
        <div className="mt-4 px-4 py-2 border-t border-zinc-800">
          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">QUESTIONS</div>
          <div className="text-xs text-zinc-500">{PREP_QUESTIONS.length} across 8 topics</div>
        </div>
      </div>

      {/* Right panel */}
      <div className={`${mobileSidebarOpen ? "hidden" : "flex"} flex-col lg:flex flex-1 min-w-0 overflow-y-auto`}>
        {/* Mobile back button */}
        <button onClick={() => setMobileSidebarOpen(true)}
          className="flex lg:hidden items-center gap-1.5 px-4 py-3 text-xs text-zinc-400 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          PrepLab
        </button>
        {mode === "exam"        && <ExamMode onExit={exitMode} onNavigate={onNavigate} onNavigateTo={onNavigateTo} />}
        {mode === "trainer"     && <TrainerMode onExit={exitMode} onNavigate={onNavigate} onNavigateTo={onNavigateTo} initialGroup={trainerInitGroup} />}
        {mode === "jdprep"      && <InterviewPrepMode onExit={exitMode} onNavigate={onNavigate} onNavigateTo={onNavigateTo} />}
        {mode === "companyprep" && <CompanyPrepMode onExit={exitMode} onNavigate={onNavigate} />}
        {mode === "defense"     && <DefenseDocMode onExit={exitMode} />}
        {mode === "heatmap"     && <WeaknessHeatmapMode onExit={exitMode} />}
        {!mode && (
          <div className="p-5 sm:p-7 space-y-6 overflow-y-auto">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-black text-white tracking-tight mb-1">PrepLab</div>
                <div className="text-sm text-zinc-400">Production-level questions from real AI engineering interview loops.</div>
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>{PREP_QUESTIONS.filter(q=>q.difficulty==="easy").length}E</span>
                <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" }}>{PREP_QUESTIONS.filter(q=>q.difficulty==="medium").length}M</span>
                <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>{PREP_QUESTIONS.filter(q=>q.difficulty==="hard").length}H</span>
              </div>
            </div>

            {/* Mode cards — 3-up horizontal grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PREPLAB_SIDEBAR.map((m, i) => {
                const colors = ["#6366f1","#8b5cf6","#3b82f6"];
                const c = colors[i] || "#6366f1";
                return (
                  <button key={m.id} onClick={() => selectMode(m.id)}
                    style={{ background: `linear-gradient(160deg, ${c}0d 0%, rgba(15,15,17,0.9) 100%)`, border: `1px solid ${c}30`, borderLeft: `3px solid ${c}70` }}
                    className="text-left p-4 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 transition-all duration-150">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-white">{m.label}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ background: `${c}18`, border: `1px solid ${c}40`, color: c }}>{m.tag}</span>
                    </div>
                    <div className="text-xs text-zinc-500 leading-relaxed">{m.desc}</div>
                    {sidebarStats[m.id] && (
                      <div className="text-[10px] text-zinc-600 mt-2 font-mono">{sidebarStats[m.id]}</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Browse by topic — fills the blank space, provides discoverability */}
            <div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Browse by Topic</div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {TOPIC_GROUPS.map(g => {
                  const count = PREP_QUESTIONS.filter(q => g.topics.includes(q.topic)).length;
                  return (
                    <button key={g.id} onClick={() => openTrainer(g.id)}
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      className="text-left p-4 rounded-xl hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/30 transition-all duration-150">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-zinc-100 leading-snug">{g.label}</span>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0 mt-0.5">{count}q</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{g.desc}</div>
                    </button>
                  );
                })}
                {/* "All questions" tile */}
                <button onClick={() => openTrainer("all")}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  className="text-left p-4 rounded-xl hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/30 transition-all duration-150">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-zinc-100 leading-snug">All Questions</span>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0 mt-0.5">{PREP_QUESTIONS.length}q</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 leading-relaxed">Full bank, shuffled. No filter.</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
