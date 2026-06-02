import { useState } from "react";

const FM_SCENARIOS = [
  {
    id: "lora_rank_low",
    title: "The Underfitting Adapter",
    tag: "RANK",
    desc: "LoRA rank too low for task complexity",
    setup: "You're fine-tuning a 7B model to extract structured fields from legal contracts — clause type, party names, obligations, and termination conditions. You have 5K training examples and 2 days before deployment.",
    framing: "LoRA's rank parameter controls how many independent directions the adapter can learn. Rank 4 means the adapter can represent exactly 4 linearly independent patterns. Legal extraction involves dozens of clause types with subtle syntactic variations. What happens when the adapter's capacity doesn't match the task's complexity?",
    configs: [
      { label: "rank=4, alpha=8", params: { "LoRA rank": 4, "alpha": 8, "Trainable params": "~2M", "Task complexity": "High" }, buttonLabel: "Low rank" },
      { label: "rank=16, alpha=32", params: { "LoRA rank": 16, "alpha": 32, "Trainable params": "~8M", "Task complexity": "High" }, buttonLabel: "Medium rank" },
      { label: "rank=64, alpha=128", params: { "LoRA rank": 64, "alpha": 128, "Trainable params": "~32M", "Task complexity": "High" }, buttonLabel: "High rank" },
    ],
    outcomes: [
      {
        status: "fail",
        label: "Underfitting on edge cases",
        metrics: { "Train accuracy": "94%", "Eval (in-dist)": "91%", "Eval (edge cases)": "38%", "Clause type error rate": "61%" },
        rootCause: "Rank 4 can only represent 4 linearly independent directions of adaptation. Legal clause extraction requires the model to distinguish dozens of clause subtypes — indemnification vs liability cap vs force majeure — with different structural patterns. Four rank dimensions can't represent this complexity. The model learns the most frequent patterns well and fails on anything outside the top-4.",
        fix: "Use rank 16–64 for complex structured extraction tasks. Rule of thumb: rank ≈ number of distinct output patterns ÷ 4. For legal extraction with 20+ clause types, rank 16 minimum. Rank 64 if subtle distinctions matter for downstream use.",
        synthesisClose: "Rank is not a regularization knob — it is a capacity constraint. Underfitting from low rank looks identical to underfitting from insufficient data on aggregate metrics. The tell is the edge case distribution: in-distribution accuracy stays high while tail cases collapse.",
        preplabQ: { id: "fmlab-1", label: "PrepLab: LoRA rank trade-offs →" }
      },
      {
        status: "partial",
        label: "Improved but plateau on complex clauses",
        metrics: { "Train accuracy": "96%", "Eval (in-dist)": "93%", "Eval (edge cases)": "71%", "Clause type error rate": "29%" },
        rootCause: "Rank 16 handles the majority of clause types well. Complex nested clauses with cross-references (e.g. 'obligations in Section 3(b)(ii) as amended by Schedule A') still exceed the adapter's representational capacity.",
        fix: "Rank 16 is sufficient for most extraction tasks. If the failing cases are structurally complex (nested references, conditional logic), increase to rank 32-64 or consider decomposing the task into simpler subtasks.",
        synthesisClose: "For most fine-tuning tasks, rank 16 is a safe default. Only go higher when the task involves high structural diversity or when rank 16 shows the same edge-case gap as rank 4.",
        preplabQ: { id: "fmlab-1", label: "PrepLab: LoRA rank trade-offs →" }
      },
      {
        status: "pass",
        label: "Strong generalization across clause types",
        metrics: { "Train accuracy": "97%", "Eval (in-dist)": "95%", "Eval (edge cases)": "89%", "Clause type error rate": "11%" },
        rootCause: "Rank 64 provides sufficient capacity for the task's complexity. The adapter can represent 64 independent patterns — enough to cover the major clause types and their structural variants.",
        fix: "This is the right configuration for complex structured extraction. Note: rank 64 with alpha 128 adds ~32M trainable parameters. For a 7B model this is still <0.5% of total params — compute cost is manageable.",
        synthesisClose: "High rank works here, but it is not always the right answer. Higher rank increases overfitting risk on small datasets and training cost on large models. Match rank to task complexity, not to 'more is better' intuition.",
        preplabQ: { id: "fmlab-1", label: "PrepLab: LoRA rank trade-offs →" }
      },
    ]
  },
  {
    id: "lr_too_high",
    title: "The Forgetting Model",
    tag: "LEARNING RATE",
    desc: "High learning rate causes catastrophic forgetting",
    setup: "You're fine-tuning a 13B base model for medical Q&A — the model should answer questions about drug interactions, dosage protocols, and contraindications. Eval on medical questions is your success metric.",
    framing: "Learning rate controls how aggressively each gradient update moves the model's weights. Too high, and the updates overwrite the pretrained knowledge the model spent billions of tokens learning. Medical Q&A accuracy may improve — but general reasoning, which medical inference depends on, can collapse.",
    configs: [
      { label: "lr=5e-4, no warmup, 5 epochs", params: { "Learning rate": "5e-4", "Warmup steps": 0, "Epochs": 5, "Schedule": "constant" }, buttonLabel: "Aggressive LR" },
      { label: "lr=1e-4, warmup=100, 3 epochs", params: { "Learning rate": "1e-4", "Warmup steps": 100, "Epochs": 3, "Schedule": "cosine" }, buttonLabel: "Moderate LR" },
      { label: "lr=2e-5, warmup=300, 3 epochs", params: { "Learning rate": "2e-5", "Warmup steps": 300, "Epochs": 3, "Schedule": "cosine" }, buttonLabel: "Conservative LR" },
    ],
    outcomes: [
      {
        status: "fail",
        label: "Catastrophic forgetting",
        metrics: { "Medical accuracy": "+41%", "Multi-step reasoning": "-38%", "Basic arithmetic": "-29%", "Factual recall (non-medical)": "-44%" },
        rootCause: "lr=5e-4 produces large weight updates that overwrite pretrained representations. No warmup means full-speed updates from step 1, before the gradient signal has stabilized. The model overwrites general reasoning capabilities — which medical inference depends on — to fit the medical training distribution. Medical accuracy improves but the model can no longer reason correctly to get there.",
        fix: "For full fine-tuning, use lr=1e-5 to 5e-5 with a warmup of 5-10% of total steps. For LoRA, 1e-4 is more forgiving since only adapter weights update. Always include a warmup schedule — never start at full learning rate.",
        synthesisClose: "Catastrophic forgetting is invisible on domain-specific metrics. The model aces your medical eval while losing the reasoning chains medical accuracy depends on. Always include a holdout of general capability benchmarks alongside your domain eval.",
        preplabQ: { id: "fmlab-2", label: "PrepLab: Catastrophic forgetting →" }
      },
      {
        status: "partial",
        label: "Moderate forgetting on edge cases",
        metrics: { "Medical accuracy": "+33%", "Multi-step reasoning": "-9%", "Basic arithmetic": "-4%", "Factual recall (non-medical)": "-11%" },
        rootCause: "lr=1e-4 with warmup is better but still causes some overwriting on complex reasoning tasks. The warmup helps stabilize early training but the LR is still an order of magnitude higher than recommended for preserving pretrained capability.",
        fix: "Acceptable for some use cases. If multi-step reasoning is required for medical inference (e.g. drug interaction chains), drop to lr=2e-5.",
        synthesisClose: "Warmup is not a substitute for an appropriate learning rate. Warmup prevents gradient instability at the start; it does not prevent overwriting across the full training run.",
        preplabQ: { id: "fmlab-2", label: "PrepLab: Catastrophic forgetting →" }
      },
      {
        status: "pass",
        label: "Domain improvement without capability loss",
        metrics: { "Medical accuracy": "+28%", "Multi-step reasoning": "-1%", "Basic arithmetic": "+0%", "Factual recall (non-medical)": "-2%" },
        rootCause: "lr=2e-5 with 300-step warmup makes small, stable updates. The model acquires medical domain knowledge without overwriting the pretrained representations it needs for reasoning. The 28% medical improvement is slightly lower than the aggressive LR case — the cost of preservation.",
        fix: "This is the correct trade-off for a safety-critical domain where reasoning capability matters as much as domain knowledge.",
        synthesisClose: "Lower accuracy on your domain metric is sometimes the right answer. A medical model that gains 28% on domain questions but preserves reasoning is more useful in production than one that gains 41% but loses the ability to chain inferences.",
        preplabQ: { id: "fmlab-2", label: "PrepLab: Catastrophic forgetting →" }
      },
    ]
  },
  {
    id: "eval_contamination",
    title: "The Leaky Benchmark",
    tag: "CONTAMINATION",
    desc: "Eval set leaks into training distribution",
    setup: "You're fine-tuning a customer support model on 50K historical tickets. You need an eval set to measure quality before deployment. You randomly shuffle and take 10% as eval.",
    framing: "Your eval set is only useful if it measures generalization — the model's ability to handle inputs it hasn't seen. A random split from the same time period means your eval tickets have the same topics, phrasings, and resolution patterns as your training data. The model doesn't need to generalize — it just needs to recognize the distribution.",
    configs: [
      { label: "Random 90/10 split, same period", params: { "Split method": "Random shuffle", "Time period": "Same 6 months", "Deduplication": "None", "Distribution": "Identical" }, buttonLabel: "Random split" },
      { label: "Random split with deduplication", params: { "Split method": "Random shuffle", "Time period": "Same 6 months", "Deduplication": "Exact match removed", "Distribution": "Near-identical" }, buttonLabel: "Deduplicated split" },
      { label: "Temporal split (train months 1-9, eval months 10-12)", params: { "Split method": "Temporal", "Train period": "Months 1–9", "Eval period": "Months 10–12", "Distribution": "Realistic shift" }, buttonLabel: "Temporal split" },
    ],
    outcomes: [
      {
        status: "fail",
        label: "Inflated eval, poor production quality",
        metrics: { "Eval BLEU": "0.89", "Eval ROUGE-L": "0.84", "Production quality (human)": "52%", "New ticket type accuracy": "31%" },
        rootCause: "Random split from the same period means the eval set is statistically indistinguishable from the training set. The model learns to recognize distribution patterns — recurring phrases, common resolutions, frequent templates — rather than understanding the underlying support task. Eval metrics are high because the model has effectively seen the eval distribution during training.",
        fix: "Split along natural boundaries: time (most important for production systems), customer segment, product line, or ticket source channel. Never random shuffle when data has temporal or structural groupings that reflect real-world distribution shifts.",
        synthesisClose: "High eval metrics on a contaminated eval set are worse than low metrics on a clean one — they create false confidence that delays catching the real failure until production.",
        preplabQ: { id: "fmlab-3", label: "PrepLab: Data splitting →" }
      },
      {
        status: "partial",
        label: "Slightly more honest metrics, same underlying problem",
        metrics: { "Eval BLEU": "0.85", "Eval ROUGE-L": "0.81", "Production quality (human)": "54%", "New ticket type accuracy": "34%" },
        rootCause: "Deduplication removes exact copies but the remaining examples are still drawn from the same temporal distribution. Near-duplicate phrasings and similar resolution patterns remain. The contamination problem is not the duplicates — it is the shared distribution.",
        fix: "Deduplication is necessary but not sufficient. You still need a temporal or domain split.",
        synthesisClose: "Deduplication addresses a data quality problem, not an eval design problem. These are two separate issues — solve both.",
        preplabQ: { id: "fmlab-3", label: "PrepLab: Data splitting →" }
      },
      {
        status: "pass",
        label: "Honest eval reflecting real production conditions",
        metrics: { "Eval BLEU": "0.71", "Eval ROUGE-L": "0.68", "Production quality (human)": "78%", "New ticket type accuracy": "69%" },
        rootCause: "Temporal split means the eval set contains ticket types, phrasings, and resolutions that emerged after the training period. The model must generalize — its metrics genuinely reflect its production capability.",
        fix: "This is the correct split strategy. Note that BLEU/ROUGE dropped compared to the contaminated eval — that is the honest signal. 0.71 on a clean temporal split is more informative than 0.89 on a contaminated one.",
        synthesisClose: "A lower number on a clean eval is more valuable than a higher number on a contaminated one. The purpose of eval is to predict production performance — not to maximize a metric.",
        preplabQ: { id: "fmlab-3", label: "PrepLab: Data splitting →" }
      },
    ]
  },
  {
    id: "data_volume",
    title: "The Memorising Student",
    tag: "DATA VOLUME",
    desc: "Too few examples, too many epochs — memorisation not generalisation",
    setup: "You're building a specialised coding assistant for an internal DSL (domain-specific language). You have 200 hand-written examples of correct DSL code. You fine-tune for 15 epochs to squeeze maximum signal from the small dataset.",
    framing: "Epochs × examples = total training steps. 200 examples × 15 epochs = 3,000 updates, all seeing the same 200 inputs. At some point, additional passes over the same data stop adding generalisation and start adding memorisation. The model learns to recognise examples, not understand the DSL.",
    configs: [
      { label: "200 examples, 15 epochs", params: { "Training examples": 200, "Epochs": 15, "Total updates": "3,000", "Data diversity": "Low" }, buttonLabel: "Few examples, many epochs" },
      { label: "200 examples, 3 epochs", params: { "Training examples": 200, "Epochs": 3, "Total updates": "600", "Data diversity": "Low" }, buttonLabel: "Few examples, few epochs" },
      { label: "2,500 examples, 3 epochs", params: { "Training examples": 2500, "Epochs": 3, "Total updates": "7,500", "Data diversity": "High" }, buttonLabel: "More examples, few epochs" },
    ],
    outcomes: [
      {
        status: "fail",
        label: "Perfect training accuracy, poor generalisation",
        metrics: { "Train accuracy": "100%", "Eval (held-out examples)": "97%", "Eval (new DSL patterns)": "19%", "Verbatim regurgitation rate": "43%" },
        rootCause: "15 epochs on 200 examples pushes the model into memorisation. It has seen each example 15 times — enough to store them as lookup patterns rather than learn the underlying DSL grammar. When given a new DSL construct it hasn't seen, it outputs the most similar memorised example verbatim. Train accuracy of 100% is a red flag, not a success signal.",
        fix: "More data, fewer epochs. For specialised coding tasks, you need at minimum 1,000-2,000 diverse examples. More epochs on a small dataset is almost always counterproductive after epoch 3-5. Add early stopping on eval loss.",
        synthesisClose: "100% train accuracy is almost always a failure mode for fine-tuning, not a goal. It means the model has memorised your training set. The generalisation you want is measured on unseen examples — and that requires unseen examples during training.",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Fine-tuning data volume →" }
      },
      {
        status: "partial",
        label: "Reduced memorisation but still insufficient generalisation",
        metrics: { "Train accuracy": "89%", "Eval (held-out examples)": "81%", "Eval (new DSL patterns)": "41%", "Verbatim regurgitation rate": "12%" },
        rootCause: "3 epochs reduces memorisation significantly — the model hasn't seen each example enough times to memorise it. But 200 examples is still too few to learn the DSL's generative rules. Performance on new patterns is limited by the diversity of training data, not epochs.",
        fix: "This configuration is better but still insufficient. You need more data. Consider data augmentation: generate variations of existing examples by modifying variable names, nesting depth, and argument order.",
        synthesisClose: "Fewer epochs is a necessary fix but not a sufficient one. Data volume and data diversity are the real levers. Epochs controls how much you squeeze from existing data — it cannot substitute for data you don't have.",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Fine-tuning data volume →" }
      },
      {
        status: "pass",
        label: "Strong generalisation to new DSL patterns",
        metrics: { "Train accuracy": "94%", "Eval (held-out examples)": "91%", "Eval (new DSL patterns)": "79%", "Verbatim regurgitation rate": "3%" },
        rootCause: "2,500 diverse examples with 3 epochs gives the model enough variation to learn the underlying patterns rather than memorise surface forms. 7,500 total updates across diverse inputs is sufficient to encode the DSL's structure.",
        fix: "This is the right configuration. Note: if 2,500 examples is not achievable, data augmentation (synthetic variations of real examples) can multiply a small seed dataset before the model sees it.",
        synthesisClose: "Collecting 10× more data is almost always more valuable than training 10× longer on the data you have. The limiting factor for most fine-tuning projects is data diversity, not compute.",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Fine-tuning data volume →" }
      },
    ]
  },
  {
    id: "objective_mismatch",
    title: "The Confident Hallucinator",
    tag: "OBJECTIVE",
    desc: "Reward signal does not measure what you actually want",
    setup: "Your LLM has a known hallucination problem — it invents plausible-sounding facts. You run an RLHF campaign: hire 50 contractors to rate responses with thumbs-up or thumbs-down. You fine-tune using these ratings as the reward signal.",
    framing: "RLHF reward signals shape what the model optimises for. If raters judge responses by fluency, confidence, and helpfulness — rather than factual accuracy — the model learns to produce fluent, confident, helpful-sounding responses. Whether those responses are accurate is a separate question your reward signal may not capture.",
    configs: [
      { label: "Human thumbs-up/down ratings", params: { "Reward signal": "User ratings", "Rater type": "General contractors", "Rubric": "Helpful/unhelpful", "Factual grounding": "None" }, buttonLabel: "User ratings" },
      { label: "Expert ratings with factual rubric", params: { "Reward signal": "Expert ratings", "Rater type": "Domain experts", "Rubric": "Factual accuracy + helpfulness", "Factual grounding": "Partial" }, buttonLabel: "Expert ratings" },
      { label: "Automated fact-check vs golden source", params: { "Reward signal": "Factual accuracy score", "Rater type": "Automated", "Rubric": "Claim-by-claim verification", "Factual grounding": "Direct" }, buttonLabel: "Fact-check reward" },
    ],
    outcomes: [
      {
        status: "fail",
        label: "More confident, more wrong",
        metrics: { "User satisfaction": "+34%", "Perceived helpfulness": "+28%", "Factual accuracy (benchmark)": "-15%", "Hallucination rate": "+22%" },
        rootCause: "General raters reward confidence and fluency. Responses that sound authoritative, use hedging rarely, and flow naturally get thumbs-up — regardless of factual correctness. The model learns to optimise for 'sounds like a correct answer' rather than 'is a correct answer.' This is Goodhart's Law in RLHF: when the measure becomes the target, it ceases to be a good measure.",
        fix: "Use factual accuracy as the direct reward signal. If human raters are required, train them with explicit factual rubrics: they must verify each claim against a golden source before rating. Automated fact-checking against a verified knowledge base is more consistent and scalable.",
        synthesisClose: "The most dangerous RLHF failure mode is a model that scores well on your reward signal but gets worse at the actual task. Always include an independent factual accuracy eval — one that is completely separate from the reward signal — to detect this drift.",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Training objective →" }
      },
      {
        status: "partial",
        label: "Better but inconsistently applied rubric",
        metrics: { "User satisfaction": "+19%", "Perceived helpfulness": "+14%", "Factual accuracy (benchmark)": "+8%", "Hallucination rate": "-11%" },
        rootCause: "Expert raters with factual rubrics are more reliable than general raters. However, rubric application is inconsistent across raters and domains — experts disagree on edge cases and verification is manual and slow. Some reward signal noise remains.",
        fix: "Expert ratings with rubrics are significantly better than general ratings. To improve further: calibration sessions to align raters, explicit inter-rater agreement thresholds, and automated pre-screening to flag obvious hallucinations before expert review.",
        synthesisClose: "Expert raters improve signal quality but introduce inter-rater variance. Hybrid approaches — automated screening + expert review of borderline cases — give better signal than either alone.",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Training objective →" }
      },
      {
        status: "pass",
        label: "Factual accuracy improves alongside quality",
        metrics: { "User satisfaction": "+11%", "Perceived helpfulness": "+9%", "Factual accuracy (benchmark)": "+31%", "Hallucination rate": "-44%" },
        rootCause: "Automated fact-checking against golden source documents provides a direct, consistent, scalable reward signal for factual accuracy. The model learns that a correct answer must be grounded in verifiable claims. User satisfaction improves less than with rating-based reward — the model has been constrained to say less when uncertain.",
        fix: "This is the correct approach for factual grounding. Build a golden source: a curated, verified knowledge base that the reward model can check against. The upfront investment in the golden source pays off in consistent, manipulatable reward signal.",
        synthesisClose: "Saying 'I don't know' or 'I'm uncertain' is a real capability improvement for a model with a hallucination problem. A lower satisfaction score on a model that admits uncertainty is better than a higher satisfaction score on one that confidently hallucinates.",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Training objective →" }
      },
    ]
  },
  {
    id: "base_model_mismatch",
    title: "The Wrong Foundation",
    tag: "BASE MODEL",
    desc: "Fine-tuning cannot add capabilities the base model doesn't have",
    setup: "You're building a Hindi legal document analyser for an Indian law firm. You need to extract obligations, penalties, and jurisdiction from complex Hindi legal contracts. You choose a 3B English-only model because it's cheap and fast to fine-tune.",
    framing: "Fine-tuning adjusts the weights of a pretrained model. It can adapt existing capabilities to a new domain. It cannot create capabilities that were never learned during pretraining. A model with no Hindi token representations cannot learn Hindi through fine-tuning. A 3B model with insufficient parameters for complex legal reasoning cannot acquire that reasoning through fine-tuning.",
    configs: [
      { label: "English-only 3B, legal fine-tune", params: { "Base model": "English-only 3B", "Language coverage": "English only", "Reasoning capacity": "Low (3B)", "Domain pretraining": "None" }, buttonLabel: "English 3B" },
      { label: "Multilingual 3B, legal fine-tune", params: { "Base model": "Multilingual 3B", "Language coverage": "100 languages", "Reasoning capacity": "Low (3B)", "Domain pretraining": "None" }, buttonLabel: "Multilingual 3B" },
      { label: "Multilingual 7B legal-pretrained", params: { "Base model": "Multilingual 7B", "Language coverage": "Hindi + English strong", "Reasoning capacity": "Sufficient (7B)", "Domain pretraining": "Legal corpus" }, buttonLabel: "Multilingual 7B legal" },
    ],
    outcomes: [
      {
        status: "fail",
        label: "Language barrier + capacity ceiling",
        metrics: { "Hindi comprehension": "12%", "Legal term extraction": "28%", "Obligation identification": "19%", "Penalty clause detection": "22%" },
        rootCause: "An English-only model has never seen Hindi tokens during pretraining. Its tokenizer fragments Hindi text into nonsensical subword units — the model has no semantic representations for Hindi vocabulary. Fine-tuning cannot add a language — it can only adapt to variations within a language the model already knows. Additionally, 3B parameters is insufficient for the complex multi-step reasoning that legal contract analysis requires.",
        fix: "You need a model that (1) was pretrained on Hindi data, (2) has sufficient parameter count for legal reasoning, and (3) ideally has some legal domain pretraining. Fine-tuning amplifies existing capabilities — it does not create them.",
        synthesisClose: "This is the most common and most expensive fine-tuning mistake: choosing a base model for convenience (cost, speed) and expecting fine-tuning to compensate for the wrong choice. Model selection is an architecture decision. Fine-tuning is not an architecture decision.",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Base model selection →" }
      },
      {
        status: "partial",
        label: "Language works, reasoning still limited",
        metrics: { "Hindi comprehension": "71%", "Legal term extraction": "58%", "Obligation identification": "44%", "Penalty clause detection": "51%" },
        rootCause: "Multilingual 3B has Hindi representations from pretraining — the language barrier is resolved. But 3B parameters is insufficient for complex legal reasoning. The model can read and understand Hindi but cannot reliably perform the multi-step inference that legal document analysis requires (cross-referencing clauses, resolving conditional logic, distinguishing obligation from permission).",
        fix: "The language problem is solved. The capacity problem remains. Upgrade to 7B minimum for legal reasoning tasks. If budget allows, use a model with legal domain pretraining — it will require less fine-tuning data to reach production quality.",
        synthesisClose: "Language capability and reasoning capability are independent dimensions. A multilingual small model has both Hindi and a reasoning ceiling. Fix both independently: language (base model selection), reasoning capacity (parameter count).",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Base model selection →" }
      },
      {
        status: "pass",
        label: "Production-grade extraction accuracy",
        metrics: { "Hindi comprehension": "94%", "Legal term extraction": "89%", "Obligation identification": "83%", "Penalty clause detection": "87%" },
        rootCause: "Multilingual 7B with legal pretraining has all three required capabilities: Hindi language representations, sufficient parameter count for legal reasoning, and domain-specific legal vocabulary from pretraining. Fine-tuning on 5K Hindi legal examples adapts existing capabilities to the specific extraction task rather than trying to build them from scratch.",
        fix: "This is the correct base model selection. Cost is higher than 3B alternatives, but the 3B alternatives require 10× more fine-tuning data to reach even 60% of this performance — the economics favour the better base model.",
        synthesisClose: "The correct model selection question is not 'what is the smallest model I can fine-tune for this task?' It is 'what is the minimum capability floor I need before fine-tuning can take over?' Assess language, reasoning, and domain coverage before selecting.",
        preplabQ: { id: "fmlab-4", label: "PrepLab: Base model selection →" }
      },
    ]
  },
];

