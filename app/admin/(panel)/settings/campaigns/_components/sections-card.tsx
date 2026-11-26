"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AdminIcon } from "../../../../_components/admin-shell";
import { HOME_PAGE_KEY, SECTION_GUIDE } from "@/lib/constants/content";
import type { useSections } from "../../../../_hooks/use-sections";
import { SettingsCard } from "../../_components/settings-ui";
import { SectionHint } from "./section-hint";

type Props = Pick<ReturnType<typeof useSections>, "sections" | "isLoading" | "error" | "addSection" | "removeSection">;

/** The page blocks campaigns are filed under; new ones are picked from the ones the website renders. */
export function SectionsCard({ sections, isLoading, error, addSection, removeSection }: Props) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const missing = SECTION_GUIDE.filter((g) => !sections.some((s) => s.page === HOME_PAGE_KEY && s.title === g.title));
  const picked = missing.find((g) => g.title === title);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!picked) return;
    setBusy(true);
    const position = Math.max(0, ...sections.map((s) => s.position)) + 1;
    const failure = await addSection({ title: picked.title, page: HOME_PAGE_KEY, position });
    setBusy(false);
    if (failure) toast.error(failure);
    else setTitle("");
  }

  async function remove(id: string) {
    const failure = await removeSection(id);
    if (failure) toast.error(failure);
  }

  return (
    <SettingsCard description="Every campaign belongs to one section. The section decides where it appears on the website." title="Sections">
      {error && <p className="mb-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
      <ul className="mb-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
        {isLoading && sections.length === 0 ? (
          <li className="px-4 py-3 text-sm text-slate-400">Loading sections…</li>
        ) : (
          sections.map((s) => (
            <li className="flex items-center justify-between gap-3 px-4 py-3" key={s.id}>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                <SectionHint section={s} />
              </div>
              <button aria-label={`Delete section ${s.title}`} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-red-500 hover:bg-red-50" onClick={() => void remove(s.id)} type="button">
                <AdminIcon className="h-4 w-4" name="trash" />
              </button>
            </li>
          ))
        )}
      </ul>
      {isLoading ? null : missing.length === 0 ? (
        <p className="text-sm font-medium text-slate-500">All website sections are added.</p>
      ) : (
        <form className="space-y-2" onSubmit={add}>
          <div className="flex gap-3">
            <select
              aria-label="Section to add"
              className="h-12 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            >
              <option value="">Choose a section to add</option>
              {missing.map((g) => (
                <option key={g.title} value={g.title}>
                  {g.title}
                </option>
              ))}
            </select>
            <button className="inline-flex h-12 cursor-pointer items-center gap-1.5 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !picked} type="submit">
              <AdminIcon className="h-4 w-4" name="plus" />
              Add
            </button>
          </div>
          {picked ? <SectionHint section={{ title: picked.title, page: HOME_PAGE_KEY }} /> : null}
        </form>
      )}
    </SettingsCard>
  );
}
