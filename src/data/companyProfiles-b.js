// companyProfiles-b.js — sourced AI/ML interview profiles for 6 India-based companies.
//
// Grounded in public info (company careers/eng blogs, Glassdoor/AmbitionBox India
// reviews, Prepfully/InterviewQuery guides, LeetCode/GeeksforGeeks experiences,
// Analytics India Magazine hiring writeups). Patterns are described honestly;
// specific interview QUESTIONS are not fabricated. Where a company's public
// signal is thin, the `overview` says so.
//
// Shape per company:
//   { overview, process:[{round,detail}], emphasis:[], focusAreas:[], prep, sources:[{title,url}] }
//
// DATA-FILE SYNTAX: single quotes / template literals only.

export const CP_B = {
  'Flipkart': {
    overview: 'India’s largest e-commerce platform; AI/ML roles span recommendations, search ranking, demand forecasting, pricing, and fraud detection at very high scale. Expect a blend of ML depth, coding, and large-scale ML system design.',
    process: [
      { round: 'Recruiter screen', detail: 'Background, role interest, and a light check on ML experience; sometimes an online test on SQL, statistics, and logical reasoning.' },
      { round: 'ML fundamentals', detail: 'Supervised/unsupervised learning, evaluation metrics, feature engineering, regularization, and probability/statistics basics.' },
      { round: 'Coding / DSA', detail: 'Data structures and algorithms plus Python; for engineering-leaning roles, a machine-coding style exercise can appear.' },
      { round: 'ML system design / case', detail: 'A real-world e-commerce scenario (e.g. product recommendations or ranking): data curation, multi-stage retrieval-then-rank, model selection, handling scale, and trade-offs.' },
      { round: 'Hiring manager / behavioral', detail: 'Past projects in depth, decision-making, ownership, and culture fit.' },
    ],
    emphasis: [
      'End-to-end ML thinking on genuine e-commerce problems, not toy datasets',
      'Designing for extreme scale (flash sales, 500M+ users, latency)',
      'Clear trade-off reasoning between accuracy, cost, and latency',
      'Business impact and metric selection over raw modeling',
    ],
    focusAreas: [
      'Recommendation and ranking systems (retrieval + ranking stages)',
      'Feature engineering and evaluation metrics for conversion/CTR',
      'Data structures, algorithms, and Python coding',
      'ML system design under scale constraints',
      'Statistics and probability fundamentals',
    ],
    prep: 'Be ready to design a recommendation or ranking system end to end and defend metric choices; keep DSA and core ML fundamentals sharp, and prepare project stories with concrete impact.',
    sources: [
      { title: 'Flipkart Machine Learning Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/flipkart-machine-learning-engineer' },
      { title: 'Flipkart Data Scientist Interview Questions — Glassdoor India', url: 'https://www.glassdoor.co.in/Interview/Flipkart-Data-Scientist-Interview-Questions-EI_IE300494.0,8_KO9,23.htm' },
      { title: 'Flipkart Interview Guide (machine coding, DSA, system design) — OphyAI', url: 'https://ophyai.com/blog/company-guides/flipkart-interview-guide' },
    ],
  },

  'Swiggy': {
    overview: 'Food-delivery and quick-commerce marketplace; ML/DS roles cover ETA prediction, dynamic pricing, search, recommendations, and marketplace optimization. The loop mixes SQL/coding, ML depth, and applied ML system design on live delivery problems.',
    process: [
      { round: 'Recruiter screen', detail: 'Resume, background, motivation, and culture-fit conversation.' },
      { round: 'Technical assessment', detail: 'Online assessment (often HackerRank): SQL queries and sometimes a business case; can include a DSA question.' },
      { round: 'Coding round', detail: 'Python (functions, loops, exceptions, decorators, occasionally multithreading), Pandas (groupby), SQL with subqueries, and one easy-to-medium DSA problem.' },
      { round: 'ML depth / breadth', detail: 'Core statistics (mean/variance, CLT, Type I/II errors, variance of the sample mean) and probability, plus applied ML concepts.' },
      { round: 'Problem solving / ML system design', detail: 'Discussion of past work, then a real team problem — e.g. estimating delivery time or building dynamic search filters.' },
      { round: 'Hiring manager', detail: 'Strengths/weaknesses, project deep-dive, and alignment with Swiggy’s goals and values.' },
    ],
    emphasis: [
      'Applied ML on real marketplace/logistics problems',
      'Statistical rigor and the reasoning behind formulas, not just recall',
      'SQL and Python data-manipulation fluency',
      'Translating ambiguous business problems into models',
    ],
    focusAreas: [
      'SQL (subqueries, aggregation) and Pandas',
      'Python coding and light DSA',
      'Statistics and probability fundamentals',
      'ML system design for ETA / ranking / pricing',
      'Metric definition and experimentation thinking',
    ],
    prep: 'Practice SQL and Pandas until fluent, revise statistics you can prove (not just state), and prepare to design an ETA or ranking model grounded in delivery-marketplace realities.',
    sources: [
      { title: 'Swiggy Machine Learning Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/swiggy-machine-learning-engineer' },
      { title: 'Swiggy | Data Scientist 1 | Interview — LeetCode Discuss', url: 'https://leetcode.com/discuss/post/6740564/swiggy-data-scientist-1-interview-by-kus-uba1/' },
      { title: 'Swiggy Interview Experience for Data Scientist 1 — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-data-scientist-1-role/' },
    ],
  },

  'Sarvam AI': {
    overview: 'Bengaluru-based sovereign-AI startup building India-focused LLMs, speech (TTS/STT), and translation across research, models, and applications. Public interview signal is limited and skews assignment-heavy and research/engineering-leaning; treat specifics as indicative rather than fixed.',
    process: [
      { round: 'Assignment / induction', detail: 'Often a take-home or timed assignment; some reports describe a CTO-led “induction” giving ~2 problems in about an hour with LLM use allowed.' },
      { round: 'Technical (DSA + backend)', detail: 'Data structures, algorithms, and backend engineering; frequently probes the breadth of your reasoning and communication over deep trivia.' },
      { round: 'Assignment deep-dive', detail: 'Discussion of the assignment — code changes, design choices, and logic behind your solution.' },
      { round: 'HR / logistics', detail: 'Work hours, availability, notice period / NOC, and fit.' },
    ],
    emphasis: [
      'Hands-on building ability shown through the assignment',
      'Fluency with LLM tooling (prompting, structured outputs, function calling)',
      'Clear communication and breadth over narrow depth',
      'Comfort in a fast-moving, research-leaning environment',
    ],
    focusAreas: [
      'LLM application patterns: RAG (chunking, embeddings, reranking), agentic frameworks',
      'Data structures, algorithms, and backend fundamentals',
      'Practical LLM API usage and system integration',
      'Indian-language / multilingual and speech context (nice to have)',
    ],
    prep: 'Expect an assignment you must defend end to end; be fluent with LLM APIs and RAG/agent patterns, keep DSA and backend solid, and be ready to reason out loud about design choices.',
    sources: [
      { title: 'Careers — Sarvam AI (role requirements: LLM APIs, RAG, agents)', url: 'https://www.sarvam.ai/careers' },
      { title: 'Sarvam AI Interview Questions & Experiences — Glassdoor', url: 'https://www.glassdoor.com/Interview/SarvM-ai-Interview-Questions-E7826863.htm' },
      { title: 'Sarvam AI — Wikipedia (company, models, focus areas)', url: 'https://en.wikipedia.org/wiki/Sarvam_AI' },
    ],
  },

  'Razorpay': {
    overview: 'Payments and fintech infrastructure company; ML/DS roles focus on fraud/risk detection, payment success optimization, real-time ranking, and forecasting. The loop weights production-grade coding (Python/SQL/PySpark) alongside ML depth and system design.',
    process: [
      { round: 'Recruiter screen', detail: '~30-minute call on background, experience, motivation, and role/culture alignment.' },
      { round: 'Technical assessment', detail: 'Coding via platform or video: algorithms, Python, and ML concepts, with a production-implementation lens.' },
      { round: 'Coding (Python/SQL/PySpark)', detail: 'Progressively harder problems across Python, SQL, and PySpark.' },
      { round: 'System design + ML depth', detail: 'ML knowledge plus designing systems such as a real-time ranking engine for payment gateways; metrics like AUC/ROC, precision, recall.' },
      { round: 'Hiring manager', detail: 'Cultural fit, levelling, mentoring, communication, and long-term vision.' },
    ],
    emphasis: [
      'Production-quality code and data engineering (PySpark) fluency',
      'Real-time, low-latency ML system design for payments',
      'Solid grasp of classification metrics for fraud/risk',
      'Ownership and ability to ship into production',
    ],
    focusAreas: [
      'Python, SQL, and PySpark coding',
      'Algorithms and data structures',
      'Classification models and metrics (AUC, ROC, precision, recall)',
      'Real-time ranking / scoring system design',
      'Fraud and risk modeling context',
    ],
    prep: 'Sharpen Python/SQL/PySpark and be able to design a real-time scoring or ranking system for payments; revise classification metrics and prepare fraud/risk framing for your project stories.',
    sources: [
      { title: 'Razorpay Machine Learning Engineer Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/razorpay-machine-learning-engineer' },
      { title: 'Data Science Hiring and Interview Process at Razorpay — Analytics India Magazine', url: 'https://analyticsindiamag.com/ai-hiring/data-science-hiring-process-at-razorpay/' },
      { title: 'Razorpay Data Scientist Interview Questions — Glassdoor India', url: 'https://www.glassdoor.co.in/Interview/Razorpay-Data-Scientist-Interview-Questions-EI_IE1146550.0,8_KO9,23.htm' },
    ],
  },

  'PhonePe': {
    overview: 'Large-scale digital-payments platform; ML/DS roles span fraud, credit/risk, recommendations, and growth analytics on massive transaction data. The loop is coding-heavy (DSA, SQL) with strong statistics and applied ML depth, plus a hiring-manager round.',
    process: [
      { round: 'Online coding test', detail: 'Elimination round, typically ~3 coding problems over 80–90 minutes; for DS roles often split into ~30 min SQL and ~30 min technical/stats.' },
      { round: 'Technical interview 1', detail: 'Coding and DSA to assess implementation skill and problem-solving logic (60–90 min, medium–hard).' },
      { round: 'Technical interview 2', detail: 'Deeper technical round — DSA/DP, programming-language and systems fundamentals; for DS, ML and statistics depth (statistics can be rated hard).' },
      { round: 'Project / case discussion', detail: 'Deep-dive into past projects and applied case studies relevant to payments/fintech.' },
      { round: 'HR / hiring manager', detail: 'Behavioral and culture-fit questions plus company-specific values (45–70 min).' },
    ],
    emphasis: [
      'Strong DSA and coding under time pressure',
      'High bar on statistics for data-science roles',
      'SQL fluency on large transaction datasets',
      'Applied ML tied to fraud, risk, and growth',
    ],
    focusAreas: [
      'Data structures, algorithms, and dynamic programming',
      'SQL and query optimization',
      'Statistics and probability (rated demanding)',
      'Applied ML for fraud/risk and recommendations',
      'Systems / OS fundamentals for engineering roles',
    ],
    prep: 'Drill DSA and SQL heavily, and — for DS roles — go deep on statistics; prepare project case studies framed around payments fraud, risk, or growth metrics.',
    sources: [
      { title: 'Data Science Hiring Process at PhonePe — Analytics India Magazine', url: 'https://analyticsindiamag.com/data-science-hiring-process-at-phonepe/' },
      { title: 'PhonePe Interview Questions & Answers — Glassdoor India', url: 'https://www.glassdoor.co.in/Interview/PhonePe-Interview-Questions-E2289138.htm' },
      { title: 'My PhonePe Data Scientist Interview Experience — Medium (Sania Qamar)', url: 'https://medium.com/@sq.sania/my-phonepe-data-scientist-interview-experience-questions-learnings-and-insights-ff0c0ddf1733' },
    ],
  },

  'Fractal Analytics': {
    overview: 'AI and advanced-analytics services firm delivering ML/DS solutions to enterprise (often Fortune 500) clients; roles are applied and consulting-flavored. The loop weights ML fundamentals, statistics, and the ability to explain complex ideas simply to senior stakeholders.',
    process: [
      { round: 'Online assessment', detail: 'MCQ + coding (often DoSelect): Python, SQL, and applied ML (e.g. k-NN, Random Forest, ReLU, image-processing basics).' },
      { round: 'Technical interview', detail: 'In-depth ML and NLP concepts with the math/statistics behind them, scenario-based questions, and live coding tied to your resume projects.' },
      { round: 'Senior executive round', detail: 'Often with a VP of AI: project depth, skill alignment with Fractal’s work, interests, and long-term goals; explaining complex concepts simply.' },
      { round: 'HR round', detail: 'Behavioral / culture-fit, reasons for change, long-term goals, and compensation (agenda is fairly fixed).' },
    ],
    emphasis: [
      'Fundamental ML and the math/statistics underneath it',
      'Communicating complex ideas simply (consulting/client lens)',
      'Depth on the exact techniques listed on your resume',
      'Applied problem-solving on real-world datasets',
    ],
    focusAreas: [
      'Core ML algorithms (regression, k-NN, Random Forest) and metrics',
      'Statistics and the theory behind techniques',
      'Python and SQL',
      'NLP concepts and case-study problem solving',
      'Business/consulting framing of analytics problems',
    ],
    prep: 'Know your resume projects cold and the math behind every technique you list; practice explaining models simply, and revise core ML plus a couple of applied case studies (e.g. classification on tabular data).',
    sources: [
      { title: 'Fractal Analytics Data Scientist Interview Guide — InterviewQuery', url: 'https://www.interviewquery.com/interview-guides/fractal-analytics-data-scientist' },
      { title: 'Fractal Data Scientist Interview Questions — Glassdoor India', url: 'https://www.glassdoor.co.in/Interview/Fractal-Data-Scientist-Interview-Questions-EI_IE270403.0,7_KO8,22.htm' },
      { title: 'Fractal Analytics Interview Experience for Data Science — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/interview-experiences/fractal-analytics-interview-experience-for-data-science/' },
    ],
  },
};
