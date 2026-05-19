// src/utils/contentAudit.js
// Static module catalog for QA tooling. Keep in sync with source files.

export const LOCKED_TABS = new Set(["systems", "fluency", "aipm", "career"]);
export const FREE_TABS = ["home", "concepts", "flows", "lab", "agents", "playground", "explore"];

export const LS_KEYS = [
  { key: "genai_visited",                desc: "Tab visit history (JSON array of tab IDs)" },
  { key: "genai_visited_modules",        desc: "Module visit history (tab:moduleId pairs)" },
  { key: "genai_palette",                desc: "Color palette: violet | cyan | amber" },
  { key: "genai_leaderboard",            desc: "RAG Lab challenge log (JSON array)" },
  { key: "genai_lab_hint_dismissed",     desc: "RAG Lab hint banner dismissed (1 = yes)" },
  { key: "genai_beta_banner_dismissed",  desc: "Homepage beta banner dismissed (1 = yes)" },
  { key: "genai_whatsnew_v3",            desc: "What's New v3 modal seen (1 = yes)" },
  { key: "genai_preview_unlocked",       desc: "Owner preview unlock state (1 = unlocked)" },
  { key: "genai_qa_checklist",           desc: "QA launch checklist state (JSON)" },
  { key: "genai_qa_review",              desc: "QA manual review state (JSON)" },
];

export const WHATS_NEW_KEY = "genai_whatsnew_v3";

export const LEARNING_PATHS = [
  {
    id: "rag", title: "Production RAG Path", color: "#6366f1",
    steps: [
      { tab: "concepts",   label: "Concepts" },
      { tab: "flows",      label: "Flows" },
      { tab: "lab",        label: "RAG Lab" },
      { tab: "playground", label: "Playground" },
      { tab: "explore",    label: "Explore" },
    ],
  },
  {
    id: "engineer", title: "AI Engineer Path", color: "#3b82f6",
    steps: [
      { tab: "concepts",   label: "Concepts" },
      { tab: "flows",      label: "Flows" },
      { tab: "lab",        label: "RAG Lab" },
      { tab: "agents",     label: "Agents" },
      { tab: "playground", label: "Playground" },
    ],
  },
  {
    id: "pm", title: "PM / AI Product Path", color: "#22c55e",
    steps: [
      { tab: "concepts",   label: "Concepts" },
      { tab: "flows",      label: "Flows" },
      { tab: "lab",        label: "RAG Lab" },
      { tab: "playground", label: "Playground" },
      { tab: "explore",    label: "Explore" },
    ],
  },
  {
    id: "interview", title: "Interview Prep Path", color: "#f59e0b",
    steps: [
      { tab: "concepts",   label: "Concepts" },
      { tab: "flows",      label: "Flows" },
      { tab: "lab",        label: "RAG Lab" },
      { tab: "playground", label: "Playground" },
      { tab: "explore",    label: "Explore" },
    ],
  },
];

