import { useState } from "react";

// RoPE (Rotary Position Embeddings) — v2 (2026-07-23).
// Rebuilt as a four-panel beginner→advanced ramp after a real learner session
// surfaced 12 recurring confusions (what rotates / why pairs / how position
// becomes an angle / wraparound fears / why the dot product sees only the gap).
//   Panel A — one pair = one circle (vector anatomy, position→angle).
//   Panel B — two tokens, one score: the relative-invariance demo, now with a
//             one-click "slide window +1" proof instead of two-slider dexterity.
//   Panel C — eight frequencies as clock dials: wraparound is real per-pair,
//             collisions across ALL pairs never happen (the actual answer).
//   Panel D — worked numeric example (θ=90°), incl. the gap-4 alias and the
//             slower pair that disambiguates it.
// Closer cards: the R(a)ᵀR(b)=R(b−a) one-liner + base-θ/context-extension
// (kept from v1 — extension is in this module's stated scope).
// Design note: v1's borderLeft accent strips are REMOVED (rails are forbidden
// in this design system); accents live in tag headings instead.

const rad = (deg) => (deg * Math.PI) / 180;
const cosd = (deg) => Math.cos(rad(deg));
const sind = (deg) => Math.sin(rad(deg));
const fmt = (x, p = 2) => (Math.abs(x) < 1e-10 ? 0 : x).toFixed(p);
const rot = ([x, y], deg) => [x * cosd(deg) - y * sind(deg), x * sind(deg) + y * cosd(deg)];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

