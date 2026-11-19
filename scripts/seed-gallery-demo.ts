/**
 * Fills the customer gallery with demo entries (placeholder images, made-up names) so the page can be previewed.
 * Demo rows carry contact_phone = "DEMO". Safe to rerun; remove them with --remove.
 *
 *   pnpm exec tsx --conditions=react-server scripts/seed-gallery-demo.ts [--remove]
 */
import "dotenv/config";
import sharp from "sharp";
import { prisma } from "../lib/server/prisma";
import { saveImage } from "../lib/server/media/save-image";
import { releaseMedia } from "../lib/server/media/release";

const MARK = "DEMO";

type Demo = { name: string; city: string; rating: number; feedback: string; source: "WEBSITE" | "FACEBOOK"; colors: [string, string]; photos: number };

const DEMOS: Demo[] = [
  { name: "Nusrat Jahan", city: "Dhaka", rating: 5, feedback: "Shareetar rong ekdom chobir moto. Kapor onek soft, pora comfortable. Biyer onushthane sobai jiggesh korechhe!", source: "WEBSITE", colors: ["#7b1e3a", "#e8a33d"], photos: 2 },
  { name: "Farzana Akter", city: "Chattogram", rating: 5, feedback: "Delivery fast chhilo, packaging-o khub sundor. Border-er kaj dekhe mugdho hoyechi.", source: "WEBSITE", colors: ["#0f4c5c", "#9ad1d4"], photos: 1 },
  { name: "Tasnim Rahman", city: "Sylhet", rating: 4, feedback: "Quality bhalo, tobe rong ektu halka lagche screen-er cheye. Tarpor-o pore khub sundor lage.", source: "WEBSITE", colors: ["#5b3a8c", "#f2c1d9"], photos: 3 },
  { name: "Mim Sultana", city: "Rajshahi", rating: 5, feedback: "Eid-e pore gelam, sobai prosongsha korlo. Abar order korbo inshallah.", source: "WEBSITE", colors: ["#2e6b3f", "#f4e3a1"], photos: 1 },
  { name: "Sadia Islam", city: "Khulna", rating: 5, feedback: "Kapor-er texture ar fall-ta darun. Price-er tulonay onek valo.", source: "WEBSITE", colors: ["#a3361f", "#fbd5a5"], photos: 2 },
  { name: "Rima Chowdhury", city: "Cumilla", rating: 4, feedback: "Overall khub bhalo, size-er blouse piece ektu boro hoyechilo, kintu tailor thik kore diyechhe.", source: "WEBSITE", colors: ["#1d3557", "#a8dadc"], photos: 1 },
  { name: "Anika Tabassum", city: "Dhaka", rating: 5, feedback: "Facebook-e Rooq-er page-e dekhe order korechilam. Jemon dekhechilam thik temni peyechi.", source: "FACEBOOK", colors: ["#e7ecf3", "#cfd8e6"], photos: 1 },
  { name: "Mehnaz Khan", city: "Gazipur", rating: 5, feedback: "Ami ekdom khushi! Shobar jonno recommend korbo.", source: "FACEBOOK", colors: ["#eef1f6", "#d6deea"], photos: 1 },
  { name: "Lamia Hossain", city: "Barishal", rating: 5, feedback: "Pasher bari-r apura-o dekhe order korlo. Sundor ekta collection.", source: "FACEBOOK", colors: ["#e9eef5", "#d2dae8"], photos: 1 },
];

const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > max) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines;
}

/** Portrait "saree" placeholder: gradient + drape stripes. */
function photoSvg(demo: Demo, index: number): string {
  const [a, b] = demo.colors;
  const shift = index * 60;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${index % 2 ? 1000 : 1100}" viewBox="0 0 800 1100">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="800" height="1100" fill="url(#g)"/>
<path d="M${-100 + shift} 1100 C 200 700, 500 600, ${900 - shift} 0" stroke="#ffffff" stroke-opacity=".35" stroke-width="90" fill="none"/>
<path d="M${-200 + shift} 1100 C 100 800, 400 700, ${800 - shift} 100" stroke="#000000" stroke-opacity=".12" stroke-width="40" fill="none"/>
<circle cx="400" cy="300" r="90" fill="#ffffff" fill-opacity=".55"/>
<text x="400" y="1040" font-family="sans-serif" font-size="34" fill="#ffffff" fill-opacity=".85" text-anchor="middle">Demo photo</text></svg>`;
}

/** Generic chat-style review screenshot (not a real platform capture). */
function screenshotSvg(demo: Demo): string {
  const lines = wrap(demo.feedback, 34).map((line, i) => `<text x="130" y="${250 + i * 38}" font-family="sans-serif" font-size="28" fill="#1c1e21">${esc(line)}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
<rect width="800" height="520" fill="#ffffff"/><rect width="800" height="90" fill="#f0f2f5"/>
<text x="40" y="58" font-family="sans-serif" font-size="30" font-weight="700" fill="#4b4f56">Page review (demo screenshot)</text>
<circle cx="70" cy="170" r="34" fill="#b0b8c4"/>
<text x="130" y="165" font-family="sans-serif" font-size="30" font-weight="700" fill="#1c1e21">${esc(demo.name)}</text>
<text x="130" y="205" font-family="sans-serif" font-size="24" fill="#f5a623">★★★★★</text>${lines.join("")}
<text x="130" y="480" font-family="sans-serif" font-size="22" fill="#8a8d91">Like · Reply · 2d</text></svg>`;
}

async function remove(): Promise<void> {
  const rows = await prisma.customerGalleryEntry.findMany({ where: { contactPhone: MARK }, select: { id: true, images: { select: { mediaId: true } } } });
  await prisma.customerGalleryEntry.deleteMany({ where: { contactPhone: MARK } });
  await releaseMedia(rows.flatMap((row) => row.images.map((image) => image.mediaId)));
  console.log(`✓ removed ${rows.length} demo entries`);
}

async function seed(): Promise<void> {
  await remove();
  for (const [i, demo] of DEMOS.entries()) {
    const mediaIds: string[] = [];
    const count = demo.source === "FACEBOOK" ? 1 : demo.photos;
    for (let p = 0; p < count; p++) {
      const svg = demo.source === "FACEBOOK" ? screenshotSvg(demo) : photoSvg(demo, p);
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      mediaIds.push((await saveImage(png, { alt: `Photo by ${demo.name}` })).id);
    }
    await prisma.customerGalleryEntry.create({
      data: {
        name: demo.name, city: demo.city, rating: demo.rating, feedback: demo.feedback, source: demo.source,
        status: "APPROVED", contactPhone: MARK, consentAt: new Date(),
        createdAt: new Date(Date.now() - i * 36e5 * 20),
        images: { create: mediaIds.map((mediaId, position) => ({ mediaId, position })) },
      },
    });
  }
  console.log(`✓ ${DEMOS.length} demo gallery entries`);
}

(process.argv.includes("--remove") ? remove() : seed())
  .catch((error: unknown) => {
    console.error("Gallery demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
