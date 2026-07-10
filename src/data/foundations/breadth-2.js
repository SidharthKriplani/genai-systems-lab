// Breadth tranche 2 — sparse-attention, eval-contamination, calibration, prompt-caching, multiturn-context. Spread into foundationsRunnerData.js.
export const RUNNER_BREADTH_2 = {
  "sparse-attention": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "The previous module shrank what attention has to *store*. This one attacks what attention has to *compute*. Start from the number that rules everything: for a sequence of n tokens, attention scores every pair — an n-by-n grid of comparisons. Double the document, quadruple the work. At 8K context that's easily affordable; at 128K, the very same feature that was fast and cheap suddenly takes seconds per document and blows past the GPU's memory. Nothing broke — the quadratic just caught up with you.\n\nSit with what that n² actually buys, because any fix has to negotiate with it: every token gets to consult every other token, no matter how far apart. That's the transformer's superpower — and on a 200-page contract it is also mostly waste, because most token pairs have nothing to say to each other. A clause on page 190 rarely needs to attend to the boilerplate on page 3.\n\nSo the escape hatch suggests itself: let each token attend to only *some* of the others — its close neighbours, a few globally-visible anchor tokens, a structured sample of the rest. Do that carelessly and you cripple the model; do it carefully and you keep almost all of the quality for a fraction of the cost. Those careful patterns go by the name **sparse attention**, and this module walks the canonical designs — windows, strides, global tokens — and what each one sacrifices. It closes on the production question the scenario poses for real: when long context gets slow and expensive, which lever do you actually pull, and in what order?",
    scenario: "Your team ships a document-QA product on a strong 8K-context model, and it's fast and cheap. Then legal asks for the same thing over 200-page contracts, so you move to a 128K-context model. Same hardware, same batch size — and now prefill on a single long document takes seconds, GPU memory spikes past what the box can hold, and your cost-per-request quietly multiplies. Nobody changed the model's parameter count; you just made the inputs longer — the quadratic caught up with you. So which lever do you actually pull, and in what order? Start with the cheapest, most surgical one: most of a 200-page contract is boilerplate a given clause rarely needs to see, so a sliding-window backbone with a handful of global tokens pinned on the query and the document's section headers — the Longformer pattern — turns the O(n²) prefill into roughly O(n·w), and most of the quadratic bill disappears without retraining from scratch. Only if quality on cross-references (a clause on page 190 citing a definition on page 3) measurably degrades do you reach for BigBird's added random long-range links to patch what sliding-window alone misses. You do not reach for StreamingLLM's attention-sink trick here — that fixes unbounded streaming generation, not a fixed 200-page document, and would be the wrong lever for this case.",
    explanation: [
      "The whole cost story of long context lives inside one operation: **self-attention**. In a standard Transformer, every token attends to every other token — for a sequence of length `n`, that's an `n × n` attention matrix, one score for every ordered pair of positions. ==Attention is O(n²) in both compute and memory: double the context length and the attention work roughly *quadruples*, not doubles.== That single quadratic is why the move from 8K to 128K didn't cost you 16× — it cost you closer to 16² on the attention term.",
      "Make the number concrete so the wall is visible. At 8K tokens the attention matrix has 8,000² ≈ 64 **million** score entries per head, per layer. At 128K it's 128,000² ≈ 16.4 **billion** — a ~256× jump for a 16× longer input. Multiply by the number of heads and layers and you see why prefill (the one-time pass that reads the whole prompt before generating the first token) becomes the dominant cost on long inputs, and why memory — you have to *materialize* attention scores to compute the softmax — spikes so hard. ==Long context is expensive not because the model got bigger, but because attention got quadratic in the input you control.==",
      "So the question becomes: does every token *really* need to attend to every other token? For most sequences, the honest answer is no. Language is mostly *local* — a token's meaning is dominated by its nearby neighbors — with a few long-range dependencies that genuinely matter. **Sparse attention** is the family of techniques that exploits this: instead of computing the full dense `n × n` matrix, you compute attention over a deliberately chosen *subset* of position pairs, dropping the rest. The design question is *which* pairs to keep.",
      "The simplest choice is **sliding-window (local) attention**: each token attends only to the `w` tokens within a fixed window around it, not to all `n`. That turns the cost from O(n²) to O(n·w) — *linear* in sequence length for a fixed window. The catch is obvious: a token can no longer directly see anything outside its window, so a fact 10,000 tokens back is invisible in one layer. The saving grace is depth — information *propagates* across windows as it flows up the layers (token A sees B, B saw C, so by a few layers up A has indirect access to C), much like stacked convolutions grow a receptive field. ==Sliding-window buys linear cost by trading away direct global reach, betting that depth reassembles the long-range signal.==",
      { type: "illustration", label: "Dense vs sparse attention — what gets computed", content: `Sequence length n. Each cell = one attention score that must be computed.

DENSE (full) attention — every token attends to every token:
        t1  t2  t3  t4  t5  t6  t7  t8
   t1 [ ■   ■   ■   ■   ■   ■   ■   ■ ]
   t2 [ ■   ■   ■   ■   ■   ■   ■   ■ ]
   t3 [ ■   ■   ■   ■   ■   ■   ■   ■ ]   →  n×n cells  =  O(n²)
   ...                                       8K:  64M  |  128K: 16.4B

SLIDING-WINDOW (local, w=2) — each token sees only its neighbors:
        t1  t2  t3  t4  t5  t6  t7  t8
   t1 [ ■   ■   ·   ·   ·   ·   ·   · ]
   t2 [ ■   ■   ■   ·   ·   ·   ·   · ]
   t3 [ ·   ■   ■   ■   ·   ·   ·   · ]   →  n×w cells  =  O(n·w)  LINEAR
   t4 [ ·   ·   ■   ■   ■   ·   ·   · ]      (■ computed, · skipped)

  Depth heals the gaps: t4→t3→t2 means t4 reaches t2 indirectly
  a couple layers up. Direct global reach is what you traded away.` },
      "Pure local attention throws away too much, so the productive patterns are **hybrids that add a little global connectivity back on top of a cheap local backbone**. Two named systems are the canonical interview references. **Longformer** combines sliding-window local attention with a handful of *global tokens* — specially designated positions (e.g., a `[CLS]` token, or question tokens in QA) that attend to *everything* and are attended to by everything, giving the model a few full-reach 'hubs' without paying O(n²) everywhere. **BigBird** mixes three patterns: local (window) + global (a few hub tokens) + a set of *random* long-range connections, and shows that this combination is expressive enough to retain the modeling power of full attention while staying roughly linear. Some designs also use **dilated** windows (attend to every 2nd or 4th neighbor) to widen reach without widening cost. ==The recurring recipe: a linear local backbone, plus a small number of global/random links to preserve long-range signal — near-linear cost, most of the modeling power.==",
      { type: "illustration", label: "The hybrid recipe — local backbone + global/random links", content: `LONGFORMER  =  sliding-window (local)  +  a few GLOBAL tokens
    global token (e.g. [CLS] or a question token):
       ── attends to ALL positions, and ALL positions attend to it
    every other token: local window only
    → O(n·w) local  +  O(n) for the handful of global tokens  ≈ linear

BIGBIRD  =  local  +  global  +  RANDOM long-range links
    local:   window neighbors            (the cheap backbone)
    global:  a few hub tokens            (guaranteed full reach)
    random:  each token → k random spots (cheap shortcuts across the seq)
    → provably retains full-attention expressiveness at ~linear cost

DILATED window: attend to every 2nd/4th neighbor → wider reach, same cost` },
      "One more pattern matters specifically for *streaming / very long generation*: **StreamingLLM and attention sinks**. When you generate endlessly and want to bound memory, the obvious move is a rolling window over the KV cache — keep only the most recent tokens, evict the oldest. In practice this *collapses* quality the moment the earliest tokens fall out of the window. The counter-intuitive finding: models dump a large amount of attention weight onto the *first few tokens* of the sequence regardless of content — these are **attention sinks**, a place for the softmax to park 'leftover' probability mass. Evict them and the softmax distribution destabilizes and the model degrades. ==The fix is almost embarrassingly simple: keep a few initial 'sink' tokens *pinned* in the cache permanently, plus a sliding window of recent tokens. That combination lets you stream to effectively unbounded length at bounded memory without the quality collapse.==",
      { type: "illustration", label: "StreamingLLM — why you pin the first few tokens", content: `Goal: generate forever at BOUNDED memory (can't keep the full KV cache).

NAIVE rolling window (evict oldest, keep recent W):
    [ t1 t2 t3 ...  ✂ evict ...  t_{k-W} ... t_k ]
    the moment t1..t4 fall out of the window → quality COLLAPSES.
    Why? the model parks huge attention mass on the FIRST tokens
    ("attention sinks") — a home for leftover softmax probability.
    Evict the sinks → softmax destabilizes → garbage.

STREAMINGLLM = pin the sinks + slide the rest:
    [ t1 t2 t3 t4 | ...sliding window of recent tokens... t_k ]
      ^^^^^^^^^^^  keep these 4 PINNED forever
    → stream to effectively unbounded length, bounded memory,
      no collapse. Cost of the trick: a handful of extra cached tokens.` },
      "Tie it back to the scenario. The reason 8K→128K blew up your bill is the O(n²) attention term, and sparse attention is the lever that bends it toward linear: sliding-window for a cheap local backbone, global/random links (Longformer, BigBird) to keep long-range signal, dilation to widen reach for free, and attention sinks (StreamingLLM) for unbounded streaming. What you *trade* is exactness of global context — full attention can route any token to any other in a single layer; sparse patterns rely on depth, hubs, and random shortcuts to approximate that. ==The staff-level framing: full attention is the long-context cost wall, and every sparse-attention method is a specific, principled way to punch a hole in the O(n²) wall while giving up as little global reach as possible.== (Note the neighbor to this: FlashAttention makes *dense* attention far cheaper by never materializing the full matrix, but it's still O(n²) in FLOPs — sparse attention changes the *complexity class*; FlashAttention changes the *constant*.)",
    ],
    keyPoints: [
      "**Self-attention is O(n²) in the sequence length** — an n×n score matrix per head per layer. Doubling context roughly quadruples attention cost and memory; that quadratic is *the* long-context cost wall (8K→128K ≈ 256× more attention entries for 16× the input).",
      "**Sliding-window (local) attention drops it to O(n·w) — linear** for a fixed window w. The cost: a token can't directly see outside its window; depth heals it (information propagates across windows up the layers, like a growing receptive field), trading direct global reach for linear cost.",
      "**Longformer = local window + a few global tokens** (hubs that attend to / are attended by everything). **BigBird = local + global + random long-range links**, provably retaining full-attention expressiveness at ~linear cost. Dilated windows widen reach without widening cost. The recipe: cheap local backbone + a little global/random connectivity.",
      "**StreamingLLM + attention sinks:** models park large attention mass on the *first few tokens* (sinks); a naive rolling KV window that evicts them collapses quality. Pin a few initial sink tokens permanently + slide a recent window → unbounded streaming at bounded memory, no collapse.",
      "**The trade is exact global context for near-linear cost.** Sparse changes the *complexity class* (O(n²)→~O(n)); contrast FlashAttention, which keeps dense O(n²) FLOPs but slashes the *constant* by never materializing the full matrix. Different levers on the same wall.",
    ],
    recap: [
      "**Attention: O(n²)** — n×n scores/head/layer. 8K→128K: 256× entries for 16× input → the cost wall.",
      "**Sliding-window** = O(n·w), linear. Token sees only window w; depth propagates signal across layers → indirect long-range reach.",
      "**Longformer** = local + global hubs. **BigBird** = local + global + random links (≈ full-attention power, linear). Dilation widens reach free.",
      "**StreamingLLM**: models dump attention on the first tokens (**attention sinks**); evicting them → collapse. Pin sinks + slide window → unbounded stream, bounded memory.",
      "**Sparse** changes the complexity class (O(n²)→~O(n)); **FlashAttention** changes the constant (dense, never materializes). Trade: exact global reach for near-linear cost.",
    ],
    mcqs: [
      {
        question: "You move a document-QA product from an 8K-context model to a 128K-context model on the same hardware, and prefill cost and memory explode far more than 16×. What is the fundamental reason, and what class of technique addresses it?",
        options: [
          "Self-attention is O(n²) in sequence length, so 16x longer input causes ~256x more attention computation; sparse methods cut this toward linear",
          "The 128K model has proportionally more parameters loaded per request, so swapping to a smaller checkpoint restores the original per-request cost",
          "Longer context requires proportionally more transformer layers to process the sequence, and layer count is what drives the additional prefill cost",
          "The tokenizer emits proportionally more subword tokens per input character at long context, and that per-token overhead compounds quadratically",
        ],
        correct: 0,
        explanation: "Option A is correct: attention computes an n×n matrix of pairwise scores per head per layer, so cost and memory scale with n² — a 16× longer input yields ~256× more attention entries, which is why prefill and memory blow up far more than the length ratio. Sparse attention (sliding-window, Longformer, BigBird, etc.) computes attention over only a chosen subset of position pairs, reducing the complexity toward linear. Option B is wrong — a bigger context window doesn't imply a bigger checkpoint; the model's parameter count didn't change, only the input length did. Option C is wrong — layer count is fixed by the architecture, not by context length; the quadratic is in the sequence dimension. Option D is wrong — tokens-per-character doesn't change with context length and isn't the source of the quadratic.",
      },
      {
        question: "Sliding-window (local) attention reduces attention cost from O(n²) to O(n·w). A teammate worries the model can now never use information more than w tokens away. What is the correct nuance?",
        options: [
          "The worry is fully justified — once a token's window is fixed, no amount of additional depth can ever let it access information outside that window at all",
          "Sliding-window attention keeps the full O(n²) cost profile internally, so the claimed savings are illusory and every single pair is still processed anyway",
          "Each token attends only to its window per layer, but signal propagates as layers stack, so long-range info is reached indirectly, trading reach for cost",
          "The window size automatically grows to span the full sequence whenever the model detects a long-range dependency during its own training process",
        ],
        correct: 2,
        explanation: "Option C is correct: within one layer a token sees only its window, but because layers stack, a token indirectly accesses tokens outside its window through intermediary tokens — the effective receptive field grows with depth, analogous to stacked convolutions. So long-range dependencies are still reachable, just indirectly; the genuine cost is losing *direct* single-layer global reach in exchange for linear O(n·w) cost. Option A overstates it — depth recovers much of the long-range signal, so it isn't a total blind spot. Option B is wrong — sliding-window is specifically what reduces cost from O(n²) to O(n·w); it doesn't secretly retain quadratic cost. Option D is wrong — the window is a fixed hyperparameter and does not dynamically expand per dependency.",
      },
      {
        question: "You stream generation with a rolling KV window and quality collapses once the earliest tokens are evicted. Select the two statements that correctly describe what StreamingLLM found and how it fixes this (choose 2).",
        options: [
          "Models dump a large, content-independent share of attention onto the first few tokens ('attention sinks'), a place for the softmax to park leftover mass",
          "The fix is to pin a handful of initial sink tokens in the cache permanently while still sliding the window over the more recent tokens as usual",
          "The recent tokens themselves become numerically corrupted over long generations, which is what destabilizes the softmax distribution entirely and irreversibly",
          "The only real fix is to disable the KV cache entirely and recompute attention over the full history from scratch at every single generation step",
        ],
        correct: [0, 1],
        explanation: "Options A and B are correct together: StreamingLLM found that models park a large, content-independent share of attention on the first few tokens (attention sinks), and evicting them destabilizes the softmax; the fix is to pin those initial sink tokens permanently while sliding the window over recent tokens, giving unbounded-length streaming at bounded memory. Option C is wrong — the recent tokens aren't corrupted; the issue is losing the sink tokens' stabilizing role, not decay in the retained window. Option D is wrong — disabling the cache would defeat the point of bounded-memory streaming and isn't the fix StreamingLLM proposes.",
      },
    ],
    takeaway: "Self-attention is O(n²) in sequence length, which is why long context is the dominant cost wall — length alone quadratically inflates prefill compute and attention memory. Sparse attention punches through it: sliding-window drops cost to linear (trading direct global reach, healed by depth), Longformer/BigBird add a few global and random links to keep long-range signal at ~linear cost, and StreamingLLM pins 'attention sink' tokens to stream unbounded at bounded memory. Sparse attention changes the complexity class; FlashAttention only changes the constant.",
  },

  "eval-contamination": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Let's start with what a benchmark is even *for*. When we score a model on a test set, we're not curious whether it can answer *those exact questions* — we're using them as a stand-in for questions it has never seen, to estimate how it'll do out in the world. The whole value of a test rests on one quiet assumption: *the model didn't get to study the answer key first.*\n\nNow here's the puzzle this module turns over. A model can genuinely top a famous leaderboard — real questions, real correct answers, no cheating in the obvious sense — and still be *worse* than a lower-ranked model on your actual work. How can a score be completely real and completely misleading at the same time?\n\nTake it slowly. We'll start from what that one assumption requires, watch exactly how it breaks when benchmarks meet how modern models are trained, and then build up the handful of defenses that restore a trustworthy signal. By the end you'll know why a leaderboard win should make you *more* suspicious, not less — and which single eval actually decides a deployment.",
    scenario: "Now let's put all of that to work on a real one. A new open model tops the MMLU and HumanEval leaderboards, beating models you know are stronger in practice. Your team is excited and wants to swap it in. You run it on your own held-out set of production tickets and it's mediocre — noticeably worse than the model it 'beat.' Someone says 'the benchmarks must be wrong.' Take a moment before reading on: given everything just covered, how can that leaderboard score be perfectly real yet tell you nothing about *your* task? Here's the reasoning, step by step. The scores aren't fake — the model really emitted the right answers — but MMLU and HumanEval live on the web and are commonly swept into pretraining, so the model may be *recalling* memorized answers rather than *reasoning* them. That makes the score real yet meaningless as a generalization measure. Your production tickets were never public and cannot have leaked, so they expose the model's true, weaker capability — and the gap between the two numbers is the tell. The discipline that follows: distrust suspiciously large public wins, and decide the deployment on a private held-out set drawn from your own distribution, the one thing the model provably could not have seen.",
    explanation: [
      "Start from what a benchmark is *supposed* to measure: can the model answer questions it has *never seen*? That word — unseen — is load-bearing, because it's the only thing that makes a score evidence of *capability* rather than *memory*. Now hold that requirement against how modern models are actually built: they're pretrained on enormous web scrapes, and public benchmarks *live on the web* — on GitHub, in papers, in blog posts, in Stack Overflow answers, in dozens of mirrored copies. So the unseen assumption quietly fails. ==If the benchmark's questions (and often their answers) were in the pretraining data, the model isn't *reasoning* to the answer — it's *recalling* it. The test set leaked into the training set.== This is **contamination** (also called *test-set leakage*), and it's the mechanism that silently breaks every public benchmark.",
      "This is why a benchmark score can be *real and meaningless at once*. The score is real: the model genuinely emitted the right answers. It's meaningless as a measure of *generalization*: it's reporting memorization, not capability. A model can top MMLU because MMLU questions were in its training corpus, then fall flat on *your* tickets — which were never on the web and cannot have leaked. ==Contamination inflates the exact thing you care about (held-out capability) while looking like legitimate skill. That gap is precisely what you observed.==",
      "Now layer on the *incentive* problem, because contamination isn't always accidental. Benchmarks are public, competitive, and career-/funding-defining, and that turns them into **Goodhart's law**: *when a measure becomes a target, it ceases to be a good measure.* Once 'MMLU score' is the number everyone optimizes, teams (consciously or not) start optimizing the *number* rather than the underlying capability it was meant to proxy — training on data that looks like the benchmark, tuning prompts to its format, selecting checkpoints by leaderboard rank. ==The benchmark stops measuring capability and starts measuring 'how hard did you optimize for this benchmark.' This is benchmark gaming, and it's the structural reason leaderboards drift away from real-world usefulness.==",
      { type: "illustration", label: "Why a real score can be a meaningless score", content: `WHAT A BENCHMARK IS SUPPOSED TO MEASURE:
    can the model answer questions it has NEVER seen?  (generalization)

WHAT CONTAMINATION DOES:
    benchmark Qs live on the web (GitHub, papers, blogs, mirrors)
        │
        ▼  swept into the pretraining corpus
    model has SEEN the test questions (and often the answers)
        │
        ▼
    at eval time it RECALLS, doesn't REASON
        │
        ▼
    high score  ✓ real (it emitted right answers)
                ✗ meaningless (measures memorization, not capability)

  Your production tickets were NEVER on the web → cannot leak →
  the model's true generalization shows → mediocre. The gap IS the tell.` },
      "Defending against this is a hygiene discipline, and the first tool is the **canary string**. A benchmark's authors embed a unique, random, hard-to-guess sentinel string (a 'canary GUID') inside the benchmark files. The deal: anyone building a pretraining corpus is asked to *exclude any document containing the canary*, and researchers can *search a model* for knowledge of the canary to detect whether the benchmark leaked in. ==The canary is a tripwire — it doesn't prevent leakage by itself, but it gives both dataset builders a filter and auditors a detector.== (Its limits are real: only cooperative crawlers honor it, paraphrased or reformatted copies of the questions slip past a literal-string filter, and it can't catch a benchmark that leaked before the canary existed.)",
      "The second tool is **held-out / private evaluation**. If the test set is *never published*, it *can't* be in anyone's training data, so contamination is structurally impossible. This is why the evaluations that best predict real-world performance are increasingly *private*: an internal eval set built from your own data, or a third-party held-out benchmark whose questions are secret and only the aggregate score is released. ==The single most reliable defense against contamination is to test on data the model provably could not have seen — which, by construction, means data that isn't public.== Your production tickets are exactly such a set, which is why they told you the truth the leaderboard hid.",
      { type: "illustration", label: "Eval hygiene — the defenses and their limits", content: `DEFENSE            HOW IT WORKS                    LIMIT
─────────────────────────────────────────────────────────────────
canary string      unique GUID in the benchmark;    only cooperative
                   crawlers exclude docs with it,   crawlers honor it;
                   auditors search models for it    paraphrases slip by

temporal split     test only on events/data AFTER   model can still
(held-out-by-time) the model's training cutoff       have seen similar
                   → can't have been trained on it   patterns; cutoffs lie

private / held-out  test set NEVER published →       you must trust the
eval               contamination impossible          holder; can't be
                   by construction                    independently rerun

  STRONGEST signal in practice: YOUR OWN data (production tickets,
  internal set) — provably unseen, matches YOUR distribution.` },
      "There's a third, cheaper hygiene move worth naming: the **temporal (held-out-by-time) split**. Evaluate the model only on data created *after* its training cutoff — news events, code commits, questions that didn't exist when the model was trained. Such data *cannot* have been in the training set, so a temporal split gives you contamination-resistant signal without needing a fully private benchmark. ==Its weakness: the model may still have seen *similar* patterns, and stated training cutoffs are often fuzzy — but as a quick sanity check it's far better than a public static benchmark.==",
      "So the whole chain lands on one rule for how to *decide*: a leaderboard number is a weak, gameable, contamination-prone signal, not evidence the model will do *your* job — so treat public-benchmark wins with suspicion (especially suspiciously large or sudden ones), prefer temporal splits and canary-aware sources, and always validate on a private held-out set drawn from your own distribution. ==A model can ace MMLU and fail your task precisely because MMLU may be in its training data and your task never is — so the only eval that decides a deployment is one the model provably hasn't seen.==\n\nThe interactive lets you watch a benchmark score inflate as questions leak into training, and hold steady on a private set that can't leak. Then the closing scenario puts it to work on a leaderboard-topping model that's mediocre on your own tickets — see if you can explain how the score is real yet meaningless before the reasoning does.",
    ],
    keyPoints: [
      "**Contamination = benchmark test data leaked into pretraining.** Public benchmarks live on the web and get swept into training corpora; the model then *recalls* answers instead of *reasoning* them. The score becomes real (right answers emitted) but meaningless (measures memorization, not generalization).",
      "**Goodhart's law drives benchmark gaming:** once a benchmark score is the target everyone optimizes, it stops measuring capability and starts measuring 'how hard you optimized for the benchmark' — via benchmark-shaped training data, format tuning, and leaderboard checkpoint selection. This is why leaderboards drift from real-world usefulness.",
      "**Canary strings are tripwires:** a unique GUID embedded in the benchmark; cooperative crawlers exclude documents containing it, and auditors search models for it to detect leakage. Limits: only cooperative crawlers honor it, paraphrased copies slip past, and pre-existing leaks aren't caught.",
      "**Private/held-out evaluation is the structural fix:** an unpublished test set can't be in anyone's training data, so contamination is impossible by construction. The most predictive evals are increasingly private. Temporal (held-out-by-time) splits — testing only on post-cutoff data — are a cheaper contamination-resistant approximation.",
      "**A model can ace MMLU and fail your task** because MMLU may have leaked and your task never did. Deployment decisions must ride on a private held-out set drawn from *your own distribution* — provably unseen and matching your task, not a generic academic one. Treat suspiciously large public wins with suspicion.",
    ],
    recap: [
      "**Contamination**: benchmark Qs live on the web → swept into pretraining → model recalls, not reasons. Score real, generalization-meaning false.",
      "**Goodhart's law**: benchmark becomes the target → measures optimization-for-the-benchmark, not capability (benchmark-shaped data, format tuning, checkpoint picks).",
      "**Canary string**: unique GUID → crawlers exclude, auditors detect leakage. Limits: only cooperative crawlers, paraphrases slip past, pre-existing leaks missed.",
      "**Private/held-out eval** = structural fix (unpublished → can't leak). **Temporal split** (post-cutoff data) = cheaper contamination-resistant proxy.",
      "**Ace MMLU, fail your task**: MMLU may have leaked, your data never did. Decide deployment on a private set from *your* distribution; distrust large public wins.",
    ],
    mcqs: [
      {
        question: "A new model tops MMLU and HumanEval but performs mediocrely on your private production tickets. A teammate says 'the benchmark scores must just be fake.' What is the more precise explanation?",
        options: [
          "The benchmark scores were fabricated by the model provider to inflate the leaderboard ranking, and the model never actually produced those answers itself at all",
          "Your production tickets are inherently harder than any public benchmark question, so any model — however capable — would score lower on them",
          "MMLU and HumanEval test entirely unrelated skills to your production tickets, so the two scores are simply incomparable here, contamination aside",
          "The benchmark questions likely leaked into pretraining, so the model recalls rather than reasons; your tickets never leaked, so they reveal true capability",
        ],
        correct: 3,
        explanation: "Option D is correct: the scores aren't fake — the model genuinely emitted correct answers — but public benchmarks live on the web and are commonly swept into pretraining corpora, so the model may be recalling memorized answers rather than reasoning. That makes the score real yet meaningless as a generalization measure. Your production tickets were never public and cannot have leaked, so they expose the model's true capability, and the gap between the two is the tell of contamination. Option A is too strong — the answers were really produced, not fabricated. Option B isn't the core issue; the point is unseen-ness, not raw difficulty. Option C understates it — distribution mismatch matters, but contamination is precisely why the public number is inflated relative to unseen data.",
      },
      {
        question: "Why does a canary string (a unique GUID embedded in a benchmark) only partially defend against contamination?",
        options: [
          "It cryptographically encrypts the benchmark file, so any model trained on the encrypted data automatically fails to learn the questions inside it entirely",
          "It's a tripwire: crawlers can exclude documents with it and auditors probe for it, but non-cooperative crawlers ignore it and paraphrases slip past it",
          "It only functions for code-generation benchmarks like HumanEval, since knowledge benchmarks like MMLU have no way to embed a string marker",
          "Embedding the canary string measurably raises the benchmark's difficulty, and harder questions are inherently less likely to be memorized verbatim",
        ],
        correct: 1,
        explanation: "Option B is correct: a canary string is a detection/filtering tripwire. It lets dataset builders exclude documents containing the GUID and lets auditors probe a model for knowledge of it, but it has real limits — non-cooperative or careless crawlers ignore it, paraphrased or reformatted copies of the questions don't contain the literal canary and slip through, and leaks that predate the canary aren't caught. Option A overstates it — a canary cannot cryptographically prevent training; it relies on cooperation. Option C is wrong — canaries are format-agnostic and used for knowledge and code benchmarks alike. Option D is wrong — a canary doesn't change difficulty; it's a leakage tripwire.",
      },
      {
        question: "Your team wants an evaluation that is structurally resistant to contamination so it actually predicts deployment performance. Select the two approaches that meaningfully improve contamination resistance (choose 2).",
        options: [
          "A private held-out set from your own distribution (e.g., production tickets) — never published, so it can't appear in training data",
          "A temporal split that only evaluates on data created after the model's training cutoff, so the data could not have existed at training time",
          "The largest, most popular public benchmark available, since wide adoption means it has already been thoroughly checked for leakage by others",
          "Averaging scores across several well-known public benchmarks, since leakage in one benchmark tends to cancel out against the others somehow",
        ],
        correct: [0, 1],
        explanation: "Options A and B are correct together: an unpublished, private held-out set drawn from your own distribution cannot be in any training corpus by construction, and a temporal split restricted to post-cutoff data also could not have been seen during training — both give genuine contamination resistance, with the private set additionally matching your real task. Option C is backwards — popularity increases the odds a benchmark has been scraped and gamed, not decreased. Option D is wrong — averaging inflated, contaminated scores just averages the inflation; leakage doesn't cancel out.",
      },
    ],
    takeaway: "Public benchmarks live on the web and leak into pretraining, so a top score can reflect memorization rather than capability — real yet meaningless for generalization — and Goodhart's law compounds it by turning the benchmark into a gamed target. Canary strings and temporal splits are partial defenses; the structural fix is a private held-out eval the model provably couldn't have seen, ideally drawn from your own production distribution. A model can ace MMLU and fail your task precisely because MMLU may be in its training data and your task never is.",
  },

  "calibration": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Let's start by separating two things we usually smush together: being *right*, and knowing *how likely you are to be right*. A model that answers a question also hands you a number — the probability it assigns to its own answer, its confidence. The tempting assumption is that this number is trustworthy: that '95% sure' really means 'wrong about one time in twenty.'\n\nHere's the puzzle. That assumption can quietly be false in a way that has nothing to do with the model being *dumb*. A model can be plenty accurate and still hand you confidence numbers that don't mean what they say — and the moment you build anything that *acts* on those numbers (auto-answer this, escalate that), the lie becomes your problem.\n\nWe'll take it gently. First we'll pin down exactly what it means for confidence to be trustworthy, then how you'd measure whether a given model's confidence can be believed, then a surprising reason modern chat models tend to fail this — and a cheap fix. By the end you'll know to check one number before you ever automate on a model's confidence.",
    scenario: "Now let's put all of that to work on a real one. You build a routing layer: when the model is confident it answers automatically, and when it's unsure it escalates to a human. To decide, you read the model's own confidence — the probability it assigns to its answer. In testing it feels great; in production it's a disaster. The model answers a huge fraction of questions at 95%+ confidence, a painful number of those confident answers are wrong, and the human queue sits nearly empty while error complaints climb. Take a moment before reading on: given everything just covered, which property failed here — and note it may not be accuracy at all. Here's the reasoning, step by step. The model may be just as accurate as ever; what broke is *calibration*. It's overconfident: its stated confidence exceeds its actual accuracy, so '95% confident' no longer implies 'wrong ~1 in 20.' A confidence threshold therefore admits a flood of confident-but-wrong answers to the auto path and starves the human queue — a calibration failure, distinct from an accuracy failure. And this is expected, not a fluke: RLHF rewards assertive answers and pushes models toward overconfidence. So before trusting confidence-based routing again, plot a reliability diagram and compute ECE on your own distribution, recalibrate with temperature scaling, re-measure, and only then set thresholds.",
    explanation: [
      "Start from a definition, because it's the whole game: a model is **calibrated** when its stated confidence *matches its actual accuracy in aggregate*. ==Of all the predictions it makes with 70% confidence, about 70% should be correct; of all the ones it makes with 95% confidence, about 95% should be correct.== Read that carefully, because it's easy to misread: calibration is *not* about being right more often — it's about the confidence numbers *meaning what they say*. That means accuracy and calibration are different axes entirely: a model can be highly accurate but badly calibrated, or mediocre but well calibrated. So the moment a system reads a confidence number and *acts* on it, what it depends on isn't accuracy — it's calibration.",
      "This is why anything built *on top of* a confidence number lives or dies by calibration. Take the simplest case — a threshold that auto-answers when confidence is high and escalates when it's low. That threshold assumes '95% confident' really implies 'wrong ~1 in 20 times.' But if the model is **overconfident** — saying 95% when it's actually right only 70% of the time — then the threshold lets a flood of wrong answers through the automated path at high stated confidence, and the escalation path starves. ==Notice what did and didn't fail: the model's *accuracy* might be perfectly fine; it's the *reliability of the confidence signal* that failed — and that reliability is exactly what calibration measures.==",
      "To measure it, you use a **reliability diagram**. Bin every prediction by its stated confidence (0–10%, 10–20%, …, 90–100%). For each bin, plot stated confidence on the x-axis against *observed accuracy within that bin* on the y-axis. ==A perfectly calibrated model lies on the diagonal y = x: in the '90% confidence' bin, 90% are actually correct. Points *below* the diagonal mean overconfidence (stated > actual); points *above* mean underconfidence.== Your model's diagram would show the high-confidence bins sagging far below the line — lots of 95%-confidence predictions landing at 70% real accuracy.",
      { type: "illustration", label: "Reliability diagram — reading calibration off the curve", content: `accuracy
  1.0 |                                    ● (perfect: on the line)
      |                              . ' ´
      |                        . ' ´          ← diagonal y=x
      |                  . ' ´                   = PERFECT calibration
  0.7 |            . ' ´        ○  ← 95%-conf bin lands at 0.70 accuracy
      |      . ' ´                   (BELOW line = OVERCONFIDENT)
      |. ' ´                    ○  ← the gap (0.95 - 0.70) is what
  0.0 +----------------------------  feeds ECE
      0.0        0.5         0.95  1.0   stated confidence

  ON the diagonal  → calibrated
  BELOW  (stated > actual) → OVERCONFIDENT  ← your routing failure
  ABOVE  (stated < actual) → underconfident
  ECE = avg |confidence - accuracy| over bins, weighted by bin size.` },
      "To collapse the diagram into one number, use **Expected Calibration Error (ECE)**. Partition predictions into confidence bins; for each bin compute the *absolute gap* between the bin's average confidence and its actual accuracy; then take a *weighted average of those gaps across bins, weighted by how many predictions fall in each bin*. ==ECE = Σ (bin_size / N) · |avg_confidence(bin) − accuracy(bin)|. Zero means perfectly calibrated; larger means the confidence numbers are more misleading.== It's the single scalar you'd cite when you say 'this model's confidence can't be trusted' — a high ECE is the quantitative version of your production incident.",
      { type: "illustration", label: "ECE — one worked number", content: `ECE = Σ_bins  (n_bin / N) · | avg_conf(bin) − accuracy(bin) |

  bin        n     avg_conf   accuracy   |gap|    weight·gap
  ─────────────────────────────────────────────────────────
  0.5–0.6    100     0.55       0.54      0.01    (100/1000)·0.01 = .001
  0.7–0.8    300     0.75       0.60      0.15    (300/1000)·0.15 = .045
  0.9–1.0    600     0.96       0.72      0.24    (600/1000)·0.24 = .144
  ─────────────────────────────────────────────────────────
  N = 1000                                         ECE ≈ 0.19

  ECE ≈ 0.19 → on average confidence overstates accuracy by ~19 pts.
  Most of the damage is the big, badly-overconfident 0.9–1.0 bin —
  exactly the bin your auto-answer threshold trusts most.` },
      "Now the crucial, counter-intuitive fact for modern LLMs: **RLHF tends to *mis*-calibrate them, usually toward overconfidence.** The base (pretrained) model is often surprisingly well calibrated — next-token probabilities roughly track correctness. But the preference-tuning stage (RLHF) optimizes the model to produce answers humans *rate highly*, and humans tend to *prefer confident, assertive, unhedged responses*. So the model learns to *sound* certain — and to *assign* high probability — even when it shouldn't. ==Alignment training trades away calibration for helpfulness/assertiveness: the RLHF'd model is more useful and more confident-sounding, but its confidence numbers drift away from its true accuracy. This is a documented, expected effect, and it's very likely what bit your router.==",
      "A partial remedy exists: **temperature scaling**, a post-hoc recalibration. After training, learn a single scalar `T` and divide the logits by `T` before the softmax (`softmax(logits / T)`). `T > 1` *softens* the distribution — pulling overconfident probabilities down toward the truth; `T < 1` sharpens it. You fit `T` on a held-out validation set to minimize calibration error, and crucially it *doesn't change which answer is top-ranked* (so accuracy is untouched) — it only rescales the confidences. ==Temperature scaling is cheap, doesn't hurt accuracy, and directly fixes the overconfidence your router tripped on — but it corrects the *global* scale, not per-question judgment.== (Note: this is the same softmax-temperature knob as sampling temperature, used here for a different purpose — recalibration, not creativity.)",
      { type: "illustration", label: "Where calibration matters — and where it bites", content: `CALIBRATION MATTERS wherever you ACT on the confidence number:

  routing / auto-answer:  "≥0.95 conf → answer, else escalate"
      overconfident model → floods the auto path with wrong answers,
      starves the human queue   ← YOUR incident

  abstention:  "if conf < τ, say 'I don't know'"
      miscalibration → abstains on easy Qs or answers hard ones blindly

  human-in-the-loop:  surface confidence to reviewers
      miscalibrated numbers → reviewers mis-trust the model

  ensembling / thresholds / cost-sensitive decisions: all assume the
  probability MEANS what it says.

WHY LLMs bite:  RLHF rewards assertive answers → OVERCONFIDENCE.
FIX:  temperature scaling — divide logits by T>1 to soften; fit T on
      held-out data; accuracy unchanged (top answer stays top).` },
      "So the whole chain lands on one discipline. *Any* system that acts on a confidence number — routing, abstention ('I don't know' below a threshold), human-in-the-loop triage, cost-sensitive thresholds — is only as trustworthy as the calibration underneath it, and a model can be accurate yet dangerous to route on if it's overconfident. ==The order of operations before shipping confidence-based automation: (1) plot a reliability diagram and compute ECE on *your* distribution; (2) expect RLHF-induced overconfidence and don't take stated probabilities at face value; (3) recalibrate with temperature scaling and re-measure ECE; (4) only then set thresholds.==\n\nThe interactive lets you drag a reliability curve off the diagonal, watch ECE climb, and pull it back with temperature scaling without touching accuracy. Then the closing scenario puts it to work on a router that trusts 95%-confidence answers into an empty human queue — see if you can name the property that failed, and why it isn't accuracy, before the reasoning does.",
    ],
    keyPoints: [
      "**Calibration = stated confidence matches actual accuracy in aggregate:** of all 70%-confidence predictions, ~70% should be right. It's orthogonal to accuracy — a model can be accurate but badly calibrated (or vice versa). Anything that *acts on* the confidence number depends on it.",
      "**Reliability diagram:** bin predictions by confidence, plot stated confidence (x) vs observed accuracy (y). Perfect = the diagonal y=x; below the line = overconfident (stated > actual), above = underconfident. **ECE** collapses it to one number: Σ (bin_size/N)·|avg_confidence − accuracy| over bins; 0 = perfect, higher = more misleading.",
      "**RLHF tends to MIS-calibrate toward overconfidence.** The base model is often well calibrated, but preference tuning rewards confident, assertive answers, so the model learns to *sound* and *score* certain even when it shouldn't — trading calibration for helpfulness. This is expected, not a bug in your setup.",
      "**Temperature scaling** is a cheap post-hoc fix: learn a scalar T on held-out data and use softmax(logits/T). T>1 softens overconfident probabilities toward truth; it *doesn't change the top-ranked answer* (accuracy untouched), only rescales confidences. It fixes the global scale, not per-question judgment.",
      "**Calibration is load-bearing for routing, abstention, and human-in-the-loop.** An overconfident model floods an auto-answer path with confident wrong answers and starves the human queue (the scenario). Before automating on confidence: reliability diagram + ECE on your distribution, expect RLHF overconfidence, recalibrate, re-measure, then set thresholds.",
    ],
    recap: [
      "**Calibration** = confidence matches accuracy (70%-conf preds right ~70% of the time). Orthogonal to accuracy — whether the numbers can be believed.",
      "**Reliability diagram**: confidence (x) vs accuracy (y); diagonal = perfect, below = overconfident. **ECE** = Σ(bin/N)·|conf−acc|; 0 = perfect, higher = worse.",
      "**RLHF → overconfidence**: base model often calibrated; preference tuning rewards assertive answers → model sounds and scores too certain.",
      "**Temperature scaling**: softmax(logits/T), fit T on held-out data. T>1 softens overconfidence; top answer unchanged → accuracy preserved.",
      "**Routing/abstention/HITL ride on calibration** — overconfidence floods the auto path with wrong answers. Plot reliability + ECE on your data, recalibrate, then set thresholds.",
    ],
    mcqs: [
      {
        question: "Your confidence-based router auto-answers at ≥95% confidence and escalates below it. In production the model answers most questions at 95%+ but many of those are wrong, and the human queue is empty. What property failed, and what does it mean?",
        options: [
          "The model's underlying accuracy collapsed in production; it simply became worse at the task than it was during testing overall, across the board",
          "Sampling temperature was set too low at generation time, causing the model to reuse the same token distribution across unrelated questions",
          "The model is miscalibrated toward overconfidence: stated confidence exceeds accuracy, so '95%' stops meaning '1 in 20 wrong' here",
          "The router's threshold was accidentally configured below 95%, so the system auto-answered questions it was never meant to auto-answer",
        ],
        correct: 2,
        explanation: "Option C is correct: routing on confidence assumes the confidence number means what it says — that 95% confidence implies roughly a 1-in-20 error rate. When a model is overconfident, its stated confidence exceeds its actual accuracy, so a threshold admits many confident-but-wrong answers to the auto path and starves the human queue. This is a calibration failure — the reliability of the confidence signal — which is distinct from (and can coexist with) perfectly fine accuracy. Option A conflates calibration with accuracy; the model may be as accurate as ever, but its confidence is unreliable. Option B is irrelevant to the described symptom. Option D contradicts the setup, where the threshold is 95% and the problem is that too many predictions genuinely exceed it.",
      },
      {
        question: "You plot a reliability diagram and compute ECE for your model. The high-confidence bins sit well below the diagonal and ECE is ~0.19. What are you looking at?",
        options: [
          "Points below the diagonal indicate overconfidence — confidence exceeds accuracy — and ECE ≈0.19 means confidence overstates accuracy by ~19 pts",
          "The model is underconfident overall, and an ECE of 0.19 is close enough to zero to count as well-calibrated for practical routing purposes right now",
          "ECE is a direct measure of raw accuracy, so an ECE of 0.19 means the model answers only about 19% of questions correctly overall",
          "Points below the diagonal indicate underconfidence, and underconfidence poses no risk to a confidence-based routing threshold at all",
        ],
        correct: 0,
        explanation: "Option A is correct: on a reliability diagram, points below the y=x diagonal indicate overconfidence — stated confidence is higher than the observed accuracy in those bins. ECE is the bin-size-weighted average of the absolute gap between confidence and accuracy, so ~0.19 means confidence overstates accuracy by about 19 points on average, with the heavily-populated high-confidence bins contributing most of the error — precisely the bins a router trusts most. Option B is wrong on both counts — below the line is overconfidence, and 0.19 is far from zero. Option C confuses ECE with accuracy; ECE measures the confidence-accuracy gap, not accuracy itself. Option D mislabels below-the-diagonal as underconfidence and wrongly calls it harmless — overconfidence is exactly what breaks routing.",
      },
      {
        question: "A teammate is surprised that your RLHF-tuned chat model is more overconfident than the base pretrained model, and asks how to fix the confidence numbers without hurting accuracy. Select the two statements that correctly explain the overconfidence and its fix (choose 2).",
        options: [
          "Preference tuning (RLHF) rewards confident, assertive answers, pushing confidence above accuracy, even though the base model is often well calibrated",
          "Temperature scaling fits a scalar T on held-out data via softmax(logits/T); T>1 softens overconfidence without changing the top answer, accuracy holds",
          "RLHF always improves calibration alongside helpfulness, so any observed overconfidence must be a training bug requiring a full retrain to fix right now",
          "Raising the sampling temperature at generation time simultaneously recalibrates the confidence numbers and increases task accuracy across the board",
        ],
        correct: [0, 1],
        explanation: "Options A and B are correct together: RLHF optimizes for responses humans rate highly, and humans prefer confident, assertive answers, so preference tuning systematically pushes the model toward overconfidence even though the base model is often well calibrated. Temperature scaling is the cheap post-hoc fix — learn a single scalar T on held-out data and apply softmax(logits/T); T>1 softens the distribution, pulling overconfident probabilities down toward observed accuracy, and because it doesn't change which answer ranks highest, accuracy is preserved. Option C is backwards — RLHF typically hurts calibration, not helps it, and full retraining isn't required. Option D confuses sampling temperature (creativity) with the recalibration use and wrongly claims an accuracy boost.",
      },
    ],
    takeaway: "Calibration is whether a model's stated confidence matches its actual accuracy — orthogonal to raw accuracy and load-bearing for anything that acts on confidence (routing, abstention, human-in-the-loop). You measure it with a reliability diagram and summarize it with ECE (weighted average of |confidence − accuracy| across bins); RLHF tends to mis-calibrate models toward overconfidence because it rewards assertive answers. Temperature scaling (softmax(logits/T), T>1) recalibrates cheaply without touching accuracy — so measure ECE on your own distribution and recalibrate before ever automating on confidence.",
  },

  "prompt-caching": {
    depthTier: "core",
    interviewWeight: "medium",
    groundUp: "Let's start with something you already sense every time you use a chat model: the answer doesn't appear all at once. There's a pause, and then words begin to stream. Ask yourself what the model is *doing* during that pause — because that quiet moment is where most of your latency and a big share of your bill actually live.\n\nHere's the puzzle this module unravels. Imagine you send the model a huge block of fixed instructions on every single call, and only a tiny question at the end changes. The model dutifully re-reads that whole fixed block *every time*, from scratch, even though it's byte-for-byte identical to last time. That feels wasteful — and it is. The obvious instinct is 'make the instructions shorter,' but that throws away instructions you actually need.\n\nThere's a better lever, and it comes straight from understanding what the model *recomputes* versus what it could safely *remember*. We'll build up slowly: first what a request actually does under the hood, then the one part that's pure repeated work, then the trick that skips it — and by the end you'll be able to lay out a prompt so the expensive part happens roughly once, not once per call.",
    scenario: "Now let's put all of that to work on a real one. Your agent runs on a beefy 6,000-token system prompt: tool definitions, formatting rules, a long few-shot block, and safety instructions — the same every call. On top of that the user's actual question is usually ~50 tokens. Latency to first token feels sluggish and the input-token bill is brutal, and it's obviously dominated by that giant fixed preamble you resend on every single request. A teammate says 'just make the system prompt shorter,' but you need those instructions. Take a moment before reading on: given everything just covered, where is that cost actually going, and what can you skip without deleting a single instruction? Here's the reasoning, step by step. The cost lives in *prefill* — the phase that builds the KV cache for the whole prompt — and you pay it in full on every call even though 6,000 of your ~6,050 tokens never change. So you don't need a shorter prompt; you need a *cacheable* one: keep the 6,000 fixed tokens as a stable prefix at the front, move anything per-request (the user turn, any timestamp or IDs) to the very end, and mark the prefix for caching if your provider requires it. Then the expensive prefill over those 6,000 tokens happens roughly once and is reused: TTFT drops because you skip re-prefilling the preamble, and the input bill drops because the cached prefix is billed at a fraction of full price.",
    explanation: [
      "Start from a single question: when you send a prompt, what work does the model actually do before it can produce even the first token? A request is processed in two phases. **Prefill:** the model reads the *entire* prompt and computes an internal representation of it — concretely, the **KV cache** (the key/value tensors for every token at every attention layer). This is the expensive, compute-heavy phase, and it scales with prompt length. **Decode:** the model then generates the answer one token at a time, each new token attending back to that KV cache. Because prefill happens before any output appears and grows with prompt length, ==your latency-to-first-token and most of your input-token cost live in *prefill* — and prefill is exactly what you pay for, in full, on every call, even for the fixed part of a prompt that never changes.==",
      "That observation is the whole idea behind **prompt caching** (a.k.a. prefix caching / KV caching of the prompt). The system prompt is a *shared prefix* — identical, byte-for-byte, across every request. So the KV cache computed for that prefix is *also* identical every time. ==Prompt caching stores the KV cache for a prompt prefix after the first request, and on subsequent requests with the same prefix it *reuses* that cached state and skips the prefill for those tokens entirely.== You compute the 6,000-token prefix's KV once; thereafter you only prefill the ~50 new tokens of the actual question.",
      { type: "illustration", label: "What prompt caching skips", content: `Request = [ 6,000-token system prompt (FIXED) | ~50-token user Q (VARIES) ]

WITHOUT caching — every call:
  prefill ALL 6,050 tokens → build KV for the whole thing → decode
     └─ you recompute the 6,000 fixed tokens EVERY time (wasted)

WITH prompt caching:
  call 1:  prefill 6,050, STORE the KV for the 6,000-token prefix   (cache miss)
  call 2:  reuse cached prefix KV, prefill ONLY the ~50 new tokens  (cache hit)
  call 3:  reuse cached prefix KV, prefill ONLY the ~50 new tokens  (cache hit)
     └─ prefill work per call drops from 6,050 → ~50 tokens

  WIN 1: lower TTFT (time-to-first-token) — skip prefilling 6,000 tokens
  WIN 2: cheaper input — cached tokens billed at a large discount
         (cache WRITE may cost a little more; cache READ far less)` },
      "The payoff comes in two currencies. **Latency:** prefill is the dominant contributor to **time-to-first-token (TTFT)**, so skipping prefill on the cached prefix makes the model start answering much sooner — the longer and more-reused the prefix, the bigger the win. **Cost:** providers bill **cached input tokens at a steep discount** versus fresh input tokens (the work was already done). ==You don't have to shorten your prompt to make it cheap — you make its *fixed part* cacheable, and pay full price only for the small, varying tail.== There's a subtlety on the write side: creating the cache entry (the first, cache-*miss* request) can cost slightly *more* than a normal call, so caching pays off when a prefix is *reused enough* to amortize that one-time write.",
      "This makes **prompt layout a performance decision**, and it flips the naive instinct. A cache hit requires the prefix to match *exactly*, from the start — caching keys on the literal token prefix, so it only helps up to the *first point where two requests differ*. The rule that falls out: ==put everything **static** at the **front** (system prompt, tool definitions, few-shot examples, long fixed context) and everything **dynamic** at the **back** (the user's turn, a timestamp, a session ID).== If you put a per-request timestamp at the *top* of the prompt, you *break the cache for everything after it* — every request now has a different prefix from token one, and nothing can be reused. Cache-friendly layout is 'static first, dynamic last,' and it's the single highest-leverage thing you control.",
      { type: "illustration", label: "Cache-friendly layout — static first, dynamic last", content: `CACHE-HOSTILE (dynamic content near the top):
  [ "Request at 2026-07-03 14:22:07Z" | system prompt | tools | user Q ]
     ^^^^^^^^^^^^^^^ changes every call
   → prefix differs from token 1 → NOTHING after it can be reused
   → cache hit rate ≈ 0

CACHE-FRIENDLY (static first, dynamic last):
  [ system prompt | tool defs | few-shot examples || user Q | timestamp ]
    \\________ identical every call → CACHED _______/  \\_ varies, cheap _/
   → long shared prefix → high cache hit rate → low TTFT, low cost

  RULE: the cache matches only up to the FIRST differing token.
        Push everything that changes to the very end.` },
      "A few provider-specific realities round out the staff-level picture, because caching is *not* one uniform feature. Some providers do it **automatically** (you get cache hits for repeated prefixes with no code change); others require you to **explicitly mark** cache breakpoints in the prompt (e.g., an Anthropic-style `cache_control` on a content block) to designate what to cache. Caches carry a **TTL** — they *expire* after a period of inactivity (often minutes), so a rarely-used prefix may be gone by the next call and you eat a fresh prefill. And **invalidation is implicit**: change *any* token in the cached region and the entry no longer matches — there's no partial update, you simply get a miss and rebuild. ==The mental model: the cache is keyed on the exact token prefix, discounted heavily on hits, expired on a TTL, and rebuilt on any change — so its value is proportional to how *stable* and *reused* your prefix is.==",
      "So the whole chain lands on one rule: you don't make a fixed preamble cheap by *shortening* it — you make it cheap by making it *cacheable*, which means designing for a stable, heavily-reused prefix laid out static-first and dynamic-last. ==Prompt caching reuses the KV cache of a shared prefix to skip prefill — the expensive prefill over the fixed part happens roughly once and is reused across calls, so both TTFT and input cost fall.==\n\nThe interactive lets you toggle caching on and off and watch prefill work collapse from the whole prompt to just the varying tail as the shared prefix grows. Then the closing scenario puts it to work on an agent whose bill is dominated by exactly this — see if you can name the lever, and the layout fix, before the reasoning does.",
    ],
    keyPoints: [
      "**A request has two phases: prefill (read the whole prompt, build the KV cache — compute-heavy, drives TTFT and most input cost) and decode (generate tokens one at a time).** You pay full prefill on every call, even for the fixed preamble that never changes.",
      "**Prompt caching stores the KV cache of a shared prompt *prefix* and reuses it, skipping prefill for those tokens on later requests.** Compute the fixed prefix's KV once, then only prefill the small varying tail — the 6,000-token preamble is prefilled roughly once, not every call.",
      "**Two wins: lower TTFT** (skip re-prefilling the prefix) and **cheaper input** (cached tokens billed at a steep discount). Caveat: the first cache-*write* request can cost slightly more, so caching pays off only when the prefix is reused enough to amortize the write.",
      "**Layout is a performance decision: static first, dynamic last.** The cache matches only up to the first differing token, so a per-request timestamp/ID at the *top* breaks the cache for everything after it. Put system prompt / tools / few-shot at the front, the user turn and any variable content at the very end.",
      "**Provider differences + TTL/invalidation:** some cache automatically, others need explicit breakpoints (e.g., `cache_control`); caches expire on a TTL (inactivity → fresh prefill); invalidation is implicit and total — change any token in the cached region and you get a miss and rebuild. Cache value ∝ how stable and reused the prefix is.",
    ],
    recap: [
      "**Prefill** (build KV for the whole prompt) is the expensive phase → drives TTFT + most input cost, paid in full every call even for the fixed preamble.",
      "**Prompt caching** = store & reuse the KV of a shared prefix, skipping prefill for those tokens. 6,000-token prefix prefilled once; only ~50 varying tokens after.",
      "**Two wins**: lower TTFT + cached input at a steep discount. Cache-write (first call) costs slightly more → pays off once the prefix is reused enough.",
      "**Layout = static first, dynamic last.** Cache matches only up to the first differing token — a timestamp at the top breaks the cache for everything after.",
      "**Providers differ** (automatic vs explicit `cache_control`); caches carry a **TTL** (expire on inactivity) and **total invalidation** (any change → miss + rebuild). Value ∝ prefix stability × reuse.",
    ],
    mcqs: [
      {
        question: "Your agent resends a fixed 6,000-token system prompt on every call, with only a ~50-token user question changing. TTFT is slow and input cost is high. How does prompt caching help, and what exactly does it reuse?",
        options: [
          "It compresses the system prompt into fewer tokens using a learned summarization pass, so the model has less text to read on every call",
          "It caches the model's final generated answers keyed on the full request text, so an identical question returns instantly with no generation",
          "It pins the entire system prompt permanently in GPU memory across all users and requests, so no request of any kind ever re-reads it",
          "It stores the KV cache for the shared prefix after the first request and reuses it, skipping prefill for those tokens on later calls",
        ],
        correct: 3,
        explanation: "Option D is correct: prefill is the phase that reads the whole prompt and builds the KV cache, and it dominates TTFT and input cost. Because the 6,000-token system prompt is an identical prefix across requests, its KV cache is identical too; prompt caching stores that prefix's KV after the first call and reuses it, so subsequent requests skip prefill for the prefix and only prefill the ~50 varying tokens — lowering TTFT and billing cached tokens at a steep discount. Option A is wrong — caching doesn't compress or shorten the prompt; it reuses computed state for the same tokens. Option B describes response/output caching, a different mechanism keyed on identical full requests, not prefix KV reuse. Option C is a mischaracterization — the prefix KV is cached with a TTL and reused, not pinned permanently on the GPU.",
      },
      {
        question: "A teammate puts a per-request timestamp at the very top of the prompt, before the system instructions, and cache hit rate drops to nearly zero. Why, and what's the fix?",
        options: [
          "A cache matches only up to the first divergence point; a timestamp at the top makes every request differ — fix: static first, dynamic last",
          "Timestamps can never be cached under any circumstances, so any prompt containing one gets zero cache hits no matter where it's placed in it",
          "The timestamp pushes the prompt's total token count past the provider's maximum cacheable size, which silently disables caching entirely for it",
          "The correct fix is to remove the timestamp entirely, since dynamic content of any kind is fundamentally incompatible with prompt caching itself",
        ],
        correct: 0,
        explanation: "Option A is correct: caching keys on the exact literal token prefix and reuses cached state only up to the first point two requests diverge. Placing a per-request timestamp at the very top makes every request differ from token one, so the entire remainder of the prompt becomes uncacheable and hit rate collapses. The fix is cache-friendly layout — static content first (system prompt, tools, few-shot), dynamic content (timestamp, user turn) last — so the long fixed prefix stays shared and cacheable. Option B is wrong — the timestamp's *position*, not its mere presence, is the problem; at the end it's fine. Option C invents a size-limit cause that isn't the issue. Option D overcorrects — dynamic content coexists with caching perfectly well when placed at the end.",
      },
      {
        question: "Select the two statements that correctly describe prompt caching's cost model and operational behavior (choose 2).",
        options: [
          "Cached input tokens are billed at a discount, but the first cache-write request can cost slightly more, so savings materialize once reused enough",
          "Cache entries carry a TTL and expire after inactivity, and changing any token within the cached region invalidates the entry entirely, not partially",
          "Prompt caching primarily reduces output-token cost, since generation is where most spend lives and prompt layout has no bearing on the savings at all here",
          "Every provider caches prompts automatically with identical behavior, so there is no configuration or breakpoint marking to reason about ever at all",
        ],
        correct: [0, 1],
        explanation: "Options A and B are correct together: cached input tokens are billed at a large discount because the prefill work was already done, but writing the cache (the first, cache-miss request) can cost a bit more, so savings materialize once the prefix is reused enough to amortize that write; caches also expire on a TTL after inactivity, and invalidation is implicit and total — changing any token in the cached region yields a miss and a rebuild. Option C is wrong — prompt caching targets *input* (prefill) cost, not output, and layout matters a great deal. Option D is wrong — providers differ (automatic vs explicit `cache_control` breakpoints), so behavior does need reasoning about.",
      },
    ],
    takeaway: "A request splits into prefill (build the KV cache for the whole prompt — the compute-heavy phase that drives TTFT and most input cost) and decode; prompt caching stores the KV cache of a shared prompt prefix and reuses it, skipping prefill for those tokens so you only pay for the varying tail. That yields lower TTFT and steeply discounted cached input, which makes layout a performance decision: static content first, dynamic last, since the cache matches only up to the first differing token. Mind provider differences, TTLs, and total invalidation — cache value is proportional to how stable and reused the prefix is.",
  },

  "multiturn-context": {
    depthTier: "core",
    interviewWeight: "medium",
    groundUp: "Let's start with a question that feels like it has an obvious answer, but doesn't. When you chat with a model across many turns, it *seems* to remember what you said earlier — so where does that memory live? Most people assume it's tucked away inside the model somewhere between messages. It isn't, and that one misconception is the root of nearly every long-conversation bug.\n\nHere's the puzzle we'll unravel. A model can hold a crisp conversation for a while, then somewhere around turn 30 quietly start ignoring something important the user said back at turn 3 — while every reply also gets slower and pricier. Two different problems, one underlying cause, and neither is the model 'breaking.'\n\nNo need to rush this. We'll start from the single mechanical fact about how a conversation is actually fed to a model, watch two separate walls emerge from it, and then build up the handful of strategies that keep a long chat both affordable and *sharp*. By the end you'll be able to look at an assistant that 'forgot' an early instruction and say exactly why — and what to do about it.",
    scenario: "Now let's put all of that to work on a real one. You build a support assistant that holds long conversations — 40, 50 turns is normal. Early on it's sharp. By turn 30 it starts forgetting a constraint the user gave at turn 3 ('I'm on the EU data plan, never suggest the US-only features'), and it's slow and expensive on every reply. Your logs show the bill climbing because each turn you resend the *entire* prior conversation, so the input grows every message. Take a moment before reading on: given everything just covered, which of those two symptoms is 'ran out of window' and which is something subtler — and why did turn 3 in particular get lost? Here's the reasoning, step by step. The rising cost is the stateless-model consequence: you resend the whole transcript every turn, so turn 51 re-prefills ~50 turns of history. But the forgotten constraint is *not* truncation — at turn 30 the transcript still fits; the turn-3 instruction sank into the *middle* of the context, where models reliably under-attend (lost-in-the-middle). The fix is a context-management strategy: summarize older turns into a compact running summary that preserves the EU-plan constraint, keep recent turns verbatim, retrieve specific old facts when needed, promote always-true facts to persistent cross-session memory, and re-surface durable constraints near the *end* of the prompt where attention is strong.",
    explanation: [
      "Start from the one fact everything else follows from: **an LLM is stateless between turns.** It carries no memory of your conversation from one call to the next — on each call it sees only the text you place in the context window *right now*. That single constraint forces the whole design. Because the model can't remember turn 3 on its own, the only way to make a chat feel continuous is to *resend the entire prior conversation* — every user and assistant turn — inside every new request. ==So cost and latency climb turn over turn: the input isn't your latest message, it's the whole growing transcript, re-sent and re-prefilled every single time. A 50-turn chat re-processes ~50 turns of history just to answer turn 51.==",
      "That resend strategy hits two walls at once. The hard wall is the **finite context window** — eventually the transcript won't fit, and something must be dropped. The *soft* wall is more insidious and arrives sooner: **context rot / lost-in-the-middle.** Even when everything technically fits, models don't attend uniformly across a long context — they reliably attend best to the *beginning* and the *end*, and worst to the *middle*. ==A constraint stated at turn 3 sinks into the middle of a 30-turn transcript and gets effectively ignored, not because it fell out of the window but because the model under-attends to the middle. That's exactly your 'forgot the EU data plan' bug.== Long context degrades usefulness *before* it hits the size limit.",
      { type: "illustration", label: "Lost-in-the-middle — why turn 3 gets forgotten", content: `Attention quality across a long context (schematic):

  attention │██████                              ██████
   to that  │██████                              ██████
   region   │██████    ▁▁▁▁ ▁▁▁ ▁▁▁▁ ▁▁▁ ▁▁▁     ██████
           └────────────────────────────────────────────
             START          MIDDLE               END
             (system,       (turn 3's "EU plan"  (latest
              turn 1)         constraint sinks     user turn)
                              here — under-read)

  Fits in the window ≠ actually used. The middle is the danger zone.
  → put durable constraints at the START or re-surface them near the END.` },
      "So you need a strategy to keep the conversation *useful and affordable* as it grows, and there are three basic moves — each a different tradeoff. **Move 1 — truncation:** keep only the last N turns (a sliding window over the conversation), drop the oldest. Cheap and simple, bounds the cost — but it's *lossy in the worst way*: it throws away the earliest turns, which are often where the *durable constraints* live ('EU data plan,' 'the user's name is X,' 'we decided on approach Y'). ==Naive truncation forgets the setup and remembers the small talk — usually backwards from what matters.==",
      "**Move 2 — summarization (compression):** instead of dropping old turns, periodically *compress* them. Run an LLM pass that condenses the older part of the conversation into a compact summary ('User is on the EU data plan; wants X; we ruled out Y'), and replace the raw old turns with that summary, keeping recent turns verbatim. ==You trade fidelity for space: the summary is lossy, but it *deliberately preserves the load-bearing facts* while discarding the verbatim back-and-forth.== The cost is an extra LLM call to summarize, plus the risk that the summarizer drops something that later turns out to matter. This is the workhorse for long assistant conversations.",
      { type: "illustration", label: "Three strategies for a growing conversation", content: `As the transcript grows past what's useful/affordable:

TRUNCATION (sliding window): keep last N turns, drop oldest
  [ ✂ old turns dropped ][ turn 40 | 41 | ... | 50 ]
  + cheap, bounded   − drops EARLY turns = the durable constraints
                       (forgets setup, keeps small talk)

SUMMARIZATION (compress): condense old turns into a summary
  [ "SUMMARY: user on EU plan, wants X, ruled out Y" ][ recent turns ]
  + preserves load-bearing facts, bounds size
  − extra LLM call; summarizer may drop something that matters later

RETRIEVAL (history as a store): embed all past turns, fetch only the
  relevant ones for the current question
  [ system ][ fetched: "EU plan" turn ][ recent turns ][ user Q ]
  + scales to unbounded history, surfaces old facts on demand
  − retrieval can miss; adds a lookup step; "relevant" is fuzzy` },
      "**Move 3 — retrieval of history:** treat the whole conversation as a *searchable store*. Embed every past turn, and for each new user message, *retrieve* only the turns relevant to it and inject just those into context, rather than resending everything. ==This scales to effectively unbounded history and can resurface a turn-3 fact at turn 50 precisely when it's relevant — but it inherits RAG's failure modes: retrieval can miss the relevant turn, and 'relevant to the current message' is a fuzzy target for constraints that should *always* apply.== In practice mature systems *combine* these: a rolling window of recent turns verbatim + a running summary of older ones + retrieval for specific old facts, plus a separate **persistent memory** for facts that must survive across *sessions* ('this user is always on the EU plan') rather than living only in one conversation.",
      "The judgment call — the part interviews probe — is **when to compress.** Compression isn't free (each summarization is an extra LLM call and a lossy step), so you don't do it every turn. The usual triggers: when the transcript approaches a *fraction of the context window* (e.g., compress once you're past ~60–70% full, leaving headroom for the model's answer), or every *K turns*, or when token cost per turn crosses a budget. ==The goal is to keep the *effective* context small and information-dense — recent turns sharp, older turns compressed, durable constraints kept where the model actually attends (start or re-surfaced near the end) — so you fight both the size wall and lost-in-the-middle at once.==",
      "So the whole chain lands on one framing: a conversation runs on the context window as a *scarce resource*, and resending everything is both expensive and — because of lost-in-the-middle — actively worse than managing history deliberately. ==The discipline is to keep the *effective* context small and dense: summarize older turns into a compact running summary, keep recent turns verbatim, retrieve specific old facts on demand, promote always-true facts to persistent cross-session memory, and keep durable constraints where the model actually attends — the start, or re-surfaced near the end.==\n\nThe interactive lets you grow a transcript and watch both walls arrive — the size limit and the middle sag — and see how summarization keeps the load-bearing facts alive. Then the closing scenario puts it to work on an assistant that forgets an early constraint by turn 30 — see if you can separate the cost problem from the lost-in-the-middle problem before the reasoning does.",
    ],
    keyPoints: [
      "**LLMs are stateless between turns**, so continuity means resending the entire prior transcript every call — which is why cost and latency climb turn over turn (turn 51 re-prefills ~50 turns of history). The context window is the scarce resource a conversation runs on.",
      "**Two walls: the hard finite context window (transcript won't fit) and the softer, earlier 'lost-in-the-middle' / context rot** — models attend best to the start and end, worst to the middle, so a turn-3 constraint sinks into the middle and gets ignored even while it technically fits. Long context degrades usefulness before it hits the size limit.",
      "**Truncation** (keep last N turns) is cheap but drops the *earliest* turns — usually where durable constraints live, so it forgets the setup and keeps small talk. **Summarization** compresses old turns into a compact summary that deliberately preserves load-bearing facts (extra LLM call, lossy) — the workhorse for long chats.",
      "**Retrieval of history** treats past turns as a searchable store and injects only relevant ones — scales to unbounded history and resurfaces old facts on demand, but inherits RAG's miss-risk and struggles with always-apply constraints. Mature systems combine window + summary + retrieval, plus **persistent cross-session memory** for facts that must survive across conversations.",
      "**When to compress is the judgment call:** compress at a fraction of the window (~60–70% full, leaving answer headroom), every K turns, or at a cost budget — not every turn (it's a lossy, paid step). Keep effective context small and dense, and re-surface durable constraints at the start or near the end where attention is strong.",
    ],
    recap: [
      "**LLMs are stateless** → resend the whole transcript each turn → cost/latency climb (turn 51 re-prefills ~50 turns).",
      "**Two walls**: hard finite context window + softer **lost-in-the-middle** (best attention start/end, worst mid) — a turn-3 constraint ignored even though it fits.",
      "**Truncation** (last N turns): cheap, bounded, but drops the *earliest* turns = the durable constraints. **Summarization**: compress old turns, preserve load-bearing facts (extra LLM call, lossy) — the workhorse.",
      "**Retrieval of history**: past turns as a searchable store, inject only relevant ones → unbounded history, RAG miss-risk. Combine window + summary + retrieval; add **persistent cross-session memory** for always-true facts.",
      "**When to compress**: ~60–70% of the window / every K turns / at a budget — not every turn. Keep durable constraints at start or re-surfaced near the end.",
    ],
    mcqs: [
      {
        question: "Your 40+ turn support assistant forgets a constraint the user gave at turn 3 by turn 30, even though your logs show the full transcript still fits in the context window. What's the most precise explanation?",
        options: [
          "The turn-3 constraint fell outside the context window once the transcript grew, so the model literally has no access to that text anymore today at all",
          "This is lost-in-the-middle: models attend best at the start/end, worst at the middle, so a turn-3 constraint sinks mid-transcript, under-attended",
          "The model's underlying weights shifted slightly over the conversation, gradually erasing the earlier constraint from its parameters entirely",
          "Constraints are only honored by design within the first five turns of any conversation, after which the model stops applying them completely",
        ],
        correct: 1,
        explanation: "Option B is correct: the constraint still fits in the window, so the failure isn't truncation — it's lost-in-the-middle. Models don't attend uniformly across a long context; they attend best to the start and the end and worst to the middle, so a constraint stated at turn 3 sinks into the middle of a 30-turn transcript and gets under-read despite being present. The fix is to keep durable constraints where attention is strong (start, or re-surfaced near the end). Option A is wrong — the logs show it still fits, so it didn't fall out of the window. Option C is wrong — model weights are frozen at inference; nothing about the conversation edits them. Option D invents a hard rule that doesn't exist; position within a long context, not turn number, is the issue.",
      },
      {
        question: "To bound cost and keep a long conversation useful, a teammate proposes simple truncation — always keep just the last 10 turns and drop the rest. What's the main risk, and what's a better default?",
        options: [
          "Truncation is lossless by design, so keeping only the last 10 turns carries no meaningful risk to conversation quality whatsoever at all",
          "Truncation is too costly to use in practice because summarizing every dropped turn requires an extra LLM call before discarding it",
          "Truncation causes the effective context size to keep growing over time, which is the actual source of the risk described here",
          "Truncation drops the earliest turns, often where durable constraints live; better default: summarization, keeping recent turns verbatim",
        ],
        correct: 3,
        explanation: "Option D is correct: a sliding window that keeps only the last N turns is cheap and bounds cost, but it discards the *earliest* turns — precisely where durable constraints and setup information tend to live — so it forgets the load-bearing facts while retaining recent chit-chat. Summarization is the stronger default: periodically compress the older portion into a compact summary that deliberately preserves the important facts, keeping recent turns verbatim. Option A is wrong — truncation is lossy, and lossy in the worst direction. Option B confuses truncation (which just drops turns, no LLM call) with summarization. Option C is backwards — truncation *bounds* size; it doesn't grow it.",
      },
      {
        question: "Your assistant resends the entire transcript every turn and cost climbs steadily. A colleague asks why you can't just 'let the model remember' instead of resending, and when you should compress history. Select the two statements that correctly explain this (choose 2).",
        options: [
          "LLMs are stateless between turns, so continuity means resending prior context every call, which is why cost climbs as the transcript grows",
          "Compression should be triggered selectively, around 60-70% of the window or every K turns, since summarization is itself a lossy, paid call",
          "The model retains a persistent internal memory of the conversation across calls, so resending prior turns is redundant and mainly a legacy habit",
          "Compressing on every single turn is the safest default, since the lossy cost of summarization is negligible compared to the savings it produces",
        ],
        correct: [0, 1],
        explanation: "Options A and B are correct together: an LLM has no memory between calls — it only sees what's in the current context window — so continuity is achieved by resending prior turns, which is why cost grows. You manage that cost by compressing selectively: when the transcript approaches a fraction of the window (leaving headroom for the answer), every K turns, or at a token-cost budget — not every turn, because each summarization is an extra, lossy LLM call. Option C is wrong — the model does not remember across turns; resending is the mechanism, not a redundant habit. Option D over-compresses, paying the lossy summarization cost needlessly on every turn.",
      },
    ],
    takeaway: "LLMs are stateless, so multi-turn continuity means resending the whole transcript each call — which grows cost and, worse, triggers lost-in-the-middle, where a constraint stated early sinks into the under-attended middle and gets ignored even while it still fits. Manage the context window as a scarce resource with truncation (cheap but drops the durable early turns), summarization (compress old turns while preserving load-bearing facts — the workhorse), and retrieval of relevant history, plus persistent cross-session memory for always-true facts. Compress selectively (at a fraction of the window / every K turns / at a budget), and keep durable constraints where the model actually attends — the start or re-surfaced near the end.",
  },
};
