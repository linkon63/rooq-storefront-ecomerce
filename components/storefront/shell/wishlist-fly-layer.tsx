"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FaHeart } from "react-icons/fa6";
import {
  notifyWishlistFlyLand,
  onWishlistFlyStart,
  type WishlistFlyEvent,
} from "@/lib/storefront/wishlist-fly";

const FLIGHT_DURATION = 0.65;

function FlyingHeart({
  flight,
  onDone,
}: {
  flight: WishlistFlyEvent;
  onDone: (id: number) => void;
}) {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) {
      notifyWishlistFlyLand(flight.id);
      onDone(flight.id);
      return;
    }

    const { from, to } = flight;
    // Control point creates a gentle upward arc toward the header.
    const ctrl = {
      x: (from.x + to.x) / 2 + (from.x > to.x ? 48 : -48),
      y: Math.min(from.y, to.y) - 90,
    };

    const progress = { t: 0 };
    gsap.set(el, {
      x: from.x,
      y: from.y,
      xPercent: -50,
      yPercent: -50,
      scale: 0.6,
      opacity: 1,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        notifyWishlistFlyLand(flight.id);
        onDone(flight.id);
      },
    });

    tl.to(el, {
      scale: 1.35,
      duration: 0.14,
      ease: "back.out(2.5)",
    }).to(
      progress,
      {
        t: 1,
        duration: FLIGHT_DURATION,
        ease: "power2.inOut",
        onUpdate: () => {
          const t = progress.t;
          const inv = 1 - t;
          const x = inv * inv * from.x + 2 * inv * t * ctrl.x + t * t * to.x;
          const y = inv * inv * from.y + 2 * inv * t * ctrl.y + t * t * to.y;
          const scale = t < 0.2 ? 1.35 : 1.35 - ((t - 0.2) / 0.8) * 0.75;
          const opacity = t > 0.85 ? 1 - (t - 0.85) / 0.15 : 1;
          const rotation = Math.sin(t * Math.PI) * (from.x > to.x ? -16 : 16);

          gsap.set(el, { x, y, scale, opacity, rotation });
        },
      },
      0.06,
    );

    return () => {
      tl.kill();
    };
  }, [flight, onDone]);

  return (
    <span
      ref={elRef}
      aria-hidden
      className="fixed left-0 top-0 inline-flex items-center justify-center text-dye drop-shadow-[0_4px_10px_rgba(155,26,65,0.35)] will-change-transform"
    >
      <FaHeart className="size-5" />
    </span>
  );
}

/** Global portal-like layer that animates flying wishlist hearts to the header. */
export function WishlistFlyLayer() {
  const [flights, setFlights] = useState<WishlistFlyEvent[]>([]);

  useEffect(() => {
    return onWishlistFlyStart((event) => {
      setFlights((prev) => [...prev, event]);
    });
  }, []);

  const handleDone = useCallback((id: number) => {
    setFlights((prev) => prev.filter((item) => item.id !== id));
  }, []);

  if (flights.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {flights.map((flight) => (
        <FlyingHeart key={flight.id} flight={flight} onDone={handleDone} />
      ))}
    </div>
  );
}
