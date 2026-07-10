// NLP Foundations (batch 4) — evaluation metrics, transfer learning, sentence
// embeddings. Spread into foundationsRunnerData.js.
export const RUNNER_NLP_4 = {
  "nlp-eval-metrics": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "The last module measured classifiers, where every prediction is simply right or wrong. Now try to grade a model that *writes* — a translation, a summary. Two different translations can both be perfect; a summary can be excellent while sharing barely a word with the reference answer a human wrote. What does 'correct' even mean when there are a thousand right answers?\n\nThe field's working compromise: collect a human-written reference, then score the model's output by how much it *overlaps* with it — count the shared words and short phrases. Cheap, automatic, repeatable. An entire family of metrics is built on that one move, and each member tilts the counting toward a different danger. Grade what the model *said* against the reference when the sin you fear is inventing content — that's translation's fear. Grade how much of the reference the model *covered* when the sin is leaving things out — that's summarization's. Those two tilts have names, **BLEU** and **ROUGE**, and pointing the wrong one at your task produces numbers that are confidently, systematically misleading.\n\nAnd the whole overlap family shares one blind spot worth knowing before you trust any dashboard: 'the movie was really fun' and 'the film was extremely enjoyable' share almost no words. Every overlap metric scores that near-perfect paraphrase as a near-miss — and scores a lazy verbatim copy as a triumph. Counting words cannot see meaning.\n\nThis module builds BLEU and ROUGE for real — including the anti-gaming machinery inside BLEU — then METEOR's partial fix, then the modern escape routes (**BERTScore** and LLM-as-judge), plus **perplexity**, which needs no reference at all and compares language models head-to-head, and exact-match/token-F1 for span answers, where a single right answer exists again. Everything funnels into one rule — match the metric to the task's own definition of good — and the closing scenario is precisely what happens to a team that doesn't.",
    scenario: "Your team ships a summarization feature and a translation feature in the same sprint, and the eval dashboard reports one number for both: BLEU. Translation looks fine, but the summarizer scores a dismal 0.11 BLEU even though a human reader says the summaries are excellent. Meanwhile a second model that copies three sentences verbatim from the source scores *higher* on BLEU while reading worse. A skeptical PM asks why one metric is telling opposite stories about quality, and which metric you'd actually report instead — and why the copy-model's high score should worry you just as much as the summarizer's low one.",
    explanation: [
      "Text-generation metrics are not interchangeable knobs — each was invented for a *specific* task with a *specific* notion of what 'good' means, and using the wrong one produces exactly the contradictory numbers in the scenario. The right mental model is a family tree: n-gram-overlap metrics (BLEU, ROUGE, METEOR), an intrinsic language-model metric (perplexity), exact-match/token-F1 for span tasks, and — because overlap metrics all share one flaw — a newer branch of semantic metrics (BERTScore, LLM-as-judge). Start with the overlap family, because it dominates the field and its flaw is the whole lesson.\n\n**BLEU (Bilingual Evaluation Understudy)** was built for *machine translation*. Its core is **modified n-gram precision**: of the n-grams the candidate produced, what fraction also appear in a reference translation? ==Precision, not recall — because in translation the danger is the model *inventing* words that aren't warranted, so you grade what it *said* against what it *should have* said.== It combines precision at n=1,2,3,4 (unigrams up to 4-grams) via a geometric mean, so it rewards both word choice and local word order.",
      "Two details make BLEU robust to gaming, and interviewers love to probe them. First, **clipping**: a candidate 'the the the the the' would get perfect unigram precision if you counted naively (every 'the' is 'in' the reference), so BLEU *clips* each n-gram's count to the maximum number of times it appears in any single reference. 'the' appearing twice in the reference means the candidate gets credit for at most two 'the's, no more. ==Clipping stops a model from farming precision by repeating a single high-frequency correct word.== Second, the **brevity penalty (BP)**: precision alone rewards *short* outputs (say only the one word you're sure of, and your precision is 1.0). To stop that, BLEU multiplies the score by a penalty when the candidate is shorter than the reference — `BP = min(1, e^(1 - r/c))` where `r` is reference length and `c` is candidate length. Output too short and BP drops below 1, dragging the whole score down. Precision guards against garbage words; the brevity penalty guards against cowardly-short outputs.",
      { type: "illustration", label: "BLEU worked mini-example (unigram, with clip + BP)", content: `Reference : \"the cat sat on the mat\"          (length r = 6)
Candidate : \"the cat the cat\"                   (length c = 4)

Unigram counts in candidate:  the x2, cat x2
Max in reference (the clip):  the -> 2,  cat -> 1
  clipped(the) = min(2, 2) = 2
  clipped(cat) = min(2, 1) = 1
Modified unigram precision = (2 + 1) / 4 candidate words = 0.75
  (naive, unclipped precision would have been 4/4 = 1.0 -- clipping
   killed the second \"cat\" that the reference did not license)

Brevity penalty: c=4 < r=6  ->  BP = e^(1 - 6/4) = e^(-0.5) = 0.607

BLEU (unigram-only) = BP x precision = 0.607 x 0.75 = 0.455
  short + repetitive output gets punished on BOTH axes.` },
      "Point BLEU at a summarization task and the mismatch shows immediately: a summary that omits half the source's key facts but never invents anything can still score high precision, because precision only checks what the candidate said, never what it left out. **ROUGE (Recall-Oriented Understudy for Gisting Evaluation)** was built for *summarization*, and it flips BLEU's emphasis to *recall*: of the n-grams in the reference summary, how many did the candidate *cover*? ==Summarization's danger is the opposite of translation's — the risk is *leaving out* important content, so you grade coverage of the reference, i.e. recall.== The common variants: **ROUGE-N** is n-gram recall (ROUGE-1 = unigram, ROUGE-2 = bigram); **ROUGE-L** uses the *longest common subsequence* (LCS) between candidate and reference, rewarding in-order overlap *without* requiring the matched words to be contiguous — so 'the quick brown fox' and 'the brown fox' share the subsequence 'the brown fox' and score well even though a strict bigram match would miss 'quick brown'. This is exactly why verbatim copying scores artificially high on any overlap metric: copying maximizes overlap, which overlap metrics reward, even when the result reads worse.",
      "**METEOR** was designed to fix a specific weakness: BLEU and ROUGE only credit *exact* surface matches, so 'run' and 'ran', or 'quick' and 'fast', count as total misses. METEOR adds three things: **stemming** (so 'run'/'running'/'ran' match), **synonym matching** (via WordNet, so 'quick'/'fast' match), and an explicit **alignment** step that also penalizes fragmented, out-of-order matches. It computes a recall-weighted F-mean and correlates noticeably better with human judgment than raw BLEU — but it needs linguistic resources (a stemmer, a synonym database) that don't exist for every language, which limits its reach.",
      { type: "illustration", label: "The shared blind spot: paraphrase tanks overlap metrics", content: `Reference : \"the film was extremely enjoyable\"
Candidate : \"the movie was really fun\"        <- a GREAT paraphrase

Exact-token overlap:
  shared unigrams = { the, was }   (2 of 5)
  \"film\"!=\"movie\", \"extremely\"!=\"really\", \"enjoyable\"!=\"fun\"
  BLEU/ROUGE-1 precision or recall ~ 2/5 = 0.40   <- looks BAD

  A human scores this ~identical in meaning. The metric scores it a
  near-miss. Every n-gram-overlap metric shares this flaw:
    - penalizes valid PARAPHRASE (different words, same meaning)
    - rewards surface OVERLAP (copy the reference verbatim -> high score)

  This is WHY embedding-based metrics exist:
    BERTScore  -> match candidate & reference tokens by contextual-
                  embedding cosine similarity, not string equality
                  (\"movie\"~\"film\" now count as a match)
    LLM-as-judge -> ask a strong model to rate adequacy/fluency directly` },
      "As the movie/film pair above just showed, that blind spot — **overlap metrics penalize valid paraphrase and reward surface overlap** — is the single most important thing to say in an interview, because it motivates the entire modern branch. **BERTScore** replaces string equality with *semantic* similarity: it embeds every token with a contextual model (BERT) and matches candidate tokens to reference tokens by cosine similarity, so 'movie' and 'film' finally count as a match. **LLM-as-judge** goes further: prompt a strong model to score adequacy and fluency directly, capturing quality that no overlap count can — at the cost of expense, latency, and the judge's own biases (position bias, verbosity bias, self-preference). Neither is free, but both escape the paraphrase trap.",
      "Two metrics live *outside* the reference-comparison family and round out the toolkit. **Perplexity** is an *intrinsic* language-model metric: it measures how surprised a language model is by held-out text — `perplexity = exp(average negative log-likelihood per token)` — so lower is better, and a perplexity of `k` means the model is, on average, as uncertain as if choosing uniformly among `k` words. ==Perplexity needs no reference output at all; it grades the model's own fluency/fit to a corpus, which is why it's used to compare *language models*, not to grade a specific generated answer.== For **extractive QA and span tasks** — where the answer is a substring of a passage — you use **exact match (EM)** (is the predicted span character-for-character the gold span?) and **token-level F1** (precision/recall over the overlapping tokens, which forgives partial matches like 'Barack Obama' vs 'Obama').",
      "So the decision framing, in general: **match the metric to the task's notion of 'good.'** Translation cares about not inventing content and getting wording right -> **precision-oriented BLEU**. Summarization cares about covering the key content -> **recall-oriented ROUGE (ROUGE-L for in-order coverage)**. Want better human correlation with synonyms/inflection -> **METEOR**. Want to stop penalizing paraphrase -> **BERTScore** or **LLM-as-judge**. Comparing language models' raw fluency -> **perplexity**. Extractive QA/spans -> **exact match + token-F1**. Point the wrong metric at a task and you get exactly the kind of contradictory dashboard numbers that make a PM start asking pointed questions.",
    ],
    keyPoints: [
      "**BLEU is precision-oriented, for translation.** Modified n-gram precision (n=1..4, geometric mean) grades what the candidate *said* against the reference, guarding against invented content. Clipping caps repeated-token credit; the brevity penalty `min(1, e^(1-r/c))` punishes cowardly-short outputs.",
      "**ROUGE is recall-oriented, for summarization.** It grades coverage of the reference (the risk in summarization is *omission*). ROUGE-N = n-gram recall; ROUGE-L = longest-common-subsequence, rewarding in-order but non-contiguous overlap. This is why verbatim copying scores high on overlap metrics.",
      "**METEOR adds stemming + WordNet synonyms + alignment**, so 'run'/'ran' and 'quick'/'fast' match, correlating better with humans than BLEU — but it needs language-specific linguistic resources, limiting coverage.",
      "**Every n-gram-overlap metric shares one blind spot: it penalizes valid paraphrase and rewards surface overlap.** ('the movie was really fun' vs 'the film was extremely enjoyable' scores ~0.4 despite identical meaning.) This motivates BERTScore (token match by contextual-embedding cosine, not string equality) and LLM-as-judge (direct quality rating, at cost/latency/bias).",
      "**Perplexity is intrinsic (no reference needed):** `exp(avg NLL/token)`, lower is better, used to compare language models' fluency. **Extractive QA/spans use exact match + token-F1** (F1 forgives partial overlaps like 'Obama' vs 'Barack Obama'). Match the metric to the task's notion of 'good.'",
    ],
    recap: [
      "**BLEU = precision, translation.** Modified n-gram precision + clipping (caps repeated-word credit) + brevity penalty `min(1,e^(1-r/c))` (punishes too-short).",
      "**ROUGE = recall, summarization.** ROUGE-N (n-gram recall), ROUGE-L (longest-common-subsequence, in-order non-contiguous). Verbatim copying scores high — overlap reward.",
      "**METEOR** = stemming + synonyms + alignment -> better human correlation, needs linguistic resources.",
      "**Shared blind spot:** all overlap metrics penalize paraphrase, reward surface overlap -> motivates **BERTScore** (embedding-cosine token match) and **LLM-as-judge** (direct rating, but cost/bias).",
      "**Perplexity** = intrinsic LM metric `exp(avg NLL/token)`, no reference, lower better. **EM + token-F1** = extractive QA/spans. Pick the metric that matches the task's 'good.'",
    ],
    mcqs: [
      {
        question: "A summarization model scores 0.11 BLEU yet humans rate its summaries excellent, while a model that copies three source sentences verbatim scores higher on BLEU but reads worse. Which TWO statements correctly diagnose what's going on?",
        options: [
          "BLEU is a precision-oriented metric built for translation, so on summarization it measures the wrong notion of quality — coverage of key content matters more there",
          "Overlap-based metrics like BLEU structurally reward verbatim copying, since copying maximizes n-gram overlap with the reference regardless of how the summary actually reads",
          "BLEU's precision math becomes numerically unstable and undefined on any output shorter than four tokens, which is why summarization scores swing so unpredictably compared to translation",
          "The human raters undervalued the verbatim-copy summary because they skimmed it too quickly to notice how much source content it actually preserved",
        ],
        correct: [0, 1],
        explanation: "A and B are both correct: BLEU's modified n-gram precision was designed for translation, where the risk is inventing content, so applying it to summarization — where the risk is omission — measures the wrong notion of 'good' (statement A). Separately, because overlap metrics score coverage of shared n-grams, verbatim copying mechanically maximizes that overlap even when the result reads worse, which is exactly why the copy-model scored higher (statement B). Option C invents a nonexistent numerical-instability mechanism — BLEU's precision doesn't break down at short lengths; the brevity penalty is what discounts short outputs, and it's a separate, well-behaved term. Option D denies the premise: the human raters' judgment is described as accurate, not careless.",
      },
      {
        question: "In BLEU, what do clipping and the brevity penalty each prevent, and why are both needed?",
        options: [
          "Clipping caps how far the candidate's total length may exceed the reference, while the brevity penalty separately caps how many times one repeated n-gram earns precision credit",
          "Clipping and the brevity penalty are really and truly the same correction applied twice over — one version tunes precision, the other tunes recall, but mechanically they do fully identical work",
          "Clipping caps a repeated n-gram's credit at its reference count, blocking precision-farming via repetition; the brevity penalty discounts scores when candidates run shorter",
          "The brevity penalty rewards noticeably shorter candidates outright, since human annotators generally judge concise translations as more precise and trustworthy than longer, verbose ones",
        ],
        correct: 2,
        explanation: "Option C is correct: raw n-gram precision has two exploits. A candidate could repeat one correct frequent word ('the the the the') and score near-perfect precision — clipping stops this by capping each n-gram's credit at its maximum count in any single reference. Precision alone also rewards short outputs, so the brevity penalty multiplies the score down when the candidate is shorter than the reference. Both are needed because they close different holes: garbage-repetition vs cowardly-brevity. Option A swaps the two mechanisms' actual roles — clipping is about repeated tokens, not overall length, and the brevity penalty is about length, not repetition. Option B is wrong: they are distinct mechanisms, and BLEU is precision-based throughout, not recall-based. Option D inverts the brevity penalty — it *penalizes* being too short; it does not reward brevity.",
      },
      {
        question: "'the movie was really fun' is scored against the reference 'the film was extremely enjoyable' and receives only ~0.4 on ROUGE-1 / BLEU despite being an excellent paraphrase. What does this illustrate, and what class of metric addresses it?",
        options: [
          "It shows that ROUGE-1 was simply computed incorrectly in this particular example — recomputing with ROUGE-L would match these two sentences on identical tokens and produce a near-perfect score instead",
          "It shows that this paraphrase is genuinely lower quality than the reference sentence, since fewer of its words carry the exact same precise connotations as the original phrasing",
          "It shows that perplexity should replace overlap metrics entirely here, since perplexity is computed from a language model that natively recognizes synonyms and paraphrase",
          "It illustrates the shared blind spot of n-gram-overlap metrics: matching only exact tokens penalizes paraphrase and rewards overlap — motivating BERTScore's embedding matching",
        ],
        correct: 3,
        explanation: "Option D is correct: the paraphrase shares only 'the' and 'was' with the reference, so any exact-token overlap metric — BLEU, ROUGE-N, and even ROUGE-L, which still matches on identical tokens in order — scores it as a near-miss despite identical meaning. This is the defining blind spot of the whole overlap family: it penalizes paraphrase and rewards surface overlap. The fix is semantic: BERTScore matches candidate and reference tokens by contextual-embedding cosine similarity (so 'movie' and 'film' count as a match), and LLM-as-judge rates adequacy and fluency directly. Option A is wrong — ROUGE-L still relies on matching identical tokens in order, so it does not rescue a paraphrase with almost no shared vocabulary. Option B denies the premise; the paraphrase is genuinely good. Option C misapplies perplexity, which is an intrinsic, reference-free language-model metric, not a synonym-aware comparison metric.",
      },
    ],
    takeaway: "Match the metric to the task's notion of 'good': BLEU is precision-oriented for translation (with clipping to stop repetition-farming and a brevity penalty to stop cowardly-short outputs), ROUGE is recall-oriented for summarization (ROUGE-L rewards in-order coverage), METEOR adds stemming/synonyms for better human correlation, perplexity is an intrinsic reference-free language-model metric, and exact-match/token-F1 grade extractive spans. All n-gram-overlap metrics share one blind spot — they penalize valid paraphrase and reward surface overlap — which is exactly why embedding-based BERTScore and LLM-as-judge exist.",
  },

  "nlp-transfer-learning": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Here's a result that should bother you. A team trains a sentiment classifier from scratch on 2,000 labeled examples: 71% accuracy, stuck. The same 2,000 labels, given instead to a model that was first exposed to mountains of plain unlabeled text, produce 89%. Nothing about the labels changed. Where did the extra accuracy come from?\n\nFor most of NLP's history, every task started from a blank slate: want a classifier, collect labels, train from zero. Said out loud, that means the model had to learn *English itself* — grammar, meaning, how sentences work — from your few thousand examples, which is absurd. The escape is one idea: learn the language once, from free unlabeled text, and let your scarce labels teach only the final, narrow task.\n\nBut unlabeled text has no answers attached — what is there to learn from? The trick is to manufacture answers from the text itself: hide a word, make the model guess it. To reliably fill in 'the doctor picked up her ___', a model is forced to absorb how sentences are built, what words mean, who 'her' points back to — even how the world works. Nobody labeled anything, yet everything got learned. That move is called **self-supervision**, the two-step recipe built on it is **pretrain-then-fine-tune**, and its arrival is remembered as NLP's 'ImageNet moment' — the point the whole field switched paradigms.\n\nThis module walks the lineage that got there — word2vec's static vectors, ELMo's context-aware ones, ULMFiT proving you could fine-tune a whole language model without wrecking it, then BERT and GPT splitting the world by pretraining objective — and ends at the practical fork you'll actually face (freeze the model and train a small head, or fine-tune everything) and the doorway to today: prompting and LoRA-style adapters. By the end, the 89%-from-the-same-labels result won't just be unsurprising — you'll be able to derive it.",
    scenario: "You inherit a sentiment classifier that a previous team trained from scratch on 2,000 labeled reviews, and it plateaus at 71% accuracy. Labeling more data is expensive — a domain expert costs real money per example. In a hallway conversation someone says 'just fine-tune a pretrained model,' and to your surprise a fine-tuned BERT hits 89% on the *same* 2,000 labels, reaching your old plateau with only a couple hundred of them. Encouraged, you point the same recipe at a second task: classifying legal-contract clauses, a domain BERT's pretraining corpus barely touched, on a budget of one laptop GPU. Do you freeze BERT and train a small head on top, or fine-tune the whole model — and if you picked the second option, which of ULMFiT's own stability tricks would you reach for first, and why?",
    explanation: [
      "For most of NLP's history, the default was: pick a task, gather a *labeled* dataset for it, and train a model *from scratch* on those labels. Every new task started from a blank slate and needed its own large labeled corpus — which is exactly why blank-slate training on a few thousand labels reliably plateaus well short of what the same labels can reach with a head start. The paradigm shift is captured in one phrase: **pretrain then adapt.** First *pretrain* a general model on a *massive, unlabeled* text corpus using **self-supervision** (an objective that manufactures its own labels from raw text), then *fine-tune* that pretrained model on your small labeled task set. ==The expensive learning — syntax, semantics, world knowledge — happens once, on free unlabeled text; your scarce labeled data only has to teach the model the narrow, final task on top.==",
      "*Why does pretraining work at all?* Pause on that before reading the mechanism: with no human answers attached to any of this text, what could a model possibly learn from it? Because the self-supervised objectives are cleverly chosen so that succeeding at them *forces* the model to learn genuinely useful structure. Consider masked-language modeling: hide a word and predict it from context. To fill 'the doctor picked up her ___' well, the model must learn grammar, word meaning, co-reference, and even facts about the world. ==No human labeled anything — the text itself supplies the answer (the hidden word), so you can train on effectively unlimited data, and the only way to do well is to internalize language.== Those internalized representations *transfer*: a model that already understands language needs only a light nudge to do sentiment, NER, or QA. That is why fine-tuning reaches high accuracy with far fewer labels — you are not teaching language from scratch, only pointing existing knowledge at a task.",
      { type: "illustration", label: "The paradigm shift: train-from-scratch vs pretrain-then-adapt", content: `TRAIN FROM SCRATCH (old default)
  [ blank model ] --train on YOUR 2k labeled reviews--> classifier
     must learn language AND the task from 2k labels -> plateaus (71%)
     every new task starts from zero, needs its own big labeled set

PRETRAIN THEN ADAPT (the shift)
  step 1 PRETRAIN (once, expensive, self-supervised):
    [ blank model ] --predict masked words on BILLIONS of
                      UNLABELED sentences--> general language model
                      (learned syntax, semantics, world knowledge)
  step 2 FINE-TUNE (cheap, per task):
    [ pretrained model ] --train on YOUR 2k labels--> classifier (89%)
       language already known; 2k labels only teach the final task
       reaches the old plateau with FAR fewer labels -> data efficiency` },
      "The lineage is worth knowing precisely, because interviewers use it to test whether you understand *what changed at each step*. **word2vec / GloVe (2013-14)** gave each word a single *static* vector learned from co-occurrence — a huge step, but 'bank' had one vector whether it meant a riverbank or a financial bank, and these were used as frozen *features* fed into a task-specific model. **ELMo (2018)** made embeddings *deep and contextual*: it ran a bidirectional LSTM *language model* and used its internal states, so 'bank' got a *different* vector depending on the sentence — context-dependent representations, still largely feature-based. **ULMFiT (2018)** proved you could **fine-tune a full language model** for text classification and introduced the training tricks that made it stable: **discriminative learning rates** (lower layers, which hold general language, get *smaller* learning rates than task-specific top layers), **gradual unfreezing** (unfreeze layers top-down rather than all at once, to avoid catastrophically destroying pretrained knowledge), and a **slanted triangular learning rate** (warm up fast, then decay). ==ULMFiT is the moment 'fine-tune the whole pretrained LM' became the recipe, not just 'use its embeddings as features.'==",
      "But an LSTM processes tokens one at a time, its hidden state dragging forward — that sequential bottleneck caps both how far back the model can look and how well training parallelizes at scale. That ceiling is what the Transformer's full self-attention broke through. Then **BERT and GPT (2018+)** replaced the LSTM with the **Transformer** and split on the pretraining objective. **BERT uses masked-language modeling (MLM)** — mask a fixed ~15% of tokens, a hyperparameter chosen by BERT's designers rather than learned, and predict them from *both* directions — which makes it *bidirectional* and excellent for *understanding* tasks (classification, NER, extractive QA). **GPT uses causal (autoregressive) language modeling** — predict the next token from the left context only — which makes it *unidirectional* and natural for *generation*. This era is often called ==NLP's 'ImageNet moment'==: just as pretraining CNNs on ImageNet and fine-tuning became the default for vision, pretraining a Transformer LM and fine-tuning became the default for NLP.",
      { type: "illustration", label: "The lineage — what changed at each step", content: `word2vec / GloVe   static per-word vector, feature-based
  (2013-14)        \"bank\" = ONE vector (no context); frozen features
        |
        v
ELMo (2018)        deep CONTEXTUAL embeddings from a biLSTM LM
                   \"bank\" varies by sentence; still mostly features
        |
        v
ULMFiT (2018)      FINE-TUNE the whole LM (not just its embeddings)
                   + discriminative LRs + gradual unfreezing
                   + slanted triangular LR  -> stable transfer
        |
        v
BERT / GPT (2018+) TRANSFORMER pretraining, split by objective:
                   BERT = masked-LM  (bidirectional -> understanding)
                   GPT  = causal-LM  (left-to-right -> generation)
                   \"NLP's ImageNet moment\"
        |
        v
foundation models + prompting / PEFT (today)` },
      "A practical fork every practitioner faces: **feature-extraction vs full fine-tuning.** *Feature extraction* freezes the pretrained model and trains only a small head on top of its output vectors — cheap, fast, low memory, hard to overfit on tiny data, but it can't adapt the deep representations to your domain. *Full fine-tuning* updates all the weights — higher ceiling, adapts to domain shift, but costs more compute/memory and can overfit or 'catastrophically forget' on small datasets (exactly the risk you saw ULMFiT tame earlier with gradual unfreezing and discriminative LRs). ==Rule of thumb: more labeled data and bigger domain shift favor full fine-tuning; very little data or tight compute favors feature extraction.==",
      "This paradigm leads *directly* into today's world. Once pretraining scaled up, the fine-tune-per-task step itself became expensive and sometimes unnecessary: a large enough pretrained 'foundation model' can be steered by **prompting** (in-context examples, no weight updates at all) or adapted with **parameter-efficient fine-tuning (PEFT)** like LoRA (train a tiny number of extra parameters instead of all of them). The through-line from word2vec to GPT to LoRA is one idea getting more powerful: ==learn general capabilities once from unlabeled text, then adapt cheaply.== Any dramatic data-efficiency jump from fine-tuning a pretrained model over training from scratch is that idea in miniature — the pretrained model already knew language, so the labels only had to teach the last inch.",
    ],
    keyPoints: [
      "**The shift: pretrain-then-adapt.** Pretrain a general model on massive *unlabeled* text via self-supervision (objective that manufactures its own labels), then fine-tune on a *small* labeled set. Expensive language learning happens once on free text; scarce labels only teach the final task — the source of dramatic data efficiency.",
      "**Why pretraining works:** self-supervised objectives (e.g. masked-LM: predict a hidden word) can only be solved by learning grammar, semantics, co-reference, and world knowledge. Those representations *transfer*, so fine-tuning needs far fewer labels — you are pointing existing knowledge at a task, not teaching language from scratch.",
      "**The lineage:** word2vec/GloVe (static, feature-based, 'bank' = one vector) -> ELMo (deep contextual embeddings from a biLSTM LM) -> ULMFiT (fine-tune the *whole* LM; discriminative LRs, gradual unfreezing, slanted triangular LR) -> BERT (masked-LM, bidirectional, understanding) & GPT (causal-LM, left-to-right, generation). This is 'NLP's ImageNet moment.'",
      "**Feature-extraction vs full fine-tuning:** freeze-and-train-a-head is cheap, low-memory, overfit-resistant on tiny data but can't adapt deep representations; full fine-tuning has a higher ceiling and adapts to domain shift but costs more and risks overfitting/catastrophic forgetting (what ULMFiT's tricks tame). More data/bigger shift -> full FT; little data/tight compute -> feature extraction.",
      "**It leads straight into today:** scaled pretraining yields foundation models steerable by prompting (no weight updates) or PEFT/LoRA (train a tiny parameter set). The through-line from word2vec to LoRA is one idea — learn general capability once from unlabeled text, adapt cheaply.",
    ],
    recap: [
      "**Pretrain-then-adapt:** self-supervised pretraining on massive *unlabeled* text, then fine-tune on a *small* labeled set. Language learned once (free text); labels only teach the final task -> data efficiency.",
      "**Why it works:** solving masked-word prediction *forces* learning of syntax/semantics/world knowledge -> that transfers -> high accuracy from few labels.",
      "**Lineage:** word2vec/GloVe (static, feature-based) -> ELMo (deep contextual, biLSTM LM) -> ULMFiT (fine-tune whole LM; discriminative LR + gradual unfreezing + slanted triangular LR) -> BERT (masked-LM, understanding) & GPT (causal-LM, generation). 'NLP's ImageNet moment.'",
      "**Feature-extraction (freeze + head)** = cheap, overfit-resistant, no deep adaptation; **full fine-tuning** = higher ceiling, adapts to domain shift, risks overfit/forgetting. More data/shift -> full FT.",
      "**Leads to today:** foundation models + prompting (no updates) + PEFT/LoRA (tiny parameter set). One idea: learn general capability once, adapt cheaply.",
    ],
    mcqs: [
      {
        question: "A model trained from scratch on 2,000 labels plateaus at 71%, but a fine-tuned pretrained model hits 89% on the same 2,000 labels and reaches 71% with only ~200 labels. From first principles, why is the pretrained model so much more data-efficient?",
        options: [
          "During self-supervised pretraining on massive unlabeled text, the model already learned syntax, semantics, and world knowledge, so scarce labels only teach the final task, not language",
          "The pretrained model has far more parameters than the from-scratch one, and larger models are inherently able to reach higher accuracy on the same amount of labeled data",
          "The pretrained model actually memorized parts of these exact 2,000 reviews during its original pretraining run, so it already knew several of the correct labels going in from the start",
          "Fine-tuning applies a substantially higher learning rate than training from scratch does, which lets the model converge to a better optimum despite having very little labeled data available",
        ],
        correct: 0,
        explanation: "Option A is correct: pretraining on massive unlabeled text via self-supervision (e.g. predicting masked words) forces the model to internalize grammar, meaning, co-reference, and world knowledge. Those transferable representations mean the small labeled set only needs to teach the narrow final task — sentiment mapping — rather than the whole of language, which is why accuracy is far higher and far fewer labels are needed. Option B is wrong — raw parameter count is not the mechanism; a large model trained from scratch on 2k labels would still lack learned language and could easily overfit. Option C is wrong — the pretrained model never saw your specific reviews; the gain is transferred general language ability, not memorization of your data. Option D is backwards — small data usually calls for careful, often lower or discriminative learning rates; the efficiency comes from prior knowledge, not a hotter LR.",
      },
      {
        question: "In the transfer-learning lineage, what specifically distinguishes ULMFiT's contribution from ELMo's, and why did its training tricks matter?",
        options: [
          "ULMFiT was actually the method that introduced deep contextual word vectors from a bidirectional LSTM language model, while ELMo came later and only used static, context-free vectors as features",
          "ELMo and ULMFiT both discarded the LSTM in favor of a Transformer backbone and pretrained it with masked-language modeling, differing mainly in their fine-tuning schedules and learning-rate warmup",
          "ELMo and ULMFiT are essentially two names for the exact same contextual-embedding technique, published in the very same year by overlapping research groups using near-identical architectures",
          "ELMo produced deep contextual embeddings from a biLSTM LM but was used mostly as frozen features; ULMFiT showed you could fine-tune the whole LM, using discriminative LRs and gradual unfreezing",
        ],
        correct: 3,
        explanation: "Option D is correct: ELMo's advance was deep contextual embeddings — a biLSTM language model whose internal states give context-dependent word vectors — but they were mostly consumed as frozen features. ULMFiT's advance was showing you could fine-tune the entire pretrained language model on a downstream task, and its stability tricks were essential: discriminative learning rates give lower, more general layers smaller updates than task-specific top layers, and gradual unfreezing unfreezes top-down to avoid wiping out pretrained knowledge. Option A inverts the actual history — ELMo introduced contextual embeddings, not ULMFiT, and static vectors predate both (word2vec/GloVe). Option B misattributes BERT's contribution (Transformer backbone plus masked-language modeling) to this earlier pair, which both used LSTM-based language models. Option C is false — they are distinct methods published by different teams with genuinely different core contributions.",
      },
      {
        question: "You must adapt a pretrained model to a small labeled dataset with a notable domain shift. Which TWO statements correctly capture the feature-extraction vs full fine-tuning tradeoff?",
        options: [
          "Feature extraction should always be strongly preferred here because freezing the backbone guarantees the model can genuinely never overfit, regardless of how much labeled data happens to be available",
          "Feature extraction — freezing the backbone and training only a small head — is cheap and overfit-resistant on tiny data, but it can't reshape the deep representations to match a new domain",
          "Full fine-tuning updates all the weights for a higher ceiling and genuine domain adaptation, but it costs more compute and risks overfitting or catastrophic forgetting on small datasets",
          "Full fine-tuning should always be preferred because updating every weight strictly dominates feature extraction on any dataset size or degree of domain shift",
        ],
        correct: [1, 2],
        explanation: "B and C are both correct, and together they describe the real tradeoff: feature extraction (statement B) freezes the pretrained backbone and trains only a head, which is cheap and hard to overfit but cannot adapt deep representations to a shifted domain; full fine-tuning (statement C) updates every weight, giving a higher ceiling and real domain adaptation, but at higher compute cost and real risk of overfitting or catastrophic forgetting on small data — which is precisely why ULMFiT-style gradual unfreezing and discriminative learning rates exist. Because this scenario has a notable domain shift, full fine-tuning (carefully regularized) is often warranted despite the small data. Options A and D both overreach with 'always,' denying that either approach has real costs.",
      },
    ],
    takeaway: "Transfer learning reshaped NLP by moving from training task-specific models from scratch to pretraining a general model on massive *unlabeled* text via self-supervision and then fine-tuning on a small labeled set — the expensive language learning happens once, so scarce labels only teach the final task, which is the source of dramatic data efficiency. The lineage word2vec/GloVe -> ELMo -> ULMFiT -> BERT (masked-LM) & GPT (causal-LM) is 'NLP's ImageNet moment,' and it leads straight into today's foundation-model era of prompting and PEFT/LoRA: learn general capability once, adapt cheaply.",
  },

  "nlp-sentence-embeddings": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Close the gym with the module that connects everything here to the retrieval systems in the rest of this lab. The task sounds finished before it starts: you have BERT, a model that deeply understands sentences — so semantic search over a huge FAQ library should be trivial. Squash each sentence's token vectors into one vector, compare with cosine similarity, done.\n\nRun it, and the two obvious designs fail in opposite directions. Squash-and-compare is fast but nearly meaningless: related and unrelated pairs alike come back with almost the same high score, so the ranking barely discriminates. The opposite design — feed the question and a candidate *together* through the model, letting their tokens interact inside it — is beautifully accurate but computes one full forward pass per pair: against a library of half a million entries, that's half a million passes for every single query.\n\nThat fork is the real shape of this module: fast-but-meaningless on one side, accurate-but-unscalable on the other — and neither failure is a bug. The fast path fails because BERT's vectors were never *trained* to make geometric closeness mean semantic similarity; that property has to be taught, with a training signal that explicitly pulls paraphrases together and pushes unrelated sentences apart. The model that teaches it is **SBERT**; the two designs at the fork are the **bi-encoder** and the **cross-encoder**; and production resolves the fork with a pattern you'll meet all over this lab — retrieve fast with one, re-rank precisely with the other.\n\nWe'll diagnose exactly why raw BERT vectors bunch into a uselessly narrow region of space, build the training that fixes it, weigh the pooling choices for collapsing token vectors into one, and end at retrieve-then-rerank — the backbone of semantic search and RAG. Finish this and you've crossed the bridge: everything after this gym stands on sentences-as-vectors done right.",
    scenario: "You need a semantic search feature: given a user's question, find the most similar of 500,000 stored FAQ entries. Your first instinct is to mean-pool BERT's token vectors for each sentence and compare with cosine similarity — but the results are noticeably worse than keyword search, and unrelated sentences keep scoring suspiciously high (around 0.9) with everything. Separately, a colleague's 'accurate' approach runs the query and every candidate *together* through BERT and works beautifully, but at 500k candidates per query it is far too slow to ship. Design the fix, then go one step further: your reranking pass costs about 8ms per pair, and the product has a 100ms latency budget end to end. Given that, how large a shortlist can your fast retrieval step afford to hand off for reranking — and what does that number tell you about why reranking all 500,000 candidates directly was never going to ship?",
    explanation: [
      "The instinct — 'BERT is great at language, so mean-pool its token vectors and compare sentences with cosine' — fails for a subtle but important reason: **vanilla BERT's token vectors were never trained to be cosine-comparable.** BERT was pretrained on masked-language modeling; its objective rewards predicting hidden words, *not* placing whole sentences in a space where geometric closeness equals semantic similarity. So when you mean-pool and take cosine, you are using the vectors for something they were never optimized to do. This symptom — unrelated sentences all scoring suspiciously high, nearly indistinguishable from related ones — is a real, named pathology: **anisotropy.** ==BERT's raw embeddings occupy a narrow cone in the vector space rather than spreading out, so almost every pair of sentences looks similar (high cosine) and the metric loses its power to discriminate.== Fast, yes; meaningful, no.",
      "So you reach for the opposite design: throw away separate encoding entirely and let the two sentences interact fully inside the model. Running two sentences *together* through BERT rather than separately is called a **cross-encoder.** You concatenate the two sentences, feed the pair through the transformer, and let full self-attention compare every token of one against every token of the other, then a head outputs a similarity score. This is *accurate* because the two sentences interact deeply inside the model. But it is *unscalable*: the score is computed *per pair*, so to compare one query against 500,000 candidates you must run 500,000 forward passes, and to compare all candidates against each other for clustering you'd pay O(n^2) passes. ==A cross-encoder can't precompute anything — the comparison only exists once both sentences are inside the network together.== That is exactly why your colleague's approach is beautiful and unshippable.",
      { type: "illustration", label: "Bi-encoder vs cross-encoder — the scalability fork", content: `CROSS-ENCODER (accurate, unscalable)
  [ query  +  candidate ] --> BERT --> score
    self-attention lets every token compare across BOTH sentences
    but the score exists ONLY for that pair; nothing is reusable
    1 query vs 500k candidates = 500,000 forward passes  -> too slow
    all-pairs clustering = O(n^2) passes

BI-ENCODER / SBERT (slightly less accurate, hugely scalable)
  query     --> SBERT --> vector_q   (encode ONCE)
  candidate --> SBERT --> vector_c   (encode ONCE, precompute offline)
  similarity = cosine(vector_q, vector_c)   <- just a dot product
    500k candidates precomputed ONCE offline; each query = 1 encode
      + 500k cheap dot products (or an ANN index -> ~O(log n))
    comparison is O(1) per pair instead of a full forward pass

  Trade a little accuracy for orders-of-magnitude scalability.` },
      "The fix is **Sentence-BERT (SBERT)**, a **bi-encoder**: encode each sentence *independently* into one fixed vector, then compare vectors with a cheap cosine/dot product. The crucial part is *how* it's trained. SBERT is a **siamese (or triplet) network** — the same encoder processes each sentence — fine-tuned with a loss that *explicitly* pulls semantically similar sentences together in cosine space and pushes dissimilar ones apart. ==That training is the whole point: it converts BERT's non-comparable representations into an embedding space where cosine similarity actually *means* semantic similarity, which vanilla mean-pooled BERT never guaranteed.== Now each of your 500k candidates is encoded *once, offline*, into a vector; each incoming query is encoded once; and matching is O(1) dot products (or ~O(log n) with an ANN index). You keep almost all of the cross-encoder's quality while gaining orders of magnitude in speed.",
      "SBERT training uses **contrastive / triplet** objectives, and the intuition is worth stating cleanly. A **triplet** is (anchor, positive, negative): a sentence, a paraphrase/related sentence, and an unrelated sentence. The loss says *the anchor should be closer to the positive than to the negative by at least a margin* — a fixed hyperparameter set by the designer, not learned, typically a small constant in cosine-distance units. Repeated over many triplets, this *shapes* the space so that meaning maps to geometry. **Contrastive** losses generalize this to many negatives at once (often other examples in the same batch as negatives). ==The model isn't told absolute coordinates; it's told relative comparisons — 'these two are more alike than those two' — and that relative signal is exactly what builds a cosine-comparable space.==",
      { type: "illustration", label: "Pooling strategies — turning many token vectors into one", content: `BERT gives a vector PER TOKEN. You need ONE vector per sentence.

  input:  [CLS] the  movie  was  great  [SEP]
           v0    v1   v2     v3   v4     v5   (one vector each)

CLS pooling   : use only v0 (the [CLS] token's vector)
  - designed as a summary slot, but for vanilla BERT it is NOT a
    reliable sentence summary without task fine-tuning

MEAN pooling  : average v1..v4 (the real tokens)   <- usually wins
  - every token contributes; robust, smooth sentence vector
  - the default that SBERT found works best in practice

MAX pooling   : take the elementwise max across tokens
  - keeps the strongest signal per dimension; can spike on salient
    words but discards magnitude/frequency information

  Same tokens, different pooling -> different sentence vector ->
  different similarities. Pooling is a real design choice.` },
      "Pause here: mean pooling averages every token, including function words like 'the' and 'was' — would you expect that to help more on a short, blunt sentence, or a long, nuanced one? **Pooling strategy** is how you collapse BERT's *per-token* vectors into *one* sentence vector, and it's a genuine choice: **CLS pooling** uses only the `[CLS]` token's vector (intended as a summary slot, but for vanilla BERT it is not a dependable sentence summary without fine-tuning); **mean pooling** averages all token vectors; **max pooling** takes the elementwise maximum. ==Empirically, mean pooling usually wins for SBERT — averaging every token yields a smoother, more robust sentence representation than trusting a single `[CLS]` slot or the spiky elementwise max.== This is why the interactive lets you toggle pooling and watch the similarity structure change: the choice is not cosmetic.",
      "In production you often combine both encoder types: a **bi-encoder retrieves** a shortlist fast (encode the query once, ANN-search millions of precomputed candidate vectors), then a **cross-encoder reranks** the top handful for precision (a few expensive-but-accurate pair passes, not millions). This *retrieve-then-rerank* pattern gets scalability from the bi-encoder and final accuracy from the cross-encoder. Quality is measured on the **STS (Semantic Textual Similarity) benchmark** — sentence pairs with human similarity ratings — where you check that model **cosine similarity** correlates with human judgment. And the downstream payoff is broad: SBERT-style sentence embeddings power **retrieval/RAG, semantic search, clustering, deduplication, and paraphrase detection** — every task that needs to ask 'how similar in meaning are these two texts?' at scale, which vanilla BERT could not answer cheaply.",
    ],
    keyPoints: [
      "**You can't just mean-pool vanilla BERT and compare with cosine.** BERT's masked-LM objective never trained its vectors to be cosine-comparable, and its raw embeddings are *anisotropic* (they occupy a narrow cone), so unrelated sentences score deceptively high (~0.9) — fast but not discriminative.",
      "**SBERT is a bi-encoder trained (siamese/triplet) to make cosine mean semantic similarity.** It encodes each sentence independently into one vector; training explicitly pulls similar sentences together and pushes dissimilar apart, converting BERT's non-comparable space into a cosine-comparable one.",
      "**Bi-encoder vs cross-encoder is the scalability fork.** A cross-encoder feeds the *pair* through the model (deep interaction -> accurate) but computes per-pair, so 1-vs-N costs N forward passes and clustering is O(n^2). A bi-encoder encodes once and compares with O(1) dot products (or ~O(log n) via ANN) — a little accuracy for orders-of-magnitude scale.",
      "**Pooling turns per-token vectors into one sentence vector: CLS vs mean vs max.** CLS uses only the `[CLS]` slot (unreliable for vanilla BERT without fine-tuning); mean averages all tokens; max takes the elementwise maximum. Mean pooling usually wins for SBERT — smoother and more robust than a single slot or a spiky max.",
      "**Contrastive/triplet training uses relative comparisons** ('anchor closer to positive than to negative by a margin') to build the space. Production pattern: bi-encoder retrieves a shortlist, cross-encoder reranks the top few (retrieve-then-rerank). Quality via STS/cosine; uses: retrieval/RAG, semantic search, clustering, dedup, paraphrase detection.",
    ],
    recap: [
      "**Don't mean-pool vanilla BERT for cosine:** its masked-LM vectors aren't cosine-comparable and are *anisotropic* (narrow cone) -> unrelated sentences score ~0.9. Fast, not meaningful.",
      "**SBERT = bi-encoder, siamese/triplet-trained** -> cosine actually means semantic similarity; encode each sentence once into one vector.",
      "**Bi-encoder vs cross-encoder:** cross-encoder feeds the *pair* in (accurate, but per-pair -> N passes for 1-vs-N, O(n^2) clustering); bi-encoder encodes once -> O(1) dot products / ~O(log n) ANN. Little accuracy for huge scale.",
      "**Pooling (CLS / mean / max):** collapse per-token vectors into one. Mean pooling usually wins for SBERT (smoother, more robust than CLS slot or spiky max).",
      "**Contrastive/triplet** = relative 'closer to positive than negative by a margin.' Production: bi-encoder retrieve -> cross-encoder rerank. Measured on STS via cosine; powers RAG, search, clustering, dedup, paraphrase.",
    ],
    mcqs: [
      {
        question: "You mean-pool vanilla BERT token vectors and compare sentences with cosine similarity, but unrelated sentences keep scoring ~0.9 and results are worse than keyword search. What is the core reason, and what fixes it?",
        options: [
          "BERT's hidden vectors are simply too short in dimensionality to separate meanings cleanly here; switching to a model with a substantially larger hidden size would resolve the similarity collapse",
          "Cosine similarity is simply the wrong function to use on BERT's vectors; switching to Euclidean distance on the same mean-pooled vectors would fully recover accurate comparisons",
          "Vanilla BERT was trained on masked-language modeling, not to make vectors cosine-comparable, and its embeddings are anisotropic — squeezed into a cone — so nearly everything looks similar",
          "The input text wasn't lowercased or normalized before encoding, which inflates token-level similarity and explains why unrelated sentences keep scoring close to 0.9 on cosine",
        ],
        correct: 2,
        explanation: "Option C is correct: BERT's pretraining objective (masked-language modeling) never optimized whole-sentence vectors to be geometrically comparable, and its raw embeddings are anisotropic — squeezed into a narrow cone — so nearly every pair has high cosine similarity and the metric can't discriminate (the ~0.9-with-everything symptom). SBERT resolves this by fine-tuning a siamese/triplet bi-encoder with a loss that explicitly shapes the space so cosine similarity reflects semantic similarity. Option A is wrong — hidden size is not the issue; the space isn't trained to be comparable regardless of dimensionality. Option B is wrong — switching to Euclidean distance on vectors that were never trained for comparability doesn't fix the underlying anisotropy. Option D is a trivial preprocessing red herring that doesn't explain a systemic high-similarity pathology across unrelated sentence pairs.",
      },
      {
        question: "A cross-encoder gives excellent sentence-similarity accuracy but a colleague can't ship it for 1-query-against-500k-candidates search. Why is it unscalable, and how does a bi-encoder (SBERT) resolve the tradeoff?",
        options: [
          "A cross-encoder feeds both sentences through the model together, so its score exists only per pair; a bi-encoder encodes each sentence once, so candidates are precomputed and compared via cheap dot products",
          "The cross-encoder is unscalable mainly because storing all its model weights takes up far too much disk space on the serving machine; compressing or quantizing the model checkpoint would remove this scalability bottleneck entirely",
          "A bi-encoder is actually more accurate than a cross-encoder in every setting and at every scale, which is why well-designed production search systems have largely abandoned cross-encoders for any pairwise comparison task",
          "The cross-encoder is only slow because its forward passes currently run on CPU hardware; moving that exact same per-pair computation onto a GPU would make the per-query cost effectively constant",
        ],
        correct: 0,
        explanation: "Option A is correct: a cross-encoder concatenates the pair and lets full self-attention compare tokens across both sentences, which is accurate but means the score is computed per pair and nothing is reusable — so one query against 500k candidates costs 500k forward passes, and all-pairs clustering costs O(n^2). A bi-encoder (SBERT) encodes each sentence independently into a fixed vector, so candidates are embedded once offline and each query costs one encode plus cheap dot products (or ~O(log n) with an ANN index) — a modest accuracy tradeoff for orders-of-magnitude scale, which is why production often retrieves with the bi-encoder then reranks with the cross-encoder. Option B misattributes the bottleneck to disk space rather than per-pair computation. Option C is false — the cross-encoder is generally more accurate; the bi-encoder is what trades accuracy for scale, not the reverse. Option D is wrong — a GPU speeds each individual pass but doesn't change that N separate passes are required; the complexity, not the hardware, is the bottleneck.",
      },
      {
        question: "When building SBERT sentence vectors, you must pool BERT's per-token outputs into one vector. Which TWO statements about pooling strategies are correct?",
        options: [
          "CLS pooling is always the best choice for SBERT because the [CLS] token is specifically trained end-to-end to summarize the full sentence's meaning",
          "Mean pooling usually wins for SBERT because averaging every token yields a smoother, more robust sentence vector than trusting a single slot or a spiky elementwise maximum",
          "Pooling choice is essentially cosmetic here — CLS, mean, and max pooling produce numerically different vectors but nearly identical downstream similarity scores in real practice",
          "CLS pooling relies on the [CLS] token's vector, which for vanilla BERT is not a dependable sentence summary unless the model has been fine-tuned for that purpose",
        ],
        correct: [1, 3],
        explanation: "B and D are both correct: BERT emits one vector per token, so you must collapse them into a single sentence vector via CLS, mean, or max pooling. Mean pooling — averaging every token vector — usually performs best for SBERT because it produces a smooth, robust representation (statement B), while the [CLS] token, despite being positioned as a summary slot, is not a dependable sentence summary for vanilla BERT without task-specific fine-tuning (statement D) — which is exactly why relying on it can underperform. Max pooling can spike on salient dimensions while discarding magnitude and frequency information. Option A overstates CLS pooling's reliability, contradicting statement D. Option C is wrong — the interactive's own toggle demonstrates that different pooling strategies produce materially different similarity scores, not nearly identical ones.",
      },
    ],
    takeaway: "You can't just mean-pool vanilla BERT and compare with cosine — its masked-LM vectors were never trained to be cosine-comparable and are anisotropic, so unrelated sentences score deceptively high. SBERT fixes this with a siamese/triplet-trained bi-encoder that makes cosine similarity mean semantic similarity, letting you encode each sentence once (O(1) dot products or ANN) instead of paying a cross-encoder's per-pair forward pass; mean pooling usually beats CLS or max. The production pattern is retrieve-then-rerank (bi-encoder shortlist, cross-encoder precision), measured on STS via cosine, powering retrieval/RAG, semantic search, clustering, dedup, and paraphrase detection.",
  },
};
