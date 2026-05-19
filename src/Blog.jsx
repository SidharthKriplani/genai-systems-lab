import { useState, useEffect } from "react";
import { track } from "./analytics";

const CATEGORIES = [
  { id: "all",        label: "All" },
  { id: "foundations", label: "Foundations" },
  { id: "rag",        label: "RAG" },
  { id: "agents",     label: "Agents" },
  { id: "evaluation", label: "Evaluation" },
  { id: "llmops",     label: "LLMOps" },
  { id: "sysdesign",  label: "System Design" },
  { id: "failures",   label: "Production Failures" },
  { id: "interview",  label: "Interview Prep" },
];

const POSTS = [
  // ── Foundations ──────────────────────────────────────────────────────────────
  {
    id: "what-is-a-transformer",
    category: "foundations",
    title: "What Is a Transformer? Self-Attention Explained Without the Math",
    desc: "Why every LLM is built on the same core idea — and what attention actually computes.",
    readMin: 8,
    labLink: "concepts",
    labLabel: "Test in Concepts →",
    tags: ["transformer", "attention", "architecture"],
  },
  {
    id: "tokenization-deep-dive",
    category: "foundations",
    title: "Tokenization: Why 'cat' and 'cats' Are Different to an LLM",
    desc: "BPE, WordPiece, and SentencePiece — what tokenizers do, why it matters for prompting, and how token counts affect cost.",
    readMin: 6,
    labLink: "concepts",
    labLabel: "Test in Concepts →",
    tags: ["tokenization", "BPE", "prompting"],
  },
  {
    id: "embeddings-explained",
    category: "foundations",
    title: "Embeddings Explained: How Text Becomes Geometry",
    desc: "What embedding vectors represent, why semantic similarity works, and how this powers every RAG system.",
    readMin: 7,
    labLink: "explore",
    labLabel: "Visualise in Explore →",
    tags: ["embeddings", "vector space", "semantic search"],
  },
  {
    id: "context-window-guide",
    category: "foundations",
    title: "The Context Window: What Goes In, What Gets Dropped, and Why It Matters",
    desc: "How LLMs handle long inputs, what context overflow looks like in production, and strategies to stay inside the window.",
    readMin: 7,
    labLink: "concepts",
    labLabel: "Test in Concepts →",
    tags: ["context window", "long context", "attention"],
  },
  {
    id: "prompting-token-economics",
    category: "foundations",
    title: "Prompt Engineering & Token Economics",
    desc: "How prompt structure affects output quality, why few-shot beats zero-shot in most cases, and how to calculate real inference cost.",
    readMin: 9,
    labLink: "playground",
    labLabel: "Try in Playground →",
    tags: ["prompt engineering", "few-shot", "token cost"],
  },

  // ── RAG ──────────────────────────────────────────────────────────────────────
  {
    id: "how-rag-works",
    category: "rag",
    title: "How RAG Actually Works — And Why It's Harder Than It Looks",
    desc: "The full retrieval-augmented generation pipeline: chunking → embedding → retrieval → reranking → generation. Where each step can fail.",
    readMin: 10,
    labLink: "lab",
    labLabel: "Run RAG Lab →",
    tags: ["RAG", "retrieval", "pipeline"],
  },
  {
    id: "chunking-strategies",
    category: "rag",
    title: "Chunking Strategies for RAG: Fixed, Semantic, and Hierarchical",
    desc: "Why chunk size is one of the most impactful RAG config decisions, and how to choose between fixed-size, sentence, and semantic chunking.",
    readMin: 8,
    labLink: "lab",
    labLabel: "Configure in RAG Lab →",
    tags: ["chunking", "RAG config", "retrieval"],
  },
  {
    id: "rag-failure-modes",
    category: "rag",
    title: "6 RAG Failure Modes That Will Break Your Production System",
    desc: "Stale document retrieval, silent conflict resolution, context overflow, prompt injection, multi-hop failures, and hallucinated citations — with real examples.",
    readMin: 12,
    labLink: "lab",
    labLabel: "Reproduce in RAG Lab →",
    tags: ["RAG failures", "production", "debugging"],
  },
  {
    id: "reranking-explained",
    category: "rag",
    title: "Reranking: Why Top-K Retrieval Isn't Enough",
    desc: "How cross-encoders and rerankers improve precision after initial retrieval, and when the latency cost is worth it.",
    readMin: 7,
    labLink: "lab",
    labLabel: "Toggle in RAG Lab →",
    tags: ["reranking", "cross-encoder", "retrieval precision"],
  },
  {
    id: "vector-databases-compared",
    category: "rag",
    title: "Vector Databases Compared: Pinecone, Weaviate, Qdrant, pgvector",
    desc: "How to choose a vector store for your use case — latency, scale, filtering, cost, and managed vs. self-hosted tradeoffs.",
    readMin: 9,
    labLink: "explore",
    labLabel: "Compare in Explore →",
    tags: ["vector DB", "Pinecone", "Weaviate", "pgvector"],
  },

  // ── Agents ───────────────────────────────────────────────────────────────────
  {
    id: "react-pattern",
    category: "agents",
    title: "The ReAct Pattern: How LLM Agents Reason and Act",
    desc: "Thought → Action → Observation loops explained. How ReAct enables tool use, where it breaks, and how to trace agent decisions.",
    readMin: 8,
    labLink: "agents",
    labLabel: "Simulate in Agents Lab →",
    tags: ["ReAct", "agent loop", "tool use"],
  },
  {
    id: "agent-memory-types",
    category: "agents",
    title: "6 Types of Memory in AI Agents (And When to Use Each)",
    desc: "In-context, episodic, semantic, procedural, working, and external memory — what each stores, how it's retrieved, and real implementation patterns.",
    readMin: 9,
    labLink: "agents",
    labLabel: "Explore in Agents Lab →",
    tags: ["agent memory", "LangMem", "episodic memory"],
  },
  {
    id: "multi-agent-orchestration",
    category: "agents",
    title: "Multi-Agent Orchestration: Patterns, Pitfalls, and When Not to Use It",
    desc: "Supervisor, pipeline, and mesh orchestration patterns. How inter-agent communication breaks, and how to design failure budgets.",
    readMin: 10,
    labLink: "agents",
    labLabel: "Trace in Agents Lab →",
    tags: ["multi-agent", "LangGraph", "orchestration"],
  },
  {
    id: "agent-failure-modes",
    category: "agents",
    title: "How AI Agents Fail in Production: A Taxonomy",
    desc: "Tool misuse, infinite loops, hallucinated tool calls, context bleed, approval fatigue, and compounding reliability failures — with worked examples.",
    readMin: 11,
    labLink: "agents",
    labLabel: "Reproduce in Agents Lab →",
    tags: ["agent failures", "production", "reliability"],
  },

  // ── Evaluation ───────────────────────────────────────────────────────────────
  {
    id: "llm-evaluation-guide",
    category: "evaluation",
    title: "How to Evaluate LLM Systems: RAGAS, G-Eval, and Custom Grading",
    desc: "What groundedness, faithfulness, and citation accuracy actually measure — and how to build an eval pipeline that catches real failures.",
    readMin: 11,
    labLink: "systems",
    labLabel: "Build evals in Systems →",
    tags: ["RAGAS", "G-Eval", "LLM evaluation"],
  },
  {
    id: "hallucination-detection",
    category: "evaluation",
    title: "Hallucination Detection: Why It's Hard and What Actually Works",
    desc: "The difference between factual, faithfulness, and citation hallucinations. Detection approaches: NLI, self-consistency, retrieval grounding.",
    readMin: 9,
    labLink: "playground",
    labLabel: "Spot in Playground →",
    tags: ["hallucination", "faithfulness", "NLI"],
  },

  // ── LLMOps ───────────────────────────────────────────────────────────────────
  {
    id: "llmops-production-checklist",
    category: "llmops",
    title: "LLMOps: What Production AI Actually Needs That Tutorials Skip",
    desc: "Observability, prompt versioning, latency budgets, cost tracking, model routers, A/B testing, and rollback strategies.",
    readMin: 13,
    labLink: "systems",
    labLabel: "Explore in Systems →",
    tags: ["LLMOps", "observability", "production"],
  },
  {
    id: "fine-tuning-vs-rag",
    category: "llmops",
    title: "Fine-Tuning vs. RAG vs. Prompt Engineering: When to Use What",
    desc: "The decision framework every AI engineer needs. Cost, latency, data requirements, and failure modes for each approach.",
    readMin: 10,
    labLink: "lab",
    labLabel: "Test RAG vs. prompting →",
    tags: ["fine-tuning", "RAG", "LoRA", "PEFT"],
  },
  {
    id: "prompt-caching-cost",
    category: "llmops",
    title: "Prompt Caching and Token Cost Optimisation at Scale",
    desc: "How prompt caching works, when it pays off, and how to reduce inference cost by 60-80% on repetitive workloads.",
    readMin: 7,
    labLink: "systems",
    labLabel: "Optimise in Systems →",
    tags: ["prompt caching", "cost", "inference optimisation"],
  },

  // ── System Design ─────────────────────────────────────────────────────────────
  {
    id: "ai-system-design-framework",
    category: "sysdesign",
    title: "A Framework for AI System Design Interviews (Staff+ Level)",
    desc: "The 6-axis characterisation, architecture shape selection, reliability budgets, and how to structure a 45-minute system design answer.",
    readMin: 14,
    labLink: "systems",
    labLabel: "Practice in Systems →",
    tags: ["system design", "interview", "staff engineer"],
  },
  {
    id: "rag-system-design",
    category: "sysdesign",
    title: "Designing a Production RAG System: Full Architecture Walkthrough",
    desc: "From document ingestion to answer generation — indexing pipeline, retrieval layer, reranker, answer policy, eval loop, and monitoring.",
    readMin: 15,
    labLink: "lab",
    labLabel: "Configure in RAG Lab →",
    tags: ["RAG architecture", "system design", "production"],
  },

  // ── Production Failures ───────────────────────────────────────────────────────
  {
    id: "stale-document-failure",
    category: "failures",
    title: "Case Study: How Stale Documents Caused a Compliance Chatbot to Lie",
    desc: "Real failure scenario — two policy versions in the corpus, top_k=1, no freshness filter. The chatbot answered confidently with 3-year-old data.",
    readMin: 8,
    labLink: "lab",
    labLabel: "Reproduce this failure →",
    tags: ["RAG failure", "stale docs", "compliance"],
  },
  {
    id: "prompt-injection-production",
    category: "failures",
    title: "Prompt Injection in Production: Attacks, Defenses, and What Doesn't Work",
    desc: "Direct and indirect injection attacks, jailbreaks, data exfiltration via prompt, and why input sanitisation alone is insufficient.",
    readMin: 10,
    labLink: "playground",
    labLabel: "Craft attacks in Playground →",
    tags: ["prompt injection", "security", "red teaming"],
  },

  // ── Interview Prep ────────────────────────────────────────────────────────────
  {
    id: "llm-interview-question-patterns",
    category: "interview",
    title: "LLM Interview Question Patterns: What Interviewers Actually Want",
    desc: "The 10 question categories every AI engineer interview covers, common traps, and how to structure 4-layer answers that impress senior engineers.",
    readMin: 12,
    labLink: "fluency",
    labLabel: "Practise in Fluency →",
    tags: ["interview prep", "LLM questions", "AI engineer"],
  },
  {
    id: "rag-interview-questions",
    category: "interview",
    title: "25 RAG Interview Questions With Strong Answers",
    desc: "Covering retrieval, chunking, reranking, evaluation, failure modes, and system design — with model answers and common traps.",
    readMin: 15,
    labLink: "lab",
    labLabel: "Test yourself in RAG Lab →",
    tags: ["RAG interview", "interview prep", "system design"],
  },
];

