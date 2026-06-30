# PENDING_APPROVALS

_Controller-facing approval queue for the GenAI Systems Lab. Each entry is a completed build awaiting Sidharth's review + push (or a render go-ahead). Nothing here has been auto-pushed. Read the linked files, approve, then run the proposed commands. Append new entries on top; move to the History section once actioned._

---

## OPEN — Sprint 93g: App.jsx — RAG Lab done card placement fix (30 Jun 2026)

**What changed:** Moved the "Scenario complete" banner in the RAG Lab from above the results grid (where it was invisible after evaluation since the user had scrolled down) to below the grid (after all content: failure mode, metrics, suggested fix, system design lesson). Now appears at the natural scroll-end after evaluation. Banner content unchanged — same CTA buttons (PrepLab + Ground Truth post). Hero copy (Home.jsx) and "Test your understanding" CTA were already correct in code — ROLLOUT.md status updated to reflect.

**Walk 1 Critical bugs resolved:** Findings #1, #2, #3, #5, #6 all closed.

**File changed (1 edited):** `src/App.jsx`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/App.jsx ROLLOUT.md PENDING_APPROVALS.md && \
git commit -m "fix: RAG Lab done card moved below results grid — Walk 1 Critical findings #5/#6 closed (sprint 93g)" && \
git push origin main
```

---

## OPEN — Sprint 93f: foundationsRunnerData.js — MCQ correct-always-A fix (26 Jun 2026)

**What changed:** Every MCQ in `foundationsRunnerData.js` had `correct: 0` — option A was always the correct answer across all 52 modules. Applied deterministic rotation (`module_index % 4`) so correct answer is distributed: 13 modules at A, 13 at B, 13 at C, 13 at D. Options array rotated accordingly, explanation letter references (Option A/B/C/D) rewritten to match new positions.

**Validation:** 52 entries, 0 issues, exact 13/13/13/13 distribution confirmed.

**File changed (1 edited):** `src/data/foundationsRunnerData.js`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/data/foundationsRunnerData.js && \
git commit -m "fix: MCQ correct-always-A bug — rotate answer positions 13/13/13/13 distribution (sprint 93f)" && \
git push origin main
```

---

## OPEN — Sprint 93e: foundationsRunnerData.js — depthTier + interviewWeight schema fields (26 Jun 2026)

**What changed:** Added `depthTier` ("light"|"standard"|"deep") and `interviewWeight` ("high"|"medium"|"low") fields to all 52 module entries. Required by FOUNDATIONS-CONTENT-STANDARD.md D3/D10 dimensions. Non-breaking — unused by runner UI but required for rubric audit compliance.

**Validation:** 52 entries, 0 issues, all fields valid.

**File changed (1 edited):** `src/data/foundationsRunnerData.js`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/data/foundationsRunnerData.js && \
git commit -m "feat: add depthTier + interviewWeight schema fields to all 52 modules (sprint 93e)" && \
git push origin main
```

---

## OPEN — Sprint 93d: foundationsRunnerData.js — D11/D13 depth variance + distractor quality (26 Jun 2026)

**What changed:** D11 depth uniformity — `zero-shot` and `tempgame` trimmed from 3 to 2 paragraphs (LIGHT tier). `attention`, `transformer`, `scaling-laws`, `lora` expanded from 3 to 4 paragraphs (DEEP tier). D13 advanced ceiling — 8 MCQ distractors replaced with competent-but-wrong engineer options: tokenizer, attention-3d, attention, transformer, zero-shot (×2), agent-tools, managed-vs-selfhosted, vision-language-arch.

**Validation:** 52 entries, 0 issues.

**File changed (1 edited):** `src/data/foundationsRunnerData.js`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/data/foundationsRunnerData.js && \
git commit -m "sprint 93d: D11/D13 — depth variance fix (4 LIGHT trimmed, 4 DEEP expanded), 8 distractor upgrades" && \
git push origin main
```

---

## OPEN — Sprint 93c: foundationsRunnerData.js — D3/D5 equation blocks for 12 modules (26 Jun 2026)

