// keyPoints + recap patch (group B) — merged into RUNNER_DATA after it is built.
// Distilled from each module's existing scenario/explanation/takeaway. No new claims.
export const RECAP_PATCH_B = {
  "zero-shot": {
    keyPoints: [
      "**Zero-shot leans on instruction-following** — SFT/RLHF let the model act on a plain task description with no examples; 71% is a real signal, not a failure.",
      "**It works where the task matches pre-training** — sentiment, factual Q&A, summarization, common transforms; zero annotation cost.",
      "**The gap lives at the boundary** — cases where two categories both apply have no disambiguation rule, so the model falls back to its pre-training prior, which may not match your business logic.",
      "**Longer descriptions are not the fix** — verbose caveats and edge-case prose often *hurt*; the real fix for boundary cases is examples.",
      "**Zero-shot and few-shot are levels of specification, not rivals** — start zero-shot, measure on your real task, then let the failures pick your examples.",
      "**Zero-shot failures are the example-curation guide** — they tell you exactly which boundary cases few-shot must cover.",
    ],
    recap: [
      "**Zero-shot = describe-and-go**, via instruction-following — the baseline is signal, not failure.",
      "**Errors concentrate at ambiguous boundaries** — no rule resolves overlapping categories.",
      "**More prose hurts; examples help** — length isn't the lever.",
      "**Zero-shot first → few-shot from its failures** — layered, not competing.",
    ],
  },

  "few-shot": {
    keyPoints: [
      "**Few-shot resolves boundary cases by demonstration** — the cases zero-shot instructions leave underspecified.",
      "**The model learns the pattern of your examples, not just the content** — including format you never meant to specify.",
      "**Format consistency is the easiest trap** — three correctly-translated examples phrased three different ways teach three competing input shapes, so a new input matching none of them cleanly gets no consistent pattern to follow.",
      "**Representativeness + Difficulty Distribution** — span the realistic input range, and include 1-2 harder examples; an all-easy set makes the model overconfident on real hard cases.",
      "**Edge Case Coverage + Format Diversity** — show at least one tricky input handled gracefully, and reflect real variation in input length/structure, or the model generalizes only from the center of your examples.",
      "**Four selection principles, one question:** does this example set look like the traffic it will actually meet, in form and in difficulty?",
    ],
    recap: [
      "**Examples teach pattern, not just content** — inconsistent phrasing = ambiguous pattern.",
      "**Format consistency first:** same input shape across every example.",
      "**Then four selection principles:** representativeness, difficulty distribution, edge case coverage, format diversity.",
      "**All four ask: does the set look like real traffic, in form and in difficulty?**",
    ],
  },

  "chain-of-thought": {
    keyPoints: [
      "**A direct answer has no structural constraint** — Roger's-balls question: the model can silently skip the 2×3 multiplication and add 5+3 instead, giving the wrong answer (8, not 11).",
      "**CoT routes generation through learned derivation patterns** — each correct step raises the conditional probability of the next correct step, from millions of worked derivations seen in pretraining.",
      "**It adds no new capability, only structure** — the model isn't 'checking' anything; it's completing a familiar pattern instead of guessing cold.",
      "**CoT always costs tokens, but the gain is task-dependent** — strong on multi-step math and complex reasoning, moderate on code gen/debugging, none on simple factual lookups or creative writing.",
      "**The 'capital of France' pairing shows the downside directly** — 1 token direct vs. 31 tokens with CoT, both correct: a 31× cost for zero gain on a single-fact lookup.",
      "**Zero-shot CoT first; few-shot CoT for calculation-style guidance; self-consistency (majority vote) for high-stakes chains.**",
    ],
    recap: [
      "**Direct answers have no step-to-step constraint** — Roger's balls: 8 (wrong) vs. 11 (CoT, correct).",
      "**CoT conditions each step on the prior correct step**, from pretraining's worked derivations.",
      "**Gain is task-dependent: strong on math/reasoning, none on factual lookups/creative writing** — 1-vs-31 tokens on \"capital of France\" is the cost with zero benefit.",
      "**Zero-shot CoT first; self-consistency (majority vote) when one wrong chain is costly.**",
    ],
  },

  "system-prompts": {
    keyPoints: [
      "**A system prompt is text, not a rule engine** — the model processes it with the same attention as any input; its influence is probabilistic, not deterministic.",
      "**Build it as distinct-purpose blocks**, not one blob: persona (tone/expertise), constraints (refusal/disclosure behavior), format (output shape), domain context (specialized vocabulary) — each ~28-45 tokens, none redundant with another.",
      "**Each block's failure mode is specific to its own job** — drop persona and tone goes generic; drop constraints and the model may hallucinate or leak instructions; drop format and output structure gets inconsistent; drop domain context and vocabulary defaults to generic wording.",
      "**Constraints is the primary injection surface** — it's the only block that explicitly tells the model to resist override attempts, so it's the only block with any counter-instruction for an attack to lose to.",
      "**Domain context is the most situational block** (often the priciest) — worth its ~45-token cost only in the deployment it's written for; leaving it off elsewhere isn't a mistake, it's a legitimate default.",
      "**Because it's just text, 'resisting' an attack is probabilistic, not guaranteed** — constraints hardening is a strong layer, not a complete one.",
    ],
    recap: [
      "**Build blocks by job, not one blob:** persona, constraints, format, domain context.",
      "**Each block has its own failure mode when missing** — no block substitutes for another.",
      "**Constraints = primary injection surface** — the only block with a counter-instruction to resist override.",
      "**Domain context is situational** — pay its token cost only where it's actually needed.",
    ],
  },

  "structured-outputs": {
    keyPoints: [
      "**JSON is not a native output mode** — the model has no parser or validator; it emits tokens that happen to form JSON when it works, and truncates or mis-nests when it fails.",
      "**Prompting for JSON gets ~85-92% compliance** — adequate only for low-stakes pipelines with retry logic.",
      "**JSON mode forces valid *syntax* but not *schema*** — you still get hallucinated fields, missing required fields, and wrong types.",
      "**Schema-enforced structured outputs use grammar-constrained decoding** — the sampler is restricted to tokens that keep output schema-valid at every step; it *cannot* omit a required field or misplace a comma.",
      "**Function calling validates typed arguments against a predefined schema** — a real guarantee, but only for fields declared upfront, and only once the model chooses to call the function at all; grammar-constrained decoding forces validity regardless of what the model 'wants.'",
      "**Forced schemas can't express uncertainty** — the model must emit a typed value even when the truth is unknown, so gaps get coerced into plausible-looking values.",
      "**Add a per-field confidence field** — route low-confidence extractions to human review without blocking the automated path.",
    ],
    recap: [
      "**JSON = token prediction** — no structural awareness during generation.",
      "**JSON mode fixes syntax, not schema** — fields/types still drift.",
      "**Grammar-constrained decoding → invalid output impossible** — the production fix.",
      "**It also forces values for unknowns** — add a confidence field.",
    ],
  },

  "prompt-security": {
    keyPoints: [
      "**Prompt injection targets the app architecture, not the model's alignment** — the LLM has no structural way to mark trusted instructions as more authoritative than untrusted input when both arrive as text.",
      "**Direct injection** overrides instructions via the user's own input; **indirect injection** hides in retrieved content and works even with perfectly sanitized user input.",
      "**System prompt hardening and output filtering are each independently effective** across direct injection, indirect injection, jailbreak, and prompt leaking — the weak layer is input classifiers, which miss everything except jailbreak framing.",
      "**Prompt leaking** — extracting the system prompt itself via requests like 'repeat everything above this line' — is caught by the same hardening + output-filter combination.",
      "**Stack all three content-level layers** — each catches something novel that could slip past the others; no single layer is complete on its own.",
      "**Privilege separation is a fourth, different layer for privileged actions** — the LLM only proposes a structured action; the application validates against an allowlist before executing. 'LLM proposes, application disposes.'",
    ],
    recap: [
      "**No structural trust boundary in the token stream** — trusted and untrusted text look the same to the model.",
      "**Direct injection = user input; indirect = retrieved content** — indirect bypasses input sanitization entirely.",
      "**Hardened system prompts + output filters each independently catch most attacks** — input classifiers are the weak layer (miss all but jailbreak).",
      "**Privilege separation** — propose, then validate — is the extra layer needed specifically for privileged actions, not content.",
    ],
  },

  "pgvector-vs-managed": {
    keyPoints: [
      "**pgvector lives inside Postgres** — a `WHERE user_id = $1` pre-filter runs in the *same* SQL query as the ANN search, a JOIN dedicated DBs can't match natively.",
      "**Dedicated DBs (Pinecone/Qdrant/Weaviate/Milvus) are purpose-built for ANN** — in-memory, horizontally sharded, lower latency at high vector counts.",
      "**The crossover is ~10M vectors** — beyond that, pgvector latency climbs and scaling needs complex Postgres sharding.",
      "**The JOIN advantage reverses above the ceiling** — at 100M vectors you don't want vector search bottlenecking your relational DB.",
      "**Start with pgvector when you already run Postgres** — `ALTER TABLE ADD COLUMN embedding vector(1536)` deploys in minutes; migrate on hitting the ceiling.",
      "**'Free' pgvector has a hidden cost** — a memory-resident HNSW index contends with relational workload, often forcing a bigger instance or a dedicated replica.",
    ],
    recap: [
      "**pgvector's edge: relational JOIN pre-filter**, one query.",
      "**Dedicated DBs win pure ANN at scale** — in-memory, horizontally sharded.",
      "**~10M vectors = crossover** where pgvector latency degrades.",
      "**Default to pgvector, migrate at the ceiling** — budget the instance contention 'free' hides.",
    ],
  },

  "vector-migration-patterns": {
    keyPoints: [
      "**Embeddings are tied to their model** — v1 and v2 vectors live in different geometric spaces; cross-model cosine distance is *meaningless*, and it fails silently with no error.",
      "**Never do a stop-the-world re-embed** — the safe pattern is dual-write → backfill → cutover → decommission.",
      "**Dual-write** sends new docs to both indexes while reads still serve the old one — no user impact.",
      "**Backfill is the expensive step** — re-embed every existing doc into the new index (5M at 500 docs/sec ≈ 2.8h); run off-peak. Don't read the new index yet — it's only partly populated.",
      "**Cutover atomically** once the new index is 100% populated, switching reads over.",
      "**Keep the old index warm 24-72h** as rollback insurance, then decommission.",
    ],
    recap: [
      "**Switching models invalidates every stored vector silently** — spaces don't align.",
      "**Dual-write** — new docs to both, reads stay on old, no user impact.",
      "**Backfill fully before querying new index** — partial coverage = low recall.",
      "**Cutover atomically → keep old index warm → decommission.**",
    ],
  },

  "vision-language-arch": {
    keyPoints: [
      "**A VLM bolts a vision encoder onto an LLM through a small trained bridge** — no new architecture, the image becomes a few hundred extra tokens the LLM attends over like any other tokens.",
      "**The pipeline: image → ViT (196 patches × 768d) → projector (→4096d) → ~256 visual tokens → LLM** — a 14×14 patch grid, a ViT embedding per patch, a projector bridging the dimensional gap, then standard self-attention.",
      "**Only the projector is trained from scratch** — the ViT and LLM can both stay frozen during multimodal fine-tuning, making the projector the cheapest lever for domain adaptation.",
      "**Resolution sensitivity follows directly from patchification** — a digit small relative to the patch grid loses definition before the ViT even embeds it; no later stage recovers that detail.",
      "**Numeric fidelity under ambiguity** — on a hard-to-resolve digit, the LLM completes a plausible number from context rather than refusing, which is dangerous for financial extraction specifically.",
      "**Validate, don't trust** — check every extracted numeric against a business rule the document itself can verify (do line items sum to the total?), and feed the highest resolution you reasonably can.",
    ],
    recap: [
      "**VLM = ViT + trained projector + unmodified LLM** — image becomes ~256 extra tokens.",
      "**Only the projector is trained from scratch** — cheapest lever for domain adaptation.",
      "**Fixed patch grid caps resolution** — small digits lose detail before the LLM ever sees them.",
      "**The model completes, it doesn't refuse** — validate every numeric against a business rule.",
    ],
  },

  "multimodal-rag": {
    keyPoints: [
      "**Text-only RAG assumes flattening to text loses nothing** — true for prose, false for tables and charts, where layout carries the answer.",
      "**Parsing a page to text destroys structure** — a real demo: 38 tokens of raw numbers, chart data missing entirely, table rows/columns collapsed into two flat sentences.",
      "**The fix is retrieving the page as an image, not a better parse or caption** — a vision retriever (ColPali-style) matches on visual+text similarity; a VLM reads the retrieved page directly, same demo: ~256 tokens, full table/chart/footnotes intact.",
      "**This is vision-language-arch's lesson applied to retrieval** — a page image is just a few hundred extra tokens a VLM can attend over, so there's no need to ever flatten it to text.",
      "**The real trade is tokens, not accuracy** — ~256 vs. 38 tokens per page (roughly 6-7×) for the retrieved context; a VLM read is also a heavier generation call.",
      "**Reach for page-image retrieval when layout is load-bearing** (tables, charts, forms, multi-column) — stay with text RAG for clean prose and latency-critical paths.",
    ],
    recap: [
      "**Parsing to text loses table/chart structure** — 38-token demo: chart data gone, table flattened.",
      "**Fix: embed and retrieve the page as an image**, read it with a VLM — 256-token demo: layout intact.",
      "**Trade is tokens (~6-7× more), not accuracy** — pay it when layout matters.",
      "**Text RAG stays right for clean prose / latency-critical paths.**",
    ],
  },

  "resolution-token-cost": {
    keyPoints: [
      "**Visual token count scales as the square of linear resolution** — area scaling, not linear; this is the key VLM cost fact.",
      "**A 4× linear increase is 16× tokens** — 512→2048 goes from ~1,340 to ~21,400 visual tokens per image.",
      "**Resolution has quadratic cost impact** — the 50K/day pipeline drops from ~$2,400/day (2048²) to ~$150/day (512²), roughly $67K/month saved, before checking quality.",
      "**Most catalog attributes read fine at 512×512** — high resolution earns its cost only for fine print, pixel-level texture, or subtle defects.",
      "**Measure before changing production** — process ~1,000 images at both resolutions against a ground-truth set and compare accuracy.",
      "**Use adaptive resolution if a subset degrades** — a cheap binary classifier routes 'complex' images to high-res and 'standard' images to low-res.",
    ],
    recap: [
      "**Tokens scale with area:** 4× linear → 16× tokens → ~16× cost.",
      "**2048→512 cuts the bill ~16×** at the same rate.",
      "**Simple attributes rarely need full resolution** — validate on a labeled sample.",
      "**Route only complex images to high-res** via a cheap classifier.",
    ],
  },

  "ocr-pipeline-design": {
    keyPoints: [
      "**OCR is the silent failure point of document AI** — a bad parse yields confident LLM hallucinations with no error signal; garbled and clean text look identical to the model.",
      "**First diagnostic: is there already a text layer?** If the PDF has selectable text, extract it directly — 100% accurate, near-zero cost, no OCR needed.",
      "**Second diagnostic: is the task pure Q&A on a scan?** If so, skip OCR-as-text entirely — a VLM can read the page image directly, sidestepping OCR's reading-order and table-reconstruction failures at the source.",
      "**Only if text output is genuinely required, pick a tier by complexity:** traditional OCR ($0.001-0.01/page) is cheap but collapses on multi-column/tables/handwriting (accuracy can fall well below 70%).",
      "**Vision LLMs handle nearly any layout** ($0.05-0.30/page, meaningfully more) but carry rate limits, a small hallucination risk, and no structured output without prompting.",
      "**Hybrid routes by OCR confidence score** — traditional everywhere, vision-LLM fallback below threshold — buying most of the accuracy at a fraction of full vision-LLM cost, at the price of a second system to maintain.",
    ],
    recap: [
      "**Garbled OCR → confident hallucination** — the LLM can't tell good text from bad.",
      "**Diagnose before choosing a tier:** text layer already exists? Pure Q&A on a scan? Both skip OCR entirely.",
      "**Traditional OCR is cheap but breaks on complex layouts** — vision LLMs handle more, at real cost.",
      "**Hybrid: OCR everywhere, vision LLM only below a confidence threshold.**",
    ],
  },

  "alignment-techniques": {
    keyPoints: [
      "**Alignment is a weight-level change** — RLHF shifts the output distribution toward helpful/honest/harmless, but its reward model, PPO instability, and reward-hacking risk motivated successors.",
      "**DPO reformulates RLHF as supervised learning on preference pairs** — raise the log-prob of the preferred response, lower the rejected, with a KL term limiting drift; no reward model, no RL loop.",
      "**DPO's win is operational simplicity, not data efficiency** — comparable quality, standard SFT tooling (TRL/Axolotl), works at all model sizes, but still needs human preference labels.",
      "**Constitutional AI attacks the annotation bottleneck** — a written constitution + RLAIF self-critique generates preference data synthetically.",
      "**CAI's quality depends on the self-critiquing model** — it works best when the base model is already capable enough to produce meaningful critiques.",
      "**For a Llama 3 checkpoint with no RL infra, DPO is the start** — 500-2,000 preference pairs make safe refusal the default across all future contexts; add CAI only if annotation cost becomes prohibitive.",
    ],
    recap: [
      "**Alignment = weight-level change** — RLHF works but is operationally heavy.",
      "**DPO = supervised learning on preference pairs** — no reward model, no PPO, comparable quality.",
      "**CAI = constitution + self-critique**, removing human labeling — gated on base-model capability.",
      "**No RL infra → DPO first**; CAI only once annotation cost forces it.",
    ],
  },

  "red-teaming": {
    keyPoints: [
      "**Red-teaming is adversarial testing, not QA or benchmarks** — QA tests expected behavior, benchmarks test a known dataset; red-teaming hunts novel failures through adversarial creativity.",
      "**It covers what alignment's training distribution misses** — novel harmful framings that DPO/RLHF never saw.",
      "**Cover the attack categories** — direct injection, persona adoption, hypothetical framing, multi-turn escalation, indirect injection, and edge cases (non-English, odd encodings, very long inputs).",
      "**Multi-turn escalation is a distinct failure** — safety respected at turn 1 can erode by turn 8 because alignment is trained mostly on single turns.",
      "**Run a structured process** — days 1-3 build a domain-specific taxonomy, days 4-10 sweep 20-30 prompts/category logging pass/fail, days 11-14 produce a risk-ranked findings report.",
      "**You don't need an external firm for the initial exercise** — you need structured process; external teams help later with accumulated blind spots.",
    ],
    recap: [
      "**Red-teaming finds novel failures** — distinct from QA and benchmarks.",
      "**Systematic attack taxonomy** beats ad-hoc 'tricky prompts.'",
      "**Multi-turn escalation slips past single-turn safety training.**",
      "**Structured internal process suffices to start** — external teams add value later.",
    ],
  },

  "jailbreak-taxonomy": {
    keyPoints: [
      "**Alignment is distributional learning, not a logical constraint** — it teaches refusal of specific patterns, so novel framings outside that distribution bypass it.",
      "**Persona adoption (DAN-style) hijacks role-play** — the model simulates a described entity including its stated lack of restrictions; alignment underrepresented 'persona defined as unrestricted' as an attack.",
      "**Know the categories** — persona adoption, hypothetical framing, instruction override, privilege escalation (unverifiable authority), and gradual multi-turn escalation.",
      "**Patching one DAN prompt is insufficient** — it leaves the rest of the untrained distribution open; you need a systematic, taxonomy-based defense.",
      "**No single layer suffices** — input classification catches known patterns but misses novel framings; system-prompt hardening helps but isn't enough alone; add output classification.",
      "**Close the loop** — feed new production jailbreaks back as adversarial examples to update classifiers; the standard is layered defenses plus continuous monitoring.",
    ],
    recap: [
      "**Jailbreaks exploit distributional gaps** — alignment isn't a hard rule.",
      "**Persona/DAN attacks ride legitimate role-play capability.**",
      "**Patching one prompt doesn't generalize** — build from a taxonomy.",
      "**Layer input + output classifiers, harden prompts, and update continuously.**",
    ],
  },
};
