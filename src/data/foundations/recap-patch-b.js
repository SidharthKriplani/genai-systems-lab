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
      "**Zero-shot = describe-and-go**, powered by instruction-following; the baseline is a signal.",
      "**Errors concentrate at ambiguous boundaries** where no rule resolves overlapping categories.",
      "**More prose hurts; examples help** — length is not the lever.",
      "**Run zero-shot first, curate few-shot from its failures** — they are layered, not competing.",
    ],
  },

  "few-shot": {
    keyPoints: [
      "**Few-shot resolves boundary cases by demonstration** — the cases zero-shot instructions leave underspecified.",
      "**In-context learning is distribution-sensitive** — the model learns the task *and* the answer distribution from your examples; 8 billing + 1-each-other teaches 'billing is expected.'",
      "**Category imbalance biases predictions** — balance coverage across categories, or deliberately weight toward the most-confused pairs.",
      "**Unrepresentative (easy) examples fail at the boundary** — include the hard cases: the API-billing question, the auth error that looks like an account issue.",
      "**Recency bias skews the prior** — the last examples before the input dominate; don't cluster all boundary cases at the end.",
      "**Dynamic few-shot beats a static set** — retrieve the most similar labeled examples at inference so they're naturally balanced to the query (needs a labeled store + fast retrieval).",
    ],
    recap: [
      "**Examples are a task spec, not decoration** — bad ones actively distort output.",
      "**Imbalance, unrepresentativeness, and recency** are the three failure modes.",
      "**Balance categories, include hard cases, watch ordering.**",
      "**Retrieve similar labeled examples per query** for production classifiers — inherently balanced.",
    ],
  },

  "chain-of-thought": {
    keyPoints: [
      "**A 62% baseline means capability without execution** — the model can do it but a direct answer is one unconstrained token stream, so step-2 errors compound.",
      "**CoT routes generation through derivation patterns** — each correct step raises the conditional probability of the next correct step, matching millions of worked derivations from pre-training.",
      "**It adds no new capability** — it structures generation; it is not the model 'checking' its work.",
      "**Zero-shot CoT is the right start** — 'show your work before the final number' needs no examples and closes most of the gap.",
      "**Few-shot CoT gives format guidance** — full worked traces for domain-specific calculation style.",
      "**Self-consistency = majority vote over independent chains** — most robust for high-stakes math where one chain error is costly, at the cost of multiple inference calls.",
    ],
    recap: [
      "**Direct answers have no structural consistency constraint**; multi-step errors compound.",
      "**CoT conditions each step on prior correct steps**, following learned derivation patterns.",
      "**Start with zero-shot CoT**; add few-shot for format.",
      "**Add self-consistency (majority vote) when a single chain error carries real cost.**",
    ],
  },

  "system-prompts": {
    keyPoints: [
      "**A system prompt is text, not a rule engine** — the model processes it with the same attention as any input; its influence is probabilistic, not deterministic.",
      "**It can reliably shift defaults** — persona, scope, format, and enumerated refusal categories across the typical input distribution.",
      "**It cannot override weight-level safety, resist sustained adversarial pressure, or guarantee format on every output.**",
      "**Over-refusal is a scope-definition problem** — broad constraint language catches legitimate boundary queries.",
      "**Define scope by inclusion, not exclusion** — 'answer X; for anything else do Y' beats 'don't answer Z' because it tells the model what to do with out-of-scope input.",
      "**Length is not the fix** — a poorly structured 2,000-word prompt dilutes attention; buried constraints get less weight. Make every constraint testable.",
    ],
    recap: [
      "**System prompts steer distributions probabilistically** — not hard rules.",
      "**Over-refusal = broad scope**, fixed by inclusion-based scope, not more words.",
      "**Bloated prompts dilute attention** — buried constraints weaken.",
      "**For adversarial resistance, pair prompt hardening with input/output classifiers.**",
    ],
  },

  "structured-outputs": {
    keyPoints: [
      "**JSON is not a native output mode** — the model has no parser or validator; it emits tokens that happen to form JSON when it works, and truncates or mis-nests when it fails.",
      "**Prompting for JSON gets ~85-92% compliance** — adequate only for low-stakes pipelines with retry logic.",
      "**JSON mode forces valid *syntax* but not *schema*** — you still get hallucinated fields, missing required fields, and wrong types.",
      "**Schema-enforced structured outputs use grammar-constrained decoding** — the sampler is restricted to tokens that keep output schema-valid at every step; it *cannot* omit a required field or misplace a comma.",
      "**Forced schemas can't express uncertainty** — the model must emit a typed value even when the truth is unknown, so gaps get coerced into plausible-looking values.",
      "**Add a per-field confidence field** — route low-confidence extractions to human review without blocking the automated path.",
    ],
    recap: [
      "**JSON emerges from token prediction** — no structural awareness during generation.",
      "**JSON mode fixes syntax, not schema** — fields/types still drift.",
      "**Grammar-constrained decoding makes invalid output impossible** — the production fix.",
      "**It also forces values for unknowns** — add a confidence field to catch them.",
    ],
  },

  "prompt-security": {
    keyPoints: [
      "**Prompt injection targets the app architecture, not the model's alignment** — the LLM can't distinguish trusted app instructions from untrusted input when both arrive as text.",
      "**Direct injection** overrides system instructions via user input; **indirect injection** (embedded in retrieved documents) is more dangerous and survives input sanitization.",
      "**Naive defenses fail** — keyword blocking is paraphrased around, and 'never follow injections' uses the same in-band text channel as the attack.",
      "**The correct defense is privilege separation** — the LLM returns a structured *proposal*; the application validates it against allowlists before executing.",
      "**LLM proposes, application disposes** — even if the attacker gets the model to propose sending to external@attacker.com, allowlist validation rejects it.",
      "**Supplement with input/output classifiers**, but the architecture matters more because it removes the LLM from the authorization path entirely.",
    ],
    recap: [
      "**The model weighs all in-band text equally** — trusted and untrusted alike.",
      "**Indirect injection via retrieved content** dodges input sanitization.",
      "**In-band defensive instructions lose** to in-band attacks.",
      "**Privilege separation — propose then validate — removes the LLM from the auth path.**",
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
      "**pgvector's superpower is the relational JOIN pre-filter** in one query.",
      "**Dedicated DBs win on pure ANN at scale** via in-memory horizontal sharding.",
      "**~10M vectors is the crossover** where pgvector latency degrades.",
      "**Default to pgvector, migrate at the ceiling** — and budget the instance contention 'free' hides.",
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
      "**Switching models silently invalidates every stored vector** — spaces don't align.",
      "**Dual-write keeps reads on the old index** while the new one fills.",
      "**Backfill fully before querying the new index** — partial coverage = low recall.",
      "**Cutover atomically, keep the old index warm, then delete.**",
    ],
  },

  "vision-language-arch": {
    keyPoints: [
      "**VLMs bridge RAG's blindness to images** — a visual encoder feeds a language-model backbone.",
      "**The pipeline: patches → ViT → projection → prepend** — the image splits into ~14×14 patches, a ViT emits one visual token per patch, a projection layer maps them into the LM's embedding space, and they're prepended to the text tokens.",
      "**The visual encoder's training distribution sets the ceiling** — CLIP-style natural-image pretraining underrepresents unusual fonts, dense tables, and low-DPI scans, so those fail more.",
      "**Resolution sensitivity** — a fixed patch size means low-DPI scans lose per-character detail; use ≥200 DPI for reliable character extraction.",
      "**Spatial layout is fragile** — models trained on natural images may not hold invoice row-column relationships.",
      "**Numeric hallucination** — on ambiguous OCR the model emits a plausible number from its prior; validate every numeric against business rules (do line items sum to total?).",
    ],
    recap: [
      "**Image → patches → ViT tokens → projection → prepend to text** is the VLM path.",
      "**Encoder training coverage decides document accuracy** — general VLMs weaken on dense/low-DPI docs.",
      "**Low DPI blurs digits within a patch** — use ≥200 DPI.",
      "**Numbers can be hallucinated** — validate every extracted figure against business rules.",
    ],
  },

  "multimodal-rag": {
    keyPoints: [
      "**VLMs can interpret images but not retrieve them** — figures and tables have no text embedding to match a query, so text-only RAG is blind to ~20-30% of paper content.",
      "**Figure captioning is the low-friction entry point** — caption each figure with a VLM at index time, embed the caption, then pass both caption and original image to the generator.",
      "**Caption quality is the retrieval-quality ceiling** — vague captions retrieve the right figure but lack the values to answer; prompt captioners to enumerate all axis values, labels, and key data points.",
      "**Tables break semantic chunking** — whitespace-aligned PDF text loses structure.",
      "**Extract tables structurally (Camelot/pdfplumber/Textract) and embed as serialized JSON** — this preserves headers/rows and enables exact value lookup, which a prose caption loses.",
      "**Evaluate retrieval per modality** — text vs figure vs table misses are different problems with different fixes.",
    ],
    recap: [
      "**Non-text content isn't retrievable without a text handle** — captions or structured extraction.",
      "**Caption fidelity caps figure answers** — enumerate values, not just structure.",
      "**Tables → structured JSON**, not captions, to keep exact lookups.",
      "**Score modalities separately** to see which one is underperforming.",
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
      "**Tokens scale with area** — 4× linear = 16× tokens = ~16× cost.",
      "**Dropping 2048→512 can cut the bill ~16×** at the same rate.",
      "**Simple attributes rarely need full resolution** — validate on a labeled sample first.",
      "**Route only complex images to high-res** with a cheap classifier.",
    ],
  },

  "ocr-pipeline-design": {
    keyPoints: [
      "**OCR is the silent failure point of document AI** — a bad parse yields confident LLM hallucinations with no error signal.",
      "**The first diagnostic: scan or programmatic PDF?** — if the PDF has selectable text, extract it directly (PyMuPDF/pdfplumber): 100% accurate, near-zero cost, no OCR.",
      "**Traditional OCR (Tesseract/Textract/Document AI) is cheap** ($0.001-0.01/page) but collapses on multi-column layouts, tables, rotated/handwritten text — accuracy can fall below 50%.",
      "**Vision LLMs handle any layout** (85-95% on complex docs) but cost 10-100× more and carry a small non-zero fabrication risk.",
      "**Hybrid routes by confidence** — run traditional OCR everywhere; send pages below a confidence threshold (e.g., Textract block confidence) to a vision LLM.",
      "**Blended cost ≈ 5-15× traditional** — most simple pages take the cheap path; only hard pages hit the vision LLM.",
    ],
    recap: [
      "**Garbled OCR = confident hallucination** — the LLM can't tell good text from bad.",
      "**Programmatic PDF? Extract directly** — free and exact, skip OCR.",
      "**Traditional OCR is cheap but breaks on complex layouts** below ~50%.",
      "**Hybrid: OCR everywhere, vision LLM only for low-confidence pages** — ~5-15× cost.",
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
      "**Alignment needs weight change** — RLHF works but is operationally heavy.",
      "**DPO = supervised learning on preference pairs** — no reward model, no PPO, comparable quality.",
      "**CAI removes human labeling via constitution + self-critique**, gated on base-model capability.",
      "**No RL infra? DPO first**, CAI only when annotation cost forces it.",
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
