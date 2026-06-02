import { useState, useEffect, useRef, useMemo } from "react";
import { track } from "./analytics";
import { POST_CONTENT } from "./groundTruthPosts";
import { POSTS } from "./groundTruthIndex";
import TransformerWalkthrough from "./TransformerWalkthrough";
import SalaryCalculator from "./SalaryCalculator";
import { FeedbackBar } from "./shared";

// Every post maps to at least one interactive module on the platform.
// "labLink" is where the reader goes to test what they just read.

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function highlightText(text, term) {
  if (!term || term.length < 2) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) => i % 2 === 1 ? <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">{p}</mark> : p);
}

function countMatches(blocks, term) {
  if (!term || term.length < 2) return 0;
  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  let count = 0;
  blocks.forEach(b => {
    if (b.text) count += (b.text.match(re) || []).length;
  });
  return count;
}

const REACTIONS = [
  { id: "helped", emoji: "🎯", label: "Saved me in an interview" },
  { id: "mindblown", emoji: "🤯", label: "Mind = blown" },
  { id: "confusing", emoji: "🤔", label: "Confusing" },
  { id: "bookmark", emoji: "🔖", label: "Worth revisiting" },
];

function generateQuiz(blocks) {
  const questions = [];

  // Up to 2 questions from callout blocks
  const callouts = blocks.filter(b => b.t === "callout" && b.text?.length > 30);
  callouts.slice(0, 2).forEach(b => {
    const fact = b.text.split('.')[0];
    questions.push({
      q: "Which statement best summarizes a key insight from this section?",
      options: [
        fact.length > 110 ? fact.slice(0, 110) + "..." : fact,
        "The opposite of the above is generally true in production",
        "This only applies to systems with more than 1M daily users",
        "This is a theoretical concept with no production relevance",
      ],
      correct: 0,
      source: "callout"
    });
  });

  // Up to 2 questions from different list blocks
  const lists = blocks.filter(b => b.t === "list" && b.items?.length >= 3);
  const fakeSets = [
    ["Reducing context window size always improves accuracy", "Fine-tuning is always cheaper than RAG at scale", "Token costs have no impact on architecture decisions"],
    ["Always choose the largest available model for production", "Prompt engineering alone can solve all production failures", "Latency is irrelevant for non-interactive AI systems"],
  ];
  lists.slice(0, 2).forEach((b, i) => {
    const item = b.items[Math.min(i, b.items.length - 1)];
    questions.push({
      q: "Which of the following is explicitly mentioned in this post?",
      options: [item, ...fakeSets[i]],
      correct: 0,
      source: "list"
    });
  });

  // Up to 1 question from a table
  const tables = blocks.filter(b => b.t === "table" && b.rows?.length >= 2 && b.headers?.length >= 2);
  tables.slice(0, 1).forEach(b => {
    const val = b.rows[0][0];
    questions.push({
      q: `According to the comparison table in this post, which ${(b.headers[0] || "item").toLowerCase()} is listed first?`,
      options: [
        val,
        b.rows.length > 1 ? b.rows[1][0] : "A different option",
        b.rows.length > 2 ? b.rows[2][0] : "An unlisted option",
        "All options are treated as equivalent",
      ],
      correct: 0,
      source: "table"
    });
  });

  // Up to 1 question from section headers
  const headers = blocks.filter(b => b.t === "h2" && b.text?.length > 10);
  if (headers.length >= 2) {
    questions.push({
      q: "Which section heading appears in this post?",
      options: [
        headers[1].text,
        "How to avoid all production AI failures with a single rule",
        "Why context window size determines all model quality",
        "The single most important decision in AI system design",
      ],
      correct: 0,
      source: "header"
    });
  }

  // Up to 1 question from labelled code blocks
  const codes = blocks.filter(b => b.t === "code" && b.label?.length > 5);
  codes.slice(0, 1).forEach(b => {
    questions.push({
      q: `This post includes a code example: "${b.label.slice(0, 60)}". What does it illustrate?`,
      options: [
        "A practical implementation pattern relevant to the post's main topic",
        "A deprecated approach that should no longer be used in production",
        "A theoretical construct with no direct production application",
        "An error in the original research paper that was later corrected",
      ],
      correct: 0,
      source: "code"
    });
  });

  return questions.slice(0, 7);
}

