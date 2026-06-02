# Ideas Dump

A holding area for future product ideas. Nothing here is on the roadmap unless explicitly moved.

---

## Ground Truth blog section

**Status: COMPLETE (May 2026)**

82 posts written across all planned categories. Every post has a narrative hook, technical depth, `references` block, and most have `quote` blocks for human voice. Reading progress bar added to PostDetail.

Categories covered: Foundations, RAG, Agents, Evaluation, LLMOps, Safety, System Design, Production Failures, AI Product, Model Profiles, Industry AI, Interview Prep, AI Roles & Careers.

The original product angle is delivered: **"Learn the concept. Then break it on the platform."** Every post ends with a `{ t: "lab", ... }` block linking to the relevant interactive module.

---

## AI Systems Readiness Assessment + Certificate

**Status: Parked — revisit at 1,000+ active users**

**Concept:** A 20-question timed assessment covering the full platform scope — architecture, RAG, agents, evals, production operations. Scored across 5 dimensions. Client-side certificate generated on pass.

**Why it monetizes:** The free platform earns the right. The assessment + certificate layer is where value is extracted. $29 one-time.

**Requirements before building:**
- 1,000+ users who have engaged with the platform meaningfully (not just landed and bounced)
- 10+ testimonials from people who got jobs or promotions using the platform
- The assessment content itself must be hard enough that ~50% fail first attempt — difficulty = credibility

**Implementation notes when ready:**
- 20 questions, timed (45 minutes), no pause
- Scored: Architecture (4q), RAG & Retrieval (4q), Agents & Safety (4q), Evaluation & LLMOps (4q), System Design (4q)
- Client-side certificate: SVG with name, score, date, platform logo — download as PNG
- No backend required — scoring and cert generation fully client-side
- Don't call it "certified." Call it "AI Systems Readiness Assessment."

---

## Advanced Production Incident Case Library

**Status: Parked — revisit after traction**

**Concept:** 20–30 detailed production incident write-ups beyond what's in the current Ground Truth posts. Each with: the system setup, what went wrong, the detection story, the post-mortem, the fix. Structured as interactive case studies in the RAG Lab or a new Cases tab.

**Why it's defensible:** This is the kind of knowledge that only exists in Slack channels and post-mortems at companies that have shipped AI in production. It takes months to curate. Once curated to 30+ cases, it becomes a proprietary content asset that competitors can't quickly replicate.

**Content sources:**
- Public post-mortems (Anthropic safety evals, OpenAI system cards, engineering blog posts)
- Synthesised from known failure patterns (stale documents, context overflow, prompt injection, multi-hop failures)
- Community submissions eventually (once there is a community)

---

## AI Bookshelf / Reading Radar

**Status: Idea only. Low priority.**

**Concept:** A curated AI/ML/GenAI reading radar that helps users discover important books and understand which ones are worth reading for their specific goals.

**Sharp product angle:**
> "Which AI book should I read for my goal?"

**Possible user goals:**
- Software engineer learning LLM systems
- PM trying to understand AI products
- Preparing for AI/ML interviews
- Want foundations, not hype
- Want AI product strategy, not math
- Want system design / RAG / agent infrastructure depth

**Potential fit:** Could become a "Reading Radar" section inside GenAI Systems Lab after the blog is stable and has earned its audience. Low implementation cost (static JSON data + a filter UI). Low urgency — the existing 83 posts already cover most reading needs.

---

## Deep-Link Routing

**Status: Parked — no user demand signal yet**

**Concept:** React Router to give every post, module, and tab a real URL. Enables bookmarking, browser back button, and shareable links to specific content.

**Why not yet:** The ⌘K search already solves the "how do I get back to that module" problem for returning users. Adding React Router is a meaningful refactor — every tab component needs to be wired into the router. Only worth doing if real users start requesting shareable module URLs or if SEO signals indicate that deep-linked posts would get meaningful traffic.

**Prerequisite:** Client-side dynamic meta already added (document.title + meta description update on post open). That solves the browser tab title problem without requiring a router.

---

## Interview Mode

**Status: Parked — Stage 3 feature**

**Concept:** A timed, realistic AI engineering interview simulator. Question drawn from the question bank (LLM Interview Question Patterns post). Timer running. Response typed or spoken. AI evaluation of the answer against a rubric.

**Why it's Stage 3:** Needs the assessment layer to be validated first. Also needs either a backend (for AI evaluation) or a sophisticated client-side rubric engine. Either way: more infrastructure than the current zero-backend architecture allows.

---

## Community Features

**Status: Explicitly not doing — revisit only after significant organic traction**

**Why not now:** An empty forum is worse than no forum. Community requires critical mass to be useful. At the current stage of distribution, building community infrastructure would produce an empty room that makes the product look less used than it is.

**What organic traction looks like before reconsidering:** 5,000+ monthly active users, a recognizable presence in AI engineering communities (Twitter/X, LinkedIn, r/MachineLearning), and inbound from people who discovered the platform through word of mouth rather than direct sharing.

---

## Team / Org Pricing

**Status: Parked — Stage 3 feature**

**Concept:** Cohort access for AI bootcamps, internal training at companies, or university courses. Bulk pricing + admin dashboard for tracking cohort progress.

**Why it's Stage 3:** Individual social proof must come first. No org buys a training tool that no individuals have independently validated. When 10 engineers say "this is how I prep for AI interviews," the org sale becomes possible.

---

## Completed Since Last Update (May 2026)

- **#59 Tiered scoring in RAG Lab** — 4-tier system (Junior Miss → Analyst-Ready → Senior-Ready → Staff-Level). `SCORE_TIERS` constant, `getTier()`, `TierBadge` component. ChallengeResult shows tier prominently. Leaderboard tracks best tier per scenario.
- **#60 Role toggle on Home** — All / Engineers / PMs toggle persisted to localStorage. Module map reorders via `useMemo` based on role. Non-relevant modules dimmed.
- **#61 Cross-tab Progress page** — "My Progress" in nav. `ProgressView` shows tab coverage bars per group, RAG tier breakdown per scenario, suggested next step.
- **#53–58 UX polish batch** — Cmd+K indexes all 82 GT posts with deep-link; AIPM → AI Product rename; stats clickable; CTA audience labels; GROW tab welcome screens; RAG Lab amber visual; mobile drawer cleanup; What's New suppressed for first-timers.

---

## Pending / Parked Ideas

*(unchanged — see sections above)*

---

*Last updated: May 2026*
