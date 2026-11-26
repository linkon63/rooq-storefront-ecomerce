/* Rooq service worker: makes the site installable and keeps visited storefront
 * pages readable offline. Always network first; the cache only answers when the
 * network cannot. Account, checkout, admin and API data are never cached
 * (product images from /api/v1/media are). */
const CACHE = "rooq-shell-v2";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];
const MAX_ENTRIES = 200;
const PRIVATE_PAGES = ["/admin", "/api", "/profile", "/checkout", "/confirmation", "/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function store(request, response) {
  const cache = await caches.open(CACHE);
  await cache.put(request, response);
  const keys = await cache.keys();
  const extra = keys.filter((key) => !PRECACHE.includes(new URL(key.url).pathname));
  await Promise.all(extra.slice(0, Math.max(0, extra.length - MAX_ENTRIES)).map((key) => cache.delete(key)));
}

async function networkFirst(event, fallbackUrl) {
  try {
    const response = await fetch(event.request);
    if (response.ok) event.waitUntil(store(event.request, response.clone()));
    return response;
  } catch {
    const hit = (await caches.match(event.request)) || (fallbackUrl && (await caches.match(fallbackUrl)));
    return hit || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const { pathname } = url;

  if (request.mode === "navigate") {
    if (PRIVATE_PAGES.some((prefix) => pathname.startsWith(prefix))) {
      if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
      event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL).then((hit) => hit || Response.error())));
      return;
    }
    event.respondWith(networkFirst(event, OFFLINE_URL));
    return;
  }

  const isAsset = ["/_next/static/", "/_next/image", "/api/v1/media/", "/icons/", "/images/"].some((prefix) => pathname.startsWith(prefix));
  if (isAsset) event.respondWith(networkFirst(event));
});
