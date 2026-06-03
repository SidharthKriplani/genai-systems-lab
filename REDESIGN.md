# REDESIGN.md — Full Structural Redesign Plan

*Written June 2026. Supersedes DECISIONS.md §5 (three-door architecture).*
*Do not build anything in this plan without reading this file first.*

---

## Why this exists

The current product has 14 tabs of roughly equal weight with no hierarchy. Each tab made sense when it was built. Nobody stepped back to ask what the whole thing was saying. The result: a product that feels like a collection of tools rather than one coherent thing.

The redesign isn't cosmetic. It's structural — how the product is organized, what promise it makes, and whether a first-time visitor understands both in 5 seconds without reading anything.

---

## The single promise

> **GSL is the only place that trains production AI judgment — what happens when AI systems fail, how to diagnose it, and how to fix it.**

Not a course. Not a catalog. A judgment gym.

Every course teaches the map. GSL teaches the terrain — you configure real failure modes, watch systems break, and develop the judgment that maps don't teach. That's the differentiation. That's the only thing the product needs to say.

This promise drives every design decision below.

---

## The organizing principle: challenge layers

**Current structure:** organized by content type — tabs for Labs, Systems, Concepts, GT, PrepLab, etc.

**New structure:** organized by production AI challenge areas — the universal problems every practitioner faces regardless of role.

This is the PAL insight applied to GSL. PAL organizes by Analytics / Experimentation / Metrics / Foundations — skill layers that cut across BA, PM, TPM, DA. Nobody has to say "I'm a PM" to find the Metrics section. Same logic here.

### The five challenge areas

| Area | User's symptom | What it covers |
|---|---|---|
| **Retrieval** | "My AI gives wrong or made-up answers" | RAG, chunking, vector search, context management, hallucination |
| **Evaluation** | "I don't know if it's actually working" | Testing, monitoring, LLM-as-judge, eval design, production metrics |
| **Agents** | "It can't complete complex tasks reliably" | Tool use, orchestration, agent loops, multi-agent failures |
| **Production** | "I can't scale or afford to run it" | Inference, latency, cost, LLMOps, serving, deployment |
| **Foundations** | "I don't understand why it behaves this way" | Attention, tokenization, training, fine-tuning, prompting |

These five areas are universal. An MLE needs them. An AI PM needs to understand them. A transitioning engineer is anxious about exactly these. An interview candidate will be tested on exactly these. No self-classification required — users navigate by problem, not by identity.

---

## Navigation

### Primary nav (8 items)

```
Home  |  Retrieval  |  Evaluation  |  Agents  |  Production  |  Foundations  |  PrepLab  |  Ground Truth
```

That's it. No Systems tab. No Concepts tab. No Flows, Fluency, Explore, Ask.

**PrepLab** stays as a primary nav item because it's a different mechanic — not "learn by breaking," but "prove your judgment is interview-ready." It's the test layer, not the training layer.

**Ground Truth** stays because it's the reading/depth layer — practitioners' knowledge base. It's distinct from the interactive challenge areas.

### What exits primary nav

These components are NOT deleted. They remain in code, accessible via `#hash`. They just don't surface in primary nav because they don't earn their place under the challenge-layer standard.

| Removed | Reason | Still accessible |
|---|---|---|
| Systems | Content absorbed into challenge areas | `#systems` |
| Concepts | Content absorbed into challenge areas | `#concepts` |
| Agents (old tab) | Replaced by Agents challenge area | via Agents challenge area |
| Flows | Passive animations — anti-thesis of the mechanic | `#flows` |
| Fluency | Phrase bank with no coherent identity | `#fluency` |
| Explore | Legacy, absorbed into challenge areas | `#explore` |
| Ask / Search | Surfaces as search bar inside GT | `#ask` |
| Learning Paths | Surfaces as "suggested path" inside challenge areas | `#paths` |

---

## Home page

Two states: cold visitor (first time) and returning visitor.

### Cold visitor state

**Section 1 — The promise, with market signal**
Not "here's what the product does." The belief-building signal first.

```
Agentic AI engineer roles grew 280% last year.
The engineers who get those roles aren't the ones who built the most apps.
They're the ones who know what happens when AI systems fail — and what to do.

[Start with one question →]
```

