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

// ─── NEGOTIATION SIMULATOR ────────────────────────────────────────────────────

const NEGOTIATION_SCENARIOS = [
  {
    id: "n1",
    title: "Initial Offer — Software Engineer",
    context: "You just received an offer for a Senior SWE role at a Series B AI startup. Base: $155k. Your current comp is $148k. You have a competing offer at $172k (but a worse team/mission). Recruiter says 'this is our standard band.'",
    turns: [
      {
        recruiterLine: "We're really excited to extend you an offer! Base salary of $155k, with equity and benefits. What do you think?",
        options: [
          { id: "a", text: "That sounds great, I accept!", outcome: "bad", feedback: "Never accept on the spot. You've left significant money on the table and signaled no market awareness. Even if you love the offer, ask for 48 hours to review and discuss with family." },
          { id: "b", text: "Thank you so much! I'm very excited. I do have a competing offer at $172k — is there flexibility to match or get closer?", outcome: "good", feedback: "Good — you expressed enthusiasm, mentioned the competing offer (real leverage), and asked an open question. Letting them name the counter keeps options open." },
          { id: "c", text: "I was expecting something in the $180k range based on my research.", outcome: "neutral", feedback: "Anchoring high is a valid tactic, but jumping straight to a number without expressing enthusiasm or mentioning your competing offer is weaker. Sequence matters: thank → express excitement → mention leverage → ask." },
          { id: "d", text: "I need more than that. I have a family to support.", outcome: "bad", feedback: "Personal circumstances are never negotiating leverage in compensation. Companies pay for market rate and your value, not your expenses. This weakens your position immediately." },
        ],
      },
      {
        recruiterLine: "We have some flexibility. We could go up to $163k on base. Does that work?",
        options: [
          { id: "a", text: "Yes, $163k works. I'll sign.", outcome: "neutral", feedback: "Better than the original, but you've shown your floor after only one counter. If they moved $8k easily, there may be more room. A single re-ask is usually fine: 'I appreciate that — could we get to $168k and I'm in?'" },
          { id: "b", text: "I appreciate the move. Could we get to $168k and I'm ready to sign today?", outcome: "good", feedback: "This is strong. You acknowledged the counter (respect), made a specific ask, and gave a closing condition ('ready to sign today'). The conditional close shows you're serious and creates urgency." },
          { id: "c", text: "That's still below my competing offer. I need at least $172k.", outcome: "neutral", feedback: "Mentioning the competing offer again is fine, but demanding a specific number without a conditional close is weaker. Try: 'Is there any path to $172k? If so, I could let the other offer go today.'" },
          { id: "d", text: "What about equity? Can we discuss increasing the equity grant instead?", outcome: "good", feedback: "Smart pivot — if base is near the ceiling, negotiating equity is high-EV at a Series B. RSU value depends on outcome but the upside is much larger than a $5k base difference at a growth-stage company." },
        ],
      },
      {
        recruiterLine: "We can do $168k. That's really our final number on base. I hope we can close this.",
        options: [
          { id: "a", text: "Great — I accept. Can we also confirm the equity grant and sign-on bonus in writing?", outcome: "good", feedback: "Perfect close. You accepted cleanly, moved forward, and asked for the full written offer including equity and sign-on. Always get everything in writing before giving final verbal acceptance." },
          { id: "b", text: "I need another week to decide.", outcome: "bad", feedback: "At this point you've negotiated three rounds and gotten meaningful movement. Asking for more time without reason will irritate the recruiter and signal you're not serious. Only ask for time if you have a specific reason." },
          { id: "c", text: "OK but I still think I'm worth more. Fine.", outcome: "bad", feedback: "Accepting while complaining is the worst outcome — you've signaled resentment before day one. If you accept, accept cleanly and enthusiastically. The negotiation is over." },
          { id: "d", text: "Understood. Let me also confirm: is there a sign-on bonus available to help bridge the gap?", outcome: "good", feedback: "Smart — sign-on bonuses often come from a different budget than base salary. When base is truly at ceiling, a one-time sign-on of $10-20k is often available. Good final ask before accepting." },
        ],
      },
    ],
    debrief: "Key principles: (1) Always express enthusiasm first — you're negotiating, not arguing. (2) Use competing offers as leverage, not ultimatums. (3) Give conditional closes ('if you can get to X, I'll sign today'). (4) Base, equity, and sign-on come from different budgets — when one is maxed, pivot to another. (5) Accept cleanly — resentment before day one damages the relationship.",
  },
  {
    id: "n2",
    title: "Promotion Conversation — AI Product Manager",
    context: "You're an ML Engineer who wants to move into an AI PM role. Your manager respects you but has never made this transition internally. You've been shipping a side project and building PM skills for 6 months.",
    turns: [
      {
        recruiterLine: "I wanted to touch base. How are you feeling about your role and trajectory here?",
        options: [
          { id: "a", text: "Honestly, I've been thinking I'd like to move into a PM role. I've been working on my skills for months.", outcome: "good", feedback: "Being direct in a 1:1 is right. You've put in the work — now you're asking. Don't bury the lede. Managers appreciate clarity about your goals." },
          { id: "b", text: "I'm good! Just working hard.", outcome: "bad", feedback: "This is a perfect opening to raise your goal. Not using it means you'll need to create another opening later — and your manager can't help you if they don't know what you want." },
          { id: "c", text: "I've been feeling a bit undervalued lately.", outcome: "neutral", feedback: "Leading with frustration before making your ask muddies the conversation. It sounds like a retention threat, not a career goal. Reframe: share what excites you about PM, not what frustrates you about your current role." },
          { id: "d", text: "I'd like to discuss my promotion timeline.", outcome: "neutral", feedback: "Reasonable, but asking about 'promotion timeline' before establishing what role you want is ambiguous. Be specific about which direction you want to grow." },
        ],
      },
      {
        recruiterLine: "That's interesting. I didn't know you were thinking about PM. What makes you want that transition?",
        options: [
          { id: "a", text: "I want more money and PMs seem to make more.", outcome: "bad", feedback: "Never lead with comp as your motivation. Even if true, it signals you'll leave for any higher offer and don't have a genuine interest in the work." },
          { id: "b", text: "I've loved the eng-facing parts of my work — scoping, roadmap discussions, talking to users. I want to do that full-time, and I think my technical depth gives me an edge as an AI PM specifically.", outcome: "good", feedback: "This is exactly right: specific skills you've enjoyed, your unique edge, and why this company specifically benefits. You're making the case for them, not just for yourself." },
          { id: "c", text: "I've been building PM skills on the side for 6 months and I think I'm ready.", outcome: "neutral", feedback: "Mentioning your work is good but 'I'm ready' without evidence is weak. Show the work: 'I've been running product reviews for X feature, wrote 3 PRDs, and got positive feedback from the PM team.'" },
          { id: "d", text: "PM work is more strategic and I want strategic work.", outcome: "neutral", feedback: "Generic. Every engineer who wants to be a PM says this. Make it specific to your situation, your company, and your skills." },
        ],
      },
      {
        recruiterLine: "I'm open to it, but I'll need to understand what this would look like concretely. We've never done this transition here.",
        options: [
          { id: "a", text: "I was thinking I could shadow the PM team for 2-3 months, then take on a small product area.", outcome: "good", feedback: "Proposing a concrete, low-risk transition plan is smart. You're asking for a try-before-you-commit, which removes risk for your manager. Come prepared with the specific PM you'd shadow and the specific project." },
          { id: "b", text: "I'd need a formal title change first before I can fully commit.", outcome: "bad", feedback: "You're asking the company to commit to you before you've demonstrated you can do the job. This is backwards. Show the work first, earn the title second." },
          { id: "c", text: "I could write a transition plan and bring it back next week.", outcome: "good", feedback: "Offering to own the proposal shows initiative and takes work off your manager's plate. This is the right move — come back with a specific 90-day plan, success metrics, and how you'd hand off your current work." },
          { id: "d", text: "Other companies would hire me as a PM given my background.", outcome: "bad", feedback: "Threatening to leave to get a promotion rarely works and always damages trust. If you'd prefer to interview externally, do that. Don't use it as a leverage threat in an internal conversation." },
        ],
      },
    ],
    debrief: "Internal transitions require a different playbook than offer negotiations. Key principles: (1) Be specific about what you want and why you're uniquely suited. (2) Reduce manager risk — propose a trial period before asking for a title change. (3) Show the work you've already done before the conversation. (4) Own the proposal — managers are busy. (5) Patience: internal transitions typically take 3-6 months of demonstrated performance.",
  },
  {
    id: "n3",
    title: "They Said Final — Now What?",
    context: "You're negotiating a senior ML engineer offer at a well-funded Series A (raised $30M, 80 employees). Offered $165k base + 0.3% options. You asked for $175k. The recruiter says: 'We've already gone above our standard band for you. This is genuinely our final offer.'",
    turns: [
      {
        recruiterLine: "I want to be transparent — we stretched for you. $165k is truly our ceiling for this role. I really hope we can make this work.",
        options: [
          { id: "a", text: "Ok, I understand. I'll sign.", outcome: "neutral", feedback: "Acceptable if $165k meets your needs — but you haven't tested whether 'final' is actually final, and you've left other levers unexplored. 'Final' on base doesn't mean final on total comp." },
          { id: "b", text: "I appreciate that. If base is the ceiling, can we look at the equity component? I'd love to understand the current 409A and whether there's flexibility on the options grant.", outcome: "good", feedback: "Excellent pivot. Base and equity come from different budgets. Asking about the 409A is a signal you understand equity — it often prompts more transparent conversation. A 0.1% increase at a $30M raise could be worth $30k+ at a 3× exit." },
          { id: "c", text: "I have a competing offer at $180k so I'll have to go with them unless you can match.", outcome: "neutral", feedback: "Using a competing offer here is valid leverage IF it's real. But using a fake competing offer is risky — recruiters sometimes call your bluff. If your competing offer is real, be specific: 'I have an offer at $180k base from [company]. Is there any way to close the gap?'" },
          { id: "d", text: "That's disappointing. I was hoping for more flexibility.", outcome: "bad", feedback: "Expressing disappointment without a counter-proposal ends the negotiation. You've signaled you're unhappy but given them nothing to work with. If you want to keep negotiating, make a specific ask." },
        ],
      },
      {
        recruiterLine: "The options are set by the board at 0.3% for this level. I really can't change that. What else can I do to help you say yes?",
        options: [
          { id: "a", text: "Is there a sign-on bonus available? That would help me bridge the gap on the base difference.", outcome: "good", feedback: "Sign-on bonuses come from a completely different budget than recurring comp and equity. Many companies have sign-on flexibility even when base and equity are locked. 'Bridge the gap on base difference' gives them a logical framing — you're asking for a one-time payment, not a permanent expense." },
          { id: "b", text: "Can I get an earlier performance review — say at 6 months instead of 12 — with a comp review attached?", outcome: "good", feedback: "An accelerated review cycle is a low-cost concession for the company that gives you a path to your number. If you perform well, you get the raise. If you don't, they've committed to nothing. Sophisticated negotiators use this when base is truly maxed." },
          { id: "c", text: "Can I work fully remote?", outcome: "neutral", feedback: "Remote work is a valid concession to negotiate, especially if it saves you commuting costs or improves quality of life. But it's not monetary — it doesn't close the comp gap you wanted. Fine as a secondary ask, weak as a primary counter." },
          { id: "d", text: "Fine, I accept.", outcome: "neutral", feedback: "Acceptable — you've negotiated in good faith and tested the limits. But you haven't asked about sign-on or timeline for review, which are often available. A quick 'one last ask: is there any sign-on flexibility?' costs you nothing and frequently yields $10–20k." },
        ],
      },
      {
        recruiterLine: "A sign-on bonus of $15k is something I can probably get approved. Does that work for you?",
        options: [
          { id: "a", text: "Yes — that works. Can we get the full offer in writing including the sign-on, equity terms, and vesting schedule?", outcome: "good", feedback: "Perfect close. You accepted positively, and immediately asked for the full written offer before giving verbal acceptance. Always get equity terms (cliff, vesting, strike price, shares outstanding) in writing. These details matter enormously for startup options and are sometimes 'clarified' unfavorably later." },
          { id: "b", text: "Can you make it $20k?", outcome: "neutral", feedback: "One more counter is defensible — you moved from $0 to $15k in one ask, there might be a few thousand more. But you've done well. Pushing for 33% more on a bonus after they've been generous on base may strain goodwill at a small company where you'll work with these people daily. Read the room." },
          { id: "c", text: "I need to think about it for a few days.", outcome: "bad", feedback: "You've been negotiating for several rounds. They've made a real concession. Asking for more time now — without a specific reason — signals either poor decision-making or that you're using this offer as leverage elsewhere. If you need time for a specific reason ('I need to discuss with my family'), say so. Otherwise, close." },
          { id: "d", text: "Great! I'm really excited to join the team.", outcome: "good", feedback: "Enthusiastic acceptance is also good — especially at a small company where relationship matters. Follow up with an email reiterating the agreed terms (base, sign-on, equity) so there's a written record before the formal offer letter." },
        ],
      },
    ],
    debrief: "When someone says 'final offer': (1) Test it by pivoting to a different lever — base, equity, sign-on, review timeline, remote work. 'Final' on base rarely means final on everything. (2) Sign-on bonuses are the most commonly available hidden lever — always ask. (3) Accelerated review cycles are a low-cost company concession with high personal upside. (4) If you genuinely can't improve the offer, close enthusiastically — resentment before day one poisons the relationship. (5) Get everything in writing before verbal acceptance, especially equity terms at startups.",
  },
];

