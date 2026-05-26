# AUDITS — Living Product Audit Log

A structured record of every audit run on GenAI Systems Lab — formal or informal, named or unnamed at the time. Each entry captures what was found, what was resolved, and what remains open. Use this before starting a new audit to avoid re-discovering known issues.

*Created: May 2026 | Updated after each audit session*

---

## Audit Types Reference

Run these periodically. Pick one per session, or stack them after major build phases.

| Type | What It Covers | Suggested Cadence |
|---|---|---|
| **Creativity / Product** | Design, UX, value delivery, layout, information architecture, differentiation | Monthly |
| **BUILD** | Prop wiring, dead code, duplicate keys, color consistency, component contracts | After every sprint |
| **Structural / Architecture** | File size, component coupling, split thresholds, prop drilling depth | Quarterly |
| **Visual Consistency** | Color palette drift, border radius, font usage, spacing inconsistencies | After every sprint |
| **Navigation & Discoverability** | Tab structure, hidden features, dead-end flows, path coherence | Quarterly |
| **Content Integrity** | Stat accuracy, duplicate keys, stale copy, version mismatches | Monthly |
| **PrepLab Coverage** | Which modules lack questions, topic balance, difficulty distribution | After adding 5+ modules |
| **Cross-linking Density** | GT ↔ Systems ↔ PrepLab ↔ Explore connection coverage | Monthly |
| **Framework / Technical** | React patterns, hook usage, lazy loading, render correctness | Quarterly |
| **UX / Human Elements** | Empty states, author voice, tone, onboarding friction, exit states | Quarterly |
| **Micro-interaction** | Animation feedback, button states, loading states, transition quality | Quarterly |
| **SEO / Social** | OG tags, meta descriptions, structured data, sitemap freshness, sharing preview | After major content adds |
| **Mobile UX** | Nav on small screens, touch targets, scroll behavior, font sizes | Quarterly |
| **Content Landscape** | Are we covering what's emerging? What topics are competitors missing? | Monthly |
| **MVP / Weight** | Which tabs earn their place? Traffic, depth, uniqueness, maintenance cost | Quarterly |
| **IP / Moat** | What's hard to replicate? What's original? What deserves doubling down? | Bi-annually |
| **Content Quality** | Hype language, accuracy, fidelity labels, interactivity vs. passive reading | Quarterly |
| **First-Time User** | Cold walk-through in incognito — every confusion point noted as it happens | Monthly |

---

## Audit 1 — Structural / Architecture Audit

**Date:** Pre-May 2026 (mid build phase)
**Scope:** `src/Systems.jsx`, file size thresholds, component coupling
**Trigger:** Systems.jsx crossed 9,500 lines. Vite handled it fine but file tools (Read with offset/limit) were the only viable way to work in it. LLM context windows were hitting the ceiling on the file.
**Status:** Resolved ✅

### Findings & Resolutions

| # | Finding | Status |
|---|---|---|
| 1 | `Systems.jsx` at 9,500+ lines — single file for all 38+ module components | ✅ Split into `Systems.jsx` (139 lines — registry + SystemsApp shell) + `src/systems/modules.jsx` (module components) |
| 2 | No pattern established for when to split a file | ✅ Threshold set in DECISIONS.md: extract when parent would exceed ~2,500 lines |
| 3 | All module components lived in one namespace — no group isolation | ✅ Accepted as-is; DESIGN/BUILD/OPS grouping is logical not physical |

**Outstanding:**
- `modules.jsx` is itself now 9,500+ lines. IDEAS.md Tier 2 notes a further split into `build.jsx`, `ops.jsx`, `design.jsx` — low urgency since Vite handles it fine.

---

## Audit 2 — Framework / Technical Audit

**Date:** Pre-May 2026
**Scope:** React hook usage across all JSX files
**Trigger:** Runtime crash in production — a module was calling `React.useState()` instead of destructured `useState()`. The crash was silent in dev (hot reload masked it) and surfaced only on Vercel.
**Status:** Resolved ✅

### Findings & Resolutions

| # | Finding | File | Status |
|---|---|---|---|
| 1 | `React.useState` called without importing React — ReferenceError at runtime | Multiple modules | ✅ Fixed: always destructure `{ useState }` at import. Rule added to DECISIONS.md |
| 2 | No lint rule enforcing the import pattern | — | ⚠️ Open: no ESLint config in place. Relies on convention |
| 3 | Lazy loading not applied to heavy tab components — all loaded on initial bundle | App.jsx | ✅ Fixed: `React.lazy + Suspense` applied to all 14 heavy tab components |

**Rule established:** NEVER use `React.useState`, `React.useEffect` etc. Always destructure at import. This is a hard constraint given the Vite/React setup.

---

## Audit 3 — PrepLab Coverage Audit (Round 1)

**Date:** Pre-May 2026
**Scope:** PrepLab question bank vs. Systems + Agents + Explore module list
**Trigger:** PrepLab launched with 28 questions covering only early modules. As Systems grew to 15+ modules, coverage gaps became visible.
**Status:** Partially resolved — ongoing after every module batch

### Findings & Resolutions

| # | Finding | Status |
|---|---|---|
| 1 | 9 Systems modules had zero PrepLab questions | ✅ Added 28 questions (Round 1) |
| 2 | No coverage for Agents modules | ✅ Added Agents questions |
| 3 | No coverage for new modules: Flash Attention, Quantization, Serving, Prompt Caching, Fine-tuning, RLHF, Multimodal | ✅ Added 42 questions across 7 modules |
| 4 | 5 additional modules added without questions (Round 3 gap) | ✅ Added 20 questions |
| 5 | Coverage target not formally defined | ✅ Set in LINEAGE.md: every Systems module ≥ 4 PrepLab questions |
| 6 | Text-type questions (free response) had no coverage for system design | ✅ Added system design text questions across RAG, agents, context |

**Current state:** 183+ questions across all modules. Needs a pass after every batch of 5+ new modules.

**Outstanding:**
- Keyword grading for text questions is fragile — correct answers in different vocabulary get marked wrong. (See Creativity Audit, Section E1.)
- PrepLab → GT cross-links are too coarse — opens tab, not specific post. (See Creativity Audit, Section D2.)

---

## Audit 4 — Content Integrity Audit (Running)

**Date:** Pre-May 2026 through May 2026 (multiple instances)
**Scope:** `groundTruthPosts.js`, `groundTruthIndex.js`, `GroundTruth.jsx`, `Systems.jsx`
**Trigger:** Each instance triggered by a runtime bug or silent wrong behavior.
**Status:** Multiple rounds — each resolved at time of discovery

### Findings & Resolutions

