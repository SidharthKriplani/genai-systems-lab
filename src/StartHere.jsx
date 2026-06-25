import { useState, useEffect, useMemo } from "react";
import { Icon } from './Icon.jsx';

// ── Start Here — the gentlest on-ramp. Read a little, poke a widget, answer one check, next.
//    In-place loop (no tab-jumping). Monochrome theme. localStorage progress.

const LS_KEY = "gsl-starthere";
const loadDone = () => { try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); } catch { return new Set(); } };
const saveDone = (s) => { try { localStorage.setItem(LS_KEY, JSON.stringify([...s])); } catch {} };

// ───────────────────────── shared check ─────────────────────────
function Check({ q, options, correct, explain }) {
  const [picked, setPicked] = useState(null);
  const show = picked !== null;
  return (
    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-xs font-bold text-zinc-300 mb-3">{q}</p>
      <div className="space-y-2">
        {options.map((o, i) => {
          const correctNow = show && i === correct;
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                correctNow
                  ? ""
                  : picked === i
                    ? "border-zinc-600 bg-zinc-800/40 text-zinc-200"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
              style={correctNow ? { borderColor: "var(--gal-build)", background: "var(--gal-build-tint)", color: "var(--gal-build)" } : undefined}
            >
              <span className="font-mono mr-2 opacity-70">{correctNow ? "✓" : String.fromCharCode(65 + i)}</span>{o}
            </button>
          );
        })}
      </div>
      {show && (
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
          <span className="text-zinc-200 font-bold">{picked === correct ? "Right. " : "Not quite. "}</span>{explain}
        </p>
      )}
    </div>
  );
}

