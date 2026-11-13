"use client";

import { JOURNEY_COLORS as C } from "../journey-colors";
import { Arm, Counter, Hotspot, Person } from "./figure";
import { SceneSvg } from "./scene-svg";
import type { SceneProps } from "./scene-props";
import { pulse, useSceneMotion } from "./use-scene-motion";

/** Our team calls the shopper to confirm the order; she says yes and it is accepted. */
export function SceneAccepted({ animate, wide, onAction }: SceneProps) {
  const scope = useSceneMotion((q, intro, loop) => {
    intro
      .from(q(".s2-agent"), { x: -30, opacity: 0 })
      .from(q(".s2-shopper"), { x: 30, opacity: 0 }, "<")
      .from(q(".s2-b1"), { scale: 0.5, opacity: 0, transformOrigin: "0% 100%", ease: "back.out(2)" }, "+=0.2")
      .from(q(".s2-b2"), { scale: 0.5, opacity: 0, transformOrigin: "100% 100%", ease: "back.out(2)" }, "+=0.5")
      .from(q(".s2-check"), { scale: 0, rotation: -90, transformOrigin: "50% 50%", ease: "back.out(2.4)", duration: 0.7 }, "+=0.2");
    loop
      .fromTo(q(".s2-wave"), { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.2, yoyo: true, repeat: 1, immediateRender: false }, 0)
      .to(q(".s2-typing"), { y: -3, duration: 0.15, stagger: 0.1, yoyo: true, repeat: 3 }, 0);
    pulse(loop, q(".s2-hot"), 0);
  }, animate);

  return (
    <SceneSvg ref={scope} wide={wide}>
      <rect x={-800} y={-100} width={1040} height={560} fill={C.selvedge} />
      <g className="s2-agent">
        <Person x={120} y={176} skin={C.skinDeep} top={C.ink} hair="bun" headset>
          <Arm className="s2-typing" d="M-44 26 Q-56 84 -20 92" hand={[-20, 92]} sleeve={C.ink} skin={C.skinDeep} />
          <Arm className="s2-typing" d="M44 26 Q56 84 20 92" hand={[20, 92]} sleeve={C.ink} skin={C.skinDeep} />
        </Person>
        <path d="M62 268 L80 222 L160 222 L178 268 Z" fill={C.inkSoft} />
        <circle cx={120} cy={244} r={5} fill={C.gold} />
      </g>
      <g className="s2-shopper">
        <Person x={368} y={176} skin={C.skinWarm} top={C.gold} hair="long" saree>
          <Arm d="M-44 26 Q-74 40 -32 -24" hand={[-32, -24]} sleeve={C.gold} skin={C.skinWarm} />
          <rect x={-44} y={-60} width={15} height={32} rx={4} fill={C.ink} transform="rotate(-14 -36 -44)" />
        </Person>
      </g>
      <Counter />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          className="s2-wave"
          d={`M${222 + i * 12} ${150 - i * 10} Q${240 + i * 12} 170 ${222 + i * 12} ${190 + i * 10}`}
          stroke={C.dye}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={animate ? 0 : 1}
        />
      ))}
      <g className="s2-b1">
        <rect x={132} y={40} width={162} height={44} rx={14} fill={C.chalk} />
        <path d="M150 84 L146 98 L166 84 Z" fill={C.chalk} />
        <text x={213} y={67} textAnchor="middle" fontSize={13} fill={C.ink}>
          Shall we send your saree?
        </text>
      </g>
      <g className="s2-b2">
        <rect x={286} y={20} width={120} height={40} rx={14} fill={C.dye} />
        <path d="M380 60 L392 74 L370 60 Z" fill={C.dye} />
        <text x={346} y={45} textAnchor="middle" fontSize={13} fill={C.chalk}>
          Yes, please!
        </text>
      </g>
      <g className="s2-check cursor-pointer" onClick={onAction}>
        <Hotspot cx={244} cy={300} r={28} className="s2-hot" />
        <circle cx={244} cy={300} r={24} fill={C.dye} />
        <path d="M233 300 l8 8 l14 -16" stroke={C.chalk} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </SceneSvg>
  );
}
