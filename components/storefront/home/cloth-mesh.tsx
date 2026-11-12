"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, type Mesh, type ShaderMaterial, Vector2, Vector3 } from "three";
import { CLOTH_COLORS, CLOTH_FRAGMENT, CLOTH_VERTEX } from "./cloth-shader";

/** The draped plane; time and a lagging pointer drive the vertex shader. */
export function ClothMesh() {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const pointer = useRef(new Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uFace: { value: new Vector3(...CLOTH_COLORS.face) },
      uFaceLight: { value: new Vector3(...CLOTH_COLORS.faceLight) },
      uLining: { value: new Vector3(...CLOTH_COLORS.lining) },
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!material.current || !mesh.current) return;
    const u = material.current.uniforms;
    u.uTime.value += Math.min(delta, 0.05);
    pointer.current.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5);
    (u.uPointer.value as Vector2).lerp(pointer.current, 0.04);
    mesh.current.rotation.y = Math.sin(u.uTime.value * 0.15) * 0.35 - 0.25;
  });

  return (
    <mesh ref={mesh} rotation={[-0.12, -0.25, 0.08]} position={[0.4, 0.1, 0]}>
      <planeGeometry args={[3.2, 4.2, 96, 128]} />
      <shaderMaterial
        ref={material}
        vertexShader={CLOTH_VERTEX}
        fragmentShader={CLOTH_FRAGMENT}
        uniforms={uniforms}
        side={DoubleSide}
      />
    </mesh>
  );
}
