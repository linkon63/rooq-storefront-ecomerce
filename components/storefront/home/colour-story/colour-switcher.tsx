"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { ColourSwatch } from "./colour-swatch";

gsap.registerPlugin(useGSAP);

export type Swatch = { slug: string; name: string; hex: string };

type ColourSwitcherProps = { title: string; lead: string; pickLabel: string; swatches: Swatch[]; panels: ReactNode[] };

/** How much of the dye tints the section ground (the rest is chalk), so text stays readable. */
const tint = (hex: string) => `color-mix(in oklab, ${hex} 18%, var(--color-chalk))`;

/**
 * Tabs of dye swatches. Choosing one floods the new tint out from the swatch
 * (a circle wiping over the old colour) and lifts that colour's cards in.
 * Arrow keys move between swatches. Reduced motion: the colour just changes.
 */
export function ColourSwitcher({ title, lead, pickLabel, swatches, panels }: ColourSwitcherProps) {
  const [active, setActive] = useState(0);
  const [ground, setGround] = useState(0);
  const scope = useRef<HTMLElement>(null);
  const flood = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const layer = flood.current;
    return () => {
      if (layer) gsap.killTweensOf(layer);
    };
  }, []);

  function pick(index: number, from?: HTMLElement) {
    if (index === active) return;
    setActive(index);
    const section = scope.current;
    const layer = flood.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!section || !layer || reduced) {
      setGround(index);
      return;
    }
    const box = section.getBoundingClientRect();
    const dot = from?.getBoundingClientRect();
    const at = dot ? `${dot.left + dot.width / 2 - box.left}px ${dot.top + dot.height / 2 - box.top}px` : "0px 0px";
    gsap.killTweensOf(layer);
    gsap.set(layer, { backgroundColor: tint(swatches[index]?.hex ?? "#fff"), clipPath: `circle(0% at ${at})`, opacity: 1 });
    gsap.to(layer, {
      clipPath: `circle(150% at ${at})`,
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: () => {
        setGround(index);
        gsap.set(layer, { opacity: 0 });
      },
    });
  }

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        `#${CSS.escape(`${id}-panel-${active}`)} [data-colour-card]`,
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: "expo.out", delay: 0.15 },
      );
    },
    { scope, dependencies: [active], revertOnUpdate: false },
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + swatches.length) % swatches.length;
    const button = event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[next];
    button?.focus();
    pick(next, button);
  };

  const style = { backgroundColor: tint(swatches[ground]?.hex ?? "#fff") } satisfies CSSProperties;

  return (
    <section ref={scope} aria-labelledby={`${id}-title`} style={style} className="relative isolate overflow-hidden py-12 lg:py-16">
      <div ref={flood} aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0" />
      <div className="page-gutter flex flex-col gap-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <h2 id={`${id}-title`} className="type-h2">
              {title}
            </h2>
            <p className="type-body max-w-[44ch] text-stone">{lead}</p>
          </div>
          <div role="tablist" aria-label={pickLabel} onKeyDown={onKeyDown} className="flex flex-wrap gap-3">
            {swatches.map((swatch, index) => (
              <ColourSwatch
                key={swatch.slug}
                swatch={swatch}
                selected={index === active}
                tabId={`${id}-tab-${index}`}
                panelId={`${id}-panel-${index}`}
                onPick={(button) => pick(index, button)}
              />
            ))}
          </div>
        </div>
        {panels.map((panel, index) => (
          <div key={index} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={index !== active}>
            {panel}
          </div>
        ))}
      </div>
    </section>
  );
}
