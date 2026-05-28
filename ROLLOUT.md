# ROLLOUT.md — Beta Rollout Plan

Operational file for beta testing. Distinct from IDEAS.md (what to build) and DECISIONS.md (standing rules). This file tracks what goes out, in what order, to whom, and what gets checked before it does. It is not a backlog.

*Last updated: May 2026*

---

## Principles

1. **Batch 0 is founder-only. No exceptions.**
Every batch starts with the founder using the product as a stranger would — cold, no context, no knowledge of what's behind the UI. Obvious breakage gets caught here so testers spend time on judgment calls, not bug reports.

2. **Every batch entry has two layers: profile and scope.**
Profile = who the tester is and what they are trying to do. Scope = what they are testing. Both are required. "Batch 1 = these 5 features" is not a batch entry. A specific person with a specific goal testing a specific thing is.

3. **Tester brief is one specific prompt, not a list.**
Vague prompts produce vague feedback. Each batch gets one concrete scenario the tester walks through. If you need to test two distinct things, run two batches.

4. **Feedback has an expiry date.**
Tester feedback on Batch N is only valid until Batch N+1 ships. When the next batch opens, mark the previous batch's feedback field as closed. Do not let unresolved notes from old batches accumulate as if they are still actionable.

5. **Mobile is non-negotiable in every vet checklist.**
Every batch — Batch 0 included — must be tested on a real mobile device before testers see it. Not browser devtools. A real phone. Every batch entry has a mobile vet row in the checklist.

6. **Pass must be defined before the batch opens.**
Each batch entry states what pass looks like before a single tester is invited. If you cannot define pass, the batch is not ready to open.

---

## Batch 0 — Founder Self-Vet

**Status:** Pending

**User profile:** Founder (Avinash), using the product as a first-time visitor with no internal context. Browse from the landing page as if you've never built it. No shortcuts, no direct-linking to known-good states.

**Scope:** Full product surface — all four Labs, Ground Truth, PrepLab, Home.

**Self-vet checklist:**

Core loop:
- [ ] Home → pick a lab (RAG Lab) → complete one scenario end-to-end → forward pointer fires (✓ done card) → lands in PrepLab correctly
- [ ] Home → Ground Truth → open a post → quiz CTA visible → quiz fires
- [ ] Home → PrepLab → Exam mode → 10 questions → progress indicator tracks correctly
- [ ] JD Prep mode: paste a real JD → questions surface → mode behaves as expected (critical — primary paid feature)

Mobile (real device, not devtools):
- [ ] Home stats row — no overflow, all three numbers visible
- [ ] RAG Lab — horizontal scenario pill strip scrolls, fade gradient visible
- [ ] Agent Lab — back button `← Agent Lab` appears, sidebar collapses on module select
- [ ] Systems Lab — same pattern as Agent Lab
- [ ] PrepLab — sidebar collapses on mode select, back button appears
- [ ] Explore — sidebar collapses on module select, back button appears
- [ ] GT post — code blocks and tables scroll horizontally without breaking layout
- [ ] Touch targets — all filter pills, buttons, and sidebar items comfortably tappable

Recently shipped features:
- [ ] Sprint 7 upgrades: `serving` failure card, `decoding` failure callout, `moe` simulator, `langsmith` Diagnose tab — all load without error
- [ ] Sprint 9 upgrades: all mobile patterns confirmed above

Known rough edges to confirm are not blockers:
- [ ] `failures` module in Agent Lab renders as reference catalog (intentional, not broken)
- [ ] Flows and Fluency tabs load (parked but still accessible via hash)

**Pass criteria:** Core loop completes without confusion or error on desktop. All mobile checklist items pass on a real device. No JS errors in console on any Lab entry. JD Prep mode completes without dead ends.

**Feedback collected:** N/A — founder self-vet only.

---

## Batch 1 — First External Testers (RAG Lab + PrepLab)

**Status:** Not open — opens after Batch 0 passes.

**User profile:** AI engineer or senior DS who is actively preparing for AI engineering interviews or evaluating the lab as a learning resource. Ideally someone with 1–3 years of experience who has already built at least one RAG pipeline. Has skin in the game — either interviewing soon or evaluating the lab for their team. Not a friend doing you a favour.

**Scope:** RAG Lab (one full scenario) + PrepLab (Exam mode, 10 questions on RAG/retrieval topics).

**Self-vet checklist (before any tester is invited):**
- [ ] Batch 0 passed fully
- [ ] Mobile confirmed on real device for RAG Lab and PrepLab specifically
- [ ] RAG Lab tested with 3 different scenario configurations (not just the default) — confirm failure arc fires correctly in each
- [ ] PrepLab Exam mode tested with 10-question session — confirm progress bar, correct/wrong states, and session end all work

**Tester brief (send verbatim):**
> "You have 20 minutes. Go to genai-systems-lab-ivory.vercel.app, pick RAG Lab from the nav, and run through the Retrieval Failure scenario — configure it, watch it fail, and figure out why. Then go to PrepLab and answer 10 questions in Exam mode. Don't use any help or hints. When you're done, tell me: where did you get confused or have to re-read something, and does this feel like something you'd recommend to a colleague who's interviewing at an AI-first company?"

**Feedback target:** Not "does it work." Specifically: where did the tester pause or re-read? Does the failure arc land — do they understand *why* the system failed, not just that it failed? Would they recommend it? To whom?

**Pass criteria:** At minimum — 3 of 5 testers complete the RAG Lab scenario and 10 PrepLab questions without asking for guidance. At least one piece of specific, actionable feedback per tester (not "looks good"). Zero testers report a broken state that Batch 0 should have caught.

**Feedback collected:** Open — fill in below as responses come in. Close this field when Batch 2 opens.

| Tester | Profile | Completed flow? | Key feedback | Actionable? |
|---|---|---|---|---|
| | | | | |

---

## Batch 2 — Broader Lab Coverage + Mobile Testers (Stub)

**Status:** Not open — opens after Batch 1 closes.

**Profile (draft):** Mix of AI engineers (same profile as Batch 1) and AI PMs or DS-to-AI-engineer transitioners. At least 2 testers who primarily use mobile. Batch 2 deliberately adds a non-engineer to probe whether the lab's framing makes sense to the PM/career-switcher persona.

**Scope (draft):** Agent Lab + Ground Truth (3–5 posts) + PrepLab JD Prep mode. JD Prep is the primary paid-tier feature — it needs real tester signal before monetization goes live.

*Fill in fully only after Batch 1 closes.*

---

## Batch 3 — Pre-Monetization Full Surface (Stub)

**Status:** Not open — opens after Batch 2 closes.

**Profile (draft):** Broader — include people who found the lab organically (LinkedIn share, word of mouth) rather than people you recruited directly. The goal of Batch 3 is to simulate what a stranger does when they land on the product with zero context.

**Scope (draft):** Full product. All Labs, GT, PrepLab all modes. Focus: does the product feel worth paying for? Does the free-to-paid boundary (gated PrepLab questions, JD Prep) feel fair or frustrating?

*Fill in fully only after Batch 2 closes.*
