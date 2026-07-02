import { useState } from "react";
import HowTo from "./HowTo";
import { Icon } from "./Icon.jsx";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SYSTEM_DESIGN_PROMPTS = [
  {
    id: "support",
    title: "AI Customer Support System",
    brief: "Design an LLM-powered customer support system for an e-commerce company with 10M users and 50K daily support queries.",
    scale: "10M users · 50K queries/day",
    components: [
      { id: "intent", label: "Intent classifier / router", must: true, explanation: "Routes simple queries (order status → rule-based) vs. complex (complaints → LLM). Saves 40-60% LLM cost." },
      { id: "rag", label: "RAG over FAQ / policy docs", must: true, explanation: "LLM needs grounded answers about policies, products. Without RAG, hallucination rate on policy questions is high." },
      { id: "guardrails", label: "Input + output guardrails", must: true, explanation: "Users will try prompt injection. Output must be checked for PII, off-topic responses, harmful content before sending." },
      { id: "escalation", label: "Human escalation path with context handoff", must: true, explanation: "LLM will fail on edge cases. Human agent needs full conversation context — cold handoff destroys UX." },
      { id: "observability", label: "Observability: latency, hallucination rate, CSAT", must: true, explanation: "You can't improve what you don't measure. Hallucination rate is especially critical for a customer-facing system." },
      { id: "cache", label: "Semantic cache for repeated queries", must: false, explanation: "At 50K queries/day, many are repetitions ('track my order'). Caching saves cost and reduces latency significantly." },
      { id: "ab", label: "A/B testing framework for prompt variants", must: false, explanation: "You'll iterate on prompts. Shadow deployment lets you test new prompts without risking production quality." },
      { id: "feedback", label: "User feedback loop (thumbs up/down)", must: false, explanation: "Cheapest source of eval signal. User thumbs-down becomes your test set for regression testing." },
    ],
  },
  {
    id: "search",
    title: "Enterprise AI Search",
    brief: "Design a semantic search system for a B2B SaaS company with 500K documents, serving 5K internal users.",
    scale: "500K docs · 5K users",
    components: [
      { id: "embedding", label: "Embedding pipeline for document ingestion", must: true, explanation: "Need to encode all 500K docs into vectors. Pipeline handles chunking, embedding, and upsert to vector DB." },
      { id: "vectordb", label: "Vector database with metadata filters", must: true, explanation: "ANN search at 500K scale needs a purpose-built vector DB (Pinecone, Weaviate). Metadata filters for date, team, doc type." },
      { id: "reranker", label: "Reranker for precision on top-k results", must: true, explanation: "ANN retrieval is approximate. Cross-encoder reranker runs on top-5 to find the actually most relevant chunk." },
      { id: "hybrid", label: "Hybrid search: dense + keyword (BM25)", must: true, explanation: "Pure semantic search misses exact keyword matches (product IDs, names). BM25 hybrid captures both." },
      { id: "access", label: "Access control: only show docs user can see", must: true, explanation: "Critical for B2B. Sales docs shouldn't be visible to support. Filter at query time, not just index time." },
      { id: "syncing", label: "Incremental index sync for new documents", must: false, explanation: "Documents are added daily. Full re-index is expensive. Incremental sync keeps search fresh without cost spike." },
      { id: "analytics", label: "Search analytics: zero-result queries, click-through", must: false, explanation: "Zero-result queries tell you where your knowledge base has gaps. Click-through measures ranking quality." },
      { id: "llm_answer", label: "LLM synthesis layer for direct answers", must: false, explanation: "Optional RAG step: take top-3 chunks, ask LLM to synthesize a direct answer. More user-friendly but adds latency/cost." },
    ],
  },
  {
    id: "codegen",
    title: "Internal Code Generation Tool",
    brief: "Design an AI code assistant for a 2,000-engineer organization, integrated into their IDE.",
    scale: "2K engineers · IDE plugin",
    components: [
      { id: "context", label: "IDE context: open files, cursor position, imports", must: true, explanation: "Code gen without file context produces generic output. IDE plugin must send relevant file fragments, not just the current line." },
      { id: "coderag", label: "RAG over internal codebase + docs", must: true, explanation: "Engineers work with proprietary frameworks. RAG over the internal repo generates code that matches actual patterns." },
      { id: "streaming", label: "Streaming response for low perceived latency", must: true, explanation: "Engineers won't wait 4 seconds for a suggestion. Streaming shows tokens as they arrive, making it feel fast." },
      { id: "pii_code", label: "Filter secrets/credentials from context sent to LLM", must: true, explanation: "IDE plugin will see .env files, API keys, auth tokens. Must strip these before sending context to a third-party model API." },
      { id: "telemetry", label: "Acceptance rate + edit distance telemetry", must: true, explanation: "Core quality metric: what % of suggestions are accepted? Edit distance after acceptance tells you if code was actually useful." },
      { id: "local", label: "Local model fallback for sensitive repos", must: false, explanation: "Some repos can't be sent to external APIs (regulated industries). Local/self-hosted model as fallback." },
      { id: "finetune", label: "Fine-tuned model on internal codebase", must: false, explanation: "For large orgs, fine-tuning on internal patterns dramatically improves suggestion quality and style conformity." },
      { id: "review", label: "AI code review integration in CI/CD", must: false, explanation: "Extend the value beyond autocomplete: scan PRs for bugs, style violations, security issues before human review." },
    ],
  },
  {
    id: "multimodal_search",
    title: "Multimodal Product Search",
    brief: "Design an AI search system for an e-commerce platform that accepts both text and image queries (e.g., 'find something similar to this photo').",
    scale: "50M products · text + image queries",
    components: [
      { id: "clip", label: "Multimodal embedding model (CLIP or similar)", must: true, explanation: "CLIP-style models encode both text and images into the same vector space, enabling cross-modal similarity. Without this, text and image queries are incomparable." },
      { id: "indexes", label: "Separate vector indexes for text, image, and cross-modal", must: true, explanation: "Text-only queries should hit the text index for highest precision. Image queries hit the image index. Hybrid queries need a fused cross-modal index. One index for all three creates precision loss." },
      { id: "router", label: "Query type router (text-only vs image vs hybrid)", must: true, explanation: "Routing correctly determines which index and retrieval path to use. A text query through the image index loses ranking quality. Misrouting is invisible and hard to debug." },
      { id: "reranker", label: "Reranker that handles cross-modal relevance", must: true, explanation: "ANN retrieval is approximate. Cross-modal reranking (e.g., re-scoring image results with a text-visual relevance model) is essential for precision at top-5." },
      { id: "preprocess", label: "Image preprocessing pipeline", must: false, explanation: "Resizing, format normalization, and EXIF stripping improve embedding quality and reduce compute cost. Important for production but can start without it." },
      { id: "fallback", label: "Fallback to text-only for unsupported image formats", must: false, explanation: "Not all images are embeddable (corrupt, too small, unsupported format). Graceful degradation to text-only prevents hard failures." },
      { id: "ab_modal", label: "A/B test text vs multimodal relevance", must: false, explanation: "Multimodal isn't always better — for precise product name searches, pure text often wins. A/B testing lets you route by query type once you have data." },
    ],
  },
  {
    id: "streaming_agent",
    title: "Real-Time Document Analysis Agent",
    brief: "Design an agent that processes incoming documents in real-time (contracts, invoices, reports) and streams structured extractions to downstream systems.",
    scale: "10K docs/day · <5s P95 latency",
    components: [
      { id: "queue", label: "Document ingestion queue (async)", must: true, explanation: "At 10K docs/day, direct synchronous processing creates backpressure under load spikes. A queue (SQS, Kafka) decouples ingestion rate from processing rate." },
      { id: "streaming_llm", label: "Streaming LLM with structured output schema", must: true, explanation: "Structured output (JSON schema enforcement) ensures downstream systems receive parseable data. Streaming enables <5s P95 by delivering partial results as they arrive." },
      { id: "validator", label: "Extraction validator + retry on schema failure", must: true, explanation: "LLMs occasionally produce malformed JSON or schema violations. A validator catches these and retries (up to 2×) before sending to downstream, preventing silent data corruption." },
      { id: "dlq", label: "Dead-letter queue for failed extractions", must: true, explanation: "Some documents will fail extraction after retries (corrupt, unsupported format, ambiguous content). DLQ captures these for human review without losing the document." },
      { id: "webhook", label: "Downstream webhook delivery with retry", must: true, explanation: "Downstream systems have their own availability issues. Webhook delivery with exponential backoff and idempotency keys prevents data loss from transient downstream failures." },
      { id: "ocr", label: "OCR preprocessing for scanned docs", must: false, explanation: "Scanned PDFs and photos require OCR before LLM extraction. At 10K docs/day, a significant fraction may be scanned. Add when scan volume is known." },
      { id: "confidence", label: "Confidence scoring per extracted field", must: false, explanation: "Per-field confidence enables downstream systems to flag low-confidence extractions for human review rather than using potentially wrong values." },
      { id: "human_review", label: "Human review queue for low-confidence extractions", must: false, explanation: "Closes the confidence feedback loop. Human corrections become training data and reveal systematic extraction failures." },
    ],
  },
  {
    id: "code_review_ai",
    title: "AI Code Review Bot",
    brief: "Design an AI system that automatically reviews pull requests for bugs, security issues, and style violations before human review.",
    scale: "500 PRs/day · comment within 3 min of PR open",
    components: [
      { id: "webhook_gh", label: "GitHub webhook listener", must: true, explanation: "The entry point for all PR events. Receives PR open/update events in real-time. Without this, you're polling — which adds latency and misses the 3-minute SLA." },
      { id: "diff_builder", label: "Diff-aware context builder (changed code + relevant imports)", must: true, explanation: "Sending the entire file to the LLM wastes tokens and buries the change. A diff-aware builder extracts: changed lines ± N lines context, relevant imports, and function signatures. This is where most teams underinvest." },
      { id: "specialized_prompts", label: "Specialized prompts per review type (security vs bugs vs style)", must: true, explanation: "A single 'review this code' prompt produces mediocre results across all dimensions. Specialized prompts — each tuned for security patterns, logic bugs, or style — produce higher precision and fewer false positives." },
      { id: "fp_filter", label: "False-positive filter (avoid noisy comments)", must: true, explanation: "A bot that posts 50 comments on a 10-line PR gets muted by engineers. False-positive filtering (confidence threshold + per-file comment cap) determines whether the bot is used or ignored." },
      { id: "pr_comment_api", label: "PR comment API integration", must: true, explanation: "The output mechanism. Inline comments on specific diff lines are more actionable than a single top-level comment. GitHub's review API supports inline comments with line references." },
      { id: "team_config", label: "Team-specific rule configuration", must: false, explanation: "Different teams have different style preferences and security threat models. Per-team config makes the bot useful to more teams. Start with defaults; add config when teams request it." },
      { id: "feedback_loop", label: "Learning from accepted/rejected suggestions", must: false, explanation: "Tracking which comments get resolved vs ignored is the highest-signal improvement lever. After 500 PRs, you know which comment types to suppress." },
      { id: "linter_first", label: "Integration with existing linters (run linter first, LLM only reviews what linter misses)", must: false, explanation: "Linters are fast and free. Run ESLint/Pylint first, filter their output from the LLM's task. LLM adds value for semantic bugs and security patterns that linters can't catch." },
    ],
  },
];

