import sharp from "sharp";
import { darken, isLightColor, lighten } from "../../utils/color";

/** Silhouette families the placeholder generator can draw (viewBox 400×500). */
export type GarmentKind = "tee" | "shirt" | "dress" | "trousers" | "outerwear" | "shoe" | "tote" | "beanie";

const PATHS: Record<GarmentKind, string> = {
  tee: "M120 92 L170 70 Q200 96 230 70 L280 92 L342 150 L302 188 L280 168 L282 424 L118 424 L120 168 L98 188 L58 150 Z",
  shirt:
    "M126 86 L172 64 L200 104 L228 64 L274 86 L332 236 L300 246 L276 172 L280 432 L120 432 L124 172 L100 246 L68 236 Z",
  dress: "M162 66 L238 66 L250 150 Q300 300 334 444 L66 444 Q100 300 150 150 Z",
  trousers: "M128 66 L272 66 L288 444 L216 444 L200 184 L184 444 L112 444 Z",
  outerwear:
    "M118 80 L170 58 L200 112 L230 58 L282 80 L342 304 L306 314 L282 190 L288 452 L112 452 L118 190 L94 314 L58 304 Z",
  shoe: "M58 336 Q66 272 132 262 L204 250 Q244 240 264 272 Q302 300 342 306 Q364 312 364 342 L364 362 L58 362 Z",
  tote: "M108 182 L292 182 L308 432 L92 432 Z",
  beanie: "M110 300 Q110 138 200 128 Q290 138 290 300 Z",
};

const DETAILS: Partial<Record<GarmentKind, string>> = {
  shirt: '<path d="M200 104 L200 432" stroke="rgba(0,0,0,0.18)" stroke-width="2"/>',
  outerwear: '<path d="M200 112 L200 452" stroke="rgba(0,0,0,0.22)" stroke-width="3"/>',
  tote: '<path d="M150 182 Q150 96 200 96 Q250 96 250 182" fill="none" stroke="url(#garment)" stroke-width="14"/>',
  beanie: '<rect x="100" y="286" width="200" height="58" rx="10" fill="url(#garment)"/>',
  trousers: '<path d="M128 96 L272 96" stroke="rgba(0,0,0,0.18)" stroke-width="2"/>',
};

export type ArtOptions = {
  hex: string;
  kind: GarmentKind;
  /** 0 = full front shot, 1 = closer detail crop, 2 = flat lay on darker ground. */
  view?: 0 | 1 | 2;
  width?: number;
  height?: number;
};

/** A calm studio-style placeholder: neutral backdrop, soft shadow, garment silhouette in the colour. */
export function garmentSvg({ hex, kind, view = 0, width = 1200, height = 1500 }: ArtOptions): string {
  const backdropTop = view === 2 ? "#D9D3C7" : "#F4F1EB";
  const backdropBottom = view === 2 ? "#C9C1B2" : "#E6E0D5";
  const stroke = isLightColor(hex) ? darken(hex, 0.18) : "none";
  const transform = view === 1 ? "translate(-90 -60) scale(1.45)" : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${view === 2 ? 1 : 0}" y2="1">
      <stop offset="0" stop-color="${backdropTop}"/><stop offset="1" stop-color="${backdropBottom}"/>
    </linearGradient>
    <linearGradient id="garment" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${lighten(hex, 0.14)}"/><stop offset="1" stop-color="${darken(hex, 0.16)}"/>
    </linearGradient>
    <radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="rgba(0,0,0,0.20)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <rect width="400" height="500" fill="url(#bg)"/>
  <g transform="${transform}">
    <ellipse cx="200" cy="462" rx="150" ry="18" fill="url(#shadow)"/>
    <path d="${PATHS[kind]}" fill="url(#garment)" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
    ${DETAILS[kind] ?? ""}
  </g>
</svg>`;
}

/** Soft two-tone gradient tile (category / collection / brand art). */
export function toneSvg(hexA: string, hexB: string, width = 1600, height = 900): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 160 90">
  <defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${hexA}"/><stop offset="1" stop-color="${hexB}"/>
  </linearGradient></defs>
  <rect width="160" height="90" fill="url(#t)"/>
  <circle cx="122" cy="30" r="34" fill="rgba(255,255,255,0.10)"/>
  <circle cx="30" cy="78" r="26" fill="rgba(0,0,0,0.06)"/>
</svg>`;
}

/** Monogram-style brand mark without text (no font dependency). */
export function brandMarkSvg(hex: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 60 60">
  <rect width="60" height="60" fill="#FAF8F4"/>
  <circle cx="30" cy="30" r="20" fill="none" stroke="${hex}" stroke-width="3"/>
  <path d="M22 40 L22 20 L32 20 Q40 20 40 27 Q40 33 32 33 L22 33 M31 33 L40 40" fill="none" stroke="${hex}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/** Rasterise an SVG to PNG bytes (saveImage then re-encodes to WebP). */
export function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png().toBuffer();
}
