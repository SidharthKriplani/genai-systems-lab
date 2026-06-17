import { useState } from "react";
import { track } from "./analytics";
import { getAreaReadiness } from "./readiness";

const CONCEPTS = [
  { id: "llm-as-judge", label: "LLM as Judge", fidelity: "~ Simplified", fidelityColor: "#f59e0b", desc: "How to use an LLM to grade other LLM outputs — biases, calibration, and when not to trust it.", gymId: "evaluation" },
  { id: "eval-design",  label: "Eval Design",  fidelity: "~ Simplified", fidelityColor: "#f59e0b", desc: "Building eval suites that catch production failures — golden sets, adversarial examples, distribution sampling.", gymId: "evaluation" },
  { id: "eval-loop",    label: "Eval Loop",    fidelity: "~ Simplified", fidelityColor: "#f59e0b", desc: "The offline → staging → online eval cycle. Where each stage catches failures the others miss.", gymId: "evaluation" },
  { id: "debug",        label: "Debug Evals",  fidelity: "~ Simplified", fidelityColor: "#f59e0b", desc: "Diagnosing 5 common eval failure modes — from metric gaming to distribution mismatch.", gymId: "evaluation" },
];

const GT_POSTS = [
  { id: "llm-evaluation-guide",    title: "How to Evaluate LLM Systems: RAGAS, G-Eval, and Custom Grading", desc: "What groundedness, faithfulness, and citation accuracy actually measure — and how to build an eval pipeline that catches real failures.", readMin: 11, tag: "Core" },
  { id: "eval-pipeline-design",    title: "Building an Eval Pipeline That Actually Catches Production Failures", desc: "Why unit tests aren't enough for LLMs. Offline evals, online evals, and shadow evaluation.", readMin: 10, tag: "Pipeline" },
  { id: "hallucination-detection", title: "Hallucination Detection: Why It's Hard and What Actually Works", desc: "Factual vs. faithfulness vs. citation hallucinations. NLI-based detection, self-consistency, retrieval grounding.", readMin: 9, tag: "Failure mode" },
  { id: "ab-testing-llms",         title: "A/B Testing LLM Systems: Statistical Significance and Evaluation Metrics", desc: "How to run controlled experiments on LLM outputs — win-rate, NDCG, preference — and avoid common A/B traps.", readMin: 9, tag: "Experimentation" },
  { id: "llm-as-judge-failure",    title: "LLM-as-Judge: The Four Biases Your Evaluator Won't Tell You About", desc: "Self-preference, verbosity, position, and style biases that make LLM judges systematically misleading — and how to correct them.", readMin: 9, tag: "Bias" },
  { id: "ragas-metrics-explained", title: "RAGAS Metrics Explained: What They Measure, What They Miss, and When They Lie", desc: "Faithfulness, answer relevancy, context precision, context recall — what each score actually captures and where each one breaks down.", readMin: 9, tag: "Metrics" },
  { id: "eval-production-gap",     title: "The Offline-Production Eval Gap: Why 91% RAGAS Doesn't Mean 91% User Satisfaction", desc: "Offline evals measure what you designed them to measure. Production measures what users actually care about. The gap is where products break.", readMin: 9, tag: "Production" },
  { id: "human-eval-vs-llm-eval",       title: "Human Eval vs. LLM Eval: When to Use Each and How to Make Both Work", desc: "Why human eval is the gold standard, when automated eval is sufficient, and how to calibrate automated judges against human signal.", readMin: 8, tag: "Method" },
  { id: "ndcg-mrr-from-scratch",        title: "NDCG and MRR From Scratch: The Ranking Metrics Every AI Engineer Needs", desc: "Why accuracy is the wrong metric for search. MRR for single-answer queries, DCG for graded relevance, NDCG for cross-query comparison.", readMin: 10, tag: "Metrics" },
  { id: "calibration-ece-from-scratch", title: "Model Calibration and ECE: When 90% Confidence Means 70% Accuracy", desc: "ECE from scratch, reliability diagrams, Platt scaling, and temperature scaling. Why calibrate on a separate held-out set.", readMin: 11, tag: "Calibration" },
  { id: "annotation-inter-annotator-agreement", title: "Inter-Annotator Agreement: Why Low IAA Is a Model Problem", desc: "Cohen's Kappa, Krippendorff's Alpha, and annotation pipeline design. If annotators disagree 30% of the time, your model's ceiling is below 70%.", readMin: 10, tag: "Annotation" },
  { id: "eval-flywheel-implicit-feedback", title: "The Eval Flywheel: From Implicit Feedback to Continuous Model Improvement", desc: "How clicks and dwell time become training signal. Position bias, IPS debiasing, and the loop connecting user behavior to retraining.", readMin: 11, tag: "Production" },
  { id: "llm-judge-calibration",        title: "LLM-as-Judge Calibration, Bias Modes, and When to Trust It", desc: "Position, verbosity, and self-consistency bias. A structured rubric, measuring judge-human agreement, the cross-family judging rule.", readMin: 10, tag: "Bias" },
  { id: "counterfactual-offline-eval",  title: "Counterfactual Offline Evaluation: IPS and Doubly Robust Estimators", desc: "The logging policy bias problem. IPS and the Doubly Robust estimator from scratch. When to log propensities at serving time.", readMin: 11, tag: "Offline eval" },
];

