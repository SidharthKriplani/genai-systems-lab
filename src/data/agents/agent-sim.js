// Agent-topic RUNNER_DATA — SIM/advanced group. Keep export name RUNNER_AGENT_SIM.
export const RUNNER_AGENT_SIM = {
  "agent-computer-use": {
    depthTier: "deep",
    interviewWeight: "medium",
    scenario: "You ship a computer-use agent that files expense reports by driving the finance web app: it screenshots the page, the model decides where to click, you execute the click, screenshot again, repeat. It demos flawlessly. In production it double-submits a $4,200 reimbursement because the 'Submit' click landed, the network lagged 900ms, the next screenshot still showed the un-changed form, and the model — seeing an apparently un-clicked button — clicked again. You need to explain to your team why this class of agent is categorically more fragile than your API-tool agents, and what the fix actually is.",
    explanation: [
      "A **computer-use agent** controls software the way a human does: it looks at a **screenshot** (pixels), decides on a low-level UI action — *click at (840, 612)*, *type 'hello'*, *scroll down* — you execute that action against the real screen, take a **new screenshot**, and feed it back as the next observation. The loop is ==perceive (screenshot) → ground (find the target) → act (click/type) → verify (screenshot again)==. Anthropic's computer-use API, OpenAI's Operator, and open stacks like the browser-driving agents on Playwright/Selenium all run this exact cycle. The model never touches a clean API; it touches pixels and coordinates.",
      "Contrast that with an **API/function-calling tool agent**. There the model emits a *structured* call — `submit_expense(id=4200, ...)` — against a typed contract, and the tool returns a *structured* result: `{status: 'ok', confirmation: 'EXP-88'}`. The agent knows unambiguously whether the action succeeded, what the new state is, and gets a stable identifier back. ==Computer use throws all of that away.== There is no return value — only the next screenshot, which the model must *re-perceive from scratch* to infer what happened. Every source of fragility below traces back to this one difference: **the feedback channel is a picture the model must re-interpret, not a fact the system hands it.**",
      "**Grounding** is where most failures live. The model must convert 'click the blue Submit button' into a concrete pixel coordinate on *this* screen at *this* resolution. Two failure families: **coordinate grounding** (the model outputs `(840, 612)` but the button is at `(812, 640)` — off by enough to hit the wrong element, and this drifts across screen sizes, DPI scaling, and window positions), and **element grounding** (the model identifies the right *element* semantically but the UI shifts between the screenshot and the click — a modal opens, an ad loads, the layout reflows — so the coordinate that was correct is now stale). A coordinate is only valid for the exact frame it was computed on.",
      { type: "illustration", label: "The stale-screenshot race that caused the double-submit", content: `t=0ms    screenshot A taken  → form filled, Submit button visible at (840,612)
t=40ms   model reasons on A  → "click Submit at (840,612)"
t=120ms  click executed      → server begins processing the submission
t=120ms  screenshot B taken  → NETWORK LAG: page hasn't re-rendered yet,
                                still shows the un-submitted form (looks identical to A)
t=160ms  model reasons on B  → "the form still shows un-submitted → click Submit AGAIN"
t=240ms  second click        → SECOND $4,200 submission

Root cause: the screenshot is a LAGGING, non-transactional view of a state
the action already changed. The model verified against a stale frame.

API-tool equivalent that CANNOT happen this way:
  submit_expense(4200) → returns {status:'ok', id:'EXP-88'}   ← unambiguous ack
  the agent KNOWS it succeeded; there is nothing to "re-perceive" and no re-click.` },
      "**Latency compounds the fragility.** Each turn is screenshot (encode a full image into the context) + a vision-language forward pass + action execution + a settle-wait for the UI to re-render. That is commonly **2–10 seconds per action**, and a real task ('file this expense') is dozens of actions — so a workflow that an API agent finishes in one structured call takes a computer-use agent minutes. The settle-wait is not optional padding: skip it and you get exactly the stale-frame race above. Long chains also mean **context bloat** — each screenshot is thousands of tokens, so histories are usually pruned to the last few frames, which means the agent has *poor long-horizon memory* of what it already did.",
      "**Irreversibility is the risk axis that matters.** Actions are not equal: a mouse-move or scroll is free to retry; a *Submit*, *Send email*, *Delete*, or *Confirm payment* is not. A stale-frame double-click on a scroll bar is invisible; on a payment button it is a $4,200 incident. The production discipline is therefore: (1) **idempotency / de-duplication** — attach a client-side idempotency key so a repeated submit is a no-op, which is the *actual* fix for the scenario; (2) **explicit confirmation gates** — the agent must pause for human approval before any irreversible action, never decide unilaterally; (3) **sandboxing** — run the agent in an isolated VM/container with a scoped, throwaway account and no access to real money-movement or destructive admin, so a mis-grounded click cannot escape its blast radius; (4) **prompt-injection defense** — the agent reads whatever is on screen, so a malicious page (or an email it opens) can inject instructions, making least-privilege sandboxing a security control, not just a safety one.",
      "So **when should you even reach for computer use?** Only when there is *no API*. It is the tool of last resort for driving legacy desktop software, third-party web apps you cannot integrate with, or flows behind a UI with no programmatic surface. If an API, MCP server, or function-calling tool exists, ==use it — it is faster, cheaper, transactional, and dramatically safer.== The interview framing: computer use trades the *reliability of a structured contract* for the *universality of a human-like interface*, and you pay for that universality in latency, grounding fragility, and safety engineering. Reach for it when reach exceeds all else; wrap it in idempotency + confirmation + sandboxing whenever an action is irreversible.",
    ],
    keyPoints: [
      "**Computer use = screenshot → ground → act → screenshot, on pixels not APIs.** The model sees an image and outputs low-level UI actions (click coord, type, scroll); the only feedback is the next screenshot it must re-perceive — there is no structured return value.",
      "**Grounding is the core fragility:** converting 'click Submit' into a valid pixel coordinate that breaks across resolution/DPI (coordinate grounding) or goes stale when the UI reflows between screenshot and click (element grounding). A coordinate is valid only for the frame it was computed on.",
      "**The killer failure is the stale-frame race:** the screenshot is a lagging, non-transactional view. If the UI hasn't re-rendered after an action, the model re-perceives an un-changed screen and repeats the action → double-submits. An API tool's structured ack makes this impossible.",
      "**Latency is 2–10s/action** (image encode + VLM pass + execute + settle-wait) and tasks are dozens of actions; screenshots also bloat context, so histories get pruned and long-horizon memory is weak.",
      "**Irreversibility is the risk axis.** Guard irreversible actions with idempotency keys (the real double-submit fix), explicit human confirmation gates, and sandboxing (isolated VM + scoped throwaway account) that also defends against on-screen prompt injection.",
      "**Prefer API/function-calling tools whenever they exist** — they are transactional, faster, cheaper, safer. Computer use is the last-resort universal interface for software with no programmatic surface.",
    ],
    recap: [
      "**Loop:** screenshot → ground to a coordinate → act → screenshot again. Feedback is a picture to re-perceive, not a fact handed back — the whole gap vs API tools.",
      "**Grounding breaks two ways:** wrong pixel across resolutions (coordinate) or right element gone stale after a reflow (element). A coordinate is valid for one frame only.",
      "**Stale-frame race = the double-submit:** a non-transactional screenshot lags the action → model re-clicks. Fix with an **idempotency key**, not sharper perception.",
      "**Costs:** 2–10s per action × dozens of actions; screenshots bloat context → pruned history → weak long-horizon memory.",
      "**Safety stack for irreversible actions:** idempotency + human confirmation gate + sandboxed VM/throwaway account (also blocks on-screen prompt injection).",
      "**Default to APIs** — reach for computer use only when no programmatic interface exists; you trade structured reliability for human-like universality.",
    ],
    mcqs: [
      {
        question: "Your computer-use agent double-submitted a payment: the click landed, the page lagged, the next screenshot still showed the un-submitted form, and the model clicked again. What is the CORRECT primary fix?",
        options: [
          "Attach a client-side idempotency key to the submit action and add a human confirmation gate before the irreversible step executes",
          "Increase the screenshot resolution to 4K so the model can ground the Submit button's pixel coordinate more precisely on retries and future clicks",
          "Prompt the model to always re-check the exact RGB pixel color of the Submit button before deciding to click it a second time",
          "Switch to a larger 70B-parameter vision-language model so it reasons more accurately about whether the on-screen state changed",
        ],
        correct: 0,
        explanation: "Option A is correct: the root cause is that the screenshot is a lagging, non-transactional view of state the action already changed, so the model can re-perceive a stale frame and repeat an irreversible action. An idempotency key makes a duplicate submit a no-op regardless of what the model perceives, and a confirmation gate keeps a human in the loop for money-movement — this is a system-level fix, not a perception fix. Option B is wrong: higher resolution helps grounding accuracy but does nothing about a *stale* frame — the model grounded correctly and clicked the right button twice. Option C is wrong because prompting cannot make a non-transactional feedback channel reliable; you cannot instruct away a race condition. Option D is wrong for the same reason as B/C — a better model still only sees a lagging screenshot; the problem is the missing transactional acknowledgment, which no model quality can supply.",
      },
      {
        question: "Which two facts together explain why a computer-use agent is categorically more fragile than an equivalent API/function-calling agent for the same task?",
        options: [
          "The feedback channel is a screenshot the model must re-perceive from scratch, with no structured return value or unambiguous acknowledgment",
          "Vision-language models are inherently weaker reasoners than text-only models, so their planning degrades no matter which interface is used here",
          "Pixel coordinates are valid only for the exact frame they were computed on, so they go stale the instant the page reflows before the click lands",
          "API-based agents are architecturally incapable of ever triggering irreversible actions, so they never need the confirmation gates computer-use requires",
        ],
        correct: [0, 2],
        explanation: "Options A and C are both correct and together are the defining fragility: the model only gets the next screenshot and must re-infer state from pixels with no structured acknowledgment, and any coordinate it computes is only valid for that one frame — a resolution shift or a reflow invalidates it before the click lands. Option B is wrong: the fragility is architectural, not a claim that vision models reason worse; the identical model behind a typed API contract is far more reliable. Option D is wrong: API agents absolutely perform irreversible actions (sending email, moving money) and still need confirmation gates — the API contract removes ambiguity about what happened, it doesn't remove the stakes of the action itself.",
      },
    ],
    takeaway: "Computer-use agents drive software through screenshots and pixel-level actions (screenshot → ground → act → screenshot) with no structured return value, so they inherit grounding error, stale-frame races, high per-action latency, and a large safety surface. Guard every irreversible action with idempotency + confirmation gates + sandboxing, and prefer transactional API/function-calling tools whenever a programmatic interface exists — reach for computer use only when nothing else can reach the software.",
  },

  "agent-long-running": {
    depthTier: "deep",
    interviewWeight: "medium",
    scenario: "You build an agent that migrates a legacy codebase: it reads modules, rewrites them, runs tests, and files PRs over roughly 6 hours across hundreds of tool calls. At step 180 of ~250, the worker pod is OOM-killed by the cluster during a routine node rotation. The agent restarts from scratch — re-reading files, re-calling the LLM on work it already did, re-spending ~$60 of tokens — and worse, it re-opens PRs it had already opened. You need to explain why a 6-hour agent is a fundamentally different engineering problem from a 30-second one, and what infrastructure makes it survivable.",
    explanation: [
      "A short agent — a single request that finishes in seconds — can live entirely in one process's memory. A **long-running / durable agent** cannot, and for a first-principles reason: over hours it *will* be interrupted. Pods get OOM-killed and rescheduled, nodes rotate, deploys roll, LLM calls time out, and the workflow itself must *pause* for hours waiting on a human approval or an external webhook. ==Any process that runs long enough to span an interruption must be able to survive one.== The entire discipline of long-running agents is answering: when this dies at step 180, how do we not lose steps 1–179?",
      "The load-bearing primitive is **checkpointing**: after each meaningful step, persist the agent's **state** — the conversation/scratchpad, which tools have run and their results, the plan and current position, and a completion marker per step — to **durable storage** (a database, object store, or the durable-execution engine's own log), *outside* the worker's memory. On restart the agent **rehydrates** from the last checkpoint and **resumes** at step 181 rather than step 1. Resumability is not a feature you bolt on; it is the property the whole system is designed around, and it only works if state lives somewhere the worker's death cannot take with it.",
      { type: "illustration", label: "Restart-from-zero vs. resume-from-checkpoint at the OOM at step 180", content: `WITHOUT checkpointing (the scenario):
  steps 1..179 done → OOM at 180 → pod rescheduled → START AT STEP 1
  cost: re-read every file, re-call the LLM on solved work (~$60 wasted),
        re-open PRs already opened (duplicate side effects), +hours of wall-clock

WITH checkpointing:
  after each step, persist {step_id, tool_results, plan, cursor, done:true} → DB/log
  OOM at 180 → pod rescheduled → rehydrate last checkpoint (step 179 done)
                              → RESUME AT STEP 180
  cost: re-do at most the ONE in-flight step; steps 1..179 are never repeated

The duplicate-PR problem is the extra lesson: resume alone isn't enough —
external side effects (opening a PR, sending an email, charging a card) must be
IDEMPOTENT. Give each step a stable key so "open PR for module X" run twice
opens it once. Durability protects your OWN state; idempotency protects the WORLD.` },
      "This is what **durable execution engines** provide so you don't hand-roll it. **Temporal** uses *event-sourcing/replay*: it records every step's result in a history log and, on recovery, replays the log to deterministically reconstruct state up to the failure — so 'checkpoint after every step' is automatic and you write ordinary code. **AWS Step Functions** is a managed state machine that persists state between transitions (you pay per transition, zero ops). **LangGraph** is the LLM-native option — graph nodes with built-in state persistence and first-class **human-in-the-loop** interrupts, so a workflow can pause at an approval node, persist, and resume when the human responds hours later. The common capability across all three: state outlives the process, and long pauses are free rather than a blocked, paying thread.",
      "A problem short agents never hit: **context accumulation over hours.** The naive loop appends every observation to one growing message history, so by hour three the context is enormous — it overflows the window, latency and cost per step climb (you re-send the whole transcript every call), and quality degrades from the noise. ==Long-running agents therefore need active context management, not just a longer window==: **summarize/compact** older turns into a running memory, **externalize** bulky results (write the migrated file to disk/DB and keep only a pointer + summary in context), and carry a durable **scratchpad/task list** as the source of truth rather than the raw transcript. Checkpointing and context management are two sides of the same coin — both move state *out* of the ephemeral message buffer into durable, summarized form.",
      "The **cost profile also differs in kind, not degree.** A 6-hour, 250-step run can accumulate hundreds of dollars in tokens because *every* step re-sends context — so an un-checkpointed restart doesn't just waste time, it **re-spends real money** (the ~$60 in the scenario). Two levers: checkpoint so a crash re-does one step, not hundreds; and manage context so per-step cost stays flat instead of growing with history. Track cumulative spend against a **budget cap** and fail the run loudly if it blows through — a runaway long-running agent is a runaway bill.",
      "The **human-handoff pattern** is the last piece and the reason 'durable pause' matters. Real long tasks need approval gates ('this migration touches auth — a human must review before I open the PR'). You do *not* want to hold a live process (and its cost) open for the hours until someone clicks approve. The durable pattern: reach the gate, **persist state, suspend the workflow, emit a notification**, and let the engine resume on the approval callback — asynchronous, non-blocking, and free while it waits. This is exactly what Temporal signals, Step Functions task tokens, and LangGraph interrupts implement. ==Orchestration is what turns a fragile long script into a production workflow: durable state, idempotent side effects, managed context, budget caps, and async human gates.==",
    ],
    keyPoints: [
      "**A long-running agent will be interrupted** (OOM, node rotation, deploy, timeout, or a multi-hour wait for approval). The whole discipline is: when it dies at step 180, don't lose steps 1–179. Short agents fit in one process's memory; long ones cannot.",
      "**Checkpointing is the core primitive:** persist state (scratchpad, tool results, plan, per-step done marker) to durable storage after each step, then rehydrate and resume from the last checkpoint on restart. State must live where the worker's death can't take it.",
      "**Durability protects your state; idempotency protects the world.** Resume alone re-does the crashed step — but external side effects (open PR, send email, charge card) must carry a stable key so a repeat is a no-op, or you double-fire. The duplicate-PR bug is this lesson.",
      "**Durable-execution engines give this for free:** Temporal (event-sourcing/replay reconstructs state, ordinary code), Step Functions (managed state machine, pay-per-transition), LangGraph (LLM-native graph state + human-in-the-loop interrupts).",
      "**Context accumulates over hours** and overflows/slows/degrades. Actively compact old turns, externalize bulky results to a pointer, and treat a durable scratchpad as source of truth — not one ever-growing message history.",
      "**Cost is a first-class failure mode:** each step re-sends context, so a 6-hour run costs real money and an un-checkpointed restart re-spends it. Checkpoint + manage context to keep per-step cost flat, and enforce a budget cap. Human gates suspend the workflow durably rather than blocking a paying live process.",
    ],
    recap: [
      "**Premise:** run long enough and you *will* be interrupted — survivability, not features, is the design center. Don't lose steps 1–179 when step 180 dies.",
      "**Checkpoint** state (scratchpad + tool results + plan + done marker) to durable storage each step → rehydrate → resume at step 180, not step 1.",
      "**Durability ≠ idempotency.** Resume redoes only the crashed step; external side effects need stable keys so 'open PR' twice opens it once — the duplicate-PR bug.",
      "**Engines:** Temporal (event-sourcing/replay), Step Functions (managed state machine), LangGraph (graph state + HITL interrupts) — so you don't hand-roll persistence.",
      "**Context bloats over hours** → compact old turns, externalize big results to pointers, keep a durable scratchpad as source of truth, not the raw transcript.",
      "**Cost is a failure mode:** per-step context re-send makes long runs expensive; an un-checkpointed restart re-spends it — budget-cap the run, suspend durably at human gates.",
    ],
    mcqs: [
      {
        question: "Your 6-hour migration agent was OOM-killed at step 180 and restarted from step 1, re-spending ~$60 of tokens AND re-opening PRs it had already opened. Which TWO mechanisms together address both problems?",
        options: [
          "Retry the whole workflow automatically from the beginning whenever a crash is detected, so no manual restart step is ever missed by anyone",
          "Checkpoint state to durable storage after each step so the agent rehydrates and resumes at step 180 instead of restarting at step 1",
          "Lower the model's temperature so its tool-calling decisions become more deterministic and repeatable across every restart of the workflow",
          "Give each external side effect, like opening a PR, a stable idempotency key so a repeated call becomes a no-op instead of a duplicate",
        ],
        correct: [1, 3],
        explanation: "Options B and D are both correct and address the two distinct root causes. The wasted re-work and re-spend comes from restarting at step 1 with no persisted state — checkpointing (B) fixes it by letting the agent rehydrate and resume at step 180. The duplicate PRs come from external side effects with no de-duplication — idempotency keys (D) fix it so a repeated side effect is a no-op. Durability protects your own state; idempotency protects the outside world; you need both. Option A just re-runs everything from step 1 again on the next crash, which is the exact behavior that caused the $60 waste — it adds no persistence. Option C addresses neither problem: determinism in tool-calling has no bearing on whether state survives a crash or whether a PR gets opened twice.",
      },
      {
        question: "Why does a multi-hour agent that appends every observation to one growing message history degrade, and what is the right response?",
        options: [
          "The model forgets its system prompt as history accumulates, so re-injecting it into the prompt every turn is what fixes the degradation",
          "The transcript keeps growing and overflows the window, raising per-step cost and latency — compact old turns and externalize results",
          "Long histories trip the provider's rate limits more often as they grow, so throttling the request rate is what resolves the degradation",
          "Nothing actually degrades as long as the context window is large enough, so picking a model with a much bigger window resolves it fully",
        ],
        correct: 1,
        explanation: "Option B is correct: because each step re-sends the entire history, an ever-growing transcript overflows the window, makes every subsequent call slower and more expensive, and injects noise that hurts quality. The fix is active context management — compact older turns, externalize bulky tool results to storage and keep only a pointer + summary, and treat a durable scratchpad/task list as the source of truth rather than the raw message log. Option A misdiagnoses it as forgetting the system prompt, which isn't the accumulation mechanism at all. Option C is wrong — the issue is context size and cost, not request-rate throttling. Option D is wrong because a bigger window only delays the problem: cost and latency still climb linearly with history and quality still degrades from noise, so window size alone doesn't fix it — active management does.",
      },
    ],
    takeaway: "A long-running agent will inevitably be interrupted, so it is engineered around survivability: checkpoint state to durable storage and resume from the last step (not from zero), make external side effects idempotent so replays don't double-fire, actively manage accumulating context (compact + externalize + durable scratchpad), and enforce budget caps with async, durable human-approval gates. Durable-execution engines — Temporal, Step Functions, LangGraph — provide this so you don't hand-roll persistence.",
  },

  "agent-design-challenge": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "In a system-design interview you're asked: 'Design an agent that autonomously handles Tier-1 customer support tickets end to end.' You could jump straight to 'it uses GPT-4 with some tools' — and lose the loop. The strong answer works a repeatable design framework out loud: nail the task and its success/failure criteria, then choose the loop, tools, memory, guardrails, and eval deliberately, justifying each against *this* task's stakes. The challenge exercises exactly that framework, and interviewers grade the reasoning, not the tool names.",
    explanation: [
      "Designing an agent is a **sequence of coupled decisions**, and the discipline is to make them in order rather than reach for defaults. A reusable spine: ==(1) Task & success criteria → (2) Loop & autonomy → (3) Tools → (4) Memory → (5) Guardrails → (6) Eval & observability.== Each decision is driven by the *stakes and shape of the task* defined in step 1, which is why you never start at 'which model' — the task determines everything downstream.",
      "**(1) Task & success criteria — do this first or everything after is guesswork.** Pin down: what does *done* mean, what does *failure* look like, and what's the **cost asymmetry**? A support bot that wrongly issues a refund is far worse than one that unnecessarily escalates to a human — so the design should bias toward escalation. Also decide the **autonomy level**: fully autonomous, human-in-the-loop (agent proposes, human approves), or human-on-the-loop (agent acts, human monitors). ==High-stakes + irreversible ⇒ lower autonomy.== For Tier-1 support: read-only answers can be autonomous; refunds/account changes need a human gate.",
      "**(2) Loop & autonomy — the control structure.** The core is *perceive → plan → act → observe*, repeated until a stopping condition. Key design choices: **stopping conditions** (explicit goal met, a `finish` tool called, or a **step/budget cap** to bound cost and prevent loops); **plan-then-act vs. interleaved** (decompose upfront vs. decide each step from the latest observation — interleaved is more robust to surprises, upfront planning is cheaper and more auditable); and whether a **single agent** suffices or you need **multi-agent** decomposition (usually don't — added coordination cost rarely pays off for Tier-1). Always cap steps: an uncapped loop is an unbounded bill and a runaway.",
      "**(3) Tools — the agent's action surface, and least-privilege is the rule.** Give the agent *exactly* the tools the task needs and no more, because every tool is attack surface and error surface. Prefer **structured API/function tools** (typed, transactional, unambiguous results) over computer use whenever an API exists. Mark **irreversible tools** (issue_refund, close_account) explicitly and route them through a confirmation gate. For support: `search_kb`, `get_order_status`, `escalate_to_human` can be autonomous; `issue_refund` is gated. ==A tool the agent doesn't have is a failure mode it can't have.==",
      { type: "illustration", label: "The design framework applied to the Tier-1 support agent", content: `TASK        resolve Tier-1 tickets; success = correct resolution or clean escalation
            cost asymmetry = wrong refund >> unnecessary escalation  → bias to escalate
AUTONOMY    read/answer: autonomous · refund/account change: human-in-the-loop gate
LOOP        perceive ticket → plan → act (tool) → observe → repeat
            stop when: resolved | escalated | step cap (e.g. 8) hit
TOOLS       search_kb(), get_order_status(), escalate_to_human()   ← autonomous
            issue_refund(), change_account()                       ← GATED (confirm)
MEMORY      short-term: this ticket's conversation (working context)
            long-term:  RAG over KB + past tickets (retrieve, don't memorize)
            episodic:   customer history fetched by id
GUARDRAILS  input: prompt-injection filter on user text  · scope: refuse off-domain
            output: PII redaction, tone check  · action: confirm before refund
            fallback: on low confidence or cap hit → escalate_to_human (safe default)
EVAL        offline: ticket replay set w/ graded resolutions
            online:  resolution rate, escalation rate, wrong-action rate, cost/ticket
            observ.: full trace logging (every tool call) for debugging + audit` },
      "**(4) Memory — match the type to what the task must remember.** Distinguish **short-term/working** (this conversation's context — always needed), **long-term semantic** (knowledge the agent shouldn't hold in weights — implement as **RAG/retrieval** over a KB/vector store so answers are grounded and updatable), and **episodic** (per-user history fetched by id). The design error to avoid: cramming everything the agent might need into one giant prompt. ==Retrieve knowledge on demand; don't try to memorize it in context.== For support, RAG over the knowledge base plus per-customer history covers it; no need for a persistent cross-session 'learned' memory at Tier-1.",
      "**(5) Guardrails — layered, because a single check will be bypassed.** Design them at four layers: **input** (prompt-injection filtering on untrusted user text — the ticket body is an attacker-controlled channel), **scope** (refuse off-domain or out-of-policy requests), **output** (PII redaction, tone/safety checks before replying), and **action** (confirmation gates on irreversible tools). Crucially, define the **fallback**: when confidence is low or a guardrail trips or the step cap is hit, the agent should **escalate to a human** — the safe default that the cost asymmetry from step 1 demanded. ==A guardrail without a defined fallback just blocks; with one it degrades gracefully.==",
      "**(6) Eval & observability — you cannot ship what you can't measure, and agents fail silently.** Design eval *up front*, not after: an **offline** graded replay set (curated tickets with known-good resolutions) to catch regressions before deploy, and **online** metrics tied to the success criteria — resolution rate, escalation rate, **wrong-action rate** (the dangerous one, given the cost asymmetry), and cost per ticket. Underpin both with **full trace logging** — every tool call, decision, and observation — so failures are debuggable and auditable. The interview tell of a strong candidate: they close the loop by naming *how they'd know it's working* and *how they'd catch it failing*, and they justify every choice against the task's stakes rather than reciting a stack.",
    ],
    keyPoints: [
      "**Design in order, driven by the task:** (1) task & success criteria → (2) loop & autonomy → (3) tools → (4) memory → (5) guardrails → (6) eval. Never start at 'which model'; the task's stakes and cost asymmetry drive every downstream choice.",
      "**Success criteria + cost asymmetry come first.** Define *done*, define *failure*, and note which errors are worse (wrong refund ≫ unnecessary escalation). High-stakes/irreversible ⇒ lower autonomy (human-in-the-loop). This single step sets autonomy, guardrails, and the safe fallback.",
      "**Loop = perceive→plan→act→observe with an explicit stopping condition and a step/budget cap.** Uncapped loops are unbounded cost and runaways. Single-agent by default; add multi-agent only when decomposition clearly pays for its coordination cost.",
      "**Tools = least privilege.** Give exactly what the task needs; prefer structured API/function tools over computer use; mark irreversible tools and gate them behind confirmation. A tool the agent lacks is a failure mode it can't have.",
      "**Memory = right type for the need:** short-term working context always; long-term knowledge via RAG/retrieval (grounded, updatable) not stuffed in the prompt; episodic per-user history by id. Retrieve on demand; don't memorize.",
      "**Guardrails are layered (input/scope/output/action) with a defined fallback** — escalate-to-human on low confidence, tripped guardrail, or cap hit. And design **eval up front**: offline replay set + online metrics (resolution, escalation, wrong-action, cost) + full trace logging. Closing on 'how I'd know it works/fails' is the interview tell.",
    ],
    recap: [
      "**Framework spine:** task & success → loop & autonomy → tools → memory → guardrails → eval. Order matters — the task drives all of it.",
      "**Step 1 sets the rest:** define done/failure + cost asymmetry (wrong refund ≫ over-escalation) → pick autonomy level and the safe fallback.",
      "**Loop:** perceive → plan → act → observe, explicit stop + step/budget cap; single-agent unless decomposition earns its coordination cost.",
      "**Tools:** least privilege, prefer structured APIs, gate irreversible actions behind confirmation.",
      "**Memory:** working context + RAG for knowledge (don't memorize) + episodic per-user history.",
      "**Guardrails layered** (input/scope/output/action) with an escalate-to-human fallback; **eval designed up front** (offline replay + online metrics + trace logging).",
    ],
    mcqs: [
      {
        question: "You're designing a Tier-1 support agent where a wrongly-issued refund is far more damaging than an unnecessary escalation to a human. Which design decision most directly follows from that cost asymmetry?",
        options: [
          "Give the agent full autonomy over refunds so it resolves tickets faster and reduces the human support team's load significantly",
          "Remove the escalation path entirely so the agent must resolve every single ticket itself without ever deferring to a human agent",
          "Gate the refund tool behind human confirmation and make escalate-to-human the fallback on low confidence or a tripped guardrail",
          "Raise the step cap so the agent can keep retrying the refund internally until its own confidence score is finally high enough",
        ],
        correct: 2,
        explanation: "Option C is correct: when one failure mode (wrong refund) is far costlier than another (unnecessary escalation), the design should bias errors toward the cheaper one — lower autonomy on the high-stakes irreversible action by gating the refund behind human confirmation, and make escalate-to-human the safe fallback whenever the agent is uncertain or a guardrail trips. Option A does the opposite, maximizing exposure to the expensive failure. Option B removes the very safety valve the asymmetry calls for, forcing the agent to act even when it shouldn't. Option D lets the agent keep attempting the dangerous action itself and raises cost/runaway risk without addressing the asymmetry — more internal retries on an irreversible action is more exposure, not less.",
      },
      {
        question: "A candidate designs the support agent by putting the entire knowledge base into the system prompt and giving the agent every internal tool 'so it's flexible.' Which TWO choices are the clearest design errors?",
        options: [
          "Putting the entire knowledge base into the system prompt instead of RAG, which can't be updated without a redeploy and bloats context",
          "Choosing a single agent instead of decomposing into a multi-agent system for better ticket-handling parallelism across the whole support team",
          "Designing the evaluation plan up front instead of waiting until after launch to define resolution and escalation success metrics later",
          "Giving the agent every internal tool 'for flexibility' instead of least-privilege, exposing ungated irreversible refund actions",
        ],
        correct: [0, 3],
        explanation: "Options A and D are both correct and are the two classic errors here. Stuffing the whole KB into the prompt (A) is the memory mistake — it can't be updated without a redeploy, bloats context, and degrades quality; the right pattern is RAG so knowledge is retrieved on demand and stays current. Giving the agent every tool (D) violates least-privilege — each extra tool is attack and error surface, and exposing irreversible tools without confirmation gates is dangerous; the agent should get exactly what the task needs. Option B is wrong: single-agent is the right default for this task, not an error — multi-agent decomposition rarely pays for its coordination cost here. Option C is wrong: designing eval up front is good practice, not a mistake — the actual errors in the scenario are about memory and tools, not evaluation timing.",
      },
    ],
    takeaway: "Design an agent as an ordered chain driven by the task: define success/failure and cost asymmetry first, then choose the loop (with an explicit stop + step cap), least-privilege tools (structured APIs, gated irreversible actions), the right memory types (working context + RAG + episodic, not a memorized prompt), layered guardrails with an escalate-to-human fallback, and up-front eval (offline replay + online metrics + trace logging). Interviewers grade the reasoning and whether you justify each choice against the task's stakes — and whether you close on how you'd know it's working.",
  },

  "agent-loop-simulator": {
    depthTier: "core",
    interviewWeight: "high",
    scenario: "Someone asks you to explain 'how an AI agent actually works' — not the marketing version. You could wave at 'it's an LLM with tools,' but the real answer is a specific control loop: the model observes, decides one action, the runtime executes it, feeds the result back, and repeats until a stopping condition fires. Getting this loop exactly right — including its termination conditions and budget caps — is the difference between an agent that completes a task and one that spins forever, loops on a failing tool, or quits early. The simulator steps you through real traces of this loop; here is the loop it visualizes, rigorously.",
    explanation: [
      "An agent is not a single model call — it is a **control loop wrapped around a model**. The loop has four phases: ==perceive (take in the current observation/state) → plan (the model reasons and decides the next action) → act (the runtime executes that action — usually a tool call) → observe (feed the result back in), then repeat.== The crucial structural fact: the **model itself is stateless and does not act**. It only emits text/structured output. The **runtime** (the agent harness, not the LLM) is what parses that output, actually executes the tool, appends the result to the context, and calls the model again. Confusing 'the model' with 'the agent' is the most common conceptual error — the agent is the loop; the model is one component inside it.",
      "One iteration is a **turn**. On each turn the model receives the accumulated context (system prompt + goal + history of prior actions and their results) and produces one of two things: **an action** (a tool call — 'search_kb(\"refund policy\")') or a **terminal output** (a final answer, or a `finish`/`done` signal). If it's an action, the runtime executes it, captures the result (the *observation*), appends `action → observation` to the history, and loops. ==This append is why the agent 'remembers' across turns: memory is the growing context, not model state.== The model on turn 5 knows what happened on turns 1–4 only because those results were appended to the context it's re-shown.",
      { type: "illustration", label: "One full pass of the agent control loop (ReAct-style trace)", content: `GOAL: "Is order #8821 eligible for a refund?"

turn 1  PERCEIVE  context = [system, goal]
        PLAN      model → "I need the order status."  action: get_order_status(8821)
        ACT       runtime executes tool
        OBSERVE   result: {status:'delivered', days_since:40}  → appended to context

turn 2  PERCEIVE  context = [system, goal, turn-1 action+result]
        PLAN      model → "40 days > 30-day window. Check policy."  action: search_kb("refund window")
        ACT       runtime executes tool
        OBSERVE   result: "Refunds allowed within 30 days of delivery." → appended

turn 3  PERCEIVE  context = [ ...all prior... ]
        PLAN      model → goal satisfied → TERMINAL OUTPUT (not an action):
                  "Not eligible: delivered 40 days ago, past the 30-day window."
        ACT       none — the runtime detects a final answer → STOP

Key: the model NEVER touched the database. The RUNTIME executed each tool and
fed results back. The model only decided WHAT to do and WHEN to stop.` },
      "**Stopping conditions are the part everyone underestimates, and there are four kinds.** (1) **Goal reached** — the model emits a final answer / calls `finish`; this is the *intended* exit. (2) **Step cap (max iterations)** — a hard limit (e.g. 10 turns) that fires regardless of progress. (3) **Budget cap** — a limit on tokens or dollars spent, since each turn re-sends the growing context and costs money. (4) **Error/failure exit** — e.g. the same tool failing repeatedly. ==A loop with only condition (1) is a bug, not an agent.== The model can be wrong about whether the goal is met, so the harness — not the model — must enforce (2)–(4) as safety rails.",
      "Two pathologies motivate those caps, and they're the loop's characteristic failure modes. **Looping / non-termination**: the agent repeats the same failing action forever — calls a tool, it errors, it calls the same tool again, never adapting — burning tokens with no progress. The step cap and 'same-action-N-times' detection exist precisely to break this. **Premature termination**: the agent decides it's done before the goal is actually met (declares success on partial results). ==The step cap bounds the first failure; good stopping *criteria* and verification bound the second — they are different problems needing different rails.== Note the tension: too low a cap causes premature stops on legitimately long tasks; too high a cap lets runaway loops run up the bill. The cap is a deliberate budget/risk tradeoff, not a default.",
      "**Planning granularity** is the loop's main design axis. **Interleaved (ReAct-style)**: plan *one* action, observe, then decide the next from the fresh result — reactive and robust to surprises, because each decision uses the latest observation, but it makes more model calls. **Plan-then-execute**: the model produces a full multi-step plan up front, then the runtime executes the steps — cheaper and more auditable, but brittle if reality diverges from the plan (a failed step three invalidates steps four onward). ==Most production agents interleave for robustness== and re-plan when observations contradict the plan. The four-phase loop is the same either way; only *how much the model commits to per plan step* changes.",
      "Put together, the loop is the whole engine and every agent capability hangs off it: **tools** are the action space the *act* phase can invoke; **memory** is the context that the *perceive* phase re-shows and the *observe* phase appends to; **guardrails** are checks the runtime runs between *plan* and *act* (e.g. confirm before an irreversible action); **stopping conditions** are how the runtime decides when to exit. ==The interview-grade summary: an agent is a stateless model driven by a stateful runtime around perceive→plan→act→observe, terminated by explicit goal/step/budget/error conditions — and the runtime, not the model, owns termination and safety.== Master this and every other agent topic (computer use, long-running, design) is a variation on where in this loop the hard part lives.",
    ],
    keyPoints: [
      "**An agent is a control loop around a stateless model:** perceive → plan → act → observe, repeated. The model only *decides* (emits an action or a terminal output); the **runtime** executes tools, appends results, and re-calls the model. The agent is the loop; the model is one component.",
      "**Memory is the growing context, not model state.** Each turn appends `action → observation` to the history the model is re-shown, which is the only reason turn 5 'remembers' turns 1–4. The model itself carries nothing across turns.",
      "**Four stopping conditions, and only the first is 'intended':** (1) goal reached / `finish`, (2) step cap (max iterations), (3) budget cap (tokens/$), (4) error exit (repeated tool failure). A loop with only (1) is a bug — the runtime must enforce (2)–(4).",
      "**Two characteristic failures need different rails:** non-termination/looping on a failing action (bounded by step caps + repeat detection) vs. premature termination declaring success too early (bounded by good stopping criteria + verification). Cap too low → premature stops; too high → runaway bills.",
      "**Planning granularity is the design axis:** interleaved/ReAct (one action at a time, robust, more calls) vs. plan-then-execute (upfront plan, cheaper/auditable, brittle to divergence). Most production agents interleave and re-plan; the four-phase loop is identical either way.",
      "**Every capability hangs off the loop:** tools = the *act* action space; memory = the *perceive*/*observe* context; guardrails = checks between *plan* and *act*; stopping conditions = the runtime's exit logic. The runtime — not the model — owns termination and safety.",
    ],
    recap: [
      "**Loop:** perceive → plan → act → observe, repeat. The **model decides**; the **runtime executes tools, appends results, and re-calls** — the model is stateless.",
      "**Memory = the appended context** — turn 5 only 'remembers' because turns 1–4's results were re-shown to it.",
      "**Stopping conditions (4):** goal/`finish` · step cap · budget cap · error exit. Only goal is the intended exit — the runtime enforces the other three.",
      "**Two failure modes, two rails:** looping/non-termination (→ step cap + repeat detection) vs. premature termination (→ stopping criteria + verification). Cap too low stops early; too high runs away.",
      "**Planning axis:** interleaved ReAct (robust, more calls) vs. plan-then-execute (cheap, brittle). Production usually interleaves and re-plans.",
      "**Everything hangs off the loop:** tools = act space, memory = perceive/observe context, guardrails = plan→act checks, stopping = runtime exit.",
    ],
    mcqs: [
      {
        question: "Which TWO statements correctly describe how the model and the runtime divide responsibility in the agent control loop?",
        options: [
          "The runtime decides which action to take next, and the model merely executes that decision directly against external systems and every API",
          "The model only decides the next action or a terminal output from the context it's shown, and the model itself is fully stateless",
          "The runtime is the stateful component that executes tools, appends each observation to history, and re-calls the model until it stops",
          "The model executes tool calls directly and retains its own state across turns, while the runtime only displays results to the user",
        ],
        correct: [1, 2],
        explanation: "Options B and C are both correct and together describe the full division of labor: the model (B) is stateless and only emits a decision — an action such as a tool call, or a terminal output — based on the context it's re-shown; it never executes anything itself. The runtime (C) is the stateful harness that parses that output, actually executes the tool, appends the observation to the growing history, and calls the model again, repeating perceive→plan→act→observe until a stopping condition fires. Option A inverts the roles — the model decides, the runtime executes, not the other way around. Option D is wrong on both counts: the model does not execute tools and does not carry state across turns; memory lives in the appended context the runtime maintains, not in the model.",
      },
      {
        question: "An agent calls a tool, the tool errors, and the agent calls the exact same tool again and again, never adapting, burning tokens indefinitely. What is happening and what is the correct guard?",
        options: [
          "This is premature termination — the agent quit too early — so the fix is lowering the step cap to make it stop even sooner next time",
          "This is normal, fully expected agent behavior needing no guard at all; it will eventually succeed once given enough more turns to work with",
          "This is a memory overflow problem; the fix is clearing the context every turn so the agent forgets the tool error and starts fresh",
          "This is non-termination on a failing action; the runtime must enforce a step cap plus repeated-action detection to break the loop",
        ],
        correct: 3,
        explanation: "Option D is correct: repeating the same failing action forever is the classic non-termination/looping failure, and because the model can't be relied on to break out on its own, the runtime must impose hard rails — a step cap, ideally repeated-action detection, and a budget cap on tokens or dollars — precisely so a stuck loop can't run up an unbounded bill. Option A misnames it as premature termination, which is the opposite failure — stopping too early, not looping forever. Option B is dangerously wrong: an unadapting loop on a failing tool won't spontaneously succeed and will keep spending. Option C misdiagnoses it as memory overflow; clearing context each turn would destroy the agent's ability to learn from the error and wouldn't stop the repeated calls.",
      },
    ],
    takeaway: "An agent is a stateless model driven by a stateful runtime around a four-phase control loop — perceive → plan → act → observe — where the model only decides and the runtime executes tools, appends observations (which is the agent's memory), and re-calls until a stopping condition fires. Termination is owned by the runtime via four conditions (goal, step cap, budget cap, error exit), guarding against looping and premature stops; planning is interleaved (ReAct) or plan-then-execute, and every other agent capability — tools, memory, guardrails — is a slot in this loop.",
  },
};
