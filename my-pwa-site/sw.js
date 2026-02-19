const CACHE_NAME = 'obshchina-v14';

// Твой точный список файлов
const ASSETS_TO_CACHE = [
  './index.html',
  './page1.html',
  './page2.html',
  './page3.html',
  './page4.html',
  './page5.html',
  './page6.html',
  './page8.html',
  './page9.html',
  './page10.html',
  './page11.html',
  './page12.html',
  './page13.html',
  './style.css',
  './logo.png',
  './manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Кэширование файлов по списку пользователя...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация и удаление старого кэша
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

// Обработка запросов (Stale-While-Revalidate)
// Сайт отдает данные из кэша мгновенно, а обновляет их в фоне
self.addEventListener('fetch', (event) => {
  // Пропускаем внешние сервисы (метрику и т.д.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Если интернета нет, просто используем то, что в кэше
        });

        return cachedResponse || fetchedResponse;
      });
    })
  );
});