import type { Metadata } from "next";
import { PolicyArticle } from "@/components/storefront/policy/policy-article";
import { getStorePolicies } from "@/lib/storefront/catalog-data";
import { POLICY_PAGE_TITLES } from "@/utils/storefront/policies";

export const metadata: Metadata = { title: POLICY_PAGE_TITLES.terms };

export default async function TermsPage() {
  const policy = (await getStorePolicies()).find((entry) => entry.key === "terms") ?? null;
  return <PolicyArticle policy={policy} fallbackTitle={POLICY_PAGE_TITLES.terms} />;
}
