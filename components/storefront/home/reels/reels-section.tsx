import { COPY } from "@/lib/constants/storefront-copy";
import { getHomeReels } from "@/lib/storefront/catalog-data";
import { SectionHeading } from "../../shared/section-heading";
import { ReelCard } from "./reel-card";
import { ReelProductLink } from "./reel-product-link";

/** Home page reels: a swipeable strip on phones, four across from md up. Renders nothing without any. */
export async function ReelsSection() {
  const reels = await getHomeReels();
  if (reels.length === 0) return null;
  const copy = COPY.home.reels;
  return (
    <section aria-labelledby="home-reels" className="page-gutter">
      <SectionHeading id="home-reels" title={copy.title} />
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
        {reels.map(({ id, videoUrl, product }) => (
          <li key={id} className="flex w-[62%] shrink-0 snap-start flex-col gap-3 md:w-auto">
            <ReelCard
              src={videoUrl}
              poster={product.image?.url}
              playLabel={copy.play.replace("{name}", product.name)}
              pauseLabel={copy.pause.replace("{name}", product.name)}
            />
            <ReelProductLink product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
