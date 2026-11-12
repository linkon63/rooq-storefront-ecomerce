"use client";

import type { Campaign } from "@/types/admin/content";
import { CampaignRow } from "./campaign-row";

type Props = {
  campaigns: Campaign[];
  isLoading: boolean;
  onEdit: (c: Campaign) => void;
  onDelete: (c: Campaign) => void;
  onToggle: (c: Campaign) => void;
};

const COLUMNS = ["Image", "Title", "Section", "Offer", "Active", "Actions"] as const;

export function CampaignTable({ campaigns, isLoading, onEdit, onDelete, onToggle }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[760px] text-left">
        <thead className="bg-slate-50">
          <tr>
            {COLUMNS.map((h) => (
              <th className="px-5 py-3 text-sm font-semibold text-slate-700" key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading && campaigns.length === 0 ? (
            <tr>
              <td className="px-5 py-8 text-sm font-medium text-slate-400" colSpan={COLUMNS.length}>
                Loading campaigns…
              </td>
            </tr>
          ) : campaigns.length === 0 ? (
            <tr>
              <td className="px-5 py-8 text-sm font-medium text-slate-400" colSpan={COLUMNS.length}>
                No campaigns yet.
              </td>
            </tr>
          ) : (
            campaigns.map((c) => <CampaignRow campaign={c} key={c.id} onDelete={onDelete} onEdit={onEdit} onToggle={onToggle} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
