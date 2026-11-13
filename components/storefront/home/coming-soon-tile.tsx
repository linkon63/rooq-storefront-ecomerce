import Image from "next/image";
import Link from "next/link";

export type ComingSoonItem = { id: string; name: string; imageUrl: string | null; href: string | null };

/** A small "coming soon" card: image, the Soon tag and the name; links to the product when there is one. */
export function ComingSoonTile({ item, soon }: { item: ComingSoonItem; soon: string }) {
  const body = (
    <>
      {item.imageUrl ? (
        <Image src={item.imageUrl} alt="" fill sizes="(min-width: 1024px) 22vw, 33vw" className="object-cover grayscale-[35%] transition-transform duration-500 group-hover:scale-[1.03]" />
      ) : null}
      <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1.5 bg-gradient-to-t from-ink/80 to-transparent p-2.5 pt-10 sm:p-4 sm:pt-14">
        <span className="type-label bg-chalk px-1.5 py-0.5 text-[0.625rem] text-ink sm:text-xs">{soon}</span>
        <span className="line-clamp-2 text-sm font-semibold leading-tight text-chalk sm:text-base">{item.name}</span>
      </span>
    </>
  );
  const box = "group relative block aspect-[3/4] overflow-hidden bg-selvedge/40";
  return item.href ? (
    <Link href={item.href} className={box}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}
