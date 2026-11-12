"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminIcon } from "../../../../_components/admin-shell";
import { HOME_PAGE_KEY } from "@/lib/constants/content";
import type { useSections } from "../../../../_hooks/use-sections";
import { Input, SettingsCard } from "../../_components/settings-ui";

type Props = Pick<ReturnType<typeof useSections>, "sections" | "isLoading" | "error" | "addSection" | "removeSection">;

/** The page blocks campaigns are filed under (hero, banners, lookbook…). */
export function SectionsCard({ sections, isLoading, error, addSection, removeSection }: Props) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const position = Math.max(0, ...sections.map((s) => s.position)) + 1;
    const failure = await addSection({ title: title.trim(), page: HOME_PAGE_KEY, position });
    setBusy(false);
    if (failure) toast.error(failure);
    else setTitle("");
  }

  async function remove(id: string) {
    const failure = await removeSection(id);
    if (failure) toast.error(failure);
  }

  return (
    <SettingsCard description="Each campaign is filed under one section; the storefront renders sections in this order." title="Sections">
      {error && <p className="mb-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
      <ul className="mb-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
        {isLoading && sections.length === 0 ? (
          <li className="px-4 py-3 text-sm text-slate-400">Loading sections…</li>
        ) : (
          sections.map((s) => (
            <li className="flex items-center justify-between gap-3 px-4 py-2.5" key={s.id}>
              <span className="text-sm font-semibold text-slate-800">
                <span className="mr-2 tabular-nums text-slate-400">{s.position}</span>
                {s.title}
                <span className="ml-2 text-xs font-medium text-slate-400">{s.page}</span>
              </span>
              <button aria-label={`Delete section ${s.title}`} className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-red-500 hover:bg-red-50" onClick={() => void remove(s.id)} type="button">
                <AdminIcon className="h-4 w-4" name="trash" />
              </button>
            </li>
          ))
        )}
      </ul>
      <form className="flex gap-3" onSubmit={add}>
        <div className="flex-1">
          <Input onChange={setTitle} placeholder="New home page section, e.g. Collections Banner" value={title} />
        </div>
        <button className="inline-flex h-12 cursor-pointer items-center gap-1.5 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={busy || !title.trim()} type="submit">
          <AdminIcon className="h-4 w-4" name="plus" />
          Add
        </button>
      </form>
    </SettingsCard>
  );
}
