// src/config/nav.js — Navigation constants for GenAI Systems Lab
// Single source of truth for tab definitions, group colors, and nav group structure.
// Change tab labels, groups, or counts here — App.jsx reads from this file.

// ─── R1 redesign: challenge-layer nav (Sprint 49) ────────────────────────────
// Primary nav: 8 items. Challenge areas replace the old BUILD group.
// Labs, Systems, Concepts, Career, AI Product remain hash-accessible (not deleted).

export const ALL_TABS = [
  // TRACK — identity + progress layer (top of nav, PAL-style)
  { id: "profile",     label: "Profile",     group: "TRACK",      audience: "Your identity + saved items" },
  { id: "plans",       label: "Plans",       group: "TRACK",      audience: "Structured learning tracks" },
  // Primary nav — challenge areas
  { id: "retrieval",   label: "Retrieval",   group: "CHALLENGES", audience: "RAG · context · hallucination" },
  { id: "evaluation",  label: "Evaluation",  group: "CHALLENGES", audience: "Testing · monitoring · evals" },
  { id: "agentshub",   label: "Agents",      group: "CHALLENGES", audience: "Tool use · orchestration" },
  { id: "production",  label: "Production",  group: "CHALLENGES", audience: "Serving · LLMOps · cost" },
  { id: "foundations", label: "Foundations", group: "CHALLENGES", audience: "Training · fine-tuning · prompting" },
  { id: "preplab",     label: "PrepLab",     group: "PRIMARY",    audience: "Test your judgment" },
  { id: "groundtruth", label: "Ground Truth",group: "PRIMARY",    audience: "Practitioner knowledge" },
  { id: "progress",    label: "Progress",    group: "PRIMARY",    audience: "Your readiness + study plan" },
  // Legacy — hash-accessible, not in primary nav
  { id: "lab",         label: "RAG Lab",        group: "LEGACY", audience: "Engineers" },
  { id: "agentlab",    label: "Agent Lab",      group: "LEGACY", audience: "Engineers" },
  { id: "evallab",     label: "Eval Lab",       group: "LEGACY", audience: "Engineers · PMs" },
  { id: "llmlab",      label: "LLM Lab",        group: "LEGACY", audience: "Engineers" },
  { id: "promptlab",   label: "Prompt Lab",     group: "LEGACY", audience: "Engineers" },
  { id: "foundationlab", label: "Foundation Models Lab", group: "LEGACY", audience: "Engineers" },
  { id: "concepts",    label: "Concepts",       group: "LEGACY", audience: "All levels" },
  { id: "career",      label: "Career",         group: "LEGACY", audience: "Job seekers" },
  { id: "aipm",        label: "AI Product",     group: "LEGACY", audience: "Product managers" },
  { id: "flows",       label: "Diagrams",       group: "LEGACY", audience: "All levels" },
  { id: "agents",      label: "Agents (legacy)",group: "LEGACY", audience: "Engineers" },
  { id: "playground",  label: "Playground",     group: "LEGACY", audience: "All levels" },
  { id: "explore",     label: "Explore",        group: "LEGACY", audience: "Engineers" },
  { id: "systems",     label: "Systems",        group: "LEGACY", audience: "Engineers · PMs" },
  { id: "paths",       label: "Paths",          group: "LEGACY", audience: "All levels" },
  { id: "fluency",     label: "Drills",         group: "LEGACY", audience: "Interview prep" },
];

export const GROUP_COLORS = {
  TRACK:      "#8b5cf6",
  CHALLENGES: "var(--gal-build)",
  PRIMARY:    "#6366f1",
  LEGACY:     "#3f3f46",
};

// Nav group structure — source of truth.
// Local NAV_GROUPS const in App.jsx mirrors this shape.
export const NAV_GROUPS = [
  { label: "TRACK", color: "#8b5cf6", items: [
    { id: "profile",     label: "Profile" },
    { id: "plans",       label: "Plans" },
    { id: "progress",    label: "Progress" },
  ]},
  { label: "CHALLENGES", color: "var(--gal-build)", items: [
    { id: "retrieval",   label: "Retrieval" },
    { id: "evaluation",  label: "Evaluation" },
    { id: "agentshub",   label: "Agents" },
    { id: "production",  label: "Production" },
    { id: "foundations", label: "Foundations" },
  ]},
  { label: "PRACTICE", color: "#6366f1", items: [
    { id: "preplab",     label: "PrepLab" },
  ]},
  { label: "LEARN", color: "#a78bfa", items: [
    { id: "groundtruth", label: "Ground Truth" },
  ]},
];
