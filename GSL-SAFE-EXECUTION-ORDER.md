# GSL-SAFE-EXECUTION-ORDER — act on the overlap pass without rework

The point: **you don't need a perfect scan to execute safely.** You need every move to be individually reversible and ordered so no move can cascade. Then a missed overlap costs you nothing — you resolve it later on a base where nothing was destroyed.

This pairs with `GSL-OVERLAP-PASS.md` (what to do) — this file is *how to do it so you never undo*.

---

## The four rules (undo-by-construction)

1. **Archive, never delete (your D-18).** Before any change, `git tag pre-overlap-baseline` and move replaced files to `_legacy/` — never `rm`. Every cut is then one `git revert` / one folder-move away from restored.
2. **De-list before you cut.** Phase 1 of any removal = take it out of the **nav only** (a one-line change, instant revert). Live with it hidden. Phase 2 = cut/merge the **code** only after the hidden period surfaces no problem. If you mis-judged an overlap, you find out while it's *merely hidden*, before any surgery.
3. **Borrow before cut.** Never archive a loser until its borrowed asset is ported **and verified rendering** in the winner. Per-move checklist: ☐ asset identified ☐ ported to winner ☐ verified live ☐ *then* archive loser.
4. **Isolated before entangled.** Order moves by blast radius. A move that touches one file with no dependents can't cascade; a move that touches routing + cross-links can. Do the safe ones first, the entangled ones last when you have the most information.

---

## The sequence (lowest risk → highest)

**Wave 0 — Reversibility setup.** `git tag pre-overlap-baseline`; create `_legacy/`. (Nothing user-visible.)

**Wave 1 — De-list only, zero code cut.** Remove from the nav: Explore, Flows, and the legacy lab tabs (RAG Lab/agentlab/evallab/llmlab/foundationlab as *parallel* entries). Keep every hash + the `start.html` deep-links working. Fully reversible. **Then stop and look** — this alone tests whether anything breaks, before you've cut a line of content.

**Wave 2 — Isolated cuts** (one file, no dependents). Example: Explore's *simulated* tokenizer. Archive + remove. Each is self-contained; none can cascade.

**Wave 3 — Borrow-then-cut** (Explore's good assets). Port the 3D embedding viz, the 3D attention view, and the latency-budget tool into Concepts/Systems; verify each renders; *then* archive Explore's versions. Explore is now empty → de-list becomes a real removal.

**Wave 4 — Entangled merges** (touch routing / cross-links / tabs). The Systems agent-pattern standalones → tabs inside `AgentArchitecture`; the internal Agents memory merge. Do these **last**, with the most context, one at a time, each verified before the next.

**Wave 5 — Text corpus** (only after the GT + PrepLab scans land). GT dupes = **merge + 301-redirect**, *never* cut an indexed URL without the redirect (SEO). PrepLab dupes = cut the weaker of an interchangeable pair.

---

## Stop conditions (the undo triggers)
- A de-listed surface turns out to be a **deep-link target** (e.g., `start.html` → `#lab`/`#explore`) or a **guest-Aha** path → restore it + fix the link *first*, before proceeding.
- A **borrow won't verify** in the winner → halt that move; the loser stays until the asset is safely ported.
- Anything you're unsure is a true overlap → it stays *de-listed but un-cut* until a later scan or PostHog confirms.

---

## The one-line guarantee
Because of Rules 1–2, **at no point have you destroyed anything or broken a path you can't restore in a single revert.** Exhaustiveness improves the *plan*; this sequence makes the *execution* safe whether the scan turns out 95% or 100% complete. That's the protection you actually wanted — not omniscience, reversibility.
