import React, { useState } from "react";
import { POSTS } from "./groundTruthIndex";

// ─── KNOWLEDGE BASE ────────────────────────────────────────────────────────────

const MODULES_KB = [
  // Concepts
  { id: "tokenizer",        label: "Tokenizer",                tab: "concepts",  group: "Concepts",  desc: "Interactive tokenizer — see how BPE splits your text into tokens and calculates cost.", keywords: ["tokenizer","BPE","tokens","subword","byte pair","wordpiece","sentencepiece","token count","tokenization"] },
  { id: "embeddings",       label: "Embedding Explorer",       tab: "concepts",  group: "Concepts",  desc: "Visualise word vectors in 2D space. See semantic similarity and why king - man + woman ≈ queen.", keywords: ["embeddings","vectors","vector space","semantic","similarity","king queen","word2vec","sentence transformers"] },
  { id: "attention",        label: "Attention Mechanism",      tab: "concepts",  group: "Concepts",  desc: "Step-by-step self-attention walkthrough. Query, Key, Value matrices and multi-head attention.", keywords: ["attention","self-attention","QKV","query key value","multi-head","scaled dot product","transformer attention"] },
  { id: "sampling",         label: "Sampling & Temperature",   tab: "concepts",  group: "Concepts",  desc: "Live temperature, top-p, and top-k controls. See how decoding strategy changes output.", keywords: ["temperature","top-p","top-k","sampling","nucleus sampling","greedy","decoding","randomness","creative"] },
  { id: "context-window",   label: "Context Window",           tab: "concepts",  group: "Concepts",  desc: "Visualise what fits inside a context window and what gets truncated.", keywords: ["context window","context length","context limit","truncation","128k","200k","lost in middle","long context"] },
  { id: "chunking",         label: "Chunking Strategies",      tab: "concepts",  group: "Concepts",  desc: "Compare fixed, semantic, and hierarchical chunking strategies for RAG.", keywords: ["chunking","chunk size","fixed chunking","semantic chunking","hierarchical","overlap","splitting","RAG chunks"] },
  { id: "guardrails",       label: "Guardrails",               tab: "concepts",  group: "Concepts",  desc: "Input/output filtering pipeline — classifiers, topic filters, PII redaction, toxicity detection.", keywords: ["guardrails","safety","content filter","input filter","output filter","PII","toxicity","moderation"] },
  { id: "rag-concept",      label: "RAG Pipeline",             tab: "concepts",  group: "Concepts",  desc: "End-to-end retrieval-augmented generation pipeline from query to grounded answer.", keywords: ["RAG","retrieval augmented generation","retrieve","chunk","embed","generate","grounded"] },
  { id: "agents-concept",   label: "Agents Overview",          tab: "concepts",  group: "Concepts",  desc: "ReAct loop, tool use, memory, and planning in AI agents.", keywords: ["agents","react","tool use","tool call","planning","memory","reasoning","multi-step"] },
  { id: "debug",            label: "Debug Mode",               tab: "concepts",  group: "Concepts",  desc: "Inspect model internals — token probabilities, attention maps, and logprobs.", keywords: ["debug","logprobs","probabilities","internals","token probability","attention map","interpretability"] },
  { id: "multiagent",      label: "Multi-Agent Patterns",     tab: "concepts",  group: "Concepts",  desc: "Orchestrator-worker architectures, message passing, coordination strategies", keywords: ["agents","multiagent","orchestration","orchestrator","worker","message passing","coordination"] },
  { id: "nextoken",        label: "Next Token Prediction Game", tab: "concepts", group: "Concepts",  desc: "Interactive game: predict the next token like a language model", keywords: ["tokens","llm","prediction","game","next token","token prediction","language model game"] },
  { id: "tempgame",        label: "Temperature Explorer Game", tab: "concepts",  group: "Concepts",  desc: "Interactive: see how temperature affects token sampling randomness", keywords: ["temperature","sampling","game","tokens","temperature explorer","randomness","sampling game"] },

  // Flows
  { id: "transformer-flow", label: "Transformer Architecture", tab: "flows",     group: "Flows",     desc: "Animated walkthrough of the full transformer architecture — encoder, decoder, attention, FFN.", keywords: ["transformer","architecture","encoder","decoder","feed forward","positional encoding","layer norm","residual"] },
  { id: "context-flow",     label: "Context Window Flow",      tab: "flows",     group: "Flows",     desc: "How tokens are packed into and processed within the context window.", keywords: ["context window","token packing","context flow","KV cache","attention over context"] },
  { id: "rag-flow",         label: "RAG Pipeline Flow",        tab: "flows",     group: "Flows",     desc: "Visual step-by-step RAG flow: query → embed → retrieve → rerank → generate → answer.", keywords: ["RAG pipeline","RAG flow","retrieval pipeline","reranker","vector search","generate answer"] },
  { id: "agent-flow",       label: "Agent Loop Flow",          tab: "flows",     group: "Flows",     desc: "Thought → Action → Observation loop animation. How agents iterate to solve tasks.", keywords: ["agent loop","react loop","thought action observation","tool call","agent iteration","multi-step agent"] },
  { id: "guardrails-flow",  label: "Guardrails Flow",          tab: "flows",     group: "Flows",     desc: "Request lifecycle through guardrails — input classifier → model → output validator.", keywords: ["guardrails flow","safety pipeline","input classifier","output validator","content moderation flow"] },
  { id: "rag-arch-flow",    label: "RAG Architectures",        tab: "flows",     group: "Flows",     desc: "Naive vs. advanced vs. modular vs. agentic RAG architectures side-by-side.", keywords: ["RAG architectures","naive RAG","agentic RAG","modular RAG","self-RAG","corrective RAG","query rewriting"] },

  // Systems
  { id: "evals-lab",        label: "Evals Lab",                tab: "systems",   group: "Systems",   desc: "Hands-on eval grading tool — score LLM outputs on groundedness, faithfulness, and citation accuracy.", keywords: ["evals","evaluation","grading","RAGAS","G-Eval","faithfulness","groundedness","citation","LLM eval"] },
  { id: "eval-frameworks",  label: "Eval Frameworks",          tab: "systems",   group: "Systems",   desc: "Compare RAGAS, G-Eval, and custom grading pipelines. When to use each framework.", keywords: ["eval frameworks","RAGAS","G-Eval","LLM-as-judge","evaluation pipeline","benchmark","metric"] },
  { id: "model-strategy",   label: "Model Strategy",           tab: "systems",   group: "Systems",   desc: "Model selection decision matrix — GPT-4o vs Claude vs Gemini vs open models.", keywords: ["model strategy","model selection","GPT-4","Claude","Gemini","open source","llama","mistral","model comparison"] },
  { id: "finetuning-lab",   label: "Fine-Tuning Lab",          tab: "systems",   group: "Systems",   desc: "Interactive LoRA/PEFT fine-tuning explorer — rank, alpha, VRAM, and training cost tradeoffs.", keywords: ["fine-tuning","LoRA","PEFT","QLoRA","rank","alpha","VRAM","training","adapter","parameter efficient"] },
  { id: "cost-latency",     label: "Cost / Latency Planner",   tab: "systems",   group: "Systems",   desc: "Budget tokens, model cost, TTFT, and TPS for your production workload.", keywords: ["cost","latency","TTFT","tokens per second","budget","inference cost","SLA","latency planner","API cost"] },
  { id: "caching",          label: "Prompt Caching",           tab: "systems",   group: "Systems",   desc: "Prompt prefix caching — how it works and how to structure prompts for 60-80% cost savings.", keywords: ["prompt caching","prefix caching","cache","cost savings","repeated prompts","system prompt cache"] },
  { id: "observability",    label: "Observability",            tab: "systems",   group: "Systems",   desc: "What to log, trace, and alert on in production LLM systems. Monitoring stack setup.", keywords: ["observability","logging","monitoring","tracing","LangSmith","alerts","dashboards","production monitoring"] },
  { id: "ab-testing",       label: "A/B Testing",              tab: "systems",   group: "Systems",   desc: "Run controlled experiments on LLM outputs. Statistical significance, win-rate, NDCG.", keywords: ["A/B testing","experimentation","win rate","statistical significance","LLM comparison","model experiment"] },
  { id: "budget-allocator", label: "Budget Allocator",         tab: "systems",   group: "Systems",   desc: "Allocate inference budget across models and request types to hit cost targets.", keywords: ["budget","cost allocation","model routing","budget allocator","inference budget","cost targets"] },
  { id: "deployment",       label: "Deployment",               tab: "systems",   group: "Systems",   desc: "Canary deploys, blue-green, and ML CI/CD for LLM pipelines.", keywords: ["deployment","canary","blue-green","CI/CD","ML CI/CD","rollout","versioning","release"] },
  { id: "rollback",         label: "Rollback Strategies",      tab: "systems",   group: "Systems",   desc: "How to roll back a bad model update — feature flags, traffic shifting, and prompt versioning.", keywords: ["rollback","model rollback","feature flags","traffic shifting","prompt versioning","incident response"] },

  // Agents Lab
  { id: "agent-basic",      label: "Basic ReAct Agent",        tab: "agents",    group: "Agents",    desc: "Single-agent ReAct loop with search and calculator tools.", keywords: ["ReAct","basic agent","tool use","search tool","calculator","single agent","react pattern"] },
  { id: "agent-multi",      label: "Multi-Agent System",       tab: "agents",    group: "Agents",    desc: "Supervisor + worker agent orchestration. Task decomposition and inter-agent communication.", keywords: ["multi-agent","supervisor","orchestration","LangGraph","task decomposition","agent communication"] },
  { id: "agent-rag",        label: "Agentic RAG",              tab: "agents",    group: "Agents",    desc: "Agent that decides when to retrieve, rewrites queries, and chains multi-hop lookups.", keywords: ["agentic RAG","query rewriting","multi-hop","adaptive retrieval","agent retrieval"] },
  { id: "agent-planning",   label: "Planning Agent",           tab: "agents",    group: "Agents",    desc: "Tree of Thought and LATS planning patterns — when agents need to look ahead.", keywords: ["planning","tree of thought","LATS","graph of thought","lookahead","agent planning","reflection"] },
  { id: "agent-memory-lab", label: "Memory in Agents",         tab: "agents",    group: "Agents",    desc: "In-context, episodic, semantic, and external memory patterns for production agents.", keywords: ["agent memory","episodic","semantic memory","LangMem","Mem0","MemGPT","persistent memory"] },
  { id: "agent-evals",      label: "Agent Evals",              tab: "agents",    group: "Agents",    desc: "Task completion rate, tool call accuracy, and trajectory quality for multi-step agents.", keywords: ["agent evals","evaluation agents","trajectory","tool accuracy","task completion","agent benchmarks"] },
  { id: "agent-failures",   label: "Agent Failure Modes",      tab: "agents",    group: "Agents",    desc: "Tool loops, hallucinated tool calls, context bleed, and cascade failures reproduced in the simulator.", keywords: ["agent failures","tool loop","hallucinated tool call","context bleed","cascade","production failures","circuit breaker"] },
  { id: "agent-design-challenge", label: "Agent Design Challenge", tab: "agents", group: "Agents",  desc: "Architect a production agent system — tools, memory, failure handling, and approval gates.", keywords: ["agent design","agent architecture","design challenge","production agent","approval gate","system design"] },

  // Fluency
  { id: "timed-drills",     label: "Timed Drills",             tab: "fluency",   group: "Fluency",   desc: "60-second concept drills — explain self-attention, RAG, or fine-tuning in plain English under time pressure.", keywords: ["timed drills","speed drill","explain concept","under pressure","60 seconds","fluency drill"] },
  { id: "mock-interview",   label: "Mock Interview",           tab: "fluency",   group: "Fluency",   desc: "Simulated AI engineer and AI PM interview questions with model answers.", keywords: ["mock interview","interview practice","interview questions","AI engineer interview","AI PM interview"] },
  { id: "flashcards",       label: "Flashcards",               tab: "fluency",   group: "Fluency",   desc: "Spaced repetition flashcards for 80+ AI/ML vocabulary terms.", keywords: ["flashcards","spaced repetition","vocabulary","terms","glossary","AI terms","flashcard deck"] },
  { id: "challenges",       label: "Fluency Challenges",       tab: "fluency",   group: "Fluency",   desc: "Structured challenges — from tokenizer puzzles to RAG design in 2 minutes.", keywords: ["challenges","fluency challenge","puzzle","timed challenge","RAG challenge","design challenge"] },
  { id: "readiness",        label: "AI Readiness Assessment",  tab: "fluency",   group: "Fluency",   desc: "12-question diagnostic that benchmarks your AI engineering readiness and returns a personalised study plan.", keywords: ["readiness","assessment","diagnostic","readiness score","study plan","benchmark yourself","AI readiness"] },

  // Career
  { id: "system-design-career", label: "System Design Interview", tab: "career", group: "Career",  desc: "45-minute AI system design framework — 6-axis characterisation, architecture selection, reliability budgets.", keywords: ["system design","interview","45 minutes","architecture","reliability","staff engineer","design interview"] },
  { id: "negotiation",      label: "Salary Negotiation",       tab: "career",    group: "Career",   desc: "Negotiation scripts, equity math, and counter-offer tactics for AI engineering roles.", keywords: ["negotiation","salary","compensation","equity","stock","RSU","ESOP","counter offer","offer negotiation"] },
  { id: "take-home",        label: "Take-Home Challenges",     tab: "career",    group: "Career",   desc: "What evaluators look for in AI take-home assignments — problem framing, evals, failure analysis.", keywords: ["take-home","challenge","assignment","portfolio","submission","AI take home","evaluators"] },

  // AIPM
  { id: "prd-sim",          label: "PRD Simulator",            tab: "aipm",      group: "AIPM",      desc: "Write and review PRDs for AI features — uncertainty ranges, fallback behaviour, eval criteria.", keywords: ["PRD","product requirements","AI feature","fallback","eval criteria","product management","AI PM"] },
  { id: "roadmap",          label: "Roadmap Prioritizer",      tab: "aipm",      group: "AIPM",      desc: "Score AI initiatives on impact, feasibility, data readiness, and model risk.", keywords: ["roadmap","prioritization","prioritisation","AI initiatives","data readiness","model risk","product roadmap"] },
  { id: "stakeholder",      label: "Stakeholder Explainer",    tab: "aipm",      group: "AIPM",      desc: "Frameworks for explaining RAG, hallucinations, and eval gaps to execs, legal, and ops teams.", keywords: ["stakeholders","communication","explain AI","executives","non-technical","hallucination risk","legal"] },
  { id: "ai-or-not",        label: "AI-or-Not Framework",      tab: "aipm",      group: "AIPM",      desc: "6-question framework to decide when AI is the right solution — and when it is not.", keywords: ["AI or not","AI decision","when to use AI","framework","product strategy","build AI","AI justified"] },
  { id: "launch-checklist", label: "Launch Checklist",         tab: "aipm",      group: "AIPM",      desc: "Pre-launch checklist for AI features — eval gate, fallback, latency SLA, cost guardrails, safety review.", keywords: ["launch checklist","pre-launch","safety review","latency SLA","cost guardrails","eval gate","ship AI"] },
  { id: "metrics-room",     label: "Metrics Room",             tab: "aipm",      group: "AIPM",      desc: "Select the right metrics for 16+ AI product scenarios.", keywords: ["metrics","product metrics","success metrics","AI metrics","KPI","measurement","metrics room"] },

  // Explore
  { id: "embedding-explorer", label: "Embedding Explorer",    tab: "explore",   group: "Explore",   desc: "3D interactive embedding space — semantic clusters, cosine similarity, and analogy arithmetic.", keywords: ["embedding explorer","3D embeddings","semantic clusters","cosine similarity","analogy","vector visualisation"] },
  { id: "tokenizer-explore",  label: "Tokenizer Playground",  tab: "explore",   group: "Explore",   desc: "Live BPE tokenizer — paste any text and see token splits, IDs, and cost estimate.", keywords: ["tokenizer playground","BPE","live tokenizer","token splits","token IDs","cost estimate"] },
  { id: "attention-3d",       label: "3D Attention Viz",      tab: "explore",   group: "Explore",   desc: "3D visualisation of multi-head attention patterns across a sentence.", keywords: ["3D attention","attention visualisation","multi-head","attention patterns","attention heads","3D viz"] },
  { id: "diffusion-3d",       label: "3D Diffusion Trajectory", tab: "explore", group: "Explore",   desc: "3D denoising trajectory — watch latent vectors converge from noise to signal.", keywords: ["diffusion","denoising","3D diffusion","latent space","noise to image","stable diffusion","trajectory"] },
  { id: "vector-db",          label: "Vector DB Comparator",  tab: "explore",   group: "Explore",   desc: "Side-by-side comparison of Pinecone, Weaviate, Qdrant, Chroma, and pgvector.", keywords: ["vector database","Pinecone","Weaviate","Qdrant","Chroma","pgvector","vector DB comparison","ANN"] },
  { id: "shadow-mode",        label: "Shadow Mode Testing",   tab: "explore",   group: "Explore",   desc: "Run a challenger model in shadow mode alongside production — compare outputs without user exposure.", keywords: ["shadow mode","shadow testing","challenger model","model comparison","A/B shadow","side by side"] },
  { id: "multi-agent-explore", label: "Multi-Agent Sandbox",  tab: "explore",   group: "Explore",   desc: "Trace a multi-agent system with supervisor, researcher, and writer agents.", keywords: ["multi-agent","sandbox","supervisor agent","agent trace","LangGraph","orchestration","agent sandbox"] },
  { id: "lora-3d",            label: "3D LoRA Decomposition", tab: "explore",   group: "Explore",   desc: "3D visualisation of how LoRA low-rank matrices approximate a full weight update.", keywords: ["LoRA","low rank","3D LoRA","weight decomposition","rank","adapter weights","parameter efficient 3D"] },
];

