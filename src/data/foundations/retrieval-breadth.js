// Retrieval breadth modules — dense-vs-sparse, multi-hop, query-rewriting. Spread into foundationsRunnerData.js.
export const RUNNER_RETRIEVAL_BREADTH = {
  "dense-vs-sparse-retrieval": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Let's start with a question that sounds trivial and isn't: when you type something into a search box, how does the computer decide which documents to hand back? Take the plainest possible answer first — *count the words the query and the document have in common.* Ask for \"reset password\" and it looks for pages containing the words \"reset\" and \"password.\" Simple, fast, and it has quietly powered search for decades.\n\nBut sit with that for a second, because it has a twin weakness and a twin strength, and they pull in opposite directions. If someone searches for an exact error code like `ERR_2048_TLS`, word-counting is *perfect* — that string is so rare that the one page containing it stands out instantly. Yet if someone types \"reset password\" and the right document happens to say \"recover account credentials,\" the two share not a single word, so word-counting scores them as strangers even though they mean the same thing.\n\nSo we'll need a second idea — one that matches *meaning* rather than *words*. And here's the lovely part we'll build toward: these two ideas fail in exactly *opposite* directions, which is precisely why the mature systems use **both at once**. No need to rush; we'll take the word-matching method first, see exactly where it shines and where it falls apart, then bring in the meaning-matching method, and finish by fusing them.",
    scenario: "Now let's put all of that to work on a real one. You ship a RAG assistant over your company's internal docs, and it's great — until the support team starts asking about specific things. A user types the exact error code `ERR_2048_TLS` and the bot returns a warm, semantically-adjacent chunk about 'certificate trust problems' but misses the one runbook that names `ERR_2048_TLS` verbatim. Another user pastes a Jira ticket ID `PROJ-3391` and gets nothing useful. Yet when someone asks 'how do I reset a forgotten password,' the bot nails it even though the doc says 'recover account credentials.' Take a moment before reading on: what does that split pattern tell you? Here's the reasoning, step by step. The bot aces the paraphrase but fumbles the exact codes — which is the exact signature of a *dense/embedding-only* retriever: it matches meaning beautifully and blurs rare, precise tokens toward their semantic neighborhood ('cert trust problems'). Notice how cleanly the fix falls out once you name that: you don't need a better embedding model, you need to add back the word-matching method (BM25) that nails exact tokens, and fuse the two lists so neither blind spot wins — hybrid retrieval with Reciprocal Rank Fusion.",
    explanation: [
      "Begin from the one question retrieval must answer: *does this document match this query?* There turn out to be only two fundamentally different ways to answer it — match on the **words**, or match on the **meaning** — and because they answer the question differently, they fail in mirror-image ways. That mirror is the whole module, so start with the older, simpler answer: match on words.\n\n**Sparse / lexical retrieval** does exactly that. The classic is **BM25** (the workhorse behind Elasticsearch, Lucene, and decades of search). It represents each document as a bag of terms and scores a query-document pair by how many query terms appear in the document, weighted by two intuitions: a term that's *rare across the whole corpus* is more discriminating (that's the IDF, inverse-document-frequency, part), and a term appearing *many times in one document* matters more but with diminishing returns (the term-frequency saturation part). Because the score is built purely from term overlap, one property follows directly and defines everything downstream. ==BM25 only rewards a match when the *exact token* (or its stemmed form) is literally present. No token overlap, no score.==",
      "That exact-match property is BM25's superpower *and* its curse, and the scenario shows both faces. Its superpower: **rare, precise tokens** — an error code like `ERR_2048_TLS`, a ticket ID `PROJ-3391`, a function name `parseAuthToken`, a SKU, a legal citation. These are exactly the strings where being off by a character means a *different thing entirely*, and BM25's literal matching plus IDF weighting makes them shine — a token that appears in one document out of a million gets an enormous IDF weight, so the one doc that contains it rockets to the top. ==Hold onto that: exact/rare tokens are where lexical matching is unbeatable.==",
      "Its curse: BM25 is **blind to meaning**. 'Reset a forgotten password' and 'recover account credentials' share almost no tokens, so BM25 scores them as nearly unrelated even though they're the same request. Synonyms, paraphrases, and any query where the user's words differ from the document's words fall straight through the lexical net. This is the **vocabulary-mismatch problem**, and it's the reason pure keyword search has always felt brittle: it demands the user guess the author's exact wording.",
      "**Dense / embedding retrieval** attacks exactly that weakness. An embedding model maps the query and each document into a shared vector space where *semantic* closeness becomes geometric closeness — 'reset password' and 'recover credentials' land near each other because the model learned they *mean* the same thing, regardless of shared tokens. You retrieve by nearest-neighbor search over those vectors (via an ANN index like HNSW). This is why a dense retriever aces paraphrase questions: it is **paraphrase-robust and synonym-aware by construction**.\n\nBut it inherits the opposite failure. To generalize across wording, the embedding model *compresses* text into a smooth semantic region — and in that smoothing, a hyper-specific token like `ERR_2048_TLS` gets blurred toward its semantic neighborhood ('some TLS certificate error'). The model has likely never seen that exact code in training, so it has no sharp representation for it; it maps it to the general vicinity of 'certificate trust problems' — the classic near-miss. ==Dense retrieval trades exact-token precision for semantic reach. Notice how neatly that mirrors BM25: each is superb exactly where the other is blind.==",
      { type: "illustration", label: "Sparse vs dense — mirror-image strengths", content: `Query type                    BM25 (sparse)      Embeddings (dense)
──────────────────────────────────────────────────────────────────
"ERR_2048_TLS" (error code)   ✓✓ exact-match     ✗ blurred to
                                 rare token,          "cert trust
                                 huge IDF             problems" (near-miss)
"PROJ-3391" (ticket ID)       ✓✓ literal hit     ✗ no learned rep
"parseAuthToken" (code)       ✓✓ token present   ~ approximate
"reset forgotten password"    ✗ no token overlap ✓✓ = "recover
  vs doc "recover account          → misses          account credentials"
  credentials"                                        (same meaning)
"why is my app slow"          ~ some overlap     ✓✓ semantic match

  SPARSE  → wins on rare/exact tokens, IDs, code, jargon
  DENSE   → wins on paraphrase, synonyms, conceptual queries
  The failures are MIRROR IMAGES — which is why you often want BOTH.` },
      "Because the two methods fail in opposite directions, the mature answer is rarely 'pick one' — it's **hybrid retrieval**: run *both* a BM25 search and a dense search, then *fuse* their result lists into one ranking. The subtlety is *how* to fuse, because BM25 scores and cosine similarities live on completely different scales (a BM25 score of 14.2 and a cosine of 0.83 aren't comparable — you can't just add them). The standard, robust answer sidesteps scale entirely: **Reciprocal Rank Fusion (RRF)**. RRF throws away the raw scores and uses only each document's *rank* in each list. For a document `d`, its fused score is the sum, across every retriever, of `1 / (k + rank_d)`, where `rank_d` is that document's position in that retriever's list and `k` is a small constant (commonly ~60) that damps the influence of the very top ranks. ==A document ranked highly by *either* retriever gets a strong fused score; a document ranked highly by *both* gets the strongest. Rank-based fusion is scale-free, which is exactly why it's the default.==",
      { type: "illustration", label: "Reciprocal Rank Fusion (RRF) — worked, k=60", content: `RRF score(d) = Σ over retrievers  1 / (k + rank_d),   k = 60

Query: "ERR_2048_TLS certificate handshake failing"

BM25 ranks:            Dense ranks:
  1. runbook-2048       1. handshake-explainer
  2. tls-overview       2. cert-trust-guide
  3. cert-trust-guide   3. runbook-2048

RRF (k=60):
  runbook-2048     = 1/(60+1) + 1/(60+3) = 0.01639 + 0.01587 = 0.03226  ← TOP
  cert-trust-guide = 1/(60+3) + 1/(60+2) = 0.01587 + 0.01613 = 0.03200
  handshake-expl.  = 1/(60+1)            = 0.01639
  tls-overview     = 1/(60+2)            = 0.01613

  runbook-2048 (the exact-code doc BM25 loved) survives fusion and lands
  at the top — dense alone had buried it at rank 3. Neither retriever
  alone got it right; the FUSION did.` },
      "There's a lighter-weight alternative to always running both: **per-query-type routing**. If you can cheaply classify a query as *keyword-y* (short, contains an ID/code/exact string, few natural-language words) versus *semantic* (a conversational, paraphrase-shaped question), you can send it to the retriever that suits it — BM25 for the error code, dense for the how-do-I question — and skip the second search. Routing is cheaper than hybrid (one retrieval, not two) but riskier: a misrouted query gets the *wrong* retriever's blind spot with no fallback, and many real queries are genuinely mixed ('why is `parseAuthToken` throwing after the 2pm deploy' has both an exact token and a semantic intent). ==In practice teams often default to hybrid+RRF for robustness and reserve routing for high-volume, cleanly-separable query patterns where the latency saving is worth the risk.== The one-line takeaway to carry into any interview: sparse wins on exact/rare tokens, dense wins on meaning, their failures are mirror images, and hybrid fusion (RRF) buys you both because it's scale-free. The interactive just below lets you feel these mirror-image failures for yourself — and the production case right after it is this exact split, playing out for real on a support bot that fumbles error codes but nails paraphrases.",
    ],
    keyPoints: [
      "**Sparse (BM25) matches exact tokens; dense (embeddings) matches meaning.** BM25 scores by term overlap weighted by IDF (rare terms discriminate) and TF saturation; embeddings map text to a vector space where semantic closeness is geometric closeness. Their strengths are mirror images.",
      "**BM25 wins on rare, precise tokens** — error codes, ticket/SKU IDs, function names, legal citations — because a token in one doc out of a million gets a huge IDF weight and literal matching demands exactness. It's blind to synonyms/paraphrase (the vocabulary-mismatch problem).",
      "**Dense wins on paraphrase and synonyms** ('reset password' ≈ 'recover credentials') but *blurs* hyper-specific tokens: an unseen code like `ERR_2048_TLS` gets smoothed toward its semantic neighborhood ('cert trust problems'), the classic near-miss. It trades exact-token precision for semantic reach.",
      "**Hybrid retrieval runs both and fuses the lists; RRF is the standard fusion.** BM25 scores and cosines aren't on comparable scales, so RRF ignores raw scores and sums 1/(k+rank) across retrievers (k≈60). Rank-based = scale-free; a doc ranked high by either retriever scores well, by both scores best.",
      "**Per-query-type routing is a cheaper alternative to always running both.** Classify keyword-y (IDs/codes → BM25) vs semantic (conversational → dense) and send to the fitting retriever — one search, not two. Riskier: misrouting hits the wrong blind spot, and many queries are mixed. Default to hybrid+RRF for robustness.",
    ],
    recap: [
      "**Sparse/BM25 = exact-token match** (IDF rewards rare terms) → wins on error codes, IDs, code, jargon; blind to synonyms.",
      "**Dense/embeddings = semantic match** → wins on paraphrase ('reset password' ≈ 'recover credentials'); *blurs* rare exact tokens into their neighborhood (the near-miss).",
      "**Failures are mirror images** — which is why you often want both, not one.",
      "**Hybrid + RRF:** scores aren't comparable, so fuse by RANK: RRF(d) = Σ 1/(k+rank_d), k≈60. Scale-free; strong if either retriever ranks it high, strongest if both.",
      "**Routing** (keyword-y → BM25, semantic → dense) is cheaper (one search) but riskier (misroute = wrong blind spot, mixed queries). Default hybrid+RRF; route only clean high-volume patterns.",
    ],
    mcqs: [
      {
        question: "A user searches your RAG bot for the exact error code `ERR_2048_TLS`. The dense/embedding retriever returns a chunk about 'certificate trust problems' but misses the runbook that names `ERR_2048_TLS` verbatim. Why does the embedding retriever fail here where BM25 would succeed?",
        options: [
          "The embedding model uses a fixed context window shorter than BM25's, so the rare token got truncated before it could be indexed or matched at all",
          "BM25 internally computes dense vector representations of its own, and for this error code it happened to land on a more precise vector than embeddings",
          "Embeddings blur the rare token toward its neighborhood ('cert trust problems'); BM25 matches the literal string and its IDF weight ranks that doc highest",
          "The error code string was too short in character count for the embedding model's tokenizer to process, so it was silently dropped from the vector entirely",
        ],
        correct: 2,
        explanation: "Option C is correct: dense retrieval generalizes across wording by compressing text into a smooth semantic region, and a hyper-specific, likely-unseen token like `ERR_2048_TLS` has no sharp representation, so it's mapped to the general vicinity of 'certificate trust problems' — the classic near-miss. BM25 matches the literal token, and because that string is extremely rare across the corpus its IDF weight is huge, rocketing the one runbook that contains it to the top. Option A is wrong — the failure is semantic blurring, not context-window truncation; the code isn't dropped, it's smoothed. Option B is wrong — BM25 is a lexical bag-of-terms method and does not use embeddings internally. Option D is wrong — short strings are embeddable; the problem is the lack of a distinct learned representation for a rare token, not length.",
      },
      {
        question: "You want to combine a BM25 retriever and a dense retriever into one ranked list. Why is Reciprocal Rank Fusion (RRF) preferred over simply adding the two retrievers' scores?",
        options: [
          "BM25 scores and cosine similarities sit on different, non-comparable scales, so summing them is meaningless; RRF fuses by rank instead, staying scale-free",
          "RRF speeds up the pipeline by skipping the dense retrieval step entirely and relying only on BM25's ranked list, avoiding the scale-mismatch problem entirely",
          "RRF is preferred because it always lets the BM25 ranking win any tie between the two retrievers, since exact-token matches should outrank semantic ones",
          "Summing the two scores is mathematically impossible because cosine similarity can be negative while BM25 scores are always positive numbers only",
        ],
        correct: 0,
        explanation: "Option A is correct: a BM25 score (e.g., 14.2) and a cosine similarity (e.g., 0.83) are on entirely different scales, so directly summing them is not meaningful. RRF sidesteps this by discarding raw scores and using only each document's rank in each list, summing 1/(k+rank_d) across retrievers (k≈60). This is scale-free: a document ranked highly by either retriever gets a strong fused score, and one ranked highly by both gets the strongest. Option B is wrong — RRF still runs both retrievers; it fuses their outputs and does not skip a retrieval. Option C is wrong — RRF does not privilege BM25 by design; it symmetrically rewards rank across retrievers. Option D overstates the issue — the core problem is scale incompatibility, not merely the sign of cosine values; a weighted sum could technically be computed, it just wouldn't be meaningful.",
      },
      {
        question: "Your traffic is dominated by two clean query patterns: users pasting exact ticket IDs, and users asking conversational how-do-I questions. A teammate proposes per-query-type routing instead of always running hybrid retrieval. Which TWO statements correctly describe the tradeoff? (Select all that apply.)",
        options: [
          "Routing does one retrieval instead of two, so it's cheaper and lower-latency than always running hybrid",
          "A misrouted query hits the wrong retriever's blind spot with no fallback, which is the real risk routing accepts",
          "Routing eliminates the vocabulary-mismatch problem entirely, since every query is matched to its ideal retriever",
          "Routing requires embedding every query twice before classifying it, making it strictly more expensive than hybrid",
        ],
        correct: [0, 1],
        explanation: "Options A and B are correct together: routing classifies each query and sends it to a single fitting retriever (IDs → BM25, conversational → dense), saving the second retrieval that hybrid always pays for — cheaper and lower-latency — but that saving comes at a real cost: a misclassified query gets the wrong retriever's blind spot with no fallback, and genuinely mixed queries suffer. Option C is wrong — routing doesn't remove vocabulary mismatch; dense retrieval addresses that, and a paraphrase misrouted to BM25 still fails on it. Option D is wrong — routing runs one retrieval, not a double-embed classification step significant enough to exceed hybrid's cost; it's cheaper than hybrid, not more expensive.",
      },
    ],
    takeaway: "Sparse retrieval (BM25) matches exact tokens and wins on rare, precise strings — error codes, IDs, code, jargon — via IDF weighting, while dense/embedding retrieval matches meaning and wins on paraphrase and synonyms but blurs hyper-specific tokens into their semantic neighborhood. Their failures are mirror images, so the robust default is hybrid retrieval fused with Reciprocal Rank Fusion (RRF = Σ 1/(k+rank)), which is scale-free; reserve per-query-type routing for cleanly-separable, high-volume patterns where the latency saving beats the misrouting risk.",
  },

  "multi-hop-retrieval": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "Here's a question so simple a child could answer it, yet it quietly breaks most retrieval systems: *what's the weather in the city where the president lives?* Notice you can't answer that in one lookup. You have to do it in **two steps** — first find *which* city the president lives in, and only *then* can you look up the weather there. The second question literally doesn't exist until you've answered the first.\n\nThat two-step shape is everywhere once you start noticing it. 'How tall is the tallest building in the country that won the last World Cup?' 'What's the return policy for the brand my last order was from?' Each one hides a little chain: answer A, and A tells you what B to go ask. A human does this so automatically they barely feel the seam.\n\nBut a search engine that grabs documents in *one* shot has no way to pause in the middle, read what it found, and use it to decide what to look for *next*. And that, it turns out, is the whole difference between the questions your bot answers effortlessly and the ones where it confidently makes something up. We'll build up exactly why one-shot retrieval can't cross that seam, and what shape of system can.",
    scenario: "Now let's put this to work on a real one. Your RAG bot handles single-fact questions perfectly — 'What's our refund window?' returns the policy instantly. Then a user asks: 'What's the parental-leave policy in the country where our VP of Engineering is based?' The bot confidently answers with the *US* policy — but your VP is based in Germany. Take a moment before reading on: given everything above, what does that failure tell you? Here's the reasoning, step by step. You dig into the retrieval logs and find that no single chunk contains both 'VP of Engineering' *and* 'Germany parental leave': one chunk says the VP is based in Berlin, a totally different chunk lists Germany's leave policy, and the loud, semantically-obvious US-policy chunk drowns them both out. That's the exact fingerprint of a *multi-hop* question meeting a *single-shot* retriever — the answer needs two facts chained (VP → Germany → policy), but the pipeline only ever fired one query, so the two chunks that together answer it were never both retrieved and the model guessed. Notice how cleanly the fix falls out once you name it: you don't need a better embedding model, you need to turn the one shot into a *loop* — retrieve the VP's country, read it, then build a second query from that answer.",
    explanation: [
      "Some questions can be answered by finding *one* relevant passage. Others can only be answered by *chaining* facts that live in *different* passages — and that difference is a hard architectural boundary, not a matter of degree. Start by naming it precisely.\n\nA **multi-hop question** is one whose answer requires combining information from *two or more documents*, where you can't even *know which second document you need* until you've read the first. The scenario's question is the canonical shape: to find the parental-leave policy you must *first* discover *which country* the VP is in (hop 1: VP → Germany), and *only then* can you look up *that country's* leave policy (hop 2: Germany → policy). ==The identifying signature of a multi-hop question is a chain of dependencies: the answer to the second lookup is gated on the answer to the first.==",
      "Now see *why* your single-shot pipeline is structurally incapable of answering it. Standard RAG embeds the *whole question* into one vector and pulls the top-k *most similar* chunks in one shot. But no chunk is similar to the *entire* question here — the chunk that says 'the VP is based in Berlin' isn't about parental leave, and the chunk about German parental leave doesn't mention the VP. The single query vector is a **blurry average** of two distinct information needs, and it retrieves chunks that are mediocre matches for the *blend* rather than strong matches for *either hop*. ==Single-shot retrieval assumes the evidence for an answer is co-located or at least jointly similar to the query. Multi-hop questions violate that assumption by design.==",
      { type: "illustration", label: "Why single-shot retrieval can't bridge the hops", content: `Question: "parental-leave policy in the country where our VP of Eng is based"

SINGLE-SHOT (standard RAG):
  embed the WHOLE question → 1 query vector (a blur of 2 needs)
  top-k by similarity:
    ✗ chunk "German parental leave: 14 months..."  (no VP mention)
    ✗ chunk "VP roster: Eng VP based in Berlin"    (no leave mention)
    ✗ chunk "US parental leave: 12 weeks..."       (semantically loud, WRONG)
  → the two chunks that TOGETHER answer it are never both in top-k,
    and nothing links them. Model guesses → US policy. Wrong.

THE MISSING LINK:  VP ──(based in)──► Germany ──(leave policy)──► answer
  hop 2's query DEPENDS on hop 1's answer — you can't form it up front.` },
      "The fix is to stop treating retrieval as one shot and make it a **loop**: *decompose → retrieve → reason → retrieve again*. Concretely, the system first **decomposes** the question into an ordered chain of sub-questions ('Where is the VP of Engineering based?' then 'What is the parental-leave policy in {that country}?'). It retrieves for hop 1, *reads* the result to extract the intermediate answer ('Germany'), **substitutes** that answer into hop 2's query, retrieves again with the now-*concrete* query, and only then composes the final answer. ==The essential move is that hop 2's query is *constructed from* hop 1's retrieved result — the loop lets a later retrieval depend on what an earlier one found, which a single shot fundamentally cannot do.== This is the pattern behind IRCoT (interleaved retrieval + chain-of-thought), Self-Ask, and most agentic-RAG loops: retrieve, reason about what you now know, decide what to retrieve next.",
      { type: "illustration", label: "Iterative retrieve → reason → retrieve", content: `ITERATIVE (multi-hop) loop:

  decompose:  Q → [ Q1: "Where is the VP of Eng based?",
                    Q2: "Parental-leave policy in {A1}?" ]

  hop 1:  retrieve(Q1) ─► chunk "VP based in Berlin"
          reason ──────► A1 = "Germany"        ← intermediate answer extracted

  hop 2:  build Q2 = "parental-leave policy in Germany"   ← DEPENDS on A1
          retrieve(Q2) ─► chunk "German parental leave: 14 months..."
          reason ──────► final answer

  Each hop's query is CONCRETE (not a blur), so each retrieval is a
  strong single-fact match — the thing standard RAG is already good at.` },
      "This power is not free, and a staff-level answer names the two costs precisely. **Cost one: compounding error.** Every hop is a fallible retrieval *plus* a fallible reasoning/extraction step, and errors *multiply* down the chain. If each hop is 90% reliable, a 2-hop chain is ~0.9 × 0.9 ≈ 81% and a 3-hop chain ~73% — and worse, an error in hop 1 doesn't just lower the score, it **poisons every subsequent hop**: extract the wrong country and every downstream retrieval searches for the wrong thing with full confidence. ==Multi-hop turns retrieval into a chain, and chains are only as strong as their weakest link, times their length.==",
      { type: "illustration", label: "Compounding error and latency down the chain", content: `Per-hop reliability p = 0.90        Latency ≈ hops × (retrieve + LLM reason)

  1 hop:  0.90                        1 hop:  ~1 retrieval + 1 LLM call
  2 hops: 0.90² = 0.81                2 hops: ~2×(retrieve + reason)  ← serial!
  3 hops: 0.90³ = 0.73                3 hops: ~3×(...)                  cannot
  4 hops: 0.90⁴ = 0.66                4 hops: ~4×(...)                  parallelize

  + hop-1 error POISONS all later hops (searches for the wrong entity
    with full confidence) — not just a lower score, a wrong-track answer.

  → each hop adds a full retrieve+reason ROUND-TRIP in SERIES.
     Multi-hop is inherently slower AND more fragile than single-shot.`
      },
      "**Cost two: latency.** The hops are *inherently serial* — you can't issue hop 2 until hop 1's answer exists — so a multi-hop query pays *N* sequential (retrieve + LLM-reason) round-trips instead of one. A 3-hop question can be 3× the latency and 3× the token cost of a single-shot answer. So the real skill is **knowing when to reach for it** versus when a cheaper fix suffices. The key discriminator: ask whether the sub-facts are *co-located or jointly retrievable*. If the answer's evidence tends to live *together* (or the pieces are all *individually* similar to the query), then simply **raising top-k** — retrieving 20 chunks instead of 5 so both facts land in context and the LLM stitches them itself — is far cheaper and often enough. Multi-hop retrieval earns its cost only when the facts are *genuinely scattered* and the second lookup *cannot be formed* without the first hop's result — a true dependency chain, not just 'two facts that happen to co-occur nearby.' ==Bigger top-k solves 'the facts are spread across a few nearby chunks'; iterative multi-hop solves 'I don't even know what to search for until I've read something first.' Diagnose which one you have before paying for the loop.==",
    ],
    keyPoints: [
      "**A multi-hop question needs facts from 2+ documents chained, where you can't know the 2nd lookup until you've done the 1st.** Signature: a dependency chain (VP → Germany → leave policy). The second query is gated on the first query's answer.",
      "**Single-shot RAG is structurally incapable of it.** Embedding the whole question makes a blurry-average query vector that weakly matches the *blend* of two needs rather than strongly matching either hop, so the two chunks that together answer it are never both retrieved.",
      "**The fix is an iterative loop: decompose → retrieve → reason → retrieve.** Split into ordered sub-questions, retrieve hop 1, extract the intermediate answer, *substitute it* into hop 2's now-concrete query, retrieve again, compose. Each hop becomes a strong single-fact match. (IRCoT, Self-Ask, agentic RAG.)",
      "**Cost one — compounding error.** Each hop is a fallible retrieve + reason step, so reliability multiplies (0.9²≈0.81, 0.9³≈0.73), and a hop-1 error poisons every later hop (searches for the wrong entity confidently). Chains are as strong as their weakest link, times their length.",
      "**Cost two — serial latency, and knowing when to use it.** Hops can't parallelize (hop 2 needs hop 1's answer), so N hops = N sequential retrieve+reason round-trips. Use multi-hop only for genuine dependency chains; when facts are co-located/jointly similar, just raise top-k and let the LLM stitch — far cheaper.",
    ],
    recap: [
      "**Multi-hop = answer needs 2+ chained docs**, and hop 2's query depends on hop 1's answer (VP → Germany → leave policy).",
      "**Single-shot fails structurally:** one query vector is a blurry average of two needs; the two chunks that jointly answer are never both in top-k.",
      "**Fix = iterative loop:** decompose → retrieve → reason (extract intermediate answer) → substitute into next query → retrieve → compose. Each hop is a concrete single-fact match. (IRCoT / Self-Ask.)",
      "**Compounding error:** per-hop reliability multiplies (0.9²=0.81, 0.9³=0.73); a hop-1 error poisons all later hops with confidence.",
      "**Serial latency:** hops can't parallelize → N× round-trips + tokens. Use only for true dependency chains; if facts are co-located, just raise top-k and let the LLM stitch — cheaper.",
    ],
    mcqs: [
      {
        question: "A user asks 'What's the parental-leave policy in the country where our VP of Engineering is based?' No single chunk contains both the VP's location and that country's leave policy. Why does standard single-shot RAG fail, and what's the right architecture?",
        options: [
          "The embedding model is too small to represent both facts jointly; a larger embedding model would let a single chunk encode both the location and the policy",
          "Increasing the sampling temperature during generation would let the model creatively infer the missing chunk, hallucinating the bridge fact instead of retrieving it",
          "This question chains two facts across documents, which no retrieval-augmented system can resolve, so the right move is to reject it and ask for two questions",
          "The blurry-average query vector weakly matches the blend of two needs, so both chunks aren't retrieved; fix with a decompose-retrieve-reason-retrieve loop",
        ],
        correct: 3,
        explanation: "Option D is correct: this is a multi-hop question — the answer requires chaining the VP's country (hop 1) into the leave-policy lookup (hop 2), and you can't form hop 2's query until hop 1 is answered. Single-shot RAG embeds the whole question into one vector that is a blurry average of two needs and weakly matches the blend, so the two chunks that together answer it are never both retrieved. The fix is an iterative loop that decomposes the question, retrieves and reasons to extract the intermediate answer ('Germany'), then builds a concrete hop-2 query from it. Option A is wrong — no chunk size or model size makes two genuinely separate facts co-located; the issue is dependency, not chunking. Option B is wrong — raising temperature adds randomness, not the missing retrieval step, and risks hallucination. Option C is wrong — the question is answerable, just not by single-shot retrieval.",
      },
      {
        question: "In a multi-hop retrieval loop where each individual hop (retrieve + reason) is about 90% reliable, why is a 3-hop question meaningfully riskier than a 1-hop question — beyond just 'more steps'?",
        options: [
          "Each hop executes in parallel with the others, so any single hop's mistake is statistically averaged out and cancels against correct results elsewhere",
          "Reliability multiplies down the chain (0.9³ ≈ 0.73), and an early-hop error poisons every downstream hop — the wrong entity gets searched confidently",
          "Later hops become more reliable than earlier ones since the model accumulates more context, so overall risk actually decreases as the chain lengthens",
          "The added risk in a longer chain comes entirely from extra token cost, not from any change in the correctness of the final answer produced",
        ],
        correct: 1,
        explanation: "Option B is correct: multi-hop turns retrieval into a chain of fallible retrieve-plus-reason steps, so per-hop reliabilities multiply — roughly 0.9³ ≈ 0.73 for three hops — and, critically, an early-hop error doesn't merely lower a score, it propagates: extracting the wrong intermediate answer means every subsequent retrieval searches for the wrong entity with full confidence, producing a wrong-track answer. Option A is wrong — hops are inherently serial (each depends on the previous hop's answer), so they cannot run in parallel and errors do not cancel. Option C is wrong — later hops are not inherently more reliable and are in fact endangered by upstream errors. Option D is wrong — the chain compounds correctness risk, not just token cost.",
      },
      {
        question: "You have a question whose two supporting facts usually appear in nearby chunks and are each individually similar to the query. Which TWO statements correctly describe how to handle this cheaply, and when the costlier multi-hop loop is actually warranted? (Select all that apply.)",
        options: [
          "Raising top-k (e.g., 5 to 20) lets both co-located facts land in context so the LLM can stitch them itself, often enough when facts are jointly retrievable",
          "Lowering top-k focuses the retriever on the single best chunk, which is the right move whenever two facts might be spread across nearby chunks instead",
          "The costly iterative loop earns its keep only for genuine dependency chains, where the second lookup can't be formed until the first hop's result is known",
          "Switching from dense to sparse retrieval resolves cross-document dependency chains natively, since BM25 already searches across multiple documents per query",
        ],
        correct: [0, 2],
        explanation: "Options A and C are correct together: when sub-facts tend to co-locate or are each individually similar to the query, simply raising top-k so both land in context lets the LLM stitch them itself — far cheaper than a serial, multi-round-trip loop. The expensive iterative multi-hop pattern is worth its cost only for true dependency chains, where you can't even form the second query until you've read the first hop's result. Option B is backwards — lowering top-k reduces the chance both facts are present, worsening the problem it's meant to solve. Option D is wrong — sparse retrieval searching multiple documents doesn't resolve a cross-document dependency chain; the challenge is architectural (needing to read hop 1 before forming hop 2's query), not a dense-vs-sparse choice.",
      },
    ],
    takeaway: "A multi-hop question needs facts chained across documents where the second lookup can't be formed until the first is answered, so single-shot RAG fails — its one blurry query vector matches neither hop well. The fix is an iterative decompose→retrieve→reason→retrieve loop (IRCoT/Self-Ask) that builds each hop's query from the previous hop's extracted answer, but it pays two real costs: compounding error (per-hop reliability multiplies and early errors poison later hops) and serial latency (hops can't parallelize). Reach for it only on genuine dependency chains; when the facts are co-located, just raise top-k and let the LLM stitch.",
  },

  "query-rewriting": {
    depthTier: "core",
    interviewWeight: "medium",
    groundUp: "Think about how you actually talk to another person versus how you type into a search box. To a colleague you might just say 'refund?' and they know exactly what you mean, because they were in the room a second ago and they fill in everything you left out. A search box has no such memory and no such charity — it takes your three characters *literally* and hands back whatever happens to contain them.\n\nSo there's a quiet mismatch at the heart of every search system: the words a person *types* are almost never the best words to actually *search with*. People are terse. People say 'it' and 'that' and trust you to know what they mean. People phrase things as questions ('how much is Pro?') even though the answer they want is written as a flat statement ('Pro is \\$49/month'). The raw query is a lazy, human, context-leaning thing — and the retriever, faithfully, encodes exactly that laziness.\n\nHere's the reassuring idea we'll build toward: you don't have to make the retriever smarter to fix this. You can just *fix the query first* — quietly rewrite the sloppy thing the user typed into a clean, self-contained search key *before* it ever reaches the retriever. That family of before-the-search rewrites is what this module is about, and each technique you'll meet targets one specific way a raw query is a bad key.",
    scenario: "Now let's put this to work on a real one. Your RAG support bot is fine on clean, well-formed questions typed into a search box, but in the live *chat* product it's mediocre. A user asks 'How much does the Pro plan cost?' and the bot answers well. Then the same user follows up: 'And does *it* include SSO?' — the bot embeds 'does it include SSO,' retrieves generic SSO-setup chunks, and never connects 'it' to the Pro plan. Take a moment before reading on: given everything above, what does that failure tell you? Here's the reasoning, step by step. The bot aced the first question because it was already a good search key, and fumbled the second because 'it' is *unretrievable* — its meaning lives in the previous turn, not in the words typed, and the embedder faithfully encoded the emptiness. That's the signature of a raw query being handed to the retriever with no before-the-search rewrite. Notice how cleanly the fix falls out once you name it: you don't need a better retriever, you need a conversational rewrite pass that resolves 'it' → 'the Pro plan' *before* embedding, turning the dangling follow-up into a standalone, retrievable query.",
    explanation: [
      "Start from the definition, because it names the whole idea: **query rewriting** is any transformation applied to the user's query to turn it into a better retrieval key *before* retrieval runs. That definition only earns its keep if the raw query is genuinely a poor key — so establish *why* it usually is, from first principles.\n\nRetrieval works by similarity: the embedder turns the query into a vector and pulls the documents whose vectors sit closest. This means the query vector *is* the search — whatever the query encodes is exactly what gets matched. **But** real user queries are under-specified, conversational, and context-dependent — a bare word, a dangling pronoun, a vague 'why isn't this working' — and the embedder has no charity: it faithfully encodes *exactly what was typed*, ambiguity and all. **Therefore** the retriever isn't broken when it fails on these; it's being handed a bad key and matching it honestly. ==The retriever isn't broken; it's being fed a bad search key. Query rewriting fixes the key before it reaches the retriever.==\n\nThis reframing is what unlocks every technique below: instead of trying to make retrieval tolerate a bad key, spend a little compute up front *reshaping the query* to match how the answer is actually written in your corpus. Each of the four techniques you'll meet targets one specific way a raw query goes wrong.",
      "**Technique 1 — query expansion.** The user's terse query is enriched with related terms, synonyms, or reformulations before retrieval, widening the net so relevant docs that use *different wording* still match. 'refund' might expand to 'refund policy, return, money back, cancellation, reimbursement.' This directly attacks vocabulary mismatch (the same weakness sparse retrieval suffers): the doc says 'reimbursement,' the user said 'refund,' and expansion bridges them. It raises **recall** at some risk to precision (a too-aggressive expansion drags in loosely-related noise).",
      "**Technique 2 — HyDE (Hypothetical Document Embeddings), and read this one carefully because the twist is counter-intuitive.** The problem HyDE targets: a *question* and its *answer* often don't look alike in embedding space. 'How much does the Pro plan cost?' is phrased as a question; the document that answers it is phrased as a *statement* ('The Pro plan is \\$49/month, billed annually...'). Question-shaped and answer-shaped text can sit surprisingly far apart. HyDE's move: **ask an LLM to generate a *hypothetical answer* to the query — a fake, possibly-wrong document that just *looks like* what a real answer would look like — and then embed THAT hypothetical answer, not the original question, and use *its* vector to retrieve.** ==The retrieval key is the embedding of a generated pseudo-answer, not of the user's question. You deliberately search with answer-shaped text because answer-shaped text is what's actually sitting in your corpus.== It doesn't matter that the hypothetical answer might state the wrong price — its *shape and vocabulary* (talking about plans, pricing, billing) pull the genuinely-correct document close.",
      { type: "illustration", label: "HyDE — embed the hypothetical ANSWER, not the question", content: `STANDARD:
  user question ─► embed ─► retrieve
    "How much does the Pro plan cost?"  (question-SHAPED vector)
    ✗ real answer doc "The Pro plan is $49/mo..." is answer-SHAPED,
      sits far from a question-shaped query → weak match

HyDE:
  1. LLM generates a HYPOTHETICAL answer (may be factually wrong):
       "The Pro plan costs $30 per month and includes priority support
        and advanced analytics, billed annually..."   ← fake, but
                                                          ANSWER-shaped
  2. embed the HYPOTHETICAL ANSWER  (not the question)
  3. retrieve with THAT vector
     ✓ now the query key looks like a real pricing doc → strong match
       (the wrong "$30" doesn't matter — shape & vocabulary do the work)

  Key idea: search your corpus with answer-shaped text, because
            answer-shaped text is what your corpus is made of.` },
      "**Technique 3 — step-back prompting.** For a narrow, specific question, first ask the LLM to *step back* to a more general question, retrieve on *that*, and use the broader context to ground the specific answer. 'Which specific court handled the 2019 Acme antitrust appeal?' steps back to 'What is the appeals process for antitrust cases?' — retrieving the general principles that frame and support the specific lookup. ==Step-back trades a needle-in-haystack specific query for a broader query that reliably retrieves the *governing context*, then answers the specific question against it.==",
      "**Technique 4 — conversational query rewriting, which is the fix for your `it`/`that` problem.** In multi-turn chat, a follow-up is meaningless in isolation: 'does *it* include SSO' has no retrievable content until 'it' is resolved to 'the Pro plan' using the conversation history. The technique: before retrieving a follow-up, run an LLM pass that **rewrites the query into a standalone, self-contained form** by resolving pronouns and re-inserting the dropped context from prior turns — 'does *it* include SSO' → 'Does the **Pro plan** include SSO?' Now the retriever gets a query that actually names what it's about. ==This is why your bot failed the SSO follow-up: it embedded 'does it include SSO' literally, with no mechanism to carry 'Pro plan' forward. Conversational rewriting is that mechanism — it de-references the conversation into a self-contained query.==",
      { type: "illustration", label: "The four techniques, mapped to the failure they fix", content: `TECHNIQUE            WHAT IT DOES                       FIXES
─────────────────────────────────────────────────────────────────
query expansion      add synonyms/related terms         vocabulary
                     ("refund"→ +return +reimbursement)  mismatch, thin
                                                          queries → recall↑
HyDE                 LLM writes a hypothetical ANSWER,   question≠answer
                     embed THAT (not the question)        shape gap
step-back            generalize the query, retrieve      too-narrow /
                     governing context, then answer       needle queries
conversational       resolve "it"/"that" from history    multi-turn
rewrite              into a standalone query              follow-ups

  "does it include SSO"  ──rewrite──►  "does the Pro plan include SSO"
       (unretrievable)                   (self-contained, retrievable)` },
      "**The universal tradeoff — and the reason you don't just turn all of this on everywhere.** Every one of these techniques inserts an **extra LLM call *before* retrieval** (HyDE generates a document; conversational rewrite resolves references; step-back generalizes). That call costs **latency and money on the critical path of every query**, *before* the user has seen a single token of the answer. So the real question is always: does the **recall/quality gain justify the added latency**? ==On clean, well-specified queries, rewriting can be pure overhead — even mild harm if an over-eager expansion adds noise or HyDE hallucinates in an unhelpful direction. On conversational, terse, or ambiguous queries, it's often the difference between a useful answer and a useless one.== The mature pattern is *selective*: cheap, always-on rewrites (conversational de-referencing in a chat product is nearly mandatory), and gate the expensive ones (HyDE, step-back) behind a signal that the query needs them — short queries, low first-pass retrieval confidence, or detected ambiguity. Rewrite when the query is a bad key; skip it when the query is already good.",
    ],
    keyPoints: [
      "**Query rewriting reshapes the user's query into a better retrieval key *before* retrieval runs.** Real queries are under-specified, conversational, and context-dependent; the embedder faithfully encodes the ambiguity, so the retriever gets a bad key. Rewriting fixes the key, not the retriever.",
      "**Query expansion** adds synonyms/related terms ('refund' → +return +reimbursement +cancellation) to bridge vocabulary mismatch and raise recall — at some precision risk if over-aggressive.",
      "**HyDE embeds a hypothetical *answer*, not the question.** An LLM writes a fake, possibly-wrong answer-shaped document; you embed THAT and retrieve with its vector — because questions and answers sit far apart in embedding space, and answer-shaped text matches the answer-shaped docs in your corpus. The wrong facts don't matter; the shape/vocabulary does.",
      "**Step-back** generalizes a narrow query, retrieves the governing context, then answers the specific question against it. **Conversational rewriting** resolves 'it'/'that' from chat history into a standalone query ('does it include SSO' → 'does the Pro plan include SSO') — the fix for dangling-pronoun follow-ups.",
      "**Universal tradeoff: every technique adds an LLM call before retrieval** (latency + cost on the critical path, before the user sees any answer). Worth it on terse/ambiguous/conversational queries, pure overhead (or mild harm) on clean ones. Be selective: always-on cheap conversational rewrite; gate HyDE/step-back behind ambiguity/low-confidence signals.",
    ],
    recap: [
      "**Query rewriting = fix the search key before retrieval.** Real queries are terse, conversational, context-dependent; the embedder encodes the ambiguity faithfully.",
      "**Expansion:** add synonyms/related terms → bridges vocabulary mismatch, raises recall (precision risk if over-aggressive).",
      "**HyDE:** LLM writes a hypothetical *answer*, you embed THAT (not the question) — because answer-shaped text matches the answer-shaped docs in your corpus. Wrong facts fine; shape/vocab does the work.",
      "**Step-back:** generalize → retrieve governing context → answer the specific. **Conversational rewrite:** resolve 'it'/'that' from history into a standalone query ('does it include SSO' → 'does the Pro plan include SSO').",
      "**Tradeoff:** each technique = an extra LLM call before retrieval (latency + cost on the critical path). Worth it on ambiguous/conversational queries, overhead on clean ones. Be selective; always-on conversational rewrite, gate HyDE/step-back.",
    ],
    mcqs: [
      {
        question: "HyDE (Hypothetical Document Embeddings) improves retrieval by generating text with an LLM and embedding it. What exactly gets embedded and searched with, and why does it help even if the generated text is factually wrong?",
        options: [
          "An LLM generates a hypothetical answer, and that answer-shaped text is embedded as the retrieval key, since answer text sits close to the corpus's own answer docs",
          "The user's original question is embedded twice through the model and the two vectors are averaged, which smooths noise and produces a more stable retrieval key overall",
          "The LLM rewrites the question into cleaner, grammatically correct phrasing, and that corrected version of the question is what gets embedded and searched with",
          "The documents already stored in the corpus are re-embedded in question form so their vectors line up more closely with however the user happened to phrase it",
        ],
        correct: 0,
        explanation: "Option A is correct: HyDE has an LLM generate a hypothetical answer — a possibly-wrong, answer-shaped pseudo-document — and embeds that, using its vector as the retrieval key instead of the question's. The rationale is that a question and its answer are often phrased very differently and sit far apart in embedding space; searching with answer-shaped text aligns the query with the answer-shaped documents actually stored in the corpus. The factual wrongness of the hypothetical answer is immaterial because it's the shape and vocabulary (plans, pricing, billing) that pull the genuinely-correct document close. Option B misdescribes HyDE — it doesn't average two question embeddings. Option C describes grammatical cleanup, not generating and embedding a hypothetical answer — the result is still question-shaped. Option D inverts the mechanism — HyDE changes the query representation, not the corpus.",
      },
      {
        question: "In a multi-turn chat, a user asks about the Pro plan, then follows up 'And does it include SSO?' The bot retrieves generic SSO chunks and misses the Pro-plan connection. Which query-rewriting technique fixes this, and what does it do?",
        options: [
          "Query expansion — enrich the follow-up with SSO-related synonyms and reformulations before retrieval, pulling in a wider net of SSO chunks regardless of plan",
          "HyDE — have an LLM generate a hypothetical answer describing SSO support and embed that pseudo-document instead of the literal follow-up text itself",
          "Step-back prompting — generalize the follow-up to a broader question like 'what is SSO,' retrieve the governing context, then answer against it directly",
          "Conversational query rewriting — resolve 'it' against history and rewrite into a standalone query ('Does the Pro plan include SSO?') for a retrievable key",
        ],
        correct: 3,
        explanation: "Option D is correct: the follow-up 'does it include SSO' is meaningless to a retriever in isolation because 'it' only means 'the Pro plan' in the context of the prior turn. Conversational query rewriting runs an LLM pass that resolves the dangling pronoun using conversation history and rewrites the query into a standalone form — 'Does the Pro plan include SSO?' — which now names its subject and retrieves correctly. Option A (expansion) adds SSO synonyms but never reconnects 'it' to the Pro plan, so it still misses the link. Option B (HyDE) generates an answer-shaped document but, absent pronoun resolution, still bakes in the un-referenced 'it' and doesn't carry the Pro-plan context forward. Option C (step-back) generalizes away from the specific plan, which is the opposite of what's needed here.",
      },
      {
        question: "Your team wants to enable HyDE and query expansion on every single query in the RAG pipeline. Which TWO statements correctly capture the tradeoff to weigh first? (Select all that apply.)",
        options: [
          "Rewriting has no real downside, since every technique is designed purely to raise recall and can only ever help retrieval quality overall",
          "Each technique adds an LLM call before retrieval, so it costs latency and money on the critical path before the user sees any answer",
          "The only meaningful cost is extra storage, since every rewritten query has to be cached alongside the original for later reuse today",
          "The gain is largest on terse, ambiguous, or conversational queries, while on already-clean queries the rewrite is often pure overhead",
        ],
        correct: [1, 3],
        explanation: "Options B and D are correct together: every rewriting technique (HyDE generates a document, expansion enriches terms, conversational rewrite resolves references) inserts an extra LLM call before retrieval, adding latency and cost on the critical path of each query — paid before the user sees a single token. That cost is justified on under-specified, conversational, or ambiguous queries where recall/quality gains are large, but on already-clean, well-specified queries it's pure overhead and can even mildly hurt (an over-eager expansion adds noise; HyDE can hallucinate unhelpfully). The mature approach is selective application: cheap always-on conversational rewriting, and gating expensive techniques behind ambiguity or low-confidence signals. Option A ignores this real latency/cost tradeoff. Option C misidentifies the cost as storage rather than critical-path latency.",
      },
    ],
    takeaway: "Query rewriting reshapes an under-specified, conversational user query into a better retrieval key before retrieval runs: expansion adds synonyms to bridge vocabulary mismatch, HyDE embeds an LLM-generated hypothetical *answer* (answer-shaped text matches answer-shaped docs, even if the facts are wrong), step-back generalizes to retrieve governing context, and conversational rewriting resolves 'it'/'that' from history into a standalone query. Every technique adds an LLM call before retrieval, so apply it selectively — near-mandatory for chat follow-ups, but pure overhead on already-clean queries.",
  },
};
