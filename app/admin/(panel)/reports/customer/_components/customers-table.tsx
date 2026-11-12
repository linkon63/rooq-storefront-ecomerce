import type { UserReportUser } from "@/types/admin/reports";
import { formatDate } from "@/utils/format-date";
import { ReportTable } from "../../_components/report-table";

const COLUMNS = [{ label: "Name" }, { label: "Email" }, { label: "Phone" }, { label: "Role" }, { label: "Registered" }] as const;

export function CustomersTable({ users }: { users: UserReportUser[] }) {
  return (
    <ReportTable columns={COLUMNS}>
      {users.map((user) => (
        <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50" key={user.id}>
          <td className="px-6 py-4">{user.name}</td>
          <td className="px-6 py-4 text-slate-600">{user.email ?? "—"}</td>
          <td className="px-6 py-4 text-slate-500">{user.phone ?? "—"}</td>
          <td className="px-6 py-4">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">{user.role}</span>
          </td>
          <td className="px-6 py-4 text-slate-500">{formatDate(user.registeredAt)}</td>
        </tr>
      ))}
    </ReportTable>
  );
}
