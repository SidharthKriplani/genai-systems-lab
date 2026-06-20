# ECOSYSTEM_LEDGER.md — Cross-Lab State File

Shared state across all projects. Append-only. Never rewrite existing entries.

**Lab prefixes:** GSL (GenAI Systems Lab) · LNK (LinkedIn) · PAL (Product Analytics Lab) · MSL (ML Systems Lab) · CTL (Project Controller / Avinash)

**Status marks:** ✓ done · → next · ⊥ blocked · ! warning · ? open

**Skip rules for any session opening this file:**
1. Read STATE BOARD in full (~50 lines).
2. Read DECISION entries newer than the last DEC code you wrote.
3. Read MESSAGES addressed to you or ALL.
4. Skip everything else.

---

## STATE BOARD

*Updated: June 21 2026 (sprint 79)*

| Lab | Status | Active work | Blocker | Last commit |
|---|---|---|---|---|
| GSL | → LinkedIn launch infra complete | Sprint 80: LinkedIn voice pass P0 | Push pending (user action) | `ba27ef8` |
| LNK | ⊥ voice pass | 20 posts drafted Wks 1–4, 51 cards built | Voice/humanize pass on all 20 posts before Mon Jun 22 launch | — |
| PAL | ? unknown | Not in active sprint | — | — |
| MSL | ? unknown | Not in active sprint | — | — |

**GSL current surface status (GREEN = safe to link from LinkedIn):**
- GREEN: home page (RAG Lab guest CTA now live), `/agents` `/retrieval` `/evaluation` `/production` `/foundations` `/preplab` landing pages, RAG Lab Scenario 1
- YELLOW (screenshots only, no link): GT posts, PrepLab cards, Systems modules, Learning Paths, Browse Mode
- RED (no exposure): Mastery Room, Agent/Eval/Prompt/FM Labs (require sign-in)

**GSL scale:** 597 PrepLab questions · 310 GT index entries · 318 static GT pages (SSR, Google-indexed) · 6 PrepLab modes · 13 GT series · 6 challenge area landing pages · 2 learning paths

**Pending manual actions (CTL):**
- `git push origin main` on GSL — commits `208d76d`, `6512b94`, `ba27ef8` not yet pushed
- Submit `sitemap.xml` in Google Search Console Sitemaps tab after Vercel deploy
- Supabase SQL: run `supabase_study_tables.sql` to unblock Mastery Room (staged since sprint 60)
- LinkedIn: voice pass on all 20 posts, export carbon screenshots, schedule Wk 1 at 8am IST

---

## DECISION LEDGER

*One line per cross-lab decision. Reference by code (DEC-001) instead of re-explaining.*

| Code | Date | Scope | Decision |
|---|---|---|---|
| DEC-001 | Jun 2026 | CTL→ALL | One unified chat for all labs + LinkedIn. No more per-lab separate sessions. Spine files (CLAUDE.md, NEXT.md) are persistence layer. See GSL DECISIONS.md §15. |
| DEC-002 | Jun 2026 | CTL→ALL | ECOSYSTEM_LEDGER.md is the cross-lab async state file. STATE BOARD replaces per-session re-discovery. Plain English only — no compressed DSL or invented notation (tokenizes worse, not better). |
| DEC-003 | Jun 2026 | GSL+LNK | RAG Lab Scenario 1 is GREEN for LinkedIn linking. Home page guest CTA fix shipped (`208d76d`). First linkback slot: Week 3 Wed (RAG failures carousel), first comment only. |
| DEC-004 | Jun 2026 | LNK | LinkedIn cadence: 5 posts/week Mon–Fri, 8am IST. Problem-of-Day (carbon) ×3 + carousel ×1 + reuse/career ×1. No external links in body — first comment only and only when BOTH: (a) direct lab counterpart exists, (b) post has already proved it lands OR it's a weekly kit. Cap 1–2 GSL linkbacks per week. |
| DEC-005 | Jun 2026 | GSL | SSR pre-render strategy: Node vm script at build time, not vite-ssg. Avoids JSX/bundler dependency. 318 static pages generated, gitignored, rebuilt on every Vercel deploy. See scripts/prerender-gt.js. |
| DEC-006 | Jun 2026 | GSL | Google Search Console: HTML meta tag method only. DNS TXT record fails for vercel.app domain (Vercel owns it). URL prefix property, not domain property. |

---

## MESSAGE THREAD

*Format: DATE · FROM→TO · message. Addressed party reads + optionally replies below.*

---

**2026-06-21 · GSL→LNK**

LinkedIn folder reviewed. 20 posts drafted Wks 1–4 are solid — post anatomy, character counts, and content quality are good. Three things blocking Mon launch:

1. Voice pass (stage 7) is pending on ALL 20 posts. This is the human-touch step. Do it before scheduling.
2. Carbon screenshots not yet exported for Week 1 code posts (4 posts).
3. HTML cards need PNG export before Wed carousel slot (Week 1 Wed = A/B stats traps carousel).

First natural GSL linkback: Week 3 Wed (RAG failures carousel), first comment. Not weeks 1–2 — those are pure credibility-building with no GSL link. This is correct strategy.

RAG Lab is now GREEN for linking (guest CTA live after sprint 79 push). Home page routes guest to Scenario 1 in one click.

---

**2026-06-21 · CTL→ALL**

Architecture decision: one unified chat from here. Mount all relevant folders per session. ECOSYSTEM_LEDGER.md is the async handoff. Each lab's CLAUDE.md + NEXT.md still owns per-project state. This file is for cross-project decisions and status only.

No DSL, no compressed notation. Plain English + skip-rules = enough.

---
