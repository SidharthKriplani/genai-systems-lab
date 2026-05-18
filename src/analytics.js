// ── Analytics wrapper ────────────────────────────────────────────────────────
// Uses PostHog via CDN. Requires VITE_POSTHOG_KEY env var.
// App works identically with or without it — all calls fail silently.
// No personal data is collected. No hardcoded keys.

const KEY  = import.meta.env?.VITE_POSTHOG_KEY;
const HOST = import.meta.env?.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

export const FEEDBACK_URL =
  import.meta.env?.VITE_FEEDBACK_URL || "https://forms.gle/REPLACE_ME";

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

// Convenience helper for external links — no external resource links exist in the
// current app, but wire future ones as:
//   onClick={() => trackExternalResource("https://...", "label", "section")}
export function trackExternalResource(url, label, section = "") {
  track("external_resource_clicked", { url, label, section });
}
