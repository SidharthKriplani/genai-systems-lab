import { Icon } from './Icon.jsx';

// ── Start Here — pure orientation: how to use GenAI Systems Lab.
//    The recommended path, what each surface is for, and how progress/Review/Tracks/tiers work.
//    Dark theme, GSL CSS vars (--gal-build, --surface, --border). No mission, no marketing — that's About's job.

// The recommended path — the loop most people should run.
const PATH = [
  {
    n: 1, title: 'Build recall in Foundations', nav: 'foundations',
    body: 'Fourteen topic gyms of interactive modules — Language Models, Retrieval, Agents, Evaluation, Production, and more. Work the gyms behind whatever loop you\'re prepping for until the fundamentals are cold.',
  },
  {
    n: 2, title: 'Practice questions in the Question Bank', nav: 'preplab',
    body: 'Run the L0 → L1 → L2 depth ladder: L0 to define it, L1 to reason inside one concept, L2 to make cross-concept tradeoff calls. Start where you\'re shaky and climb.',
  },
  {
    n: 3, title: 'Reason out loud in Speaking & Mock', nav: 'fluency',
    body: 'Knowing the answer and saying it well are different skills. Talk answers out loud, then run a mock interview to rehearse the delivery under time.',
  },
  {
    n: 4, title: 'Pressure-test judgment in the Judgment Exam', nav: 'preplab',
    body: 'The L2 tier under exam conditions — tradeoff calls with real constraints and incomplete information. This is the part senior and staff loops actually turn on.',
  },
  {
    n: 5, title: 'Target a specific loop with Company Tracks', nav: 'company-tracks',
    body: 'Per-company × role × level prep, with that company\'s question slice and interview intel inline. Point your last stretch of prep at the exact interview you\'re walking into.',
  },
];

// What each surface is for — one-liners mapping the nav to its job.
// nav = internal view id; href = external sibling lab (opens in a new tab).
const SURFACES = [
  { group: 'Learn', items: [
    { name: 'Foundations', nav: 'foundations', desc: 'Fourteen interactive gyms that build recall and depth.' },
    { name: 'Ground Truth', nav: 'groundtruth', desc: 'Deep-dive posts on the harder, systems-level topics.' },
  ]},
  { group: 'Code', items: [
    { name: 'Coding Dojo', nav: 'codelabs', desc: 'Staged coding builds — retrieval, agents, eval harnesses.' },
    { name: 'Python · DSA', href: 'https://programming-lab.vercel.app', desc: 'Raw code fluency (sibling lab).' },
    { name: 'SQL', href: 'https://product-analytics-lab.vercel.app', desc: 'Query fluency (sibling lab).' },
  ]},
  { group: 'Build', items: [
    { name: 'Workshop', nav: 'career', desc: 'A staged Design Studio — own a GenAI system end to end.' },
  ]},
  { group: 'Interview', items: [
    { name: 'Question Bank', nav: 'preplab', desc: '700+ questions on the L0/L1/L2 ladder, plus Browse All, Judgment Exam, Cheatsheet, and Review.' },
    { name: 'Speaking & Mock', nav: 'fluency', desc: 'Talk answers out loud and run a mock interview.' },
    { name: 'Company Tracks', nav: 'company-tracks', desc: 'Per-company × role × level prep with intel inline.' },
  ]},
];

// Progress / Review / Tracks / tiers.
const SYSTEMS = [
  { name: 'My Progress', nav: 'progress', desc: 'Completion by gym and your readiness signal — it points you at your weakest area next.' },
  { name: 'Review', nav: 'review', desc: 'Spaced repetition. It resurfaces what you got wrong, spaced over time, so it sticks.' },
  { name: 'My Tracks', nav: 'my-tracks', desc: 'Save any question or module into custom study lists to build your own prep path.' },
  { name: 'Depth tiers', nav: 'preplab', desc: 'L0 define · L1 deep single-concept · L2 cross-concept tradeoffs. Filter the bank by depth; spend most time at L2.' },
];