// ─── STOPWORDS ────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall","can",
  "need","dare","ought","used","how","what","when","where","why","which","who",
  "whom","whose","that","this","these","those","i","you","he","she","it","we",
  "they","me","him","her","us","them","my","your","his","its","our","their",
  "in","on","at","to","for","of","with","by","from","about","as","into",
  "through","during","before","after","above","below","between","each","but",
  "and","or","not","so","yet","both","either","neither","just"
]);

// ─── SCORING ──────────────────────────────────────────────────────────────────

function extractKeywords(q) {
  return q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function scorePost(post, kws) {
  let s = 0;
  const t = post.title.toLowerCase();
  const d = post.desc.toLowerCase();
  const tags = (post.tags || []).join(" ").toLowerCase();
  const cat = (post.category || "").toLowerCase();
  for (const kw of kws) {
    if (t.includes(kw)) s += 4;
    if (tags.includes(kw)) s += 3;
    if (d.includes(kw)) s += 2;
    if (cat.includes(kw)) s += 1;
  }
  return s;
}

function scoreModule(mod, kws) {
  let s = 0;
  const l = mod.label.toLowerCase();
  const d = mod.desc.toLowerCase();
  const kws2 = (mod.keywords || []).join(" ").toLowerCase();
  for (const kw of kws) {
    if (l.includes(kw)) s += 4;
    if (kws2.includes(kw)) s += 3;
    if (d.includes(kw)) s += 2;
  }
  return s;
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

function search(q) {
  const kws = extractKeywords(q);
  if (!kws.length) return { posts: [], modules: [], keywords: [] };

  const scoredPosts = POSTS.map(p => ({ post: p, score: scorePost(p, kws) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(x => x.post);

  const scoredModules = MODULES_KB.map(m => ({ mod: m, score: scoreModule(m, kws) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.mod);

  return { posts: scoredPosts, modules: scoredModules, keywords: kws };
}

// ─── CANNED ANSWERS ───────────────────────────────────────────────────────────

const CANNED_ANSWERS = [
  {
    triggers: ["what is rag", "how does rag work", "explain rag"],
    answer: "RAG (Retrieval-Augmented Generation) grounds LLM responses in your own documents. At query time: (1) embed the query → (2) retrieve top-k similar chunks from your vector DB → (3) pass chunks + query to the LLM → (4) LLM answers citing only what was retrieved. The key insight: the LLM's job is synthesis, not memorisation.",
    tab: "lab",
  },
  {
    triggers: ["what is a token", "how many tokens", "token count", "what is tokenization"],
    answer: "A token is roughly 3-4 characters of English text. 'tokenization' → ['token','ization'] = 2 tokens. 1,000 tokens ≈ 750 words. Non-English uses 2-5× more tokens. This matters because: (1) LLM pricing is per token, (2) context window limits are in tokens, (3) some words split unexpectedly.",
    tab: "concepts",
  },
  {
    triggers: ["what is an embedding", "how do embeddings work", "what are vectors"],
    answer: "Embeddings are fixed-size numerical vectors that represent meaning. Similar concepts cluster nearby in vector space. 'king' - 'man' + 'woman' ≈ 'queen'. Used for: semantic search (find similar content), RAG retrieval, classification, clustering. Models like text-embedding-3-small produce 1536-dimensional vectors.",
    tab: "concepts",
  },
  {
    triggers: ["how do i fine tune", "when to fine tune", "fine tuning vs rag", "should i fine tune"],
    answer: "Fine-tune when: (1) you need a specific style/format the model doesn't naturally produce, (2) you want to reduce prompt length at scale, (3) you're doing a well-defined narrow task with 1000+ examples. Use RAG when: the knowledge changes frequently, you need citations, or you have <100 examples. RAG first, fine-tune later is almost always the right order.",
    tab: "systems",
  },
  {
    triggers: ["what is temperature", "how does temperature work", "temperature sampling"],
    answer: "Temperature scales the probability distribution before sampling the next token. Temperature 0 = always pick the highest probability token (greedy, deterministic). Temperature 1 = sample from the raw distribution. Temperature >1 = flatten the distribution (more random). For production: 0-0.3 for factual tasks, 0.7-1.0 for creative tasks. Never use temperature >1 in production.",
    tab: "concepts",
  },
  {
    triggers: ["how to evaluate llm", "llm evaluation", "eval metrics", "how to measure quality"],
    answer: "LLM evaluation has 3 layers: (1) Automated metrics — ROUGE/BLEU for text overlap, exact match for structured output. (2) LLM-as-judge — use a stronger model to score outputs on rubrics. (3) Human evaluation — ground truth for calibrating your automated evals. Start with LLM-as-judge + 50 human-labeled examples. Never rely on a single metric.",
    tab: "systems",
  },
  {
    triggers: ["what is prompt injection", "prompt injection attack", "how to prevent injection"],
    answer: "Prompt injection is when user input tries to override your system prompt. Direct: user writes 'Ignore previous instructions and...' Indirect: malicious text in a retrieved document contains instructions. Defenses: (1) Input classifier to detect injection attempts, (2) Privilege separation — don't let user input reach tool-calling context, (3) Output validator, (4) Principle of least privilege for tools.",
    tab: "systems",
  },
  {
    triggers: ["context window", "how long context", "context length", "lost in the middle"],
    answer: "Context window = the total tokens the model can 'see' at once (input + output). GPT-4o: 128K, Claude 3.5 Sonnet: 200K, Gemini 1.5 Pro: 1M. The catch: models lose track of information in the middle of long contexts ('lost in the middle' effect). For long documents, chunk + retrieve rather than stuffing everything in. Context has quadratic (O(n²)) compute cost.",
    tab: "concepts",
  },
  {
    triggers: ["what is an agent", "how do agents work", "llm agent", "ai agent"],
    answer: "An LLM agent is a model in a loop: Thought → Action (tool call) → Observation → repeat until done. Tools are functions the model can call (search, calculator, API). Key properties: (1) multi-step reasoning, (2) tool use, (3) memory across turns, (4) goal-directed behaviour. Main failure modes: hallucinated tool calls, infinite loops, cascading errors. Always set max_iterations.",
    tab: "agents",
  },
  {
    triggers: ["how to reduce cost", "reduce llm cost", "cheaper llm", "llm pricing"],
    answer: "5 levers in order of ROI: (1) Cache aggressively — prompt caching saves 90% on repeated prefixes. (2) Route by complexity — send 80% of queries to small models ($0.001/1K tokens) and only 20% to large. (3) Compress prompts — remove examples once fine-tuned. (4) Batch offline work — 50% cheaper via batch API. (5) Fine-tune for repetitive narrow tasks. Typical result: $10K → $1-2K/month.",
    tab: "systems",
  },
  {
    triggers: ["vector database", "which vector db", "pinecone vs weaviate", "choose vector db"],
    answer: "Decision framework: (1) Managed + no infra pain → Pinecone. (2) Self-hosted + rich metadata filtering + hybrid search → Weaviate or Qdrant. (3) Prototype / local dev → Chroma. (4) Already on PostgreSQL + <1M vectors → pgvector. Qdrant is fastest for pure ANN. Weaviate has the best hybrid search. Pinecone is the easiest managed option but most expensive at scale.",
    tab: "explore",
  },
  {
    triggers: ["what is lora", "low rank adaptation", "lora fine tuning", "parameter efficient"],
    answer: "LoRA (Low-Rank Adaptation) fine-tunes large models by adding small trainable rank-r matrices alongside frozen original weights. Instead of updating all 7B parameters, you update only ~0.1% of them. The rank r controls the tradeoff: r=4 is ultra-light, r=64 approaches full fine-tuning quality. VRAM needed: 7B model at r=16 ≈ 18GB GPU RAM vs 80GB for full fine-tune.",
    tab: "systems",
  },
];

// ─── TRIGGER KEYWORD SCORING ─────────────────────────────────────────────────

const TRIGGER_KEYWORDS = {
  rag: ["rag", "retrieval", "retriev", "chunking", "chunk", "vector", "embedding", "augment", "knowledge base", "document"],
  tokens: ["token", "tokeniz", "tokenisation", "bpe", "wordpiece", "vocabulary", "vocab"],
  embeddings: ["embed", "semantic", "similarity", "vector space", "cosine"],
  temperature: ["temperature", "sampling", "top-p", "top-k", "greedy", "random", "creative"],
  finetuning: ["fine-tun", "finetun", "lora", "peft", "train", "instruction", "qlora", "sft"],
  evaluation: ["eval", "metric", "benchmark", "assess", "measur", "rouge", "bleu", "judge"],
  "prompt injection": ["inject", "jailbreak", "attack", "adversar", "prompt hack", "security"],
  "context window": ["context window", "context length", "long context", "needle", "haystack"],
  agents: ["agent", "tool use", "function call", "orchestrat", "react pattern", "planning", "reliable"],
  cost: ["cost", "cheap", "expensive", "latency", "speed", "fast", "optimis", "budget", "token cost"],
};

// Map TRIGGER_KEYWORDS keys to CANNED_ANSWERS topic indices
const TOPIC_TO_CANNED_INDEX = {
  rag: 0,
  tokens: 1,
  embeddings: 2,
  finetuning: 3,
  temperature: 4,
  evaluation: 5,
  "prompt injection": 6,
  "context window": 7,
  agents: 8,
  cost: 9,
};

function findCannedAnswer(q) {
  const normalised = q.toLowerCase().trim();

  // First try exact substring match on original triggers (fast path for unambiguous questions)
  for (const entry of CANNED_ANSWERS) {
    for (const trigger of entry.triggers) {
      if (normalised.includes(trigger)) return entry;
    }
  }

  // Keyword-overlap scoring for partial / natural-language queries
  const queryWords = normalised.split(/\s+/);
  let bestTopic = null;
  let bestScore = 0;
  Object.entries(TRIGGER_KEYWORDS).forEach(([topic, keywords]) => {
    const score = keywords.filter(kw => queryWords.some(w => w.includes(kw) || kw.includes(w))).length;
    if (score > bestScore) { bestScore = score; bestTopic = topic; }
  });

  if (bestScore >= 1 && bestTopic !== null && TOPIC_TO_CANNED_INDEX[bestTopic] !== undefined) {
    return CANNED_ANSWERS[TOPIC_TO_CANNED_INDEX[bestTopic]];
  }

  return null;
}

// ─── SUGGESTED QUESTIONS ──────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "How do I choose between RAG and fine-tuning?",
  "What is prompt injection and how do I defend against it?",
  "How does temperature affect LLM output?",
  "What vector database should I use?",
  "How do I evaluate my LLM application?",
  "How do I reduce my LLM inference costs?",
  "What is a context window and why does size matter?",
  "How do agents work and when should I use them?",
];

// ─── CATEGORY COLOUR MAP ─────────────────────────────────────────────────────

const CAT_COLOURS = {
  foundations:  "bg-blue-900/40 text-blue-300 border-blue-700/40",
  rag:          "bg-violet-900/40 text-violet-300 border-violet-700/40",
  agents:       "bg-amber-900/40 text-amber-300 border-amber-700/40",
  evaluation:   "bg-green-900/40 text-green-300 border-green-700/40",
  llmops:       "bg-cyan-900/40 text-cyan-300 border-cyan-700/40",
  safety:       "bg-red-900/40 text-red-300 border-red-700/40",
  sysdesign:    "bg-indigo-900/40 text-indigo-300 border-indigo-700/40",
  failures:     "bg-orange-900/40 text-orange-300 border-orange-700/40",
  product:      "bg-pink-900/40 text-pink-300 border-pink-700/40",
  interview:    "bg-teal-900/40 text-teal-300 border-teal-700/40",
  finetuning:   "bg-purple-900/40 text-purple-300 border-purple-700/40",
  multimodal:   "bg-rose-900/40 text-rose-300 border-rose-700/40",
  models:       "bg-sky-900/40 text-sky-300 border-sky-700/40",
};

const TAB_COLOURS = {
  concepts: "bg-blue-900/40 text-blue-300",
  flows:    "bg-indigo-900/40 text-indigo-300",
  systems:  "bg-cyan-900/40 text-cyan-300",
  agents:   "bg-amber-900/40 text-amber-300",
  fluency:  "bg-green-900/40 text-green-300",
  career:   "bg-teal-900/40 text-teal-300",
  aipm:     "bg-pink-900/40 text-pink-300",
  explore:  "bg-violet-900/40 text-violet-300",
  lab:      "bg-orange-900/40 text-orange-300",
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function CannedBox({ canned, onNavigate }) {
  return (
    <div className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-sm font-bold">Direct Answer</span>
        <span className="text-xs text-amber-600 font-mono uppercase tracking-widest">knowledge base</span>
      </div>
      <p className="text-sm text-amber-100/90 leading-relaxed whitespace-pre-line">{canned.answer}</p>
      {canned.tab && onNavigate && (
        <button
          onClick={() => onNavigate(canned.tab)}
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
        >
          Go to {canned.tab.charAt(0).toUpperCase() + canned.tab.slice(1)} →
        </button>
      )}
    </div>
  );
}

function PostCard({ post, onNavigate, onNavigateTo }) {
  const catCls = CAT_COLOURS[post.category] || "bg-zinc-800 text-zinc-400 border-zinc-700";
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col gap-2 hover:border-zinc-600 cursor-pointer hover:bg-zinc-800/50 transition-colors"
      onClick={() => onNavigateTo ? onNavigateTo({ tab: "groundtruth", postId: post.id }) : onNavigate && onNavigate("groundtruth")}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${catCls}`}>
          {post.category}
        </span>
        <span className="text-xs text-zinc-600">{post.readMin} min read</span>
      </div>
      <p className="text-sm font-semibold text-white leading-snug">{post.title}</p>
      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{post.desc}</p>
      {(onNavigate || onNavigateTo) && (
        <button
          onClick={e => { e.stopPropagation(); onNavigateTo ? onNavigateTo({ tab: "groundtruth", postId: post.id }) : onNavigate("groundtruth"); }}
          className="self-start text-xs text-violet-400 hover:text-violet-300 font-semibold mt-1 transition-colors"
        >
          Open →
        </button>
      )}
    </div>
  );
}

function ModuleCard({ mod, onNavigate }) {
  const tabCls = TAB_COLOURS[mod.tab] || "bg-zinc-800 text-zinc-400";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-start justify-between gap-3 hover:border-zinc-600 transition-colors">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tabCls}`}>
            {mod.tab}
          </span>
        </div>
        <p className="text-sm font-semibold text-white">{mod.label}</p>
        <p className="text-xs text-zinc-400 leading-relaxed">{mod.desc}</p>
      </div>
      {onNavigate && (
        <button
          onClick={() => onNavigate(mod.tab)}
          className="shrink-0 text-xs text-violet-400 hover:text-violet-300 font-semibold whitespace-nowrap transition-colors mt-1"
        >
          Go →
        </button>
      )}
    </div>
  );
}

function ResultsPanel({ results, query, onNavigate, onNavigateTo }) {
  const { posts, modules, keywords, canned } = results;
  const hasResults = posts.length > 0 || modules.length > 0;

  return (
    <div className="space-y-5">
      {/* Canned answer */}
      {canned && <CannedBox canned={canned} onNavigate={onNavigate} />}

      {!hasResults ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-8 text-center space-y-2">
          <p className="text-sm text-zinc-300">Nothing found for <span className="text-white font-semibold">"{query}"</span>.</p>
          <p className="text-xs text-zinc-500">
            Try rephrasing — or{" "}
            {onNavigate ? (
              <button onClick={() => onNavigate("groundtruth")} className="text-violet-400 hover:text-violet-300 transition-colors">
                browse Ground Truth
              </button>
            ) : (
              <span className="text-violet-400">browse Ground Truth</span>
            )}{" "}
            for all 135+ posts.
          </p>
        </div>
      ) : (
        <>
          {/* Post results */}
          {posts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                Top results from our knowledge base
              </p>
              <div className="space-y-2">
                {posts.map(p => (
                  <PostCard key={p.id} post={p} onNavigate={onNavigate} onNavigateTo={onNavigateTo} />
                ))}
              </div>
            </div>
          )}

          {/* Module results */}
          {modules.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                Relevant modules
              </p>
              <div className="space-y-2">
                {modules.map(m => (
                  <ModuleCard key={m.id} mod={m} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Matched keywords */}
      {keywords.length > 0 && (
        <p className="text-xs text-zinc-700">
          Matched: {keywords.join(", ")}
        </p>
      )}
    </div>
  );
}

function HistoryPanel({ history, onRerun }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Recent searches</p>
      <div className="flex flex-col gap-1">
        {[...history].reverse().map((item, i) => (
          <button
            key={i}
            onClick={() => onRerun(item.q)}
            className="text-left text-xs px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-all truncate"
          >
            {item.q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Consultation({ onNavigate, onNavigateTo }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  function runSearch(q) {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoading(true);

    // Simulate brief async tick so UI can update (LLM-ready slot)
    setTimeout(() => {
      const canned = findCannedAnswer(trimmed);
      const { posts, modules, keywords } = search(trimmed);
      const res = { posts, modules, keywords, canned };

      setResults(res);
      setHistory(prev => {
        // Deduplicate — move to front if already present
        const filtered = prev.filter(h => h.q !== trimmed);
        return [...filtered.slice(-9), { q: trimmed, results: res }];
      });
      setLoading(false);
    }, 0);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Ask Anything</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Search across 135+ posts and every module. Ask in plain English.
        </p>
      </div>

      {/* Search input */}
      <div className="flex gap-2">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              runSearch(query);
            }
          }}
          placeholder="e.g. How do I choose between RAG and fine-tuning?"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-600 transition-all resize-none"
          rows={2}
        />
        <button
          onClick={() => runSearch(query)}
          disabled={loading || !query.trim()}
          className="px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shrink-0"
        >
          {loading ? "..." : "Ask →"}
        </button>
      </div>

      {/* Suggested questions — shown before any search */}
      {history.length === 0 && !results && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => { setQuery(q); runSearch(q); }}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-violet-600 hover:text-violet-400 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <ResultsPanel
          results={results}
          query={query}
          onNavigate={onNavigate}
          onNavigateTo={onNavigateTo}
        />
      )}

      {/* History */}
      {history.length > 0 && (
        <HistoryPanel history={history} onRerun={q => { setQuery(q); runSearch(q); }} />
      )}
    </div>
  );
}
