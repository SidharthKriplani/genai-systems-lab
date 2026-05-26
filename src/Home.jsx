import { useState, useEffect, useMemo, useRef } from "react";
import { track, FEEDBACK_URL, isFeedbackReady } from "./analytics";

function CountUp({ target, duration = 1200, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const DAILY_TIPS = [
  "Temperature 0 does not mean no randomness. It means greedy decoding. The model always picks the highest-probability token. Useful for deterministic tasks, but can cause repetitive loops.",
  "Prompt caching in Claude can cut costs by 90%. Structure prompts so the static system prompt comes first and dynamic user content comes last. Cache hits on the prefix.",
  "RAG retrieves by similarity, not by correctness. A chunk can score 0.92 cosine similarity and still be factually irrelevant to the question. Always add a reranker.",
  "The lost in the middle problem: LLMs recall information at the start and end of context best. Put your most critical instructions at the beginning and the end, not the middle.",
  "Fine-tuning does not add new knowledge. It changes style and format. If you need the model to know new facts, use RAG. If you need it to output a specific structure reliably, fine-tune.",
  "One token is approximately 4 characters in English, but 1-2 characters in Chinese, Japanese, or Korean. A 1000-token budget goes much further for English content than CJK content.",
  "The ReAct pattern (Reason + Act) works because it forces the model to write out its reasoning before calling a tool. This reduces hallucinated tool calls by ~40% vs. direct tool use.",
  "Vector databases use Approximate Nearest Neighbor (ANN) search, not exact. They trade a small recall penalty for massive speed gains. At 1M vectors, exact search would take seconds; ANN takes milliseconds.",
  "LLM-as-judge evals have a self-preference bias: GPT-4 rates GPT-4 outputs higher; Claude rates Claude outputs higher. Always calibrate your judge against human labels.",
  "Batch API calls are 50% cheaper than real-time calls for both OpenAI and Anthropic. Any offline job (nightly summaries, document indexing, batch classification) should use the batch API.",
  "Chunking strategy matters more than most people realize. 512-token fixed chunks with 50-token overlap is a reasonable default, but semantic chunking (splitting at topic boundaries) improves retrieval precision by 15-30%.",
  "Multi-agent systems fail in non-obvious ways: conflicting outputs from two agents, one agent waiting forever for another, cascading hallucinations. Always define a clear contract (schema) between agents.",
  "LoRA fine-tuning adds trainable rank-r matrices alongside frozen weights. r=16 gives 95% of full fine-tune quality at 1% of the compute cost. Start at r=16, only go higher if quality is insufficient.",
  "Guardrails have false positive rates. A well-tuned input classifier might block 2-5% of legitimate queries. Track your FP rate in production. Over-blocking is a real UX problem.",
  "The helpful, harmless, honest alignment goal is easier said than done because they trade off. A maximally helpful response sometimes requires sharing information that is potentially harmful.",
  "Semantic caching saves cost by returning cached responses for semantically similar (not just identical) queries. At 50K queries/day, 30-40% of queries are semantically duplicate.",
  "RLHF does not teach models new facts. It shifts the distribution of outputs toward what human raters prefer. It is a style transfer, not a knowledge injection.",
  "The context window is not free. Attention is O(n^2) in sequence length. Doubling context length quadruples compute cost for the attention mechanism. This is why just use a 1M context window is not always the answer.",
  "Tool calls from agents should have a consequence level: read-only (safe to call freely), idempotent write (safe to retry), destructive write (require confirmation). Never let an agent delete without a human gate.",
  "Embedding models have a semantic tunnel vision problem: they capture topic similarity well but miss procedural or causal relationships. how to fix X and X is broken may score low similarity despite being highly relevant.",
  "A/B testing LLM prompts is harder than testing UI changes because LLM outputs are not binary. Use multi-dimensional evals: quality, safety, helpfulness, and groundedness, not just a single thumbs-up metric.",
  "The best eval metric is task completion rate, not output quality. A slightly lower-quality response that completes the user goal is better than a beautifully written response that does not.",
  "Structured output mode (JSON mode) dramatically reduces hallucinations for slot-filling tasks. The model is constrained to valid JSON, which forces it to be explicit about what it knows vs. what it is guessing.",
  "Observability for LLM apps needs four signal types: latency (per stage), quality (sampled evals), cost (per request), and safety (guardrail hit rates). Missing any one of these leaves you flying blind.",
  "Human evaluation is the only ground truth for LLM quality, but it is expensive. The right approach: 50-100 human-labeled examples to calibrate an LLM-as-judge, then run the judge at scale.",
  "Multimodal models do not see images the way humans do. They tokenize image patches and process them as token sequences. Resolution, aspect ratio, and image compression all affect what the model sees.",
  "Constitutional AI (CAI) trains models to critique and revise their own outputs against a set of principles. It is more scalable than RLHF because it does not require human labelers for every revision.",
  "The needle in a haystack benchmark tests whether a model can retrieve a specific fact from a long context. Most models struggle with facts placed in the middle 50% of a 128K+ context.",
  "Hallucination rates vary by task: closed-book Q&A (~20-40%), math (~5-15%), code (~10-20%), factual extraction from given text (~2-8%). Always measure on your specific task. Averages are misleading.",
  "Model distillation creates smaller, faster models by training them to mimic a larger model's output distribution (not just its labels). GPT-4 distilling into a smaller model is how many fine-tuned 7B models get strong general capabilities.",
];

const PATHS = {
  engineer: [
    { step: 1, label: "Tokenization & Embeddings", tab: "concepts", desc: "How text becomes numbers" },
    { step: 2, label: "RAG Pipeline", tab: "flows", desc: "The full retrieval pipeline" },
    { step: 3, label: "RAG Lab", tab: "lab", desc: "Build intuition by breaking configs" },
    { step: 4, label: "Systems: Evals Lab", tab: "systems", desc: "How to measure quality" },
    { step: 5, label: "Agent Loop", tab: "agents", desc: "Multi-step tool-using agents" },
    { step: 6, label: "Fine-Tuning Lab", tab: "systems", desc: "When and how to fine-tune" },
    { step: 7, label: "Explore: 3D Visualisations", tab: "explore", desc: "Deep intuition builders" },
    { step: 8, label: "Systems Design Interview", tab: "career", desc: "Practice designing AI systems" },
  ],
  pm: [
    { step: 1, label: "What Is a Transformer?", tab: "groundtruth", desc: "Foundation without the math" },
    { step: 2, label: "AI Product", tab: "aipm", desc: "PRDs, metrics, roadmaps for AI" },
    { step: 3, label: "Should You Use AI?", tab: "systems", desc: "Decision framework for AI features" },
    { step: 4, label: "RAG Lab", tab: "lab", desc: "See what AI failures look like" },
    { step: 5, label: "Eval Frameworks", tab: "systems", desc: "How to measure AI quality as a PM" },
    { step: 6, label: "Model Strategy", tab: "systems", desc: "Cost, latency, quality tradeoffs" },
    { step: 7, label: "AI Product metrics post", tab: "groundtruth", desc: "What to track at each stage" },
    { step: 8, label: "Stakeholder Explainer", tab: "aipm", desc: "How to talk about AI to execs" },
  ],
  researcher: [
    { step: 1, label: "Transformer Architecture", tab: "flows", desc: "How the forward pass works" },
    { step: 2, label: "Self-Attention Deep Dive", tab: "groundtruth", desc: "QKV matrices explained" },
    { step: 3, label: "Explore: 3D Attention", tab: "explore", desc: "Visualise attention patterns" },
    { step: 4, label: "Sampling Strategies", tab: "concepts", desc: "Temperature, top-p, top-k" },
    { step: 5, label: "RLHF & DPO", tab: "groundtruth", desc: "Alignment training techniques" },
    { step: 6, label: "Research Papers", tab: "groundtruth", desc: "15 landmark papers with commentary" },
    { step: 7, label: "Fine-Tuning Lab", tab: "systems", desc: "LoRA, config simulator, 3D viz" },
    { step: 8, label: "Eval Lab", tab: "systems", desc: "How to measure model quality" },
  ],
  interview: [
    { step: 1, label: "Fluency: Timed Drills", tab: "fluency", desc: "Speed and breadth under pressure" },
    { step: 2, label: "Fluency: Flashcards", tab: "fluency", desc: "Master the vocabulary" },
    { step: 3, label: "Fluency: Mock Interview", tab: "fluency", desc: "Practice behavioural + technical Qs" },
    { step: 4, label: "Career: System Design", tab: "career", desc: "Design AI systems on the whiteboard" },
    { step: 5, label: "Career: Negotiation Sim", tab: "career", desc: "Practice offer negotiation" },
    { step: 6, label: "RAG Lab", tab: "lab", desc: "The most common interview topic" },
    { step: 7, label: "AI Readiness Assessment", tab: "fluency", desc: "Benchmark your knowledge" },
    { step: 8, label: "Ground Truth: Interview Prep", tab: "groundtruth", desc: "All interview posts" },
  ],
};

function SuggestedPath({ role, onNavigate }) {
  const steps = PATHS[role] || [];
  return (
    <div className="space-y-1.5 pt-1">
      {steps.map(s => (
        <button key={s.step} onClick={() => onNavigate(s.tab)}
          className="w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-all group">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 bg-violet-600/20 text-violet-400 group-hover:bg-violet-600/40">
            {s.step}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white">{s.label}</span>
            <span className="text-xs text-zinc-600 ml-1.5">{s.desc}</span>
          </div>
          <span className="text-zinc-700 group-hover:text-violet-400 text-xs transition-colors">→</span>
        </button>
      ))}
    </div>
  );
}

const START_HERE_PATH = [
  { step: 1, label: "Tokenizer",     tab: "concepts", desc: "How text becomes numbers" },
  { step: 2, label: "Embeddings",    tab: "concepts", desc: "Meaning as geometry" },
  { step: 3, label: "Context Window",tab: "concepts", desc: "Attention cost + overflow" },
  { step: 4, label: "RAG Flows",     tab: "flows",    desc: "End-to-end pipeline" },
  { step: 5, label: "RAG Failures",  tab: "lab",      desc: "Break it to understand it" },
  { step: 6, label: "Agent Loop",    tab: "concepts", desc: "ReAct trace step-by-step" },
  { step: 7, label: "Debug RAG",     tab: "concepts", desc: "Diagnose 5 real incidents" },
];

const LEARNING_PATHS = [
  {
    id: "rag",
    nextPath: "engineer",
    nextPathLabel: "AI Engineer Path",
    title: "Production RAG Path",
    color: "#6366f1",
    tagline: "Go from RAG theory to breaking it in production. The fastest way to build real intuition.",
    outcome: "You'll be able to configure a production RAG system, anticipate failure modes before they hit users, and explain the tradeoffs in a system design interview.",
    duration: "~3 hrs",
    steps: [
      { tab: "concepts",   label: "Concepts",    desc: "Embeddings, chunking, context window" },
      { tab: "flows",      label: "Flows",       desc: "End-to-end RAG pipeline diagrams" },
      { tab: "lab",        label: "RAG Lab",     desc: "Simulate 6 production failure modes" },
      { tab: "playground", label: "Playground",  desc: "Injection, chunking, reranker hands-on" },
      { tab: "explore",    label: "Explore",     desc: "Vector DB comparison + red teaming" },
    ],
  },
  {
    id: "engineer",
    nextPath: "interview",
    nextPathLabel: "Interview Prep Path",
    title: "AI Engineer Path",
    color: "#3b82f6",
    tagline: "Full stack: understand the stack, build with agents, and debug failures before they hit prod.",
    outcome: "You'll be able to build and debug full AI systems — from RAG pipelines to multi-agent loops — and reason about production failures the way senior engineers do.",
    duration: "~5 hrs",
    steps: [
      { tab: "concepts",   label: "Concepts",    desc: "Tokenizer → transformers → agents" },
      { tab: "flows",      label: "Flows",       desc: "RAG, agent loop, guardrail pipeline" },
      { tab: "lab",        label: "RAG Lab",     desc: "Production failure simulator" },
      { tab: "agents",     label: "Agents",      desc: "Multi-agent loops and orchestration" },
      { tab: "playground", label: "Playground",  desc: "Chunking, reranker, hallucination" },
    ],
  },
  {
    id: "pm",
    nextPath: "interview",
    nextPathLabel: "Interview Prep Path",
    title: "PM / AI Product Path",
    color: "#22c55e",
    tagline: "Understand what LLMs actually do, what breaks, and how to write specs that don't get laughed at.",
    outcome: "You'll be able to write credible AI feature specs, challenge engineering estimates, and explain to stakeholders exactly what LLMs can and can't do.",
    duration: "~2.5 hrs",
    steps: [
      { tab: "concepts",   label: "Concepts",    desc: "What LLMs do — no fluff" },
      { tab: "flows",      label: "Flows",       desc: "RAG pipeline + guardrails" },
      { tab: "lab",        label: "RAG Lab",     desc: "See failure modes firsthand" },
      { tab: "playground", label: "Playground",  desc: "Spot hallucinations, detect bias" },
      { tab: "explore",    label: "Explore",     desc: "Model cards + latency tradeoffs" },
    ],
  },
  {
    id: "interview",
    nextPath: null,
    nextPathLabel: null,
    title: "Interview Prep Path",
    color: "#f59e0b",
    tagline: "Cover the system design patterns, failure scenarios, and architecture questions that show up most.",
    outcome: "You'll be able to answer the core system design and failure-diagnosis questions that appear in AI engineer and technical PM interviews at Spotify, Meta, Google, and Airbnb.",
    duration: "~2.5 hrs",
    steps: [
      { tab: "concepts",   label: "Concepts",    desc: "Core architecture — attention, RAG, agents" },
      { tab: "flows",      label: "Flows",       desc: "System design diagrams to sketch" },
      { tab: "lab",        label: "RAG Lab",     desc: "Failure patterns interviewers test" },
      { tab: "playground", label: "Playground",  desc: "Injection + hallucination detection" },
      { tab: "explore",    label: "Explore",     desc: "Benchmarks + model card literacy" },
    ],
  },
];

const MODULE_MAP = [
  {
    group: "LEARN",
    color: "#6366f1",
    desc: "Build the mental model before you build the system.",
    modules: [
      { tab: "concepts", icon: "🧠", title: "Concepts", audience: "All levels",
        desc: "After this: you can explain how tokenization, attention, and transformer architecture actually work — in the technical depth that gets you through senior AI engineer interviews.",
        discovery: "Even if you know transformers: the attention weight explorer shows patterns most tutorials skip." },
      { tab: "flows", icon: "🌊", title: "Flows", audience: "All levels",
        desc: "After this: you can sketch RAG pipelines, agent loops, and guardrail architectures from memory — including the failure points interviewers specifically probe.",
        discovery: "The RAG Architectures module covers Hybrid, CRAG, and Agentic RAG — often the gap between junior and senior engineers." },
    ],
  },
  {
    group: "BUILD",
    color: "#3b82f6",
    desc: "Simulate, break, and fix real production systems.",
    modules: [
      { tab: "lab", icon: "🔬", title: "RAG Lab", audience: "Engineers",
        desc: "After this: you can configure, break, and diagnose the 6 most common RAG production failure modes — the kind of intuition that only comes from doing it, not reading about it.",
        discovery: "Configure top_k=1 with no reranker and watch a 3-year-old policy answer confidently. Hard to forget." },
      { tab: "systems", icon: "⚙️", title: "Systems", audience: "Engineers · PMs",
        desc: "Evals, eval frameworks, model strategy, cost/latency, fine-tuning, observability, ML CI/CD, context compaction. 15 production modules.",
        discovery: "The Incident Room has 5 real failure post-mortems. The Eval Frameworks module covers RAGAS, G-Eval, and custom grading." },
      { tab: "playground", icon: "🛝", title: "Playground", audience: "All levels",
        desc: "After this: you've built and defended against prompt injection attacks, compared chunking strategies first-hand, and caught hallucinations in real outputs.",
        discovery: "Build your own prompt injection attack and watch it succeed — then switch sides and defend against it." },
      { tab: "explore", icon: "🔭", title: "Explore", audience: "Engineers",
        desc: "After this: you can compare vector DBs on real criteria, read model cards critically, and explain shadow A/B testing — the depth that separates senior from junior AI engineers.",
        discovery: "The Shadow A/B module models what happens when two model versions run in parallel — a setup most engineers have never seen." },
    ],
  },
  {
    group: "GROW",
    color: "#22c55e",
    desc: "Communicate, ship, and advance your career.",
    modules: [
      { tab: "fluency", icon: "💬", title: "Fluency Gym", audience: "Interview prep",
        desc: "Phrase bank, timed drills, mock interview (18 questions, 90s each), company case arena, prompt engineering lab.",
        discovery: "The mock interview uses real question patterns from AI engineer and PM interviews at top companies." },
      { tab: "aipm", icon: "📋", title: "AIPM Track", audience: "Product managers",
        desc: "PRD simulator, roadmap prioritizer, stakeholder explainer, launch checklist, 'AI or not?' decision framework.",
        discovery: "The AI-or-not? framework is the one thing most PMs say they needed a year ago." },
      { tab: "career", icon: "🚀", title: "Career Track", audience: "Job seekers",
        desc: "System design interviews, take-home challenges, negotiation flashcards, benchmark literacy.",
        discovery: "The take-home challenges simulate the exact format used by most AI-forward companies: rank outputs, fix a broken prompt, design an eval." },
    ],
  },
];

const STATS = [
  { value: "3,400+", target: 3400, suffix: "+", label: "Learners",           sub: "Engineers & PMs",   tab: null           },
  { value: "200+",   target: 200,  suffix: "+", label: "Ground Truth posts", sub: "Production depth",  tab: "groundtruth"  },
  { value: "200+",   target: 200,  suffix: "+", label: "Challenges",         sub: "All interactive",   tab: null           },
];

// ─── CONCEPT DEPENDENCY GRAPH ─────────────────────────────────────────────────
const NODE_W = 108, NODE_H = 26;
const DEP_NODES = [
  { id: "tokenizer",  label: "Tokenization",  tab: "concepts", x: 75,  y: 22,  color: "#6366f1" },
  { id: "embeddings", label: "Embeddings",    tab: "concepts", x: 75,  y: 93,  color: "#6366f1" },
  { id: "attention",  label: "Attention",     tab: "concepts", x: 75,  y: 163, color: "#6366f1" },
  { id: "context",    label: "Context Window",tab: "concepts", x: 218, y: 57,  color: "#3b82f6" },
  { id: "sampling",   label: "Sampling",      tab: "concepts", x: 218, y: 127, color: "#3b82f6" },
  { id: "rag_flow",   label: "RAG Pipeline",  tab: "flows",    x: 370, y: 22,  color: "#06b6d4" },
  { id: "agent_flow", label: "Agent Loop",    tab: "flows",    x: 370, y: 93,  color: "#06b6d4" },
  { id: "guardrail",  label: "Guardrails",    tab: "flows",    x: 370, y: 163, color: "#06b6d4" },
  { id: "rag_lab",    label: "RAG Lab",       tab: "lab",      x: 522, y: 57,  color: "#22c55e" },
  { id: "agent_lab",  label: "Agent Lab",     tab: "agents",   x: 522, y: 135, color: "#22c55e" },
  { id: "evals",      label: "Evals Lab",     tab: "systems",  x: 672, y: 30,  color: "#f59e0b" },
  { id: "finetune",   label: "Fine-Tuning",   tab: "systems",  x: 672, y: 103, color: "#f59e0b" },
  { id: "systems",    label: "Systems",       tab: "systems",  x: 672, y: 173, color: "#f59e0b" },
];
const DEP_EDGES = [
  { from: "tokenizer",  to: "context"    },
  { from: "tokenizer",  to: "sampling"   },
  { from: "embeddings", to: "context"    },
  { from: "embeddings", to: "rag_flow"   },
  { from: "attention",  to: "agent_flow" },
  { from: "attention",  to: "guardrail"  },
  { from: "context",    to: "rag_flow"   },
  { from: "context",    to: "agent_flow" },
  { from: "sampling",   to: "rag_flow"   },
  { from: "rag_flow",   to: "rag_lab"    },
  { from: "agent_flow", to: "agent_lab"  },
  { from: "guardrail",  to: "agent_lab"  },
  { from: "rag_lab",    to: "evals"      },
  { from: "rag_lab",    to: "finetune"   },
  { from: "agent_lab",  to: "evals"      },
  { from: "evals",      to: "systems"    },
  { from: "finetune",   to: "systems"    },
];
function ConceptGraph({ onNavigate }) {
  const [selected, setSelected] = useState(null);
  const nodeMap = useMemo(() => Object.fromEntries(DEP_NODES.map(n => [n.id, n])), []);
  const prereqs    = selected ? DEP_EDGES.filter(e => e.to   === selected).map(e => e.from) : [];
  const dependents = selected ? DEP_EDGES.filter(e => e.from === selected).map(e => e.to)   : [];
  const sel = selected ? DEP_NODES.find(n => n.id === selected) : null;

  function edgeState(e) {
    if (!selected) return "idle";
    if (e.from === selected) return "unlocks";
    if (e.to   === selected) return "prereq";
    return "dim";
  }
  function nodeOpacity(n) {
    if (!selected) return 1;
    if (n.id === selected || prereqs.includes(n.id) || dependents.includes(n.id)) return 1;
    return 0.2;
  }
  function nodeStroke(n) {
    if (n.id === selected) return n.color;
    if (prereqs.includes(n.id))    return "#f59e0b";
    if (dependents.includes(n.id)) return "#22c55e";
    return "#3f3f46";
  }
  function nodeFill(n) {
    if (n.id === selected) return n.color + "33";
    if (prereqs.includes(n.id))    return "#f59e0b18";
    if (dependents.includes(n.id)) return "#22c55e18";
    return "#18181b";
  }
  function nodeTextFill(n) {
    if (n.id === selected) return "#fff";
    if (prereqs.includes(n.id))    return "#f59e0b";
    if (dependents.includes(n.id)) return "#22c55e";
    return "#71717a";
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <svg viewBox="0 0 762 205" className="w-full min-w-[600px]" style={{ height: 205 }}>
          {/* Column labels */}
          {[
            { label: "FOUNDATION", x: 75,  c: "#6366f1" },
            { label: "CONCEPTS",   x: 218, c: "#3b82f6" },
            { label: "PATTERNS",   x: 370, c: "#06b6d4" },
            { label: "PRACTICE",   x: 522, c: "#22c55e" },
            { label: "ADVANCED",   x: 672, c: "#f59e0b" },
          ].map(col => (
            <text key={col.label} x={col.x} y={11} textAnchor="middle" fontSize="7.5"
              fontFamily="monospace" fontWeight="700" letterSpacing="0.08em" fill={col.c + "88"}>{col.label}</text>
          ))}
          {/* Edges */}
          {DEP_EDGES.map((e, i) => {
            const s = nodeMap[e.from], d = nodeMap[e.to];
            if (!s || !d) return null;
            const x1 = s.x + NODE_W / 2, y1 = s.y + NODE_H / 2;
            const x2 = d.x - NODE_W / 2, y2 = d.y + NODE_H / 2;
            const cx = (x1 + x2) / 2;
            const st = edgeState(e);
            const col = st === "unlocks" ? "#22c55e" : st === "prereq" ? "#f59e0b" : st === "dim" ? "#27272a" : "#3f3f46";
            return (
              <path key={i} d={`M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`}
                fill="none" stroke={col} strokeWidth={st !== "idle" && st !== "dim" ? 1.5 : 1}
                strokeOpacity={st === "dim" ? 0.3 : 0.7}
                style={{ transition: "stroke 0.18s, stroke-opacity 0.18s" }} />
            );
          })}
          {/* Nodes */}
          {DEP_NODES.map(n => (
            <g key={n.id} style={{ opacity: nodeOpacity(n), cursor: "pointer", transition: "opacity 0.18s" }}
              onClick={() => setSelected(prev => prev === n.id ? null : n.id)}
              onDoubleClick={() => onNavigate(n.tab)}>
              <rect x={n.x - NODE_W / 2} y={n.y} width={NODE_W} height={NODE_H} rx={5}
                fill={nodeFill(n)} stroke={nodeStroke(n)} strokeWidth={n.id === selected ? 1.5 : 1}
                style={{ transition: "fill 0.18s, stroke 0.18s" }} />
              <text x={n.x} y={n.y + NODE_H / 2 + 4} textAnchor="middle" fontSize="9.5"
                fontFamily="ui-sans-serif,system-ui,sans-serif"
                fontWeight={n.id === selected ? "700" : "500"}
                fill={nodeTextFill(n)}
                style={{ transition: "fill 0.18s", pointerEvents: "none", userSelect: "none" }}>{n.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex items-center flex-wrap gap-3 px-0.5 min-h-[24px]">
        {sel ? (
          <>
            <span className="text-xs text-zinc-300">
              <span className="font-bold text-white">{sel.label}</span>
              {prereqs.length > 0 && <> · learn first: <span className="text-amber-400 font-semibold">{prereqs.map(id => DEP_NODES.find(n => n.id === id)?.label).join(", ")}</span></>}
              {dependents.length > 0 && <> · unlocks: <span className="text-emerald-400 font-semibold">{dependents.map(id => DEP_NODES.find(n => n.id === id)?.label).join(", ")}</span></>}
            </span>
            <button onClick={() => onNavigate(sel.tab)}
              className="text-[11px] px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:border-violet-500 hover:text-violet-300 transition-all ml-auto">
              Open →
            </button>
            <button onClick={() => setSelected(null)} className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors">✕</button>
          </>
        ) : (
          <>
            <span className="text-[11px] text-zinc-600">Click any node · see what to learn first and what it unlocks · double-click to open</span>
            <div className="flex items-center gap-3 ml-auto">
              <span className="flex items-center gap-1 text-[10px] text-amber-400"><span className="w-4 h-px bg-amber-400 inline-block rounded" /> prerequisite</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400"><span className="w-4 h-px bg-emerald-400 inline-block rounded" /> unlocks</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HomePage({ onNavigate, visited = new Set(), onFeedback }) {
  function handleFeedback(location) {
    track("feedback_clicked", { location });
    if (onFeedback) { onFeedback(location); return; }
    if (isFeedbackReady()) window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
  }
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem("genai_role") || "all"; } catch { return "all"; }
  });
  function switchRole(r) {
    setRole(r);
    track("role_toggle", { role: r });
    try { localStorage.setItem("genai_role", r); } catch {}
  }
  // Reorder MODULE_MAP groups + dim non-relevant modules based on selected role
  const orderedGroups = useMemo(() => {
    const order = role === "engineers" ? { BUILD: 0, LEARN: 1, GROW: 2 }
                : role === "pms"       ? { GROW: 0, LEARN: 1, BUILD: 2 }
                : { LEARN: 0, BUILD: 1, GROW: 2 };
    return [...MODULE_MAP].sort((a, b) => (order[a.group] ?? 3) - (order[b.group] ?? 3));
  }, [role]);
  function isRelevant(audience) {
    if (role === "all") return true;
    if (role === "engineers") return !["Product managers"].includes(audience);
    if (role === "pms") return !["Engineers"].includes(audience);
    return true;
  }
  const [activePath, setActivePath] = useState(null);
  const [pathRole, setPathRole] = useState(null);
  const [showPath, setShowPath] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState("idle"); // idle | sending | done | error
  const [betaBannerDismissed, setBetaBannerDismissed] = useState(() => {
    try { return localStorage.getItem("genai_beta_banner_dismissed") === "1"; } catch { return false; }
  });

  useEffect(() => { track("home_viewed", {}); }, []);

  function dismissBetaBanner() {
    setBetaBannerDismissed(true);
    try { localStorage.setItem("genai_beta_banner_dismissed", "1"); } catch {}
  }

  function pathProgress(path) {
    const visited_count = path.steps.filter(s => visited.has(s.tab)).length;
    return { visited: visited_count, total: path.steps.length };
  }

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* ── COMMUNITY BETA BANNER ────────────────────────────────────────── */}
      {!betaBannerDismissed && (
        <div className="border-b border-violet-900/40 bg-violet-950/20">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-violet-300 leading-relaxed">
              <span className="font-bold text-violet-200">Community beta:</span> this lab is free while we improve it. Try a module, break something, and tell us what confused you.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleFeedback("beta_banner")}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all">
                Give Feedback
              </button>
              <button onClick={dismissBetaBanner} className="text-violet-500 hover:text-violet-300 text-xs px-2 py-1 transition-all">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center space-y-8">

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            AI systems break<br className="hidden sm:block" /> in production.
            <br />
            <span className="text-cyan-400">Learn exactly why.</span>
          </h1>
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
            For AI engineers · PMs · anyone building with LLMs
          </p>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Simulate production failures, trace agent loops, and debug RAG pipelines that break in the real world.
            Every module is interactive and takes under 20 minutes.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => { track("start_here_clicked", { location: "hero_cta_primary" }); onNavigate("lab"); }}
            className="flex flex-col items-center px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-900/40">
            <span>Run your first failure scenario →</span>
            <span className="text-[10px] font-normal opacity-70 mt-0.5">For engineers building with LLMs</span>
          </button>
          <button
            onClick={() => { track("start_here_clicked", { location: "hero_cta_secondary" }); onNavigate("concepts"); }}
            className="flex flex-col items-center px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-medium text-sm transition-all">
            <span>Start from scratch: Tokenizer → RAG → Agents</span>
            <span className="text-[10px] font-normal text-zinc-500 mt-0.5">For PMs &amp; anyone learning from zero</span>
          </button>
        </div>

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Free · no login required · built for AI engineers &amp; PMs
        </div>

        {/* Continue where you left off — shown only to returning users */}
        {(() => {
          const hasVisited = visited.size > 1;
          const nextStep = START_HERE_PATH.find(s => !visited.has(s.tab));
          if (!hasVisited || !nextStep) return null;
          return (
            <button
              onClick={() => { track("continue_clicked", { tab: nextStep.tab, step: nextStep.step }); onNavigate(nextStep.tab); }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-violet-500 transition-all group">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Continue where you left off</span>
              <span className="w-px h-3 bg-zinc-700" />
              <span className="text-xs font-bold text-white">Step {nextStep.step}: {nextStep.label}</span>
              <span className="text-violet-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          );
        })()}

      </div>

      {/* ── START HERE JOURNEY ──────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-zinc-900 border border-violet-800/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-0.5">Recommended first journey</p>
              <h3 className="text-sm font-black text-white">From Tokens to Production Failures — ~45 min</h3>
            </div>
            <button onClick={() => { track("start_here_clicked", { location: "journey_strip" }); onNavigate("concepts"); }}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shrink-0">
              Begin →
            </button>
          </div>
          <div className="flex items-start gap-0 overflow-x-auto pb-1 scrollbar-hide">
            {START_HERE_PATH.map((s, i) => {
              const done = visited.has(s.tab);
              return (
                <div key={s.step} className="flex items-center shrink-0">
                  <button onClick={() => onNavigate(s.tab)}
                    className="flex flex-col items-center gap-1 px-3 hover:opacity-80 transition-opacity group min-w-[72px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      done
                        ? "bg-emerald-600/20 border border-emerald-600/50 text-emerald-400"
                        : "bg-violet-600/20 border border-violet-600/50 text-violet-400 group-hover:bg-violet-600/40"
                    }`}>
                      {done ? "✓" : s.step}
                    </div>
                    <span className={`text-[10px] font-bold text-center leading-tight ${done ? "text-emerald-400" : "text-white"}`}>{s.label}</span>
                    <span className="text-[9px] text-zinc-600 text-center leading-tight">{s.desc}</span>
                  </button>
                  {i < START_HERE_PATH.length - 1 && (
                    <div className={`w-6 h-px shrink-0 mb-4 ${done ? "bg-emerald-900/60" : "bg-violet-900/60"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STATS + FAILURE MODE STRIP ───────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-10 text-center space-y-6">
        <div className="flex items-center justify-center gap-8 sm:gap-16">
          {STATS.map((s) => {
            const inner = (
              <>
                <div className="text-4xl sm:text-5xl font-black text-white tabular-nums"><CountUp target={s.target} suffix={s.suffix} /></div>
                <div className={`text-xs font-semibold mt-1 ${s.tab ? "text-violet-400 underline underline-offset-2 decoration-dotted" : "text-zinc-300"}`}>{s.label}{s.tab ? " →" : ""}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">{s.sub}</div>
              </>
            );
            return s.tab
              ? <button key={s.label} onClick={() => { track("stat_clicked", { stat: s.label }); onNavigate(s.tab); }} className="text-center hover:opacity-80 transition-opacity">{inner}</button>
              : <div key={s.label} className="text-center">{inner}</div>;
          })}
        </div>
        <div className="space-y-2">
          <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-widest">5 production failure patterns you can simulate right now</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Stale retrieval",   color: "#ef4444" },
              { label: "Prompt injection",  color: "#f59e0b" },
              { label: "Context overflow",  color: "#6366f1" },
              { label: "Hallucination",     color: "#3b82f6" },
              { label: "Multi-hop failure", color: "#22c55e" },
            ].map(f => (
              <button key={f.label} onClick={() => onNavigate("lab")}
                className="px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all hover:opacity-80"
                style={{ color: f.color, borderColor: f.color + "40", background: f.color + "10" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { quote: "The RAG Lab is the best way I've found to build real intuition for why retrieval fails. You can read about stale docs all day — this makes you feel it.", role: "ML Engineer", company: "fintech startup" },
            { quote: "I used the Start Here path to prep for my AI PM interview. The failure mode framing is exactly what interviewers want — 'what could go wrong and how would you know?'", role: "Senior PM", company: "SaaS company" },
            { quote: "Finally something that assumes you're technical but doesn't assume you're already an expert. The agent loop simulator especially.", role: "Software Engineer", company: "transitioning to AI" },
          ].map((t, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed italic">"{t.quote}"</p>
              <div className="text-[10px] font-mono text-zinc-600">— {t.role} · {t.company}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-700 font-mono text-center mt-3">Early user feedback · names withheld</p>
      </div>


      {/* ── LEARNING PATHS ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white">Choose Your Path</h2>
          <p className="text-sm text-zinc-500">Each path is a curated sequence through the lab — or ignore them and explore freely.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEARNING_PATHS.map(path => {
            const prog = pathProgress(path);
            const pct = Math.round((prog.visited / prog.total) * 100);
            return (
            <div key={path.id}
              className={`bg-zinc-900 border rounded-2xl p-5 cursor-pointer transition-all ${activePath === path.id ? "scale-[1.01] shadow-lg" : "hover:border-zinc-600"}`}
              style={{ borderColor: activePath === path.id ? path.color : "#3f3f46" }}
              onClick={() => setActivePath(activePath === path.id ? null : path.id)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: path.color }}>{path.duration}</p>
                  <h3 className="text-lg font-black text-white">{path.title}</h3>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: path.color + "22" }}>
                  <span style={{ color: path.color }}>→</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-2">{path.tagline}</p>
              {path.outcome && (
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 border-l-2 pl-2.5" style={{ borderColor: path.color + "60" }}>
                  {path.outcome}
                </p>
              )}

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-500">{prog.visited}/{prog.total} steps visited</span>
                  {prog.visited > 0 && <span className="text-xs font-bold" style={{ color: path.color }}>{pct}%</span>}
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: path.color, opacity: pct === 0 ? 0 : 1 }} />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-1.5">
                {path.steps.map((step, i) => {
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: path.color + "22", color: path.color }}>
                        {i+1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white">{step.label}</span>
                        <span className="text-xs text-zinc-600 ml-1.5">{step.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activePath === path.id && (() => {
                const isComplete = pct === 100;
                const firstFree = path.steps[0];
                const nextUnvisited = path.steps.find(s => !visited.has(s.tab));
                if (isComplete && path.nextPath) {
                  return (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                        <span>✓</span> Path complete
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onNavigate(LEARNING_PATHS.find(p => p.id === path.nextPath)?.steps[0]?.tab || "home"); }}
                        className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all"
                        style={{ backgroundColor: path.color }}>
                        Next: {path.nextPathLabel} →
                      </button>
                    </div>
                  );
                }
                if (isComplete && !path.nextPath) {
                  return (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                        <span>✓</span> Path complete
                      </div>
                      <div className="w-full py-2 rounded-lg text-xs font-bold text-center border"
                        style={{ borderColor: path.color + "60", color: path.color }}>
                        You're interview-ready. Test yourself in the RAG Lab →
                      </div>
                    </div>
                  );
                }
                const target = nextUnvisited || firstFree;
                return target ? (
                  <button
                    onClick={e => { e.stopPropagation(); onNavigate(target.tab); }}
                    className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-white transition-all"
                    style={{ backgroundColor: path.color }}>
                    {nextUnvisited ? `Continue: ${nextUnvisited.label} →` : `Start with ${target.label} →`}
                  </button>
                ) : null;
              })()}
            </div>
            );
          })}
        </div>



        {/* ---- BUILD MY PATH -------------------------------------------- */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 mx-0 mb-4 space-y-3">
          <p className="text-xs font-bold text-white">Get a personalised learning path</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "engineer", label: "I'm an Engineer" },
              { id: "pm", label: "I'm a PM" },
              { id: "researcher", label: "I'm a Researcher" },
              { id: "interview", label: "Interview prep" },
            ].map(r => (
              <button key={r.id} onClick={() => { setPathRole(r.id); setShowPath(true); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${pathRole === r.id ? "bg-violet-600 border-violet-500 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                {r.label}
              </button>
            ))}
          </div>
          {showPath && pathRole && <SuggestedPath role={pathRole} onNavigate={onNavigate} />}
        </div>

        {/* ── CONCEPT DEPENDENCY GRAPH ────────────────────────────────────── */}
        <div className="space-y-2 pt-4">
          <div className="text-center space-y-1 mb-3">
            <h2 className="text-xl font-black text-white">Concept Dependency Graph</h2>
            <p className="text-sm text-zinc-500">Click a node to see prerequisites · Double-click to navigate</p>
          </div>
          <ConceptGraph onNavigate={onNavigate} />
        </div>

        {/* ── MODULE MAP ──────────────────────────────────────────────────── */}
        <div className="space-y-2 pt-4">
          <div className="text-center space-y-3 mb-6">
            <h2 className="text-xl font-black text-white">Every Module — Mapped</h2>
            {/* Role toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
              {[
                { id: "all",       label: "All" },
                { id: "engineers", label: "Engineers" },
                { id: "pms",       label: "PMs" },
              ].map(r => (
                <button key={r.id} onClick={() => switchRole(r.id)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${role === r.id ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-white"}`}>
                  {r.label}
                </button>
              ))}
            </div>
            {role !== "all" && (
              <p className="text-xs text-zinc-600">Showing modules most relevant to {role === "engineers" ? "engineers" : "product managers"} first</p>
            )}
          </div>
          {orderedGroups.map(group => (
            <div key={group.group}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest px-2" style={{ color: group.color }}>{group.group}</span>
                <span className="text-xs text-zinc-600 hidden sm:inline">{group.desc}</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {group.modules.map(m => (
                  <button key={m.tab}
                    onClick={() => onNavigate(m.tab)}
                    className={`text-left border rounded-xl p-4 transition-all group bg-zinc-900 border-zinc-800 hover:border-zinc-600 ${!isRelevant(m.audience) ? "opacity-40" : ""}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-sm font-bold text-white">{m.title}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        {m.audience && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50 hidden sm:inline">
                            {m.audience}
                          </span>
                        )}
                        <span className="text-zinc-700 group-hover:text-zinc-400 text-xs">→</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2">{m.desc}</p>
                    {m.discovery && (
                      <p className="text-[11px] text-zinc-600 italic leading-relaxed border-t border-zinc-800 pt-1.5 mt-1">
                        💡 {m.discovery}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">How to use this lab</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "1", title: "Pick a path or module", desc: "Follow a learning path for structure, or jump to any module for what you need right now." },
              { n: "2", title: "Read the objective first", desc: "Every module shows what skill you're building before you start. Don't skip it — it frames everything." },
              { n: "3", title: "Do the challenges, not just read", desc: "The learning is in the doing. Answer questions before revealing answers. Score yourself honestly." },
            ].map(s => (
              <div key={s.n} className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-black text-white">{s.n}</div>
                <p className="text-sm font-bold text-white">{s.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT THIS LAB ────────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">About this lab</h3>
          <p className="text-sm text-zinc-400 italic mb-3">
            "I built this because I spent months debugging RAG systems in production and couldn't find a resource that let me <em>break</em> things instead of just read about them."
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            GenAI Systems Lab is a static, zero-backend learning tool — no API calls, no live model, no login required. Everything runs entirely in your browser.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { tw: "emerald", color: "#22c55e", badge: "✓ Mathematically faithful", desc: "Real algorithm logic on toy inputs. Tokenizer, sampling, and cost models fall here." },
              { tw: "amber",   color: "#f59e0b", badge: "~ Simplified",              desc: "Correct pattern, simplified scale. Attention, transformer, and agent trace — real concepts, not frontier-model internals." },
              { tw: "zinc",    color: "#71717a", badge: "◌ Conceptual",              desc: "Illustrative only. Embedding Space uses precomputed 2D coords, not live model embeddings. Useful for intuition, not introspection." },
            ].map(t => (
              <div key={t.badge} className="rounded-xl p-3 space-y-2 bg-zinc-800/50 border border-zinc-700/50">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-block" style={{ color: t.color, background: t.color + "20" }}>{t.badge}</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            RAG Lab scenarios are curated from real production failure patterns. The goal throughout is <em className="text-zinc-500">systems intuition</em> — not exact model introspection.
          </p>
          <p className="text-[11px] text-zinc-700 border-t border-zinc-800 pt-3 leading-relaxed">
            No login. No personal data requested. Usage analytics are used only to improve the beta.
          </p>
        </div>

        {/* ── EMAIL CAPTURE ─────────────────────────────────────────────── */}
        {subStatus === "done" ? (
          <div className="max-w-sm mx-auto rounded-xl border border-emerald-800/50 bg-emerald-950/20 px-4 py-3 text-center">
            <p className="text-xs text-emerald-300">✓ You're in. New posts land in your inbox.</p>
          </div>
        ) : (
          <div className="max-w-sm mx-auto space-y-3 text-center">
            <p className="text-xs text-zinc-500">New Ground Truth posts drop every few weeks — production depth, no fluff.</p>
            <form onSubmit={e => {
              e.preventDefault();
              if (!subEmail.trim()) return;
              setSubStatus("sending");
              track("email_subscribe_attempted", {});
              // 👉 Replace REPLACE_WITH_YOUR_FORMSPREE_ID — sign up free at formspree.io
              fetch("https://formspree.io/f/REPLACE_WITH_YOUR_FORMSPREE_ID", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ email: subEmail, source: "genai-systems-lab-footer" }),
              })
                .then(r => { setSubStatus(r.ok ? "done" : "error"); if (r.ok) track("email_subscribe_success", {}); })
                .catch(() => setSubStatus("error"));
            }} className="flex gap-2">
              <input
                type="email" required value={subEmail} onChange={e => setSubEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-violet-600 text-xs text-white placeholder-zinc-600 outline-none transition-all font-mono" />
              <button type="submit" disabled={subStatus === "sending"}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0">
                {subStatus === "sending" ? "…" : "Notify me"}
              </button>
            </form>
            {subStatus === "error" && <p className="text-[10px] text-red-400 font-mono">Something went wrong — try again or open a GitHub issue.</p>}
            <p className="text-[10px] text-zinc-700 font-mono">No spam. Unsubscribe any time.</p>
          </div>
        )}

        {/* ── DAILY TIP ─────────────────────────────────────────────────── */}
        {(() => {
          const tip = DAILY_TIPS[Math.floor(Date.now() / 86400000) % DAILY_TIPS.length];
          return (
            <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 text-base shrink-0">💡</span>
                <div>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Did you know · Today's tip</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{tip}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <div className="text-center pt-4 space-y-3">
          <button onClick={() => handleFeedback("footer")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:border-violet-700 text-xs font-mono text-zinc-500 hover:text-violet-400 transition-all">
            💬 Give feedback on this lab
          </button>
          <p className="text-sm text-zinc-400 font-medium">
          Built by{" "}
          <a href="https://github.com/SidharthKriplani" target="_blank" rel="noopener noreferrer"
            className="text-zinc-400 hover:text-violet-400 transition-colors underline underline-offset-2">
            Sidharth Kriplani
          </a>
          {" "}·{" "}
          <a href="https://www.linkedin.com/in/sidharth-kriplani" target="_blank" rel="noopener noreferrer"
            className="text-zinc-400 hover:text-violet-400 transition-colors underline underline-offset-2">
            LinkedIn
          </a>
          {" "}·{" "}
          <a href="https://github.com/SidharthKriplani/genai-systems-lab" target="_blank" rel="noopener noreferrer"
            className="text-zinc-400 hover:text-violet-400 transition-colors underline underline-offset-2">
            GitHub
          </a>
        </p>
          <p className="text-[11px] text-zinc-700 max-w-lg mx-auto leading-relaxed">
            No login. No personal data requested. Usage analytics are used only to improve the beta.
          </p>
        </div>
      </div>
    </div>
  );
}
