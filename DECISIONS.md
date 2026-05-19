# GenAI Systems Lab — Product Lineage & Decision Record

This document captures the full history of product decisions, architectural choices, deliberate exclusions, and the commercial strategy conclusion for GenAI Systems Lab. It exists so that any future collaborator (or future me, six months from now) can understand not just *what* the app is, but *why* it is the way it is.

---

## 1. Project genesis

GenAI Systems Lab was built as a portfolio and learning artifact, not as a funded product. The starting intent: an interactive tool for AI engineers and PMs to develop intuition about production AI systems — not through video or reading, but through configuration, observation, and diagnosis.

The core thesis from day one: **most AI learning resources tell you what to do. This one makes you do it and watch what happens.**

The original scope was Concepts + RAG Lab. Everything else grew organically from the question "what else does someone need to reason confidently about production AI?"

---

## 2. Architecture decisions

### Static, zero-backend

**Decision:** No backend, no API calls, no database, no authentication. Everything runs in the browser.

**Why:** Backend infrastructure adds cost, maintenance burden, auth complexity, and privacy obligations. For a learning tool, none of these are worth the tradeoff. Static deployment on Vercel free tier means zero ongoing cost and zero operational overhead.

**Implication:** All interactive modules use precomputed data or client-side logic. The RAG Lab scenarios are curated JSON configs, not live retrieval. The Embedding Space uses precomputed 2D coordinates, not live model embeddings. This is a feature (honesty, no hallucinated API responses) and a limitation (no live model introspection).

### React 18 + Vite 6 + Tailwind v4

**Decision:** Standard modern stack. Tailwind v4 uses `@tailwindcss/vite` directly — no PostCSS, no config file.

**Why Tailwind v4 specifically:** Simpler setup, faster builds, and the `@tailwindcss/vite` plugin integrates cleanly with Vite without the PostCSS config overhead. The tradeoff: some tooling and third-party components still expect v3 class names. Managed by staying with Tailwind's own utility classes and avoiding third-party component libraries.

### localStorage for all persistence

**Decision:** Progress tracking, challenge scores, What's New dismissed state, and leaderboard all persist to `localStorage`. No server sync.

**Why:** Consistent with zero-backend constraint. Users own their data. No GDPR obligations. No account friction.

**Limitation:** Progress doesn't sync across devices. Accepted tradeoff — the app is a single-session or repeated-session tool, not a long-term course.

### Single-file components

**Decision:** Each tab is a single JSX file. Large components (InferenceOptimizer, IndiaScale, ModelRouter, MLCiCd) were extracted into their own files only when the parent file would have exceeded ~2500+ lines.

**Why:** Simplicity over architecture purity. No routing library, no state management library, no context API. State is lifted only as far as needed. The app is complex enough in content; it doesn't need additional architectural complexity.

### Ground Truth post rendering

**Decision:** All Ground Truth post content lives in `src/groundTruthPosts.js` as a flat JS object keyed by post ID. Each post is an array of typed content blocks. The renderer in `GroundTruth.jsx` maps block types to JSX — no markdown parser, no MDX build step.

**Why:** MDX requires a compilation step and a more complex build pipeline. A plain JS object is trivially tree-shakeable, has zero build overhead, and is dead-simple to extend (add a new block type = add a new `case` in the renderer). The tradeoff is that content is slightly less readable than Markdown — acceptable because the author is technical.

**Block types:** `p`, `h2`, `h3`, `callout`, `code`, `list`, `table`, `lab`, `video`, `animation`, `divider`, `quote`, `references`. The `references` block renders a numbered bibliography with external links — primarily for SEO and credibility.

---

## 3. Product decisions

### Tab structure (11 tabs)

**Decision:** 11 top-level tabs: Home, Concepts, Flows, RAG Lab, Agents, Systems, Playground, Explore, Fluency, AIPM, Career.

**Why this structure:** The tabs map to real job function domains, not just a pedagogical journey. An AI engineer thinks in terms of "evals," "inference," "agents" — not "learn → break → practice." The structure serves returning users who know what they want.

