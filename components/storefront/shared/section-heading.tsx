import Link from "next/link";

type SectionHeadingProps = {
  title: string;
  id?: string;
  link?: { label: string; href: string };
};

/** Section title with an optional "See all" link on the same baseline. */
export function SectionHeading({ title, id, link }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
      <h2 id={id} className="font-wide text-[1.375rem] font-bold leading-tight md:text-3xl">
        {title}
      </h2>
      {link ? (
        <Link href={link.href} className="shrink-0 text-sm font-medium underline underline-offset-4 hover:text-dye-deep">
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}
