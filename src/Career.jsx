import { useState } from "react";
import HowTo from "./HowTo";
import { Icon } from "./Icon.jsx";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SYSTEM_DESIGN_PROMPTS = [
  {
    id: "support",
    title: "AI Customer Support System",
    brief: "Design an LLM-powered customer support system for an e-commerce company with 10M users and 50K daily support queries.",
    scale: "10M users · 50K queries/day",
    components: [
      { id: "intent", label: "Intent classifier / router", must: true, explanation: "Routes simple queries (order status → rule-based) vs. complex (complaints → LLM). Saves 40-60% LLM cost." },
      { id: "rag", label: "RAG over FAQ / policy docs", must: true, explanation: "LLM needs grounded answers about policies, products. Without RAG, hallucination rate on policy questions is high." },
      { id: "guardrails", label: "Input + output guardrails", must: true, explanation: "Users will try prompt injection. Output must be checked for PII, off-topic responses, harmful content before sending." },
      { id: "escalation", label: "Human escalation path with context handoff", must: true, explanation: "LLM will fail on edge cases. Human agent needs full conversation context — cold handoff destroys UX." },
      { id: "observability", label: "Observability: latency, hallucination rate, CSAT", must: true, explanation: "You can't improve what you don't measure. Hallucination rate is especially critical for a customer-facing system." },
      { id: "cache", label: "Semantic cache for repeated queries", must: false, explanation: "At 50K queries/day, many are repetitions ('track my order'). Caching saves cost and reduces latency significantly." },
      { id: "ab", label: "A/B testing framework for prompt variants", must: false, explanation: "You'll iterate on prompts. Shadow deployment lets you test new prompts without risking production quality." },
      { id: "feedback", label: "User feedback loop (thumbs up/down)", must: false, explanation: "Cheapest source of eval signal. User thumbs-down becomes your test set for regression testing." },
    ],
    studio: {
      clarify: {
        prompt: "Before you design anything, what do you ask the interviewer? Pick the questions that actually change the architecture — then reveal which ones a strong candidate leads with.",
        questions: [
          { q: "What fraction of the 50K daily queries are 'where's my order' vs. genuine complaints?", good: true, why: "This is the single most architecture-shaping question. If 60% are order-status lookups, you route those to a deterministic path and never pay for an LLM call — it's the difference between a $X and a 3X monthly bill." },
          { q: "What's the acceptable latency, and is this real-time chat or async (email/ticket)?", good: true, why: "Real-time chat forces streaming + a semantic cache + tight P95; async tolerates a slower, higher-quality pipeline. You can't pick components without knowing which world you're in." },
          { q: "What happens today when the bot is wrong — is there a human fallback, and what's the tolerance for a bad answer?", good: true, why: "Defines how hard your guardrails + escalation path must be. A regulated or high-stakes domain means fail-closed; a low-stakes FAQ can fail-open. This sets the whole safety posture." },
          { q: "Which LLM provider are we contractually allowed to use?", good: false, why: "Reasonable to confirm eventually, but it doesn't shape the architecture — it's a config choice. Leading with it signals you're picking tools before understanding the problem." },
          { q: "What color should the chat widget be?", good: false, why: "Out of scope for a systems round. Asking it burns your credibility and your clarify budget." },
        ],
      },
      deepDive: {
        prompt: "Pick one component to go deep on. Here's the staff-level tradeoff on the highest-leverage one — the intent router.",
        component: "Intent classifier / router",
        text: "The router is where cost and quality are won or lost, and the tradeoff is precision vs. recall on the 'send to LLM' decision. Route too aggressively to the cheap deterministic path and you'll deflect a genuine complaint with a canned 'track your order' reply — a CSAT disaster that's invisible in your cost dashboard. Route too conservatively (everything to the LLM) and you've paid for nothing. The staff move: make the router itself cheap (a small classifier or a GPT-4o-mini call, not the flagship model), tune its threshold against *labeled* misroutes, and — critically — make misrouting recoverable: if the deterministic path can't confidently resolve, it escalates *into* the LLM path rather than dead-ending. You measure it not by classifier accuracy but by end-to-end resolution rate and the false-deflection rate on complaints.",
      },
      scale: {
        prompt: "It's 10x — 500K queries/day, a product launch spike, a viral complaint thread. What breaks first? Reveal the staff answer.",
        text: "Three things break, in order. (1) **LLM provider rate limits + cost** — a 10x spike hits your token-per-minute quota and your budget simultaneously; the semantic cache stops being a nice-to-have and becomes load-bearing (a viral 'is my order affected?' thread is thousands of near-identical queries — cache them once). (2) **The human escalation queue** — at 10x, even a 5% escalation rate floods your support team; you need graceful degradation (a longer but still-grounded LLM answer) rather than instantly escalating, or the humans become the bottleneck. (3) **Observability blind spots** — hallucination rate that was 'fine' at 50K is now producing 10x the absolute number of wrong answers; without per-intent quality dashboards you won't see *which* query type degraded. The bottleneck isn't compute — it's the human queue and the provider quota.",
      },
      defend: {
        prompt: "Defend a tradeoff: The PM wants to remove output guardrails to cut 200ms of latency. Argue your position, then reveal the staff answer.",
        text: "Hold the line, but quantify it. Output guardrails on a customer-facing system aren't latency overhead — they're the thing standing between you and a screenshot of your bot leaking another customer's PII, or emitting a policy-violating promise, going viral. The staff framing: don't argue 'guardrails are important' (weak); argue the expected cost. One PII-leak incident costs more than the aggregate latency savings across millions of queries, and it's a *tail* risk you can't undo. The compromise that shows judgment: keep the guardrail but make it cheaper — run PII/policy checks as a fast regex + small-model pass (sub-50ms), reserve the expensive moderation-model call for flagged responses only, and run it *concurrently* with streaming the first tokens so the user-perceived latency is near-zero. You don't remove the guard; you make removing it unnecessary.",
      },
    },
  },
  {
    id: "search",
    title: "Enterprise AI Search",
    brief: "Design a semantic search system for a B2B SaaS company with 500K documents, serving 5K internal users.",
    scale: "500K docs · 5K users",
    components: [
      { id: "embedding", label: "Embedding pipeline for document ingestion", must: true, explanation: "Need to encode all 500K docs into vectors. Pipeline handles chunking, embedding, and upsert to vector DB." },
      { id: "vectordb", label: "Vector database with metadata filters", must: true, explanation: "ANN search at 500K scale needs a purpose-built vector DB (Pinecone, Weaviate). Metadata filters for date, team, doc type." },
      { id: "reranker", label: "Reranker for precision on top-k results", must: true, explanation: "ANN retrieval is approximate. Cross-encoder reranker runs on top-5 to find the actually most relevant chunk." },
      { id: "hybrid", label: "Hybrid search: dense + keyword (BM25)", must: true, explanation: "Pure semantic search misses exact keyword matches (product IDs, names). BM25 hybrid captures both." },
      { id: "access", label: "Access control: only show docs user can see", must: true, explanation: "Critical for B2B. Sales docs shouldn't be visible to support. Filter at query time, not just index time." },
      { id: "syncing", label: "Incremental index sync for new documents", must: false, explanation: "Documents are added daily. Full re-index is expensive. Incremental sync keeps search fresh without cost spike." },
      { id: "analytics", label: "Search analytics: zero-result queries, click-through", must: false, explanation: "Zero-result queries tell you where your knowledge base has gaps. Click-through measures ranking quality." },
      { id: "llm_answer", label: "LLM synthesis layer for direct answers", must: false, explanation: "Optional RAG step: take top-3 chunks, ask LLM to synthesize a direct answer. More user-friendly but adds latency/cost." },
    ],
    studio: {
      clarify: {
        prompt: "500K docs, 5K internal users. What do you ask before designing? Pick the architecture-shaping questions.",
        questions: [
          { q: "What's the sensitivity model — do different users have access to different document sets?", good: true, why: "For B2B this is make-or-break. If access is per-user, you must filter at query time inside the retrieval, not post-filter the results — that decision cascades into your vector DB choice (needs metadata filters) and your whole security posture." },
          { q: "How often do documents change, and do users expect new docs to be searchable immediately?", good: true, why: "Drives your indexing architecture. 'Searchable within the hour' allows batch re-embedding; 'immediately' forces an incremental sync pipeline. It changes the pipeline from a cron job to a streaming system." },
          { q: "Do users want ranked links (find the doc) or synthesized answers (RAG)?", good: true, why: "These are two different products. Ranked search needs a great reranker; a synthesized-answer product adds an LLM layer, grounding, hallucination risk, and latency. Building the wrong one wastes the whole quarter." },
          { q: "Should we use Pinecone or Weaviate?", good: false, why: "Tool selection, not architecture. Decide this after you know the access-control and scale requirements — leading with it is picking the answer before the question." },
          { q: "What's the company's logo color scheme?", good: false, why: "Irrelevant to a retrieval-systems design. Out of scope." },
        ],
      },
      deepDive: {
        prompt: "Go deep on one component. Here's the staff take on hybrid search — the piece candidates most often hand-wave.",
        component: "Hybrid search (dense + BM25)",
        text: "The tradeoff candidates miss: dense (semantic) retrieval and sparse (BM25 keyword) retrieval fail on *opposite* queries, so you can't pick one. Dense search nails 'documents about terminating a vendor relationship' but whiffs on 'contract #A-4471' because an embedding of a product ID is meaningless. BM25 nails the exact ID but can't match paraphrases. The staff move is fusion, not choosing: run both, then combine with Reciprocal Rank Fusion (RRF) — which merges rankings without needing to calibrate the two scores onto the same scale (the reason naive score-addition fails: cosine similarity and BM25 scores aren't comparable magnitudes). Then the reranker cleans up the fused top-20. The subtle production detail: for an internal enterprise corpus full of names, IDs, and jargon, the BM25 leg often contributes *more* than people expect — under-weighting it is a common silent quality bug.",
      },
      scale: {
        prompt: "10x the corpus — 5M docs, and a big customer imports their whole SharePoint overnight. What breaks? Reveal.",
        text: "(1) **Ingestion, not query, is the first casualty** — a 5M-doc bulk import will saturate your embedding pipeline; if it's synchronous you get backpressure and the live index goes stale, if it's naive you blow your embedding-API budget in a night. You need a rate-limited, resumable, batched ingestion queue. (2) **ANN index build/refresh time** — at 5M vectors, rebuilding or heavily updating the index is no longer instant; you need incremental upserts and possibly index sharding, and you must decide what 'freshness' SLA you actually owe users. (3) **Access-control filtering cost** — at 5M docs with per-user ACLs, a naive post-filter means you over-fetch massively to still return k results after filtering; the fix is filtering *inside* the ANN search (metadata pre-filter), which is exactly why the vector-DB choice in the clarify stage mattered. The bottleneck is the write path and the filter, not read latency.",
      },
      defend: {
        prompt: "Defend a tradeoff: A senior eng says 'skip the reranker, it adds 300ms and the ANN results are already good enough.' Argue, then reveal.",
        text: "Concede the latency is real, then reframe what the reranker buys. ANN retrieval is *approximate by construction* — it trades recall for speed, so its top result is often not the actually-most-relevant chunk, just a close-enough neighbor. On an enterprise corpus where the difference between the right contract clause and a similar-but-wrong one is a real business error, top-1 precision is the whole product. The staff argument isn't 'rerankers are good' — it's: measure it. Run your eval set with and without the reranker and show the precision@1 delta; if it's large (it usually is on heterogeneous corpora), 300ms is a trivial price for correctness. The judgment move that wins the room: make the reranker *conditional* — only rerank when the ANN scores are close together (ambiguous), skip it when the top result dominates. You keep the quality where it matters and the latency where it doesn't.",
      },
    },
  },
  {
    id: "codegen",
    title: "Internal Code Generation Tool",
    brief: "Design an AI code assistant for a 2,000-engineer organization, integrated into their IDE.",
    scale: "2K engineers · IDE plugin",
    components: [
      { id: "context", label: "IDE context: open files, cursor position, imports", must: true, explanation: "Code gen without file context produces generic output. IDE plugin must send relevant file fragments, not just the current line." },
      { id: "coderag", label: "RAG over internal codebase + docs", must: true, explanation: "Engineers work with proprietary frameworks. RAG over the internal repo generates code that matches actual patterns." },
      { id: "streaming", label: "Streaming response for low perceived latency", must: true, explanation: "Engineers won't wait 4 seconds for a suggestion. Streaming shows tokens as they arrive, making it feel fast." },
      { id: "pii_code", label: "Filter secrets/credentials from context sent to LLM", must: true, explanation: "IDE plugin will see .env files, API keys, auth tokens. Must strip these before sending context to a third-party model API." },
      { id: "telemetry", label: "Acceptance rate + edit distance telemetry", must: true, explanation: "Core quality metric: what % of suggestions are accepted? Edit distance after acceptance tells you if code was actually useful." },
      { id: "local", label: "Local model fallback for sensitive repos", must: false, explanation: "Some repos can't be sent to external APIs (regulated industries). Local/self-hosted model as fallback." },
      { id: "finetune", label: "Fine-tuned model on internal codebase", must: false, explanation: "For large orgs, fine-tuning on internal patterns dramatically improves suggestion quality and style conformity." },
      { id: "review", label: "AI code review integration in CI/CD", must: false, explanation: "Extend the value beyond autocomplete: scan PRs for bugs, style violations, security issues before human review." },
    ],
    studio: {
      clarify: {
        prompt: "2,000 engineers, IDE plugin. What do you ask first? Pick the questions that shape the design.",
        questions: [
          { q: "Are there repos that legally cannot leave our infrastructure (regulated, customer data)?", good: true, why: "This single question can force a self-hosted / local-model path for a subset of repos, which is a fundamentally different architecture from 'call a third-party API.' It has to be asked before you design the inference path." },
          { q: "Is this autocomplete (inline, sub-second) or chat (ask-a-question)? Both?", good: true, why: "Autocomplete has a brutal latency budget (engineers won't wait >~1s) forcing streaming + small/fast models; chat tolerates a slower, RAG-heavy path. They're different systems sharing a plugin." },
          { q: "How do we measure success — is it acceptance rate, retention, or self-reported time saved?", good: true, why: "Defines your telemetry from day one. Acceptance rate is measurable and honest; 'time saved' is a survey. Picking the metric shapes what you instrument and how you'll prove ROI to justify the spend." },
          { q: "Should we fine-tune or use the base model?", good: false, why: "Premature. Fine-tuning is a v2 optimization decided by data volume and measured need — leading with it skips the actual design of context assembly and latency, which matter far more first." },
          { q: "Which IDE theme do most engineers use?", good: false, why: "Irrelevant to the system design. Out of scope." },
        ],
      },
      deepDive: {
        prompt: "Go deep on one component. Here's the staff take on the secret/credential filter — the one that becomes a headline if it's wrong.",
        component: "Filter secrets/credentials from context",
        text: "The tradeoff is completeness vs. false-positive drag, and the stakes are asymmetric. The IDE plugin sees whatever the engineer has open — .env files, hardcoded keys, auth tokens, customer data in a test fixture. Every one of those can get shipped to a third-party model API as 'context.' Miss one and you've leaked a production credential to an external vendor; that's an incident, possibly a breach-disclosure. But scrub too aggressively (redact anything that *looks* like a secret) and you strip legitimate code, degrading suggestions. The staff move: layered detection — fast entropy + regex for known key formats (AWS, GitHub, private-key headers) as a hard block, plus a denylist of file globs (`.env`, `*_secret*`, credential paths) that never leave the machine at all. Crucially, this runs *client-side, before* the context leaves the developer's machine — you cannot rely on scrubbing at the server, because by then it's already in transit. And you fail *closed*: if the scrubber errors, you send less context, never more.",
      },
      scale: {
        prompt: "10x adoption — 2,000 engineers all coding at once, plus a new giant monorepo. What breaks? Reveal.",
        text: "(1) **Context-retrieval latency on the monorepo** — RAG over a huge internal codebase means your retrieval step now dominates the latency budget; at inline-autocomplete speeds this is the first thing to blow the P95, and you'll need aggressive caching of embeddings + repo-local pre-indexing. (2) **Per-seat cost at concurrency** — 2,000 engineers each firing autocomplete every few keystrokes is enormous request volume; without model routing (cheap model for trivial completions, flagship only for complex chat) and debouncing, the token bill is unsustainable. (3) **The telemetry pipeline itself** — acceptance-rate + edit-distance events from 2,000 engineers is a high-volume stream; if you instrumented it naively it becomes its own scaling problem, and losing that data means you're flying blind on the one metric that justifies the project. The bottleneck is retrieval latency and request concurrency, not the model.",
      },
      defend: {
        prompt: "Defend a tradeoff: Leadership wants to fine-tune a model on the whole codebase 'for better suggestions' before launch. Argue, then reveal.",
        text: "Push back on sequencing, not on the idea. Fine-tuning before you've shipped anything is optimizing a system you haven't measured. The staff argument: you don't yet know whether suggestion quality is limited by the *model* or by *context assembly* — and in practice it's almost always context (the model is fine; it just can't see the right files). Fine-tuning is expensive, slow to iterate, and freezes to a snapshot of a codebase that changes daily, so it drifts stale. The move that shows judgment: ship v1 with strong RAG-based context injection and full telemetry, *measure* acceptance rate, then look at the failures — if they're 'model doesn't know our internal framework idioms' you have a fine-tuning case with evidence; if they're 'wrong file retrieved' fine-tuning wouldn't have helped at all. You're not saying no to fine-tuning; you're saying earn it with data, and RAG gets you 80% of the value this quarter instead of next.",
      },
    },
  },
  {
    id: "multimodal_search",
    title: "Multimodal Product Search",
    brief: "Design an AI search system for an e-commerce platform that accepts both text and image queries (e.g., 'find something similar to this photo').",
    scale: "50M products · text + image queries",
    components: [
      { id: "clip", label: "Multimodal embedding model (CLIP or similar)", must: true, explanation: "CLIP-style models encode both text and images into the same vector space, enabling cross-modal similarity. Without this, text and image queries are incomparable." },
      { id: "indexes", label: "Separate vector indexes for text, image, and cross-modal", must: true, explanation: "Text-only queries should hit the text index for highest precision. Image queries hit the image index. Hybrid queries need a fused cross-modal index. One index for all three creates precision loss." },
      { id: "router", label: "Query type router (text-only vs image vs hybrid)", must: true, explanation: "Routing correctly determines which index and retrieval path to use. A text query through the image index loses ranking quality. Misrouting is invisible and hard to debug." },
      { id: "reranker", label: "Reranker that handles cross-modal relevance", must: true, explanation: "ANN retrieval is approximate. Cross-modal reranking (e.g., re-scoring image results with a text-visual relevance model) is essential for precision at top-5." },
      { id: "preprocess", label: "Image preprocessing pipeline", must: false, explanation: "Resizing, format normalization, and EXIF stripping improve embedding quality and reduce compute cost. Important for production but can start without it." },
      { id: "fallback", label: "Fallback to text-only for unsupported image formats", must: false, explanation: "Not all images are embeddable (corrupt, too small, unsupported format). Graceful degradation to text-only prevents hard failures." },
      { id: "ab_modal", label: "A/B test text vs multimodal relevance", must: false, explanation: "Multimodal isn't always better — for precise product name searches, pure text often wins. A/B testing lets you route by query type once you have data." },
    ],
    studio: {
      clarify: {
        prompt: "50M products, text + image queries. What do you ask before designing? Pick the sharp questions.",
        questions: [
          { q: "What's the query mix — mostly text, mostly 'find similar to this photo', or a real blend?", good: true, why: "Determines where you invest. If 90% of queries are text, a heavy multimodal index is over-engineering; if image-first is the differentiator, the CLIP-style pipeline is the core product. The mix decides the architecture's center of gravity." },
          { q: "For image queries, is 'similar' about visual style, exact product match, or category?", good: true, why: "These need different embeddings and rerankers. 'Exact match' (find this exact SKU) is near-duplicate detection; 'visual style' is aesthetic similarity; 'category' is coarse. Building the wrong notion of similarity makes results feel broken even when retrieval 'works'." },
          { q: "What's the catalog churn — how often do products get added/removed/re-priced?", good: true, why: "50M products with high churn means the embedding + index pipeline is a continuous system, not a one-time batch. It shapes whether you need incremental re-embedding and how stale results can be." },
          { q: "Should we use CLIP or a newer multimodal model?", good: false, why: "Model selection, not architecture. The interesting decisions (routing, separate indexes, reranking) are model-agnostic — leading with the model skips them." },
          { q: "How many products should show per page?", good: false, why: "A UX/product detail, not a systems-design decision. Out of scope for this round." },
        ],
      },
      deepDive: {
        prompt: "Go deep on one component. Here's the staff take on the query-type router — the invisible failure point.",
        component: "Query-type router (text / image / hybrid)",
        text: "The router decides which index and retrieval path a query takes, and its failures are *silent* — that's what makes it staff-level. Send a precise text query ('Nike Air Max 90 size 10') through the cross-modal image index and you get visually-plausible-but-wrong results with no error anywhere; the system 'works,' the results are just quietly worse, and it's nearly impossible to debug from logs because nothing failed. The tradeoff: a more aggressive router (route more to specialized indexes) gives higher precision when it's right but higher damage when it misroutes. The staff move: keep the router simple and *observable* — route on clear signals (is there an image attached? is the text a likely product name/ID vs. a descriptive phrase?), log the routing decision on every query, and build an eval that specifically measures misrouting rate, because it will never show up in aggregate CTR until it's a serious problem. When unsure, prefer the fused/hybrid path (graceful) over committing to a specialized index (brittle).",
      },
      scale: {
        prompt: "10x — 500M products and an image-search feature goes viral. What breaks? Reveal.",
        text: "(1) **Image embedding throughput** — image encoding is far heavier than text; a viral image-search moment means a flood of uploads each needing a CLIP forward pass before you can even search. Without a queue + GPU autoscaling for the encoder, the image path times out while text queries sail through. (2) **Vector index memory footprint** — 500M multimodal vectors across separate text/image/cross-modal indexes is a huge RAM bill; you'll need quantization (PQ/scalar) and sharding, and quantization quietly costs recall, so it interacts with your reranker. (3) **The reranker becomes the latency bottleneck** — cross-modal reranking is expensive per candidate; at 10x traffic reranking the top-20 for every query may not fit the budget, forcing you to rerank fewer candidates or only on ambiguous queries. The first thing to break is the image-encoding path, not the search itself.",
      },
      defend: {
        prompt: "Defend a tradeoff: A PM wants ONE unified cross-modal index for everything 'to keep it simple.' Argue, then reveal.",
        text: "Acknowledge the simplicity is genuinely appealing, then show the hidden cost. A single cross-modal index means every query — even a precise text-only product-name search — gets answered from a space optimized for cross-modal similarity, which measurably *hurts* precision on the pure-text queries that are likely the majority of traffic. The staff framing: 'simple' at the index layer pushes complexity into a place you can't see (quietly worse text results) instead of a place you can (a router). The judgment move: agree to *start* simpler but instrument it — ship with the unified index if you must, but A/B a separate-index path for text queries and let the precision data make the call. If pure-text precision drops even a couple points at 50M+ products, that's millions of worse searches; the operational cost of maintaining separate indexes is trivial next to that. You defend the *option to split*, backed by an eval, rather than dying on 'always three indexes.'",
      },
    },
  },
  {
    id: "streaming_agent",
    title: "Real-Time Document Analysis Agent",
    brief: "Design an agent that processes incoming documents in real-time (contracts, invoices, reports) and streams structured extractions to downstream systems.",
    scale: "10K docs/day · <5s P95 latency",
    components: [
      { id: "queue", label: "Document ingestion queue (async)", must: true, explanation: "At 10K docs/day, direct synchronous processing creates backpressure under load spikes. A queue (SQS, Kafka) decouples ingestion rate from processing rate." },
      { id: "streaming_llm", label: "Streaming LLM with structured output schema", must: true, explanation: "Structured output (JSON schema enforcement) ensures downstream systems receive parseable data. Streaming enables <5s P95 by delivering partial results as they arrive." },
      { id: "validator", label: "Extraction validator + retry on schema failure", must: true, explanation: "LLMs occasionally produce malformed JSON or schema violations. A validator catches these and retries (up to 2×) before sending to downstream, preventing silent data corruption." },
      { id: "dlq", label: "Dead-letter queue for failed extractions", must: true, explanation: "Some documents will fail extraction after retries (corrupt, unsupported format, ambiguous content). DLQ captures these for human review without losing the document." },
      { id: "webhook", label: "Downstream webhook delivery with retry", must: true, explanation: "Downstream systems have their own availability issues. Webhook delivery with exponential backoff and idempotency keys prevents data loss from transient downstream failures." },
      { id: "ocr", label: "OCR preprocessing for scanned docs", must: false, explanation: "Scanned PDFs and photos require OCR before LLM extraction. At 10K docs/day, a significant fraction may be scanned. Add when scan volume is known." },
      { id: "confidence", label: "Confidence scoring per extracted field", must: false, explanation: "Per-field confidence enables downstream systems to flag low-confidence extractions for human review rather than using potentially wrong values." },
      { id: "human_review", label: "Human review queue for low-confidence extractions", must: false, explanation: "Closes the confidence feedback loop. Human corrections become training data and reveal systematic extraction failures." },
    ],
    studio: {
      clarify: {
        prompt: "10K docs/day, <5s P95, streaming extractions. What do you ask before designing? Pick the sharp questions.",
        questions: [
          { q: "What's the cost of a wrong extraction vs. a slow one — is this feeding an automated system or a human?", good: true, why: "This defines your validation posture. If a wrong invoice amount auto-triggers a payment, you need aggressive validation + human-in-the-loop on low confidence; if a human reviews everything anyway, speed matters more than perfect precision. It sets the whole reliability bar." },
          { q: "How bursty is the 10K/day — steady or spiky (end-of-month invoice floods)?", good: true, why: "A steady 10K is easy; a month-end flood of 8K in an hour is a completely different capacity problem. It's the difference between a simple worker and a queue with autoscaling and backpressure — you can't size the system without knowing the peak." },
          { q: "What are the downstream systems and do they require exactly-once delivery?", good: true, why: "Determines whether you need idempotency keys, a dead-letter queue, and delivery retries. If downstream is a ledger, a double-delivered extraction is a real bug. This shapes the entire output/delivery half of the system." },
          { q: "What document formats — clean PDFs, scans, photos?", good: false, why: "Important but secondary — and partly answerable by the OCR component being optional. It refines the pipeline rather than shaping its backbone; ask it after the reliability and burst questions." },
          { q: "What font are the documents in?", good: false, why: "Irrelevant at the systems level. Out of scope." },
        ],
      },
      deepDive: {
        prompt: "Go deep on one component. Here's the staff take on the validator + retry — the difference between silent corruption and a trustworthy pipeline.",
        component: "Extraction validator + retry on schema failure",
        text: "The core insight: an LLM extraction that returns *malformed or schema-violating* output is not a rare edge case — it's a steady background rate, and without a validator every one of those becomes silent downstream corruption. The tradeoff is retry aggressiveness vs. latency-and-cost budget. Validate the JSON against the schema (types, required fields, enums); on failure, retry — but not naively. The staff moves: (1) retry with the *validation error fed back into the prompt* ('your last output was missing `invoice_total`; return valid JSON') — a blind re-roll wastes a call, an informed retry usually fixes it; (2) cap retries (2–3) so a genuinely un-extractable doc doesn't loop forever eating your <5s budget; (3) on final failure, route to the DLQ, *never* pass a partially-valid extraction downstream. The subtle part: distinguish *schema* failures (retryable — the model can fix formatting) from *content* failures (the field genuinely isn't in the doc — retrying won't help, that goes to human review). Conflating those two wastes retries and hides real gaps.",
      },
      scale: {
        prompt: "10x — 100K docs/day and a customer dumps a 50K-doc backlog at once. What breaks? Reveal.",
        text: "(1) **The LLM provider rate limit is your hard ceiling** — 100K structured-extraction calls/day plus a 50K burst will hit your tokens-per-minute quota; the queue is what saves you (it absorbs the burst and drains at your sustainable rate), but only if it has backpressure so it doesn't OOM trying to hold everything in memory. (2) **The DLQ and human-review queue overflow** — at 10x, even a 2% failure rate is 2K docs/day needing human eyes; if the human review process was sized for 200, it collapses, and docs silently pile up. You need failure-rate alerting, not just a DLQ. (3) **Downstream webhook delivery amplifies** — 10x extractions means 10x webhook calls; if downstream is slower than your extraction rate, your retry-with-backoff queue backs up and you need to decouple delivery from extraction entirely. The bottleneck is provider quota first, human-review capacity second — not your own compute.",
      },
      defend: {
        prompt: "Defend a tradeoff: To hit <5s P95, an eng proposes dropping the validator+retry and 'just trusting the structured-output mode.' Argue, then reveal.",
        text: "Grant that structured-output/JSON-mode genuinely reduces malformed output — then explain why 'reduces' isn't 'eliminates,' and why that gap is unacceptable here. Structured-output constrains *format* but not *correctness*: the model can still emit valid JSON with a hallucinated or missing value, and a schema check catches a whole class of those (wrong type, missing required field, out-of-enum). Removing the validator to save latency trades a visible, bounded cost (a retry on the small fraction that fail) for an invisible, unbounded one (corrupt data flowing into a downstream ledger). The staff argument is expected cost: the validator adds latency only on the *failing* fraction — a well-tuned pipeline retries maybe 3–5% of docs, so the P95 impact is near-zero for the 95% that pass first time, while catching the errors that would otherwise become the incident. The move that wins: measure it — run both paths on a labeled set, show the silent-corruption rate without the validator, and let that number defend the 5% latency tax. You keep the guard; you just prove it's nearly free.",
      },
    },
  },
  {
    id: "code_review_ai",
    title: "AI Code Review Bot",
    brief: "Design an AI system that automatically reviews pull requests for bugs, security issues, and style violations before human review.",
    scale: "500 PRs/day · comment within 3 min of PR open",
    components: [
      { id: "webhook_gh", label: "GitHub webhook listener", must: true, explanation: "The entry point for all PR events. Receives PR open/update events in real-time. Without this, you're polling — which adds latency and misses the 3-minute SLA." },
      { id: "diff_builder", label: "Diff-aware context builder (changed code + relevant imports)", must: true, explanation: "Sending the entire file to the LLM wastes tokens and buries the change. A diff-aware builder extracts: changed lines ± N lines context, relevant imports, and function signatures. This is where most teams underinvest." },
      { id: "specialized_prompts", label: "Specialized prompts per review type (security vs bugs vs style)", must: true, explanation: "A single 'review this code' prompt produces mediocre results across all dimensions. Specialized prompts — each tuned for security patterns, logic bugs, or style — produce higher precision and fewer false positives." },
      { id: "fp_filter", label: "False-positive filter (avoid noisy comments)", must: true, explanation: "A bot that posts 50 comments on a 10-line PR gets muted by engineers. False-positive filtering (confidence threshold + per-file comment cap) determines whether the bot is used or ignored." },
      { id: "pr_comment_api", label: "PR comment API integration", must: true, explanation: "The output mechanism. Inline comments on specific diff lines are more actionable than a single top-level comment. GitHub's review API supports inline comments with line references." },
      { id: "team_config", label: "Team-specific rule configuration", must: false, explanation: "Different teams have different style preferences and security threat models. Per-team config makes the bot useful to more teams. Start with defaults; add config when teams request it." },
      { id: "feedback_loop", label: "Learning from accepted/rejected suggestions", must: false, explanation: "Tracking which comments get resolved vs ignored is the highest-signal improvement lever. After 500 PRs, you know which comment types to suppress." },
      { id: "linter_first", label: "Integration with existing linters (run linter first, LLM only reviews what linter misses)", must: false, explanation: "Linters are fast and free. Run ESLint/Pylint first, filter their output from the LLM's task. LLM adds value for semantic bugs and security patterns that linters can't catch." },
    ],
    studio: {
      clarify: {
        prompt: "500 PRs/day, comment within 3 min. What do you ask before designing? Pick the sharp questions.",
        questions: [
          { q: "What's the failure we care about most — missing a real bug, or drowning engineers in false positives?", good: true, why: "This is THE question for a review bot. Optimizing for recall (catch every bug) produces a noisy bot engineers mute within a week; optimizing for precision (only high-confidence comments) builds trust but misses things. You must know which failure the team can't tolerate before you set thresholds." },
          { q: "What languages and frameworks, and are there existing linters/static analysis already running?", good: true, why: "If linters already run, the LLM should only review what they *can't* catch (semantic bugs, security patterns) — running the LLM on lint-able issues wastes tokens and duplicates noise. It reshapes the whole pipeline around 'LLM covers the gap.'" },
          { q: "Is the bot's comment advisory, or does it block merge?", good: true, why: "A blocking bot must be near-zero false-positive or it halts the team; an advisory bot can be noisier. This single fact changes your precision bar, your escalation design, and how conservative the false-positive filter must be." },
          { q: "Should we use GPT-4o or Claude?", good: false, why: "Model choice, not architecture. The hard parts — diff-aware context, specialized prompts, false-positive filtering — are model-agnostic. Leading with the model skips the design." },
          { q: "What should the bot's username be?", good: false, why: "Cosmetic. Out of scope for a systems round." },
        ],
      },
      deepDive: {
        prompt: "Go deep on one component. Here's the staff take on the false-positive filter — the component that decides if the bot lives or dies.",
        component: "False-positive filter",
        text: "This is the component nobody thinks is 'the hard part' and it's the entire product. The insight: a code-review bot's value is not how many bugs it *can* find — it's whether engineers *trust* it enough to read its comments. A bot that posts 40 comments on a 12-line PR gets muted org-wide in a week, and a muted bot has zero value regardless of how good its detection is. So the tradeoff is precision vs. recall, and for adoption you deliberately sacrifice recall. The staff moves: (1) a confidence threshold — only surface comments above a bar, and tune the bar against *engineer resolution rate* (did they act on it?) not against a synthetic bug set; (2) a per-PR and per-file comment cap so even a genuinely buggy PR gets the top-N issues, not a wall; (3) suppress categories with historically low action rates (style nits the team ignores). The counterintuitive lesson that signals seniority: you *intentionally let some real bugs through* to protect trust, because a trusted bot catching 70% beats a muted bot that 'caught' 95% into a void.",
      },
      scale: {
        prompt: "10x — 5,000 PRs/day across the org, and a big refactor lands 200-file PRs. What breaks? Reveal.",
        text: "(1) **The 3-minute SLA under load + huge PRs** — a 200-file PR can't be reviewed in 3 minutes if you naively send every diff serially; you need parallel per-file review and, for giant PRs, prioritization (review the risky files first, or degrade to a summary). The diff-aware context builder becomes load-bearing — sending whole files at 10x volume is both too slow and too expensive. (2) **Cost at 5,000 PRs/day** — each PR is multiple specialized-prompt calls; without running the linter first (free) and only invoking the LLM on the residual, plus caching for unchanged hunks on PR updates, the token bill explodes. (3) **False-positive blast radius** — at 10x volume, a slightly-too-loose filter now posts 10x the noise; the thing that was 'a bit chatty' at 500 PRs becomes an org-wide mute at 5,000. The filter's threshold, tuned at low volume, silently becomes wrong at high volume. The bottleneck is per-PR latency on large PRs and cost, guarded by the linter-first + diff-aware design.",
      },
      defend: {
        prompt: "Defend a tradeoff: Leadership wants the bot to block merges on any flagged security issue 'to be safe.' Argue, then reveal.",
        text: "Agree with the goal (security matters) and attack the mechanism (blocking on *any* flag). A blocking gate is only as good as the false-positive rate behind it: if the security prompt has even a modest false-positive rate, blocking-on-any-flag means engineers get merges halted by phantom issues daily, and the *guaranteed* outcome is that they route around the bot — disable it, or rubber-stamp overrides — which leaves you *less* safe than before. The staff framing: a control that gets bypassed provides negative security. The judgment move: tier it. Block only on high-confidence, high-severity findings (hardcoded secret, obvious injection) where false positives are rare and the cost of a miss is catastrophic; make everything else advisory. Pair the blocking tier with a fast human-override path *and log every override* so you can audit whether the gate is calibrated. You're not weakening security — you're making the block *credible* by ensuring it only fires when it's almost certainly right, which is the only way a blocking gate survives contact with a real engineering org.",
      },
    },
  },
];