| # | Finding | File | Date | Status |
|---|---|---|---|---|
| 1 | `CATEGORIES` array in GroundTruth.jsx didn't match actual post categories — filter produced empty results | GroundTruth.jsx | Pre-May 2026 | ✅ Fixed |
| 2 | Duplicate post keys in groundTruthPosts.js — later key silently overwrote earlier | groundTruthPosts.js | Pre-May 2026 | ✅ Fixed |
| 3 | `finetuning` RELATED_GT key defined twice in Systems.jsx — second definition overwrote first, losing `lora-in-practice` from cross-links | Systems.jsx | May 2026 | ✅ Fixed |
| 4 | `case "refs":` block in GroundTruth.jsx renderer was a dead branch — all `{ t: "refs" }` blocks rendered nothing silently | GroundTruth.jsx | May 2026 | ✅ Fixed (case renamed + styled renderer added) |
| 5 | Stat numbers inconsistent across files: index.html says "126+ modules", Home.jsx STATS says 145 GT posts, IDEAS.md says 202+ posts | Multiple | May 2026 | ✅ Fixed — index.html updated to 140+ modules, 202+ posts |
| 6 | `og:description` in index.html still says "126+ interactive modules" — months out of date | index.html | May 2026 | ✅ Fixed |

**Outstanding:**
- A quarterly stat sync pass is needed across: `index.html` meta description, `og:description`, `Home.jsx` STATS array, `twitter:description`, structured data JSON-LD.

---

## Audit 5 — Cross-linking Density Audit (Round 1)

**Date:** Pre-May 2026
**Scope:** GT posts ↔ Systems modules connection coverage
**Trigger:** Systems modules were written with no awareness of GT content. Users who finished a module had no path to the related long-form writing.
**Status:** Resolved ✅

### Findings & Resolutions

| # | Finding | Status |
|---|---|---|
| 1 | 0 of 38 Systems modules had GT cross-links | ✅ Added RELATED_GT map in Systems.jsx — 38 module → post mappings |
| 2 | GT posts had no reference back to interactive modules | ✅ Added `labLink` + `labLabel` + `labModuleId` fields to groundTruthIndex.js entries |
| 3 | Agents tab had no GT cross-links at all | ✅ Added AGENTS_RELATED_GT map (15 modules) |
| 4 | Explore tab: only `embeddings` module received `onNavigate` — 18 others couldn't navigate to GT | ✅ Fixed: pass `onNavigate` to all 19 Explore modules |
| 5 | 3 missing RELATED_GT entries: indiascale, inference, buildthis | ✅ Added |

---

## Audit 6 — Cross-linking Density Audit (Round 2 — Horizontal + Vertical GT Graph)

**Date:** May 2026
**Scope:** `groundTruthIndex.js` (58 posts), `groundTruthPosts.js` (27 high-priority posts), `GroundTruth.jsx`
**Trigger:** GT posts existed as isolated documents with no navigation between them. 200+ posts with no related-posts graph meant users read one post and left.
**Status:** Resolved ✅

### Findings & Resolutions

| # | Finding | Status |
|---|---|---|
| 1 | 0 of 202 GT posts had `related: []` arrays — no horizontal or vertical navigation | ✅ Python script injected `related` arrays into 58 posts |
| 2 | `case "video":` block used iframe embed — fragile, autoplay issues, wrong IDs break hard | ✅ Replaced with thumbnail-link card (graceful `onError` fallback) |
| 3 | `case "refs":` was named `case "references":` in renderer — all `t: "refs"` blocks silently rendered nothing | ✅ Fixed + added platform-badge styled renderer (arXiv, Anthropic, GitHub, etc.) |
| 4 | "Keep reading" section used same-category filter only — no cross-category linking | ✅ Upgraded: uses curated `post.related` with cross-category badge |
| 5 | 27 high-priority posts had no video or refs blocks | ✅ Injected 15 video blocks and 87 refs blocks via Python script |
| 6 | Related graph had no vertical structure (foundational → advanced) | ✅ Added vertical links: e.g., `what-is-a-transformer` → `self-attention-deep-dive` → `decoding-sampling` |

---

## Audit 7 — Visual Consistency Audit

**Date:** Pre-May 2026 / May 2026
**Scope:** `src/Explore.jsx`, `src/systems/modules.jsx`, all tab components
**Trigger:** Noticed `gray-*` Tailwind classes in newly-built modules while the rest of the app used `zinc-*`. Visual inconsistency became visible at scale.
**Status:** Resolved ✅

### Findings & Resolutions

| # | Finding | File | Status |
|---|---|---|---|
| 1 | Explore.jsx used `gray-*` classes — visual drift from zinc-only system | Explore.jsx | ✅ Fixed |
| 2 | 85 `gray-*` occurrences across 7 modules: FlashAttention, Quantization, ServingInfra, FineTuningWorkflows, RLHFAlignment, MultimodalSystems, PromptCaching | modules.jsx | ✅ Fixed via sed bulk replacement |
| 3 | No documented color rule | — | ✅ Rule added to DECISIONS.md: zinc-* palette only. gray-*/slate-* is visual inconsistency |

**Outstanding:**
- Group colors (violet=LEARN, blue=BUILD, green=GROW) defined on home page don't carry through to in-tab module headers. (See Creativity Audit, Section G2.)

---

## Audit 8 — Navigation Audit

**Date:** Pre-May 2026
**Scope:** Tab bar structure, group labels, tab sequence, tab naming
**Trigger:** Added Learning Paths tab and PrepLab — the nav bar had become a flat list of 12+ items with no logical grouping visible to the user.
**Status:** Resolved ✅ (structurally — deeper UX issues remain open)

### Findings & Resolutions

| # | Finding | Status |
|---|---|---|
| 1 | Paths tab not in navigation despite being built | ✅ Added to nav |
| 2 | Tab sequence was historical order of building — not user journey order | ✅ Resequenced to LEARN → BUILD → GROW flow |
| 3 | Tab labels were technical ("Agents", "Fluency") with no context | ✅ Renamed with sub-labels in home module map |
| 4 | No visual group separation in the nav bar | ✅ Added group headers (LEARN / BUILD / GROW) in desktop nav |
| 5 | PrepLab not in SHORTCUT_TABS keyboard shortcuts | ✅ Fixed — `"preplab"` added to `SHORTCUT_TABS` array in App.jsx |

**Outstanding:**
- 14 tabs is still too many for a flat list. GROUP headers exist in the sidebar but the top nav bar remains flat. (See Creativity Audit, Section B1.)
- Consultation tab (`consult`) not in SHORTCUT_TABS, not on home page, effectively hidden. (See Creativity Audit, Section B3.)

---

## Audit 9 — UX / Human Elements Audit

**Date:** Pre-May 2026
**Scope:** Full app — empty states, author voice, tone, personal sections
**Trigger:** The app felt technically correct but impersonal — every empty state was blank, there was no author attribution, and no "why this was built" context anywhere.
**Status:** Resolved ✅

### Findings & Resolutions

| # | Finding | Status |
|---|---|---|
| 1 | GT posts had no author byline — felt authorless | ✅ Added author section to GT post footer |
| 2 | No personal "About" section anywhere in the app | ✅ Added About panel in GT or home |
| 3 | Empty state for "no modules visited" was blank | ✅ Added copy: orientation text for first-time users |
| 4 | PrepLab empty state (no questions attempted) was blank | ✅ Added onboarding copy |
| 5 | App had no stated editorial standard — why should anyone trust it? | ⚠️ Internal QA criteria exist but are not public (see Creativity Audit, Section G3) |

