# FRAME CATEGORIZATION — GenAI Systems Lab (every artifact, weighted)

_Exhaustive per-artifact categorization of GSL against the four frames, with weightage. Built 2026-06-23 from a 5-agent parallel read-only audit. Supersedes the tab-level `docs/FOUR-FRAME-AUDIT.md` with per-item granularity + a weighted coverage rollup. The point: stop counting tabs; measure how much real KNOW / DO / BUILD / JUDGE the lab actually carries, weighted by depth — so we know what to build next._

---

## 0. The frames — definitions + the litmus test (mode of mastery, NOT topic)

| Frame | Builds | Litmus test (the one question) | Output |
|---|---|---|---|
| **KNOW** (recall + depth) | understanding | *"Could an interviewer quiz you on it?"* | comprehension |
| **DO** (fluency) | execution | *"Did your own hands write/fix/run code or a gradeable prompt under a correctness check?"* | a working artifact you produced |
| **BUILD** (ownership) | a system you own | *"Did you make end-to-end architecture decisions across a whole system, not one step?"* | a system you can defend as yours |
| **JUDGE** (judgment) | the call | *"Were you graded on deciding/diagnosing under constraint, not recalling?"* | a defended decision |

Not frames (tagged separately): **COMMS** (communication — phrase bank, mock interview, stakeholder explainer) and **WAY** (wayfinding — Home, paths, search, progress).

**The weightage rule.** Almost nothing is pure. A Systems decision-sim *teaches while it tests* (≈ JUDGE 70 / KNOW 30); Debug RAG is an explainer that makes you diagnose (KNOW 55 / JUDGE 45). So every artifact gets **three measures**:
- **Split** — 4 integers summing to 100 across KNOW/DO/BUILD/JUDGE (+ COMMS/WAY where genuine).
- **Mass** — S / M / L / XL (depth × reach). Weighted as **S=1 · M=2 · L=4 · XL=8**.
- **Fill** — `live` (complete) · `thin` (exists but shallow) · `stub` (placeholder/empty).

---

## 1. THE HEADLINE — weighted coverage (Σ mass × split)

Estimate from the per-surface tables below (mass weights S1/M2/L4/XL8; per-surface representative splits). Wayfinding excluded.

| Frame | Weighted mass | Share | Bar |
|---|---:|---:|---|
| **KNOW** | ~891 | **~59%** | ████████████████████████████ |
| **JUDGE** | ~413 | **~27%** | █████████████ |
| **DO** | ~120 | **~8%** | ████ |
| **BUILD** | ~99 | **~6%** | ███ |

**Read it straight:** KNOW + JUDGE = **~86%** of the lab's weighted mass. DO + BUILD ≈ **14%** combined — and that's generous.

> **The DO number is inflated and you should not trust the 8%.** Almost all of it is Ground Truth *build-from-scratch* posts — where you **read** an implementation, you don't **write** one. Reclassify "reading code" as KNOW (which is what it is) and **true hands-on DO — write/run/graded — is ≈ 2-3%, effectively zero.** There is no surface in GSL where you author code or a free prompt and get a correctness check. (Prompt Engineering = static good/bad gallery; Prompt Challenges = 4-option MCQ. Neither is DO.)

**So the barbell is now measured, not asserted:** a massive KNOW body, a heavy JUDGE apparatus, a hairline DO rung, and a thin BUILD rung that is mostly *un-graded free-text* (Career take-home rubrics reveal an expert answer; nothing auto-scores your build).

---

## 2. Per-surface counts + frame lean (the map)

| Surface | Live items | Stub | Dominant | Notable |
|---|---:|---:|---|---|
| Ground Truth | 320 posts (30 series) | — | KNOW (~70-75% primary) | ~40% carry >25% JUDGE/DO/BUILD secondary |
| Concepts (modules) | 27 + 6 Flows | **22** | KNOW | JUDGE minority (debug, eval-loop, scaling, CoT); **zero BUILD, ~no real DO** |
| Systems | **60** | — | KNOW (~58) | strong JUDGE (decision-sims); config-sims give the lab's *only* BUILD/DO hints |
| Explore | **24** | — | KNOW (~72) | JUDGE in selector/decision tools; 7 thin reference tables |
| Playground | **8** | — | mixed | JUDGE scored games (reranker/hallucinate/bias) + KNOW sandboxes |
| Agents | 16 | — | KNOW (11) | JUDGE 5 (failures, design, simulator, agentcfg) |
| RAG Lab | 6 scenarios | — | **JUDGE (all 6)** | the flagship JUDGE engine, tiered Junior→Staff |
| AI Product | 5 | — | JUDGE/BUILD | stakeholder = COMMS |
| Career | 6 modules / 13 gradeable | — | JUDGE + BUILD | the BUILD "ProjectLabs" are 4 **thin free-text** rubric scenarios inside Take-home |
| PrepLab | 597 Qs / 6 modes | — | **JUDGE** | diagnostic MCQ bank; KNOW spine in Foundations |
| Fluency | 8 | — | COMMS / JUDGE | **no true DO** here either |
| Paths + Ask | 6+ paths, 1 search | — | WAY | wayfinding |

