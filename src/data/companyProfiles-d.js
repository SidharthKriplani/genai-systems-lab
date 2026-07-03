// companyProfiles-d.js — sourced, real-world AI/ML interview profiles for the
// GenAI Systems Lab company-tracks side panel. India consumer + AI SaaS/services
// + infra tier. Cross-checked across 2+ sources per company (each company's own
// careers/product pages, Glassdoor India, AmbitionBox, InterviewQuery, Prepfully,
// GeeksforGeeks, takeuforward, Analytics India Magazine).
//
// Honest by design: these describe well-supported GENERAL patterns, not invented
// proprietary questions. Public ML-interview signal is uneven here — CRED, Meesho
// ML rounds, and especially Nutanix ML roles are thin, so those `overview` fields
// say so and the profiles stay general rather than fabricating specifics.
//
// Shape per company:
//   { overview, process:[{round,detail}], emphasis:[str], focusAreas:[str],
//     prep, sources:[{title,url}] }
//
// DATA-FILE SYNTAX: single quotes only, no backticks.

export const CP_D = {
  Zomato: {
    overview:
      'Zomato hires data scientists / ML engineers for consumer-scale food-delivery problems (ranking, ETA, demand, fraud). The loop is a fairly classic Indian-startup shape: an online assessment (ML MCQs + DSA), then 2-3 technical interviews mixing classical ML, DL, SQL/DSA, project deep-dives and an ML-framing-for-a-business-problem round, plus a culture/fit chat. Depth varies by team and level.',
    process: [
      { round: 'Online assessment', detail: 'HackerRank-style: 8-15 MCQs on ML, statistics, SQL and basic math, plus 1-2 DSA coding problems (often a DP or medium-hard question).' },
      { round: 'Technical round 1 (~50 min)', detail: 'Classical ML (bias/variance, class imbalance, correlation, EDA), DL basics (feedforward, backprop, dropout, activations), and optimisation, often tied to a Zomato-flavoured problem.' },
      { round: 'Technical round 2 (~50 min)', detail: 'Framing an ML solution for a business problem end-to-end; may extend into PySpark coding, SQL, and more DSA/ML/DS depending on the role.' },
      { round: 'Project / resume deep-dive', detail: 'Drilling into your past work and CV projects: why you chose a model, feature and loss decisions, and what you would do differently.' },
      { round: 'Hiring manager / culture round', detail: 'Fit, ownership, ways of working, plus logistics and compensation discussion.' },
    ],
    emphasis: [
      'Classical ML fundamentals explained from first principles',
      'Framing a business problem as an ML system end-to-end',
      'SQL and DSA fluency (Python; sometimes PySpark)',
      'Consumer-scale intuition: ranking, ETA, demand, fraud',
      'Clear reasoning about your own project decisions',
    ],
    focusAreas: [
      'Classical ML: bias-variance, regularisation, class imbalance, tree ensembles',
      'Deep learning basics: feedforward/backprop, dropout, activations, optimisers',
      'SQL and data manipulation (incl. PySpark for some teams)',
      'DSA at LeetCode-medium (arrays, strings, DP)',
      'Probability, statistics and EDA on messy real data',
      'Applied recommendation / ranking / ETA / fraud framing',
    ],
    prep:
      'Be able to explain your best algorithm from scratch with the math, and to frame a Zomato-style problem (ranking, ETA, demand, fraud) as a full ML pipeline. Drill ML/stats MCQs, SQL and LeetCode-medium DSA in Python (touch PySpark if the JD mentions it), and prepare tight project stories where you can defend every modeling choice.',
    sources: [
      { title: 'Zomato Data Scientist Interview Questions — Glassdoor India', url: 'https://www.glassdoor.co.in/Interview/Zomato-Data-Scientist-Interview-Questions-EI_IE515676.0,6_KO7,21.htm' },
      { title: 'Data science hiring process at Zomato — Analytics India Magazine', url: 'https://analyticsindiamag.com/data-science-hiring-process-at-zomato/' },
      { title: 'Zomato On-site Interview for Data Scientist — Medium', url: 'https://medium.com/@AaryanAhuja11/zomato-on-site-job-interview-for-data-scientist-f1d50adef05f' },
    ],
  },

  Meesho: {
    overview:
      'Meesho hires data scientists / ML engineers for e-commerce personalisation, pricing, fraud and support at low-cost-India scale. Public signal is moderate: expect an AI/HackerRank screen, a coding round, an LLD/system-design round, and hiring-manager + behavioral rounds that blend modeling fundamentals with production reality (drift, monitoring, rollout) and experimentation. Specific ML questions beyond this pattern are not well documented, so treat details as general.',
    process: [
      { round: 'Screening', detail: 'Recruiter / AI-based screen (e.g. an async verbal problem-solving pass) on background, role fit and target level.' },
      { round: 'Online coding round', detail: 'HackerRank-style, typically ~3 problems in ~105 minutes on DSA and SQL; clean, correct, efficient code.' },
      { round: 'System / low-level design round', detail: 'Design or LLD for a component; for DS/ML roles this shades into ML system design (recommendation/ranking, features, serving) with scale trade-offs.' },
      { round: 'ML depth + experimentation', detail: 'Modeling fundamentals meet production reality — drift, monitoring, rollout — plus A/B testing, measurement, and recommender-bias questions.' },
      { round: 'Hiring manager + behavioral', detail: 'Resume and past-experience deep-dive; situational, ownership-heavy stories about incidents, shifting requirements and cross-functional friction.' },
    ],
    emphasis: [
      'DSA + SQL correctness under time',
      'ML system design for e-commerce (recommendation, pricing, fraud)',
      'Production reality: drift, monitoring, safe rollout',
      'Experimentation and measurement (A/B testing)',
      'Ownership and situational, incident-handling maturity',
    ],
    focusAreas: [
      'DSA (arrays, strings, graphs/trees, DP) and SQL',
      'ML / recommendation system design and ranking at scale',
      'Latency / cost / throughput trade-offs in serving',
      'Model monitoring, drift detection and rollout strategy',
      'A/B testing and causal measurement of impact',
      'Recommender bias and fairness in a marketplace',
    ],
    prep:
      'Drill DSA and SQL to a clean-and-fast bar, then prepare one end-to-end e-commerce ML design (recommendation/ranking or pricing) you can take from data to serving to monitoring. Have a crisp view on experimentation and drift, and build ownership-heavy STAR stories about handling incidents and ambiguity — Meesho leans situational.',
    sources: [
      { title: 'Meesho Data Scientist Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/meesho-data-scientist' },
      { title: 'Data Science Hiring and Interview Process at Meesho — Analytics India Magazine', url: 'https://analyticsindiamag.com/data-science-hiring-process-at-meesho/' },
      { title: 'Meesho Interview Questions — Glassdoor India', url: 'https://www.glassdoor.co.in/Interview/Meesho-Interview-Questions-E1503776.htm' },
    ],
  },

  CRED: {
    overview:
      'CRED hires data scientists / ML engineers for credit, fraud, personalisation and growth on its members-only fintech app. Public ML-interview signal is thin and mostly intern/early-career: expect a HackerRank OA (DSA + SQL + ML MCQs), then technical rounds heavy on ML fundamentals and project "why", and a probability/statistics round often run by a data-science lead. Treat specifics as general and first-principles-oriented.',
    process: [
      { round: 'Online assessment (HackerRank)', detail: 'Around 9 items: two DSA programming questions (Python), a SQL question, and ~6 ML MCQs (decision trees, bias vs variance, regression).' },
      { round: 'Technical round 1', detail: 'ML fundamentals around overfitting/underfitting, project "why" (data handling, feature engineering, loss and model choices); explain your best algorithm from scratch with the math, then trees/random forests.' },
      { round: 'Technical round 2 (stats)', detail: 'Often led by the head of data science: probability and statistics depth, plus first-principles problem-solving.' },
      { round: 'System design (some roles)', detail: 'Designing and scaling a system against a CRED-flavoured real-world scenario, with attention to trade-offs.' },
      { round: 'Behavioral / fit', detail: 'First-principles thinking, translating ideas to code, and working with engineering and product stakeholders to drive outcomes.' },
    ],
    emphasis: [
      'First-principles reasoning over memorised answers',
      'ML fundamentals and the math behind your best algorithm',
      'Probability and statistics depth',
      'Project "why" — defending every modeling choice',
      'Stakeholder collaboration across eng and product',
    ],
    focusAreas: [
      'ML fundamentals: overfitting/underfitting, bias-variance, regularisation',
      'Tree-based models: decision trees, random forests, boosting',
      'Probability and statistics (distributions, inference, estimation)',
      'DSA in Python and SQL',
      'Feature engineering and loss/model selection reasoning',
      'Applied fintech ML framing: credit, fraud, personalisation',
    ],
    prep:
      'Pick your strongest algorithm and be able to derive it from scratch with the math, then pressure-test every project decision (features, loss, model) on "why". Brush up probability/statistics for the lead-run round, and keep DSA + SQL sharp. CRED rewards first-principles thinking, so practise reasoning out loud rather than reciting.',
    sources: [
      { title: 'Data science hiring process at CRED — Analytics India Magazine', url: 'https://analyticsindiamag.com/data-science-hiring-process-at-cred/' },
      { title: 'CRED Data Scientist Interview Questions — Prepfully', url: 'https://prepfully.com/interview-questions/cred/data-scientist' },
      { title: 'CRED OffCampus Data Science Interview Experience — Medium', url: 'https://medium.com/@aryan1113/cred-data-science-intern-interview-experience-33d3631050f5' },
    ],
  },

  Sprinklr: {
    overview:
      'Sprinklr is an AI-native Unified Customer Experience Management (Unified-CXM) SaaS, so its ML/AI roles centre on NLP, conversational AI and generative AI (Copilot, AI Agents, insights) over social/customer data at scale. The loop is engineering-heavy: a DSA-focused coding assessment, two-plus technical rounds (the first ones DSA, later ones ML/AI and system design), a project deep-dive, and behavioral/fit rounds.',
    process: [
      { round: 'Recruiter / HR screen', detail: 'Resume review and a call on interest, motivation and general fit with Sprinklr\'s culture.' },
      { round: 'Coding assessment', detail: 'Online DSA test (data structures and algorithms), sometimes with ML-concept questions mixed in; strong emphasis on correctness and problem-solving.' },
      { round: 'Technical rounds (2-3)', detail: 'First 1-2 rounds are DSA-heavy; later rounds go into ML/AI depth — predictive modeling, clustering, NLP — plus project discussion and advanced-topic follow-ups.' },
      { round: 'ML / system design', detail: 'Designing an ML/AI system in the CXM domain (NLP classification, conversational/gen-AI, analytics over social data) with scale and evaluation trade-offs.' },
      { round: 'Behavioral + final round', detail: 'Teamwork, collaboration and culture fit, then a senior-management/exec round on vision, alignment and potential contribution.' },
    ],
    emphasis: [
      'Strong DSA and coding correctness (front-loaded)',
      'NLP and text/ML depth for CXM',
      'Conversational and generative AI understanding',
      'ML/AI system design over social-scale data',
      'Communication and culture fit',
    ],
    focusAreas: [
      'DSA at LeetCode-medium (arrays, strings, graphs/trees, DP)',
      'NLP: classification, clustering, embeddings, intent/entity extraction',
      'Conversational AI and generative AI (LLM-backed assistants, Copilot-style)',
      'Predictive modeling and evaluation metrics',
      'ML system design over social / customer-data at scale',
      'Project deep-dive and advanced-topic reasoning',
    ],
    prep:
      'Front-load DSA — the early rounds are algorithm-heavy — then build NLP/ML depth relevant to CXM: text classification, clustering, embeddings, and modern conversational/generative AI. Prepare one ML system design over social-scale data with clear evaluation, and be ready to defend your projects and discuss advanced topics like predictive modeling and clustering.',
    sources: [
      { title: 'Sprinklr Machine Learning Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/sprinklr-machine-learning-engineer' },
      { title: 'Sprinklr Interview Experience Set-1 — takeUforward', url: 'https://takeuforward.org/interviews/sprinklr-interview-experience-set-1' },
      { title: 'The Definitive AI-Native Customer Experience Platform — Sprinklr', url: 'https://www.sprinklr.com/' },
    ],
  },

  Quantiphi: {
    overview:
      'Quantiphi is an AI-first digital-engineering / applied-ML services and consulting firm (a major Google Cloud and AWS partner), so its ML roles are delivery-focused: building and shipping applied ML/GenAI solutions for clients on cloud. The loop typically runs an aptitude/online test, one or two technical interviews (Python, SQL, ML techniques, cloud, and real-world case studies), and an HR/behavioral round weighting cultural fit and collaboration.',
    process: [
      { round: 'Online aptitude / assessment', detail: 'Quantitative, verbal and logical reasoning sections, often with technical questions on programming, SQL and data structures.' },
      { round: 'Technical interview 1', detail: 'Python and SQL, data structures, and ML techniques; discussion of your past projects and applied modeling choices.' },
      { round: 'Technical interview 2 / case study', detail: 'Deeper ML/GenAI techniques plus a real-world case study reflecting client-delivery challenges Quantiphi faces; cloud (GCP/AWS) is a plus.' },
      { round: 'HR / behavioral round', detail: 'Cultural fit, collaboration, communication and alignment with company values — weighted heavily in a services setting.' },
    ],
    emphasis: [
      'Applied ML delivery over research novelty',
      'Python and SQL fluency',
      'Cloud platforms (GCP and AWS)',
      'Case-study problem-solving for client scenarios',
      'Collaboration and cultural fit',
    ],
    focusAreas: [
      'Python and SQL for data and ML work',
      'ML/DL techniques applied to real client problems',
      'Cloud ML on GCP / AWS (deployment, pipelines)',
      'GenAI / LLM applied solutions (increasingly common)',
      'Data structures and algorithms fundamentals',
      'Case studies and stakeholder-facing communication',
    ],
    prep:
      'Sharpen Python, SQL and core DSA, and be fluent in applied ML/GenAI techniques you can map onto client problems — Quantiphi is delivery-first, not research-first. Get comfortable with at least one cloud (GCP or AWS) for deployment/pipelines, rehearse case-study problem-solving out loud, and prepare collaboration/culture-fit stories for the HR round.',
    sources: [
      { title: 'Quantiphi Machine Learning Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/quantiphi-machine-learning-engineer' },
      { title: 'Quantiphi ML Engineer Interview (On-Campus 2024) — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/quantiphi-interview-experience-for-machine-learning-engineer-2024-on-campus/' },
      { title: 'Quantiphi Machine Learning Engineer — Glassdoor', url: 'https://www.glassdoor.com/Interview/Quantiphi-Machine-Learning-Engineer-Interview-Questions-EI_IE1143542.0,9_KO10,35.htm' },
    ],
  },

  Nutanix: {
    overview:
      'Nutanix is a hybrid-cloud / hyperconverged-infrastructure company, so most engineering hiring is SWE/systems-oriented rather than ML — dedicated ML-role interview signal is sparse and the loop below is the well-documented software-engineer process (which ML-adjacent hires largely follow). Expect a HackerRank coding round, a debugging round, technical interviews (incl. basic system design, OOP, OS, concurrency), and a behavioral round; ML candidates should also expect systems and infra depth.',
    process: [
      { round: 'Coding round (HackerRank)', detail: '2-3 DSA problems of medium-to-hard difficulty in ~1-2 hours; correctness, complexity and edge cases.' },
      { round: 'Debugging round', detail: 'Fix logical flaws in provided programs against a stated spec — read the intended behaviour and correct the bugs.' },
      { round: 'Technical interview(s)', detail: 'Basic system design (e.g. a scalable file store or URL shortener) plus OOP, OS fundamentals and concurrency; problem-solving approach and code clarity matter more than trivia.' },
      { round: 'CV / project defence', detail: 'Deep questions on your resume and accomplishments — expect to defend claimed work and (for ML-adjacent roles) your modeling/systems decisions.' },
      { round: 'Behavioral round', detail: 'Standard "tell me about a challenge" and prioritisation questions; ownership and collaboration.' },
    ],
    emphasis: [
      'Strong DSA and clean, correct code',
      'Debugging and reading unfamiliar code',
      'Systems fundamentals: OS, concurrency, OOP',
      'Basic distributed/system design',
      'Problem-solving approach and edge-case thinking',
    ],
    focusAreas: [
      'DSA at LeetCode medium-to-hard (arrays, trees, graphs, DP)',
      'Debugging and logical fault-finding in code',
      'OS, concurrency and OOP fundamentals',
      'Basic system design (scalable storage, URL shortener)',
      'C++/Python and low-level/systems thinking',
      'Infra / distributed-systems context (ML-adjacent roles)',
    ],
    prep:
      'Treat this as a strong SWE loop: grind LeetCode medium-to-hard, practise debugging unfamiliar code against a spec, and solidify OS/concurrency/OOP plus basic system design. For ML-adjacent roles, be ready for systems and infra depth as much as modeling, and prepare to defend every line of your CV.',
    sources: [
      { title: 'Nutanix Software Engineer Interview Questions — Glassdoor India', url: 'https://www.glassdoor.co.in/Interview/Nutanix-Software-Engineer-Interview-Questions-EI_IE429159.0,7_KO8,25.htm' },
      { title: 'Nutanix Software Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/nutanix-software-engineer' },
      { title: 'Nutanix Interview Experience Set-1 — takeUforward', url: 'https://takeuforward.org/interviews/nutanix-interview-experience-set-1' },
    ],
  },
};
