# PREPLAB_SPEC.md — Complete Revamp Specification

PrepLab is the cold-start entry point for GenAI Systems Lab (DECISIONS.md Section 9). This spec defines the complete revamp across: mode architecture, visual design, user journey, depth signal, product positioning, and technical implementation. It is the source of truth for all PrepLab sprint work going forward.

*Written: May 2026 | Status: Spec — not yet built*

---

## 1. Current State Diagnosis

### What's broken and why

**Mode proliferation without consolidation.** Six sidebar entries (Combined Assessment, Trainer, Interview Prep Plan, Company Tracks, Defense Doc, My Weakness Map) were added incrementally. Each one works. Together they don't — a cold visitor reads the sidebar and doesn't know which to open. The differentiation is invisible.

**Names describe format, not value.** "Combined Assessment" says nothing about what the user gets. "Defense Doc" is internally meaningful jargon — externally it reads as a PM named a feature at 11pm. "My Weakness Map" implies failure before the user has done anything. None of these names answer: "why does this make me more hireable?"

**Defense Doc is a dead end.** Bare textarea, "Generate War Room Brief" button, no preview of output, no example, no signal of value. A cold visitor who clicks it has no reason to type anything.

**Trainer is overwhelming.** 22 topic pills in a horizontal overflow strip is the worst possible UI for "where should I start?" No stakes, no progression signal, no sense that you're being assessed. Looks like a blog category filter.

**Combined Assessment config looks generic.** Duration / Focus / Difficulty selectors are functionally correct but aesthetically indistinguishable from any $5 quiz app. The "Configure Exam" frame doesn't create the "I'm about to be tested on something real" feeling.

**No cold-start narrative.** A new visitor arrives with the belief "I need to pass interviews." The product has everything they need. But the entry point doesn't direct them — it presents six equal-weight options and waits.

**No depth signal on questions.** Questions are functionally correct and technically deep. But they render identically regardless of difficulty, source, or interview relevance. No Common Trap, no source attribution, no "this is what separates a FAANG hire from a reject" framing.

**No progression visible from outside.** The user can't see their score history, gap trend, or mastery trajectory from the PrepLab entry point. Progress is buried in Weakness Map — which requires knowing to open Weakness Map.

**Visual treatment is functional, not premium.** The question card blends into the background. Answer options have no hover weight — clicking feels arbitrary. The "Submit Answer" button is flat. Correct/wrong states use plain border color changes. There's no moment in the experience that feels like "this product was made by someone obsessed."

---

## 2. Vision

PrepLab should be the most credible AI interview prep tool a practitioner can find. When a cold visitor opens it:

- They understand within 10 seconds what they're getting (production AI judgment questions, not generic ML trivia)
- They feel like they're being assessed, not taking a quiz
- After 5 questions, they know their gap and what to do about it
- The paid features feel like obvious value unlocks, not arbitrary gates
- The visual treatment signals: someone who knows this domain built this

The experience: **"I answered 3 PrepLab questions and already know what I don't know."**

The business moment: **"I can see my gap but the full breakdown is locked. That's worth paying for."**

---

## 3. Mode Architecture — From 6 to 3

### Target sidebar

```
MODES
─────────────────
Assess            EXAM
Interview Strategy  STRATEGY
Company Tracks    ARCHETYPE
```

No more Defense Doc. No more Trainer as a top-level mode. No more Weakness Map as a sidebar entry.

---

### Mode 1 — Assess (replaces Combined Assessment + absorbs Weakness Map into results)

**Job:** Test yourself cold. No guidance, no hints. Leave knowing your gaps.

**Entry screen (redesigned):**
- Headline: "How interview-ready are you?" — not "Configure Exam"
- Three config rows: Duration (15 / 30 / 60 min with question counts), Focus (All / RAG & Retrieval / Agents / Evals / LLM Fundamentals), Difficulty (Mixed / Hard Only)
- Below config: a 2-line preview of what the results will show — "After the exam, you'll see your score by topic, your weakest areas, and the exact Lab scenarios that address each gap."
- CTA: "Start Assessment →" — not "Start Exam →"

