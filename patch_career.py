filepath = "/sessions/intelligent-wizardly-ptolemy/mnt/GitHub--genai-systems-lab/src/Career.jsx"
with open(filepath, 'r') as f:
    content = f.read()

new_prompts = r"""  {
    id: "multimodal_search",
    title: "Multimodal Product Search",
    brief: "Design an AI search system for an e-commerce platform that accepts both text and image queries (e.g., 'find something similar to this photo').",
    scale: "50M products · text + image queries",
    components: [
      { id: "clip", label: "Multimodal embedding model (CLIP or similar)", must: true, explanation: "CLIP-style models encode both text and images into the same vector space, enabling cross-modal similarity. Without this, text and image queries are incomparable." },
      { id: "indexes", label: "Separate vector indexes for text, image, and cross-modal", must: true, explanation: "Text-only queries should hit the text index for highest precision. Image queries hit the image index. Hybrid queries need a fused cross-modal index. One index for all three creates precision loss." },
      { id: "router", label: "Query type router (text-only vs image vs hybrid)", must: true, explanation: "Routing correctly determines which index and retrieval path to use. A text query through the image index loses ranking quality. Misrouting is invisible and hard to debug." },
      { id: "reranker", label: "Reranker that handles cross-modal relevance", must: true, explanation: "ANN retrieval is approximate. Cross-modal reranking (e.g., re-scoring image results with a text-visual relevance model) is essential for precision at top-5." },
      { id: "preprocess", label: "Image preprocessing pipeline", must: false, explanation: "Resizing, format normalization, and EXIF stripping improve embedding quality and reduce compute cost. Important for production but can start without it." },
      { id: "fallback", label: "Fallback to text-only for unsupported image formats", must: false, explanation: "Not all images are embeddable (corrupt, too small, unsupported format). Graceful degradation to text-only prevents hard failures." },
      { id: "ab_modal", label: "A/B test text vs multimodal relevance", must: false, explanation: "Multimodal isn't always better — for precise product name searches, pure text often wins. A/B testing lets you route by query type once you have data." },
    ],
  },
  {
    id: "streaming_agent",
    title: "Real-Time Document Analysis Agent",
    brief: "Design an agent that processes incoming documents in real-time (contracts, invoices, reports) and streams structured extractions to downstream systems.",
    scale: "10K docs/day · <5s P95 latency",
    components: [
      { id: "queue", label: "Document ingestion queue (async)", must: true, explanation: "At 10K docs/day, direct synchronous processing creates backpressure under load spikes. A queue (SQS, Kafka) decouples ingestion rate from processing rate." },
      { id: "streaming_llm", label: "Streaming LLM with structured output schema", must: true, explanation: "Structured output (JSON schema enforcement) ensures downstream systems receive parseable data. Streaming enables <5s P95 by delivering partial results as they arrive." },
      { id: "validator", label: "Extraction validator + retry on schema failure", must: true, explanation: "LLMs occasionally produce malformed JSON or schema violations. A validator catches these and retries (up to 2×) before sending to downstream, preventing silent data corruption." },
      { id: "dlq", label: "Dead-letter queue for failed extractions", must: true, explanation: "Some documents will fail extraction after retries (corrupt, unsupported format, ambiguous content). DLQ captures these for human review without losing the document." },
      { id: "webhook", label: "Downstream webhook delivery with retry", must: true, explanation: "Downstream systems have their own availability issues. Webhook delivery with exponential backoff and idempotency keys prevents data loss from transient downstream failures." },
      { id: "ocr", label: "OCR preprocessing for scanned docs", must: false, explanation: "Scanned PDFs and photos require OCR before LLM extraction. At 10K docs/day, a significant fraction may be scanned. Add when scan volume is known." },
      { id: "confidence", label: "Confidence scoring per extracted field", must: false, explanation: "Per-field confidence enables downstream systems to flag low-confidence extractions for human review rather than using potentially wrong values." },
      { id: "human_review", label: "Human review queue for low-confidence extractions", must: false, explanation: "Closes the confidence feedback loop. Human corrections become training data and reveal systematic extraction failures." },
    ],
  },
  {
    id: "code_review_ai",
    title: "AI Code Review Bot",
    brief: "Design an AI system that automatically reviews pull requests for bugs, security issues, and style violations before human review.",
    scale: "500 PRs/day · comment within 3 min of PR open",
    components: [
      { id: "webhook_gh", label: "GitHub webhook listener", must: true, explanation: "The entry point for all PR events. Receives PR open/update events in real-time. Without this, you're polling — which adds latency and misses the 3-minute SLA." },
      { id: "diff_builder", label: "Diff-aware context builder (changed code + relevant imports)", must: true, explanation: "Sending the entire file to the LLM wastes tokens and buries the change. A diff-aware builder extracts: changed lines ± N lines context, relevant imports, and function signatures. This is where most teams underinvest." },
      { id: "specialized_prompts", label: "Specialized prompts per review type (security vs bugs vs style)", must: true, explanation: "A single 'review this code' prompt produces mediocre results across all dimensions. Specialized prompts — each tuned for security patterns, logic bugs, or style — produce higher precision and fewer false positives." },
      { id: "fp_filter", label: "False-positive filter (avoid noisy comments)", must: true, explanation: "A bot that posts 50 comments on a 10-line PR gets muted by engineers. False-positive filtering (confidence threshold + per-file comment cap) determines whether the bot is used or ignored." },
      { id: "pr_comment_api", label: "PR comment API integration", must: true, explanation: "The output mechanism. Inline comments on specific diff lines are more actionable than a single top-level comment. GitHub's review API supports inline comments with line references." },
      { id: "team_config", label: "Team-specific rule configuration", must: false, explanation: "Different teams have different style preferences and security threat models. Per-team config makes the bot useful to more teams. Start with defaults; add config when teams request it." },
      { id: "feedback_loop", label: "Learning from accepted/rejected suggestions", must: false, explanation: "Tracking which comments get resolved vs ignored is the highest-signal improvement lever. After 500 PRs, you know which comment types to suppress." },
      { id: "linter_first", label: "Integration with existing linters (run linter first, LLM only reviews what linter misses)", must: false, explanation: "Linters are fast and free. Run ESLint/Pylint first, filter their output from the LLM's task. LLM adds value for semantic bugs and security patterns that linters can't catch." },
    ],
  },
"""

# Find the closing of the last existing prompt and insert before the closing `];` of SYSTEM_DESIGN_PROMPTS
# The SYSTEM_DESIGN_PROMPTS array ends with `];\n\nconst TAKEHOME_CHALLENGES`
old_pattern = "];\n\nconst TAKEHOME_CHALLENGES"
new_pattern = new_prompts + "];\n\nconst TAKEHOME_CHALLENGES"

if old_pattern in content:
    content = content.replace(old_pattern, new_pattern, 1)
    with open(filepath, 'w') as f:
        f.write(content)
    print("SUCCESS: inserted 3 new system design prompts into SYSTEM_DESIGN_PROMPTS")
else:
    print("PATTERN NOT FOUND")
    idx = content.find("TAKEHOME_CHALLENGES")
    print(repr(content[idx-100:idx+30]))
