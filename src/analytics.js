// ── Analytics wrapper ────────────────────────────────────────────────────────
// Uses PostHog via CDN. Requires VITE_POSTHOG_KEY env var.
// App works identically with or without it — all calls fail silently.
// No personal data is collected. No hardcoded keys.

const KEY  = import.meta.env?.VITE_POSTHOG_KEY;
const HOST = import.meta.env?.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

const _RAW_FEEDBACK_URL = import.meta.env?.VITE_FEEDBACK_URL || "";

// Returns the real URL only if it has been set and isn't a placeholder.
// Components should call isFeedbackReady() before opening the URL.
export const FEEDBACK_URL = _RAW_FEEDBACK_URL;
export function isFeedbackReady() {
  return (
    !!_RAW_FEEDBACK_URL &&
    !_RAW_FEEDBACK_URL.includes("REPLACE_ME") &&
    _RAW_FEEDBACK_URL.startsWith("http")
  );
}

export function initAnalytics() {
  if (!KEY) return; // analytics not configured — app still works
  try {
    const s = document.createElement("script");
    s.src   = "https://us-assets.i.posthog.com/static/array.js";
    s.async = true;
    s.onload = () => {
      try {
        window.posthog?.init(KEY, {
          api_host:         HOST,
          autocapture:      false, // no click/input capture
          capture_pageview: false, // we track manually
          persistence:      "localStorage+cookie",
          sanitize_properties: (props) => {
            // strip any accidental PII keys
            const safe = { ...props };
            delete safe.email; delete safe.name; delete safe.ip;
            return safe;
          },
        });
      } catch { /* silent */ }
    };
    document.head.appendChild(s);
  } catch { /* silent */ }
}

export function track(event, props = {}) {
  try {
    window.posthog?.capture(event, { ...props, app: "genai-systems-lab" });
  } catch { /* silent */ }
}

// ── Owner preview unlock ──────────────────────────────────────────────────────
// Set VITE_ADMIN_UNLOCK in Vercel env vars to your chosen secret code.
// Visit the app with ?preview=YOURCODE to unlock all tabs.
// Visit with ?lock=1 to re-lock.
const _ADMIN_CODE = import.meta.env?.VITE_ADMIN_UNLOCK || "";

export function checkPreviewUnlock() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("lock") === "1") {
      localStorage.removeItem("genai_preview_unlocked");
      // strip the param cleanly
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
      return;
    }
    const code = params.get("preview");
    if (code && _ADMIN_CODE && code === _ADMIN_CODE) {
      localStorage.setItem("genai_preview_unlocked", "1");
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  } catch { /* silent */ }
}

export function isPreviewUnlocked() {
  try { return localStorage.getItem("genai_preview_unlocked") === "1"; } catch { return false; }
}

// Convenience helper for external links — no external resource links exist in the
// current app, but wire future ones as:
//   onClick={() => trackExternalResource("https://...", "label", "section")}
export function trackExternalResource(url, label, section = "") {
  track("external_resource_clicked", { url, label, section });
}
