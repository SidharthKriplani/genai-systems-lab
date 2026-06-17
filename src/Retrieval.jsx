import { useState } from "react";
import { track } from "./analytics";
import { getAreaReadiness } from "./readiness";

// ─── Static data — Retrieval challenge area ───────────────────────────────────

const CONCEPTS = [
  {
    id: "embeddings",
    label: "Embeddings",
    fidelity: "~ Simplified",
    fidelityColor: "#f59e0b",
    desc: "How text becomes geometry — the foundation of every RAG system and semantic search product.",
    gymId: "retrieval",
  },
  {
    id: "context",
    label: "Context Window",
    fidelity: "~ Simplified",
    fidelityColor: "#f59e0b",
    desc: "What gets dropped when context overflows, and why chunk placement inside the window changes answer quality.",
    gymId: "retrieval",
  },
  {
    id: "tokenizer",
    label: "Tokenizer",
    fidelity: "✓ Faithful",
    fidelityColor: "#22c55e",
    desc: "How text becomes tokens — foundation for understanding chunk boundaries and token-level retrieval failures.",
    gymId: "retrieval",
  },
  {
    id: "attention",
    label: "Attention",
    fidelity: "~ Simplified",
    fidelityColor: "#f59e0b",
    desc: "Why the model focuses on certain retrieved chunks over others — and what happens when it focuses on the wrong ones.",
    gymId: "retrieval",
  },
];

const GT_POSTS = [
  {
    id: "how-rag-works",
    title: "How RAG Actually Works — And Why It's Harder Than It Looks",
    desc: "The full pipeline: chunking → embedding → retrieval → reranking → generation. Where each step silently fails.",
    readMin: 10,
    tag: "Pipeline",
  },
  {
    id: "missing-context-failure",
    title: "Missing Context: When RAG Retrieves the Right Chunk but Answers the Wrong Question",
    desc: "Why high similarity score doesn't mean high relevance. The missing context failure mode and how to fix it.",
    readMin: 8,
    tag: "Failure mode",
  },
  {
    id: "chunking-strategies",
    title: "Chunking Strategies for RAG: Fixed, Semantic, and Hierarchical",
    desc: "Why chunk size is one of the most impactful RAG config decisions — with real retrieval quality differences.",
    readMin: 8,
    tag: "Configuration",
  },
  {
    id: "hybrid-search",
    title: "Hybrid Search: Combining BM25 and Vector Retrieval",
    desc: "Why pure semantic search misses exact matches. How hybrid search with RRF fusion beats both approaches.",
    readMin: 8,
    tag: "Architecture",
  },
  {
    id: "bi-encoder-vs-cross-encoder",
    title: "Bi-Encoder vs Cross-Encoder: The Retrieval Architecture Decision That Determines Latency",
    desc: "Bi-encoders pre-compute document vectors (fast, scalable). Cross-encoders score pairs jointly (accurate, slow). Why production retrieval is always two-stage.",
    readMin: 11,
    tag: "Architecture",
  },
  {
    id: "sentence-transformers-production",
    title: "Sentence Transformers in Production: SBERT, Model Selection, and Domain Adaptation",
    desc: "Why SBERT exists (BERT [CLS] fails for similarity), mean pooling implementation, model selection table, and fine-tuning with MultipleNegativesRankingLoss.",
    readMin: 10,
    tag: "Embeddings",
  },
  {
    id: "vector-databases-compared",
    title: "Vector Databases Compared: Pinecone vs Weaviate vs Qdrant vs pgvector",
    desc: "HNSW index mechanics, the metadata filtering problem, hybrid search support, and the decision framework. When pgvector is the right answer.",
    readMin: 11,
    tag: "Infrastructure",
  },
];

