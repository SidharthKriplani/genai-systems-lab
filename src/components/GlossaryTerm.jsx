import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Hover/tap glossary popup (2026-07-08).
 *
 * Wraps the FIRST occurrence of a defined term inside a rendered module's
 * prose (see FoundationsRunner.jsx's tokenizeInline — this component is
 * mounted from the same "earliest match wins" token loop that already
 * handles **bold**/`code`/*italic*). Desktop: hover shows the popover.
 * Mobile/touch: tap toggles it (no hover event exists there). Positioned via
 * a body portal + getBoundingClientRect, mirroring the pattern already used
 * by HighlightPopover.jsx / AddToTrackPopover.jsx, so the popover escapes
 * whatever `overflow` clipping the module reading pane has.
 *
 * `term` is a GLOSSARY entry: { term, def, sourceModuleId, sourceModuleTitle }.
 * `currentModuleId` lets the "full lesson" pointer hide itself when the term
 * is being shown inside the very module that teaches it in full.
 * `onNavigate`, if provided, is FoundationsRunner's own `onNavigate` prop —
 * which in this app already IS `navigateTo` from App.jsx, so calling
 * `onNavigate({ tab: "concepts", moduleId })` deep-links straight into that
 * module's runner (verified: ConceptsApp's `initialModule` effect resolves
 * the owning gym and opens the module directly). When `onNavigate` isn't
 * passed for some reason, the pointer still renders as a plain (non-clickable)
 * label so the feature degrades gracefully rather than silently doing nothing.
 */
export default function GlossaryTerm({ term, children, currentModuleId, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const anchorRef = useRef(null);
  const popRef = useRef(null);

  function computePos() {
    const r = anchorRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = 264;
    setPos({
      top: r.bottom + 6,
      left: Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - width - 8)),
    });
  }

  function show() {
    computePos();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  // Close on outside click/tap (covers the mobile tap-to-open case) and on scroll
  // (avoid a stale-position popover, same call as HighlightPopover.jsx).
  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e) {
      if (anchorRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onScroll() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("touchstart", onDocPointerDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("touchstart", onDocPointerDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  function handleClick(e) {
    // Touch devices have no hover — tap toggles instead. Harmless on desktop too
    // (a click after a hover-open just keeps it open / closes it on a second tap).
    e.stopPropagation();
    setOpen(o => !o);
  }

  const showPointer = term.sourceModuleId && term.sourceModuleId !== currentModuleId;

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={handleClick}
        className="border-b border-dotted border-violet-500/60 cursor-help hover:border-violet-400 hover:text-violet-200 transition-colors"
      >
        {children}
      </span>

      {open && pos && createPortal(
        <div
          ref={popRef}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={hide}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            width: 264,
            background: "rgba(24,24,27,0.98)",
            border: "1px solid rgba(63,63,70,0.7)",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.40)",
            padding: "0.7rem 0.8rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400 mb-1.5">
            {term.term}
          </p>
          <p className="text-xs text-zinc-200 leading-relaxed">{term.def}</p>
          {showPointer && (
            onNavigate ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onNavigate({ tab: "concepts", moduleId: term.sourceModuleId });
                }}
                className="mt-2 text-[11px] font-mono font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                → Full lesson: {term.sourceModuleTitle || term.sourceModuleId}
              </button>
            ) : (
              <p className="mt-2 text-[11px] font-mono text-zinc-500">
                → Full lesson: {term.sourceModuleTitle || term.sourceModuleId}
              </p>
            )
          )}
        </div>,
        document.body
      )}
    </>
  );
}
