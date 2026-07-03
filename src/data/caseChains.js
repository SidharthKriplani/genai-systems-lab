// ─────────────────────────────────────────────────────────────────────────────
// L2 Case Chains — multi-step chained RAG failure narratives.
//
// P0.2 pilot (Retrieval domain only). Schema mirrors MSL's Incident Room
// (src/data/drills/caseChains.js + src/tabs/IncidentRoomTab.jsx) so the two labs
// share a case-chain contract. The GSL extension over MSL: each step carries a
// `consequence` — resolving one symptom SURFACES the next one, which is what makes
// this an L2 chain rather than a set of independent MCQs. The renderer threads
// consequences between steps as connective tissue.
//
// SCHEMA (author every future chain to this shape):
//   {
//     id:        string   — stable, unique. Used as the localStorage completion key.
//     domain:    string   — challenge area ("retrieval" | "agents" | "eval" | ...).
//     subtopic:  string   — short human label of the failure cluster.
//     level:     "senior" | "staff".
//     type:      "casechain" (always).
//     title:     string   — the incident headline.
//     context:   string[] — 3–5 bullet lines: the system, the numbers, the symptom.
//     steps: [
//       {
//         symptom:     string   — one-line framing of THIS step's surfaced problem.
//         evidence:    string[] — metrics / traces the learner reasons over.
//         question:    string   — the diagnostic prompt.
//         options:     [{ id, text }]  — 3–4 candidate diagnoses (one correct).
//         correct:     string   — the id of the right option.
//         finding:     string   — first-principles causal explanation of WHY.
//         whatsTested: string   — the judgment this step probes.
//         antiPattern: string   — the plausible-but-wrong move and why it fails.
//         seniorFraming: string — how a senior/staff engineer frames it.
//         consequence: string   — what fixing this exposes → leads into next step.
//                                  (Omit / null on the final step.)
//       }, ...
//     ],
//     diagnosis:   string — the whole-chain root-cause summary.
//     explanation: string — how the faults compound across steps.
//     fix:         string — the ordered remediation.
//     source:      string — attribution.
//   }
// ─────────────────────────────────────────────────────────────────────────────

