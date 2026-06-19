# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: sprint 76 (June 2026) — Scale: 597 PrepLab questions, 310 GT index entries, 6 PrepLab modes, 13 GT series, 6 challenge area landing pages*

---

## Sprint 69 — ✅ COMPLETE (`785c494`)

**Objective:** Difficulty tier expansion + curriculum quality overhaul (beginner → daunting).

1. ~~**GT sidebar cleanup**~~ — removed 10 advanced series from GT sidebar in App.jsx. Kept: Agent Engineering, RAG in Production, The Training Stack, LLMOps in Production, How I'd Build X, NLP Origins, Build From Scratch, LLM Internals, Retrieval Depth, Evaluation Depth, ML Foundations.
2. ~~**Difficulty tier schema**~~ — 5 new difficulty values added: `beginner`, `beginner-intermediate`, `intermediate`, `staff`, `daunting`. New `type: "daunting"` with `answers: [{label, content, correct}]` + `synthesis_note`.
3. ~~**DauntingQuestion UI**~~ — toggle-expandable answer panels in BrowseMode, multiple correct answers with overlap. Full `openAnswers` state, violet theme.
4. ~~**`foundations` topic**~~ — added to `TOPIC_COLORS`, `TOPIC_LABELS`, and `engineering` focus in `drawQuestions`.
5. ~~**BrowseMode filter chips**~~ — expanded from `[easy, medium, hard]` to all 8 difficulty values. `beginner-intermediate` displays as `B-I`.
6. ~~**40 new questions**~~ — 8 beginner + 8 B-I Foundations, 8 beginner + 8 B-I RAG, 3 Staff Foundations, 2 Staff RAG, 2 Daunting.

**New scale:** 528 PrepLab questions (was 488).

---

## Sprint 70 — ✅ COMPLETE (`11e8d3f`)

**Objective:** First Principles learning path + bidirectional PrepLab linking.

1. ~~**First Principles Path**~~ — added to top of `PATHS` array in `LearningPaths.jsx`. 14 GT steps from ngrams-to-neural → react-pattern + PrepLab CTA. Violet `#8b5cf6` color theme.
2. ~~**Sidebar entry**~~ — "First Principles Path" added as first subitem under Ground Truth in App.jsx. `note: "start here"`. Routes to `paths` tab.
3. ~~**Bidirectional linking**~~ — `GT_QUESTION_MAP` built at module load from PREP_QUESTIONS readMore.postId fields. `LinkedQuestions` component shows per-step practice questions (expandable, difficulty chips, Try → button).
4. ~~**Coverage verified**~~ — 12 of 14 GT steps have linked questions. `ngrams-to-neural` has 1 (found-beg-1). `react-pattern` has 0 (no questions link to it yet — future work).

---

## Sprint 71 — ✅ COMPLETE (`ff62da0`)

**Objective:** Complete the First Principles Path question coverage — intermediate tier + react-pattern gap.

1. ~~**8 intermediate Foundations questions**~~ — `found-int-1` through `found-int-8`. Encoder vs decoder, LoRA rank, multi-head attention, perplexity limits, catastrophic forgetting, fine-tune vs prompt decision, KV cache memory cost, MHA vs GQA architecture choice.
2. ~~**4 intermediate RAG questions**~~ — `rag-int-1` through `rag-int-4`. Hybrid search failure analysis, chunk size framework, reranker latency tradeoff, RAG vs fine-tuning decision.
3. ~~**3 react-pattern questions**~~ — `react-1` (beginner), `react-2` (B-I), `react-3` (intermediate). Closes the last empty step in First Principles Path.
4. ~~**2 broken readMore postIds fixed**~~ — `found-beg-6` and `found-bi-5` had `postId: "long-context-window"` → corrected to `context-window-guide`.

**New scale:** 543 PrepLab questions (was 528).

---

## Sprint 72 — ✅ COMPLETE (`d57d929`)

**Objective:** First Principles path UX — B1–B6 complete.

