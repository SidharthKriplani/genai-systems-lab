import { useState } from "react";

// GradePack — interactive attempt -> self-score -> BYO-LLM grade-pack export (GSL).
// No in-app LLM: write your answer, self-score the anchored rubric, then export a
// portable prompt to paste into ANY LLM for a graded, adversarial report. The
// checklist anchors ARE the market bar.

const MARKS = [
  { id: "hit", label: "Hit" },
  { id: "partial", label: "Partial" },
  { id: "miss", label: "Miss" },
];

function buildGradePack(brief, answer) {
  const role = brief.difficulty === "staff" ? "STAFF" : "SENIOR";
  const rubric = brief.rubric || [];
  const checklist = rubric
    .map((r, i) => `${i + 1}. ${r.dim} | anchor: ${r.anchor} | cost if missed: ${r.cost}`)
    .join("\n");
  const reference = brief.reference && brief.reference.type
    ? `(reference type: ${brief.reference.type} — may be partial; anchor on the checklist)`
    : "(no reference provided — anchor strictly on the checklist)";
  return `You are a skeptical ${role} engineer at a top product company, grading a candidate's answer to the design problem below. Calibrate to that bar:
 - strong-hire = clears EVERY checklist anchor AND names the key tradeoff
 - hire        = clears all but one anchor
 - lean-no     = misses one anchor OR hand-waves the central tradeoff
 - no-hire     = misses >= 2 anchors
Do NOT be encouraging. Do NOT grade harshly for its own sake. Grade REALISTICALLY against the checklist below — the checklist IS the market bar; do not invent your own. Do NOT browse or research; grade only against the material provided here.

[PROBLEM]
${brief.prompt || brief.title}
${brief.context ? "Context: " + brief.context : ""}

[WHAT A STRONG ANSWER PRODUCES]
${brief.produce && brief.produce.artifact ? brief.produce.artifact : "A complete design / decision doc."}

[CANDIDATE ANSWER]
${answer.trim() || "(the candidate left this blank)"}

[REFERENCE]
${reference}

[CHECKLIST]  (dim | anchor = the concrete thing the answer must show | cost if missed)
${checklist || "(none)"}

Do, in order:
1. GRADE — for each checklist item, mark hit / partial / miss, citing the exact line of the candidate answer as evidence (or noting its absence).
2. RED-TEAM — attack the single weakest assumption in the answer, then list the 3 sharpest follow-up questions a ${role.toLowerCase()} interviewer would fire next.
3. VERDICT — the hire-signal above, plus the top 2 gaps to fix first.
4. OUTPUT the final line exactly as: SCORE: x/${rubric.length} | SIGNAL: <band> | GAPS: <a>; <b>`;
}

export default function GradePack({ brief }) {
  const key = `gsl_gradepack_${brief.id}`;
  const [answer, setAnswer] = useState(() => {
    try { return localStorage.getItem(key) || ""; } catch { return ""; }
  });
  const [scores, setScores] = useState({});
  const [copied, setCopied] = useState(false);
  const [showPack, setShowPack] = useState(false);

  if (!brief.rubric || !brief.rubric.length) return null;

  const onAnswer = (v) => {
    setAnswer(v);
    try { localStorage.setItem(key, v); } catch {}
  };
  const pack = buildGradePack(brief, answer);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pack);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowPack(true);
    }
  };

  const markCls = (active) =>
    `text-[11px] px-2 py-0.5 rounded border transition-colors ${
      active ? "border-cyan-600 bg-cyan-950/40 text-cyan-300" : "border-zinc-700 text-zinc-500 hover:text-zinc-300"
    }`;

  return (
    <div className="border border-zinc-800 rounded-xl p-3 mt-1">
      <div className="text-sm font-semibold text-zinc-100 mb-2">Attempt → self-score → grade</div>
      <textarea
        value={answer}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Write your design from scratch — no peeking. Then self-score each anchor below and export a grade pack to run through any LLM."
        rows={8}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 text-sm leading-relaxed p-2.5 resize-y font-sans"
      />
      <div className="text-[11px] text-zinc-500 mt-2.5 mb-1">Self-score each anchor honestly — you grade what you actually wrote:</div>
      {brief.rubric.map((r, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5">
          <div className="flex-1 text-[13px] text-zinc-300">{r.dim}</div>
          {MARKS.map((m) => (
            <button key={m.id} onClick={() => setScores({ ...scores, [i]: m.id })} className={markCls(scores[i] === m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <button onClick={copy} className="text-[13px] font-semibold px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white">
          {copied ? "Copied ✓" : "Copy grade pack"}
        </button>
        <button onClick={() => setShowPack(!showPack)} className="text-[12px] px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200">
          {showPack ? "Hide preview" : "Preview"}
        </button>
        <span className="text-[11px] text-zinc-600">Paste into any LLM (free is fine) for an adversarial graded report.</span>
      </div>
      {showPack && (
        <pre className="mt-3 bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap max-h-80 overflow-auto">{pack}</pre>
      )}
    </div>
  );
}
