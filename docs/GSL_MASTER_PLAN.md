# GSL Master Plan — reaching MSL-equivalence for senior/staff AIE prep

_The single source of truth for the GSL improvement effort. Written 2026-07-03 after a deep read
of GSL + the full MSL journey. Companion: `docs/DRILL_SYSTEM_RUBRIC.md` (copy in from MSL),
GSL's own `FOUNDATIONS-CONTENT-STANDARD.md` / `FRAME-CATEGORIZATION.md` (respect these — do not
override GSL conventions)._

## Framing (read before doing anything)

GSL is **already an interactive-first interview gym**, and a strong one — do NOT flatten it into
MSL's prose-module shape. It has the four assessment frames, `readiness.js`, My Tracks, guided
paths, and five challenge-area hubs (Retrieval · Evaluation · Agents · Production · Foundations)
each threading a **Lab** (diagnose-the-failure simulators), **Concepts** (interactive widgets),
**Ground Truth** (deep reads), and **PrepLab** (500+ production-calibrated Qs with traps +
staff-layer framing + real interview attributions). Its labs + PrepLab are the crown jewels and
are *ahead* of where MSL started.

Rubric scores: S/A 8 · L0/L1 8 · **L2/case 6** · **spoken 4** · feedback 9 · progress 6 ·
interactive 8. Same two weak dimensions MSL had (**L2 and spoken**), plus **incompleteness**
(Concepts gyms half-empty) and cruft. The plan below fixes those, adds the few missing surfaces,
and applies MSL's polish systems — playing to GSL's interactive strengths.

---

## Parity matrix (MSL system → GSL state → action)

| MSL system | GSL state | Action |
|---|---|---|
| Four frames KNOW/DO/BUILD/JUDGE/PREP/EXTRAS | ✅ has all | Verify pillar separation per GSL's `FRAME-CATEGORIZATION.md` |
| KNOW — foundations/recall | Concepts (interactive; only Language-Models gym populated) + Ground Truth + FoundationsRunner | **Complete the 3 empty Concepts gyms** per `FOUNDATIONS-CONTENT-STANDARD.md`; add recap toggle |
| DO — coding fluency | Playground (playgrounds) + "Code Drills (coming soon)" | Ship code drills (AIE: RAG impl, eval harness, prompt-eng) OR route to programming-lab like MSL |
| BUILD — ownership | Career / Project Labs + challenge Labs (simulators) | Labs are build-ish; add project/case scaffolds |
| JUDGE — judgment + incident room | Labs (diagnose-failure) + Agents hub + AI Product | Add **L2 chained case studies**; labs are the judgment core |
| PREP — Q&A + behavioral + speak + drill | PrepLab (500 Qs, traps, staff-layer, attributions) + Fluency (phrase/timed) | Add **tiered Speak** (P0); behavioral bank; answer-length tiers |
| Home = readiness front door | Home (cold/returning paths) | Add readiness hero + "work next: weakest area" |
| Readiness model | `readiness.js` (per-area, activity-inferred) | Upgrade to **capped-breadth** + an **assessment quiz** (not just activity); work-next |
| **Review room (spaced-rep)** | ❌ missing | **Build** (spaced-rep over PrepLab + lab scenarios) |
| My Tracks | ✅ `MyTracks.jsx` + `AddToTrackPopover` | Backport **source grouping** + **deep-open**; ensure add-to-track on all content surfaces |
| **Company Tracks** | ❌ missing | **Build scaffold** (companies × AIE roles × levels) + logos |
| Drill pool + L2 case-chains | PrepLab (MCQ/text; not a tag-driven multistep pool) | Add **multistep L2 case-chains**; consider a tag-driven drill browser |
| Interview-Q quality (model answers, staff framing) | ✅ PrepLab strong | Strength — maybe add answer-length tiers |
| Multi-company logos | `CompanyLogo.jsx` exists; PrepLab has text attributions | Structured **multi-company attribution + logo rows** on PrepLab + labs (3 + "+N more") |
| Interactive QA (capability shell, contrast, fit, play) | each lab = own component; no shared shell | **Audit GSL interactives** for dead-play / contrast / fit / clutter; fix |
| Recap (quick-recap mode) | `takeaway` present, no recap toggle | Add recap to Concepts/Foundations runner |
| **About + community** | ❌ missing | Add About page + WhatsApp community link |
| Docs (rubric/backlog/briefing) | has FOUNDATIONS-AUDIT / CONTENT-STANDARD / FRAME docs; no drill rubric/backlog | Copy in `DRILL_SYSTEM_RUBRIC.md`; add `BACKLOG.md`; keep a `CLAUDE.md` briefing |
| Cleanup cruft | `systems/modules.jsx.bak` / `.new` | Delete |
| Beginner text | partial | Progressive-disclosure layer |

---

## Phased plan

### P0 — conversion (do first; mirrors the MSL close-out)
1. **Cruft cleanup** — delete `systems/modules.jsx.bak` / `.new`; reconcile `modules.jsx` (Evals data).
2. **Copy the rubric doc** (`DRILL_SYSTEM_RUBRIC.md`) into GSL docs; treat as the gym checklist.
3. **Speak layer in Fluency** — graft MSL's tiered spoken drill (30s / 2-min / interviewer-pushback / reason-when-unsure, Web-Speech) over the PrepLab bank. GSL already has the questions + the Fluency surface — a graft, not a build.
4. **L2 chained case studies** — GSL's labs diagnose one failure at a time; add **multi-step chains** (e.g. high recall → low answer quality → reranker vs chunking vs context-noise → then multi-hop) and a narrative case layer. Reuse the case-chain schema.

