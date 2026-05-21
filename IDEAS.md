# IDEAS — Future Depth & Improvements

Prioritized backlog of ideas not yet built. Organized by effort and impact. Updated after each build session.

*Last updated: May 2026 | Current scale: 48+ Systems modules, 19 Explore, 183+ PrepLab questions, 202+ GT posts*

---

## Curriculum-Inspired Tracks (Idea Dump)

Topics and structures borrowed from major AI curricula — not built yet, just captured for reference. These are content ideas that complement existing modules rather than replace them.

### Stanford CS336 / CS324 (LLMs) — topics we can deepen
- **Pretraining data pipelines** — Common Crawl filtering, deduplication, tokenizer training. CS336 covers this at implementation depth; we have nothing equivalent.
- **Training at scale** — Gradient accumulation, mixed-precision (bf16/fp16), distributed training (DDP vs FSDP vs pipeline parallelism). Currently missing entirely.
- **Scaling laws** — Chinchilla compute-optimal curves, how to pick model size vs. token budget. One of the most practically useful things to know.
- **RLHF implementation depth** — We have the concept; CS336 goes into reward modelling, KL divergence penalty, online vs offline RLHF variants.
- **Benchmark design** — MMLU, HellaSwag, BIG-Bench. How they work, why they fail, how to read them critically.

### Stanford CS229 / Coursera ML Specialization — foundations we skip
- **Bias-variance tradeoff in LLM context** — How this classic ML concept maps to prompting, few-shot, fine-tuning decisions.
- **Cross-validation for LLM evals** — How to split train/test/eval properly when data is expensive.
- **Regularization analogs** — Dropout in transformers, weight decay, early stopping. Useful for fine-tuning modules.

### DeepLearning.AI Specializations — practical gaps
- **MLOps for LLMs** — CI/CD for model changes, staging environments, canary deploys. Beyond our current observability module.
- **Deployment patterns** — Blue-green for models, shadow mode testing, feature flags for model versions. High-frequency production decision.
- **Data flywheel** — How to systematically collect user feedback to improve models over time. The product loop most teams skip.
- **LangChain / LlamaIndex** — We deliberately stay framework-agnostic, but a "framework comparison" Explore module could be valuable.

### fast.ai approach — intuition first
- **Build before theory** — fast.ai starts with a working model then explains why. We could add a "build a tiny RAG in 20 lines" module that front-loads hands-on before any theory.
- **Practical fine-tuning** — fast.ai covers learning rate finders, gradual unfreezing. These translate directly to LoRA fine-tuning decisions.

### Missing from all curricula (our unique angle)
- **Production incident retrospectives** — What Stanford/Coursera don't teach: how real systems fail at 2am and what the postmortem looks like. Our Incident Room is the seed of this.
- **The PM × Engineer handoff** — No curriculum covers how to write specs that engineers can actually build, or how to challenge estimates. Our AIPM track is the only thing like it.
- **Cost as a first-class concern** — Academic curricula ignore inference cost, token budgets, and batch vs. realtime tradeoffs entirely. We already cover this; it's a differentiator.

---

## Tier 1 — High Impact, Buildable Now

### Systems modules (new)
- ~~**GRPO / Agent RL Training**~~ ✅ *built May 2026*
- **Evaluation Metrics Deep-Dive** — ROUGE, BLEU, BERTScore, G-Eval, LLM-as-judge. Interactive metric comparison with example outputs. No module covers this well yet.
- **Long Context Patterns** — Needle-in-haystack, chunk-then-summarize, map-reduce. The practical engineering patterns for 100K+ token contexts.
- **AI Safety Engineering** — Jailbreak patterns, adversarial prompts, red-teaming frameworks. Different from the existing AI Red Teaming module (which is strategy) — this is implementation.
- **Vector Database Engineering** — Pinecone vs Weaviate vs pgvector vs Chroma comparison, indexing strategies, filtering, hybrid search. High-frequency production decision.
- **Prompt Injection Defense** — Attack patterns, defense strategies, prompt hardening. Rising importance as agents interact with untrusted content.

### Systems modules (depth improvements)
- **Evals Lab** — Add "write your own eval" builder: user defines metric, weights, test cases, sees score. Currently too passive.
- **Context Compaction** — Add live compaction simulator: user adjusts conversation length, sees token count, triggers compaction, sees output quality change.
- **Agent Architecture** — Add multi-agent orchestration interactive (orchestrator dispatches to workers, see the message flow). Currently only single-agent.

