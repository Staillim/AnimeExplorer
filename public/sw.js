const CACHE_NAME = 'anime-explorer-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
];

const isImageUrl = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
};

const isApiUrl = (url: string) => {
  return url.includes('firebase') || url.includes('api');
};

// Install event
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Silently fail if assets don't exist
      });
    })
  );
  (self as any).skipWaiting();
});

// Activate event
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  (self as any).clients.claim();
});

// Fetch event - Network first for API, Cache first for images
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== (self as any).location.origin) {
    return;
  }

  // Image caching strategy: Cache first, then network
  if (isImageUrl(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          })
        );
      })
    );
  }
  // API requests: Network first, then cache
  else if (isApiUrl(url.href)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          return caches.match(request) || new Response('Offline', { status: 503 });
        })
    );
  }
});
