import { useState } from "react";

// ─── AttentionScenes ───────────────────────────────────────────────────────
// One 3b1b-style scene for the `attention` module (see 3B1B-STANDARD.md).
// Text–scene lock: the module's own "agreed" sentence and its own already-
// computed numbers (raw scores 1.82/0.8/0.3/0.2/0.12, softmax 51/18/11/10/9%,
// equal-weight 20% each). Mode C (unscaled pile-up) reuses the module's own
// illustrative framing ("say 40 vs 2 vs -15") scaled to the same 5 candidates
// — explicitly labeled illustrative, not a measured real-model number.
//
// Rebuilt ground-up (2026-07-09) to fix: node labels overflowing their circles,
// a connector-line stroke width that scaled unbounded (near-invisible at low
// weight, ~34px at high weight), and cramped vertical spacing. Nodes are now
// auto-width pills sized to their own label so text can never clip; connector
// width is clamped to a gentle 1.5–8.5px range with opacity + color doing most
// of the "how strong" signaling instead of raw thickness.

const CANDIDATES = [
  { key: "surgeon", label: "surgeon", raw: 1.82 },
  { key: "patient", label: "patient", raw: 0.8 },
  { key: "who", label: "who", raw: 0.3 },
  { key: "treated", label: "treated", raw: 0.2 },
  { key: "the", label: "the", raw: 0.12 },
];

// Mode B — the module's own already-computed softmax weights (exact numbers, not recomputed).
const REAL_WEIGHTS = { surgeon: 0.51, patient: 0.18, who: 0.11, treated: 0.10, the: 0.09 };
// Mode A — equal split across the five candidates (the module's own "20% each" claim).
const EQUAL_WEIGHTS = { surgeon: 0.20, patient: 0.20, who: 0.20, treated: 0.20, the: 0.20 };
// Mode C — illustrative pile-up: same 5 raw scores scaled ×22 (standing in for a 128-term sum
// instead of a 4-term one) and softmaxed with NO √d_k division. Labeled illustrative in the caption.
function softmax(scores) {
  const mx = Math.max(...scores);
  const exps = scores.map(s => Math.exp(s - mx));
  const z = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / z);
}
const PILEUP_SCALE = 22;
const pileupScores = CANDIDATES.map(c => c.raw * PILEUP_SCALE);
const pileupSm = softmax(pileupScores);
const PILEUP_WEIGHTS = Object.fromEntries(CANDIDATES.map((c, i) => [c.key, pileupSm[i]]));

const MODES = [
  { id: "equal", label: "Equal weighting", weights: EQUAL_WEIGHTS },
  { id: "real", label: "Learned Q·K → softmax (real numbers)", weights: REAL_WEIGHTS },
  { id: "pileup", label: "No √d_k scaling (128-term pile-up)", weights: PILEUP_WEIGHTS },
];

function fmtPct(w) {
  return w < 0.001 ? "≈0%" : w >= 0.999 ? "≈100%" : `${(w * 100).toFixed(w < 0.1 ? 1 : 0)}%`;
}

// Auto-sized pill so a label can never overflow its own node.
const CHAR_W = 6.8; // monospace advance width at fontSize 11
const PAD_X = 14;
function pillWidth(label) {
  return Math.max(46, label.length * CHAR_W + PAD_X * 2);
}
const PILL_H = 26;

// Strength → color: dark zinc at 0%, bright violet at 100% — same "brighter = more
// relevant" register as the rest of the module's visuals.
function heatColor(w) {
  const t = Math.max(0, Math.min(1, w));
  const r = Math.round(63 + t * (167 - 63));
  const g = Math.round(63 + t * (139 - 63));
  const b = Math.round(70 + t * (250 - 70));
  return `rgb(${r},${g},${b})`;
}

const VB_W = 600, VB_H = 320;
const QX = 92, QY = VB_H / 2;
const CX = VB_W - 150;
const TOP = 40, BOTTOM = VB_H - 40;
const CYS = CANDIDATES.map((_, i) => TOP + (i * (BOTTOM - TOP)) / (CANDIDATES.length - 1));

