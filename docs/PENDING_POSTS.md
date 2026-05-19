# Ground Truth — Pending Posts

All posts have been written. The table below reflects the completed state as of May 2026.

---

## Status: Complete ✓

All post IDs defined in `src/GroundTruth.jsx` (POSTS array) now have content in `src/groundTruthPosts.js`.

Total posts written: 88+

---

## Completed in recent batches

### Batch 1 (committed `35fb978`)
- `prompting-token-economics`, `missing-context-failure`, `planning-patterns`, `ab-testing-llms`, `model-strategy`, `shadow-ab-testing`

### Batch 2 (committed `3299f1a`)
- `bias-in-llms`, `privacy-compliance-llms`, `stale-document-failure`, `incident-room`, `solo-operator-ai`, `india-scale-ai`

### Batch 3 (committed — includes progress bar + references block)
- `multihop-reasoning-failure`, `latency-planner`, `ai-launch-checklist`, `explaining-ai-to-stakeholders`, `ai-roadmap-prioritisation`, `model-card-reader`

### Batch 4 (committed `8c6c9d1`)
- `ambiguous-query-failure`, `tracing-agent-loops`, `ml-cicd`, `context-overflow-failure`, `llama-open-models`, `mistral-cohere-frontier`, `ai-in-fintech`, `ai-in-healthcare`, `ai-in-enterprise-saas`, `ai-case-interview`, `context-tetris`, `take-home-challenges`, `ai-benchmarks-explained`

### Batch 5 (uncommitted — pending push)
- `rag-system-design`, `agent-system-design`
- Content audit: added `references` blocks, `quote` blocks, expanded sections to 15 existing posts

---

## Content audit completed posts (deepened with references + personality)

- `tokenization-deep-dive` — added quote + references
- `decoding-sampling` — added min-P section + quote + references
- `embeddings-explained` — added failure modes section + references
- `how-rag-works` — added quote + references
- `what-is-a-transformer` — added references
- `rag-architectures` — added decision tree section + references
- `self-attention-deep-dive` — added Flash Attention section + references
- `agent-failure-modes` — added production hardening table + quote + references
- `ai-vocabulary` — added references
- `breaking-into-ai` — added honest timeline section + quote + references
- `guardrails-for-llms` — added latency budget section + references
- `red-teaming-llms` — added references
- `llmops-production-checklist` — added model upgrade strategy + quote + references
- `eval-pipeline-design` — added references
- `ai-salary-guide` — added negotiation section + references

---

## If new posts are needed

Add `"<post-id>": [ ...blocks ]` to the `POST_CONTENT` export in `groundTruthPosts.js`. The post will automatically become visible on the site once it has content.

See `src/GroundTruth.jsx` POSTS array for all defined post IDs and their categories.
