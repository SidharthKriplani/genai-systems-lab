import { useState } from "react";
import CaseChains from "./CaseChains";

// Case Room — first-class home for L2 Case Chains (the compounding-diagnosis engine),
// previously reachable only inside the retired domain hubs. Pick a domain, work the
// multi-step chain: each fix you make surfaces the next failure layer.

const DOMAINS = [
  { id: "retrieval", label: "Retrieval" },
  { id: "agents", label: "Agents" },
  { id: "eval", label: "Evaluation" },
  { id: "production", label: "Production" },
  { id: "foundations", label: "Foundations" },
];

export default function CaseRoom({ onExit }) {
  const [domain, setDomain] = useState("retrieval");
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          {onExit && (
            <button onClick={onExit} className="text-zinc-400 hover:text-zinc-200 text-sm">← Back</button>
          )}
          <h1 className="text-xl font-semibold text-zinc-100">
            Case Room <span className="text-cyan-400 text-sm font-normal">· multi-step failure chains — each fix surfaces the next</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDomain(d.id)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                domain === d.id
                  ? "border-cyan-700 bg-cyan-950/30 text-zinc-100"
                  : "border-zinc-800 hover:border-zinc-700 text-zinc-300"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <CaseChains domain={domain} />
      </div>
    </div>
  );
}
