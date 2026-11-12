import type { ReturnStatus } from "@/types/commerce/returns";
import { RETURN_STATUS_LABELS } from "@/lib/constants/storefront";
import { ReturnsView } from "./_components/returns-view";

type SearchParams = Promise<{ status?: string | string[] }>;

/** `?status=APPROVED` deep-links a tab; `?status=all` opens every request. Unknown values fall back to "To review". */
function initialStatus(raw: string | string[] | undefined): ReturnStatus | "" {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.toUpperCase();
  if (value === "ALL") return "";
  return value && Object.hasOwn(RETURN_STATUS_LABELS, value) ? (value as ReturnStatus) : "REQUESTED";
}

export default async function ReturnsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams;
  return <ReturnsView initialStatus={initialStatus(status)} />;
}