**Corrections the audit surfaced (the old tab-level numbers were off):** Systems is **60** modules (not 37), Explore **24** (not 14), Playground **8** (not 5). Career has **no standalone "Guided ProjectLabs (6 builds)"** — those are 4 free-text rubric sub-challenges nested in `TakeHomeChallenge`, all `thin`. There is **no standalone LangSmith module** (it's inside Framework Landscape). RAG Lab's 6 scenarios are: missing-answer, ambiguous-query, conflicting-docs, multi-hop, three-hop-chain, prompt-injection (no "context overflow").

---

## 3. Ground Truth — by series (320 posts)

Split = K/D/B/J. Mass/fill apply to the series; outliers below.

| Series | # | Primary | K/D/B/J | Mass | Fill |
|---|---:|---|---|---|---|
| llm-fundamentals | 14 | KNOW | 78/8/2/12 | M | live |
| rag-production | 21 | KNOW | 62/8/8/22 | M–L | live |
| agent-engineering | 21 | KNOW | 58/10/12/20 | M–L | live |
| eval-testing | 24 | KNOW | 60/15/5/20 | M | live |
| llmops | 32 | KNOW | 55/10/8/27 | M–L | live |
| training-stack | 19 | KNOW | 68/12/8/12 | M–L | live |
| model-deep-dive | 11 | KNOW | 80/2/2/16 | M–L | live |
| case-studies | 9 | **JUDGE** | 45/2/8/45 | L | live |
| career-strategy | 19 | KNOW | 70/8/2/20 | M–L | live |
| interview-ready | 9 | DO | 50/35/2/13 | M | live |
| llm-internals | 13 | KNOW | 85/8/2/5 | M–L | live |
| paper-to-production | 5 | KNOW | 70/2/8/20 | L | live |
| finetuning (cat) | 12 | KNOW | 70/12/6/12 | M–L | live |
| production-mlops | 11 | KNOW | 60/10/10/20 | L | live |
| reasoning-inference | 5 | KNOW | 55/5/5/35 | L | live |
| mcp-protocol | 4–5 | KNOW | 65/15/8/12 | M | live |
| perspectives | 6 | KNOW | 85/0/0/15 | S | live |
| frontier | 3 | KNOW | 88/2/2/8 | M | live |
| how-i-build | 11 | **BUILD** | 38/12/40/10 | L–XL | live |
| data-flywheel | 3 | KNOW | 60/10/8/22 | M–L | live |
| build-from-scratch | 9 | **DO\*** | 30/60/5/5 | L | live |
| nlp-origins | 7 | KNOW | 62/30/2/6 | L | live |
| retrieval-depth | 5 | KNOW | 60/30/5/5 | L | live |
| llmops-production | 6 | KNOW | 58/15/7/20 | L | live |
| eval-depth | 7 | KNOW | 55/30/3/12 | L | live |
| nlp-practitioners | 6 | KNOW | 78/10/2/10 | M–L | live |
| recommendation-systems | 5 | KNOW | 62/20/8/10 | L | live |
| ml-foundations | 7–8 | KNOW | 70/18/2/10 | L | live |
| research-taste | 2 | **JUDGE** | 35/2/3/60 | L | live |
| high-tc-targets | 14 | KNOW | 50/14/8/28 | L–XL | live |
| engineering-leadership | 4 | **JUDGE** | 45/0/5/50 | L | live |
| agent-production | 9 | KNOW | 50/15/15/20 | L | live |

_\* The build-from-scratch "DO" is **read-the-implementation**, not write-it — counts as KNOW for true-fluency purposes (see §1 caveat)._

**Key outliers** (post split diverges from series): failure/incident posts (`stale-document-failure`, `cost-explosion-incident`, `cascade-failure`, `agent-failure-modes`…) → JUDGE 45-50%; design posts (`rag-system-design`, `agent-system-design`, `build-knowledge-base-search`) → BUILD 35-45%; from-scratch impls (`bm25-from-scratch`, `rlhf-from-scratch`, `mcp-build-server`) → DO 55-65%; PM/decision posts (`prd-for-ai`, `ai-or-not`, `nm-problem-mcp`, `reason-when-to-use`) → JUDGE 48-55%; tool teardowns (`headroom-context-compression`, `pixelrag-visual-document-rag`) → JUDGE 40%. ~38-42% of the corpus carries a meaningful (>25%) non-KNOW secondary.

---

## 4. Concepts (27 live + 6 Flows) + the 22 stubs

**Live Concepts modules** — KNOW unless noted: tokenizer, embeddings, attention, transformer(70/25/0/5), context, flashattn, sampling, chunking, rag-pipeline, agent, guardrails, multiagent, nextoken, tempgame, seq-parallel, training-signal, lora, llm-as-judge, agent-tools, cost-latency-concepts, observability-concepts, few-shot. **JUDGE-leaning:** eval-loop (35/10/0/55), **debug (20/5/0/75)**, scaling-laws (55/15/0/30), eval-design (45/5/0/50), chain-of-thought (55/5/0/40). **Flows (6):** rag, agent-loop, ctx, guardrail, transformer, ragarch — all KNOW 60-85 / JUDGE 10-35, animated explainers.

**The 22 stubs (all `stub`, all gym `moduleIds: []`):**

| gym | skeleton modules | lean |
|---|---|---|
| Cloud AI Services | aws-bedrock-agentcore, vertex-ai-gemini, azure-ai-foundry, **managed-vs-selfhosted (JUDGE 70)**, **enterprise-ai-cost-model (JUDGE 60)** | KNOW + 2 JUDGE |
| Vector Infrastructure | vector-db-index-mechanics, **pgvector-vs-managed (JUDGE 60)**, hybrid-search-design, metadata-filtering, **vector-migration-patterns (JUDGE 45)** | KNOW + 2 JUDGE |
| Observability & Tracing | agent-tracing, **prompt-regression-signals (JUDGE 50)**, **quality-drift (JUDGE 55)**, cost-attribution | KNOW + 2 JUDGE |
| Multimodal AI | vision-language-arch, multimodal-rag, ocr-pipeline-design, **resolution-token-cost (JUDGE 40)** | KNOW |
| AI Safety & Alignment | alignment-techniques, **red-teaming (JUDGE 40/DO 20)**, jailbreak-taxonomy, **safety-measurement (JUDGE 50)** | KNOW + JUDGE |

**Concepts verdict:** strongly KNOW; meaningful JUDGE minority in the diagnose/decide modules; **zero BUILD, ~no real DO**. The 22 stubs are ~70% KNOW — so **filling all 22 pushes the already-dominant KNOW share *up*** (see §6).

---

## 5. Systems (60) · Explore (24) · Playground (8) · Agents (16) · RAG (6) · AI Product (5) · Career · PrepLab · Fluency

_Condensed — full per-row splits live in the audit run; representative tags below._

**Systems (60) — KNOW ~58 / JUDGE ~25 / DO ~12 / BUILD ~8.** JUDGE-primary decision-sims: evals (J70, XL), strategy (J75), shouldai (J70), incidents (J70), abtesting (J65), debug_traces (J60), trapslab (J55), vecsim (J75), biencoder (J65), mcp (J50), agent-ctx-arch (J30/own-config). Config-sims carrying the lab's only BUILD/DO hints (≤25%): costlatency, finetune, indiascale, router, inference, mlcicd, compaction, ctxwindow, serving. Rest = KNOW explainers/calculators (kvcache, moe, specdecoding, quantization, flashattn, txarch, …). Fill: nearly all `live`.

**Explore (24) — KNOW ~72 / JUDGE ~25.** JUDGE selectors: llm_matrix (J60, thin), embmodels (J50), vectordb (J45), shadow (J55), latency (J45), semcache (J40), modelcard (J45). KNOW viz/reference: embeddings, attention3d, diffusion3d, cosine, tokenizer(s), promptpatterns, redteam… 7 `thin` reference tables (llm_matrix, ragpatterns, contexteng, llmops, apipricing, benchmarks, hardware).

**Playground (8) — JUDGE scored games:** reranker (J60), hallucinate (J70), bias (J70), tetris (J50). **KNOW sandboxes:** injection (K55), chunking (K65), prompt_lib (K90, L), streaming (K75).

**Agents (16) — KNOW 11 / JUDGE 5.** JUDGE: failures (J45), design (J55/B25, L), simulator (J35/D40), agentcfg (J70, thin). Rest KNOW explainers (react, tools, memory, memarch, multiagent, planning, frameworks, mcp, reliability, computeruse, longrunning, a2a-thin).

**RAG Lab (6) — ALL JUDGE (70-75%), Mass M, live:** missing-answer, ambiguous-query, conflicting-docs, multi-hop, three-hop-chain, prompt-injection. Shared 4-tier Junior→Staff scoring. **The lab's purest, best JUDGE surface.**

**AI Product (5):** prd (J65), aiornot (J75), stakeholder (**COMMS 70**), roadmap (**BUILD 45**, no score), checklist (**BUILD 45**).

**Career (6 modules / 13 gradeable):** sysdesign (J50/B20, L), negotiation+negotiate+benchmarks (JUDGE/COMMS), salary (DO-calc, S). **Take-home (XL)** holds 7 subs: Fix-the-Prompt (**DO 55**, S, live — the lab's single closest-to-real-DO artifact), Rank Outputs (J50), Design an Eval (J60); and 4 **BUILD** free-text rubric labs (RAG System Design, Eval Harness, Incident Response, Agent Cost Blowout) — all `thin`, **reveal an expert answer, no auto-grading**. This is the entirety of GSL's BUILD scaffold, and it's un-graded.

**PrepLab (597 Qs) — JUDGE-dominant.** Diagnostic MCQs ("most likely cause / root cause / why") read JUDGE; recall MCQs read KNOW. By category: agents 104 (J60), rag 95 (J60), llmops 60 (J65), finetuning 34 (K65), evaluation 34 (J60), foundations 28 (K85), safety 30 (J55), serving/inference/caching/streaming/context ~47 (K55/J45), sysdesign 14 (J55/B20), recommendations 12 (J60), reasoning/multimodal 18 (K70), product 9 (J45/COMMS35, thin), leadership/behavioral 18 (**COMMS 65**, thin). Modes: Judgment Exam (J60), Trainer (J50), Interview-Prep-Plan (**WAY 70**), Weakness Heatmap (ASSESS/WAY), Company Tracks (J50), Browse (KNOW 70).

**Fluency (8) — COMMS + JUDGE, no true DO.** Phrase Bank/Timed Drills/Mock Interview (COMMS), Flashcards (KNOW), Company Cases + Prompt Challenges (JUDGE MCQ), Prompt Engineering (KNOW gallery — **not DO**), Readiness Check (JUDGE/ASSESS). Mostly `thin`.

**Paths (6+) + Ask — WAY** (wayfinding; Ask is keyword search + 12 canned answers, no LLM, thin).

---

## 6. Findings + implications (what to actually do)

1. **The hole is DO, and it's near-total.** Quantified at ~8% but truly ~2-3% — there is **no surface where you write/run code or a free prompt under a correctness check.** The single closest artifact is one Career sub-challenge ("Fix the Prompt"). Per the Competence Model's ladder, the lab's huge JUDGE apparatus is standing on a missing rung. **DO is the highest-leverage build, full stop.**
2. **BUILD exists but is un-graded.** The only ownership scaffold (4 Career take-home labs) reveals an expert answer; nothing scores your build. Thin by fill, not just by count.
3. **KNOW and JUDGE are both over-supplied** (86% combined). More KNOW does not move the lab; it deepens the heavy end.
4. **⚠️ The Concepts decision (populate all 22) collides with this.** All 22 stubs are ~70% KNOW. Filling them adds ~22 × M ≈ 44 mass-weight, mostly KNOW → pushes KNOW from ~59% toward ~61%+ and **widens the gap to DO**. Honest recommendation: still build them (they're real gaps + good SEO/depth), **but** (a) prioritize the **8 JUDGE-leaning stubs** first (managed-vs-selfhosted, enterprise-ai-cost-model, pgvector-vs-managed, vector-migration-patterns, prompt-regression-signals, quality-drift, resolution-token-cost, red-teaming, safety-measurement), and (b) give each a **"now do it"** interactive beat (a config/decision the user makes) so they carry JUDGE/DO weight instead of being pure reading. That turns a KNOW-deepening chore into ladder-balancing.
5. **Cheap JUDGE→BUILD upgrade already half-built:** wire the 4 Career take-home rubric labs to actually grade (even rubric-checkbox self-scoring) — turns thin BUILD into live BUILD with no new content.

---

## 7. Method + caveats
- Built by 5 parallel **read-only** agents (GT · Concepts+Flows · Systems+Explore+Playground · Agents+RAG+AIPM+Career · PrepLab+Fluency+Paths). No files edited.
- The §1 rollup is an **estimate** (per-surface representative splits × count × avg mass-weight S1/M2/L4/XL8), not a per-row sum of 1,000+ items. Direction is robust; exact percentages ±a few points.
- **DO is overstated** wherever "read an implementation" was tagged DO; the honest hands-on-DO figure is ~2-3%.
- Frame labels use KNOW/DO/BUILD/JUDGE (the nav's words); maps to the Competence Model's recall+depth/fluency/ownership/judgment.