**The tradeoff acknowledged:** 11 tabs is a lot for a first-time visitor. Solved by adding a Start Here journey strip on the Home page and a committed 7-step path, not by reducing the tabs.

### Fidelity tagging system

**Decision:** Every Concepts and Explore module gets a `fidelity` field with one of three tiers: `faithful` (real math), `simplified` (correct pattern, toy scale), `conceptual` (illustrative only). Displayed as a badge in the module header.

**Why:** Without this, a non-expert could mistake the 2D Embedding Space visualization for actual GPT/Claude embedding geometry, or the Attention module for real transformer attention maps. That would undermine the app's credibility. The badge is honest about what you're seeing.

**The three tiers specifically:**
- `✓ Mathematically faithful` — Tokenizer (real BPE logic), Sampling (real softmax/top-K/top-P)
- `~ Simplified` — Attention (illustrative patterns), Transformer (toy forward pass), Agent Loop (scripted ReAct trace)
- `◌ Conceptual` — Embedding Space (precomputed 2D coords), Multi-Agent (architectural concepts only)

### HowTo component

**Decision:** Every module starts with a `HowTo` component showing: what skill you're building, what the steps are, and what the "aha" moment is.

**Why:** Without framing, users open a module and don't know what they're supposed to get out of it. The HowTo sets the cognitive frame before any interaction happens. It's deliberately short — never more than 3 steps.

### RAG Lab as the flagship professional module

**Decision:** The RAG Lab got the most content depth — 5 curated production failure scenarios, each with multiple configurations, detailed failure explanations, and system design lessons.

**Why:** This is the most defensible and differentiated content in the app. No other free resource teaches RAG configuration trade-offs through interactive failure simulation. YouTube explains RAG. This makes you configure it and watch it break.

**The five scenarios:** Conflicting policy documents (stale retrieval), Missing evidence (hallucination), Ambiguous query (answer quality), Prompt injection (corpus-level attack), Multi-hop failure (cross-document reasoning).

### Challenge Log (not "Leaderboard")

**Decision:** The challenge tracking modal was originally named "Leaderboard." Renamed to "Challenge Log."

**Why:** "Leaderboard" implies competition and rankings, which the feature doesn't do. It tracks your own pass/fail record across scenarios. "Challenge Log" is accurate. "Leaderboard" was misleading and added a gamification tone that weakens the professional framing.

### Agent Loop Simulator

**Decision:** Added a full interactive simulator in Agents — three scenarios (BASIC/INTERMEDIATE/ADVANCED), step-through trace with quiz at each step, scoring at the end.

**Why:** The ReAct pattern is easy to describe but hard to internalize. The simulator forces the user to predict what happens at each step before seeing it — that active prediction is the mechanism that builds real intuition, not passive reading.

### Credibility badges vs no credibility badges

**Considered:** Leaving modules untagged to avoid friction.

**Decided:** Always tag. The risk of a user thinking they're seeing real frontier model internals is a bigger reputational problem than the slight friction of the badge. Transparency builds trust. Hiding simplification destroys it when someone finds out.

### Ground Truth: content over quantity, then both

**Decision:** Ground Truth launched with ~37 posts. In a focused sprint (May 2026), all pending posts were written — bringing the total to 83. All posts follow a consistent structure: narrative hook, technical depth, code samples where relevant, quote blocks for human voice, and a `references` block with real external citations for SEO and credibility.

**Content tone decision:** Posts are written with a "knowledgeable colleague" voice — technically precise but not academic. Emotional hooks and real-world failure stories are used deliberately to give the platform character. The goal is that readers finish a post feeling like they've talked to someone who's shipped this in production, not read a textbook.

**Reading progress bar:** Added to PostDetail — a thin colour-coded bar at the top of the viewport that fills as the user scrolls. Colour matches the post's category accent. Implemented as a scroll event listener on a `ref` to the article container.

---

