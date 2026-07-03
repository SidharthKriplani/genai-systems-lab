# GSL → MSL/PAL parity roadmap

_As of 2026-07-03. The bar: MSL and PAL are complete interview gyms (deep content, spaced-rep
Review, capped-breadth readiness with "work next", Company Tracks, About/community, My Tracks
grouping/deep-open, capability-aware interactives). This tracks what's left to bring GSL level._

---

## ✅ DONE

- **Phase 0 consolidation** (0.1 de-clutter → 0.5 nav simplify): one coherent nav tree, dead surfaces archived to `_legacy/`, the double "Agents" fixed, knowledge consolidated into Concepts with forward-banners, assessment consolidated toward PrepLab.
- **Speak layer** (Fluency) — tiered spoken drill over the 591-question PrepLab bank; runaway-transcript bug fixed (also fixed at the MSL source).
- **L2 case-chains** — all 5 domains (Retrieval, Agents, Evaluation, Production, Foundations), staff-level, MSL Incident-Room schema reused.
- **Review room** — SM-2 spaced-rep over completed Concepts modules + case-chains.
- **Concepts gyms** — all 10 gyms / 63 modules verified complete (content + interactives).
- **Foundations exhaustive + causal-chain** — 23 modules: 5 new (quantization, DPO, speculative-decoding, MoE, distillation), 2 rewrites (nextoken, decoding-strategies), 9 patches, 7 already-strong left as-is. All conform to the first-principles causal-chain standard.
- **Existing surfaces present:** PrepLab, Fluency (Speak + mock), Leaderboard, Plans, Profile, Progress, My Tracks, Ground Truth, readiness.js.

---

## 🔴 REMAINING TO PARITY

### Tier 1 — the real parity gaps (highest value)

1. **Readiness upgrade** — `readiness.js` is activity-inferred only. MSL/PAL have a **capped-breadth score + "work next: weakest area"** front door on Home, and an optional **assessment quiz** (not just inferred from activity). Upgrade the engine + surface it on Home. _(P1, was the second half of the old Review+readiness task.)_

2. **Company Tracks** — **missing entirely.** Build the scaffold: companies × AIE roles (Applied AI Engineer, ML Engineer (GenAI), AI Researcher, Forward-Deployed) × levels, with multi-company logos and deep-open into the relevant modules/drills. MSL has `CompanyTracksTab`; reuse the pattern. _(P2)_

3. **Interactives for the 5 new foundations modules** — quantization, DPO, speculative-decoding, MoE, distillation currently render teaching-only (StubModule). Build real interactive widgets so they match the other 18. _(Content-depth follow-up.)_

### Tier 2 — completeness + polish parity

4. **About page + community link** — missing. Add an About page + community (WhatsApp) link, same pattern as MSL's `AboutTab`. _(Cheap, mechanical.)_

5. **Interactive QA sweep** — MSL did a capability-aware pass (no dead Play buttons, throttle/contrast/fit fixes). GSL needs the same triage across all labs/interactives. _(Only surfaces on the live build — do after you can click through.)_

6. **PrepLab answer-length tiers in the read view** — Speak has 30s/2-min/deep tiers; the written model-answer view should offer the same tiered lengths. Verify + finish behavioral/STAR bank as a first-class surface.

7. **My Tracks grouping/deep-open parity** — confirm GSL My Tracks matches the MSL/PAL grouping + deep-open + URL-title-fallback behavior; backport any gaps.

8. **Hubs → guided tours** — the 5 domain hubs route correctly now but still read as aggregators; strip duplicated content and make them true guided tours/paths.

### Tier 3 — differentiators + nice-to-have

9. **BUILD as real coding** (GSL's chance to exceed MSL) — today BUILD is simulators. Add real code labs: MCP-server code, multi-agent/orchestrator code, RAG-pipeline code (Pyodide notebooks or guided code). This is the AIE-specific differentiator.

10. **2nd L2 case-chain per domain** — depth; the schema makes this pure content.

11. **Widget dedupe finish** — the deferred cross-surface interactive dedupe (embeddings/attention/etc. across Concepts/Playground/Explore) — lighter cleanup.

12. **Drill-completion tracking** — if a tag-driven drill browser is added, track completion like MSL's `DrillTab`.

---

## Suggested sequence
Tier 1 first (readiness upgrade → Company Tracks → 5 interactives), interleaving the cheap Tier-2 wins (About+community) anytime. Tier 3 last. Do the interactive QA sweep only after a live build pass, since those bugs (like the Speak one) only appear in use.
