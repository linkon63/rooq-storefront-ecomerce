/**
 * How any page talks to Tulo, the panda shopping buddy, without importing
 * him. A page fires a cue ("this list is empty", "this page broke", "added to
 * bag") and the panda decides whether to say something. Tulo loads lazily
 * after first paint, so the last cue is kept for a few seconds and replayed
 * when he arrives.
 */

export type PandaCueKind = "empty" | "error" | "add-hover" | "added";
export type PandaCueDetail = { kind: PandaCueKind; at: number; path: string };

export const PANDA_CUE_EVENT = "rooq:panda-cue";
/** Tulo on screen: the home page's stitched needle points here when the thread is finished. */
export const PANDA_PAL_SELECTOR = "[data-panda-pal]";
/** Any Add to bag / Add to cart button across product cards, quick view and product pages. */
export const PANDA_ADD_BUTTON_SELECTOR = "[data-panda-add-to-bag]";
/** A cue older than this is stale by the time the panda mounts. */
export const PANDA_CUE_TTL_MS = 10_000;

let pending: PandaCueDetail | null = null;

export function pandaCue(kind: PandaCueKind) {
  if (typeof window === "undefined") return;
  const detail: PandaCueDetail = { kind, at: Date.now(), path: window.location.pathname };
  pending = detail;
  window.dispatchEvent(new CustomEvent<PandaCueDetail>(PANDA_CUE_EVENT, { detail }));
}

/** The cue fired before the panda mounted, if it is still fresh and for this page. Consumed once. */
export function takePendingPandaCue(path: string): PandaCueDetail | null {
  const cue = pending;
  pending = null;
  if (!cue || cue.path !== path || Date.now() - cue.at > PANDA_CUE_TTL_MS) return null;
  return cue;
}
