// designStudioBriefs.js — Design Studio, GSL (AIE track). SKELETONS ONLY (2026-07-17).
// CORRECTED MECHANIC (supersedes the tick-reveal SD_GSL_DS): the user PRODUCES the
// artifact themselves, then self-critiques it against a REFERENCE + an anchored RUBRIC.
// No LLM in the loop (optional LLM critic is a later, GSL-only bolt-on). See DESIGN-STUDIO-SPEC.md.
//
// Schema per brief:
//   id, roleTrack, domain, modality, specLevel(S1-S4), withheld[], flawMode, difficulty, companies, tags,
//   prompt, context (reduced to the spec level; names what is withheld),
//   produce: { artifact, format, workspace }   // what the user BUILDS — the prized step
//   reference: { type: 'solution'|'requirement' }  // what they self-critique AGAINST (prose deferred)
//   rubric: [ { dim, anchor(binary self-check on THEIR artifact), cost(the failure the omission causes) } ]
//   status: 'skeleton'
// Scoped-not-vague: identity/dials/brief/produce/rubric-anchors PINNED; the reference prose + any
// rubric expansion are DEFERRED via `_flesh`. A fleshing session writes the reference with zero re-scoping.

export const DESIGN_STUDIO_GSL = [
  { id: "ds-payment-exception-agent", roleTrack: "AIE", domain: "agentic-ops", modality: "design",
    specLevel: "S1", withheld: [], flawMode: null, difficulty: "senior", companies: ["UBS"],
    tags: ["agentic", "multi-agent", "idempotency", "auditability", "payments"],
    prompt: "Design a production-grade agentic system that detects payment exceptions, diagnoses root cause from internal+external evidence, decides auto-resolve vs escalate, and advances each case through safe remediation with full auditability.",
    context: "Rails: domestic/wire/book-transfer/scheduled. Exceptions: incorrect-beneficiary, insufficient-funds, duplicate, sanctions-hold, rail-failure, cutoff-miss, uncertain-retry. Dependent systems each with own latency+failure. Asymmetric cost: missed-resolvable delays funds; unsafe auto-correction/retry -> duplicate payments / compliance breach / wrong fund movement.",
    produce: { artifact: "architecture (ingress->orchestration->investigation->decision->egress->async->replay) + agent catalogue (per-agent contract/authority/defer) + decision workflow + 2 sample end-to-end traces + threshold/escalation notes + production-readiness plan + assumptions/tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "idempotency", anchor: "point to the idempotency key that makes a repeated exception event a no-op", cost: "duplicate payments" },
      { dim: "safety-under-uncertainty", anchor: "does your design DEFER/escalate on stale or conflicting evidence instead of auto-acting?", cost: "unsafe auto-correction, wrong fund movement" },
      { dim: "auditability", anchor: "can every automated action be reconstructed from your recorded trace?", cost: "can't defend a decision in a later review" },
      { dim: "eval-first", anchor: "did you define the trace set + a false-auto-resolve metric BEFORE the architecture?", cost: "no way to prove it is safe to trust" },
      { dim: "multi-agent-justification", anchor: "is each agent's authority + what-it-must-defer explicit (not a monolith)?", cost: "one failing agent corrupts the whole resolution path" },
      { dim: "tradeoffs", anchor: "did you state where you chose latency vs correctness and why?", cost: "hand-wave; reads as no real decision made" },
    ],
    _flesh: "Reference = a strong worked design covering all 7 flow stages + the 9 multi-agent requirements + the production-grade checklist; the UBS PS supplies most of the content. Expand each rubric anchor with what a passing artifact must show. workedSolutionPlanned.",
    status: "skeleton" },

  { id: "ds-support-resolution-agent", roleTrack: "AIE", domain: "agentic-ops", modality: "design",
    specLevel: "S1", withheld: [], flawMode: null, difficulty: "senior", companies: ["Any"],
    tags: ["agentic", "support", "tool-calling", "escalation", "safety"],
    prompt: "Design an agent that resolves inbound support tickets end to end: diagnose, act via tools (refund/reset/lookup), or escalate — safely and auditable.",
    context: "Tools = order/billing/account APIs (side effects), knowledge base, human handoff. Asymmetric cost: a wrong automated refund/account action is expensive+often irreversible; a missed easy resolution burns CSAT.",
    produce: { artifact: "architecture + agent/tool catalogue + decision workflow + 2 traces + escalation notes + prod-readiness + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "tool-safety", anchor: "are irreversible tools (refund, account-mutation) behind an approval gate?", cost: "automated irreversible harm" },
      { dim: "escalation-threshold", anchor: "is there an explicit confidence bar below which it escalates, not acts?", cost: "confident wrong actions" },
      { dim: "idempotency", anchor: "does a re-delivered ticket event not double-act?", cost: "double refunds" },
      { dim: "auditability", anchor: "is every action logged with its basis?", cost: "undefendable decisions" },
      { dim: "eval-first", anchor: "defined success + a safety metric before building?", cost: "unprovable safety" },
    ],
    _flesh: "Reference = worked design; expand anchors. Emphasize approval gates on irreversible tools + abuse handling.",
    status: "skeleton" },

  { id: "ds-incident-triage-agent", roleTrack: "AIE", domain: "agentic-ops", modality: "design",
    specLevel: "S2", withheld: ["end-to-end-flow", "design-requirements"], flawMode: null, difficulty: "senior", companies: ["Any"],
    tags: ["agentic", "incident-response", "orchestration", "observability"],
    prompt: "Design an agent that triages production alerts, gathers evidence across observability systems, proposes a likely root cause + next action, and escalates safely.",
    context: "GIVEN: alerts (service/severity/signal); tools = metrics/logs/traces/deploy-log/runbooks/paging. Asymmetric cost: wrong auto-remediation worsens a sev-1; missed real incident delays MTTR. [S2: you DERIVE the end-to-end flow and the multi-agent design requirements — they are withheld from the brief and live only in the reference.]",
    produce: { artifact: "the derived flow + agent catalogue + decision workflow + 2 traces + escalation notes + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "requirement" },
    rubric: [
      { dim: "ambiguity-resolution", anchor: "did you derive the ingress->investigate->decide->escalate flow the brief withheld?", cost: "you only executed what you were handed — not a senior signal" },
      { dim: "evidence-fusion", anchor: "does your design reconcile conflicting signals across sources?", cost: "acts on one misleading signal" },
      { dim: "safe-escalation", anchor: "explicit bar for auto-remediate vs page-a-human?", cost: "an agent worsening a live incident" },
      { dim: "auditability", anchor: "reconstructable action trail?", cost: "no post-incident review" },
      { dim: "eval-first", anchor: "defined the trace set + a false-remediation metric first?", cost: "unprovable safety" },
    ],
    _flesh: "Reference (requirement type) = the withheld flow + design requirements a good answer must surface. Expand anchors.",
    status: "skeleton" },

  { id: "ds-claims-adjudication-agent", roleTrack: "AIE", domain: "agentic-ops", modality: "design",
    specLevel: "S4", withheld: ["business-scenario", "reference-cases", "end-to-end-flow", "design-requirements", "inputs", "tools"], flawMode: null, difficulty: "staff", companies: ["Any"],
    tags: ["agentic", "adjudication", "high-stakes", "ambiguity", "framing"],
    prompt: "Build something that helps adjudicate insurance claims.",
    context: "GIVEN ONLY that one line. [S4 apex: you must FRAME the problem — scope which claims, define auto-vs-refer, derive evidence sources, the flow, the requirements, the compliance boundary. Framing IS most of the grade.]",
    produce: { artifact: "a framed problem statement (scope, in/out, auto-vs-refer boundary, what must never be automated) THEN the design", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "requirement" },
    rubric: [
      { dim: "framing-from-near-zero", anchor: "did you turn one line into a scoped, bounded problem before designing?", cost: "you designed a solution to a problem you never defined" },
      { dim: "scoping-discipline", anchor: "explicit in/out and auto-vs-refer boundary?", cost: "unbounded, unshippable scope" },
      { dim: "high-stakes-safety", anchor: "named what must NEVER be automated + human-in-loop?", cost: "automating an irreversible wrong denial" },
      { dim: "compliance-awareness", anchor: "surfaced audit/regulatory constraints unprompted?", cost: "a design that can't be deployed" },
      { dim: "eval-first", anchor: "defined how you'd prove it safe?", cost: "unprovable" },
    ],
    _flesh: "Reference (requirement type) = the set of concerns a strong framing must raise; there is no single canonical architecture at S4 — grade the framing + requirement coverage, not a solution match.",
    status: "skeleton" },

  { id: "ds-rag-grounded-qa", roleTrack: "AIE", domain: "rag", modality: "design",
    specLevel: "S1", withheld: [], flawMode: null, difficulty: "senior", companies: ["Any"],
    tags: ["RAG", "grounding", "citation", "permissions", "abstention"],
    prompt: "Design a grounded QA assistant over a large permissioned corpus: cited answers, ACL-aware retrieval, abstain when unsupported, latency+cost budget.",
    context: "~millions of docs, per-doc permissions, p95 budget, cost-per-answer target. Failure = confident ungrounded answers or leaking restricted content.",
    produce: { artifact: "offline+online architecture + retrieval/rerank/generation design + permission model + eval plan + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "acl-before-retrieval", anchor: "is the permission filter applied INSIDE retrieval (pre-filter), so restricted chunks never reach the model?", cost: "leaked restricted content" },
      { dim: "grounding+abstain", anchor: "does the answer contract force citations + an explicit abstain path?", cost: "confident hallucinations shipped" },
      { dim: "eval-first", anchor: "defined a grounding/citation eval before building?", cost: "no regression signal" },
      { dim: "latency-budget", anchor: "decomposed p95 across retrieve/rerank/generate?", cost: "can't reason about where time goes" },
      { dim: "tradeoffs", anchor: "tied the cost target to concrete levers (context size, model tier, cache)?", cost: "unbounded cost" },
    ],
    _flesh: "Reference = worked design (ACL pre-filter, hybrid+rerank, grounded-answer contract, semantic cache). workedSolutionPlanned.",
    status: "skeleton" },

  { id: "ds-rag-multihop", roleTrack: "AIE", domain: "rag", modality: "design",
    specLevel: "S2", withheld: ["end-to-end-flow", "design-requirements"], flawMode: null, difficulty: "senior", companies: ["Any"],
    tags: ["RAG", "multi-hop", "decomposition", "grounding"],
    prompt: "Design a RAG system for questions that need 2-3 dependent lookups across linked documents.",
    context: "Answers chain facts (A->B->C); single-shot top-k fails. [S2: derive the decompose->retrieve->reason->retrieve flow + design requirements — hop planning, per-hop grounding, loop bounds.]",
    produce: { artifact: "the derived multi-hop flow + design + 2 traces (a clean 2-hop + a dead-end hop) + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "requirement" },
    rubric: [
      { dim: "ambiguity-resolution", anchor: "derived the iterative retrieve-reason-retrieve flow (not a single blended query)?", cost: "mediocre matches for the average of two needs" },
      { dim: "per-hop-grounding", anchor: "is each intermediate answer grounded before the next hop?", cost: "compounding hallucination across hops" },
      { dim: "loop-bounds", anchor: "explicit hop/termination limit?", cost: "runaway loops" },
      { dim: "abstain", anchor: "abstains on an unresolved hop?", cost: "fabricated bridge facts" },
      { dim: "eval-first", anchor: "per-hop eval defined first?", cost: "can't localize failure" },
    ],
    _flesh: "Reference (requirement) = the withheld flow + requirements. Expand anchors.",
    status: "skeleton" },

  { id: "ds-rag-evolving-corpus", roleTrack: "AIE", domain: "rag", modality: "design",
    specLevel: "S3", withheld: ["reference-cases", "end-to-end-flow", "design-requirements", "inputs", "tools"], flawMode: null, difficulty: "staff", companies: ["Any"],
    tags: ["RAG", "freshness", "conflict-resolution", "abstention"],
    prompt: "Build a grounded QA assistant over a corpus that changes hourly, where stale/conflicting answers are the main failure.",
    context: "GIVEN ONLY: that + 'answers must be current, cited, abstain when unsupported.' [S3: derive the reference cases, the ingest->retrieve->ground->serve flow, freshness/conflict requirements, the inputs, the tools.]",
    produce: { artifact: "framed requirements + the derived design + freshness/conflict handling + eval plan + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "requirement" },
    rubric: [
      { dim: "framing-under-ambiguity", anchor: "surfaced freshness + conflict + abstain as first-class WITHOUT being told?", cost: "solves the easy half, ships stale/conflicting answers" },
      { dim: "freshness", anchor: "event-driven incremental index + tombstones (not nightly rebuild)?", cost: "multi-hour staleness window" },
      { dim: "conflict-resolution", anchor: "freshness-weights/dedups conflicting versions?", cost: "cites a superseded policy" },
      { dim: "eval-first", anchor: "a freshness+grounding eval defined first?", cost: "no signal on the actual failure mode" },
      { dim: "tradeoffs", anchor: "stated the freshness vs cost tradeoff?", cost: "hand-wave" },
    ],
    _flesh: "Reference (requirement) = concerns a strong S3 answer raises unprompted. workedSolutionPlanned.",
    status: "skeleton" },

  { id: "ds-doc-extraction-agent", roleTrack: "AIE", domain: "doc-processing", modality: "design",
    specLevel: "S2", withheld: ["end-to-end-flow", "design-requirements"], flawMode: null, difficulty: "senior", companies: ["Any"],
    tags: ["doc-processing", "extraction", "confidence", "validation"],
    prompt: "Extract structured JSON fields from heterogeneous documents (invoices/forms/contracts) with confidence scores and human-review routing.",
    context: "Varied layouts, handwriting, tables. [S2: derive the ingest->extract->validate->route flow + requirements — confidence calibration, schema validation, low-confidence routing.] (~15% of AIE take-homes.)",
    produce: { artifact: "the derived flow + design + a confidence/routing policy + 2 traces + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "requirement" },
    rubric: [
      { dim: "ambiguity-resolution", anchor: "derived the validate+route stages the brief withheld?", cost: "garbage extractions flow downstream unchecked" },
      { dim: "confidence-calibration", anchor: "does low confidence actually route to a human (calibrated, not vibes)?", cost: "confident wrong fields trusted" },
      { dim: "schema-validation", anchor: "output validated against a schema before use?", cost: "malformed data breaks downstream" },
      { dim: "eval-first", anchor: "field-level accuracy eval defined first?", cost: "no quality signal" },
      { dim: "tradeoffs", anchor: "stated automation-rate vs accuracy tradeoff?", cost: "hand-wave" },
    ],
    _flesh: "Reference (requirement). Expand anchors; emphasize calibrated-confidence routing.",
    status: "skeleton" },

  { id: "ds-llm-eval-harness", roleTrack: "AIE", domain: "eval", modality: "design",
    specLevel: "S2", withheld: ["end-to-end-flow", "design-requirements"], flawMode: null, difficulty: "senior", companies: ["Any"],
    tags: ["evaluation", "guardrails", "llm-as-judge", "regression"],
    prompt: "Design the offline+online eval and guardrail layer for an existing LLM feature so quality regressions and unsafe outputs are caught before and after ship.",
    context: "A shipped LLM summarization feature with no eval. Tools: small gold set, traffic logs, a judge model. [S2: derive the eval flow + guardrail requirements.] Operationalizes the market's top signal — eval-first.",
    produce: { artifact: "the derived eval architecture (offline+online) + guardrail placement + judge-validation plan + regression gate + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "requirement" },
    rubric: [
      { dim: "eval-first", anchor: "does the design start from evals, not the feature?", cost: "the single biggest red flag YC cites" },
      { dim: "judge-validity", anchor: "is the judge model itself validated against human labels?", cost: "grading with an ungrounded grader" },
      { dim: "offline+online-split", anchor: "both a pre-ship gate AND live monitoring?", cost: "regressions ship or go unseen" },
      { dim: "guardrail-placement", anchor: "guardrails placed where they can actually block?", cost: "unsafe outputs reach users" },
      { dim: "tradeoffs", anchor: "stated eval cost vs coverage?", cost: "hand-wave" },
    ],
    _flesh: "Reference (requirement). Expand anchors; judge-validation is the graded core.",
    status: "skeleton" },

  { id: "ds-rag-refactor", roleTrack: "AIE", domain: "rag", modality: "refactor-debug",
    specLevel: "S1", withheld: [], flawMode: "F3",
    flawGraph: [
      { flawId: "f1", root: true, dependsOn: [], symptom: "no eval harness at all — you can't safely change anything without a way to prove behavior held; this masks the rest" },
      { flawId: "f2", root: false, dependsOn: ["f1"], symptom: "global mutable state makes retrieval untestable; only fixable once an eval/pinning harness (f1) exists" },
      { flawId: "f3", root: false, dependsOn: ["f1", "f2"], symptom: "prompt-injection open + no abstain path; surfaces as a real risk only after the service is testable" },
    ],
    difficulty: "staff", companies: ["Any"], tags: ["RAG", "refactor", "debug", "testability"],
    prompt: "Refactor a messy RAG service into a clean, testable architecture: preserve exact external behavior (API endpoints), eliminate global mutable state, close the correctness/safety gaps.",
    context: "A working-but-rotten RAG service. Not greenfield — find what is structurally wrong and fix it without changing the contract. Dependent flaws (see flawGraph).",
    produce: { artifact: "written diagnosis (flaws + dependency/root order) THEN the refactor plan preserving the contract", format: "written-diagnosis", workspace: "in-app-text" },
    reference: { type: "requirement" },
    rubric: [
      { dim: "found-root-first", anchor: "did you identify the missing-eval-harness root before the downstream fixes?", cost: "you refactor blind and can't prove behavior held" },
      { dim: "behavior-preservation", anchor: "does your plan keep the exact API contract?", cost: "silent breakage of callers" },
      { dim: "testability", anchor: "does it remove global state to make retrieval testable?", cost: "the rot returns next sprint" },
      { dim: "no-symptom-fixes", anchor: "did you avoid fixing f3 before f1/f2?", cost: "wasted effort on a symptom while the root persists" },
    ],
    _flesh: "Reference (requirement) = the flaw graph + the correct fix order + the pinning-test approach. This is the AIE flaw wedge as a build.",
    status: "skeleton" },

  { id: "ds-agent-debug-loop", roleTrack: "AIE", domain: "agentic-ops", modality: "flaw-diagnosis",
    specLevel: "S1", withheld: [], flawMode: "F3",
    flawGraph: [
      { flawId: "f1", root: true, dependsOn: [], symptom: "no termination bound — the loop never ends; this MASKS the idempotency bug because it never gets far enough to double-act until bounded" },
      { flawId: "f2", root: false, dependsOn: ["f1"], symptom: "tool results are not fed back into state, so the agent re-decides the same step; only observable once the loop is bounded" },
      { flawId: "f3", root: false, dependsOn: ["f1", "f2"], symptom: "retries without an idempotency key -> duplicate side effects; only reachable after the loop terminates and re-runs" },
    ],
    difficulty: "staff", companies: ["Any"], tags: ["agentic", "debug", "termination", "spot-the-flaw"],
    prompt: "An existing tool-calling agent loops forever / repeats actions / never converges. Diagnose why (in order) and give the fix.",
    context: "A working-but-broken agent loop. The AIE flaw wedge in agentic form — dependent flaws (see flawGraph).",
    produce: { artifact: "written diagnosis: the flaws, which is root, the order they must be fixed, and the fix", format: "written-diagnosis", workspace: "in-app-text" },
    reference: { type: "requirement" },
    rubric: [
      { dim: "found-root-first", anchor: "did you bound the loop (root) before the idempotency bug?", cost: "you 'fix' idempotency, see no change, and wrongly clear it" },
      { dim: "dependency-order", anchor: "is your fix order f1->f2->f3?", cost: "symptom-chasing" },
      { dim: "causal-reasoning", anchor: "did you explain WHY f1 masks f2/f3?", cost: "pattern-matched, not understood" },
    ],
    _flesh: "Reference (requirement) = the flaw graph + why the root masks the dependents. Render via the LiveIncident engine if a stateful reveal is wanted.",
    status: "skeleton" },
  // ── Authored ROOT + variations: RAG pipeline (2026-07-21). First fully-authored root.
  { id: "ds-rag-pipeline-root", roleTrack: "AIE", domain: "rag", modality: "design",
    specLevel: "S1", withheld: [], flawMode: null, difficulty: "senior", companies: ["Any"],
    tags: ["rag", "retrieval", "reranking", "grounding", "eval", "root"], isRoot: true,
    prompt: "Design a production RAG system that answers grounded, cited questions over a large, evolving corpus — and stays trustworthy across single-fact, multi-hop, time-sensitive, and unanswerable queries.",
    context: "Enterprise support corpus, ~180k chunks, growing weekly. Query mix: single-fact lookups, multi-hop ('does X's policy also apply to Y'), time-sensitive ('current refund window'), and some the corpus genuinely cannot answer. Latency budget ~2.5s p95. Offline recall@8 already looks excellent (~0.93); human answer-quality is the real target.",
    produce: { artifact: "architecture (ingest -> retrieve -> rerank -> generate -> verify) + the eval plan (metrics defined FIRST) + how each of the 5 failure layers is handled + explicit latency/cost tradeoffs + assumptions", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution", worked: `A strong answer builds RAG as an ORDERED STACK, not a single retriever, and defines the eval before the architecture.

1. Recall is solved, precision is not. recall@8=0.93 only means the right chunk is usually present — it says nothing about the ~5 distractor chunks arriving with it. LLMs attend to distractors, so adjacent-but-wrong facts bleed in. Fix: a cross-encoder reranker over top-50 candidates -> curated top-4. Measure precision@k, not just recall.

2. Multi-hop is a query-planning problem, not a top-k problem. A single dense vector averages a two-entity question and surfaces whichever entity dominates; an aggressive top-4 cut then drops the second entity entirely. Fix: decompose into per-entity sub-queries (or multi-vector retrieval) with a guaranteed per-entity chunk budget BEFORE reranking.

3. Semantic relevance is version-blind. Two near-identical chunks (14-day vs 30-day refund) are equally about the query; the reranker ties and the stale one wins about half the time. Fix: treat the index as bitemporal — keep all versions, filter to effective ones (effective_date <= now), add a recency prior at rerank. Never delete old versions (breaks 'what was the policy last quarter').

4. Abstention is a required output, not a failure. With no confidence gate, unanswerable queries still get the k least-bad chunks and a model always instructed to answer — producing fluent fabrication. Fix: a calibrated retrieval-confidence gate (abstain/escalate below threshold) PLUS a grounding/faithfulness check (claim-level entailment against context) before returning.

5. Eval-first or you are blind. Define precision@k, per-hop coverage, temporal-correctness, and faithfulness up front and run them on a live sample — no single metric, least of all recall, reveals this layered failure. Each layer only becomes visible once the one above it is fixed.

Tradeoffs to state: reranking depth vs latency (a top-50 cross-encoder adds ms); decomposition vs cost (extra LLM calls per multi-need query); abstention threshold vs coverage (a higher bar means more 'I don't know' but fewer fabrications).` },
    rubric: [
      { dim: "precision-not-recall", anchor: "point to the reranking/curation stage — does your design separate 'is the answer retrievable' (recall) from 'is it findable amid distractors' (precision)?", cost: "high recall hides distractor noise; the model synthesises confident-but-wrong answers" },
      { dim: "multi-hop-coverage", anchor: "for 'does X's policy also apply to Y', show how BOTH entities are guaranteed into context (decomposition or per-entity budget), not left to one dense vector", cost: "single-shot retrieval keeps the dominant entity and silently drops the other" },
      { dim: "recency-versioning", anchor: "point to the explicit signal that makes the CURRENT version win when two near-identical chunks disagree", cost: "semantic search is version-blind; stale answers served about half the time" },
      { dim: "abstention-grounding", anchor: "where does the system say 'I don't know', and where does it verify the answer is grounded before returning?", cost: "fluent fabrication on queries the corpus cannot answer" },
      { dim: "eval-first", anchor: "did you define precision@k, per-hop coverage, temporal-correctness, and faithfulness BEFORE drawing the architecture?", cost: "recall alone hides every downstream failure; you cannot tell which layer broke" },
      { dim: "latency-cost-tradeoff", anchor: "state one place you traded retrieval breadth vs latency/cost and the number you targeted", cost: "reads as no real decision; silently blows the SLA or the budget" },
    ],
    status: "authored" },

  { id: "ds-rag-var-scale-acl", roleTrack: "AIE", domain: "rag", modality: "design",
    specLevel: "S2", withheld: ["reference-prose"], flawMode: null, difficulty: "senior", companies: ["Any"], parentRoot: "ds-rag-pipeline-root",
    tags: ["rag", "scale", "permissions", "cost", "variation"],
    prompt: "Variation of the RAG root: 4M documents / ~40GB, per-document permissions (not everyone can see HR/legal), 30 QPS, <3s p95, and cost per answered question under ~$0.02. Design it.",
    context: "Scaffold (S2 — first stages given): (1) ingest + chunk + embed at scale; (2) ACL-aware retrieval — a user only ever sees chunks from docs they are authorized to read (a hard requirement, not a post-filter); (3) ...you complete rerank/generate/verify + the cost math.",
    produce: { artifact: "architecture + the ACL model at retrieval time + a per-query cost breakdown landing under $0.02 + the same 5-layer trustworthiness handling + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "acl-at-retrieval", anchor: "is permission enforced INSIDE retrieval (filter before rank), so unauthorized chunks never enter context — not filtered from the answer afterward?", cost: "data leak: a user sees HR/legal content they cannot access" },
      { dim: "cost-per-query-math", anchor: "show the actual per-query cost breakdown (embed + retrieve + rerank + generate) landing under $0.02", cost: "hand-waved cost; the $0.02 target is unmet and unprovable" },
      { dim: "precision-not-recall", anchor: "is there a rerank/curation stage separating recall from precision (as in the root)?", cost: "distractor noise -> wrong answers" },
      { dim: "freshness-sla", anchor: "how does a doc edited this morning become answerable within minutes (not a nightly batch) without a full reindex?", cost: "stale answers on fast-changing corpora (tickets, chat)" },
      { dim: "abstention-grounding", anchor: "where does it abstain + verify grounding before returning?", cost: "fabrication at 30 QPS scales the blast radius" },
    ],
    status: "authored" },

  { id: "ds-rag-var-hallucinate", roleTrack: "AIE", domain: "rag", modality: "diagnose",
    specLevel: "S3", withheld: ["reference-prose", "stage-skeleton"], flawMode: "silent", difficulty: "senior", companies: ["Any"], parentRoot: "ds-rag-pipeline-root",
    tags: ["rag", "precision", "grounding", "hallucination", "variation"],
    prompt: "Variation of the RAG root: recall@8 is 0.93 but 39% of answers are wrong — and the correct chunk IS in context. Diagnose the leak and design the fix. (Minimal scaffold.)",
    context: "The model cites retrieved text but blends in an adjacent, wrong fact. Precision@8 is not measured; a spot audit finds ~3 of 8 chunks on-topic. No reranker yet. Latency budget 2.5s.",
    produce: { artifact: "the root cause (why high recall coexists with wrong answers) + the fix (staged retrieval) + how you would PROVE it worked + what you would NOT do, and why", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "diagnosis-precision", anchor: "do you name PRECISION / context-noise (not recall, not the embedder, not the LLM hallucinating independently) as the leak?", cost: "misdiagnosis -> you chase recall or swap models and it gets worse" },
      { dim: "anti-pattern-named", anchor: "do you explicitly reject 'raise k / upgrade the embedder' as making distractor mass worse?", cost: "the most common junior move; adds noise, lowers quality" },
      { dim: "reranker-fix", anchor: "point to a cross-encoder rerank (top-50 -> curated top-k) as the precision stage", cost: "no precision control; the leak persists" },
      { dim: "proof", anchor: "how do you measure precision@k and answer-quality BEFORE and AFTER to prove the fix?", cost: "no evidence the change helped; you are guessing" },
    ],
    status: "authored" },

  { id: "ds-rag-var-temporal", roleTrack: "AIE", domain: "rag", modality: "design",
    specLevel: "S4", withheld: ["reference-prose", "stage-skeleton", "hints"], flawMode: null, difficulty: "staff", companies: ["Any"], parentRoot: "ds-rag-pipeline-root",
    tags: ["rag", "temporal", "versioning", "bitemporal", "variation"],
    prompt: "Variation of the RAG root (own it — no scaffold): time-sensitive questions ('current refund window') return confidently stale answers. Both the old 14-day and new 30-day chunks are indexed and near-identical semantically. Design the system so the current answer wins, without losing history.",
    context: "You get the problem only. Bring your own structure, metrics, and tradeoffs.",
    produce: { artifact: "full design: how retrieval/rerank become recency-aware, how history is preserved, the metric that catches staleness, and the tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "version-blindness-named", anchor: "do you state that semantic relevance is orthogonal to recency, so neither retrieval nor a plain reranker prefers the current version?", cost: "you 'fix' the embedder instead — the wrong lever" },
      { dim: "bitemporal-signal", anchor: "point to the metadata signal (effective_date / version) applied at retrieval or rerank that breaks the tie toward current", cost: "the stale chunk keeps winning about half the time" },
      { dim: "history-preserved", anchor: "do you KEEP old versions (not delete them), so 'what was the policy last quarter' still works?", cost: "deleting versions destroys the audit trail and breaks historical queries" },
      { dim: "temporal-metric", anchor: "what metric detects a confidently-stale answer, and on what sample?", cost: "staleness is invisible until a user is misinformed" },
      { dim: "tradeoff", anchor: "state the cost of recency-awareness (metadata pipeline, rerank complexity) vs the risk of staleness", cost: "reads as no real engineering decision" },
    ],
    status: "authored" },

  // ── Authored ROOT + variations: Agentic tool-use (2026-07-21).
  { id: "ds-agentic-tooluse-root", roleTrack: "AIE", domain: "agents", modality: "design",
    specLevel: "S1", withheld: [], flawMode: null, difficulty: "senior", companies: ["Any"], isRoot: true,
    tags: ["agents", "tool-use", "termination", "safety", "eval", "root"],
    prompt: "Design a production tool-using agent that resolves a task end to end — diagnose, act via tools, then confirm or escalate — safely, cheaply, and reliably.",
    context: "ReAct loop, ~14 tools (several overlapping), 128k context, side-effectful tools (refund / account mutation). Observed: task success 78% in eval but 54% in production, p95 latency blows the budget, token spend ~3x the estimate. Median 4-6 tool calls per resolved task.",
    produce: { artifact: "architecture + tool-contract design + termination/step-budget policy + context/memory management + safety gates + eval plan (defined first) + single-vs-multi-agent justification + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution", worked: `A strong answer treats the tool interface, termination, context, and safety as first-class design — not the model.

1. Tool interface is the first-order lever. Overlapping, thinly-described tools make routing a guess and under-specified schemas make argument construction a guess. Fix: distinct verbs, non-overlapping 'use this when' descriptions (say when NOT to use each), typed schemas with one concrete argument example per tool, and consolidation of redundant tools. Routing accuracy is an interface property first, a model property second — upgrading the model does not disambiguate two identically-described tools.

2. Termination. With no step budget the agent re-plans forever and re-issues identical calls. Add a max-step budget, loop/duplicate-call detection (remember what you already tried), and a forced-final-answer fallback when the budget is hit.

3. Context management. Replaying the full transcript every step blows context and cost. Summarize/compact the trajectory and scope memory to what the next decision needs.

4. Safety. Irreversible tools (refund, account mutation) sit behind an approval gate plus a confidence bar below which the agent escalates rather than acts. Every automated action is reconstructable from a recorded trace.

5. Eval-first. Define tool-selection accuracy, cost-per-task, and a false-action rate BEFORE the architecture, so you can prove it is safe and affordable to trust.

Tradeoffs: single-agent vs multi-agent (reach for multi only when roles/authority genuinely separate); interface fixes vs a bigger model; autonomy vs approval latency.` },
    rubric: [
      { dim: "tool-contract", anchor: "point to how the agent disambiguates overlapping tools zero-shot (disjoint 'use this when' descriptions + typed args + one example each), not by a bigger model", cost: "wrong-tool / malformed-arg errors; you escalate model size and pay more for the same interface bug" },
      { dim: "termination", anchor: "where is the step budget + duplicate-call/loop detection + forced-answer fallback?", cost: "the agent loops forever on hard tasks and blows the latency budget" },
      { dim: "context-management", anchor: "do you compact/summarize the trajectory instead of replaying the full transcript every step?", cost: "context blowup and ~3x token spend; earlier context is lost" },
      { dim: "safety-gates", anchor: "are irreversible tools behind an approval gate + a confidence bar to escalate rather than act?", cost: "a confident wrong irreversible action (bad refund / account mutation)" },
      { dim: "eval-first", anchor: "did you define tool-selection accuracy, cost-per-task, and a false-action rate before the architecture?", cost: "no way to know it is safe or affordable to trust" },
      { dim: "single-vs-multi", anchor: "did you justify single-agent vs multi-agent instead of reaching for multi by default?", cost: "needless orchestration complexity, or a monolith that should have been split" },
    ],
    status: "authored" },

  { id: "ds-agentic-var-tool-routing", roleTrack: "AIE", domain: "agents", modality: "diagnose",
    specLevel: "S2", withheld: ["reference-prose"], flawMode: "silent", difficulty: "senior", companies: ["Any"], parentRoot: "ds-agentic-tooluse-root",
    tags: ["agents", "tool-routing", "schema", "variation"],
    prompt: "Variation of the agentic root: first-action failures dominate — right intent, wrong tool (get_order vs search_orders vs lookup), or correct tool with malformed nested args. Diagnose and fix. (Scaffold: the tool list + descriptions are given for you to critique.)",
    context: "Three tools named get_order / search_orders / lookup with near-identical one-line descriptions. Argument errors cluster on tools whose schema uses nested objects with no example.",
    produce: { artifact: "the root cause (interface, not model) + the rewritten tool contract + what you would NOT do (and why)", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "interface-diagnosis", anchor: "do you locate the failure in the tool CONTRACT (naming, disjoint descriptions, arg schema+examples), not in model capability?", cost: "you escalate model size; the ambiguous menu remains and errors creep back" },
      { dim: "disjoint-descriptions", anchor: "do you rewrite descriptions to say when NOT to use each tool and consolidate redundant ones?", cost: "routing stays a guess" },
      { dim: "typed-arg-examples", anchor: "one concrete argument example per tool for nested schemas?", cost: "argument malformation persists" },
      { dim: "anti-pattern", anchor: "do you explicitly reject 'upgrade the model to route better'?", cost: "masks a few cases at higher cost; the interface bug stays" },
    ],
    status: "authored" },

  { id: "ds-agentic-var-nontermination", roleTrack: "AIE", domain: "agents", modality: "diagnose",
    specLevel: "S3", withheld: ["reference-prose", "stage-skeleton"], flawMode: "silent", difficulty: "senior", companies: ["Any"], parentRoot: "ds-agentic-tooluse-root",
    tags: ["agents", "termination", "loops", "variation"],
    prompt: "Variation of the agentic root: routing is fixed, but hard tasks never terminate — the agent re-issues an identical call it already made, gets the same observation, 'reconsiders', and loops until a wall-clock timeout. Fix it. (Minimal scaffold.)",
    context: "22 tool calls, no final answer, killed at 60s. The agent has no memory that it already tried the failing call.",
    produce: { artifact: "why it loops + the termination design (budget, loop/duplicate detection, forced answer) + the metric that catches it", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "loop-root-cause", anchor: "do you name the missing step budget + no-memory-of-prior-attempts as the cause, not 'the model is bad at planning'?", cost: "you tweak the prompt; it still loops" },
      { dim: "budget-and-detection", anchor: "point to a max-step budget AND duplicate-call/loop detection", cost: "unbounded re-planning; latency and cost blow up" },
      { dim: "forced-answer", anchor: "is there a graceful forced-final-answer / escalate path at the budget?", cost: "the task dies at timeout with no result" },
      { dim: "metric", anchor: "what metric (steps-per-task, repeat-call rate) surfaces this before users hit timeouts?", cost: "the loop is invisible until production p95 explodes" },
    ],
    status: "authored" },

  { id: "ds-agentic-var-multiagent", roleTrack: "AIE", domain: "agents", modality: "design",
    specLevel: "S4", withheld: ["reference-prose", "stage-skeleton", "hints"], flawMode: null, difficulty: "staff", companies: ["Any"], parentRoot: "ds-agentic-tooluse-root",
    tags: ["agents", "multi-agent", "orchestration", "variation"],
    prompt: "Variation of the agentic root (own it — no scaffold): when should this be MULTIPLE coordinated agents instead of one, and what breaks if you split it wrong? Design the multi-agent version and its failure modes.",
    context: "You get the question only. Bring your own criteria, coordination design, and tradeoffs.",
    produce: { artifact: "the single-vs-multi decision criteria + the coordination design (authority, hand-off, shared state) + what breaks when split wrong + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "when-to-split", anchor: "do you give a real criterion for multi-agent (separable authority/roles, independent tool domains) rather than 'it's more powerful'?", cost: "needless orchestration overhead and latency for a task one agent handles" },
      { dim: "authority-per-agent", anchor: "is each agent's authority + what it must defer explicit (not a monolith in disguise)?", cost: "one failing agent corrupts the whole resolution path" },
      { dim: "coordination-failure", anchor: "do you name the split-wrong failure modes (shared-state races, hand-off loss, conflicting actions)?", cost: "multi-agent deadlocks / double-acts and is harder to debug than one agent" },
      { dim: "tradeoff", anchor: "single-agent simplicity vs multi-agent separation — stated with the deciding factor?", cost: "reads as cargo-culting the trend" },
    ],
    status: "authored" },

  // ── Authored ROOT + variations: Eval & monitoring harness (2026-07-21).
  { id: "ds-eval-harness-root", roleTrack: "AIE", domain: "eval", modality: "design",
    specLevel: "S1", withheld: [], flawMode: null, difficulty: "senior", companies: ["Any"], isRoot: true,
    tags: ["eval", "monitoring", "llm-judge", "silent-failures", "root"],
    prompt: "Design an evaluation and monitoring system for an LLM feature in production — offline evals, online monitoring, and catching silent quality regressions WITHOUT ground-truth labels.",
    context: "An LLM feature (RAG or agent) with no gold labels at scale. Quality drifts silently when prompts, models, or data change. You must catch regressions before users do, and prove quality to ship.",
    produce: { artifact: "the eval architecture (offline eval set + CI gate + online monitors) + how you eval without ground truth + the failure-mode metrics + rollout/rollback + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution", worked: `A strong answer evaluates without ground truth and gates deploys — it does not trust vibes.

1. LLM-as-judge, but calibrated. A strong model can grade, but validate the judge against human labels on a sample, control for position and verbosity bias, and prefer pairwise comparisons over absolute scores. An uncalibrated judge is confidently wrong.

2. No ground truth -> reference-free signals. Faithfulness/groundedness (claim-level entailment against the retrieved context), self-consistency across samples, and a small human-in-the-loop sample. You can eval far more than the tiny slice you have gold labels for.

3. Name and monitor the silent failure modes. Hallucination, refusal, format break, latency, and cost each get an explicit metric and an alert threshold, sampled from production daily.

4. Regression gate. An eval set runs in CI on every prompt/model change and blocks deploy on a faithfulness/quality drop; ship behind a canary with automatic rollback.

5. Curate the eval set. Build it from real production failures and edge cases, protect it from contamination, and refresh it as the product evolves — a stale eval is a gamed eval.

Tradeoffs: judge cost vs coverage; sample rate vs catching rare failures; a strict gate vs release velocity.` },
    rubric: [
      { dim: "judge-calibration", anchor: "do you validate the LLM-judge against human labels and control its biases, not trust it blindly?", cost: "a miscalibrated judge greenlights regressions with confidence" },
      { dim: "no-ground-truth", anchor: "what reference-free signals (faithfulness, self-consistency) catch quality without gold labels?", cost: "you can only eval the tiny slice you have labels for = almost nothing at scale" },
      { dim: "silent-failure-monitors", anchor: "which failure modes get an explicit metric + alert (hallucination, refusal, format, latency, cost)?", cost: "quality rots silently until users complain" },
      { dim: "regression-gate", anchor: "is there a CI eval that blocks deploy on a quality drop, plus canary + rollback?", cost: "a one-line prompt tweak ships a regression to everyone" },
      { dim: "eval-set-curation", anchor: "is the eval set built from real failures and protected from contamination?", cost: "you pass a stale, gamed eval and fail in production" },
      { dim: "tradeoff", anchor: "judge cost vs coverage, or sample-rate vs rare-failure catch — stated?", cost: "reads as no real decision" },
    ],
    status: "authored" },

  { id: "ds-eval-var-no-ground-truth", roleTrack: "AIE", domain: "eval", modality: "diagnose",
    specLevel: "S2", withheld: ["reference-prose"], flawMode: null, difficulty: "senior", companies: ["Any"], parentRoot: "ds-eval-harness-root",
    tags: ["eval", "no-ground-truth", "faithfulness", "variation"],
    prompt: "Variation of the eval root: you have no labeled correct answers at scale — how do you evaluate hallucination in production? (Scaffold: an LLM-judge is available; design around it.)",
    context: "Millions of answers, a few hundred human labels at most. Faithfulness matters more than exact-match.",
    produce: { artifact: "the reference-free eval design (faithfulness/grounding, self-consistency, sampled human) + how you trust the judge + the metric you report", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "reference-free-signal", anchor: "point to grounding/faithfulness (claim entailment vs context) as the primary label-free signal", cost: "you claim you cannot eval without labels and monitor nothing" },
      { dim: "judge-trust", anchor: "how do you validate the judge on the human sample and control bias?", cost: "you trust an uncalibrated judge" },
      { dim: "sampling", anchor: "a human-in-the-loop sample on a small % to anchor the automated signals?", cost: "no ground-truth anchor at all; drift undetectable" },
      { dim: "metric", anchor: "what single production metric (faithfulness rate) do you alert on?", cost: "lots of dashboards, no decision signal" },
    ],
    status: "authored" },

  { id: "ds-eval-var-silent-regression", roleTrack: "AIE", domain: "eval", modality: "diagnose",
    specLevel: "S3", withheld: ["reference-prose", "stage-skeleton"], flawMode: "silent", difficulty: "senior", companies: ["Any"], parentRoot: "ds-eval-harness-root",
    tags: ["eval", "regression", "ci-gate", "variation"],
    prompt: "Variation of the eval root: a prompt change last week silently dropped answer quality and nobody noticed for days. Design the system that would have caught it within an hour. (Minimal scaffold.)",
    context: "No CI eval on prompt changes. No production quality monitor. The change looked harmless in review.",
    produce: { artifact: "the CI eval gate + the online monitor + the alert that fires in an hour + rollback", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "ci-gate", anchor: "does every prompt/model change run an eval set that blocks on a quality drop?", cost: "regressions ship because nothing checks them pre-deploy" },
      { dim: "online-monitor", anchor: "what production signal (faithfulness/refusal rate) alerts within an hour of a drop?", cost: "days of degraded answers before anyone notices" },
      { dim: "rollback", anchor: "canary + automatic rollback on the alert?", cost: "you detect it but the bad version is still serving everyone" },
      { dim: "anti-pattern", anchor: "do you reject 'we'll eyeball it in review' as the safeguard?", cost: "human review misses subtle quality drops every time" },
    ],
    status: "authored" },

  { id: "ds-eval-var-judge-bias", roleTrack: "AIE", domain: "eval", modality: "design",
    specLevel: "S4", withheld: ["reference-prose", "stage-skeleton", "hints"], flawMode: null, difficulty: "staff", companies: ["Any"], parentRoot: "ds-eval-harness-root",
    tags: ["eval", "judge-bias", "calibration", "variation"],
    prompt: "Variation of the eval root (own it — no scaffold): your LLM-judge scores verbose answers higher and tends to agree with its own outputs; the eval is being gamed. Fix the eval.",
    context: "You get the problem only. Bring your own debiasing and validation design.",
    produce: { artifact: "why the judge is biased + the debiasing (pairwise, position swaps, length control, human anchor) + how you validate the fix", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "bias-named", anchor: "do you name verbosity + self-preference (and position) bias specifically?", cost: "you keep trusting a judge that rewards the wrong thing" },
      { dim: "pairwise-and-swaps", anchor: "pairwise comparison with position swaps instead of absolute scoring?", cost: "absolute scores stay biased and gameable" },
      { dim: "length-control", anchor: "how do you neutralize the length/verbosity advantage?", cost: "the model games the judge by padding" },
      { dim: "human-anchor", anchor: "how do you re-validate the debiased judge against humans?", cost: "you assume the fix worked without proof" },
    ],
    status: "authored" },

  // ── Authored ROOT + variations: Inference / serving optimization (2026-07-21).
  { id: "ds-serving-root", roleTrack: "AIE", domain: "production", modality: "design",
    specLevel: "S1", withheld: [], flawMode: null, difficulty: "senior", companies: ["Any"], isRoot: true,
    tags: ["serving", "inference", "batching", "cost", "reliability", "root"],
    prompt: "Design the serving / inference layer for an LLM product at scale — throughput, latency, and cost under bursty load and provider limits.",
    context: "Traffic 100 -> 5000 req/s (bursty). p95 latency SLA. GPU / API spend is the top line item. Mixed short and long prompts. Provider rate limits and occasional outages.",
    produce: { artifact: "the serving architecture (batching, caching, routing) + the cost/latency budget + the reliability design (rate limits, failover) + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution", worked: `A strong answer treats serving as a throughput/cost/reliability system, not 'call the API'.

1. Batching. Continuous / dynamic batching (vLLM-style) raises GPU utilization; separate prefill from decode so long prompts do not stall short ones. Idle GPUs are the biggest silent cost.

2. Caching. KV cache for in-flight sequences, prompt/prefix caching for shared system prompts, and a semantic cache for repeated queries — so you stop re-paying prefill for identical context.

3. Route by complexity/cost. Cheap/small model for easy queries, the big model only when needed; a classifier or heuristic decides. You should not pay frontier prices for trivial queries.

4. Quantization, measured. Quantize to cut cost and latency, but measure the accuracy drop on your eval — never quantize blind.

5. Reliability. Handle rate limits with backpressure and queues, fail over across providers/models, and remove single points of failure so one provider blip is not a full outage.

Tradeoffs: batch size vs tail latency; quantization vs quality; cache TTL vs freshness; routing complexity vs savings.` },
    rubric: [
      { dim: "batching", anchor: "point to continuous/dynamic batching + prefill/decode separation to raise GPU utilization", cost: "GPUs sit idle; you pay for capacity you do not use and miss throughput" },
      { dim: "caching", anchor: "KV / prompt-prefix / semantic caching for shared prefixes and repeats?", cost: "you re-pay prefill for every identical system prompt and repeated query" },
      { dim: "complexity-routing", anchor: "do you route easy queries to a cheap model and reserve the big model for hard ones?", cost: "you pay frontier prices for trivial queries" },
      { dim: "quantization-measured", anchor: "do you quantize AND measure the accuracy drop, not blind?", cost: "silent quality loss from over-aggressive quantization" },
      { dim: "reliability", anchor: "rate-limit backpressure + cross-provider failover so no single provider is a SPOF?", cost: "one provider outage is a full product outage" },
      { dim: "tradeoff", anchor: "batch size vs tail latency (or quant vs quality) stated with the number?", cost: "reads as no real decision" },
    ],
    status: "authored" },

  { id: "ds-serving-var-scale", roleTrack: "AIE", domain: "production", modality: "design",
    specLevel: "S2", withheld: ["reference-prose"], flawMode: null, difficulty: "senior", companies: ["Any"], parentRoot: "ds-serving-root",
    tags: ["serving", "scale", "latency", "variation"],
    prompt: "Variation of the serving root: traffic jumps 100 -> 5000 req/s and both latency and cost blow up. Scale it. (Scaffold: continuous batching is given; design the rest.)",
    context: "Bursty load, mixed prompt lengths, a hard p95 SLA.",
    produce: { artifact: "the scale-out design (batching config, autoscaling, queueing/backpressure) + the latency budget + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "throughput", anchor: "how do batching + autoscaling raise req/s without breaking p95?", cost: "you scale replicas blindly and still miss the SLA" },
      { dim: "backpressure", anchor: "queueing / backpressure for bursts instead of dropping or timing out?", cost: "bursts cause cascading timeouts" },
      { dim: "prefill-decode", anchor: "do long prompts stall short ones, and how do you prevent it?", cost: "head-of-line blocking spikes tail latency" },
      { dim: "cost-at-scale", anchor: "the $/1000-req number at 5000 req/s?", cost: "you scale into a runaway bill" },
    ],
    status: "authored" },

  { id: "ds-serving-var-cost", roleTrack: "AIE", domain: "production", modality: "diagnose",
    specLevel: "S3", withheld: ["reference-prose", "stage-skeleton"], flawMode: "silent", difficulty: "senior", companies: ["Any"], parentRoot: "ds-serving-root",
    tags: ["serving", "cost", "routing", "quantization", "variation"],
    prompt: "Variation of the serving root: inference cost is 40% over budget. Cut it without losing quality. (Minimal scaffold.)",
    context: "Every query hits the frontier model. No caching. No quantization. Many queries are trivial or repeated.",
    produce: { artifact: "the ordered cost-reduction plan (biggest ROI first) + the quality guardrail that proves no regression", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "biggest-roi-first", anchor: "do you order the levers by ROI (routing/caching before micro-optimizations)?", cost: "you optimize pennies while the big waste (frontier-for-everything) remains" },
      { dim: "routing", anchor: "route trivial queries to a cheaper model?", cost: "you pay top price for easy queries" },
      { dim: "caching", anchor: "semantic/prompt caching for repeats and shared prefixes?", cost: "you re-pay for identical work" },
      { dim: "quality-guardrail", anchor: "how do you prove the cheaper path did not drop quality (eval gate)?", cost: "you cut cost and silently cut quality" },
    ],
    status: "authored" },

  { id: "ds-serving-var-outage", roleTrack: "AIE", domain: "production", modality: "design",
    specLevel: "S4", withheld: ["reference-prose", "stage-skeleton", "hints"], flawMode: null, difficulty: "staff", companies: ["Any"], parentRoot: "ds-serving-root",
    tags: ["serving", "reliability", "failover", "spof", "variation"],
    prompt: "Variation of the serving root (own it — no scaffold): a single LLM-provider outage took your entire product down. Eliminate the single point of failure.",
    context: "You get the incident only. Bring your own failover and degradation design.",
    produce: { artifact: "the multi-provider/model failover + graceful degradation + how you test it + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "no-spof", anchor: "do you remove the single-provider dependency (multi-provider/model abstraction)?", cost: "the next provider blip is another full outage" },
      { dim: "failover", anchor: "automatic failover with health checks, not manual?", cost: "downtime while a human notices and switches" },
      { dim: "graceful-degradation", anchor: "a degraded mode (cached/smaller model) rather than hard-down?", cost: "all-or-nothing availability" },
      { dim: "tested", anchor: "how do you regularly TEST failover (game-day / chaos)?", cost: "untested failover fails exactly when needed" },
    ],
    status: "authored" },

  // ── Authored ROOT + variations: Adaptation decision — prompt vs RAG vs finetune vs SLM (2026-07-21).
  { id: "ds-adaptation-root", roleTrack: "AIE", domain: "foundations", modality: "design",
    specLevel: "S1", withheld: [], flawMode: null, difficulty: "senior", companies: ["Any"], isRoot: true,
    tags: ["adaptation", "rag-vs-finetune", "lora", "small-models", "root"],
    prompt: "Given a task, decide how to adapt an LLM — prompt engineering vs RAG vs fine-tuning vs a small/task-specific model — and justify the choice on cost, data, freshness, and maintenance.",
    context: "The team reflexively wants to fine-tune 'to teach the model our docs'. The task: domain Q&A over facts that change often, limited labeled data, a tight latency/cost budget, and a real catastrophic-forgetting risk.",
    produce: { artifact: "the decision (with the ladder you walked) + why the alternatives lose + the eval that proves it beat the baseline + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution", worked: `A strong answer walks a cost ladder and matches the method to the goal — it does not reach for fine-tuning first.

1. Cheapest, most flexible first. Prompt / few-shot -> RAG -> fine-tune -> pretrain. Most 'we must fine-tune' is really a retrieval or prompting problem.

2. RAG vs fine-tune is about WHAT you're changing. RAG for knowledge that changes, needs citations, or is large. Fine-tune for BEHAVIOR — format, style, tone, latency — not to inject facts. Fine-tuned facts go stale and are brittle; you would have to retrain to change a policy.

3. Match the fine-tuning method. LoRA/QLoRA (cheap adapters) vs full fine-tune; instruction/SFT vs preference (DPO/RLHF) — pick by goal. Guard catastrophic forgetting (adapters, or mix general data back in).

4. Consider a small / task-specific model. For a narrow, high-volume task a distilled small model is cheaper and faster than a frontier model — the direction the market is moving.

5. Prove it. Fine-tuning needs quality labeled data AND an eval showing it beat the RAG/prompt baseline. Never fine-tune without that comparison.

Tradeoffs: freshness/flexibility (RAG) vs latency/cost (fine-tune/SLM); data cost; and the permanent maintenance burden — a fine-tune is a model you now own and retrain forever.` },
    rubric: [
      { dim: "cheapest-first", anchor: "do you try prompt/RAG before reaching for fine-tuning?", cost: "you fine-tune (expensive, a model to maintain forever) for what prompting or retrieval already solves" },
      { dim: "rag-vs-finetune", anchor: "do you use RAG for changing FACTS and fine-tune for BEHAVIOR/format — not fine-tune to inject facts?", cost: "fine-tuned facts go stale and brittle; you retrain just to update a policy" },
      { dim: "method-match", anchor: "is the fine-tune method (LoRA vs full, SFT vs DPO) matched to the goal, with catastrophic forgetting guarded?", cost: "wrong method, or the model forgets its general ability" },
      { dim: "small-model-option", anchor: "do you consider a distilled/small task-specific model for the high-volume narrow case?", cost: "you pay frontier cost and latency for a task a small model does better" },
      { dim: "baseline-eval", anchor: "do you require an eval proving the adaptation beat the prompt/RAG baseline before committing?", cost: "you ship a costly fine-tune with no proof it helped" },
      { dim: "tradeoff", anchor: "freshness vs latency/cost, and the maintenance burden, stated?", cost: "reads as no real decision" },
    ],
    status: "authored" },

  { id: "ds-adaptation-var-finetune-reflex", roleTrack: "AIE", domain: "foundations", modality: "diagnose",
    specLevel: "S2", withheld: ["reference-prose"], flawMode: null, difficulty: "senior", companies: ["Any"], parentRoot: "ds-adaptation-root",
    tags: ["adaptation", "rag-vs-finetune", "variation"],
    prompt: "Variation of the adaptation root: the team wants to fine-tune to 'teach the model our constantly-updated docs.' Make the call and defend it. (Scaffold: the RAG-vs-finetune decision tree is given.)",
    context: "Docs change weekly. They have no labeled data. They want citations.",
    produce: { artifact: "the recommendation + why fine-tuning is the wrong tool here + what you would do instead + when fine-tuning WOULD be right", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "facts-need-rag", anchor: "do you argue changing facts + citations = RAG, not fine-tuning?", cost: "you fine-tune weekly to chase doc updates — expensive and stale" },
      { dim: "when-finetune-right", anchor: "do you state when fine-tuning WOULD be right (behavior/format/latency)?", cost: "a dogmatic 'never fine-tune' answer, equally wrong" },
      { dim: "no-data", anchor: "do you note they lack the labeled data fine-tuning needs?", cost: "you recommend fine-tuning with nothing to fine-tune on" },
      { dim: "citations", anchor: "does your choice preserve citations/grounding?", cost: "fine-tuning loses traceability to the source doc" },
    ],
    status: "authored" },

  { id: "ds-adaptation-var-forgetting", roleTrack: "AIE", domain: "foundations", modality: "diagnose",
    specLevel: "S3", withheld: ["reference-prose", "stage-skeleton"], flawMode: "silent", difficulty: "senior", companies: ["Any"], parentRoot: "ds-adaptation-root",
    tags: ["adaptation", "catastrophic-forgetting", "lora", "variation"],
    prompt: "Variation of the adaptation root: your fine-tuned model got great at the domain but forgot its general ability (catastrophic forgetting). Fix it. (Minimal scaffold.)",
    context: "Full fine-tune on a narrow domain set. General benchmarks dropped sharply after tuning.",
    produce: { artifact: "why it forgot + the fix (adapters, data mixing, method change) + how you'd catch it before shipping", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "forgetting-cause", anchor: "do you name full fine-tuning on a narrow set overwriting general weights?", cost: "you re-tune and forget again" },
      { dim: "adapter-fix", anchor: "LoRA/adapters or mixing general data back in to preserve base ability?", cost: "the general regression persists" },
      { dim: "eval-both", anchor: "do you eval BOTH domain gain and general retention before shipping?", cost: "you ship a domain win that broke everything else" },
      { dim: "method-choice", anchor: "is the method matched so you don't over-write (PEFT vs full)?", cost: "wrong method guarantees recurrence" },
    ],
    status: "authored" },

  { id: "ds-adaptation-var-slm", roleTrack: "AIE", domain: "foundations", modality: "design",
    specLevel: "S4", withheld: ["reference-prose", "stage-skeleton", "hints"], flawMode: null, difficulty: "staff", companies: ["Any"], parentRoot: "ds-adaptation-root",
    tags: ["adaptation", "small-models", "distillation", "variation"],
    prompt: "Variation of the adaptation root (own it — no scaffold): a narrow, high-volume classification task runs on a frontier LLM at huge cost and latency. Design the cheaper small/task-specific model path.",
    context: "You get the situation only. Bring your own distillation/training and rollout design.",
    produce: { artifact: "the small-model path (distill from the frontier model, train, serve) + how you match quality + the cost/latency win + tradeoffs", format: "design-doc", workspace: "in-app-text" },
    reference: { type: "solution" },
    rubric: [
      { dim: "distillation", anchor: "do you distill/train a small model (labels from the frontier model) rather than keep paying for it?", cost: "you keep paying frontier price for a trivial narrow task" },
      { dim: "quality-parity", anchor: "how do you prove the small model matches quality on THIS task?", cost: "you cut cost and silently cut accuracy" },
      { dim: "cost-latency-win", anchor: "the concrete cost/latency improvement stated?", cost: "hand-waved savings; no case made" },
      { dim: "fallback", anchor: "a fallback to the big model for hard/low-confidence cases?", cost: "the small model fails the tail with no recourse" },
    ],
    status: "authored" },

];