**What changed:** Added equation blocks and plain-English summaries to 12 DEEP/STANDARD modules that were missing them: `scaling-laws` (Chinchilla C≈6ND + optimal_tokens≈20×N), `lora` (ΔW=A×B with parameter count comparison), `attention` (Q/K/V defined before equation), `transformer` (C_optimal formula), `managed-vs-selfhosted` (FTE-to-monthly arithmetic), `hybrid-search-design` (BM25 scale example + RRF formula), `resolution-token-cost` (patch concept grounded), `seq-parallel` (memory plain-English summary), `flashattn` (HBM/SRAM definitions + IO reduction numbers), `cost-latency-concepts` (total_latency formula), `vector-db-index-mechanics` (Big-O notation defined), `rlhf` (reward=R−β×KL formula).

**Validation:** 52 entries, 0 issues.

**File changed (1 edited):** `src/data/foundationsRunnerData.js`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/data/foundationsRunnerData.js && \
git commit -m "sprint 93c: D3/D5 equation blocks — 12 modules (scaling-laws, lora, attention, transformer, rlhf + 7 others)" && \
git push origin main
```

---

## OPEN — Sprint 93b: foundationsRunnerData.js — D2/D12 inline definitions (26 Jun 2026)

**What changed:** Added parenthetical inline definitions for 30+ undefined above-baseline terms across 15 modules: PPO in `rlhf`/`alignment-techniques`, TTFT in `model-families`, ResNets/Chinchilla in `transformer`, float16 in `flashattn`, YaRN/LongRoPE in `positional-encoding`, tensor parallelism/gradient checkpointing in `seq-parallel`, FTE in `managed-vs-selfhosted`, p25/p50/p75 in `enterprise-ai-cost-model`, QLoRA in `lora`, HNSW/IVF/kNN/Big-O in `vector-db-index-mechanics`, BM25/TF-IDF in `hybrid-search-design`, softmax in `attention`, conditional probability in `chain-of-thought`, Camelot/pdfplumber/Textract in `multimodal-rag`, AdvBench/HarmBench/WildGuard in `safety-measurement`, privilege escalation in `jailbreak-taxonomy`.

**Validation:** 52 entries, 0 issues.

**File changed (1 edited):** `src/data/foundationsRunnerData.js`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/data/foundationsRunnerData.js && \
git commit -m "sprint 93b: D2/D12 inline definitions — 30+ terms defined across 15 modules" && \
git push origin main
```

---

## OPEN — Sprint 93a: foundationsRunnerData.js — D8 MCQ all-4-options fix (26 Jun 2026)

**What changed:** Extended MCQ explanation strings to explain all 4 options (not just correct) for 37 remaining modules. Modules: attention-3d, flashattn (LM); agent, agent-tools, multiagent, guardrails, agent-tracing (Agents); eval-loop, debug, llm-as-judge, eval-design, rag-eval (Eval); cost-latency-concepts, latency-planner, observability-concepts, prompt-regression-signals, quality-drift, cost-attribution, managed-vs-selfhosted, enterprise-ai-cost-model (Production); zero-shot, few-shot, chain-of-thought (Prompt Eng); model-families, rlhf, scaling-laws, lora (Foundation Models); vector-db-index-mechanics, hybrid-search-design, metadata-filtering (Vector); vision-language-arch, multimodal-rag, resolution-token-cost (Multimodal); alignment-techniques, red-teaming, jailbreak-taxonomy, safety-measurement (AI Safety). Each wrong option now gets one sentence explaining the specific misconception it represents.

**Validation:** 52 entries, 0 issues.

