"use client";

import Link from "next/link";
import { catalogApi } from "@/lib/admin-api/catalog";
import { PageHeader } from "../../../_components/admin-ui";
import { useAsyncData } from "../../_catalog/use-async-data";
import { ErrorBlock, LoadingBlock } from "../../_catalog/data-states";
import { StatusPill } from "../../_catalog/table";
import { loadProductLookups } from "./lookups";
import { ProductForm } from "./product-form";
import { VariantsPanel } from "./variants-panel";
import { GalleryPanel } from "./gallery-panel";

/** New (id = null) or edit. Variants and gallery appear once the product exists. */
export function ProductEditor({ id }: { id: string | null }) {
  const data = useAsyncData(
    () => Promise.all([loadProductLookups(), id ? catalogApi.products.get(id) : Promise.resolve(null)]).then(([lookups, product]) => ({ lookups, product })),
    `product:${id ?? "new"}`,
  );
  const product = data.data?.product ?? null;

  return (
    <div className="grid gap-5 pb-4">
      <PageHeader
        title={product?.name ?? "New product"}
        description={product ? `/${product.slug}` : "Add a fashion product: details first, then sizes, colours and photos."}
        action={product ? (
          <span className="flex items-center gap-2">
            {product.archivedAt ? <StatusPill tone="red">Archived</StatusPill> : null}
            {product.status === "active" && !product.archivedAt ? <Link className="text-sm font-semibold text-blue-700 hover:underline" href={`/product/${product.slug}`} target="_blank">View in shop</Link> : null}
          </span>
        ) : undefined}
      />
      {data.loading && !data.data ? <LoadingBlock label="Loading product" /> : null}
      {data.error ? <ErrorBlock message={data.error} onRetry={data.reload} /> : null}
      {data.data ? (
        <>
          <ProductForm key={product?.id ?? "new"} product={product} lookups={data.data.lookups} onSaved={(saved) => data.setData((d) => d && { ...d, product: saved })} />
          {product ? <VariantsPanel productId={product.id} colors={data.data.lookups.colors} sizes={data.data.lookups.sizes} /> : null}
          {product ? <GalleryPanel productId={product.id} initial={product.media} colors={data.data.lookups.colors} /> : null}
        </>
      ) : null}
    </div>
  );
}