export function SceneRelevanceMatch() {
  const [modeIdx, setModeIdx] = useState(0);
  const [gate, setGate] = useState(null); // null | 'asked' | 'more' | 'less' | 'same'
  const mode = MODES[modeIdx];
  const weightsArr = CANDIDATES.map(c => mode.weights[c.key]);
  const maxW = Math.max(...weightsArr);

  function selectMode(i) {
    if (i === 2 && gate !== "more") { setGate("asked"); return; }
    setModeIdx(i);
  }
  function answerGate(choice) {
    setGate(choice);
    if (choice === "more") setModeIdx(2);
  }

  const caption =
    mode.id === "equal"
      ? "Equal weighting: every candidate gets 1/5 = 20%, whether or not it's actually relevant. surgeon — the token that answers 'agreed by whom?' — gets no more say than the filler word 'the'. This is the dilution problem: signal and noise contribute identically."
      : mode.id === "real"
      ? "The module's own real numbers: Q_agreed · K_surgeon = 1.82, softmaxed against the other four raw scores, lands surgeon at 51% — more than double its 20% equal share — while 'the' drops to 9%, under half its equal share. Learned relevance, not a rule."
      : `Illustrative, not measured: scale these same five raw scores ×${PILEUP_SCALE} — standing in for a 128-term dot product instead of this toy example's 4 terms, with no √d_k division applied. softmax(40.0, 17.6, 6.6, 4.4, 2.6) hands surgeon ${fmtPct(PILEUP_WEIGHTS.surgeon)} of the weight and every other candidate ${fmtPct(PILEUP_WEIGHTS.patient)} or less. One winner, everyone else silenced — the near-zero gradient problem dividing by √d_k exists to prevent.`;

  const qW = pillWidth("agreed");

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Scene · Who does 'agreed' listen to?</div>
        <div className="flex gap-2 flex-wrap">
          {MODES.map((m, i) => (
            <button key={m.id} onClick={() => selectMode(i)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${modeIdx === i ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {gate === "asked" && (
        <div className="rounded-lg border border-violet-600/40 bg-violet-600/10 p-3 space-y-2">
          <p className="text-xs text-zinc-300 font-medium">
            Pause and predict: real attention sums 64–128 term pairs, not this toy example's 4. Skip the
            √d_k division entirely — does softmax become <em>more</em> decisive, <em>less</em> decisive, or unchanged?
          </p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => answerGate("more")} className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all">More decisive — near one-hot</button>
            <button onClick={() => answerGate("less")} className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all">Less decisive — flatter</button>
            <button onClick={() => answerGate("same")} className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all">Unchanged</button>
          </div>
          {gate === "less" && <p className="text-xs text-amber-400">Not quite — bigger sums mean wilder scores, and softmax's exponential turns wider gaps into more extreme ones. Try "more decisive".</p>}
          {gate === "same" && <p className="text-xs text-amber-400">Not quite — the scale of the scores feeding softmax changes its output shape. Try again.</p>}
        </div>
      )}

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full">
        {/* connector lines first, so pills always sit visually on top */}
        {CANDIDATES.map((c, i) => {
          const w = mode.weights[c.key];
          const cy = CYS[i];
          const cw = pillWidth(c.label);
          const sw = 1.5 + Math.sqrt(Math.max(0, w)) * 7; // clamped ~1.5px → ~8.5px, never a "thick bar"
          return (
            <line key={"e" + c.key} x1={QX + qW / 2} y1={QY} x2={CX - cw / 2} y2={cy}
              stroke={heatColor(w)} strokeWidth={sw} opacity={Math.max(0.28, w * 0.85 + 0.15)}
              style={{ transition: "stroke-width .4s, opacity .4s, stroke .4s" }} />
          );
        })}

        {/* query pill — auto-width, label can never clip */}
        <rect x={QX - qW / 2} y={QY - PILL_H / 2} width={qW} height={PILL_H} rx={PILL_H / 2}
          fill="#18181b" stroke="#22d3ee" strokeWidth="2" />
        <text x={QX} y={QY + 4} textAnchor="middle" fill="#67e8f9" fontSize="11" fontFamily="monospace" fontWeight="600">agreed</text>
        <text x={QX} y={QY + PILL_H / 2 + 18} textAnchor="middle" fill="#71717a" fontSize="9">the query — searching</text>

        {/* candidate pills + percentage readout, each auto-width to its own label */}
        {CANDIDATES.map((c, i) => {
          const w = mode.weights[c.key];
          const cy = CYS[i];
          const cw = pillWidth(c.label);
          const isTop = mode.id !== "equal" && w === maxW;
          return (
            <g key={c.key}>
              <rect x={CX - cw / 2} y={cy - PILL_H / 2} width={cw} height={PILL_H} rx={PILL_H / 2}
                fill="#18181b" stroke={isTop ? "#c4b5fd" : "#52525b"} strokeWidth={isTop ? "2" : "1.5"} />
              <text x={CX} y={cy + 4} textAnchor="middle" fill={isTop ? "#e9d5ff" : "#a1a1aa"} fontSize="10" fontFamily="monospace">{c.label}</text>
              <text x={CX + cw / 2 + 14} y={cy + 4} textAnchor="start" fill="#e4e4e7" fontSize="13" fontFamily="monospace" fontWeight="700">
                {fmtPct(w)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-violet-600/50 pl-3">{caption}</p>
    </div>
  );
}

export default function AttentionScenes() {
  return <SceneRelevanceMatch />;
}
