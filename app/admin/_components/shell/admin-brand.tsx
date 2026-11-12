"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/storefront/shared/Logo";
import { resolveImageUrl } from "@/utils/admin/format";

/** Shop logo from Settings, or the Rooq wordmark while none is set. */
export function AdminBrand({ logo, shopName }: { logo?: string | null; shopName?: string | null }) {
  return (
    <Link aria-label={`${shopName ?? "Rooq"} admin dashboard`} className="flex items-center" href="/admin/dashboard">
      {logo ? (
        <Image
          alt={shopName ?? "Rooq"}
          className="max-h-14 w-auto object-contain"
          height={60}
          src={resolveImageUrl(logo)}
          unoptimized
          width={200}
        />
      ) : (
        <Logo className="h-8" />
      )}
    </Link>
  );
}
