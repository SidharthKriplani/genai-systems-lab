// src/components/RichText.jsx — shared minimal markdown renderer + click-to-format
// toolbar for the Notes feature (My Tracks) and QnA panel. Storage stays plain
// markdown text (**bold**, *italic*, ~~strikethrough~~); Md renders it, FormatToolbar
// wraps a <textarea>'s current selection in the chosen delimiter on click.

export function Md({ text, className }) {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*|~~[^~]+~~|\*[^*\n]+\*)/g);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={i} className="text-zinc-100 font-semibold">{p.slice(2, -2)}</strong>;
        if (p.startsWith("~~") && p.endsWith("~~"))
          return <s key={i}>{p.slice(2, -2)}</s>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
          return <em key={i}>{p.slice(1, -1)}</em>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

const MARKS = [
  { key: "bold", label: "B", wrap: "**", title: "Bold" },
  { key: "italic", label: "I", wrap: "*", title: "Italic" },
  { key: "strike", label: "S", wrap: "~~", title: "Strikethrough" },
];

// Wraps (or unwraps, if already wrapped) the current selection with `wrap`.
// Returns the new full text plus the selection range to restore.
function applyMark(value, selStart, selEnd, wrap) {
  const before = value.slice(0, selStart);
  const sel = value.slice(selStart, selEnd);
  const after = value.slice(selEnd);
  const already = sel.startsWith(wrap) && sel.endsWith(wrap) && sel.length >= wrap.length * 2;
  if (already) {
    const inner = sel.slice(wrap.length, sel.length - wrap.length);
    return { text: before + inner + after, start: selStart, end: selStart + inner.length };
  }
  const inner = sel || "text";
  const next = before + wrap + inner + wrap + after;
  return { text: next, start: selStart + wrap.length, end: selStart + wrap.length + inner.length };
}

// textareaRef must point at the <textarea> being formatted; value/onChange are the
// controlled string pair backing it. onMouseDown preventDefault keeps the textarea
// focused (and its selection intact) when a toolbar button is clicked.
export function FormatToolbar({ textareaRef, value, onChange, className, style }) {
  function handleMark(wrap) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const { text, start: ns, end: ne } = applyMark(value, start, end, wrap);
    onChange(text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(ns, ne);
    });
  }

  return (
    <div className={className} style={{ display: "flex", gap: "0.25rem", ...style }}>
      {MARKS.map(m => (
        <button
          key={m.key}
          type="button"
          title={m.title}
          onMouseDown={e => e.preventDefault()}
          onClick={() => handleMark(m.wrap)}
          style={{
            width: "1.5rem", height: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 700, borderRadius: "4px",
            background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.4)",
            color: "#c4b5fd", cursor: "pointer", padding: 0,
            fontStyle: m.key === "italic" ? "italic" : "normal",
            textDecoration: m.key === "strike" ? "line-through" : "none",
          }}
        >{m.label}</button>
      ))}
    </div>
  );
}
