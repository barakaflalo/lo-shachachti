// v25 — כולל i18n.js, network-first לקבצי JS
const CACHE = 'lo-shachachti-v25';
const FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './i18n.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // נסה להוסיף כל קובץ בנפרד — אם אחד נכשל, המשך
      return Promise.allSettled(FILES.map(f => c.add(f)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // קבצי JS — network-first (תמיד קח מהרשת קודם)
  if (url.pathname.endsWith('.js')) {
    e.respondWith(
      fetch(e.request).then(response => {
        // שמור בcache החדש
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  
  // שאר הקבצים — cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
