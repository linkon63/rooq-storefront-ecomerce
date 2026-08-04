import HeroClient from './HeroClient';
import type { SliderItem } from '@/types/campain';
import { fetchShopCampaigns, type ShopProduct } from '@/lib/shop-api';

const PLACEHOLDER = '/assets/image/placeholder.png';

const FALLBACK_SLIDE: SliderItem = {
  type: 'product',
  image: PLACEHOLDER,
  title: 'Pure organic food, straight from the farm',
  description:
    'Cold pressed oils, hand-churned ghee and raw honey — sourced directly from the farmers who make them.',
  productId: 0,
  productImages: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
};

/**
 * Hero slides come from the active campaigns, with the newest product appended
 * as a final slide. Falls back to one static slide when the API has nothing.
 */
async function buildHeroSlides(products: ShopProduct[]): Promise<SliderItem[]> {
  const sliderItems: SliderItem[] = [];

  const campaigns = await fetchShopCampaigns();
  for (const campaign of campaigns) {
    for (const image of campaign.images) {
      sliderItems.push({ type: 'campaign', image });
    }
  }

  const latestProduct = products[0];
  if (latestProduct?.image) {
    // The slider renders three thumbnails, so repeat what we have when short.
    let productImages = [latestProduct.image];
    while (productImages.length < 3) {
      productImages = [...productImages, ...productImages].slice(0, 3);
    }

    sliderItems.push({
      type: 'product',
      image: latestProduct.image,
      title: latestProduct.name,
      description: `${latestProduct.category || 'Organic'} · from ৳${latestProduct.price}`,
      productId: latestProduct.slug,
      productImages,
    });
  }

  return sliderItems.length > 0 ? sliderItems : [FALLBACK_SLIDE];
}

export default async function Hero({ products = [] }: { products?: ShopProduct[] }) {
  const sliderItems = await buildHeroSlides(products);

  return <HeroClient sliderItems={sliderItems} />;
}
