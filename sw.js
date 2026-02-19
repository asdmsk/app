const CACHE_NAME = 'obshchina-v15'; // Поднял версию, чтобы кэш обновился
const GH_PATH = '/app';

// Твой точный список файлов с учетом пути GitHub
const ASSETS_TO_CACHE = [
  `${GH_PATH}/`,
  `${GH_PATH}/index.html`,
  `${GH_PATH}/page1.html`,
  `${GH_PATH}/page2.html`,
  `${GH_PATH}/page3.html`,
  `${GH_PATH}/page4.html`,
  `${GH_PATH}/page5.html`,
  `${GH_PATH}/page6.html`,
  `${GH_PATH}/page8.html`,
  `${GH_PATH}/page9.html`,
  `${GH_PATH}/page10.html`,
  `${GH_PATH}/page11.html`,
  `${GH_PATH}/page12.html`,
  `${GH_PATH}/page13.html`,
  `${GH_PATH}/style.css`,
  `${GH_PATH}/logo.png`,
  `${GH_PATH}/manifest.json`
];

// Установка: кэшируем всё по списку
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Кэширование ресурсов для /app/...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация: удаляем старые кэши (v14 и ниже)
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
self.addEventListener('fetch', (event) => {
  // Обрабатываем только запросы к нашему сайту
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Запрос в сеть для обновления кэша
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Если сети нет, ничего не делаем, используем кэш
        });

        // Отдаем из кэша сразу, или ждем сеть, если в кэше пусто
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
