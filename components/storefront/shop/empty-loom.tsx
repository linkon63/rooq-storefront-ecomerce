import Link from "next/link";

type EmptyLoomProps = {
  title: string;
  body: string;
  action: { label: string; href: string };
};

const WARP = Array.from({ length: 11 }, (_, i) => 70 + i * 18);

/**
 * Empty results: a bare loom with one loose weft thread. The thread sways on
 * its own and tugs when the action is hovered or focused (CSS sibling rule
 * in craft.css, so the action must come first in the DOM).
 */
export function EmptyLoom({ title, body, action }: EmptyLoomProps) {
  return (
    <div className="flex flex-col items-start gap-6 py-10 md:flex-row md:items-center md:gap-12 md:py-16">
      <div className="empty-actions flex flex-col items-start gap-3 md:order-last md:max-w-[34ch]">
        <h2 className="type-h2">{title}</h2>
        <p className="type-body text-stone">{body}</p>
        <Link
          href={action.href}
          className="type-ui mt-2 inline-flex h-11 items-center rounded bg-ink px-5 text-chalk transition-colors hover:bg-ink/80"
        >
          {action.label}
        </Link>
      </div>
      <svg aria-hidden viewBox="0 0 320 200" className="order-first w-full max-w-[22rem] shrink-0 md:order-none" fill="none">
        <g stroke="var(--color-ink)" strokeWidth={6} strokeLinecap="round">
          <path d="M40 30 V180" />
          <path d="M280 30 V180" />
          <path d="M34 30 H286" />
          <path d="M34 172 H286" />
        </g>
        <g stroke="var(--color-gold)" strokeWidth={1.4}>
          {WARP.map((x) => (
            <path key={x} d={`M${x} 32 V170`} />
          ))}
        </g>
        <path d="M66 150 H254 V170 H66 Z" fill="var(--color-dye)" opacity={0.85} />
        <path d="M66 156 H254 M66 163 H254" stroke="var(--color-gold)" strokeWidth={1.4} strokeDasharray="6 5" />
        <g className="empty-thread">
          <path d="M160 40 C150 70 190 90 172 118 C166 130 176 138 172 146" stroke="var(--color-dye-deep)" strokeWidth={2.2} strokeLinecap="round" />
          <circle cx={172} cy={148} r={3} fill="var(--color-dye-deep)" />
        </g>
      </svg>
    </div>
  );
}