export const RETRIEVAL_CASE_CHAINS = [
  {
    id: "chain-rag-recall-answer-quality",
    domain: "retrieval",
    subtopic: "recall vs answer quality → reranking → multi-hop synthesis",
    level: "staff",
    type: "casechain",
    title: "High recall, low answer quality — chase the RAG failure down four layers",
    context: [
      "Enterprise support RAG over ~180k product-doc chunks. bge-large embeddings, HNSW index, top-k=8 chunks fed to the LLM.",
      "Offline retrieval eval: recall@8 = 0.93 against a labelled gold-chunk set. Retrieval looks excellent.",
      "Human answer-quality rating: only 61% of answers rated correct/complete. Users report confident-but-wrong answers.",
      "Latency budget is 2.5s end-to-end. No reranker in the pipeline yet. The gold set was built by annotators who marked any chunk that mentioned the entity.",
    ],
    steps: [
      {
        symptom: "recall@8 is 0.93 but only 61% of answers are correct. Where does the quality leak?",
        evidence: [
          "recall@8 = 0.93 (the relevant chunk is in the top-8 almost every time).",
          "Precision@8 is not measured. Average retrieved-chunk relevance (per a spot audit): ~3 of 8 chunks are on-topic.",
          "Answers cite retrieved text but frequently blend in an adjacent, wrong fact.",
        ],
        question: "recall@8=0.93 yet answers are wrong 39% of the time. What is the first structural suspect?",
        options: [
          { id: "a", text: "The embedding model is too weak — swap bge-large for a larger model to raise recall further" },
          { id: "b", text: "High recall with no precision control: the right chunk is present, but so are ~5 distractor chunks per query, and the LLM cannot reliably pick signal from noise in an 8-chunk context" },
          { id: "c", text: "The LLM is hallucinating independent of retrieval — retrieval is fine, so fine-tune the generator" },
          { id: "d", text: "recall@8 is simply mis-measured and the real recall is low" },
        ],
        correct: "b",
        finding:
          "Recall measures whether the right chunk is present; it says nothing about how many wrong chunks arrive with it. At recall@8=0.93 with ~3/8 on-topic, every prompt carries ~5 distractor chunks. LLMs do not cleanly ignore irrelevant context — they attend to it, and adjacent-but-wrong facts bleed into the answer. The quality leak is precision, not recall. Raising recall further (option a) adds more chunks and more noise; the generator is not independently hallucinating (option c) — it is faithfully synthesising a noisy context.",
        whatsTested: "Whether you separate recall (is the answer retrievable?) from precision/context-noise (is the answer findable amid the noise?) — the single most common RAG misdiagnosis.",
        antiPattern: "Chasing higher recall by increasing k or upgrading the embedding model. Both increase the distractor mass in context and make answer quality worse, not better.",
        seniorFraming: "A staff engineer reads a recall/quality gap as a two-stage retrieval problem: stage-1 recall is solved, stage-2 precision is missing. The fix lives in reranking and context curation, not in the embedder.",
        consequence:
          "You add a cross-encoder reranker (bge-reranker-large) over the top-50 candidates and cut the context to the reranked top-4. Answer quality jumps 61% → 82%. But a new pattern surfaces in the failures that remain: questions that require combining two documents now fail badly.",
      },
      {
        symptom: "After reranking, single-fact answers are strong — but multi-document questions collapse.",
        evidence: [
          "Post-rerank: top-4 chunks, precision up sharply, single-hop answer quality 61% → 82%.",
          "Breaking failures down by type: 'What is X?' questions ~90% correct; 'Compare X and Y' / 'Does X's policy also apply to Y?' questions ~40% correct.",
          "Trace on a failing multi-hop query: the top-4 reranked chunks are all about X. The Y chunk that was retrieved at rank 6–7 got cut when context shrank to 4.",
        ],
        question: "Reranking fixed single-hop but broke multi-hop. What did shrinking to top-4 do?",
        options: [
          { id: "a", text: "The reranker is broken for multi-hop — replace it with a bigger cross-encoder" },
          { id: "b", text: "A single-vector query retrieves and reranks for ONE information need; multi-hop questions have two needs (X and Y), so an aggressive top-4 cut keeps the strongest single facet and drops the second entity entirely" },
          { id: "c", text: "The LLM lost the ability to reason once context got shorter — restore top-8" },
          { id: "d", text: "Multi-hop questions are simply unanswerable by RAG and should be routed to a human" },
        ],
        correct: "b",
        finding:
          "A dense query embedding encodes an average of the question's semantics. For 'Does X's policy apply to Y?', the vector sits between X and Y and retrieval + rerank surface whichever entity dominates — usually X. The reranker, optimised for single query-chunk relevance, ranks all the X chunks above the lone Y chunk, so a top-4 cut discards Y. The model then answers about X with total confidence because Y is simply absent from context. This is not a reranker defect (option a) or a reasoning loss (option c) — it is a retrieval-decomposition gap: one query cannot serve two information needs.",
        whatsTested: "Whether you recognise that aggressive precision/context-trimming trades away multi-hop coverage, and that the root cause is single-shot retrieval against a multi-need query — not the reranker or the LLM.",
        antiPattern: "Reverting to top-8 to 'get Y back'. That re-injects the distractor noise you just removed and drags single-hop quality back down — you oscillate between the two failure modes instead of resolving them.",
        seniorFraming: "Multi-hop is a query-planning problem, not a top-k problem. The senior move is query decomposition (sub-questions per entity) or multi-vector retrieval with guaranteed per-entity slots, so both needs are represented before reranking.",
        consequence:
          "You add query decomposition: an LLM step splits multi-need questions into sub-queries, retrieves + reranks per sub-query, and merges a per-entity chunk budget. Multi-hop quality climbs 40% → 78%. Then a subtler failure appears: on questions whose answer depends on the NEWEST version of a policy, the system still returns confidently outdated answers.",
      },
      {
        symptom: "Multi-hop is handled, but time-sensitive questions return confidently stale answers.",
        evidence: [
          "Query: 'What is the current refund window?' → answer cites a 14-day window. The correct current answer is 30 days (changed 3 months ago).",
          "The old '14-day' chunk and the new '30-day' chunk are both in the index; both are near-duplicates semantically.",
          "The reranker scores the two chunks within 0.01 of each other; the stale one wins ~half the time. Chunks carry an `effective_date` in metadata that nothing in the pipeline reads.",
        ],
        question: "Two semantically near-identical chunks disagree on the fact; the stale one often wins. Why, and what is missing?",
        options: [
          { id: "a", text: "The embedding model can't tell the versions apart — fine-tune it to separate them in vector space" },
          { id: "b", text: "Semantic relevance is version-blind: both chunks are equally 'about' the refund window, so neither retrieval nor the reranker prefers the current one — recency/version is a metadata signal the pipeline never uses" },
          { id: "c", text: "The index is corrupted and is serving deleted chunks" },
          { id: "d", text: "The LLM prefers smaller numbers, so it picks 14 over 30" },
        ],
        correct: "b",
        finding:
          "Relevance and recency are orthogonal. A cross-encoder scores how well a chunk answers the query's semantics; two versions of the same policy are near-identical on that axis, so the tie is effectively random. Nothing in a pure-semantic pipeline encodes 'this superseded that.' The `effective_date` metadata that would break the tie is present but unread. This is not an embedding-separation problem (option a) — you do not want the versions far apart in vector space; you want both retrieved and then disambiguated by a recency/authority signal at rank time.",
        whatsTested: "Whether you know that semantic retrieval is version-blind and that temporal correctness in RAG requires an explicit metadata signal (effective_date / version) applied at retrieval or rerank — not a better embedder.",
        antiPattern: "Deleting old versions from the index. That destroys the audit trail and breaks any question that legitimately asks 'what was the policy last quarter?' The fix is disambiguation, not deletion.",
        seniorFraming: "A staff engineer treats the index as bitemporal: keep every version, but make retrieval recency-aware. Metadata filtering (effective_date <= now) plus a recency tie-breaker in the rerank score resolves version conflicts without losing history.",
        consequence:
          "You add metadata-aware reranking: filter to effective versions and add a recency prior to the rerank score. Stale-answer rate drops from ~50% to ~4% on time-sensitive queries. One class of failure remains — questions the corpus genuinely cannot answer, where the system still fabricates a plausible answer instead of abstaining.",
      },
      {
        symptom: "Retrieval is now strong end-to-end, but the system still fabricates answers when the corpus has no answer at all.",
        evidence: [
          "Query about a product the company does not sell → system returns a fluent, specific, entirely invented answer.",
          "On these queries, the reranked top chunks have low absolute cross-encoder scores (0.1–0.2) but are still passed to the LLM.",
          "No abstention path exists: the generator always receives k chunks and is always prompted to answer.",
          "Faithfulness metric (answer grounded in context) on these queries ~0.3; on answerable queries ~0.95.",
        ],
        question: "Retrieval quality is high, yet unanswerable queries produce confident fabrications. What is the final missing layer?",
        options: [
          { id: "a", text: "The LLM is fundamentally untrustworthy — replace it with a larger model" },
          { id: "b", text: "There is no retrieval-confidence gate or grounding check: low-scoring retrievals are still forced into the generator, and nothing verifies the answer is supported before returning it — the system cannot say 'I don't know'" },
          { id: "c", text: "Recall dropped again — retrieve more chunks so the answer is definitely in context" },
          { id: "d", text: "The reranker should score everything above 0.5, so lower the threshold to admit more chunks" },
        ],
        correct: "b",
        finding:
          "A RAG system with no abstention path treats every query as answerable. When the corpus has no relevant content, retrieval still returns its k least-bad chunks, the reranker scores them low, and the generator — always instructed to answer — pattern-matches a fluent fabrication. The missing layer is a confidence gate (if the top reranked score is below a calibrated threshold, abstain or escalate) plus a grounding/faithfulness check (verify the answer's claims are supported by the retrieved context before returning). A bigger model (option a) fabricates more fluently, not less. Retrieving more (option c) cannot help when nothing relevant exists.",
        whatsTested: "Whether you close the loop with retrieval-confidence gating and grounding verification — recognising that 'I don't know' is a required output, not a failure, and that faithfulness must be checked, not assumed.",
        antiPattern: "Lowering the rerank admission threshold to 'always have context.' That guarantees low-relevance chunks reach the generator on exactly the queries where it should have abstained — maximising confident fabrication.",
        seniorFraming: "Staff-level RAG treats abstention as a first-class outcome. Calibrate a score threshold on a held-out set, gate generation on it, and run a lightweight grounding check (claim-level entailment against context) so unsupported answers are caught before they reach the user.",
        consequence: null,
      },
    ],
    diagnosis:
      "A RAG pipeline that was strong on stage-1 recall but missing every downstream layer: precision/reranking, multi-need query decomposition, version/recency disambiguation, and a confidence/grounding gate. Each fix exposed the next latent failure that high recall had been masking.",
    explanation:
      "The chain compounds by layer. High recall hid a precision problem (distractor noise → wrong facts). Fixing precision by trimming context exposed a multi-hop gap (single-shot retrieval can't serve two needs). Fixing multi-hop with decomposition exposed version-blindness (semantic relevance ignores recency). Fixing recency exposed the absence of abstention (no confidence gate → fluent fabrication on unanswerable queries). No single metric — least of all recall — could reveal this stack; each layer only became visible once the one above it was resolved. That layered dependency is exactly what a senior RAG interview probes.",
    fix:
      "Build RAG as an ordered stack, not a single retriever: (1) stage-1 dense recall, then a cross-encoder reranker with a trimmed, curated context to fix precision; (2) query decomposition / multi-vector retrieval with per-entity chunk budgets for multi-hop needs; (3) bitemporal metadata — keep all versions, filter to effective ones, add a recency prior at rerank for version conflicts; (4) a calibrated retrieval-confidence gate plus a grounding/faithfulness check so the system abstains or escalates instead of fabricating. Measure precision@k, per-hop coverage, temporal-correctness, and faithfulness — not recall alone.",
    source: "Authored · GSL L2 Case Chain",
  },
];

// Public accessor — keeps the renderer decoupled from the array name and lets
// future domains register their own chains here without touching the component.
export function getCaseChains(domain) {
  if (!domain) return RETRIEVAL_CASE_CHAINS;
  return RETRIEVAL_CASE_CHAINS.filter((c) => c.domain === domain);
}
