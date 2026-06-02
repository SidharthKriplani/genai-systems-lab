# HISTORY.md — Sprint Log Archive (Sprints 1–37)

Moved from CLAUDE.md to reduce per-session token load. All content preserved verbatim.
For recent sprints (38–41+), see the Session build log section of CLAUDE.md.

---

**Resolved this session (sprint 37 — Share Score + Interview Story + Home trim):**
- **PrepLab Share Score button.** `shareScore(r)` function added to ExamMode in `src/PrepLab.jsx`. Copies a short shareable string to clipboard: score %, strongest/weakest topic, and link. "Share score" button added to exam done-screen header row with violet→green copied feedback. `shareCopied` state added. Brace diff: 0. Commit `97360b7`.
- **"Your Interview Story" on all 6 RAG Lab scenarios.** `INTERVIEW_STORIES` constant added to `src/App.jsx` (6 entries: missing_answer, ambiguous_query, conflicting_documents, multi_hop, three_hop_chain, prompt_injection — each with failure/rootCause/fix/production fields). `openStory` state added. Collapsible block rendered after productionNote chip and before feedback widget. Header: "Your interview story → ready to use". Expand: shows the full interview narrative + usage hint. Brace diff: 0. Commit `97360b7`.
- **Home daily tip removed.** Daily tip section (💡 amber card, below failure strip) removed — below-fold noise, no conversion value. Home is now: hero → market signal chip → PrepLab question card → door cards → failure strip → footer. Stat counts synced: 222+ → 225+ posts, 261 → 277 questions. Brace diff: 0. Commit `97360b7`.
- **Note: three stub GT posts (dpo-in-practice, llm-observability, instruction-tuning-datasets) were already fully expanded (17–21 blocks each) — no action needed.**

**Resolved this session (sprint 36 — Home feedback chip + Maps to Production + GT Series taxonomy):**
- **Home.jsx feedback chip.** Footer updated: "Share feedback" pill links to Tally.so form (tally.so/r/mYoQkl). Sibling links de-emphasized (zinc-600 instead of zinc-500). Brace diff: 0. Part of commit `2a8c0bc`.
- **Maps to Production callout on all 6 RAG Lab scenarios.** `productionNote` field added to each scenario object in `src/ragScenarios.js`. Rendered in `src/App.jsx` after the System Design Lesson block as a subdued zinc chip: gear icon + "In production: [tools/services]". Covers: missing_answer (Bedrock KB / Weaviate), ambiguous_query (OpenSearch / LangChain), conflicting_documents (Pinecone batch-sync / regulated domains), multi_hop (flat vector DBs on relationship queries), three_hop_chain (legal/compliance RAG: Ironclad, Harvey), prompt_injection (Notion/Confluence/Slack corpora, Bing Chat documented). Brace diffs: 0. Part of commit `2a8c0bc`.
- **GT Series taxonomy fix.** `SERIES_META` in `src/GroundTruth.jsx` updated: 4 existing series (rag-production, agent-engineering, eval-testing, llmops) expanded to include all real written posts (sprints 1–35). 2 new series added: `llm-fundamentals` (why-transformers-won, how-surprised-is-the-model, what-happens-during-pretraining, the-reversal-curse + 2 more) and `career-strategy` (type-a-vs-type-b-engineers, ds-to-ai-engineer, forward-deployed-engineer, three-layer-de-skill-stack + 2 more). Result: 16/17 series now have written posts and render series cards. Was: most series had 0 written posts, cards were hidden. Series architecture (UI cards, series navigation within PostDetail) was already complete — only taxonomy was missing. Brace diff: 0. Part of commit `2a8c0bc`. Scale: unchanged.

