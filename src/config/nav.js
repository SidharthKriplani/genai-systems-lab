// src/config/nav.js — Navigation constants for GenAI Systems Lab
// Single source of truth for tab definitions, group colors, and nav group structure.
// Change tab labels, groups, or counts here — App.jsx reads from this file.

export const ALL_TABS = [
  // Primary nav
  { id: "lab",         label: "RAG Lab",     group: "BUILD",    audience: "Engineers" },
  { id: "agentlab",    label: "Agent Lab",   group: "BUILD",    audience: "Engineers" },
  { id: "evallab",     label: "Eval Lab",    group: "BUILD",    audience: "Engineers · PMs" },
  { id: "llmlab",      label: "LLM Lab",     group: "BUILD",    audience: "Engineers" },
  { id: "promptlab",      label: "Prompt Lab",           group: "BUILD",    audience: "Engineers" },
  { id: "foundationlab",  label: "Foundation Models Lab", group: "BUILD",    audience: "Engineers" },
  { id: "preplab",     label: "Prep Lab",    group: "PROVE",    audience: "Interview prep" },
  { id: "career",      label: "Career",      group: "NAVIGATE", audience: "Job seekers" },
  { id: "aipm",        label: "AI Product",  group: "NAVIGATE", audience: "Product managers" },
  { id: "concepts",    label: "Concepts",    group: "KNOWLEDGE",audience: "All levels" },
  { id: "groundtruth", label: "Ground Truth",group: "KNOWLEDGE",audience: "All levels" },
  // Legacy tabs — accessible via #hash, not in primary nav
  { id: "flows",       label: "Diagrams",    group: "LEGACY",   audience: "All levels" },
  { id: "agents",      label: "Agents",      group: "LEGACY",   audience: "Engineers" },
  { id: "playground",  label: "Playground",  group: "LEGACY",   audience: "All levels" },
  { id: "explore",     label: "Explore",     group: "LEGACY",   audience: "Engineers" },
  { id: "systems",     label: "Systems",     group: "LEGACY",   audience: "Engineers · PMs" },
  { id: "paths",       label: "Paths",       group: "LEGACY",   audience: "All levels" },
  { id: "fluency",     label: "Drills",      group: "LEGACY",   audience: "Interview prep" },
];

export const GROUP_COLORS = {
  BUILD:    "#3b82f6",
  PROVE:    "#22c55e",
  NAVIGATE: "#f59e0b",
  KNOWLEDGE:"#8b5cf6",
  LEGACY:   "#3f3f46",
};

// Static nav group structure for the sidebar.
// Note: component keeps this as a local const (not imported) because it
// references onNavigate — but shape is defined here for reference.
export const NAV_GROUPS = [
  { label: null, items: [
    { id: "home", label: "Home", audience: "All levels" },
  ]},
  { label: "BUILD", color: "#52525b", items: [
    { id: "lab",      label: "RAG Lab",   count: 6,  audience: "Engineers" },
    { id: "agentlab", label: "Agent Lab", count: 16, audience: "Engineers" },
    { id: "evallab",  label: "Eval Lab",  count: 15, audience: "Engineers · PMs" },
    { id: "llmlab",    label: "LLM Lab",    count: 9,  audience: "Engineers" },
    { id: "promptlab",     label: "Prompt Lab",           count: 6,  audience: "Engineers" },
    { id: "foundationlab", label: "Foundation Models Lab", count: 6,  audience: "Engineers" },
  ]},
  { label: "PROVE", color: "#52525b", items: [
    { id: "preplab", label: "Prep Lab",   audience: "Interview prep" },
  ]},
  { label: "NAVIGATE", color: "#52525b", items: [
    { id: "career",  label: "Career",     count: 6,  audience: "Job seekers" },
    { id: "aipm",    label: "AI Product", count: 5,  audience: "Product managers" },
  ]},
  { label: "KNOWLEDGE", color: "#52525b", items: [
    { id: "concepts",    label: "Concepts",     count: 20, audience: "All levels" },
    { id: "groundtruth", label: "Ground Truth",            audience: "All levels" },
  ]},
  { label: null, items: [
    { id: "progress", label: "My Progress", audience: "All levels" },
  ]},
];