---

## Audit 10 — Micro-interaction Audit

**Date:** Pre-May 2026
**Scope:** Home page stats, PrepLab feedback, step indicators, button states
**Trigger:** The app felt static compared to the content quality. Interactions had no visual feedback — clicking felt dead.
**Status:** Resolved ✅

### Findings & Resolutions

| # | Finding | Status |
|---|---|---|
| 1 | Stats on home page were static numbers — no draw animation | ✅ Added CountUp animation (number counts up from 0 on page load) |
| 2 | PrepLab answer submission had no visual feedback | ✅ Added correct/incorrect flash state with explanation reveal |
| 3 | "Start Here" journey step indicators had no visited state | ✅ Added ✓ checkmark + emerald color for visited steps |
| 4 | Module step bounce animation missing | ✅ Added step bounce on Systems module card selection |
| 5 | No button press states (`:active`) on interactive elements | ✅ Added global active scale-down (95%) on buttons |

**Outstanding:**
- Module endings are still silent — no "✓ Done" moment within the module page itself. (See Creativity Audit, Section C1.)
- Learning path context disappears when navigating into a tab mid-path. (See Creativity Audit, Section C2.)

---

## Audit 11 — Content Landscape Audit

**Date:** Pre-May 2026
**Scope:** External AI landscape, competitor coverage, emerging topic gaps
**Trigger:** Ran a research pass on what AI practitioners were discussing that the lab wasn't covering.
**Status:** Acted on — new modules built from findings

### Findings & Actions

| Finding | Action |
|---|---|
| GRPO / Agent RL training was becoming mainstream (DeepSeek R1 etc.) but no module existed | ✅ Built GRPO / Agent RL Training module |
| A2A protocol (agent-to-agent communication) was new and underexplained | ✅ Built A2A Protocol module in Agents |
| MoE architecture became mainstream (Mixtral, DeepSeek, Grok) — no module | ✅ Built MoE Architecture module in Systems |
| Vibe coding / agentic dev workflows had no coverage | ✅ Built Vibe Coding & Agentic Dev module in Systems |
| World models were emerging topic — no GT post | ✅ Added World Models GT post |
| KV Cache was a core concept with no dedicated module | ✅ Built KV Cache Engineering module |
| AI Guardrails had no module despite being a frequent interview topic | ✅ Built AI Guardrails module |
| No coverage of context compaction (Claude 3.7+ feature) | ✅ Built Context Compaction module |

---

## Audit 12 — SEO / Social Audit

**Date:** May 2026
**Scope:** `public/og-image.png`, `index.html` meta tags, `twitter:image`, OG preview behavior
**Trigger:** User noticed WhatsApp thumbnail showed old app screenshot — not the landing page hero design.
**Status:** Partially resolved

### Findings & Resolutions

| # | Finding | Status |
|---|---|---|
| 1 | `public/og-image.png` was a screenshot of the app UI — showed the old "11 Tabs, 75+ Modules" design, not the current hero | ✅ Replaced with bold hero design: "AI systems break in production. Learn exactly why." in PIL-generated 1200×630 PNG |
| 2 | `og:image` and `twitter:image` both pointed to `/og-image.png` — now updated | ✅ Resolved (same file) |
| 3 | Meta description in `index.html` still says "126+ interactive modules" | ✅ Fixed — updated to 140+ modules, 202+ posts |
| 4 | `og:description` still says "126+ interactive modules" | ✅ Fixed — updated to 140+ modules, 202+ posts |
| 5 | Hero text in live app uses `text-violet-400`; OG image uses cyan — color inconsistency | ✅ Fixed — Home.jsx changed to `text-cyan-400` to match OG image |
| 6 | `twitter:description` says "169+ Ground Truth posts" — now 202+ | ✅ Fixed — updated to 202+ |

---

## Audit 13 — BUILD Audit

**Date:** May 2026
**Scope:** `App.jsx`, `Systems.jsx`, `Agents.jsx`, `Explore.jsx`, `src/systems/modules.jsx`
**Status:** All findings resolved ✅

### Findings & Resolutions

| # | Finding | File | Status |
|---|---|---|---|
| 1 | `finetuning` RELATED_GT key defined twice — second silently overwrote first, losing `lora-in-practice` | Systems.jsx | ✅ Fixed |
| 2 | `onNavigate` not wired to AgentsApp | App.jsx | ✅ Fixed |
| 3 | `onNavigate` not wired to PlaygroundApp | App.jsx | ✅ Fixed |
| 4 | 3 missing RELATED_GT entries: indiascale, inference, buildthis | Systems.jsx | ✅ Fixed |
| 5 | No AGENTS_RELATED_GT map — 15 modules had no GT cross-links | Agents.jsx | ✅ Fixed |
| 6 | Only `embeddings` module received `onNavigate` — 18 other Explore modules got `undefined` | Explore.jsx | ✅ Fixed |
| 7 | 85 `gray-*` Tailwind classes across 7 modules — visual inconsistency | modules.jsx | ✅ Fixed |

---

## Audit 14 — Creativity / Product Audit

**Date:** May 2026
**Scope:** Full product — home page, all tabs, GT reading experience, PrepLab, navigation, design system, OG/social
**Status:** Findings documented. Items marked ✅ acted on immediately. All others are open backlog.

### Section A — Home Page & First Impression

**A1. Hero color inconsistency between live app and OG image**
Live app: `text-violet-400`. OG image (now updated): cyan. Decision needed — commit to one.
*Status: ✅ Fixed — Home.jsx changed to `text-cyan-400`; both now cyan*

**A2. Home page scroll is a marathon**
Hero → Start Here Journey → Stats → Failure Mode Chips → Social Proof → Daily Tip → Learning Paths → Module Map → Role Toggle → Concept Graph → Newsletter → Footer. Fold should end at primary CTA + concept graph.
*Status: ⚠️ Open*

**A3. Dependency graph should be higher and larger**
The concept dependency graph is the most creative UI element in the product — teaches something before the user clicks anything. Currently buried below stats and social proof.
*Status: ⚠️ Open*

**A4. Social proof is unconvincing**
"ML Engineer · fintech startup" with no name, no handle, no company. Replace with verified quotes, tweet screenshots, or a verifiable count.
*Status: ⚠️ Open*

**A5. Ground Truth is undersold**
200+ production-depth posts is the second-strongest asset. It's a tab of equal weight to "Fluency Gym." Split the stat row to call it out explicitly as a pillar.
*Status: ⚠️ Open*

**A6. Role selector is buried**
Engineers / PMs / all toggle reorders the full module map — a meaningful personalization — but lives below the fold. Should be one of the first interactions for a new user.
*Status: ⚠️ Open*

