import type { HeroBannerSlot } from "@/lib/constants/hero-banners";

/** Thumbnail of the home hero (large block left, two stacked right) with this slot filled in. */
export function HeroLayoutDiagram({ active }: { active: HeroBannerSlot["key"] }) {
  const block = (key: HeroBannerSlot["key"]) => `rounded-[3px] ${key === active ? "bg-blue-600" : "bg-slate-200"}`;
  return (
    <div aria-hidden className="grid h-11 w-20 shrink-0 grid-cols-[minmax(0,1fr)_32%] grid-rows-2 gap-1 rounded-md border border-slate-200 bg-white p-1">
      <div className={`row-span-2 ${block("main")}`} />
      <div className={block("top")} />
      <div className={block("bottom")} />
    </div>
  );
}
