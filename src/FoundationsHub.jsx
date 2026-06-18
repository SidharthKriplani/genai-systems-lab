import { useState } from "react";
import { track } from "./analytics";
import { getAreaReadiness } from "./readiness";
import { TradeoffCard } from "./shared";

const TRADEOFF = {
  title: "When do you need to touch the model?",
  options: [
    {
      name: "Prompt it",
      tagline: "System prompt + few-shot examples.",
      when: "The task is general, your examples fit in context, and you're prototyping. This is the right starting point for 90% of use cases.",
      color: "#22c55e",
      dims: [
        { label: "Data needed",    value: 1 },
        { label: "Compute cost",   value: 1 },
        { label: "Deploy speed",   value: 3 },
        { label: "Behaviour ctrl", value: 1 },
      ],
    },
    {
      name: "Fine-tune it",
      tagline: "Supervised training on labelled examples.",
      when: "You need consistent output format, domain-specific style, or to remove unwanted behaviours — not to inject new factual knowledge.",
      color: "#a78bfa",
      dims: [
        { label: "Data needed",    value: 2 },
        { label: "Compute cost",   value: 2 },
        { label: "Deploy speed",   value: 2 },
        { label: "Behaviour ctrl", value: 3 },
      ],
    },
    {
      name: "Pretrain it",
      tagline: "Train from scratch on your corpus.",
      when: "Existing models fundamentally lack your domain (e.g. novel language, proprietary code dialect). Requires massive data and budget. Rare.",
      color: "#f59e0b",
      dims: [
        { label: "Data needed",    value: 3 },
        { label: "Compute cost",   value: 3 },
        { label: "Deploy speed",   value: 1 },
        { label: "Behaviour ctrl", value: 3 },
      ],
    },
  ],
};

const CONCEPTS = [
  { id: "tokenizer",      label: "Tokenizer",       fidelity: "✓ Faithful",  fidelityColor: "#22c55e", desc: "How text becomes tokens — BPE, vocabulary, and why tokenization shapes everything downstream.", gymId: "language-models" },
  { id: "attention",      label: "Attention",        fidelity: "~ Simplified", fidelityColor: "#f59e0b", desc: "Query, Key, Value matrices explained. Why multi-head attention sees different things at once.", gymId: "language-models" },
  { id: "training-signal",label: "Training Signal",  fidelity: "~ Simplified", fidelityColor: "#f59e0b", desc: "What the model actually optimises for during pretraining — and how this creates alignment gaps.", gymId: "foundation-models" },
  { id: "lora",           label: "LoRA / Fine-tuning","fidelity": "~ Simplified", fidelityColor: "#f59e0b", desc: "How LoRA freezes original weights and trains low-rank adapters — 99% fewer parameters, competitive quality.", gymId: "foundation-models" },
];

const GT_POSTS = [
  { id: "what-is-a-transformer",    title: "What Is a Transformer? Self-Attention Explained Without the Math", desc: "Why every LLM is built on the same core idea — and what attention actually computes, step by step.", readMin: 8, tag: "Architecture" },
  { id: "decoding-sampling",        title: "Temperature, Top-P, Top-K: How LLMs Actually Choose the Next Word", desc: "Greedy, beam search, nucleus sampling — what each does, when randomness helps, why temperature 0 isn't always right.", readMin: 7, tag: "Inference" },
  { id: "fine-tuning-vs-rag",       title: "Fine-Tuning vs. RAG vs. Prompt Engineering: When to Use What", desc: "The decision framework every AI engineer needs. Cost, latency, data requirements, and failure modes for each.", readMin: 10, tag: "Decision" },
  { id: "prompting-token-economics",title: "Prompt Engineering & Token Economics", desc: "How prompt structure affects quality, why few-shot beats zero-shot in most cases, and how to calculate real inference cost.", readMin: 9, tag: "Prompting" },
  { id: "bert-internals-explained", title: "BERT Internals: MLM, WordPiece, [CLS] Token, and Why It Fails for Semantic Similarity", desc: "BERT's masked language modeling, WordPiece tokenization, the [CLS] pooling trap, and what SBERT does differently.", readMin: 10, tag: "NLP" },
  { id: "encoder-decoder-architecture", title: "Encoder-Decoder Architecture: T5, BART, Cross-Attention, and When to Use It", desc: "T5's text-to-text unification, BART's denoising pretraining, cross-attention mechanics, and the practical decision vs. decoder-only.", readMin: 10, tag: "Architecture" },
];

const PREPLAB_Qs = [
  { id: "ft-2",     difficulty: "Easy",   diffColor: "#22c55e", gated: true,  question: "LoRA fine-tuning works by:" },
  { id: "bert-1",   difficulty: "Medium", diffColor: "#f59e0b", gated: false, question: "A team extracts [CLS] token embeddings from vanilla BERT for semantic search. Results are poor. Root cause?" },
  { id: "encdec-1", difficulty: "Medium", diffColor: "#f59e0b", gated: false, question: "Key architectural advantage of T5 (encoder-decoder) vs. decoder-only for structured seq2seq tasks?" },
  { id: "ft-3",     difficulty: "Medium", diffColor: "#f59e0b", gated: true,  question: "DPO (Direct Preference Optimization) differs from RLHF in that:" },
  { id: "ft-1",     difficulty: "Hard",   diffColor: "#ef4444", gated: true,  question: "You fine-tune a model on 10,000 customer support examples. Benchmark accuracy improves but production CSAT drops. Most likely cause?" },
];