const PREPLAB_Qs = [
  {
    id: "rag-litm",
    difficulty: "Easy",
    diffColor: "#22c55e",
    gated: false,
    question: "'Lost in the middle' is a RAG failure mode where the model struggles to use information placed in the middle of a long context. What does this imply about chunk placement strategy?",
  },
  {
    id: "rag-3",
    difficulty: "Easy",
    diffColor: "#22c55e",
    gated: false,
    question: "Which chunking strategy preserves the most semantic coherence for a technical documentation corpus?",
  },
  {
    id: "rag-1",
    difficulty: "Medium",
    diffColor: "#f59e0b",
    gated: true,
    question: "A RAG system has 94% recall but users report wrong answers 30% of the time. What is the most likely cause?",
  },,
  {
    id: "bienc-1",
    difficulty: "Easy",
    diffColor: "#22c55e",
    gated: false,
    question: "Why can a bi-encoder scale to 100M documents while a cross-encoder cannot?",
  },
  {
    id: "bienc-2",
    difficulty: "Medium",
    diffColor: "#f59e0b",
    gated: false,
    question: "Your two-stage retrieval (bi-encoder recall + cross-encoder rerank) has good precision but poor recall. Where is the bottleneck?",
  },
  {
    id: "sbert-2",
    difficulty: "Medium",
    diffColor: "#f59e0b",
    gated: false,
    question: "After L2-normalizing sentence transformer embeddings, which similarity metric becomes equivalent to cosine similarity — and why does it matter for indexing?",
  },
  {
    id: "vecdb-1",
    difficulty: "Medium",
    diffColor: "#f59e0b",
    gated: false,
    question: "Vector search returns great results for general queries but misses exact product SKU lookups. What is the architecture fix?",
  },
];

