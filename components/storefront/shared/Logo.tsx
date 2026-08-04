/**
 * Organishi wordmark.
 *
 * Drawn inline as SVG so the shop has a real logo before the brand asset is
 * uploaded. Once a logo is set in Admin → Settings → General it is used
 * instead (see Header/Footer, which prefer `settings.logo`).
 */
export default function Logo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const wordColour = variant === "light" ? "#ffffff" : "#1f2a17";
  const taglineColour = variant === "light" ? "rgba(255,255,255,0.75)" : "#6b7280";

  return (
    <svg
      viewBox="0 0 200 64"
      role="img"
      aria-label="Organishi — Heal With Nature"
      className={className}
    >
      {/* Leaf-in-circle mark */}
      <path
        d="M38 10a22 22 0 1 0 0 44 22 22 0 0 0 0-44Zm0 5.5a16.5 16.5 0 1 1 0 33 16.5 16.5 0 0 1 0-33Z"
        fill="#1b7fc4"
      />
      <path
        d="M30 40c0-9 7-16.5 16.5-17.5C46 32 39.5 40 30 40Z"
        fill="#4a9e2f"
      />
      <path d="M27.5 43c3-6.5 8.5-11 15-13" stroke="#2f7d1e" strokeWidth="2" fill="none" strokeLinecap="round" />

      <text
        x="66"
        y="34"
        fill={wordColour}
        fontFamily="var(--font-inter), sans-serif"
        fontSize="20"
        fontWeight="700"
        letterSpacing="1.5"
      >
        ORGANISHI
      </text>
      <line x1="66" y1="43" x2="82" y2="43" stroke={taglineColour} strokeWidth="1" />
      <text
        x="88"
        y="47"
        fill={taglineColour}
        fontFamily="var(--font-inter), sans-serif"
        fontSize="8.5"
        letterSpacing="0.6"
      >
        Heal With Nature
      </text>
      <line x1="170" y1="43" x2="186" y2="43" stroke={taglineColour} strokeWidth="1" />
    </svg>
  );
}