**File changed (1 edited):** `src/data/foundationsRunnerData.js`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/data/foundationsRunnerData.js && \
git commit -m "sprint 93a: D8 MCQ fix — all 4 options explained for 37 remaining modules" && \
git push origin main
```

---

## OPEN — Sprint 92m: foundationsRunnerData.js — rubric pass fixes (26 Jun 2026)

**What changed:** `src/data/foundationsRunnerData.js` — rubric pass against FOUNDATIONS-CONTENT-STANDARD.md. 0 FAILs found across all 51 non-stub modules. All modules SHIPPABLE (0 FAILs, ≤2 FLAGs each). Implemented highest-impact FLAG fixes.

**Verdict:**
- 0 FAILs (gate met — all 51 modules shippable)
- Systemic FLAG D8 (MCQ explanation addresses correct only) — fixed for Language Models + Retrieval tracks (15 modules); remaining 36 modules flagged for future sprint
- Systemic FLAG D2 (undefined jargon for baseline learner) — fixed for 17 modules with inline definitions
- FLAG D5 (attention missing expressions for STANDARD mathematical concept) — added `score = Q·K^T / sqrt(d_k)` inline equation with plain-English explanation

**Specific fixes applied (33 edits):**

D2 inline definitions added:
- `sampling`: defined "logits"
- `training-signal`: defined "RLHF" inline
- `rag-pipeline`: defined "BM25"
- `kv-cache`: defined "vLLM"
- `seq-parallel`: defined "All-Gather" and "Ring-Attention"
- `observability-concepts`: defined "Z-score"
- `managed-vs-selfhosted`: defined "VRAM"
- `enterprise-ai-cost-model`: defined "DAU"
- `model-families`: defined "MMLU"
- `scaling-laws`: defined "FLOPs"
- `rlhf`: defined "KL divergence"
- `alignment-techniques`: defined "KL divergence"
- `vision-language-arch`: defined "CLIP"
- `jailbreak-taxonomy`: defined "in-context learning"
- `lora`: defined "ΔW"
- `agent-tools`: defined "LangGraph"
- `agent-tracing`: defined "OpenTelemetry"

D5 equation fix:
- `attention`: added `score = Q·K^T / sqrt(d_k)` with plain-English explanation

D8 MCQ explanation augmentation (all 4 options now addressed):
- Language Models track (10): tokenizer, attention, transformer, positional-encoding, nextoken, training-signal, sampling, tempgame, kv-cache, seq-parallel
- Retrieval track (5): embeddings, chunking, rag-pipeline, context, reranking

**Remaining FLAGs (logged, not fixed in this sprint):**
- D8: 36 modules (AI Agents, Evaluation, Production Systems, Foundation Models, Prompt Engineering, Vector Infrastructure, Multimodal, AI Safety) — MCQ explanations still address correct answer only
- D3/D10 schema gap: `depthTier` and `interviewWeight` fields not yet added to runner data entries

**Validation:** 52 total entries, all valid. Zero issues.

**File changed (1 edited):** `src/data/foundationsRunnerData.js`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/data/foundationsRunnerData.js && \
git commit -m "sprint 92m: rubric pass fixes — D2 inline defs (17), D5 attention eq, D8 MCQ augment LM+Retrieval (15)" && \
git push origin main
```

---

## OPEN — Sprint 92k: foundationsRunnerData.js — all 9 remaining tracks (26 Jun 2026)

**What changed:** `src/data/foundationsRunnerData.js` — added runner data for all non-stub modules across the 9 remaining Foundations tracks. Previously only the Language Models track (10 modules) had runner data.

**New entries (35 modules):**
- Retrieval (4): embeddings, chunking, rag-pipeline, context
- AI Agents (5): agent, agent-tools, multiagent, guardrails, agent-tracing
- Evaluation (4): eval-loop, debug, llm-as-judge, eval-design
- Production Systems (8): cost-latency-concepts, latency-planner, observability-concepts, prompt-regression-signals, quality-drift, cost-attribution, managed-vs-selfhosted, enterprise-ai-cost-model
- Foundation Models (2): scaling-laws, lora
- Prompt Engineering (2): few-shot, chain-of-thought
- Vector Infrastructure (3): vector-db-index-mechanics, hybrid-search-design, metadata-filtering
- Multimodal AI (3): vision-language-arch, multimodal-rag, resolution-token-cost
- AI Safety & Alignment (4): alignment-techniques, red-teaming, jailbreak-taxonomy, safety-measurement

**Stubs skipped (no runner data needed — StubModule renders placeholder):** reranking, agent-memory, agent-planning, rag-eval, rlhf, instruction-tuning, model-families, zero-shot, system-prompts, structured-outputs, prompt-security

**Validation:** `node --input-type=module` import check: 45 total keys, all entries valid (scenario, explanation array, mcq.question + mcq.options[4] + mcq.correct + mcq.explanation, takeaway — all present).

**File changed (1 edited):** `src/data/foundationsRunnerData.js`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/data/foundationsRunnerData.js && \
git commit -m "feat: foundationsRunnerData — all 9 remaining tracks, 35 new modules (sprint 92k)" && \
git push origin main
```

---

## OPEN — Sprint 92j: Nav restructure — four-pillar alignment (26 Jun 2026)

**What changed:** Aligned nav to KNOW/LEARN/BUILD/JUDGE/EXTRAS four-pillar structure.
- `src/config/nav.js` — replaced NAV_GROUPS with four-pillar structure; moved leaderboard from TRACK → EXTRAS
- `src/App.jsx` — replaced local NAV_GROUPS to match: TRACK (profile/progress/plans), KNOW (Foundations), LEARN (Ground Truth), BUILD (PrepLab + 5 challenge areas), JUDGE (Systems), EXTRAS (Leaderboard)

**Files changed (2 edited):** `src/config/nav.js`, `src/App.jsx`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/config/nav.js src/App.jsx && \
git commit -m "feat: nav restructure — four-pillar KNOW/LEARN/BUILD/JUDGE/EXTRAS alignment (sprint 92j)" && \
git push origin main
```

