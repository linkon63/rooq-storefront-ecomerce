import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
  /** Anchor id — also drives the "On this page" jump list. */
  id: string;
  heading: string;
  body: ReactNode;
};

interface LegalPageProps {
  title: string;
  /** Short line under the title, inside the content card. */
  intro: string;
  /** Human-readable date, e.g. "10 August 2026". */
  lastUpdated: string;
  sections: LegalSection[];
  /** Closing block — usually the "how to reach us" contact card. */
  footer?: ReactNode;
}

/**
 * Shared chrome for the policy pages. Privacy and Terms are the same document
 * shape — banner, jump list, numbered sections — so the layout lives here and
 * each page supplies only its copy.
 */
export default function LegalPage({
  title,
  intro,
  lastUpdated,
  sections,
  footer,
}: LegalPageProps) {
  return (
    <main className="w-full bg-brand-mist pb-16 md:pb-24">
      {/* ── Page banner ─────────────────────────────────────────────────── */}
      <section className="bg-[#1f2a17]">
        <div className="mx-auto max-w-[1600px] px-4 py-16 text-center md:px-8 lg:py-20">
          <h1 className="font-display text-[30px] leading-tight text-white md:text-[44px]">
            {title}
          </h1>
          <p className="mt-3 text-[14px] text-white/80">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="px-2">/</span>
            <span className="text-[#8fd06b]">{title}</span>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="-mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* Jump list — sticky beside the document on large screens. */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28 rounded-2xl border border-brand/20 bg-white p-6 shadow-sm">
              <p className="font-gotham text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                On this page
              </p>
              <ul className="mt-4 space-y-2.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-sm leading-snug text-gray-600 transition-colors hover:text-brand"
                    >
                      <span className="mr-1.5 text-gray-400">{index + 1}.</span>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="rounded-2xl border border-brand/20 bg-white p-6 shadow-lg sm:p-10 md:p-14">
            <p className="text-sm text-gray-500">
              Last updated:{" "}
              <span className="font-semibold text-[#1f2a17]">{lastUpdated}</span>
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-gray-700">{intro}</p>

            <div className="mt-10 space-y-10">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="font-display text-[22px] font-semibold text-[#1f2a17] sm:text-[26px]">
                    <span className="mr-2 text-brand">{index + 1}.</span>
                    {section.heading}
                  </h2>
                  <div className="legal-body mt-4 space-y-4 text-[15px] leading-relaxed text-gray-700">
                    {section.body}
                  </div>
                </section>
              ))}
            </div>

            {footer && <div className="mt-12 border-t border-brand/15 pt-10">{footer}</div>}
          </article>
        </div>
      </div>
    </main>
  );
}

/** Bulleted list with the brand tick, used throughout both policy documents. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
