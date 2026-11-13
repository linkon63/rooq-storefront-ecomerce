"use client";

import dynamic from "next/dynamic";

/* The loom scene (and GSAP) loads in the browser only; the footer renders without it first. */
const LoomScene = dynamic(() => import("./loom-scene"), { ssr: false });

/**
 * Full-screen decorative backdrop at the foot of the page: the animated
 * handloom under a deep-green wash, with the woven "ROOQ" above the wash
 * in pure white.
 */
export function FooterWeavingArt() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
      <LoomScene>
        <div className="absolute inset-0 bg-linear-to-b from-ink/70 via-ink/10 to-ink/85" />
        <div className="absolute inset-0 bg-[radial-gradient(75%_75%_at_50%_45%,transparent_0%,var(--color-ink)_100%)] opacity-50" />
      </LoomScene>
    </div>
  );
}
