// BrandMark.jsx — canonical BreakLabs lockup (D-19, HQ/BRANDMARK-ROLLOUT.md).
// House rule: single quotes. Constant everywhere: seam red + wordmark colour + mono font.
// Per-lab (GSL): descriptor = 'GenAI Systems', accent = cyan '#22D3EE' (the lab track accent).
// Token mapping for GSL lives in index.css (--ink-hi / --ink-low / --rim / --font-mono).

const SEAM = '#FB5247';   // brand red — the fault-glyph (constant, do NOT change)

function Seam({ h = 28 }) {
  const w = Math.round(h * 0.32);
  return (
    <svg width={w} height={h} viewBox='0 0 11 34' aria-hidden='true' style={{ margin: '0 1px', flex: '0 0 auto' }}>
      <path d='M6 2 L3 11 L9 17 L3 23 L6 32' fill='none' stroke={SEAM} strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

// variant: 'full' (wordmark + descriptor) | 'wordmark' | 'monogram'
// accent: the lab's track accent hex (GSL = cyan #22D3EE)
export function BrandMark({ variant = 'full', descriptor = '', accent = '#22D3EE', size = 28 }) {
  if (variant === 'monogram') {
    return (
      <span aria-label='BreakLabs' style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: Math.round(size * 0.24),
        background: 'var(--surface, #1c1712)', border: '1px solid var(--rim, #3d2e26)' }}>
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
          <span style={{ color: 'var(--ink-low, #7a6e60)', margin: '0 0.4em' }}>·</span>
          <span style={{ color: accent }}>{descriptor}</span>
        </>
      )}
    </span>
  );
}

export default BrandMark;
