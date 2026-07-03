// Generic L2 case-chain renderer (domain-agnostic).
// Pass a `domain` prop ("retrieval" | "agents" | "eval" | "production" | "foundations")
// and it renders that domain's chains via getCaseChains(domain).
//
// The implementation lives in RetrievalCaseChains.jsx (built in the P0.2 pilot and
// already domain-generic — it takes a `domain` prop and reads getCaseChains). It is
// re-exported here under the generic name so every hub imports the same component
// rather than one named after the pilot domain.
export { default } from "./RetrievalCaseChains";
