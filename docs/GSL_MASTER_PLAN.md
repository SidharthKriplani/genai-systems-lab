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
