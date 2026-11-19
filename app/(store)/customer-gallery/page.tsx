import type { Metadata } from "next";
import { GalleryShareForm } from "@/components/storefront/gallery/gallery-share-form";
import { GalleryView } from "@/components/storefront/gallery/gallery-view";
import { listPublicGallery } from "@/lib/server/gallery/service";
import type { PublicGalleryEntry } from "@/types/gallery";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Rooq in your wardrobe",
  description: "Real customers wearing Rooq sarees, with their photos, ratings and feedback. Share yours too.",
};

async function loadEntries(): Promise<PublicGalleryEntry[]> {
  try {
    return await listPublicGallery();
  } catch (error) {
    // The database may be unreachable (e.g. at build time); show the empty state instead of failing.
    console.error("[customer-gallery] could not load entries", error);
    return [];
  }
}

export default async function CustomerGalleryPage() {
  const entries = await loadEntries();
  return (
    <div className="page-gutter flex flex-col gap-12 pt-8 md:pt-12">
      <header className="flex max-w-[60ch] flex-col gap-5">
        <h1 className="font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Rooq in your wardrobe</h1>
        <p className="type-lead text-stone">
          Sarees worn, loved and photographed by the people who bought them. Their words, their photos — and room for yours.
        </p>
      </header>
      <GalleryView entries={entries} />
      <GalleryShareForm />
    </div>
  );
}
