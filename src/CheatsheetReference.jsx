import { useState, useMemo } from "react";
import { CHEAT_CARDS } from "./data/cheatsheetCards";
import { AddTrackBtn } from "./AddToTrackPopover.jsx";

const SEARCH_KEY = "gsl-cheat-search";

export default function CheatsheetReference() {
  const [query, setQuery] = useState(() => {
    try {
      return localStorage.getItem(SEARCH_KEY) || "";
    } catch {
      return "";
    }
  });
  const [activeTopic, setActiveTopic] = useState("All");

  // Derive the topic list from the data, preserving first-seen order.
  const topics = useMemo(() => {
    const seen = [];
    for (const c of CHEAT_CARDS) if (!seen.includes(c.topic)) seen.push(c.topic);
    return ["All", ...seen];
  }, []);

  const setSearch = (v) => {
    setQuery(v);
    try {
      localStorage.setItem(SEARCH_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHEAT_CARDS.filter((c) => {
      if (activeTopic !== "All" && c.topic !== activeTopic) return false;
      if (!q) return true;
      return (
        c.term.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.oneLiner.toLowerCase().includes(q) ||
        c.gotcha.toLowerCase().includes(q) ||
        (c.formula || "").toLowerCase().includes(q)
      );
    });
  }, [query, activeTopic]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">
          Quick reference
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Searchable cards for GenAI interview prep — a formula, a one-liner,
          and the gotcha most people miss.
        </p>
      </div>

      {/* Search box */}
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms, formulas, gotchas…"
          className="w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40"
          style={{
            background: "var(--surface, #18181b)",
            borderColor: "var(--border, #3f3f46)",
          }}
          aria-label="Search reference cards"
        />
        {query && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            aria-label="Clear search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Topic filter — dropdown */}
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="cheat-topic" className="text-xs font-medium text-zinc-500">Topic</label>
        <select
          id="cheat-topic"
          value={activeTopic}
          onChange={(e) => setActiveTopic(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium text-zinc-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40"
          style={{ background: "var(--surface, #18181b)", borderColor: "var(--border, #3f3f46)" }}
          aria-label="Filter by topic"
        >
          {topics.map((t) => (
            <option key={t} value={t}>{t === "All" ? "All topics" : t}</option>
          ))}
        </select>
        {activeTopic !== "All" && (
          <button type="button" onClick={() => setActiveTopic("All")}
            className="text-xs text-zinc-500 hover:text-zinc-300">clear</button>
        )}
      </div>

      {/* Result count */}
      <p className="mb-4 text-xs text-zinc-500">
        {filtered.length} {filtered.length === 1 ? "card" : "cards"}
        {activeTopic !== "All" ? ` in ${activeTopic}` : ""}
        {query.trim() ? ` matching “${query.trim()}”` : ""}
      </p>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center text-sm text-zinc-500">
          No cards match. Try a different term or clear the filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <article
              key={c.topic + "::" + c.term}
              className="flex flex-col rounded-xl border p-4"
              style={{
                background: "var(--surface, #18181b)",
                borderColor: "var(--border, #3f3f46)",
              }}
            >
              {/* Term + topic chip */}
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold leading-snug text-zinc-100">
                  {c.term}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-300">
                    {c.topic}
                  </span>
                  <span onClick={(e) => e.stopPropagation()}>
                    <AddTrackBtn
                      itemType="cheatsheet"
                      itemId={c.topic + "::" + c.term}
                      label={c.term}
                      itemMeta={{ topic: c.topic }}
                    />
                  </span>
                </div>
              </div>

              {/* Formula */}
              <div
                className="mb-3 overflow-x-auto rounded-lg border border-zinc-800 px-3 py-2 font-mono text-[13px] leading-relaxed text-zinc-200"
                style={{ background: "var(--surface-2, #0f0f11)" }}
              >
                {c.formula}
              </div>

              {/* One-liner */}
              <p className="mb-3 text-[13px] leading-relaxed text-zinc-400">
                {c.oneLiner}
              </p>

              {/* Gotcha */}
              <div className="mt-auto flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <span
                  className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-400"
                  aria-hidden="true"
                >
                  Gotcha
                </span>
                <p className="text-[12px] leading-relaxed text-amber-100/80">
                  {c.gotcha}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
