"use client";

import { useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { isHexColor, isLightColor } from "@/utils/color";
import { useProductSelection } from "./selection-context";
import { SutiAlponaBackdrop } from "./suti-alpona-backdrop";

/**
 * Computes CSS custom properties for the product page saree surface based on the active colour:
 * - No colour: returns undefined (renders pure white with no texture).
 * - White/near-white: pure white background with subtle neutral cotton threadwork.
 * - Any other colour: soft colour-tinted cotton ground with matching colour weave & alpona.
 */
function sareeThemeVars(hex: string | null): CSSProperties | undefined {
  if (!hex || !isHexColor(hex)) return undefined;
  const white = isLightColor(hex, 0.88);
  return {
    "--saree-color": hex,
    "--saree-bg": white ? "#ffffff" : `color-mix(in oklab, ${hex} 12%, var(--color-chalk))`,
    "--saree-thread": white ? "#9a9387" : hex,
  } as CSSProperties;
}

/**
 * Wraps the product details page in a saree texture tinted to the selected colour,
 * or a pure white untextured surface when the product has no colour.
 */
export function SareeSurface({ children }: { children: ReactNode }) {
  const { meta } = useProductSelection();
  const hex = meta.color?.hex ?? null;
  const style = sareeThemeVars(hex);

  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".storefront-root");
    if (!root) return;
    if (!style) {
      root.style.removeProperty("--saree-color");
      root.style.removeProperty("--saree-bg");
      root.style.removeProperty("--saree-thread");
      return;
    }
    const vars = style as Record<string, string>;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
      }
    };
  }, [hex, style]);

  if (!style) {
    return <div className="flex flex-col gap-20 bg-chalk pb-16 md:pb-24">{children}</div>;
  }

  return (
    <div className="suti-saree-surface flex flex-col gap-20 pb-16 md:pb-24" style={style}>
      <SutiAlponaBackdrop />
      {children}
    </div>
  );
}

