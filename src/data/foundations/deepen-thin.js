// Deepened teaching for previously-thin Foundations modules. Spread LAST into foundationsRunnerData.js.
export const RUNNER_DEEPEN_THIN = {
  "reranking": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Your retriever just handed back a stack of chunks that all look plausible. Which one should the model actually read first? That question matters more than it sounds — in most RAG systems, the top-ranked chunk (or the handful right behind it) is what actually reaches the prompt, so getting the *order* right is doing as much work as getting the *right chunks* into the pool in the first place.\n\nHere's the part worth being suspicious of. The scoring that produced that order was computed by squashing each document down to a single fixed vector — and that vector was built before the model ever saw your query. The comparison at query time is just a dot product between two precomputed points, not a reading of the text. That's astonishingly fast: you can do it against millions of documents in milliseconds. But something built that fast by skipping a step raises an obvious question — what did skipping that step cost you, right at the top of the list, where it matters most?\n\nA **reranker** is the tool built to answer that question: a second pass that lets the query and the document actually meet before anything gets scored. We'll build up why that meeting matters, what it costs to arrange, and — the real skill here — when paying that cost is worth it.",
    scenario: "A different team runs a support-ticket search tool. Retrieval pulls a candidate pool of **k = 150** tickets per query, and logging shows recall@150 = 0.95 — the right ticket is almost always somewhere in that pool. The product only ever shows the top **6** results before a user has to click 'see more'; when users do click through and find what they needed, the ticket they wanted was sitting anywhere from rank 12 to rank 130 in that pool — always past the visible six, so this is a genuine mis-ranking, not a missing-from-the-pool problem.\n\nThe team has a hard end-to-end search budget of **300 ms**. Retrieval itself (embedding the query, hitting the ANN index) takes **15 ms**. Whatever's left after that has to cover both a rerank pass and everything downstream of ranking — formatting, logging, the response round trip — which the rest of the pipeline needs a fixed **150 ms** to finish. They're evaluating a self-hosted cross-encoder that, batched on their GPU, costs **1.8 ms per candidate** it scores.\n\nBefore anyone argues for reranking the full pool of 150: how many of those 150 candidates can this latency budget actually afford to send through the cross-encoder — and does that number cover the range of ranks where users have actually been finding their tickets?",
    explanation: [
      "Start with the machine that produced that order in the first place: a **bi-encoder**, which is what your vector DB's embedding model actually is. It encodes your query into a vector once, and it encoded every document into a vector once too — offline, long before your query existed. Scoring a pair is then just a **dot product or cosine similarity** between two already-finished points. Because the document side is already computed, you can search millions of documents in milliseconds using an approximate-nearest-neighbor index (HNSW, IVF) instead of comparing against everything. ==That speed is the entire reason bi-encoders exist.==\n\nBut notice the sequencing: the document's vector was finished before the query ever showed up. So whatever separates a right answer from a near-miss has to already be visible in that one fixed vector, with no chance to consult the actual question being asked. Pause and predict: if a document was scored without ever seeing the query, would you expect it to land in roughly the right neighborhood of the results — or reliably at the exact right position within that neighborhood?",
      "The honest answer is: roughly the right neighborhood, not reliably the right position. Take a concrete pair — a support query asking about **refunds after 30 days**, and a chunk describing the policy for **refunds within 30 days**. Opposite meanings, built from almost the same words. A bi-encoder embeds each side independently, so both land in nearly the same region of vector space; the model never gets a chance to notice that 'after' and 'within' flip the meaning. Run this against a real index and the pattern holds exactly that way: the right chunk is *in* the candidate set (recall@50 = 0.94 — it shows up somewhere in the top 50 almost every time), but its exact rank inside that set is noisy. Say it lands at **rank 18** — comfortably past whatever handful of chunks you can afford to hand the model. High recall, mediocre top precision: the bi-encoder found the neighborhood and stopped there.",
      "A **cross-encoder** is built to close exactly that gap. Instead of encoding query and document separately, it concatenates them — `[CLS] query [SEP] document [SEP]` — and runs the pair through a single Transformer, so every query token can attend to every document token through full self-attention before any score comes out. 'After 30 days' and 'within 30 days' now actually interact; the model can tell they contradict each other. Run the same refund query and chunk through it, and the rank-18 chunk moves to **rank 2** — reordered on the strength of an actual reading, not a distance between two vectors that were never in the same room.\n\nIf a cross-encoder reads this much better, the obvious next question is why you wouldn't just replace the bi-encoder with it everywhere — score the whole million-document index this way from the start. What would that cost you?",
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
      "Nothing about a cross-encoder can be precomputed. The document's representation depends on the query sitting next to it, so there's no vector to drop into an index ahead of time — you run a fresh forward pass, for that one document, at the moment the query arrives. Do that for a million documents on every search and the cost of 'read everything carefully' is your entire latency budget, on every request. A cross-encoder adds **tens to a few hundred milliseconds** and that cost scales roughly **linearly in the number of pairs it scores** — reading 100 candidates is about twice the work of reading 50. Affordable for a handful of candidates. Not affordable for a million.\n\nSo the two machines don't compete — they chain. Use the bi-encoder for what it's fast at: casting a wide, cheap net over everything (**k ≈ 50–100** candidates pulled from millions). Use the cross-encoder for what it's accurate at: reading only that narrowed set carefully and reordering it, so you keep a small **top n ≈ 3–5** for the prompt. This is the **retrieve-k-then-rerank-to-n** pattern — the rank-18-to-rank-2 fix from a moment ago, running at production scale.",
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
      "Which brings the diagnosis full circle. Reranking is worth adding exactly when **recall@k is already high but precision@n is low** — the bug you just watched it fix, chunk present but buried at rank 18. It is not worth adding when recall@k itself is poor: a reranker can only reorder the candidates retrieval handed it, so if the right chunk never made the top-k, no amount of careful reading recovers it — you have to fix retrieval itself (embeddings, chunking, hybrid dense+BM25 search) before a reranker has anything worth reordering. ==Reranking is a precision tool; reaching for it to solve a recall problem is the classic misdiagnosis.==",
    ],
    keyPoints: [
      "**Bi-encoder = precompute, cross-encoder = query-aware.** A bi-encoder embeds query and doc separately (cheap dot-product, indexable, millions in ms) but they never interact until the end; a cross-encoder concatenates them and runs full self-attention, so it reads the pair — accurate but one forward pass per pair, no index.",
      "**Recall ≠ precision, and they need different tools.** Retrieval maximizes recall@k (don't lose the answer in a wide net); reranking maximizes precision@n (put the answer on top of a small set). High recall@50 with the answer stuck at rank 18 is a *precision* failure a reranker fixes.",
      "**The pattern is retrieve-k-then-rerank-to-n.** Bi-encoder pulls k≈50–100 high-recall candidates from millions; cross-encoder reorders them and you keep top n≈3–5. Widening top-k instead adds distractors and hurts generation — the wrong fix.",
      "**Reranker cost is ~linear in k and adds tens–hundreds of ms.** k is a latency/recall dial; n is bounded by context budget and distractor tolerance. Late-interaction (ColBERT) and hosted rerank APIs (Cohere/Voyage) or self-hosted BGE-reranker are middle grounds.",
      "**A reranker can only reorder what retrieval returned.** If recall@k is poor (right chunk not in top-k), reranking cannot recover it — fix embeddings/chunking/hybrid search first. Reranking is worth it precisely when recall is high but top-n precision is low.",
    ],
    recap: [
      "**Bi-encoder** embeds query & doc separately → cheap, indexable, high recall, mediocre top precision. **Cross-encoder** reads the concatenated pair → accurate ordering, no precompute, one pass/pair.",
      "**Recall ≠ precision**: answer *in* top-50 but at rank 18 is a precision bug, not a recall bug. Widening context is the wrong fix (more distractors).",
      "**Retrieve-k-then-rerank-to-n**: wide cheap net (k≈50–100) → careful expensive reorder → keep top n≈3–5 for the prompt.",
      "**Cost**: rerank latency ~linear in k, tens–hundreds of ms; ColBERT / hosted rerankers are middle grounds.",
      "**A reranker only reorders stage-1 output** — can't surface a chunk retrieval never returned. Use when recall@k is high but precision@n is low.",
    ],
    mcqs: [
      {
        question: "Your RAG system has recall@50 = 0.94 but the correct chunk frequently sits around rank 18, below the top-5 you pass to the LLM. Which fix directly targets this failure?",
        options: [
          "Widen the LLM's context to the top-20 chunks so the rank-18 answer is included directly, accepting more distractor text in the prompt",
          "Swap in a larger bi-encoder embedding model, hoping a bigger vector space pushes the correct chunk from rank 18 up toward rank 1",
          "Add a cross-encoder reranker over the top-50 candidates so each pair gets full attention scoring, then keep the new top-5",
          "Cut chunk size in half and re-embed the whole index, on the theory that finer granularity alone improves ranking order",
        ],
        correct: 2,
        explanation: "Option C is correct: this is a precision-at-the-top failure — the answer is already retrieved (recall@50 = 0.94) but ranked too low. A cross-encoder reads each (query, chunk) pair with full self-attention and reorders the top-50 far more accurately than the bi-encoder's frozen-vector distance, pulling the rank-18 chunk up so it survives a top-5 cut. Option A widens the context with a recall tool applied to a precision problem: it adds distractors and typically lowers generation quality, which is the failure already observed. Option B chases recall, but recall is already 0.94 and isn't the bottleneck — the answer is present, just mis-ranked; a bigger bi-encoder still never lets query and document interact before scoring. Option D changes chunking granularity but adds no query-aware scoring at the top of the list, so it doesn't reliably fix the ranking problem.",
      },
      {
        question: "Why can a bi-encoder score millions of documents in milliseconds while a cross-encoder cannot?",
        options: [
          "The bi-encoder precomputes document vectors offline, so scoring is just a cheap dot product; the cross-encoder needs a fresh forward pass per pair",
          "The cross-encoder simply uses a much larger Transformer than the bi-encoder, so it is inherently slower per document no matter how scores are cached",
          "Cross-encoders are restricted to CPU inference and cannot be batched on GPUs at all, which caps their throughput well below the bi-encoder's",
          "Bi-encoders skip self-attention entirely inside their own encoder tower, which is the only expensive operation a cross-encoder still has to pay for",
        ],
        correct: 0,
        explanation: "Option A is correct: the bi-encoder encodes each document independently of the query, so document vectors are computed once offline and stored in an ANN index; scoring is then just a dot product, enabling millions of comparisons in milliseconds. The cross-encoder concatenates query and document and runs the pair through a Transformer, so the representation is query-dependent and cannot be precomputed or indexed — every pair needs its own forward pass at request time. Option B points at model size, but the fundamental issue is the inability to precompute, not raw parameter count — a same-sized cross-encoder would have the identical problem. Option C is false — cross-encoders run on GPUs fine; the constraint is per-pair computation, not the hardware. Option D is wrong: bi-encoders do use self-attention inside their own encoder tower; the saving comes from precomputing and reusing document vectors, not from removing attention.",
      },
      {
        question: "Your recall@50 is only 0.55 — the correct chunk is missing from the top-50 in nearly half of queries. Select the two accurate statements about how to respond.",
        options: [
          "Adding a cross-encoder reranker over the same top-50 candidate set will raise recall@50 as a side effect of its scoring pass",
          "A reranker can only reorder the candidates retrieval already returned, so it cannot recover a chunk that was never in the top-50",
          "Increasing n, the number of chunks sent to the LLM, compensates for low recall by giving the model more chances to find it",
          "The priority fix is retrieval itself — embeddings, chunking, or hybrid dense+BM25 — since the chunk is absent, not mis-ranked",
        ],
        correct: [1, 3],
        explanation: "Options B and D are correct together: a reranker only reorders what stage-1 handed it, so if the right chunk isn't in the top-50 (recall@50 = 0.55), no amount of reordering can surface it (B) — you must first improve retrieval itself via better embeddings, chunking, or hybrid dense+BM25 search (D). Option A is wrong because reranking reorders a fixed candidate set and cannot change what was retrieved, so it cannot raise recall@50. Option C is wrong because increasing n draws from the same recall-limited candidate pool that already lacks the answer roughly half the time, so it cannot compensate for a recall failure — only widening/improving retrieval can.",
      },
    ],
    takeaway: "Retrieval (bi-encoder) is a cheap high-recall net that pulls k≈50–100 candidates from millions; reranking (cross-encoder) is an expensive high-precision filter that reads each (query, doc) pair with full self-attention and reorders them so you keep the top n≈3–5. Reach for a reranker when recall@k is high but the answer is ranked too low — never to compensate for poor recall, since it can only reorder what retrieval already returned.",
  },

  "rag-eval": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Let's start with the most tempting number in the world and why it lies to you. You have a RAG system, and the obvious way to grade it is one score: *what fraction of answers were correct?* Say it's 78%. Feels informative. It isn't — at least not for the thing you actually need, which is *knowing what to fix*.\n\nHere's the reason, and it's the spine of this module. A RAG system is really three smaller machines in a row: one that *finds* the right passage, one that *stays faithful* to what it found, and one that *writes* a correct answer from it. Any of the three can break on its own. So a single blended 78% is like a car dashboard with one lamp labeled \"something's off\" — true, useless. You can't tell whether the finder missed the page, or the writer ignored a page it *did* get.\n\nSo we'll build up how to *decompose* that one number into stage-specific measurements, and how to gather the small ground-truth set that powers them. Take your time. The reward is turning \"it's 78%\" — a shrug — into \"retrieval is fine, faithfulness is the leak\" — a plan.",
    scenario: "Your RAG assistant scores 8.2/10 on a single 'answer quality' LLM-judge metric, and leadership is happy — until a customer catches it citing a policy that doesn't exist in any of your documents. You investigate and find two separate diseases wearing the same symptom: sometimes retrieval returns the wrong chunks (so even a perfect answer would be impossible), and sometimes retrieval is fine but the model ignores the context and invents a plausible answer from its parametric memory. Your one blended score cannot tell these apart. You need an eval design that pins the blame on the right component.",
    explanation: [
      "A RAG system is a **pipeline of two stages** — *retrieve* then *generate* — and the cardinal rule of evaluating it is that you must **measure the two stages separately**, because a single end-to-end score cannot localize failure. ==If retrieval feeds the generator garbage, even a flawless generator produces a wrong answer; if retrieval is perfect but the generator ignores it, you also get a wrong answer. Same symptom, opposite cure.== A blended 8.2/10 hides which disease you have.",
      "The generation side is best understood as a **triad of three distinct relationships** among three objects: the **question**, the **retrieved context**, and the **answer**. Popularized by the RAG-eval tooling wave (TruLens named it the 'RAG triad'; RAGAS operationalizes the same ideas), the triad is:\n\n- **Faithfulness / groundedness** — *answer ↔ context.* Is every claim in the answer actually supported by the retrieved context? This is your **anti-hallucination** metric. A low score is the exact bug in the scenario: the model asserted a policy no chunk contains.\n- **Answer relevance** — *answer ↔ question.* Does the answer actually address what was asked, without padding or drift? A faithful answer can still be useless if it answers a different question.\n- **Context relevance / precision** — *context ↔ question.* Of the retrieved chunks, how much is actually pertinent? Low context relevance means retrieval dumped noise, which both wastes tokens and tempts the model to hallucinate off irrelevant text.\n\n==These three are orthogonal: you can be faithful but irrelevant, relevant but unfaithful, or answering well off a context full of noise. One number collapses all three.==",
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
           (ideal = both relevant at ranks 1,2) → ~0.65

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
      "**Eval retrieval and generation separately** — one blended score can't localize failure; same symptom, opposite fixes.",
      "**Triad**: **faithfulness** (answer↔context, anti-hallucination), **answer relevance** (answer↔question), **context relevance** (context↔question). Orthogonal — one number blurs all three.",
      "**Retrieval metrics**: recall@k (found it), precision@k (noise), MRR (first hit ranked high), nDCG (all hits ranked high, graded + position-discounted).",
      "**Localization**: bad retrieval metrics → fix retrieval; good context + low faithfulness → fix the generator (hallucinating past context).",
      "**RAGAS** = LLM-judged triad, often reference-free; retrieval needs a labeled query→chunk gold set. Keep as separate CI gates.",
    ],
    mcqs: [
      {
        question: "Your RAG assistant returns an answer citing a policy that appears in none of the retrieved chunks. Your gold-set check confirms the correct chunks WERE retrieved and are relevant. Which metric is failing, and what does it point to?",
        options: [
          "Recall@k is failing — retrieval lost the relevant chunk from the candidate set entirely, so the fix is revisiting embeddings or chunking strategy",
          "Context relevance is failing — retrieval returned noisy, off-topic chunks that don't pertain to the question being asked",
          "Answer relevance is failing — the generated answer drifted off-topic and never actually addressed what the user asked",
          "Faithfulness is failing — the answer asserts a claim the context doesn't support, pointing to a stricter grounding prompt or model change",
        ],
        correct: 3,
        explanation: "Option D is correct: the retrieved chunks are confirmed relevant and present, so retrieval did its job. The failure is that the answer asserts a claim (a policy) not supported by that context — the definition of low faithfulness/groundedness — which localizes the bug to generation: the model drew on parametric memory instead of grounding in the provided context. Option A is wrong because the scenario explicitly confirms the relevant chunks were retrieved, so recall@k is fine. Option B is wrong because context relevance is confirmed good — the right chunks were retrieved, so noise-in-context doesn't apply. Option C is wrong because answer relevance concerns whether the answer addresses the question, not whether its claims are supported — the answer here is on-topic but fabricated.",
      },
      {
        question: "Select the two reasons a single end-to-end 'answer quality' score is insufficient for evaluating a RAG system.",
        options: [
          "It cannot localize failure: a retrieval bug and a generation bug can produce the identical low score, so you can't tell which stage to fix",
          "LLM judges used for this kind of scoring are categorically incapable of producing any signal that correlates at all with human quality ratings",
          "It collapses three orthogonal relationships — faithfulness, answer relevance, context relevance — into one blurred number",
          "A single score always double-counts faithfulness and answer relevance, which mechanically inflates it above the true quality",
        ],
        correct: [0, 2],
        explanation: "Options A and C are correct together: a blended score can't tell you where a pipeline failed — a retrieval bug (wrong chunks) and a generation bug (ignoring good chunks) can produce the same low number (A), and the score also flattens the three distinct relationships in the RAGAS triad — faithfulness, answer relevance, context relevance — into one blur, hiding which one actually failed (C). Option B overstates the case — LLM judges, while imperfect, can correlate meaningfully with human ratings when calibrated; that's not why a single score fails to localize. Option D invents a double-counting mechanism that isn't how blended scoring works; the real problem is lost diagnostic resolution, not arithmetic inflation.",
      },
      {
        question: "You're choosing a retrieval metric. Relevance is GRADED (some chunks are more relevant than others), and you care that ALL relevant chunks are ranked high, with earlier positions weighted more. Which metric fits best?",
        options: [
          "Recall@k, since it counts how many of the relevant chunks landed anywhere at all in the top-k result set today",
          "nDCG, since it supports graded relevance, rewards ranking all relevant chunks high, and discounts by position",
          "MRR, since it rewards getting at least one single relevant chunk placed into a high rank position",
          "Precision@k, since it measures what fraction of the top-k retrieved results are actually relevant ones",
        ],
        correct: 1,
        explanation: "Option B is correct: nDCG (normalized Discounted Cumulative Gain) is designed for exactly these requirements — it supports graded (non-binary) relevance labels, rewards placing all relevant chunks high in the ranking, and applies a position discount so earlier ranks count more. Option A (recall@k) only counts how many relevant chunks fall in the top-k; it ignores order and treats relevance as binary. Option C (MRR) rewards only the first relevant chunk's position and ignores the rest, so it can't capture 'all relevant chunks ranked high.' Option D (precision@k) measures what fraction of the top-k is relevant but doesn't incorporate graded relevance or position-discounted ranking of all relevant items.",
      },
    ],
    takeaway: "Evaluate RAG as two separable stages: retrieval with ranking metrics (recall@k, precision@k, MRR, nDCG) and generation with the RAGAS triad (faithfulness, answer relevance, context relevance). Keeping them separate is what lets you localize a regression — bad retrieval metrics mean fix retrieval, while good context with low faithfulness means the generator is hallucinating past its context. Never report one blended number.",
  },

  "llm-as-judge": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Let's start with a very human problem. You've built something that writes answers, and now you need to know: are the answers any good? The honest way is to have a person read each one and score it. That works — but it's slow and expensive, and every time you tweak your system you have to do it all over again. So a tempting idea shows up: what if we ask *another* model to be the grader? Show it the answer, hand it a rubric, let it assign a score. Suddenly you can grade thousands of answers in minutes. That's **LLM-as-judge** — a capable model grading another model's outputs.\n\nHere's the catch, and it's the whole reason this module exists. A judge that's fast but *biased* isn't measuring what you think it's measuring — it's measuring its own preferences dressed up as a score. So before we ever trust one of these judges, we have to understand exactly *how* it can quietly fool us.\n\nTake your time here. We'll build up the specific ways an LLM judge goes wrong — each one has a name and a clean fix — and by the end you'll be able to say precisely when a judge is safe to trust and when a human still has to be the floor. No rush.\n\nOne more thing worth naming up front, since it connects directly to eval-loop: eval-loop already established the deeper requirement — an evaluator has to be independent of the thing it's grading. An LLM judge is exactly the case where that independence is hardest to guarantee, which is why its failure modes deserve their own module.",
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
      "**Judge** = fast, scalable stand-in for humans — still an LLM: uncalibrated, it measures quality *plus* its own biases.",
      "**G-Eval rubric** = explicit criteria + anchored scale + CoT-before-score. Vague 'rate 1–10' drifts; most 'noisy judge' complaints are rubric complaints.",
      "**Biases (systematic)**: position (favors a slot → flips on reorder), verbosity (longer wins free), self-preference (favors own family).",
      "**Pointwise** = absolute, easy to track, hard to calibrate. **Pairwise** = relative, more reliable, but position-biased → judge both orderings, keep order-agnostic wins.",
      "**Calibrate against human labels** (agreement/rank correlation) before trusting; re-validate on judge-model change. Distrust: subjective, expert, self-family, safety-critical calls.",
    ],
    mcqs: [
      {
        question: "After a model update that made answers longer and more verbose, your LLM-judge score rose 0.6 with no measurable gain in correctness. What is the most likely explanation?",
        options: [
          "The longer answers are genuinely higher quality, and the judge correctly detected the real improvement in correctness",
          "The judge model was silently swapped for a stricter version around the same time as the deploy, which explains the score shift",
          "Verbosity bias — LLM judges reward longer, more elaborate answers even when the extra text adds no correctness at all",
          "Position bias caused the inflation, since the newer, longer answers happened to be listed first in every single comparison run",
        ],
        correct: 2,
        explanation: "Option C is correct: verbosity/length bias is a well-documented, systematic tendency of LLM judges to score longer and more elaborate answers higher regardless of whether the added text improves correctness. That matches the symptom exactly — length went up, the score went up, correctness did not. Option A contradicts the premise: correctness was explicitly unchanged, so the score rise reflects the judge rewarding length, not real quality. Option B invents a silent stricter upgrade, which would if anything lower scores and doesn't explain a length-correlated increase. Option D is wrong because position bias concerns which slot an answer occupies in a pairwise comparison, not answer length in a pointwise score — the scenario's trigger was verbosity, not ordering.",
      },
      {
        question: "In pairwise LLM-judge comparisons, you notice the winner sometimes flips depending on which answer is listed first. What is the standard mitigation?",
        options: [
          "Always list the newer model's answer first so it consistently receives the position advantage in every single comparison",
          "Switch entirely to pointwise absolute scoring, which is immune to any ordering effects between the two candidate answers",
          "Raise the judge's sampling temperature so which answer appears first matters less to the final verdict reached",
          "Run each pair in both orderings and count a win only if it holds regardless of order, treating flips as unreliable",
        ],
        correct: 3,
        explanation: "Option D is correct: the flip is position bias — the judge favors a particular slot regardless of content. The standard fix is to evaluate each pair in both orderings and only credit an order-agnostic win; if the winner flips when you swap positions, that comparison is unreliable and should be treated as a tie or discarded. Option A deliberately exploits the bias to favor one model, which corrupts the evaluation rather than fixing it. Option B trades one problem for another — pointwise scoring avoids position bias but introduces calibration and leniency-drift problems and is generally less reliable than well-controlled pairwise. Option C raises randomness, which adds noise and doesn't remove the systematic positional preference.",
      },
      {
        question: "Before rolling out an LLM judge in CI, select the two practices essential to trusting its scores.",
        options: [
          "Calibrate against a human-labeled sample, measuring the judge's agreement and rank-correlation with those ratings",
          "Use a judge model from the exact same model family as the system under test, so scoring stays internally consistent",
          "Require the judge to output scores to two decimal places so the resulting metric reads as more precise",
          "Anchor the judge with an explicit rubric and scoring criteria rather than a vague 'rate this 1 to 10' prompt",
        ],
        correct: [0, 3],
        explanation: "Options A and D are correct together: an LLM judge's validity is unknown until you check it against the ground truth it replaces — calibration, i.e. agreement/rank-correlation with human labels (A) — and a vague prompt invites an inconsistent standard, so an explicit, anchored rubric (G-Eval style) is what makes scores repeatable in the first place (D). Option B is actively harmful: matching the judge to the system's own model family invites self-preference bias, the opposite of a neutral evaluation. Option C confuses decimal precision with accuracy; more decimals on an uncalibrated, unanchored judge just adds false confidence.",
      },
    ],
    takeaway: "An LLM judge is a fast, scalable stand-in for human raters but is itself an LLM with systematic biases — position (pairwise winners flip on reorder), verbosity (length rewarded for free), and self-preference (favors its own family). Anchor it with a G-Eval-style rubric and chain-of-thought, prefer order-controlled pairwise for relative judgments, and never trust the scores until you've calibrated them against human labels.",
  },

  "chunking": {
    depthTier: "core",
    interviewWeight: "medium",
    groundUp: "Pick up exactly where embeddings left off: the chunk closest to the query in vector space is what comes back. But that raises a question embeddings never answers on its own — closest chunk out of *which* chunks? Something upstream had to decide where one chunk ends and the next begins, before any of that geometry could even start.\n\nLet's start with a small, easy-to-picture fact. When you build a retrieval system, you don't hand the retriever whole documents — you first cut each document into pieces, and it's those *pieces* that get stored, searched, and handed back. Cutting a document into pieces is called **chunking**, and each piece is a **chunk**.\n\nHere's the idea that quietly runs this whole module: *whatever piece you cut becomes the unit of retrieval.* The retriever can only ever return a chunk — never half of one, never two stitched together. So if the answer a user needs happens to straddle the line where you made your cut, the retriever hands back one side of that line and the other side is simply gone, invisible to everything downstream. Where you place your cuts decides what answers are even *possible* to retrieve.\n\nWe'll build this up the way it actually developed — start with the most obvious way to cut (just chop every N tokens), watch it fail in a precise way, and let each fix grow out of the failure before it. No rush. By the end, a retrieval bug that looks baffling will resolve into a single sentence about where the boundaries fell.",
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
      "**A chunk is both the embedded unit and the LLM-fed unit** — coherent enough for one vector, complete enough to use. The two pull apart.",
      "**Ladder**: fixed-size (blind, cuts meaning) → sentence/recursive → semantic (topic-shift boundaries) → structural (headers/functions/tables). Up = more effort, more honest chunks.",
      "**Size/overlap tradeoff**: small = precise but incomplete; large = self-contained but diluted + token-wasteful. Overlap = boundary facts survive whole, cost = redundancy.",
      "**Interactions**: exceed the embedder's window → silent truncation (retrieve on unseen text); spread evidence → need higher k.",
      "**Lost-boundary failure**: fixed-size cuts a table/procedure/antecedent → chunk is 'relevant' but incomplete, so recall@k lies. Fix: structural/semantic + overlap; tune on answer completeness.",
    ],
    mcqs: [
      {
        question: "Your RAG bot retrieves a 'relevant' chunk (recall@k looks fine) but the answer is missing a step of a procedure. You're using fixed-size 512-character chunks with no overlap. What is happening and what's the fix?",
        options: [
          "The lost-boundary failure — fixed-size chunking cut the procedure mid-step, so move to structural splitting plus overlap",
          "Retrieval recall is genuinely too low across this whole dataset, so the fix is increasing k to retrieve more chunks per query",
          "The embedding model is undersized for this specific domain, so switching to a larger embedding model resolves it",
          "The LLM's decoding temperature is set too high, which is causing it to randomly drop procedural steps entirely",
        ],
        correct: 0,
        explanation: "Option A is correct: this is the classic lost-boundary failure. Content-blind fixed-size chunking cuts through the middle of the procedure, so one chunk holds step 4 and the next holds step 5. Recall@k rewards retrieving a relevant chunk but not a complete one, which is why the metric looks fine while the answer drops a step. The fix is to split on natural/structural boundaries so cuts fall where meaning does, and add overlap so a fact spanning a boundary appears whole in at least one chunk. Option B misreads the metric — recall is fine; the retrieved unit is incomplete, not missing. Option C blames the embedder, but the problem is where the text was cut, not how it was vectorized. Option D blames generation randomness, but the missing step was never in the retrieved chunk, so temperature isn't the cause.",
      },
      {
        question: "You increase chunk size from 256 to 2048 tokens to make each chunk more self-contained. Select the two most likely downsides.",
        options: [
          "Boundary-spanning facts, like a procedure split across a cut, will now be split apart even far more often than before this",
          "The single embedding now averages several distinct ideas together, diluting retrieval precision versus tighter chunks",
          "The chunk may exceed the embedding model's maximum input window and get silently truncated before it's embedded",
          "Recall@k is guaranteed to collapse all the way to zero once chunks pass roughly 1,000 tokens in length",
        ],
        correct: [1, 2],
        explanation: "Options B and C are correct together: larger chunks carry more context but a single vector must now represent several ideas, diluting retrieval precision (B); and if the chunk exceeds the embedding model's max input (many cap around 512 tokens), the tail is silently truncated before embedding, so you retrieve on text the vector never actually saw (C). Option A is backwards — larger chunks split boundary-spanning facts less often, not more, since more content fits inside one chunk. Option D is false — larger chunks do not force recall to zero; recall often holds or even rises while precision falls, since a bigger chunk widens what topics a single chunk can 'cover.'",
      },
    ],
    takeaway: "Chunking decides the retrievable unit, and a chunk must serve two conflicting masters — a coherent single embedding and a self-contained unit for the LLM. Fixed-size splitting is content-blind and causes the lost-boundary failure (a 'relevant' chunk that's incomplete, so recall lies); move up toward semantic/structural splitting, add overlap so straddling facts survive whole, keep chunks inside the embedder's window, and tune on answer completeness rather than retrieval recall alone.",
  },

  "safety-measurement": {
    depthTier: "core",
    interviewWeight: "medium",
    groundUp: "Let's start with a number that looks reassuring and isn't. A vendor tells you their model scores 99% on a safety benchmark — refuses 99 out of 100 harmful requests. Feels like a green light. But ask the question that number can't answer: what happens to the request that *wasn't* harmful, the ones that just sound like it?\n\nPush a model hard enough toward 'never say anything harmful' and you get a model that also refuses a nurse asking about medication dosages, an author researching poisons for a novel, a security researcher asking about an exploit they're patching. A model that refuses everything scores perfectly on 'never harmful' — and is useless. A model that answers everything scores perfectly on 'always helpful' — and is dangerous. Notice what that means: safety isn't a single number you climb toward. It's a *tension* between two failure directions, over-refusal and under-refusal, and a single benchmark score can only ever see one side of it at a time.\n\nThere's a third wrinkle on top of that tension: people trying to get past a model's refusals don't ask nicely. They wrap the same harmful request in a fictional roleplay, a hypothetical, a multi-step conversation that arrives at the place a direct question would've been blocked from reaching. So safety measurement has to check not just 'does it refuse the obvious ask' but 'does it hold up against someone actively trying to route around the refusal.'\n\nWe'll build up what actually measuring safety requires: metrics on both failure directions, not just one, plus adversarial testing that tries to break it on purpose. Take your time — the payoff is being able to look at a single safety-score badge and say, precisely, what it does and doesn't tell you.",
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
      "**Safety isn't a scalar** — refuse-everything scores 'safe' and is useless. Measure the gap between refusing too little and too much, under attack.",
      "**Two refusal failures**: refusal rate on a harmful set (want HIGH) vs over-refusal on benign-but-scary prompts / XSTest (want LOW). One number hides the direction.",
      "**Adversarial metrics**: red-team pass rate + jailbreak robustness across a technique suite (roleplay, fiction-wrap, injection, obfuscation, suffixes). Static benchmarks miss these.",
      "**Benchmark leakage**: public test prompts in training data → memorized, not safe. Use held-out private + fresh + rotating sets; never trust a leaderboard % alone.",
      "**Helpfulness↔harmlessness**: measure as a pair; a change is real only if Pareto (better on one axis, no regression on the other). Report a profile; re-red-team on every change.",
    ],
    mcqs: [
      {
        question: "Your assistant refuses a nurse's legitimate medication-dosage question, calling it 'medical harm.' Which safety metric captures this failure, and why won't a single 'safety score' show it?",
        options: [
          "Refusal rate is simply too high across the board, so the fix is uniformly lowering how often the model declines any request",
          "Jailbreak robustness — the nurse effectively jailbroke the model by phrasing a dosage question in a clinical-sounding way",
          "Benchmark leakage — the dosage question likely appeared in the model's own training data, so it got memorized as harmful",
          "Over-refusal rate — the model wrongly declines a benign request that looks harmful; a single safety score can't see this",
        ],
        correct: 3,
        explanation: "Option D is correct: refusing a legitimate, benign request that merely resembles a harmful one is over-refusal (false refusal). It's the opposite failure from unsafe compliance, and a single 'safety score' — which typically rewards declining harmful prompts — is blind to it, which is why over-refusal is measured separately on a benign-but-scary set like XSTest. Option A is wrong because lowering refusal uniformly would also make the model comply with genuinely harmful requests; the fix is reducing over-refusal specifically, not refusal across the board. Option B is wrong — the nurse asked a legitimate question and used no adversarial technique, so this isn't a jailbreak. Option C is wrong — the issue is the model misclassifying a benign request as harmful, not test-set contamination.",
      },
      {
        question: "A model scores 99% on a public safety benchmark but a user elicits dangerous instructions by wrapping the request in a fictional roleplay. What two distinct problems does this reveal?",
        options: [
          "The benchmark was simply too small in scope; switching to a bigger, broader public benchmark would have caught this",
          "The user violated the platform's terms of service by roleplaying, so this isn't really a safety measurement gap",
          "Possible benchmark leakage (the model may have trained on the public test) combined with a jailbreak vulnerability",
          "The model's over-refusal rate must be too low, since it was willing to answer the wrapped request at all here",
        ],
        correct: 2,
        explanation: "Option C is correct: two separate problems coexist. First, benchmark leakage — public benchmarks are scraped into training corpora, so a 99% may reflect memorizing the test rather than general safety, which is why held-out private and rotating sets are needed. Second, a jailbreak vulnerability — fictional/roleplay wrapping is a known adversarial technique that static benchmarks don't probe, so a high benchmark score can coexist with a live exploit. Option A is wrong — a bigger public benchmark still risks leakage and still won't test adversarial techniques. Option B dodges the measurement question; the user demonstrated a genuine safety gap regardless of ToS. Option D is unrelated — over-refusal concerns wrongly declining benign requests, not a successful jailbreak on a harmful one.",
      },
      {
        question: "You apply safety tuning that raises refusal rate on harmful prompts from 90% to 98%. Select the two conditions that must both hold for this to count as a genuine safety improvement.",
        options: [
          "Over-refusal on benign-but-scary requests did not rise alongside the harmful-refusal gain",
          "The refusal rate reaches exactly 100% on the red-team set, leaving no harmful prompts answered",
          "Helpfulness / task success on benign requests did not drop as a side effect of the tuning",
          "The tuning was applied uniformly without measuring its effect on any other metric",
        ],
        correct: [0, 2],
        explanation: "Options A and C are correct together: helpfulness and harmlessness trade off, so a gain in harmful-refusal must be checked against the other axis on both fronts — did over-refusal on benign requests rise (A), and did helpfulness drop (C)? A genuine improvement is Pareto: better on the harmful-refusal axis without regressing over-refusal or task helpfulness. Option B fixates on 100%, which typically maximizes over-refusal and collapses usefulness, not meaningful safety. Option D is backwards — you must measure the effect on other metrics to know if it's a real improvement; skipping that measurement is exactly what lets a regression hide.",
      },
    ],
    takeaway: "Measure safety as a multi-dimensional, adversarial profile, never a single benchmark percentage: refusal rate on a private red-team harmful set (want high), over-refusal on benign-but-scary prompts (want low), and jailbreak attack-success across an evolving technique suite (want low) — all on leakage-controlled held-out data, plotted against helpfulness so the helpfulness↔harmlessness tradeoff is explicit. A safety change only counts if it's Pareto, and because attackers adapt, you re-red-team on every model or prompt change.",
  },
};
