# EVAL_RUBRICS.md — quality rubric library + triage harness design

Design spec only. No code yet. This is the blueprint for a *single* reusable quality harness for GSL, not a pile of per-component rubrics. Build order and "do-not" notes at the end.

Doctrine (inherited from the PAL foundations harness): **`review` = look, `ok` ≠ clearance. The harness shortlists; you adjudicate.** It never auto-passes or auto-edits content.

---

## 1. The shape: one harness, one shared rubric library

The mistake to avoid is N bespoke rubrics for N component types (rubric sprawl — nobody runs 40 rubrics). Instead:

- **One harness** (`scripts/triage_gsl.py`) that takes a `--component` flag.
- **One shared dimension library** (§2) — the same ~7 quality angles.
- **Per-component profiles** (§3) that select a subset of shared dimensions + add 1–2 component-specific ones.
- **Two-stage scoring** (§4): a cheap deterministic gate, then an LLM-as-judge triage. Output is a CSV ledger, worst-first.

Reuse over proliferation. Adding a component type = a new profile (a dozen lines), not a new harness.

---

## 2. Shared dimension library (the "angles")

Each dimension scores **0–2** (0 = fails, 1 = thin, 2 = solid) and emits a flag when ≤1. Keep the flag names stable — they're the CSV vocabulary.

| Dim | Flag | Measures | Failing signal |
|---|---|---|---|
| **D1 Intuition** | `no-intuition` | Plain-English *why*, not just *what* | Defines a term, never explains the mechanism or motivation |
| **D2 Concreteness** | `no-example` | A worked example or failure demo | All abstraction, no instance the reader can hold |
| **D3 Accuracy** | `inaccurate` | Claims are technically correct | A statement a domain expert would flag wrong/misleading |
| **D4 Fidelity-honesty** | `overclaim` | The fidelity/level badge matches reality | Labeled `faithful` but hand-waves; labeled `simplified` but claims rigor |
| **D5 Depth-fit** | `depth-mismatch` | Content matches the stated level | A "beginner" module assumes grad math; an "advanced" one stays surface |
| **D6 Synthesis** | `no-forward` | Connects out (lab / PrepLab / GT) | Dead end — nothing to do or read next |
| **D7 Engagement** | `static` | (Interactive components) manipulate → see it break | A "module" that's just prose; no control, no failure to watch |
| **D8 Competency** | `low-competency` | How far up the capability ladder this can take a learner *from this alone* (recall → apply → transfer → mastery) | Builds exposure/familiarity only — no transferable skill, no path to depth |

Overall: **`ok`** if zero flags, **`review`** if ≥1. Sort the ledger by flag count desc (worst first), like PAL.

### 2.1 The competency ladder (D8 detail — the outcome dimension)

D1–D7 measure *quality*. D8 measures **outcome**: does the component actually make you competent, and to what depth? Score against the rung it can carry a learner to alone:

- **Rung 0 — Exposure:** you've seen the term. (`low-competency` flag — exposure is not competency.)
- **Rung 1 — Recall:** you can state what it is and when it applies.
- **Rung 2 — Apply:** you can use it / configure it / spot it in a system.
- **Rung 3 — Transfer/Depth:** you can derive it, reason from it to a new case, debug it under stress.
- **Rung 4 — Mastery:** you can teach it, critique it, and operate at the frontier.

Scoring: 0 = rung ≤0, **1** = rungs 1–2 (recall/apply), **2** = rungs 3–4 (transfer/mastery). A learning component that strands you at Exposure scores 0 even if it's pretty.

**Structural proxy for the gate:** the depth (Gradient) layer is what carries a module from Apply → Transfer/Mastery. So `gradient-missing` (no depth layer) caps a module at rung 2 and is a strong `low-competency` signal; `gradient-skeleton` = depth promised, not delivered. A sim-only module is competency-capped by construction — exactly the gap the Gradient layer exists to close.

> **Cross-lab naming flag.** "Gradient" is also the name of MSL's blog series. Using it for GSL's depth layer is either deliberate cross-lab branding (one word = "go deeper") or a collision. This is an `ECOSYSTEM_LEDGER.md`-level decision — resolve before either lab markets the term. Options: unify the meaning, rename GSL's layer, or scope the names per lab.

---

## 3. Per-component rubric profiles

Each profile = shared dims that apply + component-specific dims + the data source the harness reads.

### 3.1 Concepts modules
- **Source:** `src/Concepts.jsx` (MODULES registry + component prose). *Extraction caveat: components are JSX — the gate reads registry metadata; the LLM triage needs a text extract (parse JSX text nodes, or maintain a per-module content manifest). This is the one non-trivial plumbing bit.*
- **Dims:** D1–D8 (all — modules are the flagship; **D8 competency is the headline outcome**).
- **Component-specific:** `no-fidelity` (registry entry missing a `fidelity` tier/note), `gradient-missing` / `gradient-skeleton` (depth layer absent / not yet built — caps competency).

### 3.2 Gradient panels (easiest target — start here)
- **Source:** `src/data/gradientContent.js` (structured blocks — trivially parseable).
- **Dims:** D1, D3, D5, D6.
- **Component-specific:** `no-derivation` (no `math` block / no "why" `key` block), `thin-refs` (<2 canonical `refs`), `skeleton` (still `{ soon, outline }` — informational, not a defect).