**Resolved this session (sprint 35 — Two-Stage Retrieval + CompanyTracks revamp):**
- **Two-stage retrieval (bi-encoder vs cross-encoder) shipped.** Highest-priority Tier 1 content gap from Microsoft RAG interview signal. 6-file change: (1) `src/groundTruthIndex.js` — new GT post entry `two-stage-retrieval-reranker` (category: rag, readMin: 9, labLink: systems, labModuleId: query-refinement, tags: RAG/bi-encoder/cross-encoder/reranker/two-stage retrieval). (2) `src/groundTruthPosts.js` — full post "Two-Stage Retrieval: Why a Reranker Exists" (12 blocks). (3) `src/systems/modules.jsx` — `TWO_STAGE_QUERIES` constant + QueryRefinementLab "Two-Stage" 4th tab. (4) `src/Systems.jsx` — `"query-refinement"` added to `RELATED_GT`. (5) `src/data/preplabQuestions.js` — 4 new RAG questions: reranker-1/2/3/4. Brace diffs: 0. Commit: `74160e7`. Scale: 56 Systems, 225 GT posts, 277 PrepLab questions.
- **CompanyTracks fully revamped.** `src/PrepLab.jsx` CompanyPrepMode rebuilt. Bug fixed (MCQ scoring), hooks order fixed, text question handling added, topic weight visualization, GT recommendations (`gtRecs`) added to all 4 archetypes. Brace diffs: 0. Included in commit `74160e7`.

**Resolved this session (sprint 34 — LangGraph + HITL):**
- **LangGraph + HITL shipped.** 5-file change: GT post `langgraph-reducers-hitl`, full post (12 blocks), `LangGraphModule` component (~260 lines, 4 tabs: Reducers/StateGraph/HITL Flow/When to Use), added to `Systems.jsx`, 4 PrepLab questions (langgraph-1/2/3/4). Brace diffs: 0. Commit: `cfd4520`. Scale: 56 Systems, 224 GT posts, 269 PrepLab questions.

**Resolved this session (sprint 33 — Graph RAG):**
- **Graph RAG shipped.** 5-file change: GT post `graph-rag-multi-hop`, full post (9 blocks), `GraphRAGModule` component (~210 lines, 4 tabs: The Failure/Knowledge Graph/Multi-Hop/When to Use), added to `Systems.jsx`, 4 PrepLab questions (graph-rag-1/2/3/4). Brace diffs: 0. Commit: `2a00754`. Scale: 55 Systems, 223 GT posts, 265 PrepLab questions.

**Resolved this session (sprint 32 — Cold-start Home rewrite):**
- **Cold-start belief gap fix shipped.** `src/Home.jsx` new-visitor section: market signal chip ("Agentic AI engineer roles: +280% YoY · 90K+ open roles"), subtext rewritten, PrepLab question card as primary cold-visitor CTA, door card copy updated (BUILD/PROVE/NAVIGATE). Brace diff: 0. Commit: `d8c2d11`.

**Resolved this session (sprint 31E — Interview Strategy full rebuild):**
- **Sprint E shipped.** `InterviewPrepMode` fully rebuilt as 4-step Interview Brief flow (JD paste → role/round/context → self-rate topics → gated Brief output). `generateBrief()`, `buildBrief()`, `copyBrief()` helpers. Brace diff: 0. Commit: `a5af787`.

**Resolved this session (sprint 31E-pre — TrainerMode Browse/List View):**
- **Browse/List View shipped.** `TrainerMode` gains `viewMode` state (drill/browse), `expandedId` accordion state. Pill toggle, scrollable browse list, accordion expand with MCQ options + trap callout, "Drill this topic →" chip. Brace diff: 0. Commit: `eb84135`.

**Resolved this session (sprint 31D — PrepLab Sprint D):**
- **Sprint D shipped.** Assess results screen fully rebuilt: score headline, per-topic bars sorted worst-first with gap pointer chips, free-user gate for >10q exams. `src/config/gating.js` created. `EXAM_SESSIONS_KEY` localStorage snapshot. `TOPIC_FORWARD_POINTERS` constant. Brace diff: 0. Commit: `22cd963`.
- **Difficulty reclassification shipped.** 261 questions reclassified → 47E/126M/87H. 4 duplicate IDs fixed.
- **PrepLab landing layout shipped.** Full-width PAL-style layout: 3-column mode card grid + Browse by Topic tile grid.

**Resolved this session (sprint 31B+C — PrepLab Sprints B + C):**
- **Sprint B shipped.** `PREP_QUESTIONS` extracted from `PrepLab.jsx` to `src/data/preplabQuestions.js`. PrepLab.jsx 5079 → 2446 lines. Commit: `73924a0`.
- **Sprint C shipped.** `trap` + `source` fields injected into 50 hardest questions. `src/shared.jsx` created with `CommonTrapCallout`. `RevealCard` updated. Commit: `38d5330`.

