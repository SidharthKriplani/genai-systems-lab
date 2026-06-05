# PRIVATE_TEST.md — Guided Private Test Package

*Created: June 2026 (sprint 59 release-readiness pass)*
*Status: Ready for 3–5 person guided private test. Not a public launch.*

---

## What this is

A structured guide for running a small, controlled private test of GenAI Systems Lab before any public distribution. The goal is to validate that the product's first-session experience is coherent enough to warrant broader sharing.

This is not a launch. Do not send a public link. Do not post on HN or LinkedIn yet.

---

## 1. Ideal tester profile

Invite 3–5 people who match this profile exactly:

**Must have:**
- Mid-level software engineer, 3–6 years of experience
- Either actively interviewing for AI/ML engineering roles, OR planning to within the next 6–12 months
- Enough background to understand what RAG, agents, or evaluation means at a conceptual level
- Willing to give honest feedback (not just polite feedback)

**Nice to have:**
- Has used interview prep tools before (LeetCode, Educative, etc.) — gives useful comparison frame
- Works at a company that builds or deploys LLM-based products

**Avoid:**
- People who already know the product or have seen it before
- Completely non-technical users
- People who will only give encouraging feedback
- Senior staff engineers (they are not the primary ICP right now)

---

## 2. Exact tester instructions

Send this to each tester — nothing else before the session:

---

*"I'm testing a new product for AI engineers preparing for interviews. Open this link as if you found it on your own — no sign-in, no prior context. Spend 15–20 minutes exploring however feels natural. I'll ask you 8 questions after.*

*Link: genai-systems-lab-ivory.vercel.app*

*One suggestion: start with the Retrieval section."*

---

**Do not** explain what the product is before they open it. That is the test.

**Do not** tell them to sign in. Let that happen naturally.

**Do not** show them any prepared walk-through first.

### Intended first-session path (observe, don't guide)

The path a tester should be able to find on their own:

1. Land on home → see "CHALLENGE AREAS" in sidebar
2. Click "Retrieval" → open Retrieval hub
3. Click "RAG Lab" subitem → open RAG Lab
4. Start Scenario 1 ("Missing Answer") — it is guest-accessible, no sign-in needed
5. Configure the system → hit Evaluate → see the failure
6. Read the synthesis card: "You reproduced: Hallucination from retrieval gap"
7. See the PrepLab CTA and GT post forward pointer
8. See the guest sign-in nudge: "5 more failure modes wait. Sign in to continue."
9. Optionally sign in → land on Progress page → see "Start here" banner if no history

If a tester gets stuck before step 4, that is a critical signal.

---

## 3. Observer questions (ask after the session)

Ask these in order. Take notes on hesitation, not just answers.

**Orientation (first 2 minutes of product)**
1. "What did you think this product was in the first 30 seconds of opening it?"
2. "Did you know what to do first? What made you click what you clicked?"

**Core experience**
3. "Did you complete the RAG Lab scenario? Walk me through what happened."
4. "After the scenario ended, what did you take away? Could you explain the failure mode you saw to someone else?"
5. "At what point — if at all — did you understand why this product is different from reading a blog post or watching a video?"

**Friction + confusion**
6. "What felt confusing or broken?"
7. "Was there anything that made the product feel less credible or less serious?"

**Return intent + value**
8. "Would you come back to this tomorrow? Why or why not?"
9. "What part of the product would you actually pay for? What feels like it should be gated?"
10. "Would this help you prepare for a senior AI engineering interview at Google, Meta, or a startup?"

---

## 4. Success criteria

### Ready for broader distribution if ALL of these hold:

| Signal | Threshold |
|---|---|
| Testers understand the product promise in under 1 minute | ≥ 3 of 5 |
| Testers complete RAG Scenario 1 without being told to | ≥ 3 of 5 |
| Testers can explain one specific failure mode they learned | ≥ 3 of 5 |
| Testers say they would return or want continued access | ≥ 2 of 5 |
| No major navigation confusion appears in multiple testers | ✓ |
| No React errors or broken pages reported | ✓ |

### Needs one more coherence sprint if ANY of these appear:

| Signal | Meaning |
|---|---|
| Majority think it is a blog/content library | First-session path still broken |
| Majority fail to find the interactive lab | Nav still reads as textbook, not simulator |
| Majority don't understand what happened after the scenario | Synthesis card not landing |
| Multiple testers confused by Evaluation or Agents | Hub pages feel disconnected from main promise |
| Access/pricing copy creates confusion | Plans framing still unclear |
| Repeated navigation dead-ends | Structural IA problem |

---

## 5. What NOT to ask testers about

- Do not ask for pricing sensitivity in detail — they haven't used the product enough to judge this
- Do not ask them to review all content depth — you are testing the first-session experience, not the full library
- Do not ask them to evaluate every lab — focus on RAG Lab Scenario 1 and optionally Evaluation hub
- Do not ask them to compare to PAL or MLS — testers don't know those products
- Do not treat this as a feature prioritization session — it is a coherence validation

---

## 6. After the test — decision framework

After collecting feedback from 3–5 testers, make exactly one of these decisions:

**Decision A — Ready for controlled public launch prep:**
- Success criteria met
- No structural navigation confusion
- Synthesis card landing clearly
- Next steps: pricing decision → Vercel domain setup → HN Show HN draft → LinkedIn thread draft

**Decision B — One more coherence sprint:**
- Any success criterion failed
- Structural confusion identified (not cosmetic)
- Next steps: identify the single highest-signal gap → fix it → re-test with 2–3 of the original testers

Do not build new features between the private test and the launch prep decision. Only fix what the test reveals.

---

## 7. Current known limitations for testers

Tell testers these upfront (post-session disclosure only):

- "PrepLab has a 10-question session limit for free accounts — that's intentional, not a bug."
- "Some modules in Eval Lab and LLM Lab don't have a completion card yet — we're aware and fixing it."
- "Access to the full PrepLab requires an access code — during this test, use: DAI2026"
- "The domain (`genai-systems-lab-ivory.vercel.app`) is a dev URL — a proper domain will be set before public launch."

---

## 8. Repo state at time of this document

| Sprints completed | Status |
|---|---|
| Sprint 58 — MVP coherence | ✅ Shipped |
| Sprint 59 — P1 closure | ✅ Shipped |
| Evaluation hub discoverability | ✅ Fixed (4→8 GT posts shown) |
| Guest RAG Scenario 1 access | ✅ Shipping |
| Synthesis card specificity | ✅ Shipping |
| Agent Lab completion naming | ✅ Shipping |
| Mobile scenario strip guest lock | ✅ Shipping |
| SystemsApp completion states | ⏳ P2 — not blocking private test |
| Real pricing / Stripe | ⏳ Deferred — not blocking private test |
| Public distribution | 🚫 Blocked until private test feedback |
