"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { COLLECTION_TYPE_LABELS } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import { formatAdminDate } from "@/utils/catalog/form-values";
import type { AdminCollection } from "@/types/catalog-admin";
import { PageHeader } from "../../_components/admin-ui";
import { AdminIcon } from "../../_components/admin-icons";
import { ConfirmModal } from "../../_components/confirm-modal";
import { useAsyncData } from "../_catalog/use-async-data";
import { IconButton } from "../_catalog/button";
import { Card, DataTable, StatusPill } from "../_catalog/table";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../_catalog/data-states";

const linkButton = "inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700";

export default function CollectionsPage() {
  const list = useAsyncData(() => catalogApi.collections.list(), "collections");
  const [deleting, setDeleting] = useState<AdminCollection | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await catalogApi.collections.remove(deleting.id);
      toast.success(SUCCESS_MESSAGES.common.deleted("Collection"));
      setDeleting(null);
      await list.reload();
    } catch (err) {
      setDeleteError(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  return (
    <div className="grid gap-6 pb-10">
      <PageHeader
        title="Collections & lookbooks"
        description="Edits and lookbooks shoppers browse. New arrivals and Sale are automatic views, not collections."
        action={<Link href="/admin/collections/new" className={linkButton}><AdminIcon className="h-4 w-4" name="plus" />New collection</Link>}
      />
      <Card>
        {list.loading ? <LoadingBlock label="Loading collections" /> : null}
        {list.error ? <div className="p-4"><ErrorBlock message={list.error} onRetry={list.reload} /></div> : null}
        {!list.loading && !list.error && !list.data?.length ? (
          <EmptyBlock title="No collections yet" body="Group products into an edit like “Summer linen”, or build a lookbook with styled scenes." action={<Link href="/admin/collections/new" className={linkButton}>Create a collection</Link>} />
        ) : null}
        {list.data?.length ? (
          <DataTable headings={["Collection", "Type", "Products", "Looks", "Window", "Status", ""]}>
            {list.data.map((c) => (
              <tr key={c.id} className="odd:bg-white even:bg-slate-50/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/collections/${c.id}`} className="flex items-center gap-3 font-medium text-slate-900 hover:text-blue-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {c.coverImageUrl ? <img src={c.coverImageUrl} alt="" className="h-10 w-10 rounded object-cover" /> : <span className="h-10 w-10 rounded bg-slate-100" />}
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{COLLECTION_TYPE_LABELS[c.type]}</td>
                <td className="px-4 py-3 tabular-nums text-slate-600">{c.productCount}</td>
                <td className="px-4 py-3 tabular-nums text-slate-600">{c.lookCount}</td>
                <td className="px-4 py-3 text-slate-600">{c.startsAt || c.endsAt ? `${formatAdminDate(c.startsAt)} – ${formatAdminDate(c.endsAt)}` : "Always"}</td>
                <td className="px-4 py-3">
                  <span className="flex gap-1">
                    {c.isActive ? <StatusPill tone="green">Active</StatusPill> : <StatusPill tone="slate">Hidden</StatusPill>}
                    {c.isFeatured ? <StatusPill tone="blue">Featured</StatusPill> : null}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <IconButton label={`Delete ${c.name}`} onClick={() => { setDeleteError(null); setDeleting(c); }}><AdminIcon className="h-4 w-4" name="trash" /></IconButton>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : null}
      </Card>
      <ConfirmModal isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} title="Delete collection" message={`Delete "${deleting?.name ?? ""}" and its looks? The products themselves are not deleted.`} confirmText="Delete" error={deleteError} />
    </div>
  );
}
