import { useState, useEffect, useRef } from "react";

// ─── STEP DATA ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "The Input Token",
    subtitle: "Text → integer ID",
    color: "#818cf8",
    desc: "Before a transformer sees any language, it sees integers. The tokenizer splits your text into subwords and maps each one to an ID in a fixed vocabulary.",
    detail: "\"The cat sat\" → [464, 3797, 3332]. These IDs are the only thing entering the model. Everything the model knows about language must be learned from these numbers.",
    svg: InputTokenSVG,
  },
  {
    id: 2,
    title: "Token Embedding",
    subtitle: "Integer → dense vector",
    color: "#a78bfa",
    desc: "Each token ID is looked up in an embedding table E ∈ ℝ^(vocab × d_model). The row for that ID becomes the token's representation — a dense vector of d_model floats.",
    detail: "Token 464 → row 464 of E → a vector of 768 numbers. Semantically similar tokens end up with geometrically close vectors. This is learned entirely from data.",
    svg: EmbeddingSVG,
  },
  {
    id: 3,
    title: "Positional Encoding",
    subtitle: "Adding position signal",
    color: "#c084fc",
    desc: "Transformers have no inherent sense of order — attention is permutation-equivariant. Positional encodings inject position information by adding a fixed (or learned) signal to each embedding.",
    detail: "PE(pos, 2i) = sin(pos / 10000^(2i/d)). The resulting vector carries both meaning (from embedding) and position (from PE). Now the model knows token 464 is at position 0.",
    svg: PositionalSVG,
  },
  {
    id: 4,
    title: "Q, K, V Projections",
    subtitle: "Three learned matrices",
    color: "#e879f9",
    desc: "Each token's vector is projected three ways using weight matrices W_Q, W_K, W_V. This produces a Query, Key, and Value for every position.",
    detail: "Q = XW_Q, K = XW_K, V = XW_V. Think: Q = \"what am I looking for?\", K = \"what do I contain?\", V = \"what will I contribute?\"",
    svg: QKVProjectionSVG,
  },
  {
    id: 5,
    title: "Attention Scores",
    subtitle: "Q · Kᵀ / √d_k → softmax",
    color: "#f472b6",
    desc: "Each token's Query is dot-producted against every token's Key. After scaling by √d_k and applying softmax, this gives a probability distribution — how much to attend to each position.",
    detail: "scores = softmax(QKᵀ / √d_k). For a 4-token sequence, each token gets a 4-wide attention weight vector. These weights decide whose Values to aggregate.",
    svg: AttentionScoresSVG,
  },
  {
    id: 6,
    title: "Weighted Value Sum",
    subtitle: "Attention output Z",
    color: "#fb7185",
    desc: "The attention weights from step 5 are used to take a weighted sum of the Value vectors. The result Z is a context-aware representation of each token.",
    detail: "Z = softmax(QKᵀ / √d_k) · V. Each token's output now contains information from other tokens, weighted by relevance. This is the core of the attention mechanism.",
    svg: AttentionOutputSVG,
  },
  {
    id: 7,
    title: "Multi-Head Attention",
    subtitle: "H parallel heads → concat → project",
    color: "#f97316",
    desc: "Instead of one attention function, run H parallel heads with different learned projections. Each head can attend to different aspects of the input simultaneously.",
    detail: "MultiHead(Q,K,V) = Concat(head_1,...,head_H) · W_O. GPT-2 small uses 12 heads. Each head has d_k = d_model/H = 64. Different heads learn syntax, coreference, position, etc.",
    svg: MultiHeadSVG,
  },
  {
    id: 8,
    title: "Residual + LayerNorm",
    subtitle: "Add & Norm",
    color: "#eab308",
    desc: "The multi-head attention output is added back to the original input (residual connection), then normalized. This prevents vanishing gradients and stabilizes training.",
    detail: "x = LayerNorm(x + MHA(x)). The residual connection means gradients can flow directly from output to input without passing through attention. This enables deep stacking.",
    svg: ResidualNormSVG,
  },
  {
    id: 9,
    title: "Feed-Forward Network",
    subtitle: "Expand 4×, activate, compress",
    color: "#22c55e",
    desc: "After attention mixes information across positions, each position is processed independently through a two-layer MLP with a 4× expansion and a non-linear activation (GELU/ReLU).",
    detail: "FFN(x) = GELU(xW_1 + b_1)W_2 + b_2. d_model=768 → d_ff=3072 → 768. Another residual + LayerNorm follows. The FFN is where most fact-level knowledge is believed to be stored.",
    svg: FFNsvg,
  },
  {
    id: 10,
    title: "Full Transformer Stack",
    subtitle: "N × block → LM head → probabilities",
    color: "#34d399",
    desc: "Steps 4–9 form one transformer block. Stack N of them (GPT-2: 12, GPT-3: 96). The final hidden state passes through a linear head + softmax to produce next-token probabilities.",
    detail: "The model outputs a probability over the entire vocabulary at each position. Training minimizes cross-entropy loss between predicted and actual next tokens across billions of examples.",
    svg: FullStackSVG,
  },
];

