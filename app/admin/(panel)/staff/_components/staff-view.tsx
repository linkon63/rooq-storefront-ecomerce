"use client";

import { useState } from "react";
import { ROLES } from "@/lib/constants/auth";
import { PageHeader } from "../../../_components/admin-shell";
import { useStaff } from "../_hooks/use-staff";
import { RolePermissionsCard } from "./role-permissions-card";
import { StaffForm } from "./staff-form";
import { StaffTable } from "./staff-table";

type Scope = "staff" | "all";

export function StaffView() {
  const staff = useStaff();
  const [scope, setScope] = useState<Scope>("staff");
  const [showForm, setShowForm] = useState(false);
  const visible = scope === "all" ? staff.users : staff.users.filter((user) => user.role && user.role.name !== ROLES.customer);
  const editableRoles = staff.roles.filter((role) => role.name !== ROLES.superadmin);

  return (
    <>
      <PageHeader
        action={
          <button className="h-10 rounded-lg bg-stone-900 px-4 text-sm font-bold text-white" onClick={() => setShowForm((open) => !open)} type="button">
            {showForm ? "Close" : "Add staff account"}
          </button>
        }
        description="Who can sign in to the admin, which role they hold, and what each role may open."
        title="Staff & Roles"
      />
      {staff.error ? <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">{staff.error}</p> : null}
      {showForm ? (
        <StaffForm
          busy={staff.busyId === "new"}
          onSubmit={async (input) => {
            if (await staff.create(input)) setShowForm(false);
          }}
          roles={staff.roles}
        />
      ) : null}
      <StaffTable
        busyId={staff.busyId}
        isLoading={staff.isLoading}
        onRemove={staff.remove}
        onScopeChange={setScope}
        onUpdate={staff.update}
        roles={staff.roles}
        scope={scope}
        users={visible}
      />
      <section aria-labelledby="roles-heading" className="mt-8">
        <h2 className="mb-1 text-lg font-semibold text-slate-900" id="roles-heading">Role permissions</h2>
        <p className="mb-4 text-sm text-slate-500">Superadmin always has every permission and is not listed.</p>
        <div className="grid gap-4 lg:grid-cols-2">
          {editableRoles.map((role) => (
            <RolePermissionsCard
              busy={staff.busyId === role.id}
              key={role.id}
              onSave={(ids) => staff.savePermissions(role, ids)}
              permissions={staff.permissions}
              role={role}
            />
          ))}
        </div>
      </section>
    </>
  );
}
