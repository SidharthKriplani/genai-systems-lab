# LINEAGE

Build history of genai-systems-lab — what was built, what inspired it, and why each decision was made. Complements DECISIONS.md (which tracks architectural choices) and IDEAS.md (which tracks future work).

---

## Origin

Started as a personal reference tool: "what would I actually want when preparing for an ML engineering interview or ramping up on production AI systems?" The answer was interactive simulations, not static notes.

Core insight: most GenAI learning resources are either too academic (papers, textbooks) or too shallow (blog posts). The gap is production-depth interactivity — tools that let you reason through real decisions, not just read about them.

---

## Tab Lineage

### Systems Lab
**Origin:** Needed a place to practice production ML thinking — cost/latency trade-offs, eval design, incident diagnosis. Started with 4 modules (Evals, Cost/Latency, Model Strategy, Should Use AI?).

**Growth driver:** Each module revealed gaps in the adjacent space. Evals → needed Eval Frameworks. Cost → needed Model Router. Incidents → needed Observability. Now 38+ modules.

**Key design choice:** GROUP by intent (DESIGN/BUILD/OPS), not by topic. A user asking "how do I decide?" (DESIGN) is in a different mode than "how do I build this?" (BUILD) or "how do I keep it running?" (OPS).

**Modules and their inspiration:**
- **Evals Lab** — Most teams don't know how to design evals. Built as a decision simulator.
- **Cost/Latency Lab** — Token economics are non-obvious. Built to make the math tangible.
- **Incident Room** — Production incidents are the best learning. Simulated real failure patterns.
- **KV Cache Engineering** — Core inference concept almost no tutorial explains well.
- **Transformer Architecture** — Visual, interactive deep-dive. Inspired by 3Blue1Brown's approach.
- **MoE Architecture** — Mixtral, DeepSeek, Grok made MoE mainstream. Needed coverage.
- **Speculative Decoding** — Huge throughput win, underexplained. Built the draft→target loop visually.
- **Flash Attention** — Every serving engineer needs to understand IO complexity. Built the tiling diagram.
- **Quantization Engineering** — AWQ vs GPTQ vs GGUF is a common interview topic with no good reference.
- **Serving Infrastructure** — vLLM/SGLang/TRT-LLM landscape changes fast. Built the comparison table.
- **Agent Architecture** — ReAct loop, planning patterns, tool design. Most practical agent content.
- **RLHF/DPO/PPO** — Alignment training is increasingly expected knowledge for ML engineers.

### Ground Truth
**Origin:** The app needed long-form reference material that went deeper than module cards. Built as a "production engineering blog" embedded in the app.

**Series structure inspiration:** Most blogs are chronological. GT organizes by series — coherent learning arcs. Inspired by Stripe's engineering blog series format.

**Series and their origins:**
- **Frontier Intelligence** — Model-level deep dives: Claude, GPT-4o, Gemini, Llama. For engineers who want to understand the models they ship with.
- **Agent Engineering** — Practical agent architecture. Inspired by the gap between "agent demos" and production reliability.
- **RAG Playbook** — RAG is the most common production pattern. Needed a canonical reference.
- **The Training Stack** — SFT → RLHF → DPO → distillation. The full alignment pipeline in one series.
- **How I'd Build X** — First-person opinionated walkthroughs. Inspired by the "write the design doc first" approach to learning.
- **Data Flywheel** — Production AI improves from its own traffic. Underappreciated in most learning resources.

### PrepLab
**Origin:** Interview prep without passive review. Built as active recall with immediate feedback.

**Question types:** MCQ for factual/conceptual, text-type for system design. Text questions show a model answer for self-assessment — no automated grading, intentionally.

**Coverage target:** Every Systems module should have at least 4 PrepLab questions. Reached 183+ questions covering all 38+ modules.

### Explore
**Origin:** Reference lookup — "I need to remember how embedding models compare" or "what's the API pricing for GPT-4o mini?" Not interactive practice, not long reads. Fast reference.

**Design principle:** Explore = 2-3 tabs, first tab is the primary reference table, second is explanation/context. No heavy interactivity — that's what Systems is for.

