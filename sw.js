const CACHE_NAME = 'obshchina-v17';
const GH_PATH = '/app';

// Список файлов для офлайн-доступа
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

// Установка: кэшируем только наши локальные файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация: чистим память от старых версий
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

// Обработка запросов
self.addEventListener('fetch', (event) => {
  // ПРОВЕРКА ДЛЯ МЕТРИКИ И ВНЕШНИХ ССЫЛОК
  // Если запрос идет НЕ на asdmsk.github.io, мы его НЕ трогаем
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Запрос в сеть для обновления кэша в фоне
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // При ошибке сети просто ничего не делаем
        });

        // Отдаем файл из кэша (мгновенно) или из сети (если файла нет в кэше)
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
