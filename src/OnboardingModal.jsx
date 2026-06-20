import { useState } from "react";

// ─── ONBOARDING MODAL ─────────────────────────────────────────────────────────
// 3-question first-sign-in flow. Saves to localStorage gsl-onboarding.
// Routes to the most relevant challenge area after completion.
//
// Props:
//   onComplete   — (answers) => void  — called after user finishes
//   onNavigate   — navigateTo fn from App.jsx

const STORAGE_KEY = "gsl-onboarding";

const STEPS = [
  {
    id: "timeHorizon",
    label: "When is your AI interview?",
    note: "This sets the urgency of your prep plan.",
    options: [
      { value: "2w",  label: "In 2 weeks",     sub: "Intensive sprint mode" },
      { value: "1m",  label: "In a month",      sub: "Structured daily practice" },
      { value: "3m",  label: "In 3 months",     sub: "Depth-first learning" },
      { value: "exp", label: "Just exploring",  sub: "No deadline pressure" },
    ],
  },
  {
    id: "role",
    label: "What role are you targeting?",
    note: "Shapes which modules and questions we surface first.",
    options: [
      { value: "aie",     label: "AI / ML Engineer",      sub: "RAG, agents, fine-tuning, evals" },
      { value: "applied", label: "Applied Scientist",      sub: "Modeling, research, experimentation" },
      { value: "mlops",   label: "MLOps / Platform",       sub: "Infra, serving, observability" },
      { value: "aipm",    label: "AI Product Manager",     sub: "Strategy, roadmap, AI integration" },
    ],
  },
  {
    id: "gap",
    label: "Biggest gap to close?",
    note: "We'll open the right challenge area to start.",
    options: [
      { value: "retrieval",   label: "RAG & Retrieval",          sub: "Vector search, chunking, ranking" },
      { value: "agents",      label: "Agents & Tool Use",        sub: "ReAct, memory, orchestration" },
      { value: "evaluation",  label: "Evaluation & Testing",     sub: "LLM judges, metrics, evals" },
      { value: "production",  label: "Production & LLMOps",      sub: "Serving, drift, observability" },
      { value: "foundations", label: "Foundations & Architecture", sub: "Transformers, fine-tuning, internals" },
    ],
  },
];

// Map gap answer → navigateTo call
const GAP_NAV = {
  retrieval:   { tab: "retrieval" },
  agents:      { tab: "agents" },
  evaluation:  { tab: "evaluation" },
  production:  { tab: "production" },
  foundations: { tab: "foundations" },
};

export function hasCompletedOnboarding() {
  try { return !!JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return false; }
}

export default function OnboardingModal({ onComplete, onNavigate }) {
  const [step, setStep]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [selected, setSelected] = useState(null);
  const [exiting, setExiting]   = useState(false);

  function pick(value) {
    setSelected(value);
    // Brief visual pause then advance
    setTimeout(() => advance(value), 280);
  }

  function advance(value) {
    const newAnswers = { ...answers, [STEPS[step].id]: value };
    setAnswers(newAnswers);
    setSelected(null);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish(newAnswers);
    }
  }

  function finish(finalAnswers) {
    const record = { ...finalAnswers, completedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setExiting(true);
    setTimeout(() => {
      onComplete?.(record);
      // Route to their biggest gap
      const dest = GAP_NAV[finalAnswers.gap];
      if (dest && onNavigate) onNavigate(dest);
    }, 350);
  }

  const current = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        background: "rgba(0,0,0,0.75)",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.35s ease",
      }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface, #161310)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.7)",
          transform: exiting ? "translateY(20px)" : "translateY(0)",
          transition: "transform 0.35s ease",
        }}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-800/60 relative">
          <div
            className="h-full absolute left-0 top-0 transition-all duration-300"
            style={{ width: `${progress}%`, background: "var(--gal-build, #06b6d4)" }}
          />
        </div>

        {/* Header */}
        <div className="px-5 pt-5 pb-1 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
              Step {step + 1} of {STEPS.length}
            </div>
            <h2 className="text-lg font-bold text-zinc-100 leading-snug">
              {current.label}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">{current.note}</p>
          </div>
        </div>

        {/* Options */}
        <div className="px-5 py-4 space-y-2">
          {current.options.map(opt => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => pick(opt.value)}
                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-150"
                style={{
                  background: isSelected
                    ? "color-mix(in srgb, var(--gal-build, #06b6d4) 18%, transparent)"
                    : "rgba(255,255,255,0.03)",
                  border: isSelected
                    ? "1px solid color-mix(in srgb, var(--gal-build, #06b6d4) 50%, transparent)"
                    : "1px solid rgba(255,255,255,0.06)",
                  transform: isSelected ? "scale(1.01)" : "scale(1)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 border-2 transition-all duration-150"
                    style={{
                      borderColor: isSelected
                        ? "var(--gal-build, #06b6d4)"
                        : "rgba(255,255,255,0.15)",
                      background: isSelected
                        ? "var(--gal-build, #06b6d4)"
                        : "transparent",
                    }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">{opt.label}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{opt.sub}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-1 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  background: i <= step
                    ? "var(--gal-build, #06b6d4)"
                    : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-zinc-600">
            {step === STEPS.length - 1 ? "tap to finish" : "tap to continue"}
          </span>
        </div>
      </div>
    </div>
  );
}
