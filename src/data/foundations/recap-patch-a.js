// keyPoints + recap patch (group A) — merged into RUNNER_DATA after it is built.
export const RECAP_PATCH_A = {
  "embeddings": {
    keyPoints: [
      "**Meaning becomes geometry.** Integer token IDs carry no semantic signal; embeddings map tokens to dense vectors where semantic proximity is geometric proximity.",
      "**One-hot vectors have no structure.** They remove the false ordinal relationship of integer IDs but make every token equidistant — no similarity, no meaning.",
      "**The distributional hypothesis is the training objective.** Phrases in similar contexts (co-occurring with the same neighbors) are forced into similar regions of vector space.",
      "**Cosine similarity measures the angle, not magnitude.** It scores meaning overlap between two vectors — near 1 for semantically similar text regardless of norm.",
      "**Contextual encoders handle polysemy.** ada-002 gives 'bank' different vectors in 'river bank' vs 'bank account'; static models assign one fixed vector.",
      "**Geometry reflects the training distribution.** ada-002 learned from general web text, where clinical phrasing and everyday phrasing rarely keep the same company — so domain synonym pairs can land farther apart than retrieval needs.",
    ],
    recap: [
      "**Embeddings** = semantic similarity → geometric proximity; cosine similarity scores the angle, not token-ID distance.",
      "**Geometry is bounded by training distribution** — a general-web model may never have seen a domain's synonyms sharing contexts, so the neighbor relationship never forms.",
      "**Exact-heading hits + natural-language misses** → info is indexed, model just lacks the synonym link.",
      "**Fix:** domain embedding model (BiomedBERT, MedCPT), fine-tune on query-doc pairs, or reranker — re-embed the whole index on model switch.",
    ],
  },

  "rag-pipeline": {
    keyPoints: [
      "**RAG failures are stage-specific.** Retrieval and generation break independently and cannot be fixed with the same intervention — mixing them up wastes weeks.",
      "**The attribution test comes before any code.** Ask: would this failure still occur if I fed perfect context directly, bypassing the retriever? Yes → generation; No → retrieval.",
      "**Missing conceptual retrievals are a retrieval failure.** Everyday query language never matches domain terminology in a general embedding model, so the right chunk is never produced.",
      "**Retrieval fixes are retrieval-stage.** Hybrid search (dense + BM25) plus query expansion with domain synonyms — a better generation model can't recover a chunk it never received.",
      "**Hallucinated citations are a generation failure.** The model pattern-completes citation-formatted strings from pre-training memory when the retrieved context lacks a match.",
      "**Generation fixes are generation-stage.** Constrain output to verbatim identifiers from retrieved chunks, or force 'no citation found' rather than inferring one.",
    ],
    recap: [
      "**Retrieval and generation fail independently** — treating both as one 'quality problem' leaves retrieval broken.",
      "**Attribution test:** perfect context injected directly, still fails → generation. Fixed by that → retrieval.",
      "**Missing conceptual recall → retrieval failure** — embedding model lacks the synonym link; fix: hybrid search + query expansion.",
      "**Fabricated citations → generation failure** — model completes patterns from training memory; fix: verbatim-only citation constraints.",
      "**Recall@k and answer faithfulness, measured separately** — stage-isolated evals make attribution rigorous.",
    ],
  },

  "eval-loop": {
    keyPoints: [
      "**A useful eval loop needs four properties.** Fixed dataset, automated scorer, a baseline to compare against, and a pre-committed pass/fail threshold — missing any one and it only confirms the system produces output.",
      "**Same-family judges have a thumb on the scale.** GPT-4 grading GPT-4 shares training distribution and stylistic preferences, systematically inflating scores for its own output style.",
      "**Human annotation is the gold standard.** LLM judges are acceptable at scale only when calibrated against human labels and drawn from a different model family than the system under test.",
      "**Static, accessible eval sets get contaminated.** When people who modify the system can see the 12 test inputs, they optimize for those inputs, not general quality — the eval equivalent of test-set overfitting.",
      "**Version-control the eval set separately.** Manage it independently from the system and augment with adversarial cases and real production failure queries.",
      "**No baseline means an uninterpretable number.** Without the previous version or a known reference, a passing score cannot tell you whether quality improved or degraded.",
    ],
    recap: [
      "**Eval loop = fixed dataset + independent judge + baseline + pre-committed threshold.**",
      "**Same-model judge → biased score** — favors its own output distribution; use a different model family or human labels.",
      "**Static, visible eval set → overfitting** to those inputs; version-control + augment independently.",
      "**No baseline → uninterpretable number** — can't tell improved vs degraded.",
    ],
  },


  "flashattn": {
    keyPoints: [
      "**Standard attention is memory-bandwidth-bound at long sequences.** The N×N score matrix (~512MB for 16K tokens) makes four HBM round trips per layer; CUDA cores compute faster than HBM can supply data.",
      "**SRAM is the lever.** On-chip SRAM (~20MB on an A100) is ~10× faster than HBM but too small to hold the full N×N matrix — so you must tile.",
      "**Online softmax lets you tile.** Maintaining a running max and running sum as each tile arrives computes the exact softmax without ever storing all N scores at once.",
      "**The output is bit-identical, not approximate.** No scores are dropped, thresholded, or quantized — it's the same weighted sum computed in a memory-efficient order.",
      "**Memory saving is geometric.** The N×N matrix is never materialized in HBM; memory goes from O(N²) to O(N) — at 16K tokens/32 heads that's ≈17.2GB → ≈202MB (~85×), and the exact ratio grows further as context lengthens. It's a fact about the algorithm, not an estimate.",
      "**Speed follows from fewer HBM accesses.** Round trips drop from ~2GB to ~0.1GB per layer; the speedup is from bandwidth, not faster math.",
    ],
    recap: [
      "**Standard attention is memory-bandwidth-bound** — 4 HBM round trips/layer over an O(N²) matrix.",
      "**Flash Attention tiles in on-chip SRAM**, online softmax (running max + sum) → exact result, incrementally.",
      "**Output is bit-identical** — nothing dropped, thresholded, or quantized.",
      "**Memory O(N²) → O(N)**: the N×N matrix never hits HBM; speed follows from fewer HBM accesses, not faster math.",
    ],
  },

  "prompt-regression-signals": {
    keyPoints: [
      "**Golden-set diffing catches regressions before deploy.** Run every prompt change against a fixed, representative eval set and diff outputs/scores against the previous version on those identical inputs — zero production risk, the first and cheapest line of defense.",
      "**Passive monitoring lags 24–48 hours.** Trend-based signals let a prompt change accumulate days of support tickets before an alert fires.",
      "**Fast production signals catch what golden sets miss.** Output-format compliance, toxicity spikes, factuality drops, and latency spikes each surface a broken prompt on the first bad response, before any trend forms.",
      "**A/B test every prompt change.** Route a slice of traffic to the new prompt and compare in real time; even 5% for 1 hour gives statistical signal on format and the other fast signals.",
      "**Without A/B testing you deploy blind.** You'll know when a regression started but not which change caused it if several moved at once.",
      "**Rollback is the fastest causal test.** Reverting takes seconds and costs nothing; if the regression disappears, the prompt caused it. Cluster tickets by failure type to confirm.",
    ],
    recap: [
      "**Golden-set diff before deploy** — cheapest, first line of defense.",
      "**Passive monitoring lags 24–48h** — fast signals fire on the first bad response.",
      "**Fast signals:** output-format compliance, toxicity, factuality, latency.",
      "**A/B every change** — 5% traffic, 1 hour, catches failures pre-rollout.",
      "**Rollback = fastest causal test** — seconds, free; regression resolves → prompt caused it.",
    ],
  },

  "quality-drift": {
    keyPoints: [
      "**'Nothing changed' means nothing you control changed.** LLM systems have external dependencies that shift independently of your code and config.",
      "**Silent model version updates are the most common cause.** Providers update weights behind a stable endpoint name for safety, capability, and efficiency without notice.",
      "**Knowledge-base staleness produces wrong answers.** Indexed documents go out of date; queries about changed policies or products get stale retrievals.",
      "**User distribution shift degrades quality for new cohorts.** A model strong on the original query distribution performs worse on new patterns.",
      "**Diagnose by segmenting.** If the same established users on established query types also rate lower, it's not distribution shift — the cause is systemic (model, index, or dependency).",
      "**Prevent with three instruments.** Pin model versions when supported, alert when source docs are newer than the last index rebuild, and run weekly regression evals on a fixed golden set.",
    ],
    recap: [
      "**'Nothing changed' ≠ nothing changed** — external dependencies shift independently.",
      "**Four drift sources:** silent model update, stale knowledge base, user distribution shift, third-party dependency change.",
      "**Silent model updates are the most common cause** — providers swap weights behind stable endpoint names.",
      "**Fixed golden set → constant inputs** — weekly regression evals surface model drift; pin versions to prevent it.",
    ],
  },

  "cost-attribution": {
    keyPoints: [
      "**Token-cost math tells you why; attribution tells you which team.** A single-key $180K bill is a flat number until you can trace it to the team, product, or feature that drove it.",
      "**Tag every request at call time.** Most providers expose user/metadata fields in billing exports — instrument team, use_case, environment, and user_tier.",
      "**Track the model name per request.** Different models on the same account have different per-token rates, so token counts alone can't be converted to cost.",
      "**Large bills follow a heavy tail.** Roughly 20% of requests drive 60–80% of cost; identifying them beats broadly optimizing everything.",
      "**Attribution turns one number into optimization paths.** '$180K on AI' becomes '$72K summarization, $45K search, $63K evals' — each with a distinct fix.",
      "**Instrumentation is cheap and fast.** It takes hours to add and produces full attribution within one billing cycle; without it you optimize blind.",
    ],
    recap: [
      "**Attribution needs instrumentation before the bill** — tag team + use_case at call time.",
      "**Track model name too** — per-token rates differ, so tokens alone ≠ cost.",
      "**Bills are heavy-tailed:** ~20% of requests → ~60–80% of cost; target the tail.",
      "**'$180K on AI' → per-use-case paths**, each with its own fix — hours to instrument, one billing cycle to full data.",
    ],
  },

  "managed-vs-selfhosted": {
    keyPoints: [
      "**The self-hosting savings intuition depends entirely on utilization.** You pay for the provider's markup, but the markup is only worth cutting when GPUs are busy.",
      "**Managed API is cheap at low volume.** ~$400/month at 50M tokens buys high availability, zero ops, and automatic model updates — a premium for operational simplicity.",
      "**At 50M tokens/month, self-hosted GPU utilization is ~2.6%.** 2×A100 can produce ~1.9B tokens/month; you use 50M and pay for 97.4% idle compute.",
      "**TCO is the piece the intuition misses.** Compute (~$4.3–5.8K) plus 0.25–0.5 FTE ops (~$12.5K) plus security, compliance, and model-upgrade overhead — not just raw compute.",
      "**The crossover is ~2.1–2.3 billion tokens/month for a lean team** (self-hosted TCO ÷ managed $/token: ~$16.8–18.3K ÷ ~$8/1M tokens). Below it, self-hosting is a cost increase; the scenario is $400 managed vs $16.8–18.3K self-hosted TCO.",
      "**The sunk-cost path is a real trap.** Teams keep self-hosting because the ops FTE is already allocated, even when a TCO recalculation says switch back.",
    ],
    recap: [
      "**Self-hosting savings hinge on GPU utilization**, not raw compute cost.",
      "**At 50M tokens/month, utilization ≈ 2.6%** — ~97% idle compute paid for.",
      "**Compare TCO:** +0.25–0.5 FTE ops + security/upgrade overhead — $400 managed vs ~$17K self-hosted here.",
      "**Crossover ≈ 2.1–2.3B tokens/month** — below it, self-hosting costs more; sunk-cost FTE keeps teams stuck past it.",
    ],
  },

  "enterprise-ai-cost-model": {
    keyPoints: [
      "**Multiplying pilot cost by the user ratio fails.** Enterprise user populations are heterogeneous, so a 100× multiplier on the pilot average misses the concentration effect.",
      "**The heavy-user tail drives overruns.** ~15% heavy users (3–4× average), 65% average, 20% light (0.2×) — the tail a 100-person pilot may never surface.",
      "**Measure the right pilot inputs.** Input/output tokens per session, sessions per active user per day, and daily-active-user rate — then apply the usage distribution.",
      "**Model DAU, not registered users.** At 10K users and 30% DAU, only 3K are active per day; apply usage tiers within that active pool.",
      "**Finance needs a range with a ceiling.** Produce p25/p50/p75, not a single point estimate.",
      "**A forecast without control levers is incomplete.** Per-user daily token budgets, automatic model downgrade past a threshold, and caching (15–20% near-duplicate queries) enforce the ceiling.",
    ],
    recap: [
      "**Pilot-cost × user ratio underestimates** — enterprise usage is heterogeneous, not uniform.",
      "**Heavy-user tail (~15% at 3–4× average) drives overruns** — invisible in a small pilot.",
      "**DAU × usage tiers → p25/p50/p75 range**, not a point estimate.",
      "**Pair the forecast with control levers:** per-user token budgets, auto model downgrade, near-duplicate caching.",
    ],
  },

  "vector-db-index-mechanics": {
    keyPoints: [
      "**Flat (brute-force) search is exact — O(n) per query.** Correct by definition, no tuning, fine below ~50K vectors, unacceptable at 10M since it scans everything on every query.",
      "**ANN indexes trade a little accuracy for orders-of-magnitude speed** by restricting search to a relevant subset rather than scanning everything.",
      "**HNSW navigates a multi-layer graph.** M (edges per node, fixed at build) trades memory for connectivity; efSearch (beam width, query-time) trades latency for recall — turn both up together for higher recall at more memory and latency cost.",
      "**IVF searches only the nprobe nearest clusters** out of nlist total, clustered once at build time; recall degrades for vectors near a cluster boundary that fall outside the searched clusters.",
      "**IVF pairs naturally with product quantization (PQ)** to compress stored vectors, and its batch-built clusters suit corpora that update in scheduled chunks rather than continuously.",
      "**The three-way dial is recall vs. latency vs. memory** — HNSW: high recall/low latency, memory-hungry; IVF(+PQ): smaller footprint, batch-friendly, more recall loss at boundaries; flat: your correctness baseline, never your production index above ~50K.",
    ],
    recap: [
      "**Flat = exact, O(n) per query** — correctness baseline, not a production index at scale.",
      "**HNSW: M (memory/connectivity), efSearch (latency/recall)** — both tunable, both cost something.",
      "**IVF: nlist (clusters), nprobe (clusters searched)** — smaller footprint, batch-friendly, boundary recall loss; pairs with PQ.",
      "**Pick by constraint: RAM to spare → HNSW; memory-bound + batch inserts → IVF+PQ; <~50K vectors → flat.**",
    ],
  },

  "hybrid-search-design": {
    keyPoints: [
      "**Dense search generalizes across paraphrases by design.** It can't distinguish 'semantically similar' from 'literally identical', so an exact error string matches general docs, not the specific page.",
      "**Exact technical tokens aren't synonyms.** Error messages, function names, version numbers, API endpoints — a token that doesn't literally match is wrong, not a paraphrase.",
      "**BM25 is built for literal matching.** It scores by exact term frequency and finds the document containing those exact characters, regardless of semantic similarity.",
      "**Neither method alone covers the full query distribution.** Dense handles conceptual queries, sparse handles exact-match — a technical doc tool needs both.",
      "**RRF fuses in rank space to avoid score incompatibility.** BM25 scores are unbounded and length-dependent; cosine is bounded [-1,1]. RRF = 1/(rank+k), k=60, so position 1 from either contributes equally, and a document ranked well in *both* lists can outrank one that's first in only one.",
      "**A cross-encoder reranker is the next lever, not a replacement for RRF.** It scores query+document together over the fused top-N for extra precision, at more per-query cost — a layer on top of fusion, not instead of it.",
    ],
    recap: [
      "**Dense fails exact-match; sparse fails conceptual** — need both.",
      "**Dense can't distinguish 'similar' from 'identical'** — exact error strings match general docs.",
      "**RRF fuses in rank space (1/(rank+60))** — rewards agreement across both lists, sidesteps incompatible BM25/cosine scales.",
      "**Optional next step: cross-encoder rerank the fused top-N** for extra precision.",
    ],
  },

  "metadata-filtering": {
    keyPoints: [
      "**A shared ANN index has no concept of ownership.** It returns the globally nearest vectors, including other tenants' documents — cross-tenant leakage is the default, not an edge case.",
      "**Metadata is a prerequisite, not an afterthought.** Every vector must carry structured metadata (e.g. client_id) assigned at index time to filter on it at search time.",
      "**Pre-filtering gives strong isolation but risks connectivity.** Filtering first means the ANN graph never touches other tenants — but a tiny filtered subset can degrade HNSW graph connectivity.",
      "**Post-filtering preserves ANN quality but risks leakage.** Running full search then discarding non-matches means a single filter bug lets other tenants' results pass through.",
      "**Filtering is isolation when it works, not a guarantee.** Any application-layer approach can be defeated by a code bug, missing parameter, or race condition.",
      "**Physical partitioning is the gold standard.** Separate namespaces per tenant mean no shared index to leak from; the tradeoff is that authorized cross-client queries must query and merge multiple namespaces.",
    ],
    recap: [
      "**Shared ANN index → globally nearest vectors** — cross-tenant leakage is default.",
      "**Metadata filtering = isolation only if bug-free** — an app-layer bug leaks silently.",
      "**Pre-filter risks HNSW connectivity on small subsets; post-filter risks leakage on a filter bug.**",
      "**Physical partitioning per tenant = the only infra-level guarantee** — cost: merging namespaces for cross-client queries.",
    ],
  },
};
