// src/utils/fsrs.js
// Simplified FSRS-4.5 spaced repetition scheduler
// Grades: 1=Again, 2=Hard, 3=Good, 4=Easy
// Returns { stability, difficulty, interval } — caller stores these + next due_date

// FSRS-4.5 default weights (w0-w18)
const W = [
  0.4072, 1.1829, 3.1262, 15.4722, // S₀ for grades 1-4
  7.2102, 0.5316, 1.0651, 0.0589,  // difficulty / stability modifiers
  0.3276, 0.4926, 0.9010, 2.2425,  // recall stability
  0.1340, 0.2900, 2.2700, 0.2500,  // forget stability
  2.9898, 0.5100, 0.3400,           // misc
];

const FACTOR      = -0.5;
const DECAY       = -0.5;
const R_TARGET    = 0.9;   // target retrievability (schedule at 90% retention)

// Retrievability: R(t, S) — probability of recall after t days with stability S
function retrievability(t, S) {
  return Math.pow(1 + FACTOR * t / S, 1 / FACTOR);
}

// Days until retrievability drops to R_TARGET given stability S
function nextInterval(S) {
  return Math.round(S / FACTOR * (Math.pow(R_TARGET, FACTOR) - 1));
}

// Clamp difficulty [1, 10]
function clampD(d) { return Math.max(1, Math.min(10, d)); }

// Initial stability after first review (grade 1-4)
function initialStability(grade) {
  return W[grade - 1];
}

// Initial difficulty (grade 1-4)
function initialDifficulty(grade) {
  return clampD(W[4] - Math.exp(W[5] * (grade - 1)) + 1);
}

// Update difficulty after review
function updateDifficulty(D, grade) {
  return clampD(D - W[6] * (grade - 3));
}

// Stability after successful recall (grade >= 2)
function stabilityAfterRecall(D, S, R, grade) {
  const easyBonus = grade === 4 ? W[16] : 1;
  const hardPenalty = grade === 2 ? W[15] : 1;
  return S * (
    Math.exp(W[8]) *
    (11 - D) *
    Math.pow(S, -W[9]) *
    (Math.exp((1 - R) * W[10]) - 1) *
    easyBonus * hardPenalty + 1
  );
}

// Stability after forgetting (grade 1)
function stabilityAfterForgetting(D, S, R) {
  return W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp((1 - R) * W[14]);
}

// ── Main API ───────────────────────────────────────────────────────────────────

/**
 * Schedule a card.
 * @param {object} card — { fsrs_stability, fsrs_difficulty, reps, lapses, due_date }
 * @param {number} grade — 1=Again, 2=Hard, 3=Good, 4=Easy
 * @returns {{ stability, difficulty, interval, lapses }}
 *   interval: days until next review
 *   stability/difficulty: new values to persist to DB
 */
export function scheduleCard(card, grade) {
  const { fsrs_stability: S = 0, fsrs_difficulty: D = 5, reps = 0 } = card;
  let lapses = card.lapses || 0;

  // First review — initialize
  if (reps === 0) {
    const stability  = initialStability(grade);
    const difficulty = initialDifficulty(grade);
    const interval   = grade === 1 ? 1 : nextInterval(stability);
    if (grade === 1) lapses += 1;
    return { stability, difficulty, interval, lapses };
  }

  // Subsequent review — compute retrievability at time of review
  const daysSinceDue = daysBetween(new Date(card.due_date), new Date());
  // Clamp to a reasonable window (card may be early or very late)
  const t = Math.max(0, daysSinceDue);
  const R = S > 0 ? retrievability(t, S) : 0.5;

  const newD = updateDifficulty(D, grade);

  if (grade === 1) {
    // Forgot — reset stability
    lapses += 1;
    const newS = stabilityAfterForgetting(newD, S, R);
    return { stability: Math.max(0.1, newS), difficulty: newD, interval: 1, lapses };
  }

  const newS = stabilityAfterRecall(newD, S, R, grade);
  const interval = nextInterval(Math.max(0.1, newS));
  return { stability: Math.max(0.1, newS), difficulty: newD, interval, lapses };
}

// Days between two dates (can be negative if date1 is in the future)
function daysBetween(date1, date2) {
  const ms = date2.getTime() - date1.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

// Add `n` days to today → ISO date string "YYYY-MM-DD"
export function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Today as ISO date string
export function today() {
  return new Date().toISOString().slice(0, 10);
}
