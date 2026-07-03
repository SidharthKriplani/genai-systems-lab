// GSL premium-niche track — Voice / Speech AI (AUTHORED 2026-07-03)
// RUNNER_DATA fragment. Spread into src/data/foundationsRunnerData.js via ...RUNNER_VOICE_AI.
// Keep the export name RUNNER_VOICE_AI. Additive only — do not edit existing entries.

export const RUNNER_VOICE_AI = {
  "voice-asr-architectures": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your team is building a voice assistant for a healthcare intake line. You need to pick an ASR (automatic speech recognition) stack — Whisper vs a streaming CTC/RNN-T model vs a managed API — and defend the choice on accuracy, latency, and cost. In a design review, an engineer proposes running Whisper-large on the live call because 'it has the lowest word error rate in our offline tests.' It benchmarks beautifully on recorded clips, so it ships to a pilot. Callers immediately complain the assistant feels frozen — it says nothing until they stop talking, then pauses for a second. You need to understand ASR deeply enough to know why the most accurate model made the worst product, and which architecture the live call actually needs.",
    explanation: [
      "Speech recognition is a **sequence-to-sequence** problem with a nasty twist: the input and output aren't aligned.\n\nAudio arrives as a waveform — thousands of amplitude samples per second. The first job is the **front-end**: chop the waveform into overlapping frames (typically 25ms windows, 10ms hop) and convert each to a **log-mel spectrogram** — a compact picture of which frequencies have energy, warped onto the mel scale that matches human hearing. A 16kHz mono signal becomes ~100 feature frames per second.\n\n==That framing sets up the core difficulty: you have ~100 acoustic frames per second but only a few words per second, and nothing tells you which frames belong to which word.== Every ASR architecture is, at heart, a different answer to that alignment problem.",
      "The reason 16kHz mono is the default is **information arithmetic**, not tradition.\n\nBy the Nyquist theorem, a sample rate of 16kHz can represent frequencies up to **8kHz** — which covers essentially all the energy that distinguishes phonemes in human speech. Telephone audio historically capped at 8kHz sample rate (4kHz band), which is why phone speech is intelligible but muffled. Going above 16kHz (e.g. 44.1kHz music quality) adds data the acoustic model can't use for recognition — it just inflates compute.\n\n==So the front-end is a deliberate, lossy compression: throw away stereo, throw away frequencies above 8kHz, throw away fine phase — keep only what separates one phoneme from another.==",
      "There are **three dominant architectures**, and they differ by *how they handle alignment* — which is exactly what determines whether they can stream.\n\n**CTC (Connectionist Temporal Classification)** predicts a label for *every frame independently*, including a special 'blank' token, then collapses repeats and blanks to get the transcript. It's alignment-free and fast, but because frames are predicted independently it has no built-in language model — it's weak on context.\n\n**RNN-Transducer (RNN-T)** adds a small internal predictor network conditioned on the *previous output tokens*, so each new token sees both the audio so far and the words emitted so far. ==This is the one architecture that is natively streaming AND context-aware — which is why it is the production default for real-time voice.==\n\n**Attention encoder-decoder (AED)** — the Whisper family — encodes the *whole* utterance, then a decoder attends over all of it to generate text. Attending over the full clip gives the highest accuracy, but it fundamentally needs the whole audio first — so it is **offline by construction.**",
      { type: "illustration", label: "The three architectures by streaming ability and accuracy", content: `                  Streaming?     Context-aware?   Rel. accuracy   Latency
CTC               yes            no (independent)  medium          very low
RNN-Transducer    yes (NATIVE)   yes (predictor)   high            low
Whisper (AED)     NO (offline)   yes (full attn)   highest         high (batch)
Chunked Whisper   partial hack   yes-ish           high            medium

Why the streaming column is the whole story:
  CTC / RNN-T emit tokens as audio arrives  -> partial hypotheses possible
  Whisper attends over the WHOLE clip       -> must wait for end-of-speech

Whisper's edge in accuracy is real, but it is bought with "see the entire
utterance first." On a live call, that requirement IS the felt latency —
the assistant literally cannot begin until you stop talking.` },
      "Whisper deserves its own look because it's the model people reach for by default — and the reason it's so good is also why it's **offline-first.**\n\nWhisper was trained on **680,000 hours** of weakly-supervised audio scraped from the web — far more, and far messier, than curated academic corpora. That scale is why it's robust to accents, noise, and domains out of the box. It's **multitask**: the same model transcribes, translates to English, does language ID, and emits timestamps, all selected by special tokens prepended to the decoder (`<|transcribe|>`, `<|translate|>`, `<|en|>`).\n\nBut it's an attention decoder over a fixed **30-second window**, and it was trained on segments that always contain speech. ==So on silence or non-speech it doesn't stay quiet — it *hallucinates* fluent text (often training-caption boilerplate like 'Thanks for watching'), because it was never taught that 'nothing' is a valid output.== That's a signature Whisper failure mode, and it's a direct consequence of the training recipe.",
      "This is the crux of the scenario. **You cannot ship Whisper-large as-is on a live call.**\n\nWhisper needs the full utterance before it can attend over it, so its architecture forces a wait-then-decode pattern: the assistant stays silent while you speak, and only after you stop does it run a batch decode. That's exactly the 'frozen, then a pause' complaint. Offline benchmarks reward accuracy on complete clips and never measure this, so Whisper looks like the winner right up until it's on a phone line.\n\nThe fixes are all compromises. **Chunked / streaming Whisper** runs the decoder on rolling windows to emit partial text sooner — but re-decoding overlapping chunks costs compute and can flip earlier words. **RNN-T** sidesteps the problem entirely by being streaming-native: it emits tokens as frames arrive. ==The healthcare intake line wants RNN-T (or a streaming API); Whisper belongs on the post-call transcription and dictation paths where latency doesn't matter and accuracy does.==",
      "Two more levers finish the picture: **decoding** and **domain adaptation.**\n\nDecoding turns the model's per-step probabilities into text. **Greedy** takes the top token each step — fast, fine for RNN-T on-device. **Beam search** keeps the top-k running hypotheses and can recover from a locally-wrong-but-globally-right choice — higher accuracy, more compute. On top of beam search you can do **shallow fusion**: blend in scores from an external **language model** so the decoder prefers plausible word sequences.\n\nThat external LM is the standard tool for **domain jargon.** A general ASR model will mis-hear 'metoprolol' or 'Xarelto' because those words are rare in its training. ==You don't retrain the acoustic model — you bias decoding toward a domain vocabulary/LM (or use word boosting / contextual biasing), so the medical terms win the beam even when they sound close to common words.==",
      "Zooming out, the stack choice is a **three-way tradeoff** — accuracy, latency, cost — and 'best WER' is a trap.\n\nA **managed API** (Deepgram, Google, AssemblyAI, etc.) gives you streaming RNN-T-class quality with no infra, priced per audio-minute — the fastest path to a live product. **Self-hosted RNN-T** wins on unit cost at scale and on data residency (important for healthcare/HIPAA) but you own the GPUs and the ops. **Self-hosted Whisper** is the right tool for the *offline* jobs — bulk transcription, dictation, captions — where its accuracy pays off and its latency doesn't hurt.\n\nThe interview lesson under all of it: ==pick the architecture from the *deployment constraint* (does it need to stream?), not from a leaderboard WER — the most accurate offline model can be the wrong product.==",
    ],
    keyPoints: [
      "**ASR is unaligned sequence-to-sequence.** A 16kHz mono waveform becomes ~100 log-mel frames/sec, but there are only a few words/sec — the architecture's job is to solve which frames map to which words. 16kHz is chosen because Nyquist gives 8kHz bandwidth, covering all phoneme-distinguishing energy.",
      "**Three architectures split on alignment, which decides streaming.** CTC: per-frame independent, fast, no context. RNN-T: adds a predictor over prior tokens — streaming-native AND context-aware, the real-time default. Whisper/AED: attends over the whole clip — highest accuracy but offline by construction.",
      "**Whisper's strength and its failure share one cause.** 680k hours of weak supervision make it robust and multitask (transcribe/translate/langID/timestamps via special tokens), but training only on speech-containing 30s windows makes it hallucinate fluent text on silence.",
      "**You cannot stream Whisper-large as-is.** Its full-utterance attention forces wait-then-decode, which feels frozen on a live call. Chunked Whisper is a compromise (recompute cost, word flips); RNN-T or a streaming API is the correct choice for real-time.",
      "**Domain jargon is fixed at decode time, not by retraining.** Beam search plus shallow fusion with a domain language model — or contextual biasing / word boosting — makes rare terms like drug names win the beam over common-sounding words.",
      "**Choose the stack from the deployment constraint, not the leaderboard.** Does it need to stream? That single question rules out offline Whisper for live calls regardless of its offline WER. Managed API vs self-hosted RNN-T vs self-hosted Whisper is an accuracy/latency/cost/residency tradeoff.",
    ],
    recap: [
      "**Front-end:** waveform → 25ms/10ms frames → log-mel spectrogram, ~100 frames/sec at 16kHz mono (Nyquist → 8kHz band covers all phonemes). Lossy on purpose.",
      "**Alignment decides streaming:** CTC (per-frame, fast, no context), RNN-T (predictor over prior tokens → streaming-native + context-aware, the real-time default), Whisper/AED (full-clip attention → most accurate but offline).",
      "**Whisper:** 680k hrs weak supervision → robust + multitask via special tokens; but hallucinates on silence because it was only trained on speech-filled 30s windows.",
      "**The scenario:** Whisper can't stream — full-utterance attention forces wait-then-decode → 'frozen then a pause.' Live calls need RNN-T / a streaming API; Whisper belongs on offline transcription.",
      "**Decoding + jargon:** greedy vs beam; shallow fusion with a domain LM (or word boosting) biases decoding so rare medical terms win the beam — no acoustic-model retrain needed.",
      "**Stack choice = accuracy vs latency vs cost vs residency.** Pick from 'does it need to stream?', not from best offline WER.",
    ],
    mcqs: [
      {
        question: "An engineer ships Whisper-large on a live phone-intake line because it had the lowest word error rate in offline tests. Callers say the assistant feels 'frozen, then pauses for a second' before replying. What is the most accurate explanation?",
        options: [
          "Whisper-large is too big for the GPU, so it's compute-bound and simply runs slowly on every request",
          "Whisper is an attention encoder-decoder that attends over the whole utterance, so it cannot begin decoding until the caller stops speaking — its offline architecture forces a wait-then-decode pattern that offline benchmarks never measure but a live call exposes as felt latency",
          "Whisper's word error rate is actually bad on phone audio, so the offline tests were simply wrong",
          "The network round-trip to the ASR service is the bottleneck; switching regions would fix the felt latency",
        ],
        correct: 1,
        explanation: "Option B is correct: Whisper is an attention encoder-decoder (AED) that encodes the entire utterance and then attends over all of it to decode — it structurally needs the whole clip first, so it can only run a batch decode after end-of-speech. That produces exactly the 'stays silent while you talk, then pauses' behavior. Offline benchmarks score accuracy on complete recorded clips and never measure this, which is why it looked like the winner. Option A is wrong — even on ample hardware the architecture still can't emit partial text mid-utterance; the problem is the streaming model, not raw throughput. Option C is wrong — Whisper is robust on phone-like audio; the offline WER wasn't a measurement error, it was measuring the wrong thing (accuracy, not streamability). Option D is a distractor — network latency is real but small and constant; it doesn't explain the 'silent until you stop talking' pattern, which is the signature of full-utterance attention.",
      },
      {
        question: "For a real-time healthcare intake line that must feel responsive, which ASR architecture is the right default, and why?",
        options: [
          "CTC, because it predicts each frame independently and is the fastest, so it will always beat the alternatives on a live call",
          "RNN-Transducer, because it is natively streaming (emits tokens as frames arrive) AND context-aware (its predictor network conditions on previously emitted tokens), giving low latency without sacrificing the language modeling that pure frame-independent models lack",
          "Whisper-large with a bigger batch size, because batching hides its latency",
          "Any attention encoder-decoder, since attention over the full clip is required for acceptable accuracy in production",
        ],
        correct: 1,
        explanation: "Option B is correct: RNN-T is the one dominant architecture that is both streaming-native (it emits output tokens as audio frames arrive, enabling partial hypotheses and low time-to-text) and context-aware (its internal predictor conditions on the tokens emitted so far, giving it the language modeling CTC lacks). That combination is exactly what a responsive live call needs. Option A is wrong — CTC streams and is fast, but predicts frames independently with no context, so it's weaker on real language; 'fastest' doesn't mean 'best default' when accuracy on medical dialogue matters. Option C is wrong — batching increases throughput, not per-request responsiveness, and doesn't remove Whisper's need to see the whole utterance before decoding. Option D is wrong — full-clip attention is precisely what makes AED models offline; requiring it rules them out for real-time, the opposite of the claim.",
      },
      {
        question: "The intake assistant keeps mis-transcribing drug names like 'metoprolol' and 'Xarelto' as common English words. The acoustic model is a strong general streaming ASR. What is the most appropriate fix?",
        options: [
          "Retrain the acoustic model from scratch on a medical corpus, since the model fundamentally cannot represent those sounds",
          "Bias decoding toward the domain — use shallow fusion with a medical language model, or contextual biasing / word boosting on a drug-name vocabulary — so the rare correct terms win the beam over similar-sounding common words, without retraining the acoustic model",
          "Raise the audio sample rate to 44.1kHz so the model can hear the drug names more clearly",
          "Switch from beam search to greedy decoding so the model commits to its first guess and stops second-guessing the medical terms",
        ],
        correct: 1,
        explanation: "Option B is correct: the acoustic model hears the sounds fine — it just prefers common words because rare medical terms are underrepresented in general training, so they score low during decoding. The standard fix is to bias the decoder: shallow fusion with a domain language model, or contextual biasing / word boosting on a supplied vocabulary, so 'metoprolol' beats the common-word alternative in the beam. No acoustic retrain required. Option A is wrong and wasteful — a full retrain is expensive and unnecessary; the model can already represent the phonemes, it just needs a decoding-time prior. Option C is wrong — 16kHz already captures all phoneme-distinguishing energy (Nyquist → 8kHz band); 44.1kHz adds unusable data and doesn't change the word-choice prior. Option D is backwards — greedy decoding makes it MORE likely to lock onto the common-word guess; beam search plus a domain LM is what lets the rare correct term win.",
      },
      {
        question: "A team wants to add automatic timestamps and English translation to their transcripts and hears Whisper can do all of it. During a demo, Whisper prints 'Thank you for watching!' during a long silent hold segment. What does this reveal about Whisper?",
        options: [
          "Whisper's translation feature leaked training data; disabling translation will stop the spurious text",
          "Whisper is multitask (transcribe / translate / language-ID / timestamps selected by special decoder tokens), but because it was trained on 30-second windows that always contained speech, it never learned that 'nothing' is a valid output — so on silence it hallucinates fluent, caption-like boilerplate",
          "The audio was corrupted, injecting a hidden speech segment that Whisper correctly transcribed",
          "Whisper hallucinates only when timestamps are enabled; the timestamp head is generating the extra tokens",
        ],
        correct: 1,
        explanation: "Option B is correct: Whisper's multitask design (transcribe, translate, language ID, timestamps, all chosen by special tokens prepended to the decoder) is exactly why the team wants it — but its training data was speech-containing 30-second segments, so the decoder was never shown that empty/non-speech input should yield empty output. Faced with silence it defaults to fluent, high-frequency training-caption boilerplate like 'Thank you for watching.' This is a well-known, architecture-and-data-driven failure mode. Option A is wrong — the hallucination isn't a translation artifact; it happens in plain transcription too, and disabling translation won't stop it. Option C is wrong — no hidden audio is needed; silence alone triggers it because 'nothing' wasn't a trained output. Option D is wrong — the hallucination is not tied to the timestamp task; it stems from the training distribution, not the timestamp head.",
      },
    ],
    takeaway: "ASR turns ~100 log-mel frames/sec into a few words/sec by solving alignment, and how each architecture solves it decides whether it can stream: CTC (fast, no context), RNN-T (streaming-native and context-aware — the real-time default), and Whisper/AED (most accurate but offline because it attends over the whole clip). The scenario's failure is picking on offline WER: Whisper's full-utterance attention forces wait-then-decode and feels frozen on a live call, so a live intake line needs RNN-T or a streaming API while Whisper belongs on transcription. Fix domain jargon at decode time with a domain LM or word boosting, and choose the whole stack from the deployment constraint (does it need to stream?), not from a leaderboard.",
  },

  "voice-streaming-latency": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "Your real-time voice agent feels sluggish — users talk over it and interrupt. Product wants sub-800ms 'time-to-first-audio' from end-of-user-speech. An engineer profiles the pipeline and reports 'the LLM averages 400ms per turn, well under budget, so we're fine' — yet the agent still feels laggy and callers still cut in. The averages look healthy but the experience doesn't. You have to budget latency across the full ASR → LLM → TTS pipeline, find where the milliseconds actually go, and explain why a good average can still produce a bad-feeling agent.",
    explanation: [
      "A real-time voice agent is a **pipeline of stages**, and latency is additive across every one.\n\nThe loop is: mic → **VAD** (voice activity detection, is anyone speaking?) → **streaming ASR** (audio → partial text) → **endpointing** (has the user finished their turn?) → **LLM** (generate the reply) → **streaming TTS** (text → audio) → speaker.\n\nEach stage adds delay, and the numbers stack. ==Because they stack, the metric that matters is not any single stage's speed but the total wall-clock from the user's last word to the first sound the agent makes — 'time-to-first-audio.'== A pipeline where every stage is 'fast enough' in isolation can still blow the budget when you sum them.",
      "The reason the *first-audio* number dominates is **human conversational physics.**\n\nIn natural human dialogue, the gap between turns is remarkably tight — typically around 200ms, and pauses beyond ~500–700ms start to feel like the other person has stalled or the line is dead. That's the bar a voice agent is unconsciously judged against.\n\n==So 'time-to-first-audio' — end-of-user-speech to the first phoneme out of the speaker — is the perceived-responsiveness metric, and it's a much harsher target than total turn latency.== It's why streaming everything matters: the agent doesn't need to finish generating its whole reply before the user hears something; it needs to *start* fast. Total turn latency (until the reply finishes) matters too, but first-audio is what makes the agent feel alive.",
      "The engineer's '400ms average' is the classic trap: ==in a live voice product you budget and measure at p95/p99, not the mean, because a small fraction of slow turns is what users actually remember and interrupt.==\n\nAn LLM that averages 400ms time-to-first-token but has a p99 of 1,500ms will feel broken on 1 in 100 turns — and across a multi-turn call that's several visible stalls. Averages hide the tail; the tail is the experience. Worse, latency stages are somewhat independent, so their tails can co-occur: a slow ASR finalization AND a slow LLM TTFT on the same turn produces a stall far past budget.\n\nThis is why voice SLOs are written as 'p95 time-to-first-audio < 800ms,' never as an average — and why the profiling report was misleading.",
      { type: "illustration", label: "An 800ms first-audio budget, stage by stage", content: `Target: end-of-user-speech -> first audio out  =  800ms (p95)

  Endpoint decision (silence/semantic)   ~200ms   <- when do we DECIDE user is done?
  Final ASR hypothesis                   ~100ms   <- lock the last partial into final text
  LLM time-to-first-token (TTFT)         ~300ms   <- NOT full generation, just first token
  TTS first audio chunk                  ~150ms   <- first sentence, not whole reply
  Network / buffering                    ~50ms
  ---------------------------------------------
  Total                                  ~800ms

The two rules the budget encodes:
  1. Every number is a FIRST-something (first token, first chunk) -> you must STREAM.
  2. Endpointing is the single biggest controllable chunk. Shave the silence
     timeout and you shave perceived latency directly -- but cut too far and
     you cut the user off mid-sentence. It is a precision/latency tradeoff.` },
      "**Endpointing** is where most of the controllable latency — and most of the interruption pain — lives.\n\nEndpointing is the decision that the user is *done* talking so the agent can respond. The naive method is a **silence timeout**: wait for N milliseconds of quiet, then treat the turn as over. Set N too high (say 800ms) and every response is sluggish because you burn most of your budget just *waiting to be sure*. Set it too low and you cut users off mid-thought — they pause to breathe and the agent barges in.\n\n==Semantic endpointing improves on the timeout by using the words, not just the silence: a model predicts whether the utterance is grammatically/pragmatically complete, so 'I'd like to book a...' waits but 'book a table for two' fires fast.== It lets you shorten the silence timer without cutting people off — directly buying back perceived latency.",
      "The other half of feeling responsive is **barge-in** — letting the user interrupt the agent.\n\nWhen the agent is speaking and the user starts talking, a good agent must (1) detect the incoming speech via VAD even over its own audio, (2) *immediately cancel the in-flight TTS* and stop the speaker, and (3) start listening and re-planning. If it can't, the user talks over a monologue that won't stop — the exact 'users interrupt and it ignores them' complaint.\n\nBarge-in requires **full-duplex** handling: listening and speaking channels open at once, plus **echo cancellation** so the agent's own outgoing audio doesn't get mistaken for user speech (acoustic echo cancellation, AEC). ==Barge-in is not a nice-to-have — an agent that can't be interrupted feels robotic no matter how low its first-audio latency is, because real conversation is interruptible.==",
      "The unifying principle across the whole pipeline is **stream everything**, and it's why the budget is a column of 'first-X' numbers.\n\nDon't wait for a final transcript — feed **partial ASR hypotheses** downstream so the LLM can even pre-warm. Don't wait for the LLM to finish — consume **token streaming** and start TTS on the first complete sentence. Don't wait for full audio — emit **sentence-chunked TTS** so the first sentence plays while later sentences synthesize.\n\n==The payoff is structural: streaming turns the pipeline from a sum of full-stage latencies into a sum of first-chunk latencies, which is often 3–5× smaller.== A non-streaming pipeline pays 'full ASR + full LLM + full TTS' before any audio; a streaming one pays 'endpoint + first token + first TTS chunk' — the difference between an 800ms agent and a 3-second one.",
      "Finally, know the levers when you're **over budget** — this is the whiteboard follow-up.\n\nIf endpointing dominates: switch silence-only to **semantic endpointing** and tune the timeout. If LLM TTFT dominates: use a **smaller/faster model** for the first turn, prompt-cache the system prompt, or speculatively start generating on the partial transcript. If TTS dominates: pick a **streaming vocoder** and chunk on the first sentence, not the paragraph. If network dominates: move inference closer (region/edge) and keep persistent connections.\n\nAnd the escape hatch worth naming: ==a **speech-to-speech** model collapses ASR + LLM + TTS into one forward pass, removing two inter-service hops and their queuing — trading pipeline controllability for a structurally lower latency floor.== The interview answer is never 'make the LLM faster' — it's 'show me the p95 budget, find the dominant stage, and stream or collapse it.'",
    ],
    keyPoints: [
      "**Latency is additive across the pipeline** (VAD → ASR → endpointing → LLM → TTS), so the metric that matters is total end-of-speech → first-audio, not any one stage. Stages that are each 'fast enough' can still sum past budget.",
      "**Time-to-first-audio is the perceived-responsiveness metric** because human turn gaps are ~200ms and pauses past ~500–700ms feel dead. It's a harsher target than total turn latency — the agent must *start* fast, not finish fast.",
      "**Budget and measure at p95/p99, never the mean.** A 400ms-average LLM with a 1,500ms p99 feels broken on ~1% of turns, and independent stage tails can co-occur. Averages hide exactly the turns users interrupt.",
      "**Endpointing is the biggest controllable chunk and the interruption tradeoff.** Silence timeouts trade latency against cutting users off; semantic endpointing uses the words to fire fast on complete utterances and wait on incomplete ones, buying back perceived latency safely.",
      "**Barge-in requires full-duplex + echo cancellation.** Detect user speech over the agent's own audio, cancel in-flight TTS instantly, and re-plan. An agent that can't be interrupted feels robotic regardless of its first-audio number.",
      "**Stream everything** — partial ASR, LLM token streaming, sentence-chunked TTS — to turn a sum of full-stage latencies into a sum of first-chunk latencies (often 3–5× smaller). Over budget? Find the dominant stage and stream it, or collapse the pipeline with a speech-to-speech model.",
    ],
    recap: [
      "**Pipeline latency is additive:** mic → VAD → ASR → endpointing → LLM → TTS → speaker. Measure total end-of-speech → first-audio, not one stage.",
      "**First-audio is the perception metric:** human turn gaps ~200ms; >500–700ms feels dead. Start fast, don't just finish fast.",
      "**Use p95/p99, not the mean:** a good average with a bad tail feels broken on the ~1% of turns users remember and interrupt.",
      "**Endpointing dominates controllable latency:** silence timeout trades latency vs cutting people off; semantic endpointing fires on complete utterances → shorter timer, no cutoffs.",
      "**Barge-in = full-duplex + echo cancellation:** detect user speech over agent audio, cancel in-flight TTS, re-plan. Uninterruptible = robotic.",
      "**Stream everything** (partial ASR, token streaming, sentence-chunked TTS) → sum of first-chunk latencies, ~3–5× smaller. Escape hatch: speech-to-speech collapses the hops for a lower floor.",
    ],
    mcqs: [
      {
        question: "An engineer reports 'the LLM averages 400ms per turn, well under our 800ms budget, so latency is fine' — but the agent still feels laggy and users keep interrupting. What is the flaw in this reasoning?",
        options: [
          "400ms is already over budget; the engineer did the arithmetic wrong",
          "Voice responsiveness must be budgeted at p95/p99, not the mean — a 400ms-average LLM can have a 1,500ms p99 that feels broken on ~1% of turns, and the LLM is only one additive stage among VAD, ASR, endpointing, and TTS, so a healthy single-stage average says little about total first-audio latency",
          "The LLM average is irrelevant because the LLM runs in parallel with TTS, so its latency never reaches the user",
          "The agent feels laggy only because the TTS voice speaks too slowly; latency is unrelated",
        ],
        correct: 1,
        explanation: "Option B is correct on both counts. First, means hide tails: a 400ms average with a long p99 (say 1,500ms) produces stalls on roughly 1 in 100 turns, and across a multi-turn call that's several visible lags — which is why voice SLOs are written as p95/p99 first-audio, not averages. Second, the LLM is one additive stage; total first-audio latency is endpointing + ASR finalization + LLM TTFT + TTS first chunk + network, so a healthy LLM average doesn't clear the budget by itself. Option A is wrong — 400ms is under 800ms; the error isn't arithmetic. Option C is wrong — the pipeline is largely sequential per turn (you need text before TTS), and TTS can't hide LLM latency that precedes it; latency does reach the user. Option D is wrong — speaking rate is a separate concern from time-to-first-audio, which is what drives the 'laggy, gets interrupted' feel.",
      },
      {
        question: "On the 800ms first-audio budget, endpointing is allocated ~200ms via a silence timeout. Product wants to shave perceived latency without cutting users off mid-sentence. What is the best move?",
        options: [
          "Lower the silence timeout aggressively (e.g. to 50ms) — the shorter the wait, the more responsive the agent, and any cutoffs are an acceptable cost",
          "Switch to semantic endpointing — use a model that judges whether the utterance is actually complete from the words, so the agent fires fast on 'book a table for two' but waits on 'I'd like to book a...' — letting you shorten the silence timer without cutting people off",
          "Remove endpointing entirely and let the LLM decide when to respond after every partial transcript",
          "Increase the silence timeout to 800ms so the agent is certain the user is finished before responding",
        ],
        correct: 1,
        explanation: "Option B is correct: pure silence timeouts force a bad tradeoff — short timers cut people off at natural pauses, long timers feel sluggish. Semantic endpointing uses the linguistic content to decide completeness, so it can fire quickly when the utterance is clearly done and hold when it's clearly unfinished. That lets you shorten the silence component and reclaim perceived latency without the cutoff penalty. Option A is wrong — a 50ms timer will trigger on every mid-sentence breath, cutting users off constantly; that's the exact failure product wants to avoid, and it's not 'acceptable.' Option C is wrong — running the LLM on every partial with no completion signal is expensive and still lacks a principled 'are they done' decision; it doesn't solve endpointing, it just moves the guesswork. Option D is wrong — raising the timeout to 800ms consumes the entire budget in waiting and makes the agent maximally sluggish, the opposite of the goal.",
      },
      {
        question: "A non-streaming voice pipeline waits for the full transcript, then the full LLM reply, then the full synthesized audio before playing anything — total ~3 seconds to first audio. Which single change most reduces time-to-first-audio, and why?",
        options: [
          "Buy faster GPUs so each full stage completes quicker, shrinking the 3-second sum proportionally",
          "Stream every stage — feed partial ASR downstream, consume LLM token streaming, and emit sentence-chunked TTS — so the pipeline pays 'endpoint + first token + first TTS chunk' instead of 'full ASR + full LLM + full TTS,' turning a sum of full-stage latencies into a much smaller sum of first-chunk latencies",
          "Skip TTS and play a pre-recorded 'thinking' sound so the user hears something immediately",
          "Reduce the LLM's max output tokens so the full reply generates faster",
        ],
        correct: 1,
        explanation: "Option B is correct: the 3-second figure comes from paying the FULL latency of each stage in series before any audio. Streaming restructures that — the LLM starts TTS on its first sentence, TTS starts audio on its first chunk, ASR passes partials forward — so first-audio becomes endpoint + first-token + first-chunk, often 3–5× smaller. This is the core lever and it's architectural, not hardware. Option A is wrong — faster GPUs shrink each stage a little but you still pay full stages in series; you're optimizing the wrong structure. Option C is a UX band-aid, not a latency fix — the actual response is still 3 seconds away, and filler sounds mask lag rather than reduce it. Option D is wrong — capping output tokens speeds full generation but time-to-FIRST-audio depends on time-to-first-token/first-chunk, which streaming addresses directly; shorter replies don't make the first word arrive sooner.",
      },
      {
        question: "The agent has a great 700ms first-audio latency, but users complain that when they try to interrupt it mid-response, it 'talks over them and won't stop.' What is missing, and what does it require?",
        options: [
          "Nothing is missing — 700ms first-audio is excellent, so the complaint must be about the voice quality, not interruption",
          "Barge-in handling: the agent must detect incoming user speech via VAD even over its own audio, immediately cancel the in-flight TTS and stop the speaker, then re-plan — which requires full-duplex (simultaneous listen+speak) plus acoustic echo cancellation so the agent's own output isn't mistaken for the user",
          "A faster LLM, so the response finishes before the user has a chance to interrupt",
          "A longer TTS buffer so the agent can complete its sentence before yielding the floor",
        ],
        correct: 1,
        explanation: "Option B is correct: the complaint is a barge-in failure, which is orthogonal to first-audio latency. Real conversation is interruptible, so the agent must (1) hear the user start talking even while it's speaking (VAD over its own audio), (2) instantly cancel in-flight TTS and silence the speaker, and (3) start listening and re-planning. That needs full-duplex operation (listen and speak channels open together) and acoustic echo cancellation so the agent's outgoing audio isn't self-detected as user speech. Option A is wrong — low first-audio latency doesn't make an agent interruptible; an uninterruptible agent feels robotic regardless of how fast it starts. Option C is wrong — making the reply finish faster doesn't grant the user the ability to interrupt; short replies still can't be barged into without the mechanism. Option D is backwards — a longer buffer makes the agent HARDER to interrupt, worsening the exact complaint.",
      },
    ],
    takeaway: "Real-time voice is a latency-budgeting problem across additive stages (VAD → ASR → endpointing → LLM → TTS), and the metric that matters is p95 end-of-speech → first-audio, because human turn gaps are ~200ms and averages hide the tail turns users actually interrupt. Endpointing is the biggest controllable chunk — semantic endpointing shortens the silence timer without cutting people off — and barge-in (full-duplex + echo cancellation) is what keeps the agent from feeling robotic. The unifying fix is to stream everything so the pipeline pays first-chunk latencies instead of full-stage latencies (3–5× smaller); when still over budget, find the dominant stage and stream it, or collapse the hops with a speech-to-speech model.",
  },

  "voice-tts-cloning": {
    depthTier: "deep",
    interviewWeight: "medium",
    scenario: "You need a natural, low-latency voice for your agent, and marketing wants a custom brand voice cloned from your founder's recordings. An engineer picks a state-of-the-art neural TTS model that tops naturalness leaderboards and wires it in. Naturalness on recorded samples is excellent — but on the live agent, the first word takes over a second to come out, and the cloned voice reads every sentence with the same flat, unvarying intonation, so scripted disclaimers sound robotic. You must choose the TTS approach, understand how cloning works, control prosody, and reason about the consent/deepfake risk — before shipping.",
    explanation: [
      "Text-to-speech has evolved through three eras, and the modern split explains both the naturalness and the latency you're fighting.\n\n**Concatenative** TTS stitched together recorded snippets — natural in-snippet but choppy at joins and inflexible. **Parametric** TTS generated speech from a statistical model — flexible but buzzy/robotic. **Neural** TTS is today's default and comes in two connected pieces: an **acoustic model** (text → an intermediate acoustic representation, classically a mel-spectrogram) and a **vocoder** (that representation → the actual audio waveform).\n\n==That two-stage split — acoustic model then vocoder — is the mental model to hold, because latency, quality, and cloning each attach to a different stage.== Newer codec/LLM-style TTS (VALL-E, XTTS-family) blurs the two by predicting audio *codec tokens* autoregressively, which is what unlocks zero-shot cloning — but the acoustic/vocoder framing still explains the tradeoffs.",
      "The acoustic model decides *what* to say and *how it should sound*; the vocoder decides *how fast the first sound comes out.*\n\nThe acoustic model (Tacotron, FastSpeech, or a codec-token LLM) produces the spectrogram or codec tokens — this is where prosody, pacing, and speaker identity are determined. The vocoder (WaveNet historically; HiFi-GAN and streaming vocoders today) turns that into waveform samples.\n\n==For a real-time agent, the vocoder choice is a first-audio-latency decision: a **streaming vocoder** emits audio in small chunks as the acoustic model produces frames, so the first phoneme plays before the whole sentence is synthesized.== That's precisely the scenario's 'first word takes over a second' bug — a non-streaming, generate-then-vocode setup pays the full-sentence synthesis cost before any sound, which recorded-sample benchmarks never expose.",
      "**Zero-shot voice cloning** is the feature marketing wants, and its mechanism is a **speaker embedding.**\n\nA codec/LLM-style TTS model is trained on thousands of speakers to condition its output on a compact vector — a **speaker embedding** — extracted from a few seconds of reference audio. At inference, you feed 3–10 seconds of the founder's voice, the model computes that embedding, and it generates *new* text in that voice without any per-voice training. ==This is 'zero-shot' because there's no fine-tuning step: the model generalizes to an unseen voice from a single short reference, the same way an LLM generalizes to a new task from a few in-context examples.==\n\nMore reference audio and cleaner recordings yield a more faithful clone; a noisy 3-second clip yields an approximate one. Fine-tuning on more of the founder's audio can push fidelity higher, at the cost of a training step.",
      { type: "illustration", label: "The TTS pipeline and where each concern lives", content: `Text  ->  [ Acoustic model ]  ->  spectrogram / codec tokens  ->  [ Vocoder ]  ->  audio

  WHAT each stage owns:
    Acoustic model : words, PROSODY (pitch/pace/emphasis), SPEAKER IDENTITY
    Vocoder        : waveform quality + FIRST-AUDIO LATENCY (streaming or not)

  Zero-shot cloning:
    reference audio (3-10s)  ->  speaker embedding (a vector)  ->  condition the acoustic model
    no per-voice training -> "zero-shot"; more/cleaner audio -> better clone

  The scenario's two bugs map to two stages:
    "first word > 1s"      -> vocoder is not streaming (generate-then-vocode)
    "flat, same intonation"-> prosody uncontrolled; needs SSML / control tokens

  Recorded-sample leaderboards measure naturalness, NOT first-audio latency
  and NOT scripted-disclaimer prosody -> both bugs are invisible offline.` },
      "The 'flat intonation' complaint is a **controllability** problem, and it has a real fix.\n\nPure neural TTS predicts the single most-likely prosody for a sentence, so read in isolation each sentence sounds fine — but across a scripted flow (especially formal disclaimers) the model defaults to a uniform, average intonation that feels robotic. It sounds natural per-sample and monotonous in context.\n\n==The lever is explicit control: **SSML** (Speech Synthesis Markup Language) and model control tokens let you specify emphasis, pauses, pacing, and pitch — so you *tell* the model to stress the right word and slow down for the disclaimer rather than hoping it infers it.== Prosody lives in the acoustic model, so this is where you intervene; it's the difference between a technically-natural voice and one that sounds like it means what it's saying.",
      "There's a hard **safety and governance** layer here — and it's increasingly an interview and compliance topic, not an afterthought.\n\nCloning a voice from seconds of audio is exactly the capability that enables **impersonation and deepfakes** — vishing scams, fake authorizations, non-consensual likeness use. Shipping a brand voice therefore carries obligations: **consent** (a documented right to use the founder's voice — and never cloning a voice you don't have permission for), **watermarking** (embedding an inaudible signal so synthetic audio is detectable), and **disclosure** (telling callers they're speaking to an AI where law or policy requires it).\n\n==The rule to internalize: voice-cloning capability is a governance surface, not just a feature — consent, watermarking, and disclosure are ship-blocking requirements, not nice-to-haves, and 'we can clone any voice from a clip' is a liability as much as a capability.==",
      "Putting it together, the TTS choice is the familiar **naturalness vs. latency vs. control** tradeoff, and 'tops the leaderboard' is the wrong selection criterion — the same trap as picking ASR on offline WER.\n\nCodec/LLM-style TTS gives the best naturalness and zero-shot cloning but is autoregressive and can be heavier/slower; classic acoustic-model + streaming-vocoder stacks (FastSpeech + HiFi-GAN) give lower, more predictable first-audio latency with strong controllability. For a real-time agent you weight **streaming first-audio latency and SSML control** heavily; for an offline audiobook you weight raw naturalness.\n\n==Choose the TTS from the deployment constraint — a real-time agent needs a streaming vocoder and prosody control, so the naturalness-leaderboard winner can be the wrong pick, exactly as it was in the scenario.==",
    ],
    keyPoints: [
      "**Neural TTS is two stages: acoustic model + vocoder.** The acoustic model owns words, prosody, and speaker identity; the vocoder owns waveform quality and first-audio latency. Latency, quality, and cloning each attach to a different stage, so hold this split.",
      "**A streaming vocoder is a first-audio-latency decision.** It emits audio in chunks as the acoustic model produces frames, so the first phoneme plays before the sentence finishes. A generate-then-vocode setup pays full-sentence synthesis before any sound — the 'first word takes >1s' bug.",
      "**Zero-shot cloning works via a speaker embedding.** A model trained on many speakers extracts a conditioning vector from 3–10s of reference audio and generates new text in that voice with no per-voice training. More/cleaner reference audio → a more faithful clone; fine-tuning trades a training step for higher fidelity.",
      "**Flat intonation is a controllability problem, fixed with SSML / control tokens.** Pure neural TTS predicts one average prosody — natural per-sample, monotonous across a scripted flow. Explicit markup for emphasis, pauses, pacing, and pitch (in the acoustic model) fixes it.",
      "**Voice cloning is a governance surface.** The same capability enables impersonation/deepfakes, so consent (documented right to the voice), watermarking (detectable synthetic audio), and disclosure (telling callers it's AI) are ship-blocking requirements, not features.",
      "**Choose TTS from the deployment constraint, not the naturalness leaderboard.** Real-time agents weight streaming first-audio latency and SSML control heavily; offline audiobooks weight raw naturalness — so the leaderboard winner can be the wrong pick for a live agent.",
    ],
    recap: [
      "**Neural TTS = acoustic model (words, prosody, speaker identity) + vocoder (waveform + first-audio latency).** Concatenative → parametric → neural → codec/LLM-style.",
      "**Streaming vocoder = low first-audio latency:** emits audio in chunks as frames are produced; generate-then-vocode pays full-sentence synthesis first (the '>1s first word' bug).",
      "**Zero-shot cloning = speaker embedding** from 3–10s reference audio conditions the model; no per-voice training. More/cleaner audio → better clone; fine-tune for higher fidelity.",
      "**Flat intonation = uncontrolled prosody:** neural TTS predicts one average prosody; fix with SSML / control tokens for emphasis, pauses, pacing (in the acoustic model).",
      "**Governance is ship-blocking:** cloning enables impersonation/deepfakes → consent, watermarking, and AI disclosure are requirements, not nice-to-haves.",
      "**Pick TTS from the deployment constraint:** real-time → streaming vocoder + SSML control; offline → raw naturalness. Leaderboard winner ≠ right agent voice.",
    ],
    mcqs: [
      {
        question: "A team picks a leaderboard-topping neural TTS model for a real-time agent. Naturalness on recorded samples is excellent, but on the live agent the first word takes over a second to come out. Which stage is responsible, and what's the fix?",
        options: [
          "The acoustic model is too small; upgrading it will make the first word arrive faster",
          "The vocoder is non-streaming (generate-then-vocode), so the system synthesizes the whole sentence's waveform before any audio plays — switching to a streaming vocoder that emits audio in chunks as acoustic frames are produced lets the first phoneme play before the sentence finishes",
          "The text is too long; truncating every reply to five words will fix first-audio latency",
          "Network latency to the TTS service is the cause; recorded-sample benchmarks just ran locally",
        ],
        correct: 1,
        explanation: "Option B is correct: first-audio latency lives in the vocoder stage. A non-streaming vocoder waits until the full spectrogram/codec sequence exists and vocodes the whole sentence before emitting any waveform — so nothing plays for over a second. A streaming vocoder produces audio in small chunks as the acoustic model emits frames, so the first phoneme is audible almost immediately. Recorded-sample leaderboards measure naturalness on complete clips and never surface this, which is why it slipped through. Option A is wrong — the acoustic model determines what's said and its prosody, not first-audio latency; a bigger one doesn't make the first sample arrive sooner and may make it slower. Option C is wrong — reply length affects total duration, not time-to-first-audio, which depends on how quickly the first chunk is produced; truncating replies is a UX regression, not a latency fix. Option D is a distractor — network latency is small and constant and doesn't explain a >1s first word; the signature here is whole-sentence synthesis before playback.",
      },
      {
        question: "Marketing wants a brand voice cloned from ~8 seconds of the founder's recordings, with no per-voice training pipeline. How does zero-shot voice cloning make this possible?",
        options: [
          "The model memorizes the exact 8-second clip and replays slices of it whenever the founder's voice is needed",
          "The model was trained on many speakers to condition on a speaker embedding — a compact vector extracted from the short reference clip — so at inference it computes that embedding and generates entirely new text in the founder's voice with no fine-tuning step, generalizing to the unseen voice from one short reference",
          "Zero-shot cloning requires fine-tuning the full model on the 8-second clip for a few epochs before it can speak",
          "The model transcribes the clip and re-reads the text in a generic voice that happens to resemble the founder",
        ],
        correct: 1,
        explanation: "Option B is correct: zero-shot cloning conditions a multi-speaker TTS model on a speaker embedding — a vector computed from a few seconds of reference audio — and generates new, arbitrary text in that voice without any per-voice training. 'Zero-shot' means exactly this: no fine-tuning, the model generalizes to an unseen voice from one short reference (analogous to few-shot in-context prompting for LLMs). Option A is wrong — it does not replay slices of the clip; it synthesizes new speech for new text, guided by the embedding, so it can say words never present in the reference. Option C is wrong — requiring fine-tuning would make it not zero-shot; fine-tuning is an optional path to higher fidelity, not a requirement. Option D is wrong — the clone reproduces the founder's timbre and identity via the embedding, not a generic voice that merely resembles them.",
      },
      {
        question: "The cloned voice sounds natural on isolated samples but reads scripted disclaimers with flat, unvarying intonation that feels robotic. What is the cause, and the correct lever?",
        options: [
          "The vocoder is degrading quality; a higher-fidelity vocoder will restore expressive intonation",
          "Pure neural TTS predicts a single average prosody, so it sounds fine per-sentence but monotonous across a scripted flow — the fix is explicit prosody control via SSML or model control tokens (emphasis, pauses, pacing, pitch) applied at the acoustic-model stage, so you tell it how to inflect rather than hoping it infers it",
          "The speaker embedding is wrong; re-recording the reference clip will add intonation variety",
          "The problem is latency; making the vocoder stream will also make the intonation more expressive",
        ],
        correct: 1,
        explanation: "Option B is correct: prosody is determined in the acoustic model, and pure neural TTS predicts the single most-likely (average) prosody for each sentence. That reads naturally in isolation but produces uniform, robotic intonation across a scripted sequence like disclaimers. The lever is explicit control — SSML or control tokens for emphasis, pauses, pacing, and pitch — so you specify the intonation instead of relying on the model's default. Option A is wrong — the vocoder controls waveform fidelity, not intonation; a better vocoder makes flat prosody sound cleaner, still flat. Option C is wrong — the speaker embedding sets identity/timbre, not sentence-level expressiveness; a new clip won't add controlled emphasis to the disclaimers. Option D is wrong — streaming fixes first-audio latency, an orthogonal concern; it does nothing for prosody.",
      },
      {
        question: "Before shipping the cloned founder voice, which consideration is a ship-blocking requirement rather than an optional nicety?",
        options: [
          "Adding more languages to the TTS model, since a brand voice should be multilingual",
          "Governance: documented consent to use the founder's voice (and never cloning a voice without permission), watermarking so the synthetic audio is detectable, and disclosure that callers are speaking to an AI where required — because the same few-seconds cloning capability enables impersonation and deepfakes, making these compliance requirements, not features",
          "Maximizing naturalness on the leaderboard so the clone is indistinguishable from the real founder",
          "Reducing model size so the clone runs on a phone, since on-device inference removes all consent concerns",
        ],
        correct: 1,
        explanation: "Option B is correct: voice cloning from seconds of audio is exactly the capability that enables impersonation, vishing, and non-consensual likeness use, so shipping a cloned voice carries governance obligations — documented consent to use the voice, watermarking to make synthetic audio detectable, and AI disclosure where law or policy requires it. These are ship-blocking requirements. Option A is wrong — multilingual support is a feature scope decision, not a safety gate. Option C is backwards — maximizing indistinguishability without watermarking/consent increases deepfake risk; naturalness is not a governance control. Option D is wrong — on-device inference changes where computation happens, not whether you have the legal right and disclosure obligations; consent concerns don't vanish because the model is local.",
      },
    ],
    takeaway: "Neural TTS is an acoustic model (words, prosody, speaker identity) feeding a vocoder (waveform quality and first-audio latency), and the scenario's two bugs map cleanly to the two stages: a non-streaming vocoder causes the >1s first word (fix: streaming vocoder), and uncontrolled prosody causes the flat disclaimers (fix: SSML / control tokens). Zero-shot cloning conditions a multi-speaker model on a speaker embedding from a few seconds of audio — no per-voice training — which is why it also raises consent, watermarking, and disclosure as ship-blocking governance, not features. As with ASR, choose TTS from the deployment constraint (real-time → streaming vocoder + prosody control), because the naturalness-leaderboard winner can be the wrong pick for a live agent.",
  },

  "voice-realtime-agents": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: "You're the lead on a production voice agent for phone support. In the pilot, it transcribes and speaks beautifully — ASR and TTS both benchmark well in isolation — yet real calls go badly: it talks over people, acts confidently on mis-heard entities (booking a 'Tuesday' the caller never said), and stumbles when it has to call a scheduling tool mid-conversation. The individual components are strong but the *conversation* fails. You have to design the turn-taking and dialogue-management layer that sits on top of ASR and TTS and decide whether to build it cascaded or on a native speech-to-speech model.",
    explanation: [
      "The scenario is the central lesson of voice agents: ==strong ASR plus strong TTS does not make a good agent — the hard problem is the **conversation layer** between them: turn-taking, error recovery, and dialogue management.==\n\nComponent benchmarks measure ASR word accuracy and TTS naturalness on isolated clips. Neither measures whether the agent *knows when to speak*, *lets itself be interrupted*, or *recovers from a mis-heard word*. Those are properties of the orchestration layer, and they're exactly what make an agent feel human versus robotic.\n\nThat's why the pilot's components look great and the calls feel broken — the failures live in a layer the component metrics never touch.",
      "**Turn-taking** is the first hard problem, and it has three parts that separate human-feeling agents from robotic ones.\n\n**Endpointing** — deciding the user is done so the agent can respond (too eager cuts them off; too slow feels sluggish). **Barge-in** — letting the user interrupt: when they start talking, the agent must cancel its in-flight TTS and yield the floor. **Backchannels** — the little 'mm-hmm' / 'right' acknowledgments humans use to signal 'I'm listening' without taking the turn.\n\n==Get turn-taking wrong and no amount of ASR/TTS quality saves you: the agent talks over people (no barge-in) or leaves dead air (bad endpointing), which is precisely the pilot's 'talks over people' complaint.== Turn-taking is the make-or-break of felt naturalness.",
      "The next design fork is the **orchestration architecture: cascaded vs. speech-to-speech**, and it's a genuine tradeoff, not a clear winner.\n\n**Cascaded** runs ASR → LLM → TTS as separate services. You get **full control and inspectability at each stage** — you can log the transcript, guardrail the LLM's text, swap the voice, and (critically) do reliable **tool calling** on structured LLM output. The cost is **latency** (three hops) and **lost prosody/emotion** (the caller's tone is flattened to text and never reaches the LLM).\n\n**Speech-to-speech** (native-audio models) takes audio in and emits audio out in one model. You get the **lowest latency, natural prosody, and preserved emotion/tone** — but it's **harder to inspect and guardrail**, and **tool-calling is still maturing**. ==The rule: cascaded when you need control, logging, and reliable tool use (most enterprise phone support today); speech-to-speech when latency and prosody dominate and your tool needs are light.==",
      { type: "illustration", label: "Cascaded vs speech-to-speech — the real tradeoff", content: `CASCADED (ASR -> LLM -> TTS)          SPEECH-TO-SPEECH (native audio)
  + control + inspectable at each stage   + lowest latency (one model, no hops)
  + reliable tool-calling on text output  + natural prosody, preserves tone/emotion
  + easy to log / guardrail / swap voice  + no ASR->text->LLM information loss
  - higher latency (3 service hops)       - harder to inspect / guardrail
  - loses caller prosody/emotion (-> text) - tool-calling still maturing
  - error surface: ASR mistakes propagate  - errors are opaque (audio in, audio out)

Pick from requirements, not hype:
  need audit logs, guardrails, robust tool-calls -> CASCADED (most phone support)
  need minimum latency + emotional nuance, light tools -> SPEECH-TO-SPEECH` },
      "**Robustness to ASR errors** is the fix for the pilot's most dangerous bug — acting on a mis-heard entity.\n\nASR is never perfect, so the agent must treat transcripts as *probabilistic*, not gospel. The tools: **confidence scores** (ASR emits per-word/per-entity confidence — low confidence on a critical slot should trigger caution), and **confirmation strategies** (explicitly read back high-stakes entities: 'I heard Tuesday the 14th — is that right?').\n\n==The failure mode to design against is *silently acting on a low-confidence entity*: booking the 'Tuesday' the caller never said. The fix is confirm-then-act on critical slots and graceful re-prompting ('sorry, which day?') instead of committing to a guess.== A great agent is not one that never mis-hears — it's one that mis-hears *safely* by confirming before it acts.",
      "**Tool calling over voice** is where the pilot 'stumbles,' and voice adds constraints text chat doesn't have.\n\nIn a cascaded agent, the LLM calls functions (check_availability, book_slot) mid-call from the running dialogue state. Voice-specific challenges: (1) you must **fill and confirm slots conversationally** ('what day?' → 'did you say Tuesday?') before calling the tool, since a wrong slot books the wrong thing; (2) tool latency now competes with the **conversational latency budget** — a 2-second API call is dead air, so the agent should **cover the gap** ('let me check that for you...') and stream; (3) the LLM must **track dialogue state** across turns (who, what, which slots are confirmed) rather than treating each turn fresh.\n\n==Voice tool-calling is slot-filling + confirmation + latency-masking, not just 'the LLM emits a function call' — the conversation has to carry the user through the wait and confirm before committing.==",
      "**Interruption + duplex handling** ties turn-taking and tool-calling together at the systems level.\n\nWhen the user barges in mid-response, the agent must (1) cancel in-flight TTS immediately, (2) *discard or re-plan* the response it was giving (the user's interruption may change everything), and (3) if a tool call was in flight, decide whether it's still relevant. This requires **full-duplex** operation — listening and speaking channels open simultaneously — plus **echo cancellation** so the agent's own audio isn't mistaken for the user.\n\n==Half-duplex agents (listen, then speak, strictly alternating) feel robotic because real conversation is overlapping and interruptible; full-duplex with clean barge-in is what makes the agent feel like it's actually *in* the conversation.== This is the systems backbone under natural turn-taking.",
      "Zooming out, designing a voice agent is designing the **conversation layer** on top of solid components — and the interview answer names all four concerns.\n\nThe checklist: **turn-taking** (endpointing + barge-in + backchannels), **error robustness** (confidence + confirm critical slots), **tool-calling over voice** (slot-fill, confirm, mask latency, track state), and the **architecture choice** (cascaded for control/tools/logging vs. speech-to-speech for latency/prosody). Strong ASR and TTS are table stakes; the design *is* the layer between them.\n\n==The one-line thesis: a voice agent lives or dies on turn-taking and safe error recovery — pick cascaded vs. speech-to-speech from your control-and-tooling needs, and never let the agent act on an unconfirmed, low-confidence entity.==",
    ],
    keyPoints: [
      "**Strong ASR + strong TTS ≠ a good agent.** The hard problem is the conversation layer between them — turn-taking, error recovery, dialogue management — which component benchmarks never measure. That's why great components can still make broken calls.",
      "**Turn-taking has three parts:** endpointing (when the user is done), barge-in (letting them interrupt — cancel in-flight TTS and yield), and backchannels ('mm-hmm'). Get it wrong and the agent talks over people or leaves dead air regardless of ASR/TTS quality.",
      "**Cascaded vs. speech-to-speech is a real tradeoff.** Cascaded (ASR→LLM→TTS) gives control, inspectability, logging, and reliable tool-calling on text output, at the cost of latency and lost prosody. Speech-to-speech gives lowest latency and preserved prosody/emotion, but is harder to guardrail and its tool-calling is still maturing.",
      "**Treat transcripts as probabilistic, not gospel.** Use ASR confidence scores and confirm high-stakes entities ('I heard Tuesday — right?') before acting. The dangerous failure is silently booking a low-confidence 'Tuesday' the caller never said; the fix is confirm-then-act and graceful re-prompting.",
      "**Voice tool-calling = slot-fill + confirm + latency-masking + state tracking.** Confirm slots conversationally before calling tools, cover tool latency with filler and streaming so it isn't dead air, and track dialogue state across turns — not just 'the LLM emits a function call.'",
      "**Barge-in needs full-duplex + echo cancellation.** Cancel in-flight TTS, discard/re-plan the response, and reconsider any in-flight tool call. Half-duplex strict-alternation feels robotic; full-duplex with clean barge-in is what makes the agent feel present in the conversation.",
    ],
    recap: [
      "**The core lesson:** strong ASR + strong TTS don't make a good agent; the conversation layer (turn-taking, error recovery, dialogue mgmt) does — and component benchmarks miss it.",
      "**Turn-taking = endpointing + barge-in + backchannels.** Wrong here → talks over people / dead air, no matter how good ASR/TTS is.",
      "**Cascaded vs speech-to-speech:** cascaded = control + logging + reliable tool-calls, higher latency, loses prosody; speech-to-speech = lowest latency + prosody, harder to guardrail, tool-calling maturing.",
      "**Robustness to ASR errors:** transcripts are probabilistic — use confidence scores, confirm critical slots before acting, re-prompt gracefully. Never silently act on a mis-heard 'Tuesday.'",
      "**Voice tool-calling:** slot-fill + confirm + mask tool latency (filler/streaming) + track dialogue state across turns.",
      "**Barge-in = full-duplex + echo cancellation:** cancel in-flight TTS, re-plan, reconsider in-flight tool calls. Half-duplex feels robotic; full-duplex feels present.",
    ],
    mcqs: [
      {
        question: "A voice-support pilot has excellent ASR (low WER) and excellent TTS (high naturalness) in component tests, yet real calls go badly — it talks over people and mishandles multi-turn flows. What is the most accurate diagnosis?",
        options: [
          "The ASR and TTS benchmarks were faked; the components must actually be weak",
          "Component quality is necessary but not sufficient — the failures live in the conversation layer (turn-taking, error recovery, dialogue management) that sits between ASR and TTS, and component benchmarks never measure whether the agent knows when to speak, can be interrupted, or recovers from mis-hearings",
          "The LLM in the middle is too large, so it's slow; a smaller LLM would fix the talking-over and multi-turn issues",
          "The problem is purely audio quality; upgrading the microphone and speaker codecs will resolve it",
        ],
        correct: 1,
        explanation: "Option B is correct: ASR word accuracy and TTS naturalness are properties of isolated components, but 'talks over people' and 'mishandles multi-turn flows' are properties of the orchestration layer — endpointing, barge-in, dialogue state, and error recovery — which component benchmarks don't touch. Strong components are table stakes; the conversation layer is where agents are made or broken. Option A is wrong — the benchmarks aren't faked; they simply measure the wrong thing for conversational quality. Option C is wrong — LLM size affects latency, not the presence of barge-in or dialogue-state tracking; a smaller model that still lacks turn-taking logic will still talk over people. Option D is wrong — audio codecs affect fidelity, not turn-taking or multi-turn handling; better hardware won't teach the agent when to yield the floor.",
      },
      {
        question: "The agent booked a 'Tuesday' appointment the caller never said — the ASR mis-heard the day and the agent acted on it. Which design change most directly prevents this class of failure?",
        options: [
          "Retrain the ASR until word error rate reaches 0%, so mis-hearings can never happen",
          "Treat transcripts as probabilistic: use ASR confidence scores on critical slots and explicitly confirm high-stakes entities before acting ('I heard Tuesday the 14th — is that right?'), with graceful re-prompting on low confidence instead of silently committing to a guess",
          "Increase the TTS speaking rate so the agent finishes booking before the caller can object",
          "Remove the confirmation step to reduce latency, since confirmations annoy users and slow the call",
        ],
        correct: 1,
        explanation: "Option B is correct: ASR is never perfect, so the robust design treats transcripts as probabilistic — read confidence scores on critical slots and confirm high-stakes entities (dates, names, amounts) before acting, re-prompting when confidence is low. A good agent mis-hears safely by confirming before committing, rather than silently acting on a guess. Option A is wrong — 0% WER is unattainable, and a design that depends on perfect ASR is brittle; the point is to be robust to the errors that will happen. Option C is wrong and dangerous — speaking faster to commit before the user objects removes their ability to correct a mistake, the opposite of safe error recovery. Option D is backwards — removing confirmation is exactly what caused the mis-booking; for critical slots, confirm-then-act is the safeguard, and the small latency cost is worth avoiding wrong actions.",
      },
      {
        question: "You're choosing between a cascaded (ASR→LLM→TTS) architecture and a native speech-to-speech model for enterprise phone support that must log every interaction, apply content guardrails, and reliably call scheduling and CRM tools. Which fits better, and why?",
        options: [
          "Speech-to-speech, because its lower latency automatically makes tool-calling, logging, and guardrails easier",
          "Cascaded, because it exposes structured text at each stage — enabling reliable tool-calling on the LLM's output, transcript logging, and guardrailing — which matches the control and tooling requirements, accepting higher latency and some lost prosody as the tradeoff",
          "Either one works identically; the choice is purely about which vendor is cheaper",
          "Speech-to-speech, because enterprise support never needs to inspect or guardrail model output",
        ],
        correct: 1,
        explanation: "Option B is correct: cascaded pipelines produce structured text at the ASR and LLM stages, which is exactly what you need to log transcripts, apply guardrails to the LLM's output, and do reliable tool-calling on structured function calls. Those are the stated requirements, so cascaded fits — the price is higher latency (three hops) and flattened prosody. Option A is wrong — speech-to-speech's lower latency does not make it easier to log, guardrail, or tool-call; those are precisely the areas where native-audio models are harder to inspect and where tool-calling is still maturing. Option C is wrong — the two architectures have materially different control/latency/prosody/tooling profiles; it's not a cost-only decision. Option D is wrong — enterprise support very much needs inspection and guardrails (compliance, safety), which is an argument FOR cascaded, not against it.",
      },
      {
        question: "The agent needs to call a scheduling API mid-call, but the API takes ~2 seconds to respond, creating dead air, and the caller sometimes interrupts during it. What does robust voice tool-calling require here?",
        options: [
          "Block the entire pipeline during the API call so nothing interferes, and ignore any user speech until the tool returns",
          "Confirm the slots before calling ('did you say Tuesday the 14th?'), mask the tool latency conversationally ('let me check that for you...') with streaming so it isn't dead air, track dialogue state across turns, and support barge-in so if the user interrupts during the call the agent can cancel in-flight TTS and re-plan (including reconsidering whether the in-flight tool call is still relevant)",
          "Increase the API timeout so the call always completes, regardless of what the user does",
          "Move the tool call to after the conversation ends, so it never competes with the latency budget",
        ],
        correct: 1,
        explanation: "Option B is correct: voice tool-calling is more than emitting a function call. You confirm slots before committing (a wrong slot books the wrong thing), mask the tool's latency with conversational filler and streaming so a 2-second call isn't silent dead air, track dialogue state across turns, and keep barge-in working — if the user interrupts, cancel in-flight TTS, re-plan, and reconsider whether the in-flight tool call still matters. Option A is wrong — blocking the pipeline and ignoring user speech breaks barge-in and makes the agent feel frozen and robotic during the wait. Option C is wrong — a longer timeout doesn't address the dead air or the interruption; it just risks even longer silences. Option D is wrong — deferring the tool call until after the conversation defeats the purpose (the caller needs the scheduling result mid-call to continue); the challenge is handling the latency in-conversation, not avoiding it.",
      },
    ],
    takeaway: "A production voice agent is designed at the conversation layer, not the components: strong ASR and TTS are table stakes, and the failures — talking over people, acting on mis-heard entities, stumbling on mid-call tools — live in turn-taking, error recovery, and dialogue management. Turn-taking (endpointing + barge-in + backchannels) and safe error recovery (confidence scores, confirm critical slots before acting) are make-or-break, and voice tool-calling means slot-fill + confirm + latency-masking + state tracking with full-duplex barge-in underneath. Choose cascaded vs. speech-to-speech from your needs — cascaded for control, logging, and reliable tool use (most enterprise phone support today); speech-to-speech for latency and prosody with lighter tooling.",
  },

  "voice-eval-wer-mos": {
    depthTier: "light",
    interviewWeight: "medium",
    scenario: "Leadership asks 'is our voice product good enough to ship?' The team reports a 6% word error rate (WER) on ASR and a 4.2 MOS (mean opinion score) on TTS and recommends shipping — both numbers beat the last release. But a support engineer notices something odd: on a batch of failed calls, WER was under 5%, yet every one of those calls got the appointment date or the account number wrong, and users abandoned. Strong component metrics, failed conversations. You need to explain what WER and MOS actually measure, where they mislead, and how to evaluate a *whole* voice agent rather than its parts.",
    explanation: [
      "**WER (Word Error Rate)** is the ASR standard, and its definition tells you exactly what it does and doesn't capture.\n\n`WER = (Substitutions + Insertions + Deletions) / (number of reference words)`. Align the hypothesis to the reference transcript, count the three edit types, divide by reference length. It's an **edit distance**, so every word counts the same.\n\n==That equal weighting is the whole limitation: WER treats a dropped 'the' and a wrong drug name or account number as identical one-word errors, even though only one of them breaks the task.== A 6% WER means 6 of every 100 words are wrong on average — but *which* words, WER cannot tell you.",
      "The scenario's paradox — low WER, failed calls — is the classic WER trap, and it's the number-one interview point on ASR eval.\n\n==A 5% WER that lands on the ONE critical entity (the appointment date, the account number) is worse for the product than a 15% WER spread across filler words ('um', 'the', 'you know') that don't change meaning.== WER is entity-blind: it can look excellent while systematically corrupting exactly the words the downstream task depends on.\n\nThat's precisely what the support engineer found: sub-5% WER on calls where the single load-bearing entity was wrong. The aggregate metric was healthy; the task-relevant errors were fatal. This is why WER is necessary but never sufficient for a product decision.",
      { type: "illustration", label: "Two transcripts, same WER, opposite outcomes", content: `Reference: "book the appointment for Tuesday the fourteenth at account 4471"
                                                      (12 words)

Hypothesis A (1 error on filler):
  "book THE appointment for Tuesday the fourteenth at account 4471"
   -> "book uh the ..." style slip, 1 wrong filler word
   WER = 1/12 = 8.3%   TASK OUTCOME: SUCCESS (entities intact)

Hypothesis B (1 error on the entity):
  "book the appointment for THURSDAY the fourteenth at account 4471"
   -> Tuesday -> Thursday, 1 substitution
   WER = 1/12 = 8.3%   TASK OUTCOME: FAILURE (wrong day booked)

Same WER. Opposite product result. WER cannot tell these apart.
-> track ENTITY / KEYWORD error rate on the words the task depends on.` },
      "Because WER is entity-blind, the fixes are **task-weighted metrics** plus disciplined **normalization.**\n\nTrack **entity error rate / keyword error rate** — WER computed only over the words that matter (dates, names, IDs, drug names) — so an error on a load-bearing entity is visible and heavily weighted. Consider **semantic accuracy**: did the transcript preserve *meaning*, even if wording differs? And beware **normalization pitfalls**: how you handle numbers ('fourteen' vs '14'), punctuation, and casing can swing WER by points without any real quality change — so normalize reference and hypothesis consistently or you'll measure formatting, not accuracy.\n\n==The upgrade over raw WER is to weight errors by task impact, not to count all words equally — because the product only fails on the words that carry the task.==",
      "**TTS is evaluated by MOS (Mean Opinion Score)** — and its nature (subjective, human) is both its value and its weakness.\n\nMOS is a **subjective 1–5 rating** of naturalness, averaged over many human listeners. 4.2/5 means 'listeners judged it quite natural.' It's the TTS gold standard *because* naturalness is perceptual — there's no ground-truth waveform to diff against. But human MOS is **slow and expensive** (you need a listening panel), and it's **relative**: scores drift across studies, listener pools, and rating scales, so a 4.2 in one study isn't strictly comparable to a 4.2 in another.\n\n==So MOS is trustworthy as a *within-study* comparison (is voice A more natural than voice B, rated by the same panel) but shaky as an absolute cross-study number — and it says nothing about whether the voice succeeds *in the conversation.*==",
      "Because human MOS is costly, teams use **objective proxies** — useful but limited.\n\n**MCD (Mel-Cepstral Distortion)** measures spectral distance to a reference recording — cheap and automatic, but it needs a reference and correlates only loosely with perceived naturalness. **Neural MOS predictors** (e.g. UTMOS) are models trained to *predict* human MOS from audio — fast and reference-free, great for regression-testing that a change didn't degrade quality. ==But a predictor is only as good as its training distribution: it can miss failure modes humans would catch (odd prosody, artifacts on rare inputs), so proxies gate CI, human MOS confirms before ship.== Never treat a predicted MOS as a human verdict.",
      "The deepest point, and the resolution of the scenario, is the **component-vs-system trap.**\n\n==Strong ASR (low WER) + strong TTS (high MOS) can still produce a bad agent, because the agent's quality is a property of the *whole conversation* — turn-taking, error recovery, dialogue success — not of its parts.== The team's 6% WER and 4.2 MOS are component metrics; the calls failed on entity errors and, likely, on turn-taking and confirmation — none of which WER or MOS measure.\n\nSo evaluating a voice agent requires **end-to-end metrics**: **task success rate** (did the caller accomplish their goal — book the appointment, resolve the issue?), **turn/first-audio latency** at p95, **interruption/barge-in handling**, and **conversation-level success** ('did the whole call succeed'). Task success rate is the one that would have caught the scenario: those low-WER calls had a *failing* task success rate.",
      "So the answer to leadership's question is: **component metrics gate components; task success gates the ship.**\n\nUse WER (with entity error rate) to catch ASR regressions, MOS (with neural-predictor proxies for CI) to catch TTS regressions — these are your leading indicators per component. But the ship decision rides on **end-to-end task success rate and conversation quality on realistic calls**, because that's the only metric that captures the entity errors, turn-taking failures, and confirmation gaps that make components-good, calls-bad.\n\n==The interview thesis: WER and MOS tell you if the *parts* are healthy; only end-to-end task success tells you if the *product* works — and a low WER on the wrong words is exactly how a healthy-looking dashboard ships a broken agent.==",
    ],
    keyPoints: [
      "**WER = (Substitutions + Insertions + Deletions) / reference words** — an edit distance that weights every word equally. It tells you the *rate* of word errors, never *which* words, so it's entity-blind by construction.",
      "**A low WER on a critical entity beats a high WER on filler — for the product.** A 5% WER that corrupts the appointment date or account number fails the task; a 15% WER on 'um'/'the' doesn't. This is the WER trap and the top ASR-eval interview point.",
      "**Upgrade WER with task-weighted metrics and clean normalization.** Track entity/keyword error rate over load-bearing words, consider semantic accuracy, and normalize numbers/punctuation/casing consistently so you measure accuracy, not formatting.",
      "**MOS is a subjective 1–5 human naturalness rating** — the TTS gold standard because naturalness is perceptual, but slow, expensive, and relative (not strictly comparable across studies). It measures naturalness, not conversational success.",
      "**Objective MOS proxies (MCD, neural predictors like UTMOS) gate CI; human MOS confirms before ship.** Predictors are only as good as their training distribution and can miss failure modes humans catch — never treat a predicted MOS as a human verdict.",
      "**Component-vs-system trap: strong ASR + strong TTS can still be a bad agent.** Evaluate end-to-end — task success rate, p95 turn/first-audio latency, barge-in handling, conversation-level success. Task success rate is what catches components-good, calls-bad.",
    ],
    recap: [
      "**WER = (S+I+D)/reference words**, an equal-weight edit distance — tells you the rate of errors, never which words.",
      "**The WER trap:** a 5% WER on the critical entity (date, account number) is worse than a 15% WER on filler. WER is entity-blind.",
      "**Fix WER** with entity/keyword error rate, semantic accuracy, and consistent normalization (numbers/punctuation/casing) so you don't measure formatting.",
      "**MOS = subjective 1–5 naturalness**, averaged over listeners — gold standard for TTS but slow, costly, and relative across studies; not a conversational-success metric.",
      "**MOS proxies:** MCD (needs reference, loose correlation) and neural predictors like UTMOS (fast, reference-free) gate CI; human MOS confirms before ship.",
      "**Component-vs-system trap:** strong ASR + strong TTS ≠ good agent. Ship on end-to-end task success rate, p95 latency, barge-in, and conversation success — not component metrics alone.",
    ],
    mcqs: [
      {
        question: "A team reports 6% WER and recommends shipping, but a batch of abandoned calls had WER under 5% while every one got the appointment date or account number wrong. What does this reveal about WER?",
        options: [
          "The WER was computed incorrectly; a correct computation would show a high WER on those failed calls",
          "WER is an equal-weight edit distance (S+I+D over reference words), so it treats a wrong critical entity the same as a dropped filler word — it can look excellent while corrupting exactly the load-bearing words the task depends on, which is why sub-5% WER coexisted with total task failure",
          "WER only applies to TTS, so using it for ASR was the mistake",
          "The failed calls had audio problems, so WER is irrelevant to them",
        ],
        correct: 1,
        explanation: "Option B is correct: WER counts substitutions, insertions, and deletions over reference length, weighting every word equally. A single substitution on the appointment date ('Tuesday'→'Thursday') is one error, exactly like dropping a 'the' — but only one breaks the task. So WER can read under 5% while the specific load-bearing entities are wrong, producing the paradox of healthy WER and failed calls. Option A is wrong — the WER wasn't miscalculated; it was correctly low precisely because most words (the filler and structure) were right and only the critical entity was wrong. Option C is wrong — WER is the ASR metric, not TTS (that's MOS); using it for ASR is correct, it's just insufficient. Option D is wrong — the failures were entity substitutions captured by the transcript, not an audio artifact that makes WER inapplicable; WER is very relevant, it just weights the wrong things.",
      },
      {
        question: "Given the low-WER-but-failed-calls problem, which metric change most directly surfaces the failures WER hid?",
        options: [
          "Report WER to two decimal places for more precision",
          "Track entity / keyword error rate — WER computed only over the task-critical words (dates, names, account IDs) — so an error on a load-bearing entity is visible and weighted by task impact instead of being averaged away among correct filler words",
          "Switch the ASR eval from WER to MOS, since MOS is a newer metric",
          "Only evaluate on calls with high overall WER, since those are the risky ones",
        ],
        correct: 1,
        explanation: "Option B is correct: the hidden failures are errors on critical entities, and entity/keyword error rate isolates exactly those words — computing error rate only over dates, names, IDs, etc. — so an entity error is no longer diluted by dozens of correctly transcribed filler words. This weights errors by task impact, which is the upgrade over raw WER. Option A is wrong — more decimal places doesn't change what WER measures; it still averages all words equally and stays entity-blind. Option C is wrong — MOS rates TTS naturalness, not ASR accuracy; it doesn't measure entity errors at all and isn't a substitute for WER. Option D is backwards — the dangerous calls in the scenario had LOW overall WER, so filtering to high-WER calls would exclude exactly the failures you need to catch.",
      },
      {
        question: "The team's TTS scores 4.2 MOS. A colleague wants to run a nightly automated regression test to catch quality drops but can't convene a human listening panel every night. What's the right approach?",
        options: [
          "Skip TTS quality regression testing entirely, since only human MOS is valid and it's too slow to run nightly",
          "Use an objective proxy (a neural MOS predictor like UTMOS, or MCD against reference audio) to gate nightly CI and catch regressions cheaply, then confirm with a human MOS study before shipping — because predictors are fast and reference-free but only as good as their training distribution and can miss failure modes humans would catch",
          "Report the 4.2 MOS every night as-is, since MOS doesn't change unless the model changes",
          "Replace MOS with WER for TTS, since WER can be computed automatically every night",
        ],
        correct: 1,
        explanation: "Option B is correct: neural MOS predictors (UTMOS) and MCD are automatic proxies suited to nightly CI — they catch regressions cheaply without a human panel. But because a predictor is only as reliable as its training distribution and can miss artifacts or odd prosody humans would notice, you gate CI with the proxy and confirm with human MOS before a real ship. Proxies gate, humans confirm. Option A is wrong — abandoning regression testing means quality drops ship silently; proxies exist precisely to make nightly testing feasible. Option C is wrong — MOS is a measurement over listeners, and any change to the model, inputs, or pipeline can shift perceived quality; you can't assume it's static, and you're not re-measuring it anyway. Option D is wrong — WER measures word errors for ASR, not TTS naturalness; it's meaningless as a TTS quality metric.",
      },
      {
        question: "Leadership asks whether the voice product is 'good enough to ship' based on 6% WER and 4.2 MOS. What is the most complete answer about how to make the ship decision?",
        options: [
          "Yes — both component metrics beat the last release, and strong ASR plus strong TTS guarantees a good agent",
          "Component metrics (WER with entity error rate; MOS with neural-predictor proxies) gate the components, but the ship decision must ride on end-to-end metrics on realistic calls — task success rate, p95 turn/first-audio latency, and barge-in/turn-taking quality — because strong components can still yield a bad agent, and task success rate is what catches the entity and turn-taking failures the component metrics miss",
          "No — a 6% WER is always too high to ship any voice product regardless of use case",
          "Base the decision purely on MOS, since a natural-sounding voice is what users care about most",
        ],
        correct: 1,
        explanation: "Option B is correct: WER (plus entity error rate) and MOS (plus proxies) are leading indicators that the components are healthy, but an agent's quality is a property of the whole conversation. The ship decision must use end-to-end metrics — task success rate (did the caller accomplish their goal), p95 turn/first-audio latency, and barge-in/turn-taking quality — on realistic calls. Task success rate is precisely what would have flagged the scenario's low-WER-but-failed calls. Option A is wrong — this is the component-vs-system trap; strong ASR + strong TTS does NOT guarantee a good agent, as the failed calls show. Option C is wrong — there's no universal WER threshold; acceptable WER depends on the task and whether errors hit critical entities. Option D is wrong — naturalness matters, but a beautiful voice that fails the caller's task is not shippable; task success dominates.",
      },
    ],
    takeaway: "WER = (S+I+D)/reference words is an equal-weight edit distance, so it's entity-blind: a 5% WER on the appointment date or account number fails the task while a 15% WER on filler doesn't — which is exactly how the scenario's dashboard looked healthy while calls failed. Fix it with entity/keyword error rate and clean normalization; for TTS, MOS is the subjective 1–5 naturalness gold standard (with neural predictors like UTMOS as CI proxies and human MOS to confirm), but it says nothing about conversational success. The decisive point is the component-vs-system trap: strong ASR + strong TTS can still be a bad agent, so gate components on WER/MOS but gate the ship on end-to-end task success rate, p95 latency, and turn-taking on realistic calls.",
  },
};