// ───────────────────────── 1 · tokenizer ─────────────────────────
function tokenize(s) {
  const raw = s.match(/\w+|[^\w\s]/g) || [];
  const out = [];
  raw.forEach(t => {
    if (/^\w+$/.test(t) && t.length > 5) {
      for (let i = 0; i < t.length; i += 4) out.push(t.slice(i, i + 4));
    } else {
      out.push(t);
    }
  });
  return out;
}
function TokenizerWidget() {
  const [text, setText] = useState("Hello, world!");
  const tokens = useMemo(() => tokenize(text), [text]);
  return (
    <div>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full text-sm bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
        placeholder="Type a sentence…"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tokens.map((t, i) => (
          <span key={i} className="text-xs font-mono px-2 py-1 rounded border"
            style={{ borderColor: "var(--gal-build-border)", background: "var(--gal-build-tint)", color: "var(--gal-build)" }}>
            {t === " " ? "·" : t}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-mono text-zinc-500">{tokens.length} tokens · models bill and "think" in these, not words</p>
    </div>
  );
}

// ───────────────────────── 2 · embeddings ─────────────────────────
const EWORDS = [
  { w: "king", x: 30, y: 32 }, { w: "queen", x: 42, y: 28 },
  { w: "man", x: 27, y: 60 }, { w: "woman", x: 41, y: 56 },
  { w: "dog", x: 76, y: 72 }, { w: "cat", x: 82, y: 66 },
  { w: "car", x: 72, y: 24 },
];
function nearestWord(idx) {
  const a = EWORDS[idx];
  let best = -1, bd = 1e9;
  EWORDS.forEach((b, j) => {
    if (j === idx) return;
    const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    if (d < bd) { bd = d; best = j; }
  });
  return best;
}
function EmbeddingWidget() {
  const [sel, setSel] = useState(0);
  const nn = nearestWord(sel);
  return (
    <div>
      <svg viewBox="0 0 100 90" className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40" style={{ maxHeight: 220 }}>
        {sel >= 0 && (
          <line x1={EWORDS[sel].x} y1={EWORDS[sel].y} x2={EWORDS[nn].x} y2={EWORDS[nn].y}
            stroke="var(--gal-build)" strokeWidth="0.6" strokeDasharray="2 1.5" />
        )}
        {EWORDS.map((p, i) => {
          const on = i === sel || i === nn;
          return (
            <g key={p.w} onClick={() => setSel(i)}
              className={on ? "" : "text-zinc-500"}
              style={{ cursor: "pointer", color: on ? "var(--gal-build)" : undefined }}>
              <circle cx={p.x} cy={p.y} r={i === sel ? 2.6 : 1.9} fill="currentColor" />
              <text x={p.x + 3} y={p.y + 1.5} fontSize="3.4" fill="currentColor" fontFamily="monospace">{p.w}</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-[11px] font-mono text-zinc-500">click a word — its nearest neighbour lights up. similar meanings sit close.</p>
    </div>
  );
}

// ───────────────────────── 3 · cosine ─────────────────────────
function CosineWidget() {
  const [ang, setAng] = useState(35);
  const rad = (ang * Math.PI) / 180;
  const cx = 50, cy = 52, len = 38;
  const bx = cx + len * Math.cos(rad);
  const by = cy - len * Math.sin(rad);
  const cos = Math.cos(rad);
  return (
    <div>
      <svg viewBox="0 0 100 80" className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40" style={{ maxHeight: 190 }}>
        <g className="text-zinc-600">
          <line x1={cx} y1={cy} x2={cx + len} y2={cy} stroke="currentColor" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="1.4" fill="currentColor" />
        </g>
        <line x1={cx} y1={cy} x2={bx} y2={by} stroke="var(--gal-build)" strokeWidth="1.4" />
      </svg>
      <div className="mt-3 flex items-center gap-3">
        <input type="range" min="0" max="180" value={ang} onChange={e => setAng(+e.target.value)} className="flex-1" style={{ accentColor: "var(--gal-build)" }} />
        <span className="text-xs font-mono shrink-0" style={{ color: "var(--gal-build)" }}>cos = {cos.toFixed(2)}</span>
      </div>
      <p className="mt-2 text-[11px] font-mono text-zinc-500">{ang}° apart · this is how retrieval scores "how related is this text?"</p>
    </div>
  );
}

// ───────────────────────── 4 · next token ─────────────────────────
const BASE = [["mat", 0.6], ["floor", 0.18], ["rug", 0.1], ["roof", 0.07], ["moon", 0.05]];
function NextTokenWidget() {
  const [temp, setTemp] = useState(0.7);
  const probs = useMemo(() => {
    const scaled = BASE.map(([t, p]) => [t, Math.exp(Math.log(p) / Math.max(0.05, temp))]);
    const z = scaled.reduce((s, [, v]) => s + v, 0);
    return scaled.map(([t, v]) => [t, v / z]);
  }, [temp]);
  return (
    <div>
      <p className="text-xs font-mono text-zinc-400 mb-3">"The cat sat on the <span style={{ color: "var(--gal-build)" }}>___</span>"</p>
      <div className="space-y-1.5">
        {probs.map(([t, p]) => (
          <div key={t} className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 w-12 shrink-0">{t}</span>
            <div className="flex-1 h-3 rounded bg-zinc-800 overflow-hidden">
              <div className="h-full rounded" style={{ width: `${Math.round(p * 100)}%`, background: "var(--gal-build)" }} />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 w-9 shrink-0 text-right">{Math.round(p * 100)}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] font-mono text-zinc-500 shrink-0">temp</span>
        <input type="range" min="0.1" max="1.5" step="0.1" value={temp} onChange={e => setTemp(+e.target.value)} className="flex-1" style={{ accentColor: "var(--gal-build)" }} />
        <span className="text-xs font-mono shrink-0" style={{ color: "var(--gal-build)" }}>{temp.toFixed(1)}</span>
      </div>
    </div>
  );
}

// ───────────────────────── 5 · context window ─────────────────────────
const CTX_SEGS = [["System prompt", 1], ["Chat history", 3], ["Retrieved chunks", 3], ["Your question", 1]];
function ContextWidget() {
  const total = CTX_SEGS.reduce((s, [, n]) => s + n, 0);
  return (
    <div>
      <div className="flex w-full h-7 rounded-lg overflow-hidden border border-zinc-800">
        {CTX_SEGS.map(([label, n], i) => (
          <div key={label} title={label}
            className="flex items-center justify-center text-[8px] font-mono border-r border-zinc-950 last:border-r-0"
            style={{
              width: `${(n / total) * 100}%`,
              background: "var(--gal-build-tint)",
              color: "var(--gal-build)",
              opacity: 0.55 + i * 0.12,
            }}>
            {n > 1 ? label : ""}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-mono text-zinc-500">one fixed budget holds everything the model can see. add more than it fits → the oldest falls off.</p>
    </div>
  );
}

// ───────────────────────── lessons ─────────────────────────
const LESSONS = [
  {
    id: "token", title: "What's a token?", Widget: TokenizerWidget,
    blurb: "Models don't read words — they read tokens: little chunks of text turned into numbers. Type below and watch your sentence break apart.",
    check: { q: "Which one is MORE tokens?", options: ["“cat”", "“antidisestablishmentarianism”"], correct: 1, explain: "Long, rare words get split into several tokens; common short words are usually just one." },
  },
  {
    id: "embed", title: "Words become positions", Widget: EmbeddingWidget,
    blurb: "Each token maps to a point in space. Words with similar meaning land near each other — that's an embedding.",
    check: { q: "Click around — which word sits closest to “king”?", options: ["car", "queen", "dog"], correct: 1, explain: "king/queen, man/woman, cat/dog cluster by meaning. The geometry IS the similarity." },
  },
  {
    id: "cosine", title: "Similarity is an angle", Widget: CosineWidget,
    blurb: "To ask \"how similar are two meanings?\" we measure the angle between their vectors. Same direction = 1, opposite = −1. Drag the slider.",
    check: { q: "Two vectors pointing the SAME way have cosine similarity of…", options: ["0", "1", "−1"], correct: 1, explain: "0° apart → cosine 1. This exact trick is how a RAG system finds text relevant to your question." },
  },
  {
    id: "next", title: "It just predicts the next token", Widget: NextTokenWidget,
    blurb: "An LLM scores every possible next token and samples from the top ones. \"Temperature\" controls how adventurous that pick is. Slide it and watch the bars.",
    check: { q: "Turning temperature UP makes the output more…", options: ["predictable", "random / varied", "accurate"], correct: 1, explain: "High temp flattens the odds → more variety (and more risk). Low temp = safe and repetitive." },
  },
  {
    id: "context", title: "Everything lives in the context window", Widget: ContextWidget,
    blurb: "The model only \"sees\" what fits in a fixed budget — system prompt + history + retrieved text + your question. Go over, and something gets dropped.",
    check: { q: "When the context window overflows, what happens?", options: ["the model asks for more room", "the oldest content silently drops", "nothing — it's infinite"], correct: 1, explain: "Overflowed tokens just fall off the edge — a top cause of \"the bot forgot what I told it.\"" },
  },
];

// ───────────────────────── main ─────────────────────────
export default function StartHere({ onNavigate }) {
  const [done, setDone] = useState(loadDone);
  const [i, setI] = useState(0);
  const complete = i >= LESSONS.length;

  useEffect(() => { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {} }, [i]);

  const pct = Math.round((done.size / LESSONS.length) * 100);
  const markDone = (id) => {
    setDone(prev => {
      if (prev.has(id)) return prev;
      const n = new Set(prev); n.add(id); saveDone(n); return n;
    });
  };

  const go = (tab) => onNavigate && onNavigate(tab);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* header + progress */}
        <div className="mb-7">
          <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "var(--gal-build)" }}>Start here · ~10 min</p>
          <h1 className="text-2xl font-black text-white mb-2">The 5-minute mental model of an LLM</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Five tiny lessons. Each one: read two lines, poke the thing, answer one question. No setup, no jargon wall.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "var(--gal-build)" }} />
            </div>
            <span className="text-xs text-zinc-500 font-mono shrink-0">{done.size}/{LESSONS.length}</span>
          </div>
        </div>

        {!complete ? (
          <>
            {/* lesson rail */}
            <div className="flex items-center gap-1.5 mb-5">
              {LESSONS.map((l, idx) => (
                <button key={l.id} onClick={() => setI(idx)}
                  className="h-1.5 flex-1 rounded-full transition-all"
                  style={{ background: idx === i ? "var(--gal-build)" : done.has(l.id) ? "var(--gal-build-border)" : "var(--border)" }}
                  aria-label={`Lesson ${idx + 1}`} />
              ))}
            </div>

            {/* lesson card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: "var(--gal-build-tint)", color: "var(--gal-build)", border: "1px solid var(--gal-build-border)" }}>
                  {i + 1}
                </span>
                <h2 className="text-base font-bold text-white">{LESSONS[i].title}</h2>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">{LESSONS[i].blurb}</p>

              {(() => { const W = LESSONS[i].Widget; return <W />; })()}

              <Check {...LESSONS[i].check} />
            </div>

            {/* footer nav */}
            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => setI(Math.max(0, i - 1))}
                disabled={i === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed">
                ← Back
              </button>
              <button
                onClick={() => { markDone(LESSONS[i].id); setI(i + 1); }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-white"
                style={{ background: "var(--gal-build)" }}>
                {i === LESSONS.length - 1 ? "Finish →" : "Next →"}
              </button>
            </div>

            {/* escape hatch */}
            <div className="mt-8 text-center">
              <button onClick={() => go("concepts")} className="text-[11px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors">
                already know this? skip to the Concepts gym →
              </button>
            </div>
          </>
        ) : (
          /* completion */
          <div className="rounded-2xl border p-7 text-center" style={{ borderColor: "var(--gal-build-border)", background: "var(--gal-build-tint)" }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-black"
              style={{ background: "var(--gal-build-tint)", color: "var(--gal-build)", border: "1px solid var(--gal-build-border)" }}><Icon name="check" size={16} /></div>
            <h2 className="text-lg font-black text-white mb-2">You've got the mental model.</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-md mx-auto">
              Tokens → embeddings → similarity → next-token → context window. That's the spine the whole field hangs off. Now go watch it break in a real system.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={() => go("lab")} className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: "var(--gal-build)" }}>
                Open the RAG Lab →
              </button>
              <button onClick={() => go("concepts")} className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all">
                Concepts gym →
              </button>
              <button onClick={() => go("preplab")} className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all">
                Try a question →
              </button>
            </div>
            <button onClick={() => setI(0)} className="mt-6 text-[11px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors">
              <Icon name="rotate-ccw" size={12} /> run it again
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
