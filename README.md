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
15 Concepts modules  ·  16 Agent Lab modules  ·  54 Systems modules  ·  222+ posts  ·  261+ PrepLab questions  ·  zero backend  ·  no login
```

</div>

---

An engineer configures a RAG system. `top_k=1`, no reranker, helpful answer policy.
It retrieves a 3-year-old policy document and answers confidently.
The answer is wrong. Nobody catches it until the complaint arrives.

**This lab teaches you to catch it before it ships.**

Six curated RAG failure scenarios. Inference bottleneck diagnosis. Agent loop step-through. Eval design. MCP protocol. Context compaction. 150+ production systems modules. 222+ Ground Truth posts. 261+ PrepLab questions. All interactive. All in your browser. No account, no backend, no cost.

→ [**Open the lab**](https://genai-systems-lab-ivory.vercel.app)

---

## What this is

A **production AI judgment simulator**, not a course. It models how production AI systems actually fail — misconfigured retrieval, stale documents, prompt injection, context overflow, agent loops gone wrong — and puts you in the seat of configuring, diagnosing, and fixing them.

Not a video. Not a blog post. Not a quiz. You make a configuration decision, the system responds, you see the consequence and learn exactly why it happened.

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

## The 14 tabs

| Tab | Modules | What you'll find |
|-----|---------|-----------------|
| 🏠 **Home** | — | Start Here journey, learning paths, progress tracking, module map |
| 🧠 **Concepts** | 15 | Tokenizer (BPE), Embeddings, Attention (QKV+heatmap), Transformer, Chunking, Sampling, Context Window, Agent Loop, Guardrails, Debug RAG, Multi-Agent, Flash Attention, Next Token, Temperature, Context Compaction — interactive diagrams, sliders, credibility badges |
| 🌊 **Flows** | 6 | Animated pipelines: RAG, Agent Loop, Context Window, Guardrail Pipeline, Transformer Block, RAG Architectures (Hybrid / CRAG / Agentic) |
| 🔬 **RAG Lab** | 6 scenarios | Production failure simulator — stale retrieval, hallucination, prompt injection, context overflow, multi-hop, prompt injection via retrieval. Configure → observe → diagnose. Junior→Staff tiered scoring |
| 🤖 **Agents** | 16 | ReAct Pattern, Tool Use Design + MCP Protocol, Agent Memory, Multi-Agent Patterns, Failure Modes, Planning Patterns, Loop Simulator, AgentConfigLab, LangSmith Tracing, and more |
| ⚙️ **Systems** | 37+ | Evals, Eval Frameworks, Model Strategy, Cost/Latency, Fine-Tuning, India Scale, Prompt Caching, Model Router, Inference Optimizer, Context Compaction, Incident Room, Observability, A/B Testing, ML CI/CD, Debug Traces, Speculative Decoding, Streaming Patterns, Constrained Generation, Model Merging, and more |
| 🛝 **Playground** | 5 | Injection attacks, chunking comparison, reranker, hallucination spotting, bias detection + 30-entry prompt library |
| 🔭 **Explore** | 14 | Embedding Space, Shadow A/B, Latency Planner, Tokenizer Explorer, Model Card Reader, Vector DB Comparison, Structured Outputs, Red Teaming Lab, Embedding Model Selection + LLM Comparison Matrix |
| 💬 **Fluency** | 5 | Phrase bank, timed drills, mock interview (20 questions, 90s each), company case arena, prompt engineering lab |
| 📋 **AI Product** | 5 | PRD simulator, roadmap prioritizer, stakeholder explainer, launch checklist, AI-or-not? decision framework |
| 🚀 **Career** | 5 | System design interviews, take-home challenges, negotiation flashcards, benchmark literacy |
| 💡 **Ask** | — | Consultation space — keyword search over 222+ posts + all module descriptions. Conversational UI. LLM-upgrade-ready |
| 📝 **PrepLab** | 5 modes | Assessment (timed exam, 15/30/60 min), Trainer (immediate feedback + weak topic tracking), Interview Prep Plan (paste JD → 11 skills → gap drill → gated study plan), Weakness Heatmap, Company Tracks |

---

## PrepLab — what makes it different

**Assessment Mode:** Timed exam (15/30/60 min). 261+ questions across 11 skill categories. Scores hidden until end — final reveal shows per-category breakdown and "Strong in / Needs work" callout.

**Trainer Mode:** Immediate feedback after each answer. Tracks weak topics. Session summary with "Study these next" recommendations.

**Interview Prep Plan:** Paste a job description → keyword extraction against 11 skill categories → self-rating questionnaire → gap-weighted 20-question drill → Interview Readiness Score. Phase 4 gated study plan after 30% completion.

**Weakness Heatmap:** Per-topic accuracy bars sorted worst-first. Most-missed questions view.

Not available anywhere else for this audience, for free.

---

## Why different from other resources

| | YouTube / blog | DeepLearning.AI | fast.ai | **This** |
|--|:-:|:-:|:-:|:-:|
| Your configuration, your consequence | ✗ | ✗ | ✗ | ✓ |
| Production failure simulation | ✗ | ✗ | ✗ | ✓ |
| JD-aware interview prep | ✗ | ✗ | ✗ | ✓ |
| No account or login | ✓ | ✗ | ✗ | ✓ |
| Zero backend, fully static | ✓ | ✗ | ✗ | ✓ |
| Honest fidelity disclosure | ✗ | ✗ | ✗ | ✓ |
| No ads, no upsells | ✓ | ✗ | ✗ | ✓ |
| Covers evals, inference, agents, MCP | ✗ | Partial | ✗ | ✓ |
| 222+ production-depth posts | ✗ | ✗ | ✗ | ✓ |
| Free forever | ✓ | ✗ | ✓ | ✓ |

The gap that matters: every other resource **shows** you what to do. This one puts you in the seat and makes you decide — then shows you what broke and why.

---

## Key design decisions

**🔌 Zero backend, by design**
No API calls, no live model inference, no database. Every scenario uses curated configs and client-side logic. This is deliberate — a live API won't fail at exactly the right moment to teach prompt injection. Scripted scenarios are more reliable pedagogical tools than unpredictable model outputs. Static deployment means free to run, for anyone, indefinitely.

**What this is not:** This is not a live inference platform. It doesn't call models, query vector databases, or run real eval pipelines. It simulates the decision layer — the configuration choices, failure modes, and diagnostic reasoning — which is where production AI judgment is actually built. If you expected a backend system, that's a different product. If you want to develop the intuition to build and debug those systems, this is it.

**🏷️ Fidelity tagging — every module is honest about what it is**
Three tiers, shown as a badge on every Concepts and Explore module:

| Badge | Meaning | Examples |
|-------|---------|---------|
| `✓ Mathematically faithful` | Real algorithm logic on toy inputs | Tokenizer (real BPE), Sampling (real softmax/top-K/top-P) |
| `~ Simplified` | Correct pattern, not frontier-model scale | Attention, Transformer, Agent Loop |
| `◌ Conceptual` | Illustrative only | Embedding Space (precomputed 2D coords, not live model embeddings) |

A user should never mistake a 2D embedding visualization for actual Claude attention geometry. The badge prevents that.

**📂 RAG Lab scenarios — drawn from real production failures**
The six failure cases (stale retrieval, hallucination, prompt injection, context overflow, multi-hop failure, prompt injection via retrieval) are not invented for pedagogy. Each maps to a documented failure pattern in production RAG deployments. The configs, metric scores, and failure explanations reflect how these systems actually break.

**🧠 HowTo-first module design**
Every module opens with a `HowTo` component: what skill you're building, what the steps are. Never more than 3 steps. The learning objective is set before any interaction begins.

**💾 localStorage for all persistence**
Progress tracking, challenge scores, bookmarks, streaks, recently viewed posts, mark-as-read, and PrepLab session state persist client-side only. No sync across devices (accepted tradeoff). No GDPR obligations. No account friction.

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
| **⌘K search** | Jump to any of the 140+ modules instantly |
| **Start Here journey** | 7-step strip on the home page — Begin → |
| **PrepLab** | 📝 in the nav — assessment, trainer, JD prep |
| **Ask / Consultation** | 💡 in the nav — search all posts + modules |
| **Challenge Log** | 🏆 in the nav — your pass/fail record across all scored scenarios |
| **Share Score** | Copy your challenge score to clipboard from the Challenge Log |
| **What's New** | NEW in the nav — recent additions |
| **? Shortcuts** | Press `?` — full keyboard shortcut reference |
| **Credibility badges** | Every Concepts + Explore module shows its fidelity tier |
| **Progress bars** | Learning path cards show % of tabs visited |
| **Bookmarks** | ⭐ any GT post or module from the Progress tab |
| **Streaks** | 🔥 daily visit tracking |
| **ELI5 mode** | Simplified language toggle on every Ground Truth post |
| **Quiz me** | Auto-generates 3 MCQs from any Ground Truth post |
| **Mobile nav** | Hamburger menu with full navigation on small screens |
| **PWA** | Installable on mobile — Add to Home Screen |
| **Offline support** | Service worker caches the app shell |
| **RSS feed** | `/rss.xml` — 20 most recent Ground Truth posts |

---

## Tech stack

```
React 18          UI framework
Vite 6            Build tool + dev server
Tailwind CSS v4   Styling — @tailwindcss/vite plugin, no PostCSS config needed
Vercel            Deployment (free tier, static)
localStorage      Progress, scores, preferences — client-side only, no sync
PostHog           Lightweight analytics (optional, fails silently if unconfigured)
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
├── App.jsx                  # Root — nav, routing, ⌘K search, challenge log, what's new
├── Home.jsx                 # Hero, Start Here journey, learning paths, about section
├── Concepts.jsx             # 15 concept modules with fidelity tags — gym-based progression
├── Flows.jsx                # 6 animated pipeline diagrams incl. RAG Architectures
├── Agents.jsx               # Agent Lab — 16 modules + AGENTS_RELATED_GT map
├── Systems.jsx              # Systems tab shell + SYSTEMS_MODULES registry
├── systems/
│   └── modules.jsx          # All 48+ Systems module components
├── Explore.jsx              # 19 exploration tools with fidelity tags + LLM matrix
├── Playground.jsx           # Prompt injection, chunking, hallucination, bias labs
├── Fluency.jsx              # Phrase bank, drills, mock interview
├── AIPM.jsx                 # AI product manager track — PRD, roadmap, stakeholder
├── Career.jsx               # Career track — system design, take-home, salary calc
├── GroundTruth.jsx          # GT post renderer — ELI5, search, reactions, quiz-me
├── groundTruthIndex.js      # Post metadata + related[] arrays
├── groundTruthPosts.js      # All 200+ post content as typed block arrays
├── PrepLab.jsx              # Assessment exam, Trainer mode, Interview Prep Plan, Heatmap (261+ questions)
├── LearningPaths.jsx        # 6 curated multi-tab learning paths
├── Consultation.jsx         # Ask tab — keyword retrieval over all posts + modules
└── analytics.js             # PostHog event tracking (fails silently if unconfigured)
public/
└── og-image.png             # 1200×630 Open Graph image for link previews
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

## Community beta

The lab is currently in free community beta. The goal is to collect usage signal, confusion points, and testimonials before any monetization decision.

**Give feedback:** Open an issue on this repo or reach out directly — feedback is always welcome.

### Analytics

The app uses PostHog for lightweight, privacy-respecting analytics. No personal data is collected. Autocapture is disabled. All tracking is event-based and manually instrumented.

To enable analytics on your own fork, set these environment variables:

```
VITE_POSTHOG_KEY=phc_your_key_here
VITE_POSTHOG_HOST=https://us.i.posthog.com
VITE_FEEDBACK_URL=https://forms.gle/your_form_id
```

Copy `.env.example` to `.env.local` and fill in your values. The app builds and runs with no analytics configured — all calls fail silently.

Events tracked: `home_viewed`, `start_here_clicked`, `module_opened`, `rag_lab_opened`, `evaluate_configuration_clicked`, `challenge_completed`, `feedback_clicked`, `post_opened`, `assessment_finished`, `search_query`.

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