### P1 — completeness
5. **Finish the Concepts gyms** (Retrieval / Evaluation / Agents / Production) per `FOUNDATIONS-CONTENT-STANDARD.md`. Biggest content lift — batch by gym (subagents), interactive-first.
6. **Review room** — spaced-rep over PrepLab + lab scenarios (SM-2-lite; deep-link back).
7. **Readiness upgrade** — capped-breadth score + a real **assessment quiz** per area (not activity-inferred) + "work next"; wire into Home hero.
8. **Recap toggle** on Concepts/Foundations runner.

### P2 — missing surfaces + polish parity
9. **Company Tracks** — companies × **AIE roles** (Applied AI Engineer, ML Engineer (GenAI), AI Researcher, Forward-Deployed) × levels; reuse `CompanyLogo` + deep-open.
10. **Multi-company attribution + logo rows** on PrepLab Qs + labs (they already carry text attributions — structure them).
11. **About page + community link** (WhatsApp: same URL as MSL).
12. **My Tracks** — backport source grouping + deep-open (MSL pattern).
13. **Interactive QA sweep** — dead-play / contrast / fit / clutter across the labs & Concepts widgets.

### P3 — nice-to-have
14. Safety Lab + Multimodal Lab (new challenge areas).
15. DO code-drills (or route to programming-lab).
16. Spaced-repetition algorithm (replace localStorage history).
17. Beginner explainer text (progressive disclosure).
18. Mock-interview sim (timed, over the open-ended PrepLab Qs).

---

## Execution order & notes
- **Start with P0** (cleanup + rubric + Speak + case-chains) — highest ROI, rubric-predicted gaps.
- **Interleave the cheap mechanical parts early**: cruft delete, About + community link, My Tracks grouping/deep-open backport (all bounded).
- **P1 Concepts-gym completion is the big content batch** — run it room-by-room via subagents against GSL's own content standard, exactly like MSL's recap/drill authoring.
- **Do NOT override GSL conventions** — read `FOUNDATIONS-CONTENT-STANDARD.md`, `FRAME-CATEGORIZATION.md`, `FOUR-FRAME-AUDIT.md`, `NAV-REFRAME-SPEC.md` first; align to them.
- **Statefulness:** keep this plan + a `BACKLOG.md` + a `CLAUDE.md` briefing updated as work lands, same as MSL.
- **Reuse, don't reinvent:** Speak-mode, case-chain schema, Review room, Company Tracks scaffold, readiness model, logo system, and the rubric all exist in MSL — port them.

---

## What's genuinely new for GSL (not a copy from MSL)
- **AIE-specific case-chains** (RAG/agents/eval/inference failure chains) — new content.
- **Concepts interactive widgets** for the empty gyms (Retrieval/Eval/Agents/Production) — new interactives.
- **Lab → case-study bridge** — GSL's simulators are unique; chaining them is a GSL-native idea.
- Everything else is a **port** of an MSL system, adapted to GSL's interactive-first shape.

---

# Revision 2 — the dimensions the first pass missed

The first revision planned GSL at the *surface/structure* level. It skipped three load-bearing
things we treated as first-order on MSL. These come BEFORE piling on new features — you don't
build a gym on a scrapyard, and "content is the atom."

## A. Foundations **content quality** (first-principles causal-chain), not just "does it exist"

GSL already has a good spec — `FOUNDATIONS-CONTENT-STANDARD.md` (learner baseline + LIGHT/STANDARD/
DEEP depth tiers with equation/interactive rules). But that's a *depth/clarity* standard; it does
**not** yet encode our **first-principles causal-chain** bar from MSL: every concept taught as
_why → mechanism → implication → the production tell_, with a Hold/confirm/analyst-move discovery
structure, not a wall of prose. And I never audited whether GSL's *actual* content clears the bar.

**Workstream:**
1. Fold the causal-chain principle INTO `FOUNDATIONS-CONTENT-STANDARD.md` (amend the rubric).
2. Audit every Concepts / Foundations / Ground-Truth module against it (the MSL S-tier bar:
   numerical example + genuine figure/interactive + the production tell + a causal chain, not a list).
3. Uplift the thin ones, room-by-room (subagent batches), per the amended standard.
Scope: **large** (content). This is the real "make it so good anyone can prep for staff AIE" work.

## B. Consolidation / cut-down — GSL's "scrapyard → iron-man-armor" pass (do EARLY)

~45 page surfaces, many scattered/orphaned/overlapping. Absorb the good ones into the coherent
frame/hub structure; cut the dead weight. First-pass triage (verify each before acting):

| Verdict | Surfaces | Note |
|---|---|---|
| **CUT or absorb** (0 refs — orphaned) | IndiaScale, SalaryCalculator, TransformerWalkthrough | Not wired. Salvage TransformerWalkthrough into a Concepts widget; IndiaScale/Salary → cut or fold into a career aside |
| **ABSORB into Production hub** (0 refs, good content) | InferenceOptimizer, ModelRouter, MLCiCd | These are real AIE production topics — absorb as Production Concepts/labs, don't leave orphaned |
| **REVIEW → absorb/cut** (1–2 refs, legacy) | AIPM, Consultation, HowTo, QADashboard, StudyRoom, WarRoom, LearningPaths, PromptLab | PromptLab already redirects to Playground; HowTo → Start Here/About; LearningPaths → Home paths; the rest: decide keep/merge/cut on read |
| **KEEP — core** | Concepts, FoundationsRunner/Hub, GroundTruth, PrepLab, Fluency, Playground, Retrieval, Agents(+Hub), Evaluation/Production/Foundation-Models hubs, Systems(Evals), personal surfaces | The spine |

Principle (from MSL): route scattered content into the **5 challenge-hubs + the frame structure**;
one coherent path per intent; cut redundancy. Do this pass **before** P0 features so the gym sits
on a clean base. Scope: **medium** (mostly nav/routing + a few absorptions + deletes).

## C. BUILD as real **coding** (not just simulators)

