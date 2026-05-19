import { useState, useEffect } from "react";
import { track } from "./analytics";
import { POST_CONTENT } from "./groundTruthPosts";
import TransformerWalkthrough from "./TransformerWalkthrough";
import SalaryCalculator from "./SalaryCalculator";

// Every post maps to at least one interactive module on the platform.
// "labLink" is where the reader goes to test what they just read.

// ─── POST DETAIL RENDERER ────────────────────────────────────────────────────
function Block({ b, onNavigate, color }) {
  switch (b.t) {
    case "p":
      return <p className="text-sm text-zinc-300 leading-relaxed">{b.text}</p>;
    case "h2":
      return <h2 className="text-base font-black text-white mt-8 mb-1">{b.text}</h2>;
    case "h3":
      return <h3 className="text-sm font-bold text-zinc-200 mt-5 mb-1">{b.text}</h3>;
    case "divider":
      return <hr className="border-zinc-800 my-6" />;
    case "list":
      return (
        <ul className="space-y-1.5 pl-1">
          {b.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-relaxed">
              <span className="text-zinc-600 shrink-0 mt-1">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "callout": {
      const styles = {
        key:     { border: "border-violet-800/60", bg: "bg-violet-950/30", text: "text-violet-300", dot: "bg-violet-400" },
        tip:     { border: "border-emerald-800/60", bg: "bg-emerald-950/30", text: "text-emerald-300", dot: "bg-emerald-400" },
        warning: { border: "border-amber-800/60",   bg: "bg-amber-950/30",   text: "text-amber-300",   dot: "bg-amber-400" },
        info:    { border: "border-blue-800/60",    bg: "bg-blue-950/30",    text: "text-blue-300",    dot: "bg-blue-400" },
      };
      const s = styles[b.v] || styles.info;
      return (
        <div className={`rounded-lg border ${s.border} ${s.bg} px-4 py-3 flex gap-3`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0 mt-1.5`} />
          <p className={`text-xs leading-relaxed ${s.text}`}>{b.text}</p>
        </div>
      );
    }
    case "code":
      return (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          {b.label && (
            <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono text-zinc-500">{b.label}</div>
          )}
          <pre className="px-4 py-3 overflow-x-auto bg-zinc-950">
            <code className="text-[11px] font-mono text-zinc-300 whitespace-pre">{b.text}</code>
          </pre>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                {b.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-bold text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-zinc-400 leading-relaxed">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "lab":
      return (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Try it on the platform</p>
            <p className="text-xs text-zinc-400">{b.desc}</p>
          </div>
          <button
            onClick={() => onNavigate(b.tab)}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
            style={{ background: color }}>
            {b.label}
          </button>
        </div>
      );
    case "video":
      return (
        <div className="rounded-xl overflow-hidden border border-zinc-800">
          <div className="aspect-video w-full bg-zinc-900">
            <iframe
              src={`https://www.youtube.com/embed/${b.youtubeId}`}
              title={b.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          {(b.title || b.desc) && (
            <div className="px-4 py-3 bg-zinc-900/60 border-t border-zinc-800">
              {b.title && <p className="text-xs font-bold text-zinc-300 mb-0.5">{b.title}</p>}
              {b.desc  && <p className="text-[11px] text-zinc-500">{b.desc}</p>}
            </div>
          )}
        </div>
      );
    case "animation":
      if (b.name === "transformer") return <TransformerWalkthrough />;
      if (b.name === "salary-calc") return <SalaryCalculator />;
      return null;
    default:
      return null;
  }
}

function PostDetail({ post, onBack, onNavigate }) {
  const content = POST_CONTENT[post.id];
  const color = CAT_COLORS[post.category] || "#6366f1";
  const catLabel = CATEGORIES.find(c => c.id === post.category)?.label || post.category;

  useEffect(() => {
    track("ground_truth_post_opened", { post: post.id });
    window.scrollTo(0, 0);
  }, [post.id]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors font-mono mb-8">
          ← Ground Truth
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{ color, background: color + "22", border: `1px solid ${color}44` }}>
              {catLabel}
            </span>
            <span className="text-[9px] text-zinc-600 font-mono">{post.readMin} min read</span>
          </div>
          <h1 className="text-xl font-black text-white leading-tight mb-3">{post.title}</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">{post.desc}</p>
        </div>

        {/* Content or coming soon */}
        {content ? (
          <div className="space-y-4">
            {content.map((b, i) => (
              <Block key={i} b={b} onNavigate={onNavigate} color={color} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <div className="text-3xl mb-3">✍️</div>
            <p className="text-sm font-bold text-white mb-1">Writing in progress</p>
            <p className="text-xs text-zinc-500 mb-4">This piece is planned — check back soon.</p>
            <button
              onClick={() => onNavigate(post.labLink)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
              style={{ background: color }}>
              {post.labLabel}
            </button>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-zinc-800 flex items-center justify-between">
          <button onClick={onBack}
            className="text-xs text-zinc-500 hover:text-white transition-colors font-mono">
            ← Back to Ground Truth
          </button>
          <button
            onClick={() => onNavigate(post.labLink)}
            className="text-xs font-mono font-bold transition-colors hover:opacity-80"
            style={{ color }}>
            {post.labLabel}
          </button>
        </div>

      </div>
    </div>
  );
}

const CATEGORIES = [
  { id: "all",         label: "All" },
  { id: "foundations", label: "Foundations" },
  { id: "rag",         label: "RAG" },
  { id: "agents",      label: "Agents" },
  { id: "evaluation",  label: "Evaluation" },
  { id: "llmops",      label: "LLMOps" },
  { id: "safety",      label: "Safety" },
  { id: "sysdesign",   label: "System Design" },
  { id: "failures",    label: "Production Failures" },
  { id: "product",     label: "AI Product" },
  { id: "models",      label: "Model Profiles" },
  { id: "industry",    label: "Industry AI" },
  { id: "career",      label: "Careers & Salaries" },
  { id: "interview",   label: "Interview Prep" },
];

const CAT_COLORS = {
  foundations: "#6366f1",
  rag:         "#3b82f6",
  agents:      "#06b6d4",
  evaluation:  "#22c55e",
  llmops:      "#f59e0b",
  safety:      "#ef4444",
  sysdesign:   "#8b5cf6",
  failures:    "#f97316",
  product:     "#10b981",
  models:      "#e879f9",
  industry:    "#0ea5e9",
  career:      "#f59e0b",
  interview:   "#ec4899",
};

const POSTS = [

  // ─── FOUNDATIONS ──────────────────────────────────────────────────────────────

  {
    id: "what-is-a-transformer",
    category: "foundations",
    title: "What Is a Transformer? Self-Attention Explained Without the Math",
    desc: "Why every LLM is built on the same core idea — and what attention actually computes, step by step.",
    readMin: 8,
    labLink: "concepts",
    labLabel: "Explore in Concepts →",
    tags: ["transformer", "attention", "architecture"],
  },
  {
    id: "self-attention-deep-dive",
    category: "foundations",
    title: "Self-Attention: From Dot Products to What the Model Focuses On",
    desc: "Query, Key, Value matrices explained. Why multi-head attention sees different things at once, and what that means for long-range dependencies.",
    readMin: 9,
    labLink: "concepts",
    labLabel: "Interactive in Concepts →",
    tags: ["self-attention", "QKV", "multi-head"],
  },
  {
    id: "tokenization-deep-dive",
    category: "foundations",
    title: "Tokenization: Why 'cat' and 'cats' Are Different to an LLM",
    desc: "BPE, WordPiece, SentencePiece — what tokenizers do, why it matters for prompting, and how token counts drive your inference bill.",
    readMin: 6,
    labLink: "concepts",
    labLabel: "Try Tokenizer →",
    tags: ["tokenization", "BPE", "prompting"],
  },
  {
    id: "embeddings-explained",
    category: "foundations",
    title: "Embeddings Explained: How Text Becomes Geometry",
    desc: "What embedding vectors represent, why semantic similarity works, and how this underpins every RAG system and search product.",
    readMin: 7,
    labLink: "explore",
    labLabel: "Visualise in Explore →",
    tags: ["embeddings", "vector space", "semantic search"],
  },
  {
    id: "decoding-sampling",
    category: "foundations",
    title: "Temperature, Top-P, Top-K: How LLMs Actually Choose the Next Word",
    desc: "Greedy, beam search, nucleus sampling — what each one does, when randomness helps, and why temperature 0 isn't always the right answer.",
    readMin: 7,
    labLink: "concepts",
    labLabel: "Test Sampling →",
    tags: ["temperature", "top-p", "sampling", "decoding"],
  },
  {
    id: "context-window-guide",
    category: "foundations",
    title: "The Context Window: What Goes In, What Gets Dropped, and Why It Matters",
    desc: "How LLMs process long inputs, what context overflow looks like in production, and strategies to stay within the window without losing what matters.",
    readMin: 7,
    labLink: "concepts",
    labLabel: "Test Context Window →",
    tags: ["context window", "long context", "overflow"],
  },
  {
    id: "prompting-token-economics",
    category: "foundations",
    title: "Prompt Engineering & Token Economics",
    desc: "How prompt structure affects quality, why few-shot beats zero-shot in most cases, and how to calculate real inference cost before you ship.",
    readMin: 9,
    labLink: "playground",
    labLabel: "Try in Playground →",
    tags: ["prompt engineering", "few-shot", "token cost"],
  },

  // ─── RAG ─────────────────────────────────────────────────────────────────────

  {
    id: "how-rag-works",
    category: "rag",
    title: "How RAG Actually Works — And Why It's Harder Than It Looks",
    desc: "The full retrieval-augmented generation pipeline: chunking → embedding → retrieval → reranking → generation. Where each step silently fails.",
    readMin: 10,
    labLink: "lab",
    labLabel: "Run RAG Lab →",
    tags: ["RAG", "retrieval", "pipeline"],
  },
  {
    id: "chunking-strategies",
    category: "rag",
    title: "Chunking Strategies for RAG: Fixed, Semantic, and Hierarchical",
    desc: "Why chunk size is one of the most impactful RAG config decisions. Fixed-size vs. sentence vs. semantic chunking, with real retrieval quality differences.",
    readMin: 8,
    labLink: "playground",
    labLabel: "Compare in Playground →",
    tags: ["chunking", "RAG config", "retrieval"],
  },
  {
    id: "rag-architectures",
    category: "rag",
    title: "RAG Architectures: Naive, Advanced, Modular, and Agentic",
    desc: "How RAG has evolved from a simple retrieve-and-read loop to routing, query rewriting, self-RAG, corrective RAG, and full agentic retrieval.",
    readMin: 11,
    labLink: "flows",
    labLabel: "See in Flows →",
    tags: ["RAG architecture", "agentic RAG", "modular RAG"],
  },
  {
    id: "reranking-explained",
    category: "rag",
    title: "Reranking: Why Top-K Retrieval Isn't Enough",
    desc: "How cross-encoders and rerankers improve precision after initial retrieval, when the latency cost is worth it, and how to evaluate reranker quality.",
    readMin: 7,
    labLink: "playground",
    labLabel: "Toggle in Playground →",
    tags: ["reranking", "cross-encoder", "retrieval precision"],
  },
  {
    id: "vector-databases-compared",
    category: "rag",
    title: "Vector Databases Compared: Pinecone, Weaviate, Qdrant, pgvector",
    desc: "Latency, scale, metadata filtering, cost, and managed vs. self-hosted tradeoffs. A decision framework for choosing your vector store.",
    readMin: 9,
    labLink: "explore",
    labLabel: "Compare in Explore →",
    tags: ["vector DB", "Pinecone", "Weaviate", "pgvector"],
  },
  {
    id: "missing-context-failure",
    category: "rag",
    title: "Missing Context: When RAG Retrieves the Right Chunk but Answers the Wrong Question",
    desc: "Why high similarity score doesn't mean high relevance. The missing context failure mode, why it's hard to detect, and how to fix it.",
    readMin: 8,
    labLink: "lab",
    labLabel: "Reproduce in RAG Lab →",
    tags: ["missing context", "RAG failure", "relevance"],
  },
  {
    id: "ambiguous-query-failure",
    category: "rag",
    title: "Ambiguous Queries: Why RAG Struggles When the Question Has Two Meanings",
    desc: "Multi-intent queries, under-specified questions, and how your retriever picks the wrong meaning — and confidently answers it.",
    readMin: 7,
    labLink: "lab",
    labLabel: "Reproduce in RAG Lab →",
    tags: ["ambiguous query", "retrieval", "query rewriting"],
  },
  {
    id: "hybrid-search",
    category: "rag",
    title: "Hybrid Search: Combining BM25 and Vector Retrieval",
    desc: "Why pure semantic search misses exact matches, and pure keyword search misses meaning. How hybrid search with RRF fusion beats both.",
    readMin: 8,
    labLink: "lab",
    labLabel: "Configure in RAG Lab →",
    tags: ["hybrid search", "BM25", "RRF", "dense + sparse"],
  },

  // ─── AGENTS ──────────────────────────────────────────────────────────────────

  {
    id: "react-pattern",
    category: "agents",
    title: "The ReAct Pattern: How LLM Agents Reason and Act",
    desc: "Thought → Action → Observation loops explained. How ReAct enables tool use, where it breaks, and how to trace what your agent actually did.",
    readMin: 8,
    labLink: "agents",
    labLabel: "Simulate in Agents Lab →",
    tags: ["ReAct", "agent loop", "tool use"],
  },
  {
    id: "tool-use-design",
    category: "agents",
    title: "Tool Use Design for AI Agents: Contracts, Consequences, and MCP",
    desc: "How to design tools an agent won't misuse. Consequence levels, idempotency, permission architecture, and the Model Context Protocol (MCP).",
    readMin: 9,
    labLink: "agents",
    labLabel: "Explore Tool Use →",
    tags: ["tool use", "MCP", "agent contracts"],
  },
  {
    id: "agent-memory-types",
    category: "agents",
    title: "6 Types of Memory in AI Agents (And When to Use Each)",
    desc: "In-context, episodic, semantic, procedural, working, and external memory — what each stores, how it's retrieved, and real implementation patterns.",
    readMin: 9,
    labLink: "agents",
    labLabel: "Explore Memory →",
    tags: ["agent memory", "LangMem", "episodic memory"],
  },
  {
    id: "multi-agent-orchestration",
    category: "agents",
    title: "Multi-Agent Orchestration: Supervisor, Pipeline, and Mesh Patterns",
    desc: "How to break a complex task across multiple agents. Supervisor vs. pipeline vs. mesh patterns, inter-agent communication, and failure budgets.",
    readMin: 10,
    labLink: "agents",
    labLabel: "Trace in Agents Lab →",
    tags: ["multi-agent", "LangGraph", "orchestration"],
  },
  {
    id: "planning-patterns",
    category: "agents",
    title: "Planning Patterns for AI Agents: ToT, GoT, and LATS",
    desc: "How agents plan ahead: Tree of Thought, Graph of Thought, LATS, and reflection loops. When complex planning beats straight ReAct.",
    readMin: 9,
    labLink: "agents",
    labLabel: "Explore Planning →",
    tags: ["planning", "Tree of Thought", "LATS", "reflection"],
  },
  {
    id: "tracing-agent-loops",
    category: "agents",
    title: "Tracing Agent Loops: How to Debug Step-by-Step Execution",
    desc: "What a step trace reveals, how to spot loops, wrong tool calls, and hallucinated observations — and how to use the Agent Loop Simulator to reproduce failures.",
    readMin: 8,
    labLink: "agents",
    labLabel: "Open Simulator →",
    tags: ["agent tracing", "debugging", "observability"],
  },
  {
    id: "agent-failure-modes",
    category: "agents",
    title: "How AI Agents Fail in Production: A Full Taxonomy",
    desc: "Tool misuse, infinite loops, hallucinated tool calls, context bleed, approval fatigue, compounding reliability failures — with worked examples from the lab.",
    readMin: 11,
    labLink: "agents",
    labLabel: "Reproduce in Agents Lab →",
    tags: ["agent failures", "production", "reliability"],
  },

  // ─── EVALUATION ──────────────────────────────────────────────────────────────

  {
    id: "llm-evaluation-guide",
    category: "evaluation",
    title: "How to Evaluate LLM Systems: RAGAS, G-Eval, and Custom Grading",
    desc: "What groundedness, faithfulness, and citation accuracy actually measure — and how to build an eval pipeline that catches real failures before users do.",
    readMin: 11,
    labLink: "systems",
    labLabel: "Build Evals →",
    tags: ["RAGAS", "G-Eval", "LLM evaluation"],
  },
  {
    id: "hallucination-detection",
    category: "evaluation",
    title: "Hallucination Detection: Why It's Hard and What Actually Works",
    desc: "Factual vs. faithfulness vs. citation hallucinations. NLI-based detection, self-consistency, and retrieval grounding — tested against real examples.",
    readMin: 9,
    labLink: "playground",
    labLabel: "Spot in Playground →",
    tags: ["hallucination", "faithfulness", "NLI"],
  },
  {
    id: "eval-pipeline-design",
    category: "evaluation",
    title: "Building an Eval Pipeline That Actually Catches Production Failures",
    desc: "Why unit tests aren't enough for LLMs. How to design offline evals, online evals, and shadow evaluation so regressions don't reach users.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Build in Systems →",
    tags: ["eval pipeline", "regression testing", "LLMOps"],
  },
  {
    id: "ab-testing-llms",
    category: "evaluation",
    title: "A/B Testing LLM Systems: Statistical Significance and Evaluation Metrics",
    desc: "How to run controlled experiments on LLM outputs, which metrics to use (win-rate, NDCG, preference), and how to avoid common A/B traps.",
    readMin: 9,
    labLink: "systems",
    labLabel: "Run A/B Tests →",
    tags: ["A/B testing", "LLM metrics", "experimentation"],
  },

  // ─── LLMOPS ──────────────────────────────────────────────────────────────────

  {
    id: "llmops-production-checklist",
    category: "llmops",
    title: "LLMOps: What Production AI Actually Needs That Tutorials Skip",
    desc: "Observability, prompt versioning, latency budgets, cost tracking, model routers, A/B testing, and rollback strategies. The full production checklist.",
    readMin: 13,
    labLink: "systems",
    labLabel: "Explore Systems →",
    tags: ["LLMOps", "observability", "production"],
  },
  {
    id: "fine-tuning-vs-rag",
    category: "llmops",
    title: "Fine-Tuning vs. RAG vs. Prompt Engineering: When to Use What",
    desc: "The decision framework every AI engineer needs. Cost, latency, data requirements, update frequency, and failure modes for each approach.",
    readMin: 10,
    labLink: "lab",
    labLabel: "Test RAG vs. prompting →",
    tags: ["fine-tuning", "RAG", "LoRA", "PEFT"],
  },
  {
    id: "model-routing",
    category: "llmops",
    title: "Model Routing: How to Send the Right Query to the Right Model",
    desc: "Complexity-based routing, cost-based routing, and capability routing. How model routers cut inference cost by 40-70% without hurting quality.",
    readMin: 8,
    labLink: "systems",
    labLabel: "Configure Router →",
    tags: ["model routing", "cost optimisation", "inference"],
  },
  {
    id: "inference-optimisation",
    category: "llmops",
    title: "LLM Inference Optimisation: Batching, Quantisation, and Speculative Decoding",
    desc: "How to reduce latency and cost at inference time without retraining. INT8/INT4 quantisation, continuous batching, speculative decoding explained.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Optimise in Systems →",
    tags: ["inference", "quantisation", "batching", "latency"],
  },
  {
    id: "prompt-caching",
    category: "llmops",
    title: "Prompt Caching and Token Cost Optimisation at Scale",
    desc: "How prompt caching works, when it pays off, and how to reduce inference cost by 60-80% on repetitive system prompt workloads.",
    readMin: 7,
    labLink: "systems",
    labLabel: "Test Caching →",
    tags: ["prompt caching", "cost", "inference optimisation"],
  },
  {
    id: "llm-observability",
    category: "llmops",
    title: "LLM Observability: What to Log, Trace, and Alert On",
    desc: "Prompt/response logging, latency tracing, cost tracking, quality signals, and alert thresholds. What a production-grade LLM monitoring stack looks like.",
    readMin: 9,
    labLink: "systems",
    labLabel: "Explore Observability →",
    tags: ["observability", "logging", "monitoring", "LangSmith"],
  },
  {
    id: "ml-cicd",
    category: "llmops",
    title: "ML CI/CD: Testing, Versioning, and Deploying LLM Pipelines",
    desc: "How to adapt software CI/CD for ML: prompt versioning, eval regression gates, canary deploys, and rollback for model updates.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Explore ML CI/CD →",
    tags: ["ML CI/CD", "deployment", "versioning"],
  },
  {
    id: "context-compaction",
    category: "llmops",
    title: "Context Compaction: Managing Long Conversations Without Losing the Thread",
    desc: "Why conversation history grows until it breaks. Sliding window, summarisation-based, and hierarchical compaction strategies for production agents.",
    readMin: 8,
    labLink: "systems",
    labLabel: "Test Compaction →",
    tags: ["context compaction", "long conversations", "memory"],
  },
  {
    id: "cost-latency-tradeoffs",
    category: "llmops",
    title: "Cost vs. Latency Tradeoffs in LLM Systems: How to Budget Both",
    desc: "TTFT, tokens-per-second, and end-to-end latency explained. How to set SLAs, model latency against user tolerance, and build a cost/latency budget.",
    readMin: 9,
    labLink: "systems",
    labLabel: "Plan in Systems →",
    tags: ["latency", "cost", "TTFT", "SLA"],
  },
  {
    id: "shadow-ab-testing",
    category: "llmops",
    title: "Shadow Mode Testing: How to Compare Models Before You Switch",
    desc: "Run a new model in shadow mode alongside your live model, compare outputs without user exposure, and make data-driven upgrade decisions.",
    readMin: 7,
    labLink: "explore",
    labLabel: "Run Shadow Mode →",
    tags: ["shadow testing", "A/B", "model comparison"],
  },
  {
    id: "model-strategy",
    category: "llmops",
    title: "Model Strategy: When to Use GPT-4, Claude, Gemini, or an Open Model",
    desc: "The model selection decision — capability, cost, latency, data privacy, and fine-tunability. How to build a model strategy that holds up as models evolve.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Explore Model Strategy →",
    tags: ["model selection", "GPT-4", "Claude", "open models"],
  },

  // ─── SAFETY ──────────────────────────────────────────────────────────────────

  {
    id: "guardrails-for-llms",
    category: "safety",
    title: "Guardrails for LLMs: Input/Output Filtering in Production",
    desc: "How guardrail pipelines work — input classifiers, output validators, topic filters, PII redaction, and toxicity detection. What fails at scale.",
    readMin: 9,
    labLink: "concepts",
    labLabel: "Explore Guardrails →",
    tags: ["guardrails", "safety", "content filtering"],
  },
  {
    id: "prompt-injection-production",
    category: "safety",
    title: "Prompt Injection in Production: Attacks, Defenses, and What Doesn't Work",
    desc: "Direct and indirect injection, jailbreaks, data exfiltration via prompt, and why input sanitisation alone isn't enough. Craft live attacks in the Playground.",
    readMin: 10,
    labLink: "playground",
    labLabel: "Craft Attacks →",
    tags: ["prompt injection", "security", "jailbreak"],
  },
  {
    id: "red-teaming-llms",
    category: "safety",
    title: "Red Teaming LLMs: A Structured Methodology",
    desc: "How to systematically find failure modes before attackers do. Adversarial prompting, boundary testing, multi-turn attacks, and red team documentation.",
    readMin: 10,
    labLink: "explore",
    labLabel: "Open Red Team Lab →",
    tags: ["red teaming", "adversarial", "security"],
  },
  {
    id: "bias-in-llms",
    category: "safety",
    title: "Bias in LLM Outputs: Sources, Types, and What You Can Detect",
    desc: "Training data bias, demographic representation, positional bias in RAG, and confirmation bias in reasoning. How to surface and measure these in your system.",
    readMin: 9,
    labLink: "playground",
    labLabel: "Run Bias Detector →",
    tags: ["bias", "fairness", "LLM safety"],
  },
  {
    id: "privacy-compliance-llms",
    category: "safety",
    title: "Privacy and Compliance for LLM Systems",
    desc: "PII in prompts, data residency, model training on user data, GDPR/CCPA implications, and how to build a compliance architecture for production LLMs.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Explore in Systems →",
    tags: ["privacy", "GDPR", "compliance", "PII"],
  },

  // ─── SYSTEM DESIGN ───────────────────────────────────────────────────────────

  {
    id: "ai-system-design-framework",
    category: "sysdesign",
    title: "A Framework for AI System Design Interviews (Staff+ Level)",
    desc: "6-axis characterisation, architecture shape selection, reliability budgets, and how to structure a 45-minute system design answer that impresses staff engineers.",
    readMin: 14,
    labLink: "systems",
    labLabel: "Practice in Systems →",
    tags: ["system design", "interview", "staff engineer"],
  },
  {
    id: "rag-system-design",
    category: "sysdesign",
    title: "Designing a Production RAG System: Full Architecture Walkthrough",
    desc: "Document ingestion pipeline, retrieval layer, reranker, answer policy, eval loop, and monitoring — all the decisions you need to make before you ship.",
    readMin: 15,
    labLink: "lab",
    labLabel: "Configure in RAG Lab →",
    tags: ["RAG architecture", "system design", "production"],
  },
  {
    id: "agent-system-design",
    category: "sysdesign",
    title: "Designing an Agent System for Production: State, Tools, and Failure Handling",
    desc: "How to design an agent that doesn't spiral. State management, tool contracts, human-in-the-loop gates, reliability budgets, and rollback strategies.",
    readMin: 13,
    labLink: "agents",
    labLabel: "Simulate in Agents Lab →",
    tags: ["agent architecture", "system design", "production"],
  },
  {
    id: "india-scale-ai",
    category: "sysdesign",
    title: "Building AI at India Scale: Latency, Language, and Cost Constraints",
    desc: "What changes when you build for 500ms mobile latency, 22 official languages, and $0.001/query cost targets. Architecture decisions for India-scale AI.",
    readMin: 11,
    labLink: "systems",
    labLabel: "Explore India Scale Lab →",
    tags: ["India scale", "multilingual", "latency", "cost"],
  },
  {
    id: "structured-outputs",
    category: "sysdesign",
    title: "Structured Outputs from LLMs: JSON Mode, Function Calling, and Tool Use",
    desc: "How to make LLMs output reliable, parseable data. JSON mode, OpenAI function calling, Pydantic validation, and when structured outputs break.",
    readMin: 8,
    labLink: "explore",
    labLabel: "Try Structured Outputs →",
    tags: ["structured outputs", "JSON mode", "function calling"],
  },

  // ─── PRODUCTION FAILURES ─────────────────────────────────────────────────────

  {
    id: "stale-document-failure",
    category: "failures",
    title: "Case Study: How Stale Documents Made a Compliance Chatbot Confidently Wrong",
    desc: "Two policy versions in the corpus, top_k=1, no freshness filter. The chatbot answered with 3-year-old data. How to reproduce and fix this exact failure.",
    readMin: 8,
    labLink: "lab",
    labLabel: "Reproduce in RAG Lab →",
    tags: ["stale docs", "RAG failure", "compliance"],
  },
  {
    id: "multihop-reasoning-failure",
    category: "failures",
    title: "Multi-Hop Reasoning Failures: When Your RAG System Can't Connect the Dots",
    desc: "Why single-step retrieval fails on questions that require chaining two or three facts. How multi-hop and three-hop failures look, and how to architect around them.",
    readMin: 9,
    labLink: "lab",
    labLabel: "Reproduce in RAG Lab →",
    tags: ["multi-hop", "reasoning", "RAG failure"],
  },
  {
    id: "context-overflow-failure",
    category: "failures",
    title: "Context Overflow: What Happens When Your RAG Pipeline Runs Out of Space",
    desc: "How context overflow silently truncates the most relevant content, why it's hard to catch in testing, and the config changes that prevent it.",
    readMin: 8,
    labLink: "lab",
    labLabel: "Configure in RAG Lab →",
    tags: ["context overflow", "truncation", "RAG failure"],
  },
  {
    id: "incident-room",
    category: "failures",
    title: "The Incident Room: How to Respond to LLM Production Failures",
    desc: "A playbook for LLM incidents — how to triage, isolate, mitigate, and do a post-mortem. What's different about AI incidents vs. traditional software incidents.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Explore Incident Room →",
    tags: ["incidents", "on-call", "post-mortem", "LLMOps"],
  },
  {
    id: "latency-planner",
    category: "failures",
    title: "When Your LLM Is Too Slow: Diagnosing and Fixing Latency Regressions",
    desc: "How to identify whether latency is in TTFT, TPS, retrieval, or network. A step-by-step latency triage guide with the Latency Planner tool.",
    readMin: 8,
    labLink: "explore",
    labLabel: "Plan Latency →",
    tags: ["latency", "TTFT", "performance", "debugging"],
  },

  // ─── AI PRODUCT ──────────────────────────────────────────────────────────────

  {
    id: "prd-for-ai",
    category: "product",
    title: "Writing PRDs for AI Features: A Framework for Product Managers",
    desc: "What makes AI PRDs different — uncertainty ranges, fallback behaviour, eval criteria, human-in-the-loop decisions, and what 'done' looks like for an AI feature.",
    readMin: 11,
    labLink: "aipm",
    labLabel: "Try PRD Simulator →",
    tags: ["PRD", "AI PM", "product management"],
  },
  {
    id: "ai-or-not",
    category: "product",
    title: "AI-or-Not? A Decision Framework for Product Managers",
    desc: "When AI is the right solution and when it's not. The 6-question framework to avoid building AI for its own sake — and how to defend the decision either way.",
    readMin: 9,
    labLink: "aipm",
    labLabel: "Use the Framework →",
    tags: ["AI decision", "product strategy", "AI PM"],
  },
  {
    id: "ai-roadmap-prioritisation",
    category: "product",
    title: "AI Roadmap Prioritisation: How to Decide What to Build Next",
    desc: "Impact/feasibility for AI — why standard prioritisation frameworks break. How to score AI initiatives accounting for data readiness, model risk, and iteration speed.",
    readMin: 10,
    labLink: "aipm",
    labLabel: "Run Prioritizer →",
    tags: ["roadmap", "prioritisation", "AI PM"],
  },
  {
    id: "explaining-ai-to-stakeholders",
    category: "product",
    title: "Explaining AI to Non-Technical Stakeholders: Frameworks That Work",
    desc: "How to explain RAG, agents, hallucination risk, and eval gaps to execs, legal, and ops teams — without losing them or dumbing it down.",
    readMin: 8,
    labLink: "aipm",
    labLabel: "Try Stakeholder Explainer →",
    tags: ["stakeholders", "communication", "AI PM"],
  },
  {
    id: "ai-launch-checklist",
    category: "product",
    title: "The AI Launch Checklist: What to Verify Before Going Live",
    desc: "Eval gate, fallback behaviour, latency SLA, cost guardrails, safety review, legal sign-off, monitoring setup — the full pre-launch checklist for AI features.",
    readMin: 9,
    labLink: "aipm",
    labLabel: "Use the Checklist →",
    tags: ["launch", "checklist", "AI PM", "production"],
  },
  {
    id: "model-card-reader",
    category: "product",
    title: "How to Read a Model Card: What PMs and Engineers Actually Need to Know",
    desc: "What model cards tell you about training data, benchmarks, limitations, and bias — and how to use them to make informed model selection decisions.",
    readMin: 7,
    labLink: "explore",
    labLabel: "Read Model Cards →",
    tags: ["model card", "model selection", "transparency"],
  },

  // ─── INTERVIEW & CAREER ───────────────────────────────────────────────────────

  {
    id: "llm-interview-question-patterns",
    category: "interview",
    title: "LLM Interview Question Patterns: What Senior Engineers Actually Ask",
    desc: "The 10 question categories, common traps, and how to structure 4-layer answers. From 'explain self-attention' to 'design a RAG evaluation pipeline'.",
    readMin: 12,
    labLink: "fluency",
    labLabel: "Practice in Fluency →",
    tags: ["interview prep", "LLM questions", "AI engineer"],
  },
  {
    id: "rag-interview-questions",
    category: "interview",
    title: "25 RAG Interview Questions With Model Answers",
    desc: "Covering retrieval, chunking, reranking, evaluation, failure modes, and system design — with strong answers and the traps interviewers use to filter candidates.",
    readMin: 15,
    labLink: "lab",
    labLabel: "Test Yourself in RAG Lab →",
    tags: ["RAG interview", "interview prep", "system design"],
  },
  {
    id: "ai-case-interview",
    category: "interview",
    title: "How to Ace an AI Case Interview: Structure, Signals, and What Kills Candidates",
    desc: "How top companies structure AI case interviews, what signals they're evaluating, and a repeatable framework for breaking down an AI product or system case.",
    readMin: 11,
    labLink: "fluency",
    labLabel: "Try Case Arena →",
    tags: ["case interview", "AI PM", "AI engineer"],
  },
  {
    id: "ai-vocabulary",
    category: "interview",
    title: "The AI Vocabulary Cheat Sheet: 80 Terms You Need to Know Cold",
    desc: "From attention to zero-shot — the 80 terms that come up in AI interviews, product reviews, and engineering discussions. Definitions plus context for each.",
    readMin: 12,
    labLink: "fluency",
    labLabel: "Drill in Fluency →",
    tags: ["vocabulary", "glossary", "AI terms"],
  },
  {
    id: "take-home-challenges",
    category: "interview",
    title: "How to Crush AI Take-Home Challenges: What Evaluators Actually Look For",
    desc: "What separates strong from weak take-homes — problem framing, eval design, failure analysis, and documentation. A checklist before you submit.",
    readMin: 10,
    labLink: "career",
    labLabel: "Practice in Career →",
    tags: ["take-home", "interview", "portfolio"],
  },
  {
    id: "ai-benchmarks-explained",
    category: "interview",
    title: "AI Benchmarks Explained: What MMLU, HumanEval, HELM, and LMSYS Actually Measure",
    desc: "What each benchmark tests, its known weaknesses, and how to use benchmark results to make real hiring and model selection decisions without being misled.",
    readMin: 9,
    labLink: "career",
    labLabel: "Explore Benchmarks →",
    tags: ["benchmarks", "MMLU", "HumanEval", "LMSYS"],
  },
  {
    id: "context-tetris",
    category: "interview",
    title: "Context Tetris: Why What You Put in the Prompt Matters as Much as the Model",
    desc: "How to think about context window real estate — system prompt, examples, retrieved chunks, history, and query. Optimising the slot machine that is your prompt.",
    readMin: 7,
    labLink: "playground",
    labLabel: "Play Context Tetris →",
    tags: ["context window", "prompt design", "token budget"],
  },

  // ─── MODEL PROFILES ──────────────────────────────────────────────────────────

  {
    id: "how-claude-works",
    category: "models",
    title: "How Claude Works: Constitutional AI, 200K Context, and What Makes It Different",
    desc: "Anthropic's Constitutional AI training approach, the Opus/Sonnet/Haiku family, extended thinking, and where Claude outperforms competing frontier models.",
    readMin: 8,
    labLink: "playground",
    labLabel: "Try Claude in Playground →",
    tags: ["Claude", "Anthropic", "Constitutional AI"],
  },
  {
    id: "how-chatgpt-works",
    category: "models",
    title: "How ChatGPT Works: GPT-4o, RLHF, and the o1 Reasoning Models",
    desc: "From the base GPT model to RLHF fine-tuning to GPT-4o's native multimodality. What OpenAI's model family does and how o1/o3 reasoning models think differently.",
    readMin: 8,
    labLink: "playground",
    labLabel: "Compare in Playground →",
    tags: ["ChatGPT", "GPT-4o", "RLHF", "o1"],
  },
  {
    id: "how-gemini-works",
    category: "models",
    title: "How Gemini Works: 1M Context, Native Multimodality, and Google's AI Stack",
    desc: "Gemini's architecture and model family, the 1M-token context window, native video/audio understanding, and how it integrates with Google's product ecosystem.",
    readMin: 8,
    labLink: "explore",
    labLabel: "Compare Models →",
    tags: ["Gemini", "Google", "multimodal", "long context"],
  },
  {
    id: "llama-open-models",
    category: "models",
    title: "Llama 3 and the Open-Source Model Ecosystem: What You Can Build",
    desc: "Meta's Llama 3 family, why open weights matter, what you can actually do locally (Ollama, llama.cpp), fine-tuning with LoRA, and the full open-source model landscape.",
    readMin: 10,
    labLink: "explore",
    labLabel: "Explore Open Models →",
    tags: ["Llama", "open source", "Ollama", "LoRA"],
  },
  {
    id: "mistral-cohere-frontier",
    category: "models",
    title: "Mistral, Cohere, and the Frontier Beyond OpenAI/Anthropic",
    desc: "Mistral's efficient architecture and open weights, Cohere's enterprise focus and Command R+, and how to evaluate non-hyperscaler models for your use case.",
    readMin: 8,
    labLink: "explore",
    labLabel: "Compare Models →",
    tags: ["Mistral", "Cohere", "Command R", "frontier models"],
  },
  {
    id: "model-benchmarks-deep-dive",
    category: "models",
    title: "Reading Model Benchmarks Without Being Misled",
    desc: "MMLU, HumanEval, LMSYS Chatbot Arena, HELM, SWE-bench — what each measures, its known flaws, and how to pick a model based on your actual use case, not marketing.",
    readMin: 9,
    labLink: "explore",
    labLabel: "Compare on Benchmarks →",
    tags: ["benchmarks", "MMLU", "Arena", "model selection"],
  },

  // ─── INDUSTRY AI ─────────────────────────────────────────────────────────────

  {
    id: "ai-at-top-companies",
    category: "industry",
    title: "How Top Tech Companies Are Rebuilding Their Products Around AI",
    desc: "Google's Gemini-first strategy, Microsoft's Copilot bet, Meta's open-source play, Apple's on-device privacy-first approach, and Salesforce Agentforce.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Design Enterprise AI →",
    tags: ["Google", "Microsoft", "Meta", "Apple", "enterprise AI"],
  },
  {
    id: "ai-in-fintech",
    category: "industry",
    title: "AI in Fintech: Fraud Detection, Underwriting, and Compliance Automation",
    desc: "How banks and fintechs are deploying LLMs and ML for real-time fraud detection, credit decisioning, document processing, and regulatory reporting.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Explore AI Systems →",
    tags: ["fintech", "fraud detection", "compliance", "LLMs in finance"],
  },
  {
    id: "ai-in-healthcare",
    category: "industry",
    title: "AI in Healthcare: Clinical NLP, Medical Coding, and the Hallucination Problem",
    desc: "Where AI is being deployed in clinical workflows, why hallucination is an existential risk in medical AI, and the regulatory landscape for health LLMs.",
    readMin: 10,
    labLink: "systems",
    labLabel: "Explore AI Systems →",
    tags: ["healthcare AI", "clinical NLP", "medical AI"],
  },
  {
    id: "ai-in-enterprise-saas",
    category: "industry",
    title: "AI Features in Enterprise SaaS: What's Working and What's Theatre",
    desc: "The patterns that deliver real enterprise value (copilots, intelligent search, workflow automation) vs. AI features shipped for press release purposes.",
    readMin: 9,
    labLink: "aipm",
    labLabel: "Use the AI-or-Not Framework →",
    tags: ["enterprise SaaS", "AI features", "product strategy"],
  },
  {
    id: "solo-operator-ai",
    category: "industry",
    title: "The Solo Operator: How AI Lets One Person Run a Business That Used to Need a Team",
    desc: "AI as a force multiplier for individuals — the real workflows (content, support, code, research, outreach) where solo operators are replacing teams, and how to build this stack.",
    readMin: 9,
    labLink: "agents",
    labLabel: "Build Agent Workflows →",
    tags: ["solo operator", "AI productivity", "automation", "founder"],
  },

  // ─── CAREERS & SALARIES ──────────────────────────────────────────────────────

  {
    id: "ai-engineer-role",
    category: "career",
    title: "What Is an AI Engineer? Role, Skills, and How It Differs from ML Engineer",
    desc: "The new AI Engineer role — what companies actually want, the technical stack (RAG, agents, evals, LLMOps), and how it differs from ML Engineering and Data Science.",
    readMin: 9,
    labLink: "career",
    labLabel: "Prep for AI Engineer Interviews →",
    tags: ["AI engineer", "role definition", "career"],
  },
  {
    id: "ml-engineer-role",
    category: "career",
    title: "What Does an ML Engineer Actually Do in 2025?",
    desc: "The evolving ML Engineer role post-LLM revolution — what's changed, what's still core (training, MLOps, model serving), and how to position yourself.",
    readMin: 8,
    labLink: "career",
    labLabel: "Explore Career Paths →",
    tags: ["ML engineer", "MLOps", "career"],
  },
  {
    id: "ai-pm-role",
    category: "career",
    title: "The AI Product Manager: What's Different, What's the Same, and How to Break In",
    desc: "How AI PM differs from traditional PM — working with probabilistic systems, writing AI-specific PRDs, speaking the language of evals, and hiring the right team.",
    readMin: 9,
    labLink: "aipm",
    labLabel: "Practice AI PM Skills →",
    tags: ["AI PM", "product manager", "career"],
  },
  {
    id: "ai-salary-guide",
    category: "career",
    title: "AI/ML Salary Guide 2025: Ranges, Levers, and How to Negotiate",
    desc: "Real comp data for AI Engineer, ML Engineer, Research Scientist, and AI PM across US, UK, EU, and India — plus the specific skills and signals that move your number.",
    readMin: 9,
    labLink: "career",
    labLabel: "Benchmark Your Profile →",
    tags: ["salary", "compensation", "negotiation", "AI career"],
  },
  {
    id: "breaking-into-ai",
    category: "career",
    title: "Breaking Into AI: The Fastest Path from Software Engineer to AI Engineer",
    desc: "The exact learning path, project types, and portfolio signals that get backend/frontend engineers hired as AI engineers — in 3-6 months, not 3 years.",
    readMin: 10,
    labLink: "career",
    labLabel: "Build Your Plan →",
    tags: ["career transition", "AI engineer", "learning path"],
  },
];

export default function GroundTruth({ onNavigate }) {
  const [filter, setFilter] = useState("all");
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => { track("ground_truth_viewed", {}); }, []);

  if (openPost) {
    return <PostDetail post={openPost} onBack={() => setOpenPost(null)} onNavigate={onNavigate} />;
  }

  // Only show posts that have written content
  const WRITTEN = POSTS.filter(p => !!POST_CONTENT[p.id]);
  const visible = filter === "all" ? WRITTEN : WRITTEN.filter(p => p.category === filter);
  const total = WRITTEN.length;
  const totalPlanned = POSTS.length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-2">
            Read it. Then break it on the platform.
          </p>
          <h1 className="text-2xl font-black text-white mb-2">Ground Truth</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
            Production-depth writing on RAG, agents, evaluation, LLMOps, safety, and system design.
            Every piece links directly to the lab module where you test what you just read.
          </p>
        </div>

        {/* Progress banner */}
        <div className="rounded-xl border border-violet-900/50 bg-violet-950/20 px-4 py-3 mb-8 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
          <p className="text-sm text-violet-300">
            <span className="font-bold">{total} pieces live.</span>
            <span className="text-violet-400"> {totalPlanned - total} more in the writing queue — check back soon.</span>
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(c => {
            const count = c.id === "all" ? WRITTEN.length : WRITTEN.filter(p => p.category === c.id).length;
            if (count === 0) return null;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === c.id
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                }`}>
                {c.label}
                <span className="ml-1.5 text-[9px] opacity-50">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Post grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(post => {
            const color = CAT_COLORS[post.category] || "#6366f1";
            const catLabel = CATEGORIES.find(c => c.id === post.category)?.label || post.category;
            const hasContent = !!POST_CONTENT[post.id];
            return (
              <div
                key={post.id}
                onClick={() => { track("ground_truth_card_clicked", { post: post.id }); setOpenPost(post); }}
                className={`rounded-xl border p-4 flex flex-col gap-3 relative overflow-hidden cursor-pointer transition-all hover:border-zinc-600 ${hasContent ? "border-zinc-700 bg-zinc-900/50" : "border-zinc-800 bg-zinc-900/30"}`}>

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${color}99, transparent)` }} />

                {/* Category + read time */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ color, background: color + "22", border: `1px solid ${color}44` }}>
                    {catLabel}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono">{post.readMin} min</span>
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
                  {hasContent
                    ? <span className="text-[10px] font-mono font-bold" style={{ color }}>Read →</span>
                    : <span className="text-[10px] text-zinc-600 font-mono italic">Coming soon</span>
                  }
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      track("ground_truth_lab_link", { post: post.id, lab: post.labLink });
                      onNavigate(post.labLink);
                    }}
                    className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors">
                    {post.labLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center space-y-1">
          <p className="text-xs text-zinc-600 font-mono">{total} pieces live · {totalPlanned - total} more coming · every piece links to an interactive module</p>
          <button onClick={() => onNavigate("home")}
            className="text-xs text-zinc-500 hover:text-white transition-colors font-mono underline">
            ← Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
