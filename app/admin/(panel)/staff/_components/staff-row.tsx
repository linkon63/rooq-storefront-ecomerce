"use client";

import { ROLES } from "@/lib/constants/auth";
import type { AdminRole, StaffUser, StaffUserInput } from "@/types/admin/staff";
import { formatDateTime } from "@/utils/format-date";
import { StatusToggle } from "../../../_components/admin-shell";

type Props = {
  user: StaffUser;
  roles: AdminRole[];
  busy: boolean;
  onUpdate: (id: string, body: Partial<StaffUserInput> & { isActive?: boolean }) => void;
  onRemove: (id: string) => void;
};

export function StaffRow({ user, roles, busy, onUpdate, onRemove }: Props) {
  const isSuperadmin = user.role?.name === ROLES.superadmin;
  const assignable = roles.filter((role) => role.name !== ROLES.superadmin);

  return (
    <tr className={busy ? "opacity-60" : undefined}>
      <td className="px-5 py-4 text-sm font-semibold text-slate-900">{user.name}</td>
      <td className="px-5 py-4 text-sm text-slate-600">
        <span className="block">{user.email}</span>
        <span className="block text-xs text-slate-400">{user.phone ?? "—"}</span>
      </td>
      <td className="px-5 py-4 text-sm">
        {isSuperadmin ? (
          <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-white">superadmin</span>
        ) : (
          <label>
            <span className="sr-only">Role for {user.name}</span>
            <select
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm"
              disabled={busy}
              onChange={(event) => onUpdate(user.id, { roleId: event.target.value })}
              value={user.role?.id ?? ""}
            >
              {user.role ? null : <option value="">No role</option>}
              {assignable.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </label>
        )}
      </td>
      <td className="px-5 py-4">
        <StatusToggle checked={user.isActive} disabled={busy || isSuperadmin} onChange={(isActive) => onUpdate(user.id, { isActive })} />
      </td>
      <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(user.lastLoginAt ?? undefined)}</td>
      <td className="px-5 py-4 text-right">
        {isSuperadmin ? null : (
          <button
            className="h-9 rounded-lg border border-rose-200 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40"
            disabled={busy}
            onClick={() => {
              if (window.confirm(`Remove ${user.name}? They will be signed out and can no longer sign in.`)) onRemove(user.id);
            }}
            type="button"
          >
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}
