import { AdminIcon } from "../../../_components/admin-icons";

export function ReorderStatus({ isReordering, canReorder, searching }: { isReordering: boolean; canReorder: boolean; searching: boolean }) {
  if (isReordering) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600" role="status">
        <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 motion-reduce:animate-none" />
        Saving order…
      </span>
    );
  }
  if (canReorder) {
    return (
      <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:inline-flex">
        <AdminIcon className="h-3.5 w-3.5" name="grip" />
        Drag the handle to reorder, or drop onto a row to nest it
      </span>
    );
  }
  return searching ? <span className="text-xs font-medium text-amber-600">Clear the search to reorder categories</span> : null;
}
