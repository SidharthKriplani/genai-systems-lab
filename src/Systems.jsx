import { useState } from "react";

// ─── EVALS LAB DATA ───────────────────────────────────────────────────────────

const EVAL_CASES = [
  {
    id: "factual",
    type: "Factual Recall",
    color: "#6366f1",
    description: "Does the system correctly retrieve and state known facts?",
    example: "Q: What is the capital of France? Expected: Paris",
    weakPhrase: "The answer seems right",
    strongPhrase: "Exact match against ground-truth answer with citation",
    llmJudgeRisk: "Low — deterministic check, LLM-as-judge adds no value here",
    metricSuggested: "Exact match / F1 against gold answer",
  },
  {
    id: "groundedness",
    type: "Groundedness",
    color: "#f59e0b",
    description: "Is every claim in the response supported by the retrieved context?",
    example: "Answer cites 'Q2 revenue was $4.2B' — verify it's in the chunk",
    weakPhrase: "Sounds grounded",
    strongPhrase: "NLI entailment: each sentence entailed by retrieved context",
    llmJudgeRisk: "Medium — LLM judges often hallucinate entailment scores",
    metricSuggested: "Faithfulness score (hallucination rate)",
  },
  {
    id: "refusal",
    type: "Refusal Quality",
    color: "#ef4444",
    description: "Does the system correctly refuse out-of-scope or unsafe queries?",
    example: "Q: 'How do I hack this?' → Expected: graceful refusal",
    weakPhrase: "It refused, seems fine",
    strongPhrase: "Refusal rate on adversarial set + helpfulness on benign set (dual threshold)",
    llmJudgeRisk: "High — models undercount refusals on subtle jailbreaks",
    metricSuggested: "Adversarial refusal recall + benign pass rate",
  },
  {
    id: "format",
    type: "Format Compliance",
    color: "#10b981",
    description: "Does output match required structure (JSON, markdown, schema)?",
    example: "API expected {name, score, reason} — check all keys present",
    weakPhrase: "Output looks structured",
    strongPhrase: "Schema validation against JSON schema or regex patterns; zero tolerance",
    llmJudgeRisk: "Low — use a parser, not a judge",
    metricSuggested: "Schema validation pass rate",
  },
  {
    id: "coherence",
    type: "Coherence / Relevance",
    color: "#8b5cf6",
    description: "Is the response coherent and relevant to the question asked?",
    example: "Q: 'Summarize the contract' → answer talks about unrelated project",
    weakPhrase: "It answered the question",
    strongPhrase: "Query-response relevance score + topic drift detection",
    llmJudgeRisk: "Medium — valid use of LLM-as-judge with calibration on human ratings",
    metricSuggested: "Cosine similarity of query/response + LLM coherence score",
  },
  {
    id: "edge",
    type: "Edge Case Coverage",
    color: "#f97316",
    description: "Does the system handle empty context, ambiguous queries, and language edge cases?",
    example: "No context retrieved → should say 'I don't know', not hallucinate",
    weakPhrase: "We tested happy path",
    strongPhrase: "Dedicated adversarial test suite: null context, multi-intent, typos, language switches",
    llmJudgeRisk: "High — need human review for genuinely novel failure modes",
    metricSuggested: "Edge case pass rate (binary per test case)",
  },
];

const BUDGET_SCENARIOS = [
  {
    id: "startup",
    label: "Early-stage startup",
    context: "10k tokens/day, 2 eng, ship in 2 weeks, no ML infra",
    budget: 100,
    recommended: { factual: 25, groundedness: 30, refusal: 15, format: 20, coherence: 5, edge: 5 },
    rationale: "Groundedness + factual catch 80% of production bugs. Skip coherence evals early — users will self-report. Format is critical if you have downstream consumers.",
  },
  {
    id: "enterprise",
    label: "Enterprise compliance product",
    context: "High-stakes legal/HR domain, audit trail required, regulated industry",
    budget: 100,
    recommended: { factual: 20, groundedness: 15, refusal: 30, format: 15, coherence: 5, edge: 15 },
    rationale: "Refusal quality is existential — a single jailbreak is a legal liability. Edge cases need a dedicated red-team suite. Compliance requires every failure mode documented.",
  },
  {
    id: "consumer",
    label: "Consumer chat assistant",
    context: "General Q&A, millions of users, brand safety critical, no strict schema",
    budget: 100,
    recommended: { factual: 20, groundedness: 20, refusal: 25, format: 5, coherence: 20, edge: 10 },
    rationale: "Coherence matters at scale — incoherent answers get screenshotted and go viral. Format eval is low-value (no schema). Refusal + edge case coverage protects brand.",
  },
];

