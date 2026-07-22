# DS-ADVERSARY-GATE.md — Design Studio pre-ship gate
### The mandatory independent audit every DS content batch must pass before it ships.
Adopted 2026-07-22 (Track 0, DS remediation program).

**Provenance note for reviewers:** unlike `DS-CONTENT-STANDARD.md` and `DS-GROUNDING-STANDARD.md` (near-verbatim
from pre-written proposal docs), this doc has no single pre-written source — it is assembled from three places:
`THE-Plan.md` Track 0's one-line description of an `ADVERSARY-GATE.md`, `DS-CONTENT-STANDARD.md` §3's
writer–adversarial loop, and `AMENDMENTS-2026-07-22.md`'s CORRECTION section (which is the actual binding
mechanism, superseding the earlier draft in Amendment C). Flag this doc specifically in Pass-2 for fidelity to
those three sources — it is synthesis, not copy, even though the underlying decisions are not new judgment calls.

---

## 1. Why this exists

`THE-Plan.md`'s founding claim: any single model — including the one that authored the original 28 roots — has
consistent blind spots on its own work. The fix is not a better model; it's an **independent adversarial gate**.
No DS content is "done" on the author's say-so.

## 2. The procedure (binding — per AMENDMENTS CORRECTION, supersedes any earlier draft)

There is one worker (the runbook's Sonnet execution session) and one orchestrator/auditor (Fable, the
brainstorm/supervisor session). No separate blinded sub-agent step exists in this repo's execution — that HANDOFF
draft is superseded. The gate is:

1. **Worker authors** the batch against `DS-CONTENT-STANDARD.md` (C1–C8) and `DS-GROUNDING-STANDARD.md`
   (provenance tier), per the specific work order (e.g. the named fixes in `FullAudit-AllRoots.md`).
2. **Mechanical checks**, same discipline as every other runbook ticket: `node --check` the data as `.mjs`;
   `esbuild <file>.jsx --format=esm --jsx=automatic` to catch JSX errors; brace/paren balance = 0; MSL apostrophe
   audit (unescaped `'` in single-quoted data strings breaks esbuild). Checks before Pass-2, always — never spend
   audit effort on syntactically dead output.
3. **Worker ends the turn with the standard REPORT block** (artifact, items done, self-check, flags, numbers
   introduced + source, deviations from work order — a silent deviation is a failed turn).
4. **Ledger row**, ticket id `DS-<n>`, status `checks-passed, Pass-2 pending` — written the same turn the checks
   ran, never from memory.
5. **Fable Pass-2** — **full pass, not sampling, for all DS content** (it is judgment-heavy; this is stricter
   than the general runbook default of 1-in-3 sampling after a clean streak, which does not apply to this lane).
   Pass-2 evaluates against:
   - The **4 lenses** from `HANDOFF.md`: correctness, structure, anchors, omissions.
   - The **C1–C8 criteria** from `DS-CONTENT-STANDARD.md`, criterion by criterion, each returning a specific
     charge or an explicit pass (see that doc §3 for the charge format).
   - The **grounding tier** from `DS-GROUNDING-STANDARD.md` — is the claimed tier (G1–G3 for a root) actually
     supportable, is the source real and cited, is `"Any"` honest or a confession.
   - The **~12 named correctness fixes** and **prompt-word omissions** from `FullAudit-AllRoots.md`, where the
     batch touches them — implemented exactly as specified; anything requiring judgment beyond the written spec
     should already have been FLAGged by the worker rather than improvised (per AMENDMENTS Amendment D).
6. **Accept or loop.** Same 3-loop cap as every runbook ticket. After 3 loops without a clean pass: Fable rewrites
   the batch directly, or the item is marked DROPPED with a reason logged in the ledger row.
7. **Track final gates and the GSL-vs-MSL parity pass are Fable's alone**, always — the worker never declares a
   track done on its own initiative.

## 3. Ship pipeline (unchanged from HANDOFF, restated here for the gate's own completeness)

Validate → inject the validated content into the real data ON THE DEVICE via a node script (device_bash) that
reads/writes the live file → `node --check` on device → **wait for Sidharth's explicit go** (approve-first,
binding — HANDOFF's own STEP 5) → commit + push, one commit per lab. Clear `.git/*.lock` first (`mv`, not `rm`,
per this repo's established mount convention). Git lock/permission errors mean the user pushes from their own
terminal.

## 4. What this gate is NOT

Not a rubber stamp, not a second author pass, not a quantified-proxy count (see `DS-CONTENT-STANDARD.md` §0 on
why the earlier proxy rubric was retracted). It is a **skeptic** — instructed to assume the batch is flawed and
find where.
