"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { SIZE_GROUPS } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import { moveItem } from "@/utils/catalog/form-values";
import type { AdminSize, SizeGroup } from "@/types/catalog-admin";
import { PageHeader } from "../../_components/admin-ui";
import { ConfirmModal } from "../../_components/confirm-modal";
import { useAsyncData } from "../_catalog/use-async-data";
import { ErrorBlock, LoadingBlock } from "../_catalog/data-states";
import { SizeFormModal } from "./_components/size-form-modal";
import { SizeGroupCard } from "./_components/size-group-card";

export default function SizesPage() {
  const sizes = useAsyncData(() => catalogApi.sizes.list(), "sizes");
  const [editing, setEditing] = useState<{ size: AdminSize | null; group: SizeGroup } | null>(null);
  const [deleting, setDeleting] = useState<AdminSize | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const grouped = useMemo(
    () => SIZE_GROUPS.map((group) => ({ group, sizes: (sizes.data ?? []).filter((size) => size.sizeGroup === group) })),
    [sizes.data],
  );

  async function move(group: AdminSize[], index: number, step: -1 | 1) {
    const next = moveItem(group, index, step);
    setBusy(true);
    try {
      sizes.setData(await catalogApi.sizes.reorder(next.map((size, position) => ({ id: size.id, sortOrder: position }))));
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await catalogApi.sizes.remove(deleting.id);
      toast.success(SUCCESS_MESSAGES.common.deleted("Size"));
      setDeleting(null);
      await sizes.reload();
    } catch (err) {
      setDeleteError(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  return (
    <div className="grid gap-6 pb-10">
      <PageHeader title="Sizes" description="Size runs per group. The order here is the order shoppers see in the size picker and filters." />
      {sizes.loading && !sizes.data ? <LoadingBlock label="Loading sizes" /> : null}
      {sizes.error ? <ErrorBlock message={sizes.error} onRetry={sizes.reload} /> : null}
      {sizes.data ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {grouped.map(({ group, sizes: list }) => (
            <SizeGroupCard
              key={group}
              group={group}
              sizes={list}
              busy={busy}
              onAdd={() => setEditing({ size: null, group })}
              onEdit={(size) => setEditing({ size, group })}
              onDelete={(size) => { setDeleteError(null); setDeleting(size); }}
              onMove={(index, step) => move(list, index, step)}
            />
          ))}
        </div>
      ) : null}
      {editing ? (
        <SizeFormModal size={editing.size} defaultGroup={editing.group} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void sizes.reload(); }} />
      ) : null}
      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete size"
        message={`Delete size "${deleting?.label ?? ""}"? Sizes used by variants or size charts cannot be deleted — deactivate them instead.`}
        confirmText="Delete"
        error={deleteError}
      />
    </div>
  );
}
