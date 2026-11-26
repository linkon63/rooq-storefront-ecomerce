import { SnapSlider } from "@/components/storefront/shared/snap-slider";
import { COPY } from "@/lib/constants/storefront-copy";
import { getSaleCountdowns, getStoreSettings } from "@/lib/storefront/catalog-data";
import { SaleSlide } from "./sale-slide";

const SALE_SLIDE_MS = 7000;

/**
 * The home offers banner: every live campaign filed under the Sale Countdown
 * section (admin → Settings → Campaigns), one slide each, ending soonest first.
 * Renders nothing when no such sale is running.
 */
export async function SaleCountdown() {
  const [sales, settings] = await Promise.all([getSaleCountdowns(), getStoreSettings()]);
  const t = COPY;
  if (sales.length === 0) return null;

  return (
    <section className="page-gutter">
      <SnapSlider label={t.home.offers} dotLabel={t.home.goToSlide} interval={SALE_SLIDE_MS}>
        {sales.map((sale) => (
          <SaleSlide key={sale.id} sale={sale} currency={settings.currency} />
        ))}
      </SnapSlider>
    </section>
  );
}
