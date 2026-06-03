const fs = require('fs');
const path = require('path');

const CATEGORY_MAP = {
  rag:"retrieval", retrieval:"retrieval",
  agents:"agents", "mcp-protocol":"agents", safety:"agents",
  evaluation:"evaluation",
  llmops:"production", production:"production", "production-mlops":"production",
  "paper-to-production":"production", "data-flywheel":"production",
  foundations:"foundations", research:"foundations", finetuning:"foundations",
  multimodal:"foundations", "reasoning-inference":"foundations",
  "model-deep-dive":"foundations", "training-stack":"foundations",
  prompting:"foundations", training:"foundations", architecture:"foundations",
  frontier:"foundations", models:"foundations", sysdesign:"foundations",
  product:"general", interview:"general", industry:"general",
  career:"general", strategy:"general", perspectives:"general", "how-i-build":"general",
};

const ID_OVERRIDES = {
  "stale-document-failure":"retrieval", "multihop-reasoning-failure":"retrieval",
  "context-overflow-failure":"retrieval", "retrieval-poisoning":"retrieval",
  "reranker-inversion":"retrieval",
  "tool-loop-failure":"agents", "prompt-injection-bypass":"agents", "cascade-failure":"agents",
  "context-bleed-failure":"production", "incident-room":"production",
  "latency-planner":"production", "cost-explosion-incident":"production",
  "cold-start-latency":"production", "schema-drift-failure":"production",
  "silent-hallucination":"evaluation", "eval-gaming":"evaluation", "confidence-calibration":"evaluation",
};

const filePath = path.join(__dirname, '../src/groundTruthIndex.js');
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('challengeArea:')) {
  console.log('Already tagged'); process.exit(1);
}

let tagged = 0;
let unmatched = [];

content = content.replace(/(\{ id: "([^"]+)", category: "([^"]+)")/g, (match, prefix, id, cat) => {
  let area = ID_OVERRIDES[id] || CATEGORY_MAP[cat];
  if (!area) { unmatched.push({ id, cat }); area = "general"; }
  tagged++;
  return prefix + ', challengeArea: "' + area + '"';
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Tagged:', tagged, 'posts');
if (unmatched.length) console.log('Unmatched (→general):', JSON.stringify(unmatched));
