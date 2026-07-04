// Gap-A foundation modules — agent trajectory evaluation + RAG ingestion pipeline.
// Spread into foundationsRunnerData.js by the parent.
export const RUNNER_GAP_A = {
  "agent-eval-trajectory": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "You ship a customer-support agent that can search the knowledge base, look up an order by ID, issue a refund, and email the customer. Your eval suite reports 92% task success and the team is celebrating. Then finance flags a spike in refunds. You pull ten transcripts and the story is ugly: on one 'where is my order' ticket the agent called `issue_refund` (never asked!), the refund silently failed because the order was already delivered, and the agent then wrote a cheerful 'your order is on its way' — which was the right final answer, so your eval scored it PASS. On another ticket the agent looked up a completely different customer's order, saw a matching status by luck, and gave a correct-sounding reply — also PASS. Your outcome-only eval is blind: it grades the destination and never looks at the road the agent took to get there. You need to explain, precisely, why 92% task success can hide a broken agent, and what to measure instead.",
    explanation: [
      "Start with the thing your eval is actually measuring. **Outcome evaluation** asks a single question: did the agent's *final* output match the expected answer? Pass or fail on the endpoint. For a one-shot model call that's often enough — there's only one step, so the step and the outcome are the same thing. But an *agent* is not one step. It's a *trajectory*: a sequence of (plan → tool call → observation → next action) steps, each of which can be right or wrong independently. ==Outcome eval collapses that whole sequence into a single pass/fail on the last node, and in doing so it throws away everything that happened along the way.==",
      "Now see why that collapse is dangerous, because it fails in *two opposite directions*. **False pass (right answer, broken path):** an agent can reach the correct final answer through a path that is broken, unsafe, or lucky. Your refund agent produced a plausible final message while it (a) called a destructive tool nobody asked for, (b) ignored a silent tool failure, and (c) never grounded its claim in a real observation. Outcome eval sees only the pleasant final sentence and says PASS. In production that 'passing' agent is issuing unauthorized refunds. **False fail (right path, wrong answer):** the mirror case — an agent reasons correctly, calls the right tools with the right arguments, but the underlying data was stale or a downstream API returned an error, so the final answer is wrong. Outcome eval says FAIL and sends you debugging the agent's *reasoning*, when the real fault was the environment. ==Outcome-only eval conflates 'the agent did the right things' with 'the world produced the right result' — and those come apart constantly.==",
      { type: "illustration", label: "Same task, same PASS — one path safe, one broken", content: `Task: "Where is my order #A-4471?"   Golden final: "It was delivered on Tue."

TRAJECTORY 1 (correct path)          TRAJECTORY 2 (broken path, lucky)
 step1 plan: look up the order        step1 plan: look up the order
 step2 lookup_order("A-4471") ✓       step2 lookup_order("A-9999") ✗ WRONG ARG
 step3 observe: "delivered Tue" ✓     step3 observe: "delivered Tue" (someone
 step4 reply "delivered Tue" ✓          else's order, happens to match)
                                       step4 issue_refund()  ✗ HALLUCINATED CALL
                                       step5 refund fails silently, ignored ✗
                                       step6 reply "delivered Tue" ✓ (looks right)

 OUTCOME EVAL:  PASS                   OUTCOME EVAL:  PASS  ← identical score!
 TRAJECTORY EVAL: 4/4 steps ok        TRAJECTORY EVAL: 1/5 steps ok, 1 wrong
                                        tool arg + 1 hallucinated destructive call

 The two are indistinguishable to outcome eval. Only per-step scoring
 separates the agent you can ship from the one that will burn you.` },
      "So the fix is **trajectory evaluation**: score the agent's *process*, step by step, not just its endpoint. Concretely you assert against each decision in the trajectory. The workhorse metrics: **tool-call accuracy** — for each step, did the agent (1) select the *right tool* and (2) call it with the *right arguments*? Calling `issue_refund` when the task was a status lookup fails tool-selection; calling `lookup_order('A-9999')` when the ID was `A-4471` fails argument-correctness. **Step success rate** — what fraction of steps produced a valid, expected observation. **Redundant / hallucinated calls** — did the agent invoke tools that weren't needed (wasteful, and in the refund case, dangerous), or invent a tool or an argument that doesn't exist? **Error recovery** — when a tool *did* fail, did the agent notice and adapt (retry, fall back, ask the user) or did it barrel ahead as if it succeeded? ==A robust agent isn't one that never hits an error; it's one whose trajectory shows it *detecting and recovering from* errors. Recovery is a first-class metric, not a footnote.==",
      { type: "illustration", label: "Outcome (process) metrics vs process (trajectory) metrics", content: `OUTCOME metrics                    PROCESS / TRAJECTORY metrics
──────────────────────────────    ───────────────────────────────────
 task success (final correct?)     tool-selection accuracy (right tool?)
 answer quality / faithfulness     tool-argument accuracy (right args?)
 goal completion                   step success rate (valid observation?)
 end-state assertions              redundant / hallucinated call count
                                   error-recovery rate (adapted on failure?)
                                   efficiency (steps / tokens / cost to goal)

 RULE OF THUMB:
   outcome tells you IF the agent worked on this input.
   trajectory tells you WHY, WHETHER IT'LL GENERALISE, and WHETHER
   IT'S SAFE. Ship on outcome, DEBUG and GATE on trajectory.` },
      "How do you actually score steps at scale? Two mechanisms, used together. **Golden trajectories + per-step assertions** for the deterministic parts: you hand-author reference runs (this ticket *should* call `lookup_order` with the exact ID, *should not* call `issue_refund`) and assert programmatically — tool name matches, arguments match, forbidden tools never appear. These are cheap, exact, and become your **regression suite**: every code or prompt change re-runs them, so a refactor that reintroduces the rogue-refund bug fails CI instead of finance. **LLM-as-judge over trajectories** for the fuzzy parts: hand the full step-by-step trace to a strong model with a rubric ('was each tool call justified by the prior observation? did the plan make sense? did it recover from the failure at step 4?'). ==LLM-as-judge scales to open-ended trajectories that assertions can't specify — but it inherits the judge's failure modes: it can be swayed by a fluent-but-wrong trace, is position/verbosity-biased, and is itself non-deterministic, so you anchor it with golden examples and spot-audit its verdicts against human labels.== The judge grades taste; the assertions grade facts; you need both.",
      "Assemble these into an **agent eval harness** and the whole picture snaps together. The harness runs the agent against a fixed suite of tasks in a *controlled environment* (mocked or recorded tools, so runs are reproducible and a flaky API doesn't masquerade as an agent bug), captures the full trajectory of every run, and applies three layers: per-step assertions against golden trajectories (facts), an LLM-judge with a rubric (taste), and outcome checks on the final answer (did it ultimately work). It reports outcome *and* process metrics side by side, and — because trajectories are captured — every regression is *localizable*: you see the exact step where a good run and a bad run diverged. ==The one-line senior takeaway: outcome eval tells you whether the agent got the answer; trajectory eval tells you whether it earned it. You ship against outcome, but you debug, gate releases, and catch silent-safety regressions against the trajectory — because an agent that's right for the wrong reasons is a production incident waiting for the input that breaks the luck.==",
    ],
    keyPoints: [
      "**Outcome eval grades only the final answer; an agent is a trajectory (plan → tool call → observation → next action), so outcome-only collapses the whole sequence into pass/fail on the last node** and discards everything that happened en route.",
      "**It fails in two opposite directions.** False pass: right answer through a broken/lucky/unsafe path (unauthorized refund, wrong-customer lookup that happened to match). False fail: correct reasoning and tool use but stale data or a downstream API error — you debug the agent when the environment was at fault.",
      "**Trajectory eval scores the process step by step.** Core metrics: tool-call accuracy (right tool AND right arguments), step success rate, redundant/hallucinated call count, and error-recovery rate (did it notice a tool failure and adapt vs. barrel ahead). Recovery is a first-class metric.",
      "**Two scoring mechanisms, used together.** Golden trajectories + per-step assertions grade the deterministic facts (tool name/args match, forbidden tools never fire) and become the regression suite; LLM-as-judge over the full trace grades the fuzzy taste (was each call justified, did the plan make sense) — but inherits judge biases (fluent-but-wrong, verbosity, non-determinism), so anchor it with golden examples and human spot-audits.",
      "**The harness runs the agent in a controlled env (mocked/recorded tools → reproducible), captures every trajectory, and reports outcome AND process metrics.** Ship on outcome; debug, gate releases, and catch silent-safety regressions on trajectory — because 'right for the wrong reasons' is an incident waiting for the input that breaks the luck.",
    ],
    recap: [
      "**Outcome eval = final-answer pass/fail; an agent is a trajectory of steps** — outcome-only throws away the path.",
      "**Two opposite failures:** false PASS (right answer, broken/lucky/unsafe path — e.g. rogue refund) and false FAIL (right path, wrong answer from stale data / API error).",
      "**Trajectory eval scores each step:** tool-selection + tool-argument accuracy, step success rate, redundant/hallucinated calls, and error-recovery rate (adapt on failure, don't barrel ahead).",
      "**Score with two mechanisms:** golden-trajectory per-step assertions (facts, deterministic, = regression suite) + LLM-as-judge over the trace (taste, open-ended, but biased/non-deterministic → anchor with goldens + human audits).",
      "**Harness = controlled env (mocked tools, reproducible) + captured trajectories + outcome AND process metrics.** Ship on outcome, debug/gate/safety-check on trajectory.",
    ],
    mcqs: [
      {
        question: "Your agent eval reports 92% task success, but a rogue refund made it through: on a status-lookup ticket the agent called `issue_refund` (never requested), the refund failed silently, and it replied with a correct-sounding 'your order is on its way,' which the eval scored PASS. Why did outcome-only eval miss this, and what would have caught it?",
        options: [
          "The eval used too small a test set; adding more tickets would have surfaced the refund",
          "Outcome eval grades only the final answer and collapses the whole trajectory into one pass/fail, so a correct-looking final message hides a hallucinated destructive tool call and an ignored tool failure; trajectory (per-step) eval with tool-call accuracy assertions and a forbidden-tool check on `issue_refund` would have flagged the step where the path went wrong",
          "The refund tool was buggy; fixing the tool would make the eval correct",
          "Raising the LLM temperature on the judge would have detected the refund",
        ],
        correct: 1,
        explanation: "Option B is correct: outcome eval scores only the endpoint, so an agent that reaches a plausible final answer through a broken path (an unrequested `issue_refund`, a silently-failed refund, an unfounded reply) is scored PASS — the whole trajectory is collapsed into one node. Trajectory evaluation scores each step: tool-selection/argument accuracy and a golden-trajectory assertion that `issue_refund` must never fire on a status lookup would fail exactly at the offending step, localizing the bug. Option A is wrong — the problem isn't sample size; the same false-pass would recur because the metric itself ignores the path. Option C is wrong — the tool isn't buggy in the sense that matters; the agent should never have called it, which only per-step eval can see. Option D is wrong — temperature is unrelated; the gap is what's being measured (endpoint vs. process), not judge randomness.",
      },
      {
        question: "A teammate argues 'if the final answer is correct, the trajectory doesn't matter — we should only measure task success.' What is the strongest counter, stated as a tradeoff a staff engineer would give?",
        options: [
          "Trajectory eval is always more accurate than outcome eval, so outcome eval should be dropped entirely",
          "Outcome eval fails in two opposite directions: it false-PASSES agents that are right for the wrong reasons (lucky/broken/unsafe paths that won't generalize and can be dangerous, like unauthorized actions) and false-FAILS agents whose reasoning and tool use were correct but whose environment returned stale data or an API error; so you ship on outcome but debug, gate, and safety-check on trajectory — you need both",
          "Task success is impossible to measure for agents, so trajectory eval is the only option",
          "Trajectory eval is cheaper than outcome eval because it needs no golden data",
        ],
        correct: 1,
        explanation: "Option B is correct: outcome-only eval conflates 'the agent did the right things' with 'the world produced the right result,' and those come apart in both directions — a lucky/broken path can false-PASS (and be unsafe or fail to generalize on the next input), while a correct path can false-FAIL because of stale data or a downstream error, sending you to debug the agent when the environment was at fault. The mature stance keeps both: outcome for shipping signal, trajectory for debugging, release gating, and catching silent-safety regressions. Option A overshoots — outcome eval is still the shipping signal; you don't drop it. Option C is false — task success is measurable and useful. Option D is wrong — trajectory eval typically needs golden trajectories and/or an LLM judge, so it is not cheaper.",
      },
      {
        question: "You are building the scoring layer of an agent eval harness. You have deterministic requirements (the ticket must call `lookup_order` with the exact ID and must never call `issue_refund`) and open-ended ones (was each tool call justified by the prior observation, did the plan make sense). What is the right scoring design and its main caveat?",
        options: [
          "Use LLM-as-judge for everything, because it is the most flexible and removes the need for golden trajectories",
          "Use per-step assertions against golden trajectories for the deterministic facts (exact tool/arg match, forbidden-tool checks — cheap, exact, and reusable as a regression suite) and an LLM-as-judge with a rubric for the open-ended taste; the caveat is that the judge is biased (fluent-but-wrong, verbosity, position) and non-deterministic, so anchor it with golden examples and human spot-audits",
          "Use only exact assertions, since LLM judges are never reliable enough for any part of agent eval",
          "Score only the final answer and skip per-step scoring, since steps are too noisy to assert on",
        ],
        correct: 1,
        explanation: "Option B is correct: deterministic requirements (specific tool name, exact arguments, forbidden tools) are best expressed as programmatic per-step assertions against golden trajectories — cheap, exact, and directly reusable as a regression suite so a reintroduced bug fails CI. Open-ended judgments (was a call justified, did the plan cohere, did it recover) are what LLM-as-judge is for, since assertions can't specify them. The essential caveat is that the judge inherits known biases (favoring fluent-but-wrong traces, verbosity/position effects) and is non-deterministic, so you anchor it with golden examples and periodically audit its verdicts against human labels. Option A over-relies on the judge and discards the exactness assertions give. Option C throws away the judge's ability to score open-ended quality that assertions cannot express. Option D abandons trajectory eval entirely, reintroducing the false-pass/false-fail problem.",
      },
    ],
    takeaway: "Outcome evaluation grades only an agent's final answer, but an agent is a trajectory (plan → tool call → observation → next action), so outcome-only eval fails in two opposite directions: it false-passes agents that are right for the wrong reasons (lucky, broken, or unsafe paths — like an unauthorized refund) and false-fails agents whose reasoning was correct but whose environment returned stale data or an error. Trajectory evaluation scores the process step by step — tool-call accuracy (right tool and right arguments), step success rate, redundant/hallucinated calls, and error-recovery — using golden-trajectory per-step assertions for the deterministic facts (which double as a regression suite) plus LLM-as-judge for open-ended quality (anchored with goldens and human audits to counter its biases). Build a harness that runs the agent in a controlled, reproducible environment, captures every trajectory, and reports outcome and process metrics side by side: ship on outcome, but debug, gate releases, and catch silent-safety regressions on the trajectory.",
  },

  "rag-ingestion-pipeline": {
    depthTier: "core",
    interviewWeight: "high",
    scenario: "Your RAG assistant over the company wiki works well in the demo. Then three things happen in the same week. First, someone asks about a policy that lives in a PDF, and the bot returns garbled text — the PDF had a two-column layout and your parser read it left-margin-to-right-margin, interleaving the columns into nonsense. Second, an engineer edits one paragraph of a 40-page runbook, and your nightly job re-embeds all 12,000 documents from scratch to pick up that one change — a six-hour, expensive rebuild for a one-line edit. Third, a doc that was *deleted* from the wiki is still being cited by the bot, because nothing ever removed its chunks from the index. None of these are retrieval bugs. They're all failures of the part of the system nobody demoed: the offline pipeline that turns raw documents into an index. You need to explain that pipeline as a first-class system.",
    explanation: [
      "The first thing to get straight is that a RAG system has *two* pipelines, and they run at completely different times. The **online query path** is what everyone pictures: a user query arrives, you embed it, search the index, and generate an answer — it runs per request, in milliseconds, on the latency-critical path. The **offline ingestion (indexing) pipeline** runs *ahead of time*, in the background: it takes raw documents and turns them into the searchable index the query path reads from. ==Retrieval quality is capped by ingestion quality — the query path can only ever retrieve what ingestion put in the index, in the form ingestion put it there. A perfect retriever over a garbled index returns garble.== The scenario's three failures are all ingestion failures, and they're invisible until someone queries.",
      "Walk the ingestion pipeline stage by stage, because each stage is a distinct decision with its own failure mode. **Parse:** turn a real-world file into clean text. This is where the PDF broke — real documents are not plain text. PDFs have multi-column layouts, headers/footers, and tables that a naive reader linearizes into nonsense; HTML is wrapped in navigation, ads, and boilerplate that must be stripped; tables and figures need structure-aware extraction or they become word salad. ==Parsing is the most underestimated stage: garbage-out here poisons everything downstream, and no amount of retrieval cleverness recovers a mangled parse.== **Clean & dedup:** normalize whitespace/encoding, drop boilerplate the parser missed, and remove duplicate or near-duplicate documents (the same policy pasted into five wiki pages) so retrieval isn't flooded with redundant near-identical chunks.",
      "**Extract metadata:** and this stage is quietly one of the highest-leverage. As you ingest each document, attach structured fields — **source** (which doc/URL, so answers can cite), **section/heading** (where in the doc), **timestamp** (when last updated, so you can prefer fresh content and detect staleness), and critically **ACLs / permissions** (who is allowed to see this). ==Metadata is what lets retrieval *filter* before it ranks — 'search only docs this user can access,' 'prefer docs updated this quarter,' 'restrict to the billing section.' Skipping ACL metadata at ingestion is how a RAG system leaks a document a user was never allowed to read; you cannot bolt permissions on at query time if the index doesn't carry them.== **Chunk:** split each cleaned doc into retrieval-sized units — the placement of boundaries (respecting headings/paragraphs, chunk size, overlap) decides whether a retrieved chunk is self-contained or sliced mid-thought. **Embed:** run each chunk through the embedding model to get its vector. **Index:** write vectors + metadata into the vector store / ANN index.",
      { type: "illustration", label: "Offline ingestion pipeline vs. the online query path", content: `OFFLINE INGESTION (background, ahead of time, not latency-critical)
  raw doc ─► PARSE ─► CLEAN/DEDUP ─► EXTRACT METADATA ─► CHUNK ─► EMBED ─► INDEX
             (PDF      (whitespace,   (source, section,   (bound-  (vector) (write
              cols,     boilerplate,   timestamp, ACLs)    aries)            vecs +
              HTML      near-dupes)                                          metadata)
              tables)

ONLINE QUERY PATH (per request, milliseconds, latency-critical)
  user query ─► EMBED ─► SEARCH index (filter by metadata, then rank) ─► GENERATE

  KEY: the query path can only retrieve what ingestion wrote, in the form
       it wrote it. Retrieval quality is CAPPED by ingestion quality.
       A perfect retriever over a garbled/stale index returns garbage.` },
      "Now the second and third failures, which are the *freshness* problem: documents change and get deleted, and your index has to keep up without a full rebuild. The naive design re-runs the whole pipeline over the whole corpus on a schedule — which is why one edited paragraph triggered a six-hour re-embed of 12,000 docs. **Incremental re-indexing** fixes this by making the unit of work the *document*, not the corpus. **On edit:** re-ingest only the changed doc and **upsert by doc id** — re-parse, re-chunk, re-embed *that doc's* chunks and replace its old chunks in the index (keyed by a stable doc id → chunk id mapping), touching nothing else. **On delete:** actively remove that doc's chunks (this is what nobody did — the deleted wiki page's chunks lingered and kept getting cited). **On supersession:** when v2 replaces v1, upsert v2's chunks and delete v1's, so the old version can't be retrieved. ==The core mechanism is a stable doc-id → chunk-ids mapping plus upsert/delete semantics, so a change costs work proportional to the change, not to the corpus. Full rebuilds are for schema/embedding-model migrations, not routine edits.==",
      { type: "illustration", label: "Full rebuild vs. incremental upsert — cost of one edit", content: `One paragraph edited in ONE 40-page runbook (corpus = 12,000 docs):

FULL REBUILD (naive nightly job)
  re-parse + re-chunk + re-embed ALL 12,000 docs  ─► ~hours, big $ bill
  cost ∝ CORPUS SIZE   (12,000 docs re-embedded to capture 1 edit)

INCREMENTAL UPSERT (by doc id)
  look up doc id ─► re-parse + re-chunk + re-embed THIS doc's ~30 chunks
  upsert those 30 chunk vectors, leave the other ~350,000 chunks untouched
  cost ∝ SIZE OF THE CHANGE   (30 chunks, seconds, cents)

  DELETE handling: on doc delete, remove its chunks by doc-id mapping
    (the step nobody wrote → deleted doc kept being cited)

  Full rebuild is for embedding-model / schema migrations — NOT edits.` },
      "Two more things a senior answer names. **Freshness SLAs:** decide, per corpus, how quickly an edit must be reflected in retrieval — a breaking-news or pricing corpus may need minutes (event-driven ingestion on every write), while a stable policy wiki tolerates a nightly batch. The SLA drives the architecture (event-triggered upserts vs. scheduled batches), and it's a *requirement to elicit*, not a default. **Cost/latency asymmetry between the two pipelines:** ingestion is throughput-bound and can be slow and expensive but runs off the critical path — you pay embedding cost once per chunk at write time; retrieval is latency-bound and runs per query. ==This asymmetry is a design lever: do expensive work at ingestion (richer parsing, metadata extraction, even generating summaries/synthetic questions per chunk) to make the cheap, latency-critical query path better. Moving work from query time to ingestion time is almost always the right trade, because you pay it once and amortize it over every future query.== The one-line takeaway: RAG quality is set offline. Treat ingestion as a first-class pipeline — robust parsing, metadata (especially ACLs and timestamps), and incremental upsert/delete keyed by doc id — because the query path can only ever be as good as what ingestion put in the index.",
    ],
    keyPoints: [
      "**A RAG system has two pipelines at different times: the offline ingestion/indexing pipeline (background, ahead of time) and the online query path (per request, latency-critical).** Retrieval quality is capped by ingestion quality — the query path can only retrieve what ingestion wrote, in the form it wrote it.",
      "**Ingestion stages, each a distinct decision: parse → clean/dedup → extract metadata → chunk → embed → index.** Parsing is the most underestimated (PDF multi-column layouts, HTML boilerplate, tables/figures → garbage-out poisons everything downstream). Clean/dedup removes near-duplicates that would flood retrieval.",
      "**Metadata extraction is high-leverage: source (citation), section, timestamp (freshness/staleness), and ACLs/permissions.** Metadata lets retrieval FILTER before it ranks; skipping ACLs at ingestion is how a RAG system leaks docs a user can't see — you can't bolt permissions on at query time if the index doesn't carry them.",
      "**Incremental re-indexing keeps the index fresh without full rebuilds by making the unit of work the doc, not the corpus.** On edit: upsert by stable doc id (re-embed only that doc's chunks). On delete: actively remove its chunks (or a deleted doc keeps being cited). On supersession: upsert v2, delete v1. Cost ∝ size of change, not corpus size. Full rebuilds are for embedding-model/schema migrations only.",
      "**Freshness SLAs and cost/latency asymmetry are design levers.** The SLA (minutes vs. nightly) drives event-driven vs. batch ingestion and must be elicited, not assumed. Ingestion is throughput-bound and off the critical path, retrieval is latency-bound per query — so push expensive work (rich parsing, metadata, per-chunk summaries) to ingestion; you pay once and amortize over every query.",
    ],
    recap: [
      "**Two pipelines:** offline ingestion (parse → clean/dedup → metadata → chunk → embed → index, background) vs. online query path (embed → search → generate, per request). Retrieval quality is CAPPED by ingestion quality.",
      "**Parse is the most underestimated stage** — PDF columns, HTML boilerplate, tables → garbage-out poisons everything; retrieval can't recover a mangled parse.",
      "**Metadata (source, section, timestamp, ACLs) lets retrieval filter before ranking** — skipping ACLs at ingestion leaks docs a user can't see; you can't add permissions at query time if the index lacks them.",
      "**Incremental re-index by stable doc id:** on edit upsert only that doc's chunks, on delete remove them (or a deleted doc keeps being cited), on supersession upsert v2 + delete v1. Cost ∝ change, not corpus. Full rebuild = model/schema migration only.",
      "**Freshness SLA (minutes vs. nightly) drives event-driven vs. batch;** ingestion is off the critical path, so push expensive work (rich parse, metadata, per-chunk summaries) there — pay once, amortize over every query.",
    ],
    mcqs: [
      {
        question: "An engineer edits one paragraph in a single 40-page runbook, and your nightly job re-embeds all 12,000 documents from scratch to pick up the change — a six-hour, expensive rebuild. What is the correct design, and what mechanism makes it work?",
        options: [
          "Increase the embedding batch size so the full rebuild runs faster; full rebuilds are unavoidable when any doc changes",
          "Incremental re-indexing: make the unit of work the document, not the corpus — look up the edited doc via a stable doc-id → chunk-ids mapping, re-parse/re-chunk/re-embed only that doc's chunks, and upsert them in place while leaving every other doc untouched, so cost is proportional to the change (tens of chunks) rather than the corpus (all 12,000 docs)",
          "Switch to a faster embedding model so re-embedding 12,000 docs is cheap enough to do nightly",
          "Cache query results so the stale index doesn't matter",
        ],
        correct: 1,
        explanation: "Option B is correct: the fix is incremental re-indexing, where the unit of work is the document rather than the whole corpus. A stable doc-id → chunk-ids mapping lets you re-parse, re-chunk, and re-embed only the edited doc's chunks and upsert them in place, leaving all other chunks untouched — so the cost of a one-paragraph edit is proportional to that doc's ~30 chunks, not to re-embedding all 12,000 documents. Full rebuilds are reserved for embedding-model or schema migrations. Option A accepts the wrong premise (that any change forces a full rebuild) and only makes the wasteful path faster. Option C also re-embeds the entire corpus; a faster model reduces the constant but keeps cost proportional to corpus size. Option D doesn't address freshness at all — a cache over a stale/rebuilt index doesn't change how updates are ingested.",
      },
      {
        question: "During ingestion your team skips extracting per-document ACL/permission metadata, planning to 'add permissions later at query time.' Why is this a problem, and what does it reveal about the ingestion pipeline?",
        options: [
          "It's fine — permissions are purely a query-time concern and can always be applied after retrieval",
          "The index only carries the fields ingestion wrote, so without ACL metadata on each chunk the retriever cannot filter to what a user is allowed to see — the system can surface documents the user was never permitted to read; metadata (source, timestamp, ACLs) must be attached at ingestion because retrieval filters before it ranks and you can't reconstruct permissions the index doesn't hold",
          "Skipping ACLs only affects citation quality, not access control",
          "ACLs slow down embedding, so omitting them improves ingestion throughput with no downside",
        ],
        correct: 1,
        explanation: "Option B is correct: retrieval can only filter on metadata the index actually carries, so if ingestion never attaches per-doc ACLs, there is no field for the retriever to filter on and it can return chunks from documents the user has no right to see — a data-leak. This is why metadata extraction (source for citation, timestamp for freshness, ACLs for access) is a first-class ingestion stage: retrieval filters before it ranks, and you cannot bolt permissions on at query time against an index that doesn't hold them. Option A is exactly the dangerous misconception — permissions must be enforceable at retrieval, which requires the data at ingestion. Option C understates the impact; the failure is access control, not citations. Option D is wrong — the issue is a security/correctness gap, not a throughput tradeoff.",
      },
      {
        question: "Your RAG demo works, but a PDF with a two-column layout returns garbled text and a deleted wiki page is still being cited. A colleague wants to fix these by tuning the retriever (better embeddings, higher top-k). Why is that the wrong layer, and how should you frame the fix?",
        options: [
          "The colleague is right — better embeddings and higher top-k fix garbled parses and stale deletions",
          "Both are ingestion failures, not retrieval failures: the garbled PDF is a parse-stage problem (multi-column layout linearized into nonsense — no retrieval tuning recovers a mangled parse because retrieval can only surface what ingestion wrote), and the lingering deleted doc is a missing delete step in incremental re-indexing (the doc's chunks were never removed from the index); the fix is a robust parser plus doc-id-keyed upsert/delete, at the ingestion layer",
          "The garbled PDF is a retrieval bug but the deleted doc is an ingestion bug",
          "These are unavoidable RAG limitations that no pipeline design can address",
        ],
        correct: 1,
        explanation: "Option B is correct: retrieval quality is capped by ingestion quality — the query path can only surface what ingestion put in the index and in the form it put it there. A two-column PDF read left-to-right interleaves columns into nonsense at the parse stage, and no amount of better embeddings or higher top-k reconstructs meaning from garbled text; the fix is structure-aware parsing. The still-cited deleted page is a freshness failure in incremental re-indexing: on delete, the doc's chunks must be actively removed via the doc-id → chunk-ids mapping, and nobody wrote that step. Both are ingestion-layer fixes. Option A misattributes ingestion problems to the retriever. Option C is half-right but wrongly calls the parse issue a retrieval bug. Option D is defeatist — these are well-understood, fixable ingestion concerns.",
      },
    ],
    takeaway: "A RAG system has two pipelines running at different times: the online query path (embed → search → generate, per request, latency-critical) and the offline ingestion pipeline (parse → clean/dedup → extract metadata → chunk → embed → index, in the background) — and retrieval quality is capped by ingestion quality, because the query path can only ever surface what ingestion wrote and how it wrote it. Parsing is the most underestimated stage (multi-column PDFs, HTML boilerplate, tables), and metadata extraction (source, section, timestamp, and especially ACLs) is high-leverage because retrieval filters before it ranks and can't enforce permissions the index doesn't carry. Keep the index fresh with incremental re-indexing keyed by stable doc id — upsert on edit, delete on removal, upsert-plus-delete on supersession — so cost scales with the change, not the corpus, reserving full rebuilds for embedding-model/schema migrations. Finally, use the two pipelines' cost/latency asymmetry as a lever: push expensive work (rich parsing, metadata, per-chunk summaries) into off-critical-path ingestion, where you pay once and amortize it over every future query, and let the freshness SLA (minutes vs. nightly) drive event-driven vs. batch ingestion.",
  },
};
