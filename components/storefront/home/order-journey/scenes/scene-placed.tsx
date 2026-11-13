"use client";

import { JOURNEY_COLORS as C } from "../journey-colors";
import { Arm, Counter, Hotspot, Person } from "./figure";
import { SceneSvg } from "./scene-svg";
import type { SceneProps } from "./scene-props";
import { pulse, useSceneMotion } from "./use-scene-motion";

/** A shopper on the sofa taps Place order; the phone screen is shown enlarged beside her. */
export function ScenePlaced({ animate, wide, onAction }: SceneProps) {
  const scope = useSceneMotion((q, intro, loop) => {
    intro
      .from(q(".s1-person"), { y: 24, opacity: 0 })
      .from(q(".s1-phone"), { x: 40, opacity: 0, duration: 0.7 }, "<0.15")
      .from(q(".s1-zoom"), { strokeDashoffset: 120, duration: 0.6 }, "<0.3")
      .from(q(".s1-row"), { scaleX: 0, transformOrigin: "0% 50%", stagger: 0.08, duration: 0.4 }, "<")
      .fromTo(q(".s1-finger"), { x: 70, y: 90, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "power3.inOut" })
      .to(q(".s1-finger"), { scale: 0.85, transformOrigin: "50% 50%", duration: 0.12, yoyo: true, repeat: 1 })
      .fromTo(q(".s1-ripple"), { scale: 0.4, opacity: 0.8, transformOrigin: "50% 50%" }, { scale: 2.2, opacity: 0, duration: 0.6 }, "<")
      .to(q(".s1-cta"), { opacity: 0, duration: 0.2 }, "<")
      .to(q(".s1-done"), { opacity: 1, duration: 0.3 }, "<0.1")
      .from(q(".s1-badge"), { scale: 0, transformOrigin: "50% 50%", ease: "back.out(3)", duration: 0.5 })
      .to(q(".s1-finger"), { opacity: 0, y: 30, duration: 0.4 }, "<");
    loop.to(q(".s1-person"), { y: -2, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    pulse(loop, q(".s1-hot"), 0);
  }, animate);

  return (
    <SceneSvg ref={scope} wide={wide}>
      <circle cx={150} cy={190} r={118} fill={C.selvedge} />
      <rect x={34} y={34} width={64} height={84} rx={4} fill="none" stroke={C.line} strokeWidth={4} />
      <path d="M44 104 L60 76 L72 92 L80 82 L90 104 Z" fill={C.line} />
      <rect x={44} y={196} width={212} height={96} rx={26} fill={C.dye} opacity={0.85} />
      <rect x={30} y={240} width={40} height={52} rx={16} fill={C.dyeDeep} />
      <rect x={230} y={240} width={40} height={52} rx={16} fill={C.dyeDeep} />
      <Person x={150} y={170} skin={C.skinWarm} top={C.inkSoft} hair="long" saree className="s1-person">
        <rect x={-15} y={44} width={30} height={50} rx={6} fill={C.ink} />
        <rect x={-12} y={48} width={24} height={40} rx={3} fill={C.chalk} />
        <rect x={-9} y={66} width={18} height={6} rx={3} fill={C.dye} />
        <Arm d="M-42 26 Q-60 92 -17 74" hand={[-17, 74]} sleeve={C.inkSoft} skin={C.skinWarm} />
        <Arm d="M42 26 Q60 92 17 74" hand={[17, 74]} sleeve={C.inkSoft} skin={C.skinWarm} />
      </Person>
      <Counter y={286} />
      <path className="s1-zoom" d="M166 222 L292 60 M166 262 L292 318" stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 6" fill="none" />
      <g className="s1-phone" transform="translate(292 36)">
        <rect width={150} height={288} rx={22} fill={C.ink} />
        <rect x={8} y={10} width={134} height={268} rx={15} fill={C.chalk} />
        <text x={75} y={36} textAnchor="middle" fontSize={13} letterSpacing={4} fill={C.ink} fontWeight={600}>
          ROOQ
        </text>
        <path d="M112 26 h4 l3 10 h10 l2 -7 h-14" stroke={C.ink} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
        <circle cx={120} cy={40} r={1.6} fill={C.ink} />
        <circle cx={128} cy={40} r={1.6} fill={C.ink} />
        <g className="s1-badge">
          <circle cx={133} cy={22} r={7} fill={C.dye} />
          <text x={133} y={25.5} textAnchor="middle" fontSize={9} fill={C.chalk} fontWeight={600}>
            1
          </text>
        </g>
        <rect x={18} y={50} width={114} height={112} rx={8} fill={C.dye} />
        <path d="M18 70 L132 58 M18 96 L132 84 M18 122 L132 110" stroke={C.dyeDeep} strokeWidth={6} />
        <rect x={18} y={140} width={114} height={22} fill={C.gold} />
        <path d="M24 151 h102" stroke={C.dyeDeep} strokeWidth={2} strokeDasharray="3 5" />
        <rect className="s1-row" x={18} y={174} width={84} height={8} rx={4} fill={C.ink} opacity={0.85} />
        <rect className="s1-row" x={18} y={188} width={46} height={8} rx={4} fill={C.dye} />
        <g className="s1-row">
          {[18, 46, 74].map((x) => (
            <rect key={x} x={x} y={204} width={22} height={14} rx={4} fill="none" stroke={C.line} strokeWidth={1.5} />
          ))}
        </g>
        <g className="cursor-pointer" onClick={onAction}>
          <Hotspot cx={75} cy={244} r={30} className="s1-hot" />
          <rect x={18} y={228} width={114} height={32} rx={16} fill={C.dye} />
          <text className="s1-cta" x={75} y={248} textAnchor="middle" fontSize={12} fill={C.chalk} fontWeight={500}>
            Place order
          </text>
          <g className="s1-done" opacity={0}>
            <rect x={18} y={228} width={114} height={32} rx={16} fill={C.inkSoft} />
            <path d="M48 244 l5 5 l10 -10" stroke={C.chalk} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x={88} y={248} textAnchor="middle" fontSize={12} fill={C.chalk} fontWeight={500}>
              Ordered
            </text>
          </g>
          <circle className="s1-ripple" cx={75} cy={244} r={16} fill={C.dye} opacity={0} />
        </g>
        <g className="s1-finger" pointerEvents="none" opacity={0}>
          <path d="M78 246 C78 236 86 236 86 246 L86 262 C92 258 100 262 98 270 L92 290 L72 290 L66 268 C64 262 72 260 78 266 Z" fill={C.skinWarm} stroke={C.skinDeep} strokeWidth={1.2} />
        </g>
      </g>
    </SceneSvg>
  );
}
