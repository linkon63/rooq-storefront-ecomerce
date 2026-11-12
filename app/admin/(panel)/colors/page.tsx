"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { errorText } from "@/utils/error-text";
import type { AdminColor } from "@/types/catalog-admin";
import { PageHeader } from "../../_components/admin-ui";
import { AdminIcon } from "../../_components/admin-icons";
import { ConfirmModal } from "../../_components/confirm-modal";
import { useAsyncData } from "../_catalog/use-async-data";
import { Button } from "../_catalog/button";
import { Card, DataTable } from "../_catalog/table";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../_catalog/data-states";
import { TextInput } from "../_catalog/field";
import { ColorFormModal } from "./_components/color-form-modal";
import { ColorRow } from "./_components/color-row";

export default function ColorsPage() {
  const colors = useAsyncData(() => catalogApi.colors.list(), "colors");
  const [editing, setEditing] = useState<AdminColor | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminColor | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (colors.data ?? []).filter((c) => !term || c.name.toLowerCase().includes(term) || (c.family ?? "").toLowerCase().includes(term));
  }, [colors.data, search]);

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await catalogApi.colors.remove(deleting.id);
      toast.success(SUCCESS_MESSAGES.common.deleted("Colour"));
      setDeleting(null);
      await colors.reload();
    } catch (err) {
      setDeleteError(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  return (
    <div className="grid gap-6 pb-10">
      <PageHeader
        title="Colours"
        description="The colour master behind every swatch, variant and the shop's colour filter."
        action={<Button onClick={() => setEditing("new")}><AdminIcon className="h-4 w-4" name="plus" />New colour</Button>}
      />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <p className="text-sm text-slate-500">{visible.length} colours</p>
          <div className="w-64"><TextInput type="search" placeholder="Search name or family" aria-label="Search colours" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
        {colors.loading ? <LoadingBlock label="Loading colours" /> : null}
        {colors.error ? <div className="p-4"><ErrorBlock message={colors.error} onRetry={colors.reload} /></div> : null}
        {!colors.loading && !colors.error && !visible.length ? (
          <EmptyBlock title="No colours yet" body="Add the colours you sell. Variants, swatches and colour galleries all pick from this list." action={<Button onClick={() => setEditing("new")}>Add a colour</Button>} />
        ) : null}
        {!colors.loading && visible.length ? (
          <DataTable headings={["Colour", "Hex", "Family", "Variants", "Order", "Status", ""]}>
            {visible.map((color) => (
              <ColorRow key={color.id} color={color} onEdit={() => setEditing(color)} onDelete={() => { setDeleteError(null); setDeleting(color); }} />
            ))}
          </DataTable>
        ) : null}
      </Card>
      {editing ? (
        <ColorFormModal
          color={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void colors.reload(); }}
        />
      ) : null}
      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete colour"
        message={`Delete "${deleting?.name ?? ""}"? Colours used by variants cannot be deleted — deactivate them instead.`}
        confirmText="Delete"
        error={deleteError}
      />
    </div>
  );
}