**During the exam:**
- Progress bar always visible: "Question 7 of 20 · 14 min remaining"
- Keyboard shortcuts active (1/2/3/4 + Enter) — shown as a tiny hint on first question
- Question card: elevated `var(--surface-2)`, left border accent colored by difficulty (blue = easy, amber = medium, red = hard), question number + difficulty chip always visible
- Answer options: larger letter badges (A/B/C/D), clear hover state (border glow), selected state distinct from hover
- No feedback during exam — answers locked, reviewed at end

**Gate:** Fires at Q11 with **partial results visible**. Key design decision: do not block with a modal before showing anything. Show Q1–10 results (score, topic breakdown) then gate the Q11+ reveal and the full study plan. User is invested, mid-goal — highest conversion moment.

**Results screen (completely new — the premium moment):**
```
┌─────────────────────────────────────────────────────────┐
│  Your Assessment Results                     74% overall │
│                                                          │
│  RAG & Retrieval     ████████░░  80%   Strong            │
│  Evals & Metrics     █████░░░░░  52%   Gap ← study this  │
│  Agent Systems       ██████░░░░  61%   Improving         │
│  LLM Fundamentals    ████████░░  78%   Strong            │
│                                                          │
│  Your biggest gap: Evals & Metrics                       │
│  → Go to: Eval Lab — "Build Your Eval" scenario          │
│  → Read: "The Eval Crisis" (GT post)                     │
│  → Drill: 12 PrepLab questions on this topic             │
│                                                          │
│  [Retake with focus on gaps]  [Go to Interview Strategy] │
└─────────────────────────────────────────────────────────┘
```
- Per-topic bars sourced from `gsl-preplab-history` — shows current session + history trend if exists
- Gap forward pointer: one Lab scenario + one GT post + one PrepLab cluster per weak topic
- "Compare to last session" if history exists

**Trainer absorption:** Trainer mode (immediate feedback drill) becomes accessible from the results screen — "Drill your gaps in Trainer mode" — not a top-level sidebar entry. The user earns access to targeted drill after the assessment reveals what to drill on.

---

### Mode 2 — Interview Strategy (replaces Interview Prep Plan + absorbs Defense Doc + WeaknessMap as data)

**Job:** Given your interview context, build the most efficient prep plan that actually closes your gaps.

**Why this beats the current IPP:** The current Interview Prep Plan asks "rate yourself on everything." Interview Strategy asks "tell me your interview context, show me your resume, and I'll find the gap — you only rate what matters." Resume-evidenced gaps are more accurate than pure self-rating. Round type changes which resources dominate. Prior feedback doubles the weight on named weaknesses.

**Entry — 5 inputs (not just JD):**

```
1. Job Description         [paste area]              REQUIRED
2. Resume / LinkedIn       [paste area]              optional — changes analysis depth
3. Interview in            [3d / 7d / 14d / 21d+]   required
4. Round type              [Technical / HM / Behavioral / HR]  required
5. Prior feedback          [text, e.g. "got dinged on evals"]  optional
```

**Gap analysis (free, visible):**
- JD → extract required skills per category (existing SKILL_KEYWORDS logic, extended)
- Resume → extract coverage per category (new — static text match against same taxonomy)
- Delta = JD-required minus resume-covered = the actual gap
- Self-rating only asked for gap topics, not everything (current IPP asks for everything)
- Gap score = `jd_importance × (1 - self_rating) × round_multiplier × feedback_boost`
- Result: role profile card + top 3 gaps ranked by "cost of being wrong"

