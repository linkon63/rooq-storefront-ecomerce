import { CATALOG_WRITE_PREFIXES } from "@/lib/constants/storefront";

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Does a successful request change storefront catalogue data (so its cache must be revalidated)? */
export function isCatalogWrite(method: string, pathname: string): boolean {
  if (READ_METHODS.has(method.toUpperCase())) return false;
  return CATALOG_WRITE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
