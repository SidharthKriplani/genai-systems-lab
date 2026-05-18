import { useState } from "react";
import HowTo from "./HowTo";

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
];

const NEGOTIATION_SCENARIOS = [
  {
    pushback: "\"This AI feature will solve all our support problems. We won't need as many agents.\"",
    speaker: "VP of Operations",
    options: [
      "Agree — that's the goal of the feature.",
      "The feature will deflect tier-1 queries, but complex cases still need human agents. Let's set realistic deflection targets rather than headcount targets — that sets clearer success criteria.",
      "That's up to leadership to decide after we see the results.",
      "AI will eventually replace all support agents, so this is just the first step.",
    ],
    correct: 1,
    explanation: "Never set headcount as a success metric for an AI feature — it creates misaligned incentives and is often inaccurate. Deflection rate is a better metric. This response is honest, data-driven, and sets good expectations without shutting down the conversation.",
  },
  {
    pushback: "\"The model is 95% accurate, that's great! Let's ship it.\"",
    speaker: "Product Manager",
    options: [
      "Agree — 95% is industry standard.",
      "That depends on what the 5% failures look like. If errors are harmless, 95% might be fine. If errors cause customer harm or legal liability, we need to look at the failure distribution before deciding.",
      "We should wait until we reach 99% accuracy.",
      "Let's A/B test it at 5% traffic and see if anyone notices.",
    ],
    correct: 1,
    explanation: "95% average accuracy can hide catastrophic failure modes on important subsets. A PM's job is to ask 'what does the 5% look like?' — not to accept or reject the number in isolation.",
  },
  {
    pushback: "\"Can't we just use ChatGPT for this? It's free.\"",
    speaker: "Engineering Manager",
    options: [
      "No — we should always build our own models.",
      "ChatGPT's free tier has rate limits, no SLA, and we can't send customer PII. For a production feature, we need an API with an enterprise agreement, data processing addendum, and uptime guarantees.",
      "Yes, let's prototype with it first and migrate later.",
      "Free tools are fine — we can worry about compliance later.",
    ],
    correct: 1,
    explanation: "This is a common trap. 'Free' ignores rate limits, data privacy (PII in prompts), SLA (no guarantee of uptime), and vendor lock-in. The right answer distinguishes prototyping context from production requirements.",
  },
  {
    pushback: "\"The AI gave a wrong answer in our demo. I've lost confidence in this project.\"",
    speaker: "Stakeholder / Executive",
    options: [
      "Apologize and delay the ship date.",
      "That's expected — AI is probabilistic, not deterministic. What we should evaluate is failure rate at scale, not a single demo instance. Let me show you our eval results on 500 test cases.",
      "The demo environment isn't representative of production.",
      "We'll fix the bug that caused that specific failure.",
    ],
    correct: 1,
    explanation: "One failure in a demo is not statistically meaningful. The right response reframes from anecdote to data, educates the stakeholder on probabilistic systems, and redirects to meaningful evaluation evidence.",
  },
  {
    pushback: "\"Legal says we can't use any AI for customer-facing features.\"",
    speaker: "Legal Team",
    options: [
      "Ask engineering to find a workaround.",
      "Work with legal to understand the specific concern: is it data handling, liability for wrong answers, disclosure requirements, or something else? Each concern has different mitigations.",
      "Agree and cancel the project.",
      "Tell legal that the AI is just a 'recommendation engine', not AI.",
    ],
    correct: 1,
    explanation: "Legal's 'no AI' position is usually a proxy for a specific concern. Understanding the root concern lets you solve the actual problem — not the proxy. Relabeling AI as 'recommendations' is ethically problematic and doesn't address the real risk.",
  },
];

