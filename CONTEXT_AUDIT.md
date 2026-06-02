# CONTEXT_AUDIT.md — Claude Context Limit Prevention Guide

Applies to all three sibling labs: **GAL** (genai-systems-lab), **MSL** (ml-systems-lab), **PAL** (experimentation-systems-lab).

The 1M token context limit is real and hits repeatedly when large source files + a long CLAUDE.md + conversation history accumulate in the same session. This doc explains how to detect the problem and fix it before it causes incomplete work.

---

## How the limit gets hit

Claude reads files into its context window. Every file read in a session stays in context for the rest of that session. The token count compounds:

```
CLAUDE.md (full sprint log)     ~80–120k tokens
Large source files (read once)  ~100–225k tokens each
Conversation history            grows ~5–10k tokens per exchange
```

A session that reads two large files + has a 30-message conversation can hit 600–800k tokens before any new code is written. Adding a third file pushes it over.

---

## Step 1 — Run the file size audit

Run this in each repo root to find the token hogs:

```bash
wc -l src/*.jsx src/*.js src/systems/*.jsx src/data/*.js src/config/*.js src/rooms/*.jsx 2>/dev/null | sort -rn | head -20
```

### Danger thresholds

| Lines | Token estimate | Action |
|---|---|---|
| > 10,000 | > 150k tokens | Never read in full. Always Grep first. |
| 5,000–10,000 | 75–150k tokens | Read only the section you need (use offset + limit). |
| < 5,000 | < 75k tokens | Safe to read in full. |

---

## Step 2 — Audit each lab

### GAL (genai-systems-lab) — STATUS: FIXED (June 2026)

Known hogs and their fix status:

| File | Lines | Fix |
|---|---|---|
| `src/systems/modules.jsx` | 15,012 | Never read in full. Use `Grep` for component name, then read that section. |
| `src/groundTruthPosts.js` | 11,937 | Never read in full. Grep for `"post-id"` then read ±50 lines. |
| `src/Concepts.jsx` | 8,008 | Read in full only when building a new Concepts module. |
| `CLAUDE.md` | **371** (was 587) | Fixed: sprints 1–37 moved to `HISTORY.md`. |

**Rule:** Do not read `groundTruthPosts.js` or `systems/modules.jsx` in full. Ever.

---

### MSL (ml-systems-lab) — NEEDS AUDIT

**Run the audit command**, then check against these expected hogs:

- **Scenario data files** — MSL has 200+ scenarios. If they're in a single JS/JSX file, it's likely 10,000+ lines.
- **CLAUDE.md** — If it has sprint logs, check line count. Anything over 400 lines is worth trimming.
- **Component files** — any file housing multiple lab rooms in one file is a risk.

**Fix pattern:**
1. `wc -l src/*.jsx src/*.js | sort -rn | head -10`
2. Any file > 8,000 lines → add a rule: "Never read in full. Grep first."
3. CLAUDE.md > 400 lines → create `HISTORY.md`, move old sprint logs, keep only last 3–4 sprints inline.

**Specific things to check for MSL:**
- Does `CLAUDE.md` embed full sprint logs? If yes, split at sprint -4 (keep 4 most recent, archive the rest).
- Are scenario data arrays in a single massive file? If yes, add the Grep-first rule to CLAUDE.md.
- Does the session opening checklist say "read all files"? If yes, scope it to: CLAUDE.md + NEXT.md only.

---

### PAL (experimentation-systems-lab) — NEEDS AUDIT

**Run the audit command**, then check these:

- **Room/question data** — PAL has 17 rooms + question banks. If question data is inline in JSX, it's a risk.
- **CLAUDE.md** — Same check as MSL.
- **Article/post content files** — PAL's Playbook articles may be embedded in a JS data file.

**Fix pattern:** Same as MSL above.

**Specific things to check for PAL:**
- Is there a `questions.js` or `articles.js` with all content inline? If > 5,000 lines, add Grep-first rule.
- Does PAL's CLAUDE.md have a sprint log going back to origin? Split it.
- Check if Supabase-related files are large (schema migrations, etc.).

---

## Step 3 — Fix CLAUDE.md in any lab

If `CLAUDE.md` is over 400 lines, do this once:

```bash
# Check line count
wc -l CLAUDE.md

# Find where sprint log starts
grep -n "## Session build log\|Resolved this session\|sprint [0-9]" CLAUDE.md | head -10
```

Then:
1. Create `HISTORY.md`
2. Copy everything older than 4 sprints into it
3. Replace that content in `CLAUDE.md` with: `*Sprints 1–N archived in HISTORY.md.*`
4. Commit both files

---

## Step 4 — Operating rules (add to each lab's CLAUDE.md)

These rules prevent the problem from recurring. Add them to the "Critical rules" or session checklist section of each lab's CLAUDE.md:

```
CONTEXT LIMIT PREVENTION:
1. Never read any file > 8,000 lines in full.
   Use Grep to find the section, then Read with offset+limit.
   
2. Files that are always Grep-first (update per lab):
   GAL: src/systems/modules.jsx, src/groundTruthPosts.js
   MSL: [add your large files here after audit]
   PAL: [add your large files here after audit]

3. One batch per session.
   Never plan 6 batches and try to fit them in one context.
   Each batch = fresh session = fresh context.

4. Session open: read CLAUDE.md + NEXT.md only.
   Do NOT proactively read source files before knowing
   exactly which function/section you need.

5. CLAUDE.md stays under 400 lines.
   Anything older than 4 sprints goes in HISTORY.md.
```

---

## Step 5 — Verify the fix worked

After trimming CLAUDE.md and adding the rules, a new session should:
- Open CLAUDE.md + NEXT.md: ~50–80k tokens total (was 120k+)
- Grep a large file to find a section: ~1k tokens (was 150k+)
- Have headroom for 40–50 conversation exchanges before the limit

**Token budget rule of thumb:** If you're past message 20 in a session and haven't hit 50% of the work, start a new session rather than pushing through. The quality of Claude's output degrades as context fills up — it starts missing things at the edges.

---

## Quick reference — per-lab file audit commands

```bash
# GAL
cd ~/Documents/GitHub/genai-systems-lab
wc -l src/*.jsx src/*.js src/systems/modules.jsx src/data/*.js src/config/*.js 2>/dev/null | sort -rn | head -15

# MSL
cd ~/Documents/GitHub/ml-systems-lab
wc -l src/*.jsx src/*.js 2>/dev/null | sort -rn | head -15

# PAL
cd ~/Documents/GitHub/experimentation-systems-lab
wc -l src/*.jsx src/*.js 2>/dev/null | sort -rn | head -15
```

---

*Last updated: June 2026 — GAL fix applied. MSL and PAL audits pending.*
