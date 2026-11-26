const INTERACTIONS = ["pointerdown", "pointermove", "keydown", "touchstart", "scroll", "wheel"] as const;
/** Without any input, deferred decoration still starts this long after load. */
const QUIET_MS = 5000;

/**
 * Runs `start` at the shopper's first input, or a few seconds after the page
 * has loaded: decoration never competes with first paint. Returns a cancel.
 */
export function whenPageSettled(start: () => void): () => void {
  let timer: number | undefined;
  const cancel = () => {
    window.clearTimeout(timer);
    window.removeEventListener("load", wait);
    INTERACTIONS.forEach((name) => window.removeEventListener(name, run));
  };
  const run = () => {
    cancel();
    start();
  };
  const wait = () => {
    timer = window.setTimeout(run, QUIET_MS);
  };
  INTERACTIONS.forEach((name) => window.addEventListener(name, run, { passive: true }));
  if (document.readyState === "complete") wait();
  else window.addEventListener("load", wait, { once: true });
  return cancel;
}
