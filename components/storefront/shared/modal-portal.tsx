"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders its children straight into `document.body`.
 *
 * Hand-rolled overlays (`fixed inset-0 z-…`) only outrank the sticky header
 * when nothing between them and the root creates a stacking context. Several
 * pages — the profile shell, for one — wrap their content in `relative z-10`,
 * which traps the overlay below the header no matter how high its own z-index
 * climbs. Portalling to the body sidesteps the trap entirely.
 *
 * Nothing renders on the server pass; the portal appears after mount, which is
 * fine because these overlays are only ever opened by a user interaction.
 */
export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
