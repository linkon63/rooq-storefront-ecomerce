import Link from "next/link";
import type { Messages } from "@/lib/i18n/messages";

/** Last category tile when the home page hides some: opens the shop to choose from all of them. */
export function MoreCategoriesTile({ count, t }: { count: number; t: Messages["home"] }) {
  return (
    <li>
      <Link
        href="/shop"
        className="group relative flex aspect-[3/4] flex-col items-start justify-end gap-3 overflow-hidden bg-ink p-4 text-chalk lg:p-6"
      >
        <span aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_10px,rgb(255_255_255/0.05)_10px_11px)]" />
        <span className="type-label relative bg-chalk/10 px-2 py-1">+{count} {t.moreSuffix}</span>
        <span className="type-h2 relative">{t.allCategories}</span>
        <span className="type-label relative inline-flex items-center gap-2 underline-offset-4 group-hover:underline">
          {t.chooseInShop} <span aria-hidden>→</span>
        </span>
      </Link>
    </li>
  );
}
