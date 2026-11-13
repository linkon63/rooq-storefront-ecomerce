"use client";

import { Canvas } from "@react-three/fiber";
import { ClothMesh } from "./cloth-mesh";

/**
 * The hero's one orchestrated moment: a length of deep-green twill with a magenta
 * lining, drifting in a slow draught. Loaded with next/dynamic (ssr: false)
 * only when motion is allowed; `active` pauses the loop when off screen.
 */
export default function ClothScene({ active, onReady }: { active: boolean; onReady: () => void }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={onReady}
      aria-hidden
    >
      <ClothMesh />
    </Canvas>
  );
}