GSL's BUILD is thin (Career + "Code Drills coming soon"). For AIE, BUILD should have hands-on code
like MSL's project labs — and the orphaned production surfaces feed it:
- **MCP server** implementation drills (tools, schemas, transport).
- **Multi-agent / orchestrator** code (ReAct loop, handoff schemas, planner-executor).
- **RAG pipeline** build (chunk → embed → retrieve → rerank → generate, with the failure knobs).
- **Eval-harness** code (LLM-as-judge rig, RAGAS-style metrics, regression suite).
- **Inference/serving** (batching, quantization, routing — absorb InferenceOptimizer/ModelRouter/MLCiCd here).
Delivery: Pyodide/JS notebooks or guided code labs with judgment checkpoints (MSL BUILD pattern).
Scope: **large** (new content + surfaces).

## D. Cross-lab borrowing (MSL + PAL → GSL)

Port, don't reinvent: MSL's **drill rubric, Speak mode, case-chain schema, capped-breadth readiness,
Review room, Company Tracks scaffold, multi-company logos, About/community, capability-aware
interactive shell**; PAL's **My-Tracks source-grouping + deep-open, ReviewQueue, company tracks**.
GSL contributes back its **lab-simulator + interactive-widget** patterns.

## Revised phase order

- **Phase 0 (FIRST): Consolidation + Content Quality.** (B) scrapyard cut-down/absorption →
  clean surface map; (A) amend content standard with causal-chain + audit + begin content uplift.
- **Phase 1: Conversion.** Speak layer in Fluency + L2 chained case studies (was "P0").
- **Phase 2: Completeness.** finish Concepts gyms (per amended standard) · Review room · readiness upgrade · recap toggle.
- **Phase 3: BUILD coding.** MCP / multi-agent / orchestrator / RAG / eval-harness / serving labs (C).
- **Phase 4: Missing surfaces + polish.** Company Tracks · multi-company logos · About+community · My-Tracks grouping/deep-open · interactive QA sweep.
- **Phase 5: Nice-to-have.** Safety/Multimodal labs · spaced-rep algo · beginner text · mock interview.

**Interleave the cheap mechanical wins anytime:** cruft delete, About+community, My-Tracks
grouping/deep-open backport, orphaned-surface deletes.

_Statefulness: this doc + a `BACKLOG.md` + `CLAUDE.md` briefing get updated as work lands, same as MSL._

---

# Revision 3 — Definitive consolidation map (from full deep read)

The live screenshots + a complete code read revealed GSL is far bigger and more redundant than
Rev 1–2 assumed: **~68 files, ~53K LOC**, built play-first. The real Phase-0 work is a serious
consolidation. This is the authoritative map.

## The core disease: every concept has 3–5 homes
- **Interactive widgets duplicated** across `Concepts.jsx`, `Playground.jsx` (14 labs), `Explore.jsx`
  (5.6K LOC of viz), and the `Agents.jsx` Agent Lab (17 modules): attention (Concepts + Playground
  AttentionViz + Explore AttentionViz3D), embeddings (×3), temperature/sampling (×2), KV-cache (×2),
  reranking (×2), RAG pipeline, ReAct loop, etc.
- **Assessment fragmented across 5 systems** with no single entry: `readiness.js` (engine),
  Fluency › Readiness Check (10Q), PrepLab › Exam/Trainer/Sprint/Company modes (595 Qs),
  Progress cards, plus StudyRoom + QADashboard.
- **5 domain Hubs (Retrieval/Eval/Agents/Production/Foundations)** are pure aggregators — they
  re-link the same Concepts+PrepLab+GroundTruth content, adding a 3rd/4th path to each concept.
- **Nav duplication:** "Agents" appears under JUDGE *and* BY DOMAIN; Company content lives in
  PrepLab (Company Prep) *and* Fluency (Company Cases).

## Principle (same as MSL): one canonical home per intent
- **Knowledge → Concepts gyms** (the atom; each module = teaching + viz + linked practice + signals).
- **Assessment → PrepLab** (one bank, modes; readiness.js stays the engine).
- **Deep reading → Ground Truth** (indexed by gym).
- **Hands-on → Playground** (optional deep-dive, not a duplicate teaching path).
- **Hubs = guided tours** (a path *through* the above, no original content).

## KEEP (core spine)
Concepts (7–9 gyms, ~40 modules) · PrepLab (595 Qs, modes) · Ground Truth (indexed by gym) ·
Playground (14 labs, as PRACTICE) · Fluency (articulation/spoken — or absorb into PrepLab) ·
Home/Profile/Plans/Progress/MyTracks · Leaderboard · readiness.js · the 5 Hubs (as tours only).

## ABSORB (merge content, retire the surface)
| Surface | → into | Why |
|---|---|---|
| `Agents.jsx` (Agent Lab, 17 mods) | Concepts › Agents gym | Duplicates Concepts agent modules |
| `Explore.jsx` (viz, 5.6K LOC) | keep viz as imported components; retire the standalone surface | It's just a viz bin; homes are the concept modules |
| `FoundationModelsLab.jsx` | Concepts › Foundation Models gym | FM content is foundational, not a special lab |
| `TransformerWalkthrough.jsx` | Concepts › Language Models gym | Great format, needs a home |
| `Flows.jsx` (diagrams, 2.6K) | Concepts modules + Ground Truth | Diagram bin |
| `LearningPaths.jsx` | Plans | Duplicate study-track nav |
| `StudyRoom.jsx` | PrepLab › Trainer | Duplicate exam workspace |
| `QADashboard.jsx` | PrepLab › Browse | Q-stats belongs with the bank |
| `Systems.jsx` | Concepts › Production gym | Already half-delisted |
| `PromptLab.jsx` | Playground | Already redirects |
| Fluency (optional) | PrepLab modes | High overlap (Mock/Readiness/Company) — decide merge vs keep-lean |

