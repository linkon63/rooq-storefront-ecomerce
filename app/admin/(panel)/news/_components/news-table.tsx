"use client";

import type { News } from "@/types/admin/content";
import { NewsRow } from "./news-row";

type Props = {
  items: News[];
  isLoading: boolean;
  hasQuery: boolean;
  onEdit: (news: News) => void;
  onDelete: (news: News) => void;
};

const COLUMNS = ["Cover", "Title", "Slug", "Status", "Published", "Actions"] as const;

export function NewsTable({ items, isLoading, hasQuery, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left">
        <thead className="bg-slate-50">
          <tr>
            {COLUMNS.map((heading) => (
              <th className="px-5 py-3 text-sm font-semibold text-slate-700" key={heading} scope="col">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading && items.length === 0 ? (
            <tr>
              <td className="px-5 py-8 text-sm font-medium text-slate-500" colSpan={COLUMNS.length}>
                Loading articles…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td className="px-5 py-8 text-center text-sm font-medium text-slate-400" colSpan={COLUMNS.length}>
                {hasQuery ? "No articles match your search." : "No articles yet. Use “Add article” to write the first one."}
              </td>
            </tr>
          ) : (
            items.map((news) => <NewsRow key={news.id} news={news} onDelete={onDelete} onEdit={onEdit} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