const card = { background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem" };
const label = { fontSize: "0.72rem", color: "var(--ink-low)", letterSpacing: "0.02em" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
const prose = { fontSize: "0.82rem", color: "var(--ink-mid)", lineHeight: 1.55 };
const hi = { color: "var(--ink-hi)" };
const tagStyle = (color) => ({ ...mono, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, marginBottom: "0.45rem" });
const readout = { ...mono, fontSize: "0.74rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.55rem 0.7rem", whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--ink-mid)" };

function Slider({ text, value, set, min, max, step = 1, color, suffix = "" }) {
  return (
    <div style={{ marginBottom: "0.7rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={label}>{text}</span>
        <span style={{ ...mono, color }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }} />
    </div>
  );
}

function Dial({ size = 200, arrows = [], showAxes = true }) {
  const c = size / 2, R = size * 0.38;
  return (
    <svg viewBox={"0 0 " + size + " " + size} style={{ display: "block", width: "100%", height: "auto", maxWidth: size }}>
      <circle cx={c} cy={c} r={R} fill="none" stroke="var(--border)" strokeWidth="1" />
      {showAxes && <line x1={c} y1={c - R - 8} x2={c} y2={c + R + 8} stroke="var(--border)" strokeWidth="0.5" opacity="0.6" />}
      {showAxes && <line x1={c - R - 8} y1={c} x2={c + R + 8} y2={c} stroke="var(--border)" strokeWidth="0.5" opacity="0.6" />}
      {arrows.map((a, i) => {
        const x = c + R * cosd(a.deg), y = c - R * sind(a.deg);
        return (
          <g key={i}>
            <line x1={c} y1={c} x2={x} y2={y} stroke={a.color} strokeWidth={a.w || 2.5} strokeLinecap="round" opacity={a.o || 1} />
            <circle cx={x} cy={y} r={a.dot || 4} fill={a.color} opacity={a.o || 1} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Panel A — what rotates, why pairs, position→angle ───────────────────────
function PanelA() {
  const [m, setM] = useState(3);
  const [th, setTh] = useState(30);
  const ang = m * th;
  return (
    <div style={card}>
      <div style={tagStyle("var(--gal-build)")}>Panel A · what rotates · why pairs · position → angle</div>
      <div style={{ ...prose, marginBottom: "0.7rem" }}>
        A query/key vector is just a list of numbers (e.g. 128 per head). RoPE chops it into
        <strong style={hi}> 64 independent pairs</strong> — rotation needs a 2D plane, and pairs are the
        cheapest way to get 64 of them. Each pair is read as x,y of a 2D point: <strong style={hi}>this is one
        pair</strong>. A token at position <span style={mono}>m</span> gets rotated by
        <span style={mono}> m·θ</span> — multiplication, nothing else.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(150px, 210px) 1fr", gap: "1rem", alignItems: "center" }}>
        <Dial arrows={[{ deg: 0, color: "var(--ink-low)", w: 1.5, o: 0.5 }, { deg: ang, color: "var(--gal-build)" }]} />
        <div>
          <Slider text="token position m" value={m} set={setM} min={0} max={16} color="var(--gal-build)" />
          <Slider text="pair speed θ (deg per token)" value={th} set={setTh} min={5} max={90} step={5} color="#e8a030" suffix="°" />
          <div style={readout}>
{"angle = m·θ = " + m + "·" + th + "° = " + ang + "°  (mod 360 = " + (((ang % 360) + 360) % 360) + "°)\npoint = (" + fmt(cosd(ang)) + ", " + fmt(sind(ang)) + ")\nlength = 1.00 — rotation never changes it"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Panel B — two tokens, one score: only the gap survives ──────────────────
function PanelB() {
  const [m, setM] = useState(1);
  const [n, setN] = useState(3);
  const [th, setTh] = useState(30);
  const q0 = [0.9, 0.15], k0 = [0.55, 0.75];
  const baseQ = Math.atan2(q0[1], q0[0]) / Math.PI * 180;
  const baseK = Math.atan2(k0[1], k0[0]) / Math.PI * 180;
  const score = dot(rot(q0, m * th), rot(k0, n * th));
  const scoreRel = dot(rot(q0, (m - n) * th), k0); // rotate by the offset alone — identical
  const gap = n - m;
  const slide = () => {
    if (m < 20 && n < 20) { setM(m + 1); setN(n + 1); }
    else { const g = n - m; setM(0); setN(g >= 0 ? g : 0); if (g < 0) setM(-g); }
  };
  const pct = Math.abs(score) / (Math.hypot(...q0) * Math.hypot(...k0)) * 50;
  return (
    <div style={card}>
      <div style={tagStyle("#38bdf8")}>Panel B · absolute stamped · relative read out</div>
      <div style={{ ...prose, marginBottom: "0.7rem" }}>
        Query (violet) stamped at its own position, key (green) at its own. Their dot product —
        the attention score for this pair — depends <strong style={hi}>only on the gap n−m</strong>.
        Hit <strong style={hi}>slide window +1</strong> repeatedly: both arrows rotate, the score never moves.
        That is the whole trick: two absolute stamps, one relative readout.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(150px, 210px) 1fr", gap: "1rem", alignItems: "center" }}>
        <Dial arrows={[{ deg: baseQ + m * th, color: "var(--gal-build)" }, { deg: baseK + n * th, color: "#10b981" }]} />
        <div>
          <Slider text="query position m" value={m} set={setM} min={0} max={20} color="var(--gal-build)" />
          <Slider text="key position n" value={n} set={setN} min={0} max={20} color="#10b981" />
          <Slider text="pair speed θ" value={th} set={setTh} min={5} max={90} step={5} color="#e8a030" suffix="°" />
          <button onClick={slide}
            style={{ ...mono, fontSize: "0.75rem", background: "var(--surface)", color: "var(--ink-hi)", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.45rem 0.8rem", cursor: "pointer", marginBottom: "0.6rem" }}>
            slide window +1  (m+1, n+1)
          </button>
          <div style={readout}>
{"gap = n−m = " + gap + " tokens → " + gap * th + "°\nscore q(m)·k(n) = " + fmt(score, 3) + "\nrotate-by-offset check = " + fmt(scoreRel, 3) + (Math.abs(score - scoreRel) < 1e-9 ? "  ✓ identical" : "")}
          </div>
          <div style={{ height: 10, borderRadius: 5, background: "var(--surface)", border: "1px solid var(--border)", position: "relative", overflow: "hidden", marginTop: "0.5rem" }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: score < 0 ? (50 - pct) + "%" : "50%", width: pct + "%", background: score >= 0 ? "#10b981" : "#f87171", transition: "all 0.12s" }} />
          </div>
          <div style={{ ...label, marginTop: "0.3rem" }}>score, centered at 0 — drag θ or the gap and watch it swing; slide the window and watch it freeze</div>
        </div>
      </div>
    </div>
  );
}

// ── Panel C — eight clocks: wraparound vs collision ─────────────────────────
const SPEEDS = [90, 45, 22.5, 11.25, 5.6, 2.8, 1.4, 0.7];

function PanelC() {
  const [A, setA] = useState(1);
  const [B, setB] = useState(5);
  const collided = SPEEDS.map((s) => {
    const d = Math.abs(((((A - B) * s) % 360) + 360) % 360);
    return (d < 4 || d > 356) && A !== B;
  });
  const count = collided.filter(Boolean).length;
  return (
    <div style={card}>
      <div style={tagStyle("#e8a030")}>Panel C · wraparound is real · collisions are not</div>
      <div style={{ ...prose, marginBottom: "0.7rem" }}>
        Each dial is one dimension pair, halving speed left to right — second hand to hour hand.
        Two positions: <strong style={{ color: "#e8a030" }}>A amber</strong>, <strong style={{ color: "#38bdf8" }}>B sky</strong>.
        A dial outlined <strong style={{ color: "#f87171" }}>red</strong> cannot tell A from B on its own — try A=1,
        B=5: the 90° dial wraps and collides. The slower dials never agree with it. A full collision needs
        <strong style={hi}> all eight red at once</strong>; real RoPE spreads 64 speeds across wavelengths from
        ~2 to ~10,000+ tokens, so that never happens inside any usable context.
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ minWidth: 200, flex: "1 1 200px" }}>
          <Slider text="position A" value={A} set={setA} min={0} max={200} color="#e8a030" />
          <Slider text="position B" value={B} set={setB} min={0} max={200} color="#38bdf8" />
          <div style={readout}>
{A === B ? "same position — dials agree trivially" : "gap = " + Math.abs(A - B) + " tokens\ndials confused: " + count + " / 8\n" + (count === 8 ? "FULL COLLISION" : "positions still distinguishable ✓")}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(64px, 1fr))", gap: "0.5rem", flex: "2 1 280px" }}>
          {SPEEDS.map((s, i) => (
            <div key={s} style={{ background: "var(--surface)", border: "1px solid " + (collided[i] ? "#f87171" : "var(--border)"), boxShadow: collided[i] ? "0 0 10px rgba(248,113,113,0.35)" : "none", borderRadius: "0.6rem", padding: "0.35rem 0.25rem 0.2rem", textAlign: "center", transition: "border-color 0.2s, box-shadow 0.2s" }}>
              <Dial size={72} showAxes={false} arrows={[{ deg: A * s, color: "#e8a030", w: 2, dot: 3 }, { deg: B * s, color: "#38bdf8", w: 2, dot: 3 }]} />
              <div style={{ ...mono, fontSize: "0.58rem", color: "var(--ink-low)", marginTop: "0.15rem" }}>{s}°/tok</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Panel D — the worked example, live ──────────────────────────────────────
const CASES = [[1, 2], [3, 4], [1, 3], [1, 5]];
const cell = { padding: "0.4rem 0.6rem", borderBottom: "1px solid var(--border)", ...mono, fontSize: "0.72rem", color: "var(--ink-mid)" };
const head = { ...cell, color: "#10b981", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 };

function PanelD() {
  return (
    <div style={card}>
      <div style={tagStyle("#10b981")}>Panel D · the whole mechanism in eight numbers</div>
      <div style={{ ...prose, marginBottom: "0.5rem" }}>
        One pair, θ=90°/token, both tokens&apos; content = (1,0) — identical content, raw dot = 1.
        Same gap ⇒ same score at any absolute position. At gap 4 the fast pair wraps to 360° and
        aliases — the slow 9° pair still sees the difference. Two clocks, no collision.
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr>
            <th style={head}>q pos</th><th style={head}>k pos</th><th style={head}>gap</th>
            <th style={head}>q rotated</th><th style={head}>k rotated</th>
            <th style={head}>dot (fast 90°)</th><th style={head}>dot (slow 9°)</th>
          </tr></thead>
          <tbody>
            {CASES.map(([qm, kn]) => {
              const g = kn - qm;
              const alias = (g * 90) % 360 === 0 && g !== 0;
              return (
                <tr key={qm + "-" + kn}>
                  <td style={{ ...cell, color: "var(--ink-hi)" }}>{qm}</td>
                  <td style={{ ...cell, color: "var(--ink-hi)" }}>{kn}</td>
                  <td style={{ ...cell, color: "var(--ink-hi)" }}>{g}</td>
                  <td style={cell}>({fmt(cosd(qm * 90))}, {fmt(sind(qm * 90))})</td>
                  <td style={cell}>({fmt(cosd(kn * 90))}, {fmt(sind(kn * 90))})</td>
                  <td style={{ ...cell, color: alias ? "#f87171" : "var(--ink-hi)", fontWeight: alias ? 700 : 400 }}>{fmt(cosd(g * 90))}{alias ? " ← looks like gap 0!" : ""}</td>
                  <td style={{ ...cell, color: "#10b981" }}>{fmt(cosd(g * 9))}{alias ? " ← saved" : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Module component ────────────────────────────────────────────────────────
export default function RopeViz({ onNavigate, spec } = {}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: "var(--ink-hi)" }}>
      <PanelA />
      <PanelB />
      <PanelC />
      <PanelD />

      <div style={card}>
        <div style={tagStyle("var(--gal-build)")}>Why this works — the one-line proof</div>
        <div style={prose}>
          A rotation matrix satisfies <span style={mono}>Rᵀ(mθ)·R(nθ) = R((n−m)θ)</span>, so the dot product of
          a query rotated by <span style={mono}>θ·m</span> and a key rotated by <span style={mono}>θ·n</span>{" "}
          collapses to a function of the offset alone. Absolute position never leaks into attention; only
          distance does. Rotation also preserves vector length — <strong style={hi}>content lives in the
          magnitudes, the gap lives in the phase</strong>, and neither corrupts the other.
        </div>
      </div>

      <div style={card}>
        <div style={tagStyle("#10b981")}>Base θ and context extension</div>
        <div style={{ ...prose, fontSize: "0.8rem" }}>
          Real RoPE uses many frequencies, <span style={mono}>θᵢ = base^(−2i/d)</span> with base = 10000 —
          exactly Panel C&apos;s ladder, spread far wider. To run past the training context you <em>lower</em>{" "}
          the effective rotation — raising the base (NTK scaling) or dividing positions (linear PI / YaRN) —
          so far-apart tokens haven&apos;t rotated into angles the model never saw in training.
        </div>
      </div>
    </div>
  );
}