## CUT / archive to `_legacy/` (off-mission for an Applied AI Engineer prep tool)
`AIPM` (AI Product/PM) · `Consultation` (client/sales) · `IndiaScale` (HR/hiring) ·
`InferenceOptimizer` + `ModelRouter` (calculators/wizards — salvage the *content* into Production
Concepts, cut the tools) · `MLCiCd` (DevOps) · `SalaryCalculator` + Career › Negotiation/Salary
(comp/HR — link out to Levels.fyi) · `WarRoom` (episodic). Keep Career › System Design + Take-home
(real interview value) — fold into BUILD.
**Owner call:** these are *your* creations; the cut list is a recommendation. AIPM and the career
tools may be intentional differentiators — confirm before archiving.

## Reconcile the assessment layer → ONE
`readiness.js` stays the engine. PrepLab is the single assessment home (Exam · Trainer/spaced-rep ·
Sprint · Company · JD-gap · Browse · Review). Add the MSL Review-room spaced-rep + capped-breadth
readiness + "work next" (additive, Phase 2).
**CORRECTION (Phase 0.2 investigation, 2026-07-03):** StudyRoom + QADashboard are NOT user-facing
clutter — StudyRoom is the OWNER's private, email-gated spaced-rep room (keep); QADashboard is a
hidden internal QA/beta console (keep). Do NOT retire them. Fluency's Readiness Check (20-Q quick
self-test) and PrepLab's Exam (full timed) are two valid distinct tools — keep both, just label the
relationship (PrepLab = the assessment; Fluency check = quick diagnostic). No cuts in 0.2.

## Pick the canonical interactive home per widget
Rule: **the concept module owns the canonical viz**; Playground hosts the *experiment/lab* version.
Consolidate the triplicate viz (Explore/Playground/Concepts) so each has ONE implementation the
others import — no three copies of attention/embeddings/latency.

## Revised Phase 0 (supersedes Rev 2's rough triage)
- **0.1 De-clutter:** archive the CUT list to `_legacy/`, drop from App lazy-imports, keep hash-redirects.
- **0.2 Consolidate assessment** into PrepLab (retire StudyRoom/QADashboard/Fluency-Readiness-dupe).
- **0.3 Consolidate knowledge** into Concepts gyms (absorb Agents Lab / FM Lab / TransformerWalkthrough / Systems / Explore-viz).
- **0.4 Hubs → guided tours** (strip duplicated content, make them paths).
- **0.5 Nav simplify** to one coherent tree; fix the double "Agents".
- **THEN** the content-quality causal-chain uplift (Rev 2.A) and the conversion/BUILD-coding work.

_This consolidation is the real "usable and reliable" work. Owner confirms the CUT list before archiving._

## Phase 0.3 pilot — Agents (executed 2026-07-03)
Pilot of the 0.3 consolidation, scoped to the Agents surface. An overlap audit confirmed the
**Agent Lab is the richer surface** (16 modules + 3 simulators + 11 unique topics: MCP/A2A, failure
modes, etc.) vs the thin Concepts "AI Agents" gym (4 MCQ-ish modules). Decision: **canonical home =
Agent Lab**; the Concepts agent gym now **forwards** to it.

**What shipped (low-risk, nothing deleted):**
- `AgentsHub.jsx` — the "Agents" challenge-hub CTAs (`goConcepts`) now navigate to the Agent Lab
  (`onNavigate("agentlab")`) instead of the Concepts `ai-agents` gym. Card labels updated to
  "Open in Agent Lab →".
- `Concepts.jsx` — the `ai-agents` gym room renders a prominent amber **forward banner** above the
  module list pointing to the Agent Lab (16 modules, simulators, MCP/A2A, failure modes). The thin
  modules are **kept below** for deep-link backward-compat.
- One-time additive localStorage migration (`gsl-agents-migrated-v1` flag, try/catch) maps legacy
  Concepts agent mastery ids to Agent Lab equivalents inside `gsl-concepts-mastery`
  (`agent→react`, `agent-tools→tools`, `agent-memory→memory`, `guardrails→reliability`) — additive
  only, never removes.

**Preserved:** all routes/hashes (`#agentlab`, `#agents`, `#concepts` ai-agents gym), every
localStorage key, and all existing thin-module content (deep-links still resolve).

**Pattern for the rest of 0.3:** *richer surface wins, duplicate forwards* — pick the deeper
interactive home as canonical, leave the thin duplicate in place but forward users to the canonical
home; migrate progress additively; never delete (deep-links stay live).

## Phase 0.3 — Retrieval (executed 2026-07-03)
Applied the 0.3 pattern to the Retrieval surface. **The structure differs from Agents**, and the
audit outcome flips accordingly.

**Audit.** Two surfaces:
- **Concepts "Retrieval" gym** (`gym.id === "retrieval"`, `labId: "lab"`) — a **5-module structured
  curriculum**: `embeddings → chunking → rag-pipeline → context → reranking`. Each module pairs deep
  MCQ teaching (scenario + causal-chain prose that links each module to the next + graded questions +
  takeaway, in `foundationsRunnerData.js`) with a dedicated interactive in `Concepts.jsx` (embedding-
  space hover viz, chunking-with-live-retrieval simulator, LITM/context-position visualizer,
  bi-encoder vs cross-encoder reranking toggle). Broad conceptual coverage.
- **RAG Lab** (App.jsx view `lab`, scenarios in `ragScenarios.js`) — a **single-pattern failure
  simulator**: 6 diagnose-the-failure scenarios (missing answer, ambiguous query, conflicting docs,
  multi-hop, three-hop chain, prompt injection), one configure-4-controls-and-evaluate interaction +
  Challenge Mode. Excellent but narrower (one interaction pattern × 6 scenarios).