### 3.3 Ground Truth posts
- **Source:** `groundTruthPosts.js` + `groundTruthIndex.js` (block format).
- **Dims:** D1, D2, D3, D5, D6.
- **Component-specific:** `no-citation` (claims without `refs`/links), `contamination-risk` (benchmark numbers/quotes that could be stale or unverifiable), `thin` (block count below the series norm).

### 3.4 PrepLab questions
- **Source:** `src/data/preplabQuestions.js` (structured).
- **Dims:** D3, D5.
- **Component-specific:** `weak-distractor` (an option no informed person would pick / two defensible answers), `weak-trap` (the `trap` field isn't an overclaim→honest-reframe), `diff-miscal` (difficulty label vs. actual), `dead-readmore` (`readMore.postId` not in the index).

### 3.5 Lab scenarios
- **Source:** `ragScenarios.js` and per-lab scenario data.
- **Dims:** D2, D3, D6.
- **Component-specific:** `unrealistic` (failure mode wouldn't occur in production), `no-recovery` (breaks but never shows the fix), `named-failure-missing` (no explicit failure-mode label).

---

## 4. Scoring model — two stages

**Stage A — deterministic gate (cheap, no model).** Structural checks that don't need judgment: required fields present (`fidelity`, `level`, `refs`, `readMore` valid), forward-pointer exists, block-count thresholds, monochrome-compliance (no raw hex / killed palettes via the existing `npm run check:color`), brace/parse sanity. Emits the structural flags (`no-fidelity`, `dead-readmore`, `no-forward`, `thin-refs`, …). Catches ~40% of issues for free and pre-filters what the LLM even looks at.

**Stage B — LLM-as-judge triage.** Only the judgment dims (D1–D5 intuition/example/accuracy/honesty/depth, weak-distractor, etc.). Local model via LM Studio (your `qwen2.5-7b-instruct` default), so it's free and deterministic-ish. Bias controls are mandatory (§5).

**Output — CSV ledger** `scripts/triage_<component>.csv`:

```
id, component, room, score (0–16), flags, verdict(ok|review), one_line_reason
```

Worst-first shortlist printed to stdout (mirror PAL's format). The CSV is the durable ledger; the verdict is advisory.

---

## 5. The judge prompt (skeleton) + anti-gaming

Because the triage *is* an LLM-as-judge, it inherits every judge failure mode — so the harness must defend against them (this is the `llm-as-judge` / `eval-design` content, applied to ourselves):

- **Rubric-anchored, not vibes:** prompt gives the 0–2 scale + an explicit failing example per dimension. Ask for per-dimension score + a one-line justification *before* the verdict (forces grounded scoring).
- **Position bias:** N/A for single-item grading, but if ever comparing two versions, swap order and average.
- **Verbosity bias:** instruct "length is not quality; a short module can score 2." Otherwise long modules look better.
- **Self-preference:** the judge model is not the author model where avoidable; note it in the ledger.
- **Calibration:** before trusting it, hand-label ~15 modules and measure judge–human agreement (Cohen's κ, not raw %). Ship the harness only if κ is decent; otherwise tighten the rubric.
- **Goodhart guard:** `ok` is "no flags found," **not** "good." Don't optimize modules *to the rubric*; spot-check that high scores still read well to a human. The rubric is a smoke detector, not a certificate.
- **Determinism:** fixed temperature (low), fixed seed where the runtime allows, pinned model string in the CSV so results are reproducible across runs.

---

## 6. Harness interface (mirrors PAL)

```
python3 scripts/triage_gsl.py --component concepts --limit 5
python3 scripts/triage_gsl.py --component gradient            # all
python3 scripts/triage_gsl.py --component preplab --room rag
```

- `--component` selects the profile (§3). `--room`/`--limit` scope the run (gym, topic, or count).
- Stage A always runs; Stage B runs if LM Studio is reachable (else gate-only, like your `--room exp` deterministic pass).
- Writes `scripts/triage_<component>.csv`; prints worst-first shortlist + the doctrine line.

---

## 7. Build order + do-nots

**Order (when you build):**
1. **Gradient panels** — structured data, no JSX extraction; proves the harness in an afternoon.
2. **PrepLab questions** — also structured; high payoff (distractor/trap quality).
3. **GT posts** — structured blocks.
4. **Concepts modules** — last, because the JSX→text extraction is the only real plumbing.
5. **Lab scenarios** — once the pattern is proven.

**Do-not:**
- Don't write separate rubrics per component — extend §2 + add a §3 profile.
- Don't let the harness edit content. Shortlist only; you adjudicate.
- Don't gate distribution on this. You're pre-traction — the harness is a quality *aid*, not a release blocker, and over-building it now is the "wildly building everything" trap. One component type proven > five half-built.
- Don't trust `ok` as "shipped-quality." Calibrate against humans first (§5).

---

*Scope note: spec only, per the token-saving week. The actual harness (`scripts/triage_gsl.py`) is unbuilt — this doc is the contract to build against, reusing the PAL `triage_foundations.py` pattern (deterministic gate + LM Studio triage + CSV ledger).*