---

## OPEN — Sprint 92i: Remove cross-frame leakage from Foundations (26 Jun 2026)

**What changed:** Two nav containment fixes.
- `src/Concepts.jsx` — removed `SYSTEMS_DEEP_REF` constant (97 lines) and the "Deep reference" grid from `GymRoomView`. Foundations is now self-contained — no link-outs to Systems from inside a track room.
- `src/App.jsx` — removed `{ id: "foundations", label: "Foundations" }` from `NAV_DOMAINS`. The Foundation Models challenge hub (`#foundations`) was appearing in the BY DOMAIN secondary nav alongside Retrieval/Evaluation/Agents/Production, causing confusion with the Foundations learning tracks (`#concepts`).

**Files changed (2 edited):** `src/Concepts.jsx`, `src/App.jsx`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/Concepts.jsx src/App.jsx && \
git commit -m "fix: remove cross-frame leakage — drop deep-ref grid from Foundations, remove Foundations from BY DOMAIN (sprint 92i)" && \
git push origin main
```

---

## OPEN — Sprint 92h: Remove diagnostic error trap from index.html (26 Jun 2026)

**What changed:** Removed the `window.onerror` / `unhandledrejection` diagnostic block added in sprint 92e. Root cause (sparse PREP_QUESTIONS array) was identified and fixed in 92f — trap is no longer needed.

**File changed (1 edited):**
- `index.html` — 22 lines of diagnostic script removed from `<body>`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add index.html && \
git commit -m "chore: remove sprint 92e diagnostic error trap from index.html (sprint 92h)" && \
git push origin main
```

---

## OPEN — Sprint 92g: Foundations skeleton restructure (26 Jun 2026)

**What changed:** Full skeleton restructure of `src/Concepts.jsx` — 12 tracks → 10 tracks, 53 modules → 57 modules. No content touched. No runner data touched. No existing components changed.

**Structural changes:**
- **Dissolved:** `cloud-ai-services` track (platform-specific, will age poorly) and `observability-tracing` track (merged into Production Systems + AI Agents)
- **Promoted to active:** `vector-infrastructure`, `multimodal`, `ai-safety-alignment` (were "coming soon" with teasers — now full active tracks with real module lists)
- **Language Models (10):** removed `attention-3d` (viz-only, not a learning module), moved `flashattn` → Production; added stubs `positional-encoding`, `kv-cache`
- **Retrieval (5):** removed `embeddings-3d` + `cosine-sim` (viz-only); added stub `reranking`
- **AI Agents (7):** added stubs `agent-memory`, `agent-planning`; absorbed `agent-tracing` from dissolved Obs&Tracing track
- **Evaluation (5):** added stub `rag-eval`
- **Production Systems (9):** absorbed `flashattn`, `prompt-regression-signals`, `quality-drift`, `cost-attribution` (from dissolved Obs&Tracing), plus `managed-vs-selfhosted` + `enterprise-ai-cost-model` (from dissolved Cloud track)
- **Foundation Models (5):** removed dup `training-signal` + viz-only `diffusion-3d`; added stubs `rlhf`, `instruction-tuning`, `model-families`
- **Prompt Engineering (6):** expanded from 2 → 6; added stubs `zero-shot`, `system-prompts`, `structured-outputs`, `prompt-security`
- **Vector Infrastructure (3):** condensed from 5 → 3 (dropped ops-specific `pgvector-vs-managed`, `vector-migration-patterns`)
- **Multimodal AI (3):** condensed from 4 → 3 (dropped `ocr-pipeline-design`)
- **AI Safety & Alignment (4):** unchanged content, just promoted from "coming soon" to active

