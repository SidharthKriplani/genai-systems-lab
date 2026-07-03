# GSL Information Architecture — target design & migration

> **READ THIS FIRST** before any nav/surface/routing change. This is the target IA the
> whole product resolves to. Companion: `GSL_CONTENT_AUDIT.md` (per-surface content verdicts),
> `GSL_MASTER_PLAN.md`, `GSL_ROADMAP.md`. Written 2026-07-03.

## The problem (why the current product overwhelms a human)
The app "works" but the navigation makes a human guess. Concretely:
- **~24 top-level entries.** 7-item personal strip (Home/Profile/Progress/Plans/My Tracks/Review/About) + 5 frames (KNOW/DO/BUILD/JUDGE/PREP&ASSESS) + a *parallel* BY DOMAIN list (Retrieval/Eval/Agents/Production).
- **The interview intent has 3 doors.** Want "interview questions"? PrepLab? Interview Room? Company Tracks? All under PREP & ASSESS, all feel right. A user shouldn't have to know the difference.
- **JUDGE and PREP & ASSESS are both "assessment."** The split is arbitrary to a learner.
- **Domains are a second axis that duplicates the frames.** Agents = Agent Lab (JUDGE) + Agents (BY DOMAIN) + agent modules in Foundations (KNOW). Same topic, 3 homes. Same for Retrieval/Eval/Production.
- **AI Product** sits in JUDGE but is off-mission (PM content).

Root cause: the nav is organized by the *builder's* mental model (frames + domains as parallel axes), not the *learner's* ("what do I want to do right now?").