### Explore modules
- **Model Architecture Comparison** — Encoder-only (BERT) vs Decoder-only (GPT) vs Encoder-Decoder (T5). When to use each. Static reference table + use-case wizard.
- **Tokenizer Comparison** — BPE vs WordPiece vs SentencePiece vs tiktoken. Token counts for the same text across tokenizers. Interactive demo.
- **Hardware Reference** — A100 vs H100 vs RTX 4090 vs TPU v4: FLOPS, memory bandwidth, HBM, cost/hr. The table ML engineers actually need.

### PrepLab
- **Scenario-type questions** — Multi-turn conversational scenarios where the user debugs a failing system across 3-4 exchanges. Higher fidelity than MCQ.
- **More system design text questions** — Cover: vector DB selection, agent reliability, eval harness design, fine-tuning decision framework.

### Ground Truth posts
- ~~**"Why the Best Model on the Benchmark Isn't the Best Model for Your Product"**~~ ✅ *built May 2026 — id: benchmark-vs-business*
- ~~**"Hard Negatives: The Training Trick That Actually Improves Retrieval"**~~ ✅ *built May 2026 — id: hard-negatives-retrieval*
- **"What Actually Happens During Pretraining"** — Data curation, tokenizer training, architecture decisions, compute budget. The upstream of everything else.
- **"The Eval Crisis: Why Most AI Evals Are Wrong"** — Benchmark contamination, eval-train leakage, Goodhart's Law in AI. Opinionated take.
- **"Why Your RAG System Lies"** — Faithfulness failures, hallucination in retrieval-augmented contexts, practical mitigations.
- **Series: "The Inference Stack"** — Four posts covering the full serving pipeline: quantization → KV cache → speculative decoding → serving infrastructure. Already have individual modules, need the cohesive narrative.

---

## Tier 2 — High Impact, More Effort

### New features
- ~~**PrepLab spaced repetition**~~ ✅ *built*
- ~~**Module search**~~ ✅ *built (Systems search bar)*
- ~~**"Learning paths"**~~ ✅ *built (6 paths, Learning Paths tab)*
- **GT reading mode improvements** — Table of contents per post, estimated reading time progress indicator, related posts sidebar.

### Systems improvements
- **Explore grouping** — Apply the same DESIGN/BUILD/OPS group structure to Explore (14 modules, getting long). Currently flat list.
- **Systems module search** — Filter pills by keyword as you type. Useful at 38+ modules.

### Architecture
- **Split modules.jsx further** — Currently 9,500 lines. Could split by group: `src/systems/build.jsx`, `src/systems/ops.jsx`, `src/systems/design.jsx`. Low urgency (Vite handles it fine, file tools work with offset/limit).
- **Lazy loading** — Import each module component dynamically (`React.lazy + Suspense`). Would improve initial load time. Low priority since Vite bundles well.

---

## Tier 3 — Interesting, Lower Priority

- **Community features** — Upvotes on GT posts, comments, "found this helpful". Needs backend. Out of scope for static app.
- **Export** — "Export my PrepLab session" to PDF/CSV. Nice to have.
- **Dark/light toggle** — Currently dark-only. Some users prefer light mode.
- **Mobile app** — PWA manifest exists. Could push to make it more native-feeling on mobile.
- **User accounts** — Cross-device progress sync. Needs backend. Significant scope increase.
- **AI tutor mode** — User answers PrepLab question, AI gives personalized feedback rather than static explanation. Needs API key handling.

---

## Retired Ideas

Ideas that were considered and consciously not built:

- **CHANGELOG.md** — Auto-generated from git log has no real value; LINEAGE.md covers build history better.
- **ROADMAP.md** — Too high maintenance for a fast-moving solo project; IDEAS.md is the living replacement.
- **TypeScript migration** — Would break Vercel builds with current setup. Not worth the migration cost.
- **External UI library (shadcn, MUI)** — Added bundle weight and design constraints. Hand-rolled components are fine.

---

## How to Use This File

When starting a new build session:
1. Pick ideas from Tier 1 that fit the session's theme
2. After building, move completed ideas to LINEAGE.md
3. Add new ideas that emerged during the session to the appropriate tier
4. Promote ideas from Tier 2→1 when adjacent modules make them easier to build
