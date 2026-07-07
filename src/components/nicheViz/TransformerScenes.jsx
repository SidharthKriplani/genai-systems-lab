import { useState, useRef, useEffect } from "react";

// ─── TransformerScenes ────────────────────────────────────────────────────────
// Three 3b1b-style scenes for the transformer module (see 3B1B-STANDARD.md).
// Text–scene lock: palette/blend (attention), elevator shaft/highway + pulse
// (residuals), author-vs-editor stamp test (order). Captions cash out into the
// exact technical claims used by the module prose.

// ── Scene 1 · The palette trap ────────────────────────────────────────────────
const P0 = [
  { x: 90, y: 84 }, { x: 255, y: 52 }, { x: 435, y: 92 },
  { x: 482, y: 198 }, { x: 300, y: 258 }, { x: 116, y: 218 },
];
const CENTROID = P0.reduce((a, p) => ({ x: a.x + p.x / P0.length, y: a.y + p.y / P0.length }), { x: 0, y: 0 });

function insideHull(p) {
  let inside = false;
  for (let i = 0, j = P0.length - 1; i < P0.length; j = i++) {
    const xi = P0[i].x, yi = P0[i].y, xj = P0[j].x, yj = P0[j].y;
    if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function gridFold(p) {
  const dx = p.x - CENTROID.x, dy = p.y - CENTROID.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ang = Math.atan2(dy, dx) + 0.5 * Math.sin(dist / 60);
  const r = dist * 1.55;
  return { x: CENTROID.x + r * Math.cos(ang), y: CENTROID.y + r * Math.sin(ang) };
}

function gridPaths(folded) {
  const paths = [];
  for (let x = 40; x <= 520; x += 60) {
    const pts = [];
    for (let y = 20; y <= 284; y += 16) { const p = folded ? gridFold({ x, y }) : { x, y }; pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`); }
    paths.push(pts.join(" "));
  }
  for (let y = 40; y <= 280; y += 60) {
    const pts = [];
    for (let x = 24; x <= 536; x += 16) { const p = folded ? gridFold({ x, y }) : { x, y }; pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`); }
    paths.push(pts.join(" "));
  }
  return paths;
}
const GRID_FLAT = gridPaths(false);
const GRID_FOLDED = gridPaths(true);

const GATE1_OPTIONS = ["More attention layers", "A nonlinear transformation", "More attention heads"];

export function SceneBlendTrap() {
  const [pts, setPts] = useState(P0);
  const [attnCount, setAttnCount] = useState(0);
  const [folded, setFolded] = useState(false);
  const [gate, setGate] = useState(null); // null | 'wrong' | 'ok'
  const animRef = useRef(null);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  function animateTo(targets) {
    cancelAnimationFrame(animRef.current);
    const from = pts.map(p => ({ ...p }));
    const t0 = performance.now();
    const dur = 620;
    const step = now => {
      const t = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setPts(from.map((p, i) => ({ x: p.x + (targets[i].x - p.x) * e, y: p.y + (targets[i].y - p.y) * e })));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }

  function applyAttention() {
    if (folded) return;
    const targets = pts.map((pi, i) => {
      const scores = pts.map(pj => Math.exp(-Math.hypot(pi.x - pj.x, pi.y - pj.y) / 150));
      const z = scores.reduce((a, b) => a + b, 0);
      return pts.reduce((acc, pj, j) => ({ x: acc.x + (scores[j] / z) * pj.x, y: acc.y + (scores[j] / z) * pj.y }), { x: 0, y: 0 });
    });
    animateTo(targets);
    setAttnCount(c => c + 1);
  }

  function applyFold() {
    if (folded) return;
    const targets = pts.map((p, i) => {
      const dx = p.x - CENTROID.x, dy = p.y - CENTROID.y;
      const dist = Math.hypot(dx, dy);
      const baseAng = dist < 5 ? (i / P0.length) * Math.PI * 2 : Math.atan2(dy, dx);
      const ang = baseAng + 0.45 * Math.sin(i * 2.1 + dist / 40);
      const r = Math.max(dist * 2.1, 230);
      return {
        x: Math.max(24, Math.min(536, CENTROID.x + r * Math.cos(ang))),
        y: Math.max(20, Math.min(284, CENTROID.y + r * Math.sin(ang))),
      };
    });
    animateTo(targets);
    setFolded(true);
  }

  function reset() {
    cancelAnimationFrame(animRef.current);
    setPts(P0); setAttnCount(0); setFolded(false); setGate(null);
  }

  function answerGate(i) { setGate(i === 1 ? "ok" : "wrong"); }

  const gateVisible = attnCount >= 2 && !folded && gate !== "ok";
  const ffnLocked = folded || attnCount < 2 || gate !== "ok";
  const escaped = pts.filter(p => !insideHull(p)).length;
  const caption = folded
    ? `One nonlinear fold and ${escaped} of 6 vectors escape the palette. This is what the FFN adds — a genuine transformation, not another blend. Linear maps rotate and stretch; the GeLU folds.`
    : attnCount === 0
      ? "Six token vectors. The dashed boundary is their linear span — the palette. Attention outputs are weighted averages, so watch where the points can and cannot go. (The FFN button stays locked until attention has had its chance — apply it twice.)"
      : `${attnCount} attention layer${attnCount > 1 ? "s" : ""} applied — every output is a weighted average of the current vectors, so the points drift inward and can never leave the palette. Averaging averages never escapes the span.${attnCount < 2 ? " Apply attention once more — then the gate has a question for you." : ""}`;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Scene 1 · The palette trap</div>
        <div className="flex gap-2">
          <button onClick={applyAttention} disabled={folded}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${folded ? "bg-zinc-800 text-zinc-600" : "bg-violet-600 text-white hover:bg-violet-500"}`}>
            Apply attention layer
          </button>
          <button onClick={applyFold} disabled={ffnLocked}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${ffnLocked ? "bg-zinc-800 text-zinc-600" : "bg-emerald-600 text-white hover:bg-emerald-500"}`}>
            {gate === "ok" && !folded ? "Apply FFN fold" : "FFN fold 🔒"}
          </button>
          <button onClick={reset} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:text-white transition-all">Reset</button>
        </div>
      </div>
      {gateVisible && (
        <div className="rounded-lg border border-violet-600/40 bg-violet-600/10 p-3 space-y-2">
          <p className="text-xs text-zinc-300 font-medium">Pause and predict: the points are trapped in the palette. What could free them?</p>
          <div className="flex gap-2 flex-wrap">
            {GATE1_OPTIONS.map((o, i) => (
              <button key={i} onClick={() => answerGate(i)}
                className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all">{o}</button>
            ))}
          </div>
          {gate === "wrong" && <p className="text-xs text-amber-400">A blend of blends is still a blend — attention can only mix what's already there. Try again.</p>}
        </div>
      )}
      <svg viewBox="0 0 560 300" className="w-full">
        {(folded ? GRID_FOLDED : GRID_FLAT).map((d, i) => (
          <polyline key={i} points={d} fill="none" stroke="#3f3f46" strokeWidth="0.6" opacity={folded ? 0.5 : 0.35} style={{ transition: "opacity .6s" }} />
        ))}
        <polygon points={P0.map(p => `${p.x},${p.y}`).join(" ")} fill="rgba(139,92,246,0.05)" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="5 4" opacity="0.6" />
        <text x="284" y="24" textAnchor="middle" fill="#71717a" fontSize="11">the palette — the linear span of the original six vectors</text>
        {pts.map((p, i) => {
          const out = !insideHull(p);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="7" fill={out ? "#10b981" : "#8b5cf6"} />
              <text x={p.x} y={p.y - 12} textAnchor="middle" fill={out ? "#34d399" : "#a78bfa"} fontSize="10" fontFamily="monospace">t{i}</text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-violet-600/50 pl-3">{caption}</p>
    </div>
  );
}

// ── Scene 2 · The elevator shaft ──────────────────────────────────────────────
const UNITS = [0, 1, 2, 3, 4, 5].map(i => ({ cy: 380 - i * 56, kind: i % 2 === 0 ? "Attn" : "FFN", idx: i }));
const RMS_ON = [1.0, 1.05, 1.02, 1.08, 1.0, 1.04];
const RMS_OFF = [1.0, 1.9, 3.6, 6.9, 13.0, 25.0];
const GATE2_OPTIONS = ["≈ 1.00 — unchanged", "≈ 0.30 — reduced", "≈ 0.02 — effectively gone"];

export function SceneHighway() {
  const [res, setRes] = useState(true);
  const [pre, setPre] = useState(true);
  const [normOn, setNormOn] = useState(true);
  const [resGate, setResGate] = useState(null); // null | 'asked' | chosen index
  const [readouts, setReadouts] = useState(Array(6).fill(null));
  const [pulse, setPulse] = useState(null);
  const [animating, setAnimating] = useState(false);
  const animRef = useRef(null);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  // Physics consistency: post-norm's per-floor rescale only exists when the regulator is ON;
  // with no norms anywhere the shaft is clean regardless of placement.
  const factor = !res ? 0.5 : !normOn ? 1.0 : pre ? 1.0 : 0.82;

  function reset() { setReadouts(Array(6).fill(null)); setPulse(null); }
  function toggleRes() {
    if (animating) return;
    if (res && resGate === null) { setResGate("asked"); return; }
    setRes(r => !r); reset();
  }
  function answerGate2(i) { setResGate(i); setRes(false); reset(); }
  function setNorm(v) { if (animating || !res) return; setPre(v); reset(); }

  function sendPulse() {
    if (animating) return;
    setAnimating(true);
    setReadouts(Array(6).fill(null));
    const y0 = 62, y1 = 428, dur = 4000, t0 = performance.now();
    let mag = 1.0;
    const crossed = new Set();
    const step = now => {
      const t = Math.min((now - t0) / dur, 1);
      const y = y0 + (y1 - y0) * t;
      for (const u of UNITS) {
        if (y >= u.cy && !crossed.has(u.idx)) {
          crossed.add(u.idx);
          mag *= factor;
          const m = mag;
          setReadouts(r => { const n = r.slice(); n[u.idx] = m; return n; });
        }
      }
      setPulse({ y, mag });
      if (t < 1) animRef.current = requestAnimationFrame(step);
      else setAnimating(false);
    };
    animRef.current = requestAnimationFrame(step);
  }

  const caption = !res
    ? `No shaft. The message must pass through every floor and shrinks roughly 2× per handoff — by sublayer 1 there is nothing left for the optimizer to use. This is the vanishing-gradient wall.${typeof resGate === "number" ? ` (You predicted "${GATE2_OPTIONS[resGate]}".)` : ""}`
    : !normOn
    ? "Regulator off: watch the forward meter. Residual additions compound, and the activation scale drifts wildly with depth — 1 → 25 in six sublayers here; the module's table shows ~140 by layer 24. Later layers receive inputs at scales they were never trained for. The norm re-centers the signal after every addition."
    : pre
        ? "Pre-norm: the regulator sits inside the branch, so the shaft is never touched. The pulse rides to sublayer 1 at full strength — why hundred-layer models train without warmup: x + Sublayer(LayerNorm(x))."
        : "Post-norm: the regulator sits on the shaft itself, so the message is rescaled at every floor. Trainable — but it decays with depth, which is why the original transformer needed learning-rate warmup: LayerNorm(x + Sublayer(x)).";
  // Forward drift comes from residual ADDITIONS compounding — no residuals, no compounding story.
  const rms = res && !normOn ? RMS_OFF : RMS_ON;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Scene 2 · The elevator shaft</div>
        <div className="flex gap-2 items-center">
          <button onClick={toggleRes}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${res ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
            Residuals: {res ? "on" : "off"}
          </button>
          <span className={`inline-flex rounded-lg overflow-hidden border border-zinc-800 ${res && normOn ? "" : "opacity-40"}`}>
            <button onClick={() => setNorm(true)} className={`px-2.5 py-1.5 text-xs ${pre ? "bg-zinc-700 text-white" : "bg-transparent text-zinc-500"}`}>Pre-norm</button>
            <button onClick={() => setNorm(false)} className={`px-2.5 py-1.5 text-xs border-l border-zinc-800 ${!pre ? "bg-zinc-700 text-white" : "bg-transparent text-zinc-500"}`}>Post-norm</button>
          </span>
          <button onClick={() => { if (!animating && res) { setNormOn(n => !n); reset(); } }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!res ? "bg-zinc-800 text-zinc-600" : normOn ? "bg-zinc-700 text-white" : "bg-red-900/60 text-red-300 border border-red-700/50"}`}>
            Regulator: {normOn ? "on" : "off"}
          </button>
          <button onClick={sendPulse} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 text-white hover:bg-cyan-500 transition-all">▶ Send gradient pulse</button>
        </div>
      </div>
      {resGate === "asked" && (
        <div className="rounded-lg border border-amber-600/40 bg-amber-600/10 p-3 space-y-2">
          <p className="text-xs text-zinc-300 font-medium">Pause and predict: without the shaft, six handoffs at ~½ each — what actually reaches sublayer 1?</p>
          <div className="flex gap-2 flex-wrap">
            {GATE2_OPTIONS.map((o, i) => (
              <button key={i} onClick={() => answerGate2(i)}
                className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all">{o}</button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">Lock in a guess, then the pulse settles it.</p>
        </div>
      )}
      <svg viewBox="0 0 648 460" className="w-full">
        <text x="170" y="42" textAnchor="middle" fill="#e4e4e7" fontSize="12" fontWeight="600">loss</text>
        <text x="212" y="42" fill="#52525b" fontSize="10">gradient flows down</text>
        <line x1="170" y1="52" x2="170" y2="430" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
        <text x="170" y="452" textAnchor="middle" fill="#a1a1aa" fontSize="11">input embeddings</text>
        <text x="505" y="58" textAnchor="middle" fill="#52525b" fontSize="10">|∂L/∂x| entering</text>
        <text x="588" y="58" textAnchor="middle" fill="#52525b" fontSize="10">forward RMS</text>
        {UNITS.map(u => {
          const accent = u.kind === "Attn" ? "#8b5cf6" : "#10b981";
          const boxX = res ? 250 : 85;
          const ro = readouts[u.idx];
          return (
            <g key={u.idx}>
              <g style={{ opacity: res ? 1 : 0, transition: "opacity .3s" }}>
                <line x1="170" y1={u.cy + 11} x2={boxX} y2={u.cy + 11} stroke="#3f3f46" strokeWidth="1.5" />
                <line x1={boxX} y1={u.cy - 15} x2="179" y2={u.cy - 15} stroke="#3f3f46" strokeWidth="1.5" />
                <circle cx="170" cy={u.cy - 15} r="8" fill="#18181b" stroke="#fbbf24" strokeWidth="2" />
                <text x="170" y={u.cy - 11} textAnchor="middle" fill="#e4e4e7" fontSize="11" fontWeight="600">+</text>
                {pre && normOn && <g><rect x="196" y={u.cy + 3} width="40" height="15" rx="7.5" fill="#27272a" /><text x="216" y={u.cy + 14} textAnchor="middle" fill="#a1a1aa" fontSize="9">norm</text></g>}
                {!pre && normOn && <g><rect x="150" y={u.cy - 41} width="40" height="15" rx="7.5" fill="#27272a" /><text x="170" y={u.cy - 30} textAnchor="middle" fill="#a1a1aa" fontSize="9">norm</text></g>}
              </g>
              <g style={{ transform: `translateX(${res ? 0 : -165}px)`, transition: "transform .4s" }}>
                <rect x="250" y={u.cy - 17} width="170" height="34" rx="6" fill="#18181b" stroke={accent} strokeWidth="1.2" />
                <text x="335" y={u.cy + 4} textAnchor="middle" fill={accent} fontSize="12" fontWeight="600">{u.kind} · sublayer {u.idx + 1}</text>
              </g>
              <text x="505" y={u.cy + 4} textAnchor="middle" fontFamily="monospace" fontSize="12"
                fill={ro == null ? "#52525b" : ro < 0.1 ? "#f87171" : "#e4e4e7"}>
                {ro == null ? "—" : ro.toFixed(2)}
              </text>
              <rect x="544" y={u.cy - 5} height="10" rx="2"
                width={Math.min(6 + 26 * Math.log2(rms[u.idx]) + 6, 92)}
                fill={rms[u.idx] > 5 ? "#f87171" : rms[u.idx] > 1.5 ? "#fbbf24" : "#52525b"}
                style={{ transition: "width .4s, fill .4s" }} />
              <text x={Math.min(6 + 26 * Math.log2(rms[u.idx]) + 6, 92) + 549} y={u.cy + 4} fontFamily="monospace" fontSize="9"
                fill={rms[u.idx] > 5 ? "#f87171" : "#71717a"}>{rms[u.idx].toFixed(1)}</text>
            </g>
          );
        })}
        {pulse && (
          <g>
            <circle cx="170" cy={pulse.y} r={9 + 6 * pulse.mag} fill="#22d3ee" opacity="0.18" />
            <circle cx="170" cy={pulse.y} r={3 + 6 * pulse.mag} fill="#22d3ee" opacity={0.4 + 0.6 * pulse.mag} />
            <text x="148" y={pulse.y + 4} textAnchor="end" fill="#22d3ee" fontSize="11" fontFamily="monospace">{pulse.mag.toFixed(2)}</text>
          </g>
        )}
      </svg>
      <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-amber-600/50 pl-3">{caption}</p>
    </div>
  );
}

// ── Scene 3 · The stamp test ──────────────────────────────────────────────────
const EMB = { dog: [1.0, 0.1, 0.5, 0.2], bites: [0.1, 1.0, 0.3, 0.7], man: [0.8, 0.2, 0.1, 1.0] };

function rotPair(v, pos) {
  const th = 0.8 * pos;
  const c = Math.cos(th), s = Math.sin(th);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2] * c - v[3] * s, v[2] * s + v[3] * c];
}

function attend(vecs) {
  return vecs.map(q => {
    const scores = vecs.map(k => Math.exp(q.reduce((a, x, d) => a + x * k[d], 0)));
    const z = scores.reduce((a, b) => a + b, 0);
    return vecs.reduce((acc, v, j) => acc.map((a, d) => a + (scores[j] / z) * v[d]), [0, 0, 0, 0]);
  });
}

export function SceneStampTest() {
  const [swapped, setSwapped] = useState(false);
  const [stamped, setStamped] = useState(false);

  const order = swapped ? ["man", "bites", "dog"] : ["dog", "bites", "man"];
  const base = ["dog", "bites", "man"];
  const mk = (ord) => attend(ord.map((t, pos) => (stamped ? rotPair(EMB[t], pos) : EMB[t])));
  const outsNow = mk(order), outsBase = mk(base);
  const byToken = ord => Object.fromEntries(ord.map((t, i) => [t, i]));
  const nowIdx = byToken(order), baseIdx = byToken(base);
  const maxDelta = Math.max(...base.map(t => Math.max(...outsNow[nowIdx[t]].map((x, d) => Math.abs(x - outsBase[baseIdx[t]][d])))));

  const badge = !swapped
    ? { cls: "bg-zinc-800 text-zinc-400", text: "Baseline order — now swap the words." }
    : stamped
      ? { cls: "bg-emerald-600/20 text-emerald-400 border border-emerald-600/40", text: `Outputs changed — position is finally part of the vector (max Δ = ${maxDelta.toFixed(2)})` }
      : { cls: "bg-amber-600/20 text-amber-400 border border-amber-600/40", text: "Outputs identical — attention never noticed the swap (Δ = 0.00)" };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Scene 3 · The stamp test</div>
        <div className="flex gap-2">
          <button onClick={() => setSwapped(s => !s)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-500 transition-all">
            {swapped ? "Restore order" : "Swap 'dog' and 'man'"}
          </button>
          <button onClick={() => setStamped(s => !s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${stamped ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-300 hover:text-white"}`}>
            Position stamps: {stamped ? "on" : "off"}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        {order.map((t, pos) => (
          <div key={t} className="flex items-center gap-2 text-xs font-mono">
            <span className="w-8 text-zinc-600">p{pos}</span>
            <span className="w-14 text-zinc-200 font-semibold">{t}</span>
            <span className="text-zinc-600">→</span>
            {outsNow[pos].map((x, d) => (
              <span key={d} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 min-w-[46px] text-center">{x.toFixed(2)}</span>
            ))}
          </div>
        ))}
      </div>
      <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-medium ${badge.cls}`}>{badge.text}</div>
      <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-emerald-600/50 pl-3">
        Real attention over three 4-d vectors. Without stamps, attention is a set operation — 'dog bites man' and 'man bites dog' produce the same output for every token. The stamp is a RoPE-style rotation by position (angle = 0.8 × pos on each dimension pair), encoding order directly into the geometry the attention computation sees.
      </p>
    </div>
  );
}

// ── Scene 4 · The zoom-out ────────────────────────────────────────────────────
const D_OPTS = [768, 1600, 2048, 4096, 8192, 12288];
const REF_MODELS = [
  { name: "GPT-2 small", L: 12, d: 768 },
  { name: "GPT-2 XL", L: 48, d: 1600 },
  { name: "Llama-2 7B", L: 32, d: 4096 },
  { name: "Llama-2 70B", L: 80, d: 8192 },
  { name: "GPT-3 175B", L: 96, d: 12288 },
];
const blockParams = (L, d) => (12 * L * d * d) / 1e9;
const fmtB = b => (b < 1 ? `${Math.round(b * 1000)}M` : b < 1000 ? `${b.toFixed(1)}B` : `${(b / 1000).toFixed(2)}T`);

export function SceneZoomOut() {
  const [layers, setLayers] = useState(24);
  const [dIdx, setDIdx] = useState(3);
  const d = D_OPTS[dIdx];
  const paramsB = blockParams(layers, d);
  const flops = 2 * paramsB;
  const nearest = REF_MODELS.reduce((best, m) => {
    const dist = Math.abs(Math.log(blockParams(m.L, m.d)) - Math.log(paramsB));
    return dist < best.dist ? { m, dist } : best;
  }, { m: null, dist: Infinity });
  const closeEnough = nearest.dist < 0.45;
  const chips = Math.min(layers, 18);
  const chipW = 56 + 100 * (d / 12288);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Scene · The zoom-out — build your own frontier model</div>
        {closeEnough && nearest.m && (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-600/20 text-amber-300 border border-amber-600/40">
            you've roughly built {nearest.m.name}
          </span>
        )}
      </div>
      <div className="flex gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-violet-400 font-medium w-24">depth · linear</span>
          <input type="range" min="6" max="96" step="2" value={layers} onChange={e => setLayers(+e.target.value)} className="w-36 accent-violet-500" />
          <span className="text-xs font-mono text-zinc-200 w-20">{layers} layers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-medium w-28">width · quadratic</span>
          <input type="range" min="0" max={D_OPTS.length - 1} step="1" value={dIdx} onChange={e => setDIdx(+e.target.value)} className="w-36 accent-emerald-500" />
          <span className="text-xs font-mono text-zinc-200 w-20">d = {d}</span>
        </div>
      </div>
      <div className="flex gap-4 items-center flex-wrap">
        <svg viewBox="0 0 220 200" className="w-44 flex-shrink-0">
          {Array.from({ length: chips }, (_, i) => (
            <rect key={i} x={(220 - chipW) / 2 - i * 0.5} y={172 - i * 9.2} width={chipW} height="7.5" rx="2"
              fill="#18181b" stroke={i % 2 === 0 ? "#8b5cf6" : "#10b981"} strokeWidth="0.8"
              opacity={0.5 + 0.5 * (i / chips)} style={{ transition: "width .3s, x .3s" }} />
          ))}
          <line x1="28" y1="184" x2="28" y2={172 - chips * 9.2} stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          {layers > 18 && <text x="110" y="16" textAnchor="middle" fill="#71717a" fontSize="11" fontFamily="monospace">… × {layers}</text>}
        </svg>
        <div className="flex gap-3 flex-wrap flex-1 min-w-[220px]">
          <div className="rounded-lg bg-zinc-800/60 px-4 py-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">block params ≈ 12·L·d²</div>
            <div className="text-2xl font-mono text-zinc-100" style={{ transition: "all .3s" }}>{fmtB(paramsB)}</div>
            <div className="text-[10px] text-zinc-600">embeddings excluded</div>
          </div>
          <div className="rounded-lg bg-zinc-800/60 px-4 py-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">FLOPs / token ≈ 2·params</div>
            <div className="text-2xl font-mono text-zinc-100">{flops < 1000 ? `${flops.toFixed(0)}G` : `${(flops / 1000).toFixed(1)}T`}</div>
            <div className="text-[10px] text-zinc-600">every single generated token</div>
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {REF_MODELS.map(m => {
          const isNear = closeEnough && nearest.m?.name === m.name;
          return (
            <button key={m.name} onClick={() => { setLayers(m.L); setDIdx(D_OPTS.indexOf(m.d)); }}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all border ${isNear ? "bg-amber-600/20 text-amber-300 border-amber-600/40" : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300"}`}>
              {m.name} · {m.L}L × {m.d}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-zinc-600 pl-3">
        Each chip is the full block you just built. Now feel the two cost axes: double the depth and params double — <span className="text-violet-400">linear</span>. Double the width and they quadruple — <span className="text-emerald-400">quadratic</span>. Set 96 layers at d=12288 and the formula lands almost exactly on GPT-3's 175B: the machine from this page, stacked, IS the frontier model. Now answer the engineer from the closing scenario — "just add more layers" — knowing depth is one lever, width is where the knowledge lives, and neither comes free.
      </p>
    </div>
  );
}

// ── The token journey (bound to runTransformer's real d_model=8 numbers) ─────
const PROJ = [
  [0.42, -0.31, 0.18, 0.55, -0.22, 0.38, -0.45, 0.12],
  [-0.28, 0.47, 0.51, -0.19, 0.33, -0.42, 0.15, 0.36],
];
const JSTAGES = [
  { id: "embed", label: "1 · Embed", hint: "The token's raw vector — eight real numbers, born from the embedding table." },
  { id: "pos", label: "2 · + Position", hint: "The position stamp nudges every dimension — 'dog at p0' and 'dog at p2' are now different vectors." },
  { id: "attend", label: "3 · Attend", hint: "Arrows show this token's real attention weights — its vector moves toward a weighted average of what it attends to (then residual + norm)." },
  { id: "ffn", label: "4 · FFN", hint: "The workshop: expand 8→16, fold through ReLU, project back. The point jumps somewhere no blend could reach." },
  { id: "predict", label: "5 · Predict", hint: "The LAST position's finished vector meets the output projection — a probability race over the next token." },
];

function proj2d(v, cx, cy, scale) {
  const px = v.reduce((a, x, i) => a + x * PROJ[0][i], 0);
  const py = v.reduce((a, x, i) => a + x * PROJ[1][i], 0);
  return { x: cx + px * scale, y: cy + py * scale };
}

function jEmbColor(v) {
  const t = Math.max(0, Math.min(1, (Math.max(-2, Math.min(2, v)) + 2) / 4));
  return `rgb(${Math.round(t * 139 + (1 - t) * 30)},${Math.round(t * 30 + (1 - t) * 30)},${Math.round(t * 246 + (1 - t) * 80)})`;
}

function stageVecs(result, stageId) {
  if (stageId === "embed") return result.rawTokenEmbeds;
  if (stageId === "pos") return result.tokenEmbeds;
  if (stageId === "attend") return result.normed;
  return result.finalOut; // ffn + predict
}

export function TokenJourney({ result, tokens, suggestedStage }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [focus, setFocus] = useState(tokens.length - 1);

  useEffect(() => {
    if (suggestedStage) {
      const i = JSTAGES.findIndex(s => s.id === suggestedStage);
      if (i >= 0) setStageIdx(i);
    }
  }, [suggestedStage]);
  useEffect(() => { setFocus(f => Math.min(f, tokens.length - 1)); }, [tokens]);

  const stage = JSTAGES[stageIdx];
  const effFocus = stage.id === "predict" ? tokens.length - 1 : focus;
  const vecs = stageVecs(result, stage.id);
  const vec = vecs[effFocus];

  const trail = JSTAGES.slice(0, Math.min(stageIdx, 3) + 1).map(s => proj2d(stageVecs(result, s.id)[effFocus], 150, 118, 40));

  const nH = result.allHeadWeights.length;
  const attnRow = result.allHeadWeights.reduce(
    (acc, hw) => acc.map((a, j) => a + hw[effFocus][j] / nH),
    new Array(tokens.length).fill(0)
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">The token's journey · real d_model=8 math</div>
        <div className="flex gap-1 flex-wrap">
          {JSTAGES.map((s, i) => (
            <button key={s.id} onClick={() => setStageIdx(i)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${i === stageIdx ? "bg-cyan-600 text-white" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {tokens.map((t, i) => (
          <button key={i} onClick={() => stage.id !== "predict" && setFocus(i)}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${i === effFocus ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
        <span className="text-[11px] text-zinc-600 self-center ml-1">← follow this token</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wide">the vector itself</div>
          <div className="flex gap-1">
            {vec.map((v, d) => (
              <div key={d} className="flex-1">
                <div className="h-9 rounded" style={{ background: jEmbColor(v), transition: "background .5s" }} />
                <div className="text-[9px] font-mono text-zinc-500 text-center mt-0.5">{v.toFixed(1)}</div>
              </div>
            ))}
          </div>
          {stage.id === "predict" && (
            <div className="space-y-1 pt-1">
              {result.nextTokenDist.slice(0, 5).map((c, i) => (
                <div key={c.tok} className="flex items-center gap-2">
                  <span className="w-16 text-[11px] font-mono text-zinc-300 truncate">{c.tok}</span>
                  <div className="flex-1 h-4 rounded bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${Math.max(2, c.prob * 100)}%`, background: i === 0 ? "#fbbf24" : "#52525b", transition: "width .5s" }} />
                  </div>
                  <span className="w-10 text-[10px] font-mono text-zinc-500 text-right">{(c.prob * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">where it lives (fixed 8→2 projection)</div>
          <svg viewBox="0 0 300 236" className="w-full rounded-lg bg-zinc-950/60 border border-zinc-800/60">
            {trail.length > 1 && (
              <polyline points={trail.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
                fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            )}
            {stage.id === "attend" && tokens.map((t, j) => {
              if (j === effFocus || attnRow[j] < 0.02) return null;
              const a = proj2d(vecs[effFocus], 150, 118, 40);
              const b = proj2d(vecs[j], 150, 118, 40);
              return <line key={j} x1={b.x} y1={b.y} x2={a.x} y2={a.y} stroke="#8b5cf6" strokeWidth={Math.max(0.6, attnRow[j] * 6)} opacity="0.7" />;
            })}
            {tokens.map((t, j) => {
              const p = proj2d(vecs[j], 150, 118, 40);
              const isF = j === effFocus;
              return (
                <g key={j} style={{ transform: `translate(${p.x}px,${p.y}px)`, transition: "transform .6s" }}>
                  <circle r={isF ? 7 : 4} fill={isF ? "#22d3ee" : "#3f3f46"} />
                  <text y="-10" textAnchor="middle" fill={isF ? "#67e8f9" : "#71717a"} fontSize="9" fontFamily="monospace">{t}</text>
                  {stage.id === "attend" && j !== effFocus && attnRow[j] >= 0.02 && (
                    <text y="16" textAnchor="middle" fill="#a78bfa" fontSize="8" fontFamily="monospace">{attnRow[j].toFixed(2)}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-cyan-600/50 pl-3">{stage.hint}</p>
    </div>
  );
}

// ── Scene · Author or editor (causal mask structure) ─────────────────────────
export function SceneMask() {
  const [causal, setCausal] = useState(true);
  const toks = ["the", "cat", "sat", "here"];
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Scene · Author or editor</div>
        <span className="inline-flex rounded-lg overflow-hidden border border-zinc-800">
          <button onClick={() => setCausal(false)} className={`px-2.5 py-1.5 text-xs ${!causal ? "bg-zinc-700 text-white" : "bg-transparent text-zinc-500"}`}>Encoder (editor)</button>
          <button onClick={() => setCausal(true)} className={`px-2.5 py-1.5 text-xs border-l border-zinc-800 ${causal ? "bg-zinc-700 text-white" : "bg-transparent text-zinc-500"}`}>Decoder (author)</button>
        </span>
      </div>
      <svg viewBox="0 0 300 190" className="w-full">
        <text x="160" y="14" textAnchor="middle" fill="#71717a" fontSize="10">who may each token look at?</text>
        {toks.map((t, i) => <text key={"r" + i} x="52" y={48 + i * 34} textAnchor="end" fill="#a1a1aa" fontSize="11" fontFamily="monospace">{t} →</text>)}
        {toks.map((t, j) => <text key={"c" + j} x={84 + j * 44} y="30" textAnchor="middle" fill="#a1a1aa" fontSize="11" fontFamily="monospace">{t}</text>)}
        {toks.map((_, i) => toks.map((_, j) => {
          const blocked = causal && j > i;
          return (
            <g key={i + "-" + j}>
              <rect x={64 + j * 44} y={36 + i * 34} width="40" height="26" rx="4"
                fill={blocked ? "#18181b" : "#8b5cf6"} opacity={blocked ? 0.6 : 0.35 + 0.4 * (1 / (1 + Math.abs(i - j)))}
                stroke={blocked ? "#3f3f46" : "#8b5cf6"} strokeWidth="0.8" style={{ transition: "fill .3s, opacity .3s" }} />
              {blocked && <text x={84 + j * 44} y={53 + i * 34} textAnchor="middle" fill="#52525b" fontSize="11">✕</text>}
            </g>
          );
        }))}
      </svg>
      <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-violet-600/50 pl-3">
        {causal
          ? "The author: each token attends only leftward — the future doesn't exist yet. This is what generation requires, and it's why a decoder's vectors make poor embeddings: every one was built half-blind, distorting the geometry retrieval needs."
          : "The editor: every token sees the whole page — the richest per-position summary. This is encoder attention, the right geometry for classification, retrieval, and embeddings."}
      </p>
    </div>
  );
}

export default function TransformerScenes() {
  return <SceneZoomOut />;
}
