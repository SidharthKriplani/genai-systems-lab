// sdScenarios-gsl-designstudio.js — Design Studio batch (GSL, AIE track).
// SKELETONS ONLY (2026-07-17). Extends the System Design Trainer surface: same
// SD_SCENARIOS schema as sdScenarios-gsl-a/b.js, plus the spec-openness dial
// (specLevel S1-S4 + withheld[]) and roleTrack/modality. Wire by adding
// SD_GSL_DS to systemDesignScenarios.js. Flesh per DESIGN-STUDIO-SPEC.md §4:
// every stage `ask` is PINNED (the scoped sub-prompt); considerations/strong/
// traps/probes are DEFERRED — write them per each stage's `_flesh` note.
// Existing scenarios are all S1; these introduce S2/S3 + the refactor/debug bucket.
// Voice when fleshing: patient, first-principles, concrete numbers, real tradeoffs,
// English only, no emojis (match sdScenarios-gsl-a.js).

const DESIGN_ARC = ["requirements", "architecture", "deep-dive", "evaluation", "tradeoffs"];

export const SD_GSL_DS = [
  // 1) EXEMPLAR — UBS Payment Exception Resolution Agent, S1 (full brief given).
  {
    id: "ds-payment-exception-agent",
    title: "Payment Exception Resolution Agent",
    roleTrack: "AIE",
    modality: "llm-allowed-build",
    specLevel: "S1",
    withheld: [], // S1: nothing withheld; candidate executes the full brief.
    workedSolutionPlanned: true,
    companies: ["UBS"],
    tags: ["agentic", "multi-agent", "orchestration", "auditability", "idempotency", "payments"],
    prompt:
      "Design a production-grade agentic system that detects payment exceptions, diagnoses likely root causes from internal+external evidence, decides auto-resolve vs escalate, and advances each case through safe remediation with full auditability.",
    context:
      "Banks/processors handle large daily volumes across rails (domestic, wire, book transfer, scheduled disbursements). A meaningful share enter exception states: incorrect beneficiary, insufficient funds, duplicate submission, sanctions/compliance hold, network/clearing failure, cut-off miss, uncertain retry outcome. Ops today investigate manually (status systems, ledgers, routing dirs, compliance queues, network acks, retry history) then decide retry/repair/hold/cancel/escalate. Constraints: multiple dependent systems each with own latency+failure behavior; strict correctness+audit; asymmetric error cost (a missed resolvable exception delays funds; an unsafe auto-correction/retry causes duplicate payments, compliance breaches, or wrong fund movement). Diagnose carefully, act conservatively under uncertainty, record every recommendation and automated action.",
    referenceCaseTopics: [
      "incorrect-beneficiary", "insufficient-funds", "duplicate-submission",
      "sanctions-hold", "network-rail-failure", "cutoff-miss", "uncertain-retry",
    ],
    rubricDims: [
      "architecture-completeness (ingress->orchestration->investigation->decision->egress->async->replay)",
      "eval-first (defines success + traces before building)",
      "idempotency + safety-under-uncertainty (no duplicate side effects)",
      "auditability + replayability (every decision reconstructable)",
      "multi-agent justification (topology, contracts, failure isolation, determinism)",
      "tradeoff honesty (latency vs correctness, auto-resolve threshold placement)",
    ],
    stages: [
      { id: "requirements", title: "Clarify requirements & constraints",
        ask: "Pin what 'safe to auto-resolve' means before drawing agents: the asymmetric cost (missed-resolvable vs unsafe-auto-correction), the audit/replay requirement, per-rail timing/repairability differences, and the confidence bar that separates auto-resolve from escalate.",
        considerations: [], strong: [], traps: [], probes: [],
        _flesh: "6-8 considerations covering: cost asymmetry as the load-bearing constraint; idempotency key per payment case; evidence may be partial/stale/conflicting across systems; per-rail cutoff+repairability; auditability as hard requirement; the auto-resolve vs escalate confidence threshold. strong[]=6 what-good-looks-like; traps[]=4 (e.g. retrying on stale state -> duplicate); probes[]=3." },
      { id: "architecture", title: "End-to-end architecture",
        ask: "Draw the required flow — ingress (validate/normalize/dedup exception events) -> orchestration (assign/sequence/parallelize/budget) -> investigation (gather evidence, assess auto-correction safety) -> decision (+basis) -> egress -> async post-decision -> replay/feedback — and place the agent topology on it.",
        considerations: [], strong: [], traps: [], probes: [],
        _flesh: "cover the 7 required flow stages from the brief + the multi-agent design requirements (topology, per-agent contracts, comms/state schema, orchestration/branching, concurrency+partial-evidence merge, bounded loops/retries+termination, budget sharing sync-diagnosis vs async-remediation, failure isolation, determinism). strong/traps/probes as above." },
      { id: "deep-dive", title: "Deep-dive: idempotency, safety, and determinism under uncertainty",
        ask: "Go deep on the two things that break payment agents in prod: idempotent remediation (repeated triggers/retries/side-effects must not double-pay) and conservative action under conflicting/stale/partial evidence — with a deterministic, replayable record of why each action was taken.",
        considerations: [], strong: [], traps: [], probes: [],
        _flesh: "idempotency keys + exactly-once side effects; degraded modes when a dependency is down/returns partial; conflicting-evidence resolution; kill-switch/auto-retry-pause; same-input+same-evidence -> same recorded outcome (determinism). strong/traps/probes." },
      { id: "evaluation", title: "Evaluation & monitoring",
        ask: "Define, eval-first, how you'd prove the system safe BEFORE trusting it: the trace set of representative exception walkthroughs, the decision thresholds, and the online signals/guardrails that pause automation when it drifts.",
        considerations: [], strong: [], traps: [], probes: [],
        _flesh: "sample end-to-end traces per reference case; offline decision-quality vs human ops labels; false-auto-resolve rate as the safety metric; observability (structured logs/metrics/traces/queue visibility/alertable signals); staged rollout + scope narrowing. strong/traps/probes." },
      { id: "tradeoffs", title: "Tradeoffs, boundaries & production-readiness",
        ask: "State the explicit tradeoffs and the production-readiness plan: latency budget for primary diagnosis, reliability under dependency failure, configurability of rules/routing, security/privacy of payment data, and where you deliberately keep a human in the loop.",
        considerations: [], strong: [], traps: [], probes: [],
        _flesh: "single-agent-if-justified-else-multi-agent decision; latency vs correctness; config-driven resolution/retry/routing/ownership; out-of-scope (no real rail integration, no full sanctions engine); deployment safety/staged activation. strong/traps/probes." },
    ],
    status: "skeleton",
  },

  // 2) agentic-ops, S2 — half the brief withheld (derive flow + design requirements).
  {
    id: "ds-incident-triage-agent",
    title: "Production Incident Triage Agent",
    roleTrack: "AIE",
    modality: "llm-allowed-build",
    specLevel: "S2",
    withheld: ["end-to-end-flow", "multi-agent-design-requirements"], // given: scenario, reference cases, inputs, tools.
    workedSolutionPlanned: false,
    companies: ["Any"],
    tags: ["agentic", "incident-response", "orchestration", "observability"],
    prompt: "Design an agent that triages incoming production alerts, gathers evidence across observability systems, proposes a likely root cause + next action, and escalates safely.",
    context:
      "GIVEN: alerts arrive from metrics/logs/traces/deploy events; each carries service, severity, signal. Tools available: metrics store, log search, trace store, deploy/change log, runbook corpus, paging. Asymmetric cost: a wrong auto-remediation can worsen a sev-1; a missed real incident delays MTTR. [S2: candidate must DERIVE the end-to-end flow and the multi-agent design requirements — those stages are withheld from the prompt and live only in the rubric/model-answer.]",
    referenceCaseTopics: ["bad-deploy", "dependency-outage", "traffic-spike", "cache-poisoning", "silent-data-drift"],
    rubricDims: [
      "ambiguity-resolution (did they derive the flow the brief withheld)",
      "eval-first", "safe-escalation vs auto-remediation threshold",
      "evidence-fusion across observability sources", "auditability", "tradeoff honesty",
    ],
    stages: DESIGN_ARC.map((id) => ({ id, title: id, ask: "", considerations: [], strong: [], traps: [], probes: [],
      _flesh: "S2: the requirements+architecture stages must make the candidate DERIVE the withheld flow/design-reqs; write each stage `ask` as a scoped sub-prompt and the strong[] as the derivation the rubric rewards. Mirror the payment-agent stage depth." })),
    status: "skeleton",
  },

  // 3) RAG-QA, S3 — most withheld (given: scenario + one-liner).
  {
    id: "ds-rag-evolving-corpus",
    title: "Grounded QA over a fast-evolving corpus",
    roleTrack: "AIE",
    modality: "llm-allowed-build",
    specLevel: "S3",
    withheld: ["reference-cases", "end-to-end-flow", "design-requirements", "inputs", "tools"],
    workedSolutionPlanned: true,
    companies: ["Any"],
    tags: ["RAG", "grounding", "freshness", "citation", "conflict-resolution"],
    prompt: "Build a grounded QA assistant over a corpus that changes hourly, where stale or conflicting answers are the main failure.",
    context: "GIVEN ONLY: the one-liner above + 'answers must be current, cited, and must abstain when unsupported.' [S3: candidate derives reference cases, the ingest->retrieve->ground->serve flow, freshness/conflict design requirements, the input schema, and the tool set — all withheld.]",
    referenceCaseTopics: [], // withheld by design; candidate derives. Rubric holds the expected set.
    rubricDims: [
      "problem-framing under high ambiguity (S3)", "eval-first (freshness + grounding eval)",
      "freshness/staleness handling", "conflict/version resolution", "abstention discipline", "tradeoff honesty",
    ],
    stages: DESIGN_ARC.map((id) => ({ id, title: id, ask: "", considerations: [], strong: [], traps: [], probes: [],
      _flesh: "S3: heavier ambiguity — the requirements stage grades whether they surface freshness+conflict+abstain as first-class WITHOUT being told. Write asks + rubric-side model derivations." })),
    status: "skeleton",
  },

  // 4) eval/guardrail, S2 — eval-first primitive made the whole brief.
  {
    id: "ds-llm-eval-harness",
    title: "Eval & guardrail harness for an LLM feature",
    roleTrack: "AIE",
    modality: "llm-allowed-build",
    specLevel: "S2",
    withheld: ["end-to-end-flow", "design-requirements"],
    workedSolutionPlanned: false,
    companies: ["Any"],
    tags: ["evaluation", "guardrails", "llm-as-judge", "regression"],
    prompt: "Design the offline+online eval and guardrail layer for an existing LLM feature so quality regressions and unsafe outputs are caught before and after ship.",
    context: "GIVEN: a shipped LLM feature (summarization over user docs) with no eval. Tools: labeled gold set (small), traffic logs, a judge model. [S2: derive the eval flow + guardrail design-requirements.] This seed operationalizes the market's top signal — eval-first.",
    referenceCaseTopics: ["hallucinated-summary", "prompt-injection", "silent-quality-regression", "cost-blowup"],
    rubricDims: ["eval-first (primary)", "offline+online split", "judge-model validity (does the judge agree with humans)", "guardrail placement", "regression-gating", "tradeoff honesty"],
    stages: DESIGN_ARC.map((id) => ({ id, title: id, ask: "", considerations: [], strong: [], traps: [], probes: [],
      _flesh: "center the rubric on eval-first + judge-validity (a judge model must itself be validated against human labels). Write asks + bullets." })),
    status: "skeleton",
  },

  // 5) RAG-QA, refactor/debug bucket — the AIE spot-the-flaw cousin (Dial B, on a build).
  {
    id: "ds-rag-refactor",
    title: "Refactor a messy RAG service (preserve behavior, fix the rot)",
    roleTrack: "AIE",
    modality: "refactor-debug",
    specLevel: "S1",
    withheld: [],
    flawFocus: ["global-mutable-state", "no-eval-harness", "untestable-retrieval", "prompt-injection-open", "no-abstain-path"],
    workedSolutionPlanned: false,
    companies: ["Any"],
    tags: ["RAG", "refactor", "debug", "testability", "spot-the-flaw"],
    prompt: "Refactor an existing RAG app into a clean, testable architecture: preserve exact external behavior (API endpoints), eliminate global mutable state, and close the correctness/safety gaps.",
    context: "GIVEN: a working-but-rotten RAG service. The task is not greenfield design — it is finding what is structurally wrong and fixing it without changing the contract. The AIE flaw-diagnosis wedge in build form.",
    referenceCaseTopics: [],
    rubricDims: ["flaw-identification depth", "behavior-preservation (contract unchanged)", "testability introduced", "eval-first retrofit", "no symptom-only fixes", "tradeoff honesty"],
    stages: [
      { id: "requirements", title: "Establish the contract to preserve", ask: "Before touching code, pin the external contract that must NOT change and the observable behaviors under test.", considerations: [], strong: [], traps: [], probes: [], _flesh: "characterize the API surface + a pinning test harness first." },
      { id: "architecture", title: "Find the structural flaws", ask: "Enumerate what is structurally wrong (state, testability, safety) and order fixes so a root fix (e.g. no eval harness) unblocks the rest.", considerations: [], strong: [], traps: [], probes: [], _flesh: "this is the Dial-B ordering: name flaws in flawFocus, mark which is root; reward not fixing symptoms first." },
      { id: "deep-dive", title: "Fix without breaking behavior", ask: "Walk the highest-risk refactor (global mutable state -> injected deps) preserving exact outputs.", considerations: [], strong: [], traps: [], probes: [], _flesh: "" },
      { id: "evaluation", title: "Prove behavior preserved", ask: "Show the eval/pinning that proves the contract held across the refactor.", considerations: [], strong: [], traps: [], probes: [], _flesh: "eval-first retrofit is the graded core." },
      { id: "tradeoffs", title: "Tradeoffs & what you deliberately left", ask: "State what you fixed, what you deferred, and why.", considerations: [], strong: [], traps: [], probes: [], _flesh: "" },
    ],
    status: "skeleton",
  },

  // ---- expansion batch (2026-07-17, frozen schema; ride-the-flow) ----

  { id: "ds-support-resolution-agent", title: "Customer Support Resolution Agent", roleTrack: "AIE",
    modality: "llm-allowed-build", specLevel: "S1", withheld: [], workedSolutionPlanned: false,
    companies: ["Any"], tags: ["agentic", "support", "tool-calling", "escalation", "safety"],
    prompt: "Design an agent that resolves inbound customer support tickets end to end: diagnose, act via tools (refund, reset, lookup), or escalate — safely and auditable.",
    context: "GIVEN (S1, full brief): tickets arrive with account context; tools = order/billing/account APIs (each with side effects), knowledge base, human handoff. Asymmetric cost: a wrong automated refund/account action is expensive and often irreversible; a missed easy resolution burns CSAT and agent time. Idempotent actions, approval gates on high-risk tools, full audit trail.",
    referenceCaseTopics: ["refund-request", "account-lockout", "billing-dispute", "known-bug-workaround", "policy-exception-escalation", "abusive-user"],
    rubricDims: ["architecture-completeness", "eval-first", "tool-safety (approval gates on irreversible actions)", "escalation threshold", "auditability", "tradeoff honesty"],
    stages: DESIGN_ARC.map((id) => ({ id, title: id, ask: "", considerations: [], strong: [], traps: [], probes: [], _flesh: "S1 full brief: match payment-agent stage depth. Center on tool-side-effect safety (approval gates on refund/account mutation), abstain/escalate on policy exceptions and abuse, and a per-action audit trail." })),
    status: "skeleton" },

  { id: "ds-claims-adjudication-agent", title: "Insurance claims adjudication agent", roleTrack: "AIE",
    modality: "llm-allowed-build", specLevel: "S4", withheld: ["business-scenario", "reference-cases", "end-to-end-flow", "design-requirements", "inputs", "tools"], workedSolutionPlanned: false,
    companies: ["Any"], tags: ["agentic", "adjudication", "high-stakes", "compliance", "ambiguity"],
    prompt: "Build something that helps adjudicate insurance claims.",
    context: "GIVEN ONLY: that one line. [S4 vaguest — the candidate must FRAME the problem itself: scope which claims, define auto-vs-refer, derive evidence sources, the flow, the design requirements, the compliance boundary. Half the grade is whether they turn this into a well-scoped, safe problem before designing.]",
    referenceCaseTopics: [], rubricDims: ["problem-framing from near-zero (S4 apex)", "scoping discipline (what is in/out)", "eval-first", "high-stakes safety + human-in-loop", "compliance/audit awareness", "tradeoff honesty"],
    stages: DESIGN_ARC.map((id) => ({ id, title: id, ask: "", considerations: [], strong: [], traps: [], probes: [], _flesh: "S4 apex: the requirements stage is MOST of the grade — reward scoping the ambiguity (which claim types, auto vs refer, what evidence, what must never be automated) BEFORE any architecture. Jumping to boxes without framing fails the level." })),
    status: "skeleton" },

  { id: "ds-rag-multihop", title: "Multi-hop RAG over linked documents", roleTrack: "AIE",
    modality: "llm-allowed-build", specLevel: "S2", withheld: ["end-to-end-flow", "design-requirements"], workedSolutionPlanned: false,
    companies: ["Any"], tags: ["RAG", "multi-hop", "decomposition", "grounding"],
    prompt: "Build a RAG system that answers questions requiring 2-3 dependent lookups across linked documents.",
    context: "GIVEN: a corpus where answers chain facts (A references B references C); single-shot top-k fails. [S2: derive the decompose -> retrieve -> reason -> retrieve flow and the design requirements — hop planning, intermediate grounding, loop bounds.]",
    referenceCaseTopics: ["two-hop-factual", "aggregation-across-docs", "contradiction-across-hops", "dead-end-hop"],
    rubricDims: ["ambiguity-resolution", "multi-hop decomposition (vs blended single query)", "eval-first (per-hop grounding)", "loop/termination bounds", "abstention on unresolved hop", "tradeoff honesty"],
    stages: DESIGN_ARC.map((id) => ({ id, title: id, ask: "", considerations: [], strong: [], traps: [], probes: [], _flesh: "reward iterative retrieve-reason-retrieve over a single blended query vector; bound hops; ground each intermediate. Derive the withheld flow." })),
    status: "skeleton" },

  { id: "ds-doc-extraction-agent", title: "Structured extraction from messy documents", roleTrack: "AIE",
    modality: "llm-allowed-build", specLevel: "S2", withheld: ["end-to-end-flow", "design-requirements"], workedSolutionPlanned: false,
    companies: ["Any"], tags: ["doc-processing", "extraction", "confidence", "validation"],
    prompt: "Extract structured fields (JSON) from heterogeneous documents (invoices, forms, contracts) with confidence scores and human-review routing.",
    context: "GIVEN: documents with varied layouts, handwriting, tables. [S2: derive the ingest -> extract -> validate -> route flow and design requirements — confidence calibration, schema validation, low-confidence human routing.] The AIE doc-processing bucket (~15% of take-homes).",
    referenceCaseTopics: ["multi-column-table", "handwriting", "missing-field", "conflicting-values", "wrong-doc-type"],
    rubricDims: ["ambiguity-resolution", "confidence calibration (knows when unsure)", "schema validation", "human-review routing threshold", "eval-first (field-level accuracy)", "tradeoff honesty"],
    stages: DESIGN_ARC.map((id) => ({ id, title: id, ask: "", considerations: [], strong: [], traps: [], probes: [], _flesh: "center on calibrated confidence + routing low-confidence extractions to humans; schema validation before downstream use. Derive the withheld flow." })),
    status: "skeleton" },

  { id: "ds-multiagent-content", title: "Coordinated multi-agent content pipeline", roleTrack: "AIE",
    modality: "llm-allowed-build", specLevel: "S3", withheld: ["reference-cases", "end-to-end-flow", "design-requirements", "inputs", "tools"], workedSolutionPlanned: false,
    companies: ["Any"], tags: ["multi-agent", "orchestration", "coordination", "quality-gate"],
    prompt: "Design a team of specialized agents (research, draft, edit, fact-check) that produce publishable content from a brief.",
    context: "GIVEN ONLY: the one-liner + 'output must be fact-checked and on-brief.' [S3: derive the agent roles, handoff contracts, the orchestration, quality gates, and the eval — most of the brief is withheld.]",
    referenceCaseTopics: [], rubricDims: ["problem-framing under ambiguity (S3)", "per-agent contracts + handoff schema", "orchestration + termination", "fact-check/quality gate", "eval-first", "tradeoff honesty"],
    stages: DESIGN_ARC.map((id) => ({ id, title: id, ask: "", considerations: [], strong: [], traps: [], probes: [], _flesh: "reward clear per-agent contracts + a fact-check gate that can send work back; derive the withheld topology + orchestration." })),
    status: "skeleton" },

  { id: "ds-agent-debug-loop", title: "Debug an agent that will not terminate", roleTrack: "AIE",
    modality: "refactor-debug", specLevel: "S1", withheld: [], flawFocus: ["no-termination-bound", "tool-result-not-fed-back", "state-not-persisted", "retry-without-idempotency"], workedSolutionPlanned: false,
    companies: ["Any"], tags: ["agentic", "debug", "termination", "spot-the-flaw"],
    prompt: "An existing tool-calling agent loops forever / repeats actions / never converges. Find why and fix it without rewriting from scratch.",
    context: "GIVEN: a working-but-broken agent loop. The AIE flaw-diagnosis wedge in agentic form — the flaws are DEPENDENT (a missing termination bound MASKS the idempotency bug, because the loop never gets far enough to double-act until it is bounded).",
    referenceCaseTopics: [], rubricDims: ["flaw-identification depth", "dependency ordering (bound the loop before the idempotency bug is visible)", "behavior-preserving fix", "eval-first (a repro/trace harness)", "no symptom-only fixes", "tradeoff honesty"],
    stages: [
      { id: "requirements", title: "Reproduce + trace", ask: "Build the minimal repro/trace that shows the non-termination before touching logic.", considerations: [], strong: [], traps: [], probes: [], _flesh: "eval-first: a trace harness is the graded start." },
      { id: "architecture", title: "Order the flaws", ask: "Map the dependent flaws — which one MASKS the others (bound the loop first, then the idempotency bug becomes observable).", considerations: [], strong: [], traps: [], probes: [], _flesh: "Dial-B ordering in agentic form: reward finding the root (no termination bound) before the masked idempotency/state bugs." },
      { id: "deep-dive", title: "Fix the root", ask: "Bound the loop + feed tool results back into state; show convergence.", considerations: [], strong: [], traps: [], probes: [], _flesh: "" },
      { id: "evaluation", title: "Prove convergence + no double-acts", ask: "Show the agent now terminates and does not repeat side effects.", considerations: [], strong: [], traps: [], probes: [], _flesh: "" },
      { id: "tradeoffs", title: "Tradeoffs", ask: "State what you changed and the residual risks.", considerations: [], strong: [], traps: [], probes: [], _flesh: "" },
    ],
    status: "skeleton" },
];
