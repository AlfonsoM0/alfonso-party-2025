
// Basic service worker for PWA functionality (caching, offline access placeholder)
const CACHE_NAME = 'cumple-alfonso-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets like icons if hosted locally.
  // Tailwind is from CDN, so it's cached by the browser based on CDN headers.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Basic cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  return self.clients.claim();
});

// Placeholder for Push Notifications
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data ? event.data.text() : ''}"`);

  const title = 'Notificación Cumple Alfonso';
  const options = {
    body: event.data ? event.data.text() : 'Tienes una nueva notificación.',
    icon: 'https_picsum_photos_192_192.webp', // Replace with actual icon path
    badge: 'https_picsum_photos_96_96.webp' // Replace with actual badge icon path
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
