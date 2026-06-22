# NAV-REFRAME-SPEC — GenAI Systems Lab (GSL) under the four frames

_Implements `docs/FOUR-FRAME-AUDIT.md` §5: reorganize GSL's nav so every surface declares its **primary frame** (recall+depth → fluency → ownership → judgment), dissolve the mislabeled "Fluency" tab, and record GSL's real **fluency sliver** as a small to-build spec. Sprint 82, 2026-06-22._

> **PROPOSE-ONLY — `App.jsx` is NOT edited in this pass.** This is the concrete target nav + the exact mechanical edits, written so implementation is a single post-approval commit. Reasons for the off-ramp (same as MSL's nav-reframe session): (a) the content-freeze (`LINKEDIN.md`) gates structural overhauls; (b) the sandbox can't build-verify a Vite/React change (Rollup ARM64), and `git push` auto-deploys to Vercel; (c) the reframe spans several interdependent nav structures + ~5 consumer deep-links; (d) DEC-15 sequences the lab overhaul for after the distribution keystone. **Reorg/relabel of existing surfaces only — no new content, no code bank built.**

> **Naming note:** this spec uses the model's own frame words — **Foundations / Fluency / Ownership / Judgment**. The MSL audit used **KNOW / DO / BUILD / JUDGE**. That divergence is logged `HQ/LEDGER.md [2026-06-22] GSL,MSL→HQ ⊥ pending HQ` — the canonical zone labels are HQ's to set before any lab actually restructures. Treat the labels here as placeholders pending that ruling; the *placement* is what matters.

---

## 1. Where the nav is today (the mechanical map)

GSL's nav is not organized by the 14 "tabs" — it's organized by **challenge area** (domain). The structures an implementer must touch:

| Structure | File · approx line | Role |
|---|---|---|
| **`NAV_GROUPS`** | `App.jsx` ~1896 | The sidebar source of truth. Groups today: TRACK · CHALLENGE AREAS (5 domain hubs) · PrepLab · Ground Truth. **The mobile drawer (~2907) re-maps this same array — one edit covers both.** |
| **`VALID_VIEWS`** | `App.jsx` 1390 | Whitelist of routable `topView` ids (29 ids incl. `fluency`). |
| **`GUEST_ALLOWED_TABS`** | `App.jsx` 1394 | Per-tab guest gating (Foundations/PrepLab/RAG-Lab Scenario 1 free). Routing-level — frame grouping is cosmetic over it, so it stays intact. |
| **Tab render switch** | `App.jsx` 2366–2425 | `topView === "..."` → component. 29 surfaces incl. `fluency → <FluencyApp/>`. |
| **"More tabs" / search index** | `App.jsx` ~1232 | Flat `{label, tab}` list incl. `Fluency / AI Product / Career`. |
| **`SHORTCUT_TABS`** | `App.jsx` 1683 | Keyboard-shortcut tab list. |
| **Challenge-area hubs** | `RetrievalHub/EvaluationHub/AgentsHub/ProductionHub/FoundationsHub.jsx` | Per-domain landing pages bundling Concepts+GT+Lab+PrepLab. Cross-frame bundles. |
| **Fluency consumers (deep-links)** | `App.jsx` ~2033/2036 (What's New), `QADashboard.jsx` ~278 | Point at `tab:"fluency"` — must be re-pointed on dissolution. |

The full routable `topView` set (29): `home, concepts, flows, consult, lab, agents, agentlab, evallab, llmlab, promptlab, foundationlab, systems, playground, explore, fluency, aipm, career, preplab, groundtruth, progress, profile, plans, paths, retrieval, evaluation, agentshub, production, foundations, study`.

---

## 2. Target IA — frames as the top-level structure

```
GenAI Systems Lab
│
├─ ⌂ TRACK            (wayfinding — not a frame)   Profile · Progress · Plans
│
├─ ① FOUNDATIONS · Recall + Depth        "Understand the machine"        [DEEP]
│     Concepts · Flows · Explore (explainers) · Ground Truth (depth series) · Ask/Consult
│
├─ ② FLUENCY · Execute it                "Write & fix the glue"          [SEEDED + TO-BUILD]
│     Prompt Engineering · Prompt Challenges            ← seed (exists, gradeable prompt work)
│     ▸ LLM-systems code sliver — Pyodide               ← TO-BUILD (spec'd in §5; NOT built)
│     → general algorithms / Python / SQL → PSL          ← cross-lab delegation (GSL owns only the LLM sliver)
│
├─ ③ OWNERSHIP · Scaffold                "Build & own a real system"     [THIN — by design]
│     Career → Guided ProjectLabs · "How I'd Build X" GT · Build-From-Scratch blueprints
│     → CAPTURE handed to Career OS (the earned résumé line — not the lab's job)
│
├─ ④ JUDGMENT · Decide · Diagnose · Defend   "Choose & defend under constraint"   [DEEP — apex]
│     RAG Lab · Systems (Eval Lab / LLM Lab / FM Lab) · Agents (failure modes) ·
│     Playground · AI Product · Company Cases · Ground Truth case-studies/failures/perspectives
│     └─ ASSESS:  PrepLab · Readiness Check        (the measurement layer under judgment)
│
├─ ⊗ COMMUNICATION  (cross-cutting ribbon over ①–④ — NOT a frame, NOT a tab)
│     Phrase Bank · Flashcards · Timed Drills · Mock Interview · Stakeholder Explainer · Negotiation
│
└─ ◇ BY DOMAIN  (secondary lens, retained)   Retrieval · Evaluation · Agents · Production · Foundations hubs
```

Frames are primary; the five challenge-area hubs survive as a **secondary "by domain" lens** (they're good landing pages), no longer the organizing principle.

---

## 3. Placement table — every surface → primary frame (+ secondary)

| Surface (`topView`) | Primary frame | Secondary | Note |
|---|---|---|---|
| `concepts` | ① Foundations | Judgment (Debug RAG) | interactive explainers |
| `flows` | ① Foundations | — | animated pipelines |
| `explore` | ① Foundations | Judgment (compare/select tools) | split-personality; explainers→①, decision tools→④ |
| `groundtruth` (depth series) | ① Foundations | Judgment / Ownership (case-studies / how-i-build) | tag per-series |
| `consult` (Ask) | ① Foundations | wayfinding | retrieval over corpus |
| `promptlab` (Prompt Engineering) | **② Fluency** | Foundations | seed of the fluency frame |
| Prompt Challenges (`challenges`, ex-Fluency) | **② Fluency** | Judgment | "fix the broken prompt" → gradeable prompt work |
| ▸ LLM-systems code sliver | **② Fluency** | Judgment | **TO-BUILD** (§5) — marked, not faked |
| `career` → Guided ProjectLabs | ③ Ownership | Judgment | component-selection scaffolds |
| GT "How I'd Build X" / Build-From-Scratch | ③ Ownership | Foundations | blueprints |
| `lab` (RAG Lab) | ④ Judgment | Foundations, **Fluency (the "now fix it" cell, to-build)** | tiered diagnose |
| `systems` / `evallab` / `llmlab` | ④ Judgment | Foundations | decision simulators |
| `foundationlab` (FM Lab) | ④ Judgment | Foundations | scenario diagnose |
| `agents` / `agentlab` | ① Foundations (patterns) | ④ Judgment (failure modes, ConfigLab) | mixed |
| `playground` | ④ Judgment | Fluency-experiential | spot/diagnose; no code authoring |
| `aipm` (AI Product) | ④ Judgment | `⊗` comms (stakeholder explainer) | product decisions |
| Company Cases (`cases`, ex-Fluency) | ④ Judgment | `⊗` comms | case arena |
| `preplab` | ④ Judgment → **ASSESS** | Foundations | 597-Q measurement |
| Readiness Check (`assessment`, ex-Fluency) | ④ Judgment → **ASSESS** | — | self-test |
| Phrase Bank · Flashcards · Timed Drills · Mock Interview (ex-Fluency) | **⊗ Communication** | — | not a frame |
| Career → Negotiation / Salary | ⊗ Communication / career | — | Career-OS-adjacent |
| `retrieval/evaluation/agentshub/production/foundations` hubs | ◇ By-domain lens | — | secondary axis |
| `home / profile / progress / plans / paths` | ⌂ wayfinding | — | not frames |

---

## 4. Dissolving the "Fluency" tab (the rename the audit demanded)

The tab named **"Fluency"** is actually a *communication* lab — its own welcome screen says "train yourself to **describe** AI systems with the precision of a senior engineer." Its 8 modules (`FLUENCY_MODULES` in `Fluency.jsx`) redistribute as:

| Module (`id`) | Today | → Destination |
|---|---|---|
| Phrase Bank (`phrases`) | Fluency tab | **⊗ Communication** |
| Flashcards (`flashcards`) | Fluency tab | **⊗ Communication** |
| Timed Drills (`drills`) | Fluency tab | **⊗ Communication** |
| Mock Interview (`interview`) | Fluency tab | **⊗ Communication** |
| Company Cases (`cases`) | Fluency tab | **④ Judgment** |
| Readiness Check (`assessment`) | Fluency tab | **④ Judgment → ASSESS** (PrepLab-adjacent) |
| Prompt Engineering (`prompts`) | Fluency tab | **② Fluency** (seed) |
| Prompt Challenges (`challenges`) | Fluency tab | **② Fluency** (seed) |

**After redistribution the "Fluency" tab as a container is dissolved.** Note the payoff: the fluency *frame* is **not hollow** — it inherits two existing, genuinely-fluency surfaces (Prompt Engineering + Prompt Challenges are real authoring/fix work), and only the *code* sliver is to-build.

### Exact mechanical edits (post-approval — NOT applied here)
1. **`Fluency.jsx`** — keep the component but split `FLUENCY_MODULES`/`FLUENCY_GROUPS` along the destinations above; OR (simpler) retire the combined tab and surface the 8 modules from their destination frames. The 4 communication modules can live behind a single `⊗ Communication` entry.
2. **`App.jsx` `NAV_GROUPS`** (~1896) — replace the `CHALLENGE AREAS` grouping with the four frame groups from §2 (challenge areas demoted to a `◇ By Domain` group). The mobile drawer (~2907) inherits this automatically.
3. **`App.jsx` consumer re-points** — `~2033` "AI Systems Readiness Assessment" `tab:"fluency"` → Readiness Check's new home (ASSESS/PrepLab); `~2036` "Flashcard unknowns filter" `tab:"fluency"` → Communication flashcards; `QADashboard.jsx ~278` `{tab:"fluency"}` → re-point or drop.
4. **`VALID_VIEWS` / `SHORTCUT_TABS`** — handle the `fluency` id (keep as alias to one destination, or remove once unreferenced).
5. **`GUEST_ALLOWED_TABS`** — unchanged (gating is per-routed-tab, independent of frame grouping).

---

## 5. GSL's fluency frame — the narrow to-build spec (spec'd, NOT built)

This is the honest definition so the frame is **marked, not faked, not hollow.** GSL's fluency is a *small, domain-specific sliver* — not a general coding bank.

**What it is.** The deterministic LLM-systems glue you'd actually write by hand:
- a **chunker** (token/char windows, overlap, boundary handling);
- **retrieval / rerank glue** (top-k assembly, score sort, dedup, context packing);
- **structured-output parsing & validation** (JSON extraction, schema/field checks, repair);
- an **agent tool-loop with a stop condition** (max-iters, termination, loop-guard);
- an **eval scorer** — exact-match, embedding-similarity, and the LLM-as-judge *math* (not the call);
- **cosine similarity** by hand.

**No live model — mock the output, inject the failure.** Every problem ships a *mocked* model/tool output, and the mock is the failure injector: malformed JSON, a hallucinated extra tool call, a dropped field, a near-duplicate chunk. **The graded skill is writing code that survives the bad output.** This is GSL's "watch it break" thesis, expressed in the fluency frame — runnable in **Pyodide** (no backend, consistent with zero-backend GSL).

**Mostly a secondary layer on existing judgment surfaces — not a new bank.** GSL already makes users *diagnose* (RAG Lab, Spot-the-Flaw, Agents failure modes). Fluency is the **"now fix it in code"** companion: a Pyodide cell attached to those scenarios, so they become **primary-judgment, secondary-fluency**. Only a **small set are pure primary-fluency** problems — the glue/eval/parse ones above.

**Prompt work — gradeable forms only.** Two allowed shapes: (1) **"fix the broken prompt"** — given a prompt + its wrong output, identify and repair the structural flaw; (2) **"prompt + parser contract"** — write the prompt *and* the parser, graded on the parser against fixed outputs. **Never** free-form "write a good prompt." (Prompt Engineering + Prompt Challenges, inherited from the dissolved Fluency tab, are the seed surfaces for this.)

**Delegate general code to PSL (real cross-lab link).** The fluency frame must carry an explicit pointer: **"algorithms / general Python / SQL → Production Systems Lab."** GSL owns *only* the LLM-specific sliver; PSL owns general code fluency. (Cross-lab handoff per `HQ/LEDGER.md` conventions.)

**Framing.** This is **implementation & code-fix literacy**, not algorithmic speed. In GenAI you wire, parse, and fix glue around a non-deterministic model — you don't write algorithms fast. Label the frame accordingly so it's not mistaken for a LeetCode bank.

**Status: TO-BUILD.** Seed surfaces (Prompt Engineering, Prompt Challenges) exist now; the Pyodide code sliver + the secondary "fix it" cells on judgment scenarios are **specified here and built later** (gated behind the freeze + the distribution keystone, after PSL's general-code bank exists to delegate to). The frame is therefore honestly marked: **seeded + to-build**, never an empty section.

---

## 6. Build / QA / push checklist (for the post-approval implementation commit)

Per `BreakLabs/CLAUDE.md` — **build on macOS only** (sandbox Rollup ARM64 can't build; push auto-deploys to Vercel):
1. Edit `NAV_GROUPS` (+ demote challenge areas to `◇ By Domain`); verify the mobile drawer inherits it.
2. Redistribute `Fluency.jsx` modules; re-point the ~5 `tab:"fluency"` consumers; reconcile `VALID_VIEWS`/`SHORTCUT_TABS`.
3. `npm run build` on the Mac; click every frame group + every re-homed module; confirm guest gating + deep-links still resolve; confirm no orphaned `fluency` route.
4. 400px / mobile-drawer pass.
5. Approve-first push:
   ```bash
   cd ~/Documents/Professional/BreakLabs/labs/genai-systems-lab && \
   rm -f .git/index.lock .git/HEAD.lock && \
   git add -A && \
   git commit -m "feat(nav): four-frame IA + dissolve Fluency tab (reorg only, no new content)" && \
   git push origin main
   ```

**This spec doc itself is docs-only and ships via the §close-out push (no build needed).**

---

## Appendix — model-compliance checks
- **Frames are the top-level structure** ✓ (§2) — challenge areas demoted to a secondary lens.
- **"Fluency" tab dissolved, contents redistributed** ✓ (§4) — Mock Interview/Phrase Bank → comms, Case Arena → judgment, plus the full 8-module mapping.
- **Communication is cross-cutting, not a frame** ✓ — a ribbon (`⊗`), not a tab.
- **Ownership = scaffold + capture** ✓ — lab scaffolds; capture stays with Career OS.
- **Fluency defined narrow + domain-specific, marked TO-BUILD** ✓ (§5) — seeded by prompt work, code sliver spec'd not built, general code delegated to PSL.
- **Propose-only / freeze-respected** ✓ — no `App.jsx` or content edits this pass.

_Sources: `App.jsx` (`NAV_GROUPS` ~1896, render switch 2366–2425, `VALID_VIEWS` 1390, `GUEST_ALLOWED_TABS` 1394, Fluency consumers ~2033/2036), `Fluency.jsx` (`FLUENCY_MODULES`/`FLUENCY_GROUPS`), `Consultation.jsx`/`PrepLab.jsx`/`QADashboard.jsx` (aipm/career/fluency deep-links); `docs/FOUR-FRAME-AUDIT.md`; `HQ/COMPETENCE-MODEL.md` (DEC-15); `LINKEDIN.md` (freeze); `HQ/LEDGER.md` (naming divergence)._
