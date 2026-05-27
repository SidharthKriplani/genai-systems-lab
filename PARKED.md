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

## Notes

- Nothing in PARKED.md is deleted. Everything is reachable via main Systems tab or direct `#hash` navigation.
- Items leave PARKED.md when they're upgraded to interactive decision-engine standard or find a permanent structural home.
- Do not add something to PARKED.md as a way to avoid thinking about where it belongs. PARKED is for genuinely ambiguous cases, not lazy disposal.