**Day plan (gated after 30% completion):**
- Day-by-day study plan scoped to days available
- Each day: 1-2 GT posts + 1 Lab module + 1 PrepLab cluster, ordered by gap weight
- Round type changes the mix: technical → Labs + PrepLab systems design; behavioral → GT posts + framing; HM → product angle, tradeoff framing
- Prior feedback → feedback-named gaps get Day 1-2 slots regardless of self-rating
- Progress auto-detected from `genai_leaderboard` (RAG Lab completions), `gsl-preplab-history` (PrepLab attempts), `genai_gt_read` (GT post opens)
- Gate fires at 30% completion: user is mid-plan, invested, sees what's coming

**Defense Doc absorption:** The "War Room Brief" concept (the one-page summary for interview day) becomes the Phase 3 output of Interview Strategy — a "Download Your Brief" button that generates a printable summary of your gaps, study plan progress, and key talking points. Not a separate mode. Not a textarea the user fills — a generated output.

---

### Mode 3 — Company Tracks (same concept, upgraded execution)

**Current problems:** Cards have no question count, no "what round this prepares you for", no difficulty signal, no entry context.

**Upgraded card:**
```
┌──────────────────────────────────────┐
│  🚀  AI-Native Startups              │
│  Anthropic · OpenAI · Perplexity     │
│                                      │
│  Safety-aware reasoning              │
│  Agentic system design               │
│  Eval obsession                      │
│                                      │
│  28 questions · Hard avg difficulty  │
│  Best for: Senior AI Engineer round  │
│  [Start Track →]                     │
└──────────────────────────────────────┘
```

**Track drill experience:**
- Shows company archetype context before first question: "These questions test what AI-Native Startups care about most — eval design, safety reasoning, and agentic system architecture."
- After each question: "This is the type of question Anthropic asks in technical rounds" (where applicable)
- Track completion: score + "How you'd perform at [archetype]" rating + forward pointer to Interview Strategy

**Gated** (access code now, paid later)

---

## 4. Visual Direction

### Question card — the core component

Current: flat `var(--surface-2)` card, uniform border, tiny difficulty badge

Target:
```
┌─────────────────────────────────────────────────────────┐
│ ▌ HARD  ·  MULTIPLE CHOICE  ·  Evals & Metrics          │  ← left accent bar color = difficulty
│                                                          │
│  What is the primary failure mode of using ROUGE score   │
│  as an eval metric for RAG systems?                      │
│                                                          │
│  A  ○  It only measures precision, not recall           │
│  B  ○  It penalizes lexical variation even when the      │
│        answer is semantically correct                    │
│  C  ○  It requires human reference answers              │
│  D  ○  It cannot handle multi-hop retrieval             │
│                                                          │
│                              [Submit Answer →]           │
└─────────────────────────────────────────────────────────┘
```

- Left border accent: `border-l-4` colored by difficulty (blue / amber / red)
- Difficulty chip: full `bg-red-950/50 text-red-400` pill, not a tiny label
- Answer options: `py-3 px-4` padding, `border border-zinc-700 hover:border-violet-500/60 hover:bg-violet-950/20` hover state — felt, not subtle
- Selected: `border-violet-500 bg-violet-950/30` — clearly chosen
- Submit: `bg-violet-600 hover:bg-violet-500` — not a flat button

### After answer reveal — the depth signal moment

```
┌─────────────────────────────────────────────────────────┐
│  ✓  Correct — B                                          │
│                                                          │
│  ROUGE measures lexical overlap between generated        │
│  and reference text. For RAG, the model may correctly    │
│  synthesize the answer in different words — ROUGE       │
│  penalizes this as wrong. Use semantic similarity        │
│  (BERTScore) or LLM-as-judge instead.                   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ⚠ Common trap                                   │    │  ← amber callout
│  │ Saying "ROUGE is fine for summarization."        │    │
│  │ Interviewers want to hear the RAG-specific       │    │
│  │ failure — lexical variation penalisation.        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [Next →]                           ← Back to results   │
└─────────────────────────────────────────────────────────┘
```

### Topic selector — replace 22 pills with 5 category tiles

Current: 22 horizontal overflow pills (Agents, Alignment, Attention, Behavioral, Caching...)

