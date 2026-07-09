// L0/L1/L2 question ladders — LoRA/PEFT + RLHF. Spread into PREP_QUESTIONS.
export const Q_PEFT_RLHF = [
  // ===================== LoRA / PEFT =====================

  // ----- L0 (Define) -----
  {
    id: "lora-l0-1",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "What does PEFT (parameter-efficient fine-tuning) refer to?",
    options: ["Retraining the entire model on a smaller learning rate","Quantizing a model to run inference on cheaper hardware","Adapting a pretrained model by training only a small number of extra or selected parameters while keeping most weights frozen","Distilling a large model into a smaller student model"],
    correct: 2,
    keywords: [],
    explanation:
      "PEFT methods (LoRA, adapters, prefix/prompt tuning) freeze the bulk of the pretrained weights and train only a tiny fraction of parameters. This slashes memory, storage, and compute versus full fine-tuning while recovering most of the task performance.",
    trap: "A weaker candidate calls PEFT 'just a lower learning rate.' PEFT is defined by which parameters are trained (a small subset/extra modules), not by the learning-rate schedule — full fine-tuning still updates every weight.",
  },
  {
    id: "lora-l0-2",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "In LoRA, the weight update to a frozen matrix W is represented as which of the following?",
    options: ["A full-rank matrix ΔW learned directly","A diagonal scaling matrix applied to W","A low-rank product ΔW = BA, where B and A are much smaller matrices","A sparse mask that zeros out some entries of W"],
    correct: 2,
    keywords: [],
    explanation:
      "LoRA freezes W and learns the update as a low-rank factorization ΔW = BA. If W is d×k, then B is d×r and A is r×k with rank r ≪ min(d,k), so you train only r(d+k) parameters instead of d·k.",
    trap: "A weaker answer says LoRA learns a full ΔW 'more efficiently.' The efficiency comes precisely from constraining ΔW to be low-rank (BA) — a full-rank ΔW would have the same parameter count as full fine-tuning.",
  },
  {
    id: "lora-l0-3",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "text",
    question:
      "Name the single biggest practical advantage of LoRA over full fine-tuning when you need to serve many task-specific variants of one base model.",
    options: [],
    correct: 0,
    keywords: [
      "storage",
      "small",
      "adapter",
      "swap",
      "share base",
      "one base model",
      "memory",
      "cheap to store",
      "many adapters",
    ],
    explanation:
      "Each LoRA adapter is only a few MB (just the B and A matrices), so one frozen base model can be shared across dozens of tasks by swapping tiny adapters — versus storing a full multi-GB checkpoint per task with full fine-tuning.",
    trap: "Weaker answers stop at 'it's faster to train.' The dominant operational win at serving time is storage/memory: tiny swappable adapters over a shared frozen base, not merely training speed.",
  },

  // ----- L1 (Deep) -----
  {
    id: "lora-l1-1",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question:
      "LoRA scales its update by a factor of alpha/r before adding it to the frozen weights. What is the primary purpose of the alpha (scaling) hyperparameter?",
    options: [
      "It sets the rank of the decomposition directly",
      "It controls the effective magnitude of the LoRA update, decoupling it from the choice of rank so tuning r doesn't require re-tuning the learning rate",
      "It determines how many layers receive LoRA modules",
      "It quantizes the adapter weights to lower precision",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "The forward pass is h = Wx + (alpha/r)·BAx. Dividing by r keeps the update magnitude roughly stable as you change rank, so alpha acts like a fixed gain on the adapter and you don't need to retune the learning rate every time you change r.",
    trap: "A weaker candidate conflates alpha with rank. Rank r sets capacity (parameter count); alpha only rescales the update. Doubling r and doubling alpha are entirely different levers.",
  },
  {
    id: "lora-l1-2",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question:
      "In transformer LoRA fine-tuning, which weight matrices are most commonly targeted, and how are the two LoRA matrices initialized?",
    options: ["Only the embedding tables; both B and A initialized randomly","The layernorm parameters; both initialized to one","The attention projection matrices (often q_proj and v_proj); A is random Gaussian and B is initialized to zero so the initial update is zero","Only the final classification head; both initialized to zero"],
    correct: 2,
    keywords: [],
    explanation:
      "LoRA is typically applied to attention projections (classically q and v, often all of q/k/v/o and MLP layers in practice). B is initialized to zero and A to a random Gaussian, so BA = 0 at step 0 — training starts exactly at the pretrained model and the adapter learns from there.",
    trap: "A weaker answer initializes both matrices randomly. If B were nonzero at init, the model would start with a random perturbation to the pretrained weights, hurting stability. Zero-init of B guarantees a clean starting point.",
  },
  {
    id: "lora-l1-3",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: true,
    type: "mcq",
    question:
      "QLoRA fine-tunes on top of a base model quantized to 4-bit NF4. Which statement correctly describes how the gradients and adapters work?",
    options: ["The 4-bit base weights are updated directly during backprop","Both the base weights and adapters are stored and trained in 4-bit","NF4 quantization is applied only to the LoRA adapters, not the base model","The base stays frozen in 4-bit; gradients flow through the dequantized weights only to update the LoRA adapters, which are kept in higher precision (e.g. bf16)"],
    correct: 3,
    keywords: [],
    explanation:
      "QLoRA keeps the base model frozen in 4-bit NF4 (a normal-float format matched to normally-distributed weights), dequantizes on the fly for the forward/backward pass, and only the small LoRA adapters (in bf16) receive gradient updates. This lets you fine-tune very large models on a single GPU.",
    trap: "A weaker candidate thinks the 4-bit base is being trained. Quantized base weights are never updated — that would destroy precision. Only the higher-precision adapters learn; NF4 + double quantization + paged optimizers just shrink the frozen base's memory footprint.",
  },
  {
    id: "lora-l1-4",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question:
      "After training a LoRA adapter, you can 'merge' it into the base weights. What does merging do and what is the main tradeoff?",
    options: ["It compresses the adapter further; the tradeoff is lower accuracy","It re-quantizes the base model; the tradeoff is longer training","It computes W' = W + (alpha/r)·BA and folds the update into the base weights, giving zero added inference latency but losing the ability to hot-swap adapters","It averages multiple adapters; the tradeoff is higher memory at inference"],
    correct: 2,
    keywords: [],
    explanation:
      "Because ΔW = (alpha/r)·BA is just an additive low-rank update, you can precompute W' = W + ΔW once. The merged model has identical architecture to the base and zero extra inference cost — but you lose the swappable-adapter flexibility and can't cleanly serve many tasks from one base.",
    trap: "A weaker answer claims merging speeds up training. Merging is an inference-time operation; it removes the extra BAx matmul latency at serving time, at the cost of no longer being able to swap adapters on a shared base.",
  },
  {
    id: "lora-l1-5",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: true,
    type: "text",
    question:
      "You fine-tune with LoRA at rank r=4 and the model underfits a hard task. Explain what raising the rank does and the tradeoff it introduces.",
    options: [],
    correct: 0,
    keywords: [
      "capacity",
      "more parameters",
      "expressive",
      "overfit",
      "memory",
      "storage",
      "higher rank",
      "richer update",
      "diminishing returns",
    ],
    explanation:
      "Rank r caps the expressiveness of ΔW = BA (its update can have at most rank r). Raising r increases adapter capacity and parameter count, letting it capture richer updates — at the cost of more memory/storage and higher overfitting risk, with diminishing returns since many tasks need surprisingly low rank.",
    trap: "A weaker answer says 'higher rank is always better.' Beyond the task's intrinsic rank you get diminishing returns and overfitting; the LoRA insight is that the useful update is often very low-rank, so huge r is usually wasteful.",
  },

  // ----- L2 (Cross-concept) -----
  {
    id: "lora-l2-1",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "Compared with full fine-tuning, when is LoRA MOST likely to match full-FT quality rather than fall short?",
    options: [
      "When you are pretraining a model from scratch on a new domain",
      "When adapting to a task whose required weight change is genuinely low-rank / close to the pretrained distribution, e.g. instruction-tuning or style adaptation",
      "When the task requires the model to learn entirely new factual knowledge not present in pretraining",
      "When you have unlimited GPU memory and no storage constraints",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "LoRA constrains updates to be low-rank, so it shines when the needed adaptation is itself low-rank — instruction following, tone/format, task adaptation near the pretrained distribution. Injecting large amounts of new knowledge or big distribution shifts can exceed a low-rank update's capacity, where full FT (or higher rank) may win.",
    trap: "A weaker candidate says LoRA is best for teaching brand-new knowledge because it's 'lightweight.' Lightweight also means limited capacity; heavy new-knowledge injection is exactly where a rank-constrained update is most likely to fall short.",
  },
  {
    id: "lora-l2-2",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "How does LoRA differ fundamentally from prefix-tuning / prompt-tuning as PEFT methods?",
    options: [
      "LoRA modifies the frozen weight matrices with a low-rank additive update, while prefix/prompt tuning leaves weights untouched and instead learns virtual tokens/activations prepended to the input or attention",
      "LoRA and prefix-tuning both inject trainable low-rank matrices directly into the weight matrices, differing only in the rank used",
      "Prefix-tuning updates all weights while LoRA freezes them",
      "Prefix-tuning is strictly more parameter-efficient than LoRA in every setting, since it adds no matrices to the weights at all",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "LoRA injects a trainable low-rank ΔW into weight matrices. Prefix/prompt tuning keeps every weight frozen and instead prepends learnable continuous vectors (virtual tokens / past key-values) that steer attention. Different injection surface: weights vs. activations/context.",
    trap: "A weaker answer says they're the same thing. They act on different surfaces: LoRA changes what the weights compute; prefix-tuning changes what the model attends to. LoRA can be merged into weights with zero latency; prefix tokens consume context/KV cache at inference.",
  },
  {
    id: "lora-l2-3",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: true,
    type: "mcq",
    question:
      "You must fine-tune a 70B model but only have a single 48GB GPU. Rank the options by feasibility and correctness.",
    options: ["Full FT is infeasible (optimizer states + gradients for 70B won't fit); standard LoRA reduces trainable params but still loads the base in 16-bit; QLoRA quantizes the frozen base to 4-bit so the whole job fits","Full fine-tuning is easily feasible; QLoRA is unnecessary overhead","Only prompt-tuning can work; both LoRA and QLoRA require multi-GPU","QLoRA is worse than LoRA here because dequantizing 4-bit weights on every forward pass roughly doubles training-step latency versus bf16 LoRA"],
    correct: 0,
    keywords: [],
    explanation:
      "Full FT of 70B needs hundreds of GB (weights + gradients + Adam states), impossible on 48GB. Plain LoRA cuts trainable params but still holds the base in bf16 (~140GB), still too big. QLoRA's 4-bit NF4 base (~35GB) plus small bf16 adapters is what makes single-GPU fine-tuning of 70B feasible — with minimal quality loss.",
    trap: "A weaker candidate assumes standard LoRA alone solves the memory problem. LoRA shrinks trainable/optimizer memory but NOT the frozen base's footprint — the base still dominates. Quantizing the base (QLoRA) is the missing piece.",
  },
  {
    id: "lora-l2-4",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "Compared with classic bottleneck adapters (inserted MLP layers), what is LoRA's key inference-time advantage?",
    options: ["LoRA's update is a linear low-rank term that can be merged into existing weight matrices, adding zero inference latency, whereas serial adapters insert extra layers that add sequential compute at inference","LoRA and bottleneck adapters both add zero inference latency once inserted","Bottleneck adapters can also be merged losslessly into the base weights, just like LoRA","LoRA requires storing the full base per task while adapters do not"],
    correct: 0,
    keywords: [],
    explanation:
      "Bottleneck adapters add new nonlinear layers in the forward path, so they impose extra sequential compute/latency even after training. LoRA's ΔW = BA is linear and additive, so it folds into W (W' = W + ΔW) with no architectural change and no added latency at inference.",
    trap: "A weaker answer says adapters and LoRA are interchangeable. The mergeability of LoRA (linear, additive) is the differentiator — serial adapters can't be folded into existing weights and keep a latency cost at serving time.",
  },
  {
    id: "lora-l2-5",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: true,
    type: "mcq",
    question:
      "A team reports QLoRA fine-tuning matched their 16-bit LoRA baseline on quality despite the base being 4-bit. Which explanation is most accurate?",
    options: ["The base is only frozen storage; NF4 preserves the weight distribution well, and because trainable adapters are still kept in higher precision (bf16), the model can compensate for quantization error during fine-tuning","4-bit quantization has no effect on the forward pass at all","The adapters are also 4-bit so precision matches end to end","Quality is preserved only because they used a tiny rank r=1"],
    correct: 0,
    keywords: [],
    explanation:
      "NF4 is information-theoretically matched to normally-distributed weights, so quantizing the frozen base loses little. Crucially the trainable LoRA adapters remain in bf16 and are learned ON TOP of the quantized base, so training can absorb residual quantization error — which is why QLoRA closely tracks 16-bit LoRA.",
    trap: "A weaker candidate claims 4-bit is 'free' with no forward-pass effect. There IS quantization error; QLoRA succeeds because the higher-precision adapters are optimized against the already-quantized base and compensate — not because the error is zero.",
  },

  // ===================== RLHF =====================

  // ----- L0 (Define) -----
  {
    id: "rlhf-l0-1",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "What is RLHF (reinforcement learning from human feedback)?",
    options: [
      "Training a model purely by supervised next-token prediction on human-written text",
      "Using human preference judgments to train a reward signal, then optimizing the model with RL to produce outputs humans prefer",
      "A method for compressing models using human-labeled quantization tables",
      "Fine-tuning only the embedding layer on human-annotated data",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "RLHF aligns a model to human preferences: humans rank/compare outputs, those comparisons train a reward model, and the policy (LLM) is optimized with RL (classically PPO) to maximize that reward. It targets qualities like helpfulness and harmlessness that are hard to specify with a fixed loss.",
    trap: "A weaker candidate confuses RLHF with plain supervised fine-tuning. SFT imitates target text with cross-entropy; RLHF optimizes a learned reward via RL, which can push beyond the best single demonstration.",
  },
  {
    id: "rlhf-l0-2",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "What are the three canonical stages of the classic RLHF pipeline, in order?",
    options: ["Pretraining, quantization, distillation","Reward modeling, pretraining, prompt engineering","Supervised fine-tuning (SFT), reward model training, RL optimization (e.g. PPO)","PPO, SFT, evaluation"],
    correct: 2,
    keywords: [],
    explanation:
      "The standard recipe: (1) SFT on demonstrations to get a competent starting policy, (2) collect human preference comparisons and train a reward model, (3) optimize the SFT policy against that reward model with RL (PPO), typically with a KL penalty back to the SFT reference.",
    trap: "A weaker answer puts reward modeling before SFT. You need a reasonable SFT policy first — both to generate the candidate outputs humans compare and to serve as the reference the RL stage is regularized toward.",
  },
  {
    id: "rlhf-l0-3",
    topic: "foundation-models",
    tier: "L0",
    difficulty: "easy", band: "foundational",
    gated: false,
    type: "mcq",
    question: "What is the reward model in RLHF trained to do?",
    options: ["Generate the next token given a prompt","Classify prompts into safe vs. unsafe categories only","Measure the perplexity of the base model","Output a scalar score predicting how much a human would prefer a given response, learned from human preference comparisons"],
    correct: 3,
    keywords: [],
    explanation:
      "The reward model takes a (prompt, response) pair and outputs a scalar preference score. It's trained on human comparisons (typically a Bradley-Terry pairwise loss where the chosen response should score higher than the rejected one), providing the reward signal the RL stage maximizes.",
    trap: "A weaker candidate thinks the reward model generates text. It's a scorer, not a generator — it collapses a response into one number so RL has a differentiable-ish objective standing in for expensive human labels.",
  },

  // ----- L1 (Deep) -----
  {
    id: "rlhf-l1-1",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question:
      "In PPO-based RLHF, the objective adds a KL-divergence penalty between the current policy and the frozen SFT reference. Why?",
    options: ["To speed up gradient computation","To increase the reward model's accuracy during training","To force the policy to exactly reproduce the SFT outputs","To keep the policy from drifting too far from the reference and exploiting/over-optimizing the imperfect reward model (reward hacking), preserving fluency and diversity"],
    correct: 3,
    keywords: [],
    explanation:
      "The reward model is an imperfect proxy for human preference. Without regularization, RL will find degenerate, out-of-distribution outputs that score high on the RM but are bad to humans. A per-token KL penalty to the SFT reference keeps the policy in a trustworthy region, trading some reward for staying sane.",
    trap: "A weaker answer says the KL term forces exact imitation of SFT. It's a soft anchor, not a hard constraint — the policy is allowed to improve on SFT; the KL just penalizes drifting far enough to break the reward model's validity.",
  },
  {
    id: "rlhf-l1-2",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question: "What is 'reward hacking' in RLHF?",
    options: ["The policy discovering outputs that score highly under the reward model but do NOT actually reflect human preferences, exploiting the RM's blind spots","An attacker stealing the reward model weights","The reward model overfitting to the training set of prompts","Using too small a learning rate so reward never increases"],
    correct: 0,
    keywords: [],
    explanation:
      "Because the RM is a learned proxy, the RL optimizer can find adversarial-to-the-proxy behaviors — verbosity, sycophancy, particular formatting, hedging — that inflate the RM score without genuinely being better. This is Goodhart's law: optimizing a proxy hard enough breaks it.",
    trap: "A weaker candidate frames reward hacking as a security exploit. It's an optimization/specification-gaming failure: the policy games an imperfect reward signal, which is why KL penalties, RM ensembles, and re-collecting preferences are used to fight it.",
  },
  {
    id: "rlhf-l1-3",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: true,
    type: "mcq",
    question:
      "PPO uses a clipped surrogate objective. What does the clipping accomplish in the RLHF setting?",
    options: ["It clips the reward model's output to a fixed range","It removes the KL penalty when reward is high","It limits how much the policy probability ratio can change per update, preventing destructively large policy updates and stabilizing training","It truncates generated sequences to a maximum length"],
    correct: 2,
    keywords: [],
    explanation:
      "PPO's clipped objective caps the ratio π_new/π_old within [1−ε, 1+ε] when advantages are involved, so a single update can't push the policy too far and collapse it. Combined with the value/critic estimate of advantages, this gives the stable, sample-reusing updates PPO is known for.",
    trap: "A weaker answer conflates PPO clipping with the KL-to-reference penalty. They're distinct: clipping bounds per-step policy change (trust region); the KL penalty anchors the whole policy to the SFT reference against reward hacking.",
  },
  {
    id: "rlhf-l1-4",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: false,
    type: "mcq",
    question:
      "Why are human preferences usually collected as pairwise comparisons (A vs. B) rather than absolute numeric ratings for training the reward model?",
    options: ["Because humans give more consistent, lower-variance judgments when comparing two responses than when assigning absolute scores, and the Bradley-Terry model turns comparisons into a scalar reward","Because pairwise comparisons require no human labelers","Because absolute ratings cannot be used to train any neural network","Because pairwise data is always cheaper to collect than any rating"],
    correct: 0,
    keywords: [],
    explanation:
      "Absolute 1–10 ratings drift between annotators and over time (calibration noise). Relative comparisons are more reliable, and the Bradley-Terry / logistic preference model converts a dataset of 'chosen > rejected' pairs into a consistent scalar reward function.",
    trap: "A weaker candidate thinks pairwise vs. absolute is just a cost choice. The core reason is measurement quality: comparisons reduce inter-annotator variance, giving a cleaner training signal for the reward model.",
  },
  {
    id: "rlhf-l1-5",
    topic: "foundation-models",
    tier: "L1",
    difficulty: "medium", band: "intermediate",
    gated: true,
    type: "text",
    question:
      "During RLHF the reward keeps climbing but human evaluations get worse (outputs become verbose and sycophantic). Name the phenomenon and two mitigations.",
    options: [],
    correct: 0,
    keywords: [
      "reward hacking",
      "over-optimization",
      "goodhart",
      "kl penalty",
      "kl",
      "early stop",
      "reward model ensemble",
      "recollect preferences",
      "retrain reward model",
      "length penalty",
    ],
    explanation:
      "This is reward over-optimization / reward hacking (Goodhart): the policy exploits the RM proxy. Mitigations include a stronger KL penalty to the SFT reference, early stopping before the RM/human gap diverges, reward-model ensembles, length/format penalties, and re-collecting fresh preference data to patch the exploited blind spots.",
    trap: "A weaker answer just says 'train longer' — that makes it worse. The RM is the flawed proxy; the fix is constraining or correcting the optimization (KL, early stop, better/fresh RM), not pushing reward higher.",
  },

  // ----- L2 (Cross-concept) -----
  {
    id: "rlhf-l2-2",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "Why can't you replace RLHF with SFT alone if you only have human-written 'good' responses?",
    options: ["SFT is computationally impossible for large models","SFT cannot be applied to instruction data","SFT always produces higher KL divergence from the base model","SFT only imitates provided demonstrations and can't learn from negative examples or push beyond the best demonstration; RLHF's preference signal teaches relative quality and lets the policy exceed the demonstrated behavior"],
    correct: 3,
    keywords: [],
    explanation:
      "SFT maximizes likelihood of demonstrations — it has no signal about what makes one response BETTER than another, and no way to learn from rejected outputs. RLHF/preference optimization provides relative feedback (A > B), enabling the model to exceed the average demonstration and to down-weight subtly bad behaviors SFT would happily imitate.",
    trap: "A weaker answer says SFT and RLHF are interchangeable given enough data. SFT's ceiling is its demonstrations; it can't distinguish good-from-better or learn from negatives — exactly the gap preference optimization fills.",
  },
  {
    id: "rlhf-l2-3",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: true,
    type: "mcq",
    question:
      "RLAIF (RL from AI feedback) versus RLHF: what is the core substitution and its main risk?",
    options: ["RLAIF replaces PPO with DPO; the risk is instability","RLAIF removes the reward model entirely; the risk is slower training","RLAIF uses only rule-based rewards; the risk is reward hacking","RLAIF replaces human preference labels with labels generated by an AI model (often guided by a constitution/principles); the main risk is inheriting and amplifying the labeler model's biases and blind spots"],
    correct: 3,
    keywords: [],
    explanation:
      "RLAIF swaps expensive human preference annotation for an AI model producing the preference labels (e.g. Constitutional AI, where a model critiques/ranks responses against written principles). It scales cheaply, but quality is capped by the labeler model — its biases, errors, and blind spots get baked into the reward signal.",
    trap: "A weaker candidate thinks RLAIF changes the RL algorithm. The algorithm (PPO/DPO) is unchanged; the substitution is the SOURCE of the preference labels — human → AI — trading cost/scale for dependence on the AI labeler's judgment.",
  },
  {
    id: "rlhf-l2-4",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: false,
    type: "mcq",
    question:
      "GRPO (Group Relative Policy Optimization) versus PPO in RLHF/reasoning training: what is GRPO's key simplification?",
    options: [
      "GRPO adds a larger critic network than PPO for better value estimates",
      "GRPO drops PPO's separate value/critic network and instead estimates the advantage from the relative rewards of a group of sampled responses to the same prompt, cutting memory and complexity",
      "GRPO removes the KL penalty and the reward model",
      "GRPO only works with human labels, not automatic rewards",
    ],
    correct: 1,
    keywords: [],
    explanation:
      "PPO needs a learned value function (critic) to compute advantages, doubling model memory. GRPO samples a GROUP of responses per prompt and uses their normalized relative rewards as the advantage baseline — no critic. This is memory-cheaper and works well when you can sample many candidates and score them (e.g. verifiable-reward reasoning tasks).",
    trap: "A weaker answer says GRPO just renames PPO. The concrete change is eliminating the critic: advantages come from within-group reward normalization instead of a value network, which is why GRPO scaled well for reasoning-focused RL.",
  },
  {
    id: "rlhf-l2-5",
    topic: "foundation-models",
    tier: "L2",
    difficulty: "hard", band: "advanced",
    gated: true,
    type: "mcq",
    question:
      "For a math/coding task where correctness is checkable, why might a rule-based / verifiable reward (RLVR) be preferred over a learned reward model?",
    options: ["Because a verifiable reward (unit tests pass, answer matches ground truth) is an exact, non-gameable signal, avoiding the reward-hacking failure mode that plagues learned RM proxies","Because learned reward models are always faster to run","Because rule-based rewards require human comparisons at every step","Because RLVR eliminates the need for any policy optimization"],
    correct: 0,
    keywords: [],
    explanation:
      "When correctness is programmatically verifiable, the reward is ground truth, not a proxy — the policy can't inflate it by exploiting RM blind spots. RLVR (reinforcement learning with verifiable rewards) sidesteps reward hacking on exactly the tasks where a learned RM is weakest and most gameable.",
    trap: "A weaker candidate assumes a learned RM is always better because it's 'smarter.' On verifiable tasks a learned RM adds proxy error and hackability; a checkable rule reward is exact. The catch is RLVR only applies where correctness can be automatically checked.",
  },
];