**A7. No "What's New" signal for returning users**
Nothing in the UI signals that content was added recently. A "Recently added" strip would give returning users a reason to come back.
*Status: ⚠️ Open*

### Section B — Navigation & Discoverability

**B1. Navigation is overloaded — 14 flat tabs**
LEARN / BUILD / GROW grouping from home page doesn't carry through to the nav bar. First-time visitors have no orientation signal.
*Status: ⚠️ Open*

**B2. PrepLab not in SHORTCUT_TABS**
183 questions + spaced repetition is a flagship feature. `SHORTCUT_TABS` array doesn't include it — not keyboard-accessible and harder to discover.
*Status: ✅ Fixed — `"preplab"` added to App.jsx SHORTCUT_TABS*

**B3. Consultation tab is dead weight**
`consult` topView exists, has a component, is not in SHORTCUT_TABS, not in any learning path, not on home page. Either remove or give a visible entry point.
*Status: ⚠️ Open*

**B4. Locking system creates a broken promise**
Systems, Fluency, AIPM, Career are locked behind `?preview=CODE`. Product says "FREE · NO LOGIN · NO ADS" but a visitor to a locked tab hits a wall. Lock state needs to be softer — a teaser, not a hard stop.
*Status: ⚠️ Open*

### Section C — In-Tab Experience

**C1. Module endings are silent**
No "✓ Done" moment, no "next in path" CTA, no visible reward inside the module itself. The end of a module is the highest-intent moment in the product and is currently empty.
*Status: ⚠️ Open*

**C2. Learning path context disappears inside tabs**
When mid-path and navigating into a module, nothing shows "step 3 of 7." Path context disappears on tab enter.
*Status: ⚠️ Open*

**C3. Flows animations are invisible from the home page**
Frame-by-frame SVG pipeline animations showing failure modes playing out in real time. More visually impressive than anything else in the product. Discovered only by navigating to Flows. Should be the centerpiece visual on the home page.
*Status: ⚠️ Open*

**C4. Concepts tokenizer deserves its own spotlight**
In-browser tokenizer with 400+ word vocabulary — type text, see tokens. The kind of demo that reaches Hacker News. Buried as one module among many in Concepts.
*Status: ⚠️ Open*

**C5. TransformerWalkthrough is the content format template**
One GT post embeds an interactive walkthrough. This format — interactive visual inside long-form text — is more memorable than 2,000 words of prose. Exists once. Should be the pattern for top-10 most-read posts.
*Status: ⚠️ Open*

**C6. Post-sim debrief link is missing**
After the RAG failure simulator scores the user's config, there's no "read the full post on this failure mode" link to the corresponding GT post. Connecting the two would turn a 5-minute lab into a 20-minute learning loop.
*Status: ⚠️ Open*

### Section D — Ground Truth Reading Experience

**D1. generateQuiz is a hidden gem**
`GroundTruth.jsx` auto-generates quiz questions from callout blocks in each post. A genuine product innovation with no visible entry point. Needs a "Test yourself → 3 questions" CTA below the post header.
*Status: ⚠️ Open*

**D2. PrepLab → GT cross-links are too coarse**
`readMore: { tab: "groundtruth" }` opens the GT tab, not a specific post. With 200+ posts, users don't follow through. One-line fix per question: `{ tab: "groundtruth", postId: "post-id" }`.
*Status: ⚠️ Open*

**D3. Reactions are siloed in localStorage**
Post reactions (🎯🤯🤔🔖) have no aggregate signal. PostHog is wired in. Flushing reaction events to analytics would give free content quality signal — cheapest possible feedback loop.
*Status: ⚠️ Open*

### Section E — PrepLab

**E1. Text question keyword grading is the product's worst UX moment**
Correct answers in different vocabulary are marked wrong. User knows they're right — system says they're wrong — trust in PrepLab breaks. Fix: surface grading keywords upfront ("We check for: ...") or move to semantic matching.
*Status: ⚠️ Open*

**E2. Two quiz systems exist disconnected**
PrepLab has curated hand-written questions. GT `generateQuiz` auto-generates lower-quality questions from callout text. Neither knows about the other.
*Status: ⚠️ Open*

### Section F — Content & SEO

**F1. Stat numbers stale and inconsistent**
`index.html`: "126+ modules." `og:description`: "126+ modules." `Home.jsx STATS`: 145 GT posts. `IDEAS.md`: 202+ posts. None agree. Need a quarterly sync.
*Status: ✅ Fixed — index.html (meta, og, twitter) updated to 140+ modules, 202+ posts. Home.jsx STATS still needs a manual count check.*

**F2. SalaryCalculator is the most shareable tool and is buried**
Imported in Career.jsx and AIPM.jsx — doesn't appear in hero, stats, or home module map. If it has real India AI salary data, this is a viral shareable tool that's invisible.
*Status: ⚠️ Open*

### Section G — Design System

**G1. `text-[10px]` uppercase label pattern is overused**
Used in 30+ places as section headers, field labels, timestamps, category tags. When everything uses the same style, nothing has hierarchy. Needs 3-4 distinct levels.
*Status: ⚠️ Open*

**G2. Group colors don't carry through from home page to in-tab**
Violet=LEARN, blue=BUILD, green=GROW on home page. Inside tabs, associations dissolve. Even a colored left-border on module cards matching group color would maintain coherence.
*Status: ⚠️ Open*

**G3. Internal QA review criteria should be public**
"Genuinely interactive," "Teaches a production-relevant failure mode," "Avoids AI hype," "A serious engineer or PM would trust this content." These are strong editorial standards. Making them public would differentiate from AI tutorial farms.
*Status: ⚠️ Open*

### Items Resolved During This Audit Session

| Item | Action |
|---|---|
| WhatsApp OG thumbnail showed old app screenshot | Replaced with bold hero design — "AI systems break in production. Learn exactly why." |

---

## Audit 15 — Content Integrity Audit (Round 2)

**Date:** May 2026
**Scope:** `groundTruthIndex.js`, `groundTruthPosts.js`, `Home.jsx`, `index.html`, `README.md`
**Trigger:** Systematic scan for big-win zero-effort errors — stale stats, mislabeled sections, factual overclaims.
**Method:** grep + python3 line counts against all public-facing stat claims.

### Findings & Resolutions

| # | Finding | Files | Status |
|---|---|---|---|
| 1 | **GT post count overclaim** — `groundTruthIndex.js` has 192 posts; "202+" claimed everywhere | README, Home.jsx, index.html | ✅ Fixed — all changed to "190+" |
| 2 | **README section header mismatch** — "## The 13 tabs" contradicts "14 tabs" on line 25 | README.md line 66 | ✅ Fixed — changed to "## The 14 tabs" |
| 3 | **PrepLab question count stale** — 191 actual questions vs "183+" claimed | README, PrepLab.jsx | ✅ Fixed — updated to "190+" in README |
| 4 | **57 unindexed GT posts** — `groundTruthPosts.js` has 249 content entries, only 192 are in `groundTruthIndex.js`. Posts with content but no metadata entry are invisible to users. | groundTruthPosts.js, groundTruthIndex.js | ⚠️ Open — requires identifying orphaned IDs and deciding: index them, delete them, or document them as stubs |

