// src/data/codeLabsData.js — "Code Labs" data for the BUILD frame.
//
// CONCEPT: "BUILD as real coding" — guided read-and-reason code walkthroughs.
// The differentiator for an Applied AI Engineer isn't writing more toy apps;
// it's READING and REASONING about real, idiomatic GenAI systems code (MCP
// servers, RAG pipelines, multi-agent orchestrators) and knowing WHY each design
// decision was made and what breaks if you change it. NO runtime execution — this
// is a read-and-reason surface, not a sandbox. Verification is by parse + review.
//
// ─── SCHEMA ───────────────────────────────────────────────────────────────────
// CODE_LABS: array of lab objects, each:
// {
//   id: string,            // stable, unique — used as the localStorage completion key
//   title: string,
//   subtitle: string,
//   tag: string,           // short frame chip, e.g. "MCP · Python"
//   difficulty: "intro" | "core" | "advanced",
//   minutes: number,       // rough read time
//   intro: {
//     scenario: string,    // the real-world situation the code solves
//     whatYouBuild: string,// one line: what the finished code is
//     prereqs: string[],   // what a reader should already know (optional)
//   },
//   steps: [ {
//     title: string,
//     language: string,          // "python" | "typescript" | "json" — pre styling only
//     code: string,              // REAL, correct, idiomatic code shown in a <pre>
//     explanation: string[],     // paragraphs (InlineMd markdown supported):
//                                //   what it does + WHY + the design tradeoff.
//     checkpoint?: {             // optional judgment gate for this step
//       question: string,
//       options: string[],
//       correct: number,         // index into options
//       explanation: string,     // why correct is correct / others wrong
//     },
//   } ],
//   recap: string[],       // "key decisions recap" — the senior-level takeaways
// }
//
// InlineMd (reused from the same renderer conventions as FoundationsRunner):
//   **bold**  *em*  `code`  ==highlight==  \n\n paragraph break.
//
// Completion state: localStorage key `gsl-codelabs` → JSON array of completed lab ids.
// A lab is completable once every checkpoint has been answered.
//
// SCALE PLAN: additional labs drop straight into CODE_LABS with the same schema —
// RAG pipeline (chunk→embed→retrieve→rerank→ground), multi-agent orchestrator
// (planner/worker/critic loop), eval harness (LLM-as-judge with rubric + CI gate).
//
// ─── SKELETON / "COMING SOON" LABS ────────────────────────────────────────────
// A lab can be an authored, fully-walkable lab (like mcp-server-min) OR a
// published ROADMAP SKELETON: same schema shape, but `status: "upcoming"` and
// `steps` carries only outlined step *titles* (no code/checkpoints yet). The
// renderer keys off `status`: an "upcoming" lab shows its intro + the outline of
// planned steps as a roadmap, and is NOT completable (no checkpoints to answer).
// Skeleton shape (only the fields that differ from a full lab):
//   {
//     id, title, subtitle, tag, difficulty, minutes,
//     status: "upcoming",           // <-- marks it in-development; renderer shows a chip
//     intro: { scenario, whatYouBuild, prereqs },
//     outline: [ { title: string, note?: string } ],   // planned steps, not yet authored
//   }
// A skeleton omits `steps` and `recap` (or leaves them empty). If a renderer that
// predates `status`/`outline` reads it, it still finds valid `id/title/intro` and
// an empty/absent `steps` array — so it degrades to "intro only", never crashes.
// ──────────────────────────────────────────────────────────────────────────────

