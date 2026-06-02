import React, { useState } from "react";
import { POSTS } from "./groundTruthIndex";

// ─── KNOWLEDGE BASE ────────────────────────────────────────────────────────────

const MODULES_KB = [
  // ── Concepts (15 modules) ────────────────────────────────────────────────────
  { id: "tokenizer",      label: "Tokenizer",               tab: "concepts", group: "Concepts", desc: "Interactive tokenizer — see how BPE splits text into tokens and calculates cost.", keywords: ["tokenizer","BPE","tokens","subword","byte pair","wordpiece","sentencepiece","token count","tokenization"] },
  { id: "embeddings",     label: "Embeddings",              tab: "concepts", group: "Concepts", desc: "Visualise word vectors in 2D. See semantic similarity and analogy arithmetic.", keywords: ["embeddings","vectors","vector space","semantic","similarity","word2vec","sentence transformers"] },
  { id: "attention",      label: "Attention Mechanism",     tab: "concepts", group: "Concepts", desc: "Step-by-step self-attention: Query, Key, Value matrices and multi-head attention.", keywords: ["attention","self-attention","QKV","query key value","multi-head","scaled dot product","transformer attention"] },
  { id: "sampling",       label: "Sampling & Temperature",  tab: "concepts", group: "Concepts", desc: "Live temperature, top-p, and top-k controls. See how decoding strategy changes output.", keywords: ["temperature","top-p","top-k","sampling","nucleus sampling","greedy","decoding","randomness"] },
  { id: "context-window", label: "Context Window",          tab: "concepts", group: "Concepts", desc: "Visualise what fits inside a context window and what gets truncated.", keywords: ["context window","context length","context limit","truncation","128k","200k","lost in middle","long context"] },
  { id: "chunking",       label: "Chunking Strategies",     tab: "concepts", group: "Concepts", desc: "Compare fixed, semantic, and hierarchical chunking strategies for RAG.", keywords: ["chunking","chunk size","fixed chunking","semantic chunking","hierarchical","overlap","splitting","RAG chunks"] },
  { id: "guardrails",     label: "Guardrails",              tab: "concepts", group: "Concepts", desc: "Input/output filtering pipeline — classifiers, PII redaction, toxicity detection.", keywords: ["guardrails","safety","content filter","input filter","output filter","PII","toxicity","moderation"] },
  { id: "rag-concept",    label: "RAG Pipeline",            tab: "concepts", group: "Concepts", desc: "End-to-end retrieval-augmented generation pipeline from query to grounded answer.", keywords: ["RAG","retrieval augmented generation","retrieve","chunk","embed","generate","grounded"] },
  { id: "agents-concept", label: "Agents Overview",         tab: "concepts", group: "Concepts", desc: "ReAct loop, tool use, memory, and planning in AI agents.", keywords: ["agents","react","tool use","tool call","planning","memory","reasoning","multi-step"] },
  { id: "debug",          label: "Debug Mode",              tab: "concepts", group: "Concepts", desc: "Inspect model internals — token probabilities, attention maps, and logprobs.", keywords: ["debug","logprobs","probabilities","internals","token probability","attention map","interpretability"] },
  { id: "multiagent",     label: "Multi-Agent Patterns",    tab: "concepts", group: "Concepts", desc: "Orchestrator-worker architectures, message passing, coordination strategies.", keywords: ["agents","multiagent","orchestration","orchestrator","worker","message passing","coordination"] },
  { id: "nextoken",       label: "Next Token Prediction",   tab: "concepts", group: "Concepts", desc: "Interactive game: predict the next token like a language model.", keywords: ["tokens","llm","prediction","game","next token","token prediction","language model"] },
  { id: "tempgame",       label: "Temperature Explorer",    tab: "concepts", group: "Concepts", desc: "Interactive: see how temperature affects token sampling and randomness.", keywords: ["temperature","sampling","game","tokens","randomness","temperature explorer"] },
  { id: "transformer",    label: "Transformer Architecture",tab: "concepts", group: "Concepts", desc: "Step through a full transformer: positional encoding, attention, FFN, residuals.", keywords: ["transformer","architecture","encoder","decoder","feed forward","positional encoding","layer norm","residual"] },
  { id: "flashattn",      label: "Flash Attention",         tab: "concepts", group: "Concepts", desc: "O(n²) vs O(n) VRAM comparison — how FlashAttention tiles memory to scale attention.", keywords: ["flash attention","VRAM","memory","tiling","attention optimization","long context attention"] },

  // ── RAG Lab (5 failure scenarios) ───────────────────────────────────────────
  { id: "lab-stale",      label: "RAG: Stale Retrieval",    tab: "lab", group: "RAG Lab", desc: "Configure a RAG system and watch it answer confidently from a 3-year-old document. Diagnose why.", keywords: ["stale retrieval","stale document","outdated","RAG failure","retrieval failure","wrong answer","hallucination RAG"] },
  { id: "lab-hallucination", label: "RAG: Hallucination",   tab: "lab", group: "RAG Lab", desc: "Tune top_k and prompt policy until the model fabricates an answer with high confidence.", keywords: ["hallucination","fabrication","RAG hallucination","confident wrong","faithfulness","groundedness failure"] },
  { id: "lab-injection",  label: "RAG: Prompt Injection",   tab: "lab", group: "RAG Lab", desc: "A poisoned document in the corpus hijacks the model's response. Configure defenses.", keywords: ["prompt injection","jailbreak","corpus poisoning","adversarial","injection attack","RAG security"] },
  { id: "lab-overflow",   label: "RAG: Context Overflow",   tab: "lab", group: "RAG Lab", desc: "Too many retrieved chunks overflow the context window. Diagnose truncation failures.", keywords: ["context overflow","context window","truncation","chunk overflow","too many chunks","RAG context"] },
  { id: "lab-multihop",   label: "RAG: Multi-Hop Failure",  tab: "lab", group: "RAG Lab", desc: "Multi-step retrieval fails when intermediate hops are missed. Configure multi-hop RAG.", keywords: ["multi-hop","multi-step retrieval","reasoning chain","intermediate retrieval","chain of thought RAG"] },

  // ── Agent Lab (16 modules) ───────────────────────────────────────────────────
  { id: "react",       label: "ReAct Pattern",           tab: "agentlab", group: "Agent Lab", desc: "Step through the Thought → Action → Observation loop. See how agents reason and act.", keywords: ["ReAct","react pattern","thought action observation","agent loop","reasoning acting","multi-step agent"] },
  { id: "tools",       label: "Tool Use Design",         tab: "agentlab", group: "Agent Lab", desc: "Design tool schemas, calling patterns, and MCP protocol for production agents.", keywords: ["tool use","tool design","function calling","MCP","tool schema","tool calling","API tools"] },
  { id: "memory",      label: "Agent Memory",            tab: "agentlab", group: "Agent Lab", desc: "Working, episodic, semantic, and external memory types with production failure demos.", keywords: ["agent memory","working memory","episodic","semantic memory","memory types","persistent memory"] },
  { id: "memarch",     label: "Memory Architecture",     tab: "agentlab", group: "Agent Lab", desc: "LLM memory architecture patterns — where to store, retrieve, and compress agent state.", keywords: ["memory architecture","LangMem","Mem0","MemGPT","memory retrieval","memory compression","agent state"] },
  { id: "multiagent",  label: "Multi-Agent Patterns",    tab: "agentlab", group: "Agent Lab", desc: "Supervisor-worker orchestration, message passing, and coordination strategies at scale.", keywords: ["multi-agent","supervisor","orchestration","LangGraph","task decomposition","agent communication","agent network"] },
  { id: "failures",    label: "Failure Modes",           tab: "agentlab", group: "Agent Lab", desc: "Tool loops, hallucinated tool calls, context bleed, and cascade failures in the simulator.", keywords: ["agent failures","tool loop","hallucinated tool call","context bleed","cascade failure","agent debug","circuit breaker"] },
  { id: "planning",    label: "Planning Patterns",       tab: "agentlab", group: "Agent Lab", desc: "Tree of Thought, LATS, and reflection patterns — when agents need to look ahead.", keywords: ["planning","tree of thought","LATS","graph of thought","lookahead","agent planning","reflection","chain of thought"] },
  { id: "design",      label: "Agent Design Challenge",  tab: "agentlab", group: "Agent Lab", desc: "Architect a full production agent: tools, memory, failure handling, and approval gates.", keywords: ["agent design","agent architecture","design challenge","production agent","approval gate","human in loop"] },
  { id: "simulator",   label: "Agent Loop Simulator",    tab: "agentlab", group: "Agent Lab", desc: "Run a live agent loop — configure tools, inject failures, observe the trace.", keywords: ["agent simulator","loop simulator","agent trace","tool call simulator","agent playground"] },
  { id: "frameworks",  label: "Framework Landscape",     tab: "agentlab", group: "Agent Lab", desc: "LangChain vs LangGraph vs AutoGen vs CrewAI — when to use each framework.", keywords: ["LangChain","LangGraph","AutoGen","CrewAI","agent frameworks","framework comparison","orchestration framework"] },
  { id: "mcp",         label: "MCP Deep Dive",           tab: "agentlab", group: "Agent Lab", desc: "Model Context Protocol — how MCP differs from function calling and when to use it.", keywords: ["MCP","model context protocol","MCP vs API","tool protocol","Claude MCP","MCP server"] },
  { id: "reliability", label: "Agentic Reliability",     tab: "agentlab", group: "Agent Lab", desc: "Making agents reliable in production: retry logic, fallbacks, and circuit breakers.", keywords: ["reliability","agent reliability","retry","fallback","circuit breaker","fault tolerance","production agents"] },
  { id: "computeruse", label: "Computer Use",            tab: "agentlab", group: "Agent Lab", desc: "Agents that control GUIs — browser automation, screen reading, and action safety.", keywords: ["computer use","GUI agent","browser automation","screen","UI agent","Claude computer use","action agent"] },
  { id: "longrunning", label: "Long-Running Workflows",  tab: "agentlab", group: "Agent Lab", desc: "Durable workflows, checkpointing, and state recovery for multi-hour agent tasks.", keywords: ["long running","durable workflow","checkpointing","state recovery","persistent agent","workflow agent"] },
  { id: "a2a",         label: "A2A Protocol",            tab: "agentlab", group: "Agent Lab", desc: "Agent-to-Agent protocol — how agents communicate, delegate, and coordinate directly.", keywords: ["A2A","agent to agent","agent communication","agent delegation","agent protocol","multi-agent communication"] },
  { id: "agentcfg",    label: "Agent Config Lab",        tab: "agentlab", group: "Agent Lab", desc: "Configure agent parameters and watch failure modes trigger — context overflow, tool loops, cascade errors.", keywords: ["agent config","agent configuration","failure modes","context overflow","tool loop","agent parameters","cascade"] },

  // ── Eval Lab ─────────────────────────────────────────────────────────────────
  { id: "evals",            label: "Evals Lab",               tab: "evallab", group: "Eval Lab", desc: "Grade LLM outputs on groundedness, faithfulness, and citation accuracy.", keywords: ["evals","evaluation","grading","RAGAS","G-Eval","faithfulness","groundedness","citation","LLM eval"] },
  { id: "evalfw",           label: "Eval Frameworks",         tab: "evallab", group: "Eval Lab", desc: "Compare RAGAS, G-Eval, and custom pipelines. When to use each framework.", keywords: ["eval frameworks","RAGAS","G-Eval","LLM-as-judge","evaluation pipeline","benchmark","metric framework"] },
  { id: "evalmetrics",      label: "Eval Metrics",            tab: "evallab", group: "Eval Lab", desc: "BLEU, ROUGE, BERTScore, exact match, LLM-as-judge — pick the right metric for your use case.", keywords: ["eval metrics","BLEU","ROUGE","BERTScore","exact match","LLM judge","metric selection"] },
  { id: "shouldai",         label: "Should You Use AI?",      tab: "evallab", group: "Eval Lab", desc: "6-question decision framework: when AI is the right solution and when it is not.", keywords: ["should use AI","AI decision","when to use AI","AI justified","product strategy","AI or not"] },
  { id: "strategy",         label: "Model Strategy",          tab: "evallab", group: "Eval Lab", desc: "Model selection matrix — GPT-4o vs Claude vs Gemini vs open models.", keywords: ["model strategy","model selection","GPT-4","Claude","Gemini","open source","llama","mistral","model comparison"] },
  { id: "canvas",           label: "System Design Canvas",    tab: "evallab", group: "Eval Lab", desc: "Interactive canvas for designing AI system architectures with failure mode annotations.", keywords: ["system design","canvas","architecture","AI system design","design canvas","system diagram"] },
  { id: "incidents",        label: "Incident Room",           tab: "evallab", group: "Eval Lab", desc: "Production AI incidents with symptoms only — diagnose root cause and write the fix.", keywords: ["incident","production failure","root cause","diagnosis","incident room","postmortem","debugging"] },
  { id: "observability",    label: "Observability",           tab: "evallab", group: "Eval Lab", desc: "What to log, trace, and alert on in production LLM systems.", keywords: ["observability","logging","monitoring","tracing","LangSmith","alerts","dashboards","production monitoring","traces"] },
  { id: "abtesting",        label: "A/B Testing",             tab: "evallab", group: "Eval Lab", desc: "Run controlled experiments on LLM outputs. Statistical significance and win-rate.", keywords: ["A/B testing","experimentation","win rate","statistical significance","LLM comparison","model experiment"] },
  { id: "mlcicd",           label: "ML CI/CD",                tab: "evallab", group: "Eval Lab", desc: "Eval gates, regression checks, and automated deployment pipelines for LLM systems.", keywords: ["ML CI/CD","CI/CD","eval gate","regression","automated deployment","model pipeline","continuous integration"] },
  { id: "debug_traces",     label: "Debug This",              tab: "evallab", group: "Eval Lab", desc: "5 broken production traces — read the span, identify the bug, write the fix.", keywords: ["debug traces","broken trace","span","trace debugging","LangSmith traces","trace analysis","production debug"] },
  { id: "langsmith",        label: "LangSmith Lab",           tab: "evallab", group: "Eval Lab", desc: "Diagnose broken traces: retriever timeout, token overflow, tool schema mismatch.", keywords: ["LangSmith","tracing","trace","observability","langsmith lab","trace diagnosis","span inspection"] },
  { id: "trapslab",         label: "Traps Lab",               tab: "evallab", group: "Eval Lab", desc: "Common AI engineering traps — identify subtle mistakes before they hit production.", keywords: ["traps","common mistakes","pitfalls","AI engineering traps","subtle bugs","production traps"] },
  { id: "router",           label: "Model Router",            tab: "evallab", group: "Eval Lab", desc: "Route requests across model tiers by complexity, cost, and latency SLA.", keywords: ["model router","routing","model tiers","cost routing","complexity routing","latency SLA","router"] },
  { id: "prompt-change-mgmt", label: "Prompt Change Management", tab: "evallab", group: "Eval Lab", desc: "Version, test, and roll back prompt changes with eval gates and CI integration.", keywords: ["prompt management","prompt versioning","prompt CI","prompt rollback","prompt change","LLMOps","prompt ops"] },

  // ── LLM Lab ──────────────────────────────────────────────────────────────────
  { id: "decoding",     label: "Decoding Strategies",     tab: "llmlab", group: "LLM Lab", desc: "Live token distribution — see how temperature, top-p, and top-k reshape sampling at each step.", keywords: ["decoding","temperature","top-p","top-k","token distribution","sampling strategy","greedy decoding","nucleus"] },
  { id: "kvcache",      label: "KV Cache Engineering",    tab: "llmlab", group: "LLM Lab", desc: "KV cache sizing, hit rates, and eviction strategies. Understand what gets cached and why.", keywords: ["KV cache","key value cache","cache hit","cache eviction","inference optimization","attention cache","memory"] },
  { id: "specdecoding", label: "Speculative Decoding",    tab: "llmlab", group: "LLM Lab", desc: "Draft-verify paradigm — how speculative decoding achieves 2–3× throughput without quality loss.", keywords: ["speculative decoding","draft model","verify","throughput","latency","speculation","two model decoding"] },
  { id: "quantization", label: "Quantization Engineering",tab: "llmlab", group: "LLM Lab", desc: "INT4/INT8/FP16/BF16 tradeoffs. VRAM calculator for quantized models at different bit widths.", keywords: ["quantization","INT4","INT8","FP16","BF16","VRAM","quantized model","model compression","bit width"] },
  { id: "serving",      label: "Serving Infrastructure", tab: "llmlab", group: "LLM Lab", desc: "Batching, hardware selection, framework comparison — configure a serving stack and see failure modes.", keywords: ["serving","inference serving","batching","vLLM","TGI","TensorRT","hardware","GPU serving","continuous batching"] },
  { id: "reasoning",    label: "Reasoning Models Lab",    tab: "llmlab", group: "LLM Lab", desc: "Chain-of-thought vs direct tradeoffs — when reasoning models help and when they waste tokens.", keywords: ["reasoning","chain of thought","CoT","reasoning model","o1","thinking tokens","reasoning vs direct"] },
  { id: "moe",          label: "MoE Architecture",        tab: "llmlab", group: "LLM Lab", desc: "Mixture-of-experts routing, expert collapse, and load imbalance failure modes.", keywords: ["MoE","mixture of experts","expert routing","sparse model","expert collapse","load imbalance","Mixtral"] },
  { id: "inference",    label: "Inference Optimizer",     tab: "llmlab", group: "LLM Lab", desc: "Hardware config → framework/quant/batching recommendation with bottleneck diagnosis.", keywords: ["inference","inference optimization","throughput","latency","hardware","batching","inference bottleneck"] },
  { id: "streaming",    label: "Streaming Patterns",      tab: "llmlab", group: "LLM Lab", desc: "SSE vs WebSockets vs batch — when to stream and how to handle mid-stream failures.", keywords: ["streaming","SSE","server-sent events","WebSocket","token streaming","streaming patterns","real-time"] },

  // ── Systems Lab (remaining modules) ──────────────────────────────────────────
  { id: "costlatency",      label: "Cost / Latency Planner",    tab: "systems", group: "Systems", desc: "Budget tokens, model cost, TTFT, and TPS for your production workload.", keywords: ["cost","latency","TTFT","tokens per second","budget","inference cost","SLA","API cost","cost planner"] },
  { id: "finetune",         label: "Fine-Tuning Lab",           tab: "systems", group: "Systems", desc: "LoRA/PEFT fine-tuning explorer — rank, alpha, VRAM, and training cost tradeoffs.", keywords: ["fine-tuning","LoRA","PEFT","QLoRA","rank","alpha","VRAM","training","adapter","parameter efficient"] },
  { id: "indiascale",       label: "India Scale Lab",           tab: "systems", group: "Systems", desc: "AI deployment tradeoffs at Indian-market scale — latency, cost, language, infrastructure.", keywords: ["india","India scale","vernacular","low latency India","cost India","Indian AI","regional deployment"] },
  { id: "caching",          label: "Prompt Caching",            tab: "systems", group: "Systems", desc: "Prompt prefix caching — how it works and how to structure prompts for 60-80% cost savings.", keywords: ["prompt caching","prefix caching","cache","cost savings","repeated prompts","system prompt cache"] },
  { id: "compaction",       label: "Context Compaction",        tab: "systems", group: "Systems", desc: "Compress long conversations without losing critical context. When and how to compact.", keywords: ["context compaction","summarization","conversation compression","context management","long context compaction"] },
  { id: "multimodal",       label: "Multimodal AI",             tab: "systems", group: "Systems", desc: "Vision-language models, image inputs, and multimodal pipeline design.", keywords: ["multimodal","vision","image","vision language model","VLM","CLIP","image input","visual AI"] },
  { id: "ctxwindow",        label: "Context Window Engineering",tab: "systems", group: "Systems", desc: "Pack, truncate, and manage context window contents for production reliability.", keywords: ["context window engineering","context packing","context management","truncation strategy","window management"] },
  { id: "promptlab",        label: "Prompt Engineering Lab",    tab: "systems", group: "Systems", desc: "Systematic prompt design — zero-shot, few-shot, chain-of-thought, and structured output patterns.", keywords: ["prompt engineering","zero-shot","few-shot","chain of thought","structured output","prompt patterns","prompting"] },
  { id: "redteam",          label: "AI Red Teaming",            tab: "systems", group: "Systems", desc: "Attack your AI system before attackers do — jailbreaks, injection, and adversarial inputs.", keywords: ["red teaming","jailbreak","adversarial","attack","security testing","AI security","penetration testing"] },
  { id: "txarch",           label: "Transformer Architecture",  tab: "systems", group: "Systems", desc: "Interactive transformer diagram — encoder, decoder, attention heads, FFN, residuals.", keywords: ["transformer architecture","encoder decoder","attention heads","FFN","residual connection","layer norm","transformer diagram"] },
  { id: "structout",        label: "Structured Outputs",        tab: "systems", group: "Systems", desc: "JSON mode, function calling schemas, and constrained generation for reliable AI pipelines.", keywords: ["structured output","JSON mode","function calling","schema","constrained generation","output format","JSON schema"] },
  { id: "synthdata",        label: "Synthetic Data",            tab: "systems", group: "Systems", desc: "Generate, validate, and use synthetic training data — quality bars and contamination risks.", keywords: ["synthetic data","data generation","synthetic training","data augmentation","contamination","dataset creation"] },
  { id: "vibecoding",       label: "Vibe Coding & Agentic Dev", tab: "systems", group: "Systems", desc: "Agentic coding patterns — Claude as a coding agent, CLAUDE.md, hooks, and subagents.", keywords: ["vibe coding","agentic coding","Claude code","coding agent","CLAUDE.md","hooks","subagents","agentic dev"] },
  { id: "guardrails",       label: "AI Guardrails",             tab: "systems", group: "Systems", desc: "Production guardrail layers — classifiers, topic filters, PII redaction, output validators.", keywords: ["guardrails","AI guardrails","safety","content filter","classifier","output validation","production safety"] },
  { id: "modelmerging",     label: "Model Merging",             tab: "systems", group: "Systems", desc: "SLERP, TIES, DARE — merge fine-tuned models without retraining.", keywords: ["model merging","SLERP","TIES","DARE","merge models","model combination","merged model"] },
  { id: "flashattn",        label: "Flash Attention",           tab: "systems", group: "Systems", desc: "FlashAttention 1/2/3 internals — tiling, IO complexity, and memory reduction.", keywords: ["flash attention","FlashAttention","tiling","IO complexity","memory efficient attention","attention optimization"] },
  { id: "promptcaching",    label: "Cache Architecture & Warmup",tab: "systems", group: "Systems", desc: "Cache warming strategies, prefix design, and cold-start failure patterns.", keywords: ["cache architecture","cache warmup","prefix caching","cold start","cache strategy","cache design"] },
  { id: "finetuning",       label: "Fine-Tuning Workflows",     tab: "systems", group: "Systems", desc: "End-to-end fine-tuning workflow: data prep, training, eval, and deployment gates.", keywords: ["fine-tuning workflow","training workflow","data prep","fine-tune pipeline","model training","SFT","supervised fine-tuning"] },
  { id: "rlhf",             label: "RLHF / DPO / PPO",          tab: "systems", group: "Systems", desc: "Alignment training methods — reward models, preference data, PPO vs DPO tradeoffs.", keywords: ["RLHF","DPO","PPO","alignment","reward model","preference data","human feedback","RLHF vs DPO"] },
  { id: "grpo",             label: "GRPO / Agent RL",           tab: "systems", group: "Systems", desc: "Group Relative Policy Optimization — RL for reasoning and agentic task learning.", keywords: ["GRPO","group relative policy","agent RL","reinforcement learning","reasoning RL","policy optimization"] },
  { id: "multimodal2",      label: "Multimodal Systems",        tab: "systems", group: "Systems", desc: "Production multimodal pipelines — image preprocessing, embedding, retrieval, and generation.", keywords: ["multimodal systems","image pipeline","vision language","multimodal RAG","image embedding","multimodal production"] },
  { id: "agentarch",        label: "Agent Architecture",        tab: "systems", group: "Systems", desc: "Production agent architecture patterns — single vs multi-agent, control flow, state.", keywords: ["agent architecture","agent design","single agent","multi-agent architecture","agent control flow","production agent"] },
  { id: "agentmemory",      label: "Agent Memory Architecture", tab: "systems", group: "Systems", desc: "4 memory types, production memory stacks, and the decision layer for memory retrieval.", keywords: ["agent memory architecture","memory stack","episodic memory","semantic memory","memory retrieval","production memory"] },
  { id: "longctx",          label: "Long Context Patterns",     tab: "systems", group: "Systems", desc: "Needle-in-haystack testing, retrieval patterns, and model limits for long context.", keywords: ["long context","needle haystack","long document","128k","200k","long context patterns","large context"] },
  { id: "promptinjection",  label: "Prompt Injection Defense",  tab: "systems", group: "Systems", desc: "5 attack patterns and 5 defense layers — harden your AI system against injection.", keywords: ["prompt injection","injection defense","jailbreak","attack pattern","defense layer","adversarial prompt","hardening"] },
  { id: "vectordb",         label: "Vector DB Engineering",     tab: "systems", group: "Systems", desc: "Pinecone vs Weaviate vs Qdrant vs pgvector — HNSW, IVF, hybrid search, and decision wizard.", keywords: ["vector database","vector DB","Pinecone","Weaviate","Qdrant","pgvector","HNSW","IVF","ANN","hybrid search"] },
  { id: "mcp",              label: "MCP vs API vs Function Calling", tab: "systems", group: "Systems", desc: "Decision framework for choosing between MCP, REST APIs, and function calling.", keywords: ["MCP","model context protocol","function calling","API","MCP vs API","tool protocol","integration pattern"] },
  { id: "query-refinement", label: "Query Refinement Lab",      tab: "systems", group: "Systems", desc: "HyDE, multi-query, and decomposition strategies to improve RAG retrieval quality.", keywords: ["query refinement","HyDE","multi-query","query decomposition","retrieval improvement","query rewriting","RAG retrieval"] },
  { id: "ai-safety-eng",    label: "AI Safety Engineering",     tab: "systems", group: "Systems", desc: "6 attack patterns, 5 defense layers, and a production hardening checklist.", keywords: ["AI safety","safety engineering","attack patterns","defense layers","hardening","production safety","AI security"] },

  // ── PrepLab (topic clusters — 277 questions) ─────────────────────────────────
  { id: "preplab-rag",      label: "PrepLab: RAG & Retrieval",     tab: "preplab", group: "PrepLab", desc: "277 interview questions — RAG pipeline design, retrieval failure modes, chunking, reranking.", keywords: ["preplab","interview","quiz","RAG questions","retrieval questions","chunking interview","reranking","RAG interview"] },
  { id: "preplab-agents",   label: "PrepLab: Agents & Tool Use",   tab: "preplab", group: "PrepLab", desc: "Agent loop design, tool calling, failure modes, memory — interview-style questions.", keywords: ["preplab","interview","agents questions","tool use interview","agent design question","memory agent interview"] },
  { id: "preplab-evals",    label: "PrepLab: Evals & Metrics",     tab: "preplab", group: "PrepLab", desc: "Evaluation design, metric selection, LLM-as-judge, RAGAS — interview questions.", keywords: ["preplab","evals interview","evaluation questions","metrics interview","LLM judge interview","RAGAS question"] },
  { id: "preplab-inference",label: "PrepLab: Inference & Serving", tab: "preplab", group: "PrepLab", desc: "Batching, KV cache, quantization, speculative decoding — interview questions.", keywords: ["preplab","inference interview","serving questions","KV cache interview","quantization interview","batching question"] },
  { id: "preplab-finetune", label: "PrepLab: Fine-Tuning",         tab: "preplab", group: "PrepLab", desc: "LoRA, RLHF, DPO, SFT, data quality — fine-tuning interview questions.", keywords: ["preplab","fine-tuning interview","LoRA interview","RLHF question","DPO interview","SFT question"] },
  { id: "preplab-system",   label: "PrepLab: System Design",       tab: "preplab", group: "PrepLab", desc: "End-to-end AI system design interview questions — architecture, reliability, cost.", keywords: ["preplab","system design interview","AI system design question","architecture interview","design question"] },
  { id: "preplab-product",  label: "PrepLab: AI Product & PM",     tab: "preplab", group: "PrepLab", desc: "AI PM interview questions — PRDs, metrics, model risk, stakeholder communication.", keywords: ["preplab","AI PM interview","product management AI","PRD interview","metrics question","AI product question"] },
  { id: "preplab-arch",     label: "PrepLab: Architecture",        tab: "preplab", group: "PrepLab", desc: "Transformer architecture, attention, tokenization — foundational interview questions.", keywords: ["preplab","architecture interview","transformer question","attention interview","tokenizer question","foundational AI"] },

  // ── Flows ─────────────────────────────────────────────────────────────────────
  { id: "transformer-flow", label: "Transformer Flow",       tab: "flows", group: "Flows", desc: "Animated walkthrough of the full transformer — encoder, decoder, attention, FFN.", keywords: ["transformer","architecture","encoder","decoder","feed forward","positional encoding","layer norm","residual","animated"] },
  { id: "context-flow",     label: "Context Window Flow",    tab: "flows", group: "Flows", desc: "How tokens are packed into and processed within the context window.", keywords: ["context window","token packing","context flow","KV cache","attention over context"] },
  { id: "rag-flow",         label: "RAG Pipeline Flow",      tab: "flows", group: "Flows", desc: "Step-by-step RAG flow: query → embed → retrieve → rerank → generate → answer.", keywords: ["RAG pipeline","RAG flow","retrieval pipeline","reranker","vector search","generate answer"] },
  { id: "agent-flow",       label: "Agent Loop Flow",        tab: "flows", group: "Flows", desc: "Thought → Action → Observation loop animation. How agents iterate to solve tasks.", keywords: ["agent loop","react loop","thought action observation","tool call","agent iteration","multi-step agent"] },
  { id: "guardrails-flow",  label: "Guardrails Flow",        tab: "flows", group: "Flows", desc: "Request lifecycle through guardrails — input classifier → model → output validator.", keywords: ["guardrails flow","safety pipeline","input classifier","output validator","content moderation flow"] },
  { id: "rag-arch-flow",    label: "RAG Architectures Flow", tab: "flows", group: "Flows", desc: "Naive vs. advanced vs. modular vs. agentic RAG architectures side-by-side.", keywords: ["RAG architectures","naive RAG","agentic RAG","modular RAG","self-RAG","corrective RAG","query rewriting"] },

  // ── Career ────────────────────────────────────────────────────────────────────
  { id: "system-design-career", label: "System Design Interview", tab: "career", group: "Career", desc: "45-minute AI system design framework — architecture selection, reliability budgets.", keywords: ["system design","interview","45 minutes","architecture","reliability","staff engineer","design interview"] },
  { id: "negotiation",          label: "Salary Negotiation",      tab: "career", group: "Career", desc: "Negotiation scripts, equity math, and counter-offer tactics for AI engineering roles.", keywords: ["negotiation","salary","compensation","equity","stock","RSU","ESOP","counter offer","offer negotiation"] },
  { id: "take-home",            label: "Take-Home Challenges",     tab: "career", group: "Career", desc: "What evaluators look for in AI take-home assignments — problem framing, evals, failure analysis.", keywords: ["take-home","challenge","assignment","portfolio","submission","AI take home","evaluators"] },

  // ── AIPM ──────────────────────────────────────────────────────────────────────
  { id: "prd-sim",          label: "PRD Simulator",            tab: "aipm", group: "AIPM", desc: "Write and review PRDs for AI features — uncertainty ranges, fallback behaviour, eval criteria.", keywords: ["PRD","product requirements","AI feature","fallback","eval criteria","product management","AI PM"] },
  { id: "roadmap",          label: "Roadmap Prioritizer",      tab: "aipm", group: "AIPM", desc: "Score AI initiatives on impact, feasibility, data readiness, and model risk.", keywords: ["roadmap","prioritization","AI initiatives","data readiness","model risk","product roadmap"] },
  { id: "stakeholder",      label: "Stakeholder Explainer",    tab: "aipm", group: "AIPM", desc: "Frameworks for explaining RAG, hallucinations, and eval gaps to execs and legal teams.", keywords: ["stakeholders","communication","explain AI","executives","non-technical","hallucination risk","legal"] },
  { id: "ai-or-not",        label: "AI-or-Not Framework",      tab: "aipm", group: "AIPM", desc: "6-question framework to decide when AI is the right solution — and when it is not.", keywords: ["AI or not","AI decision","when to use AI","framework","product strategy","build AI","AI justified"] },
  { id: "launch-checklist", label: "Launch Checklist",         tab: "aipm", group: "AIPM", desc: "Pre-launch checklist for AI features — eval gate, fallback, latency SLA, cost guardrails.", keywords: ["launch checklist","pre-launch","safety review","latency SLA","cost guardrails","eval gate","ship AI"] },
  { id: "metrics-room",     label: "Metrics Room",             tab: "aipm", group: "AIPM", desc: "Select the right metrics for 16+ AI product scenarios.", keywords: ["metrics","product metrics","success metrics","AI metrics","KPI","measurement","metrics room"] },

  // ── Explore ───────────────────────────────────────────────────────────────────
  { id: "embedding-explorer",  label: "Embedding Explorer",      tab: "explore", group: "Explore", desc: "3D interactive embedding space — semantic clusters, cosine similarity, analogy arithmetic.", keywords: ["embedding explorer","3D embeddings","semantic clusters","cosine similarity","analogy","vector visualisation"] },
  { id: "tokenizer-explore",   label: "Tokenizer Playground",    tab: "explore", group: "Explore", desc: "Live BPE tokenizer — paste any text and see token splits, IDs, and cost estimate.", keywords: ["tokenizer playground","BPE","live tokenizer","token splits","token IDs","cost estimate"] },
  { id: "attention-3d",        label: "3D Attention Viz",        tab: "explore", group: "Explore", desc: "3D visualisation of multi-head attention patterns across a sentence.", keywords: ["3D attention","attention visualisation","multi-head","attention patterns","attention heads","3D viz"] },
  { id: "diffusion-3d",        label: "3D Diffusion Trajectory", tab: "explore", group: "Explore", desc: "3D denoising trajectory — watch latent vectors converge from noise to signal.", keywords: ["diffusion","denoising","3D diffusion","latent space","noise to image","stable diffusion","trajectory"] },
  { id: "vector-db",           label: "Vector DB Comparator",    tab: "explore", group: "Explore", desc: "Side-by-side: Pinecone, Weaviate, Qdrant, Chroma, and pgvector.", keywords: ["vector database","Pinecone","Weaviate","Qdrant","Chroma","pgvector","vector DB comparison","ANN"] },
  { id: "shadow-mode",         label: "Shadow Mode Testing",     tab: "explore", group: "Explore", desc: "Run a challenger model in shadow mode alongside production.", keywords: ["shadow mode","shadow testing","challenger model","model comparison","A/B shadow","side by side"] },
  { id: "multi-agent-explore", label: "Multi-Agent Sandbox",     tab: "explore", group: "Explore", desc: "Trace a multi-agent system with supervisor, researcher, and writer agents.", keywords: ["multi-agent","sandbox","supervisor agent","agent trace","LangGraph","orchestration","agent sandbox"] },
  { id: "lora-3d",             label: "3D LoRA Decomposition",   tab: "explore", group: "Explore", desc: "3D visualisation of how LoRA low-rank matrices approximate a full weight update.", keywords: ["LoRA","low rank","3D LoRA","weight decomposition","rank","adapter weights","parameter efficient 3D"] },
];