**Added to MODULES:** `StubModule` component + 13 new stub entries (component renders "Content in progress" placeholder — safe to click, won't crash)

**Added to SYSTEMS_DEEP_REF:** entries for `vector-infrastructure`, `multimodal`, `ai-safety-alignment`

**Selector description:** "Seven tracks" → "Ten tracks"

**Validation:** all 57 GYMS moduleIds resolve to existing MODULES entries (verified via node script). No duplicates.

**Files changed (1 edited):**
- `src/Concepts.jsx`

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/Concepts.jsx && \
git commit -m "feat: Foundations skeleton restructure — 10 tracks, 57 modules, 13 stubs (sprint 92g)" && \
git push origin main
```

---

## OPEN — Sprint 92f: Fix sparse PREP_QUESTIONS crash (26 Jun 2026)

**Root cause identified:** `PREP_QUESTIONS` in `src/data/preplabQuestions.js` is a sparse array — 595 length but only 591 actual entries (holes at indices 366, 382, 423, 457). When `leaderboardUtils.js` runs at module init time, `PREP_QUESTIONS.map(...)` skips holes but preserves them as empty slots in the result array. `Object.fromEntries` then iterates the result and reads empty slots as `undefined` → `TypeError: Iterator value undefined is not an entry object`. This crashes the module before React ever starts → blank white page.

**Fix:** Added `.filter(Boolean)` before `.map()` in `leaderboardUtils.js` line 29. Strips all holes/falsy entries before mapping. One-line change, defensive against future holes in the data file.

**File changed (1 edited):**
- `src/leaderboardUtils.js` line 29: `PREP_QUESTIONS.filter(Boolean).map(...)` (was `.map(...)`)

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/leaderboardUtils.js && \
git commit -m "fix: sparse PREP_QUESTIONS crash — filter(Boolean) before fromEntries (sprint 92f)" && \
git push origin main
```

---

## OPEN — Sprint 92e: Global error trap in index.html (26 Jun 2026)

**Problem:** App still blank white after sprint 92d (RootErrorBoundary deployed). A `RootErrorBoundary` only catches errors during React rendering — if the module evaluation itself fails (e.g. a static import throws at init time), React never starts and the boundary is never instantiated. Result: blank page, zero visible error info.

**Fix:** Added a `window.onerror` + `unhandledrejection` trap in `index.html` as a plain `<script>` tag (not a module) that runs BEFORE any module loads. It catches any error — module parse failure, runtime throw during module init, unhandled promise — and renders a dark diagnostic overlay with the error message and stack trace instead of blank white.

**File changed (1 edited):**
- `index.html` — plain `<script>` block added before `<div id="root">`. Completely self-contained, no build dependency, no interaction with React. Remove once root cause is identified.

**After pushing:** visit the app. If anything is throwing, you'll see a dark screen with the exact error. Paste the error text back here and I'll fix it in one more sprint.

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add index.html && \
git commit -m "fix: global error trap in index.html — diagnose blank page (sprint 92e)" && \
git push origin main
```

---

## OPEN — Sprint 92d: Blank-page debug fix (26 Jun 2026)

**Problem:** App shows a completely blank white page after sprint 92c deploy. Root cause not identified through static analysis — build succeeded, all exports resolve, no obvious crash path found. Deployed fix is diagnostic-first.

**Files changed (2 edited):**
- `src/App.jsx` — Moved `import { ALL_SCENARIOS... }` and `import { RAG_CORPUS }` from after the lazy `const` declarations (lines 46–47 in old file) to the static import block (lines 15–16). All static imports now precede all lazy consts. No runtime change (imports are hoisted) but removes a mixed import/const pattern that could interact badly with Rollup in edge cases.
- `src/main.jsx` — Added `RootErrorBoundary` class component above `<App>`. Catches any crash outside `TabErrorBoundary` (including App() function body crashes) and renders the error message + stack trace instead of a blank page. Includes a Reload button. This is the missing piece: before this, any pre-TabErrorBoundary crash produced a blank white page with zero diagnostic info.

**Expected outcome:** Either the blank page is fixed (import ordering was the cause), OR the error boundary shows the actual error message so we can fix the real root cause.

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/App.jsx src/main.jsx && \
git commit -m "fix: RootErrorBoundary + clean import order — diagnose blank page (sprint 92d)" && \
git push origin main
```

---

## OPEN — Sprint 92c: Progress extraction + FoundationsRunner (26 Jun 2026)

**Files changed (4 new / 2 edited):**
- `src/Progress.jsx` — NEW. ProgressView extracted from App.jsx + improved: weighted score display using `computeBreakdown()` from leaderboardUtils (4th stat in banner); "KNOW — Foundations" lane (was "KNOWLEDGE — Concepts Gym"); "Open Foundations →" CTA; ACTIVE_GYMS expanded to all 7 tracks; per-track mastery bars with module chip grid. `TierBadge`, `LaneCard`, `MiniBar` inlined.
- `src/FoundationsRunner.jsx` — NEW. PAL 5-step runner shell: Scenario → Explanation → Interactive → Quick Check (MCQ) → Takeaway. Progress saved to `gsl-runner-progress-{moduleId}` localStorage. Step bar is clickable for revisiting; already-completed modules open at step 5. Props: `moduleId`, `module`, `runnerData`, `Component`, `spec`, `onNavigate`, `mastery`, `markComplete`, `onBack`.
- `src/data/foundationsRunnerData.js` — NEW. Runner content for all 10 Language Models track modules: tokenizer, attention, attention-3d, transformer, seq-parallel, flashattn, sampling, nextoken, tempgame, training-signal. Each module has: scenario (production context), explanation (3 prose paragraphs), mcq (4 options + correct index + explanation), takeaway.
- `src/App.jsx` — ProgressView removed (514 lines); `const ProgressPage = lazy(() => import("./Progress"))` added; route changed to `<ProgressPage ...>`.
- `src/Concepts.jsx` — Imports `FoundationsRunner` + `RUNNER_DATA`; View 3 refactored: sidebar extracted to `SidebarContent` const (shared between runner and standard paths); if `RUNNER_DATA[active]` exists, renders `<FoundationsRunner ...>` instead of the standard module view.

**No breaking changes.** Modules without runner data continue to render exactly as before. Modules with runner data (all 10 LM track modules) now show the 5-step guided flow. The runner can be exited to the sidebar at any step via the back button.

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/Progress.jsx src/FoundationsRunner.jsx src/data/foundationsRunnerData.js src/App.jsx src/Concepts.jsx && \
git commit -m "feat: Progress extraction + FoundationsRunner — PAL 5-step runner (LM track), Progress page improvements (sprint 92c)" && \
git push origin main
```

---

## OPEN — Sprint 92b: KNOW restructure — Foundations (26 Jun 2026)

**Files changed (3 edited):**
- `src/Concepts.jsx` — Added `SYSTEMS_DEEP_REF` constant (gym→Systems module mapping). `GymSelectorView`: heading "Concepts" → "Foundations", updated description, added KNOW label. `GymRoomView`: back button "← All training rooms" → "← Foundations"; added deep-reference grid showing relevant Systems modules per track (clicking navigates to `#systems` with `initialModule`). Module runner: "← All rooms" → "← Foundations".
- `src/App.jsx` — `NAV_SECTIONS` KNOW frame: removed `starthere` + `paths`, renamed concepts label → "Foundations". JUDGE frame: removed `systems`. Added `HASH_REDIRECTS = { starthere: "concepts", paths: "concepts" }`. Applied redirects in `getInitialView()` and `hashchange` handler. Removed stale `paths` subitems from Ground Truth nav group. TAB_FRAME: added `starthere/paths → know`, `systems → judge` for graceful fallback.
- `src/config/nav.js` — `concepts` entry: label → "Foundations", group → "KNOW".

**Structural debt recorded (do not fix now):**
- `#foundations` route = Foundation Models challenge hub (BUILD frame) — name conflicts with the new KNOW Foundations (`#concepts`). Needs renaming when full four-frame cleanup runs.
- Systems content now appears in both KNOW (deep-reference cards in Foundations tracks) and implicitly in existing hubs — dual representation to resolve later.
- Learning Paths' 9 goal-specific journeys dissolved — "What's your goal?" flow deferred.
- `#systems` intentionally NOT redirected — still a live target for deep-reference navigation from Foundations tracks.

```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/Concepts.jsx src/App.jsx src/config/nav.js && \
git commit -m "feat: Foundations restructure — Concepts→tracks, KNOW nav cleanup, Systems deep-ref, hash redirects (sprint 92b)" && \
git push origin main
```

---

## OPEN — Sprint 92: Global leaderboard (26 Jun 2026) — ✅ Supabase SQL done

**Files changed (4 new / 3 edited):**
- `src/leaderboardUtils.js` — NEW. Weighted score computation (`computeTotalScore`, `computeBreakdown`) + Supabase `upsertLeaderboardRow` + `fetchLeaderboard`. Reads `gsl-preplab-history`, `gsl-concepts-mastery`, `genai_leaderboard`. Weights: beginner=1, easy/B-I=2, intermediate/medium=3, hard=5, staff=8, daunting=0; Concepts module=3; scenario passed=5.
- `src/Leaderboard.jsx` — NEW. Global board page: "Your standing" card with score breakdown (PrepLab / Concepts / RAG Lab), scoring legend accordion, ranked top-100 list. Zinc/CSS-var styling, no lucide-react.
- `src/App.jsx` — lazy import `GlobalLeaderboard`; added `import { upsertLeaderboardRow }` from leaderboardUtils; added `"leaderboard"` to `VALID_VIEWS`; added `"leaderboard"` to `GUEST_ALLOWED_TABS`; added route `{topView === "leaderboard" && <GlobalLeaderboard user={user} />}`; call `upsertLeaderboardRow(u)` in `SIGNED_IN` auth event.
- `src/config/nav.js` — added `leaderboard` to `ALL_TABS` (group: TRACK) and `NAV_GROUPS` TRACK section.

**Supabase SQL — run once in Supabase SQL editor before deploying:**
```sql
-- gsl_leaderboard table
create table if not exists gsl_leaderboard (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  display_name     text not null,
  total_score      int  not null default 0,
  questions_answered int not null default 0,
  updated_at       timestamptz not null default now()
);

-- RLS: public read, owner write only
alter table gsl_leaderboard enable row level security;

create policy "Public read gsl_leaderboard"
  on gsl_leaderboard for select
  using (true);

create policy "Own row upsert gsl_leaderboard"
  on gsl_leaderboard for insert
  with check (auth.uid() = user_id);

create policy "Own row update gsl_leaderboard"
  on gsl_leaderboard for update
  using (auth.uid() = user_id);
```

**No build needed before SQL step.** Run SQL first, then:
```bash
cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
git add src/leaderboardUtils.js src/Leaderboard.jsx src/App.jsx src/config/nav.js && \
git commit -m "feat: global leaderboard — weighted score, Supabase sync, nav entry (sprint 92)" && \
git push origin main
```

---

## ✅ NO OPEN ITEMS — sprint 90 closed (24 Jun 2026)

All three monochrome-theme slices are committed + pushed; `origin/main` == HEAD (0 ahead / 0 behind), live on Vercel. Next-session work is the non-blocking list in `NEXT.md` (Layer-C viz tokenisation → guard `--strict`; 3D embeddings instrument).

_Only the lab md spine (`NEXT` / `PENDING_APPROVALS` / `LINEAGE` / `IDEAS`) has uncommitted statefulness edits — a docs-only commit, no build needed._

---

## ✅ History (approved / actioned)

- **Foundations explanations Batch 6 — 21 MEDIUM interviewWeight modules (sprint 93m, 1 Jul)** — Rewrote explanation arrays for: eval-design, rag-eval, observability-concepts, prompt-regression-signals, quality-drift, cost-attribution, managed-vs-selfhosted (expanded to 4 paras, DEEP tier satisfied), enterprise-ai-cost-model, zero-shot, model-families, metadata-filtering, vision-language-arch, multimodal-rag, resolution-token-cost, red-teaming, jailbreak-taxonomy, safety-measurement. Plus 4 completed in same sprint: tempgame, positional-encoding, multiagent, agent-tracing. Every module opens with a cross-module handoff naming what the previous concept left unsolved. All 52 Foundations modules now rewritten with causal chain discipline. Pushed + live.

- **Foundations explanations Batch 5 — 12 DEEP/STANDARD modules (sprint 93l, 30 Jun)** — Rewrote explanation arrays for: training-signal (5 paras), kv-cache (4 paras, added MQA/GQA), agent-tools, guardrails, eval-loop, debug, llm-as-judge, cost-latency-concepts, latency-planner, rlhf (5 paras, added reward hacking paragraph), hybrid-search-design, alignment-techniques (4 paras, added Constitutional AI). Pushed + live.

- **Foundations explanations Batch 4 — 4 HIGH interviewWeight modules (sprint 93k, 30 Jun)** — Rewrote explanation arrays for: attention-3d, seq-parallel, flashattn, reranking. Pushed + live.

- **Foundations explanations Batch 3 — 4 HIGH interviewWeight modules (sprint 93j, 30 Jun)** — Rewrote explanation arrays for: context, chain-of-thought, vector-db-index-mechanics, agent. Pushed + live.

- **Foundations explanations Batch 2 — 6 HIGH interviewWeight modules (sprint 93i, 30 Jun)** — Rewrote explanation arrays for: sampling, nextoken, chunking, rag-pipeline, lora, few-shot. Pushed + live.

- **Foundations explanations Batch 1 + gaps + CONTENT-STANDARD.md (sprint 93h, 30 Jun)** — Rewrote explanation arrays for: tokenizer, embeddings, attention, transformer, scaling-laws (5 HIGH modules). Fixed 5 post-audit gaps (character-level failure reason, static/contextual conflation, layer norm, LSTM/√d_k, Chinchilla 6× factor). Created CONTENT-STANDARD.md codifying 6 causal chain rules, depth tier paragraph counts, and batch history table. Pushed + live.

- **App-wide rail kill + GT muted hues (sprint 90, 24 Jun)** — 6 left `inset Npx 0 0` rails + 66 decorative top `borderTop` accent bars → neutral hairlines across 18 files (semantic green/red pass-fail accents kept); GT series cards → muted per-area hues. 19 `.jsx`, esbuild-verified. Committed `5b5ba38`; pushed + live.

- **Monochrome instrument theme — base remap + colour guard (sprint 90, 23–24 Jun)** — `src/index.css` MONOCHROME INSTRUMENT block (cold grey ramp overriding warm-brown base; decorative palettes amber/indigo/blue/orange/sky/rose/pink/teal/purple → zinc; red→break, emerald/green→fix faint; frame tokens grey; cyan the lone accent) + `scripts/check-no-hex.mjs` colour guard + `package.json` `check:color`. One appended, reversible block recolours the whole app. Built on Mac + pushed + live (verified in-app). HQ standard locked in `DESIGN-STANDARD.md` ("THE MONOCHROME INSTRUMENT STANDARD").
- **GT cards de-rainbow + nav rail kill (sprint 90, 23–24 Jun)** — `GroundTruth.jsx` SERIES_META/CAT_COLORS → challenge-area greys; `App.jsx` active nav rows → value-based selection (filled row + hairline, no cyan rail), desktop + both mobile drawers. Built on Mac + pushed + live. (Refined same sprint by the OPEN muted-hue + full-rail-kill item above.)

- **DO→SQL link-out fix (23 Jun)** — corrected the DO-rung SQL link to the real PAL SQL Lab (`https://product-analytics-lab.vercel.app/#/sql-lab`). Committed `0d23529` (+ `6ff6725`); pushed + live.
- **Four-frame accordion sidebar — HQ DESIGN-STANDARD (sprint 84, 23 Jun)** — `src/App.jsx`: KNOW/DO/BUILD/JUDGE + PREP&ASSESS accordions (measured-height, one-open-per-level, cyan active pill, frame icons), BY DOMAIN flat lens, SOON marker + ↗ link-outs; desktop + both mobile drawers. Committed `e34aa48`; pushed + live. (Old `NAV_GROUPS` render removed; data left as dead code — cleanup deferred.)
- **BreakLabs logo / BrandMark — D-19 (sprint 83, 23 Jun)** — `BrandMark.jsx` + 7 slots + favicon + rebranded OG; old OG → `_legacy/`; descriptor stacked below the wordmark. Committed `f9d1a15`; pushed + live.
- **GSL UI-inventory pass (sprint 83, 22 Jun)** — appended GSL section to `HQ/DESIGN-STANDARD.md`; HQ merged + ruled the best-of-breed table (GSL won KNOW-renderer / MCQ / progress rows). Actioned (HQ doc, no git push).
- **Four-frame nav reframe + fluency-sliver spec (sprint 82, 22 Jun)** — `docs/NAV-REFRAME-SPEC.md` + `docs/FOUR-FRAME-AUDIT.md` addendum. Committed `b0e6c5a`; pushed. (Implemented in sprint 84.)
- **Four-frame reframe audit (sprint 81, 22 Jun)** — `docs/FOUR-FRAME-AUDIT.md` (read-only). Committed `1229a41`; pushed.
- **PixelRAG + Headroom GT posts (Build Session A, 22 Jun)** — `groundTruthPosts.js` + `groundTruthIndex.js` (+ Content Master Tracker rows #25/#26). Committed `03eb7be`; pushed + live. (Headroom LinkedIn visual still un-rendered — held at the content-first gate; render on go-ahead.)
