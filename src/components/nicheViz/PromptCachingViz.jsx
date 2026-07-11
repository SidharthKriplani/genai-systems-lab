import { useState } from "react";

// Monochrome instrument. Accents: cyan (var(--gal-build)), emerald (fast/hit), red (slow/miss).
export default function PromptCachingViz({ onNavigate, spec } = {}) {
  // Cache state
  const [hit, setHit] = useState(true);
  // Where the dynamic (user) content sits in the prompt: 3 = last (cache-friendly), lower = earlier
  const [dynPos, setDynPos] = useState(3);

  // Fixed token accounting (round numbers).
  const PREFIX_TOKENS = 6000; // system + few-shot (large, static)
  const SUFFIX_TOKENS = 50; // user turn (small, dynamic)

  // Per-token timings / costs (illustrative, round).
  const PREFILL_MS_PER_1K = 40; // ms to prefill 1k input tokens
  const COST_PER_1K = 3; // cost units per 1k input tokens (uncached)
  const CACHE_READ_DISCOUNT = 0.9; // cached tokens cost 10% of normal

  // Cache-friendly layout means dynamic content is LAST (dynPos === 3).
  const layoutFriendly = dynPos === 3;

  // If the layout is not cache-friendly, the dynamic content sits inside the
  // prefix. Everything from the first differing token onward can't be reused.
  // We model: cachedTokens = tokens strictly before the dynamic block.
  // With dynPos as a fraction of the prefix (1..3, 3 = after prefix):
  const dynFractionIntoPrefix = layoutFriendly ? 1 : dynPos / 3; // 1/3, 2/3, 1
  const reusablePrefix = layoutFriendly
    ? PREFIX_TOKENS
    : Math.round(PREFIX_TOKENS * (dynFractionIntoPrefix - 1 / 3));

  // A hit is only really a hit if there IS a reusable prefix and hit is on.
  const effectiveHit = hit && reusablePrefix > 0;

  // Tokens that must be prefilled this turn.
  const totalTokens = PREFIX_TOKENS + SUFFIX_TOKENS;
  const cachedTokens = effectiveHit ? reusablePrefix : 0;
  const prefilledTokens = totalTokens - cachedTokens;

  const ttft = Math.round((prefilledTokens / 1000) * PREFILL_MS_PER_1K);
  const ttftCold = Math.round((totalTokens / 1000) * PREFILL_MS_PER_1K);

  const cost =
    ((prefilledTokens / 1000) * COST_PER_1K +
      (cachedTokens / 1000) * COST_PER_1K * (1 - CACHE_READ_DISCOUNT)) ;
  const costCold = (totalTokens / 1000) * COST_PER_1K;

  const ttftSave = Math.max(0, Math.round(((ttftCold - ttft) / ttftCold) * 100));
  const costSave = Math.max(0, Math.round(((costCold - cost) / costCold) * 100));

  const card = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
  };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
  const label = { fontSize: 11, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 0.6 };
  const btn = (on) => ({
    ...mono,
    fontSize: 12,
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: on ? "var(--surface-2)" : "transparent",
    color: on ? "#e4e4e7" : "#a1a1aa",
  });

  // Token bar segments: cached (reused), prefilled prefix, suffix.
  const cachedW = (cachedTokens / totalTokens) * 100;
  const suffixW = (SUFFIX_TOKENS / totalTokens) * 100;
  const prefixPrefW = 100 - cachedW - suffixW;

  return (
    <div style={{ color: "#e4e4e7", fontSize: 13, maxWidth: 640 }}>
      <div style={{ ...label, marginBottom: 4 }}>Prompt caching</div>
      <div style={{ color: "#a1a1aa", marginBottom: 14, fontSize: 12 }}>
        A large static prefix (system + few-shot) fronts a small dynamic user turn.
        On a cache hit the prefix prefill is skipped.
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button style={btn(hit)} onClick={() => setHit(true)}>cache hit</button>
        <button style={btn(!hit)} onClick={() => setHit(false)}>cache miss</button>
      </div>

      {/* Prompt layout */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ ...label, marginBottom: 8 }}>Prompt layout</div>
        <div style={{ display: "flex", height: 30, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" }}>
          {cachedW > 0 && (
            <div style={{ width: `${cachedW}%`, background: "rgba(16,185,129,0.25)", borderRight: "1px solid var(--border)", ...mono, fontSize: 10, color: "#6ee7b7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              cached
            </div>
          )}
          {prefixPrefW > 0 && (
            <div style={{ width: `${prefixPrefW}%`, background: "var(--surface-2)", borderRight: "1px solid var(--border)", ...mono, fontSize: 10, color: "#a1a1aa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              prefix (prefill)
            </div>
          )}
          <div style={{ width: `${suffixW}%`, background: "rgba(34,211,238,0.25)", ...mono, fontSize: 10, color: "var(--gal-build)", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 40 }}>
            user
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, ...mono, fontSize: 11, color: "#71717a" }}>
          <span>prefix {PREFIX_TOKENS.toLocaleString()} tok</span>
          <span>suffix {SUFFIX_TOKENS} tok</span>
        </div>
      </div>

      {/* Dynamic position control */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ ...label, marginBottom: 8 }}>Move dynamic content earlier</div>
        <input
          type="range"
          min={1}
          max={3}
          step={1}
          value={dynPos}
          onChange={(e) => setDynPos(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ ...mono, fontSize: 11, color: layoutFriendly ? "#6ee7b7" : "#f87171", marginTop: 6 }}>
          {layoutFriendly
            ? "dynamic last → whole prefix reusable (cache-friendly)"
            : `dynamic injected into prefix → cache breaks at first differing token, ${(PREFIX_TOKENS - reusablePrefix).toLocaleString()} tok invalidated`}
        </div>
      </div>

      {/* Numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={card}>
          <div style={label}>TTFT (prefill)</div>
          <div style={{ ...mono, fontSize: 22, color: effectiveHit ? "#6ee7b7" : "#f87171" }}>{ttft} ms</div>
          <div style={{ ...mono, fontSize: 11, color: "#71717a" }}>cold: {ttftCold} ms · {effectiveHit ? `−${ttftSave}%` : "no cache"}</div>
        </div>
        <div style={card}>
          <div style={label}>Input cost</div>
          <div style={{ ...mono, fontSize: 22, color: effectiveHit ? "#6ee7b7" : "#f87171" }}>{cost.toFixed(1)}</div>
          <div style={{ ...mono, fontSize: 11, color: "#71717a" }}>cold: {costCold.toFixed(1)} · {effectiveHit ? `−${costSave}%` : "no cache"}</div>
        </div>
      </div>

      <div style={{ ...mono, fontSize: 11, color: "#71717a", marginTop: 12 }}>
        {cachedTokens.toLocaleString()} of {totalTokens.toLocaleString()} tokens served from cache · {prefilledTokens.toLocaleString()} prefilled.
      </div>
    </div>
  );
}
