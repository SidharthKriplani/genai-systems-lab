import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { AddToTrackPopover } from "../AddToTrackPopover.jsx";
import { quickAddItem, getQuickAdd } from "../utils/tracks.js";
import { HIGHLIGHT_COLORS } from "../utils/highlightColors.js";
import { addHighlight, occurrenceOfSelection, applyAll, removeHighlight, unpaint } from "../utils/localHighlights.js";

/**
 * Highlight-to-track MVP (2026-07-08).
 *
 * Scoped text-selection toolbar for Foundations module content. Mounted
 * once by FoundationsRunner with `containerRef` pointing at the module's own
 * content wrapper — never the app shell/sidebar/nav — so selecting text
 * anywhere outside the lesson body never triggers this.
 *
 * Deliberately v1-scoped: a highlight is captured as a SNAPSHOT item in the
 * existing Tracks system (text + color + optional note + a jump-back link
 * via moduleId/gymId). It does NOT repaint a <mark> onto the source text on
 * revisit — anchoring an arbitrary selection across re-renders is a harder,
 * explicitly out-of-scope problem for this pass.
 *
 * Save mechanism intentionally mirrors AddTrackBtn exactly: quick-add (if on
 * and a last track exists) saves straight through and flashes a toast;
 * otherwise it opens the same AddToTrackPopover picker used everywhere else
 * — no parallel save path.
 */
