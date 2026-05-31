# NEXT.md — Next build session

Read this at session start. Do only this. Update before closing.

*Last updated: May 2026 (post sprint 30, field intelligence + architecture session)*

---

## Theme: Content depth + production grounding

Sprint 30 shipped 4 structural items (done card prominence, gym progress, keyboard shortcuts, EvalLoopModule). The product now has good interactive mechanics but the failure cards end too abstract — no production mapping, no interview narrative. Sprint 31 closes that gap, then adds real corpus data to RAG Lab so users read actual retrieved text, then expands 3 thin GT posts to full depth.

---

## Do this (in order)

**1. "Your Interview Story" block on RAG Lab + Agent Lab done cards** `S effort` `HIGH`

What: At the ✓ forward pointer card, add a collapsible "Your Interview Story" block that packages the scenario into a 3-line narrative: "I diagnosed [failure mode] → root cause [X] → fix [Y] → in production this maps to [Z]." This is pure copywriting/framing addition — all variables already exist on the card. No new logic, no new state.

Files:
- `src/App.jsx` — RAG Lab forward pointer card (the block rendered by `SCENARIO_FORWARD_POINTERS` lookup, around the `✓ "You've seen the failure. What's next?"` section). Add a collapsible `<details>` or toggle button below the two action buttons.
- `src/Agents.jsx` — Agent Lab done screen cards (the purple gradient done cards at module end in `simulator`, `design`, and `agentcfg` modules). Same collapsible block.

Content per RAG scenario (write inline as a lookup object keyed by `scenario_id`):
- `missing_answer` → "I diagnosed a retrieval gap → corpus didn't contain the answer → fix: expand corpus + add fallback detection → in production: Bedrock Knowledge Base coverage audit + CloudWatch 'no-match' alarm"
- `hallucination` → "I diagnosed grounding failure → retrieved chunks weren't used → fix: stricter context-forcing prompt + faithfulness eval → in production: RAGAS faithfulness monitor + LLM-as-judge in CI"
- `noise_injection` → "I diagnosed precision failure → top_k too high pulled irrelevant chunks → fix: reduce top_k + add score threshold → in production: OpenSearch min_score filter + retrieval precision metric"
- `stale_data` → "I diagnosed staleness → corpus not refreshed → fix: scheduled re-indexing + metadata freshness filter → in production: S3 event trigger → re-embed pipeline + date filter in query"
- `context_overflow` → "I diagnosed context truncation → chunk size × top_k exceeded window → fix: smaller chunks + lower top_k → in production: chunk size calculator pre-deploy + token count guardrail"
- `score_threshold` → "I diagnosed over-filtering → threshold too high dropped valid chunks → fix: lower threshold + evaluate retrieval recall → in production: Context Recall metric + threshold sweep during eval"

Source: sprint 25 analysis, Audit 40 finding.

---

**2. "Maps to production" callout on RAG Lab root-cause cards** `S effort` `HIGH`

What: Each RAG Lab scenario's evaluated state ends with the `system_design_lesson` block — abstract failure mode, no production mapping. Add one `productionNote` per scenario rendered as a small amber chip/callout below the System Design Lesson block. "In production this is: [AWS service / OSS tool]."

File: `src/App.jsx` — add a `PRODUCTION_NOTES` constant (object keyed by `scenario_id`) at the top of the file near the other scenario lookup constants. Then render it in the evaluated state, below the `system_design_lesson` block, as an amber-tinted chip: `bg-amber-950/40 border border-amber-800/50 text-amber-300`.

Content for `PRODUCTION_NOTES`:
```js
const PRODUCTION_NOTES = {
  missing_answer: "Bedrock Knowledge Base / OpenSearch + CloudWatch no-match alarm",
  hallucination: "RAGAS faithfulness monitor / LLM-as-judge eval in CI pipeline",
  noise_injection: "OpenSearch min_score filter / Pinecone score threshold + retrieval precision metric",
  stale_data: "S3 event-triggered re-embed pipeline / scheduled re-indexing + metadata date filter",
  context_overflow: "Token count guardrail pre-query / chunk size calculator + top_k cap",
  score_threshold: "Context Recall metric + threshold sweep during eval / retrieval audit dashboard",
};
```

Source: sprint 25 analysis.

---

**3. RAG Lab static corpus — data realism v1** `S-M effort` `MEDIUM`

What: The RAG Lab's ChunkCard currently renders abstract labels ("Chunk 3 — score 0.81"). Replace with actual retrieved text from a real static corpus. User should read the garbage doc that caused noise injection, the truncated chunk that broke context, the irrelevant result that caused hallucination. This is the single highest-leverage realism improvement — no backend needed, pure static JSON.

Files:
- New `src/ragCorpus.js` — JSON array of 20–30 doc objects. Two domains: e-commerce product catalog (10–12 docs: product names, specs, prices, metadata) and technical documentation (10–12 docs: API reference snippets, error codes, setup guides). Each doc: `{ id, title, domain, content, metadata: { date, source, type } }`. Pre-computed per scenario: which chunk_ids are "relevant" and which are "noise" for each scenario config, with a `similarity_score` per chunk.
- `src/App.jsx` — in the `ChunkCard` component (wherever chunks are currently rendered with abstract labels), import corpus and replace label with `corpus.find(d => d.id === chunk.id)?.content.slice(0, 200) + "…"`. Show title + domain badge alongside score.

