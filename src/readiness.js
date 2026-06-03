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
