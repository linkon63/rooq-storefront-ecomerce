"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { FiShoppingBag, FiX, FiZap } from "react-icons/fi";
import { useCart } from "@/hooks/use-cart";
import type { ProductCard, ProductDetail } from "@/types/storefront/catalog";
import { resolveSpotlightCartInput } from "./highlight-cart-button";

type SpotlightSareeHostProps = {
  card: ProductCard;
  detail: ProductDetail | null;
};

const DWELL_BEFORE_ENTER_MS = 900;
const STAY_IN_CENTER_SECONDS = 8;

/**
 * Watches when a shopper lingers in "In the spotlight", then walks an articulated
 * SVG saree-clad host from the right into the middle of the screen with a human
 * stride, shows her Buy now / Cart tooltip, and walks her off to the left.
 */
export function SpotlightSareeHost({ card, detail }: SpotlightSareeHostProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const girlRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const router = useRouter();
  const { add, pending } = useCart();
  const { input, soldOut } = resolveSpotlightCartInput(card, detail);

  useEffect(() => {
    const section = anchorRef.current?.closest("section");
    if (!section || dismissed) return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!dwellTimer) {
            dwellTimer = setTimeout(() => setActive(true), DWELL_BEFORE_ENTER_MS);
          }
        } else {
          if (dwellTimer) {
            clearTimeout(dwellTimer);
            dwellTimer = null;
          }
          setActive(false);
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      if (dwellTimer) clearTimeout(dwellTimer);
    };
  }, [dismissed]);

  useEffect(() => {
    const stage = stageRef.current;
    const girl = girlRef.current;
    const tooltip = tooltipRef.current;
    if (!active || !stage || !girl || !tooltip) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([stage, girl, tooltip], { clearProps: "all", opacity: 1 });
      const leaveTimer = setTimeout(() => setActive(false), STAY_IN_CENTER_SECONDS * 1000);
      return () => clearTimeout(leaveTimer);
    }

    const q = gsap.utils.selector(girl);
    const legL = q("[data-leg-l]");
    const legR = q("[data-leg-r]");
    const armL = q("[data-arm-l]");
    const armR = q("[data-arm-r]");
    const torso = q("[data-torso]");
    const hem = q("[data-hem]");

    const enterDistance = Math.max(260, Math.round(window.innerWidth * 0.55));
    const exitDistance = -Math.max(280, Math.round(window.innerWidth * 0.65));

    // Continuous human stride loop (paused while standing in the middle)
    const walkCycle = gsap.timeline({ repeat: -1, paused: true });
    walkCycle
      .to(legL, { rotation: 16, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
      .to(legR, { rotation: -16, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
      .to(armL, { rotation: -10, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
      .to(armR, { rotation: 10, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
      .to(torso, { y: -4, rotation: -1.4, duration: 0.11, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0)
      .to(hem, { skewX: 2.5, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);

    const stopWalking = () => {
      walkCycle.pause();
      gsap.to([legL, legR, armL, armR, torso], {
        rotation: 0,
        y: 0,
        duration: 0.22,
        ease: "power2.out",
      });
      gsap.to(hem, { skewX: 0, duration: 0.22, ease: "power2.out" });
    };

    gsap.set(stage, { x: enterDistance, opacity: 0 });
    gsap.set(tooltip, { scale: 0.85, y: 10, opacity: 0, transformOrigin: "bottom center" });

    const master = gsap.timeline({
      onComplete: () => {
        walkCycle.kill();
        setActive(false);
      },
    });
    timelineRef.current = master;

    // 1. Walk in from the right to the center of the screen
    master
      .call(() => {
        walkCycle.play(0);
      })
      .to(stage, { x: 0, opacity: 1, duration: 1.9, ease: "power1.inOut" })
      // 2. Pause in the middle, gesture & show tooltip
      .call(stopWalking)
      .to(armL, { rotation: 14, duration: 0.3, ease: "power2.out" })
      .to(tooltip, { scale: 1, y: 0, opacity: 1, duration: 0.38, ease: "back.out(2)" }, "-=0.15")
      // 3. Wait in the center (paused automatically if user hovers tooltip)
      .to({}, { duration: STAY_IN_CENTER_SECONDS })
      // 4. Hide tooltip and walk off to the left
      .to(tooltip, { scale: 0.9, y: 6, opacity: 0, duration: 0.25, ease: "power2.in" })
      .call(() => {
        if (hoveredRef.current) {
          master.pause();
          return;
        }
        walkCycle.play(0);
      })
      .to(stage, { x: exitDistance, opacity: 0, duration: 2.0, ease: "power1.in" });

    return () => {
      timelineRef.current = null;
      walkCycle.kill();
      master.kill();
    };
  }, [active]);

  async function handleAction(goToCheckout: boolean) {
    if (!input || soldOut) return;
    const ok = await add(input, { openDrawer: !goToCheckout });
    if (ok && goToCheckout) router.push("/checkout");
  }

  return (
    <div ref={anchorRef} className="pointer-events-none">
      {active && !dismissed ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center sm:bottom-6">
          <div
            ref={stageRef}
            onMouseEnter={() => {
              hoveredRef.current = true;
            }}
            onMouseLeave={() => {
              hoveredRef.current = false;
              if (timelineRef.current?.paused()) {
                timelineRef.current.play();
              }
            }}
            className="pointer-events-auto flex flex-col items-center gap-2 sm:flex-row sm:items-end sm:gap-3"
          >
            {/* Tooltip speech bubble */}
            <div
              ref={tooltipRef}
              role="status"
              className="relative max-w-[260px] rounded border border-gold/60 bg-paper p-3.5 shadow-sheet sm:mb-12"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-[linear-gradient(90deg,var(--color-ink)_0_35%,var(--color-gold)_35%_65%,var(--color-dye)_65%_100%)]"
              />
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full text-stone transition-colors hover:bg-selvedge hover:text-ink"
              >
                <FiX aria-hidden className="size-3.5" />
              </button>

              <p className="pr-5 text-xs font-medium leading-relaxed text-ink">
                &ldquo;Buy it or cart it, Ma&apos;am — <span className="text-dye">{card.name}</span> is waiting for you!&rdquo;
              </p>

              {input && !soldOut ? (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void handleAction(true)}
                    className="type-label relative inline-flex h-8 items-center gap-1.5 bg-dye px-3 text-chalk transition-colors hover:bg-dye-deep disabled:opacity-50"
                  >
                    <span aria-hidden className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-85 motion-reduce:animate-none" />
                      <span className="relative inline-flex size-2 rounded-full bg-selvedge" />
                    </span>
                    <FiZap aria-hidden className="size-3" />
                    <span>Buy now</span>
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void handleAction(false)}
                    className="type-label inline-flex h-8 items-center gap-1.5 border border-ink px-2.5 text-ink transition-colors hover:bg-ink hover:text-chalk disabled:opacity-50"
                  >
                    <FiShoppingBag aria-hidden className="size-3" />
                    <span>Cart</span>
                  </button>
                </div>
              ) : null}

              {/* Speech bubble pointer toward the saree girl */}
              <span
                aria-hidden
                className="hidden sm:block absolute -right-2 bottom-5 size-3.5 rotate-45 border-r border-t border-gold/60 bg-paper"
              />
            </div>

            {/* Articulated walking SVG Saree Girl */}
            <div ref={girlRef} className="w-24 shrink-0 drop-shadow-[0_10px_18px_rgba(28,57,52,0.18)] sm:w-28">
              <SareeGirlSvg />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Articulated flat-vector SVG of a Bangladeshi woman in a white & maroon-paar suti saree. */
function SareeGirlSvg() {
  return (
    <svg viewBox="0 0 180 310" fill="none" aria-hidden="true" className="h-auto w-full overflow-visible">
      {/* Ground shadow */}
      <ellipse cx="90" cy="296" rx="44" ry="7" fill="#1c3934" fillOpacity="0.16" />

      {/* Articulated feet / lower legs peeking beneath the saree hem */}
      <g data-leg-l style={{ transformOrigin: "80px 248px" }}>
        <path d="M76 250 L72 286" stroke="#f3ccb0" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="68" cy="289" rx="9" ry="4" fill="#7d1434" />
      </g>
      <g data-leg-r style={{ transformOrigin: "102px 248px" }}>
        <path d="M100 250 L104 286" stroke="#f3ccb0" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="100" cy="289" rx="9" ry="4" fill="#7d1434" />
      </g>

      <g data-torso style={{ transformOrigin: "90px 180px" }}>
        {/* Hair back */}
        <path d="M68 42 C66 20, 114 20, 112 42 L114 68 C108 76, 72 76, 66 68 Z" fill="#1e2433" />

        {/* Neck & face */}
        <rect x="82" y="64" width="16" height="16" rx="6" fill="#f3ccb0" />
        <ellipse cx="90" cy="48" rx="18" ry="22" fill="#f6d5bc" />

        {/* Hair front parting */}
        <path
          d="M72 44 C73 28, 90 25, 90 32 C90 25, 107 28, 108 44 C102 36, 94 35, 90 36 C86 35, 78 36, 72 44 Z"
          fill="#1e2433"
        />
        <circle cx="90" cy="43" r="1.8" fill="#9b1a41" />
        <ellipse cx="83" cy="49" rx="2" ry="1.3" fill="#1e2433" />
        <ellipse cx="97" cy="49" rx="2" ry="1.3" fill="#1e2433" />
        <path d="M85 58 Q90 62 95 58" stroke="#9b1a41" strokeWidth="1.4" strokeLinecap="round" />

        {/* Gold Jhumka earrings */}
        <circle cx="71" cy="54" r="2.2" fill="#d1b072" />
        <path d="M69 56 L73 56 L74 63 L68 63 Z" fill="#a08c6b" />
        <circle cx="109" cy="54" r="2.2" fill="#d1b072" />
        <path d="M107 56 L111 56 L112 63 L106 63 Z" fill="#a08c6b" />

        {/* Maroon blouse */}
        <path d="M63 82 C70 76, 110 76, 117 82 L124 106 L110 110 L108 118 L72 118 L70 110 L56 106 Z" fill="#7d1434" />

        {/* Left arm (swings while walking, gestures toward Buy Now when paused) */}
        <g data-arm-l style={{ transformOrigin: "62px 94px" }}>
          <path d="M60 100 Q42 112 36 102" stroke="#f3ccb0" strokeWidth="8.5" strokeLinecap="round" />
          <circle cx="35" cy="101" r="4.8" fill="#f6d5bc" />
        </g>

        {/* Right arm with rose bouquet */}
        <g data-arm-r style={{ transformOrigin: "116px 94px" }}>
          <path d="M117 100 Q124 126 106 135" stroke="#f3ccb0" strokeWidth="8.5" strokeLinecap="round" />
          <path d="M104 135 L100 149 M106 135 L108 149" stroke="#1c3934" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="102" cy="129" r="4" fill="#9b1a41" />
          <circle cx="109" cy="132" r="3.5" fill="#9b1a41" />
          <circle cx="105" cy="123" r="3.5" fill="#7d1434" />
        </g>

        {/* White suti saree body & swaying hem */}
        <g data-hem style={{ transformOrigin: "90px 120px" }}>
          <path
            d="M72 118 L108 118 L142 266 C122 276, 102 274, 92 266 L88 278 C68 282, 46 280, 38 272 Z"
            fill="#f8f5ef"
            stroke="#dccaad"
            strokeWidth="1"
          />
          <path
            d="M72 118 L105 80 L114 84 L96 144 L86 276 L76 276 L86 144 Z"
            fill="#f8f5ef"
            stroke="#dccaad"
            strokeWidth="0.8"
          />
          <path d="M103 80 L112 83 L95 144 L88 276 L78 276 L86 144 Z" fill="#7d1434" />
          <path
            d="M38 272 C52 280, 74 281, 88 276 L92 266 C106 274, 126 274, 142 266 L144 275 C124 285, 102 284, 90 276 L88 284 C68 289, 44 287, 36 279 Z"
            fill="#7d1434"
          />
          <circle cx="68" cy="156" r="3" fill="#9b1a41" />
          <circle cx="106" cy="154" r="3" fill="#9b1a41" />
          <circle cx="58" cy="196" r="3" fill="#9b1a41" />
          <circle cx="114" cy="194" r="3" fill="#9b1a41" />
          <circle cx="52" cy="238" r="3" fill="#9b1a41" />
          <circle cx="122" cy="236" r="3" fill="#9b1a41" />
          <circle cx="72" cy="222" r="2.5" fill="#a08c6b" />
          <circle cx="102" cy="218" r="2.5" fill="#a08c6b" />
        </g>
      </g>
    </svg>
  );
}
