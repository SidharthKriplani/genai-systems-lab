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

---

## P0.1 — Speak layer grafted into Fluency (executed 2026-07-03)

**What was ported.** MSL's tiered spoken-drill ("Spoken Practice") from
`ml-systems-lab/src/tabs/SpokenPracticeTab.jsx`, grafted 1:1 in shape onto GSL's Fluency surface as a
new **Speak** mode. This is a PORT, not a rebuild — the tier model, Web-Speech wiring, timer, and
self-check flow are reused verbatim; only styling and the content source changed.

**The ported pattern (unchanged shape):**
- **4-tier drill per question:** 30-Second Answer (30s) → 2-Minute Answer (120s) → Interviewer Pushback
  (60s) → Reason When Unsure (90s). Tiers 3–4 reframe the base prompt.
- **Web Speech API:** `window.SpeechRecognition || window.webkitSpeechRecognition`, `continuous +
  interimResults`, final transcripts appended, `onend`/`onerror` guarded against double-fire via
  `isStoppingRef`. Live per-second timer runs only while recording.
- **Self-check** ("Yes, hit it" / "Not yet") per tier + tier progress dots.

**What changed from MSL:**
- **Content source:** runs over the GSL **PrepLab bank** (`PREP_QUESTIONS`, 591 questions) instead of
  MSL's 32-question hardcoded list. Topic + difficulty filters are derived dynamically from the bank.
- **Model-answer self-comparison** (new, GSL-specific): after each rep the user reveals the question's
  `explanation` + `staffLayer` ("Senior framing") + `keywords` to compare against. MSL had no model
  answer to compare to.
