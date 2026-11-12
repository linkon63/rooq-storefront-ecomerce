/** Page numbers around the current one with `null` gaps: 1 … 4 5 6 … 12. */
export function pageNumbers(current: number, total: number, around = 1): (number | null)[] {
  const pages: (number | null)[] = [];
  for (let page = 1; page <= total; page += 1) {
    const edge = page === 1 || page === total;
    const near = Math.abs(page - current) <= around;
    if (edge || near) pages.push(page);
    else if (pages[pages.length - 1] !== null) pages.push(null);
  }
  return pages;
}

/** `?page=` value → a positive integer page (1 when missing or invalid). */
export function pageFromParam(raw: string | undefined): number {
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
