/**
 * Service Worker for UK Streaming Notifier
 * 
 * This service worker provides offline functionality and handles push notifications.
 * It implements a cache-first strategy for essential assets and handles push events
 * to display notifications to the user.
 * 
 * @version 2.0
 * @see https://developers.google.com/web/fundamentals/primers/service-workers
 */

// Cache name includes version to facilitate cache updates
const CACHE_NAME = 'streaming-notifier-v2';

// List of URLs to cache for offline access
const urlsToCache = [
  '/', // Root path
  '/index.html', // Main HTML file
  '/static/js/main.chunk.js', // Main JavaScript bundle
  '/static/js/bundle.js', // Additional JavaScript bundle
  '/static/css/main.chunk.css', // CSS styles
  '/api/manifest', // Web app manifest (served via API)
  '/icons/icon-192x192.png' // Main app icon
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