- **Pushback tier:** PrepLab questions have no per-question `pushback` field (MSL's did), so Tier 3
  generates a generic interviewer challenge derived from the question's own `trap` when present, else a
  topic-agnostic "where does it break in production?" prompt.
- **Theme:** restyled from MSL's warm `--prime`/`--ink-*` tokens to GSL's dark zinc palette + `#22c55e`
  green accent (Fluency sits in the GROW nav group). Tailwind classes, no lucide, no TypeScript — per
  GSL constraints.

**Files touched:**
- **NEW** `src/SpeakMode.jsx` — the Speak component (default export `SpeakMode`), imports
  `PREP_QUESTIONS` from `./data/preplabQuestions.js`. Read-only over the bank; content untouched.
- `src/Fluency.jsx` — additive only: `import SpeakMode`, added `{ id: "speak", label: "Speak", tag:
  "SPOKEN" }` to `FLUENCY_MODULES`, added `"speak"` to the SKILL nav group, added
  `{activeModule === "speak" && <SpeakMode />}` render branch. No existing mode, route, hash, or key
  changed.

**New localStorage key:** `gsl-speak-history` — `{ [questionId]: true }` map of fully-drilled questions
(all 4 tiers completed). Does not collide with existing keys (`gsl-preplab-history`,
`gsl-concepts-mastery`, `genai_drill_best_*`, `genai_visited_fluency`, etc.).

**Fallback behavior:** where the Web Speech API is unavailable (Firefox, iOS Safari — detected on mount)
`speechSupported` flips to false: the mic controls are hidden, an amber notice explains why, and the
transcript box becomes a textarea for a timed think-then-type flow. The 4-tier timer + self-check +
model-answer comparison all still work — only voice capture degrades. Identical to MSL's fallback.

**Verification:** esbuild-parse clean — `OK src/SpeakMode.jsx`, `OK src/Fluency.jsx`.

**Deferred / notes:**
- Speak does not yet respect PrepLab's `gated` flag — all 591 questions are drillable regardless of
  access code. Consistent with the sibling Fluency modes (MockInterview, Timed Drills) which are also
  ungated. If Speak should honor gating later, filter `PREP_QUESTIONS` by `user`/access state the same
  way `ExamMode` does.
- No PostHog event on drill completion (sibling Fluency modes are also uninstrumented). Add a
  `speak_drill_completed` event if drill funnel data is wanted.
- Pushback is generic-derived, not hand-authored per question. If per-question pushbacks are desired
  later, add a `pushback` field to `PREP_QUESTIONS` (do not do this inside P0.1 — bank content is
  read-only here).

---

## P0.2 pilot — Retrieval L2 case-chain (executed 2026-07-03)

**What this was.** A single fully-authored L2 case chain for the **Retrieval** domain, plus the
reusable **schema** and **renderer** the other domains (Agents / Eval / Production / Foundations)
will be mass-produced against. GSL's existing labs diagnose **one** failure at a time; an L2 chain
is a **multi-step narrative** where each correct diagnosis resolves the current symptom and
**surfaces the next latent one**, forcing layered senior/staff diagnosis. Pilot only — one domain,
one chain — to lock the contract before scaling.

**Schema reused from MSL.** Mirrors MSL's Incident Room:
`src/data/drills/caseChains.js` (data shape) + `src/tabs/IncidentRoomTab.jsx` (walk-through
renderer: present step → pick → reveal correct diagnosis + causal `finding` → advance).
GSL's one deliberate extension is a per-step **`consequence`** field — the connective tissue that
makes it an L2 *chain* rather than a bag of independent MCQs (resolving step N exposes symptom N+1).

**The GSL case-chain schema (author every future chain to this — it is documented in the header of `src/data/caseChains.js`):**
```
{ id, domain, subtopic, level:"senior"|"staff", type:"casechain", title,
  context: string[],                       // system + numbers + top-level symptom
  steps: [ {
      symptom,                              // this layer's surfaced problem
      evidence: string[],                   // metrics / traces to reason over
      question,
      options: [{ id, text }],              // 3–4 candidate diagnoses (one correct)
      correct,                              // id of the right option
      finding,                              // first-principles causal WHY
      whatsTested, antiPattern, seniorFraming,
      consequence                           // fixing this → next symptom (null on last step)
  } ],
  diagnosis, explanation, fix, source }
```
Public accessor `getCaseChains(domain)` keeps the renderer decoupled — future domains register
their chains in the same array and filter by `domain`, no component changes.

**The pilot chain (`chain-rag-recall-answer-quality`, staff, 4 layers):**
1. **recall 0.93 but 61% answer quality** → precision/context-noise is the leak, not recall
   (adding recall makes it worse). → fixing precision via a cross-encoder reranker + trimmed context…
2. …**breaks multi-hop** — a single dense query can't serve two information needs; aggressive top-4
   drops the second entity. → fixing it via query decomposition / per-entity budgets…
3. …**exposes version-blindness** — semantic relevance is recency-blind, so stale near-duplicate
   chunks win ties; `effective_date` metadata is present but unread. → fixing via bitemporal
   metadata-aware reranking…
4. …**exposes the missing abstention layer** — no retrieval-confidence gate + no grounding check, so
   unanswerable queries produce confident fabrications. Close the loop with a calibrated score gate +
   faithfulness verification ("I don't know" as a first-class output).
Debrief: `diagnosis` / `explanation` (how layers compound) / `fix` (ordered remediation).

**Renderer location.** `src/RetrievalCaseChains.jsx` (default export `RetrievalCaseChains`,
prop `domain="retrieval"`). Mirrors IncidentRoomTab in GSL's idiom: destructured hooks, Tailwind
`zinc-*` + `var(--gal-build)` / `var(--surface-2)` / `var(--border)` tokens, inline SVG only, no
lucide, no TypeScript. Collapsible chain card → context → per-step (symptom → evidence → 3–4 options →
pick → reveal `finding` + whatsTested/antiPattern/seniorFraming → `consequence`) → completion debrief.

**Surfaced additively** in `src/Retrieval.jsx` as a new **"Case Chains" (L2 · multi-step)** section
between "The Lab" and the tradeoff card. Static import of `RetrievalCaseChains` (RetrievalHub is
itself lazy-loaded by App.jsx). **No routes / hashes / nav ids / existing localStorage changed.**

**New localStorage key:** `gsl-casechain-history` — shape `{ [chainId]: { completed: true, at } }`.
No collision with existing `gsl-*` keys (`gsl-preplab-history`, `gsl-concepts-mastery`,
`gsl-rag-done`, `gsl-tracks-v1`, `gsl-speak-history`, etc.).

**Files touched.**
- NEW `src/data/caseChains.js` — schema (documented in header) + 1 Retrieval chain + `getCaseChains()`.
- NEW `src/RetrievalCaseChains.jsx` — the walk-through renderer.
- EDIT `src/Retrieval.jsx` — import + additive "Case Chains" section (nothing removed).

**Verification.** esbuild-parse clean — `OK src/data/caseChains.js`, `OK src/RetrievalCaseChains.jsx`,
`OK src/Retrieval.jsx`. No runtime (Mac-only build) — verified by parse + review.

**PostHog events (new):** `casechain_view`, `casechain_open`, `casechain_pick`, `casechain_reveal`,
`casechain_complete` (via the existing `track()` wrapper — env-gated, no-op without key).

**Mass-produce pass (next) — what it entails.** The contract is now fixed, so scaling is content, not
plumbing:
1. **Author 1–2 chains per remaining domain** to `RETRIEVAL_CASE_CHAINS`'s sibling arrays in
   `src/data/caseChains.js` (or split per-domain files that re-export into one registry), each with
   `domain` set to `agents` / `eval` / `production` / `foundations`. Candidate chains:
   - **Agents:** tool-call succeeds but wrong tool → fix routing → now loops/no-termination →
     fix loop guard → now context-window blowup from accumulated observations → summarisation/memory.
   - **Eval:** LLM-as-judge agrees with humans offline → ships → judge is position-biased →
     fix ordering → now judge rewards verbosity → rubric anchoring → now offline/online eval gap.
   - **Production:** p99 latency spike → fix batching → now cost blows up → semantic caching →
     now cache serves stale/wrong answers → invalidation + retrieval-freshness.
   - **Foundations:** tokenizer/context-window → attention/lost-in-the-middle → quantization quality
     regression → serving tradeoffs.
2. **Surface per domain** — each hub (`AgentsHub.jsx`, `EvaluationHub.jsx`, `ProductionHub.jsx`,
   `FoundationsHub.jsx`) adds the same additive "Case Chains" section, rendering
   `<RetrievalCaseChains domain="..." />` (rename the component to `CaseChains` at that point — one
   generic renderer, N domains). No new localStorage key; `gsl-casechain-history` is domain-agnostic.
3. **Optional wiring:** count completed chains into `readiness.js` (a new signal), add a My Tracks
   `casechain` item type, and a Progress.jsx tile. All additive, none required for the content pass.
4. **Depth bar:** every step must have a real first-principles `finding` + a plausible distractor set +
   a `consequence` that genuinely surfaces the next layer. Reject any "chain" that is really N unrelated
   MCQs — the layered dependency IS the product.

## P0.2 — L2 case-chains mass-produced across all domains (executed 2026-07-03)

Pilot contract (see P0.2 pilot section) held; scaling was content, not plumbing. Now **5 domains, 1 staff-level chain each**, all rendered by the one generic renderer.

**Plumbing added:**
- `src/CaseChains.jsx` — generic renderer alias (re-exports the pilot's domain-agnostic `RetrievalCaseChains`). All hubs import this.
- `src/data/caseChains/{agents,evaluation,production,foundations}.js` — one per-domain array each (`AGENTS_/EVAL_/PRODUCTION_/FOUNDATIONS_CASE_CHAINS`), authored independently.
- `src/data/caseChains.js` — now imports the four per-domain arrays + retrieval into `ALL_CASE_CHAINS`; `getCaseChains(domain)` filters that. Bundle-verified (esbuild resolves all imports).

**Chains authored (each 4 layers, real numbers/traces, plausible senior-mistake distractors, per-step `consequence` surfacing the next symptom):**
- **Retrieval** (pilot): recall≠quality → reranker precision → multi-hop decomposition → version-blindness → abstention gate.
- **Agents**: ambiguous tool interface (routing) → no termination criterion (loops) → observation/context blowup → state incoherence (tiered memory).
- **Evaluation**: position/order bias → verbosity bias → offline↔online gap (stale/contaminated set) → judge-human calibration + self-preference (Simpson's trap).
- **Production**: tail latency (no batching) → KV-cache memory bound (paged/quantized KV) → semantic-cache correctness → autoscaling/cold-start thrash.
- **Foundations**: BPE tokenization fragmentation → lost-in-the-middle + RoPE context extension → LoRA rank vs catastrophic forgetting + SFT/DPO objective → int4 PTQ quality collapse (outliers/calibration).

**Wiring:** each hub (`AgentsHub/EvaluationHub/ProductionHub/FoundationsHub`) got an additive "Case Chains (L2 · multi-step)" section rendering `<CaseChains domain="..." />` between its Lab and Tradeoff sections. Retrieval already had its section from the pilot.

**Preserved:** additive only, nothing deleted; no routes/hashes/nav ids changed; single localStorage key `gsl-casechain-history` shared across domains.

**Deferred (documented):** wire case-chain completion into `readiness.js` + Progress tile + My Tracks (additive, later); optional 2nd chain per domain for depth.

## P1 — Review room ported (executed 2026-07-03)

MSL's Review room (`src/tabs/ReviewTab.jsx`, spaced-rep over completed foundation modules) ported into GSL as an additive personal-layer room. Same spaced-rep model, GSL's own completion signals, GSL dark theme.

**Spaced-rep model reused (SM-2-lite, verbatim from MSL):** intervals grow with review count — `[3, 7, 21, 45, 90]` days, capped at 90. The next-due clock runs from `lastReviewed`, or from the item's learned/first-seen anchor if never reviewed. `intervalForReviews(n)` + `DAY_MS` copied directly. Added grade granularity on top: self-grade Again / Good / Easy → advance 0 / +1 / +2 review-steps (MSL had a single "Mark reviewed" = +1). "Again" holds the current short interval so the item resurfaces soon.

**Completion signals it reads (existing keys, read-only, never written):**
- `gsl-concepts-mastery` — JSON array of mastered Concepts module ids. Resolved to title (prompt) + subtitle (recall answer) + gym label/color via **newly-exported** `MODULES` + `GYMS` from `Concepts.jsx`.
- `gsl-casechain-history` — `{ [chainId]: { completed, at } }`. Completed chains resolved to title (prompt) + `diagnosis` (recall answer) via `ALL_CASE_CHAINS` from `data/caseChains.js`. The chain's `at` seeds the learned anchor.

**New localStorage key:** `gsl-review-schedule` — `{ [itemKey]: { reviews, lastReviewed, firstSeen } }`, itemKey = `concept:<id>` / `chain:<id>`. No collision with any existing `gsl-*` key. Writes dispatch a `gsl_review` CustomEvent so the room re-renders after a grade. First surface of any item writes a stable `firstSeen` anchor so due-dates don't drift across sessions.

**Card flow:** prompt (module title / incident headline) → user self-recalls out loud → "Reveal the key point" → shows the module subtitle / chain diagnosis (existing authored content, nothing invented) + a deep-link back to the full module/chain → self-grade → reschedule. One due card at a time, with an "Also due" peek + "Scheduled later" list. Empty state routes to Foundations when nothing is mastered/eligible.

**Files touched:**
- `src/Review.jsx` — NEW. The room.
- `src/Concepts.jsx` — `MODULES` and `GYMS` consts made `export const` (additive; no behavior change).
- `src/App.jsx` — lazy import `ReviewPage`; `NAV_TRACK` gets `{ id: "review", label: "Review" }` (renders in both desktop sidebar TRACK cluster + `MobileFrameNav`); `VALID_VIEWS` += `"review"`; route branch `topView === "review"` renders `<ReviewPage onNavigate={navigate}/>` inside a Suspense boundary; `TAB_TITLES.review` added.
- `src/config/nav.js` — `ALL_TABS` += `{ id: "review", label: "Review", group: "TRACK", ... }`.

**Nav id added:** `review` (hash `#review` — GSL is hash-routed via `VALID_VIEWS`, so `#review` works; no separate hash table needed, matches how `progress`/`profile`/`my-tracks` are registered).

**Preserved:** additive only, nothing deleted; no existing routes/hashes/nav ids/localStorage keys changed. Dark theme matched via CSS vars (`--surface`, `--surface-2`, `--border`, `--gal-build*`) + zinc utility classes.

**Simplification (documented):** the recall "answer" is the module's authored one-line `subtitle` (its key teaching point) / the chain's `diagnosis` — NOT the deep per-module RUNNER_DATA takeaway. Wiring into each module's runner payload was out of scope for an additive port; the subtitle is a faithful recall target and "Open the full module →" deep-links to the full depth. Review currently pulls from Concepts mastery + case chains; PrepLab/lab-visit signals (`genai_visited_modules`, `gsl-preplab-history`) are not yet review sources — additive to add later via the same `buildItem` path.

**Verified:** esbuild-parse OK on `Review.jsx`, `App.jsx`, `Concepts.jsx`, `nav.js`; named exports `MODULES`/`GYMS`/`ALL_CASE_CHAINS` confirmed present. No runtime (Mac-only build).

## Foundations content — exhaustiveness pass, wave 1 (executed 2026-07-03)

Assessment finding: the existing 18 foundations modules (language-models + foundation-models gyms) are genuinely STRONG (first-principles, numerical) — the gap was BREADTH, not depth. Five staff-critical topics had no learning home. Added them.

**5 NEW modules** (teaching content in `src/data/foundations/*.js`, spread into RUNNER_DATA; MODULES entries use `component: StubModule` so the runner renders the rich RUNNER_DATA teaching with no interactive yet):
- **quantization** (foundation-models) — VRAM math (70B fp16 140GB→int4 35GB), PTQ vs QAT, GPTQ/AWQ/NF4, int8-vs-int4 quality cliff (outlier activations), KV-cache quant, calibration-set representativeness.
- **dpo** (foundation-models) — derives DPO from the RLHF objective's closed-form optimum → implicit reward as log-ratio → Bradley-Terry → BCE loss `−log σ(β·(s_chosen−s_rejected))`; β/reference-KL role; off-policy limits vs PPO; IPO/KTO/ORPO.
- **speculative-decoding** (language-models, after sampling) — memory-bound decode → draft proposes k / target verifies in one pass → lossless accept/reject (min(1,p/q)) → α-driven speedup math → helps at batch-1, not compute-saturated; Medusa/EAGLE.
- **moe** (foundation-models) — router + top-k gating; ACTIVE vs TOTAL params (Mixtral 8x7B ~47B total/~13B active); compute∝active, memory∝total; load-balancing loss/collapse.
- **distillation** (foundation-models) — soft labels/dark knowledge; KL objective + temperature (T² gradient); response/feature/relation/sequence variants; synthetic-data distillation (Orca/Phi); distill-vs-quantize-vs-prune.

**Plumbing:** `src/data/foundations/{quantization,dpo,speculative-decoding,moe,distillation}.js` each export a keyed RUNNER_DATA fragment; `foundationsRunnerData.js` imports + spreads them; `Concepts.jsx` got 5 MODULES entries + the ids added to the two gyms' `moduleIds`. Additive, no routes/localStorage touched. Data layer bundle-verified.

**Wave 2 — DEFERRED (deepen existing STRONG modules):** ALiBi + NTK/PI in positional-encoding; RMSNorm-vs-LayerNorm in transformer; refocus `nextoken` onto its own mechanism (currently detours into forgetting/PEFT); beam search in sampling; vocab-size↔seq-length tradeoff in tokenizer; MLM/bidirectional objective in pretraining. Also: real interactives for the 5 new modules (currently teaching-only via StubModule).

---

## Readiness upgrade — capped-breadth + work-next (executed 2026-07-03)

Brought GSL's readiness system to the MSL/PAL bar. **Additive** — every prior `readiness.js` export and every `gsl-*` localStorage key is preserved; nothing deleted.

### Model reused (source)
- **MSL** `src/utils/readiness.js` `computeReadiness()` + **PAL** `src/components/shared/ReadinessWidget.jsx` `computeReadiness()`. Both use: overall = **mean of per-area coverage, each area capped at 1 (100%)** so over-grinding one area can't mask a gap elsewhere; weakest = lowest-coverage area with headroom (`cov < 1`) → the "work next" pointer; **streak/activity excluded from the score** (cram-to-a-date, not a forever-streak app). MSL's `HomeTab.jsx` renders the score + "Work next: <area>" + "Work on it →" as the Home front door.

### readiness.js changes (new exports, all additive)
- `getOverallReadiness()` → `{ score, level, color, weakest, areas[], hasQuiz }`. Score = `round(mean(area.cov) * 100)` over the 5 domain areas (Retrieval/Evaluation/Agents/Production/Foundations) **plus an optional 6th "assessment" area** when the quiz has been taken. Each area's `cov = min(pct/100, 1)`. Per-area `pct` = `max(activity-inferred pct, quiz-reported pct)` so an explicit self-rating isn't dragged down by low tracked activity (and vice-versa). Levels: Just Starting/Building/Practitioner/Senior/Staff (same thresholds as `getAreaReadiness`).
- `getWorkNext()` → `{ id, label, color, pct }` for the weakest domain area with headroom (assessment area excluded — it's not a place to navigate). `id` matches nav ids, so `onNavigate(id)` deep-links directly.
- **Quiz hook (plumbing built, full quiz UI deferred):** `getQuizResult()`, `saveQuizResult(scores)`, and exported `QUIZ_AREAS`. New localStorage key **`gsl-assessment-quiz`** — shape `{ retrieval, evaluation, agentshub, production, foundations: pct(0-100), takenAt: ms }`. Any caller can write a self-rating and the capped-breadth score picks it up automatically (both as its own assessment area and as a per-area nudge). A dedicated quiz screen/entry-point is **DEFERRED** — the score plumbing + storage layer are live; the UI to collect the ratings is not yet built.
- Untouched: `getAreaReadiness`, `getAllAreasReadiness`, `AREA_CONFIG` — all existing callers (5 hubs + Home) unaffected.

### Home.jsx changes (additive)
- Imported `getOverallReadiness`; added `const [overall] = useState(() => getOverallReadiness())`.
- New **readiness hero** card (above the existing per-area "Your readiness" list, which is preserved): big `score%`, level, capped-breadth gap-max bar, an "incl. self-assessment" tag when a quiz exists, an explainer line, and a **"Work next: <weakest area>" + "Work on it →"** button that fires `track("readiness_work_next", …)` and `onNavigate(overall.weakest.id)` to deep-link into the weakest area. Renders only when any area has activity. GSL dark theme via existing `var(--surface-2)`/`var(--border)` + area colors.

### Files touched
- `src/readiness.js` — capped-breadth aggregation + `getWorkNext` + quiz plumbing.
- `src/Home.jsx` — import + `overall` state + readiness hero/work-next front door.
- `docs/GSL_MASTER_PLAN.md` — this entry.

### Verify
esbuild-parse (GSL verifies via esbuild, not acorn): `src/readiness.js`, `src/Home.jsx`, `src/App.jsx` → all **OK**. No runtime (Mac-only build) — verified by parse + review.

### Deferrals
- **Assessment quiz UI** — only the readiness.js plumbing + `gsl-assessment-quiz` storage + a `saveQuizResult` entry point exist. The screen that collects the per-area self-ratings is not built.

---

## Company Tracks — scaffold + 1 populated track (executed 2026-07-03)

Curated, company-specific interview-prep paths for AI-engineering roles. Mirrors the MSL Company Tracks pattern (`ml-systems-lab/src/tabs/CompanyTracksTab.jsx` + `src/data/companyTracks.js`), adapted to GSL's dark theme, deep-link dispatcher, and real content ids. Additive — no existing route/hash/nav id/localStorage changed.

### Data model
`src/data/companyTracks.js` — grid is **company × role × level**.
- `COMPANIES` — 24 firms (Google/Meta/Amazon/… + Indian unicorns Flipkart/Swiggy/CRED/… + Sarvam AI, Quantiphi).
- `ROLES` (AIE roles) — Applied AI Engineer · ML Engineer (GenAI) · AI Researcher · Forward-Deployed Engineer.
- `LEVELS` — Mid · Senior · Staff.
- `CTRACKS` — sparse map keyed `` `${company}|${role}|${level}` ``. Each cell is an ordered list of `{ tabId, itemId, label, kind }`. Empty cells render a "coming soon" state. Helpers: `trackKey`, `getCompanyTrackItems`, `companyHasTrack` (green dot on companies with ≥1 populated cell).

### Deep-link mechanism
Each item's `tabId` maps to App.jsx's `navigateTo()` dispatcher in `CompanyTracks.jsx > openItem()`:
- `concepts` → `navigateTo({ tab:'concepts', gymId:itemId })` (Foundations gym; Concepts deep-links by gym, not per-module — labels name the module set).
- `groundtruth` → `navigateTo({ tab:'groundtruth', postId:itemId })`.
- `preplab` → `navigateTo({ tab:'preplab', topic:itemId })` (topic routes to trainer mode).
- everything else (`lab`, `agents`, `fluency`, …) → `navigateTo({ tab:tabId })`.

### The populated track — Google · Applied AI Engineer · Senior (most accessible target)
30-step prep arc, foundations → retrieval → agents → eval → production → prep. All itemIds are REAL, verified ids:
1. **Foundations** — gyms `language-models`, `foundation-models`; GT `chinchilla-scaling-laws`.
2. **Retrieval/RAG** — gym `retrieval`; GT `how-rag-works`, `chunking-strategies`, `hybrid-search`, `reranking-explained`, `rag-system-design`; RAG Lab (`lab`).
3. **Agents** — gym `ai-agents`; GT `react-pattern`, `tool-use-design`, `agent-failure-modes`; Agent Lab (`agents`).
4. **Evaluation** — gym `evaluation`; GT `llm-evaluation-guide`, `llm-as-judge-failure`, `eval-pipeline-design`.
5. **Production** — gym `production`; GT `cost-latency-tradeoffs`, `deployment-patterns-ml`, `drift-detection-production`, `llm-observability`.
6. **Prep** — GT `ambiguous-system-design-framework`, `high-tc-ai-company-interviews`; PrepLab drills topic `rag` / `agents` / `sysdesign`; Interview Room (`fluency`).

### Logos
Reuses existing GSL `src/CompanyLogo.jsx` + `src/companyDomains.js` (Google-favicon + initial-badge fallback). No image assets fabricated.

### Nav id + hash
- Nav id / hash: **`company-tracks`** → `#company-tracks`.
- Added to `App.jsx` `NAV_SECTIONS` under the **PREP & ASSESS** frame (alongside PrepLab, Interview Room), `VALID_VIEWS`, a lazy `CompanyTracksPage` import + route branch. `TAB_FRAME` auto-derives (item is in a NAV_SECTIONS frame).
- Registered in `src/config/nav.js` `ALL_TABS` (group `PRIMARY` — has a GROUP_COLORS entry).

### Files
- `src/CompanyTracks.jsx` — new (component, dark theme, company rail + role/level chips + ordered checklist + coming-soon state).
- `src/data/companyTracks.js` — new (data model + populated track).
- `src/App.jsx` — lazy import, VALID_VIEWS, NAV_SECTIONS item, route branch (edits only).
- `src/config/nav.js` — ALL_TABS entry (edit only).
- `docs/GSL_MASTER_PLAN.md` — this entry.

### Verify
esbuild-parse: `src/CompanyTracks.jsx`, `src/data/companyTracks.js`, `src/App.jsx`, `src/config/nav.js` → all **OK**. All referenced gym ids, GT post ids, PrepLab topics verified present via grep. No runtime (Mac-only build) — verified by parse + id-existence check.

### Deferrals
- **Only 1 of 288 cells populated** (24 companies × 4 roles × 3 levels). Scaffold + coming-soon state cover the rest; each unpopulated cell renders cleanly with a jump-to-example link.
- **Concepts deep-link granularity** — opens the gym, not a specific module (Concepts only accepts `initialGym`). Labels name the exact module set so the user knows what to open inside.
- **No progress tracking** — items don't yet reflect per-item completion from localStorage (optional per brief; deferred to keep additive footprint minimal).

---

## Foundations interactives — 5 new module widgets, executed 2026-07-03

Replaced `StubModule` with real, computed interactive components for the 5 new Foundations modules in `src/Concepts.jsx` (defined just above the `MODULES` array; only this file changed). Runner now renders both the RUNNER_DATA teaching AND a Hands-On widget for each, matching the 18 existing modules.

- **QuantizationModule** — fp16/int8/int4 selector + params slider → live weight VRAM (params×bytes), which-GPU-fits, and a quality bar; int4 exposes the RTN-vs-GPTQ/AWQ/NF4 cliff. Mirrors 70B 140GB→35GB.
- **DPOModule** — β + margin (s_chosen−s_rejected) sliders → live `−log σ(β·Δ)` with an SVG loss curve and gradient/push readout. Mirrors the β=0.1 worked example (Δ=+5 → loss≈0.48; Δ=−5 → ≈0.97).
- **SpeculativeDecodingModule** — α, k, draft-cost sliders → expected tokens/target-pass `(1−α^(k+1))/(1−α)+1`, round cost, and speedup with a break-even bar. Mirrors k=4/α=0.75 → ~2.5–3×; α=0.40 → net-neutral.
- **MoEModule** — #experts, top-k, expert size, shared size → ACTIVE vs TOTAL params, memory:compute ratio, and an active/idle expert grid. Reproduces Mixtral 8x7B ~47B total / ~13B active and the 2×A100-40GB OOM.
- **DistillationModule** — temperature T slider over teacher logits [4,3,−1,−3] → live softmax(z/T) bar chart exposing dark knowledge, plus the 1/T² gradient shrink and T² rescale. Mirrors T=1 vs T=3 distributions.

Wiring: the 5 `MODULES` entries changed `component: StubModule` → the matching component. RUNNER_DATA, ids, gym wiring untouched. esbuild JSX parse: **OK**. No other file required changes (`FoundationsRunner` already gates the Hands-On section on a non-stub Component).

---

## Foundations readability + MSL-standard — renderer upgrade + 2 pilot modules (executed 2026-07-03)

**Problem.** `FoundationsRunner.jsx` rendered every `explanation[]` string as flat `<p>{item}</p>` — no bold, no emphasis, no crafted breaks. Modules read as walls of prose. MSL's `RecSysFoundationTab` renders markdown via `renderMd`, shows `keyPoints`, and offers a **Quick recap** toggle. This closes that gap.

### 1. Renderer upgrade (`src/FoundationsRunner.jsx`) — additive, GSL dark theme

Added a small, safe **inline-markdown tokenizer** (`InlineMd` / `tokenizeInline`) — **no `dangerouslySetInnerHTML`**; everything parses to React nodes and all non-markup text renders verbatim. Supported syntax:

| Syntax | Renders as |
|--------|-----------|
| `**bold**` | semibold near-white (`text-zinc-50`) |
| `*italic*` / `_em_` | italic muted (`text-zinc-300`) |
| `` `code` `` | mono chip (amber-on-zinc, bordered) |
| `==highlight==` | subtle violet highlight (`bg-violet-500/15`) — the one-line insight per section |
| `\n\n` | paragraph break (block + top margin) |
| single `\n` | line break (`<br/>`) |

The existing `{ type: "illustration" }` `<pre>` ASCII block rendering is **untouched**. Applied `InlineMd` to explanation strings and the takeaway. Plain strings with no markup render exactly as before — **zero regression** for the other 21 modules.

**`keyPoints` contract** — optional `keyPoints: string[]` on any RUNNER_DATA module renders a styled "Key Points" list (violet ▸ bullets, boxed) after the Explanation section. Each point runs through `InlineMd`, so markdown works inside points.

**`recap` contract** — optional `recap: string[]` adds a **Full / ⚡ Quick recap** toggle under the header. Quick-recap mode swaps the whole body for a terse violet-bulleted recap plus the takeaway; Full mode is the normal single-scroll page. Modules without `recap` show no toggle.

Both fields are fully additive: a module with neither `keyPoints` nor `recap` and no markdown renders identically to before.

### 2. Two pilot modules reformatted to the new standard

- **Pilot A — `attention`** (in `src/data/foundationsRunnerData.js`): all 13 explanation strings rewritten for rhythm — key terms and payoffs bolded, asides in em-dashes, one `==highlight==` insight per section, long paragraphs broken with `\n\n`. Added 6-item `keyPoints` + 6-item `recap`. Technical content and numbers unchanged; illustration block and 3 MCQs intact. Before: dense unbroken prose. After: skimmable, with the derivation's turning points visually marked.
- **Pilot B — `quantization`** (in `src/data/foundations/quantization.js`): all 8 explanation strings reformatted the same way (fp16/int8/int4 byte math, GPTQ/AWQ/NF4, KV-cache lever, calibration failure mode all preserved verbatim). Added 6-item `keyPoints` + 6-item `recap`. Both illustration blocks and 4 MCQs intact.

### 3. Verification

- esbuild transform parse: `FoundationsRunner.jsx`, `foundationsRunnerData.js`, `quantization.js` → all **OK**.
- esbuild bundle of `foundationsRunnerData.js` (pulls in the quantization import + spread) → **BUNDLE OK**.

### Follow-up

The remaining **21 foundations modules** are a mass pass to this same standard: reformat `explanation[]` strings (bold/em/`==highlight==`/`\n\n`) and add `keyPoints` + `recap` arrays. The renderer already supports all of them — it's purely a content pass.

---

## GSL premium-niche tracks — Voice AI + Code-Gen + Inference Optimization + Model Customization skeletons (executed 2026-07-03)

Built 4 durable, well-paid GenAI specialization tracks as KNOW-side **skeletons** (structure + specced modules + honest "🚧 In development" state), so GSL gets the same durable-specialization scaffold MSL is getting. Additive only — no existing gym/module/route/localStorage touched.

### Niches chosen (light research: WebSearch, 2025–2026 salary/demand signals)

1. **Voice & Speech AI** — NLP/speech engineers ~$170K–$231K; real-time voice agents are a fast-growing premium surface (ASR/TTS + turn-taking is a distinct, durable skill). Not covered by any existing GSL gym.
2. **Code Generation & AI Coding Assistants** — SWE-bench Verified crossed 80% in mid-2026; agentic coding (repo-level retrieval + test-feedback loops) is one of the hottest applied surfaces and durable. Not covered.
3. **Inference Optimization & Serving** — vLLM/TensorRT/quantization/CUDA is repeatedly cited as the highest-paid niche after frontier research ($300K–$500K+ for kernel-level work). Deliberately scoped to **serving internals** (prefill/decode, continuous batching, PagedAttention, serving stacks, edge/on-device) to NOT overlap the existing "production" gym (cost/latency/observability) or the conceptual quantization Foundations module.
4. **Model Customization & Fine-Tuning-as-a-Service** — LLM fine-tuning/customization is "the bread-and-butter of applied AI" at $220K–$350K TC. Scoped to the **applied/productization** angle (the fine-tune decision, data curation, multi-adapter serving, eval-driven loop) so it does NOT duplicate the conceptual LoRA/RLHF/DPO teaching in the existing "foundation-models" gym.

None duplicate GSL's existing gyms (language-models, retrieval, ai-agents, evaluation, production, foundation-models, prompt-engineering, vector-infrastructure, multimodal, ai-safety-alignment).

### Architecture (matches the existing Foundations pattern exactly)

- Each track's module RUNNER_DATA lives in its **own new file** under `src/data/tracks/*.js` and is spread into `src/data/foundationsRunnerData.js` via added imports (`RUNNER_VOICE_AI`, `RUNNER_CODE_GEN`, `RUNNER_INFERENCE_OPT`, `RUNNER_MODEL_CUSTOM`). No existing RUNNER_DATA entry was edited.
- Each module is a `MODULES` entry with `component: StubModule`. The `FoundationsRunner` renders the RUNNER_DATA (scenario + explanation outline + takeaway) and shows no Hands-On section because `Component === StubModule` passes `null`. No fake MCQs authored — the runner renders cleanly without them.
- Each track is an enterable `GYMS` entry (dark theme, distinct accent color) so users can read the specced outlines now.
- SKELETON HONESTY: every module's `scenario` and first `explanation` line carry a "🚧 In development — outline below" marker; `fidelity.tier: "skeleton"`. Each outline is a genuinely useful numbered spec of the niche's interview canon + a planned illustration.

### Module outlines (5 per track = 20 modules)

**Voice & Speech AI** (`voice-ai`, accent #a855f7):
- `voice-asr-architectures` — CTC vs RNN-T vs Whisper/AED; audio front-end; streaming-vs-accuracy fork; decoding + domain LM.
- `voice-streaming-latency` — the real-time loop (VAD→ASR→endpointing→LLM→TTS); TTFA latency budget; barge-in.
- `voice-tts-cloning` — acoustic model + vocoder; codec/LLM-style TTS; zero-shot cloning; consent/deepfake governance.
- `voice-realtime-agents` — turn-taking, barge-in, cascaded vs speech-to-speech, tool-calling over voice, ASR-error robustness.
- `voice-eval-wer-mos` — WER (and what it misses), MOS/neural-MOS, end-to-end task-success eval, component-vs-system trap.

**Code Generation & AI Coding** (`code-generation`, accent #14b8a6):
- `codegen-model-training-fim` — why code differs; fill-in-the-middle (PSM/SPM); code data quality; code tokenization.
- `codegen-repo-context-retrieval` — lexical+dense+structural (call-graph) hybrid retrieval; AST-aware chunking; API grounding.
- `codegen-agentic-loops` — localize→edit→test→observe→retry loop; planning; autonomy guardrails; where agents plateau.
- `codegen-eval-passk-swebench` — pass@k estimator; HumanEval vs SWE-bench (real repos); contamination/Goodhart.
- `codegen-security-sandboxing` — repo prompt injection; sandboxing/least-privilege; insecure/hallucinated deps; diff review.

**Inference Optimization & Serving** (`inference-optimization`, accent #f97316):
- `infra-prefill-decode` — compute-bound prefill (TTFT) vs memory-bound decode; KV cache as central object.
- `infra-batching-throughput` — static vs continuous/in-flight batching; throughput-vs-latency dial; chunked prefill.
- `infra-paged-attention-kv` — KV fragmentation; OS-style paging; prefix sharing; KV quantization.
- `infra-serving-stacks` — vLLM vs TensorRT-LLM vs Triton; tensor/pipeline/expert parallelism; precision; build-vs-buy.
- `infra-edge-ondevice` — int4 edge quantization; llama.cpp/GGUF/MLX/ONNX runtimes; small-model selection; hybrid cloud escalation.

**Model Customization & Fine-Tuning** (`model-customization`, accent #eab308):
- `custom-when-to-finetune` — customization ladder (prompt→RAG→fine-tune→pretrain); behavior-not-facts trap; hidden costs.
- `custom-data-curation` — quality>quantity (LIMA); build eval first; synthetic data/distillation risks; leakage.
- `custom-peft-lora-serving` — LoRA/QLoRA recap; multi-adapter serving (one base + N adapters, S-LoRA-style); adapter lifecycle.
- `custom-preference-alignment` — RLHF (RM+PPO) vs DPO (direct, modern default); preference data; alignment tax/over-refusal.
- `custom-eval-driven-loop` — eval-first; catastrophic forgetting + regression suite; the fine-tune flywheel; governance/rollback.

### Files touched

- **New:** `src/data/tracks/voice-ai.js`, `src/data/tracks/code-generation.js`, `src/data/tracks/inference-optimization.js`, `src/data/tracks/model-customization.js`.
- **Edited (additive):** `src/data/foundationsRunnerData.js` (+4 imports, +4 spreads); `src/Concepts.jsx` (+20 `MODULES` StubModule entries after the foundations block, +4 `GYMS` entries before the array close).

### Verify

- esbuild parse of all 4 new `src/data/tracks/*.js` → **OK**.
- esbuild parse of `src/Concepts.jsx` (jsx loader) → **OK**.
- esbuild **bundle** of `foundationsRunnerData.js` (must resolve the 4 new `./tracks/*` imports) → **BUNDLE OK** (673kb).
- Runtime check on the bundled RUNNER_DATA: all 20 new keys present, each with `scenario`+`explanation[]`+`takeaway`, all carrying the "In development" marker; total RUNNER_DATA keys 89. All 20 MODULES ids present exactly once; all 4 gyms present; brace diff 0 on every new file.

- 2026-07-03: Added About page (`src/About.jsx`, dark theme) — what GSL is, who it's for, the KNOW/DO/BUILD/JUDGE + PREP frames, challenge domains, how to start, WhatsApp community link, and BreakLabs siblings. Wired additively into `NAV_TRACK`, `VALID_VIEWS`, `GUEST_ALLOWED_TABS`, `TAB_TITLES`, the `about` route branch, and `nav.js` ALL_TABS (id `about`, hash `#about`).

---

## BUILD as real coding — pilot (guided code walkthrough, executed 2026-07-03)

**Concept.** GSL's BUILD today = simulators + Project Labs (career). The real differentiator for an Applied AI Engineer is *reading and reasoning* about real, idiomatic GenAI systems code — MCP servers, RAG pipelines, multi-agent orchestrators — not writing another toy app. "Code Labs" is a guided read-and-reason surface: annotated real code shown in steps, each with what/why/tradeoff and a judgment checkpoint (MCQ / "what breaks if…"). **No runtime execution, no Pyodide** — verification is by parse + review.

### Files touched (additive only)
- **NEW** `src/data/codeLabsData.js` — data schema (documented in file header) + `CODE_LABS` array + `CODE_LAB_BY_ID` lookup. Holds the pilot lab.
- **NEW** `src/CodeWalkthrough.jsx` — the renderer (GSL dark theme; reuses FoundationsRunner primitives: `SectionRule`, `InlineMd`, `QuestionBlock`). Lab browser → single lab view (intro → annotated steps → key-decisions recap). Completion gated on answering all checkpoints.
- `src/App.jsx` — lazy import `CodeWalkthroughApp`; BUILD-frame nav row `{ id: "codelabs", label: "Code Labs" }` (above Project Labs); `VALID_VIEWS` += `codelabs`; `GUEST_ALLOWED_TABS` += `codelabs` (free); `TAB_FRAME.codelabs = "build"`; render branch `topView === "codelabs"`.
- `src/config/nav.js` — `ALL_TABS` += `{ id: "codelabs", label: "Code Labs", group: "BUILD" }`.

### Schema (CODE_LABS entry)
```
{ id, title, subtitle, tag, difficulty("intro"|"core"|"advanced"), minutes,
  intro: { scenario, whatYouBuild, prereqs[] },
  steps: [ { title, language, code(string, real code in a <pre>),
             explanation[](what + why + tradeoff, InlineMd markdown),
             checkpoint?: { question, options[], correct(idx), explanation } } ],
  recap[](key decisions recap) }
```
InlineMd supports `**bold**`, `*em*`, `` `code` ``, `==highlight==`, `\n\n` paragraph — same convention as FoundationsRunner. A lab is completable once every checkpoint has been answered.

### Nav id / hash / localStorage
- nav id: **`codelabs`** · hash: **`#codelabs`** · frame: **BUILD** · guest-free.
- NEW localStorage key: **`gsl-codelabs`** (JSON array of completed lab ids). No collision with existing keys.

### Pilot lab (1, fully authored)
- **`mcp-server-min` — "Read a Minimal MCP Server"** (MCP · Python, core, ~18 min, 6 steps, 6 checkpoints). Real, idiomatic Python using the official MCP SDK. Steps: (1) `Server` object + name/identity → capabilities-vs-transport split; (2) `list_tools` + JSON `inputSchema` as the model's contract (`required` as input validation); (3) `call_tool` handler dispatch + async work + list-of-content-blocks return; (4) error handling — a raised error is a model-readable observation, not a crash; (5) stdio transport loop — **stdout is the JSON-RPC channel, never print to it**; (6) whole-file recap + client launch config (host launches server as subprocess, no port/deploy). Sample checkpoint: "developer adds `print()` inside `call_tool`, client disconnects mid-session — why?" → the print corrupts the JSON-RPC stream on stdout.

### Verification
esbuild-parse (jsx/js loaders) of all four files → **OK OK OK OK** (`src/CodeWalkthrough.jsx`, `src/data/codeLabsData.js`, `src/App.jsx`, `src/config/nav.js`). No runtime — read-and-reason surface, reviewed by parse.

### Scale plan (next labs, same schema — drop straight into CODE_LABS)
- **RAG pipeline** — chunk → embed → retrieve → rerank → ground; checkpoints on chunk-size tradeoff, top-k vs. reranker, groundedness/citation policy.
- **Multi-agent orchestrator** — planner / worker / critic loop; checkpoints on loop termination, tool-poisoning, context handoff.
- **Eval harness** — LLM-as-judge with rubric + CI gate; checkpoints on judge calibration, distribution mismatch, pass/fail thresholds.
Each is authored the same way (real code, 6–10 steps, judgment checkpoints) and needs zero renderer/nav changes — only a new `CODE_LABS` entry.
