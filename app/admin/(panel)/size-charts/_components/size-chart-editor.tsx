"use client";

import { catalogApi } from "@/lib/admin-api/catalog";
import { flattenCategoryTree } from "@/utils/catalog/category-options";
import { PageHeader } from "../../../_components/admin-ui";
import { useAsyncData } from "../../_catalog/use-async-data";
import { ErrorBlock, LoadingBlock } from "../../_catalog/data-states";
import { SizeChartForm } from "./size-chart-form";

/** Loads the chart (when editing), the size master and the category tree in parallel. */
export function SizeChartEditor({ id }: { id: string | null }) {
  const data = useAsyncData(
    () =>
      Promise.all([
        id ? catalogApi.sizeCharts.get(id) : Promise.resolve(null),
        catalogApi.sizes.list(),
        catalogApi.lookups.categories(),
      ]).then(([chart, sizes, tree]) => ({ chart, sizes, categories: flattenCategoryTree(tree) })),
    `size-chart:${id ?? "new"}`,
  );

  return (
    <div className="grid gap-2">
      <PageHeader title={id ? data.data?.chart?.name ?? "Size chart" : "New size chart"} description="Measurement table shown in the size guide on product pages." />
      {data.loading ? <LoadingBlock label="Loading size chart" /> : null}
      {data.error ? <ErrorBlock message={data.error} onRetry={data.reload} /> : null}
      {data.data ? <SizeChartForm key={data.data.chart?.id ?? "new"} chart={data.data.chart} sizes={data.data.sizes} categories={data.data.categories} /> : null}
    </div>
  );
}
