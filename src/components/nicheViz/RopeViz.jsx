import { useState } from "react";

// RoPE (Rotary Position Embeddings). A query/key pair, each a 2D vector, is
// rotated by an angle proportional to its absolute position (theta * position).
// The key insight: the dot product q(m)·k(n) after rotation depends ONLY on the
// relative offset (m - n), not on m or n individually. We show this by letting
// the user set an offset and slide BOTH positions together — the score is
// invariant. A base-theta note ties this to context-length extension.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rad = (deg) => (deg * Math.PI) / 180;

// One rotary "frequency". Smaller theta -> slower rotation -> longer wavelength.
// Real RoPE uses base 10000 and many frequencies; we visualise a single one.
const THETA_DEG = 25; // degrees rotated per position step (illustrative)

function rotate([x, y], angleDeg) {
  const a = rad(angleDeg);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
}

export default function RopeViz({ onNavigate, spec } = {}) {
  // Unrotated (content-only) query and key vectors — fixed unit-ish directions.
  const q0 = [0.9, 0.15];
  const k0 = [0.55, 0.75];

  const [m, setM] = useState(3); // query absolute position
  const [n, setN] = useState(1); // key absolute position

  const offset = m - n; // relative offset — what the score really depends on

  const qAngle = THETA_DEG * m;
  const kAngle = THETA_DEG * n;
  const q = rotate(q0, qAngle);
  const k = rotate(k0, kAngle);

  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const score = dot(q, k);
  // The reference: rotating only by the relative offset gives the same score.
  const scoreRel = dot(rotate(q0, THETA_DEG * offset), k0);

  const card = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    padding: "1rem",
  };
  const label = { fontSize: "0.72rem", color: "var(--ink-low)", letterSpacing: "0.02em" };
  const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
  const numBig = { ...mono, fontSize: "1.35rem", fontWeight: 700, color: "var(--ink-hi)" };

  // SVG geometry: origin at centre, unit vectors scaled to R px.
  const S = 220;
  const cx = S / 2;
  const cy = S / 2;
  const R = 80;
  const tip = (v) => [cx + v[0] * R, cy - v[1] * R]; // flip y for screen coords
  const [qx, qy] = tip(q);
  const [kx, ky] = tip(k);

  const arc = (angleDeg, r, color) => {
    const steps = 24;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const a = rad((angleDeg * i) / steps);
      pts.push([cx + Math.cos(a) * r, cy - Math.sin(a) * r]);
    }
    return (
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.7"
      />
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", color: "var(--ink-hi)" }}>
      {/* controls */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={label}>Query position m</span>
            <span style={{ ...mono, color: "var(--gal-build)" }}>{m}</span>
          </div>
          <input
            type="range"
            min={0}
            max={9}
            step={1}
            value={m}
            onChange={(e) => setM(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--gal-build)" }}
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={label}>Key position n</span>
            <span style={{ ...mono, color: "#10b981" }}>{n}</span>
          </div>
          <input
            type="range"
            min={0}
            max={9}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#10b981" }}
          />
        </div>
      </div>

      {/* rotation viz + score */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.75rem", alignItems: "center" }}>
        <div style={{ ...card, padding: "0.5rem" }}>
          <svg viewBox={`0 0 ${S} ${S}`} style={{ display: "block", width: "100%", height: "auto", maxWidth: S }}>
            {/* axes */}
            <line x1={cx} y1="10" x2={cx} y2={S - 10} stroke="var(--border)" strokeWidth="1" />
            <line x1="10" y1={cy} x2={S - 10} y2={cy} stroke="var(--border)" strokeWidth="1" />
            {/* rotation arcs from x-axis */}
            {arc(qAngle % 360, R + 14, "var(--gal-build)")}
            {arc(kAngle % 360, R + 24, "#10b981")}
            {/* query vector (rotated by theta*m) */}
            <line x1={cx} y1={cy} x2={qx} y2={qy} stroke="var(--gal-build)" strokeWidth="2.5" />
            <circle cx={qx} cy={qy} r="4" fill="var(--gal-build)" />
            {/* key vector (rotated by theta*n) */}
            <line x1={cx} y1={cy} x2={kx} y2={ky} stroke="#10b981" strokeWidth="2.5" />
            <circle cx={kx} cy={ky} r="4" fill="#10b981" />
          </svg>
          <div style={{ ...mono, fontSize: "0.62rem", color: "var(--ink-low)", textAlign: "center" }}>
            <span style={{ color: "var(--gal-build)" }}>q rotated {Math.round(qAngle)}°</span>
            {"   "}
            <span style={{ color: "#10b981" }}>k rotated {Math.round(kAngle)}°</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={card}>
            <div style={label}>Relative offset (n − m)</div>
            <div style={numBig}>{offset}</div>
          </div>
          <div style={card}>
            <div style={label}>Attention score  q(m)·k(n)</div>
            <div style={numBig}>{score.toFixed(3)}</div>
          </div>
          <div style={{ ...card, borderColor: Math.abs(score - scoreRel) < 1e-6 ? "#10b981" : "var(--border)" }}>
            <div style={label}>Same offset, shifted absolute positions</div>
            <div style={{ ...mono, fontSize: "0.8rem", color: "#10b981" }}>
              rotate(q₀, θ·{offset}) · k₀ = {scoreRel.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* why line */}
      <div
        style={{
          ...card,
          borderLeft: "3px solid var(--gal-build)",
          fontSize: "0.82rem",
          lineHeight: 1.5,
        }}
      >
        <strong>Relative, for free.</strong> RoPE rotates the query by{" "}
        <span style={mono}>θ·m</span> and the key by <span style={mono}>θ·n</span>. Because a rotation
        matrix satisfies <span style={mono}>Rᵀ(mθ)·R(nθ) = R((n−m)θ)</span>, the dot product collapses
        to a function of the <strong>offset {offset}</strong> alone. Slide m and n together — same
        offset, the score above <strong>doesn't move</strong>. Absolute position never leaks into
        attention; only distance does.
      </div>

      {/* base theta / extension note */}
      <div style={{ ...card, borderLeft: "3px solid #10b981", fontSize: "0.8rem", lineHeight: 1.5 }}>
        <strong>Base θ and context extension.</strong> Real RoPE uses many frequencies,{" "}
        <span style={mono}>θᵢ = base^(−2i/d)</span> with base = 10000. High frequencies rotate fast
        (short-range detail), low ones slow (long-range). To run past the training context, you{" "}
        <em>lower</em> the effective rotation — raising the base (NTK scaling) or dividing positions
        (linear PI / YaRN) — so far-apart tokens haven't rotated into unseen angles.
      </div>
    </div>
  );
}