1. ~~**B1 pathContext threading**~~ — `goToStep(step, idx)` passes full pathContext through App.jsx → GroundTruth.jsx → PostDetail.
2. ~~**B2 Path context bar**~~ — colored banner in GT reader: abbr badge, path name, step N of M, prev/next GT step nav, ↩ Path.
3. ~~**B3 3-mode reader**~~ — Skim / Read / Dense replacing old simpleMode boolean.
4. ~~**B4 Callout openers**~~ — `{t:"callout"}` first block on all 14 First Principles path posts.
5. ~~**B5 Path-aware footer**~~ — progress bar + "Next: [label] →" CTA + "View path summary →" on last step.
6. ~~**B6 Mark done**~~ — toggles `gsl-path-progress[pathId]` localStorage, green indicator in both context bar and footer.
7. ~~**Emoji removal**~~ — all 8 PATHS + TYPE_CONFIG replaced with monospace abbr badges.

---

## Sprint 73 — ✅ COMPLETE (`b72aaaa`, `ee7b242`)

**Objective:** Batch A — agent production gap fill (MCP, tool use, observability, testing).

1. ~~**4 GT posts (agent-production series)**~~ — `mcp-explained`, `agent-tool-use-production`, `agent-observability`, `agent-testing-strategies`.
2. ~~**26 PrepLab questions**~~ — mcp-1–6, toolprod-1–6, obs-1–6, agtest-1–8.
3. ~~**AgentsHub +4 posts**~~ — all 4 Batch A posts surfaced on AgentsHub.
4. ~~**ProductionHub +1**~~ — agent-observability added.
5. ~~**EvaluationHub +1**~~ — agent-testing-strategies added.
6. ~~**Sidebar "Agents in Production" link**~~ — added to GT sidebar series section.

**New scale:** 569 PrepLab questions (543+26), 305 GT index entries (301+4), 13 GT series.

---

## Sprint 74 — ✅ COMPLETE (`82a1aae`)

**Objective:** Batch B — agent backend infra gap fill (backend APIs, async task queues, K8s).

1. ~~**3 GT posts (agent-production series)**~~ — `agent-backend-apis` (async endpoints, SSE, request deduplication, readiness probes, rate limiting), `async-task-queues-agents` (task state machine, exactly-once execution, Celery chord fan-out, DLQ, result TTL), `kubernetes-ai-workloads` (GPU scheduling, model loading patterns, KEDA vs HPA, PDB, probe config).
2. ~~**17 PrepLab questions**~~ — apiback-1–6, taskqueue-1–6, k8sagent-1–5.
3. ~~**ProductionHub +3 posts**~~ — all 3 Batch B posts added.
4. ~~**SERIES_META updated**~~ — agent-production postIds extended to 7.

**New scale:** 586 PrepLab questions (was 569), 308 GT index entries (was 305).

---

## Sprint 75 — ✅ COMPLETE (`fb960b4`)

**Objective:** Batch C — agent security + governance gap fill.

1. ~~**2 GT posts (agent-production series)**~~ — `agent-security` (indirect/direct/tool-result injection, OWASP LLM01/07/08/02, least privilege classification, guardrails, supply chain), `agent-governance` (data lineage, model version pinning + stage promotion, prompt versioning as code, rollback triggers, HITL approval gates).
2. ~~**11 PrepLab questions**~~ — sec-1–6, govern-1–5.
3. ~~**Hub updates**~~ — AgentsHub +agent-security, ProductionHub +agent-governance.
4. ~~**SERIES_META updated**~~ — agent-production postIds extended to 9. Batches A+B+C complete.

**New scale:** 597 PrepLab questions (was 586), 310 GT index entries (was 308).

---

## Sprint 76 — ✅ COMPLETE (`0e5682e`)

**Objective:** Senior AI Engineer learning path.

1. ~~**Senior AI Engineer: Production Track path**~~ — 13 steps in LearningPaths.jsx. Cyan `#06b6d4`. Covers MCP, tool use, agent architecture, observability, testing, backend APIs, async queues, K8s, security, governance, guardrails, LLMOps. Full Batches A+B+C coverage.
2. ~~**Sidebar entry**~~ — "Senior AI Engineer Track" added as second path subitem under Ground Truth in App.jsx. Note: "production".

**Scale:** unchanged (597q/310GT — no new content).

---

## Sprint 77 — ✅ COMPLETE (competitive audit + MD sync)

**Objective:** Competitive intelligence research + log all findings to MD files.

