// ContinueStrip — "Continue where you left off" card for the Progress page.
// Reads utils/lastTouched.js (written by FoundationsRunner on module open)
// and deep-links back via Progress.jsx's `navigate` prop (passed here as
// onNavigate), signature: navigate(view, conceptsCtx) — same contract every
// other Concepts deep-link in Progress.jsx already uses.
import { getLastTouched } from "../utils/lastTouched.js";

export default function ContinueStrip({ onNavigate }) {
  const info = getLastTouched();
  if (!info) return null;

  return (
    <div
      onClick={() => onNavigate && onNavigate("concepts", { gymId: info.gymId, moduleId: info.moduleId })}
      className="rounded-xl px-5 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
      style={{ background: "linear-gradient(160deg, rgba(24,24,27,0.95) 0%, rgba(15,15,17,0.95) 100%)", border: "1px solid rgba(63,63,70,0.6)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(63,63,70,0.6)"; }}
    >
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#f59e0b" }}>Continue</div>
        <div className="text-sm font-semibold text-zinc-100 truncate">{info.title || info.moduleId}</div>
      </div>
      <span className="text-xs font-bold flex-shrink-0" style={{ color: "#f59e0b" }}>Resume &rarr;</span>
    </div>
  );
}