**Verified counts as of May 2026:**
- GT posts indexed (visible to users): 192
- GT content entries in groundTruthPosts.js: 249 (57 unindexed)
- PrepLab questions: 191
- Systems modules (label: count in Systems.jsx): 50

**Outstanding:**
- Audit 4 quarterly note still applies: run a stat sync pass after every content sprint.
- The 57 unindexed GT posts need a follow-up pass: list the orphan IDs, decide fate per-post.

---

## Audit 16 — Quick Scan Batch (BUILD + Content + Navigation)

**Date:** May 2026
**Scope:** Color drift, hook correctness, orphaned content, GT related-graph coverage, SHORTCUT_TABS completeness, missing labLinks
**Method:** grep + python3 counts across all src/ files. No file read required — all findings are machine-countable.
**Status:** Findings documented. Items marked ✅ acted on immediately.

### Findings

| # | Finding | File | Severity | Status |
|---|---|---|---|---|
| 1 | **1 remaining `slate-*` class** — `text-slate-400` and `bg-slate-900/60` in MCP protocol layer data object | `Concepts.jsx` line 224 | Low | ⚠️ Open |
| 2 | **No `React.useState` / `React.useEffect` remaining** — clean | All `.jsx` | — | ✅ Clean |
| 3 | **No duplicate IDs in groundTruthIndex.js** — clean | `groundTruthIndex.js` | — | ✅ Clean |
| 4 | **134 GT posts have no `related[]` array** — only 58 of 192 posts have "Keep reading" navigation. The other 134 are dead ends after a read. | `groundTruthIndex.js` | High | ✅ Fixed — batch script injected related[] into 136 posts using tag+category scoring. 194/202 posts now have related[]. 0 broken refs, 0 self-references. |
| 5 | **10 orphaned post IDs** — ~~content written in `groundTruthPosts.js`, no index entry~~ — **SUPERSEDED by Audit 18**: 8 of 10 are indexed in multi-line format; true orphans are only `prompt-cost-engineering` and `rlhf-dpo-explained-v2` | `groundTruthPosts.js` / `groundTruthIndex.js` | High | ⚠️ Partially corrected — see Audit 18 |
| 6 | **`groundtruth` tab not in SHORTCUT_TABS** — the GT posts grid is a primary content surface but not keyboard-navigable via number shortcuts | `App.jsx` | Medium | ⚠️ Open |
| 7 | **`consult` tab not in SHORTCUT_TABS** — already documented in Audit 8/B3; confirmed still missing | `App.jsx` | Low | ⚠️ Open (known) |
| 8 | **All 45 Systems modules have RELATED_GT entries** — cross-link coverage complete | `Systems.jsx` | — | ✅ Clean |
| 9 | **7 posts have no `labLink`** — `persp-karpathy`, `persp-willison`, `persp-swyx`, `persp-hamel`, `persp-chollet`, `persp-lecun`, `world-models-primer`. Perspective posts intentionally have no lab; `world-models-primer` may need one. | `groundTruthIndex.js` | Low | ⚠️ Open (mostly intentional) |

### Key numbers verified

| Metric | Count |
|---|---|
| GT posts indexed (visible) | 192 |
| GT posts with `related[]` | 58 |
| GT posts with no `related[]` | 134 |
| Orphaned post content entries | 10 |
| Systems modules with RELATED_GT | 45 / 45 |
| Posts with no `labLink` | 7 (all `persp-*` + world-models-primer) |
| Remaining `slate-*` / `gray-*` classes | 1 |
| Remaining `React.useState` violations | 0 |
| Duplicate groundTruthIndex IDs | 0 |

### Priority actions from this audit

**Finding 5 (10 orphaned posts)** — highest ROI: add index entries for each of the 10 posts. Content already written, just needs metadata in `groundTruthIndex.js`. Would immediately surface 10 additional posts to users.

**Finding 4 (134 posts with no related[])** — medium effort: run a batch script to inject plausible `related` arrays using category + tag matching. Audit 6 proved this works.

**Finding 1 (slate-* in Concepts.jsx)** — one-liner fix: change `text-slate-400` → `text-zinc-400` and `bg-slate-900/60` → `bg-zinc-900/60` on line 224.

**Finding 6 (groundtruth not in SHORTCUT_TABS)** — one-liner fix: add `"groundtruth"` to the SHORTCUT_TABS array in App.jsx.

---

## Audit 17 — Multi-Type Quick Scan Batch

**Date:** May 2026
**Scope:** Code hygiene, PrepLab topic balance, analytics event coverage, RSS freshness, GT post depth, CLAUDE.md sync, README dead links
**Method:** grep + python3 across all src/ files and public/. No manual reading required.
**Status:** Findings documented. CLAUDE.md stat fix applied.

### Findings

| # | Finding | File(s) | Severity | Status |
|---|---|---|---|---|
| 1 | **CLAUDE.md stats stale** — line 13 says "183+ PrepLab questions, 202+ Ground Truth posts" — both wrong vs actuals (191 and 192) | `CLAUDE.md` | Medium | ✅ Fixed — updated to 190+ / 190+ |
| 2 | **RSS feed missing 30 recent posts** — `/rss.xml` has 20 items, hardcoded. 30 of the most recently added GT posts are not in the feed. Last RSS entry is "From Fine-Tuned Model to Production." All `persp-*`, `how-i-build`, `data-flywheel`, and `frontier` posts are absent. | `public/rss.xml` | High | ⚠️ Open |
| 3 | **PrepLab topic distribution skew** — 11 topics are at the 4-question minimum: `attention`, `quantization`, `serving`, `caching`, `context`, `design`, `transformers`, `streaming`, `merging`, `constrained`, `sysdesign`. Meanwhile `agents` (26) and `llmops` (25) are 6× heavier. Foundational topics like `attention` and `transformers` are underrepresented for their importance. | `PrepLab.jsx` | Medium | ⚠️ Open |
| 4 | **METRICS.md ↔ analytics.js gap** — 7 events fired in code but absent from METRICS.md: `assessment_completed`, `challenge_completed`, `evaluate_configuration_clicked`, `rag_lab_opened`, `scenario_solve_shared`, `search_performed`, `tab_navigated`. Also 24 events documented in METRICS.md that are not tracked in App.jsx (including `home_viewed`, `start_here_clicked`, `module_completed`, `post_opened`). METRICS.md is significantly out of sync. | `METRICS.md`, `App.jsx` | Medium | ⚠️ Open |
| 5 | **3 thin GT posts** — indexed and visible but very few content blocks: `dpo-in-practice` (4 blocks), `llm-observability` (5 blocks), `instruction-tuning-datasets` (5 blocks). These feel like stubs in a full-depth post list. | `groundTruthPosts.js` | Low | ⚠️ Open |
| 6 | **174/192 GT posts have no `date` field** — date field present on only 18 posts. Affects RSS quality, any "recently added" sort, and future date-filtering features. | `groundTruthIndex.js` | Low | ⚠️ Open |
| 7 | **README feedback form is a dead placeholder** — `https://forms.gle/REPLACE_ME` links to nothing. Anyone clicking "Give feedback" in the README hits a broken URL. | `README.md` | Medium | ⚠️ Open — needs real form URL |
| 8 | **All key files pass brace balance** — App.jsx, Home.jsx, groundTruthPosts.js, PrepLab.jsx, Agents.jsx, Explore.jsx all balanced | Multiple | — | ✅ Clean |
| 9 | **console.log is clean** — 1 in `main.jsx` (service worker registration, expected); 1 inside a code snippet string in `modules.jsx` (not executed). No debug logs in app logic. | `src/` | — | ✅ Clean |
| 10 | **No unused imports detected** — all named imports in key components are referenced at least once | Multiple | — | ✅ Clean |
| 11 | **No `<img>` tags missing `alt=`** — accessibility baseline for images is clean | Multiple | — | ✅ Clean |