1. ~~**Competitive audit completed**~~ — full research on Dataford, Hello Interview, DataLemur, Exponent, Interview Query, DeepLearning.AI, fast.ai, HF, W&B, LangChain Academy, cheating tool cohort, distribution mechanics (NeetCode, ByteByteGo).
2. ~~**COMPETITORS.md created**~~ — full competitive intelligence report. Tier 1/2/3 threat breakdown, market data, proven mechanics, GSL differentiators vs gaps, 90-day bridge plan.
3. ~~**IDEAS.md updated**~~ — added "Distribution & Growth" section (P0 SSR, P0 LinkedIn cadence, P1 certificates, P1 onboarding capture, P1 Discord, P2 newsletter, P2 canonical artifact).
4. ~~**DECISIONS.md §13 added**~~ — competitive positioning decisions: lane owned, four proven win mechanics, moat to defend, anti-patterns to avoid, pricing informed by research.
5. ~~**Sidebar labels shortened**~~ — "1st Principles" / "Senior AIE" (committed previous session).

---

## Sprint 78 — Next up

### P0 — Distribution (no features until this is started)

- **SSR/pre-render GT posts:** `vite-ssg` or Node pre-render script. Each GT post at `/gt/[postId]` becomes a static HTML page with correct meta. Full spec in COMPETITORS.md §90-day-bridge-plan.
- **LinkedIn cadence:** 3 posts/week, educational carousel format from GT posts. First post: "Why RAG systems fail in production (and how to fix them)." Draw from existing GT content.

### P1 — Completion certificates
- Shareable PNG for First Principles Path, Senior AIE Track, each lab completion. LinkedIn one-click share. Spec in IDEAS.md.

### P1 — Onboarding capture
- 3-question modal at first sign-in. "Interview scheduled?" routing. PostHog events. Spec in IDEAS.md.

### Blocked
- Mastery Room commit (staged in sprint 60 — needs Supabase SQL run first).
- Trap field quality pass (4 clusters: rag, agents, eval, llmops).
- Agent Lab synthesis gap — top 5 modules need PrepLab forward pointer.

---

## Sprint 68 — ✅ COMPLETE (`6f54650`)

**Objective:** LinkedIn soft launch infra — shareable deep links per challenge area with correct social OG previews + 5 LangChain questions.

1. ~~**6 static landing pages**~~ — `public/agents.html`, `retrieval.html`, `evaluation.html`, `production.html`, `foundations.html`, `preplab.html`. Each with area-specific og:title, og:description, colour, stats, CTA back into SPA.
2. ~~**vercel.json updated**~~ — 6 new rewrites + catch-all regex updated to exclude new HTML files.
3. ~~**index.html OG updated**~~ — "222+ posts" → "301 posts", "140+ modules" → accurate copy.
4. ~~**5 LangChain/LangGraph PrepLab questions**~~ — `lchain-1` through `lchain-5`. LCEL vs LangGraph decision, loop failure root cause, buffer memory cost explosion, tool count latency, faithfulness evaluation.

**UTM links for LinkedIn posts:**
- Agents: `https://genai-systems-lab-ivory.vercel.app/agents?utm_source=linkedin&utm_campaign=agents`
- Retrieval: `https://genai-systems-lab-ivory.vercel.app/retrieval?utm_source=linkedin&utm_campaign=retrieval`
- Evaluation: `https://genai-systems-lab-ivory.vercel.app/evaluation?utm_source=linkedin&utm_campaign=eval`
- Production: `https://genai-systems-lab-ivory.vercel.app/production?utm_source=linkedin&utm_campaign=prod`
- Foundations: `https://genai-systems-lab-ivory.vercel.app/foundations?utm_source=linkedin&utm_campaign=foundations`
- PrepLab: `https://genai-systems-lab-ivory.vercel.app/preplab?utm_source=linkedin&utm_campaign=preplab`

**PostHog required:** Set `VITE_POSTHOG_KEY` in Vercel env vars to track UTM → sign-up funnel. Without it, analytics are blind.

---

## Sprint 67 polish — ✅ COMPLETE (`e7fdb0a`, `83597fa`)

1. ~~**BrowseMode mobile layout**~~ — topic filter horizontal scroll, difficulty own row, responsive padding, MCQ overflow fix.
2. ~~**Sidebar challenge area desc line**~~ — muted `4 Concepts · N GT posts · Nq` hint below lab link when expanded.

---

## Sprint 67 — ✅ COMPLETE

**Objective:** Bug audit + renderer fix + Browse mode.

