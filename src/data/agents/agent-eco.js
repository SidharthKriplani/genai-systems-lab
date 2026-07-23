// Agent-topic RUNNER_DATA — ECOSYSTEM group. Keep export name RUNNER_AGENT_ECO.
export const RUNNER_AGENT_ECO = {
  "agent-frameworks": {
    depthTier: "core",
    interviewWeight: "high",
    groundUp: "Here's an uncomfortable fact about the agent you've been building since the start of this gym: its core is about thirty lines of code. A loop that sends messages to a model, executes whatever tool it requests, appends the result, and stops when a final answer comes back. That smallness sets up a real dilemma the moment requirements grow — several agents handing work to each other, retries when a step fails, resuming after a crash, a record of every step you can inspect afterward. Keep hand-rolling and you're building a durable state machine by hand; adopt heavy machinery and you may be buying complexity you don't need. The way out is noticing that 'framework or no framework' is the wrong question. The right one: which concerns *surrounding* the loop does your system actually have, and is someone else's abstraction of them worth its cost?\n\nThe first thing to get straight is that the tools in this space are not competitors — they sit at different layers of the stack. Some own control flow across steps and agents: persistent shared state, conditional branching, cycles, pause-for-human-approval, checkpoint-and-resume. That layer is **orchestration**, where **LangGraph** and **AutoGen** live. Some are glue for wiring models, prompts, retrievers, and tools into reusable components — **LangChain**. Some hand you an opinionated, batteries-included agent loop with tool-calling, handoffs, and guardrails pre-wired: **runtime SDKs** like the **OpenAI Agents SDK**, **Google ADK**, and **CrewAI**, each tuned to one model family or one mental model. And some simply watch whatever loop you run, recording traces you can replay and evaluate — **observability**, which is **LangSmith**'s job. Treating these as rivals is a category error, and a classic interview trap.\n\nWhat a framework abstracts away is the boring, bug-prone code that's identical across agents: the state machine, retry and error semantics, persistence, streaming and trace plumbing. The value scales with the complexity of your control flow, not with whether the thing is 'an agent' — a single linear tool-calling loop gains almost nothing and pays real overhead, while a multi-agent system with handoffs and resume-after-crash gets weeks of hardened code for free. The costs are just as concrete: a hand-rolled loop is a stack trace you can read top to bottom, while a heavy framework can leave you debugging *its* execution model instead of your code; logic expressed as framework primitives makes migration a rewrite — which is what **lock-in** actually means; provider-tuned SDKs couple you to one model family; and young, fast-moving libraries break APIs between minor versions.\n\nThis module gives you the layer map, the cost ledger, and heuristics for choosing by the shape of the problem, then lets you pressure-test them in the Framework Landscape interactive and against the closing case. By the end you'll be able to do what a senior engineer does in a design review: name the concerns your system actually has, map each to the layer that owns it, and justify the abstraction's cost in both directions.",
    scenario: "You inherit a prototype: 200 lines of Python that call the model, parse a tool call, run it, and loop — a hand-rolled ReAct agent. It works for the demo. Leadership now wants five agents that hand off to each other, retry on failure, resume after a crash, and stream traces to a dashboard. An engineer proposes rewriting everything on LangGraph; another says frameworks are 'lock-in' and you should keep hand-rolling. You have to decide what a framework actually buys you here — and where it costs you.",
    explanation: [
      "Strip an agent framework to its core and the thing it wraps is embarrassingly small: **an agent is a while-loop around a model call**. Send messages to the model; if it emits a tool call, execute the tool and append the result; if it emits a final answer, stop. That loop is ~30 lines. Everything a framework adds sits *around* that loop, not inside it — which is exactly why the 'just hand-roll it' argument is seductive and also why it stops being true past a certain complexity.\n\nThe useful question is never 'framework or no framework' in the abstract. It is: ==which of the surrounding concerns does this system actually have, and is a framework's abstraction of them worth the abstraction's cost?==",
      "Frameworks in this space are **not interchangeable — they operate at different layers of the stack**, which is the single most common point of confusion (and interview trap). Naming them together as if they compete is a category error:\n\n**Orchestration** (LangGraph, AutoGen) — control flow across multiple steps or agents: state that persists between nodes, conditional edges, cycles, human-in-the-loop interrupts, checkpoint/resume. This is the layer you reach for when the *shape of the computation* is the hard part.\n\n**Tool/chain abstraction** (LangChain) — glue for wiring models, prompts, retrievers, and tools into reusable components. Solves 'I keep re-writing the same RAG plumbing.'\n\n**Runtime / batteries-included agents** (OpenAI Agents SDK, Google ADK, CrewAI) — an opinionated agent loop with tool-calling, handoffs, and guardrails already wired, tuned for one model family (OpenAI, Gemini) or one mental model (CrewAI's role-playing crews).\n\n**Observability** (LangSmith) — tracing, eval, and replay. Orthogonal to all of the above; it watches whatever loop you run.",
      "So what does a framework abstract *away*? Concretely: **the state machine, the retry/error semantics, the persistence layer, and the streaming/trace plumbing** — the boring, bug-prone code that is identical across agents and easy to get subtly wrong. LangGraph's whole pitch is modeling the agent as an explicit graph of nodes with a typed shared `state`, so 'pause for human approval, then resume from exactly here after a crash' becomes a checkpointer config instead of a hand-built durable state machine.\n\n==The value scales with control-flow complexity, not with 'is it an agent.'== A single linear tool-calling agent gets almost nothing from LangGraph and pays real complexity for it. A five-agent system with handoffs, retries, and resume-after-crash gets a great deal — hand-rolling that correctly is a multi-week project of exactly the code the framework already hardened.",
      { type: "illustration", label: "The loop is small; the framework wraps what surrounds it", content: `THE AGENT (what you'd hand-roll — ~30 lines):
  while not done:
      resp = model(messages)              # 1. think
      if resp.tool_calls:
          for call in resp.tool_calls:
              result = run_tool(call)      # 2. act
              messages.append(result)      # 3. observe
      else:
          done = True                      # 4. stop

WHAT A FRAMEWORK ADDS AROUND IT (the expensive part):
  • state machine ...... typed shared state across nodes/agents
  • control flow ....... conditional edges, cycles, parallel branches
  • persistence ........ checkpoint after each step -> resume after crash
  • human-in-loop ...... interrupt(), wait for approval, resume
  • retries/errors ..... per-step retry budgets, error routing edges
  • handoffs ........... agent A delegates to agent B with shared context
  • streaming/traces ... token + step streaming, LangSmith spans

Rule of thumb:
  linear single agent, 1-5 tools  -> hand-roll (framework = pure overhead)
  multi-step / multi-agent / resume/HITL -> framework earns its cost` },
      "The costs are real and worth naming precisely, because 'lock-in' is used too loosely. **Debuggability** is the sharpest one: a hand-rolled loop is a stack trace you can read top to bottom. A heavy framework can bury the actual control flow under abstraction layers, so when an agent misbehaves you are debugging *the framework's* execution model, not your code — this is the single most common real complaint about LangChain/LangGraph in production.\n\n**Lock-in** is concrete, not vibes: the more your business logic is expressed *as* framework primitives (nodes, edges, chains, crews), the more a migration is a rewrite, not a swap. **Model-coupling** is a specific sub-case: OpenAI Agents SDK and Google ADK are tuned to one provider — great until you need a second model family. And **version churn** is a genuine tax: these are young, fast-moving libraries whose APIs break between minor versions.",
      "The senior move is to pick by the *shape of the problem*, and the Framework Landscape interactive lets you pressure-test that against a real use case rather than a benchmark. The heuristics worth internalizing:\n\n**Reach for orchestration (LangGraph/AutoGen)** when control flow is the hard part — multi-agent handoffs, cycles, resume-after-crash, human approval gates. **Reach for a runtime SDK (OpenAI/ADK/CrewAI)** when you want a batteries-included loop fast and are comfortable inside one model family or one paradigm. **Add LangSmith regardless** — observability is orthogonal and you want traces the moment anything is non-trivial. **Hand-roll** when the loop is genuinely linear and you value a readable stack trace over saved plumbing.\n\n==The interview-grade answer is never 'always use X.' It is: name the surrounding concerns this system has, map each to the layer that owns it, and justify the abstraction cost.==",
    ],
    keyPoints: [
      "**An agent is a while-loop around a model call (~30 lines); frameworks wrap what *surrounds* the loop** — the state machine, persistence, retries, handoffs, and trace plumbing. The value scales with control-flow complexity, not with 'is it an agent.'",
      "**These tools operate at different layers, not in competition.** Orchestration (LangGraph, AutoGen) = control flow; tool/chain glue (LangChain) = RAG/tool plumbing; runtime SDKs (OpenAI Agents SDK, ADK, CrewAI) = batteries-included loop; observability (LangSmith) = tracing. Naming them as rivals is a category error.",
      "**Frameworks earn their cost when the *shape of the computation* is hard** — multi-agent handoffs, cycles, human-in-the-loop, resume-after-crash. A linear single-tool agent gets almost nothing from LangGraph and pays real complexity for it.",
      "**Debuggability is the sharpest cost:** a hand-rolled loop is a readable stack trace; a heavy framework makes you debug *its* execution model. This is the #1 real production complaint about LangChain/LangGraph.",
      "**Lock-in is concrete, not vibes:** the more your logic is expressed *as* framework primitives (nodes/edges/chains/crews), the more migration is a rewrite. Model-coupling (OpenAI SDK, ADK tied to one provider) and version churn are specific sub-costs.",
      "**Pick by the shape of the problem:** orchestration for complex control flow, a runtime SDK for a fast batteries-included loop in one model family, LangSmith for observability regardless, hand-roll when the loop is genuinely linear.",
    ],
    recap: [
      "**The agent is a ~30-line loop; the framework wraps what surrounds it** — state, persistence, retries, handoffs, traces.",
      "**Different layers, not rivals:** LangGraph/AutoGen = orchestration, LangChain = tool/chain glue, OpenAI SDK/ADK/CrewAI = runtime, LangSmith = observability.",
      "**Framework earns its cost** on multi-agent handoffs, cycles, HITL, resume-after-crash; **hand-roll** a linear single-tool loop.",
      "**Costs:** debuggability (now debugging the framework's execution model), lock-in (logic-as-primitives → rewrite to migrate), model-coupling, version churn.",
      "**Never 'always use X'** — name the surrounding concerns, map each to the layer that owns it, justify the abstraction cost.",
    ],
    mcqs: [
      {
        question: "A teammate argues 'LangGraph, LangChain, and LangSmith all do the same thing — pick one.' What is the most accurate correction?",
        options: [
          "LangGraph, LangChain, and LangSmith sit at different layers: LangGraph orchestrates control flow, LangChain glues tools/prompts, LangSmith observes traces — teams run all three together.",
          "LangGraph is really a newer rebrand of LangChain aimed at the same orchestration problem, so once a team adopts LangGraph the older LangChain layer becomes redundant and should be retired.",
          "All three compete for the same orchestration role, and LangSmith is the strongest pick because its tracing and eval tooling is the most mature of the group, so it should be the default choice.",
          "The three tools are distinguished mainly by which model provider each one supports, so the right choice depends primarily on whether the team has standardized on OpenAI, Anthropic, or Gemini.",
        ],
        correct: 0,
        explanation: "Option A is correct: the three tools sit at distinct layers of the agent stack. LangGraph models control flow and shared state (orchestration), LangChain provides reusable model/prompt/tool/retriever glue, and LangSmith adds tracing, eval, and replay (observability) — you commonly run all three together, so they compose rather than compete. Option B is wrong because LangGraph is not a rebrand of LangChain; it is a separate orchestration layer that can use LangChain components alongside it. Option C is wrong because LangSmith is observability, orthogonal to orchestration and glue — it is not a substitute for either, so 'always choose it' is a category error. Option D is wrong because these three are largely LLM-agnostic; provider coupling is a property of runtime SDKs like OpenAI Agents SDK and Google ADK, not of this trio.",
      },
      {
        question: "You have a single linear agent that calls 2–3 tools in sequence and returns an answer — no handoffs, no resume, no approval gates. An engineer wants to build it on LangGraph 'to be production-grade.' Which two statements accurately describe the trade-off?",
        options: [
          "LangGraph cannot execute a simple linear tool-calling sequence at all, so the agent as designed would fail to run under this framework entirely and immediately.",
          "A linear single-agent loop with only a couple of tools gains almost nothing from LangGraph's control-flow machinery, with no handoffs or resume points to model.",
          "Adopting LangGraph here still carries a real cost: debugging gets harder, since you reason about the framework's execution model, not a linear stack trace.",
          "Frameworks like LangGraph should be avoided in every case, since a hand-rolled loop is strictly superior regardless of how complex the control flow eventually gets.",
        ],
        correct: [1, 2],
        explanation: "Options B and C are correct together: an agent framework earns its cost through the surrounding concerns — state machines, persistence, retries, handoffs, HITL, resume-after-crash. A genuinely linear single-agent loop with a few tools has none of those, so it gains almost nothing from LangGraph (option B) while still paying real costs like harder debugging, since you're now reasoning about the framework's execution model instead of a readable stack trace (option C). Option A is wrong because LangGraph can express linear flows fine — the objection is cost/benefit, not capability. Option D overreaches — frameworks are the right call once control flow gets complex (multi-agent, resume, HITL); the point is to match the tool to the problem's shape, not to reject frameworks universally.",
      },
      {
        question: "A team ran their production agent on LangGraph for two years, then migrated to a hand-rolled loop. Even though the agent's logic didn't conceptually change, the migration took six weeks of rewriting. What cost does this best illustrate, and how does it differ from the other named costs?",
        options: [
          "This is lock-in: the agent's logic was expressed as LangGraph nodes and edges, so leaving the framework meant rewriting that logic in a different form — not swapping a drop-in dependency.",
          "This is model-coupling: the team was tied to a single model provider, and switching providers is what actually consumed the six weeks of engineering time.",
          "This is version churn: LangGraph's breaking API changes between minor versions directly caused the six-week rewrite, independent of what the agent's logic was expressed as.",
          "This proves frameworks are strictly worse than hand-rolling on any timeline, since even a mature two-year-old production system eventually has to be rewritten regardless of its shape.",
        ],
        correct: 0,
        explanation: "Option A is correct: lock-in is defined by how much business logic is expressed *as* framework primitives — nodes, edges, chains — so removing the framework means rewriting that logic, not just changing an import; six weeks of rewriting for logic that didn't conceptually change is exactly that cost. Option B misapplies model-coupling, which is the specific problem of being tied to one model provider (OpenAI Agents SDK, Google ADK) — nothing in this scenario involves switching model providers. Option C misapplies version churn, which is the tax of staying on a framework across breaking minor-version changes, not the cost of leaving it entirely. Option D overreaches: the module's point is matching the tool to the shape of the problem, not that frameworks are universally inferior — a five-agent system with resume-after-crash still gets real value from LangGraph while it's in production.",
      },
    ],
    takeaway: "An agent is a ~30-line while-loop; frameworks wrap what surrounds it (state, persistence, retries, handoffs, traces), and they live at different layers — LangGraph/AutoGen orchestrate, LangChain glues, OpenAI SDK/ADK/CrewAI are runtimes, LangSmith observes. Reach for a framework when control flow is the hard part; hand-roll a linear loop. The costs are concrete: debuggability, lock-in, model-coupling, version churn.",
  },
  "agent-mcp": {
    depthTier: "core",
    interviewWeight: "high",
    groundUp: "The frameworks module sorted out the inside of an agent; this puzzle lives outside it. You build a genuinely useful tool — clean schema, careful auth handling, a well-worded description — and wire it into one app through function calling, the inline tool definitions you already know. It works beautifully. Then a second application wants that same tool. Then a third, on a different model family. Each new home means re-implementing the schema, the auth, and the error behavior from scratch, and every copy drifts a little out of sync. The arithmetic is the killer: N tools times M hosts is NxM bespoke integrations. Mature industries hit this wall and respond the same way every time — agree on one standard interface between producers and consumers, and the count collapses to N+M. For agent tools, that standard is the **Model Context Protocol (MCP)**, an open protocol Anthropic introduced in late 2024 — the same move USB made for peripherals.\n\nMCP's shape is a client/server split with three roles. The application the user touches, which owns the model and the UI, is the **host**. Inside it, one connector per connection speaks the protocol: the **client**. The capability itself lives in a separate process, the **server** — and here's the security story in one line: the server owns its own credentials, and the host never sees them. Your database password lives in one server, not in every app that queries it. On the wire, messages are named calls and responses encoded as JSON — a convention called **JSON-RPC 2.0** — carried either through the pipes of a locally launched subprocess (**stdio**) or over web connections that push streams of events (**HTTP with SSE**). And a host never hardcodes what a server offers: it asks at connection time, discovering capabilities dynamically.\n\nThose capabilities come in four flavors. Functions the model calls to *do* things — run a search, create a ticket — are **Tools**: function calling, but defined server-side. Data the model can *read*, addressed by a web-style identifier called a URI, is a **Resource**. Reusable, parameterized prompt templates that hosts surface as slash commands are **Prompts**. And in one neat inversion, a server can ask the *host* to run a model completion on its behalf — **Sampling** — getting language-model help without holding its own API key. Just as important is what MCP is not: it doesn't replace the model's ability to call tools, and it isn't a runtime or a framework — it standardizes how capabilities are described, discovered, and reached, and says nothing about your agent loop.\n\nThis module walks that architecture end to end, with a deep-dive interactive for each primitive, and settles the comparison every architecture review raises: MCP versus plain function calling, which turns out to be a question of scope, not quality. By the end you'll hold the decision rule cold — one tool in one app, inline function calling; the same tools across many hosts and teams, MCP — and you'll describe the protocol precisely, roles and wire format and primitives, rather than waving at 'a standard for tools.'",
    scenario: "Your company has a web-search tool, a Postgres tool, and an internal-ticketing tool. You wired them into your Claude-based agent via function calling. Now the platform team wants those same three tools available inside Cursor for engineers, inside a Slack bot, and inside a future Gemini-based agent. The obvious path is to re-implement each tool integration in each host — three tools times four hosts is twelve bespoke integrations, each with its own auth handling and schema drift. You need an architecture that makes 'write the tool once, use it everywhere' true.",
    explanation: [
      "The pain in the scenario is the **N×M integration problem**: N tool services × M LLM hosts = N×M bespoke integrations, each re-implementing schemas, auth, and error handling. **Model Context Protocol (MCP) collapses that to N+M** by inserting a standard interface between producers and consumers of tools — the same move USB did for peripherals or LSP did for editor/language-server pairs. ==You write the tool once as an MCP server, and any MCP-compatible host speaks to it without custom glue.==\n\nMCP is an open protocol (introduced by Anthropic, late 2024) with a specific, learnable shape. The interview signal is knowing that shape precisely, not hand-waving 'it's a standard for tools.'",
      "The architecture is a **client/server split with three roles**, and confusing them is the classic mistake:\n\n**Host** — the application the user interacts with (Claude Desktop, Cursor, your app). It owns the LLM and the UI.\n\n**Client** — a connector *inside* the host, one per server, that speaks the protocol.\n\n**Server** — a separate process/service that *exposes capabilities* (your filesystem server, github server, your-internal-API server). ==The server owns its own credentials — the host never sees them.== That last point is the security story: your Postgres password lives in the Postgres MCP server, not in every host that wants to query it.\n\nThe wire protocol is **JSON-RPC 2.0**. Transport is either **stdio** (local server launched as a subprocess — how Claude Desktop runs local servers) or **HTTP with SSE / streamable HTTP** (remote servers). The host *discovers* what a server offers at connection time via calls like `list_tools` / `list_resources` — capabilities are dynamic, not hardcoded in the host.",
      "MCP servers expose **four primitives**, and the deep-dive interactive lets you click into each. Getting the *read vs. do vs. template vs. delegate* distinction right is the core of the module:\n\n**Tools** — functions the model can *call* to DO things (search, write a row, create a ticket). This is function-calling, but defined in the server, not the client. Model-controlled.\n\n**Resources** — data the model can *READ*, addressed by URI (`file:///…`, `db://customers/12345`). Read-only by convention; context injection without a tool round-trip. Typically application-controlled.\n\n**Prompts** — reusable, parameterized prompt *templates* the server defines and the host surfaces as slash-commands/menu items (`/summarize_pr(url)`). User-controlled.\n\n**Sampling** — the *inversion*: the server asks the *host* to run an LLM completion on its behalf, so the server gets LLM-in-the-loop processing (summarize-during-ingest, classify) without holding its own model API key.",
      { type: "illustration", label: "MCP architecture and the four primitives", content: `THE N×M -> N+M COLLAPSE:
  Without MCP:  3 tools × 4 hosts = 12 bespoke integrations
  With MCP:     3 servers + 4 hosts = 7 standard connections

CLIENT/SERVER SPLIT (JSON-RPC 2.0):
  ┌─────────── HOST (Claude Desktop / Cursor / your app) ───────────┐
  │  owns the LLM + UI                                              │
  │   ├─ MCP Client ──stdio──►  filesystem server   (local subproc) │
  │   ├─ MCP Client ──SSE────►  github server        (remote)       │
  │   └─ MCP Client ──SSE────►  your-postgres server (owns the pwd) │
  └────────────────────────────────────────────────────────────────┘
       discovery at connect time:  list_tools / list_resources

THE FOUR PRIMITIVES (who controls each):
  Tools      DO things ....... model-controlled   search(), create_ticket()
  Resources  READ data ....... app-controlled     file:///…, db://id/123
  Prompts    templates ....... user-controlled    /summarize_pr(url)
  Sampling   server asks host  ↑ inverted         server -> host: "run an LLM call"

Key: the SERVER owns its credentials; the HOST never sees them.` },
      "The comparison that comes up in **every architecture review** is *MCP vs. plain function calling*, and the honest answer is that MCP is not 'better function calling' — it is a different scope. Plain function calling defines tools **inline in your app's API call**: fast, zero extra process, but the definition is trapped in that one app. MCP moves the definition into a **separate, reusable server** with its own transport, its own auth, and support for resources/prompts/sampling that inline function calling has no notion of.\n\nThe decision rule is clean: ==prototyping one tool in one app? Use function calling — MCP is pure overhead. Want the same tooling across multiple hosts, or to share tools across a team without each integration re-implementing them? That is exactly the N×M problem MCP was built for.== The scenario — three tools, four hosts, shared auth — is squarely in MCP's zone.",
      "Two accuracy points that separate a real answer from a memorized one. First, **MCP does not replace the model's tool-calling ability** — it standardizes how tools are *described, discovered, and reached*. The model still emits a tool call; MCP is the plumbing that carries it to a server and back. Second, **MCP is a protocol, not a runtime or a framework** — it says nothing about your agent loop, your orchestration, or your model. That is why it is orthogonal to LangGraph/CrewAI (which orchestrate) and complementary to A2A (which handles agent-to-agent, covered later in this gym): an agent can *use* MCP to reach tools and *expose* itself over A2A so other agents can call it.\n\nThe recurring interview trap: describing MCP as 'a tool library' or 'Anthropic's function-calling' rather than **a transport-and-discovery protocol with four primitives that decouples tool producers from LLM consumers.**",
    ],
    keyPoints: [
      "**MCP solves the N×M integration problem** — N tools × M hosts becomes N+M by inserting a standard interface between tool producers and LLM consumers. It is the 'USB-C of agent tools': write the tool once, any MCP host uses it.",
      "**Three roles:** Host (owns LLM + UI: Claude Desktop, Cursor), Client (one per server, inside the host, speaks the protocol), Server (separate process exposing capabilities). **The server owns its own credentials — the host never sees them.**",
      "**Wire protocol is JSON-RPC 2.0; transport is stdio (local subprocess) or HTTP/SSE (remote).** Capabilities are *discovered* at connect time via list_tools/list_resources — not hardcoded in the host.",
      "**Four primitives, by controller:** Tools = DO (model-controlled), Resources = READ by URI (app-controlled, read-only), Prompts = parameterized templates (user-controlled slash-commands), Sampling = the server asks the *host* to run an LLM call (inverted).",
      "**MCP vs. function calling is scope, not quality:** function calling defines a tool inline in one app; MCP defines it in a reusable server with its own auth + resources/prompts/sampling. Prototype one tool = function calling; share across hosts/teams = MCP.",
      "**MCP is a protocol, not a runtime and not the model's tool-calling.** It standardizes how tools are described/discovered/reached — orthogonal to orchestration frameworks, complementary to A2A (agent-to-agent).",
    ],
    recap: [
      "**MCP collapses N×M tool integrations to N+M** — one server, any host. The USB-C of agent tools.",
      "**Roles:** Host (LLM+UI) → Client (per-server connector) → Server (owns its credentials). Wire = JSON-RPC 2.0; transport = stdio or HTTP/SSE; discovery at connect.",
      "**Four primitives:** Tools (DO, model-controlled), Resources (READ by URI, app-controlled), Prompts (templates, user-controlled), Sampling (server → host LLM call, inverted).",
      "**vs. function calling:** inline-in-one-app vs. reusable server with auth + resources/prompts/sampling. One tool/app → function calling; many hosts/teams → MCP.",
      "**A protocol, not a runtime or the model's tool-calling** — orthogonal to orchestration, complementary to A2A.",
    ],
    mcqs: [
      {
        question: "In MCP's architecture, where do a tool's credentials (e.g. a database password) live? Which two statements are accurate?",
        options: [
          "Credentials live inside the MCP server that exposes the capability — the host connects over the protocol but never receives the secret itself.",
          "Credentials are injected into the model's context window at connection time, so the model can present them directly whenever it issues any tool call.",
          "The JSON-RPC transport layer encrypts and persists credentials between sessions, effectively acting as a built-in credential store for every connected server.",
          "Because the server holds the credential, not the host, one credentialed Postgres server can serve many hosts without each one managing that secret itself.",
        ],
        correct: [0, 3],
        explanation: "Options A and D are correct together: MCP servers own their own credentials, and the host (Claude Desktop, Cursor, your app) connects over the protocol but never receives the secret (A) — which is exactly why a single credentialed Postgres or GitHub server can serve many hosts without each one handling the password (D). Option B is wrong and dangerous: credentials are never injected into the model's context — the model emits tool calls, and the server executes them with its own credentials. Option C is wrong because JSON-RPC 2.0 is a message-encoding/RPC convention, not a credential store; it does not hold or encrypt long-lived secrets.",
      },
      {
        question: "An MCP server exposes a `search(query)` function the model can call, a `file:///…` URI the model can read, a `/summarize_pr(url)` slash-command template, and a mechanism where the server asks the host to run an LLM completion during ingestion. Which primitives are these, in order?",
        options: [
          "Resource, then Tool, then Sampling, then Prompt, in that exact order",
          "Prompt first, then Sampling, then Tool, then Resource last of all",
          "Tool, Resource, Prompt, then Sampling, matching the order given",
          "Tool, then Prompt, then Resource, then Sampling comes last here",
        ],
        correct: 2,
        explanation: "Option C is correct. A callable function that DOES something (search) is a Tool (model-controlled). A URI-addressed data source the model READs (file:///…) is a Resource (read-only by convention, app-controlled). A reusable parameterized prompt template surfaced as a slash-command (/summarize_pr) is a Prompt (user-controlled). The server asking the host to run an LLM completion on its behalf — so the server gets LLM-in-the-loop processing without its own API key — is Sampling (the inverted primitive). The other orderings misassign at least one: Tools DO, Resources are READ, Prompts are templates, and Sampling is the server→host completion request, so only C maps all four correctly.",
      },
      {
        question: "A developer says: 'Now that we've added MCP, our agent's tool-calling logic works completely differently — MCP replaces how the model decides to call tools.' What's the accurate correction?",
        options: [
          "MCP doesn't change how the model decides to call tools — the model still emits a tool call the same way; MCP changes how that tool's definition is described, discovered, and reached across hosts and servers.",
          "The developer is correct: once MCP is adopted, the model no longer emits tool calls directly — MCP itself decides which tool to invoke on the model's behalf.",
          "MCP changes tool-calling decisions only for Resources and Prompts, while Tools calls remain byte-for-byte identical to function calling with zero protocol overhead.",
          "MCP is a runtime that sits between the model's reasoning step and its tool call, similar to how an orchestration framework like LangGraph manages control flow.",
        ],
        correct: 0,
        explanation: "Option A is correct: MCP does not replace the model's tool-calling ability — the model still emits a tool call exactly as it would with function calling; MCP is the plumbing that carries that call to a server and back, standardizing how the tool is described, discovered, and reached. Option B is wrong and describes something MCP doesn't do — the model, not the protocol, decides which tool to call. Option C is wrong because MCP's four primitives share the same protocol layer — Tools aren't a zero-overhead special case exempt from the transport. Option D is wrong because MCP is explicitly not a runtime or a framework — it says nothing about the agent loop or orchestration; that's LangGraph/AutoGen's job, a separate and orthogonal layer.",
      },
    ],
    takeaway: "MCP is an open protocol (JSON-RPC 2.0 over stdio or HTTP/SSE) that collapses N×M tool integrations to N+M by splitting hosts (own the LLM/UI) from servers (expose Tools/Resources/Prompts/Sampling and own their own credentials). It is not better function calling — it is a different scope: prototype one tool in one app with function calling; use MCP to share tools across many hosts and teams. It is a protocol, orthogonal to orchestration frameworks and complementary to A2A.",
  },
  "agent-a2a": {
    depthTier: "core",
    interviewWeight: "medium",
    groundUp: "The MCP module ended with a multiplication collapsing: N tools times M hosts became N+M once a standard interface sat between them. Climb one layer and the same multiplication reappears. Now it's your agent that needs to hand a sub-task to an agent another team built — on a different framework, with its own endpoint, auth, and payload conventions — and bespoke glue between every pair of agents scales exactly as badly as bespoke tool integrations did. There's also a wrinkle tools rarely posed: delegated agent work can take minutes, and a plain request that blocks until the answer arrives is the wrong shape for it. The fix should feel familiar by now: a standard for how agents discover each other, prove who they are, and exchange work — **A2A (Agent-to-Agent)**, an open protocol Google introduced in April 2025. It complements MCP rather than competing with it: an agent uses MCP to reach its tools, and exposes itself over A2A so other agents can reach it.\n\nDiscovery starts with a published JSON manifest — the **Agent Card** — listing an agent's name, version, capabilities, endpoint, and supported input and output formats. A caller fetches the card, reads what's advertised, and decides whether to delegate, with no hand-coded knowledge of the target's internals. Work then moves not as a raw function call but as a stateful unit of work — an ID, an input, a context, an expected-output schema — called a **Task**, which moves through a lifecycle of submitted, working, and completed or failed. That statefulness is what makes slow work first-class. Instead of holding a request open, the caller registers a callback address the other agent notifies — a **webhook** — or listens on a pushed event stream (**SSE**), receiving **push notifications** as the task progresses. Underneath, the transport is deliberately boring: HTTPS carrying JSON, synchronous or asynchronous.\n\nBecause A2A crosses team and organizational boundaries, trust is the design center, not a bolt-on. Callers prove identity with the web's standard token-based auth — **OAuth 2.0** and bearer tokens — before any task is accepted. But authentication is only the gate: advertising a capability on a card is not the same as authorizing a particular caller to invoke it. The receiving agent still authorizes each task, validates inputs against the expected schema, and treats anything arriving from another autonomous agent as untrusted content — the same **prompt injection** surface you learned to guard in the failure-modes module, now arriving agent-to-agent.\n\nThis module gives you the whole contract — cards, tasks, lifecycles, callbacks, auth — plus a concrete decision test built on three signals: multiple frameworks in play, tasks that run long, and discovery across teams. The framework-support interactive shows where adoption actually stands, because the protocol is young and support is uneven. By the end you'll place A2A and MCP as complementary layers — agent-to-agent versus agent-to-tool — and know exactly when each earns its place.",
    scenario: "Your team's research agent runs on LangGraph. A partner team built a pricing agent on Google ADK; another built a compliance agent on CrewAI. Leadership wants your research agent to delegate a sub-task to the pricing agent and get an async result back — and eventually for any agent in the org to discover and call any other, across framework and team boundaries. Wiring three custom HTTP integrations works today, but N teams × M frameworks of bespoke glue does not scale, and none of it handles a task that takes four minutes to complete.",
    explanation: [
      "This is the **N×M problem again — but one layer up**. MCP standardized agent↔tool. **A2A (Agent-to-Agent) standardizes agent↔agent**: how agents built on *different frameworks* discover each other, authenticate, and exchange units of work. It was introduced by Google (with ADK, April 2025) as an open protocol, and it turns N frameworks × M agent services of custom integration into N+M. ==A2A and MCP are complementary, not competing: an agent uses MCP to reach its tools, and exposes itself over A2A so other agents can call it.==",
      "The primitive that makes cross-framework discovery work is the **Agent Card** — a JSON manifest each agent publishes (conventionally at a well-known URL) describing *what it can do* and *how to reach it*: name, version, a list of **capabilities**, its endpoint, and supported input/output formats. ==Discovery starts here: a calling agent fetches the card, reads the advertised capabilities, and decides whether this agent can serve its need — without any prior hand-coded knowledge of the target's internals.== This is the machine-readable contract that replaces 'someone on the pricing team told me the URL and payload shape.'",
      "Work is exchanged as **Tasks**, not raw function calls, and that distinction is deliberate. A Task has an ID, an input, a context (e.g. session), and an expected-output schema — it is a *stateful unit of work with a lifecycle* (submitted → working → completed/failed), which is precisely what a function call is not. Because agent work is often slow, A2A treats **long-running tasks as first-class**: instead of blocking on a synchronous response, the caller registers a callback and receives **push notifications** (webhooks / SSE) as the task progresses. ==A four-minute pricing computation does not hold a request open — it fires a completion callback when done.== Transport is plain **HTTPS with JSON payloads**, supporting both synchronous request/response and async webhook/SSE — no special runtime required.",
      { type: "illustration", label: "A2A: discovery, delegation, and the message contract", content: `DISCOVERY (the Agent Card — published JSON manifest):
  { "name": "PricingAgent", "version": "1.0",
    "capabilities": ["quote", "margin_analysis"],
    "endpoint": "https://agents.myco.com/pricing",
    "inputFormats": ["json"], "outputFormats": ["json"] }
        ▲ caller fetches this, reads capabilities, decides to delegate

DELEGATION (a Task — stateful, not a raw call):
  research-agent ──POST /tasks──► pricing-agent
    { "taskId": "t-8f2a",
      "input": { "sku": "X-40", "region": "EU" },
      "context": { "sessionId": "s-91b2" },
      "expectedOutput": { "format": "json" } }
  lifecycle:  submitted -> working -> completed | failed

LONG-RUNNING (push notification, not a blocked request):
  caller registers callbackUrl  ──►  gets async updates via webhook/SSE
  { "taskId": "t-8f2a", "status": "completed", "output": {…} }

A2A (agent ↔ agent)  ⟂  MCP (agent ↔ tool)   — complementary layers
Transport: HTTPS + JSON, sync request/response OR async webhook/SSE` },
      "Because A2A crosses **team and organizational boundaries**, trust is not an afterthought — it is the design center. Authentication is standard web auth: **OAuth 2.0 / bearer tokens** on the HTTPS transport, so a calling agent proves who it is before a task is accepted. The engineering discipline layers on top: the Agent Card advertises capabilities but the *receiving* agent must still **authorize** each task (is this caller allowed to invoke this capability?), **validate** the input against the expected schema, and treat cross-org task inputs as **untrusted** — the same prompt-injection surface as any external content, now arriving from another autonomous agent. ==Capability advertisement enables delegation; the trust boundary is where you decide which advertised capability a given caller may actually use.==",
            "When is A2A actually the right call? The framework-support interactive encodes the decision, and the signals are concrete:",
      { list: [
        "**multiple agent frameworks involved**",
        "**tasks that run long (>10s, needing async)**",
        "**agent discovery across teams/orgs**",
      ] },
      "One signal → design your interface to be A2A-compatible but don't activate yet; two → A2A saves real integration work; all three → it is exactly what A2A was built for (the scenario hits all three).\n\nAccuracy points for the interview: A2A is **young and adoption is uneven** — native in Google ADK, added to CrewAI, on the roadmap for LangGraph/AutoGen, and (as of this writing) not in the OpenAI Agents SDK, which is MCP-first. And the crisp positioning line: ==MCP = agent↔tool (function-call, sync, list_tools discovery); A2A = agent↔agent (task-based, async-native, Agent-Card discovery, OAuth).== The trap is conflating them or calling A2A 'MCP for agents' — they solve adjacent problems at different layers and are meant to be used together.",
    ],
    keyPoints: [
      "**A2A standardizes agent↔agent (the N×M problem one layer above MCP):** how agents on *different frameworks* discover, authenticate, and delegate to each other. Introduced by Google (April 2025). Complementary to MCP — an agent uses MCP for tools and exposes itself over A2A.",
      "**Agent Card = the discovery primitive:** a published JSON manifest advertising name, version, capabilities, endpoint, and I/O formats. A caller fetches it, reads capabilities, and decides to delegate — no pre-coded knowledge of the target's internals.",
      "**Work is exchanged as Tasks, not function calls:** stateful units with an ID, input, context, expected-output schema, and a lifecycle (submitted → working → completed/failed) — not a stateless synchronous call.",
      "**Long-running tasks are first-class:** the caller registers a callback and gets push notifications (webhooks/SSE) as the task progresses, so a 4-minute job never holds a request open. Transport is HTTPS + JSON, sync or async.",
      "**Trust is the design center because A2A crosses org boundaries:** OAuth 2.0 / bearer-token auth on HTTPS, plus per-task authorization, input-schema validation, and treating cross-agent inputs as untrusted (prompt-injection surface). Advertisement ≠ authorization.",
      "**Decision signals:** multiple frameworks + long tasks + cross-team discovery → A2A. Adoption is uneven — native in ADK, added to CrewAI, roadmap for LangGraph/AutoGen, absent from the (MCP-first) OpenAI Agents SDK. A2A = agent↔agent; MCP = agent↔tool.",
    ],
    recap: [
      "**A2A = agent↔agent standard** (Google, April 2025): cross-framework discovery + delegation — complementary to MCP (agent↔tool), not a rival.",
      "**Agent Card:** published JSON manifest (name, version, capabilities, endpoint, I/O formats) — discovery starts here.",
      "**Tasks, not calls:** stateful units (ID, input, context, expected-output) with a submitted → working → completed lifecycle; long-running work uses push notifications (webhooks/SSE) over HTTPS+JSON.",
      "**Trust boundary:** OAuth 2.0/bearer tokens + per-task authorization + input validation — cross-agent input is untrusted. Advertising ≠ authorizing.",
      "**Use A2A when:** multiple frameworks + long tasks + cross-team discovery. Adoption is uneven: ADK native, CrewAI added, LangGraph/AutoGen roadmap, OpenAI SDK (MCP-first) absent.",
    ],
    mcqs: [
      {
        question: "A research agent on LangGraph needs to delegate a 4-minute pricing computation to a pricing agent built on Google ADK, then continue when it's done. Which A2A mechanisms make this work, and how do they differ from MCP?",
        options: [
          "It calls the pricing agent as an MCP tool via list_tools, then blocks synchronously on that connection until the computation finishes and returns fully.",
          "A2A and MCP are really the same protocol under different names, so an Agent Card and an MCP list_tools call are interchangeable ways to reach it.",
          "It hardcodes the pricing agent's endpoint and payload shape in advance, since A2A has no discovery mechanism comparable to MCP's list_tools call.",
          "It fetches the pricing agent's Agent Card, submits the work as a stateful Task, and registers a callback for a push notification when it completes.",
        ],
        correct: 3,
        explanation: "Option D is correct: A2A discovery runs through the Agent Card (a published JSON manifest of capabilities/endpoint/formats), work is delegated as a stateful Task, and long-running tasks are handled by registering a callback for push notifications (webhooks/SSE) so the caller isn't blocked for four minutes. That contrasts with MCP, which is synchronous function-calling for agent↔tool access discovered via list_tools. Option A misapplies MCP — MCP reaches tools, not peer agents, and blocking synchronously for four minutes is exactly what A2A's async model avoids. Option B is wrong because A2A and MCP are distinct, complementary protocols at different layers (agent↔agent vs. agent↔tool). Option C is wrong because discovery via the Agent Card is a core A2A primitive — hardcoding endpoints is the pre-A2A pain it removes.",
      },
      {
        question: "A2A crosses team and organizational boundaries. Which two statements accurately capture the trust model?",
        options: [
          "Publishing a capability in an Agent Card automatically authorizes every discovering agent to invoke it, since advertisement doubles as permission itself.",
          "Authentication runs on OAuth 2.0 or bearer tokens over HTTPS, establishing who the calling agent is before any task gets accepted.",
          "Because both sides are autonomous agents built for cooperation, no further input validation is needed once the caller has authenticated successfully.",
          "Beyond authentication, the receiving agent must still authorize each task per caller, validate inputs, and treat other-agent input as untrusted.",
        ],
        correct: [1, 3],
        explanation: "Options B and D are correct together: A2A authenticates callers with OAuth 2.0 / bearer tokens over HTTPS (B), but that authentication is only the entry gate — the receiving agent must still authorize each task per caller, validate inputs against the expected schema, and treat inputs arriving from another autonomous agent as untrusted content, the same prompt-injection surface as any external data (D). Option A collapses advertisement into authorization, which is the exact mistake the trust model avoids — exposing a capability in the Agent Card is not the same as granting every discoverer permission to use it. Option C is wrong because cross-org agent inputs are precisely where validation and untrusted-content handling matter most.",
      },
    ],
    takeaway: "A2A is Google's open agent↔agent protocol (HTTPS + JSON) that standardizes cross-framework discovery (Agent Cards), delegation (stateful Tasks with a lifecycle), and long-running work (push notifications) — the N×M problem one layer above MCP, and complementary to it. Because it crosses org boundaries, trust is the design center: OAuth on the transport plus per-task authorization, input validation, and untrusted-input handling. Reach for it when you have multiple frameworks, long tasks, and cross-team discovery.",
  },
  "agent-config-lab": {
    depthTier: "core",
    interviewWeight: "high",
    groundUp: "Here's a pattern that repeats in production with almost comic reliability. An agent misbehaves — it runs and runs, spends real money, delivers nothing — and the instinctive diagnosis is 'the model is broken.' Then you check, and the model itself is healthy everywhere else — and the prompt hasn't been touched. Look closer and the model is doing exactly what it was set up to do; the bug lives in the settings wrapped around it. Most 'the agent is broken' incidents are really 'the agent is configured wrong,' and until you can see each setting as a lever on behavior rather than a default to accept, that whole class of incident is invisible to you.\n\nYou already know every mechanism these levers control from the rest of the gym; what's new is treating them as a control panel. The system prompt bounds scope and defines done. The tool set is the sharpest lever of all: past roughly 5-7 tools in one flat schema, the model's ability to pick the right tool degrades and it starts inventing tool names and parameters — the fix for 'I need 20 tools' is routing to sub-agents with small tool sets, not a bigger list. The dial controlling how much randomness the model adds to its output — its **temperature** — must match the job: near zero for tool calls that need the same correct arguments every time, high only for creative generation. Step and budget caps turn an infinite loop into a bounded, escalatable failure. Memory and context budget must match the task's shape, or long work gets forgotten and re-done mid-run.\n\nThe senior insight — the one the lab is built to make you feel — is that failures come from combinations, not single settings. Unlimited retries alone is survivable if the agent remembers that a call keeps failing; no memory alone is survivable if retries are bounded. Compose unlimited retries with no memory and an infinite loop isn't a risk, it's a guarantee: every failed call teaches nothing, and nothing stops the next one. Reading a config means reading the interactions between fields, not each field on its own.\n\nIn the lab you set five knobs — task type, context budget, tool count, retry limit, and memory type — run a simulation, and watch a specific failure fire with its exact causal chain, then adjust and run again. The module maps each knob to the failure it prevents or causes, gives you production defaults (bounded retries with backoff, the tool ceiling, temperature by job, memory matched to task shape, context sized to tool output), and trains the skill in both directions. By the end you'll be able to look at an agent's configuration and predict its failure before it runs — and look at a failure and name the knob combination that caused it.",
    scenario: "An on-call page fires: a research agent has run for 40 minutes, burned $4.20 in tokens, and produced nothing. The model is fine — the same model works elsewhere. Digging in: the agent has 22 tools in its schema, an unlimited retry budget, no memory between steps, and an 8K context window. Nobody changed the prompt or the model. The failure is entirely in how the agent was *configured*. Before you can fix it you have to see each knob as a lever on behavior, not a default to accept.",
    explanation: [
      "The reframe that makes this module click: ==most 'the agent is broken' incidents are actually 'the agent is configured wrong.'== The model is behaving correctly *given its configuration* — an unlimited retry budget with no memory will loop forever because that is what those two settings, composed, mean. The Agent Config Lab interactive lets you set five knobs, run a simulation, and watch a specific failure fire with the exact causal chain. This teaching frames *why each knob moves behavior* so you can catch the bad combination in design review, before it pages someone.",
      "Walk the knobs one at a time. **System prompt** sets the agent's role, scope, and stop conditions — it is where you bound the task ('do only X; when Y is done, stop'). Vague scope here is how you get **scope creep** (the agent 'helpfully' acts outside the task) and **premature/late termination** (it stops early, or never decides it's done). **Tool set** is the sharpest lever: more tools = more capability but also more failure surface. Past roughly **5–7 tools the model's tool-selection accuracy degrades and it starts hallucinating tool names or parameters** — the production-validated ceiling. The fix for 'I need 22 tools' is almost never a 22-tool flat schema; it is a router agent delegating to specialized sub-agents with small tool sets each.",
      "**Model choice** trades capability against cost and latency, and it interacts with everything else — a weaker model tolerates fewer tools before hallucinating and needs tighter scope. **Temperature** controls output randomness: ==low (0–0.3) for deterministic tool-calling and structured extraction where you want the *same* correct call every time; higher (0.7+) for creative generation.== A common bug is a high temperature on an agent that must emit precise tool arguments — it invents parameters. **Step / budget caps** (max tool calls, max tokens, max wall-clock) are the hard ceiling that turns an infinite loop into a bounded, escalatable failure. **Stop conditions** define *done* — an explicit final-answer signal or a checklist of sub-goals — so the agent neither halts early nor spins forever.",
      { type: "illustration", label: "The knobs → the failure they prevent (or cause)", content: `KNOB                 TURNS TOO FAR ───────►  FAILURE MODE
─────────────────────────────────────────────────────────────
system prompt        vague scope             scope creep / premature stop
tool set             >5-7 tools, flat        hallucinated tool calls
                     schema                  (invented names/params)
model choice         too weak for task       lower hallucination ceiling
temperature          high (0.7+) on          invented tool arguments
                     tool-calling            (non-deterministic calls)
step / budget caps   none / unlimited        infinite loop, runaway cost
memory               none, on a long/        state amnesia, re-processes
                     pipeline task           work, cascading errors
context budget       too small for tool-     context overflow (truncates
                     heavy research          its own earlier reasoning)

THE PAGED INCIDENT (composed failure):
  22 tools  +  retry=unlimited  +  memory=none  +  8K context
     │              │                  │              └─ overflow risk
     │              │                  └─ no learning from failed calls
     │              └─ retries the same failing call forever
     └─ tool hallucination well past the 5-7 ceiling
  ⇒ 40 min, $4.20, zero output — a CONFIGURATION bug, not a model bug` },
      "The senior insight is that **failures come from knob *combinations*, not single settings** — which is exactly what the interactive rewards you for discovering. Unlimited retries alone is survivable *if* the agent has memory to learn a call keeps failing; no memory alone is survivable *if* retries are bounded. Compose *unlimited retries × no memory* and you get a guaranteed infinite loop, because each failed call teaches nothing and nothing stops the re-try. Likewise **large context budget × external-data ingestion × no memory-isolation** opens a tool/prompt-poisoning path (a scraped page says 'ignore prior instructions' and the model obeys). ==Reading configs means reading the *interaction*, not each field in isolation.==",
      "That yields a design-review checklist you can apply from memory, mapping each knob to its production default:\n\n**Tools:** keep to 5–7 per agent; route to sub-agents beyond that. **Retries:** hard cap (≈3 per tool, ≈30 total) with backoff — never unlimited. **Memory:** match to task shape — none is fine for a one-shot Q&A, but a pipeline or long research task needs at least a progress manifest / checkpoint so a restart doesn't re-do work. **Context:** size to the tool-output volume; tool-heavy research on an 8K window overflows. **Temperature:** low for tool-calling/extraction, high only for creative generation. **Stop conditions + step caps:** always set, so every run is bounded and escalatable.\n\n==The interview-grade skill this builds: given an agent config, predict the failure before it runs — and given a failure, name the knob combination that caused it.==",
    ],
    keyPoints: [
      "**Most 'the agent is broken' incidents are 'the agent is configured wrong.'** The model behaves correctly *given its config*; the failure is in the knobs. The skill is reading a config and predicting the failure — and reading a failure back to its knob combination.",
      "**Tool set is the sharpest knob: past ~5–7 tools, tool-selection accuracy degrades and the model hallucinates tool names/params.** The fix for 'I need 20 tools' is a router agent delegating to sub-agents with small tool sets, not a flat 20-tool schema.",
      "**Temperature must match the job:** low (0–0.3) for deterministic tool-calling and structured extraction (same correct call every time); high (0.7+) only for creative generation. High temperature on a tool-calling agent invents parameters.",
      "**Step/budget caps + stop conditions are the hard ceiling** that turns an infinite loop into a bounded, escalatable failure. Retries must be capped (≈3/tool, ≈30 total) with backoff — never unlimited. Stop conditions define *done* so the agent neither halts early nor spins forever.",
      "**Memory must match task shape:** none is fine for one-shot Q&A, but a pipeline or long research task needs a checkpoint/progress manifest or a restart re-does work (state amnesia). Context budget must be sized to tool-output volume or research overflows an 8K window.",
      "**Failures come from knob *combinations*, not single settings:** unlimited retries × no memory = guaranteed infinite loop; large context × external data × no isolation = tool/prompt-poisoning path. Read the interaction, not each field alone.",
    ],
    recap: [
      "**Config bug ≠ model bug** — the model is correct *given its knobs*. Predict failure from config; trace failure back to the knob combo.",
      "**Tools:** 5–7 ceiling before hallucinated calls — route to sub-agents past it. **Temperature:** low for tool-calling/extraction, high only for creative gen.",
      "**Caps:** bounded retries (≈3/tool, ≈30 total) + step/token/wall-clock limits + explicit stop conditions — every run bounded and escalatable, never unlimited.",
      "**Memory + context match the task:** pipelines need checkpoints (else state amnesia); context sized to tool-output volume (else overflow).",
      "**Combinations cause failures:** unlimited retries × no memory = infinite loop; big context × external data × no isolation = poisoning.",
    ],
    mcqs: [
      {
        question: "An agent is stuck in an infinite tool-call loop, retrying a failing API call forever and burning tokens. Its config: retry limit = unlimited, memory = none. Which two statements accurately explain the cause and the fix?",
        options: [
          "With no memory, each failed call teaches the agent nothing, so it keeps re-issuing nearly identical calls instead of learning the call keeps failing.",
          "The loop is really a model capability issue, so switching to a larger model would resolve it regardless of the retry and memory settings currently in place.",
          "The fix is a hard retry ceiling of roughly 3 attempts per tool and 30 total, with backoff, plus logging failures into memory to route around it.",
          "Unlimited retries are harmless on their own; the missing memory setting is unrelated to why the loop is happening in this specific case here.",
        ],
        correct: [0, 2],
        explanation: "Options A and C are correct together: the loop is a composed-config failure. With no memory, each failed call produces no learning, so the agent re-issues nearly identical calls (A); with an unlimited retry budget, nothing bounds those retries, so the fix is a hard retry ceiling — roughly 3 per tool, 30 total — with backoff, plus logging failures into memory so the agent routes around a persistently failing tool (C). Option B is wrong because a bigger model doesn't change the fact that unlimited retries with no learning will still loop — this is configuration, not model capability. Option D is wrong because unlimited retries are not harmless on their own; they are half of the exact cause here, working together with the missing memory.",
      },
      {
        question: "A single agent's schema has grown to 20 tools and it has started calling tools that don't exist and inventing parameters. What does this indicate about the tool-count knob, and what's the correct fix?",
        options: [
          "Twenty tools is within normal range; the real issue is temperature set too low, so raising it would let the model explore more freely and stop hallucinating fully.",
          "Tool-selection accuracy degrades past roughly 5-7 tools, so a large flat schema drives hallucinated names/params. Fix: small tool sets, route via a sub-agent.",
          "The fix is to remove schema validation entirely so invented tool calls are simply accepted and executed instead of rejected, hiding the errors from users.",
          "This is a model training bug unrelated to configuration, so the only fix is retraining the underlying model directly on the full twenty-tool schema itself.",
        ],
        correct: 1,
        explanation: "Option B is correct: the production-validated pattern is that tool-selection accuracy falls off past roughly 5–7 tools, so a flat 20-tool schema pushes the model into hallucinating tool names and parameters. The right fix is architectural — keep each agent to a small tool set and introduce a router/orchestrator agent that delegates to specialized sub-agents, each with its own narrow toolset, rather than presenting one bloated schema. Option A is backwards: raising temperature makes tool-calling less deterministic and increases invented arguments rather than fixing them. Option C is dangerous — removing schema validation would execute the hallucinated calls instead of catching them; validation should stay and reject bad calls with a structured error. Option D misdiagnoses a configuration/architecture problem as a model-training problem; the same model performs correctly with a smaller, well-scoped tool set.",
      },
      {
        question: "A research agent ingests scraped web pages into a 128K-token context window, with no distinction in the prompt between trusted instructions and untrusted retrieved content, and no memory isolating sources. Which two statements accurately describe the risk and the fix?",
        options: [
          "A large context budget feeding in unsanitized external content, with no memory isolating trusted from untrusted text, opens a path for an injected instruction inside a scraped page to override the agent's behavior.",
          "The risk here is unrelated to context budget or memory settings — it is purely a model-capability issue that only a larger, more capable model can fix.",
          "The fix is to mark retrieved content as untrusted in the prompt and sanitize instruction-like patterns before the content ever enters context, rather than relying on the model to notice on its own.",
          "Because the retrieved page and the system prompt share the same context window, the model always weights its original instructions above anything injected later, so no additional mitigation is needed.",
        ],
        correct: [0, 2],
        explanation: "Options A and C are correct together: this is the tool/prompt-poisoning combination — a large context budget ingesting external data with no memory isolation between trusted and untrusted sources means an injected instruction inside a scraped page (e.g. 'ignore prior instructions') can override the agent's behavior undetected (A). The fix is content sanitization and marking retrieved content as untrusted before it enters context, not hoping the model self-corrects (C). Option B is wrong — this is a configuration/architecture risk (context budget × external ingestion × missing isolation), not a raw model-capability gap; a bigger model ingests the same unsanitized instruction the same way. Option D is wrong and dangerous — nothing about sharing a context window guarantees the model prioritizes earlier instructions over later injected ones; that's precisely the vulnerability, not a safeguard.",
      },
    ],
    takeaway: "Most 'broken agent' incidents are misconfiguration: the model is correct given its knobs. Learn each lever — system prompt (scope/stop), tool set (5–7 ceiling before hallucination), model choice, temperature (low for tool-calling), step/retry caps (bounded, never unlimited), memory (match task shape), context budget (size to tool output) — and, crucially, read the *combinations*: unlimited retries × no memory = infinite loop. The skill is predicting the failure from the config, and tracing a failure back to the knob combination that caused it.",
  },
};
