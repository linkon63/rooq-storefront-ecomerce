import Link from "next/link";
import type { Faq } from "@/utils/storefront/faqs";
import { Disclosure } from "../shared/disclosure";

/**
 * Home page questions: a short intro and a link to the help page on one
 * side, the first questions as open/close rows on the other.
 */
export function HomeFaq({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <section aria-labelledby="home-faq-title" className="page-gutter">
      <div className="grid gap-8 bg-selvedge/30 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-12 md:p-10 lg:p-14">
        <div className="flex flex-col items-start gap-4">
          <p className="type-label text-dye">Need help?</p>
          <h2 id="home-faq-title" className="type-h2">
            Questions and answers
          </h2>
          <p className="max-w-[40ch] text-[0.9375rem] leading-relaxed text-stone">
            Sizing, delivery, cash on delivery and returns — the things shoppers ask us most.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/faq" className="type-label inline-flex h-11 items-center bg-ink px-5 text-chalk transition-colors hover:bg-dye">
              All questions
            </Link>
            <Link href="/contact" className="type-label inline-flex h-11 items-center border border-ink px-5 transition-colors hover:bg-ink hover:text-chalk">
              Ask us
            </Link>
          </div>
        </div>
        <div className="border-t border-line">
          {faqs.map((faq, index) => (
            <Disclosure key={faq.question} title={faq.question} open={index === 0}>
              <p className="max-w-[64ch] text-stone">{faq.answer}</p>
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}
