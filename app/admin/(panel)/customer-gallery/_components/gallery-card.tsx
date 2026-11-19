"use client";

import { AdminIcon } from "../../../_components/admin-shell";
import { StarRating } from "../../reviews/_components/star-rating";
import type { AdminGalleryEntry, GalleryStatus } from "@/types/gallery";

const STATUS_STYLE: Record<GalleryStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

type Props = {
  entry: AdminGalleryEntry;
  onStatus: (id: string, status: GalleryStatus) => void;
  onDelete: (entry: AdminGalleryEntry) => void;
};

const BTN = "inline-flex h-8 cursor-pointer items-center rounded-lg border px-3 text-xs font-semibold transition-colors";

export function GalleryCard({ entry, onStatus, onDelete }: Props) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`grid gap-0.5 bg-slate-100 ${entry.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {entry.images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={image.alt ?? entry.name} className="aspect-square w-full object-cover" key={image.id} loading="lazy" src={image.url} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
            <p className="text-xs text-slate-500">{[entry.city, entry.source === "FACEBOOK" ? "Facebook" : "Website"].filter(Boolean).join(" · ")}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[entry.status]}`}>{entry.status.toLowerCase()}</span>
        </div>
        <StarRating rating={entry.rating} />
        <p className="whitespace-pre-line text-sm text-slate-700">{entry.feedback}</p>
        <p className="mt-auto pt-2 text-xs text-slate-400">
          {entry.contactPhone ? `Private phone: ${entry.contactPhone} · ` : ""}Consent {new Date(entry.consentAt).toLocaleDateString()}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {entry.status !== "APPROVED" && (
            <button className={`${BTN} border-emerald-200 text-emerald-700 hover:bg-emerald-50`} onClick={() => onStatus(entry.id, "APPROVED")} type="button">
              Approve
            </button>
          )}
          {entry.status !== "REJECTED" && (
            <button className={`${BTN} border-slate-300 text-slate-700 hover:bg-slate-50`} onClick={() => onStatus(entry.id, "REJECTED")} type="button">
              Reject
            </button>
          )}
          {entry.status !== "PENDING" && (
            <button className={`${BTN} border-slate-300 text-slate-700 hover:bg-slate-50`} onClick={() => onStatus(entry.id, "PENDING")} type="button">
              Back to pending
            </button>
          )}
          <button aria-label="Delete entry" className={`${BTN} ml-auto border-red-200 text-red-600 hover:bg-red-50`} onClick={() => onDelete(entry)} type="button">
            <AdminIcon className="h-4 w-4" name="trash" />
          </button>
        </div>
      </div>
    </article>
  );
}
