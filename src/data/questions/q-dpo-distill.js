// L0/L1/L2 question ladders — DPO + distillation. Spread into PREP_QUESTIONS.
export const Q_DPO_DISTILL = [
  // ============================================================
  // DPO — L0 (Define) — easy
  // ============================================================
  {
    id: "dpo-l0-1",
    topic: "dpo",
    tier: "L0",
    difficulty: "easy",
    gated: false,
    type: "mcq",
    question: "What does DPO (Direct Preference Optimization) train a language model on?",
    options: [
      "Pairs of preferred vs. rejected responses to the same prompt",
      "A single gold reference completion per prompt via cross-entropy",
      "Scalar reward labels emitted by a separately trained reward model",
      "Unlabeled web text using next-token prediction",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "DPO optimizes directly on preference pairs (a chosen and a rejected response for the same prompt). It reparameterizes the RLHF objective so the policy itself encodes the reward, eliminating the need to train a reward model or run RL.",
    trap: "Confusing DPO with SFT: SFT uses single gold completions with cross-entropy; DPO needs a preferred/rejected *pair* and a preference loss.",
  },
  {
    id: "dpo-l0-2",
    topic: "dpo",
    tier: "L0",
    difficulty: "easy",
    gated: false,
    type: "mcq",
    question: "What key component of the classic RLHF pipeline does DPO remove?",
    options: [
      "The explicit reward model and the online RL (PPO) loop",
      "The supervised fine-tuning (SFT) stage",
      "The reference/frozen policy model",
      "The human preference annotations",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "DPO's central claim is that you can skip training a separate reward model and skip the online PPO rollout loop entirely, replacing both with a single supervised-style classification loss over preference pairs. It still uses SFT (as the starting/reference model) and still needs human preference data.",
    trap: "DPO does NOT remove the reference model — it still needs a frozen pi_ref. It also still needs preference labels; it just uses them differently.",
  },
  {
    id: "dpo-l0-3",
    topic: "dpo",
    tier: "L0",
    difficulty: "easy",
    gated: false,
    type: "text",
    question:
      "In one sentence: what is the 'reference model' (pi_ref) in DPO and why is it there?",
    options: [],
    correct: 0,
    keywords: ["frozen", "SFT", "reference", "KL", "regularize", "anchor", "drift", "policy"],
    explanation:
      "pi_ref is a frozen copy of the initial (usually SFT) policy. It appears in the DPO loss as the denominator of the log-ratio log(pi_theta / pi_ref), acting as a KL anchor that penalizes the trained policy for drifting too far from the base model, preventing reward hacking / degenerate outputs.",
    trap: "The reference isn't an oracle of 'correct' answers — it's a KL regularizer/anchor. Forgetting it (or letting it update) breaks the derivation and lets the policy collapse.",
  },

  // ============================================================
  // DPO — L1 (Deep) — medium
  // ============================================================
  {
    id: "dpo-l1-1",
    topic: "dpo",
    tier: "L1",
    difficulty: "medium",
    gated: false,
    type: "mcq",
    question:
      "The DPO loss is derived from the KL-constrained RLHF objective. What is the closed-form optimal policy that makes DPO possible?",
    options: [
      "pi*(y|x) = (1/Z(x)) · pi_ref(y|x) · exp(r(x,y)/beta)",
      "pi*(y|x) = softmax(r(x,y)) independent of pi_ref",
      "pi*(y|x) = pi_ref(y|x) · sigmoid(r(x,y))",
      "pi*(y|x) = argmax_y r(x,y) (greedy under the reward)",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Maximizing E[r] − beta·KL(pi || pi_ref) has the closed-form optimum pi*(y|x) = (1/Z(x))·pi_ref(y|x)·exp(r(x,y)/beta). Inverting this gives r(x,y) = beta·log(pi*/pi_ref) + beta·log Z(x). The intractable Z(x) cancels in the Bradley-Terry preference difference, which is the trick that yields a tractable loss.",
    trap: "The optimal policy is a reweighting of pi_ref by exp(r/beta), NOT an independent softmax over rewards. The partition function Z(x) matters — its cancellation is the whole point.",
  },
  {
    id: "dpo-l1-2",
    topic: "dpo",
    tier: "L1",
    difficulty: "medium",
    gated: true,
    type: "mcq",
    question:
      "In DPO the reward is 'implicit.' What is the implicit reward that the policy encodes?",
    options: [
      "r_hat(x,y) = beta · log( pi_theta(y|x) / pi_ref(y|x) )",
      "r_hat(x,y) = log pi_theta(y|x)",
      "r_hat(x,y) = beta · KL( pi_theta || pi_ref )",
      "r_hat(x,y) = pi_theta(y|x) − pi_ref(y|x)",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Rearranging the closed-form optimum, the reward is r(x,y) = beta·log(pi_theta/pi_ref) + beta·log Z(x). Since Z(x) is a per-prompt constant that cancels in a preference comparison, the model's *implicit reward* for a completion is beta·log(pi_theta(y|x)/pi_ref(y|x)). DPO never materializes a reward model — the reward lives inside the policy's log-ratio.",
    trap: "The implicit reward is the beta-scaled log-RATIO to the reference, not the raw log-prob and not the KL. Dropping pi_ref (using just log pi_theta) is the classic error.",
  },
  {
    id: "dpo-l1-3",
    topic: "dpo",
    tier: "L1",
    difficulty: "medium",
    gated: false,
    type: "mcq",
    question:
      "Written out, the DPO loss for a pair (y_w preferred, y_l rejected) is L = −log sigmoid( beta·[ log(pi_theta(y_w)/pi_ref(y_w)) − log(pi_theta(y_l)/pi_ref(y_l)) ] ). What does this objective push the model to do?",
    options: [
      "Increase the implicit-reward margin: raise the log-ratio of y_w relative to y_l",
      "Maximize the absolute probability of y_w regardless of y_l",
      "Minimize the entropy of the policy over all tokens",
      "Match the token distribution of y_w exactly via cross-entropy",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "DPO is a Bradley-Terry logistic loss on the *difference* of implicit rewards. It increases the margin beta·(r_hat(y_w) − r_hat(y_l)), i.e., it makes the winner's log-ratio-to-reference exceed the loser's. It's relative, not absolute — a known side effect is that pi_theta(y_w) can actually decrease as long as pi_theta(y_l) decreases faster.",
    trap: "DPO is relative. It optimizes a margin, not the absolute likelihood of the chosen response — both chosen and rejected log-probs often drop; only the gap must grow.",
  },
  {
    id: "dpo-l1-4",
    topic: "dpo",
    tier: "L1",
    difficulty: "medium",
    gated: false,
    type: "mcq",
    question: "What role does the hyperparameter beta play in DPO?",
    options: [
      "It controls the strength of the KL constraint to pi_ref — smaller beta allows larger deviation from the reference",
      "It is the learning rate for the policy optimizer",
      "It is the temperature applied to the reference model's logits",
      "It sets the fraction of rejected samples used per batch",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "beta is the KL-regularization coefficient inherited from the RLHF objective E[r] − beta·KL(pi||pi_ref). Large beta keeps the policy tightly bound to pi_ref (conservative, small updates); small beta lets it deviate more to chase preferences (more expressive but higher risk of drift/degeneration). Typical values are ~0.1–0.5.",
    trap: "beta is a KL/temperature-like knob on divergence from the reference — NOT the optimizer learning rate. Large beta = more conservative, not more aggressive.",
  },
  {
    id: "dpo-l1-5",
    topic: "dpo",
    tier: "L1",
    difficulty: "medium",
    gated: true,
    type: "mcq",
    question:
      "A practitioner notices that during DPO training both the chosen and rejected completions' log-probabilities are steadily dropping. What is the most accurate read?",
    options: [
      "Expected behavior: DPO optimizes a margin, so absolute likelihoods can fall as long as the chosen/rejected gap grows — but a large drop risks degenerate/short outputs and is why variants add an SFT/likelihood term",
      "A clear bug: chosen log-prob must always increase under DPO",
      "The reference model is being updated during training",
      "beta has been set to zero, disabling the loss",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Because DPO only constrains the *difference* of implicit rewards, gradient descent can satisfy the loss by pushing both log-probs down while widening the gap. Mild cases are normal; severe cases correlate with degenerate outputs, which is exactly why variants like DPO-with-NLL, RPO, or CPO add an explicit likelihood/SFT term to anchor the chosen response's absolute probability.",
    trap: "Falling chosen log-prob is not automatically a bug — it's a documented DPO failure mode. The fix is anchoring absolute likelihood, not asserting it 'must' rise.",
  },

  // ============================================================
  // DPO — L2 (Cross-concept) — hard
  // ============================================================
  {
    id: "dpo-l2-1",
    topic: "dpo",
    tier: "L2",
    difficulty: "hard",
    gated: false,
    type: "mcq",
    question:
      "Compared with RLHF-via-PPO, what is DPO's core structural difference — and the tradeoff that comes with it?",
    options: [
      "DPO is offline/off-policy on a fixed preference set (stable, simple, cheap) but cannot explore new samples or use a reward model to score fresh on-policy generations the way PPO can",
      "DPO uses online rollouts while PPO is fully offline, so DPO is slower but more exploratory",
      "DPO requires a separately trained reward model whereas PPO does not",
      "DPO and PPO are mathematically identical and differ only in code",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "PPO is online/on-policy: it samples from the current policy and scores with a reward model, enabling exploration but adding instability, tuning burden, and compute. DPO is offline: it fits a logistic loss to a fixed preference dataset — far simpler and more stable, but it can only learn from the distribution already in the data and can drift on prompts unlike those pairs. This motivates online/iterative DPO variants.",
    trap: "Reversed roles: PPO (not DPO) is the online one that needs a reward model. DPO's weakness is no exploration / distribution-limited, not 'needs a reward model.'",
  },
  {
    id: "dpo-l2-2",
    topic: "dpo",
    tier: "L2",
    difficulty: "hard",
    gated: false,
    type: "mcq",
    question:
      "When would you choose SFT over DPO, and DPO over SFT? Pick the sharpest characterization.",
    options: [
      "SFT teaches the format/behavior from gold demonstrations and is the prerequisite base; DPO refines *preferences* (which of two valid answers is better) and typically runs on top of an SFT checkpoint",
      "DPO replaces SFT entirely; you never need demonstrations once you have preferences",
      "SFT and DPO both require preference pairs, so the choice is arbitrary",
      "DPO is for pretraining and SFT is for alignment",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "SFT maximizes likelihood of gold completions — it bootstraps capability and format and produces the very checkpoint DPO uses as its reference. DPO then sharpens along the preference axis (helpfulness, style, safety) where 'better vs. worse' matters more than a single gold answer. In practice it's SFT then DPO, not one instead of the other.",
    trap: "DPO doesn't replace SFT — it usually *depends* on it (pi_ref is the SFT model). Treating them as substitutes is the mistake.",
  },
  {
    id: "dpo-l2-3",
    topic: "dpo",
    tier: "L2",
    difficulty: "hard",
    gated: true,
    type: "mcq",
    question:
      "IPO and KTO are DPO-family alternatives. What problem are they primarily addressing relative to vanilla DPO?",
    options: [
      "IPO adds a squared-loss regularizer to curb DPO's tendency to overfit deterministic preferences (drive the margin to infinity); KTO drops the need for paired data, learning from unpaired 'good/bad' labels via a prospect-theory utility",
      "Both simply change beta to a larger value",
      "IPO switches DPO to an online RL loop; KTO trains a separate reward model",
      "They are alternate names for the same DPO loss",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "IPO (Identity Preference Optimization) notes that when preferences are near-deterministic, the DPO sigmoid loss keeps pushing the margin toward infinity and overfits; it replaces the log-sigmoid with a bounded squared objective. KTO (Kahneman-Tversky Optimization) removes the paired-data requirement, using unpaired binary desirable/undesirable signals with a human-utility (prospect-theory) formulation — cheaper labeling.",
    trap: "IPO is about overfitting/margin blow-up on deterministic prefs; KTO is about unpaired data. Neither adds an online loop or a separate reward model.",
  },
  {
    id: "dpo-l2-4",
    topic: "dpo",
    tier: "L2",
    difficulty: "hard",
    gated: false,
    type: "text",
    question:
      "Name two concrete situations where DPO tends to fail or underperform, and briefly why.",
    options: [],
    correct: 0,
    keywords: [
      "distribution shift",
      "off-policy",
      "out of distribution",
      "reward hacking",
      "likelihood drop",
      "degenerate",
      "noisy labels",
      "overfit",
      "deterministic",
      "coverage",
      "beta",
      "verbosity",
      "length",
    ],
    explanation:
      "Common failure modes: (1) Distribution shift / off-policy data — the preference pairs come from a different policy than the one being trained, so DPO's offline gradients don't cover the model's own outputs, hurting generalization (motivating iterative/online DPO). (2) Absolute-likelihood collapse — because DPO optimizes a margin, chosen log-probs can fall, yielding degenerate/short/repetitive text. Others: noisy or near-deterministic labels causing margin blow-up (IPO's target), and length/verbosity exploitation when longer answers correlate with 'chosen.'",
    trap: "A generic 'DPO fails on hard prompts' answer misses the mechanism. The real failure modes are off-policy/coverage gaps and margin-driven likelihood collapse.",
  },
  {
    id: "dpo-l2-5",
    topic: "dpo",
    tier: "L2",
    difficulty: "hard",
    gated: false,
    type: "mcq",
    question:
      "Team has a well-tuned reward model, ample compute, and wants best-in-class alignment with online exploration. Team B wants a cheap, stable, reproducible alignment run on an existing preference dataset. Which assignment fits?",
    options: [
      "Team A → PPO/online RLHF (exploits reward model + exploration); Team B → DPO (offline, no RM, stable)",
      "Team A → DPO; Team B → PPO",
      "Both teams should use SFT only",
      "Both teams should use PPO regardless of their constraints",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "PPO shines when you already have a trustworthy reward model and can afford the rollout/tuning cost to explore beyond the fixed dataset — it can squeeze out top alignment quality. DPO is the pragmatic default when you have preference pairs and want simplicity, stability, and lower cost without standing up an RL loop. The choice is driven by reward-model quality, compute budget, and need for exploration.",
    trap: "Don't reflexively pick DPO as 'always better.' With a strong reward model + compute + exploration needs, online PPO can still win; DPO's edge is simplicity/stability/cost.",
  },

  // ============================================================
  // DISTILLATION — L0 (Define) — easy
  // ============================================================
  {
    id: "distillation-l0-1",
    topic: "distillation",
    tier: "L0",
    difficulty: "easy",
    gated: false,
    type: "mcq",
    question: "What is the core idea of knowledge distillation?",
    options: [
      "Train a smaller 'student' model to mimic a larger 'teacher' model's outputs",
      "Compress model weights by rounding them to fewer bits",
      "Remove low-magnitude weights to make the network sparse",
      "Increase the training-set size by paraphrasing existing examples",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Distillation transfers knowledge from a large, capable teacher into a smaller/cheaper student by training the student to reproduce the teacher's behavior — classically its soft output distribution rather than only hard labels.",
    trap: "Distillation is not quantization (bit-rounding) or pruning (weight removal). Those compress the same model; distillation trains a different, smaller model to imitate.",
  },
  {
    id: "distillation-l0-2",
    topic: "distillation",
    tier: "L0",
    difficulty: "easy",
    gated: false,
    type: "mcq",
    question:
      "In classic Hinton-style distillation, what does the student learn from that plain hard-label training does not provide?",
    options: [
      "The teacher's soft target distribution — the full probabilities over all classes ('dark knowledge')",
      "The teacher's exact weight matrices copied layer by layer",
      "A larger learning rate schedule",
      "Only the single top-1 predicted label of the teacher",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "The value is in the teacher's *soft targets*: the relative probabilities assigned to wrong classes (e.g., a '7' looks a bit like a '1') encode similarity structure — 'dark knowledge' — that one-hot labels throw away. The student learns this richer signal.",
    trap: "Using only the teacher's top-1 label is just relabeling; the point of soft-target distillation is the whole probability vector, not the argmax.",
  },
  {
    id: "distillation-l0-3",
    topic: "distillation",
    tier: "L0",
    difficulty: "easy",
    gated: false,
    type: "text",
    question:
      "In one sentence: what is the 'temperature' T used for in distillation?",
    options: [],
    correct: 0,
    keywords: ["soften", "logits", "softmax", "T", "temperature", "smooth", "dark knowledge", "sharpen"],
    explanation:
      "Temperature T divides the logits before the softmax (softmax(z/T)), softening the distribution so small probabilities on non-target classes become visible. A higher T reveals more of the teacher's dark knowledge; T=1 recovers the normal softmax.",
    trap: "T>1 SOFTENS (spreads out) the distribution; it doesn't sharpen it. And it's applied to both teacher and student during the soft-loss term, then removed at inference.",
  },

  // ============================================================
  // DISTILLATION — L1 (Deep) — medium
  // ============================================================
  {
    id: "distillation-l1-1",
    topic: "distillation",
    tier: "L1",
    difficulty: "medium",
    gated: false,
    type: "mcq",
    question:
      "The standard distillation loss combines two terms. What are they?",
    options: [
      "A soft-target term: KL divergence between softened student and teacher distributions at temperature T; plus a hard-target term: cross-entropy with the true labels",
      "MSE on raw logits plus L2 weight decay only",
      "Contrastive loss between student and teacher embeddings only",
      "Only the KL divergence to the teacher — true labels are never used",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "The classic objective is L = alpha·T²·KL(student_T || teacher_T) + (1−alpha)·CE(student, y_true). The first term (at temperature T) transfers the teacher's soft knowledge; the second grounds the student on ground-truth labels. alpha weights the two.",
    trap: "Hard labels usually still matter — dropping the CE term entirely often hurts. And the soft term is KL on temperature-softened distributions, not plain logit MSE.",
  },
  {
    id: "distillation-l1-2",
    topic: "distillation",
    tier: "L1",
    difficulty: "medium",
    gated: true,
    type: "mcq",
    question:
      "Why is the soft-target (KL) loss multiplied by T² in Hinton's formulation?",
    options: [
      "Softening logits by 1/T shrinks the soft-loss gradients by ~1/T²; multiplying by T² restores their magnitude so the soft and hard terms stay comparably weighted",
      "T² converts KL divergence into cross-entropy",
      "It cancels the temperature applied to the student at inference time",
      "It is an arbitrary constant with no gradient justification",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Dividing logits by T scales the gradient of the soft-target term by roughly 1/T². Without correction, raising T would silently down-weight the distillation signal relative to the hard-label term. Multiplying the soft loss by T² rescales the gradients back so the balance between soft and hard objectives is preserved across temperatures.",
    trap: "T² is a deliberate gradient-magnitude correction, not a formatting constant. Omit it and the soft-loss contribution scales with T in a way that breaks the alpha balance.",
  },
  {
    id: "distillation-l1-3",
    topic: "distillation",
    tier: "L1",
    difficulty: "medium",
    gated: false,
    type: "mcq",
    question:
      "Match the distillation *granularity* to its description.",
    options: [
      "Response-level = match final output distribution; feature-level = match intermediate hidden states/attention; sequence-level = match teacher's generated token sequences (esp. for seq2seq/LLMs)",
      "Response-level = copy weights; feature-level = quantize; sequence-level = prune",
      "All three are identical and differ only in learning rate",
      "Feature-level = match final outputs; response-level = match hidden states",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Response/logit-level distillation matches the teacher's output distribution. Feature/intermediate distillation (e.g., FitNets, hidden-state or attention matching as in TinyBERT/DistilBERT) aligns internal representations for a richer signal. Sequence-level distillation (Kim & Rush) trains the student on the teacher's *generated* sequences — important for autoregressive/seq2seq models where token-level matching alone is weak.",
    trap: "Feature-level matches internal states, not outputs. Response-level is the outputs. Sequence-level is about matching generated sequences, not per-token soft labels only.",
  },
  {
    id: "distillation-l1-4",
    topic: "distillation",
    tier: "L1",
    difficulty: "medium",
    gated: false,
    type: "mcq",
    question:
      "Alpaca and Orca are examples of which distillation style for LLMs?",
    options: [
      "Synthetic-data (black-box) distillation: generate instruction/response data from a strong teacher, then SFT the student on those generations — no logits needed",
      "Feature-level distillation matching every hidden layer of the teacher",
      "Logit-level KL distillation requiring full access to the teacher's output probabilities",
      "Pure quantization of the teacher's weights to 4-bit",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Alpaca distilled instruction-following by generating instruction/response pairs from a strong teacher (self-instruct style) and fine-tuning a smaller base model on them. Orca went further, distilling richer 'explanation traces'/reasoning from the teacher. Both are black-box: they use only the teacher's *text outputs*, not its logits or hidden states — which is what you're forced into when the teacher is API-only.",
    trap: "This is black-box, text-only distillation — you don't need (and usually can't get) the teacher's logits. It's really teacher-generated-data SFT, distinct from soft-label KL distillation.",
  },
  {
    id: "distillation-l1-5",
    topic: "distillation",
    tier: "L1",
    difficulty: "medium",
    gated: true,
    type: "mcq",
    question:
      "Why can a student distilled on teacher soft targets sometimes generalize better than the same student trained on hard labels alone?",
    options: [
      "Soft targets carry inter-class similarity ('dark knowledge') and act as a label-smoothing-like regularizer, giving a richer, lower-variance gradient signal per example",
      "Soft targets increase the number of training examples",
      "Soft targets always make the student larger than the teacher",
      "Soft targets remove the need for any ground-truth data at all",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "A teacher's softened distribution encodes how classes relate (which wrong answers are 'close'), providing more information per sample than a one-hot label. This behaves like an informed label smoothing / regularizer, reducing overfitting and often improving generalization of the compact student — sometimes near or matching teacher accuracy at a fraction of the cost.",
    trap: "It's not about more data or dropping ground truth — it's the extra *information per example* (relative class probabilities) that helps, functioning like a smart regularizer.",
  },

  // ============================================================
  // DISTILLATION — L2 (Cross-concept) — hard
  // ============================================================
  {
    id: "distillation-l2-1",
    topic: "distillation",
    tier: "L2",
    difficulty: "hard",
    gated: false,
    type: "mcq",
    question:
      "Distillation, quantization, and pruning all shrink deployment cost. What most sharply distinguishes them?",
    options: [
      "Distillation trains a new smaller model to imitate a teacher (changes architecture/params); quantization reduces numerical precision of existing weights/activations; pruning removes weights/structures from the existing model",
      "All three reduce numerical precision; only the bit-width differs",
      "Distillation and pruning are identical; quantization is unrelated",
      "Quantization trains a new model while distillation only rounds weights",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "They operate at different levels. Distillation creates a distinct, typically smaller student trained to match a teacher's behavior. Quantization keeps the same architecture but lowers precision (e.g., FP16→INT8/INT4). Pruning keeps the same base but zeroes/removes weights or structures (heads, channels). They're complementary and often stacked (e.g., distill then quantize).",
    trap: "These are orthogonal, stackable techniques operating on different axes — not variants of the same 'reduce precision' idea. Only quantization touches numerical precision.",
  },
  {
    id: "distillation-l2-2",
    topic: "distillation",
    tier: "L2",
    difficulty: "hard",
    gated: false,
    type: "mcq",
    question:
      "How does distillation differ from ordinary fine-tuning, even though both can update a small model on teacher-generated data?",
    options: [
      "Fine-tuning adapts a model to a task using ground-truth/gold labels; distillation's supervision signal is the *teacher's outputs* (soft distributions or generated text), transferring the teacher's behavior — synthetic-data distillation is the special case where the two look similar",
      "Distillation never uses gradient descent; fine-tuning does",
      "Fine-tuning requires a teacher model; distillation does not",
      "They are the same thing under different names",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Fine-tuning supervises with human/gold labels for a target task. Distillation supervises with a teacher's signal — either soft logit distributions (white-box) or teacher-generated data (black-box, e.g., Alpaca). The overlap is precisely synthetic-data distillation: you SFT (fine-tune) the student on teacher-produced examples, so the mechanics resemble fine-tuning while the knowledge source is the teacher.",
    trap: "The distinction is the *source of the target signal* (teacher vs. gold labels), not the optimizer. Black-box distillation blurs the line but is still teacher-sourced.",
  },
  {
    id: "distillation-l2-3",
    topic: "distillation",
    tier: "L2",
    difficulty: "hard",
    gated: true,
    type: "mcq",
    question:
      "Black-box (synthetic-data) distillation vs. white-box (logit/soft-label) distillation — what's the key tradeoff?",
    options: [
      "Black-box needs only the teacher's text outputs (works on API-only teachers, simpler) but loses the fine-grained soft-probability signal; white-box uses teacher logits/hidden states for a richer signal but requires full model access",
      "Black-box requires the teacher's weights; white-box only needs text outputs",
      "White-box is always cheaper and strictly better",
      "They produce identical students given the same data",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "White-box distillation matches the teacher's full output distribution (and optionally hidden states/attention), a dense signal — but you must be able to read the teacher's logits/internals. Black-box distillation only sees the teacher's generated text (top outputs), so it's the only option for API-gated teachers and is simpler, but it discards the per-token probability structure that carries dark knowledge.",
    trap: "Black-box uses only outputs (no weights/logits); white-box needs logits/internals. Neither is universally better — access constraints usually force the choice.",
  },
  {
    id: "distillation-l2-4",
    topic: "distillation",
    tier: "L2",
    difficulty: "hard",
    gated: false,
    type: "mcq",
    question:
      "There is a tension in choosing teacher/student sizes. What is the well-documented pitfall of using an extremely large teacher for a very small student?",
    options: [
      "A capacity gap: too-large a teacher can produce targets the tiny student cannot match, sometimes hurting transfer — intermediate 'teacher assistant' models or smaller teachers can distill better",
      "Larger teachers always distill better with no downside",
      "The student's parameter count must exactly equal the teacher's",
      "Distillation quality is independent of the teacher's accuracy",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "The capacity/knowledge gap problem: a hugely more capable teacher may output distributions the small student lacks the capacity to represent, degrading transfer. Techniques like Teacher-Assistant Knowledge Distillation (TAKD) insert intermediate-sized models to bridge the gap. So teacher quality helps only up to the point where the student can absorb it.",
    trap: "'Bigger teacher = better student' is false past the capacity gap. The best teacher for a tiny student is often a moderately larger one, not the biggest available.",
  },
  {
    id: "distillation-l2-5",
    topic: "distillation",
    tier: "L2",
    difficulty: "hard",
    gated: false,
    type: "mcq",
    question:
      "You must ship a 1B-param model to edge devices with a fixed latency budget and have access to a strong 70B teacher (weights available) plus a labeled task set. What compression strategy is most defensible?",
    options: [
      "Distill the 70B teacher into the 1B student (soft targets + task labels, possibly feature-level), THEN quantize the distilled student to hit the latency/memory budget — combine complementary techniques",
      "Only quantize the 70B model to 1-bit and hope it fits",
      "Only prune the 70B model until it has 1B params, ignoring the teacher signal",
      "Fine-tune the 1B model on labels alone and ignore the teacher entirely",
    ],
    correct: 0,
    keywords: [],
    explanation:
      "Distillation and quantization are complementary: distill first to move capability into the small architecture (using the teacher's soft signal plus your task labels, optionally intermediate-feature matching), then quantize the compact student for the last mile of latency/memory. Aggressively quantizing or pruning a 70B model to edge size in one shot typically loses far more quality than a distill-then-quantize pipeline; ignoring the teacher wastes a strong signal.",
    trap: "Don't rely on a single technique to make a 70x jump. The strong move is stacking: distill for capability transfer, then quantize for the deployment budget.",
  },
];
