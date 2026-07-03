// Production-gym TONE PASS — patient MSL voice, same facts. Spread LAST into foundationsRunnerData.js (overrides).
export const RUNNER_PRODUCTION_TONE = {
  "cost-latency-concepts": {
    depthTier: "standard",
    interviewWeight: "high",
    scenario: "You open the monthly inference invoice expecting the usual $8K, and instead it reads $34K. Nothing shipped that should have done this — no new feature, no model swap, no traffic spike worth panicking over. Request volume is up a modest 20%. Average output length hasn't moved at all. The only number that changed is average input tokens per request, which crept from 800 up to 3,200. Before you can propose a single fix, someone in the room is going to ask the obvious question: why did a 4× jump in *input* tokens — the tokens that are supposed to be the cheap ones — nearly quadruple the bill? Let's answer that properly.",
    explanation: [
      "You already know from KV cache that token count is what drives inference memory. Here's the thing to sit with: the *same* token count drives cost too, just through a different door. LLM billing has two meters running at once. Input tokens tick over at one rate — typically **$2.50–5.00 per million**. Output tokens tick over at a much steeper rate — typically **$10–15 per million**. So the naive reading is 'output is the expensive one, watch the output.' And that reading is exactly what will mislead you here.\n\n==The rate per token and the share of the bill are two different things, and in a long-prompt application they point in opposite directions.==",
      "Let me show you why, because the arithmetic is more persuasive than any slogan. Take one request the old way: 800 input tokens at $2.50/1M is $0.0020, plus 150 output tokens at $10/1M is $0.0015. Total $0.0035. Now run the same request after the input grew: 3,200 input tokens at $2.50/1M is $0.0080, plus the *unchanged* 150 output tokens at $0.0015. Total $0.0095.\n\nNotice what happened. The expensive-per-token output line never moved — it's still $0.0015 on both invoices. The cheap-per-token input line quadrupled, from $0.0020 to $0.0080, and *that* is what dragged the per-request cost up 2.7×. Layer the 20% volume growth on top of that 2.7×, and you land right at the ~4× bill you're staring at. ==The cheap tokens drove the whole thing, precisely because there were so many more of them.==",
      { type: "illustration", label: "Cost per request — old vs. new", content: `Cost per request breakdown:
                    OLD (800 input)       NEW (3,200 input)
  Input cost:       $0.0020               $0.0080   (+4×)
  Output cost:      $0.0015               $0.0015   (unchanged)
  ─────────────────────────────────────────────────────────
  Total:            $0.0035               $0.0095   (+2.7× per request)

  Volume growth:    +20%
  Monthly bill:     $8K  →  $34K          (~4.25×)

Input is only $2.50/1M vs $10/1M for output — yet input owns the bill,
because a long-prompt app carries 10–50× more input tokens than output tokens.
Per-token price is not per-request share.` },
      "Now hold cost in one hand and pick up latency in the other, because they do *not* have the same shape and interviewers love catching people who assume they do. The equation is **total latency = TTFT + (output_tokens × TPOT)**. **TTFT** is Time To First Token — the wait before anything appears — and it scales with how long your input is and how backed-up the queue is. **TPOT** is Time Per Output Token — the steady drip of generation — and at a fixed model size it's roughly constant per token.\n\nSo trace the 3,200-token request through it. The output didn't change, so the `output_tokens × TPOT` term didn't change — generation takes the same wall-clock time it always did. But TTFT climbed roughly in proportion to the input, call it ~4× higher than at 800 tokens on the same hardware. ==Input growth is quiet on the generation clock and loud on the first-token clock.==",
      "Here's the part that catches people in a streaming UI. Because generation time is unchanged, a glance at total latency might say 'we're fine.' But users don't feel total latency — they feel TTFT, the beat before the first token lands. A bigger prompt makes that opening pause longer, so the product feels sluggish to a real person even when your dashboard's end-to-end number barely twitched. Cost got worse *and* perceived responsiveness got worse, both from the same input inflation, and one of them is invisible on the metric most teams watch.",
      "So where does prompt inflation actually come from? This is the audit, and it's almost always one of four culprits. **The system prompt** — did a product change quietly bolt on more instructions or context? **Few-shot examples** — did someone add demonstrations to nudge quality? **Retrieved context** — did the RAG pipeline start returning more chunks, or longer ones? **Conversation history** — are you replaying every prior turn, letting the prompt grow without any ceiling? At the 4× scale you're seeing, the smart money is on retrieved context or unbounded history. You have to name the guilty component *first*, because the fix depends entirely on which one it is.",
      "And once you've named it, work the fixes in order of leverage. **Prompt caching** comes first — a stable system-prompt prefix can be cached for a **50–90% discount** on those repeated tokens, and it costs you almost nothing to turn on. **Prompt compression** comes next — run retrieved context through a reranker and trim the low-information tokens before they ever hit the model. **Right-sizing the model** comes last — hand the sub-tasks that don't need flagship capability to a smaller, cheaper model. ==Cheapest, least-invasive lever first; model surgery only when the token diet isn't enough.==",
    ],
    keyPoints: [
      "**Two billing meters run at once:** input (~$2.50–5.00/1M) and output (~$10–15/1M). Output costs more *per token*, but that is not the same as owning more of the *bill*.",
      "**In long-prompt, short-output apps, input dominates total cost** — there are simply 10–50× more input tokens. The scenario's 4× input growth drove a 2.7× per-request cost while the pricier output line never moved.",
      "**Latency has a different shape than cost:** total = TTFT + (output × TPOT). Input growth inflates TTFT (first-token wait) but leaves generation time untouched.",
      "**Streaming UIs are felt through TTFT, not total latency** — bigger prompts make the product feel slow even when your end-to-end number looks stable.",
      "**Prompt inflation has four usual suspects:** system prompt, few-shot examples, retrieved context, conversation history. Identify which one grew before proposing any fix.",
      "**Fix hierarchy, cheapest first:** prompt caching (50–90% off stable prefixes) → prompt compression (rerank + trim context) → right-size the model for sub-tasks.",
    ],
    recap: [
      "**Per-token price ≠ per-request share.** Input is cheaper per token yet dominates the bill in long-prompt apps because there's so much more of it.",
      "**The scenario's math:** 800→3,200 input tokens = 4× input cost = 2.7× per-request cost; +20% volume ⇒ ~4× bill. Output was never the problem.",
      "**Cost and latency diverge:** cost tracks token *counts* at two rates; latency = TTFT + (output × TPOT). Input growth hits cost and TTFT, not generation time.",
      "**Users feel TTFT.** A longer prompt lengthens the first-token wait, so streaming products feel slower even when total latency looks flat.",
      "**Audit before you fix:** find which of the four prompt components grew, then apply caching → compression → right-sizing in that order.",
    ],
    mcqs: [
      {
        question: "A request costs $0.008 in input tokens and $0.0015 in output tokens. Cutting output length by 50% would reduce total cost by approximately:",
        options: [
          "50% — output is exactly half of total cost in all LLM pricing models",
          "Nothing — output tokens are billed separately and don't affect the input-side total",
          "~40% — output tokens are always priced higher than input tokens so they dominate cost reduction",
          "~8% — output tokens are $0.0015 of a $0.0095 total; halving them saves $0.00075, roughly 8% of the total",
        ],
        correct: 3,
        explanation: "Input tokens ($0.008) dwarf output tokens ($0.0015) in this breakdown, so halving output saves only $0.00075 on a $0.0095 total — about 8%. Option D is correct. The trap is assuming that because output has a higher per-token rate it must dominate the bill; it only dominates when output is long relative to input, which is not the case in a prompt-heavy, short-output app. Option A is wrong: output being 'exactly half' holds only under a specific token/pricing ratio, and here the math plainly shows it is far less than half. Option B is wrong: output tokens are billed alongside input and do contribute real cost — halving them saves a genuine (if small) amount. Option C is wrong: whether input or output dominates depends on the prompt-to-output ratio; in long-prompt RAG-style workloads input wins even though output costs more per token.",
      },
      {
        question: "TTFT for the 3,200-token input is roughly 4× higher than at 800 tokens, while generation time is unchanged. In a streaming UI, what is the production consequence of this input growth even though total generation time is similar?",
        options: [
          "Total dollar cost per request stays the same because only output tokens are billed during streaming",
          "Latency becomes irrelevant because streaming hides all delays regardless of input length",
          "The output token count automatically grows in proportion to the input, increasing generation time",
          "Users perceive slower responsiveness directly from the higher TTFT, because TTFT is the wait before the first token appears in a streaming UI",
        ],
        correct: 3,
        explanation: "Option D is correct: TTFT scales with input length, and in a streaming UI users feel the first-token wait directly, so a bigger prompt feels slower even when end-to-end generation time is unchanged. Option A is wrong: both input and output are billed, and here input growth raised per-request cost — cost did not stay flat. Option C is wrong: the scenario holds output length constant, so input growth does not increase generation time. Option B is wrong: streaming improves perceived latency but does not erase it — TTFT still grows with input and is exactly what the user experiences before the first token.",
      },
      {
        question: "After identifying that retrieved context grew, which mitigation should be applied FIRST in the cost-reduction hierarchy?",
        options: [
          "Right-size the model by switching sub-tasks to a smaller model",
          "Prompt compression using a reranker to trim low-information tokens",
          "Prompt caching, which gives 50–90% discounts on stable system-prompt prefix tokens",
          "Increasing output length limits to reduce the number of follow-up requests",
        ],
        correct: 2,
        explanation: "Option C is correct: the hierarchy runs cheapest-and-least-invasive first — prompt caching (50–90% off stable prefix tokens), then prompt compression, then right-sizing the model. Option A is wrong: right-sizing is the last resort, not the first move. Option B is wrong: compression is the second step, applied after caching. Option D is wrong: raising output limits is not part of the hierarchy at all, and longer output would *increase* cost since output tokens are the pricier per-token component.",
      },
    ],
    takeaway: "In long-prompt, short-output apps, input tokens dominate the bill even though they cost less per token — because there are far more of them. Cost and latency diverge: input growth inflates both the bill and TTFT (the first-token wait users actually feel) while leaving generation time untouched. So audit which prompt component grew, then apply prompt caching → compression → right-sizing in that order.",
  },

  "observability-concepts": {
    depthTier: "standard",
    interviewWeight: "medium",
    scenario: "Your RAG pipeline for B2B analytics has been humming along for three months. Then customer success forwards a note: answers 'seem worse' over the last couple of weeks. You check the obvious things first. No code deployed. Error rate is flat at 0.1%. Request volume is steady. Every dashboard you own is green. And yet the customers are right — something has quietly gotten worse, and none of your monitoring caught it. Your job now is two-fold: design the minimal observability stack that *would* have caught this automatically, and be ready to explain why the metric everyone trusts — error rate — is the wrong one to lead with for an LLM system.",
    explanation: [
      "Start with why the green dashboards lied to you. From the eval loop you know how to catch *known* failure modes — score against a fixed dataset and watch for regressions. But that leaves two gaps. Between eval runs you're flying blind, and evals only ever catch the failures you thought to write a test for.\n\nNow picture the actual failure here. The model returns an HTTP 200. The answer is fluent, confident, well-formatted — and completely wrong. To your error-rate monitor, that response is *indistinguishable* from a perfect one. ==Error rate measures whether the request failed. It says nothing about whether the answer was true.== That is the whole trap: a status code is cheap to check and a correct answer is not, because judging correctness needs a human or a model, not an HTTP status.",
      "So sit with the uncomfortable implication before we fix it: **zero errors and normal latency can still mean a system that is confidently, silently wrong.** Nothing crashed. Nothing timed out. The pipeline did exactly what it was told and returned junk with a straight face. This is why 'is it up?' and 'is it correct?' are different questions for LLM systems in a way they never were for a traditional CRUD service — and why leaning on error rate as your primary quality signal will let a regression run for weeks behind a wall of green.",
      "Given that no code changed, what could have shifted underneath you? There's a short list of usual causes. **Silent model version update** — providers refresh weights behind a stable endpoint name, often with no announcement, so 'the same API' quietly became a different model. **Data drift** — your indexed documents went stale; products, policies, or facts changed but the vector index was never re-embedded. **Traffic distribution shift** — a new cohort arrived asking questions unlike anything the system was tuned for. **Third-party dependency drift** — an embedding API or reranker changed its behavior beneath you. Good observability doesn't just tell you quality dropped; it tells you *which* of these four is responsible.",
      "Here are the signals that actually earn their place. **Retrieval-quality indicators:** the distribution of retrieval scores, and the share of queries whose top-k chunk even contains a keyword from the question — when retrieval starts missing, this moves first. **Answer-quality proxies:** answer-length distribution, response-format compliance, citation completeness — cheap structural tells that something shifted. **Downstream behavior:** thumbs-up/down rate, follow-up-question rate, session abandonment right after a response — your users voting with their clicks. And plainly, **the model version pulled straight from the API response headers**, so a silent swap can't hide from you.",
      { type: "illustration", label: "Minimum viable observability stack", content: `LOG on every request:
  input tokens · output tokens · retrieval scores · model name (from headers) · latency

SAMPLE:
  ~5% of responses → lightweight LLM-as-judge quality score

ALERT when:
  answer-length distribution Z-score          > 2
  retrieval-score mean shift                  > 10%
  user-feedback (👍) rate, week-over-week      drops > 10%
  model version in API headers                ≠ expected

Result: the 2-week silent regression surfaces as a retrieval-score shift or
answer-length change within HOURS — not after weeks of support tickets.` },
      "Notice what this stack buys you. The regression that took two weeks and a customer complaint to surface would instead have tripped an alert within hours — most likely a retrieval-score mean shift (pointing at data drift) or a model-version header mismatch (pointing at a silent update). You'd walk in already knowing *which* of the four causes to chase. ==The lesson to carry out of this: silence from your error monitor is not evidence that quality is healthy — it's just evidence that nothing crashed. Instrument quality directly, or you'll keep learning about regressions from your customers.==",
    ],
    keyPoints: [
      "**Error rate is the wrong primary metric for LLM quality.** A confident, fluent, completely wrong answer returns HTTP 200 and looks identical to a correct one. Error rate measures *failure*, not *truth*.",
      "**Zero errors + normal latency ≠ correct.** LLM systems degrade silently — nothing crashes — so quality must be instrumented directly, not inferred from uptime.",
      "**Four common causes of no-code-change regression:** silent model version update, data drift (stale index), traffic distribution shift, third-party dependency drift. Observability tells you *which*.",
      "**Signals worth logging:** retrieval-score distribution, top-k keyword-match rate, answer-length distribution, format/citation compliance, user feedback, and the model version from API headers.",
      "**Minimum viable stack:** log tokens + retrieval scores + model header + latency on every request; sample ~5% for LLM-as-judge scoring; alert on distribution shifts and header mismatches.",
      "**Silence from error monitoring is not proof of health.** Instrument quality directly, and a silent regression surfaces in hours instead of weeks.",
    ],
    recap: [
      "**Green dashboards can lie:** HTTP 200 + fluent + wrong is invisible to error-rate monitoring, which only knows whether the request failed.",
      "**The uncomfortable truth:** zero errors and normal latency can still mean confidently, silently wrong answers.",
      "**Four suspects when nothing shipped:** silent model swap, stale index (data drift), new query cohort, third-party drift — observability isolates which.",
      "**Log the right things:** retrieval scores, answer-length + format compliance, user feedback signals, and the model version from response headers.",
      "**MVP stack:** per-request logs + ~5% LLM-as-judge sampling + alerts on distribution shifts ⇒ hours-to-detect, not weeks.",
    ],
    mcqs: [
      {
        question: "A RAG pipeline's error rate stays flat at 0.1% while answer quality degrades. Which metric would most reliably detect this regression automatically?",
        options: [
          "Total token count per request — more tokens always corresponds to better answer quality",
          "Retrieval score distribution shift — a change in the mean or variance of embedding similarity scores for retrieved chunks is a direct signal that retrieval quality changed, even when the system returns responses without errors",
          "API response latency — quality degradation consistently increases response generation time",
          "System prompt token count — drift in system prompt length is the primary indicator of quality regression",
        ],
        correct: 1,
        explanation: "Option B is correct: retrieval-score distributions move when the quality of what's retrieved changes, so a drop in mean similarity or a shift toward lower-scoring matches predicts worse answers directly — even though the system never errors. Option A is wrong: token count has no meaningful tie to answer quality, and longer prompts can even hurt via lost-in-the-middle effects. Option C is wrong: latency tracks output length and model size, not correctness — a confidently wrong answer takes the same time as a right one. Option D is wrong: system-prompt length is nearly fixed per request and would reflect a code change, not an operational quality regression.",
      },
      {
        question: "Why is error rate the wrong primary metric for LLM systems?",
        options: [
          "An HTTP 200 response carrying a confident, grammatically correct, but completely wrong answer is indistinguishable from a correct answer to error-rate monitoring, because error rate measures failures, not quality",
          "Error rate is measured too infrequently to catch fast regressions",
          "Error rate cannot be logged without sampling 5% of responses for LLM-as-judge scoring",
          "Error rate only captures retrieval failures and ignores generation failures",
        ],
        correct: 0,
        explanation: "Option A is correct: a 200-status response that is fluent, confident, and wrong looks identical to a correct one from the error-rate view, because error rate reflects status codes while quality needs human or model judgment. Option B is wrong: the issue isn't measurement frequency but that error rate measures the wrong thing entirely. Option C is wrong: error rate comes from request status and needs no LLM-as-judge sampling — that sampling is a separate quality signal you add on top. Option D is wrong: error rate misses quality failures that return 200 regardless of whether they originate in retrieval or generation; it isn't limited to one stage.",
      },
      {
        question: "A team confirms the inference provider's model version, read from API response headers, now differs from the version they expected. Which listed root cause does this match?",
        options: [
          "Traffic distribution shift from a new user cohort",
          "Data drift from a stale vector index",
          "Silent model version update, where providers update weights behind a stable API endpoint name without announcements",
          "Third-party embedding API changing its behavior",
        ],
        correct: 2,
        explanation: "Option C is correct: a changed model-version header is the exact fingerprint of a silent model update — providers refresh weights behind a stable endpoint name without telling you, which is why logging the version from response headers catches it. Option A is wrong: a traffic shift is about new query patterns and wouldn't change the model-version header. Option B is wrong: data drift comes from a stale index and shows up in retrieval-score shifts, not a version header. Option D is wrong: an embedding-API change is a separate dependency-drift cause; the header here belongs to the generation model, not the embedding service.",
      },
    ],
    takeaway: "LLM systems degrade silently: zero errors and normal latency can still mean confidently wrong answers, because error rate measures failure, not truth. Instrument quality directly — log retrieval scores, answer-length distributions, and model-version headers, and sample responses for lightweight judge scoring — and a silent regression surfaces in hours instead of weeks of support tickets.",
  },

  "latency-planner": {
    depthTier: "standard",
    interviewWeight: "high",
    scenario: "You own a document Q&A tool with a hard promise: respond in under 3 seconds. The reality on your dashboard is less kind — p50 is 2.8s, p95 is 5.4s, p99 is 8.2s. Retrieval accounts for about 300ms of that; the LLM call is the rest. The target handed to you is p95 ≤ 3s. Before you touch a single knob, you want to know exactly which levers exist and, more importantly, what each one actually moves — because tuning the wrong one is how a week disappears with the p95 unchanged.",
    explanation: [
      "Carry over the equation from cost-and-latency: **total latency = TTFT + (output_tokens × TPOT)**. Now let the measurements make it concrete. At the median, p50 is 2.8s and retrieval eats 300ms, so the LLM contributes ~2.5s. At p95, total is 5.4s and retrieval is still ~300ms, so the LLM contributes ~5.1s — *more than double* its own median.\n\nThat doubling is the whole diagnostic, so linger on it. If longer generation were the culprit, p95 would rise only as much as output length rises at the tail — and output doesn't magically double for the 95th-percentile user. ==When the LLM's own latency more than doubles but output length doesn't, the extra time isn't generation — it's queuing and throttling on shared infrastructure.==",
      "Now the levers, ordered by how much they typically move the needle. **First, reduce output length** — and check this *before* anything fancier, because it's the one people skip. If your model writes 300-word essays where an 80-word answer would do, an explicit concision instruction roughly halves the `output_tokens × TPOT` term with zero model change. Pull `TPOT × token_count` from your inference logs and look; it's the most commonly overlooked win sitting in plain sight.",
      "**Second, streaming** — and here's the reframe that changes everything. A 5.4s response that *starts* rendering in 400ms doesn't feel like a 5.4s wait; it feels like a responsive tool that's actively working. The wall-clock latency is identical. What changed is that TTFT — not total time — became the number the user experiences. ==Streaming is almost always the highest-leverage improvement to *perceived* latency you can make without touching the model.==",
      "**Third, reduce input length.** Fewer prompt tokens means a lower TTFT. Trim the system prompt, cut retrieved context from 10 chunks down to 3, and cache the stable system-prompt prefix so you're not re-paying for it every call. **Fourth, reach for a smaller or faster model.** A model that's 3× cheaper is often 2–3× faster on the same hardware tier, and document Q&A rarely needs frontier-level capability — this is a lever you can pull with a clear conscience once the cheaper ones are exhausted.",
      { type: "illustration", label: "Where the latency budget goes — and which lever touches it", content: `p50 = 2.8s → LLM ~2.5s   (retrieval ~0.3s)
p95 = 5.4s → LLM ~5.1s   ← >2× the median LLM time, output NOT doubled
p99 = 8.2s → LLM ~7.9s   ← another 2.8s jump beyond p95

DIAGNOSIS
  p50→p95 gap : shared-infra queuing / throttling   (not generation time)
  p95→p99 gap : infra EVENTS — cold starts, queue spikes, rate throttling

LEVERS (by leverage)
  1. shorter output      → cuts (output × TPOT)     app-layer, free
  2. streaming           → TTFT becomes felt time   app-layer, huge on perceived
  3. shorter input       → lowers TTFT              app-layer
  4. smaller/faster model→ lowers TPOT & TTFT       swap, mild capability cost

  p99 (8.2s)             → provisioned throughput endpoint  (infra change only)` },
      "Finally, treat p99 as a *different animal* from p95. The 3.3s gap between p95 (5.4s) and p99 (8.2s) is not longer generation and not bigger prompts — it's infrastructure events: cold starts on serverless endpoints, shared-resource queue spikes, token-rate throttling. No amount of application-layer cleverness reaches these. The mitigations live one layer down: provision a **dedicated throughput endpoint** so you're not sharing a public queue; set a **timeout-plus-retry** that falls back to a smaller model past 4s (3s beats 8s for Q&A every time); or push the slowest requests to **async with a callback** so they leave the perceived-latency bucket entirely. ==Getting p95 to ≤3s is a streaming-plus-shorter-output job; getting p99 down is a serving-infrastructure job. Don't confuse the two.==",
    ],
    keyPoints: [
      "**Decompose the budget first:** total = retrieval + TTFT + (output × TPOT). Subtracting the ~300ms retrieval shows the LLM owns ~2.5s at p50 and ~5.1s at p95.",
      "**A >2× jump in LLM latency with unchanged output length = queuing/throttling, not generation.** That's the diagnostic that tells you where the time actually went.",
      "**Cheapest lever first — output length.** A concision instruction roughly halves the (output × TPOT) term with no model change; it's the most overlooked win.",
      "**Streaming attacks *perceived* latency:** a 5.4s response that starts in 400ms feels fast because the user experiences TTFT, not wall-clock total. Highest-leverage UX fix without a model swap.",
      "**Then shorter input (lowers TTFT) and a smaller/faster model (2–3× faster, mild capability cost)** — Q&A rarely needs a frontier model.",
      "**p99 is a different failure mode:** cold starts, queue spikes, and throttling are infra events no app-layer change fixes. Use provisioned throughput, timeout-plus-retry, or async callbacks.",
    ],
    recap: [
      "**Split the budget:** retrieval ~300ms; LLM contributes ~2.5s at p50 and ~5.1s at p95 — more than double its own median.",
      "**Read the tail:** LLM latency doubling while output length doesn't ⇒ shared-infra queuing/throttling, not longer generation.",
      "**Lever order:** shorter output → streaming → shorter input → smaller/faster model. First three are app-layer; the last is a swap.",
      "**Streaming ≠ faster wall clock; it's faster *felt* time.** TTFT is what the user experiences, so start rendering early.",
      "**p95 vs p99 are different jobs:** p95≤3s comes from streaming + shorter output; p99 needs a serving-infra change (provisioned throughput, retry-with-fallback, async).",
    ],
    mcqs: [
      {
        question: "A streaming document Q&A tool has p95 total latency of 5.4s, but users report the tool feels fast. The most likely reason is:",
        options: [
          "Streaming delivers the first tokens within ~400ms — users see content immediately and experience the remainder as progressive loading, so perceived latency is driven by TTFT, not total generation time",
          "P95 measurements are always lower than actual latency because they exclude network overhead",
          "The model uses speculative decoding, which generates multiple output tokens per forward pass and reduces wall-clock time",
          "The UI hides total latency by showing a fixed 2-second progress animation before rendering",
        ],
        correct: 0,
        explanation: "Option A is correct: in a streaming UI the felt latency is TTFT — the wait before the first character — so a tool that starts streaming in 400ms and finishes at 5.4s feels faster than a non-streaming tool that returns everything at 3.0s. Option B is wrong: p95 doesn't systematically exclude network overhead, and being 'lower than actual' isn't a property of the percentile. Option C is wrong: speculative decoding cuts generation time but isn't what makes the tool 'feel fast' here — the early stream start is. Option D is wrong: a fixed 2s animation would delay first content and make the tool feel slower, not faster.",
      },
      {
        question: "The p95-to-p99 gap (5.4s to 8.2s) is treated as a different failure mode than the p50-to-p95 gap. What does the 3.3-second p95-to-p99 gap indicate, and what follows for fixing it?",
        options: [
          "Longer output generation at the 99th percentile, fixable by reducing output length",
          "Same-family judge bias inflating the latency measurements",
          "Higher input token counts at p99, fixable by trimming the system prompt",
          "Infrastructure events such as cold starts and shared-queue spikes, which application-layer optimizations cannot fix and which require a serving infrastructure change",
        ],
        correct: 3,
        explanation: "Option D is correct: the p95→p99 gap comes from infrastructure events (cold starts, shared-resource queuing, throttling), which no app-layer change reaches — it needs a serving-infra change such as a provisioned throughput endpoint. Option A is wrong: output length doesn't double at the tail, so generation-time variance isn't the driver. Option C is wrong: input growth affects TTFT broadly, but the specific tail spike is attributed to infra events, not per-request prompt size. Option B is wrong: same-family judge bias is an evaluation concept and has nothing to do with latency percentiles.",
      },
      {
        question: "Output-length reduction is recommended first among the latency levers, and called 'the most commonly overlooked optimization.' Why?",
        options: [
          "Generation time equals output_tokens × TPOT, so if a model emits 300-word answers when 80 words suffice, a concision instruction roughly halves generation time with no model change",
          "Reducing output length requires upgrading to a faster model, which teams avoid due to cost",
          "Output length only affects cost, not latency, so teams correctly ignore it for latency tuning",
          "Shorter outputs increase TTFT, which teams mistakenly believe improves responsiveness",
        ],
        correct: 0,
        explanation: "Option A is correct: generation time is output_tokens × TPOT, so trimming verbose 300-word answers to 80 words via a concision instruction roughly halves that term with no model change — high leverage, yet easy to overlook. Option B is wrong: shortening output is a prompt instruction, not a model upgrade. Option C is wrong: output length affects latency directly through the generation term — ignoring it for latency tuning is exactly the mistake being warned against. Option D is wrong: shorter outputs reduce generation time and don't raise TTFT, which is driven by input length and queuing.",
      },
    ],
    takeaway: "Decompose the budget (retrieval + TTFT + output×TPOT) before tuning, and read the tail: an LLM-latency jump without an output-length jump means queuing, not generation. Optimize perceived latency first — streaming makes a 5.4s response feel fast by exposing TTFT instead of wall-clock time — then cut output and input length before swapping models. And keep p95 and p99 separate: p95≤3s is an app-layer job; p99 requires a serving-infrastructure change no application tweak can deliver.",
  },
};
