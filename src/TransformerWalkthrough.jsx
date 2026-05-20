import { useState, useEffect, useRef } from "react";

// ─── STEP DATA ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1, title: "The Input Token", subtitle: "Text → integer ID", color: "#818cf8",
    desc: "Before a transformer sees any language, it sees integers. The tokenizer splits text into subword units and maps each to an ID from a fixed vocabulary.",
    detail: "\"The cat sat\" → [464, 3797, 3332]. These three numbers are everything the model receives. All language understanding is learned from patterns in these IDs.",
    svg: InputTokenSVG,
  },
  {
    id: 2, title: "Token Embedding", subtitle: "Integer → dense vector", color: "#a78bfa",
    desc: "Each token ID is looked up in an embedding table E ∈ ℝ^(vocab × d_model). The corresponding row becomes that token's representation — a dense vector of floats.",
    detail: "Token 464 → row 464 of E → a vector of 768 numbers. Semantically similar tokens end up with geometrically close vectors. This is learned entirely from data.",
    svg: EmbeddingSVG,
  },
  {
    id: 3, title: "Positional Encoding", subtitle: "Injecting position", color: "#c084fc",
    desc: "Attention is order-agnostic. Positional encodings add a position-dependent signal to each embedding so the model knows where each token sits in the sequence.",
    detail: "PE(pos, 2i) = sin(pos / 10000^(2i/d)). The result carries both meaning (from embedding) and position (from PE). Now the model knows token 464 is at position 0.",
    svg: PositionalSVG,
  },
  {
    id: 4, title: "Q, K, V Projections", subtitle: "Three learned views", color: "#e879f9",
    desc: "Each token's vector is projected three ways using learned weight matrices W_Q, W_K, W_V — producing a Query, Key, and Value for every position.",
    detail: "Q = XW_Q, K = XW_K, V = XW_V. Q = \"what am I looking for?\", K = \"what do I contain?\", V = \"what will I contribute if selected?\"",
    svg: QKVProjectionSVG,
  },
  {
    id: 5, title: "Attention Scores", subtitle: "Q·Kᵀ / √d_k → softmax", color: "#f472b6",
    desc: "Each token's Query is dot-producted against every Key. Scaled by √d_k and softmaxed, this produces a probability distribution over all positions.",
    detail: "scores = softmax(QKᵀ / √d_k). For a 4-token sequence, each token gets a 4-wide attention weight vector. These weights decide how to aggregate Values.",
    svg: AttentionScoresSVG,
  },
  {
    id: 6, title: "Weighted Value Sum", subtitle: "Context-aware output Z", color: "#fb7185",
    desc: "The attention weights from step 5 are used to take a weighted sum of Value vectors. Each token's output now contains information from all other tokens.",
    detail: "Z = softmax(QKᵀ / √d_k) · V. A token attending strongly to another token borrows its Value vector proportionally. This is the core of attention.",
    svg: AttentionOutputSVG,
  },
  {
    id: 7, title: "Multi-Head Attention", subtitle: "H parallel heads → concat → project", color: "#f97316",
    desc: "Instead of one attention function, run H parallel heads with different projections. Each head specialises in different relationships simultaneously.",
    detail: "MultiHead = Concat(head₁,...,headₕ)·W_O. GPT-2 uses 12 heads with d_k=64 each. Different heads learn syntax, coreference, position, and semantics.",
    svg: MultiHeadSVG,
  },
  {
    id: 8, title: "Residual + LayerNorm", subtitle: "Add & Norm", color: "#eab308",
    desc: "The attention output is added back to the original input (residual), then normalised. This enables gradient flow through deep stacks and stabilises training.",
    detail: "x = LayerNorm(x + MHA(x)). The residual lets gradients skip attention entirely during backprop. Without this, transformers beyond 6 layers would vanish.",
    svg: ResidualNormSVG,
  },
  {
    id: 9, title: "Feed-Forward Network", subtitle: "Expand 4×, activate, compress", color: "#22c55e",
    desc: "After attention mixes information across positions, each token is processed independently through a two-layer MLP with a 4× hidden dimension and GELU activation.",
    detail: "FFN(x) = GELU(xW₁+b₁)W₂+b₂. d_model=768 → d_ff=3072 → 768. This is where most factual knowledge in the model is believed to be stored.",
    svg: FFNsvg,
  },
  {
    id: 10, title: "Full Transformer Stack", subtitle: "N × block → LM head → probabilities", color: "#34d399",
    desc: "Steps 4–9 form one transformer block. Stack N of them, then pass the final hidden states through a linear LM head + softmax to get next-token probabilities.",
    detail: "GPT-2: 12 layers. GPT-3: 96 layers. Training minimises cross-entropy loss between predicted and actual next tokens over billions of examples.",
    svg: FullStackSVG,
  },
];

