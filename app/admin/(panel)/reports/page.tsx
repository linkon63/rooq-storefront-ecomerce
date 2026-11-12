"use client";

import { PageHeader } from "../../_components/page-header";
import type { ReportOverview } from "@/types/admin/reports";
import { ReportActions } from "./_components/report-actions";
import { ReportError } from "./_components/report-error";
import { StatCard } from "./_components/stat-card";
import { useReport } from "./_hooks/use-report";
import { OverviewSection } from "./_components/overview-section";

export default function ReportsOverviewPage() {
  const { data, isLoading, error } = useReport<ReportOverview>("overview");
  const loading = isLoading && !data;

  return (
    <>
      <PageHeader
        action={<ReportActions endpoint="overview" />}
        description="Sales, customers, discounts, inventory and purchases for the selected dates."
        title="Report overview"
      />
      <ReportError message={error} />

      <OverviewSection title="Sales">
        <StatCard icon="report" isLoading={loading} isMoney label="Total revenue" value={data?.sales.totalRevenue} />
        <StatCard icon="orders" isLoading={loading} label="Paid orders" value={data?.sales.totalOrders} />
        <StatCard icon="discount" isLoading={loading} isMoney label="Avg order value" value={data?.sales.avgOrderValue} />
      </OverviewSection>

      <OverviewSection title="Customers">
        <StatCard icon="user" isLoading={loading} label="New customers" value={data?.customers.totalNewUsers} />
        <StatCard icon="store" isLoading={loading} label="All customers" value={data?.customers.totalCustomers} />
        <StatCard icon="calendar" isLoading={loading} label="New this week" value={data?.customers.newCustomersThisWeek} />
      </OverviewSection>

      <OverviewSection title="Discounts">
        <StatCard icon="discount" isLoading={loading} isMoney label="Discount given" value={data?.discounts.totalDiscountGiven} />
        <StatCard icon="orders" isLoading={loading} label="Orders with a discount" value={data?.discounts.ordersWithDiscount} />
        <StatCard icon="voucher" isLoading={loading} label="Coupons" value={data?.discounts.totalCoupons} />
      </OverviewSection>

      <OverviewSection title="Inventory">
        <StatCard icon="stock" isLoading={loading} label="Stock movements" value={data?.inventory.totalTransactions} />
        <StatCard icon="stock" isLoading={loading} label="Low-stock variants" value={data?.inventory.lowStockAlerts} />
        <StatCard icon="arrow-right" isLoading={loading} label="Units in" value={data?.inventory.totalStockIn} />
        <StatCard icon="arrow-left" isLoading={loading} label="Units out" value={data?.inventory.totalStockOut} />
      </OverviewSection>

      <OverviewSection title="Purchases">
        <StatCard icon="suppliers" isLoading={loading} label="Restocks" value={data?.purchases.totalPurchases} />
        <StatCard icon="package" isLoading={loading} label="Units restocked" value={data?.purchases.totalUnits} />
        <StatCard icon="report" isLoading={loading} isMoney label="Total cost" value={data?.purchases.totalCost} />
      </OverviewSection>
    </>
  );
}
