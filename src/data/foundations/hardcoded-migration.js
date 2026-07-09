// src/data/foundations/hardcoded-migration.js — RUNNER_DATA narrative teaching for the
// 3 hardcoded-component modules being migrated per docs/GSL_PLAN.md backlog item 1:
// `context`, `eval-design`, `debug`. Written per 3B1B-STANDARD.md (writer pass), cross-checked
// against the existing hands-on component's own numbers so text and interactive stay locked
// (scene rule 3 / voice rule 4). Component wiring is unchanged — Concepts.jsx already renders
// FoundationsRunner + the existing bespoke Component together whenever RUNNER_DATA[id] exists
// (see "transformer", which keeps component: TransformerModule and gets its narrative from here
// the same way). No component/registry edits needed for this half of the migration.
//
// 2026-07-09: `context` written (writer pass only — Pass-2 adversarial audit and glossary/
// interview-question harvest are separate follow-up steps, not yet run). `eval-design` and
// `debug` are still pending — tracked as the remainder of backlog item 1.

export const RUNNER_HARDCODED_MIGRATION = {

  "context": {
    depthTier: "deep",
    interviewWeight: "high",
    groundUp: "The last module built the whole Transformer block and ended on a pricing lesson: stacking more layers costs more compute, one layer at a time — a straightforward, linear bill. There's a second dial this module didn't touch, and it behaves nothing like the first.\n\nRecall what attention actually does at every layer: every token compares itself against every other visible token to decide how much to blend from each. Watch what that costs as the token count grows. With 4 tokens, each one compares against all 4 — 4×4 = 16 comparisons. Double the tokens to 8, and it isn't 8 more comparisons, or even 16 more — it's 8×8 = 64, four times the original 16. Double the input, and the cost didn't double. It quadrupled.\n\nThat's not a fluke of small numbers. Push it to production scale: a 1,000-token prompt costs on the order of 1,000×1,000 = 1,000,000 pairwise comparisons per layer; a 2,000-token prompt costs 2,000×2,000 = 4,000,000 — quadruple again, from doubling the input a second time. This growth pattern — cost scales with the *square* of the input length — has a name: **quadratic** scaling, written **O(n²)**. It means the token budget you hand a model isn't just a text-length limit. It's the single biggest lever on how much compute a request actually burns — which is exactly why 'just use a bigger context window' is never a free move, and why this module is about that budget: what eats it, what it costs to fill, and a specific, well-documented failure that shows up only once you start filling it, where placement inside the window matters almost as much as content.",
    scenario: "A support-chat product starts seeing a spike in tickets that all say some version of 'the assistant just contradicted something it told me earlier in this same conversation.' The team checks and finds nothing wrong with the model's weights or the prompt template — but the tickets cluster hard around conversations that ran past turn 20. Pause before reading on: with a fixed context window and a sliding-window truncation strategy, what's the mechanical reason old turns disappear, and why would it get worse specifically as a conversation gets longer, rather than staying constant? Here's the reasoning. A sliding window keeps only the most recent turns inside the token budget — turns pushed out are genuinely gone from what the model can see, not hidden in some backup buffer it can still reach. The longer the conversation runs, the more turns get pushed out, so the odds that the *specific* fact a user is now referencing has already aged out of the window climb steadily past turn 15–20. The fix follows directly from the token-budget formula worked out below: don't let history silently displace itself — reserve room deliberately (max_input = context_limit − max_output − safety_margin), and once a conversation nears that ceiling, summarize the aging-out turns into a running prefix instead of letting them vanish outright.",
    explanation: [
      "Push the quadratic curve further, into the range production systems actually operate in. A 1,000-token prompt and a 128,000-token prompt — the ceiling on GPT-4o's larger context tier — aren't 128× apart in cost, the way the token counts alone might suggest. They're 128² ≈ 16,000× apart. That's the exact curve the token-budget explorer below plots as its attention-compute-cost bars, with your own token count highlighted against it. 'Just use a bigger context window' is not a free move; it's a request to pay a quadratic bill.",
      "So what actually is a **context window**? It's the fixed number of tokens a model can hold in view at once — every instruction, every past turn, every retrieved fact, and the reply it's still writing, all competing for the same budget. Exceed it and the oldest content is silently dropped, not flagged. Five real ceilings, so the number stops being abstract: Llama 3 8B tops out at 8,192 tokens, GPT-3.5 at 16,385, GPT-4o at 128,000, Claude 3.5 at 200,000, and Gemini 1.5 at a full 1,000,000 — the model picker in the token-budget builder below lets you feel the difference directly.",
      "Four things typically compete for that budget in a real system, and they don't compete equally. A system prompt — instructions, persona, tool definitions — costs a flat amount regardless of the conversation (roughly 280 tokens for a modest one). Few-shot examples cost per example (roughly 320 tokens each). Conversation history costs per turn (roughly 180 tokens each). Retrieved RAG chunks cost per chunk (roughly 220 tokens each). Build a demanding but realistic request — 6 few-shot examples, 12 turns of history, 10 retrieved chunks, plus the user's current query (65 tokens) and a reserved response budget (500 tokens) — and the running total is 1,920 + 2,160 + 2,200 + 280 + 65 + 500 = **7,125 tokens**. On Llama 3 8B's 8,192-token ceiling, that's 87% of the entire budget gone before the model has written a single word of its reply — the same danger zone the token-budget builder below flags once usage crosses 80%.",
      "That 87%-full number is exactly why production systems don't treat the context limit as a single number to stay under — they budget it explicitly, in a formula worth memorizing: **max_input = context_limit − max_output − safety_margin**. Reserve the output tokens and a cushion *before* deciding how much history or how many chunks to include, rather than discovering the ceiling only after a response gets cut off mid-sentence.",
      "Staying under the ceiling turns out to be necessary but not sufficient. Even content that safely fits inside the window isn't read equally by the model — and this is the part that surprises people who've only ever thought about context as a quantity problem. Take ten retrieved chunks, all placed inside the same, safely-under-budget prompt, and ask only where the single most relevant chunk was positioned. Put it first, at position 1, and the model correctly uses it 92% of the time. Put that exact same chunk sixth, dead in the middle of the ten, and correct usage collapses to 48% — worse than a coin flip, on identical, budget-safe content. Put it last, at position 10, and recall climbs back up to 88%, nearly matching first place.",
      "That's not noise — Liu et al. (2023) measured this same U-shaped curve across GPT-3.5, Claude, and other models: attention is strongest at the very beginning and very end of a context window, and weakest in the middle. The effect is called **'lost in the middle,'** and it means *where* you place a retrieved chunk inside the prompt matters almost as much as whether you retrieved the right chunk at all. The Lost-in-the-Middle explorer below lets you drag that single chunk through all ten positions and watch the recall number move exactly along this curve.",
      "Three responses follow directly from that curve, and each has a name. **Sandwich placement**: put your highest-confidence chunk first, your second-highest last, and let lower-confidence chunks fill the dead middle, since that's the position range that was going to be read weakest anyway. **Rerank before you place**: raw vector-similarity ranking doesn't tell you which chunk deserves the primacy slot — a cross-encoder reranker (Cohere Rerank, bge-reranker) does, so rerank first, then place. And **fewer, better chunks beats more, mediocre ones**: every additional chunk you add pushes the ones already in the middle further from either edge, so retrieving 5 well-ranked chunks reliably beats retrieving 15 loosely-relevant ones.",
      "Three more failure patterns show up once a system is actually running, all budget problems in different disguises. **Soft context overflow**: the prompt is technically under the token limit, but it's spread so thin across so much content that response quality degrades anyway — past roughly 50% context usage, consider map-reduce instead: process chunks separately, then combine the results, rather than stuffing everything into one call. **Stale context drift**: a sliding window quietly drops the oldest turns to stay under budget, and the model starts contradicting something it said 20 turns ago because that turn no longer exists in its view — the fix is to summarize old turns into a running prefix, typically needed by turn 15–20 in most chat systems, rather than letting them silently vanish. **Output budget collision**: the input alone fills 95% of the window, so the model's own response gets truncated mid-sentence — exactly the failure the max_input formula above was built to prevent, by reserving max_output and a safety margin before, not after, the input is assembled.",
      "Zoom out. This module opened on a hard constraint: attention costs scale with the square of sequence length, so context is never free, and even content safely inside the budget isn't read evenly — primacy and recency dominate, the middle fades. Both problems are about to get engineering answers: techniques like flash attention and sliding-window/KV-cache optimizations exist specifically to make long-context attention tractable instead of just quadratically expensive — the next module picks up exactly there.",
    ],
    keyPoints: [
      "**Attention cost scales quadratically (O(n²)), not linearly.** Doubling token count quadruples compute; at production scale, 1k→128k tokens (128×) is ≈16,000× the compute (128²). A bigger context window is never a free fix.",
      "**Budget explicitly:** max_input = context_limit − max_output − safety_margin. Reserve the output budget and a safety cushion before deciding how much history or how many retrieved chunks to include.",
      "**'Lost in the middle' (Liu et al. 2023):** even content safely inside the token budget isn't read evenly — recall is strongest at the start and end of the window (~92%/~88%) and weakest in the middle (as low as ~48%). Placement matters almost as much as retrieval quality.",
      "**Production fixes for lost-in-the-middle:** sandwich placement (best chunk first, second-best last), rerank before placing (raw similarity doesn't identify the primacy-worthy chunk), and fewer-better chunks over more-mediocre ones.",
      "**Three distinct context failure modes, three distinct fixes:** hard overflow (over the limit, truncated — fix by budgeting), soft overflow (under the limit but quality decays from thin attention — fix with map-reduce), and stale context drift (sliding window silently deletes old turns — fix by summarizing into a running prefix, typically by turn 15–20).",
      "**A larger context ceiling doesn't repeal the underlying mechanisms.** Moving to a 1M-token model still pays O(n²) on however much you actually fill, and still loses recall in the middle of whatever you place there — it just moves the failure from visible (truncation) to quiet (cost, placement).",
    ],
    recap: [
      "**Attention is pairwise: n tokens → n² comparisons — quadratic (O(n²)) cost,** not linear. Doubling tokens quadruples cost.",
      "**Production scale:** 1k→128k tokens (128×) ≈ 16,000× the compute (128²), not 128×.",
      "**Context ceilings:** Llama 3 8B 8,192; GPT-3.5 16,385; GPT-4o 128,000; Claude 3.5 200,000; Gemini 1.5 1,000,000.",
      "**Token budget formula:** max_input = context_limit − max_output − safety_margin.",
      "**Lost in the middle (Liu et al. 2023):** recall ~92% at position 1, ~48% at the worst middle position, ~88% at the last position — U-shaped, not flat.",
      "**Fixes:** sandwich placement (best first, 2nd-best last), rerank before placing, fewer better chunks over more mediocre ones.",
      "**Soft context overflow:** under the token limit but quality still degrades from thin attention — fix with map-reduce, not more budget.",
      "**Stale context drift:** sliding-window truncation genuinely deletes old turns — fix by summarizing into a running prefix (~turn 15–20).",
      "**Output budget collision:** input alone fills the window, response truncates mid-sentence — exactly what the budget formula prevents.",
      "**A bigger context ceiling doesn't repeal O(n²) or lost-in-the-middle** — it just moves where they bite.",
    ],
    mcqs: [
      {
        question: "You double a prompt's token count from 4,000 to 8,000 tokens. Based on how self-attention computes token-to-token comparisons, what happens to the compute cost, and why?",
        options: [
          "It doubles — the number of tokens doubled, so the number of comparisons doubles in direct proportion.",
          "It quadruples — attention computes a comparison between every pair of tokens, so cost scales with the square of the token count (n²), not with n itself.",
          "It stays the same — modern attention implementations cache previous comparisons, so only the new tokens add any cost.",
          "It increases by exactly 4,000 — cost is the token count plus a fixed per-token overhead, which is additive, not multiplicative.",
        ],
        correct: 1,
        explanation: "Self-attention compares every token against every other visible token, so the total number of comparisons scales as n×n = n². Doubling n from 4,000 to 8,000 means the comparison count goes from 4,000² to 8,000² — exactly 4×, not 2×. This O(n²) scaling is why context length is the single biggest lever on a request's actual compute cost.",
      },
      {
        question: "A team sets max_output=1,000 tokens and wants a 200-token safety margin on a model with a 32,000-token context limit. Using max_input = context_limit − max_output − safety_margin, how many tokens can they actually spend on system prompt + history + retrieved context + the user's query?",
        options: [
          "32,000 — the safety margin and output budget are separate concerns that don't need to be subtracted from the input budget.",
          "30,800 — subtract both the reserved output tokens and the safety margin from the context limit before budgeting the input.",
          "31,000 — only the output budget needs to be reserved; the safety margin is optional and can be added back if needed.",
          "33,000 — add the safety margin to the context limit to get extra headroom for the input.",
        ],
        correct: 1,
        explanation: "max_input = context_limit − max_output − safety_margin = 32,000 − 1,000 − 200 = 30,800. Both the reserved output tokens and the safety margin have to come out of the same fixed budget as everything else — treating them as separate or optional is exactly how a response ends up silently truncated mid-sentence.",
      },
      {
        question: "A RAG system retrieves the correct chunk 90% of the time, but end-to-end answer accuracy is much lower. Debugging shows the correct chunk usually lands somewhere in the middle of a 10-chunk prompt. What does this pattern point to, and what's the fix?",
        options: [
          "The retriever is broken and needs retraining — if it usually finds the right chunk, end-to-end accuracy should track retrieval accuracy closely.",
          "The 'lost in the middle' effect — models recall content at the start and end of a context window far more reliably than content placed in the middle, so rerank and place the most relevant chunk first or last.",
          "The context window is too small for 10 chunks, so the fix is simply to upgrade to a model with a larger context limit.",
          "The chunks are too short — longer chunks give the model more surrounding text to anchor its attention on, regardless of position.",
        ],
        correct: 1,
        explanation: "This is the textbook signature of 'lost in the middle': strong retrieval, weak end-to-end accuracy, correct content landing mid-prompt. Recall drops from ~92% at the first position to as low as ~48% in the middle before recovering toward the end — so the fix is positional, not about retrieval quality or window size: rerank so the highest-confidence chunk gets a primacy or recency slot (sandwich placement).",
      },
      {
        question: "You have 5 retrieved chunks ranked by a cross-encoder reranker from most to least relevant. Based on the lost-in-the-middle curve, how should you order them in the prompt?",
        options: [
          "Most relevant first, then descending relevance straight through to least relevant last — a simple ranked list.",
          "Most relevant first, second-most-relevant last, with the remaining lower-confidence chunks filling the middle — a sandwich, matching where attention is actually strongest.",
          "Least relevant first to 'warm up' the model, building up to the most relevant chunk placed last.",
          "Random order — since all 5 chunks are within the token budget, position doesn't affect a well-calibrated model's attention.",
        ],
        correct: 1,
        explanation: "Since recall is strongest at the start and end of the window and weakest in the middle, the highest-value real estate is the first and last positions — not first-and-second. Sandwich placement puts the top chunk first, the second-best chunk last, and lets the lower-confidence middle chunks absorb the position range that was always going to be read weakest.",
      },
      {
        question: "A prompt is comfortably under the token limit (60% full), but response quality is noticeably degraded compared to a shorter, more focused prompt. Nothing is being truncated. What's the likely cause, and the fix?",
        options: [
          "This can't be a real problem — if the prompt is under the token limit, token budget cannot be the cause of degraded quality.",
          "Soft context overflow — attention is spread too thin across too much included content even though nothing is technically cut off; past roughly 50% usage, consider map-reduce (process chunks separately, then combine) instead of stuffing everything into one call.",
          "The model's temperature is too high — quality degradation with no truncation is a sampling problem, not a context problem.",
          "This is 'lost in the middle' — the fix is to reorder the existing content into a sandwich pattern, with no change to how much content is included.",
        ],
        correct: 1,
        explanation: "Being under the hard token limit doesn't mean content is being used efficiently — 'soft context overflow' is exactly this pattern: quality degrades from attention being spread thin across a lot of included content, without any truncation ever happening. The fix isn't reordering (that's the lost-in-the-middle fix for a different symptom) — it's reducing total content, e.g. via map-reduce.",
      },
      {
        question: "A chat system uses a sliding window that drops the oldest turns once the conversation exceeds the token budget. Around turn 25, users report that the assistant contradicts things it said earlier in the same conversation. What's happening mechanically, and what's the standard fix?",
        options: [
          "The model is hallucinating randomly — this is a sampling/temperature issue unrelated to the sliding window.",
          "The early turns have been dropped from the window entirely, so the model literally can no longer see what it said earlier; the standard fix is to summarize old turns into a running prefix, typically needed by turn 15–20 in most systems.",
          "The sliding window is a display-only feature — the model still has access to the full conversation history internally, so this must be a UI bug.",
          "The context window itself is too small for any conversation and needs to be upgraded to a larger-context model to fix the contradiction.",
        ],
        correct: 1,
        explanation: "A sliding window keeps only the most recent turns inside the token budget — turns pushed out are genuinely gone from what the model can see, not just hidden from the UI, so contradicting earlier statements is expected once those turns age out, not a hallucination. The standard fix is summarizing old turns into a running prefix that persists even as raw turns drop.",
      },
      {
        question: "Your system currently runs on GPT-3.5 (16,385-token context) and regularly hits 95%+ usage with 10 RAG chunks and 8 turns of history. A teammate proposes switching to Gemini 1.5 (1,000,000-token context) to 'never worry about the budget again.' What's the real tradeoff being ignored?",
        options: [
          "None — a 1,000,000-token context window removes the budget constraint entirely, so there's no real tradeoff to consider.",
          "Moving to a much larger context window doesn't remove the O(n²) attention-cost curve or the lost-in-the-middle effect — a prompt that actually uses a large fraction of a 1M-token window pays a proportionally larger quadratic compute cost, and content in the middle of that much larger window is still read weakest.",
          "Gemini 1.5 doesn't support RAG-style retrieved context, so the migration would require rebuilding the retrieval pipeline from scratch.",
          "The only real tradeoff is dollar cost per token, which is a pricing question unrelated to anything covered in this module.",
        ],
        correct: 1,
        explanation: "A bigger ceiling doesn't repeal the two mechanisms taught in this module: attention cost still scales as O(n²) with however many tokens you actually include, so filling more of a 1M window costs proportionally more compute; and content placed in the middle of a much longer window is still subject to the same lost-in-the-middle recall drop. 'Never worry about the budget' trades a token-limit problem for quieter cost and placement problems.",
      },
    ],
    takeaway: "Context is never free: attention cost scales as the square of token count, so a bigger window is a bigger bill, not a free upgrade — and even content safely inside the budget is read unevenly, with the middle of the window recalled far less reliably than the edges. Budget explicitly (max_input = context_limit − max_output − safety_margin), place retrieved content deliberately (sandwich, reranked), and diagnose overflow, soft degradation, and stale drift as three different problems with three different fixes.",
  },

};
