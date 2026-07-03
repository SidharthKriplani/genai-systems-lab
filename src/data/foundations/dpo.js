// Foundations module — DPO. RUNNER_DATA fragment spread into
// src/data/foundationsRunnerData.js. Keep the export name RUNNER_DPO.
export const RUNNER_DPO = {
  "dpo": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your team has an SFT model and a dataset of human preference pairs (prompt, chosen response, rejected response). A staff engineer proposes classic RLHF: train a reward model, then run PPO. Another engineer pushes back — 'the reward model keeps getting hacked, PPO is unstable, and we've burned two weeks on hyperparameters.' She proposes DPO instead. You need to explain what DPO actually does differently, why it can drop the reward model and the RL loop entirely, and where it would still lose to PPO.",
    explanation: [
      "Start from what RLHF Stage 3 is actually solving. The RL objective is: maximize E[r(x, y)] − β · KL(π_θ(y|x) || π_ref(y|x)). In words: make the policy produce responses the reward model r scores highly, but penalize it for drifting away from the reference (frozen SFT) model by β times the KL divergence. The KL term is what keeps the model on-distribution — without it, the policy chases reward-model artifacts into gibberish that happens to score high. Classic RLHF solves this with two moving parts: a separately-trained reward model, and PPO to optimize against it. Both are expensive and fragile — the reward model is an imperfect proxy that gets hacked, and PPO is a sampling-based RL loop that is notoriously sensitive to hyperparameters and can collapse.",
      "DPO's insight is a piece of math, not a new algorithm. The RLHF objective above has a known closed-form optimum: the optimal policy π* is the reference policy re-weighted by the exponentiated reward — π*(y|x) ∝ π_ref(y|x) · exp(r(x,y)/β). This equation can be rearranged to solve for the reward in terms of the policy: r(x,y) = β · log(π*(y|x)/π_ref(y|x)) + β·log Z(x), where Z(x) is a normalizing constant. The key move: the reward is now expressed IMPLICITLY through the policy's log-probability ratio against the reference. You no longer need a separate network to represent the reward — the policy itself, compared to its frozen starting point, IS the reward model.",
      "That substitution collapses the whole pipeline. Human preference data is modeled with the Bradley-Terry model: the probability a human prefers y_chosen over y_rejected is the logistic function of the reward difference, σ(r(x, y_chosen) − r(x, y_rejected)). Substitute the implicit reward expression into that. The intractable normalizer Z(x) is identical for both responses to the same prompt, so it cancels. What remains is a loss you can compute directly from four forward passes — chosen and rejected under the current policy and under the frozen reference — with no reward model and no reinforcement learning.",
      { type: "illustration", label: "The DPO loss — a binary cross-entropy over log-ratio differences", content: `The DPO loss — a binary cross-entropy over log-ratio differences

For each preference pair (x, y_chosen, y_rejected):

  s_chosen   = log π_θ(y_chosen  | x) − log π_ref(y_chosen  | x)
  s_rejected = log π_θ(y_rejected| x) − log π_ref(y_rejected| x)

  L_DPO = − log σ( β · (s_chosen − s_rejected) )

Read it plainly:
  • s_chosen  = how much MORE likely the policy makes the good
                answer than the frozen SFT model did.
  • s_rejected = the same, for the bad answer.
  • The loss is minimized when s_chosen ≫ s_rejected — i.e. the
    policy raises the good answer's log-prob and lowers the bad
    one's, both measured RELATIVE to the reference.
  • σ (logistic) + the − log = plain binary cross-entropy. This is
    a standard supervised classification loss, not an RL update.

Worked micro-example (β = 0.1):
  Suppose the policy already prefers the chosen answer:
    s_chosen − s_rejected = +5.0  →  σ(0.1 · 5.0) = σ(0.5) ≈ 0.62
    loss ≈ −log(0.62) ≈ 0.48   (small — little gradient, good)
  A pair the policy gets backwards:
    s_chosen − s_rejected = −5.0  →  σ(−0.5) ≈ 0.38
    loss ≈ −log(0.38) ≈ 0.97   (large — strong corrective gradient)

The reference π_ref appears in BOTH terms and is frozen. It is the
KL anchor: because every score is a ratio against π_ref, the policy
is implicitly penalized for drifting far from the SFT model — the
same KL constraint RLHF enforced explicitly, now baked into the loss.` },
      "Each term earns its place. The reference model π_ref is the frozen SFT policy; it appears in both log-ratios and is never updated. It plays the exact role the KL penalty played in RLHF: because the policy is only ever scored by how it moves probability RELATIVE to π_ref, pushing any response's probability too far from the reference is self-limiting. Drop the reference (or use a bad one) and the anchor is gone — the policy can drift off the SFT distribution into degenerate text, the DPO analogue of reward hacking. β is the temperature on that anchor: small β (e.g. 0.1) keeps the policy tightly tethered to the SFT model and makes preferences push only gently; large β lets preferences dominate and permits larger deviation from the reference. Too-large β (or too many epochs) over-optimizes — the model sharpens toward whatever the preference set rewarded, often collapsing into short, repetitive, or sycophantic outputs even as the training loss keeps dropping. That divergence between falling loss and worsening real quality is the classic DPO over-optimization signature.",
      "The tradeoffs against RLHF are real and worth stating precisely. DPO is simpler (one model, no reward net, no PPO), stabler (a supervised classification loss instead of a sampling-based RL loop), cheaper, and reproducible — which is why it became the default for open post-training (Zephyr, much of the Llama/Mistral fine-tune ecosystem). But DPO is strictly OFF-POLICY: it learns only from a fixed preference set collected once, with no fresh sampling from the improving policy. PPO-style online RLHF keeps generating new samples and scoring them, so it can explore and correct in regions the static preference data never covered. That is why DPO is unusually sensitive to preference-data quality and coverage, and to the choice of reference model — garbage or narrow pairs propagate straight into the policy with no online correction. At the frontier, well-tuned online RLHF (or online/iterative DPO variants that re-sample) can still edge out vanilla offline DPO.",
      "DPO also anchors a family. IPO adds a regularizer to curb the over-optimization DPO is prone to when preferences are near-deterministic. KTO drops the need for pairwise data entirely, learning from single thumbs-up/thumbs-down labels using a prospect-theory-style objective — useful when you have unpaired feedback. ORPO folds preference optimization INTO the SFT stage and removes the separate reference model, doing alignment in a single pass. Naming these matters at the staff level: the right answer to 'which alignment method' is rarely 'DPO' unconditionally — it depends on whether your feedback is paired, how much you trust its coverage, and whether you can afford an online loop.",
    ],
    mcqs: [
      {
        question: "Why does DPO not require a separately-trained reward model, unlike classic PPO-based RLHF?",
        options: [
          "DPO uses a much larger preference dataset, so a reward model becomes statistically unnecessary",
          "The optimal RLHF policy has a closed-form relationship to the reward, so the reward can be expressed implicitly as a scaled log-probability ratio of the policy against the frozen reference — the policy itself acts as the reward model",
          "DPO freezes the policy and only trains the reward model, then discards it at inference",
          "DPO replaces the reward model with a rule-based scoring function written by human annotators",
        ],
        correct: 1,
        explanation: "The core DPO derivation shows the optimal policy under the KL-constrained RLHF objective satisfies π*(y|x) ∝ π_ref(y|x)·exp(r(x,y)/β), which rearranges to r(x,y) = β·log(π_θ(y|x)/π_ref(y|x)) + β·log Z(x). The reward is thus expressed implicitly through the policy's log-ratio against the reference, so no separate reward network is needed. Option B is correct. Option A is wrong — dataset size is not the mechanism; even with the same preference set, the elimination of the reward model comes from the closed-form reward-policy relationship, not data volume. Option C reverses the setup — DPO trains the policy, not a reward model; the reference (which is frozen, not the reward model) is what stays fixed. Option D is wrong — DPO does not substitute a hand-written rule-based scorer; the reward is learned implicitly through the policy's own probabilities, and the human preferences enter through the pairwise loss, not a rules engine.",
      },
      {
        question: "In the DPO loss L = −log σ(β · (s_chosen − s_rejected)), where s is the log-ratio of policy to reference, what does the coefficient β control?",
        options: [
          "The learning rate of the optimizer, replacing the need to tune it separately",
          "How strongly preferences push the policy versus how tightly it stays anchored to the reference (SFT) model — small β keeps it close to the reference, large β lets preferences dominate and permits larger drift",
          "The number of preference pairs sampled per training step",
          "The temperature applied to the model's output softmax at inference time",
        ],
        correct: 1,
        explanation: "β is the temperature on the implicit KL anchor. Because every score is a ratio against the frozen reference, β scales how hard the preference signal pushes relative to staying near π_ref. Small β (e.g. 0.1) keeps the policy tightly tethered to the SFT model; large β lets preferences dominate and permits larger deviation. Option B is correct. Option A is wrong — β is not the optimizer learning rate; they are distinct hyperparameters, and β specifically governs the reference-anchoring strength inside the loss. Option C is wrong — β does not set batch or pair count; it is a scalar inside the loss, unrelated to sampling. Option D is wrong — β is a training-time coefficient on the log-ratio difference, not an inference-time softmax temperature.",
      },
      {
        question: "A DPO-trained model started producing short, repetitive, and sycophantic responses even though its training loss kept decreasing smoothly. What is the most likely cause?",
        options: [
          "The reference model was updated alongside the policy, so the KL anchor tracked the drift",
          "Over-optimization — β too large or too many epochs sharpened the policy toward whatever the preference set rewarded, drifting off the SFT distribution while loss kept falling (falling loss, worsening real quality is the classic DPO over-optimization signature)",
          "The Bradley-Terry normalizer Z(x) failed to cancel, injecting noise into every gradient",
          "DPO cannot represent short responses, so the model defaulted to them",
        ],
        correct: 1,
        explanation: "This is DPO over-optimization. When β is too large or training runs too long, the policy over-sharpens toward the preference set and drifts off the SFT distribution — collapsing into short/repetitive/sycophantic text even as the classification loss keeps improving. The tell is exactly this divergence: loss falling while real quality degrades. The fix is stronger anchoring (smaller β, fewer epochs, or an IPO-style regularizer). Option B is correct. Option A is wrong — the reference must stay frozen; if it were being updated the anchor would be broken, but the described symptom (loss falling, quality dropping) is the standard over-optimization pattern, and a moving reference would more likely destabilize the loss itself. Option C is wrong — Z(x) provably cancels because it is identical for both responses to the same prompt; that cancellation is exact, not a source of noise. Option D is wrong — DPO has no inability to represent short responses; the collapse toward them is a symptom of over-optimization, not a representational limit.",
      },
      {
        question: "When would you still prefer online PPO-based RLHF over offline DPO, despite DPO's simplicity and stability?",
        options: [
          "When you want to avoid tuning any hyperparameters at all",
          "When your preference data is small and low quality, since DPO always outperforms PPO in that regime",
          "When you need fresh on-policy exploration — PPO keeps sampling from the improving policy and scoring new outputs, correcting in regions a fixed offline preference set never covered, which can edge out DPO at the frontier",
          "When you have only single thumbs-up/thumbs-down labels instead of preference pairs",
        ],
        correct: 2,
        explanation: "DPO is strictly off-policy: it learns from a fixed preference set with no fresh sampling, so it cannot explore or correct in regions the static data never covered. Online PPO keeps generating and scoring new samples from the improving policy, letting it self-correct — which is why well-tuned online RLHF can still win at the frontier. Option C is correct. Option A is wrong — PPO is notoriously MORE hyperparameter-sensitive than DPO; you would not pick it to avoid tuning. Option B is wrong — with small, low-quality data, DPO's lack of online correction makes it MORE fragile, not guaranteed to win; the claim that DPO always outperforms PPO there is false. Option D describes the use case for KTO (unpaired binary feedback), not a reason to choose PPO — PPO also typically consumes a reward model trained on comparisons, not raw single labels.",
      },
    ],
    takeaway: "DPO exploits the closed-form optimum of the KL-constrained RLHF objective to express the reward implicitly through the policy's log-probability ratio against a frozen reference — collapsing reward-model training plus PPO into one supervised binary-cross-entropy loss on preference pairs. It is simpler, stabler, and cheaper, with β controlling how hard preferences push versus staying anchored to the SFT model. But it is off-policy: sensitive to preference-data quality and the reference model, prone to over-optimization (falling loss, degrading quality), and can be edged out by online RLHF at the frontier. IPO/KTO/ORPO are the main variants.",
  },
};