- The **Retrieval hub** is a separate aggregator: `Retrieval.jsx` (`RetrievalHub`, nav id `retrieval`)
  points at both — its "The Lab" CTA → RAG Lab (`onNavigate("lab")`), its Concepts CTAs →
  `onNavigateTo({ tab: "concepts", gymId: "retrieval" })`. So here **hub ≠ lab** (unlike Agents,
  where AgentsHub fronted a single richer Agent Lab).

**Decision: canonical retrieval-education home = the Concepts "Retrieval" gym** (richer/broader for
learning). This is the **opposite** of Agents: there the Lab dwarfed a thin 4-module gym; here the
Concepts gym is the broad 5-module curriculum and the RAG Lab is a focused, complementary simulator —
not a thin duplicate to forward away. Per the 0.3 rule "if Concepts is canonical, skip the banner,"
Retrieval takes the *no-forward* branch.

**What shipped (low-risk, nothing deleted):**
- `Retrieval.jsx` — added a Phase 0.3 marker comment on `goConcepts`; learning CTAs already route
  cleanly to the Concepts retrieval gym (kept as-is). Added `target: "concepts"` to the analytics
  payload. The RAG Lab CTA is left pointing at the RAG Lab (complementary surface, not forwarded).
- `Concepts.jsx` — **no forward banner** for the `retrieval` gym (Concepts is canonical). Added a
  NOTE next to the `ai-agents` banner documenting the deliberate asymmetry so future 0.3 passes
  don't mistakenly add one.

**Migration: skipped (noted).** No old→new module-id remap exists for retrieval — the Concepts
retrieval ids (`embeddings, chunking, rag-pipeline, context, reranking`) are already the canonical
ids and are unchanged. Unlike Agents (`agent→react`, etc.), there is nothing to migrate, so no
`gsl-retrieval-migrated-v1` flag was added. All `gsl-concepts-mastery` retrieval progress already
lives under the canonical ids.

**Preserved:** all routes/hashes (`#retrieval`, `#lab`, `#concepts` retrieval gym), every
localStorage key, and all existing content (RAG Lab + all 5 Concepts modules + their deep-links).

**Deferred (separate lighter pass):** de-duplicating the triplicated interactive widgets that exist
in **Concepts + Playground + Explore** (embedding-space viz, chunking simulator, reranking toggle).
The 0.3 rule (concept module owns the canonical viz; Playground hosts the experiment/lab version) is
recorded above but not yet enforced for retrieval — that dedupe is out of scope here and Playground
was intentionally not touched.

## Phase 0.3 — Evaluation (executed 2026-07-03)
Applied the 0.3 pattern to the Evaluation surface. **This case mirrors Agents** (Lab is canonical),
the opposite of Retrieval (Concepts was canonical) — decided on merit.

**Audit.** Three surfaces:
- **Concepts "Evaluation" gym** (`gym.id === "evaluation"`, `labId: "evallab"`) — **5 modules**:
  `eval-loop, eval-design, debug, llm-as-judge, rag-eval`. eval-loop/eval-design/debug/llm-as-judge
  have real teaching components; `rag-eval` is still a conceptual stub. RAG-flavoured and narrower.
- **Eval Lab** (App.jsx view `evallab` → `SystemsApp` with `EVAL_LAB_MODULES`, 15+ ids) — the **richer
  surface**: dedicated interactive React lab components — `EvalsLab`, `EvalFrameworksLab`, `EvalMetrics`,
  `ShouldUseAI`, `ModelStrategyLab`, `AISystemDesignCanvas`, `IncidentRoom`, `LLMObservability`,
  `ABTestingLab`, `MLCiCdLab`, `DebugTraces`, `LangSmithTracingLab`, `TrapsLab`, `PromptChangeMgmt`,
  `ModelRouter`. Covers judge design, RAGAS metrics, calibration drift, observability, A/B testing,
  ML CI/CD, incident diagnosis, trace debugging — far broader and more interactive than the gym.
- **Evaluation hub** (`EvaluationHub.jsx`, nav id `evaluation`) — a **pure aggregator** (no unique
  learning modules): a "The Lab" CTA → Eval Lab, Concepts CTAs, GroundTruth links, PrepLab links,
  tradeoff card, progress tiles. Like AgentsHub, the hub fronts the single richer Eval Lab.

**Decision: canonical evaluation-education home = the Eval Lab** (richer/broader/more interactive).
Same shape as Agents: the Lab dwarfs a thinner Concepts gym, so the Concepts eval gym **forwards** to
the Eval Lab. (Contrast Retrieval, where the Concepts gym was the broad curriculum and stayed canonical.)

**What shipped (low-risk, nothing deleted):**
- `EvaluationHub.jsx` — the "Concepts" challenge-hub CTAs (`goConcepts`) now navigate to the Eval Lab
  (`onNavigate("evallab")`) instead of the Concepts `evaluation` gym; analytics gains `target: "evallab"`.
  Card labels updated to "Open Eval Lab →" / "Open in Eval Lab →".
- `Concepts.jsx` — the `evaluation` gym room renders a prominent amber **forward banner** above the
  module list pointing to the Eval Lab (15 modules, LLM-judge, RAGAS metrics, calibration, observability,
  A/B testing, incident room, debug traces). The thin modules are **kept below** for deep-link
  backward-compat. Documented the Agents-vs-Retrieval-vs-Evaluation asymmetry in the banner comment.

**Migration: skipped (noted).** No clean old→new module-id remap exists. The Concepts eval ids
(`eval-loop, eval-design, debug, llm-as-judge, rag-eval`) do not correspond 1:1 to Eval Lab ids
(`evals, evalfw, evalmetrics, ...`) — different granularity and topic split (the gym is RAG-eval-centric;
the Lab is broad eval ops). Unlike Agents (`agent→react`, etc.) there is nothing safe to remap, so **no**
`gsl-eval-migrated-v1` flag was added. All `gsl-concepts-mastery` eval progress stays under its existing
ids; the forward banner is additive and non-destructive.

