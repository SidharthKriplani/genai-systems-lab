// L2 case chains — Agents domain.
// Schema documented in src/data/caseChains.js (the aggregator). Keep the export
// name AGENTS_CASE_CHAINS; the aggregator imports it by that name.
export const AGENTS_CASE_CHAINS = [
  {
    id: "chain-agent-tool-routing-to-memory",
    domain: "agents",
    subtopic: "tool routing → termination → context blowup → state incoherence",
    level: "staff",
    type: "casechain",
    title: "A tool-using agent degrades in production — chase it down four layers",
    context: [
      "Production support-ops agent. ReAct loop (Thought → Action → Observation), GPT-4-class model, 14 tools exposed (search_kb, get_order, issue_refund, escalate, send_email, ...), 128k context window.",
      "Task class: resolve a customer ticket end-to-end (look up the order, check policy, take an action, confirm). Median 4–6 tool calls per resolved ticket.",
      "Rollout metrics: task success 78% in eval, but 54% in production. p95 latency 41s (eval was 9s). Token spend per ticket 3.1× the eval estimate.",
      "Tool schemas were written by the tool owners independently; several overlap semantically (search_kb vs search_orders vs lookup). No step budget, no trajectory summarization, no memory scoping — the full running transcript is replayed to the model every step.",
    ],
    steps: [
      {
        symptom:
          "Success dropped 78% → 54% in prod. Traces show the agent frequently calling the wrong tool or malforming arguments on the first action.",
        evidence: [
          "Trace sample: ticket needs an order lookup by email. Agent calls search_kb('order status for jane@...') — a docs-search tool — instead of get_order(email=...). It gets back help-center articles, not the order.",
          "Of first-action failures, ~60% are tool SELECTION errors (right intent, wrong tool) and ~40% are ARGUMENT errors (correct tool, malformed args — e.g. passing a raw email string where get_order expects {customer_email}).",
          "Tool descriptions: get_order → 'Look up order.' search_orders → 'Search orders.' lookup → 'Look up a record.' Three tools, near-identical one-line descriptions, overlapping names.",
          "Argument errors cluster on tools whose schema uses nested objects with no example in the description.",
        ],
        question:
          "The agent picks the wrong tool or malforms args on the opening action. What is the first-order cause?",
        options: [
          { id: "a", text: "The base model is too weak at reasoning — upgrade to a larger model so it picks the right tool" },
          { id: "b", text: "The tool interface is ambiguous: overlapping, thinly-described tools with no argument examples make selection a guess, and under-specified schemas make argument construction error-prone — the agent is reasoning correctly over a bad menu" },
          { id: "c", text: "Retrieval is failing — the KB search is returning bad results, so fix the embeddings behind search_kb" },
          { id: "d", text: "The agent needs more few-shot examples of full ticket resolutions in the system prompt" },
        ],
        correct: "b",
        finding:
          "Tool selection is a routing decision the model makes from the tool descriptions alone; three tools named get_order / search_orders / lookup with one-line, near-identical descriptions make the correct route genuinely ambiguous — the model is choosing sensibly from an ambiguous menu, not reasoning poorly. Argument malformation is the same failure one level down: a schema with a nested object and no example forces the model to guess the shape. This is an interface-design defect, not a capability defect. A bigger model (option a) still can't disambiguate two tools that are described identically, and it will keep guessing nested-argument shapes. The KB (option c) isn't the issue — the agent shouldn't be calling search_kb at all. More end-to-end few-shots (option d) don't fix per-tool ambiguity and bloat the prompt.",
        whatsTested:
          "Whether you locate tool-use failures in the tool CONTRACT (naming, description disjointness, argument schema + examples) before blaming the model. The most common junior move is to escalate model size when the interface is the bug.",
        antiPattern:
          "Upgrading the model to 'route better'. It masks a few percent of cases at higher cost while leaving the ambiguous tool menu in place — the error rate creeps back as ticket variety grows, and you've now normalised paying more for the same interface bug.",
        seniorFraming:
          "A staff engineer treats the tool set as an API surface the model must disambiguate zero-shot: distinct verbs, non-overlapping descriptions that say when NOT to use each tool, typed schemas with one concrete argument example per tool, and consolidation of redundant tools. Routing accuracy is an interface property first, a model property second.",
        consequence:
          "You consolidate to one get_order tool, rewrite descriptions with disjoint 'use this when' clauses, and add an argument example to every schema. First-action tool accuracy jumps and success recovers to ~74%. But now a new pattern dominates the remaining failures and the p95 latency spike: on hard tickets the agent never stops — it keeps calling tools and re-planning without ever emitting a final answer.",
      },
      {
        symptom:
          "Routing is fixed, but hard tickets now blow the latency budget — the agent loops, re-planning forever instead of terminating.",
        evidence: [
          "Trace on a stuck ticket: get_order → search_kb → get_order (same args) → search_kb → get_order → ... 22 tool calls, no final answer, killed by a 60s wall-clock timeout.",
          "The agent frequently re-issues an identical call it already made two steps earlier, gets the same observation, and 'reconsiders' — no memory that it already tried it.",
          "There is no maximum-step budget and no explicit 'stop when' criterion. The loop only ends on the wall-clock timeout or when the model happens to emit a final answer.",
          "Stuck trajectories are disproportionately tickets where the correct answer is 'the information isn't available — escalate.'",
        ],
        question:
          "The agent loops and re-plans indefinitely on hard tickets. What is missing from the loop?",
        options: [
          { id: "a", text: "The ReAct prompt is bad — rewrite the Thought/Action/Observation template and the loops will stop" },
          { id: "b", text: "There is no termination criterion: the loop has no step budget, no stop condition, and no reflection on whether progress is being made, so on unsolvable or hard tickets it re-plans forever until a timeout instead of stopping or escalating" },
          { id: "c", text: "The model forgot the task — inject the original task text again on every step to keep it on track" },
          { id: "d", text: "Raise the wall-clock timeout so the agent has enough time to finish the hard tickets" },
        ],
        correct: "b",
        finding:
          "An agent loop needs an explicit answer to 'when do I stop?' — ReAct by itself provides no termination guarantee; it will keep producing Action steps as long as the model wants to. Without a step budget the loop is unbounded, and without a progress/reflection check the model can't recognise it's cycling (it re-issues an identical call because nothing tells it that call already failed). The tickets that loop most are the unsolvable ones, because 'give up and escalate' is a decision the loop never offers. Rewriting the ReAct template (option a) doesn't add a stopping rule. Re-injecting the task (option c) is the opposite problem — the model hasn't forgotten the task, it lacks a terminal condition. Raising the timeout (option d) buys more looping and more spend, not termination.",
        whatsTested:
          "Whether you know that autonomy requires an explicit termination policy — step budget + stop condition + a reflection/progress check + a graceful give-up (escalate) path — and that 'loops forever' is a control-flow gap, not a prompt-wording gap.",
        antiPattern:
          "Bumping the timeout (or max tokens) to 'let it finish'. That converts a hang into a slower, more expensive hang; the unsolvable tickets still never terminate, they just burn 60s→120s and 2× the tokens before dying.",
        seniorFraming:
          "A staff engineer bounds every agent loop: a hard step/tool-call budget, a defined stop condition (final answer emitted OR escalate), and a lightweight reflection step ('am I making progress vs repeating myself?') that can trigger early escalation. Plan-execute architectures make this explicit — a finite plan with an exit — where naive ReAct leaves termination to chance.",
        consequence:
          "You add a step budget (max 10 tool calls), a reflection check that detects repeated no-progress calls and forces an escalate, and an explicit stop condition. Loops disappear and unsolvable tickets escalate cleanly. But raising the budget surfaced the cost problem underneath: on the longer legitimate trajectories, the model now sometimes fails mid-run with a context-length error, and token spend per ticket is still far above estimate.",
      },
      {
        symptom:
          "Loops are bounded, but long legitimate trajectories overflow the context window and cost explodes — every step replays the entire growing transcript.",
        evidence: [
          "Token accounting on a 9-step ticket: step 1 prompt ≈ 2k tokens; step 9 prompt ≈ 71k tokens. The whole running transcript — every prior Thought, Action, and full Observation — is resent on every step.",
          "Observations are the bulk: get_order returns a 6k-token JSON blob, search_kb returns 3–4 full articles. These raw dumps accumulate and are replayed at full length on every subsequent step.",
          "Cost per ticket scales roughly quadratically with trajectory length (each step reprocesses all prior steps). p95 tickets occasionally hit the 128k limit and error out mid-trajectory.",
          "Almost none of the early Observations are needed verbatim later — the agent needed one field (order_status) from that 6k-token order blob.",
        ],
        question:
          "Long trajectories overflow context and cost scales quadratically. What is the structural fix?",
        options: [
          { id: "a", text: "Move to a model with a bigger context window (256k / 1M) so the full transcript always fits" },
          { id: "b", text: "Observation bloat: raw tool outputs accumulate and are replayed in full every step, so context and cost grow with trajectory length — compress the trajectory (summarize/trim old steps, extract only the needed fields from tool outputs) so context stays bounded" },
          { id: "c", text: "Lower the step budget so trajectories stay short enough to fit — cap at 4 tool calls" },
          { id: "d", text: "Truncate the prompt to the last N tokens automatically when it gets close to the limit" },
        ],
        correct: "b",
        finding:
          "The cost and the overflow are the same root cause: the agent carries its entire raw history forward and reprocesses it every step, so an N-step trajectory does ~O(N²) token work and the prompt grows until it hits the window. The waste is concentrated in observation bloat — multi-thousand-token tool dumps replayed verbatim when only one field mattered. The fix is trajectory/context compression: summarize or drop resolved earlier steps, and reduce each Observation to the fields the agent actually needs (extract order_status, discard the 6k-token blob). A bigger window (option a) postpones the wall but keeps the quadratic cost — you pay more, longer. Capping the budget (option c) re-breaks the hard tickets you just fixed. Blind tail-truncation (option d) is the dangerous version of compression: it silently evicts early context the agent may still need (see the next layer).",
        whatsTested:
          "Whether you recognise that context grows with the trajectory and that the lever is compression/summarization + observation trimming, not a bigger window — and that naive truncation is a trap because it evicts by position, not by relevance.",
        antiPattern:
          "Reaching for a larger-context model as the fix. It hides the symptom (no more overflow error) while leaving the O(N²) token cost — the spend problem — completely unsolved, and it removes the pressure that would have made you compress.",
        seniorFraming:
          "A staff engineer budgets tokens like memory: bound the working context, summarize completed sub-steps into short state notes, and store full tool outputs out-of-band (return an id + the extracted fields, not the blob). Context engineering — deciding what the model sees each step — is a first-class part of agent design, not an afterthought.",
        consequence:
          "You add rolling summarization: after each step, older Observations are compressed to a one-line result and only extracted fields are kept; full blobs move to an external store. Context stays flat (~8k) and cost drops sharply. But the compression introduced a subtler failure — on multi-step tickets, the agent now sometimes contradicts or forgets a sub-result it established earlier, and end-to-end correctness on 5+ step tasks drops.",
      },
      {
        symptom:
          "Context is bounded, but multi-step correctness collapses — the agent forgets or contradicts an earlier sub-result across steps.",
        evidence: [
          "Trace: step 2 established 'order is out of warranty (purchased 14 months ago).' By step 6 the agent issues a full refund, reasoning as if the order were in warranty — the warranty fact was summarized away.",
          "The rolling summarizer compresses by recency, keeping the last few steps verbatim and squashing everything older into a lossy one-liner that dropped the warranty determination.",
          "Failures concentrate on tasks whose final action DEPENDS on a decision made early (eligibility, entitlement, prior confirmation). Single-action tickets are unaffected.",
          "There is no durable task state — no scratchpad of established facts / constraints that persists regardless of what the summarizer trims. Memory is just 'the recent transcript,' scoped by recency, not by importance.",
        ],
        question:
          "Compression fixed cost but broke multi-step correctness. What is the final missing layer?",
        options: [
          { id: "a", text: "The summarizer is buggy — make it keep more of the transcript so nothing important is lost" },
          { id: "b", text: "There is no scoped, durable working memory: compression evicts by recency, so load-bearing early facts (warranty status, entitlements, prior confirmations) get dropped — the agent needs an explicit state object that persists key decisions across steps independent of the transcript window" },
          { id: "c", text: "The model is hallucinating the warranty status — add a guardrail that blocks refunds" },
          { id: "d", text: "Roll back the compression from the previous layer — the transcript should be kept in full so nothing is forgotten" },
        ],
        correct: "b",
        finding:
          "Recency-based compression is relevance-blind: it keeps what happened last, not what matters. A determination made early ('out of warranty') is exactly the kind of load-bearing fact a downstream action depends on, and it's exactly what a recency summarizer discards. The agent then acts on a context that no longer contains its own earlier conclusion — so it contradicts itself. The fix is a durable, scoped working-memory object: an explicit state (established facts, constraints, decisions, pending action) that the agent reads and updates each step and that persists regardless of what the transcript summarizer trims. Making the summarizer 'keep more' (option a) just re-inflates context — back to the overflow you fixed. It isn't a hallucination to block (option c); the agent correctly determined warranty status, then lost it. Rolling back compression (option d) reintroduces the O(N²) cost and overflow — the two layers are in tension only if memory is undifferentiated; scoped state resolves both.",
        whatsTested:
          "Whether you separate two kinds of memory — the raw transcript (compressible, recency-scoped) vs. durable task state (established facts/decisions that must survive compression) — and know that multi-step correctness requires the latter as an explicit, importance-scoped object, not an emergent property of the transcript.",
        antiPattern:
          "Fixing forgetting by keeping the whole transcript. That trades the correctness bug straight back for the cost/overflow bug you resolved one layer up — you oscillate between 'too expensive' and 'forgets things' instead of separating the two memory roles.",
        seniorFraming:
          "A staff engineer designs agent memory in tiers: an ephemeral working transcript that gets compressed, and a persistent, structured state/scratchpad scoped to the task's load-bearing decisions that is never silently evicted. Memory is scoped by importance and lifetime, not by recency — which is precisely what lets compression and correctness coexist.",
        consequence: null,
      },
    ],
    diagnosis:
      "A production agent that was sound in eval but missing every layer of real-world control: an unambiguous tool interface, a termination policy, bounded context, and durable scoped memory. Each fix removed one failure and exposed the next — because they sit in a dependency stack, not side by side.",
    explanation:
      "The chain compounds by layer. Ambiguous tools produced wrong-tool / malformed-arg failures; fixing the interface let the agent actually attempt hard tickets — which exposed that the loop never terminates (no step budget / stop condition). Bounding the loop let legitimate long trajectories run — which exposed observation bloat (full transcript replayed every step → O(N²) cost and window overflow). Compressing the trajectory bounded cost — but recency-based compression evicted load-bearing early facts, exposing the absence of durable scoped memory and collapsing multi-step correctness. No single metric revealed the stack: eval success hid it (short, unambiguous eval tickets never triggered the deeper layers), and each layer only became visible once the one above it was fixed.",
    fix:
      "Build the agent as an ordered control stack, not a bare ReAct loop: (1) a disambiguated tool interface — distinct verbs, disjoint 'use when / don't use when' descriptions, typed schemas with argument examples, redundant tools consolidated; (2) a termination policy — hard step/tool-call budget, explicit stop condition, a reflection/progress check, and a graceful escalate path for unsolvable tasks; (3) context compression — rolling summarization of completed steps and observation trimming (keep extracted fields, store full outputs out-of-band) to keep working context flat and break the quadratic cost; (4) tiered memory — an ephemeral compressible transcript PLUS a durable, importance-scoped state object holding load-bearing decisions that survives compression. Measure per-step tool accuracy, termination/escalation rate, tokens-per-trajectory, and multi-step (5+ step) task correctness — not just eval success.",
    source: "Authored · GSL L2 Case Chain",
  },
];
