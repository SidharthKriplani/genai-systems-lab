// src/leaderboardUtils.js
// Global leaderboard helpers — score computation + Supabase sync
// Supabase table: gsl_leaderboard (user_id uuid pk, display_name text, total_score int, questions_answered int, updated_at timestamptz)

import { supabase } from "./supabase";
import { PREP_QUESTIONS } from "./data/preplabQuestions";

// ─── SCORING WEIGHTS ──────────────────────────────────────────────────────────
// PrepLab questions (per correct answer, by difficulty)
const DIFF_SCORE = {
  beginner:              1,
  "beginner-intermediate": 2,
  easy:                  2,
  Easy:                  2,
  intermediate:          3,
  medium:                3,
  Medium:                3,
  hard:                  5,
  Hard:                  5,
  staff:                 8,
  daunting:              0, // browse-only, not scored
};

const CONCEPTS_MODULE_SCORE = 3;  // per mastered Concepts module
const SCENARIO_PASS_SCORE   = 5;  // per passed RAG Lab scenario

// Build a lookup: questionId → difficulty score (for O(1) access)
const Q_SCORE_MAP = Object.fromEntries(
  PREP_QUESTIONS.filter(Boolean).map(q => [q.id, DIFF_SCORE[q.difficulty] ?? 3])
);

// ─── SCORE COMPUTATION ────────────────────────────────────────────────────────

/** Compute total weighted score from all localStorage sources. */
export function computeTotalScore() {
  const { prepScore, conceptsScore, scenarioScore } = computeBreakdown();
  return prepScore + conceptsScore + scenarioScore;
}

/** Return per-source breakdown for the score card. */
export function computeBreakdown() {
  // 1. PrepLab — correct answers only
  let prepScore = 0;
  let questionsAnswered = 0;
  try {
    const history = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
    for (const [qId, rec] of Object.entries(history)) {
      const attempts = rec.attempts ?? 0;
      const wrong    = rec.wrong    ?? 0;
      const correct  = attempts - wrong;
      if (correct > 0) {
        prepScore += (Q_SCORE_MAP[qId] ?? 3) * correct;
        questionsAnswered++;
      }
    }
  } catch { /* ignore corrupt state */ }

  // 2. Concepts mastery
  let conceptsScore = 0;
  let modulesMastered = 0;
  try {
    const arr = JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]");
    modulesMastered = Array.isArray(arr) ? arr.length : 0;
    conceptsScore = modulesMastered * CONCEPTS_MODULE_SCORE;
  } catch { /* ignore */ }

  // 3. RAG Lab scenarios passed
  let scenarioScore = 0;
  let scenariosPassed = 0;
  try {
    const entries = JSON.parse(localStorage.getItem("genai_leaderboard") || "[]");
    scenariosPassed = Array.isArray(entries) ? entries.filter(e => e.passed).length : 0;
    scenarioScore = scenariosPassed * SCENARIO_PASS_SCORE;
  } catch { /* ignore */ }

  return {
    prepScore,
    conceptsScore,
    scenarioScore,
    questionsAnswered,
    modulesMastered,
    scenariosPassed,
    total: prepScore + conceptsScore + scenarioScore,
  };
}

// ─── DISPLAY NAME ─────────────────────────────────────────────────────────────

export function getDisplayName(user) {
  if (!user) return "Anonymous";
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Anonymous"
  );
}

// ─── SUPABASE SYNC ────────────────────────────────────────────────────────────

/**
 * Push current score to gsl_leaderboard.
 * Uses upsert so repeated sign-ins just update the row.
 */
export async function upsertLeaderboardRow(user) {
  if (!user) return;
  const { total, questionsAnswered } = computeBreakdown();
  if (total === 0) return; // nothing to push yet

  const { error } = await supabase.from("gsl_leaderboard").upsert({
    user_id:           user.id,
    display_name:      getDisplayName(user),
    total_score:       total,
    questions_answered: questionsAnswered,
    updated_at:        new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (error) console.warn("[leaderboard] upsert failed:", error.message);
}

/**
 * Fetch top N rows from gsl_leaderboard, ordered by total_score desc.
 * Returns [] on error.
 */
export async function fetchLeaderboard(limit = 100) {
  const { data, error } = await supabase
    .from("gsl_leaderboard")
    .select("user_id, display_name, total_score, questions_answered, updated_at")
    .order("total_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[leaderboard] fetch failed:", error.message);
    return [];
  }
  return data ?? [];
}
