// NLP Foundations (batch 3) — transformer families & objectives, classical NLP tasks,
// text classification & sentiment. Spread into foundationsRunnerData.js.
export const RUNNER_NLP_3 = {
  "nlp-encoder-decoder-objectives": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "You join a team that has three half-finished NLP prototypes and no one can agree on which model to reach for. One engineer fine-tuned BERT for a support-ticket classifier and it works beautifully, but when the PM asked her to make it 'also write the reply,' she couldn't — the model simply has no way to generate text. Another engineer built a chatbot on GPT and it generates fluent replies, but when asked to produce a single dense embedding for retrieval it felt like the wrong tool. A third is translating docs with T5 and swears by it for that but nothing else. In your architecture-review interview, the question lands: *why* are these three transformers good at different things, when they're all 'just transformers'? The answer is entirely about two design choices — the attention mask and the pretraining objective.",
    explanation: [
      "Every model in the scenario is built from the same transformer block. What makes BERT an *understanding* model, GPT a *generation* model, and T5 a *translation* model is not the block — it's ==two coupled choices: (1) which tokens each position is allowed to *attend to* (the attention mask), and (2) what self-supervised game the model plays during pretraining (the objective).== Get those two right in your head and the entire 'which family?' question answers itself. There are three canonical families, so we take them one at a time.",
      "**Family 1 — encoder-only (BERT).** Every token attends to *every other token*, both left and right. There is no masking of the future; the attention is fully **bidirectional**. Because a token can see the whole sentence at once, the representation it builds is deeply *contextual* — the word 'bank' resolves to river-bank or money-bank using words on either side. The pretraining game that this enables is **Masked Language Modeling (MLM)**: randomly hide ~15% of the tokens and train the model to predict each hidden token *from both sides at once*. \\n\\nThat bidirectionality is exactly why BERT is superb at *understanding* tasks — classification, named-entity recognition, sentence-pair scoring, and producing embeddings for retrieval — and exactly why it ==cannot naturally generate text==. To generate, you must produce token 1, then token 2 given token 1, and so on left-to-right; but BERT was trained assuming it always gets to peek at the right-hand context, which during generation does not yet exist. The support-ticket classifier worked; asking it to *write* the reply is asking the wrong architecture to do a job its training forbids.",
      { type: "illustration", label: "Attention masks: who can each token see?", content: `Sentence tokens:   [ the ][ cat ][ sat ][ on ][ mat ]
                     t0     t1     t2    t3    t4

ENCODER (BERT) — bidirectional, no mask
  every token sees every token
     t0 t1 t2 t3 t4
  t0  x  x  x  x  x     x = allowed to attend
  t1  x  x  x  x  x
  t2  x  x  x  x  x     (full square: past AND future visible)
  t3  x  x  x  x  x
  t4  x  x  x  x  x

DECODER (GPT) — causal mask, look LEFT only
     t0 t1 t2 t3 t4
  t0  x  .  .  .  .     . = blocked (cannot see the future)
  t1  x  x  .  .  .
  t2  x  x  x  .  .     (lower triangle: only past + self)
  t3  x  x  x  x  .
  t4  x  x  x  x  x

  The mask IS the architecture difference. Same block, different
  triangle of visibility -> different capabilities.` },
      "**Family 2 — decoder-only (GPT).** Here the attention is **causal** (also called autoregressive): token *t* may attend only to tokens *at or before* position *t* — it looks *left*, never right. Visually that is the lower-triangular mask above. The pretraining objective is the simplest possible: **next-token prediction** — given everything so far, predict the very next token, sliding across the whole corpus. \\n\\nThis pairing is *natively generative*: generation just *is* repeatedly predicting the next token and appending it, which is precisely what training rehearsed. There is no train/inference mismatch. This is the family that won general-purpose GenAI, and it is worth being crisp about *why*: (a) the objective is dead-simple and applies to *any* text, so it **scales** to trillions of tokens with no labeling; (b) at scale these models exhibit **in-context learning** — you can specify a new task purely in the prompt (few-shot or zero-shot) with no fine-tuning; and (c) it collapses the whole zoo into ==one model that does everything== — classify, summarize, translate, chat — by phrasing each as 'continue this text.' The GPT chatbot generating fluent replies is this architecture doing exactly what it was born for.",
      "**Family 3 — encoder-decoder (T5, BART).** This is the original 'transformer' shape and it *combines* both mechanisms. An **encoder** reads the input with full **bidirectional** attention (like BERT) to build a rich understanding of the source. A **decoder** then generates the output left-to-right with **causal self-attention** (like GPT) *and* — the crucial extra piece — **cross-attention**, in which each decoder position attends back into the *encoder's* representations of the input. So the decoder writes token by token while continuously consulting the fully-understood source. \\n\\nThe pretraining objective is a denoising one: **T5 uses span corruption** (mask out contiguous spans, train the model to regenerate them), and **BART uses text infilling / reconstruction** (corrupt the input various ways, train it to rebuild the original). This shape is purpose-built for **sequence-to-sequence** work where a distinct input must be *transformed* into a distinct output: translation, summarization, grammatical correction. The T5 translator swears by it because translation is the archetypal 'read all of A, then write B while looking back at A' task.",
      { type: "illustration", label: "Encoder-decoder: bidirectional read + causal write + cross-attention", content: `             INPUT: "le chat"            OUTPUT: "the cat"

   ENCODER (bidirectional)          DECODER (causal + cross-attn)
   +----------------------+         +-------------------------+
   | le  <->  chat        |         | the -> cat   (causal:   |
   |  \\        /           |  ====>  |   each out token sees   |
   |  full understanding  | cross-  |   only prior out tokens)|
   |  of the source       | attn -> |         |               |
   +----------------------+         |   cross-attention looks |
                                    |   BACK into encoder repr |
                                    +-------------------------+

  read the whole source both ways  ->  write target left-to-right,
  consulting the source at every step.  Ideal for translation/summarize.` },
      "Now map **task -> family**, which is the payoff an interviewer wants. ==Understanding / no generation (classification, NER, embeddings, retrieval, reranking) -> encoder-only (BERT).== ==Open-ended generation, chat, one-model-for-everything, in-context/few-shot -> decoder-only (GPT).== ==Transform a distinct input into a distinct output (translation, summarization, seq2seq) -> encoder-decoder (T5/BART).== The scenario's three prototypes are one of each: the classifier is an encoder job, the chatbot is a decoder job, the translator is an encoder-decoder job. No one was wrong; they each picked the family whose mask + objective matched the task.",
      "A subtle but important closing point for the interview: **decoder-only became dominant even in territory the other families 'own.'** A big enough GPT can classify (prompt it to output a label), can embed (pool its hidden states or train it as an embedder), and can translate (it's just conditional generation) — all without a separate architecture. The reasons are the three above: frictionless scaling on unlabeled text, in-context learning, and the operational simplicity of maintaining *one* model. ==So the honest framing is: encoder-only and encoder-decoder are still often the *better, cheaper, lower-latency* tool for their specialty (a fine-tuned BERT classifier is smaller and faster than prompting a 100B decoder), but decoder-only is the *general* answer, which is why the frontier consolidated there.== That nuance — 'right tool per task, but one tool that can do all tasks won the platform' — is exactly the staff-level answer.",
    ],
    keyPoints: [
      "**Two choices define the family: the attention mask and the pretraining objective — not the transformer block itself.** Bidirectional-vs-causal masking plus MLM / next-token / denoising is the entire story of why the three families differ.",
      "**Encoder-only (BERT): bidirectional attention + Masked Language Modeling.** Every token sees every token, so representations are deeply contextual — great for classification, NER, embeddings, retrieval. It cannot naturally generate, because generation is left-to-right and MLM trained it to always peek at right-hand context.",
      "**Decoder-only (GPT): causal (left-only) attention + next-token prediction.** Generation is literally the training objective, so there's no train/inference mismatch. It won general-purpose GenAI via effortless scaling on unlabeled text, in-context/few-shot learning, and one-model-does-everything.",
      "**Encoder-decoder (T5/BART): bidirectional encoder + causal decoder + cross-attention, trained with span-corruption/denoising.** The decoder writes left-to-right while cross-attending back into the fully-read source — the natural shape for seq2seq: translation and summarization.",
      "**Task -> family: understanding/embeddings -> encoder; open-ended generation/chat -> decoder; transform input into distinct output -> encoder-decoder.** Decoder-only can do all three at scale, so it dominates — but a fine-tuned encoder is often smaller, faster, and cheaper for its specialty.",
    ],
    recap: [
      "**Mask + objective = family.** Same transformer block; different triangle of visibility and different self-supervised game.",
      "**Encoder-only (BERT):** bidirectional + MLM -> understanding (classify, NER, embed, retrieve); *cannot* naturally generate.",
      "**Decoder-only (GPT):** causal (look left) + next-token prediction -> natively generative; won GenAI via scaling, in-context learning, one-model-for-everything.",
      "**Encoder-decoder (T5/BART):** bidirectional encoder + causal decoder + cross-attention + denoising -> seq2seq (translation, summarization).",
      "**Task -> family** mapping; decoder-only generalizes to all tasks, but fine-tuned encoders stay smaller/faster/cheaper for their specialty.",
    ],
    mcqs: [
      {
        question: "An engineer fine-tuned BERT into an excellent support-ticket classifier, then was asked to make the same model *write* the reply and found she couldn't. What is the precise architectural reason BERT cannot naturally generate text?",
        options: [
          "BERT's pretraining corpus was too narrow and domain-specific for this task, leaving it without the vocabulary breadth and style range needed to produce fluent, varied generated replies",
          "BERT has no decoder stack at all, and was never trained end-to-end with a language-modeling head, so it never learned how to structure or phrase a full reply the way a chatbot would",
          "BERT's bidirectional attention and MLM train it to predict tokens using both left and right context, but generation proceeds left-to-right before right context exists",
          "Generation requires cross-attention into an encoder's stored representations at every decoding step, and BERT's single-stack design never learned to attend across two separate sequences that way",
        ],
        correct: 2,
        explanation: "Option C is correct: BERT is an encoder-only model with fully bidirectional attention, pretrained via MLM to reconstruct masked tokens using context on *both* sides. Autoregressive generation produces tokens one at a time left-to-right, so at each step the right-hand context does not yet exist — precisely the context MLM taught BERT to rely on. Option A is wrong: the limitation is architectural, not vocabulary or domain coverage — a broader corpus wouldn't fix the mask/objective mismatch. Option B is wrong: BERT indeed has no decoder stack, but that's not the reason it can't generate — encoder-only models were never meant to have one; the real blocker is bidirectional self-attention colliding with left-to-right generation. Option D is wrong: cross-attention belongs to encoder-decoder models and isn't why BERT specifically can't generate; BERT's issue is its bidirectional attention plus MLM objective, not a missing cross-attention mechanism.",
      },
      {
        question: "Why did decoder-only (GPT-style) models become the dominant general-purpose GenAI architecture, even taking over tasks that encoder-only and encoder-decoder models were designed for? Select the two correct reasons.",
        options: [
          "Next-token prediction is a simple self-supervised objective needing no manual labels, so it scales cleanly across enormous unlabeled text corpora",
          "Causal attention is computationally cheaper per token than bidirectional attention, giving decoder-only models a meaningful raw training-speed advantage over encoders",
          "Decoder-only models are always smaller and faster than a fine-tuned BERT classifier, which is why they replaced encoders for that task",
          "At sufficient scale these models show in-context learning, letting a new task be specified entirely through the prompt with no fine-tuning",
        ],
        correct: [0, 3],
        explanation: "Options A and D are correct: next-token prediction is trivially self-supervised on any text, so it scales to enormous unlabeled corpora without manual labeling (A); and at scale these models exhibit in-context learning, letting a new task be specified purely in the prompt with no fine-tuning (D). Together with the 'continue this text' framing that collapses many tasks into one model, these are the real drivers of decoder-only dominance. Option B is a red herring: the dominance is about scaling and generality, not a per-token compute edge — bidirectional attention isn't a training bottleneck. Option C is actually false as stated: a fine-tuned BERT is typically *smaller and faster* than a giant decoder for classification, which is exactly why encoders remain the better specialist tool even though decoders generalize.",
      },
      {
        question: "A team needs to translate documents from French to English. Which transformer family is the most natural fit and why?",
        options: [
          "Encoder-only (BERT), because its bidirectional attention builds such a complete understanding of the source that generating the target becomes a straightforward extra step",
          "Encoder-decoder (T5/BART), because a bidirectional encoder fully reads the source while a causal decoder generates left-to-right, cross-attending into that encoded source",
          "Decoder-only (GPT), because causal attention is required for any generation task, and encoder-decoder models are architecturally incapable of producing autoregressive output",
          "Encoder-only (BERT) fitted with a classification head over the entire target vocabulary, since such heads can supposedly be repurposed to emit one output token at a time",
        ],
        correct: 1,
        explanation: "Option B is correct: translation is the archetypal sequence-to-sequence task — a distinct input must be transformed into a distinct output. Encoder-decoder models are purpose-built for this: the encoder reads the source bidirectionally to understand it fully, the decoder generates the target autoregressively, and cross-attention lets each output token consult the encoded source at every step. Option A is wrong: a complete understanding of the source doesn't grant generation ability — encoder-only models have no mechanism to produce a target sequence at all. Option C is wrong on its central claim: encoder-decoder decoders are themselves causal and fully capable of autoregressive generation; causal attention isn't exclusive to decoder-only models. Option D is wrong: a classification head over the vocabulary performs one static prediction, not autoregressive sequence generation, and mismatches the task.",
      },
    ],
    takeaway: "Three transformer families differ by exactly two choices — the attention mask and the pretraining objective: encoder-only (BERT) is bidirectional + MLM and excels at understanding (classification, NER, embeddings) but cannot naturally generate; decoder-only (GPT) is causal + next-token prediction and is natively generative; encoder-decoder (T5/BART) pairs a bidirectional encoder with a causal, cross-attending decoder trained by denoising and owns seq2seq like translation. Map task to family, but remember decoder-only won the platform by scaling on unlabeled text and doing everything in one model — even as fine-tuned encoders stay the smaller, faster specialist.",
  },

  "nlp-classical-tasks": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your team is standing up a pipeline that reads incoming legal contracts and pulls out the parties, dates, governing-law jurisdiction, and obligations. A junior engineer proposes 'just ask GPT-4 to extract everything as JSON,' and in a demo it looks magical. But in the pilot, three problems surface: on 40,000 contracts a night the LLM bill and latency are brutal; occasionally it silently invents a party that isn't in the document; and the downstream database needs *exact character spans* so a lawyer can click a value and jump to where it appears. In the review, the staff engineer asks you to explain the *classical* NLP tasks underneath this — POS tagging, NER, parsing, coreference — how they were solved before LLMs, and why production teams still run small fine-tuned taggers instead of an LLM for everything.",
    explanation: [
      "Before LLMs, NLP was a stack of well-defined *linguistic* tasks, each with its own structure. Understanding them is not nostalgia — they are still the vocabulary of the field, still the fallback for reliability, and still exactly what an interviewer probes to see whether you know what's *under* the magic. We walk the canonical ladder from words to structure.",
      "**POS tagging** (part-of-speech) labels each token with its grammatical category — noun, verb, adjective, determiner, and so on. It sounds trivial until you hit ambiguity: in 'they *book* a flight' vs 'read a *book*', the same word is a verb or a noun depending on context. **NER (Named Entity Recognition)** finds and types the *spans* that name real things — people, organizations, locations, dates, money. Crucially, NER is a **span** task: 'Bank of America' is one three-token entity, not three separate ones, so you can't just label tokens independently — you must mark where an entity *begins* and *ends*. ==That span structure is why NER is framed as *sequence labeling* with a tagging scheme, not plain per-token classification.==",
      { type: "illustration", label: "BIO / BIOES tagging turns spans into per-token labels", content: `Sentence:   Tim    Cook   met   Bank   of     America   today
            ----   ----         ----------------------
            PERSON                    ORG

BIO scheme (Begin / Inside / Outside):
  Tim=B-PER  Cook=I-PER  met=O  Bank=B-ORG  of=I-ORG  America=I-ORG  today=O

BIOES scheme (adds End + Single-token):
  Tim=B-PER  Cook=E-PER  met=O  Bank=B-ORG  of=I-ORG  America=E-ORG  today=O
  (a lone entity like "IBM" would be S-ORG)

  B marks the START of a span, I its continuation, O = not an entity.
  This is how a SPAN task becomes a PER-TOKEN classification task:
  the boundaries are encoded in the tags themselves.` },
      "The tagging scheme is the trick that lets a span problem become a token-classification problem. **BIO** tags each token as **B**egin (first token of an entity), **I**nside (a later token of the same entity), or **O**utside (not an entity), with the entity type appended (`B-PER`, `I-ORG`). **BIOES** adds **E**nd and **S**ingle for sharper boundary signals. ==Encoding the span boundaries *into the tags* is what makes 'find these multi-word spans' expressible as 'classify each token' — and it's why you'll be asked about BIO in any NER interview.==",
      "**Parsing** recovers sentence *structure*, and there are two flavors interviewers love to contrast. **Dependency parsing** draws directed **arcs between words**: each word points to its syntactic *head* (in 'the cat sat', 'cat' is the subject of 'sat', 'the' modifies 'cat'), producing a tree of word-to-word relations. **Constituency parsing** instead builds a **nested phrase structure**: it groups words into constituents — a noun phrase '[the cat]', a verb phrase '[sat [on the mat]]' — like brackets within brackets. ==Dependencies = arcs between individual words (who governs whom); constituencies = nested phrases (which words clump into units). Same sentence, two different structural views.== **Chunking (shallow parsing)** is the lightweight middle ground: just segment the sentence into flat, non-nested phrases (noun-phrase, verb-phrase) without the full tree.",
      { type: "illustration", label: "Dependency arcs vs constituency brackets", content: `Sentence:  the   cat   sat   on    the   mat

DEPENDENCY PARSE  (arcs: word -> its head)
        +----------------------+
        |          +------+     |
   +--+ |    +--+  |   +--+     |
   the  cat       sat  on  the  mat
    det  nsubj      root pobj det
  "sat" is the root; "cat" depends on "sat" (subject);
  "the" depends on "cat" (determiner). Word-to-word.

CONSTITUENCY PARSE  (nested phrases)
   ( S
       ( NP  the  cat )                <- noun phrase
       ( VP  sat
             ( PP  on ( NP the mat ) ) ) )  <- verb phrase w/ nested PP
  Brackets inside brackets. Phrase-structure, not word links.` },
      "**Coreference resolution** links different mentions that refer to the *same* real-world entity: in 'Maria dropped the report because *she* was late; *it* was due at noon,' resolving *she* -> Maria and *it* -> the report. It's what lets a system know that scattered pronouns and noun phrases are all talking about one thing — essential for accurate extraction and summarization.",
      "**How were these solved classically?** The key modeling insight is about *structure*. A naive approach classifies each token **independently** — but that's wrong for sequence labeling, because the label of one token depends on its neighbors: `I-PER` can only legally follow `B-PER` or `I-PER`, never `O`. **HMMs (Hidden Markov Models)** modeled the sequence generatively (hidden tag states emitting words) but made restrictive independence assumptions. **CRFs (Conditional Random Fields)** were the workhorse upgrade, and the *why* is the interview point: a CRF scores the **whole tag sequence jointly** and normalizes **globally**, so it can learn hard constraints like 'I-PER cannot follow O' and pick the single best *consistent* labeling of the entire sentence. ==Independent per-token classification can emit illegal, incoherent tag sequences (an `I-ORG` with no `B-ORG` before it); a CRF's global normalization forbids that by scoring the sequence as a whole. That global-vs-local distinction is the classic CRF answer.== Modern neural taggers keep this idea: BiLSTM-CRF and BERT-CRF put a CRF layer on top of neural features precisely to enforce valid tag transitions.",
      "**So why, in the era of LLMs, do production teams still run small fine-tuned taggers?** The scenario names every reason. **Cost and latency**: a fine-tuned spaCy-style tagger is milliseconds and near-free per document; an LLM over 40,000 contracts a night is slow and expensive. **Reliability and structured guarantees**: a sequence labeler *can only* emit spans that exist in the input — it points *at* the text — whereas an LLM can *hallucinate* an entity that never appears. **Exact spans**: token labeling yields precise character offsets for click-to-source, which free-form LLM JSON does not guarantee. ==The mature pattern is not 'LLM replaces classical NLP' but 'right tool per constraint': LLMs win zero/few-shot flexibility and messy long-tail extraction; fine-tuned lightweight taggers win latency, cost, and the hard guarantee that every extracted span is really in the document.== Many real systems do both — an LLM for the fuzzy cases, a deterministic tagger for the high-volume, must-be-exact backbone.",
    ],
    keyPoints: [
      "**The classical ladder: POS tagging -> NER -> chunking/parsing -> coreference.** POS labels each word's grammatical category; NER finds and types multi-word *spans*; parsing recovers structure; coreference links mentions of the same entity.",
      "**NER is a span task solved as sequence labeling via BIO/BIOES.** BIO = Begin/Inside/Outside (type appended: B-PER, I-ORG); BIOES adds End/Single. Encoding span boundaries into the tags turns 'find multi-word spans' into 'classify each token.'",
      "**Dependency vs constituency parsing.** Dependency = directed *arcs between words* (each word points to its syntactic head); constituency = *nested phrase structure* (noun/verb phrases bracketed within brackets). Chunking is the flat, non-nested shallow-parse middle ground.",
      "**CRFs beat independent per-token classification via global normalization.** A CRF scores the whole tag sequence jointly, so it enforces legal transitions (I-PER can't follow O) and picks the single best consistent labeling — where independent classifiers can emit illegal, incoherent tag sequences. Modern: BiLSTM-CRF, BERT-CRF.",
      "**LLMs do many of these zero/few-shot, but production keeps fine-tuned lightweight taggers for reliability, latency, cost, and exact-span guarantees.** A tagger can only emit spans that exist in the text (no hallucinated entities) and gives precise character offsets; LLMs win flexibility and long-tail cases. Right tool per constraint, often both.",
    ],
    recap: [
      "**Canonical tasks:** POS tagging (word categories), NER (typed spans), dependency/constituency parsing (structure), coreference (same-entity mentions).",
      "**NER = sequence labeling with BIO/BIOES:** B=begin, I=inside, O=outside (+ E/S in BIOES). Boundaries encoded in the tags -> span task becomes token classification.",
      "**Dependency = arcs between words** (word -> head); **constituency = nested phrase brackets**; chunking = flat shallow parse.",
      "**CRF > independent classifier:** scores the whole sequence and normalizes globally, forbidding illegal tag transitions and choosing one consistent labeling. Neural heirs: BiLSTM-CRF, BERT-CRF.",
      "**Why keep classical taggers in the LLM era:** latency, cost, reliability, and exact-span guarantees (no hallucinated entities). LLMs win zero/few-shot flexibility; production often runs both.",
    ],
    mcqs: [
      {
        question: "Why is Named Entity Recognition framed as *sequence labeling with a BIO tagging scheme* rather than as independent per-token classification of entity types?",
        options: [
          "Entities are multi-token spans, and BIO encodes those boundaries into the tags (B=begin, I=inside, O=outside), so 'Bank of America' becomes one ORG span, not three labels",
          "BIO tagging removes the need for any labeled training data, since the begin/inside/outside pattern can supposedly be inferred automatically once the tagger sees raw, unlabeled text",
          "Per-token classification cannot assign entity types at all in principle, so a scheme like BIO is strictly required just to attach any label whatsoever to a single token",
          "BIO tagging lets the model run with far fewer parameters, since begin/inside/outside labels compress the output space compared to per-token type classification",
        ],
        correct: 0,
        explanation: "Option A is correct: entities span multiple tokens, so the model must know where an entity *starts* and *ends*. BIO encodes exactly that — B marks the first token of an entity, I marks continuation tokens, O marks non-entities, with the type appended (B-ORG, I-ORG). This lets 'Bank of America' be one ORG span instead of three disconnected labels, expressing a span problem as per-token classification with boundary structure. Option B is wrong — BIO is a labeling scheme applied to labeled examples; it still requires labeled training data, it doesn't remove that need. Option C is wrong — plain per-token classification *can* assign types just fine; what it can't represent coherently is multi-token span boundaries, which is the actual point of BIO. Option D is wrong — BIO doesn't shrink the model's parameter count; it changes what the tags encode, not the model's size.",
      },
      {
        question: "A CRF is preferred over classifying each token independently for sequence labeling. What is the core reason?",
        options: [
          "A CRF uses noticeably fewer parameters than an equivalent per-token classifier, and that smaller size is what lets it train faster on the same data",
          "A CRF is inherently a deep neural network with dozens of internal layers, whereas independent per-token classifiers are restricted to simple linear decision boundaries over hand-built features",
          "A CRF replaces the BIO tagging scheme entirely, learning its own boundary representation directly instead of relying on Begin/Inside/Outside labels",
          "A CRF scores the entire tag sequence jointly and normalizes globally, so it enforces legal transitions like 'I-PER cannot follow O' and picks one consistent labeling",
        ],
        correct: 3,
        explanation: "Option D is correct: the label of each token depends on its neighbors (I-PER can only follow B-PER or I-PER, never O). A CRF models the whole sequence and normalizes over all possible labelings *globally*, so it learns valid transition constraints and selects the single most consistent tag sequence — preventing the illegal outputs (an I-ORG with no preceding B-ORG) that independent per-token classifiers can produce. Option A is wrong — the advantage is global consistency, not a smaller parameter count; CRFs typically add inference cost rather than removing it. Option B is wrong — a CRF is a probabilistic sequence model, not inherently a deep network; it's commonly layered on top of neural or linear features (BiLSTM-CRF, BERT-CRF). Option C is wrong — a CRF still operates over BIO/BIOES tags; it enforces their transitions rather than replacing the scheme.",
      },
      {
        question: "On a pipeline extracting parties and dates from 40,000 contracts a night, a team keeps a fine-tuned spaCy-style NER tagger instead of calling an LLM for every document. Select the two reasons that best justify this.",
        options: [
          "Fine-tuned taggers require no labeled training data at all to reach production quality, unlike LLMs, which must first be trained on millions of labeled examples",
          "At 40,000 documents a night, a small fine-tuned tagger is far cheaper and dramatically lower-latency than invoking an LLM on every single document",
          "A sequence labeler can only emit spans that literally exist in the input, so it cannot hallucinate a party or date, and it yields exact character offsets",
          "The LLM is less accurate than the tagger on every possible input across the board, so calling it for this kind of extraction should never even be attempted",
        ],
        correct: [1, 2],
        explanation: "Options B and C are correct: at high volume, a fine-tuned tagger is far cheaper and lower-latency than an LLM call per document (B); and because it points at the input, every extracted span provably exists in the document with exact character offsets, so it cannot hallucinate a party or date (C). Together these are the real justification — right tool per constraint, not 'never use the LLM.' Option A is false: fine-tuned taggers absolutely require labeled training data; they don't skip that step. Option D overstates the case: LLMs are often more flexible and better on messy, long-tail extraction, so 'never use it' is the wrong takeaway — the actual tradeoff is latency, cost, reliability, and exact spans, not blanket accuracy superiority.",
      },
    ],
    takeaway: "Classical NLP is a ladder of well-defined tasks — POS tagging, NER (a span task solved as BIO/BIOES sequence labeling), dependency parsing (arcs between words) vs constituency parsing (nested phrases), and coreference — historically solved with HMMs and then CRFs, whose global normalization enforces legal tag sequences that independent per-token classifiers cannot. LLMs now do many of these zero/few-shot, but production still runs small fine-tuned taggers because they are faster, cheaper, and give hard structured guarantees: they can only emit spans that truly exist in the text and provide exact character offsets. The mature stance is right-tool-per-constraint, frequently running both.",
  },

  "nlp-text-classification": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "You own the model that routes and scores incoming product reviews as positive or negative for a retail app. It started as a scrappy Naive Bayes classifier on bag-of-words features, shipped in an afternoon, and has quietly served millions of reviews. Now leadership wants better accuracy and asks: should we replace it with fine-tuned BERT, or just prompt an LLM zero-shot? Meanwhile the on-call engineer notices the classifier looks '96% accurate' but is missing almost every genuinely angry review — because only 4% of reviews are negative and the metric is hiding it. Your interview task: explain text classification from Naive Bayes up through LLMs, the evaluation traps (imbalance, thresholds, precision/recall/F1, macro vs micro), and how to choose.",
    explanation: [
      "**Text classification** is the workhorse of applied NLP: map a piece of text to a label. The framings matter — **binary** (positive/negative), **multiclass** (one label from many: topic = sports/politics/tech), and **multilabel** (a document can carry *several* labels at once: a review tagged both 'shipping' and 'quality'). Sentiment analysis is the canonical binary/multiclass instance. We build up from the simplest strong model to the modern options, then spend real time on evaluation, because that's where the scenario is actually bleeding.",
      "**Naive Bayes** is where most sentiment systems began, and it's worth understanding precisely because it's a *strong baseline* despite a wildly simplifying assumption. It represents a document as a **bag of words** (counts, order discarded) and applies **Bayes' rule**: pick the class *c* that maximizes P(c | words) ∝ P(c) · P(words | c). The 'naive' part is the **conditional-independence assumption**: it treats every word as independent of every other *given the class*, so P(words | c) = ∏ P(word_i | c). That's obviously false — 'not' and 'good' are hardly independent — yet it works startlingly well because for *ranking* the classes you don't need calibrated probabilities, just the right argmax. ==Naive Bayes is 'naive' because it pretends words are independent given the class; it's a strong baseline because that wrong assumption still usually points at the right class.==",
      { type: "illustration", label: "Naive Bayes: log-probability tally decides the class", content: `Doc: "not worth the money"     Classes: POS vs NEG

Use LOG-probabilities (sums, not products) to avoid underflow:
  score(c) = log P(c) + Σ_w log P(w | c)

Per-word log P(w|c)  (learned from the training corpus):
   word     log P(w|POS)   log P(w|NEG)
   not         -3.9           -2.1      <- "not" leans NEG
   worth       -2.8           -3.0
   the         -1.2           -1.2      (stopword: ~neutral)
   money       -2.6           -2.5

   prior       -0.7 (POS)     -0.7 (NEG)   (assume balanced)

  score(POS) = -0.7 + (-3.9-2.8-1.2-2.6) = -11.2
  score(NEG) = -0.7 + (-2.1-3.0-1.2-2.5) = -9.5   <- HIGHER -> predict NEG

  Why LOG? Products of many small probs underflow to 0.0 in floats;
  logs turn the product into a numerically stable SUM.` },
      "Two practical details make Naive Bayes actually run. **Log-probabilities**: multiplying hundreds of tiny probabilities underflows to zero in floating point, so you *sum logs* instead of multiplying — mathematically identical for the argmax, numerically stable. **Laplace (add-one) smoothing**: if a word never appeared with a class in training, its P(word | c) is zero, and a single zero *annihilates* the whole product (log of zero is −∞). Smoothing adds a small count to every word so no probability is ever exactly zero. ==Both tricks exist to keep the product of many word-probabilities numerically sane: logs prevent underflow, smoothing prevents a single unseen word from zeroing the class.==",
      "Above Naive Bayes sits the classic **linear** tier: **logistic regression** or a **linear SVM** over **TF-IDF** features (term frequency times inverse document frequency — common words down-weighted, distinctive words up-weighted). These drop the independence assumption, learn *weights* per feature, and typically beat Naive Bayes on accuracy while staying fast, cheap, and interpretable (you can read the highest-weighted words per class). For years this — TF-IDF + logistic regression — was the default production text classifier, and it remains an excellent, hard-to-beat baseline.",
      "Then the **neural progression**: **CNN/RNN text classifiers** learned features from word embeddings instead of hand-built counts (capturing some word order and local phrases); **fine-tuned BERT** brought deep bidirectional context and became the accuracy king for classification when you have labeled data; and **zero-shot LLM classification** lets you classify *with no training data at all* by prompting ('is this review positive or negative?'). The tradeoffs are the interview substance: ==more powerful models need more (BERT: labeled data; LLM: none) but cost more latency and money and are less interpretable; simpler models (NB, TF-IDF+LR) are fast, cheap, interpretable, and often *good enough*.== The right choice depends on labeled-data availability, latency/cost budget, and how much accuracy the last few points are worth.",
      { type: "illustration", label: "The imbalance trap: accuracy lies, precision/recall/F1 don't", content: `Sentiment routing: only 4% of reviews are NEGATIVE (the class we care about)

A lazy model that predicts POSITIVE for EVERYTHING:
   Accuracy = 96%   <- looks great, is useless (catches ZERO angry reviews)

Confusion matrix for the NEGATIVE class:
                 predicted NEG   predicted POS
   actual NEG        TP=?             FN=?  (missed angry reviews)
   actual POS        FP=?             TN=?

  Precision = TP/(TP+FP)  "of those I flagged NEG, how many really were?"
  Recall    = TP/(TP+FN)  "of all real NEG, how many did I catch?"
  F1        = 2·P·R/(P+R)  harmonic mean (punishes lopsided P or R)

  The all-POSITIVE model: Recall(NEG)=0 -> F1(NEG)=0. The 96% evaporates.
  On imbalanced data, track precision/recall/F1 on the RARE class,
  not accuracy.` },
      "Now the evaluation core, where the scenario is actually failing. **Class imbalance**: when 4% of reviews are negative, a model predicting 'positive' always is *96% accurate* and *completely useless* — it catches zero angry reviews. ==Accuracy is a trap on imbalanced data; you must look at the minority class directly.== That means the confusion-matrix quartet: **precision** = of the items I flagged negative, how many truly were (TP/(TP+FP)); **recall** = of all truly-negative items, how many I caught (TP/(TP+FN)); and **F1** = their **harmonic mean** (2·P·R/(P+R)), which stays low if *either* is low — so it can't be gamed by nailing precision while recall collapses. The all-positive model has recall 0 on the negative class, so its F1 is 0, exposing what accuracy hid.",
      "Two more levers finish the picture. **Decision thresholds**: a classifier outputs a *probability*, and *you* choose the cutoff. The default 0.5 is arbitrary — lower it to catch more negatives (higher recall, lower precision), raise it for the reverse. Threshold-tuning trades precision against recall to fit the business cost of a miss vs a false alarm, *without retraining*. **Macro vs micro averaging** for multiclass/multilabel: **micro** pools all decisions across classes (so big classes dominate — it answers 'overall, across all predictions'), while **macro** averages the per-class F1s *equally* (so a tiny class counts as much as a huge one — it answers 'how well do I do on the average class, rare ones included'). ==If you care about rare classes (fraud, angry reviews), report macro-F1 — micro-F1 lets the dominant class mask minority failure, exactly the accuracy trap wearing a different hat.== The staff-level close for the scenario: the fix may not be a fancier model at all — first tune the threshold and switch the metric to macro-F1/recall-on-negatives; *then* decide whether fine-tuned BERT or a zero-shot LLM is worth its cost.",
    ],
    keyPoints: [
      "**Text classification maps text -> label: binary, multiclass, or multilabel (several labels at once).** Sentiment is the canonical case. Build from a strong simple baseline up to LLMs, and treat evaluation as first-class.",
      "**Naive Bayes = bag-of-words + Bayes' rule + conditional-independence.** It's 'naive' because it pretends words are independent given the class (false), yet a strong baseline because the wrong assumption still usually picks the right argmax. Use log-probabilities (avoid underflow) and Laplace smoothing (stop one unseen word zeroing the product).",
      "**Progression: NB -> logistic regression / linear SVM over TF-IDF -> CNN/RNN -> fine-tuned BERT -> zero-shot LLM.** More power needs more (BERT: labeled data) or none (LLM), but costs latency, money, and interpretability; simpler models are fast, cheap, interpretable, and often good enough. Choose on data availability, budget, and value of the last accuracy points.",
      "**Class imbalance makes accuracy a trap.** At 4% negatives, always-predict-positive is 96% accurate and useless. Look at the minority class with precision (TP/(TP+FP)), recall (TP/(TP+FN)), and F1 (their harmonic mean, low if either is low).",
      "**Tune decision thresholds and pick the right averaging.** The 0.5 cutoff is arbitrary — move it to trade precision vs recall without retraining. Micro-F1 pools decisions (big classes dominate); macro-F1 averages per-class equally (rare classes count) — report macro-F1 when minority classes matter.",
    ],
    recap: [
      "**Framing:** text -> label; binary / multiclass / multilabel. Sentiment is the canonical example.",
      "**Naive Bayes:** bag-of-words + Bayes' rule + conditional independence ('naive' but a strong baseline). Log-probs avoid underflow; Laplace smoothing stops a single unseen word zeroing the product.",
      "**Model ladder:** NB -> TF-IDF + logistic regression/linear SVM -> CNN/RNN -> fine-tuned BERT -> zero-shot LLM. Tradeoffs: labeled-data needs, latency, cost, interpretability.",
      "**Imbalance trap:** accuracy lies (96% by predicting the majority). Use precision, recall, F1 (harmonic mean) on the rare class.",
      "**Thresholds + averaging:** move the 0.5 cutoff to trade precision/recall without retraining; macro-F1 weights every class equally (report it when rare classes matter), micro-F1 lets the dominant class mask minority failure.",
    ],
    mcqs: [
      {
        question: "Naive Bayes is called 'naive' yet is famously a strong baseline for text classification. What is the naive assumption, and why does the model still work well despite it?",
        options: [
          "It assumes the training corpus is perfectly class-balanced, and it performs well because most real sentiment datasets happen to already be balanced",
          "It assumes words are drawn uniformly at random from the vocabulary, and Laplace smoothing is what corrects for that unrealistic assumption at inference time",
          "It assumes every word is conditionally independent given the class, which is false, yet it usually picks the right class since ranking only needs a correct argmax",
          "It assumes the classes themselves are entirely independent of the specific words used in any document, which is why class priors can safely be dropped during final scoring",
        ],
        correct: 2,
        explanation: "Option C is correct: the naive assumption is *conditional independence of features given the class*, letting P(words|c) factor into a product of per-word probabilities. That's false in real language ('not' and 'good' interact), but Naive Bayes only needs to rank classes correctly, and the argmax is often right even when the estimated probabilities are miscalibrated — hence a strong, cheap baseline. Option A is wrong — the assumption is about word independence, not class balance, and NB does not require balanced training data. Option B misstates the assumption entirely (it's independence given the class, not uniformly random words) and misattributes success to smoothing, which only prevents zero probabilities. Option D is backwards — priors P(c) very much matter in Bayes' rule; the independence being assumed is among words, not between classes and words.",
      },
      {
        question: "A sentiment classifier reports 96% accuracy, but only 4% of reviews are negative and it misses almost every negative one. What is happening and which metrics expose it?",
        options: [
          "This is the class-imbalance trap: predicting the majority class scores high accuracy while catching none of the rare class; precision/recall/F1 on the negative class expose it",
          "The model is well-calibrated and genuinely accurate, and 96% overall accuracy here is strong evidence that it is working correctly and needs no further changes at all",
          "This is an underflow problem in the underlying floating-point probability computation, and switching to log-probabilities during scoring would raise the measured accuracy",
          "The fix is simply to raise the decision threshold well above the default 0.5, since raising a classifier's threshold always increases recall on the rare negative class",
        ],
        correct: 0,
        explanation: "Option A is correct: with 4% negatives, a model that predicts positive for everything scores 96% accuracy yet has zero recall on the class you care about. Accuracy is a trap on imbalanced data; precision, recall, and F1 on the minority class expose it — recall on negatives near 0 drives F1 near 0. Option B is wrong — high accuracy here reflects imbalance, not a working model. Option C confuses concerns — underflow and log-probabilities are Naive Bayes numerics, unrelated to the imbalance/metric problem here. Option D is wrong on direction — *lowering* the threshold catches more negatives (raising recall at some precision cost); raising it does the opposite, and threshold tuning trades precision against recall rather than 'always' improving recall.",
      },
      {
        question: "For a multiclass model where several rare classes matter as much as the dominant one, which two statements about macro-F1 versus micro-F1 are correct?",
        options: [
          "Micro-F1 is mathematically invalid whenever a classification problem has more than two classes, so it should never be reported for any multiclass task",
          "Micro-F1 pools every decision across all classes before scoring, so a large dominant class can quietly mask poor performance on a rare one",
          "Macro-F1 and micro-F1 always converge to identical scores the moment a dataset contains any meaningful degree of class imbalance",
          "Macro-F1 averages the per-class F1 scores with equal weight, so a tiny minority class counts exactly as much as the largest class",
        ],
        correct: [1, 3],
        explanation: "Options B and D are correct: micro-F1 aggregates true/false positives and negatives across all classes before computing the score, so the dominant class drives the result and a rare class doing badly can be hidden (B) — the accuracy trap in another form; macro-F1 computes F1 per class and averages with equal weight, so each class, including rare ones, contributes equally (D), which is what you want when minority-class performance matters. Option A is wrong — micro-F1 is a valid, well-defined metric for any number of classes; it just answers a different question than macro-F1. Option C is the opposite of the truth — macro and micro diverge *most* under imbalance; they coincide only in special balanced or degenerate cases.",
      },
    ],
    takeaway: "Text classification maps text to a label (binary/multiclass/multilabel), and the model ladder runs Naive Bayes (bag-of-words + Bayes' rule + the naive conditional-independence assumption, kept sane with log-probabilities and Laplace smoothing) up through TF-IDF + logistic regression, CNN/RNN, fine-tuned BERT, and zero-shot LLMs — each step trading interpretability, latency, cost, and labeled-data needs for accuracy. But the sharpest interview points are evaluation: on imbalanced data accuracy lies, so you measure precision/recall/F1 on the rare class, tune the decision threshold to trade precision against recall without retraining, and prefer macro-F1 when minority classes matter. Often the fix is a better metric and threshold, not a bigger model.",
  },
};
