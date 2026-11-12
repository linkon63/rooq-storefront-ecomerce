/**
 * Catalog smoke test — calls the real catalog route handlers in-process
 * against the configured database. Creates a throwaway product (and colour /
 * size / chart / collection) and removes everything it made afterwards.
 *
 *   pnpm exec tsx --conditions=react-server scripts/smoke-catalog.ts
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { prisma } from "../lib/server/prisma";
import { signAccessToken } from "../lib/server/auth/jwt";
import * as products from "../app/api/v1/products/route";
import * as product from "../app/api/v1/products/[id]/route";
import * as productBySlug from "../app/api/v1/products/slug/[slug]/route";
import * as generate from "../app/api/v1/products/[id]/variants/generate/route";
import * as productVariants from "../app/api/v1/products/[id]/variants/route";
import * as bulk from "../app/api/v1/variants/bulk/route";
import * as variant from "../app/api/v1/variants/[id]/route";
import * as colors from "../app/api/v1/colors/route";
import * as sizes from "../app/api/v1/sizes/route";
import * as sizeCharts from "../app/api/v1/size-charts/route";
import * as productChart from "../app/api/v1/products/[id]/size-chart/route";
import * as collections from "../app/api/v1/collections/route";
import * as collectionSlug from "../app/api/v1/collections/slug/[slug]/route";
import * as looks from "../app/api/v1/collections/[id]/looks/route";
import * as inventory from "../app/api/v1/inventory/route";
import * as adjust from "../app/api/v1/inventory/adjust/route";
import * as logs from "../app/api/v1/inventory/logs/route";
import * as lowStock from "../app/api/v1/inventory/low-stock/route";
import * as backInStock from "../app/api/v1/back-in-stock/route";
import * as bisSummary from "../app/api/v1/back-in-stock/summary/route";
import * as category from "../app/api/v1/category/route";
import * as brands from "../app/api/v1/brands/route";
import * as suggestions from "../app/api/v1/search/suggestions/route";

const BASE = "http://localhost:3002/api/v1";
const stamp = Date.now().toString(36);
type Json = Record<string, unknown>;
type Ctx<P> = { params: Promise<P> };
const none: Ctx<Record<string, string>> = { params: Promise.resolve({}) };
const p = <P,>(params: P): Ctx<P> => ({ params: Promise.resolve(params) });

function req(path: string, init: { method?: string; body?: unknown; token?: string } = {}) {
  const headers = new Headers();
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);
  if (init.body !== undefined) headers.set("content-type", "application/json");
  return new NextRequest(`${BASE}${path}`, { method: init.method ?? "GET", headers, body: init.body === undefined ? undefined : JSON.stringify(init.body) });
}
const json = async (res: Response) => (await res.json()) as Json;
const ok = (name: string) => console.log(`  ✓ ${name}`);

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: { name: "superadmin" } }, select: { id: true } });
  assert.ok(admin, "seeded superadmin required");
  const token = await signAccessToken(admin.id);
  const [brand, leaf] = await Promise.all([
    prisma.brand.findFirstOrThrow({ select: { id: true } }),
    prisma.category.findFirstOrThrow({ where: { children: { none: {} } }, select: { id: true } }),
  ]);
  const created: { productId?: string; colorId?: string; sizeIds: string[]; chartId?: string; collectionId?: string } = { sizeIds: [] };

  try {
    let res = await products.GET(req("/products?limit=5&sort=price_asc"), none);
    let body = await json(res);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.data) && (body.meta as Json).totalPages !== undefined && body.facets);
    ok(`GET /products → ${(body.meta as Json).total} products, facets ${Object.keys(body.facets as Json).join(",")}`);

    res = await products.GET(req("/products?scope=admin"), none);
    assert.equal(res.status, 403);
    ok("scope=admin without staff → 403");

    res = await colors.POST(req("/colors", { method: "POST", token, body: { name: `Smoke ${stamp}`, hex: "#12ab34" } }), none);
    body = await json(res);
    assert.equal(res.status, 201);
    assert.equal(body.hex, "#12AB34");
    created.colorId = body.id as string;
    for (const label of [`S${stamp}`, `L${stamp}`]) {
      res = await sizes.POST(req("/sizes", { method: "POST", token, body: { label, sizeGroup: "ALPHA" } }), none);
      body = await json(res);
      assert.equal(res.status, 201, JSON.stringify(body));
      created.sizeIds.push(body.id as string);
    }
    ok("colour + sizes created");

    res = await products.POST(
      req("/products", {
        method: "POST",
        token,
        body: { name: `Smoke Tee ${stamp}`, styleCode: `SMK-${stamp}`, brandId: brand.id, categoryId: leaf.id, price: 1500, compareAtPrice: 1900, status: "active", department: "MEN", fit: "RELAXED", occasions: ["CASUAL"], features: ["Soft cotton"] },
      }),
      none,
    );
    body = await json(res);
    assert.equal(res.status, 201, JSON.stringify(body));
    created.productId = body.id as string;
    assert.ok(body.publishedAt && body.isOnSale === true && body.discountPercent === 21);
    ok("POST /products → 201, on sale 21%");

    res = await products.POST(req("/products", { method: "POST", token, body: { name: "x", brandId: brand.id, categoryId: leaf.id, price: 1, foo: 1 } }), none);
    assert.equal(res.status, 400);
    ok("unknown field → 400");

    const id = created.productId;
    res = await generate.POST(req(`/products/${id}/variants/generate`, { method: "POST", token, body: { colorIds: [created.colorId], sizeIds: created.sizeIds, stock: 4, dryRun: true } }), p({ id }));
    body = await json(res);
    assert.equal((body.planned as unknown[]).length, 2);
    res = await generate.POST(req(`/products/${id}/variants/generate`, { method: "POST", token, body: { colorIds: [created.colorId], sizeIds: created.sizeIds, stock: 4 } }), p({ id }));
    body = await json(res);
    assert.equal(res.status, 201, JSON.stringify(body));
    const variants = body.created as { id: string; sku: string; stock: number; isDefault: boolean }[];
    assert.equal(variants.length, 2);
    assert.ok(variants[0].isDefault && variants[0].sku.startsWith(`SMK-${stamp}`.toUpperCase()));
    res = await generate.POST(req(`/products/${id}/variants/generate`, { method: "POST", token, body: { colorIds: [created.colorId], sizeIds: created.sizeIds } }), p({ id }));
    body = await json(res);
    assert.equal(res.status, 200);
    assert.equal((body.skipped as unknown[]).length, 2);
    ok(`matrix: dry run, create (${variants[0].sku}), re-run skips existing`);

    res = await bulk.PATCH(req("/variants/bulk", { method: "PATCH", token, body: { items: [{ id: variants[1].id, stock: 0, price: 1400 }], reason: "smoke" } }), none);
    assert.deepEqual(await json(res), { updated: 1 });
    res = await productVariants.GET(req(`/products/${id}/variants`, { token }), p({ id }));
    const adminVariants = (await res.json()) as { id: string; stock: number; priceOverride: number | null }[];
    assert.equal(adminVariants.find((v) => v.id === variants[1].id)?.stock, 0);
    ok("bulk edit → absolute stock + price override");

    res = await backInStock.POST(req("/back-in-stock", { method: "POST", body: { variantId: variants[1].id, email: `smoke+${stamp}@rooq.local` } }), none);
    assert.equal(res.status, 201);
    res = await backInStock.POST(req("/back-in-stock", { method: "POST", body: { variantId: variants[0].id, email: `smoke+${stamp}@rooq.local` } }), none);
    assert.equal(res.status, 400);
    res = await bisSummary.GET(req("/back-in-stock/summary", { token }), none);
    assert.ok(((await res.json()) as { variantId: string }[]).some((row) => row.variantId === variants[1].id));
    ok("back-in-stock request (idempotent), in-stock → 400, summary");

    res = await adjust.POST(req("/inventory/adjust", { method: "POST", token, body: { variantId: variants[1].id, change: 3, type: "RESTOCK", reason: "smoke" } }), none);
    body = await json(res);
    assert.equal(res.status, 201, JSON.stringify(body));
    assert.equal((body.variant as Json).stock, 3);
    res = await adjust.POST(req("/inventory/adjust", { method: "POST", token, body: { variantId: variants[1].id, change: -10 } }), none);
    assert.equal(res.status, 400);
    res = await logs.GET(req(`/inventory/logs?variantId=${variants[1].id}`, { token }), none);
    body = await json(res);
    assert.deepEqual((body.data as { type: string }[]).map((m) => m.type), ["RESTOCK", "ADJUSTMENT", "INITIAL"]);
    res = await inventory.GET(req(`/inventory?productId=${id}&lowStock=true`, { token }), none);
    body = await json(res);
    assert.equal((body.data as unknown[]).length, 2);
    res = await lowStock.GET(req("/inventory/low-stock?limit=5", { token }), none);
    assert.equal(res.status, 200);
    ok("adjust (+3 restock, negative refused), ledger, low-stock list");

    res = await sizeCharts.POST(
      req("/size-charts", { method: "POST", token, body: { name: `Smoke chart ${stamp}`, rows: created.sizeIds.map((sizeId, i) => ({ sizeId, measurements: [{ label: "Chest", valueCm: 96 + i * 4 }, { label: "Length", valueCm: 70 }] })) } }),
      none,
    );
    body = await json(res);
    assert.equal(res.status, 201, JSON.stringify(body));
    created.chartId = body.id as string;
    await product.PATCH(req(`/products/${id}`, { method: "PATCH", token, body: { sizeChartId: created.chartId } }), p({ id }));
    res = await productChart.GET(req(`/products/${id}/size-chart`), p({ id }));
    body = await json(res);
    assert.deepEqual(body.columns, ["Chest", "Length"]);
    ok("size chart create + product override resolves");

    res = await collections.POST(req("/collections", { method: "POST", token, body: { name: `Smoke edit ${stamp}`, type: "LOOKBOOK", productIds: [id] } }), none);
    body = await json(res);
    assert.equal(res.status, 201, JSON.stringify(body));
    created.collectionId = body.id as string;
    res = await looks.POST(req(`/collections/${created.collectionId}/looks`, { method: "POST", token, body: { title: "Look one", productIds: [id] } }), p({ id: created.collectionId }));
    assert.equal(res.status, 201);
    res = await collectionSlug.GET(req(`/collections/slug/${body.slug as string}?facets=true`), p({ slug: body.slug as string }));
    body = await json(res);
    assert.equal((body.products as unknown[]).length, 1);
    assert.equal(((body.looks as Json[])[0].products as unknown[]).length, 1);
    ok("collection + look + public slug page");

    res = await productBySlug.GET(req(`/products/slug/x`), p({ slug: (await prisma.product.findUniqueOrThrow({ where: { id }, select: { slug: true } })).slug }));
    body = await json(res);
    assert.equal(res.status, 200, JSON.stringify(body));
    assert.equal((body.colors as unknown[]).length, 1);
    assert.equal((body.sizes as unknown[]).length, 2);
    assert.ok(body.sizeChart && body.delivery && Array.isArray(body.related));
    assert.equal((body.variants as Json[])[0].barcode, undefined);
    ok("public product detail (no admin fields)");

    res = await products.GET(req(`/products?search=SMK-${stamp}&size=${(await prisma.size.findUniqueOrThrow({ where: { id: created.sizeIds[0] } })).slug}&onSale=true&department=MEN`), none);
    body = await json(res);
    assert.equal((body.meta as Json).total, 1, JSON.stringify(body.meta));
    ok("filters: search + size + onSale + department");

    res = await category.GET(req("/category"), none);
    assert.equal(res.status, 200);
    res = await brands.GET(req("/brands"), none);
    assert.equal(res.status, 200);
    res = await suggestions.GET(req(`/search/suggestions?q=Smoke`), none);
    assert.ok(((await res.json()) as unknown[]).length >= 1);
    ok("category tree, brands, suggestions");

    res = await variant.DELETE(req(`/variants/${variants[1].id}`, { method: "DELETE", token }), p({ id: variants[1].id }));
    assert.equal((await json(res)).archived, true);
    ok("variant with ledger history → archived");

    res = await product.DELETE(req(`/products/${id}`, { method: "DELETE", token }), p({ id }));
    assert.equal(res.status, 200);
    res = await product.GET(req(`/products/${id}`), p({ id }));
    assert.equal(res.status, 404);
    ok("archive product → public 404");
  } finally {
    if (created.collectionId) await prisma.collection.delete({ where: { id: created.collectionId } }).catch(() => null);
    if (created.productId) {
      await prisma.backInStockRequest.deleteMany({ where: { variant: { productId: created.productId } } });
      await prisma.stockMovement.deleteMany({ where: { variant: { productId: created.productId } } });
      await prisma.product.delete({ where: { id: created.productId } }).catch((e) => console.error(e));
    }
    if (created.chartId) await prisma.sizeChart.delete({ where: { id: created.chartId } }).catch(() => null);
    if (created.sizeIds.length) await prisma.size.deleteMany({ where: { id: { in: created.sizeIds } } });
    if (created.colorId) await prisma.color.delete({ where: { id: created.colorId } }).catch(() => null);
    await prisma.$disconnect();
  }
  console.log("catalog smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
