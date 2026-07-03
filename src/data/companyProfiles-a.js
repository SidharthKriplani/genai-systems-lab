// companyProfiles-a.js — sourced, real-world AI/ML interview profiles for the
// GenAI Systems Lab company-tracks side panel. Grounded in public information
// cross-checked across 2+ sources per company (IGotAnOffer, Exponent, Prepfully,
// Glassdoor, Levels.fyi, interviewing.io, and each company's own careers pages).
//
// Honest by design: these describe well-supported GENERAL patterns, not invented
// proprietary questions. Where a detail is uncertain (esp. India/Bangalore loop
// specifics beyond compensation), it is kept general.
//
// Shape per company:
//   { overview, process:[{round,detail}], emphasis:[str], focusAreas:[str],
//     prep, sources:[{title,url}] }
//
// DATA-FILE SYNTAX: single quotes only, no backticks.

export const CP_A = {
  Google: {
    overview:
      'Google hires most ML engineers under the software-engineer umbrella (L3-L6+), so the loop blends heavy DSA coding with ML depth; Google DeepMind runs a separate, research-leaning process with math/theory and paper rounds. India/Bangalore uses the same global loop and hiring-committee bar.',
    process: [
      { round: 'Resume screen + Hiring Assessment', detail: 'Recruiter filters fit; an online behavioral assessment (sometimes an optional coding exercise) gates entry.' },
      { round: 'Recruiter screen (~30 min)', detail: 'Background, motivation ("Why Google?"), logistics, and a light Googleyness read.' },
      { round: 'Technical phone screen (1-2 rounds)', detail: 'DSA coding in a shared Google Doc with no IDE or autocomplete; occasionally an ML concept check.' },
      { round: 'Onsite loop (~5 interviews, 45 min)', detail: 'Typically 1-2 coding rounds, one ML-domain round, one ML system design round, and one behavioral/Googleyness round.' },
      { round: 'Hiring committee + team match', detail: 'A committee of senior engineers reviews packets to decide hire/level, then you match to a team (comp and exec review for senior roles).' },
      { round: 'DeepMind variant', detail: 'Adds a paper-presentation round, a chat with a senior scientist, and math/theory or distributed-training-systems rounds (AI tools prohibited).' },
    ],
    emphasis: [
      'General Cognitive Ability — structured problem-solving on novel problems',
      'Role-Related Knowledge — real ML/DL depth, not just theory',
      'Googleyness & culture fit — ambiguity comfort, collaboration',
      'Emergent leadership across cross-functional teams',
      'Coding rigor — bug-free, optimal, well-structured code under time',
    ],
    focusAreas: [
      'DSA coding: graphs/trees, arrays/strings, dynamic programming, recursion',
      'ML fundamentals from scratch in pure Python (conv, batch-norm, logistic regression)',
      'Model training craft: overfitting control, early stopping, optimization',
      'ML system design pipeline: data to serving to monitoring',
      'GenAI/DL: PyTorch, recommendation/NLP/vision systems, GCP/Vertex AI',
      'Bias, feedback loops, and failure handling (corrupt models, bad batches)',
    ],
    prep:
      'Grind LeetCode-style DSA (practice coding in a plain Google Doc, thinking aloud) while drilling ML system design end-to-end and implementing core ML ops from scratch. Prepare STAR-style Googleyness/leadership stories; for DeepMind add math foundations and a paper you can present.',
    sources: [
      { title: 'Google ML Engineer Interview — IGotAnOffer', url: 'https://igotanoffer.com/blogs/tech/google-machine-learning-engineer-interview' },
      { title: 'Google MLE Interview Guide — Exponent', url: 'https://www.tryexponent.com/guides/google-machine-learning-engineer-interview' },
      { title: 'Google DeepMind Interview Process 2026 — techinterview.org', url: 'https://www.techinterview.org/post/3233474918/deepmind-interview-process-2026/' },
    ],
  },

  Meta: {
    overview:
      'Meta hires most AI/ML engineers as "Software Engineer, Machine Learning" through a team-agnostic loop that blends standard SWE coding rigor with a dedicated ML system design round and, since 2025, an AI-assisted (LLM) coding round. The loop is identical globally including India/Bangalore; only compensation differs.',
    process: [
      { round: 'Recruiter / pre-screen (30-45 min)', detail: 'Call or async questionnaire on background, ML experience, tools, target level (E3-E6), and preferred language.' },
      { round: 'Initial technical screen (45 min)', detail: 'Two medium DS&A coding problems on CoderPad at the same bar as SWE screens; speed, clean code, complexity.' },
      { round: 'Onsite coding (45 min)', detail: 'Two more algorithm/data-structure problems; brute-force-then-optimize, narrate reasoning, handle edge cases.' },
      { round: 'AI-assisted coding (60 min, new 2025)', detail: 'Debug/extend an unfamiliar multi-file codebase using an LLM; tests navigation speed, prompting, and catching hallucinations.' },
      { round: 'ML system design (45 min, 1-2x)', detail: 'Design an end-to-end ML system (feed ranking, recommendations) with depth on offline + online evaluation metrics.' },
      { round: 'Behavioral (45 min)', detail: 'Conflict, ambiguity, ownership, and quantified-impact stories; Research Scientist adds a paper-presentation and PhD-led round.' },
    ],
    emphasis: [
      'ML system design depth, especially evaluation metrics',
      'Coding speed and correctness (two problems per 45 min)',
      'LLM fluency — prompting, verifying, correcting AI-generated code',
      'End-to-end ML ownership and trade-off reasoning',
      'Autonomy, ambiguity-handling, and clear communication',
    ],
    focusAreas: [
      'DS&A patterns: arrays/strings, graphs/trees, dynamic programming',
      'ML system design arc: recommendation/ranking, features, offline+online eval',
      'LLM-assisted debugging on unfamiliar codebases',
      'Recommendation/ranking and content-moderation/NLP systems at scale',
      'Deployment and monitoring trade-offs (latency, cost, data scale)',
      'Presenting your own research and situating it (Research Scientist track)',
    ],
    prep:
      'Study Meta\'s official ML field guide, drill timed DS&A (~15 min/problem), and run a full end-to-end ML design going deep on evaluation. Practice directing and correcting an LLM on an unfamiliar codebase, and build a quantified behavioral story bank; confirm your target level (E4/E5) with the recruiter.',
    sources: [
      { title: 'Meta ML Engineer Interview — IGotAnOffer', url: 'https://igotanoffer.com/blogs/tech/facebook-machine-learning-engineer-interview' },
      { title: 'Meta MLE Interview Guide — Exponent', url: 'https://www.tryexponent.com/guides/meta-machine-learning-engineer-interview' },
      { title: 'Preparing for Your Full Loop Interview — Meta Careers', url: 'https://www.metacareers.com/ML-prep-onsite/' },
    ],
  },

  Amazon: {
    overview:
      'Amazon AI/ML hiring (Applied Scientist, ML Engineer, incl. AWS AI and Amazon India/Bangalore) runs the standard Amazon loop: 1-2 technical phone screens then a 4-6 interview onsite that pairs ML depth/breadth and coding/system-design with behavioral rounds scored on the Leadership Principles, plus a Bar Raiser who can veto.',
    process: [
      { round: 'Recruiter / Technical Phone Screen', detail: '1-2 screens (~60 min) with a senior scientist covering ML fundamentals, coding, research background, and Leadership Principles.' },
      { round: 'Online Assessment (mainly MLE/early-career)', detail: 'Timed DSA coding plus ML MCQs (evaluation, overfitting, learning types) and a Leadership-Principle work simulation.' },
      { round: 'ML Breadth', detail: 'Rapid-fire across supervised/unsupervised, probabilistic models, regularization, sequence/deep models, and the math behind algorithms.' },
      { round: 'ML Depth / Research (Tech Talk)', detail: 'Deep drill into your own past project or research: modeling assumptions, trade-offs, and (for AS) publication rigor.' },
      { round: 'Coding + ML System Design', detail: 'DSA coding rounds plus designing an ML system (ranking, training-to-serving) with attention to scale, latency, and complexity.' },
      { round: 'Bar Raiser + Behavioral (LPs)', detail: 'An independent trained interviewer plus LP-based STAR behavioral questions; LPs are assessed in every round and the Bar Raiser holds veto power.' },
    ],
    emphasis: [
      'Leadership Principles — assessed in every round, STAR-structured, data-backed',
      'Bar Raiser bar — independent quality gate with veto power',
      'Applied-scientist ML depth (own research, modeling rigor)',
      'ML breadth across theory and math fundamentals',
      'Coding + ML system design at scale',
    ],
    focusAreas: [
      'ML fundamentals + math (bias-variance, regularization, boosting/bagging, metrics)',
      'Deep learning + sequence models (CNN/RNN/LSTM, transformers/attention)',
      'ML system design (ranking, recommendation, training/serving pipelines)',
      'DSA coding (arrays, trees, DP, complexity optimization)',
      'Probabilistic models, statistics, and experimentation',
      'GenAI/LLM applied topics (fine-tuning, embeddings, retrieval) for AWS AI teams',
    ],
    prep:
      'Prepare 8-12 STAR stories mapped explicitly to the Leadership Principles with quantified outcomes, and be able to defend every modeling choice in your own work. Then drill ML breadth theory, LeetCode-style DSA, and one or two end-to-end ML system-design walkthroughs; Amazon\'s official Applied Scientist prep page is the canonical primer.',
    sources: [
      { title: 'Applied Scientist Interview Prep — Amazon Jobs', url: 'https://amazon.jobs/content/en/how-we-hire/applied-scientist-interview-prep' },
      { title: 'Amazon Applied Scientist Interview — IGotAnOffer', url: 'https://igotanoffer.com/en/advice/amazon-applied-scientist-interview' },
      { title: 'Amazon ML Engineer Interview — IGotAnOffer', url: 'https://igotanoffer.com/blogs/tech/amazon-machine-learning-engineer-interview' },
    ],
  },

  Microsoft: {
    overview:
      'Microsoft\'s Applied Scientist / ML Engineer loop is a team-specific process of ~5 rounds: recruiter screen, a technical phone screen, and a 4-5 interviewer loop capped by the distinctive "As Appropriate" (AA) round where the hiring manager or senior leader makes the final call. Growth-mindset behavioral signal is weighted heavily and woven into every round.',
    process: [
      { round: 'Recruiter / HR screen (30 min)', detail: 'Confirms role-team fit and career narrative; the recruiter can usually name the exact team and product area.' },
      { round: 'Technical phone screen (30-60 min)', detail: 'For AS, blends ML-grounded coding (k-means, bag-of-words from scratch), a project deep-dive, and foundational ML; for MLE, a well-scoped DS&A problem.' },
      { round: 'Coding round(s) (45-60 min)', detail: 'A medium/medium-hard algorithm problem evaluated on decomposition, communication, clean code, edge cases, and complexity.' },
      { round: 'ML design / scenario (45-60 min, often 2x for AS)', detail: 'End-to-end ML pipeline design against a realistic problem, plus experimentation follow-ups; MLE gets a cloud-native / Azure system-design round.' },
      { round: 'As Appropriate (AA) round (45-60 min)', detail: 'Final hiring-manager/senior-leader interview that probes weak spots (technical + behavioral) and holds the decisive hire/no-hire call.' },
    ],
    emphasis: [
      'Growth mindset / "learn-it-all" culture signal',
      'ML fundamentals depth — mechanics not buzzwords',
      'Coding fluency (clean, decomposed, complexity-aware)',
      'End-to-end ML system/pipeline design with production awareness',
      'Collaboration / customer obsession / One-Microsoft fit',
    ],
    focusAreas: [
      'Transformer & attention internals (a common filter)',
      'Model building blocks from scratch (k-means, bag-of-words, logistic regression, NN)',
      'End-to-end ML pipeline design (data to features to model to eval to serving)',
      'Model evaluation & experimentation (multi-metric, A/B testing)',
      'ML foundations & tradeoffs (loss design, overfitting, inference/cost)',
      'Pre-training / post-training and applied GenAI depth (AI-focused AS teams)',
    ],
    prep:
      'Go deep before wide — pick one ML area you can defend at architecture level, know transformer internals cold, and pressure-test every CV project on architecture, loss, overfitting, and cost. Practice end-to-end design out loud, prepare 8-10 STAR stories (with genuine failure arcs) mapped to the cultural pillars, and tailor examples once the recruiter names the team.',
    sources: [
      { title: 'Microsoft Applied Scientist Interview Guide — Exponent', url: 'https://www.tryexponent.com/guides/microsoft-applied-scientist-as-interview' },
      { title: 'Microsoft ML Engineer Interview Guide — Prepfully', url: 'https://prepfully.com/interview-guides/microsoft-machine-learning-engineer' },
      { title: 'Microsoft Applied Scientist Interviews — Glassdoor', url: 'https://www.glassdoor.co.in/Interview/Microsoft-Applied-Scientist-II-Interview-Questions-EI_IE1651.0,9_KO10,30.htm' },
    ],
  },

  Nvidia: {
    overview:
      'Nvidia\'s AI/ML, deep-learning, and research-scientist loops run 5-7 stages over 4-8 weeks: recruiter screen, a technical/coding screen, an optional hiring-manager call, and a 4-6 round onsite that leans harder than most FAANG on GPU/CUDA architecture, deep-learning-systems performance, and low-level C++. India/Bangalore follows the same structure.',
    process: [
      { round: 'Recruiter screen (~30 min)', detail: 'Background, role/team fit, interest in Nvidia, light technical + behavioral; may be skipped for referrals.' },
      { round: 'Technical / coding screen (30-75 min)', detail: 'HackerRank DS&A problems (typically LeetCode-medium) plus domain probes on GPU/CUDA or ML; no external tools.' },
      { round: 'Hiring-manager call (~30 min)', detail: 'Cultural fit against Nvidia\'s values (intellectual honesty, excellence, speed) and a sell of the specific team.' },
      { round: 'Onsite — Coding (1-3 rounds, C++/Python)', detail: 'Production-grade problem-solving plus ML-implementation coding (dropout, batchnorm, softmax, a convolution kernel from scratch).' },
      { round: 'Onsite — Deep-learning / ML domain (1-2 rounds)', detail: 'DL fundamentals and math (forward/backward pass, CNN/RNN/Transformer internals, optimizers, losses) plus a project deep-dive.' },
      { round: 'Onsite — GPU/CUDA & systems (often 1 round)', detail: 'GPU architecture, memory hierarchy (SRAM vs HBM), coalescing, warp divergence, kernel fusion, mixed precision/Tensor Cores.' },
    ],
    emphasis: [
      'Deep-learning fundamentals + math depth (architectures, backprop, optimization)',
      'GPU/CUDA, memory hierarchy & performance optimization',
      'Strong C++ and Python (low-level, production-grade)',
      'ML systems / training & inference infrastructure at scale',
      'Intellectual honesty and clear communication (Nvidia core values)',
    ],
    focusAreas: [
      'CUDA programming: coalescing, warp divergence, bank conflicts, kernel fusion, profiling',
      'GPU architecture & memory: SRAM vs HBM, bandwidth, mixed precision / Tensor Cores',
      'DL internals from scratch: MLP forward/backward, dropout, batchnorm, softmax, convolution',
      'Transformers & generative modeling (LLM training/inference, attention)',
      'Distributed training & ML infra (NCCL, gradient scaling, multi-GPU scaling)',
      'C++/Python DS&A at LeetCode-medium plus systems design (allocators, GPU scheduling)',
    ],
    prep:
      'Drill LeetCode-medium in C++/Python and be able to hand-code core DL layers (softmax, batchnorm, dropout, a conv kernel), then go deep on CUDA and GPU-memory optimization — know coalescing, warp divergence, HBM bandwidth, and mixed precision. Prepare a crisp project deep-dive and align behavioral stories to Nvidia\'s values.',
    sources: [
      { title: 'Nvidia Software Engineer Interview — IGotAnOffer', url: 'https://igotanoffer.com/en/advice/nvidia-software-engineer-interview' },
      { title: 'Nvidia ML Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/nvidia-machine-learning-engineer' },
      { title: 'Nvidia Interview Process and Top Questions — Exponent', url: 'https://www.tryexponent.com/blog/nvidia-interview-process' },
    ],
  },

  Anthropic: {
    overview:
      'Anthropic runs a mission-first loop that swaps LeetCode for practical, build-from-scratch work samples (CodeSignal, progressively harder specs) and weights AI-safety/values alignment as heavily as engineering skill. The loop runs ~4 weeks across 5-6 rounds; live-interview AI use is prohibited unless explicitly permitted.',
    process: [
      { round: 'Recruiter screen (~30 min)', detail: 'Not a formality — tests mission alignment and whether you can articulate "why Anthropic specifically," plus background fit.' },
      { round: 'Work-sample coding assessment (60-90 min)', detail: 'A single real-world problem in ~4 progressively harder levels (e.g. in-memory KV store, banking system); clean, modular, incrementally-extensible code, not LeetCode.' },
      { round: 'Hiring-manager screen (~1 hr)', detail: 'Deep dive on your own past projects — decisions, tradeoffs, what you\'d do differently; sometimes a multi-language code review.' },
      { round: 'Onsite / technical loop (4-5 rounds)', detail: 'Live from-scratch coding (Python), LLM-specific system design (serving an LLM API, batching, GPU utilization), plus recurring concurrency/multithreading.' },
      { round: 'Company values round (~1 hr)', detail: 'Standalone, non-technical round on ethical judgment and AI-safety alignment; rewards genuine skepticism over enthusiasm, and is where most candidates fail.' },
      { round: 'References + team matching', detail: 'Consensus hiring decision; references probe how you handled conflict and ethical friction; team-match must find a fit before an offer.' },
    ],
    emphasis: [
      'Mission and AI-safety alignment (why safety-first, why Anthropic)',
      'Practical from-scratch coding in Python (clean, modular, incremental)',
      'Values / ethical judgment under pressure (honest, self-aware, willing to disagree)',
      'LLM-aware system design and distributed-systems fundamentals',
      'Depth of reasoning and tradeoff communication about your own work',
    ],
    focusAreas: [
      'LLM serving and inference infra: batching, queuing, GPU utilization, token/cost models',
      'Transformers and how LLMs work, fail modes, and designing around limitations',
      'Prompt engineering and multi-step / multi-call LLM reasoning systems',
      'Distributed systems and scaling (large-scale search, hybrid retrieval, latency debugging)',
      'Concurrency and multithreading (recurs across multiple rounds)',
      'Data-structure implementation from scratch + practical Python standard library',
    ],
    prep:
      'Internalize Anthropic\'s safety-first worldview by reading their Core Views on AI Safety to form a genuine (even skeptical) point of view, and practice values answers as honest reflection rather than rehearsed frameworks. For technical rounds, drill progressively-layered CodeSignal-style problems in Python, LLM-specific system design, and concurrency; note AI tools are banned in live interviews unless allowed.',
    sources: [
      { title: 'Guidance on Candidates\' AI Usage — Anthropic', url: 'https://www.anthropic.com/candidate-ai-guidance' },
      { title: 'Anthropic Interview Process & Questions — interviewing.io', url: 'https://interviewing.io/anthropic-interview-questions' },
      { title: 'Anthropic Interview Process: 6 Steps to an Offer — IGotAnOffer', url: 'https://igotanoffer.com/en/advice/anthropic-interview-process' },
    ],
  },
};
