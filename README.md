<div align="center">

<br />

<h1>⚗️ GenAI Systems Lab</h1>

<p><strong>Most AI learning tells you what to do.<br/>This makes you configure the system and watch it fail. Then tells you exactly why.</strong></p>

<br/>

[![Live App](https://img.shields.io/badge/Live%20App-Open%20the%20Lab-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://genai-systems-lab-ivory.vercel.app)

<br/>

![React](https://img.shields.io/badge/React%2018-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Zero Backend](https://img.shields.io/badge/zero%20backend-18181b?style=flat-square)
![Free](https://img.shields.io/badge/free%20forever-22c55e?style=flat-square)
![License](https://img.shields.io/badge/MIT-zinc?style=flat-square)

<br/>

```
11 tabs  ·  77+ modules  ·  200+ challenges  ·  zero backend  ·  no login
```

</div>

---

An engineer configures a RAG system. `top_k=1`, no reranker, helpful answer policy.
It retrieves a 3-year-old policy document and answers confidently.
The answer is wrong. Nobody catches it until the complaint arrives.

**This lab teaches you to catch it before it ships.**

Five curated RAG failure scenarios. Inference bottleneck diagnosis. Agent loop step-through. Eval design. MCP protocol. Context compaction. Sixteen production systems modules. All interactive. All in your browser. No account, no backend, no cost.

→ [**Open the lab**](https://genai-systems-lab-ivory.vercel.app)

---

## What this is

A systems intuition tool, not a course. It models how production AI systems actually fail — misconfigured retrieval, stale documents, prompt injection, context overflow, agent loops gone wrong — and puts you in the position of configuring, diagnosing, and fixing them.

Not a video. Not a blog post. Not a quiz. You make decisions, the system responds, you see the consequence.

---

## Start Here — first journey (~45 min)

| Step | Module | What it builds |
|------|--------|----------------|
| 1 | **Tokenizer** → Concepts | How text becomes numbers — the first transformation in every LLM |
| 2 | **Embeddings** → Concepts | Meaning as geometry — why semantic search works at all |
| 3 | **Context Window** → Concepts | O(n²) attention cost, overflow, what dies when you run out |
| 4 | **RAG Flows** → Flows | Full end-to-end pipeline, animated step by step |
| 5 | **RAG Failure Lab** → RAG Lab | Configure a system and watch it break in five different ways |
| 6 | **Agent Loop** → Concepts | Step through a ReAct trace — Thought → Action → Observation |
| 7 | **Debug RAG** → Concepts | Five production incidents, symptom only. Diagnose the root cause |

---

## The 11 tabs

| Tab | Modules | What you'll find |
|-----|---------|-----------------|
| 🧠 **Concepts** | 11 | Tokenizer, Embeddings, Attention, Transformer, Chunking, Sampling, Context Window, Agent Loop, Guardrails, Debug RAG, Multi-Agent — interactive diagrams, sliders, credibility badges |
| 🌊 **Flows** | 6 | Animated pipelines: RAG, Agent Loop, Context Window, Guardrail Pipeline, Transformer Block, RAG Architectures (Hybrid / CRAG / Agentic) |
| 🔬 **RAG Lab** | 5 scenarios | Production failure simulator — stale retrieval, hallucination, prompt injection, context overflow, multi-hop. Configure → observe → diagnose |
| 🤖 **Agents** | 7 | ReAct Pattern, Tool Use Design + MCP Protocol, Agent Memory, Multi-Agent Patterns, Failure Modes, Planning Patterns, Loop Simulator |
| ⚙️ **Systems** | 15 | Evals, Eval Frameworks, Model Strategy, Should You Use AI?, Cost/Latency, Fine-Tuning, India Scale, Prompt Caching, Model Router, Inference Optimizer, Context Compaction, Incident Room, Observability, A/B Testing, ML CI/CD |
| 🛝 **Playground** | 5 | Injection attacks, chunking comparison, reranker, hallucination spotting, bias detection |
| 🔭 **Explore** | 8 | Embedding Space, Shadow A/B, Latency Planner, Tokenizer Explorer, Model Card Reader, Vector DB Comparison, Structured Outputs, Red Teaming Lab |
| 💬 **Fluency** | 5 | Phrase bank, timed drills, mock interview (18 questions, 90s each), company case arena, prompt engineering lab |
| 📋 **AIPM** | 5 | PRD simulator, roadmap prioritizer, stakeholder explainer, launch checklist, AI-or-not? decision framework |
| 🚀 **Career** | 5 | System design interviews, take-home challenges, negotiation flashcards, benchmark literacy |
| 🏠 **Home** | — | Start Here journey, learning paths, progress tracking, module map |

---

## Why different from other resources

| | YouTube / blog | DeepLearning.AI | fast.ai | **This** |
|--|:-:|:-:|:-:|:-:|
| Your configuration, your consequence | ✗ | ✗ | ✗ | ✓ |
| Production failure simulation | ✗ | ✗ | ✗ | ✓ |
| No account or login | ✓ | ✗ | ✗ | ✓ |
| Zero backend, fully static | ✓ | ✗ | ✗ | ✓ |
| Honest fidelity disclosure | ✗ | ✗ | ✗ | ✓ |
| No ads, no upsells | ✓ | ✗ | ✗ | ✓ |
| Covers evals, inference, agents, MCP | ✗ | Partial | ✗ | ✓ |
| Free forever | ✓ | ✗ | ✓ | ✓ |

The gap that matters: every other resource **shows** you what to do. This one puts you in the seat and makes you decide — then shows you what broke and why.

---

## Key design decisions

**🔌 Zero backend, by design**
No API calls, no live model inference, no database. Every scenario uses curated configs and client-side logic. This is deliberate — a live API won't fail at exactly the right moment to teach prompt injection. Scripted scenarios are more reliable pedagogical tools than unpredictable model outputs. Static deployment means free to run, for anyone, indefinitely.

**🏷️ Fidelity tagging — every module is honest about what it is**
Three tiers, shown as a badge on every Concepts and Explore module:

| Badge | Meaning | Examples |
|-------|---------|---------|
| `✓ Mathematically faithful` | Real algorithm logic on toy inputs | Tokenizer (real BPE), Sampling (real softmax/top-K/top-P) |
| `~ Simplified` | Correct pattern, not frontier-model scale | Attention, Transformer, Agent Loop |
| `◌ Conceptual` | Illustrative only | Embedding Space (precomputed 2D coords, not live model embeddings) |

A user should never mistake a 2D embedding visualization for actual Claude attention geometry. The badge prevents that.

**📂 RAG Lab scenarios — drawn from real production failures**
The five failure cases (stale retrieval, hallucination, prompt injection, context overflow, multi-hop failure) are not invented for pedagogy. Each maps to a documented failure pattern in production RAG deployments. The configs, metric scores, and failure explanations reflect how these systems actually break.

**🧠 HowTo-first module design**
Every module opens with a `HowTo` component: what skill you're building, what the steps are. Never more than 3 steps. The learning objective is set before any interaction begins — users who skip it consistently get less out of the module.

**💾 localStorage for all persistence**
Progress tracking, challenge scores, dismissed state, and the challenge log persist client-side only. No sync across devices (accepted tradeoff). No GDPR obligations. No account friction. Users own their own data.

---

## What this is not

❌ **Not a live model introspection tool.** The Embedding Space shows precomputed 2D coordinates, not live GPT or Claude embeddings. The Attention module shows illustrative patterns, not actual transformer attention maps.

❌ **Not a certification platform.** There is no "AI Engineer Certified" badge. The Challenge Log tracks your own pass/fail record. That's all it claims to do.

❌ **Not financial, legal, or career advice.** Modules on cost/latency, India scale, and model strategy are educational frameworks, not professional recommendations.

❌ **Not comprehensive.** Real production AI systems are messier than any simulator. This builds intuition, not complete operational knowledge.

---

## Features

| Feature | How to access |
|---------|--------------|
| **⌘K search** | Jump to any of the 77+ modules instantly |
| **Start Here journey** | 7-step strip on the home page — Begin → |
| **Challenge Log** | 🏆 in the nav — your pass/fail record across all scored scenarios |
| **Share Score** | Copy your challenge score to clipboard from the Challenge Log |
| **What's New** | NEW in the nav — recent additions |
| **? Shortcuts** | Press `?` — full keyboard shortcut reference |
| **Credibility badges** | Every Concepts + Explore module shows its fidelity tier |
| **Progress bars** | Learning path cards show % of tabs visited |
| **Mobile nav** | Hamburger menu with full navigation on small screens |
| **Scroll fade** | Right-edge gradient on dense pill rows signals more items |

---

## Tech stack

```
React 18          UI framework
Vite 6            Build tool + dev server  
Tailwind CSS v4   Styling — @tailwindcss/vite plugin, no PostCSS config needed
Vercel            Deployment (free tier, static)
localStorage      Progress, scores, preferences — client-side only, no sync
```

Zero backend. Zero API keys. Everything compiles to static files deployable anywhere.

---

## Run locally

```bash
git clone https://github.com/SidharthKriplani/genai-systems-lab
cd genai-systems-lab
npm install
npm run dev
# → http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

Requires Node 18+. No environment variables. No API keys. No backend setup.

---

## Repository structure

```
src/
├── App.jsx                 # Root — nav, routing, ⌘K search, challenge log, what's new
├── Home.jsx                # Hero, Start Here journey, learning paths, about section
├── Concepts.jsx            # 11 concept modules with fidelity tags
├── Flows.jsx               # 6 animated pipeline diagrams incl. RAG Architectures
├── Flows_RAGLab.jsx        # RAG Lab — 5 production failure scenarios
├── Agents.jsx              # 7 agent modules + loop simulator + MCP protocol tab
├── Systems.jsx             # 15 systems modules — evals through context compaction
├── InferenceOptimizer.jsx  # Inference decision framework (extracted)
├── IndiaScale.jsx          # India-scale cost lab (extracted)
├── ModelRouter.jsx         # Model router lab (extracted)
├── MLCiCd.jsx              # ML CI/CD lab (extracted)
├── Explore.jsx             # 8 exploration tools with fidelity tags
├── Playground.jsx          # 5 hands-on challenge modules
├── Fluency.jsx             # Fluency gym + mock interview
├── AIPM.jsx                # AI product manager track
├── Career.jsx              # Career track — system design + negotiation
└── HowTo.jsx               # Shared objective-first component used across all modules
public/
└── og-image.png            # Open Graph image for WhatsApp / Twitter link previews
```

---

## Contributing

Issues and PRs welcome.

If you find a module that's factually wrong, a calculation that's off, or a scenario that doesn't reflect how production systems actually fail — please open an issue. Accuracy matters more than features.

Use these labels:
- 🔴 **Factual error** — wrong concept, wrong math, wrong failure explanation
- 🟡 **Clarity issue** — correct but confusing, misleading label, ambiguous UX
- 🔵 **Feature suggestion** — new module idea, UX improvement, accessibility

---

## Product decisions

Full rationale behind every major architecture and product decision — what was built, what was deliberately excluded, and why — is in [`DECISIONS.md`](DECISIONS.md).

---

<div align="center">

<br/>

Built by [Sidharth Kriplani](https://github.com/SidharthKriplani)

<br/>

*Static. Honest. No fluff.*

<br/>

</div>
