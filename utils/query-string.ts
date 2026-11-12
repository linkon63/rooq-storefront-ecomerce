export type QueryValue = string | number | boolean | null | undefined | readonly (string | number)[];
export type QueryParams = Record<string, QueryValue>;

/**
 * `{ size: ["m", "l"], page: 2, onSale: true, q: "" }` → `size=m%2Cl&page=2&onSale=true`.
 * Empty strings, nulls, undefined and empty arrays are dropped; arrays are
 * comma-joined (the API's `queryList` accepts both forms).
 */
export function toQueryString(params: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length > 0) search.set(key, value.join(","));
      continue;
    }
    search.set(key, String(value));
  }
  return search.toString();
}

/** Path plus query, without a trailing `?` when the query is empty. */
export function withQuery(path: string, params: QueryParams): string {
  const query = toQueryString(params);
  return query ? `${path}?${query}` : path;
}
