import Link from "next/link";
import { AdminIcon, type AdminIconName } from "../../../_components/admin-shell";

/** A count that needs an action, linking to where the action happens. */
export function AttentionTile({
  label,
  value,
  hint,
  href,
  icon,
  isLoading,
}: {
  label: string;
  value: number | undefined;
  hint: string;
  href: string;
  icon: AdminIconName;
  isLoading: boolean;
}) {
  const hasWork = (value ?? 0) > 0;
  return (
    <Link
      className={`flex items-center gap-4 rounded-xl border p-4 transition hover:bg-slate-50 ${hasWork ? "border-amber-200 bg-amber-50/40" : "border-slate-100"}`}
      href={href}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${hasWork ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
        <AdminIcon className="h-5 w-5" name={icon} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-black text-slate-700">{label}</p>
        <p className="text-sm font-medium text-slate-500">{hint}</p>
      </div>
      {isLoading ? (
        <span className="h-8 w-10 animate-pulse rounded bg-slate-100" />
      ) : (
        <span className="text-2xl font-black tabular-nums">{value ?? 0}</span>
      )}
    </Link>
  );
}
