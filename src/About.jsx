// src/About.jsx — comprehensive reference page for GenAI Systems Lab.
// What it is, how it's organised, how it differs, difficulty tiers, tech, contact.
// Dark theme, GSL CSS vars (--surface, --border, --text-2, --gal-build). Additive tab.
// Modeled on PAL's About: a sections array rendered in a loop + a contact card.

const COMMUNITY_URL = 'https://chat.whatsapp.com/JbIaqV87fwh8Ym3ufH5CFx?mode=gi_t';

const SIBLINGS = [
  { name: 'ML Systems Lab', url: 'https://ml-systems-lab.vercel.app', desc: 'Classical ML, deep learning, and ML system design.' },
  { name: 'Product Analytics Lab', url: 'https://product-analytics-lab.vercel.app', desc: 'SQL, product sense, experimentation, and metrics.' },
  { name: 'Programming Lab', url: 'https://programming-lab.vercel.app', desc: 'SWE-for-data fluency — predict the output, keep the reflex.' },
];

const SECTIONS = [
  {
    title: 'What this is',
    body: `GenAI Systems Lab (GSL) is a focused interview gym for Applied AI / GenAI Engineer roles — the LLM, RAG, agent, evaluation, and production-systems work that senior and staff loops actually test.

The gap GSL fills: most GenAI prep teaches you what a transformer, a vector index, or an agent loop is. Very few give you practice making the design and tradeoff calls that decide real interviews — chunking strategy under a latency budget, when an agent is the wrong tool, how to build an eval that catches the regression you shipped. GSL puts you in the decision, not the definition.

Fourteen Foundations gyms of interactive modules, a 700+ question bank with a depth ladder, a staged Workshop where you own a system end to end, Speaking & Mock practice, per-company tracks, a spaced-repetition Review queue, and progress that tells you where you stand — organised so you always know what to do next.`,
  },
  {
    title: 'The four things interviews test',
    body: `GSL is part of BreakLabs, built around the four competencies a GenAI-engineer loop — and the job itself — actually tests:

KNOW — do you know the field cold? Tokenization, attention, RAG, fine-tuning vs prompting, eval metrics, serving. (In GSL: Foundations and Ground Truth.)

DO — can you execute, not just recite? Turn a spec into a retrieval pipeline, an agent loop, an eval harness. (In GSL: the Coding Dojo, plus the Python · DSA and SQL sibling labs.)

BUILD — can you own a GenAI system end to end and defend the architecture? (In GSL: the Workshop / Design Studio.)

JUDGE — given real constraints and ambiguity, do you make the right call? Cost vs latency vs quality, build vs buy, when retrieval beats fine-tuning. (In GSL: the Judgment Exam and the tradeoff-heavy questions across the bank.)

Judgment is the moat. Recall is table stakes and models can do it; the reason GSL exists is that judgment and system design are what decide senior and staff loops — and almost nothing else practices them systematically.`,
  },
  {
    title: 'How the lab is organised',
    body: `GSL groups its surfaces into the frames you move through as you prep, plus an interview layer on top:

LEARN — build recall and depth. Foundations is fourteen topic gyms of interactive modules: Language Models, Retrieval, AI Agents, Evaluation, Production, Foundation Models, Prompt Engineering, Vector Infra, Multimodal, AI Safety, and the niche tracks Voice, Code-Gen, Inference Optimization, and Model Customization. Ground Truth carries the deep-dive posts.

CODE — get fluent. The Coding Dojo runs staged coding builds; Python · DSA and SQL are sibling labs for raw code and query fluency.

BUILD — the Workshop. A staged Design Studio where you own a GenAI system end to end, the way an applied-AI role expects.

INTERVIEW — rehearse under real conditions. The Question Bank (700+ questions on the L0/L1/L2 depth ladder, plus Browse All, Judgment Exam, Cheatsheet, and Review modes), Speaking & Mock (talk answers out loud and run a mock interview), and Company Tracks (per-company × role × level prep with that company's question slice and interview intel inline).

A personal strip ties it together: Home, Profile, My Progress, Review (spaced repetition), My Tracks (save items into custom study lists), Leaderboard, Plans & Access, and Resources.`,
  },
  {
    title: 'The L0 / L1 / L2 question ladder',
    body: `GSL's question model is a depth ladder, not a flat bank. Every concept can be interrogated at three depths — the way a good interviewer keeps pushing:

L0 — Define. Can you state it correctly and crisply? "What is RAG? What does temperature control?"

L1 — Deep single-concept. Do you understand one thing well enough to reason past the textbook? "Why does cosine similarity break down in high dimensions, and what do you do about it?"

L2 — Cross-concept tradeoffs. Can you hold several ideas at once and make a call under constraints? "You're at 4s p95 latency with a 200k-token context and a fixed cost ceiling — what do you cut first and why?"

Most banks stop at L0/L1. L2 is where senior and staff interviews live, and it's what the Judgment Exam pressure-tests.`,
  },
  {
    title: 'Community',
    body: `Prep is better with people. The WhatsApp community is where people ask questions, share interview experiences, and help each other through the same GenAI loops.

Sign in (optional) to sync progress across devices and appear on the Leaderboard. Your Profile carries your progress and rank; the Leaderboard ranks by total solved across the lab.`,
  },
  {
    title: 'How it differs',
    body: `Generic LLM courses (Coursera, deeplearning.ai, YouTube crash courses): excellent for learning what the pieces are. GSL is not a course — it is a judgment gym. It assumes you can learn a transformer diagram elsewhere and drills the part courses skip: making the design call.

GenAI question banks and flashcard decks: strong for L0 recall. GSL treats recall as the floor. The L0/L1/L2 ladder and the Judgment Exam exist to push you into single-concept depth and cross-concept tradeoffs — the questions that are actually asked once the interviewer knows you can define the terms.

Generalist interview-prep platforms: broad but shallow on GenAI. GSL is narrow on purpose — RAG design, agent architecture, evaluation strategy, and production LLM tradeoffs, practiced as system design and judgment, not as recall. That specific gap is what GSL targets.`,
  },
  {
    title: 'Difficulty & tiers',
    body: `Content across GSL is pitched at the level a senior-toward-staff loop operates at, and the question bank's depth is set by the L0/L1/L2 ladder:

L0 (Define) — the entry check. Know the concept and state it cleanly. Good for warming up or scanning a weak area.

L1 (Deep) — reason inside a single concept past the definition. The level most single-topic questions sit at.

L2 (Tradeoff) — chain concepts and make a call with incomplete information and real constraints. This is where most GSL prep time should go, and what staff+ prep leans on.

Filter by depth in the Question Bank, and use the Judgment Exam when you want the L2 tier under pressure.`,
  },
  {
    title: 'Technical details',
    body: `React + Vite single-page app. Content ships as JavaScript data files and interactive components; your progress is stored in your browser's localStorage. Sign in (optional) to sync across devices and appear on the Leaderboard.

Everything runs client-side — no server-side execution for the interactive gyms. Deployed on Vercel; works offline once loaded. Currently in beta — free with an access code.`,
  },
];