**Resolved this session (sprint 31A — PrepLab revamp Sprint A):**
- **Sprint A shipped.** `PREPLAB_SIDEBAR` 6→3 modes. Score badges. `QuestionCard` visual upgrade (border-l-4 difficulty accent). `MCQOptions` hover upgrade (violet). `ExamConfig` copy. `TrainerMode` 22 pills → 5 group tiles. Brace diff: 0. Commit: `43e4a92`.

**Resolved this session (post sprint 30 — field intelligence + architecture + cold-start analysis):**
- **No code shipped.** Field intelligence (5 sources logged). Architecture: modularisation rules formalised (DECISIONS.md Section 8). Cold-start belief gap analysis → DECISIONS.md Section 9, UPGRADES.md Hero Copy entry, IDEAS.md cold-start cluster. Commits `0681ee4`, `43cfb08`, `2e9d428`, `fad8a6c`, `39c7b86`.

**Resolved this session (sprint 30):**
- **4 items from NEXT.md completed.** RAG Lab done card prominence fix, Concepts Gym inline progress bar + Continue CTA, PrepLab keyboard shortcuts (1/2/3/4 + Enter), `EvalLoopModule` built and wired. Brace diffs: 0. Commit: `ada9b79`. Scale: 16 Concepts modules (was 15).

**Resolved this session (sprint 29):**
- **No code shipped.** Datamart-backed realism architecture evaluation. GAL conclusion: static JSON corpus Tier 1, Pyodide Tier 2, Marimo wrong tool. MD files updated.

**Resolved this session (sprint 28):**
- **Concepts Gym depth pass — 4 module upgrades.** TemperatureGame: Live Logit Shaper tab. RAGPipelineModule: What Breaks tab. FlashAttentionConcept: Tile Traversal tab. EmbeddingModule: Similarity Search tab. Commit: `7f0a88d`.

