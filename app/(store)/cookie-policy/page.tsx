import type { Metadata } from "next";
import { PolicyArticle } from "@/components/storefront/policy/policy-article";
import { COOKIE_POLICY } from "@/utils/storefront/cookie-policy";

export const metadata: Metadata = { title: COOKIE_POLICY.title };

export default function CookiePolicyPage() {
  return <PolicyArticle policy={COOKIE_POLICY} fallbackTitle={COOKIE_POLICY.title} />;
}