1. ~~**6 bug class audit + fixes in groundTruthPosts.js**~~ — DONE. `bee927a`, `3ccd359`, `7fe66bc`, `0cd366d`, `3ea40b3`.
2. ~~**normalizeBlock() in GroundTruth.jsx**~~ — DONE. All sprint 61–66 posts now render correctly. `3ea40b3`.
3. ~~**Browse All PrepLab mode**~~ — DONE. Topic+difficulty filters, expandable answer cards, mark-reviewed. `802cf17`.

**Process fix added:** Run `node -e "require('./validate.cjs')"` after every groundTruthPosts.js write.

---

## IMMEDIATE: Mastery Room needs 2 manual steps before it goes live

1. **Run SQL** — paste `supabase_study_tables.sql` in Supabase SQL Editor (creates 3 tables with RLS)
2. **Commit from terminal** — `git commit -m "feat: private mastery room"` + `git push` (sandbox can't remove HEAD.lock on macOS FUSE mount)

See MASTERY_ROOM.md for full details.

---

## Theme: BLOCKED on private test. No new feature builds until 3–5 person private test is complete and feedback reviewed.

**Current state:** Product is ready for guided private test. PRIVATE_TEST.md contains full tester profile, instructions, observer questions, and success criteria.

**Next decision gate:** Run 3–5 person private test → evaluate against success criteria → either (A) controlled public launch prep or (B) one more coherence sprint. Nothing else gets built until this decision is made.

### Do NOT build before private test feedback:
- Daily Judgment mechanic
- Stripe / real pricing
- SystemsApp completion states (P2 — not blocking)
- New content or labs
- Share cards / social mechanics
- Distribution push (HN, LinkedIn, Reddit)

**Sprint 56 UX correction pass — COMPLETE** ✅ (see CLAUDE.md sprint 56 log)

**Sprint 57 — PM audit complete. Build order:**

### P0 — ✅ DONE (sprint 58, commit `7b249ee`)

1. ~~**JTBD decision**~~ — DECISIONS.md §11 logged. Interview prep is primary frame.
2. ~~**Ungate RAG Lab Scenario 1 for guests**~~ — DONE. GUEST_ALLOWED_TABS includes "lab". Scenarios 2–6 locked via guard + UI.
3. ~~**First-time user path**~~ — DONE. `isFirstTime` banner on Progress page → "Open RAG Lab Scenario 1 →".
4. ~~**Synthesis card specificity**~~ — DONE. Names `failure_mode_taught`, PrepLab CTA topic-filtered, guest sign-in CTA after Scenario 1.
5. ~~**Navigation cleanup**~~ — DONE. "CHALLENGE AREAS" label, group labels removed, Plans moved to bottom.
6. ~~**Plans copy**~~ — DONE. "Community code free during beta" removed. "Invite-only during beta" framing.

**Real paid tier** — pricing decision still required. User action, not a code task. Do before distribution.

### Sprint 58 P1 — ✅ DONE (commit `80ca550`)

7. ~~**Mobile scenario strip guest lock**~~ — DONE. `mobileGuestLocked` + disabled + 🔒 on mobile pill buttons.
8. ~~**Plans "community code" copy in step 03**~~ — DONE. "community code" → "your access code".

---

## Sprint 59 — ✅ COMPLETE (commit `0d4f447`)

**Objective:** MVP coherence continued — verified real gaps vs. stale audit data.

### Key finding: stale PM audit data corrected

The PM audit (sprint 57) stated "8 evaluation GT posts." Code verification revealed **13 fully-written posts** (25–32 blocks each), added in sprint 51. The "write 4 new posts" plan in the audit was solving a problem that no longer existed.

Real gaps identified and fixed:
1. ~~EvaluationHub.jsx showed only 4 of 13 evaluation posts~~ — FIXED `0d4f447`. Hub now shows 8 posts (2×4 grid), "All 13 evaluation posts →" link updated.
2. ~~Agent Lab done-state was generic~~ — FIXED `0d4f447`. `AgentDesignChallenge` now shows `{challenge.title} — design scored` + production context + topic-filtered PrepLab CTA (`topic: "agents"`).

### Synthesis audit — final status

| Lab | Quality | PrepLab routing | Status |
|---|---|---|---|
| RAG Lab | Strong — names `failure_mode_taught` | ✅ topic-filtered | Done |
| FM Lab | Good — `synthesisClose` + `preplabQ` rendered | ✅ specific question | Done |
| Prompt Lab | Good — `synthesis_close` + forward pointer | ⚠️ generic (personalized queue handles it) | Acceptable |
| Agent Lab | Now good — challenge title + production note | ✅ topic-filtered (`agents`) | Fixed sprint 59 |
| Eval Lab (SystemsApp) | No WhatNextCard in modules.jsx | ❌ none | P2 structural — too big for coherence sprint |
| LLM Lab (SystemsApp) | No WhatNextCard in modules.jsx | ❌ none | P2 structural — too big for coherence sprint |

### P2 — Deferred (not this sprint)

- SystemsApp (Eval/LLM Lab) completion states — structural M–L effort, each of ~57 modules needs a done-state. Requires dedicated sprint.
- Daily Judgment mechanic
- Hub room decision (needs PostHog data first)
- Concepts gym depth audit (user direction needed)
- Distribution push

### Do NOT build without explicit decision
- Stripe / real pricing
- Share cards
- Brand rename
- New labs or challenge areas

---

## Private user test checklist

**Ready for a 3–5 person guided private test.** Use this checklist.

### Who to invite
Mid-level software engineers (3–6 years) who are either actively interviewing for AI/ML engineering roles or plan to within 6 months. They should know basic ML/Python but don't need deep AI engineering experience. Do not invite people who already know the product well.

### Starting path
Send this link: `genai-systems-lab-ivory.vercel.app` — no instructions, no explanation. Let them land cold.

If they ask "what should I do?", only say: "try whatever looks interesting."

### First task to observe
Can they reach **RAG Lab Scenario 1** and complete it without being told to? This is the product's aha moment. If testers can't find it or don't finish it, the first-session path still needs work.

### Questions to ask after the session (5 minutes)

1. "What did you think this product was in the first 30 seconds?"
2. "What did you do first? Did you know what to do?"
3. "Did you complete a scenario in the RAG Lab? If yes — what did you take away from it?"
4. "Did the ending of the scenario feel like a learning moment, or just a task completed?"
5. "Would you come back to this? Why or why not?"
6. "What felt confusing or broken?"

### Signals that mean ready for broader distribution

- ≥3 of 5 testers reach and complete RAG Lab Scenario 1 without prompting
- ≥3 of 5 testers can articulate one specific failure mode they learned about
- ≥2 of 5 testers click the PrepLab CTA from the synthesis card
- ≥2 of 5 testers sign in (or would sign in if asked)
- Navigation confusion is specific ("I didn't see the Agents hub") not structural ("I didn't know what this product was")

### Signals that mean one more coherence sprint needed

- Majority can't explain what the product is after 5 minutes
- Majority don't find the RAG Lab without prompting
- Synthesis card doesn't land — testers say "I completed something but I'm not sure what I learned"
- Multiple testers hit broken states (React errors, empty pages, nav dead ends)

### P2 — Post-launch

9. **Hub room decision** — curated preview vs. full filtered room. Needs PostHog data on which areas get most engagement. Do not build until data exists.
10. **Concepts gym depth audit** — which gyms are hollow? User direction required.
11. **Brand clarity** — "GenAI Systems Lab" is descriptive but forgettable. Revisit after JTBD is confirmed.

**⚠️ USER ACTION REQUIRED:** PostHog WAU check + pricing decision (P0 item 4). Both are required before distribution.

Sprint 49: full challenge-layer redesign (R1–R9). Sprint 50: readiness layer, guided paths, staffLayer 30→41. See CLAUDE.md sprint log.

---

## Do this (in order) — Sprint 49 Redesign Batches

**~~R1 — Nav collapse~~** `S` DONE `3b0b870`
- `src/config/nav.js`: collapse to 8-item challenge-layer nav (Home, Retrieval, Evaluation, Agents, Production, Foundations, PrepLab, Ground Truth)
- `src/App.jsx`: add routing for `#retrieval`, `#evaluation`, `#agents-hub`, `#production`, `#foundations` — all old routes stay functional
- Brace check + commit: `feat: R1 — challenge-layer nav, 8 items`

**~~R2 — Home page rewrite~~** `M` DONE `66fa6b0`
- `src/Home.jsx`: full rewrite
- Cold visitor: promise hero ("The only place that trains production AI judgment") + market signal (agentic AI +280%, $190K avg) + 5 challenge area cards + single PrepLab question as primary CTA
- Returning visitor: compact progress snapshot + continue CTA + daily question + challenge area progress bars
- Brace check + commit: `feat: R2 — home rewrite, cold/returning visitor states`

**Execution model:** R1 and R2 alone (one each). R3 alone as template. R4–R7 together in one session (same pattern, fill-in-the-blank). R8, R9, R10 alone. = 7 sessions total.

**~~R3 — Retrieval hub page~~** `M` DONE `35fd2c7`
- New `src/Retrieval.jsx`
- Structure: challenge intro ("Why does my AI retrieve garbage?") → RAG Lab entry card → 3 concept cards → 3-4 GT posts → 3 inline PrepLab questions (topic: rag) → progress snapshot
- Wire in App.jsx routing (`#retrieval`)
- Commit: `feat: R3 — Retrieval hub page`

**~~R4–R7 — Evaluation, Agents, Production, Foundations hub pages~~** `M` DONE `e7a68bc`
- New `src/EvaluationHub.jsx`
- Same structure as R3, wired to Eval Lab, evaluation concepts, evaluation GT posts, evaluation PrepLab cluster
- Commit: `feat: R4 — Evaluation hub page`

**R5 — Agents hub page** `M`
- New `src/AgentsHub.jsx` (avoid name collision with existing `Agents.jsx`)
- Wired to Agent Lab, agent concepts, agents GT posts, agents PrepLab cluster
- Commit: `feat: R5 — Agents hub page`

**R6 — Production hub page** `M`
- New `src/ProductionHub.jsx`
- Wired to LLM Lab, production/llmops concepts, llmops GT posts, llmops PrepLab cluster
- Commit: `feat: R6 — Production hub page`

**R7 — Foundations hub page** `M`
- New `src/FoundationsHub.jsx`
- Two lab entries: FM Lab + Prompt Lab (sub-entries, not separate pages)
- Wired to foundation concepts, foundation GT posts, finetuning+safety PrepLab clusters
- Commit: `feat: R7 — Foundations hub page`

**~~R8 — PrepLab reframe~~** `S` DONE `4f0becc`
- `src/PrepLab.jsx`: copy throughout → "judgment" framing ("Test your production AI judgment" not "Assess yourself")
- Sidebar cluster labels aligned to challenge area names (Retrieval / Evaluation / Agents / Production / Foundations)
- Commit: `feat: R8 — PrepLab judgment reframe, challenge-aligned clusters`

**~~R9 — GT challenge area tagging~~** `M` DONE `40ba9c6` — retrieval:19 agents:28 eval:8 prod:44 foundations:81 general:46
- `src/groundTruthIndex.js`: add `challengeArea` field to all 226 posts
- Values: `"retrieval"` | `"evaluation"` | `"agents"` | `"production"` | `"foundations"` | `"general"`
- GT cards render challenge area chip
- Hub pages pull posts by `challengeArea` from index
- Commit: `feat: R9 — GT challenge area tagging, all 226 posts`

**~~R10 — Full MD sync + sprint close~~** `S` DONE — sprint 49 complete
- Challenge area accent colors (Retrieval: cyan, Evaluation: amber, Agents: violet, Production: green, Foundations: blue)
- Mobile layout pass on all 5 hub pages
- Consistent module header pattern across all labs
- Full MD sync: CLAUDE.md sprint log, NEXT.md, LINEAGE.md, REDESIGN.md status update
- Commit: `feat: R10 — visual polish` + `chore: MD sync sprint 49`

---

## Pending (valid but lower priority)

### Content depth + production grounding
- ~~**"Your Interview Story" on RAG Lab done cards**~~ — DONE sprint 37 (`97360b7`).
- ~~**"Your Interview Story" on Agent Lab done screens**~~ — DONE batch-2 (`2c9e282`).
- ~~**"Maps to Production" on RAG Lab scenarios**~~ — DONE sprint 36 (`2a8c0bc`).
- ~~**"Maps to Production" on Agent Lab + LLM Lab**~~ — DONE batch-4 (`b253405`). All 8 Agent Lab failure matrix entries + 5 LLM Lab serving failures.
- ~~**RAG Lab static corpus — data realism v1**~~ — DONE sprint 38 (`9a985b5`).
- ~~**Thin GT posts expansion**~~ — `dpo-in-practice`, `llm-observability`, `instruction-tuning-datasets` were already fully expanded (17–21 blocks each). Verified and closed.

### Architecture / polish
- **React.lazy() code splitting** — systematic change. DECISIONS.md-worthy scope.
- **Pyodide execution for Eval Lab** — Tier 2, after static corpus engagement signal.
- **Visual polish backlog** — consistent module headers, Explore module cards.
- **Modularisation pass** — `src/config/nav.js` (unblocked by Sprint D, `gating.js` done).
- **Interview Experiences section** — editorial-first 20–30 entries seeded from field intelligence log.

### Concepts gym depth
- ~~**Concepts module: "Sequential vs Parallel"**~~ — DONE batch-10 (`caaadb5`).
- ~~**Concepts module: "The Training Signal"**~~ — DONE batch-10 (`caaadb5`).
- ~~**Concepts module: "Scaling Laws"**~~ — DONE batch-6 (`fd73d26`).
- ~~**Concepts module: "LoRA / QLoRA"**~~ — DONE batch-9 (`0915cb8`).
- ~~**EvalLoopModule Beat 2 + Beat 3**~~ — DONE batch-5 (`04c7a51`).

### Sprint 41 completions (batches A–B)
- ~~**7 new Concepts modules**~~ — DONE batch-A (`ed54c5a`). LLMAsJudge, EvalDesign, AgentToolDesign, CostLatency, Observability, FewShot, ChainOfThought.
- ~~**4 new active gyms**~~ — DONE batch-A. Evaluation, Production, Foundation Models, Prompt Engineering now active (not comingSoon).
- ~~**Prompt Engineering Lab (5th BUILD lab)**~~ — DONE batch-B (`b93535e`). 6 scenarios, PromptLab.jsx 560 lines, wired in App.jsx + nav.js, 4 PrepLab questions.
- ~~**Foundation Models Lab (6th BUILD lab)**~~ — DONE sprint 42 (`6cb2194`). 6 scenarios, FoundationModelsLab.jsx, wired in App.jsx + nav.js, 4 PrepLab questions.
- ~~**Paper theme system**~~ — DONE sprint 42 (`2884aa1`). Warm dark default + light mode + CSS vars + sun/moon toggle.
- ~~**Theme audit phase 2**~~ — DONE sprint 42 (`c859fe6`). All hardcoded #22D3EE → CSS vars across 5 files.
- ~~**Interview Signal PrepLab mode**~~ — DONE sprint 42 (`f33a123`). 22 experiences, filters, topic chart.
- ~~**Scenario-type questions**~~ — DONE sprint 42 (`246f73f`). ScenarioPlayer + 3 scenarios (RAG corpus, agent loop, eval rubric). 304 total PrepLab questions.

### Sprint 40 completions (batches A–I)
- ~~**`src/config/nav.js`**~~ — DONE batch-A (`992cfc4`). ALL_TABS + GROUP_COLORS extracted.
- ~~**ForwardPointerCard + WhatNextCard + ProductionNoteChip shared components**~~ — DONE batch-B (`2c57ff2`).
- ~~**Streak + 4-week heatmap in ReturningHomeView**~~ — DONE batch-C (`0d7371f`).
- ~~**FeedbackBar PostHog component**~~ — DONE batch-D (`0e5b3ab`). GT post end + PrepLab session end + Systems module footer.
- ~~**PrepLab multi-select MCQ (`type: "multi"`)**~~ — DONE batch-E (`9c7ba18`).
- ~~**PrepLab Common Trap expansion**~~ — DONE batch-F (`204138f`). 182 trap fields total across all medium + hard questions.
- ~~**Agent Context Architecture Systems module**~~ — DONE batch-G (`144618f`). 57th Systems module + 4 PrepLab questions.
- ~~**GT posts: Prompt Regression Testing + A/B Testing for AI**~~ — Already existed in groundTruthPosts.js. Verified.
- ~~**GT Quiz depth**~~ — DONE batch-I (`2fe2fe0`). generateQuiz expanded to 5-7 questions from 5 block types.

### Sprint 47 build queue (cross-lab intelligence — in priority order)

1. ~~**Bookmarks**~~ — DONE sprint 47 (`97c2057`). `gsl-bookmarks`, bookmark icon on GT cards, 🔖 Saved filter.
2. ~~**91-day heatmap**~~ — DONE sprint 47 (`97c2057`). Upgraded from 28→91 cells.
3. ~~**Spaced repetition**~~ — DONE sprint 47 (`97c2057`). `gsl-preplab-spaced`, SRS intervals, Review Due mode in PrepLab sidebar.
4. ~~**Sparse heatmap guard**~~ — DONE sprint 47 (`2bcbcec`).
5. ~~**"Do we even need it?" adversarial scenarios**~~ — DONE sprint 47 (`2bcbcec`). 6 questions (adversarial-1 through -6): RAG vs context window, vector DB vs SQL, agent vs webhook, rules vs ML routing, fine-tune vs prompt, rules vs RAG for compliance.
6. ~~**Timed exam lock (Combinator)**~~ — DONE sprint 48 (`f7af1f1`). Mock Exam Mode toggle, forward-only, red timer, MOCK badge.
7. ~~**Staff Layer**~~ — DONE sprint 48 (`f7af1f1`). 3-tier reveal, access-gated, 10 questions seeded. Expand staffLayer to more hard questions each sprint.
8. **Spot the Flaw** `M` — adversarial format on existing failure modes. See IDEAS.md.
9. ~~**CROSS_LAB.md**~~ — DONE sprint 48 (`a44fe49`). Lab boundaries + cross-pollination patterns documented.
10. **staffLayer further expansion** — 30 seeded, ~24 hard gated questions remain. Pure content, no code. See IDEAS.md.
11. **Cross-lab path GT post + Distribution** `XS` — write the GT post for the 6-week Systems Engineer path, then HN/LinkedIn. See IDEAS.md.

### ~~Failure mode completeness audit~~ DONE sprint 46 (`1dce7db`)

### Still open (S effort)
- ~~**6 new PrepLab questions**~~ — DONE sprint 46 (`bff96ac`). quantiphi-1 through quantiphi-6.
- ~~**Trap field quality pass**~~ — DONE sprint 46 (`bff96ac`). 10 trap fields rewritten across rag/agents/llmops/evaluation. Remaining ~85 thin traps in lower-traffic clusters (streaming, attention, context) — lower priority.
- ~~**Interview Signal Quantiphi entry**~~ — already done, id:38 confirmed present (`43545a7`).
- ~~**Tab keyboard shortcuts**~~ — DONE sprint 46 (`f7ce93a`). R/A/E/L/P/G/C live, shortcuts overlay updated.
- ~~**FidelityBadge dedup**~~ — DONE sprint 46 (`f7ce93a`). Moved to shared.jsx.
- **GT Series post taxonomy** — tag all 226 posts to SERIES_META series slugs. M effort, content work.

### Sprint 50 — Next priority queue

**Highest leverage (build first):**
1. ~~**Readiness layer**~~ DONE `13f7eda` — `src/readiness.js`, badges on all 5 hub pages, bars on returning home view.
2. ~~**Guided paths**~~ DONE `65db981` — Getting Started (7 steps), RAG Production Ready (6 steps), Interview Sprint (6 steps). All on returning home view.
3. ~~**staffLayer expansion**~~ DONE `65db981` — 41 questions (was 30). 34 hard gated remain.
4. **Evaluation GT depth** `M` ← NEXT — only 8 posts tagged evaluation. Needs 4–6 new posts.
5. **staffLayer to 60+** `S` — 34 questions still missing. Pure content.
6. **Guided path polish** `S` — path-specific PrepLab filtering, completion celebration.

**Still open (deferred):**
- **React.lazy() code splitting** — systematic, DECISIONS.md scope.
- **Pyodide execution for Eval Lab** — Tier 2.
- **GT Series post taxonomy** — tag all 226 posts to SERIES_META slugs.

---

## Do NOT touch this session

- Stripe + auth — not yet. See DECISIONS.md Section 0.
- New GT posts (not in Pending list above) — no bulk additions.
- PAL codebase — separate product, out of scope.
- TypeScript migration — never.
- Marimo — wrong tool (DECISIONS.md Section 7).

---

## End of session checklist

- [ ] Brace check on all modified files: `node -e "const fs=require('fs'); const c=fs.readFileSync('src/FILE.jsx','utf8'); let o=(c.match(/\{/g)||[]).length, cl=(c.match(/\}/g)||[]).length; console.log('diff:',o-cl)"` → must be 0
- [ ] Commit with descriptive message per file group
- [ ] Update CLAUDE.md sprint log entry (scale, commit hashes, what changed)
- [ ] Update this file — move done items to CLAUDE.md log, add anything new to Pending
- [ ] Update LINEAGE.md with new sprint row
- [ ] Update IDEAS.md — mark built items ✅, update header scale line
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
