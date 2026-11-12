import type { Metadata } from "next";
import { PolicyArticle } from "@/components/storefront/policy/policy-article";
import { getStorePolicies } from "@/lib/storefront/catalog-data";
import { POLICY_PAGE_TITLES } from "@/utils/storefront/policies";

export const metadata: Metadata = { title: POLICY_PAGE_TITLES.privacy };

export default async function PrivacyPolicyPage() {
  const policy = (await getStorePolicies()).find((entry) => entry.key === "privacy") ?? null;
  return <PolicyArticle policy={policy} fallbackTitle={POLICY_PAGE_TITLES.privacy} />;
}
