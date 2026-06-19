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

*(No entries yet — log first feedback session here)*

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
