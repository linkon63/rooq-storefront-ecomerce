/** Pure hex colour helpers (swatches, placeholder art). Input "#RRGGBB" or "RRGGBB". */

export type Rgb = { r: number; g: number; b: number };

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX_PATTERN.test(value);
}

export function hexToRgb(hex: string): Rgb {
  const match = hex.match(HEX_PATTERN);
  const value = match ? parseInt(match[1], 16) : 0;
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const part = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

/** Linear mix: amount 0 → a, 1 → b. */
export function mixHex(a: string, b: string, amount: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex({ r: x.r + (y.r - x.r) * amount, g: x.g + (y.g - x.g) * amount, b: x.b + (y.b - x.b) * amount });
}

export const lighten = (hex: string, amount: number) => mixHex(hex, "#FFFFFF", amount);
export const darken = (hex: string, amount: number) => mixHex(hex, "#000000", amount);

/** WCAG relative luminance (0 black … 1 white). */
export function luminance(hex: string): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Light swatches (white, ecru) need a visible border on a light page. */
export function isLightColor(hex: string, threshold = 0.8): boolean {
  return luminance(hex) >= threshold;
}
