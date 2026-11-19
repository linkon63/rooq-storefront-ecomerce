"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { DoubleSide, MathUtils, type Mesh, type ShaderMaterial } from "three";
import { SAREE_FRAGMENT, SAREE_VERTEX } from "./saree-shader";
import { createSareeTexture } from "./saree-texture";

const LENGTH = 6;
const WIDTH = 2.2;
/** Scene width the saree needs, so it is scaled down on narrow screens. */
const FIT_WIDTH = 7.2;

type SareeProps = { progress: RefObject<number>; animate: boolean };

function Saree({ progress, animate }: SareeProps) {
  const mesh = useRef<Mesh>(null);
  const gl = useThree((state) => state.gl);
  const viewport = useThree((state) => state.viewport);
  const texture = useMemo(() => createSareeTexture(gl.capabilities.getMaxAnisotropy()), [gl]);
  const uniforms = useMemo(
    () => ({ uMap: { value: texture }, uOpen: { value: animate ? 0 : 1 }, uTime: { value: 0 }, uLength: { value: LENGTH } }),
    [texture, animate],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const current = mesh.current;
    if (!current || !animate) return;
    const material = current.material as ShaderMaterial;
    const open = material.uniforms.uOpen;
    const time = material.uniforms.uTime;
    if (open) open.value = MathUtils.damp(open.value, progress.current ?? 0, 3.5, delta);
    if (time) time.value += delta;
    current.rotation.y = MathUtils.damp(current.rotation.y, -0.32 + state.pointer.x * 0.16, 2.5, delta);
    current.rotation.x = MathUtils.damp(current.rotation.x, -0.3 - state.pointer.y * 0.08, 2.5, delta);
  });

  const scale = Math.min(1, viewport.width / FIT_WIDTH);
  return (
    <mesh ref={mesh} rotation={[-0.3, -0.32, 0.05]} scale={scale}>
      <planeGeometry args={[LENGTH, WIDTH, 220, 48]} />
      <shaderMaterial vertexShader={SAREE_VERTEX} fragmentShader={SAREE_FRAGMENT} uniforms={uniforms} side={DoubleSide} />
    </mesh>
  );
}

type SareeCanvasProps = SareeProps & { running: boolean; onReady: () => void };

/**
 * The three.js stage. Loaded on demand (dynamic import) so three never sits
 * in the page bundle; it renders only while on screen, and once (still,
 * fully open) for reduced motion.
 */
export default function SareeCanvas({ progress, animate, running, onReady }: SareeCanvasProps) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={animate ? (running ? "always" : "never") : "demand"}
      camera={{ position: [0, 0, 5.2], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={onReady}
    >
      <Saree progress={progress} animate={animate} />
    </Canvas>
  );
}
