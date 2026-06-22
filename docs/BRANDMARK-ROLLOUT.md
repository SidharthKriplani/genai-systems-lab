# BRANDMARK ROLLOUT — the BreakLabs logo across all four labs

_Created 2026-06-23. HQ spec (D-13). One shared instruction for **GAL/GSL · PL · PAL · MSL** — the only per-lab variable is the **descriptor** (the lab's name in the lockup). Implements the logo unification flagged in `BRAND.md` + `LINEAGE.md`. Decision: **D-19 (co-brand lockup)**. Asset rules: `BRAND.md`. Sharing mechanism: copy-and-adapt (D-16)._

> **Why this exists.** Grep on 2026-06-23 confirmed **no lab renders the BreakLabs wordmark today** — current favicons/OG images predate the unified brand, and there's no shared logo component anywhere. This is net-new (author once, copy to each), not a migration of an existing component.

## The decision (D-19) — Option 1, co-brand lockup

Every surface leads with the master wordmark `break⌇labs`, then the lab's own name. One brand, distinct rooms. The wordmark + the red fault-glyph + the descriptor styling are **identical across all four labs** — only the descriptor *text* changes. That sameness is the whole point (max BreakLabs repetition; the mantra, D-14).

**Descriptor per lab (the only variables — text + accent):**

| Lab | repo | descriptor text | descriptor accent (BRAND.md track accent) |
|---|---|---|---|
| PAL | product-analytics-lab | `Product Analytics` | indigo `#6366F1` |
| MSL | ml-systems-lab | `ML Systems` | gold `#F0A500` |
| GAL / GSL | genai-systems-lab | `GenAI Systems` | cyan `#22D3EE` |
| PL | programming-lab | `Programming` | violet `#8B5CF6` |

The wordmark + red seam are **constant everywhere** (the unity); the descriptor takes the **lab's track accent** (BRAND.md "track accents — wayfinding only"), so each lab is unified *and* identifiable.

## The component — `BrandMark` (build it identically in each lab)

Three variants from one component. **Constant everywhere (do NOT change):** seam = brand red `#FB5247`; wordmark = the lab's near-white `--ink-hi`; font = the lab's `--font-mono`. **Per-lab:** the `descriptor` text + its `accent` colour (the lab's track accent from the table above). The seam is the fault-glyph splitting `break` | `labs`.

```jsx
// BrandMark.jsx — canonical BreakLabs lockup (D-19). House rule: single quotes.
// Constant: seam red + wordmark. Per lab: descriptor text + accent (pass your track accent).
const SEAM = '#FB5247';   // brand red — the fault-glyph (constant)

function Seam({ h = 28 }) {
  const w = Math.round(h * 0.32);
  return (
    <svg width={w} height={h} viewBox='0 0 11 34' aria-hidden='true' style={{ margin: '0 1px', flex: '0 0 auto' }}>
      <path d='M6 2 L3 11 L9 17 L3 23 L6 32' fill='none' stroke={SEAM} strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

// variant: 'full' (wordmark + descriptor) | 'wordmark' | 'monogram'
// accent: the lab's track accent hex (PAL #6366F1 · MSL #F0A500 · GAL #22D3EE · PL #8B5CF6)
export function BrandMark({ variant = 'full', descriptor = '', accent = '#F0A500', size = 28 }) {
  if (variant === 'monogram') {
    return (
      <span aria-label='BreakLabs' style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: Math.round(size * 0.24),
        background: 'var(--surface, #15171A)', border: '1px solid var(--rim, #2A2D31)' }}>
        <Seam h={Math.round(size * 0.62)} />
      </span>
    );
  }
  return (
    <span aria-label={descriptor ? `BreakLabs ${descriptor}` : 'BreakLabs'}
      style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)',
        fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink-hi, #F2F3F5)', fontSize: size }}>
      break<Seam h={size} />labs
      {variant === 'full' && descriptor && (
        <>
          <span style={{ color: 'var(--ink-low, #5F5E5A)', margin: '0 0.4em' }}>·</span>
          <span style={{ color: accent }}>{descriptor}</span>
        </>
      )}
    </span>
  );
}
```

_Adapt only the token **names** to your lab's CSS vars if they differ (`--ink-hi`, `--ink-low`, `--surface`, `--rim`, `--font-mono`). Do NOT change the seam red or the wordmark colour — that's the cross-lab constant. Pass your lab's track accent for the descriptor._

## The degrade rule (so the long lockup never breaks layout)

- **Wide / expanded nav:** `full` (wordmark + descriptor).
- **Narrow / collapsed nav:** `wordmark` (drop the descriptor; the lab name falls to the page/tab title).
- **Tiny (favicon, avatar, busy headers):** `monogram` (the red glyph alone).

This makes Option 1 a superset — it *becomes* "wordmark only" when space is tight, so it never overflows.

## Placement checklist — same slots in every lab

| # | Slot | Variant | Note |
|---|---|---|---|
| 1 | Sidebar / nav header (top) | `full` → degrades | the primary in-app mark. In MSL this rides the nav reframe |
| 2 | Favicon / browser tab | `monogram` | replace each lab's current `favicon.svg`; archive the old one |
| 3 | OG / social share card | wordmark + descriptor | rebrand each `og-image` (1200×630, BRAND.md presets) |
| 4 | Signed-out landing / hero | `wordmark` (large) | brand-forward |
| 5 | Sign-in modal + paywall/gate header | `wordmark` | brand at the pay moment |
| 6 | Footer | `wordmark` + "part of BreakLabs" | |
| 7 | Loading / splash + 404 / empty | `monogram` | |
| 8 | Newsletter / email header (Career OS, growth) | `wordmark` | not a lab surface — do when those ship |

Slots 1–7 are in scope for each lab now. Don't block on slot 8.

## Per-lab timing (the only other difference)

- **PAL** — owns the canonical UI; build `BrandMark` here first (this exact spec), wire slots 1–7. Descriptor `Product Analytics`.
- **MSL** — **fold slot 1 into the nav reframe already queued in `NEXT.md`** (the reframe rebuilds the sidebar anyway — don't touch nav twice). Do slots 2–7 in the same pass. Descriptor `ML Systems`.
- **GAL/GSL** — standalone small pass (its reframe hasn't run yet). Slots 1–7. Descriptor `GenAI Systems`.
- **PL** — already inherited PAL's `Sidebar` at B0; just add `BrandMark` into that header + slots 2–7. Descriptor `Programming`.

## Rules (every lab)

- **Archive, never delete (D-18):** old `favicon.svg` / `og-image.*` → `_legacy/`. Git-tag before the swap.
- **House syntax:** single quotes, escape apostrophes, no template literals in data files.
- **Build:** macOS-only build-verify; **approve-first / never auto-push** (prepare commands, Sidharth runs them); `rm -f .git/index.lock .git/HEAD.lock` before staging; full repo path.
- Write the lab's own STATUS/LINEAGE on close.

_Verify after: every slot shows the lockup; favicon shows the glyph; the descriptor reads correctly per the table; the lockup degrades (not overflows) on a narrow sidebar; greyscale-legible (BRAND QA gate)._