**Modules and their origins:**
- **Embedding Model Selector** — Voyage vs Cohere vs OpenAI is a real decision teams face. Built the use-case wizard.
- **RAG Architecture Patterns** — Chunking strategy and retrieval pipeline decisions. High-frequency reference.
- **API Model Pricing** — Changes frequently. Built as a static snapshot with "check provider docs" caveat.
- **Benchmark Browser** — MMLU/HumanEval/MT-Bench comparison. Sortable by column.
- **Prompt Pattern Library** — Few-shot, CoT, structured output templates. The anti-patterns tab is the most useful part.
- **Context Engineering** — Window strategies and model context limits. Fast lookup.

### Career Tab
**Origin:** Interview prep beyond PrepLab — take-home challenge simulation. Long-form scenarios with rubrics.

---

## Architecture Lineage

### Tech Stack
- **React 18 + Vite 6** — Chosen for fast development iteration and zero-config bundling.
- **Tailwind CSS v4** — @tailwindcss/vite plugin, no PostCSS config. Dark theme built-in.
- **No TypeScript** — Deliberate. TypeScript casts in JSX cause Vercel build errors with this setup. Avoided from session 1.
- **No backend** — Static app on Vercel. All state in localStorage. No auth, no database.
- **No external UI library** — All components hand-rolled. Keeps bundle small, full design control.

### File Architecture
- **Systems.jsx** was a single 9,500+ line file until May 2026 when it was split.
- **Refactor:** `Systems.jsx` (139 lines — registry + SystemsApp) + `src/systems/modules.jsx` (9,500+ lines — all module components). Same external API, zero user-facing change.
- **Pattern for new modules:** Add component to `modules.jsx`, add entry to SYSTEMS_MODULES in `Systems.jsx`, add 4 PrepLab questions.

### Progress Tracking
- **May 2026:** Added localStorage-backed progress tracking. Key: `gsl-systems-done`. Mark-as-done toggle at bottom of each module. ✓ on pills, progress bar in header.
- **Decision:** localStorage only — no backend, no cross-device sync. Acceptable for a learning tool.

---

## Build Sessions

