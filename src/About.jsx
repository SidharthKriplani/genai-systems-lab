// src/About.jsx — What GSL is, who it's for, how to use it, and the community link.
// Dark theme, GSL CSS vars (--surface, --border, --gal-build). Additive tab.

const COMMUNITY_URL = 'https://chat.whatsapp.com/JbIaqV87fwh8Ym3ufH5CFx?mode=gi_t';

const SIBLINGS = [
  { name: 'ML Systems Lab', url: 'https://ml-systems-lab.vercel.app', desc: 'Classical ML, deep learning, and ML system design.' },
  { name: 'Product Analytics Lab', url: 'https://product-analytics-lab.vercel.app', desc: 'SQL, product sense, experimentation, and metrics.' },
  { name: 'Programming Lab', url: 'https://programming-lab.vercel.app', desc: 'SWE-for-data fluency — predict the output, keep the reflex.' },
];

const FRAMES = [
  { k: 'KNOW', c: '#6366f1', d: 'Foundations gyms + Ground Truth — the recall and depth you need on training, fine-tuning, prompting, retrieval, evaluation, and serving.' },
  { k: 'DO',   c: '#22c55e', d: 'Playground — hands-on with prompts, retrieval, and agent loops so the fluency is real, not just read.' },
  { k: 'BUILD', c: 'var(--gal-build)', d: 'Workshop — own a GenAI system end to end, the way a real applied-AI role expects.' },
  { k: 'JUDGE', c: '#f59e0b', d: 'Agent Lab, Systems, and AI Product — the tradeoff calls and judgment that separate senior from staff.' },
  { k: 'PREP & ASSESS', c: '#8b5cf6', d: 'PrepLab, Interview Room, and Company Tracks — rehearse interview questions and follow curated company × role prep paths.' },
];

const DOMAINS = [
  { k: 'Retrieval', d: 'RAG, context construction, and hallucination control.' },
  { k: 'Agents', d: 'Tool use, orchestration, and multi-step reasoning.' },
  { k: 'Evaluation', d: 'Testing, monitoring, and building evals that catch regressions.' },
  { k: 'Production', d: 'Serving, LLMOps, latency, and cost.' },
];

export default function About({ onNavigate }) {
  const go = (v) => { if (onNavigate) onNavigate(v); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <h1 className="text-2xl font-black tracking-tight mb-2">GenAI Systems Lab</h1>
      <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-2, #a1a1aa)' }}>
        A focused interview gym for <strong>Applied AI / GenAI Engineer</strong> roles — the LLM, RAG, agents, and
        production-systems work that senior and staff loops actually test. It's organised around the four ways
        interviews assess you — <strong>KNOW</strong>, <strong>DO</strong>, <strong>BUILD</strong>, and{' '}
        <strong>JUDGE</strong> — plus a <strong>PREP &amp; ASSESS</strong> layer to rehearse and a readiness signal
        to tell you where you stand.
      </p>

      {/* Community */}
      <div className="rounded-xl p-5 mb-9" style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--gal-build)' }}>Join the community</div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-2, #a1a1aa)' }}>
          Prep is better with people. Ask questions, share interview experiences, and get help from others going
          through the same GenAI loops.
        </p>
        <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2.5 transition-opacity hover:opacity-90"
          style={{ background: 'var(--gal-build)', color: '#000' }}>
          Join the WhatsApp community →
        </a>
      </div>

      {/* Who it's for */}
      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>Who it's for</h2>
      <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-2, #a1a1aa)' }}>
        Engineers preparing for Applied AI Engineer, LLM Engineer, or GenAI-focused ML roles — from senior toward
        staff. If your loop covers RAG design, agent architectures, evaluation strategy, and production LLM
        tradeoffs, this is built for you.
      </p>

      {/* Frames */}
      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>The four frames + prep</h2>
      <div className="space-y-2 mb-8">
        {FRAMES.map(f => (
          <div key={f.k} className="rounded-lg p-3.5" style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
            <div className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: f.c }}>{f.k}</div>
            <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2, #a1a1aa)' }}>{f.d}</div>
          </div>
        ))}
      </div>

      {/* Domains */}
      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>Challenge domains</h2>
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-2, #a1a1aa)' }}>
        A second lens over the same material — cut by the systems you'll be asked to design:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
        {DOMAINS.map(d => (
          <div key={d.k} className="rounded-lg p-3.5" style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
            <div className="text-[13px] font-bold text-white mb-0.5">{d.k}</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text-3, #71717a)' }}>{d.d}</div>
          </div>
        ))}
      </div>

      {/* How to start */}
      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>How to get started</h2>
      <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-2, #a1a1aa)' }}>
        Open{' '}
        <button onClick={() => go('foundations')} className="underline underline-offset-2 hover:text-white" style={{ color: 'var(--text-1, #e4e4e7)' }}>Foundations</button>{' '}
        to build recall, jump into a{' '}
        <button onClick={() => go('retrieval')} className="underline underline-offset-2 hover:text-white" style={{ color: 'var(--text-1, #e4e4e7)' }}>challenge domain</button>{' '}
        to work through real design problems, then use{' '}
        <button onClick={() => go('preplab')} className="underline underline-offset-2 hover:text-white" style={{ color: 'var(--text-1, #e4e4e7)' }}>PrepLab</button>{' '}
        and{' '}
        <button onClick={() => go('company-tracks')} className="underline underline-offset-2 hover:text-white" style={{ color: 'var(--text-1, #e4e4e7)' }}>Company Tracks</button>{' '}
        to rehearse for a specific loop.{' '}
        <button onClick={() => go('progress')} className="underline underline-offset-2 hover:text-white" style={{ color: 'var(--text-1, #e4e4e7)' }}>Progress</button>{' '}
        tracks your readiness and points you at your weakest area.
      </p>

      {/* Siblings */}
      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>Part of BreakLabs</h2>
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-2, #a1a1aa)' }}>
        GenAI Systems Lab is one of a family of interview-prep labs. Each owns a domain and links out to the others:
      </p>
      <div className="space-y-2">
        {SIBLINGS.map(l => (
          <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer"
            className="block rounded-lg p-3.5 transition-colors hover:border-zinc-600"
            style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
            <div className="text-sm font-bold text-white">{l.name} ↗</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-3, #71717a)' }}>{l.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
