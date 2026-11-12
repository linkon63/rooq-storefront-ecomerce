/**
 * Content & marketing smoke test — calls the real route handlers in-process:
 * sections, news (multipart cover), product discounts, campaigns (images),
 * reviews (photos, fit feedback, aggregates). Everything it creates is
 * deleted again.
 *
 *   pnpm exec tsx --conditions=react-server scripts/smoke-content.ts
 */
import "dotenv/config";
import assert from "node:assert/strict";
import sharp from "sharp";
import { NextRequest } from "next/server";
import { prisma } from "../lib/server/prisma";
import { signAccessToken } from "../lib/server/auth/jwt";
import * as sections from "../app/api/v1/sections/route";
import * as section from "../app/api/v1/sections/[id]/route";
import * as news from "../app/api/v1/news/route";
import * as newsManage from "../app/api/v1/news/manage/route";
import * as newsOne from "../app/api/v1/news/[id]/route";
import * as newsSlug from "../app/api/v1/news/slug/[slug]/route";
import * as discounts from "../app/api/v1/product-discounts/route";
import * as discount from "../app/api/v1/product-discounts/[id]/route";
import * as campaigns from "../app/api/v1/campaigns/route";
import * as campaign from "../app/api/v1/campaigns/[id]/route";
import * as campaignStatus from "../app/api/v1/campaigns/[id]/status/route";
import * as campaignSections from "../app/api/v1/campaigns/sections/route";
import * as productReviews from "../app/api/v1/products/[id]/reviews/route";
import * as reviews from "../app/api/v1/reviews/route";
import * as reviewsPending from "../app/api/v1/reviews/pending/route";
import * as review from "../app/api/v1/reviews/[id]/route";

const BASE = "http://localhost:3002/api/v1";
const stamp = Date.now();
type Json = Record<string, unknown>;
const ctx = <P extends Record<string, string>>(params: P) => ({ params: Promise.resolve(params) });
const none = ctx({});

function req(path: string, init: { method?: string; body?: unknown; token?: string } = {}) {
  const headers = new Headers();
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);
  let body: BodyInit | undefined;
  if (init.body instanceof FormData) body = init.body;
  else if (init.body !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(init.body);
  }
  return new NextRequest(`${BASE}${path}`, { method: init.method ?? "GET", headers, body });
}
const json = async (response: Response) => (await response.json()) as Json;
const step = (name: string) => console.log(`  ✓ ${name}`);

async function png(hex: string): Promise<File> {
  const buffer = await sharp({ create: { width: 64, height: 48, channels: 3, background: hex } }).png().toBuffer();
  return new File([new Uint8Array(buffer)], `${hex.slice(1)}.png`, { type: "image/png" });
}