### PrepLab topic counts (full breakdown)

```
  4  attention · quantization · serving · caching · context · design
  4  transformers · streaming · merging · constrained · sysdesign
  5  product · reasoning
  6  behavioral
  9  multimodal · inference
 10  alignment
 11  evaluation · safety
 12  finetuning
 18  rag
 25  llmops
 26  agents
────
191  total
```

### Analytics event gaps (events fired in code, absent from METRICS.md)

`assessment_completed`, `challenge_completed`, `evaluate_configuration_clicked`, `rag_lab_opened`, `scenario_solve_shared`, `search_performed`, `tab_navigated`

### Events documented in METRICS.md but NOT fired in code

`home_viewed`, `start_here_clicked`, `module_completed`, `post_opened`, `search_query`, `assessment_finished`, `path_started`, `preplab_spaced`, `tab_viewed` (and ~15 more)

### Priority actions from this audit

**Finding 2 (RSS)** — high user-facing impact: regenerate `rss.xml` using all 192 GT index entries sorted by date or file order, capped at 20 most recent. One Python script.

**Finding 7 (placeholder link)** — easy visibility fix: either remove the feedback section from README or replace with a real URL.

**Finding 3 (PrepLab skew)** — add 4–8 questions each for `attention`, `transformers`, `context`, `serving` — all foundational topics that interview candidates are asked about.

**Finding 4 (METRICS.md)** — sync METRICS.md to match what App.jsx actually fires. Low effort, high value for future analytics interpretation.

---

## Audit 18 — Format Consistency + Spine Sync + Structural Findings

**Date:** May 2026
**Scope:** `groundTruthIndex.js` format consistency, `DECISIONS.md` staleness, `CLAUDE.md` accuracy, lazy loading, fidelity badge coverage, true orphan count
**Method:** python3 multi-pattern grep catching both single-line and multi-line post formats. Corrects Audit 16 findings.
**Status:** 3 spine fixes applied. Findings documented.

### Audit 16 correction — GT post count and orphan list

Audit 16 used `{ id: "` to count GT posts, missing 8 posts formatted as multi-line objects. **True counts:**

| Metric | Audit 16 claimed | Audit 18 corrected |
|---|---|---|
| GT posts indexed | 192 | **200** (192 single-line + 8 multi-line) |
| Orphaned posts | 10 | **2** (`prompt-cost-engineering`, `rlhf-dpo-explained-v2`) |
| GT stat claim | "190+" | **"200+"** — updated in README, Home.jsx, index.html |

The 8 multi-line entries are: `finetune-playbook`, `rlhf-production`, `dpo-vs-ppo`, `knowledge-distillation`, `build-voice-ai`, `build-document-intelligence`, `build-coding-assistant`, `building-reliable-agents`. They are fully indexed — they were just formatted across multiple lines.

### New findings

| # | Finding | File(s) | Severity | Status |
|---|---|---|---|---|
| 1 | **DECISIONS.md "Tab structure (13 tabs)"** — listed 13 tabs, missing Learning Paths (the 14th) | `DECISIONS.md` line 73 | Medium | ✅ Fixed — updated to 14 tabs, added Learning Paths to tab list |
| 2 | **DECISIONS.md tab list incomplete** — "Ask (Consultation), PrepLab" listed as last two but Learning Paths exists and is not mentioned | `DECISIONS.md` line 75 | Medium | ✅ Fixed |
| 3 | **CLAUDE.md format note added** — documents the 192 single-line + 8 multi-line split so future AI sessions don't miscount | `CLAUDE.md` | Low | ✅ Fixed |
| 4 | **2 true orphaned posts** — `prompt-cost-engineering` and `rlhf-dpo-explained-v2` have full content in `groundTruthPosts.js` but no index entry | `groundTruthIndex.js` | Medium | ⚠️ Open |
| 5 | **8 multi-line formatted posts** — formatting inconsistency vs. the 192 single-line posts. Any grep/script using `{ id: "` as the pattern will undercount by 8. Scripts should use both `\{ id:` and `^\s+id:` patterns. | `groundTruthIndex.js` | Low | ⚠️ Open — cosmetic; no user impact |
| 6 | **All 14 tab components are lazy-loaded** — `React.lazy` applied to all 14 | `App.jsx` | — | ✅ Clean |
| 7 | **Fidelity badges present in Concepts + Explore** — "faithful/Simplified/Conceptual" labels appear throughout both files | `Concepts.jsx`, `Explore.jsx` | — | ✅ Clean |
| 8 | **All labModuleId values are valid** — 29 cross-links from GT posts to module IDs; all resolve to real modules | `groundTruthIndex.js` | — | ✅ Clean |
| 9 | **Learning Paths all valid** — 6 paths, 7–9 steps each, all tab references point to real tabs | `LearningPaths.jsx` | — | ✅ Clean |
| 10 | **DECISIONS.md references "140+ GT posts"** (line 77) — stale; now 200 | `DECISIONS.md` | Low | ⚠️ Open |
| 11 | **stale MLCiCd.jsx / IndiaScale.jsx / InferenceOptimizer.jsx files referenced by HowTo grep** — these appear to be extracted files no longer in the main src/ module system. Presence unclear. | `src/` | Low | ⚠️ Open — investigate if orphaned |

### Verified clean areas (this session)

- No `React.useState` violations
- No duplicate GT IDs  
- No broken `labLink` tab references
- No broken `labModuleId` module references
- No missing `alt=` on `<img>` tags
- All 14 tab components lazy-loaded
- All key files brace-balanced

---

## Audit 19 — SEO/PWA/Sitemap + Category Filter + Orphaned Files

**Date:** May 2026
**Scope:** `public/sitemap.xml`, `public/manifest.json`, `src/GroundTruth.jsx` CATEGORIES filter, orphaned JSX files, GT tag coverage
**Method:** grep + python3 + file inspection. No manual reading.
**Status:** Findings documented. No fixes applied — all require deliberate decisions.

### Findings

