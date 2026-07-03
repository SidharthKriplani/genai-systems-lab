import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
//  The Call — a judgment exam for GenAI production operators.
//  Scores HOW you reason under pressure across 5 lanes:
//    Incident triage · Cost/latency tradeoff · Ship / no-ship ·
//    Safety escalation · Build-vs-buy.
//  Self-contained. Only dependency is React.
// ═══════════════════════════════════════════════════════════════════════════

// ── lanes ───────────────────────────────────────────────────────────────────
const LANES = {
  triage: { label: "Incident triage", accent: "#f97316" },
  cost: { label: "Cost / latency tradeoff", accent: "#22d3ee" },
  ship: { label: "Ship / no-ship", accent: "#a78bfa" },
  safety: { label: "Safety escalation", accent: "#ef4444" },
  bvb: { label: "Build vs buy", accent: "#34d399" },
};

// ── rubric axes (each scenario scores 0..2 on each) ──────────────────────────
const AXES = [
  { key: "decision", label: "Decision quality" },
  { key: "reasoning", label: "Reasoning validity" },
  { key: "risk", label: "Risk awareness" },
  { key: "cost", label: "Cost / impact framing" },
  { key: "trap", label: "Trap caught" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  SCENARIOS — 8, spread across the 5 lanes.
//  call.options: [{ id, text, best }]  — exactly one best.
//  justify.options: [{ id, text, valid }] — multi-select; valid ones support call.
//  trap.options: [{ id, text, isTrap }] — single-select; one is the seductive-wrong.
// ═══════════════════════════════════════════════════════════════════════════
const SCENARIOS = [
  // ───────────────────────────── 1 · TRIAGE ─────────────────────────────────
  {
    id: "rag-p95-spike",
    lane: "triage",
    title: "RAG p95 latency triples during a launch demo window",
    brief:
      "It's 09:52. A regional sales team demos your RAG assistant to a Fortune-100 prospect at 10:00. The p95 latency dashboard shows retrieval latency flat at 180ms, but end-to-end p95 jumped 2.1s → 6.4s in the last 20 minutes. p50 barely moved. A Slack thread from the on-call: \"LLM provider status page is all green, error rate is 0.2%, nothing in our logs looks off.\" A second engineer adds: \"traffic is only up ~8%, this isn't load.\" The prospect demo cannot slip.",
    call: {
      prompt: "It's 09:53. What's your first move?",
      options: [
        { id: "a", text: "Fail the demo traffic over to a smaller, faster model on a separate deployment and flag it degraded-mode for the demo team", best: true },
        { id: "b", text: "Restart the retrieval service — retrieval is the RAG bottleneck", best: false },
        { id: "c", text: "Open a P1, page the whole team, and start a root-cause bridge", best: false },
        { id: "d", text: "Do nothing yet — error rate is 0.2% and the provider is green, so it's probably transient", best: false },
      ],
    },
    justify: {
      prompt: "Which reasons actually support that call? Select all that apply.",
      options: [
        { id: "a", text: "p50 flat + p95 spike points at a tail problem (a slow subset of requests), and a faster model on a clean path sidesteps the tail for the demo", valid: true },
        { id: "b", text: "Protecting the time-boxed, high-stakes demo is the immediate objective; RCA can run in parallel without blocking mitigation", valid: true },
        { id: "c", text: "Retrieval is flat at 180ms, so the added latency is downstream of retrieval — restarting retrieval targets the wrong layer", valid: true },
        { id: "d", text: "Because error rate is low, latency doesn't matter for this incident", valid: false },
        { id: "e", text: "A full P1 bridge is the fastest path to a fix before 10:00", valid: false },
      ],
    },
    trap: {
      prompt: "Which option is the seductive-but-wrong call a mid-level operator reaches for?",
      options: [
        { id: "a", text: "Fail over to a faster model in degraded mode", isTrap: false },
        { id: "b", text: "Restart the retrieval service", isTrap: true, why: "Retrieval is the classic RAG bottleneck, so it feels right — but the dashboard already shows retrieval flat at 180ms. The tail lives downstream (provider tail / token-length / prompt-assembly). Restarting retrieval burns your only pre-demo minutes on the one layer the data exonerates." },
        { id: "c", text: "Open a P1 and page everyone", isTrap: false },
        { id: "d", text: "Wait it out", isTrap: false },
      ],
    },
    model: {
      verdict: "Mitigate the user-visible symptom first, diagnose second.",
      body: "A flat p50 with a blown p95 is a tail-latency signature: most requests are fine, a slow subset is dragging the tail. With retrieval flat and the provider green, the added seconds are downstream of retrieval — provider-side tail, long-context token growth, or a slow prompt-assembly path. The right first move buys the demo a fast, clean path (degraded-mode fallback model) while RCA runs in parallel. Restarting retrieval is the trap: intuitive, but the data already clears retrieval.",
      revisit: "Revisit: reading p50-vs-p95 to distinguish tail problems from broad regressions.",
    },
  },

  // ───────────────────────────── 2 · TRIAGE ─────────────────────────────────
  {
    id: "hallucination-report",
    lane: "triage",
    title: "A single loud customer reports the assistant 'making things up'",
    brief:
      "A key enterprise admin emails your CS lead: \"Your assistant invented a refund policy that doesn't exist and my agent quoted it to a customer.\" CS escalates as SEV-2. Your eval dashboard shows groundedness at 94% (unchanged for 3 weeks) and no deploy in 6 days. You have the exact conversation transcript. The account is up for renewal in two weeks and the admin is CC'ing their VP.",
    call: {
      prompt: "How do you triage this?",
      options: [
        { id: "a", text: "Reproduce from the transcript first — pin down whether it's a real grounding failure, a retrieval miss, or a stale document in the index — before committing to a fix or a promise", best: true },
        { id: "b", text: "Roll back to last week's model immediately to be safe; the customer is renewing", best: false },
        { id: "c", text: "Push a system-prompt patch telling the model to never state policies, then reply that it's fixed", best: false },
        { id: "d", text: "Reassure the customer that groundedness is 94% and this is within expected error", best: false },
      ],
    },
    justify: {
      prompt: "Which reasons support reproducing first? Select all that apply.",
      options: [
        { id: "a", text: "No deploy in 6 days + flat groundedness means the model didn't change — the likely cause is data (stale/wrong doc in the index) or a retrieval miss, which a rollback wouldn't fix", valid: true },
        { id: "b", text: "You have the exact transcript, so reproduction is cheap and will tell you which layer failed", valid: true },
        { id: "c", text: "Committing to a fix before you know the mechanism risks a false promise to a renewing account — worse than a short, honest delay", valid: true },
        { id: "d", text: "94% groundedness proves this specific case is acceptable", valid: false },
        { id: "e", text: "Rolling back the model is the safest universal response to any hallucination report", valid: false },
      ],
    },
    trap: {
      prompt: "Which is the seductive-but-wrong move?",
      options: [
        { id: "a", text: "Reproduce from the transcript first", isTrap: false },
        { id: "b", text: "Roll back the model immediately", isTrap: true, why: "Rollback feels decisive and safe for a renewing account. But nothing changed in the model for 6 days and groundedness is flat — a rollback treats a data/retrieval problem as a model problem, so it won't fix it, costs you a deploy, and buys a false 'we fixed it' you'll have to retract." },
        { id: "c", text: "Push a prompt patch and declare it fixed", isTrap: false },
        { id: "d", text: "Quote the 94% number at the customer", isTrap: false },
      ],
    },
    model: {
      verdict: "Reproduce and localise the layer before you promise or patch.",
      body: "The strongest signal here is what didn't change: no deploy, flat groundedness. That points away from the model and toward the index (a stale or wrong policy doc) or a retrieval miss surfacing the wrong chunk. With the transcript in hand, reproduction is nearly free and tells you exactly which layer to fix. Rolling back the model is the trap — it's the reflex for 'hallucination,' but it targets the one component the evidence says is stable, and it hands a renewing customer a fix that isn't one.",
      revisit: "Revisit: separating model regressions from data/retrieval failures using deploy + eval history.",
    },
  },

  // ────────────────────────────── 3 · COST ──────────────────────────────────
  {
    id: "agent-loop-blowup",
    lane: "cost",
    title: "An agent loop quietly 6x's your token spend overnight",
    brief:
      "Finance pings you: yesterday's inference bill was 6x the trailing average, all on one agentic workflow you shipped Tuesday. Traces show a subset of runs hitting the max-iterations cap (25 tool calls) before returning — each retry re-sends the full growing scratchpad. Success rate on the workflow is unchanged at 88%. A PM in the thread: \"users seem happy, can we just eat the cost until next sprint?\" The workflow drives ~4% of revenue-linked actions.",
    call: {
      prompt: "What's the right move?",
      options: [
        { id: "a", text: "Ship a same-day cap: lower max-iterations, truncate/summarise the scratchpad between steps, and add a cost-per-run circuit breaker — then diagnose why runs are looping", best: true },
        { id: "b", text: "Eat the cost until next sprint — success rate is fine and users are happy", best: false },
        { id: "c", text: "Swap the whole workflow to the cheapest available model to cut per-token cost", best: false },
        { id: "d", text: "Turn the workflow off entirely until it's rewritten", best: false },
      ],
    },
    justify: {
      prompt: "Which reasons support the same-day cap? Select all that apply.",
      options: [
        { id: "a", text: "The cost is driven by unbounded iteration re-sending a growing scratchpad — capping iterations and truncating context attacks the actual cost driver, not the symptom", valid: true },
        { id: "b", text: "A per-run cost circuit breaker bounds worst-case spend immediately, converting an open-ended bill into a known ceiling", valid: true },
        { id: "c", text: "88% success is an average — the looping subset may be failing expensively even if the aggregate looks fine, so 'users are happy' doesn't clear it", valid: true },
        { id: "d", text: "Cheapest-model swaps always reduce total cost regardless of the failure mode", valid: false },
        { id: "e", text: "4% of revenue-linked actions is small enough that any spend is acceptable", valid: false },
      ],
    },
    trap: {
      prompt: "Which is the seductive-but-wrong move?",
      options: [
        { id: "a", text: "Same-day cap + circuit breaker, then diagnose", isTrap: false },
        { id: "b", text: "Swap to the cheapest model", isTrap: true, why: "It looks like a direct cost lever — cost is per-token, so a cheaper token rate 'obviously' helps. But the blowup is from iteration count × growing context, not per-token price. A weaker model often loops more, so you can raise iteration counts and net higher spend and lower success. It treats a control-flow bug as a pricing problem." },
        { id: "c", text: "Eat the cost until next sprint", isTrap: false },
        { id: "d", text: "Turn the workflow off", isTrap: false },
      ],
    },
    model: {
      verdict: "Bound the cost driver (iteration × context growth), then diagnose the loop.",
      body: "The trace tells the story: runs hit the 25-call cap, and each step re-sends an ever-larger scratchpad, so cost scales super-linearly with iteration. The fix targets that mechanism — lower the cap, summarise/truncate context between steps, and add a per-run spend circuit breaker so worst case is bounded today. Swapping to the cheapest model is the trap: it reads as the cost lever, but a weaker model tends to loop more, which can raise both spend and failure. And 88% success is an average that hides the expensive looping tail.",
      revisit: "Revisit: reasoning about agentic cost as iterations × context size, not just per-token price.",
    },
  },

  // ────────────────────────────── 4 · COST ──────────────────────────────────
  {
    id: "latency-slo-vs-quality",
    lane: "cost",
    title: "A quality win pushes you past your latency SLO",
    brief:
      "Your team upgraded the summariser to a larger model. Offline eval: +9 points on a human-rated quality rubric — a real, replicated gain. But p95 end-to-end went 1.4s → 3.3s, over your published 2.0s SLO for this surface. The surface is a real-time typing assistant where users abandon fast. A staff PM wants to ship the quality win this week; the SRE lead is blocking on the SLO. Cost per request roughly doubled too.",
    call: {
      prompt: "What do you recommend?",
      options: [
        { id: "a", text: "Don't ship it as-is on this surface; pursue the quality gain within the SLO — smaller/distilled model, streaming, speculative decoding, or scope the big model to a non-latency-critical surface", best: true },
        { id: "b", text: "Ship it — a replicated +9 quality gain outweighs a latency number", best: false },
        { id: "c", text: "Relax the SLO to 3.5s; SLOs are internal targets we set ourselves", best: false },
        { id: "d", text: "Abandon the quality work — the SLO is sacred", best: false },
      ],
    },
    justify: {
      prompt: "Which reasons support not shipping as-is? Select all that apply.",
      options: [
        { id: "a", text: "On a real-time typing surface, latency IS quality — users abandon before they can perceive a better summary, so the offline rubric doesn't capture the online loss", valid: true },
        { id: "b", text: "The SLO was set to protect abandonment; unilaterally relaxing it to fit the model inverts the purpose of the SLO", valid: true },
        { id: "c", text: "The quality gain is real and worth capturing — but the constraint is latency, so the engineering target is 'this quality within 2.0s', not 'ship at any latency'", valid: true },
        { id: "d", text: "Offline quality metrics fully predict online outcomes, so the +9 is decisive", valid: false },
        { id: "e", text: "Doubling cost per request is irrelevant as long as quality improved", valid: false },
      ],
    },
    trap: {
      prompt: "Which is the seductive-but-wrong move?",
      options: [
        { id: "a", text: "Pursue the quality gain within the SLO", isTrap: false },
        { id: "b", text: "Ship it — the +9 quality win outweighs latency", isTrap: true, why: "A replicated, human-rated +9 is the most convincing number in the room, so it feels like it should win. But it's an offline metric on a surface where users abandon before quality is even perceived. Shipping trades a measurable online metric (abandonment) for an offline one that may not survive contact with real latency — the classic 'better model, worse product.'" },
        { id: "c", text: "Relax the SLO to fit the model", isTrap: false },
        { id: "d", text: "Abandon the quality work entirely", isTrap: false },
      ],
    },
    model: {
      verdict: "Capture the quality gain, but subordinate it to the latency constraint on this surface.",
      body: "On a real-time typing assistant, latency is not a side-metric — it's the dominant driver of whether the quality is ever experienced. A +9 offline rubric win can still be a net online loss if p95 blows past the abandonment threshold. So the answer isn't binary: keep the quality target, but treat 2.0s as a hard constraint and get there via distillation, streaming, speculative decoding, or by routing the big model to a surface where latency isn't user-critical. Shipping on the strength of the offline number is the trap; relaxing the SLO to fit the model is the same mistake wearing a different hat.",
      revisit: "Revisit: when offline eval gains fail to transfer online, and treating SLOs as constraints not preferences.",
    },
  },

  // ────────────────────────────── 5 · SHIP ──────────────────────────────────
  {
    id: "eval-passed-thin-set",
    lane: "ship",
    title: "The model passes eval — on a thin, possibly leaked set",
    brief:
      "A new fine-tune is queued to ship. It beats the current model on your offline eval suite by 4 points and passes the release gate. Digging in: the eval set is 120 hand-written examples, unchanged for 8 months, and several near-duplicates appear in the fine-tuning data. There are no adversarial or long-tail cases in the set. The last two 'eval-passing' ships each caused a production quality complaint within days. Leadership wants velocity.",
    call: {
      prompt: "Do you ship?",
      options: [
        { id: "a", text: "Don't ship on this eval alone — the +4 is untrustworthy (small, stale, contaminated set); gate on a fresh held-out slice + a small canary/online read before full rollout", best: true },
        { id: "b", text: "Ship — it passed the release gate and beat the baseline by 4 points", best: false },
        { id: "c", text: "Ship, but add a note in the release doc that the eval set is small", best: false },
        { id: "d", text: "Block all ships indefinitely until a perfect eval suite exists", best: false },
      ],
    },
    justify: {
      prompt: "Which reasons support not shipping on this eval? Select all that apply.",
      options: [
        { id: "a", text: "Near-duplicates between eval and training data means the +4 may be memorisation, not generalisation — the gain could be pure leakage", valid: true },
        { id: "b", text: "120 static examples with no adversarial/long-tail cases can't detect the failure modes that actually cause production complaints", valid: true },
        { id: "c", text: "Two prior 'eval-passing' ships already caused fast quality complaints — the gate has a track record of false greens", valid: true },
        { id: "d", text: "Passing the formal release gate is sufficient evidence of production readiness", valid: false },
        { id: "e", text: "A canary is unnecessary once offline eval improves", valid: false },
      ],
    },
    trap: {
      prompt: "Which is the seductive-but-wrong move?",
      options: [
        { id: "a", text: "Gate on a fresh held-out slice + canary", isTrap: false },
        { id: "b", text: "Ship — it passed the gate and beat baseline by 4", isTrap: true, why: "It's the process-compliant answer: the gate exists, the model cleared it, the number is up. But the gate is contaminated (train/eval overlap) and blind (no long-tail), and it has already green-lit two bad ships. Trusting a green light you have specific reason to distrust is the seduction — 'the process said yes' feels like cover, but the process is the thing that's broken." },
        { id: "c", text: "Ship with a caveat in the doc", isTrap: false },
        { id: "d", text: "Block all ships forever", isTrap: false },
      ],
    },
    model: {
      verdict: "A green eval you have reason to distrust is not a ship signal.",
      body: "Three independent tells undercut the +4: the set is tiny and static, it overlaps the training data (so the lift may be memorisation), and it's blind to the adversarial/long-tail cases that caused the last two production complaints. The fix isn't to freeze shipping or to ship-with-a-caveat; it's to make the gate trustworthy for this decision — a fresh held-out slice to kill the leakage question, plus a small canary/online read so real traffic, not 120 stale examples, makes the call. Shipping on the passing gate is the trap: process compliance is masquerading as evidence.",
      revisit: "Revisit: eval-set contamination, staleness, and coverage — and canarying when offline signal is weak.",
    },
  },

  // ────────────────────────────── 6 · SHIP ──────────────────────────────────
  {
    id: "ship-noship-safety-regression",
    lane: "ship",
    title: "A capability upgrade also lifts your unsafe-output rate",
    brief:
      "A model upgrade improves task success from 79% → 86% — a large, wanted gain. But your safety suite shows unsafe-completion rate rising 0.3% → 0.9% on a red-team set, concentrated in one category (self-harm-adjacent prompts). Legal is not yet looped in. The growth team has a launch tied to the capability gain on Thursday. On-call volume is already high this week. Your policy sets a hard ceiling of 0.5% on that category.",
    call: {
      prompt: "What's the call?",
      options: [
        { id: "a", text: "Hold the ship: the safety regression breaches a hard policy ceiling in a sensitive category — mitigate (targeted filtering/refusal tuning) and re-test before any launch, and loop Legal now", best: true },
        { id: "b", text: "Ship Thursday — a +7 success gain clearly outweighs a 0.6-point safety delta", best: false },
        { id: "c", text: "Ship, but quietly raise the category ceiling to 1.0% so it passes", best: false },
        { id: "d", text: "Ship to a 5% holdback and watch production before deciding", best: false },
      ],
    },
    justify: {
      prompt: "Which reasons support holding? Select all that apply.",
      options: [
        { id: "a", text: "The regression breaches a pre-committed hard ceiling in a self-harm-adjacent category — that's a bright line, not a metric to be traded against capability", valid: true },
        { id: "b", text: "The harm here is high-severity and irreversible for an affected user; you can't 'watch and revert' your way out of it the way you can with a quality dip", valid: true },
        { id: "c", text: "Legal not yet being looped on a safety-sensitive regression is itself a reason to pause rather than ship past them", valid: true },
        { id: "d", text: "A +7 success gain is large enough to justify overriding the safety ceiling this once", valid: false },
        { id: "e", text: "A 5% production holdback is a fine way to measure self-harm-adjacent harm live", valid: false },
      ],
    },
    trap: {
      prompt: "Which is the seductive-but-wrong move?",
      options: [
        { id: "a", text: "Hold, mitigate, re-test, loop Legal", isTrap: false },
        { id: "b", text: "Ship Thursday — the +7 outweighs 0.6 points", isTrap: true, why: "It's framed as a clean expected-value trade: +7 success vs. a tiny 0.6-point safety delta — the numbers 'obviously' favour shipping. But that framing is category-blind. A safety ceiling in a self-harm-adjacent category isn't a metric on a shared axis with success; it's a bright line, and the harm is severe and irreversible for real users. Trading across incommensurable axes is the seduction." },
        { id: "c", text: "Raise the category ceiling to make it pass", isTrap: false },
        { id: "d", text: "Ship to a 5% holdback and watch", isTrap: false },
      ],
    },
    model: {
      verdict: "A hard safety ceiling in a sensitive category is a bright line, not a tradeable metric.",
      body: "The instinct to expected-value it — +7 success against a 0.6-point safety delta — is exactly the trap, because it puts capability and self-harm-adjacent risk on the same axis when they aren't. The regression breaches a pre-committed ceiling, the potential harm is high-severity and irreversible for an affected person, and 'ship to a holdback and watch' doesn't work when even one exposure is the harm. The move is to hold, mitigate the specific category (targeted refusal tuning / filtering), re-test against the ceiling, and loop Legal before, not after. Quietly raising the ceiling to pass is the same violation with a paper trail.",
      revisit: "Revisit: distinguishing tradeable quality metrics from bright-line safety constraints; irreversibility.",
    },
  },

  // ───────────────────────────── 7 · SAFETY ─────────────────────────────────
  {
    id: "jailbreak-in-prod",
    lane: "safety",
    title: "A working jailbreak is circulating for your production assistant",
    brief:
      "A screenshot hits X: a prompt that reliably walks your customer-facing assistant past its refusal on how-to-harm content. It has ~2k reposts in 3 hours and a security researcher DM'd your team the exact prompt. You reproduce it in 4 of 5 tries. It's a Friday 17:40. Your options span an input-filter hotfix (~30 min, partial), a system-prompt hardening (~2 hrs, unknown coverage), and a full refusal re-tune (days). One exec asks in Slack: \"can we just tweet that we take safety seriously and fix it Monday?\"",
    call: {
      prompt: "What do you do right now?",
      options: [
        { id: "a", text: "Deploy the fast input-filter hotfix now to blunt the known exploit, treat it as containment (not the fix), and stand up monitoring + the deeper re-tune in parallel — over the weekend, not Monday", best: true },
        { id: "b", text: "Wait for the full refusal re-tune so you fix it properly the first time", best: false },
        { id: "c", text: "Tweet the safety-statement and schedule the real fix for Monday", best: false },
        { id: "d", text: "Take the assistant fully offline until the re-tune ships", best: false },
      ],
    },
    justify: {
      prompt: "Which reasons support the fast-contain-then-fix approach? Select all that apply.",
      options: [
        { id: "a", text: "The exploit is public, reproducible, and spreading — every hour of exposure is active harm risk, so time-to-containment dominates over elegance of fix", valid: true },
        { id: "b", text: "An input filter on the known prompt is partial but real risk reduction available in ~30 min; 'partial now' beats 'complete in days' when exposure is live", valid: true },
        { id: "c", text: "Containment and the durable re-tune aren't mutually exclusive — you ship the blunt fix and start the real one in parallel", valid: true },
        { id: "d", text: "Because a filter can be bypassed, it's not worth deploying at all", valid: false },
        { id: "e", text: "A public statement of intent materially reduces the live risk", valid: false },
      ],
    },
    trap: {
      prompt: "Which is the seductive-but-wrong move?",
      options: [
        { id: "a", text: "Fast input-filter now, deeper fix in parallel this weekend", isTrap: false },
        { id: "b", text: "Wait for the full re-tune to fix it properly", isTrap: true, why: "'Do it right the first time' sounds like the mature, senior instinct — no band-aids. But it silently accepts days of live, public, reproducible exposure to how-to-harm content while you build the perfect fix. During an active incident, the perfect durable fix is the enemy of fast containment. Refusing the partial mitigation because it's imperfect maximises exposure time." },
        { id: "c", text: "Tweet a safety statement, fix Monday", isTrap: false },
        { id: "d", text: "Take the assistant fully offline", isTrap: false },
      ],
    },
    model: {
      verdict: "Contain fast with the partial fix; build the durable fix in parallel — don't let 'proper' beat 'now.'",
      body: "This is an active, public, reproducible safety incident, so the clock dominates: minimise exposure time first, perfect the fix second. The input-filter hotfix is partial and bypassable, but it's real risk reduction you can ship in 30 minutes, and it doesn't block the deeper refusal re-tune — you run both. The seductive-but-wrong move is holding out for the complete re-tune: it wears the costume of engineering rigour while accepting days of live harm. (Full-offline is defensible if the surface is low-value, but usually overkill; the tweet-and-wait option isn't mitigation at all.)",
      revisit: "Revisit: incident containment vs. remediation, and why partial mitigations win under live exposure.",
    },
  },

  // ─────────────────────────────── 8 · BVB ──────────────────────────────────
  {
    id: "vector-db-build-vs-buy",
    lane: "bvb",
    title: "Build vs buy: your vector search is straining at 40M vectors",
    brief:
      "Your RAG index hit 40M vectors and recall/latency are degrading on the open-source library you self-host on one box. A senior engineer proposes building a sharded, custom ANN service (\"we'll own it, no vendor lock-in, ~1 quarter\"). A managed vector DB would cost ~$4k/mo and take ~2 weeks to migrate. Your team is 4 engineers with no distributed-systems specialist, and the core product roadmap is already behind. The CTO leans 'build' on principle: \"search is core to us.\"",
    call: {
      prompt: "What do you recommend?",
      options: [
        { id: "a", text: "Buy the managed vector DB now to unblock the product; keep an exit path (portable embeddings, abstraction layer) and only revisit building if scale/cost/differentiation later justify it", best: true },
        { id: "b", text: "Build the custom sharded ANN service — search is core, and owning it avoids vendor lock-in", best: false },
        { id: "c", text: "Stay on the single-box open-source setup and just add more RAM", best: false },
        { id: "d", text: "Buy the managed DB and commit to never building anything in-house again", best: false },
      ],
    },
    justify: {
      prompt: "Which reasons support buying now? Select all that apply.",
      options: [
        { id: "a", text: "Build cost is real: ~1 quarter of a roadmap-behind team of 4 with no distributed-systems specialist — the opportunity cost is the actual product roadmap", valid: true },
        { id: "b", text: "\"Search is core\" conflates the product experience (which is core) with the ANN infrastructure (which is largely commoditised) — you can own the former while renting the latter", valid: true },
        { id: "c", text: "An abstraction layer + portable embeddings keeps the buy reversible, so lock-in is a managed risk, not a one-way door", valid: true },
        { id: "d", text: "Vendor lock-in is severe enough that avoiding it justifies a quarter of build time regardless of roadmap cost", valid: false },
        { id: "e", text: "Adding RAM to one box is a durable answer to 40M-and-growing vectors", valid: false },
      ],
    },
    trap: {
      prompt: "Which is the seductive-but-wrong move?",
      options: [
        { id: "a", text: "Buy now, keep an exit path", isTrap: false },
        { id: "b", text: "Build the custom ANN service — 'search is core'", isTrap: true, why: "'Search is core to us, so we must own the infrastructure' is the trap — and the CTO is voicing it. It equivocates on 'core': the search experience is core, but sharded ANN is commoditised infrastructure that three vendors do better than a 4-person team with no distributed-systems specialist could in a quarter. The real cost is the roadmap you're already behind on. 'Own it on principle' feels strategic; here it's opportunity-cost blindness." },
        { id: "c", text: "Add RAM to the single box", isTrap: false },
        { id: "d", text: "Buy and vow never to build in-house again", isTrap: false },
      ],
    },
    model: {
      verdict: "Rent the commoditised infra, own the differentiated experience — and keep the exit reversible.",
      body: "The decision hinges on separating 'search is core to the product' (true) from 'therefore we must build the ANN infrastructure' (false). Sharded approximate-nearest-neighbour serving is a solved, commoditised problem; a roadmap-behind team of four with no distributed-systems specialist building it in a quarter is a large, mostly-invisible opportunity cost paid in shipped product. Buying unblocks now; a thin abstraction layer plus portable embeddings keeps lock-in a managed risk rather than a one-way door, so you can revisit build later if genuine scale, cost, or differentiation emerges. 'Own it on principle' is the trap, and it's the loudest voice in the room.",
      revisit: "Revisit: build-vs-buy through opportunity cost and commoditisation, not 'core = must own.'",
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  Scoring
// ═══════════════════════════════════════════════════════════════════════════
function scoreScenario(sc, ans) {
  // decision: 2 if best chosen, else 0
  const bestId = sc.call.options.find((o) => o.best).id;
  const decision = ans.call === bestId ? 2 : 0;

  // reasoning: fraction of correctness across all justify options (picked-valid + not-picked-invalid)
  const jset = new Set(ans.justify || []);
  const jTotal = sc.justify.options.length;
  let jCorrect = 0;
  sc.justify.options.forEach((o) => {
    const picked = jset.has(o.id);
    if ((o.valid && picked) || (!o.valid && !picked)) jCorrect += 1;
  });
  const jFrac = jCorrect / jTotal;
  const reasoning = jFrac >= 0.85 ? 2 : jFrac >= 0.6 ? 1 : 0;

  // risk awareness: did they pick any invalid (over-claiming) reasons? penalise
  const invalidPicked = sc.justify.options.filter((o) => !o.valid && jset.has(o.id)).length;
  const validMissed = sc.justify.options.filter((o) => o.valid && !jset.has(o.id)).length;
  const risk = invalidPicked === 0 ? (validMissed === 0 ? 2 : 1) : invalidPicked >= 2 ? 0 : 1;

  // cost/impact framing: proxy — did they get BOTH the decision and avoid invalid reasons?
  const cost = decision === 2 && invalidPicked === 0 ? 2 : decision === 2 || invalidPicked === 0 ? 1 : 0;

  // trap caught
  const trapId = sc.trap.options.find((o) => o.isTrap).id;
  const trap = ans.trap === trapId ? 2 : 0;

  return { decision, reasoning, risk, cost, trap, total: decision + reasoning + risk + cost + trap };
}

function readinessBand(pctByAxis, overallPct) {
  // gate: risk framing and trap-catching matter most for the band label
  const risk = pctByAxis.risk;
  const trap = pctByAxis.trap;
  if (overallPct >= 0.85 && risk >= 0.75 && trap >= 0.75)
    return { band: "Staff-ready", tone: "#34d399", note: "Sound calls, valid reasoning, and you catch the seductive-wrong option under pressure." };
  if (overallPct >= 0.7 && trap >= 0.5)
    return { band: "Senior — gaps in risk framing", tone: "#a78bfa", note: "Your decisions and traps are mostly right; tighten how you frame risk and avoid over-claiming reasons." };
  if (overallPct >= 0.5)
    return { band: "Developing — reasoning needs sharpening", tone: "#f59e0b", note: "You reach reasonable calls but the reasoning and trap-detection are inconsistent." };
  return { band: "Early — build the reasoning scaffolding", tone: "#ef4444", note: "Focus on separating symptom from cause, and on spotting the plausible-but-wrong move." };
}

// ═══════════════════════════════════════════════════════════════════════════
//  Small UI atoms
// ═══════════════════════════════════════════════════════════════════════════
const surface = { background: "var(--surface, #18181b)", border: "1px solid var(--border, #27272a)" };

function LanePill({ laneKey, small }) {
  const l = LANES[laneKey];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium"
      style={{
        fontSize: small ? 11 : 12,
        padding: small ? "2px 8px" : "3px 10px",
        color: l.accent,
        background: `${l.accent}1a`,
        border: `1px solid ${l.accent}44`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: l.accent }} />
      {l.label}
    </span>
  );
}

function Bar({ value, max = 2, accent = "#a78bfa" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#27272a" }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent, transition: "width .5s cubic-bezier(.16,1,.3,1)" }} />
    </div>
  );
}

const Arrow = () => <span aria-hidden style={{ opacity: 0.7 }}>&rarr;</span>;
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const Cross = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
);

// ═══════════════════════════════════════════════════════════════════════════
//  Main component
// ═══════════════════════════════════════════════════════════════════════════
export default function JudgmentExam({ onExit }) {
  const [phase, setPhase] = useState("intro"); // intro | exam | verdict
  const [idx, setIdx] = useState(0); // scenario index
  const [step, setStep] = useState("call"); // call | justify | trap | reveal
  const [answers, setAnswers] = useState({}); // { [scenarioId]: { call, justify:[], trap } }
  const [scores, setScores] = useState({}); // { [scenarioId]: scoreObj }
  const [confidence, setConfidence] = useState(3);

  const sc = SCENARIOS[idx];
  const cur = answers[sc?.id] || { call: null, justify: [], trap: null };

  function setCur(patch) {
    setAnswers((a) => ({ ...a, [sc.id]: { ...cur, ...patch } }));
  }

  function toggleJustify(id) {
    const set = new Set(cur.justify);
    set.has(id) ? set.delete(id) : set.add(id);
    setCur({ justify: [...set] });
  }

  function advanceStep() {
    if (step === "call") setStep("justify");
    else if (step === "justify") setStep("trap");
    else if (step === "trap") {
      // lock in the score for this scenario
      const s = scoreScenario(sc, answers[sc.id]);
      setScores((m) => ({ ...m, [sc.id]: s }));
      setStep("reveal");
    }
  }

  function nextScenario() {
    if (idx + 1 < SCENARIOS.length) {
      setIdx(idx + 1);
      setStep("call");
      setConfidence(3);
    } else {
      setPhase("verdict");
    }
  }

  function restart() {
    setPhase("intro");
    setIdx(0);
    setStep("call");
    setAnswers({});
    setScores({});
    setConfidence(3);
  }

  // running total across completed scenarios
  const runningTotal = Object.values(scores).reduce((a, s) => a + s.total, 0);
  const runningMax = Object.keys(scores).length * 10;

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    const laneCounts = Object.keys(LANES).map((k) => ({
      key: k,
      n: SCENARIOS.filter((s) => s.lane === k).length,
    }));
    return (
      <Shell onExit={onExit}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-2 text-xs uppercase tracking-widest text-violet-400 font-semibold">The Call</div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 leading-tight">
            A judgment exam for GenAI operators
          </h1>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Nine questions of trivia won't tell you if someone can run a model in production. This will.
            You'll work {SCENARIOS.length} realistic incidents — messy dashboards, conflicting stakeholders,
            a clock. Each one scores <span className="text-zinc-200">how</span> you reason, not just whether
            you land on the right verdict.
          </p>

          <div className="mt-7 rounded-xl p-5" style={surface}>
            <div className="text-sm font-semibold text-zinc-200 mb-3">Every scenario runs three moves</div>
            <ol className="space-y-3 text-sm text-zinc-400">
              <li className="flex gap-3">
                <span className="text-violet-400 font-mono">01</span>
                <span><span className="text-zinc-200">Call.</span> Pick the decision. Four options, one best.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-violet-400 font-mono">02</span>
                <span><span className="text-zinc-200">Justify.</span> Multi-select the reasons that actually support your call — some are valid, some are plausible-but-wrong.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-violet-400 font-mono">03</span>
                <span><span className="text-zinc-200">Trap check.</span> Name the seductive-but-wrong option a mid-level operator reaches for.</span>
              </li>
            </ol>
          </div>

          <div className="mt-5 rounded-xl p-5" style={surface}>
            <div className="text-sm font-semibold text-zinc-200 mb-3">Five lanes</div>
            <div className="flex flex-wrap gap-2">
              {laneCounts.map((l) => (
                <span key={l.key} className="inline-flex items-center gap-2">
                  <LanePill laneKey={l.key} />
                  <span className="text-xs text-zinc-500">&times;{l.n}</span>
                </span>
              ))}
            </div>
            <div className="mt-4 text-xs text-zinc-500 leading-relaxed">
              Scored across five axes — decision quality, reasoning validity, risk awareness,
              cost/impact framing, and whether you caught the trap. It aggregates into a readiness band
              and a shareable verdict card.
            </div>
          </div>

          <button
            onClick={() => setPhase("exam")}
            className="mt-7 w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors inline-flex items-center gap-2"
          >
            Start the exam <Arrow />
          </button>
        </div>
      </Shell>
    );
  }

  // ── VERDICT ────────────────────────────────────────────────────────────────
  if (phase === "verdict") {
    return <Verdict scores={scores} onRestart={restart} onExit={onExit} />;
  }

  // ── EXAM ───────────────────────────────────────────────────────────────────
  const bestCallId = sc.call.options.find((o) => o.best).id;
  const trapId = sc.trap.options.find((o) => o.isTrap).id;
  const revealScore = scores[sc.id];

  return (
    <Shell onExit={onExit}>
      <div className="max-w-2xl mx-auto">
        {/* progress header */}
        <div className="flex items-center justify-between mb-4">
          <LanePill laneKey={sc.lane} />
          <div className="text-xs text-zinc-500 font-mono">
            {idx + 1} / {SCENARIOS.length}
            {runningMax > 0 && (
              <span className="ml-3 text-zinc-400">{runningTotal}/{runningMax} pts</span>
            )}
          </div>
        </div>
        <div className="h-1 rounded-full mb-6 overflow-hidden" style={{ background: "#27272a" }}>
          <div className="h-full bg-violet-500" style={{ width: `${(idx / SCENARIOS.length) * 100}%`, transition: "width .4s ease" }} />
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-zinc-100 leading-snug">{sc.title}</h2>
        <p className="mt-3 text-[15px] text-zinc-400 leading-relaxed">{sc.brief}</p>

        {/* ── STEP: CALL ── */}
        <StepBlock n="01" label="Call" active={step === "call"} done={step !== "call"}>
          <div className="text-sm font-medium text-zinc-300 mb-3">{sc.call.prompt}</div>
          <div className="space-y-2">
            {sc.call.options.map((o) => (
              <OptionRow
                key={o.id}
                selected={cur.call === o.id}
                disabled={step !== "call"}
                onClick={() => setCur({ call: o.id })}
                reveal={step === "reveal"}
                correct={o.best}
                wrongPicked={step === "reveal" && cur.call === o.id && !o.best}
                mode="single"
              >
                {o.text}
              </OptionRow>
            ))}
          </div>

          {step === "call" && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>Confidence</span>
                <span className="text-zinc-400">{["Guessing", "Low", "Moderate", "High", "Certain"][confidence - 1]}</span>
              </div>
              <input
                type="range" min={1} max={5} value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          )}

          {step === "call" && (
            <PrimaryBtn disabled={!cur.call} onClick={advanceStep}>
              Lock the call <Arrow />
            </PrimaryBtn>
          )}
        </StepBlock>

        {/* ── STEP: JUSTIFY ── */}
        {step !== "call" && (
          <StepBlock n="02" label="Justify" active={step === "justify"} done={step === "trap" || step === "reveal"}>
            <div className="text-sm font-medium text-zinc-300 mb-3">{sc.justify.prompt}</div>
            <div className="space-y-2">
              {sc.justify.options.map((o) => (
                <OptionRow
                  key={o.id}
                  selected={cur.justify.includes(o.id)}
                  disabled={step !== "justify"}
                  onClick={() => toggleJustify(o.id)}
                  reveal={step === "reveal"}
                  correct={o.valid}
                  wrongPicked={step === "reveal" && cur.justify.includes(o.id) && !o.valid}
                  missed={step === "reveal" && !cur.justify.includes(o.id) && o.valid}
                  mode="multi"
                >
                  {o.text}
                </OptionRow>
              ))}
            </div>
            {step === "justify" && (
              <PrimaryBtn disabled={cur.justify.length === 0} onClick={advanceStep}>
                Lock the reasoning <Arrow />
              </PrimaryBtn>
            )}
          </StepBlock>
        )}

        {/* ── STEP: TRAP ── */}
        {(step === "trap" || step === "reveal") && (
          <StepBlock n="03" label="Trap check" active={step === "trap"} done={step === "reveal"}>
            <div className="text-sm font-medium text-zinc-300 mb-3">{sc.trap.prompt}</div>
            <div className="space-y-2">
              {sc.trap.options.map((o) => (
                <OptionRow
                  key={o.id}
                  selected={cur.trap === o.id}
                  disabled={step !== "trap"}
                  onClick={() => setCur({ trap: o.id })}
                  reveal={step === "reveal"}
                  correct={o.isTrap}
                  wrongPicked={step === "reveal" && cur.trap === o.id && !o.isTrap}
                  mode="single"
                >
                  {o.text}
                </OptionRow>
              ))}
            </div>
            {step === "trap" && (
              <PrimaryBtn disabled={!cur.trap} onClick={advanceStep}>
                Reveal the model answer <Arrow />
              </PrimaryBtn>
            )}
          </StepBlock>
        )}

        {/* ── REVEAL ── */}
        {step === "reveal" && (
          <div className="mt-8">
            {/* per-scenario score chips */}
            <div className="rounded-xl p-5 mb-4" style={surface}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-zinc-200">This scenario</div>
                <div className="text-sm font-mono" style={{ color: LANES[sc.lane].accent }}>
                  {revealScore.total}/10
                </div>
              </div>
              <div className="grid gap-2.5">
                {AXES.map((ax) => (
                  <div key={ax.key} className="grid grid-cols-[130px_1fr_auto] items-center gap-3">
                    <span className="text-xs text-zinc-400">{ax.label}</span>
                    <Bar value={revealScore[ax.key]} accent={LANES[sc.lane].accent} />
                    <span className="text-xs font-mono text-zinc-500">{revealScore[ax.key]}/2</span>
                  </div>
                ))}
              </div>
            </div>

            {/* model answer */}
            <div className="rounded-xl p-5" style={{ background: "var(--surface, #18181b)", border: "1px solid #4c1d95" }}>
              <div className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2">Model answer</div>
              <div className="text-[15px] font-semibold text-zinc-100 mb-2">{sc.model.verdict}</div>
              <p className="text-sm text-zinc-400 leading-relaxed">{sc.model.body}</p>

              <div className="mt-4 rounded-lg p-3.5" style={{ background: "#ef444414", border: "1px solid #ef444433" }}>
                <div className="text-xs font-semibold text-red-300 mb-1.5 flex items-center gap-1.5">
                  <Cross /> The trap
                </div>
                <div className="text-xs text-zinc-400 leading-relaxed">
                  <span className="text-zinc-300 font-medium">
                    {sc.trap.options.find((o) => o.isTrap).text}.
                  </span>{" "}
                  {sc.trap.options.find((o) => o.isTrap).why}
                </div>
              </div>

              <div className="mt-3 text-xs text-amber-300/90 flex items-start gap-1.5">
                <span aria-hidden>&#9873;</span>
                <span>{sc.model.revisit}</span>
              </div>
            </div>

            <PrimaryBtn onClick={nextScenario}>
              {idx + 1 < SCENARIOS.length ? <>Next scenario <Arrow /></> : <>See your verdict <Arrow /></>}
            </PrimaryBtn>
          </div>
        )}
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Verdict card
// ═══════════════════════════════════════════════════════════════════════════
function Verdict({ scores, onRestart, onExit }) {
  const total = Object.values(scores).reduce((a, s) => a + s.total, 0);
  const max = SCENARIOS.length * 10;
  const overallPct = max ? total / max : 0;

  // per-axis percentages
  const axisSum = {};
  AXES.forEach((a) => (axisSum[a.key] = 0));
  Object.values(scores).forEach((s) => AXES.forEach((a) => (axisSum[a.key] += s[a.key])));
  const axisPct = {};
  AXES.forEach((a) => (axisPct[a.key] = SCENARIOS.length ? axisSum[a.key] / (SCENARIOS.length * 2) : 0));

  const band = readinessBand(axisPct, overallPct);

  // per-lane strengths/gaps
  const laneAgg = {};
  Object.keys(LANES).forEach((k) => (laneAgg[k] = { got: 0, max: 0 }));
  SCENARIOS.forEach((sc) => {
    const s = scores[sc.id];
    if (!s) return;
    laneAgg[sc.lane].got += s.total;
    laneAgg[sc.lane].max += 10;
  });
  const laneRows = Object.keys(LANES)
    .filter((k) => laneAgg[k].max > 0)
    .map((k) => ({ key: k, pct: laneAgg[k].got / laneAgg[k].max, ...laneAgg[k] }))
    .sort((a, b) => b.pct - a.pct);

  // top 2 areas to revisit = lowest 2 axes
  const revisit = AXES
    .map((a) => ({ ...a, pct: axisPct[a.key] }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 2);

  const AXIS_ADVICE = {
    decision: "Slow the first move down: name the single most-diagnostic signal before you pick.",
    reasoning: "Pressure-test each supporting reason — would it still hold if the call were wrong?",
    risk: "Watch for over-claiming: a plausible reason that proves too much is a risk-framing miss.",
    cost: "Frame every call in impact terms — what does the wrong choice actually cost, and to whom?",
    trap: "Before answering, ask what a competent-but-mid operator would pick, and why it's wrong.",
  };

  return (
    <Shell onExit={onExit}>
      <div className="max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-2">Verdict</div>

        {/* headline band card */}
        <div
          className="rounded-2xl p-6 md:p-7"
          style={{ background: "var(--surface, #18181b)", border: `1px solid ${band.tone}55` }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-2xl md:text-3xl font-bold" style={{ color: band.tone }}>
                {band.band}
              </div>
              <p className="mt-2 text-sm text-zinc-400 max-w-md leading-relaxed">{band.note}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-zinc-100">{total}<span className="text-lg text-zinc-500">/{max}</span></div>
              <div className="text-xs text-zinc-500 mt-0.5">{Math.round(overallPct * 100)}% judgment</div>
            </div>
          </div>

          {/* axis breakdown */}
          <div className="mt-6 grid gap-2.5">
            {AXES.map((ax) => (
              <div key={ax.key} className="grid grid-cols-[150px_1fr_auto] items-center gap-3">
                <span className="text-xs text-zinc-400">{ax.label}</span>
                <Bar value={axisPct[ax.key]} max={1} accent={band.tone} />
                <span className="text-xs font-mono text-zinc-500">{Math.round(axisPct[ax.key] * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* per-lane */}
        <div className="mt-5 rounded-xl p-5" style={surface}>
          <div className="text-sm font-semibold text-zinc-200 mb-4">By lane</div>
          <div className="space-y-3">
            {laneRows.map((l) => (
              <div key={l.key} className="grid grid-cols-[180px_1fr_auto] items-center gap-3">
                <LanePill laneKey={l.key} small />
                <Bar value={l.pct} max={1} accent={LANES[l.key].accent} />
                <span className="text-xs font-mono text-zinc-500">{Math.round(l.pct * 100)}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs">
            {laneRows.length > 0 && (
              <span className="text-emerald-400">
                Strongest: <span className="text-zinc-300">{LANES[laneRows[0].key].label}</span>
              </span>
            )}
            {laneRows.length > 1 && (
              <span className="text-amber-400">
                Weakest: <span className="text-zinc-300">{LANES[laneRows[laneRows.length - 1].key].label}</span>
              </span>
            )}
          </div>
        </div>

        {/* top 2 to revisit */}
        <div className="mt-5 rounded-xl p-5" style={surface}>
          <div className="text-sm font-semibold text-zinc-200 mb-3">Top two areas to revisit</div>
          <div className="space-y-3">
            {revisit.map((r, i) => (
              <div key={r.key} className="flex gap-3">
                <span className="text-violet-400 font-mono text-sm shrink-0">{i + 1}</span>
                <div>
                  <div className="text-sm text-zinc-200 font-medium">
                    {r.label} <span className="text-zinc-500 font-mono text-xs">· {Math.round(r.pct * 100)}%</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{AXIS_ADVICE[r.key]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors inline-flex items-center gap-2"
          >
            Restart the exam
          </button>
          {onExit && (
            <button
              onClick={() => onExit && onExit()}
              className="px-5 py-2.5 rounded-xl font-semibold text-zinc-300 hover:text-zinc-100 transition-colors"
              style={surface}
            >
              Back
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Layout + shared bits
// ═══════════════════════════════════════════════════════════════════════════
function Shell({ children, onExit }) {
  return (
    <div className="min-h-full w-full" style={{ color: "#e4e4e7" }}>
      <div className="px-4 md:px-6 py-6 md:py-10">
        {onExit && (
          <button
            onClick={() => onExit && onExit()}
            className="mb-6 text-sm text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
          >
            <span aria-hidden>&larr;</span> Back
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

function StepBlock({ n, label, active, done, children }) {
  return (
    <div
      className="mt-6 rounded-xl p-5 transition-opacity"
      style={{
        ...surface,
        opacity: active || done ? 1 : 0.55,
        borderColor: active ? "#7c3aed" : "var(--border, #27272a)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className="w-6 h-6 rounded-md grid place-items-center text-xs font-mono font-semibold"
          style={{
            background: done ? "#34d39922" : active ? "#7c3aed22" : "#27272a",
            color: done ? "#34d399" : active ? "#a78bfa" : "#71717a",
          }}
        >
          {done ? <Check /> : n}
        </span>
        <span className="text-sm font-semibold" style={{ color: active ? "#e4e4e7" : "#a1a1aa" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function OptionRow({ children, selected, disabled, onClick, reveal, correct, wrongPicked, missed, mode }) {
  let border = "var(--border, #27272a)";
  let bg = "transparent";
  let ring = null;

  if (reveal) {
    if (correct) { border = "#34d399"; bg = "#34d39914"; }
    if (wrongPicked) { border = "#ef4444"; bg = "#ef444414"; }
    if (missed) { border = "#f59e0b66"; bg = "#f59e0b0f"; }
  } else if (selected) {
    border = "#7c3aed";
    bg = "#7c3aed14";
  }

  const box = mode === "multi" ? 4 : 999; // square-ish for multi, round for single

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full text-left rounded-lg px-3.5 py-3 flex items-start gap-3 transition-colors"
      style={{
        border: `1px solid ${border}`,
        background: bg,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <span
        className="mt-0.5 shrink-0 grid place-items-center"
        style={{
          width: 18, height: 18, borderRadius: box,
          border: `2px solid ${
            reveal && correct ? "#34d399"
            : reveal && wrongPicked ? "#ef4444"
            : selected ? "#a78bfa" : "#52525b"
          }`,
          background: (selected && !reveal) || (reveal && correct) ? (reveal && correct ? "#34d399" : "#a78bfa") : reveal && wrongPicked ? "#ef4444" : "transparent",
          color: "#09090b",
        }}
      >
        {reveal && correct ? <Check /> : reveal && wrongPicked ? <Cross /> : selected && mode === "multi" ? <Check /> : null}
      </span>
      <span className="text-sm leading-relaxed" style={{ color: reveal ? "#d4d4d8" : selected ? "#f4f4f5" : "#d4d4d8" }}>
        {children}
        {missed && <span className="ml-2 text-xs text-amber-400">(valid — missed)</span>}
      </span>
    </button>
  );
}

function PrimaryBtn({ children, disabled, onClick }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="mt-4 px-5 py-2.5 rounded-xl font-semibold text-white transition-colors inline-flex items-center gap-2"
      style={{
        background: disabled ? "#3f3f46" : "#7c3aed",
        color: disabled ? "#71717a" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
