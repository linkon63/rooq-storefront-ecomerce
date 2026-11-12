"use client";

import { useMemo, useState } from "react";
import { flattenCategories, type CategoryRow as Row } from "@/utils/admin/category-tree";
import { PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { InfiniteScroll } from "../../_components/infinite-scroll";
import { AddButton } from "../../_components/list/add-button";
import { SearchToggle } from "../../_components/list/search-toggle";
import { TableStateRow } from "../../_components/list/table-state-row";
import { useClientList } from "../../_hooks/use-client-list";
import { CategoryFormModal } from "./_components/category-form-modal";
import { CategoryRow } from "./_components/category-row";
import { ReorderStatus } from "./_components/reorder-status";
import { useCategories, categoryToForm, EMPTY_CATEGORY_FORM, type CategoryForm } from "./_hooks/use-categories";
import { useCategoryDrag } from "./_hooks/use-category-drag";

const HEADINGS = ["Name", "Image", "Slug", "Parent", "Products", "Created", "Actions"];
const PAGE_SIZE = 8;
const rowText = (row: Row) => `${row.name} ${row.slug} ${row.parentName}`;

export default function CategoriesPage() {
  const data = useCategories();
  const rows = useMemo(() => flattenCategories(data.categories), [data.categories]);
  const list = useClientList(rows, rowText, PAGE_SIZE);
  const drag = useCategoryDrag(data.categories, (tree) => void data.reorder(tree));
  const [editing, setEditing] = useState<CategoryForm | null>(null);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  // Reordering only works on the unfiltered list, so the tree we move matches what is shown.
  const searching = list.search.trim() !== "";
  const canReorder = !searching && !data.isReordering;

  const open = (form: CategoryForm) => {
    data.setError("");
    setEditing(form);
  };

  return (
    <>
      <PageHeader
        action={
          <div className="flex items-center gap-3">
            <SearchToggle label="Search categories" onChange={list.setSearch} value={list.search} />
            <AddButton label="Add Category" onClick={() => open(EMPTY_CATEGORY_FORM)} />
          </div>
        }
        description="Create, update, reorder and nest product categories."
        title="Category"
      />
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-medium text-slate-500">
            {list.filtered.length} {list.filtered.length === 1 ? "category" : "categories"}
          </p>
          <ReorderStatus canReorder={canReorder} isReordering={data.isReordering} searching={searching} />
        </div>
        {data.error && !editing && !toDelete ? <p className="mx-5 my-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{data.error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th aria-label="Reorder" className="w-10 px-2 py-4" scope="col" />
                {HEADINGS.map((h) => (
                  <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.isLoading ? (
                <TableStateRow colSpan={HEADINGS.length + 1}>Loading categories…</TableStateRow>
              ) : list.filtered.length === 0 ? (
                <TableStateRow colSpan={HEADINGS.length + 1}>No categories found.</TableStateRow>
              ) : (
                list.visible.map((row) => (
                  <CategoryRow
                    canReorder={canReorder}
                    category={row}
                    indicator={drag.indicatorFor(row.id)}
                    isDragging={drag.draggingId === row.id}
                    key={row.id}
                    onDelete={() => setToDelete(row)}
                    onDragEnd={drag.end}
                    onDragOver={drag.over}
                    onDragStart={drag.start}
                    onDrop={drag.drop}
                    onEdit={() => open(categoryToForm(row))}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!data.isLoading && list.filtered.length > 0 ? (
          <InfiniteScroll
            allLoadedLabel="All categories loaded"
            hasMore={list.hasMore}
            isLoading={false}
            itemLabel="categories"
            loaded={list.visible.length}
            onLoadMore={list.loadMore}
            total={list.filtered.length}
          />
        ) : null}
      </section>
      {editing ? (
        <CategoryFormModal
          busy={data.isSaving}
          error={data.error}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            if (await data.save(form)) setEditing(null);
          }}
          rows={rows}
        />
      ) : null}
      <ConfirmModal
        cancelText="No"
        confirmText="Yes"
        error={data.error}
        isDestructive
        isOpen={!!toDelete}
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
        onClose={() => {
          setToDelete(null);
          data.setError("");
        }}
        onConfirm={async () => {
          if (toDelete && (await data.remove(toDelete))) setToDelete(null);
        }}
        title="Delete Category"
      />
    </>
  );
}
