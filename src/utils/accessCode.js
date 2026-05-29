// ─── ACCESS CODE GATE ─────────────────────────────────────────────────────────
// Interim auth: client-side access code gate.
// Community code shared freely during beta testing.
// When Stripe goes live: replace COMMUNITY_CODE with server-side purchased code validation.
// Single source of truth — change the code here only.

export const COMMUNITY_CODE = "GENAI2026";

export const FREE_QUESTION_LIMIT = 10; // questions per session before gate fires

export function isAccessGranted() {
  try { return localStorage.getItem("genai_access_granted") === "true"; }
  catch { return false; }
}

export function grantAccess() {
  try { localStorage.setItem("genai_access_granted", "true"); }
  catch {}
}

export function revokeAccess() {
  try { localStorage.removeItem("genai_access_granted"); }
  catch {}
}

export function validateCode(code) {
  return code.trim().toUpperCase() === COMMUNITY_CODE;
}
