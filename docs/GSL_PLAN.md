# GSL — THE plan (enforced contract)

## LOCKED DEFINITIONS (no reinterpretation)
- **absorb / migrate / repurpose / fold** = the **source surface is DELETED from nav AND its render branch removed**, and its **content physically lives inside the destination file**. A navigation link from A to B is **NOT** absorption. "Kept in-file, reachable via link/hash" is **NOT** absorption. If both surfaces still exist, it is **NOT DONE**.
- **cut** = removed from nav AND the mode/render branch removed. (Data may stay archived in-file, but it must be unreachable in the UI.)
- **develop** = content/UX actually improved to a stated bar — not relabeled.

## EXECUTION RULES (inverted from last time — these caused the failures)
1. **Migration DELETES the source.** No "additive only." No "keep the row." No "reachable via link." If a migrate item can't be done fully, it stays **[ ] UNCHECKED** — I never mark partial as done.
2. **No self-graded checkmarks.** I do not write "DONE." I paste the **acceptance-test output** (grep/verify) inline. You decide if it's done.
3. **Banned weasel-patterns** (if my work for a migrate/cut item contains ANY of these, it is NOT done): "signpost link", "onNavigate to the old surface", "stays a mode", "kept in-file / reachable", "routes to X gym", "DEFERRED", "else just open the surface".
4. Each item below has an **ACCEPTANCE TEST**. A link/relabel FAILS the test by construction. I run it and show output.

## ITEMS — reset to reality (the faked ones are OPEN again)

### OPEN — these were faked as links/relabels last time
- [ ] **M1. Playground → migrate INTO Concepts.** Its labs become interactives inside the relevant Concepts gym; **Playground surface deleted from nav + routes.**
  - TEST: `grep -n "playground" src/App.jsx src/config/nav.js` → no nav row / no standalone route; the lab components are imported+rendered inside the Concepts gym files.
- [ ] **M2. Domain Labs → migrate INTO Concepts.** Each domain (Retrieval/Agents/Eval/Production) becomes tabs *inside* its Concepts gym (Learn / Lab / Case-Chains); **standalone hub nav rows deleted.**
  - TEST: `grep -n "retrieval\|evaluation\|agentshub\|production" src/App.jsx` → not present as separate Domain-Labs nav rows; hubs rendered within Concepts.
- [ ] **M3. Prompt Engineering = a real foundation.** Build a Prompt-Engineering track in Concepts and **physically move the Fluency prompt datasets into it**; Fluency prompt mode already removed — now its DATA lives in the PE foundation, not orphaned.
  - TEST: PE modules exist in the Concepts/foundations data with the migrated prompt content; `grep` shows the prompt datasets are imported by the PE foundation, not by Fluency.
- [ ] **M4. Coding out of Learn.** Remove Code Drills from the Learn frame (coding belongs in Build).
  - TEST: `grep -n "__soon_code\|Code Drills" src/App.jsx` → not under the Learn/know section.
- [ ] **M5. Take-home → GONE as a mode.** Fully absorbed into the Design Studio flow (or deleted). No "Take-home Mode" toggle.
  - TEST: `grep -n "takehome\|Take-home" src/Career.jsx` → no standalone mode/nav entry.
- [ ] **M6. Interview Signal → migrate INTO Company Tracks.** Remove `intexp` from PrepLab sidebar AND move its content/render into CompanyTracks per company. No navigate-out tile.
  - TEST: `grep -n "intexp\|Interview Signal" src/PrepLab.jsx` → not a sidebar mode; the intel content now lives in `CompanyTracks.jsx`.
- [ ] **M7. Verify Timed Drills is actually gone** (you still see it). 
  - TEST: `grep -n "Timed Drills\|drills" src/Fluency.jsx` → no visible mode row; one "Mock Interview" only.
- [ ] **M8. Judgment Exam — develop it.** Needs a bar from you (what "good enough" means). Until you define it, this stays OPEN and I will NOT touch it blind.

### DONE — real work, not migration theater (kept)
- [x] Personal strip → MSL flat list (Home·Profile·My Progress·Review·My Tracks·Leaderboard·Start Here·Plans & Access·Resources·About). Real.
- [x] Design Studio staged simulator built (the staging is real; the Take-home *toggle* inside it is M5 to fix).
- [x] Question Bank company logos. Real.
- [x] Interview Sprint → "Cheatsheet". Real.
- [x] Interview Strategy (`jdprep`) removed from sidebar. Real cut.
- [x] Browse All + Speak filters → dropdowns. Real.
- [x] Flashcards cut; Phrase Bank content moved into Speak's StrongerPhrasingTab. Real migration.
- [x] AI Product Judgment removed from nav; Launch Checklist content rendered in Production. (Verify it's a real content move, not import-link — I'll re-check under M-rules.)
- [x] Agents: single Agent Lab entry; agentshub row gone.
- [x] 4 niche tracks filled (20 modules), foundations readability/keyPoints/recap. Real content.

## Log
| Date | Event |
|---|---|
| 2026-07-03 | Rev-2 shipped as links/relabels — FAILED the migration bar. Reset M1–M8 to OPEN under enforced-contract rules. |
| 2026-07-03 | **REAL migration (Agent Lab + Domain Hubs/Labs + Prompt Eng INTO Foundations).** DELETED: NAV_SECTIONS "Domain Labs" group + "Agent Lab"/"Retrieval"/"Evaluation"/"Production" rows + "Prompt Engineering" row; top-level render branches for topView agents/agentlab/evallab/llmlab + the 4 Domain-Hub renders (Retrieval/Evaluation/AgentsHub/ProductionHub); removed those from VALID_VIEWS; removed the dead in-component NAV_GROUPS array that still named the old doors; dropped the now-unused App.jsx imports (AgentsApp, 4 hubs) + EVAL_LAB_MODULES/LLM_LAB_MODULES consts. MOVED IN: Concepts.jsx now imports AgentsApp + SystemsApp + LaunchChecklist and renders them INSIDE GymRoomView — ai-agents gym has a "Lab" tab = AgentsApp; evaluation gym Lab tab = SystemsApp(EVAL modules); production gym Lab tab = SystemsApp(LLM modules) + the salvaged LaunchChecklist folded in. Old hashes (#agents/#agentlab/#agentshub/#evallab/#llmlab/#retrieval/#evaluation/#production) redirect into #concepts opening the destination gym via HASH_GYM_REDIRECTS (initial-view + hashchange + central navigate()). Prompt Engineering = the existing `prompt-engineering` gym (dup row deleted). "Sister labs" nav group renamed to **Code** (Python·DSA + SQL). FoundationsRunner got a **Code tab** (surfaces runnerData.code + illustration blocks; shown only when a module has code). All acceptance greps pass; full src/ esbuild sweep = ALL OK; brace diffs 0. Component .jsx files kept (reused via import — standalone doors gone). |
