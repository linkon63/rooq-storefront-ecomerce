/** Pivots the scene rotates around (the charkha hub for the wheel, his shoulder for the arm). */
export const SPINNER_PIVOTS = { wheel: "888 296", shoulder: "972 206" } as const;

const WHEEL = { cx: 888, cy: 296, r: 50 } as const;
const SPOKES: readonly number[] = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);

/**
 * A stylised man on a low mora at the right of the loom, facing it: white
 * kurta, checked lungi and a gamchha over the shoulder, turning a charkha
 * (`data-charkha-wheel`) with his arm (`data-spinner-arm`) to spin the yarn
 * the loom weaves.
 */
export function SpinnerFigure() {
  return (
    <g>
      {/* Charkha: stand, wheel and the spindle with its yarn */}
      <g className="stroke-gold/60" strokeWidth={5} strokeLinecap="round">
        <line x1={WHEEL.cx} y1={WHEEL.cy} x2={864} y2={388} />
        <line x1={WHEEL.cx} y1={WHEEL.cy} x2={912} y2={388} />
      </g>
      <rect x={846} y={386} width={84} height={8} rx={4} className="fill-gold/50" />
      <line x1={818} y1={378} x2={850} y2={372} className="stroke-gold/75" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={832} cy={375} rx={9} ry={6} className="fill-selvedge/55" />
      <path d={`M${WHEEL.cx} ${WHEEL.cy + WHEEL.r} L832 372`} className="stroke-chalk/40" strokeWidth={1} fill="none" />
      <g data-charkha-wheel>
        <circle cx={WHEEL.cx} cy={WHEEL.cy} r={WHEEL.r} className="fill-none stroke-gold/75" strokeWidth={4} />
        <g className="stroke-gold/50" strokeWidth={2}>
          {SPOKES.map((angle) => (
            <line
              key={angle}
              x1={WHEEL.cx}
              y1={WHEEL.cy}
              x2={WHEEL.cx + Math.cos(angle) * WHEEL.r}
              y2={WHEEL.cy + Math.sin(angle) * WHEEL.r}
            />
          ))}
        </g>
        <circle cx={WHEEL.cx} cy={WHEEL.cy} r={7} className="fill-gold/80" />
      </g>

      {/* Mora (cane stool) */}
      <path d="M966 334 L1026 334 L1014 362 L1026 390 L966 390 L978 362 Z" className="fill-gold/40" />

      {/* Legs reaching forward, feet on the ground */}
      <path d="M980 316 L938 322 L932 382" className="stroke-selvedge/45" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx={924} cy={386} rx={13} ry={5} className="fill-selvedge/45" />

      {/* Checked lungi */}
      <path d="M962 294 L1014 298 L1016 338 L940 334 Q926 320 942 306 Z" className="fill-ink-soft stroke-gold/70" strokeWidth={1.5} />
      <g className="stroke-dye/60" strokeWidth={2}>
        <line x1={944} y1={312} x2={1014} y2={316} />
        <line x1={942} y1={326} x2={1015} y2={330} />
        <line x1={970} y1={296} x2={966} y2={336} />
        <line x1={996} y1={297} x2={994} y2={337} />
      </g>

      {/* Kurta */}
      <path d="M964 184 Q942 230 952 298 L1012 300 Q1016 232 992 184 Z" className="fill-selvedge/40" />

      {/* Gamchha over the shoulder */}
      <path d="M990 186 Q1012 214 1006 262 L994 262 Q996 220 978 194 Z" className="fill-dye/55 stroke-gold/70" strokeWidth={1.5} />

      {/* Neck, head and short hair */}
      <rect x={978} y={172} width={12} height={16} rx={4} className="fill-selvedge/45" />
      <circle cx={982} cy={158} r={19} className="fill-selvedge/50" />
      <path d="M964 154 Q966 134 986 136 Q1002 140 1001 158 Q994 146 978 148 Q970 150 964 154 Z" className="fill-ink-soft" />

      {/* Arm turning the wheel */}
      <g data-spinner-arm>
        <path d="M972 206 L936 248 L898 290" className="stroke-selvedge/55" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={896} cy={292} r={6} className="fill-selvedge/60" />
      </g>
    </g>
  );
}