const JUDGE_SCENARIOS = [
  {
    id: "j1",
    question: "A user asked: 'What were our Q3 sales?' The retrieved context shows Q2 data only. The model answered: 'Q3 sales were $12M based on our strong performance trend.'",
    isHallucination: true,
    explanation: "The model extrapolated from Q2 and presented it as Q3 fact. The retrieved context did NOT contain Q3 data — this is a hallucination. An LLM judge should catch this, but often gives it a 7/10 coherence score because the number 'sounds reasonable'.",
    judgeReliable: false,
    judgeIssue: "LLM judges anchor on plausibility, not source fidelity. For groundedness, use NLI entailment or explicit citation verification — not a judge.",
  },
  {
    id: "j2",
    question: "A user asked: 'Summarize the refund policy.' The model said: 'I don't have enough information to answer that question accurately.' The context contained a full refund policy document.",
    isHallucination: false,
    explanation: "This is an over-refusal failure — the model had the answer but didn't use it. Not a hallucination, but a recall failure. A groundedness judge would rate this highly (no hallucination!) while missing the real problem.",
    judgeReliable: false,
    judgeIssue: "Groundedness evals and hallucination evals measure different things. You also need a recall/completeness eval. A hallucination-only judge gives this a 10/10 and misses a severe UX failure.",
  },
  {
    id: "j3",
    question: "A user asked: 'Is this contract clause enforceable?' The model said: 'I am an AI and cannot provide legal advice. Please consult a qualified attorney for legal interpretation.'",
    isHallucination: false,
    explanation: "Correct refusal on a high-stakes legal query. The model appropriately declined and pointed to a professional. This should score high on refusal quality.",
    judgeReliable: true,
    judgeIssue: "LLM-as-judge is reasonable for refusal classification — but you still need human annotation to calibrate the threshold of 'when should it refuse vs. answer helpfully.'",
  },
];

// ─── MODEL STRATEGY LAB DATA ──────────────────────────────────────────────────

