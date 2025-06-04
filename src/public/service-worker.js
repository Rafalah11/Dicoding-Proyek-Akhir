const CACHE_NAME = "StoryApp-v4"; // Ubah untuk cache baru
const urlsToCache = [
  "/",
  "/index.html",
  "/js/app.bundle.js", // Perbaiki path
  "/app.css",
  "/icons/192x192.png",
  "/icons/512x512.jpg",
  "/icons/32x32.jpg",
  "/icons/layers-2x.png",
  "/icons/layers.png",
  "/icons/marker-icon-2x.png",
  "/icons/marker-icon.png",
  "/icons/marker-shadow.png",
  "/images/logo.png",
  "/feather-icons.js",
  "/leaflet.css",
  "/leaflet.js",
  "/manifest.json",
  "/favicon.png",
];

// Daftar tile untuk dicache (contoh: Indonesia, zoom 5-10)
const tileUrls = [];
const minZoom = 5;
const maxZoom = 10;
const bounds = {
  southWest: [-11.0, 95.0], // Batas Indonesia
  northEast: [6.0, 141.0],
};

for (let z = minZoom; z <= maxZoom; z++) {
  const southWestTile = latLngToTile(
    bounds.southWest[0],
    bounds.southWest[1],
    z
  );
  const northEastTile = latLngToTile(
    bounds.northEast[0],
    bounds.northEast[1],
    z
  );
  for (let x = southWestTile.x; x <= northEastTile.x; x++) {
    for (let y = southWestTile.y; y <= northEastTile.y; y++) {
      tileUrls.push(`https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`);
      tileUrls.push(`https://b.tile.openstreetmap.org/${z}/${x}/${y}.png`);
      tileUrls.push(`https://c.tile.openstreetmap.org/${z}/${x}/${y}.png`);
    }
  }
}

// Fungsi untuk mengkonversi lat/lng ke tile
function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

self.addEventListener("install", (e) => {
  console.log("Service Worker: Installing...");
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching App Shell and Tiles");
        return Promise.all(
          [...urlsToCache, ...tileUrls].map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`Failed to cache ${url}: ${err}`);
              return null;
            })
          )
        ).then(() => {
          console.log("App shell and tiles caching completed");
        });
      })
      .catch((err) => {
        console.error("Service Worker: Install failed", err);
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("Service Worker: Activating...");
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("Service Worker: Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .catch((err) => {
        console.error("Service Worker: Activate failed", err);
      })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const requestUrl = new URL(e.request.url);

  if (requestUrl.protocol === "chrome-extension:") {
    e.respondWith(fetch(e.request));
    return;
  }

  if (
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.pathname.includes("/stories")
  ) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response.ok) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, response.clone());
              return response;
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(e.request).then((response) => {
            return (
              response ||
              new Response(
                JSON.stringify({
                  error: true,
                  message: "Offline: Tidak ada data tersedia",
                }),
                {
                  status: 503,
                  statusText: "Service Unavailable",
                  headers: { "Content-Type": "application/json" },
                }
              )
            );
          });
        })
    );
  } else if (requestUrl.hostname.includes("tile.openstreetmap.org")) {
    e.respondWith(
      caches.match(e.request).then((response) => {
        if (response) return response;
        return fetch(e.request).catch(() => {
          return new Response(
            '<p style="text-align: center; padding: 20px;">Peta tidak tersedia offline</p>',
            {
              status: 200,
              statusText: "OK",
              headers: { "Content-Type": "text/html" },
            }
          );
        });
      })
    );
  } else if (requestUrl.href.includes("unpkg.com/feather-icons")) {
    e.respondWith(
      caches.match("/feather-icons.js").then((response) => {
        return (
          response ||
          new Response("Feather Icons tidak tersedia offline", {
            status: 200,
            statusText: "OK",
            headers: { "Content-Type": "text/javascript" },
          })
        );
      })
    );
  } else if (requestUrl.href.includes("unpkg.com/leaflet")) {
    const isCss = requestUrl.pathname.includes(".css");
    const localPath = isCss ? "/leaflet.css" : "/leaflet.js";
    e.respondWith(
      caches.match(localPath).then((response) => {
        return (
          response ||
          new Response(
            `Leaflet ${isCss ? "CSS" : "JS"} tidak tersedia offline`,
            {
              status: 200,
              statusText: "OK",
              headers: {
                "Content-Type": isCss ? "text/css" : "text/javascript",
              },
            }
          )
        );
      })
    );
  } else if (
    requestUrl.href.includes("cdnjs.cloudflare.com/ajax/libs/font-awesome")
  ) {
    e.respondWith(
      fetch(e.request).catch(() => {
        return new Response("Font Awesome tidak tersedia offline", {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "text/css" },
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((response) => {
        if (response) {
          console.log("Service Worker: Serving from cache", requestUrl.href);
          return response;
        }
        return fetch(e.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, clone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            if (e.request.mode === "navigate") {
              console.log("Service Worker: Fallback to index.html");
              return caches.match("/index.html");
            }
            return new Response(
              '<p style="text-align: center; padding: 20px;">Konten tidak tersedia offline</p>',
              {
                status: 200,
                statusText: "OK",
                headers: { "Content-Type": "text/html" },
              }
            );
          });
      })
    );
  }
});

self.addEventListener("push", (e) => {
  console.log("Service Worker: Push received");
  let data = {};
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      console.error("Error parsing push data:", err);
      data = {
        title: "Story berhasil dibuat",
        body: "Anda telah membuat cerita baru!",
      };
    }
  }
  const title = data.title || "Story berhasil dibuat";
  const options = {
    body: data.options?.body || data.body || "Anda telah membuat cerita baru!",
    icon: "/icons/192x192.png",
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("sync", (e) => {
  if (e.tag === "sync-stories") {
    console.log("Service Worker: Syncing stories...");
    e.waitUntil(syncPendingStories());
  }
});

async function syncPendingStories() {
  console.log("Service Worker: Sync pending stories (handled by StoryModel)");
}
