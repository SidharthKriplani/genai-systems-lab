# Mastery Room — Build State

Private FSRS spaced repetition study room. Built in sprint 60 (June 2026). **NOT YET LIVE** — staged but not committed.

---

## Files written (staged, not committed)

| File | Status | What it does |
|---|---|---|
| `src/utils/fsrs.js` | staged | FSRS-4.5 algorithm — stability, difficulty, interval math |
| `src/studySeed.js` | staged | 367 Anki cards (120 LLM Foundations / 168 RAG & Retrieval / 79 LLMOps) |
| `src/StudyRoom.jsx` | staged | Hub + study view, card flip, 4-grade grading, session tracking |
| `src/App.jsx` | staged | Lazy import + `study` route + owner-only 🧠 nav badge |

Supabase SQL written to: `/Users/ASUS/Documents/Professional/Anki Files/active work (claude)/batch 1/supabase_study_tables.sql`

---

## Pending — must do before it works

### Step 1: Run SQL in Supabase dashboard
Open Supabase → SQL Editor → paste `supabase_study_tables.sql` → Run.
Creates: `study_cards`, `study_reviews`, `study_sessions` with RLS (`auth.uid() = user_id`).

### Step 2: Commit and push from your terminal
```bash
cd "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/genai-systems-lab"
git commit -m "feat: private mastery room — FSRS spaced repetition study system"
git push
```
(sandbox can't remove `.git/HEAD.lock` on macOS FUSE mount — must commit from host)

### Step 3: First-time seed (in-app)
- Sign in as `claudesubscription12@gmail.com`
- Click 🧠 in nav top-right → Mastery Room
- Click "Import 367 cards →" — inserts seed cards with your `user_id` via Supabase client
- Done — due cards appear immediately

---

## How it works

- **Route**: `topView === "study"` → `<StudyRoom user={user} onNavigate={navigate} />`
- **Auth gate**: `user.email === "claudesubscription12@gmail.com"` — anyone else sees a lock screen
- **Data gate**: Supabase RLS — `study_cards` row is only readable by the inserting `user_id`
- **Algorithm**: FSRS-4.5 — grades 1-4 (Again/Hard/Good/Easy), interval computed from stability + 90% retention target
- **Keyboard**: Space/Enter to flip, 1-4 to grade
- **Seed source**: lane7 (LLMs, all 120), lane1 (retrieval subset, 168), lane3 (LLMOps subset, 79)

---

## Not yet built (optional future work)

- Stats/history view (cards reviewed per day, accuracy by module)
- Add new cards from within the app (manual front/back entry)
- Import more lanes (lane8 experimentation, lane5 probability)
- Due badge count in nav (fetch count on mount, show next to 🧠)
- Mobile sidebar entry point
