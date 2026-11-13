"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";
import { ClothMesh } from "./cloth-mesh";

/**
 * The hero's one orchestrated moment: a length of deep-green twill with a magenta
 * lining, drifting in a slow draught. Loaded with next/dynamic (ssr: false)
 * only when motion is allowed; `active` pauses the loop when off screen.
 */
type ClothSceneProps = {
  active: boolean;
  /** Hero scroll progress, 0 → 1, written by GSAP ScrollTrigger. */
  progress: RefObject<number>;
  onReady: () => void;
};

export default function ClothScene({ active, progress, onReady }: ClothSceneProps) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={onReady}
      aria-hidden
    >
      <ClothMesh progress={progress} />
    </Canvas>
  );
}
