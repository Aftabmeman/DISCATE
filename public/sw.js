/**
 * Discate AI - Service Worker
 * Required for PWA 'Install App' criteria on Chrome.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Standard fetch handler to satisfy Chrome PWA requirements.
  // Can be used for offline caching in the future.
  return;
});
