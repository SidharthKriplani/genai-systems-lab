# GSL — THE plan (single source of truth)

> One doc. The ordered fix-list is the whole plan. Work top-down, one item per commit.
> History lives in `GSL_MASTER_PLAN.md` (build log). Nothing else competes with this file.
> (Superseded & folded in here: GSL_ROADMAP, GSL_CONTENT_AUDIT, GSL_IA_PLAN.)

## Target shape (what we're resolving toward)
A human should navigate by verb, one home per intent, domain = a filter (not a nav axis):
**Home · Learn · Practice · Build · Interview · Me** (+ About in footer).
- Learn = Foundations + Ground Truth.
- Practice = Playground + the Domain Labs (Retrieval/Agent/Eval/Production) — BY DOMAIN dissolves into here.
- Build = Project Labs (flagship) + Code Labs.
- Interview = ONE home: Question Bank (PrepLab) · Speaking & Mock (Fluency) · Company Tracks.
- Me = Progress/My Tracks/Review/Plans/Profile as one hub. JUDGE frame dissolves; AI Product retired.

## THE FIX LIST (do in order, one commit each)
- [x] **1. Interview clarity — relabel** so "interview questions" is obvious: frame PREP&ASSESS → **INTERVIEW**; PrepLab → **Question Bank**; Interview Room → **Speaking & Mock**. (Label-only, safe.) _(done earlier — INTERVIEW frame + Question Bank/Speaking & Mock labels confirmed in NAV_SECTIONS)_
- [x] **2. Company content 3→1** — CompanyTracks canonical; PrepLab company mode + Fluency Company Cases become feeders/filters. _(done 2026-07-03: PrepLab company mode relabeled "Questions by company" + signpost link to Company Tracks; Fluency Company Cases relabeled "Company scenarios (spoken)" + signpost. All 3 kept working; none deleted.)_
- [x] **3. Dissolve BY DOMAIN → Practice** — rename DO → Practice; group the 4 domain labs + move Agent Lab in from JUDGE; drop the parallel BY DOMAIN list. _(done 2026-07-03)_
- [x] **4. Collapse personal strip** — Home stays; Progress/My Tracks/Review/Plans/Profile → one **Me** hub; About → footer; KNOW → Learn. _(done 2026-07-03)_
- [x] **5. Retire AI Product** — cut PRD Simulator + Roadmap Prioritizer; salvage Launch Checklist → Build, AI-or-Not → Learn, Stakeholder Explainer → Interview. _(done 2026-07-03: PRD + Roadmap dropped from AIPM's mode registry — components archived in-file, not deleted. 3 salvage modes kept. Surface relabeled "AI Product Judgment" + re-homed to **Practice** (whole-surface, not per-module). Empty `judge` frame removed from NAV_SECTIONS; dangling judge frame-map refs repointed to "do". aipm route/hash intact.)_
  - **DEFERRED (follow-up):** finer per-module re-home — Launch Checklist→Build, AI-or-Not→Learn, Stakeholder→Interview. Trimmed surface currently lives whole under Practice.
- [x] **6. Promote Project Labs** to the top of Build. _(done 2026-07-03)_
- [x] **7. Widget dedupe stragglers** — `canonical:` pointers on Playground KV Cache (→LLM Lab) + Agent Loop Sim (→Agent Lab); reconcile the 3 MCP homes. _(done 2026-07-03: `canonical:` added to Playground KV Cache (→LLM Lab/Concepts kv-cache) + Agent Loop Sim (→Agent Lab Loop Simulator), mirroring the Chunking/Reranker/Temperature pattern. MCP cross-link: Agent Lab MCP Deep Dive → "see the real code in Code Labs (mcp-server-min)"; Code Labs mcp-server-min → "see the concept in Agent Lab". Systems `mcp` left as-is per note.)_
- [x] **8. Tighten Fluency + Agent Lab** — merge Fluency's 2 prompt modes; verify Mock vs Speak; label Readiness↔Question-Bank; merge Agent Lab's 2 memory modules; fortify Framework Landscape. _(done 2026-07-03: Fluency's 2 prompt modes MERGED into one "Prompts" entry via `PromptModeMerged` wrapper (sub-tabs Failure patterns / Design challenges) — both datasets + components kept; stale `challenges` state falls back to merged mode. Readiness Check relabeled "quick diagnostic" + note pointing to full Question Bank exam. Agent Lab's 2 memory modules RELABELED as "Memory · Foundations" / "Memory · Libraries" pair (full component merge DEFERRED — both large tabbed components; nesting risk). Framework Landscape fortify DEFERRED (content lift, not this pass).)_
- [ ] **9. (ongoing, non-blocking)** fill the 4 niche skeleton tracks (20 modules); more case-chains/code-labs; ASCII→SVG figures.

## Content verdicts (reference for the fixes above)
Strong & KEEP: Agent Lab (crown jewel), Project Labs (best interview content), PrepLab bank, Playground's unique labs, Fluency's Speak/Company-Cases/Timed-Drills, Foundations (23 core, at MSL parity).
Redundant → one home: company content (3 places), KV-Cache/Agent-Loop widgets, MCP (3 homes), Fluency prompt modes, Agent Lab memory modules.
Off-mission → cut/salvage: AI Product (PRD + Roadmap cut; 3 modes salvaged).

## Log
| Date | Done |
|---|---|
| 2026-07-03 | Plan consolidated into this one doc; execution begins at item #1 |
| 2026-07-03 | Items #2, #5, #7, #8 shipped (#1 confirmed done). **#2:** company content 3→1 signposts — PrepLab "Questions by company" + Fluency "Company scenarios (spoken)", both link to canonical Company Tracks; none deleted. **#5:** AI Product trimmed (PRD + Roadmap archived in-file, dropped from registry), 3 salvage modes kept, surface relabeled "AI Product Judgment" + re-homed whole to Practice; empty `judge` frame removed; aipm route/hash intact. **#7:** `canonical:` on Playground KV Cache + Agent Loop Sim; MCP concept↔code cross-link (Agent Lab ↔ Code Labs mcp-server-min). **#8:** Fluency 2 prompt modes merged (PromptModeMerged sub-tabs, both datasets kept); Readiness Check "quick diagnostic" label; Agent Lab memory modules relabeled Foundations/Libraries pair. Deferred: per-module AIPM re-home, Agent memory full-component merge, Framework Landscape fortify. Additive/relabel/relocate only; hard-deleted nothing. All 94 src files parse OK. |
| 2026-07-03 | Items #3, #4, #6 shipped (nav restructure). DO→Practice + Agent Lab/4 domain hubs grouped under "Domain Labs"; top-level BY DOMAIN list removed (routes intact). KNOW→Learn. Personal strip 7→2 (Home + Me); new `src/Me.jsx` landing links to Progress/My Tracks/Review/Plans/Profile; `me` tab wired (lazy + VALID_VIEWS + route + #me + ALL_TABS + guest-allowed). About moved to sidebar footer (still routable). Project Labs promoted above Code Labs in BUILD. JUDGE keeps only AI Product (retire deferred to #5). All 94 src files parse OK. Additive/relabel/relocate only — no routes/hashes/keys deleted. |
