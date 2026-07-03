// L2 case chains — Production domain.
// Schema documented in src/data/caseChains.js (the aggregator). Keep the export
// name PRODUCTION_CASE_CHAINS; the aggregator imports it by that name.
export const PRODUCTION_CASE_CHAINS = [
  {
    id: "chain-llm-serving-latency-cost-cache-autoscale",
    domain: "production",
    subtopic: "tail latency → batching → KV-cache cost → semantic-cache correctness → autoscaling",
    level: "staff",
    type: "casechain",
    title: "p99 blows the SLA — chase an LLM-serving incident down four layers",
    context: [
      "Self-hosted LLM API. A 13B model on 8×A100-40GB (tensor-parallel), served behind FastAPI + a naive per-request inference loop. ~40 req/s at peak.",
      "SLA: p99 end-to-end ≤ 2.0s. Median is fine (~0.7s) but p99 is 6.8s and climbing. Support and checkout flows are timing out.",
      "Requests are one-in-one-out: each HTTP request runs generate() to completion before the next request on that GPU begins. No batching. GPU compute utilisation reads ~30% under load.",
      "Prompts average ~600 tokens in, ~250 tokens out. Load is bursty: quiet nights, spikes at 9am and after marketing sends.",
    ],
    steps: [
      {
        symptom: "Median latency is healthy but p99 is 6.8s against a 2.0s SLA. Where is the tail coming from?",
        evidence: [
          "Per-request trace: TTFT (time-to-first-token) is ~120ms; the rest is decode — ~250 sequential token steps at ~25ms each.",
          "GPU compute utilisation ~30% under load, yet requests queue: a new request cannot start on a GPU until the current generate() finishes.",
          "The tail correlates with concurrency, not prompt length: p50 barely moves with load, p99 explodes as concurrent requests climb.",
          "nvidia-smi shows the GPUs are far from compute-bound during decode — they are mostly idle between token steps.",
        ],
        question: "The GPUs are only ~30% utilised but p99 explodes under concurrency. What is the first structural suspect?",
        options: [
          { id: "a", text: "The model is too slow — quantise to INT8 to halve per-token latency and the tail will fall in line" },
          { id: "b", text: "One-request-per-GPU serving with no batching: decode is memory-bandwidth-bound and processes one sequence at a time, so concurrent requests queue head-of-line behind whatever is currently generating — the tail is queueing delay, not compute" },
          { id: "c", text: "TTFT is the bottleneck — the prefill of 600-token prompts is what blows the tail; shorten prompts" },
          { id: "d", text: "The network/load balancer is adding latency under load — move it closer and add keep-alive" },
        ],
        correct: "b",
        finding:
          "Decode is sequential and memory-bandwidth-bound: each token step reads the whole model + KV-cache from HBM to produce one token, leaving compute mostly idle. A one-request-per-GPU loop therefore wastes the GPU AND serialises everyone — request N+1 waits for request N's full ~250-step decode before it even starts. That head-of-line queueing is exactly why p50 (an unloaded request) looks fine while p99 (a request that arrived behind others) explodes with concurrency. It is not a per-token-speed problem (option a) — quantisation speeds one stream but still serves one stream. TTFT is only ~120ms, so prefill is not the tail (option c), and the tail tracks concurrency not the network (option d).",
        whatsTested: "Whether you distinguish per-request latency from queueing latency, and recognise that low GPU utilisation + concurrency-driven tail is a batching/scheduling gap, not a model-speed or network problem.",
        antiPattern: "Reaching for quantisation or a smaller model first. That improves a single stream's speed but does nothing about serialisation — you still process one request at a time, so the tail under load barely moves and you've spent quality budget for nothing.",
        seniorFraming: "A staff engineer separates prefill (compute-bound, parallel) from decode (memory-bandwidth-bound, sequential) and reads an idle-GPU + queueing tail as a scheduler problem. The lever is continuous/in-flight batching (vLLM/TGI): interleave many sequences' decode steps in one forward pass so the GPU does real work each step and requests stop waiting in line.",
        consequence:
          "You move to vLLM with continuous batching — many sequences share each decode step, admitted and retired token-by-token. p99 drops 6.8s → 1.6s and throughput roughly triples. Then the next wall appears: as you push batch size higher to absorb the morning spike, requests start failing with CUDA out-of-memory long before compute saturates, and GPU cost per 1k requests is worse than you projected.",
      },
      {
        symptom: "Batching fixed the tail, but batch size caps out on memory (OOM) well before compute — and cost per request is high.",
        evidence: [
          "Under load, max stable batch is ~24 sequences; pushing past it triggers CUDA OOM even though compute utilisation is still ~55%.",
          "Memory profile: model weights are fixed, but KV-cache grows with (batch × sequence_length) and dominates free HBM. Long-context requests evict short ones.",
          "The serving stack pre-allocates a contiguous KV region per request sized to max_seq_len, so a 300-token request reserves the same block as a 4k-token one — most of it never used.",
          "Cost per 1k requests is ~2× the projection: you are paying for A100s that are memory-capped, not compute-capped, so extra GPUs buy little extra throughput.",
        ],
        question: "Compute has headroom but batch size is capped by memory and OOMs. What is the real constraint, and the fix?",
        options: [
          { id: "a", text: "You need more GPUs — memory scales with the fleet, so add nodes until OOM stops" },
          { id: "b", text: "Serving is KV-cache memory-bound: contiguous per-request pre-allocation to max_seq_len fragments and wastes HBM, so batch size (and thus throughput/GPU) is capped by memory not compute — fix it with paged KV-cache (PagedAttention) and/or quantised KV so cache is allocated in small blocks on demand" },
          { id: "c", text: "The model weights are too large — shard across more GPUs with higher tensor-parallel degree to free memory" },
          { id: "d", text: "Batch size is just set too high — lower max batch to a safe constant and accept the throughput" },
        ],
        correct: "b",
        finding:
          "At inference the fixed cost is weights; the variable cost is the KV-cache, which grows with batch × sequence length. When each request pre-reserves a contiguous block sized to max_seq_len, short requests waste most of their reservation and the allocator fragments — you hit OOM with compute still idle, so throughput-per-GPU (and cost) is set by memory, not FLOPs. PagedAttention allocates the KV-cache in small fixed-size pages on demand (like OS virtual memory), eliminating the over-reservation and fragmentation so far more sequences fit; quantising the KV-cache (e.g. FP8/INT8) shrinks each token's footprint further. Adding GPUs (option a) or raising tensor-parallel degree (option c) spends money to paper over waste — you'd still over-allocate per request. Just lowering batch size (option d) throws away the throughput you fought for in step 1.",
        whatsTested: "Whether you know LLM serving is usually memory-bound not compute-bound, that the KV-cache is the variable cost, and that paged/quantised KV — not more hardware — is the efficiency lever.",
        antiPattern: "Scaling out the GPU fleet to cure OOM. You pay linearly for hardware to hide a memory-efficiency bug; utilisation stays poor and cost-per-request never comes down because every request still over-reserves KV.",
        seniorFraming: "A staff engineer sizes the KV-cache budget explicitly (bytes/token × layers × heads) and treats memory as the scheduling currency. PagedAttention + quantised KV raises effective batch size on the same silicon; the win is measured in tokens/sec/GPU and $/1k-req, not in nodes added.",
        consequence:
          "Paged + FP8 KV lifts stable batch to ~90 and cuts cost/1k-req by ~2.4×. To squeeze cost further on a repetitive support workload, you add a semantic cache: embed the query, and if a stored query is within a cosine threshold, return its cached answer instead of calling the model. Hit rate hits ~35% and cost drops again — but a trickle of user reports appears: the assistant is confidently returning answers that are subtly wrong for the question actually asked.",
      },
      {
        symptom: "The semantic cache cut cost, but now it returns confidently wrong answers for near-but-not-equal queries.",
        evidence: [
          "Cache key = embedding of the raw user query; a hit is any stored query with cosine ≥ 0.92. TTL is effectively infinite (entries never expire).",
          "Failure 1: 'What is the refund window for EU orders?' hits the cached answer for 'What is the refund window for US orders?' (cosine 0.94) — same shape, materially different policy.",
          "Failure 2: 'Is the Pro plan $20/mo?' returns a cached answer generated before a price change last week — stale, because nothing invalidates entries when the underlying content changes.",
          "Offline: at threshold 0.92 the false-hit rate on a labelled near-miss set is ~9%; dropping to 0.98 nearly eliminates false hits but hit rate collapses from 35% to 6%.",
        ],
        question: "Cheap and fast, but wrong on near-misses and stale on changed content. What is actually broken?",
        options: [
          { id: "a", text: "The embedding model is too coarse — swap it for a bigger one so near-miss queries land farther apart and stop colliding" },
          { id: "b", text: "The cache is correctness-blind: a single similarity threshold trades hit-rate against false-hits with no notion of which distinctions are material, and infinite TTL with no invalidation serves content that has since changed — you need discriminating cache keys, a calibrated/verified threshold, and TTL + event-driven invalidation" },
          { id: "c", text: "The cache should be exact-match only — semantic caching is inherently unsafe, so key on the literal query string" },
          { id: "d", text: "Hit rate is too low — lower the threshold to 0.88 so the cache pays for itself" },
        ],
        correct: "b",
        finding:
          "Semantic caching trades correctness for hit-rate along one knob: raise the threshold and you shed false hits but also real hits; lower it and you buy hit-rate with wrong answers. The core defect is that cosine similarity does not encode materiality — 'EU' vs 'US' is a tiny embedding delta but a total answer difference, so no single global threshold is safe. Two fixes compound: (1) make the key discriminating — include the entities/filters that change the answer (region, plan, account tier) so materially different queries can't collide, and gate risky hits with a lightweight verification (e.g. cross-encoder or an LLM check that the cached answer actually addresses this query); (2) add TTL and event-driven invalidation so a price/policy change purges affected entries. A bigger embedder (option a) shifts the threshold but never removes the correctness/hit-rate tradeoff. Exact-match (option c) throws away the whole benefit. Lowering the threshold (option d) maximises exactly the false hits users are reporting.",
        whatsTested: "Whether you treat a semantic cache as a correctness system, not just a hit-rate optimisation — reasoning about cache-key design, threshold calibration/verification, and invalidation/TTL rather than tuning one similarity number.",
        antiPattern: "Tuning the single cosine threshold to 'balance' hit-rate and errors. There is no safe global value because similarity ≠ materiality — you either ship wrong answers or lose the savings; the real fix is key design + verification + invalidation.",
        seniorFraming: "A staff engineer designs the cache key around the fields that change the answer, calibrates the admit threshold on a labelled near-miss set (and verifies borderline hits), and wires invalidation to content changes with a TTL floor. Correctness is a gate on the cache, not an afterthought.",
        consequence:
          "You rebuild the cache: entity-aware keys, a calibrated threshold with a cross-encoder check on borderline hits, and event-driven invalidation on content updates. False-hit rate falls from ~9% to ~0.5% while hit rate holds near 30%. Then a marketing send at 9am triggers a 5× traffic spike — and the fleet, which scales from a low floor, thrashes: pods stuck in load for minutes, the queue backs up, p99 blows the SLA again and some requests 503.",
      },
      {
        symptom: "A traffic spike causes autoscaling thrash and cold-start collapse: pods take minutes to load the model, the queue overflows, requests 503.",
        evidence: [
          "Autoscaler is CPU-utilisation HPA on the serving pods. During decode, CPU is low, so HPA barely scales even as GPU queue depth explodes.",
          "Cold start: a new GPU pod pulls a ~26GB image + weights and warms CUDA/vLLM — ~3–4 minutes before it serves a token. Scale-from-a-low-floor can't add capacity fast enough for a 5× spike.",
          "During the gap, every request is admitted and queued; the queue grows unbounded, latency for even simple requests climbs past the timeout, and clients start getting 503s — a metastable collapse.",
          "After the spike, the autoscaler over-corrects and adds pods just as load falls, then tears them down — oscillation (thrash).",
        ],
        question: "The system falls over on spikes despite healthy steady-state. What combination actually fixes it?",
        options: [
          { id: "a", text: "Raise the HPA target and add more replicas permanently — over-provision for the worst spike so you never scale under load" },
          { id: "b", text: "Autoscale on the wrong signal and can't absorb burst: scale on queue depth / GPU concurrency (not CPU), pre-warm a headroom buffer and cut cold-start (smaller image, pre-baked weights, snapshot/faster load) so scale-up beats the spike, and add admission control / load-shedding so an overloaded system sheds or queues with a bound instead of collapsing" },
          { id: "c", text: "The model load is the whole problem — keep every possible pod always-on (scale-to-many, never to floor) so there is never a cold start" },
          { id: "d", text: "Clients are retrying and amplifying load — just add exponential backoff on the client and the queue will drain itself" },
        ],
        correct: "b",
        finding:
          "Three faults combine into a metastable collapse. (1) Wrong scaling signal: CPU-HPA is blind to GPU-bound serving, so it doesn't react to the real pressure — queue depth / in-flight requests / GPU concurrency is the signal that leads the spike. (2) Cold start too slow: minutes to pull image + load weights + warm CUDA means scale-up arrives after the spike has already overrun the queue; you fix it by shrinking the cold path (slim image, weights pre-baked/on fast local storage, CUDA/graph warm, snapshot restore) and keeping a small pre-warmed headroom buffer above steady state. (3) No back-pressure: an admit-everything queue grows unbounded until latency crosses the timeout and the whole system 503s; admission control + load-shedding (bounded queue, reject/deprioritise when over capacity, degrade gracefully) keeps the served fraction fast instead of failing everyone. Permanent over-provisioning (option a) and always-on-everything (option c) 'work' only by paying peak cost 24/7 — they don't fix the wrong signal or the collapse dynamics. Client backoff (option d) helps amplification but a correctly-timed backoff still can't conjure capacity during a 4-minute cold start.",
        whatsTested: "Whether you autoscale LLM serving on the right (load-leading) signal, treat cold-start as a first-class latency to engineer down, and add load-shedding so the system degrades gracefully instead of collapsing — rather than brute-forcing with permanent over-provision.",
        antiPattern: "Permanently over-provisioning to the peak (or keeping everything always-on). You pay peak GPU cost around the clock, undoing the KV/cache savings from the earlier layers, and still collapse if a spike exceeds the buffer because the scaling signal and back-pressure are still wrong.",
        seniorFraming: "A staff engineer scales on queue depth / concurrency with a pre-warmed headroom buffer, drives cold-start toward seconds (pre-baked weights, image slimming, snapshot/warm pools), and makes the system defend itself with admission control + graceful degradation. The goal is to bend the load curve and bound the failure, not to buy your way past every spike.",
        consequence: null,
      },
    ],
    diagnosis:
      "An LLM-serving stack that was correct in the small but missing every scaling layer: no batching (queueing tail), memory-wasteful KV-cache (memory-bound cost), a correctness-blind semantic cache (wrong/stale hits), and spike-fragile autoscaling on the wrong signal with slow cold-start and no back-pressure. Each fix removed one wall and exposed the next.",
    explanation:
      "The chain compounds because each optimisation shifts the binding constraint. Fixing the tail with continuous batching pushed the system from compute-idle to memory-bound, surfacing the KV-cache cost wall. Fixing memory with paged/quantised KV made higher throughput cheap enough that a semantic cache became worthwhile — which introduced a correctness surface (materiality-blind similarity + no invalidation). Making the cache correct restored trust but did nothing for burst dynamics, so the first real traffic spike exposed autoscaling that read the wrong signal, couldn't cold-start in time, and had no load-shedding — a metastable collapse. No single dashboard shows this stack: p50 hid the queueing tail, compute utilisation hid the memory bound, hit-rate hid the correctness bug, and steady-state health hid the spike fragility. Each layer only became visible once the one above it was resolved.",
    fix:
      "Serve LLMs as an ordered stack, not a single generate() loop: (1) continuous/in-flight batching (vLLM/TGI) so decode interleaves many sequences and requests stop queueing head-of-line; (2) paged KV-cache (PagedAttention) + quantised KV so batch size is bound by real memory need, not max_seq_len over-reservation — measure tokens/sec/GPU and $/1k-req; (3) a correctness-gated semantic cache — entity/filter-aware keys, a threshold calibrated on a near-miss set with verification on borderline hits, and TTL + event-driven invalidation; (4) autoscale on queue depth / GPU concurrency with a pre-warmed headroom buffer, drive cold-start down (slim image, pre-baked weights, snapshot/warm pools), and add admission control + graceful load-shedding so spikes degrade instead of collapse. Instrument p99 (not just p50), memory headroom, cache false-hit rate, and queue depth — no single metric reveals the chain.",
    source: "Authored · GSL L2 Case Chain",
  },
];