**Resolved this session (sprint 27):**
- **GAL visual identity — electric cyan rebrand.** `--color-violet-*` → electric cyan scale (#22D3EE). Near-void black backgrounds. LUNA glow system. One-accent sidebar. Commits `48e5de6`, `1b972b4`, `36a4360`, `9fce4d3`.

**Resolved this session (sprint 26):**
- **Concepts.jsx deep interactivity pass — 3 modules upgraded.** AttentionModule 3-tab QKV interactive. TokenizerModule BPE Algorithm tab. ContextWindowModule "Lost in the Middle" tab. Commit `86c943e`.

**Resolved this session (sprint 25):**
- **No code shipped.** Third-party assessment analysis. DECISIONS.md Section 6 added. MD files updated. Audit 40 run.

**Resolved this session (sprint 24):**
- **Full elevation token system — PAL-parity visual overhaul.** CSS vars `--bg`/`--surface`/`--surface-2`/`--border`/`--border-subtle`. `--color-zinc-900` remapped to fix 300+ instances. Commits `08f4512`, `dc26961`, `4192c3a`.

**Resolved this session (sprint 23):**
- **GAL visual redesign — 4 fronts.** CSS brand vars added. Sidebar collapse with chevrons. Home hierarchy (BUILD full-width). Lab shell consistency (RAG Lab sidebar parity, ragDone progress bar). Commit: `b5b4d2e`.

**Resolved this session (sprint 22):**
- **GAL structural overhaul.** Product renamed GAL. NAV_GROUPS: Build/Prove/Navigate/Knowledge/Legacy. `ProgressView` rewritten (3-lane). `FidelityBadge` component (Variant A ✓ / Variant B ~). Commit: `8578457`.

**Resolved this session (sprint 20):**
- **Home.jsx footer cleanup.** Beta banner, author line, disclaimer removed. Footer: sibling links only. Commit `9b84edb`, `98614f3`.
- **Audit 37 bug sweep.** `Playground.jsx:450` optional chain fix. Commit: `0532c36`.

**Resolved this session (sprint 19):**
- **Mobile optimization pass.** All framing blocks responsive across 6 files. Commit: `07b4852`.
- **Sibling repo read + MD file sync.** Both ml-systems-lab and PAL fully read. Learnings logged across IDEAS.md + UPGRADES.md. Commit: `fa0ebf7`.

**Resolved this session (sprint 18):**
- **Guiding text pass — complete across all 4 labs (49 modules/scenarios).** 3-beat standard applied. RAG Lab `setup_framing[]` + `synthesis_close` + `PreEvalCallout`. LLM Lab, Agent Lab, Eval Lab all updated. Commits: `3f06dcc`, `2ec2b19`, `720d7a1`, `eb30888`.

**Resolved this session (sprint 17):**
- **Concepts gym expansion.** GYMS 5 → 14 rooms (3 active, 11 coming-soon). Commit `a43fffe`.
- **Concepts ↔ Labs bidirectional connection.** `conceptsGym` state, sidebar chips (RAG/Agent/LLM). Commit `bf7cc6a`.

**Resolved this session (sprint 16):**
- **Dynamic homepage.** Returning vs new user detection from localStorage. `ReturningHomeView` with Today section, Jump Back In, Progress snapshot, Where to Next. Commit `6f18011`.

**Resolved this session (sprint 15):**
- **Concepts gym skeleton.** `GymSelectorView`, `GymRoomView`, `ConceptsApp` 3-view state machine. `MODULE_META` + `GYMS` constants. Commit `e19fb27`.

**Resolved this session (sprint 14):**
- Search upgrade: "Search →" label, 222+ count, `highlightText()`, zero-results pills. Commit `1ff9eaf`.
- Concepts framing text pass (15/15) complete. Commits `1f649a2`, `4539d5e`, `6d5083b`.

**Resolved this session (sprint 13):**
- Consultation.jsx audit — gaps identified, fixed in sprint 14.

**Resolved this session (sprint 12):**
- `WeaknessHeatmapMode` added. `recordHistory()` helper. `GateModal` unlock animation. Concepts Gym `MASTERY_KEY` + `GymPanel`. Commit: `820cb2d`.

**Resolved this session (sprint 11):**
- TYU fix (preplabInitialMode). Hero copy rewrite. `InterviewPrepMode` replaces `JDPrepMode`. Commits `327a745`, `4533e86`.

**Resolved this session (sprint 10):**
- `Home.jsx` simplification: 1083 → ~367 lines. Cut concept graph, learning paths, module map, social proof, email capture. Commit `303597c`.

**Resolved this session (sprint 9):**
- Audit 32 + 33: 15 mobile UX findings resolved. mobileSidebarOpen pattern applied to PrepLab + Explore. Touch target pass across GT, Home, Explore, Agents, Systems, Concepts.

**Resolved this session (sprint 8):**
- RAG Lab mobile (horizontal scroll pill strip). Agent Lab + Systems Lab mobile (mobileSidebarOpen). `index.css` contrast media query (zinc palette +1 stop brighter on mobile).

**Resolved this session (sprint 7):**
- Tier A: simulator + design done screens → PrepLab forward pointer cards. serving failure → full scenario card. decoding → reactive failure callout.
- Tier B: agentcfg AGENT_FAILURE_MATRIX expanded. MoEExpertSimulator added. LangSmith "Diagnose Traces" tab.
- Tier C: deploy/buildthis/abtesting-ai cut. Quantization slimmed.

**Resolved this session (sprint 6):**
- Hero copy upgraded. Module endings (RAG Lab forward pointer, Concepts ✓ done cards, Systems PrepLab CTA). `gated: true` on 163 hard questions. Audit 28. Commit: `55998de`.

**Resolved this session (sprint 5):**
- PrepLab text grading → self-assess. LLM Lab 39→9 modules. PARKED.md created. ServingInfra rebuilt. AgentConfigLab 5 failure scenarios. ModelMergeExplorer + MultimodalGuide added. FlashAttentionConcept + StreamingLab added. DECISIONS.md Section 4.

**Resolved this session (sprint 4):**
- Concepts sidebar layout. 6 GT posts. 3 Systems modules. 14 PrepLab questions. Explore DESIGN/BUILD/OPS groups. Evals Lab "Build Your Eval" wizard.

**Resolved previous sessions (sprints 1–3):**
- Quiz CTA, PrepLab readMore deep-links, related[] on 136 GT posts, production-mlops filter, sitemap/RSS regenerated, question count 190+→231, Cosine Similarity + EvalMetrics + Long Context + Model Architecture + Hardware Reference + Tokenizer Comparison + Prompt Injection Defense + Vector DB Engineering + Agent Memory modules built, GT posts written (Type A/B, Pretraining, RAG Lies, Eval Crisis, Reversal Curse, Agent Memory, Entropy, Why Transformers Won, Prompt Is Code, Three-Layer DE), mobile bottom nav bar shipped.
