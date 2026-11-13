import { FELL, LOOM, SHUTTLE } from "./loom-geometry";

/**
 * The working edge of the cloth: the reed/beater (`data-beater`) and the boat
 * shuttle (`data-shuttle`) carrying the weft. The whole group (`data-fell`)
 * climbs with the cloth.
 */
export function ShuttleBeater() {
  const shuttleY = FELL.start - 12;
  const beaterY = FELL.start - 30;
  const x = LOOM.warpLeft;
  return (
    <g data-fell>
      <g data-beater>
        <rect x={LOOM.leftPost - 6} y={beaterY - 5} width={LOOM.rightPost - LOOM.leftPost + 12} height={10} rx={5} className="fill-gold/75" />
        <g className="stroke-chalk/20" strokeWidth={1}>
          <line x1={LOOM.leftPost} y1={beaterY - 5} x2={LOOM.leftPost} y2={LOOM.topBeam + 12} />
          <line x1={LOOM.rightPost} y1={beaterY - 5} x2={LOOM.rightPost} y2={LOOM.topBeam + 12} />
        </g>
      </g>
      <g data-shuttle>
        <path
          d={`M${x} ${shuttleY} Q${x + 10} ${shuttleY - 8} ${x + SHUTTLE.width / 2} ${shuttleY - 8} Q${x + SHUTTLE.width - 10} ${shuttleY - 8} ${x + SHUTTLE.width} ${shuttleY} Q${x + SHUTTLE.width - 10} ${shuttleY + 8} ${x + SHUTTLE.width / 2} ${shuttleY + 8} Q${x + 10} ${shuttleY + 8} ${x} ${shuttleY} Z`}
          className="fill-selvedge/80"
        />
        <rect x={x + 20} y={shuttleY - 3} width={SHUTTLE.width - 40} height={6} rx={3} className="fill-dye" />
        <line x1={x + SHUTTLE.width / 2} y1={shuttleY} x2={x - 40} y2={shuttleY + 6} className="stroke-dye/70" strokeWidth={1.2} />
      </g>
    </g>
  );
}
