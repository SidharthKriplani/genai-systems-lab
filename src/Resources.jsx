// src/Resources.jsx — a simple, curated reference/links page for GSL.
// Dark theme, GSL CSS vars (--surface, --border, --gal-build). Additive tab (Rev-2 R3).
// Deliberately light: external references + in-lab jump-offs. No progress/localStorage.

const SIBLINGS = [
  { name: 'ML Systems Lab', url: 'https://ml-systems-lab.vercel.app', desc: 'Classical ML, deep learning, and ML system design.' },
  { name: 'Product Analytics Lab', url: 'https://product-analytics-lab.vercel.app', desc: 'SQL, product sense, experimentation, and metrics.' },
  { name: 'Programming Lab', url: 'https://programming-lab.vercel.app', desc: 'SWE-for-data fluency — predict the output, keep the reflex.' },
];

// External references — canonical, high-signal docs practitioners actually read.
const REFERENCES = [
  { group: 'Foundations & prompting', links: [
    { name: 'OpenAI — Prompt engineering guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
    { name: 'Anthropic — Prompt engineering', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' },
    { name: "Lilian Weng — Prompt Engineering", url: 'https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/' },
  ]},
  { group: 'Retrieval / RAG', links: [
    { name: 'Pinecone — Learn: RAG & vector search', url: 'https://www.pinecone.io/learn/' },
    { name: 'LlamaIndex — RAG concepts', url: 'https://docs.llamaindex.ai/en/stable/getting_started/concepts/' },
  ]},
  { group: 'Agents', links: [
    { name: 'Anthropic — Building effective agents', url: 'https://www.anthropic.com/research/building-effective-agents' },
    { name: "Lilian Weng — LLM Powered Autonomous Agents", url: 'https://lilianweng.github.io/posts/2023-06-23-agent/' },
  ]},
  { group: 'Evaluation & production', links: [
    { name: 'Hugging Face — Evaluate library', url: 'https://huggingface.co/docs/evaluate/index' },
    { name: 'Chip Huyen — Designing ML / LLM systems (blog)', url: 'https://huyenchip.com/blog/' },
  ]},
];

// In-lab jump-offs — reachable surfaces, so Resources is also a launchpad.
const IN_LAB = [
  { id: 'concepts', label: 'Foundations', desc: 'Recall + depth gyms across the GenAI stack.' },
  { id: 'groundtruth', label: 'Ground Truth', desc: 'Practitioner knowledge on real failure modes.' },
  { id: 'preplab', label: 'Question Bank', desc: 'Judgment questions, cheatsheet, and company slices.' },
  { id: 'company-tracks', label: 'Company Tracks', desc: 'Curated company × role prep paths.' },
];

export default function Resources({ onNavigate }) {
  const go = (v) => { if (onNavigate) onNavigate(v); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <h1 className="text-2xl font-black tracking-tight mb-2">Resources</h1>
      <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-2, #a1a1aa)' }}>
        A short shelf of canonical references plus quick jumps into the lab. Not exhaustive — just the
        high-signal docs practitioners keep open and the surfaces you'll return to most.
      </p>

      {/* In-lab jump-offs */}
      <div className="mb-10">
        <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>Jump into the lab</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {IN_LAB.map((it) => (
            <button key={it.id} onClick={() => go(it.id)}
              className="text-left rounded-xl p-3 transition-all hover:-translate-y-px"
              style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
              <div className="text-sm font-bold">{it.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-2, #a1a1aa)' }}>{it.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* External references */}
      <div className="mb-10">
        <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>External references</h2>
        <div className="space-y-5">
          {REFERENCES.map((sec) => (
            <div key={sec.group}>
              <div className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-2, #a1a1aa)' }}>{sec.group}</div>
              <ul className="space-y-1">
                {sec.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="text-sm hover:underline" style={{ color: '#e4e4e7' }}>
                      {l.name} <span style={{ color: '#71717a' }}>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Sister labs */}
      <div>
        <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gal-build)' }}>Sister labs</h2>
        <div className="space-y-2">
          {SIBLINGS.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
              className="block rounded-xl p-3 transition-all hover:-translate-y-px"
              style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
              <div className="text-sm font-bold">{s.name} <span style={{ color: '#71717a' }}>↗</span></div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-2, #a1a1aa)' }}>{s.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
