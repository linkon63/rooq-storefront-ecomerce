import type { ReactNode } from "react";
import { JOURNEY_COLORS as C } from "../journey-colors";

type Hair = "long" | "short" | "bun";

type PersonProps = {
  x: number;
  y: number;
  skin: string;
  top: string;
  hair: Hair;
  saree?: boolean;
  headset?: boolean;
  helmet?: boolean;
  className?: string;
  /** Arms and anything held, drawn over the body and under the head. Local coords: neck base is 0,0. */
  children?: ReactNode;
};

/** A seated or standing person from the waist up, in local coordinates around the neck. */
export function Person({ x, y, skin, top, hair, saree, headset, helmet, className, children }: PersonProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        {hair === "long" ? <path d="M-30 -44 C-36 -86 36 -86 30 -44 L34 26 C20 34 -20 34 -34 26 Z" fill={C.hair} /> : null}
        {hair === "bun" ? <circle cx={0} cy={-72} r={13} fill={C.hair} /> : null}
        <path d="M-58 140 C-60 46 -44 8 0 6 C44 8 60 46 58 140 Z" fill={top} />
        {saree ? (
          <>
            <path d="M-46 20 C-14 26 22 70 46 140 L22 140 C2 86 -24 54 -54 44 Z" fill={C.dye} />
            <path d="M-46 20 C-14 26 22 70 46 140 L40 140 C16 76 -14 34 -48 28 Z" fill={C.gold} />
          </>
        ) : null}
        <rect x={-9} y={-12} width={18} height={24} rx={7} fill={skin} />
        {children}
        <ellipse cx={0} cy={-38} rx={25} ry={29} fill={skin} />
        <circle cx={-25} cy={-36} r={5} fill={skin} />
        <circle cx={25} cy={-36} r={5} fill={skin} />
        {hair === "long" ? <path d="M-27 -44 C-28 -74 28 -76 27 -44 C16 -60 -8 -62 -27 -44 Z" fill={C.hair} /> : null}
        {hair !== "long" ? <path d="M-27 -40 C-31 -76 31 -76 27 -40 C22 -56 -18 -58 -27 -40 Z" fill={C.hair} /> : null}
        {helmet ? (
          <>
            <path d="M-30 -46 C-32 -90 32 -90 30 -46 Z" fill={C.dyeDeep} />
            <rect x={-31} y={-50} width={62} height={6} rx={3} fill={C.ink} />
          </>
        ) : null}
        <circle cx={-9} cy={-36} r={2.4} fill={C.ink} />
        <circle cx={9} cy={-36} r={2.4} fill={C.ink} />
        <path d="M-7 -21 Q0 -15 7 -21" stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        {headset ? (
          <>
            <path d="M-29 -38 C-30 -82 30 -82 29 -38" stroke={C.ink} strokeWidth={4} fill="none" />
            <rect x={-33} y={-46} width={9} height={18} rx={4} fill={C.ink} />
            <path d="M-28 -30 Q-24 -12 -8 -12" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
          </>
        ) : null}
      </g>
    </g>
  );
}

type ArmProps = { d: string; hand: readonly [number, number]; sleeve: string; skin: string; className?: string };

/** One arm: a sleeve stroke from the shoulder and a hand at its end. */
export function Arm({ d, hand, sleeve, skin, className }: ArmProps) {
  return (
    <g className={className}>
      <path d={d} stroke={sleeve} strokeWidth={17} strokeLinecap="round" fill="none" />
      <circle cx={hand[0]} cy={hand[1]} r={8} fill={skin} />
    </g>
  );
}

/** The counter or table every scene stands behind. */
export function Counter({ y = 268 }: { y?: number }) {
  return (
    <g>
      <rect x={-800} y={y} width={2080} height={460 - y} fill={C.line} />
      <rect x={-800} y={y} width={2080} height={5} fill={C.gold} opacity={0.5} />
    </g>
  );
}

/** A pulsing ring marking what can be clicked in a scene. */
export function Hotspot({ cx, cy, r, className }: { cx: number; cy: number; r: number; className: string }) {
  return <circle className={className} cx={cx} cy={cy} r={r} fill="none" stroke={C.dye} strokeWidth={2} opacity={0} />;
}
