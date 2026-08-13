import Image from "next/image";

/**
 * Organishi Brand Logo component using public assets Logo-English.png.
 *
 * Size it with a height utility only (`h-16`, `md:h-20`). The artwork is
 * 746×612, so a forced width letterboxes the mark inside a wider box and it
 * renders far smaller than the box suggests — the width has to stay `auto`.
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
      width={746}
      height={612}
      className={`w-auto object-contain ${
        variant === "light" ? "brightness-0 invert" : ""
      } ${className}`}
      priority
    />
  );
}
