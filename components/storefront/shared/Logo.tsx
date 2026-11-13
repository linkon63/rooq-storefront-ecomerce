import Image from "next/image";

/**
 * Rooq logo (green wordmark between magenta zigzag borders, from
 * `public/images/logo.jpg`). The cropped PNG is transparent, so the
 * `light` variant (for dark surfaces) sits it on a white badge; elsewhere it shows straight on the page.
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
      src="/images/logo-wordmark.png"
      alt="Rooq"
      width={570}
      height={350}
      priority
      className={`w-auto ${variant === "light" ? "rounded bg-white p-1" : ""} ${className}`}
    />
  );
}