const BENCHMARK_ROUNDS = [
  {
    claim: "\"Model X achieves 90% on MMLU, so it's highly knowledgeable.\"",
    verdict: "misleading",
    explanation: "MMLU tests multiple-choice questions across 57 academic subjects. High MMLU means good performance on that task — not general knowledge. Models can score high on MMLU while still hallucinating facts in open-ended generation. MMLU doesn't measure calibration, groundedness, or reasoning consistency.",
  },
  {
    claim: "\"Our model beats GPT-4 on our internal benchmark.\"",
    verdict: "suspect",
    explanation: "Internal benchmarks are prone to data contamination (test set leaked into training), benchmark overfitting (optimized specifically for this benchmark), and selection bias (only reporting benchmarks where you win). Always ask: is this benchmark public? Was it in the training data?",
  },
  {
    claim: "\"Model A has a 1-second lower average latency than Model B.\"",
    verdict: "incomplete",
    explanation: "Average latency hides tail behavior. What's the P95? P99? A model with lower mean but higher P99 will feel slower to 1% of users — which at scale is thousands of people. Production SLAs should be set on P95/P99, not mean.",
  },
  {
    claim: "\"Human evaluators preferred Model A's responses 73% of the time.\"",
    verdict: "context-dependent",
    explanation: "Pairwise human eval is meaningful, but: How many evaluators? What's their domain expertise? Were evaluators blind to which model produced each response? What task type? 73% on creative writing means something different than 73% on medical advice.",
  },
  {
    claim: "\"The model scored 0.85 on BERTScore for summarization.\"",
    verdict: "misleading",
    explanation: "BERTScore measures token-level similarity to a reference summary. It can miss factual errors (hallucinations) that use different words from the reference, and it rewards fluent-sounding text regardless of accuracy. For summarization quality, human eval or LLM-as-judge on a rubric is more reliable.",
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
              {checked.has(c.id) && <span className="text-white text-xs leading-none">✓</span>}
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
  const ch = TAKEHOME_CHALLENGES[cIdx];

  function reset(i) { setCIdx(i); setRank([0,1,2]); setPromptIssues(new Set()); setEvalChoices({ cases: new Set(), scoring: new Set() }); setRevealed(false); }

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
                    <button onClick={() => moveRankUp(pos)} className="text-zinc-600 hover:text-white text-xs">↑</button>
                    <button onClick={() => moveRankDown(pos)} className="text-zinc-600 hover:text-white text-xs">↓</button>
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

      <button onClick={() => setRevealed(!revealed)}
        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
        {revealed ? "Hide Answer" : "Reveal Answer →"}
      </button>
    </div>
  );
}