## 4. Features added in order

| Feature | Decision rationale |
|---------|-------------------|
| ⌘K global search | 75+ modules with no search was a UX dead end. ⌘K is the standard pattern engineers know. Searches by label, tag, and tab. Deep-links directly into the module. |
| Start Here CTA on Home | The app had 11 tabs but no committed entry point. Added both a hero button and a 7-step journey strip to give new visitors a clear path. |
| Progress bars on learning path cards | Returning users had no memory of where they'd been. Progress bars using localStorage visited state solve the re-entry problem without a backend. |
| What's New badge | As modules were added, returning users had no idea what was new. Versioned localStorage key (`genai_whatsnew_v2`) so returning users who dismissed v1 see new content. |
| Share Score button | The challenge log had scores but no way to export or share them. Clipboard copy was the right zero-backend solution. |
| Mobile hamburger nav | The 11-tab nav was unusable on mobile. Hamburger menu with full navigation, animated slide-in. |
| Scroll fade on dense pill rows | Systems (15 modules) and Agents (7 modules) pill rows overflow on mobile with no visual affordance. Added right-edge gradient fade via absolute positioned overlay. |
| OG image for WhatsApp/Twitter | The app had no `og:image` meta tag, so link previews were blank. Generated a 1200×630 PNG using Python PIL and added full Open Graph meta tags to `index.html`. |
| Credibility badges | See section 3 above. |
| Ground Truth blog section | 83 posts covering foundations, RAG, agents, evals, LLMOps, system design, production failures, AI careers, industry AI, model profiles. Every post has references + reading progress bar. |
| TransformerWalkthrough animation | Interactive 10-step visual walkthrough of transformer architecture — built as a custom React component with SVG animations, step navigation, and colour-coded data flow. |
| YouTube video embeds in posts | 7 key posts have embedded YouTube videos (Karpathy, 3Blue1Brown) to pair watching with reading without leaving the page. |
| Per-post dynamic meta tags | PostDetail sets `document.title` and the meta description tag dynamically on mount — so browser tabs show post titles and sharing produces meaningful previews. |
| Salary calculator | Interactive calculator in the AI Salary Guide post — role × level × geography → total comp estimate. Client-side, no API. |
| AI Role Tech Stack matrix | Post covering minimum expected tech stack per role (AI Eng, MLE, MLOps, Technical PM, Non-Technical PM, FDE) at entry/mid/senior levels across company tiers. |

---

## 5. What was deliberately excluded

### No video content

**Why:** Video requires production, editing, hosting, and a creator face. It also dates quickly as the field moves. Interactive simulators provide more learning per minute for technical topics and are infinitely more maintainable as static assets.

### No AI company API integration

**Why:** API calls add cost, latency, rate limits, key management, and backend requirements. More importantly: for teaching systems concepts, precomputed responses are more reliable than live inference. You can't guarantee a live API gives a broken response at the right moment for a teaching scenario.

### No community features (forum, comments, Discord)

**Why:** Community requires moderation, cold start, and ongoing maintenance. At this stage it would be an empty room that makes the product look less used than it is. Revisit only after significant organic traction.

### No video or certificate (yet)

**Why:** A certificate requires a credible assessment layer first. Building the certificate without the assessment would produce a meaningless badge that cheapens the brand. The assessment is reserved for a future paid tier after the free version has earned social proof.

### No deep-link routing (React Router)

**Why:** Adding a router is a meaningful refactor with no immediate user benefit. The ⌘K search already solves the "how do I get back to that module" problem. Deep-link routing is a Stage 2 feature when the app has proven it's worth bookmarking.

### No "AI Compass" / broader portal scope

**Why:** Evaluated and explicitly rejected. The broader frame (Track + Apply + Build + Work + Filter) would require fresh data, editorial curation pipelines, and ongoing maintenance that undermines the zero-backend architecture advantage. More importantly: it would dilute the app's clearest identity — "the interactive production AI failure lab" — into a generic AI resources portal that competes on content volume rather than interactive depth.

