// src/readiness.js — per-challenge-area readiness computation
// Reads existing localStorage keys — no new tracking required.
// Used by all 5 hub pages and ReturningHomeView in Home.jsx.

const AREA_CONFIG = {
  retrieval: {
    // RAG Lab uses genai_leaderboard array (pass/fail per scenario)
    labSource:    "leaderboard",
    labMax:       6,
    conceptIds:   ["embeddings", "context", "tokenizer", "attention"],
    preplabPfx:   ["rag"],
    color:        "var(--gal-build)",
    label:        "Retrieval",
  },
  evaluation: {
    // Eval Lab uses genai_visited_modules → "evallab:moduleId"
    labSource:    "modules",
    modulePrefix: "evallab:",
    labMax:       15,
    conceptIds:   ["eval-loop", "debug", "llm-as-judge", "eval-design"],
    preplabPfx:   ["eval"],
    color:        "#f59e0b",
    label:        "Evaluation",
  },
  agentshub: {
    labSource:    "modules",
    modulePrefix: "agentlab:",
    labMax:       16,
    conceptIds:   ["agent", "agent-tools", "multiagent", "guardrails"],
    preplabPfx:   ["agents"],
    color:        "#a78bfa",
    label:        "Agents",
  },
  production: {
    labSource:    "modules",
    modulePrefix: "llmlab:",
    labMax:       9,
    conceptIds:   ["cost-latency-concepts", "observability-concepts"],
    preplabPfx:   ["llmops"],
    color:        "#22c55e",
    label:        "Production",
  },
  foundations: {
    // FM Lab + Prompt Lab have no localStorage tracking — rely on concepts + preplab
    labSource:    "tabs",
    tabIds:       ["foundationlab", "promptlab"],
    labMax:       2,
    conceptIds:   ["tokenizer", "attention", "training-signal", "lora"],
    preplabPfx:   ["ft", "finetuning"],
    color:        "#3b82f6",
    label:        "Foundations",
  },
};

// Returns { pct, level, color, label, hasActivity, breakdown }
// Returns null if no activity at all in this area.
export function getAreaReadiness(areaId) {
  try {
    const cfg = AREA_CONFIG[areaId];
    if (!cfg) return null;

    const leaderboard = JSON.parse(localStorage.getItem("genai_leaderboard") || "[]");
    const visitedMods = new Set(JSON.parse(localStorage.getItem("genai_visited_modules") || "[]"));
    const visitedTabs = new Set(JSON.parse(localStorage.getItem("genai_visited") || '["home"]'));
    const history     = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
    const mastery     = JSON.parse(localStorage.getItem("gsl-concepts-mastery") || "[]");

    // ── Lab score ────────────────────────────────────────────────────────────
    let labDone = 0;
    if (cfg.labSource === "leaderboard") {
      labDone = leaderboard.filter(e => e.passed).length;
    } else if (cfg.labSource === "modules") {
      labDone = [...visitedMods].filter(k => k.startsWith(cfg.modulePrefix)).length;
    } else if (cfg.labSource === "tabs") {
      labDone = cfg.tabIds.filter(id => visitedTabs.has(id)).length;
    }
    const labScore = Math.min(labDone / cfg.labMax, 1);

    // ── Concepts score ────────────────────────────────────────────────────────
    const conceptsDone  = mastery.filter(id => cfg.conceptIds.includes(id)).length;
    const conceptsScore = conceptsDone / cfg.conceptIds.length;

    // ── PrepLab score ─────────────────────────────────────────────────────────
    const plKeys    = Object.keys(history).filter(k => cfg.preplabPfx.some(p => k.startsWith(p)));
    const plCorrect = plKeys.filter(k => history[k]?.correct).length;
    const plScore   = plKeys.length > 0 ? plCorrect / plKeys.length : 0;
    const hasPrep   = plKeys.length > 0;

    // ── Composite (weighted) ─────────────────────────────────────────────────
    // Foundations: concepts 50%, preplab 40%, lab 10% (FM/Prompt Lab barely trackable)
    // Others: lab 40%, concepts 30%, preplab 30%
    let composite;
    if (areaId === "foundations") {
      composite = labScore * 0.10 + conceptsScore * 0.50 + (hasPrep ? plScore * 0.40 : conceptsScore * 0.40);
    } else {
      composite = labScore * 0.40 + conceptsScore * 0.30 + (hasPrep ? plScore * 0.30 : conceptsScore * 0.30);
    }

    const pct = Math.round(composite * 100);
    const hasActivity = labDone > 0 || conceptsDone > 0 || plKeys.length > 0;

    if (!hasActivity) return null;

    // ── Level ────────────────────────────────────────────────────────────────
    let level;
    if (pct < 15)      level = "Just Starting";
    else if (pct < 35) level = "Building";
    else if (pct < 60) level = "Practitioner";
    else if (pct < 82) level = "Senior";
    else               level = "Staff";

    return {
      pct,
      level,
      color: cfg.color,
      label: cfg.label,
      hasActivity,
      breakdown: { labDone, labMax: cfg.labMax, conceptsDone, conceptsMax: cfg.conceptIds.length, plKeys: plKeys.length, plCorrect },
    };
  } catch {
    return null;
  }
}

export function getAllAreasReadiness() {
  return Object.fromEntries(
    Object.keys(AREA_CONFIG).map(id => [id, getAreaReadiness(id)])
  );
}

// AREA_CONFIG is exported so hub pages can reference colors/labels without re-importing
export { AREA_CONFIG };

