"use client";

import { PageHeader } from "../../../_components/page-header";
import type { DiscountReport } from "@/types/admin/reports";
import { ReportActions } from "../_components/report-actions";
import { ReportError } from "../_components/report-error";
import { ReportPanel } from "../_components/report-panel";
import { StatCard } from "../_components/stat-card";
import { Pager } from "../_components/pager";
import { useReport } from "../_hooks/use-report";
import { CouponsTable } from "./_components/coupons-table";
import { DiscountedOrdersTable } from "./_components/discounted-orders-table";
import { OfferBreakdownTable } from "./_components/offer-breakdown-table";

export default function DiscountReportPage() {
  const { data, isLoading, error, setPage } = useReport<DiscountReport>("discounts");
  const summary = data?.summary;
  const avgDiscount = summary && summary.ordersWithDiscount > 0 ? summary.totalDiscountGiven / summary.ordersWithDiscount : 0;

  return (
    <>
      <PageHeader
        action={<ReportActions endpoint="discounts" />}
        description="What coupons and product offers took off orders."
        title="Discount report"
      />
      <ReportError message={error} />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="discount" isLoading={isLoading} isMoney label="Discount given" value={summary?.totalDiscountGiven} />
        <StatCard icon="orders" isLoading={isLoading} label="Orders with a discount" value={summary?.ordersWithDiscount} />
        <StatCard icon="voucher" isLoading={isLoading} label="Coupons" value={summary?.totalCoupons} />
        <StatCard icon="report" isLoading={isLoading} isMoney label="Avg discount per order" value={summary ? avgDiscount : undefined} />
      </section>

      <ReportPanel emptyText="No coupons active in this period." isEmpty={!data?.couponBreakdown.length} isLoading={isLoading} title="Coupons">
        <CouponsTable coupons={data?.couponBreakdown ?? []} />
      </ReportPanel>

      <ReportPanel
        emptyText="No product offers applied to products sold in this period."
        isEmpty={!data?.productDiscountBreakdown.length}
        isLoading={isLoading}
        title="Product offers"
      >
        <OfferBreakdownTable offers={data?.productDiscountBreakdown ?? []} />
      </ReportPanel>

      <ReportPanel
        action={<Pager meta={data?.discountedOrders.meta} onPage={setPage} />}
        emptyText="No discounted orders in this period."
        isEmpty={!data?.discountedOrders.items.length}
        isLoading={isLoading}
        title="Discounted orders"
      >
        <DiscountedOrdersTable orders={data?.discountedOrders.items ?? []} />
      </ReportPanel>
    </>
  );
}
