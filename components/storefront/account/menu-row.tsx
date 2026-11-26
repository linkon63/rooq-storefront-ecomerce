import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export function MenuRow({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="press flex min-h-12 items-center justify-between gap-3 text-sm">
        {label}
        <FiChevronRight aria-hidden className="size-4 text-stone" />
      </Link>
    </li>
  );
}
