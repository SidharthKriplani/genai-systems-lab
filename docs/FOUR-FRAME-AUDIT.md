# FOUR-FRAME AUDIT — GenAI Systems Lab (GSL)

_Read-only / propose-only audit against the Competence Model (`HQ/COMPETENCE-MODEL.md`, DEC-15). Maps GSL's existing surface to the four frames — recall+depth → fluency → ownership → judgment — finds where it's thin, and proposes (does not build) an IA reframe. **No nav rebuilt, no content added, no code touched.** Run 2026-06-22, sprint 81._

> The model in one line: the four frames are a **dependency ladder**, not peers. recall+depth → (gates) → fluency → (together gate) → ownership → (all three gate) → **judgment**. Judgment is the apex and assumes the three below it are already there. Communication is the cross-cutting layer over all four, not a fifth frame. Ownership is **scaffold + capture** (lab scaffolds; Career OS captures), never "taught."

---

## TL;DR — the verdict

**GSL is a barbell, not a pyramid.** Its mass sits on the *two ends* of the ladder — a huge **recall+depth** library and a huge **judgment** apparatus — while the **fluency** rung in the middle is near-missing and **ownership** is scaffold-only. Where MSL was lopsided toward judgment (~64%), GSL is lopsided toward *both* extremes with a hollow middle:

| Frame | Coverage | One-line state |
|---|---|---|
| 1 · Recall + Depth | **DEEP** (over-supplied) | 320 GT posts + 15 interactive Concepts + 6 Flows. The lab's center of gravity. |
| 2 · Fluency (execute/code it) | **THIN → near-MISSING** | No code-authoring problem bank. The "Fluency" tab is mis-named — it's *communication*, not code-fluency. |
| 3 · Ownership (scaffold) | **THIN (by design)** | Guided system-design ProjectLabs + "How I'd Build X" blueprints scaffold it; capture is correctly Career OS's job. |
| 4 · Judgment | **DEEP** (over-supplied) | RAG Lab (tiered diagnose) + 37 Systems decision-sims + PrepLab (597 Qs) + case studies. Second center of gravity. |

**The structural problem:** the ladder's second rung (fluency) is broken. GSL *tests* judgment heavily but never *trains* the executing-fluency that, per the model, judgment is supposed to stand on. A user can read 320 posts and diagnose the RAG Lab, yet never write or fix a line of code under time inside this lab.

---

## 1. Surface inventory — everything a user can hit

14 top-level tabs + Learning Paths + the GT corpus. Counts are from the live nav (`App.jsx`), module files, and `groundTruthIndex.js`.