export default function HighlightPopover({ containerRef, moduleId, gymId, sourceLabel }) {
  const [sel, setSel]             = useState(null); // { text, rect }
  const [color, setColor]         = useState(null);
  const [pickerFor, setPickerFor] = useState(null); // pending {id,label,meta} while the track picker is open
  const [pickerPos, setPickerPos] = useState({ top: 0, right: 0 });
  const pageKey = `fnd::${gymId || ""}::${moduleId || ""}`;
  // In-place persistence (MSL parity, 2026-07-22): repaint saved marks after the
  // module content settles; applyAll is idempotent so two passes are safe.
  useEffect(() => {
    const el = containerRef?.current; if (!el) return;
    const t1 = setTimeout(() => applyAll(el, pageKey), 0);
    const t2 = setTimeout(() => applyAll(el, pageKey), 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [containerRef, pageKey]);
  // Click a painted mark -> remove it (same contract as the global marker pen).
  useEffect(() => {
    const el = containerRef?.current; if (!el) return;
    const onClick = (e) => {
      const m = e.target instanceof Element ? e.target.closest("mark[data-hl-id]") : null;
      if (!m || !el.contains(m)) return;
      const id = m.getAttribute("data-hl-id");
      if (id && window.confirm("Remove this highlight?")) { removeHighlight(pageKey, id); unpaint(el, id); }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [containerRef, pageKey]);
  function paintGenId() { return `hl_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
  const [flash, setFlash]         = useState(null);
  const [toastPos, setToastPos]   = useState({ top: 80, right: 24 });
  const flashTimer = useRef(null);
  const toolbarRef = useRef(null);

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const updateSelection = useCallback(() => {
    const container = containerRef.current;
    if (!container) { setSel(null); return; }
    const s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0) { setSel(null); return; }
    const text = s.toString().trim();
    if (!text) { setSel(null); return; }
    const anchor = s.anchorNode, focus = s.focusNode;
    if (!anchor || !focus || !container.contains(anchor) || !container.contains(focus)) {
      setSel(null);
      return;
    }
    const rect = s.getRangeAt(0).getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) { setSel(null); return; }
    setSel({ text, rect });
    setColor(null); // a fresh selection clears any previously-picked color
  }, [containerRef]);

  useEffect(() => {
    function onMouseUp(e) {
      // Mouseups on our own toolbar are handled by button onClicks, not selection.
      if (toolbarRef.current && toolbarRef.current.contains(e.target)) return;
      setTimeout(updateSelection, 0);
    }
    function onKeyUp(e) {
      if (e.key === "Shift" || e.shiftKey) setTimeout(updateSelection, 0);
    }
    function onSelectionChange() {
      const s = window.getSelection();
      if (!s || s.isCollapsed) setSel(null);
    }
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [updateSelection]);

  // Hide (don't try to reposition) on scroll — avoids a stale-position toolbar.
  useEffect(() => {
    function onScroll() { setSel(prev => (prev ? null : prev)); }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  function reset() {
    setSel(null);
    setColor(null);
    try { window.getSelection()?.removeAllRanges(); } catch { /* ignore */ }
  }

  function showFlash(name, rect) {
    if (rect) setToastPos({ top: rect.bottom + 6, right: Math.max(8, window.innerWidth - rect.right) });
    setFlash(name);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1600);
  }

  function handleSave(e) {
    if (!sel) return; // color optional (MSL parity): save without color = plain capture
    const id = `hl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const label = sel.text.length > 80 ? sel.text.slice(0, 80).trim() + "…" : sel.text;
    const meta = {
      text: sel.text,
      color,
      note: "",
      sourceLabel: sourceLabel || "",
      gymId: gymId || null,
      moduleId: moduleId || null,
    };
    const toolbarRect = toolbarRef.current?.getBoundingClientRect();

    // Alt/Cmd/Ctrl/Shift-click always opens the picker, even with quick-add on —
    // same escape hatch AddTrackBtn already gives every other + button.
    const forcePicker = e.altKey || e.metaKey || e.ctrlKey || e.shiftKey;
    if (!forcePicker && getQuickAdd()) {
      const t = quickAddItem("highlight", id, label, meta);
      if (t) {
        reset();
        showFlash(t.name, toolbarRect);
        return;
      }
    }

    // No quick-add (or no last track yet) — open the exact same track picker
    // used everywhere else in the app, anchored under the toolbar.
    if (toolbarRect) setPickerPos({ top: toolbarRect.bottom + 6, right: Math.max(8, window.innerWidth - toolbarRect.right) });
    setPickerFor({ id, label, meta });
    setSel(null); // hide the swatch toolbar; the picker takes over
  }

  if (!sel && !pickerFor && !flash) return null;

  return (
    <>
      {sel && createPortal(
        <div
          ref={toolbarRef}
          onMouseDown={e => e.preventDefault()} // keep the text selection alive while interacting with the toolbar
          style={{
            position: "fixed",
            top: Math.max(8, sel.rect.top - 54),
            left: Math.min(Math.max(8, sel.rect.left + sel.rect.width / 2 - 90), Math.max(8, window.innerWidth - 188)),
            zIndex: 9999,
            width: 180,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(24,24,27,0.98)",
            border: "1px solid rgba(63,63,70,0.7)",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.40)",
            padding: "0.45rem 0.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          {HIGHLIGHT_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setColor(c.id);
                // MSL-parity: paint + persist in place immediately; Save (track) stays optional.
                const el = containerRef?.current;
                if (el && sel?.text && (el.textContent || "").includes(sel.text)) {
                  const n = occurrenceOfSelection(el, sel.text);
                  addHighlight(pageKey, { id: paintGenId(), text: sel.text, n, color: c.id });
                  applyAll(el, pageKey);
                }
              }}
              title={c.label}
              style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                background: c.hex, cursor: "pointer", padding: 0,
                border: color === c.id ? "2px solid #fff" : "2px solid transparent",
                boxShadow: color === c.id ? `0 0 0 2px ${c.hex}` : "none",
              }}
            />
          ))}
          <button
            onClick={handleSave}
            title="Save highlight to a track (color optional)"
            style={{
              marginLeft: "auto",
              background: "#7c3aed",
              color: "#fff",
              border: "none", borderRadius: "6px",
              padding: "0.3rem 0.6rem", fontSize: "0.72rem", fontWeight: 700,
              cursor: "pointer", flexShrink: 0,
            }}
          >Save</button>
        </div>,
        document.body
      )}

      {pickerFor && createPortal(
        <AddToTrackPopover
          itemType="highlight"
          itemId={pickerFor.id}
          label={pickerFor.label}
          itemMeta={pickerFor.meta}
          onClose={() => { setPickerFor(null); reset(); }}
          fixedPos={pickerPos}
        />,
        document.body
      )}

      {flash && createPortal(
        <div style={{ position: "fixed", top: toastPos.top, right: toastPos.right, zIndex: 9999, background: "rgba(24,24,27,0.98)", border: "1px solid rgba(63,63,70,0.7)", borderRadius: "7px", boxShadow: "0 6px 20px rgba(0,0,0,0.40)", padding: "0.4rem 0.7rem", fontSize: "0.75rem", color: "#f4f4f5", whiteSpace: "nowrap", pointerEvents: "none", backdropFilter: "blur(12px)" }}>
          ✓ Saved to <strong>{flash}</strong>
        </div>,
        document.body
      )}
    </>
  );
}
