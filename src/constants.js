// Shared constants — imported by App.jsx, Home.jsx, and any other file that needs them.
// Single source of truth — do NOT duplicate these elsewhere.

/** Tabs currently in "coming soon / in progression" state.
 *  Keep in sync with NAV_GROUPS locked:true entries in App.jsx. */
export const LOCKED_TABS = new Set(["systems", "fluency", "aipm", "career"]);
