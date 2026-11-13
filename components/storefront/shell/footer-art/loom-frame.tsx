import { HEDDLES, LOOM, WARP_XS } from "./loom-geometry";

/**
 * The wooden handloom: posts, beams, the warp threads and the heddle bars
 * (each heddle bar is a `data-heddle` group the scene lifts and drops).
 */
export function LoomFrame() {
  const { leftPost, rightPost, topBeam, breastBeam } = LOOM;
  return (
    <g>
      {/* Posts and feet */}
      <g className="fill-gold/45">
        <rect x={leftPost - 14} y={topBeam - 20} width={14} height={breastBeam + 44 - topBeam} rx={3} />
        <rect x={rightPost} y={topBeam - 20} width={14} height={breastBeam + 44 - topBeam} rx={3} />
        <rect x={leftPost - 40} y={breastBeam + 22} width={66} height={10} rx={4} />
        <rect x={rightPost - 12} y={breastBeam + 22} width={66} height={10} rx={4} />
      </g>
      {/* Warp beam (top) and breast beam (bottom), with the rolled cloth */}
      <rect x={leftPost - 26} y={topBeam - 6} width={rightPost - leftPost + 52} height={18} rx={9} className="fill-gold/60" />
      <rect x={leftPost - 26} y={breastBeam} width={rightPost - leftPost + 52} height={20} rx={10} className="fill-gold/60" />
      <circle cx={leftPost - 26} cy={topBeam + 3} r={11} className="fill-selvedge/40" />
      <circle cx={rightPost + 26} cy={breastBeam + 10} r={12} className="fill-selvedge/40" />

      {/* Warp threads */}
      <g className="stroke-selvedge/45" strokeWidth={1.2}>
        {WARP_XS.map((x) => (
          <line key={x} x1={x} y1={topBeam + 12} x2={x} y2={breastBeam} />
        ))}
      </g>

      {/* Heddle bars with their string eyes */}
      {HEDDLES.map((y, index) => (
        <g key={y} data-heddle={index}>
          <line
            x1={LOOM.leftPost - 4}
            y1={y}
            x2={LOOM.rightPost + 4}
            y2={y}
            className="stroke-gold/70"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <g className="stroke-chalk/25" strokeWidth={1}>
            {WARP_XS.filter((_, i) => i % 2 === index).map((x) => (
              <line key={x} x1={x} y1={y - 9} x2={x} y2={y + 9} />
            ))}
          </g>
          <line x1={LOOM.leftPost + 6} y1={topBeam + 12} x2={LOOM.leftPost + 6} y2={y} className="stroke-chalk/30" />
          <line x1={LOOM.rightPost - 6} y1={topBeam + 12} x2={LOOM.rightPost - 6} y2={y} className="stroke-chalk/30" />
        </g>
      ))}
    </g>
  );
}
