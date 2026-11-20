"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, DoubleSide, MathUtils, type Mesh, type Points, type ShaderMaterial } from "three";

const CLOTH_VERTEX = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Unfurl twist + flowing drape wave driven by scroll progress
    float wave1 = sin(pos.x * 1.4 - uTime * 1.1 + uProgress * 6.2831) * 0.28;
    float wave2 = cos(pos.y * 2.2 + uTime * 0.8 + uProgress * 3.1415) * 0.14;
    float twist = (pos.x * 0.32) * (1.0 - uProgress * 0.65);

    float c = cos(twist);
    float s = sin(twist);
    vec2 rotated = vec2(pos.y * c - pos.z * s, pos.y * s + pos.z * c);
    pos.y = rotated.x;
    pos.z = rotated.y + wave1 + wave2;

    vWave = wave1 + wave2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const CLOTH_FRAGMENT = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec3 ink = vec3(0.110, 0.224, 0.204);      // #1c3934
    vec3 dye = vec3(0.608, 0.102, 0.255);      // #9b1a41
    vec3 gold = vec3(0.820, 0.690, 0.447);     // #d1b072
    vec3 selvedge = vec3(0.941, 0.875, 0.776); // #f0dfc6

    // Woven warp & weft micro-texture
    float warp = sin(vUv.x * 260.0) * 0.5 + 0.5;
    float weft = sin(vUv.y * 140.0) * 0.5 + 0.5;
    float weave = mix(0.88, 1.06, warp * 0.5 + weft * 0.5);

    // Base cloth shifts from deep ink to rich magenta dye as scroll progresses
    vec3 body = mix(ink, dye, smoothstep(0.15, 0.85, uProgress + vUv.x * 0.25 - 0.12));

    // Traditional tant zari borders along top & bottom selvedge
    float borderMask = smoothstep(0.08, 0.095, vUv.y) * (1.0 - smoothstep(0.905, 0.92, vUv.y));
    float innerLine = step(0.11, vUv.y) * (1.0 - step(0.125, vUv.y)) + step(0.875, vUv.y) * (1.0 - step(0.89, vUv.y));
    vec3 color = mix(gold, body, borderMask);
    color = mix(color, selvedge, innerLine * 0.85);

    // Subtle woven motifs along the center
    float motif = smoothstep(0.82, 0.96, sin(vUv.x * 28.0) * cos(vUv.y * 18.0));
    color = mix(color, gold, motif * 0.35 * borderMask);

    // Silk highlight from wave curvature
    float sheen = clamp(vWave * 0.55 + 0.5, 0.0, 1.0);
    color = color * weave + gold * pow(sheen, 3.0) * 0.16;

    gl_FragColor = vec4(color, 0.96);
  }
`;

function WovenCloth({ progress, animate }: { progress: RefObject<number>; animate: boolean }) {
  const mesh = useRef<Mesh>(null);
  const particles = useRef<Points>(null);
  const viewport = useThree((state) => state.viewport);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  const particleGeometry = useMemo(() => {
    const count = 90;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = i * 0.45;
      positions[i * 3] = ((i / count) - 0.5) * 5.2;
      positions[i * 3 + 1] = Math.sin(angle) * 1.15;
      positions[i * 3 + 2] = Math.cos(angle) * 0.8;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useEffect(() => () => particleGeometry.dispose(), [particleGeometry]);

  useFrame((state, delta) => {
    const target = progress.current ?? 0;
    const mat = mesh.current?.material as ShaderMaterial | undefined;
    if (mat?.uniforms.uProgress && mat.uniforms.uTime) {
      mat.uniforms.uProgress.value = MathUtils.damp(mat.uniforms.uProgress.value, target, 4, delta);
      if (animate) mat.uniforms.uTime.value += delta;
    }

    if (mesh.current && animate) {
      mesh.current.rotation.y = MathUtils.damp(
        mesh.current.rotation.y,
        -0.25 + target * 0.75 + state.pointer.x * 0.2,
        3,
        delta,
      );
      mesh.current.rotation.x = MathUtils.damp(
        mesh.current.rotation.x,
        0.18 - target * 0.35 - state.pointer.y * 0.12,
        3,
        delta,
      );
    }

    if (particles.current && animate) {
      particles.current.rotation.z += delta * 0.08;
      particles.current.rotation.y = MathUtils.damp(particles.current.rotation.y, target * 0.6, 2.5, delta);
    }
  });

  const scale = Math.min(1, viewport.width / 6.2);

  return (
    <group scale={scale}>
      <mesh ref={mesh} rotation={[0.18, -0.25, 0.08]}>
        <planeGeometry args={[5.2, 2.1, 140, 36]} />
        <shaderMaterial
          vertexShader={CLOTH_VERTEX}
          fragmentShader={CLOTH_FRAGMENT}
          uniforms={uniforms}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <points ref={particles} geometry={particleGeometry}>
        <pointsMaterial size={0.045} color="#d1b072" transparent opacity={0.65} blending={AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
}

export default function AboutLoomCanvas({
  progress,
  animate,
}: {
  progress: RefObject<number>;
  animate: boolean;
}) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.4], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <WovenCloth progress={progress} animate={animate} />
    </Canvas>
  );
}

