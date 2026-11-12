"use client";

import { useMemo, useState } from "react";
import { formatDateTime } from "@/utils/format-date";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { useActivityLog } from "../_hooks/use-activity-log";

const HEADINGS = ["When", "Who", "Action", "Record", "IP"];

export function ActivityLogView() {
  const { rows, isLoading, error, reload } = useActivityLog();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.action, row.entityType, row.entityId, row.user?.name, row.user?.email].some((value) => value?.toLowerCase().includes(needle)),
    );
  }, [rows, query]);

  return (
    <>
      <PageHeader
        action={
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold" onClick={() => void reload()} type="button">
            <AdminIcon name="refresh" /> Refresh
          </button>
        }
        description="The latest 200 changes made in the admin, newest first."
        title="Activity Log"
      />
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="p-5">
          <label className="flex h-11 w-full max-w-md items-center gap-3 rounded-lg border-2 border-slate-200 px-4 focus-within:border-stone-500">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <span className="sr-only">Filter activity</span>
            <input className="w-full bg-transparent text-sm outline-none" onChange={(e) => setQuery(e.target.value)} placeholder="Action, record or person…" type="search" value={query} />
          </label>
        </div>
        {error ? <p className="mx-5 mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {HEADINGS.map((h) => (
                  <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>Loading activity…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>No activity recorded yet.</td></tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-sm tabular-nums text-slate-600">{formatDateTime(row.createdAt)}</td>
                    <td className="px-5 py-3 text-sm">{row.user ? row.user.name : <span className="text-slate-400">System</span>}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-800">{row.action}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{row.entityType ? `${row.entityType}${row.entityId ? ` · ${row.entityId.slice(0, 8)}` : ""}` : "—"}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">{row.ipAddress ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
