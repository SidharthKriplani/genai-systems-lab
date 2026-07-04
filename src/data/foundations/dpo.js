// Foundations module — DPO. RUNNER_DATA fragment spread into
// src/data/foundationsRunnerData.js. Keep the export name RUNNER_DPO.
export const RUNNER_DPO = {
  "dpo": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Let's start with what we're even trying to do. We have a model that already writes fluent text, and a pile of human judgments — pairs where a person looked at two answers and said *this one is better than that one.* The goal is to nudge the model so it produces more of the \"better\" kind and less of the \"worse\" kind. Simple to say. The tricky part is *how you push* without breaking what already works.\n\nThe classic recipe, RLHF, does it in two moving pieces. First it trains a second network — a **reward model** — to imitate the human's this-is-better judgments and output a score. Then it uses reinforcement learning (PPO) to make the main model chase high scores from that reward model. It works, but pause on how many things can go wrong: the reward model is only a guess at what humans want, so the main model learns to *game* it (this is \"reward hacking\"), and PPO is a famously twitchy, hard-to-tune training loop. Two fragile parts stacked on top of each other.\n\nHere's the lovely part, and the whole point of this module: **DPO** shows you can throw away *both* of those pieces. No separate reward model, no reinforcement learning — just a single, ordinary supervised training step on those preference pairs. It sounds too good, so we'll earn it slowly: first understand exactly what RLHF's objective is asking for, then watch a small piece of algebra reveal that the reward was hiding inside the model all along.",
    scenario: "Now let's put all of that to work on a real one. Your team has an SFT model and a dataset of human preference pairs (prompt, chosen response, rejected response). A staff engineer proposes classic RLHF: train a reward model, then run PPO. Another engineer pushes back — 'the reward model keeps getting hacked, PPO is unstable, and we've burned two weeks on hyperparameters.' She proposes DPO instead. Take a moment before reading on: given everything above, what exactly is DPO letting her *delete* from the pipeline, and what is she quietly giving up in return? Here's the reasoning, step by step. She can delete both fragile pieces — the reward model and the PPO loop — because the closed-form optimum lets the policy's own log-probability ratio against its frozen starting point *be* the reward, turning the whole thing into one supervised classification loss. That is what buys the simplicity and stability her teammate is frustrated by. But notice what she gives up: DPO is off-policy — it only ever sees the fixed pairs collected once, so if that data is narrow or the reference model is wrong, there is no online correction, and a well-tuned PPO can still edge it out at the frontier.",
    explanation: [
      "Begin from the exact objective preference tuning is trying to solve, because DPO is nothing more than a clever way of solving *this same* objective. Written down, it is: **maximize E[r(x, y)] − β · KL(π_θ(y|x) || π_ref(y|x))**.\n\nIn words: push the policy to produce responses the reward r scores highly, *but* penalize it for drifting away from the reference (frozen SFT) model by β times the KL divergence. ==That KL term is load-bearing — it's what keeps the model on-distribution==, because without it the policy simply chases reward artifacts into gibberish that happens to score high. So the objective always has two forces: chase reward, but stay near where you started.\n\nNow notice *how* classic RLHF actually optimizes this expression: it needs **two moving parts** — a separately-trained reward model to supply r, and PPO to do the maximization. Both are expensive and fragile, which is the whole motivation for wanting something simpler: the reward model is an imperfect proxy that gets **hacked**, and PPO is a sampling-based RL loop that is notoriously sensitive to hyperparameters and can **collapse**. The question DPO asks is therefore sharp: can we hit that *same* objective without either piece?",
      "The answer is a **piece of math, not a new algorithm**, and it starts from a fact about that objective: a KL-constrained reward-maximization has a *known closed-form optimum*. The best possible policy is the reference re-weighted by the exponentiated reward — **π*(y|x) ∝ π_ref(y|x) · exp(r(x,y)/β)**.\n\nThat closed form is only useful if we flip it around, so rearrange it to solve for the reward in terms of the policy: r(x,y) = β · log(π*(y|x)/π_ref(y|x)) + β·log Z(x), where Z(x) is a normalizing constant. Read what just happened — ==the reward is now expressed IMPLICITLY, entirely through the policy's log-probability ratio against the reference.==\n\nWhich means you no longer need a separate network to *represent* the reward at all: the policy itself, compared to its frozen starting point, **IS the reward model**. The first fragile piece has dissolved into algebra.",
      "That implicit-reward expression is what **collapses the whole pipeline** — but only once we connect it to the human data. Preferences are modeled with the Bradley-Terry model: the probability a human prefers y_chosen over y_rejected is the logistic function of the *reward difference*, σ(r(x, y_chosen) − r(x, y_rejected)).\n\nHere's the piece that makes it all tractable. Substitute the implicit reward (the log-ratio expression) into that difference, and because ==the intractable normalizer Z(x) is identical for both responses to the same prompt, it cancels== — it depends on x alone, so it vanishes from any *difference* between two responses to that x.\n\nSo what's left has no reward model and no RL loop in it: a loss you can compute directly from **four forward passes** — chosen and rejected under the current policy, and the same two under the frozen reference. The second fragile piece, PPO, is gone too.",
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
      "Each term earns its place. The **reference model π_ref** is the frozen SFT policy; it appears in both log-ratios and is never updated. It plays the exact role the KL penalty played in RLHF: because the policy is only ever scored by how it moves probability RELATIVE to π_ref, pushing any response's probability too far from the reference is **self-limiting**. Drop the reference (or use a bad one) and the anchor is gone — the policy can drift off the SFT distribution into degenerate text, ==the DPO analogue of reward hacking.==\n\n**β is the temperature on that anchor:** small β (e.g. 0.1) keeps the policy tightly tethered to the SFT model and makes preferences push only gently; large β lets preferences dominate and permits larger deviation from the reference.\n\nToo-large β (or too many epochs) **over-optimizes** — the model sharpens toward whatever the preference set rewarded, often collapsing into short, repetitive, or sycophantic outputs even as the training loss keeps dropping. ==That divergence between falling loss and worsening real quality is the classic DPO over-optimization signature.==",
      "The tradeoffs against RLHF are real and worth stating precisely. DPO is **simpler** (one model, no reward net, no PPO), **stabler** (a supervised classification loss instead of a sampling-based RL loop), cheaper, and reproducible — which is why it became the default for open post-training (Zephyr, much of the Llama/Mistral fine-tune ecosystem).\n\nBut ==DPO is strictly OFF-POLICY:== it learns only from a fixed preference set collected once, with no fresh sampling from the improving policy. PPO-style online RLHF keeps generating new samples and scoring them, so it can explore and correct in regions the static preference data never covered.\n\nThat is why DPO is unusually **sensitive to preference-data quality and coverage**, and to the choice of reference model — garbage or narrow pairs propagate straight into the policy with no online correction. At the frontier, well-tuned online RLHF (or online/iterative DPO variants that re-sample) can still edge out vanilla offline DPO.",
      "DPO also anchors a **family**. **IPO** adds a regularizer to curb the over-optimization DPO is prone to when preferences are near-deterministic. **KTO** drops the need for pairwise data entirely, learning from single thumbs-up/thumbs-down labels using a prospect-theory-style objective — useful when you have unpaired feedback. **ORPO** folds preference optimization INTO the SFT stage and removes the separate reference model, doing alignment in a single pass.\n\nNaming these matters at the staff level: ==the right answer to 'which alignment method' is rarely 'DPO' unconditionally== — it depends on whether your feedback is paired, how much you trust its coverage, and whether you can afford an online loop. The interactive just below lets you turn the β knob and watch the loss curve against real output quality, so you can *feel* the over-optimization signature — and the production case right after it is exactly the decision the two engineers are having: what DPO lets you delete, and what it quietly costs.",
    ],
    keyPoints: [
      "**DPO removes the reward model and PPO entirely.** The KL-constrained RLHF objective has a closed-form optimum, so the reward can be written implicitly as the policy's log-prob ratio against the frozen reference — the policy itself IS the reward model.",
      "**The loss is plain binary cross-entropy on preference pairs:** `−log σ(β·(s_chosen − s_rejected))`, where s is the policy-vs-reference log-ratio. Four forward passes, no RL loop, no sampling.",
      "**The Bradley-Terry normalizer Z(x) cancels** because it's identical for both responses to the same prompt — that cancellation is exactly what makes the loss tractable.",
      "**β is the temperature on the implicit KL anchor.** Small β tethers the policy to the SFT model; large β lets preferences dominate and permits more drift. Too-large β over-optimizes.",
      "**Over-optimization tell: loss falls while quality degrades** into short/repetitive/sycophantic text. Fix with smaller β, fewer epochs, or an IPO-style regularizer.",
      "**DPO is off-policy** — sensitive to preference-data coverage and reference choice; online RLHF can still edge it out at the frontier. IPO/KTO/ORPO are the main variants.",
    ],
    recap: [
      "**DPO = RLHF's optimum, solved in closed form.** Reward expressed implicitly via the policy's log-ratio against a frozen reference — no reward net, no PPO.",
      "**Loss is binary cross-entropy** over `β·(s_chosen − s_rejected)`, a supervised classification objective, not an RL update.",
      "**Z(x) cancels** (identical for both responses to a prompt) — that's what collapses the pipeline to four forward passes.",
      "**β = anchor temperature:** small β stays near SFT, large β lets preferences dominate; too-large β over-optimizes.",
      "**Over-optimization signature:** training loss keeps dropping while real quality collapses (short/repetitive/sycophantic).",
      "**Off-policy limitation:** learns only from fixed pairs; sensitive to data coverage + reference model; online RLHF can win at the frontier. Variants: IPO, KTO, ORPO.",
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
