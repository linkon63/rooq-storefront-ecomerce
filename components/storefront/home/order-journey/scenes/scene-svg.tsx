import type { ReactNode, Ref } from "react";
import { JOURNEY_COLORS as C } from "../journey-colors";

type SceneSvgProps = { ref: Ref<SVGSVGElement>; wide: boolean; children: ReactNode };

/**
 * The canvas every journey scene draws on; the art sits in 0 0 480 360 and
 * its walls and floors run far past that. As a wide backdrop the view widens
 * to the left (room for the copy) and covers its box, keeping the art on the
 * right. Decorative: the copy beside it carries the words.
 */
export function SceneSvg({ ref, wide, children }: SceneSvgProps) {
  return (
    <svg
      ref={ref}
      viewBox={wide ? "-320 -60 820 480" : "0 0 480 360"}
      preserveAspectRatio={wide ? "xMaxYMid slice" : "xMidYMid meet"}
      className="block h-full w-full"
      aria-hidden
      focusable="false"
    >
      <rect x={-800} y={-100} width={2080} height={560} fill={C.paper} />
      {children}
    </svg>
  );
}
