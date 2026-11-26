import { COPY } from "@/lib/constants/storefront-copy";
import { getFacebookReviews } from "@/lib/storefront/catalog-data";
import { SectionHeading } from "../shared/section-heading";
import { FacebookReviewsList } from "./facebook-reviews-list";

/** The home page shows this many; the rest are in the customer gallery. */
const HOME_REVIEW_LIMIT = 4;

/** Newest Facebook reviews, with a link to every review. Renders nothing without any. */
export async function FacebookReviews() {
  const [entries] = await Promise.all([getFacebookReviews(HOME_REVIEW_LIMIT)]);
  const t = COPY;
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby="facebook-reviews-title" className="page-gutter">
      <SectionHeading
        id="facebook-reviews-title"
        title={t.home.facebookReviews}
        link={{ label: t.home.seeAllReviews, href: "/customer-gallery" }}
      />
      <FacebookReviewsList entries={entries} />
    </section>
  );
}