export default function About({ onNavigate }) {
  const go = (v) => { if (onNavigate) onNavigate(v); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-2">About GenAI Systems Lab</h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2, #a1a1aa)' }}>
          What it is, how it's organised, and how to get value from it.
        </p>
      </div>

      {/* Quick jumps */}
      <div className="flex flex-wrap gap-2 mb-9">
        {[
          ['Foundations', 'foundations'],
          ['Question Bank', 'preplab'],
          ['Company Tracks', 'company-tracks'],
          ['My Progress', 'progress'],
        ].map(([label, v]) => (
          <button key={v} onClick={() => go(v)}
            className="text-xs font-bold rounded-lg px-3 py-1.5 transition-opacity hover:opacity-90"
            style={{ background: 'var(--gal-build)', color: '#000' }}>
            {label} →
          </button>
        ))}
      </div>

      {SECTIONS.map((section, i) => (
        <div key={i} className="mb-8">
          <h2 className="text-[0.95rem] font-bold text-white mb-2.5 pb-2" style={{ borderBottom: '1px solid var(--border, #27272a)' }}>
            {section.title}
          </h2>
          <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-2, #a1a1aa)' }}>
            {section.body}
          </div>
        </div>
      ))}

      {/* Feedback & contact */}
      <div className="rounded-xl p-5 mb-9" style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
        <h2 className="text-[0.95rem] font-bold text-white mb-2">Feedback, issues & suggestions</h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-2, #a1a1aa)' }}>
          GSL is built and maintained by Sidharth Kriplani. Found a bug, have feedback, or want to
          suggest a question or a gym? Reach out — every message is read.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a href="mailto:sidharthkriplani@gmail.com"
            className="inline-flex items-center text-xs font-bold rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
            style={{ background: 'var(--gal-build)', color: '#000' }}>
            Email Sidharth
          </a>
          <a href="https://www.linkedin.com/in/sidharth-kriplani" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-bold rounded-lg px-4 py-2 text-white transition-colors hover:border-zinc-600"
            style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
            Connect on LinkedIn
          </a>
          <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-bold rounded-lg px-4 py-2 text-white transition-colors hover:border-zinc-600"
            style={{ background: 'var(--surface, #18181b)', border: '1px solid var(--border, #27272a)' }}>
            Join the community
          </a>
        </div>
        <p className="text-[0.72rem] mt-3.5" style={{ color: 'var(--text-3, #71717a)' }}>
          sidharthkriplani@gmail.com · linkedin.com/in/sidharth-kriplani
        </p>
      </div>

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