## The principle
**One axis (the learner's verb), one home per intent, domain is a FILTER not a nav axis.**
A learner opens the app asking one of six things — the nav should answer exactly those:
1. What should I do next? → **Home**
2. I want to learn a concept → **Learn**
3. I want to practice / play → **Practice**
4. I want to build / read real code → **Build**
5. I want to prep for interviews → **Interview**
6. How am I doing / my saved stuff → **Me**

## Target IA (6 primary sections; ~24 entries → 6 + a filter)

### 1. Home
Front door: readiness score + "work next: weakest area" + resume-where-you-left-off. (Already built — keep.)

### 2. Learn  *(was KNOW)*
- **Foundations** — the 23 core modules + the niche tracks. The single place to learn concepts.
- **Ground Truth** — deep practitioner reads. (Keep as sub-section.)
- Domain (Retrieval/Agents/Eval/Production/Foundations) is a **filter chip** here, not a separate nav item.

### 3. Practice  *(was DO + the domain labs + BY DOMAIN)*
- **Playground** — all the interactive sandboxes (12 labs).
- **Domain Labs** — the rich diagnose-labs, one card per domain: **Retrieval Lab, Agent Lab, Evaluation Lab, Production Lab**. This is where the current BY DOMAIN hubs + Agent Lab LIVE now — no longer a parallel top-level axis. Each hub already threads its Lab + Case Chains.
- Python·DSA / SQL sibling links move to a small "sister labs" footer link, not a DO row.

### 4. Build  *(was BUILD)*
- **Project Labs** — System Design + Take-home. **The flagship interview content; promote it to the top of Build.**
- **Code Labs** — read-and-reason real-code walkthroughs (MCP, RAG pipeline, orchestrator, eval harness).

### 5. Interview  *(was PREP & ASSESS + the JUDGE assessment bits — THE fix for the 3-door problem)*
One home for everything interview. Sub-tabs:
- **Question Bank** — PrepLab (595 Qs; exam / drill / spaced-rep / browse). ← "interview questions" lives HERE, unambiguously.
- **Speaking** — the Fluency Speak/articulation core (tiered spoken drills, phrase bank).
- **Mock & Cases** — mock interview + company case scenarios (Fluency's Company Cases).
- **Company Tracks** — curated prep by company × role × level.
- **Readiness Check** — the quick diagnostic, labeled as "quick check" vs the full Question Bank exam.

### 6. Me  *(collapse the 7-item personal strip)*
- **Home** stays its own top item (the front door).
- **Me** = one hub with tabs: **Progress · My Tracks · Review · Plans · Profile**.
- **About** → footer link (not a primary nav row).

### Result
Top-level goes from ~24 to: **Home · Learn · Practice · Build · Interview · Me** (+ About in footer, + domain as a filter chip). A structure a human holds in their head.

---

## Current → target mapping (every surface gets one home)
| Current surface (route) | Current home | → Target home | Action |
|---|---|---|---|
| Home | personal | **Home** | keep |
| Profile / Progress / Plans / My Tracks / Review | personal (5 rows) | **Me** (tabs) | collapse 5 rows → 1 hub |
| About | personal | footer | move |
| Foundations (`concepts`) | KNOW | **Learn › Foundations** | keep |
| Ground Truth (`groundtruth`) | KNOW | **Learn › Ground Truth** | keep |
| Playground | DO | **Practice › Playground** | keep |
| Code Drills (soon), Python·DSA, SQL | DO | footer "sister labs" | move links out of nav |
| Code Labs (`codelabs`) | BUILD | **Build › Code Labs** | keep |
| Project Labs (`career`) | BUILD | **Build › Project Labs** (top) | promote + rename from "career" |
| Agent Lab (`agents`) | JUDGE | **Practice › Domain Labs › Agent Lab** | move out of JUDGE |
| AI Product (`aipm`) | JUDGE | — | RETIRE surface; salvage Launch Checklist→Build, AI-or-Not→Learn, Stakeholder Explainer→Interview/Speaking; CUT PRD+Roadmap |
| PrepLab (`preplab`) | PREP&ASSESS | **Interview › Question Bank** | keep, re-home |
| Interview Room / Fluency (`fluency`) | PREP&ASSESS | **Interview › Speaking + Mock&Cases** | split its modes into the Interview sub-tabs; merge redundant modes |
| Company Tracks (`company-tracks`) | PREP&ASSESS | **Interview › Company Tracks** (canonical) | keep; PrepLab company mode + Fluency Company Cases become feeders/filters |
| Retrieval / Evaluation / Agents / Production (BY DOMAIN) | BY DOMAIN | **Practice › Domain Labs** | dissolve the axis; each becomes a domain lab card under Practice; domain also a filter chip in Learn/Interview |

## Key decisions locked
- **Domain is a filter, not a nav axis.** BY DOMAIN dissolves. The 4 hubs become the Domain Labs under Practice. This kills the biggest triplication.
- **Interview is one section.** PrepLab=Question Bank, Fluency=Speaking+Mock, Company Tracks=Company. The 3-door problem is gone.
- **Personal strip 7 → Home + Me(hub) + About(footer).**
- **JUDGE frame dissolves** (its label is opaque anyway): Agent Lab→Practice, AI Product→retired/salvaged, assessment→Interview.
- **Labels use human verbs** (Learn/Practice/Build/Interview/Me), not KNOW/DO/JUDGE jargon.

## Migration — phased, non-breaking (each phase shippable, all routes/hashes preserved)
**Phase A — the Interview merge (highest UX win, fixes the 3-door pain):**
1. Create the **Interview** section; move PrepLab/Fluency/Company-Tracks under it as sub-tabs (Question Bank / Speaking / Mock&Cases / Company / Readiness Check).
2. Reconcile company content 3→1 (CompanyTracks canonical; PrepLab mode + Fluency Cases = feeders). [task #22]
3. Merge Fluency's redundant modes (two prompt modes; Mock vs Speak). [task #26]

**Phase B — dissolve BY DOMAIN into Practice:**
4. Rename **DO → Practice**; add a **Domain Labs** group (Retrieval/Agent/Eval/Production labs); move Agent Lab in from JUDGE; remove the top-level BY DOMAIN list.
5. Add `canonical:` pointers to the 2 straggler Playground widgets; reconcile MCP homes. [task #25]

**Phase C — collapse the personal strip:**
6. Build the **Me** hub (Progress/My Tracks/Review/Plans/Profile as tabs); About → footer. Rename KNOW→Learn, BUILD stays.

**Phase D — retire AI Product + promote Project Labs:**
7. Retire AIPM; salvage its 3 useful modes into their new homes; cut the 2 PM modes. [task #23]
8. Promote + fortify Project Labs at the top of Build. [task #24]

**Phase E — content fill (ongoing, not blocking):** niche skeletons [#21], more case-chains/code-labs, ASCII→SVG figures.

## Honest cost
Phases A–D are real nav/routing surgery (move surfaces, keep every route/hash/localStorage, no runtime test here → verify on the Mac build). Roughly: A ≈ a day, B ≈ half-day, C ≈ half-day, D ≈ half-day. Content fill (E) is open-ended. But A alone removes the single worst confusion (the 3 interview doors), and each phase ships independently.

## Decision log
| Date | Decision | Status |
|---|---|---|
| 2026-07-03 | Target IA: 6 sections, domain-as-filter, Interview merge, personal-strip collapse, JUDGE dissolves | proposed — awaiting user buy-in before execution |
