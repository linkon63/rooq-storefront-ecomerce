"use client";

import type { AdminRole, StaffUser, StaffUserInput } from "@/types/admin/staff";
import { StaffRow } from "./staff-row";

type Props = {
  users: StaffUser[];
  roles: AdminRole[];
  isLoading: boolean;
  busyId: string | null;
  scope: "staff" | "all";
  onScopeChange: (scope: "staff" | "all") => void;
  onUpdate: (id: string, body: Partial<StaffUserInput> & { isActive?: boolean }) => void;
  onRemove: (id: string) => void;
};

const HEADINGS = ["Name", "Contact", "Role", "Active", "Last sign-in", ""];

export function StaffTable({ users, roles, isLoading, busyId, scope, onScopeChange, onUpdate, onRemove }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between gap-4 p-5">
        <p className="text-sm font-medium text-slate-600">{users.length} accounts</p>
        <div className="flex gap-2" role="group" aria-label="Show">
          {(["staff", "all"] as const).map((value) => (
            <button
              aria-pressed={scope === value}
              className={`h-9 rounded-full px-4 text-sm font-semibold ${scope === value ? "bg-stone-900 text-white" : "bg-slate-100 text-slate-700"}`}
              key={value}
              onClick={() => onScopeChange(value)}
              type="button"
            >
              {value === "staff" ? "Staff only" : "Everyone"}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead className="bg-slate-50">
            <tr>
              {HEADINGS.map((h, index) => (
                <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={h || index} scope="col">
                  {h || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>Loading accounts…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>No accounts here.</td>
              </tr>
            ) : (
              users.map((user) => (
                <StaffRow busy={busyId === user.id} key={user.id} onRemove={onRemove} onUpdate={onUpdate} roles={roles} user={user} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
