import Image from "next/image";

/**
 * Organishi Brand Logo component using public assets Logo-English.png.
 *
 * Size it with a height utility only (`h-16`, `md:h-20`). The artwork is
 * 342×210, trimmed to the mark, so the width has to stay `auto` for it to keep
 * its proportions.
 */
export default function Logo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <Image
      src="/assets/Logo-English.png"
      alt="Organishi — Pure Organic Food"
      width={342}
      height={210}
      className={`w-auto object-contain ${
        variant === "light" ? "brightness-0 invert" : ""
      } ${className}`}
      priority
    />
  );
}
