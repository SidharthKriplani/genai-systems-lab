// companyTracks.js — curated, company-specific prep tracks for AI-engineering roles.
//
// The grid is (company × role × level). Each cell holds an ordered list of item
// refs that OPEN DIRECTLY via App.jsx's navigateTo() deep-link dispatcher:
//
//   { tabId, itemId, label, kind }
//     tabId  — the view/tab to open. Maps to how the item is dispatched:
//                'concepts'    → navigateTo({ tab:'concepts', gymId:itemId })  (Foundations gym)
//                'groundtruth' → navigateTo({ tab:'groundtruth', postId:itemId })
//                'preplab'     → navigateTo({ tab:'preplab', topic:itemId })    (or mode when itemId omitted)
//                'lab'|'agents'|'agentlab'|'systems'|'evallab'|'llmlab'|'playground'|'career'|'fluency'
//                              → navigateTo({ tab:tabId })   (itemId is informational)
//     itemId — the specific target id inside that tab (gymId / postId / topic), or null
//     label  — display text (name the exact module / post / drill for the user)
//     kind   — free-form tag: 'foundation' | 'post' | 'drill' | 'lab' | 'project' | 'question'
//
// Cells are EMPTY by default (this is the scaffold). Populate CTRACKS below,
// keyed by `${company}|${role}|${level}`; the browser renders whatever exists
// and shows a "coming soon" state where empty. All itemIds referenced below are
// REAL, verified GSL content ids (Concepts gym ids in Concepts.jsx GYMS, GT post
// ids in groundTruthIndex.js, PrepLab topic strings in preplabQuestions.js).
//
// DATA-FILE SYNTAX: single quotes only, no backticks.

export const COMPANIES = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'Nvidia', 'Netflix', 'Uber',
  'LinkedIn', 'Adobe', 'Salesforce', 'Databricks', 'Anthropic',
  'Flipkart', 'Swiggy', 'Zomato', 'Meesho', 'PhonePe', 'Razorpay', 'CRED',
  'Sprinklr', 'Sarvam AI', 'Quantiphi', 'Fractal Analytics', 'Nutanix',
];

// AI-engineering role families (AIE roles).
export const ROLES = [
  'Applied AI Engineer',
  'ML Engineer (GenAI)',
  'AI Researcher',
  'Forward-Deployed Engineer',
];

export const LEVELS = ['Mid', 'Senior', 'Staff'];

export function trackKey(company, role, level) {
  return `${company}|${role}|${level}`;
}

// Sparse map: '<company>|<role>|<level>' -> ordered [ { tabId, itemId, label, kind } ]
export const CTRACKS = {
  // ── POPULATED TRACK ──────────────────────────────────────────────────────
  // Google · Applied AI Engineer · Senior. A real interview-prep arc:
  // foundations → retrieval/RAG → agents → evaluation → production → prep.
  // Every item deep-opens existing GSL content.
  'Google|Applied AI Engineer|Senior': [
    // 1. Foundations — the model internals a senior AIE is expected to explain cold.
    { tabId: 'concepts', itemId: 'language-models', label: 'Foundations · Language Models (tokenizer → attention → KV cache → sampling)', kind: 'foundation' },
    { tabId: 'concepts', itemId: 'foundation-models', label: 'Foundations · Foundation Models (scaling laws, LoRA, RLHF/DPO, quantization)', kind: 'foundation' },
    { tabId: 'groundtruth', itemId: 'chinchilla-scaling-laws', label: 'Read · Chinchilla scaling laws — compute-optimal training', kind: 'post' },

    // 2. Retrieval / RAG — the core competency for an applied GenAI role.
    { tabId: 'concepts', itemId: 'retrieval', label: 'Foundations · Retrieval (embeddings, chunking, RAG pipeline, reranking)', kind: 'foundation' },
    { tabId: 'groundtruth', itemId: 'how-rag-works', label: 'Read · How RAG works end-to-end', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'chunking-strategies', label: 'Read · Chunking strategies and their failure modes', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'hybrid-search', label: 'Read · Hybrid dense + BM25 search', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'reranking-explained', label: 'Read · Reranking — cross-encoders and two-stage retrieval', kind: 'post' },
    { tabId: 'lab', itemId: null, label: 'Lab · RAG Lab — configure a retriever, watch it fail, fix it', kind: 'lab' },
    { tabId: 'groundtruth', itemId: 'rag-system-design', label: 'Read · RAG system design (whiteboard-ready architecture)', kind: 'post' },

    // 3. Agents — tool use and orchestration, increasingly asked at senior level.
    { tabId: 'concepts', itemId: 'ai-agents', label: 'Foundations · AI Agents (ReAct loop, tools, memory, planning, guardrails)', kind: 'foundation' },
    { tabId: 'groundtruth', itemId: 'react-pattern', label: 'Read · The ReAct pattern (reason + act loop)', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'tool-use-design', label: 'Read · Tool-use design for reliable agents', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'agent-failure-modes', label: 'Read · Agent failure modes and how they cascade', kind: 'post' },
    { tabId: 'agents', itemId: null, label: 'Lab · Agent Lab — build and break an agent loop', kind: 'lab' },

    // 4. Evaluation — how you prove a system works. Senior differentiator.
    { tabId: 'concepts', itemId: 'evaluation', label: 'Foundations · Evaluation (LLM-as-judge, eval suites, RAG metrics)', kind: 'foundation' },
    { tabId: 'groundtruth', itemId: 'llm-evaluation-guide', label: 'Read · LLM evaluation guide', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'llm-as-judge-failure', label: 'Read · When LLM-as-judge fails (and how to catch it)', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'eval-pipeline-design', label: 'Read · Eval pipeline design', kind: 'post' },

    // 5. Production — cost, latency, drift, deployment. What ships.
    { tabId: 'concepts', itemId: 'production', label: 'Foundations · Production Systems (cost, latency, observability, drift)', kind: 'foundation' },
    { tabId: 'groundtruth', itemId: 'cost-latency-tradeoffs', label: 'Read · Cost vs latency tradeoffs in serving', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'deployment-patterns-ml', label: 'Read · Deployment patterns for ML systems', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'drift-detection-production', label: 'Read · Drift detection in production', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'llm-observability', label: 'Read · LLM observability in production', kind: 'post' },

    // 6. Prep — judgment drills + interview-pattern reads to close the loop.
    { tabId: 'groundtruth', itemId: 'ambiguous-system-design-framework', label: 'Read · Ambiguous system-design framework (no-spec design)', kind: 'post' },
    { tabId: 'groundtruth', itemId: 'high-tc-ai-company-interviews', label: 'Read · High-TC AI company interview patterns', kind: 'post' },
    { tabId: 'preplab', itemId: 'rag', label: 'Drill · PrepLab — RAG judgment questions', kind: 'drill' },
    { tabId: 'preplab', itemId: 'agents', label: 'Drill · PrepLab — Agents judgment questions', kind: 'drill' },
    { tabId: 'preplab', itemId: 'sysdesign', label: 'Drill · PrepLab — System-design judgment questions', kind: 'drill' },
    { tabId: 'fluency', itemId: null, label: 'Practice · Interview Room — say your answers out loud', kind: 'drill' },
  ],
};

export function getCompanyTrackItems(company, role, level) {
  return CTRACKS[trackKey(company, role, level)] || [];
}

// Companies that have at least one populated cell (for a subtle "has track" dot).
export function companyHasTrack(company) {
  const prefix = company + '|';
  for (const k in CTRACKS) {
    if (k.indexOf(prefix) === 0 && CTRACKS[k] && CTRACKS[k].length) return true;
  }
  return false;
}
