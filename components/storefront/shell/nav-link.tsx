"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { NavLinkView, type NavLinkProps } from "./nav-link-view";

function NavLinkWithParams(props: NavLinkProps) {
  return <NavLinkView {...props} activeCategory={useSearchParams().get("category")} />;
}

/** NavLinkView with the `?category=` in the URL; static HTML shows it without. */
export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<NavLinkView {...props} activeCategory={null} />}>
      <NavLinkWithParams {...props} />
    </Suspense>
  );
}
