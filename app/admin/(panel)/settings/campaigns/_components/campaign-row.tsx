"use client";

import { AdminIcon } from "../../../../_components/admin-shell";
import type { Campaign } from "@/types/admin/content";
import { campaignImageUrls } from "@/utils/admin/content";
import { isCountdownSection } from "@/utils/storefront/countdown";
import { StatusToggle } from "../../_components/settings-ui";
import { CountdownBadge } from "./countdown-badge";

type Props = { campaign: Campaign; onEdit: (c: Campaign) => void; onDelete: (c: Campaign) => void; onToggle: (c: Campaign) => void };

export function CampaignRow({ campaign, onEdit, onDelete, onToggle }: Props) {
  const [cover] = campaignImageUrls(campaign);
  return (
    <tr className="odd:bg-white even:bg-slate-50/60">
      <td className="px-5 py-3">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-12 w-20 rounded-md border border-slate-200 object-cover" height={48} loading="lazy" src={cover} width={80} />
        ) : (
          <div className="grid h-12 w-20 place-items-center rounded-md border border-slate-200 bg-slate-50">
            <AdminIcon className="h-4 w-4 text-slate-300" name="image" />
          </div>
        )}
      </td>
      <td className="px-5 py-3 text-sm font-semibold text-slate-800">
        {campaign.title}
        {isCountdownSection(campaign.section) ? (
          <span className="mt-1 block">
            <CountdownBadge endAt={campaign.endAt} />
          </span>
        ) : null}
      </td>
      <td className="px-5 py-3 text-sm text-slate-600">{campaign.section?.title ?? "—"}</td>
      <td className="px-5 py-3 text-sm text-slate-600">{campaign.discount?.name ?? "—"}</td>
      <td className="px-5 py-3">
        <StatusToggle active={campaign.status === "active"} onChange={() => onToggle(campaign)} />
      </td>
      <td className="px-5 py-3">
        <div className="flex gap-2">
          <button aria-label={`Edit ${campaign.title}`} className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50" onClick={() => onEdit(campaign)} type="button">
            <AdminIcon className="h-4 w-4" name="edit" />
          </button>
          <button aria-label={`Delete ${campaign.title}`} className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100" onClick={() => onDelete(campaign)} type="button">
            <AdminIcon className="h-4 w-4" name="trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}
