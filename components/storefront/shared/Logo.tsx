import Image from "next/image";

/**
 * Organishi Brand Logo component using public assets Logo-English.png.
 *
 * Size it with a height utility only (`h-16`, `md:h-20`). The artwork is
 * 342×210, trimmed to the mark, so the width has to stay `auto` for it to keep
 * its proportions.
 */
/**
 * The ™ that sits beside the logo. Place it after the logo inside a flex row:
 * `self-start` lifts it to the top of the logo whatever height that renders at.
 * aria-hidden because the logo's alt text already names the brand. Pass a size
 * (`text-[11px] md:text-[13px]`) to suit the logo it sits next to.
 */
export function Trademark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`ml-0.5 select-none self-start font-gotham font-semibold leading-none text-brand-ink ${className}`}
    >
      ™
    </span>
  );
}

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