**Preserved:** all routes/hashes (`#evaluation`, `#evallab`, `#concepts` evaluation gym), every
localStorage key, and all existing content (Eval Lab + all 5 Concepts eval modules + their deep-links).

**Deferred (separate lighter pass):** the triplicated-widget dedupe (Concepts + Playground + Explore)
noted under Retrieval also applies to eval-adjacent widgets — out of scope here. Playground eval-ish
labs (Spot the Hallucination, Bias Detector) were noted but intentionally **not** touched, nor were
PrepLab or the nav frames.

---

## Phase 0.3 — Production (executed 2026-07-03)

**Surfaces audited:**
- **Concepts "Production" gym** (`gym.id === "production"`, `labId: "systems"`) — **9 modules**:
  `cost-latency-concepts, flashattn, latency-planner, observability-concepts, prompt-regression-signals,
  quality-drift, cost-attribution, managed-vs-selfhosted, enterprise-ai-cost-model`. MCQ + light
  interactives (latency-planner is a conceptual planning tool). A quick primer.
- **LLM Lab** (App.jsx view `llmlab` → `SystemsApp` with `LLM_LAB_MODULES`) — the **richer surface**:
  9 dedicated interactive React lab components — `DecodingStrategiesLab` (decoding), `KVCacheEngineering`
  (kvcache), `SpeculativeDecoding` (specdecoding), `QuantizationEngineering` (quantization), `ServingInfra`
  (serving), `ReasoningModelsLab` (reasoning), `MoEArchitecture` (moe), `InferenceOptimizer` (inference),
  `StreamingPatterns` (streaming). `serving`, `decoding`, and `inference` are logic-accurate (real
  derived outcomes, per `MODULE_FIDELITY` in Systems.jsx) — true simulators/decision engines, not
  reference cards.
- **Production hub** (`ProductionHub.jsx`, nav id `production`) — a **pure aggregator** (no unique
  learning modules): a "The Lab" CTA that already pointed at the LLM Lab (`onNavigate("llmlab")`),
  Concepts CTAs, GroundTruth links, PrepLab links, a cost/latency tradeoff card, progress tiles.
  Like AgentsHub/EvaluationHub, the hub fronts the single richer Lab.
- **Archived/production-flavoured surfaces** `InferenceOptimizer`/`ModelRouter`/`MLCiCd` — these live
  as components inside `Systems.jsx`/`systems/modules.jsx` and are already wired into the labs
  (`InferenceOptimizer` = the `inference` module in the LLM Lab; `ModelRouter`/`MLCiCd` = `router`/`mlcicd`
  in the Eval Lab). Not standalone duplicate surfaces — no action needed. Not edited (Systems.jsx content
  is out of scope per the constraint).
- **Playground** production-ish labs (Streaming Token Lab, KV Cache, Temperature Lab) — noted, **not
  touched** (Playground out of scope).

**Decision: canonical production-education home = the LLM Lab** (richer/more interactive — 9 dedicated
interactive lab components, 3 logic-accurate — vs the thinner MCQ-first Concepts production gym). Same
shape as Agents (→ Agent Lab) and Evaluation (→ Eval Lab): the Lab dwarfs the Concepts gym, so the
Concepts production gym **forwards** to the LLM Lab. (Contrast Retrieval, where the Concepts gym was the
broad curriculum and stayed canonical with no banner.)

**What shipped (low-risk, nothing deleted):**
- `ProductionHub.jsx` — the "Key Concepts" CTAs (`goConcepts`) now navigate to the LLM Lab
  (`onNavigate("llmlab")`) instead of the Concepts `production` gym; analytics gains `target: "llmlab"`.
  Card labels updated to "Open LLM Lab →" / "Open in LLM Lab →". The "The Lab" CTA already routed to
  the LLM Lab (unchanged).
- `Concepts.jsx` — the `production` gym room (`gym.id === "production"`) renders a prominent amber
  **forward banner** above the module list pointing to the LLM Lab (9 modules: serving infra, KV cache,
  speculative decoding, quantisation, streaming, inference optimisation). The thin modules are **kept
  below** for deep-link backward-compat. Documented the Agents-vs-Retrieval-vs-Evaluation-vs-Production
  asymmetry in the banner comment.

**Migration: skipped (noted).** No clean old→new module-id remap exists. The Concepts production ids
(`cost-latency-concepts, observability-concepts, ...`) do not correspond 1:1 to LLM Lab ids
(`serving, inference, kvcache, quantization, ...`) — different granularity and topic split (the gym is
cost/observability/decision-centric; the Lab is serving/inference-engine-centric). Unlike Agents, there
is nothing safe to remap, so **no** `gsl-production-migrated-v1` flag was added. All `gsl-concepts-mastery`
production progress stays under its existing ids; the forward banner is additive and non-destructive.
(The existing Concepts deep-link crosslinks `cost-latency-concepts` → LLM Lab and `observability-concepts`
→ Systems already route outward — untouched.)

**Preserved:** all routes/hashes (`#production`, `#llmlab`, `#concepts` production gym), every
localStorage key (`gsl-concepts-mastery`, `gsl-systems-done`, `gsl-preplab-history`), and all existing
content (LLM Lab + all 9 Concepts production modules + their deep-links).

**Deferred (doc-only):** the triplicated-widget dedupe (Concepts + Playground + Explore) noted under
Retrieval/Evaluation also applies to production-adjacent widgets (Streaming Token Lab, KV Cache,
Temperature Lab appear in both the LLM Lab and Playground) — out of scope here. Playground, PrepLab, the
nav frames, and Systems.jsx content were intentionally **not** touched.

## Phase 0.3 — Foundation Models (executed 2026-07-03)
Applied the 0.3 pattern to the Foundation-Models surface — the **last** domain of the Phase-0.3
consolidation. Decided on merit. The structure matches **Retrieval** (Concepts is canonical), **not**
Agents/Eval/Production (where the Lab was canonical).

