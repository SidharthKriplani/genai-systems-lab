// NLP Foundations (part 2) — Word2Vec/GloVe, RNN/LSTM/GRU, seq2seq + attention.
// Spread into foundationsRunnerData.js.
export const RUNNER_NLP_2 = {
  "nlp-word2vec-glove": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Pick up the thread the counting model left dangling: to an n-gram, 'cat' and 'dog' are just two different integers — it can never transfer what it learned about one to the other. What's missing is a representation where similar words *look* similar. So the question this module answers: how do you turn a word into a list of numbers such that words with similar meanings get similar lists — when nobody ever tells it which words are synonyms?\n\nSit with how strange that demand is. All the computer ever sees is raw text. Nobody tags 'termination' and 'cancellation' as related. Where could the signal possibly come from?\n\nHere's the observation that cracks it — an idea from mid-century linguistics, older than NLP itself: look at the *company a word keeps*. 'Cat' and 'dog' both show up next to 'vet', 'fur', 'feed'; 'doctor' and 'nurse' both sit near 'hospital', 'patient', 'shift'. The words around a word betray its meaning — so if two words keep the same company, they mean similar things, and no human ever had to say so. That idea has a name — the **distributional hypothesis** — and this module is about the two classic machines built on top of it: **Word2Vec**, which learns vectors by playing a prediction game over local windows of text, and **GloVe**, which reaches the same place by crunching global co-occurrence counts.\n\nWe'll build the prediction game from scratch, hit its real computational wall and the two tricks that break through it, watch something genuinely surprising fall out — vector arithmetic that solves analogies, king − man + woman landing on queen — and end on the one hard ceiling both methods share, the flaw that pushed the whole field toward BERT. By the end you'll know exactly why 'bank' is the word that broke these fixed one-vector-per-word embeddings.",
    scenario: "You're building the search layer for a legal-docs product, and before any transformer touches the problem you need word vectors — a way to turn 'termination' and 'cancellation' into numbers that land near each other. A junior engineer asks the obvious question: how does a model learn that two words *mean* similar things when all it ever sees is raw text with no dictionary, no synonyms file, no human labels? You reach for the two classics that answered exactly this — Word2Vec and GloVe — because their core idea still underlies every embedding model shipping today. Take a moment before reading on: given a modest legal corpus full of relatively rare specialized terms, do you reach for Skip-gram or CBOW, and why? Skip-gram: every occurrence of a rare term like 'termination' generates several independent (center, context) training pairs, so a corpus too small to see every term often gets more signal per occurrence than CBOW's single averaged prediction. Pair it with negative sampling rather than a full vocabulary-wide softmax, since a legal-specific vocabulary doesn't need the cost of predicting over every word in the language. And there's a subtle failure you need to warn the team about early regardless of which you pick: the word 'bank' in 'river bank' and 'bank account' is going to collapse to a *single* vector, because both Word2Vec and GloVe are static — one vector per word type, frozen after training — and that limitation is precisely what pushed the field toward BERT.",
    explanation: [
      "Everything here rests on one deceptively simple idea, so state it first and let the rest follow. The **distributional hypothesis**: *a word is known by the company it keeps.* Words that appear in similar contexts tend to have similar meanings. 'Cat' and 'dog' both show up near 'pet', 'vet', 'feed', 'fur'; 'termination' and 'cancellation' both sit near 'contract', 'clause', 'notice', 'effective date'. ==No human ever labels the synonyms — the *statistics of co-occurrence* carry the meaning.== Word2Vec and GloVe are two different machines for squeezing that co-occurrence signal into a dense vector per word, and both work because meaning genuinely does live in context.",
      "**Word2Vec** turns the hypothesis into a *prediction* task, and there are two mirror-image ways to frame it. In **Skip-gram**, you take a center word and try to *predict its context* — given 'termination', predict the surrounding words 'contract', 'notice', 'effective'. In **CBOW** (Continuous Bag of Words), you flip it: take the context words and predict the *center* word — given 'contract … notice … effective', predict 'termination'. In both, the *side effect* of learning to predict well is that the model must place words used in similar contexts near each other in vector space. The vectors are what you keep; the prediction task is just the pretext.\n\n==When does each win? Skip-gram is generally better for **rare words and small datasets**, because each rare center word generates several independent (center, context) training signals — one per context word — so a rare word gets multiple gradient updates from a single occurrence. CBOW *averages* its context into one prediction, which smooths over rare words and trains faster on large corpora, so it's the pick when data is plentiful and speed matters.==",
      { type: "illustration", label: "Skip-gram vs CBOW — mirror directions", content: `Sentence:  the  quick  brown  [fox]  jumps  over
                              ^center       (window = 2)

SKIP-GRAM   (predict CONTEXT from center)
   fox ─►  quick ,  brown ,  jumps ,  over
   one center word  ──►  MANY (center, context) pairs
   → rare word "fox" gets several updates per occurrence
   → wins on RARE words / small data

CBOW        (predict CENTER from context)
   quick , brown , jumps , over  ─►  fox
   context is AVERAGED into one prediction
   → smooths over rare words, trains faster
   → wins on LARGE data / speed` },
      "Now the bottleneck that nearly sinks the naive version, because the fix is a favourite interview target. To predict a context word, Skip-gram wants a probability over *the entire vocabulary* — a softmax whose denominator sums over every word (often hundreds of thousands). ==Computing that normalizing sum for every training pair is brutally expensive: one forward/backward pass touches the whole vocabulary.== Two fixes make it tractable. **Negative sampling** reframes the problem entirely: instead of 'predict the right word out of 400,000', it asks a much cheaper *binary* question — 'is this (center, context) pair a *real* pair from the corpus, or a *fake* one I drew from noise?' For each true pair you sample a handful (say 5–20) of random 'negative' words and train a logistic classifier to score the real pair high and the noise pairs low. You update weights for only ~k+1 words per step, not the whole vocabulary. **Hierarchical softmax** is the other fix: arrange the vocabulary as a binary (Huffman) tree so predicting a word costs ~log(V) node decisions instead of V — roughly 17 steps for a 130k vocabulary instead of 130,000.",
      { type: "illustration", label: "The softmax bottleneck and its two fixes", content: `FULL SOFTMAX (naive):  P(context | center) = exp(...) / Σ over ALL V words
   V = 400,000  →  every update normalizes over 400,000 words.  Too slow.

NEGATIVE SAMPLING (turn it into binary real-vs-noise):
   real pair:  (fox, jumps)           → label 1  ("is this real?")
   noise:      (fox, banana)          → label 0
               (fox, democracy)       → label 0   (k≈5-20 sampled)
   update ~ k+1 words per step, NOT V.  Logistic loss, hugely cheaper.

HIERARCHICAL SOFTMAX (tree instead of flat list):
   words = leaves of a binary tree;  predict = walk root→leaf
   cost ~ log2(V) ≈ 17 node decisions for V=130k   (vs 130,000)` },
      "Here's the result that made Word2Vec famous and revealed something deep about the space: **word analogies as vector arithmetic.** Take the vector for 'king', subtract 'man', add 'woman' — the nearest word to the result is *'queen'*. `king − man + woman ≈ queen`. Similarly `paris − france + italy ≈ rome`. ==This works because the embedding space has learned approximately *linear* structure: a consistent 'gender' direction, a 'capital-of' direction, a 'plural' direction. Meaning-differences become roughly constant vector offsets.== The model was never told about gender or capitals; those regularities *emerged* from co-occurrence statistics alone. That linear structure is a big part of why these embeddings were so useful as drop-in features.",
      { type: "illustration", label: "Analogies as vector offsets (linear structure)", content: `        woman ● ─────────────► ● queen
               ▲                  ▲
     "gender"  │                  │  "gender"   (same offset vector)
       offset  │                  │
         man ● ─────────────► ● king
                  "royalty"

   king − man + woman ≈ queen
   The (man→woman) offset ≈ the (king→queen) offset.
   A single consistent DIRECTION encodes "gender". Emergent, unlabeled.` },
      "**GloVe** (Global Vectors) reaches the same destination by a different road, and the contrast is a clean interview point. Word2Vec is *local*: it slides a window across the corpus and learns from each local (center, context) pair, never explicitly building a global picture. GloVe is *global*: it first builds the full **word-word co-occurrence matrix** X (how often word i appears near word j across the *entire* corpus), then learns vectors by *factorizing* that matrix — fitting vectors so that `wᵢ · wⱼ` approximates a function of `log(Xᵢⱼ)`. ==GloVe's insight is that the meaningful signal lives in **ratios of co-occurrence probabilities**: P(ice near 'solid') / P(steam near 'solid') is large, P(ice near 'gas') / P(steam near 'gas') is small — those *ratios* discriminate 'ice' from 'steam' far better than raw counts. GloVe designs its objective so vector differences capture exactly those ratios.== Practically, Word2Vec (esp. skip-gram + negative sampling) and GloVe land in very similar places; GloVe's global counts can be more efficient to reuse, Word2Vec's streaming is simpler online.",
      "Now the limitation you must warn the team about, because it defines the entire next era. Both Word2Vec and GloVe produce **static embeddings**: *one fixed vector per word type*, computed once and frozen. But 'bank' means a riverbank in 'sat on the bank' and a financial institution in 'deposited at the bank' — and a static embedding is forced to represent both senses with the *same single point*, landing somewhere in the muddled average between them. ==A static embedding cannot depend on the sentence the word appears in; it collapses every sense of a polysemous word into one vector.== This is the hard ceiling. The fix is **contextual embeddings** — ELMo, then BERT — where the vector for 'bank' is *computed from the whole sentence at inference time*, so 'river bank' and 'bank account' get *different* vectors. That single limitation is the bridge from this module to the transformer era: static → contextual is *the* leap.",
    ],
    keyPoints: [
      "**Distributional hypothesis: a word is known by the company it keeps.** Words in similar contexts get similar vectors — meaning emerges from co-occurrence statistics, with zero human labels. Word2Vec and GloVe are two machines for compressing that signal into dense per-word vectors.",
      "**Word2Vec = prediction. Skip-gram predicts context from the center word; CBOW predicts the center from context.** Skip-gram wins on rare words / small data (each occurrence yields several training pairs); CBOW averages context, is faster, and wins on large corpora. The vectors are the side effect of learning to predict.",
      "**The full softmax over the whole vocabulary is the bottleneck.** Two fixes: negative sampling reframes it as cheap binary 'real pair vs sampled noise' logistic discrimination (update ~k+1 words, not V); hierarchical softmax uses a binary tree so prediction costs ~log(V), not V.",
      "**Analogies are vector arithmetic: king − man + woman ≈ queen.** The space learns approximately linear structure — a consistent 'gender' or 'capital-of' direction — so meaning-differences become constant offsets. These regularities emerge purely from co-occurrence, never labeled.",
      "**GloVe factorizes the GLOBAL word-word co-occurrence matrix (via ratios of co-occurrence probabilities); Word2Vec learns from LOCAL sliding windows.** Both are STATIC embeddings — one frozen vector per word — so 'bank' (river vs money) collapses to one point. That ceiling motivates contextual embeddings (ELMo/BERT).",
    ],
    recap: [
      "**Distributional hypothesis:** a word is known by the company it keeps — similar contexts ⇒ similar vectors, no labels needed.",
      "**Word2Vec:** Skip-gram (center→context, better for rare words/small data) vs CBOW (context→center, faster, better on big data). Vectors are the by-product of prediction.",
      "**Softmax over all V is too costly** → negative sampling (binary real-vs-noise logistic, ~k+1 updates) or hierarchical softmax (binary tree, ~log V).",
      "**Analogies = vector math:** king − man + woman ≈ queen → the space has emergent linear structure (a 'gender' direction, a 'capital-of' direction).",
      "**GloVe** = factorize the global co-occurrence matrix (ratios of probabilities); Word2Vec = local windows. Both STATIC — one vector per word → 'bank' collapses → motivates contextual (ELMo/BERT).",
    ],
    mcqs: [
      {
        question: "You're training word vectors on a small, specialized legal corpus with many rare terms. A colleague asks whether to use Skip-gram or CBOW. What's the correct recommendation and why?",
        options: [
          "CBOW, because averaging the context words into a single prediction target concentrates far more gradient signal onto each rare word than skip-gram's separate per-context predictions ever realistically could",
          "Neither is preferable on a small corpus; convergence quality depends only on the embedding dimensionality chosen and the learning rate schedule, not on the prediction direction at all",
          "Skip-gram, because predicting each context word separately from the center yields several training pairs per occurrence, giving rare words multiple updates that CBOW's averaged prediction misses",
          "CBOW, because it builds one shared softmax layer over the vocabulary that automatically reweights gradients toward infrequent tokens during every training step",
        ],
        correct: 2,
        explanation: "Option C is correct: skip-gram predicts each context word independently from the center, so one occurrence of a rare term generates several separate (center, context) pairs — several gradient updates — exactly the extra signal a rare word needs. CBOW instead averages the context into a single prediction, smoothing over rare words rather than reinforcing them, so options A and D (both defending CBOW) invert the real mechanism: averaging dilutes signal, it doesn't concentrate it, and there is no vocabulary-wide reweighting toward rare terms in the softmax. Option B is wrong because the prediction direction does materially change rare-word quality, not just training speed.",
      },
      {
        question: "Naive Skip-gram requires a softmax over the entire vocabulary for every training pair, which is prohibitively expensive. How does negative sampling make training tractable?",
        options: [
          "It reframes the task as a cheap binary problem — score the true pair high and sampled 'noise' pairs low — so each update touches only about k+1 word vectors, not the full vocabulary",
          "It precomputes the full softmax denominator once at model initialization time and reuses that fixed normalization constant across every subsequent pair and every later training epoch",
          "It restricts training to only the 10,000 most frequent words in the vocabulary, dropping every rare token entirely so the softmax denominator stays small enough to compute",
          "It replaces the softmax with a hierarchical binary Huffman tree over the vocabulary, so each prediction costs about log2(V) node decisions instead of a full normalization",
        ],
        correct: 0,
        explanation: "Option A is correct: negative sampling turns the expensive V-way softmax into a cheap binary question — is this (center, context) pair real or sampled noise? — training a logistic classifier to score the true pair high and a handful (k≈5–20) of random negatives low, so each step updates only about k+1 word vectors instead of the entire vocabulary. Option D describes a real alternative technique, hierarchical softmax, which does use a binary tree for ~log(V) cost — but that's a different fix, not what negative sampling does. Option B is wrong because the softmax denominator depends on the current parameters and target word, so it can't be precomputed once and reused. Option C is wrong because negative sampling doesn't delete vocabulary; it changes the training objective while keeping every word.",
      },
      {
        question: "A teammate is surprised that 'bank' returns odd neighbors — it sits between 'river' and 'account'. You're using GloVe embeddings. Which TWO statements correctly explain the fundamental cause and its fix?",
        options: [
          "Static embeddings assign exactly one fixed vector per word type, so a polysemous word like 'bank' must represent every sense with a single averaged point",
          "GloVe factorizes local sliding windows rather than global co-occurrence counts across the whole corpus, and that local-only view is what causes 'bank' senses to merge",
          "Contextual embeddings compute a word's vector from the surrounding sentence at inference time, so 'river bank' and 'bank account' receive different vectors",
          "GloVe was simply undertrained on this corpus; running more epochs would eventually separate 'bank' into two distinct vectors without changing the architecture",
        ],
        correct: [0, 2],
        explanation: "Options A and C are both correct and work together: static embeddings (GloVe and Word2Vec alike) assign exactly one fixed vector per word type, so a polysemous word like 'bank' has no way to differ by sentence and collapses every sense into a single averaged point (A). Contextual embeddings such as ELMo and BERT fix this by computing a word's vector from its entire surrounding sentence at inference time, so 'river bank' and 'bank account' get different vectors (C) — that's precisely the structural upgrade that resolves the collapse described in A. Option B misstates the method: GloVe factorizes GLOBAL co-occurrence counts, not local windows, so this isn't the mechanism behind the collapse. Option D is wrong because the one-vector-per-type constraint is architectural, not a training-duration issue — no amount of extra training lets a static embedding represent two senses at once.",
      },
    ],
    takeaway: "Word2Vec and GloVe both operationalize the distributional hypothesis — a word is known by the company it keeps — but Word2Vec learns from local sliding windows (Skip-gram predicts context, better for rare words; CBOW predicts the center, faster) while GloVe factorizes the global co-occurrence matrix via ratios of probabilities; both sidestep the full-vocabulary softmax with negative sampling or hierarchical softmax, and both reveal emergent linear structure (king − man + woman ≈ queen). Their shared, defining limitation is that they are static — one frozen vector per word — so a polysemous word like 'bank' collapses to a single point, which is exactly the ceiling contextual embeddings (ELMo/BERT) were built to break.",
  },

  "nlp-rnn-lstm-gru": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "The last module ended on static word vectors — and the hard ceiling that 'bank' collapses to one vector no matter its sense. This module leaves that ceiling alone and attacks a different gap: language doesn't arrive one word at a time in isolation; it arrives as a *sequence*, where what came before changes what comes next. So the next engineering question: how do you build a network that reads a sequence of any length and carries understanding forward as it goes?\n\nThe natural design is a machine with a notepad. Read one word, update the notepad, move to the next word carrying the notepad along — so by the end of the sentence the notepad holds a running summary of everything seen so far. Crucially, the same small machine does every step; only the notepad changes. That design is a **recurrent neural network (RNN)**, and the notepad is its **hidden state**.\n\nIt works — and then it fails in a maddeningly specific way: the machine remembers the last few words vividly and the beginning of the sentence barely at all. A review that opens with 'The camera...' and lands its verdict twenty words later gets misread, because by the time the verdict arrives, the subject has faded off the notepad. The reason isn't sloppy engineering — it's arithmetic, one number multiplied by itself twenty times, and once you see it you'll understand why no amount of tuning fixes a plain RNN.\n\nThis module builds that failure from the mechanism up, then the two celebrated repairs — the **LSTM**, which adds a protected conveyor belt for long-term memory with learned gates deciding what to keep, and the **GRU**, its lighter two-gate cousin — and closes with the one limitation no gate could ever fix, the one that handed the field to the Transformer. Take your time with the multiplication argument in the middle; it's a perennial interview question about this architecture family.",
    scenario: "You're the on-call engineer for a sentiment model that reads product reviews, and it keeps botching a specific pattern: 'The camera, which despite the frankly exhausting marketing and a price that made me wince, is *terrible*.' It flags this as positive. The verdict word 'terrible' is 20 tokens away from where the sentiment should attach, and your recurrent model has effectively *forgotten* the beginning of the sentence by the time it reaches the end. Before you reach for a fancier architecture, you need to explain to the team the precise mechanical reason: backpropagation-through-time multiplies the same recurrent-weight factor once per token traversed backward, and over 20 tokens a factor under 1 decays geometrically — 0.9²⁰ ≈ 0.12, already faint; 0.5²⁰ ≈ 0.000001, effectively gone — so the gradient connecting 'camera' to 'terrible' vanishes before it can update anything. Swap in an **LSTM**: its cell state carries information forward by addition, not repeated multiplication, so the gradient survives the same 20-step trip instead of decaying, and its forget/input/output gates learn to keep 'sentiment: negative' alive across the whole review. A **GRU** would patch the same vanishing-gradient wound with two gates instead of three, trading a little expressiveness for fewer parameters and faster training. But even LSTMs and GRUs stay eventually dethroned for a separate reason no gate can touch: computing token 50 still requires token 49 first, so the whole sequence is an unavoidable chain that can't be parallelized across GPUs — exactly the bottleneck the Transformer removed by replacing recurrence with attention.",
    explanation: [
      "Start with the core mechanism, because everything else is a reaction to it. A **recurrent neural network** processes a sequence one step at a time, carrying a **hidden state** `h` — a fixed-size vector that is a *running summary of everything seen so far.* At each step it takes the current input `xₜ` and the previous hidden state `hₜ₋₁`, mixes them, and produces the new hidden state `hₜ`. ==The same weights are reused at every timestep — that weight-sharing is what lets one small network handle a sequence of any length.== You can picture the loop **unrolled through time**: the same cell copied once per token, each copy feeding its hidden state into the next.",
      { type: "illustration", label: "An RNN unrolled through time", content: `   x1        x2        x3        x4
    │         │         │         │
    ▼         ▼         ▼         ▼
  [cell]──►[cell]──►[cell]──►[cell]──► hidden state hₜ
    h1        h2        h3        h4     (running summary)
    ▲         ▲         ▲         ▲
   SAME weights W reused at EVERY step

  hₜ = f( W · [hₜ₋₁, xₜ] )     one small net, any length` },
      "To train this you need gradients, and here's where the trouble is born. **Backpropagation-through-time (BPTT)** unrolls the network and backpropagates the loss at the end all the way back to the early steps. But to reach step 1 from a loss at step 20, the gradient must flow *backward through every intermediate step*, and at each step it gets **multiplied by (roughly) the same recurrent weight and the activation's derivative.** ==Multiplying the same-ish factor ~20 times is a geometric process: if the factor is < 1, the gradient shrinks toward zero (**vanishing**); if > 1, it explodes toward infinity (**exploding**).== Think 0.9²⁰ ≈ 0.12 (already faint) versus 0.5²⁰ ≈ 0.000001 (effectively gone), and on the other side 1.5²⁰ ≈ 3325 (blows up).",
      { type: "illustration", label: "Why gradients vanish or explode over distance", content: `Loss at step 20 → gradient flows BACK to step 1
   ∂L/∂h₁  ∝  (W·σ')^(20)   ← same factor multiplied ~20 times

   factor 0.5 :  0.5^20  ≈ 0.00000095   → VANISH (signal gone)
   factor 0.9 :  0.9^20  ≈ 0.12         → faint, decays
   factor 1.0 :  1.0^20  = 1            → the knife-edge
   factor 1.5 :  1.5^20  ≈ 3325         → EXPLODE (blows up)

   distance from loss →  0   5    10    15    20
   gradient magnitude →  ██  ▆   ▃    ▁     ·   (decays with distance)` },
      "This is not a minor numerical nuisance — it is *the* reason plain RNNs have short memory. ==A vanishing gradient means the early tokens receive almost no learning signal about the final loss, so the network literally *cannot learn* long-range dependencies: the weights that would connect 'camera … terrible' never get meaningfully updated.== Exploding gradients are the louder but easier twin — they cause NaNs and instability, and are largely tamed by *gradient clipping* (cap the norm). Vanishing is the insidious one: no error, no crash, just a model that silently forgets. This capped 'effective memory' at a handful of steps and is exactly why your 20-token sentence fails.",
      "**The LSTM** (Long Short-Term Memory) was engineered to defeat vanishing gradients with one central idea: a separate **cell state** `C` — think of it as a *conveyor belt* running straight through the sequence with only minor, *additive* interactions. ==Because information moves along the cell state mostly by addition (not repeated multiplication by a weight), the gradient can flow across many steps *without* the geometric decay — the cell state is a gradient highway.== Around this belt sit three learned **gates**, each a small sigmoid network outputting values in [0,1] that act as soft valves: the **forget gate** decides what fraction of the old cell state to erase; the **input gate** decides what new information to write; the **output gate** decides what part of the cell state to expose as the hidden state. The gates *learn* when to remember and when to forget, so the LSTM can carry 'the subject is singular' or 'sentiment is negative' across long spans.",
      { type: "illustration", label: "LSTM cell — the cell-state conveyor belt + gates", content: `        forget      input                     output
         gate f      gate i                     gate o
           │           │                           │
   Cₜ₋₁ ──►(×)───────►(+)──────────────────────────────► Cₜ   ◄─ cell state
           │           ▲                           │        (conveyor belt:
        "erase        "write                     "expose      ADDITIVE path,
         some"         new"                        as h"      gradient highway)
                                                   ▼
   hₜ₋₁ ─────────────────────────────────────────► hₜ   ◄─ hidden state

   gates ∈ [0,1] : soft valves that LEARN what to keep / add / show.
   Additive belt ⇒ gradient survives across many steps (no geom. decay).` },
      "**The GRU** (Gated Recurrent Unit) is the lighter cousin — same goal, fewer moving parts. It **merges the cell state and hidden state into one**, and uses just **two gates** instead of three: a **reset gate** (how much past state to ignore when computing the candidate update) and an **update gate** (how much to blend old state vs new — it fuses the LSTM's forget and input roles into a single knob). ==Fewer gates and no separate cell state means **fewer parameters**, so a GRU trains faster and needs less data, often matching LSTM quality; the LSTM's extra expressiveness sometimes edges ahead on very long or complex dependencies.== In practice both were the workhorses of NLP for years — the choice was usually 'try both, pick what validates better.'",
      "Now the limitation that no gate could fix, and it's the whole reason the field moved on. ==Recurrence is *inherently sequential*: computing `hₜ` **requires** `hₜ₋₁`, which requires `hₜ₋₂`, and so on — you cannot compute step 50 until you've computed step 49.== This means the forward pass over a length-N sequence is an unavoidable chain of N dependent steps that *cannot be parallelized across the sequence*, no matter how many GPUs you have. LSTMs and GRUs fixed the *memory* problem but were stuck with this *speed* problem — and on modern hardware built for massive parallelism, that serial bottleneck is fatal for training on huge datasets. ==This exact limitation is what the Transformer removed: by replacing recurrence with attention, every position is computed *in parallel*, and long-range dependencies are one attention hop away instead of many multiplicative steps away.== The RNN family taught the field what a sequence model must do; the Transformer found a parallelizable way to do it.",
    ],
    keyPoints: [
      "**An RNN carries a hidden state — a fixed-size running summary of everything seen so far — reusing the same weights at every timestep (unrolled through time).** Trained by backpropagation-through-time (BPTT), which sends the final loss's gradient back through every step.",
      "**Vanishing/exploding gradients come from repeated multiplication by ~the same factor down the chain (a geometric process): <1 shrinks to zero, >1 blows up.** Vanishing is why plain RNNs can't learn long-range dependencies — early tokens get almost no learning signal, capping effective memory at a few steps.",
      "**The LSTM adds a cell-state 'conveyor belt' whose additive path is a gradient highway, plus forget/input/output gates (soft [0,1] valves) that learn what to erase, write, and expose.** Additive flow avoids the geometric decay, so information survives across long spans.",
      "**The GRU is a lighter 2-gate variant (reset + update) that merges cell and hidden state — fewer parameters, faster training, often matching the LSTM.** The update gate fuses the LSTM's forget and input roles; LSTMs sometimes edge ahead on very long dependencies.",
      "**The unavoidable limitation is that recurrence is inherently sequential: step t needs step t−1, so the sequence can't be parallelized.** Gating fixed memory but not this speed bottleneck — exactly what the Transformer removed by replacing recurrence with attention (all positions computed in parallel).",
    ],
    recap: [
      "**RNN = hidden state carrying a running summary**, same weights every step (unroll through time); trained via BPTT.",
      "**Vanishing/exploding gradient:** backprop multiplies ~the same factor ~N times → <1 vanishes (0.5²⁰≈1e-6), >1 explodes. Vanishing caps long-range memory — early tokens get no signal.",
      "**LSTM:** cell-state conveyor belt (additive ⇒ gradient highway) + forget/input/output gates (learned [0,1] valves) → carries info across long spans.",
      "**GRU:** lighter 2-gate (reset + update), merges cell+hidden, fewer params, faster, often as good; LSTM sometimes wins on very long deps.",
      "**Hard limit:** recurrence is inherently SEQUENTIAL (step t needs t−1) → no parallelism across the sequence. The exact bottleneck the Transformer removed with attention.",
    ],
    mcqs: [
      {
        question: "Your plain RNN sentiment model consistently fails when the verdict word is ~20 tokens from where it should attach. What is the precise mechanical cause?",
        options: [
          "The hidden state vector has a fixed number of discrete memory slots, and once about 20 tokens have been processed those slots overflow, silently discarding the oldest stored content first each time",
          "RNNs process tokens in a randomized order internally during the forward pass, so tokens far from the end of the sequence are frequently skipped and never encoded at all",
          "Exploding gradients cause the loss to overflow into NaN values after roughly 20 steps, which is why the network's effective memory is capped at exactly that distance",
          "Backpropagation-through-time multiplies the gradient by roughly the same recurrent factor at every step; repeating that ~20 times drives it toward zero, so early tokens get almost no signal",
        ],
        correct: 3,
        explanation: "Option D is correct: backpropagation-through-time sends the final loss's gradient back through every intermediate step, and at each step it's multiplied by roughly the same recurrent weight and activation derivative. Repeating that multiplication about 20 times is a geometric process — with a factor below 1 the gradient shrinks toward zero, so the earliest tokens receive almost no learning signal and the network cannot learn to connect them to the final loss. Option A is a misconception: the hidden state is a fixed-size vector that gets continually overwritten, not a fixed number of discrete slots that fill up. Option B is wrong because RNNs process tokens strictly in sequence order, never randomly. Option C confuses the two failure modes — exploding gradients cause instability and NaNs (tamed by clipping); it's vanishing gradients, not exploding ones, that silently cap effective memory.",
      },
      {
        question: "The LSTM was designed specifically to combat vanishing gradients. Which TWO statements correctly describe the architectural features that achieve this?",
        options: [
          "A much larger hidden state that stores the last 20 tokens verbatim in an expanded circular buffer, so nothing said earlier in the sequence is ever overwritten by any later, newer input token",
          "A cell state that flows through the sequence via mostly additive updates — a conveyor belt — letting gradients travel across steps without the multiplicative decay that causes vanishing",
          "Backpropagation-through-time is dropped entirely, and the network instead trains only on the loss computed at the final timestep of each input sequence it processes",
          "Forget, input, and output gates — small sigmoid networks acting as learned [0,1] valves — decide what fraction of the cell state to erase, write, and expose at every timestep",
        ],
        correct: [1, 3],
        explanation: "Options B and D are both correct and describe the two halves of the same fix: the LSTM's cell state moves through time via mostly additive updates — a 'conveyor belt' — so gradients can flow across many steps without the repeated sub-1 multiplication that causes vanishing (B); surrounding that belt, the forget, input, and output gates are learned sigmoid networks acting as [0,1] valves that decide what fraction of the cell state to erase, write, and expose at each step (D). Neither piece alone is the whole story — the additive path provides the gradient highway, and the gates provide the learned control over it. Option A is wrong: the LSTM doesn't store tokens verbatim in an expanded buffer; it changes how gradients flow, not raw memory capacity. Option C is wrong: LSTMs are still trained with full backpropagation-through-time — they change the cell's internal structure, not the training algorithm.",
      },
      {
        question: "Even a well-tuned LSTM/GRU was ultimately replaced by the Transformer for large-scale training. What is the fundamental limitation of the recurrent family that gating did NOT fix?",
        options: [
          "Gated RNNs still suffer the same catastrophic vanishing-gradient collapse as plain RNNs once a sequence exceeds about 100 tokens, regardless of any gating mechanism applied to the cell",
          "Recurrence is inherently sequential — computing hₜ requires hₜ₋₁ — so a length-N sequence is a chain of N dependent steps that can't be parallelized, fatal on hardware built for massive parallelism",
          "LSTMs and GRUs have no built-in mechanism for representing word order at all, so a separate learned positional-encoding vector must be added before the sequence can be processed",
          "Gated cells require substantially more trainable parameters per timestep than an equivalently sized Transformer layer does, and that extra parameter count is what makes each individual step run slower",
        ],
        correct: 1,
        explanation: "Option B is correct: recurrence is sequential by construction — computing hₜ requires hₜ₋₁ — so a length-N sequence is an unavoidable chain of N dependent computations that cannot be parallelized across positions, no matter how much hardware is available. On hardware built for massive parallelism, that serial chain is the bottleneck gating never touched, and it's exactly what the Transformer removes by using attention so every position computes in parallel. Option A is wrong because gating specifically mitigates vanishing gradients — LSTMs and GRUs handle long sequences far better than plain RNNs, so memory wasn't the surviving problem. Option C is wrong because RNNs inherently encode order through step-by-step processing; it's Transformers that must add positional encodings back in. Option D is wrong because the bottleneck is the sequential dependency between steps, not the parameter count of any individual layer.",
      },
    ],
    takeaway: "A plain RNN carries a hidden state as a running summary but is crippled by vanishing/exploding gradients — repeated multiplication down the unrolled chain during BPTT — which caps its effective memory to a few steps. The LSTM fixes this with a cell-state conveyor belt (an additive gradient highway) plus forget/input/output gates, and the GRU offers a lighter 2-gate version with fewer parameters; but neither can escape recurrence's inherently sequential nature (step t needs step t−1), the exact non-parallelizable bottleneck the Transformer removed by replacing recurrence with attention.",
  },

  "nlp-seq2seq-attention": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "The last module ended on recurrence's unfixable ceiling: a length-N sequence is an unavoidable chain of N dependent steps, and no gate can parallelize it. Set that ceiling aside for a moment — this module is about a different gap. Plenty of tasks don't just *read* a sequence — they read one sequence and *write* a different one: a French sentence in, an English sentence out. Different lengths, different word order, no one-to-one mapping. How do you wire two recurrent networks together so that one understands and the other speaks?\n\nThe first answer is elegant: let one network read the whole source sentence and boil it down to a single summary vector — a 'thought' — then hand that vector to a second network that unrolls it into the target sentence, word by word. Reader and writer, connected by one vector. And it genuinely works... on short sentences.\n\nNow do what the first seq2seq translation teams did: feed it a thirty-word sentence, and watch the translation start strong and drift into nonsense by the end. Before reading on, try to guess the flaw — it's hiding in plain sight in the design itself. One vector, fixed size, no matter how long the source. A sentence's worth of meaning squeezed through a pipe that never widens: the longer the sentence, the more the early words get crushed out of the summary.\n\nThe repair is one of the most consequential ideas in modern AI: stop forcing everything through one vector — keep *every* word's representation, and let the writer glance back at *all* of them, choosing what to focus on afresh at every word it writes. That glancing-back-with-focus mechanism is called **attention**; this module builds it in its original form (**seq2seq** with Bahdanau's and Luong's scoring recipes), and the closing turn is history: in 2017 someone asked, if attention is doing the real work, why keep the recurrence at all? — and that question's answer is the Transformer. You're about to read the origin story of the mechanism every modern LLM runs on.",
    scenario: "You're on a machine-translation team in 2015, and your encoder-decoder model translates short French phrases into English beautifully. Then the sentences get longer, and quality falls off a cliff — a 30-word sentence comes back garbled, with the end of the translation drifting off-topic as if the model forgot how the source began. A colleague stares at the architecture and asks: 'We're squeezing the *entire* source sentence into one final hidden vector before the decoder ever starts. How is one fixed-size vector supposed to hold a 30-word sentence?' That question is the crack that attention was invented to fill. The fix: stop discarding the encoder's per-word hidden states after computing that one summary vector — keep all of them, and let the decoder compute alignment weights over every source word at each output step, reading a context vector that's their weighted sum. When your decoder is about to emit a word near the end of a long sentence, it can now put most of its weight on the one or two source words that word actually depends on, instead of relying on whatever survived the trip through a single overflowing vector. Score those alignments with Bahdanau's small learned network if you want a scoring function that adapts, or Luong's plain dot product if you want something cheaper — either way, the fixed-vector bottleneck is gone. And unknowingly, your team is one conceptual step away from the idea that will become 'Attention Is All You Need': if attention is doing the real work, why keep the recurrence at all?",
    explanation: [
      "Begin with the architecture the whole module is about. A **sequence-to-sequence (seq2seq)** model handles tasks where a variable-length input maps to a variable-length output — machine translation is the canonical case. It has two halves: an **encoder** (usually an RNN/LSTM) that *reads* the entire source sentence and compresses it into a representation, and a **decoder** (another RNN/LSTM) that *generates* the target sentence one word at a time, conditioned on that representation. ==In the original design, the encoder's *final hidden state* — a single fixed-size vector, sometimes called the 'thought vector' — is the *only* thing passed to the decoder. The decoder must reconstruct the entire translation from that one vector.==",
      { type: "illustration", label: "Vanilla seq2seq — everything through one vector", content: `  ENCODER (reads French)                DECODER (writes English)
  je   suis   étudiant                    I     am    a    student
   │     │      │                          ▲     ▲     ▲      ▲
   ▼     ▼      ▼                          │     │     │      │
 [e]──►[e]──►[e]────►  ●  ────────────────►[d]──►[d]──►[d]──►[d]
                       ▲
             ONE fixed-size vector "c"
             (the encoder's final hidden state)

  The whole source must be crammed into c. Long sentence ⇒ c overflows,
  early words get blurred, the decoder drifts. The BOTTLENECK.` },
      "Name the failure precisely, because it's the crux. This is the **fixed-vector bottleneck** (or information bottleneck). ==A single fixed-size vector has *constant* capacity, but source sentences have *variable, unbounded* length — so as sentences get longer, you're cramming more and more information through the same narrow pipe, and the earliest words get blurred or overwritten.== A short phrase fits; a 30-word sentence does not. This is *exactly* the symptom in the scenario: the decoder does fine at the start (recent encoder memory) and drifts near the end (early source content already lost). Making the vector bigger only postpones the wall — the fundamental mismatch is *fixed capacity vs unbounded length.*",
      "The fix is beautiful and simple in hindsight: **attention.** Instead of forcing the decoder to work from one summary vector, *keep all of the encoder's hidden states* — one per source word — and let the decoder **look back at all of them at every output step.** ==At each step of generating the target, the decoder computes a set of **alignment weights** — one weight per source word saying 'how relevant is this source word to the word I'm about to produce?' — and reads a **context vector** that is the *weighted sum* of the encoder states.== So when the decoder is about to emit 'student', it puts most weight on the source word 'étudiant' and reads mostly *that* word's representation. The decoder gets a *fresh, focused* view of the source at every step, instead of one stale summary.",
      { type: "illustration", label: "Attention — a fresh weighted view every step", content: `  Encoder states (kept, one per source word):
     h(je)   h(suis)   h(étudiant)
       │        │           │
       └────────┼───────────┘
                ▼
   Decoder emitting "student":
     align weights:  je=0.05  suis=0.10  étudiant=0.85   ← focus!
     context cₜ = 0.05·h(je) + 0.10·h(suis) + 0.85·h(étudiant)
                  ▼
                "student"

  Different output step ⇒ different weights ⇒ different context.
  No single bottleneck: the whole source stays available, re-focused
  per step.` },
      "Two classic formulations differ only in *how* they score the match between a decoder state and each encoder state, and interviewers love the contrast. **Bahdanau attention** (2014, 'additive') feeds the decoder's previous state and each encoder state through a small feed-forward network (a learned layer with a tanh) to produce each alignment score — it *learns* the scoring function. **Luong attention** (2015, 'multiplicative') scores with a simple **dot product** (or a bilinear `hᵈ·W·hᵉ`) between the decoder and encoder states — cheaper, no extra network. ==Both then softmax those scores into weights that sum to 1 and take the weighted sum of encoder states. Additive = a learned MLP scorer; multiplicative = a dot-product scorer. The dot-product form is the one that scales up.==",
      { type: "illustration", label: "Bahdanau (additive) vs Luong (multiplicative)", content: `Both produce alignment weights, then softmax, then weighted sum.
They differ only in the SCORE function:

  BAHDANAU (additive):   score = vᵀ · tanh( W₁·hᵈ + W₂·hᵉ )
     a small feed-forward net LEARNS the match.  More params.

  LUONG (multiplicative): score = hᵈ · hᵉ    (dot)
                     or   score = hᵈ · W · hᵉ (general)
     just a dot product.  Cheaper, no extra net.

  weights = softmax(scores) ,   context = Σ weightᵢ · hᵉᵢ
  → dot-product scoring is what "Attention Is All You Need" scales up.` },
      "There's a bonus that makes attention *interpretable*, and it's worth knowing for an interview. Stack the alignment weights for every (target word, source word) pair into a grid and you get an **alignment matrix** — a *soft word alignment* between the two languages. ==In translation this matrix lights up almost like a bilingual dictionary: 'student' aligns to 'étudiant', 'am' to 'suis', and it even captures reordering (adjectives and nouns swap order across languages).== Nobody labeled these alignments; they emerged from learning to translate well. It's one of the earliest cases of a deep model giving a genuinely readable window into *what it's attending to.*",
      "Now the framing that turns this from a translation trick into the seed of a revolution. Attention here is still *bolted onto* recurrence: the encoder and decoder are still RNNs, and attention is an *extra* mechanism that lets the decoder peek at all encoder states. ==The radical leap of 'Attention Is All You Need' (2017) was to ask: if attention is doing the real work of relating positions to each other, do we even *need* the recurrence? Drop the RNN entirely, and let *every* position attend to *every* other position directly — 'self-attention'.== That move (a) kills the sequential bottleneck from the previous module (all positions computed in parallel) and (b) makes any two tokens one attention hop apart regardless of distance. The Bahdanau/Luong context vector is the direct conceptual ancestor of the transformer's attention — same 'compute relevance weights, take a weighted sum,' now generalized to attend *everywhere*, with no recurrence left.",
    ],
    keyPoints: [
      "**Seq2seq = encoder reads the source into a representation, decoder generates the target one token at a time.** In vanilla seq2seq the *only* thing passed across is the encoder's single final hidden state (the 'thought vector'), from which the decoder must reconstruct the whole output.",
      "**The fixed-vector bottleneck: one constant-size vector vs variable, unbounded source length.** Long sentences cram too much through the narrow pipe; early words blur and the decoder drifts near the end. Bigger vectors only postpone the wall — the mismatch is fixed capacity vs unbounded length.",
      "**Attention keeps ALL encoder hidden states and, at every decoder step, computes alignment weights (relevance per source word) and reads a weighted-sum context vector.** The decoder gets a fresh, focused view of the source per step instead of one stale summary — no bottleneck.",
      "**Bahdanau (additive) scores alignment with a small learned feed-forward net (tanh); Luong (multiplicative) scores with a dot product (or bilinear).** Both softmax the scores and take a weighted sum of encoder states. The dot-product form is what later scales up. The stacked weights form an alignment matrix = soft word alignment.",
      "**This attention is the direct conceptual seed of self-attention.** 'Attention Is All You Need' dropped the recurrence entirely and let every position attend to every other ('self-attention'), killing the sequential bottleneck (parallel) and making any two tokens one hop apart. Same 'weights + weighted sum,' generalized to attend everywhere.",
    ],
    recap: [
      "**Seq2seq:** encoder reads source → decoder generates target; vanilla version passes only the encoder's final hidden vector (the 'thought vector').",
      "**Fixed-vector bottleneck:** constant-size vector vs unbounded sentence length → long inputs blur early words, decoder drifts. Bigger vector only delays the wall.",
      "**Attention:** keep ALL encoder states; per decoder step compute alignment weights + a weighted-sum context vector → fresh focused view every step, no bottleneck.",
      "**Bahdanau (additive, learned MLP + tanh) vs Luong (multiplicative, dot product).** Softmax scores → weighted sum. Stacked weights = alignment matrix = soft word alignment (emergent, interpretable).",
      "**Seed of the Transformer:** 'Attention Is All You Need' dropped recurrence, let every position attend to every other (self-attention) → parallel + any two tokens one hop apart.",
    ],
    mcqs: [
      {
        question: "Your vanilla seq2seq translation model is excellent on short phrases but degrades badly on long sentences, with the end of the output drifting off-topic. What is the root cause?",
        options: [
          "The fixed-vector bottleneck: the whole variable-length source is compressed into one constant-size hidden state, so as sentences grow, the earliest words get blurred or overwritten by the end",
          "The decoder RNN has too few stacked recurrent layers to generate long output sequences correctly, and simply adding more layers would resolve the degradation entirely on its own",
          "The encoder and decoder are trained on separately mismatched vocabularies here, so longer sentences simply contain more out-of-vocabulary words that the decoder is structurally unable to produce",
          "Attention is over-concentrating all of its weight on the final source word alone here, causing the decoder to effectively ignore everything that came earlier in the sentence",
        ],
        correct: 0,
        explanation: "Option A is correct: vanilla seq2seq compresses the entire variable-length source sentence into a single constant-size final hidden state, so as sentences grow, more information is forced through the same narrow pipe and the earliest words get blurred or overwritten by the time the decoder reaches the end — exactly why quality holds up on short phrases and collapses on long ones. Option B misattributes the failure to decoder depth; the bottleneck is the single-vector interface between encoder and decoder, and adding layers doesn't remove it. Option C is unrelated — a vocabulary mismatch wouldn't produce this graceful-then-catastrophic degradation with sentence length. Option D describes an attention mechanism, but vanilla seq2seq has no attention at all — that absence is the whole problem, not an attention model over-focusing.",
      },
      {
        question: "Bahdanau (additive) and Luong (multiplicative) attention are the two classic formulations. Which TWO statements correctly describe how they differ?",
        options: [
          "Bahdanau attention restricts itself to only the single final encoder state, while Luong attention is the version that first introduced access to every individual encoder state",
          "Bahdanau ('additive') passes the decoder state and each encoder state through a small learned feed-forward network with a tanh nonlinearity to score each alignment weight",
          "Luong ('multiplicative') scores alignment with a dot product — or a bilinear hᵈ·W·hᵉ form — cheaper than a learned scorer, and the form later scaled up in the Transformer",
          "Luong attention removes the recurrent decoder network entirely, generating target words directly as a weighted sum of raw encoder states with no decoder RNN at all",
        ],
        correct: [1, 2],
        explanation: "Options B and C are both correct and capture the essential contrast: Bahdanau ('additive') attention passes the decoder state and each encoder state through a small learned feed-forward network with a tanh to produce each alignment score (B), while Luong ('multiplicative') attention scores with a simple dot product or bilinear form, which is cheaper and has no extra network — and it's this dot-product style that later scales up in the Transformer (C). Both then softmax their scores and take a weighted sum of encoder states; they differ only in how the score itself is computed. Option A is wrong: both mechanisms attend to all encoder states — attending to only the final state would just be the vanilla bottleneck they were built to escape. Option D is wrong: both retain a decoder that generates the target step by step; neither removes it.",
      },
      {
        question: "Why is the attention mechanism in a 2015 seq2seq translation model considered the direct conceptual seed of 'Attention Is All You Need'?",
        options: [
          "Because the Transformer keeps the exact same RNN encoder-decoder architecture from seq2seq attention, only replacing the alignment scorer with a much faster, hand-tuned custom GPU kernel",
          "Because both seq2seq attention and the Transformer rely on the exact same single fixed 'thought vector' produced once at the very end as their core source representation",
          "Because the leap was mainly a much larger training corpus and roughly 10x more compute, with the attention mechanism itself carried over completely unchanged from 2015",
          "Because seq2seq attention already computes relevance weights over states and takes a weighted sum; the Transformer generalized this by dropping recurrence entirely",
        ],
        correct: 3,
        explanation: "Option D is correct: seq2seq attention already performs the core operation that defines self-attention — score how relevant each state is, softmax those scores into weights, and take a weighted sum to form a context vector. 'Attention Is All You Need' generalized exactly that operation by dropping recurrence entirely and letting every position attend to every other position, which both parallelizes computation across the sequence and puts any two tokens one attention hop apart regardless of distance. Option A is wrong because the Transformer removes the RNN encoder and decoder entirely — that removal is the whole point, not a kernel swap. Option B is wrong because the Transformer abandons the single fixed thought vector; attention exists precisely to escape it. Option C is wrong because the architectural shift to self-attention was the central innovation, not merely a larger corpus or more compute.",
      },
    ],
    takeaway: "Vanilla seq2seq forces the entire variable-length source through the encoder's single fixed-size final hidden state — the fixed-vector bottleneck — which is why translation quality collapses on long sentences. Attention removes the bottleneck by keeping all encoder states and, at each decoder step, computing alignment weights (Bahdanau's learned additive scorer or Luong's cheaper dot-product) and reading a weighted-sum context vector, yielding a fresh, focused view of the source per step plus an interpretable soft-alignment matrix. That 'relevance weights plus weighted sum' operation is the direct conceptual seed of self-attention: 'Attention Is All You Need' dropped the recurrence and let every position attend to every other, parallelizing the model and putting any two tokens one hop apart.",
  },
};
