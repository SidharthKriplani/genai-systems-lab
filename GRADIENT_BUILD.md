# GRADIENT_BUILD.md — depth-3 / PhD layer build log

The **Gradient** layer adds a PhD-depth ("depth 3") panel to each Concepts module: the derivation, the objective, the complexity bound, a "why it must be so" insight, and canonical papers. It is soft-locked behind full access. This file is the single tracker for the content build-out.

Status legend: **✓ built** (full content shipped) · **◷ skeleton** (outline only, renders as ROADMAP) · **☐ todo** (no entry yet).

Last updated: 24 Jun 2026 — mechanism + Language Models gym built; 18 active modules skeletoned; **monochrome instrument re-skin applied** (cyan `var(--gal-build)` + grey tokens; no violet/emerald, no raw hex). Shipped as a **user-authorized override of the sprint-90 content freeze** (treated like the logo/nav structural overrides). Full content authoring for the 18 skeletons still deferred (token-saving).

---

## Architecture (already shipped — do not rebuild)

- **Content data:** `src/data/gradientContent.js` → `GRADIENT_CONTENT` map, keyed by module id.
  - Full module = **array of blocks**: `{ t: "h"|"p"|"math"|"list"|"key"|"refs", c: ... }`.
  - Skeleton module = **object**: `{ soon: true, outline: ["section title", ...] }`.
- **Component:** `GradientPanel` in `src/shared.jsx`. Renders three states:
  1. *Skeleton* → collapsible "DEPTH 3 · ROADMAP" panel showing the planned outline.
  2. *Full + unlocked* (`isAccessGranted()`) → collapsible full content; header shows `✓ Faithful` when open.
  3. *Full + locked* → table-of-contents teaser + "Unlock full access →" CTA routing to `plans`.
- **Wiring:** one insertion in the Concepts module shell — `<GradientPanel blocks={GRADIENT_CONTENT[active]} onNavigate={onNavigate} />`. Rendering is keyed by module id, so **rolling out a module = edit `gradientContent.js` only. No Concepts.jsx surgery.**
- **Math rendering:** styled monospace Unicode (no KaTeX — respects the no-new-deps constraint). Pending decision below.
- **Gating:** reuses `isAccessGranted()` / `DAI2026` from `src/utils/accessCode.js`. No new auth.

### Rollout procedure (per module)
1. Open `src/data/gradientContent.js`, find the module's skeleton object.
2. Replace `{ soon: true, outline: [...] }` with a blocks array following the Language Models examples (lead with `h`, derive in `p` + `math`, land the insight in `key`, close with `refs`).
3. Keep the same depth bar as the LM gym: state the objective, derive *why*, give the complexity/consequence, cite 2–3 canonical papers.
4. Verify: `node` brace-diff = 0 on the file + `esbuild` parse. No content change to `shared.jsx`/`Concepts.jsx` needed.

---

## Status board

### ✓ Built — Language Models gym (9)
tokenizer · attention · transformer · flashattn · sampling · nextoken · tempgame · seq-parallel · training-signal

### ◷ Skeleton — outline shipped, content queued (18)

| Module | id | Gym | Planned outline |
|---|---|---|---|
| Embedding Space | `embeddings` | Retrieval | InfoNCE contrastive training · cosine & anisotropy · hard negatives + τ |
| Chunking | `chunking` | Retrieval | recall/precision tradeoff · fixed/recursive/semantic objective · late chunking |
| RAG Pipeline | `rag-pipeline` | Retrieval | RAG as conditional generation · retrieve/rank/ground decomposition · cross-encoder rerank |
| Context Window | `context` | Retrieval | O(n²) attention budget · KV-cache + MQA/GQA/MLA · lost-in-the-middle |
| Agent Loop | `agent` | Agents | agents as policy/search · ReAct + p^k bound · planning/reflection |
| Tool Design | `agent-tools` | Agents | grounding/function-calling · idempotency + retry contract · schema-constrained decoding |
| Multi-Agent | `multiagent` | Agents | orchestration vs specialization · single agent vs swarm · compounding miscommunication |
| Guardrails | `guardrails` | Agents | injection taxonomy · least-privilege tool classes · I/O guardrail limits |
| Eval Loop | `eval-loop` | Evaluation | estimator + CI · paired tests · eval flywheel |
| Debug RAG | `debug` | Evaluation | failure localization · recall vs faithfulness · ablation as causal attribution |
| LLM-as-Judge | `llm-as-judge` | Evaluation | position/verbosity/self-preference bias · Cohen's κ calibration · reliability bounds |
| Eval Design | `eval-design` | Evaluation | contamination + Goodhart · multiple comparisons · Item Response Theory |
| Cost & Latency | `cost-latency-concepts` | Production | prefill vs decode · roofline/arithmetic intensity · continuous batching |
| Observability | `observability-concepts` | Production | span trace tree · cost attribution + p95/p99 · drift signals |
| Scaling Laws | `scaling-laws` | Foundation | power law + Chinchilla Lagrangian · C≈6ND · emergence vs metric |
| LoRA / QLoRA | `lora` | Foundation | low-rank via SVD · QLoRA (NF4/double-quant/paged) · intrinsic low-rank |
| Few-Shot | `few-shot` | Prompting | ICL as implicit inference · induction heads · ordering/format effects |
| Chain-of-Thought | `chain-of-thought` | Prompting | CoT as test-time compute · self-consistency · process vs outcome supervision |

### ☐ Todo — coming-soon gyms (not yet built as modules, so no Gradient yet)
Vector Infrastructure · Observability & Tracing (full) · Multimodal AI · AI Safety & Alignment · Cloud AI Services · AI Product Strategy · Data for AI. Add Gradient skeletons when these modules are built.

---

## Pending decisions
- **KaTeX vs monospace math.** Current: Unicode monospace (zero deps, on-brand, not typeset). If full LaTeX is wanted, add KaTeX via CDN and a `math` renderer in `GradientBlock`. Decide before authoring the heavy-math modules (scaling-laws, lora, eval-design).
- **Fidelity badge flip.** Module top badge stays `~ Simplified` (honest about the sim); `✓ Faithful` shows inside the Gradient header when expanded. Revisit if a unified top-level flip is preferred.
- **Build cadence.** Suggested order when authoring resumes: Retrieval → Evaluation → Foundation Models → Agents → Production → Prompting (highest learner value first, heaviest math last).

## Notes
- Source of the depth-3 content: `AI_ENGINEER_CONCEPTS_ASSESSMENT.md` Part 2 (verified math). Reuse it as the draft for each module's full build.
- Token-saving directive (this week): skeletons only; no full authoring. This log captures the plan so no context is lost.
