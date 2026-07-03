// GSL premium-niche track — Code Generation / AI Coding Assistants (SKELETON, executed 2026-07-03)
// RUNNER_DATA fragment. Spread into src/data/foundationsRunnerData.js via ...RUNNER_CODE_GEN.
// SKELETON HONESTY: real title/scenario + spec outline + "🚧 In development" marker. No MCQs yet.
// Keep the export name RUNNER_CODE_GEN. Additive only.

const DEV = "🚧 In development — outline below. This module is a specced scaffold, not finished teaching content yet. The scenario and numbered outline show exactly what it will cover once authored.";

export const RUNNER_CODE_GEN = {
  "codegen-model-training-fim": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " You're interviewing for an applied AI role at a company building a coding assistant. They ask: why can't a coding model just use next-token prediction like a chat model? Explain how code models are actually trained and why fill-in-the-middle (FIM) matters for autocomplete.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Why code is different from prose: exact syntax, long-range structure, and the editor use-case (you complete code with context AFTER the cursor, not just before).",
      "2. Fill-in-the-Middle (FIM): the training transform that splits a document into prefix/middle/suffix and reorders it (PSM / SPM) so a left-to-right model learns to infill given both sides — the core trick behind good autocomplete.",
      "3. Code-specific pretraining: dedup, license filtering, near-dup removal, and why data quality dominates (The Stack, permissive-license corpora).",
      "4. Tokenization for code: whitespace/indentation handling, why byte-level BPE matters, and fill-in-tokens / sentinel tokens.",
      "5. Instruction + repo-aware fine-tuning: turning a base code model into an assistant that follows edit instructions.",
      { type: "illustration", label: "Planned FIM transform illustration (to be built)", content:
`Original file:              prefix | <cursor> | suffix
FIM (PSM ordering) target:  <PRE> prefix <SUF> suffix <MID> middle
  -> model learns to predict the MIDDLE given prefix AND suffix,
     which is exactly what editor autocomplete needs.` },
      "6. Interview canon: 'how are code models trained', 'what is FIM and why', 'why does code need special tokenization', 'how do you build autocomplete'.",
    ],
    takeaway: "SKELETON: Code models add fill-in-the-middle (FIM) training so a left-to-right LM can infill using context on both sides of the cursor — the basis of autocomplete. Data quality (dedup, licensing) dominates. Full content + interactive coming.",
  },

  "codegen-repo-context-retrieval": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " Your coding assistant works on single files but fails on a 200k-LOC repo it's never seen — it invents functions that don't exist and misses the right file to edit. Design the repo-level context / retrieval layer that feeds the model the RIGHT code.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. The core problem: the relevant code doesn't fit in context. You must RETRIEVE the right files/symbols before generating.",
      "2. Retrieval strategies for code: BM25/lexical (great for identifiers), dense embeddings (semantic), and STRUCTURAL retrieval via the dependency graph / call graph / imports — hybrid beats any single method.",
      "3. Chunking code well: function/class-level chunks (AST-aware) instead of naive fixed windows, and why symbol boundaries matter.",
      "4. Context assembly: file-level relevance scoring, dedup, and packing — fitting a large repo into a bounded window (the SWE-bench scaffold problem).",
      "5. Grounding to prevent hallucinated APIs: giving the model real signatures/types so it edits real symbols, not invented ones.",
      { type: "illustration", label: "Planned hybrid code-retrieval flow (to be built)", content:
`Issue/prompt
   -> lexical (BM25 over identifiers + issue text)
   -> dense (semantic embedding of code chunks)
   -> structural (imports / call graph / definitions)
   -> fuse + rank + dedup -> pack into context window -> generate edit` },
      "6. Interview canon: 'how do you give an LLM context on a huge repo', 'why hybrid retrieval for code', 'how do you chunk code', 'how do you stop hallucinated APIs'.",
    ],
    takeaway: "SKELETON: Repo-level coding is a retrieval problem — fuse lexical + dense + structural (call-graph) signals, chunk at AST/symbol boundaries, and ground on real signatures to avoid hallucinated APIs. Full content + interactive coming.",
  },

  "codegen-agentic-loops": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " A single LLM call can't fix a real GitHub issue reliably. Modern SWE agents run a LOOP — locate, edit, run tests, read the failure, retry. Design that agentic coding loop and explain why it beats one-shot generation.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Why one-shot fails and a loop wins: real fixes need feedback from the environment (test output, compiler errors, stack traces).",
      "2. The SWE-agent loop: localize (retrieval) → propose edit → apply → run tests/build → observe failure → revise. Tools: file read/write, shell, test runner, search.",
      "3. Planning + subgoal decomposition for multi-file changes, and holding state across a long session.",
      "4. Guardrails on autonomy: sandboxing, diff review, cost/step limits, and knowing when to stop (avoid infinite retry loops).",
      "5. Where agents plateau: flaky tests, ambiguous specs, and cross-file refactors that break three other places.",
      { type: "illustration", label: "Planned agentic coding loop (to be built)", content:
`  +--> localize (retrieve relevant files)
  |         |
  |     propose + apply edit
  |         |
  |     run tests / build
  |         |
  |     read failure -----+
  +---------(retry)-------+   until: tests pass OR step/cost limit hit` },
      "6. Interview canon: 'design a SWE agent', 'why a loop vs one-shot', 'how do you use test feedback', 'how do you prevent runaway agents'.",
    ],
    takeaway: "SKELETON: Agentic coding replaces one-shot generation with a localize→edit→test→observe→retry loop grounded in real environment feedback, plus guardrails (sandbox, step/cost limits). Full content + interactive coming.",
  },

  "codegen-eval-passk-swebench": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " Your team claims the new coding model is '30% better'. Better on what? You need to explain pass@k, why it's noisy, and what SWE-bench actually measures versus toy benchmarks like HumanEval.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. pass@k defined: probability that at least one of k sampled solutions passes the tests, and the unbiased estimator — why reporting pass@1 vs pass@10 changes the story.",
      "2. Functional correctness via hidden test suites (HumanEval/MBPP) and why passing tests ≠ correct/secure/maintainable code.",
      "3. SWE-bench: fixing REAL GitHub issues in REAL repos, evaluated by the repo's own test suite — the leap from 'write a function' to 'navigate and patch a codebase'. SWE-bench Verified as the cleaned subset.",
      "4. Benchmark contamination + overfitting: train/test leakage from public repos, and why leaderboard numbers can mislead (Goodhart).",
      "5. Beyond pass rate: agent benchmarks (multi-file, terminal, polyglot), and evaluating the loop, not just the model.",
      { type: "illustration", label: "Planned benchmark ladder (to be built)", content:
`HumanEval / MBPP   ->  single function, self-contained,     pass@k
SWE-bench           ->  real issue in real repo,             repo test suite
SWE-bench Verified  ->  human-cleaned subset (solvable),     repo test suite
Agent benchmarks    ->  multi-file / terminal / polyglot,    task success` },
      "6. Interview canon: 'what is pass@k', 'why is it noisy', 'what does SWE-bench measure', 'why do benchmark numbers mislead'.",
    ],
    takeaway: "SKELETON: pass@k measures functional correctness over k samples; SWE-bench raises the bar to patching real repos judged by real tests. Contamination and Goodhart make raw leaderboard numbers suspect. Full content + interactive coming.",
  },

  "codegen-security-sandboxing": {
    depthTier: "deep",
    interviewWeight: "medium",
    scenario: DEV + " Your coding agent can run shell commands and write files. Security asks: what stops it from leaking secrets, running malicious code from a poisoned repo, or shipping vulnerable code? Design the safety layer for a code-executing agent.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. The threat model: prompt injection from repo files / issues (a malicious README instructing the agent), untrusted code execution, and secret exfiltration.",
      "2. Sandboxing + isolation: ephemeral containers, no-network or allowlist egress, least-privilege file access, and resource limits.",
      "3. Generated-code risk: models reproduce insecure patterns (SQL injection, hardcoded secrets, unsafe deserialization) from training data — why you need SAST/scanning on agent output.",
      "4. Supply-chain + dependency risk: hallucinated/typosquatted package names ('slopsquatting'), and validating dependencies the agent adds.",
      "5. Guardrails: human-in-the-loop diff review, command allowlists, and audit logging of every tool call.",
      "6. Interview canon: 'how do you secure a code-executing agent', 'what is prompt injection via a repo', 'why is generated code a security risk', 'how do you sandbox tool use'.",
    ],
    takeaway: "SKELETON: A code-executing agent needs a real threat model — prompt injection from repo content, untrusted execution, secret exfiltration, and insecure/hallucinated dependencies — answered with sandboxing, least privilege, SAST, and human diff review. Full content + interactive coming.",
  },
};
