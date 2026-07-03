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
];

// Convenience lookup by id (parity with other GSL data modules).
export const CODE_LAB_BY_ID = Object.fromEntries(CODE_LABS.map((l) => [l.id, l]));
