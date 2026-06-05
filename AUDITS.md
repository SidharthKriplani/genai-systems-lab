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
| **Instructional Coverage** | Does every interactive component have guiding text at the right moments? See detail below. | After every major build sprint |
| **GT Post Interlinking** | Do GT posts have embedded links, cross-post redirects, and lab pointers where relevant? See detail below. | Monthly |

---

### Audit Type Detail — Instructional Coverage

**What this audit checks:**

Every interactive component in the product should give the user three things in sequence: (1) context before they touch anything, (2) signal during the interaction at the moment it matters, and (3) a closing frame after they finish. This is the 3-beat standard established in sprint 18.

**Beat 1 — Setup framing (before interaction)**
- Is there a short block above the interactive area that tells the user what they're about to configure, why it matters in production, and what failure they're about to reproduce?
- This should be present on: every RAG Lab scenario, every Agent Lab module, every LLM Lab module, every Eval Lab module, every Systems module, every Concepts module, every Explore module.
- Format: a small framed block (indigo/amber/green tinted background depending on lab), short label in monospace uppercase, 1–2 sentences. Second sentence hidden on mobile (`hidden sm:block`).
- Flag: missing entirely, or present but reads as a tooltip/instruction rather than context.

**Beat 2 — Inline callout (during interaction)**
- At the key decision point — the moment a slider crosses a threshold, a config triggers a failure, a wrong answer is submitted — does something surface to explain what just happened and why it matters?
- This should be present on: failure-triggering config inputs (RAG Lab eval thresholds, Agent Lab trigger conditions, LLM Lab temperature extremes), wrong-answer reveals in PrepLab, score reveals in simulator/design modules.
- Format: a reactive callout (not always-visible) that appears conditionally — on failure, on threshold crossing, on wrong answer.
- Flag: nothing surfaces when a failure is triggered; wrong answer just turns red with no explanation.

**Beat 3 — Synthesis close (after completion)**
- After the user finishes — completes all configs, hits the score screen, reaches the done state — is there a closing frame that names what they just learned and where to go next?
- This should be present on: all RAG Lab scenario completions, all simulator/design/challenge score screens, all Concepts modules, all Systems modules.
- Format: a ✓ done card with a named lesson ("You just reproduced X failure. Here's why it happens in production.") + one forward pointer (GT post or PrepLab question cluster).
- Flag: module ends with nothing; done card exists but has no named lesson; forward pointer is generic ("go to PrepLab") rather than specific.

**How to run this audit:**
1. Open each lab tab in turn (RAG Lab, Agent Lab, LLM Lab, Eval Lab, Systems, Concepts, Explore).
2. For each module: check Beat 1 (scroll to top, is there framing?), Beat 2 (trigger the failure/interaction, does anything surface?), Beat 3 (reach the end state, is there a close?).
3. Score each module: ✓ (all 3 beats present), ⚠️ (1–2 beats missing), ✗ (no beats present).
4. Prioritise ✗ modules first, then ⚠️. Log findings by beat number and module ID.

---

### Audit Type Detail — GT Post Interlinking

**What this audit checks:**

Every Ground Truth post should function as a node in a knowledge graph, not an isolated document. A user who finishes reading a post should always have at least one clearly signposted next step. This audit verifies that every post has the right outbound links at the right moments in the text.

**Category 1 — Related posts (horizontal links)**
- Does the post have a `related[]` array in `groundTruthIndex.js` with 2–4 curated sibling posts?
- Are the related posts genuinely relevant (same topic cluster or natural reading sequence), not just same-category filler?
- Flag: `related: []` empty array; `related` field missing entirely; related posts are irrelevant (e.g. a post about RAG chunking linking to a post about RLHF).

**Category 2 — Lab module forward pointer (`labLink`)**
- Does the post have a `labLink` + `labModuleId` in `groundTruthIndex.js` pointing to the most relevant interactive module?
- The pointer should go to the module that lets the user *do* what the post just explained. A post about RAG retrieval failure → RAG Lab. A post about agent memory → Agent Lab memarch module.
- Flag: `labLink` missing on posts that have a clearly relevant module; `labLink` present but points to a wrong or generic module (e.g. Systems generic entry instead of a specific module).
- Exceptions: perspective posts (`persp-*`) intentionally have no lab link — these are opinion pieces with no direct interactive equivalent.

**Category 3 — Inline embedded links within post body**
- For posts that reference other GT posts by name or concept (e.g. "as covered in our post on context window limits"), is there an inline link (`{ t: "refs" }` block or inline anchor in the text) pointing to that post?
- This is especially important for: foundational posts that downstream posts reference (e.g. "What Is a Transformer" should be linked from every post that assumes transformer knowledge); and series posts that follow a sequence (e.g. RAG chunking → RAG retrieval → RAG evaluation should form a chain).
- Flag: post text says "see our post on X" but no link exists; post assumes prior knowledge that exists elsewhere in the corpus but is never linked.

**Category 4 — PrepLab forward pointer**
- Does the post have a `readMore` link in at least one PrepLab question that references this post's topic?
- This is a reverse check: grep PrepLab.jsx for `postId: "post-id"` references and confirm that the top 50 most-read GT posts (by topic importance, not analytics) have at least one PrepLab question linking to them.
- Flag: high-importance post (RAG, agent memory, evaluation) has zero PrepLab questions pointing to it.

**How to run this audit:**
1. Export all post IDs from `groundTruthIndex.js` (python3, ~5 min).
2. For each post, check: `related[]` non-empty and relevant (Category 1), `labLink` present or intentionally absent (Category 2).
3. For the top 30 highest-importance posts (by topic centrality — RAG, agents, evals, LLMOps), do a manual spot-check of inline linking (Category 3).
4. grep PrepLab.jsx for `postId:` occurrences, map back to post IDs, identify high-importance posts with zero PrepLab references (Category 4).
5. Output: a table of post ID × category × pass/fail. Prioritise Category 2 gaps (missing `labLink`) and Category 1 gaps (empty `related[]`) first — both are one-line fixes per post.

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

- GT posts: 212 (was 200)
- Explore modules: 23 (was 19)
- Systems modules: 54 (was 50)
- PrepLab questions: 244 (was ~190)

### Open findings from this sprint

| # | Finding | File | Status |
|---|---|---|---|
| 1 | PrepLab question count in Home.jsx door copy set to "220+" — actual count is 231. Minor over/under-count, acceptable. | Home.jsx | ⚠️ Minor — update next time counts are touched |
| 2 | Prompt Injection Defense Systems module | systems/modules.jsx + Systems.jsx | ✅ Shipped |
| 3 | Tokenizer Comparison Explore module | Explore.jsx | ✅ Shipped |
| 4 | `consult` tab still missing from SHORTCUT_TABS | App.jsx | ⚠️ Open (low priority) |

**Status:** Sprint complete ✅

---

## Audit 22 — Build Sprint Review (May 2026, Session 2)

**Type:** Post-build integrity check
**Date:** May 2026
**Scope:** Second build sprint — nav polish, bug fixes, mobile UX

### What was built

| Item | Type | Status |
|---|---|---|
| HowTo import fix in systems/modules.jsx | Bug fix | ✅ Shipped |
| Duplicate JUDGE_SCENARIOS → LLM_JUDGE_SCENARIOS rename | Build fix (Vercel) | ✅ Shipped |
| NAV_GROUPS sidebar counts corrected (all 10 entries) | UX fix | ✅ Shipped |
| Systems left panel: group filter pills (All/DESIGN/BUILD/OPS) | UX | ✅ Shipped |
| Explore left panel: search input | UX | ✅ Shipped |
| Mobile bottom nav bar (LEARN/BUILD/GROW) with slide-up tray | Feature | ✅ Shipped |
| Mobile bottom nav polish — icons, pill highlights, 2-column grid tray, accent line, frosted glass | UX | ✅ Shipped |

### Scale after sprint

- GT posts: 212 (unchanged)
- Explore modules: 23 (unchanged)
- Systems modules: 54 (unchanged)
- PrepLab questions: 244 (unchanged)

### Open findings from this sprint

| # | Finding | File | Status |
|---|---|---|---|
| 1 | PrepLab question count in Home.jsx door copy likely stale ("220+") | Home.jsx | ⚠️ Minor — fix when counts next touched |
| 2 | `consult` tab still missing from SHORTCUT_TABS | App.jsx | ⚠️ Low priority — known |
| 3 | Prompt Injection Defense, Agent Memory, Long Context, Tokenizer Comparison have zero PrepLab questions | PrepLab.jsx | ⚠️ Open — ~15 questions needed |
| 4 | Explore flat list at 23 modules — no group structure | Explore.jsx | ⚠️ Open — Tier 2 fix |

**Status:** Sprint complete ✅


---

## Audit 23 — Build Sprint Review (May 2026, Session 3)

**Type:** Post-build integrity check
**Date:** May 2026
**Scope:** Third build sprint — content expansion, positioning, learning paths

### What was built

| Item | Type | Status |
|---|---|---|
| MCP vs API vs Function Calling Systems module | Systems module | ✅ Shipped |
| A/B Testing for AI Systems module | Systems module | ✅ Shipped |
| PrepLab gap fill: Prompt Injection, Agent Memory, Long Context, Tokenizer (15 Qs) | PrepLab | ✅ Shipped |
| GT post: A/B Testing for AI Systems | GT post | ✅ Shipped |
| GT post: Graceful Degradation in AI Systems | GT post | ✅ Shipped |
| GT post: Monitoring That Predicts | GT post | ✅ Shipped |
| GT post: The N×M Problem and How MCP Solves It | GT post | ✅ Shipped |
| Home.jsx Layer 3 positioning badge | Home.jsx | ✅ Shipped |
| Home.jsx PrepLab door count updated (220+ → 259+) | Home.jsx | ✅ Shipped |
| DE → AI Engineer learning path (10 steps) | LearningPaths.jsx | ✅ Shipped |
| CLAUDE.md / IDEAS.md / AUDITS.md / LINEAGE.md updated | MD files | ✅ Shipped |

### Scale after sprint

- GT posts: 216 (was 212)
- Explore modules: 23 (unchanged)
- Systems modules: 56 (was 54)
- PrepLab questions: 259 (was 244)

### Open findings from this sprint

| # | Finding | File | Status |
|---|---|---|---|
| 1 | `consult` tab still missing from SHORTCUT_TABS | App.jsx | ⚠️ Low priority — known |
| 2 | Explore flat list at 23 modules — no group structure | Explore.jsx | ⚠️ Open — Tier 2 fix |
| 3 | Ask/Search tab relies on keyword search — needs embedding upgrade to serve as knowledge gateway | Consultation.jsx | ⚠️ Open — Tier 1 architectural item |

**Status:** Sprint complete ✅

---

## Audit 24 — Build Sprint Review (May 2026, Session 4)

**Type:** Post-build integrity check
**Date:** May 2026
**Scope:** Fourth build sprint — content depth, UI polish, eval tooling

### What was built

| Item | Type | Status |
|---|---|---|
| Concepts tab sidebar layout (FOUNDATION/APPLICATION/PRACTICE) | UX refactor | ✅ Shipped |
| GT post: How Data Scientist Became AI Engineer | GT post | ✅ Shipped |
| GT post: The Forward Deployed Engineer | GT post | ✅ Shipped |
| GT post: Prompt Regression Testing | GT post | ✅ Shipped |
| GT post: The Agent Memory Layer (CLAUDE.md as architecture) | GT post | ✅ Shipped |
| GT post: Deterministic Guardrails — Hooks vs LLM Safety | GT post | ✅ Shipped |
| GT post: Context Isolation in Multi-Agent Systems | GT post | ✅ Shipped |
| Query Refinement Lab Systems module | Systems module | ✅ Shipped |
| Prompt Change Management Systems module | Systems module | ✅ Shipped |
| AI Safety Engineering Systems module | Systems module | ✅ Shipped |
| 14 PrepLab questions (qr, pcm, ase clusters) | PrepLab | ✅ Shipped |
| Explore: DESIGN/BUILD/OPS group structure | UX | ✅ Shipped |
| Evals Lab: Build Your Eval 4-step wizard | Feature | ✅ Shipped |

