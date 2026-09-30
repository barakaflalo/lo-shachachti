// לא שכחתי — Service Worker (v13 rules: Cloudflare-safe)
// • ניווט: network-first עם זמן קצוב 4 שניות → מטמון → דף אופליין ידידותי. לעולם לא שגיאה.
// • כל תשובת ניווט "מנוקה" מסימון redirect (Cloudflare מחזיר 308 מ-index.html ל-/).
// • שמירה במטמון קובץ-קובץ (allSettled), לא addAll אטומי.
// • בקשות ממקור אחר (AI, CDN, OneSignal) — לא נוגעים בהן.
const VERSION = '3.2.0';
const CACHE = 'lo-shachachti-' + VERSION;
const SHELL = './';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];

// עותק נקי של תשובה שעברה הפניה — אחרת Chrome מסרב להציג אותה כדף ראשי
async function clean(res) {
  if (!res || !res.redirected) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled([SHELL, ...ASSETS].map(async u => {
      const r = await fetch(u, { cache: 'no-cache' });
      if (r && r.ok) await c.put(u, await clean(r));
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('lo-shachachti') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

function offlinePage() {
  const html = '<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>לא שכחתי</title><body style="margin:0;background:#12121f;color:#e8e8f0;font-family:system-ui,Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center">' +
    '<div style="padding:24px"><div style="font-size:48px">🔔</div><h2 style="color:#d4af37">אין חיבור לאינטרנט</h2>' +
    '<p>האפליקציה עוד לא נשמרה במכשיר. התחבר לרשת פעם אחת ונסה שוב.</p>' +
    '<button onclick="location.reload()" style="background:#d4af37;color:#12121f;border:0;border-radius:10px;padding:12px 24px;font-size:16px">נסה שוב</button></div></body></html>';
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function withTimeout(p, ms) {
  return new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); p.then(v => { clearTimeout(t); res(v); }, err => { clearTimeout(t); rej(err); }); });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // pass-through לכל מקור אחר
  if (url.pathname.includes('/onesignal/') || url.pathname.endsWith('OneSignalSDKWorker.js')) return;

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const res = await clean(await withTimeout(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }), 4000));
        if (res && res.ok) c.put(SHELL, res.clone());
        return res;
      } catch (err) {
        const cached = await c.match(SHELL);
        return cached ? clean(cached) : offlinePage();
      }
    })());
    return;
  }

  // אייקונים / manifest: מהמטמון, ובמקביל רענון ברקע
  if (ASSETS.some(a => url.pathname.endsWith(a.slice(1)))) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const cached = await c.match(req);
      const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
      return cached || (await net) || Response.error();
    })());
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const w of list) { if ('focus' in w) return w.focus(); }
    return clients.openWindow('./');
  }));
});