function NegotiationFlashcards() {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState([]);
  const sc = NEGOTIATION_SCENARIOS[idx];

  function pick(i) {
    if (revealed) return;
    setSel(i);
    setRevealed(true);
    setScores(s => [...s, i === sc.correct ? 1 : 0]);
  }
  function next() {
    if (idx + 1 >= NEGOTIATION_SCENARIOS.length) { setIdx(0); setScores([]); } else { setIdx(idx + 1); }
    setSel(null); setRevealed(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">{NEGOTIATION_SCENARIOS.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < scores.length ? (scores[i] ? "bg-green-500" : "bg-red-500") : i === idx ? "bg-indigo-500" : "bg-zinc-700"}`} />
        ))}</div>
        <span className="text-xs text-zinc-500">{scores.filter(Boolean).length}/{scores.length} handled well</span>
      </div>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">{sc.speaker} says:</p>
        <p className="text-white font-medium text-base italic leading-relaxed">{sc.pushback}</p>
        <p className="text-xs text-zinc-500 mt-3">What's your best response?</p>
      </div>
      <div className="space-y-2">
        {sc.options.map((opt, i) => {
          let cls = "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 cursor-pointer";
          if (revealed) {
            if (i === sc.correct) cls = "border-green-600 bg-green-900/20 text-green-300 cursor-default";
            else if (i === sel) cls = "border-red-600 bg-red-900/20 text-red-400 cursor-default";
            else cls = "border-zinc-800 bg-zinc-900 text-zinc-600 cursor-default";
          } else if (i === sel) cls = "border-indigo-500 bg-indigo-900/20 text-white cursor-pointer";
          return (
            <button key={i} onClick={() => pick(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm leading-relaxed transition-all ${cls}`}>{opt}</button>
          );
        })}
      </div>
      {revealed && (
        <div className="bg-zinc-900 border border-indigo-800/50 rounded-xl p-4">
          <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Why this works</p>
          <p className="text-sm text-zinc-300">{sc.explanation}</p>
        </div>
      )}
      {revealed && (
        <button onClick={next}
          className="w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg text-sm">
          {idx+1 >= NEGOTIATION_SCENARIOS.length ? "Restart →" : "Next →"}
        </button>
      )}
    </div>
  );
}

function BenchmarkLiteracy() {
  const [idx, setIdx] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState([]);
  const round = BENCHMARK_ROUNDS[idx];
  const verdicts = ["accurate", "misleading", "incomplete", "suspect", "context-dependent"];
  const verdictColors = { accurate: "#22c55e", misleading: "#ef4444", incomplete: "#f59e0b", suspect: "#f97316", "context-dependent": "#8b5cf6" };

  function pick(v) {
    if (revealed) return;
    setVerdict(v);
    setRevealed(true);
    setScores(s => [...s, v === round.verdict ? 1 : 0]);
  }
  function next() {
    if (idx + 1 >= BENCHMARK_ROUNDS.length) { setIdx(0); setScores([]); } else { setIdx(idx + 1); }
    setVerdict(null); setRevealed(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">{BENCHMARK_ROUNDS.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < scores.length ? (scores[i] ? "bg-green-500" : "bg-red-500") : i === idx ? "bg-indigo-500" : "bg-zinc-700"}`} />
        ))}</div>
        <span className="text-xs text-zinc-500">{scores.filter(Boolean).length}/{scores.length} correct</span>
      </div>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Someone claims:</p>
        <p className="text-white font-medium text-base italic leading-relaxed">{round.claim}</p>
        <p className="text-xs text-zinc-500 mt-3">How would you characterize this claim?</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {verdicts.map(v => {
          const c = verdictColors[v];
          let cls = "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500";
          if (revealed) {
            if (v === round.verdict) cls = "border-green-600 bg-green-900/20 text-green-300";
            else if (v === verdict) cls = "border-red-600 bg-red-900/20 text-red-400";
            else cls = "border-zinc-800 bg-zinc-900 text-zinc-600";
          } else if (v === verdict) cls = "text-white";
          return (
            <button key={v} onClick={() => pick(v)}
              className={`px-4 py-2.5 rounded-xl border font-bold text-sm capitalize transition-all ${cls}`}
              style={v === verdict && !revealed ? { borderColor: c, backgroundColor: c + "22" } : {}}>
              {v}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="bg-zinc-900 border border-indigo-800/50 rounded-xl p-4">
          <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">
            Verdict: <span style={{ color: verdictColors[round.verdict] }}>{round.verdict}</span>
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed">{round.explanation}</p>
        </div>
      )}
      {revealed && (
        <button onClick={next}
          className="w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg text-sm">
          {idx+1 >= BENCHMARK_ROUNDS.length ? "Restart →" : "Next →"}
        </button>
      )}
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
  { id: "negotiation", label: "Negotiation Cards",   tag: "PUSHBACK",  component: NegotiationFlashcards,
    objective: "Handle the 5 most common stakeholder pushbacks on AI features without caving or being dismissive.",
    howTo: ["Read what the stakeholder says — take it seriously, don't dismiss it", "Pick your response before revealing — commit to an answer", "The right response always: acknowledges the concern, reframes with data, and maintains momentum", "These scenarios are drawn from real AI project conversations"] },
  { id: "benchmarks",  label: "Benchmark Literacy",  tag: "SKEPTIC",   component: BenchmarkLiteracy,
    objective: "Stop being fooled by benchmark claims — learn to identify when a metric is misleading, incomplete, or suspect.",
    howTo: ["Read the claim as if a vendor or colleague just said it to you in a meeting", "Pick your verdict before revealing", "The goal isn't to be cynical — it's to ask the right follow-up questions", "After each round, memorize the failure mode — you'll see it again"] },
];

export default function CareerApp() {
  const [activeModule, setActiveModule] = useState("sysdesign");
  const mod = CAREER_MODULES.find(m => m.id === activeModule);
  const ActiveComponent = mod?.component || SystemDesignInterview;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Career Track</h1>
        <p className="text-sm text-zinc-400">System design, take-home challenges, stakeholder negotiation, benchmark skepticism</p>
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {CAREER_MODULES.map(m => (
          <button key={m.id} onClick={() => setActiveModule(m.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeModule === m.id ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${activeModule === m.id ? "bg-zinc-200 text-zinc-800" : "bg-zinc-700 text-zinc-400"}`}>{m.tag}</span>
            {m.label}
          </button>
        ))}
      </div>
      {mod?.objective && <HowTo objective={mod.objective} steps={mod.howTo} />}
      <ActiveComponent />
    </div>
  );
}
