import type { ProductDetail } from "@/types/storefront/catalog";
import { factRows } from "@/utils/storefront/product-facts";
import { Disclosure } from "../shared/disclosure";
import { DeliveryReturns } from "./delivery-returns";

/** Description, fabric & fit facts, care and delivery, as native disclosures (no JS). */
export function ProductDetails({ product, currency }: { product: ProductDetail; currency: string }) {
  const facts = factRows(product);
  return (
    <div className="border-t border-line">
      <Disclosure title="Details" open>
        {product.shortDescription ? <p className="mb-3 font-medium">{product.shortDescription}</p> : null}
        {product.description ? <p className="max-w-[68ch] whitespace-pre-line text-stone">{product.description}</p> : null}
        {product.features.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        ) : null}
        {product.modelInfo ? <p className="mt-3 text-stone">{product.modelInfo}</p> : null}
      </Disclosure>
      {facts.length ? (
        <Disclosure title="Fabric and fit">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            {facts.map((row) => (
              <div key={`${row.label}-${row.value}`} className="contents">
                <dt className="text-stone">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      ) : null}
      {product.careInstructions ? (
        <Disclosure title="Care">
          <p className="whitespace-pre-line">{product.careInstructions}</p>
        </Disclosure>
      ) : null}
      <Disclosure title="Delivery and returns">
        <DeliveryReturns delivery={product.delivery} currency={currency} />
      </Disclosure>
    </div>
  );
}
