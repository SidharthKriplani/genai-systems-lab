import { useState, useEffect, useRef } from "react";
import { track } from "./analytics";
import { POST_CONTENT } from "./groundTruthPosts";
import { POSTS } from "./groundTruthIndex";
import TransformerWalkthrough from "./TransformerWalkthrough";
import SalaryCalculator from "./SalaryCalculator";

// Every post maps to at least one interactive module on the platform.
// "labLink" is where the reader goes to test what they just read.

// ─── POST DETAIL RENDERER ────────────────────────────────────────────────────
function Block({ b, onNavigate, color }) {
  switch (b.t) {
    case "p":
      return <p className="text-sm text-zinc-300 leading-relaxed">{b.text}</p>;
    case "h2":
      return <h2 className="text-base font-black text-white mt-8 mb-1">{b.text}</h2>;
    case "h3":
      return <h3 className="text-sm font-bold text-zinc-200 mt-5 mb-1">{b.text}</h3>;
    case "divider":
      return <hr className="border-zinc-800 my-6" />;
    case "list":
      return (
        <ul className="space-y-1.5 pl-1">
          {b.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-relaxed">
              <span className="text-zinc-600 shrink-0 mt-1">—</span>
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
          <p className={`text-xs leading-relaxed ${s.text}`}>{b.text}</p>
        </div>
      );
    }
    case "code":
      return (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          {b.label && (
            <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono text-zinc-500">{b.label}</div>
          )}
          <pre className="px-4 py-3 overflow-x-auto bg-zinc-950">
            <code className="text-[11px] font-mono text-zinc-300 whitespace-pre">{b.text}</code>
          </pre>
        </div>
      );
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
    case "video":
      return (
        <div className="rounded-xl overflow-hidden border border-zinc-800">
          <div className="aspect-video w-full bg-zinc-900">
            <iframe
              src={`https://www.youtube.com/embed/${b.youtubeId}`}
              title={b.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          {(b.title || b.desc) && (
            <div className="px-4 py-3 bg-zinc-900/60 border-t border-zinc-800">
              {b.title && <p className="text-xs font-bold text-zinc-300 mb-0.5">{b.title}</p>}
              {b.desc  && <p className="text-[11px] text-zinc-500">{b.desc}</p>}
            </div>
          )}
        </div>
      );
    case "animation":
      if (b.name === "transformer") return <TransformerWalkthrough />;
      if (b.name === "salary-calc") return <SalaryCalculator />;
      return null;
    case "quote":
      return (
        <blockquote className="border-l-2 border-zinc-600 pl-4 py-1 my-2">
          <p className="text-sm text-zinc-400 italic leading-relaxed">"{b.text}"</p>
          {b.attribution && <p className="text-[11px] text-zinc-600 font-mono mt-1.5">— {b.attribution}</p>}
        </blockquote>
      );
    case "references":
      return (
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">References &amp; Further Reading</p>
          <ul className="space-y-2">
            {b.items.map((ref, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-zinc-700 font-mono text-[11px] shrink-0 mt-0.5">[{i+1}]</span>
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
    default:
      return null;
  }
}

function PostDetail({ post, onBack, onOpenPost, onNavigate }) {
  const content = POST_CONTENT[post.id];
  const color = CAT_COLORS[post.category] || "#6366f1";
  const catLabel = CATEGORIES.find(c => c.id === post.category)?.label || post.category;
  const [scrollPct, setScrollPct] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const articleRef = useRef(null);

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

  // Related posts — same category, excluding current, max 3
  const related = POSTS.filter(p => p.id !== post.id && p.category === post.category && !!POST_CONTENT[p.id]).slice(0, 3);

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
    <div className="min-h-screen bg-zinc-950" ref={articleRef}>
      {/* Reading progress bar — fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-zinc-900">
        <div className="h-full transition-all duration-75 ease-out"
          style={{ width: `${scrollPct}%`, background: color }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Back */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors font-mono mb-6 sm:mb-8">
          ← Ground Truth
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{ color, background: color + "22", border: `1px solid ${color}44` }}>
              {catLabel}
            </span>
            <span className="text-[9px] text-zinc-600 font-mono">{post.readMin} min read</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white leading-tight mb-3">{post.title}</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">{post.desc}</p>
        </div>

        {/* Content or coming soon */}
        {content ? (
          <div className="space-y-4">
            {content.map((b, i) => (
              <Block key={i} b={b} onNavigate={onNavigate} color={color} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <div className="text-3xl mb-3">✍️</div>
            <p className="text-sm font-bold text-white mb-1">Writing in progress</p>
            <p className="text-xs text-zinc-500 mb-4">This piece is planned — check back soon.</p>
            <button
              onClick={() => onNavigate(post.labLink)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
              style={{ background: color }}>
              {post.labLabel}
            </button>
          </div>
        )}

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Read next</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {related.map(r => {
                const rc = CAT_COLORS[r.category] || "#6366f1";
                return (
                  <button key={r.id}
                    onClick={() => { track("related_post_clicked", { from: post.id, to: r.id }); onOpenPost(r); window.scrollTo(0, 0); }}
                    className="text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 hover:border-zinc-600 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, ${rc}99, transparent)` }} />
                    <p className="text-xs font-bold text-white leading-snug mb-1 line-clamp-2">{r.title}</p>
                    <p className="text-[10px] text-zinc-600 font-mono">{r.readMin} min read</p>
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
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mr-1">Share</span>
            <button onClick={copyPostLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-400 hover:text-white transition-all font-mono">
              {linkCopied ? "✓ Copied!" : "Copy link"}
            </button>
            <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => track("post_shared_twitter", { post: post.id })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-400 hover:text-white transition-all font-mono">
              𝕏 / Twitter
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => track("post_shared_linkedin", { post: post.id })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-400 hover:text-white transition-all font-mono">
              LinkedIn
            </a>
          </div>
          {/* Back / lab nav */}
          <div className="flex items-center justify-between">
            <button onClick={onBack}
              className="text-xs text-zinc-500 hover:text-white transition-colors font-mono">
              ← Back to Ground Truth
            </button>
            <button
              onClick={() => onNavigate(post.labLink)}
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
];

const CAT_COLORS = {
  foundations: "#6366f1",
  rag:         "#3b82f6",
  agents:      "#06b6d4",
  evaluation:  "#22c55e",
  llmops:      "#f59e0b",
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
};


export default function GroundTruth({ onNavigate, initialPostId, onPostOpened }) {
  const [filter, setFilter] = useState("all");
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => { track("ground_truth_viewed", {}); }, []);

  // Deep-link from search: open the post matching initialPostId
  useEffect(() => {
    if (!initialPostId) return;
    const post = POSTS.find(p => p.id === initialPostId);
    if (post) { setOpenPost(post); onPostOpened?.(); }
  }, [initialPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (openPost) {
    return <PostDetail post={openPost} onBack={() => setOpenPost(null)} onOpenPost={setOpenPost} onNavigate={onNavigate} />;
  }

  // "Start Here" pinned posts — shown above the category filter regardless of active filter
  const PINNED_IDS = ["what-is-a-transformer", "how-rag-works", "react-pattern", "agent-failure-modes"];

  // Only show posts that have written content
  const WRITTEN = POSTS.filter(p => !!POST_CONTENT[p.id]);
  const visible = filter === "all" ? WRITTEN : WRITTEN.filter(p => p.category === filter);
  const total = WRITTEN.length;
  const totalPlanned = POSTS.length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mb-2">
            Read it. Then break it on the platform.
          </p>
          <h1 className="text-2xl font-black text-white mb-2">Ground Truth</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
            Production-depth writing on RAG, agents, evaluation, LLMOps, safety, and system design.
            Every piece links directly to the lab module where you test what you just read.
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
                      onClick={() => { track("ground_truth_pinned_clicked", { post: post.id }); setOpenPost(post); }}
                      className="text-left rounded-xl border border-violet-800/40 bg-violet-950/10 p-3.5 hover:border-violet-600/60 transition-all relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, ${color}99, transparent)` }} />
                      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">{post.readMin} min</div>
                      <p className="text-xs font-bold text-white leading-snug mb-1">{post.title}</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{post.desc}</p>
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

        {/* Category filter — scrolls horizontally on mobile */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
          {CATEGORIES.map(c => {
            const count = c.id === "all" ? WRITTEN.length : WRITTEN.filter(p => p.category === c.id).length;
            if (count === 0) return null;
            return (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filter === c.id
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                }`}>
                {c.label}
                <span className="ml-1.5 text-[9px] opacity-50">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Post grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(post => {
            const color = CAT_COLORS[post.category] || "#6366f1";
            const catLabel = CATEGORIES.find(c => c.id === post.category)?.label || post.category;
            const hasContent = !!POST_CONTENT[post.id];
            return (
              <div
                key={post.id}
                onClick={() => { track("ground_truth_card_clicked", { post: post.id }); setOpenPost(post); }}
                className={`rounded-xl border p-4 flex flex-col gap-3 relative overflow-hidden cursor-pointer transition-all hover:border-zinc-600 ${hasContent ? "border-zinc-700 bg-zinc-900/50" : "border-zinc-800 bg-zinc-900/30"}`}>

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${color}99, transparent)` }} />

                {/* Category + read time */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ color, background: color + "22", border: `1px solid ${color}44` }}>
                    {catLabel}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono">{post.readMin} min</span>
                </div>

                {/* Title + desc */}
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-white leading-snug mb-1.5">{post.title}</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{post.desc}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[8px] font-mono text-zinc-700 bg-zinc-800/60 border border-zinc-800 rounded px-1.5 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTA row */}
                <div className="flex items-center justify-between border-t border-zinc-800 pt-2.5 mt-auto">
                  {hasContent
                    ? <span className="text-[10px] font-mono font-bold" style={{ color }}>Read →</span>
                    : <span className="text-[10px] text-zinc-600 font-mono italic">Coming soon</span>
                  }
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      track("ground_truth_lab_link", { post: post.id, lab: post.labLink });
                      onNavigate(post.labLink);
                    }}
                    className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors">
                    {post.labLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center space-y-1">
          <p className="text-xs text-zinc-600 font-mono">{total} pieces live{totalPlanned - total > 0 ? ` · ${totalPlanned - total} more coming` : ""} · every piece links to an interactive module</p>
          <button onClick={() => onNavigate("home")}
            className="text-xs text-zinc-500 hover:text-white transition-colors font-mono underline">
            ← Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
