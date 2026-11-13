"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";
import { JourneyTrack } from "./journey-track";

type JourneySceneProps = { steps: number; progress: RefObject<number>; active: boolean; onReady: () => void };

/** three.js stage for the order journey. Loaded with next/dynamic (ssr: false); paused off screen. */
export default function JourneyScene({ steps, progress, active, onReady }: JourneySceneProps) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 5.2, 7.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0, 0);
        onReady();
      }}
      aria-hidden
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 5]} intensity={1.6} />
      <JourneyTrack steps={steps} progress={progress} />
    </Canvas>
  );
}
