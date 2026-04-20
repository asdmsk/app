const CACHE_NAME = 'akd-final-v32';
const GH_PATH = ''; // Это критично: теперь путь пустой, так как мы в корне домена

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/logo.png',
  '/manifest.json',
  '/page1.html',
  '/page2.html',
  '/page3.html',
  '/page4.html',
  '/page5.html',
  '/page6.html',
  '/page8.html',
  '/page9.html',
  '/page10.html',
  '/page11.html',
  '/page12.html',
  '/page13.html',
  '/page14.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Не кэшируем запросы к Яндекс.Метрике и другим внешним ресурсам
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {});
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
