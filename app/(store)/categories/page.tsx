import type { Metadata } from "next";
import { CategoryBrowser } from "@/components/storefront/mobile/category-browser";
import { getCategoryTree } from "@/lib/storefront/catalog-data";

export const metadata: Metadata = {
  title: "Saree Categories",
  description: "Browse every Rooq saree (sharee) category: cotton, tant, jamdani, manipuri and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategoryTree();
  const roots = categories.filter((category) => !category.parentId && category.isActive !== false);
  return (
    <div className="page-gutter max-md:px-0 md:pt-12">
      <h1 className="type-h1 max-md:sr-only md:mb-8">Categories</h1>
      <CategoryBrowser roots={roots} />
    </div>
  );
}
