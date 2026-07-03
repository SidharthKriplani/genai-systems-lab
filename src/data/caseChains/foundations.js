// L2 case chains — Foundations domain.
// Schema documented in src/data/caseChains.js (the aggregator). Keep the export
// name FOUNDATIONS_CASE_CHAINS; the aggregator imports it by that name.
export const FOUNDATIONS_CASE_CHAINS = [
  {
    id: "chain-adapting-base-model-degrades",
    domain: "foundations",
    subtopic: "tokenization → long-context → fine-tuning → quantization",
    level: "staff",
    type: "casechain",
    title: "Adapting a base model to a specialist domain — chase the degradation down four layers",
    context: [
      "Team is adapting an open 8B base model to a specialist domain: medical-device firmware review. Inputs are long files mixing prose, C code, hex register maps, and numeric part IDs (e.g. 0x1F4A, part 74HC595-Q1).",
      "Base model scores 71% on an internal domain eval. The plan: fine-tune on 12k curated review transcripts, then quantize to int4 for on-prem GPUs with limited VRAM.",
      "Context window is 8k tokens. Prompts pack a system instruction, a retrieved spec sheet, the code diff to review, and the question — in that order.",
      "The chat template (special tokens: <|system|>, <|user|>, <|assistant|>) is applied by hand-rolled string concatenation, not the tokenizer's apply_chat_template. Nobody has audited the token stream.",
    ],
    steps: [
      {
        symptom: "The base model reasons well on prose questions but falls apart on anything touching the hex maps and part numbers — and half the long files get silently truncated.",
        evidence: [
          "Tokenizing a representative 3,000-word firmware file: 6,900 tokens. The same file's prose-only sections are ~1,100 tokens; the hex/register/part-number sections balloon to ~5,800 tokens for a fraction of the characters.",
          "A single part ID like 74HC595-Q1 becomes 9 tokens; 0x1F4A becomes 6 tokens (‹0›‹x›‹1›‹F›‹4›‹A›). BPE never saw these strings often enough to merge them.",
          "Because packed prompts exceed 8k, the loader truncates from the end — the code diff and the actual question are being cut off before the model sees them.",
          "A trace shows the model answering about the spec sheet (which survived at the front) while ignoring the diff (truncated away).",
        ],
        question: "Reasoning collapses specifically on hex/numeric-heavy inputs and long files truncate. What is the first structural suspect?",
        options: [
          { id: "a", text: "The base model is too small for firmware review — jump straight to fine-tuning to teach it the domain" },
          { id: "b", text: "BPE fragmentation: domain jargon, hex literals, and part numbers shred into many sub-word tokens, inflating token count 3–5×; long files blow the 8k budget and get truncated, and the model reasons over character-level fragments instead of coherent identifiers" },
          { id: "c", text: "The context window is simply too small — the only fix is a model with a bigger window" },
          { id: "d", text: "The GPU is dropping tokens under memory pressure at inference time" },
        ],
        correct: "b",
        finding:
          "BPE tokenizers merge byte-pairs that were frequent in pretraining. General-web corpora contain little firmware notation, so '0x1F4A' and '74HC595-Q1' never earned merged tokens — they fall back to near-character-level splits. This does two kinds of damage. First, cost/length: the same information consumes 3–5× the tokens, so a file that 'looks' short overruns the 8k window and the end-truncating loader silently discards the diff and the question — which is exactly why the model answers about the surviving spec sheet. Second, reasoning: an identifier the model should treat as one atomic symbol arrives as six disconnected fragments, so it cannot reliably track or compare register values. This is not a model-size problem (option a) or purely a window-size problem (option c) — a bigger window would still waste 5× the tokens and still fragment the identifiers.",
        whatsTested: "Whether you recognise tokenization as an upstream determinant of both cost/truncation AND reasoning quality — the most-missed foundations root cause — rather than reflexively reaching for a bigger model or window.",
        antiPattern: "Fine-tuning first to 'teach the domain.' You would fine-tune on the same fragmented token stream, baking the fragmentation into the adapter and paying 5× the token cost forever — treating a representation problem as a knowledge problem.",
        seniorFraming: "A staff engineer audits the token stream before touching weights: measure tokens-per-domain-file, inspect how key identifiers tokenize, and fix the template with apply_chat_template. If a class of tokens dominates the budget, consider vocabulary extension / added special tokens for the domain notation — the cheapest lever by far.",
        consequence:
          "You switch to the tokenizer's apply_chat_template (the hand-rolled concatenation had been double-emitting <|system|> and mis-placing a turn boundary), add domain tokens for common hex/part patterns, and reorder so the diff and question are never the ones truncated. Token counts drop ~40%, truncation stops, hex reasoning recovers. But a new failure appears: on genuinely long files that now DO fit, the model consistently ignores a critical constraint buried in the middle of the prompt.",
      },
      {
        symptom: "Files fit now, yet the model reliably misses a key constraint when it sits in the MIDDLE of a long prompt — and it got worse after someone extended context to 32k.",
        evidence: [
          "A/B on 20 long-file reviews: when the safety constraint is placed near the start or the very end of the prompt, the model honours it ~90% of the time. When the identical constraint sits in the middle (spec sheet → CONSTRAINT → long diff → question), it's honoured ~45% of the time.",
          "The constraint text and the model are unchanged between conditions — only its position moves.",
          "To 'fix' capacity, an engineer extended the 8k model to 32k by simply increasing max positions without adjusting RoPE. Perplexity on long inputs rose and mid-context recall got worse, not better.",
          "Attention-weight inspection: on the failing cases, almost no probability mass lands on the middle segment; it concentrates on the first and last blocks.",
        ],
        question: "Position — not content — decides whether the constraint is obeyed, and naive context extension made it worse. Why?",
        options: [
          { id: "a", text: "The constraint is written too weakly — reword it more forcefully and the model will attend to it wherever it sits" },
          { id: "b", text: "'Lost in the middle': transformer attention is U-shaped over long contexts (primacy + recency), so mid-prompt information gets low attention mass; and extending context by bumping max positions without RoPE scaling pushes inference onto positions the model never trained on, degrading long-range attention further" },
          { id: "c", text: "The model has a hard 8k limit and anything beyond it is random — so 32k can never work" },
          { id: "d", text: "The diff after the constraint is overwriting it in the KV cache" },
        ],
        correct: "b",
        finding:
          "Two positional effects compound here. First, empirically, decoder attention over long contexts is U-shaped: tokens at the start (primacy) and end (recency) receive disproportionate attention mass, and material in the middle is under-attended — the 'lost in the middle' effect. Burying a hard constraint in the middle is therefore the worst possible placement, which the position-swap A/B isolates cleanly (same text, only position changes). Second, the naive 32k extension: RoPE encodes position as rotation frequencies learned over the training range. Increasing max positions without scaling those frequencies (position interpolation / NTK-aware scaling) evaluates the model at rotation angles it never saw, so long-range attention degrades and perplexity climbs. Rewording (option a) can't beat a positional prior; the 8k model isn't hopelessly capped (option c) — it just needs proper RoPE scaling; and the KV cache isn't overwriting anything (option d).",
        whatsTested: "Whether you know that attention has positional biases that make placement a first-class design variable, and that context extension is a RoPE-scaling problem — not a matter of raising a max-length integer.",
        antiPattern: "Cranking the max-position limit to 32k (or higher) with no position interpolation to 'get more room.' You degrade the very long-range attention you were trying to buy, and still leave the mid-context constraint under-attended.",
        seniorFraming: "A staff engineer treats prompt position as load-bearing: put hard constraints where attention is strongest (top and, ideally, restated at the very end), and reorder so the question and constraints bracket the long payload. If real context extension is needed, use position interpolation / NTK-aware RoPE scaling with a short continued-pretraining pass — not a bare max-length bump.",
        consequence:
          "You reorder prompts so constraints sit at the head and are restated at the tail, and back out the naive extension in favour of properly-scaled RoPE. Mid-context constraint adherence climbs from ~45% to ~88%. Now the domain gap is the ceiling — so the team runs the planned fine-tune. Post-fine-tune, domain eval rises, but the model has lost general instruction-following and refuses/derails on ordinary requests it used to handle.",
      },
      {
        symptom: "Fine-tuning lifted the domain score but the model got dumber everywhere else — it now mangles simple formatting, ignores system prompts, and sometimes emits raw training-transcript boilerplate.",
        evidence: [
          "Full-parameter fine-tune on 12k firmware transcripts at a high LR for 3 epochs. Domain eval 71% → 84%. But a general instruction-following suite dropped 79% → 52%.",
          "First attempt before that used a LoRA adapter at rank r=2; it barely moved the domain eval (71% → 73%) — clearly underfitting the domain shift.",
          "The team then swapped to full-FT to 'get real capacity,' which is when general ability collapsed.",
          "The 12k transcripts are pure demonstrations (SFT), with no preference/ranking signal. On subjective 'which review is better?' judgments the model is confidently mediocre.",
        ],
        question: "LoRA r=2 underfit, but full-FT caused broad regression. What is the correct read of the adapter/objective choice?",
        options: [
          { id: "a", text: "Fine-tuning inherently trades general ability for domain skill — accept the 52% and ship" },
          { id: "b", text: "Two separate mistakes: r=2 lacked the rank capacity to absorb the domain shift (underfit), while full-FT at a high LR overwrote pretrained general circuits (catastrophic forgetting). The fix is a right-sized LoRA (e.g. r=16–32) at a conservative LR — enough capacity without touching base weights; and for subjective quality, SFT alone is the wrong objective — you need a preference stage (DPO)" },
          { id: "c", text: "The dataset is too small — collect 120k transcripts and full-FT will stop forgetting" },
          { id: "d", text: "Raise the learning rate further so the domain signal dominates and overwrites the noise" },
        ],
        correct: "b",
        finding:
          "The two failures are opposite ends of the same capacity dial. LoRA injects a low-rank update ΔW = BA of rank r; at r=2 the adapter simply doesn't have enough directions to represent the domain shift, so it underfits (71%→73%). Jumping to full-parameter FT at a high LR gives plenty of capacity but updates every weight — including the pretrained circuits that encode general instruction-following — so those get overwritten: catastrophic forgetting (79%→52%), which is why base behaviours like formatting and system-prompt adherence regress and raw transcript boilerplate leaks. The right operating point is a right-sized LoRA (r≈16–32) at a conservative LR: enough rank to absorb the domain, base weights frozen so general ability is preserved by construction. Separately, the objective is wrong for the subjective axis: pure SFT imitates demonstrations but never learns a notion of 'better vs worse,' so it can't rank review quality — that requires a preference objective (DPO, or RLHF). More data (option c) doesn't stop forgetting caused by updating the wrong weights; a higher LR (option d) accelerates the forgetting.",
        whatsTested: "Whether you can separate capacity (LoRA rank / underfit) from destructive interference (full-FT forgetting), pick the adapter and LR that fit the shift without erasing base ability, and match the OBJECTIVE (SFT vs DPO) to what you're optimising.",
        antiPattern: "Reaching for full-parameter fine-tuning to 'get real capacity' whenever an adapter underfits. The lever you actually wanted was more LoRA rank at a safe LR; full-FT trades a capacity problem for a far worse forgetting problem.",
        seniorFraming: "A staff engineer treats fine-tuning as capacity budgeting under a forgetting constraint: right-size LoRA rank to the size of the domain shift, keep LR conservative, freeze the base, and hold out a general-ability eval to catch regression. Then choose the objective deliberately — SFT to teach format/behaviour, DPO/RLHF when the target is subjective preference — rather than assuming more SFT fixes quality.",
        consequence:
          "You retrain with LoRA r=24 at a conservative LR, then add a short DPO pass on ranked review pairs. Domain eval reaches 85% AND the general suite recovers to 77%; subjective judgments sharpen. The adapter is merged for deployment. Then the int4 quantization step for the VRAM-limited on-prem GPUs silently tanks exactly the reasoning-heavy cases the fine-tune had fixed.",
      },
      {
        symptom: "The fp16 fine-tuned model is strong, but the int4 build shipped to on-prem GPUs quietly regresses the hardest reasoning cases — while easy cases look fine, so it passed a shallow smoke test.",
        evidence: [
          "fp16 domain eval 85%. Naive int4 post-training quantization (round-to-nearest, default calibration): 85% → 72%. The loss is concentrated on multi-step register-arithmetic questions; simple lookups are unaffected.",
          "Per-layer analysis shows a handful of activation channels with large outlier magnitudes; low-bit rounding of those channels injects errors that propagate through the deep reasoning chains.",
          "The PTQ calibration set was 128 samples of generic English text — almost no firmware/hex tokens — so the quantizer chose scales that don't cover the domain's activation distribution.",
          "The smoke test used only easy lookups, so the regression on hard reasoning wasn't caught before rollout.",
        ],
        question: "int4 preserves easy cases but destroys multi-step reasoning. What is the final missing layer?",
        options: [
          { id: "a", text: "int4 is fundamentally incapable of reasoning — the only option is to ship fp16 and buy more VRAM" },
          { id: "b", text: "The model regressed during quantization, not before — retrain it from scratch at int4" },
          { id: "c", text: "Naive PTQ is quantization-blind to outlier activations and used an unrepresentative calibration set: uniform low-bit rounding corrupts the high-magnitude channels that reasoning depends on, and generic calibration data set scales that miss the domain distribution. The fix is outlier-aware quantization (keep sensitive layers/channels higher-precision) with a domain-representative calibration set — and, if that's not enough, QAT" },
          { id: "d", text: "Lower the temperature at inference so the quantized model makes fewer mistakes" },
        ],
        correct: "c",
        finding:
          "Quantization error is not uniform across the network. A small number of activation channels carry outlier magnitudes, and reasoning-heavy computations are disproportionately sensitive to them; rounding those to int4 injects errors that compound across a multi-step chain — which is exactly why hard register-arithmetic questions fall while single-step lookups survive. Two compounding mistakes made it worse: naive round-to-nearest PTQ treats every channel equally (no outlier handling / mixed precision), and the calibration set — 128 generic-English samples — never exercised the domain's activation distribution, so the chosen scales don't cover firmware/hex inputs. The remedies are outlier-aware PTQ (e.g. keep the sensitive layers or outlier channels in higher precision, or use an outlier-suppressing scheme) with a calibration set drawn from real domain traffic; if the reasoning gap persists, quantization-aware training (QAT) lets the model adapt its weights to low-bit noise. int4 is not inherently reasoning-incapable (option a); the fp16 model is correct so retraining from scratch is wasteful (option b); and lowering temperature (option d) masks nothing — the errors are in the forward pass, not the sampling.",
        whatsTested: "Whether you understand that PTQ degradation is non-uniform (outlier-sensitive), that the calibration set must be representative, and that reasoning-heavy tasks demand outlier-aware quantization or QAT — plus that a smoke test must cover the HARD cases quantization is most likely to break.",
        antiPattern: "Validating an int4 build on easy lookups and shipping. Quantization damage concentrates on multi-step reasoning, so an easy-case smoke test is exactly the eval that will miss it — you certify the build on the cases it can't break.",
        seniorFraming: "A staff engineer treats quantization as a lossy compression with a known error profile: profile per-layer/channel sensitivity, keep the sensitive layers higher-precision (mixed-precision), calibrate on real domain traffic, evaluate on the reasoning-heavy slice specifically, and escalate to QAT when PTQ can't close the gap on hard cases.",
        consequence: null,
      },
    ],
    diagnosis:
      "A base-model adaptation that failed at every layer of the foundations stack: tokenization fragmented the domain and truncated inputs; positional/attention biases and a naive context extension buried the key constraint; the fine-tune under- then over-corrected (LoRA rank too low, then full-FT catastrophic forgetting) with the wrong objective (SFT-only for a preference task); and int4 PTQ silently destroyed reasoning via outlier-blind rounding on an unrepresentative calibration set. Each fix removed the mask hiding the next fault.",
    explanation:
      "The chain compounds top-down through the model's own pipeline. Fragmented tokenization inflated length and truncated the real question, so nothing downstream could work — and it hid the positional problem because files weren't even fitting. Fixing tokenization let long files fit, which exposed 'lost in the middle' and the RoPE-less context extension. Fixing position raised the ceiling to the domain gap, exposing the fine-tuning capacity/forgetting/objective failures. Fixing the fine-tune produced a strong fp16 model — whose quality then made the int4 quantization regression visible, because there was finally real reasoning to lose. No single metric revealed the stack: a domain-eval number went up at some layers even while the model got worse elsewhere. Each layer only became diagnosable once the one above it was resolved — which is precisely what a staff foundations interview probes.",
    fix:
      "Adapt a base model as an ordered stack, not a single training run: (1) audit and fix tokenization first — measure tokens-per-domain-file, add domain/special tokens for jargon and notation, use apply_chat_template, and order prompts so the question is never truncated; (2) treat prompt position as design — put hard constraints at the head and restate at the tail, and extend context only with position interpolation / NTK-aware RoPE scaling, never a bare max-length bump; (3) right-size the adaptation — LoRA at a rank matched to the domain shift (r≈16–32) at a conservative LR to avoid catastrophic forgetting, with a general-ability regression eval, and add a DPO/preference stage when the target is subjective quality; (4) quantize with awareness — outlier-aware / mixed-precision PTQ on a domain-representative calibration set, evaluate on the reasoning-heavy slice, and escalate to QAT if hard-case quality still drops. Measure tokenization efficiency, positional adherence, general-vs-domain eval, and per-slice post-quant quality — not a single aggregate score.",
    source: "Authored · GSL L2 Case Chain",
  },
];
