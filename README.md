<div align="center">

<br />

<img src="https://img.shields.io/badge/GENAI-SYSTEMS%20LAB-7c3aed?style=for-the-badge&labelColor=18181b" />

<br /><br />

**An interactive simulator for RAG failure modes, GenAI concepts, and production system design.**
Zero backend. Zero cost. Fully open source.

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-genai--systems--lab.vercel.app-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://genai-systems-lab-ivory.vercel.app)
&nbsp;
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
&nbsp;
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
&nbsp;
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
&nbsp;
[![License](https://img.shields.io/badge/License-MIT-zinc?style=for-the-badge)](LICENSE)

<br />

</div>

---

## What is this?

GenAI Systems Lab is a **static, zero-cost interactive simulator** for understanding how production GenAI systems work — and fail.

Two modes:

- **RAG Failure Simulator** — tweak chunk size, top-k, reranker, and answer policy. Watch real failure modes play out across 5 curated scenarios.
- **Concepts Visualizer** — interactive visuals for tokenization, embedding space, and attention. The mental models you need for interviews, system design, and deep understanding.

No live API calls. No backend. No login. Everything precomputed and curated.

---

## RAG Failure Simulator — V1-B

5 interactive scenarios. Each one teaches a distinct failure mode through hands-on configuration.

| # | Scenario | Failure Mode Taught |
|---|----------|-------------------|
| 1 | **Conflicting Documents** | Stale retrieval + silent conflict resolution |
| 2 | **Missing Answer** | Hallucination from retrieval gap |
| 3 | **Ambiguous Query** | Silent interpretation selection |
| 4 | **Prompt Injection** | Indirect injection via retrieved chunks |
| 5 | **Multi-Hop Reasoning** | Single-hop retrieval on multi-hop queries |

Each scenario includes:

- 4 system controls: chunk size, top-k, reranker toggle, answer policy
- 6–8 curated configs with precomputed results
- Failure diagnosis + system design lesson
- **Challenge mode** with graded pass/fail criteria

---

## Concepts Visualizer — V2-A

Three interactive modules for building deep intuition about how GenAI systems work under the hood.

| Module | What you see |
|--------|-------------|
| **Tokenizer** | Type any text — watch it split into tokens live. See why "unhappiness" ≠ 1 token. |
| **Embedding Space** | 2D semantic map of 60 words. Vector arithmetic: king − man + woman = ? |
| **Attention** | Full attention heatmap for real sentences. Switch heads. See what each token attends to. |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Build | Vite 6 | Zero-config, fast HMR |
| UI | React 18 | Component model |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` plugin, no PostCSS |
| Data | Bundled JS objects | No database, no API, no cost |
| Deploy | Vercel free tier | Auto-deploy on push |

---

## Run Locally

```bash
git clone https://github.com/SidharthKriplani/genai-systems-lab
cd genai-systems-lab
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Roadmap

- [x] V1-A — Single scenario (conflicting documents)
- [x] V1-B — 5 RAG failure scenarios + challenge mode
- [x] V2-A — Concepts Visualizer (tokenizer, embeddings, attention)
- [ ] V2-B — Agent tool-use simulator
- [ ] V2-C — Evals dashboard: compare configs side-by-side on a leaderboard
- [ ] V2-D — Monitoring dashboard: simulated production metrics over time
- [ ] V3 — BYOK live mode (bring your own API key, run against real corpus)

---

## Philosophy

> Static. Precomputed. Zero cost. Open source. No login walls.

Built for engineers who want to understand GenAI systems deeply — not just use them.

The best way to understand why a RAG system fails in production is to *configure one yourself and watch it fail*. That's what this is.

---

<div align="center">

Built by [Sidharth Kriplani](https://github.com/SidharthKriplani) &nbsp;·&nbsp; Deployed on [Vercel](https://vercel.com)

</div>
