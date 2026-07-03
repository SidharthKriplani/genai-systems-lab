// Deepened teaching for previously-thin Foundations modules. Spread LAST into foundationsRunnerData.js.
export const RUNNER_DEEPEN_THIN = {
  "reranking": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your RAG support bot retrieves the top 5 chunks by vector similarity and stuffs them into the prompt. Eval says recall@50 is 0.94 — the right document is almost always somewhere in the top 50 — yet users complain the bot 'ignores the obvious answer.' You dig in: the correct chunk is frequently sitting at rank 18, well below the 5 you actually pass to the model. Widening to top-20 blows your context budget and *lowers* answer quality (more distractors). Someone suggests 'add a reranker.' You need to explain what that actually buys you and what it costs before you sign off on the extra latency.",
    explanation: [
      "Retrieval and reranking are two different scoring machines with two different cost/quality profiles, and RAG works best when you use each for what it is good at.\n\nYour first stage is a **bi-encoder** (the embedding model behind your vector DB). It encodes the query into a vector *once*, encodes every document into a vector *once* (offline, ahead of time), and scores a query-document pair by a cheap **dot product or cosine similarity** between the two vectors. Because the document vectors are precomputed and the comparison is just a distance in vector space, you can score *millions* of documents in milliseconds via an ANN index (HNSW, IVF). ==That speed is the entire reason bi-encoders exist — but it comes from a compression you should be suspicious of.==",
      "The compression is this: a bi-encoder squashes an entire document into **one fixed vector before it has ever seen the query**. Query and document never interact until the final dot product. So a subtle mismatch — the query asks about *refunds after 30 days* and the chunk covers *refunds within 30 days* — can be invisible, because both map to nearly the same region of embedding space. The bi-encoder trades **term-level, query-aware reasoning** for the ability to precompute. That is why **recall is high but precision at the very top is mediocre**: the right chunk is *in* the neighborhood (recall@50 = 0.94), but its exact rank among near-neighbors is noisy (it lands at 18, not 3).",
      "A **cross-encoder** makes the opposite trade. It takes the query and one document **concatenated together** — `[CLS] query [SEP] document [SEP]` — and runs the *whole pair* through a Transformer, so every query token can attend to every document token through full self-attention. The output is a single relevance score. This is **query-aware from the first layer**: 'after 30 days' vs 'within 30 days' now genuinely interact, and the model can tell they are opposites. ==That is why a cross-encoder reorders the top far more accurately than a bi-encoder — it is doing real reading, not a distance in a frozen vector space.==\n\nThe catch is that there is **nothing to precompute**. The document representation depends on the query, so you cannot build an index. You must run a **fresh forward pass for every (query, document) pair at request time**. Scoring a million documents this way is a non-starter.",
      { type: "illustration", label: "Bi-encoder vs cross-encoder — where the query meets the document", content: `BI-ENCODER (retrieval)                CROSS-ENCODER (rerank)
  query ─► [Encoder] ─► q-vector          [ query [SEP] document ]
  doc   ─► [Encoder] ─► d-vector  (offline)          │
                 │                              [ Transformer ]
             dot(q, d)  ◄── cheap                     │
                                               relevance score
  • doc vectors PRECOMPUTED once          • NO precompute — depends on query
  • score = distance in vector space      • full self-attention: q-tokens ⇄ d-tokens
  • millions of docs in ~ms (ANN index)   • one forward pass PER pair, at request time
  • recall HIGH, top precision MEDIOCRE    • top precision HIGH, throughput LOW
  • query & doc never interact             • query & doc interact from layer 1` },
      "This is why the production pattern is **retrieve-k-then-rerank-to-n**, a two-stage funnel. Stage 1 (bi-encoder) is a cheap, high-*recall* net: cast wide and pull **k ≈ 50–100** candidates from millions — you only need the right chunk to land *somewhere* in that set, which recall@50 = 0.94 says it does. Stage 2 (cross-encoder) is an expensive, high-*precision* filter: it reads all k candidates carefully and reorders them, so you can then keep the **top n ≈ 3–5** for the prompt. ==The reranker's job is to fix exactly your bug — pull the rank-18 chunk up to rank 2 — without you having to widen the context window and drown the model in distractors.==\n\nThe two stages are complementary because they optimize different metrics: retrieval maximizes recall@k (don't lose the answer), reranking maximizes precision@n (put the answer on top). Widening top-k to 20 tried to solve a *precision* problem with a *recall* tool, which is why quality got worse.",
      { type: "illustration", label: "The funnel and its latency budget", content: `  millions of chunks
        │  Stage 1: bi-encoder / ANN   (~5–15 ms)   ← high recall
        ▼
     top k = 50 candidates
        │  Stage 2: cross-encoder      (~50–300 ms) ← high precision
        ▼
     top n = 4 chunks ─► prompt ─► LLM

Cross-encoder cost is ~LINEAR in k (one forward pass per candidate):
     k = 50  reranked one-by-one, OR batched on a GPU
     doubling k roughly doubles rerank latency & cost
     → k is a DIAL: bigger k = higher recall into stage 2, but more $ / ms
     → n is bounded by context budget & distractor tolerance, not by the reranker` },
      "The costs are real and you should quote them. A cross-encoder adds **tens to a few hundred milliseconds** and its cost scales roughly **linearly in k** — reranking 100 candidates is ~2× the work of 50. On CPU it can dominate your latency; on a GPU you batch the k pairs but still pay for the accelerator. There are middle grounds: **late-interaction models like ColBERT** precompute per-*token* document embeddings and do a cheaper query-aware `MaxSim` match — more accurate than a bi-encoder, cheaper than a full cross-encoder — and hosted rerank APIs (Cohere Rerank, Voyage, Jina, BGE-reranker) trade a network hop for not self-hosting.\n\n**When is reranking worth it?** When your **recall@k is already high but precision@n is low** — the answer is being retrieved but ranked too low to make the cut (exactly this scenario). It is *not* worth it when recall@k itself is poor: a reranker can only reorder what stage 1 handed it, so if the right chunk isn't in the top-k, reranking cannot invent it — fix retrieval (embeddings, chunking, hybrid/BM25) first. ==Reranking is a precision tool; reaching for it to fix a recall problem is the classic misdiagnosis.==",
    ],
    keyPoints: [
      "**Bi-encoder = precompute, cross-encoder = query-aware.** A bi-encoder embeds query and doc separately (cheap dot-product, indexable, millions in ms) but they never interact until the end; a cross-encoder concatenates them and runs full self-attention, so it reads the pair — accurate but one forward pass per pair, no index.",
      "**Recall ≠ precision, and they need different tools.** Retrieval maximizes recall@k (don't lose the answer in a wide net); reranking maximizes precision@n (put the answer on top of a small set). High recall@50 with the answer stuck at rank 18 is a *precision* failure a reranker fixes.",
      "**The pattern is retrieve-k-then-rerank-to-n.** Bi-encoder pulls k≈50–100 high-recall candidates from millions; cross-encoder reorders them and you keep top n≈3–5. Widening top-k instead adds distractors and hurts generation — the wrong fix.",
      "**Reranker cost is ~linear in k and adds tens–hundreds of ms.** k is a latency/recall dial; n is bounded by context budget and distractor tolerance. Late-interaction (ColBERT) and hosted rerank APIs (Cohere/Voyage/BGE) are middle grounds.",
      "**A reranker can only reorder what retrieval returned.** If recall@k is poor (right chunk not in top-k), reranking cannot recover it — fix embeddings/chunking/hybrid search first. Reranking is worth it precisely when recall is high but top-n precision is low.",
    ],
    recap: [
      "**Bi-encoder** embeds query & doc separately → cheap, indexable, high recall, mediocre top precision. **Cross-encoder** reads the concatenated pair → accurate top ordering, no precompute, one pass per pair.",
      "**Recall ≠ precision:** answer *in* top-50 but at rank 18 is a precision bug, not a recall bug. Widening context is the wrong fix (more distractors).",
      "**retrieve-k-then-rerank-to-n:** wide cheap net (k≈50–100) → careful expensive reorder → keep top n≈3–5 for the prompt.",
      "**Cost:** rerank latency ~linear in k, tens–hundreds of ms; ColBERT / hosted rerankers are middle grounds.",
      "**A reranker only reorders stage-1 output** — it can't surface a chunk retrieval never returned. Use it when recall@k is high but precision@n is low.",
    ],
    mcqs: [
      {
        question: "Your RAG system has recall@50 = 0.94 but the correct chunk frequently sits around rank 18, below the top-5 you pass to the LLM. Which fix directly targets this failure?",
        options: [
          "Increase top-k passed to the LLM from 5 to 20, since the answer is clearly deeper in the list",
          "Add a cross-encoder reranker over the top-50 to reorder them by query-aware relevance, then keep the new top-5",
          "Switch to a larger embedding model to raise recall@50 further",
          "Reduce chunk size so more chunks fit, increasing the odds the answer is near the top",
        ],
        correct: 1,
        explanation: "Option B is correct: this is a precision-at-the-top failure — the answer is already retrieved (recall@50 = 0.94) but ranked too low. A cross-encoder reads each (query, chunk) pair with full self-attention and reorders the top-50 far more accurately than the bi-encoder's frozen-vector distance, pulling the rank-18 chunk up so it survives a top-5 cut. Option A widens the context with a recall tool applied to a precision problem: it adds distractors and typically lowers generation quality, which is the failure the scenario already observed. Option C raises recall, but recall is already 0.94 and is not the bottleneck; the answer is present, just mis-ranked. Option D changes chunking but does not add query-aware scoring at the top of the list, so it does not reliably fix the ranking problem.",
      },
      {
        question: "Why can a bi-encoder score millions of documents in milliseconds while a cross-encoder cannot?",
        options: [
          "The cross-encoder uses a much larger Transformer, so it is inherently slower per document regardless of caching",
          "The bi-encoder precomputes document vectors offline and scores by a cheap dot product, while the cross-encoder's document representation depends on the query, so it must run a fresh forward pass per pair at request time and cannot be indexed",
          "Cross-encoders cannot run on GPUs, so they are limited to CPU throughput",
          "Bi-encoders skip self-attention entirely, which is the only expensive operation",
        ],
        correct: 1,
        explanation: "Option B is correct: the bi-encoder encodes each document independently of the query, so document vectors are computed once offline and stored in an ANN index; scoring is then just a dot product, enabling millions of comparisons in milliseconds. The cross-encoder concatenates query and document and runs the pair through a Transformer, so the representation is query-dependent and cannot be precomputed or indexed — every (query, document) pair needs its own forward pass at request time, which is why it only scales to a small candidate set. Option A points at model size, but the fundamental issue is the inability to precompute, not raw parameter count. Option C is false — cross-encoders run on GPUs; the constraint is per-pair computation, not the hardware. Option D is wrong: bi-encoders do use self-attention inside their encoder; the saving comes from precomputing and reusing document vectors, not from removing attention.",
      },
      {
        question: "Your recall@50 is only 0.55 — the correct chunk is missing from the top-50 in nearly half of queries. A teammate proposes adding a cross-encoder reranker. What is the most accurate assessment?",
        options: [
          "The reranker will fix it, because cross-encoders are strictly more accurate than bi-encoders",
          "A reranker can only reorder the candidates retrieval returned; if the answer isn't in the top-50 it cannot be recovered by reranking — fix retrieval (embeddings, chunking, hybrid/BM25) first",
          "Reranking will raise recall@50 as a side effect of better scoring",
          "Increase n (chunks sent to the LLM) instead, which compensates for low recall",
        ],
        correct: 1,
        explanation: "Option B is correct: a reranker operates only on the candidate set handed to it by stage-1 retrieval. If recall@50 is 0.55, the correct chunk is simply absent from the top-50 about half the time, and no amount of careful reordering can surface a chunk that was never retrieved. The right move is to improve retrieval recall first — better embeddings, revisited chunking, or hybrid dense+BM25 search. Option A overstates the reranker: cross-encoders reorder more accurately but cannot invent missing candidates. Option C is wrong — reranking reorders a fixed set and does not change what was retrieved, so it cannot raise recall@50. Option D increases n over a candidate set that already lacks the answer half the time, so it cannot compensate for the missing-chunk (recall) failure.",
      },
    ],
    takeaway: "Retrieval (bi-encoder) is a cheap high-recall net that pulls k≈50–100 candidates from millions; reranking (cross-encoder) is an expensive high-precision filter that reads each (query, doc) pair with full self-attention and reorders them so you keep the top n≈3–5. Reach for a reranker when recall@k is high but the answer is ranked too low — never to compensate for poor recall, since it can only reorder what retrieval already returned.",
  },

  "rag-eval": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your RAG assistant scores 8.2/10 on a single 'answer quality' LLM-judge metric, and leadership is happy — until a customer catches it citing a policy that doesn't exist in any of your documents. You investigate and find two separate diseases wearing the same symptom: sometimes retrieval returns the wrong chunks (so even a perfect answer would be impossible), and sometimes retrieval is fine but the model ignores the context and invents a plausible answer from its parametric memory. Your one blended score cannot tell these apart. You need an eval design that pins the blame on the right component.",
    explanation: [
      "A RAG system is a **pipeline of two stages** — *retrieve* then *generate* — and the cardinal rule of evaluating it is that you must **measure the two stages separately**, because a single end-to-end score cannot localize failure. ==If retrieval feeds the generator garbage, even a flawless generator produces a wrong answer; if retrieval is perfect but the generator ignores it, you also get a wrong answer. Same symptom, opposite cure.== A blended 8.2/10 hides which disease you have.",
      "The generation side is best understood as a **triad of three distinct relationships** among three objects: the **question**, the **retrieved context**, and the **answer**. Popularized by RAGAS, the triad is:\n\n- **Faithfulness / groundedness** — *answer ↔ context.* Is every claim in the answer actually supported by the retrieved context? This is your **anti-hallucination** metric. A low score is the exact bug in the scenario: the model asserted a policy no chunk contains.\n- **Answer relevance** — *answer ↔ question.* Does the answer actually address what was asked, without padding or drift? A faithful answer can still be useless if it answers a different question.\n- **Context relevance / precision** — *context ↔ question.* Of the retrieved chunks, how much is actually pertinent? Low context relevance means retrieval dumped noise, which both wastes tokens and tempts the model to hallucinate off irrelevant text.\n\n==These three are orthogonal: you can be faithful but irrelevant, relevant but unfaithful, or answering well off a context full of noise. One number collapses all three.==",
      { type: "illustration", label: "The RAG triad — three edges, three failure modes", content: `                    QUESTION
                   /          \\
     context      /            \\    answer
     relevance   /              \\   relevance
    (retrieval) /                \\ (did we answer
               /                  \\  what was asked?)
          CONTEXT ────────────── ANSWER
                   faithfulness
                  (is every claim
                   grounded in context?)

  Low CONTEXT relevance  → retrieval pulled noise / wrong chunks
  Low FAITHFULNESS       → generator hallucinated beyond the context
  Low ANSWER relevance   → generator answered the wrong thing / drifted

  A single "answer quality" score = the blur of all three.` },
      "Now the **retrieval** side, which the triad's context-relevance edge only partially covers. Retrieval quality is a **ranking** problem, and you evaluate it with classic information-retrieval metrics against a labeled set of (query → relevant-chunk) pairs:\n\n- **Recall@k** — of all truly-relevant chunks, what fraction landed in the top-k? This is the *don't-lose-the-answer* metric; if recall@k is low, generation is doomed no matter how good the model.\n- **Precision@k** — of the top-k returned, what fraction is actually relevant? Low precision means noise in the context window.\n- **MRR (Mean Reciprocal Rank)** — 1/(rank of the first relevant chunk), averaged. Rewards putting *a* correct chunk high; good when one right chunk is enough.\n- **nDCG (normalized Discounted Cumulative Gain)** — rewards placing *all* relevant chunks high, discounting by position, and handles **graded** relevance (some chunks more relevant than others). The most complete ranking metric when relevance isn't binary.\n\n==These are computed on retrieval output *before generation ever runs* — they answer 'did we hand the generator the right material?' independently of what it then wrote.==",
      { type: "illustration", label: "Retrieval metrics on one query — worked", content: `Query: "refund window for damaged goods"
Relevant chunks (labeled): {C3, C7}   |   top-5 retrieved: [C9, C3, C2, C7, C5]
                                          rank: 1   2   3   4   5

Recall@5   = |{C3,C7} in top-5| / |{C3,C7}|  = 2/2 = 1.00   (both found)
Precision@5= relevant in top-5 / 5          = 2/5 = 0.40   (3 of 5 are noise)
MRR        = 1 / rank(first relevant = C3)  = 1/2 = 0.50
nDCG@5     : C3 at rank2, C7 at rank4 → discounted gains summed / ideal
           (ideal = both relevant at ranks 1,2) → ~0.77

Reading: nothing lost (recall 1.0) but ranked loosely (MRR/nDCG middling,
precision 0.40). A reranker would help; more retrieval breadth would not.` },
      "**Why separate the two evals at all — why not trust one end-to-end judge?** Because **localization**. When end-to-end quality drops, a single number tells you *that* it dropped, never *where*. Split the pipeline and the diagnosis is mechanical:\n\n- Retrieval metrics **bad**, generation faithful on the (bad) context it got → **fix retrieval** (embeddings, chunking, hybrid search, reranking).\n- Retrieval metrics **good** (right chunks in context) but **faithfulness low** → **fix generation** (the model is ignoring context and hallucinating — prompt it to ground, lower temperature, or change models).\n- Context relevance good but **answer relevance low** → the model has the material but isn't answering the question — a prompting/instruction problem.\n\n==This is exactly the scenario's two diseases, now separable: 'wrong chunks retrieved' shows up as low recall@k / context relevance; 'ignored good context' shows up as low faithfulness with high context relevance.==",
      "Practical build notes. **RAGAS** operationalizes the triad using an LLM to judge faithfulness, answer relevance, and context precision/recall, often *without* human-written reference answers — cheap to run in CI, but inherits LLM-judge biases (a separate topic). Retrieval metrics need a **labeled gold set** of query→relevant-chunk mappings, which is the expensive-but-worth-it asset; you can bootstrap it by having an LLM generate questions from known chunks (the source chunk is the ground-truth relevant one). Run retrieval and generation evals as **separate gates in CI**: a retrieval regression and a generation regression demand different fixes, and a blended score would let one mask the other. ==The whole discipline reduces to one habit: never report a single RAG number; report a retrieval score and a generation triad, so every regression has an address.==",
    ],
    keyPoints: [
      "**RAG is retrieve-then-generate, so you must eval both stages separately.** A single end-to-end score tells you *that* quality dropped but never *where* — retrieval feeding garbage and a generator ignoring good context produce the identical symptom with opposite cures.",
      "**The generation triad (RAGAS): faithfulness, answer relevance, context relevance.** Faithfulness (answer↔context) is anti-hallucination; answer relevance (answer↔question) is did-you-answer-it; context relevance (context↔question) is did-retrieval-give-pertinent-material. They're orthogonal — one number blurs all three.",
      "**Retrieval is a ranking problem, evaluated with IR metrics.** Recall@k (don't lose the answer), precision@k (noise in context), MRR (first relevant chunk high), nDCG (all relevant chunks high, graded relevance, position-discounted) — computed on retrieval output before generation runs.",
      "**Separation enables localization.** Bad retrieval metrics → fix embeddings/chunking/reranking. Good retrieval but low faithfulness → the model is hallucinating past its context, fix generation. Good context but low answer relevance → prompting problem.",
      "**RAGAS runs the triad with an LLM judge (often reference-free); retrieval metrics need a labeled gold set.** Bootstrap gold labels by generating questions from known chunks. Run retrieval and generation as separate CI gates so neither regression masks the other.",
    ],
    recap: [
      "**Eval retrieval and generation separately** — one blended RAG score can't localize failure; the two stages fail identically but need opposite fixes.",
      "**Generation triad:** faithfulness (answer grounded in context = anti-hallucination), answer relevance (answers the question), context relevance (retrieval gave pertinent chunks). Orthogonal.",
      "**Retrieval metrics:** recall@k (found it), precision@k (noise), MRR (first hit ranked high), nDCG (all hits ranked high, graded + position-discounted).",
      "**Localization rule:** low retrieval metrics → fix retrieval; good context + low faithfulness → fix the generator (it's hallucinating past its context).",
      "**RAGAS** = LLM-judged triad, often reference-free; retrieval metrics need a labeled query→chunk gold set. Keep them as separate CI gates.",
    ],
    mcqs: [
      {
        question: "Your RAG assistant returns an answer citing a policy that appears in none of the retrieved chunks. Your gold-set check confirms the correct chunks WERE retrieved and are relevant. Which metric is failing, and what does it point to?",
        options: [
          "Recall@k is failing — retrieval lost the relevant chunk, so fix embeddings/chunking",
          "Faithfulness (groundedness) is failing — the answer makes claims not supported by the retrieved context, pointing to a generation fix (grounding prompt, lower temperature, or model change)",
          "Answer relevance is failing — the answer didn't address the question",
          "Context relevance is failing — retrieval returned irrelevant noise",
        ],
        correct: 1,
        explanation: "Option B is correct: the retrieved chunks are confirmed relevant and present, so retrieval did its job. The failure is that the answer asserts a claim (a policy) not supported by that context — the definition of low faithfulness/groundedness. This localizes the bug to generation: the model is drawing on parametric memory instead of grounding in the provided context, which you address by prompting for grounding, lowering temperature, or switching models. Option A is wrong because the scenario explicitly confirms the relevant chunks were retrieved, so recall@k is fine. Option C is wrong because answer relevance concerns whether the answer addresses the question, not whether its claims are supported — the answer here is on-topic but fabricated. Option D is wrong because context relevance is confirmed good (the right chunks were retrieved), so the noise-in-context failure does not apply.",
      },
      {
        question: "Why is a single end-to-end 'answer quality' score insufficient for evaluating a RAG system?",
        options: [
          "End-to-end scores are always inaccurate because LLM judges are unreliable",
          "It cannot localize failure: retrieval returning wrong chunks and the generator ignoring correct chunks produce the same low score but require opposite fixes, so you must measure retrieval and generation separately",
          "A single score is fine as long as it's above 8/10; the scenario is an edge case",
          "End-to-end scores double-count faithfulness and answer relevance, inflating the number",
        ],
        correct: 1,
        explanation: "Option B is correct: RAG is a two-stage pipeline, and a blended score tells you that quality dropped but never where. A retrieval failure (wrong chunks) and a generation failure (ignoring good chunks) both surface as a poor answer, yet the cure differs entirely — fix retrieval versus fix generation. Measuring the stages separately gives each regression an address. Option A overgeneralizes about judge reliability, which is a separate concern and not the core reason localization matters. Option C is wrong — a high blended score actively hides component failures (the scenario scored 8.2 while hallucinating), so a threshold does not solve the localization problem. Option D describes a made-up double-counting mechanism; the real issue is loss of diagnostic resolution, not arithmetic inflation.",
      },
      {
        question: "You're choosing a retrieval metric. Relevance is GRADED (some chunks are more relevant than others), and you care that ALL relevant chunks are ranked high, with earlier positions weighted more. Which metric fits best?",
        options: [
          "Recall@k, because it counts how many relevant chunks appear in the top-k",
          "MRR, because it rewards putting the first relevant chunk high",
          "nDCG, because it handles graded relevance, rewards ranking all relevant chunks high, and discounts by position",
          "Precision@k, because it measures noise in the top-k",
        ],
        correct: 2,
        explanation: "Option C is correct: nDCG (normalized Discounted Cumulative Gain) is designed for exactly these requirements — it supports graded (non-binary) relevance labels, rewards placing all relevant chunks high in the ranking, and applies a position discount so earlier ranks count more. Option A (recall@k) only counts how many relevant chunks fall in the top-k; it ignores their order and treats relevance as binary. Option B (MRR) rewards only the first relevant chunk's position and ignores the rest, so it does not capture 'all relevant chunks ranked high.' Option D (precision@k) measures the fraction of the top-k that is relevant but does not incorporate graded relevance or position-discounted ranking of all relevant items.",
      },
    ],
    takeaway: "Evaluate RAG as two separable stages: retrieval with ranking metrics (recall@k, precision@k, MRR, nDCG) and generation with the RAGAS triad (faithfulness, answer relevance, context relevance). Keeping them separate is what lets you localize a regression — bad retrieval metrics mean fix retrieval, while good context with low faithfulness means the generator is hallucinating past its context. Never report one blended number.",
  },

  "llm-as-judge": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "You've replaced slow, expensive human grading with an LLM judge that scores your chatbot's answers 1–10. It runs in CI on every deploy and everyone loves the speed. Then two things happen: a model update that shipped *longer, more verbose* answers mysteriously 'improved' the judge score by 0.6 with no real quality gain, and when you A/B two candidate answers by asking the judge which is better, you get *different winners depending on which answer you list first*. Your judge is measuring something, but it isn't quite quality. You need to understand its biases and how to make it trustworthy.",
    explanation: [
      "An **LLM-as-judge** uses a strong model to *evaluate* other models' outputs — scoring an answer, or picking the better of two — as a fast, cheap, scalable stand-in for human raters. It is genuinely useful: it can run on every commit, cover thousands of cases, and correlate reasonably with human judgment *when built carefully*. But it is a **model with the same failure modes as any LLM**, so an uncalibrated judge measures a mix of quality and its own biases. ==Treating the judge's number as ground truth is the core mistake; the judge is an instrument that must itself be validated.==",
      "**The rubric is the whole game.** A judge prompt that says 'rate this answer 1–10' invites the model to invent its own inconsistent standard. **G-Eval**-style design fixes this: you give the judge (1) an explicit **rubric** — the specific criteria that define quality for *this* task (e.g., factual accuracy, completeness, tone, safety), (2) a **scoring scale with anchored descriptions** of what each level means, and (3) often **chain-of-thought** — have the judge reason through the criteria *before* emitting a score, which improves consistency and gives you an auditable rationale. A vague rubric produces a vague, drifting metric; a sharp, anchored rubric is what makes the judge repeatable. ==Most 'the judge is noisy' complaints are actually 'the rubric is underspecified' complaints.==",
      { type: "illustration", label: "Vague prompt vs G-Eval rubric", content: `VAGUE (drifts, rewards length/fluency):
  "Rate this answer from 1 to 10."

G-EVAL STYLE (anchored, auditable):
  Task: grade a support answer against the retrieved policy.
  Criteria, score each 1–5:
    • Factual accuracy — every claim supported by the policy?
    • Completeness — addresses the full question?
    • Faithfulness — no claims beyond the provided context?
  Steps: (1) list each claim  (2) check it against the policy
         (3) reason per-criterion  (4) THEN output scores + overall.
  Anchors: 5 = fully supported & complete; 3 = minor gap;
           1 = fabricated or off-topic.

  → CoT-before-score = more consistent + a rationale you can audit.` },
      "Now the **biases** — the reason the scenario's number moved without quality moving. Judges have systematic, documented tendencies:\n\n- **Position bias** — in pairwise comparison, the judge favors the answer in a particular slot (often the first) regardless of content. This is exactly the 'winner flips when I swap the order' symptom.\n- **Verbosity / length bias** — judges reward longer, more elaborate answers even when the extra text adds no correctness. This is the model-update mystery: longer answers scored 0.6 higher for free.\n- **Self-preference (self-enhancement) bias** — a judge tends to rate outputs from *its own model family* higher, so using GPT-4 to judge GPT-4 outputs against a competitor is not neutral.\n- Others: **sensitivity to superficial style/formatting**, **anchoring** to numbers in the prompt, and **leniency drift** over a long eval set.\n\n==These biases are not random noise you can average away — they are *systematic*, so they bias comparisons in a consistent direction and silently reward the wrong behavior (be longer, go first, sound like me).==",
      { type: "illustration", label: "Mitigations mapped to biases", content: `BIAS                 SYMPTOM                     MITIGATION
position bias        winner flips on reorder     swap order, judge BOTH ways,
                                                 keep only order-agnostic wins
verbosity bias       longer answer scores higher rubric penalizes padding;
                                                 control for length; per-claim scoring
self-preference      judge favors own family     use a DIFFERENT model family as judge;
                                                 or an ensemble of judges
style/format bias    fluent-but-wrong wins       rubric weights accuracy over polish;
                                                 CoT forces claim-checking
overall              "score ≠ quality"           CALIBRATE against human labels` },
      "**Pointwise vs pairwise** is a real design fork with different bias profiles:\n\n- **Pointwise (absolute)** — score each answer independently on the scale. Easy to aggregate and track over time, but **hard to calibrate**: what does 7/10 *mean*, and is it stable across runs and models? Prone to leniency drift.\n- **Pairwise (relative)** — show the judge two answers and ask which is better. Humans and models are **more reliable at relative judgments** than absolute ones, so pairwise is often more trustworthy — *but* it is where **position bias** bites hardest. The fix is to run each pair **both orderings** (A-then-B and B-then-A) and only count a win if it holds regardless of order; ties/flips signal an unreliable comparison. ==Pairwise trades the calibration problem of pointwise for a position-bias problem you can control by swapping order.==",
      "The non-negotiable step is **calibration against human labels**. Before you trust a judge, take a **sample the humans have graded**, run the judge on it, and measure agreement — not just raw accuracy but rank correlation (Spearman/Kendall) and, for pairwise, how often the judge agrees with human preference. A judge is **only as good as its correlation with the humans it replaces**; if agreement is weak, tighten the rubric, change the judge model, or fall back to humans for that slice. ==A judge is unreliable when: the rubric is subjective or the task needs domain expertise the judge lacks; when it's judging its own family (self-preference); on adversarial/safety-critical calls where being fooled is catastrophic; or whenever it hasn't been calibrated against humans at all.== Report the judge's human-agreement number alongside its scores, and re-validate when you change the judge model — otherwise you're trusting an uncalibrated instrument and, as the scenario shows, optimizing your product to be longer and to go first.",
    ],
    keyPoints: [
      "**An LLM judge is an instrument, not ground truth.** It's a fast, scalable stand-in for human raters but has the same failure modes as any LLM — an uncalibrated judge measures a blend of quality and its own biases.",
      "**The rubric is the whole game (G-Eval).** Give explicit criteria, an anchored scale, and chain-of-thought reasoning *before* the score. Most 'noisy judge' complaints are actually underspecified-rubric complaints; a vague 'rate 1–10' drifts.",
      "**Judge biases are systematic, not averageable noise: position, verbosity, self-preference.** Position bias flips pairwise winners on reorder; verbosity rewards length without correctness; self-preference favors the judge's own model family. They reward the wrong behavior in a consistent direction.",
      "**Pairwise vs pointwise is a real fork.** Pointwise (absolute scores) is easy to track but hard to calibrate and drifts; pairwise (which-is-better) is more reliable relatively but suffers position bias — mitigate by judging both orderings and counting only order-agnostic wins.",
      "**Calibrate against human labels or don't trust it.** Measure agreement/rank-correlation on a human-graded sample; a judge is only as good as its correlation with the humans it replaces. Unreliable when: subjective/expert tasks, judging its own family, adversarial/safety-critical calls, or never calibrated.",
    ],
    recap: [
      "**Judge = fast scalable stand-in for humans, but it's still an LLM** — uncalibrated, it measures quality *plus* its own biases.",
      "**G-Eval rubric = explicit criteria + anchored scale + CoT-before-score.** Vague 'rate 1–10' drifts; most 'noisy judge' issues are rubric issues.",
      "**Biases (systematic):** position (favors a slot → flips on reorder), verbosity (longer wins free), self-preference (favors own family).",
      "**Pointwise** = absolute, easy to track, hard to calibrate. **Pairwise** = relative, more reliable, but position-biased → judge both orderings, keep order-agnostic wins.",
      "**Calibrate against human labels** (agreement / rank correlation) before trusting; re-validate on judge-model change. Distrust on subjective, expert, self-family, or safety-critical calls.",
    ],
    mcqs: [
      {
        question: "After a model update that made answers longer and more verbose, your LLM-judge score rose 0.6 with no measurable gain in correctness. What is the most likely explanation?",
        options: [
          "The longer answers are genuinely higher quality; the judge correctly detected it",
          "Verbosity (length) bias — LLM judges systematically reward longer, more elaborate answers even when the extra text adds no correctness",
          "The judge model was silently upgraded to a stricter version",
          "Position bias caused the score inflation",
        ],
        correct: 1,
        explanation: "Option B is correct: verbosity/length bias is a well-documented, systematic tendency of LLM judges to score longer and more elaborate answers higher regardless of whether the added text improves correctness. That exactly matches the symptom — length went up, the score went up, correctness did not. Option A contradicts the premise: correctness was explicitly unchanged, so the score rise reflects the judge rewarding length, not real quality. Option C invents a silent stricter upgrade, which would if anything lower scores and does not explain a length-correlated increase. Option D is wrong because position bias concerns the slot an answer occupies in a pairwise comparison, not answer length in a pointwise score; the scenario's trigger was verbosity, not ordering.",
      },
      {
        question: "In pairwise LLM-judge comparisons, you notice the winner sometimes flips depending on which answer is listed first. What is the standard mitigation?",
        options: [
          "Always list the newer model's answer first so it gets the position advantage",
          "Switch to pointwise absolute scoring, which has no position bias",
          "Run each pair in both orderings (A-then-B and B-then-A) and count a win only if it holds regardless of order; treat flips as unreliable",
          "Increase the judge's temperature so the ordering matters less",
        ],
        correct: 2,
        explanation: "Option C is correct: the flip is position bias — the judge favors a particular slot regardless of content. The standard fix is to evaluate each pair in both orderings and only credit an order-agnostic win; if the winner flips when you swap positions, that comparison is unreliable and should be treated as a tie or discarded. Option A deliberately exploits the bias to favor one model, which corrupts the evaluation rather than fixing it. Option B trades one problem for another — pointwise scoring avoids position bias but introduces calibration/leniency-drift problems and is generally less reliable than well-controlled pairwise. Option D raises randomness, which adds noise and does not remove the systematic positional preference.",
      },
      {
        question: "Before rolling out an LLM judge in CI, which step is essential to know whether its scores are trustworthy?",
        options: [
          "Confirm the judge is a larger model than the one being evaluated",
          "Calibrate against a human-labeled sample — measure the judge's agreement / rank-correlation with human ratings, since a judge is only as good as its correlation with the humans it replaces",
          "Verify the judge outputs scores to two decimal places for precision",
          "Ensure the judge uses the same model family as the system under test for consistency",
        ],
        correct: 1,
        explanation: "Option B is correct: an LLM judge is an instrument whose validity is unknown until you check it against the ground truth it replaces. Calibration means running the judge on a human-graded sample and measuring agreement and rank correlation (e.g., Spearman/Kendall, or preference-agreement for pairwise); weak agreement means the rubric or judge model needs fixing before you trust the scores. Option A is wrong — a larger judge is not inherently well-calibrated for your task and may still exhibit biases. Option C confuses decimal precision with accuracy; more decimals on a biased instrument add false confidence, not trust. Option D is actively harmful: matching the judge to the system's own model family invites self-preference bias, the opposite of what you want for a neutral evaluation.",
      },
    ],
    takeaway: "An LLM judge is a fast, scalable stand-in for human raters but is itself an LLM with systematic biases — position (pairwise winners flip on reorder), verbosity (length rewarded for free), and self-preference (favors its own family). Anchor it with a G-Eval-style rubric and chain-of-thought, prefer order-controlled pairwise for relative judgments, and never trust the scores until you've calibrated them against human labels.",
  },

  "chunking": {
    depthTier: "core",
    interviewWeight: "medium",
    scenario: "Your RAG bot answers well on FAQ-style questions but fails on anything that spans a boundary — a table split across two chunks, a definition whose 'it' refers to a sentence now in a different chunk, a procedure whose step 4 landed in one chunk and step 5 in the next. You're chunking at a fixed 512 characters with no overlap because that was the default. Retrieval recall looks fine on paper, yet the retrieved chunks are subtly *incomplete*. You need to decide how to chunk — and understand why the naive default is quietly costing you answers.",
    explanation: [
      "**Chunking is the step that decides what a 'retrievable unit' is** — you split source documents into pieces, embed each piece, and retrieve pieces. It sits *upstream* of everything else in RAG, which makes it deceptively high-leverage: a chunk is simultaneously (1) the thing that gets embedded (so it must be semantically coherent enough for one vector to represent it), and (2) the thing that gets handed to the LLM (so it must carry enough context to be *usable* on its own). ==Those two jobs pull in different directions, and every chunking decision is a negotiation between them.==",
      "The strategies form a ladder from *ignorant-of-content* to *content-aware*:\n\n- **Fixed-size** — split every N characters/tokens. Trivial, fast, and **content-blind**: it will happily cut mid-sentence, mid-table, mid-word. This is the scenario's default and the source of its bugs.\n- **Sentence / recursive** — split on natural boundaries (paragraphs → sentences → words), recursively, so you never cut mid-sentence. LangChain's `RecursiveCharacterTextSplitter` is the common workhorse: respects structure while targeting a size.\n- **Semantic** — embed sentences and place a boundary where the *topic shifts* (a large embedding-distance jump between consecutive sentences). Chunks become topically coherent regardless of length. More compute up front, better single-vector representations.\n- **Structural / document-aware** — split on the document's own structure: Markdown headers, HTML sections, code functions, table rows kept whole. Respects the author's intended units — the most robust for structured docs (the split table would stay intact).\n\n==The trend up the ladder is: spend more effort at index time to make each chunk a more honest, self-contained semantic unit.==",
      { type: "illustration", label: "The lost-boundary failure — fixed-size cuts through meaning", content: `SOURCE:
  "...To request a refund, first open a ticket (step 4). Then attach
   the receipt and select 'Damaged' as the reason (step 5)..."

FIXED-SIZE 512, no overlap — boundary lands mid-procedure:
  ┌ chunk A ─────────────────────────────┐ ┌ chunk B ──────────────┐
  │ ...first open a ticket (step 4).      │ │ Then attach the       │
  │                                       │ │ receipt ... (step 5)  │
  └───────────────────────────────────────┘ └───────────────────────┘
  Query "how do I refund damaged goods?" retrieves chunk A →
  answer is missing step 5.  Recall@k looked FINE (A is "relevant"),
  but the retrieved unit is INCOMPLETE. ← the lost-boundary failure

WITH OVERLAP (e.g. 64-char stride back):
  chunk B now starts "...open a ticket (step 4). Then attach receipt
  (step 5)..."  → the boundary-spanning context is preserved in B.` },
      "**Chunk size and overlap is the central tradeoff**, and it is a genuine tension, not a knob to max out:\n\n- **Small chunks** → each is topically precise, so retrieval is sharp (the embedding represents one idea, high precision) — *but* each carries little surrounding context, so an answer that needs neighboring sentences gets a truncated, incomplete unit (the scenario's 'it' with no antecedent).\n- **Large chunks** → carry lots of context, so a retrieved chunk is more likely self-sufficient — *but* the single embedding now averages several ideas together (diluted, less precise retrieval), and you burn context-window tokens on irrelevant surrounding text, which also invites the generator to hallucinate off the noise.\n- **Overlap** (chunks share a sliding window of tokens with their neighbors) is the standard mitigation for boundary loss: a fact that straddles a boundary appears *whole* in at least one chunk. The cost is redundancy — overlapping tokens are stored and retrieved multiple times, inflating index size and occasionally returning near-duplicate chunks. ==Overlap doesn't eliminate the boundary problem; it makes it survivable by ensuring straddling context lives intact somewhere.==",
      "**Chunking interacts with two other components you can't ignore.** First, the **embedding model's context window**: if a chunk exceeds the embedder's max input (many embedding models cap at 512 tokens; some newer ones go to 8k), the tail is **silently truncated before embedding**, so part of your chunk isn't represented in its vector at all — you retrieve on text the model never saw. Chunk size must fit *inside* the embedder's window, not just the LLM's. Second, **retrieval granularity**: the chunk is the atom of retrieval, so if the answer's supporting evidence is spread across three chunks, you need all three in the top-k — smaller chunks fragment evidence and demand higher k; larger chunks bundle it but dilute precision. ==Chunking is not an isolated preprocessing choice — it co-determines what your embedder can represent and what your retriever can assemble.==",
      { type: "illustration", label: "Size/overlap decision grid", content: `                 SMALL chunks              LARGE chunks
  retrieval      sharp, high precision      diluted (averaged ideas)
                 (one idea / vector)
  self-suff.     often incomplete           usually self-contained
  context cost   cheap tokens               burns window on noise
  evidence       fragmented → need high k   bundled → lower k
  embedder fit   safely inside window       risk of silent truncation
  ────────────────────────────────────────────────────────────────
  OVERLAP: shared sliding window → boundary-spanning facts appear
           WHOLE in ≥1 chunk. Cost: storage + near-duplicate hits.
  PRACTICAL START: recursive/structural split, ~256–512 tokens,
           ~10–20% overlap; measure recall & answer completeness,
           then tune. There is no universal best — it's data-dependent.` },
      "**The 'lost boundary' failure is the through-line of this whole module.** Naive fixed-size chunking cuts through the middle of meaning — a table, a definition and its antecedent, a numbered procedure — so the retrieved chunk is judged 'relevant' by your recall metric yet is *incomplete*, and the answer silently drops a step. This is why recall@k can look fine while answers are wrong: the metric rewards retrieving *a* relevant chunk, not a *complete* one. The fixes stack: move up the ladder toward **structural/semantic** splitting so boundaries fall where meaning does, **add overlap** so straddling facts survive, and **keep chunks inside the embedder's window** so nothing is silently truncated. ==Chunking has no universal optimum — it depends on your documents (prose vs tables vs code) and query patterns — so the discipline is to treat it as a tunable that you evaluate on *answer completeness*, not just retrieval recall.==",
    ],
    keyPoints: [
      "**A chunk does two conflicting jobs:** it's what gets embedded (must be a coherent single-vector unit) and what's handed to the LLM (must be self-contained enough to use). Every chunking choice negotiates between these.",
      "**Strategies climb from content-blind to content-aware:** fixed-size (splits mid-sentence/table — the naive default), sentence/recursive (respects natural boundaries), semantic (splits where topic shifts via embedding distance), structural (splits on headers/functions/table rows). Higher = more index-time effort for more honest chunks.",
      "**Size/overlap is a real tradeoff, not a knob to max.** Small chunks = sharp retrieval but incomplete context; large chunks = self-sufficient but diluted embeddings and wasted tokens. Overlap makes boundary-spanning facts survive whole at the cost of redundancy.",
      "**Chunking interacts with the embedder's context window and retrieval granularity.** A chunk past the embedder's token cap is silently truncated before embedding (you retrieve on unseen text); evidence spread across chunks needs all of them in top-k, so small chunks fragment evidence and demand higher k.",
      "**The lost-boundary failure is why recall can look fine while answers are wrong.** Fixed-size cuts through meaning, so a 'relevant' chunk is incomplete (missing step, dangling antecedent). Fix by moving toward structural/semantic splits + overlap, and tune on *answer completeness*, not just recall — there's no universal best.",
    ],
    recap: [
      "**A chunk is both the embedded unit and the LLM-fed unit** — coherent enough for one vector, complete enough to use. These pull apart.",
      "**Ladder:** fixed-size (blind, cuts meaning) → sentence/recursive → semantic (topic-shift boundaries) → structural (headers/functions/tables). Up = more effort, more honest chunks.",
      "**Size/overlap tradeoff:** small = precise but incomplete; large = self-contained but diluted + token-wasteful. Overlap = boundary facts survive whole, cost = redundancy.",
      "**Interactions:** exceed the embedder's window → silent truncation (retrieve on unseen text); spread evidence → need higher k.",
      "**Lost-boundary failure:** fixed-size cuts a table/procedure/antecedent → chunk is 'relevant' but incomplete, so recall@k lies. Fix with structural/semantic + overlap; tune on answer completeness. No universal optimum.",
    ],
    mcqs: [
      {
        question: "Your RAG bot retrieves a 'relevant' chunk (recall@k looks fine) but the answer is missing a step of a procedure. You're using fixed-size 512-character chunks with no overlap. What is happening and what's the fix?",
        options: [
          "Retrieval recall is genuinely too low; increase k to retrieve more chunks",
          "The lost-boundary failure — fixed-size chunking cut the procedure mid-step, so the retrieved chunk is relevant but incomplete; move to structural/recursive splitting and add overlap so straddling steps survive whole",
          "The embedding model is too small; switch to a larger one",
          "The LLM's temperature is too high, causing it to drop steps",
        ],
        correct: 1,
        explanation: "Option B is correct: this is the classic lost-boundary failure. Content-blind fixed-size chunking cuts through the middle of the procedure, so one chunk holds step 4 and the next holds step 5. Recall@k rewards retrieving a relevant chunk but not a complete one, which is why the metric looks fine while the answer drops a step. The fix is to split on natural/structural boundaries so cuts fall where meaning does, and add overlap so a fact spanning a boundary appears whole in at least one chunk. Option A misreads the metric — recall is fine; the retrieved unit is incomplete, not missing. Option C blames the embedder, but the problem is where the text was cut, not how it was vectorized. Option D blames generation randomness, but the missing step was never in the retrieved chunk, so temperature is not the cause.",
      },
      {
        question: "You increase chunk size from 256 to 2048 tokens to make each chunk more self-contained. What's the most likely downside?",
        options: [
          "Boundary-spanning facts will now be split more often",
          "The single embedding now averages several distinct ideas, diluting retrieval precision, and each chunk burns more context-window tokens on potentially irrelevant text — and the chunk may exceed the embedder's input window and be silently truncated",
          "Recall@k will necessarily drop to zero",
          "Overlap becomes impossible with large chunks",
        ],
        correct: 1,
        explanation: "Option B is correct: larger chunks carry more context (more self-sufficient) but a single vector must now represent several ideas, which dilutes retrieval precision; they also consume more of the context window on surrounding text that may be irrelevant, and if the chunk exceeds the embedding model's max input (many cap at 512 tokens), the tail is silently truncated before embedding — you then retrieve on text the vector never saw. Option A is backwards: larger chunks split boundary-spanning facts less often, not more. Option C is false — larger chunks do not force recall to zero; recall often holds or rises while precision falls. Option D is wrong — overlap is still possible with large chunks; it just adds proportionally more redundant tokens.",
      },
    ],
    takeaway: "Chunking decides the retrievable unit, and a chunk must serve two conflicting masters — a coherent single embedding and a self-contained unit for the LLM. Fixed-size splitting is content-blind and causes the lost-boundary failure (a 'relevant' chunk that's incomplete, so recall lies); move up toward semantic/structural splitting, add overlap so straddling facts survive whole, keep chunks inside the embedder's window, and tune on answer completeness rather than retrieval recall alone.",
  },

  "observability-concepts": {
    depthTier: "core",
    interviewWeight: "medium",
    scenario: "Your LLM feature was fine for weeks, then support tickets spike: answers 'feel slower and dumber.' You have no idea where it broke. Was it a prompt someone edited? A model-provider silent update? A slow retrieval step buried in a multi-tool agent chain? A cost blowout from runaway token usage? You're staring at aggregate request logs that show a status 200 and nothing else. You need the observability layer that turns 'it feels worse' into 'span 3 of this trace — the retrieval call — went from 40 ms to 900 ms after the 2pm deploy.'",
    explanation: [
      "**LLM observability is the discipline of making a non-deterministic, multi-step system debuggable in production.** A single user request often fans out into a **chain** — retrieve, rerank, call the model, maybe call a tool, maybe call the model again — and any link can degrade. Classic request logging (status code, latency, a blob of text) tells you *that* something is wrong but never *where* in the chain or *why*. ==The whole point of LLM observability is to attach enough structured detail to each step that 'it feels worse' becomes a specific, addressable line item.==",
      "The core data model is **traces and spans**, borrowed from distributed tracing (OpenTelemetry) and adapted for LLM chains:\n\n- A **trace** is the end-to-end record of one request — the whole journey from user input to final answer.\n- A **span** is one operation *within* that trace — a single retrieval call, one LLM invocation, one tool call — with its own start/end time, inputs, outputs, and metadata. Spans **nest** to mirror the call structure.\n\nSo a trace is a tree of spans. When answers 'feel slower,' you don't stare at an aggregate — you open a slow trace and read the span durations: the model span is 200 ms as always, but the *retrieval* span jumped from 40 ms to 900 ms. ==Traces/spans convert an opaque pipeline into a timeline you can point at.==",
      { type: "illustration", label: "A trace is a tree of spans", content: `TRACE  (one user request, total 1180 ms)  ─ input → final answer
  ├─ span: retrieval          40 ms → 900 ms  ⚠ regressed after 2pm deploy
  ├─ span: rerank             60 ms
  ├─ span: LLM call #1        200 ms | in 1,850 tok · out 120 tok · $0.004
  │    └─ span: tool call     — (weather API)
  └─ span: LLM call #2        180 ms | in 2,100 tok · out 90 tok · $0.005

  Aggregate log said: 200 OK, 1180 ms.  ← useless for localization
  The trace says: the RETRIEVAL span is the regression.  ← addressable` },
      "**The metrics that matter are specific to LLM systems**, beyond generic latency:\n\n- **Tokens** — input and output token counts per call. The unit of both cost and (partly) latency; a prompt that silently grew from 800 to 3,000 tokens explains both a bill spike and a slowdown.\n- **Cost** — derived from tokens × per-token price, tracked per request / per feature / per user, so a runaway agent loop or a bloated prompt is visible as dollars, not just tokens.\n- **Latency, split into two LLM-specific numbers:** **TTFT (Time To First Token)** — how long until the *first* token streams back, which dominates *perceived* responsiveness; and **TPOT (Time Per Output Token)** — the steady-state generation speed after the first token. Total latency ≈ TTFT + TPOT × output_tokens. ==Two systems with the same total latency feel very different if one has a fast TTFT and streams — TTFT is the metric users actually feel.==",
      { type: "illustration", label: "TTFT vs TPOT — why total latency hides the felt experience", content: `Latency ≈ TTFT + (TPOT × output_tokens)

  System A:  TTFT 200 ms,  TPOT 20 ms/tok,  200 tok out
             → 200 + 20×200 = 4200 ms total, but user sees words at 200 ms
  System B:  TTFT 3000 ms, TPOT 6 ms/tok,   200 tok out
             → 3000 + 6×200 = 4200 ms total, user stares at a spinner 3 s

  SAME 4.2 s total. Wildly different FELT latency.
  → alert on TTFT (perceived) AND TPOT (throughput), not just total.` },
      "**Prompt and version tracking** is what makes regressions attributable. Every trace should record **which prompt template/version, which model, and which key parameters (temperature, top-p)** produced it. LLM systems break in ways code-only systems don't: someone edits a prompt, or the *provider silently updates the model behind the same name*, and behavior drifts with no code change. Without version tags on your traces you cannot answer 'did this get worse after the 2pm prompt edit?' — the single most common LLM incident. ==Versioning prompts and models turns 'something changed' into 'this specific change, at this time.'==",
      "**Drift and regression detection** is the ongoing job on top of the data:\n\n- **Regression** — a discrete change (a deploy, a prompt edit, a model swap) made quality/latency/cost worse *now*. Caught by comparing metrics and eval scores before vs after the change — which is why version tags and offline evals in CI matter.\n- **Drift** — a *gradual* shift over time: input distribution changes (users ask new kinds of questions), or output quality slowly degrades. Caught by trending metrics and periodic eval runs, and by monitoring the *inputs*, not just outputs.\n\n**What to log and alert on:** log every trace with per-span timing, token/cost, prompt+model+params, and the full input/output; **sample** heavily for cost but always capture errors and slow traces. Alert on: **TTFT/latency percentiles** (p95, p99 — not the mean, which hides the tail), **error/timeout rate**, **cost per request** (runaway spend), **token-per-request** creep (prompt bloat), and **eval-score regressions** on a canary set. ==The mature setup pairs live traces with a small automated eval suite so a quality regression pages you before the support tickets do.==",
    ],
    keyPoints: [
      "**LLM observability makes a non-deterministic, multi-step chain debuggable.** A request fans out (retrieve → rerank → call → tool → call), and classic status-200 logging tells you *that* it broke but never *where* or *why* in the chain.",
      "**Traces and spans are the core data model (from OpenTelemetry).** A trace = one full request; a span = one nested operation (a retrieval call, an LLM call) with its own timing, I/O, and metadata. A trace is a tree of spans — you open a slow trace and read span durations to localize the regression.",
      "**LLM-specific metrics: tokens, cost, and split latency.** Tokens (in/out) drive cost and partly latency; cost = tokens × price per request/feature/user; latency splits into TTFT (time to first token = perceived responsiveness) and TPOT (per-output-token throughput). Same total latency can feel completely different.",
      "**Prompt/model/param version tracking makes regressions attributable.** LLM systems break via prompt edits and silent provider model updates with no code change — tag every trace with prompt version, model, and params, or you can't answer 'did the 2pm edit make it worse?'",
      "**Drift (gradual) vs regression (discrete), and what to alert on.** Regression = a change made it worse now (compare before/after + CI evals); drift = slow input/output shift (trend metrics, monitor inputs). Alert on p95/p99 latency & TTFT, error/timeout rate, cost-per-request, token creep, and eval-score regressions on a canary set — not the mean.",
    ],
    recap: [
      "**Observability turns 'it feels worse' into 'span 3, the retrieval call, regressed at 2pm.'** Status-200 logs can't localize a multi-step chain.",
      "**Trace** = one full request; **span** = one nested op (retrieve, LLM call, tool) with its own timing/I-O. Trace = tree of spans → read span durations to localize.",
      "**Metrics:** tokens (in/out) → cost & latency; **TTFT** = perceived speed (first token), **TPOT** = throughput. Same total latency, different felt experience.",
      "**Version everything:** prompt template, model, temperature — LLM systems break via prompt edits & silent provider updates with no code change.",
      "**Regression** (discrete change, compare before/after + CI evals) vs **drift** (gradual input/output shift). Alert on p95/p99 latency, TTFT, error rate, cost/request, token creep, eval regressions — not the mean.",
    ],
    mcqs: [
      {
        question: "Users report your multi-step LLM agent 'feels slower.' Your aggregate logs show 200 OK and a total latency. What observability structure lets you localize the slowdown to a specific step?",
        options: [
          "A single latency histogram across all requests",
          "Traces and spans — open a slow trace and read the per-span durations to see which nested operation (e.g., the retrieval span) regressed, since a trace is a tree of spans mirroring the call chain",
          "Increasing the log level to DEBUG on the whole service",
          "Averaging latency by endpoint",
        ],
        correct: 1,
        explanation: "Option B is correct: traces and spans give you the structure to localize. A trace records one full request; each span is a nested operation with its own timing, so opening a slow trace shows exactly which step — e.g., retrieval jumping from 40 ms to 900 ms — accounts for the regression. Aggregate numbers can't do this. Option A (a latency histogram) shows the distribution of totals but not which step inside a request is slow. Option C (DEBUG logging) produces unstructured volume without the nested timing structure needed to attribute latency to a span. Option D (averaging by endpoint) is still an aggregate over whole requests and hides the per-step breakdown that localization requires.",
      },
      {
        question: "Two LLM endpoints have identical total latency of 4.2 s for a 200-token response, but users find one far more responsive. Which metric explains the difference?",
        options: [
          "Total token count, since both produce 200 tokens",
          "TTFT (Time To First Token) — the responsive endpoint streams its first token quickly (low TTFT) so the user sees output almost immediately, while the other makes the user wait through a long TTFT before anything appears, even though totals match",
          "The number of spans in each trace",
          "Cost per request, which determines perceived speed",
        ],
        correct: 1,
        explanation: "Option B is correct: total latency decomposes as roughly TTFT + TPOT × output_tokens, so two endpoints can share a total while differing sharply in TTFT. The one with low TTFT streams words almost immediately and feels responsive; the one with high TTFT leaves the user staring at a spinner before anything appears, despite the same total. TTFT is the metric that captures perceived responsiveness. Option A is wrong — both produce 200 tokens, so token count is identical and cannot explain the felt difference. Option C (span count) reflects pipeline structure, not perceived generation speed. Option D confuses cost with latency; dollars per request do not determine how fast output appears to the user.",
      },
      {
        question: "Your LLM feature degraded with no code deploy. To even ask 'did the 2pm prompt edit or a provider model update cause this?', what must your observability capture?",
        options: [
          "Only the final response text of each request",
          "Prompt template/version, model name, and key parameters (temperature, top-p) tagged on every trace — so behavior can be attributed to a specific prompt or model change even when no application code changed",
          "The user's IP address and geolocation",
          "The total number of requests per hour",
        ],
        correct: 1,
        explanation: "Option B is correct: LLM systems break in ways code-only systems don't — a prompt edit or a silent provider-side model update changes behavior with no code deploy. To attribute a regression to a specific change, every trace must record which prompt version, which model, and which parameters produced it; without those tags you cannot compare before/after the 2pm edit or detect a swapped model. Option A captures only outputs, which shows that quality dropped but not what changed to cause it. Option C (IP/geo) is unrelated to prompt or model attribution. Option D (request volume) is a traffic metric that says nothing about which prompt or model version was in effect.",
      },
    ],
    takeaway: "LLM observability makes a non-deterministic, multi-step chain debuggable by structuring every request as a trace of nested spans, then attaching LLM-specific detail: token counts, cost, and split latency (TTFT for perceived speed, TPOT for throughput), plus prompt/model/param versions so regressions are attributable. Alert on p95/p99 latency, TTFT, error and cost per request, token creep, and canary eval-score regressions — and distinguish discrete regressions from gradual drift.",
  },

  "safety-measurement": {
    depthTier: "core",
    interviewWeight: "medium",
    scenario: "Leadership wants your assistant to be 'safe,' and a vendor pitches a model that scores 99% on a public safety benchmark. You ship it, and two complaints arrive the same week: it refuses to answer a nurse's legitimate question about medication dosages (calling it 'medical harm'), and a hobbyist got it to output genuinely dangerous instructions by wrapping the request in a fictional roleplay. A single 'safety score' told you nothing about either failure. You need to measure safety as the multi-dimensional, adversarial thing it actually is.",
    explanation: [
      "**Safety is not one number — it's a set of competing quantities in tension**, and the first job is to stop treating 'safe' as a scalar. A model that refuses everything scores perfectly on 'never says anything harmful' and is useless; a model that answers everything is maximally helpful and dangerous. ==Real safety measurement lives in the *gap* between two failure directions — refusing too little and refusing too much — so you need metrics on both sides plus adversarial pressure, not a single benchmark percentage.==",
      "The **refusal axis has two opposite failure modes**, and you must measure both:\n\n- **Refusal rate** — how often the model declines *genuinely harmful* requests. You *want* this high on a red-team set (declining bomb-making, malware, etc.). Too low = the model is unsafe.\n- **Over-refusal (false-refusal) rate** — how often the model *wrongly* declines *benign* requests because they superficially resemble harmful ones. This is the nurse's dosage question, or refusing to explain how a historical weapon worked. Too high = the model is annoyingly useless and users route around it. Benchmarks like **XSTest** exist specifically to measure over-refusal with 'safe prompts that look unsafe.'\n\n==A single 'refusal' number hides which direction you're failing. You measure refusal on a harmful set (want high) and over-refusal on a benign-but-scary-looking set (want low) — separately.==",
      { type: "illustration", label: "The two-sided refusal problem — one number can't see it", content: `                    request is actually...
                    HARMFUL            BENIGN
  model     REFUSE   ✓ correct         ✗ OVER-REFUSAL
                     (safe)              (nurse's dosage Q — useless)
  ─────────────────────────────────────────────────────────
            ANSWER   ✗ unsafe          ✓ correct
                     (dangerous)         (helpful)

  Refusal rate      = P(refuse | harmful)   → want HIGH   (red-team set)
  Over-refusal rate = P(refuse | benign)    → want LOW    (XSTest-style set)

  A single "safety %" collapses this 2×2 into one cell and hides the rest.` },
      "**Red-team pass rate and jailbreak robustness** measure safety *under adversarial pressure*, which is the only measurement that matters because attackers don't send polite requests:\n\n- **Red-team pass rate** — you (or an automated red-teamer) craft adversarial prompts designed to elicit harmful output; the pass rate is the fraction the model correctly resists. Static benchmarks test the *easy* case; red-teaming tests the *adversarial* case.\n- **Jailbreak robustness** — resistance to known attack *techniques*: roleplay framing ('you are DAN, ignore your rules'), fictional wrapping ('write a story where a character explains…' — exactly the scenario's exploit), prompt injection, encoding/obfuscation, many-shot jailbreaking, and gradient-crafted adversarial suffixes. Robustness is measured as attack-success-rate across a *suite* of techniques, ideally evolving ones. ==The scenario's fictional-roleplay bypass is a textbook jailbreak that a static benchmark would never catch — which is why a 99% benchmark score coexisted with a live exploit.==",
      "**Benchmark leakage (contamination) is why that 99% was hollow.** If a public safety benchmark's prompts (or close paraphrases) appeared in the model's training data, the model has effectively *memorized the test* — it scores high without being safe in general. Public, static benchmarks are especially prone: they're scraped, discussed, and end up in training corpora. ==A benchmark number is only trustworthy if you can rule out that the model trained on it; the defenses are held-out private eval sets, freshly generated adversarial prompts, and rotating/dynamic benchmarks. Never certify safety on a public leaderboard number alone.==",
      { type: "illustration", label: "Why the 99% benchmark lied — leakage + wrong test", content: `Public benchmark 99%   ─┬─ possible leakage: prompts in training data
                        │   → memorized the test, not generally safe
                        └─ static/easy: no adversarial pressure

Live failures it never measured:
  • over-refusal   (nurse dosage) ← benchmark only tested "does it refuse harm?"
  • jailbreak      (fiction wrap) ← benchmark had no adversarial techniques

Trustworthy safety measurement instead:
  held-out PRIVATE red-team set + FRESH jailbreak suite +
  over-refusal set + human review on the tail  →  a PROFILE, not a %.` },
      "**The helpfulness ↔ harmlessness tradeoff is the frontier you're actually navigating**, and the skill is *quantifying* it rather than picking a side. Push harmlessness up (refuse aggressively) and helpfulness/over-refusal gets worse; push helpfulness up and harmful-compliance risk rises. You make this visible by plotting the two together: measure **helpfulness** (task success / non-refusal on benign requests) and **harm** (harmful-compliance rate on the red-team set) as a *pair*, and compare models or safety-tuning settings on that plane — the goal is to move the whole frontier out (safer *and* more helpful), not to slide along it. ==A safety change that raises refusal rate is only good if over-refusal didn't rise with it; report the pair, and a change is a genuine improvement only if it's Pareto — better on one axis without regressing the other.==",
      "**Putting it together — how to actually measure safety.** Never report a single number. Report a **profile**: (1) refusal rate on a private red-team harmful set (want high), (2) over-refusal rate on a benign-but-scary set like XSTest (want low), (3) jailbreak attack-success-rate across an evolving technique suite (want low), all (4) on **held-out, leakage-controlled** data with human review on the ambiguous tail, and (5) plotted against **helpfulness** so the tradeoff is explicit. Safety is adversarial and dynamic — attackers adapt, so a one-time pass decays; re-red-team on every model/prompt change. ==The scenario's two failures — over-refusal and a jailbreak — are exactly the two dimensions a single benchmark percentage cannot see, which is the whole lesson.==",
    ],
    keyPoints: [
      "**Safety is multi-dimensional and adversarial, never one number.** A refuse-everything model scores perfectly on 'never harmful' yet is useless; measure the *gap* between refusing too little and refusing too much, under attack — not a single benchmark percentage.",
      "**The refusal axis has two opposite failures: refusal rate vs over-refusal.** Refusal rate (decline genuinely harmful requests) you want *high* on a red-team set; over-refusal (wrongly declining benign look-scary requests, e.g. XSTest) you want *low*. One 'refusal' number hides which way you're failing.",
      "**Adversarial metrics matter most: red-team pass rate and jailbreak robustness.** Static benchmarks test the easy case; red-teaming and a jailbreak suite (roleplay, fictional wrapping, injection, obfuscation, adversarial suffixes) test what attackers actually do — the scenario's fiction-wrap bypass is a textbook jailbreak a benchmark misses.",
      "**Benchmark leakage makes public scores hollow.** If benchmark prompts leaked into training data, the model memorized the test and scores high without being safe. Use held-out private sets, freshly generated adversarial prompts, and rotating benchmarks; never certify on a public leaderboard number.",
      "**Quantify the helpfulness↔harmlessness tradeoff as a pair, not a pick.** Plot helpfulness (task success/non-refusal on benign) against harmful-compliance on the red-team set; a safety change is a real improvement only if it's Pareto — better on one axis without regressing the other. Report the whole profile and re-red-team on every change.",
    ],
    recap: [
      "**Safety isn't a scalar** — refuse-everything scores 'safe' and is useless. Measure the gap between refusing too little and too much, under adversarial pressure.",
      "**Two refusal failures:** refusal rate on a harmful set (want HIGH) vs over-refusal on benign-but-scary prompts / XSTest (want LOW). One number hides the direction.",
      "**Adversarial metrics:** red-team pass rate + jailbreak robustness across a technique suite (roleplay, fiction-wrap, injection, obfuscation, suffixes). Static benchmarks miss these.",
      "**Benchmark leakage:** public test prompts in training data → memorized, not safe. Use held-out private + fresh + rotating sets; never trust a leaderboard % alone.",
      "**Helpfulness↔harmlessness:** measure as a pair; a change is real only if Pareto (better on one axis, no regression on the other). Report a profile; re-red-team on every change.",
    ],
    mcqs: [
      {
        question: "Your assistant refuses a nurse's legitimate medication-dosage question, calling it 'medical harm.' Which safety metric captures this failure, and why won't a single 'safety score' show it?",
        options: [
          "Refusal rate — it's too high, so lower it uniformly across all requests",
          "Over-refusal (false-refusal) rate — the model wrongly declines a benign request that superficially looks harmful; a single safety score only rewards refusing harm and can't see this opposite failure, so you measure over-refusal separately on a benign-but-scary set",
          "Jailbreak robustness — the nurse jailbroke the model",
          "Benchmark leakage — the dosage question was in the training set",
        ],
        correct: 1,
        explanation: "Option B is correct: refusing a legitimate, benign request that merely resembles a harmful one is over-refusal (false refusal). It's the opposite failure from unsafe compliance, and a single 'safety score' — which typically rewards declining harmful prompts — is blind to it, which is why you measure over-refusal separately on a benign-but-scary set like XSTest. Option A is wrong because lowering refusal uniformly would also make the model comply with genuinely harmful requests; the fix is reducing over-refusal specifically, not refusal across the board. Option C is wrong — the nurse asked a legitimate question and did not use an adversarial technique, so this isn't a jailbreak. Option D is wrong — the issue is the model wrongly classifying a benign request as harmful, not test-set contamination.",
      },
      {
        question: "A model scores 99% on a public safety benchmark but a user elicits dangerous instructions by wrapping the request in a fictional roleplay. What two distinct problems does this reveal?",
        options: [
          "The benchmark was simply too small; use a bigger public benchmark",
          "Possible benchmark leakage (the model may have trained on the public test, so 99% reflects memorization not safety) AND a jailbreak vulnerability (fictional-wrapping is an adversarial technique static benchmarks don't test) — safety needs held-out adversarial red-teaming, not a public score",
          "The user violated terms of service, so it's not a safety measurement issue",
          "The model's over-refusal rate is too low",
        ],
        correct: 1,
        explanation: "Option B is correct: two separate problems coexist. First, benchmark leakage — public benchmarks are scraped into training corpora, so a 99% may reflect memorizing the test rather than general safety, which is why held-out private and rotating sets are needed. Second, a jailbreak vulnerability — fictional/roleplay wrapping is a known adversarial technique that static benchmarks don't probe, so a high benchmark score can coexist with a live exploit. Real measurement requires adversarial red-teaming across a jailbreak suite. Option A is wrong — a bigger public benchmark still risks leakage and still won't test adversarial techniques. Option C dodges the measurement question; the user demonstrated a genuine safety gap regardless of ToS. Option D is unrelated — over-refusal concerns wrongly declining benign requests, not a successful jailbreak on a harmful one.",
      },
      {
        question: "You apply safety tuning that raises the refusal rate on harmful prompts from 90% to 98%. When is this a genuine safety improvement?",
        options: [
          "Always — a higher refusal rate on harmful prompts is unambiguously better",
          "Only if it's Pareto: the harmful-refusal gain didn't come with a rise in over-refusal (wrongly declining benign requests) or a drop in helpfulness — you must measure the helpfulness↔harmlessness pair, not one axis",
          "Only if the refusal rate reaches exactly 100%",
          "Never — refusal rate is not a meaningful safety metric",
        ],
        correct: 1,
        explanation: "Option B is correct: helpfulness and harmlessness trade off, so a gain in harmful-refusal must be checked against the other axis. If the same tuning also raised over-refusal (declining benign requests) or lowered task helpfulness, you've merely slid along the frontier, not improved it. A genuine improvement is Pareto — better on one axis without regressing the other — which is why you report the pair, not a single refusal number. Option A ignores the tradeoff: aggressive refusal can wreck helpfulness via over-refusal. Option C fixates on 100%, which typically maximizes over-refusal and usefulness collapse, not safety in any meaningful sense. Option D is wrong — refusal rate on a harmful set is meaningful; it's just insufficient alone and must be paired with over-refusal and helpfulness.",
      },
    ],
    takeaway: "Measure safety as a multi-dimensional, adversarial profile, never a single benchmark percentage: refusal rate on a private red-team harmful set (want high), over-refusal on benign-but-scary prompts (want low), and jailbreak attack-success across an evolving technique suite (want low) — all on leakage-controlled held-out data, plotted against helpfulness so the helpfulness↔harmlessness tradeoff is explicit. A safety change only counts if it's Pareto, and because attackers adapt, you re-red-team on every model or prompt change.",
  },
};