### Scale after sprint

- GT posts: 222 (was 216)
- Explore modules: 23 (unchanged)
- Systems modules: 59 (was 56)
- PrepLab questions: 273 (was 259)

### Open findings

| # | Finding | File | Status |
|---|---|---|---|
| 1 | `consult` tab still missing from SHORTCUT_TABS | App.jsx | ⚠️ Low priority — known |
| 2 | Concepts tab gaps: KV Cache, Training Signal Math, Positional Encoding, LoRA | Concepts.jsx | ⚠️ Tier 1 additions |
| 3 | Ask/Search tab relies on keyword search — needs embedding upgrade for knowledge gateway role | Consultation.jsx | ⚠️ Open — architectural |

**Status:** Sprint complete ✅

---

## Audit 25 — Build Sprint Review (May 2026, Session 5)

**Type:** Post-build integrity check
**Date:** May 2026
**Scope:** Tier 1–3 sprint — bug fixes, LLM Lab thinning, PARKED.md, Tier 2 decision engines, Tier 3 content migrations

### What was built

| Item | Type | Status |
|---|---|---|
| PrepLab text grading — keyword auto-grade replaced with self-assess UI | Bug fix | ✅ Shipped |
| `consult` added to SHORTCUT_TABS | Fix | ✅ Shipped |
| LLM Lab slimmed: 39 → 9 simulators (removed reference-only modules) | Product | ✅ Shipped |
| PARKED.md created — documents deferred modules with right-home guidance | Doc | ✅ Shipped |
| ServingInfra rebuilt as full decision engine (hardware → framework/quant/batching) | Systems module | ✅ Shipped |
| AgentConfigLab — 5 failure scenarios with trigger logic, expandable fixes | Agents module | ✅ Shipped |
| ModelMergeExplorer — SLERP/TIES/DARE/Breadcrumbs decision guide | Explore module | ✅ Shipped |
| MultimodalGuide — CLIP/LLaVA/Native arch comparison with use-case accordion | Explore module | ✅ Shipped |
| FlashAttentionConcept — O(n²) vs O(n) VRAM interactive, tiling diagram, growth table | Concepts module | ✅ Shipped |
| StreamingLab — SSE/WS/batch simulator with failure injection + latency breakdown | Playground module | ✅ Shipped |

### Intentional skips (Tier 3)

| Item | Reason |
|---|---|
| `txarch` → Concepts | Existing `transformer` module already covers forward pass. Would be duplication. |
| `compaction` → Concepts | ContextWindowModule partially covers it. Needs multi-turn simulator to add real value — remains in PARKED.md. |

### Scale after sprint

- GT posts: 222 (unchanged)
- Explore modules: 25 (was 23)
- Systems modules: 57 (unchanged — ServingInfra rebuilt, not added)
- Agents modules: 16 (was 15)
- Concepts modules: 15 (was 14)
- Playground modules: 8 (was 7)
- PrepLab questions: 261 (unchanged)

### Open findings

| # | Finding | File | Status |
|---|---|---|---|
| 1 | All brace checks passed for all modified files | All | ✅ Clean |
| 2 | Stat numbers in Home.jsx door copy likely stale ("259+" PrepLab, "216" GT posts) | Home.jsx | ⚠️ Minor — fix next stat sync |
| 3 | PARKED.md lists `compaction` as deferred — no interactive simulator built yet | — | ⚠️ Open |

**Status:** Sprint complete ✅

---

## Audit 26 — MVP / Weight Audit

**Type:** MVP / Weight
**Date:** May 2026
**Scope:** All 15 tabs — does each earn its place?
**Method:** Systematic source-read + count verification. First time this audit type has been run.
**Criteria:** Depth, uniqueness to the lab, fit with core thesis (configure → fail → understand), maintenance cost.

### Tab verdicts

| Tab | Depth | Unique | Fits Thesis | Maintenance | Verdict |
|---|---|---|---|---|---|
| Home | High | Yes | — | Medium | ✅ Core |
| Concepts (15 modules) | Very high | High | Yes | Low | ✅ Core |
| Flows / Diagrams (2,588 lines) | Medium | Medium | **No** — passive | Low | ❌ PARKED |
| RAG Lab | Very high | Very high | **Yes** — flagship | Medium | ✅ Core |
| Agents (16 modules) | High | High | Yes | Medium | ✅ Core |
| Systems (57 modules) | Very high | High | Yes | High | ✅ Core |
| Playground (8 modules) | High | High | Yes | Low | ✅ Core |
| Explore (25 modules) | Mixed | Mixed | Partial | Low | ⚠️ Earns place — needs pruning |
| Ground Truth (222 posts) | Very high | Very high | Partial | High | ✅ Core — format broken |
| Ask / Search | Low | Low | **No** — broken promise | Low | ❌ Identity crisis |
| Fluency / Drills (2,341 lines) | Medium | Low | **No** — passive phrase bank | Low | ❌ PARKED |
| AI Product (AIPM) | High | High | Yes | Medium | ✅ Earns place |
| Career | High | High | Yes | Low | ✅ Earns place |
| PrepLab (261 questions) | High | High | Yes | Medium | ✅ Core |
| Learning Paths | Medium | Medium | Yes | Low | ⚠️ Should be feature not tab |

### Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | **Flows earns no place** — passive animations, anti-thesis of lab mechanic. 2,588 lines. Already in PARKED.md. | High | ⚠️ PARKED |
| 2 | **Fluency earns no place** — phrase bank + drills, no interactive mechanic. 2,341 lines. Already in PARKED.md. | High | ⚠️ PARKED |
| 3 | **Ask/Search identity crisis** — label says "Ask" (chatbot), mechanic is keyword search. Gap between expectation and reality is damaging. Needs LLM upgrade or demotion to search overlay inside GT tab. | High | ⚠️ Open |
| 4 | **Explore has 5+ modules that are reference tables, not interactives** — LLM evolution, benchmark guide, and similar belong as GT posts. The deep interactives (cosine, hardware, tokenizer) justify the tab. Per-module pruning needed. | Medium | ⚠️ Open |
| 5 | **Learning Paths is a tab when it should be the spine** — 6 curated paths are valuable but require navigating to a separate tab to find them. Should be surfaced on Home as the primary second CTA. | Medium | ⚠️ Open |
| 6 | **Systems at 57 modules needs a "start here" signal** — DESIGN/BUILD/OPS grouping + search help, but no recommended first module per group. A first-timer opening Systems sees 57 undifferentiated cards. | Medium | ⚠️ Open |
| 7 | **Module endings are silent across all tabs** — every module in Systems (57), Explore (25), Concepts (15), Playground (8) ends with nothing. No ✓ done, no next-step CTA, no PrepLab forward pointer. Highest-dropout moment in the product. Flagged in Audit 14 C1 and Audit 20 Finding 5. Still open. | **Critical** | ⚠️ Open |

### Summary

3 tabs don't earn their place: Flows, Fluency, Ask/Search (in current form). These are ~5,500 lines of code that don't reinforce the product thesis. The product's identity is strongest where it's interactive — RAG Lab, Systems, Agents, Concepts, Playground. Everything else is support infrastructure.

---

## Audit 27 — IP / Moat Audit

**Type:** IP / Moat
**Date:** May 2026
**Scope:** What's hard to replicate? What's original? What deserves doubling down?
**Method:** Systematic assessment of all major content surfaces and interactive modules. First time this audit type has been run.

### Tier 1 Moat — Hard to replicate even with resources

| Asset | Why |
|---|---|
| **RAG Lab failure scenarios** | 5 production failure modes, 6-8 configs each. The UI is replicable in a day; the domain knowledge encoded in failure explanations and pedagogical arc takes months of real production experience. |
| **Ground Truth corpus (222 posts)** | Volume × quality × consistent voice. "Knowledgeable colleague" tone, no hype. A competitor could produce 222 GPT posts in a week — they would not have the same depth. The corpus is also a knowledge graph: cross-linked to modules and PrepLab. |
| **PrepLab × GT × Systems cross-linking** | 261 questions with GT post deep-links, 57 modules with RELATED_GT maps, GT posts with labLink back to modules. No other resource has this web. It's a knowledge graph, not a content library. |
| **Decision engines** — ServingInfra, AgentConfigLab, Query Refinement Lab | Encode domain knowledge as runnable logic. Not tables — functions that map configuration choices to outcomes. The logic took production experience to write; the UI is commodity. |

### Tier 2 Moat — Replicable but requires significant effort

| Asset | Why effort is required |
|---|---|
| PrepLab question bank (261 Qs) | Hand-written, quality-controlled, cross-linked. AI-assisted replication is possible but calibration and cross-linking is labor-intensive. |
| Flash Attention memory viz | Well-executed, pedagogically integrated. Others exist but not with fidelity labeling and the learning flow context. |
| India AI salary data in Career | Specific, localized, not easily scraped from public sources. |

### No moat — easily replicated

Reference tables without decision logic. Phrase banks (Fluency). The visual design. The tech stack. Topic explainer GT posts in isolation (the moat is the cross-linking, not the existence of an explainer).

### What deserves doubling down

1. **RAG Lab** — the next 5 failure scenarios are higher ROI than any new tab.
2. **GT corpus** — every post with no `related[]`, no `labLink` is a dead end in the knowledge graph. Completing the graph deepens the moat.
3. **Reference tables → decision engines** — every reference table in Systems/Explore is a missed opportunity. The standard is: configure → logic → outcome → diagnosis.
4. **PrepLab × GT cross-linking** — the questions that link directly to GT posts are more valuable than the ones that don't.

### What to stop building

1. Reference tables that don't become decision engines.
2. Passive content surfaces (Flows, Fluency, and any equivalent).
3. Features that require a backend — the zero-backend constraint is a feature, not a limitation.

### Moat risk

**Primary risk:** A well-resourced competitor (Anthropic Academy, DeepLearning.AI) builds a similar interactive platform with live model APIs. The lab's moat is depth + integration, not technology. The zero-backend version actually works better for learning (no API costs, no rate limits, reproducible failures) — but perception favors live APIs.

**Secondary risk:** GT corpus quality diluted by adding low-depth posts to hit count targets. The 3 thin posts flagged in Audit 17 are early warning signs. Quality bar must stay at "production engineer would trust this."

### Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | **Reference tables without decision logic dilute the moat** — 10-15 modules in Systems and Explore present information without requiring the user to configure anything. Each should become a decision engine or move to GT posts. | High | ⚠️ Open |
| 2 | **Social proof is unconvincing** — 3 unnamed testimonials. The product has a claimed audience of 3,400+ learners. Real, verifiable social proof (LinkedIn screenshots, GitHub star count, named quotes with handles) is a moat amplifier. | High | ⚠️ Open |
| 3 | **3 thin GT posts dilute corpus quality** — `dpo-in-practice` (4 blocks), `llm-observability` (5 blocks), `instruction-tuning-datasets` (5 blocks). Each is a chance for a user to trust the corpus less. | Medium | ⚠️ Open |
| 4 | **Module endings break the learn loop** — same as Audit 26 Finding 7. The RELATED_GT infrastructure and PrepLab cross-links exist. The module endings don't use them. | **Critical** | ⚠️ Open |
| 5 | **Editorial standard is internal and invisible** — "genuinely interactive," "teaches a production failure mode," "no AI hype" is a real quality bar. Making it public differentiates from AI tutorial farms. | Medium | ⚠️ Open (Audit 14 G3) |

### Summary

The moat is real but fragile. RAG Lab + GT corpus + decision engines + PrepLab cross-linking form a genuine knowledge graph that would take 6-12 months to replicate at this depth. But the moat is being diluted by passive surfaces, reference tables without decision logic, silent module endings, and thin GT posts.

**The highest-leverage move is not new content — it's making what exists work harder.** Module endings that forward to PrepLab. GT posts that link back to the exact module. Reference tables that become decision engines.


