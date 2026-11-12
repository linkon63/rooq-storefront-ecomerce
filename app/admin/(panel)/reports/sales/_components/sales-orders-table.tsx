"use client";

import { useState } from "react";
import type { SalesReportOrder } from "@/types/admin/reports";
import { ReportTable } from "../../_components/report-table";
import { SalesOrderRow } from "./sales-order-row";

const COLUMNS = [
  { label: "Order" },
  { label: "Customer" },
  { label: "Total" },
  { label: "Discount" },
  { label: "Date" },
  { label: "Items" },
] as const;

/** Paid orders; click a row to see its line items. */
export function SalesOrdersTable({ orders }: { orders: SalesReportOrder[] }) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  function toggle(orderId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  return (
    <ReportTable columns={COLUMNS}>
      {orders.map((order) => (
        <SalesOrderRow isOpen={expanded.has(order.orderId)} key={order.orderId} onToggle={() => toggle(order.orderId)} order={order} />
      ))}
    </ReportTable>
  );
}
