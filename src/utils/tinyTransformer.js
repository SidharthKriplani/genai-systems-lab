// src/utils/tinyTransformer.js — the exact d_model=8 tiny transformer used by the
// transformer module's forward-pass panel, token-journey scene, and (via Concepts) dice rolls.
// Extracted from Concepts.jsx 2026-07-08 so nicheViz scenes can bind to the SAME math without
// a circular import. Numbers are identical to the pre-extraction implementation.

export const TRANSFORMER_SENTENCES = [
  { label: "the cat sat on", tokens: ["the", "cat", "sat", "on"] },
  { label: "large language models generate", tokens: ["large", "language", "models", "generate"] },
  { label: "attention is all you", tokens: ["attention", "is", "all", "you"] },
];

export const NEXT_CANDIDATES = [
  ["mat", "floor", "chair", "roof", "it", "him", "her", "that", "top", "edge"],
  ["text", "tokens", "sequences", "output", "answers", "predictions", "responses", "context"],
  ["need", "want", "see", "get", "know", "have", "do", "think", "feel", "say"],
];

export function seededRand(seed) {
  return function () {
    seed = (seed + 0x9e3779b9) | 0;
    let x = seed;
    x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b);
    x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return (x >>> 0) / 0xffffffff;
  };
}
export function randGauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-10)) * Math.cos(2 * Math.PI * r()); }
export function randMatrix(rows, cols, seed, scale = 0.3) {
  const r = seededRand(seed);
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => randGauss(r) * scale));
}
export function matMul(A, B) {
  const m = A.length, k = A[0].length, n = B[0].length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => A[i].reduce((s, a, l) => s + a * B[l][j], 0))
  );
}
export function matVec(M, v) { return M.map(row => row.reduce((s, x, i) => s + x * v[i], 0)); }
export function transposeM(M) { return M[0].map((_, j) => M.map(row => row[j])); }
export function softmaxT(arr, temp = 1.0) {
  const scaled = arr.map(v => v / Math.max(temp, 0.01));
  const max = Math.max(...scaled);
  const exps = scaled.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}
export function lnorm(v) {
  const mean = v.reduce((a, b) => a + b) / v.length;
  const std = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / v.length + 1e-5);
  return v.map(x => (x - mean) / std);
}
export function relu(v) { return v.map(x => Math.max(0, x)); }

export function runTransformer(sentenceIdx, n_heads, temperature) {
  const D = 8;
  const dh = Math.floor(D / n_heads);
  const tokens = TRANSFORMER_SENTENCES[sentenceIdx].tokens;
  const seqLen = tokens.length;

  // 1. Token + positional embeddings (raw kept separately so the token-journey
  // scene can show the vector BEFORE the position stamp — same numbers as before)
  const rawTokenEmbeds = tokens.map((tok) => {
    const wordSeed = tok.split("").reduce((s, c) => s + c.charCodeAt(0), 0) * 13 + sentenceIdx * 7;
    const r = seededRand(wordSeed);
    return Array.from({ length: D }, () => randGauss(r) * 0.5);
  });
  const tokenEmbeds = rawTokenEmbeds.map((emb, pos) =>
    emb.map((v, i) =>
      v + 0.5 * (i % 2 === 0
        ? Math.sin(pos / Math.pow(10000, i / D))
        : Math.cos(pos / Math.pow(10000, (i - 1) / D)))
    )
  );

  // 2. Multi-head attention — PRE-norm: LayerNorm is applied to the input BEFORE the
  // sublayer runs (x + Sublayer(LayerNorm(x))), which is what GPT-2 and essentially every
  // modern LLM actually does (this is the architecture the module's prose describes).
  const attnInput = tokenEmbeds.map(lnorm);
  const allHeadWeights = [];
  let attnOutput = Array.from({ length: seqLen }, () => new Array(D).fill(0));
  for (let h = 0; h < n_heads; h++) {
    const WQ = randMatrix(D, dh, 100 + h * 17 + sentenceIdx);
    const WK = randMatrix(D, dh, 200 + h * 17 + sentenceIdx);
    const WV = randMatrix(D, dh, 300 + h * 17 + sentenceIdx);
    const Q = matMul(attnInput, WQ);
    const K = matMul(attnInput, WK);
    const V = matMul(attnInput, WV);
    const scale = Math.sqrt(dh);
    const KT = transposeM(K);
    const rawScores = matMul(Q, KT).map(row => row.map(v => v / scale));
    const attnWeights = rawScores.map((row, i) =>
      softmaxT(row.map((v, j) => (j <= i ? v : -1e9)), temperature)
    );
    allHeadWeights.push(attnWeights);
    const headOut = matMul(attnWeights, V);
    for (let i = 0; i < seqLen; i++)
      for (let d = 0; d < dh; d++)
        attnOutput[i][h * dh + d] += headOut[i][d];
  }

  // 3. Residual add — pre-norm adds the sublayer output straight back onto the UN-normed
  // residual stream (no LayerNorm after the add; the next sublayer normalizes its own input).
  const normed = tokenEmbeds.map((emb, i) => emb.map((v, d) => v + attnOutput[i][d]));

  // 4. FFN: D → 2D → D — pre-norm again: LayerNorm the input before the sublayer.
  const ffnInput = normed.map(lnorm);
  const W1 = randMatrix(D, D * 2, 400 + sentenceIdx);
  const W2 = randMatrix(D * 2, D, 500 + sentenceIdx);
  const ffnOut = ffnInput.map(v => matVec(transposeM(W2), relu(matVec(transposeM(W1), v))));

  // 5. Residual add after FFN — again just the add, no LayerNorm wrapping it.
  const finalOut = normed.map((v, i) => v.map((x, d) => x + ffnOut[i][d]));

  // 6. Output logits for next-token candidates — real pre-norm stacks (e.g. GPT-2's `ln_f`)
  // apply one last LayerNorm to the residual stream right before the unembedding, since
  // nothing else in a pre-norm block normalizes it on the way out.
  const lastHidden = lnorm(finalOut[seqLen - 1]);
  const candidates = NEXT_CANDIDATES[sentenceIdx];
  const logits = candidates.map((tok) => {
    const wordSeed = tok.split("").reduce((s, c) => s + c.charCodeAt(0), 0) * 31 + 999;
    const WOut = randMatrix(D, 1, wordSeed + sentenceIdx * 53);
    return matVec(transposeM(WOut), lastHidden)[0];
  });
  const probs = softmaxT(logits, temperature);
  const nextTokenDist = candidates
    .map((tok, i) => ({ tok, prob: probs[i] }))
    .sort((a, b) => b.prob - a.prob);

  return { tokenEmbeds, allHeadWeights, finalOut, nextTokenDist, rawTokenEmbeds, normed };
}
