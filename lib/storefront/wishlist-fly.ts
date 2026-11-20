export const WISHLIST_TARGET_ATTR = "data-wishlist-target";

export type FlyPoint = { x: number; y: number };

export type WishlistFlyEvent = {
  id: number;
  from: FlyPoint;
  to: FlyPoint;
};

type StartListener = (event: WishlistFlyEvent) => void;
type LandListener = (id: number) => void;

const startListeners = new Set<StartListener>();
const landListeners = new Set<LandListener>();
let nextFlyId = 1;

export function onWishlistFlyStart(listener: StartListener): () => void {
  startListeners.add(listener);
  return () => {
    startListeners.delete(listener);
  };
}

export function onWishlistFlyLand(listener: LandListener): () => void {
  landListeners.add(listener);
  return () => {
    landListeners.delete(listener);
  };
}

export function notifyWishlistFlyLand(id: number): void {
  for (const listener of landListeners) listener(id);
}

/**
 * Launch a flying heart from `sourceEl` toward the header wishlist icon.
 * Returns true if a flight was started (target visible and motion allowed).
 */
export function triggerWishlistFly(sourceEl: HTMLElement | null): boolean {
  if (typeof window === "undefined" || !sourceEl) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const targetEl = document.querySelector<HTMLElement>(`[${WISHLIST_TARGET_ATTR}]`);
  if (!targetEl) return false;

  const targetRect = targetEl.getBoundingClientRect();
  if (targetRect.width <= 0 || targetRect.height <= 0) return false;

  const sourceRect = sourceEl.getBoundingClientRect();
  if (sourceRect.width <= 0 || sourceRect.height <= 0) return false;

  const event: WishlistFlyEvent = {
    id: nextFlyId++,
    from: {
      x: sourceRect.left + sourceRect.width / 2,
      y: sourceRect.top + sourceRect.height / 2,
    },
    to: {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2,
    },
  };

  for (const listener of startListeners) listener(event);
  return true;
}

