// GSL premium-niche track — Voice / Speech AI (SKELETON, executed 2026-07-03)
// RUNNER_DATA fragment. Spread into src/data/foundationsRunnerData.js via ...RUNNER_VOICE_AI.
// SKELETON HONESTY: each module renders a real title/scenario + a spec outline of what it
// will teach, with a "🚧 In development" marker so it reads as an honest scaffold, not fake
// complete content. No MCQs are authored yet (the runner renders cleanly without them).
//
// Keep the export name RUNNER_VOICE_AI. Additive only — do not edit existing entries.

const DEV = "🚧 In development — outline below. This module is a specced scaffold, not finished teaching content yet. The scenario and the numbered outline show exactly what it will cover once authored.";

export const RUNNER_VOICE_AI = {
  "voice-asr-architectures": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " Your team is building a voice assistant for a healthcare intake line. You need to pick an ASR (automatic speech recognition) stack — Whisper vs a streaming CTC/RNN-T model vs a managed API — and defend the choice on accuracy, latency, and cost. The interviewer asks you to explain how modern ASR actually turns audio into text.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Audio front-end: waveform → log-mel spectrogram, frame/hop sizing, why 16kHz mono is the ASR default, and what feature extraction throws away.",
      "2. The three dominant architectures: (a) CTC (frame-independent, fast, alignment-free), (b) RNN-Transducer / RNN-T (streaming-native, the production default for real-time), (c) attention encoder-decoder / Whisper (offline, highest accuracy, not natively streaming).",
      "3. Whisper in depth: the 680k-hour weakly-supervised training recipe, multitask decoding (transcribe/translate/timestamp/language-id via special tokens), why it hallucinates on silence, and why it is offline-first.",
      "4. The streaming-vs-offline fork: you cannot ship Whisper-large as-is on a live call. When you need RNN-T or chunked/streaming Whisper, and the accuracy you trade for it.",
      "5. Decoding: greedy vs beam search, shallow fusion with an external language model, and how a domain LM fixes medical/enterprise vocabulary.",
      { type: "illustration", label: "Planned architecture-comparison table (to be built)", content:
`Architecture      Streaming?   Rel. accuracy   Latency        Typical use
CTC               yes          medium          very low       keyword / command
RNN-Transducer    yes (native) high            low            real-time voice agents
Whisper (AED)     no (offline) highest         high (batch)   transcription, dictation
Chunked Whisper   partial      high            medium         near-real-time captions` },
      "6. The interview canon: 'explain CTC vs RNN-T', 'why does Whisper hallucinate', 'how would you cut ASR latency', 'how do you adapt ASR to domain jargon'.",
    ],
    takeaway: "SKELETON: ASR turns audio→text via CTC (fast), RNN-T (streaming-native, the real-time default), or attention/Whisper (offline, most accurate). Picking a stack is a streaming-vs-accuracy-vs-cost tradeoff. Full teaching content + interactive coming.",
  },

  "voice-streaming-latency": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " Your real-time voice agent feels sluggish — users talk over it and interrupt. Product wants sub-800ms 'time-to-first-audio' from end-of-user-speech. You have to budget latency across the full ASR → LLM → TTS pipeline and find where the milliseconds go.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. The real-time voice loop and its stages: mic → VAD (voice activity detection) → streaming ASR → endpointing → LLM → streaming TTS → speaker. Each adds latency.",
      "2. The two latency numbers that matter: end-of-speech → first audio out (perceived responsiveness) and total turn latency. Why p95/p99 not mean.",
      "3. Endpointing: how the system decides the user is DONE talking. Semantic vs silence-based endpointing, and the barge-in / interruption problem.",
      "4. Streaming everything: partial ASR hypotheses, LLM token streaming, and sentence-chunked TTS so audio starts before the full response is generated.",
      "5. The latency budget as an interview whiteboard exercise: allocate ~800ms across VAD, ASR finalization, LLM TTFT, TTS first-chunk, and network.",
      { type: "illustration", label: "Planned latency-budget breakdown (to be built)", content:
`Target: 800ms end-of-speech -> first audio
  Endpoint decision (silence timeout)   ~200ms
  Final ASR hypothesis                  ~100ms
  LLM time-to-first-token               ~300ms
  TTS first audio chunk                 ~150ms
  Network / buffering                   ~50ms
  --------------------------------------------
  Total                                 ~800ms   <- every stage must stream` },
      "6. Interview canon: 'design a real-time voice agent', 'where is the latency', 'how do you handle interruptions', 'why does streaming TTS matter'.",
    ],
    takeaway: "SKELETON: Real-time voice is a latency-budgeting problem across VAD → ASR → endpointing → LLM → TTS. Sub-second responsiveness requires streaming at every stage plus good endpointing and barge-in handling. Full content + interactive latency planner coming.",
  },

  "voice-tts-cloning": {
    depthTier: "deep",
    interviewWeight: "medium",
    scenario: DEV + " You need a natural, low-latency voice for your agent, and marketing wants a custom brand voice. You must choose a TTS approach, understand voice cloning, and reason about the consent/deepfake risks before shipping.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. TTS architecture evolution: concatenative → parametric → neural (Tacotron/FastSpeech acoustic model + vocoder) → modern autoregressive/codec LLM-style TTS (VALL-E, XTTS-style).",
      "2. The acoustic-model + vocoder split, and why streaming vocoders matter for real-time first-audio latency.",
      "3. Zero-shot voice cloning: how a few seconds of reference audio conditions the model, speaker embeddings, and the quality/consent tradeoff.",
      "4. Prosody, SSML, and controllability: pacing, emphasis, and why pure neural TTS can sound 'flat' without control tokens.",
      "5. Safety + governance: consent, watermarking, deepfake/impersonation risk, and voice-likeness policy — increasingly an interview and compliance topic.",
      "6. Interview canon: 'how does neural TTS work', 'acoustic model vs vocoder', 'how does zero-shot cloning work', 'what are the risks of voice cloning'.",
    ],
    takeaway: "SKELETON: Neural TTS = acoustic model + vocoder; modern codec/LLM-style TTS enables zero-shot cloning from seconds of audio. Streaming vocoders drive real-time latency; cloning raises real consent/deepfake governance questions. Full content + interactive coming.",
  },

  "voice-realtime-agents": {
    depthTier: "deep",
    interviewWeight: "high",
    scenario: DEV + " You're the lead on a production voice agent for phone support. It has to hold a natural back-and-forth: know when to speak, handle interruptions, recover from ASR errors, and call tools mid-conversation. Design the turn-taking and dialogue-management layer.",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. Turn-taking as the hard problem: endpointing, barge-in (user interrupts the agent), and backchannels ('mm-hmm') — what makes a voice agent feel human vs robotic.",
      "2. The orchestration architecture: cascaded (ASR → LLM → TTS as separate services) vs emerging speech-to-speech / native-audio models, and the tradeoffs (latency, controllability, tool use).",
      "3. Dialogue state + tool calling over voice: how the LLM calls functions mid-call, confirms slots ('did you say Tuesday?'), and handles multi-turn context.",
      "4. Robustness to ASR errors: confidence scores, confirmation strategies, and graceful re-prompting instead of acting on a mis-heard entity.",
      "5. Interruption + duplex handling: canceling in-flight TTS when the user starts talking, and re-planning the response.",
      { type: "illustration", label: "Planned cascaded vs speech-to-speech comparison (to be built)", content:
`Cascaded (ASR->LLM->TTS)          Speech-to-speech (native audio)
  + full control at each stage       + lowest latency, natural prosody
  + easy tool-calling / logging      + preserves tone/emotion
  - higher latency (3 hops)          - harder to inspect / guardrail
  - loses prosody/emotion            - tool-calling still maturing` },
      "6. Interview canon: 'design a voice agent', 'how do you handle interruptions', 'cascaded vs speech-to-speech', 'how do you make it robust to ASR errors'.",
    ],
    takeaway: "SKELETON: A production voice agent lives or dies on turn-taking — endpointing, barge-in, and error recovery. Cascaded pipelines give control; native speech-to-speech gives latency and prosody. Full content + interactive dialogue-loop coming.",
  },

  "voice-eval-wer-mos": {
    depthTier: "light",
    interviewWeight: "medium",
    scenario: DEV + " Leadership asks 'is our voice product good enough to ship?' You need metrics. What do WER and MOS actually measure, where they mislead, and how do you evaluate a full voice agent — not just the ASR component in isolation?",
    explanation: [
      "WHAT THIS MODULE WILL TEACH (spec):",
      "1. WER (Word Error Rate): substitutions + insertions + deletions over reference length. Why it's the ASR standard, and where it lies (a 5% WER that drops the ONE important entity is worse than a 15% WER on filler words).",
      "2. Beyond WER: entity/keyword error rate, semantic accuracy, and normalization pitfalls (numbers, punctuation, casing).",
      "3. TTS evaluation: MOS (Mean Opinion Score) as subjective 1–5 human rating, plus objective proxies (MCD, and neural MOS predictors like UTMOS) and their limits.",
      "4. End-to-end voice-agent eval: task success rate, turn latency, interruption handling, and 'did the whole conversation succeed', not just component metrics.",
      "5. The component-vs-system trap: strong ASR + strong TTS can still make a bad agent if turn-taking and dialogue fail.",
      "6. Interview canon: 'how do you evaluate ASR', 'what does WER miss', 'how do you measure TTS quality', 'how do you eval a full voice agent'.",
    ],
    takeaway: "SKELETON: WER measures ASR word errors but hides which errors matter; MOS rates TTS naturalness subjectively. A voice agent must be evaluated end-to-end (task success, latency, turn-taking), not by component metrics alone. Full content + interactive coming.",
  },
};
