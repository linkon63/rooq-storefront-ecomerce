"use client";

import { useState } from "react";
import type { Brand } from "@/types/admin/catalog";
import { PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { InfiniteScroll } from "../../_components/infinite-scroll";
import { AddButton } from "../../_components/list/add-button";
import { SearchToggle } from "../../_components/list/search-toggle";
import { TableStateRow } from "../../_components/list/table-state-row";
import { useClientList } from "../../_hooks/use-client-list";
import { BrandFormModal } from "./_components/brand-form-modal";
import { BrandRow } from "./_components/brand-row";
import { EMPTY_BRAND_FORM, brandToForm, useBrands, type BrandForm } from "./_hooks/use-brands";

const HEADINGS = ["Name", "Logo", "Slug", "Products", "Created", "Actions"];
const brandText = (brand: Brand) => `${brand.name} ${brand.slug}`;

export default function BrandsPage() {
  const { brands, isLoading, isSaving, error, setError, save, remove } = useBrands();
  const list = useClientList(brands, brandText);
  const [editing, setEditing] = useState<BrandForm | null>(null);
  const [toDelete, setToDelete] = useState<Brand | null>(null);

  const open = (form: BrandForm) => {
    setError("");
    setEditing(form);
  };

  return (
    <>
      <PageHeader
        action={
          <div className="flex items-center gap-3">
            <SearchToggle label="Search brands" onChange={list.setSearch} value={list.search} />
            <AddButton label="Add Brand" onClick={() => open(EMPTY_BRAND_FORM)} />
          </div>
        }
        description="Create, update, and remove product brands."
        title="Brands"
      />
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-500">
            {list.filtered.length} {list.filtered.length === 1 ? "brand" : "brands"}
          </p>
        </div>
        {error && !editing && !toDelete ? <p className="mx-5 my-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {HEADINGS.map((h) => (
                  <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableStateRow colSpan={HEADINGS.length}>Loading brands…</TableStateRow>
              ) : list.filtered.length === 0 ? (
                <TableStateRow colSpan={HEADINGS.length}>No brands found.</TableStateRow>
              ) : (
                list.visible.map((brand) => (
                  <BrandRow brand={brand} key={brand.id} onDelete={() => setToDelete(brand)} onEdit={() => open(brandToForm(brand))} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && list.filtered.length > 0 ? (
          <InfiniteScroll
            allLoadedLabel="All brands loaded"
            hasMore={list.hasMore}
            isLoading={false}
            itemLabel="brands"
            loaded={list.visible.length}
            onLoadMore={list.loadMore}
            total={list.filtered.length}
          />
        ) : null}
      </section>
      {editing ? (
        <BrandFormModal
          busy={isSaving}
          error={error}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            if (await save(form)) setEditing(null);
          }}
        />
      ) : null}
      <ConfirmModal
        cancelText="No"
        confirmText="Yes"
        error={error}
        isDestructive
        isOpen={!!toDelete}
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onClose={() => {
          setToDelete(null);
          setError("");
        }}
        onConfirm={async () => {
          if (toDelete && (await remove(toDelete))) setToDelete(null);
        }}
        title="Delete Brand"
      />
    </>
  );
}