// Full module catalog — keep in sync with Concepts/Flows/Agents/Playground/Explore/Systems/Fluency/AIPM/Career
export const MODULE_CATALOG = [
  // ── HOME ──
  { tab: "home",       moduleId: "home",              title: "Home",                     status: "free",   audience: "All levels",       fidelity: null,         hasChallenge: false, hasReflection: false, supportsDirectNav: false },

  // ── CONCEPTS (11) ──
  { tab: "concepts",   moduleId: "tokenizer",          title: "Tokenization",             status: "free",   audience: "All levels",       fidelity: "faithful",   hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "embeddings",         title: "Semantic Embedding Space", status: "free",   audience: "All levels",       fidelity: "conceptual", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "attention",          title: "Self-Attention",           status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "transformer",        title: "Transformer Forward Pass", status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "chunking",           title: "Chunking Strategies",      status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "sampling",           title: "Decoding & Sampling",      status: "free",   audience: "All levels",       fidelity: "faithful",   hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "context",            title: "Context Window & Cost",    status: "free",   audience: "All levels",       fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "agent",              title: "Agent ReAct Loop",         status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "guardrails",         title: "Guardrail Pipeline",       status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "debug",              title: "Debug This RAG System",    status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "concepts",   moduleId: "multiagent",         title: "Multi-Agent Systems",      status: "free",   audience: "Engineers · PMs",  fidelity: "conceptual", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },

  // ── FLOWS (6) ──
  { tab: "flows",      moduleId: "rag",                title: "RAG Pipeline",             status: "free",   audience: "All levels",       fidelity: "simplified", hasChallenge: false, hasReflection: true,  supportsDirectNav: false },
  { tab: "flows",      moduleId: "ctx",                title: "Context Window",           status: "free",   audience: "All levels",       fidelity: "simplified", hasChallenge: false, hasReflection: true,  supportsDirectNav: false },
  { tab: "flows",      moduleId: "agent",              title: "Agent Loop",               status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: true,  supportsDirectNav: false },
  { tab: "flows",      moduleId: "guardrail",          title: "Guardrail Pipeline",       status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: true,  supportsDirectNav: false },
  { tab: "flows",      moduleId: "transformer",        title: "Transformer Block",        status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: true,  supportsDirectNav: false },
  { tab: "flows",      moduleId: "ragarch",            title: "RAG Architectures",        status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: true,  supportsDirectNav: false },

  // ── LAB — RAG scenarios (6) ──
  { tab: "lab",        moduleId: "conflicting_documents", title: "Conflicting Policy Docs",  status: "free", audience: "Engineers", fidelity: "simplified", hasChallenge: true, hasReflection: false, supportsDirectNav: false },
  { tab: "lab",        moduleId: "missing_context",       title: "Missing Context",          status: "free", audience: "Engineers", fidelity: "simplified", hasChallenge: true, hasReflection: false, supportsDirectNav: false },
  { tab: "lab",        moduleId: "ambiguous_query",       title: "Ambiguous Query",          status: "free", audience: "Engineers", fidelity: "simplified", hasChallenge: true, hasReflection: false, supportsDirectNav: false },
  { tab: "lab",        moduleId: "prompt_injection",      title: "Prompt Injection",         status: "free", audience: "Engineers", fidelity: "simplified", hasChallenge: true, hasReflection: false, supportsDirectNav: false },
  { tab: "lab",        moduleId: "multihop",              title: "Multi-Hop Failure",        status: "free", audience: "Engineers", fidelity: "simplified", hasChallenge: true, hasReflection: false, supportsDirectNav: false },
  { tab: "lab",        moduleId: "threehop",              title: "Three-Hop Reasoning",      status: "free", audience: "Engineers", fidelity: "simplified", hasChallenge: true, hasReflection: false, supportsDirectNav: false },

  // ── AGENTS (7) ──
  { tab: "agents",     moduleId: "react",              title: "ReAct Pattern",            status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "agents",     moduleId: "tools",              title: "Tool Use Design",          status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "agents",     moduleId: "memory",             title: "Agent Memory",             status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "agents",     moduleId: "multiagent",         title: "Multi-Agent Patterns",     status: "free",   audience: "Engineers",        fidelity: "conceptual", hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "agents",     moduleId: "failures",           title: "Agent Failure Modes",      status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "agents",     moduleId: "planning",           title: "Planning Patterns",        status: "free",   audience: "Engineers",        fidelity: "conceptual", hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "agents",     moduleId: "simulator",          title: "Agent Loop Simulator",     status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: false, supportsDirectNav: true  },

  // ── PLAYGROUND (6) ──
  { tab: "playground", moduleId: "injection",          title: "Prompt Injection",         status: "free",   audience: "All levels",       fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "playground", moduleId: "chunking",           title: "Chunking Strategy Lab",    status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "playground", moduleId: "reranker",           title: "Reranker Simulator",       status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "playground", moduleId: "hallucinate",        title: "Spot the Hallucination",   status: "free",   audience: "All levels",       fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "playground", moduleId: "tetris",             title: "Context Tetris",           status: "free",   audience: "All levels",       fidelity: "simplified", hasChallenge: false, hasReflection: false, supportsDirectNav: false },
  { tab: "playground", moduleId: "bias",               title: "Bias Detector",            status: "free",   audience: "All levels",       fidelity: "simplified", hasChallenge: true,  hasReflection: false, supportsDirectNav: false },

  // ── EXPLORE (8) ──
  { tab: "explore",    moduleId: "embeddings",         title: "Embedding Space",          status: "free",   audience: "Engineers",        fidelity: "conceptual", hasChallenge: false, hasReflection: false, supportsDirectNav: true  },
  { tab: "explore",    moduleId: "shadow",             title: "Shadow Mode A/B",          status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: false, supportsDirectNav: true  },
  { tab: "explore",    moduleId: "latency",            title: "Latency Planner",          status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: false, supportsDirectNav: true  },
  { tab: "explore",    moduleId: "tokenizer",          title: "Tokenizer Explorer",       status: "free",   audience: "All levels",       fidelity: "faithful",   hasChallenge: false, hasReflection: false, supportsDirectNav: true  },
  { tab: "explore",    moduleId: "modelcard",          title: "Model Card Reader",        status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: false, supportsDirectNav: true  },
  { tab: "explore",    moduleId: "vectordb",           title: "Vector DB Comparison",     status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: false, supportsDirectNav: true  },
  { tab: "explore",    moduleId: "structured",         title: "Structured Outputs Lab",   status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: false, supportsDirectNav: true  },
  { tab: "explore",    moduleId: "redteam",            title: "Red Teaming Lab",          status: "free",   audience: "Engineers",        fidelity: "simplified", hasChallenge: false, hasReflection: false, supportsDirectNav: true  },

  // ── SYSTEMS (locked, 15) ──
  { tab: "systems",    moduleId: "evals",              title: "Evals Lab",                status: "locked", audience: "Engineers · PMs",  fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "evalfw",             title: "Eval Frameworks",          status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "strategy",           title: "Model Strategy",           status: "locked", audience: "Engineers · PMs",  fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "shouldai",           title: "Should You Use AI?",       status: "locked", audience: "Engineers · PMs",  fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "costlatency",        title: "Cost/Latency Lab",         status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "finetune",           title: "Fine-Tuning Lab",          status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "indiascale",         title: "India Scale Lab",          status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "caching",            title: "Prompt Caching",           status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "router",             title: "Model Router",             status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "inference",          title: "Inference Optimizer",      status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "incidents",          title: "Incident Room",            status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "observability",      title: "Observability",            status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "abtesting",          title: "A/B Testing",              status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "mlcicd",             title: "ML CI/CD",                 status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },
  { tab: "systems",    moduleId: "compaction",         title: "Context Compaction",       status: "locked", audience: "Engineers",        fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: true  },

  // ── FLUENCY (locked, 5) ──
  { tab: "fluency",    moduleId: "mockinterview",      title: "Mock Interview",           status: "locked", audience: "Interview prep",   fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "fluency",    moduleId: "casearena",          title: "Company Case Arena",       status: "locked", audience: "Interview prep",   fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "fluency",    moduleId: "phrasebank",         title: "Phrase Bank",              status: "locked", audience: "Interview prep",   fidelity: null, hasChallenge: false, hasReflection: false, supportsDirectNav: false },
  { tab: "fluency",    moduleId: "prompting",          title: "Prompt Engineering Lab",   status: "locked", audience: "Interview prep",   fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "fluency",    moduleId: "vocab",              title: "Timed Vocabulary",         status: "locked", audience: "Interview prep",   fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },

  // ── AIPM (locked, 5) ──
  { tab: "aipm",       moduleId: "prd",                title: "PRD Simulator",            status: "locked", audience: "Product managers", fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "aipm",       moduleId: "roadmap",            title: "Roadmap Prioritizer",      status: "locked", audience: "Product managers", fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "aipm",       moduleId: "stakeholder",        title: "Stakeholder Explainer",    status: "locked", audience: "Product managers", fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "aipm",       moduleId: "checklist",          title: "AI Launch Checklist",      status: "locked", audience: "Product managers", fidelity: null, hasChallenge: false, hasReflection: false, supportsDirectNav: false },
  { tab: "aipm",       moduleId: "aornot",             title: "AI-or-Not? Framework",     status: "locked", audience: "Product managers", fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },

  // ── CAREER (locked, 4) ──
  { tab: "career",     moduleId: "systemdesign",       title: "System Design Interviews", status: "locked", audience: "Job seekers",      fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "career",     moduleId: "takehome",           title: "Take-Home Challenges",     status: "locked", audience: "Job seekers",      fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
  { tab: "career",     moduleId: "negotiation",        title: "Negotiation Flashcards",   status: "locked", audience: "Job seekers",      fidelity: null, hasChallenge: false, hasReflection: false, supportsDirectNav: false },
  { tab: "career",     moduleId: "benchmarks",         title: "Benchmark Literacy",       status: "locked", audience: "Job seekers",      fidelity: null, hasChallenge: true,  hasReflection: false, supportsDirectNav: false },
];
