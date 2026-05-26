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

---

*Last updated: May 2026*
