"use client";

import dynamic from "next/dynamic";
import { usePageSettled } from "@/hooks/use-page-settled";
import type { PandaPalProps } from "./panda-pal";

const PandaPal = dynamic(() => import("./panda-pal").then((m) => m.PandaPal), { ssr: false });

/** Mounts Tulo after the page settles, so the panda never competes with the hero or the first paint. */
export function PandaPalLoader(props: PandaPalProps) {
  return usePageSettled() ? <PandaPal {...props} /> : null;
}
