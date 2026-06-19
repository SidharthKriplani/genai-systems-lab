# FEEDBACK.md — User & Tester Feedback Log

Running log of feedback from real users, testers, and observers.
Distinct from AUDITS.md (internal product audits) and PRIVATE_TEST.md (test protocol).

Log format per entry:
- Date, source type, session context
- Raw observation or quote (verbatim where possible)
- Interpretation
- Action taken or deferred (with sprint reference)

*Created: June 2026*

---

## How to use this file

**Log here:**
- Tester session notes (from PRIVATE_TEST.md sessions)
- Direct user messages / DMs about the product
- LinkedIn comments with signal
- Teamblind / Reddit mentions
- Support-style questions (things users couldn't figure out)
- "I wish it did X" feedback
- Drop-off observations (user got confused at a specific point)

**Do not log here:**
- Internal product opinions (use AUDITS.md)
- Speculative "users probably want X" (use IDEAS.md)
- Competitive observations (use COMPETITORS.md)

**Action status tags:**
- `OPEN` — not yet addressed
- `IN PROGRESS` — being worked on in a sprint
- `DONE (sprintN)` — actioned, sprint reference
- `DEFERRED` — acknowledged, not yet prioritised
- `NOT ACTIONING` — conscious decision with reason

---

## Feedback entries

---

### Session 1 — June 2026
Source: Real new user (PAL, beginner) — cross-applicable to GSL
Context: Cold visitor, product-first session, no prior context
Profile: Beginner, targeting product analytics interviews, no prep background

RAW OBSERVATIONS
─────────────────────────────────────
"The home screen felt a bit overwhelming because I was seeing 222 items, so many rooms, guided paths, study plans, readiness charts, SQL progress, learning paths etc etc etc. Instead of immediately knowing what to do, mera first thought tha ki where do I actually start?"

"The platform assumes beginners already know terms like RCA, Instrumentation vagera. A small one-line explanation or why this matters tooltip would make things much less intimidating."

"Multiple recommendations at once like Start Metrics, Beginner Path, Guided Paths, Study Plan and Learning Paths — became a little confusing. As a beginner I'd rather have one clear recommendation saying this is where you should begin."

"The progress system is nice, but it could feel more motivating with milestones like complete your first 5 cases, you're 15% interview ready, or an estimated completion time for a track."

INTERPRETATION (GSL translation)
─────────────────────────────────────
This is a cold-start problem, not a content problem. GSL has the same shape: 6 labs, 57 Systems modules, 27 Concepts modules, 597 PrepLab questions, 310 GT posts, 2 learning paths, 6 challenge areas, readiness bars, guided paths. A cold visitor sees all of this and has no idea where to start.

Three distinct sub-problems:
1. Too many competing first steps (6 challenge area cards + PrepLab + GT + paths all visible at once)
2. Jargon without anchoring (RAG, retrieval, hallucination, evals — none of these mean anything to someone arriving cold)
3. Progress framing is a grid/bar, not a milestone — feels like a dashboard, not a journey

ACTIONS
─────────────────────────────────────
[ ] 3-question onboarding modal at first visit (already in IDEAS.md P1) — escalate to P0 — status: OPEN
[ ] Cold home view: show ONE recommended starting point after questionnaire, not 6 challenge areas — status: OPEN
[ ] Jargon anchoring: add one-line "what this tests in interviews" tooltip to each challenge area and lab label — status: OPEN
[ ] Milestone language in progress: "Complete your first scenario", "You're 20% ready for a RAG interview" vs. raw bars — status: OPEN
[ ] Competing recommendations: audit cold home view for how many CTAs a new user sees simultaneously — status: OPEN

---

## Template for a feedback session

```
### Session [N] — [Date]
Source: [tester / user DM / LinkedIn comment / Teamblind / observed]
Context: [cold visitor / returning user / tester brief / organic]
Profile: [role, experience level if known]

RAW OBSERVATIONS
─────────────────────────────────────
[verbatim quote or paraphrase]
[verbatim quote or paraphrase]

INTERPRETATION
─────────────────────────────────────
[what the observation means for the product]

ACTIONS
─────────────────────────────────────
[ ] Item 1 — status: OPEN / DONE (sprintN) / DEFERRED
[ ] Item 2 — status: OPEN / DONE (sprintN) / DEFERRED
```

---

## Patterns (update after 3+ sessions)

Once 3 or more sessions are logged, summarise recurring themes here.
Example structure:

| Pattern | Frequency | Status |
|---|---|---|
| Users confused about where to start | 3/3 sessions | OPEN |
| PrepLab gate fires before user understands value | 2/3 sessions | OPEN |
| RAG Lab Scenario 1 is the clearest entry point | 3/3 sessions | Confirmed — GREEN surface |

---

## Feedback sources to watch

| Source | Check frequency | Signal type |
|---|---|---|
| Direct tester sessions (PRIVATE_TEST.md protocol) | Per session | Highest signal |
| LinkedIn post comments | Per post | Discovery + positioning |
| Teamblind threads | Monthly | High-intent ICP signal |
| Reddit (r/MachineLearning, r/cscareerquestions) | Monthly | Broad signal |
| GSL FeedbackBar submissions (in-app) | Weekly | UX + content |
| Direct DMs / email | As received | High signal, low volume |
