"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { PandaPalProps } from "./panda-pal";

const PandaPal = dynamic(() => import("./panda-pal").then((m) => m.PandaPal), { ssr: false });

/**
 * Mounts Tulo once the browser is idle after first paint, so the panda's
 * code never competes with the hero image or the first interaction.
 */
export function PandaPalLoader(props: PandaPalProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const go = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(go, { timeout: 1000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(go, 350);
    return () => clearTimeout(timer);
  }, []);

  return ready ? <PandaPal {...props} /> : null;
}
