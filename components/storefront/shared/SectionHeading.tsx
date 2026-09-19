/**
 * Page and section titles for the contact and FAQ pages: a big 36px extrabold,
 * tight-tracked title on phones, the home page's 38px semibold from md.
 */
export default function SectionHeading({
  as: Tag = "h2",
  title,
  accent,
  description,
}: {
  as?: "h1" | "h2";
  title: string;
  accent?: string;
  description?: string;
}) {
  return (
    <div>
      <Tag className="font-display text-4xl font-extrabold leading-tight tracking-tight text-[#1f2a17] md:text-[38px] md:font-semibold md:tracking-normal">
        {title} {accent && <span className="text-brand">{accent}</span>}
      </Tag>
      <span aria-hidden className="mt-3 block h-1 w-12 rounded-full bg-brand-leaf" />
      {description && (
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-gray-600">{description}</p>
      )}
    </div>
  );
}