export const CODE_LABS = [
  {
    id: "mcp-server-min",
    title: "Read a Minimal MCP Server",
    subtitle:
      "Walk a real, idiomatic Model Context Protocol server line by line — tool registration, the tool schema, the handler, error handling, and the stdio transport loop. Reason about every design decision the way a staff AI engineer would in a code review.",
    tag: "MCP · Python",
    difficulty: "core",
    minutes: 18,
    intro: {
      scenario:
        "An agent product needs to let the LLM call a real internal tool — a weather lookup — instead of hallucinating the answer. The team chose the **Model Context Protocol (MCP)**: a standard, transport-agnostic way to expose tools, resources, and prompts to any MCP-compatible client (Claude Desktop, an IDE, a custom orchestrator). Your job in the interview isn't to invent MCP — it's to read this server and explain *why* each piece exists and *what breaks* if it's wrong. _New to the protocol? See the concept first in Agent Lab → MCP Deep Dive (the 4 primitives + MCP-vs-function-calling). This lab is the real code behind that concept._",
      whatYouBuild:
        "A complete, single-file MCP server that exposes one tool (`get_weather`) over stdio using the official Python SDK — the exact shape you'd ship and the exact shape you'll be asked to reason about.",
      prereqs: [
        "Comfort reading Python (async/await, decorators, type hints)",
        "The idea that an LLM 'calls a tool' by emitting a structured request the host executes",
      ],
    },
    steps: [
      {
        title: "1 · The server object and why a name matters",
        language: "python",
        code: `import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types

# One server instance per process. The name is the protocol-level identity
# the client sees during the handshake — it is NOT cosmetic.
app = Server("weather-server")`,
        explanation: [
          "An MCP server is an **object, not a web app**. You instantiate one `Server`, register capabilities on it, then hand it a transport to run over. That separation — capabilities vs. transport — is the whole point of the protocol: the same server can run over stdio for a desktop client or over HTTP/SSE for a remote one, untouched.",
          "The name `\"weather-server\"` is sent during the **initialize handshake**. The client uses it to namespace and display the server, and in multi-server setups (a host wiring up five MCP servers at once) it's how the host disambiguates who owns which tool. ==A vague or duplicated name is a real bug in a multi-server host, not a style nit.==",
        ],
        checkpoint: {
          question:
            "Why is capabilities-vs-transport separation the core MCP design decision, rather than just building an HTTP API?",
          options: [
            "It makes the server faster because stdio has less overhead than HTTP",
            "The same server can be run over stdio, HTTP/SSE, or any transport without changing the tool code — the host picks the transport",
            "It lets the LLM call the tools directly without a host process",
            "It is required for the code to type-check with mcp.types",
          ],
          correct: 1,
          explanation:
            "MCP standardizes the *interface* (tools, resources, prompts) and leaves the *transport* pluggable. A local desktop client runs your server over stdio; a remote deployment runs the identical server over HTTP/SSE. If you'd hardcoded an HTTP framework, you'd lose that portability — and the whole value of a *protocol* is that any compliant host can drive any compliant server.",
        },
      },
      {
        title: "2 · Advertising the tool: the schema IS the contract",
        language: "python",
        code: `@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="get_weather",
            description="Get the current weather for a city. "
                        "Returns temperature in Celsius and conditions.",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "City name, e.g. 'Bangalore'",
                    },
                    "units": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "default": "celsius",
                    },
                },
                "required": ["city"],
            },
        )
    ]`,
        explanation: [
          "`list_tools` is how the server tells the client **what it can do**. The client forwards these definitions to the LLM, which uses the `description` and `inputSchema` to decide *whether* to call the tool and *how* to fill the arguments. ==The schema is not documentation — it's the contract the model reasons over.==",
          "The `inputSchema` is **JSON Schema**. `required: [\"city\"]` means the model must supply a city; `units` is optional with an `enum` and a `default`. This constrains the model's output space before it ever calls: a good schema turns 'the model might pass anything' into 'the model can only pass a valid shape.'",
          "The `description` fields do real work. The model has no other signal about intent — write 'Get the current weather' and it calls appropriately; write 'weather stuff' and it will mis-select the tool or pass garbage. ==Prompt engineering the tool description is part of the engineering, not an afterthought.==",
        ],
        checkpoint: {
          question:
            "The team ships the schema but forgets to list `\"city\"` in `required`. What is the most likely production failure?",
          options: [
            "The server crashes on startup because the schema is invalid",
            "The model sometimes calls get_weather with no city, the handler receives {} and must handle a missing argument or it throws",
            "The client refuses to connect during the initialize handshake",
            "Nothing — required is only advisory and the SDK fills defaults",
          ],
          correct: 1,
          explanation:
            "`required` constrains the *model's* output, not the transport. Drop it and the model, seeing city as optional, will occasionally omit it — especially on vague user turns like 'what's the weather?'. The handler then gets `arguments={}`, and if it does `arguments[\"city\"]` unguarded it raises a KeyError mid-request. The schema is your first line of input validation; a missing `required` pushes that validation burden onto every handler.",
        },
      },
      {
        title: "3 · The handler: dispatch, then do the work",
        language: "python",
        code: `@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name != "get_weather":
        raise ValueError(f"Unknown tool: {name}")

    city = arguments["city"]
    units = arguments.get("units", "celsius")

    # In a real server this is an awaited HTTP call to a weather API.
    temp_c, conditions = await fetch_weather(city)
    temp = temp_c if units == "celsius" else round(temp_c * 9 / 5 + 32, 1)

    unit_label = "°C" if units == "celsius" else "°F"
    text = f"{city}: {temp}{unit_label}, {conditions}"

    return [types.TextContent(type="text", text=text)]`,
        explanation: [
          "One `call_tool` handler receives **every** tool invocation; the `name` argument is the dispatch key. That's why the first line checks `name` and raises on anything unexpected — a server that advertises one tool but silently no-ops on an unknown name is a debugging nightmare in a multi-tool host.",
          "Note `arguments.get(\"units\", \"celsius\")` versus `arguments[\"city\"]`. The optional field uses `.get` with the same default the schema declared; the required field is indexed directly **because the schema already guaranteed it**. ==When the schema and the handler disagree about what's required, the schema is the source of truth and the handler should mirror it.==",
          "The handler is `async` and `await`s the real work. MCP handlers run on an event loop — a blocking call here (a synchronous `requests.get`) would stall the entire server, freezing every other in-flight tool call. The return type is a **list of content blocks** (here one `TextContent`), which is how MCP supports mixed text/image/resource results from a single call.",
        ],
        checkpoint: {
          question:
            "Why return `list[types.TextContent]` instead of just returning the string `text`?",
          options: [
            "Python requires all async functions to return a list",
            "MCP results are a list of typed content blocks so one tool can return mixed text, images, and embedded resources — a bare string can't carry that structure",
            "The list is required so the client can retry each element on failure",
            "It's a style convention with no functional effect",
          ],
          correct: 1,
          explanation:
            "A tool result is a *sequence of content blocks*, each typed (`text`, `image`, `resource`). A chart tool might return an image block plus a text caption; a search tool might return several resource blocks. Standardizing on a list of typed blocks means the host renders any tool's output uniformly. Returning a bare string would break that contract and the SDK would reject it.",
        },
      },
      {
        title: "4 · Error handling: fail loudly, inside the protocol",
        language: "python",
        code: `@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name != "get_weather":
        raise ValueError(f"Unknown tool: {name}")

    city = arguments.get("city")
    if not city:
        raise ValueError("Missing required argument: city")

    try:
        temp_c, conditions = await fetch_weather(city)
    except WeatherAPIError as e:
        # Surface a clean, model-readable error — do NOT leak a stack trace.
        raise ValueError(f"Could not fetch weather for {city}: {e}") from e

    return [types.TextContent(
        type="text",
        text=f"{city}: {temp_c}°C, {conditions}",
    )]`,
        explanation: [
          "When a handler **raises**, the SDK catches it and returns a proper MCP tool-error result to the client — which passes it back to the model as an observation. ==This is the key insight: a raised error is not a crash; it's a message to the LLM.== The model can read 'Could not fetch weather for Xanadu' and recover — apologize, ask the user to clarify, or try a different tool.",
          "So the *wording of the error matters* the way a tool description matters — it's model-facing text. Raise `ValueError(\"Could not fetch weather for {city}\")` and the agent recovers gracefully; let a raw `KeyError` or a 500-page stack trace propagate and the model gets noise it can't reason about, often looping or giving up.",
          "`from e` preserves the chain for **your** logs without leaking internals to the model. And notice the defensive `if not city` even though the schema requires it: in production, belt-and-suspenders validation guards against a buggy client, a schema drift, or a hand-crafted request. ==Trust the schema for the model; validate anyway for the adversary.==",
        ],
        checkpoint: {
          question:
            "The weather API times out. Which handler behavior gives the *agent* the best chance to recover for the user?",
          options: [
            "Let the raw TimeoutError propagate unhandled so the host restarts the server",
            "Catch it and return an empty list so the model sees no output",
            "Catch it and raise ValueError('Weather service timed out for {city}, try again') — a clean model-readable error",
            "Catch it and return fabricated weather data so the conversation continues",
          ],
          correct: 2,
          explanation:
            "A clean raised error becomes a tool-error observation the model can read and act on ('the service timed out, I'll tell the user and retry'). An unhandled exception risks killing the transport; an empty list makes the model think the tool succeeded with no data (it may hallucinate); fabricated data is the worst outcome — you've turned a transient failure into a confidently wrong answer. Fail loudly, in-protocol, with model-readable text.",
        },
      },
      {
        title: "5 · The transport loop: stdio and why stdout is sacred",
        language: "python",
        code: `async def main():
    # stdio_server yields the read/write streams bound to this process's
    # stdin/stdout. The host launched us as a subprocess and speaks JSON-RPC
    # over those pipes.
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options(),
        )

if __name__ == "__main__":
    asyncio.run(main())`,
        explanation: [
          "For a local server the transport is **stdio**: the host (e.g. Claude Desktop) starts your script as a subprocess and exchanges **JSON-RPC** messages over stdin/stdout. `stdio_server()` hands you the streams; `app.run(...)` drives the protocol loop — handshake, then request/response until the pipe closes.",
          "This is the single most common way to break an MCP server: ==anything you `print()` to stdout corrupts the JSON-RPC stream and the client disconnects.== stdout is the protocol channel, not a log. All logging must go to **stderr** (or a file). A stray `print(\"debug\")` — or a library that logs to stdout — silently kills the connection.",
          "`create_initialization_options()` packages the server's declared capabilities for the handshake. The whole thing is wrapped in `asyncio.run(main())` because MCP is async top to bottom — one event loop, non-blocking handlers, so a slow tool call never freezes the transport.",
        ],
        checkpoint: {
          question:
            "A developer adds `print(f'Handling {name}')` inside call_tool to debug. The client starts disconnecting mid-session. Why?",
          options: [
            "print is synchronous and blocks the event loop",
            "The print writes to stdout, which is the JSON-RPC channel — the extra text corrupts the message stream and the client drops the connection",
            "MCP forbids any I/O inside a tool handler",
            "The print statement leaks the tool name to the model as a prompt injection",
          ],
          correct: 1,
          explanation:
            "Over stdio, stdout carries framed JSON-RPC messages. Any non-protocol bytes on stdout desynchronize the client's parser, so it sees malformed frames and disconnects. Debug output must go to stderr or a log file. This is the number-one 'my MCP server randomly disconnects' bug — and knowing it cold is a strong signal in an interview.",
        },
      },
      {
        title: "6 · Putting it together — the shape you'll be asked to draw",
        language: "python",
        code: `# weather_server.py — the whole thing, ~40 lines.
#   1. Server("weather-server")          → identity + capabilities container
#   2. @app.list_tools()                 → advertise tools (schema = contract)
#   3. @app.call_tool()                  → dispatch on name, validate, do work
#   4. raise ValueError(...)             → model-readable, in-protocol errors
#   5. stdio_server() + app.run()        → transport loop (stdout is sacred)
#
# Client config (e.g. claude_desktop_config.json) that launches it:
#   {
#     "mcpServers": {
#       "weather": { "command": "python", "args": ["weather_server.py"] }
#     }
#   }`,
        explanation: [
          "Five moving parts, and each maps to a design decision you can defend: **identity** (the server name), **advertisement** (list_tools + JSON Schema as the model's contract), **dispatch + validation** (call_tool), **in-protocol error surfacing** (raise → model-readable observation), and **transport** (stdio, stdout untouched).",
          "The client config is the last piece the interview loves: MCP servers are **not** long-running services you deploy — the host **launches them on demand** as subprocesses and speaks JSON-RPC over the pipe. That's why there's no port, no framework, no `while True` server loop of your own — `app.run` is the loop, and the host owns the lifecycle.",
          "==If you can whiteboard these five parts and explain what breaks when each is wrong, you understand MCP at the level the role demands== — which is the entire point of reading real code instead of building another toy.",
        ],
        checkpoint: {
          question:
            "Where does the MCP server process actually live in a typical local setup?",
          options: [
            "It's a long-running microservice you deploy behind a load balancer",
            "It's a subprocess the host application launches on demand and speaks JSON-RPC to over stdio; the host owns its lifecycle",
            "It runs inside the LLM's context window as a sandboxed function",
            "It's a browser worker the client spins up per request",
          ],
          correct: 1,
          explanation:
            "In the local/stdio model, the host (Claude Desktop, an IDE, your orchestrator) reads its config, launches the server as a child process, and communicates over stdin/stdout with JSON-RPC. There's no port or deployment — the host manages start/stop. (Remote MCP over HTTP/SSE is the other model, but the stdio subprocess pattern is the one you'll draw first.)",
        },
      },
    ],
    recap: [
      "**Capabilities vs. transport is the core split.** One `Server` object holds tools/resources/prompts; the transport (stdio, HTTP/SSE) is plugged in at the end. The same server code runs anywhere — that portability is why MCP is a *protocol*.",
      "**The `inputSchema` is the contract, not documentation.** JSON Schema constrains what the model can pass before it ever calls. `required` is your first line of input validation; drop it and the burden falls on every handler.",
      "**Tool `description` is model-facing prompt engineering.** It's the only signal the LLM has for whether/how to call. Vague descriptions cause mis-selection and bad arguments.",
      "**A raised error is a message to the model, not a crash.** The SDK turns exceptions into tool-error observations. Write clean, model-readable error text so the agent can recover; never leak stack traces or fabricate data on failure.",
      "**stdout is the JSON-RPC channel — never print to it.** All logging goes to stderr. A stray `print` (yours or a library's) corrupts the stream and disconnects the client. This is the #1 stdio-server bug.",
      "**MCP servers are launched, not deployed (in the stdio model).** The host runs your script as a subprocess and owns its lifecycle; there's no port, no framework, no server loop of your own — `app.run` is the loop.",
    ],
  },

  // ─── ROADMAP SKELETONS (in development) ─────────────────────────────────────
  // Published so the Code Labs browser shows a real roadmap, not one lonely lab.
  // Each carries a real intro + an outline of the steps being authored.
  {
    id: "rag-pipeline-min",
    title: "Read a Production RAG Pipeline",
    subtitle:
      "Walk a real retrieval-augmented-generation pipeline end to end — chunk → embed → retrieve → rerank → ground — and reason about the design decision behind every stage: where recall is lost, why the reranker exists, and how the grounding step stops the model from answering off-context.",
    tag: "RAG · Python",
    difficulty: "core",
    minutes: 22,
    status: "upcoming",
    intro: {
      scenario:
        "A support team wants the assistant to answer from *their* 40k-document knowledge base, not from the model's memory. Naive 'stuff the top-3 chunks into the prompt' works in a demo and falls apart in production: the right chunk isn't retrieved, the prompt blows the context budget, and the model answers confidently from the wrong passage. This lab reads the pipeline that fixes each of those — and, more importantly, teaches you to *locate* where a given failure was actually introduced. _New to the concept? See Retrieval (Domain Labs → Retrieval) for the mental model; this lab is the real code behind it._",
      whatYouBuild:
        "A single-file RAG pipeline: a boundary-aware chunker, an embedding + upsert step, a hybrid retriever (dense + BM25), a cross-encoder reranker over the top-k, and a grounded-generation call whose prompt forces citations — the exact shape you'll be asked to defend in a system-design round.",
      prereqs: [
        "Comfort reading Python (functions, list comprehensions, type hints)",
        "The idea that text is embedded into vectors and compared by cosine similarity",
        "Why an LLM 'grounded' on retrieved context hallucinates less than one answering from memory",
      ],
    },
    outline: [
      { title: "1 · Chunking: why boundary-aware beats fixed-token", note: "The recall you lose here can never be recovered downstream — split at semantic boundaries, not every N tokens." },
      { title: "2 · Embed + upsert: the index is a snapshot, not a mirror", note: "What breaks when the corpus changes and the index doesn't." },
      { title: "3 · Hybrid retrieve: dense recall + BM25 for exact terms", note: "Why pure vector search misses IDs, names, and rare legal terms — and how RRF fuses the two." },
      { title: "4 · Rerank: a cross-encoder over the top-k", note: "ANN is approximate; the reranker turns top-20-ish into a trustworthy top-5 before it ever hits the model." },
      { title: "5 · Ground + cite: forcing every claim back to a chunk", note: "The prompt contract + a citation-grounding check that catches answers the retrieved context can't support." },
    ],
  },
  {
    id: "multi-agent-orchestrator-min",
    title: "Read a Multi-Agent Orchestrator",
    subtitle:
      "Walk a planner → worker → critic loop line by line — how the planner decomposes a task, how workers execute sub-steps with tools, how the critic gates the result, and the control-flow decisions (max iterations, when to stop, how state passes between agents) that separate a robust loop from an infinite-loop token bonfire.",
    tag: "Agents · Python",
    difficulty: "advanced",
    minutes: 26,
    status: "upcoming",
    intro: {
      scenario:
        "A single agent with ten tools becomes unsteerable: it forgets the plan, loops, and burns tokens. The team splits the work into roles — a **planner** that decomposes the task, **workers** that each own a narrow sub-step, and a **critic** that judges whether the result is good enough or the loop must continue. The wins are real, but so are the new failure modes: loops that never terminate, state that doesn't propagate, a critic that rubber-stamps. This lab reads the orchestrator that gets the control flow right. _See Agents (Domain Labs → Agents / Agent Lab) for the concept; this is the code behind the loop._",
      whatYouBuild:
        "A planner/worker/critic orchestrator: a planner that emits a structured task list, a worker dispatch that runs each sub-task with tools, a critic that scores the output against the goal, and the loop controller (max-iterations, stop condition, state hand-off) that ties them together safely.",
      prereqs: [
        "Comfort reading Python (async/await, dataclasses, dict-based state)",
        "The single-agent tool-calling loop (see the MCP lab for how one tool call works)",
        "Why an unbounded agent loop is a cost and reliability risk",
      ],
    },
    outline: [
      { title: "1 · The planner: decompose into a structured task list", note: "Why a typed plan (not free-text) is what makes the rest of the loop inspectable and resumable." },
      { title: "2 · Worker dispatch: one narrow role per sub-task", note: "How scoping tools per worker cuts mis-selection — and how results flow back into shared state." },
      { title: "3 · The critic: gate on the goal, not on vibes", note: "LLM-as-critic against an explicit rubric; why a rubber-stamp critic is worse than none." },
      { title: "4 · The loop controller: max-iters, stop condition, state", note: "The three lines that stop an infinite loop — and how state passes between planner, worker, and critic without leaking the whole history into every call." },
    ],
  },
  {
    id: "eval-harness-min",
    title: "Read an LLM Eval Harness",
    subtitle:
      "Walk a real evaluation harness — an LLM-as-judge scored against an explicit rubric, wired into a CI gate that blocks a deploy on regression. Reason about the decisions that make an eval *trustworthy*: cross-model judging to avoid self-preference bias, a frozen baseline as the floor, and a threshold that fails the build instead of a human's optimism.",
    tag: "Evals · Python",
    difficulty: "core",
    minutes: 20,
    status: "upcoming",
    intro: {
      scenario:
        "'Accuracy looks great' is not a number, and 'we'll eyeball a few outputs' does not survive contact with a prompt change at 2pm on a Thursday. The team needs an eval that runs in CI: every prompt or model change scores a fixed test set against a rubric, and the build fails if faithfulness drops below the frozen baseline. This lab reads that harness — and shows why the *judge* is itself a system with biases you have to design around. _See Evaluation (Domain Labs → Evaluation) for the concept; this is the code that enforces it._",
      whatYouBuild:
        "An eval harness: a test-set loader, an LLM-as-judge call scored against a rubric (with structured JSON output), an aggregation step that produces per-metric scores, a baseline comparison, and a CI gate that exits non-zero when a metric regresses past its threshold.",
      prereqs: [
        "Comfort reading Python (functions, JSON, simple stats)",
        "What faithfulness / answer-relevance mean for a RAG answer",
        "Why a model judging its own family's outputs is biased toward them",
      ],
    },
    outline: [
      { title: "1 · The test set: real production queries, versioned", note: "Why synthetic-only eval sets lie, and how the set becomes a growing regression suite." },
      { title: "2 · LLM-as-judge: rubric in, structured score out", note: "Forcing the judge to return JSON scored per rubric dimension — and cross-model judging to dodge self-preference bias." },
      { title: "3 · Aggregate + baseline: the floor you must not fall below", note: "Turning per-case judgments into per-metric numbers and comparing against a frozen baseline." },
      { title: "4 · The CI gate: exit non-zero on regression", note: "The few lines that turn an eval into a deploy blocker — threshold, delta-from-baseline, and a readable failure message." },
    ],
  },
  {
    id: "guardrails-moderation-min",
    title: "Read a Guardrails / Moderation Pipeline",
    subtitle:
      "Walk an input/output filtering pipeline — how a request is screened before it reaches the model (prompt-injection, PII, policy) and how the response is screened before it reaches the user (PII leakage, off-topic, harmful content). Reason about the ordering, the fail-open-vs-fail-closed decision, and why guardrails are defense-in-depth, not a single magic classifier.",
    tag: "Safety · Python",
    difficulty: "core",
    minutes: 19,
    status: "upcoming",
    intro: {
      scenario:
        "A customer-facing assistant will be probed on day one: users try prompt injection, paste in PII, and steer it off-topic; the model in turn can leak context or emit something it shouldn't. A single classifier isn't enough. The team builds a pipeline with an **input stage** (screen the request before it costs a model call) and an **output stage** (screen the response before the user sees it), each a layered set of cheap-to-expensive checks. This lab reads that pipeline and the judgment calls inside it — especially *fail-open vs fail-closed*, which is a real production trade-off, not a checkbox. _See Production (Domain Labs → Production) for where this sits in the stack._",
      whatYouBuild:
        "A guardrails pipeline: an input filter (regex/PII scrub → injection heuristic → a moderation-model call), an output filter (PII re-scan → policy/topic check → a moderation-model call), and the orchestration that decides — per stage — whether a tripped guard blocks, redacts, or logs-and-continues.",
      prereqs: [
        "Comfort reading Python (functions, regex basics, early returns)",
        "What prompt injection is and why user input can't be trusted",
        "The difference between failing open (allow on error) and failing closed (block on error)",
      ],
    },
    outline: [
      { title: "1 · Input stage: cheap checks first, model call last", note: "Ordering guards by cost — regex/PII scrub and an injection heuristic run before you spend a moderation-model call." },
      { title: "2 · Output stage: never trust the model's response either", note: "Re-scanning the generated answer for PII leakage, off-topic drift, and policy violations before it reaches the user." },
      { title: "3 · The decision: block, redact, or log-and-continue", note: "Per-stage severity and the fail-open-vs-fail-closed call — the trade-off that decides whether a bug becomes a breach or an outage." },
    ],
  },

  // ─── NEW ROADMAP SKELETONS (2026-07-03) ──────────────────────────────────────
  // Eight read-and-reason walkthroughs, published as outlines first. Each carries a
  // full intro + an ordered outline of the planned steps + a recap of takeaways.
  {
    id: "tokenizer-from-scratch",
    title: "Build a BPE Tokenizer From Scratch",
    subtitle:
      "Walk a byte-pair-encoding tokenizer end to end — train the merge table from a corpus, then encode text into token ids and decode them back. Reason about why subword tokenization sits between characters and words, where the vocabulary budget goes, and what breaks on unseen scripts, whitespace, and long digit runs.",
    tag: "Tokenizer · Python",
    difficulty: "core",
    minutes: 24,
    status: "upcoming",
    intro: {
      scenario:
        "Every prompt you send is first cut into tokens, and that boundary decision quietly drives cost, context limits, and how the model 'sees' rare words. Teams that treat the tokenizer as a black box get surprised: a JSON-heavy prompt costs 2x what they estimated, a non-English user hits the context wall twice as fast, and a model fumbles arithmetic because digits split unpredictably. This lab reads a real byte-pair-encoding tokenizer so you can explain *why* a word becomes N tokens and what a vocabulary size actually buys. _See the token-cost mental model in Domain Labs → Retrieval / Production; this is the code behind it._",
      whatYouBuild:
        "A single-file BPE tokenizer: a trainer that learns a merge table from raw bytes, and an encoder/decoder pair that round-trips arbitrary UTF-8 text through token ids using that learned vocabulary — the exact shape behind GPT-style tokenizers.",
      prereqs: [
        "Comfort reading Python (dicts, tuples, list comprehensions)",
        "That text is bytes and a token is a subword unit, not a whole word",
        "Why vocabulary size trades sequence length against embedding-table size",
      ],
    },
    outline: [
      { title: "1 · Start from bytes, not characters: the 256-symbol base vocabulary", note: "Why working over raw UTF-8 bytes guarantees every input is representable — no unknown-token holes for emoji or unseen scripts." },
      { title: "2 · Count byte-pair frequencies and apply the highest-frequency merge", note: "The core training step: tally adjacent pairs across the corpus, merge the most frequent into one new symbol, repeat." },
      { title: "3 · Grow the merge table to the target vocabulary size", note: "The training loop and its stop condition — how vocab size sets the number of merges and where diminishing returns kick in." },
      { title: "4 · Encode: apply merges in learned order to turn text into token ids", note: "Why merges must be applied in the exact rank order they were learned, or encode/decode desync." },
      { title: "5 · Decode: map ids back to bytes and reconstruct the string", note: "Lossless round-trip, and the subtlety of decoding a partial token stream mid-generation." },
      { title: "6 · Failure tour: whitespace, digits, and out-of-distribution scripts", note: "Where fixed merges misbehave — leading-space handling, long digit runs, and languages absent from training." },
    ],
    recap: [
      "Byte-level base vocabulary makes the tokenizer total: any UTF-8 input encodes, so there is no true unknown token — only inefficient splits.",
      "Vocabulary size is a real system knob: bigger vocab means shorter sequences (cheaper context) but a larger embedding table and softmax.",
      "Merges are order-dependent; encode and decode share the same ranked merge table, and a version mismatch silently corrupts ids.",
      "Tokenization is not language-neutral — non-English text and code often cost more tokens per character, which is a cost and context-window issue, not a bug.",
    ],
  },
  {
    id: "attention-from-scratch",
    title: "Implement Attention From Scratch",
    subtitle:
      "Walk scaled dot-product attention and then multi-head attention in NumPy/PyTorch — queries, keys, values, the scaling factor, the causal mask, and why splitting into heads buys you more than one big attention. Reason about the shapes at every step and what each design choice costs at inference time.",
    tag: "Attention · Python",
    difficulty: "advanced",
    minutes: 28,
    status: "upcoming",
    intro: {
      scenario:
        "Attention is the one mechanism every transformer question circles back to, and reciting 'softmax of QK^T' is not the same as being able to trace the tensor shapes or explain why the scaling factor exists. Engineers who have only used attention through a library freeze when asked why it is O(n^2), why there are multiple heads, or what the causal mask actually does. This lab reads a from-scratch implementation so the mechanism stops being a spell and becomes something you can debug. _See the transformer concept in Domain Labs; this is the arithmetic underneath it._",
      whatYouBuild:
        "A from-scratch attention module: scaled dot-product attention with an optional causal mask, wrapped into a multi-head attention layer that projects, splits into heads, attends, and recombines — the core block of every decoder-only model.",
      prereqs: [
        "Comfort reading Python and NumPy/PyTorch tensor code",
        "Matrix multiplication and softmax",
        "That a transformer processes a sequence of token embeddings in parallel",
      ],
    },
    outline: [
      { title: "1 · Project inputs into queries, keys, and values", note: "Three learned linear maps from the same embeddings — why Q, K, V are separate projections and not the raw input." },
      { title: "2 · Score with QK^T and scale by 1/sqrt(d_k)", note: "Why the dot products are divided by sqrt(head dim) — unscaled scores saturate softmax and kill gradients." },
      { title: "3 · Apply the causal mask before softmax", note: "Setting future positions to -inf so a token can only attend to itself and the past; why the mask goes before, not after, softmax." },
      { title: "4 · Softmax to weights, then weight the values", note: "Turning scores into a distribution per query and mixing the value vectors — the actual 'attending'." },
      { title: "5 · Split into heads and run attention per head", note: "Reshaping d_model into (heads x head_dim) so each head learns a different relation subspace in parallel." },
      { title: "6 · Concatenate heads and project the output", note: "Recombining head outputs and the final output projection — restoring the model dimension for the next layer." },
      { title: "7 · Shapes and cost: why attention is O(n^2) in sequence length", note: "The n-by-n score matrix as the memory and compute bottleneck, and what KV-cache buys at decode time." },
    ],
    recap: [
      "Q, K, V are three independent projections of the same input; the asymmetry between query and key is what lets a token search for what it needs.",
      "The 1/sqrt(d_k) scale is not cosmetic — without it, large dot products push softmax into saturation and gradients vanish.",
      "The causal mask must be applied to the raw scores (as -inf) before softmax, so masked positions contribute exactly zero weight.",
      "Multiple heads are cheaper and more expressive than one wide attention: each head attends in a lower-dimensional subspace, then outputs are concatenated.",
      "The n-by-n attention matrix makes cost quadratic in sequence length — the reason long context is expensive and the KV-cache matters at inference.",
    ],
  },
  {
    id: "rag-pipeline",
    title: "Build a RAG Pipeline End to End",
    subtitle:
      "Walk a retrieval-augmented-generation pipeline from raw documents to a grounded answer — chunk, embed, store in a vector index, retrieve, rerank, and ground the generation in the retrieved context. Reason about where recall is lost, why the reranker exists, and how grounding stops the model from answering off-context.",
    tag: "RAG · Python",
    difficulty: "core",
    minutes: 26,
    status: "upcoming",
    intro: {
      scenario:
        "A team wants the assistant to answer from their own knowledge base, not the model's memory. The demo version — embed everything, grab the top-3, stuff them in the prompt — works on a slide and collapses in production: the right passage is not retrieved, the prompt overflows, and the model answers confidently from the wrong chunk. This lab reads the full pipeline that fixes each stage and, more usefully, teaches you to locate which stage introduced a given failure. _See Retrieval in Domain Labs for the mental model; this is the code that implements it._",
      whatYouBuild:
        "A single-file RAG pipeline: a boundary-aware chunker, an embed-and-upsert step into a vector store, a retriever, a cross-encoder reranker over the top-k, and a grounded-generation call whose prompt forces citations back to the source chunks.",
      prereqs: [
        "Comfort reading Python (functions, list comprehensions, type hints)",
        "That text is embedded into vectors compared by cosine similarity",
        "Why a grounded answer hallucinates less than one answered from memory",
      ],
    },
    outline: [
      { title: "1 · Chunk documents at semantic boundaries", note: "Why boundary-aware chunking beats fixed-token windows — recall lost here can never be recovered downstream." },
      { title: "2 · Embed each chunk and upsert into the vector store", note: "Turning chunks into vectors with stable ids and metadata; the index is a snapshot, not a live mirror of the corpus." },
      { title: "3 · Retrieve the top-k candidates for a query", note: "Embedding the query the same way and pulling nearest neighbors — and why you retrieve more than you plan to use." },
      { title: "4 · Rerank the candidates with a cross-encoder", note: "Turning an approximate top-20 into a trustworthy top-5 before anything reaches the model." },
      { title: "5 · Assemble the grounded prompt within the context budget", note: "Packing the reranked chunks with source markers and staying under the token limit." },
      { title: "6 · Generate with a citation contract and verify grounding", note: "Forcing every claim back to a chunk id and catching answers the retrieved context cannot support." },
    ],
    recap: [
      "Retrieval quality is set at chunk time: a semantically-split corpus is the ceiling on everything downstream.",
      "Retrieve wide, then rerank narrow — dense ANN recall is approximate, and the cross-encoder is what makes the final top-k trustworthy.",
      "The index is a snapshot; stale documents in, stale answers out — reindexing cadence is a design decision, not an afterthought.",
      "Grounding is enforced by the prompt contract plus a verification pass, not by hope — an ungrounded citation is a caught failure, not a shipped one.",
    ],
  },
  {
    id: "eval-harness",
    title: "Build an LLM Eval Harness With a CI Gate",
    subtitle:
      "Walk an evaluation harness that scores model outputs with an LLM-as-judge against an explicit rubric, aggregates per-metric scores, compares them to a frozen baseline, and fails the build on regression. Reason about the decisions that make an eval trustworthy: cross-model judging, a versioned test set, and a threshold that blocks a deploy instead of a human's optimism.",
    tag: "Eval · Python",
    difficulty: "core",
    minutes: 22,
    status: "upcoming",
    intro: {
      scenario:
        "'The outputs look better' is not a number, and eyeballing a few responses does not survive a prompt tweak shipped at 2pm on a Thursday. The team needs an eval that runs in CI: every prompt or model change scores a fixed test set against a rubric, and the build fails if quality drops below the frozen baseline. This lab reads that harness and shows why the judge is itself a system with biases you have to design around. _See Evaluation in Domain Labs for the concept; this is the code that enforces it._",
      whatYouBuild:
        "An eval harness: a versioned test-set loader, an LLM-as-judge call that returns structured per-rubric scores, an aggregation step, a baseline comparison, and a CI gate that exits non-zero when a metric regresses past its threshold.",
      prereqs: [
        "Comfort reading Python (functions, JSON, simple stats)",
        "What faithfulness and answer-relevance mean for an answer",
        "Why a model judging its own family's outputs is biased toward them",
      ],
    },
    outline: [
      { title: "1 · Load a versioned test set of real production queries", note: "Why synthetic-only sets lie, and how the test set becomes a growing regression suite over time." },
      { title: "2 · Score each case with an LLM-as-judge and a rubric", note: "Forcing the judge to return JSON scored per rubric dimension so results are machine-comparable, not prose." },
      { title: "3 · Use a cross-family judge to dodge self-preference bias", note: "Why a model tends to rate its own family's style higher, and how picking a different judge model controls for it." },
      { title: "4 · Aggregate per-case judgments into per-metric scores", note: "Turning individual verdicts into a small set of numbers you can track run over run." },
      { title: "5 · Compare against a frozen baseline", note: "The floor you must not fall below, and why the baseline is pinned to a commit, not recomputed each run." },
      { title: "6 · Fail the CI build on regression", note: "The few lines that turn an eval into a deploy blocker — threshold, delta-from-baseline, and a readable failure message." },
    ],
    recap: [
      "An eval is only a signal if it runs automatically — the CI gate, not the dashboard, is what actually stops a regression from shipping.",
      "The judge is a system with biases; cross-family judging and a fixed rubric are how you keep 'LLM scored it 8/10' from being noise.",
      "A frozen, commit-pinned baseline is the whole game: without a floor, every run just reports numbers no one acts on.",
      "Structured JSON scores per rubric dimension make the eval diffable — you can see which dimension regressed, not just that the average dropped.",
    ],
  },
  {
    id: "finetune-loop",
    title: "Build a LoRA Fine-Tune Loop",
    subtitle:
      "Walk a parameter-efficient fine-tuning loop with LoRA — format the dataset, configure the PEFT adapters, run the training loop, then merge or serve the adapter. Reason about why you freeze the base weights, where the rank and target-module choices land on the quality-vs-cost curve, and what to check before you trust the result.",
    tag: "Fine-tune · Python",
    difficulty: "advanced",
    minutes: 30,
    status: "upcoming",
    intro: {
      scenario:
        "Prompting gets a team most of the way, but the model still misses a house style or a domain vocabulary that no amount of few-shot examples fixes. Full fine-tuning is out — too much GPU, too much risk of catastrophic forgetting. LoRA is the answer they reach for: freeze the base model, train small low-rank adapters, and ship a few megabytes instead of a few gigabytes. This lab reads that loop so you can explain what LoRA actually trains, what the rank knob does, and how the adapter gets served. _See Fine-tuning in Domain Labs for where this sits versus prompting and RAG._",
      whatYouBuild:
        "A LoRA fine-tune loop: a dataset formatter into the model's chat template, a PEFT/LoRA config over chosen target modules, a training loop with the base weights frozen, and a merge-or-serve step that turns the adapter into something you can deploy.",
      prereqs: [
        "Comfort reading Python and PyTorch training-loop code",
        "That fine-tuning updates model weights, while RAG and prompting do not",
        "Roughly what a low-rank matrix decomposition is",
      ],
    },
    outline: [
      { title: "1 · Format the dataset into the model's chat template", note: "Matching the exact prompt/response format the base model expects, and masking the prompt tokens out of the loss." },
      { title: "2 · Configure LoRA: rank, alpha, and target modules", note: "Choosing which attention/MLP projections get adapters and how rank trades capacity against parameter count." },
      { title: "3 · Freeze the base weights and attach the adapters", note: "Why only the low-rank matrices train, and how that avoids catastrophic forgetting and shrinks the optimizer state." },
      { title: "4 · Run the training loop with the right hyperparameters", note: "Learning rate, batching, and gradient accumulation for adapter training — plus watching the loss for the usual failure signs." },
      { title: "5 · Evaluate on a held-out set before trusting the adapter", note: "Checking the fine-tune actually helped on target behavior without regressing general capability." },
      { title: "6 · Merge or serve: adapter-at-runtime vs merged weights", note: "The deploy fork — keep adapters swappable at load time, or bake them into the base for a single artifact." },
    ],
    recap: [
      "LoRA trains small low-rank matrices while the base stays frozen — a few megabytes of adapter, not a full fine-tune, which is why it dodges catastrophic forgetting.",
      "Rank and target modules are the capacity knob: too low underfits the new behavior, too high loses LoRA's efficiency advantage.",
      "Loss masking matters — training on the prompt tokens as well as the response teaches the model the wrong objective.",
      "The merge-vs-serve decision is a deployment trade: swappable adapters give flexibility, merged weights give a single simpler artifact.",
    ],
  },
  {
    id: "vector-search-hnsw",
    title: "Build HNSW Vector Search With Hybrid Retrieval",
    subtitle:
      "Walk an HNSW-style approximate-nearest-neighbor index and then fuse it with BM25 keyword search into a hybrid retriever. Reason about the graph structure that makes ANN fast, the recall-vs-latency knobs, and why dense and sparse retrieval catch different failures — so exact terms and semantic matches both survive.",
    tag: "Vectors · Python",
    difficulty: "advanced",
    minutes: 28,
    status: "upcoming",
    intro: {
      scenario:
        "At a few thousand vectors you can brute-force every query; at a few million you cannot, and 'just use a vector DB' hides the one decision that dictates whether retrieval is fast and correct. Pure semantic search also has a blind spot: it fuzzes exact identifiers, product codes, and rare names that a keyword index would nail. This lab reads an HNSW index and a hybrid retriever so you can explain how approximate search stays fast and why you fuse dense and sparse instead of choosing one. _See Retrieval in Domain Labs for how this feeds a RAG pipeline._",
      whatYouBuild:
        "A vector-search module: an HNSW-style multi-layer proximity graph with insert and search, plus a hybrid retriever that runs dense ANN alongside a BM25 keyword search and fuses the two ranked lists.",
      prereqs: [
        "Comfort reading Python (classes, graphs as dicts, heaps)",
        "That similarity search finds nearest vectors by cosine or dot product",
        "Why exact brute-force search does not scale to millions of vectors",
      ],
    },
    outline: [
      { title: "1 · Why brute-force k-NN stops scaling", note: "The linear-scan cost per query and the motivation for an approximate index that trades a little recall for a lot of speed." },
      { title: "2 · Build the HNSW multi-layer proximity graph", note: "Sparse long-range links up top, dense links at the bottom — how the layered graph gives logarithmic-ish search." },
      { title: "3 · Insert a vector: connect it across layers", note: "Assigning a random top layer and greedily linking to nearby neighbors on the way down, capped by the M parameter." },
      { title: "4 · Search: greedy descent then ef-controlled beam", note: "Falling through layers to a good entry point, then widening the search with efSearch — the recall-vs-latency knob." },
      { title: "5 · Add BM25 keyword scoring alongside dense retrieval", note: "Why exact terms, IDs, and rare names need a sparse index that vectors alone will fuzz away." },
      { title: "6 · Fuse dense and sparse with reciprocal rank fusion", note: "Combining two ranked lists into one without needing their scores to share a scale." },
    ],
    recap: [
      "ANN is an accuracy-for-speed trade: HNSW gives near-brute-force recall at a fraction of the cost, and efSearch is the dial between the two.",
      "The layered graph is the trick — sparse upper layers route a query near its neighborhood fast, dense lower layers refine it.",
      "Dense and sparse retrieval fail differently: vectors catch paraphrase and meaning, BM25 catches exact tokens and rare identifiers.",
      "Reciprocal rank fusion combines the two by rank, not raw score, so you never have to reconcile incompatible score scales.",
    ],
  },
  {
    id: "prompt-injection-detector",
    title: "Build a Prompt-Injection Guardrail",
    subtitle:
      "Walk an input classifier plus an output validator that together defend an LLM app from prompt injection — screening the request before it reaches the model and screening the response before it reaches the user. Reason about defense-in-depth, the fail-open-vs-fail-closed call, and why no single classifier is enough.",
    tag: "Safety · Python",
    difficulty: "core",
    minutes: 20,
    status: "upcoming",
    intro: {
      scenario:
        "A customer-facing assistant gets probed on day one: users try to override the system prompt, exfiltrate hidden instructions, or steer the model off-policy, and a compromised model can then leak context or do something it shouldn't. One classifier is not a guardrail. The team builds an input stage that screens the request before it costs a model call and an output stage that screens the response before the user sees it. This lab reads that pipeline and the judgment calls inside it — especially fail-open vs fail-closed, a real production trade-off. _See Production in Domain Labs for where guardrails sit in the stack._",
      whatYouBuild:
        "A guardrail pipeline: an input classifier (heuristic injection patterns plus a small model check) that scores and routes the request, and an output validator that checks the response for leaked instructions, policy violations, and off-topic drift before it returns.",
      prereqs: [
        "Comfort reading Python (functions, regex basics, early returns)",
        "What prompt injection is and why user input cannot be trusted",
        "The difference between failing open (allow on error) and failing closed (block on error)",
      ],
    },
    outline: [
      { title: "1 · Classify the input: cheap heuristics before a model call", note: "Pattern-matching known injection shapes first, so an obvious attack never costs a classifier model call." },
      { title: "2 · Score borderline inputs with a small classifier model", note: "Escalating ambiguous requests to a model that returns a structured risk verdict, not a free-text opinion." },
      { title: "3 · Route on the verdict: allow, sanitize, or block", note: "Turning a risk score into an action, and why sanitizing (stripping the injected instruction) beats a hard block for usability." },
      { title: "4 · Validate the output before it reaches the user", note: "Re-scanning the model's response for leaked system instructions, policy violations, and off-topic drift — never trust the response either." },
      { title: "5 · Decide fail-open vs fail-closed per stage", note: "What happens when a guard itself errors or times out — the trade-off between an outage and a breach, made explicitly." },
      { title: "6 · Log every decision for tuning and audit", note: "Why you record trips and near-misses — the guardrail is only as good as the feedback loop that retunes it." },
    ],
    recap: [
      "Guardrails are defense-in-depth: an input classifier and an output validator catch different failures, and neither alone is sufficient.",
      "Order checks by cost — cheap heuristics screen the obvious attacks before you spend a model call on the ambiguous ones.",
      "Fail-open vs fail-closed is a deliberate per-stage decision, not a default; it is the choice between a possible outage and a possible breach.",
      "Never trust the model's own output — a successful injection shows up in the response, so the output stage is as important as the input stage.",
    ],
  },
  {
    id: "streaming-server",
    title: "Build an SSE Token-Streaming Server",
    subtitle:
      "Walk a server-sent-events inference server that streams tokens as they are generated — the prefill/decode split, the SSE event contract, and backpressure when a slow client can't keep up. Reason about why streaming changes the latency the user feels, and where a naive implementation drops tokens or leaks resources.",
    tag: "Serving · Python",
    difficulty: "advanced",
    minutes: 24,
    status: "upcoming",
    intro: {
      scenario:
        "A user staring at a spinner for eight seconds churns; the same eight-second answer feels instant when the first words appear in 300ms. Streaming is what buys that, but the naive version bites back: a slow or disconnected client stalls the generator, tokens pile up in a buffer, and a dropped connection leaks a GPU-bound task that keeps decoding into the void. This lab reads a real SSE streaming server so you can explain the prefill/decode split, the event contract, and how backpressure and cancellation keep it honest under load. _See Production in Domain Labs for where serving fits._",
      whatYouBuild:
        "An SSE token-streaming inference server: an endpoint that runs prefill then streams decode-step tokens as server-sent events, with backpressure to a slow client and cancellation that stops generation when the client disconnects.",
      prereqs: [
        "Comfort reading Python (async/await, generators, async iterators)",
        "That an LLM generates one token per decode step, autoregressively",
        "Roughly what server-sent events are versus a single JSON response",
      ],
    },
    outline: [
      { title: "1 · Split prefill from decode: where time-to-first-token comes from", note: "Prefill processes the whole prompt once; decode emits one token per step — and the split is why streaming feels fast." },
      { title: "2 · Define the SSE event contract", note: "The event/data framing for token deltas, a done sentinel, and an error event — the wire format the client parses incrementally." },
      { title: "3 · Stream decode steps as an async generator", note: "Yielding each token as it is produced so the transport can flush it, instead of buffering the whole completion." },
      { title: "4 · Apply backpressure when the client is slow", note: "Bounding the send queue so a slow reader throttles generation instead of ballooning memory." },
      { title: "5 · Cancel generation on client disconnect", note: "Detecting a dropped connection and tearing down the decode task — the fix for GPU work that outlives its request." },
      { title: "6 · Handle errors and timeouts mid-stream", note: "Emitting a clean error event and closing the stream when generation fails partway, so the client is never left hanging." },
    ],
    recap: [
      "Streaming trades total latency for perceived latency: time-to-first-token, set by prefill, is what the user actually feels.",
      "The prefill/decode split is the mental model — one heavy pass over the prompt, then a token-per-step loop that the server flushes as it goes.",
      "Backpressure is mandatory, not optional: without a bounded queue a slow client turns into unbounded server memory growth.",
      "Cancellation on disconnect is what stops orphaned decode tasks from burning GPU on responses no one will read.",
    ],
  },
];

// Convenience lookup by id (parity with other GSL data modules).
export const CODE_LAB_BY_ID = Object.fromEntries(CODE_LABS.map((l) => [l.id, l]));
