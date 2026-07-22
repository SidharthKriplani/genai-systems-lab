// Continue-strip: remembers the last Foundations module opened, so Progress
// can render a "Continue where you left off" strip. Ported from PAL's
// sqlLabContinue.js pattern (T3-followup v2/v3), adapted for GSL:
// Foundations modules have no "typed draft" state to prefer over "last
// opened" the way PAL's SQL query editor does, so this is last-opened only
// — no typed-wins branch. Honest deviation from the PAL pattern, logged in
// EXEC-LEDGER.md (Q1).

const KEY = "gsl-last-touched-v1";

export function writeLastTouched({ gymId, moduleId, title }) {
  if (!moduleId) return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ gymId: gymId || null, moduleId, title: title || "", ts: Date.now() })
    );
  } catch {}
}

export function getLastTouched() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.moduleId) return null;
    return parsed;
  } catch {
    return null;
  }
}
