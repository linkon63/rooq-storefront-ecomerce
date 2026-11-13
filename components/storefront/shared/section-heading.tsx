import Link from "next/link";

type SectionHeadingProps = {
  title: string;
  id?: string;
  link?: { label: string; href: string };
};

/** Section title with an optional "See all" link on the same baseline. */
export function SectionHeading({ title, id, link }: SectionHeadingProps) {
  return (
    <div className="section-head flex items-end justify-between gap-4">
      <h2 id={id} className="type-h2">
        {title}
      </h2>
      {link ? (
        <Link href={link.href} className="type-label shrink-0 underline underline-offset-4 hover:opacity-60">
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}