async function main() {
  const admin = await prisma.user.findFirstOrThrow({ where: { role: { name: { in: ["superadmin", "admin"] } } } });
  const adminToken = await signAccessToken(admin.id);
  const role = await prisma.role.findFirstOrThrow({ where: { name: "user" } });
  const shopper = await prisma.user.create({ data: { name: "Smoke Shopper", email: `smoke+content${stamp}@rooq.local`, roleId: role.id } });
  const shopperToken = await signAccessToken(shopper.id);
  const product = await prisma.product.findFirstOrThrow({ where: { archivedAt: null }, include: { variants: { take: 1 } } });

  try {
    console.log("sections");
    let res = await sections.POST(req("/sections", { method: "POST", token: adminToken, body: { title: `Smoke ${stamp}`, page: "smoke", position: 9 } }), none);
    assert.equal(res.status, 201);
    const sec = await json(res);
    res = await sections.POST(req("/sections", { method: "POST", token: shopperToken, body: { title: "x", page: "x", position: 1 } }), none);
    assert.equal(res.status, 403);
    res = await section.PATCH(req(`/sections/${sec.id}`, { method: "PATCH", token: adminToken, body: { position: 10 } }), ctx({ id: String(sec.id) }));
    assert.equal((await json(res)).position, 10);
    res = await campaignSections.GET(req("/campaigns/sections", { token: adminToken }), none);
    assert.ok(((await res.json()) as unknown[]).length > 0);
    step("create / 403 for shopper / patch / campaign sections list");

    console.log("news");
    const form = new FormData();
    form.append("title", "Smoke Article");
    form.append("slug", `smoke-${stamp}`);
    form.append("content", "Body");
    form.append("isPublished", "false");
    form.append("image", await png("#AA3355"));
    res = await news.POST(req("/news", { method: "POST", token: adminToken, body: form }), none);
    assert.equal(res.status, 201);
    const article = await json(res);
    assert.match(String(article.coverImageUrl), /^\/api\/v1\/media\//);
    res = await newsOne.GET(req(`/news/${article.id}`), ctx({ id: String(article.id) }));
    assert.equal(res.status, 404);
    const patch = new FormData();
    patch.append("isPublished", "true");
    patch.append("coverImageUrl", "");
    res = await newsOne.PATCH(req(`/news/${article.id}`, { method: "PATCH", token: adminToken, body: patch }), ctx({ id: String(article.id) }));
    const published = await json(res);
    assert.equal(published.isPublished, true);
    assert.equal(published.coverImageUrl, null);
    assert.ok(published.publishedAt);
    res = await newsSlug.GET(req(`/news/slug/smoke-${stamp}`), ctx({ slug: `smoke-${stamp}` }));
    assert.equal(res.status, 200);
    res = await news.POST(req("/news", { method: "POST", token: adminToken, body: { title: "Dup", slug: `smoke-${stamp}`, content: "x" } }), none);
    assert.equal(res.status, 409);
    res = await newsManage.GET(req("/news/manage", { token: adminToken }), none);
    assert.ok(((await res.json()) as unknown[]).length > 0);
    step("multipart create with cover / draft hidden / publish + remove cover / slug / 409 dup");

    console.log("product discounts");
    res = await discounts.POST(req("/product-discounts", { method: "POST", token: adminToken, body: { name: "Smoke", type: "fixed", value: 999999, productIds: [product.id] } }), none);
    assert.equal(res.status, 400);
    res = await discounts.POST(req("/product-discounts", { method: "POST", token: adminToken, body: { name: "Smoke", type: "percentage", value: 15, productIds: [product.id], startDate: "2026-01-01" } }), none);
    assert.equal(res.status, 201);
    const disc = await json(res);
    assert.equal(disc.value, 15);
    assert.equal(((disc.products as Json[])[0].product as Json).id, product.id);
    res = await discounts.GET(req("/product-discounts?search=smoke", { token: adminToken }), none);
    const list = await json(res);
    assert.ok((list.data as Json[]).some((row) => row.id === disc.id));
    res = await discount.PATCH(req(`/product-discounts/${disc.id}`, { method: "PATCH", token: adminToken, body: { status: "inactive", endDate: "2025-01-01" } }), ctx({ id: String(disc.id) }));
    assert.equal(res.status, 400);
    res = await discount.PATCH(req(`/product-discounts/${disc.id}`, { method: "PATCH", token: adminToken, body: { status: "inactive" } }), ctx({ id: String(disc.id) }));
    assert.equal((await json(res)).status, "inactive");
    step("fixed > price → 400 / create / list / window check / patch");

    console.log("campaigns");
    const cForm = new FormData();
    cForm.append("title", "Smoke Campaign");
    cForm.append("sectionId", String(sec.id));
    cForm.append("discountId", String(disc.id));
    cForm.append("images", await png("#112233"));
    cForm.append("images", await png("#445566"));
    res = await campaigns.POST(req("/campaigns", { method: "POST", token: adminToken, body: cForm }), none);
    assert.equal(res.status, 201);
    const camp = await json(res);
    assert.equal(camp.hasDiscount, true);
    const urls = camp.imageUrls as string[];
    assert.equal(urls.length, 2);
    assert.deepEqual((camp.images as Json[])[0].images, urls);
    const uForm = new FormData();
    uForm.append("keepImages", JSON.stringify([urls[1]]));
    uForm.append("discountId", "");
    res = await campaign.PATCH(req(`/campaigns/${camp.id}`, { method: "PATCH", token: adminToken, body: uForm }), ctx({ id: String(camp.id) }));
    const updated = await json(res);
    assert.deepEqual(updated.imageUrls, [urls[1]]);
    assert.equal(updated.hasDiscount, false);
    res = await campaignStatus.PATCH(req(`/campaigns/${camp.id}/status`, { method: "PATCH", token: adminToken, body: { status: "inactive" } }), ctx({ id: String(camp.id) }));
    assert.equal((await json(res)).status, "inactive");
    res = await campaigns.GET(req("/campaigns"), none);
    assert.ok(!((await res.json()) as Json[]).some((row) => row.id === camp.id));
    res = await campaigns.GET(req("/campaigns", { token: adminToken }), none);
    assert.ok(((await res.json()) as Json[]).some((row) => row.id === camp.id));
    res = await section.DELETE(req(`/sections/${sec.id}`, { method: "DELETE", token: adminToken }), ctx({ id: String(sec.id) }));
    assert.equal(res.status, 409);
    step("multipart create (2 images, discount) / keepImages + clear discount / status / public hides inactive / section in use");

    console.log("reviews");
    const rForm = new FormData();
    rForm.append("rating", "4");
    rForm.append("title", "Great tee");
    rForm.append("fitFeedback", "RUNS_SMALL");
    if (product.variants[0]) rForm.append("variantId", product.variants[0].id);
    rForm.append("photos", await png("#778899"));
    res = await productReviews.POST(req(`/products/${product.id}/reviews`, { method: "POST", token: shopperToken, body: rForm }), ctx({ id: product.id }));
    assert.equal(res.status, 201, JSON.stringify(await res.clone().json()));
    const rev = await json(res);
    assert.equal((rev.photos as unknown[]).length, 1);
    assert.equal(rev.isApproved, true);
    res = await productReviews.POST(req(`/products/${product.id}/reviews`, { method: "POST", token: shopperToken, body: { rating: 5 } }), ctx({ id: product.id }));
    assert.equal(res.status, 409);
    res = await productReviews.GET(req(`/products/${product.id}/reviews?withPhotos=true`), ctx({ id: product.id }));
    const page = await json(res);
    const summary = page.summary as { count: number; fit: { RUNS_SMALL: number } };
    assert.ok(summary.count >= 1 && summary.fit.RUNS_SMALL >= 1);
    let agg = await prisma.product.findUniqueOrThrow({ where: { id: product.id }, select: { ratingCount: true } });
    assert.equal(agg.ratingCount, summary.count);
    res = await review.PATCH(req(`/reviews/${rev.id}`, { method: "PATCH", token: shopperToken, body: { status: "REJECTED" } }), ctx({ id: String(rev.id) }));
    assert.equal(res.status, 403);
    res = await review.PATCH(req(`/reviews/${rev.id}`, { method: "PATCH", token: adminToken, body: { isApproved: false } }), ctx({ id: String(rev.id) }));
    assert.equal((await json(res)).status, "PENDING");
    res = await reviewsPending.GET(req("/reviews/pending", { token: adminToken }), none);
    assert.ok(((await json(res)).data as Json[]).some((row) => row.id === rev.id));
    res = await reviews.GET(req("/reviews?search=Great%20tee", { token: shopperToken }), none);
    assert.equal(res.status, 403);
    agg = await prisma.product.findUniqueOrThrow({ where: { id: product.id }, select: { ratingCount: true } });
    assert.equal(agg.ratingCount, summary.count - 1);
    res = await review.DELETE(req(`/reviews/${rev.id}`, { method: "DELETE", token: shopperToken }), ctx({ id: String(rev.id) }));
    assert.equal((await json(res)).message, "Review deleted successfully");
    step("multipart create with photo + fit / 409 dup / summary + aggregate / moderation guard / pending / delete");

    console.log("cleanup");
    await campaign.DELETE(req(`/campaigns/${camp.id}`, { method: "DELETE", token: adminToken }), ctx({ id: String(camp.id) }));
    await discount.DELETE(req(`/product-discounts/${disc.id}`, { method: "DELETE", token: adminToken }), ctx({ id: String(disc.id) }));
    await newsOne.DELETE(req(`/news/${article.id}`, { method: "DELETE", token: adminToken }), ctx({ id: String(article.id) }));
    res = await section.DELETE(req(`/sections/${sec.id}`, { method: "DELETE", token: adminToken }), ctx({ id: String(sec.id) }));
    assert.equal(res.status, 200);
    step("deleted campaign, discount, article, section");
  } finally {
    await prisma.user.delete({ where: { id: shopper.id } }).catch(() => undefined);
  }
  console.log("content smoke passed");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
