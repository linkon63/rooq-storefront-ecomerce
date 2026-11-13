"use client";

import { JOURNEY_COLORS as C } from "../journey-colors";
import { Arm, Hotspot, Person } from "./figure";
import { SceneSvg } from "./scene-svg";
import type { SceneProps } from "./scene-props";
import { pulse, useSceneMotion } from "./use-scene-motion";

/** The shopper pays the courier in cash or on her phone; the order is stamped paid. */
export function ScenePaid({ animate, wide, onAction }: SceneProps) {
  const scope = useSceneMotion((q, intro, loop) => {
    intro
      .from(q(".s6-people"), { y: 20, opacity: 0 })
      .from(q(".s6-note"), { x: 0, opacity: 0, duration: 0.2 })
      .to(q(".s6-note"), { x: -96, y: -6, rotation: -8, svgOrigin: "300 236", duration: 1, ease: "power2.inOut" })
      .from(q(".s6-screen"), { opacity: 0, duration: 0.3 }, "<0.4")
      .from(q(".s6-coin"), { y: 30, opacity: 0, stagger: 0.12, ease: "back.out(2)" }, "<0.3")
      .from(q(".s6-stamp"), { scale: 2.4, rotation: -40, opacity: 0, transformOrigin: "50% 50%", duration: 0.45, ease: "power4.in" });
    loop.to(q(".s6-coin"), { y: -8, duration: 1.1, stagger: 0.18, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    pulse(loop, q(".s6-hot"), 0);
  }, animate);

  return (
    <SceneSvg ref={scope} wide={wide}>
      <rect x={-800} y={-100} width={2080} height={400} fill={C.selvedge} opacity={0.6} />
      <g className="s6-people">
        <Person x={112} y={176} skin={C.skinDeep} top={C.gold} hair="short" helmet>
          <Arm d="M44 28 Q78 72 96 54" hand={[96, 54]} sleeve={C.gold} skin={C.skinDeep} />
        </Person>
        <Person x={368} y={170} skin={C.skinWarm} top={C.inkSoft} hair="long" saree>
          <Arm d="M-44 28 Q-72 76 -70 62" hand={[-70, 62]} sleeve={C.inkSoft} skin={C.skinWarm} />
          <rect x={18} y={34} width={30} height={52} rx={6} fill={C.ink} />
          <g className="s6-screen">
            <rect x={21} y={38} width={24} height={44} rx={3} fill={C.chalk} />
            <path d="M27 60 l4 4 l8 -9" stroke={C.dye} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <Arm d="M44 28 Q60 84 26 80" hand={[26, 80]} sleeve={C.inkSoft} skin={C.skinWarm} />
        </Person>
      </g>
      <rect x={-800} y={300} width={2080} height={160} fill={C.line} />
      <g className="s6-note">
        <rect x={276} y={222} width={52} height={28} rx={3} fill={C.inkSoft} />
        <rect x={281} y={227} width={42} height={18} rx={2} fill="none" stroke={C.selvedge} strokeWidth={1.2} />
        <circle cx={302} cy={236} r={6} fill={C.selvedge} />
      </g>
      {[
        [220, 150],
        [246, 128],
        [272, 156],
      ].map(([x, y]) => (
        <g key={x} className="s6-coin">
          <circle cx={x} cy={y} r={11} fill={C.gold} />
          <circle cx={x} cy={y} r={6.5} fill="none" stroke={C.kraftLight} strokeWidth={2} />
        </g>
      ))}
      <g className="cursor-pointer" onClick={onAction}>
        <Hotspot cx={240} cy={64} r={44} className="s6-hot" />
        <g className="s6-stamp">
          <circle cx={240} cy={64} r={38} fill={C.paper} stroke={C.dye} strokeWidth={4} />
          <circle cx={240} cy={64} r={31} fill="none" stroke={C.dye} strokeWidth={1.5} strokeDasharray="3 4" />
          <text x={240} y={70} textAnchor="middle" fontSize={18} fontWeight={700} letterSpacing={2} fill={C.dye} transform="rotate(-12 240 64)">
            PAID
          </text>
        </g>
      </g>
    </SceneSvg>
  );
}
