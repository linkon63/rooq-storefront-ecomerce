/**
 * Foundation smoke test — calls the real route handlers in-process (no
 * `next dev`): auth flow, guards, validation, Prisma error mapping, upload and
 * media serving. Creates a throwaway customer and deletes it afterwards.
 *
 *   pnpm exec tsx --conditions=react-server scripts/smoke-foundation.ts
 */
import "dotenv/config";
import assert from "node:assert/strict";
import sharp from "sharp";
import { NextRequest } from "next/server";
import { prisma } from "../lib/server/prisma";
import { route } from "../lib/server/http";
import * as register from "../app/api/v1/auth/register/route";
import * as login from "../app/api/v1/auth/login/route";
import * as me from "../app/api/v1/auth/me/route";
import * as changePassword from "../app/api/v1/auth/change-password/route";
import * as forgot from "../app/api/v1/auth/forgot-password/route";
import * as reset from "../app/api/v1/auth/reset-password/route";
import * as logout from "../app/api/v1/auth/logout/route";
import * as upload from "../app/api/v1/upload/route";
import * as media from "../app/api/v1/media/[id]/route";

const BASE = "http://localhost:3002/api/v1";
const stamp = Date.now();
const email = `smoke+${stamp}@rooq.local`;
const phone = `017${String(stamp).slice(-8)}`;
const noParams = { params: Promise.resolve({}) };

type Json = Record<string, unknown>;

function req(path: string, init: { method?: string; body?: unknown; token?: string; headers?: Record<string, string> } = {}) {
  const headers = new Headers(init.headers);
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);
  let body: BodyInit | undefined;
  if (init.body instanceof FormData) body = init.body;
  else if (init.body !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(init.body);
  }
  return new NextRequest(`${BASE}${path}`, { method: init.method ?? "GET", headers, body });
}

async function json(response: Response): Promise<Json> {
  return (await response.json()) as Json;
}

function step(name: string) {
  console.log(`  ✓ ${name}`);
}

