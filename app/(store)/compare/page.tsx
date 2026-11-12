import type { Metadata } from "next";
import { CompareTable } from "@/components/storefront/compare/compare-table";

export const metadata: Metadata = { title: "Compare", robots: { index: false } };

export default function ComparePage() {
  return (
    <div className="page-gutter pt-8 md:pt-12">
      <h1 className="mb-8 font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Compare</h1>
      <CompareTable />
    </div>
  );
}