**Audited surfaces (precise ids — not to be confused with the KNOW `concepts` nav item, which is the
whole Concepts app, or the `language-models` gym):**
- **Concepts "Foundation Models" gym** (`gym.id === "foundation-models"`, `#concepts` FM gym) — **7
  genuinely-interactive teaching modules**: `pretraining, instruction-tuning, model-families,
  scaling-laws, rlhf, lora, finetuning-vs-rag`. Each is a dedicated interactive React component
  (PretrainingModule / RLHFModule / InstructionTuningModule / FinetuningVsRAGModule / ModelFamiliesModule
  / LoRAModule / ScalingLawsModule) with MCQ + real interactivity (~105 interactivity signals:
  useState/onClick/inputs across the set). Covers training, alignment (RLHF/DPO), scaling laws, LoRA
  mechanics, model-family selection, and the fine-tuning-vs-RAG decision framework. This is the
  teaching curriculum.
- **Foundation Models Lab** (`FoundationModelsLab.jsx`, route/hash `#foundationlab`, 452 lines) — a
  **6-scenario config→outcome failure-mode simulator**: LoRA rank collapse, LR/catastrophic forgetting,
  eval contamination, data volume, objective mismatch, base-model mismatch. Only ~9 interactivity
  signals — a static-lookup simulator (pick a config → read a pre-written outcome with metrics/rootCause/
  fix/synthesisClose), no sliders/derived math/canvas. Rich *content*, but complementary to — not a
  superset of — the Concepts curriculum.
- **Foundations hub** (`FoundationsHub.jsx`, nav id `foundations`, `#foundations`) — a **pure
  aggregator** (no unique curriculum): surfaces both labs (FM Lab + Prompt Lab), a training-decision
  tradeoff card, 4 concept cards (all routing into Concepts), GT posts, and PrepLab questions.

**Decision: canonical foundation-models-education home = the Concepts "Foundation Models" gym.** The
Concepts gym is the broad, genuinely-interactive curriculum (7 modules); the FM Lab is a *complementary
failure-mode simulator*, not a thin duplicate — exactly the Retrieval situation (Concepts canonical, RAG
Lab complementary), and the opposite of Agents/Eval/Production (where the Lab dwarfed the gym and the gym
forwarded). Therefore Foundation Models takes the **no-forward** branch: **both surfaces stay, no banner.**

**What shipped (low-risk, nothing deleted):**
- `Concepts.jsx` — added a Phase 0.3 documentary NOTE in `GymRoomView` (next to the Retrieval note)
  recording that the `foundation-models` gym intentionally gets **NO** forward banner and why. No banner
  code added for this gym — the gym renders as-is with its 7 modules. (Note: the gym's existing
  `labId: "llmlab"` field is a pre-existing "apply-in-the-lab" pointer and was left untouched — it is
  not a forward banner.)
- `FoundationsHub.jsx` — added a Phase 0.3 marker comment on `goConcepts`; the hub's learn CTAs
  ("Key Concepts → All Concepts", and every concept card) already route cleanly to the canonical Concepts
  `foundation-models` gym via `goConcepts("foundation-models")`. The FM Lab stays surfaced as the
  complementary simulator card (unchanged). No CTA re-pointing was needed — unlike ProductionHub, where
  `goConcepts` had to be redirected to the Lab.

**Migration: skipped (noted).** No old→new module-id remap exists — nothing was renamed or moved; the
7 Concepts FM module ids are unchanged and the FM Lab keeps its own scenario ids. No
`gsl-foundations-migrated-v1` flag was added (there is nothing to migrate). All `gsl-concepts-mastery`
foundation-models progress stays under its existing ids.

**Preserved:** all routes/hashes (`#foundations`, `#foundationlab`, `#concepts` FM gym), every
localStorage key (`gsl-concepts-mastery`, `gsl-preplab-history`), the KNOW `concepts` nav item and the
`language-models` gym (untouched), and all existing content (FM Lab + all 7 Concepts FM modules).

**Deferred (doc-only):** the triplicated-widget dedupe noted under Retrieval/Evaluation/Production also
touches FM-adjacent widgets — out of scope here. Playground, PrepLab, and the nav frames were
intentionally **not** touched.

---

**Phase 0.3 complete — 5 domains consolidated (Agents/Eval/Production → their Labs (forward banner);
Retrieval/Foundations → Concepts canonical (complementary Lab, no banner), per per-domain merit audit).**

---

## Phase 0.3 — Interactive widget dedupe (executed 2026-07-03)

The final piece of Phase 0.3: the triplicated **interactive teaching widgets** flagged as "deferred
(separate lighter pass)" under Retrieval / Evaluation / Production / Foundation Models. Same 0.3 rule,
applied to the widget layer: **richer surface wins; thin/adjacent copies point at the canonical home;
delete nothing; preserve every route/hash + localStorage key.** Where a second copy is a genuinely
different teaching angle (not a redundant duplicate), both stay and the reason is noted.

### Audit (read-first, evidence)

Surfaces that host these widgets: `Concepts.jsx` (the deep 60+-module curriculum), `Playground.jsx`
(a standalone sandbox — `PLAYGROUND_MODULES` registry, each with a `HowTo` objective), `Explore.jsx`
(a reference/visualization surface — `EXPLORE_MODULES`, each with a `fidelity` note). `FoundationModelsLab.jsx`
and `TransformerWalkthrough.jsx` were checked and host **none** of these interactive widgets (FM Lab is a
config→outcome scenario picker; Transformer Walkthrough is SVG-diagram stepping — attention is explained
via static diagrams, not an interactive widget).

Per-concept map (richest instance = canonical):