// ─── POST DETAIL RENDERER ────────────────────────────────────────────────────
function Block({ b, onNavigate, color, postSearch }) {
  switch (b.t) {
    case "p":
      return <p className="text-[15px] text-zinc-300 leading-[1.8]">{highlightText(b.text, postSearch)}</p>;
    case "h2": {
      const headingId = b.text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return (
        <div className="group flex items-center gap-2" id={headingId}>
          <h2 className="text-lg font-black text-white mt-10 mb-1.5 tracking-tight">{highlightText(b.text, postSearch)}</h2>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href.split('#')[0] + '#' + headingId); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-400 text-xs mt-10"
            title="Copy link to section"
          >§</button>
        </div>
      );
    }
    case "h3":
      return <h3 className="text-[15px] font-bold text-zinc-100 mt-7 mb-1.5 tracking-tight">{highlightText(b.text, postSearch)}</h3>;
    case "divider":
      return <hr className="border-zinc-800 my-6" />;
    case "list":
      return (
        <ul className="space-y-1.5 pl-1">
          {b.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[15px] text-zinc-300 leading-[1.75]">
              <span className="text-zinc-500 shrink-0 mt-1">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "callout": {
      const styles = {
        key:     { border: "border-violet-800/60", bg: "bg-violet-950/30", text: "text-violet-300", dot: "bg-violet-400" },
        tip:     { border: "border-emerald-800/60", bg: "bg-emerald-950/30", text: "text-emerald-300", dot: "bg-emerald-400" },
        warning: { border: "border-amber-800/60",   bg: "bg-amber-950/30",   text: "text-amber-300",   dot: "bg-amber-400" },
        info:    { border: "border-blue-800/60",    bg: "bg-blue-950/30",    text: "text-blue-300",    dot: "bg-blue-400" },
      };
      const s = styles[b.v] || styles.info;
      return (
        <div className={`rounded-lg border ${s.border} ${s.bg} px-4 py-3 flex gap-3`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0 mt-1.5`} />
          <p className={`text-sm leading-relaxed ${s.text}`}>{highlightText(b.text, postSearch)}</p>
        </div>
      );
    }
    case "code": {
      const [isCopied, setIsCopied] = useState(false);
      return (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          {b.label && (
            <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono text-zinc-500">{b.label}</div>
          )}
          <div className="relative group">
            <pre className="px-4 py-3 overflow-x-auto bg-zinc-950">
              <code className="text-[11px] font-mono text-zinc-300 whitespace-pre">{b.text}</code>
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(b.text); setIsCopied(true); setTimeout(() => setIsCopied(false), 1500); }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-mono"
            >{isCopied ? "Copied!" : "Copy"}</button>
          </div>
        </div>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                {b.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-bold text-zinc-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-zinc-400 leading-relaxed">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "lab":
      return (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Try it on the platform</p>
            <p className="text-xs text-zinc-400">{b.desc}</p>
          </div>
          <button
            onClick={() => onNavigate(b.tab)}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
            style={{ background: color }}>
            {b.label}
          </button>
        </div>
      );
    case "video": {
      const ytId = b.youtubeId || b.id;
      const ytTitle = b.title || b.label || "";
      const ytChannel = b.channel || b.desc || "";
      const ytThumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      return (
        <a href={`https://www.youtube.com/watch?v=${ytId}`} target="_blank" rel="noopener noreferrer"
          className="group flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 hover:border-zinc-600 hover:bg-zinc-900/70 transition-all no-underline">
          <div className="relative shrink-0 w-28 rounded-lg overflow-hidden aspect-video bg-zinc-800">
            <img src={ytThumb} alt={ytTitle} className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/50">YouTube</span>
            </div>
            {ytTitle && <p className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors leading-snug mb-0.5">{ytTitle}</p>}
            {ytChannel && <p className="text-[10px] text-zinc-500 font-mono">{ytChannel}</p>}
          </div>
        </a>
      );
    }
    case "animation":
      if (b.name === "transformer") return <TransformerWalkthrough />;
      if (b.name === "salary-calc") return <SalaryCalculator />;
      return null;
    case "quote":
      return (
        <blockquote className="pl-5 py-1 my-2" style={{ borderLeft: `3px solid ${color}60` }}>
          <p className="text-[15px] text-zinc-300 italic leading-[1.75]">"{b.text}"</p>
          {b.attribution && <p className="text-[11px] text-zinc-500 font-mono mt-2">— {b.attribution}</p>}
        </blockquote>
      );
    case "references":
      return (
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">References &amp; Further Reading</p>
          <ul className="space-y-2">
            {b.items.map((ref, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-zinc-500 font-mono text-[11px] shrink-0 mt-0.5">[{i+1}]</span>
                {ref.url ? (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors leading-relaxed underline decoration-violet-800 hover:decoration-violet-400">
                    {ref.label}
                  </a>
                ) : (
                  <span className="text-xs text-zinc-500 leading-relaxed">{ref.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    case "refs": {
      function refPlatform(url = "") {
        if (url.includes("youtube.com") || url.includes("youtu.be")) return { label: "YouTube",   cls: "bg-red-950/60 text-red-400 border-red-900/50" };
        if (url.includes("arxiv.org"))       return { label: "arXiv",     cls: "bg-amber-950/40 text-amber-400 border-amber-800/50" };
        if (url.includes("anthropic.com"))   return { label: "Anthropic", cls: "bg-violet-950/40 text-violet-400 border-violet-800/50" };
        if (url.includes("openai.com"))      return { label: "OpenAI",    cls: "bg-emerald-950/40 text-emerald-400 border-emerald-800/50" };
        if (url.includes("huggingface.co"))  return { label: "HuggingFace", cls: "bg-yellow-950/40 text-yellow-400 border-yellow-800/50" };
        if (url.includes("github.com"))      return { label: "GitHub",    cls: "bg-zinc-800 text-zinc-300 border-zinc-700" };
        if (url.includes("lilianweng"))      return { label: "Lil'Log",   cls: "bg-pink-950/40 text-pink-400 border-pink-800/50" };
        if (url.includes("huyenchip") || url.includes("chiphuyen")) return { label: "Chip Huyen", cls: "bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-800/50" };
        if (url.includes("towardsdatascience") || url.includes("medium.com")) return { label: "Medium", cls: "bg-green-950/40 text-green-400 border-green-800/50" };
        if (url.includes("deeplearning.ai")) return { label: "DeepLearning.AI", cls: "bg-blue-950/40 text-blue-400 border-blue-800/50" };
        if (url.includes("paperswithcode")) return { label: "Papers with Code", cls: "bg-cyan-950/40 text-cyan-400 border-cyan-800/50" };
        return { label: "Link", cls: "bg-zinc-800 text-zinc-400 border-zinc-700" };
      }
      return (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">References &amp; Further Reading</p>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {b.items.map((ref, i) => {
              const label = ref.label || ref.title || "";
              const plt = refPlatform(ref.url);
              return (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-900/40 transition-colors">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${plt.cls}`}>{plt.label}</span>
                  {ref.url ? (
                    <a href={ref.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-zinc-300 hover:text-white transition-colors leading-relaxed flex-1">
                      {label} <span className="text-zinc-500">↗</span>
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-500 leading-relaxed flex-1">{label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

function PostDetail({ post, onBack, onOpenPost, onNavigate, onNavigateTo, activeReactions, onReact }) {
  const content = POST_CONTENT[post.id];
  const color = CAT_COLORS[post.category] || "#6366f1";
  const catLabel = CATEGORIES.find(c => c.id === post.category)?.label || post.category;
  const [scrollPct, setScrollPct] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const articleRef = useRef(null);

  // Feature 1 — Simple Mode
  const [simpleMode, setSimpleMode] = useState(false);

  // Feature 2 — In-post search
  const [postSearch, setPostSearch] = useState("");
  const matchCount = content ? countMatches(content, postSearch) : 0;

  // Feature 4 — Quiz
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState(false);

  const postUrl = `https://genai-systems-lab-ivory.vercel.app/#groundtruth/${post.id}`;
  const shareTitle = encodeURIComponent(`${post.title} — Ground Truth | GenAI Systems Lab`);
  const shareUrl   = encodeURIComponent(postUrl);

  function copyPostLink() {
    navigator.clipboard.writeText(postUrl).then(() => {
      setLinkCopied(true);
      track("post_link_copied", { post: post.id });
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  // Related posts — curated list from index first, fall back to same-category
  const related = post.related
    ? post.related.map(id => POSTS.find(p => p.id === id)).filter(p => p && POST_CONTENT[p.id])
    : POSTS.filter(p => p.id !== post.id && p.category === post.category && !!POST_CONTENT[p.id]).slice(0, 4);

  // Series navigation
  const postSeriesId = Object.keys(SERIES_META).find(sid => SERIES_META[sid].postIds.includes(post.id));
  const series = postSeriesId ? SERIES_META[postSeriesId] : null;
  const seriesPostIds = series?.postIds || [];
  const seriesIdx = seriesPostIds.indexOf(post.id);
  const prevSeriesPost = seriesIdx > 0 ? POSTS.find(p => p.id === seriesPostIds[seriesIdx - 1]) : null;
  const nextSeriesPost = seriesIdx < seriesPostIds.length - 1 ? POSTS.find(p => p.id === seriesPostIds[seriesIdx + 1]) : null;

  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) { setScrollPct(100); return; }
      const scrolled = -rect.top;
      setScrollPct(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    track("ground_truth_post_opened", { post: post.id });
    window.scrollTo(0, 0);

    // Dynamic SEO meta per post
    const base = "https://genai-systems-lab-ivory.vercel.app/";
    const title = `${post.title} — Ground Truth | GenAI Systems Lab`;
    const desc  = post.desc;

    document.title = title;
    const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute("content", val); };
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:url"]', `${base}#groundtruth/${post.id}`);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', desc);

    return () => {
      document.title = "GenAI Systems Lab — Interactive AI Engineering Platform";
      setMeta('meta[name="description"]', "The hands-on platform for AI engineers and product managers. 75+ interactive modules covering RAG, agents, evals, LLMOps, and system design.");
      setMeta('meta[property="og:title"]', "GenAI Systems Lab — Interactive AI Engineering Platform");
      setMeta('meta[property="og:description"]', "75+ interactive modules for AI engineers and PMs — RAG Lab, Agents, Evals, Red Teaming, and more.");
    };
  }, [post.id]);

  return (
    <div className="min-h-screen bg-zinc-950" id="post-print-content" ref={articleRef}>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #post-print-content { display: block !important; }
          #post-print-content { font-family: Georgia, serif; color: #000; background: #fff; padding: 2cm; max-width: 100%; }
          #post-print-content h2 { font-size: 1.3em; margin-top: 1.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; }
          #post-print-content pre { background: #f4f4f4; padding: 1em; border-radius: 4px; overflow: auto; font-size: 0.85em; }
          #post-print-content .no-print { display: none !important; }
        }
      `}</style>
      {/* Reading progress bar — fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-zinc-900">
        <div className="h-full transition-all duration-75 ease-out"
          style={{ width: `${scrollPct}%`, background: color }} />
      </div>

      <div className="max-w-[680px] mx-auto px-4 sm:px-8 py-8 sm:py-12">

        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors font-mono mb-6 sm:mb-8">
          ← Ground Truth
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{ color, background: color + "22", border: `1px solid ${color}44` }}>
              {catLabel}
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">{post.readMin} min read</span>
            <span className="text-xs text-zinc-500">by <span className="text-zinc-400 font-medium">Sidharth Kriplani</span></span>
            <div className="ml-auto flex items-center gap-2">
              {/* Feature 2 — In-post search */}
              <input
                value={postSearch} onChange={e => setPostSearch(e.target.value)}
                placeholder="Find in post..."
                className="text-xs px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 outline-none focus:border-zinc-500 w-28 focus:w-40 transition-all"
              />
              {postSearch.length >= 2 && <span className="text-xs text-zinc-500">{matchCount} matches</span>}
              {/* Feature 1 — Simple Mode toggle */}
              <button onClick={() => setSimpleMode(s => !s)} className="text-xs px-2 py-2.5 rounded border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white transition-all">
                {simpleMode ? "Full version" : "Simplify"}
              </button>
            </div>
          </div>
          {series && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-full border" style={{ color: series.color, borderColor: series.color + "44", background: series.color + "15" }}>
                {series.title}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Part {seriesIdx + 1} of {seriesPostIds.length}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-3">{post.title}</h1>
          <p className="text-[15px] text-zinc-400 leading-[1.7] mb-4">{post.desc}</p>
          {content && (
            <button
              onClick={() => {
                const q = generateQuiz(content);
                setQuizQuestions(q);
                setQuizAnswers({});
                setQuizRevealed(false);
                setQuizActive(true);
                setTimeout(() => document.getElementById("gt-quiz-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
              }}
              className="text-[11px] px-3 py-1.5 rounded-full border border-violet-700/50 bg-violet-950/20 hover:border-violet-500/70 hover:bg-violet-950/40 text-violet-400 hover:text-violet-300 transition-all font-mono"
            >
              ✦ Test yourself on this post →
            </button>
          )}
        </div>

        {/* Content or coming soon */}
        {content ? (
          <div className="space-y-5">
            {(() => {
              const headings = content.filter(b => b.t === "h2").map(b => b.text);
              return headings.length >= 3 ? (
                <div className="rounded-xl border border-zinc-800/60 p-4 mb-6" style={{ background: "linear-gradient(135deg, rgba(39,39,42,0.5) 0%, rgba(24,24,27,0.8) 100%)" }}>
                  <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2.5">In this post</p>
                  <ul className="space-y-1.5">
                    {headings.map((h, i) => (
                      <li key={i} className="text-[13px] text-zinc-400 hover:text-white cursor-pointer transition-colors flex items-center gap-2.5">
                        <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}
            {/* Feature 1 — Simple Mode banner */}
            {simpleMode && (
              <div className="rounded-xl bg-indigo-900/30 border border-indigo-700/50 p-4 mb-4">
                <p className="text-sm text-indigo-300">✨ <strong>Simple mode</strong> — showing only the key ideas. Toggle off for the full technical post.</p>
              </div>
            )}
            {(() => {
              const displayBlocks = simpleMode
                ? content.filter(b => b.t === "p" || b.t === "callout").slice(0, 8)
                : content;
              return (
                <>
                  {displayBlocks.map((b, i) => (
                    <Block key={i} b={b} onNavigate={onNavigate} color={color} postSearch={postSearch} />
                  ))}
                  {simpleMode && (
                    <div className="rounded-xl border border-indigo-800/50 bg-indigo-950/20 p-4 text-center">
                      <p className="text-sm text-indigo-300 mb-2">Want the full technical version?</p>
                      <button onClick={() => setSimpleMode(false)} className="text-xs px-3 py-1.5 rounded border border-indigo-600 text-indigo-300 hover:bg-indigo-900/40 transition-all">
                        Show full post
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
            {/* Feature 3 — Reactions */}
            <div className="border-t border-zinc-800 pt-4 mt-6">
              <p className="text-xs text-zinc-500 mb-2">React to this post</p>
              <div className="flex flex-wrap gap-2">
                {REACTIONS.map(r => {
                  const active = (activeReactions || []).includes(r.id);
                  return (
                    <button key={r.id} onClick={() => onReact(r.id)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs border transition-all ${active ? "border-violet-500 bg-violet-900/30 text-violet-300" : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"}`}>
                      <span>{r.emoji}</span>{r.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Feature 4 — Quiz Me */}
            <div id="gt-quiz-section" />
            {!quizActive ? (
              <div className="pt-2">
                <button
                  onClick={() => {
                    const q = generateQuiz(content);
                    setQuizQuestions(q);
                    setQuizAnswers({});
                    setQuizRevealed(false);
                    setQuizActive(true);
                  }}
                  className="text-xs px-3 py-2.5 rounded-lg border border-zinc-700 hover:border-violet-600 text-zinc-400 hover:text-violet-300 transition-all"
                >
                  Quiz me on this post →
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Quick Quiz</p>
                  <button onClick={() => setQuizActive(false)} className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">✕ Close</button>
                </div>
                {quizQuestions.length === 0 ? (
                  <p className="text-xs text-zinc-500">Not enough structured content to generate questions for this post.</p>
                ) : (
                  quizQuestions.map((q, qi) => (
                    <div key={qi} className="space-y-2">
                      <p className="text-xs font-bold text-zinc-300">{qi + 1}. {q.q}</p>
                      <div className="space-y-1">
                        {q.options.map((opt, oi) => {
                          const chosen = quizAnswers[qi] === oi;
                          const isCorrect = oi === q.correct;
                          const showResult = quizRevealed || quizAnswers[qi] !== undefined;
                          return (
                            <button
                              key={oi}
                              onClick={() => { if (quizAnswers[qi] === undefined) setQuizAnswers(prev => ({ ...prev, [qi]: oi })); }}
                              className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                                showResult && isCorrect ? "border-emerald-600 bg-emerald-950/30 text-emerald-300" :
                                showResult && chosen && !isCorrect ? "border-red-700 bg-red-950/30 text-red-400" :
                                chosen ? "border-violet-600 bg-violet-900/30 text-violet-300" :
                                "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
                {quizQuestions.length > 0 && !quizRevealed && (
                  <button
                    onClick={() => setQuizRevealed(true)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-emerald-600 text-zinc-400 hover:text-emerald-300 transition-all"
                  >
                    Reveal answers
                  </button>
                )}
                {quizRevealed && (
                  <p className="text-xs text-zinc-500">
                    Score: {quizQuestions.filter((q, qi) => quizAnswers[qi] === q.correct).length} / {quizQuestions.length}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <div className="text-3xl mb-3">✍️</div>
            <p className="text-sm font-bold text-white mb-1">Writing in progress</p>
            <p className="text-xs text-zinc-500 mb-4">This piece is planned — check back soon.</p>
            <button
              onClick={() => {
                if (onNavigateTo && post.labModuleId) {
                  onNavigateTo({ tab: post.labLink, moduleId: post.labModuleId });
                } else {
                  onNavigate(post.labLink);
                }
              }}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
              style={{ background: color }}>
              {post.labLabel}
            </button>
          </div>
        )}

        {/* Series navigation */}
        {series && (prevSeriesPost || nextSeriesPost) && (
          <div className="mt-10 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ color: series.color, background: series.color + "18" }}>{series.title}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Part {seriesIdx + 1} of {seriesPostIds.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prevSeriesPost ? (
                <button onClick={() => { onOpenPost(prevSeriesPost); window.scrollTo(0, 0); }}
                  className="text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 hover:border-zinc-600 transition-all group">
                  <div className="text-[10px] text-zinc-500 font-mono mb-1">← Previous in series</div>
                  <p className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors leading-snug">{prevSeriesPost.title}</p>
                </button>
              ) : <div />}
              {nextSeriesPost ? (
                <button onClick={() => { onOpenPost(nextSeriesPost); window.scrollTo(0, 0); }}
                  className="text-left rounded-xl border bg-zinc-900/40 p-3.5 hover:opacity-90 transition-all group sm:text-right" style={{ borderColor: series.color + "44" }}>
                  <div className="text-[10px] font-mono mb-1" style={{ color: series.color + "99" }}>Next in series →</div>
                  <p className="text-xs font-bold text-white leading-snug">{nextSeriesPost.title}</p>
                </button>
              ) : <div />}
            </div>
          </div>
        )}

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Keep reading</p>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map(r => {
                const rc = CAT_COLORS[r.category] || "#6366f1";
                const catLbl = CATEGORIES.find(c => c.id === r.category)?.label || r.category;
                const isCross = r.category !== post.category;
                return (
                  <button key={r.id}
                    onClick={() => { track("related_post_clicked", { from: post.id, to: r.id }); onOpenPost(r); window.scrollTo(0, 0); }}
                    className="text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-600 hover:bg-zinc-900/60 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, ${rc}bb, transparent)` }} />
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                        style={{ color: rc, borderColor: rc + "44", background: rc + "15" }}>
                        {catLbl}
                      </span>
                      {isCross && <span className="text-[9px] text-zinc-500 font-mono">related topic</span>}
                    </div>
                    <p className="text-xs font-bold text-white leading-snug mb-1.5 line-clamp-2 group-hover:text-white/90">{r.title}</p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 mb-2">{r.desc}</p>
                    <p className="text-[9px] text-zinc-500 font-mono">{r.readMin} min read</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Share + footer nav */}
        <div className="mt-8 pt-6 border-t border-zinc-800 space-y-4">
          {/* Share row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mr-1">Share</span>
            <button onClick={copyPostLink}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-400 hover:text-white transition-all font-mono">
              {linkCopied ? "✓ Copied!" : "Copy link"}
            </button>
            <button onClick={() => window.print()}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-400 hover:text-white transition-all font-mono">
              Print / Save PDF
            </button>
            <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => track("post_shared_twitter", { post: post.id })}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-400 hover:text-white transition-all font-mono">
              𝕏 / Twitter
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => track("post_shared_linkedin", { post: post.id })}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-400 hover:text-white transition-all font-mono">
              LinkedIn
            </a>
          </div>
          {/* Feedback */}
          <FeedbackBar page={`groundtruth/${post.id}`} contentType="gt_post" />

          {/* Back / lab nav */}
          <div className="flex items-center justify-between">
            <button onClick={onBack}
              className="text-xs text-zinc-500 hover:text-white transition-colors font-mono">
              ← Back to Ground Truth
            </button>
            <button
              onClick={() => {
                if (onNavigateTo && post.labModuleId) {
                  onNavigateTo({ tab: post.labLink, moduleId: post.labModuleId });
                } else {
                  onNavigate(post.labLink);
                }
              }}
              className="text-xs font-mono font-bold transition-colors hover:opacity-80"
              style={{ color }}>
              {post.labLabel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const CATEGORIES = [
  { id: "all",         label: "All" },
  { id: "foundations", label: "Foundations" },
  { id: "rag",         label: "RAG" },
  { id: "agents",      label: "Agents" },
  { id: "evaluation",  label: "Evaluation" },
  { id: "llmops",      label: "LLMOps" },
  { id: "production", label: "Production" },
  { id: "safety",      label: "Safety" },
  { id: "sysdesign",   label: "System Design" },
  { id: "failures",    label: "Production Failures" },
  { id: "product",     label: "AI Product" },
  { id: "models",      label: "Model Profiles" },
  { id: "industry",    label: "Industry AI" },
  { id: "career",      label: "Careers & Salaries" },
  { id: "interview",   label: "Interview Prep" },
  { id: "research",    label: "Research Papers" },
  { id: "finetuning",  label: "Fine-Tuning & Training" },
  { id: "multimodal",         label: "Multimodal" },
  { id: "strategy",           label: "Strategy" },
  { id: "retrieval",          label: "Retrieval" },
  { id: "reasoning-inference", label: "Reasoning & Inference" },
  { id: "model-deep-dive",    label: "Model Deep-Dives" },
  { id: "how-i-build",        label: "How I'd Build X" },
  { id: "paper-to-production", label: "Paper → Production" },
  { id: "data-flywheel",      label: "Data Flywheel" },
  { id: "perspectives",       label: "Perspectives" },
  { id: "training-stack",     label: "Training Stack" },
  { id: "mcp-protocol",       label: "MCP Protocol" },
  { id: "frontier",           label: "Frontier Models" },
  { id: "production-mlops",   label: "Production MLOps" },
];

const CAT_COLORS = {
  foundations: "#6366f1",
  rag:         "#3b82f6",
  agents:      "#06b6d4",
  evaluation:  "#22c55e",
  llmops:      "#f59e0b",
  production:  "#f97316",
  safety:      "#ef4444",
  sysdesign:   "#8b5cf6",
  failures:    "#f97316",
  product:     "#10b981",
  models:      "#e879f9",
  industry:    "#0ea5e9",
  career:      "#f59e0b",
  interview:   "#ec4899",
  research:    "#a78bfa",
  finetuning:  "#34d399",
  multimodal:        "#38bdf8",
  strategy:          "#f59e0b",
  retrieval:         "#06b6d4",
  "reasoning-inference": "#8b5cf6",
  "model-deep-dive": "#ec4899",
  "how-i-build":     "#10b981",
  "paper-to-production": "#f97316",
  "data-flywheel":   "#14b8a6",
  perspectives:      "#a78bfa",
  "training-stack":  "#ef4444",
  "mcp-protocol":    "#6366f1",
  frontier:          "#d946ef",
};


const CAT_DIFFICULTY = {
  foundations: "Beginner", rag: "Intermediate", agents: "Intermediate",
  evaluation: "Intermediate", llmops: "Advanced", safety: "Intermediate",
  sysdesign: "Advanced", failures: "Advanced", product: "Beginner",
  models: "Beginner", industry: "Beginner", career: "Beginner",
  interview: "Intermediate", research: "Advanced", finetuning: "Advanced",
  multimodal: "Intermediate", production: "Advanced",
};
const DIFF_COLORS = { Beginner: "text-emerald-400", Intermediate: "text-amber-400", Advanced: "text-red-400" };

// ─── SERIES METADATA ──────────────────────────────────────────────────────────
const SERIES_META = {
  "rag-production": {
    title: "RAG in Production",
    desc: "From basic retrieval to production-grade pipelines — chunking, hybrid search, reranking, two-stage retrieval, Graph RAG, and every failure mode in between.",
    color: "#3b82f6",
    postIds: ["how-rag-works", "why-rag-lies", "graph-rag-multi-hop", "two-stage-retrieval-reranker", "hard-negatives-retrieval", "chunking-strategies", "hybrid-search", "reranking-explained", "rag-architectures", "vector-db-selection-guide"],
  },
  "agent-engineering": {
    title: "Agent Engineering",
    desc: "How to build agents that work in production — ReAct, memory patterns, LangGraph state machines, HITL, multi-agent systems, and the failure taxonomy.",
    color: "#06b6d4",
    postIds: ["react-pattern", "agent-failure-modes", "agent-memory-architecture", "building-reliable-agents", "langgraph-reducers-hitl", "context-isolation-multiagent", "claudemd-as-architecture", "hooks-vs-llm-safety", "tool-use-design", "multi-agent-orchestration"],
  },
  "eval-testing": {
    title: "Evaluation & Testing",
    desc: "How to know if your LLM system is actually good — the eval crisis, LLM-as-judge, RAGAS, prompt regression testing, and A/B testing in production.",
    color: "#22c55e",
    postIds: ["the-eval-crisis", "llm-evaluation-guide", "prompt-regression-testing", "ab-testing-ai-systems", "benchmark-vs-business", "hallucination-detection", "eval-pipeline-design", "ab-testing-llms"],
  },
  "llmops": {
    title: "LLMOps in Production",
    desc: "The full production checklist — observability, prompt CI/CD, model routing, inference optimisation, graceful degradation, and cost management.",
    color: "#f59e0b",
    postIds: ["your-prompt-is-code", "llmops-production-checklist", "graceful-degradation", "monitoring-that-predicts", "model-routing", "inference-optimisation", "llm-observability", "ml-cicd", "context-compaction"],
  },
  "case-studies": {
    title: "Production Case Studies",
    desc: "How Notion, Perplexity, Cursor, GitHub Copilot, and Spotify actually built their AI systems — architecture decisions and lessons learned.",
    color: "#8b5cf6",
    postIds: ["case-notion-ai", "case-perplexity", "case-cursor", "case-github-copilot", "case-spotify-ai"],
  },
  "paper-to-production": {
    title: "Paper → Production",
    desc: "Five landmark AI papers and the engineering gap between what they proposed and what the industry actually ships. Attention, RLHF, RAG, LoRA, and Constitutional AI.",
    color: "#ec4899",
    postIds: ["p2p-attention", "p2p-rlhf", "p2p-rag-paper", "p2p-lora", "p2p-constitutional-ai"],
  },
  "interview-ready": {
    title: "Interview Ready",
    desc: "How to answer the hardest AI system design and technical screen questions — RAG design, attention explanation, evaluation, agents, and cost reduction.",
    color: "#f97316",
    postIds: ["iv-design-rag", "iv-explain-attention", "iv-eval-system", "iv-agents-screen", "iv-cost-reduction"],
  },
  "reasoning-inference": {
    title: "Reasoning at Inference Time",
    desc: "What reasoning models actually do differently, how to control the thinking budget, when they're worth the cost, and production patterns for deploying them at scale.",
    color: "#06b6d4",
    postIds: ["reason-what-changed", "reason-thinking-budget", "reason-when-to-use", "reason-econ", "reason-prod-patterns"],
  },
  "mcp-protocol": {
    title: "Model Context Protocol",
    desc: "Anthropic's open standard for connecting LLMs to tools and data. What MCP is, how to build a server, and when to use MCP vs. function calling.",
    color: "#a855f7",
    postIds: ["mcp-what-is", "mcp-build-server", "mcp-vs-functions"],
  },
  "model-deep-dive": {
    title: "Model Deep Dives",
    desc: "Under the hood of the frontier models — Claude, GPT-4o, Gemini, Grok, and Llama. Architecture, training philosophy, benchmark reality, and when each model is the right choice.",
    color: "#f43f5e",
    postIds: ["model-claude", "model-gpt4o", "model-gemini", "model-grok", "model-llama"],
  },
  "production-mlops": {
    title: "Production ML Ops",
    desc: "DPO vs GRPO alignment, GPTQ/AWQ/GGUF quantization, AI governance, multimodal RAG on real documents, and an end-to-end fine-tuning case study.",
    color: "#84cc16",
    postIds: ["ft-dpo-vs-grpo", "ft-quantization", "ft-governance", "ft-multimodal-rag", "ft-case-study"],
  },
  "perspectives": {
    title: "Perspectives",
    desc: "Annotated reading lists for the AI engineers and researchers shaping how the field thinks. Each entry: who they are, their core thesis, essential resources, and what to question.",
    color: "#06b6d4",
    postIds: ["persp-karpathy","persp-willison","persp-swyx","persp-hamel","persp-chollet","persp-lecun"],
  },
  "how-i-build": {
    title: "How I'd Build X",
    desc: "Opinionated, first-person walkthroughs of production AI systems — architecture decisions, failure modes, and the tradeoffs you actually face when building for real users.",
    color: "#f59e0b",
    postIds: ["build-ai-search","build-code-review-bot","build-customer-support-ai","build-voice-ai","build-document-intelligence","build-coding-assistant"],
  },
  "data-flywheel": {
    title: "The Data Flywheel",
    desc: "How production AI systems improve from their own traffic — implicit feedback collection, reward modeling from logs, and the online evaluation loop that compounds over time.",
    color: "#10b981",
    postIds: ["flywheel-implicit-feedback", "flywheel-reward-modeling", "flywheel-online-eval"],
  },
  "training-stack": {
    title: "The Training Stack",
    desc: "From supervised fine-tuning to RLHF to distillation — how models are shaped after pretraining.",
    color: "#8b5cf6",
    postIds: ["finetune-playbook", "rlhf-production", "dpo-vs-ppo", "knowledge-distillation"],
  },
  "llm-fundamentals": {
    title: "LLM Fundamentals",
    desc: "The mathematical and architectural foundations — why transformers won, how attention works, what entropy and loss actually measure, and the reversal curse.",
    color: "#a855f7",
    postIds: ["why-transformers-won", "how-surprised-is-the-model", "what-happens-during-pretraining", "the-reversal-curse", "what-is-a-transformer", "self-attention-deep-dive"],
  },
  "career-strategy": {
    title: "Career & Strategy",
    desc: "The market forces reshaping AI roles — the DS→AI engineer arc, Type A vs Type B engineers, the Forward Deployed Engineer, and the three-layer skill stack.",
    color: "#22c55e",
    postIds: ["type-a-vs-type-b-engineers", "ds-to-ai-engineer", "forward-deployed-engineer", "three-layer-de-skill-stack", "ai-engineer-role", "breaking-into-ai"],
  },
};

export default function GroundTruth({ onNavigate, onNavigateTo, initialPostId, onPostOpened }) {
  const [filter, setFilter] = useState("all");
  const [viewLens, setViewLens] = useState(null); // null | "revise" | "learn" | "next"
  const [openPost, setOpenPost] = useState(null);
  const [recentIds, setRecentIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("genai_gt_recent") || "[]"); } catch { return []; }
  });
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("genai_gt_read") || "[]")); } catch { return new Set(); }
  });
  function toggleRead(postId, e) {
    e.stopPropagation();
    const next = new Set(readIds);
    if (next.has(postId)) next.delete(postId); else next.add(postId);
    setReadIds(next);
    try { localStorage.setItem("genai_gt_read", JSON.stringify([...next])); } catch {}
  }


  const [helpfulCounts, setHelpfulCounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("genai_gt_helpful") || "{}"); } catch { return {}; }
  });
  function markHelpful(postId, e) {
    e.stopPropagation();
    if (helpfulCounts[postId]) return; // already voted
    const next = { ...helpfulCounts, [postId]: (helpfulCounts[postId] || 0) + 1 };
    setHelpfulCounts(next);
    try { localStorage.setItem("genai_gt_helpful", JSON.stringify(next)); } catch {}
  }

  // Feature 3 — Reactions (persisted in parent so they survive PostDetail unmount)
  const [reactions, setReactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("genai_reactions") || "{}"); } catch { return {}; }
  });
  function toggleReaction(postId, reactionId) {
    setReactions(prev => {
      const postReactions = new Set(prev[postId] || []);
      if (postReactions.has(reactionId)) postReactions.delete(reactionId);
      else postReactions.add(reactionId);
      const next = { ...prev, [postId]: [...postReactions] };
      try { localStorage.setItem("genai_reactions", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  useEffect(() => { track("ground_truth_viewed", {}); }, []);

  // Track individual post reads — one key per post, used by GT State-Aware Reading Mode
  useEffect(() => {
    if (!openPost) return;
    try { localStorage.setItem("gsl-gt-read-" + openPost.id, "1"); } catch {}
  }, [openPost]);

  // Deep-link from search: open the post matching initialPostId
  useEffect(() => {
    if (!initialPostId) return;
    const post = POSTS.find(p => p.id === initialPostId);
    if (post) {
      const updated = [post.id, ...recentIds.filter(id => id !== post.id)].slice(0, 5);
      setRecentIds(updated);
      try { localStorage.setItem("genai_gt_recent", JSON.stringify(updated)); } catch {}
      setOpenPost(post); onPostOpened?.();
    }
  }, [initialPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (openPost) {
    return <PostDetail post={openPost} onBack={() => setOpenPost(null)} onOpenPost={setOpenPost} onNavigate={onNavigate} onNavigateTo={onNavigateTo} activeReactions={reactions[openPost.id]} onReact={(id) => toggleReaction(openPost.id, id)} />;
  }

  // "Start Here" pinned posts — shown above the category filter regardless of active filter
  const PINNED_IDS = ["what-is-a-transformer", "how-rag-works", "react-pattern", "agent-failure-modes"];

  // Only show posts that have written content
  const WRITTEN = POSTS.filter(p => !!POST_CONTENT[p.id]);

  // ── Reading lenses — powered by existing localStorage signals ──────────────
  const TOPIC_CAT_MAP = {
    rag: ["rag", "retrieval"], agents: ["agents"], evals: ["evaluation"],
    mlops: ["llmops", "production", "production-mlops"], fine_tuning: ["finetuning", "training-stack"],
    safety: ["safety"],
  };
  function topicFromQid(qid) {
    if (/^(rag|reranker|graph-rag|hyde|litm|parent|cos|hard-neg)/.test(qid)) return "rag";
    if (/^(agent|langgraph|multiagent|ase)/.test(qid)) return "agents";
    if (/^(eval|ragas|judge|bench|ab-test)/.test(qid)) return "evals";
    if (/^(ft-|sft-|dpo|lora|finetune|instruct)/.test(qid)) return "fine_tuning";
    if (/^(mlops|serving|latency|pcm|kv)/.test(qid)) return "mlops";
    if (/^(safe|guard|inject|red)/.test(qid)) return "safety";
    return null;
  }

  const lensFiltered = useMemo(() => {
    if (!viewLens) return null;
    if (viewLens === "revise") {
      try {
        const hist = JSON.parse(localStorage.getItem("gsl-preplab-history") || "{}");
        if (Object.keys(hist).length === 0) return []; // no history yet — empty state
        const topicStats = {};
        Object.entries(hist).forEach(([qid, data]) => {
          const t = topicFromQid(qid);
          if (!t) return;
          if (!topicStats[t]) topicStats[t] = { wrong: 0, attempts: 0 };
          topicStats[t].attempts += (data.attempts || 1);
          topicStats[t].wrong += (data.wrong || 0);
        });
        // Sort topics by miss rate descending; keep those with wrong/attempts > 0.4
        const weakTopics = Object.entries(topicStats)
          .filter(([, s]) => s.attempts > 0 && s.wrong / s.attempts > 0.4)
          .sort(([, a], [, b]) => (b.wrong / b.attempts) - (a.wrong / a.attempts))
          .map(([t]) => t);
        if (weakTopics.length === 0) return []; // all strong — empty state
        // Build ordered list: posts in most-missed topic first, up to 12
        const result = [];
        const seen = new Set();
        for (const t of weakTopics) {
          const cats = TOPIC_CAT_MAP[t] || [];
          const posts = WRITTEN.filter(p => cats.some(c => p.category === c || (p.tags || []).some(tg => tg.toLowerCase().includes(c))));
          for (const p of posts) {
            if (!seen.has(p.id)) { seen.add(p.id); result.push(p); }
            if (result.length >= 12) break;
          }
          if (result.length >= 12) break;
        }
        return result;
      } catch { return []; }
    }
    if (viewLens === "next") {
      try {
        const openedIds = new Set(
          Object.keys(localStorage).filter(k => k.startsWith("gsl-gt-read-")).map(k => k.slice("gsl-gt-read-".length))
        );
        const visited = JSON.parse(localStorage.getItem("genai_visited_modules") || "[]");
        const TAB_CAT = { lab: ["rag", "retrieval"], agentlab: ["agents"], evallab: ["evaluation"], llmlab: ["llmops", "production-mlops"], systems: ["production", "sysdesign"] };
        const visitedCats = new Set(visited.flatMap(t => TAB_CAT[t] || []).filter(Boolean));
        const unread = WRITTEN.filter(p => !openedIds.has(p.id));
        if (visitedCats.size > 0) {
          // Prefer unread posts in visited categories
          const prioritised = unread.filter(p => visitedCats.has(p.category));
          const remainder = unread.filter(p => !visitedCats.has(p.category));
          const combined = [...prioritised, ...remainder].slice(0, 15);
          return combined.length > 0 ? combined : unread.slice(0, 15);
        }
        // No visited modules yet — newest unread (WRITTEN is ordered newest-first by index position)
        return unread.slice(0, 15);
      } catch { return []; }
    }
    return null;
  }, [viewLens]); // eslint-disable-line react-hooks/exhaustive-deps

  // lensFiltered === [] means "has history but no weak spots / no unread" (empty state)
  // lensFiltered === null means lens is off (show all)
  const lensIsEmpty = Array.isArray(lensFiltered) && lensFiltered.length === 0;
  const base = (lensFiltered && lensFiltered.length > 0) ? lensFiltered : WRITTEN;
  const visible = (lensFiltered !== null && !lensIsEmpty)
    ? (filter === "all" ? lensFiltered : lensFiltered.filter(p => p.category === filter))
    : (filter === "all" ? WRITTEN : WRITTEN.filter(p => p.category === filter));
  const total = WRITTEN.length;
  const totalPlanned = POSTS.length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
            Read it. Then break it on the platform.
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ background: "linear-gradient(90deg, #ffffff 0%, #c4b5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ground Truth</h1>
          <p className="text-[15px] text-zinc-400 leading-relaxed max-w-xl">
            Production-depth writing on RAG, agents, evaluation, LLMOps, safety, and system design.
            Every piece links to the lab module where you test what you just read.
          </p>
        </div>

        {/* Progress banner */}
        <div className="rounded-xl border border-violet-900/50 bg-violet-950/20 px-4 py-3 mb-8 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
          <p className="text-sm text-violet-300">
            <span className="font-bold">{total} pieces live.</span>
            {totalPlanned - total > 0 && (
              <span className="text-violet-400"> {totalPlanned - total} more in the writing queue — check back soon.</span>
            )}
          </p>
        </div>

        {/* Reading lens selector — only shown when filter is "all" */}
        {filter === "all" && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Reading mode</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: null,     label: "All" },
                { id: "revise", label: "Revise weak spots" },
                { id: "next",   label: "What's next" },
              ].map(lens => (
                <button key={String(lens.id)} onClick={() => { setViewLens(lens.id); }}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={viewLens === lens.id ? {
                    background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff",
                  } : {
                    background: "rgba(39,39,42,0.5)", border: "1px solid rgba(63,63,70,0.5)", color: "#a1a1aa",
                  }}>
                  {lens.label}
                </button>
              ))}
            </div>
            {viewLens && !lensIsEmpty && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">
                  {viewLens === "revise" && "Posts in topics where your PrepLab score is weak — study these to close the gaps."}
                  {viewLens === "next" && "Unread posts in the areas you've been working on."}
                </span>
                <span className="text-[10px] font-mono text-zinc-600">· {lensFiltered.length} posts</span>
              </div>
            )}
            {viewLens === "revise" && lensIsEmpty && (
              <p className="mt-3 text-xs text-zinc-500">Complete a PrepLab session to see personalized suggestions.</p>
            )}
            {viewLens === "next" && lensIsEmpty && (
              <p className="mt-3 text-xs text-zinc-500">Open some posts to track your progress.</p>
            )}
          </div>
        )}

        {/* Series cards */}
        {filter === "all" && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Reading Series</span>
              <span className="text-[10px] text-zinc-500">{Object.keys(SERIES_META).length} series · structured paths through the posts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(SERIES_META).map(([sid, s]) => {
                const firstPostId = s.postIds[0];
                const firstPost = POSTS.find(p => p.id === firstPostId);
                const writtenCount = s.postIds.filter(id => !!POST_CONTENT[id]).length;
                if (writtenCount === 0) return null;
                return (
                  <button key={sid}
                    onClick={() => { if (firstPost && POST_CONTENT[firstPost.id]) { setOpenPost(firstPost); } }}
                    className="text-left rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-150 group relative overflow-hidden"
                    style={{ background: `linear-gradient(160deg, ${s.color}0d 0%, rgba(15,15,17,0.97) 100%)`, border: `1px solid ${s.color}25`, borderTop: `2px solid ${s.color}55`, boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${s.color}aa, transparent)` }} />
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-black text-white group-hover:opacity-90">{s.title}</span>
                      <span className="text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded" style={{ color: s.color, background: s.color + "18" }}>{writtenCount} posts</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{s.desc}</p>
                    {firstPost && (
                      <div className="text-[10px] font-mono" style={{ color: s.color + "cc" }}>
                        Start: {firstPost.title.length > 50 ? firstPost.title.slice(0, 50) + "…" : firstPost.title} →
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pinned "Start Here" posts */}
        {filter === "all" && (() => {
          const pinned = PINNED_IDS.map(id => WRITTEN.find(p => p.id === id)).filter(Boolean);
          if (pinned.length === 0) return null;
          return (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest">Start here</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pinned.map(post => {
                  const color = CAT_COLORS[post.category] || "#6366f1";
                  return (
                    <button key={post.id}
                      onClick={() => {
                        track("ground_truth_pinned_clicked", { post: post.id });
                        const updated = [post.id, ...recentIds.filter(id => id !== post.id)].slice(0, 5);
                        setRecentIds(updated);
                        try { localStorage.setItem("genai_gt_recent", JSON.stringify(updated)); } catch {}
                        setOpenPost(post);
                      }}
                      className="text-left rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-150 relative overflow-hidden"
                      style={{ background: "linear-gradient(160deg, rgba(139,92,246,0.10) 0%, rgba(15,15,17,0.95) 100%)", border: "1px solid rgba(139,92,246,0.2)", borderTop: `2px solid ${color}88`, boxShadow: "0 4px 16px rgba(0,0,0,0.35)" }}>
                      <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1.5" style={{ color }}>{post.readMin} min · {post.category}</div>
                      <p className="text-sm font-bold text-white leading-snug mb-1.5">{post.title}</p>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{post.desc}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 mb-2 flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">All posts</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
            </div>
          );
        })()}

        {/* Continue reading */}
        {recentIds.length > 0 && filter === "all" && (() => {
          const recentPosts = recentIds.map(id => WRITTEN.find(p => p.id === id)).filter(Boolean);
          if (!recentPosts.length) return null;
          return (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Continue reading</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {recentPosts.map(p => {
                  const color = CAT_COLORS[p.category] || "#6366f1";
                  return (
                    <button key={p.id} onClick={() => {
                        const updated = [p.id, ...recentIds.filter(id => id !== p.id)].slice(0, 5);
                        setRecentIds(updated);
                        try { localStorage.setItem("genai_gt_recent", JSON.stringify(updated)); } catch {}
                        setOpenPost(p);
                      }}
                      className="shrink-0 text-left rounded-lg px-3 py-2 transition-all duration-150 hover:-translate-y-0.5 max-w-[200px]"
                      style={{ background: `linear-gradient(135deg, ${color}12 0%, rgba(15,15,17,0.97) 100%)`, border: `1px solid ${color}28`, borderTop: `1px solid ${color}45` }}>
                      <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color }}>{p.category}</div>
                      <div className="text-xs text-white leading-snug line-clamp-2">{p.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Category filter — scrolls horizontally on mobile */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
          {CATEGORIES.map(c => {
            const count = c.id === "all" ? WRITTEN.length : WRITTEN.filter(p => p.category === c.id).length;
            if (count === 0) return null;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className="shrink-0 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-150"
                style={filter === c.id ? {
                  background: "linear-gradient(90deg, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0.10) 100%)",
                  boxShadow: "inset 2px 0 0 #8b5cf6",
                  color: "#e9d5ff",
                  border: "1px solid rgba(139,92,246,0.25)",
                } : {
                  background: "rgba(39,39,42,0.6)",
                  color: "#a1a1aa",
                  border: "1px solid rgba(63,63,70,0.6)",
                }}>
                {c.label}
                <span className="ml-1.5 text-[9px] opacity-50">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Post grid */}
        {lensIsEmpty ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-10 text-center">
            <p className="text-sm text-zinc-400 mb-1">
              {viewLens === "revise" ? "Complete a PrepLab session to see personalized suggestions." : "Open some posts to track your progress."}
            </p>
            <button onClick={() => setViewLens(null)} className="mt-3 text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors">
              Show all posts →
            </button>
          </div>
        ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(post => {
            const color = CAT_COLORS[post.category] || "#6366f1";
            const catLabel = CATEGORIES.find(c => c.id === post.category)?.label || post.category;
            const hasContent = !!POST_CONTENT[post.id];
            return (
              <div
                key={post.id}
                onClick={() => {
                  track("ground_truth_card_clicked", { post: post.id });
                  const updated = [post.id, ...recentIds.filter(id => id !== post.id)].slice(0, 5);
                  setRecentIds(updated);
                  try { localStorage.setItem("genai_gt_recent", JSON.stringify(updated)); } catch {}
                  setOpenPost(post);
                }}
                className="rounded-xl flex flex-col gap-3 relative overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  padding: "16px",
                  background: hasContent ? "linear-gradient(160deg, rgba(39,39,42,0.6) 0%, rgba(15,15,17,0.95) 100%)" : "rgba(15,15,17,0.6)",
                  border: `1px solid ${hasContent ? "rgba(63,63,70,0.9)" : "rgba(39,39,42,0.8)"}`,
                  borderTop: `2px solid ${color}${hasContent ? "55" : "22"}`,
                  boxShadow: hasContent ? "0 2px 12px rgba(0,0,0,0.3)" : "none",
                }}>

                {/* Top accent line — hidden, replaced by borderTop above */}

                {/* Category + read time + difficulty */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ color, background: color + "22", border: `1px solid ${color}44` }}>
                    {catLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${DIFF_COLORS[CAT_DIFFICULTY[post.category]] || "text-zinc-500"}`}>
                      {CAT_DIFFICULTY[post.category] || ""}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">{post.readMin} min</span>
                  </div>
                </div>

                {/* Title + desc */}
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white leading-snug mb-1.5">{post.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{post.desc}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[8px] font-mono text-zinc-500 bg-zinc-800/60 border border-zinc-800 rounded px-1.5 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTA row */}
                <div className="flex items-center justify-between border-t border-zinc-800 pt-2.5 mt-auto">
                  <div className="flex items-center gap-2">
                    {hasContent
                      ? <span className="text-[10px] font-mono font-bold" style={{ color }}>Read →</span>
                      : <span className="text-[10px] text-zinc-500 font-mono italic">Coming soon</span>
                    }
                    {readIds.has(post.id) && (
                      <button
                        onClick={e => toggleRead(post.id, e)}
                        title="Mark as unread"
                        className="text-[9px] font-mono text-emerald-500 bg-emerald-950/30 border border-emerald-800/40 rounded px-1.5 py-0.5 hover:bg-emerald-950/60 transition-all">
                        ✓ Read
                      </button>
                    )}
                    {!readIds.has(post.id) && hasContent && (
                      <button
                        onClick={e => toggleRead(post.id, e)}
                        title="Mark as read"
                        className="text-[9px] font-mono text-zinc-500 hover:text-zinc-500 transition-colors">
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => markHelpful(post.id, e)}
                      className={`text-[10px] flex items-center gap-1 transition-all ${helpfulCounts[post.id] ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-400"}`}>
                      👍 {helpfulCounts[post.id] ? "Helpful" : "Mark helpful"}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        track("ground_truth_lab_link", { post: post.id, lab: post.labLink, module: post.labModuleId });
                        if (onNavigateTo && post.labModuleId) {
                          onNavigateTo({ tab: post.labLink, moduleId: post.labModuleId });
                        } else {
                          onNavigate(post.labLink);
                        }
                      }}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-400 transition-colors">
                      {post.labLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center space-y-1">
          <p className="text-xs text-zinc-500 font-mono">{total} pieces live{totalPlanned - total > 0 ? ` · ${totalPlanned - total} more coming` : ""} · every piece links to an interactive module</p>
          <button onClick={() => onNavigate("home")}
            className="text-xs text-zinc-500 hover:text-white transition-colors font-mono underline">
            ← Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
