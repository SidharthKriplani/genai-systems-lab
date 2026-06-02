# PARKED.md — Implemented but deferred

These things exist in the codebase and are accessible via the main Systems tab or direct links, but have been deliberately removed from the Labs/featured surfaces until they're upgraded to the interactive decision-engine standard.

---

## LLM Lab — reclassified to main Systems (May 2026)

These modules were removed from `LLM_LAB_MODULES` because they're reference content, not interactive simulators. They remain in the full Systems registry.

| Module ID | What it is | Right home when upgraded |
|---|---|---|
| `txarch` | Transformer architecture diagram + walkthrough | Concepts tab (forward pass interactive) |
| `flashattn` | Flash attention math explainer | Concepts tab (memory complexity viz) |
| `ctxwindow` | Context window patterns reference | Explore tab |
| `compaction` | Context compaction reference | Concepts tab |
| `finetune` / `finetuning` | Fine-tuning reference (duplicates) | Consolidate → Explore |
| `rlhf` / `grpo` | Training method explainers | GT posts (already written) |
| `modelmerging` | Model merging reference | Explore tab |
| `synthdata` | Synthetic data reference | Explore tab |
| `multimodal` / `multimodal2` | Multimodal architecture reference | Explore tab |
| `promptlab` | Prompt patterns reference | Playground |
| `indiascale` | India-scale deployment notes | Explore tab |
| `promptcaching` | Prompt caching patterns | Systems (main) |
| `costlatency` | Cost/latency reference table | Explore tab |
| `agentarch` | Agent architecture reference | Agents tab |
| `agentmemory` | Agent memory reference | Agents tab (module already there) |
| `mcp` | MCP patterns | Agents tab |
| `ai-safety-eng` | AI safety patterns | Systems (main) — stays there |
| `promptinjection` | Prompt injection defense | Systems (main) — stays there |
| `guardrails` | Guardrails reference | Systems (main) — stays there |
| `vibecoding` | Vibe coding patterns | Playground |
| `redteam` | Red teaming reference | Systems (main) |
| `constrained` | Constrained generation reference | Explore tab |
| `structout` | Structured output reference | Explore tab |
| `longctx` | Long context patterns | Systems (main) — stays there |
| `query-refinement` | Query refinement lab | Systems (main) — stays there |
| `vectordb` | Vector DB engineering | Systems (main) — stays there |
| `caching` | Caching patterns | Systems (main) — stays there |

---

## Flows tab (architectural review pending)

The Flows tab exists (`src/Flows.jsx`) — animated pipeline visualizations. Passive consumption: you watch pipelines run, you don't configure them or make decisions. This is anti-thesis of the lab's core mechanic.

**Status:** Accessible via nav but not featured. If redesigned to be interactive (user configures the pipeline and sees failure modes), it moves to BUILD. Otherwise it gets removed from nav entirely and becomes a Concepts sub-section.

---

## Fluency tab (coherence question)

`src/Fluency.jsx` — phrase bank, drills, mock interview. Useful content in isolation but doesn't have a coherent identity as a tab. Not a simulator, not a GT post browser, not a PrepLab mode.

**Status:** Accessible but not featured in primary nav. Candidate for absorption into PrepLab as a "Communication" mode.

---

## Ask / Search tab (identity crisis — May 2026)

`src/Consultation.jsx` — keyword search over GT posts, presented as "Ask" in the nav (implying a chatbot). The label-mechanic mismatch is damaging: users expect to ask a question and get an answer; they get a keyword search that returns 5 post titles.

**The fix options:**
1. **LLM upgrade path** — swap keyword scorer for embedding similarity + Claude API generation step. The architecture was designed for this (see DECISIONS.md consultation section). This turns it into a genuine "Ask" tab.
2. **Demotion** — rename to "Search" (already partially done in nav), move it out of primary nav, make it a search overlay inside the GT tab. This is the right shape if LLM upgrade isn't coming.

**Status:** In nav as "Search" but still a standalone tab. Audit 26 identified it as failing the "earns its place" standard in current form. Decision pending on upgrade vs demotion.

