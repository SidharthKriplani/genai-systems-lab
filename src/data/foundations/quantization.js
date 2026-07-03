// Foundations module — Quantization. RUNNER_DATA fragment spread into
// src/data/foundationsRunnerData.js. Keep the export name RUNNER_QUANTIZATION.
export const RUNNER_QUANTIZATION = {
  "quantization": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your team fine-tuned a Llama-3 70B model that hits quality targets but needs to serve it on a single A100 80GB — fp16 weights alone are 140GB, so it won't even load. An engineer quantizes it to int4 with a one-line bitsandbytes flag. It loads, smoke tests pass, and it ships. A week later, support escalates: multi-step arithmetic and structured JSON generation have collapsed on real customer traffic, even though the demo looked fine. You need to understand quantization deeply enough to know what went wrong and choose the right method.",
    explanation: [
      "A model's parameters are just numbers, and the precision you store them in is a free variable. Training happens in fp16 or bf16 — 2 bytes per parameter. That precision was necessary during training to accumulate tiny gradient updates without underflow. But at inference you're only doing a forward pass; you don't need 16 bits of dynamic range to multiply a weight by an activation. Quantization exploits this: store each weight in fewer bits, and the model still runs — just with a lossier representation of each number. The core question is how much precision you can strip before the model's behavior degrades, and the answer depends heavily on which method you use and which bits you're targeting.",
      "The reason to care is pure memory arithmetic, and it's the same arithmetic that decides which GPU a model fits on. Parameter count times bytes-per-parameter equals weight memory. fp16 is 2 bytes; int8 is 1 byte; int4 is 0.5 bytes. That linear scaling is the entire value proposition — halve the bit-width, halve the VRAM, and a model that needed a multi-GPU node now fits on one card.",
      { type: "illustration", label: "VRAM by precision (70B model) and which GPU it fits", content: `Weight memory = num_params × bytes_per_param

70B model:
  fp16  (2 bytes)   →  70e9 × 2    = 140 GB   →  needs 2× A100 80GB (won't fit on one)
  int8  (1 byte)    →  70e9 × 1    =  70 GB   →  fits on 1× A100 80GB (with headroom for KV cache)
  int4  (0.5 bytes) →  70e9 × 0.5  =  35 GB   →  fits on 1× A100 40GB, or leaves ~45GB for KV/batching on 80GB

Smaller models, same math:
  13B fp16 → 26 GB   int4 → 6.5 GB  (fits a 24GB consumer 4090)
  7B  fp16 → 14 GB   int4 → 3.5 GB  (fits an 8GB laptop GPU)

Note: this is WEIGHTS only. Activations + KV cache add on top — int4 weights
are what create the headroom to actually batch requests and hold long contexts.` },
      "Quantization splits into two families by when it happens. Post-Training Quantization (PTQ) takes an already-trained fp16 model and compresses the weights afterward — no gradient updates, no training loop. It runs in minutes to hours on a single GPU and needs only a small calibration set. This is what you reach for 95% of the time. Quantization-Aware Training (QAT) instead simulates the quantized (lower-precision) forward pass during training or fine-tuning, so the optimizer learns weights that are robust to the rounding error. QAT recovers more quality at very low bit-widths but costs a full training run and a labeled dataset. The decision rule: use PTQ unless you're pushing below 4-bit or PTQ has measurably failed your evals; only then is QAT's training cost justified.",
      "Within PTQ, the naive method is round-to-nearest (RTN): map each weight to the closest representable value on a uniform int grid, scaled per-tensor or per-channel. This is what a one-line int4 flag often does, and it's exactly where the scenario's failure comes from. RTN treats every weight as equally important and every error as equally tolerable. Both assumptions are false. A handful of weight channels — the ones multiplied by large-magnitude 'outlier' activations that transformers reliably produce — dominate the layer's output. Rounding those channels crudely injects error that propagates and compounds across dozens of layers. int8 has enough grid resolution (256 levels) that this rarely bites, which is why int8 RTN is usually near-lossless. int4 has only 16 levels, so crude rounding of the salient channels is catastrophic — precisely for multi-step tasks where per-layer error accumulates over a long reasoning chain. The smoke test passed because single-step lookups tolerate the noise; multi-step arithmetic collapsed because errors compound.",
      "The smart int4 methods exist to solve exactly this. GPTQ quantizes weights one layer at a time and, critically, uses second-order information (an approximation of the Hessian of the layer's reconstruction loss) to decide the rounding. Instead of rounding each weight to its nearest grid point independently, GPTQ rounds one weight, then adjusts the remaining not-yet-quantized weights in the same layer to compensate for the error it just introduced — minimizing the layer's output error, not the per-weight error. AWQ (Activation-aware Weight Quantization) takes a different route: it observes that a small fraction of weight channels are salient (they multiply the large activations), and it protects them by scaling those channels up before quantization so the rounding grid resolves them finely, then scales the activations down to compensate — mathematically equivalent output, but the important channels survive int4. Both keep quality near-lossless at int4 where RTN fails. NF4 (4-bit NormalFloat, from bitsandbytes/QLoRA) uses a non-uniform grid whose levels are spaced to match the roughly-normal distribution of neural network weights — more grid points where weights are dense (near zero), fewer in the sparse tails — which is information-theoretically optimal for normally-distributed data and is the standard base for QLoRA fine-tuning.",
      { type: "illustration", label: "The int8-vs-int4 quality cliff and why method choice matters", content: `Grid resolution:
  int8 → 2^8  = 256 levels   (fine grid; RTN error is small)
  int4 → 2^4  =  16 levels   (coarse grid; rounding is brutal)

Quality on domain evals (typical, relative to fp16 baseline):
  int8 RTN          ~99–100%   → near-lossless, ship it, no special method needed
  int4 RTN (naive)  ~60–85%    → smoke test passes, reasoning/arithmetic COLLAPSES
  int4 GPTQ         ~97–99%    → second-order error compensation saves it
  int4 AWQ          ~97–99%    → salient-channel protection saves it
  int4 NF4          ~97–99%    → optimal grid for weight distribution (QLoRA base)
  below 4-bit (int3/int2) → degrades fast even WITH smart methods

Why the cliff: outlier activations mean a few channels carry most of the signal.
  256 levels tolerates crude rounding of those channels.
   16 levels does not — you MUST protect them (AWQ) or compensate (GPTQ).` },
      "Weight quantization is only one lever, and for long-context serving it's often not the binding one. The KV cache — the stored keys and values for every past token — grows linearly with sequence length and concurrency, and at long contexts it can exceed the weights in memory. KV-cache quantization (FP8 or int8 KV) is a separate, orthogonal decision: you can run int4 weights with FP8 KV, or fp16 weights with int8 KV. It matters because it's what lets you hold a 32K-token context or batch more concurrent users on the same card after you've already quantized weights. The KV cache is generated at runtime and is more sensitive than weights to precision loss in some regimes, so FP8 (which preserves dynamic range better than int8 at the same bit count) is often preferred there. Treat weight-bits and KV-bits as two independent knobs on the memory budget.",
      "The final decision is a three-way tradeoff — accuracy vs. memory vs. latency — and quantization is not always the right tool. If a smaller model (e.g., a 13B) already meets quality, just use it: you avoid the quantization risk entirely and often get lower latency. If you need the 70B's capability but can't afford its footprint, distillation (train a small model to mimic the big one's outputs) can beat quantization on latency but costs a training pipeline and a distillation dataset. Quantization wins when you must preserve the exact trained model's behavior and only need to shrink its footprint. And the single most under-appreciated failure mode is the calibration set: PTQ methods (GPTQ/AWQ) estimate activation statistics from a small calibration corpus. If that corpus doesn't match production traffic — e.g., you calibrate on generic English but serve code and multilingual queries — the quantizer protects the wrong channels, and you get a model that passes smoke tests on the calibration-like distribution but tanks on the real one. Calibration-set representativeness is a correctness requirement, not a detail.",
    ],
    mcqs: [
      {
        question: "A 70B model was quantized to int4 with a one-line round-to-nearest (RTN) flag. Smoke tests (single-fact lookups) pass, but multi-step arithmetic and structured JSON generation collapse in production. What is the most accurate explanation?",
        options: [
          "int4 halves the parameter count, so the model literally has fewer weights and cannot represent complex reasoning",
          "A few salient weight channels — the ones multiplied by large 'outlier' activations — dominate each layer's output, and int4's 16-level grid rounds them so crudely that the error compounds across layers, breaking long reasoning chains while single-step lookups tolerate the noise",
          "int4 quantization silently disabled the model's attention layers, which are required for arithmetic but not for lookups",
          "The smoke tests ran in fp16 while production ran in int4, so the two were never comparing the same model",
        ],
        correct: 1,
        explanation: "Option B is correct: transformers produce large-magnitude outlier activations, and the weight channels those activations multiply carry a disproportionate share of the layer's output. int4 has only 16 grid levels, so RTN rounds those salient channels crudely, injecting error that propagates and compounds over dozens of layers. Multi-step tasks accumulate that error across a long chain and collapse; single-step lookups tolerate a bit of noise, which is why the smoke test passed. Option A is wrong — quantization changes the PRECISION of each weight (bytes per parameter), not the NUMBER of parameters; a 70B int4 model still has 70B weights. Option C is wrong — quantization uniformly lowers precision across weights; it does not selectively disable attention layers, and there is no mechanism by which int4 turns off attention. Option D is a distractor describing a testing process error; the described symptom (reasoning collapse specifically on multi-step tasks) is the signature of int4 RTN outlier damage, not a fp16-vs-int4 test mismatch.",
      },
      {
        question: "Given the int4-RTN failure above, an engineer needs to keep the exact 70B model but restore quality at 4-bit. Which fix targets the actual mechanism?",
        options: [
          "Re-quantize with AWQ or GPTQ — AWQ scales up and protects the salient channels before rounding, GPTQ uses second-order (Hessian) information to compensate for rounding error across the layer — because both preserve the outlier-driven channels that plain RTN destroys",
          "Switch from int4 to int3 to give the quantizer a simpler grid to reason about",
          "Raise the sampling temperature at inference so the model explores more reasoning paths and recovers accuracy",
          "Keep int4 RTN but increase the KV-cache precision to FP8, since the KV cache is where multi-step reasoning is stored",
        ],
        correct: 0,
        explanation: "Option A is correct: the failure is crude rounding of salient, outlier-multiplied channels. AWQ protects those channels by scaling them into a finer part of the grid before quantizing; GPTQ uses an approximation of the layer's Hessian to round one weight and then compensate with the remaining weights, minimizing the layer's output error rather than per-weight error. Both directly counter the RTN mechanism and hold quality near fp16 at int4. Option B is wrong and backwards — int3 is COARSER (8 levels) than int4 (16 levels); dropping below 4-bit degrades faster, it doesn't help. Option C is wrong — temperature changes sampling randomness, not the numerical error baked into the quantized weights; a wrong intermediate computation is wrong regardless of temperature. Option D is wrong — KV-cache precision is a separate lever for serving long contexts/concurrency; it does not store or repair reasoning, and it leaves the damaged int4 weights untouched.",
      },
      {
        question: "A team uses AWQ int4 and calibrates the quantizer on a corpus of generic English prose. The model passes their internal evals but degrades badly in production, where real traffic is mostly source code and multilingual queries. What is the root cause?",
        options: [
          "AWQ is incompatible with code and non-English text and should never be used for those domains",
          "The calibration set was unrepresentative of production traffic, so AWQ estimated activation statistics from the wrong distribution and protected the wrong salient channels — the model looks fine on calibration-like inputs but fails on the real distribution",
          "int4 cannot represent the tokens used in code and multilingual text, so those inputs overflow the grid",
          "The model needed QAT rather than PTQ purely because the domain was code, independent of the calibration data",
        ],
        correct: 1,
        explanation: "Option B is correct: PTQ methods like AWQ and GPTQ estimate which channels are salient from activation statistics measured on a calibration corpus. If that corpus (generic English) doesn't match production (code + multilingual), the estimated statistics are wrong, the wrong channels get protected, and the quantized model passes evals on calibration-like data while tanking on the real distribution. Calibration-set representativeness is a correctness requirement. Option A is wrong — AWQ works fine on code and multilingual data when calibrated on representative samples of that data; the method isn't domain-incompatible, the calibration set was mismatched. Option C is wrong — quantization lowers the precision of WEIGHTS; it does not restrict which tokens or scripts the model can process, and there is no per-token grid overflow mechanism. Option D is wrong — the fix here is fixing the calibration set (add code and multilingual samples), not necessarily switching to QAT; QAT's training cost is only justified below 4-bit or after PTQ with a proper calibration set has failed.",
      },
      {
        question: "A serving team already runs a model at int4 weights on an 80GB GPU, but at 32K-token contexts with high concurrency they hit out-of-memory errors. Weight quantization is already maxed out. What is the correct next lever?",
        options: [
          "Re-quantize the weights to int3 to free more memory for context",
          "Quantize the KV cache (FP8 or int8 KV) — it grows linearly with sequence length and concurrency and can exceed the weights at long contexts, so shrinking it is an orthogonal knob from weight precision",
          "Distill the model to a smaller one, since KV-cache size is fixed by the model and cannot be reduced at serving time",
          "Increase weight precision back to int8 to reduce total memory pressure",
        ],
        correct: 1,
        explanation: "Option B is correct: the KV cache stores keys and values for every past token and grows linearly with sequence length and batch size, so at 32K contexts under concurrency it can rival or exceed the weight memory. KV-cache quantization (FP8/int8 KV) is a separate, orthogonal lever from weight-bit quantization — you can pair int4 weights with FP8 KV to reclaim exactly the long-context/concurrency memory that's overflowing. Option A is wrong — int3 weights degrade quality fast and, more to the point, the memory pressure here is from the KV cache (which scales with context length), not the weights. Option C is wrong on two counts: KV-cache size is NOT fixed — it can be quantized, paged, or windowed at serving time — and distillation is a heavier, training-based intervention than needed. Option D is wrong — going from int4 back to int8 INCREASES weight memory (0.5→1 byte per param), making the OOM worse, not better.",
      },
    ],
    takeaway: "Quantization trades precision for memory linearly (fp16 2B → int8 1B → int4 0.5B per param), and which GPU a model fits on falls straight out of that math. int8 is near-lossless with plain rounding; int4 needs outlier-aware methods (AWQ/GPTQ/NF4) or it silently breaks multi-step reasoning while passing smoke tests. Treat weight-bits and KV-cache-bits as independent knobs, and always calibrate PTQ on a corpus that matches production traffic — a mismatched calibration set is a correctness bug, not a detail.",
  },
};
