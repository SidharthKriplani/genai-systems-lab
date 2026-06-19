# LINKEDIN.md — GSL LinkedIn Strategy & Content Plan

Exposure map + first content batch. Shared doctrine across PAL/MSL/GSL.
Update this file when a surface graduates from YELLOW→GREEN or when new posts are drafted.

*Created: June 2026 (sprint 77/78)*

---

## Shared thesis

Most interview prep trains recall. Real interviews test judgment.

GSL positioning: **AI systems judgment beyond framework tutorials.**

Trains: RAG design, retrieval failure diagnosis, evals, hallucination control, agent reliability, LLMOps, latency/cost tradeoffs, safety/guardrails, AI system design, production GenAI failure modes.

Wedge: AI systems judgment training for RAG, agents, evals, and production GenAI interviews.

---

## The standing rules

**Rule 1 — Content before product.**
Lab material goes public immediately. Product backlinks wait until the linked path is ready.

**Rule 2 — Backlink only when:**
- manually tested
- clear within 30 seconds without explanation
- stable, no obvious broken UX
- useful to a stranger
- has a clear next step

**Rule 3 — Two pillars only (for now).**
Judgment Challenges (primary) and India Insider (wedge). Every other pillar is deferred until these are running weekly for 8 weeks straight. Six pillars = zero compounds.

**Rule 4 — No link on engagement posts.**
Comments, saves, and shares are the signal. A link trains the algorithm this is a traffic post and tanks reach. Earn the audience first.

**Rule 5 — Post frequency target.**
3 posts/week minimum, 12 weeks. Content compounds on LinkedIn at ~12 weeks of consistency. Below that it's noise.

---

## Surface exposure map (June 2026)

### GREEN — safe to link publicly

| Surface | URL | Why GREEN |
|---|---|---|
| Home page | `genai-systems-lab-ivory.vercel.app` | Challenge area cards, promise headline, guest RAG Lab access, no mandatory login. Default link for most posts. |
| Challenge area landing pages | `/agents`, `/retrieval`, `/evaluation`, `/production`, `/foundations`, `/preplab` | Static HTML, fast load, correct OG tags, stat lines, clear CTAs. Use for topic-specific posts. |
| RAG Lab Scenario 1 experience | (reached via home page) | Polished failure simulation, no login required, synthesis card at end. Borderline GREEN — requires fix #1 below to become a reliable link target. |

### YELLOW — screenshots/content only, no product link

| Surface | Content use |
|---|---|
| Individual GT posts | Screenshots, quoted excerpts, carousel source material. SPA routing means no direct URL for a stranger — don't link until SSR lands. |
| PrepLab question cards | Screenshot individual questions + trap reveals. Don't link to PrepLab UI — topic grid + mode picker needs context. |
| BiEncoder / BertPooling / VectorSimilarity animated modules | Record screen captures, post as video/GIF. Visually unique in the space. Don't link — navigation is not obvious. |
| Learning Paths (First Principles, Senior AIE) | Screenshot the step sequence and path context bar. Don't link — hard to find from home without guidance. |
| PrepLab Browse Mode | Screenshot question cards with difficulty chips. Don't link. |
| Systems modules (failure mode cards, config panels) | Strong screenshot material showing the configure→fail mechanic. Don't link — 57-module list overwhelms cold visitors. |

### RED — do not expose to public traffic

| Surface | Reason |
|---|---|
| Mastery Room | Staged, not committed. Hard RED. |
| Agent Lab, Eval Lab, Prompt Lab, FM Lab | Require sign-in. Guest who clicks from LinkedIn hits a wall and churns. |
| Full sidebar nav (expanded state) | Too complex for cold visitor. Never screenshot the expanded sidebar in a public post. |
| PrepLab behind 10q gate | Gate fires without enough payoff signal for a stranger. |
| Any incomplete or unregistered module | |

---

## First public CTA

> "One free RAG failure scenario. No login. See if you can diagnose why the system failed."

Target: home page (`genai-systems-lab-ivory.vercel.app`)