The CTA is a single PrepLab question. Not "explore the labs." Not "choose your path." One question that immediately demonstrates the product's value: either they knew the answer (good) or they didn't (now they're motivated). Pre-installed belief problem solved in 30 seconds.

**Section 2 — The challenge landscape**
5 challenge area cards. Each card has:
- The challenge name (Retrieval, Evaluation, Agents, Production, Foundations)
- One sentence in the user's language ("Why does my AI retrieve garbage?")
- What's inside (X scenarios, Y GT posts, Z PrepLab questions)
- No role labels, no difficulty levels at this stage

**Section 3 — Why this, not a course**
One paragraph. "Reading about RAG failures is different from watching one happen and diagnosing it. Every module here requires configuration, produces a failure, and makes you understand why. That's the judgment gap between engineers who build demos and engineers who ship production AI."

### Returning visitor state

Replaces Section 1 and 2 with:
- Streak + activity snapshot (compact — 2–3 numbers)
- "Continue [last thing you were doing]" — specific, not generic
- "Today's question" — one PrepLab question as a daily hook
- Challenge area progress bars (how far through each area)

Section 3 (why this) stays visible until user has completed at least 2 scenarios.

---

## Challenge area pages

Each of the 5 challenge areas is a new page. All five follow the same structure. They are **aggregation pages** — they don't rebuild any content, they surface existing content through a unified lens.

### Page structure

**1. The challenge (top of page)**
One paragraph that names the pain in the user's language. Not "this section covers RAG and retrieval." More like: "Most RAG systems work fine in testing and fail in production. The failure modes are predictable — stale retrieval, noise injection, context overflow, hallucination from gap — but only if you've seen them before. This is where you see them."

**2. The lab (hero element)**
The primary interactive entry point for this challenge area. Largest visual element on the page.

| Challenge area | Primary lab |
|---|---|
| Retrieval | RAG Lab (all 6 scenarios) |
| Evaluation | Eval Lab |
| Agents | Agent Lab |
| Production | LLM Lab |
| Foundations | Foundation Models Lab + Prompt Lab |

If the user has started the lab, show progress. If not, show the first scenario as the entry point.

**3. Key concepts (3–4 items)**
Not a full Concepts gym listing. The 3–4 most relevant Concepts modules for this challenge area, surfaced with their fidelity badge and a one-line description.

| Challenge area | Surfaced concepts |
|---|---|
| Retrieval | Embedding Space, Attention, Chunking, Context Window |
| Evaluation | LLM as Judge, Eval Design, G-Eval, Calibration |
| Agents | Agent Loop, Tool Use, Context Architecture, Multi-Agent |
| Production | Serving, Inference, Cost/Latency, LLMOps |
| Foundations | Tokenizer, Transformer, Training Signal, Fine-Tuning |

**4. From the field (3–4 GT posts)**
The most relevant Ground Truth posts for this challenge area. Not a full GT listing — curated. Each post shown with title, one-line description, and read time.

**5. Test your judgment (3 PrepLab questions)**
Three questions from the PrepLab bank for this challenge area, shown inline. User can answer directly on the challenge page — no need to navigate to PrepLab first. If they want more, "See all [N] questions in PrepLab →"

**6. Your progress**
Bottom of page. What they've completed in this area: lab scenarios done, concepts visited, questions answered. Framed as progress, not a grade.

---

## PrepLab

PrepLab's mechanic doesn't change. Its framing does.

### New framing
Not "Assess yourself." Not "Interview prep." 

**"Test your production AI judgment."**

The entry: from any challenge area page via "Test your judgment" → drops into PrepLab pre-filtered to that challenge's question cluster.

From primary nav: PrepLab opens as it does now (full exam config screen), but the copy changes. "How sharp is your production AI judgment? 319 questions from real interview scenarios. No hints. See exactly where your reasoning breaks."

### What PrepLab keeps
- All 4 modes (Exam, Trainer, Review Due, Company Tracks, Interview Signal) — unchanged
- Mock Exam Mode — unchanged
- Staff Layer — unchanged
- 319 questions — unchanged

### What changes
- Entry framing — language throughout reflects "judgment" not "quiz"
- Each challenge area page surfaces 3 inline questions → natural funnel into PrepLab
- PrepLab sidebar labels the question clusters by challenge area name (Retrieval, Evaluation, Agents, Production, Foundations) — currently labeled by topic which is close but not aligned

---

## Ground Truth

Minimal structural changes. GT is already a strong product.

### What changes
- Entry framing: "The practitioner's knowledge base" — not a blog, not docs, but distilled thinking from people who've shipped this in production
- Search bar moves to be more prominent (currently tucked away)
- Each challenge area page surfaces 3–4 GT posts → natural entry into GT
- GT cards get challenge area tags (Retrieval / Evaluation / Agents / Production / Foundations) replacing or augmenting existing topic tags

### What stays
- All 226 posts — unchanged
- GT Quiz — unchanged
- Reading mode (3-lens) — unchanged
- Bookmarks — unchanged
- Series UI — unchanged

---

## Implementation sequence

This is additive and non-destructive. No existing component is deleted. The redesign adds new aggregation pages and modifies nav + home. Labs, PrepLab, Concepts, GT internals are untouched until later polish sprints.

### Phase 1 — Navigation (1 session, ~2h)
**Files:** `src/config/nav.js`, `src/App.jsx`

Changes:
- Collapse primary nav to 8 items
- Add routing for 5 new challenge area routes (`#retrieval`, `#evaluation`, `#agents`, `#production`, `#foundations`)
- Old routes remain functional (hash-accessible)
- Update `ALL_TABS`, `NAV_GROUPS`, group colors

Commit target: `feat: nav collapse — 8-item challenge-layer nav`

### Phase 2 — Challenge area pages (2–3 sessions, ~6h)
**New files:** `src/Retrieval.jsx`, `src/Evaluation.jsx`, `src/AgentsHub.jsx`, `src/Production.jsx`, `src/Foundations.jsx`

Each page (~300–400 lines):
- Challenge intro paragraph
- Lab entry card (link to existing lab component)
- 3–4 concept cards (static data, links to `#concepts/moduleId`)
- 3–4 GT post cards (pull from `groundTruthIndex.js`)
- 3 inline PrepLab questions (pull from `preplabQuestions.js` by topic)
- Progress snapshot (read from localStorage keys)

No new data needed — purely aggregating existing content.

Commit target per page: `feat: [challenge] hub page — lab + concepts + GT + PrepLab inline`

### Phase 3 — Home page rewrite (1 session, ~3h)
**File:** `src/Home.jsx`

Changes:
- Cold visitor: promise hero + market signal + 5 challenge cards + PrepLab single-question CTA
- Returning visitor: compact progress + continue + daily question + challenge progress bars
- Remove current 6-card door grid

Commit target: `feat: home rewrite — challenge-layer architecture, cold/returning visitor states`

### Phase 4 — PrepLab reframe (1 session, ~1h)
**File:** `src/PrepLab.jsx`

Changes:
- Copy: "judgment" framing throughout
- Sidebar cluster labels aligned to challenge area names
- Minor — no structural changes

Commit target: `feat: PrepLab reframe — judgment framing, challenge-aligned cluster labels`

### Phase 5 — GT tagging (1 session, ~2h)
**File:** `src/groundTruthIndex.js`

Changes:
- Add `challengeArea` field to each of 226 posts
- GT cards show challenge area tag
- Challenge area pages pull posts by `challengeArea` field

Commit target: `feat: GT challenge area tagging — all 226 posts tagged`

### Phase 6 — Visual polish (1 session, ~2h)
After all structure is in place:
- Consistent module headers across all labs
- Challenge area color coding (each area gets a distinct accent)
- Typography scale review
- Mobile layout pass on new pages

---

## What does NOT change

- All lab internals (RAG Lab, Agent Lab, Eval Lab, LLM Lab, FM Lab, Prompt Lab) — untouched
- All PrepLab question data — untouched
- All GT post content — untouched
- All Concepts modules — untouched
- localStorage keys — untouched
- Hash routing for existing tabs — they all still work
- Systems.jsx, Concepts.jsx — still exist, still functional, just not in primary nav

---

## What this redesign does NOT solve

**The content quality bar** — challenge area pages are only as good as the labs they point to. If a lab scenario is weak, surfacing it more prominently makes it more visible, not better.

**The evaluation challenge area** — Eval Lab is the weakest of the 6 labs. The "Evaluation" challenge area page will direct users to it. This is fine for now but the lab itself needs more scenarios in a future sprint.

**GT series taxonomy** — 226 posts need challenge area tags (Phase 5). This is the largest manual work item in the redesign.

**The belief gap for cold visitors** — the new home page addresses it, but belief is ultimately built through the first interaction, not the page design. The PrepLab single-question CTA is the best mechanism we have — watch whether users convert on it in PostHog.

---

## Open decisions (resolve before Phase 3)

1. **Challenge area accent colors** — each area should have a distinct color. Candidates:
   - Retrieval: cyan (existing `--gal-build`)
   - Evaluation: amber
   - Agents: violet
   - Production: green
   - Foundations: blue

2. **Foundations scope** — FM Lab + Prompt Lab are both relevant here. Do they merge into one Foundations challenge area entry, or do they stay separate sub-entries? Probably sub-entries.

3. **PrepLab single-question CTA on home** — which question shows? Random from hard-but-free? Or a curated "daily question" seeded from a fixed pool?

4. **Challenge area page for Agents** — current Agents.jsx is the Agent Lab tab. The new challenge area page is a different component. The existing tab route (`#agentlab`) stays. The new route (`#agents`) is the hub page. Make sure routing is clean.

---

## Success criteria

The redesign is working when:
- A first-time visitor can describe what the product does after 10 seconds on the home page
- A returning visitor can resume exactly where they left off in one click
- A user who came for RAG help naturally discovers that PrepLab tests for it
- PostHog shows challenge area page → lab entry rate higher than current Systems tab → module entry rate

---

*Next: Phase 1 implementation (nav collapse). Read this file before starting.*
