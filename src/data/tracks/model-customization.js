// GSL premium-niche track — Model Customization / Fine-tuning-as-a-Service (SKELETON, 2026-07-03)
// RUNNER_DATA fragment. Spread into src/data/foundationsRunnerData.js via ...RUNNER_MODEL_CUSTOM.
// Distinct from the existing "foundation-models" gym (which teaches LoRA/RLHF/DPO CONCEPTUALLY):
// this track is the APPLIED PRODUCTIZATION niche — data curation, the fine-tune decision, serving
// adapters at multi-tenant scale, and eval-driven customization. SKELETON HONESTY: spec +
// "🚧 In development" marker. No MCQs yet. Keep the export name RUNNER_MODEL_CUSTOM. Additive only.

const DEV = "🚧 In development — outline below. This module is a specced scaffold, not finished teaching content yet. The scenario and numbered outline show exactly what it will cover once authored.";

export const RUNNER_MODEL_CUSTOM = {
  "custom-when-to-finetune": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " A stakeholder says 'let's fine-tune a model on our data'. Your job is to push back with a decision framework: prompt engineering vs RAG vs fine-tuning vs pretraining — because fine-tuning is often the wrong, expensive answer.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. The customization ladder, cheapest→costliest: prompt/few-shot → RAG (inject knowledge) → fine-tune (change behavior/format/tone) → continued pretraining (new domain/language).",
      "2. The core distinction: fine-tuning teaches BEHAVIOR and STYLE, not new FACTS — for changing facts/knowledge, RAG is usually right. Getting this wrong is the classic interview trap.",
      "3. When fine-tuning genuinely wins: consistent format/tone, narrow task specialization, latency/cost via a smaller tuned model, or teaching a skill prompting can't reliably elicit.",
      "4. The hidden costs: data collection/labeling, eval harness, retraining as base models improve, and serving/ops — fine-tuning is a commitment, not a one-off.",
      "5. Combining them: RAG + a fine-tuned model, and why that's often the real answer.",
      { type: "illustration", label: "Planned decision matrix (to be built)", content:
`Need                              Reach for
Inject changing facts/knowledge   RAG
Enforce format/tone/style         Fine-tune (SFT)
Specialize a narrow task cheaply  Fine-tune a small model
New domain/language from scratch  Continued pretraining
Quick behavior nudge              Prompt / few-shot
  -> "fine-tune to add facts" is the classic wrong answer.` },
      "6. Interview canon: 'fine-tune vs RAG', 'when do you fine-tune', 'does fine-tuning add knowledge', 'what does fine-tuning actually cost'.",
    ],
    takeaway: "SKELETON: Fine-tuning changes behavior/format, not facts — climb the cheapest-first ladder (prompt → RAG → fine-tune → pretrain). 'Fine-tune to add knowledge' is the classic trap; RAG + a tuned model is often the real answer. Full content + interactive coming.",
  },

  "custom-data-curation": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " You've decided to fine-tune. Now the hard part: the dataset. Your first tuned model got WORSE. You need to explain why data quality — not quantity — decides fine-tuning success, and how to build a good SFT set.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Quality over quantity: a few thousand clean, on-distribution examples often beats hundreds of thousands of noisy ones (the LIMA lesson).",
      "2. Building an SFT dataset: format consistency, coverage of the real task distribution, deduplication, and removing contradictory/low-quality labels.",
      "3. Synthetic data + distillation: using a stronger model to generate/augment training data (and the risks — bias inheritance, model collapse from too much synthetic data).",
      "4. The eval set FIRST: you can't curate data without a held-out eval that reflects production; building it before you train.",
      "5. Data leakage + contamination: keeping eval out of training, and why a rising loss with flat eval means you're overfitting noise.",
      "6. Interview canon: 'how much data to fine-tune', 'quality vs quantity', 'how do you build an SFT set', 'how do you use synthetic data safely'.",
    ],
    takeaway: "SKELETON: Fine-tuning success is a data-curation problem — clean, consistent, on-distribution examples beat volume; build the held-out eval first; use synthetic data carefully. Full content + interactive coming.",
  },

  "custom-peft-lora-serving": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " You need to fine-tune a 70B model but can't afford full fine-tuning, and you'll have DOZENS of customer-specific variants. Explain PEFT/LoRA and — the part interviews probe — how you SERVE many adapters efficiently.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Why full fine-tuning is expensive: updating all weights needs huge memory (optimizer states) and produces a full model copy per variant.",
      "2. LoRA / PEFT: freeze the base, train small low-rank adapter matrices (rank r); recap of rank, alpha, target modules, and QLoRA (4-bit base + LoRA) for single-GPU tuning.",
      "3. The productization angle — MULTI-ADAPTER SERVING: one base model in memory + many swappable LoRA adapters; batched multi-LoRA inference (S-LoRA/punica-style) so N customers share one deployment.",
      "4. Adapter lifecycle: versioning, A/B testing adapters, merging vs keeping adapters separate, and hot-swapping per request/tenant.",
      "5. When PEFT isn't enough: tasks that need full fine-tuning or continued pretraining.",
      { type: "illustration", label: "Planned multi-adapter serving (to be built)", content:
`One base model (loaded once)
   + adapter_customerA (small)
   + adapter_customerB (small)
   + adapter_customerC (small)
  -> route each request to its tenant's adapter; batch across adapters.
     N customers, ~1 model's worth of GPU memory.` },
      "6. Interview canon: 'what is LoRA', 'LoRA vs full fine-tuning', 'how do you serve many fine-tunes', 'what is QLoRA'.",
    ],
    takeaway: "SKELETON: LoRA/PEFT tunes small low-rank adapters over a frozen base; the productization win is multi-adapter serving — one base + many swappable adapters so many tenants share one deployment. Full content + interactive coming.",
  },

  "custom-preference-alignment": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " SFT made your model fluent but it still gives unhelpful or off-tone answers users dislike. You need preference alignment. Explain RLHF vs DPO as a customization service would apply them, and when each fits.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Why SFT isn't enough: it imitates good answers but doesn't optimize for PREFERRED-over-alternative — you need a preference signal.",
      "2. RLHF pipeline: collect preference pairs → train a reward model → PPO against it with a KL penalty to the SFT model. Powerful but complex/unstable.",
      "3. DPO: skip the separate reward model + RL — a direct pairwise loss on preference data (implicit reward, reference-KL). Simpler, more stable, the modern default for most teams. (Deep-dives to the existing DPO Foundations module.)",
      "4. Getting preference data: human labeling vs AI feedback (RLAIF/constitutional), pair construction, and annotation quality.",
      "5. The alignment tax + over-refusal: tuning too hard for 'safe/preferred' can make the model refuse valid requests — measuring both directions.",
      "6. Interview canon: 'RLHF vs DPO', 'why not just SFT', 'how do you collect preference data', 'what is the alignment tax'.",
    ],
    takeaway: "SKELETON: Preference alignment optimizes preferred-over-alternative beyond SFT — RLHF (reward model + PPO) vs DPO (direct pairwise loss, the simpler modern default). Watch the alignment tax / over-refusal. Full content + interactive coming.",
  },

  "custom-eval-driven-loop": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " You shipped a fine-tuned model and it regressed on cases the old one handled — but you didn't notice for weeks. You need an eval-driven customization loop so every tuned model is measured before and after shipping.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Eval BEFORE you train: a held-out, production-representative eval set is the contract that says whether a fine-tune helped.",
      "2. Catastrophic forgetting: fine-tuning on a narrow task can degrade general/previous capabilities — measure on BOTH the new task and a regression suite.",
      "3. The customization flywheel: collect prod failures → curate into training/eval → tune → eval (task + regression) → ship → collect again.",
      "4. Comparing models: task metrics, LLM-as-judge (and its pitfalls), A/B in production, and guarding against overfitting the eval (Goodhart).",
      "5. Governance for a fine-tuning service: dataset/version lineage, reproducibility, and rollback when a new adapter regresses.",
      { type: "illustration", label: "Planned customization flywheel (to be built)", content:
`  prod failures -> curate (train + eval sets)
        ^                      |
        |                 fine-tune
        |                      |
   ship + collect  <----  eval: NEW task  AND  regression suite
  -> never ship a tune that wins the task but silently regresses elsewhere.` },
      "6. Interview canon: 'how do you know a fine-tune helped', 'what is catastrophic forgetting', 'how do you eval a fine-tuned model', 'design a fine-tuning feedback loop'.",
    ],
    takeaway: "SKELETON: Productized fine-tuning is eval-driven — build the held-out eval first, always test task + regression (catastrophic forgetting), and run a flywheel of prod-failures → curate → tune → eval → ship. Full content + interactive coming.",
  },
};
