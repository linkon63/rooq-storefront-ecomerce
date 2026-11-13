import Image from "next/image";
import Link from "next/link";
import type { Image as ImageRef } from "@/types/storefront/catalog";

export type DepartmentTile = { label: string; href: string; image: ImageRef | null };

const TONES = ["bg-selvedge text-ink", "bg-ink text-chalk", "bg-dye text-chalk"];

/**
 * Three colour-blocked tiles, each showing the newest piece in that
 * department. Without a product image the block colour carries the tile.
 */
export function DepartmentTiles({ tiles }: { tiles: DepartmentTile[] }) {
  return (
    <section aria-label="Shop by department" className="page-gutter">
      <ul className="grid grid-cols-3 gap-2 md:gap-4">
        {tiles.map((tile, index) => (
          <li key={tile.href}>
            <Link href={tile.href} className={`group relative block aspect-[3/4] overflow-hidden md:aspect-[4/5] ${TONES[index % TONES.length]}`}>
              {tile.image ? (
                <Image
                  src={tile.image.url}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 32vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-cloth)] group-hover:scale-[1.03]"
                />
              ) : null}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-3 pt-12 md:p-5 md:pt-20">
                <span className="font-expanded text-lg font-extrabold leading-none text-chalk md:text-4xl">{tile.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
