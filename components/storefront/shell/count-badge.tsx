import type { Ref } from "react";

/** Small black count on a header icon (white figures for contrast); hidden at zero. */
export function CountBadge({ count, badgeRef }: { count: number; badgeRef?: Ref<HTMLSpanElement> }) {
  if (count <= 0) return null;
  return (
    <span
      ref={badgeRef}
      className="absolute right-0.5 top-0.5 grid min-w-[1.125rem] place-items-center rounded-full bg-black px-1 text-[0.625rem] font-semibold leading-[1.125rem] text-white tabular-nums"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