function NegotiationSim() {
  const [scenarioId, setScenarioId] = useState("n1");
  const [turnIdx, setTurnIdx] = useState(0);
  const [choices, setChoices] = useState({});
  const [revealed, setRevealed] = useState({});
  const [showDebrief, setShowDebrief] = useState(false);

  const sc = NEGOTIATION_SCENARIOS.find(s => s.id === scenarioId);
  const turn = sc.turns[turnIdx];
  const thisTurnRevealed = revealed[turnIdx];
  const thisChoice = choices[turnIdx];
  const chosenOption = thisChoice ? turn.options.find(o => o.id === thisChoice) : null;
  const isLast = turnIdx === sc.turns.length - 1;

  function choose(optId) {
    if (thisTurnRevealed) return;
    setChoices(prev => ({ ...prev, [turnIdx]: optId }));
  }

  function revealTurn() {
    if (!thisChoice) return;
    setRevealed(prev => ({ ...prev, [turnIdx]: true }));
  }

  function nextTurn() {
    if (isLast) { setShowDebrief(true); return; }
    setTurnIdx(i => i + 1);
  }

  function reset(id) {
    setScenarioId(id);
    setTurnIdx(0);
    setChoices({});
    setRevealed({});
    setShowDebrief(false);
  }

  const outcomeColor = { good: "#22c55e", neutral: "#f59e0b", bad: "#ef4444" };
  const outcomeLabel = { good: "Strong move", neutral: "Acceptable", bad: "Avoid this" };

  const goodCount = Object.values(choices).filter(cId => {
    const turnNum = Object.keys(choices).find(k => choices[k] === cId);
    const t = sc.turns[Number(turnNum)];
    return t && t.options.find(o => o.id === cId)?.outcome === "good";
  }).length;

  if (showDebrief) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-5 space-y-3">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Negotiation Complete</div>
          <div className="text-lg font-black text-white">{goodCount}/{sc.turns.length} strong moves</div>
          <p className="text-xs text-zinc-400 leading-relaxed">{sc.debrief}</p>
        </div>
        <div className="space-y-3">
          {sc.turns.map((t, i) => {
            const c = t.options.find(o => o.id === choices[i]);
            return (
              <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-1">
                <div className="text-xs text-zinc-500">Turn {i + 1}</div>
                <div className="text-xs text-zinc-300 italic">"{t.recruiterLine.slice(0, 60)}..."</div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold mt-0.5" style={{ color: outcomeColor[c?.outcome || "neutral"] }}>
                    {outcomeLabel[c?.outcome || "neutral"]}:
                  </span>
                  <span className="text-xs text-zinc-400 leading-relaxed">{c?.feedback}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Equity math explainer */}
        <div className="rounded-xl border border-indigo-800/50 bg-indigo-950/20 p-4 space-y-3">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide">The equity math every engineer should know</div>
          <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
            <div>Equity offers feel abstract until you do the math. Here's how to compare offers with different equity components:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-3 space-y-2">
                <div className="text-indigo-300 font-semibold">RSUs at public company</div>
                <div className="text-zinc-400">400 RSUs @ $50/share = $20k/year at current price. Straightforward — you know the value. Risk is stock price movement.</div>
                <div className="text-zinc-500 text-[11px]">Typical grant: $100–500k over 4 years at senior IC levels</div>
              </div>
              <div className="rounded-lg bg-zinc-900 border border-zinc-700 p-3 space-y-2">
                <div className="text-amber-300 font-semibold">Options at startup</div>
                <div className="text-zinc-400">0.1% of a $10M-valued startup = $10k on paper. That same 0.1% at a $1B outcome = $1M. At zero = $0. The valuation and liquidation preference determine actual value.</div>
                <div className="text-zinc-500 text-[11px]">Most startup options expire 90 days after leaving. Factor in exercise cost and tax.</div>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-800/60 border border-zinc-700 p-3 space-y-2">
              <div className="text-zinc-300 font-semibold">Questions to ask about equity before accepting</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-zinc-400 text-[11px] mt-1">
                {["What is the current 409A valuation?", "What's the last round valuation and your % dilution?", "What is the liquidation preference stack?", "How many shares are fully diluted?", "What's the vesting cliff and schedule?", "What happens to my options if I leave before vesting?", "Has the company ever done a down-round or repricing?", "What's the expected exit timeline?"].map(q => (
                  <div key={q} className="flex gap-1.5"><span className="text-indigo-400 shrink-0">→</span>{q}</div>
                ))}
              </div>
            </div>
            <div className="text-zinc-500 text-[11px]">Resources: levels.fyi for RSU grant ranges by company/level. Blind for candid comp discussions. AngelList salary data for startups. Never rely on recruiter-provided comp percentile claims without independent verification.</div>
          </div>
        </div>
        <div className="flex gap-3">
          {NEGOTIATION_SCENARIOS.map(s => (
            <button key={s.id} onClick={() => reset(s.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${s.id === scenarioId ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {s.id === scenarioId ? "Retry" : s.title.split("—")[0].trim()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {NEGOTIATION_SCENARIOS.map(s => (
          <button key={s.id} onClick={() => reset(s.id)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${scenarioId === s.id ? "bg-rose-700 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {s.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 text-xs text-zinc-400 leading-relaxed">
        <span className="text-zinc-300 font-bold">Scenario: </span>{sc.context}
      </div>

      {/* Market research note */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/40 p-3 text-xs">
        <div className="text-zinc-400 font-semibold mb-1.5">Before you negotiate: know your market rate</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { source: "levels.fyi", what: "Verified TC at big tech by level & location" },
            { source: "Blind", what: "Anonymous peer comp — good for candid ranges" },
            { source: "Glassdoor", what: "Broad market, less reliable — use as floor" },
            { source: "LinkedIn Salary", what: "Good for non-eng roles at mid-market companies" },
          ].map(s => (
            <div key={s.source} className="rounded bg-zinc-900 border border-zinc-700 p-2">
              <div className="text-indigo-400 font-semibold text-[11px]">{s.source}</div>
              <div className="text-zinc-500 text-[11px] mt-0.5 leading-relaxed">{s.what}</div>
            </div>
          ))}
        </div>
        <div className="text-zinc-500 mt-2 text-[11px]">Know your number BEFORE the call. "I've done my research and the market rate for this role at this stage is $X–Y" is much stronger than "I was hoping for more."</div>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {sc.turns.map((_, i) => (
          <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${i < turnIdx ? "bg-emerald-900 text-emerald-300 border border-emerald-700" : i === turnIdx ? "bg-rose-700 text-white" : "bg-zinc-800 text-zinc-600"}`}>
            {i + 1}
          </div>
        ))}
        <span className="ml-1">Turn {turnIdx + 1} of {sc.turns.length}</span>
      </div>

      <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-4">
        <div className="text-xs text-rose-400 font-bold mb-1">RECRUITER / MANAGER</div>
        <p className="text-sm text-zinc-300 leading-relaxed italic">"{turn.recruiterLine}"</p>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-zinc-500 font-bold">Your response:</div>
        {turn.options.map(opt => {
          const selected = thisChoice === opt.id;
          const isRevealed = thisTurnRevealed && selected;
          let cls = "w-full text-left rounded-lg border p-3 text-xs leading-relaxed transition-all ";
          if (!thisTurnRevealed) {
            cls += selected ? "bg-zinc-700 border-zinc-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500 cursor-pointer";
          } else if (selected) {
            cls += opt.outcome === "good" ? "bg-emerald-900/40 border-emerald-700 text-emerald-200" : opt.outcome === "bad" ? "bg-red-900/40 border-red-700 text-red-200" : "bg-amber-900/40 border-amber-700 text-amber-200";
          } else {
            cls += "bg-zinc-900/30 border-zinc-800 text-zinc-600";
          }
          return (
            <button key={opt.id} onClick={() => choose(opt.id)} className={cls}>
              <div>{opt.text}</div>
              {isRevealed && (
                <div className="mt-2 pt-2 border-t border-zinc-700 space-y-1">
                  <div className="font-bold" style={{ color: outcomeColor[opt.outcome] }}>{outcomeLabel[opt.outcome]}</div>
                  <div className="text-zinc-400 leading-relaxed">{opt.feedback}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!thisTurnRevealed ? (
        <button onClick={revealTurn} disabled={!thisChoice}
          className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${thisChoice ? "bg-rose-700 hover:bg-rose-600 text-white" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}>
          See feedback
        </button>
      ) : (
        <button onClick={nextTurn} className="w-full py-2.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-bold transition-all">
          {isLast ? "See full debrief →" : "Next turn →"}
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
  { id: "negotiate", label: "Negotiation Sim", tag: "SIM", component: NegotiationSim,
    objective: "Practice real salary and promotion negotiation conversations — learn which moves build leverage and which ones destroy it.",
    howTo: ["Read the recruiter or manager line carefully — the subtext matters as much as the words", "Pick your response before revealing — commit to a choice", "After revealing, read the feedback even for options you didn't pick", "Track your strong moves across turns — the debrief shows your full pattern"] },
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
    <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
      <div className="w-12 h-12 rounded-xl bg-amber-900/40 border border-amber-800/50 flex items-center justify-center text-2xl">🚀</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Career Track</h1>
        <p className="text-sm text-zinc-400 max-w-sm">Interview prep and career tools for engineers targeting AI-forward roles.</p>
      </div>
      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-left space-y-3">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">What you'll do</p>
        {[
          ["System Design Interviews", "Walk through AI system design prompts the way top companies actually run them — component selection, trade-offs, must-haves vs. nice-to-haves."],
          ["Take-Home Challenges", "Rank LLM outputs, fix broken prompts, design an eval pipeline — the exact formats used by AI-forward companies."],
          ["Negotiation Flashcards", "Understand benchmark claims, spot marketing spin, and push back on misleading metrics in job negotiations."],
        ].map(([title, desc]) => (
          <div key={title} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
            <div><span className="text-xs font-bold text-white">{title} — </span><span className="text-xs text-zinc-400">{desc}</span></div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-600 font-mono">Best for: engineers targeting AI roles · ML engineers · anyone interviewing at AI companies</p>
      <button onClick={dismissWelcome} className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-all">
        Start Preparing →
      </button>
    </div>
  );

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