export default function StartHere({ onNavigate }) {
  const go = (v) => { if (onNavigate && v) onNavigate(v); };

  const cardBase = { background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* header */}
        <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--gal-build)' }}>Start here</p>
        <h1 className="text-2xl font-black text-white mb-2">How to use GenAI Systems Lab</h1>
        <p className="text-sm leading-relaxed mb-9" style={{ color: 'var(--text-2, #a1a1aa)' }}>
          An interview gym for Applied AI / GenAI Engineer roles. Here's the recommended path, what each section is
          for, and how progress, Review, and Tracks work together.
        </p>

        {/* recommended path */}
        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>The recommended path</h2>
        <div className="space-y-2.5 mb-10">
          {PATH.map(step => (
            <button key={step.n} onClick={() => go(step.nav)}
              className="w-full text-left rounded-xl p-4 transition-colors hover:border-zinc-600"
              style={cardBase}>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                  style={{ background: 'var(--gal-build-tint)', color: 'var(--gal-build)', border: '1px solid var(--gal-build-border)' }}>
                  {step.n}
                </span>
                <div>
                  <div className="text-sm font-bold text-white mb-0.5">{step.title} →</div>
                  <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2, #a1a1aa)' }}>{step.body}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* what each section is for */}
        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>What each section is for</h2>
        <div className="space-y-5 mb-10">
          {SURFACES.map(g => (
            <div key={g.group}>
              <div className="text-xs font-black uppercase tracking-wide mb-2 text-white">{g.group}</div>
              <div className="space-y-2">
                {g.items.map(it => (
                  it.href ? (
                    <a key={it.name} href={it.href} target="_blank" rel="noopener noreferrer"
                      className="block rounded-lg p-3.5 transition-colors hover:border-zinc-600"
                      style={cardBase}>
                      <div className="text-[13px] font-bold text-white">{it.name} ↗</div>
                      <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-3, #71717a)' }}>{it.desc}</div>
                    </a>
                  ) : (
                    <button key={it.name} onClick={() => go(it.nav)}
                      className="w-full text-left rounded-lg p-3.5 transition-colors hover:border-zinc-600"
                      style={cardBase}>
                      <div className="text-[13px] font-bold text-white">{it.name} →</div>
                      <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-3, #71717a)' }}>{it.desc}</div>
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* progress / review / tracks / tiers */}
        <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>How progress, Review & Tracks work</h2>
        <div className="space-y-2 mb-10">
          {SYSTEMS.map(s => (
            <button key={s.name} onClick={() => go(s.nav)}
              className="w-full text-left rounded-lg p-3.5 transition-colors hover:border-zinc-600"
              style={cardBase}>
              <div className="text-[13px] font-bold text-white">{s.name} →</div>
              <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-2, #a1a1aa)' }}>{s.desc}</div>
            </button>
          ))}
        </div>

        {/* jump-in */}
        <div className="rounded-2xl p-6 text-center" style={{ borderColor: 'var(--gal-build-border)', background: 'var(--gal-build-tint)', border: '1px solid var(--gal-build-border)' }}>
          <div className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'var(--gal-build-tint)', color: 'var(--gal-build)', border: '1px solid var(--gal-build-border)' }}>
            <Icon name="check" size={16} />
          </div>
          <h2 className="text-base font-black text-white mb-1.5">That's the loop.</h2>
          <p className="text-sm leading-relaxed mb-5 max-w-md mx-auto" style={{ color: 'var(--text-2, #a1a1aa)' }}>
            Recall in Foundations, questions on the ladder, reasoning out loud, judgment under pressure, then a
            targeted company loop. Start where you're weakest.
          </p>
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <button onClick={() => go('foundations')} className="px-4 py-2 rounded-lg text-xs font-bold text-black" style={{ background: 'var(--gal-build)' }}>
              Open Foundations →
            </button>
            <button onClick={() => go('preplab')} className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors">
              Question Bank →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
