import type { ReactNode } from "react";

/** Native <details> disclosure: keyboard and screen-reader support with no JS. */
export function Disclosure({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex list-none items-center justify-between py-4 font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-xl leading-none transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="pb-5 text-[0.9375rem] leading-relaxed">{children}</div>
    </details>
  );
}
