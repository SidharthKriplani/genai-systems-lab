// src/data/questions/q-gap-a.js
// L0/L1/L2 question ladders — agent-eval (trajectory vs outcome) + rag-ingestion.
// Schema mirrors src/data/questions/q-foundations.js:
//   id: "<topic>-l<0|1|2>-<n>"   topic: "ai-agents" | "rag-ingestion"
//   tier: "L0" | "L1" | "L2"     difficulty: easy(L0) | medium(L1) | hard(L2)
//   gated: boolean               type: "mcq" | "text"
//   options/correct for mcq; keywords[] for text; explanation + trap always.

export const Q_GAP_A = [
  // ══════════════════════════════════════════════════════════════════════════
  // AGENT EVAL — trajectory vs outcome
  // ══════════════════════════════════════════════════════════════════════════

  // ── L0: Define (3) ─────────────────────────────────────────────────────────
  {
    id: "agent-eval-l0-1", topic: "ai-agents", tier: "L0", difficulty: "easy", band: "foundational", gated: false, type: "mcq",
    question: "What is the difference between outcome evaluation and trajectory evaluation of an agent?",
    options: [
      "Outcome eval runs on the training set and trajectory eval runs on the test set",
      "Outcome eval grades only the agent's final answer (pass/fail on the endpoint); trajectory eval grades each step of the agent's process — its plans, tool calls, and observations",
      "Outcome eval is for LLMs and trajectory eval is for classifiers",
      "They are two names for the same task-success metric",
    ],
    correct: 1, keywords: [],
    explanation: "Outcome evaluation asks a single question — did the final output match what was expected? — and collapses the whole run into one pass/fail. Trajectory evaluation instead scores the agent's process step by step: whether each plan, tool call, and observation was correct. An agent is a sequence of (plan → tool call → observation → next action) steps, so trajectory eval inspects the path while outcome eval inspects only the destination.",
    trap: "Thinking outcome and trajectory eval are the same because 'a correct answer implies a correct path.' They diverge constantly — an agent can reach the right answer through a broken path, or the right path can produce a wrong answer due to the environment.",
  },
  {
    id: "agent-eval-l0-2", topic: "ai-agents", tier: "L0", difficulty: "easy", band: "foundational", gated: false, type: "mcq",
    question: "In an agent trajectory, what does 'tool-call accuracy' measure?",
    options: [
      "How fast each tool returns a response",
      "Whether, at each step, the agent selected the right tool AND called it with the right arguments",
      "The total number of tools available to the agent",
      "Whether the final answer cited a tool",
    ],
    correct: 1, keywords: [],
    explanation: "Tool-call accuracy is a per-step trajectory metric with two parts: tool selection (did the agent pick the correct tool for this step?) and argument correctness (did it pass the right arguments?). Calling a refund tool on a status-lookup task fails tool selection; calling the right tool with the wrong order ID fails argument correctness. Both are invisible to outcome eval, which never inspects individual steps.",
    trap: "Reducing tool-call accuracy to 'did it call any tool.' The metric checks the RIGHT tool with the RIGHT arguments — an agent can call a valid tool with wrong arguments and still fail.",
  },
  {
    id: "agent-eval-l0-3", topic: "ai-agents", tier: "L0", difficulty: "easy", band: "foundational", gated: false, type: "mcq",
    question: "What is a 'golden trajectory' in an agent eval harness?",
    options: [
      "The fastest run the agent has ever produced",
      "A hand-authored reference run for a task — the sequence of tools/arguments the agent should (and should not) use — that per-step assertions are checked against and that forms a regression suite",
      "The trajectory with the highest LLM-judge score",
      "A trajectory generated automatically at inference time",
    ],
    correct: 1, keywords: [],
    explanation: "A golden trajectory is a curated reference for a task: it specifies the expected steps — e.g. this ticket should call lookup_order with the exact ID and must never call issue_refund. Per-step assertions compare the agent's actual run against it (tool name matches, arguments match, forbidden tools never appear). Because these checks are cheap and exact, golden trajectories double as a regression suite: any change that reintroduces a bug fails CI.",
    trap: "Confusing a golden trajectory (a fixed reference you assert against) with an LLM-judge verdict (a graded opinion). Goldens grade deterministic facts; the judge grades open-ended quality.",
  },

  // ── L1: Deep single-concept (5) ────────────────────────────────────────────
  {
    id: "agent-eval-l1-1", topic: "ai-agents", tier: "L1", difficulty: "medium", band: "intermediate", gated: false, type: "mcq",
    question: "An agent reaches the correct final answer but did so by calling a destructive tool nobody requested and ignoring a silent tool failure. Outcome eval scores it PASS. What is this failure mode called and why does it matter?",
    options: [
      "A false fail — the eval is too strict",
      "A false pass — the agent is 'right for the wrong reasons': a broken/unsafe/lucky path produced a correct-looking answer, so outcome eval green-lights an agent that is dangerous or won't generalize on the next input",
      "A hallucination in the eval judge, unrelated to the agent",
      "A data-leakage bug in the training set",
    ],
    correct: 1, keywords: [],
    explanation: "This is a false pass: the destination was correct so outcome eval says PASS, but the path was broken (unrequested destructive call, ignored failure). It matters because the 'passing' agent is unsafe in production — it issues unauthorized actions — and because a lucky/broken path won't generalize; the next input that breaks the luck becomes an incident. Only trajectory eval, scoring each step, exposes it.",
    trap: "Assuming a correct final answer means the agent worked. Outcome eval conflates 'the agent did the right things' with 'the world produced the right result' — a false pass is exactly where those come apart.",
  },
  {
    id: "agent-eval-l1-2", topic: "ai-agents", tier: "L1", difficulty: "medium", band: "intermediate", gated: false, type: "mcq",
    question: "An agent plans correctly and calls the right tools with the right arguments, but a downstream API returned stale data, so the final answer is wrong. Outcome eval scores it FAIL. Why is trajectory eval valuable here?",
    options: [
      "It isn't — a wrong answer is a wrong answer, so the agent should be blamed",
      "Trajectory eval shows every step was correct, localizing the fault to the environment (stale data / API error) rather than the agent's reasoning — so you fix the data source instead of wrongly debugging the agent",
      "Trajectory eval would also mark the run PASS, hiding the wrong answer",
      "Trajectory eval retries the API automatically",
    ],
    correct: 1, keywords: [],
    explanation: "This is a false fail: the agent's reasoning and tool use were correct, but the environment (stale data) produced a wrong result. Outcome eval blames the agent; trajectory eval shows each step passing, pointing you at the real fault — the data source or API — so you don't waste time debugging correct agent logic. Outcome and trajectory metrics together let you distinguish agent bugs from environment bugs.",
    trap: "Blaming the agent for every wrong answer. The trajectory can be flawless while the environment is at fault; per-step eval is how you tell those apart.",
  },
  {
    id: "agent-eval-l1-3", topic: "ai-agents", tier: "L1", difficulty: "medium", band: "intermediate", gated: true, type: "mcq",
    question: "Why is 'error-recovery rate' treated as a first-class trajectory metric rather than penalizing any error as a plain failure?",
    options: [
      "Because errors never happen in well-built agents, so recovery is irrelevant",
      "Because in real environments tools do fail, and a robust agent is one whose trajectory shows it DETECTING a failure and adapting (retry, fallback, ask the user) instead of barreling ahead as if it succeeded — recovery is a distinct, measurable capability",
      "Because recovering from errors always produces a correct final answer",
      "Because error recovery is only relevant to outcome eval",
    ],
    correct: 1, keywords: [],
    explanation: "In production, tools and APIs fail intermittently; you cannot eval an agent only on error-free runs. What separates a robust agent from a fragile one is whether, when a tool fails, its trajectory shows it noticing and adapting — retrying, falling back, or asking the user — versus continuing as if the call succeeded (which is exactly how the refund agent produced an unfounded reply). Recovery is a capability you measure directly, not a footnote.",
    trap: "Treating every error as an automatic failure. The interesting signal is what the agent does AFTER a tool fails; ignoring the failure is the real defect, and recovery is a metric in its own right.",
  },
  {
    id: "agent-eval-l1-4", topic: "ai-agents", tier: "L1", difficulty: "medium", band: "intermediate", gated: false, type: "text",
    question: "Explain why an agent eval harness runs the agent against MOCKED or RECORDED tools in a controlled environment, rather than hitting live tools/APIs during evaluation.",
    options: null, correct: null,
    keywords: ["reproducible", "deterministic", "mock", "recorded", "flaky", "controlled", "isolate", "regression", "environment", "non-deterministic"],
    explanation: "Mocking or recording tools makes runs reproducible and isolates the agent from the environment. If eval hit live APIs, a flaky or changing API would make the same agent pass one day and fail the next, and a genuine environment fault would masquerade as an agent bug (a false fail). A controlled environment gives deterministic tool responses, so a regression is attributable to a code/prompt change in the agent, and golden-trajectory assertions become stable CI checks. It also avoids side effects — you don't want an eval run actually issuing refunds. The tradeoff is that mocks must be kept faithful to real tool behavior.",
    trap: "Running eval against live tools 'for realism.' Non-deterministic tools make results unreproducible and confound agent bugs with environment flakiness; you can't localize a regression or gate CI on a moving target.",
  },
  {
    id: "agent-eval-l1-5", topic: "ai-agents", tier: "L1", difficulty: "medium", band: "intermediate", gated: true, type: "mcq",
    question: "You use an LLM-as-judge to score whether each tool call in a trajectory was justified. What are the judge's characteristic pitfalls, and how do you mitigate them?",
    options: [
      "The judge is deterministic and unbiased, so no mitigation is needed",
      "The judge can be swayed by fluent-but-wrong traces, shows verbosity/position bias, and is non-deterministic; mitigate by anchoring it with golden examples, using a clear rubric, and spot-auditing its verdicts against human labels",
      "The only pitfall is that it is slow; caching fixes everything",
      "The judge always agrees with per-step assertions, so it is redundant",
    ],
    correct: 1, keywords: [],
    explanation: "LLM-as-judge scales to open-ended trajectory quality that assertions can't specify, but it inherits the judge model's failure modes: it can rate a fluent, confident, but wrong trace highly; it exhibits verbosity and position biases; and it is non-deterministic across runs. Mitigations: give it a precise rubric, anchor it with golden examples of good/bad traces, and periodically audit its verdicts against human labels to calibrate. The judge grades taste; deterministic assertions grade facts — you use both.",
    trap: "Trusting the LLM judge as ground truth. It is biased and non-deterministic; without golden anchors and human spot-audits it can systematically pass fluent-but-wrong agents.",
  },

  // ── L2: Cross-concept / tradeoffs (5) ──────────────────────────────────────
  {
    id: "agent-eval-l2-1", topic: "ai-agents", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "mcq",
    question: "When should you rely on outcome eval versus trajectory eval? Give the correct division of labor a staff engineer would state.",
    options: [
      "Use only trajectory eval; outcome eval is obsolete once you score steps",
      "Ship/track headline progress on outcome eval (does it ultimately work), but debug, gate releases, and catch silent-safety regressions on trajectory eval (why, whether it generalizes, whether it's safe) — you need both, playing different roles",
      "Use only outcome eval in CI; trajectory eval is just for research papers",
      "Use whichever is cheaper for the given task; they are interchangeable",
    ],
    correct: 1, keywords: [],
    explanation: "Outcome eval is the shipping signal — it tells you whether the agent worked on a given input and is your headline metric. Trajectory eval tells you WHY, whether the behavior will generalize, and whether it's safe, so it's what you use to debug regressions, gate releases (a forbidden-tool assertion failing blocks the release), and catch silent-safety issues a correct-looking answer would hide. They are complementary, not substitutes.",
    trap: "Picking one and dropping the other. Outcome-only misses false passes/fails; trajectory-only loses the simple 'did it ultimately work' signal. Mature harnesses report both side by side.",
  },
  {
    id: "agent-eval-l2-2", topic: "ai-agents", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "mcq",
    question: "You must design the scoring layer of an agent eval harness for BOTH deterministic requirements (must call lookup_order with the exact ID; must never call issue_refund) and open-ended ones (was each call justified by the prior observation). What is the right design?",
    options: [
      "Use LLM-as-judge for everything, since it is the most flexible",
      "Use per-step assertions against golden trajectories for the deterministic facts (exact tool/argument match, forbidden-tool checks — cheap, exact, reusable as a regression suite) and an LLM-as-judge with a rubric for the open-ended quality, anchored by goldens and human audits",
      "Use only exact assertions and drop all open-ended scoring",
      "Score only the final answer, since per-step scoring is too noisy",
    ],
    correct: 1, keywords: [],
    explanation: "Deterministic requirements (specific tool, exact arguments, forbidden tools) map cleanly to programmatic per-step assertions against golden trajectories — exact, cheap, and directly reusable as a regression suite. Open-ended judgments (was a call justified, did the plan cohere) are what LLM-as-judge is for, since assertions can't specify them; you anchor the judge with goldens and human spot-audits to counter its biases. Assertions grade facts, the judge grades taste — a robust harness uses both.",
    trap: "Collapsing to one mechanism. All-judge loses the exactness assertions give (and inherits judge bias); all-assertion can't score open-ended quality. Match the mechanism to the requirement type.",
  },
  {
    id: "agent-eval-l2-3", topic: "ai-agents", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "mcq",
    question: "How does capturing full trajectories change your ability to diagnose a regression, compared to logging only final outcomes?",
    options: [
      "It doesn't — a pass/fail on the final answer is enough to find any regression",
      "With captured trajectories you can localize the regression to the exact step where a good run and a bad run diverged (e.g. tool selection changed at step 2), whereas an outcome-only log tells you it broke but not where or why",
      "Trajectories only help for latency profiling, not correctness",
      "Capturing trajectories makes debugging harder because there is more data",
    ],
    correct: 1, keywords: [],
    explanation: "Outcome-only logging tells you a run went from PASS to FAIL but not why. Captured trajectories let you diff a passing run against a failing one and pinpoint the divergence — the step where tool selection, arguments, or reasoning changed — turning 'it regressed' into 'step 2 now calls the wrong tool.' That localizability is the operational payoff of storing the full process, not just the endpoint.",
    trap: "Thinking outcome logs suffice for debugging. Without the trajectory you know THAT it broke but not WHERE; you lose the step-level diff that makes regressions fixable.",
  },
  {
    id: "agent-eval-l2-4", topic: "ai-agents", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "mcq",
    question: "Beyond correctness, why do agent evals track efficiency metrics like steps-to-goal, tool-call count, and token/cost per task alongside outcome and trajectory correctness?",
    options: [
      "Efficiency is irrelevant as long as the answer is correct",
      "Two agents can both reach the correct answer, but one that takes many redundant tool calls and steps is more expensive, slower, and more failure-prone in production; efficiency is a real quality axis, and redundant calls also signal a shakier trajectory even when the outcome passes",
      "Efficiency metrics are only for training, not evaluation",
      "Steps-to-goal is identical to task success, so it adds nothing",
    ],
    correct: 1, keywords: [],
    explanation: "Correctness is necessary but not sufficient. Two agents can both pass on outcome, yet one that wanders through many redundant tool calls costs more tokens, adds latency, and has more places to fail — worse in production. Redundant/unneeded calls are also a trajectory smell: they suggest the agent isn't reasoning cleanly even when it lands the answer. So efficiency (steps, tool-call count, tokens, cost per task) is tracked as its own axis next to correctness.",
    trap: "Optimizing only for task success. A correct-but-wasteful agent is a real operational problem (cost, latency, fragility), and its redundant calls hint at a shakier process — efficiency is a first-class eval axis.",
  },
  {
    id: "agent-eval-l2-5", topic: "ai-agents", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "text",
    question: "Your agent's task-success (outcome) score is high and stable, but users report occasional unsafe actions (unrequested refunds, wrong-record edits). Explain why the metric looks fine while the behavior is unsafe, and what you would add to the eval to catch it.",
    options: null, correct: null,
    keywords: ["trajectory", "per-step", "false pass", "forbidden tool", "assertion", "tool-call accuracy", "golden", "safety", "process metric", "regression"],
    explanation: "Task-success is an outcome metric: it grades the final answer and collapses the whole run into pass/fail, so an agent that reaches a correct-looking answer through an unsafe path (a hallucinated destructive tool call, a wrong-record edit) still scores PASS — a false pass. The metric looks fine because it never inspects the path where the unsafe action happened. To catch it, add trajectory evaluation: per-step tool-call accuracy (right tool, right arguments), golden-trajectory assertions including forbidden-tool checks (issue_refund must never fire on a status lookup), redundant/hallucinated-call detection, and error-recovery scoring — reported alongside outcome and used to gate releases. These process/safety assertions fail exactly at the offending step, turning a silent-safety regression into a CI failure before it reaches users.",
    trap: "Trusting a high outcome score as evidence of safety. Outcome eval is blind to unsafe-but-correct-looking paths; only per-step trajectory assertions (especially forbidden-tool checks) surface silent-safety regressions.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RAG INGESTION — offline pipeline, freshness, incremental indexing
  // ══════════════════════════════════════════════════════════════════════════

  // ── L0: Define (3) ─────────────────────────────────────────────────────────
  {
    id: "rag-ingestion-l0-1", topic: "retrieval", tier: "L0", difficulty: "easy", band: "foundational", gated: false, type: "mcq",
    question: "In a RAG system, what is the offline ingestion (indexing) pipeline, and how does it differ from the online query path?",
    options: [
      "They are the same thing run twice for redundancy",
      "The ingestion pipeline runs ahead of time in the background to turn raw documents into a searchable index (parse → clean → chunk → embed → index); the query path runs per request on the latency-critical path (embed query → search → generate)",
      "The ingestion pipeline runs per user query; the query path runs nightly",
      "Ingestion only stores raw files; the query path does all parsing at request time",
    ],
    correct: 1, keywords: [],
    explanation: "A RAG system has two pipelines at different times. Ingestion is offline and background: it parses, cleans, chunks, embeds, and indexes documents ahead of time so the index is ready. The query path is online and per request: it embeds the user's query, searches the index, and generates an answer under latency pressure. The query path can only surface what ingestion already put in the index.",
    trap: "Picturing only the query path and forgetting ingestion exists. Most RAG quality problems (garbled parses, stale/deleted docs, missing permissions) are ingestion failures, invisible until someone queries.",
  },
  {
    id: "rag-ingestion-l0-2", topic: "retrieval", tier: "L0", difficulty: "easy", band: "foundational", gated: false, type: "mcq",
    question: "What is the correct order of stages in a typical RAG ingestion pipeline?",
    options: [
      "embed → parse → chunk → index → clean",
      "parse → clean/dedup → extract metadata → chunk → embed → index",
      "index → embed → chunk → clean → parse",
      "chunk → embed → parse → index → clean",
    ],
    correct: 1, keywords: [],
    explanation: "You first parse the raw file into clean text, then clean/dedup it, extract metadata (source, section, timestamp, ACLs), chunk it into retrieval-sized units, embed each chunk into a vector, and finally write vectors plus metadata into the index. Each stage is a distinct decision with its own failure mode; getting the order wrong (e.g. chunking before parsing) is nonsensical because later stages depend on earlier ones' outputs.",
    trap: "Embedding before parsing/cleaning. You can't meaningfully embed a document you haven't turned into clean text and split into chunks — the stages are dependent, not interchangeable.",
  },
  {
    id: "rag-ingestion-l0-3", topic: "retrieval", tier: "L0", difficulty: "easy", band: "foundational", gated: false, type: "mcq",
    question: "During ingestion, what kind of metadata is typically extracted and attached to each document/chunk?",
    options: [
      "Only the embedding vector",
      "Structured fields like source (for citation), section/heading, timestamp (freshness), and ACLs/permissions (who may see it)",
      "The user's query history",
      "The GPU temperature at embedding time",
    ],
    correct: 1, keywords: [],
    explanation: "Ingestion attaches structured metadata to each unit: source/URL so answers can cite, section/heading for locality, timestamp so you can prefer fresh content and detect staleness, and ACLs/permissions so retrieval can restrict results to what a user is allowed to see. Metadata is what lets retrieval FILTER before it ranks, so it must be captured at ingestion time.",
    trap: "Treating metadata as optional decoration. Fields like timestamp and ACLs are load-bearing — without them you can't do freshness-aware retrieval or enforce permissions.",
  },

  // ── L1: Deep single-concept (5) ────────────────────────────────────────────
  {
    id: "rag-ingestion-l1-1", topic: "retrieval", tier: "L1", difficulty: "medium", band: "intermediate", gated: false, type: "mcq",
    question: "A PDF with a two-column layout is returned by your RAG bot as garbled, interleaved nonsense. Which ingestion stage is at fault, and why can't better retrieval fix it?",
    options: [
      "The embedding stage; a bigger embedding model would fix it",
      "The parse stage: a naive reader linearized the two columns left-margin-to-right-margin, interleaving them; retrieval can only surface what ingestion wrote, so no better embeddings or higher top-k reconstruct meaning from already-garbled text — the fix is structure-aware parsing",
      "The index stage; rebuilding the index fixes garbled text",
      "The query path; rewriting the query fixes the parse",
    ],
    correct: 1, keywords: [],
    explanation: "Real documents aren't plain text: a two-column PDF read straight across interleaves the columns into nonsense at the parse stage. Because retrieval quality is capped by ingestion quality — the query path can only surface what ingestion put in the index, in the form it put it there — no amount of better embeddings, higher top-k, or query rewriting reconstructs meaning from mangled text. The fix is a structure-aware parser (column/table/layout detection).",
    trap: "Trying to fix a parse problem in the retriever. Garbage-out at parse poisons everything downstream; retrieval cleverness can't recover text that was destroyed before it was ever indexed.",
  },
  {
    id: "rag-ingestion-l1-2", topic: "retrieval", tier: "L1", difficulty: "medium", band: "intermediate", gated: true, type: "mcq",
    question: "Your team skips extracting per-document ACL/permission metadata at ingestion, planning to 'apply permissions later at query time.' Why is this a serious problem?",
    options: [
      "It's fine; permissions are purely a query-time concern",
      "The index only carries fields ingestion wrote, so without ACL metadata the retriever has nothing to filter on and can surface documents a user was never allowed to read — a data leak; retrieval filters before it ranks, so permissions must be attached at ingestion",
      "It only affects citation quality, not access control",
      "It slows down embedding, so skipping it is a pure optimization",
    ],
    correct: 1, keywords: [],
    explanation: "Retrieval can only filter on metadata the index actually holds. If ingestion never attaches ACLs, there is no permission field to filter on, so the retriever can return chunks from documents the user has no right to see — a real data-leak. Retrieval filters before it ranks, and you cannot reconstruct permissions the index doesn't carry, so ACLs must be extracted and stored at ingestion time.",
    trap: "Believing you can bolt permissions on at query time. If the index lacks per-doc ACLs, there's nothing to enforce against — the leak is baked in at ingestion.",
  },
  {
    id: "rag-ingestion-l1-3", topic: "retrieval", tier: "L1", difficulty: "medium", band: "intermediate", gated: false, type: "mcq",
    question: "An engineer edits one paragraph in a single 40-page runbook and your nightly job re-embeds all 12,000 documents. What is the correct design and its core mechanism?",
    options: [
      "Increase batch size so the full rebuild is faster; full rebuilds are unavoidable on any edit",
      "Incremental re-indexing: make the unit of work the document via a stable doc-id → chunk-ids map, re-embed only the edited doc's chunks, and upsert them in place — so cost is proportional to the change (tens of chunks), not the corpus (all 12,000 docs)",
      "Switch to a faster embedding model so re-embedding everything nightly is cheap",
      "Cache query results so the stale index doesn't matter",
    ],
    correct: 1, keywords: [],
    explanation: "The fix is incremental re-indexing keyed by a stable doc-id → chunk-ids mapping: re-parse, re-chunk, and re-embed only the edited document's chunks and upsert them in place, leaving every other chunk untouched. Cost then scales with the size of the change (that doc's ~30 chunks) rather than the corpus. Full rebuilds are reserved for embedding-model or schema migrations.",
    trap: "Accepting that any edit requires a full rebuild. Options that just make the wasteful path faster (bigger batch, faster model) keep cost proportional to corpus size; the real fix changes the unit of work to the document.",
  },
  {
    id: "rag-ingestion-l1-4", topic: "retrieval", tier: "L1", difficulty: "medium", band: "intermediate", gated: true, type: "mcq",
    question: "A document is deleted from your wiki, but the RAG bot keeps citing it. What went wrong in the ingestion design, and how is it fixed?",
    options: [
      "The embedding model memorized the doc; retraining is required",
      "Incremental re-indexing handled edits but not deletes: nothing removed the deleted doc's chunks from the index, so they linger and keep being retrieved; the fix is to actively delete a doc's chunks (via the doc-id → chunk-ids map) on removal, and upsert-plus-delete on supersession",
      "The query path cached the doc; clearing the cache is the only fix",
      "Deleted docs cannot be removed from a vector index once written",
    ],
    correct: 1, keywords: [],
    explanation: "Incremental pipelines often implement upsert-on-edit but forget delete-on-removal. If nothing removes a deleted doc's chunks, they remain in the index and keep getting retrieved and cited. The fix is a delete step keyed by the same stable doc-id → chunk-ids mapping: when a doc is deleted, remove its chunks; when v2 supersedes v1, upsert v2's chunks and delete v1's so the old version can't be retrieved.",
    trap: "Handling edits but not deletes/supersession. Freshness isn't only about adding new content — actively removing deleted or superseded chunks is what stops stale citations.",
  },
  {
    id: "rag-ingestion-l1-5", topic: "retrieval", tier: "L1", difficulty: "medium", band: "intermediate", gated: false, type: "text",
    question: "Explain what a 'freshness SLA' is for a RAG ingestion pipeline, and how it drives the ingestion architecture (give a fast-corpus and a slow-corpus example).",
    options: null, correct: null,
    keywords: ["how quickly", "reflected", "event-driven", "batch", "nightly", "requirement", "latency", "per corpus", "streaming", "minutes"],
    explanation: "A freshness SLA is a requirement stating how quickly an edit to a source document must be reflected in retrieval. It drives the ingestion architecture because the tolerance dictates the trigger mechanism. A fast corpus — breaking news, pricing, inventory — may need edits reflected in minutes, requiring event-driven ingestion that upserts on every write (streaming/webhook-triggered). A slow, stable corpus — a policy wiki — tolerates a nightly batch job. The SLA is a requirement to elicit per corpus, not a default; choosing event-driven vs. batch (and the cost that comes with each) follows from it.",
    trap: "Assuming one ingestion cadence fits all corpora. A pricing feed needs near-real-time upserts; a policy wiki is fine nightly. The freshness SLA is a per-corpus requirement that determines event-driven vs. batch architecture.",
  },

  // ── L2: Cross-concept / tradeoffs (5) ──────────────────────────────────────
  {
    id: "rag-ingestion-l2-1", topic: "retrieval", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "mcq",
    question: "Ingestion and retrieval have a cost/latency asymmetry. What is it, and how should it shape where you do expensive work?",
    options: [
      "Both are equally latency-critical, so expensive work should be split evenly",
      "Ingestion is throughput-bound and runs off the critical path (you pay per chunk once at write time); retrieval is latency-bound and runs per query — so push expensive work (rich parsing, metadata extraction, per-chunk summaries/synthetic questions) into ingestion, where you pay once and amortize it over every future query",
      "Retrieval is off the critical path, so expensive work belongs there",
      "Expensive work should be avoided entirely; both pipelines must be cheap",
    ],
    correct: 1, keywords: [],
    explanation: "Ingestion runs in the background and is throughput-bound: you pay its cost once per chunk at write time, not on the user's latency path. Retrieval runs per query and is latency-bound. That asymmetry is a design lever: do the expensive, quality-improving work (structure-aware parsing, metadata extraction, generating per-chunk summaries or synthetic questions) at ingestion time, because you pay it once and amortize it across every future query, keeping the latency-critical query path cheap.",
    trap: "Putting expensive work on the query path 'to keep the index small.' Moving work from query time to ingestion time is almost always right — you pay it once and every query benefits, instead of paying per request.",
  },
  {
    id: "rag-ingestion-l2-2", topic: "retrieval", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "mcq",
    question: "When is a FULL rebuild of the index the right choice, versus incremental upsert/delete?",
    options: [
      "Full rebuild for every document edit; incremental only for reads",
      "Incremental upsert/delete for routine content changes (edits, deletes, supersessions) so cost scales with the change; full rebuild only when the change is global — swapping the embedding model or changing the chunking/index schema — because then every chunk's vector must be recomputed anyway",
      "Full rebuild whenever the corpus exceeds 1,000 documents",
      "Never do a full rebuild; incremental can handle every case including model swaps",
    ],
    correct: 1, keywords: [],
    explanation: "Incremental upsert/delete keyed by doc id is correct for routine content changes — edits, deletes, supersessions — because only the affected doc's chunks change, so cost scales with the change. A full rebuild is warranted only when the change is global and invalidates every existing vector: swapping the embedding model (new vector space — old and new vectors aren't comparable) or changing the chunking/index schema. Then every chunk must be recomputed anyway, so a rebuild is unavoidable, not wasteful.",
    trap: "Treating full rebuild as either always-needed or never-needed. Routine edits are incremental; an embedding-model or schema migration genuinely requires re-embedding the whole corpus.",
  },
  {
    id: "rag-ingestion-l2-3", topic: "retrieval", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "mcq",
    question: "You upgrade to a better embedding model but your index holds millions of chunks embedded with the OLD model. Why can't you just embed new queries with the new model against the old index, and what does the migration require?",
    options: [
      "You can — embedding models are interchangeable at query time",
      "Query and document vectors are only comparable if produced by the same model (same vector space); a new-model query vector compared against old-model document vectors is meaningless and retrieval collapses, so you must re-embed (backfill) the whole corpus with the new model and rebuild the index — typically via a shadow/dual index cutover to validate before switching traffic",
      "You only need to re-embed the queries, not the corpus",
      "Just normalize the old vectors and they become compatible with the new model",
    ],
    correct: 1, keywords: [],
    explanation: "A different embedding model defines a different vector space, so cosine/dot between a new-model query vector and old-model document vectors is not meaningful — retrieval quality collapses. The migration requires re-embedding (backfilling) the entire corpus with the new model and rebuilding the ANN index, usually through a shadow or dual index so you can validate the new index before cutting traffic over. There is no shortcut; you cannot mix vectors from two models in one similarity search. This is exactly the global change that justifies a full rebuild.",
    trap: "Assuming you can point new-model queries at an old-model index. Different models = different spaces = incomparable vectors; the whole corpus must be re-embedded and reindexed.",
  },
  {
    id: "rag-ingestion-l2-4", topic: "retrieval", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "mcq",
    question: "Two teams debate deduplication at ingestion. Team A dedups aggressively; Team B keeps everything. What is the actual tradeoff, and what's the risk on each side?",
    options: [
      "Dedup has no downside; always remove every similar document",
      "Dedup removes redundant/near-duplicate content so retrieval isn't flooded with many near-identical chunks (improving diversity and effective top-k), but over-aggressive dedup can discard genuinely distinct docs that merely look similar (e.g. per-region policy variants), losing needed information; keeping everything preserves coverage but wastes index space and lets duplicates crowd out diverse results",
      "Keeping duplicates always improves recall with no cost",
      "Dedup only matters for storage cost, never for retrieval quality",
    ],
    correct: 1, keywords: [],
    explanation: "Deduplication is a genuine tradeoff. Removing near-duplicates stops retrieval from returning many near-identical chunks that crowd out diverse, useful results and waste your effective top-k budget. But too-aggressive dedup can delete documents that are superficially similar yet meaningfully distinct — e.g. region-specific policy variants — losing information the system needs. Keeping everything preserves coverage but bloats the index and lets duplicates dominate results. The right threshold depends on how much true near-duplication your corpus actually has.",
    trap: "Treating dedup as free cleanup. Over-dedup can erase distinct-but-similar docs (regional variants, versions); the threshold is a quality decision, not just a storage optimization.",
  },
  {
    id: "rag-ingestion-l2-5", topic: "retrieval", tier: "L2", difficulty: "hard", band: "advanced", gated: true, type: "text",
    question: "Your RAG bot works in the demo but in production shows three problems: a two-column PDF returns garbled text, a one-paragraph edit triggers a six-hour rebuild of the whole corpus, and a deleted doc is still cited. A colleague proposes fixing all three by tuning the retriever. Explain why each is actually an ingestion-layer problem and give the correct fix for each.",
    options: null, correct: null,
    keywords: ["parse", "structure-aware", "incremental", "upsert", "doc id", "delete", "chunk", "retrieval capped", "ingestion", "reindex"],
    explanation: "All three are ingestion failures, not retrieval failures, because retrieval quality is capped by ingestion quality — the query path can only surface what ingestion put in the index and how it put it there, so tuning the retriever can't fix any of them. (1) The garbled two-column PDF is a parse-stage failure: a naive reader linearized the columns into nonsense, and no better embeddings or higher top-k reconstruct destroyed text — the fix is a structure-aware parser (layout/column/table detection). (2) The six-hour rebuild on a one-paragraph edit is a full-rebuild-vs-incremental problem: the unit of work should be the document via a stable doc-id → chunk-ids map, re-embedding only that doc's chunks and upserting them so cost scales with the change. (3) The still-cited deleted doc is a missing delete step in incremental re-indexing: on delete, the doc's chunks must be actively removed via the doc-id map. The retriever is the wrong layer for all three; the fixes are structure-aware parsing plus doc-id-keyed upsert/delete at ingestion.",
    trap: "Diagnosing ingestion problems as retrieval problems. Garbled parses, wasteful rebuilds, and stale deletions are all fixed in the ingestion pipeline; the retriever can only surface what ingestion produced.",
  },
];