---

## Audit 28 — Lab Quality Gap Analysis (May 2026)

**Type:** Interactive decision engine standard audit — Agent Lab, Eval Lab, LLM Lab vs RAG Lab benchmark
**Scope:** All 43 modules across the three non-RAG labs. Every module assessed for: configure→outcome logic, failure arc, system design lesson, forward pointer.
**Benchmark:** RAG Lab scenario loop — user sets config → code derives outcome → named failure mode triggered → root cause explanation → system design lesson → forward pointer to PrepLab + GT post.

---

### Agent Lab — 16 modules

**True decision engines (3/16):**
- `agentcfg` — best in lab. Configure task type, context budget, tool count, retry limit, memory type → `deriveAgentFailure()` computes first matching failure trigger → named failure + step-by-step breakdown + fix list. Matches RAG Lab standard almost exactly. **Missing:** forward pointer to PrepLab, missing from AGENTS_RELATED_GT entirely.
- `simulator` — 8 scenarios, user answers a 3-option quiz at each trace step, score accumulated, explanations revealed. Strong "configure thinking → see consequence" loop. **Missing:** PrepLab forward pointer at results screen.
- `design` — 3 challenge scenarios, user picks tool/memory/guardrail options, gets per-option feedback + score. **Missing:** PrepLab forward pointer at results screen.

**Reference content (13/16):**
- `react` — static 7-step trace, click to expand each step. No config input.
- `tools` — schema toggle + pattern selector. Binary toggle, no consequence logic.
- `memory` — taxonomy browser. Click type → see specs. No decision engine.
- `memarch` — reference tabs + a 3-question wizard → recommendation. Wizard produces label, not failure demonstration.
- `multiagent` — click to select pattern → see description. No failure.
- `failures` — click to select failure mode → see description. **Critical gap:** a failure catalog that doesn't let you trigger the failures is exactly DECISIONS.md Section 4's anti-pattern. Should be rebuilt as configure→trigger→diagnose.
- `planning` — pattern selector, description only.
- `reliability` — reference catalog across 4 tabs. Checklist is Unicode characters, not interactive.
- `computeruse` — reference tabs, click-to-expand.
- `longrunning` — reference + static decision text (5 if→then rules as plain text).
- `frameworks` — reference tabs + scored decision wizard. Wizard ranks frameworks but doesn't show failure of wrong choice.
- `mcp` — 4-tab reference deep dive. No interactivity.
- `a2a` — reference + count-based decision guide. Simple yes/no count → label, not tied to failure consequences.

**Zero modules in Agent Lab have PrepLab forward pointers.** The AGENTS_RELATED_GT section renders after every module uniformly — it is not module-specific. `agentcfg` has no AGENTS_RELATED_GT entry at all.

---

### LLM Lab — 9 modules

**True decision engines (2/9):**
- `serving` — strongest in LLM Lab. Stack configurator (model size + GPU + RPS + workload) → `deriveServingRecommendation()` → framework recommendation + warnings. Plus pre-written failure scenarios with trigger/symptom/root cause/fix. **Gap:** configurator and failure scenarios are disconnected — pushing params into the danger zone doesn't trigger the failure scenarios inline. Fix: when config is in danger zone, show the matching pre-written failure automatically.
- `inference` — symptom selector (TTFT too high / TPOT too high / throughput collapse) → root cause → ranked technique recommendations with quantified gains. Quantization and batch size tabs have live sliders with derived outcomes. **Gap:** symptoms-first is backwards from the "configure → see break" RAG Lab pattern. No failure shown for wrong batch size choice.

**Interactive calculators without failure arc (5/9):**
- `decoding` — temperature/top-k/top-p sliders → live probability distribution. Strong visualizer. **Missing:** failure scenarios. T=0 on creative task → repetition loop. T=1.8 on code → incoherence. Currently always shows "how it works," never "here's what breaks."
- `kvcache` — 3 tabs: reference + cost calculator + routing reference. Calculator derives VRAM numbers. **Missing:** OOM scenario when config exceeds GPU capacity.
- `specdecoding` — acceptance rate α + draft length K → speedup calculator. Strong math tab. **Missing:** failure when α is low (draft overhead > savings), or when applied to reasoning tasks (high divergence).
- `reasoning` — thinking budget slider → quality/cost/TTFT estimates + use-case matcher. Close to decision engine. **Missing:** failure scenario for "max budget on a summarization task = cost blowup with zero quality gain."
- `moe` — reference tabs + a failure modes tab (5 named failures with fix, pure reference). **Critical gap:** failure modes tab is read-only. User never configures anything to trigger expert collapse or load imbalance.

**Pure reference (2/9):**
- `quantization` — reference table + basic VRAM calculator. Table tab is a static HTML table. Weaker than `inference` on every dimension. **Recommendation:** cut the methods table, redirect users to `inference` for quantization decisions.
- `streaming` — 2 tabs, both static. Pattern cards + static latency waterfall visualization. **Weakest module in LLM Lab.** No configuration, no outcome, no failure.

---

### Eval Lab — 18 modules

