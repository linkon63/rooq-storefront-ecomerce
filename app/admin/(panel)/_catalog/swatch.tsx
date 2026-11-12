import { isLightColor } from "@/utils/color";

export function Swatch({ hex, name, size = "md" }: { hex: string; name: string; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <span
      title={name}
      aria-label={name}
      className={`inline-block shrink-0 rounded-full ${box} ${isLightColor(hex) ? "ring-1 ring-slate-300" : ""}`}
      style={{ backgroundColor: hex }}
    />
  );
}