// ─── SVG DIAGRAMS ─────────────────────────────────────────────────────────────

function InputTokenSVG() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* Text box */}
      <rect x="20" y="70" width="120" height="60" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
      <text x="80" y="96" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontFamily="monospace">"The cat sat"</text>
      <text x="80" y="114" textAnchor="middle" fill="#6366f1" fontSize="9" fontFamily="monospace">raw text</text>

      {/* Arrow */}
      <line x1="145" y1="100" x2="175" y2="100" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4,2"/>
      <polygon points="175,96 185,100 175,104" fill="#4f46e5"/>
      <text x="165" y="92" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">tokenize</text>

      {/* Token IDs */}
      <rect x="190" y="60" width="115" height="80" rx="8" fill="#0f172a" stroke="#4f46e5" strokeWidth="1"/>
      <text x="247" y="82" textAnchor="middle" fill="#818cf8" fontSize="9" fontFamily="monospace">token IDs</text>
      {["464", "3797", "3332"].map((id, i) => (
        <g key={i}>
          <rect x="200" y={92 + i * 18} width="94" height="14" rx="3" fill="#1e1b4b"/>
          <text x="247" y={103 + i * 18} textAnchor="middle" fill="#c7d2fe" fontSize="10" fontFamily="monospace">{id}</text>
        </g>
      ))}
    </svg>
  );
}

function EmbeddingSVG() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* Token ID */}
      <rect x="10" y="85" width="55" height="30" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5"/>
      <text x="37" y="104" textAnchor="middle" fill="#a5b4fc" fontSize="12" fontFamily="monospace">464</text>

      {/* Arrow */}
      <line x1="68" y1="100" x2="95" y2="100" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4,2"/>
      <polygon points="95,96 105,100 95,104" fill="#818cf8"/>

      {/* Embedding table */}
      <rect x="108" y="30" width="60" height="140" rx="6" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
      <text x="138" y="22" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">E ∈ ℝ^(V×768)</text>
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x="114" y={36 + i * 18} width="48" height="12" rx="2"
          fill={i === 3 ? "#312e81" : "#1a1a2e"}
          stroke={i === 3 ? "#818cf8" : "none"}/>
      ))}
      <text x="138" y="91" textAnchor="middle" fill="#a5b4fc" fontSize="7" fontFamily="monospace">row 464</text>
      <text x="138" y="170" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">50,257 rows</text>

      {/* Arrow */}
      <line x1="172" y1="100" x2="198" y2="100" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4,2"/>
      <polygon points="198,96 208,100 198,104" fill="#818cf8"/>

      {/* Vector output */}
      <rect x="210" y="50" width="28" height="100" rx="4" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1.5"/>
      {Array.from({length: 10}).map((_, i) => (
        <rect key={i} x="215" y={56 + i * 9} width="18" height="6" rx="1"
          fill={`rgba(167,139,250,${0.1 + Math.random() * 0.5})`}/>
      ))}
      <text x="224" y="163" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">768d</text>

      {/* Label */}
      <text x="224" y="178" textAnchor="middle" fill="#a78bfa" fontSize="8" fontFamily="monospace">embedding</text>
    </svg>
  );
}

