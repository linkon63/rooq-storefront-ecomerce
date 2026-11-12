"use client";

import { AdminIcon } from "../../../_components/admin-shell";
import type { News } from "@/types/admin/content";
import { formatDate } from "@/utils/format-date";
import { NewsStatusBadge } from "./news-status-badge";

type Props = { news: News; onEdit: (news: News) => void; onDelete: (news: News) => void };

export function NewsRow({ news, onEdit, onDelete }: Props) {
  return (
    <tr className="transition-colors odd:bg-white even:bg-slate-50/70 hover:bg-slate-100/60">
      <td className="px-5 py-3">
        {news.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-12 w-16 rounded-lg border border-slate-200 bg-white object-cover"
            height={48}
            loading="lazy"
            src={news.coverImageUrl}
            width={64}
          />
        ) : (
          <div className="grid h-12 w-16 place-items-center rounded-lg border border-slate-200 bg-white">
            <AdminIcon className="h-5 w-5 text-slate-400" name="image" />
          </div>
        )}
      </td>
      <td className="max-w-xs truncate px-5 py-3 text-sm font-semibold text-slate-800">{news.title}</td>
      <td className="px-5 py-3 text-sm text-slate-600">{news.slug}</td>
      <td className="px-5 py-3">
        <NewsStatusBadge published={news.isPublished} />
      </td>
      <td className="px-5 py-3 text-sm text-slate-600">{news.publishedAt ? formatDate(news.publishedAt) : "—"}</td>
      <td className="px-5 py-3">
        <div className="flex gap-2">
          <button
            aria-label={`Edit ${news.title}`}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100"
            onClick={() => onEdit(news)}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="edit" />
          </button>
          <button
            aria-label={`Delete ${news.title}`}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-red-100 text-red-500 transition-colors hover:bg-red-50"
            onClick={() => onDelete(news)}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}
