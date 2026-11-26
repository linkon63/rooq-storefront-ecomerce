import { HOME_PAGE_KEY, SECTION_GUIDE, SECTION_HIDDEN_NOTE } from "@/lib/constants/content";
import type { CampaignSection } from "@/types/admin/content";

/** Where a section's campaigns appear on the website, and what they need. */
export function SectionHint({ section }: { section: Pick<CampaignSection, "title" | "page"> }) {
  const guide = section.page === HOME_PAGE_KEY ? SECTION_GUIDE.find((g) => g.title === section.title) : undefined;
  if (!guide) return <span className="block text-xs font-medium text-amber-700">{SECTION_HIDDEN_NOTE}</span>;
  return (
    <span className="block text-xs font-medium text-slate-500">
      <span className="text-slate-700">Shows: {guide.where}</span> {guide.howTo}
    </span>
  );
}
