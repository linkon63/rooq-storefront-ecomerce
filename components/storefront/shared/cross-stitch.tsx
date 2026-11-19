/** A single hand-sewn cross stitch (two crossed thread strokes), purely decorative. */
export function CrossStitch({ className = "", colour = "var(--color-dye)" }: { className?: string; colour?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke={colour} strokeWidth={3} strokeLinecap="round">
      <path d="M5 5 L19 19" />
      <path d="M19 5 L5 19" opacity={0.85} />
    </svg>
  );
}
