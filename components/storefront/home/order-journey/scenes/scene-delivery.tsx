"use client";

import { JOURNEY_COLORS as C } from "../journey-colors";
import { Hotspot } from "./figure";
import { SceneSvg } from "./scene-svg";
import type { SceneProps } from "./scene-props";
import { pulse, useSceneMotion } from "./use-scene-motion";

const SKYLINE = [
  [0, 150, 50],
  [56, 110, 40],
  [102, 170, 60],
  [170, 130, 36],
  [212, 90, 54],
  [272, 160, 44],
  [322, 120, 62],
  [390, 180, 40],
  [436, 140, 44],
] as const;

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy={276} r={24} fill={C.ink} />
      <circle cx={cx} cy={276} r={11} fill={C.line} />
      <g className="s4-spokes">
        <path d={`M${cx - 11} 276 h22 M${cx} 265 v22`} stroke={C.ink} strokeWidth={2.5} />
      </g>
    </g>
  );
}

/** A courier rides through town with the parcel strapped behind; the street scrolls past. */
export function SceneDelivery({ animate, wide, onAction }: SceneProps) {
  const scope = useSceneMotion((q, intro, loop) => {
    intro.from(q(".s4-ride"), { x: -260, duration: 1.2, ease: "power3.out" }).from(q(".s4-pin"), { y: -30, opacity: 0, ease: "bounce.out" }, "-=0.3");
    loop
      .fromTo(q(".s4-city"), { x: 0 }, { x: -480, duration: 8, ease: "none" }, 0)
      .fromTo(q(".s4-road"), { x: 0 }, { x: -60, duration: 0.5, ease: "none", repeat: 15 }, 0)
      .to(q(".s4-spokes"), { rotation: 360 * 12, transformOrigin: "50% 50%", duration: 8, ease: "none" }, 0)
      .to(q(".s4-bob"), { y: -2.5, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 31 }, 0)
      .fromTo(q(".s4-speed"), { x: 20, opacity: 0.8 }, { x: -40, opacity: 0, duration: 0.6, stagger: 0.15, repeat: 12 }, 0);
    pulse(loop, q(".s4-hot"), 0);
  }, animate);

  return (
    <SceneSvg ref={scope} wide={wide}>
      <circle cx={380} cy={90} r={34} fill={C.selvedge} />
      <g className="s4-city">
        {[-960, -480, 0, 480, 960].map((offset) => (
          <g key={offset} transform={`translate(${offset} 0)`}>
            {SKYLINE.map(([x, top, w]) => (
              <g key={x}>
                <rect x={x} y={top} width={w} height={300 - top} fill={C.selvedge} />
                {Array.from({ length: Math.floor((260 - top) / 28) }, (_, row) => (
                  <rect key={row} x={x + 10} y={top + 14 + row * 28} width={w - 20} height={8} rx={2} fill={C.line} />
                ))}
              </g>
            ))}
          </g>
        ))}
      </g>
      <rect x={-800} y={300} width={2080} height={160} fill={C.inkSoft} />
      <g className="s4-road">
        {Array.from({ length: 36 }, (_, i) => (
          <rect key={i} x={(i - 14) * 60} y={326} width={32} height={5} rx={2.5} fill={C.selvedge} opacity={0.7} />
        ))}
      </g>
      <g className="s4-ride">
        {[0, 1, 2].map((i) => (
          <path key={i} className="s4-speed" d={`M${70 - i * 6} ${200 + i * 26} h-46`} stroke={C.gold} strokeWidth={3} strokeLinecap="round" />
        ))}
        <g className="s4-bob cursor-pointer" onClick={onAction}>
          <Hotspot cx={210} cy={220} r={70} className="s4-hot" />
          <Wheel cx={150} />
          <Wheel cx={296} />
          <path d="M120 256 C118 228 150 216 196 218 L246 218 C258 218 266 226 270 238 L282 268 L174 268 C150 268 130 268 120 256 Z" fill={C.dye} />
          <path d="M270 238 L262 168" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <path d="M248 164 L280 160" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          <circle cx={282} cy={196} r={7} fill={C.gold} />
          <path d="M156 212 C166 200 222 200 232 212 Z" fill={C.ink} />
          <rect x={112} y={166} width={60} height={44} rx={3} fill={C.kraft} />
          <path d="M142 166 v44" stroke={C.tape} strokeWidth={8} />
          <rect x={122} y={180} width={14} height={10} rx={2} fill={C.chalk} />
          <path d="M196 206 L236 220 L240 262" stroke={C.inkSoft} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M196 206 L212 140" stroke={C.gold} strokeWidth={32} strokeLinecap="round" />
          <path d="M214 148 L240 172 L254 164" stroke={C.gold} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={254} cy={164} r={7.5} fill={C.skinDeep} />
          <circle cx={220} cy={110} r={21} fill={C.skinDeep} />
          <path d="M198 112 C196 80 244 78 244 106 L244 114 L198 114 Z" fill={C.dyeDeep} />
          <rect x={226} y={102} width={20} height={9} rx={4} fill={C.ink} />
        </g>
      </g>
      <g className="s4-pin" transform="translate(410 214)">
        <path d="M0 0 C-18 -22 -18 -46 0 -46 C18 -46 18 -22 0 0 Z" fill={C.dye} />
        <circle cx={0} cy={-30} r={7} fill={C.chalk} />
      </g>
    </SceneSvg>
  );
}
