/*
 * LGU Connect service worker.
 *
 * Privacy (RA 10173): pages and API responses are NEVER stored, because they can hold resident data.
 * Only these are cached:
 *   - the offline page and the app icons
 *   - /_next/static/* build files (scripts, styles, fonts): content-hashed and the same for every user
 * Every page still needs the internet; without it the offline page is shown instead of the browser error.
 *
 * Push: shows report deadline reminders sent by the server (server/push.ts) and opens the right page on tap.
 *
 * Bump VERSION when this file or offline.html changes.
 */
const VERSION = "v2";
const SHELL = `lgu-shell-${VERSION}`;
const STATIC = "lgu-static";
const STATIC_MAX = 300;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/brand/lgu-icon.svg", "/brand/lgu-icon-dark.svg", "/pwa/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, STATIC]);
      for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key);
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Full page loads: always from the network. Only when that fails, show the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloaded = await event.preloadResponse;
          return preloaded || (await fetch(request));
        } catch {
          return (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Hashed build files never change, so a saved copy is always correct and opens faster.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC);
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok && res.type === "basic") {
          event.waitUntil(cache.put(request, res.clone()).then(() => trim(cache)));
        }
        return res;
      })(),
    );
  }
  // Everything else (pages' data, API calls, images) goes straight to the network.
});

/** Keeps the build-file cache from growing across deployments: oldest entries go first. */
async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - STATIC_MAX; i++) await cache.delete(keys[i]);
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "LGU Connect";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/pwa/icon-192.png",
      badge: "/pwa/badge-96.png",
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url: data.url || "/app" },
      lang: "en-PH",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/app", self.location.origin);
  if (target.origin !== self.location.origin) return;
  event.waitUntil(
    (async () => {
      const open = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Reuse an open LGU Connect window if there is one.
      for (const client of open) {
        if (new URL(client.url).origin === target.origin && "focus" in client) {
          await client.focus();
          if ("navigate" in client) await client.navigate(target.href).catch(() => {});
          return;
        }
      }
      await self.clients.openWindow(target.href);
    })(),
  );
});
