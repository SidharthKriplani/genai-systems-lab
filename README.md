<div align="center">

<br />

<img src="https://img.shields.io/badge/GENAI-SYSTEMS%20LAB-7c3aed?style=for-the-badge&labelColor=18181b&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek0xMSAxN3YtNkg5bDMtNCAzIDRoLTJ2NnoiLz48L3N2Zz4=" />

<br /><br />

<h2>GenAI Systems Lab</h2>

<p>The interactive lab for AI engineers and product managers who want to build,<br/>ship, and reason about production AI systems with precision.</p>

<br/>

[![Live](https://img.shields.io/badge/Live%20App-genai--systems--lab.vercel.app-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://genai-systems-lab-ivory.vercel.app)

<br/>

![React](https://img.shields.io/badge/React%2018-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Static](https://img.shields.io/badge/zero%20backend-18181b?style=flat-square)
![Free](https://img.shields.io/badge/free%20forever-22c55e?style=flat-square)
![License](https://img.shields.io/badge/MIT-zinc?style=flat-square)

<br/>

```
11 tabs  ·  77+ modules  ·  200+ challenges  ·  zero backend  ·  no login
```

<br/>

</div>

---

## What this is

GenAI Systems Lab is a **static, browser-only** learning tool — no API calls, no live model, no account required. Everything runs in your browser.

The goal is **systems intuition**: understanding how production AI systems fail, how to configure them correctly, and how to reason about trade-offs before you hit them on the job.

> Not another concept explainer. You configure the system. You watch it fail. You fix it.

---

## Start Here — recommended first journey (~45 min)

If you're new, follow this path before anything else:

| Step | Module | What it builds |
|------|--------|---------------|
| 1 | **Tokenizer** → Concepts | How text becomes numbers — the first transformation in every LLM |
| 2 | **Embeddings** → Concepts | Meaning as geometry — why semantic search works |
| 3 | **Context Window** → Concepts | Attention cost, overflow, what happens when you run out |
| 4 | **RAG Flows** → Flows | Full end-to-end pipeline, animated |
| 5 | **RAG Failure Lab** → RAG Lab | Configure a system and watch it break in five different ways |
| 6 | **Agent Loop** → Concepts | Step through a ReAct trace — Thought → Action → Observation |
| 7 | **Debug RAG** → Concepts | Five production incidents, symptom only — diagnose the root cause |

The **Begin →** button on the home page launches this journey.

---

## What's inside

### LEARN

| Tab | Modules | What you'll find |
|-----|---------|-----------------|
| **Concepts** | 11 | Tokenizer, Embeddings, Attention, Transformer, Chunking, Sampling, Context Window, Agent Loop, Guardrails, Debug RAG, Multi-Agent — with interactive diagrams, sliders, and credibility badges |
| **Flows** | 6 | Animated pipelines: RAG, Agent Loop, Context Window, Guardrail Pipeline, Transformer Block, RAG Architectures (Hybrid/CRAG/Agentic) |

### BUILD

| Tab | Modules | What you'll find |
|-----|---------|-----------------|
| **RAG Lab** | 5 scenarios | Production failure simulator — stale retrieval, hallucination, prompt injection, context overflow, multi-hop failure. Configure → observe → diagnose |
| **Agents** | 7 | ReAct Pattern, Tool Use Design + MCP Protocol, Agent Memory, Multi-Agent Patterns, Failure Modes, Planning Patterns, Agent Loop Simulator |
| **Systems** | 15 | Evals Lab, Eval Frameworks, Model Strategy, Should You Use AI?, Cost/Latency, Fine-Tuning, India Scale, Prompt Caching, Model Router, Inference Optimizer + Decision Framework, Context Compaction, Incident Room, Observability, A/B Testing, ML CI/CD |
| **Playground** | 5 | Injection attacks, chunking strategies, reranker, hallucination spotting, bias detection |
| **Explore** | 8 | Embedding Space, Shadow A/B, Latency Planner, Tokenizer Explorer, Model Card Reader, Vector DB Comparison, Structured Outputs, Red Teaming Lab |

### GROW

| Tab | Modules | What you'll find |
|-----|---------|-----------------|
| **Fluency Gym** | 5 | Phrase bank, timed drills, mock interview (18 questions, 90s each), company case arena, prompt engineering lab |
| **AIPM Track** | 5 | PRD simulator, roadmap prioritizer, stakeholder explainer, launch checklist, AI-or-not? decision framework |
| **Career Track** | 5 | System design interviews, take-home challenges, negotiation flashcards, benchmark literacy |

---

## Learning paths

Four curated sequences — or explore freely with **⌘K search**.

| Path | Time | Built for |
|------|------|-----------|
| **AI Engineer** | ~6 hrs | Production RAG, agents, guardrails, evals |
| **AI Product Manager** | ~4 hrs | PRDs, roadmaps, stakeholder communication, shipping |
| **Interview Prep** | ~3 hrs | System design round, LLM trivia, mock interview |
| **Quick Reference** | Self-directed | Fast lookup when you need a specific decision framework |

Progress is tracked per-tab in `localStorage` — no account, no sync, no tracking of any kind.

---

## Features

| Feature | How to use |
|---------|-----------|
| **⌘K search** | Jump to any of the 77+ modules instantly |
| **Start Here journey** | 7-step guided path on the home page |
| **Challenge Log** | 🏆 button in nav — your pass/fail record across all scored challenges |
| **Share Score** | Copy your challenge score to clipboard from the Challenge Log |
| **What's New** | NEW button in nav — recent additions log |
| **? Shortcuts modal** | Press `?` — full keyboard shortcut reference |
| **Credibility badges** | Every Concepts and Explore module shows its fidelity tier |
| **Progress bars** | Learning path cards show % of tabs visited |
| **Mobile nav** | Hamburger menu with full navigation on small screens |
| **Deep-linking** | ⌘K results navigate directly into the correct sub-module |

---

## Fidelity model

Every interactive module is tagged with one of three fidelity tiers so you always know what you're looking at:

| Badge | Meaning | Examples |
|-------|---------|---------|
| `✓ Mathematically faithful` | Real algorithm logic on toy inputs | Tokenizer, Sampling, Latency Planner |
| `~ Simplified` | Correct pattern, simplified scale — not frontier-model internals | Attention, Transformer, Agent Loop, RAG scenarios |
| `◌ Conceptual` | Illustrative only — useful for intuition, not introspection | Embedding Space (precomputed 2D coords, not live model embeddings) |

RAG Lab scenarios are drawn from real production failure patterns. The goal is **systems intuition** — understanding why systems fail, not exact model introspection.

---

## Tech stack

```
React 18          UI framework
Vite 6            Build tool + dev server
Tailwind CSS v4   Styling (@tailwindcss/vite, no PostCSS required)
Vercel            Deployment (free tier)
localStorage      Progress, scores, and preferences — client-side only
```

Zero backend. Zero API calls. Zero cost. Everything compiles to static files.

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

---

## Repository structure

```
src/
├── App.jsx              # Root — nav, routing, search modal, challenge log, what's new
├── Home.jsx             # Home page — hero, start here journey, learning paths, about
├── Concepts.jsx         # 11 concept modules with fidelity tags
├── Flows.jsx            # 6 animated pipeline diagrams
├── Flows_RAGLab.jsx     # RAG Lab — 5 production failure scenarios
├── Agents.jsx           # 7 agent modules + loop simulator
├── Systems.jsx          # 15 systems modules — evals through context compaction
├── InferenceOptimizer.jsx  # Inference decision framework (extracted component)
├── IndiaScale.jsx       # India-scale cost lab (extracted component)
├── ModelRouter.jsx      # Model router lab (extracted component)
├── MLCiCd.jsx           # ML CI/CD lab (extracted component)
├── Explore.jsx          # 8 exploration tools with fidelity tags
├── Playground.jsx       # 5 hands-on challenge modules
├── Fluency.jsx          # Fluency gym + mock interview
├── AIPM.jsx             # AI product manager track
├── Career.jsx           # Career track — system design + negotiation
└── HowTo.jsx            # Shared HowTo component used across all modules
public/
└── og-image.png         # Open Graph image for WhatsApp/Twitter link previews
```

---

## Design decisions

Full rationale behind every major product and architecture decision is in [`DECISIONS.md`](DECISIONS.md).

---

<div align="center">

<br/>

Built by [Sidharth Kriplani](https://github.com/SidharthKriplani)

<br/>

*Static. Honest. No fluff.*

<br/>

</div>
