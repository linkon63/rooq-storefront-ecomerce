import { FELL, LOOM } from "./loom-geometry";
import { SHAREES, ShareeDesign } from "./sharee-design";

const CLIP_ID = "rooq-footer-cloth";

/**
 * The tant sharee on the loom. Each message gets its own sharee
 * (`data-sharee`, shown in turn by the timeline; all but the first start
 * hidden). It is revealed by `data-cloth-clip`, which the scene grows upward
 * as the fell rises; the woven letters sit on their own top layer.
 */
export function WovenCloth() {
  const left = LOOM.warpLeft - 4;
  const width = LOOM.warpRight + 4 - left;
  return (
    <g>
      <defs>
        <clipPath id={CLIP_ID}>
          <rect data-cloth-clip x={left} y={FELL.start} width={width} height={LOOM.breastBeam - FELL.start} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${CLIP_ID})`}>
        {SHAREES.map((palette, index) => (
          <ShareeDesign key={palette.body} palette={palette} hidden={index > 0} />
        ))}
      </g>
    </g>
  );
}