Target: 5 topic tiles in a 2+3 or 3+2 grid

```
[ RAG & Retrieval · 48q ] [ Agents & Systems · 52q ] [ Evals & Metrics · 41q ]
         [ LLM Fundamentals · 67q ]    [ Production & Serving · 53q ]
```

Each tile: count badge, 2-line description, hover lift. "All Topics" is the default state (all tiles unselected = all active). Click a tile to filter. Multi-select allowed.

### Sidebar score badge (returning users)

Below each mode label in the sidebar, a 1-line stat for returning users:
- Assess: "Last: 74% · 3d ago"
- Interview Strategy: "In progress: Day 3 of 7"
- Company Tracks: "AI-Native: 18/28"

Sourced from localStorage. Invisible on first visit.

---

## 5. Cold Visitor Journey (First 60 Seconds)

```
1. Land on PrepLab from Home CTA "Test your readiness →"
2. See sidebar: Assess / Interview Strategy / Company Tracks
3. "Assess" is obvious first action — no context required
4. Configure screen: "How interview-ready are you?" + 3 simple selectors
5. First question: concrete, production-level, HARD badge, left red accent
6. Q1–3: user calibrates — "this is harder than I expected" or "I know this"
7. Q5–7: user starts to see their gap forming
8. Q10: user is invested. They've answered 10 questions. Results are forming.
9. Q11: gate fires with partial results visible — score by topic, top gap identified,
   "Unlock to see your complete breakdown and study plan"
10. Cold visitor who doesn't unlock: still got value (10 free questions + gap signal)
    Cold visitor who unlocks: enters the paid loop with investment, not cold
```

---

## 6. Returning User Journey

```
- Sidebar shows score badges from last session
- "Resume where you left off" if Interview Strategy was in progress
- Assess results show "vs. last session" comparison
- Weakness data from `gsl-preplab-history` surfaces inline in results — not as a separate mode
```

---

## 7. Depth Signal — Question Data Layer

Each question needs these fields (additive — existing questions unchanged until migrated):

```js
{
  id: "eval-12",
  topic: "evaluation",
  difficulty: "hard",                    // NEW: "easy" | "medium" | "hard"
  question: "What is the primary...",
  type: "mcq",
  options: [...],
  correct: 1,
  explanation: "ROUGE measures...",
  trap: "Saying 'ROUGE is fine for summarization.' ...",  // NEW: amber callout
  source: "Google DeepMind Round 1, May 2026",           // NEW: interview attribution
  cluster: "eval-metrics",              // NEW: for Weakness Map grouping
  gated: false
}
```

