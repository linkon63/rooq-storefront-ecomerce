"use client";

import { JOURNEY_COLORS as C } from "../journey-colors";
import { Arm, Hotspot, Person } from "./figure";
import { SceneSvg } from "./scene-svg";
import type { SceneProps } from "./scene-props";
import { pulse, useSceneMotion } from "./use-scene-motion";

const SPARKS = [
  [222, 150],
  [262, 138],
  [244, 120],
] as const;

/** At her door the shopper takes the parcel from the courier, opens it and checks the saree with him. */
export function SceneReceived({ animate, wide, onAction }: SceneProps) {
  const scope = useSceneMotion((q, intro, loop) => {
    intro
      .from(q(".s5-door"), { opacity: 0, duration: 0.4 })
      .from(q(".s5-rider"), { x: -40, opacity: 0 }, "<")
      .from(q(".s5-shopper"), { x: 30, opacity: 0 }, "<0.2")
      .from(q(".s5-parcel"), { x: -70, duration: 0.9, ease: "power2.inOut" }, "+=0.2")
      .to(q(".s5-flap-l"), { rotation: -120, svgOrigin: "212 196", duration: 0.5 }, "+=0.1")
      .to(q(".s5-flap-r"), { rotation: 120, svgOrigin: "276 196", duration: 0.5 }, "<")
      .from(q(".s5-saree"), { y: 26, duration: 0.6, ease: "back.out(2)" }, "<0.2")
      .from(q(".s5-spark"), { scale: 0, transformOrigin: "50% 50%", stagger: 0.1, ease: "back.out(3)" }, "<0.2")
      .from(q(".s5-note"), { y: 12, opacity: 0 });
    loop.to(q(".s5-spark"), { scale: 0.6, opacity: 0.5, transformOrigin: "50% 50%", duration: 0.7, stagger: 0.2, yoyo: true, repeat: 1 }, 0);
    pulse(loop, q(".s5-hot"), 0);
  }, animate);

  return (
    <SceneSvg ref={scope} wide={wide}>
      <g className="s5-door">
        <rect x={330} y={30} width={950} height={430} fill={C.selvedge} />
        <rect x={350} y={70} width={110} height={290} rx={4} fill={C.inkSoft} />
        <rect x={364} y={86} width={82} height={110} rx={3} fill={C.ink} opacity={0.35} />
        <circle cx={444} cy={240} r={5} fill={C.gold} />
      </g>
      <g className="s5-rider">
        <Person x={110} y={184} skin={C.skinDeep} top={C.gold} hair="short" helmet>
          <Arm d="M44 28 Q72 70 92 58" hand={[92, 58]} sleeve={C.gold} skin={C.skinDeep} />
        </Person>
      </g>
      <g className="s5-shopper">
        <Person x={396} y={170} skin={C.skinWarm} top={C.inkSoft} hair="long" saree>
          <Arm d="M-44 28 Q-80 76 -118 64" hand={[-118, 64]} sleeve={C.inkSoft} skin={C.skinWarm} />
          <Arm d="M44 28 Q30 80 -2 70" hand={[-2, 70]} sleeve={C.inkSoft} skin={C.skinWarm} />
        </Person>
      </g>
      <rect x={-800} y={300} width={2080} height={160} fill={C.line} />
      <g className="s5-parcel cursor-pointer" onClick={onAction}>
        <Hotspot cx={244} cy={226} r={52} className="s5-hot" />
        <g className="s5-saree">
          <rect x={214} y={178} width={60} height={20} rx={4} fill={C.dye} />
          <rect x={214} y={190} width={60} height={5} fill={C.gold} />
        </g>
        <rect x={212} y={196} width={64} height={56} rx={3} fill={C.kraft} />
        <rect x={222} y={214} width={26} height={16} rx={2} fill={C.chalk} />
        <path className="s5-flap-l" d="M212 196 L244 196 L244 190 L212 190 Z" fill={C.kraftLight} />
        <path className="s5-flap-r" d="M244 196 L276 196 L276 190 L244 190 Z" fill={C.kraftLight} />
        {SPARKS.map(([x, y]) => (
          <path key={x} className="s5-spark" d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill={C.gold} />
        ))}
      </g>
      <g className="s5-note">
        <rect x={150} y={36} width={176} height={40} rx={14} fill={C.chalk} />
        <path d="M168 58 l5 5 l9 -10" stroke={C.dye} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={248} y={61} textAnchor="middle" fontSize={13} fill={C.ink}>
          Checked together
        </text>
      </g>
    </SceneSvg>
  );
}
