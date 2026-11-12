import "server-only";
import { startOfDay } from "@/utils/dashboard/date-range";
import { isoDate } from "@/utils/reports/format";
import type { ReportRange } from "@/utils/reports/date-range";
import { prisma } from "../prisma";
import { customerWhere, inRange, meta, pagingWindow } from "./shared";
import type { ExportDocument, Paging } from "./types";

/** Monday 00:00 of the current week. */
function weekStart(now = new Date()): Date {
  const start = startOfDay(now);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start;
}

const customerRowSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
  role: { select: { name: true } },
} as const;

export async function customersSummary(range: ReportRange) {
  const [totalNewUsers, totalCustomers, newCustomersThisWeek] = await Promise.all([
    prisma.user.count({ where: { ...customerWhere, createdAt: inRange(range) } }),
    prisma.user.count({ where: customerWhere }),
    prisma.user.count({ where: { ...customerWhere, createdAt: { gte: weekStart() } } }),
  ]);
  return { totalNewUsers, totalCustomers, newCustomersThisWeek, period: { start: range.start, end: range.end } };
}

export async function getUserReport(range: ReportRange, paging: Paging) {
  const [summary, users] = await Promise.all([
    customersSummary(range),
    prisma.user.findMany({
      where: { ...customerWhere, createdAt: inRange(range) },
      select: customerRowSelect,
      orderBy: { createdAt: "desc" },
      ...pagingWindow(paging),
    }),
  ]);
  return {
    summary,
    users: {
      items: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?.name ?? "N/A",
        registeredAt: user.createdAt,
      })),
      meta: meta(paging, summary.totalNewUsers),
    },
  };
}

export async function usersExport(range: ReportRange): Promise<ExportDocument> {
  const users = await prisma.user.findMany({
    where: { ...customerWhere, createdAt: inRange(range) },
    select: customerRowSelect,
    orderBy: { createdAt: "desc" },
  });
  return {
    title: "Customer Report",
    filename: "customer-report",
    range,
    summary: [["New Customers", String(users.length)]],
    tables: [
      {
        headers: ["Name", "Email", "Phone", "Role", "Registered At"],
        rows: users.map((user) => [user.name, user.email ?? "", user.phone ?? "", user.role?.name ?? "user", isoDate(user.createdAt)]),
      },
    ],
  };
}
