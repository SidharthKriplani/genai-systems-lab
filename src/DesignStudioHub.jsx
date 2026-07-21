import { useState } from "react";
import DesignStudio from "./DesignStudio";
import SystemDesignTrainer from "./SystemDesignTrainer";

// Unified "Design Studio" over the two produce-then-self-critique surfaces:
//   • Artifact briefs -> produce an artifact, self-critique vs reference + rubric (DesignStudio)
//   • System design   -> staged system-design scenarios, self-score rubric (SystemDesignTrainer)
// Absorbs the former standalone "System Design" interview door. Inner apps unchanged.

export default function DesignStudioHub({ onExit, initialMode = "studio" }) {
  const [mode, setMode] = useState(initialMode);
  const seg = (active) =>
    `flex-1 px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-cyan-600 text-white" : "bg-transparent text-zinc-400 hover:text-zinc-200"
    }`;
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 mb-1">
          <button className={seg(mode === "studio")} onClick={() => setMode("studio")}>Artifact briefs</button>
          <button className={seg(mode === "sysdesign")} onClick={() => setMode("sysdesign")}>System design</button>
        </div>
      </div>
      {mode === "studio"
        ? <DesignStudio onExit={onExit} />
        : <SystemDesignTrainer onExit={onExit} />}
    </div>
  );
}
