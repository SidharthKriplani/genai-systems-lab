import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY } from "../data/glossary.js";
import { MODULE_SEARCH_INDEX } from "../data/moduleSearchIndex.js";

// Module-id -> gym-id lookup, same construction as MyTracks.jsx's own
// GYMID_BY_MODULE (verified reference site for the onNavigate call shape
// below) — duplicated here rather than imported from MyTracks.jsx since
// that file doesn't export it; this is the same one-line derivation from
// the same source data, not a new pattern.
const GYMID_BY_MODULE = Object.fromEntries(MODULE_SEARCH_INDEX.map(m => [m.id, m.gymId]));

const COLLAPSED_WIDTH = 264;
const EXPANDED_WIDTH = 320;
const EXPANDED_MAX_HEIGHT = 320;
const CLOSE_DELAY_MS = 220;

/**
 * Hover/tap glossary popup — Glossary 2.0 (G0, 2026-07-22).
 *
 * Wraps the FIRST occurrence of a defined term inside a rendered module's
 * prose (see FoundationsRunner.jsx's tokenizeInline — this component is
 * mounted from the same "earliest match wins" token loop that already
 * handles **bold**/`code`/*italic*). Desktop: hover-intent shows the
 * popover (220ms close delay, cancelable by re-entering trigger or card).
 * Click/tap pins it open (survives scroll, ignores the close timer) until
 * Esc, an outside click, or another click on the trigger. Mobile/touch has
 * no hover event, so a tap goes through the same click handler and pins
 * directly — no separate touch path needed.
 *
 * `term` is a GLOSSARY entry: { term, def, sourceModuleId, sourceModuleTitle,
 * and now-optional: aliases, more, formula, seeAlso }. Legacy entries with
 * none of the optional fields render exactly as before G0 — the "See more"
 * expansion only appears when `entry.more` exists.
 *
 * `currentModuleId` lets the "full lesson" pointer hide itself when the term
 * is being shown inside the very module that teaches it in full.
 *
 * `onNavigate`, if provided, is FoundationsRunner's own `onNavigate` prop —
 * which in this app already IS `navigateTo` from App.jsx (verified:
 * App.jsx renders `<ConceptsApp onNavigate={navigateTo} .../>`, and
 * ConceptsApp threads that straight through to FoundationsRunner unchanged).
 * So calling `onNavigate({ tab: "concepts", gymId, moduleId })` deep-links
 * straight into that module's runner — same call shape as MyTracks.jsx's
 * verified "Study →" button (`onNavigateTo({ tab: "concepts", gymId:
 * GYMID_BY_MODULE[item.itemId], moduleId: item.itemId })`), just reached
 * through the prop named `onNavigate` here instead of `onNavigateTo` (no
 * new prop threaded — this chain was already wired, only the payload
 * shape — adding gymId — changes in G0). When `onNavigate` isn't passed
 * for some reason, the pointer still renders as a plain (non-clickable)
 * label so the feature degrades gracefully rather than silently doing
 * nothing.
 */