| Concept | Concepts.jsx (canonical) | Playground.jsx | Explore.jsx | Decision |
|---|---|---|---|---|
| **Embeddings** | `EmbeddingModule` (~350 LOC): 2 tabs — semantic map w/ hover + vector arithmetic, similarity search w/ query picker + **top-k slider** + live cosine ranking | `EmbeddingsSim` (~115 LOC): click-to-highlight neighbors + king−man+woman demo | `EmbeddingExplorer` (3D projection, `fidelity: conceptual`) | **Concepts canonical.** Playground = vector-arithmetic sandbox → pointer. Explore = 3D spatial angle → keep (complementary). |
| **Chunking** | `ChunkingModule` (~245 LOC): strategy selector + **live sliding-window rebuild** (`buildSlidingChunks`, overlap slider) + retrieval-hit highlighting + query picker | `ChunkingLab` (~65 LOC): 4-strategy selector + simulated retrieval score bars | — | **Concepts canonical.** Playground = hands-on sandbox → pointer. |
| **Reranking** | `RerankingModule` (curriculum, bi-encoder vs cross-encoder) | `RerankerSim` (~100 LOC): drag/↑↓ reorder + **live NDCG** vs vector-order vs ideal + reveal scores | — | **Concepts canonical (teaching).** Playground = hands-on NDCG sandbox → pointer (richer *interaction* but narrower scope; complementary). |
| **Attention** | `AttentionModule` (~500+ LOC): 3 tabs — Q·K·softmax·V step walkthrough, heatmap explorer w/ hover, **O(n²) scale slider** (64–4096, memory MB) | `AttentionViz` (~115 LOC): 4 head presets + row-click highlight | `AttentionViz3D` (3D heads, `fidelity: conceptual`) | **Concepts canonical.** Playground = head-specialization sandbox → pointer. Explore = 3D angle → keep (complementary). |
| **Temperature / sampling** | `SamplingModule` (~220 LOC): 4 strategies + **temp / top-k / top-p sliders** + stochastic "sample again" + pool filtering | `TemperatureLab` (~65 LOC): temp-only slider + softmax bars | — | **Concepts canonical.** Playground = quick temp sandbox → pointer. |
| **Tokenization** | `TokenizerModule` (~250 LOC): 2 tabs — live textarea tokenize w/ cost metrics + **BPE merge-step slider** | — | `TokenizerExplorer` + `TokenizerComparison` (`fidelity: approximate`) | **Concepts canonical.** Explore = multi-model comparison / heuristic-BPE angle → keep (complementary). |

**Why Concepts is canonical (not Playground/Explore):** it consistently has the deepest interactivity
per concept — real derived math driven by sliders/inputs (top-k, overlap window, O(n²) sequence length,
temp/top-k/top-p, BPE steps), multi-tab teaching arcs, and the largest LOC. This matches the rule already
recorded under the Retrieval section: *"concept module owns the canonical viz; Playground hosts the
experiment/lab version."*

### Executed (low-risk, nothing deleted, no route/hash/localStorage/nav change)

- **`Playground.jsx`** — added an optional `canonical: { label, note }` field to the 5 overlapping
  `PLAYGROUND_MODULES` entries (`chunking`, `reranker`, `temp-lab`, `embeddings-sim`, `attn-viz`) and
  rendered it as a small muted **"Canonical lesson"** pointer line directly under the existing `HowTo`
  block (mirrors Explore's `fidelity`-note style). It names the richer Concepts module and frames the
  Playground lab as the complementary hands-on sandbox. **Plain non-routing text only** — `PlaygroundApp`
  takes no `onNavigate`/nav props, so a clickable deep-link would have required a nav change (out of
  scope); a text pointer keeps every route/hash/key untouched. Also added a block comment above the
  render explaining the pattern.
- **`Explore.jsx`** — added a doc-comment block above `EXPLORE_MODULES` marking the overlapping entries
  (`embeddings`/`attention3d` 3D angle, `cosine` exact-math angle, tokenizer comparison angle) as
  **complementary, intentionally kept** — Concepts is canonical for the interactive teaching version.
  No render change: Explore's copies are genuinely different teaching angles (3D spatial / exact cosine
  math / multi-model comparison), not thin duplicates, and the per-module `fidelity` notes already flag
  their scope. Forwarding them away would lose real teaching value.
- **`Concepts.jsx`** — added a single doc-comment block above the widget cluster (`TokenizerModule`
  onward) marking Concepts as the CANONICAL interactive home for the six core widgets, so future passes
  don't forward these away. No behavior change.

### Deferred (documented, not edited)

- **A clickable cross-surface deep-link** from a Playground lab into the exact Concepts module. This
  would need `PlaygroundApp` to receive `onNavigate` + a Concepts module-deep-link route, i.e. a nav
  wiring change — out of scope for this conservative pass. The text pointer captures the intent without
  the risk. If wired later, reuse the existing `onNavigateTo({ tab: "concepts", gymId, moduleId })`
  shape used elsewhere.
- **Explore's `TokenizerExplorer` vs `TokenizerComparison`** (two tokenizer widgets on the *same*
  surface) — a possible intra-Explore merge, but they serve different jobs (single-string explorer vs
  side-by-side model comparison). Left as-is; not a Concepts-vs-Explore duplication.
- **No merge/deletion of any widget.** Every widget block, route, hash (`#concepts`, `#playground`,
  `#explore`), and localStorage key (`gsl-concepts-mastery`, `gsl-explore-done`) is preserved. All
  deep-links still resolve.

**Verification:** all three edited files esbuild-parse clean (`OK Playground.jsx`, `OK Explore.jsx`,
`OK Concepts.jsx`).

**Phase 0.3 fully complete** — 5 knowledge domains consolidated (above) + the interactive widget layer
deduped by canonical-home pointers (this section). Concepts is the canonical interactive teaching home;
Playground and Explore keep their copies as complementary sandbox / spatial-math angles, now signposted.