function PositionalSVG() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* Embedding vector */}
      <rect x="20" y="50" width="28" height="100" rx="4" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1.5"/>
      {Array.from({length: 10}).map((_, i) => (
        <rect key={i} x="25" y={56 + i * 9} width="18" height="6" rx="1" fill="rgba(167,139,250,0.35)"/>
      ))}
      <text x="34" y="165" textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace">e_tok</text>

      {/* Plus */}
      <text x="64" y="105" textAnchor="middle" fill="#c084fc" fontSize="22" fontFamily="monospace">+</text>

      {/* Positional encoding */}
      <rect x="80" y="50" width="28" height="100" rx="4" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.5"/>
      {Array.from({length: 10}).map((_, i) => (
        <rect key={i} x="85" y={56 + i * 9} width="18" height="6" rx="1"
          fill={`rgba(192,132,252,${Math.abs(Math.sin(i * 0.8)) * 0.6 + 0.1})`}/>
      ))}
      <text x="94" y="165" textAnchor="middle" fill="#c084fc" fontSize="7" fontFamily="monospace">PE(pos)</text>

      {/* Arrow */}
      <line x1="115" y1="100" x2="142" y2="100" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4,2"/>
      <polygon points="142,96 152,100 142,104" fill="#c084fc"/>

      {/* Result */}
      <rect x="155" y="50" width="28" height="100" rx="4" fill="#1e1b4b" stroke="#e879f9" strokeWidth="2"/>
      {Array.from({length: 10}).map((_, i) => (
        <rect key={i} x="160" y={56 + i * 9} width="18" height="6" rx="1"
          fill={`rgba(232,121,249,${0.25 + Math.abs(Math.sin(i * 0.5)) * 0.4})`}/>
      ))}
      <text x="169" y="165" textAnchor="middle" fill="#e879f9" fontSize="7" fontFamily="monospace">x₀</text>

      {/* Formula */}
      <rect x="196" y="70" width="110" height="60" rx="6" fill="#0f172a" stroke="#374151"/>
      <text x="251" y="92" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">sin(pos/10000^</text>
      <text x="251" y="106" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">(2i/d_model))</text>
      <text x="251" y="120" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">unique per position</text>
    </svg>
  );
}

function QKVProjectionSVG() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* Input x */}
      <rect x="10" y="80" width="28" height="40" rx="4" fill="#1e1b4b" stroke="#e879f9" strokeWidth="1.5"/>
      <text x="24" y="104" textAnchor="middle" fill="#e879f9" fontSize="9" fontFamily="monospace">x</text>

      {/* Three arrows */}
      {[["Q","#818cf8",40],["K","#34d399",80],["V","#fb7185",120]].map(([label, col, y]) => (
        <g key={label}>
          <line x1="42" y1="100" x2="80" y2={y} stroke={col} strokeWidth="1" strokeDasharray="3,2"/>
          <rect x="82" y={y-15} width="40" height="28" rx="5" fill="#0f172a" stroke={col} strokeWidth="1.5"/>
          <text x="102" y={y-2} textAnchor="middle" fill={col} fontSize="9" fontFamily="monospace">W_{label}</text>
          <line x1="124" y1={y} x2="158" y2={y} stroke={col} strokeWidth="1.5" strokeDasharray="3,2"/>
          <polygon points={`158,${y-4} 168,${y} 158,${y+4}`} fill={col}/>
          <rect x="170" y={y-15} width="28" height="28" rx="4" fill="#1e1b4b" stroke={col} strokeWidth="1.5"/>
          <text x="184" y={y+4} textAnchor="middle" fill={col} fontSize="11" fontFamily="monospace">{label}</text>
        </g>
      ))}

      {/* Labels */}
      <text x="184" y="168" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">3 projections</text>
      <text x="102" y="168" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">weight matrices</text>
    </svg>
  );
}

function AttentionScoresSVG() {
  const tokens = ["The", "cat", "sat", "."];
  const weights = [
    [0.6, 0.2, 0.1, 0.1],
    [0.1, 0.5, 0.3, 0.1],
    [0.2, 0.3, 0.4, 0.1],
    [0.1, 0.1, 0.2, 0.6],
  ];
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      <text x="160" y="16" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">attention weights (row = query token)</text>
      {tokens.map((tok, i) => (
        <text key={i} x={80 + i * 50} y="34" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">{tok}</text>
      ))}
      {tokens.map((rowTok, ri) => (
        <g key={ri}>
          <text x="28" y={58 + ri * 36} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">{rowTok}</text>
          {weights[ri].map((w, ci) => (
            <rect key={ci} x={58 + ci * 50} y={44 + ri * 36} width="38" height="24" rx="4"
              fill={`rgba(244,114,182,${w * 0.95 + 0.05})`}/>
          ))}
          {weights[ri].map((w, ci) => (
            <text key={ci} x={77 + ci * 50} y={60 + ri * 36} textAnchor="middle"
              fill="white" fontSize="9" fontFamily="monospace">{w.toFixed(1)}</text>
          ))}
        </g>
      ))}
      <text x="160" y="192" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">softmax(QKᵀ / √d_k) — rows sum to 1</text>
    </svg>
  );
}

