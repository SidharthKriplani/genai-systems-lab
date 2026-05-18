import { useState, useMemo, useRef, useEffect } from "react";

// ─── TOKENIZER DATA ───────────────────────────────────────────────────────────

const VOCAB = new Set([
  "the","a","an","in","on","at","to","for","of","with","by","from","as","is",
  "was","are","were","be","been","being","has","have","had","do","did","does",
  "will","would","could","should","may","might","shall","can","and","but","or",
  "if","not","no","so","yet","both","either","neither","nor","although","while",
  "time","year","people","way","day","man","woman","child","world","life","hand",
  "part","place","case","week","company","system","program","question","work",
  "government","number","night","point","home","water","room","mother","area",
  "money","story","fact","month","lot","right","study","book","eye","job","word",
  "business","issue","side","kind","head","house","service","friend","father",
  "power","hour","game","line","end","state","city","name","group","team",
  "school","war","family","body","order","change","idea","type","door","air",
  "age","country","thing","matter","form","use","rate","result","sense","face",
  "car","road","run","view","knowledge","help","talk","turn","start","show",
  "think","know","take","see","come","look","find","give","tell","call","want",
  "set","put","go","keep","let","begin","seem","move","live","believe","hold",
  "bring","happen","write","provide","sit","stand","lose","pay","meet","include",
  "continue","learn","lead","understand","watch","follow","stop","create","speak",
  "read","spend","grow","open","walk","win","offer","remember","love","consider",
  "appear","become","leave","mean","need","remain","send","build","fall","cut",
  "reach","pass","sell","decide","return","explain","hope","develop","carry",
  "break","receive","agree","support","hit","produce","eat","cover","catch",
  "draw","choose","cause","listen","plan","reduce","force","drop","ask","try",
  "say","get","make",
  "new","good","high","old","great","big","small","large","young","different",
  "black","long","little","important","bad","white","real","best","free","early",
  "able","human","local","sure","late","hard","major","better","economic",
  "strong","possible","whole","military","true","federal","international","full",
  "special","easy","clear","recent","certain","social","public","low","financial",
  "simple","various","next","own","few","main","available","light",
  "i","me","my","we","our","you","your","he","him","his","she","her","it","its",
  "they","them","their","what","which","who","this","that","these","those","all",
  "each","some","any","one","two","three","four","five","six","seven","eight",
  "nine","ten","first","second","third","last","many","much","more","most",
  "same","other","such","very","just","even","also","then","when","where","how",
  "why","here","there","after","before","over","under","again","between",
  "through","up","down","about","into","than","only","out","off","too","still",
  "well","back","already","always","never","really","now","often","together",
  "data","model","language","artificial","intelligence","machine","learning",
  "neural","network","deep","training","inference","token","vector","attention",
  "transformer","layer","weight","gradient","loss","output","input","context",
  "prompt","generation","parameter","dataset","function","algorithm","compute",
  "memory","encoder","decoder","embed","llm","gpt","ai","ml","rag","large",
  "text","image","search","retrieval","chunk","query","corpus","document",
  "response","answer","question","user","system","assistant","chat","message",
  "embedding","similarity","score","rank","rerank","index","database","store",
]);

const SUBWORDS = [
  "tion","ness","ment","able","ible","ful","less","ous","ive","ent","ant",
  "ist","ism","ize","ise","ify","ate","ary","ery","ory","age","ing","ed",
  "er","est","ly","al","ic","un","re","pre","dis","mis","over","under","out",
  "ation","ization","ational","ically","ology","ography","ware","tech","logy",
  "graph","gram","scope","meter","phone","vision","ster","less","ward","ship",
  "hood","dom","ity","acy","ance","ence","ure","ture","ive","ive","ory",
];