const TAKEHOME_CHALLENGES = [
  {
    id: "rank_outputs",
    title: "Rank These Outputs",
    brief: "A customer service bot received this query: 'I ordered 3 items but only 2 arrived. What should I do?'\n\nRank the three responses below from best (1) to worst (3).",
    outputs: [
      { id: "r1", text: "I'm sorry to hear that! Please contact our support team at support@store.com or call 1-800-XXX-XXXX and we'll resolve this right away.", label: "A" },
      { id: "r2", text: "Missing items from your order can happen due to shipping issues or warehouse errors. To resolve this, I'd recommend filing a missing item claim through your account under Orders > Report Issue. Include your order number and a photo of the shipping label. We'll investigate and either ship the missing item or issue a refund within 3-5 business days.", label: "B" },
      { id: "r3", text: "Based on your order history and typical resolution patterns for missing item cases at our fulfillment centers, the probability that this was a warehouse split-shipment is approximately 67%, while carrier loss accounts for roughly 28% of cases, with the remaining 5% attributable to customer receipt errors. I recommend you contact support.", label: "C" },
    ],
    idealRank: ["r2", "r1", "r3"],
    explanations: {
      r2: "Best: Actionable, specific, explains next steps clearly, sets expectations (3-5 days). Treats the customer as capable of self-service.",
      r1: "Acceptable: Provides real contact options. Not as good as self-service path, but gets the job done.",
      r3: "Worst: Fabricated statistics, unnecessary complexity, undermines trust. Classic hallucination pattern dressed up as helpfulness.",
    },
  },
  {
    id: "fix_prompt",
    title: "Find the Prompt Bug",
    brief: "This prompt is producing inconsistent, overly verbose responses. Identify the 3 main issues.",
    badPrompt: `You are a helpful AI assistant. When users ask you questions, please provide them with detailed, comprehensive, and thorough responses that cover all aspects of the topic. Be friendly and conversational. Make sure to include examples where helpful. You can also ask clarifying questions if needed. Always be honest and accurate. Try to be concise but also make sure you give enough information. Format your response however feels natural.`,
    issues: [
      { id: "i1", label: "Contradictory length instructions", correct: true, explanation: "'Detailed and comprehensive' vs 'concise' — the model will pick one randomly each time, causing inconsistency." },
      { id: "i2", label: "No output format specified", correct: true, explanation: "'Format however feels natural' means you'll get bullets, paragraphs, headers mixed unpredictably." },
      { id: "i3", label: "Too many competing objectives", correct: true, explanation: "8+ separate instructions create ambiguity. The model can't satisfy all simultaneously, so it improvises." },
      { id: "i4", label: "Missing a temperature setting", correct: false, explanation: "Temperature is an API parameter, not part of the system prompt. This isn't a prompt bug." },
      { id: "i5", label: "Should use XML tags for structure", correct: false, explanation: "XML tags can help but aren't required. The core issues are contradictions and vagueness, not format syntax." },
    ],
  },
  {
    id: "design_eval",
    title: "Design an Eval",
    brief: "You're shipping an AI feature that summarizes legal contracts. Design a minimum viable eval suite.",
    tasks: [
      { id: "e1", label: "Define pass/fail criteria", placeholder: "What makes a good summary? What's an automatic fail?", hint: "Think: accuracy, completeness, length, hallucinations, identifying key clauses" },
      { id: "e2", label: "Choose test case types", options: ["Short standard NDA (happy path)", "100-page M&A agreement (scale test)", "Non-English contract (edge case)", "Contract with unusual clauses (quality test)", "Adversarial: conflicting clauses (stress test)"], correctOnes: [0,1,2,3,4] },
      { id: "e3", label: "Pick your scoring method", options: ["Human review by legal expert", "LLM-as-judge against a rubric", "ROUGE score vs reference summary", "User acceptance rate in production"], correctOnes: [0,1] },
    ],
    insight: "For legal contracts, automated metrics (ROUGE) miss semantic accuracy — a summary can have high word overlap but still get a key clause wrong. LLM-as-judge + human spot-check is the minimum viable approach. Never rely on only one method.",
  },
  {
    id: "rag_system_design",
    type: "scenario",
    title: "RAG System Design",
    brief: "A legal firm (500 lawyers, 10M+ documents) wants to build an internal Q&A system over case files and contracts. Design the complete RAG pipeline. You have 3 months and a 2-person ML team. The firm cannot use any cloud AI APIs — everything must run on-premise.",
    rubric: [
      "Chunking strategy for legal docs (clause-boundary aware, not fixed-token)",
      "Embedding model choice (self-hosted: BGE-M3 or E5-large-v2)",
      "Vector DB selection (self-hosted: Qdrant or Weaviate, not Pinecone)",
      "Hybrid search (BM25 + dense, legal docs need exact term matching)",
      "Reranker (cross-encoder on top-20 → top-5)",
      "Access control (per-document ACL passed as metadata filter)",
      "Hallucination guardrail (citation grounding check on output)",
      "Eval harness (RAGAS recall@5, precision@5, faithfulness)",
      "Latency budget (p99 < 3s for retrieval + generation)",
    ],
    expertAnswer: "For 10M+ legal documents on-prem: use BGE-M3 or E5-large-v2 as the embedding model (strong multilingual legal performance, self-hostable). Qdrant or Weaviate for vector storage — both support on-prem deployment and metadata filtering for ACL. Chunking: clause-boundary aware, targeting 256-384 tokens, splitting at section headers and paragraph breaks to keep legal clauses intact. Retrieval: hybrid search with RRF fusion — BM25 catches exact legal terms ('force majeure', 'indemnification') that dense search misses. Top-20 → cross-encoder reranker → top-5 to LLM. Access control: filter by `permitted_users` metadata at query time — never post-filter. Output: groundedness check (every claim must cite a retrieved chunk). Eval: RAGAS faithfulness + answer recall on 200 manually verified QA pairs. Latency: retrieval <800ms (ANN search + reranker), generation <2s on an A10G. Ship v1 with 100 docs, expand corpus incrementally.",
  },
  {
    id: "eval_harness",
    type: "scenario",
    title: "Eval Harness from Scratch",
    brief: "You're the first AI engineer at a 40-person B2B startup. The product is an AI assistant that answers questions about customers' HR policies (PDFs). The founder says accuracy is great — but you've noticed 3 wrong answers in a week of using it yourself. You have no eval infrastructure. Build it.",
    rubric: [
      "Admit you can't trust founder's subjective 'accuracy is great' assessment",
      "Start with real production queries (not synthetic)",
      "Define failure taxonomy (hallucination, wrong doc retrieved, answer refusal, format issue)",
      "Choose eval metrics: faithfulness, answer relevance, context recall (RAGAS)",
      "LLM-as-judge for faithfulness (cross-model judge: Claude judging GPT-4o outputs)",
      "Human eval sample (5-10 cases/week, subject matter expert)",
      "Regression baseline (eval score before any change = the floor)",
      "Shadow eval (new model/prompt runs alongside live, outputs compared offline)",
      "Alert threshold (if faithfulness drops >5pp from baseline, flag for review)",
    ],
    expertAnswer: "First: I don't trust verbal accuracy assessments. I pull 50 real production queries from logs (they exist — check the API logs). I label each: correct, wrong but plausible, hallucinated, refused. This gives my first failure taxonomy. I set up RAGAS: faithfulness (is every claim in the answer grounded in retrieved context?) and answer relevance (does the answer address the query?). I use Claude as judge for GPT-4o outputs — same model family as judge creates bias. I score my 50 queries as the v0 baseline. From now on, any prompt or model change must run against this baseline before shipping. I add 5 new queries per week from real failures, growing the eval set. I set a Slack alert: if faithfulness drops below 0.75 for 3 consecutive days, I block deployment until fixed. Cost: ~$2/run on Claude-3-Haiku as judge. Running time: 8 minutes. This is the minimum viable eval harness.",
  },
  {
    id: "incident_response",
    type: "scenario",
    title: "Production Incident Response",
    brief: "It's 2pm Thursday. You get a Slack message: 'The AI answer quality seems off.' You check the dashboard — no errors, p99 latency looks normal. But user CSAT on AI answers dropped from 4.2 to 2.9 over the past 6 hours. You shipped a prompt change at 8am. What do you do, step by step?",
    rubric: [
      "Immediately check if the prompt change correlates with the drop (timestamps)",
      "Do NOT roll back blindly — first understand what changed",
      "Sample 20-30 recent AI answers manually from both before and after 8am",
      "Check retrieval quality (did top-k change? did the vector DB have a migration?)",
      "Hypothesis formation before any action (what specifically is worse?)",
      "Communicate to stakeholders with data, not 'we think'",
      "Rollback decision: if root cause identified and confirmed, roll back; if not, don't",
      "Write incident timeline before end of day",
      "Post-mortem: what eval would have caught this before shipping?",
    ],
    expertAnswer: "Step 1: Pull the last 6 hours of AI answers from logs. Sample 30 at random — 15 from before 8am, 15 after. Read them. This takes 15 minutes and tells me what's actually wrong (too short? hallucinating? wrong topic?). Step 2: Timeline — CSAT drop started at ~8:30am, prompt change shipped at 8:05am. 25-minute lag = plausible causal link. Step 3: I form a hypothesis. After reading the samples, I see the new prompt produces answers with more caveats and less specificity — engineers find it less useful. Step 4: I don't blindly roll back. I check if there's a simpler fix (remove the caveat instruction). Step 5: I message the team: 'CSAT dropped 1.3 points starting 8:30am. Correlated with our 8am prompt change. Root cause: new \"add caveats\" instruction makes answers feel hedged. Rolling back the caveat instruction now, will re-test against eval set first.' Step 6: I ship the revert at 3pm. Step 7: I add a rubric check for 'answer specificity' to our eval so this gets caught before shipping next time.",
  },
  {
    id: "agent_cost_blowout",
    type: "scenario",
    title: "Agent Cost Blowout",
    brief: "Your company's AI coding assistant (powered by a GPT-4o agent with 5 tools: code search, file read, web search, code execution, GitHub API) is costing $4.20 per user session on average. With 800 DAU, that's $3,360/day — way over budget. The PM wants to cut costs by 60% without degrading user CSAT. What's your plan?",
    rubric: [
      "Profile cost per tool call (which tools are most expensive?)",
      "Analyze average turns per session (is 5-turn sessions normal or is it 20+?)",
      "Identify unnecessary tool calls (agent calling web search when code search would do)",
      "Model routing: route simple queries to a cheaper model",
      "Prompt optimization: reduce system prompt token count (adds up at scale)",
      "Caching: semantic cache for common coding questions",
      "Step budget: cap max agent turns (e.g. 10 turns max)",
      "Measure CSAT impact of each change independently",
      "Don't cut everything at once — A/B test each change",
    ],
    expertAnswer: "First, I profile cost attribution. $4.20/session breaks down: which part is LLM tokens, which is tool call overhead? I pull session logs and count: average turns per session (usually 12-18 for coding agents), tokens per turn, which tools get called most. I typically find: web search is called unnecessarily (agent uses it when code search would work), and the system prompt is 3000 tokens on every call. Quick wins: (1) Add tool selection instructions to the system prompt — 'prefer code search over web search for code questions.' This alone reduces web search calls ~40%. (2) Compress system prompt from 3000 to 800 tokens using a distilled version — saves ~$0.60/session. (3) Route simple intent classification (is this a code question?) to GPT-4o-mini at $0.03 vs $0.30. (4) Semantic cache on common queries (environment setup, syntax questions) — ~20% of sessions. (5) Step budget of 12 turns max — prevents runaway sessions. I A/B test each change independently at 10% traffic before rolling out. Target: $1.80/session (57% reduction) with <5% CSAT impact.",
  },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

// ─── DESIGN STUDIO — staged AI system-design interview simulator ───────────────
// Reuses SYSTEM_DESIGN_PROMPTS as the scenario bank. Each scenario runs through
// 5 stages that mirror a real design round:
//   1) Clarify        → pick the architecture-shaping questions, reveal the good ones
//   2) High-level     → the existing component-checklist (reveal reference architecture)
//   3) Deep-dive      → staff-level tradeoff on the highest-leverage component
//   4) Scale          → what breaks at 10x, reveal the bottleneck
//   5) Defend         → a judgment prompt + model answer
// Ends with a staff-level rubric self-assessment covering all five.

const STUDIO_STAGES = [
  { id: "clarify", label: "Clarify",    n: 1, blurb: "What do you ask before designing?" },
  { id: "design",  label: "High-level", n: 2, blurb: "Propose the components." },
  { id: "deep",    label: "Deep-dive",  n: 3, blurb: "One component, staff-level tradeoff." },
  { id: "scale",   label: "Scale",      n: 4, blurb: "What breaks at 10x?" },
  { id: "defend",  label: "Defend",     n: 5, blurb: "Defend a tradeoff." },
];

function DesignStudio() {
  const [pIdx, setPIdx] = useState(0);
  const [stage, setStage] = useState(0);            // index into STUDIO_STAGES
  // per-stage local state
  const [clarifyPicked, setClarifyPicked] = useState(new Set());
  const [clarifyRevealed, setClarifyRevealed] = useState(false);
  const [checked, setChecked] = useState(new Set());
  const [designRevealed, setDesignRevealed] = useState(false);
  const [deepRevealed, setDeepRevealed] = useState(false);
  const [scaleRevealed, setScaleRevealed] = useState(false);
  const [defendText, setDefendText] = useState("");
  const [defendRevealed, setDefendRevealed] = useState(false);
  const [rubricHits, setRubricHits] = useState(new Set());

  const prompt = SYSTEM_DESIGN_PROMPTS[pIdx];
  const s = prompt.studio;
  const cur = STUDIO_STAGES[stage];

  function resetAll() {
    setStage(0);
    setClarifyPicked(new Set()); setClarifyRevealed(false);
    setChecked(new Set()); setDesignRevealed(false);
    setDeepRevealed(false); setScaleRevealed(false);
    setDefendText(""); setDefendRevealed(false);
    setRubricHits(new Set());
  }
  function switchScenario(i) { setPIdx(i); resetAll(); }
  function toggleClarify(i) { if (clarifyRevealed) return; setClarifyPicked(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }); }
  function toggleComponent(id) { if (designRevealed) return; setChecked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleRubric(i) { setRubricHits(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; }); }

  // stage-2 coverage score (preserves the original component-checklist grading)
  const mustHit = prompt.components.filter(c => c.must);
  const mustChecked = mustHit.filter(c => checked.has(c.id)).length;
  const totalChecked = [...checked].length;
  const score = designRevealed ? Math.round((mustChecked / mustHit.length) * 70 + (totalChecked / prompt.components.length) * 30) : null;
  const scoreColor = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  const RUBRIC = [
    "Requirements — you asked the architecture-shaping clarifying questions before designing",
    "Components — your high-level design hit the critical (must-have) components",
    "The key tradeoff — you can articulate the deep-dive component's central tension",
    "The bottleneck — you named what actually breaks first at 10x",
    "The judgment call — you defended a tradeoff with expected-cost reasoning, not vibes",
  ];

  return (
    <div className="space-y-4">
      {/* scenario bank */}
      <div className="flex gap-2 flex-wrap">
        {SYSTEM_DESIGN_PROMPTS.map((p, i) => (
          <button key={p.id} onClick={() => switchScenario(i)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${i === pIdx ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {p.title.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* the brief */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-zinc-500 mb-1">Design Round · {prompt.title}</p>
        <p className="text-white font-medium text-sm">{prompt.brief}</p>
        <span className="text-xs font-mono text-zinc-500 mt-1 block">{prompt.scale}</span>
      </div>

      {/* stage stepper */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STUDIO_STAGES.map((st, i) => {
          const active = i === stage;
          const done = i < stage;
          return (
            <button key={st.id} onClick={() => setStage(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? "bg-amber-950/40 border border-amber-600 text-amber-300" : done ? "bg-zinc-900 border border-emerald-800/50 text-emerald-400" : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${active ? "bg-amber-600 text-white" : done ? "bg-emerald-700 text-white" : "bg-zinc-800 text-zinc-500"}`}>{done ? "✓" : st.n}</span>
              {st.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500">Stage {cur.n}/5 — {cur.blurb}</p>

      {/* ─── STAGE 1 · CLARIFY ─── */}
      {cur.id === "clarify" && s?.clarify && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-400">{s.clarify.prompt}</p>
          {s.clarify.questions.map((q, i) => {
            const picked = clarifyPicked.has(i);
            let cls = "border-zinc-700 bg-zinc-900 hover:border-zinc-500 cursor-pointer";
            if (clarifyRevealed) {
              if (q.good) cls = "border-emerald-700/60 bg-emerald-950/20 cursor-default";
              else cls = picked ? "border-red-700/60 bg-red-950/20 cursor-default" : "border-zinc-800 bg-zinc-900 opacity-70 cursor-default";
            } else if (picked) cls = "border-amber-500 bg-amber-950/20 cursor-pointer";
            return (
              <div key={i} onClick={() => toggleClarify(i)} className={`px-3 py-2.5 rounded-xl border text-sm transition-all ${cls}`}>
                <div className="flex items-start gap-2">
                  {clarifyRevealed && <span className={`shrink-0 mt-0.5 font-mono text-xs ${q.good ? "text-emerald-400" : "text-zinc-600"}`}>{q.good ? "✓ ask" : "skip"}</span>}
                  <span className="text-zinc-200">{q.q}</span>
                </div>
                {clarifyRevealed && <p className={`text-xs mt-1.5 leading-relaxed ${q.good ? "text-emerald-300/80" : "text-zinc-500"}`}>{q.why}</p>}
              </div>
            );
          })}
          <button onClick={() => setClarifyRevealed(!clarifyRevealed)}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
            {clarifyRevealed ? "Hide the good questions" : "Reveal the questions a strong candidate leads with →"}
          </button>
        </div>
      )}

      {/* ─── STAGE 2 · HIGH-LEVEL DESIGN (the original component checklist) ─── */}
      {cur.id === "design" && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-400">Propose your architecture: check every component you'd include. Then reveal the reference design.</p>
          {prompt.components.map(c => (
            <div key={c.id} onClick={() => toggleComponent(c.id)}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${checked.has(c.id) ? "border-amber-600 bg-amber-950/10" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"}`}>
              <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${checked.has(c.id) ? "bg-amber-600 border-amber-600" : "border-zinc-600"}`}>
                {checked.has(c.id) && <span className="text-white text-xs leading-none"><Icon name="check" size={12} /></span>}
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-200">{c.label}</p>
                {designRevealed && (
                  <p className={`text-xs mt-1 leading-relaxed ${c.must ? "text-amber-300" : "text-zinc-500"}`}>{c.explanation}</p>
                )}
              </div>
              {designRevealed && c.must && !checked.has(c.id) && (
                <span className="text-xs text-red-400 font-mono shrink-0">missed!</span>
              )}
            </div>
          ))}
          {designRevealed && score !== null && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">Architecture Coverage</p>
              <p className="text-3xl font-black" style={{ color: scoreColor }}>{score}%</p>
              <p className="text-xs text-zinc-500 mt-1">{mustChecked}/{mustHit.length} critical components · {totalChecked}/{prompt.components.length} total</p>
            </div>
          )}
          <button onClick={() => setDesignRevealed(!designRevealed)}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
            {designRevealed ? "Hide reference architecture" : "Reveal reference architecture →"}
          </button>
        </div>
      )}

      {/* ─── STAGE 3 · DEEP-DIVE ─── */}
      {cur.id === "deep" && s?.deepDive && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">{s.deepDive.prompt}</p>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">Deep-dive component</p>
            <p className="text-sm text-white font-medium">{s.deepDive.component}</p>
            <p className="text-xs text-zinc-500 mt-2">Think through the central tradeoff before revealing the staff-level reasoning.</p>
          </div>
          {deepRevealed && (
            <div className="bg-violet-950/30 border border-violet-700/50 rounded-xl p-4">
              <p className="text-xs text-violet-400 uppercase tracking-widest mb-2">Staff-level take</p>
              <p className="text-sm text-zinc-200 leading-relaxed">{s.deepDive.text}</p>
            </div>
          )}
          <button onClick={() => setDeepRevealed(!deepRevealed)}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
            {deepRevealed ? "Hide staff take" : "Reveal staff-level reasoning →"}
          </button>
        </div>
      )}

      {/* ─── STAGE 4 · SCALE & BOTTLENECKS ─── */}
      {cur.id === "scale" && s?.scale && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">{s.scale.prompt}</p>
          {scaleRevealed && (
            <div className="bg-violet-950/30 border border-violet-700/50 rounded-xl p-4">
              <p className="text-xs text-violet-400 uppercase tracking-widest mb-2">What breaks at 10x</p>
              <p className="text-sm text-zinc-200 leading-relaxed">{s.scale.text}</p>
            </div>
          )}
          <button onClick={() => setScaleRevealed(!scaleRevealed)}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
            {scaleRevealed ? "Hide the bottleneck answer" : "Reveal the bottleneck →"}
          </button>
        </div>
      )}

      {/* ─── STAGE 5 · DEFEND A TRADEOFF ─── */}
      {cur.id === "defend" && s?.defend && (
        <div className="space-y-3">
          <div className="bg-zinc-900 border border-amber-800/40 rounded-xl p-4">
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">Judgment prompt</p>
            <p className="text-sm text-zinc-200 leading-relaxed">{s.defend.prompt}</p>
          </div>
          <textarea
            value={defendText}
            onChange={e => setDefendText(e.target.value)}
            placeholder="Write your position — take a side and justify it..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 resize-y focus:outline-none focus:border-amber-500 transition-colors"
            style={{ minHeight: "120px" }}
          />
          {defendRevealed && (
            <div className="bg-violet-950/30 border border-violet-700/50 rounded-xl p-4">
              <p className="text-xs text-violet-400 uppercase tracking-widest mb-2">Model answer</p>
              <p className="text-sm text-zinc-200 leading-relaxed">{s.defend.text}</p>
            </div>
          )}
          <button onClick={() => setDefendRevealed(!defendRevealed)}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
            {defendRevealed ? "Hide model answer" : "Reveal the model answer →"}
          </button>

          {/* staff rubric self-assessment — appears after the last stage's reveal */}
          {defendRevealed && (
            <div className="bg-zinc-900 border border-violet-800/40 rounded-xl p-4 mt-2">
              <p className="text-xs text-violet-400 uppercase tracking-widest mb-1">Staff-level rubric — self-assessment</p>
              <p className="text-[11px] text-zinc-500 mb-3">Across all five stages, tick each dimension you genuinely covered. Be honest — this is your self-grade for the whole round.</p>
              <ul className="space-y-1.5">
                {RUBRIC.map((point, i) => {
                  const hit = rubricHits.has(i);
                  return (
                    <li key={i}>
                      <button onClick={() => toggleRubric(i)}
                        className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg border transition-all ${hit ? "border-emerald-700/60 bg-emerald-950/25" : "border-zinc-800 hover:border-zinc-700"}`}>
                        <span className={`shrink-0 mt-0.5 font-mono text-xs ${hit ? "text-emerald-400" : "text-zinc-600"}`}>{hit ? "✓" : "○"}</span>
                        <span className="text-xs text-zinc-300 leading-relaxed">{point}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {(() => {
                const pct = Math.round((rubricHits.size / RUBRIC.length) * 100);
                const tier = pct >= 85 ? ["Staff-level", "#22c55e"] : pct >= 60 ? ["Senior-ready", "var(--gal-build)"] : pct >= 35 ? ["Analyst-ready", "#f59e0b"] : ["Keep going", "#fb7185"];
                return (
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{rubricHits.size}/{RUBRIC.length} covered · <span className="font-mono">{pct}%</span></span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: tier[1], border: `1px solid ${tier[1]}55` }}>{tier[0]}</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* stage nav */}
      <div className="flex items-center justify-between pt-1">
        <button onClick={() => setStage(Math.max(0, stage - 1))} disabled={stage === 0}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stage === 0 ? "text-zinc-700 cursor-not-allowed" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"}`}>
          ← Prev stage
        </button>
        {stage < STUDIO_STAGES.length - 1 ? (
          <button onClick={() => setStage(stage + 1)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all">
            Next stage: {STUDIO_STAGES[stage + 1].label} →
          </button>
        ) : (
          <button onClick={resetAll}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all">
            ↻ Restart round
          </button>
        )}
      </div>
    </div>
  );
}

function TakeHomeChallenge() {
  const [cIdx, setCIdx] = useState(0);
  const [rank, setRank] = useState([0, 1, 2]);
  const [promptIssues, setPromptIssues] = useState(new Set());
  const [evalChoices, setEvalChoices] = useState({ cases: new Set(), scoring: new Set() });
  const [revealed, setRevealed] = useState(false);
  const [scenarioText, setScenarioText] = useState("");
  const [rubricHits, setRubricHits] = useState(new Set());
  const ch = TAKEHOME_CHALLENGES[cIdx];

  function reset(i) { setCIdx(i); setRank([0,1,2]); setPromptIssues(new Set()); setEvalChoices({ cases: new Set(), scoring: new Set() }); setRevealed(false); setScenarioText(""); setRubricHits(new Set()); }
  function toggleRubric(i) { setRubricHits(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; }); }

  function moveRankUp(i) { if (i === 0) return; setRank(r => { const n=[...r]; [n[i-1],n[i]]=[n[i],n[i-1]]; return n; }); }
  function moveRankDown(i) { if (i === rank.length-1) return; setRank(r => { const n=[...r]; [n[i],n[i+1]]=[n[i+1],n[i]]; return n; }); }
  function toggleIssue(id) { setPromptIssues(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; }); }
  function toggleEval(type, id) {
    setEvalChoices(s => { const n=new Set(s[type]); n.has(id)?n.delete(id):n.add(id); return { ...s, [type]: n }; });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TAKEHOME_CHALLENGES.map((c, i) => (
          <button key={c.id} onClick={() => reset(i)}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${i === cIdx ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {c.title}
          </button>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{ch.title}</p>
        <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{ch.brief}</p>
      </div>

      {/* Rank Outputs */}
      {cIdx === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500">Use ↑↓ to rank best → worst</p>
          {rank.map((oIdx, pos) => {
            const o = ch.outputs[oIdx];
            const idealPos = ch.idealRank.indexOf(o.id);
            const correct = revealed && pos === idealPos;
            const wrong = revealed && pos !== idealPos;
            return (
              <div key={o.id} className={`border rounded-xl p-3 transition-all ${correct ? "border-green-600 bg-green-900/10" : wrong ? "border-red-700 bg-red-900/10" : "border-zinc-700 bg-zinc-900"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveRankUp(pos)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-600 hover:text-white text-sm rounded hover:bg-zinc-700/50 transition-colors">↑</button>
                    <button onClick={() => moveRankDown(pos)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-600 hover:text-white text-sm rounded hover:bg-zinc-700/50 transition-colors">↓</button>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-mono text-zinc-500 mr-2">Option {o.label}</span>
                    <span className="text-sm text-zinc-300">{o.text}</span>
                    {revealed && <p className="text-xs text-indigo-300 mt-2">{ch.explanations[o.id]}</p>}
                  </div>
                  <span className="text-xs font-mono text-zinc-600 shrink-0">#{pos+1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fix Prompt */}
      {cIdx === 1 && (
        <div className="space-y-3">
          <div className="bg-zinc-900 border border-amber-800/40 rounded-xl p-4">
            <p className="text-xs text-amber-400 mb-2">Problematic Prompt</p>
            <p className="text-xs text-zinc-300 font-mono leading-relaxed">{ch.badPrompt}</p>
          </div>
          <p className="text-xs text-zinc-500">Select the 3 main issues:</p>
          {ch.issues.map(issue => {
            const picked = promptIssues.has(issue.id);
            let cls = "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 cursor-pointer";
            if (revealed) {
              if (issue.correct && picked) cls = "border-green-600 bg-green-900/20 text-green-300 cursor-default";
              else if (!issue.correct && picked) cls = "border-red-600 bg-red-900/20 text-red-300 cursor-default";
              else if (issue.correct && !picked) cls = "border-amber-600 bg-amber-900/20 text-amber-300 cursor-default";
              else cls = "border-zinc-800 bg-zinc-900 text-zinc-600 cursor-default";
            } else if (picked) cls = "border-indigo-500 bg-indigo-900/20 text-white cursor-pointer";
            return (
              <div key={issue.id} onClick={() => !revealed && toggleIssue(issue.id)}
                className={`px-4 py-2.5 rounded-xl border text-sm transition-all ${cls}`}>
                {issue.label}
                {revealed && issue.correct && <p className="text-xs mt-1 text-zinc-400">{issue.explanation}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Design Eval */}
      {cIdx === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-zinc-400 mb-2">Which test case types would you include? (select all that apply)</p>
            {ch.tasks[1].options.map((opt, i) => {
              const picked = evalChoices.cases.has(i);
              const isIdeal = ch.tasks[1].correctOnes.includes(i);
              let cls = picked ? "border-indigo-500 bg-indigo-900/20 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500";
              if (revealed) cls = isIdeal ? "border-green-600 bg-green-900/20 text-green-300" : "border-zinc-800 bg-zinc-900 text-zinc-600";
              return (
                <button key={i} onClick={() => !revealed && toggleEval("cases", i)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm mb-1.5 transition-all ${cls}`}>{opt}</button>
              );
            })}
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-2">Which scoring method would you use? (select all that apply)</p>
            {ch.tasks[2].options.map((opt, i) => {
              const picked = evalChoices.scoring.has(i);
              const isIdeal = ch.tasks[2].correctOnes.includes(i);
              let cls = picked ? "border-indigo-500 bg-indigo-900/20 text-white" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500";
              if (revealed) cls = isIdeal ? "border-green-600 bg-green-900/20 text-green-300" : "border-zinc-800 bg-zinc-900 text-zinc-600";
              return (
                <button key={i} onClick={() => !revealed && toggleEval("scoring", i)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm mb-1.5 transition-all ${cls}`}>{opt}</button>
              );
            })}
          </div>
          {revealed && (
            <div className="bg-indigo-900/10 border border-indigo-800/40 rounded-xl p-4">
              <p className="text-xs text-indigo-400 mb-1">Key Insight</p>
              <p className="text-sm text-zinc-300">{ch.insight}</p>
            </div>
          )}
        </div>
      )}

      {/* Scenario (free-text) */}
      {ch.type === "scenario" && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Write your answer below, then reveal the expert response:</p>
          <textarea
            value={scenarioText}
            onChange={e => setScenarioText(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-600 resize-y focus:outline-none focus:border-indigo-500 transition-colors"
            style={{ minHeight: "150px" }}
          />
          {revealed && (
            <div className="space-y-3">
              <div className="bg-violet-950/40 border border-violet-700/50 rounded-xl p-4">
                <p className="text-xs text-violet-400 uppercase tracking-widest mb-2">Expert Answer</p>
                <p className="text-sm text-zinc-200 leading-relaxed">{ch.expertAnswer}</p>
              </div>
              <div className="bg-zinc-900 border border-violet-800/40 rounded-xl p-4">
                <p className="text-xs text-violet-400 uppercase tracking-widest mb-1">Score yourself against the rubric</p>
                <p className="text-[11px] text-zinc-500 mb-3">Tick each point your answer genuinely covered. Be honest — this is your self-grade.</p>
                <ul className="space-y-1.5">
                  {ch.rubric.map((point, i) => {
                    const hit = rubricHits.has(i);
                    return (
                      <li key={i}>
                        <button onClick={() => toggleRubric(i)}
                          className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg border transition-all ${hit ? "border-emerald-700/60 bg-emerald-950/25" : "border-zinc-800 hover:border-zinc-700"}`}>
                          <span className={`shrink-0 mt-0.5 font-mono text-xs ${hit ? "text-emerald-400" : "text-zinc-600"}`}>{hit ? "✓" : "○"}</span>
                          <span className="text-xs text-zinc-300 leading-relaxed">{point}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {(() => {
                  const pct = Math.round((rubricHits.size / ch.rubric.length) * 100);
                  const tier = pct >= 85 ? ["Staff-level", "#22c55e"] : pct >= 60 ? ["Senior-ready", "var(--gal-build)"] : pct >= 35 ? ["Analyst-ready", "#f59e0b"] : ["Junior — keep going", "#fb7185"];
                  return (
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{rubricHits.size}/{ch.rubric.length} covered · <span className="font-mono">{pct}%</span></span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: tier[1], border: `1px solid ${tier[1]}55` }}>{tier[0]}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setRevealed(!revealed)}
        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-sm">
        {revealed ? "Hide Answer" : "Reveal Answer →"}
      </button>
    </div>
  );
}

// ─── CAREER APP ───────────────────────────────────────────────────────────────

const CAREER_MODULES = [
  { id: "sysdesign",   label: "Design Studio",      tag: "SIMULATOR", component: DesignStudio,
    objective: "Run a full AI system-design round the way top companies actually conduct it — clarify, design, deep-dive, scale, and defend a tradeoff — then self-grade against a staff-level rubric.",
    howTo: ["Work the 5 stages in order — each mirrors a real design round (Clarify → High-level → Deep-dive → Scale → Defend)", "In each stage, think/select FIRST, then reveal the expert take — the reveal is worthless if you peek early", "Clarify is scored on judgment: the best candidates ask the 2-3 questions that change the architecture, not every question", "Scale & Deep-dive teach the reasoning, not a checklist — read them even when you 'knew the components'", "Defend: take a real side and justify with expected-cost reasoning; the model answer shows the staff framing", "End on the rubric — an honest self-grade across all five stages is the point"] },
  { id: "takehome",    label: "Take-home Mode",      tag: "CHALLENGE", component: TakeHomeChallenge,
    objective: "The take-home format the same AI-forward companies send: rank model outputs, debug a prompt, design an eval, and work full open-ended scenarios against a staff rubric.",
    howTo: ["These are the exact take-home formats used by AI-forward companies", "Rank Outputs: don't just pick 'most helpful' — think about hallucination, specificity, trust", "Fix Prompt: look for contradictions, vagueness, and missing constraints", "Design Eval: good evals need edge cases and the right scoring method, not just happy path tests", "Scenario challenges: write a real answer first, then self-grade against the rubric honestly"] },
];

export default function CareerApp() {
  const [activeModule, setActiveModule] = useState("sysdesign");
  const mod = CAREER_MODULES.find(m => m.id === activeModule);
  const ActiveComponent = mod?.component || DesignStudio;
  const [showWelcome, setShowWelcome] = useState(() => {
    try { return localStorage.getItem("genai_visited_career") !== "1"; } catch { return false; }
  });
  function dismissWelcome() {
    setShowWelcome(false);
    try { localStorage.setItem("genai_visited_career", "1"); } catch {}
  }

  if (showWelcome) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 70%)" }} />
      <div className="max-w-lg w-full flex flex-col items-center text-center gap-6 fade-up">
        <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.08) 100%)", border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 0 24px rgba(245,158,11,0.12)" }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"><Icon name="rocket" size={32} /></div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight" style={{ background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Design Studio</h1>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">A staged AI system-design interview simulator — run the round the way top companies actually conduct it, then self-grade against a staff rubric.</p>
        </div>
        <div className="w-full rounded-xl p-5 text-left space-y-3" style={{ background: "linear-gradient(160deg, rgba(245,158,11,0.07) 0%, rgba(15,15,17,0.9) 100%)", border: "1px solid rgba(245,158,11,0.18)", borderTop: "1px solid var(--border)" }}>
          <p className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">What you'll do</p>
          {[
            ["The Design Studio (5-stage round)", "Clarify → propose a high-level design → deep-dive one component → reason about what breaks at 10x → defend a tradeoff. Think first, then reveal the staff-level take at each stage, and self-grade on a rubric."],
            ["Take-Home Mode", "Rank LLM outputs, fix broken prompts, design an eval pipeline, and work open-ended scenarios — the exact take-home formats AI-forward companies send."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#f59e0b" }} />
              <div><span className="text-xs font-bold text-white">{title} — </span><span className="text-xs text-zinc-400">{desc}</span></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600 font-mono">Best for: engineers targeting AI roles · ML engineers · anyone interviewing at AI companies</p>
        <button onClick={dismissWelcome} style={{ background: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)", boxShadow: "0 4px 16px rgba(245,158,11,0.3), 0 1px 0 rgba(255,255,255,0.1) inset" }} className="px-8 py-3 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110">
          Start Preparing →
        </button>
      </div>
    </div>
  );

  const CAREER_GROUPS = [
    { label: "DESIGN STUDIO",  ids: ["sysdesign", "takehome"] },
  ];

  return (
    <div className="flex h-full min-h-0">
      <div className="w-52 shrink-0 border-r border-zinc-800 overflow-y-auto py-3">
        {CAREER_GROUPS.map(group => (
          <div key={group.label} className="mb-3">
            <div className="px-4 py-1 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{group.label}</div>
            {group.ids.map(id => {
              const m = CAREER_MODULES.find(x => x.id === id);
              if (!m) return null;
              const active = activeModule === id;
              return (
                <button key={id} onClick={() => setActiveModule(id)}
                  style={active ? { background: "var(--surface-2)", boxShadow: "inset 0 0 0 1px var(--border)" } : {}}
                  className={`w-full text-left px-4 py-2.5 transition-all flex flex-col gap-0.5 ${active ? "" : "border-l-2 border-transparent hover:bg-zinc-900"}`}>
                  <span className={`text-xs font-semibold leading-snug ${active ? "text-white" : "text-zinc-300"}`}>{m.label}</span>
                  <span className={`text-[10px] font-mono ${active ? "text-amber-400" : "text-zinc-600"}`}>{m.tag}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {mod?.objective && <HowTo objective={mod.objective} steps={mod.howTo} />}
        <ActiveComponent />
      </div>
    </div>
  );
}
