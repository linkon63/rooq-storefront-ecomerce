import Link from "next/link";
import type { Messages } from "@/lib/i18n/messages";

type SareeAboutProps = { copy: Messages["home"]["sareeAbout"] };

/** Plain-text introduction to the shop, readable by shoppers and search engines on every screen size. */
export function SareeAbout({ copy }: SareeAboutProps) {
  return (
    <section aria-labelledby="saree-about" className="page-gutter flex flex-col gap-3">
      <h2 id="saree-about" className="type-h2">
        {copy.title}
      </h2>
      {copy.body.map((paragraph) => (
        <p key={paragraph} className="max-w-[70ch] text-stone">
          {paragraph}
        </p>
      ))}
      <Link href="/shop" className="w-fit underline underline-offset-4">
        {copy.link}
      </Link>
    </section>
  );
}
