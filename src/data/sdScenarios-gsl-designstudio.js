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
];
