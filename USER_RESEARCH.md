# USER_RESEARCH.md — Who Is the GSL User?

*Written June 2026. Research basis: Stanford 2026 AI Index, DataTalks AI Engineering Survey 2025–2026, JobsByCulture agentic AI hiring data, LeetCode/StrataScratch psychology research, 10+ practitioner interviews from primary sources.*

---

## The core question answered first

PAL has a user with sharp intent. SQL has pre-installed belief — everyone in data knows the interview tests SQL. PAL's user shows up knowing what they're preparing for, having sometimes already failed once.

GenAI doesn't have that yet. The field is 2–3 years into being a hiring discipline. There's no equivalent of "grind LeetCode for ML interviews" — no canonical ritual, no settled interview format, no pre-installed belief that "I need to practice RAG failure diagnosis." So GSL's user arrives more confused than PAL's, and the product has to do more work before practice begins.

That's the starting constraint. Everything else follows from it.

---

## The four user types (not one)

### Type 1 — The Transitioning Engineer
**Who:** Software engineer, backend dev, or data engineer, 3–7 years experience. Has been "doing AI" at work for 6–18 months — calling OpenAI APIs, building a RAG demo, integrating an agent. Shipped something. It kind of works. But they can't explain *why* it sometimes fails, they're not sure how to evaluate it, and they feel quietly anxious about being exposed in an interview or a production incident.

**What they believe they need:** More concepts. Better notes. A course they can finish. Some interview questions to memorize.

**What they actually need:** Production judgment — the ability to recognize failure modes, diagnose root causes, and make architectural tradeoffs under ambiguity. They need to feel what it's like to watch a system break and understand why, not read about it.

**Trigger:** An AI interview at a company they want to join. Or a production failure they couldn't explain to their team. Or a job posting listing "RAG pipeline engineering," "LLMOps," "evaluation design" — skills they technically have but can't articulate confidently.

**Size signal:** This is the largest and highest-value segment. Agentic AI job postings grew 280% YoY to ~90,000 US listings (Stanford 2026 AI Index). Average salary: $190K. Traditional software engineering contracted 27.5% simultaneously. The bridge between these two economies runs directly through this user's anxiety.

**Their job to be done:** "Help me get from building demos to shipping production AI."

---

### Type 2 — The Interview Candidate
**Who:** Has a real AI engineer, ML engineer, or AI PM interview scheduled in 2–8 weeks. May have failed a previous round. Intent is maximally sharp — this is the closest equivalent to PAL's user.

**What they believe they need:** A question bank. Sample answers. Company-specific prep.

**What they actually need:** They're usually preparing for the wrong exam. They memorize definitions and skip deployment context. They answer "what is RAG" when the interviewer wants "how do you know your RAG is working." The canonical failure: asked "your AI system gave a confident answer — how do you know it was right?" and saying "BLEU scores." Offer not given. *(Source: real interview account, May 2026)*

**Trigger:** "I have an interview in 3 weeks at [company]." The same urgency that makes LeetCode work.

**Size signal:** The urgency-motivation pairing ("I have an interview") is the strongest known forcing function in practice prep. PrepLab is the right product for this user, but they need to arrive there first — and the current home page doesn't speak to them.

**Their job to be done:** "Help me not get blindsided by the production systems question."

---

### Type 3 — The Curious PM or Leader
**Who:** AI product manager, engineering manager, or senior IC who doesn't need to pass a technical interview but wants to understand the systems their teams are building. Has enough technical background to read code but doesn't write it professionally.

**What they believe they need:** Conceptual fluency. Something they can read, not configure.

**What they actually need:** Decision-making frameworks — when to use RAG vs. fine-tuning, what "evaluation" actually means in production, why their team is anxious about their agent hitting tool loops. Not deep mastery, but enough to be less dependent on engineers for architecture calls.

**Trigger:** A meeting where they didn't understand what was being discussed. A product decision where they deferred to engineers without a real opinion. A job description that lists "experience with LLM systems" and they're not sure if they qualify.

**Size signal:** Smaller than Type 1, lighter engagement, but their willingness to pay is higher — they're often already senior and often already at companies with budgets.

**Their job to be done:** "Help me be a more effective decision-maker on AI systems."

---

### Type 4 — The Aspiring Newcomer
**Who:** CS student, recent grad, or career-changer trying to break into AI. Often has completed a Coursera course, watched Andrej Karpathy's lectures, built a "RAG app from scratch" tutorial. Knows transformers conceptually. Has never shipped anything in production.

**What they believe they need:** More tutorials. More courses. A portfolio project.

**What they actually need:** They don't know what they don't know. The gap between what they've learned (how transformers work in theory) and what's being hired for (production judgment, evaluation design, failure diagnosis) is the widest of any user type. And they have the least ability to see the gap themselves — they feel ready because they can answer "how does attention work?" without knowing that this is the easy question.

**Trigger:** A job application that got rejected. A take-home assessment they couldn't complete. Seeing the $190K salary numbers.

**Size signal:** Largest by volume, lowest by conversion. Hard to serve directly because the knowledge gap requires anchoring to production context they don't have.