// ─── STOPWORDS ────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall","can",
  "need","dare","ought","used","how","what","when","where","why","which","who",
  "whom","whose","that","this","these","those","i","you","he","she","it","we",
  "they","me","him","her","us","them","my","your","his","its","our","their",
  "in","on","at","to","for","of","with","by","from","about","as","into",
  "through","during","before","after","above","below","between","each","but",
  "and","or","not","so","yet","both","either","neither","just"
]);

// ─── SCORING ──────────────────────────────────────────────────────────────────

function extractKeywords(q) {
  return q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function scorePost(post, kws) {
  let s = 0;
  const t = post.title.toLowerCase();
  const d = post.desc.toLowerCase();
  const tags = (post.tags || []).join(" ").toLowerCase();
  const cat = (post.category || "").toLowerCase();
  for (const kw of kws) {
    if (t.includes(kw)) s += 4;
    if (tags.includes(kw)) s += 3;
    if (d.includes(kw)) s += 2;
    if (cat.includes(kw)) s += 1;
  }
  return s;
}

function scoreModule(mod, kws) {
  let s = 0;
  const l = mod.label.toLowerCase();
  const d = mod.desc.toLowerCase();
  const kws2 = (mod.keywords || []).join(" ").toLowerCase();
  for (const kw of kws) {
    if (l.includes(kw)) s += 4;
    if (kws2.includes(kw)) s += 3;
    if (d.includes(kw)) s += 2;
  }
  return s;
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

function search(q) {
  const kws = extractKeywords(q);
  if (!kws.length) return { posts: [], modules: [], keywords: [] };

  const scoredPosts = POSTS.map(p => ({ post: p, score: scorePost(p, kws) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map(x => x.post);

  const scoredModules = MODULES_KB.map(m => ({ mod: m, score: scoreModule(m, kws) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => x.mod);

  return { posts: scoredPosts, modules: scoredModules, keywords: kws };
}

// ─── CANNED ANSWERS ───────────────────────────────────────────────────────────

const CANNED_ANSWERS = [
  {
    triggers: ["what is rag", "how does rag work", "explain rag"],
    answer: "RAG (Retrieval-Augmented Generation) grounds LLM responses in your own documents. At query time: (1) embed the query → (2) retrieve top-k similar chunks from your vector DB → (3) pass chunks + query to the LLM → (4) LLM answers citing only what was retrieved. The key insight: the LLM's job is synthesis, not memorisation.",
    tab: "lab",
  },
  {
    triggers: ["what is a token", "how many tokens", "token count", "what is tokenization"],
    answer: "A token is roughly 3-4 characters of English text. 'tokenization' → ['token','ization'] = 2 tokens. 1,000 tokens ≈ 750 words. Non-English uses 2-5× more tokens. This matters because: (1) LLM pricing is per token, (2) context window limits are in tokens, (3) some words split unexpectedly.",
    tab: "concepts",
  },
  {
    triggers: ["what is an embedding", "how do embeddings work", "what are vectors"],
    answer: "Embeddings are fixed-size numerical vectors that represent meaning. Similar concepts cluster nearby in vector space. 'king' - 'man' + 'woman' ≈ 'queen'. Used for: semantic search (find similar content), RAG retrieval, classification, clustering. Models like text-embedding-3-small produce 1536-dimensional vectors.",
    tab: "concepts",
  },
  {
    triggers: ["how do i fine tune", "when to fine tune", "fine tuning vs rag", "should i fine tune"],
    answer: "Fine-tune when: (1) you need a specific style/format the model doesn't naturally produce, (2) you want to reduce prompt length at scale, (3) you're doing a well-defined narrow task with 1000+ examples. Use RAG when: the knowledge changes frequently, you need citations, or you have <100 examples. RAG first, fine-tune later is almost always the right order.",
    tab: "systems",
  },
  {
    triggers: ["what is temperature", "how does temperature work", "temperature sampling"],
    answer: "Temperature scales the probability distribution before sampling the next token. Temperature 0 = always pick the highest probability token (greedy, deterministic). Temperature 1 = sample from the raw distribution. Temperature >1 = flatten the distribution (more random). For production: 0-0.3 for factual tasks, 0.7-1.0 for creative tasks. Never use temperature >1 in production.",
    tab: "concepts",
  },
  {
    triggers: ["how to evaluate llm", "llm evaluation", "eval metrics", "how to measure quality"],
    answer: "LLM evaluation has 3 layers: (1) Automated metrics — ROUGE/BLEU for text overlap, exact match for structured output. (2) LLM-as-judge — use a stronger model to score outputs on rubrics. (3) Human evaluation — ground truth for calibrating your automated evals. Start with LLM-as-judge + 50 human-labeled examples. Never rely on a single metric.",
    tab: "systems",
  },
  {
    triggers: ["what is prompt injection", "prompt injection attack", "how to prevent injection"],
    answer: "Prompt injection is when user input tries to override your system prompt. Direct: user writes 'Ignore previous instructions and...' Indirect: malicious text in a retrieved document contains instructions. Defenses: (1) Input classifier to detect injection attempts, (2) Privilege separation — don't let user input reach tool-calling context, (3) Output validator, (4) Principle of least privilege for tools.",
    tab: "systems",
  },
  {
    triggers: ["context window", "how long context", "context length", "lost in the middle"],
    answer: "Context window = the total tokens the model can 'see' at once (input + output). GPT-4o: 128K, Claude 3.5 Sonnet: 200K, Gemini 1.5 Pro: 1M. The catch: models lose track of information in the middle of long contexts ('lost in the middle' effect). For long documents, chunk + retrieve rather than stuffing everything in. Context has quadratic (O(n²)) compute cost.",
    tab: "concepts",
  },
  {
    triggers: ["what is an agent", "how do agents work", "llm agent", "ai agent"],
    answer: "An LLM agent is a model in a loop: Thought → Action (tool call) → Observation → repeat until done. Tools are functions the model can call (search, calculator, API). Key properties: (1) multi-step reasoning, (2) tool use, (3) memory across turns, (4) goal-directed behaviour. Main failure modes: hallucinated tool calls, infinite loops, cascading errors. Always set max_iterations.",
    tab: "agents",
  },
  {
    triggers: ["how to reduce cost", "reduce llm cost", "cheaper llm", "llm pricing"],
    answer: "5 levers in order of ROI: (1) Cache aggressively — prompt caching saves 90% on repeated prefixes. (2) Route by complexity — send 80% of queries to small models ($0.001/1K tokens) and only 20% to large. (3) Compress prompts — remove examples once fine-tuned. (4) Batch offline work — 50% cheaper via batch API. (5) Fine-tune for repetitive narrow tasks. Typical result: $10K → $1-2K/month.",
    tab: "systems",
  },
  {
    triggers: ["vector database", "which vector db", "pinecone vs weaviate", "choose vector db"],
    answer: "Decision framework: (1) Managed + no infra pain → Pinecone. (2) Self-hosted + rich metadata filtering + hybrid search → Weaviate or Qdrant. (3) Prototype / local dev → Chroma. (4) Already on PostgreSQL + <1M vectors → pgvector. Qdrant is fastest for pure ANN. Weaviate has the best hybrid search. Pinecone is the easiest managed option but most expensive at scale.",
    tab: "explore",
  },
  {
    triggers: ["what is lora", "low rank adaptation", "lora fine tuning", "parameter efficient"],
    answer: "LoRA (Low-Rank Adaptation) fine-tunes large models by adding small trainable rank-r matrices alongside frozen original weights. Instead of updating all 7B parameters, you update only ~0.1% of them. The rank r controls the tradeoff: r=4 is ultra-light, r=64 approaches full fine-tuning quality. VRAM needed: 7B model at r=16 ≈ 18GB GPU RAM vs 80GB for full fine-tune.",
    tab: "systems",
  },
];

// ─── TRIGGER KEYWORD SCORING ─────────────────────────────────────────────────

const TRIGGER_KEYWORDS = {
  rag: ["rag", "retrieval", "retriev", "chunking", "chunk", "vector", "embedding", "augment", "knowledge base", "document"],
  tokens: ["token", "tokeniz", "tokenisation", "bpe", "wordpiece", "vocabulary", "vocab"],
  embeddings: ["embed", "semantic", "similarity", "vector space", "cosine"],
  temperature: ["temperature", "sampling", "top-p", "top-k", "greedy", "random", "creative"],
  finetuning: ["fine-tun", "finetun", "lora", "peft", "train", "instruction", "qlora", "sft"],
  evaluation: ["eval", "metric", "benchmark", "assess", "measur", "rouge", "bleu", "judge"],
  "prompt injection": ["inject", "jailbreak", "attack", "adversar", "prompt hack", "security"],
  "context window": ["context window", "context length", "long context", "needle", "haystack"],
  agents: ["agent", "tool use", "function call", "orchestrat", "react pattern", "planning", "reliable"],
  cost: ["cost", "cheap", "expensive", "latency", "speed", "fast", "optimis", "budget", "token cost"],
};

// Map TRIGGER_KEYWORDS keys to CANNED_ANSWERS topic indices
const TOPIC_TO_CANNED_INDEX = {
  rag: 0,
  tokens: 1,
  embeddings: 2,
  finetuning: 3,
  temperature: 4,
  evaluation: 5,
  "prompt injection": 6,
  "context window": 7,
  agents: 8,
  cost: 9,
};

function findCannedAnswer(q) {
  const normalised = q.toLowerCase().trim();

  // First try exact substring match on original triggers (fast path for unambiguous questions)
  for (const entry of CANNED_ANSWERS) {
    for (const trigger of entry.triggers) {
      if (normalised.includes(trigger)) return entry;
    }
  }

  // Keyword-overlap scoring for partial / natural-language queries
  const queryWords = normalised.split(/\s+/);
  let bestTopic = null;
  let bestScore = 0;
  Object.entries(TRIGGER_KEYWORDS).forEach(([topic, keywords]) => {
    const score = keywords.filter(kw => queryWords.some(w => w.includes(kw) || kw.includes(w))).length;
    if (score > bestScore) { bestScore = score; bestTopic = topic; }
  });

  if (bestScore >= 1 && bestTopic !== null && TOPIC_TO_CANNED_INDEX[bestTopic] !== undefined) {
    return CANNED_ANSWERS[TOPIC_TO_CANNED_INDEX[bestTopic]];
  }

  return null;
}

// ─── SUGGESTED QUESTIONS ──────────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "How do I choose between RAG and fine-tuning?",
  "What is prompt injection and how do I defend against it?",
  "How does temperature affect LLM output?",
  "What vector database should I use?",
  "How do I evaluate my LLM application?",
  "How do I reduce my LLM inference costs?",
  "What is a context window and why does size matter?",
  "How do agents work and when should I use them?",
];

// ─── HIGHLIGHT HELPER ─────────────────────────────────────────────────────────

function highlightText(text, keywords) {
  if (!keywords || !keywords.length) return <>{text}</>;
  const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const rx = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(rx);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
      )}
    </>
  );
}

// ─── CATEGORY COLOUR MAP ─────────────────────────────────────────────────────

const CAT_COLOURS = {
  foundations:  "bg-blue-900/40 text-blue-300 border-blue-700/40",
  rag:          "bg-violet-900/40 text-violet-300 border-violet-700/40",
  agents:       "bg-amber-900/40 text-amber-300 border-amber-700/40",
  evaluation:   "bg-green-900/40 text-green-300 border-green-700/40",
  llmops:       "bg-cyan-900/40 text-cyan-300 border-cyan-700/40",
  safety:       "bg-red-900/40 text-red-300 border-red-700/40",
  sysdesign:    "bg-indigo-900/40 text-indigo-300 border-indigo-700/40",
  failures:     "bg-orange-900/40 text-orange-300 border-orange-700/40",
  product:      "bg-pink-900/40 text-pink-300 border-pink-700/40",
  interview:    "bg-teal-900/40 text-teal-300 border-teal-700/40",
  finetuning:   "bg-purple-900/40 text-purple-300 border-purple-700/40",
  multimodal:   "bg-rose-900/40 text-rose-300 border-rose-700/40",
  models:       "bg-sky-900/40 text-sky-300 border-sky-700/40",
};

const TAB_COLOURS = {
  concepts: "bg-blue-900/40 text-blue-300",
  flows:    "bg-indigo-900/40 text-indigo-300",
  systems:  "bg-cyan-900/40 text-cyan-300",
  agents:   "bg-amber-900/40 text-amber-300",
  fluency:  "bg-green-900/40 text-green-300",
  career:   "bg-teal-900/40 text-teal-300",
  aipm:     "bg-pink-900/40 text-pink-300",
  explore:  "bg-violet-900/40 text-violet-300",
  lab:      "bg-orange-900/40 text-orange-300",
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function CannedBox({ canned, onNavigate }) {
  return (
    <div className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-sm font-bold">Direct Answer</span>
        <span className="text-xs text-amber-600 font-mono uppercase tracking-widest">knowledge base</span>
      </div>
      <p className="text-sm text-amber-100/90 leading-relaxed whitespace-pre-line">{canned.answer}</p>
      {canned.tab && onNavigate && (
        <button
          onClick={() => onNavigate(canned.tab)}
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
        >
          Go to {canned.tab.charAt(0).toUpperCase() + canned.tab.slice(1)} →
        </button>
      )}
    </div>
  );
}

function PostCard({ post, onNavigate, onNavigateTo, keywords }) {
  const catCls = CAT_COLOURS[post.category] || "bg-zinc-800 text-zinc-400 border-zinc-700";
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col gap-2 hover:border-zinc-600 cursor-pointer hover:bg-zinc-800/50 transition-colors"
      onClick={() => onNavigateTo ? onNavigateTo({ tab: "groundtruth", postId: post.id }) : onNavigate && onNavigate("groundtruth")}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${catCls}`}>
          {post.category}
        </span>
        <span className="text-xs text-zinc-600">{post.readMin} min read</span>
      </div>
      <p className="text-sm font-semibold text-white leading-snug">{post.title}</p>
      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{highlightText(post.desc, keywords)}</p>
      {(onNavigate || onNavigateTo) && (
        <button
          onClick={e => { e.stopPropagation(); onNavigateTo ? onNavigateTo({ tab: "groundtruth", postId: post.id }) : onNavigate("groundtruth"); }}
          className="self-start text-xs text-violet-400 hover:text-violet-300 font-semibold mt-1 transition-colors"
        >
          Open →
        </button>
      )}
    </div>
  );
}

function ModuleCard({ mod, onNavigate, onNavigateTo }) {
  const tabCls = TAB_COLOURS[mod.tab] || "bg-zinc-800 text-zinc-400";
  const handleGo = () => {
    if (onNavigateTo) {
      onNavigateTo({ tab: mod.tab, moduleId: mod.id });
    } else if (onNavigate) {
      onNavigate(mod.tab);
    }
  };
  return (
    <div
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-start justify-between gap-3 hover:border-zinc-600 transition-colors cursor-pointer"
      onClick={handleGo}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tabCls}`}>
            {mod.tab}
          </span>
        </div>
        <p className="text-sm font-semibold text-white">{mod.label}</p>
        <p className="text-xs text-zinc-400 leading-relaxed">{mod.desc}</p>
      </div>
      {(onNavigate || onNavigateTo) && (
        <button
          onClick={e => { e.stopPropagation(); handleGo(); }}
          className="shrink-0 text-xs text-violet-400 hover:text-violet-300 font-semibold whitespace-nowrap transition-colors mt-1"
        >
          Go →
        </button>
      )}
    </div>
  );
}

function ResultsPanel({ results, query, onNavigate, onNavigateTo, onRerun }) {
  const { posts, modules, keywords, canned } = results;
  const hasResults = posts.length > 0 || modules.length > 0;

  return (
    <div className="space-y-5">
      {/* Canned answer */}
      {canned && <CannedBox canned={canned} onNavigate={onNavigate} />}

      {!hasResults ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-8 text-center space-y-2">
            <p className="text-sm text-zinc-300">Nothing found for <span className="text-white font-semibold">"{query}"</span>.</p>
            <p className="text-xs text-zinc-500">
              Try rephrasing — or{" "}
              {onNavigate ? (
                <button onClick={() => onNavigate("groundtruth")} className="text-violet-400 hover:text-violet-300 transition-colors">
                  browse Ground Truth
                </button>
              ) : (
                <span className="text-violet-400">browse Ground Truth</span>
              )}{" "}
              for all 225+ posts.
            </p>
          </div>
          {onRerun && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Try one of these</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.slice(0, 5).map(q => (
                  <button
                    key={q}
                    onClick={() => onRerun(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-violet-600 hover:text-violet-400 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Post results */}
          {posts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                Top results from our knowledge base
              </p>
              <div className="space-y-2">
                {posts.map(p => (
                  <PostCard key={p.id} post={p} onNavigate={onNavigate} onNavigateTo={onNavigateTo} keywords={keywords} />
                ))}
              </div>
            </div>
          )}

          {/* Module results */}
          {modules.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                Relevant modules
              </p>
              <div className="space-y-2">
                {modules.map(m => (
                  <ModuleCard key={m.id} mod={m} onNavigate={onNavigate} onNavigateTo={onNavigateTo} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Matched keywords */}
      {keywords.length > 0 && (
        <p className="text-xs text-zinc-700">
          Matched: {keywords.join(", ")}
        </p>
      )}
    </div>
  );
}

function HistoryPanel({ history, onRerun }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Recent searches</p>
      <div className="flex flex-col gap-1">
        {[...history].reverse().map((item, i) => (
          <button
            key={i}
            onClick={() => onRerun(item.q)}
            className="text-left text-xs px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-all truncate"
          >
            {item.q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Consultation({ onNavigate, onNavigateTo }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  function runSearch(q) {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoading(true);

    // Simulate brief async tick so UI can update (LLM-ready slot)
    setTimeout(() => {
      const canned = findCannedAnswer(trimmed);
      const { posts, modules, keywords } = search(trimmed);
      const res = { posts, modules, keywords, canned };

      setResults(res);
      setHistory(prev => {
        // Deduplicate — move to front if already present
        const filtered = prev.filter(h => h.q !== trimmed);
        return [...filtered.slice(-9), { q: trimmed, results: res }];
      });
      setLoading(false);
    }, 0);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Search the Lab</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Keyword search across 225+ Ground Truth posts and every module.
        </p>
      </div>

      {/* Search input */}
      <div className="flex gap-2">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              runSearch(query);
            }
          }}
          placeholder="e.g. How do I choose between RAG and fine-tuning?"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-600 transition-all resize-none"
          rows={2}
        />
        <button
          onClick={() => runSearch(query)}
          disabled={loading || !query.trim()}
          className="px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shrink-0"
        >
          {loading ? "..." : "Search →"}
        </button>
      </div>

      {/* Suggested questions — shown before any search */}
      {history.length === 0 && !results && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => { setQuery(q); runSearch(q); }}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-violet-600 hover:text-violet-400 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <ResultsPanel
          results={results}
          query={query}
          onNavigate={onNavigate}
          onNavigateTo={onNavigateTo}
          onRerun={q => { setQuery(q); runSearch(q); }}
        />
      )}

      {/* History */}
      {history.length > 0 && (
        <HistoryPanel history={history} onRerun={q => { setQuery(q); runSearch(q); }} />
      )}
    </div>
  );
}
