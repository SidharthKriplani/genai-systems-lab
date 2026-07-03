// L2 case chains — Evaluation domain.
// Schema documented in src/data/caseChains.js (the aggregator). Keep the export
// name EVAL_CASE_CHAINS; the aggregator imports it by that name.
export const EVAL_CASE_CHAINS = [
  {
    id: "chain-llm-judge-green-signals",
    domain: "eval",
    subtopic: "position bias → verbosity bias → offline/online gap → judge-human calibration",
    level: "staff",
    type: "casechain",
    title: "The judge says ship — chase the LLM-as-judge failure down four layers",
    context: [
      "A support-assistant team uses an LLM-as-judge pipeline to gate model releases. GPT-4-class judge scores each candidate reply in pairwise comparison (candidate vs. current-prod baseline) and reports a win-rate.",
      "Eval set: 500 frozen prompts sampled once, six months ago. Judge prompt: 'Which response is better, A or B? Answer A or B.' Candidate is always passed as A, baseline as B.",
      "The last three model versions each scored 68–74% win-rate offline. Every one was green-lit. Two of the three moved no real user metric; one regressed CSAT by 4 points in production.",
      "There is no human-labelled ground truth for the judge. The team treats judge win-rate as the release metric of record.",
    ],
    steps: [
      {
        symptom: "The judge reports a 71% win-rate for the candidate — but the candidate is always shown as option A.",
        evidence: [
          "Candidate is passed as A on 100% of the 500 comparisons; baseline is always B.",
          "A quick sanity run — judge two IDENTICAL responses against each other (same text as A and B) — returns 'A is better' on 64% of pairs.",
          "When the team hand-picks 30 pairs where a human rated B clearly better, the judge still calls A the winner on 19 of them.",
        ],
        question: "The judge prefers A even when A and B are identical. What is the first structural fault in this eval?",
        options: [
          { id: "a", text: "The judge model is too weak — upgrade to a larger judge model to get more reliable preferences" },
          { id: "b", text: "Position/order bias: the judge systematically favours whichever response occupies the first slot, and because the candidate is ALWAYS slot A, the win-rate is inflated by a constant the eval never controls for" },
          { id: "c", text: "The prompt set is too small — 500 pairs isn't enough to estimate win-rate, so add more prompts" },
          { id: "d", text: "The baseline is genuinely worse — the 71% is real and the candidate should ship" },
        ],
        correct: "b",
        finding:
          "The identical-pair probe is the tell: with A and B textually equal, a fair judge returns ~50% A / ~50% B; this judge returns 64% A. That 14-point excess is pure position bias — the judge attends to slot order as if it were a quality signal. Because the pipeline pins the candidate to slot A on every comparison, that bias adds a fixed tailwind to the candidate's win-rate. A bigger judge (option a) exhibits the same bias, often just as strongly. More prompts (option c) estimates a biased number more precisely — it does not remove the bias. The 71% is not a clean preference (option d); it is preference plus a position artefact.",
        whatsTested: "Whether you probe the judge for order sensitivity before trusting its verdicts — and recognise that a fixed A/B assignment converts a per-comparison bias into a systematic scoring inflation.",
        antiPattern: "Upgrading the judge model or enlarging the prompt set to 'make the number more trustworthy.' Both leave the position artefact fully intact; you get a more confident wrong answer.",
        seniorFraming: "A staff engineer never reads a pairwise win-rate without an order-symmetry control. The fix is to swap A/B and re-judge every pair, then average the two orderings (or count a win only when the judge agrees in both orders). Position bias should be measured and reported, not assumed away.",
        consequence:
          "You randomise A/B order and re-judge each pair in both positions, keeping only order-consistent wins. The candidate's win-rate falls 71% → 58% — still above 50%, so it looks like a real (if smaller) gain. But when you break the surviving wins down, a new pattern jumps out: the candidate's winning replies are on average 2.3× longer than the baseline's.",
      },
      {
        symptom: "With order controlled, the candidate still 'wins' — but its winning answers are 2.3× longer than the baseline's.",
        evidence: [
          "Order-consistent win-rate: 58%. Median candidate reply length among wins: 240 words vs. baseline 105 words.",
          "Length-stratified breakdown: when candidate and baseline replies are within 20% of each other in length, the win-rate is 51% (a toss-up). The 58% aggregate is carried almost entirely by the long-answer stratum.",
          "A blind human spot-check of 40 long candidate 'wins' finds that 15 are actually padded, partly off-topic, or contain an extra unsupported claim — yet the judge scored them higher.",
        ],
        question: "The win-rate survives order control but tracks answer length. What is the eval rewarding?",
        options: [
          { id: "a", text: "Longer answers are genuinely more helpful — verbosity is a real quality signal, so ship the candidate" },
          { id: "b", text: "Verbosity/length bias: the judge conflates length and thoroughness with correctness, so a model that simply writes more accumulates wins regardless of whether the extra text is right — and length-stratification shows the real signal is ~50/50" },
          { id: "c", text: "The judge is now under-rating the baseline — swap the judge for a stricter model that penalises long answers" },
          { id: "d", text: "The prompt itself is too open-ended — constrain prompts so answers are naturally short" },
        ],
        correct: "b",
        finding:
          "Length-stratification is the diagnostic: hold length roughly equal and the preference collapses to 51% — a coin flip. That means the entire aggregate edge lives in the long-answer stratum, i.e. the judge is paying for words, not correctness. LLM judges have a well-documented verbosity bias: more text reads as more thorough, more authoritative, more 'complete', and the judge rewards it even when the extra tokens are padding or add an unsupported claim (15/40 in the human check). Verbosity is not a clean quality signal here (option a) — the human audit disproves it. Swapping to a length-penalising judge (option c) trades one uncontrolled bias for another and can punish legitimately thorough answers. The fix is to control for length, not to constrain the task (option d).",
        whatsTested: "Whether you separate 'the judge prefers this' from 'this is correct' — and know to stratify or length-normalise before believing a pairwise edge, rather than reading verbosity as thoroughness.",
        antiPattern: "Accepting the 58% because the answers 'look more complete', or over-correcting with a blanket length penalty. Both skip the actual question — is the additional content correct? — which only a rubric or human check answers.",
        seniorFraming: "Staff-level judge design pins down what 'better' means before scoring: a rubric (correctness, groundedness, relevance, conciseness) scored per-criterion, plus length as a reported covariate you stratify on. You want the judge measuring correctness at fixed length, not rewarding token count.",
        consequence:
          "You add a rubric — correctness and groundedness scored explicitly, conciseness rewarded, length reported and stratified. Now the candidate and baseline sit at a genuine ~50/50 on the frozen set, and you also start seeing judge scores CLIMB across the next two model versions. Leadership is happy — until you overlay production: offline judge quality is rising while online CSAT and resolution-rate are flat.",
      },
      {
        symptom: "Offline judge scores keep rising across versions — but the online user metrics they're supposed to predict do not move.",
        evidence: [
          "Over three versions: offline rubric score 72 → 79 → 84. Same window in production: CSAT flat within noise, first-contact-resolution flat.",
          "The eval set is the same 500 prompts frozen six months ago. Since then the product added two features and a new billing flow; ~35% of live traffic is now about topics with zero coverage in the frozen set.",
          "Three of the frozen prompts (with their ideal answers) were pasted into a public prompt-library the team also used to iterate the model — the model has effectively seen them.",
          "The frozen set over-represents easy FAQ-style questions (short, single-intent) and under-represents the multi-turn billing disputes that dominate low-CSAT sessions.",
        ],
        question: "The judge is now well-behaved, yet offline gains don't reach users. What is the fault in the eval, not the judge?",
        options: [
          { id: "a", text: "The rubric is still wrong — keep tuning the rubric weights until offline score correlates with CSAT" },
          { id: "b", text: "Offline/online gap from a stale, unrepresentative, partly-contaminated eval set: it no longer mirrors live traffic (35% of topics absent), over-weights easy FAQs, and includes leaked prompts — so the score improves on a distribution users no longer live in" },
          { id: "c", text: "CSAT is just a noisy metric — ignore production and trust the offline score" },
          { id: "d", text: "The judge is overfitting to the candidate — rotate to a different judge model each release" },
        ],
        correct: "b",
        finding:
          "A well-calibrated judge answers 'is this response good on THIS prompt?' It cannot fix a prompt set that no longer represents reality. Three distinct data faults compound here: (1) staleness — 35% of live topics have zero coverage, so gains on the frozen distribution simply don't transfer; (2) sampling skew — the set over-represents easy FAQs and under-represents the hard multi-turn billing disputes that actually drive low CSAT, so the model can climb the score by getting better at questions users rarely ask; (3) contamination — leaked prompts mean part of the 'gain' is memorisation, not capability. Tuning rubric weights (option a) optimises a metric on the wrong data. Dismissing CSAT (option c) discards the only ground-truth signal you have. Rotating judges (option d) addresses judge overfit, which is not the failure — the eval SET is.",
        whatsTested: "Whether you distinguish a judge problem from a dataset problem, and know that offline eval validity rests on the eval set tracking live traffic (freshness), covering the hard strata (representativeness), and being leakage-checked — not on judge quality alone.",
        antiPattern: "Trusting a rising offline curve because the judge is now sound. A clean judge on a stale/skewed/contaminated set produces confident, useless green signals — the classic 'our evals are green, why are users unhappy?' trap.",
        seniorFraming: "A staff engineer treats the eval set as a living, versioned artefact: refresh it on a cadence from real traffic, stratify sampling so hard/rare-but-costly segments (multi-turn billing) are represented in proportion to their business impact, hold out a leakage-checked slice never used for iteration, and continuously validate that offline score correlates with the online outcome it's meant to predict.",
        consequence:
          "You rebuild the eval set: fresh stratified sampling from the last 30 days, billing-dispute and multi-turn segments up-weighted to match their CSAT impact, and a leakage audit that quarantines any prompt seen during iteration. Offline score now tracks CSAT far more tightly. But one assumption is still unaudited: nobody has ever checked whether the judge's verdicts agree with humans on this fresh, harder set — and the judge is the same model family the team ships.",
      },
      {
        symptom: "The eval set is fresh and representative — but the judge's verdicts have never been checked against humans, and it judges its own model family.",
        evidence: [
          "On the new, harder billing-dispute segment, the judge scores the shipped model 82. A blind panel of three senior support agents, scoring the same outputs on the same rubric, rates them 63 — a 19-point gap concentrated on exactly this segment.",
          "The judge is the same model family as the candidate it evaluates. On head-to-head pairs of {own-family reply, rival-family reply} that humans rated as ties, the judge picks its own family 68% of the time.",
          "Inter-annotator agreement among the three humans is high (Cohen's κ ≈ 0.79), so the human signal is stable — the disagreement is judge-vs-human, not human noise.",
          "Aggregate judge-human agreement across ALL segments looks fine (81%), which is why the gap went unnoticed: the easy strata mask the hard-segment disagreement — a Simpson's-paradox-style average.",
        ],
        question: "Fresh data, sound rubric, controlled biases — yet the judge silently disagrees with humans on the segment that matters. What is the final missing layer?",
        options: [
          { id: "a", text: "The humans are wrong — their κ is high but they're too harsh; trust the judge's 82 and ship" },
          { id: "b", text: "No human calibration / self-preference bias: the judge has never been anchored to human ground truth, it favours its own model family on genuine ties, and a healthy AGGREGATE agreement hides a large disagreement on the hard segment — so the judge is an uncalibrated, conflicted instrument" },
          { id: "c", text: "Agreement is 81% overall, which is acceptable — no further calibration is needed" },
          { id: "d", text: "Replace the three human agents with the judge entirely to remove human subjectivity from the loop" },
        ],
        correct: "b",
        finding:
          "Two faults close the chain. First, self-preference: judging a reply from your own model family, the judge picks itself 68% of the time on pairs humans call ties — a systematic conflict of interest baked into using a same-family judge as the release gate. Second, and more fundamental, there is no calibration anchor: the judge's number has never been regressed against human ground truth, so nobody knew a 19-point judge-human gap existed on billing disputes. The 81% aggregate agreement is a Simpson's-paradox trap — easy strata (where judge and humans trivially agree) dominate the average and mask the hard-segment disagreement that actually drives releases. The humans aren't the problem (option a): κ ≈ 0.79 means they agree with each other; it's the judge that diverges. 'Overall 81% is fine' (option c) is exactly the aggregation trap. Replacing humans with the judge (option d) removes the only ground truth you have — the reverse of calibration.",
        whatsTested: "Whether you close the loop by anchoring the judge to human labels — measuring judge-human agreement PER SEGMENT (not just in aggregate), avoiding self-preference by using a cross-family judge, and treating stratified agreement as the release gate rather than an unaudited judge score.",
        antiPattern: "Trusting a high aggregate judge-human agreement number. Averaging over easy and hard strata hides the disagreement on precisely the segment that determines whether a release helps or hurts users — the Simpson's-paradox failure that lets a conflicted judge sign off on a regression.",
        seniorFraming: "Staff-level evaluation makes the judge an instrument you calibrate, not an oracle you trust: maintain a rolling human-labelled anchor set with measured inter-annotator agreement, report judge-human agreement stratified by segment, use a cross-family judge to neutralise self-preference, and gate releases on human-anchored agreement on the hard segments — never on a raw, aggregate judge win-rate.",
        consequence: null,
      },
    ],
    diagnosis:
      "An LLM-as-judge release gate that produced confident green signals while being biased, mis-targeted, and uncalibrated at every layer: fixed-slot position bias inflated the win-rate, verbosity bias rewarded length over correctness, a stale/skewed/contaminated eval set made offline gains that never reached users, and an uncalibrated same-family judge silently disagreed with humans on the one segment that mattered — hidden by a healthy-looking aggregate agreement.",
    explanation:
      "The chain compounds because each fix exposes the next masked fault. Controlling position bias (swap A/B, order-consistent wins) shrank the win-rate and revealed that the remaining edge tracked answer length — verbosity bias. Controlling length with a rubric produced a clean judge, which then let a rising offline score expose that the eval SET, not the judge, was the problem: stale, FAQ-skewed, and partly leaked, so gains didn't transfer to production. Rebuilding the set to mirror live traffic finally exposed the deepest fault — the judge had never been calibrated against humans, carried a self-preference for its own model family, and its 19-point disagreement on billing disputes was hidden by an 81% aggregate agreement (a Simpson's-paradox average). No single number — least of all the pairwise win-rate — could reveal this stack; each layer only became visible once the one above it was controlled. That layered dependency is exactly what a staff evaluation interview probes.",
    fix:
      "Build LLM-as-judge as an audited instrument, not a single win-rate: (1) control position bias by randomising and swapping A/B and counting only order-consistent wins (or averaging both orderings); (2) control verbosity by scoring an explicit rubric — correctness, groundedness, relevance, conciseness — and stratifying or normalising on length so you measure quality at fixed length; (3) treat the eval set as a living, versioned artefact — refresh from recent traffic on a cadence, stratify sampling so hard/costly segments (multi-turn billing) are represented by business impact, and hold out a leakage-checked slice never used for iteration; (4) calibrate the judge against a rolling human-labelled anchor set with measured inter-annotator agreement, report judge-human agreement PER SEGMENT (never trust the aggregate — it hides Simpson's-paradox disagreement), use a cross-family judge to neutralise self-preference, and gate releases on human-anchored agreement on the hard segments plus a confirmed offline↔online correlation. Prefer pointwise rubric scoring with calibration over raw pairwise win-rate when the ranking must survive contact with production.",
    source: "Authored · GSL L2 Case Chain",
  },
];
