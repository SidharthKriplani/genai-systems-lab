# AUDITS — Living Product Audit Log

A structured record of audits run on GenAI Systems Lab. Each audit captures findings at a point in time, tracks which were acted on, and defines reusable audit types for future sessions.

*Created: May 2026 | Updated after each audit session*

---

## Audit Types (Run These Periodically)

A reference list of audit categories. Pick one per session or run them after major build phases.

| Type | What It Covers | Suggested Cadence |
|---|---|---|
| **Creativity / Product** | Design, UX, value delivery, layout, information architecture, differentiation | Monthly |
| **BUILD** | Prop wiring, dead code, duplicate keys, color consistency, component contracts | After every major build sprint |
| **Content Integrity** | Stat accuracy (module counts, GT post counts), stale copy, version mismatches | Monthly |
| **Navigation & Discoverability** | Tab structure, hidden features, dead-end flows, path coherence | Quarterly |
| **Performance** | Bundle size, lazy loading, render bottlenecks, animation jank | Quarterly |
| **SEO / Social** | OG tags, meta descriptions, structured data, sitemap freshness | After major content adds |
| **Cross-linking** | GT ↔ Systems ↔ PrepLab ↔ Explore connection density | Monthly |
| **Mobile UX** | Nav on small screens, touch targets, scroll behavior, font sizes | Quarterly |
| **Content Quality** | Stale modules, hype-language, accuracy, fidelity labelling | Quarterly |

---

## Audit 1 — BUILD Audit

**Date:** May 2026
**Scope:** App.jsx, Systems.jsx, Agents.jsx, Explore.jsx, modules.jsx
**Status:** All findings resolved ✅

### Findings & Resolutions

| # | Finding | File | Status |
|---|---|---|---|
| 1 | `finetuning` RELATED_GT key defined twice — JS silently kept the second, losing `lora-in-practice` | Systems.jsx | ✅ Fixed |
| 2 | `onNavigate` not wired to AgentsApp | App.jsx | ✅ Fixed |
| 3 | `onNavigate` not wired to PlaygroundApp | App.jsx | ✅ Fixed |
| 4 | Missing RELATED_GT entries: indiascale, inference, buildthis | Systems.jsx | ✅ Fixed |
| 5 | No AGENTS_RELATED_GT map existed — 15 modules had no GT cross-links | Agents.jsx | ✅ Fixed |
| 6 | Only `embeddings` module received `onNavigate` — 18 other Explore modules got `undefined` | Explore.jsx | ✅ Fixed |
| 7 | 85 `gray-*` Tailwind classes in 7 modules — visual inconsistency with zinc-only system | modules.jsx | ✅ Fixed |

---

## Audit 2 — Creativity / Product Audit

**Date:** May 2026
**Scope:** Full product — home page, all tabs, GT reading experience, PrepLab, navigation, design system, OG/social
**Status:** Findings documented. Items marked ✅ were acted on immediately. All others are backlog.

---

### Section A — Home Page & First Impression

