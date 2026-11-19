import type { ColorRef } from "@/types/storefront/catalog";
import { isLightColor } from "@/utils/color";

const MAX_SWATCHES = 5;

type CardSwatchesProps = {
  colors: readonly ColorRef[];
  /** Colour shown on the photo right now (id), if a swatch was picked. */
  activeId?: string | null;
  /** Mouse over / focus / tap on a swatch; null when the pointer leaves. */
  onPreview?: (color: ColorRef | null, pinned: boolean) => void;
};

/**
 * Colour chips under a card (rectangles, like fabric swatches), "+2" when
 * there are more. With `onPreview` they are buttons: hovering (mouse) or
 * tapping/focusing one swaps the card photo to that colour.
 */
export function CardSwatches({ colors, activeId = null, onPreview }: CardSwatchesProps) {
  if (colors.length < 2) return null;
  const shown = colors.slice(0, MAX_SWATCHES);
  const extra = colors.length - shown.length;
  return (
    <p
      className="pointer-events-auto mt-1 flex items-center gap-1"
      aria-label={`${colors.length} colours: ${colors.map((c) => c.name).join(", ")}`}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onPreview?.(null, false);
      }}
    >
      {shown.map((color) => {
        const chip = (
          <span
            aria-hidden
            className={`block h-4 w-6 transition-transform duration-200 md:h-5 md:w-[30px] ${isLightColor(color.hex) ? "ring-1 ring-ink/10" : ""} ${
              activeId === color.id ? "scale-110 ring-2 ring-ink" : ""
            }`}
            style={{ backgroundColor: color.hex }}
          />
        );
        if (!onPreview) return <span key={color.id}>{chip}</span>;
        return (
          <button
            key={color.id}
            type="button"
            title={color.name}
            aria-label={color.name}
            aria-pressed={activeId === color.id}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") onPreview(color, false);
            }}
            onFocus={() => onPreview(color, false)}
            onClick={() => onPreview(color, true)}
            className="-my-1.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
          >
            {chip}
          </button>
        );
      })}
      {extra > 0 ? (
        <span aria-hidden className="type-meta text-stone">
          +{extra}
        </span>
      ) : null}
    </p>
  );
}