const CAT_COLORS = {
  foundations: "#6366f1",
  rag:         "#3b82f6",
  agents:      "#06b6d4",
  evaluation:  "#22c55e",
  llmops:      "#f59e0b",
  sysdesign:   "#ef4444",
  failures:    "#f97316",
  interview:   "#ec4899",
};

export default function Blog({ onNavigate }) {
  const [filter, setFilter] = useState("all");

  useEffect(() => { track("blog_viewed", {}); }, []);

  const visible = filter === "all" ? POSTS : POSTS.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-2">Learn first. Break it on the platform.</p>
          <h1 className="text-2xl font-black text-white mb-2">Blog</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
            Deep-dives on production AI — RAG, agents, evaluation, LLMOps, and system design.
            Every post links to the lab module where you can test what you just read.
          </p>
        </div>

        {/* Coming soon banner */}
        <div className="rounded-xl border border-violet-900/50 bg-violet-950/20 px-4 py-3 mb-8 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
          <p className="text-sm text-violet-300">
            <span className="font-bold">Posts coming soon.</span>
            <span className="text-violet-400"> Topics are locked in — we're writing them now. Check back shortly.</span>
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === c.id
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
              }`}>
              {c.label}
              {c.id !== "all" && (
                <span className="ml-1.5 text-[9px] opacity-50">
                  {POSTS.filter(p => p.category === c.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Post grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(post => {
            const color = CAT_COLORS[post.category] || "#6366f1";
            const catLabel = CATEGORIES.find(c => c.id === post.category)?.label || post.category;
            return (
              <div
                key={post.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-col gap-3 relative overflow-hidden">

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${color}88, transparent)` }} />

                {/* Category + read time */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ color, background: color + "22", border: `1px solid ${color}44` }}>
                    {catLabel}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono">{post.readMin} min read</span>
                </div>

                {/* Title + desc */}
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-white leading-snug mb-1.5">{post.title}</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{post.desc}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[8px] font-mono text-zinc-700 bg-zinc-800/60 border border-zinc-800 rounded px-1.5 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTA row */}
                <div className="flex items-center justify-between border-t border-zinc-800 pt-2.5 mt-auto">
                  <span className="text-[10px] text-zinc-600 font-mono italic">Coming soon</span>
                  <button
                    onClick={() => { track("blog_lab_link_clicked", { post: post.id, lab: post.labLink }); onNavigate(post.labLink); }}
                    className="text-[10px] font-mono font-bold transition-colors"
                    style={{ color }}>
                    {post.labLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-zinc-600 font-mono">
          <span>{POSTS.length} posts planned · </span>
          <button onClick={() => onNavigate("home")} className="text-zinc-500 hover:text-white transition-colors underline">← Back to Home</button>
        </div>

      </div>
    </div>
  );
}
