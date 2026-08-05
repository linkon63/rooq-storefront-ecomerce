import Image from "next/image";

/**
 * Organishi Brand Logo component using public assets Logo-English.png.
 */
export default function Logo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      <Image
        src="/assets/Logo-English.png"
        alt="Organishi — Pure Organic Food"
        width={200}
        height={64}
        className={`h-full w-auto object-contain ${variant === "light" ? "brightness-0 invert" : ""}`}
        priority
      />
    </div>
  );
}
