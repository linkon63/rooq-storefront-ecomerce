const FULL_AT = 6;

/**
 * "Only 3 left": a thread spool whose winding is as full as the stock. With
 * stock this low, the less is left the barer the spool.
 */
export function StockSpool({ left }: { left: number }) {
  const fill = Math.max(0.12, Math.min(1, left / FULL_AT));
  const height = 24 * fill;
  return (
    <p className="flex items-center gap-2.5 text-sm font-semibold text-dye-deep" role="status" data-panda-low-stock={left}>
      <svg aria-hidden viewBox="0 0 28 36" className="h-9 w-7 shrink-0">
        <rect x={2} y={2} width={24} height={4} rx={1.5} fill="var(--color-ink)" />
        <rect x={2} y={30} width={24} height={4} rx={1.5} fill="var(--color-ink)" />
        <rect x={10} y={6} width={8} height={24} fill="var(--color-line)" />
        <rect x={6} y={30 - height} width={16} height={height} rx={1.5} fill="var(--color-dye)" />
        <path
          d={Array.from({ length: Math.max(1, Math.floor(height / 4)) }, (_, i) => `M6 ${30 - 3 - i * 4} H22`).join(" ")}
          stroke="var(--color-dye-deep)"
          strokeWidth={0.8}
          opacity={0.55}
        />
      </svg>
      Only {left} left in this size
    </p>
  );
}