async function main() {
  await prisma.user.deleteMany({ where: { email: { startsWith: "smoke+" } } });
  console.log("auth");
  let res = await register.POST(req("/auth/register", { method: "POST", body: { name: "Smoke", email, phone, password: "secret123" } }), noParams);
  assert.equal(res.status, 201);
  const registered = await json(res);
  const token = registered.accessToken as string;
  assert.ok(token);
  assert.match(res.headers.get("set-cookie") ?? "", /access_token=.*HttpOnly/i);
  assert.equal((registered.user as { role: { name: string } }).role.name, "user");
  step("register → 201 + httpOnly cookie + customer role");

  res = await register.POST(req("/auth/register", { method: "POST", body: { name: "Smoke", email, phone: "01999999999", password: "secret123" } }), noParams);
  assert.equal(res.status, 409);
  assert.equal((await json(res)).message, "Email already exists");
  step("duplicate email → 409");

  res = await register.POST(req("/auth/register", { method: "POST", body: { name: "x", email: "bad", phone, password: "1", foo: 1 } }), noParams);
  const invalid = await json(res);
  assert.equal(res.status, 400);
  assert.ok(Array.isArray(invalid.message) && (invalid.message as string[]).includes("property foo should not exist"));
  assert.deepEqual(Object.keys(invalid).sort(), ["error", "message", "path", "statusCode"]);
  step("validation → 400 message[] (forbidNonWhitelisted) with Nest error body");

  res = await login.POST(req("/auth/login", { method: "POST", body: { identifier: `+88${phone}`, password: "secret123", rememberMe: true } }), noParams);
  assert.equal(res.status, 201);
  assert.match(res.headers.get("set-cookie") ?? "", /Max-Age=604800/);
  step("login by +88 phone → 201, remember-me cookie");

  res = await login.POST(req("/auth/login", { method: "POST", body: { identifier: email, password: "wrong" } }), noParams);
  assert.equal(res.status, 401);
  step("wrong password → 401");

  res = await me.GET(req("/auth/me", { token }), noParams);
  assert.equal(res.status, 200);
  assert.equal((await json(res)).email, email);
  res = await me.GET(req("/auth/me"), noParams);
  assert.equal(res.status, 401);
  step("GET /auth/me with Bearer → 200; without → 401");

  res = await me.PATCH(req("/auth/me", { method: "PATCH", token, body: { roleId: "00000000-0000-0000-0000-000000000000" } }), noParams);
  assert.equal(res.status, 400);
  step("PATCH /auth/me rejects roleId (no privilege escalation)");

  res = await changePassword.POST(req("/auth/change-password", { method: "POST", token, body: { currentPassword: "secret123", newPassword: "secret456" } }), noParams);
  assert.equal(res.status, 201);
  res = await forgot.POST(req("/auth/forgot-password", { method: "POST", body: { email } }), noParams);
  const resetToken = (await json(res)).token as string;
  assert.ok(resetToken);
  res = await reset.POST(req("/auth/reset-password", { method: "POST", body: { token: resetToken, password: "secret789" } }), noParams);
  assert.equal(res.status, 201);
  res = await reset.POST(req("/auth/reset-password", { method: "POST", body: { token: resetToken, password: "secret000" } }), noParams);
  assert.equal(res.status, 401);
  res = await login.POST(req("/auth/login", { method: "POST", body: { email, password: "secret789" } }), noParams);
  assert.equal(res.status, 201);
  step("change-password, forgot → reset (single use), login with new password");

  res = await logout.POST(req("/auth/logout", { method: "POST" }), noParams);
  assert.match(res.headers.get("set-cookie") ?? "", /access_token=;.*Max-Age=0/i);
  step("logout clears cookie without a session");

  console.log("guards + upload + media");
  const png = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: `#${(stamp % 0xffffff).toString(16).padStart(6, "0")}` } }).png().toBuffer();
  const form = () => {
    const data = new FormData();
    data.append("file", new File([new Uint8Array(png)], "smoke.png", { type: "image/png" }));
    data.append("folder", "products");
    return data;
  };
  res = await upload.POST(req("/upload", { method: "POST", token, body: form() }), noParams);
  assert.equal(res.status, 403);
  assert.equal((await json(res)).message, "Insufficient role permissions");
  step("customer upload → 403 (RolesGuard)");

  res = await login.POST(
    req("/auth/login", { method: "POST", body: { identifier: process.env.SEED_ADMIN_EMAIL || "admin@rooq.local", password: process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!" } }),
    noParams,
  );
  assert.equal(res.status, 201);
  const adminToken = (await json(res)).accessToken as string;
  res = await upload.POST(req("/upload", { method: "POST", token: adminToken, body: form() }), noParams);
  assert.equal(res.status, 201);
  const uploaded = await json(res);
  assert.match(uploaded.url as string, /^\/api\/v1\/media\/[0-9a-f-]{36}$/);
  assert.equal(uploaded.width, 1600);
  res = await upload.POST(req("/upload", { method: "POST", token: adminToken, body: form() }), noParams);
  assert.equal((await json(res)).id, uploaded.id);
  step("superadmin upload → 201 {url,id}, resized to 1600px, deduped by checksum");

  const mediaId = uploaded.id as string;
  res = await media.GET(req(`/media/${mediaId}`), { params: Promise.resolve({ id: mediaId }) });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "image/webp");
  assert.equal(res.headers.get("cache-control"), "public, max-age=31536000, immutable");
  const etag = res.headers.get("etag");
  assert.ok(etag);
  const bytes = Buffer.from(await res.arrayBuffer());
  assert.equal((await sharp(bytes).metadata()).format, "webp");
  res = await media.GET(req(`/media/${mediaId}`, { headers: { "if-none-match": etag! } }), { params: Promise.resolve({ id: mediaId }) });
  assert.equal(res.status, 304);
  res = await media.GET(req("/media/not-a-uuid"), { params: Promise.resolve({ id: "not-a-uuid" }) });
  assert.equal(res.status, 404);
  assert.equal((await json(res)).message, "Image not found");
  step("media → 200 webp + immutable cache + ETag, 304 on If-None-Match, 404 on bad id");

  console.log("prisma error mapping");
  const dup = route(() => prisma.category.create({ data: { name: "Men", slug: "men" } }));
  res = await dup(req("/category", { method: "POST" }), noParams);
  const conflict = await json(res);
  assert.equal(res.status, 409);
  console.log(`    "${conflict.message}"`);
  step("P2002 → 409 with field name");

  await prisma.user.delete({ where: { email } });
  await prisma.media.delete({ where: { id: mediaId } });
  console.log("cleanup done — all checks passed");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
