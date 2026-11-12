"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { DEPARTMENT_LABELS } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import type { AdminSizeChart } from "@/types/catalog-admin";
import { PageHeader } from "../../_components/admin-ui";
import { AdminIcon } from "../../_components/admin-icons";
import { ConfirmModal } from "../../_components/confirm-modal";
import { useAsyncData } from "../_catalog/use-async-data";
import { IconButton } from "../_catalog/button";
import { Card, DataTable, StatusPill } from "../_catalog/table";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../_catalog/data-states";

const linkButton = "inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700";

export default function SizeChartsPage() {
  const charts = useAsyncData(() => catalogApi.sizeCharts.list(), "size-charts");
  const [deleting, setDeleting] = useState<AdminSizeChart | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await catalogApi.sizeCharts.remove(deleting.id);
      toast.success(SUCCESS_MESSAGES.common.deleted("Size chart"));
      setDeleting(null);
      await charts.reload();
    } catch (err) {
      setDeleteError(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  return (
    <div className="grid gap-6 pb-10">
      <PageHeader
        title="Size charts"
        description="Size guides per category or product, stored in cm with an inches toggle for shoppers."
        action={<Link href="/admin/size-charts/new" className={linkButton}><AdminIcon className="h-4 w-4" name="plus" />New chart</Link>}
      />
      <Card>
        {charts.loading ? <LoadingBlock label="Loading size charts" /> : null}
        {charts.error ? <div className="p-4"><ErrorBlock message={charts.error} onRetry={charts.reload} /></div> : null}
        {!charts.loading && !charts.error && !charts.data?.length ? (
          <EmptyBlock title="No size charts yet" body="Create a chart, then attach it to categories so every product in them shows a size guide." action={<Link href="/admin/size-charts/new" className={linkButton}>Create a chart</Link>} />
        ) : null}
        {charts.data?.length ? (
          <DataTable headings={["Chart", "Department", "Sizes", "Measurements", "Categories", "Products", "Status", ""]}>
            {charts.data.map((chart) => (
              <tr key={chart.id} className="odd:bg-white even:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-900"><Link className="hover:text-blue-700" href={`/admin/size-charts/${chart.id}`}>{chart.name}</Link></td>
                <td className="px-4 py-3 text-slate-600">{chart.department ? DEPARTMENT_LABELS[chart.department] : "Any"}</td>
                <td className="px-4 py-3 text-slate-600">{chart.rows.map((r) => r.sizeLabel).join(", ") || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{chart.columns.join(", ") || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{chart.categories?.map((c) => c.name).join(", ") || "—"}</td>
                <td className="px-4 py-3 tabular-nums text-slate-600">{chart.productCount ?? 0}</td>
                <td className="px-4 py-3">{chart.isActive ? <StatusPill tone="green">Active</StatusPill> : <StatusPill tone="slate">Hidden</StatusPill>}</td>
                <td className="px-4 py-3">
                  <span className="flex gap-1">
                    <Link aria-label={`Edit ${chart.name}`} title="Edit" href={`/admin/size-charts/${chart.id}`} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><AdminIcon className="h-4 w-4" name="edit" /></Link>
                    <IconButton label={`Delete ${chart.name}`} onClick={() => { setDeleteError(null); setDeleting(chart); }}><AdminIcon className="h-4 w-4" name="trash" /></IconButton>
                  </span>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : null}
      </Card>
      <ConfirmModal isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} title="Delete size chart" message={`Delete "${deleting?.name ?? ""}"? Categories and products using it will show no size guide until another chart is attached.`} confirmText="Delete" error={deleteError} />
    </div>
  );
}
