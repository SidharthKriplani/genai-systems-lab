# GT_POSTS_QUEUE.md — GenAI Systems Lab — External Content Queue

_Logged sprint 93q. Same pedagogical standard as Foundations modules — same 7 principles, different format._

## Format spec
- 400–600 words
- No MCQs, no scenario box, no section headers
- Single concept per post
- Illustration mandatory (ASCII or embedded image)
- Opens with production problem (stakes-first)
- Concept arrives as conclusion, not introduction
- Ends with one-line crystallization

## Queue

| # | Concept | Status | Source module |
|---|---------|--------|---------------|
| 1 | Attention: why Q and K had to exist | done    | attention |
| 2 | Why softmax and not just normalize | done    | attention |
| 3 | KV cache: why adding one user slows everyone | done    | kv-cache |
| 4 | Why temperature=0 is not "most accurate" | done    | sampling |
| 5 | Why fine-tuning destroys what pretraining built | done    | nextoken |
| 6 | What hallucination actually is (not a bug) | done    | hallucination |
| 7 | Why RAG fails in the middle of documents | done    | context |
| 8 | LoRA: one base model, N adapters | done    | lora |
| 9 | Chinchilla: bigger is not always better | done    | scaling-laws |
| 10 | Why chunk boundaries kill RAG quality | done    | chunking |

## Process

1. Pick post from queue
2. Write draft against the 7 principles in CONTENT-STANDARD.md
3. Run through checklist
4. Add illustration at breakthrough moment
5. Review against source module to verify no factual gap
6. Publish