| # | Tab / zone | What it is | Size |
|---|---|---|---|
| 1 | **Home** | Start-Here journey, Learning Paths, progress, module map | wayfinding |
| 2 | **Concepts** | Interactive explainers: Tokenizer, Embeddings, Attention (QKV+heatmap), Transformer, Chunking, Sampling, Context Window, Agent Loop, Guardrails, **Debug RAG**, Multi-Agent, Flash Attention, Next Token, Temperature, Context Compaction | 15 |
| 3 | **Flows** | Animated pipelines: RAG, Agent Loop, Context Window, Guardrail Pipeline, Transformer Block, RAG Architectures | 6 |
| 4 | **RAG Lab** | Configure → observe → **diagnose** failure scenarios; Junior→Staff tiered scoring | 6 scenarios |
| 5 | **Agents** | ReAct, Tool Use, Memory, Multi-Agent, **Failure Modes**, Planning, Loop Simulator, **AgentConfigLab**, LangSmith Tracing, … | 16 |
| 6 | **Systems** | Decision simulators tagged DESIGN/BUILD/OPS/**JUDGE**/**DECISION**/**DIAGNOSE**: Evals, Cost/Latency, Model Strategy, Should-You-Use-AI?, Fine-Tuning, India Scale, Caching, Router, Inference, Incident Room, Observability, A/B, ML CI/CD, Compaction, … | 37+ |
| 7 | **Playground** | Injection attacks, chunking comparison, reranker toggle, hallucination spotting, bias detection + prompt library | 5 |
| 8 | **Explore** | Embedding Space, Shadow A/B, Latency Planner, Tokenizer Explorer, Model Card Reader, Vector DB Comparison, Structured Outputs, Red Teaming, Embedding Model Selection, LLM Comparison Matrix | 14 |
| 9 | **Fluency** | Phrase Bank, Timed Drills, Prompt Engineering, **Mock Interview**, Company Case Arena | 5 |
| 10 | **AI Product** | PRD simulator, roadmap prioritizer, stakeholder explainer, launch checklist, AI-or-not? framework | 5 |
| 11 | **Career** | **Guided ProjectLabs** (6 system builds), Judgment challenges (Rank Outputs, Find the Prompt Bug, Design an Eval, RAG System Design, Eval Harness, Incident Response, Cost Blowout), System-design interviews, Negotiation flashcards, benchmark literacy | 5 zones |
| 12 | **Ask / Consultation** | Keyword search over 320 posts + all module descriptions | retrieval |
| 13 | **PrepLab** | Judgment Exam (timed), Trainer (feedback), Interview Prep Plan (JD→gap→plan), Weakness Heatmap, Company Tracks, Browse | 597 Qs / 6 modes |
| 14 | **Ground Truth** | 320 written deep-dives across 30 series | 320 posts |
| + | **Learning Paths** | First Principles, Senior AIE — guided step sequences | 2 paths |

**GT corpus shape** (320 posts, 30 series) — the biggest single asset:
- *Depth-leaning series:* llm-internals (20), training-stack (26), llm-fundamentals (14), nlp-origins (13), build-from-scratch (18), model-deep-dive (11), ml-foundations (8), retrieval-depth (10), eval-depth (7), reasoning-inference (5).
- *Judgment-leaning series:* case-studies (9), failures category (17), perspectives (6), research-taste (2), how-i-build (10), high-tc-targets (11), interview-ready (6).
- *Ops/production:* llmops (41), production-mlops (11), agent-production (9), mcp-protocol (4).

---

## 2. Frame tagging (primary + secondary)

Each surface gets one **primary** frame and optional secondary. Reminder: judgment content *assumes* recall+depth+fluency; ownership is scaffold; communication is cross-cutting (tagged `[comm]`, not a frame).

| Surface | Primary frame | Secondary |
|---|---|---|
| Ground Truth — depth series | **Recall+Depth** | Judgment (case-studies/failures), Ownership-scaffold (build-from-scratch, how-i-build) |
| Concepts (15) | **Recall+Depth** | Judgment (Debug RAG) |
| Flows (6) | **Recall+Depth** | — |
| Explore (14) | **Recall+Depth** | Judgment (Vector-DB / model-selection / Shadow A/B decision tools) |
| Ask / Consultation | **Recall+Depth** (retrieval) | wayfinding |
| Playground (5) | **Judgment** (spot/diagnose) | Fluency-experiential (config, no code authoring) |
| Prompt Engineering (in Fluency) | **Fluency** (the only real authoring surface) | Recall+Depth |
| RAG Lab (6) | **Judgment** | Recall+Depth |
| Systems (37+) | **Judgment** (decision sims) | Recall+Depth, Ownership-scaffold (design modules) |
| Agents (16) | **Recall+Depth** (patterns) | Judgment (Failure Modes, ConfigLab) |
| AI Product (5) | **Judgment** (product decisions) | `[comm]` (stakeholder explainer) |
| PrepLab (597 Qs) | **Judgment** (scenario MCQs) | Recall+Depth (knowledge MCQs) |
| Career — Guided ProjectLabs (6) | **Ownership-scaffold** | Judgment (component selection) |
| Career — Judgment challenges (7) | **Judgment** | Ownership-scaffold (Eval Harness, Incident Response) |
| Career — Negotiation / Salary | `[comm]` / career | — (Career-OS territory) |
| "Fluency" tab — Phrase Bank, Mock Interview, Case Arena | `[comm]` (interview/verbal fluency) | Judgment (mock rehearsal) |
| Learning Paths (First Principles, Senior AIE) | wayfinding (sequences the ladder) | — |
| Home / Profile | wayfinding | — |

**The naming trap to flag:** the tab literally called **"Fluency"** is *not* the model's fluency frame. It holds phrase banks, mock interviews, and case arenas — i.e. **communication**. The model's fluency ("code it out, write it correctly and quickly, evaluate the code an LLM hands you") has almost no home here. This collision actively *hides* the gap: the lab looks like it covers fluency because a tab is named that.

---

## 3. Coverage table — per frame

### Frame 1 · RECALL + DEPTH — **DEEP (over-supplied)**
- **What exists:** the 320-post GT library (the depth spine — internals, training stack, NLP origins, build-from-scratch, model deep-dives), 15 interactive Concepts (Attention QKV heatmap, live Tokenizer, Context Window), 6 animated Flows, the explainer half of Explore, and Ask (retrieval over all of it).
- **Strength:** **deep** — arguably the strongest recall+depth library of any BreakLabs lab.
- **Standouts:** GT `build-from-scratch` (BPE, word2vec, FAISS, contrastive from scratch), `llm-internals` (20), the interactive Attention + Tokenizer Concepts, the new `nlp-origins` embeddings arc.

### Frame 2 · FLUENCY (execute / code it) — **THIN → near-MISSING**
- **What exists:** Prompt Engineering Lab (real authoring, but prompts not code). Playground config (toggle reranker/chunking — manipulation, not authoring). "Find the Prompt Bug" (one Career challenge). `build-from-scratch` GT posts let you *read* implementations.
- **Strength:** **thin/missing.** There is no graded, timed, correctness-checked **code** bank — no "write the chunker," "fix this broken retrieval function," "evaluate the code the LLM just handed you." PrepLab is MCQ, not execution.
- **Standouts:** Prompt Engineering Lab is the only true authoring surface, and it's prompt-level, not code-level.

### Frame 3 · OWNERSHIP (scaffold + capture) — **THIN, but appropriately scoped**
- **What exists:** Career → 6 **Guided ProjectLabs** (AI Support System, Enterprise Search, Code-Gen Tool, Multimodal Search, Doc-Analysis Agent, Code-Review Bot — select must/optional components with rationale); the "How I'd Build X" GT series (10) + build-from-scratch (18) as blueprints.
- **Strength:** **thin.** The ProjectLabs scaffold *component-selection judgment*, not an end-to-end owned artifact. **Capture is correctly absent** — the model says capture is Career OS's spine, not the lab's. So the lab is doing the right *kind* of ownership work (scaffold), just lightly.
- **Standouts:** the 6 Guided ProjectLabs; "How I'd Build E-Commerce Search Ranking."

### Frame 4 · JUDGMENT — **DEEP (over-supplied)**
- **What exists:** RAG Lab (6 configure→fail→diagnose scenarios, Junior→Staff tiers), Systems (37+ decision/diagnose sims), Concepts→Debug RAG, Agents→Failure Modes + AgentConfigLab, Playground spot/diagnose, PrepLab Judgment Exam + Company Tracks (597 Qs), GT case-studies/failures/perspectives, Career judgment challenges, AI Product decision frameworks.
- **Strength:** **deep** — the apex frame is the second center of gravity. The lab's whole identity ("configure the system and watch it fail, then learn why") is a judgment engine.
- **Standouts:** RAG Lab tiered diagnosis, the Systems decision simulators (Should-You-Use-AI?, Model Strategy, Incident Room), PrepLab Judgment Exam.

### Cross-cutting · COMMUNICATION — **well-served, mis-shelved**
- The "Fluency" tab (Phrase Bank, Mock Interview, Case Arena), AI Product stakeholder explainer, Career negotiation flashcards, PrepLab Interview Prep Plan. Plentiful — but siloed in a tab instead of held as a standard over every frame.

---

## 4. Gap report — what it means for a user climbing the ladder

1. **The fluency rung is broken (the headline gap).** Per the elimination model, judgment "has nothing to stand on" without fluency. GSL inverts this: it pours resources into the apex (judgment) and the floor (depth) but never builds the rung that connects them. A learner who finishes every Concept and passes the RAG Lab still **cannot demonstrate they can write or fix GenAI code under time** anywhere in this lab. In a real interview's elimination order, they'd be cut at the coding round the lab never trained.
2. **"Fluency" the tab masks "fluency" the frame.** The mis-naming means the gap is invisible from the nav — it *looks* covered. Any reframe must rename this and stand up a real execution surface.
3. **Ownership is light and judgment-flavored.** The Guided ProjectLabs ask "pick the right components," which is closer to judgment than to building+owning. The scaffold→Career-OS-capture handoff exists in principle but isn't wired in the UI.
4. **Judgment is over-built relative to the floor beneath it.** Not a problem in isolation — but the model says you earn the right to show judgment. GSL offers a lot of judgment practice a user technically hasn't earned yet (no fluency gate passed). The ladder is top-heavy.
5. **Depth is over-supplied and slightly undifferentiated.** 320 posts across 30 series is a strength, but without frame labels a user can't tell which post builds *depth* vs which is a *judgment* case study — they read as one undivided pile.

**Net:** GSL is excellent at the *bookends* of competence and absent in the *connective tissue*. The user experience is "learn deeply, then get judged hard, with no place to actually get fast at doing it."

---

## 5. Proposed restructure (PROPOSE-ONLY — nothing built)

Reorganize the 14 tabs into **4 frame-zones + a communication standard + wayfinding**, so every menu item declares its frame. This is mostly an IA/label reframe of what already exists — plus one genuine new build (fluency).

```
GenAI Systems Lab
│
├─ �⃟ START / PATHS            (wayfinding — not a frame)
│     Home · Learning Paths (First Principles = the ladder; Senior AIE = judgment path) · Ask
│
├─ ① FOUNDATIONS · Recall + Depth        "Understand the machine"     [DEEP]
│     Concepts (15) · Flows (6) · Explore-explainers ·
│     Ground Truth: nlp-origins, llm-fundamentals, llm-internals, training-stack,
│                   model-deep-dive, ml-foundations, retrieval-depth, eval-depth, build-from-scratch
│
├─ ② FLUENCY · Execute it                "Write it — fast and correct" [THIN → BUILD]
│     ★ NEW: GenAI code/prompt problem bank — timed, correctness-checked
│            (write a chunker · fix a broken retrieval fn · evaluate LLM-written code · build-from-scratch as DO, not READ)
│     Re-homed here: Prompt Engineering Lab · Playground hands-on (chunking/reranker/config)
│
├─ ③ OWNERSHIP · Scaffold                "Build & own a real system"   [THIN — by design]
│     Career → Guided ProjectLabs (6) · "How I'd Build X" GT (10) · build-from-scratch blueprints
│     → handoff to Career OS for CAPTURE (the earned résumé line; capture is NOT the lab's job)
│
├─ ④ JUDGMENT · Decide · Diagnose · Defend   "Choose & defend under constraint"  [DEEP — apex]
│     RAG Lab (6, tiered) · Systems (37+ decision sims) · Concepts→Debug RAG ·
│     Agents→Failure Modes + ConfigLab · Playground spot/diagnose ·
│     AI Product decisions · GT case-studies/failures/perspectives · Career judgment challenges ·
│     PrepLab Judgment Exam + Company Tracks
│        └─ 5-D framework + multi-method ladder + scenario-dial + MCQ sit UNDER this frame (not peers of it)
│
└─ ⊗ COMMUNICATION  (cross-cutting standard over ①–④, surfaced in each — NOT a tab)
      ex-"Fluency" tab: Phrase Bank · Mock Interview · Case Arena ·
      AI Product stakeholder explainer · Career negotiation · PrepLab Interview Prep Plan
```

**Where each current tab lands:** Concepts/Flows/Explore-explainers/Ask → ①. Prompt Lab + Playground-config → ②. Career ProjectLabs + how-i-build → ③. RAG Lab + Systems + Agents-failures + PrepLab + AI-Product-decisions → ④. The "Fluency" tab content → ⊗ (communication). Home/Paths/Profile → wayfinding.

**Content that doesn't fit / cut candidates (propose, don't act):**
- **"Fluency" tab name** — collides head-on with the model's fluency frame while holding communication content. Rename (e.g. "Interview Room") and re-shelve under ⊗. *This is the single most important rename.*
- **Negotiation flashcards / Salary Calculator** — career/communication; arguably Career-OS territory, not lab surface. Candidate to move, not delete.
- **Judgment over-supply** — Systems (37+) and the judgment half of Explore are abundant; no deletion needed, but freeze additions here until fluency exists (see build order).
- Nothing requires deletion *for the model* — DEC-15 is an IA reframe, not a content purge.

---

## 6. Build-order note (per DEC-15: cover recall+depth + fluency first, layer judgment last)

For most labs the A-phase is "build the floor." GSL is unusual — **its floor (depth) and its apex (judgment) are already over-built; the missing work is the middle rung.** So the sequence for THIS lab is:

1. **Recall+Depth — DONE. Re-label only.** No new content. Tag GT/Concepts/Flows to Frame ①; split the GT pile so depth posts read as depth, not as undivided content. (Zero build, pure IA.)
2. **Fluency — BUILD FIRST (highest leverage).** Stand up the one genuinely missing surface: a timed, correctness-checked GenAI code/prompt problem bank, and convert build-from-scratch from *read* to *do*. This is the rung judgment is supposed to stand on; until it exists, the lab's heavy judgment apparatus rests on nothing. Rename the "Fluency" tab out of the way first.
3. **Ownership — strengthen the scaffold (second).** Deepen the Guided ProjectLabs from component-selection toward a guided end-to-end build, and wire the explicit Career-OS capture handoff. Keep capture out of the lab.
4. **Judgment — re-IA only, DO NOT add (last).** It's already the apex and over-supplied. Nest the 5-D framework + scenario-dial + MCQ *under* Frame ④, label the Junior→Staff tiers as the judgment ladder, and **freeze new judgment content** until fluency is filled — consistent with DEC-15's rule that you don't pile on the apex before the gates beneath it are cleared.

**One-line build order:** _relabel depth (free) → **build the fluency bank** → thicken the ownership scaffold → nest (don't grow) judgment._ The barbell becomes a ladder by filling the middle, not by adding more to the ends.

---

## Appendix — model-compliance checks
- **Judgment assumes the lower frames** ✓ — flagged that GSL's judgment currently floats above a missing fluency gate.
- **Ownership = scaffold + capture** ✓ — lab scaffolds (ProjectLabs/blueprints); capture left to Career OS; not over-promised.
- **Communication = cross-cutting, not a 5th frame** ✓ — pulled the mis-named "Fluency" tab into a communication standard.
- **5-D / multi-method / scenario-dial / MCQ sit UNDER judgment** ✓ — placed beneath Frame ④, not as peers.
- **Primary + optional secondary per item** ✓ — §2 tags both.
- **This is an IA reframe of what exists** ✓ — only one real new build proposed (fluency); everything else is relabel/re-shelve. Propose-only; nothing built.

_Sources: `HQ/COMPETENCE-MODEL.md`, `HQ/DECISIONS.md` (DEC-15), `HQ/MANIFESTO.md`, `growth/linkedin/docs/CONTENT-DEPTH-STANDARD.md`; GSL `README.md`, `src/App.jsx` (nav), `src/groundTruthIndex.js` (320 posts / 30 series), module files (`Concepts/Flows/Retrieval/Systems/Agents/Playground/Explore/Fluency/AIPM/Career/PrepLab.jsx`)._