**True decision engines (9/18):**
- `evals` — Budget Allocator + LLM-as-Judge Audit + Build Your Eval. Strongest in Eval Lab.
- `shouldai` — 10 scenarios, pick correct approach (LLM/rules/hybrid/don't use AI), reveal + score. Clean.
- `strategy` — 5 scenarios, pick strategy (RAG/fine-tune/prompt/agents), reveal + failure explanations for wrong choices. Strong.
- `canvas` — problem type + constraints → model tier + failure modes to design against + eval approach. Derived outcomes.
- `incidents` — 5 incident archetypes, diagnose root cause from symptoms. Score + mitigation playbook. Good "see failure, diagnose" half of the RAG Lab standard.
- `abtesting` — statistical scenarios, pick correct interpretation. Score tracked.
- `mlcicd` — staged rollout (Shadow→Canary 5%→25%→Full), pre-built metric spikes (latency/error rate), rollback verdict + root cause. **Gap:** pre-built scenarios, user can't set metric values.
- `debug_traces` — trace symptoms → pick root cause → score + explanation. Solid.
- `prompt-change-mgmt` — Lab tab: pick prompt variant → score delta + regression flag + BLOCK MERGE verdict. Cleanest configure→failure→diagnosis loop in Eval Lab. **Gap:** pre-written scenarios only.

**Reference with redemptive selector (5/18):**
- `evalfw` — framework guide + use-case → recommendation. Recommendation pre-written.
- `observability` — 3 tabs: reference + static trace + Metric Diagnosis (user diagnoses anomalous snapshot). Diagnosis tab is the one interactive piece.
- `trapslab` — read scenario, click "Show Issues," see failures revealed. Strong content, reveal-only mechanic.
- `evalmetrics` — table + static samples + reference. Closest to pure reference in "decision" clothing.
- `router` — strongest configure→outcome in Eval Lab (threshold slider + distribution chart + live cost calc). **Gap:** no failure mode when threshold is misconfigured. Sits in Eval Lab but logically belongs adjacent to `serving`.

**Pure reference (4/18):**
- `langsmith` — 4 tabs of expandable reference cards. **Should be:** "trace this broken request, identify the failed span."
- `deploy` — click-expander, no derived outcome. Duplicates `serving` in a worse form. **Recommendation:** cut or redirect to `serving`.
- `buildthis` — structured reading list with phase navigation. No interactive mechanic.
- `abtesting-ai` — selector-driven reference, 3 tabs all reference. Thinner than `abtesting` which sits next to it. Confusing to have both.

---

### Cross-lab findings

**1. The failure arc is the universal missing piece.** Almost every module that has configure→outcome logic stops at "here is the outcome." None of them (except `agentcfg`, `serving`, and `prompt-change-mgmt`) show a named production failure with a root cause when configuration goes wrong. The outcome is always a recommendation or a score — never a breaking system.

**2. The "trigger the failure yourself" half is absent everywhere except `agentcfg`.** RAG Lab's power is that you configure the system into the failure — you caused it. Most modules show you failures in the abstract or let you diagnose pre-broken systems. Only `agentcfg` lets you build a misconfigured agent and watch it fail. This is the experience gap.

**3. Forward pointers are completely absent in Agent Lab and LLM Lab.** Every module ends with no forward momentum. The Systems shell adds a PrepLab button and RELATED_GT section to Eval Lab and Systems modules, but Agent Lab and LLM Lab modules (which are separate components) end silently.

**4. Duplication is diluting quality perception:**
- `quantization` vs `inference` — quantization engineering tab in `inference` is stronger; the standalone `quantization` module is redundant.
- `deploy` vs `serving` — ServingInfra is the decision engine; Deploy is the weaker reference version.
- `abtesting` vs `abtesting-ai` — both cover A/B testing, one is a decision engine, one is reference. Confusing to have both visible.

**5. Agent Lab's `failures` module is the most critical gap.** A failure catalog that lists 5 failure modes but doesn't let you trigger them is the exact DECISIONS.md Section 4 anti-pattern ("a module that presents a comparison table without requiring user input is a reference table, not an interactive"). `agentcfg` already demonstrates the right pattern for this content. The two should be merged: `agentcfg` becomes the complete failure simulator, absorbing the `failures` catalog into its trigger logic.

---

### Findings table

| # | Finding | Lab | Severity | Status |
|---|---|---|---|---|
| 1 | **`failures` module is a reference catalog, not a simulator** — 5 failure modes listed but never triggered by user action. Contradicts DECISIONS.md Section 4 directly. Should be absorbed into `agentcfg`. | Agent | **Critical** | ⚠️ Open |
| 2 | **`agentcfg` missing from AGENTS_RELATED_GT** — strongest module in Agent Lab has no GT reading links | Agent | High | ⚠️ Open |
| 3 | **Zero Agent Lab + LLM Lab modules have PrepLab forward pointers** — 25 modules end silently | Agent + LLM | High | ⚠️ Open |
| 4 | **`streaming` (LLM Lab) is pure reference** — 2 static tabs, no config, no outcome. Weakest module in the lab. Cut or rebuild. | LLM | High | ⚠️ Open |
| 5 | **`moe` failure modes tab is read-only** — named failures with fixes but no interactivity. Expert collapse, load imbalance, router oscillation should be triggerable. | LLM | High | ⚠️ Open |
| 6 | **`serving` configurator and failure scenarios are disconnected** — pushing into danger zone doesn't auto-surface the matching failure. Gap between what exists and what it could be is small. | LLM | Medium | ⚠️ Open |
| 7 | **`decoding` has no failure scenarios** — strong visualizer without the "here's what breaks at T=0 / T=1.8" arc. One addition away from decision engine quality. | LLM | Medium | ⚠️ Open |
| 8 | **`quantization` module is redundant** — weaker than the quantization section inside `inference`. Cut the methods table tab, redirect to `inference`. | LLM | Medium | ⚠️ Open |
| 9 | **`langsmith` is 4 tabs of reference** — should be a "trace this broken request, identify the failed span" exercise. | Eval | High | ⚠️ Open |
| 10 | **`deploy` duplicates `serving` worse** — ServingInfra is the decision engine; Deploy is the weaker reference version. Cut or redirect. | Eval | Medium | ⚠️ Open |
| 11 | **`abtesting-ai` is thinner than `abtesting`** which sits next to it. Two A/B modules creates confusion. Merge or cut. | Eval | Medium | ⚠️ Open |
| 12 | **`buildthis` is a structured reading list** — no interactive mechanic. Not a lab experience. Should be content in GT posts, not a module. | Eval | Medium | ⚠️ Open |

---

### Upgrade priority order

**Tier A — highest ROI, small lift (failure arc added to existing decision engine):**
1. `serving`: auto-surface failure scenario when configurator output is in danger zone
2. `decoding`: add 3 failure scenarios (T=0 repetition, T=1.8 incoherence, top-p=0.01 censorship)
3. `agentcfg`: add AGENTS_RELATED_GT entry + PrepLab forward pointer
4. `simulator` + `design`: add PrepLab forward pointer at results screen

**Tier B — medium lift (convert reference to decision engine):**
5. `failures` → merge into `agentcfg` as additional trigger scenarios, or rebuild as standalone "configure agent → trigger this specific failure"
6. `moe` → add expert utilization simulator: set experts/top-K/batch → see load imbalance bar chart + collapse threshold
7. `langsmith` → rebuild as broken-trace diagnosis exercise (5 pre-built broken traces, user identifies failed span)

**Tier C — cut (free nav space, reduce quality dilution):**
8. `deploy` → redirect to `serving`
9. `abtesting-ai` → merge into `abtesting` or cut
10. `buildthis` → convert to a GT post series ("Build a Production RAG Pipeline"), remove from Eval Lab nav
11. `quantization` → cut the methods table tab, reference `inference` for quantization decisions

---

## Audit 29 — Build Sprint Review (May 2026, Sprint 7)

**Type:** Post-build integrity check
**Date:** May 2026
**Scope:** All Audit 28 Tier A/B/C items — Agent Lab + LLM Lab + Eval Lab module upgrades + nav cuts

### What was built

| Item | Tier | Status |
|---|---|---|
| `simulator` done screen — PrepLab forward pointer card (violet gradient, ✓ badge, GT link) | A | ✅ Shipped |
| `design` done screen — PrepLab forward pointer card + GT "agent-system-design" link | A | ✅ Shipped |
| `serving` failure block — full scenario card (SERVING_FAILURE_SCENARIOS lookup, root cause, fix chips, severity badge) | A | ✅ Shipped |
| `decoding` visualizer — reactive failure callout (3 triggers: T≤0.15 repetition collapse, T≥1.5 incoherence, topP≤0.2 vocabulary starvation) | A | ✅ Shipped |
| `agentcfg` AGENT_FAILURE_MATRIX — 3 new entries from `failures` catalog: cascading_errors, over_delegation, tool_poisoning | B | ✅ Shipped |
| `MoEExpertSimulator` component — numExperts/topK/batchSize config → LCG pseudo-random load → bar chart → collapse/imbalance callout | B | ✅ Shipped |
| `MoEArchitecture` — "sim" tab added, MoEExpertSimulator rendered | B | ✅ Shipped |
| `LangSmithDiagnose` component — 5 broken trace scenarios, span-click inspection, multi-choice root cause, score + reveal | B | ✅ Shipped |
| `LangSmithTracingLab` — "Diagnose Traces" tab added as default view | B | ✅ Shipped |
| `deploy`, `buildthis`, `abtesting-ai` removed from SYSTEMS_MODULES registry | C | ✅ Shipped |
| `QuantizationEngineering` — Methods reference table tab removed, Calculator only | C | ✅ Shipped |

### Brace balance check results

All modified files passed `node -e` brace check (diff: 0) before commit.

### Scale after sprint

- Systems modules in nav: 54 (was 57 — 3 cut: deploy, buildthis, abtesting-ai)
- Agents modules: 16 (unchanged)
- LLM Lab modules: 9 (unchanged — MoE sim added as tab, not new module)
- Eval Lab modules: 15 (was 18 — 3 cut from nav)
- PrepLab questions: 261 (unchanged)
- GT posts: 222 (unchanged)

### Audit 28 findings status update

| Finding | Was | Now |
|---|---|---|
| 1 — `failures` reference catalog | ⚠️ Open | ⚠️ Partial — `agentcfg` expanded with 3 failures from catalog; `failures` module kept as low-priority reference |
| 2 — `agentcfg` missing AGENTS_RELATED_GT | ⚠️ Open | ⚠️ Open — low priority |
| 3 — Zero Agent Lab + LLM Lab PrepLab pointers | ⚠️ Open | ✅ Fixed — `simulator` + `design` done screens added |
| 5 — `moe` failure modes read-only | ⚠️ Open | ✅ Fixed — MoEExpertSimulator added as "sim" tab |
| 6 — `serving` configurator disconnected from failures | ⚠️ Open | ✅ Fixed — failure scenario auto-surfaces from config output |
| 7 — `decoding` no failure scenarios | ⚠️ Open | ✅ Fixed — 3 reactive failure callouts added |
| 8 — `quantization` redundant | ⚠️ Open | ✅ Fixed — methods table cut, Calculator only |
| 9 — `langsmith` pure reference | ⚠️ Open | ✅ Fixed — Diagnose Traces tab is now default |
| 10 — `deploy` duplicates `serving` | ⚠️ Open | ✅ Fixed — removed from nav |
| 11 — `abtesting-ai` thinner than `abtesting` | ⚠️ Open | ✅ Fixed — removed from nav |
| 12 — `buildthis` reading list | ⚠️ Open | ✅ Fixed — removed from nav |

### Still open from Audit 28

| # | Finding | Status |
|---|---|---|
| 2 | `agentcfg` missing from AGENTS_RELATED_GT | ⚠️ Low priority |
| 4 | `streaming` (LLM Lab) pure reference — 2 static tabs | ⚠️ Open |

**Status:** Sprint complete ✅

---

## Audit 30 — Cross-Repo Intelligence Scan (May 2026)

**Type:** Competitive / feature intelligence
**Date:** May 2026
**Scope:** Two sibling repos — `ml-systems-lab` (ML Systems Lab) and `experimentation-systems-lab` (PAL — Product Analytics Lab). What do they have that GenAI Systems Lab doesn't? What's worth adopting?
**Method:** Full README + feature scan of both repos. GenAI Lab feature set cross-referenced against findings.

---

### ML Systems Lab — gap analysis

ML Systems Lab covers infrastructure-layer ML: distributed training, MLOps, model serving at scale, hardware-level optimization. Audience: MLOps engineers, platform engineers, infra-focused ML engineers. Different audience than GenAI Lab (production AI systems + application engineering).

**High-value features to borrow:**

| Feature | Why it matters for GenAI Lab |
|---|---|
| **"Spot the Flaw" mechanic** — present a flawed system design, user identifies the error | A failure-diagnosis mode that GenAI Lab doesn't have. High fit with the configure→fail→understand thesis. Would work in Eval Lab (spot the bad eval design) and Systems (spot the bad RAG config). |
| **Role Readiness Score** — computed from PrepLab performance across categories, expressed as a single "readiness %" per role type | GenAI Lab has JD Prep mode but no persistent readiness signal. A role readiness score surfaced on the PrepLab home screen is a retention mechanic — users return to improve the number. |
| **Weakness Heatmap** — shows which topic clusters have low correct rates, visualized as a grid | GenAI Lab's PrepLab tracks wrong answers in session but has no persistent cross-session weakness view. A topic-level heatmap would turn PrepLab from "quiz" to "gap analyzer." |
| **Defense Doc Generator** — user configures a system, output is a shareable/downloadable design rationale doc | High value for interview prep. After completing an AgentConfigLab or RAG Lab scenario, generate a "here's what I built and why" summary. No backend required — generate as formatted HTML or JSON. |
| **Cross-module Challenges** — multi-step scenarios that span two or more modules (e.g. design the system + eval it + serve it) | GenAI Lab modules are isolated islands. A cross-module challenge would be the first "end to end" experience. High effort, high moat. |

**Low-value / wrong-fit:**

| Feature | Why not |
|---|---|
| Pyodide (browser Python execution) | ML Systems Lab uses this for live code execution. GenAI Lab's zero-backend constraint is intentional — adding a Python runtime breaks the "reproducible failures via precomputed logic" discipline. |
| 5-zone nav structure | ML Systems Lab uses a zoned nav (Infrastructure / Platform / Application / Deployment / Monitoring). GenAI Lab's DESIGN/BUILD/OPS grouping already serves this purpose and is simpler. |
| Infrastructure-depth content (CUDA, distributed training) | Wrong audience. GenAI Lab's audience is application-layer engineers, not MLOps/infra engineers. |

---

### Product Analytics Lab (PAL) — gap analysis

PAL is a browser-based interview prep platform for product analysts and PMs. 17 rooms covering stats, experimentation, RCA, metrics, SQL/Python, product design, behavioral, and A/B foundations. High interactive depth — every room has a runner component with scoring and debrief.

**High-value features to borrow:**

| Feature | Why it matters for GenAI Lab |
|---|---|
| **91-day practice heatmap** — GitHub-style contribution grid, one cell per day, green fill on practice days | Retention mechanic. GenAI Lab has streaks (`gsl-streak`) but no visual history. A 91-day grid on the My Progress page turns usage history into a concrete object users want to fill in. |
| **Verbal Practice mode** — user records an answer, gets back a transcript with gap analysis | PAL uses this for behavioral questions. GenAI Lab could apply it to PrepLab text questions — record your answer to "explain MoE routing," see your transcript, compare to model answer. Web Speech API already available. |
| **Company-specific prep tracks** — "Preparing for Anthropic / Google / OpenAI" bundles curated question sets by likely interview focus | PAL has company case sets. GenAI Lab PrepLab could offer a "company track" mode that filters to the 20 questions most likely to appear at a given company. Pure filtering on existing data — zero new content. |
| **Bookmarks as a first-class feature** — persistent bookmark list surfaced in a dedicated panel, not just a localStorage flag | GenAI Lab has `gsl-bookmarks` but the bookmark list is not prominently surfaced. PAL surfaces it as a panel on the room browser. Bookmarks become a "my study list" mechanic. |
| **DebriefCopyButton** — one-click copy of a debrief/explanation to clipboard | Small but high friction reduction for interview prep. After PrepLab answer reveal, "Copy model answer" button. Users copy it into their notes. Zero backend, one component. |

**Low-value / wrong-fit:**

| Feature | Why not |
|---|---|
| Supabase auth + Stripe (PAL roadmap) | Correct for PAL's paid model, premature for GenAI Lab until the monetization decision is made (DECISIONS.md Section 0). |
| SQL/Python runner rooms | Wrong domain. PAL's SQL/Python content is product analytics. GenAI Lab has no SQL content and shouldn't — scope constraint. |
| Product analytics case studies (Airbnb, DoorDash, Netflix) | Wrong audience. GenAI Lab's audience cares about AI systems, not product analytics case studies. |
| Spaced repetition scheduler | Complexity vs. value ratio is wrong for a static site. localStorage-based spaced repetition is brittle without a backend to validate review timing across sessions. |

---

### Findings table

| # | Finding | Source | Priority | Status |
|---|---|---|---|---|
| 1 | **"Spot the Flaw" mechanic** — present a broken system, user identifies the error | ML Systems Lab | Tier 1 | ⚠️ Open — add to IDEAS.md |
| 2 | **Role Readiness Score** — computed readiness % per role from PrepLab performance | ML Systems Lab + PAL | Tier 1 | ⚠️ Open — add to IDEAS.md |
| 3 | **Weakness Heatmap** — per-topic correct rate grid in PrepLab | ML Systems Lab + PAL | Tier 1 | ⚠️ Open — add to IDEAS.md |
| 4 | **91-day practice heatmap** on My Progress | PAL | Tier 1 | ⚠️ Open — add to IDEAS.md |
| 5 | **Bookmarks panel** surfaced as "my study list" | PAL | Tier 2 | ⚠️ Open — `gsl-bookmarks` key exists, UI needs promotion |
| 6 | **DebriefCopyButton** — copy model answer to clipboard | PAL | Tier 2 | ⚠️ Open — small, high friction reduction |
| 7 | **Defense Doc Generator** — post-module shareable design rationale | ML Systems Lab | Tier 2 | ⚠️ Open — interview prep value |
| 8 | **Company-specific prep tracks** — filter PrepLab by company interview focus | PAL | Tier 2 | ⚠️ Open — zero new content, pure filter |
| 9 | **Cross-module Challenges** — end-to-end scenarios spanning design + eval + serve | ML Systems Lab | Tier 3 | ⚠️ Open — high effort, high moat |
| 10 | **Verbal Practice mode** — record answer, transcript, gap analysis | PAL | Tier 3 | ⚠️ Open — Web Speech API available, high effort |

### What to NOT adopt

Pyodide (wrong architecture), 5-zone nav (redundant), Supabase auth (premature), SQL/Python content (wrong scope), spaced repetition without backend (brittle), company case studies from product analytics domain (wrong audience).

**Status:** Scan complete ✅. All 10 findings logged in IDEAS.md cross-repo cluster.

---

## Audit 31 — Mobile UX Sprint Review (May 2026, Sprint 8)

**Type:** Post-build integrity check + mobile UX reactive fixes
**Date:** May 2026
**Scope:** Three mobile layout/usability bugs identified from live usage on Android (Chrome mobile)

### Issues found and fixed

| # | Issue | File | Fix | Commit |
|---|---|---|---|---|
| 1 | **RAG Lab split layout broken on mobile** — `w-52` sidebar + `flex-1` content side-by-side on ~400px screen; content squished to ~150px and text truncated | `App.jsx` | Outer `flex` → `flex flex-col lg:flex-row`; sidebar `hidden lg:flex`; mobile horizontal scenario scroll strip added above content | `baec2d7` |
| 2 | **Agent Lab / Systems Lab sidebar doesn't close after module selection** — `w-full` sidebar covered full viewport on mobile; clicking a module left sidebar visible with content peeking at ~10% width | `Agents.jsx`, `Systems.jsx` | `mobileSidebarOpen` state (default `true`); `switchModule()` calls `setMobileSidebarOpen(false)`; sidebar conditionally `flex`/`hidden` on mobile; back button `← [Lab Name]` added at top of content panel | `61a2c7b` |
| 3 | **Dark theme unreadable at low phone brightness** — `text-zinc-400` on `bg-zinc-950` yields ~1.5:1 contrast at 30-40% brightness; labels, captions, secondary text effectively invisible | `index.css` | Single `@media (max-width: 1023px)` override: CSS custom properties `--color-zinc-400/500/600/700/800` shifted one stop brighter; Tailwind v4's variable-based utility classes pick up the override globally — zero JSX changes | `6d38c09` |

### Mobile UX audit gap

These were reactive fixes from user-reported issues, not from a systematic mobile audit. A dedicated mobile UX audit pass (Audit 32) should cover:
- All remaining split-panel tabs on mobile (Explore, Concepts if applicable)
- Touch target sizes (minimum 44×44px)
- Horizontal overflow scan
- PrepLab question layout on narrow screens
- GT post reading experience on mobile

**Status:** Sprint complete ✅. Mobile audit (Audit 32) remains open.


---

## Audit 32 — Full Mobile UX Audit (May 2026, Sprint 9)

**Type:** Systematic mobile audit — layout, overflow, readability, touch targets
**Date:** May 2026
**Scope:** All pages and tabs visible on Android Chrome mobile (~390px viewport). Screenshot-triggered by live usage showing horizontal overflow on Home.jsx.
**Method:** Code analysis of all JSX files (Home, App, PrepLab, Agents, Systems, GroundTruth, Explore, Concepts) + screenshot evidence. Each issue classified by severity (Critical / High / Medium / Low).

---

### Findings

| # | Component | Issue | Severity | Status |
|---|---|---|---|---|
| 1 | `Home.jsx` — stats row | `flex gap-8` with `text-5xl` for 3 stats ("3,400+", "222+", "200+") overflows on ~390px screens; white horizontal overflow strip visible in production | **Critical** | ✅ Fixed — `grid grid-cols-3 gap-2 sm:flex sm:gap-16`; `text-5xl` → `text-4xl sm:text-6xl` |
| 2 | `Home.jsx` — journey step strip | `overflow-x-auto scrollbar-hide` gives no visual cue that the strip scrolls right; step labels clipped with no fade | **High** | ✅ Fixed — right-fade gradient overlay (`w-10`, `lg:hidden`) added |
| 3 | `App.jsx` — bottom nav bar (pre-sprint 8) | 3-item fixed bar (`pb-16`) covered content; slide-up tray interaction awkward on small screens | **Critical** | ✅ Fixed in sprint 8 commit `9054f0e` — replaced with PAL-style left drawer |
| 4 | `App.jsx` — RAG Lab split layout (pre-sprint 8) | Sidebar + content both visible at full width on mobile | **Critical** | ✅ Fixed in sprint 8 commit `baec2d7` |
| 5 | `Agents.jsx` / `Systems.jsx` — split panel (pre-sprint 8) | Module sidebar did not close after selection | **Critical** | ✅ Fixed in sprint 8 commit `61a2c7b` |
| 6 | `PrepLab.jsx` — split panel | MODES sidebar + content panel both visible simultaneously on mobile | **Critical** | ✅ Fixed in sprint 9 commit `e73ea58` |
| 7 | `Home.jsx` — live failure demo widget | `grid-cols-2` query/answer layout on ~390px is workable (~185px each) but text-xs at low brightness was illegible | **High** | ✅ Fixed in sprint 8 palette audit — `text-zinc-600/700` → `text-zinc-400/500` |
| 8 | `index.css` — global contrast | `zinc-500/600` on `zinc-950` background fails WCAG AA; unreadable at low phone brightness | **Critical** | ✅ Fixed in sprint 8 (`bea5281`, `6d38c09`) — CSS variable remap + mobile media query |
| 9 | `GroundTruth.jsx` — post reading layout | Long posts on mobile: no systematic audit. `max-w-2xl` prose should be fine but code blocks, tables, and ref blocks need verification | **Medium** | ⚠️ Open — needs spot-check |
| 10 | `Explore.jsx` — module sidebar | Same split-panel pattern as Agents/Systems but Explore tab not yet audited for mobile | **High** | ⚠️ Open — apply `mobileSidebarOpen` pattern if confirmed |
| 11 | `Concepts.jsx` — sidebar layout | Sidebar + content split needs mobile check | **High** | ⚠️ Open — apply `mobileSidebarOpen` pattern if confirmed |
| 12 | `Home.jsx` — concept dependency graph | SVG graph with fixed node positions may overflow or be unreadably small on mobile | **Medium** | ⚠️ Open — check NODE_W/NODE_H at 390px |
| 13 | Touch targets — all interactive elements | Many `text-[9px]`/`text-[10px]` buttons and pill tags may be below 44×44px WCAG touch target minimum | **Medium** | ⚠️ Open — systematic pass needed |
| 14 | `Home.jsx` — door cards (`grid-cols-2`) | 2-col grid at ~390px gives ~185px per card; text-sm content may wrap poorly on some cards | **Low** | ⚠️ Open — acceptable but monitor |
| 15 | `PrepLab.jsx` — question text layout | Long MCQ question text on ~390px; `p-5 sm:p-8` padding correct but some questions may wrap to 6+ lines | **Low** | ⚠️ Open — monitor, no systematic fix needed yet |

---

### Sprint 9 fixes (this audit)

| Fix | File | Description |
|---|---|---|
| Stats row overflow | `Home.jsx` | `flex gap-8` → `grid grid-cols-3 gap-2 sm:flex sm:gap-16`; `text-5xl` → `text-4xl sm:text-6xl` |
| Journey strip clip hint | `Home.jsx` | Right-edge fade gradient overlay (mobile only, `lg:hidden`) signals horizontal scroll |
| PrepLab split panel | `PrepLab.jsx` | `mobileSidebarOpen` pattern (same as Agents/Systems) |

### Still open

Issues 9–15 above. Priority order: Explore sidebar (#10), Concepts sidebar (#11), GT code blocks (#9), concept graph overflow (#12), touch targets (#13).

**Status:** Partial ✅. Critical fixes done. Medium/Low open items logged for Audit 33 or sprint 10.


---

## Audit 33 — Mobile Touch Target & Overflow Pass (May 2026, Sprint 9 continued)

**Type:** Systematic mobile polish — touch targets, overflow hints, Explore split-panel
**Date:** May 2026
**Scope:** All remaining open findings from Audit 32 (#9–15). Fix or close each.

### Findings resolved

| # | Finding | Fix |
|---|---|---|
| 9 | **GT code blocks + table layout on mobile** | Verified — `<pre overflow-x-auto>` and `<div overflow-x-auto>` already present. No change needed. ✅ Closed. |
| 10 | **Explore split-panel on mobile** | `mobileSidebarOpen` pattern applied to `ExploreApp`. Back button `← Explore` added. ✅ Fixed. |
| 11 | **Concepts sidebar hidden on mobile** | Verified — Concepts already has a `sm:hidden` horizontal scroll pill strip as mobile nav. Sidebar hidden + strip shown is the correct pattern. ✅ Closed (no change). |
| 12 | **Concept dependency graph SVG overflow** | `overflow-x-auto` container already present. Added right-fade gradient overlay (`lg:hidden`) to signal scrollability. ✅ Fixed. |
| 13 | **Touch targets below 44×44px** | Systematic pass across all key interactive elements: GT category filter pills `py-1` → `py-2.5`; GT post action buttons `py-1.5` → `py-2.5`; GT reaction buttons `py-1.5` → `py-2.5`; GT quiz/simplify buttons `py-1.5` → `py-2.5`; Home failure pills `py-1.5` → `py-2.5` + `min-h-[44px]`; Explore module sidebar items `py-1.5` → `py-2.5`; Agents module sidebar items `py-1.5` → `py-2.5`; Systems module sidebar items `py-1.5` → `py-2.5`; Concepts mobile strip pills `py-1.5` → `py-2.5`. ✅ Fixed. |
| 14 | **Home door cards `grid-cols-2` on mobile** | Acceptable — 185px per card is workable for this content. ✅ Closed (no change). |
| 15 | **PrepLab question text layout** | Acceptable — `p-5 sm:p-8` padding correct, content wraps gracefully. ✅ Closed (no change). |

### Journey strip and SVG graph fade pattern (new standard)

Any `overflow-x-auto` scrollable container that may clip content on mobile now gets a right-fade gradient overlay (`pointer-events-none`, `lg:hidden`). Applied to: journey step strip, concept dependency graph. Pattern:

```jsx
<div className="relative">
  <div className="overflow-x-auto scrollbar-hide">
    {/* content */}
  </div>
  <div className="absolute right-0 top-0 h-full w-10 pointer-events-none lg:hidden"
    style={{ background: "linear-gradient(to right, transparent, rgba(9,9,11,0.9))" }} />
</div>
```

**Status:** All 15 Audit 32 findings resolved or closed. Mobile audit complete ✅



---

## Audit 34 — Batch 0 Walk 1 Self-Vet Findings (May 2026)

**Type:** Founder self-vet — primary loop walkthrough
**Date:** May 2026
**Scope:** Walk 1 of Batch 0 ROLLOUT.md checklist: Home hero → RAG Lab → done card → GT post → PrepLab Exam mode.
**Method:** Live product walkthrough on desktop by founder. Screenshots reviewed. DevTools console monitored.

### Findings

| # | Component | Finding | Severity | Status |
|---|---|---|---|---|
| 1 | `Home.jsx` — hero badge + headline | "Free · No login · Layer 3 AI skills" — none of the three land. "Free" is table stakes. "No login" is a technical fact, not a benefit. "Layer 3 AI skills" is jargon. Hero headline "AI systems break in production" is generic — doesn't state the actual market claim (production readiness, not model knowledge). | **Critical** | ✅ Fixed sprint 11 — badge removed, new gradient headline "Configure it. Break it. Know exactly why." |
| 2 | `Home.jsx` — hero body copy | "reading about RAG failures" frames the entire product as a RAG tool. Doesn't reflect agent, eval, serving, or observability content. Narrows perceived scope for cold visitors. | **High** | ✅ Fixed sprint 11 — body rewritten: "Production AI systems fail in specific, predictable ways. This lab makes you reproduce those failures — not read about them." |
| 3 | RAG Lab — routing | Door card routes correctly to RAG Lab. | ✅ Pass | Closed |
| 4 | RAG Lab — scenario names | ROLLOUT.md checklist had wrong scenario names ("Retrieval Failure", "Context Overflow", etc.). Actual scenarios: Missing Answer, Ambiguous Query, Conflicting Policy Documents, Multi-hop Reasoning, Three Document Evidence Chain, Prompt Injection via Retrieval. | **Doc bug** | ✅ Fixed — ROLLOUT.md updated |
| 5 | RAG Lab — done card placement | ✓ done card appears after scenario completion but is positioned in corner — not immediately visible. Primary CTA of the entire learn loop is being missed by users. | **Critical** | ⚠️ Open — UPGRADES.md |
| 6 | RAG Lab — "Test your understanding" CTA | Crashes on click. Dead end — navigates to nothing. | **Critical** | ✅ Fixed sprint 11 — `preplabInitialMode` state in App.jsx; `initialMode` prop in PrepLab.jsx; useEffect auto-selects Trainer mode. |
| 7 | RAG Lab — "Read the full breakdown" CTA | ✅ Opens correct GT post. | ✅ Pass | Closed |
| 8 | GT post quiz depth | Quiz fires correctly but too few questions. Needs minimum 5 to feel meaningful. | **Medium** | ⚠️ Open — UPGRADES.md |
| 9 | PrepLab — depth + polish | Not sufficiently polished for external testers. No difficulty levels (easy/medium/hard). All questions single-select MCQ only — no multi-select option. Mode customization thin. | **High** | ⚠️ Open — UPGRADES.md |
| 10 | PrepLab — progress bar | ✅ Tracks correctly. | ✅ Pass | Closed |
| 11 | PrepLab — session end screen | ✅ Looks good. | ✅ Pass | Closed |
| 12 | Console errors | ✅ None. | ✅ Pass | Closed |

### New idea surfaced

**Access code gate (interim auth):** Rather than full Stripe + auth, gate premium content behind a client-side access code (localStorage). Keep a generic community code public. Upgrade path: when Stripe goes live, swap to server-side purchased codes. Logged in UPGRADES.md.

### Summary

4 critical findings, 2 high, 1 medium. **Batch 0 Walk 1 does not pass.** Critical fixes required before Batch 1 opens: done card placement (#5), "Test your understanding" crash (#6), hero copy (#1). Walk 2–8 not yet run.

**Status:** ⚠️ Partially resolved — findings #1, #2, #6 fixed in sprints 11–12. Findings #5, #8, #9 still open.

---

## Audit 35 — Sprint 12 Review + Ask/Search Identity Audit (May 2026)

**Type:** Sprint review + focused feature audit
**Date:** May 2026
**Scope:** Sprint 12 deliverables + full audit of Ask/Search/Consultation tab.

### Sprint 12 deliverables — all verified

| # | Feature | What Shipped | Brace Check | Status |
|---|---|---|---|---|
| 1 | `WeaknessHeatmapMode` (PrepLab) | Per-topic accuracy bars (worst-first), Hard Questions view, empty state, Reset button. PREPLAB_SIDEBAR entry + routing. | ✓ diff 0 | ✅ Done |
| 2 | `recordHistory` module helper | Shared history persistence across TrainerMode + InterviewPrepMode. `HISTORY_KEY` constant. TrainerMode reset button uses constant. | — | ✅ Done |
| 3 | `GateModal` unlock animation | `unlocked` success state: `gsl-pop` scale+fade (0.35s) + `gsl-glow` radial pulse (1.4s) + `gsl-fadein` text (0.4s delay). Keyframes injected inline. `setTimeout(onUnlock, 1400)`. | — | ✅ Done |
| 4 | Concepts Gym | `GymPanel` component: track accordion (FOUNDATION/APPLICATION/PRACTICE), progress bars, per-module Start/Revisit, "Next up" CTA. `MASTERY_KEY` localStorage. `markComplete(id)` + ✓ sidebar badges + "Mark complete"/"✓ Completed" in module header. "GYM" button in sidebar. `MODULE_NEXT_STEP` lookup (13 modules). | ✓ diff 0 | ✅ Done |

### Ask/Search identity audit — Audit 26 follow-up

**Context:** Audit 26 (sprint 5) flagged: label says "Ask", mechanic is keyword search. Still open.

**Current state (Consultation.jsx / Ask tab):**
- Label: "Ask" or "Search" (changed in earlier sprint to "Search")
- Mechanic: `toLowerCase().includes()` keyword match over GT post titles + body text snippets
- No fuzzy matching — exact substring only
- No module coverage — GT posts only, no Systems/Explore/Concepts module titles
- No ranking — results returned in array order, not by relevance
- No empty-state guidance — dead white box on zero results
- No query suggestions, no example queries
- Result cards show title + first 100 chars of description — no match highlighting

**Gap:** User types "why does retrieval fail" → zero results (no post title contains that exact string). Types "retrieval" → returns some posts but not sorted by relevance. Zero coverage of Labs/Systems modules.

**Fix plan (static, no backend):**
1. Expand search corpus to include Systems module titles/subtitles + Explore module titles
2. Replace exact `includes` with token-based scoring: split query into words, score each result by word-overlap count
3. Sort results by score descending
4. Add match highlighting on result cards (bold the matching fragment)
5. Add example queries below search input
6. Add empty-state with "Try searching for: RAG, agent memory, evaluation, embeddings"
7. Relabel to "Search" permanently, update description to be honest about what it does

**Effort:** S–M. All static. Consultation.jsx is the only file.

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Exact-string matching misses natural queries | High | ✅ Fixed sprint 13 |
| 2 | Only searches GT posts — misses modules | High | ✅ Fixed sprint 13 |
| 3 | No result ranking by relevance | High | ✅ Fixed sprint 13 |
| 4 | No match highlighting | Medium | ✅ Fixed sprint 13 |
| 5 | Empty state is a blank box | Medium | ✅ Fixed sprint 13 |
| 6 | "Ask" label vs search mechanic mismatch | Medium | ✅ Fixed sprint 13 — relabeled Search, honest description |

**Status:** ✅ Fixed sprint 13 (this session).

---

## Audit 36 — Content Integrity + Code Hygiene Pass (May 2026, Sprint 20)

**Type:** Content integrity + BUILD hygiene
**Date:** May 2026
**Scope:** Stat accuracy across all public-facing files, dead code from sprint 20 cleanup, brace balance, color drift, hook violations.
**Method:** grep + python3 counts across src/, index.html, CLAUDE.md, DECISIONS.md.

### Findings

| # | Finding | File(s) | Severity | Status |
|---|---|---|---|---|
| 1 | **index.html GT count stale** — all three meta tags (`description`, `og:description`, `twitter:description`) claimed "200+ Ground Truth posts". Actual count: 222. | `index.html` | Medium | ✅ Fixed — updated to "222+" in all three tags |
| 2 | **CLAUDE.md Explore module count stale** — scale line (line 27) said "25 Explore modules". Actual: 22 modules in `EXPLORE_MODULES` array. | `CLAUDE.md` | Low | ✅ Fixed — updated to "22 Explore modules" |
| 3 | **DECISIONS.md GT count stale** — two references to "200+ GT posts" in Section 3 (Ask tab architecture). | `DECISIONS.md` | Low | ✅ Fixed — updated to "222+" in both occurrences |
| 4 | **Dead `onFeedback` prop** — `App.jsx` still passed `onFeedback={openFeedback}` to `<HomePage>` after sprint 20 removed the handler and all feedback UI from `Home.jsx`. Dead prop passed to a component that no longer accepts it. | `App.jsx` line 1690 | Low | ✅ Fixed — prop removed |
| 5 | **All 7 key files brace-balanced** — Home.jsx, App.jsx, PrepLab.jsx, Agents.jsx, GroundTruth.jsx, Concepts.jsx, systems/modules.jsx all diff: 0 | All | — | ✅ Clean |
| 6 | **No React.useState / React.useEffect violations** | All `.jsx` | — | ✅ Clean |
| 7 | **No gray-\* Tailwind classes remaining** | All `.jsx` | — | ✅ Clean |
| 8 | **slate-\* grep returns false positives only** — 15 hits all come from `translate-` utilities (e.g. `-translate-y-0.5`), which contain "slate" as a substring. Zero actual `text-slate-*` / `bg-slate-*` color classes in codebase. | All `.jsx` | — | ✅ Clean |
| 9 | **Home.jsx stat numbers accurate** — 222+ GT ✓, 261 PrepLab questions ✓ | `Home.jsx` | — | ✅ Clean |
| 10 | **Systems nav module count: 54** — matches CLAUDE.md claim | `Systems.jsx` | — | ✅ Clean |
| 11 | **Agent Lab nav module count: 16** — AGENTS_MODULES array has 26 raw IDs but 10 are false positives from AGENTS_RELATED_GT entries immediately following the array. True nav modules: 16. Matches CLAUDE.md. | `Agents.jsx` | — | ✅ Clean |

### Sprint 20 changes verified

| Item | Status |
|---|---|
| Beta banner removed from `Home.jsx` | ✅ |
| "Built by Sidharth Kriplani" line removed | ✅ |
| "No login" disclaimer line removed | ✅ |
| Footer feedback button removed | ✅ |
| Footer now shows "Also by the same team" sibling links with `border-t` + indigo glow + `mt-auto` | ✅ |
| `NEXT.md` created for genai-systems-lab (5 items) | ✅ |
| `NEXT.md` created for PAL/experimentation-systems-lab | ✅ |
| PAL `Footer.jsx` cross-links reverted — home page only per product decision | ✅ |

### Verified counts as of sprint 20

| Metric | Count |
|---|---|
| GT posts indexed | 222 |
| PrepLab questions | 261 |
| Systems modules in nav | 54 |
| Agent Lab modules in nav | 16 |
| Explore modules | 22 |
| Concepts modules | 15 |

### Still-open findings (carried from prior audits)

| # | Finding | Source Audit | Status |
|---|---|---|---|
| 1 | `streaming` (LLM Lab) is pure reference — 2 static tabs, no config, no outcome | Audit 28 #4 | ⚠️ Open |
| 2 | `agentcfg` missing from AGENTS_RELATED_GT | Audit 29 #2 | ⚠️ Low priority |
| 3 | RAG Lab done card below the fold — highest-dropout moment in the product | Audit 34 #5 | ⚠️ Open — NEXT.md item 1 |
| 4 | PrepLab has no difficulty levels, no multi-select questions | Audit 34 #9 | ⚠️ Open |
| 5 | RSS feed missing ~100 recent GT posts | Audit 17 #2 | ⚠️ Open |
| 6 | 2 true orphaned GT posts — `prompt-cost-engineering`, `rlhf-dpo-explained-v2` | Audit 18 #4 | ⚠️ Open |
| 7 | `production-mlops` CATEGORIES filter entry missing in GroundTruth.jsx | Audit 19 #2 | ⚠️ Open |
| 8 | Sitemap has 45 dead URLs on old domain + ~103 GT posts missing | Audit 19 #1/#6 | ⚠️ Open |

**Status:** Sprint 20 hygiene pass complete ✅

---

## Audit 37 — Automated Bug Sweep (May 2026, Sprint 20 close)

**Type:** Code safety / runtime risk
**Date:** May 2026
**Scope:** All `.jsx` files in `src/`. 7 automated checks.
**Method:** grep-based sweep across the full source tree.

### Checks run

| # | Check | Result |
|---|---|---|
| 1 | Imperative `currentTarget.style` DOM mutations | 2 hits in `App.jsx` — QA corner button opacity only (not answer cards, not ghost-hover risk) |
| 2 | High-risk subset: `background`/`borderColor` mutations on interactive buttons | 0 hits ✅ |
| 3 | `addEventListener` without matching `removeEventListener` | `main.jsx` — service worker registration pattern, not a leak ✅ |
| 4 | `JSON.parse` without `try/catch` | `groundTruthPosts.js` — static data file, not runtime risk ✅ |
| 5 | `.find()` result accessed without optional chaining | `Playground.jsx:450` — **real bug** — see below |
| 6 | `setInterval` without `clearInterval` | 0 hits ✅ |
| 7 | `.map()` without key prop | `Flows.jsx` only — Flows is PARKED, low priority |

### Finding 5 — Playground.jsx:450 (fixed)

```js
// Before (throws TypeError if no hallucination element found):
setScores(s => [...s, id === round.outputs.find(o => o.hallucination).id ? 1 : 0]);

// After:
setScores(s => [...s, id === round.outputs.find(o => o.hallucination)?.id ? 1 : 0]);
```

All `HALLUCINATION_ROUNDS` entries currently have exactly one `hallucination: true` entry so this would never fire in practice, but the unguarded `.id` access is a real TypeError waiting for any data change.

**Commit:** `0532c36`

### App.jsx:2085–2086 — not a bug

The two `currentTarget.style` mutations are on the fixed QA debug button (bottom-left corner, opacity 0.45 ↔ 1). Not choice buttons, not answer cards — not the mobile ghost-hover pattern. Safe to leave as-is.

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | `Playground.jsx:450` — `.find().id` without optional chaining | Medium | ✅ Fixed `0532c36` |
| 2 | `App.jsx:2085` — `currentTarget.style.opacity` on QA button | Low | ✅ Non-issue |
| 3 | `main.jsx` — addEventListener mismatch | Low | ✅ Non-issue (service worker) |
| 4 | `Flows.jsx` — missing map keys | Low | ⚠️ Open (Flows is PARKED) |

**Status:** ✅ Complete. 1 real bug fixed.

---

## Audit 38 — External Cold Read (May 2026, Sprint 20 close)

**Type:** External positioning + product perception audit
**Date:** May 2026
**Source:** Unsolicited cold-read analysis by ChatGPT — reviewed genai-systems-lab, experimentation-systems-lab, ml-systems-lab with no prior context. Repo-visible code + docs only; no runtime execution.
**Why logged:** Third-party cold reads are the closest proxy to a real first-time visitor impression. Signal without bias.

### Ratings

| Repo | Rating | Primary signal |
|---|---|---|
| genai-systems-lab | **8.5/10** | Best concept, strongest differentiation, most market-relevant |
| experimentation-systems-lab (PAL) | **8/10** | Most commercially coherent, strongest product/analytics interview utility |
| ml-systems-lab | **7.5/10** | Broad coverage, strong concept, less sharply differentiated |

### What was praised (accurate, keep reinforcing)

- Clear product thesis: "configure the system, watch it fail, understand why"
- Failure simulation angle is genuinely differentiated — RAG Lab scenario file cited as "far beyond a shallow GenAI demo"
- Fidelity tags called "unusually mature" — explicit disclosure of what's simulated vs faithful
- Architecture/product documentation (DECISIONS.md) noted as impressive — shows editorial judgment, not just feature building
- "Feels like a real product, not a project"

### What was flagged as weaknesses (honest assessment of each)

| Weakness flagged | Our assessment | Action |
|---|---|---|
| "Too static — may look like frontend SPA, not real AI systems" | Framing problem, not a build problem. Zero-backend is a design decision. Fidelity badges on all Lab modules (not just Concepts) are the correct response — own the simulation explicitly. | NEXT.md item 2 (fidelity badges) |
| "Client-side access code is weak security/monetization" | Accurate but irrelevant — it's transparently a beta pattern, not a security claim. Non-issue until Stripe. | No action needed |
| "14 tabs, unclear flagship beyond RAG Lab" | Real. Build/Prove/Navigate restructure in DECISIONS.md is the answer — not yet implemented. | L-effort, separate sprint |
| "No tests, backend, real infra, real users" | Wrong audience's critique. Adding these would be a different product that defeats the zero-backend thesis. | Ignore |
| Stats stale (140+ modules, 200+ posts) | Fixed — README updated to 150+, 222+, 261+ same session. | ✅ Fixed `07c40f0` |

### Most important finding — distribution

> "Distribution is the next bottleneck. Without users, none of the above matters."

Said about PAL but applies equally here. The product reached feature-completeness in May 2026. PostHog is installed but no WAU baseline has been established. More features without usage data is inventory with no demand signal. **This is the highest-priority action coming out of this audit — not a build item.**

See DECISIONS.md Section 0b: "Distribution before features" (standing rule added May 2026).

### Positioning fix applied this session

GitHub repo description and README updated to use "production AI judgment simulator" framing. See DECISIONS.md Section 0a. Commit: `07c40f0`.

### Actionable items surfaced (mapped to existing backlog)

| Item | Priority | Where logged |
|---|---|---|
| Pull PostHog WAU baseline before next major sprint | **Highest** | DECISIONS.md § 0b; IDEAS.md (analytics pause cluster) |
| Fidelity badges on all Lab modules | High | NEXT.md item 2 |
| Done card prominence (RAG Lab learn loop) | High | NEXT.md item 1 |
| Concepts synthesis close + inline callouts | Medium | NEXT.md item 4 |
| 3 thin GT posts expansion | Medium | NEXT.md item 5 |
| Build/Prove/Navigate structural rebuild | L-effort | DECISIONS.md (Structural Upgrade section) |

### Items explicitly not worth building from this analysis

- Tests — marginal signal for wrong audience
- Real backend / live inference — defeats zero-backend thesis
- Supabase auth (for this repo) — access code pattern is correct for current stage

**Status:** ✅ Analysis complete. Positioning fix applied. All findings mapped to backlog or standing rules.

---

## Audit 39 — PAL Visual Gap Analysis (May 2026, Sprint 24)

**Trigger:** User reported GAL "looks the same" after multiple sprint rounds. Formal comparison against PAL (sibling product) to identify root causes.

**Method:** Fetched PAL's actual `index.css` and `Sidebar.jsx` from GitHub raw URLs. Measured L* luminance difference between background layers. Catalogued all structural visual gaps with impact ratings.

### Root cause identified

GAL's prior background elevation system: zinc-950 (#09090b) / zinc-900 (#18181b) — ~9 L* luminance units between page bg and card. Panel edges invisible. Cold gray palette, zero warmth.

PAL uses blue-tinted darks: bg=#111520, surface=#191e30, surface-2=#1f2438 — ~12 L* units between layers. Cards float without shadows. Every structural boundary is legible.

### Full gap inventory (pre-sprint 24)

| Gap | PAL | GAL (before) | Impact |
|---|---|---|---|
| Background elevation | 3-token blue-tinted system | flat zinc-950 everywhere | HIGH |
| Border visibility | #3d4668 (blue-gray) | zinc-800 (#27272a, near-invisible) | HIGH |
| Sidebar background | --surface token (#191e30) | zinc-900 (same as content bg) | HIGH |
| Mobile sidebar animation | CSS transform translateX | JSX display:none toggle | MED |
| Sticky header | backdrop-blur + border | no sticky | MED |
| Scrollbar | 2px custom thumb, themed | scrollbar-hide (hidden) | LOW |

### Fixes applied (sprint 24)

- `--bg`, `--surface`, `--surface-2`, `--border`, `--border-subtle` tokens added to `:root`
- `--color-zinc-900: #191e30` single-line remap fixed 300+ `bg-zinc-900` instances app-wide
- All 5 lab sidebar shells: `var(--surface)` + `var(--border)`
- All modals (search, leaderboard, feedback, shortcuts): elevation tokens applied
- Home.jsx: all door cards + Today section: `--surface-2`/`--border`
- Standing rule added to DECISIONS.md § 2

### Remaining gaps (deferred)

- Mobile sidebar CSS transform slide animation (JSX toggle works, not animated)
- Sticky header with backdrop-blur

**Status:** ✅ All HIGH impact gaps resolved. Remaining LOW/MED gaps deferred. Standing rule in DECISIONS.md.

---

## Audit 40 — Third-Party Lab Diagnosis Assessment (May 2026, Sprint 25)

**Type:** External product assessment — interview readiness utility
**Date:** May 2026
**Source:** Third-party written diagnosis of all three sibling labs (GAL, ML Systems Lab, PAL) for Quantiphi + Meesho interview preparation. Document reviewed in full during sprint 25. No code shipped this session — analysis and MD sync only.
**Why logged:** External assessments with a specific use-case frame (interview prep for named companies) surface gaps that internal audits miss. This one had an unusually concrete framing: "can a candidate use these labs to prepare for Quantiphi (AI infra) and Meesho (marketplace ML) roles?"

---

### Summary ratings from the assessment

| Lab | Assessment | Primary signal |
|---|---|---|
| GAL | "Excellent for production AI judgment simulation" | Failure diagnosis mechanic + "feels like a real product" cited as primary strengths |
| ML Systems Lab | "Strong for infra-layer AI concepts" | CUDA/distributed content not relevant for Quantiphi application layer |
| PAL | "Best for Meesho analytics/PM prep, weakest for ML engineer roles" | Case study format correct for analytics; insufficient for AI systems judgment |

---

### GAL-specific findings

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | **No production service mapping on failure cards** — GAL teaches failure judgment but never names the real AWS/OSS service the failure maps to. "You can diagnose the pattern but can't say 'this is the Bedrock Knowledge Base problem'" | High | ⚠️ Open — UPGRADES.md + NEXT.md |
| 2 | **No interview story packaging at scenario completion** — users leave with judgment but not a narrative they can use in an interview answer. The done card has a PrepLab CTA but doesn't frame what the user just built as an interview story | High | ⚠️ Open — UPGRADES.md + NEXT.md |
| 3 | **Company Tracks lacks architecture mapping** — PrepLab Company Tracks asks topic questions with company context but doesn't map failure modes to each company's known systems (e.g. Swiggy catalog freshness, PhonePe UPI retry) | Medium | ⚠️ Open — IDEAS.md |
| 4 | **No proof of real backend execution** — the "judgment simulator" framing is strong but a user asked "show me something you built" has no concrete artifact to link. A single FastAPI + ChromaDB RAG demo repo would close this | Medium | ⚠️ Open — IDEAS.md |

### Validated strengths (do not dilute)

- Failure simulation mechanic is the correct format for AI engineer prep — external validation confirms this
- "Feels like a real product" positioning is earned and should be reinforced, not discarded
- 3,400+ users cited as credibility signal by the assessor

### Format integrity decision

The assessment confirmed that GAL's failure simulation mechanic and PAL's case study mechanic serve different audiences correctly. **These formats must not converge.** Full rule in DECISIONS.md Section 6.

### Adaptations logged

All four adaptation items documented in:
- IDEAS.md — "Diagnosis-sourced adaptations" cluster (Tier 1)
- UPGRADES.md — "Maps to Production Callout" + "Your Interview Story Block" entries (both S effort, High priority)
- NEXT.md — both items added to "If time allows" section
- DECISIONS.md — Section 6: format integrity rule

**Status:** ✅ Analysis complete. All findings mapped to backlog. No code shipped this session.

---

## Audit 41 — Visual Color Audit: One-Accent Discipline (May 2026)

**Type:** Visual Consistency

**Trigger:** After LUNA electric rebrand. User feedback: "still colorful" and "looks like careless color spraying."

**What was audited:** Every location in App.jsx, Systems.jsx, and systems/modules.jsx where `color` properties are used to distinguish UI elements.

**Root cause identified:** Two separate problems:
1. **Navigation chrome**: NAV_GROUPS had 4 group accent colors (BUILD=cyan, PROVE=green, NAVIGATE=amber, KNOWLEDGE=violet). Near-void backgrounds (`#05060E`) removed the navy "color glue" that had been unifying them — each color popped independently after the rebrand.
2. **Module content**: EVAL_CASES had 6 vivid type badge colors (indigo, amber, red, emerald, violet, orange). STRATEGY_SCENARIOS had 5 different card accent colors. All displayed simultaneously on screen.

**Fixes applied:**
- `App.jsx` NAV_GROUPS: all 4 group colors → `#52525b` (neutral). Active item = single hardcoded cyan gradient + inset box-shadow. Visited dots = `var(--gal-build)` at 0.45 opacity.
- `Systems.jsx` SYSTEMS_GROUPS: DESIGN/BUILD/OPS all → `#52525b`.
- `systems/modules.jsx` EVAL_CASES: 6 category type badges → `#22D3EE`.
- `systems/modules.jsx` STRATEGY_SCENARIOS: 5 scenario card colors → `#22D3EE`.

**What was NOT changed:** Semantic status colors (red=OOM/bad, amber=warning, green=good), data visualization chart series colors (need distinct colors to be readable), sequential step process diagrams (colors encode position/order). These are functional color encodings, not decorative.

**Standing rule added:** One accent color in navigation chrome. No competing accent colors in sidebar group labels, module type badges, or scenario card accents. Semantic/chart/status colors exempt.

**Status:** ✅ Resolved — commits `1b972b4`, `36a4360`, `9fce4d3`.

---

## Audit 42 — Concepts Gym Depth Pass: Sprint 28 (May 2026)

**Type:** Content Integrity + Interactive Standard
**Date:** May 2026 (sprint 28)
**Trigger:** Concepts modules had framing text (sprint 14) and gym skeleton (sprint 15) but most interactive tabs were single-view — no failure modes, no configurability beyond the primary mechanic, no connection between module concept and production consequence.

**Modules audited:** All 15 Concepts modules across Language Models, Retrieval, and AI Agents gyms.

**Finding:** 4 modules had interactive depth gaps that blocked the standard "configure → observe → understand" loop:

| Module | Gap | Fix |
|---|---|---|
| `TemperatureGame` | Shows game + output matching, but no real logit/probability visualization. User has no intuition about WHY temperature changes output distribution | Added "Live Logit Shaper" tab: real-time softmax on 3 example prompts (factual/contested/creative), temperature slider 0.1→2.0, 8-token probability bar chart, entropy readout with adaptive label |
| `RAGPipelineModule` | "Walk the Pipeline" tab only. No failure modes shown — user sees what RAG does but never sees how it breaks | Added "What Breaks" tab: 3 production failure scenarios (stale retrieval, noise injection via top_k, context grounding failure). Each: trigger + normal vs broken context + "Inject failure" button revealing output comparison + diagnosis + production fix |
| `FlashAttentionConcept` | Memory calculator (VRAM comparison) only. No dynamic visualization of WHY tiling reduces HBM writes | Added "Tile Traversal" tab: animated 5×5 tile grid (350ms/step), Play/Pause/Step/Reset controls, SRAM panel showing active tile + HBM write counter, online softmax callout |
| `EmbeddingModule` | Semantic map (static 2D word plot) only. No connection to how embeddings power retrieval | Added "Similarity Search" tab: 5 preset query anchors, top-k slider 1→12, cosine similarity ranked results with category badges + score bars, noise warning at top_k > 6 |

**All brace diffs:** 0. Commit: `7f0a88d`.

**New constants added:**
- `LOGIT_EXAMPLES` — 3 prompts with token arrays + raw logits (module-level, before FlashAttentionConcept)
- `computeSoftmax(logits, temp)` — softmax with temperature scaling (module-level helper)
- `RAG_FAILURE_SCENARIOS` — 3 production failure objects with trigger/normal/broken/output/diagnosis/fix (inside RAGPipelineModule)
- `EMB_QUERIES` — 5 preset query anchors with 2D coordinates for cosine similarity search (module-level)

**New state added per module:**
- TemperatureGame: `tempTab`, `shaperExIdx`, `shaperTemp` + `shaperProbs` (useMemo), `shaperEntropy`
- RAGPipelineModule: `ragTab`, `activeFailure`, `failureTriggered`
- FlashAttentionConcept: `flashTab`, `traversalStep`, `isPlaying`, `traversalRef` (useRef) + `useEffect` interval
- EmbeddingModule: `embTab`, `queryIdx`, `topK` (renamed `setEmbTopK`) + `searchResults` (useMemo)

**Status:** ✅ All 4 gaps resolved. Remaining Concepts modules (ContextWindow, Attention, Tokenizer, AgentLoop, etc.) were upgraded in sprints 26 and earlier — this sprint closes the last 4 depth gaps in the active 15.

---

## Audit 43 — Content Gap Sprint Review: Sprints 33–35 (May 2026)

**Type:** Content Integrity + PrepLab Coverage + UPGRADES.md staleness sweep
**Date:** May 2026 (sprints 33–35 close)
**Trigger:** Three Tier 1 content gaps from Senior AI Engineer interview signal all shipped in sequence. UPGRADES.md had multiple stale "Pending" entries for work done in sprints 11, 30, 31B, 31C.

**What shipped (sprints 33–35):**

| Sprint | Deliverable | Commit |
|---|---|---|
| 33 | `GraphRAGModule` (4-tab interactive SVG knowledge graph + multi-hop traversal animation) + GT post `graph-rag-multi-hop` + 4 PrepLab questions | `2a00754` |
| 34 | `LangGraphModule` (Reducers demo + StateGraph SVG + HITL animated flow + when-to-use table) + GT post `langgraph-reducers-hitl` + 4 PrepLab questions. GraphRAG SVG mobile font fix. | `cfd4520` |
| 35 | Two-stage retrieval GT post `two-stage-retrieval-reranker` + QueryRefinementLab "Two-Stage" 4th tab (side-by-side bi-encoder vs cross-encoder ranking with rank-change arrows) + 4 PrepLab questions. CompanyTracks revamp: bug fix (`q.answer` → `q.options[q.correct]`), text question handling, topic weight viz, GT recommendations per archetype. | `74160e7` |

**Scale after sprint 35:** 56 Systems modules (in nav), 225 GT posts, 277 PrepLab questions.

**UPGRADES.md staleness findings and resolutions:**

| Entry | Stale Status | Correct Status |
|---|---|---|
| RAG Lab — Done Card Prominence | "Pending — Batch 0 Walk 1 #5" | ✅ Done sprint 30 (`ada9b79`) |
| RAG Lab — TYU CTA Fix | "Pending — Batch 0 Walk 1 #6" | ✅ Done sprint 11 (`327a745`) |
| PrepLab — Common Trap Layer | "Pending" | ✅ Done sprint 31C (`38d5330`) |
| PrepLab — Keyboard Shortcuts | "Pending" | ✅ Done sprint 30 (`ada9b79`) |
| Global — PrepLab questions extraction | "Pending — DECISIONS.md §8" | ✅ Done sprint 31B (`73924a0`) |
| Global — Shared UI components | "Pending" | Partially done — `src/shared.jsx` with `CommonTrapCallout` exists; `FidelityBadge` still duplicated; `ForwardPointerCard` pending |
| PrepLab — Interview Prep Plan | "Pending — spec finalised" | Partially done — Sprint E delivered 4-step Interview Brief; full personalization spec still pending (Tier 2) |

All resolved in same commit as this audit log entry.

**Still open (no change this sprint):**
- GT State-Aware Reading Mode ("Revise / Learn / What's Next") — pending
- GT Series + Tags Architecture — pending (222→225 posts, still at wall)
- Home.jsx Social Proof — placeholder testimonials still showing
- Systems/Explore reference tables → decision engines — pending
- 3 thin GT stubs: `dpo-in-practice`, `llm-observability`, `instruction-tuning-datasets` — pending
- CompanyTracks: `gating.js` `FREE_SESSION_LIMIT` — `src/config/gating.js` exists (`38d5330`) but `nav.js` and `labs.js` not yet created

**Status:** ✅ All sprint 33–35 deliverables verified. All UPGRADES.md stale entries corrected.

---

## Audit 54 — Sprint 54 Runtime Bug Audit (June 2026)

**Scope:** Full codebase audit of all files modified in sprint 54 (fefde75, c106aea, e00742a, 839eae5, 70e5604, 370b990).

**Method:** Automated structural checks (brace diffs on all 44 src files, lazy import resolution, lucide-react detection, React.hook() anti-patterns) + manual logic audit of each changed file.

**Automated checks — all clean:**
- Brace diff: 0 across all 44 src files
- All 23 lazy imports resolve to existing files
- No lucide-react imports
- No React.useState()/React.useEffect() anti-patterns
- No gray-*/slate-* palette violations

**Runtime bugs found and fixed:**

| Bug | File | Root cause | Fix | Commit |
|---|---|---|---|---|
| `onNavigate("progress")` silently failed | Profile.jsx | `navigateTo` destructures `{tab}` from arg; passing a string gave `tab=undefined`, `navigate(undefined)` called, nothing happened | Changed to `onNavigate({ tab: "progress" })` | `370b990` |
| `removeBookmark` re-render didn't fire | Profile.jsx | `setSyncMsg(null)` used as re-render hack; React bails out when new state = old state (syncMsg already null) | Converted `bookmarkIds` to proper `useState`, `removeBookmark` calls `setBookmarkIds(prev => ...)` | `370b990` |
| Plans FULL ACCESS "Free" label | Plans.jsx | Both tiers appeared free ($0 vs "Free") — indistinguishable | Replaced "Free" with `DAI2026` code displayed prominently; pre-filled in input; shows "ACTIVE" when unlocked | `370b990` |
| All SKILL AREAS expanded simultaneously | App.jsx | `isExpanded` included `subActive \|\| active`; all areas share `id: "groundtruth"` sub-items (Posts), so topView=groundtruth set `subActive=true` on all | Removed `subActive \|\| active` from `isExpanded`; now only `forceOpen \|\| expandedItems.has(id)` | `70e5604` |
| GT series nav didn't open series | App.jsx | Series sub-items all had `id: "groundtruth"` with no way to open specific post | Added `postId` field to each series sub-item; click handler sets `gtPostId` and navigates | `70e5604` |
| Sidebar items couldn't be collapsed | App.jsx | `active` in `isExpanded` forced item open regardless of toggle state | Same fix as above — removed `active` from `isExpanded`; auto-adds to expandedItems on navigate instead | `70e5604` |

**Still open (pre-existing, not caused this sprint):**
- ~~GT Series taxonomy~~ — DONE `3c29a1f`. 104 posts tagged with `series` field across 17 series.
- Home.jsx social proof — placeholder testimonials
- Profile.jsx `bookmarksCount` stat uses `bookmarkIds.size` correctly now but `accuracy` stat shows `—` for new users (correct behavior, not a bug)

**Status:** ✅ All sprint 54 runtime bugs fixed. Structural checks clean.

---

## Audit 27 — Sprint 55 Bug Audit

**Date:** June 2026 (sprint 55 session 1)
**Scope:** Runtime bugs reported after sprint 54 — GT posts not opening, sidebar nav issues
**Trigger:** User reported React error on any GT post open, sidebar can't collapse, nav subitems opening wrong pages

### Findings & Fixes

| Bug | File | Root cause | Fix | Commit |
|---|---|---|---|---|
| GT posts not opening — React error on open | GroundTruth.jsx | `useState(false)` inside `case "code"` in the `Block` switch statement — violates Rules of Hooks. When block positions shift (key={i} with filter), React detects hook count mismatch and throws | Extracted `CodeBlock` component; `useState` now at top level of dedicated component | `5b653a9` |
| Sidebar items couldn't be un-expanded | App.jsx | Chevron `<button>` was nested inside nav item `<button>` — invalid HTML nesting. Browsers may route inner-button click events to outer button, bypassing `e.stopPropagation()` | Restructured: chevron is now a sibling `<button>` with `position: absolute`, not a child. Nav item uses `pr-8` to leave room for chevron. | `5b653a9` |
| "Concepts" / "Posts" / "Practice Qs" nav subitems opened wrong pages | App.jsx NAV_GROUPS | Subitems had `id: "concepts"` / `id: "groundtruth"` / `id: "preplab"` — navigated to the raw unfiltered tabs. Clicking "Concepts" under Retrieval opened ALL 27 Concepts modules. | Simplified subitems to lab-only entries. Hub pages already show filtered content; the nav area label click goes to the hub. | `5b653a9` |

**Verified clean after fix:**
- GroundTruth.jsx brace diff: 0
- App.jsx brace diff: 0

**Status:** ✅ Sprint 55 session 1 bugs fixed.
