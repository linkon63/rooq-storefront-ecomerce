/** Tailwind's `md` breakpoint — below it the storefront is in its phone layout. */
export const PHONE_QUERY = "(max-width: 767px)";

/** True on phone-width screens. Only call from event handlers or effects. */
export function isPhoneViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;
}
