import { useState } from "react";
import { Icon } from './Icon.jsx';

export default function HowTo({ objective, steps }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-violet-950/20 border border-violet-800/30 rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-violet-400 uppercase tracking-widest mb-0.5"><Icon name="target" size={14} /> Learning Objective</p>
          <p className="text-sm text-zinc-200">{objective}</p>
        </div>
        <button onClick={() => setOpen(o => !o)}
          className="text-xs text-zinc-500 hover:text-zinc-300 shrink-0 font-mono border border-zinc-700 rounded px-2 py-1 transition-all">
          {open ? "hide" : "how to use"}
        </button>
      </div>
      {open && (
        <div className="border-t border-violet-800/20 pt-2 space-y-1">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
              <span className="text-violet-500 shrink-0 font-mono">{i + 1}.</span>{s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