| # | Finding | File | Severity | Status |
|---|---|---|---|---|
| 1 | **Sitemap has 45 dead URLs on old domain** — `sitemap.xml` mixes 97 URLs on the live domain (`genai-systems-lab-ivory.vercel.app`) with 45 URLs on `genai-systems-lab.vercel.app/post/...` — a previous domain using `/post/` path routing that no longer works. These 45 entries are dead links crawled by Google, potentially splitting PageRank and generating 404s. | `public/sitemap.xml` | High | ⚠️ Open — remove or redirect the 45 old-domain entries |
| 2 | **`production-mlops` category missing from CATEGORIES filter** — 5 posts use `category: "production-mlops"` (`ft-dpo-vs-grpo`, `ft-quantization`, `ft-governance`, `ft-multimodal-rag`, `ft-case-study`) but this category has no entry in the `CATEGORIES` array in `GroundTruth.jsx`. Users cannot filter to these posts; the category badge shows the raw id instead of a readable label. | `GroundTruth.jsx` line 691 | Medium | ⚠️ Open — add `{ id: "production-mlops", label: "Production MLOps" }` to CATEGORIES |
| 3 | **PWA manifest icons claim wrong dimensions** — `manifest.json` lists `/og-image.png` at sizes `512x512` and `192x192` but the file is actually `1200×630` (landscape OG image). Browsers will scale a non-square 1200×630 PNG to square icon sizes, producing a distorted/cropped icon on PWA installs (Add to Home Screen). | `public/manifest.json` | Medium | ⚠️ Open — create a proper square icon (512×512 + 192×192) and update manifest |
| 4 | **MLCiCd.jsx, IndiaScale.jsx, InferenceOptimizer.jsx, ModelRouter.jsx are active files** — all 4 have 2+ references each in App.jsx/Systems.jsx. Audit 18 suspicion was wrong — they are NOT orphaned. | `src/` | — | ✅ Clean (suspicion cleared) |
| 5 | **All 200 GT posts have `tags[]` arrays** — tag coverage is complete | `groundTruthIndex.js` | — | ✅ Clean |
| 6 | **Sitemap coverage gap** — 200 GT posts indexed; sitemap has only 97 GT post URLs on the correct domain. ~103 posts are not in the sitemap (including all recent `persp-*`, `data-flywheel`, `frontier`, `training-stack`, `how-i-build` posts). | `public/sitemap.xml` | Medium | ⚠️ Open — regenerate sitemap from groundTruthIndex.js |

### Sitemap breakdown

| Domain | Count | Status |
|---|---|---|
| `genai-systems-lab-ivory.vercel.app` (live) | 97 | Active — but incomplete (103 posts missing) |
| `genai-systems-lab.vercel.app/post/...` (old) | 45 | Dead — old URL structure, 404s |

### Priority actions

**Finding 1+6 (sitemap)** — regenerate `sitemap.xml` from `groundTruthIndex.js`: one Python script outputs all 200 posts as `/#groundtruth/{id}` URLs on the correct domain only. Drop the 45 old `/post/` entries. This is a single-file replace.

**Finding 2 (`production-mlops` filter)** — one-liner: add `{ id: "production-mlops", label: "Production MLOps" }` to the CATEGORIES array in `GroundTruth.jsx` around line 719.

**Finding 3 (PWA icon)** — generate a 512×512 square icon from the project's visual identity (black bg, cyan text) using PIL. Update manifest to reference it.

---

## Audit 20 — First-Time User Audit

**Date:** May 2026
**Scope:** Full cold walk-through of the product — Home page, nav, module structure, module endings, content discoverability
**Method:** Source-read audit simulating a first-time incognito visitor: no localStorage state, no prior context, reading exactly what the product renders in sequence.
**Status:** Findings documented. Most are product/architecture decisions, not code bugs. Cross-referenced against CLAUDE.md Structural Upgrade plan.

---

### Walk-through sequence

**Landing → Hero**
Strong. "AI systems break in production. Learn exactly why." Clear. Two CTAs are well-differentiated (engineers → RAG Lab, learners → Concepts). Trust badge is clean. This is the best surface on the product.

**Hero → Start Here strip**
Good concept. 7-step horizontal journey is visible immediately. Problem: it reads as decorative. The tabs are small, the text is tiny, the "Begin →" button lives on the right. A first-timer may not realize this is the entry ramp, not just a progress display.

**Continuing to scroll: what a first-timer sees in sequence**
1. Stats (3,400+ learners, 200+ GT posts, 200+ challenges) — skimmable, fine
2. 5 failure patterns strip (clickable pills → lab) — good
3. Social proof (3 testimonials) — good
4. **Daily tip block** — inserted mid-page, before Learning Paths. Breaks the scroll flow. Tips are high quality but the position kills momentum right before the most useful navigation section.
5. Learning Paths — 4 path cards. This is the real second CTA but it's buried ~4 scrolls down.
6. Module Map — LEARN/BUILD/GROW cards with "After this" outcomes. Excellent content, invisible to most users.
7. Concept Graph — interactive dependency graph. Excellent mechanics, practically invisible (below the fold by 8+ scrolls).

**The nav — 15 items, two rows**
First-time visitor sees: Home | LEARN: Concepts / Diagrams / Ground Truth / Ask | BUILD: RAG Lab ★ / Agents / Playground / Explore / Systems | GROW: Paths / Drills / Prep Lab / Career / AI Product | My Progress

Critical label problems:
- "Diagrams" — doesn't convey it's animated pipeline flows
- "Ground Truth" — opaque jargon to a first-timer. Feels like a test category, not a 200-post knowledge base
- "Ask" — suggests a chatbot, not keyword search over GT posts
- "Drills" — drills for what? Topic unclear
- "Explore" — ambiguous; everything on the site is "explore"
- "Paths" is a nav tab AND there's a "Choose Your Path" section on Home. Duplication without clear hierarchy.

**Opening any module tab — Systems as example**
A first-timer clicks "Systems" and sees a grid of 50 modules with no entry signal. No "start here" marker, no recommended first module, no difficulty sequencing visible. A user who doesn't scroll all the way to the Module Map on Home (where each tab's "discovery" tip lives) has no orientation inside any tab.

**Module ending — any module**
Consistent across all tabs: module ends, user is returned to the grid. No ✓ done state. No "next recommended" CTA. No "now go do this PrepLab question." The module just... ends. For a first-timer who followed a path, this is a dropout event.

**"Consult / Ask" tab**
IS visible in nav (under LEARN group as "Ask"). But a first-timer clicking "Ask" sees a keyword search box over GT posts. Label says "Ask," mechanic is "search." The mismatch creates a "this isn't what I expected" moment. CLAUDE.md's known issue "consult has no nav entry" is STALE — it IS in the nav. Update CLAUDE.md.

**PrepLab**
Clicking "Prep Lab" from nav opens PrepLab correctly. No cold-start orientation — it immediately shows a question with no context about what topics are available or what the modes are. A first-timer has to figure out by exploration that there are 3 modes (Flashcards, Quiz, Challenge).