// ─── Assessment quiz signal ───────────────────────────────────────────────────
// Optional explicit self-assessment. Lets readiness incorporate a stated signal,
// not only activity-inferred coverage. Stored as { areaId: pct(0-100), ... } plus
// a `takenAt` timestamp. Feeds the capped-breadth score as its own "assessment"
// area and nudges each domain area's coverage toward the quiz-reported level.
//
// localStorage key: gsl-assessment-quiz  (no collision with existing gsl-* keys)
const QUIZ_KEY = "gsl-assessment-quiz";

// The five graded domain areas the quiz can score. Mirrors AREA_CONFIG ids.
export const QUIZ_AREAS = [
  { id: "retrieval",   label: "Retrieval" },
  { id: "evaluation",  label: "Evaluation" },
  { id: "agentshub",   label: "Agents" },
  { id: "production",  label: "Production" },
  { id: "foundations", label: "Foundations" },
];

export function getQuizResult() {
  try {
    const raw = JSON.parse(localStorage.getItem(QUIZ_KEY) || "null");
    if (!raw || typeof raw !== "object") return null;
    return raw; // { retrieval: 60, ..., takenAt: <ms> }
  } catch {
    return null;
  }
}

// Persist a quiz result. `scores` is { areaId: pct(0-100) }. Additive — callers
// that don't have a quiz UI yet can write a single self-rating; the readiness
// score picks it up automatically.
export function saveQuizResult(scores) {
  try {
    const clean = {};
    QUIZ_AREAS.forEach(({ id }) => {
      const v = Number(scores?.[id]);
      if (!Number.isNaN(v)) clean[id] = Math.max(0, Math.min(100, Math.round(v)));
    });
    clean.takenAt = Date.now();
    localStorage.setItem(QUIZ_KEY, JSON.stringify(clean));
    return clean;
  } catch {
    return null;
  }
}

// Overall assessment coverage (0..1): mean of the quiz-reported area scores.
// Returns null if no quiz taken.
function quizCoverage() {
  const q = getQuizResult();
  if (!q) return null;
  const vals = QUIZ_AREAS.map(({ id }) => q[id]).filter(v => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((s, v) => s + v, 0) / vals.length / 100;
}

// ─── Capped-breadth overall readiness ─────────────────────────────────────────
// PAL/MSL model: the overall score is the MEAN of per-area coverage, each area
// capped at 1 (100%). Because every area contributes at most its cap, you cannot
// max the overall score by grinding one area — breadth across the domains is what
// interviews actually test. Activity/streak is deliberately EXCLUDED from the
// score (cram-to-a-date goal, not a forever-streak app — learned from PAL/MSL).
//
// Areas: the 5 domain areas (Retrieval/Evaluation/Agents/Production/Foundations)
// plus an optional "assessment" area sourced from the self-assessment quiz.
//
// Returns { score, level, color, weakest, areas: [{ id, label, pct, cov, color, hasActivity }] }.
export function getOverallReadiness() {
  const all = getAllAreasReadiness();

  const domainAreas = Object.keys(AREA_CONFIG).map(id => {
    const r = all[id];
    const cfg = AREA_CONFIG[id];
    // Quiz nudge: if the quiz rates this area higher than inferred activity, take
    // the max — an explicit self-assessment shouldn't be dragged down by low
    // tracked activity, and vice-versa (activity shouldn't be hidden by a low quiz).
    const q = getQuizResult();
    const inferredPct = r ? r.pct : 0;
    const quizPct = q && typeof q[id] === "number" ? q[id] : null;
    const pct = quizPct != null ? Math.max(inferredPct, quizPct) : inferredPct;
    return {
      id,
      label: cfg.label,
      color: cfg.color,
      pct,
      cov: Math.min(pct / 100, 1),
      hasActivity: !!r || quizPct != null,
    };
  });

  // Optional assessment area — only counts once the quiz has been taken.
  const qCov = quizCoverage();
  const areas = [...domainAreas];
  if (qCov != null) {
    areas.push({
      id: "assessment",
      label: "Self-assessment",
      color: "#e879f9",
      pct: Math.round(qCov * 100),
      cov: Math.min(qCov, 1),
      hasActivity: true,
    });
  }

  const score = Math.round((areas.reduce((s, a) => s + a.cov, 0) / areas.length) * 100);

  // Work next = weakest DOMAIN area with headroom (assessment isn't a place to go).
  const weakest = domainAreas
    .filter(a => a.cov < 1)
    .sort((a, b) => a.cov - b.cov)[0] || null;

  let level;
  if (score < 15)      level = "Just Starting";
  else if (score < 35) level = "Building";
  else if (score < 60) level = "Practitioner";
  else if (score < 82) level = "Senior";
  else                 level = "Staff";

  const color =
    score >= 82 ? "#22c55e" :
    score >= 60 ? "#a78bfa" :
    score >= 35 ? "#f59e0b" :
    "#71717a";

  return { score, level, color, weakest, areas, hasQuiz: qCov != null };
}

// "Work next" pointer — the single weakest/most-impactful domain area to work on.
// Returns { id, label, color, pct } deep-linkable via onNavigate(id), or null if
// every area is maxed (or there's no activity yet). Area ids match nav ids.
export function getWorkNext() {
  const { weakest } = getOverallReadiness();
  if (!weakest) return null;
  return { id: weakest.id, label: weakest.label, color: weakest.color, pct: weakest.pct };
}
