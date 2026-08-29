// לא שכחתי v3 — Service Worker
// אסטרטגיה: network-first עבור index.html (תמיד מנסה להביא עדכני),
// אבל שומר עותק ב-cache כדי שיעבוד אופליין. אייקונים: cache-first.

const CACHE = 'lo-shachachti-v38';
const STATIC = [
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  './OneSignalSDKWorker.js',
];
// קבצים שחובה שיהיו זמינים אופליין (מנסים לשמור בהתקנה)
const APP_SHELL = [
  './',
  './index.html',
];

// install — cache קבצים סטטיים + מעטפת האפליקציה
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled([...STATIC, ...APP_SHELL].map(u => c.add(u)))
    )
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

function isIconOrManifest(url){
  return STATIC.some(f => url.pathname.endsWith(f.replace('./', '/')));
}
function isAppShell(req){
  return req.mode === 'navigate' ||
    req.url.endsWith('/') || req.url.endsWith('/index.html');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (isIconOrManifest(url)) {
    // אייקונים/manifest: cache-first
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return res;
      }))
    );
    return;
  }

  if (isAppShell(req)) {
    // index.html: network-first, נשמר ל-cache ונופל אליו אופליין
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', clone));
          return res;
        })
        .catch(() =>
          caches.match('./index.html').then(c => c || caches.match('./'))
        )
    );
    return;
  }

  // כל השאר: network-first עם נפילה ל-cache
  e.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