// ─── SHARED SVG DEFS (gradients + arrowhead marker) ──────────────────────────
function SvgDefs({ color = "#818cf8" }) {
  return (
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#4b5563" />
      </marker>
      <marker id={`arrow-${color.replace("#","")}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill={color} />
      </marker>
      <linearGradient id="vecGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.7" />
        <stop offset="100%" stopColor={color} stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id="vecGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.9" />
        <stop offset="100%" stopColor={color} stopOpacity="0.3" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
}

// Helper: draw a vector bar column
function VecBar({ x, y, w = 22, cells = 10, color, opacity = 1, label, height = 110 }) {
  const cellH = height / cells;
  return (
    <g opacity={opacity}>
      {Array.from({ length: cells }).map((_, i) => {
        const alpha = 0.08 + (Math.sin(i * 1.3 + x * 0.1) * 0.5 + 0.5) * 0.55;
        return (
          <rect key={i} x={x} y={y + i * cellH} width={w} height={cellH - 1.5} rx="1.5"
            fill={color} opacity={alpha} />
        );
      })}
      <rect x={x} y={y} width={w} height={height} rx="4"
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
      {label && (
        <text x={x + w / 2} y={y + height + 14} textAnchor="middle"
          fill={color} fontSize="9" fontFamily="monospace" opacity="0.9">{label}</text>
      )}
    </g>
  );
}

// Helper: labeled box
function Box({ x, y, w, h, color, label, sublabel, rx = 7 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx}
        fill={color + "18"} stroke={color} strokeWidth="1.5" />
      {label && (
        <text x={x + w / 2} y={y + h / 2 + (sublabel ? -5 : 4)} textAnchor="middle"
          fill={color} fontSize="11" fontFamily="monospace" fontWeight="700">{label}</text>
      )}
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle"
          fill={color} fontSize="8" fontFamily="monospace" opacity="0.7">{sublabel}</text>
      )}
    </g>
  );
}

// Helper: dashed arrow
function Arrow({ x1, y1, x2, y2, color = "#4b5563", dashed = true }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ex = x2 - (dx / len) * 8;
  const ey = y2 - (dy / len) * 8;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey}
        stroke={color} strokeWidth="1.5"
        strokeDasharray={dashed ? "5,3" : "none"} opacity="0.7" />
      <polygon
        points={`${x2},${y2} ${x2 - (dx/len)*10 - (dy/len)*4},${y2 - (dy/len)*10 + (dx/len)*4} ${x2 - (dx/len)*10 + (dy/len)*4},${y2 - (dy/len)*10 - (dx/len)*4}`}
        fill={color} opacity="0.85" />
    </g>
  );
}

// ─── SVG DIAGRAMS ────────────────────────────────────────────────────────────

function InputTokenSVG() {
  const c = "#818cf8";
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      {/* Background */}
      <rect width="320" height="200" fill="#08080f" rx="0" />

      {/* Text input */}
      <rect x="14" y="24" width="116" height="38" rx="8" fill="#0d0d20" stroke={c} strokeWidth="1.5" />
      <text x="72" y="40" textAnchor="middle" fill="#c7d2fe" fontSize="11" fontFamily="monospace" fontWeight="700">"The cat sat"</text>
      <text x="72" y="56" textAnchor="middle" fill={c} fontSize="9" fontFamily="monospace" opacity="0.6">raw text input</text>

      {/* Tokenizer arrow */}
      <Arrow x1={132} y1={43} x2={162} y2={43} color={c} dashed={true} />
      <text x="147" y="36" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">tokenize</text>

      {/* Token ID boxes */}
      {[["464","The",44], ["3,797","cat",80], ["3,332","sat",116]].map(([id, word, y], i) => (
        <g key={i}>
          <rect x="164" y={y - 14} width="140" height="28" rx="6"
            fill={c + "12"} stroke={c} strokeWidth="1.2" opacity={1 - i * 0.1} />
          <text x="220" y={y + 4} textAnchor="middle" fill="#c7d2fe" fontSize="11" fontFamily="monospace" fontWeight="700">{id}</text>
          <text x="282" y={y + 4} textAnchor="middle" fill={c} fontSize="9" fontFamily="monospace" opacity="0.5">"{word}"</text>
        </g>
      ))}

      {/* Bracket */}
      <line x1="162" y1="30" x2="162" y2="132" stroke={c} strokeWidth="1" opacity="0.3" />
      <line x1="162" y1="30" x2="164" y2="30" stroke={c} strokeWidth="1" opacity="0.3" />
      <line x1="162" y1="132" x2="164" y2="132" stroke={c} strokeWidth="1" opacity="0.3" />

      {/* Label */}
      <text x="160" y="162" textAnchor="middle" fill="#374151" fontSize="9" fontFamily="monospace">vocab size: 50,257 tokens</text>
      <rect x="64" y="170" width="194" height="22" rx="5" fill={c + "10"} stroke={c + "30"} strokeWidth="1" />
      <text x="161" y="185" textAnchor="middle" fill={c} fontSize="9" fontFamily="monospace">integer IDs → model input</text>
    </svg>
  );
}

function EmbeddingSVG() {
  const c = "#a78bfa";
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="320" height="200" fill="#08080f" />

      {/* Token ID */}
      <Box x={10} y={76} w={52} h={48} color={c} label="464" sublabel="token ID" />

      {/* Arrow */}
      <Arrow x1={64} y1={100} x2={90} y2={100} color={c} />

      {/* Embedding table */}
      <rect x="92" y="18" width="68" height="164" rx="7" fill="#0d0d1a" stroke={c} strokeWidth="1.5" opacity="0.9" />
      <text x="126" y="13" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">E ∈ ℝ^(V×768)</text>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="98" y={24 + i * 19} width="56" height="14" rx="3"
          fill={i === 4 ? c + "30" : "#ffffff08"}
          stroke={i === 4 ? c : "#ffffff08"}
          strokeWidth={i === 4 ? 1.5 : 0} />
      ))}
      <text x="126" y="103" textAnchor="middle" fill={c} fontSize="8" fontFamily="monospace" fontWeight="700">row 464 ↑</text>
      <text x="126" y="172" textAnchor="middle" fill="#374151" fontSize="8" fontFamily="monospace">50,257 rows</text>

      {/* Arrow */}
      <Arrow x1={162} y1={100} x2={188} y2={100} color={c} />

      {/* Output vector */}
      <VecBar x={190} y={15} w={28} cells={12} color={c} height={130} label="768d" />

      {/* Callout */}
      <rect x="226" y="50" width="88" height="70" rx="7" fill="#0d0d1a" stroke={c + "40"} strokeWidth="1" />
      <text x="270" y="70" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">learned from</text>
      <text x="270" y="83" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">billions of</text>
      <text x="270" y="96" textAnchor="middle" fill={c} fontSize="8" fontFamily="monospace" fontWeight="700">text examples</text>
      <text x="270" y="112" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">similar tokens</text>
      <text x="270" y="124" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">→ close vectors</text>
    </svg>
  );
}

function PositionalSVG() {
  const c = "#c084fc";
  // Draw a sine-wave-like PE signal
  const sinPoints = Array.from({ length: 40 }, (_, i) => {
    const x = 10 + i * 3;
    const y = 100 + Math.sin(i * 0.5) * 28;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="320" height="200" fill="#08080f" />

      {/* Embedding vector */}
      <VecBar x={14} y={20} w={28} cells={11} color="#a78bfa" height={120} label="e_tok" />

      {/* Plus */}
      <text x="60" y="86" textAnchor="middle" fill={c} fontSize="28" fontWeight="300">+</text>

      {/* PE vector with sine-like pattern */}
      <g>
        {Array.from({ length: 11 }).map((_, i) => {
          const alpha = Math.abs(Math.sin(i * 0.7)) * 0.65 + 0.1;
          return (
            <rect key={i} x="78" y={20 + i * 10} width="28" height="8" rx="1.5"
              fill={c} opacity={alpha} />
          );
        })}
        <rect x="78" y="20" width="28" height="120" rx="4"
          fill="none" stroke={c} strokeWidth="1.5" opacity="0.7" />
        <text x="92" y="154" textAnchor="middle" fill={c} fontSize="9" fontFamily="monospace" opacity="0.8">PE(pos)</text>
      </g>

      {/* Arrow */}
      <Arrow x1={109} y1={80} x2={130} y2={80} color={c} />

      {/* Result */}
      <VecBar x={133} y={20} w={28} cells={11} color="#e879f9" height={120} label="x₀" />

      {/* Sine wave illustration */}
      <rect x="175" y="10" width="136" height="90" rx="7" fill="#0d0d1a" stroke={c + "30"} strokeWidth="1" />
      <text x="243" y="24" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">positional signal</text>
      <polyline points={sinPoints} fill="none" stroke={c} strokeWidth="1.5" opacity="0.7"
        transform="translate(175, -64)" />
      <text x="243" y="90" textAnchor="middle" fill={c} fontSize="8" fontFamily="monospace">sin/cos at freq 1/10000^(2i/d)</text>

      {/* Bottom callout */}
      <rect x="14" y="160" width="292" height="32" rx="6" fill={c + "10"} stroke={c + "30"} strokeWidth="1" />
      <text x="160" y="173" textAnchor="middle" fill={c} fontSize="9" fontFamily="monospace">unique pattern per position · learned or fixed</text>
      <text x="160" y="185" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">modern models (Llama, GPT) use learned positional embeddings</text>
    </svg>
  );
}

function QKVProjectionSVG() {
  const c = "#e879f9";
  const data = [
    { label: "Q", color: "#818cf8", y: 30,  desc: "what am I looking for?" },
    { label: "K", color: "#34d399", y: 82,  desc: "what do I contain?" },
    { label: "V", color: "#fb7185", y: 134, desc: "what will I contribute?" },
  ];
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="320" height="200" fill="#08080f" />

      {/* Input */}
      <VecBar x={10} y={50} w={28} cells={9} color={c} height={96} label="x" />

      {data.map(({ label, color, y, desc }, i) => (
        <g key={i}>
          {/* Fan-out arrow */}
          <Arrow x1={40} y1={100} x2={76} y2={y + 22} color={color} />
          {/* W matrix */}
          <Box x={78} y={y} w={44} h={44} color={color} label={`W_${label}`} />
          {/* Arrow out */}
          <Arrow x1={124} y1={y + 22} x2={152} y2={y + 22} color={color} />
          {/* Output box */}
          <rect x="154" y={y + 5} width="36" height="36" rx="6"
            fill={color + "20"} stroke={color} strokeWidth="2" />
          <text x="172" y={y + 28} textAnchor="middle" fill={color} fontSize="14" fontFamily="monospace" fontWeight="800">{label}</text>
          {/* Description */}
          <text x="196" y={y + 24} fontSize="8" fontFamily="monospace" fill="#6b7280">{desc}</text>
        </g>
      ))}

      <text x="160" y="188" textAnchor="middle" fill="#374151" fontSize="8" fontFamily="monospace">d_model=768 → d_k=64 per head (12 heads)</text>
    </svg>
  );
}

function AttentionScoresSVG() {
  const c = "#f472b6";
  const tokens = ["The", "cat", "sat", "."];
  const weights = [
    [0.62, 0.18, 0.12, 0.08],
    [0.09, 0.54, 0.28, 0.09],
    [0.14, 0.31, 0.43, 0.12],
    [0.08, 0.10, 0.18, 0.64],
  ];
  const ox = 54, oy = 32, cw = 52, ch = 36;
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="320" height="200" fill="#08080f" />

      {/* Title */}
      <text x="160" y="16" textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="monospace">softmax(QKᵀ / √d_k) — each row sums to 1</text>

      {/* Column headers */}
      {tokens.map((t, i) => (
        <text key={i} x={ox + i * cw + cw / 2} y="30" textAnchor="middle"
          fill="#9ca3af" fontSize="9" fontFamily="monospace">{t}</text>
      ))}

      {/* Row labels + heatmap */}
      {weights.map((row, ri) => (
        <g key={ri}>
          <text x={ox - 8} y={oy + ri * ch + ch / 2 + 4} textAnchor="end"
            fill="#6b7280" fontSize="9" fontFamily="monospace">{tokens[ri]}</text>
          {row.map((w, ci) => (
            <g key={ci}>
              <rect x={ox + ci * cw} y={oy + ri * ch} width={cw - 3} height={ch - 3} rx="5"
                fill={c} opacity={w * 0.95 + 0.05} />
              <text x={ox + ci * cw + cw / 2 - 1} y={oy + ri * ch + ch / 2 + 4}
                textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" fontWeight="700"
                opacity={Math.max(0.5, w * 1.5)}>{w.toFixed(2)}</text>
            </g>
          ))}
        </g>
      ))}

      {/* Legend */}
      <rect x="10" y="168" width="300" height="26" rx="6" fill={c + "10"} stroke={c + "25"} strokeWidth="1" />
      <text x="160" y="183" textAnchor="middle" fill={c} fontSize="9" fontFamily="monospace">bright = high attention · each row is a softmax distribution</text>
    </svg>
  );
}

function AttentionOutputSVG() {
  const c = "#fb7185";
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="320" height="200" fill="#08080f" />

      {/* Attention weights */}
      <g>
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={i} x="14" y={30 + i * 32} width="50" height="26" rx="5"
            fill={c} opacity={[0.7, 0.3, 0.15, 0.1][i]} />
        ))}
        <rect x="14" y="30" width="50" height="128" rx="6"
          fill="none" stroke={c} strokeWidth="1.5" opacity="0.6" />
        <text x="39" y="170" textAnchor="middle" fill={c} fontSize="9" fontFamily="monospace" opacity="0.7">weights</text>
      </g>

      {/* × */}
      <text x="76" y="97" textAnchor="middle" fill="#4b5563" fontSize="22">×</text>

      {/* Value matrix */}
      <g>
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i}>
            {Array.from({ length: 5 }).map((_, j) => (
              <rect key={j} x={92 + j * 10} y={30 + i * 32} width="8" height="26" rx="2"
                fill="#818cf8" opacity={0.1 + Math.random() * 0.5} />
            ))}
          </g>
        ))}
        <rect x="92" y="30" width="54" height="128" rx="6"
          fill="none" stroke="#818cf8" strokeWidth="1.5" opacity="0.6" />
        <text x="119" y="170" textAnchor="middle" fill="#818cf8" fontSize="9" fontFamily="monospace" opacity="0.7">V matrix</text>
      </g>

      {/* = */}
      <text x="160" y="97" textAnchor="middle" fill="#4b5563" fontSize="22">=</text>

      {/* Output Z */}
      <VecBar x={172} y={18} w={34} cells={10} color="#34d399" height={130} label="Z" />
      <text x="189" y="162" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">output</text>

      {/* Callout */}
      <rect x="214" y="30" width="96" height="100" rx="7" fill="#0d0d1a" stroke="#34d399" strokeWidth="1" opacity="0.8" />
      <text x="262" y="52" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">each token's</text>
      <text x="262" y="65" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">output carries</text>
      <text x="262" y="82" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="700">context from</text>
      <text x="262" y="95" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="700">all positions</text>
      <text x="262" y="114" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">weighted by</text>
      <text x="262" y="126" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">relevance</text>
    </svg>
  );
}

function MultiHeadSVG() {
  const c = "#f97316";
  const heads = [
    { label: "H₁", color: "#818cf8", y: 18 },
    { label: "H₂", color: "#a78bfa", y: 52 },
    { label: "H₃", color: "#c084fc", y: 86 },
    { label: "H₄", color: "#e879f9", y: 120 },
    { label: "···", color: "#4b5563", y: 154 },
  ];
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="320" height="200" fill="#08080f" />

      {/* Input */}
      <Box x={8} y={72} w={36} h={52} color={c} label="x" />

      {/* Heads */}
      {heads.map((h, i) => (
        <g key={i} opacity={i === 4 ? 0.4 : 1}>
          <Arrow x1={46} y1={98} x2={74} y2={h.y + 16} color={h.color} />
          <rect x="76" y={h.y} width="42" height="32" rx="6"
            fill={h.color + "18"} stroke={h.color} strokeWidth={i === 4 ? 0.8 : 1.5} />
          <text x="97" y={h.y + 21} textAnchor="middle" fill={h.color} fontSize="10" fontFamily="monospace" fontWeight="700">{h.label}</text>
          <Arrow x1={120} y1={h.y + 16} x2={148} y2={h.y + 16} color={h.color} />
        </g>
      ))}

      {/* Concat block */}
      <rect x="150" y="8" width="32" height="180" rx="6" fill="#0d0d1a" stroke={c} strokeWidth="1.5" />
      <text x="166" y="100" textAnchor="middle" fill={c} fontSize="8" fontFamily="monospace"
        transform="rotate(-90 166 100)">concat</text>

      {/* W_O projection */}
      <Arrow x1={184} y1={98} x2={200} y2={98} color={c} />
      <Box x={202} y={72} w={44} h={52} color={c} label="W_O" sublabel="project" />

      {/* Output */}
      <Arrow x1={248} y1={98} x2={266} y2={98} color="#34d399" />
      <VecBar x={268} y={48} w={26} cells={9} color="#34d399" height={96} label="MHA" />

      <text x="160" y="196" textAnchor="middle" fill="#374151" fontSize="8" fontFamily="monospace">12 heads × 64d = 768d total</text>
    </svg>
  );
}

function ResidualNormSVG() {
  const c = "#eab308";
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="320" height="200" fill="#08080f" />

      {/* Input x */}
      <VecBar x={10} y={40} w={26} cells={9} color={c} height={96} label="x" />

      {/* Residual path (arc over top) */}
      <path d="M 23 40 L 23 20 L 240 20 L 240 60" fill="none"
        stroke={c} strokeWidth="1.5" strokeDasharray="6,3" opacity="0.6" />
      <text x="131" y="14" textAnchor="middle" fill={c} fontSize="8" fontFamily="monospace" opacity="0.7">residual (skip connection)</text>

      {/* Main path through MHA */}
      <Arrow x1={38} y1={88} x2={60} y2={88} color="#6b7280" />
      <Box x={62} y={58} w={74} h={60} color="#6366f1" label="MHA(x)" sublabel="or FFN(x)" />
      <Arrow x1={138} y1={88} x2={158} y2={88} color="#6b7280" />

      {/* Plus circle */}
      <circle cx="172" cy="88" r="14" fill="#0d0d1a" stroke={c} strokeWidth="2" />
      <text x="172" y="94" textAnchor="middle" fill={c} fontSize="18" fontWeight="300">+</text>

      {/* Arrow to LayerNorm */}
      <Arrow x1={188} y1={88} x2={206} y2={88} color="#6b7280" />

      {/* LayerNorm */}
      <Box x={208} y={58} w={74} h={60} color="#22c55e" label="LayerNorm" sublabel="μ=0, σ=1" />

      {/* Output arrow */}
      <Arrow x1={284} y1={88} x2={310} y2={88} color={c} />

      {/* Why it matters */}
      <rect x="10" y="156" width="300" height="36" rx="7" fill={c + "0e"} stroke={c + "30"} strokeWidth="1" />
      <text x="160" y="172" textAnchor="middle" fill={c} fontSize="9" fontFamily="monospace" fontWeight="700">enables gradient flow through 96+ layers</text>
      <text x="160" y="185" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">without residuals, deep transformers would vanish during backprop</text>
    </svg>
  );
}

function FFNsvg() {
  const c = "#22c55e";
  const layers = [
    { x: 8,   w: 28, h: 100, color: c,       label: "768d",  sub: "input" },
    { x: 76,  w: 60, h: 160, color: "#86efac",label: "3072d", sub: "W₁ ×4" },
    { x: 172, w: 38, h: 100, color: "#4ade80", label: "GELU", sub: "activate" },
    { x: 236, w: 60, h: 160, color: "#86efac",label: "3072d", sub: "W₂" },
    { x: 322, w: 28, h: 100, color: c,        label: "768d",  sub: "output" },
  ];
  return (
    <svg viewBox="0 0 360 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="360" height="200" fill="#08080f" />

      {layers.map((l, i) => (
        <g key={i}>
          {/* bar */}
          {Array.from({ length: Math.round(l.h / 14) }).map((_, j) => (
            <rect key={j}
              x={l.x} y={20 + (160 - l.h) / 2 + j * 13}
              width={l.w} height={11} rx="2"
              fill={l.color} opacity={0.08 + Math.abs(Math.sin(j * 0.8)) * 0.45} />
          ))}
          <rect x={l.x} y={20 + (160 - l.h) / 2} width={l.w} height={l.h} rx="5"
            fill="none" stroke={l.color} strokeWidth="1.5" opacity="0.8" />
          <text x={l.x + l.w / 2} y={20 + (160 - l.h) / 2 + l.h + 14}
            textAnchor="middle" fill={l.color} fontSize="9" fontFamily="monospace">{l.label}</text>
          <text x={l.x + l.w / 2} y={20 + (160 - l.h) / 2 + l.h + 25}
            textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">{l.sub}</text>
          {/* arrow between */}
          {i < layers.length - 1 && (
            <Arrow x1={l.x + l.w + 2} y1={100} x2={layers[i+1].x - 2} y2={100} color={l.color} dashed={true} />
          )}
        </g>
      ))}

      <text x="180" y="192" textAnchor="middle" fill="#374151" fontSize="8" fontFamily="monospace">FFN(x) = GELU(xW₁+b₁)W₂+b₂ · then Add&Norm again</text>
    </svg>
  );
}

function FullStackSVG() {
  const c = "#34d399";
  const blocks = [
    { label: "Block N (top)", color: "#6366f1" },
    { label: "Block N-1", color: "#4b5563" },
    { label: "Block N-2", color: "#374151" },
  ];
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <SvgDefs color={c} />
      <rect width="320" height="200" fill="#08080f" />

      {/* Stacked blocks */}
      {blocks.map((b, i) => (
        <g key={i}>
          <rect x="12" y={14 + i * 40} width="148" height="32" rx="7"
            fill={b.color + "18"} stroke={b.color} strokeWidth={i === 0 ? 2 : 1} />
          <text x="86" y={34 + i * 40} textAnchor="middle" fill={b.color} fontSize={i === 0 ? 9 : 8}
            fontFamily="monospace" fontWeight={i === 0 ? "700" : "400"}>{b.label}</text>
          {i < blocks.length - 1 && (
            <line x1="86" y1={47 + i * 40} x2="86" y2={54 + i * 40} stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />
          )}
        </g>
      ))}

      <text x="86" y="148" textAnchor="middle" fill="#374151" fontSize="14">⋮</text>
      <text x="86" y="164" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">×12 GPT-2 · ×96 GPT-3 · ×120 GPT-4</text>

      {/* Arrow to LM head */}
      <Arrow x1={162} y1={88} x2={184} y2={88} color={c} />

      {/* LM Head */}
      <Box x={186} y={62} w={62} h={32} color={c} label="LM Head" />

      {/* softmax */}
      <Arrow x1={217} y1={96} x2={217} y2={110} color={c} dashed={false} />
      <Box x={186} y={112} w={62} h={30} color="#86efac" label="softmax" />

      {/* Output */}
      <Arrow x1={217} y1={144} x2={217} y2={158} color="#86efac" dashed={false} />
      <rect x="170" y="160" width="94" height="28" rx="6" fill={"#86efac18"} stroke="#86efac" strokeWidth="2" />
      <text x="217" y="177" textAnchor="middle" fill="#86efac" fontSize="9" fontFamily="monospace" fontWeight="700">P(next token)</text>

      {/* Vocab note */}
      <text x="217" y="198" textAnchor="middle" fill="#374151" fontSize="8" fontFamily="monospace">50,257 probabilities</text>
    </svg>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function TransformerWalkthrough() {
  const [step, setStep]       = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef           = useRef(null);
  const current               = STEPS[step];
  const SVGComponent          = current.svg;
  const pct                   = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s >= STEPS.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const goTo = (i) => { setStep(i); setPlaying(false); };

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden"
      style={{ background: "#09090f" }}>

      {/* Progress bar */}
      <div className="h-[3px] bg-zinc-800 relative">
        <div className="absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-r"
          style={{ width: `${pct}%`, background: current.color }} />
      </div>

      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-zinc-800/60 flex items-center justify-between gap-2"
        style={{ background: current.color + "08" }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ color: current.color, background: current.color + "20", border: `1px solid ${current.color}40` }}>
            {step + 1} / {STEPS.length}
          </span>
          <span className="text-[11px] text-zinc-400 font-mono truncate">{current.subtitle}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Dots — desktop only */}
          <div className="hidden sm:flex items-center gap-1">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300 hover:scale-125"
                style={{
                  width: i === step ? "10px" : "6px",
                  height: i === step ? "6px" : "6px",
                  background: i === step ? current.color : i < step ? current.color + "60" : "#27272a",
                }} />
            ))}
          </div>
          <button
            onClick={() => {
              if (step >= STEPS.length - 1) { setStep(0); setPlaying(true); }
              else setPlaying(p => !p);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all"
            style={{
              borderColor: current.color + "40",
              color: current.color,
              background: current.color + "10",
            }}>
            {playing
              ? <>⏸ <span className="hidden sm:inline">pause</span></>
              : step >= STEPS.length - 1
                ? <>↺ <span className="hidden sm:inline">replay</span></>
                : <>▶ <span className="hidden sm:inline">play</span></>
            }
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:h-[310px]">
        {/* Diagram */}
        <div className="flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800/60 h-[200px] sm:h-[230px] md:h-auto"
          style={{ background: current.color + "04" }}>
          <div className="w-full max-w-[300px] px-2 aspect-[320/200]">
            <SVGComponent />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col h-[230px] sm:h-[260px] md:h-auto overflow-y-auto">
          <div className="flex-1 p-4 sm:p-5">
            {/* Step label */}
            <p className="text-[9px] font-mono uppercase tracking-widest mb-1.5"
              style={{ color: current.color }}>Step {current.id} — {current.subtitle}</p>
            <h3 className="text-sm sm:text-[15px] font-black text-white leading-tight mb-2.5">{current.title}</h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-3">{current.desc}</p>
            <p className="text-[11px] text-zinc-600 leading-relaxed font-mono border-l-2 pl-3"
              style={{ borderColor: current.color + "40" }}>{current.detail}</p>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-zinc-800/60 shrink-0">
            <button onClick={() => goTo(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
              ← prev
            </button>
            <div className="flex-1 flex justify-center gap-1 sm:hidden">
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: "6px", height: "6px",
                    background: i === step ? current.color : i < step ? current.color + "50" : "#27272a",
                  }} />
              ))}
            </div>
            <span className="text-[10px] text-zinc-700 font-mono flex-1 text-center hidden sm:block">
              {step + 1} of {STEPS.length}
            </span>
            <button onClick={() => goTo(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ borderColor: current.color + "50", color: current.color, background: current.color + "0d" }}>
              next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
