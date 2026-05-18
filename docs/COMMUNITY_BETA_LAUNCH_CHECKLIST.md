# Community Beta Launch Checklist

## 1. Analytics setup

- [ ] Create a PostHog account at https://posthog.com (free tier is sufficient)
- [ ] Create a new project → copy the Project API Key
- [ ] In Vercel dashboard → Project Settings → Environment Variables, add:
  ```
  VITE_POSTHOG_KEY = phc_your_key_here
  VITE_POSTHOG_HOST = https://us.i.posthog.com
  ```
- [ ] Redeploy on Vercel (trigger via `git push` or manual redeploy)
- [ ] Verify events arrive in PostHog Live Events view by visiting the app yourself

**Events wired:**

| Event | Fired when |
|---|---|
| `home_viewed` | Homepage loads |
| `start_here_clicked` | Hero CTA or journey Begin → clicked |
| `module_opened` | Any tab navigated to |
| `rag_lab_opened` | RAG Lab tab opened |
| `evaluate_configuration_clicked` | Evaluate button clicked in RAG Lab |
| `challenge_completed` | Challenge passed in RAG Lab |
| `feedback_clicked` | Any feedback button clicked (location property tells you which) |

---

## 2. Feedback form setup

- [ ] Go to https://forms.google.com and create a new form
- [ ] Add these questions (in order):

  1. Your background *(multiple choice)*: Student / Analyst / Engineer / PM / Founder / Other
  2. Which module did you try? *(short answer)*
  3. What was most useful? *(paragraph)*
  4. What was confusing? *(paragraph)*
  5. Would you share this with someone learning GenAI systems? Why / why not? *(paragraph)*
  6. Can we quote your feedback publicly? *(multiple choice)*: Yes, with my name / Yes, anonymously / No
  7. Optional: email for follow-up *(short answer, not required)*

- [ ] Copy the shareable form URL (the /viewform link, not the edit link)
- [ ] In Vercel → Environment Variables, add:
  ```
  VITE_FEEDBACK_URL = https://forms.gle/your_form_id
  ```
- [ ] Redeploy
- [ ] Test all feedback buttons open the correct form in a new tab

---

## 3. Privacy note checklist

- [ ] Privacy note is visible in the homepage footer (already implemented)
- [ ] No personal data is sent to PostHog — verify in `src/analytics.js` sanitize_properties
- [ ] PostHog autocapture is disabled (already set in analytics.js)
- [ ] Feedback form question 7 (email) is marked as optional
- [ ] Form response data is only accessible to you (Google Forms default)

---

## 4. Pre-launch copy review

Beta banner (homepage):
> "Community beta: this lab is free while we improve it. Try a module, break something, and tell us what confused you."

Privacy note (footer):
> "This app uses lightweight analytics to understand which modules are useful. No login is required. Feedback is optional. Do not submit sensitive personal information in the feedback form."

---

## 5. Where to share

Post in this order for maximum signal before noise:

1. **Hacker News Show HN** — highest quality signal, engineers, GitHub stars
   - Title: `Show HN: GenAI Systems Lab – interactive RAG/agent failure simulator, zero backend`
   - Post on a weekday between 8am–10am ET
2. **LinkedIn** — AI engineers, PMs, product people
   - Tag the lab URL, mention the zero-login angle, show a screenshot of RAG Lab
3. **r/MachineLearning** and **r/learnmachinelearning**
4. **Twitter/X** — tag AI practitioners, use #RAG #LLMOps #AIEngineering
5. **Latent Space Discord** — `#show-and-tell` channel
6. **AI Builders / Lenny's community** if you have access
7. **Product Hunt** — use as a "launch moment" once you have initial traction

---

## 6. What to monitor in week 1

In PostHog, build a simple dashboard:

| Metric | What it tells you |
|---|---|
| `home_viewed` count | Total reach |
| `start_here_clicked` / `home_viewed` | Hero CTA conversion rate |
| Top `module_opened` values | Which tabs people actually use |
| `evaluate_configuration_clicked` count | RAG Lab engagement |
| `challenge_completed` count | Deep engagement rate |
| `feedback_clicked` / `home_viewed` | Feedback funnel |

Red flags to watch:
- High `home_viewed`, very low `start_here_clicked` → hero copy not landing
- High `module_opened` for one tab only → other tabs not being discovered
- Zero `evaluate_configuration_clicked` → RAG Lab is being skipped

---

## 7. 7-day feedback review process

**Day 1–3:** Share everywhere. Don't read feedback yet — let it accumulate.

**Day 4:** First review pass
- Open Google Form responses
- Look for pattern words: "confusing", "unclear", "didn't understand", "how do I"
- Note which modules come up most
- Do NOT change anything yet

**Day 5:** Triage
- Categorize feedback: Bug / Clarity / Missing feature / Praise
- Bugs: fix immediately
- Clarity issues: schedule as quick copy/label fixes
- Missing features: log in a `FEEDBACK_LOG.md`, don't act on yet

**Day 7:** Ship one fix
- Pick the single highest-signal clarity fix and ship it
- Reply to anyone who left an email thanking them and noting what changed

**Repeat weekly** until the feedback pattern shifts from "confusing" to "missing X feature" — that's the signal that the UX is solid enough to think about monetization.

---

## 8. Vercel deployment steps

```bash
# After setting env vars in Vercel dashboard:
git add -A
git commit -m "launch: analytics, feedback buttons, beta banner, privacy note"
git push

# Vercel auto-deploys on push to main.
# If env vars were just added, trigger a manual redeploy:
# Vercel dashboard → Deployments → Redeploy latest
```

To test locally with analytics:
```bash
cp .env.example .env.local
# Fill in VITE_POSTHOG_KEY and VITE_FEEDBACK_URL
npm run dev
```

To confirm build works without env vars:
```bash
npm run build
# Should succeed. Analytics simply won't fire. Feedback buttons show placeholder URL.
```
