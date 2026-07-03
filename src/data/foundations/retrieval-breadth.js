// Retrieval breadth modules — dense-vs-sparse, multi-hop, query-rewriting. Spread into foundationsRunnerData.js.
export const RUNNER_RETRIEVAL_BREADTH = {
  "dense-vs-sparse-retrieval": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "You ship a RAG assistant over your company's internal docs, and it's great — until the support team starts asking about specific things. A user types the exact error code `ERR_2048_TLS` and the bot returns a warm, semantically-adjacent chunk about 'certificate trust problems' but misses the one runbook that names `ERR_2048_TLS` verbatim. Another user pastes a Jira ticket ID `PROJ-3391` and gets nothing useful. Yet when someone asks 'how do I reset a forgotten password,' the bot nails it even though the doc says 'recover account credentials.' Your embedding model is doing something right and something very wrong, and you need to explain the pattern before you pick a fix.",
    explanation: [
      "There are two fundamentally different ways to decide whether a document matches a query, and they fail in mirror-image ways. Understanding the split is the whole module, so start with the older one.\n\n**Sparse / lexical retrieval** matches on the actual *words*. The classic is **BM25** (the workhorse behind Elasticsearch, Lucene, and decades of search). It represents each document as a bag of terms and scores a query-document pair by how many query terms appear in the document, weighted by two intuitions: a term that's *rare across the whole corpus* is more discriminating (that's the IDF, inverse-document-frequency, part), and a term appearing *many times in one document* matters more but with diminishing returns (the term-frequency saturation part). ==The defining property: BM25 only rewards a match when the *exact token* (or its stemmed form) is literally present. No token overlap, no score.==",
      "That exact-match property is BM25's superpower *and* its curse, and the scenario shows both faces. Its superpower: **rare, precise tokens** — an error code like `ERR_2048_TLS`, a ticket ID `PROJ-3391`, a function name `parseAuthToken`, a SKU, a legal citation. These are exactly the strings where being off by a character means a *different thing entirely*, and BM25's literal matching plus IDF weighting makes them shine — a token that appears in one document out of a million gets an enormous IDF weight, so the one doc that contains it rockets to the top. ==Notice that these are precisely the queries your embedding bot fumbled.==",
      "Its curse: BM25 is **blind to meaning**. 'Reset a forgotten password' and 'recover account credentials' share almost no tokens, so BM25 scores them as nearly unrelated even though they're the same request. Synonyms, paraphrases, and any query where the user's words differ from the document's words fall straight through the lexical net. This is the **vocabulary-mismatch problem**, and it's the reason pure keyword search has always felt brittle: it demands the user guess the author's exact wording.",
      "**Dense / embedding retrieval** attacks exactly that weakness. An embedding model maps the query and each document into a shared vector space where *semantic* closeness becomes geometric closeness — 'reset password' and 'recover credentials' land near each other because the model learned they *mean* the same thing, regardless of shared tokens. You retrieve by nearest-neighbor search over those vectors (via an ANN index like HNSW). This is why your bot aced the paraphrase question: dense retrieval is **paraphrase-robust and synonym-aware by construction**.\n\nBut it inherits the opposite failure. To generalize across wording, the embedding model *compresses* text into a smooth semantic region — and in that smoothing, a hyper-specific token like `ERR_2048_TLS` gets blurred toward its semantic neighborhood ('some TLS certificate error'). The model has likely never seen that exact code in training, so it has no sharp representation for it; it maps it to the general vicinity of 'certificate trust problems' — which is *exactly* the near-miss chunk your bot returned. ==Dense retrieval trades exact-token precision for semantic reach. That trade is the entire story of the scenario.==",
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
  1. runbook-2048       1. cert-trust-guide
  2. tls-overview       2. handshake-explainer
  3. cert-trust-guide   3. runbook-2048

RRF (k=60):
  runbook-2048     = 1/(60+1) + 1/(60+3) = 0.01639 + 0.01587 = 0.03226  ← TOP
  cert-trust-guide = 1/(60+3) + 1/(60+1) = 0.01587 + 0.01639 = 0.03226  ← tie
  tls-overview     = 1/(60+2)            = 0.01613
  handshake-expl.  =            1/(60+2) = 0.01613

  runbook-2048 (the exact-code doc BM25 loved) survives fusion and lands
  at the top — dense alone had buried it at rank 3. Neither retriever
  alone got it right; the FUSION did.` },
      "There's a lighter-weight alternative to always running both: **per-query-type routing**. If you can cheaply classify a query as *keyword-y* (short, contains an ID/code/exact string, few natural-language words) versus *semantic* (a conversational, paraphrase-shaped question), you can send it to the retriever that suits it — BM25 for the error code, dense for the how-do-I question — and skip the second search. Routing is cheaper than hybrid (one retrieval, not two) but riskier: a misrouted query gets the *wrong* retriever's blind spot with no fallback, and many real queries are genuinely mixed ('why is `parseAuthToken` throwing after the 2pm deploy' has both an exact token and a semantic intent). ==In practice teams often default to hybrid+RRF for robustness and reserve routing for high-volume, cleanly-separable query patterns where the latency saving is worth the risk.== The one-line takeaway to carry into any interview: sparse wins on exact/rare tokens, dense wins on meaning, their failures are mirror images, and hybrid fusion (RRF) buys you both because it's scale-free.",
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
          "The embedding model has a smaller context window than BM25, so it truncated the error code",
          "Embeddings compress text into a smooth semantic space, so a rare token the model never sharply learned gets blurred toward its neighborhood ('cert trust problems'); BM25 matches the literal token and, via IDF, ranks the one doc containing that rare string at the top",
          "BM25 also uses embeddings internally, so it happened to have a better vector for the code",
          "The error code was too short for the embedding model to process at all",
        ],
        correct: 1,
        explanation: "Option B is correct: dense retrieval generalizes across wording by compressing text into a smooth semantic region, and a hyper-specific, likely-unseen token like `ERR_2048_TLS` has no sharp representation, so it's mapped to the general vicinity of 'certificate trust problems' — the classic near-miss. BM25 matches the literal token, and because that string is extremely rare across the corpus its IDF weight is huge, rocketing the one runbook that contains it to the top. Option A is wrong — the failure is semantic blurring, not context-window truncation; the code isn't dropped, it's smoothed. Option C is wrong — BM25 is a lexical bag-of-terms method and does not use embeddings. Option D is wrong — short strings are embeddable; the problem is the lack of a distinct learned representation for a rare token, not length.",
      },
      {
        question: "You want to combine a BM25 retriever and a dense retriever into one ranked list. Why is Reciprocal Rank Fusion (RRF) preferred over simply adding the two retrievers' scores?",
        options: [
          "RRF is faster because it skips the second retrieval entirely",
          "BM25 scores and cosine similarities live on different, non-comparable scales, so summing them is meaningless; RRF ignores raw scores and fuses by rank — score(d) = Σ 1/(k+rank_d) — making it scale-free while still rewarding docs ranked highly by either or both retrievers",
          "RRF guarantees the BM25 result always wins ties, which is what you want for exact matches",
          "Adding scores is impossible because cosine similarity can be negative",
        ],
        correct: 1,
        explanation: "Option B is correct: a BM25 score (e.g., 14.2) and a cosine similarity (e.g., 0.83) are on entirely different scales, so directly summing them is not meaningful. RRF sidesteps this by discarding raw scores and using only each document's rank in each list, summing 1/(k+rank_d) across retrievers (k≈60). This is scale-free: a document ranked highly by either retriever gets a strong fused score, and one ranked highly by both gets the strongest. Option A is wrong — RRF still runs both retrievers; it fuses their outputs and does not skip a retrieval. Option C is wrong — RRF does not privilege BM25 by design; it symmetrically rewards rank across retrievers. Option D overstates the issue — the core problem is scale incompatibility, not merely the sign of cosine values.",
      },
      {
        question: "Your traffic is dominated by two clean query patterns: users pasting exact ticket IDs, and users asking conversational how-do-I questions. A teammate proposes per-query-type routing instead of always running hybrid retrieval. What is the correct tradeoff to state?",
        options: [
          "Routing is strictly better than hybrid because it's always more accurate",
          "Routing does one retrieval instead of two (cheaper/lower-latency) by sending keyword-y queries to BM25 and semantic queries to dense, but it's riskier — a misrouted query hits the wrong retriever's blind spot with no fallback, and mixed queries suffer; it fits here because the patterns are cleanly separable and high-volume",
          "Routing requires embedding every query twice, so it's actually more expensive than hybrid",
          "Routing eliminates the vocabulary-mismatch problem entirely",
        ],
        correct: 1,
        explanation: "Option B is correct: routing classifies each query and sends it to a single fitting retriever (IDs → BM25, conversational → dense), saving the second retrieval that hybrid always pays for — cheaper and lower-latency. The cost is robustness: a misclassified query gets the wrong retriever's blind spot with no fallback, and genuinely mixed queries (an exact token plus a semantic intent) are served poorly. It's a reasonable choice precisely when the query patterns are cleanly separable and high-volume, as described. Option A is wrong — routing is not strictly more accurate; hybrid+RRF is generally more robust. Option C is wrong — routing runs one retrieval, not a double-embed; it's cheaper than hybrid, not more expensive. Option D is wrong — routing doesn't remove vocabulary mismatch; dense retrieval addresses that, and routing can still misroute a paraphrase to BM25.",
      },
    ],
    takeaway: "Sparse retrieval (BM25) matches exact tokens and wins on rare, precise strings — error codes, IDs, code, jargon — via IDF weighting, while dense/embedding retrieval matches meaning and wins on paraphrase and synonyms but blurs hyper-specific tokens into their semantic neighborhood. Their failures are mirror images, so the robust default is hybrid retrieval fused with Reciprocal Rank Fusion (RRF = Σ 1/(k+rank)), which is scale-free; reserve per-query-type routing for cleanly-separable, high-volume patterns where the latency saving beats the misrouting risk.",
  },

  "multi-hop-retrieval": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your RAG bot handles single-fact questions perfectly — 'What's our refund window?' returns the policy instantly. Then a user asks: 'What's the parental-leave policy in the country where our VP of Engineering is based?' The bot confidently answers with the *US* policy. But your VP is based in Germany. You dig into the retrieval logs and find the problem: no single chunk in your corpus contains both 'VP of Engineering' *and* 'Germany parental leave.' One chunk says the VP is based in Berlin; a totally different chunk lists Germany's leave policy. The bot retrieved neither together, guessed, and got it wrong. You need to explain why a whole *class* of questions breaks your pipeline.",
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
          "The embedding model is too small; a larger one would put both facts in one chunk",
          "The whole question embeds to a blurry-average query vector that weakly matches the blend of two distinct needs, so the two required chunks aren't both retrieved; the fix is an iterative decompose→retrieve→reason→retrieve loop where hop 2's query ('policy in {country}') is built from hop 1's extracted answer",
          "Increasing temperature would let the model infer the missing chunk",
          "The question is unanswerable by any RAG system and should be rejected",
        ],
        correct: 1,
        explanation: "Option B is correct: this is a multi-hop question — the answer requires chaining the VP's country (hop 1) into the leave-policy lookup (hop 2), and you can't form hop 2's query until hop 1 is answered. Single-shot RAG embeds the whole question into one vector that is a blurry average of two needs and weakly matches the blend, so the two chunks that together answer it are never both retrieved. The fix is an iterative loop that decomposes the question, retrieves and reasons to extract the intermediate answer ('Germany'), then builds a concrete hop-2 query from it. Option A is wrong — no chunk size makes two genuinely separate facts co-located; the issue is dependency, not chunking. Option C is wrong — raising temperature adds randomness, not the missing retrieval step. Option D is wrong — the question is answerable, just not by single-shot retrieval.",
      },
      {
        question: "In a multi-hop retrieval loop where each individual hop (retrieve + reason) is about 90% reliable, why is a 3-hop question meaningfully riskier than a 1-hop question — beyond just 'more steps'?",
        options: [
          "Each hop runs in parallel, so errors cancel out across hops",
          "Reliability multiplies down the chain (0.9³ ≈ 0.73), and worse, an error in an early hop poisons every downstream hop — extract the wrong entity and all later retrievals confidently search for the wrong thing",
          "Later hops are always more reliable because the model has more context, so the risk actually decreases",
          "The risk comes only from token cost, not from correctness",
        ],
        correct: 1,
        explanation: "Option B is correct: multi-hop turns retrieval into a chain of fallible retrieve-plus-reason steps, so per-hop reliabilities multiply — roughly 0.9³ ≈ 0.73 for three hops — and, critically, an early-hop error doesn't merely lower a score, it propagates: extracting the wrong intermediate answer means every subsequent retrieval searches for the wrong entity with full confidence, producing a wrong-track answer. Option A is wrong — hops are inherently serial (each depends on the previous hop's answer), so they cannot run in parallel and errors do not cancel. Option C is wrong — later hops are not inherently more reliable and are in fact endangered by upstream errors. Option D is wrong — the chain compounds correctness risk, not just token cost.",
      },
      {
        question: "You have a question whose two supporting facts usually appear in nearby chunks and are each individually similar to the query. Before building a full iterative multi-hop loop, what cheaper fix should you consider, and how do you decide?",
        options: [
          "Always build the multi-hop loop; it's strictly better than any alternative",
          "Simply raise top-k (e.g., 5 → 20) so both co-located facts land in context and the LLM stitches them itself — this suffices when the facts are jointly retrievable; reserve the costly iterative loop for genuine dependency chains where the second lookup can't be formed without the first hop's result",
          "Lower top-k so the model isn't distracted by extra chunks",
          "Switch from dense to sparse retrieval, which handles multi-hop natively",
        ],
        correct: 1,
        explanation: "Option B is correct: the diagnostic question is whether the sub-facts are co-located or jointly retrievable. If both facts tend to appear in nearby chunks and are each individually similar to the query, raising top-k so both land in context lets the LLM stitch them itself — far cheaper than a serial, multi-round-trip loop. The expensive iterative multi-hop pattern earns its cost only for true dependency chains, where you can't even form the second query until you've read the first hop's result. Option A ignores the cost (serial latency + compounding error) and over-applies the loop. Option C is backwards — lowering top-k reduces the chance both facts are present, worsening the problem. Option D is wrong — sparse retrieval does not natively resolve cross-document dependency chains; the challenge is architectural, not a dense-vs-sparse choice.",
      },
    ],
    takeaway: "A multi-hop question needs facts chained across documents where the second lookup can't be formed until the first is answered, so single-shot RAG fails — its one blurry query vector matches neither hop well. The fix is an iterative decompose→retrieve→reason→retrieve loop (IRCoT/Self-Ask) that builds each hop's query from the previous hop's extracted answer, but it pays two real costs: compounding error (per-hop reliability multiplies and early errors poison later hops) and serial latency (hops can't parallelize). Reach for it only on genuine dependency chains; when the facts are co-located, just raise top-k and let the LLM stitch.",
  },

  "query-rewriting": {
    depthTier: "core",
    interviewWeight: "medium",
    scenario: "Your RAG support bot works fine on clean, well-formed questions typed into a search box. But in the live chat product it's mediocre, and the transcripts show why. A user asks 'How much does the Pro plan cost?' — the bot answers well. Then the same user follows up: 'And does *it* include SSO?' The bot embeds 'does it include SSO,' retrieves chunks about generic SSO setup, and never connects 'it' to the Pro plan. Another user just types 'refund' — three characters — and the bot can't tell if they want the policy, the process, or the deadline. The queries your users actually send are under-specified and conversational, and your retriever is taking them literally.",
    explanation: [
      "There's a gap between the query a user *types* and the query that would actually *retrieve* the right documents, and **query rewriting** is the family of techniques that transforms the former into the latter *before* retrieval runs. Start by seeing why the raw query is so often a poor search key.\n\nReal user queries are **under-specified, conversational, and context-dependent**: a bare word like 'refund', a follow-up like 'does *it* include SSO' whose meaning lives in the *previous* turn, or a vague 'why isn't this working.' Your embedding model faithfully encodes *exactly what was typed* — so it encodes the ambiguity, the dangling pronoun, the missing context. ==The retriever isn't broken; it's being handed a bad search key. Query rewriting fixes the key before it reaches the retriever.== The unifying idea across every technique below is: spend a little compute *reshaping the query* to better match how the answer is actually written in your corpus.",
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
          "The user's original question is embedded twice and averaged, reducing noise",
          "An LLM generates a hypothetical *answer* to the query, and THAT answer-shaped text is embedded and used as the retrieval key — because questions and answers sit far apart in embedding space, and the hypothetical answer's shape and vocabulary match the answer-shaped documents in the corpus, even if its facts are wrong",
          "The LLM rewrites the question to be grammatically correct, then embeds the corrected question",
          "The corpus documents are re-embedded as questions so they match the user's question",
        ],
        correct: 1,
        explanation: "Option B is correct: HyDE has an LLM generate a hypothetical answer — a possibly-wrong, answer-shaped pseudo-document — and embeds *that*, using its vector as the retrieval key instead of the question's. The rationale is that a question and its answer are often phrased very differently and sit far apart in embedding space; searching with answer-shaped text aligns the query with the answer-shaped documents actually stored in the corpus. The factual wrongness of the hypothetical answer is immaterial because it's the shape and vocabulary (plans, pricing, billing) that pull the genuinely-correct document close. Option A misdescribes HyDE — it doesn't average two question embeddings. Option C describes grammatical cleanup, not generating and embedding a hypothetical answer. Option D inverts the mechanism — HyDE changes the query representation, not the corpus.",
      },
      {
        question: "In a multi-turn chat, a user asks about the Pro plan, then follows up 'And does it include SSO?' The bot retrieves generic SSO chunks and misses the Pro-plan connection. Which query-rewriting technique fixes this, and what does it do?",
        options: [
          "Query expansion — add SSO synonyms so more SSO chunks are retrieved",
          "Conversational query rewriting — an LLM pass resolves the pronoun 'it' against the conversation history and rewrites the follow-up into a standalone query ('Does the Pro plan include SSO?') so the retriever gets a self-contained, retrievable key",
          "HyDE — generate a hypothetical answer about SSO and embed it",
          "Step-back prompting — generalize to 'what is SSO' and retrieve broadly",
        ],
        correct: 1,
        explanation: "Option B is correct: the follow-up 'does it include SSO' is meaningless to a retriever in isolation because 'it' only means 'the Pro plan' in the context of the prior turn. Conversational query rewriting runs an LLM pass that resolves the dangling pronoun using conversation history and rewrites the query into a standalone form — 'Does the Pro plan include SSO?' — which now names its subject and retrieves correctly. Option A (expansion) adds SSO synonyms but never reconnects 'it' to the Pro plan, so it still misses the link. Option C (HyDE) generates an answer-shaped document but, absent pronoun resolution, still bakes in the un-referenced 'it' and doesn't carry the Pro-plan context forward. Option D (step-back) generalizes away from the specific plan, which is the opposite of what's needed here.",
      },
      {
        question: "Your team wants to enable HyDE and query expansion on every single query in the RAG pipeline. What is the key tradeoff to weigh before doing so?",
        options: [
          "There is no tradeoff; more query rewriting always improves retrieval",
          "Each technique adds an LLM call *before* retrieval, costing latency and money on the critical path of every query before the user sees any answer — worthwhile on terse/ambiguous/conversational queries but pure overhead (or mild harm from noise/hallucination) on already-clean ones, so rewriting should be applied selectively",
          "The only cost is storage, since rewritten queries must be cached",
          "Rewriting reduces recall, so it should only be used when precision is the priority",
        ],
        correct: 1,
        explanation: "Option B is correct: every rewriting technique (HyDE generates a document, expansion enriches terms, conversational rewrite resolves references) inserts an extra LLM call before retrieval, adding latency and cost on the critical path of each query — paid before the user sees a single token. That cost is justified on under-specified, conversational, or ambiguous queries where recall/quality gains are large, but on already-clean, well-specified queries it's pure overhead and can even mildly hurt (an over-eager expansion adds noise; HyDE can hallucinate unhelpfully). The mature approach is selective application: cheap always-on conversational rewriting, and gating expensive techniques behind ambiguity or low-confidence signals. Option A ignores the real latency/cost tradeoff. Option C misidentifies the cost as storage rather than critical-path latency. Option D is wrong — expansion and HyDE generally aim to raise recall, not reduce it.",
      },
    ],
    takeaway: "Query rewriting reshapes an under-specified, conversational user query into a better retrieval key before retrieval runs: expansion adds synonyms to bridge vocabulary mismatch, HyDE embeds an LLM-generated hypothetical *answer* (answer-shaped text matches answer-shaped docs, even if the facts are wrong), step-back generalizes to retrieve governing context, and conversational rewriting resolves 'it'/'that' from history into a standalone query. Every technique adds an LLM call before retrieval, so apply it selectively — near-mandatory for chat follow-ups, but pure overhead on already-clean queries.",
  },
};
