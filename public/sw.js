/* Rooq service worker: makes the site installable and shows an offline page
 * when a page cannot be reached. It never caches API, admin or build files. */
const CACHE = "rooq-shell-v1";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];

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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.mode !== "navigate") return;
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
  event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL).then((hit) => hit || Response.error())));
});
