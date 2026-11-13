import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";
import type { HeroCampaign } from "@/types/storefront/content";

/**
 * Campaign mode: the live hero campaign as one banner, its first image beside
 * its title, story and call to action (all edited in the admin under Campaigns).
 */
export async function HeroCampaignBanner({ campaign, returnDays }: { campaign: HeroCampaign; returnDays: number }) {
  const { t } = await getMessages();
  const image = campaign.images[0];
  return (
    <section aria-labelledby="hero-title" className="grid bg-white md:grid-cols-2">
      <div className="relative aspect-[4/5] bg-selvedge/40 md:aspect-auto md:min-h-[min(80svh,46rem)]">
        {image ? <Image src={image.url} alt={image.alt ?? ""} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /> : null}
      </div>
      <div className="page-gutter flex flex-col justify-center gap-6 py-12 md:px-12 lg:px-16">
        <h1 id="hero-title" className="type-display text-[clamp(2.75rem,6vw,5.5rem)]">
          {campaign.title}
        </h1>
        {campaign.description ? (
          <p className="type-lead max-w-[42ch] text-stone">
            {campaign.description} {t.home.freeReturns(returnDays)}
          </p>
        ) : null}
        {campaign.linkUrl ? (
          <Link href={campaign.linkUrl} className="type-label inline-flex h-12 w-fit items-center bg-ink px-6 text-chalk transition-colors duration-300 hover:bg-ink/80">
            {campaign.linkLabel ?? t.home.shopNow}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