**Ground Truth tab**
200 posts on a filter wall. No editorial hierarchy. No "start here," no curated entry sequence. Post quality varies (3 thin posts flagged in Audit 17). For a first-timer, this is the "library with size 10 tags" criticism verbatim.

---

### Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | **Daily tip mid-page breaks home scroll flow** — the tip block interrupts momentum right before the most important navigation section (Learning Paths). Move it to the bottom of the page or sidebar. | Medium | ⚠️ Open |
| 2 | **5+ "where to start" surfaces with no hierarchy** — Start Here strip, Learning Paths section, Paths tab, Module Map, Concept Graph. A first-timer gets no signal which one is canonical. The Start Here strip should be the only CTA above the fold; everything else is discovery for returning users. | High | ⚠️ Open |
| 3 | **Nav labels don't communicate content** — "Diagrams," "Ground Truth," "Ask," "Drills," "Explore" are opaque to first-timers. Each label should answer "what will I be doing here?" | High | ⚠️ Open |
| 4 | **Module tabs have no cold-start orientation** — Systems (50 modules), Agents, Explore — none signal where to start. No recommended first module, no difficulty indicator, no path context. | High | ⚠️ Open |
| 5 | **Module endings are silent — still** — no ✓ done state, no next-step CTA, no PrepLab forward pointer. Dropout event after every module. (Audit 14 C1 — still open.) | High | ⚠️ Open (known) |
| 6 | **"Paths" tab duplicates Home's "Choose Your Path" section** — first-timer doesn't know which is canonical. Paths tab should be merged into Home's path section or deprecated. | Medium | ⚠️ Open |
| 7 | **Ground Truth is a wall — no editorial entry** — 200 posts on a filter grid. First-timer has no signal where to start. Confirms the "GT tab doesn't survive the rebuild" conclusion in CLAUDE.md. | High | ⚠️ Open (architectural) |
| 8 | **"Ask" label ≠ search mechanic** — first-timer clicks "Ask" expecting an AI chatbot, gets a keyword search. Label-mechanic mismatch. Fix label to "Search" or upgrade mechanic to match label. | Medium | ⚠️ Open |
| 9 | **PrepLab has no cold-start mode selection** — opens directly to a question. 3 modes (Flashcards, Quiz, Challenge) are discovered by accident. Needs a mode picker entry screen. | Medium | ⚠️ Open |
| 10 | **CLAUDE.md known issue "consult has no nav entry" is stale** — `consult` IS in the nav as "Ask" under the LEARN group. Known issues list should be updated. | Low | ⚠️ Open (doc debt) |
| 11 | **Module Map and Concept Graph are invisible to most first-timers** — both live below 8+ scrolls on a content-heavy home page. Module Map has the best per-tab orientation copy on the site; almost no one reads it. | Medium | ⚠️ Open |

---

### Summary verdict

The hero is excellent. The modules are deep. The product fails in the middle — between the hero click and the first moment of genuine learning. The main failure chain is:

**No landing orientation → nav labels don't guide → module tab opens to a wall → module ends silently → user has no idea what to do next → dropout.**

The structural upgrade documented in CLAUDE.md (three front doors, GT as knowledge layer) addresses most of these findings architecturally. Until that rebuild, the highest-ROI fixes are:
1. Move daily tip to page bottom
2. Add a "Start here: [Module Name] →" recommendation to each tab's header (one line, no rebuild required)
3. Add a minimal done state + one next-step CTA to each module ending
4. Rename "Diagrams" → "Flows", "Ask" → "Search" (or upgrade the mechanic)
5. Update CLAUDE.md known issues to remove stale consult entry

---

## How to Use This File

**Starting an audit session:**
1. Pick an audit type from the reference table
2. Read existing open findings first — don't re-discover known issues
3. Add new findings with status ⚠️ Open
4. When a finding is resolved, mark it ✅ and note what was done

**After a build sprint:**
- Check Audits 4 (content integrity), 7 (visual consistency), 13 (BUILD) for anything the new code may have introduced
- If 5+ modules were added, run a PrepLab Coverage pass (Audit 3)

**Promoting findings:**
- If a finding implies a buildable feature → add to IDEAS.md Tier 1 or 2
- Keep AUDITS.md as the diagnostic record; IDEAS.md as the build backlog
- DECISIONS.md captures architectural rules that emerged from audit findings

**Audit types still never run:**
- MVP / Weight audit — which tabs earn their place?
- IP / Moat audit — what's hard to replicate, what's original?
- First-time user audit — cold walk-through in incognito, every confusion point noted live
- Mobile UX audit — systematic pass on small screens

---

## Audit 21 — Build Sprint Review (May 2026)

**Type:** Post-build integrity check
**Date:** May 2026
**Scope:** All changes made in the May 2026 build sprint

### What was built

| Item | Type | Status |
|---|---|---|
| Cosine Similarity Explorer | Explore module | ✅ Shipped |
| EvalMetrics expansion (RAGAS, LLM-as-Judge, hallucination) | Systems module | ✅ Shipped |
| Long Context Patterns | Systems module | ✅ Shipped |
| Model Architecture Comparison | Explore module | ✅ Shipped |
| Hardware Reference | Explore module | ✅ Shipped |
| Type A vs Type B AI Engineers | GT post | ✅ Shipped |
| What Actually Happens During Pretraining | GT post | ✅ Shipped |
| Why Your RAG System Lies | GT post | ✅ Shipped |
| 41 PrepLab questions (product/reasoning/cosine/longctx clusters) | PrepLab | ✅ Shipped |
| related[] arrays injected into 136 GT posts | groundTruthIndex.js | ✅ Shipped |
| D1: Quiz CTA on GT post headers | GroundTruth.jsx | ✅ Shipped |
| D2: PrepLab readMore → specific GT posts via postId | PrepLab.jsx + App.jsx | ✅ Shipped |
| F2: Salary Calculator surfaced on Home career door | Home.jsx | ✅ Shipped |
| Sitemap + RSS regenerated | public/ | ✅ Shipped |
| "Ask" → "Search" nav label | App.jsx | ✅ Shipped |

### Scale after sprint

- GT posts: 205 (was 200)
- Explore modules: 22 (was 19)
- Systems modules: 51 (was 50)
- PrepLab questions: 231 (was ~190)

### Open findings from this sprint

| # | Finding | File | Status |
|---|---|---|---|
| 1 | PrepLab question count in Home.jsx door copy set to "220+" — actual count is 231. Minor over/under-count, acceptable. | Home.jsx | ⚠️ Minor — update next time counts are touched |
| 2 | Prompt Injection Defense Systems module not yet built — remains Tier 1 | — | ⚠️ Open backlog |
| 3 | Tokenizer Comparison Explore module not yet built — remains Tier 1 | — | ⚠️ Open backlog |
| 4 | `consult` tab still missing from SHORTCUT_TABS | App.jsx | ⚠️ Open (low priority) |

**Status:** Sprint complete ✅

