"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMemo, useRef } from "react";

gsap.registerPlugin(useGSAP);

type CountUpProps = { value: number; locale: string; decimals?: number };

/**
 * A number that counts up from zero the first time it scrolls into view.
 * The real value is server-rendered; numbers already on screen when the page
 * loads (and reduced-motion visitors) keep it as is.
 */
export function CountUp({ value, locale, decimals = 0 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [locale, decimals],
  );

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        const state = { n: 0 };
        const show = () => {
          el.textContent = format.format(decimals ? state.n : Math.round(state.n));
        };
        show();
        const tween = gsap.to(state, { n: value, duration: 1.8, ease: "power3.out", paused: true, onUpdate: show });
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            tween.play();
            observer.disconnect();
          },
          { threshold: 0.6 },
        );
        observer.observe(el);
        return () => {
          observer.disconnect();
          tween.kill();
          el.textContent = format.format(value);
        };
      });
      return () => media.revert();
    },
    { dependencies: [value, format, decimals] },
  );

  return (
    <span ref={ref} className="tabular-nums">
      {format.format(value)}
    </span>
  );
}