// ─── Progress helpers ─────────────────────────────────────────────────────────
function getRetrievalProgress() {
  try {
    const leaderboard  = JSON.parse(localStorage.getItem("genai_leaderboard")       || "{}");
    const history      = JSON.parse(localStorage.getItem("gsl-preplab-history")     || "{}");
    const mastery      = JSON.parse(localStorage.getItem("gsl-concepts-mastery")    || "[]");

    const labScenarios = Object.keys(leaderboard).filter(k => k.startsWith("lab:")).length;
    const ragQs        = Object.keys(history).filter(k => k.startsWith("rag")).length;
    const ragCorrect   = Object.keys(history).filter(k => k.startsWith("rag") && history[k]?.correct).length;
    const conceptsDone = mastery.filter(id => ["embeddings","context","tokenizer","attention"].includes(id)).length;

    return { labScenarios, ragQs, ragCorrect, conceptsDone };
  } catch {
    return { labScenarios: 0, ragQs: 0, ragCorrect: 0, conceptsDone: 0 };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{children}</p>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function RetrievalHub({ onNavigate, onNavigateTo }) {
  const [progress]  = useState(() => getRetrievalProgress());
  const [readiness] = useState(() => getAreaReadiness("retrieval"));

  function goToGT(postId) {
    track("retrieval_hub_gt_click", { postId });
    if (onNavigateTo) onNavigateTo({ tab: "groundtruth", postId });
    else onNavigate("groundtruth");
  }

  function goConcepts(gymId) {
    track("retrieval_hub_concepts_click", { gymId });
    if (onNavigateTo) onNavigateTo({ tab: "concepts", gymId });
    else onNavigate("concepts");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">

      {/* ── 1. Challenge intro ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--gal-build)" }}>Retrieval</div>
          {readiness && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: readiness.color, borderColor: readiness.color + "40", background: readiness.color + "12" }}>
              {readiness.level} · {readiness.pct}%
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
          Why does your AI give wrong answers?
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          Most RAG systems work fine in testing and fail in production. The failure modes are predictable — stale retrieval,
          noise injection, context overflow, hallucination from gap, multi-hop misses — but only if you've seen them before.
          This is where you see them. Configure real failure scenarios, watch them break, and diagnose exactly why.
        </p>
        {progress.labScenarios > 0 && (
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "var(--gal-build-tint)", border: "1px solid var(--gal-build-border)", color: "var(--gal-build)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gal-build)" }} />
            {progress.labScenarios} / 6 RAG Lab scenarios completed
          </div>
        )}
      </div>

      {/* ── 2. Primary lab entry ────────────────────────────────────────────── */}
      <div>
        <SectionLabel>The Lab</SectionLabel>
        <button
          onClick={() => { track("retrieval_hub_lab_click", {}); onNavigate("lab"); }}
          className="w-full text-left rounded-2xl p-6 transition-all card-lift"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderTop: "2px solid var(--gal-build)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">RAG Lab</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: "var(--gal-build-tint)", border: "1px solid var(--gal-build-border)", color: "var(--gal-build)" }}>
                  6 scenarios
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                Configure each failure mode — stale retrieval, prompt injection, hallucination, context overflow, multi-hop,
                ambiguous queries. Watch the system break. Understand why. The only interactive RAG failure simulator of its kind.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Stale retrieval", "Prompt injection", "Context overflow", "Hallucination", "Multi-hop failure"].map(f => (
                  <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{f}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0 hidden sm:flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ background: "var(--gal-build-tint)", border: "1px solid var(--gal-build-border)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gal-build)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold" style={{ color: "var(--gal-build)" }}>
            Open RAG Lab →
          </div>
        </button>
      </div>

      {/* ── 3. Key concepts ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Key Concepts</SectionLabel>
          <button onClick={() => goConcepts("retrieval")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All Concepts →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONCEPTS.map(c => (
            <button key={c.id}
              onClick={() => goConcepts(c.gymId)}
              className="text-left p-4 rounded-xl transition-all hover:border-zinc-600 card-lift"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-white">{c.label}</span>
                <span className="text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded"
                  style={{ color: c.fidelityColor, background: c.fidelityColor + "15", border: `1px solid ${c.fidelityColor}30` }}>
                  {c.fidelity}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
              <span className="mt-2 text-[11px] font-bold text-violet-400 block">Open in Concepts →</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Ground Truth posts ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>From the Field</SectionLabel>
          <button onClick={() => onNavigate("groundtruth")} className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">All GT posts →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GT_POSTS.map(p => (
            <button key={p.id}
              onClick={() => goToGT(p.id)}
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

      {/* ── 5. Inline PrepLab questions ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Test Your Judgment</SectionLabel>
          <button onClick={() => { track("retrieval_hub_preplab_all", {}); onNavigate("preplab"); }}
            className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors">
            All RAG questions →
          </button>
        </div>
        <div className="space-y-3">
          {PREPLAB_Qs.map(q => (
            <div key={q.id} className="rounded-xl p-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                  style={{ color: q.diffColor, borderColor: q.diffColor + "40", background: q.diffColor + "10" }}>
                  {q.difficulty}
                </span>
                {q.gated && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500">
                    Access code
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-200 leading-snug mb-3">{q.question}</p>
              <button onClick={() => { track("retrieval_hub_q_click", { id: q.id }); onNavigate("preplab"); }}
                className="text-[11px] font-bold transition-colors hover:opacity-80"
                style={{ color: "var(--gal-build)" }}>
                Answer in PrepLab →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Progress snapshot ────────────────────────────────────────────── */}
      {(progress.labScenarios > 0 || progress.ragQs > 0 || progress.conceptsDone > 0) && (
        <div>
          <SectionLabel>Your Progress Here</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.labScenarios}<span className="text-zinc-500 text-sm font-normal">/6</span></div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Lab scenarios</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.conceptsDone}<span className="text-zinc-500 text-sm font-normal">/4</span></div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">Concepts done</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-black text-white">{progress.ragQs > 0 ? Math.round(progress.ragCorrect / progress.ragQs * 100) : "–"}{progress.ragQs > 0 ? "%" : ""}</div>
              <div className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">RAG accuracy</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
