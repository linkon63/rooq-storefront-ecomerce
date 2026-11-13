"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { CatmullRomCurve3, Color, type Group, type Mesh, type MeshStandardMaterial, Vector3 } from "three";
import { journeyAt } from "@/utils/storefront/journey";

const INK = new Color("#1c3934");
const CHALK = new Color("#f3efe7");
const DYE = new Color("#9b1a41");
const KRAFT = new Color("#c8a06a");

type JourneyTrackProps = { steps: number; progress: RefObject<number> };

/** The road, one pad per step, and the parcel travelling along it. */
export function JourneyTrack({ steps, progress }: JourneyTrackProps) {
  const parcel = useRef<Group>(null);
  const pads = useRef<(Mesh | null)[]>([]);

  const curve = useMemo(
    () =>
      new CatmullRomCurve3(
        [new Vector3(-5.2, 0, 0.6), new Vector3(-2.6, 0, -0.7), new Vector3(0, 0, 0.5), new Vector3(2.6, 0, -0.6), new Vector3(5.2, 0, 0.4)],
        false,
        "centripetal",
      ),
    [],
  );
  const stations = useMemo(() => Array.from({ length: steps }, (_, i) => curve.getPointAt(i / Math.max(1, steps - 1))), [curve, steps]);

  useFrame((state) => {
    const { along, active } = journeyAt(progress.current ?? 0, steps);
    const point = curve.getPointAt(along);
    const ahead = curve.getPointAt(Math.min(1, along + 0.001));
    if (parcel.current) {
      parcel.current.position.set(point.x, 0.38 + Math.abs(Math.sin(state.clock.elapsedTime * 6)) * 0.06, point.z);
      parcel.current.lookAt(ahead.x, parcel.current.position.y, ahead.z);
    }
    pads.current.forEach((pad, index) => {
      if (!pad) return;
      const material = pad.material as MeshStandardMaterial;
      material.color.lerp(index <= active ? DYE : CHALK, 0.12);
      const lift = index === active ? 0.08 : 0;
      pad.position.y += (lift - pad.position.y) * 0.12;
    });
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 160, 0.05, 8, false]} />
        <meshStandardMaterial color={CHALK} transparent opacity={0.35} />
      </mesh>
      {stations.map((station, index) => (
        <mesh key={index} ref={(node) => { pads.current[index] = node; }} position={[station.x, 0, station.z]}>
          <cylinderGeometry args={[0.42, 0.42, 0.12, 40]} />
          <meshStandardMaterial color={CHALK} roughness={0.6} />
        </mesh>
      ))}
      <group ref={parcel}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.42, 0.42]} />
          <meshStandardMaterial color={KRAFT} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.215, 0]}>
          <boxGeometry args={[0.52, 0.02, 0.1]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </group>
    </group>
  );
}