function getProgress() {
  try {
    const history = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
    const mastery = JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]");
    const ftQs    = Object.keys(history).filter(k => k.startsWith("ft") || k.startsWith("finetuning")).length;
    const ftOk    = Object.keys(history).filter(k => (k.startsWith("ft") || k.startsWith("finetuning")) && history[k]?.correct).length;
    const conceptsDone = mastery.filter(id => ["tokenizer","attention","training-signal","lora"].includes(id)).length;
    return { ftQs, ftOk, conceptsDone };
  } catch { return { ftQs: 0, ftOk: 0, conceptsDone: 0 }; }
}

function SectionLabel({ children }) {
  return <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{children}</p>;
}

export default function FoundationsHub({ onNavigate, onNavigateTo }) {
  const [progress]  = useState(getProgress);
  const [readiness] = useState(() => getAreaReadiness("foundations"));
  const COLOR = "#3b82f6";

  function goGT(postId) { track("foundations_hub_gt", { postId }); if (onNavigateTo) onNavigateTo({ tab: "groundtruth", postId }); else onNavigate("groundtruth"); }
  function goConcepts(gymId) { track("foundations_hub_concepts", { gymId }); if (onNavigateTo) onNavigateTo({ tab: "concepts", gymId }); else onNavigate("concepts"); }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">

      {/* Intro */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: COLOR }}>Foundations</div>
          {readiness && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: readiness.color, borderColor: readiness.color + "40", background: readiness.color + "12" }}>{readiness.level} · {readiness.pct}%</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">Why does it behave this way?</h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          Attention, tokenization, training dynamics, fine-tuning — understanding what's actually happening inside the model is what separates engineers who debug from engineers who guess. You don't need to build foundation models. You need to understand them well enough to make confident architectural decisions and answer the "why" questions in interviews.
        </p>
      </div>

      {/* Two labs */}
      <div>
        <SectionLabel>The Labs</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => { track("foundations_hub_fm_lab", {}); onNavigate("foundationlab"); }}
            className="text-left rounded-2xl p-5 transition-all card-lift"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderTop: `2px solid ${COLOR}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black text-white">Foundation Models Lab</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: COLOR }}>6 scenarios</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">Configure training runs, watch failure modes — LoRA rank collapse, learning rate explosion, eval contamination, objective mismatch. See why fine-tuning fails before you ship it.</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["LoRA rank", "Learning rate", "Catastrophic forgetting", "Eval contamination"].map(f => (
                <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{f}</span>
              ))}
            </div>
            <span className="text-sm font-bold" style={{ color: COLOR }}>Open FM Lab →</span>
          </button>

          <button onClick={() => { track("foundations_hub_prompt_lab", {}); onNavigate("promptlab"); }}
            className="text-left rounded-2xl p-5 transition-all card-lift"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderTop: "2px solid #8b5cf6" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-black text-white">Prompt Lab</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">6 scenarios</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">Prompt regression testing, injection attacks, few-shot contamination, structured output failures — prompts as engineering artifacts, not magic incantations.</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Regression testing", "Injection", "Few-shot design", "Output schemas"].map(f => (
                <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{f}</span>
              ))}
            </div>
            <span className="text-sm font-bold text-violet-400">Open Prompt Lab →</span>
          </button>
        </div>
      </div>

      {/* Tradeoff */}
      <div>
        <SectionLabel>When to use what</SectionLabel>
        <TradeoffCard data={TRADEOFF} />
      </div>

      {/* Concepts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Key Concepts</SectionLabel>
          <button onClick={() => goConcepts("foundation-models")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All Concepts →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONCEPTS.map(c => (
            <button key={c.id} onClick={() => goConcepts(c.gymId)}
              className="text-left p-4 rounded-xl transition-all card-lift"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-white">{c.label}</span>
                <span className="text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded" style={{ color: c.fidelityColor, background: c.fidelityColor + "15", border: `1px solid ${c.fidelityColor}30` }}>{c.fidelity}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
              <span className="mt-2 text-[11px] font-bold text-violet-400 block">Open in Concepts →</span>
            </button>
          ))}
        </div>
      </div>

      {/* GT */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>From the Field</SectionLabel>
          <button onClick={() => onNavigate("groundtruth")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All GT posts →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GT_POSTS.map(p => (
            <button key={p.id} onClick={() => goGT(p.id)}
              className="text-left p-4 rounded-xl transition-all card-lift"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">{p.tag}</span>
                <span className="text-[9px] font-mono text-zinc-500">{p.readMin} min</span>
              </div>
              <p className="text-sm font-bold text-white leading-snug mb-1">{p.title}</p>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{p.desc}</p>
              <span className="mt-2 text-[11px] font-bold text-violet-400 block">Read →</span>
            </button>
          ))}
        </div>
      </div>

      {/* PrepLab */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Test Your Judgment</SectionLabel>
          <button onClick={() => { track("foundations_hub_preplab_all", {}); onNavigate("preplab"); }} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All foundations questions →</button>
        </div>
        <div className="space-y-3">
          {PREPLAB_Qs.map(q => (
            <div key={q.id} className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ color: q.diffColor, borderColor: q.diffColor + "40", background: q.diffColor + "10" }}>{q.difficulty}</span>
                {q.gated && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500">Access code</span>}
              </div>
              <p className="text-sm text-zinc-200 leading-snug mb-3">{q.question}</p>
              <button onClick={() => { track("foundations_hub_q", { id: q.id }); onNavigate("preplab"); }} className="text-[11px] font-bold hover:opacity-80" style={{ color: COLOR }}>Answer in PrepLab →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      {(progress.ftQs > 0 || progress.conceptsDone > 0) && (
        <div>
          <SectionLabel>Your Progress Here</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.ftQs}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Questions done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.conceptsDone}<span className="text-zinc-500 text-sm font-normal">/4</span></div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Concepts done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.ftQs > 0 ? Math.round(progress.ftOk / progress.ftQs * 100) + "%" : "–"}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
