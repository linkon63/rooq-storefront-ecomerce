"use client";

import { useState, type FormEvent } from "react";
import { PASSWORD_MIN_LENGTH, ROLES } from "@/lib/constants/auth";
import type { AdminRole, StaffUserInput } from "@/types/admin/staff";

type Props = { roles: AdminRole[]; busy: boolean; onSubmit: (input: StaffUserInput) => void };

const FIELDS = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "password", label: "Temporary password", type: "password", autoComplete: "new-password" },
] as const;

export function StaffForm({ roles, busy, onSubmit }: Props) {
  const staffRoles = roles.filter((role) => role.name !== ROLES.superadmin && role.name !== ROLES.customer);
  const [roleId, setRoleId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    onSubmit({
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      password: String(data.get("password") ?? ""),
      roleId: roleId || staffRoles[0]?.id,
    });
  }

  return (
    <form className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:grid-cols-2 lg:grid-cols-5" onSubmit={handleSubmit}>
      {FIELDS.map((field) => (
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700" key={field.name}>
          {field.label}
          <input
            autoComplete={field.autoComplete}
            className="h-10 rounded-lg border border-slate-300 px-3 font-normal"
            minLength={field.name === "password" ? PASSWORD_MIN_LENGTH : undefined}
            name={field.name}
            required
            type={field.type}
          />
        </label>
      ))}
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Role
        <select className="h-10 rounded-lg border border-slate-300 bg-white px-2 font-normal" onChange={(event) => setRoleId(event.target.value)} value={roleId || staffRoles[0]?.id || ""}>
          {staffRoles.map((role) => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-2 lg:col-span-5">
        <button className="h-10 rounded-lg bg-stone-900 px-5 text-sm font-bold text-white disabled:opacity-50" disabled={busy} type="submit">
          {busy ? "Creating…" : "Create account"}
        </button>
      </div>
    </form>
  );
}
