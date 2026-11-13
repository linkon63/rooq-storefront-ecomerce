"use client";

import { ORDER_JOURNEY_STEPS } from "@/lib/constants/storefront";
import { SceneAccepted } from "./scenes/scene-accepted";
import { SceneDelivery } from "./scenes/scene-delivery";
import { ScenePacked } from "./scenes/scene-packed";
import { ScenePaid } from "./scenes/scene-paid";
import { ScenePlaced } from "./scenes/scene-placed";
import type { SceneProps } from "./scenes/scene-props";
import { SceneReceived } from "./scenes/scene-received";

type JourneyStageProps = SceneProps & { active: number };

function Scene({ index, ...props }: SceneProps & { index: number }) {
  switch (index) {
    case 1:
      return <SceneAccepted {...props} />;
    case 2:
      return <ScenePacked {...props} />;
    case 3:
      return <SceneDelivery {...props} />;
    case 4:
      return <SceneReceived {...props} />;
    case 5:
      return <ScenePaid {...props} />;
    default:
      return <ScenePlaced {...props} />;
  }
}

/**
 * The illustrated moment for the current step, filling its box. Each scene
 * plays as it appears; clicking the scene's highlighted object moves on.
 */
export function JourneyStage({ active, ...props }: JourneyStageProps) {
  const step = ORDER_JOURNEY_STEPS[active] ?? ORDER_JOURNEY_STEPS[0];
  return <Scene key={step.key} index={active} {...props} />;
}