**Rollout priority for new fields:**
1. `difficulty` — all 261 questions (enables difficulty filter + card accent color)
2. `trap` — top 50 hardest questions first (UPGRADES.md entry already spec'd)
3. `source` — questions with known company attribution (start with ~30 well-sourced)
4. `cluster` — all questions (replaces topic for Weakness Map grouping)

---

## 8. Technical Spec

### File changes

```
src/PrepLab.jsx
  — Remove: DefenseDocMode component
  — Remove: WeaknessHeatmapMode component
  — Remove: standalone TrainerMode from sidebar (keep component, invoke from Assess results)
  — Rename: ExamMode → AssessMode (full component rewrite per spec)
  — Rename: InterviewPrepMode → InterviewStrategyMode (add resume + round type + prior feedback)
  — Update: PREPLAB_SIDEBAR → 3 entries only (assess, strategy, archetype)
  — Update: CompanyTracksMode — upgraded card + drill context

src/data/preplabQuestions.js     [NEW — Rule 1, DECISIONS.md Section 8]
  — Extract QUESTIONS array from PrepLab.jsx
  — Add schema comment at top
  — Add difficulty field to all 261 questions (Sprint B)
  — Add trap field to top 50 hardest (Sprint C)
  — Add source field to ~30 sourced questions (Sprint C)

src/config/gating.js             [NEW — Rule 2, DECISIONS.md Section 8]
  — FREE_SESSION_LIMIT = 10
  — GATE_THRESHOLD = 0.30
  — COMMUNITY_CODE (moved from utils/accessCode.js)
  — Export GATED_MODES list

src/shared.jsx (or src/components/shared.jsx)  [NEW — Rule 3, DECISIONS.md Section 8]
  — CommonTrapCallout({ trap }) — amber chip component
  — ForwardPointerCard({ preplabTopic, gtPostId, onNavigate })
  — ProductionNoteChip({ note })
  — DifficultyBadge({ level }) — colored left-accent + pill
```

### State architecture (PrepLab.jsx)

Current: `mode` string drives top-level view. Keep this pattern.

```js
// Sidebar drives mode
const [mode, setMode] = useState(null)  // "assess" | "strategy" | "archetype"

// Assess mode state
const [assessPhase, setAssessPhase] = useState("config")  // "config" | "active" | "gated" | "results"
const [assessConfig, setAssessConfig] = useState({ duration: 30, focus: "all", difficulty: "mixed" })
const [assessSession, setAssessSession] = useState([])    // answered questions this session

// Interview Strategy state
const [stratPhase, setStratPhase] = useState(1)          // 1-4
const [stratInputs, setStratInputs] = useState({ jd: "", resume: "", days: 7, round: "technical", feedback: "" })
const [gapAnalysis, setGapAnalysis] = useState(null)

// Company Tracks state
const [selectedTrack, setSelectedTrack] = useState(null)
const [trackSession, setTrackSession] = useState([])
```

---

## 9. Sprint Sequencing

Sprints are ordered by impact-to-effort ratio. Each sprint is self-contained — ships value independently, doesn't require the next sprint to work.

---

### Sprint A — Naming + Visual Layer (no logic changes) `S effort`

**Goal:** The product looks and feels premium before a single line of logic changes. Cold visitor opens PrepLab and knows which mode to open within 5 seconds.

**What ships:**
1. Rename modes in `PREPLAB_SIDEBAR`: Combined Assessment → "Assess" (tag: EXAM), Interview Prep Plan → "Interview Strategy" (tag: STRATEGY), Defense Doc → hidden (not deleted, just removed from sidebar). My Weakness Map → hidden.
2. Add sidebar score badges: read `gsl-preplab-history` for Assess score, `gsl-rag-done` + strategy progress for Strategy.
3. Question card visual upgrade: `border-l-4` difficulty accent, difficulty chip `bg-red-950/50 text-red-400`, answer options `py-3 px-4` with hover border glow, selected state `border-violet-500 bg-violet-950/30`, Submit button `bg-violet-600`.
4. Topic selector: replace 22 pills with 5 category tiles (2+3 grid). Each tile: title + count + 2-line desc + hover lift.
5. Assess config screen copy: headline "How interview-ready are you?" replacing "Configure Exam". Add 2-line results preview below config.

**Files:** `src/PrepLab.jsx` only  
**Brace check required.** No new components. No data changes.

---

### Sprint B — Data extraction + difficulty field `S effort`

**Goal:** Questions live in their own file. Every question has a difficulty. The card accent and filter work.

**What ships:**
1. Extract `QUESTIONS` array to `src/data/preplabQuestions.js`. Add schema comment. `PrepLab.jsx` imports it.
2. Add `difficulty: "easy"|"medium"|"hard"` to all 261 questions (bulk pass — estimate 45 min of content work).
3. Wire difficulty to card left-accent color and chip color in question render.
4. Wire difficulty to "Hard Only" filter in Assess config and Trainer.

**Files:** `src/data/preplabQuestions.js` (new), `src/PrepLab.jsx` (import + difficulty render)  
**This is also the Rule 1 compliance pass from DECISIONS.md Section 8.**

---

### Sprint C — Common Trap layer + source attribution `M effort`

**Goal:** Questions teach, not just test. After reveal, the user knows exactly what to say and what not to say.

**What ships:**
1. Add `trap` field to top 50 hardest questions in `preplabQuestions.js` (content work ~2h).
2. Add `source` field to ~30 questions with known interview attribution (content work ~45 min).
3. Build `<CommonTrapCallout trap={q.trap} />` component in `src/shared.jsx` — amber `bg-amber-950/40 border-amber-800/50 text-amber-300` chip.
4. Render CommonTrapCallout in Assess review + Trainer after-reveal, conditionally if `trap` exists.
5. Render source attribution as subdued 1-liner below explanation if `source` exists.

**Files:** `src/data/preplabQuestions.js`, `src/shared.jsx` (new), `src/PrepLab.jsx`

---

### Sprint D — Assess results screen rebuild `M effort`

**Goal:** The results screen is the premium moment. Per-topic bars, gap forward pointers, session comparison.

**What ships:**
1. Full `AssessResultsView` component: score header, per-topic accuracy bars (from session data + `gsl-preplab-history`), "Strong / Gap / Critical" callout per topic.
2. Gap forward pointer per weak topic: 1 Lab scenario + 1 GT post + "Drill N questions" link. Static mapping: `TOPIC_TO_LAB` constant keying topic → scenario + GT post ID.
3. "vs. last session" comparison row if history exists.
4. Gate integration: partial results (Q1–10) visible free; full breakdown + forward pointers fire the gate at Q11+.
5. CTA at bottom: "Go to Interview Strategy →" pre-fills the identified gaps as starting point.

**Files:** `src/PrepLab.jsx` (AssessResultsView), `src/config/gating.js` (new — gate logic extracted)

---

### Sprint E — Interview Strategy mode rebuild `L effort`

**Goal:** The full JD→day plan pipeline with resume input, round type, prior feedback, and auto-detected progress.

**What ships:**
1. Add resume paste field + days-until-interview + round type + prior feedback to Phase 1.
2. Resume → skill coverage extraction (static text match against SKILL_KEYWORDS taxonomy).
3. Gap score formula: `jd_importance × (1 - self_rating) × round_multiplier × feedback_boost`. Self-rating only shown for gap topics.
4. Day plan output: day-by-day resource list (GT post + Lab module + PrepLab cluster), ordered by gap weight, filtered by round type.
5. "Download Your Brief" button: generates a printable one-page summary (replaces Defense Doc).
6. Auto-detection wiring: `genai_leaderboard`, `gsl-preplab-history`, `genai_gt_read` → auto-check plan steps.
7. Gate at 30% plan completion.

**Files:** `src/PrepLab.jsx` (InterviewStrategyMode rebuild), `src/config/gating.js` (GATE_THRESHOLD)

---

## 10. What Does NOT Change

- Question content — no questions are removed or replaced, only fields are added
- PrepLab routing from App.jsx — the `tab: "preplab"` navigation stays identical
- localStorage keys — all existing keys (`gsl-preplab-history`, `gsl-preplab-session`) are preserved and read by the new modes
- Company Tracks question data — same questions, upgraded presentation
- The gate code (`src/utils/accessCode.js`) stays until `src/config/gating.js` extraction in Sprint D

---

## 11. Success Criteria (Post-Revamp)

A cold visitor who lands on PrepLab after seeing the market signal on Home should:
- Understand which mode to open within 5 seconds (no deliberation)
- Complete a 10-question Assess session without guidance
- Leave with a specific gap identified ("I'm weak on evals")
- Know exactly what to do about it (Lab scenario + GT post + PrepLab cluster)
- Feel the product is worth paying for, even before the gate fires

A returning user should:
- See their progress without navigating to a separate mode
- Know if they've improved since last session
- Have a clear "continue here" path

*This spec is the source of truth. For sprint execution details, see NEXT.md. For architectural constraints, see DECISIONS.md. For the full question data schema, see `src/data/preplabQuestions.js` once Sprint B ships.*
