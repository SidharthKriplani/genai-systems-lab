# Ideas Dump

A holding area for future product ideas. Nothing here is on the roadmap unless explicitly moved.

---

## Blog / Learn Section

**Status:** In progress — placeholder page live, content to be written.

**Concept:** A blog/learn section that acts as pre-reading and deep-dive companion to the interactive platform. The platform tests you; the blog teaches you. Together they form a full learning loop: read → understand → test yourself interactively.

**Why it matters:**
- Users landing on the RAG Lab cold have no context — blogs fix the cold-start problem
- Makes the platform Google-searchable (organic acquisition, free)
- Positions GenAI Systems Lab as a complete resource, not just a toy
- Each post links directly into the relevant platform module so readers can immediately test what they just learned

**Content sources:** Rich internal material exists across LLM fundamentals, RAG, agents, evaluation, LLMOps, system design, and fintech/production AI.

**Planned post categories:**
1. Foundations — transformers, tokenization, embeddings, context windows
2. RAG — chunking, retrieval, reranking, failure modes, evaluation
3. Agents — ReAct, tool use, memory, multi-agent, failure modes
4. Evaluation — RAGAS, G-Eval, groundedness, hallucination detection
5. LLMOps — cost, latency, observability, CI/CD for ML, prompt caching
6. System Design — end-to-end AI system design interview patterns
7. Production Failures — real failure scenarios explained in depth
8. Interview Prep — question patterns, traps, how to structure answers

**Product angle:**
> "Learn the concept. Then break it on the platform."

Each blog post ends with: **"Test this in the lab →"** linking to the relevant module.

**Implementation notes:**
- Blog.jsx created as placeholder page — all posts show "Coming soon" with topic, category, estimated read time
- Wire into nav once first 2-3 posts are written
- Posts can be MDX files or embedded JSX — decide based on content volume
- SEO: each post should have a clear title, meta description, and structured content

---

## AI Bookshelf / Reading Radar

**Status:** Idea only. Do not implement yet.

**Concept:** A curated AI/ML/GenAI reading radar that helps users discover important books and understand which ones are worth reading for their specific goals.

**Sharp product angle:**
> "Which AI book should I read for my goal?"

**Possible user goals:**
- Software engineer learning LLM systems
- PM trying to understand AI products
- Preparing for AI/ML interviews
- Want foundations, not hype
- Want AI product strategy, not math
- Want system design / RAG / agent infrastructure depth

**Potential fit:** Could become a "Reading Radar" section inside GenAI Systems Lab after the blog is stable.

---
