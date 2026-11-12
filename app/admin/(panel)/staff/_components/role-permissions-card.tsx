"use client";

import { useState } from "react";
import type { AdminRole } from "@/types/admin/staff";
import type { Permission } from "../_hooks/use-staff";

type Props = { role: AdminRole; permissions: Permission[]; busy: boolean; onSave: (permissionIds: string[]) => void };

export function RolePermissionsCard({ role, permissions, busy, onSave }: Props) {
  const initial = (role.permissions ?? []).map((permission) => permission.id);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initial));
  const dirty = selected.size !== initial.length || initial.some((id) => !selected.has(id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold capitalize text-slate-900">{role.name}</h3>
          {role.description ? <p className="text-xs text-slate-500">{role.description}</p> : null}
        </div>
        <button
          className="h-9 rounded-lg bg-stone-900 px-3 text-sm font-bold text-white disabled:opacity-40"
          disabled={!dirty || busy}
          onClick={() => onSave([...selected])}
          type="button"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </header>
      {permissions.length === 0 ? (
        <p className="text-sm text-slate-500">No permissions defined yet.</p>
      ) : (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Permissions for {role.name}</legend>
          {permissions.map((permission) => (
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm focus-within:ring-2 focus-within:ring-stone-400 ${selected.has(permission.id) ? "border-stone-900 bg-stone-900 text-white" : "border-slate-300 text-slate-700"}`}
              key={permission.id}
            >
              <input checked={selected.has(permission.id)} className="sr-only" onChange={() => toggle(permission.id)} type="checkbox" />
              {permission.name}
            </label>
          ))}
        </fieldset>
      )}
    </article>
  );
}
