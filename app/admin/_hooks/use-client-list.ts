"use client";

import { useCallback, useMemo, useState } from "react";

const DEFAULT_PAGE = 10;

/**
 * Client-side search + "load more" over an already-fetched list. `text(row)`
 * returns the searchable text of a row.
 */
export function useClientList<T>(rows: T[], text: (row: T) => string, pageSize = DEFAULT_PAGE) {
  const [search, setSearchState] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return needle ? rows.filter((row) => text(row).toLowerCase().includes(needle)) : rows;
  }, [rows, search, text]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value);
      setVisibleCount(pageSize);
    },
    [pageSize],
  );
  const loadMore = useCallback(() => setVisibleCount((count) => count + pageSize), [pageSize]);

  return { search, setSearch, filtered, visible, hasMore: visible.length < filtered.length, loadMore };
}
