import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyArticle } from "@/components/storefront/policy/policy-article";
import { getStorePolicies } from "@/lib/storefront/catalog-data";
import { POLICY_PAGE_TITLES, isPolicyKey } from "@/utils/storefront/policies";

type PageProps = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { key } = await params;
  return { title: isPolicyKey(key) ? POLICY_PAGE_TITLES[key] : "Not found" };
}

export default async function PolicyPage({ params }: PageProps) {
  const { key } = await params;
  if (!isPolicyKey(key)) notFound();
  const policy = (await getStorePolicies()).find((entry) => entry.key === key) ?? null;
  return <PolicyArticle policy={policy} fallbackTitle={POLICY_PAGE_TITLES[key]} />;
}
