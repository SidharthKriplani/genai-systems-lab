# METRICS — What We Measure and What Success Looks Like

All analytics via PostHog (client-side, no backend). Events fire on user action and are visible in PostHog Live Events. Baselines are estimates — update this file when real numbers are available from the PostHog dashboard.

*Last updated: May 2026*

---

## Tracked Events

Events are fired via `track(eventName, properties)` in `src/analytics.js`.

| Event | Fired when | Key properties |
|---|---|---|
| `home_viewed` | Home page mounts | — |
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
