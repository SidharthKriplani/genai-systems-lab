// src/data/questions/q-gap-b.js
// L0/L1/L2 question ladders — model-routing/cascades/fallbacks + LLM security beyond injection.
// Spread into PREP_QUESTIONS. Schema mirrors q-foundations.js:
//   id: "<topic>-l<0|1|2>-<n>"   topic: "model-routing" | "llm-security"
//   tier: "L0" | "L1" | "L2"     difficulty: easy(L0) | medium(L1) | hard(L2)
//   gated: boolean               type: "mcq" | "text"
//   options/correct for mcq; keywords[] for text; explanation + trap always.

export const Q_GAP_B = [
  // ══════════════════════════════════════════════════════════════════════════
  // MODEL ROUTING / CASCADES / FALLBACKS
  // ══════════════════════════════════════════════════════════════════════════

  // ── L0: Define (3) ─────────────────────────────────────────────────────────
  {
    id: "model-routing-l0-1", topic: "model-routing", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "What is the core motivation for model routing in an LLM product?",
    options: [
      "To make the frontier model answer faster by giving it more GPUs",
      "Not every query needs the frontier model — traffic is a difficulty distribution, so you send each query to the cheapest model that can still answer it correctly, saving cost and latency",
      "To encrypt queries before they reach the model provider",
      "To increase the temperature on hard queries and lower it on easy ones",
    ],
    correct: 1, keywords: [],
    explanation: "Real traffic is a distribution of difficulty: a large easy fraction, a moderate middle, and a thin hard tail. Sending everything to one big model pays worst-case cost and latency on average-case queries. Routing matches each query to the cheapest-capable model, spending the quality budget where it actually matters.",
    trap: "Thinking routing is about speeding up the big model. It's about *not using* the big model when a cheaper one suffices — the win is in the query-to-model match, not in accelerating any single model.",
  },
  {
    id: "model-routing-l0-2", topic: "model-routing", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "In a model cascade, what is the basic flow?",
    options: [
      "Send every query to all models in parallel and pick the best answer",
      "Try the small/cheap model first; only if a confidence check on its answer fails do you escalate to the larger model",
      "Always use the large model, then summarise its answer with a small model",
      "Randomly pick a model for each query to balance load",
    ],
    correct: 1, keywords: [],
    explanation: "A cascade runs the cheap model first, then applies a confidence check to its answer. If the answer passes, you return it; if it fails, you escalate to the larger model. The cheap model handles what it can and the expensive model is a fallback for hard cases — so cost is low on the easy majority and quality is preserved on the hard tail.",
    trap: "Confusing a cascade with parallel best-of-N ensembling. A cascade is *serial* and *conditional* — the large model runs only when the small model's answer fails the check, not always.",
  },
  {
    id: "model-routing-l0-3", topic: "model-routing", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "What is provider failover (a fallback chain) in an LLM system?",
    options: [
      "Choosing the cheapest model when everything is healthy",
      "When the primary model errors, times out, or is rate-limited, automatically falling back to a different provider's model or a degraded smaller model instead of returning an error to the user",
      "Compressing the model so it fits on cheaper hardware",
      "Caching answers so repeated queries skip the model",
    ],
    correct: 1, keywords: [],
    explanation: "Failover is about staying up when your first-choice model is unavailable (down, timing out, or 429 rate-limited). A fallback chain, after a short retry, routes to a different provider's comparable model or to a degraded-but-available smaller model, degrading gracefully rather than erroring. It's an availability control, distinct from cost routing.",
    trap: "Conflating failover with routing. Routing picks the cheapest-capable model when healthy; failover keeps you up when your choice is *not* healthy — orthogonal concerns.",
  },

  // ── L1: Deep single-concept (5) ────────────────────────────────────────────
  {
    id: "model-routing-l1-1", topic: "model-routing", tier: "L1", difficulty: "medium", gated: false, type: "mcq",
    question: "A router and a cascade both cut cost. What is the fundamental difference in *when* they make the routing decision, and one consequence?",
    options: [
      "There is no difference; the terms are interchangeable",
      "A router decides *before* any answer exists (a cheap classifier commits the query up front — lowest latency, but a misroute has no recovery); a cascade decides *after* an attempt (small model first, escalate on a confidence check — more accurate, but escalated queries pay small+large serially)",
      "A router decides after the large model answers; a cascade decides before any model runs",
      "A cascade is always cheaper than a router on every query",
    ],
    correct: 1, keywords: [],
    explanation: "The distinction is timing. A router classifies the query and commits it to one model before producing any answer — a single inference, lowest latency, but if it misjudges there's no second look. A cascade runs the cheap model first and inspects that actual answer via a confidence check before deciding to escalate — strictly more information, so it routes more accurately, at the cost of tail latency (an escalated query pays for both models in series).",
    trap: "Saying the cascade is always cheaper. On easy queries it matches the router (one cheap call), but on escalated queries it pays small+large — sometimes more than a router that would have sent the query straight to large.",
  },
  {
    id: "model-routing-l1-2", topic: "model-routing", tier: "L1", difficulty: "medium", gated: true, type: "mcq",
    question: "A cascade escalates when the small model is 'unsure.' Your teammate proposes using the small model's token logprobs (sequence probability) as the sole escalation signal. What is the key failure mode?",
    options: [
      "Logprobs cannot be read from any model, so the cascade won't run",
      "Models are often poorly calibrated and can be confidently wrong — a high-logprob but incorrect answer passes the check and never escalates, so the cascade silently returns wrong cheap answers on exactly the cases it should escalate",
      "Logprobs always force escalation, so nothing is ever served cheaply",
      "Logprobs only work for the large model, not the small one",
    ],
    correct: 1, keywords: [],
    explanation: "A logprob threshold assumes the model knows when it doesn't know, but LLMs are frequently overconfident and can assign high probability to wrong outputs. Those confident-but-wrong answers clear the check and are returned without escalation — a silent failure on the dangerous cases. More robust signals (self-consistency across samples, or a separate verifier/judge) mitigate this at extra cost.",
    trap: "Trusting a single logprob threshold as calibrated 'confidence.' Confident-wrong is the exact case it misses; a verifier or self-consistency is needed to catch answers the model is sure about but got wrong.",
  },
  {
    id: "model-routing-l1-3", topic: "model-routing", tier: "L1", difficulty: "medium", gated: false, type: "mcq",
    question: "You must build the classifier for a front-door router. What is a hard requirement on the router itself?",
    options: [
      "The router should be a copy of the large model for maximum accuracy",
      "The router must be much cheaper and faster than the models it routes to, or it defeats its own purpose — a router as expensive as the large model would erase the savings",
      "The router must call every model once before deciding",
      "The router should never use heuristics, only a fine-tuned LLM",
    ],
    correct: 1, keywords: [],
    explanation: "The whole point of routing is to save cost and latency, so the routing decision must be far cheaper than the inference it saves. A router can be a small fine-tuned model, an embedding-similarity check against labelled examples, heuristics (length, code presence, task type), or a tiny LLM — but it must be lightweight. If the router costs as much as the large model, you've added overhead with no benefit.",
    trap: "Building an accurate-but-expensive router. Accuracy without a cost gap is pointless — the router's spend is pure overhead added to every query, so it must be a fraction of the models it dispatches to.",
  },
  {
    id: "model-routing-l1-4", topic: "model-routing", tier: "L1", difficulty: "medium", gated: false, type: "text",
    question: "Explain what a 'silent misroute' is in a routing system, why it is more dangerous than a loud failure, and what makes it hard to detect.",
    options: null, correct: null,
    keywords: ["misroute", "small model", "confidently wrong", "no recovery", "silent", "wrong answer", "calibration", "quality", "cheap", "undetected"],
    explanation: "A silent misroute is when the router (or a bad cascade signal) sends a hard query to the small model, which returns a *confidently wrong* answer with no second look. It's more dangerous than a loud failure (an error page, a timeout) because nothing signals that anything went wrong: the system returns a fluent, cheap, incorrect answer. It's hard to detect because the query is served successfully and cheaply — there's no error, no escalation, no flag — so it only surfaces when a user notices the wrong answer. The root causes are overconfident/mis-calibrated confidence signals and router drift as the traffic distribution shifts.",
    trap: "Assuming a wrong route just costs a bit of quality. The real danger is that it's *silent and confident* — no error to alert on, so bad answers ship undetected until a user complains.",
  },
  {
    id: "model-routing-l1-5", topic: "model-routing", tier: "L1", difficulty: "medium", gated: true, type: "mcq",
    question: "Your primary provider had a 40-minute outage and your product went fully down, even though you had a cost router in place. Why didn't routing help, and what would have?",
    options: [
      "The router was misconfigured; a correct router prevents outages",
      "Routing only chooses among *healthy* models to save cost/latency — it makes no availability promise. Uptime needs provider failover: a fallback chain that, on primary error/timeout/rate-limit, routes to a different provider or a degraded model instead of erroring",
      "You should have bought a second copy of the same provider's flagship",
      "Nothing helps; if a provider is down, the product must be down",
    ],
    correct: 1, keywords: [],
    explanation: "Routing and failover are orthogonal. Routing decides which model to use among available options to save cost and latency; it says nothing about what happens when your chosen provider is unavailable. Availability is a separate concern handled by a cross-provider failover chain that degrades gracefully — on a primary failure, fall back to another provider's comparable model or a smaller degraded model rather than returning an error.",
    trap: "Expecting cost routing to provide resilience. They solve different problems; a mature stack layers failover *on top of* routing, and a single-provider fallback (same provider again) doesn't remove the single point of failure.",
  },

  // ── L2: Cross-concept / tradeoffs (5) ──────────────────────────────────────
  {
    id: "model-routing-l2-1", topic: "model-routing", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "With small=1x and large=20x cost and traffic that is 70% easy / 25% moderate / 5% hard, why do a router and a cascade end up with *similar* cost savings but *different* latency profiles?",
    options: [
      "They have identical cost and identical latency; there is no difference",
      "Both keep the expensive model off the easy majority, so both cut cost roughly 2-3x. But a cascade runs the small model on *every* query and then the large model on the escalated ones (serial small→large), so its hard-query latency roughly doubles; a router commits up front, so hard queries go straight to large with no extra hop",
      "The cascade is always 10x cheaper than the router",
      "The router adds serial latency on hard queries while the cascade does not",
    ],
    correct: 1, keywords: [],
    explanation: "Both strategies avoid paying the 20x model on the ~70% easy traffic, so both achieve comparable ~2-3x cost reductions. The latency divergence comes from *how* they handle hard queries: a cascade must first run the small model, observe the confidence check fail, then run the large model — two serial calls — so escalated (typically hard) queries pay extra latency. A router sends a hard query straight to the large model in one hop, so no extra latency, but it decided before seeing an answer and can misroute.",
    trap: "Assuming similar cost means similar behaviour. The cost curves converge, but the latency and accuracy profiles differ: cascade = better routing accuracy, worse tail latency; router = lower latency, higher misroute risk.",
  },
  {
    id: "model-routing-l2-2", topic: "model-routing", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "For a cascade's escalation decision, compare token-logprobs, self-consistency, and a verifier/judge. What is the correct tradeoff framing?",
    options: [
      "They are interchangeable; pick any one",
      "Logprobs are cheapest to read but miss confident-wrong answers (calibration failure); self-consistency (sample several times, escalate on disagreement) is more robust but multiplies the small model's cost; a verifier/judge is the most aligned with 'good enough' and most flexible but adds a call and can itself be wrong — so it's a cost-vs-reliability spectrum, often layered",
      "The verifier is always the cheapest because it's a small model",
      "Self-consistency is free because it reuses one forward pass",
    ],
    correct: 1, keywords: [],
    explanation: "The three signals sit on a cost-vs-reliability spectrum. Logprobs are essentially free to read but assume calibration the model may lack, so confident-wrong answers slip through. Self-consistency samples the small model multiple times and escalates on disagreement — more robust to the calibration problem, but it multiplies the cheap model's inference cost. A verifier/judge (rules or a small model grading the answer against 'does it actually answer / cite a source') is the most flexible and best aligned with quality, but it adds a call and can be wrong itself. Production systems often layer them.",
    trap: "Treating the signals as equivalent. Their whole value is *what they catch and what they cost* — logprobs miss confident-wrong, self-consistency pays N× the small model, a judge adds a fallible extra call; the choice is a tradeoff, not a default.",
  },
  {
    id: "model-routing-l2-3", topic: "model-routing", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "You ship a router trained on last quarter's traffic. Three months later, quality on a new user segment quietly degrades. What is the mechanism, and how do you defend against it?",
    options: [
      "The models got worse; retrain the large model",
      "Router drift — the difficulty distribution shifted (new features/segments), so a classifier fit to old traffic mis-classifies today's queries; defend by monitoring routed-quality by segment, re-fitting the router on fresh labelled traffic, and/or adding a cascade-style check so misroutes can escalate rather than silently ship",
      "The router cannot drift; classifiers are static and always correct",
      "The fix is to route everything to the large model permanently",
    ],
    correct: 1, keywords: [],
    explanation: "A router is a classifier over the query-difficulty distribution, and that distribution is not stationary — new features, new user segments, and changing usage shift it. A router fit to stale traffic increasingly mis-classifies, and because misroutes are silent, quality erodes without an error signal. Defenses: monitor answer quality per segment (not just aggregate), periodically re-fit the router on fresh labelled data, and add a cascade-style escalation so a low-confidence answer can be caught rather than shipped blind.",
    trap: "Assuming a trained router is 'done.' The traffic distribution drifts, and silent misroutes hide the degradation — routing quality is a metric you must monitor and re-tune, not set once.",
  },
  {
    id: "model-routing-l2-4", topic: "model-routing", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "When you fail over from your primary model to a different provider's model, why isn't 'just retry the same prompt on provider B' automatically safe?",
    options: [
      "It is always safe; any model accepts any prompt identically",
      "A fallback model may have a different tokenizer, context window, and expected output format, so the same prompt can overflow context, tokenize differently, or produce differently-structured output — the prompt/formatting must survive the swap, and you should degrade gracefully (a smaller model's answer still beats an error page)",
      "Provider B always rejects prompts written for provider A",
      "Failover requires re-embedding your entire vector database first",
    ],
    correct: 1, keywords: [],
    explanation: "Fallback models are not drop-in identical. Differences in tokenizer (token counts and boundaries), context window (a prompt that fit the primary may overflow the fallback), and output-format expectations (structured output, tool-call schemas) mean the same prompt can behave differently or fail. A robust failover uses prompts/formatting that survive the swap and degrades gracefully — a smaller or different model's answer is preferable to returning an error. It's a real engineering task, not a free retry.",
    trap: "Treating failover as a transparent retry. Cross-provider swaps change tokenization, context limits, and output formats; the prompt must be portable and the degradation graceful, or the fallback itself fails.",
  },
  {
    id: "model-routing-l2-5", topic: "model-routing", tier: "L2", difficulty: "hard", gated: true, type: "text",
    question: "You're designing the model layer for a high-volume assistant. Discuss how you'd combine routing, cascading, and failover — and the failure modes each introduces — into one coherent strategy.",
    options: null, correct: null,
    keywords: ["router", "cascade", "confidence", "failover", "fallback", "cost", "latency", "misroute", "calibration", "blast radius", "quality", "tail"],
    explanation: "A coherent strategy layers three orthogonal concerns. (1) Routing/cascading for cost: route the easy majority to a small model and reserve the large model for the hard tail — a router (decide-before, lowest latency, misroute risk) for cleanly-separable, high-volume patterns, or a cascade (decide-after via a confidence signal, more accurate, serial tail latency) where routing accuracy matters more than latency. (2) The confidence signal is the crux of any cascade: logprobs are cheap but miss confident-wrong, self-consistency and verifiers are more robust at higher cost; monitor calibration. (3) Failover for availability, orthogonal to cost: a cross-provider fallback chain that degrades gracefully on primary error/timeout/rate-limit, with prompts portable across tokenizer/context/format differences. Failure modes to own: silent misroutes (confidently-wrong cheap answers), cascade tail latency on the most important queries, router drift as the traffic distribution shifts, and mis-calibrated confidence signals. The senior signal is separating cost (routing/cascade) from availability (failover) and respecting that the whole scheme rests on a well-calibrated 'is this good enough?' check.",
    trap: "Mixing cost and availability into one mechanism. Routing/cascading save cost, failover keeps you up — treating them as the same thing (or forgetting calibration underpins the cascade) is the common gap.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LLM SECURITY BEYOND INJECTION
  // ══════════════════════════════════════════════════════════════════════════

  // ── L0: Define (3) ─────────────────────────────────────────────────────────
  {
    id: "llm-security-l0-1", topic: "llm-security", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "Why is PII detection and redaction a *two-sided* problem in an LLM app?",
    options: [
      "You only need to filter PII on the output, since input PII belongs to the user anyway",
      "You must redact PII on the *input* (so it isn't spread into logs, vector stores, and third-party APIs) and on the *output* (so the model doesn't emit it to someone who shouldn't see it)",
      "PII only needs filtering during model training, not at inference",
      "Redaction is only needed if the model is fine-tuned",
    ],
    correct: 1, keywords: [],
    explanation: "PII must be handled on both boundaries. On input, once a user's PII is logged, embedded into a vector DB, or forwarded to a third-party model API, it has spread into systems never scoped to hold it — a compliance problem independent of any attacker. On output, the model can regurgitate or reconstruct PII and hand it to the wrong recipient, so a redaction pass must run before the response reaches the user.",
    trap: "Filtering only the output. Input PII silently spreads into your logs and stores the moment it's written — a compliance breach even if the model never repeats it.",
  },
  {
    id: "llm-security-l0-2", topic: "llm-security", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "What is a guardrail in the LLM-security sense?",
    options: [
      "A rate limiter that caps how many queries a user can send",
      "An input and/or output filter wrapping the model that inspects, redacts, or blocks content — e.g. blocking PII, secrets, or unsafe output before it reaches the user or a tool",
      "A backup copy of the model on a second GPU",
      "A cache that stores previous answers to save cost",
    ],
    correct: 1, keywords: [],
    explanation: "Guardrails are filters that wrap the model. An input guardrail inspects (and redacts/blocks) what goes into the model or your logs/stores; an output guardrail inspects what comes out before it reaches the user or a downstream tool, blocking PII, secrets/credentials, unsafe content, and off-policy answers. They can be rules/regex, classifier models, or an LLM judge, usually layered.",
    trap: "Confusing guardrails with rate limiting or infra redundancy. Guardrails are content-inspection filters on the input/output boundaries, not throughput or availability controls.",
  },
  {
    id: "llm-security-l0-3", topic: "llm-security", tier: "L0", difficulty: "easy", gated: false, type: "mcq",
    question: "What does the principle of least privilege mean for an LLM agent with tools?",
    options: [
      "Give the agent admin access so it never gets blocked mid-task",
      "The agent should be able to call only the tools it actually needs, and each tool should hold only the narrowest credential that lets it do its job — nothing more",
      "The agent should have no tools at all",
      "The agent should share one credential across all tools for simplicity",
    ],
    correct: 1, keywords: [],
    explanation: "Least privilege scopes an agent to only the tools it requires and each tool to the minimum credential that performs its function (read-only where read-only suffices, single-tenant where cross-tenant isn't needed). This shrinks the blast radius by construction: any compromise — injection, a confused-deputy trick, or a plain model mistake — can only do what the scoped permissions allow.",
    trap: "Granting broad access 'to be safe against being blocked.' Over-scoping is exactly the risk — a 'read-a-file' agent holding delete-production rights turns any compromise into a catastrophe.",
  },

  // ── L1: Deep single-concept (5) ────────────────────────────────────────────
  {
    id: "llm-security-l1-1", topic: "llm-security", tier: "L1", difficulty: "medium", gated: false, type: "mcq",
    question: "Data exfiltration from an LLM app comes in several flavours. Which set correctly names three distinct ones?",
    options: [
      "Higher latency, higher cost, and more tokens",
      "System-prompt leakage (reciting proprietary instructions or embedded keys), cross-tenant / memorised-training-data leakage (surfacing another user's or a memorised record), and tool-mediated exfiltration (an agent smuggling secrets out via an outbound URL, email, or tool call)",
      "Prompt injection, jailbreaks, and role-play attacks",
      "Slow responses, wrong answers, and hallucinations",
    ],
    correct: 1, keywords: [],
    explanation: "Exfiltration is sensitive data escaping the boundary it should stay inside. Three distinct flavours: (1) system-prompt leakage — the model recites its proprietary system prompt or an embedded key; (2) cross-tenant or memorised-training-data leakage — another tenant's data in context (shared cache, mis-scoped retrieval) or a fine-tuned model reproducing memorised records; (3) tool-mediated exfiltration — an agent induced to put secret data into an outbound action, carrying it out of the perimeter. It's the mirror of injection (data getting *in*).",
    trap: "Listing prompt-injection variants as exfiltration. Injection is bad data getting *in* to influence the model (a separate topic); exfiltration is sensitive data getting *out* through the model or its tools.",
  },
  {
    id: "llm-security-l1-2", topic: "llm-security", tier: "L1", difficulty: "medium", gated: true, type: "mcq",
    question: "You add an output guardrail that scans replies for PII and secrets before showing them to the user, but your agent still exfiltrated data. What did the placement miss?",
    options: [
      "Output guardrails are useless; only input guardrails matter",
      "The output guardrail must also gate the model's *tool calls*, not just the user-facing reply — an agent's most dangerous output is executed (a tool call sending an email, fetching a URL, or writing to a DB), so a tool call carrying secret data out must be inspected before it runs, which a user-facing-only filter never sees",
      "The guardrail should have been on the input side only",
      "The agent simply needed a bigger model",
    ],
    correct: 1, keywords: [],
    explanation: "For an agent, the highest-risk output is not the text shown to a human but the *action* it takes — a tool call that can carry data out of your perimeter (an outbound request, an email, a DB write). A guardrail placed only between the model and the user never inspects those tool calls, so tool-mediated exfiltration sails past it. The output guardrail must gate the tool invocation itself, blocking calls that would leak secrets or PII before they execute.",
    trap: "Guarding only the user-facing reply. An agent's most dangerous output is executed, not shown — the guardrail has to sit between the model and its tools, or tool-mediated exfiltration is invisible to it.",
  },
  {
    id: "llm-security-l1-3", topic: "llm-security", tier: "L1", difficulty: "medium", gated: false, type: "mcq",
    question: "A 'read-a-file' agent is found holding a cloud credential that can also delete production storage. Why is this the textbook least-privilege violation, and what's the fix?",
    options: [
      "It's fine as long as you add a system-prompt instruction telling the model not to delete anything",
      "The capability granted vastly exceeds the function performed, so any compromise inherits the whole blast radius (it could wipe production). Fix: scope the credential to the narrowest need (read-only, restricted to the specific bucket/path), allow-list only required tools, and require approval for irreversible actions",
      "The agent needs even broader access to handle edge cases",
      "Nothing is wrong; agents should always have admin rights",
    ],
    correct: 1, keywords: [],
    explanation: "The violation is that the granted capability (read + write + delete + admin) far exceeds the agent's actual function (read a file). Any compromise — injection, confused deputy, or a model mistake — then inherits that full blast radius, up to wiping production. The fix is least privilege: scope the credential to read-only and to the specific bucket/path, allow-list only the tools the agent needs (deny by default), and gate irreversible/high-impact actions behind human approval, so a compromise can do almost nothing.",
    trap: "Relying on a system-prompt 'please don't delete' instruction. Model-level safety can't be guaranteed; the durable fix is to scope the *credential* so the capability simply isn't there to abuse.",
  },
  {
    id: "llm-security-l1-4", topic: "llm-security", tier: "L1", difficulty: "medium", gated: false, type: "text",
    question: "Explain why logging raw prompts and responses for audit purposes can itself become a security/compliance liability, and how to log responsibly.",
    options: null, correct: null,
    keywords: ["logs", "PII", "redaction", "access control", "retention", "sensitive", "audit", "compliance", "encrypt", "minimise"],
    explanation: "Audit logging is required — you must be able to reconstruct what the model saw, did, and which tools it called — but raw prompt/response logs contain exactly the sensitive data (PII, secrets, other tenants' data) you were trying to protect. Logging them verbatim spreads that data into a new store, often with weaker access controls, which is a common self-inflicted leak and a compliance breach. Responsible logging applies the same PII redaction to logs as to live traffic, restricts access to the logs, encrypts them, and enforces retention/minimisation (keep only as long as needed, then delete). The audit trail must be complete enough to investigate incidents yet scrubbed and access-controlled so it isn't itself the leak.",
    trap: "Treating logs as a safe internal dumping ground. Raw logs replicate all the sensitive data into a store that's easy to under-protect — they need the same redaction, access control, and retention rules as the live path.",
  },
  {
    id: "llm-security-l1-5", topic: "llm-security", tier: "L1", difficulty: "medium", gated: true, type: "mcq",
    question: "Your EU users' data must stay in the EU. Why does this data-residency requirement constrain your LLM architecture specifically, and not just your database?",
    options: [
      "It doesn't; residency only applies to databases at rest",
      "Sending a prompt containing EU user data to a model/provider hosted in another region is itself a data transfer — so residency constrains *which model, provider, and region* you may route a prompt to, and a third-party API in the wrong region can be a violation on its own",
      "Residency only matters if you fine-tune the model",
      "You can ignore residency as long as you delete the data afterward",
    ],
    correct: 1, keywords: [],
    explanation: "A prompt that contains regulated user data is a movement of that data the moment it's sent to a model provider. If the provider/model is hosted in a region the data legally can't leave, the inference call itself is a residency violation — independent of your database. So residency constrains model and provider selection and routing (region-pinned endpoints, in-region providers), not just data at rest. This is a real architectural constraint on the LLM layer.",
    trap: "Thinking residency is only a storage concern. Every inference call ships the prompt to the provider's region — so the model/provider/region choice is itself a residency decision.",
  },

  // ── L2: Cross-concept / tradeoffs (5) ──────────────────────────────────────
  {
    id: "llm-security-l2-1", topic: "llm-security", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "How does data exfiltration relate to prompt injection, and why is it a mistake to assume that hardening against injection covers exfiltration?",
    options: [
      "They are the same threat; injection defenses fully cover exfiltration",
      "Injection is bad data getting *in* to influence the model; exfiltration is sensitive data getting *out* through the model or its tools — mirror-image directions. Injection defenses filter/neutralise malicious input but do nothing to stop the model emitting PII, reciting its system prompt, surfacing another tenant's data, or smuggling secrets out via a tool call",
      "Exfiltration is impossible if you use a large enough model",
      "Injection only affects training, exfiltration only affects inference",
    ],
    correct: 1, keywords: [],
    explanation: "Injection and exfiltration are mirror images. Injection concerns malicious or manipulative content getting *into* the model's context to steer its behaviour; exfiltration concerns sensitive information getting *out* — the model emitting PII, leaking its system prompt, surfacing cross-tenant or memorised data, or an agent carrying secrets out through a tool. Input-side injection defenses do nothing about the output/action path, so a system fully hardened against injection can still leak freely. They require distinct controls (output guardrails, tool-call gating, least privilege).",
    trap: "Assuming injection defense is a superset of security. It only covers the input-influence direction; the exfiltration (output/action) direction needs its own output filters, tool-call gating, and privilege scoping.",
  },
  {
    id: "llm-security-l2-2", topic: "llm-security", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "For an output guardrail you can use rule/regex filters, a classifier model, or an LLM judge. What's the correct tradeoff framing for choosing (or combining) them?",
    options: [
      "Always use only regex, since it never has false positives",
      "Regex is fast/cheap and great for structured patterns (card numbers, API-key formats) but brittle and blind to context; a classifier model catches fuzzier PII/toxicity/secrets but adds cost and can misfire; an LLM judge is the most context-aware and flexible for 'off-policy' content but is slowest and can itself be wrong — so production usually layers them (cheap deterministic checks first, model-based checks for nuance)",
      "The LLM judge is always cheapest and most reliable",
      "Classifiers are unnecessary if you have an LLM judge",
    ],
    correct: 1, keywords: [],
    explanation: "The three guardrail mechanisms trade speed/cost against coverage/nuance. Regex is nearly free and precise on well-structured patterns (credit cards, SSNs, key formats) but brittle and context-blind. A classifier model handles fuzzier categories (names, addresses, toxicity, secret-like strings) at added cost with some error rate. An LLM judge is the most flexible for context-dependent, off-policy content but is the slowest and can itself be wrong. Layering — fast deterministic checks first, model-based checks for nuance — gives coverage without paying the judge's latency on every request.",
    trap: "Picking one mechanism as universally best. Each catches different things at different cost; the strong answer layers cheap deterministic filters with model-based ones rather than relying on any single mechanism.",
  },
  {
    id: "llm-security-l2-3", topic: "llm-security", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "In a multi-tenant LLM app, tenant A's user receives an answer containing tenant B's data. Name two distinct mechanisms that can cause this and the corresponding controls.",
    options: [
      "Only prompt injection causes it; the fix is input filtering",
      "Mechanism 1: mis-scoped retrieval / a shared cache puts B's data into A's context — control: strict per-tenant scoping of retrieval, caches, and tool credentials (single-tenant by default). Mechanism 2: a fine-tuned model memorised B's records and reproduces them — control: avoid training on sensitive raw data, apply data minimisation, and use output guardrails to catch verbatim sensitive strings",
      "It's always a model-size problem; use a bigger model",
      "Cross-tenant leakage is impossible if you use embeddings",
    ],
    correct: 1, keywords: [],
    explanation: "Cross-tenant leakage has at least two distinct causes. (1) Context contamination: a mis-scoped retrieval query or a shared cache pulls tenant B's data into tenant A's context, and the model surfaces it — the control is strict per-tenant isolation of retrieval indexes, caches, and tool credentials, single-tenant by default. (2) Memorisation: a model fine-tuned on tenant data can memorise and reproduce specific records verbatim — the control is avoiding training on sensitive raw data, applying data minimisation, and using output guardrails to detect verbatim sensitive strings. Both are exfiltration paths that injection defenses don't touch.",
    trap: "Blaming everything on injection or model size. Cross-tenant leakage is usually an isolation/scoping failure or a memorisation issue — architectural controls (per-tenant scoping, training hygiene, output filtering), not a bigger model.",
  },
  {
    id: "llm-security-l2-4", topic: "llm-security", tier: "L2", difficulty: "hard", gated: true, type: "mcq",
    question: "Why is least privilege on tools often described as the highest-leverage control for agents, framed against the impossibility of perfect model safety?",
    options: [
      "Because it makes the model itself immune to manipulation",
      "Because you cannot guarantee the model won't be manipulated or mistaken, so you shrink the blast radius by construction at the *tool* layer — even a fully-compromised agent can only do what its scoped permissions allow, turning a potential catastrophe into a bounded, often harmless, action",
      "Because scoped credentials make the model run faster",
      "Because it eliminates the need for any output guardrails",
    ],
    correct: 1, keywords: [],
    explanation: "Model-level safety can never be fully guaranteed — injection, confused-deputy attacks, and plain model mistakes all exist. Least privilege accepts that and moves the guarantee to the tool layer: if each agent can call only the tools it needs, each with the narrowest credential, then the worst a compromise can do is bounded by those scoped permissions. That converts an unbounded, catastrophic blast radius into a small, often harmless one — which is why it's the highest-leverage agent control. It complements, but does not replace, output guardrails.",
    trap: "Thinking least privilege makes the model safe. It doesn't touch the model — it bounds the *consequences* of a compromise, which is precisely why it matters when model safety can't be guaranteed.",
  },
  {
    id: "llm-security-l2-5", topic: "llm-security", tier: "L2", difficulty: "hard", gated: true, type: "text",
    question: "A security lead says 'the model answers correctly, so we're fine to ship.' Argue why correctness is not the bar for a production LLM system, referencing PII, exfiltration, least privilege, and compliance.",
    options: null, correct: null,
    keywords: ["PII", "exfiltration", "guardrail", "least privilege", "tool", "compliance", "residency", "audit", "retention", "blast radius", "boundary", "correctness"],
    explanation: "Correctness of the answer is necessary but not sufficient in production, because a system can produce correct answers while still failing on safety and legality. PII: it may emit a customer's card number or spread pasted SSNs into logs/vector stores — correct answer, leaked data. Exfiltration: it may recite its system prompt, surface another tenant's data, or an agent may smuggle secrets out through a tool call — none of which a correctness check catches. Least privilege: an over-scoped agent that answers correctly today can, once compromised, wipe production tomorrow — the blast radius is the risk, not the answer. Compliance: a system that ships EU data to the wrong region, can't be audited, or ignores retention is *illegal* regardless of answer quality, and raw audit logs can themselves leak. The senior framing: an LLM app leaks at its boundaries (input, context, output-to-user, output-to-tools), so you must redact PII in and out, block exfiltration with input/output guardrails that also gate tool calls, scope agents to least privilege, and satisfy residency/audit/retention — because in production, safety and legality are part of correctness.",
    trap: "Equating 'answers correctly' with 'safe to ship.' A correct answer can still leak PII, exfiltrate secrets, carry a catastrophic blast radius, or violate compliance — correctness is one axis, not the whole bar.",
  },
];
