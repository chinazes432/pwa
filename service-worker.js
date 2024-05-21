const CACHE_NAME = 'pwa-example-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[ServiceWorker] Failed to cache', error);
            })
    );
});

self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] Fetch', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('[ServiceWorker] Found in cache', event.request.url);
                    return response;
                }
                console.log('[ServiceWorker] Network request for', event.request.url);
                return fetch(event.request).then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request.url, response.clone());
                        return response;
                    });
                });
            })
            .catch(error => {
                console.error('[ServiceWorker] Error fetching', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('[ServiceWorker] Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