export default function GlossaryTerm({ term, children, currentModuleId, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState(null);
  // displayedTerm is what the card currently shows — starts as `term`, but
  // can swap to a different GLOSSARY entry when a seeAlso chip is clicked
  // (G0 item 3). backStack holds the terms to return to via "◂ back".
  const [displayedTerm, setDisplayedTerm] = useState(term);
  const [backStack, setBackStack] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const anchorRef = useRef(null);
  const popRef = useRef(null);
  const closeTimerRef = useRef(null);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    if (pinned) return; // pinned cards ignore the timer entirely
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, CLOSE_DELAY_MS);
  }

  function computePos(tall) {
    const r = anchorRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = tall ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
    const budget = tall ? EXPANDED_MAX_HEIGHT : 96;
    const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - width - 8));
    const spaceBelow = window.innerHeight - (r.bottom + 6);
    if (spaceBelow < budget && r.top > spaceBelow) {
      // Flip above the trigger — clip-below case (G0 item 2).
      setPos({ placement: "above", bottom: window.innerHeight - r.top + 6, left, width });
    } else {
      setPos({ placement: "below", top: r.bottom + 6, left, width });
    }
  }

  function resetToOriginal() {
    setDisplayedTerm(term);
    setBackStack([]);
    setExpanded(false);
  }

  function closeAll() {
    clearCloseTimer();
    setVisible(false);
    setPinned(false);
    resetToOriginal();
  }

  function openHover() {
    clearCloseTimer();
    computePos(expanded);
    setVisible(true);
  }

  function togglePinClick(e) {
    // Click (mouse) or tap (touch — click fires after touchend, no separate
    // touch path needed) pins the card open. A second click on an
    // already-pinned-open trigger closes it (preserves the prior
    // toggle-to-close behavior, doesn't regress it).
    e.stopPropagation();
    clearCloseTimer();
    if (pinned && visible) {
      closeAll();
      return;
    }
    computePos(expanded);
    setVisible(true);
    setPinned(true);
  }

  // Close on outside click/tap and Esc — ALWAYS, even when pinned (G0 item 1).
  // Close on scroll only when NOT pinned — pinned cards survive scroll.
  useEffect(() => {
    if (!visible) return;
    function onDocPointerDown(e) {
      if (anchorRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      closeAll();
    }
    function onKeyDown(e) {
      if (e.key === "Escape") closeAll();
    }
    function onScroll() {
      if (!pinned) setVisible(false);
    }
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("touchstart", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("touchstart", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, pinned]);

  useEffect(() => () => clearCloseTimer(), []);

  function handleSeeAlsoClick(key) {
    const next = GLOSSARY[key];
    if (!next) return; // FLAG-worthy at data-authoring time, not here — degrade silently
    setBackStack(s => [...s, displayedTerm]);
    setDisplayedTerm(next);
    computePos(true);
  }

  function handleBackClick() {
    setBackStack(s => {
      if (!s.length) return s;
      const prev = s[s.length - 1];
      setDisplayedTerm(prev);
      return s.slice(0, -1);
    });
    computePos(expanded);
  }

  function handleSeeMoreToggle() {
    const next = !expanded;
    setExpanded(next);
    computePos(next);
  }

  function goToSourceModule(t) {
    if (!onNavigate) return;
    closeAll();
    onNavigate({ tab: "concepts", gymId: GYMID_BY_MODULE[t.sourceModuleId], moduleId: t.sourceModuleId });
  }

  const t = displayedTerm;
  const hasMore = Boolean(t.more);
  const showPointer = t.sourceModuleId && t.sourceModuleId !== currentModuleId;
  const canGoBack = backStack.length > 0;

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={openHover}
        onMouseLeave={scheduleClose}
        onClick={togglePinClick}
        className="border-b border-dotted border-violet-500/60 cursor-help hover:border-violet-400 hover:text-violet-200 transition-colors"
      >
        {children}
      </span>

      {visible && pos && createPortal(
        <div
          ref={popRef}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
          style={{
            position: "fixed",
            ...(pos.placement === "above" ? { bottom: pos.bottom } : { top: pos.top }),
            left: pos.left,
            zIndex: 9999,
            width: pos.width,
            maxHeight: expanded ? EXPANDED_MAX_HEIGHT : undefined,
            overflowY: expanded ? "auto" : undefined,
            background: "rgba(24,24,27,0.98)",
            border: "1px solid rgba(63,63,70,0.7)",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.40)",
            padding: "0.7rem 0.8rem",
            backdropFilter: "blur(12px)",
          }}
        >
          {canGoBack && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleBackClick(); }}
              className="mb-1 text-[10px] font-mono font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              &#9668; back
            </button>
          )}

          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 mb-1.5">
            {t.term}
          </p>
          <p className="text-xs text-zinc-200 leading-relaxed">{t.def}</p>

          {!expanded && hasMore && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleSeeMoreToggle(); }}
              className="mt-1.5 text-[11px] font-mono font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              See more &#9662;
            </button>
          )}

          {/* Legacy entries (no `more`) render exactly as before G0: def + the
              conditional Full-lesson pointer, nothing else. */}
          {!hasMore && showPointer && (
            onNavigate ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToSourceModule(t); }}
                className="mt-2 text-[11px] font-mono font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                &rarr; Full lesson: {t.sourceModuleTitle || t.sourceModuleId}
              </button>
            ) : (
              <p className="mt-2 text-[11px] font-mono text-zinc-500">
                &rarr; Full lesson: {t.sourceModuleTitle || t.sourceModuleId}
              </p>
            )
          )}

          {expanded && hasMore && (
            <>
              <p className="text-xs text-zinc-300 leading-relaxed mt-2">{t.more}</p>

              {t.formula && (
                <p className="mt-2 text-[11px] font-mono text-violet-300 bg-violet-950/30 border border-violet-800/40 rounded px-2 py-1">
                  {t.formula}
                </p>
              )}

              {Array.isArray(t.seeAlso) && t.seeAlso.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.seeAlso.map(key => (
                    GLOSSARY[key] ? (
                      <button
                        key={key}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSeeAlsoClick(key); }}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-violet-500/60 hover:text-violet-300 transition-colors"
                      >
                        {GLOSSARY[key].term}
                      </button>
                    ) : null
                  ))}
                </div>
              )}

              {showPointer && (
                onNavigate ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goToSourceModule(t); }}
                    className="mt-2 text-[11px] font-mono font-bold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Taught in: {t.sourceModuleTitle || t.sourceModuleId} &rarr;
                  </button>
                ) : (
                  <p className="mt-2 text-[11px] font-mono text-zinc-500">
                    Taught in: {t.sourceModuleTitle || t.sourceModuleId} &rarr;
                  </p>
                )
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
