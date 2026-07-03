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
    steps: [
      {
        title: "1 · Start from bytes: the 256-symbol base vocabulary",
        language: "python",
        code: `# Every string is first encoded to raw UTF-8 bytes. Each byte value
# (0..255) is a base token. This is why there is no "unknown token":
# any input, in any script, is always a sequence of bytes.
text = "hi 🙂"
tokens = list(text.encode("utf-8"))   # -> [104, 105, 32, 240, 159, 153, 130]

# The starting vocabulary is just the 256 byte values, mapping each id
# to the single byte it stands for.
vocab = {i: bytes([i]) for i in range(256)}
print(len(vocab))                       # 256`,
        explanation: [
          "A BPE tokenizer works over **bytes, not characters**. `\"hi 🙂\".encode(\"utf-8\")` yields seven byte values — notice the emoji is four bytes, and the space is one. Starting from the 256 possible byte values means the base vocabulary is *total*: ==every possible input string is representable, so there is no true out-of-vocabulary token== — only more or fewer merges applied to it.",
          "The alternative — a character-level or word-level base vocabulary — has holes. A character vocab must decide what to do with an unseen Unicode codepoint; a word vocab needs an explicit `<UNK>` token for any word it never saw. The byte base removes that entire failure class: an emoji, a Chinese character, or a corrupted byte all encode as *inefficient* sequences, never as an error.",
          "The tradeoff is that rare or non-Latin text starts out as *many* base tokens (the emoji is already 4), so before any merges it is expensive. The whole point of training is to learn merges that collapse common byte sequences back down — but text that never appeared in training stays near the byte level, which is the root of the 'non-English costs more tokens' effect.",
        ],
        checkpoint: {
          question:
            "Why do GPT-style tokenizers use a byte-level base vocabulary instead of a character-level one?",
          options: [
            "Bytes are faster to compare than Unicode characters at runtime",
            "A 256-byte base makes every possible input representable, so there is no true unknown token — unseen scripts just encode as more bytes",
            "Byte-level tokenization always produces fewer tokens than character-level",
            "It is required for the embedding table to fit in memory",
          ],
          correct: 1,
          explanation:
            "The byte base is *total*: all 256 byte values are in the vocabulary, so any UTF-8 string — emoji, unseen scripts, even malformed bytes — is always representable as a sequence of base tokens. A character-level base has to handle unseen codepoints with an <UNK> hole. Byte-level trades that away: nothing is unknown, it just encodes less efficiently when it wasn't seen in training.",
        },
      },
      {
        title: "2 · Count pair frequencies and apply the top merge",
        language: "python",
        code: `def get_pair_counts(ids):
    """Tally every adjacent pair across the token sequence."""
    counts = {}
    for a, b in zip(ids, ids[1:]):
        counts[(a, b)] = counts.get((a, b), 0) + 1
    return counts

def merge(ids, pair, new_id):
    """Replace every occurrence of \`pair\` with \`new_id\`."""
    out, i = [], 0
    while i < len(ids):
        if i < len(ids) - 1 and (ids[i], ids[i + 1]) == pair:
            out.append(new_id)   # collapse the pair into one new symbol
            i += 2
        else:
            out.append(ids[i])
            i += 1
    return out

ids = list("aaabdaaabac".encode("utf-8"))
top = max(get_pair_counts(ids), key=get_pair_counts(ids).get)  # (97, 97) = "aa"
ids = merge(ids, top, 256)   # 256 is the first new token id`,
        explanation: [
          "This is the **core BPE training step**. `get_pair_counts` tallies every adjacent pair in the sequence; the most frequent pair is the one worth collapsing. In `\"aaabdaaabac\"` the pair `(a, a)` occurs most, so it becomes a single new symbol with id `256` — the first id past the byte range.",
          "`merge` rewrites the sequence, replacing each occurrence of that pair with the new id. ==Every merge grows the vocabulary by exactly one and shortens the sequence by the number of times the pair occurred.== That is the whole compression mechanic: frequent substrings get shorter representations, exactly like Huffman coding but learned greedily on pairs.",
          "The design choice is **greedy, frequency-first** merging. It is not globally optimal — a smarter algorithm might pick a slightly less frequent pair that enables better later merges — but greedy is fast, deterministic, and good enough in practice. Determinism matters more than optimality here: the same corpus must always produce the same merge table, or two runs of the tokenizer would disagree.",
        ],
        checkpoint: {
          question:
            "After one merge of the most frequent pair, what happens to the vocabulary and the sequence length?",
          options: [
            "Vocabulary shrinks by one; sequence gets longer",
            "Vocabulary grows by one; sequence shortens by the number of times that pair occurred",
            "Both stay the same size; only the ids are renumbered",
            "Vocabulary grows by the pair's frequency; sequence length is unchanged",
          ],
          correct: 1,
          explanation:
            "Each merge adds exactly one new symbol to the vocabulary (the merged pair gets one new id) and removes one token everywhere the pair occurred, so the sequence shrinks by the pair's frequency. That is the compression: trade a bigger vocabulary for shorter sequences, greedily, one frequent pair at a time.",
        },
      },
      {
        title: "3 · Train: grow the merge table to the target vocab size",
        language: "python",
        code: `def train_bpe(text, vocab_size):
    assert vocab_size >= 256
    ids = list(text.encode("utf-8"))
    merges = {}                       # (a, b) -> new_id, in learned order
    num_merges = vocab_size - 256

    for i in range(num_merges):
        counts = get_pair_counts(ids)
        if not counts:
            break                     # nothing left to merge
        pair = max(counts, key=counts.get)
        new_id = 256 + i
        ids = merge(ids, pair, new_id)
        merges[pair] = new_id         # record the rank (insertion order)

    return merges

merges = train_bpe(corpus_text, vocab_size=512)   # learns 256 merges`,
        explanation: [
          "The trainer just loops the count-and-merge step until the vocabulary reaches the target size. `vocab_size = 512` means `256` base bytes plus `256` learned merges. ==`merges` is an *ordered* dict: the insertion order IS the rank, and that rank is the single most important artifact the tokenizer produces.== Encoding must replay merges in exactly this order.",
          "`vocab_size` is a real **system knob**, not a hyperparameter you tune for accuracy. A larger vocabulary means more merges, so common words collapse into single tokens — shorter sequences, cheaper context, faster inference. But it also means a bigger embedding table and a bigger output softmax, both linear in vocab size. Real tokenizers land around 32k–128k for exactly this reason: past a point, extra merges only collapse increasingly rare strings, so sequence length barely drops while the model gets heavier.",
          "There are diminishing returns baked in. The first merges collapse the most frequent pairs and cut sequence length sharply; the ten-thousandth merge collapses some rare byte pattern that appears a handful of times. Plotting tokens-per-character against vocab size shows a steep early drop that flattens — which is why doubling the vocab does not halve your token bill.",
        ],
        checkpoint: {
          question:
            "A team doubles their tokenizer's vocab_size from 32k to 64k. What is the most accurate expected effect?",
          options: [
            "Sequences get roughly half as long, halving token cost",
            "Sequences get modestly shorter (diminishing returns) while the embedding table and output softmax get meaningfully larger",
            "Nothing changes because vocab size only affects training, not inference",
            "The model can now represent inputs it previously could not encode at all",
          ],
          correct: 1,
          explanation:
            "The base byte vocabulary already makes every input encodable, so doubling the vocab doesn't unlock new inputs. Extra merges collapse increasingly rare strings, so sequence length drops only modestly (diminishing returns) — while embedding and softmax cost grow linearly with vocab size. Vocab size trades a heavier model for shorter sequences, and the curve flattens fast.",
        },
      },
      {
        title: "4 · Encode: replay merges in learned rank order",
        language: "python",
        code: `def encode(text, merges):
    ids = list(text.encode("utf-8"))
    while len(ids) >= 2:
        counts = get_pair_counts(ids)
        # Pick the pair whose merge was learned EARLIEST (lowest rank).
        pair = min(counts, key=lambda p: merges.get(p, float("inf")))
        if pair not in merges:
            break                     # no learnable pair left
        ids = merge(ids, pair, merges[pair])
    return ids

ids = encode("the cat sat", merges)`,
        explanation: [
          "Encoding is training's mirror image, and the subtlety is the ranking. At each step we look at every adjacent pair present, but instead of picking the most *frequent* one (that was training), we pick the pair whose merge was learned **earliest** — `min(..., key=merges.get)`. ==Merges must be applied in the exact order they were learned, because later merges assume earlier ones already fired.==",
          "Why order matters: suppose training learned `(t, h) -> th` at rank 5 and `(th, e) -> the` at rank 40. To ever build `the`, the `t`+`h` merge must happen first. If encode applied merges by frequency-in-this-string instead of by learned rank, it could merge a different pair first, block the `th` merge, and produce a *different* token sequence than the model was trained on — which the model has never seen embeddings for.",
          "The loop stops when no remaining pair is in the merge table: at that point the sequence is fully tokenized. Note this greedy replay is not guaranteed to be the globally shortest tokenization, but it is **deterministic and consistent with training**, which is the only property that matters — the encoder and the training run must agree, exactly.",
        ],
        checkpoint: {
          question:
            "Why does encode pick the pair with the lowest merge rank rather than the most frequent pair in the current string?",
          options: [
            "Lowest rank happens to be the most frequent pair, so they are equivalent",
            "Merges are order-dependent — later merges assume earlier ones already fired, so replaying in learned rank order is the only way to reproduce the training tokenization",
            "Frequency counting is too slow to run at encode time",
            "It guarantees the globally shortest possible token sequence",
          ],
          correct: 1,
          explanation:
            "Training builds symbols hierarchically: 'the' can only form after 't'+'h' merged. Encode must replay merges in the exact rank order they were learned, or a later merge fires before its prerequisite and you get a token sequence the model never trained on. It is not about frequency or shortest-length — it is about reproducing the training-time tokenization deterministically.",
        },
      },
      {
        title: "5 · Decode: map ids back to bytes and reconstruct",
        language: "python",
        code: `def build_vocab(merges):
    vocab = {i: bytes([i]) for i in range(256)}
    for (a, b), new_id in merges.items():   # replay in learned order
        vocab[new_id] = vocab[a] + vocab[b]
    return vocab

def decode(ids, vocab):
    raw = b"".join(vocab[i] for i in ids)
    return raw.decode("utf-8", errors="replace")

vocab = build_vocab(merges)
assert decode(encode("round-trips cleanly", merges), vocab) == "round-trips cleanly"`,
        explanation: [
          "Decoding rebuilds the byte string for each id and concatenates. `build_vocab` reconstructs what every learned id expands to: id `256` might be `b\"aa\"`, and a higher id might be the bytes of a whole word — built by replaying the merges in order so each new symbol is the concatenation of its two parts. Decode then just looks up each id's bytes and joins them.",
          "The critical detail is `errors=\"replace\"` on the final `.decode(\"utf-8\")`. ==Because merges operate on raw bytes, a token boundary can fall in the middle of a multi-byte UTF-8 character.== During streaming generation, if you decode after every single token you may hold a *partial* multi-byte sequence — half of an emoji — which is not valid UTF-8 on its own. `errors=\"replace\"` keeps that from crashing, but the real fix is to buffer bytes and only emit complete characters.",
          "This is why the round-trip assert passes on complete input but streaming needs care. The byte-level design that made the tokenizer total (step 1) is the same design that lets a token split a character in half. It is a clean tradeoff: total coverage of all inputs, at the cost of a decode step that has to tolerate partial byte sequences mid-stream.",
        ],
        checkpoint: {
          question:
            "During streaming generation, why can decoding each token immediately produce a broken character?",
          options: [
            "The model sometimes emits token ids that are not in the vocabulary",
            "Because tokens are byte sequences, a token boundary can fall inside a multi-byte UTF-8 character, so a single token can be half of an emoji",
            "UTF-8 decoding is non-deterministic across platforms",
            "Streaming reorders tokens, so they arrive out of sequence",
          ],
          correct: 1,
          explanation:
            "Merges operate on raw bytes, not characters, so a token can hold only part of a multi-byte character (e.g. two of the four bytes of an emoji). Decoding that partial token alone is invalid UTF-8. The production fix is to buffer bytes across tokens and only flush complete characters; errors='replace' is just a guard so it degrades instead of crashing.",
        },
      },
      {
        title: "6 · Failure tour: whitespace, digits, and unseen scripts",
        language: "python",
        code: `# 1. Whitespace: BPE learns " the" (leading space) as its own token, so
#    " the" and "the" tokenize differently — a classic prompt-boundary bug.
encode(" the", merges)   != encode("the", merges)

# 2. Digits: no merge learns arbitrary numbers, so long runs split
#    unpredictably. "1234567" might become ["123", "45", "67"] — one reason
#    naive models fumble arithmetic. Modern tokenizers often split digits singly.
encode("1234567", merges)

# 3. Out-of-distribution scripts: text absent from training stays near the
#    byte level, so it costs far more tokens per character.
len(encode("日本語のテキスト", merges))   # many tokens: few merges apply`,
        explanation: [
          "**Whitespace** is the sharpest gotcha. BPE typically learns the leading space *into* the token — `\" the\"` is one token, distinct from `\"the\"`. So a prompt that ends `\"Answer:\"` versus `\"Answer: \"` hands the model different token sequences, and few-shot formatting that gets the spaces wrong measurably degrades results. ==The model attends to token ids, and `\" the\"` and `\"the\"` are genuinely different ids.==",
          "**Digits** expose the greedy-merge limitation. There is no merge for 'any number', so a long digit run is chopped by whatever partial-number merges happened to be frequent in training — `\"1234567\"` might split as `[\"123\", \"45\", \"67\"]`, and the split changes with the surrounding characters. This inconsistent chunking is a real reason base models struggle with multi-digit arithmetic, which is why several modern tokenizers force digits to split one at a time.",
          "**Unseen scripts** close the loop back to step 1. Japanese, Arabic, or code full of rare identifiers had few merges learned for them, so they stay close to the raw byte level — many tokens per visible character. That is not a bug: it is the direct, predictable consequence of a corpus-trained merge table. It shows up as a *cost and context-window* problem — the same paragraph costs a non-English user two to three times the tokens — and knowing to blame the tokenizer, not the model, is the senior insight here.",
        ],
        checkpoint: {
          question:
            "A non-English user reports hitting the context limit on inputs half the length an English user can send. What is the most likely cause?",
          options: [
            "The model has a separate, smaller context window for non-English text",
            "The tokenizer learned few merges for that script, so its text stays near the byte level and costs far more tokens per character",
            "Non-English characters are stored as unknown tokens that each take extra space",
            "A bug in the decode step is duplicating tokens",
          ],
          correct: 1,
          explanation:
            "Merges are learned from the training corpus, which is English-heavy. Scripts that appeared rarely got few merges, so their text barely collapses below the raw byte level — many tokens per character. Same context window, but each character eats more of it. This is a predictable property of a corpus-trained merge table, not a bug or an unknown-token issue.",
        },
      },
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
    steps: [
      {
        title: "1 · Project inputs into queries, keys, and values",
        language: "python",
        code: `import numpy as np

def projections(X, Wq, Wk, Wv):
    # X: (seq_len, d_model) token embeddings for one sequence.
    # Wq, Wk, Wv: (d_model, d_k) learned weight matrices.
    Q = X @ Wq   # (seq_len, d_k) — what each token is looking for
    K = X @ Wk   # (seq_len, d_k) — what each token offers as a key
    V = X @ Wv   # (seq_len, d_v) — the content each token carries
    return Q, K, V

np.random.seed(0)
seq_len, d_model, d_k = 4, 8, 8
X = np.random.randn(seq_len, d_model)
Wq, Wk, Wv = (np.random.randn(d_model, d_k) for _ in range(3))
Q, K, V = projections(X, Wq, Wk, Wv)
print(Q.shape, K.shape, V.shape)   # (4, 8) (4, 8) (4, 8)`,
        explanation: [
          "Attention never operates on the raw embeddings `X` directly. It first runs them through **three separate learned linear maps** to produce queries, keys, and values. `Q = X @ Wq` is what each token is *looking for*; `K = X @ Wk` is what each token *advertises*; `V = X @ Wv` is the content it will *hand over* if attended to.",
          "==The asymmetry between Q and K is the whole point.== If a token used the same vector as both its query and its key, attention would only ever measure self-similarity — token i attends to whatever looks most like token i. Separate `Wq` and `Wk` let a token *search for something different from itself*: a pronoun's query can match a noun's key without the pronoun and noun being similar embeddings. That asymmetry is what makes attention a lookup, not a clustering.",
          "The tradeoff is parameters and compute: three projection matrices instead of zero. But this is where attention gets its expressive power — the model learns *what to look for* (Wq), *how to be found* (Wk), and *what to communicate* (Wv) as three independent things. Collapsing any two would throw away a degree of freedom the model relies on.",
        ],
        checkpoint: {
          question:
            "Why are Q and K produced by separate projection matrices instead of reusing the same vector for both?",
          options: [
            "To halve the number of parameters in the attention layer",
            "So a token can search for something different from itself — separate Wq and Wk let query-key matches be asymmetric, not just self-similarity",
            "Because NumPy cannot multiply a matrix by itself",
            "To keep Q and K in different numerical ranges for stability",
          ],
          correct: 1,
          explanation:
            "If query and key came from the same vector, attention would only measure how similar a token is to itself and others — pure self-similarity. Separate Wq and Wk let a token's query match a different token's key even when their embeddings are dissimilar (a pronoun finding its antecedent). That asymmetry turns attention into a learned lookup rather than a similarity cluster.",
        },
      },
      {
        title: "2 · Score with QKᵀ and scale by 1/√dₖ",
        language: "python",
        code: `def scores(Q, K):
    d_k = Q.shape[-1]
    # Every query dotted with every key -> (seq_len, seq_len) score matrix.
    raw = Q @ K.T
    # Scale by 1/sqrt(d_k): dot products grow with dimension, and large
    # values push softmax into a near-one-hot regime where gradients vanish.
    return raw / np.sqrt(d_k)

S = scores(Q, K)
print(S.shape)                     # (4, 4): row i = how token i scores every token
print(np.std(Q @ K.T), np.std(S))  # unscaled std is ~sqrt(d_k)x larger`,
        explanation: [
          "`Q @ K.T` produces an **n×n score matrix**: entry `(i, j)` is the dot product of token i's query with token j's key — how much token i wants to attend to token j. Row i, once softmaxed, becomes token i's attention distribution over the whole sequence.",
          "The `1/√dₖ` scaling is not cosmetic. A dot product of two `dₖ`-dimensional vectors with unit-variance components has variance proportional to `dₖ`, so its *standard deviation* grows like `√dₖ`. With `dₖ = 64`, raw scores routinely reach ±8 or more. ==Feed scores that large into softmax and it saturates — one entry goes to nearly 1, the rest to nearly 0 — and in the saturated region softmax's gradient is almost zero, so the layer stops learning.==",
          "Dividing by `√dₖ` renormalizes the scores back to roughly unit variance regardless of head dimension, keeping softmax in its responsive range. The tradeoff is nothing — it is a free fix — which is exactly why forgetting it is such a classic bug: the model trains, just badly, and the cause (dead gradients from saturated softmax) is invisible unless you know to look for it.",
        ],
        checkpoint: {
          question:
            "What specifically goes wrong if you skip the 1/√dₖ scaling on the attention scores?",
          options: [
            "The score matrix becomes non-square and shapes break",
            "Dot products grow with dimension, so softmax saturates into a near one-hot distribution where gradients vanish and the layer barely learns",
            "The values V are no longer normalized",
            "Attention becomes non-causal and leaks future tokens",
          ],
          correct: 1,
          explanation:
            "Dot-product magnitude scales with √dₖ. Unscaled, large scores drive softmax into saturation — nearly one-hot outputs whose gradient is ~0, so backprop delivers almost no signal to the projections. Dividing by √dₖ keeps scores near unit variance and softmax responsive. It costs nothing and is a silent training-quality bug when omitted.",
        },
      },
      {
        title: "3 · Apply the causal mask before softmax",
        language: "python",
        code: `def apply_causal_mask(S):
    seq_len = S.shape[0]
    # Upper triangle (j > i) = future positions. Set them to -inf so that
    # after softmax their weight is exactly 0.
    mask = np.triu(np.ones((seq_len, seq_len), dtype=bool), k=1)
    S = S.copy()
    S[mask] = -np.inf
    return S

Sm = apply_causal_mask(S)
print(Sm)   # row 0 attends only to col 0; row 1 to cols 0..1; etc.`,
        explanation: [
          "A decoder-only model generates left to right, so token i must **never see tokens after it** — otherwise training would leak the answer. The causal mask enforces this by zeroing every position `j > i`. `np.triu(..., k=1)` selects the strict upper triangle (the future), and we set those score entries to `-inf`.",
          "==The mask goes on the *raw scores*, before softmax — and the value is `-inf`, not `0`.== This is the detail interviews probe. Masking after softmax (zeroing weights post-hoc) is wrong: the masked positions would already have absorbed probability mass, and the surviving weights would no longer sum to 1. Setting scores to `-inf` first means `exp(-inf) = 0`, so the masked positions contribute exactly zero *and* softmax renormalizes only over the visible positions. The distribution stays a proper distribution.",
          "The tradeoff is that this halves the usable attention — each token sees on average half the sequence — but that is the price of a causal model. At inference this same mask structure is what makes the KV-cache valid: because token i never attends to future tokens, the keys and values for tokens 0..i are fixed once computed and can be cached across decode steps.",
        ],
        checkpoint: {
          question:
            "Why is the causal mask applied as -inf on the raw scores before softmax, rather than by zeroing the weights after softmax?",
          options: [
            "-inf is faster to compute than multiplying by zero",
            "Setting scores to -inf makes exp() exactly 0 AND lets softmax renormalize over only the visible positions, so the weights still sum to 1",
            "Softmax cannot accept a matrix that contains any zeros",
            "It has the same effect either way; before-vs-after is a style choice",
          ],
          correct: 1,
          explanation:
            "Masking before softmax with -inf means the masked positions get exp(-inf)=0 weight, and crucially softmax's denominator sums only the visible positions, so the surviving weights form a proper distribution summing to 1. Zeroing weights after softmax leaves the denominator polluted by the (now-removed) future positions, so the remaining weights no longer sum to 1 — subtly wrong.",
        },
      },
      {
        title: "4 · Softmax to weights, then weight the values",
        language: "python",
        code: `def softmax(x, axis=-1):
    x = x - np.max(x, axis=axis, keepdims=True)   # subtract max for stability
    e = np.exp(x)
    return e / np.sum(e, axis=axis, keepdims=True)

def attention(Q, K, V, causal=False):
    S = scores(Q, K)
    if causal:
        S = apply_causal_mask(S)
    W = softmax(S, axis=-1)   # (seq_len, seq_len): each row sums to 1
    return W @ V              # (seq_len, d_v): weighted mix of value vectors

out = attention(Q, K, V, causal=True)
print(out.shape)             # (4, 8)`,
        explanation: [
          "Softmax turns each row of scores into a **probability distribution over the sequence**: for token i, how much of its output should come from each other token. The `x - max(x)` trick is numerical hygiene — it prevents `exp` from overflowing on large scores without changing the result, since softmax is shift-invariant.",
          "Then `W @ V` is the *actual attending*: each token's output is a **weighted average of all the value vectors**, weighted by its attention distribution. A token that attends 0.7 to position 2 and 0.3 to position 5 gets output `0.7·V[2] + 0.3·V[5]`. ==This is the one line where information moves between tokens — everything before it just computed *how much* to move.==",
          "The design elegance is that attention is a *soft, differentiable lookup*. A hard lookup (argmax the score, copy one value) is not differentiable, so you could not train it with gradients. Softmax makes it a smooth blend that sharpens toward one-hot as the model learns, and stays differentiable the whole way — you get lookup-like behavior with backprop-friendly math.",
        ],
        checkpoint: {
          question:
            "In `W @ V`, what does each row of the output represent?",
          options: [
            "The single value vector of the token with the highest attention score",
            "A weighted average of all value vectors, weighted by that token's attention distribution — a soft, differentiable lookup",
            "The raw query vector projected back into model space",
            "The sum of all key vectors in the sequence",
          ],
          correct: 1,
          explanation:
            "Each output row is Σ_j W[i,j]·V[j] — a weighted blend of every token's value, weighted by token i's softmax distribution. Using a soft weighted average instead of a hard argmax-copy keeps the operation differentiable, so the whole lookup trains end-to-end with gradients. As learning progresses the distribution can sharpen toward one-hot, approaching a hard lookup.",
        },
      },
      {
        title: "5 · Split into heads and attend per head",
        language: "python",
        code: `def split_heads(X, num_heads):
    seq_len, d_model = X.shape
    head_dim = d_model // num_heads
    # (seq_len, d_model) -> (num_heads, seq_len, head_dim)
    return X.reshape(seq_len, num_heads, head_dim).transpose(1, 0, 2)

def multi_head_scores(Q, K, V, num_heads, causal=False):
    Qh, Kh, Vh = (split_heads(T, num_heads) for T in (Q, K, V))
    outs = []
    for h in range(num_heads):
        outs.append(attention(Qh[h], Kh[h], Vh[h], causal=causal))
    return outs   # list of (seq_len, head_dim), one per head

heads = multi_head_scores(Q, K, V, num_heads=2, causal=True)
print(len(heads), heads[0].shape)   # 2 heads, each (4, 4)`,
        explanation: [
          "Multi-head attention **splits `d_model` into `num_heads` slices of `head_dim`** and runs the same attention independently on each slice. With `d_model = 8` and `2` heads, each head works in a 4-dimensional subspace. `split_heads` reshapes and transposes so the head axis is first, then each head attends over the full sequence but only its own dimensions.",
          "==The point is not more compute — it is more *relations*.== One wide attention over all 8 dims can only form a single attention pattern per query. Two heads over 4 dims each can form *two different* patterns simultaneously: one head might track syntactic agreement while another tracks coreference. The heads run in parallel and specialize, which is strictly more expressive than one big head for the same total dimension.",
          "The tradeoff is that each head has fewer dimensions to work with, so an individual head is a weaker matcher. Empirically that is a good trade — many narrow specialized heads beat one wide generalist — but push it too far (too many heads, `head_dim` too small) and each head becomes too low-rank to represent anything useful. Typical models keep `head_dim` around 64–128.",
        ],
        checkpoint: {
          question:
            "What is the main benefit of splitting attention into multiple heads instead of one wide attention over the full d_model?",
          options: [
            "It reduces the total number of parameters in the layer",
            "Each head attends in its own subspace, so the layer can represent several different relation patterns in parallel rather than one",
            "It removes the need for the causal mask",
            "It makes the score matrix smaller than n×n",
          ],
          correct: 1,
          explanation:
            "A single attention head produces one attention pattern per query. Splitting into heads lets each head specialize in a different subspace and relation (syntax, coreference, position), all computed in parallel. For the same total dimension, several narrow specialized heads are more expressive than one wide generalist — the well-known win of multi-head attention.",
        },
      },
      {
        title: "6 · Concatenate heads and project the output",
        language: "python",
        code: `def multi_head_attention(X, Wq, Wk, Wv, Wo, num_heads, causal=False):
    Q, K, V = projections(X, Wq, Wk, Wv)
    head_outs = multi_head_scores(Q, K, V, num_heads, causal=causal)
    # Concatenate along the feature axis: back to (seq_len, d_model).
    concat = np.concatenate(head_outs, axis=-1)
    # Final output projection mixes information ACROSS heads.
    return concat @ Wo

Wo = np.random.randn(d_model, d_model)
Y = multi_head_attention(X, Wq, Wk, Wv, Wo, num_heads=2, causal=True)
print(Y.shape)   # (4, 8): same shape as the input, ready for the next layer`,
        explanation: [
          "After each head attends independently, their outputs are **concatenated back to `d_model`** and passed through a final projection `Wo`. The concat restores the model dimension so the block's output matches its input shape — essential, because attention blocks stack and the next layer expects the same `d_model`.",
          "==`Wo` is doing real work, not bookkeeping.== Up to the concat, the heads are siloed — head 0 never mixed with head 1. The output projection is the *only* place information flows across heads: it learns how to combine what each head found. Drop `Wo` (just use the raw concat) and the heads can never talk, which measurably weakens the layer. It is the counterpart to the input projections — Wq/Wk/Wv split the work per head, Wo rejoins it.",
          "The whole block is now shape-preserving: `(seq_len, d_model)` in, `(seq_len, d_model)` out. That invariant is what lets you stack N identical attention+MLP blocks into a deep transformer, each refining the representation without changing its shape — the residual stream stays a fixed width all the way up.",
        ],
        checkpoint: {
          question:
            "What is the role of the output projection Wo after the heads are concatenated?",
          options: [
            "It normalizes the outputs to unit variance",
            "It is the only place information mixes across heads — heads attend independently, and Wo learns to combine what each head found",
            "It re-applies the causal mask a second time",
            "It is optional and can be removed with no effect",
          ],
          correct: 1,
          explanation:
            "Each head attends in its own siloed subspace and never interacts with the others. Concatenation just stacks their outputs; Wo is where cross-head mixing happens — it learns how to combine the different relations the heads discovered. Removing it leaves the heads unable to communicate and weakens the layer. It also restores d_model so blocks can stack.",
        },
      },
      {
        title: "7 · Shapes and cost: why attention is O(n²)",
        language: "python",
        code: `# The score matrix Q @ K.T is (seq_len, seq_len). Its size — and the
# compute and memory to build it — grow with the SQUARE of sequence length.
for n in [512, 2048, 8192]:
    scores_cells = n * n
    print(f"seq_len={n:>5}  score matrix cells={scores_cells:,}")
# seq_len=  512  score matrix cells=262,144
# seq_len= 2048  score matrix cells=4,194,304   (16x)
# seq_len= 8192  score matrix cells=67,108,864  (256x)

# KV-cache: at decode step t, keys/values for tokens 0..t-1 are unchanged,
# so cache them. Each new token then costs O(t) attention, not O(t^2).`,
        explanation: [
          "The `n × n` score matrix is the bottleneck. Doubling the sequence length quadruples the number of score entries — and the compute and memory to produce them. ==That quadratic scaling is *the* reason long context is expensive:== going from 2k to 8k tokens is a 16× blow-up in the attention matrix, not 4×. Every efficient-attention technique (FlashAttention, sliding windows, linear attention) is an attack on this one term.",
          "At **inference**, the KV-cache exploits causality. Because token i only ever attends to tokens 0..i (step 3's mask), the keys and values for already-generated tokens never change. Cache them, and generating token t costs only `O(t)` new attention work — one new query against t cached keys — instead of recomputing the whole `O(t²)` matrix each step. This turns generation from quadratic-per-token into linear-per-token.",
          "The tradeoff the cache introduces is **memory**: the KV-cache grows linearly with sequence length and number of layers, and at long context it can dominate GPU memory — which is exactly why techniques like grouped-query attention (fewer key/value heads) exist, to shrink the cache. The quadratic compute of training and the linear-but-large memory of the cache are the two costs every serving decision trades against.",
        ],
        checkpoint: {
          question:
            "What does the KV-cache buy at inference, and why is it valid?",
          options: [
            "It removes the causal mask, letting each token attend to the full sequence",
            "It caches keys/values of past tokens — valid because causality means they never change — so each new token costs O(t) attention instead of recomputing the O(t²) matrix",
            "It compresses the embeddings to save GPU memory at no cost",
            "It lets attention run without the softmax step",
          ],
          correct: 1,
          explanation:
            "Because each token only attends to earlier tokens, the keys and values for tokens 0..t-1 are fixed once computed. Caching them means decode step t only computes one new query against t cached keys — O(t) work — rather than rebuilding the full O(t²) score matrix each step. The cost is memory: the cache grows with sequence length and layer count, which is what GQA/MQA later attack.",
        },
      },
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
    steps: [
      {
        title: "1 · Chunk documents at semantic boundaries",
        language: "python",
        code: `def chunk(text, max_chars=1200, overlap=150):
    # Split on paragraph boundaries first, then pack paragraphs into chunks
    # up to a size budget — never mid-sentence.
    paras = [p.strip() for p in text.split("\\n\\n") if p.strip()]
    chunks, buf = [], ""
    for p in paras:
        if len(buf) + len(p) > max_chars and buf:
            chunks.append(buf)
            buf = buf[-overlap:] + " " + p   # carry a tail for continuity
        else:
            buf = (buf + " " + p).strip()
    if buf:
        chunks.append(buf)
    return chunks

docs = {"faq-01": open_doc_text}          # doc_id -> raw text
chunks = [(f"{did}#{i}", c)
          for did, t in docs.items()
          for i, c in enumerate(chunk(t))]  # (chunk_id, text)`,
        explanation: [
          "Chunking splits documents on **paragraph boundaries** and packs paragraphs into size-bounded chunks, rather than slicing every N tokens. The `overlap` carries a tail of the previous chunk into the next so a fact that straddles a boundary still appears intact in at least one chunk.",
          "==Recall lost at chunk time can never be recovered downstream.== If a chunk splits a sentence — 'The refund window is' | '30 days' — then neither chunk answers 'how long is the refund window?', and no reranker or clever prompt can fix it, because the complete fact is in no single retrievable unit. Fixed-token chunking does exactly this: it cuts on token 512 regardless of meaning. Boundary-aware chunking keeps semantic units whole, which is why it sets the ceiling for the entire pipeline.",
          "The tradeoff is chunk size. Small chunks are precise (the retrieved unit is tightly on-topic) but fragment context and inflate the index; large chunks preserve context but dilute the embedding — a 3000-character chunk about ten topics has a mushy average embedding that matches nothing well. The `chunk_id` (`doc#index`) is kept because every downstream stage needs to trace an answer back to its source, which is what makes citations possible.",
        ],
        checkpoint: {
          question:
            "Why is boundary-aware chunking considered the ceiling on RAG quality rather than a minor preprocessing detail?",
          options: [
            "It is the only stage that runs on the GPU",
            "If a fact is split across two chunks so no single chunk contains it, no downstream stage — retrieval, rerank, or prompt — can recover it",
            "Chunk boundaries determine the embedding model's dimension",
            "The reranker can always reassemble split facts from adjacent chunks",
          ],
          correct: 1,
          explanation:
            "Retrieval, rerank, and grounding all operate on chunks as atomic units. If chunking splits a fact so no single chunk holds the complete answer, the answer is simply not retrievable — there is nothing downstream that reassembles it. Fixed-token slicing does exactly this by cutting on token count regardless of meaning. Boundary-aware chunking preserves whole semantic units, which is why it caps everything after it.",
        },
      },
      {
        title: "2 · Embed each chunk and upsert into the store",
        language: "python",
        code: `import numpy as np

def embed(texts):
    # Stand-in for a real model (e.g. sentence-transformers). A real embedder
    # maps text -> a fixed-length vector; here we fake it deterministically.
    return np.array([_hash_embed(t) for t in texts])   # (n, dim)

class VectorStore:
    def __init__(self):
        self.ids, self.vecs, self.meta = [], None, {}

    def upsert(self, chunk_ids, texts):
        v = embed(texts)
        v /= np.linalg.norm(v, axis=1, keepdims=True)   # unit-normalize
        self.vecs = v if self.vecs is None else np.vstack([self.vecs, v])
        self.ids += chunk_ids
        self.meta.update(dict(zip(chunk_ids, texts)))

store = VectorStore()
store.upsert([c[0] for c in chunks], [c[1] for c in chunks])`,
        explanation: [
          "Each chunk is embedded into a fixed-length vector and stored alongside its `chunk_id` and text. The vectors are **unit-normalized** on the way in (`v / ||v||`) so that a later dot product *is* cosine similarity — a small choice that makes retrieval a single matrix multiply instead of a per-query normalization.",
          "==The index is a snapshot, not a live mirror of the corpus.== Once a chunk is embedded and stored, the store knows nothing about later edits to the source document. If the FAQ changes and you don't re-embed, retrieval returns the *old* text and the model grounds on stale facts — confidently. This is one of the most common production RAG bugs, and it is not a code error; it is a *reindexing cadence* decision that has to be made deliberately.",
          "`upsert` (not just insert) matters for the same reason: when a chunk's content changes, you want to overwrite its vector under the same id, not accumulate duplicates. The embedding model itself is a hard dependency — the query at retrieval time *must* be embedded with the identical model, or the query and chunk vectors live in different spaces and similarity is meaningless. Swapping the embedder means re-embedding the whole corpus.",
        ],
        checkpoint: {
          question:
            "A team edits 200 FAQ documents but does not re-run embedding. Users start getting confidently wrong answers. What is the cause?",
          options: [
            "The embedding model degraded over time and must be retrained",
            "The index is a snapshot — it still holds the old chunk vectors and text, so retrieval grounds the model on stale content",
            "Cosine similarity stops working once documents are edited",
            "The vector store silently dropped the edited documents",
          ],
          correct: 1,
          explanation:
            "The vector store is a point-in-time snapshot of whatever was embedded. Editing source documents does nothing to the stored vectors or text until you re-embed and upsert. Retrieval then returns the old content and the model grounds on it — wrong, but confident. This is a reindexing-cadence design decision, not a bug, and it is a classic production RAG failure.",
        },
      },
      {
        title: "3 · Retrieve the top-k candidates for a query",
        language: "python",
        code: `def retrieve(store, query, k=20):
    q = embed([query])[0]
    q /= np.linalg.norm(q)                  # SAME normalization as chunks
    sims = store.vecs @ q                    # cosine sim, since all are unit
    top = np.argsort(-sims)[:k]              # k highest-scoring chunk indices
    return [(store.ids[i], float(sims[i]), store.meta[store.ids[i]])
            for i in top]

candidates = retrieve(store, "how long is the refund window?", k=20)
for cid, score, _ in candidates[:3]:
    print(cid, round(score, 3))`,
        explanation: [
          "Retrieval embeds the **query with the same model and same normalization** as the chunks, then computes cosine similarity as a single dot product `store.vecs @ q` — because everything is unit-normalized, the dot product is the cosine. `argsort(-sims)[:k]` pulls the k highest-scoring chunk ids. This is the retrieval math in three lines.",
          "==You retrieve *more* candidates (k=20) than you will actually feed the model (say 5).== The reason is that this first-pass similarity is a coarse, cheap filter. A bi-encoder (embed query and chunk separately) is fast but approximate — it can't model fine query-chunk interactions, and at scale an ANN index adds further approximation. Retrieving wide gives the next stage (rerank) a good pool to work from; retrieving exactly 5 here would bet everything on the coarse score being right.",
          "The tradeoff is latency versus recall. A bigger k finds more of the truly relevant chunks (higher recall) but costs more rerank compute downstream. Too small a k and the correct chunk never enters the candidate pool, so the reranker — however good — can only reorder chunks that were already missing the answer. Retrieve wide, then narrow: this stage optimizes for *recall*, the next for *precision*.",
        ],
        checkpoint: {
          question:
            "Why retrieve 20 candidates when only ~5 will be passed to the model?",
          options: [
            "To make the prompt longer and give the model more to read",
            "The first-pass similarity is a coarse, approximate filter — retrieving wide maximizes recall so the correct chunk is in the pool for the reranker to promote",
            "Because cosine similarity requires an even number of candidates",
            "To reduce the number of embedding calls at query time",
          ],
          correct: 1,
          explanation:
            "Bi-encoder similarity (and any ANN index over it) is a fast but approximate first pass — it can rank the correct chunk 8th instead of 1st, or an ANN search can miss it. Retrieving wide optimizes recall: get the right chunk into the candidate pool. The reranker then optimizes precision by reordering. Retrieve exactly 5 and the reranker can only shuffle chunks that may already exclude the answer.",
        },
      },
      {
        title: "4 · Rerank the candidates with a cross-encoder",
        language: "python",
        code: `def rerank(query, candidates, top_n=5):
    # A cross-encoder scores the (query, chunk) PAIR jointly — far more
    # accurate than comparing two independent embeddings.
    scored = []
    for cid, _, text in candidates:
        score = cross_encoder_score(query, text)   # single model call per pair
        scored.append((cid, score, text))
    scored.sort(key=lambda x: -x[1])
    return scored[:top_n]

reranked = rerank("how long is the refund window?", candidates, top_n=5)`,
        explanation: [
          "Reranking runs a **cross-encoder** over each `(query, chunk)` pair. Unlike the bi-encoder in step 3 — which embedded query and chunk *separately* and compared the results — a cross-encoder feeds the query and chunk into the model *together*, so it can attend across both and judge true relevance, not just embedding proximity. It catches cases where a chunk is topically near the query but doesn't actually answer it.",
          "==This is the precision stage: it turns an approximate top-20 into a trustworthy top-5.== The bi-encoder's job was recall (get the right chunk into the pool); the cross-encoder's job is to reorder that pool accurately and cut it down. It routinely promotes the true answer from rank 9 to rank 1 — a lift the bi-encoder alone can't produce.",
          "The tradeoff is why you don't cross-encode everything: it is *far* more expensive. A cross-encoder runs one model forward pass per candidate, so it cannot scan a million-chunk corpus — only the ~20 the bi-encoder already narrowed to. That two-stage split (cheap-wide retrieve, expensive-narrow rerank) is the standard architecture precisely because it puts the expensive model only where it can afford to run.",
        ],
        checkpoint: {
          question:
            "Why not skip the bi-encoder retrieval and just cross-encode the query against the whole corpus?",
          options: [
            "Cross-encoders are less accurate than bi-encoders",
            "A cross-encoder needs one forward pass per (query, chunk) pair, so it cannot scale to a large corpus — it only runs on the ~20 candidates the cheap bi-encoder already narrowed to",
            "The corpus is not embedded until rerank time",
            "Cross-encoders cannot produce a ranked list",
          ],
          correct: 1,
          explanation:
            "The cross-encoder is accurate precisely because it processes query and chunk jointly — but that means a model call per pair, which is far too expensive to run over a whole corpus. The bi-encoder cheaply narrows millions of chunks to ~20 (recall); the cross-encoder then accurately reranks just those 20 (precision). The two-stage design puts the expensive model only where it is affordable.",
        },
      },
      {
        title: "5 · Assemble the grounded prompt within budget",
        language: "python",
        code: `def build_prompt(query, reranked, token_budget=2000):
    used, blocks = 0, []
    for cid, _, text in reranked:
        cost = len(text) // 4                 # rough tokens ~ chars/4
        if used + cost > token_budget:
            break                              # stop before overflowing
        blocks.append(f"[{cid}]\\n{text}")
        used += cost
    context = "\\n\\n".join(blocks)
    return (
        "Answer ONLY from the context below. Cite the [chunk_id] for every "
        "claim. If the context does not contain the answer, say you don't know.\\n\\n"
        f"CONTEXT:\\n{context}\\n\\nQUESTION: {query}\\nANSWER:"
    )

prompt = build_prompt("how long is the refund window?", reranked)`,
        explanation: [
          "The reranked chunks are packed into the prompt **with their `chunk_id` markers** (`[faq-01#3]`) and under an explicit **token budget**. The loop stops adding chunks before it overflows the budget — a naive 'stuff all the chunks in' both blows the context limit and, worse, pushes the real answer past where the model attends well.",
          "==The `[chunk_id]` markers are what make citation possible.== The model can only cite sources it can name, so each chunk carries its id into the context. The instruction — 'answer ONLY from the context, cite the id for every claim, say you don't know if it's absent' — is the **grounding contract**. It is the difference between a model that answers from the retrieved passages and one that quietly falls back on its parametric memory.",
          "The tradeoff lives in the budget. More chunks means more coverage but a longer, costlier prompt and a diluted signal (the answer competes with irrelevant text for the model's attention — the 'lost in the middle' effect). Fewer chunks is cheaper and sharper but risks omitting the one chunk that held the answer. This is why the earlier rerank matters: it ensures the *few* chunks that fit the budget are the *right* ones.",
        ],
        checkpoint: {
          question:
            "What is the purpose of embedding the [chunk_id] markers in the context and the 'answer only from context, say you don't know otherwise' instruction?",
          options: [
            "They make the prompt longer to satisfy a minimum length requirement",
            "Together they form the grounding contract — the ids enable citation, and the instruction forces the model to answer from retrieved context or abstain instead of using parametric memory",
            "The ids are used by the vector store to update embeddings",
            "They are only for human debugging and have no effect on the model",
          ],
          correct: 1,
          explanation:
            "The chunk_id markers give the model concrete source labels it can cite, and the instruction defines the grounding contract: answer strictly from the provided context, cite each claim, and abstain when the answer isn't there. Without this contract the model happily answers from its own memory, which is exactly the hallucination RAG is meant to prevent.",
        },
      },
      {
        title: "6 · Generate with a citation contract and verify",
        language: "python",
        code: `import re

def generate_and_verify(prompt, valid_ids):
    answer = llm(prompt)                       # the grounded generation call
    cited = set(re.findall(r"\\[([^\\]]+)\\]", answer))   # ids the model cited
    # Every cited id must be a chunk we actually supplied.
    hallucinated = cited - set(valid_ids)
    grounded = bool(cited) and not hallucinated
    return {
        "answer": answer,
        "cited": cited,
        "grounded": grounded,
        "hallucinated_citations": hallucinated,
    }

valid = [cid for cid, _, _ in reranked]
result = generate_and_verify(prompt, valid)
if not result["grounded"]:
    result["answer"] = "I couldn't find that in the knowledge base."`,
        explanation: [
          "Generation is only half the step; the other half is **verifying the grounding**. The code extracts every `[chunk_id]` the model cited and checks that each one is a chunk we actually supplied. A model that cites `[faq-99#2]` when that id was never in the prompt has *fabricated a citation* — a caught failure, and a signal the answer is ungrounded.",
          "==Grounding is enforced by a verification pass, not by hope.== The prompt contract (step 5) asks the model to cite and abstain, but models don't always comply — they can answer confidently with no citation, or cite a plausible-looking id that doesn't exist. This check turns 'the model *should* be grounded' into 'the answer *is* grounded, and here's the proof, or we fall back to I-don't-know.'",
          "The design decision is **fail safe on ungrounded answers**: if `grounded` is false, replace the answer with an abstention rather than shipping an unverifiable claim. That is the whole risk posture of production RAG — an abstention is a minor annoyance, a confident wrong answer with a fake citation is a trust-destroying incident. Cheap, deterministic verification at the end is worth far more than a marginally better model.",
        ],
        checkpoint: {
          question:
            "The model returns a fluent answer citing [policy-07#4], but that chunk was never in the prompt. What should the pipeline do, and why?",
          options: [
            "Trust it — a confident, well-cited answer is a good sign",
            "Treat it as ungrounded (a fabricated citation), and fall back to an abstention rather than shipping an unverifiable claim",
            "Retrieve chunk policy-07#4 after the fact and append it",
            "Lower the token budget and regenerate with more chunks",
          ],
          correct: 1,
          explanation:
            "A citation to an id that was never supplied is a fabricated citation — proof the answer is ungrounded, no matter how fluent. The verification pass catches exactly this. Falling back to an abstention is the correct risk posture: a confident wrong answer with a fake source destroys trust, while an 'I don't know' is a minor, honest failure. Grounding is verified, not assumed.",
        },
      },
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
    steps: [
      {
        title: "1 · Load a versioned test set of real queries",
        language: "python",
        code: `import json

def load_test_set(path):
    # A versioned JSONL file, checked into the repo. Each case is a real
    # query plus the context that was retrieved and the answer under test.
    cases = []
    with open(path) as f:
        for line in f:
            c = json.loads(line)
            assert {"id", "query", "context", "answer"} <= c.keys()
            cases.append(c)
    return cases

cases = load_test_set("evals/testset.v3.jsonl")
print(len(cases), "cases at version v3")`,
        explanation: [
          "The test set is a **versioned file checked into the repo** (`testset.v3.jsonl`), not an ad-hoc list in a notebook. Each case carries the `query`, the `context` that was retrieved, and the `answer` under evaluation — enough to judge faithfulness (does the answer follow from the context?) and relevance (does it address the query?).",
          "==Synthetic-only test sets lie.== A set you generated by asking a model for 'typical questions' reflects what the model *thinks* users ask, not what they actually ask — it misses the messy, ambiguous, adversarial real queries where systems break. Seeding the set with real production queries (especially failures users reported) is what makes the eval predictive of real quality rather than of your imagination.",
          "Versioning is the second half. When you add a newly-discovered failure case, that's a *new version* of the test set — `v3` — and it becomes a permanent **regression suite**: every future change is re-checked against every past failure. The tradeoff is that the set grows and gets slower to run, but a bug you fixed and captured as a case can never silently reappear, which is exactly the guarantee you want.",
        ],
        checkpoint: {
          question:
            "Why seed the eval set with real production queries instead of generating cases synthetically?",
          options: [
            "Synthetic generation is more expensive than collecting real queries",
            "Synthetic sets reflect what a model imagines users ask, missing the messy, ambiguous, adversarial real queries where systems actually break",
            "Real queries are always shorter and cheaper to judge",
            "Versioning only works on human-written queries",
          ],
          correct: 1,
          explanation:
            "A model-generated test set encodes the model's assumptions about usage, so it systematically omits the weird, ambiguous, and adversarial inputs that cause real failures. Seeding from production queries — especially reported failures — makes the eval predictive of real-world quality. Add each new failure as a versioned case and the set becomes a permanent regression suite.",
        },
      },
      {
        title: "2 · Score each case with an LLM-as-judge and a rubric",
        language: "python",
        code: `RUBRIC = """Score the ANSWER on two dimensions, 1-5 integers.
faithfulness: every claim is supported by the CONTEXT (5 = fully grounded,
              1 = contradicts or invents facts).
relevance:    the answer addresses the QUERY (5 = directly, 1 = off-topic).
Return ONLY JSON: {"faithfulness": int, "relevance": int, "reason": str}"""

def judge(case, judge_model):
    prompt = (f"{RUBRIC}\\n\\nQUERY: {case['query']}\\n"
              f"CONTEXT: {case['context']}\\nANSWER: {case['answer']}")
    raw = judge_model(prompt)
    score = json.loads(raw)                 # force structured output
    assert 1 <= score["faithfulness"] <= 5
    assert 1 <= score["relevance"] <= 5
    return score`,
        explanation: [
          "The judge is an LLM handed an **explicit rubric** and forced to return **structured JSON** — integer scores per named dimension, plus a `reason`. The rubric spells out what each dimension means *and what the anchors are* (5 = fully grounded, 1 = invents facts), so the judgment is against a fixed standard, not the model's vibe of the day.",
          "==Structured JSON is what makes the eval machine-comparable.== A judge that returns prose ('the answer is pretty good but slightly off') can't be aggregated, diffed, or gated on. Parsing to `{\"faithfulness\": 4, \"relevance\": 5}` turns a subjective read into numbers you can average across cases and compare run-over-run. The `assert` bounds-check catches a judge that ignored the scale — a real failure mode you want to fail loudly on, not silently average in.",
          "The rubric doing the heavy lifting is the design point: the judge is only as good as its instructions. Vague criteria ('rate the quality') produce noisy, inconsistent scores; sharp, anchored criteria produce scores that correlate with human judgment. Writing the rubric well is the actual engineering here — the same way a tool description is the engineering in an MCP server.",
        ],
        checkpoint: {
          question:
            "Why force the judge to return structured JSON scores per rubric dimension rather than a prose assessment?",
          options: [
            "JSON is cheaper to generate than prose",
            "Only structured per-dimension scores can be aggregated, diffed, and gated on — prose can't be turned into a run-over-run number or a CI threshold",
            "Prose responses are always more biased than JSON ones",
            "The judge model can only output JSON reliably",
          ],
          correct: 1,
          explanation:
            "An eval has to produce comparable numbers: you average across cases, track them run over run, and gate a deploy on them. Prose ('pretty good but a bit off') can't be aggregated or thresholded. Structured JSON per rubric dimension makes each judgment a machine-comparable score — and lets you see which dimension moved, not just that an average shifted.",
        },
      },
      {
        title: "3 · Use a cross-family judge to dodge self-preference",
        language: "python",
        code: `# The system UNDER TEST is generated by, say, the GPT family.
# Do NOT judge it with the same family — models rate their own style higher.
GENERATOR_FAMILY = "gpt"
JUDGE_MODEL = get_model("claude")           # different family on purpose

def run_scores(cases, judge_model):
    assert model_family(judge_model) != GENERATOR_FAMILY, (
        "Judge shares the generator's family -> self-preference bias"
    )
    return [{"id": c["id"], **judge(c, judge_model)} for c in cases]

scored = run_scores(cases, JUDGE_MODEL)`,
        explanation: [
          "The system under test is generated by one model family; the **judge is deliberately a *different* family**. The `assert` makes that a hard requirement, not a suggestion — it fails the run if someone wires the same family as both generator and judge.",
          "==Self-preference bias is real and measurable: a model tends to rate outputs written in its own family's style higher, independent of actual quality.== If GPT generates the answers and GPT judges them, the scores are inflated by stylistic familiarity, and worse, the bias is *invisible* — the numbers look great while measuring the wrong thing. Using a cross-family judge (Claude judging GPT, or vice versa) controls for it, so the score reflects the answer's quality rather than its resemblance to the judge's own outputs.",
          "The tradeoff is that no single judge is perfectly neutral, and cross-family judging adds an integration dependency (you now call two providers). For high-stakes evals teams go further — a panel of judges, or periodic human calibration on a sample — but the cheap, high-value first move is simply *don't let a model grade its own homework*. That one rule removes the largest systematic bias for the least effort.",
        ],
        checkpoint: {
          question:
            "Why does the harness assert that the judge model comes from a different family than the generator?",
          options: [
            "Different families are cheaper to run together",
            "Models exhibit self-preference bias — they rate their own family's style higher regardless of quality — so a same-family judge silently inflates the scores",
            "A model cannot parse JSON produced by its own family",
            "Cross-family judging is required for the scores to be integers",
          ],
          correct: 1,
          explanation:
            "Self-preference bias means a model favors outputs that look like its own, inflating scores in a way that's invisible in the numbers. Letting a model grade its own family's outputs measures stylistic familiarity, not quality. A cross-family judge controls for the single largest systematic bias in LLM-as-judge evals — cheap to do, high value.",
        },
      },
      {
        title: "4 · Aggregate per-case judgments into per-metric scores",
        language: "python",
        code: `def aggregate(scored):
    n = len(scored)
    metrics = {}
    for dim in ("faithfulness", "relevance"):
        vals = [s[dim] for s in scored]
        metrics[dim] = round(sum(vals) / n, 3)          # mean score
        # Also track the pass rate: fraction scoring >= 4 (a quality floor).
        metrics[f"{dim}_pass_rate"] = round(
            sum(v >= 4 for v in vals) / n, 3
        )
    return metrics

report = aggregate(scored)
print(report)
# {'faithfulness': 4.31, 'faithfulness_pass_rate': 0.88,
#  'relevance': 4.55, 'relevance_pass_rate': 0.94}`,
        explanation: [
          "Aggregation collapses the per-case judgments into a **handful of trackable numbers** — a mean per dimension plus a **pass rate** (the fraction of cases scoring at least 4). The mean tells you overall level; the pass rate tells you how many cases clear a quality floor, which is often what you actually care about ('what fraction of answers are acceptable?').",
          "==Keeping both the mean and the pass rate matters because they fail differently.== A mean can stay flat while a few cases collapse from 5 to 1 and a few others rise — averaged out, invisible. The pass rate catches that: it drops the moment cases fall below the floor. Tracking scores *per dimension* rather than one blended number is the same discipline — a blended score hides which dimension regressed, and 'faithfulness dropped but relevance held' is a completely different bug than the reverse.",
          "The design decision is to make the eval **diffable**. These few numbers are what get compared to the baseline and gated in CI. Aggregating too aggressively (one overall score) throws away the signal you need to *act*; aggregating too little (dumping all per-case scores) gives you nothing to threshold. A small set of per-dimension mean + pass-rate numbers is the sweet spot: enough to localize a regression, few enough to gate on.",
        ],
        checkpoint: {
          question:
            "Why track both a mean score and a pass rate (fraction ≥ 4) per dimension instead of just the mean?",
          options: [
            "The pass rate is required to compute the mean",
            "They fail differently — a mean can stay flat while some cases collapse and others rise, but the pass rate drops as soon as cases fall below the quality floor",
            "Pass rate is cheaper to compute than a mean",
            "The mean is only valid for an even number of cases",
          ],
          correct: 1,
          explanation:
            "A mean can be preserved by offsetting movements — a few 5s dropping to 1 while a few 3s rise to 5 nets out invisibly. The pass rate (fraction clearing the floor) catches exactly that failure: it falls the moment cases drop below acceptable. Tracking both, per dimension, gives complementary views and lets you localize which dimension and how many cases regressed.",
        },
      },
      {
        title: "5 · Compare against a frozen baseline",
        language: "python",
        code: `def load_baseline(path="evals/baseline.json"):
    # Baseline is committed to the repo and pinned to a specific commit —
    # NOT recomputed each run, or there would be no fixed floor.
    with open(path) as f:
        return json.load(f)   # e.g. {"faithfulness": 4.30, "relevance": 4.50}

def compare(report, baseline, tolerance=0.05):
    deltas = {}
    for dim, base in baseline.items():
        cur = report[dim]
        deltas[dim] = {
            "baseline": base, "current": round(cur, 3),
            "delta": round(cur - base, 3),
            "regressed": cur < base - tolerance,   # below floor minus slack
        }
    return deltas

deltas = compare(report, load_baseline())`,
        explanation: [
          "The baseline is a **committed file pinned to a specific commit** — the scores of a known-good version, frozen. `compare` computes the delta of each current metric against its baseline and flags a `regressed` dimension when it falls more than a small `tolerance` below the floor. The tolerance absorbs the inherent noise of an LLM judge (run-to-run scores wobble slightly) so you don't fail the build on jitter.",
          "==The baseline must be frozen, not recomputed each run — that is the whole point.== If you recomputed the 'baseline' from the current model every run, there would be no fixed floor: the system could slowly degrade and the moving baseline would always agree with it, exactly like a ratchet with no teeth. Pinning the baseline to a commit means every future run is judged against a fixed, known-good bar.",
          "The tradeoff is baseline maintenance: when you make a genuine improvement, you *deliberately* update and re-commit the baseline to lock in the gain (so the new, higher bar becomes the floor). That deliberate step is a feature — raising the baseline is an explicit, reviewed decision, not an accident. A drifting auto-baseline would let quality erode invisibly; a frozen one makes every change to the floor a choice someone signed off on.",
        ],
        checkpoint: {
          question:
            "Why must the baseline be frozen and commit-pinned rather than recomputed from the current model each run?",
          options: [
            "Recomputing it every run is too slow for CI",
            "A recomputed baseline moves with the system, so gradual degradation always 'matches' the baseline and is never caught — a frozen baseline is a fixed floor",
            "The judge model can only score against a cached baseline",
            "Commit-pinning is required for the JSON to parse",
          ],
          correct: 1,
          explanation:
            "If the baseline is recomputed from the current model each run, it tracks whatever the system does now — so slow degradation is invisible because the moving baseline always agrees. Freezing the baseline to a known-good commit gives a fixed floor every future run is measured against. Genuine improvements are locked in by deliberately re-committing a higher baseline, which keeps every change to the floor an explicit decision.",
        },
      },
      {
        title: "6 · Fail the CI build on regression",
        language: "python",
        code: `import sys

def gate(deltas):
    regressions = {d: v for d, v in deltas.items() if v["regressed"]}
    if regressions:
        print("EVAL GATE FAILED — quality regressed below baseline:")
        for d, v in regressions.items():
            print(f"  {d}: {v['current']} vs baseline {v['baseline']} "
                  f"(delta {v['delta']:+})")
        sys.exit(1)                 # non-zero exit -> CI blocks the deploy
    print("EVAL GATE PASSED — all metrics at or above baseline.")
    sys.exit(0)

gate(deltas)   # this line is what turns an eval into a deploy blocker`,
        explanation: [
          "The gate is almost trivial code — and that is the point. It collects the regressed dimensions and, if any exist, prints a **readable failure message** naming the dimension, the current score, the baseline, and the delta, then calls `sys.exit(1)`. ==A non-zero exit code is the entire mechanism: CI systems treat it as a failed step and block the merge or deploy.==",
          "This is what separates an eval that *matters* from a dashboard nobody checks. A dashboard reports numbers and relies on a human to notice, care, and act — which fails exactly when it matters, at 2pm on a Thursday under deadline pressure. The exit-code gate removes the human from the loop: a regression *cannot* ship because the pipeline itself refuses. The failure message is written for that moment — it has to tell a stressed engineer, in one line, what regressed and by how much.",
          "The design tradeoff is threshold strictness. Too tight and normal judge noise trips the gate constantly (the tolerance from step 5 exists for this); too loose and real regressions slip under it. The right threshold is set empirically from the judge's observed run-to-run variance. But the shape is fixed and correct: **the CI gate, not the dashboard, is what actually stops a regression from shipping** — and it's four lines.",
        ],
        checkpoint: {
          question:
            "What specifically turns this eval from a dashboard into something that actually prevents a regression from shipping?",
          options: [
            "The readable failure message that a human reviews before deploying",
            "The non-zero exit code (sys.exit(1)) on regression, which CI treats as a failed step and uses to block the merge or deploy — no human required",
            "Storing the metrics in a versioned JSON file",
            "Running the judge on a cross-family model",
          ],
          correct: 1,
          explanation:
            "A dashboard reports numbers and depends on a human noticing and acting — which fails under deadline pressure. The exit(1) on regression makes the CI step itself fail, so the pipeline blocks the deploy automatically with no human in the loop. That single line is what converts an eval into an enforceable deploy gate; the readable message just helps whoever has to fix it.",
        },
      },
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
