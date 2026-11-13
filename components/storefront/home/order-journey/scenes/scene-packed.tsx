"use client";

import { JOURNEY_COLORS as C } from "../journey-colors";
import { Counter, Hotspot, Person } from "./figure";
import { SceneSvg } from "./scene-svg";
import type { SceneProps } from "./scene-props";
import { pulse, useSceneMotion } from "./use-scene-motion";

const ARMS_UP = ["M196 178 Q168 176 194 160", "M284 178 Q312 176 286 160"];
const ARMS_DOWN = ["M196 178 Q176 214 194 222", "M284 178 Q304 214 286 222"];
const ARMS_REST = ["M196 178 Q160 200 150 260", "M284 178 Q320 200 330 260"];
const MOVE = { duration: 1, ease: "power2.inOut" };

/** At the studio the saree is folded into the box, the lid closes, it is taped and tagged as checked. */
export function ScenePacked({ animate, wide, onAction }: SceneProps) {
  const scope = useSceneMotion((q, intro, loop) => {
    intro
      .from(q(".s3-packer"), { y: 20, opacity: 0 })
      .from(q(".s3-box"), { y: 30, opacity: 0 }, "<0.1")
      .to(q(".s3-saree"), { y: 62, duration: 1, ease: "power2.inOut" }, "+=0.2")
      .to(q(".s3-arm-l"), { attr: { d: ARMS_DOWN[0] }, ...MOVE }, "<")
      .to(q(".s3-arm-r"), { attr: { d: ARMS_DOWN[1] }, ...MOVE }, "<")
      .to(q(".s3-hand-l"), { attr: { cy: 222 }, ...MOVE }, "<")
      .to(q(".s3-hand-r"), { attr: { cy: 222 }, ...MOVE }, "<")
      .to(q(".s3-arm-l"), { attr: { d: ARMS_REST[0] }, duration: 0.6 })
      .to(q(".s3-arm-r"), { attr: { d: ARMS_REST[1] }, duration: 0.6 }, "<")
      .to(q(".s3-hand-l"), { attr: { cx: 150, cy: 260 }, duration: 0.6 }, "<")
      .to(q(".s3-hand-r"), { attr: { cx: 330, cy: 260 }, duration: 0.6 }, "<")
      .from(q(".s3-lid"), { y: -90, opacity: 0, duration: 0.6, ease: "bounce.out" }, "<0.2")
      .from(q(".s3-tape"), { strokeDashoffset: 90, duration: 0.6, ease: "none" })
      .from(q(".s3-tag"), { scale: 0, transformOrigin: "50% 0%", ease: "back.out(2.5)" });
    loop.to(q(".s3-tag"), { rotation: 8, transformOrigin: "50% 0%", duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    pulse(loop, q(".s3-hot"), 0);
  }, animate);

  return (
    <SceneSvg ref={scope} wide={wide}>
      <rect x={300} y={40} width={140} height={90} rx={6} fill={C.selvedge} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={316 + i * 40} y={56} width={28} height={60} rx={3} fill={[C.dye, C.gold, C.inkSoft][i]} />
      ))}
      <path d="M300 130 h140" stroke={C.gold} strokeWidth={4} />
      <Person x={240} y={150} skin={C.skin} top={C.inkSoft} hair="short" className="s3-packer">
        <path d="M-34 40 L34 40 L40 140 L-40 140 Z" fill={C.dyeDeep} />
      </Person>
      <Counter />
      <g className="s3-box">
        <path d="M170 210 L310 210 L292 192 L188 192 Z" fill={C.kraftShade} />
      </g>
      <g className="s3-saree">
        <rect x={198} y={140} width={84} height={12} rx={3} fill={C.dyeDeep} />
        <rect x={194} y={150} width={92} height={24} rx={4} fill={C.dye} />
        <rect x={194} y={166} width={92} height={6} fill={C.gold} />
      </g>
      <path className="s3-arm-l" d={ARMS_UP[0]} stroke={C.inkSoft} strokeWidth={17} strokeLinecap="round" fill="none" />
      <path className="s3-arm-r" d={ARMS_UP[1]} stroke={C.inkSoft} strokeWidth={17} strokeLinecap="round" fill="none" />
      <circle className="s3-hand-l" cx={194} cy={160} r={8} fill={C.skin} />
      <circle className="s3-hand-r" cx={286} cy={160} r={8} fill={C.skin} />
      <g className="s3-box">
        <rect x={170} y={210} width={140} height={62} fill={C.kraft} />
        <path d="M170 210 h140" stroke={C.kraftShade} strokeWidth={2} />
        <rect x={190} y={232} width={48} height={26} rx={3} fill={C.chalk} />
        <rect x={190} y={232} width={48} height={7} rx={2} fill={C.dye} />
      </g>
      <path className="s3-lid" d="M166 210 L314 210 L294 190 L186 190 Z" fill={C.kraftLight} stroke={C.kraftShade} strokeWidth={1.5} />
      <path className="s3-tape" d="M240 190 L240 210 L240 256" stroke={C.tape} strokeWidth={12} strokeDasharray="90" fill="none" opacity={0.95} />
      <g className="cursor-pointer" onClick={onAction}>
        <Hotspot cx={300} cy={262} r={26} className="s3-hot" />
        <g className="s3-tag">
          <path d="M298 214 L298 236" stroke={C.gold} strokeWidth={2} />
          <path d="M284 236 h28 v30 l-14 10 l-14 -10 Z" fill={C.gold} />
          <path d="M291 252 l5 5 l9 -10" stroke={C.chalk} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </SceneSvg>
  );
}