const PREPLAB_Qs = [
  { id: "eval-8",        difficulty: "Easy",   diffColor: "#22c55e", gated: true,  question: "RAGAS framework evaluates RAG systems on which 4 dimensions?" },
  { id: "calib-1",       difficulty: "Easy",   diffColor: "#22c55e", gated: false, question: "A clinical risk model outputs confidence 0.85 and is well-calibrated. What does this mean?" },
  { id: "rankmetric-1",  difficulty: "Easy",   diffColor: "#22c55e", gated: false, question: "For a QA system where each query has exactly one correct answer, which metric is most appropriate?" },
  { id: "iaa-1",         difficulty: "Easy",   diffColor: "#22c55e", gated: false, question: "Two annotators agree on 80% of items in a 90% negative dataset. Why is raw agreement misleading?" },
  { id: "eval-1",        difficulty: "Medium", diffColor: "#f59e0b", gated: true,  question: "You are evaluating a RAG system. ROUGE-L score is 0.71 but users report factual errors 40% of the time. Best explanation?" },
  { id: "calib-2",       difficulty: "Medium", diffColor: "#f59e0b", gated: true,  question: "Temperature scaling with T > 1 applied to a classifier's logits — what is the effect?" },
  { id: "judge-1",       difficulty: "Medium", diffColor: "#f59e0b", gated: false, question: "An LLM judge consistently prefers whichever response appears first in pairwise comparison. Fix?" },
  { id: "ips-1",         difficulty: "Medium", diffColor: "#f59e0b", gated: false, question: "Training directly on raw click counts teaches the model what systematic bias?" },
  { id: "judge-4",       difficulty: "Hard",   diffColor: "#ef4444", gated: true,  question: "Before deploying an LLM judge at scale, how do you calibrate it and what threshold do you use?" },
  { id: "ips-4",         difficulty: "Hard",   diffColor: "#ef4444", gated: true,  question: "Explain the Doubly Robust estimator for offline policy evaluation. What does 'doubly robust' mean?" },
];

function getProgress() {
  try {
    const history = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
    const mastery = JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]");
    const evalQs  = Object.keys(history).filter(k => k.startsWith("eval")).length;
    const evalOk  = Object.keys(history).filter(k => k.startsWith("eval") && history[k]?.correct).length;
    const conceptsDone = mastery.filter(id => ["llm-as-judge","eval-design","eval-loop","debug"].includes(id)).length;
    return { evalQs, evalOk, conceptsDone };
  } catch { return { evalQs: 0, evalOk: 0, conceptsDone: 0 }; }
}

function SectionLabel({ children }) {
  return <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{children}</p>;
}

export default function EvaluationHub({ onNavigate, onNavigateTo }) {
  const [progress]  = useState(getProgress);
  const [readiness] = useState(() => getAreaReadiness("evaluation"));

  function goGT(postId) { track("eval_hub_gt", { postId }); if (onNavigateTo) onNavigateTo({ tab: "groundtruth", postId }); else onNavigate("groundtruth"); }
  function goConcepts(gymId) { track("eval_hub_concepts", { gymId }); if (onNavigateTo) onNavigateTo({ tab: "concepts", gymId }); else onNavigate("concepts"); }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">

      {/* Intro */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#f59e0b" }}>Evaluation</div>
          {readiness && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: readiness.color, borderColor: readiness.color + "40", background: readiness.color + "12" }}>{readiness.level} · {readiness.pct}%</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">How do you know if it's actually working?</h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          79% of AI practitioners say evaluation is their #1 challenge — but 31% don't evaluate at all. The BLEU score story: a senior engineer prepared for months, got asked "your AI gave a confident answer — how do you know it was right?", said BLEU scores, and didn't get the offer. Evaluation is the question that separates $180K engineers from $340K ones.
        </p>
        {progress.evalQs > 0 && (
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {Math.round(progress.evalOk / progress.evalQs * 100)}% accuracy on {progress.evalQs} eval questions
          </div>
        )}
      </div>

      {/* Lab */}
      <div>
        <SectionLabel>The Lab</SectionLabel>
        <button onClick={() => { track("eval_hub_lab", {}); onNavigate("evallab"); }}
          className="w-full text-left rounded-2xl p-6 transition-all card-lift"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderTop: "2px solid #f59e0b" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">Eval Lab</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>15 modules</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">Configure LLM judges, design eval pipelines, and watch calibration drift in real time. The only interactive eval design environment that shows you why your judge is wrong before you deploy it.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["RAGAS metrics", "LLM-as-judge", "Offline evals", "Online evals", "Calibration drift"].map(f => (
                  <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{f}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0 hidden sm:flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold" style={{ color: "#f59e0b" }}>Open Eval Lab →</div>
        </button>
      </div>

      {/* Concepts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Key Concepts</SectionLabel>
          <button onClick={() => goConcepts("evaluation")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All Concepts →</button>
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
          <button onClick={() => onNavigate("groundtruth")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All 19 evaluation posts →</button>
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
          <button onClick={() => { track("eval_hub_preplab_all", {}); onNavigate("preplab"); }} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All eval questions →</button>
        </div>
        <div className="space-y-3">
          {PREPLAB_Qs.map(q => (
            <div key={q.id} className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ color: q.diffColor, borderColor: q.diffColor + "40", background: q.diffColor + "10" }}>{q.difficulty}</span>
                {q.gated && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500">Access code</span>}
              </div>
              <p className="text-sm text-zinc-200 leading-snug mb-3">{q.question}</p>
              <button onClick={() => { track("eval_hub_q", { id: q.id }); onNavigate("preplab"); }} className="text-[11px] font-bold hover:opacity-80" style={{ color: "#f59e0b" }}>Answer in PrepLab →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      {(progress.evalQs > 0 || progress.conceptsDone > 0) && (
        <div>
          <SectionLabel>Your Progress Here</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.evalQs}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Questions done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.conceptsDone}<span className="text-zinc-500 text-sm font-normal">/4</span></div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Concepts done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.evalQs > 0 ? Math.round(progress.evalOk / progress.evalQs * 100) + "%" : "–"}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Eval accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
