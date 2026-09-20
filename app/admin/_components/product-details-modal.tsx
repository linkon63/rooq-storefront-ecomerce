"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AdminIcon, type AdminIconName } from "./admin-icons";
import {
  formatMoney,
  resolveImageUrl,
  unitConversionLabel,
  type Product,
  type ProductVariant,
} from "../../../lib/admin-api";
import { variantOptionLabel } from "../../../lib/product-variants";

const statusStyles: Record<Product["status"], string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function productImages(product: Product) {
  return (product.media ?? [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => ({ id: item.id, url: resolveImageUrl(item.media.url) }));
}

function defaultVariantOf(product: Product): ProductVariant | undefined {
  return product.variants?.find((variant) => variant.isDefault) ?? product.variants?.[0];
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: AdminIconName;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <AdminIcon className="h-4 w-4" name={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-slate-800 break-words">{value}</div>
      </div>
    </div>
  );
}

export function ProductDetailsModal({
  product,
  currencySymbol,
  onClose,
}: {
  product: Product;
  currencySymbol?: string;
  onClose: () => void;
}) {
  const images = productImages(product);
  const [activeImage, setActiveImage] = useState(images[0]?.url ?? null);
  const variants = product.variants ?? [];
  const defaultVariant = defaultVariantOf(product);
  const totalStock = variants.reduce((sum, variant) => sum + (variant.stockQuantity ?? 0), 0);
  const unitHint = product.unit ? unitConversionLabel(product.unit) : null;
  const isVariantProduct = variants.some((variant) => variantOptionLabel(variant).length > 0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-labelledby="product-details-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className="text-lg font-semibold text-slate-900"
                id="product-details-title"
              >
                {product.name}
              </h2>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[product.status]}`}
              >
                {product.status}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {isVariantProduct ? `${variants.length} variants` : "Single product"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{product.slug}</p>
          </div>
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <div>
              <div className="aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={product.name}
                  className="h-full w-full object-cover"
                  src={activeImage ?? "/images/no-image-icon-6.png"}
                />
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImage(image.url)}
                      className={`h-14 w-14 overflow-hidden rounded-lg border transition-all ${
                        activeImage === image.url
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" className="h-full w-full object-cover" src={image.url} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">Retail price</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatMoney(defaultVariant?.price, currencySymbol)}
                  </p>
                  {defaultVariant?.discountedPrice ? (
                    <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                      Now {formatMoney(defaultVariant.discountedPrice, currencySymbol)}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">Total stock</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {totalStock.toLocaleString("en")}
                    <span className="ml-1 text-xs font-medium text-slate-400">pcs</span>
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">Cost</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatMoney(defaultVariant?.cost, currencySymbol)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Fact icon="brand" label="Brand" value={product.brand?.name ?? "-"} />
                <Fact icon="category" label="Category" value={product.category?.name ?? "-"} />
                <Fact
                  icon="units"
                  label="Unit"
                  value={
                    product.unit ? (
                      <>
                        {product.unit.name}
                        {unitHint && (
                          <span className="block text-xs font-medium text-slate-400">
                            {unitHint}
                          </span>
                        )}
                      </>
                    ) : (
                      "-"
                    )
                  }
                />
                <Fact icon="package" label="SKU" value={defaultVariant?.sku ?? "-"} />
                <Fact icon="calendar" label="Created" value={formatDate(product.createdAt)} />
                <Fact icon="refresh" label="Last updated" value={formatDate(product.updatedAt)} />
              </div>
            </div>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    <AdminIcon className="h-3.5 w-3.5" name="tag" />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Description</h3>
              <p className="whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>
            </div>
          )}

          {variants.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                {isVariantProduct ? "Variants" : "Stock"}
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-600">Variant</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-600">SKU</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-600">Price</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-600">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((variant) => {
                      const label = variantOptionLabel(variant);
                      const isLow =
                        (variant.stockQuantity ?? 0) <= (variant.stockAlertThreshold ?? 0);
                      return (
                        <tr key={variant.id}>
                          <td className="px-4 py-2.5 text-sm font-medium text-slate-700">
                            {label || "Default"}
                            {variant.isDefault && (
                              <span className="ml-2 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                                Default
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-slate-500">{variant.sku}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">
                            {formatMoney(variant.price, currencySymbol)}
                          </td>
                          <td
                            className={`px-4 py-2.5 text-sm font-semibold ${
                              isLow ? "text-red-600" : "text-slate-800"
                            }`}
                          >
                            {(variant.stockQuantity ?? 0).toLocaleString("en")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            href={`/admin/products/${product.id}/edit`}
          >
            <AdminIcon className="h-4 w-4" name="edit" />
            Edit Product
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
