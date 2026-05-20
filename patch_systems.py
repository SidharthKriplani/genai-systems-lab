filepath = "/sessions/intelligent-wizardly-ptolemy/mnt/GitHub--genai-systems-lab/src/Systems.jsx"
with open(filepath, 'r') as f:
    content = f.read()

# 1. Insert AGENT_EVAL_CASES data + AgentEvalLab component just before "function GradingTool()"
agent_eval_insert = r"""const AGENT_EVAL_CASES = [
  {
    id: "ae1",
    title: "Tool Call Precision",
    scenario: "A research agent is given: 'Find the current price of NVIDIA stock and calculate its P/E ratio given Q4 earnings of $19.2B and 2.46B shares outstanding.' It makes 3 tool calls: search_web('NVIDIA stock price'), calculate(19200/2460), search_web('NVIDIA P/E ratio current').",
    question: "What's wrong with this tool call sequence?",
    dimensions: [
      { label: "Tool precision", score: 2, why: "The third call (searching for P/E) is redundant — the agent already has all inputs to calculate it. This wastes tokens and latency." },
      { label: "Correctness", score: 1, why: "calculate(19200/2460) computes EPS correctly. But P/E = Price/EPS, and the agent never actually computes the final answer — it searches for what it already can calculate." },
      { label: "Efficiency", score: 1, why: "3 tool calls when 2 suffice. At scale, this 33% overhead compounds significantly." },
    ],
    lesson: "Tool call precision = (necessary calls) / (total calls). A well-designed agent should never search for something it can compute, and never compute something it can look up more accurately.",
  },
  {
    id: "ae2",
    title: "Trajectory Efficiency",
    scenario: "An agent tasked with 'Schedule a meeting with John for next Tuesday at 3pm' takes 7 steps: check_calendar(John), check_calendar(self), find_overlap, check_calendar(John) again, create_event(draft), send_invite, check_calendar(John) a third time to confirm.",
    question: "Score the trajectory quality.",
    dimensions: [
      { label: "Redundancy", score: 1, why: "check_calendar(John) is called 3 times. A well-designed agent reads state once and maintains it in context." },
      { label: "Task completion", score: 3, why: "The task was completed correctly — meeting scheduled and invite sent." },
      { label: "Trajectory efficiency", score: 2, why: "5 unique steps were necessary; 2 were redundant. Efficiency = 5/7 = 71%. Target is >85% for production agents." },
    ],
    lesson: "Trajectory efficiency = (minimum steps to complete) / (actual steps taken). Track this metric in your agent observability stack. Sudden drops signal prompt regression or tool reliability issues.",
  },
  {
    id: "ae3",
    title: "Graceful Failure",
    scenario: "A customer support agent encounters a database timeout when fetching order details. It responds: 'I'm having trouble accessing your order right now. I've logged this as a priority issue (ticket #48291). You'll receive an email confirmation within 2 hours, and our team will follow up if needed. Is there anything else I can help with?'",
    question: "Evaluate the failure handling quality.",
    dimensions: [
      { label: "User experience", score: 3, why: "Gives the user a ticket number, timeline, and next steps. Doesn't expose technical details. Offers alternative help." },
      { label: "Transparency", score: 3, why: "Acknowledges the problem honestly without over-explaining. Doesn't pretend it succeeded." },
      { label: "Recovery path", score: 2, why: "Creates a ticket but no evidence of retry logic or escalation trigger. For a database timeout, a single retry after 500ms is standard." },
    ],
    lesson: "Graceful failure = acknowledge + contain + recover. The agent handled user communication well but missing retry logic means transient failures become permanent failures unnecessarily.",
  },
  {
    id: "ae4",
    title: "Hallucination in Reasoning",
    scenario: "A code review agent says: 'This function has O(n²) complexity because of the nested loop. However, since Python’s list.index() also runs in O(n), the actual complexity is O(n³).' The code has a nested loop but no list.index() call.",
    question: "What type of eval failure is this and how would you catch it?",
    dimensions: [
      { label: "Factual grounding", score: 1, why: "The agent hallucinated a list.index() call that doesn't exist. This is object hallucination — fabricating code elements." },
      { label: "Reasoning validity", score: 1, why: "The conclusion (O(n³)) is wrong because it's based on a fabricated premise. The correct answer was O(n²) from the actual nested loop." },
      { label: "Catchability", score: 2, why: "Catchable with a code-grounding eval: for each claim about the code, verify the referenced element exists. LLM-as-judge with 'cite the line number' instruction catches ~80% of this pattern." },
    ],
    lesson: "Code review agents need grounding checks: every claim about the code must reference an actual line. Eval harness: extract all code-element references from agent output, verify against AST.",
  },
];

function AgentEvalLab() {
  const [caseIdx, setCaseIdx] = useState(0);
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const ac = AGENT_EVAL_CASES[caseIdx];
  const allScored = ac.dimensions.every((_, i) => scores[i] !== undefined);
  const scoreLabels = { 1: "Poor", 2: "Partial", 3: "Good" };

  function setScore(dimIdx, val) {
    if (!submitted) setScores(prev => ({ ...prev, [dimIdx]: val }));
  }

  function submit() {
    if (!allScored) return;
    const correct = ac.dimensions.filter((d, i) => scores[i] === d.score).length;
    setTotalCorrect(correct);
    setSubmitted(true);
  }

  function nextCase() {
    setCaseIdx(i => (i + 1) % AGENT_EVAL_CASES.length);
    setScores({});
    setSubmitted(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Grade agent behavior across key quality dimensions. These cases cover tool precision, trajectory efficiency, failure handling, and hallucination detection — the four most important axes for production agent evals.</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {AGENT_EVAL_CASES.map((_, i) => (
            <button key={i} onClick={() => { setCaseIdx(i); setScores({}); setSubmitted(false); }}
              className={`w-7 h-7 rounded text-xs font-bold transition-all ${caseIdx === i ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {i + 1}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500 font-mono">CASE {caseIdx + 1}/{AGENT_EVAL_CASES.length}</span>
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-900/60 text-violet-300 border border-violet-800">{ac.title}</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="rounded bg-zinc-950 border border-zinc-800 p-3">
            <div className="text-zinc-500 font-bold mb-1">SCENARIO</div>
            <div className="text-zinc-300 leading-relaxed">{ac.scenario}</div>
          </div>
          <div className="rounded bg-violet-950/30 border border-violet-800/50 p-3">
            <div className="text-violet-400 font-bold mb-1">EVAL QUESTION</div>
            <div className="text-zinc-300">{ac.question}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Grade each dimension (1=Poor · 2=Partial · 3=Good)</div>
          {ac.dimensions.map((dim, i) => (
            <div key={i} className="space-y-1">
              <div className="text-xs font-bold text-white">{dim.label}</div>
              <div className="flex gap-2">
                {[1, 2, 3].map(v => {
                  const selected = scores[i] === v;
                  const isCorrect = submitted && v === dim.score;
                  const isWrong = submitted && selected && v !== dim.score;
                  return (
                    <button key={v} onClick={() => setScore(i, v)}
                      className={`flex-1 py-2 rounded text-xs font-bold transition-all ${
                        isCorrect ? "bg-emerald-900/60 border border-emerald-600 text-emerald-300" :
                        isWrong ? "bg-red-900/40 border border-red-700 text-red-300" :
                        selected ? "bg-zinc-700 border border-zinc-500 text-white" :
                        "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white"
                      }`}>
                      {v} · {scoreLabels[v]}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className={`text-xs p-2 rounded leading-relaxed ${scores[i] === dim.score ? "bg-emerald-950/40 text-emerald-300" : "bg-amber-950/40 text-amber-300"}`}>
                  <span className="font-bold">Expert ({dim.score}/3): </span>{dim.why}
                </div>
              )}
            </div>
          ))}
        </div>

        {!submitted ? (
          <button onClick={submit} disabled={!allScored}
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${allScored ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}>
            Submit grades
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`rounded-lg p-4 text-center ${totalCorrect === ac.dimensions.length ? "bg-emerald-900/40 border border-emerald-700" : totalCorrect >= 2 ? "bg-amber-900/40 border border-amber-700" : "bg-red-900/40 border border-red-700"}`}>
              <div className={`text-2xl font-black ${totalCorrect === ac.dimensions.length ? "text-emerald-300" : totalCorrect >= 2 ? "text-amber-300" : "text-red-300"}`}>{totalCorrect}/{ac.dimensions.length}</div>
              <div className="text-xs text-zinc-400 mt-1">{totalCorrect === ac.dimensions.length ? "Expert calibration on agent evals" : totalCorrect >= 2 ? "Close — review the dimension you missed" : "Review the expert reasoning carefully"}</div>
            </div>
            <div className="rounded-lg bg-violet-950/30 border border-violet-800 p-3">
              <div className="text-xs font-bold text-violet-300 mb-1">Key Lesson</div>
              <p className="text-xs text-zinc-300 leading-relaxed">{ac.lesson}</p>
            </div>
            <button onClick={nextCase} className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold transition-all">
              Next case →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"""

