const CACHE_NAME = 'jamat-tracking-v4.2.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// সার্ভিস ওয়ার্কার ইনস্টল এবং ফাইল ক্যাশ করা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// পুরাতন ক্যাশ মুছে ফেলা (যদি ভার্সন আপডেট হয়)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// অফলাইনে ফাইলগুলো ক্যাশ থেকে লোড করা (Network-First approach fallback to Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // যদি নেটওয়ার্ক ঠিক থাকে, নতুন কপি ক্যাশে সেভ করি
        if (event.request.method === 'GET' && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // নেটওয়ার্ক না থাকলে ক্যাশ থেকে ফাইল রিটার্ন করবে
        return caches.match(event.request);
      })
  );
});
