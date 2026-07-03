// companyProfiles-c.js — sourced, real-world AI/ML interview profiles for the
// GenAI Systems Lab company-tracks side panel. Grounded in public information
// cross-checked across 2+ sources per company (IGotAnOffer, Exponent, Prepfully,
// InterviewQuery, Glassdoor, interviewing.io, and each company's own
// engineering/careers pages).
//
// Honest by design: these describe well-supported GENERAL patterns, not invented
// proprietary questions. Where a detail is uncertain (esp. team-specific loop
// variation), it is kept general.
//
// Shape per company:
//   { overview, process:[{round,detail}], emphasis:[str], focusAreas:[str],
//     prep, sources:[{title,url}] }
//
// DATA-FILE SYNTAX: single quotes only, no backticks.

export const CP_C = {
  Netflix: {
    overview:
      'Netflix runs a lighter-process, higher-signal loop for ML Engineers / Applied & Research Scientists: fewer rounds than typical FAANG, but each is deep and grounded in a real Netflix-style problem (recommendation, ranking, streaming). Teams set their own bar, culture and judgment are weighted as heavily as technical skill, and the implicit "Keeper Test" (would the manager fight to keep you?) sits behind every round; historically a senior-only bar.',
    process: [
      { round: 'Recruiter call (~30 min)', detail: 'Background, role and team fit, and an early read on Netflix culture-memo alignment (candor, judgment, independence, impact).' },
      { round: 'Technical / ML screen (1-2 rounds)', detail: 'Live coding on data structures and model implementation, plus ML reasoning on metrics and modeling choices for a realistic problem.' },
      { round: 'ML system / modeling design', detail: 'Architect a scalable inference or recommendation pipeline under real-world constraints; depth on data, evaluation, and trade-offs over breadth.' },
      { round: 'Deep-dive on your own work', detail: 'Interrogates a past project or research end-to-end: assumptions, decisions, impact, and what you would do differently (Research Scientist adds publication/roadmap depth).' },
      { round: 'Behavioral / culture (Keeper Test)', detail: 'Judgment, ownership, candor, and high-leverage impact in ambiguity; the "would I fight to keep this person?" bar is the real evaluation criterion.' },
      { round: 'Manager / team match', detail: 'Hiring manager consolidates signal and decides fit; a strong "keep" verdict is effectively required for an offer.' },
    ],
    emphasis: [
      'Culture and judgment — candor, independence, high-leverage impact',
      'Business impact and ownership in ambiguous, high-stakes settings',
      'ML depth on a real problem over broad rote knowledge',
      'Scalable ML system / recommendation design with clear trade-offs',
      'Senior-level maturity and self-aware reasoning about your own work',
    ],
    focusAreas: [
      'Recommendation and ranking systems (personalization, streaming scale)',
      'ML system design: features, scalable inference pipelines, evaluation',
      'Model implementation and data-structure coding in Python',
      'Metrics reasoning: offline vs online, A/B testing, business alignment',
      'End-to-end project deep-dive: assumptions, trade-offs, measured impact',
      'Novel algorithm development and research rigor (Research Scientist track)',
    ],
    prep:
      'Read the Netflix culture memo and prepare judgment-and-impact stories that show independence, candor, and high-leverage outcomes — this is graded as hard as the technical rounds. Drill model-implementation coding plus one end-to-end recommendation/ranking design going deep on metrics, and be able to defend every choice in a past project as if a manager is deciding whether to fight to keep you.',
    sources: [
      { title: 'Netflix ML Engineer Interview Guide — Exponent', url: 'https://www.tryexponent.com/guides/netflix-machine-learning-engineer-interview' },
      { title: 'Netflix ML Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/netflix-machine-learning-engineer' },
      { title: 'Senior Engineer\'s Guide to Netflix Interviews — interviewing.io', url: 'https://interviewing.io/guides/hiring-process/netflix' },
      { title: 'Netflix Culture — Careers at Netflix', url: 'https://jobs.netflix.com/culture' },
    ],
  },

  Uber: {
    overview:
      'Uber hires ML Engineers into an applied loop built around real-time marketplace problems (ETA, pricing, fraud, dispatch) on top of its Michelangelo ML platform. The process runs ~3-6 weeks: recruiter call, 1-2 technical screens, and a 4-5 round virtual/onsite that weights ML system design and production ML operability as heavily as coding.',
    process: [
      { round: 'Recruiter call (30-45 min)', detail: 'Non-technical fit conversation: background, motivation, applied-ML experience at a high level, and logistics/level.' },
      { round: 'Technical screen (1-2 rounds)', detail: 'Python coding plus ML fundamentals — reason through a modeling approach or walk through a system you have built; edge cases and complexity matter.' },
      { round: 'Coding + data round (45-60 min)', detail: 'DSA / data-manipulation problems in Python judged on clean logic, correctness, time and memory complexity.' },
      { round: 'ML system design (45-60 min)', detail: 'Design an end-to-end ML system for a realistic Uber use case (ETA, fraud, ranking): components, data flow, latency, scalability, observability, and failure handling.' },
      { round: 'Applied ML modeling (45-60 min)', detail: 'End-to-end modeling: feature selection, evaluation metrics, monitoring and retraining, plus bias, drift, and accuracy-vs-reliability trade-offs.' },
      { round: 'Behavioral / team match', detail: 'Ownership, collaboration, and impact stories; alignment on level and team before an offer.' },
    ],
    emphasis: [
      'ML system design for real-time marketplace problems',
      'Production ML operability — monitoring, drift, retraining, failure handling',
      'Trade-off analysis: latency, scalability, cost, reliability',
      'Clean, correct Python coding with complexity awareness',
      'Applied end-to-end modeling and collaboration',
    ],
    focusAreas: [
      'ML system design: ETA prediction, fraud detection, ranking/dispatch',
      'Real-time serving: latency, scalability, observability, data flow',
      'Feature engineering, evaluation metrics, and model monitoring',
      'Model lifecycle: drift detection, retraining, and reliability trade-offs',
      'Python DSA and data manipulation at LeetCode-medium',
      'ML platform thinking (Michelangelo-style train-to-serve pipelines)',
    ],
    prep:
      'Center prep on ML system design for real-time use cases — practice designing ETA, fraud, and ranking systems end-to-end with explicit attention to latency, scalability, observability, and failure modes. Drill timed Python coding and data manipulation, be fluent on drift/monitoring/retraining, and read Uber\'s Michelangelo posts to speak the platform language for train-to-serve pipelines.',
    sources: [
      { title: 'Uber ML Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/uber-machine-learning-engineer' },
      { title: 'Uber ML Engineer Interview Questions — Exponent', url: 'https://www.tryexponent.com/questions?company=uber&role=ml-engineer' },
      { title: 'Meet Michelangelo: Uber\'s Machine Learning Platform — Uber Blog', url: 'https://www.uber.com/us/en/blog/michelangelo-machine-learning-platform/' },
    ],
  },

  LinkedIn: {
    overview:
      'LinkedIn puts equal weight on production-grade coding and genuine ML depth for its "Software Engineer, Machine Learning" roles: a phone screen then a ~5-6 round onsite spanning coding, ML theory (with heavy probability/statistics), ML/product system design, and behavioral. Strong modeling cannot offset weak algorithms — you must clear both bars, and interviewers submit written scorecards that decide the outcome.',
    process: [
      { round: 'Recruiter screen', detail: 'Verifies experience and level; may include behavioral questions, and the hiring manager can join to discuss the role.' },
      { round: 'Phone screen', detail: 'Typically one coding question plus an ML/stats concept check (e.g. precision/recall) at medium-to-hard difficulty.' },
      { round: 'Coding rounds (2x)', detail: 'DSA on trees, graphs, and arrays; judged on clean, readable, production-grade code rather than puzzle tricks.' },
      { round: 'ML theory / depth', detail: 'Cross-validation, logistic regression, regularization, bias-variance, metrics (precision/recall/AUC), and probability/statistics — often intensive.' },
      { round: 'ML / product system design', detail: 'Design a scalable ML system such as a recommendation or real-time ranking service: data ingestion, feature stores, serving, monitoring, and failure handling.' },
      { round: 'Behavioral', detail: 'Collaboration, empathy, and inclusive decision-making stories; structure answers so a scorecard is easy to write.' },
    ],
    emphasis: [
      'ML depth — real algorithm and evaluation understanding, not buzzwords',
      'Probability, statistics, and A/B-testing fluency',
      'Clean, production-grade coding you must pass alongside modeling',
      'Scalable ML system design (recommendation, ranking, feature stores)',
      'Collaboration and inclusive, communicable reasoning (written scorecards)',
    ],
    focusAreas: [
      'DSA: trees, graphs, arrays at medium-to-hard difficulty',
      'ML fundamentals: logistic regression, regularization, bias-variance, GBMs, NNs',
      'Evaluation metrics: precision, recall, AUC, and cross-validation',
      'Probability, statistics, linear algebra, and A/B testing',
      'ML system design: recommendation/ranking, feature stores, serving, monitoring',
      'Behavioral: collaboration, empathy, inclusive decision-making',
    ],
    prep:
      'Prepare to clear both bars: drill clean, readable tree/graph/array coding and, in parallel, go deep on ML theory plus probability and statistics (precision/recall, cross-validation, A/B testing). Practice one recommendation/ranking system design covering feature stores, serving, and monitoring, and state your approach and trade-offs upfront so the interviewer\'s written scorecard writes itself.',
    sources: [
      { title: 'LinkedIn ML Engineer Interview Guide — DataInterview', url: 'https://www.datainterview.com/blog/linkedin-machine-learning-engineer-interview' },
      { title: 'LinkedIn ML Engineer Interview — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/linkedin-machine-learning-engineer' },
      { title: 'LinkedIn Software Engineer, ML — Interview Experience (LeetCode)', url: 'https://leetcode.com/discuss/post/7405614/linkedin-software-engineer-machine-learn-l9pd/' },
    ],
  },

  Adobe: {
    overview:
      'Adobe\'s ML Engineer loop tests algorithms, system design, ML fundamentals, and product sense across ~4-5 rounds (45-60 min each): recruiter screen, two coding rounds, a system-design discussion, and — distinctively — a machine-learning take-home project you present to a panel, plus a product/metrics round. Innovation and end-to-end thinking (data to deployment) are what stand out.',
    process: [
      { round: 'Recruiter call (~30 min)', detail: 'Aligns expectations, confirms background, and walks through the interview process and target role.' },
      { round: 'Coding rounds (2x)', detail: 'Algorithm and data-structure problems evaluated on correct logic, clean code, and complexity; a role may add a domain (graphics/ML/cloud) round.' },
      { round: 'System design', detail: 'A standard — sometimes full-stack — system-design question; Adobe weights innovation and creative architecture heavily here.' },
      { round: 'ML take-home project + presentation', detail: 'A technical take-home ML project you then present to a panel: framing, modeling choices, evaluation, and results.' },
      { round: 'Product & metrics round', detail: 'Bridges engineering and product: choose success metrics for an ML feature, design an A/B test, or diagnose model drift.' },
      { round: 'Behavioral', detail: 'Collaboration, ownership, and creativity stories aligned to Adobe\'s culture (Adobe For All values).' },
    ],
    emphasis: [
      'End-to-end thinking — from data to deployment',
      'ML take-home execution and clear presentation to a panel',
      'Product sense: metrics selection, A/B testing, drift diagnosis',
      'Algorithms and clean coding fundamentals',
      'Innovation and creativity in system design',
    ],
    focusAreas: [
      'DSA coding: arrays, strings, trees, graphs, complexity',
      'System design (sometimes full-stack) with creative architecture',
      'ML fundamentals: modeling choices, evaluation, and trade-offs',
      'Take-home ML project: framing, model, evaluation, and presentation',
      'Product metrics, A/B testing, and model-drift diagnosis',
      'Applied GenAI / domain depth for AI-focused Adobe teams',
    ],
    prep:
      'Treat the take-home as the centerpiece — build a clean, well-evaluated ML project and rehearse presenting its framing, choices, and results to a panel. Drill algorithm coding and one system-design question (be ready for full-stack breadth), and prepare product-sense answers on metric selection, A/B testing, and drift, tied to Adobe\'s emphasis on innovation and end-to-end ownership.',
    sources: [
      { title: 'Adobe ML Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/adobe-machine-learning-engineer' },
      { title: 'Adobe Interview Process and Top Questions — Exponent', url: 'https://www.tryexponent.com/blog/adobe-interview-process' },
      { title: 'How We Hire — Adobe Careers', url: 'https://www.adobe.com/careers/interviewing-at-adobe.html' },
    ],
  },

  Salesforce: {
    overview:
      'Salesforce hires ML Engineers into an applied Einstein-AI loop (NLP, LLMs, RAG) that opens with a timed HackerRank coding assessment and moves to a ~5-round onsite: coding/DSA, ML system design, an ML case study, a behavioral round, and a manager conversation. Applied Research/Research Scientist roles run a shorter 2-4 round loop centered on a research-talk panel. Cultural alignment to Salesforce values (Ohana) is probed throughout.',
    process: [
      { round: 'Recruiter screen', detail: 'Background, role fit, motivation, and logistics; sets up the technical assessment.' },
      { round: 'HackerRank coding assessment', detail: 'A timed online coding challenge (often ~3 hours) testing problem-solving and proficiency in Python and ML-relevant tooling.' },
      { round: 'Coding / DSA round', detail: 'Live data-structures-and-algorithms coding judged on clean logic, correctness, and complexity.' },
      { round: 'ML system design', detail: 'Design a scalable, production-ready ML system from a problem statement: data pipelines, model serving, monitoring, and infrastructure choices.' },
      { round: 'ML case study', detail: 'Solve a business problem with ML end-to-end — framing, features, model choice, evaluation, and deployment thinking.' },
      { round: 'Behavioral + manager round', detail: 'Values/culture fit (Ohana, customer focus) plus a manager conversation on strategy, collaboration, and cross-functional work.' },
    ],
    emphasis: [
      'Applied ML for Einstein AI — NLP, LLMs, RAG in production',
      'End-to-end ML system design (pipelines, serving, monitoring)',
      'Coding proficiency in Python under time pressure (HackerRank)',
      'Business-framed ML case-study thinking',
      'Culture and values alignment (Ohana, customer focus)',
    ],
    focusAreas: [
      'DSA coding in Python at medium-to-hard difficulty',
      'ML system design: data pipelines, model serving, monitoring, infra',
      'Applied NLP, LLMs, and retrieval-augmented generation (RAG)',
      'End-to-end ML case study: framing to deployment',
      'Model evaluation and production-readiness trade-offs',
      'Behavioral / values: collaboration, customer focus, Ohana',
    ],
    prep:
      'Prepare for a long timed HackerRank round first — drill Python DSA under a clock — then practice a production ML system design (pipelines, serving, monitoring) and a business-framed ML case study from problem to deployment. Be fluent in applied NLP/LLM/RAG for Einstein-AI teams, and prepare values-aligned behavioral stories (Ohana, customer focus) for the behavioral and manager rounds.',
    sources: [
      { title: 'Salesforce ML Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/salesforce-machine-learning-engineer' },
      { title: 'Salesforce Interview Process and Top Questions — Exponent', url: 'https://www.tryexponent.com/blog/salesforce-interview-process' },
      { title: 'Careers in AI Research — Salesforce Careers', url: 'https://www.salesforce.com/company/careers/teams/ai-research/' },
    ],
  },

  Databricks: {
    overview:
      'Databricks holds a high, software-engineering-heavy bar: it wants ML Engineers who go deep on language modeling and generative AI (not generalists) and who write clean, production-quality Python with real testing and design discipline. The loop runs ~4-6 weeks — recruiter screen, a coding + ML phone screen, and a 4-5 round onsite with multiple coding rounds (including concurrency), an ML/GenAI or distributed-data deep-dive, and behavioral; references are weighted unusually heavily in the final decision.',
    process: [
      { round: 'Recruiter screen (~30 min)', detail: 'Previous experience, interest in Databricks, and role specifics; lead with language-modeling / GenAI and end-to-end ownership.' },
      { round: 'Technical phone screen (~60 min)', detail: 'Coding plus ML fundamentals on CoderPad/Meet — medium-to-hard problems (graphs, optimization, sometimes concurrency).' },
      { round: 'Onsite coding (1-2 rounds)', detail: 'Algorithm problems in Python judged as production code: clean design, testing mindset, correctness, and complexity.' },
      { round: 'Concurrency / multithreading round', detail: 'A dedicated systems-flavored coding round on concurrency and multithreading.' },
      { round: 'ML / GenAI or distributed-data deep-dive', detail: 'For MLE, transformers/attention, pre-training vs fine-tuning, dataset curation and LLM evaluation; SWE/DE variants probe Spark-style computation, Delta Lake, partitioning, and pipeline/data-quality diagnostics.' },
      { round: 'Behavioral + references', detail: 'Tight STAR stories that reward removing/consolidating code and end-to-end ownership; reference checks (a manager plus senior peers) weigh heavily.' },
    ],
    emphasis: [
      'Language-modeling / GenAI depth over generalist ML',
      'Clean, production-quality Python with testing and design discipline',
      'Concurrency and distributed-data (Spark, Delta Lake) fundamentals',
      'End-to-end ownership from research to deployment',
      'Strong references and a bias toward consolidating, not just adding',
    ],
    focusAreas: [
      'DSA coding in Python: graphs, optimization, medium-to-hard',
      'Concurrency and multithreading',
      'Transformers/attention, pre-training vs fine-tuning, LLM evaluation',
      'Dataset curation and evaluation benchmarks for language models',
      'Distributed data: Spark-style compute, Delta Lake, partitioning (SWE/DE)',
      'Production ML: pipeline performance and data-quality diagnostics',
    ],
    prep:
      'Write production-quality Python — clean design, tests, edge cases — and drill a dedicated concurrency/multithreading round on top of graph/optimization DSA. Go genuinely deep on language modeling and GenAI (transformers, pre-training vs fine-tuning, dataset curation, LLM evaluation), and for SWE/DE variants add Spark, Delta Lake, and partitioning. Prepare tight STAR stories about consolidating code and shipping end-to-end, and line up strong references early.',
    sources: [
      { title: 'Databricks ML Engineer Interview Guide — DataInterview', url: 'https://www.datainterview.com/blog/databricks-machine-learning-engineer-interview' },
      { title: 'Databricks ML Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/databricks-machine-learning-engineer' },
      { title: 'Databricks Interview Process and Top Questions — Exponent', url: 'https://www.tryexponent.com/blog/databricks-interview-process' },
    ],
  },
};