function AttentionOutputSVG() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* Weights × Values */}
      <rect x="10" y="55" width="50" height="90" rx="5" fill="#1e1b4b" stroke="#f472b6" strokeWidth="1.5"/>
      <text x="35" y="105" textAnchor="middle" fill="#f472b6" fontSize="9" fontFamily="monospace">attn</text>
      <text x="35" y="118" textAnchor="middle" fill="#f472b6" fontSize="9" fontFamily="monospace">weights</text>

      <text x="76" y="104" textAnchor="middle" fill="#9ca3af" fontSize="20">·</text>

      <rect x="90" y="55" width="50" height="90" rx="5" fill="#1e1b4b" stroke="#fb7185" strokeWidth="1.5"/>
      <text x="115" y="105" textAnchor="middle" fill="#fb7185" fontSize="11" fontFamily="monospace">V</text>

      <text x="156" y="104" textAnchor="middle" fill="#9ca3af" fontSize="18">=</text>

      {/* Output Z */}
      <rect x="168" y="55" width="50" height="90" rx="5" fill="#1e1b4b" stroke="#34d399" strokeWidth="2"/>
      <text x="193" y="97" textAnchor="middle" fill="#34d399" fontSize="13" fontFamily="monospace">Z</text>
      <text x="193" y="112" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace">context</text>
      <text x="193" y="124" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace">vector</text>

      {/* Callout */}
      <rect x="228" y="65" width="82" height="70" rx="6" fill="#0f172a" stroke="#374151"/>
      <text x="269" y="83" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">each token</text>
      <text x="269" y="95" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">now carries</text>
      <text x="269" y="107" textAnchor="middle" fill="#a5b4fc" fontSize="8" fontFamily="monospace">context from</text>
      <text x="269" y="119" textAnchor="middle" fill="#a5b4fc" fontSize="8" fontFamily="monospace">all positions</text>
    </svg>
  );
}

function MultiHeadSVG() {
  const heads = ["H1","H2","H3","...","H12"];
  const colors = ["#818cf8","#a78bfa","#c084fc","#6b7280","#f472b6"];
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* Input */}
      <rect x="6" y="85" width="30" height="30" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5"/>
      <text x="21" y="104" textAnchor="middle" fill="#818cf8" fontSize="9" fontFamily="monospace">x</text>

      {/* Heads */}
      {heads.map((h, i) => (
        <g key={i}>
          <line x1="38" y1="100" x2="65" y2={30 + i * 34} stroke={colors[i]} strokeWidth={i===3?0.5:1} strokeDasharray="3,2" opacity={i===3?0.4:1}/>
          <rect x="67" y={18 + i * 34} width="34" height="22" rx="4"
            fill={i===3?"#111":"#1e1b4b"} stroke={colors[i]} strokeWidth={i===3?0.5:1.5} opacity={i===3?0.5:1}/>
          <text x="84" y={33 + i * 34} textAnchor="middle" fill={colors[i]} fontSize={i===3?9:9} fontFamily="monospace">{h}</text>
          <line x1="103" y1={29 + i * 34} x2="140" y2={29 + i * 34} stroke={colors[i]} strokeWidth={i===3?0.5:1} strokeDasharray="3,2" opacity={i===3?0.4:1}/>
        </g>
      ))}

      {/* Concat box */}
      <rect x="142" y="20" width="32" height="160" rx="5" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5"/>
      <text x="158" y="104" textAnchor="middle" fill="#818cf8" fontSize="8" fontFamily="monospace" transform="rotate(-90 158 104)">concat</text>

      {/* Project */}
      <line x1="176" y1="100" x2="200" y2="100" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="202" y="75" width="40" height="50" rx="5" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5"/>
      <text x="222" y="98" textAnchor="middle" fill="#818cf8" fontSize="9" fontFamily="monospace">W_O</text>
      <text x="222" y="112" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">project</text>

      {/* Output */}
      <line x1="244" y1="100" x2="268" y2="100" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="270" y="78" width="36" height="44" rx="5" fill="#1e1b4b" stroke="#34d399" strokeWidth="2"/>
      <text x="288" y="103" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">MHA</text>
    </svg>
  );
}

