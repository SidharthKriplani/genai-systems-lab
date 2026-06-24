# GSL-SURFACE-AUDIT — does each component earn its place? (thorough, v2)

Live-grounded (read from `src/`, not the stale sprint-81 doc), full 7-dimension scorecard, and **adversarially reviewed** — the red-team pass reversed 2 verdicts and downgraded 6. This supersedes the first doc-level pass, which was too shallow and too confident.

**Three lenses, kept distinct:**
- `EVAL_RUBRICS.md` → *is it good?* (content quality)
- `docs/FOUR-FRAME-AUDIT.md` → *which frame?* (placement on the competence ladder)
- **this → *should it exist, and where?*** (purpose, overlap, demand, discoverability)

**ICP anchor:** mid-level engineer moving into AI engineering, interviewing within ~12 months. Demand is scored against *this* user.

**The honest headline, up front:** GSL's surface is genuinely confusing — but the cause isn't "too many features," it's **two navigation models running at once**, and the right response is *not* to churn it now. The HQ canon (D-10, D-01, D-24) explicitly defers nav restructuring behind distribution + identity capture, and most of the redundant surfaces aren't even indexed or guest-visible — so reorganizing them is motion, not progress. Ship the one cheap fix (collapse the double door), get PostHog data, then go build the capture moment.

---

## 1. The headline finding — the double front door

A redesign (challenge-area hubs) was layered **on top of** the old lab tabs without removing them. Both are live in the nav:

- **5 Challenge Hubs** (`retrieval`, `evaluation`, `agentshub`, `production`, `foundations`) — gateway pages that aggregate concepts + GT posts + PrepLab Qs + links into the labs. These are the **only SEO-indexed app surfaces besides GT** (`/agents`, `/retrieval`… are real HTML pages).
- **~17 legacy lab tabs** still reachable by hash (`lab`, `agentlab`, `evallab`, `llmlab`, `foundationlab`, `concepts`, `explore`, `playground`, `systems`, `career`, `fluency`, `aipm`, `flows`, `promptlab`, `consult`, `paths`).

So a user looking for RAG meets it **five times**: the Retrieval *hub*, the RAG *Lab*, the Concepts retrieval *gym*, the Playground chunking *scenario*, and Systems RAG *modules* — plus GT posts. That five-fold path, not feature count, is why you (and users) can't keep it straight. **This is the thing to fix; almost nothing else is.**

---

## 2. The rubric — 7 dimensions, 0–2 each

| Dim | Asks | 0 | 2 |
|---|---|---|---|
| **S1 Purpose** | One-sentence job, one user? | can't state it | crisp |
| **S2 Frame** | Clear competence frame? | drifts | one clear |
| **S3 Uniqueness** | Anything else do this? | duplicates a sibling | nothing else does |
| **S4 Demand** | Real JTBD for the ICP? | off-ICP / indulgence | core need |
| **S5 Discoverability** | Where a user would look? | hidden / mis-named / overload | obvious |
| **S6 Distinct value** | The "watch it break" payoff? | generic | signature |
| **S7 Upkeep vs use** | Earns maintenance? | dead weight | high leverage |

**A single 0 on S3 (Uniqueness) or S4 (Demand) usually decides the verdict.** Total is a tiebreak.

---

## 3. The scorecard (live surfaces) + corrected verdicts

Scores are `S1·S2·S3·S4·S5·S6·S7`. **When** column reflects the adversarial review: ✅ act now (cheap, reversible, on-canon) · 🟡 de-list now / defer the content move · 🔴 needs PostHog before acting · ⛔ don't touch.

