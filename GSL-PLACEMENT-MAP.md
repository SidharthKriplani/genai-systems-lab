# GSL Placement Map

**Principle:** topic × layer grid. *Nothing deleted, just placed.* Anything we can't resolve now → **EXTRAS**, decide later.
**Status:** proposal for review. No tabs move until the grid + fold-decisions are signed off.
**Provenance basis:** built from current source (mechanical enumeration) + reconciled against git (688 commits), `pre-overlap-baseline` tag, and `_legacy/overlap-pass-removed/`. Not from memory.

---

## 0. The grid

**Columns (topics)** — already encoded as Concepts `GYMS` + Systems/GT challenge areas:
`Retrieval · Evaluation · Agents · Production · Foundations`

**Rows (layers)** — your KNOW / DO / BUILD / LIVE frame, with DO as a *band of the grid* (this is what stops RAG appearing in four places):

| Layer | Job | Surface type that fills it |
|---|---|---|
| **KNOW** *(label: "Learn")* | recall + depth | Concepts modules (lesson + playground) · GT posts (library, behind "open the whole AI universe?" toggle) |
| **DO** | drill + break | PrepLab Qs (drill) · the **Lab** (watch it break) · Scenarios · Systems sims (defend & argue) |
| **BUILD** | ship it | Project Labs (skeleton for now) — *global, not per-topic* |
| **LIVE** | perform | Mock interview · system design · take-home · negotiation — *global, not per-topic* |
| **EXTRAS** | parked | tools + undecided surfaces — *global* |

BUILD / LIVE / EXTRAS are **global sections**, not grid cells — which is exactly why projects, mock interviews, and the salary calculator felt like orphans. They were never topic-scoped.

---

## 1. KNOW row — Concepts gyms → columns (placement, not invention)

The 12 existing `GYMS` map onto 5 columns. Every module keeps its home; it just gains a column label.

| Column | Concepts gyms placed here | GT series (library, toggle) |
|---|---|---|
| **Retrieval** | Retrieval (embeddings, embeddings-3d, cosine-sim, chunking, rag-pipeline, context) + Vector DB (HNSW/IVF, pgvector, hybrid, metadata, migration) | how-rag-works, retrieval-depth, nlp-practitioners |
| **Evaluation** | Evaluation (eval-loop, debug, llm-as-judge, eval-design) | eval-depth, the-eval-crisis series |
| **Agents** | Agents (agent, agent-tools, multiagent, guardrails) | agent-production, build-reliable-agents |
| **Production** | Cost/Latency (latency-planner, observability-concepts) + Observability/LLMOps (tracing, prompt-regression, quality-drift, cost-attribution) | llmops-production, agent-production |
| **Foundations** | Language Models (tokenizer, attention, attention-3d, transformer, flashattn, sampling, nextoken, tempgame) + Training (training-signal, scaling-laws, lora, diffusion-3d) | nlp-origins, llm-internals, build-from-scratch, ml-foundations |

*Parked → EXTRAS: Prompting gym (few-shot, chain-of-thought) and Safety gym (alignment, red-teaming, jailbreak, safety-measurement).*

**Borrowed viz, confirmed placed:** `embeddings-3d, attention-3d, cosine-sim, diffusion-3d, latency-planner` (borrowed from Explore in the overlap pass) already sit inside these gyms. Nothing borrowed is floating.

---

## 2. DO row — labs, sims, drills → columns

| Column | Lab (break) | Drill | Scenarios / sims |
|---|---|---|---|
| **Retrieval** | RAG Lab | PrepLab `rag` | Systems sims (retrieval) + Playground **token-budget planner** |
| **Evaluation** | Eval Lab | PrepLab `eval` | Systems sims (eval) |
| **Agents** | Agent Lab | PrepLab `agents` | Systems sims (agents) |
| **Production** | LLM Lab | PrepLab `llmops` | Systems sims (prod) |
| **Foundations** | Foundation (FM) Lab | PrepLab `foundations` | Systems sims (foundations) |

**Playground decomposed** (this was the 4-tools-in-a-trench-coat tab):
- token-budget planner → **Retrieval** (the context-budgeting tool) — *stays in the grid*
- prompt-injection scenarios → **EXTRAS** (Safety, parked)
- guardrail detector → **EXTRAS** (Safety, parked)
- prompt library → **EXTRAS** (Prompts, parked)

