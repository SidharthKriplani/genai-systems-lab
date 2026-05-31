// src/config/gating.js
// Single source of truth for gating thresholds.
// Import from here in all components — do not read accessCode.js directly for limits.

// How many questions are shown in results before the gate fires for free users
export const RESULTS_FREE_LIMIT = 10;

// Re-export for backward compatibility — consumers that already import from accessCode.js continue to work
export { FREE_QUESTION_LIMIT } from "../utils/accessCode";