| Surface (count) | Scores | Verdict | When |
|---|---|---|---|
| **Challenge Hubs** (5) | 2·2·1·2·2·1·2 | **KEEP** — make them the *single* front door | ✅ (= same move as relocating legacy) |
| **Legacy lab tabs** (RAG Lab, agentlab, evallab, llmlab, foundationlab) | 2·2·1·2·1·2·2 | **RELOCATE** — remove from top nav; reach *through* the hub; keep the hashes alive | ✅ but fix `start.html` deep-links first |
| **Concepts** (7 gyms, ~45) | 2·2·1·2·2·2·1 | **KEEP** — the canonical interactive-explainer home | ✅ |
| **Systems** (62) | 2·2·2·2·0·2·1 | **KEEP, but group** via the D-20 frame×domain axis (62 flat = overload) | 🔴 group by usage data, not ad hoc |
| **PrepLab** (596 Q) | 2·2·2·2·1·2·2 | **KEEP** — core + monetized; audit whether all 6 modes earn a slot | ✅ |
| **Ground Truth** (120+) | 2·2·2·2·1·2·2 | **KEEP** — depth spine + SEO engine; add frame labels to cards | ✅ |
| **Explore** (20 tools) | 1·1·0·1·1·1·1 | **DE-LIST** from nav; defer the tool redistribution | 🟡 (S3·0, but high-churn; not indexed/guest) |
| **Flows** (diagrams) | 1·1·1·1·1·1·2 | **DE-LIST** from nav; keep component; don't merge blind | 🔴 |
| **Playground** (6) | 1·1·1·1·1·1·1 | **DE-LIST**; verify overlap vs RAG Lab before any merge | 🔴 |
| **AIPM** (6) | 2·1·1·0/2·1·1·1 | **DE-LIST from primary nav**, keep as a *secondary-audience SEO surface* (not "park") | 🔴 (live indexed PM pages) |
| **Career** (6) | 1·1·1·2·1·1·1 | **KEEP intact**; the 3-way split is target-state only (Career-OS doesn't exist yet) | 🔴 |
| **FoundationModelsLab** | 2·1·1·2·1·2·1 | **Surface through Foundations hub**; keep guest-reachable; don't dissolve its scenarios | 🟡 |
| **Fluency** (8, "Drills") | 1·2·2·2·1·1·2 | **KEEP** — at most a one-word label fix | ⛔ leave it |
| **StudyRoom** | — | **KEEP as-is** — owner-only private Mastery Room (by design) | ⛔ not dead |
| **PromptLab** | 2·2·2·2·1·2·1 | **KEEP** — the real prompt-authoring surface; guest-allowed | ✅ |
| **Home / Profile / Plans / Progress / Paths / Ask** | wayfinding | **KEEP** — Home should funnel to one cold-start "first break" | ✅ |

### What the red-team reversed (and why I was wrong)
- **Fluency → was "REBUILD/RENAME." WRONG.** D-15 says *communication is the cross-cutting layer*, so a communication surface is on-canon, not mis-named. And "build code-fluency here" violates **D-07/D-17** — code-fluency is **PL's (Programming Lab) job**, deliberately a separate lab. Verdict corrected to **leave it alone**.
- **StudyRoom → was "CUT (dead route)." WRONG (false premise).** It's an *intentional owner-only* private SR tool gated to your own email (`App.jsx`, sprint 60). Not orphaned. Verdict corrected to **keep private** — and per PRODUCT-DESIGN Part 6 it's the seed of the retention engine GSL is missing, so the strategic move is the *opposite* of cut.
- **Explore / Flows / Playground / AIPM / Career → were confident "DISSOLVE/MERGE/PARK/SPLIT." Downgraded to "de-list now, defer the content move."** The merges are high-churn mechanical edits (the kind that caused sprint-67's six-bug cascade) under an active content freeze; several destinations don't exist yet (Career-OS); and AIPM/Career are **live indexed SEO clusters** (D-22) you shouldn't retreat from on a hunch. De-listing from nav is cheap and reversible (D-18); the content redistribution should wait for a lab to be open anyway (D-13) or for usage data.

---

## 4. The overlap matrix (the real "which is what")

From the live read — same skill taught across N surfaces (severity = how reachable/confusing):

| Topic | Lives in | Severity |
|---|---|---|
| **RAG / pipeline** | Retrieval hub · RAG Lab · Concepts gym · Playground · Systems · GT | **CRITICAL (5+)** |
| **Evaluation** | Evaluation hub · Eval Lab · Concepts gym · Systems · PrepLab · GT | **CRITICAL (5+)** |
| **Agents / ReAct** | Agents hub · Agent Lab · Concepts gym · Systems · GT | **CRITICAL (4+)** |
| **Chunking** | Concepts · Playground · Systems · GT | HIGH (3+) |
| **Cost / latency** | Explore · Systems · Production hub · GT | HIGH |
| **Tokenizer / embeddings / attention** | Concepts · Explore (3D) · GT | MEDIUM |
| **Guardrails / red-teaming** | Concepts · Systems · Playground · GT | MEDIUM |

The fix for almost all of it is **Section 1**: one front door per area (the hub), with the lab/concepts/systems content reached *through* it as a KNOW→DO→JUDGE flow — not as parallel top-nav tabs. Collapse the door and the overlap stops being visible.

---

## 5. The strategic reality check (the most important part)

The red-team's sharpest point, and I agree: **this audit's framing — "restructure the nav" — is itself slightly off-strategy.**

- **HQ defers it.** D-15 ends "labs not yet overhauled — pending, after the distribution keystone." D-10 = distribution is the keystone; D-01 = ship/capture before building more.
- **The redundant surfaces are invisible.** Explore, Flows, Playground aren't indexed and aren't guest-visible — so there's *no evidence* anyone hits them or is confused by them. Cutting blind under a freeze is pure downside.
- **The real leak is capture, not nav.** D-24 + PRODUCT-DESIGN Part 7: GSL *leaks hardest* (most SEO traffic, zero login). The one product fix that moves the needle is **identity capture at the investment moment** — not reorganizing tabs nobody can see.

**So the recommendation is deliberately small:**

1. **Ship this:** collapse the double front door — relocate the 5 legacy labs out of top nav (keep their hashes + fix the two `start.html` deep-links), so the hubs are the clean single entry. Cheap, reversible, helps the SEO front door read straight. *(Verdicts 1 + 11 — they're one move.)*
2. **Don't touch:** Fluency, StudyRoom.
3. **De-list (cheap), defer the merge:** Explore, Flows, Playground, FM-Lab-into-hub — nav-only, no content surgery yet.
4. **Get PostHog** tab-hit data before cutting or merging anything, and before regrouping the 62 Systems modules.
5. **Then close this audit and go build the capture moment (D-24).** That's the work that pays.

---

## 6. Caveats
- **Propose-only, freeze-aware.** Nothing here is built. Per D-18, any de-list/merge archives to `_legacy/`, never `rm`.
- **The one missing input is behavioral data.** Every 🔴 verdict is gated on PostHog usage I can't pull from here. Structure tells you what *overlaps*; only data tells you what's *dead*.
- **Confidence:** Section 1 (double door) and the act-now move are SOLID and code-verified. The merge/cut calls are intentionally held until data — that's the correction from v1, where I made them too confidently.
