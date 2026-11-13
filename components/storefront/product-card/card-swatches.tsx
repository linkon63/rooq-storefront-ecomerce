import type { ColorRef } from "@/types/storefront/catalog";
import { isLightColor } from "@/utils/color";

const MAX_SWATCHES = 5;

/** Colour chips under a card (rectangles, like fabric swatches), "+2" when there are more. */
export function CardSwatches({ colors }: { colors: readonly ColorRef[] }) {
  if (colors.length < 2) return null;
  const shown = colors.slice(0, MAX_SWATCHES);
  const extra = colors.length - shown.length;
  return (
    <p className="mt-1 flex items-center gap-1" aria-label={`${colors.length} colours: ${colors.map((c) => c.name).join(", ")}`}>
      {shown.map((color) => (
        <span
          key={color.id}
          aria-hidden
          className={`h-4 w-6 md:h-5 md:w-[30px] ${isLightColor(color.hex) ? "ring-1 ring-ink/10" : ""}`}
          style={{ backgroundColor: color.hex }}
        />
      ))}
      {extra > 0 ? (
        <span aria-hidden className="type-meta text-stone">
          +{extra}
        </span>
      ) : null}
    </p>
  );
}
