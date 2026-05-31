// src/shared.jsx
// Shared UI components used across PrepLab and other modules.
// Import named exports — do not import this file as a default.

import React from "react";

/**
 * CommonTrapCallout
 * Renders an amber callout showing what weaker candidates typically say.
 * Only renders if trap string is present.
 * Usage: <CommonTrapCallout trap={q.trap} />
 */
export function CommonTrapCallout({ trap }) {
  if (!trap) return null;
  return (
    <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg px-4 py-3 space-y-1">
      <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Common trap</p>
      <p className="text-sm text-amber-300 leading-relaxed">{trap}</p>
    </div>
  );
}