Do not CTA to PrepLab, GT, or any specific tab hash. The lab mechanic (configure → fail → diagnose) is the differentiator — lead with it.

---

## Where 500 LinkedIn visitors should land

**Home page.** Not a specific tab hash.

Home page has: challenge area cards, promise headline, guest RAG Lab path. Challenge area landing pages (`/agents`, `/retrieval`, etc.) are the second choice when the post is topic-specific.

Do not link to `#groundtruth`, `#systems`, `#preplab`, or any sidebar tab directly.

---

## 5 fixes before more backlinks are safe

In order of impact. All achievable in one commit.

1. **Home page guest CTA.** Add "Try a free scenario →" secondary button that routes a guest directly to RAG Lab Scenario 1. Currently the primary CTA is sign-in — a guest has no one-click path to the product's core mechanic. This is the highest-priority fix and unlocks RAG Lab as a safe link target.

2. **Mobile-test the home page.** Most LinkedIn traffic is mobile. Challenge area card grid, hero text, and CTA buttons must hold at 375px. If anything wraps or breaks, fix before linking publicly.

3. **Challenge area landing pages → correct internal deeplink.** Currently `/agents` links back to the SPA home. Should deeplink to the Agents hub or Agent Lab with a guest-accessible path.

4. **Home page headline specificity.** Add one concrete proof line under the hero: "Configure a real RAG pipeline. Watch it fail. Understand why." Five-second hook for a cold visitor arriving from LinkedIn.

5. **RAG Lab Scenario 1 synthesis card CTA (guest version).** The sign-in prompt after completion should name what the user gets: "5 more failure modes + 51 practice questions" — not just "Sign in to save." This is the conversion moment.

---

## 15 LinkedIn post ideas

### Pillar: Judgment Challenges

**JC-1** — RAG retrieval/hallucination paradox
> "Your RAG retrieval score improved from 0.71 to 0.84. But hallucinated citations went up 15%. What broke? [4 options in comments]"
Post type: pure engagement, no link. Debrief in a follow-up post.

**JC-2** — Agent loop overrun
> "Agent loop ran 8 iterations instead of 3. Latency is 4x. PM wants it shipped tomorrow. What do you investigate first?"
Post type: no link, let comments accumulate.

**JC-3** — Do you even need RAG?
> "You're building a Q&A bot for a 50-ticket/day support team. They ask for a RAG pipeline. What do you say?"
Post type: authority post, no link. Best-performing type — tests judgment about over-engineering.

**JC-4** — Reranker latency tradeoff
> "Reranker improved nDCG@10 by 0.06 but added 40ms p99 latency. Production serves 500 QPS. Do you ship it?"
Post type: no link. Follow-up debrief can link.

**JC-5** — Eval cost vs. quality
> "Your LLM eval score improved 12 points. But the eval costs $800/day to run. Do you keep it or cut it?"
Post type: no link.

**JC-6** — India company: live system diagram
> "Senior AI engineer round at a Bangalore product company. They show you this architecture [screenshot of a real-looking RAG diagram]. Three things are wrong. What are they?"
Post type: screenshot-first, high engagement. No link.

**JC-7** — Too many tools
> "Your agent has 14 tools registered. Average call latency: 8 seconds. Users are complaining. What's the architectural root cause?"
Post type: no link.

**JC-8** — 89% faithfulness — do you ship?
> "New eval shows 89% faithfulness. PM says ship. You found the 11% failures cluster on one product category. What do you do?"
Post type: can link on the debrief post.

---

### Pillar: India Insider

**II-1** — Swiggy / Meesho / PhonePe interview reality
> "What Swiggy, Meesho, and PhonePe AI engineer interviews actually test — and why LangChain tutorials won't prepare you"
Post type: authority, no link. India-specific framing fills a gap no competitor addresses.

**II-2** — The question Anthropic India / Sarvam ask
> "The question that caught Anthropic India and Sarvam candidates off guard: 'What would break this system in 6 months?'"
Post type: no link. Debrief can link to `/agents` landing page.