**Prompts** (Prompt Lab + Prompt Library + injection) → **EXTRAS** — decided. **Safety** (gym + detector + injection) → **EXTRAS** — decided. Both parked, nothing deleted; pull them in whenever we choose.

---

## 3. BUILD (global) — Project Labs

`Career.jsx` holds 5 project build specs — these are the only true BUILD content:
- AI Customer Support System
- Enterprise AI Search
- Internal Code Generation Tool
- Multimodal Product Search
- Real-Time Document Analysis Agent

→ **BUILD section, skeleton for now.** Everything else currently jammed into "Project Labs" leaves (see §4–5).

---

## 4. LIVE (global) — perform under pressure

- **Interview Room** (`Fluency.jsx`) — mock interview scenarios → LIVE
- **Negotiation sim + negotiation cards** (in `Career.jsx`) → LIVE, merged into one **Negotiation / Tactics** unit
- **System design / take-home** → LIVE *(could not locate these by name in current source — they may be under different IDs or not yet built; flagged for inventory, see §6)*

---

## 5. EXTRAS (global, parked — decide later)

Per your rule: unresolved → here. **Parked ≠ deleted — all of this stays in the codebase, untouched.**
- **Prompts** — Prompt Lab + Prompt Library + prompt-injection scenarios + Prompting gym (few-shot, chain-of-thought). Decide later: own column or fold.
- **Safety** — Safety gym (alignment, red-teaming, jailbreak, safety-measurement) + guardrail detector. Decide later: own column or into Production.
- **Salary Calculator** (`SalaryCalculator.jsx`) — a tool, not a lab
- **AI Product / AIPM** — PM track, off the eng spine; park until we decide if GSL has a PM column
- **Enterprise platforms gym** (AWS Bedrock, Vertex, Azure, managed-vs-selfhosted, cost model) — vendor content; park or fold into Production
- **Multimodal gym** (VLM arch, multimodal-rag, OCR, resolution-cost) — fold into Foundations or park
- **Flows** (de-listed) — dissolve into Concepts or park
- **Consultation / "Ask"** (de-listed) — redundant with global Search; park
- **Explore** — *not a nav surface anymore, but must stay as a file* (Concepts imports the borrowed viz from it). Internal dependency, not user-facing.

---

## 6. "Look back" — full change/cut reconciliation (the receipts)

So nothing I ever touched is unaccounted for:

| Source of truth | What it proves |
|---|---|
| **git, 688 commits** | complete history; every change is a diff, recoverable |
| **tag `pre-overlap-baseline`** | one-command undo of the entire overlap pass |
| **`_legacy/overlap-pass-removed/`** | 5 files of removed content + restore diffs + verdict README |
| **set-diff (run, verified)** | 0 GT posts lost · exactly 5 PrepLab Qs cut (archived) · exactly 4 module functions cut (3 restored, 1 confirmed-dup) |
| **whole files ever deleted (all history)** | only 4: `Blog.jsx`, `Labs.jsx`, `Library.jsx`, `StartHere.jsx` — recoverable; need confirm-dead-or-reinstate |

**These 4 files were removed in earlier sprints — NOT by this work, and nothing here deletes anything.** They remain in git. The only action ever available on them is **restore**, never remove. Optional, later: skim them, restore if any holds content we still want (likely Library→Ground Truth, StartHere→Home, Labs→per-topic labs, Blog→Ground Truth).

---

## 7. Open decisions (only these gate execution)

1. ~~Prompts~~ → **EXTRAS (decided)**.
2. ~~Safety~~ → **EXTRAS (decided)**.
3. **Naming** — KNOW row is labeled **"Learn"** (your matrix). Remaining nit, parked: the **Foundations** column shares its name with the old FM topic — rename the column or the topic, later.
4. **The 4 earlier-deleted files** — restore-or-leave, your call, later. *Nothing gets deleted either way.*

Everything else is just placed. Next artifact (on your go) is the rewire spec — which file, which nav entry, which route — and still nothing moves until that's approved too.
