# GSL-OVERLAP-PASS — first-pass overlap resolution

Content-grounded scan (three readers across the live code), then **my reconciliation** — I overrode several subagent winner calls that violated the agreed rule. A *true* overlap = same objective + same format + substitutable. Same topic in a different format/pillar (a lesson vs a deep-dive post vs an MCQ) is **not** an overlap.

**Resolution per loser:** **CUT** (nothing unique → archive to `_legacy/` + remove from app) · **BORROW** (one distinct asset → port it, then cut the rest) · **MERGE** (substantial unique content → fold in, then cut the shell).

**The winner rule (applied consistently):** for *explainer/Learn* overlaps the **on-path, faithful, single-home** surface wins — that's **Concepts** (foundations/retrieval) and **Agents.jsx** (agent patterns). **Explore**, and **Systems'/Playground's duplicate explainers**, are losers by default — but borrow their genuinely-better assets before cutting.

---

## The headline: it's two duplications, not fifteen

Almost every real overlap rolls up into **two patterns**:

- **PATTERN A — Explore duplicates Concepts.** Explore is a 20-tool gallery whose explainers re-teach what Concepts already owns (tokenizer, embeddings, attention, cosine, latency, red-team). Several of Explore's are *simulated/heuristic* where Concepts is *faithful*. → **Explore dissolves**; borrow its 2–3 genuinely-better visuals into Concepts, cut the rest.
- **PATTERN B — Systems re-teaches agent patterns that Agents.jsx already teaches.** ReAct loop, tool design, memory, planning each exist as an interactive-sim in *both* `Agents.jsx` and `systems/modules.jsx`. → **Agents.jsx owns agent-pattern teaching**; Systems keeps agent *decisions/production*, not duplicate pattern lessons (it already wraps them as tabs in `AgentArchitecture` — keep that, cut the standalones).

Everything else is a handful of singletons.

---

## Master resolution table

| # | Overlap | Surfaces | Winner | Loser → action |
|---|---|---|---|---|
| 1 | **Tokenizer** | Concepts `tokenizer` (faithful BPE + depth layer, on-path) · Explore Tokenizer Explorer · Explore Tokenizer Comparison | **Concepts** | Explorer → **CUT** (simulated subset) · Comparison → **BORROW** the 4-algorithm compare *idea* (rebuild faithful), then CUT |
| 2 | **Embeddings** | Concepts `embeddings` · Explore 3D Embedding Space · Explore Cosine Similarity | **Concepts** | 3D Space → **BORROW** the 3D constellation viz into Concepts, then CUT · Cosine → **BORROW** the exact dot-product/angle drill, then CUT |
| 3 | **Attention** | Concepts `attention` (+depth) · Explore 3D Attention Heads | **Concepts** | 3D Heads → **BORROW** the multi-head 3D view, then CUT |
| 4 | **Red-teaming** | Systems `AIRedTeaming` · Explore `RedTeamingLab` | **Systems** (Explore is dissolving) | Explore → **BORROW** any unique attack-sim, then CUT |
| 5 | **Cost / latency** | Systems `CostLatencyLab` · Explore `LatencyPlanner` | **Systems** | Explore → **BORROW** the interactive latency-budget tool, then CUT |
| 6 | **Chunking** | Concepts `chunking` · Playground Chunking Strategies | **Concepts** | Playground → **BORROW** the retrieval-score viz, then repurpose/CUT |
| 7 | **Agent ReAct loop** | `Agents.jsx::ReActPattern` · `systems::AgentReActLoop` | **Agents.jsx** | Systems standalone → **CUT** (keep only as a tab inside `AgentArchitecture`) |
| 8 | **Agent tool design** | `Agents.jsx::ToolUseDesign` · `systems::AgentToolDesign` | **Agents.jsx** | Systems → **MERGE** any unique pattern, then CUT standalone |
| 9 | **Agent planning** | `Agents.jsx::PlanningPatterns` · `systems::AgentPlanningPatterns` | **Agents.jsx** | Systems standalone → **CUT** (keep as `AgentArchitecture` tab) |
| 10 | **Agent memory** | `Agents.jsx::AgentMemory` · `Agents.jsx::LLMMemoryArchitecture` · `systems::AgentMemoryArchitecture` | **Agents.jsx** (one module) | Internal dup → **MERGE** AgentMemory + LLMMemoryArchitecture into one · Systems → **CUT** standalone (keep as tab) |
| 11 | **Prompt injection** | Playground `PromptInjection` (guest Aha) · Systems `AIGuardrails` (depth) | **keep both** | different jobs (interactive intro vs production depth) — **cross-link**, no cut |
| 12 | **Reranking** | Playground only (unique) | n/a — gap | **BORROW** into Concepts `rag-pipeline` (gap-fill, not a cut) |

---

