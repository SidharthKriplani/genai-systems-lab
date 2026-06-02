# CROSS_LAB.md — Cross-Lab Coordination

Routes ideas between the three sibling labs. Patterns validated in one lab are documented here so they don't get rediscovered from scratch in the next session.

Last updated: June 2026 (sprint 48)

---

## Lab Boundaries — What Each Lab Owns

| Lab | Domain | Link |
|---|---|---|
| **GenAI Systems Lab (GAL)** | AI systems production failures — RAG, agents, evals, LLM serving, prompt engineering, AI judgment | genai-systems-lab-ivory.vercel.app |
| **ML Systems Lab (MSL)** | Classical ML, data engineering, deep learning, MLOps, model training decisions | ml-systems-lab-v9xe.vercel.app |
| **Product Analytics Lab (PAL)** | Product analytics, experimentation, A/B testing, stats, RCA, metrics, PM interview prep | productanalyticslab.com |

**Hard boundary:** RAG architecture, agent systems, LLM evaluation, and AI product judgment belong in GAL. MSL explicitly retired RAG territory. If a LinkedIn post or practitioner writeup touches these, it's GAL content.

---

## Unified North Star (all three labs)

A 6–8 week "Systems Engineer" learning path spanning all three labs. Each lab covers a distinct layer:
- GAL week 1–2: AI systems production failures (RAG, agents, evals)
- MSL week 3–4: Core ML, data engineering, MLOps
- PAL week 5–6: Experimentation, A/B testing, product analytics

Status: **Tier 3 in all three labs.** Nobody has executed on it. GAL should write the GT post first — that's the zero-code first step.

---

## Patterns GAL has that MSL/PAL can borrow

| Pattern | Status in GAL | Portable to |
|---|---|---|
| Trap field on PrepLab questions (what weak candidates say) | Live, 30 questions with staffLayer | MSL TrainerTab, PAL Trainer |
| Forward-pointer card at module endings (PrepLab + GT post) | Live across all 6 labs | MSL, PAL |
| 3-lens state-aware reading mode (Revise / What's Next) | Live in GroundTruth.jsx | MSL GradientTab, PAL Blog |
| Staff Layer (3rd tier answer reveal, access-gated) | Live in PrepLab (30 questions) | MSL StaffLayerTab (different impl, same concept) |
| Spaced repetition queue (wrong answers resurface on schedule) | Live: `gsl-preplab-spaced`, SRS intervals | MSL TrainerTab, PAL Trainer |
| Bookmarks on content cards | Live: `gsl-bookmarks` | MSL GradientTab, PAL Blog |
| Mock Exam Mode (timed, forward-only) | Live in PrepLab ExamConfig | MSL CombinatorTab (theirs is more mature) |
| Sparse heatmap guard (<7 days → message vs grid) | Live in Home.jsx | MSL HomeTab |

---

## Patterns MSL has that GAL should borrow

| Pattern | MSL implementation | GAL status |
|---|---|---|
| Verbal Practice (Web Speech API, transcript, WPM) | VerbatimTab — 25 questions, Chrome/Edge, self-rating | Not built. Tier 2 in GAL IDEAS.md |
| Code Bugs format (20 Python/SQL production bugs, find the bug) | CodeBugsTab | Not built. No equivalent in GAL |
| Case Studies (multi-part escalating company dossiers) | CaseStudiesTab — Netflix/Uber/Airbnb | GAL has scenario questions but not multi-part company case studies |
| 91-day heatmap | HomeTab, msl_activity_YYYY-MM-DD | **Done** in GAL (sprint 47) |
| Share Score clipboard button | CombinatorTab + TrainerTab | Not built in GAL |
| Gradient: state-aware reading mode | Tier 2 in MSL IDEAS.md | **Done** in GAL (sprint 37c) — GAL shipped first |
| Per-domain debrief breakdown chart | CombinatorTab debrief | GAL PrepLab has topic bars but not as a chart |

---

## Patterns PAL has that GAL should borrow

| Pattern | PAL implementation | GAL status |
|---|---|---|
| Defense Strategy v2 (resume input + gap-only rating + round history) | DefenseDocTab v2 spec (not yet built in PAL either) | Tier 1 in GAL IDEAS.md |
| Spot the Flaw (find the flaw in a real-looking analysis) | 12 adversarial cases (SRM, Simpson's Paradox, peeking) | Tier 1 in GAL IDEAS.md — needs GAL-specific failure modes |
| Role Readiness Score (Junior/Analyst/Senior/Staff) | Live: pal-role-score | GAL has a readiness score (Familiar/Practitioner/Senior/Staff) — similar |
| React.lazy() code splitting | All 30+ rooms lazy-loaded | Not done in GAL. Tier 2 |
| Company tracks (FAANG + top-tier) | Live | GAL has Company Tracks in PrepLab |

---

## Company logos fix (all three labs)

Use `https://www.google.com/s2/favicons?domain=company.com&sz=32` for companies not in SimpleIcons. Clearbit is unreliable and rate-limited. GAL currently uses SimpleIcons CDN for 12 known companies — correct. Letter-avatar fallback for others — also correct. No change needed in GAL.

---

## What GAL owns that the others don't

- **Adversarial "Do we even need it?" PrepLab questions** — tests when NOT to use AI. MSL retired RAG territory; these are GAL-specific.
- **Staff Layer on PrepLab** — 30 questions with senior framing. MSL has StaffLayerTab but it's IC3→IC5→Staff reveal on system design scenarios, not PrepLab question framing.
- **6 interactive labs** (RAG, Agent, Eval, LLM, Prompt, Foundation Models) — the broadest lab coverage in the ecosystem.
- **226 GT posts on AI systems** — the deepest content library in the specific GAL domain.
- **Failure mode completeness** — every lab scenario now has GT link + PrepLab question + trap field. This systematic cross-linking doesn't exist in MSL or PAL at the same depth.
