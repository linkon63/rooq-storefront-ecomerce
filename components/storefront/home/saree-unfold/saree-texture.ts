import { CanvasTexture, SRGBColorSpace } from "three";

/**
 * The saree's woven face, drawn once on a canvas: a dye-red body scattered
 * with small jamdani buti, a green-and-zari paar along both edges, and a
 * striped aanchal with a gold fringe at the far end. u runs along the six
 * yards (aanchal on the right), v across the width.
 */
const C = { body: "#9b1a41", bodyDeep: "#7d1434", ink: "#1c3934", gold: "#d1b072", goldDeep: "#a08c6b", cream: "#f0dfc6" };
const W = 2048;
const H = 768;
const BORDER = Math.round(H * 0.15);
const AANCHAL_FROM = Math.round(W * 0.7);

type Ctx = CanvasRenderingContext2D;

/** Fine warp and weft lines so the cloth reads as woven, not printed. */
function threads(ctx: Ctx, x: number, y: number, w: number, h: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000";
  for (let row = y; row < y + h; row += 3) ctx.fillRect(x, row, w, 1);
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = alpha * 0.5;
  for (let col = x; col < x + w; col += 4) ctx.fillRect(col, y, 1, h);
  ctx.restore();
}

/** A small jamdani flower: a diamond with four dots around it. */
function buti(ctx: Ctx, cx: number, cy: number, r: number, colour: string) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.62, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.62, cy);
  ctx.closePath();
  ctx.fill();
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
    ctx.beginPath();
    ctx.arc(cx + dx * r * 1.15, cy + dy * r * 1.15, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** One paar: green ground, zari lines and a row of temple triangles pointing into the body. */
function paar(ctx: Ctx, top: number, intoBody: 1 | -1) {
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, top, W, BORDER);
  const edge = intoBody === 1 ? top : top + BORDER;
  const at = (fraction: number) => edge + intoBody * BORDER * fraction;
  ctx.fillStyle = C.gold;
  ctx.fillRect(0, Math.min(at(0.08), at(0.08) + intoBody * 8), W, 8);
  ctx.fillRect(0, Math.min(at(0.26), at(0.26) + intoBody * 3), W, 3);
  ctx.fillRect(0, Math.min(at(0.9), at(0.9) + intoBody * 5), W, 5);
  const step = 44;
  for (let x = 0; x < W; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, at(0.36));
    ctx.lineTo(x + step, at(0.36));
    ctx.lineTo(x + step / 2, at(0.8));
    ctx.closePath();
    ctx.fillStyle = (x / step) % 2 === 0 ? C.gold : C.goldDeep;
    ctx.fill();
  }
}

/** The aanchal: bands across the width, larger buti, and the fringe at the end. */
function aanchal(ctx: Ctx) {
  const bands: [number, string][] = [[14, C.gold], [36, C.ink], [10, C.gold], [70, C.bodyDeep], [10, C.gold], [36, C.ink], [14, C.gold]];
  let x = AANCHAL_FROM;
  for (const [width, colour] of bands) {
    ctx.fillStyle = colour;
    ctx.fillRect(x, BORDER, width, H - BORDER * 2);
    x += width;
  }
  for (let y = BORDER + 40; y < H - BORDER - 20; y += 72) buti(ctx, AANCHAL_FROM + 132, y, 18, C.gold);
  const field = x + 24;
  for (let col = field; col < W - 60; col += 90) {
    for (let y = BORDER + 50; y < H - BORDER - 30; y += 96) buti(ctx, col + ((y / 96) % 2) * 45, y, 22, C.gold);
  }
  ctx.fillStyle = C.gold;
  for (let y = 0; y < H; y += 7) ctx.fillRect(W - 34, y, 34, 3);
}

export function createSareeTexture(anisotropy = 1): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new CanvasTexture(canvas);

  ctx.fillStyle = C.body;
  ctx.fillRect(0, 0, W, H);
  for (let y = BORDER + 36, row = 0; y < H - BORDER - 20; y += 64, row += 1) {
    for (let x = 30 + (row % 2) * 40; x < AANCHAL_FROM - 20; x += 80) buti(ctx, x, y, 9, C.gold);
  }
  aanchal(ctx);
  paar(ctx, 0, 1);
  paar(ctx, H - BORDER, -1);
  threads(ctx, 0, 0, W, H, 0.09);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
}
