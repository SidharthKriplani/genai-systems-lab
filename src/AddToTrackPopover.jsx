import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  getTracks, createTrack,
  addQuestion, getTracksForQuestion,
  addItem, getTracksForItem,
  getQuickAdd, setQuickAdd, getLastTrack, quickAddItem,
} from "./utils/tracks.js";

/**
 * Popover for adding content to a track.
 *
 * Preplab mode (existing):  pass questionId, title, topic, difficulty
 * Generic mode (new):       pass itemType, itemId, label, itemMeta
 *
 * fixedPos: { top, right } — uses position:fixed (portal mode)
 * Without fixedPos: position:absolute relative to nearest positioned ancestor.
 */
export function AddToTrackPopover({
  // preplab props
  questionId, title, topic, difficulty,
  // generic props
  itemType, itemId, label, itemMeta,
  // shared
  onClose, anchorRef, fixedPos,
}) {
  const isGeneric = !!itemType;

  const [tracks, setTracks]     = useState(() => getTracks());
  const [inTracks, setInTracks] = useState(() =>
    isGeneric
      ? getTracksForItem(itemType, itemId)
      : getTracksForQuestion(questionId)
  );
  const [newName, setNewName]   = useState("");
  const [creating, setCreating] = useState(false);
  const [quick, setQuick] = useState(() => getQuickAdd());
  const lastTrack = getLastTrack();
  const popoverRef = useRef(null);
  const inputRef   = useRef(null);

  const posStyle = fixedPos
    ? { position: "fixed", top: fixedPos.top, right: fixedPos.right, marginTop: 0 }
    : { position: "absolute", top: "100%", right: 0, marginTop: "6px" };

  useEffect(() => {
    function handle(e) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target))
      ) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose, anchorRef]);

  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  function refresh() {
    setTracks(getTracks());
    setInTracks(
      isGeneric
        ? getTracksForItem(itemType, itemId)
        : getTracksForQuestion(questionId)
    );
  }

  function handleToggle(trackId) {
    if (!inTracks.includes(trackId)) {
      if (isGeneric) {
        addItem(trackId, itemType, itemId, label || "", itemMeta || {});
      } else {
        addQuestion(trackId, questionId, title, topic, difficulty);
      }
    }
    refresh();
  }

  function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const t = createTrack(newName.trim());
    if (isGeneric) {
      addItem(t.id, itemType, itemId, label || "", itemMeta || {});
    } else {
      addQuestion(t.id, questionId, title, topic, difficulty);
    }
    setNewName("");
    setCreating(false);
    refresh();
  }

  return (
    <div
      ref={popoverRef}
      style={{
        ...posStyle,
        zIndex: 9999,
        background: "rgba(24,24,27,0.98)",
        border: "1px solid rgba(63,63,70,0.7)",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.40)",
        minWidth: "220px",
        maxWidth: "270px",
        padding: "0.6rem 0",
        fontSize: "0.82rem",
        backdropFilter: "blur(12px)",
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: "0.25rem 0.85rem 0.5rem", fontWeight: 700, fontSize: "0.72rem", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        Add to Track
      </div>

      {tracks.length === 0 && !creating && (
        <div style={{ padding: "0.3rem 0.85rem 0.5rem", color: "#71717a", fontSize: "0.8rem" }}>No tracks yet.</div>
      )}

      {tracks.map(t => {
        const added = inTracks.includes(t.id);
        return (
          <button
            key={t.id}
            onClick={() => handleToggle(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.55rem",
              width: "100%", textAlign: "left", background: "none", border: "none",
              cursor: added ? "default" : "pointer", padding: "0.45rem 0.85rem",
              color: added ? "#a78bfa" : "#d4d4d8", fontWeight: added ? 600 : 400,
              fontSize: "0.83rem", transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (!added) e.currentTarget.style.background = "rgba(63,63,70,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: added ? "2px solid #8b5cf6" : "2px solid #52525b",
              background: added ? "#8b5cf6" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.65rem", color: "#fff",
            }}>
              {added ? "✓" : ""}
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{t.name}</span>
          </button>
        );
      })}

      <div style={{ borderTop: "1px solid rgba(63,63,70,0.6)", marginTop: "0.4rem", paddingTop: "0.4rem" }}>
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              width: "100%", textAlign: "left", background: "none", border: "none",
              cursor: "pointer", padding: "0.45rem 0.85rem",
              color: "#a78bfa", fontSize: "0.83rem", fontWeight: 600,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(63,63,70,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
          >
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span> New track
          </button>
        ) : (
          <form onSubmit={handleCreate} style={{ padding: "0.35rem 0.65rem", display: "flex", gap: "0.4rem" }}>
            <input
              ref={inputRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Track name…"
              style={{
                flex: 1, fontSize: "0.8rem", padding: "0.3rem 0.5rem",
                background: "rgba(39,39,42,0.8)", border: "1px solid rgba(63,63,70,0.7)",
                borderRadius: "5px", color: "#f4f4f5", outline: "none",
              }}
              onKeyDown={e => { if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              style={{
                background: "#7c3aed", color: "#fff", border: "none",
                borderRadius: "5px", padding: "0.3rem 0.6rem", cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 600, opacity: newName.trim() ? 1 : 0.4,
              }}
            >Add</button>
          </form>
        )}
      </div>

      {/* Quick-add preference — when on, the + button skips this picker. */}
      <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", borderTop: "1px solid rgba(63,63,70,0.6)", marginTop: "0.4rem", padding: "0.5rem 0.85rem 0.15rem", cursor: "pointer", color: "#a1a1aa" }}>
        <input type="checkbox" checked={quick} onChange={e => { const on = e.target.checked; setQuick(on); setQuickAdd(on); }} style={{ marginTop: "2px", accentColor: "#8b5cf6", cursor: "pointer", flexShrink: 0 }} />
        <span style={{ fontSize: "0.74rem", lineHeight: 1.4 }}>
          Quick-add: skip this menu, drop straight into <strong style={{ color: "#f4f4f5" }}>{lastTrack ? lastTrack.name : "my last track"}</strong>.
          <br />
          <span style={{ color: "#71717a", fontSize: "0.68rem" }}>Alt- or right-click the + to still choose.</span>
        </span>
      </label>
    </div>
  );
}

/**
 * Self-contained + button that opens a portal-based AddToTrackPopover.
 * Escapes overflow:hidden containers via createPortal + getBoundingClientRect.
 * Use for any content type (GroundTruth posts, Foundations questions, etc.)
 */
export function AddTrackBtn({ itemType, itemId, label, itemMeta = {} }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [flash, setFlash] = useState(null);
  const flashTimer = useRef(null);

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  function computePos() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  }
  function showFlash(name) {
    setFlash(name);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1400);
  }
  function handleClick(e) {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    computePos();
    const forcePicker = e.altKey || e.metaKey || e.ctrlKey || e.shiftKey;
    if (!forcePicker && getQuickAdd()) {
      const t = quickAddItem(itemType, itemId, label || "", itemMeta || {});
      if (t) { showFlash(t.name); return; }
    }
    setOpen(true);
  }
  // Alt/right-click always opens the picker, even when quick-add is on.
  function handleContext(e) {
    e.preventDefault(); e.stopPropagation();
    if (open) { setOpen(false); return; }
    computePos(); setOpen(true);
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        onContextMenu={handleContext}
        title={getQuickAdd() ? "Quick-add to last track · Alt/right-click to choose" : "Add to track"}
        style={{
          background: "none",
          border: "1px solid " + (flash ? "#22c55e" : "rgba(63,63,70,0.7)"),
          borderRadius: "5px",
          cursor: "pointer",
          padding: "2px 7px",
          fontSize: "13px",
          color: flash ? "#22c55e" : "#a78bfa",
          flexShrink: 0,
          lineHeight: 1,
          fontWeight: 700,
          transition: "color 0.15s, border-color 0.15s",
        }}
      >{flash ? "✓" : "+"}</button>
      {flash && createPortal(
        <div style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999, background: "rgba(24,24,27,0.98)", border: "1px solid rgba(63,63,70,0.7)", borderRadius: "7px", boxShadow: "0 6px 20px rgba(0,0,0,0.40)", padding: "0.4rem 0.7rem", fontSize: "0.75rem", color: "#f4f4f5", whiteSpace: "nowrap", pointerEvents: "none", backdropFilter: "blur(12px)" }}>
          ✓ Added to <strong>{flash}</strong>
        </div>,
        document.body
      )}
      {open && createPortal(
        <AddToTrackPopover
          itemType={itemType}
          itemId={itemId}
          label={label}
          itemMeta={itemMeta}
          onClose={() => setOpen(false)}
          anchorRef={btnRef}
          fixedPos={pos}
        />,
        document.body
      )}
    </>
  );
}