---

## Learning Paths tab (should be feature, not tab — May 2026)

`src/LearningPaths.jsx` — 6 curated multi-tab learning paths. The content is valuable. The problem: making it a standalone tab buries it. Users who need a path most (first-timers) are unlikely to discover a tab called "Paths" before they've already clicked into Systems or Concepts.

**Right home:** The path selector should be the second CTA on the Home page — "I want to: [interview in 3 weeks / transition from DS / build my first RAG system / understand agents]." Each choice launches a path with full context preserved inside each tab.

**Status:** Accessible as a tab. The content is good; the architecture is wrong. Remains available but deprioritized for nav prominence until it's promoted to Home page spine.

---

## Context Compaction — interactive simulator (deferred — May 2026)

The existing `ContextCompaction` module in Systems is reference content. To earn a home in Concepts (where it was planned), it needs a genuine multi-turn conversation simulator: conversation grows token by token, user watches the token count climb, compaction triggers at threshold, user sees before/after quality comparison.

**Status:** Reference module remains in Systems. Concepts version not built — too thin without the simulator mechanic. Deferred until the simulator can be built properly.

---

## PrepLab — Full Revamp System (deferred, conditions named)

**What it is:** A complete reimagining of PrepLab as a Trap Trainer rather than a quiz. The full system includes: War Room home screen (Trap Signature as hero metric), answer-before-options retrieval mechanic with meaningful evaluation, named trap pattern taxonomy (The Metric Namer, The Overclaimer, etc.), Interviewer Lens (what strong answers at the senior level include), "Defend Your Answer" adversarial follow-up mechanic, Company Interview Simulation mode, behavioral debrief with trap pattern history.

**Why it's parked and not retired:** The *direction* is correct — PrepLab should train failure patterns (traps), not just test recall. The individual components are not retired because the concept is wrong; they're deferred because the infrastructure to build them honestly doesn't exist yet. The difference from "Retired": retired ideas were wrong on first principles. These are right on first principles but require conditions that aren't met.

**What's wrong with building it now:**
- Trap Signature taxonomy requires manual curation of 182 trap fields into coherent named clusters — weeks of work not yet done
- Interviewer Lens requires sourcing from real interviewers, not editorial invention
- "Defend Your Answer" requires an LLM backend to respond to what the user actually said — static follow-ups are dishonest about the mechanic
- The full revamp would be built before PostHog confirms anyone is using PrepLab at meaningful WAU

**Conditions for leaving PARKED:**

All three must be true before starting:

1. **PostHog WAU baseline established** — PrepLab is getting meaningful weekly active sessions (>50 WAU). Building a revamp for a feature with 5 WAU is rearranging furniture nobody sits in.

2. **Trap field taxonomy completed** — 182 trap fields manually reviewed and clustered into 8–10 named pattern types, with at least 10 trap fields per cluster. This is content work, not code work. Start here.

3. **Either:** (a) LLM backend available (Vercel edge function + API key) for evaluating free-text answers, enabling real "Defend Your Answer" and honest Interviewer Lens sourcing — OR — (b) 10+ real interviewers have reviewed and signed off on trap field content, providing the authority the Interviewer Lens requires without an LLM.

**What's shipping now instead (surgical modifications):** Three changes that survived full critique, logged in UPGRADES.md — reveal order swap, free-text invitation field, behavioral debrief. These improve PrepLab within its current ceiling without claiming structural capabilities that don't exist.

**Source:** Full ideation + double devil's advocate cycle, June 2026 sprint 44.

---

## Notes

- Nothing in PARKED.md is deleted. Everything is reachable via main Systems tab or direct `#hash` navigation.
- Items leave PARKED.md when they're upgraded to interactive decision-engine standard or find a permanent structural home.
- Do not add something to PARKED.md as a way to avoid thinking about where it belongs. PARKED is for genuinely ambiguous cases, not lazy disposal.
- The standard for leaving PARKED.md: meets the interactive decision engine standard in DECISIONS.md Section 4.
