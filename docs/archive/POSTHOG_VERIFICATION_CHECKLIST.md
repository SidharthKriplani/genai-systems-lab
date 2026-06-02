# PostHog Distribution Check Checklist

**Status:** Ready to verify when Vercel/PostHog access is available

**Date to run:** Before starting next major build sprint

**Owner:** (Avinash — verify via Vercel + PostHog dashboard)

---

## What to Check

### 1. Events Flow Status
- [ ] Verify `VITE_POSTHOG_KEY` is set in Vercel environment variables
- [ ] Verify `VITE_POSTHOG_HOST` is set (should be `https://us.i.posthog.com`)
- [ ] Check PostHog Live Events view for incoming events in past 24h
- [ ] Confirm `app: "genai-systems-lab"` tag present on all events

### 2. Weekly Active Users (WAU) — Last 30 Days
- [ ] Navigate to PostHog → Insights → New insight
- [ ] Create: count of `home_viewed` events grouped by week, last 30 days
- [ ] Record: WAU trend (is it growing, flat, or declining?)
- [ ] Baseline: minimum 10 WAU needed before new content sprint is justified

### 3. Module Visit Breakdown — Top 5
- [ ] PostHog → Insights → `module_opened` events
- [ ] Segment by property: `module_id`
- [ ] Top 5 by count over last 30 days
- [ ] Record: which labs/modules are actually being visited?

### 4. RAG Lab Scenario Completion Rate
- [ ] PostHog → filter: `challenge_completed` events
- [ ] Count total over last 30 days
- [ ] Divide by total `rag_lab_opened` events
- [ ] Completion rate = (challenge_completed / rag_lab_opened) × 100
- [ ] Target: >20% completion rate indicates engagement

### 5. PrepLab Session Depth
- [ ] PostHog → Insights → custom query
- [ ] Average questions answered per user session (from `gsl-preplab-history` localStorage)
- [ ] Or: count of `evaluate_configuration_clicked` events per `home_viewed` session
- [ ] Record: average depth (3-5q per session is healthy, <1q per session = leaky funnel)

---

## Decision Gate

**If WAU < 10 or completion rate < 15%:**
→ Next sprint should be **distribution/sharing focus**, not content building

**If WAU > 10 AND completion rate > 20%:**
→ Proceed with next major content sprint

---

## Notes

- Analytics are optional (app works without PostHog key)
- All event calls fail silently if key is missing
- No personal data is collected (see sanitize_properties in `src/analytics.js`)
