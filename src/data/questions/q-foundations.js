// src/data/questions/q-foundations.js
// L0/L1/L2 question ladders — tokenizer + embeddings. Spread into PREP_QUESTIONS.
// Schema mirrors src/data/preplabQuestions.js:
//   id: "<topic>-l<0|1|2>-<n>"   topic: "tokenizer" | "embeddings"
//   tier: "L0" | "L1" | "L2"     difficulty: easy(L0) | medium(L1) | hard(L2)
//   gated: boolean               type: "mcq" | "text"
//   options/correct for mcq; keywords[] for text; explanation + trap always.

export const Q_FOUNDATIONS = [
  // ══════════════════════════════════════════════════════════════════════════
  // TOKENIZER
  // ══════════════════════════════════════════════════════════════════════════

  // ── L0: Define (3) ─────────────────────────────────────────────────────────
  {
    id: "tokenizer-l0-1", topic: "tokenizer", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "What does a tokenizer do in an LLM pipeline?",
    options: [
      "It compresses the model weights so they fit on a single GPU",
      "It converts raw text into a sequence of integer token IDs the model can consume, and back again",
      "It ranks retrieved documents by relevance before generation",
      "It applies the softmax over the vocabulary to pick the next word",
    ],
    correct: 1, keywords: [],
    explanation: "A tokenizer maps text to a sequence of integer IDs (encode) and IDs back to text (decode). The model never sees characters or words directly — it operates on these token IDs, which index into the embedding table. Tokenization is a deterministic pre-processing step, not a learned layer of the model itself (though the merge rules are learned once at training time).",
    trap: "Calling tokenization 'splitting text into words.' Modern subword tokenizers split on statistically learned units, not whitespace words — 'tokenization' itself becomes multiple tokens. Conflating a token with a word underestimates context cost by 20-30%.",
  },
  {
    id: "tokenizer-l0-2", topic: "tokenizer", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "Roughly how many English tokens does 1,000 words of typical prose become with a modern subword tokenizer (e.g. GPT-4 / cl100k)?",
    options: [
      "About 250 tokens — tokens are larger than words",
      "About 1,000 tokens — one token per word",
      "About 1,300 tokens — tokens are on average smaller than words",
      "About 4,000 tokens — one token per character",
    ],
    correct: 2, keywords: [],
    explanation: "The rule of thumb is ~0.75 words per token, i.e. ~1.33 tokens per word, so 1,000 words is roughly 1,300 tokens. Common words are single tokens, but longer or rarer words split into 2-4 subword pieces, pushing the average above one token per word. This ratio is what drives context-window and cost budgeting.",
    trap: "Assuming one-token-per-word. That undercounts by ~30% and blows through context budgets on long inputs. Code, JSON, and non-English text are far worse — often 2-3x more tokens per character.",
  },
  {
    id: "tokenizer-l0-3", topic: "tokenizer", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "What is a 'subword' token, and why do modern LLMs use subword tokenization instead of word-level?",
    options: [
      "A subword is a single character; character-level avoids ever seeing an unknown token",
      "A subword is a frequent character sequence (e.g. 'ing', 'tokeni'); it gives a fixed vocab that can still represent any word without out-of-vocabulary failures",
      "A subword is a whole word stored in a hash table for O(1) lookup",
      "A subword is a compressed embedding vector shared across similar words",
    ],
    correct: 1, keywords: [],
    explanation: "Subword tokenization (BPE, WordPiece, Unigram) learns a fixed vocabulary of frequent character sequences. Common words stay whole; rare/novel words decompose into known pieces. This bounds the vocabulary size (~30k-100k) while guaranteeing any string is representable — no out-of-vocabulary (OOV) token. Word-level tokenization needs a huge vocab and still fails on unseen words; character-level has no OOV problem but makes sequences very long.",
    trap: "Saying subwords are just 'word roots and suffixes' from linguistics. The splits are statistical, not morphological — BPE will merge 'th' or ' the' as a unit because it's frequent, with no regard for grammar.",
  },

  // ── L1: Deep single-concept (5) ────────────────────────────────────────────
  {
    id: "tokenizer-l1-1", topic: "tokenizer", tier: "L1", difficulty: "medium", gated: false, type: "mcq",
    question: "How does Byte-Pair Encoding (BPE) build its vocabulary during training?",
    options: [
      "It clusters word embeddings and keeps one token per cluster centroid",
      "It starts from individual characters/bytes and greedily merges the most frequent adjacent pair, repeating until it hits the target vocab size",
      "It splits text on whitespace and punctuation, then keeps the N most frequent words",
      "It runs an EM algorithm that maximises the likelihood of a probabilistic segmentation",
    ],
    correct: 1, keywords: [],
    explanation: "BPE is a greedy, frequency-driven merge process. Begin with the base alphabet, count all adjacent symbol pairs in the corpus, merge the single most frequent pair into a new symbol, and repeat. Each merge is recorded as a rule; at inference the same ordered merges are applied deterministically. The number of merges = target vocab size minus the base alphabet size. (The EM/likelihood description is the Unigram LM algorithm, not BPE.)",
    trap: "Confusing BPE with Unigram. BPE builds bottom-up by merging; Unigram starts with a large vocab and prunes tokens to maximise corpus likelihood. Interviewers probe this exact distinction.",
  },
  {
    id: "tokenizer-l1-2", topic: "tokenizer", tier: "L1", difficulty: "medium", gated: true, type: "mcq",
    question: "A model tokenizes numbers digit-by-digit (each digit its own token) rather than grouping them. What downstream capability does this most directly affect, and why?",
    options: [
      "Retrieval, because digit tokens embed poorly",
      "Arithmetic and counting, because consistent per-digit tokenization gives the model a stable positional structure to do column-wise math",
      "Multilingual transfer, because digits are language-agnostic",
      "Nothing — number tokenization has no measurable effect",
    ],
    correct: 1, keywords: [],
    explanation: "Arithmetic depends on aligning digits by place value. If '1234' is one merged token in one context and splits as '12'+'34' in another, the model can't consistently reason about the ones/tens/hundreds columns. Forcing single-digit tokenization (as Llama and others do) gives a uniform representation so the model can learn column-wise addition and carries. This is why tokenizer design is a real lever on math performance.",
    trap: "Dismissing tokenization as 'just preprocessing' with no effect on reasoning. Inconsistent number splitting is a documented cause of arithmetic errors — the failure is in the tokenizer, not the reasoning layer.",
  },
  {
    id: "tokenizer-l1-3", topic: "tokenizer", tier: "L1", difficulty: "medium", gated: false, type: "mcq",
    question: "Why is vocabulary size a tradeoff rather than 'bigger is always better'?",
    options: [
      "Larger vocab always improves quality, so the only limit is disk space",
      "A larger vocab yields shorter sequences (fewer tokens per text) but a bigger, more sparsely-trained embedding/softmax table; a smaller vocab trains each token more but lengthens sequences and raises compute per text",
      "Vocabulary size only affects decode speed, never training",
      "Smaller vocabularies eliminate the out-of-vocabulary problem entirely",
    ],
    correct: 1, keywords: [],
    explanation: "Vocab size trades sequence length against parameter count and data efficiency. A bigger vocab packs more text per token (shorter sequences, cheaper attention, more effective context) but the embedding matrix and output softmax grow with |V|, and rare tokens get few training updates. A smaller vocab means every token is seen often (well-trained embeddings) but sequences get longer, so attention cost (quadratic) and per-request token cost rise. Typical LLM vocabularies land around 32k-100k+ from balancing these.",
    trap: "Claiming a bigger vocabulary is strictly better because it 'shortens sequences.' It also inflates the embedding and softmax parameters and starves rare tokens of gradient signal — a real quality risk.",
  },
  {
    id: "tokenizer-l1-4", topic: "tokenizer", tier: "L1", difficulty: "medium", gated: false, type: "text",
    question: "Explain what a 'glitch token' (e.g. the notorious ' SolidGoldMagikarp') is, why it causes bizarre model behaviour, and what root cause in the training pipeline produces it.",
    options: null, correct: null,
    keywords: ["undertrained", "vocab", "tokenizer corpus", "training corpus", "embedding", "rarely seen", "under-trained", "mismatch"],
    explanation: "A glitch token is a token that exists in the vocabulary (because it was frequent in the tokenizer-training corpus, e.g. a Reddit username) but was rare or absent in the model-training corpus. Its embedding is therefore essentially never updated and stays near its random init, so feeding it produces nonsensical or evasive outputs. The root cause is a mismatch between the corpus used to fit the tokenizer and the corpus used to train the model — the tokenizer 'reserved a slot' the model never learned to use.",
    trap: "Explaining it as 'a bug in the model weights' or 'a prompt-injection.' The mechanism is an under-trained embedding caused by tokenizer/model corpus mismatch — a data-pipeline issue, not a runtime exploit.",
  },
  {
    id: "tokenizer-l1-5", topic: "tokenizer", tier: "L1", difficulty: "medium", gated: true, type: "mcq",
    question: "You deploy an LLM for a Hindi-language product and notice inputs cost 3-4x more tokens per sentence than the equivalent English. What is the mechanism, and what is the correct fix?",
    options: [
      "The model is slower on Hindi; upgrade the GPU",
      "The tokenizer was trained mostly on English/Latin text, so Devanagari falls back to many byte- or character-level tokens; the fix is a tokenizer with adequate multilingual coverage (or a language-specific vocab)",
      "Hindi genuinely needs more tokens because it is more information-dense; nothing can be done",
      "Increase top_k retrieval so fewer tokens are needed",
    ],
    correct: 1, keywords: [],
    explanation: "Subword vocabularies are learned from the training corpus's frequency distribution. If that corpus is English-dominated, non-Latin scripts like Devanagari have few dedicated merges and get shredded into many byte-level fragments — the 'tokenizer tax' on low-resource languages. This raises cost, shrinks effective context, and can hurt quality. The fix is a tokenizer with balanced multilingual coverage (larger or language-weighted vocab), not more hardware.",
    trap: "Blaming the model or the language's 'complexity.' The token blow-up is a property of the tokenizer's training data, not an inherent trait of the language — a fairer multilingual tokenizer largely closes the gap.",
  },

  // ── L2: Cross-concept / tradeoffs (5) ──────────────────────────────────────
  {
    id: "tokenizer-l2-1", topic: "tokenizer", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "BPE vs WordPiece: both are subword algorithms, but they choose which pair to merge differently. What is that core difference?",
    options: [
      "BPE merges the most frequent adjacent pair; WordPiece merges the pair that most increases the corpus likelihood (highest score = freq(pair) / (freq(a)·freq(b)))",
      "BPE is character-level and WordPiece is word-level",
      "WordPiece merges the most frequent pair; BPE maximises likelihood",
      "They are identical; only the vocab file format differs",
    ],
    correct: 0, keywords: [],
    explanation: "Both are bottom-up merge algorithms, but the selection criterion differs. BPE merges the raw most-frequent adjacent pair. WordPiece (used by BERT) merges the pair that maximises training-data likelihood, which reduces to picking the pair with the highest freq(a,b)/(freq(a)·freq(b)) — favouring pairs whose combination is more informative than their parts. WordPiece also marks continuations with '##'.",
    trap: "Saying 'BPE and WordPiece are basically the same.' The likelihood-vs-frequency merge criterion is the discriminating detail interviewers listen for; conflating them signals surface knowledge.",
  },
  {
    id: "tokenizer-l2-2", topic: "tokenizer", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "Unigram LM tokenization (SentencePiece) differs from BPE most fundamentally in that it:",
    options: [
      "Is faster because it only stores merge rules",
      "Starts from a large candidate vocabulary and iteratively prunes tokens that least hurt corpus likelihood, and can produce multiple probabilistic segmentations of the same string (enabling subword regularization)",
      "Can only be trained on whitespace-delimited languages",
      "Guarantees a single deterministic segmentation, unlike BPE",
    ],
    correct: 1, keywords: [],
    explanation: "Unigram is top-down and probabilistic: it seeds a large vocab, assigns each token a probability, and uses EM to prune the tokens whose removal least reduces total corpus likelihood. Because it models a distribution over segmentations, the same string can be tokenized multiple valid ways — this powers subword regularization (sampling segmentations during training for robustness). BPE, by contrast, is a deterministic greedy merge with one segmentation per string.",
    trap: "Assuming all subword tokenizers are deterministic. Unigram is explicitly probabilistic and supports sampling multiple segmentations — the opposite of BPE's single greedy output.",
  },
  {
    id: "tokenizer-l2-3", topic: "tokenizer", tier: "L2", difficulty: "hard", gated: false, type: "mcq",
    question: "SentencePiece is often described as solving a problem the BPE/WordPiece implementations had. What problem?",
    options: [
      "It made vocabularies larger",
      "It removed the language-specific pre-tokenization/whitespace assumption by treating the raw input (including spaces, e.g. as '▁') as just another symbol, so it works uniformly on languages without spaces (Chinese, Japanese) and round-trips losslessly",
      "It replaced subword tokens with word tokens",
      "It is a different merge algorithm that beats BPE on quality",
    ],
    correct: 1, keywords: [],
    explanation: "SentencePiece is a framework, not a new merge rule — it can run BPE or Unigram underneath. Its contribution is operating directly on raw Unicode text with no assumption of whitespace-delimited words: spaces are encoded as a normal symbol (the '▁' marker), so encode/decode is lossless and reversible, and languages without spaces are handled uniformly. Classic BPE/WordPiece pipelines required a language-specific pre-tokenizer first.",
    trap: "Treating SentencePiece as 'a competitor to BPE.' It's an implementation that hosts BPE or Unigram; the innovation is raw-text, whitespace-agnostic, lossless tokenization — not the merge algorithm itself.",
  },
  {
    id: "tokenizer-l2-4", topic: "tokenizer", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "Byte-level BPE (used by GPT-2/GPT-4) vs character-level vs word-level tokenization. Why did byte-level BPE become the default for large models?",
    options: [
      "Byte-level uses the smallest vocabulary of the three",
      "It combines subword efficiency with a 256-symbol byte base alphabet, so it can encode ANY Unicode string with zero out-of-vocabulary risk, while keeping sequences far shorter than character-level and avoiding word-level's OOV and huge-vocab problems",
      "Character-level is strictly better but too slow to train",
      "Word-level handles multilingual text best, so byte-level is only a fallback",
    ],
    correct: 1, keywords: [],
    explanation: "Word-level tokenization has an unbounded vocab and hard OOV failures. Character-level never has OOV but makes sequences very long (costly quadratic attention) and forces the model to learn spelling from scratch. Byte-level BPE gets the best of both: a fixed 256-byte base alphabet guarantees any Unicode string is representable (no OOV, no <UNK>), while learned merges compress frequent sequences so sequences stay short. That robustness-plus-efficiency is why it's the standard.",
    trap: "Picking 'smallest vocabulary' as the reason. Byte-level BPE vocabularies are large (50k-100k); the win is universal coverage with no OOV plus subword-level sequence compression — not vocab size.",
  },
  {
    id: "tokenizer-l2-5", topic: "tokenizer", tier: "L2", difficulty: "hard", gated: true, type: "text",
    question: "Two teams fine-tune the same base model. Team A reuses the base tokenizer; Team B trains a new domain-specific tokenizer (e.g. for chemistry SMILES strings). Discuss the tradeoff — when does a custom tokenizer help, and what breaks if you swap the tokenizer under a pretrained model?",
    options: null, correct: null,
    keywords: ["embedding", "pretrained", "sequence length", "domain", "vocab mismatch", "retrain", "efficiency", "token ids", "cost", "coverage"],
    explanation: "A domain tokenizer can slash sequence length and improve coverage when the base tokenizer shreds domain text (SMILES, code, a non-English script) into many fragments — cheaper, longer effective context, easier learning. But you cannot just swap a tokenizer under a pretrained model: the model's embedding table and output layer are indexed by the old token IDs. New IDs mean new, untrained embeddings, so you must re-train or at least extensively continue-pretrain those embeddings (or the whole model) to realign. So the tradeoff is efficiency/coverage gains vs. the cost of retraining embeddings and losing the base model's learned token semantics. Custom tokenizers pay off most when training from scratch or doing heavy continued pretraining; for a light fine-tune, reusing the base tokenizer is usually correct.",
    trap: "Saying 'just plug in the better tokenizer.' Token IDs are the model's interface to its embedding matrix — changing the tokenizer invalidates every learned embedding unless you retrain, which is the whole cost of the decision.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // EMBEDDINGS
  // ══════════════════════════════════════════════════════════════════════════

  // ── L0: Define (3) ─────────────────────────────────────────────────────────
  {
    id: "embeddings-l0-1", topic: "embeddings", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "What is an embedding?",
    options: [
      "A compressed copy of the training dataset stored inside the model",
      "A dense, fixed-length vector of real numbers that represents a token, word, sentence, or item in a continuous space where distance reflects semantic similarity",
      "The attention score between two tokens",
      "The set of merge rules a tokenizer applies to text",
    ],
    correct: 1, keywords: [],
    explanation: "An embedding is a learned mapping from a discrete object (token, word, sentence, image, user, product) into a dense vector in R^d. The geometry is meaningful: semantically similar items land close together, so downstream tasks can use distance/angle to reason about similarity. This is the numeric substrate every neural NLP model operates on.",
    trap: "Describing an embedding as 'a lookup table of words.' The vector itself — and the fact that its geometry encodes meaning — is the point; the table is just where token embeddings are stored.",
  },
  {
    id: "embeddings-l0-2", topic: "embeddings", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "Why are embeddings preferred over one-hot encodings for representing words?",
    options: [
      "One-hot vectors are too small to store the vocabulary",
      "One-hot vectors are high-dimensional, sparse, and equidistant (every pair is orthogonal, so 'cat' and 'kitten' are as far apart as 'cat' and 'car'); embeddings are dense, low-dimensional, and place related words close together",
      "Embeddings are exact while one-hot encodings are approximate",
      "One-hot encoding cannot be used as neural network input",
    ],
    correct: 1, keywords: [],
    explanation: "A one-hot vector has dimension |V| with a single 1, so all words are mutually orthogonal — the representation carries no notion of similarity, and it's wastefully sparse. A learned embedding compresses this to a dense d-dimensional vector (d ≪ |V|) where similar words are near each other, giving the model a similarity signal and far fewer parameters to work through.",
    trap: "Saying one-hot 'doesn't work' as input. It does work — it's just uninformative (no similarity structure) and inefficient. The advantage of embeddings is semantic geometry plus dimensionality reduction.",
  },
  {
    id: "embeddings-l0-3", topic: "embeddings", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "What does cosine similarity between two embedding vectors measure?",
    options: [
      "The straight-line (Euclidean) distance between the vectors",
      "The cosine of the angle between the vectors — their directional alignment, ignoring magnitude — bounded in [-1, 1]",
      "The number of dimensions the two vectors share",
      "The dot product divided by the number of dimensions",
    ],
    correct: 1, keywords: [],
    explanation: "Cosine similarity = (A·B)/(||A||·||B||), the cosine of the angle between the vectors. It measures directional alignment and is invariant to vector length, so two texts pointing the same way score ~1 regardless of magnitude. That length-invariance is why it's the default for comparing text embeddings, where norm can reflect token count rather than meaning.",
    trap: "Confusing cosine similarity with Euclidean distance. Cosine ignores magnitude and cares only about direction; two vectors can be far apart in Euclidean terms yet have cosine similarity near 1.",
  },

  // ── L1: Deep single-concept (5) ────────────────────────────────────────────
  {
    id: "embeddings-l1-1", topic: "embeddings", tier: "L1", difficulty: "medium", gated: false, type: "mcq",
    question: "word2vec's skip-gram objective learns embeddings by training the model to:",
    options: [
      "Reconstruct the exact input sentence from a compressed vector",
      "Predict the surrounding context words given a center word (so words appearing in similar contexts get similar vectors — the distributional hypothesis)",
      "Classify each word into a part-of-speech tag",
      "Minimise the cosine distance between every pair of words in the vocabulary",
    ],
    correct: 1, keywords: [],
    explanation: "Skip-gram slides a window over text and trains the center word's vector to predict its neighbouring context words (CBOW does the reverse). This operationalises the distributional hypothesis: words that occur in similar contexts end up with similar vectors. Negative sampling makes it tractable by contrasting true context words against random 'noise' words instead of a full softmax.",
    trap: "Describing word2vec as 'a deep neural network.' It's a shallow (single hidden layer) model; its power comes from the prediction objective over huge corpora plus negative sampling, not depth.",
  },
  {
    id: "embeddings-l1-2", topic: "embeddings", tier: "L1", difficulty: "medium", gated: true, type: "mcq",
    question: "A classic property of word2vec/GloVe embeddings is that vector('king') - vector('man') + vector('woman') ≈ vector('queen'). What does this reveal about the space?",
    options: [
      "The embeddings memorised a hardcoded analogy table",
      "Certain semantic relationships are encoded as roughly linear (translation) directions in the vector space, so analogies can be solved with vector arithmetic",
      "The model has true reasoning ability",
      "It is a coincidence with no structure behind it",
    ],
    correct: 1, keywords: [],
    explanation: "The analogy result shows that relations like gender or tense correspond to consistent linear offsets in embedding space — 'royalty' and 'gender' become approximately independent directions. This linear-structure property emerges from co-occurrence statistics and is why these spaces support vector-arithmetic analogies. It's structure in the geometry, not reasoning.",
    trap: "Claiming this proves the model 'understands' or 'reasons.' It's a geometric regularity from co-occurrence statistics; the analogies are fuzzy, break down on rarer relations, and involve nearest-neighbour tricks (excluding the input words).",
  },
  {
    id: "embeddings-l1-3", topic: "embeddings", tier: "L1", difficulty: "medium", gated: false, type: "mcq",
    question: "What is the fundamental limitation of static embeddings (word2vec, GloVe) that contextual embeddings (BERT) were designed to fix?",
    options: [
      "Static embeddings are too slow to compute at inference",
      "Static embeddings assign one fixed vector per word, so polysemous words like 'bank' (river vs finance) collapse to a single averaged vector; contextual embeddings produce a different vector per occurrence based on the surrounding sentence",
      "Static embeddings cannot be stored in a vector database",
      "Static embeddings have too many dimensions",
    ],
    correct: 1, keywords: [],
    explanation: "Static embeddings are context-free: 'bank' gets exactly one vector no matter the sentence, blending its financial and geographic senses into a muddled average. Contextual models like BERT run the whole sentence through a transformer, so each token's output vector depends on its neighbours — 'bank' near 'river' and 'bank' near 'loan' get distinct representations. That word-sense disambiguation is the core upgrade.",
    trap: "Saying BERT embeddings are 'just better-trained word2vec.' The difference is architectural: static = one vector per type; contextual = one vector per token occurrence, computed from the full sentence.",
  },
  {
    id: "embeddings-l1-4", topic: "embeddings", tier: "L1", difficulty: "medium", gated: false, type: "text",
    question: "You want to build semantic search over documents. Explain why you cannot just average BERT's raw token embeddings to get a sentence vector, and what a model like Sentence-BERT does differently.",
    options: null, correct: null,
    keywords: ["mean pooling", "siamese", "fine-tune", "cosine", "sentence", "similarity objective", "contrastive", "not comparable", "pooling", "training objective"],
    explanation: "Vanilla BERT is trained for masked-language-modelling / next-sentence tasks, not to produce a single sentence vector whose cosine distance is meaningful. Naively mean-pooling its token embeddings gives vectors that perform poorly for similarity — the space isn't calibrated for cosine comparison, and doing it pairwise through BERT is O(n^2) and too slow to index. Sentence-BERT (SBERT) fine-tunes BERT in a siamese/triplet setup with a similarity (contrastive) objective and a pooling layer, so a single forward pass yields a fixed vector where cosine similarity tracks semantic similarity — enabling fast indexed retrieval.",
    trap: "Assuming 'mean-pool BERT tokens' yields good sentence embeddings. Off-the-shelf BERT was never trained so its pooled vector is cosine-comparable; you need a model fine-tuned with a sentence-similarity objective (SBERT) or a purpose-built embedding model.",
  },
  {
    id: "embeddings-l1-5", topic: "embeddings", tier: "L1", difficulty: "medium", gated: true, type: "mcq",
    question: "You must pick the embedding dimension d for a new retrieval system. What is the core tradeoff, and what commonly goes wrong at very high d?",
    options: [
      "Higher d is always better; the only cost is disk space",
      "Higher d captures more nuance and can raise ceiling accuracy, but increases memory, index size, and query latency, needs more data to train well, and past a point yields diminishing returns; too-low d underfits and can't separate concepts",
      "Dimension only affects training time, never retrieval quality",
      "Lower d is always better because of the curse of dimensionality",
    ],
    correct: 1, keywords: [],
    explanation: "Embedding dimension trades representational capacity against cost and data-efficiency. Higher d can encode finer distinctions but multiplies storage, ANN index size, and per-query compute, and needs more training signal to fill those dimensions usefully — beyond a point accuracy plateaus. Too-low d underfits: distinct concepts get crushed together. Practical text embeddings sit around 384-1536 dims; some models (Matryoshka) let you truncate d to trade quality for cost at query time.",
    trap: "Saying 'higher dimension = always more accurate.' Capacity has diminishing returns and real costs (memory, latency, data needs); the right d is an empirical sweet spot, not the maximum.",
  },

  // ── L2: Cross-concept / tradeoffs (5) ──────────────────────────────────────
  {
    id: "embeddings-l2-1", topic: "embeddings", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "Cosine similarity vs dot product vs Euclidean distance for comparing embeddings. When does the choice actually change the ranking?",
    options: [
      "They always produce the same ranking, so it never matters",
      "On L2-normalized vectors, cosine, dot product, and (monotonically) Euclidean give the same ranking; the choice matters only when vectors are NOT normalized, where dot product also rewards larger magnitude and Euclidean is magnitude-sensitive, while cosine stays magnitude-invariant",
      "Euclidean is always the most accurate for text",
      "Dot product is only for images and cosine only for text",
    ],
    correct: 1, keywords: [],
    explanation: "If all vectors are unit-normalized, maximizing dot product = maximizing cosine, and Euclidean distance is a monotonic function of cosine — so the three rank identically. The choice bites when vectors are unnormalized: dot product favours high-norm vectors (useful when magnitude encodes confidence/popularity, e.g. some recommender embeddings), Euclidean is sensitive to both direction and magnitude, and cosine isolates direction only. Many embedding models are trained assuming one specific metric, so you must match it.",
    trap: "Treating cosine/dot/Euclidean as interchangeable. They coincide only under normalization; unnormalized, dot product and Euclidean fold in magnitude, which can flip rankings and must match how the model was trained.",
  },
  {
    id: "embeddings-l2-2", topic: "embeddings", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "Static (word2vec/GloVe) vs contextual (BERT) vs sentence embeddings (SBERT): which should you reach for to build a document semantic-search index, and why NOT the others?",
    options: [
      "word2vec — because it is fastest",
      "Sentence embeddings (SBERT / a dedicated embedding model) — they output one calibrated vector per passage whose cosine distance reflects meaning; static embeddings lack context and have no good sentence-level vector, and raw BERT token embeddings aren't cosine-comparable and are O(n^2) to compare pairwise",
      "Raw BERT token embeddings — because they are contextual",
      "One-hot bag-of-words — because it is exact",
    ],
    correct: 1, keywords: [],
    explanation: "Search needs a single per-passage vector you can index once and compare by cosine. Static embeddings give per-word vectors with no principled sentence aggregation and no context. Raw BERT gives contextual token vectors but no calibrated sentence vector, and using BERT as a cross-encoder is O(n^2) — infeasible to index. Sentence-embedding models (SBERT, OpenAI/Cohere embedding APIs) are trained with a similarity objective to emit one comparable vector per text, which is exactly the retrieval interface.",
    trap: "Reaching for raw BERT because it's 'the most powerful.' As a bi-encoder its pooled output isn't similarity-calibrated, and as a cross-encoder it can't be pre-indexed — wrong tool for scalable retrieval.",
  },
  {
    id: "embeddings-l2-3", topic: "embeddings", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "Why does Retrieval-Augmented Generation (RAG) use embeddings for retrieval instead of keyword (lexical, e.g. BM25) search?",
    options: [
      "Embeddings are always strictly better than keyword search on every query",
      "Dense embeddings match on meaning, so a query can retrieve a passage that answers it even with zero shared words (synonyms, paraphrase); keyword search misses these — though in practice hybrid (dense + BM25) beats either alone, since lexical still wins on exact terms, codes, and rare entities",
      "Embeddings are faster than an inverted index at all scales",
      "Keyword search cannot be used with LLMs",
    ],
    correct: 1, keywords: [],
    explanation: "RAG's job is to surface passages that answer the query, and the answer often uses different words than the question (paraphrase, synonymy, cross-lingual). Dense embeddings capture semantic proximity, so they retrieve on meaning rather than surface tokens — a major recall win over pure lexical matching. But dense retrieval can whiff on exact identifiers, rare names, and out-of-domain terms, which is why production systems usually run hybrid: BM25 for lexical precision + embeddings for semantic recall, then rerank.",
    trap: "Claiming embeddings strictly dominate keyword search. Lexical search still wins on exact matches, codes, and rare tokens; the strong answer is hybrid retrieval, and knowing when dense recall fails is the senior signal.",
  },
  {
    id: "embeddings-l2-4", topic: "embeddings", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "At 50M vectors, brute-force cosine search over embeddings is too slow. Approximate Nearest Neighbour (ANN, e.g. HNSW/IVF) fixes latency. What is the fundamental tradeoff you accept, and how does it interact with RAG quality?",
    options: [
      "ANN is exact and free — there is no tradeoff",
      "ANN trades a small amount of recall (it may miss some true nearest neighbours) for orders-of-magnitude faster, memory-bounded search; if recall drops too far, RAG silently retrieves worse context and answer quality degrades — so you tune the recall/latency knob (e.g. efSearch, nprobe) against your eval set",
      "ANN increases embedding dimension to speed things up",
      "ANN only works if you switch from cosine to Euclidean distance",
    ],
    correct: 1, keywords: [],
    explanation: "Exact nearest-neighbour search is O(N·d) per query — untenable at tens of millions of vectors. ANN indexes (HNSW graphs, IVF/PQ) prune the search space to hit sublinear latency and bounded memory, at the cost of occasionally missing a true top-k neighbour (recall < 100%). In RAG that miss is invisible at the retrieval layer but shows up as a worse or wrong answer downstream, so ANN recall is a real quality lever you must measure, not just a systems detail.",
    trap: "Treating ANN as a free speedup. It's an approximation — lower recall means the generator sometimes never sees the right passage. The tradeoff must be tuned and measured against answer quality, not set blindly for latency.",
  },
  {
    id: "embeddings-l2-5", topic: "embeddings", tier: "L2", difficulty: "hard", gated: true, type: "text",
    question: "Embedding drift: you upgrade your embedding model to a newer, better one, but your vector DB has millions of documents embedded with the OLD model. Explain why you cannot simply embed new queries with the new model against the old index, and what the migration actually requires.",
    options: null, correct: null,
    keywords: ["same space", "re-embed", "reindex", "incompatible", "vector space", "query", "corpus", "backfill", "not comparable", "mismatch"],
    explanation: "Query and document vectors are only comparable if they live in the same embedding space — i.e. produced by the same model. A new model defines a different geometry, so cosine/dot between a new-model query vector and old-model document vectors is meaningless; retrieval quality collapses. The migration requires re-embedding (backfilling) the entire corpus with the new model and rebuilding the ANN index, usually via a dual-write / shadow-index cutover so you can validate the new index before switching traffic. There's no shortcut — you can't mix vectors from two models in one similarity search.",
    trap: "Assuming you can 'just point queries at the new model' against the old index. Different models = different vector spaces = incomparable vectors; you must re-embed the whole corpus and reindex, which is the real cost of an embedding upgrade.",
  },
];
