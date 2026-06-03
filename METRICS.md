# METRICS — What We Measure and What Success Looks Like

All analytics via PostHog (client-side, no backend). Events fire on user action and are visible in PostHog Live Events. Baselines are estimates — update this file when real numbers are available from the PostHog dashboard.

*Last updated: June 2026 (sprint 54)*

---

## Tracked Events

Events are fired via `track(eventName, properties)` in `src/analytics.js`.

| Event | Fired when | Key properties |
|---|---|---|
| `home_viewed` | Home page mounts | `returning` (bool) — true if `getActivityData().isReturning` |
| `returning_jump_back` | Returning user clicks a "Jump back in" tab pill | `tab` |
| `start_here_clicked` | Any hero/journey CTA clicked | `location` (hero_cta_primary / hero_cta_secondary / journey_strip) |
| `role_toggle` | Engineers / PMs / All toggle used | `role` |
| `stat_clicked` | Clickable stat on home page clicked | `stat` |
| `tab_viewed` | Any top-level tab opened | `tab` |
| `module_opened` | Systems or Agents module card clicked | `tab`, `moduleId` |
| `module_completed` | Mark-as-done toggled on a module | `tab`, `moduleId` |
| `post_opened` | GT post opened | `postId`, `category` |
| `search_query` | ⌘K search used | `query`, `result_count` |
| `feedback_clicked` | Feedback button clicked | `location` |
| `assessment_finished` | PrepLab timed exam completed | `score`, `total`, `mode` |
| `challenge_submitted` | RAG Lab config evaluated | `scenario_id`, `config_id`, `passed` |
| `continue_clicked` | "Continue where you left off" clicked | `tab`, `step` |
| `path_started` | Learning path first step clicked | `path_id` |
| `diagnosis_submitted` | LangSmith Diagnose tab — user submits span + root cause guess | `traceId`, `correct` (bool) |
| `moe_sim_run` | MoE Expert Simulator "Run Simulation" clicked | `numExperts`, `topK`, `batchSize`, `failureType` |
| `failure_triggered` | AgentConfigLab / ServingInfra config produces a named failure | `moduleId`, `failureId`, `taskType` |
| `forward_pointer_clicked` | Done-screen forward pointer button clicked | `moduleId`, `destination` (preplab / groundtruth) |
| `preplab_gate_shown` | PrepLab question 11 free-user gate fires during exam | `questionCount`, `mode` |
| `interview_brief_generated` | Interview Strategy step 4 brief generated | `role`, `round`, `topGapCount` |
| `company_track_started` | Company Tracks drill session started | `archetype` |
| `cold_signin_cta` | Cold home sign-in button clicked | `provider` (google / github) |
| `profile_wall_google` | Profile sign-in wall — Google button clicked | — |
| `profile_wall_github` | Profile sign-in wall — GitHub button clicked | — |
| `auth_sign_in` | User successfully signs in (SIGNED_IN event) | `provider` |
| `profile_area_click` | Readiness area bar clicked in Profile | `area` |
| `access_code_redeemed` | Access code submitted on Plans page | `valid` (bool) |
| `progress_synced_manual` | "Sync now" clicked in Profile | — |
| `theme_toggled` | Theme toggle clicked | `to` (dark / light) |
| `progress_exported` | Progress JSON export triggered | — |
| `progress_imported` | Progress JSON import completed | — |
| `bookmark_removed` | GT bookmark removed from Profile | `postId` |
| `signed_out` | Sign out clicked | — |

---

## Core Funnel

```
Landing (home_viewed)
    ↓
CTA click (start_here_clicked)
    ↓
Tab engaged (tab_viewed × any BUILD tab)
    ↓
Module opened (module_opened)
    ↓
Challenge submitted (challenge_submitted)
    ↓
Module completed (module_completed)
```

**The activation moment:** First `challenge_submitted` — this is when a user stops reading and starts doing. Everything before it is awareness; everything after is retention.

---

## Success Metrics

### Primary
| Metric | Definition | Target | Current estimate |
|---|---|---|---|
| Activation rate | % of home visitors who submit at least one challenge | — | unknown |
| Module depth | Average modules opened per session (non-bounce) | >2 | unknown |
| GT read-through | % of post_opened that scroll past 50% of post | — | unknown |
| PrepLab completion | % of PrepLab sessions that finish ≥10 questions | — | unknown |
| Return rate | % of users who visit on 2+ separate days | — | unknown |

### Secondary
| Metric | Definition |
|---|---|
| Most opened modules | Which `moduleId` values appear most in `module_opened` |
| Most read GT posts | Which `postId` values appear most in `post_opened` |
| Search zero-result rate | `search_query` events where `result_count = 0` |
| Path completion rate | Users who complete all steps of a learning path |
| Challenge pass rate | `challenge_submitted` events where `passed = true` |

---

## localStorage Keys (Client-Side State)

These are not PostHog events but are equally important for understanding user state.