### No monetization (yet)

**Why:** Commercially evaluated. Current score: ~4/10 readiness. Missing: completion state, scored final assessment, social proof, brand recognition. Charging before earning the right to charge kills word-of-mouth, which is the only realistic acquisition channel at this stage.

---

## 6. Commercial strategy conclusion

GenAI Systems Lab is currently best positioned as a **free credibility and audience-building artifact**. The content is genuinely good. The format is differentiated. But it is not paid-ready because:

1. No completion state — the user never knows if they're "done"
2. No scored assessment — nothing that produces proof of competence
3. No social proof — no testimonials, no recognizable builder name, no track record
4. No outcome language — the app currently says "explore," not "after this you can do X"

**The right monetization path when ready:**

Stage 1 (now — month 6): Free distribution. Build audience, collect testimonials, watch which modules users actually finish.

Stage 2 (month 6–12): Add 10 advanced production incident cases + final AI Systems Readiness Assessment (20 questions, timed, scored across 5 dimensions) + client-side certificate. Charge $29 one-time for the assessment + certificate layer. Keep all existing content free.

Stage 3 (month 12–24): Interview mode, team/org pricing, gap analysis report. Price point: $49 individual once social proof is established.

**What not to do:** Don't call it "certified." Use "readiness assessment." Don't make job outcome claims. Make the assessment hard enough that ~50% fail on first attempt — the difficulty is the credibility.

---

## 7. Current state (as of May 2026)

**Ground Truth is complete.** 83 posts written across all planned categories. Every post has:
- Narrative hook / opening that earns the read
- Technical depth with code samples where relevant
- `references` block with real external citations
- `quote` blocks for human voice in most posts
- Reading progress bar (UI feature added to PostDetail)

The interactive platform (11 tabs) is also feature-complete for the current scope.

The app is in **active distribution mode** — not building new features, but distributing what exists. Priority: get real users in, collect signal on which posts and modules drive the deepest engagement.

What is explicitly not on the roadmap right now:
- New tabs or tracks
- AI Compass / broader portal
- Monetization infrastructure
- Deep-link routing
- Video content
- Community features
- API integrations

---

## 8. Reserved for later

These are explicitly parked — not abandoned, not scheduled.

| Item | Why parked | When to revisit |
|------|-----------|----------------|
| AI Systems Readiness Assessment | Requires social proof before charging | After 1,000+ active users and 10+ testimonials |
| Client-side certificate generation | Requires assessment to exist first | Simultaneously with assessment |
| Advanced production incident cases (10+) | Content moat, but pointless without audience | After traction established |
| Interview mode | Stage 3 feature | After assessment is validated |
| Deep-link routing | Not enough user demand signal yet | If users start requesting shareable module URLs |
| AI Compass / broader portal | Different product, different audience | Only if current app earns its own identity first |
| Team/org pricing | Requires individual proof of value first | Stage 3 |

---

## 9. What makes this defensible

The genuine moat vs YouTube, DeepLearning.AI, fast.ai, and blog posts:

**You have to make decisions, not watch decisions being made.** Every other resource shows you what to do. The RAG Lab makes you configure the system and watch it fail. That pedagogical difference is the moat.

**The production failure case library as a proprietary dataset.** If curated to 30–50 real production incident patterns with structured diagnosis and explanation — the kind of knowledge that only comes from being in AI engineering — that becomes something nobody else has. YouTube can't replicate it because it requires structured interactive format. DeepLearning.AI won't touch it because it's too niche for their scale.

**83 posts with production depth and citations.** Ground Truth is now the largest free resource of its kind specifically covering production GenAI systems — not introductory ML, not research papers, but the specific knowledge needed to build and operate real AI systems. That library compounds over time as it gets indexed and linked.

The positioning that best captures this: *"The only place you practice diagnosing production GenAI failures before your first on-call shift."*

---

*Last updated: May 2026*
*Document maintained by: Sidharth Kriplani*
