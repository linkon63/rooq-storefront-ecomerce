/** Where (and in what dye) the shopper picked a colour, so the gallery can pour the new photos out from that spot. */
export const COLOUR_RIPPLE_EVENT = "rooq:colour-ripple";

export type ColourRippleDetail = { x: number; y: number; hex: string };

export function announceColourRipple(from: HTMLElement, hex: string) {
  const box = from.getBoundingClientRect();
  const detail: ColourRippleDetail = { x: box.left + box.width / 2, y: box.top + box.height / 2, hex };
  window.dispatchEvent(new CustomEvent<ColourRippleDetail>(COLOUR_RIPPLE_EVENT, { detail }));
}
