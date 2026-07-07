// foundationScenes.jsx — registry that lets FoundationsRunner interleave interactive scenes
// INSIDE a module's explanation flow (3B1B-STANDARD.md: text–scene lock, scenes sit WITH the
// prose beats, not in a separate block). Opt-in per module: an explanation[] item of shape
// { type: "scene", sceneId: "<id>" } renders FOUNDATION_SCENES["<moduleId>/<id>"] at that spot.
// Unknown ids no-op (and the SEO prerender skips scene items entirely — prose must stand alone).

import { useMemo } from "react";
import {
  SceneBlendTrap,
  SceneHighway,
  SceneStampTest,
  SceneMask,
  TokenJourney,
} from "./TransformerScenes.jsx";
import { runTransformer, TRANSFORMER_SENTENCES } from "../../utils/tinyTransformer.js";

// Standalone journey for the reading flow: fixed example (sentence 0, 2 heads, T=1.0) so it
// needs no wiring; the full journey with live controls renders again in Hands-On below.
function TokenJourneyStandalone() {
  const result = useMemo(() => runTransformer(0, 2, 1.0), []);
  return <TokenJourney result={result} tokens={TRANSFORMER_SENTENCES[0].tokens} />;
}

export const FOUNDATION_SCENES = {
  "transformer/trap": SceneBlendTrap,
  "transformer/journey": TokenJourneyStandalone,
  "transformer/stamp": SceneStampTest,
  "transformer/highway": SceneHighway,
  "transformer/mask": SceneMask,
};
