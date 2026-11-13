import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About us",
  description: "Rooq brings handloom tant sarees straight from Bangladeshi weavers, woven on real looms.",
};

const PROMISES = [
  { title: "Straight from the loom", body: "Every tant saree comes from weaving families in Tangail, Shantipur and Pabna, not from a power mill." },
  { title: "Original handloom", body: "Hand-thrown shuttles, real cotton and zari borders. Small irregularities are the mark of a hand, not a flaw." },
  { title: "Fair to the weaver", body: "We buy directly, so more of what you pay reaches the people at the loom." },
] as const;

export default function AboutPage() {
  return (
    <div className="page-gutter flex flex-col gap-12 pt-8 md:pt-12">
      <header className="flex max-w-[60ch] flex-col gap-5">
        <h1 className="font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">About Rooq</h1>
        <p className="type-lead text-stone">
          Rooq began with one tant saree, bought from the weaver who made it. We still work that way: we travel to the
          looms, choose each piece by hand and bring it to you as it left the weaver&apos;s home — original, handwoven and
          made to be worn.
        </p>
      </header>
      <ul className="grid gap-[3px] md:grid-cols-3">
        {PROMISES.map((promise) => (
          <li key={promise.title} className="flex flex-col gap-3 bg-selvedge/40 p-6">
            <h2 className="type-h3">{promise.title}</h2>
            <p className="text-[0.9375rem] leading-relaxed">{promise.body}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className="type-label inline-flex h-12 items-center bg-ink px-6 text-chalk hover:bg-ink-soft">
          Shop the collection
        </Link>
        <Link href="/contact" className="type-label inline-flex h-12 items-center border border-ink px-6 hover:bg-ink hover:text-chalk">
          Contact us
        </Link>
      </div>
    </div>
  );
}
