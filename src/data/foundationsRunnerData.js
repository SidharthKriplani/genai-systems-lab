// src/data/foundationsRunnerData.js — PAL runner content for Foundations tracks (sprint 92c)
// Format per module:
//   scenario: string (2-3 sentences production context)
//   explanation: string[] (array of prose paragraphs)
//   mcq: { question, options: string[], correct: number (0-indexed), explanation: string }
//   takeaway: string (1-2 sentences key insight)
//
// Pilot: Language Models track (10 modules)
// Expand to other tracks in subsequent sprints.

export const RUNNER_DATA = {

  // ── Language Models track ────────────────────────────────────────────────────

  "tokenizer": {
    scenario: "You're debugging a RAG pipeline where long financial documents are being silently truncated. The model keeps missing key clauses near the end of 15-page contracts, producing hallucinated summaries. Your first debugging step is to understand exactly how many tokens your documents consume — and why the number is higher than you expected.",
    explanation: [
      "Tokenization is how raw text becomes the discrete units a language model actually processes. Modern LLMs use Byte Pair Encoding (BPE): a vocabulary-building algorithm that iteratively merges the most frequent character pairs until a target vocabulary size is reached. The result is a vocabulary of subword units, not whole words — so common words like 'the' might be a single token, while rare words like 'collateralized' split into several.",
      "The critical production implication is that token count ≠ word count. English prose averages roughly 0.65–0.75 tokens per word. But code, numbers, and technical content tokenize much less efficiently: a single UUID might be 3–5 tokens; a 10-digit number often tokenizes to 4+ tokens; JSON structure characters (braces, quotes, colons) each consume tokens. A 'four-thousand token context window' may hold far fewer meaningful units of information than you expect.",
      "Different content types have very different token densities. A 1,000-word English article might be ~750 tokens; the same information as a JSON object might be 1,200+ tokens. This is why measuring tokenization for your specific content — not just word count — is essential when engineering context windows, chunking strategies, and prompt templates.",
    ],
    mcq: {
      question: "A 500-word English document typically tokenizes to approximately how many tokens?",
      options: [
        "325–375 tokens (correct estimate for standard English prose)",
        "490–510 tokens (roughly one token per word)",
        "750–800 tokens (more tokens than words due to subword splitting)",
        "1,000–1,200 tokens (tokenizer always expands content significantly)",
      ],
      correct: 0,
      explanation: "Standard English prose averages about 0.65–0.75 tokens per word. A 500-word document typically tokenizes to roughly 325–375 tokens — not 1:1. Code, numbers, and technical content can flip this ratio the other way, exceeding one token per character in the worst case.",
    },
    takeaway: "Tokens ≠ words. Budget your context window in tokens, not words, and always benchmark your actual content type against the tokenizer — financial documents, code, and JSON tokenize very differently from plain English prose.",
  },

  "attention": {
    scenario: "Your team is debugging why a model produces poor extraction quality for key details near the middle of 10K-token documents. A researcher suggests the model may be exhibiting 'attention sink' — where attention mass concentrates on the first and last few tokens. You need to understand the attention mechanism well enough to evaluate whether this diagnosis is plausible and what to do about it.",
    explanation: [
      "Attention is the mechanism that lets every token in a sequence 'look at' every other token to determine relevance. For each position, it computes a query vector (what am I looking for?) against key vectors from every other position (what does each token offer?) to produce attention scores. Those scores are softmaxed into weights, then used to produce a weighted sum of value vectors — the attended representation that gets passed forward.",
      "Self-attention runs in parallel for every position simultaneously. This is what makes Transformers fundamentally more parallelizable than RNNs, which process tokens sequentially. The parallelism is why Transformers scaled: you can throw hardware at the problem. The limitation is that full self-attention scales quadratically with sequence length (O(n²) compute and memory). A 4,096-token sequence has ~16 million attention pairs per layer.",
      "'Attention sink' is a real phenomenon: models trained on causal language modeling often concentrate disproportionate attention mass on the first few tokens (typically token position 0), regardless of their semantic content. This is because the first token is always visible to all subsequent positions, making it a reliable 'sink' for attention mass that doesn't belong to any specific semantic target. Long-document quality issues in the middle of the context are often a combination of this effect and the model's training data distribution (shorter documents being overrepresented).",
    ],
    mcq: {
      question: "Why does full self-attention scale quadratically with sequence length?",
      options: [
        "Each token must compute attention scores against every other token, producing n² attention pairs for n tokens",
        "The embedding dimension doubles at each attention layer as sequence length increases",
        "Tokenization time increases quadratically with longer input sequences",
        "The feed-forward network after attention is quadratic in the vocabulary size",
      ],
      correct: 0,
      explanation: "Self-attention computes a query for each of n tokens against keys from all n tokens: n × n = n² attention pairs per layer. For a 32K-token sequence, that's over 1 billion attention pairs. This is why Flash Attention (a memory-efficient exact implementation) and sparse/linear attention variants exist — to break the quadratic bottleneck.",
    },
    takeaway: "Attention enables context-aware representations by letting every token attend to every other — but quadratic cost is why long-context models are expensive, and why attention sinks cause mid-document quality degradation that isn't about model intelligence.",
  },

  "attention-3d": {
    scenario: "You're presenting multi-head attention to a product team reviewing model interpretability reports. The report references 'attention head 4 in layer 12 attending strongly to entity coreference.' Your team needs an intuition for what this means — without the math — to decide whether the finding is significant enough to act on.",
    explanation: [
      "Multi-head attention runs multiple independent attention computations in parallel on the same input, each with different learned linear projections of the queries, keys, and values. These projections are what the 'head' means: each head projects the input into a different subspace of the embedding dimension, then runs self-attention there. The individual head outputs are concatenated and projected back to the full dimension.",
      "Each head learns to attend to different types of relationships. Research has shown individual heads are often interpretable: some heads track syntactic dependencies (verb-object pairs), some track coreference (pronoun to antecedent), some track positional patterns (next-token prediction), and some track domain-specific signals. This specialization emerges from training, not from explicit design.",
      "When an interpretability report says 'attention head 4 attends strongly to coreference,' it means that specific set of learned projections caused the model to concentrate attention on the token a pronoun refers back to. This is meaningful because it shows the model has encoded linguistic structure, and it tells you something about which parts of the model are handling which tasks — relevant for debugging unexpected failures or planning fine-tuning.",
    ],
    mcq: {
      question: "What is the primary reason for using multiple attention heads rather than one large attention head of the same total dimension?",
      options: [
        "Multiple heads can simultaneously capture different types of relationships (syntactic, semantic, positional) in parallel subspaces",
        "Multiple smaller heads are computationally cheaper than one large head of equivalent total dimension",
        "Each head processes a different segment of the vocabulary, enabling broader token coverage",
        "Multiple heads prevent gradient vanishing in the attention layers of very deep networks",
      ],
      correct: 0,
      explanation: "The total computation is roughly the same regardless of head count for a fixed total dimension. The benefit is representational: each head learns different projection matrices, specializing in different relationship types. One large head can only learn one projection — the multi-head structure allows the model to simultaneously capture multiple types of long-range dependencies.",
    },
    takeaway: "Multi-head attention's value isn't computational — it's representational. Each head specializes in a different type of relationship, which is why Transformer models generalize across tasks and why individual heads appear interpretable in attribution studies.",
  },

  "transformer": {
    scenario: "An engineer on your team proposes 'just add more layers' to improve a model's reasoning quality on complex multi-step questions. You need to probe whether they understand the actual tradeoffs of depth vs. width, and articulate what makes a Transformer block trainable at scale — because their proposal has no compute budget attached.",
    explanation: [
      "The Transformer block repeats a two-part structure: (1) multi-head self-attention → add & layer-norm, and (2) feed-forward network (FFN) → add & layer-norm. The FFN is typically 4× the hidden dimension and applies two linear transformations with a nonlinearity between them — this is where most of the model's 'memory' lives in terms of parameter count. Depth (more layers) increases the model's capacity to compose representations; width (larger hidden dimension) increases expressiveness at each layer.",
      "Residual connections (the 'add' in add & layer-norm) are non-negotiable for training deep networks. Without them, gradients in the backward pass would vanish before reaching early layers, making deep networks untrainable. With residual connections, the gradient highway runs directly from the loss to early layers — each block learns a residual correction to the identity, not the full transformation. This insight, from ResNets, is what made very deep Transformer training feasible.",
      "In production, model size is measured in parameters (weights), which directly determines inference cost and memory footprint. Depth adds inference latency sequentially (layers can't be parallelized — each layer depends on the previous). Width can be partially parallelized across the hidden dimension. This is why scaling laws (Chinchilla) emerged: the optimal depth-width-data tradeoff isn't 'more layers always wins' — it's a specific ratio given a compute budget.",
    ],
    mcq: {
      question: "What is the primary purpose of residual connections (skip connections) in a Transformer?",
      options: [
        "They create a gradient highway through the network, preventing gradient vanishing and enabling training of many layers",
        "They compress the hidden dimension at each layer to reduce overall memory usage",
        "They prevent different attention heads from attending to the same token positions",
        "They normalize the vocabulary distribution to prevent mode collapse during generation",
      ],
      correct: 0,
      explanation: "Residual connections add the input of each block to its output — each block learns a residual correction, not a complete transformation. This creates a direct gradient path from the loss to every layer, preventing the vanishing gradient problem that makes very deep networks untrainable without them. It's the same insight as ResNets applied to language models.",
    },
    takeaway: "Depth isn't free: each Transformer layer adds sequential latency, memory, and training compute. Residual connections make depth trainable. In production, model depth directly determines cost-per-token — 'add more layers' needs a compute budget attached to be a real proposal.",
  },

  "seq-parallel": {
    scenario: "Your team is fine-tuning a model on 32K-token legal documents. Training crashes with OOM on your 8×A100 cluster even with gradient checkpointing enabled. A training engineer proposes sequence parallelism. You need to understand what it actually does — and whether it solves your specific problem or just adds infrastructure complexity.",
    explanation: [
      "Sequence parallelism splits the sequence dimension of the input across multiple devices, allowing the model to process longer contexts than any single device's memory allows. Where tensor parallelism splits the model's weight matrices across devices, sequence parallelism splits the token sequence itself. Each device holds a contiguous slice of the token sequence and processes the attention computation for its slice.",
      "The challenge with sequence parallelism is attention: for causal self-attention, every token needs to attend to all previous tokens. When the sequence is split across devices, tokens on device A need to attend to tokens on device B — requiring cross-device communication (All-Gather or Ring-Attention patterns). Ring Attention is the most efficient approach: devices pass key-value pairs in a ring topology, each device computing its attention slice against each received KV chunk. The communication volume scales linearly with sequence length, not quadratically.",
      "Sequence parallelism solves a specific problem: activation memory during training grows linearly with sequence length for the attention computation. For 32K tokens, the activation checkpointing alone may exceed a single device's memory. Adding more devices with sequence parallelism reduces per-device sequence length linearly — 8 devices = 4K tokens per device. But this adds infrastructure complexity (inter-device communication) and requires frameworks that support it (Megatron-LM, DeepSpeed, Jax pjit). For most teams, increasing per-device memory (A100 80GB → H100 80GB) or reducing sequence length is lower-friction than implementing sequence parallelism.",
    ],
    mcq: {
      question: "What specific problem does sequence parallelism primarily solve during LLM training?",
      options: [
        "It reduces per-device activation memory by splitting the token sequence across devices, enabling training on longer contexts than any single device can hold",
        "It reduces total training FLOPs by allowing devices to skip attention computation for distant tokens",
        "It improves training accuracy by having multiple devices independently process the same sequence and averaging their gradients",
        "It prevents gradient explosion by distributing the backward pass across devices with different learning rates",
      ],
      correct: 0,
      explanation: "Sequence parallelism is a memory solution, not a compute reduction. Activation memory during training scales with sequence length — for 32K+ tokens, it exceeds single-device capacity. Splitting the sequence across devices reduces per-device memory linearly, at the cost of cross-device communication overhead for cross-sequence attention.",
    },
    takeaway: "Sequence parallelism solves per-device activation memory for very long sequences — but adds significant infrastructure complexity. For most teams, it's a last resort after gradient checkpointing, mixed precision, and hardware upgrades. The payoff is only meaningful above ~16K tokens at production fine-tuning scale.",
  },

  "flashattn": {
    scenario: "A cost proposal on your desk says: switch the inference stack from standard attention to Flash Attention 2 to cut memory usage by 5–10× for 16K context windows, with zero accuracy loss. The number sounds too good — you want to understand exactly why this is possible without changing the math, before approving the migration.",
    explanation: [
      "Flash Attention is an IO-aware implementation of exact self-attention that achieves dramatic memory and speed improvements by restructuring how the computation reads and writes GPU memory. Standard attention materializes the full N×N attention matrix (query×key scores) in HBM (high-bandwidth memory) before softmaxing and multiplying by values. For a 16K-token sequence in float16, that's a 16K×16K matrix ≈ 512MB per layer — just for the attention scores.",
      "Flash Attention avoids this by computing attention in tiles. Each tile fits in the GPU's on-chip SRAM (the L1/L2 cache equivalent — fast, but small). The algorithm processes the full N×N computation using the online softmax trick: you can compute the exact softmax-normalized attention output without materializing the full N×N matrix, by iterating over tiles and maintaining running statistics (max and sum of each row). The result is mathematically identical to standard attention — it's an exact, not approximate, algorithm.",
      "The memory improvement comes entirely from this tiling: standard attention's memory usage is O(N²) in N; Flash Attention's is O(N) — it only stores the output (N×d) not the attention matrix (N×N). For N=16K, d=128: standard needs 512MB for attention scores, Flash Attention needs essentially zero extra memory for those scores. The speed improvement comes from reducing HBM bandwidth — reading/writing from SRAM is ~10× faster than from HBM, and the attention computation is heavily memory-bandwidth-bound.",
    ],
    mcq: {
      question: "Why does Flash Attention reduce memory usage without changing the mathematical output of attention?",
      options: [
        "It computes attention in tiles using fast on-chip SRAM, never materializing the full N×N attention matrix in HBM — using the online softmax trick to maintain correctness",
        "It approximates attention by dropping low-weight attention scores below a learned threshold",
        "It quantizes the attention weights to 4-bit precision during the forward pass and dequantizes before the output",
        "It reuses the attention weight matrix from the previous layer instead of recomputing it from scratch",
      ],
      correct: 0,
      explanation: "Flash Attention is not an approximation. The online softmax algorithm computes the exact softmax-normalized output by iterating over tiles and maintaining running row-max and row-sum statistics — producing bit-identical results to standard attention. The memory saving comes from never writing the full N×N matrix to HBM.",
    },
    takeaway: "Flash Attention is not an approximation — it's the same math computed more efficiently. The entire 4× speedup and 10× memory reduction comes from restructuring memory access patterns (tiled SRAM computation vs. full HBM materialization). Understanding this is what separates 'just use FA2' from knowing why it's safe.",
  },

  "sampling": {
    scenario: "A product designer asks why the chatbot sometimes gives very different answers to the same question. You explain temperature. They follow up: 'So setting temperature to 0 always gives the best, most accurate answer, right?' You need to correct this misconception precisely — because they're about to set it as the default for all users.",
    explanation: [
      "Sampling strategy controls how a model converts its output probability distribution over the vocabulary into actual tokens. After the forward pass, the model outputs logits — unnormalized scores for every token in the vocabulary. Temperature scaling divides these logits before the softmax: low temperature (→0) sharpens the distribution, making the highest-probability token dominate; high temperature (→1+) flattens it, making lower-probability tokens more likely to be selected.",
      "Temperature=0 implements greedy decoding: always select the single most likely next token. This produces deterministic output and maximizes per-token likelihood — but this is not the same as maximizing the quality or accuracy of the full response. Complex reasoning tasks often require traversing paths where the globally optimal answer requires lower-probability intermediate steps. Greedy decoding can get locked into a locally likely but globally suboptimal path.",
      "Top-p (nucleus) sampling restricts sampling to the smallest set of tokens whose cumulative probability exceeds p — dynamically adjusting the candidate pool based on how concentrated or spread out the distribution is. Top-k restricts to exactly the k highest-probability tokens. These can be combined with temperature. In practice: temperature 0 with no top-p/k is best for tasks requiring exact consistency (structured output, code, SQL); temperature 0.2–0.7 with top-p 0.9 is a practical default for most text generation; higher temperatures for creative tasks. The right value depends on the task, not a single 'correct' answer.",
    ],
    mcq: {
      question: "A developer sets temperature=0 to 'get the most accurate answers.' What is the key limitation of this approach?",
      options: [
        "Greedy decoding maximizes per-token probability but can miss globally better answers that require lower-probability intermediate tokens — particularly for multi-step reasoning",
        "Temperature=0 is significantly more computationally expensive than higher temperature sampling",
        "Temperature=0 causes the model to repeat the same token indefinitely in a degenerate loop",
        "Temperature=0 only works correctly when combined with top-k sampling; used alone it produces incoherent output",
      ],
      correct: 0,
      explanation: "Temperature=0 (greedy decoding) is deterministic and maximizes per-step likelihood — but 'most likely next token at every step' ≠ 'highest quality complete response.' Chain-of-thought and multi-step reasoning often require the model to commit to a slightly lower-probability token early (e.g., 'Let me think about this differently') that unlocks a much better overall answer. Greedy decoding precludes this.",
    },
    takeaway: "Temperature=0 is not 'most accurate' — it's 'most deterministic.' For consistency-critical tasks (structured extraction, SQL, code), low temperature is right. For reasoning, generation, and anything requiring exploration, slightly elevated temperature (0.2–0.7) often outperforms pure greedy. Document your temperature rationale — undocumented temperature changes silently break production behavior.",
  },

  "nextoken": {
    scenario: "A PM asks why your fine-tuned model 'forgot' general knowledge after domain adaptation on a 5,000-document legal corpus. The model now answers legal questions well but makes basic factual errors it didn't make before fine-tuning. You need to explain this at a mechanism level — and what you'd do differently next time.",
    explanation: [
      "Language models are trained with a single objective: predict the next token given all preceding tokens. This is called the causal language modeling objective (CLM). Every capability the model has — factual recall, reasoning, coding, instruction-following — emerged from this single signal applied across trillions of tokens of text. Pre-training builds broad world knowledge and language understanding because the next token at every position in every document encodes information about the world.",
      "Fine-tuning on a smaller domain corpus continues the exact same CLM objective — but with a much smaller, domain-specific token distribution. Gradient updates are calculated to minimize prediction loss on the domain corpus. These updates modify the same weight matrices that encode general knowledge from pre-training. The optimizer has no mechanism to preserve pre-training knowledge — it just minimizes the fine-tuning loss, overwriting the weight configurations that encoded general knowledge when those weights were useful for domain token prediction. This is catastrophic forgetting.",
      "Parameter-efficient fine-tuning methods (PEFT) like LoRA (Low-Rank Adaptation) address this by freezing most of the pre-trained weights and only training small low-rank update matrices inserted into certain layers. Because most weights don't change, general knowledge is preserved. LoRA typically adds <1% of trainable parameters while achieving fine-tuning performance close to full fine-tuning. This is why PEFT has become the standard approach: it adapts behavior without the catastrophic overwrite problem.",
    ],
    mcq: {
      question: "Why does full fine-tuning on a small domain corpus cause the model to 'forget' pre-trained general knowledge?",
      options: [
        "Gradient updates for domain-specific token prediction overwrite the weight values that encoded general knowledge — the optimizer has no mechanism to preserve prior learning",
        "The model runs out of context window space to 'store' general knowledge once domain content is added",
        "Domain fine-tuning selectively disables the attention heads that handled general-knowledge queries",
        "The learning rate during fine-tuning is automatically set higher than during pre-training, erasing prior gradients",
      ],
      correct: 0,
      explanation: "The optimizer minimizes loss on the fine-tuning corpus and updates weights accordingly, regardless of what those weights encoded during pre-training. There's no loss term for 'preserve general knowledge' — that information simply gets overwritten if the same weights are useful for domain prediction. Parameter-efficient methods (LoRA, adapters) solve this by mostly freezing pre-trained weights.",
    },
    takeaway: "Next-token prediction is both the source of LLM capability and the root of fine-tuning fragility. Full fine-tuning overwrites pre-trained knowledge. The production answer is almost always LoRA or another PEFT method — fine-tune the delta, not the base model.",
  },

  "tempgame": {
    scenario: "Your team is calibrating a customer-facing summarization model for a healthcare company. The accuracy team insists on temperature=0 for clinical consistency; the UX team says responses feel robotic and repetitive to patients. You need to resolve this disagreement with a principled decision — and explain why there's no single universally correct temperature setting.",
    explanation: [
      "Temperature tuning is a calibration problem, not an optimization problem with a single correct answer. The appropriate temperature depends entirely on what the task needs to optimize for. Consistency-critical tasks — where the same question should always produce the same answer, and where accuracy matters more than variety — benefit from low temperature (0.0–0.3). This includes structured output extraction, SQL generation, classification tasks, and any factual lookup. Creative, generative, and open-ended tasks — where diversity, naturalness, and avoiding repetition matter — benefit from higher temperature (0.7–1.0).",
      "Repetition at temperature=0 emerges from a specific failure mode: when no single next token has an overwhelmingly high probability, greedy decoding can get stuck in a loop where the most likely token at each position is a repetition of what was just said. This isn't a 'bug' — it's what greedy decoding looks like when the model is uncertain about what comes next. Top-p sampling (p=0.9) combined with moderate temperature (0.5–0.7) is a practical default that avoids both robotic repetition and incoherence.",
      "For the healthcare scenario: the right resolution is per-use-case calibration, not a global setting. Clinical fact queries (drug interactions, dosing) should use temperature=0 or near-0 with strict output formatting. Patient-facing explanations and summaries benefit from temperature=0.3–0.5 with top-p=0.9 to produce natural, readable prose while maintaining accuracy. Document this decision explicitly — undocumented temperature changes are one of the most common sources of unexplained behavior changes in production.",
    ],
    mcq: {
      question: "For a medical information retrieval task where clinical accuracy and consistency are critical, which sampling configuration is most appropriate?",
      options: [
        "Low temperature (0.0–0.2) to maximize determinism and consistency, accepting that responses may be more formulaic",
        "High temperature (0.9–1.0) to ensure diverse coverage of medical information across multiple conditions",
        "Top-k=1 alone, never combined with temperature control, for guaranteed single-answer outputs",
        "Temperature=0.5 with top-k=5 to balance creativity and accuracy for all medical queries",
      ],
      correct: 0,
      explanation: "For accuracy-critical applications — medical, legal, financial — determinism is more valuable than variety. Low temperature (0.0–0.2) ensures the model consistently selects its highest-confidence output. The 'formulaic' tradeoff is acceptable and often desirable: consistency is a feature, not a bug, for clinical contexts.",
    },
    takeaway: "Temperature is a dial calibrated to the task, not a single global 'correct' setting. Low for accuracy-critical consistency; moderate for natural language quality; higher for creative exploration. Per-use-case calibration is the production answer — document every temperature choice, because silent changes break user trust.",
  },

  "training-signal": {
    scenario: "A customer reports that your model gives highly confident wrong answers on niche financial regulatory questions — specific edge cases that appear in maybe two or three documents in any corpus. A colleague says 'the model doesn't know what it doesn't know.' You need to explain the mechanism of hallucination precisely enough to design a mitigation strategy — not just describe the symptom.",
    explanation: [
      "Language models are trained to predict the next token — not to assess whether they know the answer. The training signal is entirely derived from statistical patterns in text: which tokens typically follow which preceding sequences. When the model encounters a question about a niche regulatory detail that appeared rarely in training data, it doesn't output 'I don't know' because that phrase appeared after such questions far less often than confident-sounding answers did in the training corpus.",
      "The internet — the primary source of pre-training data — is overwhelmingly written by people who are certain of their claims. Confident, fluent prose is what gets published, shared, and included in training corpora. Uncertainty hedges ('I'm not sure, but...', 'this may vary...') are underrepresented. The model learned the statistical pattern of confident language because that's what dominated the training distribution. It produces confident text not because it has reliable knowledge, but because confident text is what it saw most often in contexts similar to the question.",
      "Hallucination on low-frequency knowledge is therefore not a bug — it's the expected output of a next-token predictor trained on human text. Calibrated uncertainty requires explicit training: RLHF and Constitutional AI methods that reward the model for expressing uncertainty appropriately; retrieval augmentation that grounds factual answers in retrieved documents rather than parametric memory; and output calibration techniques that train the model to produce probability estimates that correlate with actual accuracy. Until those are applied, treat model confidence as weakly correlated with factual accuracy for rare topics.",
    ],
    mcq: {
      question: "Why do LLMs produce confident-sounding answers even when they lack reliable knowledge about a niche topic?",
      options: [
        "The pre-training objective rewards accurate next-token prediction — and confident-sounding text was the dominant pattern in training data, so confident output was reinforced throughout training",
        "LLMs are explicitly programmed to avoid expressing uncertainty to prevent user frustration",
        "Uncertainty expression requires more compute than the model allocates for low-frequency topics",
        "The softmax output layer always forces the probability distribution to appear highly peaked, producing apparent confidence regardless of actual knowledge",
      ],
      correct: 0,
      explanation: "Next-token prediction has no 'know vs. don't know' signal — it just optimizes for token-level prediction accuracy on the training corpus. Confident, fluent text was overrepresented in pre-training data; uncertainty hedges were rare. The model learned to generate confident language because that's the statistical pattern it saw. Epistemic calibration requires explicit, targeted training beyond the base pre-training objective.",
    },
    takeaway: "Hallucination is not a failure mode to patch — it's the natural output of a next-token predictor trained on human text. Confident prose is what the internet contains; the model learned to produce it. Calibrated uncertainty requires explicit alignment training (RLHF, retrieval grounding). Until then: treat model confidence as a signal, not a guarantee — especially on low-frequency knowledge.",
  },

};