**II-3** — Bangalore comp gap
> "Why the senior AI engineer comp gap in Bangalore is really a systems thinking gap — not a framework knowledge gap"
Post type: authority + positioning. No link.

**II-4** — Zomato / Flipkart interview evolution
> "Why the Flipkart and Zomato AI infra interview rounds became systems design rounds and stopped being Python tests"
Post type: no link. High relevance for ICP.

---

### Pillar: Expert Debriefs

**ED-1** — Reranker is not the answer
> "'Add a reranker' is not the answer to most RAG failures. Here's what the real diagnosis looks like."
Post type: follow-up to JC-4. Include home page link ("you can debug this exact failure mode free").

**ED-2** — Agent reliability round
> "Why most candidates fail the agent reliability round — it's not about knowing LangGraph or LangChain"
Post type: save/share post. No link.

**ED-3** — 3 answers that get candidates rejected
> "The 3 answers that get candidates rejected in production AI system design interviews"
Post type: pure authority save. No link.

---

## Posts that should include a product link (3)

| Post | Link target | CTA copy |
|---|---|---|
| JC-1 debrief (RAG retrieval/hallucination) | Home page | "You can try this exact failure mode in the RAG Lab. Free, no login." |
| II-1 (Swiggy/Meesho/PhonePe) | `/agents` landing page | "The full agent production curriculum is free at GSL." |
| ED-1 (reranker debrief) | Home page | "Full failure mode map in the lab — no account needed to start." |

---

## Posts that should avoid links entirely (3)

| Post | Reason |
|---|---|
| JC-3 (50-ticket team: do you need RAG?) | Pure engagement. Let comments run. A link kills reach. |
| ED-2 (agent reliability round) | Strong authority post. Optimise for saves, not clicks. |
| ED-3 (3 answers that get candidates rejected) | Best shareable post in the batch. Any link turns it into an ad. |

---

## The one thing to ship before more backlinking

**Fix the home page guest CTA.** One commit. Add a "Try a free scenario →" button that routes a guest directly to RAG Lab Scenario 1. Update the synthesis card CTA to name what sign-in unlocks. This is the only thing between the current product and RAG Lab being a safe, repeatable link target for every future LinkedIn post.

Spec:
- Button label: "Try a free scenario →" or "Debug a real failure →"
- Destination: RAG Lab, auto-selects Scenario 1, no login required
- Synthesis card guest CTA: "Sign in to unlock 5 more failure modes and 51 practice questions"
- Placement: secondary CTA beneath the primary "Sign in" button on cold home view

---

## Posting sequence (first 3 weeks)

| Week | Post | Type | Link? |
|---|---|---|---|
| W1 | JC-3 (do you even need RAG?) | Judgment Challenge | No |
| W1 | II-1 (Swiggy/Meesho/PhonePe) | India Insider | No |
| W1 | ED-3 (3 answers that get rejected) | Expert Debrief | No |
| W2 | JC-1 (RAG score up, hallucinations up) | Judgment Challenge | No |
| W2 | II-3 (Bangalore comp gap) | India Insider | No |
| W2 | JC-1 debrief | Expert Debrief | Yes → home |
| W3 | JC-7 (14 tools, 8s latency) | Judgment Challenge | No |
| W3 | II-2 (Anthropic India / Sarvam question) | India Insider | No |
| W3 | ED-1 (reranker debrief) | Expert Debrief | Yes → home |

Ship the home page guest CTA fix before Week 2 posts go out.

---

## What not to do

- Do not link to PrepLab, GT posts, Systems tab, or sidebar tabs in any public post until the SPA routing problem is resolved
- Do not screenshot the expanded sidebar nav in any public-facing image
- Do not post Builder Perspective, downloadable assets, or product backlink pillars until the primary two pillars have 8 weeks of consistency
- Do not post on YouTube before LinkedIn has traction
- Do not open Discord before the LinkedIn cadence is established

---

*Next update: after first 3 weeks of posts — move any YELLOW surface to GREEN if it's been tested with real visitors*