function tokenize(text) {
  const parts = text.match(/[a-zA-Z']+|[0-9]+|[^\w\s]|\s+/g) || [];
  const tokens = [];
  const PALETTE = [
    "bg-violet-900 border-violet-500 text-violet-200",
    "bg-blue-900 border-blue-500 text-blue-200",
    "bg-emerald-900 border-emerald-500 text-emerald-200",
    "bg-amber-900 border-amber-500 text-amber-200",
    "bg-rose-900 border-rose-500 text-rose-200",
    "bg-cyan-900 border-cyan-500 text-cyan-200",
    "bg-orange-900 border-orange-500 text-orange-200",
    "bg-pink-900 border-pink-500 text-pink-200",
    "bg-indigo-900 border-indigo-500 text-indigo-200",
    "bg-teal-900 border-teal-500 text-teal-200",
  ];
  let colorIdx = 0;
  let id = 0;

  for (const part of parts) {
    if (/^\s+$/.test(part)) continue;
    const lower = part.toLowerCase().replace(/'/g, "");
    const isWord = /^[a-zA-Z']+$/.test(part);
    const isNum = /^[0-9]+$/.test(part);
    const isPunct = /^[^\w\s]$/.test(part);

    if (isPunct) {
      tokens.push({ text: part, color: PALETTE[colorIdx++ % PALETTE.length], id: id++, type: "punct" });
      continue;
    }
    if (isNum) {
      for (let i = 0; i < part.length; i += 3) {
        tokens.push({ text: part.slice(i, i + 3), color: PALETTE[colorIdx++ % PALETTE.length], id: id++, type: "number" });
      }
      continue;
    }
    if (isWord) {
      if (VOCAB.has(lower)) {
        tokens.push({ text: part, color: PALETTE[colorIdx++ % PALETTE.length], id: id++, type: "word" });
      } else {
        const subs = splitWord(lower);
        subs.forEach((s) => {
          tokens.push({ text: s, color: PALETTE[colorIdx++ % PALETTE.length], id: id++, type: "subword" });
        });
      }
    }
  }
  return tokens;
}

function splitWord(word) {
  const result = [];
  let rem = word;
  while (rem.length > 0) {
    let found = false;
    for (let len = Math.min(rem.length, 9); len >= 2; len--) {
      const chunk = rem.slice(0, len);
      if (VOCAB.has(chunk) || SUBWORDS.includes(chunk)) {
        result.push(chunk);
        rem = rem.slice(len);
        found = true;
        break;
      }
    }
    if (!found) {
      result.push(rem.slice(0, 3));
      rem = rem.slice(3);
    }
  }
  return result.length ? result : [word];
}

const TOKENIZER_EXAMPLES = [
  "Large language models transform text into tokens before processing.",
  "The tokenization of 'unhappiness' reveals how subword vocabularies work.",
  "RAG systems retrieve relevant chunks and generate grounded answers.",
  "Transformers use self-attention to weigh relationships between all tokens.",
  "ChatGPT processes your message at roughly $0.002 per 1000 tokens.",
];

const COST_PER_1M = { input: 2.50, output: 10.00 }; // GPT-4o pricing

// ─── EMBEDDING DATA ───────────────────────────────────────────────────────────

const WORDS = [
  // royalty
  { word: "king",     x: -0.80, y:  0.70, cat: "royalty" },
  { word: "queen",    x: -0.70, y:  0.68, cat: "royalty" },
  { word: "prince",   x: -0.79, y:  0.58, cat: "royalty" },
  { word: "princess", x: -0.69, y:  0.56, cat: "royalty" },
  { word: "throne",   x: -0.86, y:  0.62, cat: "royalty" },
  { word: "royal",    x: -0.82, y:  0.76, cat: "royalty" },
  // gender
  { word: "man",      x: -0.60, y:  0.40, cat: "gender" },
  { word: "woman",    x: -0.50, y:  0.38, cat: "gender" },
  { word: "boy",      x: -0.58, y:  0.30, cat: "gender" },
  { word: "girl",     x: -0.48, y:  0.28, cat: "gender" },
  { word: "male",     x: -0.64, y:  0.46, cat: "gender" },
  { word: "female",   x: -0.54, y:  0.44, cat: "gender" },
  // countries
  { word: "france",   x:  0.68, y:  0.70, cat: "country" },
  { word: "germany",  x:  0.78, y:  0.68, cat: "country" },
  { word: "england",  x:  0.58, y:  0.66, cat: "country" },
  { word: "japan",    x:  0.82, y:  0.76, cat: "country" },
  { word: "india",    x:  0.75, y:  0.80, cat: "country" },
  { word: "usa",      x:  0.60, y:  0.72, cat: "country" },
  // cities
  { word: "paris",    x:  0.65, y:  0.55, cat: "city" },
  { word: "berlin",   x:  0.75, y:  0.53, cat: "city" },
  { word: "london",   x:  0.55, y:  0.51, cat: "city" },
  { word: "tokyo",    x:  0.79, y:  0.60, cat: "city" },
  { word: "delhi",    x:  0.72, y:  0.64, cat: "city" },
  { word: "rome",     x:  0.62, y:  0.58, cat: "city" },
  // animals
  { word: "cat",      x: -0.72, y: -0.65, cat: "animal" },
  { word: "dog",      x: -0.68, y: -0.72, cat: "animal" },
  { word: "fish",     x: -0.55, y: -0.60, cat: "animal" },
  { word: "bird",     x: -0.60, y: -0.54, cat: "animal" },
  { word: "lion",     x: -0.78, y: -0.58, cat: "animal" },
  { word: "horse",    x: -0.65, y: -0.76, cat: "animal" },
  { word: "puppy",    x: -0.71, y: -0.63, cat: "animal" },
  { word: "kitten",   x: -0.69, y: -0.67, cat: "animal" },
  // tech
  { word: "computer", x:  0.45, y:  0.22, cat: "tech" },
  { word: "phone",    x:  0.38, y:  0.16, cat: "tech" },
  { word: "data",     x:  0.52, y:  0.28, cat: "tech" },
  { word: "code",     x:  0.48, y:  0.32, cat: "tech" },
  { word: "model",    x:  0.55, y:  0.24, cat: "tech" },
  { word: "network",  x:  0.42, y:  0.30, cat: "tech" },
  { word: "software", x:  0.50, y:  0.18, cat: "tech" },
  { word: "ai",       x:  0.58, y:  0.30, cat: "tech" },
  // food
  { word: "apple",    x:  0.55, y: -0.60, cat: "food" },
  { word: "banana",   x:  0.62, y: -0.66, cat: "food" },
  { word: "orange",   x:  0.58, y: -0.54, cat: "food" },
  { word: "pizza",    x:  0.48, y: -0.72, cat: "food" },
  { word: "bread",    x:  0.45, y: -0.63, cat: "food" },
  { word: "rice",     x:  0.52, y: -0.68, cat: "food" },
  // transport
  { word: "car",      x: -0.30, y:  0.12, cat: "transport" },
  { word: "bus",      x: -0.24, y:  0.06, cat: "transport" },
  { word: "train",    x: -0.36, y:  0.17, cat: "transport" },
  { word: "plane",    x: -0.20, y:  0.22, cat: "transport" },
  { word: "bike",     x: -0.28, y:  0.02, cat: "transport" },
  { word: "ship",     x: -0.40, y:  0.10, cat: "transport" },
  // emotions
  { word: "happy",    x:  0.10, y: -0.30, cat: "emotion" },
  { word: "sad",      x:  0.04, y: -0.38, cat: "emotion" },
  { word: "angry",    x:  0.16, y: -0.44, cat: "emotion" },
  { word: "fear",     x:  0.08, y: -0.35, cat: "emotion" },
  { word: "love",     x:  0.20, y: -0.25, cat: "emotion" },
  { word: "joy",      x:  0.12, y: -0.28, cat: "emotion" },
];

const CAT_COLORS = {
  royalty:   { dot: "#8b5cf6", label: "Royalty",   text: "text-violet-400",  bg: "bg-violet-900/60" },
  gender:    { dot: "#ec4899", label: "Gender",    text: "text-pink-400",    bg: "bg-pink-900/60" },
  country:   { dot: "#3b82f6", label: "Countries", text: "text-blue-400",    bg: "bg-blue-900/60" },
  city:      { dot: "#06b6d4", label: "Cities",    text: "text-cyan-400",    bg: "bg-cyan-900/60" },
  animal:    { dot: "#22c55e", label: "Animals",   text: "text-emerald-400", bg: "bg-emerald-900/60" },
  tech:      { dot: "#f59e0b", label: "Tech",      text: "text-amber-400",   bg: "bg-amber-900/60" },
  food:      { dot: "#f97316", label: "Food",      text: "text-orange-400",  bg: "bg-orange-900/60" },
  transport: { dot: "#64748b", label: "Transport", text: "text-slate-400",   bg: "bg-slate-900/60" },
  emotion:   { dot: "#ef4444", label: "Emotions",  text: "text-red-400",     bg: "bg-red-900/60" },
};

// Vector arithmetic: a - b + c ≈ result
const ARITHMETIC_EXAMPLES = [
  { a: "king",  b: "man",    c: "woman",  result: "queen",  formula: "king − man + woman = queen" },
  { a: "paris", b: "france", c: "germany", result: "berlin", formula: "paris − france + germany = berlin" },
  { a: "puppy", b: "dog",    c: "cat",    result: "kitten", formula: "puppy − dog + cat = kitten" },
  { a: "tokyo", b: "japan",  c: "france", result: "paris",  formula: "tokyo − japan + france = paris" },
];

function cosine(a, b) {
  const dot = a.x * b.x + a.y * b.y;
  const ma = Math.sqrt(a.x * a.x + a.y * a.y);
  const mb = Math.sqrt(b.x * b.x + b.y * b.y);
  return dot / (ma * mb);
}

function nearestNeighbors(word, n = 5) {
  const target = WORDS.find((w) => w.word === word);
  if (!target) return [];
  return WORDS
    .filter((w) => w.word !== word)
    .map((w) => ({ ...w, sim: cosine(target, w) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, n);
}

// ─── ATTENTION DATA ───────────────────────────────────────────────────────────

const ATTENTION_EXAMPLES = [
  {
    label: "The cat sat on the mat",
    tokens: ["The", "cat", "sat", "on", "the", "mat"],
    note: "Classic syntactic sentence. Watch how 'cat' attends to 'sat' (subject→verb) and 'sat' attends to 'mat' (verb→object).",
    heads: [
      {
        name: "Syntactic",
        desc: "Subject→verb→object relationships",
        weights: [
          [0.50, 0.25, 0.10, 0.05, 0.07, 0.03],
          [0.10, 0.25, 0.50, 0.05, 0.05, 0.05],
          [0.05, 0.15, 0.25, 0.10, 0.05, 0.40],
          [0.03, 0.05, 0.30, 0.20, 0.07, 0.35],
          [0.08, 0.04, 0.03, 0.04, 0.35, 0.46],
          [0.05, 0.08, 0.28, 0.18, 0.08, 0.33],
        ],
      },
      {
        name: "Previous token",
        desc: "Each token primarily attends to the preceding token",
        weights: [
          [0.92, 0.06, 0.01, 0.00, 0.01, 0.00],
          [0.82, 0.14, 0.02, 0.01, 0.01, 0.00],
          [0.04, 0.84, 0.10, 0.01, 0.01, 0.00],
          [0.02, 0.03, 0.82, 0.10, 0.02, 0.01],
          [0.02, 0.01, 0.04, 0.82, 0.09, 0.02],
          [0.01, 0.01, 0.02, 0.04, 0.83, 0.09],
        ],
      },
      {
        name: "First token",
        desc: "All tokens attend strongly to the first token (CLS-like)",
        weights: [
          [0.80, 0.08, 0.04, 0.03, 0.03, 0.02],
          [0.72, 0.16, 0.05, 0.03, 0.02, 0.02],
          [0.64, 0.10, 0.16, 0.04, 0.03, 0.03],
          [0.60, 0.06, 0.12, 0.14, 0.05, 0.03],
          [0.55, 0.07, 0.06, 0.10, 0.16, 0.06],
          [0.50, 0.06, 0.12, 0.10, 0.08, 0.14],
        ],
      },
      {
        name: "Positional",
        desc: "Nearby tokens attend to each other — local context",
        weights: [
          [0.40, 0.35, 0.15, 0.05, 0.03, 0.02],
          [0.30, 0.30, 0.25, 0.10, 0.03, 0.02],
          [0.10, 0.25, 0.30, 0.22, 0.08, 0.05],
          [0.04, 0.10, 0.22, 0.30, 0.22, 0.12],
          [0.02, 0.05, 0.10, 0.22, 0.30, 0.31],
          [0.02, 0.03, 0.08, 0.15, 0.30, 0.42],
        ],
      },
    ],
  },
  {
    label: "She said she didn't mean it",
    tokens: ["She", "said", "she", "didn", "'t", "mean", "it"],
    note: "Pronoun coreference. The two instances of 'she' should attend to each other — watch Head 1 to see coreference resolution.",
    heads: [
      {
        name: "Coreference",
        desc: "Pronoun-to-pronoun coreference: both 'she' tokens attend to each other",
        weights: [
          [0.35, 0.15, 0.38, 0.04, 0.03, 0.03, 0.02],
          [0.12, 0.30, 0.12, 0.15, 0.10, 0.14, 0.07],
          [0.40, 0.10, 0.30, 0.05, 0.04, 0.07, 0.04],
          [0.05, 0.12, 0.08, 0.35, 0.28, 0.08, 0.04],
          [0.03, 0.08, 0.05, 0.30, 0.38, 0.10, 0.06],
          [0.05, 0.18, 0.06, 0.08, 0.08, 0.40, 0.15],
          [0.04, 0.10, 0.06, 0.05, 0.08, 0.25, 0.42],
        ],
      },
      {
        name: "Negation",
        desc: "'didn't' cluster — negation tokens attend to each other and the verb",
        weights: [
          [0.50, 0.20, 0.15, 0.06, 0.04, 0.03, 0.02],
          [0.15, 0.38, 0.12, 0.14, 0.10, 0.06, 0.05],
          [0.20, 0.10, 0.42, 0.08, 0.06, 0.08, 0.06],
          [0.06, 0.10, 0.06, 0.30, 0.35, 0.08, 0.05],
          [0.04, 0.08, 0.05, 0.35, 0.32, 0.10, 0.06],
          [0.05, 0.10, 0.08, 0.18, 0.16, 0.32, 0.11],
          [0.04, 0.08, 0.06, 0.10, 0.10, 0.20, 0.42],
        ],
      },
      {
        name: "Verb focus",
        desc: "All tokens attend toward the main verb 'mean'",
        weights: [
          [0.20, 0.10, 0.15, 0.08, 0.05, 0.38, 0.04],
          [0.10, 0.18, 0.10, 0.10, 0.08, 0.36, 0.08],
          [0.12, 0.08, 0.18, 0.08, 0.06, 0.40, 0.08],
          [0.06, 0.08, 0.06, 0.18, 0.14, 0.38, 0.10],
          [0.04, 0.06, 0.05, 0.15, 0.16, 0.42, 0.12],
          [0.08, 0.12, 0.10, 0.10, 0.10, 0.38, 0.12],
          [0.05, 0.08, 0.06, 0.08, 0.10, 0.28, 0.35],
        ],
      },
      {
        name: "Previous token",
        desc: "Each token attends to the one before it",
        weights: [
          [0.90, 0.08, 0.01, 0.00, 0.00, 0.01, 0.00],
          [0.80, 0.14, 0.04, 0.01, 0.01, 0.00, 0.00],
          [0.05, 0.82, 0.10, 0.02, 0.01, 0.00, 0.00],
          [0.02, 0.04, 0.82, 0.10, 0.01, 0.01, 0.00],
          [0.01, 0.02, 0.04, 0.82, 0.09, 0.01, 0.01],
          [0.01, 0.01, 0.02, 0.04, 0.82, 0.08, 0.02],
          [0.01, 0.01, 0.01, 0.02, 0.04, 0.82, 0.09],
        ],
      },
    ],
  },
  {
    label: "The model generates the next token",
    tokens: ["The", "model", "generates", "the", "next", "token"],
    note: "Technical sentence. See how 'generates' attends to 'model' and 'token', and how the second 'the' attends differently from the first.",
    heads: [
      {
        name: "Subject-verb",
        desc: "'model' and 'generates' form a tight attention cluster",
        weights: [
          [0.45, 0.28, 0.12, 0.06, 0.05, 0.04],
          [0.15, 0.32, 0.42, 0.04, 0.04, 0.03],
          [0.05, 0.38, 0.28, 0.06, 0.08, 0.15],
          [0.08, 0.06, 0.08, 0.38, 0.22, 0.18],
          [0.05, 0.08, 0.12, 0.20, 0.30, 0.25],
          [0.04, 0.10, 0.22, 0.12, 0.18, 0.34],
        ],
      },
      {
        name: "Modifier",
        desc: "'next' modifies 'token' — watch adjective→noun attention",
        weights: [
          [0.40, 0.25, 0.14, 0.08, 0.07, 0.06],
          [0.12, 0.35, 0.30, 0.08, 0.08, 0.07],
          [0.08, 0.22, 0.30, 0.08, 0.10, 0.22],
          [0.06, 0.05, 0.08, 0.42, 0.24, 0.15],
          [0.04, 0.06, 0.08, 0.15, 0.25, 0.42],
          [0.04, 0.08, 0.14, 0.10, 0.38, 0.26],
        ],
      },
      {
        name: "Article-to-noun",
        desc: "Both 'the' tokens attend forward to their noun",
        weights: [
          [0.20, 0.65, 0.08, 0.04, 0.02, 0.01],
          [0.12, 0.38, 0.36, 0.06, 0.05, 0.03],
          [0.06, 0.25, 0.32, 0.06, 0.10, 0.21],
          [0.04, 0.04, 0.06, 0.18, 0.15, 0.53],
          [0.03, 0.05, 0.08, 0.12, 0.22, 0.50],
          [0.04, 0.08, 0.16, 0.10, 0.22, 0.40],
        ],
      },
      {
        name: "Previous token",
        desc: "Baseline — each token looks back one step",
        weights: [
          [0.92, 0.06, 0.01, 0.00, 0.01, 0.00],
          [0.82, 0.14, 0.02, 0.01, 0.01, 0.00],
          [0.03, 0.84, 0.10, 0.02, 0.01, 0.00],
          [0.02, 0.03, 0.83, 0.10, 0.01, 0.01],
          [0.01, 0.02, 0.03, 0.83, 0.09, 0.02],
          [0.01, 0.01, 0.02, 0.03, 0.83, 0.10],
        ],
      },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function heatColor(v) {
  // 0 = dark zinc, 1 = bright violet
  const r = Math.round(clamp(v * 2.0, 0, 1) * 139 + clamp((v - 0.5) * 2, 0, 1) * 80);
  const g = Math.round(clamp(v * 0.5, 0, 1) * 20);
  const b = Math.round(clamp(v * 1.8, 0, 1) * 200 + clamp((v - 0.3) * 1.5, 0, 1) * 55);
  return `rgb(${r},${g},${b})`;
}

// ─── TOKENIZER MODULE ─────────────────────────────────────────────────────────

function TokenizerModule() {
  const [text, setText] = useState(TOKENIZER_EXAMPLES[0]);
  const tokens = useMemo(() => tokenize(text), [text]);
  const charCount = text.length;
  const inputCost = ((tokens.length / 1_000_000) * COST_PER_1M.input).toFixed(6);
  const costPer1M = COST_PER_1M.input.toFixed(2);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Input Text</span>
          <div className="flex gap-2">
            {TOKENIZER_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setText(ex)}
                className={`text-xs px-2 py-1 rounded font-mono transition-all ${text === ex ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <textarea
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-white font-mono resize-none focus:outline-none focus:border-violet-500 transition-colors"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type anything..."
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tokens", value: tokens.length, color: "text-violet-400" },
          { label: "Characters", value: charCount, color: "text-blue-400" },
          { label: "Chars / token", value: charCount > 0 && tokens.length > 0 ? (charCount / tokens.length).toFixed(1) : "—", color: "text-emerald-400" },
          { label: `Cost (GPT-4o $${costPer1M}/1M)`, value: `$${inputCost}`, color: "text-amber-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            <div className="text-xs text-zinc-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Token display */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Token Stream</span>
          <span className="text-xs text-zinc-600">Each coloured block = 1 token</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((tok) => (
            <span
              key={tok.id}
              className={`inline-flex items-center px-2 py-1 rounded border text-xs font-mono font-semibold ${tok.color}`}
              title={`Token ${tok.id} · type: ${tok.type}`}
            >
              {tok.text}
            </span>
          ))}
          {tokens.length === 0 && (
            <span className="text-xs text-zinc-600 italic">Start typing to see tokens...</span>
          )}
        </div>
      </div>

      {/* Token IDs */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Token IDs (approximate)</span>
        <div className="flex flex-wrap gap-1">
          {tokens.map((tok) => (
            <span key={tok.id} className="text-xs font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
              {tok.id * 137 + 1023}
            </span>
          ))}
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          The LLM never sees text — only integer IDs. Each ID maps to a learned embedding vector. The entire vocabulary (GPT-4: ~100k tokens) is a lookup table.
        </p>
      </div>

      {/* Insight */}
      <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-4">
        <div className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-2">Key insight</div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Tokenization is the first place things go wrong. Rare words, names, and technical terms split into many tokens — increasing cost and sometimes breaking semantic coherence. "tokenization" → {tokenize("tokenization").map(t => `"${t.text}"`).join(" + ")} = {tokenize("tokenization").length} tokens. Numbers are especially fragmented: "2024" → {tokenize("2024").length} token(s).
        </p>
      </div>
    </div>
  );
}

// ─── EMBEDDING MODULE ─────────────────────────────────────────────────────────

function EmbeddingModule() {
  const W = 680, H = 480;
  const pad = 40;
  const toSVG = (nx, ny) => ({
    x: ((nx + 1) / 2) * (W - pad * 2) + pad,
    y: ((1 - ny) / 2) * (H - pad * 2) + pad,
  });

  const [hovered, setHovered] = useState(null);
  const [arithIdx, setArithIdx] = useState(0);
  const [showArith, setShowArith] = useState(false);

  const ex = ARITHMETIC_EXAMPLES[arithIdx];
  const getW = (name) => WORDS.find((w) => w.word === name);

  const arithResult = useMemo(() => {
    if (!showArith) return null;
    const wa = getW(ex.a), wb = getW(ex.b), wc = getW(ex.c);
    if (!wa || !wb || !wc) return null;
    return { x: wa.x - wb.x + wc.x, y: wa.y - wb.y + wc.y };
  }, [showArith, arithIdx]);

  const neighbors = useMemo(() => hovered ? nearestNeighbors(hovered, 5) : [], [hovered]);

  const isHighlighted = (word) => {
    if (showArith) return [ex.a, ex.b, ex.c, ex.result].includes(word);
    if (hovered) return hovered === word || neighbors.some((n) => n.word === word);
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setShowArith((v) => !v)}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${showArith ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
        >
          {showArith ? "✦ Vector Arithmetic ON" : "Vector Arithmetic"}
        </button>
        {showArith && (
          <div className="flex gap-2">
            {ARITHMETIC_EXAMPLES.map((a, i) => (
              <button
                key={i}
                onClick={() => setArithIdx(i)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${arithIdx === i ? "bg-violet-700 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              >
                {a.a} − {a.b} + {a.c}
              </button>
            ))}
          </div>
        )}
        {!showArith && <span className="text-xs text-zinc-500">Hover a word to see nearest neighbours</span>}
      </div>

      {showArith && (
        <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-3">
          <span className="text-sm font-mono text-violet-300 font-bold">{ex.formula}</span>
          <span className="text-xs text-zinc-400 ml-3">The orange ✦ shows the computed vector — it lands near "{ex.result}"</span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* SVG */}
        <div className="col-span-12 lg:col-span-9 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
            {/* Grid lines */}
            {[-0.5, 0, 0.5].map((v) => {
              const { x } = toSVG(v, 0);
              const { y } = toSVG(0, v);
              return (
                <g key={v}>
                  <line x1={x} y1={pad} x2={x} y2={H - pad} stroke="#27272a" strokeWidth="1" />
                  <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="#27272a" strokeWidth="1" />
                </g>
              );
            })}
            {/* Axes */}
            {(() => {
              const ox = toSVG(0, 0).x, oy = toSVG(0, 0).y;
              return (
                <>
                  <line x1={pad} y1={oy} x2={W - pad} y2={oy} stroke="#3f3f46" strokeWidth="1.5" />
                  <line x1={ox} y1={pad} x2={ox} y2={H - pad} stroke="#3f3f46" strokeWidth="1.5" />
                  <text x={W - pad + 4} y={oy + 4} fill="#52525b" fontSize="10" fontFamily="monospace">PC1</text>
                  <text x={ox + 4} y={pad - 4} fill="#52525b" fontSize="10" fontFamily="monospace">PC2</text>
                </>
              );
            })()}

            {/* Arithmetic arrow */}
            {showArith && arithResult && (() => {
              const from = toSVG(getW(ex.c).x, getW(ex.c).y);
              const to = toSVG(clamp(arithResult.x, -0.95, 0.95), clamp(arithResult.y, -0.95, 0.95));
              return (
                <g>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
                  <circle cx={to.x} cy={to.y} r={10} fill="#f97316" opacity="0.25" />
                  <text x={to.x} y={to.y + 4} textAnchor="middle" fill="#fb923c" fontSize="14" fontFamily="monospace">✦</text>
                </g>
              );
            })()}

            {/* Neighbour lines */}
            {hovered && !showArith && neighbors.map((n) => {
              const from = toSVG(getW(hovered).x, getW(hovered).y);
              const to = toSVG(n.x, n.y);
              return (
                <line key={n.word} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="#8b5cf6" strokeWidth="1" opacity="0.4" strokeDasharray="3 2" />
              );
            })}

            {/* Words */}
            {WORDS.map((w) => {
              const { x, y } = toSVG(w.x, w.y);
              const cat = CAT_COLORS[w.cat];
              const hi = isHighlighted(w.word);
              const dim = (hovered || showArith) && !hi;
              const r = hi ? 7 : 5;
              return (
                <g key={w.word} style={{ cursor: "pointer" }} onMouseEnter={() => !showArith && setHovered(w.word)} onMouseLeave={() => !showArith && setHovered(null)}>
                  <circle cx={x} cy={y} r={r + 4} fill="transparent" />
                  <circle cx={x} cy={y} r={r} fill={cat.dot} opacity={dim ? 0.15 : hi ? 1 : 0.7}
                    stroke={hi ? "#fff" : "transparent"} strokeWidth="1.5" />
                  <text x={x + r + 3} y={y + 4} fill={dim ? "#3f3f46" : hi ? "#fff" : cat.dot}
                    fontSize={hi ? "11" : "9"} fontFamily="monospace" fontWeight={hi ? "bold" : "normal"}
                    opacity={dim ? 0.3 : 1}>
                    {w.word}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          {/* Legend */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Categories</div>
            {Object.entries(CAT_COLORS).map(([cat, { dot, label, text }]) => (
              <div key={cat} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
                <span className={text}>{label}</span>
              </div>
            ))}
          </div>

          {/* Neighbours or arithmetic */}
          {hovered && !showArith && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nearest to "{hovered}"</div>
              {neighbors.map((n, i) => (
                <div key={n.word} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">{i + 1}. {n.word}</span>
                  <span className="text-violet-400">{n.sim.toFixed(3)}</span>
                </div>
              ))}
            </div>
          )}

          {showArith && (
            <div className="rounded-xl border border-orange-800 bg-orange-950/20 p-3 space-y-2">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wide">Arithmetic</div>
              <div className="text-xs font-mono text-orange-300 space-y-1">
                <div>+ {ex.a}</div>
                <div>− {ex.b}</div>
                <div>+ {ex.c}</div>
                <div className="border-t border-orange-800 pt-1 text-orange-200">≈ {ex.result}</div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-3">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-2">What you're seeing</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Each word is a high-dimensional vector (e.g. 1536 dims in text-embedding-3-small). These 2D positions come from PCA — collapsing 1536 dims to 2 while preserving distances. Proximity = semantic similarity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ATTENTION MODULE ─────────────────────────────────────────────────────────

function AttentionModule() {
  const [exIdx, setExIdx] = useState(0);
  const [headIdx, setHeadIdx] = useState(0);
  const [hoveredRow, setHoveredRow] = useState(null);

  const ex = ATTENTION_EXAMPLES[exIdx];
  const head = ex.heads[headIdx];
  const tokens = ex.tokens;
  const weights = head.weights;

  const CELL = 52;
  const LABEL_W = 72;
  const LABEL_H = 72;

  return (
    <div className="space-y-4">
      {/* Sentence selector */}
      <div className="flex flex-wrap gap-2">
        {ATTENTION_EXAMPLES.map((e, i) => (
          <button
            key={i}
            onClick={() => { setExIdx(i); setHeadIdx(0); setHoveredRow(null); }}
            className={`px-3 py-2 rounded-lg text-xs font-mono transition-all ${exIdx === i ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            "{e.label}"
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-xs text-zinc-400 leading-relaxed">{ex.note}</p>
      </div>

      {/* Head selector */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-zinc-500">Attention head:</span>
        {ex.heads.map((h, i) => (
          <button
            key={i}
            onClick={() => { setHeadIdx(i); setHoveredRow(null); }}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${headIdx === i ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {h.name}
          </button>
        ))}
      </div>

      <div className="text-xs text-zinc-500 italic">{head.desc}</div>

      <div className="grid grid-cols-12 gap-4">
        {/* Heatmap */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 overflow-auto">
            <div className="text-xs text-zinc-600 mb-3 font-mono">
              Row = query token (what is attending) · Column = key token (being attended to)
            </div>
            <div style={{ display: "inline-block" }}>
              {/* Column headers */}
              <div style={{ display: "flex", marginLeft: LABEL_W }}>
                {tokens.map((t, j) => (
                  <div key={j} style={{ width: CELL, textAlign: "center" }}
                    className="text-xs font-mono text-zinc-400 pb-2 truncate">
                    {t}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {weights.map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}>
                  {/* Row label */}
                  <div style={{ width: LABEL_W, textAlign: "right", paddingRight: 10 }}
                    className={`text-xs font-mono truncate ${hoveredRow === i ? "text-white font-bold" : "text-zinc-400"}`}>
                    {tokens[i]}
                  </div>
                  {/* Cells */}
                  {row.map((v, j) => (
                    <div key={j}
                      style={{
                        width: CELL, height: CELL,
                        background: heatColor(v),
                        border: hoveredRow === i ? "1px solid #7c3aed" : "1px solid #18181b",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.2s",
                        cursor: "default",
                      }}
                      title={`${tokens[i]} → ${tokens[j]}: ${v.toFixed(2)}`}
                    >
                      <span style={{ fontSize: 10, color: v > 0.4 ? "#fff" : "#71717a", fontFamily: "monospace" }}>
                        {v.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart for hovered row */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          {hoveredRow !== null ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                "{tokens[hoveredRow]}" attends to:
              </div>
              {weights[hoveredRow]
                .map((v, j) => ({ v, j, tok: tokens[j] }))
                .sort((a, b) => b.v - a.v)
                .map(({ v, j, tok }) => (
                  <div key={j} className="space-y-0.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-300">{tok}</span>
                      <span className="text-violet-400">{(v * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${v * 100}%`, background: heatColor(v) }} />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
              <p className="text-xs text-zinc-500">Hover a row to see what that token attends to</p>
            </div>
          )}

          <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-3 space-y-2">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-wide">What this means</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Each row sums to 1.0 (softmax). High values = strong attention. A real transformer has 12–96 heads — each specialising in a different relationship type. This is a simplified 4-head simulation.
            </p>
          </div>

          {/* Color scale */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Colour scale</div>
            <div className="flex gap-1">
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((v) => (
                <div key={v} className="flex-1 h-4 rounded-sm" style={{ background: heatColor(v) }} title={v.toFixed(1)} />
              ))}
            </div>
            <div className="flex justify-between text-xs font-mono text-zinc-600">
              <span>0.0</span><span>0.5</span><span>1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN CONCEPTS APP ────────────────────────────────────────────────────────

const MODULES = [
  {
    id: "tokenizer",
    label: "Tokenizer",
    tag: "LAYER 0",
    title: "Tokenization",
    subtitle: "Text → integers. The first transformation in every LLM.",
    component: TokenizerModule,
  },
  {
    id: "embeddings",
    label: "Embedding Space",
    tag: "LAYER 1",
    title: "Semantic Embedding Space",
    subtitle: "Words as vectors. Meaning as geometry. Vector arithmetic as reasoning.",
    component: EmbeddingModule,
  },
  {
    id: "attention",
    label: "Attention",
    tag: "LAYER 2",
    title: "Self-Attention",
    subtitle: "How every token relates to every other token. The core of the transformer.",
    component: AttentionModule,
  },
];

export default function ConceptsApp() {
  const [active, setActive] = useState("tokenizer");
  const mod = MODULES.find((m) => m.id === active);
  const Component = mod.component;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Module selector */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              active === m.id ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <span className="text-zinc-500 mr-1.5">{m.tag}</span>
            {m.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-500 rounded font-mono">Autoregressive Gen — coming soon</span>
          <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-500 rounded font-mono">Agent Loop — coming soon</span>
        </div>
      </div>

      {/* Module header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono px-2 py-0.5 bg-violet-900 text-violet-300 rounded border border-violet-700">{mod.tag}</span>
          <span className="text-xs text-zinc-500">{mod.id}</span>
        </div>
        <h2 className="text-xl font-bold text-white">{mod.title}</h2>
        <p className="text-sm text-zinc-400 mt-0.5">{mod.subtitle}</p>
      </div>

      <Component />
    </div>
  );
}
