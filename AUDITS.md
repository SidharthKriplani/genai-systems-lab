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