const TAKEHOME_CHALLENGES = [
  {
    id: "rank_outputs",
    title: "Rank These Outputs",
    brief: "A customer service bot received this query: 'I ordered 3 items but only 2 arrived. What should I do?'\n\nRank the three responses below from best (1) to worst (3).",
    outputs: [
      { id: "r1", text: "I'm sorry to hear that! Please contact our support team at support@store.com or call 1-800-XXX-XXXX and we'll resolve this right away.", label: "A" },
      { id: "r2", text: "Missing items from your order can happen due to shipping issues or warehouse errors. To resolve this, I'd recommend filing a missing item claim through your account under Orders > Report Issue. Include your order number and a photo of the shipping label. We'll investigate and either ship the missing item or issue a refund within 3-5 business days.", label: "B" },
      { id: "r3", text: "Based on your order history and typical resolution patterns for missing item cases at our fulfillment centers, the probability that this was a warehouse split-shipment is approximately 67%, while carrier loss accounts for roughly 28% of cases, with the remaining 5% attributable to customer receipt errors. I recommend you contact support.", label: "C" },
    ],
    idealRank: ["r2", "r1", "r3"],
    explanations: {
      r2: "Best: Actionable, specific, explains next steps clearly, sets expectations (3-5 days). Treats the customer as capable of self-service.",
      r1: "Acceptable: Provides real contact options. Not as good as self-service path, but gets the job done.",
      r3: "Worst: Fabricated statistics, unnecessary complexity, undermines trust. Classic hallucination pattern dressed up as helpfulness.",
    },
  },
  {
    id: "fix_prompt",
    title: "Find the Prompt Bug",
    brief: "This prompt is producing inconsistent, overly verbose responses. Identify the 3 main issues.",
    badPrompt: `You are a helpful AI assistant. When users ask you questions, please provide them with detailed, comprehensive, and thorough responses that cover all aspects of the topic. Be friendly and conversational. Make sure to include examples where helpful. You can also ask clarifying questions if needed. Always be honest and accurate. Try to be concise but also make sure you give enough information. Format your response however feels natural.`,
    issues: [
      { id: "i1", label: "Contradictory length instructions", correct: true, explanation: "'Detailed and comprehensive' vs 'concise' — the model will pick one randomly each time, causing inconsistency." },
      { id: "i2", label: "No output format specified", correct: true, explanation: "'Format however feels natural' means you'll get bullets, paragraphs, headers mixed unpredictably." },
      { id: "i3", label: "Too many competing objectives", correct: true, explanation: "8+ separate instructions create ambiguity. The model can't satisfy all simultaneously, so it improvises." },
      { id: "i4", label: "Missing a temperature setting", correct: false, explanation: "Temperature is an API parameter, not part of the system prompt. This isn't a prompt bug." },
      { id: "i5", label: "Should use XML tags for structure", correct: false, explanation: "XML tags can help but aren't required. The core issues are contradictions and vagueness, not format syntax." },
    ],
  },
  {
    id: "design_eval",
    title: "Design an Eval",
    brief: "You're shipping an AI feature that summarizes legal contracts. Design a minimum viable eval suite.",
    tasks: [
      { id: "e1", label: "Define pass/fail criteria", placeholder: "What makes a good summary? What's an automatic fail?", hint: "Think: accuracy, completeness, length, hallucinations, identifying key clauses" },
      { id: "e2", label: "Choose test case types", options: ["Short standard NDA (happy path)", "100-page M&A agreement (scale test)", "Non-English contract (edge case)", "Contract with unusual clauses (quality test)", "Adversarial: conflicting clauses (stress test)"], correctOnes: [0,1,2,3,4] },
      { id: "e3", label: "Pick your scoring method", options: ["Human review by legal expert", "LLM-as-judge against a rubric", "ROUGE score vs reference summary", "User acceptance rate in production"], correctOnes: [0,1] },
    ],
    insight: "For legal contracts, automated metrics (ROUGE) miss semantic accuracy — a summary can have high word overlap but still get a key clause wrong. LLM-as-judge + human spot-check is the minimum viable approach. Never rely on only one method.",
  },
  {
    id: "rag_system_design",
    type: "scenario",
    title: "RAG System Design",
    brief: "A legal firm (500 lawyers, 10M+ documents) wants to build an internal Q&A system over case files and contracts. Design the complete RAG pipeline. You have 3 months and a 2-person ML team. The firm cannot use any cloud AI APIs — everything must run on-premise.",
    rubric: [
      "Chunking strategy for legal docs (clause-boundary aware, not fixed-token)",
      "Embedding model choice (self-hosted: BGE-M3 or E5-large-v2)",
      "Vector DB selection (self-hosted: Qdrant or Weaviate, not Pinecone)",
      "Hybrid search (BM25 + dense, legal docs need exact term matching)",
      "Reranker (cross-encoder on top-20 → top-5)",
      "Access control (per-document ACL passed as metadata filter)",
      "Hallucination guardrail (citation grounding check on output)",
      "Eval harness (RAGAS recall@5, precision@5, faithfulness)",
      "Latency budget (p99 < 3s for retrieval + generation)",
    ],
    expertAnswer: "For 10M+ legal documents on-prem: use BGE-M3 or E5-large-v2 as the embedding model (strong multilingual legal performance, self-hostable). Qdrant or Weaviate for vector storage — both support on-prem deployment and metadata filtering for ACL. Chunking: clause-boundary aware, targeting 256-384 tokens, splitting at section headers and paragraph breaks to keep legal clauses intact. Retrieval: hybrid search with RRF fusion — BM25 catches exact legal terms ('force majeure', 'indemnification') that dense search misses. Top-20 → cross-encoder reranker → top-5 to LLM. Access control: filter by `permitted_users` metadata at query time — never post-filter. Output: groundedness check (every claim must cite a retrieved chunk). Eval: RAGAS faithfulness + answer recall on 200 manually verified QA pairs. Latency: retrieval <800ms (ANN search + reranker), generation <2s on an A10G. Ship v1 with 100 docs, expand corpus incrementally.",
  },
  {
    id: "eval_harness",
    type: "scenario",
    title: "Eval Harness from Scratch",
    brief: "You're the first AI engineer at a 40-person B2B startup. The product is an AI assistant that answers questions about customers' HR policies (PDFs). The founder says accuracy is great — but you've noticed 3 wrong answers in a week of using it yourself. You have no eval infrastructure. Build it.",
    rubric: [
      "Admit you can't trust founder's subjective 'accuracy is great' assessment",
      "Start with real production queries (not synthetic)",
      "Define failure taxonomy (hallucination, wrong doc retrieved, answer refusal, format issue)",
      "Choose eval metrics: faithfulness, answer relevance, context recall (RAGAS)",
      "LLM-as-judge for faithfulness (cross-model judge: Claude judging GPT-4o outputs)",
      "Human eval sample (5-10 cases/week, subject matter expert)",
      "Regression baseline (eval score before any change = the floor)",
      "Shadow eval (new model/prompt runs alongside live, outputs compared offline)",
      "Alert threshold (if faithfulness drops >5pp from baseline, flag for review)",
    ],
    expertAnswer: "First: I don't trust verbal accuracy assessments. I pull 50 real production queries from logs (they exist — check the API logs). I label each: correct, wrong but plausible, hallucinated, refused. This gives my first failure taxonomy. I set up RAGAS: faithfulness (is every claim in the answer grounded in retrieved context?) and answer relevance (does the answer address the query?). I use Claude as judge for GPT-4o outputs — same model family as judge creates bias. I score my 50 queries as the v0 baseline. From now on, any prompt or model change must run against this baseline before shipping. I add 5 new queries per week from real failures, growing the eval set. I set a Slack alert: if faithfulness drops below 0.75 for 3 consecutive days, I block deployment until fixed. Cost: ~$2/run on Claude-3-Haiku as judge. Running time: 8 minutes. This is the minimum viable eval harness.",
  },
  {
    id: "incident_response",
    type: "scenario",
    title: "Production Incident Response",
    brief: "It's 2pm Thursday. You get a Slack message: 'The AI answer quality seems off.' You check the dashboard — no errors, p99 latency looks normal. But user CSAT on AI answers dropped from 4.2 to 2.9 over the past 6 hours. You shipped a prompt change at 8am. What do you do, step by step?",
    rubric: [
      "Immediately check if the prompt change correlates with the drop (timestamps)",
      "Do NOT roll back blindly — first understand what changed",
      "Sample 20-30 recent AI answers manually from both before and after 8am",
      "Check retrieval quality (did top-k change? did the vector DB have a migration?)",
      "Hypothesis formation before any action (what specifically is worse?)",
      "Communicate to stakeholders with data, not 'we think'",
      "Rollback decision: if root cause identified and confirmed, roll back; if not, don't",
      "Write incident timeline before end of day",
      "Post-mortem: what eval would have caught this before shipping?",
    ],
    expertAnswer: "Step 1: Pull the last 6 hours of AI answers from logs. Sample 30 at random — 15 from before 8am, 15 after. Read them. This takes 15 minutes and tells me what's actually wrong (too short? hallucinating? wrong topic?). Step 2: Timeline — CSAT drop started at ~8:30am, prompt change shipped at 8:05am. 25-minute lag = plausible causal link. Step 3: I form a hypothesis. After reading the samples, I see the new prompt produces answers with more caveats and less specificity — engineers find it less useful. Step 4: I don't blindly roll back. I check if there's a simpler fix (remove the caveat instruction). Step 5: I message the team: 'CSAT dropped 1.3 points starting 8:30am. Correlated with our 8am prompt change. Root cause: new \"add caveats\" instruction makes answers feel hedged. Rolling back the caveat instruction now, will re-test against eval set first.' Step 6: I ship the revert at 3pm. Step 7: I add a rubric check for 'answer specificity' to our eval so this gets caught before shipping next time.",
  },
  {
    id: "agent_cost_blowout",
    type: "scenario",
    title: "Agent Cost Blowout",
    brief: "Your company's AI coding assistant (powered by a GPT-4o agent with 5 tools: code search, file read, web search, code execution, GitHub API) is costing $4.20 per user session on average. With 800 DAU, that's $3,360/day — way over budget. The PM wants to cut costs by 60% without degrading user CSAT. What's your plan?",
    rubric: [
      "Profile cost per tool call (which tools are most expensive?)",
      "Analyze average turns per session (is 5-turn sessions normal or is it 20+?)",
      "Identify unnecessary tool calls (agent calling web search when code search would do)",
      "Model routing: route simple queries to a cheaper model",
      "Prompt optimization: reduce system prompt token count (adds up at scale)",
      "Caching: semantic cache for common coding questions",
      "Step budget: cap max agent turns (e.g. 10 turns max)",
      "Measure CSAT impact of each change independently",
      "Don't cut everything at once — A/B test each change",
    ],
    expertAnswer: "First, I profile cost attribution. $4.20/session breaks down: which part is LLM tokens, which is tool call overhead? I pull session logs and count: average turns per session (usually 12-18 for coding agents), tokens per turn, which tools get called most. I typically find: web search is called unnecessarily (agent uses it when code search would work), and the system prompt is 3000 tokens on every call. Quick wins: (1) Add tool selection instructions to the system prompt — 'prefer code search over web search for code questions.' This alone reduces web search calls ~40%. (2) Compress system prompt from 3000 to 800 tokens using a distilled version — saves ~$0.60/session. (3) Route simple intent classification (is this a code question?) to GPT-4o-mini at $0.03 vs $0.30. (4) Semantic cache on common queries (environment setup, syntax questions) — ~20% of sessions. (5) Step budget of 12 turns max — prevents runaway sessions. I A/B test each change independently at 10% traffic before rolling out. Target: $1.80/session (57% reduction) with <5% CSAT impact.",
  },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function SystemDesignInterview() {
  const [pIdx, setPIdx] = useState(0);
  const [checked, setChecked] = useState(new Set());
  const [revealed, setRevealed] = useState(false);
  const prompt = SYSTEM_DESIGN_PROMPTS[pIdx];

  function reset(i) { setPIdx(i); setChecked(new Set()); setRevealed(false); }
  function toggle(id) {
    if (revealed) return;
    setChecked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const mustHit = prompt.components.filter(c => c.must);
  const mustChecked = mustHit.filter(c => checked.has(c.id)).length;
  const totalChecked = [...checked].length;
  const score = revealed ? Math.round((mustChecked / mustHit.length) * 70 + (totalChecked / prompt.components.length) * 30) : null;
  const scoreColor = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {SYSTEM_DESIGN_PROMPTS.map((p, i) => (
          <button key={p.id} onClick={() => reset(i)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${i === pIdx ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {p.title.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-zinc-500 mb-1">Design Prompt</p>
        <p className="text-white font-medium text-sm">{prompt.brief}</p>
        <span className="text-xs font-mono text-zinc-500 mt-1 block">{prompt.scale}</span>
      </div>
      <p className="text-xs text-zinc-400">Check every component you'd include in your design. Then reveal the ideal architecture.</p>
      <div className="space-y-2">
        {prompt.components.map(c => (
          <div key={c.id} onClick={() => toggle(c.id)}
            className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${checked.has(c.id) ? "border-indigo-600 bg-indigo-900/10" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"}`}>
            <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${checked.has(c.id) ? "bg-indigo-600 border-indigo-600" : "border-zinc-600"}`}>
              {checked.has(c.id) && <span className="text-white text-xs leading-none"><Icon name="check" size={12} /></span>}
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-200">{c.label}</p>
              {revealed && (
                <p className={`text-xs mt-1 leading-relaxed ${c.must ? "text-indigo-300" : "text-zinc-500"}`}>{c.explanation}</p>
              )}
            </div>
            {revealed && c.must && !checked.has(c.id) && (
              <span className="text-xs text-red-400 font-mono shrink-0">missed!</span>
            )}
          </div>
        ))}
      </div>
      {revealed && score !== null && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-center">
          <p className="text-xs text-zinc-500 mb-1">Architecture Coverage</p>
          <p className="text-3xl font-black" style={{ color: scoreColor }}>{score}%</p>
          <p className="text-xs text-zinc-500 mt-1">{mustChecked}/{mustHit.length} critical components · {totalChecked}/{prompt.components.length} total</p>
        </div>
      )}
      <button onClick={() => setRevealed(!revealed)}
        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
        {revealed ? "Hide Explanations" : "Reveal Ideal Architecture →"}
      </button>
    </div>
  );
}

function TakeHomeChallenge() {
  const [cIdx, setCIdx] = useState(0);
  const [rank, setRank] = useState([0, 1, 2]);
  const [promptIssues, setPromptIssues] = useState(new Set());
  const [evalChoices, setEvalChoices] = useState({ cases: new Set(), scoring: new Set() });
  const [revealed, setRevealed] = useState(false);
  const [scenarioText, setScenarioText] = useState("");
  const [rubricHits, setRubricHits] = useState(new Set());
  const ch = TAKEHOME_CHALLENGES[cIdx];

  function reset(i) { setCIdx(i); setRank([0,1,2]); setPromptIssues(new Set()); setEvalChoices({ cases: new Set(), scoring: new Set() }); setRevealed(false); setScenarioText(""); setRubricHits(new Set()); }
  function toggleRubric(i) { setRubricHits(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; }); }

  function moveRankUp(i) { if (i === 0) return; setRank(r => { const n=[...r]; [n[i-1],n[i]]=[n[i],n[i-1]]; return n; }); }
  function moveRankDown(i) { if (i === rank.length-1) return; setRank(r => { const n=[...r]; [n[i],n[i+1]]=[n[i+1],n[i]]; return n; }); }
  function toggleIssue(id) { setPromptIssues(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; }); }
  function toggleEval(type, id) {
    setEvalChoices(s => { const n=new Set(s[type]); n.has(id)?n.delete(id):n.add(id); return { ...s, [type]: n }; });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TAKEHOME_CHALLENGES.map((c, i) => (
          <button key={c.id} onClick={() => reset(i)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${i === cIdx ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {c.title}
          </button>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{ch.title}</p>
        <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{ch.brief}</p>
      </div>

      {/* Rank Outputs */}
      {cIdx === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">Use ↑↓ to rank best → worst</p>
          {rank.map((oIdx, pos) => {
            const o = ch.outputs[oIdx];
            const idealPos = ch.idealRank.indexOf(o.id);
            const correct = revealed && pos === idealPos;
            const wrong = revealed && pos !== idealPos;
            return (
              <div key={o.id} className={`border rounded-xl p-3 transition-all ${correct ? "border-green-600 bg-green-900/10" : wrong ? "border-red-700 bg-red-900/10" : "border-zinc-700 bg-zinc-900"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveRankUp(pos)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-600 hover:text-white text-sm rounded hover:bg-zinc-700/50 transition-colors">↑</button>
                    <button onClick={() => moveRankDown(pos)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-600 hover:text-white text-sm rounded hover:bg-zinc-700/50 transition-colors">↓</button>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-mono text-zinc-500 mr-2">Option {o.label}</span>
                    <span className="text-sm text-zinc-300">{o.text}</span>
                    {revealed && <p className="text-xs text-indigo-300 mt-2">{ch.explanations[o.id]}</p>}
                  </div>
                  <span className="text-xs font-mono text-zinc-600 shrink-0">#{pos+1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fix Prompt */}
      {cIdx === 1 && (
        <div className="space-y-3">
          <div className="bg-zinc-900 border border-amber-800/40 rounded-xl p-4">
            <p className="text-xs text-amber-400 mb-2">Problematic Prompt</p>
            <p className="text-xs text-zinc-300 font-mono leading-relaxed">{ch.badPrompt}</p>
          </div>
          <p className="text-xs text-zinc-500">Select the 3 main issues:</p>
          {ch.issues.map(issue => {
            const picked = promptIssues.has(issue.id);
            let cls = "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 cursor-pointer";
            if (revealed) {
              if (issue.correct && picked) cls = "border-green-600 bg-green-900/20 text-green-300 cursor-default";
              else if (!issue.correct && picked) cls = "border-red-600 bg-red-900/20 text-red-300 cursor-default";
              else if (issue.correct && !picked) cls = "border-amber-600 bg-amber-900/20 text-amber-300 cursor-default";
              else cls = "border-zinc-800 bg-zinc-900 text-zinc-600 cursor-default";
            } else if (picked) cls = "border-indigo-500 bg-indigo-900/20 text-white cursor-pointer";
            return (
              <div key={issue.id} onClick={() => !revealed && toggleIssue(issue.id)}
                className={`px-4 py-2.5 rounded-xl border text-sm transition-all ${cls}`}>
                {issue.label}
                {revealed && issue.correct && <p className="text-xs mt-1 text-zinc-400">{issue.explanation}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Design Eval */}
      {cIdx === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-zinc-400 mb-2">Which test case types would you include? (select all that apply)</p>
            {ch.tasks[1].options.map((opt, i) => {
              const picked = evalChoices.cases.has(i);
              const isIdeal = ch.tasks[1].correctOnes.includes(i);
              let cls = picked ? "border-indigo-500 bg-indigo-900/20 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500";
              if (revealed) cls = isIdeal ? "border-green-600 bg-green-900/20 text-green-300" : "border-zinc-800 bg-zinc-900 text-zinc-600";
              return (
                <button key={i} onClick={() => !revealed && toggleEval("cases", i)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm mb-1.5 transition-all ${cls}`}>{opt}</button>
              );
            })}
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-2">Which scoring method would you use? (select all that apply)</p>
            {ch.tasks[2].options.map((opt, i) => {
              const picked = evalChoices.scoring.has(i);
              const isIdeal = ch.tasks[2].correctOnes.includes(i);
              let cls = picked ? "border-indigo-500 bg-indigo-900/20 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500";
              if (revealed) cls = isIdeal ? "border-green-600 bg-green-900/20 text-green-300" : "border-zinc-800 bg-zinc-900 text-zinc-600";
              return (
                <button key={i} onClick={() => !revealed && toggleEval("scoring", i)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm mb-1.5 transition-all ${cls}`}>{opt}</button>
              );
            })}
          </div>
          {revealed && (
            <div className="bg-indigo-900/10 border border-indigo-800/40 rounded-xl p-4">
              <p className="text-xs text-indigo-400 mb-1">Key Insight</p>
              <p className="text-sm text-zinc-300">{ch.insight}</p>
            </div>
          )}
        </div>
      )}

      {/* Scenario (free-text) */}
      {ch.type === "scenario" && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Write your answer below, then reveal the expert response:</p>
          <textarea
            value={scenarioText}
            onChange={e => setScenarioText(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 resize-y focus:outline-none focus:border-indigo-500 transition-colors"
            style={{ minHeight: "150px" }}
          />
          {revealed && (
            <div className="space-y-3">
              <div className="bg-violet-950/40 border border-violet-700/50 rounded-xl p-4">
                <p className="text-xs text-violet-400 uppercase tracking-widest mb-2">Expert Answer</p>
                <p className="text-sm text-zinc-200 leading-relaxed">{ch.expertAnswer}</p>
              </div>
              <div className="bg-zinc-900 border border-violet-800/40 rounded-xl p-4">
                <p className="text-xs text-violet-400 uppercase tracking-widest mb-1">Score yourself against the rubric</p>
                <p className="text-[11px] text-zinc-500 mb-3">Tick each point your answer genuinely covered. Be honest — this is your self-grade.</p>
                <ul className="space-y-1.5">
                  {ch.rubric.map((point, i) => {
                    const hit = rubricHits.has(i);
                    return (
                      <li key={i}>
                        <button onClick={() => toggleRubric(i)}
                          className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg border transition-all ${hit ? "border-emerald-700/60 bg-emerald-950/25" : "border-zinc-800 hover:border-zinc-700"}`}>
                          <span className={`shrink-0 mt-0.5 font-mono text-xs ${hit ? "text-emerald-400" : "text-zinc-600"}`}>{hit ? "✓" : "○"}</span>
                          <span className="text-xs text-zinc-300 leading-relaxed">{point}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {(() => {
                  const pct = Math.round((rubricHits.size / ch.rubric.length) * 100);
                  const tier = pct >= 85 ? ["Staff-level", "#22c55e"] : pct >= 60 ? ["Senior-ready", "var(--gal-build)"] : pct >= 35 ? ["Analyst-ready", "#f59e0b"] : ["Junior — keep going", "#fb7185"];
                  return (
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{rubricHits.size}/{ch.rubric.length} covered · <span className="font-mono">{pct}%</span></span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: tier[1], border: `1px solid ${tier[1]}55` }}>{tier[0]}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setRevealed(!revealed)}
        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
        {revealed ? "Hide Answer" : "Reveal Answer →"}
      </button>
    </div>
  );
}

// ─── CAREER APP ───────────────────────────────────────────────────────────────

const CAREER_MODULES = [
  { id: "sysdesign",   label: "System Design",      tag: "DESIGN",    component: SystemDesignInterview,
    objective: "Practice the AI system design interview: identify critical components and explain why each one matters at scale.",
    howTo: ["Read the design prompt and scale constraints — these should drive your choices", "Check every component you'd include before revealing", "After reveal: read the explanation for components you missed — they're production lessons, not trivia", "Focus especially on components you skipped — those are your blind spots"] },
  { id: "takehome",    label: "Take-home Challenge", tag: "CHALLENGE", component: TakeHomeChallenge,
    objective: "Sharpen three real AI take-home skills: ranking model outputs, debugging prompts, and designing evals.",
    howTo: ["Each challenge type appears in real interviews and design reviews", "Rank Outputs: don't just pick 'most helpful' — think about hallucination, specificity, trust", "Fix Prompt: look for contradictions, vagueness, and missing constraints", "Design Eval: good evals need edge cases and the right scoring method, not just happy path tests"] },
];

export default function CareerApp() {
  const [activeModule, setActiveModule] = useState("sysdesign");
  const mod = CAREER_MODULES.find(m => m.id === activeModule);
  const ActiveComponent = mod?.component || SystemDesignInterview;
  const [showWelcome, setShowWelcome] = useState(() => {
    try { return localStorage.getItem("genai_visited_career") !== "1"; } catch { return false; }
  });
  function dismissWelcome() {
    setShowWelcome(false);
    try { localStorage.setItem("genai_visited_career", "1"); } catch {}
  }

  if (showWelcome) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 70%)" }} />
      <div className="max-w-lg w-full flex flex-col items-center text-center gap-6 fade-up">
        <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.08) 100%)", border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 0 24px rgba(245,158,11,0.12)" }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"><Icon name="rocket" size={32} /></div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight" style={{ background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Career Track</h1>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">Interview prep and career tools for engineers targeting AI-forward roles.</p>
        </div>
        <div className="w-full rounded-xl p-5 text-left space-y-3" style={{ background: "linear-gradient(160deg, rgba(245,158,11,0.07) 0%, rgba(15,15,17,0.9) 100%)", border: "1px solid rgba(245,158,11,0.18)", borderTop: "1px solid var(--border)" }}>
          <p className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">What you'll do</p>
          {[
            ["System Design Interviews", "Walk through AI system design prompts the way top companies actually run them — component selection, trade-offs, must-haves vs. nice-to-haves."],
            ["Take-Home Challenges", "Rank LLM outputs, fix broken prompts, design an eval pipeline — the exact formats used by AI-forward companies."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#f59e0b" }} />
              <div><span className="text-xs font-bold text-white">{title} — </span><span className="text-xs text-zinc-400">{desc}</span></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600 font-mono">Best for: engineers targeting AI roles · ML engineers · anyone interviewing at AI companies</p>
        <button onClick={dismissWelcome} style={{ background: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)", boxShadow: "0 4px 16px rgba(245,158,11,0.3), 0 1px 0 rgba(255,255,255,0.1) inset" }} className="px-8 py-3 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110">
          Start Preparing →
        </button>
      </div>
    </div>
  );

  const CAREER_GROUPS = [
    { label: "INTERVIEW",  ids: ["sysdesign", "takehome"] },
  ];

  return (
    <div className="flex h-full min-h-0">
      <div className="w-52 shrink-0 border-r border-zinc-800 overflow-y-auto py-3">
        {CAREER_GROUPS.map(group => (
          <div key={group.label} className="mb-3">
            <div className="px-4 py-1 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{group.label}</div>
            {group.ids.map(id => {
              const m = CAREER_MODULES.find(x => x.id === id);
              if (!m) return null;
              const active = activeModule === id;
              return (
                <button key={id} onClick={() => setActiveModule(id)}
                  style={active ? { background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--border)" } : {}}
                  className={`w-full text-left px-4 py-2.5 transition-all flex flex-col gap-0.5 ${active ? "" : "border-l-2 border-transparent hover:bg-zinc-900"}`}>
                  <span className={`text-xs font-semibold leading-snug ${active ? "text-white" : "text-zinc-300"}`}>{m.label}</span>
                  <span className={`text-[10px] font-mono ${active ? "text-amber-400" : "text-zinc-600"}`}>{m.tag}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {mod?.objective && <HowTo objective={mod.objective} steps={mod.howTo} />}
        <ActiveComponent />
      </div>
    </div>
  );
}