| Key | What it tracks |
|---|---|
| `gsl-systems-done` | Set of completed Systems module IDs |
| `gsl-visited` | Set of visited top-level tab IDs |
| `gsl-leaderboard` | Array of challenge attempt records |
| `gsl-bookmarks` | Set of bookmarked GT post IDs |
| `gsl-streak` | Last visit date + streak count |
| `gsl-recently-viewed` | Array of recently opened GT post IDs |
| `gsl-gt-reactions` | Map of postId → reaction emoji |
| `gsl-gt-read` | Set of mark-as-read post IDs |
| `genai_role` | Selected role (engineers / pms / all) |
| `genai_beta_banner_dismissed` | Whether beta banner was dismissed |
| `preplab_spaced` | PrepLab spaced repetition state |
| `gsl-preplab-history` | Per-question attempt history — `{ [questionId]: { attempts: N, wrong: N } }` — used by WeaknessHeatmap + InterviewPrepMode |
| `gsl-concepts-mastery` | Set of completed Concepts module IDs — used by GymSelectorView progress bars + ReturningHomeView |
| `genai_visited_modules` | Array of recently visited tab IDs — used by ReturningHomeView "Jump Back In" |
| `genai_gt_read` | Set of GT post IDs opened — used by ReturningHomeView GT card seeding |
| `gsl-rag-done` | Set of RAG Lab scenario IDs completed — used by RAG Lab sidebar progress bar (sprint 23) |
| `gsl-preplab-exam-sessions` | Array of MCQ exam snapshots capped at 20 entries — `{ pct, tc, total, count, date }` — used by ExamMode session delta comparison (sprint 31D) |
| `gsl-preplab-strategy-phase` | Current interview strategy phase string (`"4"` when brief generated) — used by Interview Strategy 4-step flow (sprint 31E) |
| `accessGranted` | Boolean — set to `"true"` on valid access code entry — checked by `isAccessGranted()` in `src/utils/accessCode.js` |

**Planned keys (for cross-repo-inspired features — not yet implemented):**

| Key | What it tracks |
|---|---|
| `gsl-role-readiness` | Computed readiness % per role (AI Engineer / ML Engineer / AI PM) from PrepLab category performance |
| `gsl-weakness-heatmap` | Per-topic wrong rate map — `{ topicId: { correct: N, total: N } }` across all PrepLab sessions |
| `gsl-practice-heatmap` | 91-day practice history — `{ "YYYY-MM-DD": questionsAnswered }` for GitHub-style grid |
| `gsl-company-track` | Selected company prep track (e.g. "anthropic", "google", "openai") |

---

## What to Instrument Next

These are high-value signals not yet tracked:

| Signal | Why it matters |
|---|---|
| GT post scroll depth | Tells you if posts are read or just opened |
| Post reaction events (flush to PostHog) | Currently localStorage-only — no aggregate signal |
| Learning path step completion | Know where users drop off in each path |
| PrepLab wrong-answer topics | Which topic areas have the lowest correct rate |
| Time-on-module | Proxy for engagement depth |
| OG referrer (whatsapp / linkedin / twitter) | Know which sharing channel drives traffic |
| `concepts_tab_switched` | Which tabs inside Concepts modules get used — e.g. "Live Logit Shaper" vs "Match the Output" in TemperatureGame. Signals which interactive types land best |
| `concepts_failure_injected` | When user clicks "Inject failure" in RAGPipelineModule "What Breaks" tab. High-intent action indicating deep engagement |
| `concepts_traversal_played` | When user clicks Play in FlashAttentionConcept tile traversal. Tracks animation-based learning engagement |
| `concepts_similarity_queried` | When user changes query in EmbeddingModule similarity search tab. Tracks search exploration depth |

---

## Baseline Reference

*Fill in when PostHog data is available. These are the numbers to beat.*

| Metric | Baseline | Date set | Notes |
|---|---|---|---|
| Monthly unique visitors | — | — | PostHog dashboard |
| Avg session duration | — | — | PostHog dashboard |
| Most visited tab | — | — | tab_viewed by count |
| Most opened module | — | — | module_opened by count |
| Challenge pass rate | — | — | challenge_submitted.passed |
| Home → RAG Lab conversion | — | — | home_viewed → tab_viewed(lab) |

---

## How to Read the PostHog Dashboard

1. **Live Events** — verify new events are firing correctly after any analytics change
2. **Trends** — `tab_viewed` by `tab` property → which tabs get traffic
3. **Funnels** — `home_viewed → start_here_clicked → tab_viewed → challenge_submitted`
4. **Session Recordings** — watch real user paths (if enabled)
5. **Feature Flags** — `?preview=CODE` unlock is tied to PostHog if configured

---

## Decisions Made from Metrics (log these as they happen)

| Date | Signal | Decision |
|---|---|---|
| — | — | — |

*Update this table when a metric directly changes a product decision.*

---

## PostHog Verification Checklist

Run before every major build sprint. Owner: Avinash — verify via Vercel + PostHog dashboard.

### Setup check
- [ ] `VITE_POSTHOG_KEY` set in Vercel → Project Settings → Environment Variables
- [ ] `VITE_POSTHOG_HOST` set to `https://us.i.posthog.com`
- [ ] PostHog Live Events shows incoming events in past 24h
- [ ] `app: "genai-systems-lab"` tag present on all events

### WAU check (last 30 days)
- PostHog → Insights → New insight → count of `home_viewed` events grouped by week
- Record: WAU trend (growing / flat / declining?)
- **Gate:** minimum 10 WAU before new content sprint is justified

### Module visit breakdown
- PostHog → Insights → `module_opened` events, segment by `module_id`
- Record: top 5 modules by count over last 30 days

### RAG Lab completion rate
- `challenge_completed` count ÷ `rag_lab_opened` count × 100
- **Target:** >20% indicates real engagement

### PrepLab session depth
- Average questions answered per session from `gsl-preplab-history` localStorage
- **Healthy:** 3–5q per session. Red flag: <1q per session = leaky funnel

### Decision gate
- WAU <10 or completion <15% → next sprint = **distribution focus**, not content
- WAU >10 AND completion >20% → proceed with content sprint
