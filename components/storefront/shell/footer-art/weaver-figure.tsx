/** Pivots the scene rotates around (shoulder for the arm, heel for the treadle). */
export const WEAVER_PIVOTS = { shoulder: "890 196", treadle: "870 386" } as const;

/**
 * A stylised weaver seated on her bench, facing the loom: hair in a bun, a
 * sharee with its pallu over the shoulder, her arm (`data-weaver-arm`) on the
 * beater and her foot on the treadle (`data-treadle`).
 */
export function WeaverFigure() {
  return (
    <g>
      {/* Bench */}
      <g className="fill-gold/45">
        <rect x={862} y={312} width={140} height={10} rx={3} />
        <rect x={874} y={322} width={9} height={70} />
        <rect x={982} y={322} width={9} height={70} />
      </g>

      {/* Treadle under her foot */}
      <line data-treadle x1={784} y1={394} x2={870} y2={386} className="stroke-gold/70" strokeWidth={6} strokeLinecap="round" />

      {/* Leg reaching the treadle */}
      <path d="M884 306 L842 314 L840 380" className="stroke-selvedge/45" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx={832} cy={384} rx={13} ry={5} className="fill-selvedge/45" />

      {/* Sharee: skirt drape over the lap */}
      <path d="M874 250 Q852 290 838 302 Q832 320 852 324 L984 318 Q976 272 936 250 Z" className="fill-selvedge/30 stroke-gold/80" strokeWidth={2} />
      <path d="M840 318 L984 312" className="stroke-dye/70" strokeWidth={5} />

      {/* Blouse and back */}
      <path d="M888 180 Q868 214 876 252 L934 254 Q940 214 916 180 Z" className="fill-dye/45" />

      {/* Pallu over the shoulder, falling behind */}
      <path
        d="M912 180 Q952 198 950 258 Q958 298 996 314 L982 318 Q930 296 928 244 Q926 206 896 188 Z"
        className="fill-dye/60 stroke-gold/80"
        strokeWidth={1.5}
      />

      {/* Neck, head and bun */}
      <rect x={895} y={170} width={12} height={16} rx={4} className="fill-selvedge/45" />
      <circle cx={898} cy={158} r={19} className="fill-selvedge/50" />
      <path d="M880 152 Q888 132 910 138 Q920 146 916 160 Q904 148 880 152 Z" className="fill-ink-soft" />
      <circle cx={921} cy={148} r={11} className="fill-ink-soft stroke-gold/60" strokeWidth={1.5} />
      <circle cx={882} cy={161} r={2} className="fill-gold" />

      {/* Arm on the beater */}
      <g data-weaver-arm>
        <path d="M890 196 L852 232 L808 226" className="stroke-selvedge/55" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={804} cy={226} r={6} className="fill-selvedge/60" />
        <circle cx={822} cy={228} r={5} className="fill-none stroke-gold" strokeWidth={1.5} />
        <circle cx={828} cy={229} r={5} className="fill-none stroke-dye" strokeWidth={1.5} />
      </g>
    </g>
  );
}