## Checked — NOT overlaps (the discipline)

These look like overlaps by name but are different jobs/formats — **leave them:**

- **RAG Lab vs Concepts `rag-pipeline`** — *judgment* (configure→fail→diagnose) vs *learn* (pipeline walkthrough). Different cells.
- **Concepts Flash Attention / Sampling (faithful explainers) vs their Systems versions** — *internals lesson* vs *production decision*. Different pillars; cross-link, don't cut.
- **Concepts transformer (forward-pass sim) vs Systems "Transformer Architecture" (selection wizard)** — learn vs reference.
- **Hallucination across Playground / Concepts eval-loop / RAG Lab** — *recognize* vs *measure* vs *fix*. Three workflow stages, not duplicates.
- **Observability layers (LLMObservability / LangSmith / DebugTraces) and serving modules (KV / speculative / streaming / quantization)** — complementary, not substitutable.
- **The `gradientContent.js` depth layers** — these are the *winner's* PhD tier, not overlapping surfaces. (One subagent wrongly listed them as losers; ignored.)

---

## Where I overrode the subagents (so it's transparent)
- Agent-1 picked **Explore's tokenizer/embeddings/attention as winners**. **Reversed** — they're *simulated* and *off-path*; Concepts is *faithful* and on the guest path with the depth layer. Keeping the dissolving tab and gutting the on-path home is backwards.
- Agent-3 picked **Explore's RedTeamingLab** over Systems. **Reversed** — Explore is dissolving (Pattern A), so the on-path Systems module wins and borrows from Explore.
- Treated the agent-pattern dups consistently: **Agents.jsx wins all of them**; Systems keeps decisions, not duplicate lessons.

## Net effect
The cut list concentrates almost entirely in **Explore** (dissolves after ~4 borrows) and the **Systems agent-pattern standalones** (become tabs). That's the whole first pass: ~6 cuts, ~7 borrows, ~3 merges — and it *confirms* the surface audit's "de-list Explore" from independent content evidence.

## Exhaustive addendum — text corpus + rest of Systems (now scanned)

The three remaining bodies were scanned. **Reassuring headline: the text corpus is clean** — low redundancy, well-curated — so execution does not balloon.

**Ground Truth (~310 posts) — redundancy LOW.** 3 genuine merge-pairs (everything else is intentional depth/angle coverage, left alone):
- `prompt-caching` ↔ `prompt-caching-guide` → **MERGE + 301-redirect** (keep the implementation guide).
- `vector-databases-compared` ↔ `vector-db-selection-guide` → **MERGE + 301**.
- `how-claude-works` ↔ `model-claude` → **MERGE + 301** (keep the 12-min deep dive).
- ⚠️ **Data bug (fix regardless of the audit):** post id `vector-databases-compared` appears **twice** in `groundTruthPosts.js` (~line 1120 and ~15093, different bodies) — a copy/merge error. Dedup it.

**PrepLab (596 questions) — redundancy 1.2% (very clean).** 7 interchangeable dupes → cut the weaker, zero coverage loss: remove `ctx-q2, agents-1, agents-4, dep-q1, ft-2, cache-1, safety-1`. (4 look-alike pairs were checked and **kept** — different difficulty/mechanism.)

**Rest of Systems (design/build) — 2 real cuts:**
- `MultimodalAI` ↔ `MultimodalSystems` → **CUT `MultimodalAI`** (the other is a tab-wrapper around the *same* components — 100% substitutable; keep the wrapper, shared helpers stay).
- `PromptCachingHowItWorks` → **CUT** (duplicates the "How It Works" tab already inside `PromptCachingLab`).
- *Optional internal tidy (not cuts, defer):* move deep RLHF/DPO content from `FineTuningLab` → `RLHFAlignment`; consolidate the LLM-as-Judge section into `EvalMetrics`.
- *Not overlaps — just cross-link:* ShouldUseAI→ModelStrategy; ModelMerging↔MoE (disambiguate); SyntheticData→FineTuning.

**Exhaustive total** = earlier (~6 cuts / 7 borrows / 3 merges) **+ GT (3 merges + 1 dedup bug) + PrepLab (7 cuts) + Systems (2 cuts).** Everything else across 310 posts, 596 questions, and all 62 Systems modules was checked and is genuinely distinct. **The duplication is concentrated, not pervasive** — that's the answer to "is it exhaustive": yes, and there's no hidden mountain waiting to force rework.

---

## Verify before executing
- Confirm `Agents.jsx::AgentLoopSimulator` isn't a *third* ReAct surface (subagent was unsure).
- Confirm the Systems agent modules are truly standalone vs only-rendered-as-tabs (affects cut vs no-op).
- Per D-18: every cut archives to `_legacy/`, never `rm`. Per the content freeze: this is a plan, not a green light to edit.