# Insert before GradingTool function
old_grading = "function GradingTool() {"
new_grading = agent_eval_insert + "function GradingTool() {"

if old_grading in content:
    content = content.replace(old_grading, new_grading, 1)
    print("Step 1 OK: AgentEvalLab inserted")
else:
    print("Step 1 FAIL: GradingTool not found")

# 2. Add "Agent Evals" to EvalsLab TABS
old_tabs = '    { id: "postmortem", label: "Real Postmortems" },\n  ];'
new_tabs = '    { id: "postmortem", label: "Real Postmortems" },\n    { id: "agent_evals", label: "Agent Evals", tag: "NEW" },\n  ];'

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs, 1)
    print("Step 2 OK: agent_evals tab added to TABS")
else:
    print("Step 2 FAIL: TABS pattern not found")

# 3. Add tab button render for "NEW" tag in the tab nav loop
# The TABS loop renders buttons — we need to handle the optional "tag" prop
# Check existing tab button render
old_tab_btn = '''        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}'''
new_tab_btn = '''        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {tab.label}
            {tab.tag && <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${activeTab === tab.id ? "bg-indigo-500 text-indigo-100" : "bg-zinc-700 text-zinc-400"}`}>{tab.tag}</span>}
          </button>
        ))}'''

if old_tab_btn in content:
    content = content.replace(old_tab_btn, new_tab_btn, 1)
    print("Step 3 OK: tab button updated to support tag prop")
else:
    print("Step 3 FAIL: tab button pattern not found")

# 4. Add agent_evals tab render inside EvalsLab
old_postmortem_render = "      {activeTab === \"postmortem\" && ("
new_postmortem_render = "      {activeTab === \"agent_evals\" && <AgentEvalLab />}\n\n      {activeTab === \"postmortem\" && ("

if old_postmortem_render in content:
    content = content.replace(old_postmortem_render, new_postmortem_render, 1)
    print("Step 4 OK: agent_evals render added")
else:
    print("Step 4 FAIL: postmortem render pattern not found")

with open(filepath, 'w') as f:
    f.write(content)
print("DONE")
