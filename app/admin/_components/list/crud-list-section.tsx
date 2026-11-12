"use client";

import type { ReactNode } from "react";
import { InfiniteScroll } from "../infinite-scroll";
import { TableStateRow } from "./table-state-row";

type Props = {
  noun: { one: string; many: string };
  headings: string[];
  minWidth?: string;
  isLoading: boolean;
  total: number;
  loaded: number;
  hasMore: boolean;
  onLoadMore: () => void;
  error?: string;
  toolbar?: ReactNode;
  children: ReactNode;
};

/** The standard admin list card: count bar, error line, table with loading/empty rows, load-more footer. */
export function CrudListSection({ noun, headings, minWidth = "min-w-[800px]", isLoading, total, loaded, hasMore, onLoadMore, error, toolbar, children }: Props) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <p className="text-sm font-medium text-slate-500">
          {total} {total === 1 ? noun.one : noun.many}
        </p>
        {toolbar}
      </div>
      {error ? <p className="mx-5 my-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className={`w-full ${minWidth} text-left`}>
          <thead className="bg-slate-50">
            <tr>
              {headings.map((h) => (
                <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={h} scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableStateRow colSpan={headings.length}>Loading {noun.many}…</TableStateRow>
            ) : total === 0 ? (
              <TableStateRow colSpan={headings.length}>No {noun.many} found.</TableStateRow>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && total > 0 ? (
        <InfiniteScroll allLoadedLabel={`All ${noun.many} loaded`} hasMore={hasMore} isLoading={false} itemLabel={noun.many} loaded={loaded} onLoadMore={onLoadMore} total={total} />
      ) : null}
    </section>
  );
}