See DECISIONS.md Section 7 for the full architecture ruling. See IDEAS.md "Datamart-backed realism — static corpus" cluster for context.

---

**4. Thin GT posts expansion — 3 stubs** `S-M effort` `MEDIUM`

What: Three posts are under 6 blocks (stub level) and read as incomplete. Each needs minimum 8 blocks, 1 callout block, 1 refs block. Write at "knowledgeable colleague" depth — not a survey, one specific production insight per post.

File: `src/groundTruthPosts.js` — expand each post object's `blocks[]` array.

Posts to expand:
- `dpo-in-practice` — DPO vs PPO in production: why DPO is cheaper (no reward model), when PPO is still necessary (online RL, multi-turn), what a DPO training loop actually looks like (preference pairs → log-ratio loss), what breaks (distribution shift, preference noise). Production note: Anthropic's Constitutional AI uses a mix; smaller teams use DPO exclusively.
- `llm-observability` — what to instrument: latency per token, TTFT, tool call count, context window utilisation, generation length vs input length ratio. What each metric reveals in production. OpenTelemetry + Langfuse/LangSmith as the standard stack. Callout: "most teams instrument latency but not faithfulness — that's backwards for RAG systems."
- `instruction-tuning-datasets` — what makes a good instruction dataset (diversity of tasks, length distribution, format variation), common quality failures (sycophancy injection from RLHF preference data, format overfitting), key open datasets (FLAN, Dolly, OpenHermes, WizardLM evol-instruct). Production note: dataset curation is harder than training — quality of 10K examples > quantity of 100K.

---

## Pending (valid but lower priority)

- **Graph RAG + multi-hop retrieval** — GT post ("Graph RAG — When Vector Search Isn't Enough") + PrepLab questions (3–4). Strong signal from Senior AI Engineer interview post (May 2026). Completely absent from GAL. Tier 1 in IDEAS.md.
- **LangGraph reducers + HITL patterns** — GT post ("Human-in-the-Loop — When to Pause an Agent") + PrepLab questions (3–4). Senior AI interview Round 2 signal. Tier 1 in IDEAS.md.
- **Bi-encoder vs cross-encoder two-stage retrieval** — GT post + PrepLab questions (3–4) + Query Refinement module extension (reranker as 4th stage). From Microsoft RAG interview transcript (May 2026). Tier 1 in IDEAS.md.
- **Interview Strategy Tool consolidation** — merge Interview Prep Plan + Defense Doc into single unified mode. L effort, needs its own session. See UPGRADES.md.
- **GT Series + Tags redesign** — Deep Dives IA (activates at 50+ posts — already past that at 222). M-L effort.
- **React.lazy() code splitting** — systematic architectural change across all tabs. See MSL as reference. DECISIONS.md-worthy scope.
- **Pyodide execution for Eval Lab** — Tier 2, only after static corpus (item 3 above) ships AND engagement is measurable. See DECISIONS.md Section 7.
- **Concepts module: "Sequential vs Parallel — The Architecture Transition"** — RNN→LSTM→Transformer arc as systems-level story. Source: Naresh Edagotti post (May 2026).
- **Concepts module: "The Training Signal — Entropy, Loss, and KL Divergence"** — "how surprised is the model?" framing. Source: Utkarsh Mangal post (May 2026).
- **PrepLab Company Tracks** — company-specific architecture lens on failure modes. L effort.
- **Visual polish backlog** — consistent module headers, Explore module cards, PrepLab question experience. See IDEAS.md "Visual Polish backlog" section.
- **Modularisation pass (incremental, enforce going forward)** — (1) Extract PrepLab questions to `src/data/preplabQuestions.js`, (2) Create `src/config/gating.js` + `nav.js`, (3) Build `<ForwardPointerCard>` shared component when touching NEXT.md item 1. See DECISIONS.md Section 8 + UPGRADES.md entries.

---

## Do NOT touch this session

- Stripe + auth — not yet. See DECISIONS.md Section 0 for the gate condition.
- Marimo in-browser execution — wrong tool for GAL (see DECISIONS.md Section 7). Only valid as offline companion content.
- New GT posts beyond the 3 stubs in item 4 — no bulk additions this sprint.
- Graph RAG module build — it is in Pending only; do not start without first shipping items 1–4.
- PAL codebase — separate product, out of scope.
- TypeScript migration — never. Non-negotiable constraint (Vercel build breaks).

---

## End of session checklist

- [ ] Brace check on all modified files: `node -e "const fs=require('fs'); const c=fs.readFileSync('src/FILE.jsx','utf8'); let o=(c.match(/\{/g)||[]).length, cl=(c.match(/\}/g)||[]).length; console.log('diff:',o-cl)"` → must be 0
- [ ] Commit with descriptive message per file group
- [ ] Update CLAUDE.md sprint log entry (scale, commit hashes, what changed)
- [ ] Update this file — move done items to CLAUDE.md log, add anything new to Pending
- [ ] Update LINEAGE.md with new sprint row
- [ ] Update IDEAS.md — mark built items ✅, update header scale line
- [ ] Push: `cd ~/Documents/GitHub/genai-systems-lab && git push origin main`
