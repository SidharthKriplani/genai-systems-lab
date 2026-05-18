import { useState, useMemo } from "react";

// ─── SCENARIO DATA ────────────────────────────────────────────────────────────

const SCENARIO = {
  scenario_id: "conflicting_documents",
  title: "Conflicting Policy Documents",
  description:
    "Two versions of the expense policy exist in the corpus. Old and new documents contradict each other. The retriever may surface either or both — your config determines whether the system fails safely or confidently gives wrong guidance.",
  user_query: "Can employees expense meals while working remotely?",
  corpus_description:
    "HR knowledge base: ExpensePolicy_2021.pdf (meals not reimbursable remotely) vs. ExpensePolicy_2024.pdf (₹1,800/day permitted remotely).",
  failure_mode_taught: "Stale document retrieval + silent conflict resolution",
  challenge: {
    requirement:
      "Design a RAG config for a compliance assistant. Requirements: groundedness ≥ 85%, citation accuracy ≥ 90%, risk level must be 'low', and conflicting documents must be surfaced — never silently resolved.",
    passing_criteria: {
      groundedness: 0.85,
      citation_accuracy: 0.90,
      allowed_risk_levels: ["low"],
      require_conflict_flagged: true,
    },
  },
  recommended_configs: [
    { chunk_size: "medium", top_k: 3, reranker: true, answer_policy: "strictly_grounded" },
  ],
  default_config: {
    chunk_size: "large", top_k: 1, reranker: false, answer_policy: "helpful",
  },
  configs: [
    {
      id: "cfg_1",
      chunk_size: "large", top_k: 1, reranker: false, answer_policy: "helpful",
      label: "Bad baseline",
      retrieved_chunks: [
        { id: "c1", text: "Remote employees are not eligible to expense meals under current company policy. This applies to all remote and hybrid work arrangements.", source: "ExpensePolicy_2021.pdf", date: "2021-03-01", relevance_score: 0.81, label: "stale" },
      ],
      answer: "No, employees cannot expense meals while working remotely. This applies to all remote and hybrid arrangements per company policy.",
      metrics: { groundedness: 0.61, citation_accuracy: 0.38, completeness: 0.55, latency_ms: 380, cost_per_1k_queries_usd: 0.07, risk_level: "critical", conflict_flagged: false },
      failure_mode: "stale_document_retrieval",
      failure_explanation: "top_k=1 retrieved only the 2021 policy — semantically similar, but 3 years out of date. With 'helpful' answer policy, the model answered confidently without checking freshness. The answer is factually wrong under current policy. An employee following this guidance will be denied reimbursement for legitimate expenses.",
      suggested_fix: "Increase top_k to 3+ to surface competing documents. Add metadata freshness filter. Switch to 'strictly grounded' policy which requires citation of document date.",
      system_design_lesson: "Low top-k with no reranker creates single-point-of-failure retrieval. In any corpus with versioned documents (policies, legal docs, product specs), freshness metadata is a correctness requirement, not an optimisation. A high relevance score on a stale document is worse than a missed retrieval — it produces confident wrong answers.",
    },
    {
      id: "cfg_2",
      chunk_size: "small", top_k: 1, reranker: false, answer_policy: "helpful",
      label: "Cheap but unsafe",
      retrieved_chunks: [
        { id: "c2", text: "Meals are not reimbursable for remote employees.", source: "ExpensePolicy_2021.pdf", date: "2021-03-01", relevance_score: 0.76, label: "stale" },
      ],
      answer: "No, meals are not reimbursable for remote employees.",
      metrics: { groundedness: 0.58, citation_accuracy: 0.31, completeness: 0.42, latency_ms: 240, cost_per_1k_queries_usd: 0.04, risk_level: "critical", conflict_flagged: false },
      failure_mode: "stale_document_retrieval",
      failure_explanation: "Cheapest possible config: smallest chunks, top_k=1, no reranker, helpful policy. Cost is minimal but the answer is wrong and overconfident. Small chunks lose surrounding context (the policy header with the date), making staleness invisible to the model.",
      suggested_fix: "Never use top_k=1 in versioned document corpora. Even improving to top_k=3 dramatically reduces stale-retrieval risk.",
      system_design_lesson: "Cost optimisation at the retrieval layer is often a false economy in compliance contexts. The cost of one wrong policy answer (employee dispute, HR escalation, legal risk) dwarfs the token savings from reducing top_k.",
    },
    {
      id: "cfg_3",
      chunk_size: "small", top_k: 5, reranker: false, answer_policy: "helpful",
      label: "High recall, noisy",
      retrieved_chunks: [
        { id: "c3a", text: "Effective January 2024, remote employees may expense up to ₹1,800/day for meals while working remotely.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.89, label: "correct" },
        { id: "c3b", text: "Remote employees are not eligible to expense meals under current company policy.", source: "ExpensePolicy_2021.pdf", date: "2021-03-01", relevance_score: 0.81, label: "stale" },
        { id: "c3c", text: "Q: Are snacks expensable during remote work? A: Light refreshments under ₹500 may be claimed under the office supplies category.", source: "ExpensePolicy_FAQ_2022.pdf", date: "2022-06-01", relevance_score: 0.63, label: "irrelevant" },
        { id: "c3d", text: "Meal expenses during business travel are reimbursed up to ₹3,500/day with receipts.", source: "TravelPolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.58, label: "irrelevant" },
        { id: "c3e", text: "Claims must be submitted within 30 days. Receipts required for amounts above ₹500.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.51, label: "partial" },
      ],
      answer: "Yes, as of January 2024 you can expense up to ₹1,800/day for meals while working remotely. Receipts are required for amounts above ₹500 and claims must be submitted within 30 days.",
      metrics: { groundedness: 0.77, citation_accuracy: 0.69, completeness: 0.88, latency_ms: 820, cost_per_1k_queries_usd: 0.17, risk_level: "high", conflict_flagged: false },
      failure_mode: "conflict_not_flagged",
      failure_explanation: "High top_k surfaces the correct 2024 policy first. The answer is right. But the conflicting 2021 document was also retrieved and silently ignored. No reranker means noisy context (travel policy, FAQ chunks) diluted confidence. The helpful policy resolved the conflict probabilistically — without an audit trail of why the 2021 document was discarded. This is the most insidious failure mode: it looks correct in testing.",
      suggested_fix: "Add a post-retrieval conflict detection step. When two retrieved chunks contradict each other, surface the conflict explicitly. Enable reranker to reduce context noise.",
      system_design_lesson: "The right answer given for the wrong reason is not a safe system — it is a lucky system. Compliance systems need explainable resolution, not probabilistic resolution. Higher top_k improves recall but makes conflict detection harder without a structured post-retrieval layer.",
    },
    {
      id: "cfg_4",
      chunk_size: "medium", top_k: 3, reranker: true, answer_policy: "helpful",
      label: "Good retrieval, wrong policy",
      retrieved_chunks: [
        { id: "c4a", text: "Effective January 2024, remote employees may expense up to ₹1,800/day for meals while working remotely.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.93, label: "correct" },
        { id: "c4b", text: "Remote employees are not eligible to expense meals under current company policy.", source: "ExpensePolicy_2021.pdf", date: "2021-03-01", relevance_score: 0.81, label: "stale" },
        { id: "c4c", text: "Claims must be submitted within 30 days. Receipts required for amounts above ₹500.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.74, label: "partial" },
      ],
      answer: "Yes, as of January 2024 you can expense meals up to ₹1,800/day while working remotely. Submit claims within 30 days with receipts for amounts over ₹500.",
      metrics: { groundedness: 0.88, citation_accuracy: 0.82, completeness: 0.91, latency_ms: 650, cost_per_1k_queries_usd: 0.13, risk_level: "medium", conflict_flagged: false },
      failure_mode: "conflict_not_flagged",
      failure_explanation: "The reranker correctly prioritised the 2024 policy and the answer is factually right. But the conflicting 2021 document was still in context and silently dismissed. The helpful policy resolved the conflict probabilistically — the model 'chose' the newer document without being instructed to. This is the most dangerous config: it passes most evals but is ungovernable in production.",
      suggested_fix: "Switch to 'strictly grounded' answer policy. This forces the system to surface the conflict and cite which document it is relying on, making the resolution auditable.",
      system_design_lesson: "This config passes most standard evals. Groundedness 0.88, completeness 0.91, acceptable latency. But it fails the governance test. Every answer must be traceable to a specific document version. A system that gets the right answer for probabilistic reasons will eventually get the wrong answer with the same confidence.",
    },
    {
      id: "cfg_5",
      chunk_size: "medium", top_k: 3, reranker: true, answer_policy: "strictly_grounded",
      label: "Correct + governed",
      retrieved_chunks: [
        { id: "c5a", text: "Effective January 2024, remote employees may expense up to ₹1,800/day for meals while working remotely.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.93, label: "correct" },
        { id: "c5b", text: "Remote employees are not eligible to expense meals under current company policy.", source: "ExpensePolicy_2021.pdf", date: "2021-03-01", relevance_score: 0.81, label: "stale" },
        { id: "c5c", text: "Claims must be submitted within 30 days. Receipts required for amounts above ₹500.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.74, label: "partial" },
      ],
      answer: "⚠️ Conflicting documents detected.\n\nExpensePolicy_2024.pdf (Jan 2024) permits up to ₹1,800/day for remote meal expenses.\n\nExpensePolicy_2021.pdf states meals are not reimbursable for remote employees.\n\nThe 2024 document appears to be current policy. Verify with HR before acting on this. Reference: ExpensePolicy_2024.pdf, Section 3.2.",
      metrics: { groundedness: 0.97, citation_accuracy: 0.96, completeness: 0.79, latency_ms: 670, cost_per_1k_queries_usd: 0.13, risk_level: "low", conflict_flagged: true },
      failure_mode: null,
      failure_explanation: "No failure. The reranker surfaced the correct 2024 policy first. The strictly grounded policy detected the conflicting 2021 document, flagged both explicitly, and directed the user to HR for verification. Completeness is 0.79 — the system gave no definitive yes/no. That is correct behaviour for compliance.",
      suggested_fix: "None required. Optional: add a human-review queue trigger for all conflict-flagged queries.",
      system_design_lesson: "Completeness and safety are in direct tension for compliance systems. A 0.79 completeness score with a conflict flag is safer than a 0.91 score with a silent wrong answer. Your choice of metrics reflects your system's values. Know which failure mode is more costly in your domain.",
    },
    {
      id: "cfg_6",
      chunk_size: "small", top_k: 5, reranker: true, answer_policy: "abstain_when_unsure",
      label: "Too cautious",
      retrieved_chunks: [
        { id: "c6a", text: "Effective January 2024, remote employees may expense up to ₹1,800/day for meals while working remotely.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.93, label: "correct" },
        { id: "c6b", text: "Remote employees are not eligible to expense meals under current company policy.", source: "ExpensePolicy_2021.pdf", date: "2021-03-01", relevance_score: 0.81, label: "stale" },
      ],
      answer: "I found conflicting information and cannot provide a reliable answer. Please consult your HR portal or contact your HR business partner directly for the current meal expense policy.",
      metrics: { groundedness: 0.99, citation_accuracy: 0.98, completeness: 0.21, latency_ms: 890, cost_per_1k_queries_usd: 0.18, risk_level: "low", conflict_flagged: true },
      failure_mode: "over_abstention",
      failure_explanation: "Groundedness and citation accuracy are near-perfect, risk is low, conflict is flagged — but completeness is 0.21. The system abstained entirely despite having the correct answer available. For a high-volume HR assistant, this generates excessive 'please contact HR' responses for resolvable queries, defeating the purpose of the system.",
      suggested_fix: "Use 'strictly grounded' instead of 'abstain when unsure'. Strictly grounded surfaces the conflict while still providing the best available answer with caveats. Reserve abstention only for truly unanswerable queries.",
      system_design_lesson: "Over-abstention is a failure mode too. A system that refuses anything uncertain pushes all load to human reviewers and erodes user trust. Distinguish between 'I don't have enough information' (abstain) and 'I have conflicting information' (surface and flag). These require different system behaviours.",
    },
    {
      id: "cfg_7",
      chunk_size: "medium", top_k: 5, reranker: true, answer_policy: "strictly_grounded",
      label: "Safe and thorough",
      retrieved_chunks: [
        { id: "c7a", text: "Effective January 2024, remote employees may expense up to ₹1,800/day for meals while working remotely.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.93, label: "correct" },
        { id: "c7b", text: "Remote employees are not eligible to expense meals under current company policy.", source: "ExpensePolicy_2021.pdf", date: "2021-03-01", relevance_score: 0.81, label: "stale" },
        { id: "c7c", text: "Claims must be submitted within 30 days. Receipts required for amounts above ₹500.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.74, label: "partial" },
        { id: "c7d", text: "The updated expense policy supersedes all prior versions. Employees should discard printed copies of policies dated before 2024.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.67, label: "correct" },
      ],
      answer: "⚠️ Note: An older policy (2021) contradicts this, but has been superseded.\n\nPer current policy (ExpensePolicy_2024.pdf): Yes, remote employees may expense up to ₹1,800/day for meals. Submit claims within 30 days. Receipts required for amounts above ₹500.\n\nThe 2024 policy explicitly supersedes all prior versions.\n\nSource: ExpensePolicy_2024.pdf, Sections 3.2 and 3.4.",
      metrics: { groundedness: 0.96, citation_accuracy: 0.94, completeness: 0.93, latency_ms: 810, cost_per_1k_queries_usd: 0.16, risk_level: "low", conflict_flagged: true },
      failure_mode: null,
      failure_explanation: "Near-optimal. High top_k surfaced the supersession clause which explicitly resolves the conflict. Strictly grounded policy flagged the 2021 contradiction while providing a complete, actionable answer. Cost is slightly higher than cfg_5 but completeness improves from 0.79 to 0.93.",
      suggested_fix: "None. This is the target configuration for this scenario.",
      system_design_lesson: "Sometimes the correct resolution to a conflict is already in the corpus — in a supersession clause or 'this replaces' statement. Higher top_k can surface it. Retrieval depth is a quality dial, not just a cost dial. The right trade-off depends on whether your corpus contains self-resolving conflicts.",
    },
    {
      id: "cfg_8",
      chunk_size: "large", top_k: 3, reranker: false, answer_policy: "strictly_grounded",
      label: "Large chunks, no reranker",
      retrieved_chunks: [
        { id: "c8a", text: "Section 3 – Remote Work Expenses. Effective January 2024, the company updated its remote work expense policy. Remote employees are now eligible to expense meals up to ₹1,800 per day. Prior policies stated meals were not reimbursable; this policy supersedes those provisions.", source: "ExpensePolicy_2024.pdf", date: "2024-01-15", relevance_score: 0.87, label: "correct" },
        { id: "c8b", text: "Section 4 – Employee Expenses. Meals: Not reimbursable for remote or hybrid employees. Business meals with clients are covered under the Entertainment policy. Travel meals during approved business travel: up to ₹3,500/day.", source: "ExpensePolicy_2021.pdf", date: "2021-03-01", relevance_score: 0.79, label: "stale" },
      ],
      answer: "⚠️ Conflicting policy documents found.\n\nExpensePolicy_2024.pdf states remote meal expenses up to ₹1,800/day are permitted and that this supersedes prior policies.\n\nExpensePolicy_2021.pdf states meals are not reimbursable remotely.\n\nPlease verify with HR. The 2024 document appears current based on its supersession clause.",
      metrics: { groundedness: 0.91, citation_accuracy: 0.88, completeness: 0.82, latency_ms: 590, cost_per_1k_queries_usd: 0.14, risk_level: "low", conflict_flagged: true },
      failure_mode: null,
      failure_explanation: "Large chunks capture more context per document (including the supersession clause), partially compensating for the lack of a reranker. Strictly grounded policy flags the conflict. Citation accuracy is slightly lower (0.88) because large chunks are harder to pin to specific locations. Narrowly fails the challenge threshold on citation accuracy.",
      suggested_fix: "Enable reranker to push citation accuracy above 0.90 for the challenge threshold. Without it, this config narrowly misses the challenge criteria.",
      system_design_lesson: "Chunk size and reranker interact. Large chunks surface more context (good) but reduce citation precision (bad). Small chunks increase citation precision but may cut off critical context like supersession clauses. Medium chunks + reranker is the standard production choice, but large chunks without a reranker is a viable cost trade-off when citation precision requirements are moderate.",
    },
  ],
};

// ─── LOOKUP ───────────────────────────────────────────────────────────────────

function lookupResult(config) {
  const match = SCENARIO.configs.find(
    (c) =>
      c.chunk_size === config.chunk_size &&
      c.top_k === config.top_k &&
      c.reranker === config.reranker &&
      c.answer_policy === config.answer_policy
  );
  if (match) return { result: match, curated: true };
  const partial = SCENARIO.configs.find(
    (c) => c.chunk_size === config.chunk_size && c.top_k === config.top_k
  );
  if (partial)
    return {
      result: partial,
      curated: false,
      fallback_note: "Exact configuration not curated. Showing closest match.",
    };
  return {
    result: null,
    curated: false,
    fallback_note: "This configuration is not part of the curated scenario yet. Try a highlighted config.",
  };
}

function gradeChallenge(result) {
  const crit = SCENARIO.challenge.passing_criteria;
  const m = result.metrics;
  const checks = [
    { label: "Groundedness ≥ 85%", passed: m.groundedness >= crit.groundedness, actual: pct(m.groundedness), required: "85%" },
    { label: "Citation accuracy ≥ 90%", passed: m.citation_accuracy >= crit.citation_accuracy, actual: pct(m.citation_accuracy), required: "90%" },
    { label: "Risk level: low", passed: crit.allowed_risk_levels.includes(m.risk_level), actual: m.risk_level, required: "low" },
    { label: "Conflict flagged", passed: m.conflict_flagged === true, actual: m.conflict_flagged ? "Yes" : "No", required: "Yes" },
  ];
  return { passed: checks.every((c) => c.passed), checks };
}

function pct(v) { return (v * 100).toFixed(0) + "%"; }

// ─── STYLES / CONSTANTS ───────────────────────────────────────────────────────

const CHUNK_LABEL_COLORS = {
  correct:    { bg: "bg-emerald-950", border: "border-emerald-500", text: "text-emerald-400", badge: "bg-emerald-900 text-emerald-300" },
  stale:      { bg: "bg-amber-950",   border: "border-amber-500",   text: "text-amber-400",   badge: "bg-amber-900 text-amber-300" },
  irrelevant: { bg: "bg-zinc-900",    border: "border-zinc-600",    text: "text-zinc-400",     badge: "bg-zinc-800 text-zinc-400" },
  malicious:  { bg: "bg-red-950",     border: "border-red-500",     text: "text-red-400",      badge: "bg-red-900 text-red-300" },
  partial:    { bg: "bg-sky-950",     border: "border-sky-600",     text: "text-sky-400",      badge: "bg-sky-900 text-sky-300" },
};

const RISK_COLORS = {
  low:      "text-emerald-400 bg-emerald-950 border-emerald-700",
  medium:   "text-amber-400 bg-amber-950 border-amber-700",
  high:     "text-orange-400 bg-orange-950 border-orange-700",
  critical: "text-red-400 bg-red-950 border-red-700",
};

const METRIC_BAR_COLOR = (v, high = false) => {
  if (high) return v > 800 ? "bg-amber-500" : "bg-emerald-500";
  if (v >= 0.9) return "bg-emerald-500";
  if (v >= 0.75) return "bg-amber-500";
  return "bg-red-500";
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${value ? "bg-violet-600" : "bg-zinc-700"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function Pill({ options, value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value ?? o}
          onClick={() => onChange(o.value ?? o)}
          className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
            (o.value ?? o) === value
              ? "bg-violet-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          }`}
        >
          {o.label ?? o}
        </button>
      ))}
    </div>
  );
}

function MetricBar({ label, value, max = 1, isMs = false, isCost = false }) {
  const pct = isMs ? Math.min((value / 2000) * 100, 100) : Math.min((value / max) * 100, 100);
  const color = isMs || isCost ? METRIC_BAR_COLOR(value, true) : METRIC_BAR_COLOR(value);
  const display = isMs ? value + "ms" : isCost ? "$" + value.toFixed(3) : (value * 100).toFixed(0) + "%";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-white">{display}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: pct + "%" }}
        />
      </div>
    </div>
  );
}

function ChunkCard({ chunk, index }) {
  const c = CHUNK_LABEL_COLORS[chunk.label] || CHUNK_LABEL_COLORS.partial;
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3 space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-mono text-zinc-500">#{index + 1}</span>
        <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide ${c.badge}`}>
          {chunk.label}
        </span>
      </div>
      <p className={`text-sm leading-relaxed ${c.text}`}>{chunk.text}</p>
      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>{chunk.source}</span>
        <span>{chunk.date} · score: {chunk.relevance_score.toFixed(2)}</span>
      </div>
    </div>
  );
}

function ChallengeResult({ grade }) {
  if (!grade) return null;
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${grade.passed ? "border-emerald-600 bg-emerald-950/50" : "border-red-700 bg-red-950/30"}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{grade.passed ? "✓" : "✗"}</span>
        <span className={`font-bold text-sm tracking-wide ${grade.passed ? "text-emerald-300" : "text-red-300"}`}>
          {grade.passed ? "CHALLENGE PASSED" : "CHALLENGE FAILED"}
        </span>
      </div>
      <div className="space-y-1.5">
        {grade.checks.map((ch, i) => (
          <div key={i} className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className={ch.passed ? "text-emerald-400" : "text-red-400"}>{ch.passed ? "✓" : "✗"}</span>
              <span className="text-zinc-300">{ch.label}</span>
            </span>
            <span className={ch.passed ? "text-emerald-400" : "text-red-400"}>{ch.actual}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [config, setConfig] = useState(SCENARIO.default_config);
  const [evaluated, setEvaluated] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [gradeResult, setGradeResult] = useState(null);
  const [activeTab, setActiveTab] = useState("simulator"); // "simulator" | "notes"
  const [notesSection, setNotesSection] = useState(0);

  const lookup = useMemo(() => lookupResult(config), [config]);

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setEvaluated(false);
    setGradeResult(null);
  };

  const evaluate = () => {
    setEvaluated(true);
    if (challengeMode && lookup?.result) {
      setGradeResult(gradeChallenge(lookup.result));
    }
  };

  const reset = () => {
    setConfig(SCENARIO.default_config);
    setEvaluated(false);
    setGradeResult(null);
  };

  const isRecommended = useMemo(
    () =>
      SCENARIO.recommended_configs.some(
        (rc) =>
          rc.chunk_size === config.chunk_size &&
          rc.top_k === config.top_k &&
          rc.reranker === config.reranker &&
          rc.answer_policy === config.answer_policy
      ),
    [config]
  );

  const result = lookup?.result;
  const hasFallback = lookup && !lookup.curated;

  const notesSections = [
    {
      title: "What happened",
      content: result
        ? result.failure_mode
          ? `This configuration triggers the "${result.failure_mode.replace(/_/g, " ")}" failure mode. ${result.failure_explanation}`
          : "This configuration produces no critical failure. " + result.failure_explanation
        : "Select and evaluate a configuration to see the analysis.",
    },
    {
      title: "Why it happens in production",
      content:
        "Stale document retrieval is one of the most common and dangerous RAG failures in enterprise deployments. Most teams discover it in production, not testing — because test datasets rarely include conflicting document versions. The retriever has no inherent concept of 'current'; it optimises for semantic similarity, not temporal validity. A document from 2021 that perfectly matches the query semantics will outscore a 2024 document that also matches but was indexed later. Without explicit freshness metadata in the retrieval layer, the system will always be vulnerable to this class of failure.",
    },
    {
      title: "How teams monitor it",
      content:
        "Production teams typically monitor for this via: (1) document version drift alerts — triggered when a chunk's source document date is > N months behind the most recent version in the corpus; (2) citation staleness metrics — logging the date of every cited document and alerting when the median citation age exceeds a threshold; (3) answer divergence monitoring — comparing answers for high-frequency queries over time to detect when a retrieval update causes answer drift; (4) human-in-the-loop review queues for queries where two or more retrieved chunks contradict each other, flagged automatically by a post-retrieval conflict detector.",
    },
    {
      title: "How teams mitigate it",
      content:
        "Common mitigations in order of effectiveness: (1) Metadata freshness filter — add a date-based hard filter or soft penalty to the retrieval score; most vector DBs support metadata filtering at query time. (2) Document versioning in the index — store document version as a metadata field and filter to the latest version per document family. (3) Strictly grounded answer policy — prompt the model to always cite the source document date, and to surface conflicting documents rather than resolve them silently. (4) Post-retrieval conflict detection — a lightweight classifier or LLM call that detects semantic contradiction across retrieved chunks before the generation step. (5) Corpus hygiene automation — automated pipeline to deprecate outdated document versions when a new version is indexed.",
    },
    {
      title: "What trade-off the mitigation introduces",
      content:
        "Each mitigation has a cost. Freshness filters reduce recall — they may exclude historically relevant documents for queries where older versions are legitimately needed. Strictly grounded policy reduces completeness and may increase user-perceived friction (the 'please verify with HR' response is safe but annoying). Post-retrieval conflict detection adds latency and cost — typically 100–300ms and one additional LLM call per query. Corpus hygiene automation requires operational investment and breaks down when document versioning is inconsistent. The correct choice depends entirely on your domain: in medical or legal contexts, false confidence is far more costly than over-abstention. In a general-purpose assistant, the reverse may be true.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans" style={{ fontFamily: "'IBM Plex Mono', 'Fira Code', monospace" }}>
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center text-xs font-bold">G</div>
            <div>
              <div className="text-sm font-bold tracking-wider text-white">GENAI SYSTEMS LAB</div>
              <div className="text-xs text-zinc-500">RAG Failure Simulator · V1-A</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {["simulator", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded text-xs font-bold tracking-wide transition-all uppercase ${
                  activeTab === tab ? "bg-violet-600 text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                {tab === "simulator" ? "Simulator" : "Design Notes"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === "simulator" ? (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Scenario header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2 py-0.5 bg-violet-900 text-violet-300 rounded border border-violet-700">RAG FAILURE #1</span>
                <span className="text-xs text-zinc-500">conflicting_documents</span>
              </div>
              <h1 className="text-xl font-bold text-white">{SCENARIO.title}</h1>
              <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{SCENARIO.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-zinc-500">Challenge mode</span>
              <Toggle value={challengeMode} onChange={(v) => { setChallengeMode(v); setEvaluated(false); setGradeResult(null); }} />
            </div>
          </div>

          {challengeMode && (
            <div className="mb-5 rounded-xl border border-violet-700 bg-violet-950/40 p-4">
              <div className="text-xs font-bold text-violet-300 mb-1 uppercase tracking-wide">Challenge</div>
              <p className="text-sm text-zinc-300">{SCENARIO.challenge.requirement}</p>
            </div>
          )}

          <div className="grid grid-cols-12 gap-4">
            {/* LEFT: Controls */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">System Config</span>
                  <button onClick={reset} className="text-xs text-zinc-500 hover:text-white transition-colors">reset</button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Chunk size</label>
                  <Pill
                    options={["small", "medium", "large"]}
                    value={config.chunk_size}
                    onChange={(v) => updateConfig("chunk_size", v)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Top-k</label>
                  <Pill
                    options={[{ label: "1", value: 1 }, { label: "3", value: 3 }, { label: "5", value: 5 }]}
                    value={config.top_k}
                    onChange={(v) => updateConfig("top_k", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">Reranker</div>
                    <div className="text-xs text-zinc-600 mt-0.5">{config.reranker ? "on" : "off"}</div>
                  </div>
                  <Toggle value={config.reranker} onChange={(v) => updateConfig("reranker", v)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Answer policy</label>
                  <Pill
                    options={[
                      { label: "helpful", value: "helpful" },
                      { label: "grounded", value: "strictly_grounded" },
                      { label: "abstain", value: "abstain_when_unsure" },
                    ]}
                    value={config.answer_policy}
                    onChange={(v) => updateConfig("answer_policy", v)}
                  />
                </div>

                {isRecommended && (
                  <div className="text-xs text-emerald-400 bg-emerald-950 border border-emerald-800 rounded p-2">
                    ✓ Recommended config for this scenario
                  </div>
                )}

                {hasFallback && (
                  <div className="text-xs text-amber-400 bg-amber-950 border border-amber-800 rounded p-2">
                    ⚠ {lookup.fallback_note}
                  </div>
                )}

                <button
                  onClick={evaluate}
                  className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold tracking-wide transition-all uppercase"
                >
                  Evaluate Configuration
                </button>
              </div>

              {/* Corpus info */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2">Corpus</div>
                <p className="text-xs text-zinc-400 leading-relaxed">{SCENARIO.corpus_description}</p>
              </div>
            </div>

            {/* CENTER: Query + Evidence + Answer */}
            <div className="col-span-12 lg:col-span-5 space-y-4">
              {/* Query */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">User Query</div>
                <p className="text-white font-semibold text-sm">{SCENARIO.user_query}</p>
              </div>

              {/* Retrieved evidence */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <div className="text-xs text-zinc-500 uppercase tracking-wide">Retrieved Evidence</div>
                {result ? (
                  result.retrieved_chunks.length > 0 ? (
                    result.retrieved_chunks.map((chunk, i) => (
                      <ChunkCard key={chunk.id} chunk={chunk} index={i} />
                    ))
                  ) : (
                    <p className="text-xs text-zinc-600">No chunks retrieved.</p>
                  )
                ) : (
                  <p className="text-xs text-zinc-600">Select a config to see retrieved chunks.</p>
                )}
              </div>

              {/* Answer */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">Generated Answer</div>
                  {result && (
                    <span className={`text-xs px-2 py-0.5 rounded border font-mono font-bold uppercase ${RISK_COLORS[result.metrics.risk_level]}`}>
                      {result.metrics.risk_level} risk
                    </span>
                  )}
                </div>
                {result ? (
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{result.answer}</p>
                ) : (
                  <p className="text-xs text-zinc-600">Configure system to see the answer.</p>
                )}
              </div>
            </div>

            {/* RIGHT: Metrics + Diagnosis */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* Metrics */}
              {result && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">Metrics</div>
                  <MetricBar label="Groundedness" value={result.metrics.groundedness} />
                  <MetricBar label="Citation accuracy" value={result.metrics.citation_accuracy} />
                  <MetricBar label="Completeness" value={result.metrics.completeness} />
                  <MetricBar label="Latency" value={result.metrics.latency_ms} max={2000} isMs />
                  <MetricBar label="Cost / 1k queries" value={result.metrics.cost_per_1k_queries_usd} max={0.25} isCost />
                  <div className="pt-1 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Conflict flagged</span>
                    <span className={result.metrics.conflict_flagged ? "text-emerald-400" : "text-red-400"}>
                      {result.metrics.conflict_flagged ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              )}

              {/* Evaluation results — hidden until evaluated */}
              {result && !evaluated && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
                  <p className="text-xs text-zinc-500">Click <span className="text-violet-400">Evaluate Configuration</span> to see the diagnosis, failure analysis, and system design lesson.</p>
                </div>
              )}

              {result && evaluated && (
                <>
                  {/* Challenge result */}
                  {challengeMode && gradeResult && (
                    <ChallengeResult grade={gradeResult} />
                  )}

                  {/* Failure mode */}
                  {result.failure_mode ? (
                    <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Failure Mode</span>
                        <span className="text-xs font-mono bg-red-900 text-red-300 px-2 py-0.5 rounded">{result.failure_mode.replace(/_/g, "_")}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{result.failure_explanation}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-4 space-y-2">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">No Critical Failure</div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{result.failure_explanation}</p>
                    </div>
                  )}

                  {/* Suggested fix */}
                  {result.suggested_fix && (
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 space-y-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Suggested Fix</div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{result.suggested_fix}</p>
                    </div>
                  )}

                  {/* System design lesson */}
                  <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-4 space-y-2">
                    <div className="text-xs font-bold text-violet-400 uppercase tracking-wide">System Design Lesson</div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{result.system_design_lesson}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* DESIGN NOTES TAB */
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6">
            <span className="text-xs font-mono px-2 py-0.5 bg-violet-900 text-violet-300 rounded border border-violet-700">DESIGN NOTES</span>
            <h2 className="text-xl font-bold mt-2">RAG Failure Mode: Conflicting Documents</h2>
            <p className="text-sm text-zinc-400 mt-1">What this failure is, why it happens, how production teams handle it.</p>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {notesSections.map((s, i) => (
              <button
                key={i}
                onClick={() => setNotesSection(i)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                  notesSection === i ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {i + 1}. {s.title}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">{notesSections[notesSection].title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{notesSections[notesSection].content}</p>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">Failure modes in this scenario</div>
            <div className="space-y-2">
              {[
                { name: "stale_document_retrieval", desc: "Low top-k + no freshness filter retrieves outdated document. Confident wrong answer." },
                { name: "conflict_not_flagged", desc: "Correct document retrieved but conflicting document silently ignored. No audit trail." },
                { name: "over_abstention", desc: "System refuses to answer despite having the correct answer available." },
              ].map((fm) => (
                <div key={fm.name} className="flex gap-3 text-xs">
                  <span className="font-mono text-violet-400 shrink-0">{fm.name}</span>
                  <span className="text-zinc-400">{fm.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wide font-bold">V1-B Roadmap</div>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                ["missing_answer", "Corpus doesn't contain the answer. Good system abstains; bad system hallucinates."],
                ["ambiguous_query", "Query has two valid interpretations. Teaches clarification vs. over-answering."],
                ["prompt_injection", "Retrieved chunk contains 'ignore previous instructions'. Indirect injection."],
                ["multi_hop", "Answer requires combining two chunks. Teaches top-k, chunking, reranking."],
              ].map(([id, desc]) => (
                <div key={id} className="flex gap-3">
                  <span className="text-zinc-600 shrink-0">{id}</span>
                  <span className="text-zinc-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12 px-6 py-4 text-center">
        <p className="text-xs text-zinc-600">GenAI Systems Lab · V1-A · Static precomputed simulator · Zero hosting cost · Open source</p>
      </footer>
    </div>
  );
}
