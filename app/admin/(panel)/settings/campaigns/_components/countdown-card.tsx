"use client";

import { useState } from "react";
import { AdminIcon } from "../../../../_components/admin-shell";
import type { Campaign } from "@/types/admin/content";
import { isCountdownSection } from "@/utils/storefront/countdown";
import { SettingsCard } from "../../_components/settings-ui";
import { CountdownBadge } from "./countdown-badge";

type Props = {
  campaigns: Campaign[];
  /** Opens the campaign form on the Sale Countdown section (creating it if needed). */
  onCreate: () => Promise<void>;
  onEdit: (campaign: Campaign) => void;
};

/**
 * Countdown sales: campaigns filed under "Sale Countdown" show on the home
 * page as a banner with a live clock until their end date.
 */
export function CountdownCard({ campaigns, onCreate, onEdit }: Props) {
  const [busy, setBusy] = useState(false);
  const sales = campaigns.filter((campaign) => isCountdownSection(campaign.section));

  async function create() {
    setBusy(true);
    await onCreate();
    setBusy(false);
  }

  return (
    <SettingsCard
      action={
        <button
          className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={() => void create()}
          type="button"
        >
          <AdminIcon className="h-4 w-4" name="plus" />
          {busy ? "Preparing…" : "Create countdown sale"}
        </button>
      }
      description="A sale with an end date shows on the home page with a live countdown. Link an offer to show its discount; the banner hides itself when the sale ends."
      title="Sale countdown"
    >
      {sales.length === 0 ? (
        <p className="text-sm font-medium text-slate-500">No countdown sale yet. Create one to start the clock on the home page.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {sales.map((sale) => (
            <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" key={sale.id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{sale.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {sale.discount?.name ?? "No offer linked"} · {sale.status === "active" ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CountdownBadge endAt={sale.endAt} />
                <button
                  aria-label={`Edit ${sale.title}`}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                  onClick={() => onEdit(sale)}
                  type="button"
                >
                  <AdminIcon className="h-4 w-4" name="edit" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SettingsCard>
  );
}