const STRATEGY_SCENARIOS = [
  {
    id: "s1",
    title: "Customer Support at Scale",
    tag: "SCENARIO 1",
    color: "#6366f1",
    context: "A SaaS company gets 50k support tickets/month. 70% are repeat questions (billing, password reset, feature how-tos). 30% are novel or edge cases. Response quality is critical — wrong answers hurt retention. Latency target: <3s. Budget: moderate.",
    question: "What is the right primary strategy?",
    options: [
      { id: "rag", label: "RAG over knowledge base", summary: "Retrieve from FAQ + docs + past tickets" },
      { id: "finetune", label: "Fine-tune a support model", summary: "Train on 12 months of ticket history" },
      { id: "prompt", label: "Prompt engineering only", summary: "Few-shot examples in system prompt" },
      { id: "agent", label: "Agent with tool use", summary: "Look up accounts, trigger actions, escalate" },
    ],
    correct: "rag",
    explanation: "RAG is correct here. The knowledge base changes frequently (new features, policy updates) — fine-tuning would need constant retraining. Prompt engineering alone can't handle 50k ticket variety. Agents add latency and complexity not needed for Q&A. RAG gives you: freshness (update the KB, not the model), citation for auditing, and fast retrieval for the 70% repeat queries. Add an agent layer only for the subset that requires account lookup or action.",
    wrongExplanations: {
      finetune: "Fine-tuning bakes knowledge into weights — but support content changes constantly. You'd retrain monthly. Fine-tuning is for style/format, not factual recall from a live corpus.",
      prompt: "Few-shot prompting hits token limits fast. You can't fit 50k FAQ variants in a context window. Works for a prototype, fails in production at this scale.",
      agent: "Agents are right for the action-taking subset (look up account, trigger refund), not for the Q&A majority. Starting with a full agent adds latency and failure surface.",
    },
    designLesson: "RAG vs fine-tuning decision: if the knowledge changes → RAG. If the style/format needs to change → fine-tuning. If you need to take actions → agents.",
  },
  {
    id: "s2",
    title: "Code Review Assistant",
    tag: "SCENARIO 2",
    color: "#10b981",
    context: "A fintech company wants an internal tool that reviews PRs for their proprietary coding standards, internal library usage, security patterns, and compliance rules. The standards are documented but highly specific to their stack. Standard models know nothing about their internal APIs.",
    question: "What is the right primary strategy?",
    options: [
      { id: "rag", label: "RAG over standards docs", summary: "Retrieve relevant coding rules per PR" },
      { id: "finetune", label: "Fine-tune on internal code", summary: "Train model on approved internal PRs" },
      { id: "prompt", label: "Prompt engineering only", summary: "Include standards in system prompt" },
      { id: "agent", label: "Agent with code tools", summary: "Run static analysis + LLM review" },
    ],
    correct: "finetune",
    explanation: "Fine-tuning wins here. The internal library APIs, proprietary patterns, and compliance rules are stable and highly specific — they don't change weekly. The model needs to 'know' how your internal SDK works, which RAG handles poorly for code-level pattern recognition. Fine-tuning on approved PRs + rejection examples teaches the model the pattern, not just the rule. RAG is a complement for the documentation layer, but the core intelligence needs to be baked in.",
    wrongExplanations: {
      rag: "RAG retrieves text, but code review requires understanding patterns, not rules lookup. A rule like 'use SafeDB instead of raw SQL' is better as a trained behavior than a retrieved instruction.",
      prompt: "You can't fit thousands of internal API signatures and code patterns in a system prompt. Works for 5-10 rules, breaks down for an enterprise codebook.",
      agent: "Static analysis tools are valuable additions, but the LLM layer still needs to understand your internal patterns. Agents don't solve the 'model doesn't know our APIs' problem.",
    },
    designLesson: "Fine-tuning is for stable, proprietary behavioral patterns — especially when the knowledge is structural (code patterns, tone, format) not factual (today's product info).",
  },
  {
    id: "s3",
    title: "Research Report Generator",
    tag: "SCENARIO 3",
    color: "#f59e0b",
    context: "A financial analyst team wants a tool that, given a company name, automatically: (1) fetches latest SEC filings, (2) pulls earnings call transcripts, (3) retrieves news from the last 30 days, (4) synthesizes a structured investment memo. Speed is less important — analysts check output. Accuracy is critical.",
    question: "What is the right primary strategy?",
    options: [
      { id: "rag", label: "RAG over static corpus", summary: "Index past reports and filings" },
      { id: "finetune", label: "Fine-tune on analyst memos", summary: "Train on high-quality past memos" },
      { id: "prompt", label: "Prompt engineering only", summary: "Detailed memo template in prompt" },
      { id: "agent", label: "Multi-step agent with tools", summary: "Search → fetch → analyze → synthesize" },
    ],
    correct: "agent",
    explanation: "This is a textbook agent use case. The task requires: sequential multi-step execution (fetch → filter → synthesize), real-time data access (last 30 days of news), tool integration (SEC API, news API, transcript DB), and structured output composition. A static RAG corpus would be stale. Fine-tuning doesn't give you real-time fetch. Prompting alone can't orchestrate multi-source retrieval. An agent with tool use (search, fetch, structure) is the right architecture, with prompt engineering for the memo format and optionally fine-tuning for output style.",
    wrongExplanations: {
      rag: "A static corpus goes stale in 30 days — exactly the freshness window that matters here. You'd need to continuously re-index, at which point you're building an agent anyway.",
      finetune: "Fine-tuning teaches style, not how to fetch live data. The model would produce stylistically good memos hallucinating data it was trained on months ago.",
      prompt: "You can't prompt your way to 'fetch live SEC filings.' Prompting handles the synthesis and formatting layer — not the data acquisition.",
    },
    designLesson: "Agents are for: multi-step workflows, real-time data access, action-taking, and cross-source synthesis. If a human would need to open 3 browser tabs to answer the question, you need an agent.",
  },
  {
    id: "s4",
    title: "Multilingual Content Moderation",
    tag: "SCENARIO 4",
    color: "#ef4444",
    context: "A social platform moderates 2M posts/day across 40 languages. They have 18 months of labeled moderation data (approved/removed + violation category). Latency must be <500ms. Cost sensitivity is high. The violation categories are specific to their community standards.",
    question: "What is the right primary strategy?",
    options: [
      { id: "rag", label: "RAG over moderation guidelines", summary: "Retrieve relevant rules per post" },
      { id: "finetune", label: "Fine-tune a classification model", summary: "Train on 18 months of labeled data" },
      { id: "prompt", label: "Prompt engineering with examples", summary: "Few-shot violation examples in prompt" },
      { id: "agent", label: "Agent with escalation logic", summary: "Classify → escalate borderline cases" },
    ],
    correct: "finetune",
    explanation: "Fine-tuning a smaller model is the right call at this scale. With 2M posts/day, cost and latency are the binding constraints. Fine-tuning a 7B model on 18 months of labeled data gives you: fast inference (<500ms easily), low per-token cost, proprietary classification categories baked in, and multilingual transfer from the base model. RAG at 2M queries/day is expensive and adds retrieval latency. Agents are overkill for binary/categorical classification. Prompt engineering can't reach production-quality accuracy at scale for this task.",
    wrongExplanations: {
      rag: "At 2M queries/day, retrieval latency and cost are prohibitive. Moderation categories are stable — you don't need to retrieve rules, you need to classify against them.",
      prompt: "Few-shot prompting with a large model at 2M/day costs tens of thousands of dollars per month. Fine-tuning amortizes that cost. Accuracy also plateaus below production threshold.",
      agent: "Escalation logic is a valid add-on, but the base classifier should be a fine-tuned model, not an agent. Agents aren't classifiers.",
    },
    designLesson: "When you have labeled data + stable categories + high volume + cost pressure → fine-tune a smaller model. RAG is for retrieval from changing knowledge, not for classification tasks.",
  },
  {
    id: "s5",
    title: "Internal Policy Q&A Bot",
    tag: "SCENARIO 5",
    color: "#8b5cf6",
    context: "An HR team wants employees to ask questions about company policies (leave, benefits, code of conduct). The policy docs are 200 pages and updated quarterly. Questions are simple factual lookups. The team has no ML engineers — this needs to be buildable in a week by a product engineer.",
    question: "What is the right primary strategy?",
    options: [
      { id: "rag", label: "RAG over policy documents", summary: "Chunk docs, embed, retrieve, answer" },
      { id: "finetune", label: "Fine-tune on policy Q&A pairs", summary: "Generate Q&A pairs and fine-tune" },
      { id: "prompt", label: "Prompt with full policy doc", summary: "Paste policy into system prompt" },
      { id: "agent", label: "Agent with HR system integrations", summary: "Connect to Workday, benefits portal" },
    ],
    correct: "rag",
    explanation: "RAG is the pragmatic correct answer. Simple factual Q&A over a document corpus is RAG's strongest use case. The docs are quarterly-updated (too frequent for retraining), the team has no ML infra, and the task is pure retrieval + synthesis. A basic RAG pipeline (chunk → embed → retrieve → answer) is buildable in days with off-the-shelf tools. Prompt with full doc fails on context length (200 pages). Fine-tuning is overkill with no ML team. Agents add unnecessary complexity.",
    wrongExplanations: {
      finetune: "No ML team means no fine-tuning pipeline. Even if they had one, quarterly policy updates would require constant retraining. Wrong tool for this team.",
      prompt: "200 pages won't fit in any context window. And even if it did, it's expensive to send on every query and slow to process.",
      agent: "HR system integrations are valuable for action-taking (submit leave request), but the Q&A use case doesn't need them. Over-engineered for week-1.",
    },
    designLesson: "Build the simplest thing that works: RAG handles 90% of document Q&A cases. Add agents when you need to take actions. Fine-tune when you have ML infra and labeled data.",
  },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function EvalsLab() {
  const [activeTab, setActiveTab] = useState("types");
  const [budgetScenario, setBudgetScenario] = useState("startup");
  const [allocation, setAllocation] = useState({ factual: 20, groundedness: 20, refusal: 15, format: 15, coherence: 15, edge: 15 });
  const [judgeIdx, setJudgeIdx] = useState(0);
  const [judgeAnswer, setJudgeAnswer] = useState(null);
  const [showJudgeReveal, setShowJudgeReveal] = useState(false);

  const totalAlloc = Object.values(allocation).reduce((a, b) => a + b, 0);
  const scenario = BUDGET_SCENARIOS.find(s => s.id === budgetScenario);

  function adjustAlloc(key, delta) {
    setAllocation(prev => {
      const next = { ...prev, [key]: Math.max(0, Math.min(60, prev[key] + delta)) };
      return next;
    });
  }

  const judgeCase = JUDGE_SCENARIOS[judgeIdx];

  function nextJudge() {
    setJudgeIdx(i => (i + 1) % JUDGE_SCENARIOS.length);
    setJudgeAnswer(null);
    setShowJudgeReveal(false);
  }

  const TABS = [
    { id: "types", label: "Eval Types" },
    { id: "budget", label: "Budget Allocator" },
    { id: "judge", label: "LLM-as-Judge Audit" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-800 bg-indigo-950/40 p-5">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <span className="text-xs font-mono px-2 py-0.5 bg-indigo-900 text-indigo-300 rounded border border-indigo-700">EVALS LAB</span>
          <span className="text-xs text-zinc-500">learn to design production eval suites</span>
        </div>
        <h2 className="text-xl font-bold text-white">Evaluation Design Studio</h2>
        <p className="text-sm text-zinc-400 mt-1">Evals are the most underrated skill in AI systems. Learn what to measure, how much to spend, and when LLM-as-judge misleads you.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Eval Types */}
      {activeTab === "types" && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Six core eval types for production LLM systems. Each has a different measurement strategy and LLM-judge reliability profile.</p>
          {EVAL_CASES.map(ec => (
            <div key={ec.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: ec.color + "22", color: ec.color, border: `1px solid ${ec.color}44` }}>{ec.type}</span>
                <span className="text-xs text-zinc-500 font-mono">{ec.metricSuggested}</span>
              </div>
              <p className="text-sm text-zinc-300">{ec.description}</p>
              <div className="rounded bg-zinc-950 border border-zinc-800 p-3 text-xs font-mono text-zinc-400">{ec.example}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded bg-red-950/30 border border-red-900/40 p-3">
                  <div className="text-xs text-red-400 font-bold mb-1">❌ Weak eval language</div>
                  <div className="text-xs text-zinc-300">"{ec.weakPhrase}"</div>
                </div>
                <div className="rounded bg-emerald-950/30 border border-emerald-900/40 p-3">
                  <div className="text-xs text-emerald-400 font-bold mb-1">✓ Strong eval language</div>
                  <div className="text-xs text-zinc-300">"{ec.strongPhrase}"</div>
                </div>
              </div>
              <div className="rounded bg-amber-950/30 border border-amber-900/40 p-3">
                <span className="text-xs text-amber-400 font-bold">LLM-as-Judge risk: </span>
                <span className="text-xs text-zinc-300">{ec.llmJudgeRisk}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Budget Allocator */}
      {activeTab === "budget" && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">Different products need different eval distributions. Allocate your 100-point eval budget and compare with the recommended allocation.</p>
          <div className="flex gap-2 flex-wrap">
            {BUDGET_SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => setBudgetScenario(s.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${budgetScenario === s.id ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            <div className="text-xs text-zinc-500 mb-3">{scenario.context}</div>
            <div className="space-y-3">
              {EVAL_CASES.map(ec => {
                const yours = allocation[ec.id];
                const rec = scenario.recommended[ec.id];
                const diff = yours - rec;
                return (
                  <div key={ec.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: ec.color }}>{ec.type}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500">rec: {rec}pts</span>
                        <span className={diff > 5 ? "text-amber-400" : diff < -5 ? "text-red-400" : "text-emerald-400"}>
                          yours: {yours}pts {diff > 0 ? `+${diff}` : diff < 0 ? diff : "✓"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                        <div className="absolute h-full rounded-full opacity-30" style={{ width: `${rec}%`, background: ec.color }} />
                        <div className="absolute h-full rounded-full" style={{ width: `${yours}%`, background: ec.color }} />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => adjustAlloc(ec.id, -5)} className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold">-</button>
                        <button onClick={() => adjustAlloc(ec.id, +5)} className="w-6 h-6 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold">+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={`mt-4 text-xs font-bold ${totalAlloc === 100 ? "text-emerald-400" : "text-red-400"}`}>
              Total: {totalAlloc}/100 points {totalAlloc !== 100 && `— ${totalAlloc < 100 ? `${100 - totalAlloc} unallocated` : `${totalAlloc - 100} over budget`}`}
            </div>
          </div>
          <div className="rounded-xl border border-indigo-900 bg-indigo-950/30 p-4">
            <div className="text-xs font-bold text-indigo-300 mb-2">Recommended allocation rationale</div>
            <p className="text-xs text-zinc-300 leading-relaxed">{scenario.rationale}</p>
          </div>
        </div>
      )}

      {/* Tab: LLM-as-Judge Audit */}
      {activeTab === "judge" && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">LLM-as-judge is powerful but unreliable in specific failure modes. Read each case — decide if the LLM judge would catch it.</p>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500">CASE {judgeIdx + 1} / {JUDGE_SCENARIOS.length}</span>
              <button onClick={nextJudge} className="text-xs text-indigo-400 hover:text-white transition-colors">Next case →</button>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">{judgeCase.question}</p>

            {!showJudgeReveal && (
              <div className="space-y-3">
                <div className="text-xs text-zinc-500 font-semibold">Would an LLM-as-judge reliably catch this issue?</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setJudgeAnswer(true); setShowJudgeReveal(true); }}
                    className="flex-1 py-2 rounded-lg bg-emerald-900/40 border border-emerald-700 text-emerald-300 text-sm font-semibold hover:bg-emerald-900/70 transition-all"
                  >
                    Yes, judge catches it
                  </button>
                  <button
                    onClick={() => { setJudgeAnswer(false); setShowJudgeReveal(true); }}
                    className="flex-1 py-2 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm font-semibold hover:bg-red-900/70 transition-all"
                  >
                    No, judge misses it
                  </button>
                </div>
              </div>
            )}

            {showJudgeReveal && (
              <div className="space-y-3">
                <div className={`rounded-lg p-3 text-sm font-semibold ${judgeAnswer === judgeCase.judgeReliable ? "bg-emerald-900/40 border border-emerald-700 text-emerald-300" : "bg-red-900/40 border border-red-700 text-red-300"}`}>
                  {judgeAnswer === judgeCase.judgeReliable ? "✓ Correct read" : "✗ Not quite"}
                </div>
                <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                  <div className="text-xs font-bold text-zinc-400">What's actually happening:</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{judgeCase.explanation}</p>
                  <div className="text-xs font-bold text-amber-400 mt-2">Judge limitation:</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{judgeCase.judgeIssue}</p>
                </div>
                <button onClick={nextJudge} className="w-full py-2 rounded-lg bg-indigo-900/40 border border-indigo-700 text-indigo-300 text-xs font-semibold hover:bg-indigo-900/70 transition-all">
                  Next case →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ModelStrategyLab() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState({});

  const sc = STRATEGY_SCENARIOS[scenarioIdx];

  function goToScenario(i) {
    setScenarioIdx(i);
    setChosen(null);
    setRevealed(false);
  }

  function handlePick(optId) {
    if (revealed) return;
    setChosen(optId);
  }

  function reveal() {
    if (!chosen) return;
    setRevealed(true);
    const correct = chosen === sc.correct;
    setScores(prev => ({ ...prev, [sc.id]: correct }));
  }

  function next() {
    if (scenarioIdx < STRATEGY_SCENARIOS.length - 1) goToScenario(scenarioIdx + 1);
  }

  const correctCount = Object.values(scores).filter(Boolean).length;
  const answeredCount = Object.keys(scores).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-5">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <span className="text-xs font-mono px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded border border-emerald-700">MODEL STRATEGY LAB</span>
          <span className="text-xs text-zinc-500">RAG vs Fine-tuning vs Prompt Engineering vs Agents</span>
        </div>
        <h2 className="text-xl font-bold text-white">Model Strategy Decision Lab</h2>
        <p className="text-sm text-zinc-400 mt-1">5 real-world scenarios. Pick the right strategy. Understand why the others fail.</p>
        {answeredCount > 0 && (
          <div className="mt-3 text-xs font-mono text-emerald-400">{correctCount}/{answeredCount} correct so far</div>
        )}
      </div>

      {/* Scenario progress */}
      <div className="flex gap-2 flex-wrap">
        {STRATEGY_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goToScenario(i)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${scenarioIdx === i ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {scores[s.id] === true ? "✓" : scores[s.id] === false ? "✗" : `${i + 1}`}
            <span className="hidden sm:inline">{s.tag.split(" ")[1]}</span>
          </button>
        ))}
      </div>

      {/* Scenario card */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: sc.color + "22", color: sc.color, border: `1px solid ${sc.color}44` }}>{sc.tag}</span>
          <h3 className="text-lg font-bold text-white">{sc.title}</h3>
        </div>
        <div className="rounded bg-zinc-950 border border-zinc-800 p-4 text-sm text-zinc-300 leading-relaxed">{sc.context}</div>
        <div className="text-sm font-semibold text-zinc-300">{sc.question}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sc.options.map(opt => {
            let border = "border-zinc-700";
            let bg = "bg-zinc-800/60";
            let textColor = "text-zinc-300";
            if (chosen === opt.id && !revealed) { border = "border-emerald-500"; bg = "bg-emerald-900/20"; }
            if (revealed) {
              if (opt.id === sc.correct) { border = "border-emerald-500"; bg = "bg-emerald-900/20"; textColor = "text-emerald-300"; }
              else if (opt.id === chosen && chosen !== sc.correct) { border = "border-red-500"; bg = "bg-red-900/20"; textColor = "text-red-300"; }
            }
            return (
              <button
                key={opt.id}
                onClick={() => handlePick(opt.id)}
                disabled={revealed}
                className={`rounded-xl border p-4 text-left transition-all ${border} ${bg} ${textColor} hover:border-zinc-500`}
              >
                <div className="font-semibold text-sm mb-1">{opt.label}</div>
                <div className="text-xs opacity-70">{opt.summary}</div>
              </button>
            );
          })}
        </div>

        {!revealed && (
          <button
            onClick={reveal}
            disabled={!chosen}
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${chosen ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}
          >
            Reveal answer
          </button>
        )}

        {revealed && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 text-sm leading-relaxed ${chosen === sc.correct ? "bg-emerald-900/30 border border-emerald-700 text-emerald-200" : "bg-red-900/20 border border-red-800 text-red-200"}`}>
              <div className="font-bold mb-2">{chosen === sc.correct ? "✓ Correct strategy" : "✗ Not the best fit"}</div>
              {chosen === sc.correct ? sc.explanation : sc.wrongExplanations[chosen]}
            </div>
            {chosen !== sc.correct && (
              <div className="rounded-lg bg-emerald-950/40 border border-emerald-800 p-4 text-sm text-emerald-200 leading-relaxed">
                <div className="font-bold mb-2">Why {sc.options.find(o => o.id === sc.correct)?.label} is correct:</div>
                {sc.explanation}
              </div>
            )}
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3">
              <span className="text-xs font-bold text-indigo-400">Design principle: </span>
              <span className="text-xs text-zinc-300">{sc.designLesson}</span>
            </div>
            {scenarioIdx < STRATEGY_SCENARIOS.length - 1 && (
              <button onClick={next} className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 transition-all">
                Next scenario →
              </button>
            )}
            {scenarioIdx === STRATEGY_SCENARIOS.length - 1 && answeredCount === STRATEGY_SCENARIOS.length && (
              <div className="rounded-xl border border-indigo-700 bg-indigo-950/40 p-4 text-center">
                <div className="text-lg font-bold text-white mb-1">All 5 done — {correctCount}/5 correct</div>
                <div className="text-xs text-zinc-400">
                  {correctCount === 5 ? "Perfect. You can discuss strategy tradeoffs at senior-level." :
                   correctCount >= 3 ? "Solid grasp. Review the wrong ones — the rationale is the interview answer." :
                   "Keep going. The explanations are what interviewers are looking for."}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SYSTEMS APP ─────────────────────────────────────────────────────────────

const SYSTEMS_MODULES = [
  { id: "evals", label: "Evals Lab", tag: "DESIGN", component: EvalsLab },
  { id: "strategy", label: "Model Strategy", tag: "DECISION", component: ModelStrategyLab },
];

export default function SystemsApp() {
  const [activeModule, setActiveModule] = useState("evals");
  const ActiveComponent = SYSTEMS_MODULES.find(m => m.id === activeModule)?.component || EvalsLab;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Systems Lab</h1>
        <p className="text-sm text-zinc-400">Production AI systems thinking — evals, strategy, and architecture decisions</p>
      </div>

      {/* Module switcher */}
      <div className="flex gap-2 justify-center flex-wrap">
        {SYSTEMS_MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeModule === m.id ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${activeModule === m.id ? "bg-zinc-200 text-zinc-800" : "bg-zinc-700 text-zinc-400"}`}>{m.tag}</span>
            {m.label}
          </button>
        ))}
        <span className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-zinc-900 text-zinc-700 border border-dashed border-zinc-800 cursor-default">
          Incident Room — soon
        </span>
      </div>

      <ActiveComponent />
    </div>
  );
}
