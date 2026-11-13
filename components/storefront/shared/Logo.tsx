import Image from "next/image";

/**
 * Rooq logo (green wordmark between magenta zigzag borders, from
 * `public/images/logo.jpg`). The cropped PNG is transparent, so the
 * `light` variant (for dark surfaces) sits it on a white badge; elsewhere it shows straight on the page.
 */
export default function Logo({
  className = "",
  variant = "dark",
  kechi = false,
}: {
  className?: string;
  variant?: "dark" | "light";
  /** Cropped "kechi" mark; `light` is the all-white version for dark surfaces. Storefront header and footer. */
  kechi?: boolean;
}) {
  if (kechi) {
    const src = variant === "light" ? "/images/logo-kechi-clear-white.png" : "/images/logo-kechi-clear.png";
    return <Image src={src} alt="Rooq" width={832} height={559} priority className={`${className.includes("w-") ? "" : "w-auto"} ${className}`} />;
  }
  return (
    <Image
      src="/images/logo-wordmark.png"
      alt="Rooq"
      width={570}
      height={350}
      priority
      className={`w-auto ${variant === "light" ? "rounded bg-white p-1" : ""} ${className}`}
    />
  );
}
