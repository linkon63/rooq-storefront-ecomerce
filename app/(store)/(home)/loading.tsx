import { GridSkeleton } from "@/components/storefront/shared/grid-skeleton";

/** Instant feedback when the logo is tapped: the home page streams in behind this. */
export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="aspect-[4/5] w-full animate-pulse bg-selvedge md:aspect-[16/7]" />
      <GridSkeleton />
    </div>
  );
}