const STATUS_STYLES = {
  fail:    { border: "border-red-800/50",   bg: "rgba(239,68,68,0.06)",   dot: "bg-red-500",    label: "text-red-400",   tag: "FAILURE" },
  partial: { border: "border-amber-700/50", bg: "rgba(245,158,11,0.06)",  dot: "bg-amber-400",  label: "text-amber-300", tag: "PARTIAL" },
  pass:    { border: "border-emerald-800/50",bg: "rgba(34,197,94,0.06)",  dot: "bg-emerald-500",label: "text-emerald-400",tag: "CORRECT" },
};

export default function FoundationModelsLab({ onNavigate }) {
  const [activeId, setActiveId]         = useState(FM_SCENARIOS[0].id);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

  const scenario = FM_SCENARIOS.find(s => s.id === activeId);
  const outcome  = selectedConfig !== null ? scenario.outcomes[selectedConfig] : null;
  const st       = outcome ? STATUS_STYLES[outcome.status] : null;

  function switchScenario(id) {
    setActiveId(id);
    setSelectedConfig(null);
    setMobileSidebarOpen(false);
  }

  return (
    <div className="flex h-full min-h-0">

      {/* Sidebar */}
      <div className={`${mobileSidebarOpen ? "flex" : "hidden"} flex-col w-full lg:flex lg:w-56 lg:shrink-0 overflow-y-auto py-3`}
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
        <div className="px-4 py-1 text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">FOUNDATION MODELS LAB</div>
        {FM_SCENARIOS.map(s => {
          const active = s.id === activeId;
          return (
            <button key={s.id} onClick={() => switchScenario(s.id)}
              className={`w-full text-left px-4 py-2.5 transition-all flex flex-col gap-0.5 ${active ? "border-l-2 border-amber-500 bg-zinc-800/80" : "border-l-2 border-transparent hover:bg-zinc-900"}`}>
              <span className={`text-xs font-semibold leading-snug ${active ? "text-white" : "text-zinc-300"}`}>{s.title}</span>
              <span className={`text-[9px] font-mono ${active ? "text-amber-400" : "text-zinc-500"}`}>{s.tag}</span>
            </button>
          );
        })}
        <div className="mt-4 mx-3 p-3 rounded-lg border border-zinc-800/60" style={{ background: "rgba(245,158,11,0.04)" }}>
          <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">WHAT THIS LAB COVERS</div>
          <div className="text-[11px] text-zinc-400 leading-relaxed">Configure a fine-tuning setup. Watch it fail. Understand why the failure is architectural — not fixable by adding more data or training longer.</div>
        </div>
      </div>

      {/* Right panel */}
      <div className={`${mobileSidebarOpen ? "hidden" : "flex"} flex-col lg:flex flex-1 min-w-0 overflow-y-auto`}>

        {/* Mobile back */}
        <button onClick={() => setMobileSidebarOpen(true)}
          className="flex lg:hidden items-center gap-1.5 px-4 py-3 text-xs text-zinc-400 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Foundation Models Lab
        </button>

        <div className="p-5 sm:p-7 space-y-6">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" }}>{scenario.tag}</span>
            </div>
            <div className="text-xl font-black text-white tracking-tight mb-1">{scenario.title}</div>
            <div className="text-sm text-zinc-400">{scenario.desc}</div>
          </div>

          {/* Setup framing */}
          <div className="p-4 rounded-xl border border-zinc-800/60" style={{ background: "var(--surface-2)" }}>
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">THE SCENARIO</div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">{scenario.setup}</p>
            <p className="text-xs text-zinc-500 leading-relaxed">{scenario.framing}</p>
          </div>

          {/* Config selector */}
          <div>
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3">CHOOSE A CONFIGURATION</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scenario.configs.map((cfg, i) => {
                const selected = selectedConfig === i;
                return (
                  <button key={i} onClick={() => setSelectedConfig(i)}
                    className={`text-left p-4 rounded-xl border transition-all duration-150 ${selected ? "border-amber-500/60 bg-amber-950/20" : "border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5"}`}
                    style={{ background: selected ? "rgba(245,158,11,0.08)" : "var(--surface-2)" }}>
                    <div className="text-xs font-bold text-zinc-100 mb-2">{cfg.buttonLabel}</div>
                    <div className="space-y-1">
                      {Object.entries(cfg.params).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-zinc-500">{k}</span>
                          <span className={`text-[10px] font-mono ${selected ? "text-amber-300" : "text-zinc-400"}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Outcome */}
          {outcome && (
            <div className={`rounded-xl border p-5 space-y-4 ${st.border}`} style={{ background: st.bg }}>

              {/* Status header */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                <span className={`text-[9px] font-mono uppercase tracking-widest ${st.label}`}>{st.tag}</span>
                <span className="text-sm font-semibold text-zinc-200 ml-1">{outcome.label}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(outcome.metrics).map(([k, v]) => {
                  const isNeg = v.startsWith("-");
                  const isPos = v.startsWith("+") && !v.includes("%") || (v.startsWith("+") && !isNeg);
                  const numColor = isNeg ? "text-red-400" : (v.includes("%") && !v.startsWith("+") && parseInt(v) < 50) ? "text-amber-400" : "text-emerald-400";
                  return (
                    <div key={k} className="p-2.5 rounded-lg border border-zinc-800/50" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <div className="text-[9px] text-zinc-500 mb-1 leading-snug">{k}</div>
                      <div className={`text-sm font-bold font-mono ${numColor}`}>{v}</div>
                    </div>
                  );
                })}
              </div>

              {/* Root cause */}
              <div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">ROOT CAUSE</div>
                <p className="text-sm text-zinc-300 leading-relaxed">{outcome.rootCause}</p>
              </div>

              {/* Fix */}
              <div className="p-3 rounded-lg border border-zinc-700/40" style={{ background: "rgba(99,102,241,0.06)" }}>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">FIX</div>
                <p className="text-sm text-zinc-300 leading-relaxed">{outcome.fix}</p>
              </div>

              {/* Synthesis close */}
              <div className="p-3 rounded-lg border border-amber-800/30" style={{ background: "rgba(245,158,11,0.04)" }}>
                <div className="text-[9px] font-mono text-amber-600 uppercase tracking-widest mb-1.5">THE DESIGN PRINCIPLE</div>
                <p className="text-sm text-amber-200/80 leading-relaxed italic">{outcome.synthesisClose}</p>
              </div>

              {/* Forward pointer */}
              {onNavigate && (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
                  <span className="text-[11px] text-zinc-500">Drill this in PrepLab →</span>
                  <button onClick={() => onNavigate({ tab: "preplab" })}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:-translate-y-0.5"
                    style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
                    {outcome.preplabQ.label}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prompt if no config selected */}
          {selectedConfig === null && (
            <div className="p-4 rounded-xl border border-zinc-800/40 text-center" style={{ background: "var(--surface-2)" }}>
              <p className="text-sm text-zinc-500">Select a configuration above to see what happens.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
