const CACHE_NAME = 'envanzo-pwa-v2';
const urlsToCache = [
    '/',
    '/favicon.ico',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/site.webmanifest'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            }).catch(err => console.error("SW Cache error", err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Network-first strategy for dynamic apps like Inertia/Laravel
self.addEventListener('fetch', event => {
    // Sadece HTTP(S) ve GET isteklerini yakala, diğerlerini (POST, PUT vs.) pas geç
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(async () => {
            // Eğer ağ bağlantısı yoksa veya sunucu düştüyse önbelleğe bak
            const response = await caches.match(event.request);
            if (response) {
                return response;
            }
            throw new TypeError('Network fetch failed and no cache available');
        })
    );
});