function ResidualNormSVG() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* Input x */}
      <rect x="12" y="85" width="30" height="30" rx="5" fill="#1e1b4b" stroke="#eab308" strokeWidth="1.5"/>
      <text x="27" y="104" textAnchor="middle" fill="#eab308" fontSize="9" fontFamily="monospace">x</text>

      {/* Residual skip line */}
      <path d="M 27 85 L 27 40 L 225 40 L 225 85" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="5,2"/>
      <text x="126" y="34" textAnchor="middle" fill="#eab308" fontSize="8" fontFamily="monospace">residual (skip connection)</text>

      {/* MHA block */}
      <line x1="44" y1="100" x2="68" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="70" y="76" width="70" height="48" rx="6" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5"/>
      <text x="105" y="98" textAnchor="middle" fill="#818cf8" fontSize="9" fontFamily="monospace">MHA(x)</text>
      <text x="105" y="112" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">or FFN(x)</text>

      {/* Plus */}
      <line x1="142" y1="100" x2="160" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3,2"/>
      <circle cx="172" cy="100" r="12" fill="#1a1a2e" stroke="#eab308" strokeWidth="1.5"/>
      <text x="172" y="105" textAnchor="middle" fill="#eab308" fontSize="16">+</text>

      {/* LayerNorm */}
      <line x1="186" y1="100" x2="204" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="206" y="78" width="68" height="44" rx="6" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="240" y="98" textAnchor="middle" fill="#22c55e" fontSize="9" fontFamily="monospace">LayerNorm</text>
      <text x="240" y="112" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">mean=0, var=1</text>

      {/* Output */}
      <line x1="276" y1="100" x2="306" y2="100" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points="304,96 314,100 304,104" fill="#eab308"/>
    </svg>
  );
}

function FFNsvg() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* Input */}
      <rect x="8" y="82" width="30" height="36" rx="5" fill="#1e1b4b" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="23" y="98" textAnchor="middle" fill="#22c55e" fontSize="8" fontFamily="monospace">768d</text>
      <text x="23" y="110" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">input</text>

      {/* W1 expand */}
      <line x1="40" y1="100" x2="60" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="62" y="48" width="52" height="104" rx="5" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="88" y="100" textAnchor="middle" fill="#22c55e" fontSize="8" fontFamily="monospace">W₁</text>
      <text x="88" y="113" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">×4 expand</text>
      <text x="88" y="124" textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace">3072d</text>

      {/* GELU */}
      <line x1="116" y1="100" x2="134" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="136" y="76" width="46" height="48" rx="5" fill="#0f172a" stroke="#86efac" strokeWidth="1.5"/>
      <text x="159" y="100" textAnchor="middle" fill="#86efac" fontSize="9" fontFamily="monospace">GELU</text>
      <text x="159" y="114" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">non-linear</text>

      {/* W2 compress */}
      <line x1="184" y1="100" x2="202" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="204" y="48" width="52" height="104" rx="5" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="230" y="100" textAnchor="middle" fill="#22c55e" fontSize="8" fontFamily="monospace">W₂</text>
      <text x="230" y="113" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">compress</text>
      <text x="230" y="124" textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace">768d</text>

      {/* Output */}
      <line x1="258" y1="100" x2="278" y2="100" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="280" y="82" width="32" height="36" rx="5" fill="#1e1b4b" stroke="#34d399" strokeWidth="2"/>
      <text x="296" y="98" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace">768d</text>
      <text x="296" y="110" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">output</text>
    </svg>
  );
}