**A1. Hero color is inconsistent between live app and OG image**
The live app renders "Learn exactly why." in `text-violet-400`. The OG image uses cyan (#00e5ff). These are two different brand signals. Cyan has no presence elsewhere in the design system; violet is the primary accent everywhere (CTAs, active tabs, progress dots). Decision needed: commit to violet in both, or introduce cyan as a deliberate second accent with uses elsewhere.
*Status: OG image updated to match bold hero design — color decision still pending*

**A2. Home page scroll is a marathon**
Sequence: Hero → Start Here Journey → Stats → Failure Mode Chips → Social Proof → Daily Tip → Learning Paths → Module Map → Role Toggle → Concept Graph → Newsletter → Footer. A visitor from a WhatsApp share scrolls through all of this before hitting anything interactive. The fold should end at the primary CTA and the concept graph. Everything else belongs below or in a collapsible section.
*Status: Open*

**A3. Dependency graph should be higher and larger**
The concept dependency graph (click a node → see prerequisites and unlocks → double-click to open) is the most creative UI element in the product. It teaches something before the user clicks anything, and no competitor has it. It's currently buried below the stats and social proof section. It deserves to be in the above-fold area.
*Status: Open*

**A4. Social proof is unconvincing**
Three testimonials attributed to "ML Engineer · fintech startup," "Senior PM · SaaS company," "Software Engineer · transitioning to AI." No names, no LinkedIn handles, no company. Too anonymous to carry trust weight with the skeptical senior engineer audience. Replace with: verified quotes with first name + title, a tweet screenshot, a count ("used by engineers at 50+ companies"), or a real LinkedIn embed.
*Status: Open*

**A5. Ground Truth is undersold**
200+ production-depth posts is the product's second-strongest asset after the failure simulator. It's a tab of equal visual weight to "Fluency Gym." The hero stat row doesn't explicitly surface it. Suggestion: split the stat row to show "140+ interactive modules" and "200+ production posts" as distinct pillars with different colors.
*Status: Open*

**A6. Role selector is buried**
The engineers / PMs / all toggle reorders the entire module map — a meaningful personalization — but it lives below the stats and social proof. If you're going to personalize, make role selection one of the first things a new user encounters. Either a two-button hero split ("I'm an engineer" / "I'm a PM") or a prominent selector before the module grid.
*Status: Open*

**A7. No "What's New" signal for returning users**
There's no indication in the UI that content was added recently. The Daily Tip rotates but doesn't signal new modules or posts. A small "Recently added" strip — three module title chips with dates — would give returning users a reason to come back.
*Status: Open*

---

### Section B — Navigation & Discoverability

**B1. Navigation is overloaded (14 flat tabs)**
14 tabs in a flat list: home, concepts, flows, lab, agents, systems, playground, explore, fluency, aipm, career, paths, groundtruth, progress. The LEARN / BUILD / GROW grouping from the home module map doesn't carry through to the nav bar. First-time visitors have no orientation signal. The nav should either visually group tabs by function or collapse secondary tabs behind a group or overflow.
*Status: Open*

**B2. PrepLab is not in SHORTCUT_TABS**
`SHORTCUT_TABS = ["home","concepts","flows","lab","agents","systems","playground","explore","fluency","aipm","career","paths"]` — PrepLab is absent. 183 questions + spaced repetition is a flagship feature. It should be in the primary nav, not a hidden state.
*Status: Open*

**B3. Consultation tab is dead weight**
`consult` exists as a `topView`, has a `ConsultationApp` component, is not in SHORTCUT_TABS, not in any learning path, not on the home module map. It's either half-built or intentionally hidden. If half-built: remove from the codebase. If intentional: it needs a visible entry point.
*Status: Open*

**B4. The locking system creates a broken promise**
Systems, Fluency, AIPM, and Career are locked behind `?preview=CODE`. The product says "FREE · NO LOGIN · NO ADS" but a visitor who clicks through from any external link to a locked tab hits a wall immediately. The lock state needs to be softer — a teaser with a "coming soon" or "unlock" CTA — not a hard stop. The free tab set should be clearly named in the hero so expectations are set before the click.
*Status: Open*

---

### Section C — In-Tab Experience

**C1. Module endings are silent**
When a user finishes a Systems, Agents, or Explore module, nothing happens. No "you've completed this module" moment, no "next in your path" CTA, no visible checkmark inside the module itself. The progress tracking exists (green dots in nav) but the user doesn't see the reward. Every module page should have a designed exit state: "✓ Done · [Next in path: X] · [Test yourself: PrepLab]." The end of a module is the highest-intent moment in the product and it's currently empty.
*Status: Open*

**C2. Learning path context disappears inside tabs**
When you're mid-path and navigate into a Systems module, nothing shows "you're on step 3 of 7 of Agent Engineering." The path context disappears. A persistent mini-breadcrumb or progress bar at the top of each tab while a path is active would significantly improve completion rates.
*Status: Open*

**C3. Flows animations are the product's best visual asset and are invisible**
Flows.jsx has frame-by-frame SVG pipeline animations (dashDraw, pulseDot, blockFlash, tokenIn/Out) showing RAG pipelines, agent loops, and failure modes in real time. This is more visually impressive than anything else in the product. It's discovered only if you navigate to Flows. A looping animation on the home page showing one RAG failure playing through would be the strongest above-the-fold visual in the product.
*Status: Open*

**C4. The Concepts tokenizer is more shareable than its tab placement implies**
Concepts.jsx builds a working in-browser tokenizer with a 400+ word vocabulary and subword splitting — you type, you see tokens, you see the count. This is the kind of demo that reaches Hacker News. It's listed as one module alongside attention mechanics and transformer architecture. It probably deserves its own URL or at minimum a prominent "Try the Tokenizer" callout on the home page.
*Status: Open*

**C5. TransformerWalkthrough is the template that should apply to 10+ more posts**
At least one GT post embeds a `TransformerWalkthrough` — an interactive visual you can step through, inside a long-form article. This is the highest-leverage content format in the product: one interactive visual is more memorable than 2,000 words. It exists for one post and isn't replicated. A Tier 1 roadmap item should be: "Add an interactive visual to the top 10 most-read GT posts."
*Status: Open — added to IDEAS.md candidates*

---

### Section D — Ground Truth Reading Experience

**D1. generateQuiz is a hidden gem**
`GroundTruth.jsx` has a `generateQuiz(blocks)` function that auto-generates quiz questions from callout blocks and list items in each post. Read an article → test yourself on it → all inside the same view. This is a genuine product innovation. It needs a visible entry point: "Test yourself on this post → 3 questions" below the post header.
*Status: Open*

**D2. PrepLab → GT cross-links are too coarse**
`readMore: { label: "RAG Evaluation Deep Dive", tab: "groundtruth" }` opens the entire GT tab, not the post. With 200+ posts, the user has to search from scratch. Almost no one follows through. Fix: `{ tab: "groundtruth", postId: "rag-evaluation-guide" }` — a one-line change per question.
*Status: Open*

**D3. Reactions are siloed in localStorage**
Post reactions (🎯 🤯 🤔 🔖) are stored per-device with no aggregate signal. PostHog is already wired in. Flushing reaction events to analytics would give free signal on which posts users find confusing vs. valuable — the cheapest possible content quality feedback loop.
*Status: Open*

---

### Section E — PrepLab

**E1. Text question keyword grading is the product's worst UX moment**
Free-text answers are graded by checking for presence of specific keywords (e.g., `["precision", "context", "small chunk", "large chunk", "embedding"]`). A correct answer using different vocabulary gets marked wrong. This creates a specific trust failure: the user knows they're right, the system says they're wrong, they leave PrepLab. Fix: either surface the grading keywords upfront ("We're checking for these concepts: ...") or switch to a more flexible semantic match approach.
*Status: Open*

**E2. Two quiz systems exist and are disconnected**
PrepLab has curated, hand-written high-quality questions. The GT `generateQuiz` auto-generates lower-quality "which statement" questions from callout text. They're parallel systems that don't know about each other. These should either converge (GT posts can have explicit PrepLab-style questions added by authors) or be clearly differentiated in the UI.
*Status: Open*

---

### Section F — Content & SEO

**F1. Stat numbers are stale and inconsistent across files**
- `index.html` description: "126+ interactive modules"
- `og:description`: "126+ interactive modules"
- `Home.jsx` STATS: 145 GT posts
- `IDEAS.md`: 202+ GT posts, 48+ Systems modules
These don't agree and are all out of date. Needs a quarterly sync pass or a single source of truth that gets referenced from index.html and Home.jsx.
*Status: Open*

**F2. The SalaryCalculator is the most shareable tool and is buried**
Both `Career.jsx` and `AIPM.jsx` import `SalaryCalculator`. If it has real India AI salary data (ranges by role, company tier, experience), it's the kind of tool that circulates on LinkedIn and brings first-time visitors. It doesn't appear in the hero, the home page module descriptions, or the stats. It deserves its own callout.
*Status: Open*

---

### Section G — Design System

**G1. Typography hierarchy is flattened by overuse of `text-[10px]` uppercase labels**
The `text-[10px] font-bold uppercase tracking-widest` pattern is used in 30+ places as section headers, field labels, timestamps, category tags, and sub-labels. When everything is styled the same, nothing is a real header. The hierarchy needs 3-4 distinct levels: section title, subsection label, field label, metadata.
*Status: Open*

**G2. Group colors don't carry through from home page to in-tab experience**
The home module map uses violet = LEARN, blue = BUILD, green = GROW to color-code groups. Inside the tabs, these color associations dissolve — Systems modules use amber, Agents modules use indigo/violet, Explore modules use cyan. A user who builds a mental model from the home page loses it the moment they enter a tab. Even a colored left-border on module cards matching the home page group color would maintain coherence.
*Status: Open*

**G3. The internal QA review criteria should be public**
REVIEW_CRITERIA in the QA Dashboard: "Genuinely interactive", "Teaches a production-relevant failure mode", "Avoids AI hype", "A serious engineer or PM would trust this content". These are strong editorial standards. Making them visible — a "How we build this" section or content principles page — differentiates from AI tutorial farms and builds trust with the skeptical senior engineer audience.
*Status: Open*

---

### Items Fixed During This Audit Session

| Item | Action Taken |
|---|---|
| WhatsApp OG thumbnail showing old app screenshot | Replaced `public/og-image.png` with bold hero design matching the landing page: "AI systems break in production. Learn exactly why." |

---

## How to Use This File

**Starting an audit session:**
1. Pick an audit type from the table at the top
2. Read through existing open findings first — don't re-discover what's already documented
3. Add new findings in the appropriate section with status: Open
4. When a finding is resolved, mark it ✅ Resolved and note what was done

**After a build session:**
- Scan Section C (in-tab) and Section B (navigation) for anything newly introduced
- Update stat numbers in Section F if content was added

**Promoting to IDEAS.md:**
- If a finding implies a buildable feature, add it to IDEAS.md Tier 1 or 2
- Keep AUDITS.md as the diagnostic record; IDEAS.md as the build backlog