| Session | Key additions |
|---|---|
| Initial | Evals, Cost/Latency, Model Strategy, Should Use AI? |
| Early | Incident Room, Observability, A/B Testing, ML CI/CD |
| Mid | RAG modules, Agent modules, Fine-Tuning Lab, Caching |
| GT expansion | Frontier Intelligence series, Agent Engineering series, RAG Playbook |
| T1-T2 | Multimodal AI, Context Window Eng., Deployment Architecture, Red Teaming, Prompt Eng. Lab |
| Transformer sprint | Transformer Architecture visual (4 interactive tabs), Structured Output, Synthetic Data |
| Enrichment sprint | PrepLab to 80+, How I'd Build X series, A2A companion, Embedding Model Selector, Streaming, Speculative Decoding |
| New module sprint | Flash Attention, Quantization, Serving, Prompt Caching, Fine-Tuning Workflows, RLHF/DPO, Multimodal Systems |
| Scale sprint | Agent Architecture, 5 new Explore modules, 5 GT posts, 20 PrepLab questions, Systems.jsx refactor, progress tracking |
| May 2026 sprint 1 | Left sidebar nav, three-door Home hero, module sidebar+content split. Cosine Similarity Explore, EvalMetrics expanded (RAGAS/LLM-as-Judge), Long Context Patterns, Model Architecture Comparison, Hardware Reference, Tokenizer Comparison, Prompt Injection Defense, Vector DB Engineering, Agent Memory Architecture. GT posts: Type A/B Engineers, Pretraining, RAG Lies, Eval Crisis, Reversal Curse, Agent Memory, Entropy/KL, Why Transformers Won, Prompt Is Code, Three-Layer DE Stack. 244 PrepLab, 212 GT posts, related[] on 194+ posts. |
| May 2026 sprint 2 | Bug fixes: HowTo import (runtime crash), duplicate JUDGE_SCENARIOS (Vercel build fail). UX: NAV_GROUPS counts corrected, Systems group filter pills, Explore search. Mobile bottom nav shipped: LEARN/BUILD/GROW bar with slide-up tray, SVG icons, pill highlights, 2-column grid, colored accent line, frosted glass. |
| May 2026 sprint 3 | MCP vs API vs Function Calling module, A/B Testing for AI Systems module. PrepLab 244 → 259 (gap fill: Prompt Injection, Agent Memory, Long Context, Tokenizer clusters). 4 GT posts: A/B testing, graceful degradation, monitoring that predicts, N×M/MCP. Home.jsx Layer 3 badge. DE→AI Engineer learning path (10 steps). Scale: 56 Systems, 23 Explore, 259 PrepLab, 216 GT. |
| May 2026 sprint 4 | Concepts tab sidebar layout (FOUNDATION/APPLICATION/PRACTICE). 6 GT posts: DS→AI Engineer, Forward Deployed Engineer, Prompt Regression Testing, ADK cluster (CLAUDE.md as architecture, hooks vs LLM safety, context isolation). 3 Systems modules: Query Refinement Lab, Prompt Change Management, AI Safety Engineering. 14 PrepLab Qs. Explore DESIGN/BUILD/OPS group structure. Evals Lab Build-Your-Eval wizard. Scale: 59 Systems, 23 Explore, 273 PrepLab, 222 GT. |
| May 2026 sprint 5 | PrepLab text grading → self-assess UI (keyword auto-grade removed). `consult` added to SHORTCUT_TABS. LLM Lab thinned 39→9 true simulators (30 reference modules moved to PARKED.md). PARKED.md created. ServingInfra rebuilt as full decision engine (hardware→framework/quant/batching). AgentConfigLab: 5 failure scenarios + trigger logic. New Explore modules: ModelMergeExplorer, MultimodalGuide. New Concepts module: FlashAttentionConcept. New Playground module: StreamingLab. Scale: 57 Systems, 25 Explore, 16 Agents, 15 Concepts, 8 Playground, 261 PrepLab, 222 GT. |
| May 2026 sprint 6 | Hero copy upgrade: badge "Free · No login · Layer 3 AI skills", magnetic subtext, outcome-oriented door cards. Stat sync (261+ PrepLab, 222+ GT). RAG Lab forward pointer card (scenario-specific — 6 scenario_id → GT post mappings). Concepts 12 modules → ✓ done card with violet gradient. Systems shell footer: always shows PrepLab CTA. `gated: true` added to 163 hard PrepLab questions + JD Prep mode card. Audit 28 run: full gap analysis of Agent Lab (16), Eval Lab (18), LLM Lab (9). IDEAS.md Tier 1 CRITICAL cluster added with Tier A/B/C upgrade plan. Scale: unchanged. |
| May 2026 sprint 7 | Audit 28 Tier A/B/C executed. Tier A: `simulator` + `design` done screens → PrepLab forward pointer cards; `serving` failure block → full scenario card with SERVING_FAILURE_SCENARIOS lookup; `decoding` → reactive failure callout (repetition collapse, token incoherence, vocabulary starvation). Tier B: `agentcfg` AGENT_FAILURE_MATRIX +3 (cascading_errors, over_delegation, tool_poisoning); MoEExpertSimulator added as "sim" tab (LCG pseudo-random load → bar chart → collapse/imbalance callout); LangSmithDiagnose component (5 broken traces, span-click, root cause score, reveal). Tier C: `deploy`, `buildthis`, `abtesting-ai` removed from SYSTEMS_MODULES nav; `QuantizationEngineering` methods table cut. Cross-repo scan (ML Systems Lab + PAL) — 10 features logged in IDEAS.md. Scale: 54 Systems in nav (3 cut), 25 Explore, 261 PrepLab, 222 GT. |
| May 2026 sprint 8 | Mobile UX fixes (reactive, from live usage). RAG Lab: horizontal scroll scenario strip on mobile, sidebar hidden below lg. Agent Lab + Systems Lab: `mobileSidebarOpen` state toggle — sidebar collapses on module select, back button re-opens it. `index.css`: global contrast boost via CSS custom property override in `@media (max-width: 1023px)` — zinc-400→500→600→700→800 shifted one stop brighter on mobile, zero JSX changes. Global palette audit: `text-zinc-600/700` → `text-zinc-500` across ~300 class instances + 27 inline hex replacements. Bottom nav bar replaced with PAL-style left drawer (hamburger → slide-in panel, blurred backdrop, all NAV_GROUPS). Scale: unchanged. |
| May 2026 sprint 9 | Full systematic mobile audit (Audit 32 + 33). All 15 findings resolved. PrepLab split-panel: `mobileSidebarOpen` pattern + `selectMode()`/`exitMode()` helpers. Explore split-panel: same pattern, back button added. Stats row overflow on Home: `flex gap-8 text-5xl` → `grid grid-cols-3 gap-2 sm:flex text-4xl sm:text-6xl`. Journey strip + SVG concept graph: right-fade gradient overlay (mobile only, `lg:hidden`) signals horizontal scroll. Touch targets: systematic `py-1`/`py-1.5` → `py-2.5` across GT (filter pills, action buttons, reactions, quiz), Home (failure pills + `min-h-[44px]`), Explore/Agents/Systems sidebar items, Concepts mobile strip. Scale: unchanged. |
| May 2026 sprint 10 | Home.jsx radical simplification — 1083 lines → ~367 lines (66% cut). Removed: PATHS, SuggestedPath, LEARNING_PATHS, MODULE_MAP, DEP_NODES/EDGES, ConceptGraph, journey strip, social proof, learning paths section, concept graph section, module map section, how-to, about, email capture, `useMemo`. Kept: hero + glow + door cards + continue CTA, stats row + failure pills, daily tip, footer. Dead state variables removed: `role`, `switchRole`, `orderedGroups`, `activePath`, `pathRole`, `showPath`, `expandedModule`, `subEmail`, `subStatus`, `pathProgress`. Scale: unchanged. |
| May 2026 sprint 11 | TYU fix: `preplabInitialMode` state in App.jsx; `initialMode` + `onClearInitialMode` props in PrepLab.jsx; useEffect auto-selects Trainer mode when navigated from RAG Lab forward pointer. Hero copy rewrite: gradient headline "Configure it. Break it. Know exactly why." — Layer 3 badge removed. `InterviewPrepMode` (3 phases): JD paste → SKILL_KEYWORDS detection + topic ranking by hit-weight → self-rate each topic → gap-scored 20q drill (DRILL_W = {weak:3, okay:1.5, strong:0.5} × jd_weight) → Results + gated Phase 4 study plan teaser. JDPrepMode replaced. `serving` topic added to TOPIC_LABELS. Scale: unchanged. |
| May 2026 sprint 12 | `WeaknessHeatmapMode` in PrepLab: reads `gsl-preplab-history`, per-topic accuracy bars sorted worst-first, "Hard Questions" view showing most-missed. `recordHistory()` helper shared across modes. `GateModal` unlock animation: scale+fade+radial pulse sequence (1.4s total). Concepts Gym: `MASTERY_KEY = "gsl-concepts-mastery"`, `MODULE_NEXT_STEP` lookup (13 modules → lab/module forward pointers), `GymPanel` component with FOUNDATION/APPLICATION/PRACTICE accordion, per-module Start/Revisit, "Next up" recommendation, progress bars. ✓ badge per completed module in ConceptsApp. "Mark complete" / "✓ Completed" in module header. Scale: unchanged. |
| May 2026 sprint 13 | `Consultation.jsx` Search upgrade: button label "Ask →" → "Search →"; post count updated to "222+"; result limits widened (posts 5→7, modules 3→4); `highlightText()` helper bolds matched keywords in post descriptions; zero-results state shows 5 suggested query pills. `Concepts` added to KNOWLEDGE NAV_GROUP (count: 15); KNOWLEDGE group moved above LABS — logical reading order (understand → build → grow). Scale: unchanged. |
| May 2026 sprint 14 | Concepts framing text pass (15/15 modules): before-the-interactive framing block added to all 15 modules. FlashAttention, NextToken, Temperature had instruction-style callouts replaced with real conceptual framing. Remaining (inline callouts + synthesis close) tracked in UPGRADES.md. Scale: unchanged. |
| May 2026 sprint 15 | Concepts gym skeleton shipped: `GymSelectorView` (5-card grid with progress bars, coming-soon state), `GymRoomView` (PAL-style sequential module cards with insight teasers + time estimates), `ConceptsApp` rewritten as 3-view state machine (selector → room → module). `MODULE_META` constant (15 entries). `GYMS` constant (5 gyms: Language Models 7 modules, Retrieval 5, AI Agents 3, Evaluation + Production Systems as placeholders). Sidebar shows current gym's modules when in module view. Lab forward pointer in GymRoomView footer. Scale: unchanged. |
| May 2026 sprint 16 | Dynamic homepage: `Home.jsx` detects returning vs. new user from localStorage on mount (`getActivityData()` reads 4 localStorage keys). New users see existing hero. Returning users see `ReturningHomeView`: date/greeting header, Today section (daily tip card + GT featured post card), Jump Back In (last 3 unique tabs), Progress snapshot (PrepLab + Concepts Gym bars), Where to Next (3 quick-entry cards). `TAB_META` constant maps tab IDs to labels + colors. `onNavigateTo` wired for GT post deep-link. Scale: unchanged. |
| May 2026 sprint 17 | Concepts gym expansion: GYMS 5 → 14 rooms. 3 active (Language Models, Retrieval, AI Agents). 11 coming-soon placeholders with color, desc, labId, labLabel. Concepts ↔ Labs bidirectional connection: `conceptsGym` state + `gymId` param in `navigateTo`. `initialGym` prop + `useEffect` in ConceptsApp deep-links into correct gym. Quiet sidebar chips added: RAG Lab → "Concepts: Retrieval →" (blue), Agent Lab → "Concepts: AI Agents →" (amber), LLM Lab → "Concepts: Language Models →" (indigo). Scale: unchanged. |
| May 2026 sprint 18 | Guiding text pass — 3-beat standard (setup framing + inline callouts + synthesis close) applied to all 49 active lab modules/scenarios. RAG Lab: `setup_framing[]` + `synthesis_close` fields added to all 6 scenarios; `PreEvalCallout` component (Beat 2 — fires on failure mode + metric thresholds); Beat 1 + Beat 3 rendered in scenario panel. LLM Lab: framing blocks added to all 9 modules. Agent Lab: framing blocks added to all 16 modules. Eval Lab: framing blocks added to 15 active modules. Scale: unchanged. |
| May 2026 sprint 19 | Mobile optimization pass: all guiding text framing blocks made responsive across 6 files. Beat 1 containers `p-3.5 space-y-2` → `p-3 sm:p-3.5 space-y-1.5`; label `tracking-widest` → `tracking-wide leading-snug`; second paragraph hidden on mobile (`hidden sm:block`). RAG Lab PreEvalCallout: same responsive treatment. Sibling repo deep read: `ml-systems-lab` + PAL fully read (CLAUDE.md, IDEAS.md, DECISIONS.md). 15 cross-product features logged in IDEAS.md. UPGRADES.md: 5 new entries. Scale: unchanged. |
| May 2026 sprint 20 | Home.jsx footer cleanup: beta banner, "Built by Sidharth Kriplani", "No login" disclaimer, footer feedback button removed. Footer: "Also by the same team" sibling links only, `border-t border-zinc-800/60` divider, indigo box-shadow glow, `mt-auto` pinned. Automated bug sweep (Audit 37): `Playground.jsx:450` optional chain fix (`.find(o => o.hallucination)?.id`). Scale: unchanged. |
| May 2026 sprint 22 | GAL structural overhaul — all 4 phases. Product renamed GAL in sidebar logo. `NAV_GROUPS` rebuilt: BUILD (4 Labs) / PROVE (PrepLab) / NAVIGATE (Career + AI Product) / KNOWLEDGE (Concepts + GT). `ALL_TABS` group constants updated. Home.jsx door card labels updated: "Engineer" → "BUILD", "Interview Prep" → "PROVE", "Career / PM" → "NAVIGATE". `ProgressView` fully rewritten: three-lane layout (BUILD / PROVE / CONCEPTS). `FidelityBadge` component added to App.jsx, Agents.jsx, Systems.jsx — Variant A (✓ Scenario-accurate, emerald) for 11 modules across 4 labs, Variant B (~ Simulated, zinc) for all others. DECISIONS.md updated with primary user + nav architecture. Scale: unchanged. |
| May 2026 sprint 23 | GAL visual redesign — 4 fronts. (1) CSS accent vars: `--gal-build/prove/navigate/knowledge` added to `:root`; NAV_GROUPS color strings updated to `var()`. (2) Sidebar collapse: `collapsedGroups` Set + `toggleGroup()`; group header is clickable with chevron + item-count badge; animated via max-height inline style; desktop + mobile. (3) Home hierarchy: BUILD door card full-width dominant with 4 lab pills; PROVE + NAVIGATE secondary side-by-side; stats row removed; NAVIGATE color amber (was violet). (4) Lab shell consistency: RAG Lab sidebar header promoted to text-base; `ragDone` Set + `gsl-rag-done` localStorage + progress bar; Eval Lab gets GT chip. Premium animations added to index.css: tabFadeIn, fillBar, cardSlideUp with stagger delays, card-lift hover, Inter optical alternates, negative heading tracking. Scale: unchanged. |
| May 2026 sprint 24 | Full elevation token system — PAL-parity visual overhaul. Phase 1: `--bg` (#111520), `--surface` (#191e30), `--surface-2` (#1f2438), `--border` (#3d4668), `--border-subtle` (#2a3255) added to `:root`. App.jsx root div, both sidebars, RAG Lab inner sidebar, header, all modals (search/feedback/leaderboard/shortcuts) converted to tokens. Home.jsx all door cards, Today section, Continue button use `--surface-2`/`--border` — gradient overlays removed. Phase 2: `--color-zinc-900: #191e30` added to `:root` — single-declaration remap that converts 300+ `bg-zinc-900` panel backgrounds app-wide from cold `#18181b` to blue-tinted `#191e30` (same technique as sprint 8 zinc-500/600 contrast fix). All 5 lab sidebar shells (Systems, Agents, PrepLab, Concepts + RAG Lab in App.jsx) converted to `var(--surface)` + `var(--border)`. Net: GAL elevation system now matches PAL — bg → surface (sidebar) → surface-2 (cards) → border. Scale: unchanged. |
| May 2026 sprint 25 | No code shipped. Analysis + MD sync session. Read a third-party assessment of all three sibling labs (GAL, ML Systems Lab, PAL) for Quantiphi + Meesho interview prep. Assessment validated GAL's failure simulation mechanic and "feels like a real product" positioning, and identified one concrete ceiling: "excellent for production AI judgment, weaker for proving real backend/cloud execution." Bridge formula identified: lab concept → AWS service → client architecture → tradeoffs/failure modes. Four adaptations derived and logged: (1) "Maps to production" callout on root-cause cards (productionNote field per scenario, S effort), (2) Company-specific architecture layer in PrepLab Company Tracks, (3) "Your Interview Story" collapsible block on done cards, (4) single real execution artifact (FastAPI + ChromaDB demo repo linked from RAG Lab done card). MD files updated: IDEAS.md (new "Diagnosis-sourced adaptations" cluster in Tier 1), UPGRADES.md (two new S-effort High-priority entries), DECISIONS.md (Section 6 — format integrity rule: failure simulation must not converge with case-study format), NEXT.md (two quick-win items added to "If time allows" section). Scale: unchanged. |
| May 2026 sprint 26 | Concepts.jsx deep interactivity pass. AttentionModule rebuilt as 3-tab QKV interactive: (1) QKV breakdown slider — attend to any token, see Q/K/V vectors per head live; (2) Softmax heatmap — 8-token attention matrix visualized as heat cells; (3) Multi-head patterns — 4 head specialization types with pattern grids. TokenizerModule: BPE Algorithm tab added — shows merge rules step-by-step on any input, merge history list, vocabulary growth animation. ContextWindowModule: "Lost in the Middle" tab added — 12-chunk retrieval with position-based recall heatmap showing U-shaped recall curve, interactive position slider. Scale: unchanged. |
| May 2026 sprint 28 | Concepts Gym — 4 module depth upgrades. (1) TemperatureGame: "Live Logit Shaper" tab added — 3 preset prompts (factual/contested/creative), temperature slider 0.1→2.0, real-time softmax bar chart per token, entropy display with contextual description. `LOGIT_EXAMPLES` + `computeSoftmax` helpers added as module-level constants. (2) RAGPipelineModule: "What Breaks" tab added — `RAG_FAILURE_SCENARIOS` constant (stale retrieval, noise injection/top_k too high, context grounding failure); each scenario has trigger, normal vs broken context comparison, "Inject failure" button revealing output comparison + diagnosis + production fix. (3) FlashAttentionConcept: "Tile Traversal" tab added — 5×5 tile grid animating in reading order (350ms/tile), per-step SRAM panel showing active tile + HBM write counter, Play/Pause/Step/Reset controls, "exact attention, not approximation" key insight callout. Renamed existing tab to "Memory Calculator". (4) EmbeddingModule: "Similarity Search" tab added — `EMB_QUERIES` constant (5 preset query topics with anchor coordinates), top_k slider 1→12, cosine similarity ranked results with category badges, noise injection warning at top_k>6. All brace diffs: 0. Commit: `7f0a88d`. Scale: unchanged. |
| May 2026 sprint 30 | 4 NEXT.md items completed. (1) RAG Lab done card prominence fix: forward pointer moved immediately after Failure Mode block in `App.jsx` — now visible on evaluation without scrolling. (2) Concepts Gym `GymRoomView` progress bar + next module CTA: N/total count, percentage bar, "Continue: [next module] →" button detecting first incomplete module, "All done" state. (3) PrepLab keyboard shortcuts: `useEffect` keydown listeners in `ExamMode` + `TrainerMode` — 1/2/3/4 selects MCQ option, Enter submits/advances. (4) `EvalLoopModule` built: 3-tab module (3 eval questions walkthrough, RAGAS 4-metric cards, 3 broken eval run debugs with root-cause diagnosis). Wired into MODULES, retrieval gym (5→6 modules), MODULE_META, MODULE_NEXT_STEP. Brace diffs: 0. Commit `ada9b79`. Scale: 16 Concepts modules.
| May 2026 sprint 29 | No code shipped. Architecture + planning session. Evaluated datamart-backed realism concept — whether GAL should use static document corpora and/or in-browser execution environments (Pyodide, Marimo) to add realism to lab scenarios, sourced from a cross-product discussion comparing StrataScratch-style SQL practice, PAL-style datamarts, and MSL-style Pyodide notebooks. Decision: static JSON corpus for RAG Lab + Eval Lab is the correct Tier 1 move (zero execution cost, renders real retrieved chunks + eval triples, 80% of realism gain at 10% complexity); Pyodide for Eval Lab fixed notebooks is Tier 2 (conditional on static data shipping + engagement signal); Marimo is wrong for in-browser use (standalone notebook breaks lab frame) but valid as downloadable companion content (GitHub link on done card). Scope constraint enforced: Agent Lab and LLM Lab excluded — their failure modes are behavioral and distributional, not corpus-dependent. All decisions logged: DECISIONS.md Section 7 (data realism + execution ruling), IDEAS.md (new Tier 1 cluster + new Tier 2 items), NEXT.md (pending item added), CLAUDE.md (sprint log). Scale: unchanged. |
| May 2026 sprint 27 | GAL visual identity — electric cyan rebrand + one-accent sidebar discipline. (1) index.css: `[data-palette="luna"]` block updated — all violet-* CSS custom properties remapped to Tailwind's electric cyan scale (--color-violet-400: #22D3EE, S=86% vs prior S=54%); `--bg: #05060E`, `--surface: #080A14`, `--surface-2: #0C0E1A` updated to near-void black; LUNA glow system added (text-shadow on violet-400/300, box-shadow on border-violet-500, inset glow on bg-violet-950/900). (2) Home.jsx: 6 hardcoded rgba/hex values updated from muted teal to electric cyan. (3) App.jsx: NAV_GROUPS all 4 group colors → neutral `#52525b`; active sidebar item hardcoded single cyan gradient + box-shadow; visited dots → `var(--gal-build)` at 0.45 opacity — eliminates the 4-color group accent system. (4) Systems.jsx: SYSTEMS_GROUPS DESIGN/BUILD/OPS all → `#52525b`. (5) systems/modules.jsx: EVAL_CASES 6 category badges + STRATEGY_SCENARIOS 5 card colors → all `#22D3EE`; all semantic/chart/status colors preserved. Commits: `48e5de6`, `6aa41f0`, `1b972b4`, `36a4360`, `9fce4d3`. Scale: unchanged. |

---

*Last updated: May 2026 (sprint 30)*
