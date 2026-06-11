// לא שכחתי v3 — Service Worker
// cache: רק אייקונים ו-manifest. לא JS/HTML כדי שעדכונים יגיעו מיד

const CACHE = 'lo-shachachti-v30';
const STATIC = [
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  './OneSignalSDKWorker.js',
];

// install — cache רק קבצים סטטיים
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

// activate — מחק כל cache ישן
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch — network first לכל קובץ JS/HTML, cache first רק לאייקונים
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isStatic = STATIC.some(f => url.pathname.endsWith(f.replace('./', '/')));

  if (isStatic) {
    // אייקונים: cache first
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  } else {
    // index.html + כל השאר: network first (תמיד עדכני)
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // cache אייקונים שמגיעים מ-network
          if (isStatic) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});

// notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
