/** "Only 3 left" — the count to show, or null when stock is healthy or zero. */
export function lowStockCount(stock: number, threshold: number): number | null {
  return stock > 0 && stock <= threshold ? stock : null;
}

export function isInStock(stock: number): boolean {
  return stock > 0;
}
