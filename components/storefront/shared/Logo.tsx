/**
 * Rooq wordmark: Archivo Expanded set as SVG text so it scales with a height
 * utility alone (`h-7`, `md:h-8`) and inherits `currentColor`.
 */

export default function Logo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <svg
      viewBox="0 0 132 36"
      role="img"
      aria-label="Rooq"
      className={`w-auto ${variant === "light" ? "text-chalk" : "text-ink"} ${className}`}
    >
      <text
        x="0"
        y="29"
        textLength="116"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 36,
          fontStretch: "125%",
          fontVariationSettings: '"wdth" 125',
          letterSpacing: "-0.04em",
        }}
      >
        rooq
      </text>
      <circle cx="126" cy="26.5" r="3.5" fill="var(--color-dye)" />
    </svg>
  );
}