function FullStackSVG() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full">
      {/* 3 stacked blocks representing N layers */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x="60" y={20 + i * 44} width="100" height="36" rx="6"
            fill="#0f172a" stroke={i===0?"#6366f1":"#374151"} strokeWidth={i===0?2:1}/>
          <text x="110" y={40 + i * 44} textAnchor="middle" fill={i===0?"#818cf8":"#6b7280"} fontSize="9" fontFamily="monospace">
            Transformer Block {i===0?"(top)":i===2?"(bottom)":""}
          </text>
          <text x="110" y={52 + i * 44} textAnchor="middle" fill="#374151" fontSize="7" fontFamily="monospace">
            MHA → Add&Norm → FFN → Add&Norm
          </text>
        </g>
      ))}
      <text x="110" y="160" textAnchor="middle" fill="#4b5563" fontSize="11">⋮</text>
      <text x="110" y="172" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">×12 (GPT-2) / ×96 (GPT-3)</text>

      {/* Arrow to LM head */}
      <line x1="162" y1="100" x2="195" y2="100" stroke="#34d399" strokeWidth="1.5" strokeDasharray="4,2"/>
      <polygon points="195,96 205,100 195,104" fill="#34d399"/>

      {/* LM Head */}
      <rect x="207" y="70" width="68" height="30" rx="5" fill="#0f172a" stroke="#34d399" strokeWidth="1.5"/>
      <text x="241" y="88" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">LM Head</text>

      {/* Softmax */}
      <line x1="241" y1="102" x2="241" y2="118" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="207" y="120" width="68" height="28" rx="5" fill="#0f172a" stroke="#86efac" strokeWidth="1.5"/>
      <text x="241" y="136" textAnchor="middle" fill="#86efac" fontSize="9" fontFamily="monospace">softmax</text>

      {/* Output */}
      <line x1="241" y1="150" x2="241" y2="166" stroke="#86efac" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="207" y="168" width="68" height="24" rx="5" fill="#1e1b4b" stroke="#86efac" strokeWidth="2"/>
      <text x="241" y="183" textAnchor="middle" fill="#86efac" fontSize="8" fontFamily="monospace">P(next token)</text>
    </svg>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function TransformerWalkthrough() {
  const [step, setStep]       = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef           = useRef(null);
  const current               = STEPS[step];
  const SVGComponent          = current.svg;

  // Auto-advance every 4 s when playing
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

  // Manual step — pause auto-play
  const goTo = (i) => { setStep(i); setPlaying(false); };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between gap-2"
        style={{ background: current.color + "10" }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
            style={{ color: current.color, background: current.color + "20", border: `1px solid ${current.color}40` }}>
            {current.id}/{STEPS.length}
          </span>
          <span className="text-[11px] text-zinc-400 font-mono truncate hidden xs:inline sm:inline">{current.subtitle}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Progress dots — hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-1">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="w-1.5 h-1.5 rounded-full transition-all hover:scale-125"
                style={{ background: i === step ? current.color : i < step ? current.color + "55" : "#374151" }}/>
            ))}
          </div>
          {/* Play / Pause */}
          <button
            onClick={() => {
              if (step >= STEPS.length - 1) { setStep(0); setPlaying(true); }
              else setPlaying(p => !p);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
            title={playing ? "Pause" : "Play"}>
            {playing
              ? <span>⏸ <span className="hidden sm:inline">pause</span></span>
              : step >= STEPS.length - 1
                ? <span>↺ <span className="hidden sm:inline">replay</span></span>
                : <span>▶ <span className="hidden sm:inline">play</span></span>
            }
          </button>
        </div>
      </div>

      {/* Body — fixed height so card never jumps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:h-[300px]">
        {/* Diagram — fixed height on all screen sizes */}
        <div className="p-3 sm:p-4 flex items-center justify-center bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 h-[180px] sm:h-[220px] md:h-auto">
          <div className="w-full max-w-[280px] sm:max-w-[300px] aspect-[320/200]">
            <SVGComponent />
          </div>
        </div>

        {/* Text — scrollable, fixed height on mobile */}
        <div className="p-4 sm:p-5 flex flex-col h-[220px] sm:h-[260px] md:h-auto overflow-y-auto">
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-black text-white mb-2 leading-tight">{current.title}</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-2 sm:mb-3">{current.desc}</p>
            <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed font-mono">{current.detail}</p>
          </div>
          {/* Nav */}
          <div className="flex items-center gap-3 pt-4 mt-auto shrink-0">
            <button onClick={() => goTo(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
              ← prev
            </button>
            <span className="text-[10px] text-zinc-600 font-mono flex-1 text-center">
              {step + 1} / {STEPS.length}
            </span>
            <button onClick={() => goTo(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                borderColor: current.color + "60",
                color: current.color,
                background: current.color + "10",
              }}>
              next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