**Their job to be done:** "Help me understand what 'good' looks like in production AI." (They don't have language for what's missing yet.)

---

## What they share: the overwhelm pattern

Across all four types, a consistent pattern emerges from the data:

**30% of technologists say they don't know where to focus their AI learning** (Pluralsight). **79% of practitioners say evaluation and reliability is their #1 challenge** — but **31% don't evaluate their LLM outputs at all** (DataTalks 2025–2026). **41% have no production AI systems at all**; only **10% have solid monitoring and evaluation practices**.

The pattern: people know there's a problem. They feel it at work. But they can't name it precisely enough to search for a solution. "I should learn more about AI" is the shape the need takes before it becomes actionable. The product has to meet them before the need sharpens, not after.

This is the belief gap from DECISIONS.md §9, verified by data.

---

## The gap that isn't being served

**What courses and bootcamps teach (what exists):**
- How transformers work
- Building your first RAG app
- Prompt engineering fundamentals
- Fine-tuning walkthroughs
- Framework tutorials (LangChain, CrewAI)

**What nobody teaches well (the gap):**
- Why your RAG system retrieves garbage and how to diagnose it
- How to evaluate LLM outputs when there's no ground truth
- When *not* to use RAG/agents/fine-tuning
- What "production maturity" looks like and how to get there
- The architectural judgment calls that separate $180K candidates from $340K ones

The missing layer: **production AI judgment**. Not what things are. What happens when they fail, how to know, and what to do.

This is GSL's real market. Not "another AI course." The only place that specifically trains the judgment that courses don't.

---

## Why SQL/system design practice products work — and what GSL can borrow

**LeetCode / SQL practice works because:**
1. The interview format is settled and known — everyone knows SQL appears in data analyst and data science interviews
2. The user arrives with pre-installed urgency — "I have an interview" is the forcing function
3. Practice maps directly to the test — every LeetCode problem is directly interview-relevant
4. Pass/fail is unambiguous — you either got the right answer or you didn't

**System design prep works because:**
1. The format is known — every senior SWE interview has a system design round
2. The user knows they've been weak at it (they've failed it before)
3. Resources like Grokking the System Design Interview defined the canonical preparation ritual

**What GSL can borrow:**
- **The urgency framing** — "this exact question appeared in a real interview at [company]" installs the belief that this practice is interview-relevant, not just educational
- **Pass/fail clarity** — every lab scenario should have a clear answer: this config causes failure, this one doesn't, and here's exactly why
- **The gap-awareness mechanism** — LeetCode's value is partly in surfacing "I don't know this" viscerally. A question you can't answer is more motivating than a concept you can read. GSL's interactive mechanic does this better than any course can.

**What GSL can't directly copy:**
- The settled format. GenAI interviews are not yet canonical the way SQL interviews are. GSL's user may not know there's a production systems question coming — this is a belief-building problem, not a practice problem. The product has to build the belief before it delivers the practice.

---

## What actually triggers someone to come back

The research on practice product retention is consistent: people return when they remember what they learned last time and want to build on it, *or* when a real-world event makes what they learned suddenly relevant.

For GSL specifically:
1. **They hit a failure at work that the lab taught them to diagnose.** "Oh, this is the context overflow failure I practiced." That moment cements the product's value permanently.
2. **They got a question in an interview that they'd practiced.** Same mechanism — real-world relevance.
3. **They have a visible progress signal** — they know they're 40% through the RAG Lab, not 0%.
4. **The last session was specific enough to remember.** Vague familiarity ("I read about RAG") doesn't drive return. A specific scenario ("I watched the system hallucinate because the corpus was stale") does.

The current product has weak mechanisms for 1, 2, and 4, and a decent mechanism for 3 (the streak/heatmap).

---

## The structural implication

The 14-tab structure fails all four user types for the same reason: it's organized by *what AI things exist*, not by *what the user is trying to do*.

The jobs to be done are:

| Job | User | Entry point |
|---|---|---|
| "Help me pass an AI interview" | Type 2, Type 1 approaching interview | PrepLab first |
| "Help me understand why my AI system is failing" | Type 1 in production | Lab scenarios directly |
| "Help me get from demos to production AI" | Type 1 career transition | Structured path through Labs |
| "Help me understand what my engineers are talking about" | Type 3 | GT posts + Concepts |

None of these jobs say "go to the Systems tab." None say "explore the Concepts gym." The nav is organized around content categories, not user intentions.

The redesign question isn't "how do we make the tabs look better." It's: **when a user arrives, which job are they in, and does the product's first 10 seconds address that job?**

---

## The one-sentence positioning that survives this research

> **GSL is the only place that trains production AI judgment — not what AI systems are, but what happens when they fail and what to do about it.**

Everything else — the labs, the PrepLab, the GT posts — is in service of that one thing. The product works when users finish a session knowing something they didn't know before that they can use at work or in an interview *tomorrow*. It fails when they leave feeling vaguely informed.

---

*Last updated: Sprint 49 user research pass, June 2026*
*Sources: Stanford 2026 AI Index, DataTalks AI Engineering Survey 2025–2026, JobsByCulture agentic AI report May 2026, Pluralsight technologist learning survey, Medium/Predict interview accounts May 2026*
